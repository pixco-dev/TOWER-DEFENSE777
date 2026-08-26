from __future__ import annotations

from collections import deque
from pathlib import Path
import json
import re

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "assets" / "candidates" / "unified-v1"
GAME = ROOT / "game.js"
SW = ROOT / "sw.js"
REPORT = ROOT / "tools" / "candidate-alpha-report.json"


def is_magenta(r: int, g: int, b: int) -> bool:
    return r >= 165 and b >= 165 and g <= 115 and r - g >= 55 and b - g >= 55


def is_light_neutral(r: int, g: int, b: int) -> bool:
    lo = min(r, g, b)
    hi = max(r, g, b)
    return lo >= 205 and hi - lo <= 28


def repair_image(path: Path) -> dict[str, int | str | bool]:
    image = Image.open(path).convert("RGBA")
    w, h = image.size
    px = image.load()

    border = []
    for x in range(w):
        border.append(px[x, 0])
        if h > 1:
            border.append(px[x, h - 1])
    for y in range(1, max(1, h - 1)):
        border.append(px[0, y])
        if w > 1:
            border.append(px[w - 1, y])

    opaque_border = [(r, g, b, a) for r, g, b, a in border if a >= 16]
    denom = max(1, len(opaque_border))
    magenta_ratio = sum(is_magenta(r, g, b) for r, g, b, _ in opaque_border) / denom
    light_ratio = sum(is_light_neutral(r, g, b) for r, g, b, _ in opaque_border) / denom
    remove_magenta = magenta_ratio >= 0.06
    remove_light = light_ratio >= 0.10

    def is_backdrop_color(r: int, g: int, b: int) -> bool:
        return (remove_magenta and is_magenta(r, g, b)) or (remove_light and is_light_neutral(r, g, b))

    # Remove ONLY light/magenta background connected to the outer image border.
    # Dark/black pixels are deliberately never a background key.
    visited = bytearray(w * h)
    queue: deque[int] = deque()

    def enqueue(index: int) -> None:
        if index < 0 or index >= w * h or visited[index]:
            return
        x = index % w
        y = index // w
        r, g, b, a = px[x, y]
        if a < 16 or is_backdrop_color(r, g, b):
            visited[index] = 1
            queue.append(index)

    for x in range(w):
        enqueue(x)
        enqueue((h - 1) * w + x)
    for y in range(h):
        enqueue(y * w)
        enqueue(y * w + w - 1)

    removed = 0
    while queue:
        index = queue.popleft()
        x = index % w
        y = index // w
        r, g, b, a = px[x, y]
        if a >= 16 and is_backdrop_color(r, g, b):
            px[x, y] = (r, g, b, 0)
            removed += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                enqueue(ny * w + nx)

    # Restore pixels that an older chroma-key pass made transparent while leaving
    # their original RGB data in the PNG. This recovers dark fur, black outlines,
    # clothing and feet without inventing colors. White/magenta backdrop is barred.
    solid = bytearray(w * h)
    restore_queue: deque[int] = deque()
    for y in range(h):
        for x in range(w):
            index = y * w + x
            if px[x, y][3] >= 16:
                solid[index] = 1
                restore_queue.append(index)

    restored = 0
    while restore_queue:
        index = restore_queue.popleft()
        x = index % w
        y = index // w
        for nx, ny in (
            (x - 1, y - 1), (x, y - 1), (x + 1, y - 1),
            (x - 1, y),                     (x + 1, y),
            (x - 1, y + 1), (x, y + 1), (x + 1, y + 1),
        ):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            ni = ny * w + nx
            if solid[ni]:
                continue
            r, g, b, a = px[nx, ny]
            if a >= 16:
                solid[ni] = 1
                restore_queue.append(ni)
                continue
            # Fully zero RGB is indistinguishable from ordinary transparent canvas,
            # so never guess it. Non-zero hidden RGB can be restored exactly.
            if (r or g or b) and not is_backdrop_color(r, g, b):
                px[nx, ny] = (r, g, b, 255)
                solid[ni] = 1
                restore_queue.append(ni)
                restored += 1

    changed = bool(removed or restored)
    if changed:
        image.save(path, optimize=True)

    return {
        "file": path.name,
        "width": w,
        "height": h,
        "removed_background_pixels": removed,
        "restored_hidden_rgb_pixels": restored,
        "border_magenta_ratio": round(magenta_ratio, 4),
        "border_light_ratio": round(light_ratio, 4),
        "removed_magenta": remove_magenta,
        "removed_light": remove_light,
        "changed": changed,
    }


def patch_runtime() -> bool:
    text = GAME.read_text(encoding="utf-8")
    original = text

    # Candidate PNGs are repaired once in the repository. Do not chroma-key them
    # again at runtime, because a runtime near-black key can erase real outlines.
    text = text.replace(
        '      const sheet = stripSpriteBackdrop(image);\n',
        '      const sheet = image;\n',
        1,
    )

    # If an older runtime predicate is still present, explicitly remove the
    # near-black branch as a second safety net.
    text = text.replace(
        '        const keyedNeutral = neutral && (min >= 164 || max <= 30);\n        return magenta || keyedNeutral;\n',
        '        const keyedNeutral = neutral && min >= 205;\n        return magenta || keyedNeutral;\n',
    )

    if text != original:
        GAME.write_text(text, encoding="utf-8")
        return True
    return False


def bump_cache_if_needed(changed: bool) -> int | None:
    if not changed:
        return None
    text = SW.read_text(encoding="utf-8")
    match = re.search(r'fur-frontline-offline-v(\d+)', text)
    if not match:
        raise SystemExit("service worker cache version not found")
    version = int(match.group(1)) + 1
    text = text[:match.start()] + f"fur-frontline-offline-v{version}" + text[match.end():]
    SW.write_text(text, encoding="utf-8")
    return version


def main() -> None:
    if not SPRITE_DIR.exists():
        raise SystemExit(f"missing sprite directory: {SPRITE_DIR}")

    results = [repair_image(path) for path in sorted(SPRITE_DIR.glob("*.png"))]
    runtime_changed = patch_runtime()
    asset_changed = any(bool(item["changed"]) for item in results)
    cache_version = bump_cache_if_needed(runtime_changed or asset_changed)

    summary = {
        "files_scanned": len(results),
        "files_changed": sum(bool(item["changed"]) for item in results),
        "background_pixels_removed": sum(int(item["removed_background_pixels"]) for item in results),
        "hidden_rgb_pixels_restored": sum(int(item["restored_hidden_rgb_pixels"]) for item in results),
        "runtime_chroma_key_disabled": runtime_changed,
        "service_worker_cache_version": cache_version,
        "files": results,
    }
    REPORT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "files"}, ensure_ascii=False))


if __name__ == "__main__":
    main()

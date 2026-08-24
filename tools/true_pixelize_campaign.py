from __future__ import annotations

import argparse
import shutil
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
BACKUP = ROOT / "tools" / "_preview" / "campaign-before-true-pixel"
PREVIEW = ROOT / "tools" / "_preview" / "true-pixel" / "campaign-before-after.png"

LOGICAL_CANVAS = 64
# Keep the current drawing, pose and silhouette.  Only reduce it to the same
# coarse pixel grid used by the original campaign sprites.
MAX_LOGICAL_BODY = 60
PALETTE_COLORS = 32


@dataclass(frozen=True)
class Target:
    filename: str
    crops: tuple[tuple[int, int, int, int], ...]


TARGETS = (
    Target("pixel-allies-keyed.png", (
        (12, 345, 303, 675), (308, 323, 600, 675), (612, 348, 923, 675),
        (927, 315, 1218, 675), (1226, 308, 1527, 678),
    )),
    Target("pixel-allies-unlockables-v4.png", (
        (5, 155, 306, 470), (312, 175, 610, 470), (614, 175, 912, 470),
        (913, 135, 1236, 470), (1237, 200, 1536, 470), (0, 570, 307, 860),
        (312, 573, 608, 860), (629, 570, 907, 860), (928, 585, 1221, 860),
        (1222, 594, 1536, 860),
    )),
    Target("pixel-ally-rockshield-v1.png", ((205, 242, 1049, 981),)),
    Target("pixel-ally-lightning-otter-v1.png", ((18, 107, 366, 380),)),
    Target("pixel-ally-gale-hawk-v3.png", ((138, 158, 920, 789),)),
    Target("pixel-ally-herb-hedgehog-v1.png", ((18, 106, 366, 380),)),
    Target("pixel-ally-squirrel-scout-v1.png", ((135, 230, 933, 807),)),
    Target("pixel-ally-bomber-v1.png", ((177, 163, 847, 848),)),
    Target("pixel-ally-sniper-v1.png", ((198, 223, 812, 815),)),
    Target("pixel-ally-drummer-v1.png", ((174, 120, 828, 826),)),
    Target("pixel-ally-scout-v1.png", ((263, 300, 736, 739),)),
    Target("pixel-enemies-keyed.png", (
        (42, 528, 312, 803), (315, 458, 672, 803),
        (668, 308, 1058, 807), (1065, 273, 1493, 810),
    )),
    Target("pixel-enemy-bloodwing-bat-v3.png", ((18, 168, 366, 380),)),
    Target("pixel-enemy-bone-raven-v3.png", ((18, 109, 366, 380),)),
    Target("pixel-enemy-siege-rhino-v3.png", ((18, 182, 366, 380),)),
    Target("pixel-enemy-mooncap-witch-v3.png", ((18, 58, 366, 380),)),
    Target("pixel-enemy-moon-wolf-v1.png", ((200, 210, 835, 810),)),
    Target("pixel-enemy-mist-fox-v1.png", ((117, 181, 942, 825),)),
    Target("pixel-enemy-shell-toad-v1.png", ((83, 154, 946, 853),)),
    Target("pixel-enemy-spitter-mole-v1.png", ((28, 246, 943, 812),)),
    Target("pixel-enemy-thorn-shaman-v1.png", ((64, 151, 1000, 868),)),
    Target("pixel-enemy-iron-giant-v1.png", ((249, 69, 806, 910),)),
    Target("pixel-enemy-thorn-king-v1.png", ((140, 132, 954, 843),)),
    Target("pixel-enemy-nightlord-v1.png", ((172, 128, 965, 873),)),
)


def binary_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    rgba.putalpha(rgba.getchannel("A").point(lambda value: 255 if value >= 96 else 0))
    return rgba


def quantized_sprite(region: Image.Image) -> Image.Image:
    region = binary_alpha(region)
    bounds = region.getchannel("A").getbbox()
    if not bounds:
        return region
    sprite = region.crop(bounds)
    width, height = sprite.size
    scale = min(MAX_LOGICAL_BODY / width, MAX_LOGICAL_BODY / height)
    logical_size = (max(1, round(width * scale)), max(1, round(height * scale)))

    # Resize premultiplied RGBA so the old chroma-key RGB hidden under fully
    # transparent pixels cannot bleed back as a pink/purple fringe.
    small = sprite.convert("RGBa").resize(logical_size, Image.Resampling.BOX).convert("RGBA")
    alpha = small.getchannel("A")
    alpha = alpha.point(lambda value: 255 if value >= 64 else 0)
    rgb = small.convert("RGB")
    rgb = rgb.quantize(colors=PALETTE_COLORS, method=Image.Quantize.MEDIANCUT).convert("RGBA")
    rgb.putalpha(alpha)

    # Do not invent an outline or repaint missing parts.  The source already
    # contains its own linework; adding a generated outline changes the design.
    final = rgb.resize((width, height), Image.Resampling.NEAREST)
    out = Image.new("RGBA", region.size, (0, 0, 0, 0))
    out.alpha_composite(final, (bounds[0], bounds[1]))
    return out


def transform(path: Path, crops: tuple[tuple[int, int, int, int], ...]) -> tuple[Image.Image, Image.Image]:
    # Always rebuild from the untouched backup.  Re-running the tool must not
    # shrink/pixelise an already converted sprite a second time.
    backup = BACKUP / path.name
    source = backup if backup.exists() else path
    original = Image.open(source).convert("RGBA")
    result = original.copy()
    for crop in crops:
        left, top, right, bottom = crop
        region = original.crop(crop)
        pixel = quantized_sprite(region)
        result.paste((0, 0, 0, 0), crop)
        result.alpha_composite(pixel, (left, top))
    result = binary_alpha(result)
    return original, result


def checker(size: tuple[int, int], cell: int = 12) -> Image.Image:
    image = Image.new("RGB", size, (41, 46, 60))
    draw = ImageDraw.Draw(image)
    colors = ((49, 58, 76), (29, 34, 47))
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=colors[((x // cell) + (y // cell)) & 1])
    return image


def preview_tile(source: Image.Image, crop: tuple[int, int, int, int], size=(176, 176)) -> Image.Image:
    item = source.crop(crop)
    bounds = item.getchannel("A").getbbox()
    if bounds:
        item = item.crop(bounds)
    scale = min((size[0] - 14) / item.width, (size[1] - 14) / item.height)
    fitted = item.resize((max(1, round(item.width * scale)), max(1, round(item.height * scale))), Image.Resampling.NEAREST)
    tile = checker(size)
    tile.paste(fitted.convert("RGB"), ((size[0] - fitted.width) // 2, size[1] - fitted.height - 7), fitted.getchannel("A"))
    return tile


def build_preview(entries: list[tuple[str, Image.Image, Image.Image, tuple[int, int, int, int]]]) -> None:
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    for page_index in range(0, len(entries), 12):
        shown = entries[page_index:page_index + 12]
        build_preview_page(shown, page_index // 12 + 1)


def build_preview_page(shown: list[tuple[str, Image.Image, Image.Image, tuple[int, int, int, int]]], page: int) -> None:
    width, tile_height = 720, 210
    sheet = Image.new("RGB", (width, len(shown) * tile_height), (17, 20, 29))
    draw = ImageDraw.Draw(sheet)
    for row, (label, before, after, crop) in enumerate(shown):
        y = row * tile_height
        sheet.paste(preview_tile(before, crop), (8, y + 26))
        sheet.paste(preview_tile(after, crop), (192, y + 26))
        draw.text((8, y + 6), f"BEFORE  {label}", fill=(215, 219, 229))
        draw.text((192, y + 6), f"AFTER  {label} / native 64px", fill=(255, 224, 113))
    output = PREVIEW if page == 1 else PREVIEW.with_name(f"campaign-before-after-{page}.png")
    sheet.save(output, quality=95)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    entries = []
    for target in TARGETS:
        path = ASSETS / target.filename
        if not path.exists():
            print(f"missing: {target.filename}")
            continue
        before, after = transform(path, target.crops)
        for index, crop in enumerate(target.crops):
            entries.append((f"{target.filename}:{index}", before, after, crop))
        if args.apply:
            backup = BACKUP / target.filename
            backup.parent.mkdir(parents=True, exist_ok=True)
            if not backup.exists():
                shutil.copy2(path, backup)
            after.save(path, optimize=True)
        print(f"{'applied' if args.apply else 'preview'}: {target.filename} regions={len(target.crops)}")
    build_preview(entries)
    print(f"preview: {PREVIEW}")


if __name__ == "__main__":
    main()


"""Restore campaign sprite pixels that were wrongly removed with the backdrop.

The keyed PNGs still retain their original RGB values under fully transparent
pixels.  Starting from the surviving opaque silhouette, this script reconnects
only adjacent non-magenta source pixels.  It therefore restores black fur,
cloaks, outlines and feet without guessing new artwork or growing into the
magenta backdrop.

Run without arguments for a preview; pass --apply to replace the target PNGs.
"""
from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PREVIEW = ROOT / "tools" / "_preview" / "campaign-edge-restore"
BACKUP = ROOT / "tools" / "_preview" / "campaign-before-edge-restore"

TARGETS = [
    "pixel-allies-keyed.png",
    "pixel-ally-rockshield-v1.png",
    "pixel-enemies-keyed.png",
    "pixel-ally-lightning-otter-v1.png",
    "pixel-ally-gale-hawk-v3.png",
    "pixel-ally-herb-hedgehog-v1.png",
    "pixel-ally-squirrel-scout-v1.png",
    "pixel-ally-bomber-v1.png",
    "pixel-ally-sniper-v1.png",
    "pixel-ally-drummer-v1.png",
    "pixel-ally-scout-v1.png",
    "pixel-enemy-mist-fox-v1.png",
    "pixel-enemy-shell-toad-v1.png",
    "pixel-enemy-spitter-mole-v1.png",
    "pixel-enemy-thorn-shaman-v1.png",
    "pixel-enemy-iron-giant-v1.png",
    "pixel-enemy-thorn-king-v1.png",
    "pixel-enemy-nightlord-v1.png",
]

CROPS = [
    ("moco", "pixel-allies-keyed.png", (12,345,303,675)),
    ("shield", "pixel-allies-keyed.png", (308,323,600,675)),
    ("archer", "pixel-allies-keyed.png", (612,348,923,675)),
    ("ram", "pixel-allies-keyed.png", (927,315,1218,675)),
    ("mage", "pixel-allies-keyed.png", (1226,308,1527,678)),
    ("rockshield", "pixel-ally-rockshield-v1.png", (205,242,1049,981)),
    ("sprout", "pixel-enemies-keyed.png", (42,528,312,803)),
    ("fang_atlas", "pixel-enemies-keyed.png", (315,458,672,803)),
    ("spitter_atlas", "pixel-enemies-keyed.png", (668,308,1058,807)),
    ("boss_atlas", "pixel-enemies-keyed.png", (1065,273,1493,810)),
    ("lightning_otter", "pixel-ally-lightning-otter-v1.png", (18,107,366,380)),
    ("gale_hawk", "pixel-ally-gale-hawk-v3.png", (138,158,920,789)),
    ("herb_hedgehog", "pixel-ally-herb-hedgehog-v1.png", (18,106,366,380)),
    ("squirrel_scout", "pixel-ally-squirrel-scout-v1.png", (135,230,933,807)),
    ("bomber", "pixel-ally-bomber-v1.png", (177,163,847,848)),
    ("sniper", "pixel-ally-sniper-v1.png", (198,223,812,815)),
    ("drummer", "pixel-ally-drummer-v1.png", (174,120,828,826)),
    ("scout", "pixel-ally-scout-v1.png", (263,300,736,739)),
    ("mist_fox", "pixel-enemy-mist-fox-v1.png", (117,181,942,825)),
    ("shell_toad", "pixel-enemy-shell-toad-v1.png", (83,154,946,853)),
    ("spitter_mole", "pixel-enemy-spitter-mole-v1.png", (28,246,943,812)),
    ("thorn_shaman", "pixel-enemy-thorn-shaman-v1.png", (64,151,1000,868)),
    ("iron_giant", "pixel-enemy-iron-giant-v1.png", (249,69,806,910)),
    ("thorn_king", "pixel-enemy-thorn-king-v1.png", (140,132,954,843)),
    ("nightlord", "pixel-enemy-nightlord-v1.png", (172,128,965,873)),
]


def is_backdrop(r: int, g: int, b: int) -> bool:
    return r >= 145 and b >= 145 and g <= 125 and r - g >= 38 and b - g >= 38


def restore(image: Image.Image) -> tuple[Image.Image, int, int]:
    out = image.convert("RGBA")
    w, h = out.size
    px = out.load()
    queued = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()
    solidified = 0

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0:
                if a < 255:
                    px[x, y] = (r, g, b, 255)
                    solidified += 1
                queued[y*w+x] = 1
                queue.append((x, y))

    restored = 0
    while queue:
        x, y = queue.popleft()
        for nx, ny in (
            (x-1,y-1),(x,y-1),(x+1,y-1),
            (x-1,y),            (x+1,y),
            (x-1,y+1),(x,y+1),(x+1,y+1),
        ):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            index = ny*w+nx
            if queued[index]:
                continue
            r, g, b, a = px[nx, ny]
            if a == 0 and (r or g or b) and not is_backdrop(r, g, b):
                px[nx, ny] = (r, g, b, 255)
                queued[index] = 1
                queue.append((nx, ny))
                restored += 1

    return out, restored, solidified


def checker(draw: ImageDraw.ImageDraw, x0: int, y0: int, width: int, height: int) -> None:
    size = 12
    for y in range(y0, y0+height, size):
        for x in range(x0, x0+width, size):
            c = "#39cfe4" if ((x-x0)//size + (y-y0)//size) % 2 == 0 else "#ed3da9"
            draw.rectangle((x,y,min(x+size-1,x0+width-1),min(y+size-1,y0+height-1)), fill=c)


def crop_fit(image: Image.Image, box: tuple[int,int,int,int], max_w=166, max_h=136) -> Image.Image:
    art = image.crop(box)
    bbox = art.getbbox()
    if bbox:
        art = art.crop(bbox)
    scale = min(max_w/max(1,art.width), max_h/max(1,art.height))
    return art.resize((max(1,round(art.width*scale)),max(1,round(art.height*scale))), Image.Resampling.NEAREST)


def make_contact(before: dict[str,Image.Image], after: dict[str,Image.Image]) -> None:
    card_w, card_h, pairs_per_row = 180, 180, 3
    rows = (len(CROPS)+pairs_per_row-1)//pairs_per_row
    canvas = Image.new("RGB", (pairs_per_row*card_w*2, rows*card_h), "#10131d")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    for index,(ident,filename,box) in enumerate(CROPS):
        pair_x=(index%pairs_per_row)*card_w*2
        y0=(index//pairs_per_row)*card_h
        for side,(tag,source) in enumerate((("BEFORE",before[filename]),("AFTER",after[filename]))):
            x0=pair_x+side*card_w
            checker(draw,x0+5,y0+6,card_w-10,140)
            art=crop_fit(source,box)
            canvas.paste(art,(x0+(card_w-art.width)//2,y0+8+(136-art.height)//2),art)
            draw.text((x0+6,y0+154),f"{tag} {ident}",fill="white",font=font)
    canvas.save(PREVIEW/"before-after.png")


def main() -> None:
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    args=parser.parse_args()
    PREVIEW.mkdir(parents=True,exist_ok=True)
    before={}
    after={}
    for filename in TARGETS:
        source=ASSETS/filename
        image=Image.open(source).convert("RGBA")
        fixed,restored,solidified=restore(image)
        before[filename]=image
        after[filename]=fixed
        fixed.save(PREVIEW/filename)
        print(f"{filename}: restored={restored} solidified={solidified}")
        if args.apply and (restored or solidified):
            BACKUP.mkdir(parents=True,exist_ok=True)
            backup=BACKUP/filename
            if not backup.exists():
                image.save(backup)
            fixed.save(source)
    make_contact(before,after)
    print("preview",PREVIEW/"before-after.png")


if __name__ == "__main__":
    main()


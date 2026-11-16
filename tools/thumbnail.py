"""Custom Shorts thumbnail (1080x1920 JPEG, < 2 MB) from a clean frame + big curiosity text.

Usage: python tools/thumbnail.py <video-id>
Reads videos/<id>/meta.json -> "thumbnail":
  {
    "time": 1.5,                         # second of the video to use (rendered WITHOUT titles/captions)
    "lines": ["IT WASN'T", "WATER"],     # 1-3 short lines, 2-5 words total, ALL CAPS
    "colors": ["#FFFFFF", "#FFD60A"],    # one per line (white / yellow / red #FF3B30 / green #4DFF88)
    "focus": [0.5, 0.45],                # crop centre (0-1) when zooming
    "zoom": 1.12,                        # 1.0-1.5
    "text_y": 210,                       # top of the text block (px); keep it in the upper half
    "circle": [540, 1150, 170],          # optional red ring around the key object (x, y, r) in final px
    "arrow": [[860, 820], [640, 1040]],  # optional red arrow from -> to, in final px
    "badge": "1919"                      # optional small yellow tag (date, number, place)
  }
Writes out/<id>/thumb.jpg and out/<id>/thumb_preview.jpg (full size + feed size side by side).
Rules (QUALITY.md §Miniatura): the text must be TRUE to the video, readable at feed size, nothing in the
bottom 22 % (YouTube draws the title there); "text_y" can be low (e.g. 1000) when the action is at the top, no logos, no real-person likeness, nothing gory."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]
OUT = f"{ROOT}/out/{VID}"
W, H = 1080, 1920
FONT = f"{ROOT}/assets/fonts/Anton-Regular.ttf"
meta = json.load(open(f"{ROOT}/videos/{VID}/meta.json"))
th = meta.get("thumbnail") or sys.exit("meta.json has no 'thumbnail' block")
T = float(th.get("time", meta.get("thumb_time", 1.0)))
frame = f"{OUT}/frames/c_{T:06.2f}.jpg"
if not os.path.exists(frame):
    subprocess.run([sys.executable, f"{ROOT}/tools/render.py", VID, "clean", str(T)], check=True)

img = Image.open(frame).convert("RGB")
# zoom around focus
z = max(1.0, min(1.5, float(th.get("zoom", 1.1))))
fx, fy = th.get("focus", [0.5, 0.45])
cw, ch = W / z, H / z
x0 = min(max(fx * W - cw / 2, 0), W - cw); y0 = min(max(fy * H - ch / 2, 0), H - ch)
img = img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.LANCZOS)
# punchier grade
img = ImageEnhance.Contrast(img).enhance(1.18)
img = ImageEnhance.Color(img).enhance(1.32)
img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
# vignette + dark band behind the text
shade = Image.new("L", (W, H), 0); d = ImageDraw.Draw(shade)
for i in range(60):
    a = int(150 * (1 - i / 60) ** 2)
    d.rectangle([i * 9, i * 16, W - i * 9, H - i * 16], outline=a, width=18)
text_y = int(th.get("text_y", 210))
band0, band1 = text_y - 60, text_y + int(th.get("text_h", 560))
for y in range(max(0, band0 - 260), min(H, band1 + 260)):
    k = 1.0 if band0 <= y <= band1 else max(0.0, 1 - (band0 - y if y < band0 else y - band1) / 260)
    d.line([(0, y), (W, y)], fill=max(int(int(th.get("band", 165)) * k), shade.getpixel((W // 2, y))))
img = Image.composite(Image.new("RGB", (W, H), (8, 8, 12)), img, shade.filter(ImageFilter.GaussianBlur(24)))
draw = ImageDraw.Draw(img)

RED = (255, 59, 48)
if th.get("circle"):
    cx, cy, r = th["circle"]
    for wdt, col in ((34, (10, 10, 12)), (20, RED)):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=wdt)
if th.get("arrow"):
    (ax, ay), (bx, by) = th["arrow"]
    import math
    ang = math.atan2(by - ay, bx - ax); hl = 95
    tip = [(bx, by), (bx - hl * math.cos(ang - 0.5), by - hl * math.sin(ang - 0.5)), (bx - hl * math.cos(ang + 0.5), by - hl * math.sin(ang + 0.5))]
    sx, sy = bx - 0.7 * hl * math.cos(ang), by - 0.7 * hl * math.sin(ang)
    draw.line([(ax, ay), (sx, sy)], fill=(10, 10, 12), width=46); draw.polygon(tip, fill=(10, 10, 12))
    draw.line([(ax, ay), (sx, sy)], fill=RED, width=28)
    inner = [(bx - 14 * math.cos(ang), by - 14 * math.sin(ang))] + [(x + 0.18 * (bx - x), y + 0.18 * (by - y)) for x, y in tip[1:]]
    draw.polygon(inner, fill=RED)

# text: each line fitted to the 960 px safe width, Anton, thick stroke + shadow
lines = [s.upper() for s in th["lines"]][:3]
colors = th.get("colors") or ["#FFFFFF"] * len(lines)
y = text_y
for i, line in enumerate(lines):
    size = 330 if len(lines) == 1 else 270
    while True:
        f = ImageFont.truetype(FONT, size)
        bb = draw.textbbox((0, 0), line, font=f, stroke_width=16)
        if bb[2] - bb[0] <= 960 or size <= 90: break
        size -= 6
    wpx, hpx = bb[2] - bb[0], bb[3] - bb[1]
    x = (W - wpx) // 2 - bb[0]
    draw.text((x + 10, y + 12 - bb[1]), line, font=f, fill=(0, 0, 0), stroke_width=16, stroke_fill=(0, 0, 0))
    draw.text((x, y - bb[1]), line, font=f, fill=colors[i % len(colors)], stroke_width=16, stroke_fill=(10, 10, 12))
    y += hpx + 24
if y > H * 0.78:
    sys.exit(f"text block reaches {y}px: the bottom 22 % is covered by YouTube's title; move it up or shorten it")
if th.get("badge"):
    f = ImageFont.truetype(FONT, 110); t = str(th["badge"]).upper()
    bb = draw.textbbox((0, 0), t, font=f); bw, bh = bb[2] - bb[0] + 70, bb[3] - bb[1] + 50
    bx = 70; by = int(th.get("badge_y", 170 if text_y > 800 else int(H * 0.70) - bh))
    draw.rounded_rectangle([bx + 8, by + 10, bx + bw + 8, by + bh + 10], 26, fill=(0, 0, 0))
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], 26, fill=(255, 214, 10), outline=(10, 10, 12), width=8)
    draw.text((bx + 35 - bb[0], by + 25 - bb[1]), t, font=f, fill=(10, 10, 12))

q = 92
while True:
    img.save(f"{OUT}/thumb.jpg", "JPEG", quality=q, optimize=True, progressive=True)
    if os.path.getsize(f"{OUT}/thumb.jpg") < 1_900_000 or q <= 70: break
    q -= 4
small = img.resize((216, 384), Image.LANCZOS)
prev = Image.new("RGB", (W // 2 + 40 + 216, H // 2), (40, 40, 40))
prev.paste(img.resize((W // 2, H // 2), Image.LANCZOS), (0, 0)); prev.paste(small, (W // 2 + 20, 0))
prev.save(f"{OUT}/thumb_preview.jpg", quality=88)
print("thumb", f"{OUT}/thumb.jpg", os.path.getsize(f"{OUT}/thumb.jpg"), "bytes; preview", f"{OUT}/thumb_preview.jpg")

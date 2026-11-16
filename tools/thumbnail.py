"""Custom Shorts thumbnail (1080x1920 JPEG, < 2 MB) from a clean frame + big curiosity text.

Usage: python tools/thumbnail.py <video-id>
Reads videos/<id>/meta.json -> "thumbnail":
  {
    "time": 1.5,                         # second of the video to use (rendered WITHOUT titles/captions)
    "lines": ["IT WASN'T", {"text": "WATER", "strike": true}],  # 1-3 short lines, 2-5 words, ALL CAPS.
                                         # A line can be a dict: text, color, box (bg colour), strike (red slash)
    "colors": ["#FFFFFF", "#FFD60A"],    # default colour per line (white / yellow / red #FF3B30 / green #4DFF88)
    "tilt": -4,                          # degrees for the text block (hype look); 0 = straight
    "rays": [760, 520],                  # optional burst of light rays from this point (final px)
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
img = ImageEnhance.Contrast(img).enhance(float(th.get("contrast", 1.28)))
img = ImageEnhance.Color(img).enhance(float(th.get("saturation", 1.5)))
img = ImageEnhance.Brightness(img).enhance(1.04)
if th.get("rays"):   # burst of light from the key object: the classic "look here" thumbnail energy
    import math
    rx, ry = th["rays"]; ray = Image.new("L", (W, H), 0); rd = ImageDraw.Draw(ray)
    for k in range(24):
        a0 = k * 2 * math.pi / 24; a1 = a0 + math.pi / 30
        rd.polygon([(rx, ry), (rx + 2600 * math.cos(a0), ry + 2600 * math.sin(a0)), (rx + 2600 * math.cos(a1), ry + 2600 * math.sin(a1))], fill=70)
    fade = Image.radial_gradient("L").resize((W * 2, W * 2)).crop((W - rx, W - ry, W - rx + W, W - ry + H))
    ray = Image.composite(Image.new("L", (W, H), 0), ray, fade.point(lambda v: min(255, int(v * 1.6))))
    img = Image.composite(Image.new("RGB", (W, H), (255, 236, 160)), img, ray.filter(ImageFilter.GaussianBlur(6)))
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
    glow = Image.new("L", (W, H), 0); ImageDraw.Draw(glow).ellipse([cx - r, cy - r, cx + r, cy + r], outline=255, width=60)
    img.paste((255, 70, 50), (0, 0), glow.filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * 0.7))); draw = ImageDraw.Draw(img)
    for wdt, col in ((40, (255, 255, 255)), (30, (10, 10, 12)), (20, RED)):
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
specs = [l if isinstance(l, dict) else {"text": l} for l in th["lines"]][:3]
colors = th.get("colors") or ["#FFFFFF"] * len(specs)
layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
y = text_y
for i, sp in enumerate(specs):
    line = str(sp["text"]).upper(); col = sp.get("color", colors[i % len(colors)])
    size = 360 if len(specs) == 1 else 290
    while True:
        f = ImageFont.truetype(FONT, size)
        bb = ld.textbbox((0, 0), line, font=f, stroke_width=18)
        if bb[2] - bb[0] <= (900 if sp.get("box") else 980) or size <= 90: break
        size -= 6
    wpx, hpx = bb[2] - bb[0], bb[3] - bb[1]
    x = (W - wpx) // 2 - bb[0]
    if sp.get("box"):
        ld.rounded_rectangle([x + bb[0] - 34, y - 22, x + bb[2] + 34, y + hpx + 22], 28, fill=sp["box"], outline=(10, 10, 12, 255), width=12)
    ld.text((x + 14, y + 16 - bb[1]), line, font=f, fill=(0, 0, 0, 255), stroke_width=18, stroke_fill=(0, 0, 0, 255))
    ld.text((x, y - bb[1]), line, font=f, fill=col, stroke_width=18, stroke_fill=(10, 10, 12, 255))
    if sp.get("strike"):
        ld.line([(x + bb[0] - 20, y + hpx * 0.72), (x + bb[2] + 20, y + hpx * 0.30)], fill=(10, 10, 12, 255), width=58)
        ld.line([(x + bb[0] - 14, y + hpx * 0.72), (x + bb[2] + 14, y + hpx * 0.30)], fill=RED + (255,), width=36)
    y += hpx + (70 if sp.get("box") else 30)
if y > H * 0.78:
    sys.exit(f"text block reaches {y}px: the bottom 22 % is covered by YouTube's title; move it up or shorten it")
tilt = float(th.get("tilt", -4))
if tilt:
    layer = layer.rotate(-tilt, resample=Image.BICUBIC, center=(W // 2, text_y + (y - text_y) // 2))
glowmask = layer.split()[3].filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.55))
img.paste(tuple(int(th.get("glow", "#FFD60A").lstrip("#")[k:k + 2], 16) for k in (0, 2, 4)), (0, 0), glowmask)
img.paste(layer, (0, 0), layer); draw = ImageDraw.Draw(img)
if th.get("badge"):
    f = ImageFont.truetype(FONT, 104); t = str(th["badge"]).upper()
    bb = draw.textbbox((0, 0), t, font=f); bw, bh = bb[2] - bb[0] + 80, bb[3] - bb[1] + 56
    tag = Image.new("RGBA", (bw + 30, bh + 30), (0, 0, 0, 0)); td = ImageDraw.Draw(tag)
    td.rounded_rectangle([10, 14, bw + 10, bh + 14], 24, fill=(0, 0, 0, 255))
    td.rounded_rectangle([0, 0, bw, bh], 24, fill=th.get("badge_color", "#FF3B30"), outline=(255, 255, 255, 255), width=9)
    td.text((40 - bb[0], 28 - bb[1]), t, font=f, fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=(10, 10, 12, 255))
    tag = tag.rotate(float(th.get("badge_tilt", 6)), resample=Image.BICUBIC, expand=True)
    bx = int(th.get("badge_x", 60)); by = int(th.get("badge_y", 150 if text_y > 800 else int(H * 0.70) - bh))
    img.paste(tag, (bx, by), tag); draw = ImageDraw.Draw(img)

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

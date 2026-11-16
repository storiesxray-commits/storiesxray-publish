"""HYPER-VIRAL Shorts thumbnail (1080x1920 JPEG, < 2 MB) from a clean frame + big curiosity text. Every video gets one.

Usage: python tools/thumbnail.py <video-id> [--social]   (--social -> out/<id>/cover_social*.jpg, 3:4-safe IG/FB cover)
Reads videos/<id>/meta.json -> "thumbnail" (base settings) + "variants" (>= 3 overrides, MANDATORY) + "pick":
  {
    "time": 20.3,                        # second of the video (rendered WITHOUT titles/captions): the most extreme moment
    "protect": [400, 430, 710, 1020],    # MANDATORY: final-px box of the key subject (face, flame, wave...).
                                         #   Text and badge are never allowed on it; rays are kept off it so it stays crisp.
    "lines": ["IT WASN'T", {"text": "WATER", "strike": true}],  # 1-3 lines, 2-4 words in total, ALL CAPS.
                                         # A line can be a dict: text, color, box (bg colour), strike (red slash)
    "tilt": -4,                          # degrees for the text block (-3..-6)
    "rays": [760, 520],                  # burst of light rays (default: centre of "protect")
    "circle": [540, 1150, 170],          # red ring (default: around "protect")
    "badge": "1919",                     # MANDATORY red sticker: date, place or number
    "focus": [0.5, 0.45], "zoom": 1.12,  # crop centre (0-1) and zoom 1.0-1.5
    "text_y": 210,                       # preferred top of the text block (moved automatically off "protect")
    "arrow": [[860, 820], [640, 1040]],  # optional
    "variants": [{}, {"text_y": 1100}, {"lines": [...], "glow": "#FF3B30"}],   # >= 3, each overrides the base
    "pick": 0                            # the variant that reads best in out/<id>/thumb_variants.jpg (feed size)
  }
Writes out/<id>/thumb.jpg (the picked variant), thumb_preview.jpg (full + feed size), thumb_variants.jpg
(all variants side by side at feed size) and thumb_report.json (sha256 + checks; handoff.py requires it).
Hard checks (exit 1 if any fails): 3 visual hooks present, 2-4 words, text readable at feed size, nothing on the
subject, everything inside the safe zone (80 px sides, 120 px top, nothing below 1490 px where YouTube puts the title).
Rules: QUALITY.md §5b. Honest clickbait only: everything promised happens in the video. No logos, no likeness, no gore."""
import hashlib, json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]
OUT = f"{ROOT}/out/{VID}"
W, H = 1080, 1920
FONT = f"{ROOT}/assets/fonts/Anton-Regular.ttf"
RED = (255, 59, 48)
SL, ST, SR, SB = 80, 120, 1000, 1490          # safe zone
MIN_LINE_PX = 120                              # >= ~24 px tall in the 216x384 feed tile
meta = json.load(open(f"{ROOT}/videos/{VID}/meta.json"))
BASE = meta.get("thumbnail") or sys.exit("meta.json has no 'thumbnail' block")
# --social: Instagram/Facebook cover (first frame of video_social.mp4). The IG profile grid crops 9:16 to 3:4
# (rows 240..1680), so the safe zone is 270..1650; meta.json "social_thumbnail" overrides the base block.
SOCIAL = "--social" in sys.argv
if SOCIAL: BASE = {**BASE, "safe_top": 270, "safe_bottom": 1650, **(meta.get("social_thumbnail") or {})}
NAME = "cover_social" if SOCIAL else "thumb"
ST, SB = int(BASE.get("safe_top", ST)), int(BASE.get("safe_bottom", SB))
def clamp(v, lo, hi): return max(lo, min(hi, v))
def inter(a, b, m=0): return not (a[2] + m <= b[0] or b[2] + m <= a[0] or a[3] + m <= b[1] or b[3] + m <= a[1])
class Fail(Exception): pass

def frame_for(T):
    f = f"{OUT}/frames/c_{T:06.2f}.jpg"
    if not os.path.exists(f):
        subprocess.run([sys.executable, f"{ROOT}/tools/render.py", VID, "clean", str(T)], check=True)
    return f

def render(th):
    if not th.get("protect"): raise Fail("'protect' box missing (the subject the text must never cover)")
    if not th.get("badge"): raise Fail("'badge' missing (date, place or number sticker is mandatory)")
    P = [int(v) for v in th["protect"]]
    pcx, pcy = (P[0] + P[2]) // 2, (P[1] + P[3]) // 2
    circle = th.get("circle") or [pcx, pcy, int(max(P[2] - P[0], P[3] - P[1]) / 2 + 30)]
    rays = th.get("rays") or [pcx, pcy]
    specs = [l if isinstance(l, dict) else {"text": l} for l in th["lines"]][:3]
    words = sum(len(str(s["text"]).split()) for s in specs)
    if not 2 <= words <= 4: raise Fail(f"text has {words} words; use 2-4")
    T = float(th.get("time", meta.get("thumb_time", 1.0)))
    img = Image.open(frame_for(T)).convert("RGB")
    z = max(1.0, min(1.5, float(th.get("zoom", 1.1)))); fx, fy = th.get("focus", [0.5, 0.45])
    cw, ch = W / z, H / z
    x0 = min(max(fx * W - cw / 2, 0), W - cw); y0 = min(max(fy * H - ch / 2, 0), H - ch)
    img = img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(float(th.get("contrast", 1.28)))
    img = ImageEnhance.Color(img).enhance(float(th.get("saturation", 1.5)))
    img = ImageEnhance.Brightness(img).enhance(1.04)
    # subject mask (soft) — rays and the dark band stay off it
    pm = Image.new("L", (W, H), 0); ImageDraw.Draw(pm).rounded_rectangle(P, 60, fill=255); pm = pm.filter(ImageFilter.GaussianBlur(40))
    rx, ry = rays; ray = Image.new("L", (W, H), 0); rd = ImageDraw.Draw(ray)
    for k in range(24):
        a0 = k * 2 * math.pi / 24; a1 = a0 + math.pi / 30
        rd.polygon([(rx, ry), (rx + 2600 * math.cos(a0), ry + 2600 * math.sin(a0)), (rx + 2600 * math.cos(a1), ry + 2600 * math.sin(a1))], fill=int(th.get("ray_alpha", 80)))
    fade = Image.radial_gradient("L").resize((W * 2, W * 2)).crop((W - rx, W - ry, W - rx + W, W - ry + H))
    ray = Image.composite(Image.new("L", (W, H), 0), ray, fade.point(lambda v: min(255, int(v * 1.6))))
    ray = Image.composite(Image.new("L", (W, H), 0), ray, pm)
    img = Image.composite(Image.new("RGB", (W, H), (255, 236, 160)), img, ray.filter(ImageFilter.GaussianBlur(6)))
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))

    # ---- text block: fit inside the safe zone and OFF the subject
    colors = th.get("colors") or ["#FFFFFF"] * len(specs); tilt = float(th.get("tilt", -4))
    probe = ImageDraw.Draw(Image.new("L", (8, 8)))
    def make_text(scale, top):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer); y = top; hs = []
        for i, sp in enumerate(specs):
            line = str(sp["text"]).upper(); col = sp.get("color", colors[i % len(colors)])
            size = int((360 if len(specs) == 1 else 290) * scale)
            while True:
                f = ImageFont.truetype(FONT, size); bb = probe.textbbox((0, 0), line, font=f, stroke_width=18)
                if bb[2] - bb[0] <= (SR - SL - 120 if sp.get("box") else SR - SL - 40) * scale or size <= 80: break
                size -= 4
            wpx, hpx = bb[2] - bb[0], bb[3] - bb[1]; hs.append(hpx); x = (W - wpx) // 2 - bb[0]
            if sp.get("box"):
                ld.rounded_rectangle([x + bb[0] - 34, y - 22, x + bb[2] + 34, y + hpx + 22], 28, fill=sp["box"], outline=(10, 10, 12, 255), width=12)
            ld.text((x + 14, y + 16 - bb[1]), line, font=f, fill=(0, 0, 0, 255), stroke_width=18, stroke_fill=(0, 0, 0, 255))
            ld.text((x, y - bb[1]), line, font=f, fill=col, stroke_width=18, stroke_fill=(10, 10, 12, 255))
            if sp.get("strike"):   # thinner slash: the word must stay readable under it
                ld.line([(x + bb[0] - 20, y + hpx * 0.70), (x + bb[2] + 20, y + hpx * 0.34)], fill=(10, 10, 12, 255), width=40)
                ld.line([(x + bb[0] - 14, y + hpx * 0.70), (x + bb[2] + 14, y + hpx * 0.34)], fill=RED + (255,), width=24)
            y += hpx + (70 if sp.get("box") else 30)
        if tilt: layer = layer.rotate(-tilt, resample=Image.BICUBIC, center=(W // 2, top + (y - top) // 2))
        return layer, layer.getbbox(), min(hs)
    scale, top, g = 1.0, int(th.get("text_y", 210)), 22
    for _ in range(80):
        layer, bb, minh = make_text(scale, top)
        box = (bb[0] - g, bb[1] - g, bb[2] + g, bb[3] + g)
        if inter(box, P, 10):                        # move to the side of the subject with more room
            below, above = SB - P[3], P[1] - ST
            top = top + (P[3] + 12 - box[1]) if below >= above else top - (box[3] - (P[1] - 12));
            layer, bb, minh = make_text(scale, top); box = (bb[0] - g, bb[1] - g, bb[2] + g, bb[3] + g)
        inside = box[0] >= SL and box[2] <= SR and box[1] >= ST and box[3] <= SB
        if inside and not inter(box, P, 10): break
        if box[3] > SB and box[1] - (box[3] - SB) >= ST and not inter((box[0], box[1] - (box[3] - SB), box[2], SB), P, 10): top -= box[3] - SB; continue
        if box[1] < ST and box[3] + (ST - box[1]) <= SB and not inter((box[0], ST, box[2], box[3] + ST - box[1]), P, 10): top += ST - box[1]; continue
        scale *= 0.95
    else:
        raise Fail("text cannot fit the safe zone without covering 'protect'; fewer words, smaller protect box or another frame")
    if minh < MIN_LINE_PX: raise Fail(f"text too small for the feed ({minh}px < {MIN_LINE_PX}px): fewer/shorter words or another layout")

    # vignette + dark band behind the FINAL text position (kept off the subject)
    shade = Image.new("L", (W, H), 0); d = ImageDraw.Draw(shade)
    for i in range(60):
        d.rectangle([i * 9, i * 16, W - i * 9, H - i * 16], outline=int(150 * (1 - i / 60) ** 2), width=18)
    band0, band1 = box[1] - 40, box[3] + 40
    for y in range(max(0, band0 - 260), min(H, band1 + 260)):
        k = 1.0 if band0 <= y <= band1 else max(0.0, 1 - (band0 - y if y < band0 else y - band1) / 260)
        d.line([(0, y), (W, y)], fill=max(int(int(th.get("band", 150)) * k), shade.getpixel((W // 2, y))))
    shade = Image.composite(Image.new("L", (W, H), 0), shade, pm.point(lambda v: int(v * 0.85)))
    img = Image.composite(Image.new("RGB", (W, H), (8, 8, 12)), img, shade.filter(ImageFilter.GaussianBlur(24)))
    draw = ImageDraw.Draw(img); boxes = []

    # red ring around the subject (glow only OUTSIDE the ring so the subject stays crisp)
    cx, cy, r = circle; pad = 40
    r = min(r, (SR - SL) // 2 - pad, (SB - ST) // 2 - pad)
    cx = clamp(cx, SL + pad + r, SR - pad - r); cy = clamp(cy, ST + pad + r, SB - pad - r)
    glow = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(glow); gd.ellipse([cx - r - 30, cy - r - 30, cx + r + 30, cy + r + 30], fill=255); gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=0)
    img.paste((255, 70, 50), (0, 0), glow.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.75))); draw = ImageDraw.Draw(img)
    for wdt, col in ((40, (255, 255, 255)), (30, (10, 10, 12)), (20, RED)):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=wdt)
    boxes.append(("circle", (cx - r - 20, cy - r - 20, cx + r + 20, cy + r + 20)))
    if th.get("arrow"):
        (ax, ay), (bx, by) = [(clamp(x, SL + 40, SR - 40), clamp(y, ST + 40, SB - 40)) for x, y in th["arrow"]]
        ang = math.atan2(by - ay, bx - ax); hl = 95
        tip = [(bx, by), (bx - hl * math.cos(ang - 0.5), by - hl * math.sin(ang - 0.5)), (bx - hl * math.cos(ang + 0.5), by - hl * math.sin(ang + 0.5))]
        sx, sy = bx - 0.7 * hl * math.cos(ang), by - 0.7 * hl * math.sin(ang)
        draw.line([(ax, ay), (sx, sy)], fill=(10, 10, 12), width=46); draw.polygon(tip, fill=(10, 10, 12)); draw.line([(ax, ay), (sx, sy)], fill=RED, width=28)
        draw.polygon([(bx - 14 * math.cos(ang), by - 14 * math.sin(ang))] + [(x + 0.18 * (bx - x), y + 0.18 * (by - y)) for x, y in tip[1:]], fill=RED)
    glowmask = layer.split()[3].filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.55))
    img.paste(tuple(int(th.get("glow", "#FFD60A").lstrip("#")[k:k + 2], 16) for k in (0, 2, 4)), (0, 0), glowmask)
    img.paste(layer, (0, 0), layer); draw = ImageDraw.Draw(img)
    boxes.append(("text", box))

    # badge: never on the text, the ring's subject or the protect box
    placed = None
    for fs in (100, 90, 80, 70):
        f = ImageFont.truetype(FONT, fs); t = str(th["badge"]).upper()
        tb = draw.textbbox((0, 0), t, font=f); bw, bh = tb[2] - tb[0] + int(fs * 0.8), tb[3] - tb[1] + int(fs * 0.56)
        tag = Image.new("RGBA", (bw + 30, bh + 30), (0, 0, 0, 0)); td = ImageDraw.Draw(tag)
        td.rounded_rectangle([10, 14, bw + 10, bh + 14], 24, fill=(0, 0, 0, 255))
        td.rounded_rectangle([0, 0, bw, bh], 24, fill=th.get("badge_color", "#FF3B30"), outline=(255, 255, 255, 255), width=9)
        td.text((int(fs * 0.4) - tb[0], int(fs * 0.28) - tb[1]), t, font=f, fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=(10, 10, 12, 255))
        tag = tag.rotate(float(th.get("badge_tilt", 6)), resample=Image.BICUBIC, expand=True); tw, tht = tag.size
        first = (clamp(int(th.get("badge_x", SL)), SL, SR - tw), clamp(int(th.get("badge_y", ST)), ST, SB - tht))
        tbx = box
        for cand in (first, (SL, ST), (SR - tw, ST), (SL, min(SB - tht, tbx[3] + 16)), (SR - tw, min(SB - tht, tbx[3] + 16)),
                     (SL, max(ST, tbx[1] - tht - 16)), (SR - tw, max(ST, tbx[1] - tht - 16))):
            rect = (cand[0], cand[1], cand[0] + tw, cand[1] + tht)
            if not inter(rect, P, 12) and not any(inter(rect, b, 12) for _, b in boxes): placed = cand; break
        if placed: break
    if not placed: raise Fail("badge collides everywhere; smaller circle/protect or shorter badge")
    img.paste(tag, placed, tag); boxes.append(("badge", (placed[0], placed[1], placed[0] + tw, placed[1] + tht)))
    for name, (a, b_, c, d_) in boxes:
        if a < SL - 1 or b_ < ST - 1 or c > SR + 1 or d_ > SB + 1: raise Fail(f"{name} outside the safe zone: {(a, b_, c, d_)}")
    checks = {"hooks": "circle+rays+badge", "words": words, "min_line_px": minh, "text_box": box, "protect": P,
              "text_off_subject": not inter(box, P), "lowest_overlay_px": max(b[1][3] for b in boxes)}
    return img, checks

def save_jpg(img, path):
    q = 92
    while True:
        img.save(path, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(path) < 1_900_000 or q <= 70: return
        q -= 4

variants = BASE.get("variants") or []
if len(variants) < 3: sys.exit("thumbnail: at least 3 'variants' are mandatory (QUALITY.md §5b); add them to meta.json")
pick = int(BASE.get("pick", 0))
base = {k: v for k, v in BASE.items() if k not in ("variants", "pick")}
results = []
for i, ov in enumerate(variants):
    th = {**base, **ov}
    try:
        img, ck = render(th); save_jpg(img, f"{OUT}/{NAME}_v{i}.jpg"); results.append((i, img, ck, None)); print(f"variant {i}: OK {ck}")
    except Fail as e:
        results.append((i, None, None, str(e))); print(f"variant {i}: FAILED {e}")
# comparison sheet at feed size (what a viewer actually sees)
sheet = Image.new("RGB", (len(results) * 236 + 20, 440), (24, 24, 24)); sd = ImageDraw.Draw(sheet)
for i, img, ck, err in results:
    x = 20 + i * 236
    if img:
        tile = img.resize((216, 384), Image.LANCZOS); m = Image.new("L", tile.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 215, 383], 18, fill=255)
        sheet.paste(tile, (x, 20), m)
    sd.text((x, 410), f"v{i}" + (" PICK" if i == pick else "") + ("" if img else " FAILED"), fill=(255, 214, 10) if i == pick else (200, 200, 200))
sheet.save(f"{OUT}/{NAME}_variants.jpg", quality=90)
chosen = [r for r in results if r[0] == pick]
if not chosen or chosen[0][1] is None: sys.exit(f"picked variant {pick} failed: {chosen[0][3] if chosen else 'no such variant'}")
_, img, ck, _ = chosen[0]
save_jpg(img, f"{OUT}/{NAME}.jpg")
half = img.resize((W // 2, H // 2), Image.LANCZOS); hd = ImageDraw.Draw(half)
hd.rectangle([SL // 2, ST // 2, SR // 2, SB // 2], outline=(0, 255, 255), width=2); hd.rectangle([0, SB // 2, W // 2, H // 2], outline=(255, 0, 255), width=2)
P = ck["protect"]; hd.rectangle([P[0] // 2, P[1] // 2, P[2] // 2, P[3] // 2], outline=(0, 255, 0), width=2)
tile = img.resize((216, 384), Image.LANCZOS); m = Image.new("L", tile.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 215, 383], 18, fill=255)
prev = Image.new("RGB", (W // 2 + 40 + 216, H // 2), (24, 24, 24)); prev.paste(half, (0, 0)); prev.paste(tile, (W // 2 + 20, 20), m)
ImageDraw.Draw(prev).text((W // 2 + 20, 412), "feed size", fill=(200, 200, 200)); prev.save(f"{OUT}/{NAME}_preview.jpg", quality=88)
sha = hashlib.sha256(open(f"{OUT}/{NAME}.jpg", "rb").read()).hexdigest()
json.dump({"sha256": sha, "pick": pick, "variants_ok": [r[0] for r in results if r[1] is not None], "checks": ck},
          open(f"{OUT}/{NAME}_report.json", "w"), indent=1)
print("thumb", f"{OUT}/{NAME}.jpg", os.path.getsize(f"{OUT}/{NAME}.jpg"), "bytes  sha", sha[:12], " variants sheet", f"{OUT}/{NAME}_variants.jpg")

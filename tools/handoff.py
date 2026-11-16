"""Handoff: the single step added at the end of the pipeline (after build.py).
Writes publish/<id>/xr_payload.json = everything Make's XR-01 needs that can be measured here:
SHA-256, size, duration, resolution, codecs, fps, bitrate and the editorial fields from meta.json.
Owner rule (15/11/2026): no prior approval. It sets metadata status to `ready` unless it is `hold`,
and to `hold` if any check fails, so a broken package is never published.
Usage: python tools/handoff.py <video-id>"""
import glob, hashlib, json, os, random, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; P = f"{ROOT}/publish/{VID}"; mp4 = f"{P}/video.mp4"
meta = json.load(open(f"{P}/metadata.json"))
h = hashlib.sha256(); f = open(mp4, "rb")
for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", mp4]))
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), {})
num, den = map(int, v["avg_frame_rate"].split("/")); fps = round(num / den, 3)
with open(mp4, "rb") as fh: head = fh.read(4096)
faststart = head.find(b"moov") != -1 and (head.find(b"mdat") == -1 or head.find(b"moov") < head.find(b"mdat"))
num_id = VID.split("-")[0].replace("xr", "")
errs = []
vbr = int(v.get("bit_rate") or 0)
if v["codec_name"] != "h264": errs.append("video_codec_not_h264")
if a.get("codec_name") != "aac": errs.append("audio_missing_or_not_aac")
if (int(v["width"]), int(v["height"])) != (1080, 1920): errs.append("not_1080x1920")
if vbr > 5_000_000: errs.append("video_bitrate_over_5mbps_instagram")
if not faststart: errs.append("moov_not_at_start")
if float(pr["format"]["duration"]) > 59: errs.append("duration_over_59s")
thumb = f"{P}/thumb.jpg"
if not os.path.exists(thumb): errs.append("thumbnail_missing")
else:
    from PIL import Image
    tw, tht = Image.open(thumb).size
    if (tw, tht) != (1080, 1920): errs.append("thumbnail_not_1080x1920")
    if os.path.getsize(thumb) >= 2_000_000: errs.append("thumbnail_over_2mb")
    th = meta.get("thumbnail") or {}
    if not th: errs.append("thumbnail_not_custom")
    # hyper-viral thumbnail gate (QUALITY.md §5b): subject protected, 3 hooks, >= 3 variants compared,
    # and the published file must be exactly the one tools/thumbnail.py checked (thumb_report.json).
    if th and not th.get("protect"): errs.append("thumbnail_no_protect_box")
    if th and not th.get("badge"): errs.append("thumbnail_no_badge")
    if th and len(th.get("variants") or []) < 3: errs.append("thumbnail_fewer_than_3_variants")
    rep = f"{ROOT}/out/{VID}/thumb_report.json"
    if not os.path.exists(rep): errs.append("thumbnail_report_missing_run_thumbnail_py")
    else:
        tsha = hashlib.sha256(open(thumb, "rb").read()).hexdigest()
        if json.load(open(rep)).get("sha256") != tsha: errs.append("thumbnail_not_the_checked_one")
    # Instagram/Facebook: video_social.mp4 must exist (custom cover as frame 0) and be the file tools/social.py checked
    vs, srep = f"{P}/video_social.mp4", f"{ROOT}/out/{VID}/social_report.json"
    if not os.path.exists(vs) or not os.path.exists(f"{P}/cover_social.jpg"): errs.append("social_video_missing_run_social_py")
    elif not os.path.exists(srep) or json.load(open(srep)).get("sha256") != hashlib.sha256(open(vs, "rb").read()).hexdigest(): errs.append("social_video_not_the_checked_one")
for k in ("title", "description", "caption_instagram", "series", "sources"):
    if not meta.get(k): errs.append(f"{k}_missing")
for s in meta.get("sources", []):
    if not str(s.get("url", "")).startswith("https://"): errs.append("source_url_not_https")
    elif s["url"] not in meta.get("description", ""): errs.append("source_url_not_in_description")
if "<" in meta.get("title", "") or ">" in meta.get("title", "") or len(meta.get("title", "")) > 100: errs.append("title_invalid")
if meta.get("status") != "hold":
    meta["status"] = "hold" if errs else "ready"
    if errs: meta["hold_reason"] = "handoff checks failed: " + ", ".join(errs)
    json.dump(meta, open(f"{P}/metadata.json", "w"), indent=2, ensure_ascii=False)
# Publish time (America/New_York): a different time every day, inside the windows where the
# highest-paying English-speaking audiences are on Shorts: US midday (= UK evening), US evening
# (= Australia/NZ next morning) and US late evening (= US West Coast evening, Australia midday).
WINDOWS = [((11, 40), (14, 20), 0.30), ((16, 10), (20, 50), 0.50), ((21, 0), (22, 40), 0.20)]
def _mins(t): return int(t[:2]) * 60 + int(t[3:])
def pick_time(avoid):
    rng = random.SystemRandom()
    for _ in range(200):
        (a, b, _w), = rng.choices(WINDOWS, weights=[w[2] for w in WINDOWS])
        m = rng.randint(a[0] * 60 + a[1], b[0] * 60 + b[1])
        if m % 15 == 0 or any(abs(m - _mins(t)) < 75 for t in avoid):
            continue
        return f"{m // 60:02d}:{m % 60:02d}"
    return "17:47"
recent = []
for f in sorted(glob.glob(f"{ROOT}/publish/*/xr_payload.json")):
    if f"/{VID}/" in f: continue
    t = json.load(open(f)).get("publish_time_local")
    if t: recent.append(t)
publish_time = meta.get("publish_time_local") if len(str(meta.get("publish_time_local", ""))) == 5 else pick_time(recent[-3:])
if meta.get("publish_time_local") != publish_time:
    meta["publish_time_local"] = publish_time
    json.dump(meta, open(f"{P}/metadata.json", "w"), indent=2, ensure_ascii=False)
payload = {
    "content_id": f"xr-{num_id}", "repo_id": VID, "sha256": h.hexdigest(),
    "file_size_bytes": os.path.getsize(mp4), "duration_seconds": round(float(pr["format"]["duration"]), 3),
    "width": int(v["width"]), "height": int(v["height"]), "video_codec": v["codec_name"], "audio_codec": a.get("codec_name", ""),
    "fps": fps, "video_bit_rate": vbr, "faststart": faststart,
    "title_youtube": meta["title"], "description_youtube": meta["description"], "caption_instagram": meta.get("caption_instagram", ""),
    "tags": meta.get("tags", []), "series": meta.get("series", ""), "sources": meta.get("sources", []),
    "made_for_kids": bool(meta.get("made_for_kids", False)), "contains_synthetic_media": bool(meta.get("altered_or_synthetic_realistic", False)),
    "publishing_targets": meta.get("platforms", ["youtube", "instagram"]), "publish_time_local": publish_time, "checks_failed": errs,
}
json.dump(payload, open(f"{P}/xr_payload.json", "w"), indent=2, ensure_ascii=False)
print(("OK" if not errs else "PROBLEMS: " + ", ".join(errs)), f"{P}/xr_payload.json", payload["sha256"][:16])
sys.exit(1 if errs else 0)

"""Handoff: the single step added at the end of the pipeline (after build.py).
Writes publish/<id>/xr_payload.json = everything Make's XR-01 needs that can be measured here:
SHA-256, size, duration, resolution, codecs, fps, bitrate and the editorial fields from meta.json.
Owner rule (15/11/2026): no prior approval. It sets metadata status to `ready` unless it is `hold`,
and to `hold` if any check fails, so a broken package is never published.
Usage: python tools/handoff.py <video-id>"""
import hashlib, json, os, subprocess, sys
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
payload = {
    "content_id": f"xr-{num_id}", "repo_id": VID, "sha256": h.hexdigest(),
    "file_size_bytes": os.path.getsize(mp4), "duration_seconds": round(float(pr["format"]["duration"]), 3),
    "width": int(v["width"]), "height": int(v["height"]), "video_codec": v["codec_name"], "audio_codec": a.get("codec_name", ""),
    "fps": fps, "video_bit_rate": vbr, "faststart": faststart,
    "title_youtube": meta["title"], "description_youtube": meta["description"], "caption_instagram": meta.get("caption_instagram", ""),
    "tags": meta.get("tags", []), "series": meta.get("series", ""), "sources": meta.get("sources", []),
    "made_for_kids": bool(meta.get("made_for_kids", False)), "contains_synthetic_media": bool(meta.get("altered_or_synthetic_realistic", False)),
    "publishing_targets": meta.get("platforms", ["youtube", "instagram"]), "checks_failed": errs,
}
json.dump(payload, open(f"{P}/xr_payload.json", "w"), indent=2, ensure_ascii=False)
print(("OK" if not errs else "PROBLEMS: " + ", ".join(errs)), f"{P}/xr_payload.json", payload["sha256"][:16])
sys.exit(1 if errs else 0)

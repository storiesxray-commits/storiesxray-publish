"""Pre-publication audit (owner rule 20/11/2026): no video goes out unless voice, picture and text pass with zero errors.
handoff.py refuses (status hold) any video whose out/<id>/qa_report.json is missing, failed, or belongs to another file.

Automatic checks (python tools/qa.py <id>):
  STYLE   render_style "cartoon" (the only engine for new videos since 20/11/2026)
  VOICE   ElevenLabs take (no kokoro fallback), word timings complete and in order, narration not cut off
  AUDIO   -14 LUFS +-1, true peak <= -0.9 dBTP, voice over music/SFX >= 6 dB in every shot, audio as long as the picture
  VIDEO   1080x1920, 30 fps, H.264 + AAC 48 kHz, < 59 s, picture length = narration, no frozen spans >= 0.6 s, no black frames
  TEXT    captions = the script words exactly (tags removed), max 3 words / 12 letters per caption, spelling of script, title,
          description, Instagram caption and pinned comment (unknown words must be listed in meta.json "qa_words_ok")
Then it writes out/<id>/qa_sheet.jpg (one frame every 0.5 s) and out/<id>/qa_mid.jpg (middle of every shot, full size).
Visual sign-off (a person or Claude must LOOK at both sheets first; QUALITY.md §4 + engine/cartoon/README.md traps):
  python tools/qa.py <id> --visual-ok "what was checked"      (bound to the SHA-256 of this exact video)
Exit code 0 only when everything passes."""
import sys, os, json, re, subprocess, hashlib, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; OUT = f"{ROOT}/out/{VID}"; V = f"{ROOT}/videos/{VID}"
final = f"{OUT}/{VID}.mp4"
meta = json.load(open(f"{V}/meta.json")); script = json.load(open(f"{V}/script.json"))
sha = hashlib.sha256(open(final, "rb").read()).hexdigest()
errs, notes = [], []
def run(*c): return subprocess.run(c, capture_output=True, text=True)

if "--visual-ok" in sys.argv:
    rep = json.load(open(f"{OUT}/qa_report.json"))
    if rep.get("sha256") != sha: sys.exit("qa_report.json is for another render: run python tools/qa.py <id> first")
    note = sys.argv[sys.argv.index("--visual-ok") + 1] if len(sys.argv) > sys.argv.index("--visual-ok") + 1 else ""
    if len(note) < 20: sys.exit("describe what you checked (>= 20 characters)")
    rep["visual"] = {"ok": True, "sha256": sha, "note": note}
    rep["pass"] = not rep["errors"]
    json.dump(rep, open(f"{OUT}/qa_report.json", "w"), indent=1, ensure_ascii=False)
    print("visual sign-off saved;", "PASS" if rep["pass"] else "still FAILING: " + ", ".join(rep["errors"])); sys.exit(0 if rep["pass"] else 2)

# ---- STYLE ----
if meta.get("render_style") != "cartoon": errs.append("style_not_cartoon")
# ---- VOICE ----
tm = json.load(open(f"{OUT}/timing.json"))
if not str(tm.get("engine", "")).startswith("elevenlabs"): errs.append("voice_not_elevenlabs")
TAG = re.compile(r"\[[^\]]*\]")
words_script = [w for s in script["sentences"] for w in TAG.sub(" ", s[0]).split()]
words_tm = [w["w"] for s in tm["sentences"] for w in s["words"]]
if words_script != words_tm: errs.append("timing_words_differ_from_script")
prev = -1
for s in tm["sentences"]:
    for w in s["words"]:
        if w["s"] < prev - 1e-3 or w["e"] < w["s"]: errs.append(f"word_timing_out_of_order:{w['w']}"); break
        prev = w["s"]
# ---- VIDEO / AUDIO ----
pr = json.loads(run("ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", final).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), None)
dur = float(pr["format"]["duration"])
if (int(v["width"]), int(v["height"])) != (1080, 1920): errs.append("not_1080x1920")
if v["avg_frame_rate"] not in ("30/1", "30000/1000"): errs.append("not_30fps")
if v["codec_name"] != "h264": errs.append("not_h264")
if not a or a["codec_name"] != "aac" or int(a["sample_rate"]) != 48000: errs.append("audio_not_aac_48k")
if dur >= 59: errs.append("over_59s")
if int(v.get("bit_rate") or 0) > 5_000_000: errs.append("video_bitrate_over_5mbps")
if dur < tm["total"] - 0.05: errs.append("picture_shorter_than_narration")
if a and abs(float(a.get("duration", dur)) - float(v.get("duration", dur))) > 0.15: errs.append("audio_video_length_mismatch")
lo = run("ffmpeg", "-hide_banner", "-i", final, "-af", "ebur128=peak=true", "-f", "null", "-").stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", lo)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lo)[-1])
if not -15.0 <= I <= -13.0: errs.append(f"loudness_{I}")
if TP > -0.9: errs.append(f"true_peak_{TP}")
mr = f"{OUT}/mix_report.json"
margin = json.load(open(mr))["smallest_voice_margin_db"] if os.path.exists(mr) else None
if margin is None or margin < 6: errs.append(f"voice_margin_{margin}")
fz = run("ffmpeg", "-hide_banner", "-i", final, "-vf", "freezedetect=n=0.0015:d=0.6,blackdetect=d=0.05:pix_th=0.06", "-an", "-f", "null", "-").stderr
if "freeze_start" in fz: errs.append("frozen_picture_" + ",".join(re.findall(r"freeze_start: ([\d.]+)", fz))[:60])
if "black_start" in fz: errs.append("black_frames_" + ",".join(re.findall(r"black_start:([\d.]+)", fz))[:60])
# ---- TEXT: captions (same chunking as the engine) + spelling ----
chunks = []
for s in tm["sentences"]:
    cur = []
    def flush():
        global cur
        if cur: chunks.append(cur); cur = []
    for w in s["words"]:
        if cur and len(re.sub(r"[.,!?…]", "", " ".join(x["w"] for x in cur) + " " + w["w"])) > 12: flush()
        cur.append(w)
        if len(cur) >= 3 or re.search(r"[,.!?]$", w["w"]): flush()
    flush()
for c in chunks:
    txt = re.sub(r"[.,!?…:]", "", " ".join(w["w"] for w in c))
    if len(c) > 3 or len(txt.replace(" ", "")) > 14: errs.append(f"caption_too_long:{txt}")
if [w["w"] for c in chunks for w in c] != words_tm: errs.append("captions_do_not_cover_all_words")
from spellchecker import SpellChecker
sp = SpellChecker(); ok = {w.lower() for w in meta.get("qa_words_ok", [])} | {"x-ray", "xray", "storiesxray", "everydayxray", "youtube", "shorts", "stories"}
texts = {"script": " ".join(TAG.sub(" ", s[0]) for s in script["sentences"]), "title": meta.get("title", ""), "description": re.sub(r"https?://\S+", " ", meta.get("description", "")),
         "caption_instagram": meta.get("caption_instagram", ""), "pinned_comment": meta.get("pinned_comment", "")}
for k, t in texts.items():
    t = re.sub(r"#\w+", " ", t)
    toks = [w.lower() for w in re.findall(r"[A-Za-z][A-Za-z'’-]*", t) if not re.match(r"^[A-Z]{2,}$", w) or len(w) > 4]
    toks = [re.sub(r"(n['’]t|['’](s|re|ve|ll|d|m))$", "", w).strip("'’-") for w in toks]
    toks = [p for w in toks for p in w.split("-") if p]
    bad = sorted({w for w in sp.unknown([w for w in toks if w and w not in ok and not w.startswith("#")]) if w not in ok})
    if bad: errs.append(f"spelling_{k}:" + ",".join(bad[:12]))
# ---- sheets for the visual sign-off ----
run("ffmpeg", "-y", "-loglevel", "error", "-i", final, "-vf", "fps=2,scale=216:384,tile=10x" + str(math.ceil(dur * 2 / 10)), "-frames:v", "1", "-q:v", "3", f"{OUT}/qa_sheet.jpg")
shots = json.load(open(f"{OUT}/shots.json")); files = []
for s in shots:
    f = f"{OUT}/review/qa_{s['id']}.jpg"; os.makedirs(f"{OUT}/review", exist_ok=True)
    run("ffmpeg", "-y", "-loglevel", "error", "-ss", f"{(s['start'] + s['end']) / 2:.2f}", "-i", final, "-frames:v", "1", "-vf", "scale=540:960", "-q:v", "3", f); files.append(f)
cols = 4; rows = math.ceil(len(files) / cols)
inp = sum([["-i", f] for f in files], [])
lay = "|".join(f"{(i % cols) * 540}_{(i // cols) * 960}" for i in range(len(files)))
run("ffmpeg", "-y", "-loglevel", "error", *inp, "-filter_complex", "".join(f"[{i}]" for i in range(len(files))) + f"xstack=inputs={len(files)}:layout={lay}:fill=black", "-q:v", "3", f"{OUT}/qa_mid.jpg")
old = json.load(open(f"{OUT}/qa_report.json")) if os.path.exists(f"{OUT}/qa_report.json") else {}
vis = old.get("visual") if (old.get("visual") or {}).get("sha256") == sha else None
rep = {"id": VID, "sha256": sha, "duration": round(dur, 3), "loudness": I, "true_peak": TP, "voice_margin_db": margin, "voice": tm.get("voice_name"),
       "errors": errs, "visual": vis, "pass": not errs and bool(vis)}
json.dump(rep, open(f"{OUT}/qa_report.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: rep[k] for k in ("duration", "loudness", "true_peak", "voice_margin_db", "voice")}))
print("ERRORS:", errs if errs else "none")
print("visual sign-off:", "OK" if vis else f"PENDING -> look at {OUT}/qa_sheet.jpg and qa_mid.jpg, then: python tools/qa.py {VID} --visual-ok \"...\"")
print("Claude cannot hear audio: the audio checks are measurements (engine, timings, loudness, peak, voice margin), not listening.")
sys.exit(0 if rep["pass"] else 2)

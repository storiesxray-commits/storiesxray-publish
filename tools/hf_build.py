"""Builds a finished Short with the HyperFrames engine (owner 22/11/2026: half the videos in this engine, half in "cartoon").
videos/<id>/ holds script.json, meta.json ("render_style": "hyperframes"), sound.py and hyperframes/:
  hyperframes/index.html  the composition (HTML + SVG + GSAP; see engine/hyperframes/README.md)
  hyperframes/shots.json  [{"id": "s1", "start": 0.0}, ...]  scene cuts in seconds (for mix.py, captions and qa.py)
Steps: 1 narration (voice.py)  2 shots  3 sound mix (mix.py)  4 assemble out/<id>/hf/  5 render (npx hyperframes render)
       6 encode like build.py (<= 4.8 Mbps, AAC 48 kHz, faststart; a -3 dB limiter so AAC overshoot never breaks the -0.9 dBTP gate)  7 thumbnail  8 review sheet  9 publish package
Usage: python tools/hf_build.py <id> [--no-publish] [--skip-voice] [--reuse-render] [--stills 0.2,3.5,...]  (stills: only snapshots, no render)
       python tools/hf_build.py <id> clean <T>   -> out/<id>/frames/c_<T>.jpg (no subtitles/titles, for tools/thumbnail.py)
Render time: ~6-7 s of wall clock per second of video (software GL), a 30 s Short ~3.5 min."""
import argparse, json, os, shutil, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("vid"); ap.add_argument("mode", nargs="?", default="build"); ap.add_argument("t", nargs="?")
ap.add_argument("--no-publish", action="store_true"); ap.add_argument("--skip-voice", action="store_true"); ap.add_argument("--stills", default=""); ap.add_argument("--reuse-render", action="store_true")
a = ap.parse_args()
VID, OUT, PY = a.vid, f"{ROOT}/out/{a.vid}", sys.executable
V = f"{ROOT}/videos/{VID}"; HF = f"{OUT}/hf"; ENG = f"{ROOT}/engine/hyperframes"
HFBIN = f"{ROOT}/node_modules/.bin/hyperframes"
env = {**os.environ, "HYPERFRAMES_NO_TELEMETRY": "1", "DO_NOT_TRACK": "1"}
def run(*cmd, **kw): print("$", " ".join(cmd)); subprocess.run(cmd, check=True, cwd=kw.pop("cwd", ROOT), env=env, **kw)

def assemble(dst, clean=False):
    if os.path.exists(dst): shutil.rmtree(dst)
    os.makedirs(f"{dst}/assets/fonts")
    shutil.copy(f"{V}/hyperframes/index.html", f"{dst}/index.html")
    for extra in os.listdir(f"{V}/hyperframes"):
        if extra not in ("index.html", "shots.json"):
            s = f"{V}/hyperframes/{extra}"
            (shutil.copytree if os.path.isdir(s) else shutil.copy)(s, f"{dst}/assets/{extra}")
    shutil.copy(f"{ENG}/lib.js", f"{dst}/assets/lib.js"); shutil.copy(f"{ENG}/grain.png", f"{dst}/assets/grain.png")
    shutil.copy(f"{ENG}/hyperframes.json", f"{dst}/hyperframes.json")
    shutil.copy(f"{ROOT}/node_modules/gsap/dist/gsap.min.js", f"{dst}/assets/gsap.min.js")
    shutil.copy(f"{ROOT}/assets/fonts/Anton-Regular.ttf", f"{dst}/assets/fonts/Anton-Regular.ttf")
    # THE MIRROR series (23/11/2026): "hijacked signal" overlay + its mono fonts. Unused by regular Shorts.
    shutil.copy(f"{ENG}/mirror.js", f"{dst}/assets/mirror.js")
    for fnt in ("VT323-Regular.woff2", "IBMPlexMono-Bold.woff2"): shutil.copy(f"{ROOT}/assets/fonts/{fnt}", f"{dst}/assets/fonts/{fnt}")
    tm = json.load(open(f"{OUT}/timing.json")); shots = json.load(open(f"{OUT}/shots.json"))
    words = {s["i"]: [round(w["s"], 3) for w in s["words"]] for s in tm["sentences"]}
    with open(f"{dst}/assets/timing.js", "w") as f:
        f.write("window.TIMING_FULL=" + json.dumps(tm) + ";\nwindow.TIMING=" + json.dumps(words) + ";\nwindow.SHOTS=" + json.dumps(shots) + ";\n")
        if clean: f.write("window.XR_CLEAN=true;document.documentElement.classList.add('clean');\n")
    if os.path.exists(f"{OUT}/mix.wav"): shutil.copy(f"{OUT}/mix.wav", f"{dst}/assets/mix.wav")
    json.dump({"id": VID, "name": VID}, open(f"{dst}/meta.json", "w"))

def shots_file():
    sh = json.load(open(f"{V}/hyperframes/shots.json")); tm = json.load(open(f"{OUT}/timing.json"))
    end = round(tm["total"] + 0.12, 3)
    out = [{"id": s["id"], "start": s["start"], "end": sh[i + 1]["start"] if i + 1 < len(sh) else end} for i, s in enumerate(sh)]
    json.dump(out, open(f"{OUT}/shots.json", "w"), indent=1)

if not os.path.exists(HFBIN): sys.exit("HyperFrames is not installed: run `npm install` (package.json pins hyperframes and gsap)")
os.makedirs(OUT, exist_ok=True)
if a.mode == "clean":
    T = float(a.t); dst = f"{OUT}/hf_clean"
    if not os.path.exists(f"{dst}/index.html"): assemble(dst, clean=True)
    os.makedirs(f"{OUT}/frames", exist_ok=True)
    run(HFBIN, "snapshot", "--at", f"{T}", "--no-end", "-o", f"{OUT}/frames/_snap", cwd=dst)
    png = [p for p in os.listdir(f"{OUT}/frames/_snap") if p.endswith(".png")][0]
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/frames/_snap/{png}", "-q:v", "2", f"{OUT}/frames/c_{T:06.2f}.jpg"], check=True)
    shutil.rmtree(f"{OUT}/frames/_snap"); print("clean frame", f"{OUT}/frames/c_{T:06.2f}.jpg"); sys.exit(0)

t0 = time.time()
if not a.skip_voice: run(PY, "tools/voice.py", VID)
shots_file()
run(PY, "tools/mix.py", VID)
assemble(HF)
run(HFBIN, "lint", cwd=HF)
if a.stills:
    run(HFBIN, "snapshot", "--at", a.stills, "--no-end", "-o", f"{OUT}/stills", cwd=HF); print("stills in", f"{OUT}/stills"); sys.exit(0)
raw = f"{OUT}/hf_raw.mp4"
if not (a.reuse_render and os.path.exists(raw)): run(HFBIN, "render", "-o", raw, cwd=HF)
final = f"{OUT}/{VID}.mp4"
run("ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-i", f"{OUT}/mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-maxrate", "4800k", "-bufsize", "9600k", "-bf", "0", "-pix_fmt", "yuv420p", "-r", "30",
    "-af", "alimiter=limit=0.7:attack=1:release=60:level=false", "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-shortest", "-movflags", "+faststart", "-use_editlist", "0", final)
shutil.rmtree(f"{OUT}/hf_clean", ignore_errors=True)
meta = json.load(open(f"{V}/meta.json"))
if meta.get("thumbnail"): run(PY, "tools/thumbnail.py", VID)
else: run("ffmpeg", "-y", "-loglevel", "error", "-ss", str(meta.get("thumb_time", 1.0)), "-i", final, "-frames:v", "1", "-q:v", "2", f"{OUT}/thumb.jpg")
run(PY, "tools/review.py", VID)
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final]).decode())
print(f"\nDONE {final}  {dur:.1f}s  ({time.time() - t0:.0f}s)")
if not a.no_publish:
    P = f"{ROOT}/publish/{VID}"; os.makedirs(P, exist_ok=True)
    shutil.copy(final, f"{P}/video.mp4"); shutil.copy(f"{OUT}/thumb.jpg", f"{P}/thumb.jpg")
    pub = {k: meta[k] for k in meta if k not in ("thumb_time", "notes")}
    pub.update(id=VID, duration_s=round(dur, 2), status=meta.get("status", "needs_approval"))
    json.dump(pub, open(f"{P}/metadata.json", "w"), indent=2, ensure_ascii=False)
    print("publish package:", P, "-> qa.py, handoff.py, then commit and push")

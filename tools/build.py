"""Builds a finished Short from videos/<id>/ end to end.
  1 narration (voice.py)   2 shot list   3 render all shots in parallel   4 sound mix
  5 join + mux             6 thumbnail (tools/thumbnail.py)   7 review sheet                    8 publish package for Make
Usage: python tools/build.py <video-id> [--workers 2] [--only s03,s05] [--no-publish]
Output: out/<id>/<id>.mp4, out/<id>/thumb.jpg, out/<id>/review.jpg, publish/<id>/ (video.mp4, thumb.jpg, metadata.json)"""
import sys, os, json, subprocess, argparse, shutil, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("vid"); ap.add_argument("--workers", type=int, default=2)
ap.add_argument("--only", default=""); ap.add_argument("--no-publish", action="store_true"); a = ap.parse_args()
VID, OUT, PY = a.vid, f"{ROOT}/out/{a.vid}", sys.executable
def run(*cmd, **kw): print("$", " ".join(cmd)); subprocess.run(cmd, check=True, cwd=ROOT, **kw)
t0 = time.time()
if not a.only:
    run(PY, "tools/voice.py", VID)
run(PY, "tools/render.py", VID, "list")
shots = json.load(open(f"{OUT}/shots.json")); ids = [s["id"] for s in shots]
todo = a.only.split(",") if a.only else ids
groups = [todo[i::a.workers] for i in range(a.workers)]
procs = [subprocess.Popen([PY, "tools/render.py", VID, "shot", *g], cwd=ROOT, env={**os.environ, "PORT": str(8765 + i)}) for i, g in enumerate(groups) if g]
if any(p.wait() for p in procs): sys.exit("a shot failed to render")
run(PY, "tools/mix.py", VID)
with open(f"{OUT}/list.txt", "w") as f:
    for i in ids: f.write(f"file 'shots/{i}.mp4'\n")
run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt", "-c", "copy", f"{OUT}/video.mp4")
final = f"{OUT}/{VID}.mp4"
run("ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/video.mp4", "-i", f"{OUT}/mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-shortest", "-movflags", "+faststart", "-use_editlist", "0", final)  # Instagram Reels spec: AAC 128k, <=48 kHz, moov first, no edit lists
meta = json.load(open(f"{ROOT}/videos/{VID}/meta.json"))
if meta.get("thumbnail"):   # custom clickable thumbnail (tools/thumbnail.py); plain frame only as a fallback
    run(PY, "tools/thumbnail.py", VID)
else:
    run("ffmpeg", "-y", "-loglevel", "error", "-ss", str(meta.get("thumb_time", 1.0)), "-i", final, "-frames:v", "1", "-q:v", "2", f"{OUT}/thumb.jpg")
run(PY, "tools/review.py", VID)
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final]).decode())
lufs = subprocess.run(["ffmpeg", "-hide_banner", "-i", final, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = [l for l in lufs.split("\n") if " I:" in l][-1].split("I:")[1].strip()
print(f"\nDONE {final}  {dur:.1f}s  loudness {lufs}  ({time.time()-t0:.0f}s)")
if dur > 59: print("WARNING: longer than 59 s, YouTube may not treat it as a Short")
if not a.no_publish:
    P = f"{ROOT}/publish/{VID}"; os.makedirs(P, exist_ok=True)
    shutil.copy(final, f"{P}/video.mp4"); shutil.copy(f"{OUT}/thumb.jpg", f"{P}/thumb.jpg")
    pub = {k: meta[k] for k in meta if k not in ("thumb_time", "notes")}
    pub.update(id=VID, duration_s=round(dur, 2), status=meta.get("status", "needs_approval"))
    json.dump(pub, open(f"{P}/metadata.json", "w"), indent=2, ensure_ascii=False)
    print("publish package:", P, "-> commit and push it; Make picks it up from GitHub")

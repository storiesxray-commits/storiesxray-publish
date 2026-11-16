"""Instagram/Facebook version of a finished video: the custom cover as the very FIRST frame.
Instagram (Make "Create a reel post") can only pick a cover frame (thumb_offset); Facebook Reels uses the first frame.
So the cover is baked in as frame 0 (one frame = 33 ms, audio delayed by the same amount) and XR-03 posts with thumb_offset 0.

1. python tools/thumbnail.py <id> --social   -> out/<id>/cover_social.jpg (3:4-safe: the IG profile grid crops rows 240..1680;
   tune it with an optional "social_thumbnail" block in meta.json, same keys as "thumbnail")
2. out/<id>/<id>.mp4 + cover -> out/<id>/<id>_social.mp4 (H.264 <= 4.8 Mbps, AAC 128k 48 kHz, faststart, no edit list)
3. copies both to publish/<id>/video_social.mp4 and cover_social.jpg if publish/<id>/ exists.
Usage: python tools/social.py <video-id>"""
import sys, os, subprocess, shutil, json, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; OUT = f"{ROOT}/out/{VID}"; P = f"{ROOT}/publish/{VID}"
def run(*c): print("$", " ".join(c)); subprocess.run(c, check=True, cwd=ROOT)
run(sys.executable, "tools/thumbnail.py", VID, "--social")
src, cover, dst = f"{OUT}/{VID}.mp4", f"{OUT}/cover_social.jpg", f"{OUT}/{VID}_social.mp4"
fc = ("[0:v]trim=end_frame=1,scale=1080:1920,format=yuv420p,setsar=1,setpts=PTS-STARTPTS[c];"
      "[1:v]format=yuv420p,setsar=1,setpts=PTS-STARTPTS[m];[c][m]concat=n=2:v=1:a=0[v];[1:a]adelay=33|33[a]")
run("ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-i", cover, "-i", src, "-filter_complex", fc,
    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-maxrate", "4800k", "-bufsize", "9600k",
    "-r", "30", "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-movflags", "+faststart", "-use_editlist", "0", dst)
n = lambda f: int(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=nb_frames", "-of", "csv=p=0", f]).decode())
if n(dst) != n(src) + 1: sys.exit(f"social video has {n(dst)} frames, expected {n(src) + 1}")
json.dump({"sha256": hashlib.sha256(open(dst, "rb").read()).hexdigest(), "frames": n(dst), "cover_sha256": json.load(open(f"{OUT}/cover_social_report.json"))["sha256"]},
          open(f"{OUT}/social_report.json", "w"), indent=1)
if os.path.isdir(P):
    shutil.copy(dst, f"{P}/video_social.mp4"); shutil.copy(cover, f"{P}/cover_social.jpg")
print("social video", dst, os.path.getsize(dst), "bytes; cover = frame 0")

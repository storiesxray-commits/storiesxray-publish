"""Quality review sheets for a finished video (see QUALITY.md).
  out/<id>/review.jpg      contact sheet, one frame every ~1.1 s
  out/<id>/review_mid.jpg  full-size middle frame of every shot, side by side in rows of 6
Usage: python tools/review.py <video-id>"""
import sys, os, json, subprocess, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; OUT = f"{ROOT}/out/{VID}"; final = f"{OUT}/{VID}.mp4"
shots = json.load(open(f"{OUT}/shots.json"))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", final, "-vf", "fps=1/1.12,scale=270:-1,tile=10x4", "-frames:v", "1", "-q:v", "3", f"{OUT}/review.jpg"], check=True)
os.makedirs(f"{OUT}/review", exist_ok=True); files = []
for s in shots:
    t = (s["start"] + s["end"]) / 2; f = f"{OUT}/review/{s['id']}.jpg"; files.append(f)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", final, "-frames:v", "1", "-vf", "scale=360:-1", "-q:v", "3", f], check=True)
cols = 6; rows = math.ceil(len(files) / cols); inputs = []
for f in files: inputs += ["-i", f]
pad = cols * rows - len(files)
fc = "".join(f"[{i}]" for i in range(len(files))) + (f"color=black:s=360x640:d=1[blk];" if pad else "")
layout = "|".join(f"{(i % cols) * 360}_{(i // cols) * 640}" for i in range(len(files)))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", f"{''.join(f'[{i}]' for i in range(len(files)))}xstack=inputs={len(files)}:layout={layout}:fill=black", "-q:v", "3", f"{OUT}/review_mid.jpg"], check=True)
print("review sheets:", f"{OUT}/review.jpg", f"{OUT}/review_mid.jpg")

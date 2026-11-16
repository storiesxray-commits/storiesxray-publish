"""Remake ONLY the thumbnail of an already-built video and refresh its publish package.
Runs tools/thumbnail.py (all checks + variants), copies thumb.jpg to publish/<id>/ and updates only the
"thumbnail" block of publish/<id>/metadata.json (status, title, schedule... untouched). Video and audio are not rebuilt.
If the video is already on YouTube, the new file still has to reach YouTube (Studio upload or XR-02 re-set).
Usage: python tools/rethumb.py <video-id>"""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; P = f"{ROOT}/publish/{VID}"
subprocess.run([sys.executable, f"{ROOT}/tools/thumbnail.py", VID], check=True)
shutil.copy(f"{ROOT}/out/{VID}/thumb.jpg", f"{P}/thumb.jpg")
meta = json.load(open(f"{ROOT}/videos/{VID}/meta.json")); pub = json.load(open(f"{P}/metadata.json"))
pub["thumbnail"] = meta["thumbnail"]
json.dump(pub, open(f"{P}/metadata.json", "w"), indent=2, ensure_ascii=False)
print("publish thumbnail updated:", f"{P}/thumb.jpg", "status stays", pub.get("status"))

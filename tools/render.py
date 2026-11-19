"""Frame renderer: drives engine/player.html in headless Chrome and encodes one MP4 per shot.
Usage:
  python tools/render.py <video-id> list                 -> prints shots, writes out/<id>/shots.json
  python tools/render.py <video-id> stills 1.2 5.0 ...   -> full-size JPEG frames in out/<id>/frames/
  python tools/render.py <video-id> clean 1.2 5.0 ...    -> same, without titles/captions (out/<id>/frames/c_*.jpg, for thumbnails)
  python tools/render.py <video-id> shot s01 s02 ...     -> out/<id>/shots/<shot>.mp4
Env: CHROME (browser path, default: playwright's Chromium), PORT (default 8765)."""
import sys, subprocess, time, os, json, socket
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID, MODE, ARGS = sys.argv[1], sys.argv[2], sys.argv[3:]
OUT = f"{ROOT}/out/{VID}"; os.makedirs(f"{OUT}/frames", exist_ok=True); os.makedirs(f"{OUT}/shots", exist_ok=True)
PORT = int(os.environ.get("PORT", "8765")); FPS = 30
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(50):
    try: socket.create_connection(("127.0.0.1", PORT), 0.2).close(); break
    except OSError: time.sleep(0.1)
try:
    with sync_playwright() as p:
        kw = dict(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox"])
        if os.environ.get("CHROME"): kw["executable_path"] = os.environ["CHROME"]
        elif os.path.exists("/usr/bin/google-chrome"): kw["executable_path"] = "/usr/bin/google-chrome"
        b = p.chromium.launch(**kw)
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        try: STYLE = os.environ.get("RENDER_STYLE") or json.load(open(f"{ROOT}/videos/{VID}/meta.json")).get("render_style", "toon")
        except Exception: STYLE = os.environ.get("RENDER_STYLE", "toon")
        pg.goto(f"http://127.0.0.1:{PORT}/engine/player.html?v={VID}&style={STYLE}" + os.environ.get("RENDER_EXTRA", "") + ("&clean=1" if MODE == "clean" else ""))
        try: pg.wait_for_function("window.READY===true", timeout=60000)
        except Exception: print("LOAD FAILED:", errs); raise
        shots = pg.evaluate("window.SHOTS")
        if MODE == "list":
            json.dump(shots, open(f"{OUT}/shots.json", "w"), indent=1)
            for s in shots: print(f'{s["id"]:6s} {s["start"]:7.3f} -> {s["end"]:7.3f}  ({s["end"]-s["start"]:.2f}s)')
        elif MODE in ("stills", "clean"):
            pre = "c" if MODE == "clean" else "f"
            for T in ARGS:
                sid = pg.evaluate(f"window.renderAt({float(T)})")
                pg.screenshot(path=f"{OUT}/frames/{pre}_{float(T):06.2f}.jpg", type="jpeg", quality=95); print(T, sid)
        elif MODE == "shot":
            for sid in ARGS:
                s = [x for x in shots if x["id"] == sid][0]; f0 = round(s["start"] * FPS); f1 = round(s["end"] * FPS)
                tmp, out = f"{OUT}/shots/{sid}.tmp.mp4", f"{OUT}/shots/{sid}.mp4"
                ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(FPS), "-i", "-",
                                       "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp], stdin=subprocess.PIPE)
                t0 = time.time()
                for f in range(f0, f1):
                    pg.evaluate(f"window.renderAt({(f + 0.5) / FPS})"); ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
                ff.stdin.close(); rc = ff.wait()
                if rc == 0: os.replace(tmp, out)
                print(f"{sid}: {f1-f0} frames in {time.time()-t0:.0f}s rc={rc}", flush=True)
                if rc: sys.exit(rc)
        real = [e for e in errs if "GL_CLOSE_PATH_NV" not in e and "GPU stall" not in e]
        if real: print("PAGE ERRORS:", real[:8]); sys.exit(2)
        b.close()
finally:
    srv.terminate()

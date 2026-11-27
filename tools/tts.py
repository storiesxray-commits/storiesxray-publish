"""ElevenLabs narration through Make (the production sandbox cannot reach api.elevenlabs.io directly).

Flow (see NEW_VIDEO.md step 4):
  1. python tools/tts.py request <video-id>
       -> prints the JSON input for Make scenario XR-07-ELEVENLABS-TTS (voice_id, out_name, payload_b64).
  2. Run XR-07 with that input (Make MCP: scenarios_run, responsive: true).
       Make calls ElevenLabs /with-timestamps and commits tts/<out_name>.mp3 + tts/<out_name>.json to main.
  3. git pull --rebase, then python tools/voice.py <video-id>
       voice.py finds the files (same script hash) and builds voice.wav + timing.json from them.
       If they are missing it falls back to kokoro and says so.

Voice choice: script.json "voice" (xr1/xr2/xr3, see tools/voices.json) or, if absent or a kokoro name,
the rotation by video number. Audio tags such as [whispers] [laughs] [gasps] [sighs] may go inside a
sentence for eleven_v3; they are spoken as performance, never shown in captions and not counted as words.
"""
import json, os, re, sys, hashlib, base64
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(f"{ROOT}/tools/voices.json"))
TAG = re.compile(r"\[[^\]]*\]")

def pick_voice(vid, script):
    v = script.get("voice")
    if v in CFG["voices"]:
        return v
    m = re.match(r"xr(\d+)", vid)
    n = int(m.group(1)) if m else 0
    tone = script.get("tone")
    if tone in CFG.get("casting", {}):  # owner 21/11/2026: voice by topic tone, not by rotation
        return CFG["casting"][tone]["voices"][0]
    rot = [v for v in CFG["rotation"] if not CFG["voices"][v].get("deleted")]
    return rot[n % len(rot)]

def full_text(script):
    return " ".join(s[0].strip() for s in script["sentences"])

def out_name(vid, script):
    # "tts_id" (optional): reuse the narration already generated for another video id with the same text
    # (test renders of a new visual engine must not spend ElevenLabs credits or change the voice).
    vid = script.get("tts_id", vid)
    key = pick_voice(vid, script)
    h = hashlib.sha1((key + "|" + CFG["model"] + "|" + full_text(script) + (f"|seed{script['seed']}" if script.get("seed") is not None else "")).encode()).hexdigest()[:10]
    return f"{vid}-{key}-{h}", key

def request(vid):
    script = json.load(open(f"{ROOT}/videos/{vid}/script.json"))
    name, key = out_name(vid, script)
    v = CFG["voices"][key]
    body = {"text": full_text(script), "model_id": CFG["model"],
            "voice_settings": {"stability": v.get("stability", 0.5), "similarity_boost": 0.8}}
    if script.get("seed") is not None:
        body["seed"] = int(script["seed"])
    payload = base64.b64encode(json.dumps(body, ensure_ascii=False).encode()).decode()
    print(json.dumps({"voice_id": v["voice_id"], "out_name": name, "payload_b64": payload}, indent=1))
    print(f"# voice {key} = {v['name']}  ({len(body['text'])} chars)", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] != "request":
        sys.exit("usage: python tools/tts.py request <video-id>")
    request(sys.argv[2])

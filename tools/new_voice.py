"""Design a NEW ElevenLabs narrator and add it to the rotation (owner's rule, 16/11/2026: keep testing ever more
histrionic voices). The sandbox cannot reach ElevenLabs, so Make XR-08-ELEVENLABS-NEW-VOICE does the calls.

  1. python tools/new_voice.py request xr4 "XR Narrator 4 - <Nickname>" "<voice description, 20-1000 chars>"
       -> prints the JSON input for Make XR-08 (key, design_b64, create_b64).
  2. Run XR-08 (scenarios_run, responsive: true) with that JSON. Make designs the voice with eleven_ttv_v3,
     saves the first preview as a voice in the owner's account and commits tts/voices/<key>.json (voice_id).
  3. git pull --rebase && python tools/new_voice.py register xr4 "XR Narrator 4 - <Nickname>" "<style line>" [stability]
       -> adds it to tools/voices.json (voices + rotation). Commit tools/voices.json.

Rules (topics/PLAYBOOK.md, "Narradores"): voices are ALWAYS designed from a text description (never a clone of a
real person, never a celebrity sound-alike, never a Voice Library voice), so the owner owns them and can monetize.
"""
import json, os, sys, base64
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VJ = f"{ROOT}/tools/voices.json"
PREVIEW = ("Okay, okay, listen to this. You are NOT going to believe what happened. [gasps] In 1518, a woman walks into "
           "the street and starts dancing. No music. No reason. [whispers] And she can't stop. [laughs] Then four hundred "
           "people join her! The city's solution? They hired a BAND. I'm not kidding. Stay with me, it gets so much weirder.")
BANNED = ["clone", "impression of", "sound like", "sounds like", "imitat", "celebrity", "famous"]

def b64(o): return base64.b64encode(json.dumps(o, ensure_ascii=False).encode()).decode()

PREVIEWS = {  # owner 21/11/2026: the voice must fit the topic, not always histrionic -> preview text in the voice's own tone
    "calm": ("It left Earth in 1977. [pause] Since then, it has never stopped moving. Today it is so far away that its "
             "signal, travelling at the speed of light, needs a whole day to reach us. [softly] A whole day. And it is still "
             "talking to us, with less memory than one photo on your phone. Think about that for a second."),
    "suspense": ("Nobody noticed at first. [whispers] The door was locked from the inside. The lights were still on. And the "
                 "cup of coffee on the table... was still warm. [pause] Police searched for three days. What they found in the "
                 "basement changed the story completely. Stay with me, because this part is real."),
    "insider": ("Here's what they don't tell you. That free refill? It costs them less than two cents. The real money is in "
                "the cup, the lid and the forty seconds you wait at the counter, looking at the dessert case. [chuckles] "
                "Every inch of that store is designed to make you spend. And it works on everybody. Even you."),
}
def request(key, name, desc, preview=None):
    low = desc.lower()
    if any(b in low for b in BANNED):
        sys.exit("ERROR: the description must describe an original voice, not imitate a real/famous person")
    if not 20 <= len(desc) <= 1000: sys.exit("ERROR: description must be 20-1000 chars")
    cfg = json.load(open(VJ))
    if key in cfg["voices"]: sys.exit(f"ERROR: {key} already exists")
    design = {"voice_description": desc, "model_id": "eleven_ttv_v3", "text": PREVIEWS.get(preview, PREVIEW), "stream_previews": True}
    create = {"voice_name": name, "voice_description": desc[:1000], "generated_voice_id": "__GEN__",
              "labels": {"project": "stories-xray", "language": "en"}}
    print(json.dumps({"key": key, "design_b64": b64(design), "create_b64": b64(create)}, indent=1))

def register(key, name, style, stability=0.3):
    path = f"{ROOT}/tts/voices/{key}.json"
    if not os.path.exists(path): sys.exit(f"ERROR: {path} missing: run Make XR-08 and git pull first")
    vid = json.load(open(path))["voice_id"]
    if not vid: sys.exit("ERROR: empty voice_id (XR-08 failed or plan is Free)")
    cfg = json.load(open(VJ))
    cfg["voices"][key] = {"name": name, "voice_id": vid, "style": style, "stability": float(stability)}
    if key not in cfg["rotation"]: cfg["rotation"].append(key)
    json.dump(cfg, open(VJ, "w"), indent=1, ensure_ascii=False)
    print("registered", key, vid, "rotation =", cfg["rotation"])

if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) in (4, 5) and a[0] == "request": request(a[1], a[2], a[3], a[4] if len(a) == 5 else None)
    elif len(a) in (4, 5) and a[0] == "register": register(*a[1:])
    else: sys.exit(__doc__)

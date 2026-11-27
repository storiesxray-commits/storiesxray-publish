"""Narration: videos/<id>/script.json -> out/<id>/voice.wav + out/<id>/timing.json
Engine 1 (default since 16/11/2026): ElevenLabs eleven_v3 voices from tools/voices.json, fetched through
Make (tools/tts.py explains the flow). Word timings come from ElevenLabs character alignment.
Engine 2 (fallback): local kokoro-onnx; per-word timings anchored to the real pauses in the audio.
Usage: python tools/voice.py <video-id> [--kokoro]"""
import json, numpy as np, soundfile as sf, re, sys, os, base64, subprocess, difflib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f"{ROOT}/tools")
import tts as TTS
VID = sys.argv[1]; cfg = json.load(open(f"{ROOT}/videos/{VID}/script.json"))
OUT = f"{ROOT}/out/{VID}"; os.makedirs(OUT, exist_ok=True)
S = [tuple(x) for x in cfg["sentences"]]
TAG = re.compile(r"\[[^\]]*\]")
clean = lambda x: re.sub(r"\s+", " ", TAG.sub(" ", x)).strip()

def elevenlabs():
    name, key = TTS.out_name(VID, cfg)
    mp3, js = f"{ROOT}/tts/{name}.mp3", f"{ROOT}/tts/{name}.json"
    if not (os.path.exists(mp3) and os.path.exists(js)):
        print(f"WARNING: no ElevenLabs audio at tts/{name}.* -> run `python tools/tts.py request {VID}` + Make XR-07, then git pull")
        return False
    sr = 24000
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, dtype=np.float32).copy()
    al = json.load(open(js)); chars = base64.b64decode(al["chars_b64"]).decode("utf-8"); cs, ce = al["s"], al["e"]
    text = TTS.full_text(cfg)
    if chars == text: amap = list(range(len(text)))
    else:  # map text index -> alignment index
        amap = [None] * len(text)
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, text, chars, autojunk=False).get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1): amap[i1 + k] = j1 + k
        last = 0
        for k in range(len(text)):
            if amap[k] is None: amap[k] = last
            last = amap[k]
        print("NOTE: alignment text differs from script text; mapped by diff")
    T = lambda k, arr: float(arr[min(amap[k], len(arr) - 1)])
    sents = []; off = 0
    for txt, pause in S:
        txt = txt.strip(); blank = TAG.sub(lambda m: " " * len(m.group(0)), txt)
        ws = [(m.group(0), off + m.start(), off + m.end() - 1) for m in re.finditer(r"\S+", blank)]
        words = [dict(w=w, s=T(i0, cs), e=T(i1, ce)) for w, i0, i1 in ws]
        sents.append(dict(text=clean(txt), pause=pause, words=words, first_char=T(off, cs)))
        off += len(txt) + 1
    # cut the take into sentences: pre-word sounds (laughs, gasps) stay with the sentence they introduce
    # owner 21/11/2026 ("se cortan los videos"): never cut inside sound. ElevenLabs timestamps can run early or late by
    # a few hundred ms, so each cut goes to the QUIETEST 10 ms point between the two sentences (searched a little
    # beyond the timestamps), and every segment gets 6 ms fades so a cut can never click.
    L = len(a) / sr; mono = a if a.ndim == 1 else a.mean(axis=1)
    def quietest(t0, t1):
        i0, i1 = max(0, int(t0 * sr)), min(len(mono), int(t1 * sr)); w = int(0.01 * sr)
        if i1 - i0 <= w: return (t0 + t1) / 2
        e = np.convolve(mono[i0:i1] ** 2, np.ones(w) / w, mode="valid"); return (i0 + int(np.argmin(e)) + w // 2) / sr
    cuts = [quietest(max(0.0, sents[0]["first_char"] - 0.25), sents[0]["words"][0]["s"] + 0.02)]
    for i in range(1, len(sents)):
        e0, s1 = sents[i - 1]["words"][-1]["e"], sents[i]["words"][0]["s"]
        c = quietest(min(e0, s1) - 0.04, max(e0, s1) + 0.12)
        lv = lambda x: 20 * np.log10(np.sqrt(np.mean(mono[max(0, int((x - 0.01) * sr)):int((x + 0.01) * sr)] ** 2)) + 1e-9)
        if lv(c) > -40:  # timestamps ran late (xr025 "Earth. Otherwise"): the real gap is earlier, search back to the last word's start
            c = quietest(max(sents[i - 1]["words"][-1]["s"] + 0.08, min(e0, s1) - 0.7), max(e0, s1) + 0.12)
        cuts.append(c)
    cuts.append(L)  # the take always ends where ElevenLabs ended it (never trimmed)
    out = [np.zeros(int(sr * 0.03), dtype=np.float32)]; t = 0.03; meta = []; seams = []
    for i, se in enumerate(sents):
        c0, c1 = cuts[i], cuts[i + 1]; seg = a[int(c0 * sr):int(c1 * sr)].copy(); sh = t - c0
        fz = min(int(0.006 * sr), len(seg) // 4); ramp = np.linspace(0, 1, fz)
        if fz: seg[:fz] = (seg[:fz].T * ramp).T; seg[-fz:] = (seg[-fz:].T * ramp[::-1]).T
        nat = (sents[i + 1]["words"][0]["s"] - se["words"][-1]["e"]) if i + 1 < len(sents) else 0
        extra = max(0.0, se["pause"] - nat)
        ws = [dict(w=w["w"], s=round(w["s"] + sh, 3), e=round(w["e"] + sh, 3)) for w in se["words"]]
        meta.append(dict(i=i + 1, text=se["text"], start=ws[0]["s"], end=ws[-1]["e"], words=ws, gaps=1, punct=1))
        out.append(seg); out.append(np.zeros(int(sr * extra), dtype=np.float32)); seams.append(round(t + len(seg) / sr, 4)); t += len(seg) / sr + extra
    audio = np.concatenate(out); audio = audio / np.abs(audio).max() * 0.9
    # realign words to the real sound: a word whose timestamp window is silent starts at the next onset
    am = audio if audio.ndim == 1 else audio.mean(axis=1); W10 = int(0.01 * sr)
    lvl = lambda t0, t1: 20 * np.log10(np.sqrt(np.mean(am[int(t0 * sr):max(int(t0 * sr) + 1, int(t1 * sr))] ** 2)) + 1e-9)
    allw = [w for m in meta for w in m["words"]]
    for k, w in enumerate(allw):
        if lvl(w["s"], w["e"]) > -42: continue
        lim = allw[k + 1]["e"] if k + 1 < len(allw) else len(am) / sr
        t = w["s"]
        while t < lim and lvl(t, t + 0.01) < -36: t += 0.01
        if t < lim:
            d = round(t - 0.02 - w["s"], 3); nxt = allw[k + 1]["s"] if k + 1 < len(allw) else 1e9
            w["s"] = round(w["s"] + d, 3); w["e"] = round(max(w["s"] + 0.12, min(w["e"] + d, nxt)), 3)
        if k + 1 < len(allw) and allw[k + 1]["s"] < w["e"]: allw[k + 1]["s"] = w["e"]
    # ElevenLabs alignment can give a word that starts 10 ms before the previous one ("if" / "you", xr023): keep starts in order
    for k in range(1, len(allw)):
        if allw[k]["s"] < allw[k - 1]["s"]: allw[k]["s"] = allw[k - 1]["s"]
        if allw[k]["e"] < allw[k]["s"]: allw[k]["e"] = allw[k]["s"]
    for m in meta: m["start"], m["end"] = m["words"][0]["s"], m["words"][-1]["e"]
    sf.write(f"{OUT}/voice.wav", audio, sr)
    v = TTS.CFG["voices"][key]
    json.dump(dict(total=round(meta[-1]["end"] + 1.1, 3), voice=key, voice_key=key, voice_name=v["name"], engine="elevenlabs:" + TTS.CFG["model"],
                   tts_file=f"tts/{name}.mp3", seams=seams[:-1], sentences=meta), open(f"{OUT}/timing.json", "w"), indent=1)
    print("elevenlabs", key, v["name"], "total", round(meta[-1]["end"] + 1.1, 2))
    [print(m["i"], m["start"], m["end"], m["text"][:40]) for m in meta]
    return True

if "--kokoro" not in sys.argv and elevenlabs():
    sys.exit(0)

from kokoro_onnx import Kokoro
k = Kokoro(f"{ROOT}/models/kokoro-v1.0.onnx", f"{ROOT}/models/voices-v1.0.bin")
VOICE = cfg.get("voice", "am_michael")
if VOICE in TTS.CFG["voices"]: VOICE = cfg.get("kokoro_voice", "am_michael")
S = [(clean(x), p) for x, p in S]
sr=24000; out=[]; t=0.03; out.append(np.zeros(int(sr*t),dtype=np.float32)); meta=[]  # voice starts almost at frame 0 (opening rule 16/11/2026)
def trim(a,th=0.012):
    e=np.abs(a); idx=np.where(e>th)[0]
    return a[max(0,idx[0]-int(.02*sr)):min(len(a),idx[-1]+int(.06*sr))]
for i,(txt,pause) in enumerate(S):
    a,_=k.create(txt, voice=VOICE, speed=cfg.get("speed", 1.08), lang=cfg.get("lang", "en-us")); a=trim(a.astype(np.float32))
    d=len(a)/sr
    # word timing: anchor punctuation to real pauses in the audio, spread the rest by letters
    words=txt.split(); n=len(words)
    wt=lambda x: len(re.sub(r'[^A-Za-z]','',x))+1.5
    env_=np.convolve(np.abs(a),np.ones(int(.02*sr))/int(.02*sr),'same'); quiet=env_<0.02
    gaps=[]; i0=None
    for ii,q in enumerate(quiet):
        if q and i0 is None: i0=ii
        if (not q) and i0 is not None:
            if ii-i0>int(.09*sr) and i0>int(.15*sr) and ii<len(a)-int(.15*sr): gaps.append((i0/sr,ii/sr))
            i0=None
    punct=[j for j,x in enumerate(words[:-1]) if x[-1] in ',.:?']
    gaps=sorted(sorted(gaps,key=lambda g:g[0]-g[1])[:len(punct)]) if len(gaps)>=len(punct) else []
    bounds=[(0,0.0)]+[(punct[kq]+1,None) for kq in range(len(punct))]+[(n,d)]
    c=np.zeros(n+1); 
    if gaps:
        segs=[]; st_=0.0; wi=0
        for kq,pj in enumerate(punct):
            segs.append((wi,pj+1,st_,gaps[kq][0])); st_=gaps[kq][1]; wi=pj+1
        segs.append((wi,n,st_,d))
    else: segs=[(0,n,0.0,d)]
    ends=np.zeros(n)
    for (w0,w1,t0,t1) in segs:
        ww=np.array([wt(x) for x in words[w0:w1]]); cc=np.concatenate([[0],np.cumsum(ww)])/ww.sum()*(t1-t0)+t0
        for j in range(w0,w1): c[j]=cc[j-w0]; ends[j]=cc[j-w0+1]
    c[n]=d
    meta.append(dict(i=i+1,text=txt,start=round(t,3),end=round(t+d,3),
        words=[dict(w=x,s=round(t+c[j],3),e=round(t+ends[j],3)) for j,x in enumerate(words)],gaps=len(gaps),punct=len(punct)))
    out.append(a); out.append(np.zeros(int(sr*pause),dtype=np.float32)); t+=d+pause
audio=np.concatenate(out); audio=audio/np.abs(audio).max()*0.9
sf.write(f"{OUT}/voice.wav",audio,sr)
json.dump(dict(total=round(t+0.85,3),voice=VOICE,engine="kokoro",sentences=meta),open(f"{OUT}/timing.json","w"),indent=1)
bad=[m["i"] for m in meta if m["punct"] and m["gaps"]<m["punct"]]
if bad: print("WARNING: caption timing fell back to letter-count spread in sentences", bad)
print(VOICE,"total",round(t,2)); [print(m['i'],m['start'],m['end'],m['text'][:40]) for m in meta]

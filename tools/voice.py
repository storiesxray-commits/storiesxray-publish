"""Narration: videos/<id>/script.json -> out/<id>/voice.wav + out/<id>/timing.json
Per-word timings are anchored to the real pauses in the audio (punctuation), so captions stay in sync.
Usage: python tools/voice.py <video-id>"""
import json, numpy as np, soundfile as sf, re, sys, os
from kokoro_onnx import Kokoro
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; cfg = json.load(open(f"{ROOT}/videos/{VID}/script.json"))
OUT = f"{ROOT}/out/{VID}"; os.makedirs(OUT, exist_ok=True)
k = Kokoro(f"{ROOT}/models/kokoro-v1.0.onnx", f"{ROOT}/models/voices-v1.0.bin")
VOICE = cfg.get("voice", "am_michael"); S = [tuple(x) for x in cfg["sentences"]]
sr=24000; out=[]; t=0.15; out.append(np.zeros(int(sr*t),dtype=np.float32)); meta=[]
def trim(a,th=0.012):
    e=np.abs(a); idx=np.where(e>th)[0]
    return a[max(0,idx[0]-int(.02*sr)):min(len(a),idx[-1]+int(.06*sr))]
for i,(txt,pause) in enumerate(S):
    a,_=k.create(txt, voice=VOICE, speed=cfg.get("speed", 1.04), lang=cfg.get("lang", "en-us")); a=trim(a.astype(np.float32))
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
json.dump(dict(total=round(t,3),voice=VOICE,sentences=meta),open(f"{OUT}/timing.json","w"),indent=1)
bad=[m["i"] for m in meta if m["punct"] and m["gaps"]<m["punct"]]
if bad: print("WARNING: caption timing fell back to letter-count spread in sentences", bad)
print(VOICE,"total",round(t,2)); [print(m['i'],m['start'],m['end'],m['text'][:40]) for m in meta]

"""Sound: synthesized effects + music under the narration, ducked and normalized to -14 LUFS.
Each video's videos/<id>/sound.py places cues with put(sound, time, gain, pan=...).
Available in sound.py: every sound function below, put, tm (timing), wd(i, j), cuts (shot start times), rng, TOT, MUSIC (dict to tweak).
Usage: python tools/mix.py <video-id>  -> out/<id>/mix.wav (+ level report per shot)"""
import numpy as np, soundfile as sf, json, sys, os, subprocess
from scipy import signal
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = sys.argv[1]; OUT = f"{ROOT}/out/{VID}"
SR = 48000; tm = json.load(open(f"{OUT}/timing.json")); TOT = tm["total"] + 0.12; N = int(SR * TOT)
SHOTS = json.load(open(f"{OUT}/shots.json")); cuts = [s["start"] for s in SHOTS[1:]]
def wd(i, j): return tm["sentences"][i - 1]["words"][j]["s"]
rng=np.random.default_rng(7)
def t_(d): return np.arange(int(SR*d))/SR
def lp(x,f,o=2): b,a=signal.butter(o,f/(SR/2)); return signal.lfilter(b,a,x)
def hp(x,f,o=2): b,a=signal.butter(o,f/(SR/2),'high'); return signal.lfilter(b,a,x)
def bp(x,f1,f2): b,a=signal.butter(2,[f1/(SR/2),f2/(SR/2)],'band'); return signal.lfilter(b,a,x)
def env(d,a=0.01,r=0.1): n=int(SR*d); e=np.ones(n); na=max(1,int(SR*a)); nr=max(1,int(SR*r)); e[:na]=np.linspace(0,1,na); e[-nr:]*=np.linspace(1,0,nr); return e
L=np.zeros(N); R=np.zeros(N)
def put(x,t0,g=1.0,pan=0.0):
    i=int(SR*t0); 
    if i>=N: return
    x=x[:N-i]; L[i:i+len(x)]+=x*g*(1-max(0,pan)); R[i:i+len(x)]+=x*g*(1+min(0,pan))
def thump(f=55,d=0.35,drop=0.5):
    t=t_(d); return np.sin(2*np.pi*(f*t - f*drop*t*t/d/2*1.0))*np.exp(-t*12)
def heartbeat(): 
    x=np.zeros(int(SR*0.5)); a=thump(105,0.3); b=thump(88,0.3)*0.7; x[:len(a)]+=a; j=int(SR*0.16); x[j:j+len(b)]+=b; return lp(x,450)
def whoosh(d=0.4):
    t=t_(d); n=rng.standard_normal(len(t)); f=np.linspace(400,3000,len(t)); 
    y=np.zeros(len(t)); 
    # time-varying bandpass via chunks
    k=8; seg=len(t)//k
    for i in range(k):
        s=slice(i*seg,(i+1)*seg if i<k-1 else len(t)); fc=f[s][0]; y[s]=bp(n,fc*0.6,fc*1.5)[s]
    return y*np.sin(np.pi*t/d)**2
def hiss(d=1.8):
    t=t_(d); return hp(rng.standard_normal(len(t)),2500)*(np.exp(-t*2.4))*env(d,0.004,0.2)
def zap(d=0.55):
    t=t_(d); f=80+420*(t/d)**2; ph=2*np.pi*np.cumsum(f)/SR; y=signal.sawtooth(ph)*0.5+np.sin(ph*2)*0.3; y=lp(y,2500)+bp(rng.standard_normal(len(t)),3000,7000)*0.15*(t/d)
    return y*env(d,0.02,0.08)*(0.3+0.7*t/d)
def bubble(f0):
    d=0.07+rng.random()*0.05; t=t_(d); f=f0*(1+1.2*t/d); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/d)**2
def boom(d=1.3):
    t=t_(d); return (np.sin(2*np.pi*(46*t-9*t*t))*np.exp(-t*3.2)+0.6*np.sin(2*np.pi*(120*t-40*t*t))*np.exp(-t*6)+lp(rng.standard_normal(len(t)),300)*0.5*np.exp(-t*7))
def hum(d):
    t=t_(d); y=sum(np.sin(2*np.pi*60*h*t)/h for h in (1,2,3,5)); y+=lp(rng.standard_normal(len(t)),300)*0.4; return y*env(d,0.25,0.25)
def rumble(d):
    t=t_(d); return lp(rng.standard_normal(len(t)),160,3)*2.5*env(d,0.3,0.4)*(1+0.3*np.sin(2*np.pi*0.3*t))
def airin(d=2.4):
    t=t_(d); return lp(hp(rng.standard_normal(len(t)),300),2600)*np.sin(np.pi*np.clip(t/d,0,1))**1.5
def alarm(d):
    t=t_(d); g=(np.sin(2*np.pi*1.75*t)>0).astype(float); g=lp(g,30); return (np.sin(2*np.pi*740*t)+0.4*np.sin(2*np.pi*1480*t))*g*env(d,0.02,0.1)
def thud(): t=t_(0.4); return (np.sin(2*np.pi*(70*t-60*t*t))*np.exp(-t*14)+lp(rng.standard_normal(len(t)),400)*np.exp(-t*30)*0.6)
def click(f=1800,d=0.03): t=t_(d); return np.sin(2*np.pi*f*t)*np.exp(-t*160)
def blip(f=1400,d=0.07): t=t_(d); return np.sin(2*np.pi*(f*t+f*0.6*t*t/d))*np.sin(np.pi*t/d)**2
def bell(f): t=t_(0.9); return (np.sin(2*np.pi*f*t)+0.5*np.sin(2*np.pi*f*2.01*t))*np.exp(-t*6)
def splash(d=0.9): t=t_(d); return bp(rng.standard_normal(len(t)),500,5000)*np.exp(-t*5)*env(d,0.004,0.2)
def under(d): t=t_(d); return lp(rng.standard_normal(len(t)),350,3)*3*env(d,0.3,0.3)
def trickle(d): t=t_(d); return bp(rng.standard_normal(len(t)),900,3500)*env(d,0.3,0.3)*(0.6+0.4*np.sin(2*np.pi*7*t))
def sweep(f0,f1,d): t=t_(d); f=np.linspace(f0,f1,len(t)); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(d,0.05,0.2)
def tick(hi=True): t=t_(0.04); return np.sin(2*np.pi*(2200 if hi else 1500)*t)*np.exp(-t*120)
def glass(): t=t_(0.12); return (np.sin(2*np.pi*3100*t)+0.5*np.sin(2*np.pi*4700*t))*np.exp(-t*45)
def beep(f=1000,d=0.12): t=t_(d); return np.sin(2*np.pi*f*t)*env(d,0.005,0.03)
def paper(d=0.12): t=t_(d); return hp(rng.standard_normal(len(t)),3000)*np.exp(-t*30)

# music defaults: dark drone, rising tension, optional warm resolve and a near-silent dip before a reveal
MUSIC = dict(tension_start=10.0, tension_len=24.0, resolve=None, dip=None, dip_w=0.4)
ns = dict(globals()); code = open(f"{ROOT}/videos/{VID}/sound.py").read()
code = "\n".join(l for l in code.split("\n") if not l.startswith("cuts=["))   # cut times now come from the shot list
exec(code, ns); MUSIC = ns["MUSIC"]
sfxL, sfxR = L.copy() * 0.42, R.copy() * 0.42
t = np.arange(N) / SR
def pad(freqs, det=0.3):
    y = np.zeros(N)
    for f in freqs:
        for d in (-det, 0, det): y += np.sin(2 * np.pi * (f + d) * t + rng.uniform(0, 6))
    return y / len(freqs) / 3
dark = pad([55, 82.41, 110, 130.81, 164.81]); warm = pad([55, 110, 138.59, 164.81, 220, 277.18])
tens = np.clip((t - MUSIC["tension_start"]) / MUSIC["tension_len"], 0, 1)
hi = lp(pad([659.25, 987.77], 0.7), 1500) * 0.25 * tens
xm = np.clip((t - MUSIC["resolve"]) / 0.8, 0, 1) if MUSIC["resolve"] else np.zeros(N)
mus = (dark * (1 - xm) + hi * (1 - xm) + warm * xm * 1.1) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t))
puls = (np.sin(2 * np.pi * 55 * t) * (np.maximum(0, np.sin(2 * np.pi * 1.0 * t)) ** 6)) * 0.5 * np.clip((t - 11.5) / 3, 0, 1) * (1 - xm)
mus = lp(mus + puls, 1800)
menv = np.clip(t / 0.4, 0, 1)
if MUSIC["dip"]: menv = menv * (1 - 0.92 * np.clip(1 - np.abs(t - MUSIC["dip"]) / MUSIC["dip_w"], 0, 1))
menv = menv * (np.clip((TOT - t) / 0.25, 0, 1) * 0.6 + 0.4); mus = mus * menv
v, sr = sf.read(f"{OUT}/voice.wav"); v = signal.resample_poly(v, SR // sr if SR % sr == 0 else 2, 1); v = np.pad(v, (0, max(0, N - len(v))))[:N]
v = hp(v, 70); v = v / np.abs(v).max() * 0.89
ve = lp(np.abs(v), 6); duck = 1 - 0.45 * np.clip(ve / 0.08, 0, 1)
MG = 0.075
bedL = mus * MG * duck + sfxL * duck ** 0.5; bedR = np.roll(mus, 137) * MG * duck + sfxR * duck ** 0.5
out = np.stack([v + bedL, v + bedR], 1); out = np.tanh(out * 1.1) / 1.1; pk = np.abs(out).max(); out = out / pk * 0.95
sf.write(f"{OUT}/mix_raw.wav", out, SR)
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
bed = np.stack([bedL, bedR], 1) / pk * 0.95; worst = 99
for s in SHOTS:
    a, b = int(s["start"] * SR), int(s["end"] * SR); gap = db(out[a:b]) - db(bed[a:b]); worst = min(worst, gap)
    print(f'{s["id"]:6s} mix {db(out[a:b]):6.1f} dB   bed {db(bed[a:b]):6.1f} dB   voice margin {gap:4.1f} dB{"   <-- LOW" if gap < 4 else ""}')
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", "48000", f"{OUT}/mix.wav"], check=True)
print("mix.wav written; smallest voice margin", round(worst, 1), "dB")

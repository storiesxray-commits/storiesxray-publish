def st(i): return tm["sentences"][i - 1]["start"]
S6 = wd(5, 4) - 0.1
# Sound cues for xr022-ate-airplane: put(sound, time_s, gain, pan=-1..1).
# A bright country airfield: breeze and a few birds under everything; metal crunches when he eats; a toy "blip" and a
# big low reveal on the real plane; the tabletop saw buzzing, a gulp; a fast clock-and-crunch time-lapse for the two
# years; near silence for the whisper; footsteps and a brass ding for the plaque; one hard crunch when he bites it;
# a quiet, settled ending (music resolves, no stinger).
MUSIC.update(tension_start=0.2, tension_len=9.0, resolve=st(7) - 0.1, dip=(st(5) + S6) / 2, dip_w=1.3)
Q0, Q1 = st(5) - 0.15, S6 + 0.05   # the whisper: the bed almost disappears
def breeze(d): t = t_(d); return lp(rng.standard_normal(len(t)), 500) * env(d, 0.6, 0.8) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * t)) * 2
def chirp(f): t = t_(0.09); return np.sin(2 * np.pi * (f * t + 2500 * t * t)) * np.sin(np.pi * t / 0.09) ** 2
def crunch(d=0.16):
    n = int(SR * d); x = np.zeros(n)
    for _ in range(9):
        i = rng.integers(0, max(1, n - 500)); x[i:i + 500] += bp(rng.standard_normal(500), 1500, 6000) * np.exp(-np.arange(500) / 90)
    return x * env(d, 0.002, 0.05)
def buzz(d): t = t_(d); return (2 * ((190 * t) % 1) - 1) * 0.5 * env(d, 0.05, 0.12) + bp(rng.standard_normal(len(t)), 2000, 7000) * 0.3 * env(d, 0.05, 0.12)
def gulp(): t = t_(0.22); return np.sin(2 * np.pi * (260 * t - 500 * t * t)) * np.sin(np.pi * t / 0.22) ** 2
def step(): t = t_(0.08); return lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 60) * 2

_b = breeze(TOT); _t = t_(TOT); _b = _b * (1 - 0.85 * np.clip(1 - np.maximum(Q0 - _t, _t - Q1) / 0.25, 0, 1)); put(_b, 0.0, 0.035)
for k in range(9):
    tc = 0.4 + k * 1.9 + rng.uniform(0, 0.6)
    if not (Q0 - 0.2 < tc < Q1 + 0.1): put(chirp(2500 + 350 * (k % 4)), tc, 0.02, pan=rng.uniform(-.8, .8))
for c in cuts: put(whoosh(0.28), c - 0.14, 0.012 if Q0 - 0.3 < c < Q1 + 0.3 else 0.05, pan=rng.uniform(-.4, .4))
# s01: chewing metal
put(crunch(0.14), 0.12, 0.10); put(crunch(0.12), 0.48, 0.08); put(crunch(0.1), 0.86, 0.06)
# s02-s03: the toy, then the real plane (low thump, a soft wind gust)
put(blip(1700), wd(2, 2), 0.05); put(thump(50, 0.6), wd(2, 5), 0.16); put(whoosh(0.7), wd(2, 4) - 0.2, 0.05)
# s04: the saw, then a gulp with the pills
put(buzz(wd(3, 4) - st(3) - 0.05), st(3) + 0.05, 0.035, pan=-0.2)
put(gulp(), wd(3, 5) + 0.25, 0.09); put(glass(), wd(3, 5) - 0.1, 0.03)
# s05: two years go by: fast ticks and crunches
for k in range(14): put(tick(k % 2 == 0), st(4) + 0.1 + k * 0.12, 0.035, pan=0.2)
for k in range(5): put(crunch(0.08), st(4) + 0.2 + k * 0.33, 0.05, pan=rng.uniform(-.3, .3))
# s06: whisper, almost nothing
# s07: her footsteps, a brass ding when the plaque changes hands
for k in range(4): put(step(), S6 + 0.05 + k * 0.22, 0.05, pan=0.4 - k * 0.1)
put(bell(1568), wd(5, 9), 0.05); put(bell(2093), wd(5, 9) + 0.1, 0.03)
# s08: he bites the plaque
put(crunch(0.2), wd(6, 1) - 0.02, 0.14); put(thump(70, 0.25), wd(6, 1), 0.07)
# s09: settled ending, one small chime on "verified"
put(bell(988), wd(7, 3), 0.025)

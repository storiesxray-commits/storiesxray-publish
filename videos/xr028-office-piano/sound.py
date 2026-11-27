# xr028 (cartoon, USELESS FACTS): the grand piano falls on the good coworker, then on the fish microwaver.
# Office hum and keyboards, a microwave hum and beep, coffee pouring, a ceiling crack and a falling whistle, one huge piano
# chord thud on landing (cartoon, nobody shown hurt), a smelly microwave "ding", the second fall, then office applause.
MUSIC.update(tension_start=6.0, tension_len=6.0, resolve=None, dip=18.9, dip_w=2.6)
def chord(d=1.6): t = t_(d); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) for f in (65.4, 98, 130.8, 155.6, 196, 261.6)) * 0.3
def typing(d):
    n = int(SR * d); x = np.zeros(n); r = np.random.default_rng(5)
    for i in range(int(d * 9)): j = r.integers(0, n - 400); x[j:j + 400] += hp(r.standard_normal(400), 2000) * np.exp(-np.arange(400) / 60)
    return x
def clap(d):
    n = int(SR * d); x = np.zeros(n); r = np.random.default_rng(9)
    for i in range(int(d * 40)): j = r.integers(0, n - 900); x[j:j + 900] += bp(r.standard_normal(900), 700, 4000) * np.exp(-np.arange(900) / 120)
    return x * env(d, 0.2, 0.4)
def whistle(f0, f1, d): t = t_(d); f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.05, 0.05) * 0.5
for c in cuts:
    if c > 0.1: put(whoosh(0.26), c - 0.13, 0.04, pan=rng.uniform(-.4, .4))
put(hum(5.0), 0.0, 0.012); put(typing(2.2), 0.05, 0.03, pan=-0.4)
put(hum(2.2), 2.2, 0.02); put(beep(1800, 0.12), 3.9, 0.03)
put(splash(1.2), 4.9, 0.03, pan=0.2)
put(thud(), wd(4, 4) - 0.05, 0.08)
for k in range(5): put(paper(0.08), wd(4, 4) + k * 0.12, 0.05, pan=rng.uniform(-.5, .5))
put(whistle(1400, 500, 2.2), wd(4, 5), 0.03)
put(chord(1.8), wd(6, 0) - 0.05, 0.2); put(boom(1.0), wd(6, 0) - 0.05, 0.14)
put(hum(2.6), 13.3, 0.02); put(bell(1760), 15.0, 0.03)
put(whistle(1500, 600, 0.7), 16.2, 0.035); put(chord(1.6), wd(8, 1) + 0.02, 0.18); put(boom(0.8), wd(8, 1) + 0.02, 0.12)
put(clap(3.2), wd(9, 5) - 0.2, 0.025)

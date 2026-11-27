# xr031 (HyperFrames, USELESS FACTS): using your blinker won't save you from a charging bison. Texas deadpan-comedy read.
# Highway hum and the tick-tock of a turn signal, a polite "ding" per lane change, hooves thundering in, a snort,
# counter ticks for the stats, a cartoon crunch (car on its roof, wheels spinning), honks for the no-blinker guy,
# the same crunch, then the bison walks off ... and its blinker ticks.
MUSIC.update(tension_start=5.7, tension_len=7.2, resolve=None, dip=21.0, dip_w=2.4)
def tock(hi=True): t = t_(0.05); return (np.sin(2 * np.pi * (1300 if hi else 900) * t) + 0.4 * lp(rng.standard_normal(len(t)), 3000)) * np.exp(-t * 90)
def hoof(): t = t_(0.18); return np.sin(2 * np.pi * (90 * t - 80 * t * t)) * np.exp(-t * 28) + lp(rng.standard_normal(len(t)), 600) * np.exp(-t * 40) * 0.4
def snort(d=0.5): t = t_(d); return bp(rng.standard_normal(len(t)), 200, 1400) * env(d, 0.02, 0.3) * 2.2
def honk(d=0.3, f=420): t = t_(d); return np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * env(d, 0.01, 0.05) + np.sign(np.sin(2 * np.pi * f * 1.26 * t)) * 0.25 * env(d, 0.01, 0.05)
for c in cuts:
    if c > 0.1 and c < 19.0: put(whoosh(0.26), c - 0.13, 0.045, pan=rng.uniform(-.4, .4))
put(rumble(2.6), 0.0, 0.03)
for k in range(9): put(tock(k % 2 == 0), 0.05 + k * 0.31, 0.05, pan=-0.3)
for e in (3.05, wd(2, 3) - 0.1, wd(2, 5) - 0.1):
    for k in range(3): put(tock(k % 2 == 0), e + k * 0.17, 0.04)
    put(bell(1568), e + 0.55, 0.02)
for k in range(16): put(hoof(), 6.2 + k * 0.16, 0.06, pan=0.4 - k * 0.04)
put(snort(), wd(3, 2), 0.06)
for k in range(16): put(tick(k % 2 == 0), 8.9 + k * 0.22, 0.03)
put(thud(), 12.95, 0.16); put(boom(0.9), 12.95, 0.10); put(glass(), 13.0, 0.05)
for k in range(5): put(tick(), 13.5 + k * 0.12, 0.02)
for k in range(5): put(honk(0.28, 380 + 40 * k), 15.3 + k * 0.5, 0.035, pan=rng.uniform(-.6, .6))
for k in range(8): put(hoof(), 17.9 + k * 0.1, 0.05)
put(thud(), wd(7, 1) - 0.05, 0.16); put(boom(0.9), wd(7, 1) - 0.05, 0.10)
for k in range(3): put(tock(k % 2 == 0), wd(8, 3) + 0.75 + k * 0.28, 0.03, pan=-0.2)

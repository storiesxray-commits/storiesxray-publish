# Sound cues for xr014-served-first: put(sound, time_s, gain, pan=-1..1). Warm bistro at dinner rush: room murmur, cutlery,
# a clock ticking while she waits, plates landing on the OTHER table, a skip whoosh + x-ray zap at "furious", a 1976 store bell.
MUSIC.update(tension_start=2.0, tension_len=14.0, resolve=wd(10, 1), dip=wd(9, 3), dip_w=1.3)
def murmur(d): t = t_(d); return bp(rng.standard_normal(len(t)), 250, 1200) * env(d, 0.3, 0.4) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t) * np.sin(2 * np.pi * 1.3 * t + 1))
def clatter(): t = t_(0.25); return (np.sin(2 * np.pi * 2900 * t) + 0.7 * np.sin(2 * np.pi * 4300 * t)) * np.exp(-t * 30) + hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 60) * 0.5
def step(): t = t_(0.12); return lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40)
for c in cuts: put(whoosh(0.3), c - 0.15, 0.08, pan=rng.uniform(-.4, .4))
# restaurant scenes: murmur bed + random cutlery
for a, b in [(0.0, wd(5, 0) - 0.1), (wd(10, 0) - 0.1, TOT)]:
    put(murmur(b - a), a, 0.05)
    for k in range(int((b - a) / 0.9)): put(glass() if k % 3 else clatter(), a + 0.3 + k * 0.9 + rng.uniform(0, 0.4), 0.05, pan=rng.uniform(-.8, .8))
# 18 minutes: clock ticking + her fingers drumming
for k in range(8): put(tick(k % 2 == 0), 0.05 + k * 0.5, 0.12)
for k in range(10): put(click(900, 0.04), 0.1 + k * 0.17, 0.06, pan=0.3)
# "NOT": a sharp hit
put(thump(80, 0.3), wd(3, 2), 0.3)
# waiter arrives, plates land on their table
for k in range(5): put(step(), wd(4, 5) + k * 0.22, 0.12, pan=-0.3)
put(clatter(), wd(4, 8) - 0.05, 0.22, pan=-0.2); put(clatter(), wd(4, 8) + 0.12, 0.18, pan=0.2)
# the queue: shuffling feet, a sigh beat on "annoying"
for k in range(6): put(step(), wd(5, 1) + k * 0.4, 0.08, pan=rng.uniform(-.5, .5))
put(bell(1175), wd(5, 4), 0.05)
# skipped: whoosh as he cuts in, x-ray zap + boom on "furious"
put(whoosh(0.5), wd(8, 1) - 0.3, 0.3, pan=0.4)
put(zap(0.5), wd(8, 6) - 0.25, 0.22); put(boom(0.8), wd(8, 6), 0.3)
# 1976 store: shop bell + bike bell ring as it is handed over
put(bell(1568), wd(9, 0) - 0.25, 0.03); put(bell(2349), wd(9, 6) + 0.25, 0.025)
# strike on "isn't"
put(paper(0.2), wd(10, 1), 0.2); put(thud(), wd(10, 1) + 0.05, 0.25)
# final question: the clock again (loops into the start)
for k in range(6): put(tick(k % 2 == 0), wd(12, 0) + k * 0.5, 0.1)

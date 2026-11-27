# xr027 (HyperFrames, USELESS FACTS): returning your cart won't save you. A comedic Boston read over a supermarket lot:
# cart wheels rattling, a holy choir chord for the good person, a long rolling walk, tornado wind and a cow "moo" whoosh,
# a rattling gauge and a scale beep, two heavy cartoon thuds (no gore), a smug whistle for the cart-leaver, one small "bonk" at the end.
MUSIC.update(tension_start=3.6, tension_len=9.0, resolve=None, dip=18.6, dip_w=1.9)
def rattle(d): t = t_(d); return bp(rng.standard_normal(len(t)), 1500, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * env(d, 0.05, 0.1)
def choir(d): t = t_(d); return sum(np.sin(2 * np.pi * f * t) for f in (523, 659, 784, 1047)) * 0.25 * env(d, 0.2, 0.4)
def moo(d=0.9): t = t_(d); f = 140 - 40 * t / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + 0.5 * np.sin(2 * np.pi * 7 * t)) * env(d, 0.08, 0.3) * 0.6
def gust(d): t = t_(d); return bp(rng.standard_normal(len(t)), 200, 1800) * env(d, 0.3, 0.4) * 2
def whistle(d): t = t_(d); f = 1200 + 300 * np.sin(2 * np.pi * 2 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.05, 0.1) * 0.5
for c in cuts:
    if c > 0.1 and c < 17.0: put(whoosh(0.26), c - 0.13, 0.045, pan=rng.uniform(-.4, .4))
put(rattle(1.9), 0.05, 0.03, pan=-0.3); put(moo(0.7), 0.4, 0.04, pan=0.5)
put(choir(1.4), 2.1, 0.04)
put(rattle(2.1), 3.6, 0.03)
put(gust(2.3), 5.7, 0.06); put(moo(0.9), wd(4, 5) - 0.3, 0.06)
for k in range(16): put(click(900, 0.02), 8.1 + k * 0.1, 0.03)
put(beep(1400, 0.12), wd(5, 11), 0.04)
put(thud(), 12.22, 0.16); put(boom(0.7), 12.22, 0.09); put(bell(1568), 12.8, 0.025)
put(rattle(1.4), 14.0, 0.03); put(whistle(1.0), 14.8, 0.025)
put(thud(), 16.28, 0.16); put(boom(0.7), 16.28, 0.09)
put(click(400, 0.05), 19.35, 0.02)

# xr025 (HyperFrames, USELESS FACTS): never blow your leaves with a hurricane. Calm documentary read over a suburban afternoon:
# birds and a leash jingle, a small leaf blower whine, then a satellite whoosh, rising wind and a rattling gauge, steam hiss from
# a field of power plants, a howling gust that rips the leaves, a turf "rip", the HOA lady's clipboard pages flapping away, and silence + birds for "fair".
MUSIC.update(tension_start=4.0, tension_len=14.0, resolve=wd(9, 0) - 0.4, dip=21.6, dip_w=0.9)
def chirp(f): t = t_(0.09); return np.sin(2 * np.pi * (f * t + 2500 * t * t)) * np.sin(np.pi * t / 0.09) ** 2
def whine(d): t = t_(d); return (np.sin(2 * np.pi * 620 * t) * 0.4 + bp(rng.standard_normal(len(t)), 800, 3000) * 0.6) * env(d, 0.08, 0.15)
def gust(d): t = t_(d); return bp(rng.standard_normal(len(t)), 200, 1800) * env(d, 0.3, 0.4) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * 2
for c in cuts:
    if c > 0.1: put(whoosh(0.3), c - 0.15, 0.05, pan=rng.uniform(-.4, .4))
for k in range(4): put(chirp(2600 + 300 * k), 0.3 + k * 0.6, 0.02, pan=rng.uniform(-.7, .7))
for k in range(5): put(click(3200, 0.02), 0.2 + k * 0.5, 0.02)
put(whine(1.6), 2.85, 0.03, pan=0.2)
put(gust(2.4), 4.6, 0.05)
put(gust(3.4), 7.1, 0.07)
for k in range(18): put(click(900, 0.02), 7.3 + k * 0.1, 0.03)
for k in range(10): put(hiss(0.4), 12.2 + k * 0.35, 0.012, pan=rng.uniform(-.6, .6))
put(rumble(1.6), 14.6, 0.06)
put(gust(2.2), 16.2, 0.08); put(boom(0.9), wd(6, 1) - 0.05, 0.08)
put(splash(0.5), 18.35, 0.05)
for k in range(8): put(paper(0.08), wd(8, 1) + 0.2 + k * 0.15, 0.06, pan=rng.uniform(-.6, .6))
put(gust(2.0), 19.6, 0.06)
for k in range(5): put(chirp(2400 + 400 * (k % 3)), 22.6 + k * 0.55, 0.025, pan=rng.uniform(-.7, .7))

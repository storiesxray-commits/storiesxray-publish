# xr032 (cartoon, USELESS FACTS): the ice maker that nobody told. Deadpan documentary read (xr10).
# Fridge hum, little ice clinks into the bin, a fast calendar riffle for "one year later", the freezer door creaking under
# 1,400 lb, slippers on the floor, a click on the handle, then a huge icy avalanche (cartoon, nobody hurt), a frozen "zing",
# a clock fast-forward, spring birds for April and a tiny sparkle on the peas.
MUSIC.update(tension_start=10.0, tension_len=8.8, resolve=None, dip=19.4, dip_w=1.6)
def clink(f=2600): t = t_(0.09); return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.51 * t)) * np.exp(-t * 55) * 0.6
def creak(d=0.8, f0=180): t = t_(d); f = f0 + 60 * np.sin(2 * np.pi * 3 * t); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3; return bp(x, 300, 2500) * env(d, 0.05, 0.2)
def chirp(f=3200): t = t_(0.12); return np.sin(2 * np.pi * (f * t + 9000 * t * t)) * np.sin(np.pi * t / 0.12) * 0.5
def ping(): t = t_(0.5); return (np.sin(2 * np.pi * 2637 * t) + 0.5 * np.sin(2 * np.pi * 3951 * t)) * np.exp(-t * 9) * 0.4
for c in cuts:
    if c > 0.1 and c < 24.0: put(whoosh(0.24), c - 0.12, 0.035, pan=rng.uniform(-.4, .4))
put(hum(15.5), 0.0, 0.05)
for k in range(4): put(clink(2400 + 300 * k), 0.2 + k * 0.42, 0.05, pan=-0.2)
for k in range(10): put(clink(2200 + 90 * (k % 5)), wd(2, 0) + k * 0.17, 0.04)
put(clink(3000), wd(4, 3), 0.05); put(clink(2600), wd(4, 3) + 0.09, 0.04)
for k in range(12): put(clink(2000 + 140 * (k % 6)), wd(5, 0) + k * 0.18, 0.035)
for k in range(14): put(paper(), wd(6, 0) + k * 0.09, 0.05)
put(creak(1.2, 160), wd(6, 4), 0.05); put(creak(1.4, 120), wd(7, 0), 0.06); put(thump(45, 0.4), wd(6, 5) + 0.2, 0.12)
for k in range(4): put(paper(0.08), wd(8, 0) + 0.2 + k * 0.38, 0.03, pan=0.3)
put(click(900, 0.04), wd(8, 3), 0.08); put(creak(0.6, 220), wd(8, 3) + 0.2, 0.05)
put(boom(1.2), wd(8, 7) + 0.75, 0.16); put(splash(1.2), wd(8, 7) + 0.75, 0.08)
for k in range(28): put(clink(1800 + 70 * (k % 9)), wd(8, 7) + 0.78 + k * 0.035, 0.05, pan=rng.uniform(-.6, .6))
put(zap(0.5), wd(9, 1) - 0.12, 0.04)
for k in range(10): put(tick(k % 2 == 0), wd(10, 0) + k * 0.2, 0.025)
for k in range(5): put(chirp(3000 + 300 * (k % 3)), wd(10, 6) + 0.1 + k * 0.16, 0.025, pan=0.4)
put(ping(), wd(11, 3) - 0.05, 0.03)

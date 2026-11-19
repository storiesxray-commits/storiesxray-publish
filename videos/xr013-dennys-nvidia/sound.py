# Sound cues for xr013-dennys-nvidia: put(sound, time_s, gain, pan=-1..1). Late-night diner + money mood: coin clinks, chip hum, plates, coffee pour, a gavel-like thud for the resignation, plaque poof and slam back.
MUSIC.update(tension_start=1.5, tension_len=19.0, resolve=wd(9, 4), dip=wd(7, 3) - 0.15, dip_w=0.5)
def clink(f=3600): t = t_(0.18); return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.48 * t)) * np.exp(-t * 28)
def pour(d=1.5): t = t_(d); return bp(rng.standard_normal(len(t)), 500, 2500) * env(d, 0.08, 0.2) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * t))
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: chip hum + raining coins
put(hum(3.0), 0.0, 0.12)
for k in range(12): put(clink(3000 + 400 * (k % 4)), 0.05 + k * 0.24, 0.1, pan=rng.uniform(-.7, .7))
put(thump(70, 0.3), 0.02, 0.3)
# dishwasher: splashes and plate clatter
put(splash(0.8), wd(2, 0) + 0.1, 0.18)
for k in range(5): put(clink(2200 + 150 * k), wd(2, 4) + k * 0.18, 0.08, pan=0.4)
for k in range(4): put(bubble(500 + 120 * k), wd(2, 6) + k * 0.15, 0.08)
# 1993 booth: diner bell, napkin scribble
put(bell(1568), wd(3, 1), 0.08); put(paper(0.4), wd(3, 6), 0.12)
# bottomless coffee pour
put(pour(2.6), wd(4, 0) - 0.2, 0.16)
# that booth became Nvidia: zap + boom
put(zap(0.5), wd(5, 3) - 0.2, 0.18); put(boom(1.1), wd(5, 3), 0.35)
# worth trillions: coin cascade + thump
for k in range(16): put(clink(2600 + 300 * (k % 5)), wd(6, 0) + 0.3 + k * 0.17, 0.08, pan=rng.uniform(-.8, .8))
put(thump(60, 0.4), wd(6, 7), 0.4)
# he resigned: heavy thud as the nameplate falls
put(thud(), wd(7, 3) + 0.25, 0.45)
# plaque gone (poof) / back (slam + sparkle)
put(whoosh(0.4), wd(8, 5) - 0.1, 0.25); put(paper(0.3), wd(8, 5), 0.15)
put(thud(), wd(9, 4), 0.4); put(bell(2093), wd(9, 4) + 0.05, 0.08); put(bell(2637), wd(9, 4) + 0.2, 0.06)
# outro: coins again (loop)
for k in range(10): put(clink(3000 + 400 * (k % 4)), wd(10, 0) + 0.2 + k * 0.3, 0.08, pan=rng.uniform(-.7, .7))

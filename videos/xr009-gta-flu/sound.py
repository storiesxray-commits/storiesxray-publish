# Sound cues for xr009-gta-flu: put(sound, time_s, gain, pan=-1..1). Launch-night energy: controller clicks, stamps, a cough, a fever beep, neon "power-up" sweeps.
MUSIC.update(tension_start=4.0, tension_len=28.0, resolve=wd(11, 0), dip=wd(8, 5) - 0.2, dip_w=0.45)
def mash(d):
    n = int(SR * d); x = np.zeros(n)
    for k in rng.integers(0, n - 300, int(d * 18)): x[k:k + 240] += hp(rng.standard_normal(240), 2500) * np.exp(-np.arange(240) / 40) * rng.uniform(0.4, 1)
    return x
def cough(): t = t_(0.35); return bp(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t * 12) * (1 + 0.5 * np.sin(2 * np.pi * 9 * t))
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: power-up sweep + button mashing on the couch
put(sweep(300, 1500, 0.6), 0.03, 0.14); put(boom(1.0), 0.05, 0.3); put(mash(4.3), 0.1, 0.12)
# memo stamp
put(thud(), tm['sentences'][1]['start'] + 0.43, 0.45); put(paper(0.2), tm['sentences'][1]['start'] + 0.1, 0.15)
# 4 day tiles pop
for k in range(4): put(blip(1100 + 150 * k, 0.07), wd(3, 7) + k * 0.15, 0.15)
# contract: pen scratch + stamp
put(paper(0.9), wd(4, 2), 0.12); put(thud(), wd(4, 7), 0.45)
# twenty: crowd cheer-ish noise + pops
put(bp(rng.standard_normal(int(SR * 1.6)), 400, 3000) * env(1.6, 0.2, 0.6), wd(5, 0), 0.06)
for k in range(10): put(click(1800, 0.03), wd(5, 0) + k * 0.1, 0.12, pan=rng.uniform(-.6, .6))
# office: keyboards, then a poof
put(mash(4.5), wd(6, 0), 0.06); put(sweep(1400, 300, 0.4), wd(7, 3), 0.12); put(bell(1046.5), wd(7, 8), 0.1)
# phone ring + cough
for k in range(3): put(beep(880, 0.15), wd(8, 0) + k * 0.4, 0.08)
put(cough(), wd(8, 6) + 0.05, 0.3); put(cough(), wd(8, 6) + 0.45, 0.22)
# x-ray flu: zap + fever beeps
put(zap(), wd(9, 4) - 0.1, 0.28)
for k in range(4): put(beep(1600, 0.08), wd(9, 5) + k * 0.25, 0.1)
# tower lights: rising arpeggio
for k in range(8): put(blip(700 + 120 * k, 0.06), wd(10, 4) + k * 0.12, 0.1)
# outro: mashing again
put(mash(3.6), wd(11, 0), 0.1); put(bell(1318.5), wd(11, 8), 0.1)

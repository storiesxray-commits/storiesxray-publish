# Sound cues for xr010-phone-germs: put(sound, time_s, gain, pan=-1..1). Gross-funny lab mood: squishy germ blips, a swab, a cartoon bar "rise", spray + scrub, a toilet flush, a fast timer.
MUSIC.update(tension_start=2.0, tension_len=20.0, resolve=wd(11, 2), dip=wd(12, 1) - 0.2, dip_w=0.5)
def squish(): t = t_(0.12); return np.sin(2 * np.pi * (220 * t + 900 * t * t)) * np.exp(-t * 30)
def flush(d=2.2): t = t_(d); return (lp(rng.standard_normal(len(t)), 900) * 2.2 + bp(rng.standard_normal(len(t)), 1500, 5000) * 0.4) * env(d, 0.05, 0.9) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
def spray(): t = t_(0.25); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 12)
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: germs squishing all over the phone + a "ding" of the clean seat
for k in range(10): put(squish(), 0.05 + k * 0.27, 0.18, pan=rng.uniform(-.6, .6))
put(bell(1568), wd(2, 3), 0.08)
# lab: swab scratch, colonies popping
put(paper(0.5), wd(3, 3), 0.15)
for k in range(8): put(blip(900 + 90 * k, 0.05), wd(3, 6) + 0.4 + k * 0.12, 0.08)
# 10x bar rising
put(sweep(200, 1200, 1.0), wd(4, 0), 0.12); put(thump(90, 0.2), wd(4, 3), 0.35)
# spray + scrub + sparkle
for k in range(3): put(spray(), wd(5, 0) + 0.1 + k * 0.25, 0.25)
put(bell(2093), wd(5, 4), 0.08)
# never: sad trombone-ish slide
put(sweep(420, 220, 0.6), wd(6, 2), 0.1)
# flush + plume
put(flush(2.4), wd(8, 0) + 0.15, 0.4)
for k in range(8): put(tick(k % 2 == 0), wd(8, 5) + k * (wd(9, 1) - wd(8, 5)) / 8, 0.18)
put(beep(1200, 0.2), wd(9, 1), 0.12)
# germs jump to the face
for k in range(6): put(squish(), wd(10, 7) + k * 0.08, 0.16, pan=0.3)
# good news chime
put(bell(1318.5), wd(11, 2), 0.1); put(bell(1760), wd(11, 2) + 0.15, 0.08)
# outro: squish again (loop)
for k in range(6): put(squish(), wd(12, 1) + k * 0.25, 0.14, pan=rng.uniform(-.6, .6))

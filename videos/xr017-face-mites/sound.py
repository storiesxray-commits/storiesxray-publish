# hf001 (HyperFrames test): face mites. Squishy tiny-creature sfx, a night hush, a dusk party, a stamp, a reveal.
MUSIC.update(tension_start=0.5, tension_len=14.0, resolve=wd(8, 0), dip=wd(4, 0) + 0.4, dip_w=1.3)
def squish(f=700): t = t_(0.12); return np.sin(2*np.pi*(f*t + 900*t*t)) * np.exp(-t*30)
def chomp(): t = t_(0.09); return (lp(rng.standard_normal(len(t)), 1200) * 0.8 + np.sin(2*np.pi*180*t) * 0.6) * np.exp(-t*40)
def pop(f=900): t = t_(0.08); return np.sin(2*np.pi*(f*t + 3000*t*t)) * np.sin(np.pi*t/0.08)
for c in cuts:
    if not 10.0 < c < 12.0: put(whoosh(0.3), c - 0.15, 0.07, pan=rng.uniform(-.4, .4))  # the whisper shot stays quiet
# hook: the mite pops out of the pore, wiggles
put(pop(600), 0.35, 0.10, pan=0.4); put(squish(900), 0.6, 0.06, pan=0.4)
put(thump(70, 0.3), wd(1, 5), 0.10)
# dive into the skin, labels tick in
put(whoosh(0.5), 2.6, 0.10); put(blip(1600), wd(2, 0), 0.05); put(blip(1900), wd(2, 1), 0.05)
for k in range(6): put(click(2600, 0.02), wd(2, 1) + k * 0.06, 0.035, pan=0.3)
put(pop(500), wd(2, 4), 0.07)
# eating face oil: chomps on the bites
put(tick(), 7.95, 0.04); put(sweep(800, 2400, 0.6), 7.95, 0.02)
for b in (9.0, 9.35, 9.7, 10.05, 10.4): put(chomp(), b, 0.11, pan=0.2); put(squish(500), b + 0.04, 0.04, pan=0.2)
# night: snore, then crawl steps and a tiny kiss chime
put(lp(rng.standard_normal(int(SR*0.8)), 300) * env(0.8, 0.3, 0.3) * 0.6, 10.75, 0.025)
for k in range(10): put(click(3200 + 200 * (k % 2), 0.015), 11.8 + k * 0.09, 0.03, pan=(-0.5 if k % 2 else 0.5))
put(bell(1568), wd(4, 6), 0.05); put(bell(2093), wd(4, 6) + 0.12, 0.04)
# dusk: melatonin shimmer, sip, then the party drop
for k in range(8): put(blip(1200 + 150 * k, 0.09), wd(5, 4) + k * 0.12, 0.025, pan=rng.uniform(-.6, .6))
put(trickle(1.0), 15.3, 0.03)
put(boom(1.0), wd(5, 12), 0.13)
for k in range(5): put(thump(55, 0.25), wd(5, 12) + k * 0.22, 0.12); put(paper(0.08), wd(5, 12) + 0.11 + k * 0.22, 0.05)
# lab: the head shake, the question mark
put(squish(400), wd(6, 3), 0.05); put(blip(700, 0.12), wd(6, 8) - 0.1, 0.06)
# 2022 stamp, the microscope, found it
put(thud(), wd(7, 1) + 0.05, 0.22); put(boom(0.6), wd(7, 1) + 0.05, 0.08)
put(sweep(300, 900, 0.5), 24.15, 0.03); put(bell(2637), wd(7, 5), 0.05)
# everyone: pops
for i in range(6): put(pop(700 + 80 * i), 25.25 + i * 0.12, 0.06, pan=(-0.4 if i % 2 == 0 else 0.4))
for i in range(6): put(squish(1100), 26.9 + i * 0.07, 0.03)
# you: punch-in hit, the mite peeks
put(thump(60, 0.35), wd(9, 1), 0.12); put(boom(0.8), wd(9, 2), 0.09); put(pop(1300), 29.7, 0.07)

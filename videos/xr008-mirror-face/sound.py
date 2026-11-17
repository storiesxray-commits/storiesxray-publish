# Sound cues for xr008-mirror-face: put(sound, time_s, gain, pan=-1..1). Bright, playful bathroom mood: glass shimmer on the mirror flips, camera shutter for the 1977 photos, a hush before the final gasp.
MUSIC.update(tension_start=9.0, tension_len=18.0, resolve=wd(10, 2), dip=wd(11, 6) - 0.2, dip_w=0.45)
def shimmer(d=0.6):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (6 + k)) for k, f in enumerate([2093, 2637, 3136, 4186])) * 0.25
    return x * env(d, 0.005, 0.2)
def shutter(): a = click(2600, 0.03); b = click(1800, 0.04); x = np.zeros(int(SR * 0.12)); x[:len(a)] += a; x[int(SR * 0.06):int(SR * 0.06) + len(b)] += b; return x
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: a glass hit at frame 0, then the mirror flips with a shimmer + whoosh
put(glass(), 0.03, 0.3); put(shimmer(0.8), 0.05, 0.18); put(whoosh(0.4), wd(2, 0) - 0.1, 0.3); put(shimmer(0.6), wd(2, 0) + 0.1, 0.2)
# raise the hand: a pop and a "boing"-ish sweep
put(blip(1300, 0.08), wd(3, 2), 0.18); put(sweep(500, 900, 0.25), wd(3, 4), 0.08)
# symmetry lines: ticks
for k in range(4): put(tick(k % 2 == 0), wd(4, 7) - 1.6 + k * 0.4, 0.2)
put(bell(880), wd(4, 7), 0.08)
# backwards: whoosh around + shimmer
put(whoosh(0.5), wd(5, 5) - 0.2, 0.25); put(shimmer(0.5), wd(5, 6), 0.15)
# 1977: camera shutters as the photos land
put(shutter(), tm['sentences'][5]['start'] + 0.6, 0.3); put(paper(0.2), tm['sentences'][5]['start'] + 0.9, 0.2)
put(shutter(), wd(6, 10) - 0.25, 0.3); put(paper(0.2), wd(6, 10), 0.2)
# votes: two dings
put(bell(1046.5), wd(7, 1) + 0.05, 0.12); put(bell(1318.5), wd(8, 1) + 0.05, 0.12)
# we like what we see: soft sparkle
put(shimmer(0.8), wd(9, 1), 0.12)
# lineup: selector clicks, then the pick
for k in range(4): put(click(1600, 0.03), wd(10, 0) + k * 0.4, 0.2)
put(bell(1568), wd(10, 5) + 0.1, 0.12)
# phone: buzz + error thud on "can't stand"
put(hum(1.2), wd(11, 0), 0.05); put(thud(), wd(11, 2), 0.3); put(beep(300, 0.15), wd(11, 2), 0.1)
# final: shimmer as the mirror flips back (loop)
put(shimmer(0.7), wd(11, 9), 0.15)


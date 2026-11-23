def st(i): return tm["sentences"][i - 1]["start"]
# Sound cues for xr020-van-gogh-190m: put(sound, time_s, gain, pan=-1..1).
# Sale room: a low room murmur, paddle card flicks, the price board ticking up, the gavel on "dollars" and a burst of applause;
# Auvers 1890: birds and a breeze, a brush on canvas; dusk: the music almost drops out under "He died two months later";
# back in the room: a chart chime on the record, a short laugh-applause for the kid's drawing, a warm quiet ending.
MUSIC.update(tension_start=0.3, tension_len=9.0, resolve=wd(5, 0) - 0.2, dip=wd(4, 1), dip_w=0.7)
def murmur(d): t = t_(d); return bp(rng.standard_normal(len(t)), 200, 900) * env(d, 0.3, 0.4) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))

for c in cuts: put(whoosh(0.3), c - 0.15, 0.06, pan=rng.uniform(-.4, .4))
put(murmur(wd(2, 9) - 0.0), 0.0, 0.05)
# paddle cards flick up
put(paper(0.08), 0.05, 0.08, pan=-0.2); put(paper(0.08), 0.35, 0.07, pan=0.3)
# the board ticks while the price climbs, then the gavel and applause
for k in range(14): put(tick(k % 2 == 0), wd(2, 3) + k * (wd(2, 8) - wd(2, 3)) / 14, 0.05, pan=0.3)
put(thud(), wd(2, 9), 0.22); put(thud(), wd(2, 9) + 0.12, 0.12)
def clap_burst(d):
    n = int(SR * d); x = np.zeros(n)
    for _ in range(int(d * 90)):
        i = rng.integers(0, max(1, n - 800)); c = hp(rng.standard_normal(600), 900) * np.exp(-np.arange(600) / 70); x[i:i + 600] += c
    return x * env(d, 0.08, 0.6)
put(clap_burst(1.1), wd(2, 9) + 0.08, 0.05)
# Auvers: birds, breeze, the brush
def chirp(f): t = t_(0.09); return np.sin(2 * np.pi * (f * t + 2500 * t * t)) * np.sin(np.pi * t / 0.09) ** 2
for k in range(7): put(chirp(2600 + 400 * (k % 3)), st(3) + 0.25 + k * 0.42, 0.035, pan=rng.uniform(-.7, .7))
put(lp(rng.standard_normal(int(SR * 3.0)), 600) * env(3.0, 0.6, 0.8) * 2, st(3), 0.03)
for k in range(5): put(paper(0.1), wd(3, 1) + k * 0.3, 0.03, pan=-0.2)
# dusk: one soft low note, nothing else
put(thump(48, 0.6), wd(4, 1), 0.08)
# the record: chart bars rise, a chime on "seventy-three"
put(sweep(400, 900, 0.8), st(5) + 0.1, 0.03); put(bell(1175), wd(5, 6), 0.06); put(bell(1568), wd(5, 6) + 0.12, 0.04)
# the kid's drawing: paper flick, small warm laugh-applause, a sparkle
put(paper(0.12), st(6) + 0.05, 0.08); put(clap_burst(0.8), wd(6, 4), 0.025); put(glass(), wd(6, 4) + 0.05, 0.04)

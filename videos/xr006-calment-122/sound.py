# Sound cues for xr006-calment-122: put(sound, time_s, gain, pan=-1..1). Light, playful mood; a hush before the twist "Then he died first".
MUSIC.update(tension_start=19.0, tension_len=12.0, resolve=wd(17, 0), dip=wd(15, 0) - 0.15, dip_w=0.45)
def party(d):
    n = int(SR * d); x = np.zeros(n)
    for k in rng.integers(0, n - 600, int(d * 14)): x[k:k + 500] += bp(rng.standard_normal(500), 2000, 7000) * np.exp(-np.arange(500) / 120) * rng.uniform(0.3, 1)
    return x
def cash_(): a = bell(1318.5) * 0.5; b = click(2400, 0.03); a[:len(b)] += b; return a
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: party poppers + a bright bell on "hundred", a sweep up on "more"
put(party(2.6), 0.05, 0.18); put(bell(784), wd(1, 7), 0.12); put(sweep(400, 1400, 0.5), wd(2, 0), 0.1)
# x-ray scan + counter ticks to 122
sx = tm['sentences'][2]['start'] + 0.2; put(zap(), wd(3, 4) - 0.1, 0.28); put(hum(2.0), wd(3, 4), 0.05)
for k in range(12): put(tick(k % 2 == 0), wd(3, 4) + k * 0.075, 0.25)
put(bell(1046.5), wd(3, 6) + 0.35, 0.14)
# 1875 street: soft hum
put(hum(2.6), wd(4, 0), 0.04)
# cigarette: a light hiss
put(hiss(2.4), wd(5, 0), 0.05)
# chocolate bars landing on the scale
for k in range(9): put(thump(140, 0.08), tm['sentences'][5]['start'] + 0.1 + k * 0.12 + 0.3, 0.16, pan=rng.uniform(-.3, .3))
put(click(1500, 0.04), wd(6, 8), 0.4)
# fencing: lunge + hit
put(whoosh(0.35), wd(7, 5) - 0.2, 0.3); put(glass(), wd(7, 5) + 0.02, 0.25); put(thud(), wd(7, 5) + 0.02, 0.25)
# bike bell
put(bell(1760), wd(8, 6), 0.1); put(bell(1760), wd(8, 6) + 0.18, 0.08)
# deal: pen scratch + stamp
put(paper(0.5), wd(9, 6) - 0.3, 0.18); put(thud(), wd(9, 6) + 0.7, 0.4)
# monthly payments: paper flutters, then the key "ding"
for k in range(8): put(paper(0.12), wd(12, 1) + k * 0.31, 0.12, pan=rng.uniform(-.5, .5))
put(bell(1318.5), wd(13, 2), 0.1)
# thirty years: calendar flips
for k in range(14): put(paper(0.06), wd(14, 1) + k * 0.075, 0.1)
# he died first: x-ray zap, then silence
put(zap(), wd(15, 2) - 0.05, 0.25)
# family kept paying + double
for k in range(5): put(paper(0.12), wd(16, 0) + k * 0.25, 0.12, pan=rng.uniform(-.5, .5))
put(sweep(300, 1100, 0.9), wd(17, 2), 0.08); put(cash_(), wd(17, 4) + 0.6, 0.2)
# press: camera flashes
for k in range(5): put(click(3000, 0.02), wd(18, 0) + 0.3 + k * 0.62, 0.35);
# punchline: a small "ba-dum" and a laugh-like sparkle
put(thump(110, 0.12), wd(20, 3) + 0.25, 0.3); put(thump(90, 0.15), wd(20, 3) + 0.45, 0.3); put(party(0.8), wd(20, 3) + 0.5, 0.12)

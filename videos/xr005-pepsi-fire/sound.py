# Sound cues for xr005-pepsi-fire: put(sound, time_s, gain, pan=-1..1). Stage hum, crowd, pyro crackle, a hush before the x-ray.
MUSIC.update(tension_start=12.0, tension_len=12.0, resolve=wd(16, 0), dip=wd(14, 0) - 0.15, dip_w=0.45)
def crackle(d):
    n = int(SR * d); x = np.zeros(n)
    for k in rng.integers(0, n - 200, int(d * 60)): x[k:k + 120] += rng.standard_normal(120) * np.exp(-np.arange(120) / 25) * rng.uniform(0.3, 1)
    return hp(x, 1200)
def crowd_(d): return bp(rng.standard_normal(int(SR * d)), 300, 2500) * env(d, 0.4, 0.5) * 0.8
for c in cuts: put(whoosh(0.3), c - 0.15, 0.12, pan=rng.uniform(-.4, .4))
# hook: fire crackle + boom
put(boom(1.2), 0.05, 0.45); put(crackle(3.6), 0.0, 0.22)
# stage + crowd
put(hum(3.0), wd(3, 0), 0.05); put(crowd_(3.2), wd(4, 0), 0.06); put(crowd_(2.2), wd(5, 0), 0.12, pan=-0.2)
# clapper snap
put(click(1200, 0.05), wd(6, 2) + 0.05, 0.7); put(thud(), wd(6, 2) + 0.05, 0.4)
# footsteps down the stairs
for k in range(6): put(thump(90, 0.12), wd(7, 1) + k * 0.3, 0.18, pan=0.1)
# pyro fires early
put(boom(1.0), wd(8, 2) - 0.05, 0.35); put(hiss(1.6), wd(8, 2), 0.08, pan=-0.3); put(hiss(1.6), wd(8, 2) + 0.1, 0.08, pan=0.3); put(crackle(1.8), wd(8, 2), 0.14)
# sparks land, ignition
for k in range(4): put(glass(), wd(9, 1) + 0.15 + k * 0.12, 0.08, pan=rng.uniform(-.3, .3))
put(sweep(200, 900, 0.5), wd(10, 2) - 0.1, 0.1); put(crackle(4.5), wd(10, 2), 0.28)
# spin
put(whoosh(0.5), wd(12, 4), 0.3); put(crackle(1.6), wd(12, 0), 0.2)
# tackle + smother
put(thud(), wd(13, 3) + 0.15, 0.55); put(thud(), wd(13, 3) + 0.3, 0.4); put(paper(0.3), wd(13, 6), 0.3); put(hiss(1.2), wd(13, 6) + 0.1, 0.12)
# x-ray scan
sx = tm['sentences'][13]['start'] + 0.2; put(zap(), sx, 0.3); put(hum(2.2), sx + 0.3, 0.05)
# settlement: cash stacks landing
for k in range(5): put(thump(120, 0.1), wd(15, 0) + 0.15 + k * 0.21, 0.2)
put(bell(880), wd(15, 4), 0.12)
# giving: soft paper flutter, then the sign
for k in range(5): put(paper(0.15), wd(16, 0) + k * 0.25, 0.12, pan=rng.uniform(-.5, .5))
put(thud(), wd(18, 4), 0.35); put(bell(659.25), wd(18, 4) + 0.05, 0.12)
# loop: the spark again
put(sweep(300, 1200, 0.6), wd(19, 2), 0.1); put(crackle(1.4), wd(19, 2), 0.2)

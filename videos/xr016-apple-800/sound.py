# Sound cues for xr016-apple-800: put(sound, time_s, gain, pan=-1..1).
# 1976 office: a cash-register ka-ching and a rubber stamp on "$800", calendar pages flipping to day 12, the door;
# the workbench: soldering clicks and a paper loan note; the house: a low thump; today: a market chime,
# bricks of cash stacking up fast, a big hit on "billion"; the living room: a warm resolve, quiet ending.
MUSIC.update(tension_start=0.5, tension_len=12.0, resolve=wd(7, 0), dip=wd(5, 0) - 0.15, dip_w=0.5)
def kaching(): t = t_(0.9); return (np.sin(2 * np.pi * 1568 * t) + 0.7 * np.sin(2 * np.pi * 2093 * t) + 0.4 * np.sin(2 * np.pi * 3136 * t)) * np.exp(-t * 5)
for c in cuts: put(whoosh(0.3), c - 0.15, 0.07, pan=rng.uniform(-.4, .4))
# hook: the bills slide out, the register rings, the stamp lands
for k in range(8): put(paper(0.05), wd(1, 7) - 0.05 + k * 0.05, 0.05, pan=0.2)
put(kaching(), wd(1, 8), 0.07); put(thud(), wd(1, 7), 0.16)
# calendar pages 1 -> 12, then the door
for k in range(11): put(paper(0.06), wd(2, 0) + k * (wd(2, 4) - wd(2, 0)) / 11, 0.07, pan=0.3)
put(thud(), wd(2, 6) + 0.1, 0.06, pan=0.6)
# workbench: soldering clicks, the loan note
for k in range(6): put(click(2400 + 300 * (k % 2), 0.02), wd(3, 0) + 0.1 + k * 0.35, 0.05, pan=-0.3)
put(paper(0.12), wd(3, 2), 0.1); put(blip(900), wd(3, 3), 0.06)
# the house: a low heartbeat thump under the whisper
put(heartbeat(), wd(4, 2), 0.1); put(thump(60, 0.35), wd(4, 5), 0.16)
# today: market chime, chart line sweep
put(bell(1319), wd(5, 0), 0.05); put(sweep(500, 1400, 1.0), wd(5, 0) + 0.1, 0.03)
# the tower: bricks stacking fast, a big hit on "billion"
n = 18
for k in range(n): put(thud(), wd(6, 1) - 0.1 + k * (wd(6, 4) + 0.2 - wd(6, 1) + 0.1) / n, 0.035, pan=0.3)
put(boom(1.0), wd(6, 3), 0.12); put(kaching(), wd(6, 4) + 0.1, 0.05)
# home: a soft cup clink on "no regrets"
put(glass(), wd(7, 5) + 0.05, 0.05)

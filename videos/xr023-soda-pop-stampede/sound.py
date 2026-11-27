# xr023 (HyperFrames, USELESS FACTS): soda vs pop vs coke. A dead-serious read over a cheap store-PA bed: VS sting, rattling glass doors,
# the stampede (a rumble that builds into a thump on "runs you over"), a counter ticking up, nine doors at once, a silent parking lot,
# a cart rolling by, wind over two little graves, then the gold tombstone slams down.
MUSIC.update(tension_start=2.0, tension_len=8.0, resolve=wd(9, 0) - 0.3, dip=10.9, dip_w=0.9)
for c in cuts:
    if c > 0.1: put(whoosh(0.28), c - 0.14, 0.05, pan=rng.uniform(-.4, .4))
put(boom(0.9), 0.02, 0.09); put(zap(0.4), 0.05, 0.04)
for k in range(10): put(click(900 + 200 * (k % 3), 0.03), 2.4 + k * 0.14, 0.03, pan=-0.3)          # glass rattling
put(rumble(1.4), 4.6, 0.10); put(thud(), wd(3, 7) + 0.15, 0.16); put(thump(50, 0.5), wd(3, 7) + 0.18, 0.12)
for k in range(10): put(thud(), 5.3 + k * 0.13, 0.035, pan=rng.uniform(-.6, .6))                    # footsteps
for k in range(12): put(tick(k % 2 == 0), 7.05 + k * 0.08, 0.035)
put(bell(1568), wd(4, 4) + 0.05, 0.03)
for k in range(9): put(thud(), 9.15 + k * 0.03, 0.03, pan=-0.8 + k * 0.2)                           # 9 doors at once
put(paper(0.1), 10.4, 0.02)
for k in range(6): put(click(600, 0.02), 10.6 + k * 0.22, 0.03, pan=0.3)                            # the cart rolling
for k in range(10): put(click(1100 + 150 * (k % 2), 0.03), 12.3 + k * 0.13, 0.035, pan=-0.3)
put(hiss(1.3), 14.0, 0.03)                                                                          # wind at the graves
for k in range(14): put(click(1200, 0.03), 16.2 + k * 0.12, 0.04, pan=rng.uniform(-.5, .5))
put(boom(1.2), 18.52, 0.16); put(thud(), 18.53, 0.14); put(bell(523), 18.6, 0.04)

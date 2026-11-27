# xr026 (HyperFrames, USELESS FACTS): don't clean your room with the Bagger 293. A smooth, dead-serious read:
# a wall crunch and grinding wheel for the hook, a small vacuum, mine rumble, a heavy scale clank, a counter, a clock ticking
# through one hour while pools fill with dirt, scoop crunches for the mess, the room and Ohio, then birds and footsteps: nobody noticed.
MUSIC.update(tension_start=1.0, tension_len=10.0, resolve=wd(10, 0) - 0.2, dip=14.3, dip_w=0.5)
def chirp(f): t = t_(0.09); return np.sin(2 * np.pi * (f * t + 2500 * t * t)) * np.sin(np.pi * t / 0.09) ** 2
def grind(d): t = t_(d); return (bp(rng.standard_normal(len(t)), 80, 600) * 2 + np.sign(np.sin(2 * np.pi * 18 * t)) * 0.15) * env(d, 0.05, 0.2)
def vac(d): t = t_(d); return (np.sin(2 * np.pi * 410 * t) * 0.3 + bp(rng.standard_normal(len(t)), 1500, 6000) * 0.7) * env(d, 0.05, 0.1)
for c in cuts:
    if c > 0.1: put(whoosh(0.26), c - 0.13, 0.045, pan=rng.uniform(-.4, .4))
put(boom(0.8), 0.02, 0.10); put(grind(1.2), 0.05, 0.06)
for k in range(8): put(thud(), 0.1 + k * 0.1, 0.03, pan=0.5)
put(vac(1.0), 1.25, 0.03, pan=0.3)
put(rumble(1.7), 2.35, 0.06); put(grind(1.6), 2.4, 0.03)
put(thump(55, 0.5), 4.2, 0.12)
for k in range(12): put(tick(k % 2 == 0), 4.15 + k * 0.1, 0.03)
put(bell(1047), 6.0, 0.03)
for k in range(24): put(tick(k % 2 == 0), 8.0 + k * 0.11, 0.03)
put(grind(1.6), 10.75, 0.06)
for k in range(6): put(thud(), 10.9 + k * 0.08, 0.04, pan=rng.uniform(-.5, .5))
put(boom(0.7), 12.42, 0.08); put(boom(0.9), wd(9, 1) - 0.02, 0.10)
for k in range(4): put(chirp(2600 + 300 * k), 14.7 + k * 0.45, 0.025, pan=rng.uniform(-.7, .7))
for k in range(8): put(click(500, 0.03), 14.7 + k * 0.25, 0.03, pan=-0.4 + k * 0.1)

# xr030 (cartoon, USELESS FACTS): splitting the check won't save you from a moose. Queens comedy read.
# Diner murmur, a fork on a plate, calculator beeps for "to the cent", a moose bellow and pounding hooves, glass crash,
# a big wooden crunch, counter ticks for the stats, a bell ding; the second crash; the moose's hooves walking off and a coin ping.
MUSIC.update(tension_start=5.0, tension_len=7.5, resolve=None, dip=19.6, dip_w=2.2)
def beep(f=2100, d=0.06): t = t_(d); return np.sin(2 * np.pi * f * t) * env(d, 0.003, 0.02) * 0.5
def bellow(d=0.9): t = t_(d); f = 110 + 40 * np.sin(np.pi * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * bp(rng.standard_normal(len(t)), 150, 900)) * env(d, 0.08, 0.3) * 0.6
def hoof(): t = t_(0.14); return np.sin(2 * np.pi * (120 * t - 120 * t * t)) * np.exp(-t * 30) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 45) * 0.4
def ping(): t = t_(0.5); return (np.sin(2 * np.pi * 2637 * t) + 0.5 * np.sin(2 * np.pi * 3951 * t)) * np.exp(-t * 9) * 0.4
for c in cuts:
    if c > 0.1 and c < 19.0: put(whoosh(0.26), c - 0.13, 0.045, pan=rng.uniform(-.4, .4))
put(rumble(4.8), 0.0, 0.02); put(glass(), 0.7, 0.025, pan=-0.3); put(glass(), 1.9, 0.02, pan=0.3)
for k in range(5): put(beep(1900 + 120 * k), wd(2, 6) + k * 0.12, 0.03)
put(bell(1760), wd(2, 9) + 0.05, 0.025)
put(bellow(), wd(3, 2) - 0.2, 0.05)
for k in range(5): put(hoof(), wd(3, 3) - 0.5 + k * 0.1, 0.05)
put(glass(), wd(3, 3) - 0.05, 0.10); put(glass(), wd(3, 3) + 0.03, 0.08, pan=0.4); put(splash(0.6), wd(3, 3) - 0.05, 0.05)
put(thud(), wd(3, 6) + 0.05, 0.16); put(boom(0.8), wd(3, 6) + 0.05, 0.08)
for k in range(16): put(tick(k % 2 == 0), wd(4, 0) + 0.1 + k * 0.24, 0.03)
put(bell(1568), wd(4, 3) - 0.05, 0.02)
put(beep(1500, 0.08), wd(6, 0) + 1.2, 0.02)
put(glass(), wd(7, 0) + 0.12, 0.10); put(glass(), wd(7, 0) + 0.2, 0.07, pan=-0.4); put(thud(), wd(7, 1) - 0.02, 0.16); put(boom(0.8), wd(7, 1) - 0.02, 0.08)
for k in range(5): put(hoof(), wd(8, 0) + 0.9 + k * 0.32, 0.025, pan=-0.2)
put(ping(), wd(8, 4) + 0.4, 0.03)

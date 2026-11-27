# xr029 (HyperFrames, USELESS FACTS): recycling won't save you from a falling blue whale. Unhinged-podcaster read.
# Birds over a suburb, a can clink, faucet water, bottles dropping into bins, a deep whale song + falling whistle,
# a held breath for the stats (counter ticks), a huge wet thud (cartoon), a trash bag rustle and spill, the second thud,
# then near silence and a low whale moan for "the whale knows".
MUSIC.update(tension_start=5.5, tension_len=8.0, resolve=None, dip=22.0, dip_w=2.4)
def chirp(f): t = t_(0.09); return np.sin(2 * np.pi * (f * t + 2500 * t * t)) * np.sin(np.pi * t / 0.09) ** 2
def song(d, f0=180, f1=90): t = t_(d); f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t)) * env(d, 0.3, 0.5) * 0.6
def whistle(f0, f1, d): t = t_(d); f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.05, 0.05) * 0.5
for c in cuts:
    if c > 0.1 and c < 20.0: put(whoosh(0.26), c - 0.13, 0.045, pan=rng.uniform(-.4, .4))
for k in range(4): put(chirp(2600 + 300 * k), 0.3 + k * 0.45, 0.02, pan=rng.uniform(-.7, .7))
put(glass(), 0.6, 0.03); put(rumble(1.6), 0.5, 0.04)
put(trickle(2.0), 2.2, 0.04, pan=0.3)
for k in range(6): put(glass(), 2.45 + k * 0.25, 0.025, pan=0.2)
for k in range(3): put(thud(), 4.95 + k * 0.45, 0.06, pan=0.1 * k)
put(song(2.2), 6.4, 0.06); put(whistle(1300, 400, 2.6), 6.6, 0.03)
for k in range(14): put(tick(k % 2 == 0), 11.1 + k * 0.13, 0.03)
put(boom(1.2), 14.0, 0.16); put(splash(0.9), 14.02, 0.10); put(thud(), 14.0, 0.12)
for k in range(6): put(paper(0.1), 17.3 + k * 0.12, 0.05, pan=0.4)
put(thud(), 18.4, 0.05)
put(whistle(1400, 500, 0.3), 18.95, 0.012); put(boom(0.6), 19.3, 0.05); put(thud(), 19.3, 0.06)
put(song(3.0, 120, 70), 21.0, 0.03)

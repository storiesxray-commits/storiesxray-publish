# Sound cues for xr012-finger-muscles: x-ray scanner hum, scan blips on the fingers, a heavy hit on "Not one!",
# a whoosh + muscle "creak" when the camera drops to the forearm, wooden puppet clacks, finger-tap ticks while wiggling.
# Short loop video: no big resolution at the end, the last beat leads back into the hook.
MUSIC.update(tension_start=0.3, tension_len=15.0, resolve=wd(7, 3), dip=wd(8, 0), dip_w=0.4)
def creak(d=0.35): t = t_(d); return np.sin(2 * np.pi * (90 * t + 120 * t * t)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * t))) * env(d, 0.01, 0.12)
def clack(): t = t_(0.08); return (hp(rng.standard_normal(len(t)), 1200) * 0.6 + np.sin(2 * np.pi * 900 * t)) * np.exp(-t * 70)
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: hit at frame 0, scanner sweep + blips while the red rings scan the fingers
put(thump(55, 0.4), 0.02, 0.38); put(sweep(400, 1600, 0.6), 0.03, 0.05)
for k in range(8): put(blip(1100 + 90 * (k % 4), 0.05), 0.25 + k * 0.32, 0.06, pan=-0.3 + 0.08 * k)
put(beep(880, 0.1), wd(1, 3), 0.08)
put(thud(), wd(2, 0), 0.42); put(thump(40, 0.6, 0.6), wd(2, 0) + 0.02, 0.35)
# question -> forearm reveal
put(blip(700, 0.08), wd(3, 3), 0.1)
put(whoosh(0.5), wd(4, 1) - 0.3, 0.3); put(thump(45, 0.5), wd(4, 1), 0.45); put(creak(), wd(4, 1) + 0.05, 0.12)
# muscles pull tendons: creaks on each contraction
for k in range(3): put(creak(0.3), wd(5, 0) + 0.15 + k * 0.75, 0.1, pan=0.2 * (k - 1))
put(sweep(900, 250, 0.45), wd(5, 5), 0.07)
# puppet strings: wooden clacks
for k in range(4): put(clack(), wd(6, 1) + k * 0.24, 0.16, pan=(-1) ** k * 0.3)
# wiggle: fast ticks, then a tense whisper beat on "Watch your arm"
for k in range(10): put(tick(k % 2 == 0), wd(7, 0) + 0.1 + k * 0.17, 0.08, pan=(-1) ** k * 0.25)
put(sweep(200, 700, 0.6), wd(7, 3), 0.06)
# "See? Because..." -> riser into the loop
put(blip(1500, 0.08), wd(8, 0), 0.12); put(sweep(300, 1500, 0.9), wd(8, 1) - 0.1, 0.07)

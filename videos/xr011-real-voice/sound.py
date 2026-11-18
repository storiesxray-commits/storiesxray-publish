# Sound cues for xr011-real-voice: put(sound, time_s, gain, pan=-1..1). Late-night radio studio mood: a sub-bass "skull buzz",
# mic feedback-ish shimmer at frame 0, bass drops when the low notes boost, a thin squeaky blip for the "weird" voice, game-show stars.
MUSIC.update(tension_start=3.0, tension_len=20.0, resolve=wd(16, 1), dip=wd(17, 0) + 0.3, dip_w=0.55)
def buzz(d=0.8, f=70): t = t_(d); return (np.sin(2 * np.pi * f * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t))) * env(d, 0.02, 0.25)
def squeak(): t = t_(0.18); return np.sin(2 * np.pi * (1800 * t + 2500 * t * t)) * np.sin(np.pi * t / 0.18) ** 2
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: hit at frame 0 + skull buzz, then a thud on "Not once!"
put(thump(55, 0.4), 0.03, 0.35); put(buzz(1.4), 0.05, 0.22); put(sweep(300, 1400, 0.5), 0.05, 0.05)
put(thud(), wd(2, 0), 0.35)
# skull vibrates: a deeper buzz under "vibrates"
put(buzz(1.2, 55), wd(3, 4), 0.3)
# inner ear: little bell when the buzz arrives
for k in range(5): put(blip(900 + 120 * k, 0.05), wd(4, 0) + 0.1 + k * 0.12, 0.07)
put(bell(1318.5), wd(4, 4), 0.1)
# low notes boost + "deeper" drop
put(sweep(200, 900, 0.6), wd(5, 0), 0.07); put(thump(45, 0.5), wd(5, 4), 0.4)
put(thump(38, 0.7, 0.6), wd(6, 6) + 0.05, 0.45)
# recording: REC beep, then the skull/bass get cut
put(beep(1000, 0.1), wd(7, 1), 0.1); put(thud(), wd(8, 0), 0.25); put(sweep(500, 120, 0.5), wd(8, 2), 0.12)
# thin weird voice: squeaks, then the crowd turns
for k in range(3): put(squeak(), wd(9, 1) + k * 0.18, 0.06, pan=0.3)
put(whoosh(0.6), wd(10, 0) - 0.2, 0.25)
# friends / boss / crush pops
for i in (1, 3): put(blip(1200, 0.08), wd(11, i), 0.14)
put(blip(1500, 0.08), wd(11, 5), 0.14); put(bell(1760), wd(11, 5) + 0.15, 0.08)
# plot twist: hit + cards flipping in
put(thump(60, 0.5), wd(12, 0), 0.4); put(glass(), wd(12, 0) + 0.02, 0.2)
for k in range(6): put(paper(0.1), wd(12, 1) + 0.15 + k * 0.07, 0.12)
put(sweep(600, 1500, 0.5), wd(14, 4), 0.07)
# reveal: stars ding up, then a sparkle
for k in range(5): put(bell(880 * 2 ** (k / 6)), wd(16, 1) + k * 0.12, 0.06)
# loop build into the hook
put(sweep(200, 1200, 1.2), wd(17, 3), 0.06); put(buzz(1.0), wd(17, 3), 0.12)

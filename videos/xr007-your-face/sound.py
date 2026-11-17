# Sound cues for xr007-your-face: put(sound, time_s, gain, pan=-1..1). Eerie "mirror" mood: scan beeps, a glitch on the broken copy, DNA zap, a hush before the last whisper.
MUSIC.update(tension_start=6.0, tension_len=26.0, resolve=wd(12, 7), dip=wd(13, 3) - 0.2, dip_w=0.5)
def glitch(d=0.4):
    n = int(SR * d); x = np.zeros(n)
    for k in rng.integers(0, n - 800, 10): x[k:k + 700] += np.sign(np.sin(np.arange(700) * rng.uniform(0.05, 0.4))) * 0.5
    return hp(x, 300) * env(d, 0.005, 0.1)
for c in cuts: put(whoosh(0.3), c - 0.15, 0.1, pan=rng.uniform(-.4, .4))
# hook: deep hit + scan beeps linking the two faces
put(boom(1.2), 0.03, 0.35); put(hum(3.4), 0.05, 0.05)
for k in range(5): put(blip(1200 + 200 * k), 0.15 + k * 0.32, 0.12, pan=(-1) ** k * 0.3)
put(sweep(500, 1600, 0.5), wd(2, 3) - 0.1, 0.1)
# perfect copy builds (scan hum), then breaks: glitch + glass
put(hum(1.4), wd(3, 0), 0.06); put(glitch(0.45), wd(3, 3), 0.3); put(glass(), wd(3, 3) + 0.05, 0.3); put(thud(), wd(3, 3) + 0.15, 0.35)
# eight measurements: one tick per line
for k in range(8): put(tick(k % 2 == 0), wd(4, 2) + k * (wd(4, 8) + 0.4 - wd(4, 2)) / 9, 0.22)
# sea of faces, the trillion hit
put(rumble(2.5), wd(5, 0), 0.08); put(boom(1.0), wd(5, 9), 0.3)
# look-alikes meet: footsteps then a "ding"
for k in range(5): put(click(600, 0.05), tm['sentences'][5]['start'] + k * 0.13, 0.15)
put(bell(988), wd(6, 2), 0.1)
# portrait wall: frames pop in
for k in range(10): put(click(2200, 0.03), tm['sentences'][6]['start'] + k * 0.12, 0.12, pan=rng.uniform(-.5, .5))
# scanners: three match beeps
for k in range(3): put(beep(1400 + 300 * k, 0.12), wd(8, 4) + k * 0.18, 0.12)
put(bell(1318.5), wd(8, 6) + 0.2, 0.1)
# DNA: x-ray zap + rising sweep
put(zap(), wd(9, 4) - 0.15, 0.28); put(sweep(200, 900, 0.8), wd(9, 4), 0.07)
# matching genes: sparkle ticks
for k in range(10): put(blip(1800 + 60 * k, 0.05), wd(10, 6) - 0.4 + k * 0.08, 0.06, pan=(-1) ** k * 0.4)
# traits: line, scale clunk, a light hiss
put(sweep(300, 1200, 0.3), wd(11, 5), 0.07); put(thump(140, 0.1), wd(11, 6) + 0.1, 0.25); put(hiss(1.0), wd(11, 8), 0.04)
# planet: hum, arcs ping
put(hum(3.0), wd(12, 0), 0.05)
for k in range(6): put(bell(1567 + 40 * k), wd(12, 7) - 0.6 + k * 0.12, 0.04, pan=rng.uniform(-.5, .5))
# final whisper: near silence, then a soft heartbeat into the loop
put(heartbeat(), wd(13, 3), 0.3)

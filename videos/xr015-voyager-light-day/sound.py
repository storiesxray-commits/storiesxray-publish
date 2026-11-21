# Sound cues for xr015-voyager-light-day: put(sound, time_s, gain, pan=-1..1).
# Deep space: a low hum bed + the light pulse swooshing down from Earth; 1977: a launch rumble and a cheer bell;
# mission control: console beeps, keyboard clicks, a time-lapse of clock ticks for the 2-day wait; "went quiet": everything drops to one hum.
# Loop: no musical resolution at the end, the last swoosh runs into the first frame.
MUSIC.update(tension_start=0.5, tension_len=20.0, resolve=None, dip=wd(6, 3) + 0.4, dip_w=1.0)
# shot cuts
for c in cuts: put(whoosh(0.3), c - 0.15, 0.07, pan=rng.uniform(-.4, .4))
# space bed and the light pulse (hook and the loop shot)
put(hum(2.5), 0.0, 0.05); put(sweep(1800, 600, 2.3), 0.05, 0.05, pan=-0.3)
put(blip(1600), wd(1, 3), 0.12)
put(hum(3.0), wd(8, 0) - 0.15, 0.018); put(sweep(1800, 700, 2.6), wd(8, 0), 0.015, pan=-0.3)
# "Voyager 1": a soft radio chirp
put(blip(1200), wd(2, 0) + 0.1, 0.1); put(blip(1800), wd(2, 0) + 0.25, 0.08)
# 1977 launch on the TV: rumble, then the room cheers (bell hit on "1977")
put(rumble(2.2), wd(2, 2) - 0.05, 0.12)
put(bell(1175), wd(2, 4), 0.06); put(bell(1568), wd(2, 4) + 0.08, 0.05)
# mission control: console beeps on the distance, a thump on "billion"
for k in range(5): put(beep(900 + 220 * (k % 3), 0.06), wd(3, 0) + 0.1 + k * 0.45, 0.035, pan=rng.uniform(-.5, .5))
put(thump(70, 0.3), wd(3, 2), 0.22)
# memory / selfie: a phone camera shutter on "selfie"
put(click(2600, 0.03), wd(4, 5), 0.18); put(paper(0.06), wd(4, 5) + 0.02, 0.12)
# text it: keyboard clicks, send blip, then the 48-hour time-lapse (fast ticks)
for k in range(9): put(click(1700 + 300 * (k % 3), 0.02), wd(5, 0) + k * 0.09, 0.07, pan=0.2)
put(blip(1400), wd(5, 1) + 0.25, 0.1)
for k in range(16): put(tick(k % 2 == 0), wd(5, 4) + k * 0.12, 0.08)
# "it went quiet": a low hum and the pulse rings
put(hum(1.8), wd(6, 3), 0.022)
for k in range(2): put(beep(220, 0.25), wd(6, 3) + 0.3 + k * 0.9, 0.015)
# "Would you keep waiting?": the clock again (runs into the loop)
for k in range(4): put(tick(k % 2 == 0), wd(7, 0) + k * 0.5, 0.08)

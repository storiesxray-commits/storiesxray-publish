# Sound cues for xr001-space-no-suit: put(sound, time_s, gain, pan=-1..1). Times use wd(sentence, word) where possible.
MUSIC.update(tension_start=12.0, tension_len=20.0, resolve=35.3, dip=32.35, dip_w=0.45)  # warm resolve when he wakes up
# --- sfx
put(rumble(5.6),0.0,0.28); put(rumble(TOT-38.5),38.5,0.28)
for tb in np.arange(0.12,5.3,0.72): put(heartbeat(),tb,0.5)
put(boom(1.0),0.0,0.22)
for c in cuts: put(whoosh(0.34),c-0.17,0.16,pan=rng.uniform(-.4,.4))
put(hum(6.2),5.4,0.05)
TS=11.484+0.78; put(hiss(2.0),TS,0.42); put(thud(),TS,0.6); put(alarm(14.6-TS-0.2),TS+0.2,0.035)
put(zap(),14.674,0.3)
tt=14.9
while tt<16.9: put(lp(hp(rng.standard_normal(int(SR*0.5)),800),4000)*env(0.5,0.2,0.25),tt,0.05); tt+=0.4
for tb in np.sort(rng.uniform(17.05,22.0,95)):
    k=(tb-17.0)/5; put(bubble(rng.uniform(350,1100)),tb,0.10+0.09*k,pan=rng.uniform(-.6,.6))
put(zap(0.3),22.07,0.14); put(whoosh(0.5),23.75,0.2)
for tb in (23.95,24.55,25.15,25.7): put(thump(70,0.25),tb,0.3)
put(boom(1.5),26.077,0.55)
gaps=[0.0,0.75,1.6,2.6]; 
for i,g in enumerate(gaps): put(heartbeat(),28.4+g,0.8*(1-0.2*i))
put(alarm(35.2-32.65),32.65,0.03); put(thud(),34.25,0.75)
put(airin(2.6),35.45,0.26); put(boom(0.8),35.45,0.3)

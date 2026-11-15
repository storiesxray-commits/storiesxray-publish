# Sound cues for xr003-fingers-wrinkle: put(sound, time_s, gain, pan=-1..1). Times use wd(sentence, word) where possible.
for c in cuts: put(whoosh(0.34),c-0.17,0.15,pan=rng.uniform(-.4,.4))
put(splash(1.0),0.02,0.4)
for tb in np.sort(rng.uniform(0.5,3.2,9)): put(bubble(rng.uniform(500,1100)),tb,0.12,pan=rng.uniform(-.5,.5))
for tb in np.arange(4.2,wd(2,8)-0.1,0.11): put(click(1200,0.03),tb,0.12)
put(thud(),wd(2,8),0.6); put(sweep(300,120,0.35),wd(2,8),0.12)
put(zap(),6.748,0.3)
for tb in np.arange(7.3,8.6,0.16): put(blip(rng.uniform(1500,2400),0.05),tb,0.07,pan=rng.uniform(-.5,.5))
put(under(2.1),8.74,0.2)
tt=8.9; gap=0.3
while tt<10.4: put(tick(),tt,0.16); tt+=gap; gap=max(0.06,gap*0.86)
for tb in np.sort(rng.uniform(8.9,10.6,7)): put(bubble(rng.uniform(400,900)),tb,0.1,pan=rng.uniform(-.5,.5))
for tb in np.arange(10.8,13.8,0.33): put(blip(1700,0.08),tb,0.1)
put(boom(0.8),13.3,0.3)
put(thud(),13.936+0.37,0.55); put(sweep(500,180,1.2),13.936+0.4,0.08)
put(sweep(260,140,1.6),16.1,0.07)
for tb in np.arange(wd(5,7),19.7,0.14): put(click(700,0.05),tb,0.16)
put(boom(1.1),wd(5,14),0.4)
for i,tb in enumerate(np.arange(20.3,23.5,0.5)): put(tick(i%2==0),tb,0.22)
put(zap(0.35),23.648,0.16)
for tb in np.sort(rng.uniform(23.8,28.4,12)): put(bubble(rng.uniform(400,900)),tb,0.08,pan=rng.uniform(-.5,.5))
put(thud(),26.8,0.45)
put(splash(0.7),28.7,0.25); put(boom(1.2),wd(7,7)-0.03,0.6)
T0=32.834
for per in (0.8,0.62):
    n=0
    while T0+(n+0.6)*per<36.25: put(glass(),T0+(n+0.6)*per,0.12,pan=-0.4 if per>0.7 else 0.4); n+=1
put(bell(2093),wd(8,9),0.1); put(bell(2637),wd(8,9)+0.1,0.1)
put(trickle(1.8),36.35,0.09)
put(rumble(3.0),38.135,0.3); put(hiss(2.9)*0+hp(rng.standard_normal(int(SR*2.9)),1500)*env(2.9,0.2,0.4),38.2,0.035)
put(splash(0.9),41.15,0.3)
for tb in np.sort(rng.uniform(41.5,44.4,8)): put(bubble(rng.uniform(500,1100)),tb,0.11,pan=rng.uniform(-.5,.5))
put(boom(1.3),wd(10,7)-0.05,0.5)

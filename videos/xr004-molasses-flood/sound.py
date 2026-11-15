# Sound cues for xr004-molasses-flood: put(sound, time_s, gain, pan=-1..1). Times use wd(sentence, word) where possible.
MUSIC.update(tension_start=8.0, tension_len=22.0, dip=33.0, dip_w=0.5)   # near-silence before "Twenty-one people die"
st_end7=tm['sentences'][6]['end']; st14=tm['sentences'][13]['start']-0.09
def pop_():
    a=thud()*0.6; b=click(2600,0.02)*0.8; a[:len(b)]+=b; return a
for c in cuts: put(whoosh(0.34),c-0.17,0.14,pan=rng.uniform(-.4,.4))
put(rumble(3.4),0.0,0.32); put(boom(1.4),0.05,0.5); put(splash(1.2),2.2,0.18)
# drip
put(bubble(220),wd(2,2)+0.35,0.25); put(thump(70,0.35),wd(2,2)+0.6,0.35)
# harbor + noon bell
put(under(4.2),wd(3,0),0.1); put(trickle(3.0),wd(3,0)+0.4,0.04)
for k in range(3): put(bell(523.25),wd(4,2)+k*0.55,0.12)
# x-ray tank
put(zap(),wd(5,4)-0.1,0.3); put(hum(2.4),wd(5,4)+0.3,0.05)
# warm: rising tone
put(sweep(180,420,1.4),wd(6,0)+0.1,0.07)
# rivets like gunfire
tt=wd(7,1); gap=0.24
while tt<st_end7: put(pop_(),tt,0.38,pan=rng.uniform(-.5,.5)); tt+=gap; gap=max(0.07,gap*0.85)
put(boom(1.6),wd(8,3)-0.05,0.38); put(rumble(2.2),wd(8,3),0.15); put(splash(1.0),wd(8,3)+0.15,0.14)
# scale
put(thud(),wd(9,4)+0.1,0.55); put(click(900,0.05),wd(9,4)+0.35,0.2)
# ooze then surge
put(bubble(160),wd(10,1),0.2); put(bubble(140),wd(10,3),0.2)
put(boom(1.3),wd(11,1)-0.05,0.4); put(rumble(1.6),wd(11,0),0.18)
# race
put(rumble(4.6),wd(12,0),0.38)
for i in range(6): put(splash(0.6),wd(12,0)+0.4+i*0.7,0.12,pan=rng.uniform(-.6,.6))
# flatten + El bends
for i in range(7): put(thud(),wd(13,1)+0.15+i*0.11,0.3,pan=rng.uniform(-.6,.6)); put(click(700,0.05),wd(13,1)+0.18+i*0.11,0.2)
put(sweep(140,70,1.0),wd(13,4),0.18); put(boom(0.9),wd(13,4)+0.15,0.35)
# aftermath: almost silence, a slow drip
put(under(3.2),st14,0.06)
for k in range(3): put(bubble(180+30*k),st14+0.9+k*1.1,0.1)
# smell: soft warm air
put(airin(2.8),wd(16,0),0.05)
# blueprint + stamp
put(paper(0.2),wd(17,0),0.25); put(thud(),wd(18,5)+0.12,0.6)
# loop
put(rumble(2.4),wd(19,0),0.3); put(boom(1.3),wd(20,2),0.55)

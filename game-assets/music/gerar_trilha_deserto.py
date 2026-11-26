#!/usr/bin/env python3
"""Trilha arcade original para o mundo do deserto do Bombardeiro."""
import math, random, wave
from array import array
from pathlib import Path

SR, BPM, BARS = 44100, 132, 48
BEAT = 60.0 / BPM
TOTAL = int(SR * BARS * 4 * BEAT)
random.seed(20261127)
left, right = [0.0] * TOTAL, [0.0] * TOTAL

def midi(n): return 440.0 * (2.0 ** ((n - 69) / 12.0))

def env(n, attack=.008, decay=.08, sustain=.68, release=.035):
    a, d, r = max(1,int(attack*SR)), max(1,int(decay*SR)), max(1,int(release*SR))
    e = [sustain] * n
    for i in range(min(a,n)): e[i] = i/a
    for i in range(a,min(a+d,n)): e[i] = 1-(1-sustain)*(i-a)/d
    for i in range(max(0,n-r),n): e[i] *= max(0,(n-1-i)/r)
    return e

def tone(start,duration,note,voice="lead",volume=.12,pan=0):
    begin=int(start*SR); count=min(int(duration*SR),TOTAL-begin)
    if begin<0 or count<=0: return
    freq=midi(note); e=env(count,.012 if voice=="lead" else .004,.09 if voice=="lead" else .045,.62 if voice=="bass" else .70,min(.075,duration*.22))
    phase=0.; lp=math.sqrt((1-pan)*.5); rp=math.sqrt((1+pan)*.5)
    for i in range(count):
        t=i/SR; vib=1+.0022*math.sin(2*math.pi*5*t) if voice=="lead" else 1
        phase += 2*math.pi*freq*vib/SR; q=math.sin(phase)
        if voice=="lead": sample=.48*(1 if q>=0 else -1)+.32*q+.20*math.sin(2*phase)+.16*math.sin(3*phase)
        elif voice=="bass": sample=.72*q+.20*math.sin(2*phase)+.08*math.sin(3*phase)
        elif voice=="arp": sample=.48*q+.34*math.sin(2*phase)+.18*math.sin(3*phase)
        else: sample=.55*q+.25*math.sin(phase*1.004)+.20*math.sin(2*phase)
        v=sample*e[i]*volume; left[begin+i]+=v*lp; right[begin+i]+=v*rp

def kick(start,volume=.25):
    b=int(start*SR); count=min(int(.22*SR),TOTAL-b); phase=0.
    for i in range(max(0,count)):
        t=i/SR; f=112*math.exp(-t*17)+39; phase+=2*math.pi*f/SR
        v=math.sin(phase)*math.exp(-t*18)*volume; left[b+i]+=v; right[b+i]+=v

def snare(start,volume=.14):
    b=int(start*SR); count=min(int(.16*SR),TOTAL-b)
    for i in range(max(0,count)):
        t=i/SR; v=(random.uniform(-1,1)*.72+math.sin(2*math.pi*190*t)*.28)*math.exp(-t*23)*volume
        left[b+i]+=.94*v; right[b+i]+=v

def hat(start,volume=.04):
    b=int(start*SR); count=min(int(.045*SR),TOTAL-b)
    for i in range(max(0,count)):
        v=random.uniform(-1,1)*math.exp(-(i/SR)*82)*volume
        left[b+i]+=.75*v; right[b+i]+=v

# D frígio dominante: clima misterioso, quente e aventureiro.
chords=[(50,53,57,62),(51,55,58,63),(46,50,53,58),(45,49,52,57),
        (50,53,57,62),(46,50,53,58),(51,55,58,63),(45,49,52,57)]
progression=[0,1,2,3,0,2,1,3]*6

# Camada harmônica suave, como cordas sintetizadas de console.
for bar in range(BARS):
    c=chords[progression[bar]]; start=bar*4*BEAT
    for j,n in enumerate((c[0]+12,c[2]+12,c[3]+12)):
        tone(start,3.92*BEAT,n,"pad",.021,-.42+j*.42)

# Baixo cadenciado, com pequenas síncopes.
for bar in range(BARS):
    root=chords[progression[bar]][0]-12; fifth=root+7
    for pos,n,d in ((0,root,.72),(1.5,fifth,.42),(2,root,.68),(3.25,fifth,.42)):
        tone((bar*4+pos)*BEAT,d*BEAT,n,"bass",.17,-.08)

# Melodia original com intervalos exóticos e resposta entre frases.
a=[(0,74,.5),(.5,75,.5),(1,78,.75),(1.75,75,.25),(2,74,.5),(2.5,69,.5),(3,66,.75),
   (4,67,.5),(4.5,69,.5),(5,74,.75),(5.75,73,.25),(6,74,.5),(6.5,70,.5),(7,66,.75),
   (8,65,.5),(8.5,70,.5),(9,74,.5),(9.5,77,.5),(10,78,.5),(10.5,74,.5),(11,70,.75),
   (12,69,.5),(12.5,73,.5),(13,78,.75),(13.75,77,.25),(14,75,.5),(14.5,73,.5),(15,69,.75)]
b=[(0,78,.5),(.5,82,.5),(1,86,.75),(1.75,82,.25),(2,78,.5),(2.5,75,.5),(3,74,.75),
   (4,75,.5),(4.5,78,.5),(5,82,.75),(5.75,86,.25),(6,82,.5),(6.5,78,.5),(7,74,.75),
   (8,77,.5),(8.5,82,.5),(9,86,.75),(9.75,82,.25),(10,78,.5),(10.5,77,.5),(11,74,.75),
   (12,75,.5),(12.5,78,.5),(13,86,1),(14,82,.5),(14.5,78,.5),(15,74,.75)]
for section in range(6):
    base=section*8; phrase=a if section in (0,2,4) else b
    strength=(.105,.14,.15,.155,.165,.175)[section]
    for pos,n,d in phrase:
        tone((base*4+pos)*BEAT,d*BEAT*.92,n,"lead",strength,.08)
        if pos in (1,5,9,13): tone((base*4+pos)*BEAT,d*BEAT*.82,n-12,"lead",strength*.27,-.24)

# Arpejos cintilantes e percussão arcade contínua.
for bar in range(BARS):
    c=chords[progression[bar]]
    notes=[c[0]+24,c[1]+24,c[2]+24,c[3]+24,c[2]+24,c[1]+24,c[3]+24,c[2]+24]
    for step,n in enumerate(notes): tone((bar*4+step*.5)*BEAT,.27*BEAT,n,"arp",.052,.26)
    for beat in range(4):
        kick((bar*4+beat)*BEAT,.23 if bar<4 else .27)
        hat((bar*4+beat)*BEAT,.035); hat((bar*4+beat+.5)*BEAT,.024)
    snare((bar*4+1)*BEAT,.12); snare((bar*4+3)*BEAT,.15)
    if bar%8==7:
        for step,n in enumerate((50,53,57,62)):
            tone((bar*4+3+step*.22)*BEAT,.15*BEAT,n,"bass",.065,.12)

# Masterização leve, estéreo e fades sem clique.
fade=int(.035*SR); frames=array("h"); peak=0.
for i in range(TOTAL):
    l=math.tanh(left[i]*1.28); r=math.tanh(right[i]*1.28)
    gain=i/fade if i<fade else ((TOTAL-1-i)/fade if i>=TOTAL-fade else 1.)
    l*=gain; r*=gain; peak=max(peak,abs(l),abs(r))
    frames.append(int(max(-1,min(1,l))*32767)); frames.append(int(max(-1,min(1,r))*32767))
scale=.88/max(peak,1e-9)
for i in range(len(frames)): frames[i]=max(-32768,min(32767,int(frames[i]*scale)))
out=Path("game-assets/music/bombardeiro_deserto_32bit.wav"); out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),"wb") as wav:
    wav.setnchannels(2); wav.setsampwidth(2); wav.setframerate(SR); wav.writeframes(frames.tobytes())
with wave.open(str(out),"rb") as wav:
    assert wav.getnchannels()==2 and wav.getsampwidth()==2 and wav.getframerate()==SR
    assert wav.getnframes()>SR*70
print(f"Trilha do deserto gerada e validada: {out} ({BARS*4*BEAT:.1f} segundos)")

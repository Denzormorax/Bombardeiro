#!/usr/bin/env python3
"""Gera uma trilha arcade original, inspirada na energia dos jogos 16/32-bit."""
import math
import random
import wave
from array import array
from pathlib import Path

SR = 44100
BPM = 146
BEAT = 60.0 / BPM
BARS = 48
DURATION = BARS * 4 * BEAT
TOTAL = int(SR * DURATION)
random.seed(20261126)

left = [0.0] * TOTAL
right = [0.0] * TOTAL

def midi(n):
    return 440.0 * (2.0 ** ((n - 69) / 12.0))

def envelope(count, attack=0.008, decay=0.08, sustain=0.68, release=0.035):
    a = max(1, int(attack * SR))
    d = max(1, int(decay * SR))
    r = max(1, int(release * SR))
    out = [sustain] * count
    for i in range(min(a, count)):
        out[i] = i / a
    for i in range(a, min(a + d, count)):
        out[i] = 1.0 - (1.0 - sustain) * ((i - a) / d)
    for i in range(max(0, count - r), count):
        out[i] *= max(0.0, (count - 1 - i) / r)
    return out

def add_tone(start, duration, note, voice="lead", volume=0.12, pan=0.0):
    begin = int(start * SR)
    count = min(int(duration * SR), TOTAL - begin)
    if begin < 0 or count <= 0:
        return
    freq = midi(note)
    env = envelope(count,
                   0.012 if voice == "lead" else 0.004,
                   0.09 if voice == "lead" else 0.045,
                   0.62 if voice == "bass" else 0.70,
                   min(0.075, duration * 0.22))
    phase = 0.0
    lpan = math.sqrt((1.0 - pan) * 0.5)
    rpan = math.sqrt((1.0 + pan) * 0.5)
    for i in range(count):
        t = i / SR
        vibrato = 1.0 + (0.0022 * math.sin(2 * math.pi * 5.0 * t) if voice == "lead" else 0.0)
        phase += 2.0 * math.pi * freq * vibrato / SR
        s = math.sin(phase)
        if voice == "lead":
            # Pulse-width synth with a soft harmonic layer: bright SNES/arcade character.
            sample = 0.62 * (1.0 if s >= 0 else -1.0) + 0.25 * s + 0.13 * math.sin(2 * phase)
            sample += 0.10 * math.sin(phase * 2.0)
        elif voice == "bass":
            sample = 0.72 * s + 0.20 * math.sin(2 * phase) + 0.08 * math.sin(3 * phase)
        elif voice == "arp":
            sample = 0.65 * s + 0.22 * math.sin(2 * phase) + 0.13 * math.sin(3 * phase)
        elif voice == "pad":
            sample = 0.55 * s + 0.25 * math.sin(phase * 1.004) + 0.20 * math.sin(2 * phase)
        else:
            sample = s
        value = sample * env[i] * volume
        left[begin + i] += value * lpan
        right[begin + i] += value * rpan

def kick(start, volume=0.24):
    begin = int(start * SR)
    count = min(int(0.22 * SR), TOTAL - begin)
    phase = 0.0
    for i in range(max(0, count)):
        t = i / SR
        f = 112.0 * math.exp(-t * 17.0) + 39.0
        phase += 2 * math.pi * f / SR
        value = math.sin(phase) * math.exp(-t * 18.0) * volume
        left[begin + i] += value
        right[begin + i] += value

def snare(start, volume=0.14):
    begin = int(start * SR)
    count = min(int(0.16 * SR), TOTAL - begin)
    for i in range(max(0, count)):
        t = i / SR
        noise = random.uniform(-1.0, 1.0)
        body = math.sin(2 * math.pi * 190 * t)
        value = (noise * 0.72 + body * 0.28) * math.exp(-t * 23.0) * volume
        left[begin + i] += value * 0.94
        right[begin + i] += value

def hat(start, volume=0.045, duration=0.045):
    begin = int(start * SR)
    count = min(int(duration * SR), TOTAL - begin)
    for i in range(max(0, count)):
        t = i / SR
        value = random.uniform(-1.0, 1.0) * math.exp(-t * 82.0) * volume
        left[begin + i] += value * 0.75
        right[begin + i] += value

# Harmonia alegre e aventureira em Ré maior, com passagem por Si menor.
chords = [
    (50, 54, 57, 62),  # D
    (47, 50, 54, 59),  # Bm
    (43, 47, 50, 55),  # G
    (45, 49, 52, 57),  # A
    (50, 54, 57, 62),  # D
    (45, 49, 52, 57),  # A
    (47, 50, 54, 59),  # Bm
    (43, 47, 50, 55),  # G
]
progression = [0, 1, 2, 3, 0, 3, 1, 2] * 6

# Camada harmônica macia, como pads e cordas sintetizadas de console.
for bar in range(BARS):
    chord = chords[progression[bar]]
    start = bar * 4 * BEAT
    for idx, note in enumerate((chord[0] + 12, chord[2] + 12, chord[3] + 12)):
        add_tone(start, 3.92 * BEAT, note, "pad", 0.022, (-0.42 + idx * 0.42))

# Baixo saltitante com pequenas síncopes.
for bar in range(BARS):
    root = chords[progression[bar]][0] - 12
    fifth = root + 7
    for beat_pos, note, length in (
        (0.0, root, 0.72), (1.5, fifth, 0.42),
        (2.0, root, 0.68), (3.25, fifth, 0.42)
    ):
        add_tone((bar * 4 + beat_pos) * BEAT, length * BEAT,
                 note, "bass", 0.17, -0.08)

# Tema principal original, em frases de 4 compassos com resposta melódica.
phrase_a = [
    (0, 74, .5), (.5, 78, .5), (1, 81, .75), (1.75, 78, .25),
    (2, 76, .5), (2.5, 74, .5), (3, 69, .75),
    (4, 71, .5), (4.5, 74, .5), (5, 78, .75), (5.75, 76, .25),
    (6, 74, .5), (6.5, 71, .5), (7, 69, .75),
    (8, 67, .5), (8.5, 71, .5), (9, 74, .5), (9.5, 79, .5),
    (10, 78, .5), (10.5, 74, .5), (11, 71, .75),
    (12, 73, .5), (12.5, 76, .5), (13, 81, .75), (13.75, 80, .25),
    (14, 78, .5), (14.5, 76, .5), (15, 73, .75),
]
phrase_b = [
    (0, 81, .5), (.5, 83, .5), (1, 86, .75), (1.75, 83, .25),
    (2, 81, .5), (2.5, 78, .5), (3, 76, .75),
    (4, 78, .5), (4.5, 81, .5), (5, 85, .75), (5.75, 83, .25),
    (6, 81, .5), (6.5, 78, .5), (7, 74, .75),
    (8, 79, .5), (8.5, 83, .5), (9, 86, .75), (9.75, 83, .25),
    (10, 81, .5), (10.5, 79, .5), (11, 76, .75),
    (12, 78, .5), (12.5, 81, .5), (13, 86, 1.0),
    (14, 83, .5), (14.5, 81, .5), (15, 78, .75),
]
for section in range(6):
    base_bar = section * 8
    phrase = phrase_a if section in (0, 2, 4) else phrase_b
    strength = (0.105, 0.145, 0.155, 0.155, 0.17, 0.18)[section]
    for beat_pos, note, length in phrase:
        add_tone((base_bar * 4 + beat_pos) * BEAT,
                 length * BEAT * 0.92, note, "lead", strength, 0.08)
        if beat_pos in (1, 5, 9, 13):
            add_tone((base_bar * 4 + beat_pos) * BEAT,
                     length * BEAT * 0.82, note - 12,
                     "lead", strength * 0.28, -0.24)

# Arpejos rápidos e brilhantes preenchendo os espaços da melodia.
for bar in range(BARS):
    chord = chords[progression[bar]]
    notes = [chord[0] + 24, chord[1] + 24, chord[2] + 24, chord[3] + 24,
             chord[2] + 24, chord[1] + 24, chord[3] + 24, chord[2] + 24]
    for step, note in enumerate(notes):
        add_tone((bar * 4 + step * 0.5) * BEAT,
                 0.27 * BEAT, note, "arp", 0.057, 0.26)

# Bateria constante com bumbo, caixa e chimbal; viradas a cada 8 compassos.
for bar in range(BARS):
    for beat_pos in range(4):
        kick((bar * 4 + beat_pos) * BEAT, 0.22 if bar < 4 else 0.27)
        hat((bar * 4 + beat_pos) * BEAT, 0.035)
        hat((bar * 4 + beat_pos + 0.5) * BEAT, 0.024)
    snare((bar * 4 + 1) * BEAT, 0.12)
    snare((bar * 4 + 3) * BEAT, 0.15)
    if bar % 8 == 7:
        for step, note in enumerate((50, 55, 59, 62)):
            add_tone((bar * 4 + 3 + step * 0.22) * BEAT,
                     0.15 * BEAT, note, "bass", 0.065, 0.12)

# Master suave: saturação analógica leve, estéreo e fades sem clique.
fade = int(0.035 * SR)
frames = array("h")
peak = 0.0
for i in range(TOTAL):
    l = math.tanh(left[i] * 1.28)
    r = math.tanh(right[i] * 1.28)
    if i < fade:
        gain = i / fade
    elif i >= TOTAL - fade:
        gain = (TOTAL - 1 - i) / fade
    else:
        gain = 1.0
    l *= gain
    r *= gain
    peak = max(peak, abs(l), abs(r))
    frames.append(int(max(-1.0, min(1.0, l)) * 32767))
    frames.append(int(max(-1.0, min(1.0, r)) * 32767))

# Normalização final com margem para evitar clipping.
scale = 0.88 / max(peak, 1e-9)
for i in range(len(frames)):
    frames[i] = max(-32768, min(32767, int(frames[i] * scale)))

output = Path("game-assets/music/bombardeiro_arcade_32bit.wav")
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes(frames.tobytes())

with wave.open(str(output), "rb") as wav:
    assert wav.getnchannels() == 2
    assert wav.getsampwidth() == 2
    assert wav.getframerate() == SR
    assert wav.getnframes() > SR * 70
print(f"Trilha gerada e validada: {output} ({DURATION:.1f} segundos)")

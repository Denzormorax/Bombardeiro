#!/usr/bin/env python3
"""Gera o impacto original do Guardião dos Braços Fortes (CC0)."""
import math
import random
import wave
from array import array
from pathlib import Path

SR = 44100
DURATION = 1.65
N = int(SR * DURATION)
random.seed(6612026)
left = [0.0] * N
right = [0.0] * N

def add(value, i, pan=0.0):
    left[i] += value * math.sqrt((1.0 - pan) * 0.5)
    right[i] += value * math.sqrt((1.0 + pan) * 0.5)

# Pancada principal: queda rápida de afinação, com subgrave encorpado.
phase = 0.0
for i in range(N):
    t = i / SR
    freq = 112.0 * math.exp(-t * 8.0) + 34.0
    phase += 2.0 * math.pi * freq / SR
    env = math.exp(-t * 5.2)
    body = math.sin(phase) * env * 0.92
    body += math.sin(phase * 0.5) * math.exp(-t * 3.2) * 0.38
    add(body, i, 0.0)

# Estalo rochoso inicial, filtrado para soar como pedra e terra cedendo.
low = 0.0
for i in range(N):
    t = i / SR
    noise = random.uniform(-1.0, 1.0)
    low += (noise - low) * 0.22
    crack_env = math.exp(-t * 30.0) * (1.0 if t < 0.62 else 0.0)
    grit_env = math.exp(-max(0.0, t - 0.10) * 5.5) * (1.0 if t >= 0.10 else 0.0)
    crack = (noise * 0.58 + low * 0.42) * crack_env * 0.72
    grit = (noise * 0.22 + low * 0.78) * grit_env * 0.20
    add(crack + grit, i, -0.10 + 0.20 * math.sin(t * 8.0))

# Ressonância de caverna curta e grave.
for i in range(N):
    t = i / SR
    tail = math.exp(-t * 2.8)
    rumble = (math.sin(2 * math.pi * 46 * t + 0.4) * 0.16
              + math.sin(2 * math.pi * 63 * t + 1.2) * 0.10
              + math.sin(2 * math.pi * 89 * t + 2.0) * 0.055)
    add(rumble * tail, i, 0.12)

# Pequenos fragmentos de pedra, distribuídos no primeiro segundo.
for hit in range(19):
    start = int((0.045 + random.random() * 0.82) * SR)
    length = int((0.012 + random.random() * 0.035) * SR)
    freq = random.uniform(720.0, 2450.0)
    amp = random.uniform(0.025, 0.075)
    pan = random.uniform(-0.72, 0.72)
    phase = random.random() * math.tau
    for j in range(length):
        i = start + j
        if i >= N:
            break
        t = j / SR
        env = math.exp(-t * random.uniform(55.0, 95.0))
        add(math.sin(phase + math.tau * freq * t) * env * amp, i, pan)

# Suavização de início/fim, saturação controlada e normalização com margem.
frames = array("h")
peak = 0.0
for i in range(N):
    t = i / SR
    fade = min(1.0, t / 0.003, (DURATION - t) / 0.045)
    l = math.tanh(left[i] * 1.28) * fade
    r = math.tanh(right[i] * 1.28) * fade
    peak = max(peak, abs(l), abs(r))
    frames.extend((int(l * 32767), int(r * 32767)))

scale = 0.94 / max(peak, 1e-9)
for i in range(len(frames)):
    frames[i] = max(-32768, min(32767, int(frames[i] * scale)))

output = Path("game-assets/audio/guardiao_impacto.wav")
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes(frames.tobytes())

with wave.open(str(output), "rb") as wav:
    assert wav.getnchannels() == 2 and wav.getsampwidth() == 2
    assert wav.getframerate() == SR and wav.getnframes() == N
    assert 1.6 <= wav.getnframes() / SR <= 1.7
assert output.stat().st_size > 250_000
print(f"Impacto do Guardião gerado e validado: {output} ({DURATION:.2f}s, estéreo, PCM 16-bit, 44.1 kHz)")

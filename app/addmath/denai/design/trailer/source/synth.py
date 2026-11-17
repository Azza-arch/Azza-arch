"""DENAI trailer: original 30 s score + SFX, synthesised from scratch (no samples).
120 BPM, 1 beat = 0.5 s = 15 video frames. Key: B minor / D major.
Sections: 0-5 atmos | 5-12 percussion enters | 12-22 build | 22-26 climax | 26-30 resolve.
"""
import numpy as np, wave, os
SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), 'public', 'audio')
os.makedirs(OUT, exist_ok=True)
BEAT = 0.5

def write(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    if peak > 0.98: x = x / peak * 0.98
    d = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r, sus_len):
    t = np.arange(n) / SR; e = np.zeros(n)
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where((t >= a + d) & (t < sus_len), s, e)
    e = np.where(t >= sus_len, s * np.exp(-(t - sus_len) / max(r, 1e-4)), e)
    return e

def additive(f, n, harm=8, roll=1.6, detune=0.0, phase=None, decay_h=None):
    t = np.arange(n) / SR; y = np.zeros(n)
    for h in range(1, harm + 1):
        amp = 1 / h ** roll
        if decay_h: amp = amp * np.exp(-t * decay_h * (h - 1))
        ph = rng.uniform(0, 2 * np.pi) if phase is None else phase
        y += amp * np.sin(2 * np.pi * f * h * (1 + detune) * t + ph)
    return y

def lowpass(x, cutoff):
    """Simple FFT brick-ish lowpass with smooth rolloff."""
    X = np.fft.rfft(x, axis=0); fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / (1 + (fr / cutoff) ** 4)
    return np.fft.irfft(X * (g if X.ndim == 1 else g[:, None]), n=len(x), axis=0)

def highpass(x, cutoff):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 - 1 / (1 + (fr / cutoff) ** 4)
    return np.fft.irfft(X * g, n=len(x))

def bandpass(x, lo, hi): return highpass(lowpass(x, hi), lo)

def reverb(x, secs=2.2, mix=0.3, seed=3):
    r = np.random.default_rng(seed); n = int(SR * secs)
    t = np.arange(n) / SR; decay = np.exp(-t * 6.9 / secs)
    irL = r.standard_normal(n) * decay; irR = r.standard_normal(n) * decay
    irL[:int(SR * 0.012)] = 0; irR[:int(SR * 0.017)] = 0
    irL = lowpass(irL, 6000); irR = lowpass(irR, 5500)
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    L = len(x) + n; F = 1 << int(np.ceil(np.log2(L)))
    mono = x if x.ndim == 1 else x.mean(1)
    Xf = np.fft.rfft(mono, F)
    wl = np.fft.irfft(Xf * np.fft.rfft(irL, F), F)[:len(x)]
    wr = np.fft.irfft(Xf * np.fft.rfft(irR, F), F)[:len(x)]
    dry = np.stack([x, x], 1) if x.ndim == 1 else x
    return dry * (1 - mix) + np.stack([wl, wr], 1) * mix * 0.6

def place(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i]

# ---------- harmony ----------
# Bm  G  D  A  (vi IV I V in D), one chord per bar (2 s)
CH = {'Bm': [47, 54, 59, 62, 66], 'G': [43, 50, 55, 59, 62], 'D': [50, 57, 62, 66, 69], 'A': [45, 52, 57, 61, 64], 'Em': [40, 52, 55, 59, 64]}
PROG = ['Bm', 'G', 'D', 'A'] * 4  # 16 bars covers 32 s
def chord_at(t): return PROG[int(t // 2)]

music = np.zeros((N, 2))

# ---------- pads (whole piece, swelling) ----------
pad = np.zeros(N)
for bar in range(15):
    t0 = bar * 2.0; name = PROG[bar]
    if t0 >= 26: break
    n = int(SR * 2.6)
    for m in CH[name][1:]:
        for dt in (-0.004, 0.0035):
            y = additive(midi(m), n, harm=7, roll=1.9, detune=dt)
            pad_e = env_adsr(n, 0.5, 0.4, 0.8, 0.5, 2.1)
            place(pad, y * pad_e * 0.075, t0)
# section gain curve for pad
t = np.arange(N) / SR
padgain = np.interp(t, [0, 3, 5, 12, 22, 26, 26.3], [0.55, 0.9, 0.8, 0.7, 1.0, 1.0, 0.0])
pad = lowpass(pad * padgain, 3500)
music += reverb(pad, 3.0, 0.45)

# ---------- arpeggio pluck (from 1.0 s) ----------
arp = np.zeros(N)
step = BEAT / 2  # 8ths
for k in range(int(26 / step)):
    tt = k * step
    if tt < 1.0: continue
    notes = CH[chord_at(tt)]
    pattern = [notes[2], notes[3], notes[4], notes[3]]
    m = pattern[k % 4] + 12
    n = int(SR * 0.6)
    y = additive(midi(m), n, harm=6, roll=1.2, decay_h=9) * np.exp(-np.arange(n) / SR * 6.5)
    vel = 0.05 if tt < 5 else 0.065 if tt < 12 else 0.08
    if 21.5 <= tt < 22: vel *= 0.4
    place(arp, y * vel, tt)
arp_st = reverb(arp, 1.6, 0.35, seed=5)
# ping-pong
d = int(SR * BEAT * 0.75)
arp_st[d:, 1] += arp[:-d] * 0.35
music += arp_st

# ---------- bass (from 12 s, 8ths, ducked) ----------
bass = np.zeros(N)
for k in range(int(12 / 0.25), int(26 / 0.25)):
    tt = k * 0.25
    if 21.5 <= tt < 22: continue
    root = CH[chord_at(tt)][0] - 12 + (12 if CH[chord_at(tt)][0] < 45 else 0)
    n = int(SR * 0.24)
    tn = np.arange(n) / SR
    y = (np.sin(2 * np.pi * midi(root) * tn) + 0.35 * np.sin(2 * np.pi * midi(root) * 2 * tn) + 0.12 * np.sin(2 * np.pi * midi(root) * 3 * tn))
    e = np.minimum(1, tn / 0.005) * np.exp(-tn * 5)
    place(bass, y * e * (0.16 if tt < 22 else 0.2), tt)
music += np.stack([bass, bass], 1)

# ---------- lead melody (climax 22-26) ----------
lead = np.zeros(N)
mel = [(78, 0), (81, .5), (83, 1), (81, 1.5), (86, 2), (83, 2.5), (81, 3), (78, 3.25), (81, 3.5)]
mel_b = [(83, 0), (81, .5), (78, 1), (76, 1.5), (78, 2), (81, 2.5), (85, 3), (86, 3.5)]
for base, seq in ((22.0, mel), (24.0, mel_b)):
    for m, off in seq:
        n = int(SR * 0.55); tn = np.arange(n) / SR
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tn) * np.minimum(1, tn / 0.2)
        y = np.zeros(n)
        for h, a in ((1, 1), (2, .45), (3, .25), (4, .12), (5, .06)):
            y += a * np.sin(2 * np.pi * midi(m) * h * np.cumsum(vib) / SR)
        e = np.minimum(1, tn / 0.015) * np.exp(-tn * 2.8)
        place(lead, y * e * 0.07, base + off)
music += reverb(lead, 2.0, 0.4, seed=9)

# ---------- drums ----------
drums = np.zeros(N)
def kick(v=1.0):
    n = int(SR * 0.45); tn = np.arange(n) / SR
    f = 45 + 80 * np.exp(-tn * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tn * 7) + 0.3 * rng.standard_normal(n) * np.exp(-tn * 300)
    return y * v
def snare(v=1.0):
    n = int(SR * 0.3); tn = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 1200, 8000) * np.exp(-tn * 16)
    tone = np.sin(2 * np.pi * 185 * tn) * np.exp(-tn * 25)
    return (nz * 0.8 + tone * 0.5) * v
def hat(v=1.0, open_=False):
    n = int(SR * (0.25 if open_ else 0.06)); tn = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7000) * np.exp(-tn * (14 if open_ else 70)) * v
K, S, H, HO = kick(0.62), snare(0.9), hat(1.1), hat(1.1, open_=True)
duck = np.ones(N)
def kick_at(tt, v=0.9):
    place(drums, K * v, tt)
    i = int(tt * SR); n = int(SR * 0.22); j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 0.45 + 0.55 * (np.arange(j - i) / n))
for b in range(int(30 / BEAT)):
    tt = b * BEAT
    if 5 <= tt < 12:
        if b % 2 == 0: kick_at(tt, 0.75)
        if tt >= 7 and b % 4 == 2: place(drums, S * 0.45, tt)
        place(drums, H * 0.18, tt + 0.25)
    elif 12 <= tt < 21.5:
        kick_at(tt, 0.85)
        if b % 2 == 1: place(drums, S * 0.6, tt)
        for q in range(2 if tt < 17 else 4):
            place(drums, H * (0.16 + 0.04 * (q % 2)), tt + q * BEAT / (2 if tt < 17 else 4))
    elif 22 <= tt < 26:
        kick_at(tt, 1.0)
        if b % 2 == 1: place(drums, S * 0.7, tt)
        if b % 4 == 3: place(drums, HO * 0.15, tt + 0.25)
        for q in range(4): place(drums, H * 0.2, tt + q * BEAT / 4)
# snare roll 20-21.5 (accelerating, crescendo)
tt = 20.0; i = 0
while tt < 21.5:
    place(drums, S * (0.2 + 0.4 * (tt - 20) / 1.5), tt)
    tt += 0.125 if tt < 20.75 else 0.0625
music *= np.stack([duck * 0 + np.where(t >= 12, 0.75 + 0.25 * duck, 1.0)] * 2, 1)
music += reverb(drums, 0.9, 0.12, seed=11)

# ---------- risers / swells ----------
def riser(length, f0=200, f1=2400, v=0.25):
    n = int(SR * length); tn = np.arange(n) / SR
    nz = rng.standard_normal(n)
    # sweep by blending progressively brighter bands
    lo = lowpass(nz, f0); hi = lowpass(nz, f1)
    a = (tn / length) ** 2
    y = lo * (1 - a) + hi * a
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(f0 / 2, f1 / 4, n)) / SR) * 0.15
    return (y + tone) * (tn / length) ** 2.2 * v
place_r = lambda x, tend: place(music, np.stack([x, x], 1), tend - len(x) / SR)
place_r(riser(1.5, 300, 6000, 0.22), 21.75)
place_r(riser(2.0, 150, 3000, 0.14), 12.0)
place_r(riser(0.9, 300, 5000, 0.18), 26.95)

# ---------- final resolution chord (D major) 27-30 ----------
res = np.zeros(N)
for m in [38, 50, 57, 62, 66, 69, 74]:
    n = int(SR * 3.0)
    y = additive(midi(m), n, harm=6, roll=1.7)
    e = np.minimum(1, np.arange(n) / SR / 0.02) * np.exp(-np.arange(n) / SR * 1.0)
    place(res, y * e * 0.08, 27.0)
music += reverb(res, 3.5, 0.5, seed=13)

# master: gentle fade-in, fade-out end, soft clip
fade = np.interp(t, [0, 0.05, 29.3, 30], [0, 1, 1, 0])
music *= fade[:, None]
music = np.tanh(music * 1.6) / np.tanh(1.6)
write('music.wav', music)

# ---------- SFX one-shots ----------
def whoosh(length=0.7, v=0.5, bright=4000):
    n = int(SR * length); tn = np.arange(n) / SR
    nz = rng.standard_normal(n)
    a = np.sin(np.pi * tn / length) ** 2
    y = lowpass(nz, 600) * (1 - a) + lowpass(nz, bright) * a
    pan = np.linspace(-0.8, 0.8, n)
    st = np.stack([y * a * (1 - pan) / 2, y * a * (1 + pan) / 2], 1) * v * 2
    return reverb(st.mean(1), 0.8, 0.25)
write('whoosh.wav', whoosh())
write('whoosh-short.wav', whoosh(0.4, 0.4, 6000))

def coin():
    n = int(SR * 0.35); tn = np.arange(n) / SR
    f = np.where(tn < 0.07, midi(88), midi(95))
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4
    y = lowpass(y, 7000) * np.minimum(1, tn / 0.003) * np.exp(-tn * 9)
    return reverb(y * 0.5, 0.6, 0.2)
write('coin.wav', coin())

def clunk():
    n = int(SR * 0.6); tn = np.arange(n) / SR
    body = sum(np.sin(2 * np.pi * f * tn) * np.exp(-tn * d) * a for f, d, a in ((92, 14, .9), (233, 22, .5), (517, 30, .35), (1290, 45, .2)))
    click = highpass(rng.standard_normal(n), 2500) * np.exp(-tn * 120) * 0.5
    ratchet = np.zeros(n)
    for k in range(4): place(ratchet, highpass(rng.standard_normal(int(SR * .02)), 3000) * np.exp(-np.arange(int(SR * .02)) / SR * 200) * .3, 0.06 + k * 0.045)
    return reverb((body + click + ratchet) * 0.6, 0.7, 0.2)
write('clunk.wav', clunk())

def ui_tick():
    n = int(SR * 0.12); tn = np.arange(n) / SR
    y = np.sin(2 * np.pi * 1760 * tn) * np.exp(-tn * 50) * 0.4 + np.sin(2 * np.pi * 2640 * tn) * np.exp(-tn * 70) * 0.2
    return reverb(y, 0.3, 0.15)
write('ui.wav', ui_tick())

def water():
    n = int(SR * 2.2); tn = np.arange(n) / SR
    nz = bandpass(rng.standard_normal(n), 250, 2500)
    gurgle = np.zeros(n)
    for k in range(40):
        st = rng.uniform(0, 2.0); fl = rng.uniform(300, 900); ln = int(SR * .05)
        tb = np.arange(ln) / SR
        place(gurgle, np.sin(2 * np.pi * (fl + 2500 * tb) * tb) * np.exp(-tb * 60) * .25, st)
    e = np.interp(tn, [0, .3, 1.6, 2.2], [0, 1, .7, 0])
    return reverb((nz * .5 + gurgle) * e * .5, 1.2, .3)
write('water.wav', water())

def impact():
    n = int(SR * 4.0); tn = np.arange(n) / SR
    f = 32 + 70 * np.exp(-tn * 6); boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn * 1.4)
    crack = lowpass(rng.standard_normal(n), 3000) * np.exp(-tn * 9) * 0.6
    shimmer = sum(np.sin(2 * np.pi * midi(m) * tn) * np.exp(-tn * 1.2) * .05 for m in (74, 78, 81, 86))
    return reverb((boom + crack + shimmer) * 0.9, 3.5, 0.35, seed=21)
write('impact.wav', impact())

def hit():
    n = int(SR * 1.2); tn = np.arange(n) / SR
    f = 50 + 60 * np.exp(-tn * 15); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tn * 4)
    y += lowpass(rng.standard_normal(n), 2500) * np.exp(-tn * 25) * .4
    return reverb(y * .7, 1.5, .3)
write('hit.wav', hit())

def reverse_swell(length=1.2):
    x = impact()[:int(SR * length)][::-1]
    a = np.linspace(0, 1, len(x)) ** 2
    return x * a[:, None] * 0.5
write('swell.wav', reverse_swell())
print('ok')

"""Renders each production SFX (from the real src/audio.js, not a
reimplementation) through an OfflineAudioContext and saves it as an actual
listenable WAV file, for human quality review."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import wave
import struct

OUT = Path(__file__).parent.parent.parent.parent.parent / 'audits' / 'level-v8' / 'phase4' / 'sfx-preview'
OUT.mkdir(parents=True, exist_ok=True)

# window.AudioContext is wrapped to always construct an OfflineAudioContext
# instead — AudioManager.unlock() calls `new Ctx()` with no arguments, so
# this factory trick (a constructor function that `return`s a different
# object) is the only change needed; audio.js itself is untouched.
INSTRUMENT = """
(() => {
  function Wrapped() { return new OfflineAudioContext(1, 44100 * 2, 44100); }
  window.AudioContext = Wrapped;
  window.webkitAudioContext = Wrapped;
})();
"""

SOUNDS = ['jump', 'land', 'coin', 'checkpoint', 'correct', 'incorrect', 'machine', 'bridge', 'victory', 'ui']

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for name in SOUNDS:
        pg = b.new_page(viewport={'width': 400, 'height': 300})
        pg.add_init_script(INSTRUMENT)
        pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
        pg.wait_for_selector('#welcome:not([hidden])')
        pg.click('#start')  # the real unlock() call path, now constructing an OfflineAudioContext
        pg.wait_for_timeout(100)
        samples = pg.evaluate(f"""async () => {{
          const mod = await import('./src/audio.js');
          const {{ audio, SFX }} = mod;
          SFX['{name}'](audio, .6);
          const buffer = await audio.ctx.startRendering();
          return Array.from(buffer.getChannelData(0));
        }}""")
        pcm = bytearray()
        peak = max((abs(s) for s in samples), default=0) or 1
        for s in samples:
            v = max(-1, min(1, s))
            pcm += struct.pack('<h', int(v * 32767))
        with wave.open(str(OUT / f'{name}.wav'), 'wb') as wf:
            wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(44100)
            wf.writeframes(bytes(pcm))
        print(f'{name}: {len(samples)} samples, peak={peak:.3f} -> {name}.wav')
        pg.close()
    b.close()
    print('done')

# Lorong Atas Bumbung — V8 Phase 4: Audio Quality Review

**Important:** everything in `audio-settings-tests.md` and `audio-lifecycle-tests.md` proves *mechanical correctness* — the right sound fires at the right event, exactly once, with the right gain relationships, with no leaks. **None of that proves the sounds are pleasant, well-balanced, or "feel right."** That is a subjective, human-listening judgment this report does not and cannot make on the user's behalf. This document exists to make that review easy, not to substitute for it.

## Listenable evidence

Every one of the 10 SFX was rendered through an `OfflineAudioContext` running the **actual production code** in `src/audio.js` (not a reimplementation — the real `AudioManager`/`SFX` module, with `window.AudioContext` temporarily pointed at an offline renderer so the exact same code path executes and produces real PCM samples) and saved as a standard WAV file:

```
audits/level-v8/phase4/sfx-preview/
  jump.wav  land.wav  coin.wav  checkpoint.wav  correct.wav
  incorrect.wav  machine.wav  bridge.wav  victory.wav  ui.wav
```

Each is a 2-second mono 44.1kHz WAV (most of which is silence after the sound itself finishes, since the render window is fixed) — **please listen to these directly**; that's the only real quality check.

## Measured levels (objective — amplitude, not "quality")

| Sound | Peak amplitude | Relative loudness tier |
|---|---|---|
| land | 0.111 | quietest |
| ui | 0.202 | |
| jump | 0.228 | |
| bridge | 0.318 | |
| coin | 0.342 | |
| machine | 0.388 | |
| incorrect | 0.410 | |
| victory | 0.465 | |
| correct | 0.472 | |
| checkpoint | 0.504 | loudest |

No sound clips (every peak is well under 1.0). The ordering matches the intended priority (movement sounds quietest, puzzle/checkpoint/victory loudest) — this part is objectively verifiable and was verified. Whether the *absolute* gap between tiers feels right, or whether any individual sound is too loud/quiet relative to how it's perceived (not just measured), is not something amplitude alone can answer.

## Design notes and honest, specific concerns for a human listener to check

- **`machine.wav`** uses a square-wave oscillator (the only non-sine/triangle/sawtooth category besides `bridge`'s sawtooth) specifically to read as "mechanical," per the brief's own wording. Square waves are harmonically the harshest of the available oscillator types — this was a deliberate choice, but it's the one sound in the set most likely to feel slightly out of place next to the otherwise soft, warm sine/triangle palette. **Flagged for listening review specifically**, not asserted as fine.
- **`correct.wav` and `machine.wav` fire 120ms apart** (see `audio-event-mapping.md`) as two separate short phrases rather than one blended sound. This was a judgment call to keep each sound simple and avoid building a mixing/ducking system; a human listen may find the 120ms gap reads as "two sounds" rather than "one connected response," which could be adjusted (the delay value is a single named constant in the `setTimeout` call) if that's not the desired feel.
- **`incorrect.wav`** was deliberately kept soft and low (two descending sine notes, no sharp attack) per the brief's explicit "never harsh or shame-inducing" instruction — this is the sound most worth a second opinion from someone thinking specifically about how it will land with a student who just got a math question wrong, since that's a judgment about pedagogical tone, not acoustics.
- **No reverb, filtering, or stereo width** was used anywhere — every sound is dry, mono-equivalent (rendered to a single channel for the preview; in-game it plays through the browser's normal stereo output unprocessed). This keeps the implementation small and the sounds "clean," but it also means nothing has any sense of space — entirely flat, which may or may not match the intended "warm" character from the brief's §1 goal.
- **Duration**: every sound is short (50ms–560ms total). This was a deliberate restraint choice (brief: "without being distracting"), but for `victory.wav` specifically (the one moment meant to feel like a genuine celebration after completing the whole level), a human listener may find four quick notes at ~100ms each feels slightly brief/undersold for that particular moment — worth a specific listen given how much weight that one event carries.

## What this report does NOT claim

- That any sound is "good" — only that it was generated correctly, fires at the right time, at a measured and intentional relative volume, and does not clip.
- That the overall palette is cohesive or matches "gentle, playful, Malaysian educational" as a subjective aesthetic target — that's exactly the kind of judgment the brief's own instruction ("do NOT claim that programmatic tests prove subjective audio quality") says must not be asserted here.

**Recommendation:** listen to all 10 files in `sfx-preview/` before treating Phase 4 as fully "done" in the subjective sense — the mechanical/architectural implementation is complete and verified, but sound design quality is a human call this report deliberately leaves open.

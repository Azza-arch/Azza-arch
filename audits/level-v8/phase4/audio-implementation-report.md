# Lorong Atas Bumbung — V8 Phase 4: Original Sound Design & Audio System — Report

**Status: implemented.** Scope: one new module (`src/audio.js`), its wiring into `src/game.js` at existing single-fire gameplay events, and a compact settings addition to the existing `index.html`/`style.css` pause dialog. Phases 0–3.1 (gameplay, scenery, animation, particle effects, pause fixes) are preserved untouched. Nothing committed.

---

## 1. Files changed

| File | Change |
|---|---|
| `src/audio.js` | **New.** The `AudioManager` class, per-category mixing levels, 10 synthesized SFX definitions, one module-scope singleton (`export const audio = new AudioManager()`). |
| `src/game.js` | Import added; one SFX trigger call added at each of the event sites listed in `audio-event-mapping.md`; `audio.unlock()`/`SFX.ui()` added to the `#start` click handler; `audio.pause()`/`audio.resume()` added alongside the existing `tweens.pauseAll()`/`time.paused` lines in `pauseRun()`/`resumeRun()`; three new `addEventListener` calls wiring the mute checkbox and two volume sliders. |
| `index.html` | Added a `.audio-settings` block (mute checkbox + two range inputs) inside the **existing** `#paused` dialog — no new dialog/screen created. |
| `style.css` | Added `.audio-settings`/`.audio-row` rules, using only existing CSS custom properties (`var(--ink)`, `var(--line)`) — no new color literals. |

No asset files were added anywhere — every sound is synthesized at runtime from oscillator/gain nodes. `assets/manifest.json`'s key count is unaffected (confirmed by `node --test`'s asset-integrity test still passing unchanged).

## 2. Architecture (brief §2)

- **Web Audio API**, no dependencies, no library.
- **Single `AudioContext`**, created lazily inside `AudioManager.unlock()`, called only from the `#start` button's click handler — the canonical first user gesture in this game, already the existing entry point for `startRun()`. `unlock()` is idempotent (a second call just resumes the existing context) so it's safe to call from more than one place if a future pass needs to.
- **Master volume + SFX volume**: two `GainNode`s in series (`sfx → master → destination`), each independently settable and persisted. A `sfx` gain stage specifically (rather than one flat volume) was chosen so that a later music-category addition — explicitly out of scope for this phase — would have a natural second bus to attach to without restructuring.
- **Mute/unmute**: a boolean that zeroes the master gain (via `setTargetAtTime`, not an abrupt value jump, to avoid a click) without touching any per-sound scheduling — muting and un-muting is instant and never throws.
- **Persistence**: `localStorage` under one versioned key (`lorong-audio-settings-v1`), read once at `AudioManager` construction, written on every settings change. Wrapped in try/catch — private browsing or a storage quota failure degrades to in-memory defaults, never throws into gameplay code.
- **Singleton, not a Scene member**: `audio` is a module-scope `const`, created once when `audio.js` is first imported — **not** inside the Phaser `Scene` class. A `scene.restart()` (replay) tears down and recreates the Scene but never touches this module, so it is structurally impossible for a replay to create a second `AudioContext` — confirmed empirically (§ below).
- **Cleanup**: every one-shot sound's nodes are disconnected via a `setTimeout` scheduled to fire slightly after the sound's own scheduled stop time — mirroring the exact pattern Phase 3's `dustBurst`/`sparkleBurst` already use for their particle emitters, not a new cleanup idiom.
- **No exceptions if unavailable**: `unlock()`'s `new Ctx()` call is wrapped in try/catch; every subsequent play call checks `if (!this.ctx) return;` first. Verified live with `window.AudioContext` deleted before the page loads — full gameplay (jump, puzzle solve, gate opening) completed with zero page errors.

## 3. The ten SFX (brief §3)

All synthesized from scratch (oscillator type + frequency + short attack/decay envelope, see `src/audio.js`'s `tone()`/`sequence()` helpers) — no melody, sample, or waveform was copied from any existing game, game pack, or third-party source.

| Sound | Design | Trigger |
|---|---|---|
| Jump | Short ascending triangle sweep (420→640Hz, 100ms) | The exact line the jump impulse is applied (both ground-jump and ladder-jump-off sites) |
| Landing | Short, low sine tap (160–200Hz depending on impact), 50–80ms | Phase 2/3's already-proven landing edge, pitch/duration nudged by the same impact-speed value already computed for the landing dust |
| Coin | Bright two-note triangle arpeggio (880→1318Hz) | Inside the existing coin-overlap block |
| Checkpoint | Gentle two-note sine confirmation (C5→E5) | Inside the existing checkpoint-reached block |
| Correct answer | Three-note rising triangle chime (C5-E5-G5) | `answer()`'s correct branch, immediately |
| Incorrect answer | Soft two-note sine descent (G4→E4) — deliberately not dissonant or buzzer-like | `answer()`'s wrong-answer branch, immediately |
| Machine activation | Three-note square-wave sequence (slightly "mechanical" timbre) | Same correct branch, staggered 120ms after the correct chime so the two don't blur together |
| Bridge unlock | Rising sawtooth sweep (180→420Hz, 300ms) | The exact line the gate's collision body and plank art are created |
| Victory | Four-note rising triangle jingle (C5-E5-G5-C6) | `finish()`, at the same moment the Phase 3.1 sparkle celebration starts — **not** gated behind `prefers-reduced-motion` |
| UI | Very short, quiet sine tick | `#start` and `#replay` clicks only — not on every button, not on hover |

## 4. Mixing (brief §4)

Fixed per-category gain multipliers (`LEVELS` in `src/audio.js`) implement the requested priority ordering without a dynamic mixer: checkpoint/correct/victory sit at 0.5–0.6, machine/bridge/coin at 0.32–0.42, and the frequent movement sounds (jump/land) at 0.14–0.16 — roughly a third the level of the most important feedback. Confirmed by rendering every sound through an `OfflineAudioContext` (§ "Listenable evidence" below) and measuring peak amplitude: jump/land/ui peaked at 0.11–0.23, checkpoint/correct/victory at 0.47–0.50 — the intended ordering holds in the actual rendered output, not just the source multipliers. A simple voice limiter (`MAX_VOICES = 6`) drops new *low-priority* requests once too many oscillators are already ringing, while checkpoint/correct/victory/bridge/machine are never dropped.

## 5. Settings (brief §5)

Extended the **existing** pause dialog (`#paused`) — no new screen. Mute checkbox + master/SFX sliders, all wired to `AudioManager`'s already-persisted values on load. No audio plays before the user's own `#start` click, satisfying "do not silently autoplay."

## 6. Integration discipline (brief §6)

Every SFX call site is a single added line (or two) inside a block that was already proven single-fire by Phases 2–3 — no new gating logic was invented for duplicate-prevention; audio inherits the same guarantee the visual effects already rely on. No SFX call site changes any gameplay variable, state, or control flow — confirmed by the unit/regression suites passing unchanged and by direct code review (every `SFX.x(audio)` / `audio.unlock()` / `audio.setX(...)` call is either a bare expression statement or assigns only to `AudioManager`'s own internal fields).

## 7. Pause and lifecycle (brief §7)

`pauseRun()`/`resumeRun()` gained exactly two lines each (`audio.pause()`/`audio.resume()`), placed alongside — not replacing — Phase 3.1's `tweens.pauseAll()`/`time.paused` lines. `AudioContext.suspend()`/`.resume()` is the Web Audio API's own native pause mechanism, freezing every in-flight envelope's time progression exactly the way the tween pause already freezes visual effects — verified live (§ below) that a sound scheduled just before a pause does not finish "behind" the pause screen and that gameplay (and its sounds) resume normally afterward.

## 8. Known limitations / things flagged for human listening review

See `audio-quality-review.md` for the full, explicitly-labeled-as-subjective discussion. In short: the synthesis is intentionally simple (single oscillators with linear/exponential envelopes, no filtering, no reverb/delay) to stay small, fast, and "restrained" per the brief's own repeated emphasis — a human listening pass may find some sounds (especially `machine`, the square-wave sequence) a touch more "buzzy" than the rest of the otherwise warm, soft palette, which is disclosed rather than asserted as already-resolved.

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — unchanged, still entirely untracked. No commit was made.

**Stopping here. Not proceeding to Phase 5.**

# DENAI — Animation, Feedback & Game-Feel Audit (Day 01)

## Inventory (what exists)
| Moment | Current implementation | Evidence | Gap |
|---|---|---|---|
| Idle | 12-frame loop | `assets/chill-boy/idle-00..11` | OK |
| Run | 10-frame loop | `run-00..09` | OK |
| Jump / fall | 1 frame each | `jump-00`, `fall-00` | No anticipation/squash; acceptable for pixel art but stiff |
| Landing | dust particles + `SFX.land` (`feel.js`) | — | No landing pose |
| Climb | none (reuses idle/run while on ladder) | no `climb-*` frames | **Missing** — ladders are frequent |
| Interact | none (prompt + SFX only) | — | No reach/press pose |
| Correct answer | bubble + `SFX.correct` + world change (bridge, water, stones) | `sluice-line.js`, `workshop-line.js` | No character reaction |
| Incorrect answer | bubble + `SFX.incorrect`, gate falls back | — | OK (gentle by design) |
| Puzzle completion | 2-line dialogue + gold stamp "Misi selesai" flying to the Journal (`ui/v4-ui.js stamp`) | V4 | Good base |
| Coin | spin + spark pool + "+1" by plaque | `feel.js coinPickup` | Good |
| Level / mission completion | `#complete` card, tally counts up, record badge | `victory.js` | No celebration beat before the card |
| Reward reveal | coin/secret counters only | — | No XP/stars to reveal |
| Scene transitions | camera cut; victory as modal | — | No transition language |
Reduced motion: respected in V4 UI and coin spin (`prefers-reduced-motion`, l3-check D).

Sound (all synthesised, `src/audio.js`): jump, land, coin, checkpoint, correct, incorrect, machine, bridge, victory, ui. **Missing:** ladder steps, valve ratchet, lever clunk, water flow, store purchase, dialogue blip, stamp hit, ambient bed, music (there is no in-game music at all).

## Proposed DENAI Celebration System (design only)
Trigger: a puzzle model returns success (`testFlow → 'open'`, `runLine().enough`, `checkPurchase().ok` + bridge installed). Total ≤ 2.6 s, skippable with E/tap after 0.6 s, reduced-motion variant = static.
| Step | t (s) | Duration | What | Implementation |
|---|---|---|---|---|
| 1 Trigger | 0.0 | — | lock input (`uiLocks.add('celebrate')`) | existing lock system |
| 2 World payoff | 0.0 | 0.8 | the machine acts (bridge, water, stones) — keep current | existing tweens |
| 3 Character reaction | 0.3 | 0.6 | Chill Boy "yes!" pose (new 3–4 frame `cheer` anim) + small hop | new frames needed (do not reuse third-party characters) |
| 4 Success effect | 0.4 | 0.5 | soft radial flash at the machine + 12–20 pixel sparks (reuse `feel.js` pool) | Phaser particles, CANVAS-safe |
| 5 Confetti | 0.6 | 1.0 | 30–40 pixel confetti from the HUD edges (DOM/CSS) | CSS transforms, `will-change`, capped count |
| 6 Reward reveal | 0.9 | 0.8 | "+1 Misi · +XP" chip counts up into the plaque | extends `stamp()` |
| 7 Message | 1.2 | — | existing 2-line dialogue (learning line) | existing `dialogue()` |
| 8 Continue | after dialogue | 0.3 | unlock input, fade chips | existing |
Sound: rising 3-note chime at step 3, sparkle at 4, "tick-tick" per XP point at 6. Durations follow common game-feel guidance (feedback < 100 ms, celebration < 3 s); not copied from any product.

Level completion: insert a 1.5 s beat (camera eases to Chill Boy, cheer pose, confetti) before `#complete` opens.

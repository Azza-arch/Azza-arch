# Lorong Atas Bumbung — V8 Baseline

**Status: inspection only. Nothing implemented, nothing modified.** Source of truth: the live, untracked `app/addmath/rooftop/` directory, read directly — not any V5–V7 proposal document.

---

## 1. Git status (working tree preserved, not touched)

```
git status --porcelain
```
Shows pre-existing, unrelated modifications in other apps (`app/addmath/src/screens/startScreen.js`, `app/tense-tales/*`, `demos/*`) and several untracked paths, including `?? app/addmath/rooftop/` — **the entire rooftop game directory has never been committed to this repository**, across every V5–V7 pass. This is the existing, expected state, not something this session created. Per instruction, none of this was reset, cleaned, or touched.

Current branch: `main`. No V8-related commits exist yet.

## 2. Reversible snapshot

Saved to `audits/level-v8/baseline-snapshot/` (outside the live source tree): `level.js.bak`, `game.js.bak`, `style.css.bak`, `index.html.bak`, `level.test.mjs.bak`, `probe.py.bak`, `manifest.json.bak`, `provenance.json.bak`. This is the exact state any future V8 phase change can be diffed or reverted against.

## 3. Current tests, run without modification

- **`node --test` (`tests/level.test.mjs`): 11/11 pass.**
- **`tests/probe.py` (full browser regression — desktop, mobile, missing-asset path, unrelated Add Math shell): pass, 0 page errors, 0 console errors, 0 failed requests.** Confirmed via a live run in this session (not assumed from a prior report): full natural-input A→B→C→D→E→F→G→GOAL traversal, all three machines solved, all three checkpoints reached, checkpoint-recovery and replay both confirmed, `routePlatforms.length===15`.

No assertion was weakened or skipped to obtain these results — this is the test suite exactly as it stands in the live repo.

## 4. Current level layout (V7 topology — confirmed live, not from the V7 report)

A genuinely vertical, 4-tier world, not flat corridors:

| Tier | y | Zones |
|---|---|---|
| GROUND | 1100 | A (spawn), F/G (final approach + bridge) |
| TIER2 | 980 | B (town walkway), D (workshop walkway) |
| TIER3 | 820 | C (café, dead-end detour back to B) |
| TIER4 | 660–740 | E (rooftop chain, hosts Machine 2) |

`WORLD = { width: 4300, height: 1300, gravity: 1400 }`. Seven zones (`ZONES`), with C and E declared as height-disambiguated stacks over B and D's x-ranges respectively (`yMax` field, read by `currentZoneIndex()`).

## 5. Player physics constants (live, `MOTION` + `WORLD.gravity`)

```
speed: 280, acceleration: 2100, braking: 2500, jump: 520,
climb: 150, coyote: 110, buffer: 130, bodyWidth: 28, bodyHeight: 60
gravity: 1400
```
Derived: max jump rise = 96.6px, flat max jump range = 208px. **These are the values any V8 "game feel" phase must treat as fixed** per rule #3 — not to be changed without explicit future authorization.

## 6. Puzzle formulas (live, `PUZZLES`, unchanged since V6)

| Puzzle | Gate | Formula | Given | Answer |
|---|---|---|---|---|
| p1 | workshop-gate | f(x) = 2x + 1 | x = 3 | f(3) = 7 |
| p2 | rooftop-gate | f(x) = 3x − 2 | f(x) = 10 | x = 4 |
| p3 | final-gate | f(x) = 4x − 3 | f(x) = 17 | x = 5 |

## 7. Machine, gate, checkpoint, spawn/goal coordinates (live)

| Entity | x | y / feet | Notes |
|---|---|---|---|
| SPAWN | 80 | 1100 | |
| GOAL | 4100 | 1100 | |
| M1 (`p1`) | 1250 | 980 | gates `workshop-gate` (x:1300, width:300, y:980) |
| M2 (`p2`) | 2400 | 660 | gates `rooftop-gate` (x:2580, width:300, y:660) |
| M3 (`p3`) | 3650 | 1100 | gates `final-gate` (x:3700, width:300, y:1100) |
| CP1 | 950 | 820 | café detour |
| CP2 | 2950 | 700 | post-rooftop-gate |
| CP3 | 3550 | 1100 | pre-bridge |

Full deck/ladder/collectible table: `app/addmath/rooftop/src/level.js` (authoritative) or `audits/level-v7/v7-zone-coordinate-table.csv` (historical record, re-verified matching on this pass).

## 8. Camera configuration (live, `src/game.js`)

```
cameras.main.setBounds(0, 450, WORLD.width, WORLD.height - 450)
cameras.main.startFollow(player, true, .14, .16, -85, 10)   // offsetX=-85, offsetY=10
viewport (logical): height 700, width = round(700 * frame.clientWidth/frame.clientHeight)
```
`bounds.top=450` is a V7-specific derived value (`WORLD.height(1300) - viewportHeight(700) = 600` ceiling, with a 150px margin) — not a general constant.

## 9. Asset manifest and provenance (live)

`assets/manifest.json`: **90 keys**, confirmed unchanged (`node --test`'s own asset-integrity test re-hashes every file against `assets/provenance.json` and passed). Families present: Kenney New Platformer Pack (`assets/kenney/`, currently the only family wired into rendering), `assets/production/` (Ground, Houses, HouseParts, Props, Puzzle, Traversal — imported, provenance-tracked, **not currently rendered**: `buildScenery()` exists in `game.js` but its call is commented out, disabled during the V7 rewrite since its coordinates were tuned for the old V6.3 flat world), `assets/background-legacy/` (same unused status), and `assets/chill-boy/` (24 character frames: idle×12, run×10, jump×1, fall×1 — fully wired, in use).

**No audio files exist anywhere in the project** (`find . -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.wav"` returns nothing). Phaser is explicitly configured `audio:{noAudio:true}` in `game.js`'s boot config.

## 10. Existing game-feel / animation systems (audited, to avoid duplicate work in later V8 phases)

| System | Status |
|---|---|
| Character animation (idle/run/jump/fall) | **Exists** — 4 Phaser animations from the 24 `chill-boy` frames, driven by velocity state in `update()`. |
| Coin bob | **Exists** — a simple y-offset yoyo tween per collectible (`tweens.add`, 900ms, Sine.inOut). |
| Goal flag wave | **Exists** — a 2-frame animation, 2fps. |
| Solved-gate bridge reveal | **Exists** — a staggered alpha fade-in on the plank tiles when a puzzle is solved, explicitly gated behind `reducedMotion` (skipped entirely if the user prefers reduced motion). |
| Jump dust / landing feedback / coin sparkle / checkpoint pulse / machine activation effect / screen shake | **Do not exist.** No particle system, no camera shake call, anywhere in `game.js`. |
| Persistence (save/resume, best time, settings) | **Does not exist.** No `localStorage`/`sessionStorage` usage anywhere in `game.js`. Progress is entirely in-memory for the current session; a page reload returns to `SPAWN` with nothing solved. |
| Replayability hooks (seeded variation, leaderboards, stats beyond the completion screen) | **Does not exist** beyond the existing `replay` button (full state reset) and the completion dialog's time/coins/puzzles-solved summary (session-only, not persisted). |

## 11. Educational UX — current state (relevant to a future "educational UX" phase)

- Each puzzle dialog shows the formula, the given value, the prompt, and (on a wrong answer) a worked-through correction message (`wrongMessage`) specific to the number entered.
- A 3-level progressive hint system exists per puzzle (`hints` array, revealed one at a time via a "Minta hint" button) — already implemented, not a gap.
- No difficulty variation, no alternate question pools, no spaced-repetition or review mechanic exists — single fixed question per machine, as designed.

## 12. Visual coherence — current state (relevant to a future "visual coherence" phase)

Per the V6.3 audit (still accurate, re-confirmed by reading the live code): all collision-visible terrain uses the Kenney New Platformer Pack exclusively; `assets/production/`'s higher-fidelity, project-specific assets (houses, café parts, a dedicated function-machine icon) remain imported but unwired, disabled specifically because their V6.3-era coordinates don't match V7's rebuilt geometry. This is the main open visual-coherence item, not a new finding.

## 13. What was NOT changed in this pass

Nothing. No source file was edited. No test was modified. No asset was added, removed, or re-pointed. No commit was made. The two files generated by this pass (`audits/level-v8/baseline.md` and the snapshot/screenshot copies under `audits/level-v8/`) live entirely outside `app/addmath/rooftop/`.

## 14. Blockers / open questions for the next phase

None preventing baseline completion. Two things worth flagging before V8 implementation phases begin:

1. **No audio assets exist at all.** Any audio phase needs either explicit new-asset permission (per rule #7) or must be scoped to silence/placeholder-only until assets are approved.
2. **`buildScenery()`'s coordinates are stale against V7.** If a visual-coherence phase wants to re-enable production/background-legacy art, those ~40 placements need re-deriving against the current `DECKS`/`ZONES` table (listed in full in §7), not reused as-is from the V6.3 report.

**Stopping here per the explicit "STOP after baseline verification. No implementation yet." instruction.**

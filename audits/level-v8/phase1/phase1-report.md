# Lorong Atas Bumbung — V8 Phase 1: Visual Coherence — Report

**Status: implemented.** Scope: re-derive and enable `buildScenery()`'s background/midground/prop decoration against the live V7 geometry. Nothing else touched. Nothing committed.

---

## 1. What actually changed

- **`src/game.js`**, two places:
  - `buildScenery()` fully rewritten. Every coordinate is read from the live `DECKS`/`ZONES`/`GATES`/`LADDERS` table in `level.js` (not reused from any prior pass — the previous version, still visible in `audits/level-v8/baseline-snapshot/game.js.bak`, placed things like `x:4555` in a world that is now only 4300px wide).
  - The call to `this.buildScenery()` in `buildEnvironment()`, previously commented out since the V7 rewrite, is now active.
- **No other file touched.** `src/level.js` (all gameplay geometry, physics, puzzles, checkpoints, gates) is byte-identical to the Phase 0 baseline — confirmed by re-running the full unit/regression suite unmodified, not just by eyeballing a diff.

## 2. A real problem found and fixed mid-implementation (disclosed)

The first implementation attempt placed 2–3 decorative shapes directly behind every ladder transition (e.g. Zone C stacked `house_3_full` + `h1_roof_porch` right at the B→C ladder's x-position). Screenshotted and reviewed before calling it done — it looked exactly like the complaint this phase was meant to fix: a cluttered jumble, not a building. Rebuilt with a stricter rule: **one landmark per zone, always offset clear of every ladder x-position** (610/750/1770/2280/3000/3230) rather than centered on them. Also found and fixed a visible seam in the `bg_hills` background band — the first version varied each tile's height slightly for a "coming down the hill" effect, which broke the tileset's own seamless repeat; replaced with a single flat-height band, confirmed clean in the re-screenshotted result.

## 3. Assets used (all pre-existing, already in `assets/manifest.json` — no new import)

| Key | Zone(s) | Placement |
|---|---|---|
| `bg_house_row` | A–D (background) | looped band, y=700 |
| `bg_mosque` | A (background) | single instance, x=500 |
| `bg_hills` | E–G (background) | looped band, flat y=650 |
| `house_1_full` | A (midground) | x=40, anchored on the ground line |
| `h3_roof_hut` | B, E (midground) | one instance each, offset clear of ladders |
| `h1_roof_porch` | C (midground) | café canopy, offset from the B→C ladder |
| `h3_door_grille` | D (midground) | workshop door, offset from M1/the gate |
| `water_tank_stand` | E (prop) | on roof-m2, clear of Machine 2's own position |
| `flag_malaysia` | A (prop) | near spawn |
| `plant_pot_leafy` | B (prop) | |
| `plant_pot_tall` | C (prop) | at CP1's position |
| `plant_bush` | F, G (prop) | one each |

Dropped from the first attempt: `house_2_full`, `house_3_full`, `plant_hanging`, `lamp_wall`, a second `h3_roof_hut`/`h3_parapet` pair in E — all removed specifically to fix the clutter problem in §2, not because the assets themselves were unusable.

## 4. Tests run

- **`node --test`: 11/11 pass**, unchanged from baseline (expected — scenery is non-collidable, touches no gameplay state).
- **`tests/probe.py` (full natural-input regression — desktop, mobile, missing-asset path, unrelated Add Math shell): pass, 0 page errors, 0 console errors, 0 failed requests.** Full A→B→C→D→E→F→G→GOAL traversal re-confirmed with scenery enabled: all gate-bypass and Machine-2-bypass checks still correctly blocked, checkpoint recovery still preserves solved gates, replay still resets fully, `routePlatforms.length===15` unchanged (scenery adds zero physics bodies).
- One run hit the same isolated Playwright timing flakiness already documented in `audits/level-v7/v7-test-results.md` §6 (not reproduced on immediate re-run, not caused by this phase's changes — scenery touches no timing-sensitive code path).

Per instruction, passing tests is not treated as proof of visual improvement by itself — the before/after screenshots below are the actual evidence for that claim.

## 5. Before / after evidence

- `phase1-before-after.png` — all 7 zones, baseline (scenery disabled) vs. this phase (scenery enabled), real 1440×1000 browser captures side by side.
- `phase1-zone-contact-sheet.png` — all 7 zones, after only, for a single-glance overview.
- `screenshots/` — the full raw capture set (16 images: 7 zones, café/rooftop/cave/complete/playing states, mobile welcome/playing/puzzle/landscape).

Per-zone read (checked directly against the captures, not asserted):
- **A:** one house anchored on the ground line, flag near spawn — residential read, clear of the FIRST_GAP jump.
- **B:** one small roof-hut behind the walkway, a plant accent — doesn't compete with the M1 approach or either ladder.
- **C:** the café canopy (`h1_roof_porch`) now sits offset from the ladder, with the house-row backdrop continuing behind it — no longer a jumbled stack.
- **D:** the workshop door sits clear of Machine 1 and the gate.
- **E:** one roof-hut plus the water tank, both clear of Machine 2's own position and the internal ladder; the hills skyline behind now tiles with no visible seam.
- **F:** hills skyline continues, one plant accent near the optional cave — no buildings, per the brief's own "gentle hillside, not architecture" rule.
- **G:** deliberately the least decorated zone, per the "clean, open climax" design intent carried over from the V6.3 plan — confirmed this still reads as restraint, not an oversight.

## 6. What was NOT changed

Player physics, collision geometry, world topology, ladder positions, machine locations, gate geometry, checkpoint coordinates, camera configuration, puzzle content, the Add Math learning pages — all untouched, confirmed by the unmodified-and-passing regression suite plus a direct read of `level.js` against the Phase 0 baseline snapshot. No audio, no new artwork, no enemies, no multiplayer, no new level — none were part of this phase's scope and none were added.

## 7. Blockers

None. Phase 1 completed within its authorized scope.

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — unchanged from every prior pass, still entirely untracked. No commit was made.

**Stopping here. Not starting Phase 2 or any other phase per the explicit instruction.**

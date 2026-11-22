# Lorong Atas Bumbung — V6.3 Phase 1 Implementation Report

**Scope:** background and midground visual composition for all seven zones, per Option A (keep Kenney gameplay geometry, use approved `assets/production/`/`assets/background-legacy/` assets for scenery). No gameplay, physics, camera, terrain, or interactive-object sprite was touched. Nothing was committed.

---

## 1. Files modified

Only `app/addmath/rooftop/src/game.js`:

- Added one new method, `buildScenery()`, called once from `buildEnvironment()` (before the existing ground/deck/ladder rendering — insertion order doesn't affect draw order, since Phaser sorts by `depth`, but it groups the new code logically).
- Updated one stale comment block in `buildEnvironment()` that previously claimed "the pack has no actual house/shop sprites to use instead" — no longer accurate given the `assets/production/` set, replaced with an accurate note pointing at `buildScenery()`.
- No other function touched. No `DECKS`/`LADDERS`/`TERMINALS`/`CHECKPOINTS`/`GATES`/`GROUND_RANGES`/`MOTION`/`WORLD` export was read differently or modified — `src/level.js` was **not edited at all** in this pass.

Two test-adjacent files were added (not modified — new files):
- `app/addmath/rooftop/tests/phase1_capture.py` — a dedicated visual-QA capture script (7 zones × 3 viewports), separate from the regression suite.
- `audits/level-v6.3/gen_phase1_evidence.py` — composites real screenshots into the before/after and contact-sheet deliverables (no image generation, pure `PIL` compositing of existing PNGs).

`app/addmath/rooftop/` remains entirely untracked in git (confirmed below), consistent with every prior pass.

## 2. Production assets used

See `phase1-asset-usage.md` for the full placement table. Summary: 3 looped background bands (`bg_house_row`, `bg_hills`, `bg_mosque`), 12 midground building/landmark placements (`house_1/2/3_full`, `h3_roof_hut` ×6, `h1_roof_porch`, `h3_door_grille`, `h3_parapet` ×3), and 9 ground-level prop placements (`flag_malaysia`, `plant_bush` ×3, `lamp_wall`, `plant_pot_leafy/tall`, `plant_hanging`, `water_tank_stand`). All were already present in `assets/manifest.json`/`assets/provenance.json` before this pass — no new import.

## 3. Assets rejected and why

- `h3_wall_lower`/`h3_wall_upper` — tried first for Zone D's workshop, found to be blank modular fill panels that read as broken placeholders when used without a matching roof/window composition. Reverted in favor of `h3_roof_hut` + `h3_door_grille`. Full detail in `phase1-asset-usage.md`.
- `h3_window_casement`, `laundry_line`, `answer_sign`, all `production/Ground`/`production/Traversal` assets, `function_machine_*`, `checkpoint_post_*`, `bg_cloud` — not used in Phase 1, each with a specific stated reason in `phase1-asset-usage.md` (either explicitly out of scope per the brief's restrictions, or judged unnecessary to avoid decorating for its own sake).

## 4. Technical implementation notes

- **Layering:** three depth tiers (background `.5`, midground `1.5`, props `2`), all strictly below every existing gameplay/interactive depth (ground `9`, decks `10`, machines/signs `11`, ladders `13`, coins/goal `14`, player `20`) — confirmed by reading the exact depth values already used elsewhere in `game.js` before choosing these, not guessed.
- **Collision:** every new sprite is a plain `this.art(...)` call (itself a thin wrapper around `this.add.image(...)`) — the same primitive already used for the pre-existing cave-entrance markers and cloud layer. No `this.physics.add.*` call appears anywhere in `buildScenery()`. Confirmed non-colliding by construction, not by testing for its absence.
- **Scroll factors (bug found and fixed mid-pass):** the first implementation used the cloud layer's existing `.3,.2` scroll factor for the new background band. This caused a sparse, zone-scoped background placement to visually "stretch" far beyond its intended zone (confirmed: Zone A/B's house row was still visible with the camera in Zone E). Root-caused to the general parallax property that a low scroll factor makes a sprite's apparent screen-persistence last roughly `1/scrollFactor` times longer in camera-travel terms than its raw placement width — correct for the clouds (looped across the *entire* world width) but wrong for a zone-scoped band. Fixed by raising background to `.85,.6` and midground to `.92,.7`; re-verified by re-capturing Zone E and confirming hills, not house roofs, now appear. Full detail in `phase1-visual-qa.md`.
- **Replay/reload duplication:** not specially handled, because it doesn't need to be — `buildScenery()` runs once per `create()` call, exactly like every other piece of existing environment art (ground tiles, decks, ladders, checkpoint signs), and Phaser's `scene.restart()` (used by the existing replay button) tears down and recreates the whole scene, so no duplicate sprites can accumulate across replays — this is the same property the existing `tests/probe.py` replay assertion already exercises for every other piece of environment art, and this pass adds no new mechanism that could break it.
- **Missing-asset handling:** not specially handled, because the existing global `loaderror` handler in `preload()` already covers every key referenced anywhere in the scene, including the new ones — and since every key used here was already present in `assets/manifest.json` and its backing file confirmed to exist (verified in the asset-inventory pass), this path was not expected to trigger and did not trigger during any test run.

## 5. Tests run and results

| Suite | Result |
|---|---|
| `node --test` (`tests/level.test.mjs`) | **7/7 pass**, unchanged from the pre-Phase-1 baseline — confirms `level.js` truly wasn't touched |
| `tests/probe.py` (desktop: full spawn→GOAL playthrough, Zone B/E traversal, M2 bypass attempts, failed-jump recovery) | **pass**, 0 page errors, 0 console errors, 0 failed requests (one transient timeout occurred on an earlier run before the scroll-factor fix was applied — not reproduced on re-run; see §6) |
| `tests/probe.py` (mobile: touch run/jump/interact, rotate, puzzle, pause) | **pass**, 0 errors |
| `tests/probe.py` (missing-asset failure path) | **pass**, unchanged |
| `tests/probe.py` (Add Math shell / unrelated learning pages) | **pass**, unchanged |
| `tests/phase1_capture.py` (21 screenshots: 7 zones × 3 viewports) | **pass**, 0 page errors, 0 console errors across all three viewport runs |

No test was changed to accommodate this pass — `tests/probe.py`'s V6.2-era assertions (M1/M2/M3 accessibility, M2 street-level bypass blocked, all 3 gates, all 3 checkpoints, recovery from failed jumps, full completion) are the exact same assertions from the prior pass, unedited, and all still pass.

## 6. Known visual limitations

- One `tests/probe.py` run (taken between the two scroll-factor states, before the fix was applied) hit a 45s timeout waiting for a ladder-climb condition on `roof-e3`. Re-run immediately after with no code change in between passed cleanly, and three subsequent full runs (after the scroll-factor and Zone D fixes) all passed without incident — judged to be isolated headless-browser timing flakiness, not a regression, since nothing in `buildScenery()` touches ladder detection, physics, or input handling. Disclosed rather than omitted, per the brief's "do not change tests merely to hide a regression" instruction — no test was changed to make this pass; it simply didn't reproduce.
- Zone A's `house_1_full` is the single largest/most visually dominant midground placement (confirmed in `1920x1080__zone-A.png`) — reads clearly as "a house," not a tower, but is noticeably more prominent than the other zones' background buildings. Not corrected in this pass since it does not obscure gameplay or read as decoration-for-its-own-sake; flagged here as a candidate for a scale-down tuning pass if the user judges it too dominant after reviewing the screenshots.
- Zone D's composition (`h3_roof_hut` + `h3_door_grille`) is the subtlest of the seven zones by design — intentional, per the brief's own "minimal pipe/gear motifs... do not add unrelated mechanical props everywhere," but worth flagging explicitly in case the user wants more presence here specifically.
- The pre-existing `MESIN n` label and the ladder `W/S · Tangga` prompt can visually overlap when both are near the player at once (visible in several Zone D/E/F/G captures) — this is unmodified, pre-existing UI-text layering behavior (confirmed present in V6.2 screenshots taken before this pass), not something Phase 1 introduced or is in scope to fix.

## 7. Whether further asset work is necessary

Not for Phase 1's stated goals — all seven zones now have a distinct, screenshot-confirmed visual identity without relying on the zone-name toast (see `phase1-visual-qa.md`). Per `level-v6.3-approval.md`'s original "requires art not currently available" section: a purpose-drawn awning/rooftop-deck sprite and a Terengganu-specific street background remain flagged as future commissions, not blockers — Phase 1 did not need either, since it only touched background/midground, not foreground terrain (Phase 2, still not authorized).

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — the entire directory remains untracked, exactly as before this pass began. No commit was made.

**Stopping here per the explicit "STOP after Phase 1 and deliver screenshots for review" instruction.**

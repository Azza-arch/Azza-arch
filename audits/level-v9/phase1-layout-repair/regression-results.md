# V9 Phase 1.1 — Regression Results

## 1. Unit tests — `node --test`

11/11 pass, 0 failures.

## 2. Full natural-input A→G regression — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`.
Confirms unmodified: all three math machines, all three gates
(bypass-blocked then crossable), all three checkpoints + checkpoint
recovery, the optional cave/coin, mobile touch run/jump/interact/pause,
the missing-asset failure path, the unrelated Add Math shell, and the
'E'-press goal exit.

## 3. V9 crate/switch tests, adapted to the new coordinates

`tests/v9_phase1_crate.py`, fully rewritten for the repositioned
puzzle (old vs. new coordinates documented explicitly in that file's own
header comment and reproduced in `natural-input-playtest-results.md`).
All scenarios pass — see that file for the full table.

## 4. Save/Continue — `tests/v8_phase6_persistence.py`

All 16 scenarios pass, unaffected by the crate repositioning (the crate
puzzle has no interaction with the save schema).

## 5. Secrets — `tests/v8_phase7_secrets.py`

All scenarios pass.

## 6. Level Select / menu — `tests/v8_phase8_menu.py`

All scenarios pass.

## 7. Level exit — `tests/v8_7_level_exit.py`

All 5 scenarios pass.

## 8. Desktop and mobile viewport checks

- Desktop (1000×700 and `probe.py`'s own 1440×1000): clean, no errors.
- Mobile (390×844, touch input via `probe.py`'s own mobile section):
  clean, no errors.
- A dedicated mobile screenshot of the repositioned crate area
  (`screenshots/mobile-crate-area.png`) confirms no layout
  overflow/clipping at phone width.

## No assertions were weakened

Every existing regression assertion (machines, gates, checkpoints,
secrets, save, menu, exit) is unchanged from before this pass. The only
test file modified was `tests/v9_phase1_crate.py` itself, because its own
subject (the crate puzzle's coordinates) moved — documented explicitly
with an old-vs-new table in that file's header, per the brief's own
instruction.

## Files modified this phase

- `src/level.js` — `CRATE_PUZZLE` repositioned (crate x:260→230, switch
  x:350→340, platform x:250-380/y:1025→x:290-390/y:980). No other export
  changed.
- `src/game.js` — `buildCratePuzzle()` (crate tint, switch now a
  pressure-plate shape instead of a lever sprite, updated label text,
  one-time ledge-discovery cue added), the switch activate/deactivate
  branches in `update()` (texture-swap replaced with
  `setDisplaySize`/`setTint` calls matching the new plate visual),
  `resetCrate()` (same visual update). The push/recovery/reset
  *mechanism* code is unchanged — only the plate's visual representation
  and the data it reads from `CRATE_PUZZLE` changed.
- `tests/v9_phase1_crate.py` — rewritten for the new coordinates and the
  new "mount the crate, then jump" verification sequence.
- `tests/v9_1_1_world_map.py` — new, generates the required coordinate
  deliverables from live source data; not part of the shipped game.

## Not touched

`DECKS`, `GATES`, `GROUND_RANGES`, `LADDERS`, `TERMINALS`,
`CHECKPOINTS`, `COLLECTIBLES`, `SECRETS`, `PUZZLES`, `WORLD`/`MOTION`
constants, camera behavior, save schema — confirmed unchanged by full
regression.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed,
`git clean`/`git reset` never run).

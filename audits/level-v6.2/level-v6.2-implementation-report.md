# Lorong Atas Bumbung — V6.2 Controlled Implementation & Verification Report

**Scope:** Zone B's two-platform varied-height upper route and Machine 2's relocation onto `roof-e3`, per the FINAL RECOMMENDATION in `audits/level-v6.2/level-v6.2-approval.md` (which superseded the earlier B1/E2 proposals in `level-v6.2-final-sanity-check.md`). Zones A, C, D, F, G, physics constants (`MOTION`/`WORLD.gravity`), camera, checkpoints, zone boundaries, the other two puzzles, and the completion flow are all **unchanged**. Nothing was committed.

---

## 1. Files modified

Only `app/addmath/rooftop/src/level.js` and two test files:

- `src/level.js` — `DECKS`, `LADDERS`, `TERMINALS`, `COLLECTIBLES` only. No other export touched.
- `tests/level.test.mjs` — updated the hardcoded Zone B jump-pair list (removed the `awning-b2`→`awning-b3` pair, since `awning-b3` no longer exists) and added one new test asserting Machine 2's unreachability from the street and every adjacent deck.
- `tests/probe.py` — replaced the old Zone B flat walk-through and the old `solve(5570, 1000, ...)` call with full natural-input traversal of both revised zones, deliberate failed-jump recovery checks, and street/adjacent-deck bypass attempts; updated the `routePlatforms.length` assertion from 14 to 13.

`src/game.js` was **not modified** — the interaction-range check (`nearestTerminal()`) already had sufficient vertical tolerance (48px) relative to the 200px rise between the street and `roof-e3` to prevent bypass without any code change (see §4).

`app/addmath/rooftop/` remains entirely untracked in git (confirmed via `git status --porcelain app/addmath/rooftop/` below), consistent with every prior pass (V5/V6/V6.1), so there is no git diff to show; exact before/after values are recorded here instead.

## 2. Exact coordinates changed

### Zone B

| Field | Before (V6.1 shipped) | After (V6.2) |
|---|---|---|
| `DECKS` entry 2 | `{ id:'awning-b2', x:1500, y:900, width:120 }` | `{ id:'awning-b2', x:1510, y:960, width:150 }` |
| `DECKS` entry 3 | `{ id:'awning-b3', x:1750, y:900, width:120 }` | **removed** |
| `LADDERS` (down) | `{ x:1850, top:900, bottom:1000 }` | `{ x:1630, top:960, bottom:1000 }` |
| `COLLECTIBLES` coin-b2 | `{ x:1810, y:770 }` (above awning-b3) | `{ x:1585, y:830 }` (above awning-b2) |

`awning-b1` (x:1250, y:900, width:120) and the ladder-up (x:1280, top:900, bottom:1000) are **unchanged**. No street-level obstacle was added — the earlier B1 proposal's crate (rejected in the sanity-check pass) is **not** present anywhere in `src/level.js` or `src/game.js`.

### Zone E

| Field | Before (V6.1 shipped) | After (V6.2) |
|---|---|---|
| `TERMINALS` p2 | `{ id:'p2', gate:'rooftop-gate', x:5570, feet:1000 }` | `{ id:'p2', gate:'rooftop-gate', x:5020, feet:800 }` |

`DECKS` (`roof-e1`–`roof-e4`), `LADDERS` (the single Zone E ladder at x:4900), `GATES.rooftop-gate` (x:5650, width:500), and `GROUND_RANGES` (`[4300,5650]` unchanged, still fully continuous) are **all unchanged**. No raised terrain lip, no `GROUND_RANGES` split, and no new ladder were added anywhere — the earlier E2 proposal's lip (found physically impossible in the sanity-check pass) is **not** present.

## 3. Physics and collision verification

- **No physics constant changed.** `MOTION`, `WORLD.gravity` untouched; confirmed by inspection of `src/level.js` lines 1-8 and by `node --test`'s `"every gate is unjumpable and every mandatory jump is reachable"` test, which recomputes `maxRange` from the live constants and re-validates every jump pair, including the new `awning-b1`→`awning-b2` pair (gap 140px < `maxRange-40` = 168px — passes the same conservative flat-jump bound already used for Zone E's drop jumps).
- **Zone B's new jump (gap 140px, drop 60px)** was checked against the drop-60 kinematic window (≈235px max, per `level-v6.2-route-options.md`'s interpolated descent table) — 95px margin, 60% utilized — and against natural-input playtest in `tests/probe.py`, which landed the player at `feet=960` exactly, matching `awning-b2`'s deck height.
- **Machine 2's new position (feet:800) exceeds the 96.6px theoretical max jump rise from street level (feet:1000) by more than double** (`v0²/(2g) = 520²/2800 = 96.6px`; actual rise required = 200px) — confirmed both by direct computation and by the live `nearestTerminal()` check failing correctly at every tested street position (see §4 and the interaction-test-results.json).
- **Ladder/deck consistency:** `node --test`'s `"every ladder lands on a real deck or ground range at both ends"` test passed unchanged — the new ladder-down (x:1630, top:960, bottom:1000) correctly lands on `awning-b2`'s height (960) at top and continuous ground (1000) at bottom.
- **Falling-off-deck safety:** `node --test`'s `"falling off any upper deck lands on continuous ground, not a gate gap"` test passed unchanged — both `awning-b1` and `awning-b2` sit entirely within `GROUND_RANGES`'s `[540,3850]` span.

## 4. Interaction-range (bypass) verification

Inspected the live `nearestTerminal()` in `src/game.js` (unchanged):

```js
nearestTerminal() {
  return TERMINALS.find(t => !this.solvedGates.has(t.gate)
    && Math.abs(this.player.x-t.x)<115 && Math.abs(this.player.body.bottom-t.feet)<48);
}
```

This check already combines a 115px horizontal tolerance with a 48px **vertical** tolerance — it was never an x-only check. Since Machine 2's new vertical position (`feet:800`) is 200px above the street (`feet:1000`) and 96px above the horizontally-closest adjacent deck `roof-e2` (`feet:896`), both of which exceed the 48px vertical tolerance by a wide margin, **no code change was needed or made**. This satisfies the brief's "prefer terminal-specific validation over globally shrinking all interaction radii" instruction by the smallest possible means: validating the existing formula against the new data, not touching the formula at all.

Both the geometric check (`tests/level.test.mjs`, new test, 7/7 pass) and the live browser check (`tests/probe.py`, natural keyboard input + a direct `E`-key press at the street and at `roof-e2`) confirm:

- **Unreachable** from the street directly below the terminal, from street positions ±50px either side, and from the opposite end of the street.
- **Unreachable** from `roof-e1`, `roof-e2` (the horizontally-closest adjacent deck, where only the vertical check protects against bypass), and `roof-e4`.
- **Reachable** from `roof-e3`'s own surface near the terminal's x-position.

Full results: `level-v6.2-interaction-test-results.json`.

## 5. Regression test results

| Suite | Result |
|---|---|
| `node --test` (`tests/level.test.mjs`) | **7/7 pass** (6 pre-existing + 1 new) |
| `tests/probe.py` (desktop: full spawn→GOAL playthrough, Zone B/E traversal, bypass attempts, failed-jump recovery) | **pass**, 0 page errors, 0 console errors, 0 failed requests |
| `tests/probe.py` (mobile: touch run/jump/interact, rotate, puzzle, pause) | **pass**, 0 errors |
| `tests/probe.py` (missing-asset failure path) | **pass**, unchanged behavior |
| `tests/probe.py` (Add Math shell / unrelated learning pages) | **pass**, unchanged |
| `tests/edge_cases.py` (`--edges` flag) | **pre-existing failure, unrelated to this pass** — see §6 |

Full console output and the `routePlatforms.length===13` assertion (down from 14, since `awning-b3` was removed and nothing else was added) are reproduced in this session's tool transcript; `tests/artifacts/browser-results.json` holds the machine-readable summary from the same run.

## 6. Remaining limitations

- **`tests/edge_cases.py` fails, but this predates V6.2 and is unrelated to it.** Its fixture resets the player to `x:1350`, a ladder position from V5 (pre-V6.1) geometry — per the V6.1 implementation report's own "old coordinates" note, V5's Zone B ladders sat at x:1350/1800, and V6.1 moved them to x:1280/1850 when it shipped. This fixture was never updated for that move and has been stale since V6.1, well before this pass. Confirmed unrelated: `awning-b1` (x:1250-1370) and the ladder-up (x:1280) are both **unchanged** by V6.2 — only `awning-b2`'s position and the ladder-down moved. Left unmodified, per this pass's "no unrelated source changes" scope.
- **Zone B's upper route is explicitly not claimed as a timing shortcut.** No traversal-time measurement was taken (the sanity-check pass rejected the earlier manufactured timing claim); the route's justification is the varied-height jump itself (the level's first non-flat jump, ahead of Zone E's mandatory chain), not speed.
- **`roof-e4` is now a genuinely optional branch** for reaching the gate (since Machine 2 moved to `roof-e3`, a player can descend the ladder back to street level instead of continuing to `roof-e4`) — both paths were exercised in this pass's regression run (the ladder-mandatory path to solve M2, the `roof-e4` branch to descend and cross afterward), but a player who descends via the ladder immediately after solving, without ever touching `roof-e4`, was not separately re-verified as its own test case; it reuses the same already-playtested ladder-down mechanics exercised for Zone B and is not expected to behave differently.
- **The level is not visually finished.** This pass changed only collision geometry, terminal position, and associated static art placement (`deck()`/`platform()`/lever art all read their coordinates from the edited `level.js` data automatically — no `game.js` rendering code was touched). No new Kenney assets, no camera change, no polish pass.
- **`audits/level-v6.2/level-v6.2-route-options.md`, `-jump-validation.csv`, `-proposed-topology.png`, `-zone-b-detail.png`, `-zone-e-detail.png`** (from the design-only passes) still describe the rejected B1/E2 proposals and are **not** regenerated in this report — they remain the project's audit trail of what was proposed and why it changed, per the existing convention of superseding rather than editing prior documents.

## 7. Final acceptance requirements — checked against this implementation

- ✅ Zone B no longer contains three repeated identical awnings (now two, at different heights).
- ✅ Upper route is optional (lower street unobstructed, confirmed live) and demonstrates meaningful elevation variation (140px gap, 60px drop).
- ✅ Lower route remains safe (continuous ground, confirmed via both the failed-jump recovery test and the explicit mid-span teleport check).
- ✅ Machine 2 cannot be activated from street level (confirmed live and geometrically, at multiple positions).
- ✅ Machine 2 can be reached by natural rooftop traversal (confirmed via full natural-input climb/jump/ladder sequence).
- ✅ All three function puzzles work (`f(3)=7`, `3x-2=10⇒x=4`, `4x-3=17⇒x=5` all exercised, unchanged formulas/answers).
- ✅ All three checkpoints remain functional (CP1/CP2/CP3 all reached and asserted in the same run).
- ✅ Level completion remains achievable (full spawn→GOAL playthrough passed).
- ✅ No new console errors (0 across desktop, mobile, and shell runs).
- ✅ No unrelated source changes (only `DECKS`/`LADDERS`/`TERMINALS`/`COLLECTIBLES` in `level.js`; `game.js` untouched).

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — the entire directory remains untracked, exactly as before this pass began. No commit was made.

**Stopping here per the explicit "Implement only these corrections and STOP" instruction.**

# V9.6 Terrain-Grammar Fix — Regression Results

## Code changes this pass

- `src/game.js`: added `kppLandMassFill()`; wired it into `deck()` (for
  `data.x<1300`, replacing the `supportPiers()` call) and into the ground
  loop in `buildEnvironment()` (replacing the flat grey rectangle fill,
  for `left<1300`); added a second fill row + the isolated-bordered tile
  to the crate-platform ledge's rendering. No collision code touched (see
  `collision-vs-rendering-review.md`).
- `assets/manifest.json` / `assets/provenance.json`: registered one more
  real, verified tile (`kpp_dirt_isolated`, index 6) — 84→85 entries.
- `tests/level.test.mjs`: manifest-size assertion updated 84→85, comment
  documents why.
- `src/level.js`: **not touched.**

## Full run, this phase

| Suite | Result |
|---|---|
| `node --test` (11 tests, incl. asset-integrity) | 11/11 pass |
| `tests/probe.py` (full natural-input A→G, desktop+mobile) | clean, `errors: []` |
| `tests/v8_phase6_persistence.py` | pass |
| `tests/v8_phase7_secrets.py` | pass |
| `tests/v8_phase8_menu.py` | pass |
| `tests/v8_7_level_exit.py` | pass (coin count `1/7` still correct — `coin-a`'s position was not touched this pass, only the crate ledge's art) |
| `tests/v9_phase1_crate.py` (unmodified) | pass |
| `tests/v9_6_ab_natural_input.py` (unmodified) | pass, `errors: []` |

No console errors, page errors, or failed network requests were observed
in any run. No test assertion was weakened — only the one manifest-count
assertion was updated to match a real, intentional, verified asset
addition, exactly as the one-tile addition in V9.6 itself was handled.

## Visual confirmation

`zone-a-before-after.png` and `zone-b-before-after.png` show the actual
defect (grass strips on old grey 64px pillars, flat grey ground
underside) directly above the fix (continuous, connected, solid
dirt-filled land mass matching `official-kenney-sample-reference.png`'s
own structural language). The D-zone boundary (x=1300, still the old
64px pack, visible at the right edge of the B screenshot) stays visually
and texturally distinct, confirming no mixing occurred.

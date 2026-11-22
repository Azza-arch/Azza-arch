# V9.6 — Full Regression Results

## Test changes made (recorded, per the brief's instruction — no assertion weakened)

1. **`tests/level.test.mjs`**: manifest-size assertion updated 73→84
   (registered 11 new real, verified Kenney Pixel Platformer tile assets).
   Comment documents the exact old/new count and why.
2. **`tests/v8_7_level_exit.py`**: the teleport target used to pick up
   `coin-a` during the completion-summary check was `(300, 1050-30)` —
   the coin's **old** ground-level position. Updated to `(340, 940-30)` —
   the coin's **new** position on the crate ledge (see
   `ab-layout-before-after.csv`). Re-run after the fix: `coins in summary:
   Koleksi dijumpai: 1/7 (expect 1/7)` — confirmed still genuinely
   collectible, not just a relabeled expectation.
3. **New suite added**: `tests/v9_6_ab_natural_input.py` (see
   `ab-natural-input-tests.md` for full detail) — does not replace or
   weaken any existing suite, purely additive.
4. **New suite added**: `tests/v9_5_zone_ab_capture.py` and
   `tests/v9_6_screenshots.py` (screenshot-only, no assertions) — carried
   over/extended from the prior phase for the required visual deliverables.

No other test file or assertion was touched. No existing suite had any
check removed or loosened.

## Full run, this phase (after all code + test edits above)

| Suite | Result |
|---|---|
| `node --test` (11 tests, incl. the asset-integrity check) | 11/11 pass |
| `tests/probe.py` (full natural-input A→G, desktop+mobile, missing-asset handling) | clean, `errors: []` |
| `tests/v8_phase6_persistence.py` | pass |
| `tests/v8_phase7_secrets.py` | pass |
| `tests/v8_phase8_menu.py` | pass |
| `tests/v8_7_level_exit.py` (updated teleport target, see above) | pass, coin count `1/7` confirmed |
| `tests/v9_phase1_crate.py` (unmodified) | pass |
| `tests/v9_6_ab_natural_input.py` (new) | pass, `errors: []` |

No console errors, page errors, or failed network requests were observed
in any run.

## What was verified by this regression pass

- The B→D mandatory route is unbroken (explicit brief requirement).
- The crate puzzle remains fully optional, recoverable, and non-
  obstructive (full A→G completion verified with the crate never
  touched — `tests/v9_phase1_crate.py`'s own existing check).
- Save/Continue, secrets, checkpoints, menu, and the level-exit flow are
  all unaffected by the visual/tile changes.
- The asset-integrity test (sha256 + path cross-check against
  `provenance.json`) passes for all 84 manifest entries, including the 11
  newly registered real Kenney Pixel Platformer files.

## Not run/out of scope this phase

C–G's own dedicated suites were exercised only as part of `probe.py`'s
full traversal (unchanged pass) — no C–G-specific geometry or visual
changes were made, per the brief's explicit scope control.

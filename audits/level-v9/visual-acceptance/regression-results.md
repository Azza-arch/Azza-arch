# V9.8 — Regression Results

## Code/asset changes this phase

- `src/game.js`: `spawnCollectibles()` and the secret-marker fallback
  branch in `buildSecrets()` swapped from `kenney_coin` to `kpp_coin`;
  `buildGateStubs()` swapped from `platform_wood_left/right` to
  `kpp_gate_barricade`.
- `assets/manifest.json`/`assets/provenance.json`: corrected `kpp_coin`
  to point at the real coin tile (`tile_0151.png`, not the previously
  mis-identified `tile_0150.png`); registered one new tile
  (`kpp_gate_barricade`, index 105) — 88→89 entries.
- `tests/level.test.mjs`: manifest-size assertion updated 88→89, comment
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
| `tests/v8_7_level_exit.py` (coin count, all 3 machines/gates) | pass |
| `tests/v9_phase1_crate.py` | pass |
| `tests/v9_6_ab_natural_input.py` (crate-ledge coin pickup) | pass |

No console errors, page errors, or failed network requests in any run.
Coin pickup overlap detection specifically re-verified (not just assumed
unaffected by the texture/body-size change): `v8_7_level_exit.py`'s
completion summary still reports `1/7` coins, and
`v9_6_ab_natural_input.py`'s crate-ledge coin is still collected via the
same natural jump sequence as before.

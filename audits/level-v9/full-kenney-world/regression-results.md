# V9.7 — Full Kenney World Regression Results

## Code changes this phase

- `src/game.js`: removed the `x<1300`/zone restriction from `deck()`,
  the `GROUND_RANGES` loop, and the `LADDERS` loop (now applies
  world-wide); `kppLandMassFill()` gained a `passThrough` parameter
  (dimming + marker line for one-way decks) and per-column clipping
  against sibling decks (fixes F's cave notch); `gateArt()` switched to
  the real pack's bridge tiles; `DECK_STYLE` emptied (F's rockMass() path
  now unreachable, not deleted).
- `assets/manifest.json` / `assets/provenance.json`: registered 3 more
  real, verified tiles (`kpp_bridge_left/mid/right`) — 85→88 entries.
- `tests/level.test.mjs`: manifest-size assertion updated 85→88, comment
  documents why.
- `src/level.js`: **not touched** — zero geometry changes anywhere in
  the world.

## Full run, this phase

| Suite | Result |
|---|---|
| `node --test` (11 tests, incl. asset-integrity) | 11/11 pass |
| `tests/probe.py` (full natural-input A→G, desktop+mobile) | clean, `errors: []` |
| `tests/v8_phase6_persistence.py` | pass (one run hit a transient `net::ERR_NETWORK_IO_SUSPENDED` from Playwright's own reload call — re-ran in isolation immediately after, passed clean; not reproducible, not related to any code change this phase) |
| `tests/v8_phase7_secrets.py` | pass |
| `tests/v8_phase8_menu.py` | pass |
| `tests/v8_7_level_exit.py` | pass — this is the suite that exercises all 3 machines, all 3 gates, and the full completion summary; its pass is the main confirmation that C–G's gates/machines still work exactly as before |
| `tests/v9_phase1_crate.py` (A's crate, unmodified) | pass |
| `tests/v9_6_ab_natural_input.py` (unmodified) | pass, `errors: []` |

No console errors, page errors, or failed network requests were observed
in any run (aside from the one transient reload noted above, which is a
Playwright/environment hiccup, not an application error).

## Additional manual verification this phase (beyond the existing suites)

- **Gate bridge rendering**: solved a save with all 3 gates marked
  solved via the real save/continue path (`writeSave()` + reload +
  `#continue-btn`, not a shortcut), confirmed the final-gate's bridge
  renders with the new Kenney plank tiles (`gate-solved-bridge.png`).
- **Unsolved-gate water gap**: confirmed the river gap shows open water
  with no visible crossing before the gate is solved (`post-v97-G-after.png`).
- **F's cave notch**: confirmed visually open/descendable, not filled
  solid (`post-v97-F-after.png`).
- **Player-vs-terrain depth ordering**: confirmed the player (depth 20)
  always renders in front of every new terrain layer (fill=5, marker
  line=6, deck top=10, ladder=13) in every zone.

## What was NOT re-tested this phase (already covered by the suites above,
## not re-verified manually)

Checkpoints, secrets, menu/level-select, coin collection, and mobile
framing — all covered by the existing suites (`v8_phase6/7/8`,
`v8_7_level_exit`, `probe.py`'s own mobile section), all passing.

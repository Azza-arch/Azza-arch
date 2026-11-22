# V8 Phase 8.5 — Regression Results

All tests run against the actual game in a real Chromium browser via
Playwright (plus Node's own test runner for unit tests). Every suite
listed below was re-run AFTER the visual changes, unmodified from its
prior-phase form (no test was weakened to make it pass).

## 1. Unit tests — `node --test`

11/11 pass, 0 failures.

## 2. Full natural-input A→G traversal — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`.
Specifically confirms, unmodified:

- All three math machines solved via the real puzzle-dialog flow.
- All three gates: bypass-blocked while unsolved, crossable once solved.
- All three checkpoints reached and checkpoint-recovery preserving solved
  gates.
- The optional cave visited, the optional coin collected.
- Mobile touch run/jump/interact/pause.
- The missing-asset failure path and the unrelated Add Math shell.

This is the single strongest guarantee that the geometry lock held: every
one of these assertions tests the real collision/physics/state behavior,
completely independent of how anything is drawn.

## 3. Save/Continue — `tests/v8_phase6_persistence.py`

All 16 scenarios pass unmodified (fresh save, checkpoint save, reload +
Continue, mid-run solve + reload, restored bridges/coins, reload during
puzzle feedback, reload during the bridge-opening animation, completion +
reload, New Adventure confirmation, Replay confirmation, corrupted JSON,
unsupported schema version, blocked storage, repeated reload cycles with
no duplication).

## 4. Secret discoveries — `tests/v8_phase7_secrets.py`

All scenarios pass unmodified, including the "main adventure completable
with zero secrets found" check and all three discoveries (Si Oyen, Nota
Fungsi Misteri, Khazanah Gua) still triggering correctly at their
unmoved positions.

## 5. Menu/navigation — `tests/v8_phase8_menu.py`

All scenarios pass unmodified (main menu, Level Select, Koleksi, Tetapan,
keyboard-only navigation, completion screen actions, mobile layout,
corrupted-storage fallback).

## 6. New: no orphaned decoration after scene restart

A direct check (not present before this phase): counted
`h3_wall_lower`-textured game objects in the scene, then triggered
"Mula semula" (scene restart) twice via the pause menu, re-counting each
time.

```
wall-tile count after 0/1/2 restarts: 10 10 10 (expect all equal, no growth)
```

Confirms the new decorative helpers (`buildingFacade`/`rockMass`/
`caveMouth`/`riverBand`/`buildGateStubs`) leave nothing behind across a
scene restart — Phaser's own scene-teardown already destroys every
`this.add.image`/`this.add.graphics` object, and nothing here keeps an
external reference alive past that.

## 7. Reduced-motion + mobile viewport render check

A 390×844 mobile context with `prefers-reduced-motion: reduce` emulated,
navigated into Zone E (the densest new architecture), confirmed:
`console/page errors: []`. Screenshot
(`screenshots/after/mobile-reduced-motion-E.png`) confirms the new
facades/machine art render correctly and legibly at phone width. None of
the new decorative helpers use tweens at all (they are static
images/graphics), so `prefers-reduced-motion` has nothing to skip for
them — they were never going to animate regardless of the setting,
correctly matching "respect reduced-motion" by having no motion to
suppress.

## 8. Audio settings

Unaffected — `src/audio.js` was not touched this phase; Phase 8's
`#settings` dialog and its mute/volume controls are exercised by
`tests/v8_phase8_menu.py`'s own "Settings reachable pre-game" scenario,
which passed above.

## Manual visual-regression checks (brief §14's specific callouts)

- **No false visual shortcut**: every new facade/rock/river/stub element
  uses default `scrollFactor` (1,1) and no physics body — nothing was
  added that could be mistaken for a walkable surface that isn't one, and
  `probe.py`'s full traversal (which walks every real surface and attempts
  bypasses at several gates) passing unmodified is direct evidence no new
  shortcut exists.
- **No obscured landing platforms**: confirmed via screenshot review of
  every zone (`screenshots/after/`) — every deck's own gameplay-surface
  tiles (depth 10) remain the highest-depth element at their own
  position; new architecture sits at depths 1–5, machines/checkpoints at
  11, strictly below/above in the established layer order.
- **No decorative obstruction over interactive elements**: machines,
  checkpoints, ladders and the goal flag are all drawn at depth ≥11,
  above every new decorative layer.
- **No parallax alignment drift**: confirmed directly via
  `v8-5-platform-art-alignment.png` (three camera-pan frames showing the
  same buildings staying fixed to their decks).
- **No invalid image scaling**: every new asset's scale was derived from
  its actual `assets/provenance.json` dimensions (see
  `asset-usage-and-composition.md`), not guessed.
- **No additional rendering leaks**: see the orphaned-decoration check
  above.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed,
`git clean`/`git reset` never run).

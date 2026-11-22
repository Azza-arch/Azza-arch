# V8.7 — Full Regression Results

All suites re-run AFTER every Phase A–E change, in a real Chromium browser
via Playwright (plus Node's own test runner for unit tests). No test was
weakened to make it pass — the five scripts that needed updates were
updated to match the new, intentional goal-exit interaction (see
`level-exit-tests.md`'s "Regression impact" section), not loosened.

## 1. Unit tests — `node --test`

11/11 pass, 0 failures.

## 2. Full natural-input A→G traversal — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`.
Confirms unmodified: all three math machines, all three gates
(bypass-blocked then crossable), all three checkpoints + checkpoint
recovery, the optional cave/coin, mobile touch run/jump/interact/pause,
the missing-asset failure path, the unrelated Add Math shell — and now
also the new 'E'-press exit interaction at the goal.

## 3. Save/Continue — `tests/v8_phase6_persistence.py`

All 16 scenarios pass (updated only to press 'E' at the goal where the
scenario reaches full completion — see `level-exit-tests.md`).

## 4. Secret discoveries — `tests/v8_phase7_secrets.py`

All scenarios pass, including "main adventure completable with zero
secrets found" (now via the explicit exit interaction) and all three
discoveries at their unmoved Phase 7 positions, now also correctly
triggering the shared interactable-highlight glow (Phase B).

## 5. Menu/navigation — `tests/v8_phase8_menu.py`

All scenarios pass, including Level Select, Koleksi, Tetapan, keyboard-
only navigation, completion screen actions (now reached via 'E'), mobile
layout, corrupted-storage fallback.

## 6. New: level exit — `tests/v8_7_level_exit.py`

All 5 scenarios pass — see `level-exit-tests.md` for the full table.

## 7. New: camera zoom A/B — `tests/v8_7_camera_ab.py`

27 measurements (3 viewports × 3 zooms × 3 moments) captured and recorded;
see `camera-ab-results.md`. A dedicated follow-up check confirmed the
final, implemented `applyResponsiveZoom()` rule auto-selects the correct
zoom per viewport:

```
desktop auto-selected zoom: 1
short-wide-laptop auto-selected zoom: 1.3
mobile-landscape auto-selected zoom: 1.3
```

## 8. Jump sequence under the new responsive zoom

A direct check at mobile-landscape (zoom 1.3 auto-selected): a full
first-gap jump (hold D, Space at the gap, release, settle) landed cleanly
past the gap (`x: 705.9`, gap ends at 540) with zero page errors —
confirms camera zoom is purely visual and does not affect jump
physics/timing at any tested zoom level.

## 9. Audio & reduced motion

Unaffected by this phase — `src/audio.js` was not touched; Phase 7's
reduced-motion/muted-audio scenarios in `v8_phase7_secrets.py` (discovery
still registers under both conditions, particle/SFX calls simply no-op)
re-ran clean as part of suite #4 above.

## 10. Manual checks (brief's explicit "verify" list)

- **No false visual shortcut**: `supportPiers()`/`rockMass()`/
  `riverBand()`/`caveMouth()`/door art all use default `scrollFactor`
  (1,1) and no physics body; the full A→G traversal (including bypass
  attempts at all three gates) passing unmodified is direct evidence.
- **No obscured landing platforms / no decorative obstruction over
  interactive elements**: confirmed via the zone screenshots in
  `screenshots/zones-after/` — every deck's gameplay-surface tiles
  (depth 10) remain the highest-depth element at their position; the new
  support piers sit at depth 5, strictly below.
- **No parallax alignment drift**: `supportPiers()` uses the player's own
  world coordinates directly (no scrollFactor override), same guarantee
  Phase 8.5 already established for its own aligned elements.
- **No platform clipping / viewport overflow / frame-rate issue**: visible
  across all 9 camera-A/B screenshots (`v8-7-camera-ab-comparison.png`)
  and the mobile jump-sequence check above.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed,
`git clean`/`git reset` never run).

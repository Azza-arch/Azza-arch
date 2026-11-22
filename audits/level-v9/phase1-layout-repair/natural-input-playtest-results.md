# V9 Phase 1.1 — Natural-Input Playtest Results

All tests via `tests/v9_phase1_crate.py` (rewritten for the new
coordinates) plus `tests/probe.py` and the full suite, real Chromium
browser, natural keyboard input throughout (holding movement keys,
discrete key taps — no direct position overrides used for any pass/fail
judgment, only for test setup/isolation between scenarios).

## Confirmed-fixed defect

| Scenario | Result |
|---|---|
| Direct jump at the ledge's x, no crate used | Player settles back at ground (bottom=1100); the 980-height ledge is never reached. **This is the confirmed fix** — the Phase 1 prototype's platform (rise 75px) was reachable unaided, making the switch pointless; this ledge (rise 120px) categorically is not. |

## Full natural sequence (push → climb → ledge)

| Step | Result |
|---|---|
| Walk right from spawn, holding the movement key | Crate is pushed ahead; the pressure plate activates the instant the crate is both grounded and within its radius. |
| Plate active | `crateSwitchActive===true`; the ledge gains a real collision body (`cratePlatformBody` exists). |
| Reposition next to the crate, short jump + brief forward tap | Player mounts the crate (`body.bottom` settles at ~1052, exactly the crate's own top height). |
| Jump again from the crate's top | Player reaches the ledge (`body.bottom` settles at ~980). |
| One-time discovery cue | Fires exactly once (`crateLedgeDiscovered` flips to `true`), sparkle + floating text shown. |

## Both push directions + reversibility

| Scenario | Result |
|---|---|
| Push from the left (rightward) | Reaches and activates the plate. |
| Push from the right (leftward), pulling the crate back off | Plate deactivates; the ledge's collision body is correctly removed — a real, reversible mechanism. |

## Side-overlap does not falsely activate the plate

A crate placed at distance 45 from the plate's center (radius 40, i.e.
just outside) while grounded: plate stays inactive. Confirms the
brief's "a simple side-overlap must not activate it" requirement,
unchanged from the Phase 1 prototype's own logic (not modified this
pass — the fix was spatial, not mechanical).

## Explicit "Reset Kotak" (C)

Resets the crate to its exact start x (230), deactivates the plate,
removes the ledge's collision body, and — verified separately — does
**not** touch `solvedGates`/`checkpointIndex`.

## Automatic recovery

Pushing the crate past the gap edge (x≥425) and waiting, with no manual
input: the crate falls, crosses the shared y:1160 threshold, and
silently resets near its start.

## No unavoidable softlock

'R' (checkpoint respawn) remains fully functional with the puzzle
mid-interaction.

## Full A→G adventure, crate never touched

Solving all three gates and exiting via the goal (crate left at its
start x=230, completely untouched) reaches `mode==='complete'` normally.

## Console/network check across the whole sequence

`console/page errors: []` across push → climb → ledge, including the
real jump-mount maneuver.

## Regression suites (unaffected by the repositioning)

| Suite | Result |
|---|---|
| `node --test` (11 unit tests) | 11/11 pass |
| `tests/probe.py` (full A→G traversal) | Clean pass, `errors: []` |
| `tests/v8_phase6_persistence.py` (save/continue) | All 16 scenarios pass |
| `tests/v8_phase7_secrets.py` (secrets) | All scenarios pass |
| `tests/v8_phase8_menu.py` (menu/Level Select) | All scenarios pass |
| `tests/v8_7_level_exit.py` (goal exit) | All 5 scenarios pass |
| Mobile viewport (390×844) render check | No console/page errors |

## A real test-methodology lesson (disclosed)

Several early debugging attempts used `body.reset()` immediately
followed by a jump key press, which does not reliably prime the
grounded-jump timers (`groundedAt`) the way a real player's input
(arriving only after they are genuinely, continuously grounded) always
does. Every test in the final suite either lets the player settle
naturally for ~300-400ms after any teleport before jumping, or drives
movement purely through held keys from a stable starting state — matching
how a real player's input actually arrives.

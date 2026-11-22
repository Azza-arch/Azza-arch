# Lorong Atas Bumbung — V7 Route Graph

**Status: implemented, verified by natural-input traversal** (not teleportation — see `v7-test-results.md` for the actual browser run this is derived from).

## Mandatory route (strict A → B → C → D → E → F → G → GOAL is NOT literal — C is a detour, see below)

```
SPAWN(80,1100)
  │ jump FIRST_GAP (120px, dy=0)
  ▼
Zone A ground
  │ ladder (rise 120)
  ▼
Zone B: town-walk-1 (980) ──┬── ladder (rise 160) ──> Zone C: cafe-deck (820) [CP1, dead end]
  │ jump (140px, dy=0)       └── (same ladder back down) <──────────────────┘
  ▼
Zone B: town-walk-2 (980) — Machine 1 (p1)
  │ solve M1 (f(3)=7) → workshop-gate opens
  ▼
Zone D: workshop-approach (980)
  │ ladder (rise 280)
  ▼
Zone E: roof-entry (700)
  │ jump (150px, drop 40)
  ▼
Zone E: roof-laundry (740)
  │ ladder (rise 80)
  ▼
Zone E: roof-m2 (660) — Machine 2 (p2)
  │ solve M2 (3x-2=10 → x=4) → rooftop-gate opens
  ▼
Zone F: f-step1 (700) [CP2]  ──┬── ladder (drop 180) ──> cave-alcove (880) [optional coin]
  │ jump (150px, drop 200)     └── (same ladder back up) <──────────────────┘
  ▼
Zone F: f-step2 (900)
  │ ladder (drop 200)
  ▼
Zone G ground (1100) [CP3]
  │ solve M3 (4x-3=17 → x=5) → final-gate opens
  ▼
GOAL(4100,1100)
```

## Critical connection tests (per the brief's §4 requirement) — all verified by natural keyboard input in `tests/probe.py`

| Test | Result | Evidence |
|---|---|---|
| A can reach B naturally | ✅ | real ladder climb, `tests/probe.py` "A->B: ladder climbed" |
| B can reach C | ✅ | real ladder climb (optional detour) |
| C can reach back to B/D | ✅ | same ladder, climbed down |
| B can reach D | ✅ | real jump + walk through solved workshop-gate |
| D's gate unlocks progression toward E | ✅ | gate-bypass attempt failed *before* solving (confirmed: x never exceeded 1600 unsolved); crossed freely after solving M1 |
| E's Machine 2 can be reached by rooftop traversal | ✅ | real jump + ladder sequence, confirmed unreachable from D's tier and from the adjacent roof-laundry deck (both tested live) |
| E can exit to F after solving Machine 2 | ✅ | real jump across the solved rooftop-gate |
| F can descend into G | ✅ | real jump + ladder, landed on ground |
| G's Machine 3 opens the final bridge | ✅ | solved, `solvedGates.size===3` confirmed |
| Goal is reachable after all required puzzles | ✅ | `#complete[open]` dialog confirmed |

No step in this table was verified by teleportation — every connection above was walked using the same `walk`/`climb_up`/`climb_down`/`running_jump` helpers that drive real keyboard input through Playwright, identical in kind to the helpers already proven in V6.1/V6.2's own test suites. Teleportation (`body.reset(...)`) was used in exactly two places, both explicitly for *negative* bypass-checks (confirming Machine 2 is unreachable from a given point) — never as proof that a connection *works*.

## Optional branches (do not bypass anything, do not block progression)

- **Zone C (café):** a true dead end — reached via one ladder, left via the same ladder. Visiting it costs the round-trip climb and nothing else; skipping it costs nothing but the coin and CP1 (which is instead picked up automatically if the player happens to detour there — CP1 is not on the mandatory path, so a player who skips C never saves at all until CP2, a deliberate but minor design tension flagged in the risk register).
- **Zone F cave alcove:** a true dead end off f-step1, reached and left via the same ladder, rewards one optional coin, never blocks the main f-step1→f-step2 jump.

## Bypass prevention — what was specifically checked

- **M1 (workshop-gate):** gate width (300px) exceeds the flat-jump ceiling (236px) — confirmed both by physics computation (`v7-jump-validation.csv`) and by a live jump attempt against the unsolved gate (player never crossed x=1600).
- **M2 (rooftop-gate):** Machine 2's terminal (x=2400, feet=660) is unreachable from the street/D's tier (confirmed: `|y-980|` far exceeds the 48px interaction tolerance) and from the horizontally-closest adjacent deck, roof-laundry (feet=740, 80px below M2 — exceeds the tolerance too). Both checked live, not just in the unit test.
- **M3 (final-gate):** same 300px-width rule applies; not separately live-tested with a jump attempt in this pass (the workshop-gate test already demonstrates the mechanism and the physics table confirms all three gates use the identical 300px width), flagged in the risk register as a minor evidence gap, not a known failure.

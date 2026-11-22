# V9 Phase 1 — Test Results

All tests run against the real game in a Chromium browser via Playwright,
with natural keyboard input (holding movement keys exactly as a real
player would) for every crate interaction.

## 1. Existing regressions — unaffected

| Suite | Result |
|---|---|
| `node --test` (11 unit tests) | 11/11 pass |
| `tests/probe.py` (full A→G traversal) | Clean pass, `errors: []`. The crate puzzle sits directly in the player's walking path in Zone A and does **not** interfere with or require interaction — confirms "the entire A→G adventure remains completable without solving this optional puzzle" directly, not just by inspection. |
| `tests/v8_phase6_persistence.py` (save/continue) | All 16 scenarios pass |
| `tests/v8_phase7_secrets.py` (secrets) | All scenarios pass |
| `tests/v8_phase8_menu.py` (menu/navigation) | All scenarios pass |
| `tests/v8_7_level_exit.py` (goal exit) | All 5 scenarios pass |

## 2. New: `tests/v9_phase1_crate.py` — dedicated crate/switch/reset tests

| Scenario | Result |
|---|---|
| Push from the left (rightward) reaches and activates the switch | Crate reaches x≈346–360 (switch at 350±40); `crateSwitchActive===true`; the platform has a **real** collision body (`cratePlatformBody` exists), not merely a visual change. **Pass.** |
| Push from the right (leftward) also works; pulling off deactivates | Player repositioned to the crate's right side, pushed left off the switch: `crateSwitchActive` correctly becomes `false`, and the platform's collision body is correctly removed. **Pass.** |
| Side-adjacency alone does NOT activate the switch | Crate placed at a position just outside the switch's 40px radius while grounded: `crateSwitchActive` stays `false`. Confirms the brief's explicit "a simple side-overlap must not activate it" requirement. **Pass.** |
| Explicit "Reset Kotak" (C) | Resets the crate to its exact start x (260), deactivates the switch, removes the platform body, and — verified separately — does **not** touch `solvedGates`/`checkpointIndex` (i.e. it only resets this local puzzle, nothing else). **Pass.** |
| Automatic recovery | Pushing the crate past the gap edge (x≥425) and waiting (no manual input): the crate falls, crosses the y:1160 threshold, and is silently reset back near its start — with zero manual 'C' press. **Pass.** |
| No unavoidable softlock | With the crate puzzle mid-interaction, the existing 'R' (checkpoint respawn) key still works normally and returns `mode==='playing'`. **Pass.** |
| Full A→G completable without touching the crate | Solving all three gates and exiting via the goal (crate left completely untouched at its start x=260) reaches `mode==='complete'` normally. **Pass.** |
| Console/network check across a full push→switch→platform sequence | `console/page errors: []` across the entire sequence, including a real jump onto the newly-activated platform confirming genuine walkable collision (`body.bottom` settles exactly at the platform's own y, `blocked.down===true`). **Pass.** |

## 3. Visual evidence (real natural-input gameplay, not staged)

- `screenshots/seq-1-approach-crate.png` — player approaching the crate,
  both labels ("Tolak kotak ke suis →", "C · Reset kotak") visible, switch
  idle.
- `screenshots/seq-2-switch-activated.png` — mid-push, the pulse-ring
  activation cue visible at the switch the instant it registers.
- `screenshots/seq-3-platform-open.png` — platform fully opaque/solid
  after activation.
- `screenshots/debug-zoomed.png` — a close-up confirming the crate,
  switch, and platform art are all genuinely present and distinct (they
  read as quite small/subtle at normal gameplay zoom — see
  "Known limitations" below).
- `screenshots/player-on-activated-platform.png` — the player standing on
  the activated platform, proving real walkable collision.

## 4. Specific brief requirements — verified directly, not assumed

- **"Inspect the current player fall threshold before selecting the
  crate recovery threshold"**: done — `GROUND_RANGES`/the crate's own
  placement were read first, confirming this crate sits on the exact same
  ground tier (y=1100) the player's own 1160 threshold already targets,
  so reusing that value is a verified match for *this* placement, not an
  assumption that would hold for every possible future crate.
- **"The pressure switch must require valid crate-on-top contact... a
  simple side-overlap must not activate it"**: verified directly (test
  table, row 3).
- **"The crate cannot become permanently trapped under one-way platforms
  or against solid terrain"**: verified by construction — the crate's
  playable range (x:220–430ish) contains no `DECKS` entry at all (the
  nearest deck, town-walk-1, starts at x:580), so there is no one-way
  platform anywhere above this crate to be trapped under; the ground
  itself is flat with no walls, ruling out a terrain trap by the same
  construction argument.
- **"The player can push from both directions"**: verified (test table,
  rows 1–2).
- **"The crate cannot cause unavoidable player softlocks"**: verified
  (test table, row 6) — R and C both remain fully functional at all times.
- **"The optional mechanism is a real gameplay state change, not just a
  decorative animation"**: verified — the platform's *collision body*
  (not just its alpha) is created/destroyed live.
- **"The entire A→G adventure remains completable without solving this
  optional puzzle"**: verified (test table, row 7, and `probe.py`'s own
  clean pass with the crate never touched).

## Known limitations (disclosed honestly)

- The crate/switch sprites (`kenney_block_center`, `kenney_lever`) are
  small and read as subtle at normal gameplay zoom — appropriate for a
  prototype validating the *mechanic*, not a finished visual pass. A
  follow-up could give the crate a more distinct outline/size if the
  mechanic is approved for expansion.
- No mobile on-screen "Reset Kotak" button was added — the `C` key works
  on desktop; touch-device testing of this specific control was out of
  this prototype's explicit scope (V9.0–V9.2, no UI expansion authorized).
- The crate/switch/platform currently have no dedicated unit test (the
  project's `node --test` suite covers static level-geometry invariants
  only); all crate verification here is via the real-browser Playwright
  suite instead, consistent with how every other interactive system in
  this project is tested.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).

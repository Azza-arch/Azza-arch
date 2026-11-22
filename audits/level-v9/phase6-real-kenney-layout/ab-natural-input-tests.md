# V9.6 — A/B Natural-Input Reachability Tests

New suite: `tests/v9_6_ab_natural_input.py`. Every check below is driven
by real held-key input (down/up, held for the actual physics-resolved
duration), exactly like a human player — no teleports stand in for any of
the checked transitions (teleports are used only to reposition for the
crate-mount sub-step, mirroring the proven pattern already used in
`tests/v9_phase1_crate.py`).

| Check | Result |
|---|---|
| First gap (x420, width120) — natural running jump | Cleared: lands at feet=1100 |
| Crate push from x=230 to the switch at x=340 | Switch activates naturally (`crateSwitchActive===true`), ledge platform spawns |
| Mount crate top, then jump to the ledge | Player reaches feet≈980 (the ledge), matching the two-sub-jump design (crate-top rise ~72px, ledge rise ~72px from crate-top — both under the 96.6px max) |
| Relocated `coin-a` pickup from the ledge | `coinsFound` goes from 0→1, confirmed collectible only after legitimately reaching the ledge |
| Reset Kotak (`C`) mid-interaction | Crate returns to x≈230, switch deactivates, ledge platform removed |
| Re-crossing FIRST_GAP after Reset Kotak | A genuine issue was found and fixed here — see "finding" below |
| A→B ladder (x=610) | Climbed naturally, lands at feet=980 |
| B's real jump (town-walk-1 → town-walk-2) | Lands at feet=980 on town-walk-2, as before |
| Machine 1 solved + `workshop-gate` opens | Confirmed via the normal puzzle dialog flow |
| B→D transition (x=1300 boundary) | Confirmed reachable, feet=980 |
| Console/page errors across the whole sequence | `[]` |

## Finding during test-writing (not a shipped bug — a test-methodology
## correction, documented for honesty)

The first draft of this test walked straight from the post-Reset-Kotak
respawn point (x=80) toward the ladder (x=610) by simply holding the
movement key. Since Reset Kotak puts the crate back at x=230 — directly
in that walking path — holding the key the whole way just **shoves the
reset crate along the ground and into the first gap's void**, which
triggers the crate's own existing auto-recovery (already covered by
`tests/v9_phase1_crate.py`) but leaves the test holding its movement key
with no forward progress (the crate keeps getting shoved back into the
same gap in a loop). This is not a new regression: it reproduces
identically on the pre-V9.6 code too, and a real player simply wouldn't
walk through the gap zone this way — they jump it, as the FIRST_GAP has
always required. The test was corrected to jump the gap a second time
(matching real intended play) rather than walking through it; after that
fix, the whole sequence passes clean. No game code was changed for this.

## Also exercised via the existing, unmodified suites this phase

- `tests/v9_phase1_crate.py`: full crate/switch/reset/auto-recovery/
  no-save-pollution suite — still passes unmodified (its own geometry and
  textures weren't touched by anything this test checks, only visuals).
- `tests/probe.py`: full natural-input A→G adventure, desktop + mobile,
  missing-asset handling — passes clean.
- `tests/v8_7_level_exit.py`: one teleport coordinate updated (see
  `full-regression-results.md`) to match `coin-a`'s new position; after
  that fix, the full completion-summary check (including the coin count)
  passes again at `1/7`.

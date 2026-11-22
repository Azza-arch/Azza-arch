# Lorong Atas Bumbung — V7 Test Results

## Unit tests (`node --test tests/level.test.mjs`)

**11/11 pass.** Fully rewritten for V7's new geometry (the old suite referenced V6 deck ids that no longer exist — not weakened, replaced with checks appropriate to the new topology, several of them *new* checks the V6 suite never needed):

1. Each puzzle accepts only its correct answer (unchanged from V6).
2. Every gate is wide enough to be unjumpable on every side — **new framing**: V7 gates can sit at the same tier on both sides (V6's never did), so this explicitly checks the 236px ceiling against all three gates, not just asserts a width.
3. Every mandatory same-tier jump stays inside the validated flat-jump envelope.
4. Every rise too big to jump is a ladder, not a jump — **new**: V7 has four different rise magnitudes (120/160/280px) across different tier pairs; this confirms each is backed by both a physics argument (exceeds 96.6px) and an actual `LADDERS` entry.
5. Every ladder lands on a real deck or ground range at both ends.
6. Falling off a deck with ground beneath it lands on continuous ground, not a gate gap — **new**: also explicitly confirms the *inverse* for `roof-entry`/`roof-laundry`/`roof-m2`, i.e. that the deliberate no-safety-net design on the E chain is intentional, not an oversight (a future edit that accidentally added ground there would fail this test).
7. Terminals, gates and checkpoints reference consistent ids (unchanged from V6).
8. Every terminal sits exactly on its own deck/ground tier — **new**: V7 has terminals on three different tiers (980/660/1100); this confirms each one's `feet` value matches a real surface at that exact position.
9. Machine 2 is unreachable from the street or any adjacent deck, reachable only from roof-m2 — carried forward from V6.2, re-verified against V7's new coordinates.
10. Zones with `yMax` correctly disambiguate stacked zones by height — **new**: required because V7 introduces genuinely stacked zones (C above B, E above D), which V6's purely-x-sliced `ZONES` array never needed to handle.
11. All runtime assets are real, unchanged source PNGs (unchanged from V6).

## Browser regression (`tests/probe.py`, desktop 1440×1000)

**Pass. 0 page errors, 0 console errors, 0 failed requests.** Full natural-input playthrough:

- Zone A: FIRST_GAP jumped, landed exactly on ground (feet=1100).
- A→B: ladder climbed (rise 120), landed exactly on town-walk-1 (feet=980).
- **Deliberate failed-jump recovery test** (B): walked off town-walk-1's edge with no jump input — fell safely to the ground beneath it (feet=1100), confirmed not a respawn.
- B→C detour: ladder climbed (rise 160), CP1 reached (checkpointIndex 0→confirmed), returned down the **same** ladder to B.
- B's real jump (gap 140, dy=0): landed exactly on town-walk-2 (feet=980).
- **Gate-bypass test**: jump attempt against the unsolved workshop-gate — player's x never exceeded 1600 (the gate's far side), confirmed not crossable.
- Machine 1 solved (`f(3)=7`), workshop-gate confirmed open, crossed on foot.
- D→E: the single rise-280 ladder climbed, landed exactly on roof-entry (feet=700).
- **Bypass test**: Machine 2 unreachable from workshop-approach's tier (confirmed: puzzle did not open on interact).
- E's chain: jumped to roof-laundry (gap 150, drop 40, feet=740); **bypass test** confirmed Machine 2 still unreachable from this horizontally-closest adjacent deck; climbed the internal ladder (rise 80) to roof-m2 (feet=660).
- Machine 2 solved (`3x-2=10 → x=4`), rooftop-gate confirmed open (`solvedGates.has('rooftop-gate')`).
- E→F: jumped across the solved gate (gap 40, drop 40), CP2 reached (checkpointIndex 1→confirmed), landed on f-step1 (feet=700).
- F's optional cave: climbed down (drop 180) to cave-alcove, confirmed a coin collected (`coinsFound>=1`), climbed back up.
- F's main jump (gap 150, drop 200): landed on f-step2 (feet=900).
- F→G: climbed down (drop 200) to the ground tier (feet=1100).
- CP3 reached (checkpointIndex 2→confirmed).
- Machine 3 solved (`4x-3=17 → x=5`), `solvedGates.size===3` confirmed.
- **Checkpoint recovery test**: pressed R, confirmed respawn to CP3 (feet≈1100) with all 3 solved gates preserved (`solvedGates.size===3`).
- Walked to GOAL, `#complete[open]` dialog confirmed.
- Replay: confirmed full state reset (`solvedGates.size===0`, `checkpointIndex===-1`).
- `routePlatforms.length===15` confirmed (10 decks + 5 ground segments).
- Pause/resume: confirmed position frozen while paused.

## Browser regression — mobile (390×844, touch + landscape rotation)

**Pass. 0 page errors.** Touch run/jump/interact, landscape rotation (844×390), puzzle dialog at mobile width, pause/resume all confirmed.

## Browser regression — missing-asset path

**Pass.** Blocking the Chill Boy idle sprite still produces the visible "Aset tidak dapat dimuatkan" failure state with no broken start screen — unchanged from V6, confirming the failure-handling path wasn't affected by the geometry rewrite.

## Browser regression — unrelated Add Math pages

**Pass.** Home page, "Mula" button, Tingkatan 4 map link, and the `rooftop/` link count (exactly 1) all confirmed unchanged.

## A real bug found and fixed during this pass (disclosed per the brief's "do not hide failures" instruction)

**Flush-platform step-down failure.** The first implementation placed `f-step1` immediately adjacent to `rooftop-gate` (zero horizontal gap, 40px drop) — a transition type that does not exist anywhere in V6's level, since every V6 deck-to-deck transition used either an explicit jump across a real horizontal gap or a ladder. Confirmed directly (isolated Playwright debug session, not the regression suite) that walking off the gate at speed with zero gap caused the player to fall straight through `f-step1` *and* the next deck, `cave-alcove`, landing on the ground tier instead of either — the one-way-platform collision check (`prev.y + bodyHeight <= platform.top + 8`) does not reliably catch a body already falling at speed with no actual airborne moment before reaching the next platform's x-range. Fixed by introducing a real 40px horizontal gap (shifting `f-step1`, `cave-alcove`, and the connecting ladder all 40px right) and crossing it with an explicit jump rather than a plain walk — re-verified clean in both the isolated debug session and the full regression suite. This is now documented as a `v7-jump-validation.csv` entry like every other jump, not left as a silent walk-through.

## Known gap in evidence (disclosed, not a failure)

The `final-gate` bypass mechanism was verified by physics computation (300px width exceeds the 236px ceiling, identical to `workshop-gate`) but was **not** separately live-tested with an actual jump attempt in this pass — the `workshop-gate` live test already demonstrates the mechanism works as designed, and all three gates share the identical width, but this is a minor evidence gap worth closing in a future pass rather than a known failure.

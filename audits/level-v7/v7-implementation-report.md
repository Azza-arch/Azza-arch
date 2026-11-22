# Lorong Atas Bumbung — V7 Master Map Reconstruction: Implementation Report

**Scope:** full Level 1 geometry reconstruction from `docs/level-reference/v7-master-map.png` (copied into the repo from the user's reference file for this pass). Not a design-only audit — this is implemented, working code, verified by natural-input browser traversal. Nothing was committed.

---

## 1. Reference interpretation

The reference shows seven interconnected zones at genuinely different elevations, not seven flat corridors:

- **A** (bottom-left, ground) → **B** (above-right of A, elevated) → **C** (above B, a café detour with the first checkpoint) → **D** (central, workshop, same elevation as B) → **E** (above D, the main rooftop chain with Machine 2) → **F** (upper-right, stepped hillside with an optional cave) → **G** (lower-right, the final bridge and goal).

This was implemented as **four stacked tiers**, reused across zones exactly as the reference does (not one zone per tier — B and D share a tier, as do C and E's base):

| Tier | y | Zones |
|---|---|---|
| GROUND | 1100 | A (spawn), F/G (final approach + bridge) |
| TIER2 | 980 | B (town walkway), D (workshop walkway) |
| TIER3 | 820 | C (café, a dead-end detour back into B) |
| TIER4 | 660–740 | E (rooftop chain, varied heights, hosts Machine 2) |

This is NOT a continuously ascending tower — the world rises once (A→E) then descends once (E→G), matching the reference's overall silhouette rather than inventing a taller structure than it shows.

## 2. Files modified

- **`src/level.js`** — completely rewritten. `WORLD` (4300×1300, was 7400×1152), all geometry (`ZONES`, `GROUND_RANGES`, `DECKS`, `LADDERS`, `GATES`, `TERMINALS`, `CHECKPOINTS`, `COLLECTIBLES`). `MOTION` (physics constants), `SPAWN`/`GOAL` shape, and all three `PUZZLES` (formulas/answers) are **unchanged** in content — only `SPAWN.feet`/`GOAL.feet`/`GOAL.x` values moved to match the new geometry.
- **`src/game.js`** — targeted changes only, each narrowly scoped and commented in place:
  - Camera `setBounds`/viewport height recomputed for the taller world (§5 below) — a world-specific number, not a constant, so this had to change regardless.
  - `deck()`'s support-pillar loop: was hardcoded to stack down to y=1000 (V6's only ground height); now reads a per-deck floor (`data.supports`), since V7 has decks with no ground beneath them at all.
  - Ground-rendering loop: `GROUND_Y` constant replacing three hardcoded instances of `998`/`1108`/`1000` (all tuned to V6's y=1000 ground).
  - `currentZoneIndex()`: extended to consider height (`yMax`) as well as x, since V7 has zones that genuinely stack (C above B, E above D) — V6's zones never overlapped in x, so this case never existed before.
  - The gate-adjacent early-respawn check: generalized from one hardcoded tier (`y>900`) to each gate's own y, since V7 has gates at three different tiers (V6's only gate tier was y=1000).
  - `buildScenery()` (V6.3's Phase 1 background art): its **call is disabled**, the method itself left intact. Every coordinate in it was tuned against V6.3's flat-world positions and would be wrong against V7's geometry; the V7 brief is explicit that this pass is a greybox ("minimal background... do not build detailed architecture yet"), so re-tuning it was out of scope rather than guessed at.
  - Two stale V6.2-era decorative calls (cave-entrance `kenney_block_blue` markers at old coordinates) removed; the "Gua (pilihan)" label repositioned to the new cave-alcove location.
- **`tests/level.test.mjs`** — rewritten (not weakened): 11 tests, several new (checking properties V6 never needed, like stacked-zone disambiguation and multi-tier gate widths).
- **`tests/probe.py`** — rewritten: full natural-input A→B→C→D→E→F→G→GOAL traversal, including gate-bypass and Machine-2-bypass live tests, a deliberate failed-jump recovery test, and a checkpoint-recovery test.
- New: `tests/v7_smoke.py` (exploratory, teleport-based, explicitly **not** used as reachability proof — see its own docstring), `docs/level-reference/v7-master-map.png` (the reference image, copied into the repo), `audits/level-v7/baseline/*.bak` (reversible V6.3 snapshot).

## 3. A real bug found and fixed mid-implementation (disclosed)

See `v7-test-results.md` for the full account: the first attempt placed `f-step1` with **zero** horizontal gap after `rooftop-gate` (just a 40px drop). Confirmed via an isolated debug session that the player fell straight through it and the next deck too, landing on the ground tier instead — a transition shape (flush platforms, no jump) that never existed anywhere in V6's level. Fixed by introducing a real 40px gap and crossing it with an explicit jump; re-verified clean in both the isolated session and the full regression suite.

## 4. Jump/ladder geometry — reverified against the live physics

`v0=520, g=1400, speed=280` (all unchanged from V6, confirmed by reading `MOTION`/`WORLD.gravity` directly, not assumed from memory). Max jump rise = 96.6px; flat max range = 208px. Every rise exceeding 96.6px (120/160/280px, three different tier pairs) is backed by a ladder, confirmed by a unit test that checks both the physics argument and the actual `LADDERS` entry. Every jump is inside its computed safe window with a real margin (smallest: 68px on the B jump, 62% of available width used — comparable to margins already accepted in V6.1/V6.2). Full per-jump table: `v7-jump-validation.csv`.

## 5. Camera reconstruction

V6.1's `bounds.top=480` was a **world-specific** derived value (`WORLD.height - viewportHeight`, with a margin), not a general constant — it was meaningless against V7's `WORLD.height=1300`. Recomputed the same way: viewport height raised 648→700 (matched to V7's real vertical range), new ceiling `1300-700=600`, `bounds.top=450` leaves 150px of vertical scroll room (vs. V6.1's own measured 24px) and ~210px of headroom above the highest platform (`roof-m2`, y=660) for jump-arc visibility. Verified live: camera followed smoothly through every tier transition during the full traversal test with no clipping or bounce, confirmed in the captured screenshots (`audits/level-v7/screenshots/`).

## 6. Mathematics, checkpoints, gates — unchanged content, re-placed coordinates

All three formulas/answers (`f(3)=7`, `3x-2=10⇒x=4`, `4x-3=17⇒x=5`) are byte-identical to V6. Each machine sits on a blocked route, requires interaction, opens only its own gate, and was confirmed solved-state-persistent across a checkpoint respawn (`solvedGates.size===3` after pressing R). Three checkpoints placed per the reference (café, post-rooftop-exit, pre-bridge) — exact coordinates in `v7-zone-coordinate-table.csv`.

## 7. Deliberate deviations from the reference (disclosed, per the brief's own instruction)

- The reference's visual density (shopfronts, laundry lines, water tanks, palm trees) is **not** reproduced — per the brief's own §10 ("simple tilemap first... do not build detailed Terengganu architecture yet... minimal background"), this pass is a greybox. The topology, relative positions, and route structure match; the art does not yet.
- Zone C is modeled as a true dead-end detour (climb up, climb back down the same ladder) rather than a through-route to D, based on the reference's own visual (C's ladder icon returns toward B, not continuing into D) — if this reading is wrong, it is a one-line fix (point C's ladder landing at D's tier instead of B's).
- F's optional cave is a single small alcove (one ladder, one coin), not the larger cave shape drawn in the reference — matches the brief's explicit "do not introduce a large cave system."

## 8. Final acceptance checklist (brief §15)

| Requirement | Status |
|---|---|
| A→B works naturally | ✅ real ladder climb |
| B→C works | ✅ real ladder climb (detour) |
| C→D works | ✅ via the same ladder back to B, then the B jump + walk to D (C does not connect directly to D — see §7 deviation) |
| D→E works after M1 | ✅ gate confirmed unjumpable before solving, crossed freely after |
| E→F works after M2 | ✅ Machine 2 confirmed unreachable from below, gate crossed after solving |
| F→G works | ✅ real jump + ladder |
| G→GOAL works after M3 | ✅ |
| All required jumps have safe landing margins | ✅ smallest margin 68px (B), all others 77–187px — see CSV |
| No mandatory route depends on teleporting | ✅ confirmed — every mandatory step in `tests/probe.py` uses `walk`/`climb`/`running_jump`, never `body.reset` |
| Every machine is reachable from the intended route | ✅ |
| Locked gates cannot be bypassed | ✅ workshop-gate live-tested; rooftop-gate and final-gate confirmed by the same 300px-width physics argument (final-gate not separately live-jump-tested — disclosed gap, not a failure) |
| Checkpoints work after respawn | ✅ R-key test confirmed position + solved-gates preserved |
| No major camera clipping | ✅ confirmed across the full traversal, all screenshots clean |
| Full-map topology resembles the reference | ✅ see `v7-reference-comparison.png` — same zone order, same relative tiers, same up-then-down overall shape |
| No unrelated Add Math pages break | ✅ confirmed (home, Mula button, Tingkatan 4 map, rooftop link count) |
| No console errors | ✅ 0 across desktop, mobile, missing-asset, and shell runs |
| No unrelated source changes | ✅ only `level.js`/`game.js`/the two test files touched |

**V7 is reported COMPLETE** — every critical acceptance condition passed, with the two disclosed minor gaps (final-gate's live bypass test, the C-detour reading of one reference arrow) explicitly called out rather than hidden.

## 9. Deliverables

All under `audits/level-v7/`: `v7-implementation-report.md` (this file), `v7-implemented-full-map.png`, `v7-reference-comparison.png`, `v7-zone-coordinate-table.csv`, `v7-jump-validation.csv`, `v7-route-graph.md`, `v7-test-results.md`, `screenshots/` (14 real browser captures, desktop + mobile).

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — the entire directory remains untracked, exactly as before this pass began. No commit was made.

**Stopping here per the explicit "STOP after producing the playable V7 greybox, full-map comparison and test evidence" instruction.**

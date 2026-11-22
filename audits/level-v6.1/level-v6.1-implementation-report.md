# Lorong Atas Bumbung — V6.1 Controlled Implementation & Playtest Report

**Scope:** Zone B and Zone E geometry replacement (per the approved `level-v6.1-blueprint.md`), plus a tested camera correction. Zones A, C, D, F, G, multiplayer, enemies/hazards, particles/screen shake, new art, new math questions, and the physics constants (`MOTION`/`WORLD.gravity`) are all **unchanged**. Nothing was committed.

---

## Step 1 — Baseline

Reversible baselines saved before any edit: `audits/level-v6.1/baseline/level.js.bak`, `game.js.bak`, `level.test.mjs.bak`. Old coordinates (for the record):
- Zone B: `town-upper-1` (x1300-1500,y824), `town-upper-2` (x1628-1848,y824), ladders at x1350/x1800.
- Zone E: `roof-e1` (x4750-5000,y824), `roof-e2` (x5128-5378,y824), ladders at x4800/x5350.

Baseline `node --test`: **6/6 pass**. Baseline `tests/probe.py` (full natural-input playthrough): **pass**, 0 page/console errors.

## Step 2 — Zone B implemented

`awning-b1` (1250-1370,y900), `awning-b2` (1500-1620,y900), `awning-b3` (1750-1870,y900) — all same height, two 130px flat jumps (dy=0). Ladder up at x1280 (lands on b1), ladder down at x1850 (lands on b3). Lower street (ground y=1000, continuous 540–3850) untouched and still fully walkable underneath. Both existing collectibles repositioned onto the new platforms (not added or removed) — `coin-b1`→above b1, `coin-b2`→above b3.

## Step 3 — Zone E implemented

`roof-e1` (4550-4690,y960, rise 40 from street), `roof-e2` (4800-4960,y896, rise 64 from e1), `roof-e3` (4880-5040,y800, via the **single** ladder at x4900 — the one rise too big to jump, 96px), `roof-e4` (5200-5350,y940, descent 140 from e3), then a final descending jump (drop 60) landing on the street at ~x5500, 60-70px before the existing M2 terminal (x5570) and `rooftop-gate` (x5650). Collectibles repositioned: `coin-e1`→above e2, `coin-e2`→above e4. No moving platforms were implemented (confirmed architecturally unsupported, per the V6 feasibility review — unchanged conclusion).

## Step 4 — Camera A/B test

Tested at 1366×768, 5 representative world locations (flat street, Zone B mid-chain, Zone E's highest tier, world-left boundary, near-goal), both configs, matched camera positions, direct screenshots saved under `screenshots/camera-*-before.png` / `*-after.png`.

**Finding — the originally-proposed `bounds.top=650` is invalid and was corrected before implementing anything:** Phaser requires camera-bounds height ≥ the 648px logical viewport height. `WORLD.height(1152) − 650 = 502 < 648`, which silently locks the camera at a fixed vertical frame (confirmed directly: `camY` read exactly `650` at every one of the 5 test locations, including ground level, meaning the camera stopped following the player vertically at all — see `camera-zoneE-high-after.png` from the first test run, now superseded). This is worse than the original framing, not better, and is exactly the kind of result the brief asked to catch before trusting the proposed numbers.

**Corrected value used:** `bounds.top=480` (the mathematically maximum safe value: `1152−648=504`, with a 24px margin) + `offsetY: 60→10` (unchanged from the proposal — this part tested cleanly). Re-tested at the same 5 locations: camera now follows vertically in all cases, clamps correctly at both world edges, no void or stuck frame. Measured effect at Zone E's highest point (roof-e3, the worst case): ground line moved from ~96% down the frame (before) to ~83% (after) — a real, if modest, reduction in empty sky, not a cosmetic claim. At ground level (the most common gameplay state) both configs clamp to the same `scrollY=504`, i.e. **no behavior change for ordinary ground traversal** — the correction only affects elevated sections, which is the intended, narrow scope.

**Outcome: implemented**, with the corrected bounds value, not the originally-proposed one. `src/game.js` carries an inline comment explaining the correction and why it was necessary.

## Step 5 — Preserve gameplay (regression)

Full `tests/probe.py` (desktop + mobile + missing-asset + Add Math shell) re-run after every change (geometry, then camera): **pass every time**, 0 errors. Confirmed intact: movement/jumping, both zone transitions (FIRST_GAP, workshop-gate), all 3 puzzles (correct/incorrect-answer handling unchanged, formulas/answers untouched), all 3 checkpoints, the optional cave detour, replay (full state reset), pause/resume, fall-recovery/respawn, and the unrelated Add Math pages. `node --test` (level.test.mjs, now updated for the new deck ids — see below): **6/6 pass**.

## Step 6 — Real playtesting (natural keyboard input only)

Dedicated script (`v61_upper_route_playtest.py`, not `body.reset()`-based for any jump claim) walked and jumped the actual new Zone B and Zone E sequences using held keys exactly as a player would. Full results in `screenshots/v61-upper-route-results.json`; summary:

| Jump | Result |
|---|---|
| Ladder up → awning-b1 | ✅ landed feet=900 |
| awning-b1 → awning-b2 (130px, dy=0) | ✅ landed feet=900 |
| awning-b2 → awning-b3 (130px, dy=0) | ✅ landed feet=900 |
| Ladder down from awning-b3 | ✅ landed feet=1000 |
| Street → roof-e1 (rise 40px) | ✅ landed feet=960 |
| roof-e1 → roof-e2 (rise 64px) | ✅ landed feet=896 |
| Ladder roof-e2 → roof-e3 (rise 96px) | ✅ landed feet=800, left ladder cleanly, moved freely afterward |
| roof-e3 → roof-e4 (drop 140px) | ✅ landed feet=940 |
| roof-e4 → street (drop 60px) | ✅ landed feet=1000, M2 terminal prompt confirmed visible on arrival |

**Deliberate failed-jump tests** (walk off a platform edge with no jump input at all — the genuine "missed it" case): off `awning-b1`'s edge and off `roof-e1`'s edge. Both: player left the platform, fell, and landed safely on the continuous street below (`feet=1000`) — **no stuck state, no respawn**, confirming the "every miss is a safe fall" property for both zones.

Screenshots at every step confirm visual legibility (ladders, zone label, machine label, coins all readable without debug overlays) — see `screenshots/zoneB-0{1-5}*.png` and `screenshots/zoneE-0{1-7}*.png`.

## Step 7 — Evidence index

1. **Zone B before/after:** `screenshots/zoneB-overview-before.png` / `-after.png` (matched camera position, old vs new geometry).
2. **Zone E before/after:** `screenshots/zoneE-overview-before.png` / `-after.png`.
3. **Camera A/B:** `screenshots/camera-*-before.png` / `*-after.png` (5 locations); see Step 4 for the correction that was required before these became valid evidence.
4. **Technical overview of implemented geometry:** `level-v6.1-implemented-geometry.png` — rendered directly from the live, shipped `src/level.js` constants (not the earlier proposal).
5. **Jump test results:** `screenshots/v61-upper-route-results.json` (full detail) + table above.
6. **Regression test results:** `node --test` 6/6 pass (both before and after every change); `tests/probe.py` full pass, 0 errors, both before and after.
7. **Files changed:** `src/level.js` (Zone B/E `DECKS`/`LADDERS`/`COLLECTIBLES` only), `src/game.js` (camera `setBounds`/`startFollow` call only), `tests/level.test.mjs` (deck-id references updated to match the new geometry, same assertions, no coverage removed), `tests/probe.py` (one hardcoded platform-count constant updated, 11→14, to match the legitimately larger deck count). Full diffs against the saved baselines are in this report's git-free form above (the whole `app/addmath/rooftop/` directory is untracked, so there is no git diff to show — the `audits/level-v6.1/baseline/*.bak` files are the reversible baseline).
8. **Remaining UX/level-design issues:**
   - The camera correction only measurably helps at elevated sections; ground-level framing (the majority of playtime) is unchanged by design — if the user wants further sky reduction at ground level too, that requires a different lever (e.g. a smaller fixed viewport height), out of scope here.
   - Zone E's `roof-e2`/`roof-e3` intentionally overlap in x (4800-4960 / 4880-5040) since the ladder sits at their shared edge (x=4900) — this is correct per the engine's actual ladder-matching logic (verified by both the unit tests and the live playtest) but is worth a second look if a future pass ever changes either platform's width.
   - No new collectibles were added even though Zone B gained a third platform (b2 has no coin above it) — kept intentionally minimal per "do not add new features"; a future pass could consider whether a third coin is warranted, but that's a content decision for the user, not made here.

---

## Source-modification check

```
app/addmath/rooftop/ (entire directory, still untracked — never committed)
```
No commit was made. `git status --porcelain app/addmath/rooftop/` shows only the pre-existing untracked directory, consistent with every prior pass. Changed files are listed above; reversible baselines remain at `audits/level-v6.1/baseline/` if the user wants to revert.

**Stopping here per the explicit "Finish this controlled pass, produce evidence and STOP" instruction.** The next full-map reconstruction decision belongs to the user after reviewing the screenshots above.

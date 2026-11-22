# Lorong Atas Bumbung — V6.3 Approval & Recommended Decisions

**Status: design-only. No source file modified; no implementation performed.** Verified via `git status --porcelain app/addmath/rooftop/` at the end of this document.

## Safe to implement immediately (no further approval needed beyond this document)

- **Phase 1 (Background layering)** using `bg_house_row`, `bg_hills`, `bg_mosque` (×1) — already-imported, already-licensed assets, zero collision, zero gameplay-coordinate risk, fully reversible independent of every later phase.
- **Phase 3 (Landmark composition)** using the midground assets listed per zone in `level-v6.3-zone-composition.md` — same risk profile as Phase 1 (non-collidable `this.add.image` calls only).
- **Phase 6 (Cross-resolution QA)** — reuses `tests/probe.py`'s existing viewport assertions, no new test infrastructure needed.

## Requires an explicit Option A/B decision before implementing (see `level-v6.3-art-direction.md` §0)

- **Phase 2 (Foreground terrain texture swap)** — only needed if Option A (mixed asset family) is chosen; skipped entirely under Option B (Kenney-only).
- **Phase 4 (Interactive-object sprite swap)** — same gate as Phase 2.

This decision is the single highest-leverage call in this entire pass: Option A gives every zone a genuinely distinct, purpose-built landmark (directly answering the brief's core complaint, §9 "every zone needs a recognizable silhouette"); Option B is lower-risk but leaves the "seven unrelated rooms" problem only partially addressed (background atmosphere improves, but no building/landmark silhouette exists anywhere). **Recommendation: Option A**, on the strength of the inventory's direct sampling (the illustrated-family assets are clean and consistent, not "messy scribble lines," and the Layer 1/2/4-only placement rule in the art direction document specifically prevents the clash the brief warns against) — but this is the one decision in this document that should not be treated as pre-approved; it changes what every subsequent phase draws.

## Requires art not currently available (deferred, not blocking this pass)

- A dedicated "wooden awning" or "rooftop deck" top-surface sprite that is purpose-drawn for this game (rather than repurposed from `platform_wood_*`, which is a reasonable but generic wood-plank tile, not an awning specifically) — flagged, not blocking, since `platform_wood_*` is an adequate interim answer per the inventory.
- A genuinely zone-specific "small Terengganu-influenced commercial street" background layer — `bg_house_row` is a reasonable generic-town substitute but was not purpose-drawn for this project's stated "subtle Terengganu influence" framing; flagged as a future art commission, not a blocker.
- Any game-feel effect anchor art (jump dust, landing feedback, coin sparkle, machine activation pulse, bridge motion, victory effect) — explicitly out of scope for V6.3 per the brief's §14; this pass identifies anchor *points* only (every Layer 4 interactive object and every ladder-top/bottom already has a stable, named coordinate suitable for a future effect anchor — no new anchor-point work is needed when that phase begins).

## Which decisions affect gameplay readability (and were checked against it)

- Phase 2/4's texture swaps were checked against `tests/probe.py`'s existing assertions (which test state and coordinates, never texture keys) and found to carry **zero gameplay-logic risk** — confirmed in `level-v6.3-implementation-plan.md`'s per-phase verification notes.
- Phase 3's midground placement was checked against every jump in `level-v6.2-jump-validation.csv` for visual overlap risk (Zone E's roof-mass silhouette specifically flagged in `level-v6.3-zone-composition.md` to never visually suggest a climbable surface from street level, given that exact bypass was the subject of the V6.2 implementation pass).
- Camera Alternative A (recommended) was checked and found to introduce **zero** readability risk, by construction (no camera value changes). Camera Alternative B's readability trade-offs (character-scale increase, re-verification requirement) are fully quantified in `level-v6.3-camera-options.md` and are the reason it is not recommended for this pass.

## What should be deferred

- Camera Alternative B (viewport-height reduction) — real but partial benefit, requires code changes and re-verification work explicitly out of this design-only pass's scope; deferred to a future pass only if the user decides the sky reduction is worth the trade-off after seeing Phase 1/3's content-based fix in practice.
- Any further building/landmark asset commissioning beyond what's already in `assets/production/` and `assets/background-legacy/` — the current inventory is sufficient for every zone's composition plan; no gap was found that blocks Phase 1 or Phase 3.
- Phase 2/4 specifically, pending the Option A/B decision above.

## Design quality self-check (brief §16, answered against this plan, not generically)

- Not a physics-test map: Phase 2/4 directly replace the most "test map"-reading elements (generic stone blocks as awnings, generic lever as machine).
- Not a row of floating rectangles: Phase 3's midground silhouettes give every elevated platform a background structure to visually belong to.
- Not seven unrelated rooms: §8 continuity (shared `bg_house_row` across A→B, shared `bg_hills` across E→F→G) is built into the zone composition plan, not left implicit.
- Not repeated block towers: Zone B's two platforms get *different* midground shopfronts at different positions (explicitly flagged in the zone composition plan's Zone B "visual risks" row) specifically to avoid undoing V6.2's own "avoid identical silhouettes" gameplay fix with identical background art.
- Not a giant empty grey canvas: Phases 1+3 together are the direct answer.
- Not a decorative webpage pretending to be a game: every proposed addition is layer-separated from, and never obstructs, Layer 3/4 — gameplay legibility is the explicit constraint every zone composition entry was checked against, not an afterthought.

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
No source, physics, camera, or asset-wiring file was modified during this design pass. All V6.3 deliverables live under `audits/level-v6.3/`, parallel to but outside the live game source, consistent with the V5/V6/V6.1/V6.2 pattern.

**Stopping here per the explicit "design only... stop after producing the visual audit, schematic mockups and implementation plan" instruction.**

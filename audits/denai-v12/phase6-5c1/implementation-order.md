# Implementation order (for Phase 6.5C2, pending approval — not started)

No total map rebuild is proposed. Every item below reuses existing, already-loaded assets and touches decoration/background layers only; no physics, collision, gate math, or save-schema changes anywhere in this list.

## P0 — Visual bugs / misleading terrain

**None found.** Both candidate "broken seam" locations inspected directly (D-service ladder running off-frame at the top, E's pipe segments doubling as a walkable surface) are confirmed-intentional geometry, not defects (coordinate-issues.md). There is no misleading-terrain issue in the audited zones that would make a player misjudge a jump or a collision silhouette.

If C2 wants a P0-equivalent item, the closest candidate is:
- **E's walkway pipe segment isn't visually distinguishable from non-walkable pipe segments.** Borderline P0/P1 — it's not misleading in a way that breaks a jump (the player can simply walk onto it and it works), but it is the one spot where appearance and function diverge. Recommend treating as **P1** since live testing showed no actual player-facing failure, only a legibility gap.

## P1 — Scene composition and depth

Ordered by leverage (biggest visual impact for lowest risk first):

1. **Background layer: `kpp_bg_hill` across the full world width**, depth 0.5, per depth-layer-plan.md. Single highest-leverage change — fixes the "empty sky" complaint everywhere at once, zero new assets, zero collision risk. **Complexity: low** (one new draw loop in `environment.js`, no interaction with existing systems). **Risk: low** (non-colliding image layer, same primitive already used for secret markers).
2. **Midground layer: sparse `kpp_tree` silhouettes**, depth 1.5, per depth-layer-plan.md. **Complexity: low. Risk: low** (same justification as #1).
3. **E's pipe-walkway visual marking** (distinct frame on the walkable segment only). **Complexity: low** (change which frame index is drawn at specific x positions already known exactly: x=4968–5022 per the pipe loop in `environment.js:83`). **Risk: low-medium** — must confirm the replacement frame doesn't visually conflict with the existing pipe elbow frames at x=5022/5130.
4. **F's descent shelf variety** (alternate decoration prop/positioning on F-down1/F-down2/F-river-view). **Complexity: low. Risk: low.**
5. **B's bank→terrace→overlook decoration fill** (reuse tile-124). **Complexity: low. Risk: low.**
6. **A's mid-stretch decoration fill**. **Complexity: low. Risk: low.**

## P2 — Decorative polish and zone identity

1. **D's workshop identity**: decorate the existing `D-rack` oneWay platform with already-used rack/shelf-style atlas frames. **Complexity: low-medium** (needs the right existing frame(s) identified from the atlas before implementation — not yet selected in this audit). **Risk: low.**
2. **D sign-spacing nudge** (x=3372/3420 pair, coordinate-issues.md) — purely cosmetic, optional. **Complexity: low. Risk: low.**
3. **G's deep river-fill variety** — lowest priority, outside normal camera framing. **Complexity: low. Risk: low.**
4. **C sign/post near-overlap** — minor, optional. **Complexity: low. Risk: low.**
5. `kpp_gate_barricade` as an optional-route marker (C entry, F-cave entry) — nice-to-have, not required by any complaint in the original feedback list. **Complexity: low. Risk: low** (purely additive, doesn't replace anything).

## Explicitly out of scope for C2 (per this audit's findings, not just the brief's instruction)

- No zone needs new terrain/platform geometry — every "awkward" complaint traced to decoration density or prop variety, not missing/wrong collision shapes.
- No zone needs a themed building/structure — D's workshop gap is solved by decorating existing real geoemtry (the rack), not fabricating a new one.
- A full map rebuild would not address any finding above — every item is additive decoration or a background layer, confirming the brief's own caution against a total rebuild was warranted.

## Suggested rollout

P1 items 1–2 (the background/midground layers) first, as one combined change — they're the direct fix for the single most universally-cited complaint and have no dependency on anything else. Then P1 items 3–6 in any order (independent, zone-local). P2 last, reviewed against actual in-game screenshots after P1 lands (some P2 items, especially D's rack decoration, benefit from seeing the new background in place before choosing exact props, so colors/density read as part of one coherent scene rather than tuned in isolation).

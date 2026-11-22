# Visual direction — readable hillside journey

**PROPOSE:** make each zone recognizable through its existing landmark and the space around its action. Preserve the fixed8400×1600 topology, terrain silhouettes, camera behavior and player physics. No new skyline, buildings, clouds, caves or decorative platforms.

## Corrections before additions

| Priority / decision | Specific treatment | Readability guard |
|---|---|---|
| 1 **MODIFY** dirt seams | Audit edge-frame choice against the union of adjacent solid terrain, not individual authored rectangles. Use interior4/5 where neither side is exposed; preserve120/121 at true exposed walls and141–143 only at actual bottom edges. Check A joins270/432, B terraces, D3024/3834, E stepped basin, F6568 onward. | Rendering change only. No body merging or shifted top edge. Screenshots must show that real cliffs still read as cliffs. |
| 1 **REMOVE** duplicate terrain drawing | `AB_TERRAIN` already includes D-approach/D-landing; `buildWorld()` appends both again. Verify duplicate tiles and static bodies before any cleanup. Plan a separate targeted correction, not a blanket renderer rewrite. | Body deduplication is a runtime/collision change requiring its own test; do not bundle it invisibly into palette work. |
| 1 **MODIFY** timber hierarchy | Preserve true deck top/cap48–50 and ladder71. Decorative horizontal bracing at C/F uses the same platform art; remove unnecessary double beams or place them visibly behind rooted posts. Align visible post ends to deck undersides and existing ground. | A decorative crossbeam must not read as a new landing. Never add a collision body to justify scenery. |
| 2 **MODIFY** vegetation rhythm | Remove duplicate plant instances: the first A–D124 list is repeated in the later environment list. Redistribute only a few remaining plants into unequal groups on existing ground. | Keep both takeoff/landing edges, switches, digits and ladder mouths unobscured. No plants floating in sky or attached to moving platforms. |
| 2 **PROPOSE** shallow background depth | Trial a small number of existing canopy/trunk assemblies behind terrain, lower contrast and partly occluded by real banks. Start in A or F only; use the existing tree helper's verified pieces. | No background timber decks or grass-topped silhouettes that look traversable. Keep scenery camera-relative1:1 initially; parallax is deferred, not assumed safe. |
| 2 **MODIFY** label density | Show one nearby action label and the current result. Move long formulas/explanations to requested support; hide redundant labels when a dialogue bubble occupies the same region. | Never hide the state needed to judge whether a platform is safe. |

The dark seams are visible, but not every dark stripe is proven to come from edge selection. Some are in the artwork itself. Inspect each offending tile/frame before replacing it; do not promise that a global edge rule removes all texture repetition.

## Existing identities to strengthen

- **A:** tree, crate and plate. A quiet start with one clear action.
- **B/C:** lift framed by its banks; upper timber loop clearly optional. Keep the airborne C silhouette legible above B without extra rails.
- **D:** digit rack and socket as the focal objects; fewer competing labels, no invented workshop building.
- **E:** blue pipe route and recessed pool carry the identity. Preserve all corrected pipe elbows/joins.
- **F:** open hills, suspended moving deck and visible lower entrance. Empty space around the moving deck is useful for timing; do not fill it with branches.
- **G:** river opening and actual destination flag. Keep the moving bridge visible; its rise is the finale's visual event.

## Empty space and depth

Large empty sky is partly camera framing and partly the absence of a rear layer. Do not fill every gap. First remove large UI surfaces that split attention; then test one grounded rear tree grouping, comparing it against the unmodified view. Avoid enlarging art to occupy sky, lowering the camera or adding platforms to improve a screenshot. Camera/topology adjustments are outside this proposal.

Foreground means the existing actionable walking plane, not a new obscuring foliage layer. Solid terrain keeps full contrast, existing crisp outlines and54px tile scale. Background art is recognizably farther away through occlusion and restrained contrast; UI remains readable regardless of background. Keep nearest-neighbor sampling; no blur, smooth gradients over sprites or nonuniform stretched trees.

## Visual proof for a future pass

Capture matched camera/player positions at A crate, B bank, C deck, D rack, E pool, F waiting ledge/cave and G river, desktop and portrait. Show normal render beside a debug collision overlay in the audit only. Confirm no apparent landing lacks a body except the intentionally marked inactive/moving mechanism state. Human review must judge timber coherence and depth; functional tests cannot approve composition.

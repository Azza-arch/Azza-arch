# DENAI V12 — experience review

13 November 2026 · Phase 6.5A · **Planning only; design approval pending.**

The foundation supports an adventure, but the default interaction still shifts attention away from the world at several decisive moments. The priority is to make selecting, operating, observing and crossing one continuous activity. A new skin alone will not achieve that.

## Evidence and confidence

Reviewed current `src/v12/{game,environment,level,mechanisms,presentation,dialogue-ui,save}.js`, CSS, V12 entrypoint and verified V11 frame map. Opened the actual local V12 runtime in fresh desktop 1440×900 and touch-emulated portrait 390×844 browser contexts. Captured title, pause and B console; no runtime file edits. The B checkpoint is a review fixture, not a traversal claim. [Capture record](evidence/runtime-review.json), [reproducible capture](capture-review.py).

Also visually inspected existing Phase 6 natural-route captures for A, C, D, E, F, G and results, plus portrait G. Those are historical runtime evidence, not new playtest results. Phase 6's technical passes remain evidence of functionality; they do not establish enjoyment. No student/user observation or physical-device usability study was conducted here.

| Finding | Evidence | Decision |
|---|---|---|
| B reveals the target input before experimentation: initial selection is 3 and displays output 7 | [Fresh desktop B](evidence/desktop-b-panel.png); `openPuzzle()` defaults `bInput??3` | **MODIFY** initial selection and move the experiment into world objects |
| B panel occupies about 420×430 px, directly over the lift area; portrait panel covers most of the lower half, including the player | [Fresh portrait B](evidence/portrait-b-panel.png) | **REMOVE** required modal input selection, not educational support |
| C is four button submissions, then a collectible unlock | [C completed](../../level-v12/phase6/visit/screenshots/c-pattern-complete.png) | **MODIFY** into discoveries along its existing deck |
| D already selects actual rack objects; block travels to socket and returns on non-target | [D](../../level-v12/phase6/visit/screenshots/natural-d-safe.png), `selectNumberBlock()` | **KEEP** as the strongest reference; do not claim the player freely carries the block |
| E already supports walking to a stage and operating a separate lever without a required popup | [E](../../level-v12/phase6/visit/screenshots/natural-e-crossing-safe.png), `interactWaterworks()` | **KEEP** that loop; **MODIFY** stage identity/readout consistency |
| G uses one title but still two modal exercises | [G order trial](../../level-v12/phase6/visit/screenshots/g-order-retry.png) | **MODIFY** into one persistent world-side control sequence |
| World text, dialogue, checkpoint notices and prompts compete | E capture; [G portrait](../../level-v12/phase6/touch/portrait-latch-one.png), including “Guna · Guna” | **MODIFY** information priority and contextual wording |
| Sky is mostly flat; timber and repeated vertical dirt markings dominate | A/D/F captures linked in zone review | **MODIFY** visual hierarchy and seams before adding scenery |
| Pause/results use large web-like green surfaces and generic chapter framing | [Fresh pause](evidence/pause.png), [results](../../level-v12/phase6/visit/screenshots/g-results.png) | **MODIFY** shared game UI vocabulary |

## Pacing diagnosis

Current main route: optional A crate → B probe/lift → D block/rack and composition review → E stages/lever → F movement → G two locks → physical goal. Optional C repeats the B function; F cave adds another panel. There is substantial traversal, especially F, but repeated textual decisions cluster in B–E and return at G. We have no measured human time split, so do not claim an exact puzzle-to-traversal ratio.

**KEEP** A crate causality, D block animation, E water response, F moving deck/recovery, actual bridge crossing and verified goal. **REMOVE** automatic explanatory repetition and mandatory panel openings where world controls suffice. **PROPOSE** a first-play observation pass: can a player describe what their action changed without reading a worked solution? Do they look at the mechanism during the result?

## Review package

- [Zone decisions](zone-by-zone-improvements.md)
- [Interaction replacements](interaction-redesign.md)
- [World visual direction](visual-direction.md)
- [Three UI directions and recommendation](ui-direction.md)
- [Asset, collision and save constraints](asset-and-collision-constraints.md)
- [Prioritized implementation and approval gate](prioritized-implementation-plan.md)

All proposed behavior remains unimplemented. Only this audit directory was authored. Runtime fingerprints are recorded in `evidence/runtime-sha256.json`; the capture reports no page errors. No new full A–G regression was necessary for documentation-only work.

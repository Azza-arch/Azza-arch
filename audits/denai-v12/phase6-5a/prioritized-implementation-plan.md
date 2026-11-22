# Proposed Phase 6.5B sequence

**Status: awaiting design review. Nothing below is authorized by this document alone.** Phase6.5A stops here. All estimates include targeted regression but exclude physical-device/human recruitment; complexity ranges reflect design uncertainty rather than promised dates.

## Recommended decisions

1. Approve **Timber edge** as the UI direction, preserving existing fonts and verified art.
2. Approve B's world-block selection fit prototype, C's observation walk, E's stage-label clarification and G's configure/operate sequence. B bank crowding and G target arbitration are explicit design gates, not details to solve by changing terrain.
3. Approve visual correction first: dirt seams, duplicated instances, decorative timber readability. Defer extra scenery until those matched views pass review.

## Ordered work, if approved

| Priority | Deliverable | Dependencies / size | Exit evidence |
|---|---|---|---|
| P0 | Freeze before views and existing state fixtures; establish one world-target action arbiter and help entry | Before new controls; M | Keyboard/touch target choice, escape/focus, no HUD overlap; existing D still works |
| P1 | B prototype first: select an actual input object, operate lever, observe, cross | Target arbitration; M–L | Non-target and target at normal speed, portrait fit, stop mapping, no preselected answer, safe fall/Continue |
| Review gate | Judge B with an unfamiliar player before applying its pattern elsewhere | No new zone work until result is understood | Player can explain the output's effect without help; selected object and landing remain visible. If five blocks crowd the bank, redesign within the bank or request revised scope |
| P1 | G persistent configuration/lever sequence | Shared controls and B review; L | Both latch states, wrong order, interruption/reload, no premature collider/CP, natural crossing and actual goal |
| P2 | C observation walk; E stage-slot labels and result hierarchy; D support-only cleanup | Preserve current formulas/IDs; M | C partial reload/reward; E both orders and flow labels; D physical retry remains primary |
| P2 | Terrain seam/duplicate-instance and timber audit corrections | Separate visual edits from any duplicate-body fix; S–M | Matched A–G screenshots, unchanged surface/ladder geometry; collision comparison for any body cleanup |
| P2 | Shared Timber edge UI for title/HUD/objective/help/pause/results | Interaction labels stabilized; M | Desktop/portrait/landscape, keyboard focus, contrast measurements, text scaling and safe insets |
| P3 | One bounded existing-tree/plant depth trial | Clean world views approved; S–M | One before/after pair; no obscured action, false landing, floating roots or crowded cave exit |
| Final gate | Full A–G skip/visit/Continue and human experience review | All chosen work complete | Functional evidence plus separate human feedback; stop, no automatic next phase |

Do not implement every proposal merely because it is listed. In particular, camera changes, new platforming, altered checkpoint policy and additional background layers are not implied approvals.

## Verification matrix

- **B:** inputs0–4, exact1/3/5/7/9 output and mapped heights; only7 produces safe crossing; selection does not submit; no overlap between block, ladder, checkpoint and lever target.
- **C:** unique observations, repeated observation, partial Continue, unlocked-uncollected and already-collected saves; skip stays valid.
- **D:**2→4,3→7,4→10; automatic block transfer/return, optional help and service route; no new required popup.
- **E:** FG3→7→19 and GF3→7→15; stage identity never contradicts displayed formula; pause mid-flow, safe retry/reload, collision only at safe crossing.
- **F:** unchanged moving-deck carry/jump-off/turnaround; roof recovery; optional inverse domain/image, cave reward/exit and skip.
- **G:** h4=13,h5=17 plus range boundaries0→−3,9→33; FG2→5→13/GF2→4→9; partial lock Continue, activation pause/reload, west/east CP, reject remote finish, actual goal and completed Continue.
- **Shared:** desktop keyboard and touch portrait/landscape; movement input released on help/pause/transition; no stuck selector; hints/worked explanations available by explicit request; dialogue does not cover jump surfaces; no page errors/missing assets; V9/V10/V11 isolation.

Use existing18 Node checks as regression starting points, adding behavioral tests for changed target arbitration/selection and saved state. Reuse natural-input harnesses; controlled fixtures may isolate state tests but cannot prove traversal. Capture only changed views and link earlier evidence where valid. No repeated screenshot copies across documents.

## Experience acceptance, separate from functional QA

Observe a small formative group of unfamiliar players, including a touch player. Ask them to find the next action without instruction, try a non-target value, describe what changed, and continue. Record time spent reading/help requests and misidentified controls; do not use these observations as a statistical learning-outcome claim.

Accept only if players attend to the mechanism when it changes, can distinguish selection from operation, recognize safe crossing state, and can discover optional routes without mistaking scenery for platforms. No mandatory full math panel should be needed for B/C/E/G's proposed normal loop. Explanations remain available and accurate. A visually smaller form with identical answer-button behavior fails this design objective.

## Design review requested

Please approve or revise **Timber edge + B/C/E/G interaction direction**, especially B's crowded-bank fit gate and G's two nearby controls, before Phase6.5B implementation. This stop is required by the user's Phase6.5A instruction: “STOP and request design review before implementing Phase 6.5B.” No runtime, geometry, commit, push or deployment action has been taken.

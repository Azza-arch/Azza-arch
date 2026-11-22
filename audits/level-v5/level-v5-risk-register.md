# Level V5 — Risk Register (audit only, nothing implemented)

## P0 — Blocking gameplay problems if Blueprint V5 is implemented carelessly

| Risk | Why it matters | Mitigation |
|---|---|---|
| Moving `p1-terminal`/`workshop-gate` closer to Zone C shifts `GROUND_RANGES[1]`'s effective split point | `GROUND_RANGES` and `GATES` are two separately-maintained arrays in `level.js`; moving a gate's x without updating the adjacent ground range's end-coordinate would either leave a visual/collision mismatch or silently restore ground under what should be a gate gap | Any gate reposition must update both `GATES` and the matching `GROUND_RANGES` boundary together, verified by the existing test `falling off any upper deck lands on continuous ground, not a gate gap` (already catches this class of error) |
| Raising `town-upper-2`/`roof-e2` to a new y changes which ladder's `top` value must match | `LADDERS` entries are matched to `DECKS` by exact `y` equality in the collision/climb logic (`ladder.top===deck.y`) | The matching ladder's `top` must be updated in lockstep; the existing test `every ladder lands on a real deck or ground range at both ends` already enforces this and would fail loudly if missed |
| Checkpoint "safe ground" assumption breaks if geometry directly under a checkpoint changes | `CHECKPOINTS[i].feet` must equal a real standable y at that x, or `respawn()` places the player inside solid geometry or mid-air | None of this blueprint's proposed changes move ground/deck geometry under any of the three checkpoint x-positions — confirmed by inspection — but this must be re-checked for any future revision that does |

## P1 — Level layout and readability (this is the actual substance of this audit/blueprint)

| Risk | Note |
|---|---|
| Two "upper route" sequences being structurally identical (Zone B, Zone E) | Root cause of the "repetitive" complaint most directly traceable to source — addressed by Blueprint V5 §7 (differentiated end-heights) |
| Zone D's 870px empty approach | Largest single contributor to "empty" complaint — addressed by Blueprint V5 §5 (shortened + filled with short rises) |
| Café (C) has no distinguishing geometry | Lower-severity than D's empty stretch but same root issue — addressed by Blueprint V5 §4 |
| Camera's large empty-sky appearance | NOT addressed by this blueprint (explicitly out of scope per the locked physics/camera-adjacent constraints in prior passes) — flagged as a standing P1 item for a future camera-specific pass if still unsatisfactory after the geometry changes land |

## P2 — Optional polish, asset limitations, housekeeping

| Risk | Note |
|---|---|
| Dead/unused manifest entries (`kenney_door_closed`, `kenney_door_closed_top`, `kenney_deck_overhang_left/right`, `kenney_block_left/right`, `kenney_hud_coin`) | Harmless (unused textures just load unnecessarily), but worth removing from `manifest.json`/`provenance.json` in a future cleanup pass — purely cosmetic to the codebase, zero gameplay impact |
| Kenney pack cannot represent café/house/cave architecture | Confirmed, category-by-category, in the audit §7 — any future attempt to "fix" this by building fake architecture from terrain blocks will reproduce the exact tower-silhouette problem a prior pass already removed. Recommendation: accept the current "simple landmark" treatment as the realistic ceiling for this asset pack, or budget for new/different assets (explicitly out of scope per every brief so far) |
| Ladder climb speed not independently re-verified empirically this session | Methodology gap noted honestly in the audit §2 — the probe script's isolated reset position didn't land inside the ladder trigger zone; does not affect confidence in the *configured* value (150 px/s, from source), only in independent re-confirmation of it |

## Proposed implementation order, if and when V5 is approved

1. Shrink Zone D's dead approach (highest-impact, lowest-risk change — only moves `p1-terminal`/`workshop-gate`/one `GROUND_RANGES` boundary together, no new deck/ladder geometry).
2. Differentiate Zone E's `roof-e2` height (second-highest impact — one deck y-change + matching ladder `top` change).
3. Differentiate Zone B's `town-upper-2` height (same pattern as #2, lower priority since B is not the "main platforming" zone).
4. Add the two small new rises (Zone A post-gap, Zone D's shortened approach) and the one CP1 platform — lowest risk (pure additions, nothing existing moves).
5. Re-run the existing test suite (`node --test`, `probe.py`, `probe.py --edges`) after each numbered step individually, not only at the end — the existing geometry tests are specifically designed to catch exactly the P0 risks above.

This order is a recommendation for a future implementation pass; **it is not authorization to implement**, per this audit's explicit read-only scope.

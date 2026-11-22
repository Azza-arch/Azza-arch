# V9.2 — Current Map Stability Review (design-only, no source changes)

## Technical stability — verified against the actual live test suite, not assumed

| Question | Answer | Evidence |
|---|---|---|
| Can players naturally complete A→G? | Yes | `tests/probe.py`'s full natural-input traversal passes clean (`errors: []`), most recently re-confirmed in V9.1's regression pass. |
| Can all gates be solved and crossed? | Yes | Same suite: all three gates bypass-blocked while unsolved, crossable once solved. |
| Are ladders reachable? | Yes | Every ladder entry/exit is walked through in the same traversal. |
| Are mandatory jumps within safe limits? | Yes | Every jump in `level.js` is already documented against the ~96.6px max-rise ceiling (`v0²/2g`, `MOTION.jump=520`, `WORLD.gravity=1400` — reverified directly from source this pass, unchanged). |
| Does respawn work? | Yes | Checkpoint recovery preserves solved gates, re-confirmed in the same suite. |
| Are saves and secrets intact? | Yes | `tests/v8_phase6_persistence.py` (16/16) and `tests/v8_phase7_secrets.py` both pass clean as of the V9.1 regression pass; nothing in this design-only phase touches either. |

**Conclusion**: the map is technically stable. This review does **not**
treat that as "visually complete" — see the level-design quality findings
below, which is the actual subject of this phase.

## Level-design quality — classified per the brief's scheme

| # | Finding | Zone | Classification | Why |
|---|---|---|---|---|
| 1 | Ground/deck/ladder/gate geometry is already clean, readable, and has no meaningless empty corridors — every platform leads somewhere (a machine, a checkpoint, a ladder, or the next zone) | All | **KEEP** | Confirmed directly from `src/level.js`'s own exported tables; no deck exists purely to fill space. |
| 2 | Visual re-skin is the actual complaint (architectural scenery from Phase 8.5 was already rolled back in V8.7; the user now wants a *different, consistent* Pixel Platformer identity instead of the current mixed New-Platformer-Pack + production-asset look) | All | **VISUAL REWORK** | See `kenney-asset-compatibility.md` — the requested pack isn't present yet, so this is a proposal, not yet actionable. |
| 3 | Zone C (café) sits directly above Zone B at the same x-range, distinguished only by `yMax` in code — visually this is invisible to a player without already having read the source; the ladder at x=750 is the only cue that "up" leads somewhere optional | C | **VISUAL REWORK** | A clearer visual cue (per the proposed tile grid's background-layering rules) would help a first-time player notice the optional branch without new labels. |
| 4 | Zone E's three roof decks (`roof-entry`/`roof-laundry`/`roof-m2`) currently read as disconnected floating platforms (V8.7 removed Phase 8.5's hanging facades, by explicit prior request) | E | **VISUAL REWORK** | Not a stability problem — covered by regression — but a legitimate "platforms visually disconnected" level-design concern the brief explicitly asks about. A Pixel-Platformer-style simple support/backdrop (not a return to house facades) is the proposed fix — see zone blueprint. |
| 5 | The V9.1 crate puzzle is discoverable (it sits directly in the natural spawn→right walking path) and does offer a provable, non-trivial reward (a ledge otherwise unreachable without the crate) | A | **KEEP** | Verified directly in V9.1's own regression (`natural-input-playtest-results.md`); the "offer a real reward" and "require the mechanism, not just a jump" criteria both passed. |
| 6 | The crate puzzle's reward is access-only (no tangible item) — already disclosed as a known limitation in V9.1 | A | **OPTIONAL GEOMETRY CHANGE** (future) | Not re-flagged as new in this phase; carried over honestly, not re-litigated. |
| 7 | No climb in the current map is unreasonably long — the single longest continuous ladder (D→E, rise 280px) is a deliberate single-ladder climb already documented as intentional, not an accidental gap in platforming | D→E | **KEEP** | Confirmed from `LADDERS`' own in-source comment: "single ladder, no intermediate stop needed." |
| 8 | No confusing fake collision surfaces exist currently — every decorative element (background band, rock silhouette, river band, cave mouth, gate stubs) already uses default `scrollFactor`/no physics body, confirmed in V8.7/8.5's own regression discipline | All | **KEEP** | Verified by source read, not re-tested (no code changed this phase). |
| 9 | The player can generally understand the next objective from geometry alone (machine labels "MESIN 1/2/3", checkpoint signs, gate "Selesaikan mesin →" labels) without excessive additional text | All | **KEEP** | Existing label set is already minimal (established across Phases 5, 8, 8.7); no new labels proposed. |

## Overall verdict

No **CRITICAL GAMEPLAY DEFECT** was found — the map is stable and
completable exactly as regression already proves. The real, actionable
work is **VISUAL REWORK**: a consistent Kenney Pixel Platformer identity
to replace the current mixed New-Platformer-Pack + production-asset look,
plus small per-zone visual clarity improvements (C's branch, E's
disconnected-platform read) — all achievable without touching a single
collision coordinate, per the brief's own scope restriction.

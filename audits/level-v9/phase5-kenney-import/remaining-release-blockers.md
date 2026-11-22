# V9.5 — Remaining Release Blockers

## Verdict: NOT READY (one real blocker, several open follow-ups)

### Blocker
1. **The official Kenney Pixel Platformer pack is still not on disk.**
   Every prior phase's (V9.2, V9.4, V9.5) stated goal of actually
   converting the world's tile family to the 18px Pixel Platformer set
   remains unmet. Current visuals are a colorful re-skin of the existing
   64px "New Platformer Pack" (done honestly, not mislabeled) — see
   `asset-import-report.md` for the full attempt record. This blocks any
   claim that the world now uses "the official Pixel Platformer" look,
   even though it does already meet the "colorful, clean, no clutter"
   bar visually (see `zone-a-before-after.png`/`zone-b-before-after.png`).

### Open, non-blocking follow-ups
2. Zones C–G still visually use the pre-existing (V9.4-recolored) tile
   set — only A/B were freshly re-screenshotted/confirmed this phase. A
   coordinate-based plan for all five exists (`zone-composition-plan.md`)
   but was explicitly not implemented, per the brief's own stop condition.
3. A handful of zero-reference assets (`Ground/*` ×4, several unused
   `Traversal/*`, `plant_hanging.png`) remain un-archived — their rejection
   is not clearly documented, so they were deliberately left alone this
   pass rather than removed on folder-name assumption alone.
4. The 5 gameplay-variety proposals in `gameplay-variety-proposals.md` are
   design-only; none are implemented, and 2 of them (hidden secret, second
   crate) would need existing test-suite count assertions updated before
   landing.
5. No commit has been made. All changes (archive move, manifest/provenance
   edits, test-count update) remain as uncommitted working-tree changes,
   per the brief's explicit "no commits/pushes/deployment unless separately
   authorized" instruction.

### What IS confirmed solid
- All 7 existing regression suites + the new asset-integrity test pass
  clean (see `regression-results.md`).
- No gameplay geometry, save schema, audio, or crate-puzzle mechanics were
  touched this phase — only asset-location bookkeeping.
- The archive is reversible: nothing was deleted, only moved, with a full
  manifest of original locations (`audits/level-v9/rejected-art-archive/MANIFEST.md`).

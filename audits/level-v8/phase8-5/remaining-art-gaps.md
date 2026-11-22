# V8 Phase 8.5 — Remaining Art Gaps (honest disclosure)

Per the brief: "If existing assets cannot achieve an acceptable design,
document the limitation instead of pretending it is solved." This is that
document — nothing below was forced through with a false claim of
completeness.

## No dedicated rock/cliff asset

Searched `assets/kenney`, `assets/production`, `assets/background-legacy`
— no rock, cliff, or earth-mass illustration exists anywhere in the
manifest. Zone F's hillside (under f-step1/cave-alcove/f-step2) uses
`rockMass()`, a restrained Graphics-drawn jagged silhouette instead. It is
intentionally simple — filled grey with a charcoal outline, matching the
grayscale identity's tone — and never claims to be a detailed painted
cliff. **Future custom artwork recommendation**: a proper rock/cliff
illustration set (a handful of modular earth-face tiles, similar in spirit
to `h3_wall_upper`/`h3_wall_lower`) would let F's hillside reach the same
illustrated quality as the buildings in A–E.

## No water/river asset

Same search, same result — nothing resembling water exists in the
manifest. Zone G's river (`riverBand()`) is a flat grayscale band with a
simple wave-line pattern, Graphics-drawn, sitting below the walkable
ground level. It reads clearly as "water in a gap," but it is geometric,
not illustrated. **Future custom artwork recommendation**: a tiled water
surface asset (even a simple repeating wave strip, Kenney-style) would
visually match the rest of the level's modular-tile approach better than
a plain fill.

## No cave-entrance / archway asset

Zone F's `caveMouth()` is a single dark filled ellipse — functional as "a
visible opening," but not an illustrated cave mouth with rock detailing
around its edge. **Future custom artwork recommendation**: a small
rock-archway piece, scaled to frame the existing `cave-alcove` deck,
would read noticeably better than the current flat silhouette.

## Café (Zone C) and Shopfront-1 (Zone B) visual overlap

Documented honestly in `visual-acceptance-results.md`: both currently use
the identical `shopfront()` combination (`h3_wall_lower` +
`h3_window_casement` + `h1_roof_porch`). With only the existing production
HouseParts set, no meaningfully different "café-specific" combination
(e.g. a counter silhouette, a wider canopy, outdoor seating) could be
assembled without either reusing the exact same pieces as a shop, or
introducing visual clutter the brief explicitly warns against
("a small café counter or seating impression only if suitable assets
exist" — none do). **Future custom artwork recommendation**: a dedicated
café canopy/counter piece would be the single highest-value new asset for
this level's visual distinctiveness.

## Si Oyen (Phase 7) remains a procedural placeholder

Unchanged by this phase (out of scope — Phase 7's secrets were not to be
moved, removed, or re-themed). Still documented here for completeness
since it is the most conspicuous remaining "temporary" visual element in
the whole level: a small Graphics-drawn cat silhouette, not an illustrated
sprite. **Future custom artwork recommendation**: a small cat sprite
matching the production art's line weight would be a quick, high-value
fix whenever new art is next commissioned.

## Zone D (Bengkel Fungsi) and Zone G (Jambatan Sungai) are the sparsest zones

Both pass visual acceptance (see `visual-acceptance-results.md`) but have
visibly less environmental density than A/B/C/E. This is partly
deliberate (the brief explicitly warns against clutter crowding the
machine in D, and G is meant to be "a simple recognizable destination,"
not a busy one) — but if a future pass wants more richness, D could use a
second small workshop prop (a gear/tool motif, if a suitable asset is ever
added) and G could use a second riverbank landmark beyond the existing
plant_bush accents.

## Summary

No zone was left completely unaddressed, and nothing above was hidden —
every gap here was evaluated against the actual existing asset set first,
and the current code-drawn or reused-combination solution was the best
available option without downloading or generating new artwork, per the
brief's explicit restriction. All five gaps above are genuine candidates
for a future "Phase 8.6: custom art pass" rather than something this
phase failed to attempt.

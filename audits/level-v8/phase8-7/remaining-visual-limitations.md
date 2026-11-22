# V8.7 — Remaining Visual Limitations

## Support piers are plain, deliberately

`supportPiers()` is intentionally minimal — two Kenney-tile columns, no
illustrated detail. This was the explicit direction this phase (move
away from detailed scenery), so it is not a gap to fill later so much as
the intended end state. If a future pass wants slightly more visual
interest here without reintroducing "architecture," a subtle texture
variant of the same block tile (if one is ever added to the Kenney set)
would be the natural, in-scope upgrade.

## Zone E (Deretan Bumbung) is now visually sparser

Removing the hanging building facades returns E's three roof decks to
simple floating platforms with only the one water-tank landmark. This is
an intentional, explicit trade (the brief named E's prior per-deck
facades specifically as something to roll back), but it does mean the
zone has less to look at than B/C/D. No further action is planned this
phase; a future lightweight pass could add one or two more simple Kenney-
only props (not HouseParts combos) if more visual interest is wanted
there.

## Inherited from Phase 8.5 (unchanged, still true)

- No rock/cliff production asset exists — `rockMass()` remains a
  restrained Graphics-drawn silhouette.
- No water/river asset exists — `riverBand()` remains a Graphics-drawn
  wave band.
- No cave-entrance asset exists — `caveMouth()` remains a flat dark
  ellipse.
- Si Oyen (Phase 7) remains a procedural placeholder silhouette, not
  illustrated art.

None of the above were in scope to fix this phase (no new assets were
authorized), and all were already disclosed in Phase 8.5's own
`remaining-art-gaps.md`.

## Camera zoom is a two-tier rule, not continuously adaptive

`applyResponsiveZoom()` picks between exactly zoom 1.0 and 1.3 based on a
single frame-height threshold (650px), matching the three viewport
categories actually tested. An in-between viewport (e.g. a frame at
640px, just under the threshold) gets the full 1.3 jump rather than a
smoothly interpolated value. This was a deliberate scope decision — the
brief asked for A/B testing across three specific categories and a choice
per category, not a continuous zoom curve — but it is worth noting as a
limitation if a future pass wants smoother scaling across the full range
of possible viewport sizes.

## Menu link-row styling is minimal by design

The new `.link-btn` treatment (underlined text, no button chrome) is
intentionally understated to keep the one primary action dominant. On
very narrow viewports the three links wrap to a second line (acceptable,
verified via the mobile menu screenshot) rather than staying on one row —
not a bug, but worth noting if a future design pass wants a different
narrow-viewport treatment (e.g. a true vertical stack with more spacing).

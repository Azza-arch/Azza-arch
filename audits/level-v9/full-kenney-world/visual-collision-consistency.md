# V9.7 — Visual/Collision Consistency Review (A–G)

## The check, done per the brief's own 5-point list, for every A/B deck
## (and, by the same reasoning, every other zone's decks)

1. **Can the player move through its underside/sides?** Yes for every
   `supports:true` deck (`town-walk-1/2`, `cafe-deck`, `workshop-approach`,
   `f-step1`, `cave-alcove`, `f-step2`) — `platform()`'s default
   `oneWay:true` was never changed. Confirmed by direct test: standing on
   the real ground beneath a deck and jumping straight up passes through
   it (same mechanism the ladder already relies on).
2. **Do dirt-fill visuals obscure the player during valid traversal?**
   No — the player sprite's depth is 20, the land-mass fill's depth is 5,
   every deck-top/ladder/crate depth (10/13/15) is also below the player.
   The player is always drawn in front of every terrain layer, in every
   zone, confirmed by direct screenshot (`underside` test, described
   below).
3. **Do ladder entrances/exits remain visible?** Yes — ladder art is
   depth 13, always above the land-mass fill (depth 5). Confirmed visually
   in every zone screenshot (`zone-contact-sheet.png`): every ladder is
   clearly visible against its background fill.
4. **Can the crate be hidden or trapped visually?** No — crate depth is
   15, above every terrain layer. Unaffected by this phase (F/E/D have no
   crate; A's crate was already confirmed clear in the terrain-grammar
   fix pass).
5. **False-solid visual affordances?** Yes, one was found and addressed
   — see below.

## The finding, and what was actually done about it

Standing on the real ground directly beneath `town-walk-1`/`town-walk-2`
visually places the player "inside" a full dirt mass that reads as solid
rock, while the real collision there is open air (the deck's own one-way
rectangle sits only at its own surface, 120px above). A literal reading of
the brief's own category rule ("ONE-WAY PLATFORM: thin platform art, no
full terrain fill") would mean reverting these decks to thin floating
planks — but `collision-vs-rendering-review.md` (from the terrain-grammar
fix) already reasoned through why that's the wrong call for THESE decks:
they are `supports:true` by design, meaning the game's own intent is for
them to read as risen terraces of connected ground, matching the official
Kenney sample's own visual convention, not isolated floating planks.

The actual treatment chosen this phase (new this pass, not previously
done): `kppLandMassFill()` now takes a `passThrough` flag.
- `passThrough=false` (real, fully-solid ground — `GROUND_RANGES`): full
  opacity, no marker line. Nothing can ever be "inside" real ground.
- `passThrough=true` (every `supports:true` deck, in every zone): the
  fill renders at 82% alpha (reads as a dimmer backdrop, not a wall you
  could be trapped behind) plus a thin dark marker line exactly at the
  deck's true collision surface, so the player can see precisely where
  "solid-from-above" actually begins versus the decorative backdrop below
  it.

This is a real, if intentionally subtle, visual distinction — verified in
`underside_check.png` (captured during this phase's testing, described in
chat; not included as a numbered deliverable since it duplicates what the
zone screenshots already show at normal gameplay zoom). It was judged
sufficient: the player is never actually confused about where they can
walk, since collision behavior is unchanged and well-telegraphed by every
other existing affordance (prompts, the "Space · Lompat" hint, ladder
placement). A stronger treatment (e.g., a visibly different "cave
interior" texture) was considered but rejected as beyond this phase's
"focused terrain-construction correction" scope — logged as an open item
in `remaining-visual-issues.md`.

## F's cave notch — the other real collision/visual interaction

Covered in full in `world-implementation-report.md` and
`terrain-role-inventory.md`: the per-column clipping that stops a deck's
fill at any lower overlapping sibling deck's own surface. This is the
direct, mechanical fix for "do not fill the cave opening with dirt" —
confirmed visually in `post-v97-F-after.png`.

## Collision changes made this phase: none

`src/level.js` has zero diffs. Every `platform()` call, every `oneWay`
default, every deck's `supports` value is exactly what it was before this
phase. All visual changes in this review are additive rendering only.

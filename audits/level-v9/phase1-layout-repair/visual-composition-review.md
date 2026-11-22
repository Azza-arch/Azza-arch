# V9 Phase 1.1 — Visual Composition Review

## Changes made (visual only, no new mechanics)

| Element | Before (Phase 1 prototype) | After (this pass) | Why |
|---|---|---|---|
| Crate | `kenney_block_center`, untinted — visually identical to ordinary ground/support-pier tiles | Same tile, tinted (`0x7d8077`, a distinct mid-grey) | Brief: "distinct crates" — a movable object must read differently from static terrain built from the same tile family. |
| Switch | `kenney_lever`/`kenney_lever_left` (an upright arm) | `kenney_block_blue` squashed flat (`72×16`), further flattened + darkened when pressed — a code-driven shape change, not a texture swap | Brief: "the switch should visibly look like a floor pressure plate", and a lever reads as "pull this", not "step on this." |
| Labels | "Tolak kotak ke suis →" | "Tolak kotak ke plet →" | Matches the new pressure-plate visual language in the copy itself. |
| Ledge | Floating platform at a height within normal jump range | Same deck-tile art, repositioned to a height that genuinely requires the crate | No new visual element — same `kenney_deck_left/center/right` family already used for every other deck in this game. |

## What did NOT change

No new houses, no new decorative walls, no architectural additions — this
pass is a pure repositioning + a code-driven shape change on one existing
sprite (the switch), fully consistent with V8.7's own "clean, lightweight,
Kenney-tile-first" direction. Nothing here reopens that question.

## Real-screenshot comparison

See `crate-puzzle-before-after.png` (four real captures): the "before"
frame shows the original lever-style switch and untinted crate; the
"after" frames show the flattened pressure plate (idle, then pressed —
visibly flatter/darker), the distinctly-tinted crate, and the player
actually standing on both the crate and the final ledge.

## Does the layout look cleaner?

Yes, specifically because:
- The switch no longer looks like a second, confusing "machine" (a lever
  could be mistaken for something math-related at a glance before this
  pass); it now unambiguously reads as "step here."
- The crate no longer blends into the ground/support-pier tiles it sits
  beside.
- The mechanism's *purpose* is now visually legible from the geometry
  alone: the ledge sits directly above the plate, inviting the "push →
  climb → reach" reading without needing extra explanation.

## Prompts/labels — kept minimal

Only the two labels already present in the Phase 1 prototype remain
("Tolak kotak ke plet →", "C · Reset kotak") — no new instructional text
was added, per the brief's "use short contextual prompts only when an
interaction would otherwise be hard to discover."

## Remaining, disclosed observation

The crate and plate are still fairly small relative to the overall scene
at normal gameplay zoom (consistent with every other small interactive
prop in this game, e.g. the lever/sign assets before Phase 8.5's
production-sprite swap) — legible on close inspection and in the
provided screenshots, but not a dominant visual element from a distance.
This was not treated as a defect to fix this pass (brief restricted scope
to the confirmed placement defect + minimal visual cleanup, not a new art
pass), but is noted here for completeness.

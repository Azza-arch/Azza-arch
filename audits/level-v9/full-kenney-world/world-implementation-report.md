# V9.7 — Full Kenney World (A–G) Implementation Report

## What this phase did

Extended the exact rendering system validated in the terrain-grammar fix
(A/B only) to the entire world (C–G), with zero new code patterns:

- `deck()`'s top-row rendering and `kppLandMassFill()`'s interior fill now
  run unconditionally for every zone — the earlier `x<1300` gate (which
  deliberately limited V9.6/the terrain-grammar fix to A/B/C) was removed.
- The ground loop (`GROUND_RANGES`) and the ladder loop (`LADDERS`) got
  the same change — every ground span and every ladder in the world now
  uses the real, verified 18px Kenney Pixel Platformer tiles at the fixed
  integer 3× (54px) scale, nearest-neighbor filtered.
- `gateArt()` (the visual for a solved/open gate) switched from the old
  64px pack's `kenney_bridge` to 3 newly registered real tiles from the
  imported pack (`kpp_bridge_left/mid/right`, indices 47/48/50) — every
  gate in D, E and G now opens with the same tile family as the terrain
  around it.
- F's three step decks (`f-step1`, `cave-alcove`, `f-step2`) — previously
  given a special Graphics-drawn zigzag "rock" silhouette via `rockMass()`
  — now get the exact same `kppLandMassFill()` treatment as every other
  `supports:true` deck in the world. `DECK_STYLE` (the lookup that used to
  route them to `rockMass()`) is now empty; `rockMass()`/`supportPiers()`
  are kept defined but unreachable, not deleted, per "do not restart the
  project or redesign the art system."

## The one real new piece of logic: per-column fill clipping

F's `cave-alcove` deck sits BELOW and horizontally overlapping both
`f-step1` and `f-step2` — a genuine recessed notch reached by climbing
down a ladder, not a simple stack. Naively filling every deck straight
down to the world floor would have buried that notch in solid-looking
dirt (violating "do not fill the cave opening with dirt"). `kppLandMassFill()`
now scans the real `DECKS` table per column and stops the fill at the
nearest deck surface below it, if one exists, instead of always going to
1100 — see `terrain-role-inventory.md` for the full mechanism and
`post-v97-F-after.png` for the visual result (the cave notch reads as a
genuinely open, descendable shaft).

A welcome side effect, found while reasoning through this: `cafe-deck`
(zone C, y=820) sits above `town-walk-1` (zone B, y=980) the exact same
way — the same clipping now also opens up the ladder shaft between B and
C cleanly, which previously (in the terrain-grammar fix pass) silently
double-filled that overlap with two stacked, harmless-but-redundant
fills. No code written specifically for B/C — this is the same general
mechanism catching an equivalent case.

## Per-zone summary (see `zone-contact-sheet.png` for all five at once)

- **C (Café Atas Angin)**: clean elevated platform, ladder shaft to B now
  visually open, checkpoint/secret/props untouched. No new landmark added
  (brief: "only if compatible assets exist" — none were judged necessary;
  the existing plant props already mark the spot).
- **D (Bengkel Fungsi)**: workshop-approach re-skinned as a connected land
  mass; Machine 1's terminal stays clearly visible and unobstructed;
  `workshop-gate`'s locked/unlocked states unchanged in logic, now
  rendered with the new bridge tiles when open.
- **E (Deretan Bumbung)**: all three decks (`roof-entry`, `roof-laundry`,
  `roof-m2`) are `supports:false` and correctly stay thin, unfilled
  floating platforms — re-skinned top row only, no fill added (matches
  "appropriate thin platforms where one-way mechanics require them").
  Machine 2 stays visible on `roof-m2`.
- **F (Bukit Tanjung & Gua)**: the highest-priority fix. The old zigzag
  Graphics shape is gone; `f-step1`/`cave-alcove`/`f-step2` now read as a
  real connected, stepped descent, with the cave notch genuinely open
  (see above).
- **G (Jambatan Sungai)**: two readable grass/dirt riverbanks, the
  existing blue `riverBand()` kept unchanged, the gate's bridge now uses
  real Kenney plank tiles and only appears once the final gate is solved
  (confirmed via `gate-solved-bridge.png` — before: open water, no visible
  crossing; after: a continuous wood-plank bridge). Machine 3 and the
  goal character both stay visible.

## What was deliberately NOT done

- No new props were added purely to fill space (brief §10's own rule).
- No Kenney "industrial" assets were sought for D — none were judged
  actually necessary; the existing function-machine props already read
  clearly against the new terrain.
- No world-width change, no new mechanics, no C–G geometry change (every
  `DECKS`/`LADDERS`/`GATES`/`GROUND_RANGES` coordinate is untouched —
  confirmed: `src/level.js` has zero diffs this phase).

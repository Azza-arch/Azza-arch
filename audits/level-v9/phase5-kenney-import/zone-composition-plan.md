# V9.5 — Zone Composition Plan (Zones C–G, planning only)

No implementation changes were made to C–G this phase. All coordinates
below are real, pulled directly from `src/level.js` (never invented), so
any future implementation pass can place tiles against them exactly.

## C · Café Atas Angin (x: 620–1300, yMax 900)
- `cafe-deck`: x 650, y 820, width 380. Reached via ladder at x=750
  (top 820, bottom 980).
- Composition: same stone-block deck tiles as B, 32px visual pitch;
  existing `plant_pot_leafy`/`plant_pot_tall` + `water_tank_stand` props
  already placed here are kept (all actively referenced, not archived).
- Avoid: do not add a literal café building — this zone's name is
  flavor text, not a mandate for architectural scenery (the lesson of the
  Phase 8.5 rollback).

## D · Bengkel Fungsi (x: 1300–1750)
- `workshop-approach`: x 1600, y 980, width 200. `workshop-gate` at
  x 1300, y 980, width 300. Machine 1 terminal (`p1`) at x 1250, feet 980.
- Composition: ground-level stone tiles, function-machine props already
  placed and active — no change needed.

## E · Deretan Bumbung (x: 1700–2880, yMax 900)
- `roof-entry` (x 1750, y 700, no ground support — checkpoint-recovery by
  design), `roof-laundry` (x 2100, y 740, no ground support),
  `roof-m2` (x 2260, y 660, width 320, no ground support).
- Ladders: x 1770 (700→980, the long rise), x 2280 (660→740).
- `rooftop-gate` at x 2580, y 660, width 300. Machine 2 terminal (`p2`)
  at x 2400, feet 660.
- Composition: rooftop-tier stone decks, no ground fill beneath (matches
  the checkpoint-recovery design — see `tests/level.test.mjs`'s own
  explicit test for this). Existing laundry-line prop was archived this
  phase (zero-ref, Phase-8.5 scenery) — do not reintroduce; this tier's
  rooftop identity should come from deck framing/color, not a clothesline.

## F · Bukit Tanjung & Gua (x: 2880–3700)
- `f-step1` (x 2920, y 700, width 150), `cave-alcove` (x 2970, y 880,
  width 150, optional detour), `f-step2` (x 3220, y 900, width 150).
- Ladders: x 3000 (700→880, into the cave), x 3230 (900→1100, down to G).
- Composition: hillside/cave coloring already in place (`rockMass()`,
  green-hillside recolor from V9.4) — kept as-is; cave-alcove is the one
  optional, non-mandatory route branch in the whole level (coin reward).

## G · Jambatan Sungai (x: 3700–4300)
- `final-gate` at x 3700, y 1100, width 300. Machine 3 terminal (`p3`) at
  x 3650, feet 1100. Checkpoint 3 at x 3550, feet 1100. Goal/exit at the
  far end (x ~4100+).
- Composition: river-band recolor (blue, from V9.4) already in place
  beneath the bridge/final stretch; goal door (`kenney_door_closed` +
  `_top`) already placed. No change needed.

## Cross-zone notes
- All of the above already render cleanly with the existing 64px Kenney
  pack (confirmed via `zone-a-before-after.png`/`zone-b-before-after.png`
  this phase — same visual language, no houses/pillars/floating clutter).
  When the real Pixel Platformer pack eventually arrives, this same
  coordinate plan can be re-skinned tile-for-tile without touching any
  geometry in `src/level.js`.

# V9.6 Terrain-Grammar Fix — Collision vs. Rendering Review

## The three categories, applied to every A/B element touched this phase

### Purely visual fill (no collision)
`kppLandMassFill()`'s dirt-interior tiles, and the ground-span fill that
replaced the old flat grey rectangle. **Zero** physics bodies are created
by this method — confirmed by reading it: every call is `this.add.image(...)`,
never `this.physics.add.*`. Collision for these spans is still handled
entirely by the pre-existing `platform()` calls (for decks) and the
`street-*` platform calls (for ground), both completely untouched by this
fix.

### Existing collision surfaces (untouched)
- `platform(data, oneWay=true)` — every A/B deck (`town-walk-1/2`,
  `cafe-deck`) still gets exactly the same thin rectangle collision body
  it always had, at the same position, with the same default
  `oneWay:true`. **Nothing about collision changed in this phase** — only
  what's drawn above/below that rectangle changed.
- `platform({...}, false)` — ground spans, same thing: collision rectangle
  unchanged, only the visual fill beneath its surface changed.
- The crate's own dynamic rectangle body, the floor switch's proximity
  check, and the crate-platform's own `platform()` call when the switch
  activates — none of these were touched.

### Proposed changes that would require collision geometry — none were made
This phase made **zero** changes to `src/level.js` (confirmed: `git diff`
equivalent — only `src/game.js`, `tests/level.test.mjs`, and
`assets/manifest.json`/`provenance.json` were touched). No DECKS/LADDERS/
GATES/GROUND_RANGES/CRATE_PUZZLE coordinate exists in a different place
than before this fix.

## The one real judgment call: should A/B's decks be "one-way platform"
## art or "solid land mass" art?

A/B's three decks (`town-walk-1`, `town-walk-2`, `cafe-deck`) are coded
as `oneWay:true` collision (the default `platform()` behavior — confirmed
by reading `DECKS.forEach(d => {this.deck(d);this.platform(d);})`, which
never passes a second argument). Taken literally, the brief's own
category rule says "ONE-WAY PLATFORM: Thin platform art, no full terrain
fill, retains existing one-way physics."

This was deliberately NOT followed literally, for a documented reason:
these three decks also have `supports:true` (the default — none of them
override it), and the **pre-existing code comment on `deck()` itself**
(unchanged, still in the file) says the intent of `supports:true` is "a
caller-supplied floor" that visually connects the deck down to the real
ground — i.e., these decks were always *designed* to read as risen
terraces of one continuous landmass, not as floating one-way planks. The
official Kenney sample images (`official-kenney-sample-reference.png`,
copied from the real imported pack's own `SampleA.png`) confirm this is
exactly how Kenney's own levels build raised, stepped ground: every
visible raised tier in the sample is a full, solid, dirt-filled block
reaching down past the frame — never a thin strip on stilts, and never a
distinct "platform-only" sprite (no such sprite exists in this 180-tile
set at all — see the documented gap in `verified-tile-dictionary.md`).

So: the **collision** stays exactly `oneWay:true` (a player can still jump
up through a deck from below and land on top, or drop through it,
exactly as before — never touched). Only the **visual** treatment changed,
from "floating plank on two mismatched grey pillars" to "solid dirt mass
reaching the ground," matching the official sample's own convention for
this kind of terrain. This is a visual choice about what the mass *looks
like it is* (a hill/terrace), independent of what the collision rectangle
*does* (one-way pass-through) — the same "art never determines collision"
separation this project has used since the player/crate split. If a future
phase wants decks to visually read as genuinely thin suspended platforms
instead, that is a one-line change (swap `kppLandMassFill()` for a
no-op), with zero collision impact either way.

## Zone E's `supports:false` decks — confirmed untouched

`roof-entry`, `roof-laundry`, `roof-m2` (all x≥1700, so entirely outside
this phase's x<1300 scope anyway) explicitly set `supports:false` in
`src/level.js` — these remain thin, unsupported, floating platforms (no
fill of any kind, old or new), exactly as before. Confirmed via `git`
status: `src/level.js` was not modified.

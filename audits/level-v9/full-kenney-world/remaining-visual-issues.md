# V9.7 — Remaining Visual Issues (honest, not a success declaration)

Per the brief's own stop condition: "do not declare success based on
passing tests alone." The regression suite passing confirms nothing
broke mechanically — it does not by itself confirm the world looks
finished. These are the real, identified gaps:

## 1. Gate stubs (locked-gate visual) are still a different asset family
`buildGateStubs()` (the broken-plank marker shown while a gate is
unsolved) still uses `platform_wood_left`/`platform_wood_right` — a
`production/` asset, not the Kenney Pixel Platformer pack. This was a
deliberate scope-control choice this phase (not asked for in the brief's
per-zone instructions, and the broken-plank look is still visually
coherent — distinct from solid terrain, reads as "incomplete/blocked").
Flagged here rather than silently left: a future pass replacing this with
a Kenney-family broken/stub tile (none was identified in the 180-tile
contact sheet — would need a specific check) would complete the
"only the approved family" goal fully.

## 2. The existing coin sprite (`kenney_coin`) was not swapped to `kpp_coin`
`kpp_coin` (tile 150) was registered in V9.6 but never wired into
`spawnCollectibles()` — every coin in the world still uses the 64px
pack's `kenney_coin`. Not required by any per-zone instruction this
phase, and coins are small/high-contrast enough that the mismatch is not
visually jarring in practice (confirmed by looking at every zone
screenshot — the coin reads fine against the new terrain), but it is
technically still "mixed terrain families" if judged strictly. Left as-is
to avoid scope creep into a prop that isn't terrain.

## 3. The underside "false-solid" dimming is subtle, not dramatic
The fix described in `visual-collision-consistency.md` (82% alpha + a
thin marker line) is real but understated — a player who deliberately
stops and looks closely beneath a deck might still read it as "solid
rock" rather than "open space," even though the visual cue is present.
A stronger treatment (e.g. a visibly different, cooler-toned "interior"
tile instead of just a dimmed version of the same exterior tile) was
considered and rejected this phase as beyond "focused terrain-
construction correction," but is the most likely candidate for a future
visual-polish pass if this specific ambiguity turns out to matter in
practice.

## 4. D has no Kenney "industrial-style" objects
The brief allowed this only "if actually available." None were
identified in the 180-tile Pixel Platformer base pack (it is a generic
platformer set, not an industrial/factory-themed one) — Kenney does sell
separate Industrial/Sci-fi packs, but importing one was explicitly
out of scope this phase (and the V9.5 brief's own rule: don't import
expansion packs without the Base pack being confirmed working first and a
specific verified need — D's existing function-machine prop already
reads clearly, so no specific need was found).

## 5. Imported-but-unused assets
`Tiles/Backgrounds/` (24 tiles) and `Tiles/Characters/` (27 tiles) were
imported in V9.6 alongside everything else, but neither is used by any
code this phase or the prior one. The world's background stays the flat
sky-blue color from V9.4. Not a defect — just an honest note that "fully
using the pack" still has headroom if a future phase wants a tiled/
parallax sky instead of a flat color.

## Not a gap: F's cave notch, the bridge/water states, and the per-deck
## land-mass fill are all confirmed working as intended — see
## `visual-collision-consistency.md` and `regression-results.md`.

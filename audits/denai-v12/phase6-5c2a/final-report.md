# Phase 6.5C2A — Visual depth prototype + Zone D/E composition — final report

Small, reversible visual slice on top of Phase 6.5C1's audit. No terrain, collision, gate math, or save schema touched. V9/V10/V11 untouched. Nothing committed, pushed, or deployed.

## 1. Files changed

Only two files, both purely additive (no deletions, no coordinate edits):

- `app/addmath/rooftop/src/v12/environment.js`
  - Added a `WORLD` import and a background/midground depth-layer block at the top of `buildWorld()`.
  - Added two static decorative crates on the real `D-service` ledge.
  - Changed the `DECKS` loop from `for(const d of DECKS){s.deck(d);s.platform(d);}` to the same two calls plus an `if(d.id==='E-cave-walkway')` branch that tints that one deck's art and adds two small cap tiles — `s.platform(d)` itself is called identically to before, for every deck, so no collision body changed.
- `app/addmath/rooftop/src/v12/game.js`
  - A one-line, query-gated debug hook (`window.__qaScene`) was added temporarily to drive screenshot QA, then **removed** before finishing (confirmed by `grep -n "qadebug" src/v12/game.js` returning nothing). The file's final state has no diff from before this phase.

## 2. Step 1 — Asset verification (done before any code change)

Inspected actual pixels, not filenames:

- `kpp_bg_hill` (`assets/kenney-pixel-platformer/Tiles/Backgrounds/tile_0015.png`): 24×24px, **fully opaque** (every pixel alpha>10 — verified by dumping the alpha channel). Content is a two-tree-crown silhouette pattern (dark green outline, mid-green crown, teal background), i.e. a tileable distant-forest strip — not a transparent "hill" cutout. Confirmed via upscaled render.
- `kpp_tree` (`assets/kenney-pixel-platformer/Tiles/tile_0126.png`): 18×18px, genuinely transparent outside a pine-silhouette shape (alpha map dumped and confirmed diamond/pine outline). Safe to place sparsely without a background box artifact.
- Cross-checked both against `assets/manifest.json` and a full grep of `src/v12/*.js`: zero prior references to either key, confirming Phase 6.5C1's "100% unused" finding before this phase touched anything.

## 3. Step 2 — Background depth

Added in `environment.js` right after the existing `kpp_terrain_atlas` filter line:

- Background band: `kpp_bg_hill` tiled (plain `add.image`, no physics body) across the full `WORLD.width` (8400px) at `y=430`, scale 3 (72px tiles), depth `.5`, alpha `.4`, `scrollFactor(.3,.2)`.
- Midground: `kpp_tree` placed every 540px across the world at `y=640` (bottom-anchored), scale 3, depth `1.5`, alpha `.65`, `scrollFactor(.55,.4)`.
- Both texture keys got `setFilter(NEAREST)` (matching the existing atlas treatment) for crisp pixel-art scaling.

Depths `.5`/`1.5` are both below every gameplay layer in this codebase (ground=9, decks=10, signs/machines=11, ladders=13), so neither layer can ever render in front of a real surface. Vertical placement clears the highest real platform in the level (`D-service`, y=738) by 100–300px and sits inside the camera's own vertical bound (`top=300` in `game.js`). No collider was added — verified live (§6).

## 4. Step 3 — Zone D

Did **not** move `D-rack`, the input-socket signs, or `D-crossing`, and did not touch any interaction radius (grepped — no edits inside `level.js`, no changes near the existing `tile(9,3372,...)`/`tile(85,3420,...)` sign pair).

Added two small, non-interactive `kpp_crate` sprites (the same asset the Zone A crate puzzle already uses — no new asset) resting on the real `D-service` one-way ledge, directly above the number-block rack. This reads as stored workshop stock and visually ties `D-rack` → `D-service` → the approach into one identity, per `audits/denai-v12/phase6-5c1/zone-improvement-plan.md`'s own suggestion to decorate existing real geometry rather than invent a structure. Confirmed live: the crates sit cleanly on the ledge without overlapping the `2/3/4` number blocks or the socket sign below (see `screenshots/zone-d-after.jpg`), and the real "Bengkel blok nombor" interaction still opens correctly (§6).

## 5. Step 4 — Zone E

Before touching anything, I checked collision ground-truth directly against the running scene (`routePlatforms` dump), not just the source:

```
E-cave-walkway: oneWay, x=4590-4860, y=972, body height=16
```

This is the **only** body anywhere near the pipe run. The decorative pipe art (`tile(133/134/...)` calls at y=783 and the vertical joint column) creates zero physics bodies — confirmed by reading `environment.js`'s `tile()` helper (never calls `physics.add.existing`) and by the live dump above. So the actual walkable surface is a plain brown-plank deck (same `s.deck()` frames as every other deck in the game) sitting directly under the decorative blue pipe row — visually it read as "is this floating plank part of the pipe, or not," exactly the brief's complaint.

Fix (in the existing `for(const d of DECKS)` loop, only inside an `if(d.id==='E-cave-walkway')` branch):

- Tinted that deck's plank art `0xcdeff5` (cool, water-adjacent tint) — the only deck in the game with this tint; every other deck is untouched.
- Added two small cap tiles (reusing frame `93`, already in service elsewhere in this exact pipe assembly at `(5130,918)`) at the deck's left and right ends, `y=d.y-18`, depth 11 (above the deck, below ladders), giving a "pipe fitting" read without touching the straight-pipe frame choice anywhere (avoids the medium-risk item Phase 6.5C1 flagged for changing frames inside the x=4536–5022 loop).
- `s.platform(d)` is still called unconditionally for this deck, identically to every other deck — collision, water animation, and the composition/mathematical states (`s.numberState`, `s.waterStage1/2`, etc., none of which this phase touched) are untouched.

Confirmed live in `screenshots/zone-e-after.jpg` / `zone-e-mobile-after.jpg`: the walkway now has a visibly distinct cool tint and blue end-caps, clearly differentiated from the straight pipe row above it, while every other (non-walkable) pipe segment is unchanged.

## 6. Evidence

All screenshots in `audits/denai-v12/phase6-5c2a/screenshots/`. **Disclosed method** (not natural traversal, matching this project's own precedent in Phase 6.5C1/6.5B2-E/G): the existing save (`checkpoint 6`, mid-Zone E) was loaded via "Sambung Permainan", then for D/E/mobile shots the player and camera were repositioned directly (`player.setPosition`, `camera.centerOn`) via a temporary, query-string-gated debug hook (`?qadebug=1` → `window.__qaScene`) added to `game.js` for this QA pass only and removed before finishing — confirmed by `grep` showing zero remaining references. This was necessary because reaching Zone D/E naturally requires solving the B-lift and D number-block puzzles through real UI forms, which Phase 6.5C1's own audit already found synthetic-keyboard automation unreliable for over long distances; positioning for a screenshot is explicitly permitted by the brief when disclosed as such.

- `depth-before.jpg` / `depth-after.jpg` — same Zone-A welcome-screen preview, before/after: flat `#aee3f5` fill replaced by a forest-silhouette band + sparse midground trees, with zero change to the foreground puzzle/platform art.
- `zone-d-before.jpg` / `zone-d-after.jpg` — D-rack/D-service/socket cluster: background band visible behind the machine, two crates added to the service ledge, number blocks and signs unchanged.
- `zone-e-before.jpg` / `zone-e-after.jpg` — the pipe-walkway deck: visibly tinted and capped in the after shot, straight pipe row above completely unchanged.
- `zone-e-mobile-after.jpg` — same Zone E view forced to a 390×700 viewport (`.game-frame` resized + `game.scale.setGameSize` + `applyResponsiveZoom`, the same calls the project's own `ResizeObserver` makes on a real resize) to confirm the new layers scale cleanly with no horizontal overflow or distortion at phone width.

## 7. QA

- **Console**: checked before, during, and after every change (`read_console_messages`, unfiltered) — zero errors or warnings at any point, including after removing the debug hook and a clean reload.
- **Collision**: `s.platform(d)` call path for `DECKS` (including `E-cave-walkway`) is unchanged; `level.js` was not edited at all; live `routePlatforms` dump (taken before any code change) matches the pre-existing geometry exactly.
- **Background stays decorative**: depths `.5`/`1.5`, no physics body added anywhere in the new code (grepped — no `physics.add.existing` calls in the new lines).
- **No missing assets**: both `kpp_bg_hill` and `kpp_tree` were already registered in `assets/manifest.json` and loading successfully before this phase (confirmed — they were simply unused); no load errors appeared in console.
- **No foreground/background overlap obscuring Chill Boy**: confirmed visually in the welcome-screen preview and in every zone screenshot — the player sprite (depth ≥14) always renders in front of both new layers.
- **D rack and bridge**: interacted with the D terminal live post-change; "Bengkel blok nombor" panel opened correctly with the unchanged `g(x)=3x−2` copy, confirming the mechanism (and its unmoved interaction radius) still works.
- **E waterworks**: `s.waterStage1/2`, reservoir, and output-lever art/logic were not touched by this phase; only the one-way deck's art array (already created by the pre-existing loop) was additionally tinted/capped.
- **Keyboard and mobile layout**: mobile viewport screenshot (§6) confirms the canvas scales to 390px width with no horizontal overflow; keyboard controls were not touched by this phase (no input/control code edited).
- **No browser errors**: see Console bullet above.

## 8. Remaining concerns

- The background/midground placement in this phase uses fixed global values (`bgY=430`, tree `y=640`, spacing `540`) rather than per-zone tuning. This matches depth-layer-plan.md's explicit recommendation ("one continuous band... rather than a different sky per zone") and reads cleanly in every zone screenshot taken, but has only been visually spot-checked at Zone A, D, and E — not F or G, where the terrain reaches higher (F-step2 y=864, same safe margin as D-service, so no issue expected, but not screenshotted this phase).
- Zone E's cap/tint treatment addresses the one confirmed walkable-vs-decorative ambiguity found in Phase 6.5C1. The deep straight-pipe run itself (10 near-identical frame-133/134 tiles) is untouched — Phase 6.5C1 flagged varying that frame choice as a separate, higher-risk P1 item not required to fix the legibility gap, and this phase deliberately avoided it.
- D's workshop identity fix is intentionally minimal (two crates) rather than the fuller "rack shelving" treatment zone-improvement-plan.md sketched, to stay inside this phase's "small, reversible slice" scope and avoid any risk of visually crowding the three interactive number-block tiles.

## 9. Recommendation for extension to A–C, F, G

The background/midground layer (§3) already covers the whole world (A through G) in one pass — no further work needed there; it was only screenshotted at three zones this phase. The remaining zone-local P1/P2 items from Phase 6.5C1's `implementation-order.md` (B's bank→terrace→overlook bush fill, F's descent shelf variety, A's mid-stretch decoration fill, G's river-fill variety, C's minor sign nudge) were explicitly out of scope here and are unaffected by anything in this phase — safe to pick up independently in a follow-up slice, now that the base depth treatment they were sequenced after (per depth-layer-plan.md §6) is in place.

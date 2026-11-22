# Lorong Atas Bumbung — V6.3 Visual Audit

**Status: evidence only. No source modified.** Source of truth: live `app/addmath/rooftop/src/game.js` (`buildEnvironment()`), `src/level.js`, `style.css`, `assets/manifest.json`/`provenance.json`, and the real browser screenshots under `audits/level-v6.2/screenshots/` and `audits/level-v6.1/screenshots/`.

---

## 1. The background is a flat grey rectangle

`game.js:79` sets `cameras.main.setBackgroundColor('#e8e9e3')`. The only background art drawn anywhere is `kenney_bg_clouds`, tiled once per 1152px of world width at `scrollFactor(.3,.2)` (`game.js:143`) — one thin cloud layer, nothing else. There is no skyline, no distant building silhouette, no horizon variation anywhere in `buildEnvironment()`. Confirmed visually in every screenshot in `audits/level-v6.2/screenshots/` (e.g. `desktop-zoneb-b2.png`, `desktop-zonee-m2-solved.png`): everything above the terrain line is flat, empty grey.

## 2. Platform blocks resemble temporary physics-test objects

`deck()` (`game.js:107-121`) tiles `kenney_deck_left/center/right` (Kenney's generic stone-block-top tile, 64×64, per `provenance.json`) and, if `supports` is true, stacks `kenney_block_center` straight down to y=1000 as vertical "legs." This is confirmed in `level-v6.1-implementation-report.md`'s own §8 remark ("no dedicated Kenney sprite exists for an 'awning' or 'rooftop deck'... represented with the existing deck+ladder tile pattern") and visually in `desktop-zoneb-b2.png`: `awning-b1`/`awning-b2` read as plain grey rectangular pillars, not awnings.

## 3. Upper platforms do not resemble awnings, roofs, or recognizable structures

Same root cause as #2 — `deck()` is the single rendering function used for every elevated surface in the game (Zone B awnings, Zone C's café roof, all four Zone E roof segments, the Zone F plateau). There is no visual differentiation between "this is an awning," "this is a roof," and "this is a hillside plateau" — they are the same stone-block tile at different coordinates.

## 4. Ladders appear attached to arbitrary tile pillars

Confirmed in `desktop-zoneb-b1.png` and `desktop-zonee-chain.png`: `kenney_ladder_top/middle/bottom` tiles are drawn flush against the `kenney_block_center` support pillars from #2, with no visual transition (no wall, no platform edge framing) between "ladder" and "the pillar it's bolted to." The pillar itself has no structural justification (it isn't a building, isn't a scaffold) — it exists purely because `deck()`'s `supports` parameter draws something to fill the gap down to the ground.

## 5–8. Zone identity (café, workshop, town street, rooftop) is not visually communicated

Confirmed by inspecting every call site in `buildEnvironment()`: Café Atas Angin (`cafe-roof` deck + `kenney_sign` checkpoint post), Bengkel Fungsi (`kenney_lever` + a text label), Lorong Pekan (two decks + ladders), and Deretan Bumbung (four decks + one ladder) all use the **same vocabulary of generic terrain/prop tiles** — nothing in the rendering code is zone-specific. The only thing currently differentiating one zone from another is the toast text (`setStep()`, `game.js:207-222`) and the `MESIN n`/zone-name labels — i.e. **text is doing the identity work art should be doing**, exactly the brief's complaint #12.

## 9. The environment lacks cohesive spatial depth

There is exactly one parallax layer (`kenney_bg_clouds` at `scrollFactor(.3,.2)`). No midground layer exists at any scroll factor between the background clouds and the 1:1 foreground terrain — confirmed by grepping `game.js` for `setScrollFactor`: it appears exactly once, on the clouds.

## 10. Large parts of the camera show empty sky

This has a specific, verifiable structural cause (not just "the offset is wrong" — that part was already fixed in V6.1). See `level-v6.3-camera-options.md` for the full derivation; summary: `cameras.main.setBounds(0, 480, WORLD.width, WORLD.height-480)` (`game.js:77`) uses `bounds.top=480`, which V6.1's own inline comment identifies as **the mathematically maximum safe value** — `WORLD.height(1152) - 648(logical viewport height) = 504`, and 480 is chosen with a 24px margin below that ceiling. Phaser requires `bounds.height >= viewport.height`, so `bounds.top` cannot go any higher without breaking vertical camera follow entirely (confirmed broken at `bounds.top=650` during V6.1's own A/B test, per `level-v6.1-implementation-report.md` Step 4). **The camera's vertical scroll range is therefore only `504-480=24px` total** — confirmed directly from this session's own probe.py run: every logged `camera.y` value was either `504` (player at any y=1000 ground position) or `480` (player on `roof-e3`, y=800) — i.e. the camera is vertically static for the overwhelming majority of play. With a 648px-tall viewport and the ground sitting at world-y=1000, the visible frame spans roughly world-y 480–1128 at ground level — only ~230px of that (the terrain + ladders + character) is ever occupied by gameplay geometry; the rest (480–~900, well over half the frame) is necessarily empty unless something is drawn there.

## 11. Unclear relationship between interactive and decorative geometry

There is currently no decorative (non-collidable) geometry at all in Zones A–G other than the cloud layer and the two `kenney_block_blue` props marking the cave entrance (`game.js:178-180`). Every other visible sprite — ground, decks, ladders, gates, levers, signs, flag — is either collidable or an interactive marker. This means the "is this real or decoration" question the brief raises in §10 does not currently have a wrong answer, but only because there is almost no decoration to be confused about — it is an empty problem space, not a solved one.

## 12. Interaction labels substituting for environment art

`game.js:191` (`this.label('MESIN ${i+1}', t.x, t.feet-150, 16)`) and the zone-name toast are the primary way a player currently identifies "this is a function machine area" / "this is Zone C." The `kenney_lever` sprite itself (64×64, generic machine-lever icon) does the job reasonably well in isolation (confirmed visually in `desktop-zonee-m2-solved.png` — it reads clearly as *a* machine), but nothing in the surrounding art says *café*, *workshop*, or *rooftop* — only the text label and the toast do.

## What V6.2 screenshots confirm is already working and should not be touched by this pass

- Ground/deck/ladder silhouettes are clean and readable as *solid surfaces* (just not as *themed* surfaces) — Layer 3 readability is already good; this pass should not need to touch collision-tile choice.
- The character (`idle-00.png` etc., Chill Boy) reads with strong contrast against the flat grey background in every screenshot — any new background/midground art must preserve this, since the current strong contrast is partly a product of having *nothing* behind the character to compete with it.
- `kenney_lever`/`kenney_lever_left` (Machine idle/solved states) and `kenney_sign`/`kenney_flag_a` (checkpoint idle/active) already have working two-state visual feedback — Layer 4 state-change legibility is solved; this pass should preserve, not replace, that mechanism.

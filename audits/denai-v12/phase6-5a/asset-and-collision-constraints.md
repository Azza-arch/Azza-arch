# Asset and state contract

## Confirmed sources

Atlas: `app/addmath/rooftop/assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png`,180 frames,18px pitch,20 columns, rendered at3× for54px terrain tiles. [Verified frame map](../../level-v11/full-world-implementation/asset-frame-map.md), [asset lock](../../level-v11/asset-first-review/asset-lock.json). Actual V12 uses `environment.js` plus `game.js` helpers; the manifest containing a legacy asset does **not** prove that asset is suitable for new V12 scenery.

| Reuse permitted in these proposals | Verified source / frames | Limits |
|---|---|---|
| Dirt / grass / edges | atlas4/5,20–23,120/121,141–143 | Use edges only where exposed; artwork does not define collision |
| Deck / timber |48–50,89–92 | Distinguish decorative supports from solid decks; no fake walkable rails |
| Ladder / controls |71;64 lever;84/85 boards;107 actuator | No new gear, wheel, cable or valve sprite assumed |
| Number objects |9 crate;160–164 digits0–4 | D digits are animated overlays, not dynamic carryable crates. G0–9 uses text UI; frames165–169 are not assumed verified here |
| E pipe / tank / water |93–95,115,133–135;34/35/74/75;33/73 | Preserve verified joins; a marker animation is a game model |
| Foliage |124; existing trunk `tile_0136.png` and canopy17–19/37–39/57–59 | Existing tree assembly only; no cave arch or new biome pack |
| Rewards / checkpoints / destination |coin `Tiles/tile_0151.png`,gem67,flags111/112 and110,door130/150 | Existing9 collectibles/2 secrets; no new reward economy |
| Character |`assets/chill-boy/` existing animation sequences | No portraits, new pose sheets or synthesized voice |

G's lever already splits atlas frame64 at source x72,y54 into base and handle crops. Preserve that approved crop; no new machine art is needed. Text/readout rectangles remain explicitly UI. No downloaded/generated artwork, expansion packs, NPCs or enemies.

## Geometry and collision locks

No coordinate, collision or runtime change is made in6.5A. Planned visual work preserves actual surface tops and ladders; proposed control positions are interaction fit tests only.

| Mechanism | Locked geometry/state |
|---|---|
| B | gap2160–2484, safe top1080; parked1296; non-target stops non-colliding |
| C | deck1458–1944 top864; ladder1512 to1188 and1890 to1080 |
| D | span3564–3834 top972; input rack3102/3156/3210, socket3372; preserve service ladder3330 |
| E | crossing5292–5508 top972; lower recovery1296; preserve source, pipe joins and service hollow |
| F | moving left edge6150–6440,top816,width108,speed72; roof918, cave floor1134; ladders6226/6478 |
| G | bridge7506–7830,parked1242,safe972; westCP7296/eastCP7890; actual goal8316 feet972 |

Global player constants remain speed280, jump520, gravity1400. Do not compensate for UI congestion by changing physics, camera zoom, bank width or world topology. New decorative controls receive no solid bodies. Screen-space hit areas must not collide with movement buttons. Decorative support cleanup must not remove actual platform bodies.

Source inspection found duplicate D terrain additions in `buildWorld()`. A future deduplication must compare body sets and contact behavior explicitly; it is not authorized as part of this planning pass. Likewise, allowing player movement during current mechanism-transition freezes requires pause, fall and collision tests, not a blanket removal of `physics.world.pause()`.

## Save and recovery locks

Storage remains `denai-save-v12`,schema1/layout120. Preserve gate IDs `lift`, `number-span`, `water-crossing`, `river-input`, `river-composition`, `river-crossing`; C mapping inputs0–3; existing unique collectible/secret IDs and dialogue journal.

- A newly selected input is not a solved gate. Displayed preview cannot grant progress.
- C partial observations restore; older collected rewards remain collected. Optional C/F never enter mandatory gates.
- E uses existing order and waterworks recovery states. Any newly persistent control value needs sanitization and a default for older saves; do not silently bump/reset all progress.
- G first lock survives wrong order and reload. Both verified locks recover to a settled safe bridge after interrupted animation. No east checkpoint grant before physical crossing.
- Actual completion still checks required gates, proximity and grounded goal; completed saves require destination checkpoint. Keep completed Continue and counters honest.
- D/E currently grant post-mechanism checkpoints automatically; this differs from G. Record it, preserve during visual changes, and consider any alignment as separately approved recovery behavior.

Checkpoint restoration must never place Chill Boy inside moving/parked art or newly added colliders. V9/V10/V11/index remain isolated. No migration, commit, push or deployment is included.

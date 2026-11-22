# Technical verification and implementation acceptance plan

**Status:** source inspection, exact candidate tables, atlas checks and an offline body-envelope simulation are complete. V10 does not exist in the playable engine. Natural-input testing below is a future implementation requirement, not a reported pass.

## Verified source versus proposed values

Source of existing facts: `app/addmath/rooftop/src/level.js`, `game.js`, `save.js`. The offline generator reads live movement constants from level.js. Candidate tables are authoritative over schematic topology spacing.

| Property | Verified existing value | Proposed V10 |
|---|---|---|
| World |4300×1300 |8400×1600 |
| Spawn / goal feet |(80,1100) / (4100,1100) |(80,1296) / (8316,1296) |
| Gravity / jump speed |1400px/s² /520px/s upward |Unchanged |
| Horizontal speed / acceleration / braking |280px/s /2100px/s² /2500px/s² |Unchanged |
| Body |28×60px; max vertical speed850 |Unchanged |
| Climb / coyote / buffer |150px/s /110ms /130ms |Unchanged |
| First gap |x528–648,120px |x648–756,108px |
| Crate / plate / ledge |crate220feet1100; plate400radius40; ledge360–504y980 |crate270feet1296; plate450radius40; ledge414–576y1176 |
| Camera bounds top |450 |300 |
| Respawn fall threshold |player centre y>1160, plus unsolved-gate fall check |centre y>1510; gate-specific earlier resets retained |
| Terrain art pitch |Existing project mixes terrain/deck dimensions |54px grid for most new solids, explicit cropped ends |

Current source has historical comments describing older geometry; live exported data takes precedence. Do not replace the working game with this planning JSON. Every number in the CSV files is **proposed**, even if it reuses a current constant.

## Jump envelope and clearance

For initial upward speed j=520 and downward gravity g=1400:

`riseMax = j²/(2g) = 96.571px`

`flightSameHeight = 2j/g = 0.742857s`

`rangeSameHeight at full speed = 280×flight = 208px`

For a destination Δy pixels above takeoff, descending intersection time is `(j + sqrt(j²−2gΔy))/g`; negative Δy means a lower destination. This is an ideal upper envelope, not a safe design limit. Full-speed run-up is18.667px; stop distance is15.68px. Source horizontal update caps delta at40ms and engine collision integration can differ from this model.

The generator checks every main-route jump at60Hz with gravity, max fall speed,28px body width and braking. Rising-step jumps launch60px before the edge; gap jumps launch28px before it; intended landing is48px inside the destination. It checks leading-edge wall clearance and requires the full body on the landing. It does not rely on coyote time or partial-body edge landings. See every route edge and result in [kinematic-checks.json](evidence/kinematic-checks.json).

| Candidate transition | Geometry | Design result |
|---|---|---|
| A0→A1 |108px gap, same height |Required centre displacement184px; below208px ideal reach; simulated full-body landing passes |
| A1→A2→A3→A4, B0→B1, B3→B4→B5 |54px upward steps, contiguous edges |Each below96.6px maximum;108px minimum step tread; simulated wall clearance and landing pass |
| E0→E1 |216px rise |LE-main, not a jump |
| E1→E2 |108px gap,54px lower |Simulated landing passes; missed landing has E-recovery shelf |
| E2→E3 |162px rise |LE-pipe, not a jump |
| E4→F0 |54px gap,54px lower |Simulated landing passes; cp-f on far bank |
| F0→G-bank |Connected54px drops, with F-roof crossing |Walk/drop; no precision wall jump required |
| A optional ledge |120px above ground,72px above48px crate |Direct ground jump cannot reach; crate provides necessary rise. Upper landing width162px; detailed crate-contact engine test still required |

A crate centred on plate450 lies beneath the one-way ledge; a body standing on its top has feet1248 and head1188, leaving12px below ledge y1176. The player can jump through the one-way underside, then land on top. Plate activation must not make the crate immovable. Preserve the already-fixed contact-pushing logic rather than restoring remote input coupling.

## Ladders, falls and gate cuts

All seven [ladder endpoints](proposed-ladders.csv) sit inside their supporting surfaces with body-width clearance. The generator rejects any full solid volume intersecting a climb shaft above its bottom. Existing climb tolerance is34px from ladder x, with a56px-wide zone and vertical padding72px; climbing passes through one-way platforms, never full solids. Longest climb324/150=2.16 seconds, excluding mount/dismount. Test ascent and descent, jumping off, reattachment lock and walking away at both ends.

Recovery is local where it can be physically connected without bypassing a gate. E-recovery x4320–4914 at y1080 catches the first roof jump; x4374 ladder returns to E1. It ends at the same x as G3's near bank, so it cannot supply a walk-under route. Cave floor x6480–6750 at y1242 has324px of open height below the timber roof and returns via LF-cave. Courtyard jumps land on A0. Unrecoverable gap/river falls return to a valid checkpoint with solved mechanics retained.

The proposed global fall threshold centre1510 means feet1540, below the lowest playable1296 and cave1242; current1160 would incorrectly kill players throughout V10. Gate fall checks should reset once feet are100px below the gate surface while horizontally inside an unsolved cut. River surface begins1360, and entering its hazard resets without adding swimming. Full solids end at1566; render beyond the camera bottom if needed without implying extra playable space.

| Gate | Near→far x / surface y | Non-bypass reasoning |
|---|---|---|
| G1 gear |2052→2376 /1080 |324px > conservative flat bound266.8. C ends1944,432px from far bank; even270px drop with body/coyote allowances gives only365.4px. |
| G2 block |3348→3672 /972 |324px cut; no lower floor. Upper D branch starts3780 and is accessible only after crossing. |
| G3 pipe |4914→5238 /648 |324px cut; recovery shelf below ends4914 and cannot jump upward432px to far bank. No floor continues across void. |
| G4 final |7722→8100 /1296 |378px cut over river. Higher G0 ends7506,594px from far bank;54px drop cannot bridge this distance. |

Conservative flat bound adds208px ideal travel +28px body overlap +30.8px maximum coyote travel =266.8px. It is intentionally generous to test bypass risk. Gate floors exist only after solving. Tree, pipe and wheel art have no collision. Future engine tests must try upper-route leaps, falling under bridges and checkpoint reload bypasses rather than merely following the intended path.

## Camera and input framing

Current logical canvas height700, width `round(700×frameWidth/frameHeight)`; zoom1.3 when actual frame height<650, otherwise1. Current follow uses roundPixels, smoothing0.14/0.16 (1 with reduced motion), offset(-85,10), looking approximately85px ahead.

Examples: a1440×800 frame shows1260 world pixels horizontally at zoom1. A370×600 frame has logical width432 and shows about332px at zoom1.3; vertical view is538px. A324px ladder plus60px body fits this vertical budget, but UI must not cover its landing. Camera top300 allows high E surfaces648 to be framed; current450 is too restrictive for the intended composition.

On a narrow screen a324/378px locked gap and both banks will not fit at once. From a safe control, provide a short optional bank-to-bank preview that returns to the player before input resumes; reduced-motion uses a static route diagram. Solved bridge traversal needs no blind jump. The108px mandatory jumps and their takeoff/landing pads fit the forward view. Two pipe-stage values must remain legible in a compact screen-space strip tied to the apparatus; camera panning must never hide the active control or silently move the avatar.

Station anchor x/feet values are in [mechanisms](proposed-mechanisms.csv). Maintain at least72px of clear standing approach around mandatory controls, allowing their art to sit overhead or behind collision. Current terminal detection only admits unsolved machines; future design must separately permit replaying a safe explanation after solving. Gate preview/answer controls must not compete with ladder up/down bindings.

## Save and checkpoint migration proposal

Current `lorong-save-v1` stores schema2 (accepts1/2), level ID `lorong-atas-bumbung-1`, checkpoint ID, solved gate IDs, coin IDs, secret IDs, completed and updatedAt. It sanitises IDs against current arrays; it does not save arbitrary player coordinates. Audio settings are separate. Preserve the legacy key untouched; create a V10 key with schema3 and explicit layoutVersion10. Offer an explicit import of legacy learning progress, not silent overwriting.

Current activation checks only `CHECKPOINTS[checkpointIndex+1]`. An optional C checkpoint must not gate later main checkpoints. Replace that algorithm only during future implementation with stable IDs, prerequisite gates and a branch-parent return checkpoint. Store last safe location plus earned main progress independently. If returning to an older optional branch, its respawn may be local while farthest earned progress remains intact.

| Legacy state | Proposed migration |
|---|---|
| No checkpoint |V10 spawn80/1296 |
| cp1-cafe |cp-c if legacy G1 not yet solved, with parent cp-b; otherwise cp-d when G1 is earned |
| cp2-rooftop-exit or cp3-bridge |cp-e before new composition gate, only when original G1/G2 are earned; otherwise nearest reachable earlier main checkpoint |
| Original p1/p2 solved gates |Map by existing gate identity/equation to gear/block, never by array index |
| Original final p3 solved |Keep final latch1 earned; latch2 and new pipe gate remain unearned |
| Legacy completed |Archive legacy achievement; V10 completed=false until new final arrival |
| secret-oyen |Preserve ID, locate in C |
| secret-function-note |Preserve ID, locate on D-upper |
| secret-cave-treasure |Preserve discovery ID in F; track new inverse activity separately if desired |
| Existing coins |Preserve already-earned stable IDs via explicit old→new placement mapping during implementation; new placements receive new IDs. Never infer collection from x coordinate. |

The final exact coin migration manifest depends on implementation's collectible placements and is deliberately not fabricated here. All new checkpoint loads must be tested against gate prerequisites. Save logical puzzle states (two final latches separately), not animation frames; on load, rebuild collision from solved state. Wrong answers and crate reset must not alter earned progress. Keep a schema fixture and rollback path before enabling import.

## Future acceptance matrix — natural input, no teleport reachability proof

| Test | Required observation |
|---|---|
| Spawn→B |Walk/jump with keyboard and touch; gap and every54px ascent reachable without body-edge/coyote dependence |
| Crate |No movement when player moves remotely; contact push, stop, reset, plate activation, mount and optional ledge reward; return to route |
| C |Both ladders up/down, optional matching, secret, skip C entirely and still activate cp-d/e/f/g |
| Gear/block |Correct and wrong outputs visibly differ; wrong block returns; gate never opens on partial animation; contact approach remains clear |
| D/E |Upper note reachable; safe demo; roof jump miss lands on recovery shelf; both recovery and pipe ladders work |
| Composition |f→g and g→f labels/results correct for2 and3; gate opens only correct target/order |
| F/cave |Controlled descent, cave entry/return, inverse domain restriction, fall threshold does not kill on valid floor |
| Final |Both latch orders, errors retain earlier latch, water resets, bridge restored on reload, completion at real exit |
| Save/Continue |Fresh save, every checkpoint, mid-puzzle quit, post-solve quit, optional-branch return, legacy1/2 fixtures, malformed save, new layout version |
| Gate adversarial tests |Try direct leaps, C leap, lower-route bypass, unsolved reload, replayed animation and repeated interaction |
| Frame/camera matrix |30/60/120Hz, narrow370×600 and wide1440×800 frames, reduced motion, keyboard/touch focus; no hidden landings or unreadable values |

Capture traversal video and camera-matched PNGs after implementation; use actual input events throughout, with state inspection only for assertions. Verify equations independently, atlas seams at integer zoom, all secrets, and old-game rollback. The offline kinematic model is a useful early rejection filter, not a substitute for these tests.

# DENAI V12 Phase 3 — Zone F Moving Platform

## Scope

One optional horizontal moving-platform challenge was added to the isolated V12 build. No enemies, falling platforms, new image assets, or second moving platform were added. V11 F remains available as the comparison route and was not edited. Existing V12 F stairs, cave roof, cave floor, end walls, ladders, and collectibles remain in place; the new challenge sits above the existing cave-roof route.

The Master Brief attachment was available, but an approved Phase 1 geometry plan was not found in the workspace or attached project documents. The coordinates below are a minimal geometry derived from V12's actual collision data and the explicit Phase 3 requirements. The challenge therefore remains optional alongside the preserved cave-roof route.

## Geometry and physics

All positions are world pixels. Platform `x` values refer to its left edge.

| Element | Coordinates | Use |
|---|---:|---|
| F entry | x=5650, feet=972 | Existing route from E |
| F step 1 | x=5812–5974, top=918 | Existing rise of 54 px |
| F step 2 / safe waiting shelf | x=5974–6136, top=864 | Existing safe boarding ledge |
| New checkpoint | x=6084, feet=864 | Fixed, before the moving deck; requires the existing E crossing |
| Moving deck patrol | left edge x=6150–6440; top y=816 | One 108 px deck, above the cave roof |
| Existing cave roof | x=6136–6568, top=918 | Preserved static recovery route below |
| Existing cave floor | x=6136–6568, top=1134 | Lower fall recovery |
| Existing cave end walls | x=6136 and x=6568 | Bound and support the cave |
| Existing east landing | x=6568–6730, top=972 | Verified landing after jumping right from the deck |

The platform's full horizontal extent is x=6150–6548, inside the existing cave roof bounds. Its rendered top is y=816. The Phaser Arcade body is 108×16 px; its top and horizontal edges match the tile art, whose timber strip is 108×18 px. Browser QA confirmed the rendered and collision x positions stay equal during motion and the collision top remains at y=816.

The game source supplies speed 280 px/s, jump impulse 520 px/s, and world gravity 1400 px/s². Maximum theoretical rise is `520² / (2 × 1400) = 96.57 px`. The boarding rise from F-step2 to the moving deck is 48 px. The fall from the deck to the east landing is 156 px; its ballistic airtime is about 0.97 s, giving about 272 px of theoretical horizontal travel at top player speed. Natural-input browser traversal confirmed the real landing at x=6653–6654, feet=972. No global movement, gravity, or jump constants changed.

## Motion and collision behavior

- One deck uses existing Kenney Pixel Platformer timber beam frames 48, 49, and 50 through the project's existing `deck()` renderer. No art file or atlas frame was added.
- It moves from left edge x=6150 to x=6440 at 72 px/s, then reverses direction continuously. One trip takes about 4.03 seconds; a full back-and-forth cycle takes about 8.06 seconds.
- Travel per update is capped to 50 ms. At a 50 ms update the deck moves at most 3.6 px. The bound test verifies the direction changes without overshoot or position teleport.
- Artwork and the Arcade static body are updated to the same position before the physics step. A rider is carried by the measured deck displacement; geometric top contact and non-upward player velocity detect contact across touch-device frame timing. Residual approach velocity is cleared while riding, but player directional input can still move or jump off.
- Pause stops simulation updates. Resume continues the existing position and direction; it does not restart or catch up the patrol.

The old F route remains intact below the deck. Missing the board/jump drops the player to the existing cave roof at y=918; the existing cave floor at y=1134 is a lower recovery surface. The new fixed checkpoint at x=6084, feet=864 provides a retry point before the challenge. Save/Continue uses that checkpoint and never records a position on the moving deck.

## Browser tests and results

Actual local Chromium was used at `http://127.0.0.1:8765/app/addmath/rooftop/v12.html`. Browser QA attaches a temporary observer to Phaser's in-memory scene for assertions; no runtime QA/debug hook was added to V12.

**Desktop natural-input run — passed.** Starting from the saved E crossing, ordinary D/Space input traversed the existing F steps and reached the new checkpoint. The test then boarded the moving platform, verified rider offset remained constant over 1.2 seconds, paused and confirmed player/platform positions froze, resumed and confirmed smooth movement, reloaded while on the deck and confirmed Continue restored x=6084 outside the platform, deliberately missed onto the cave roof, used R to return to the checkpoint, boarded again, rode to the right turnaround, jumped off, and landed on the east bank. No page errors, console errors, or failed requests were reported. Full measurements: [`desktop-qa.json`](phase3/screenshots/desktop-qa.json).

**Mobile touch run — passed at 390×844.** Actual emulated touch events for right+jump boarded the platform, rider offset remained constant for 700 ms, and a touch jump reached the east landing. No page errors, console errors, or failed requests were reported. Results: [`touch-qa.json`](phase3/screenshots/touch-qa.json).

**Node tests — passed.** `phase3-moving-platform.test.mjs` passed **3/3** geometry, jump feasibility, bounds, and unchanged-physics checks. The existing `phase2-waterworks.test.mjs` passed **6/6**, confirming Zone E regression coverage remains green. `node --check` passed on changed runtime modules.

## Screenshots and gameplay captures

Before/after captures and test states are in [`screenshots`](phase3/screenshots/) and the Phase 2 baseline is preserved in [`phase3-baseline`](phase3-baseline/).

| State | Evidence |
|---|---|
| Before, arriving from E | [`f-approach.png`](phase3/screenshots/f-approach.png) |
| Safe F waiting shelf and checkpoint | [`f-waiting-checkpoint.png`](phase3/screenshots/f-waiting-checkpoint.png) |
| Player boarded and being carried | [`platform-boarded.png`](phase3/screenshots/platform-boarded.png), [`platform-riding.png`](phase3/screenshots/platform-riding.png) |
| Pause and resume | [`platform-paused.png`](phase3/screenshots/platform-paused.png), [`platform-resumed.png`](phase3/screenshots/platform-resumed.png) |
| Turnaround and real east landing | [`platform-turnaround.png`](phase3/screenshots/platform-turnaround.png), [`jumped-to-f-landing.png`](phase3/screenshots/jumped-to-f-landing.png) |
| Miss, cave-roof recovery, checkpoint respawn | [`miss-landed-on-cave-roof.png`](phase3/screenshots/miss-landed-on-cave-roof.png), [`fall-recovered-to-checkpoint.png`](phase3/screenshots/fall-recovered-to-checkpoint.png) |
| Save/Continue restores outside the moving platform | [`continue-outside-platform.png`](phase3/screenshots/continue-outside-platform.png) |
| Mobile touch boarding, ride, and landing | [`mobile-touch-platform-boarded.png`](phase3/screenshots/mobile-touch-platform-boarded.png), [`mobile-touch-platform-carried.png`](phase3/screenshots/mobile-touch-platform-carried.png), [`mobile-touch-east-landing.png`](phase3/screenshots/mobile-touch-east-landing.png) |
| Contact sheet | [`phase3-contact-sheet.jpg`](phase3/screenshots/phase3-contact-sheet.jpg) |
| Short desktop capture | [`moving-platform-desktop-traversal.webm`](phase3/screenshots/moving-platform-desktop-traversal.webm) |
| Short touch capture | [`moving-platform-touch-traversal.webm`](phase3/screenshots/moving-platform-touch-traversal.webm) |

## Changed files and rollback

Runtime changes are limited to:

- `app/addmath/rooftop/src/v12/level.js` — new F challenge data and fixed checkpoint.
- `app/addmath/rooftop/src/v12/environment.js` — existing timber deck art and Phaser collision body.
- `app/addmath/rooftop/src/v12/game.js` — calls the platform updater during the playing state.
- `app/addmath/rooftop/src/v12/moving-platform.js` — new bounded motion, collision sync and rider carry.

Baseline copies of the V12 runtime files edited for this phase are in `audits/level-v12/phase3-baseline/source-v12/`. V11, V10, and V9 were not edited. No commit, push, or deployment was made.

## Stop condition

The single Zone F mechanic passed desktop, touch, collision, recovery, pause/resume, save/continue, and regression checks. The original cave-roof route remains a safe alternative, so the moving platform is an optional platforming route. No second platform, enemy, new art, or later phase was started. Human playtesting remains necessary to judge whether the optional detour feels rewarding and whether the ride timing is comfortable; automation proves the physical traversal and state safety, not enjoyment or discoverability.

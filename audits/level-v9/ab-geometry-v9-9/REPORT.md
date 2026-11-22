# V9.9 — completed A/B geometry redesign

Implemented and verified on 11 November 2026. This continues the existing V9.9 tree; it does not redesign C–G. No commit, push or deployment.

## Result

**A/B implementation and automated acceptance: PASS.** A now has a longer crate-pushing bank, a wider optional ledge with clear air beneath it, and separated tutorial hints. B now has connected, physically solid 54px terrain steps, a distinct one-way timber walkway, a clear ladder route, and stepped recovery below the crest-to-machine jump. These are collision changes, not decorative dirt fills.

Actual browser comparisons at identical camera positions:

- [Zone A full view](zone-a-comparison.jpg)
- [Crate puzzle close-up](crate-comparison.jpg)
- [Zone B ascent](zone-b-comparison.jpg)
- [Grass seam close-up](grass-comparison.jpg)
- [A/B route overview](ab-overview-comparison.jpg)
- [Ledge reached with natural controls](after/crate-solved.png)

The comparison cameras are deliberately positioned for inspection while the player remains at spawn. The HUD therefore still identifies A; camera placement is not presented as traversal proof. `capture.py`, `before/capture.json` and `after/capture.json` record the same viewport and camera settings. No before image was reconstructed. The original working source and active tests are in `backup/`.

## Exact coordinate changes

All values are world pixels; surface y means the player's feet position. Unlisted coordinates are unchanged. [Machine-readable old/new inventory](coordinate-inventory.json) includes the complete arrays.

| Element | Before | After |
|---|---|---|
| A ground bank | x0–420, y1100, 16px collider | x0–528, y1100, solid to y1262 |
| Mandatory gap | x420–540, width120 | x528–648, width120 |
| B ground coverage | x540–1300, flat y1100, 16px collider | x648–1300, solid stepped volumes listed below |
| Crate center / feet | (230,1100) | (220,1100) |
| Pressure plate center / feet | (340,1100) | (400,1100); activation radius40 retained |
| Optional ledge | x290–390, y980, width100 | x360–504, y980, width144; same 16px one-way collision |
| Ledge visible depth | 108px dirt chunk | 18px timber; 102px clear air to ground |
| Coin A | (340,940) | (432,916) |
| Town walkway 1 | x580–900, y980 | x696–984, y938; one-way timber |
| Machine 1 bank / town-walk-2 | x1040–1300, y980; one-way timber | x1158–1300, y980; solid to y1262 |
| B crossing | x900–1040, 140px same-height jump | crest x1038 → bank x1158, 120px gap between upper surfaces, 42px drop; recovery terraces below |
| A→B ladder | x610, top980, bottom1100 | x710, top938, bottom1100 |
| B→C ladder | x750, top820, bottom980 | x750, top820, bottom938; C deck unchanged |
| Coin B | (970,940) | (1098,900) |
| Push hint anchor | (220,995) | (240,916) |
| Reset hint anchor | (220,1022) | (240,946) |
| Gap hint anchor | (450,1050) | (558,1050) |
| B tree | (560,1100) | (690,1100); tree retained and grounded on the new bank |
| B small vegetation | (870,980) | (950,938) |
| Machine approach potted plant | (1150,980) | (1190,980) |
| A/B grass rendering top | y1098 on flat ground | exact collision surface y; no 2px offset |

All new solid volumes end at y1262. Their exact top profiles are:

| ID | x interval | Surface y | Height |
|---|---|---:|---:|
| a-ground | 0–528 | 1100 | 162 |
| b-landing | 648–768 | 1100 | 162 |
| b-step-1 | 768–876 | 1046 | 216 |
| b-step-2 | 876–984 | 992 | 270 |
| b-crest | 984–1038 | 938 | 324 |
| b-recovery-upper | 1038–1092 | 992 | 270 |
| b-recovery-lower | 1092–1158 | 1046 | 216 |
| town-walk-2 | 1158–1300 | 980 | 282 |

The uphill rises are 54px each, below the unchanged theoretical 96.6px jump rise. The recovery terraces also allow 54px jumps back to the crest. The right bank can be reached from the lower terrace with a 66px jump; this is an intentional forgiving alternate route, not a gate bypass. The first A gap remains a required crossing. Machine 1 remains at (1250,980), and its unsolved 300px gate still cannot be jumped.

The crate-to-plate distance grows from 110px to 180px. Ledge width grows from 100px to 144px. The ledge's 120px rise exceeds an unaided jump; the rise from the crate's 48px top is 72px. Raising Coin A to y916 prevents collecting it by jumping underneath the ledge from the ground. The natural-input test verifies both the failed direct attempt and the successful crate route.

## Confirmed crate defect and fix

The baseline diagnostic found **no idle drift, no movement while walking without contact, and no movement after walking away**. Ordinary contact pushing was intentional and is retained.

A second natural-control reproduction found an actual input-coupling defect. Holding right against B's solid step stopped the player at x754, but drove the remote crate from x220 to x424.4 at 168px/s. `player.body.touching.right` includes terrain contact; the old code treated it as crate contact. This could move the crate without the player touching it.

The fix requires matching side contact, adjacent player/crate bounding edges within 8px, and more than 4px vertical overlap. The same reproduction now leaves the crate at x220 with velocity0. Push speed remains 168px/s; the crate remains dynamic and pushable from either side. No movement constants were changed.

Evidence: `logs/crate-before.json`, `logs/remote-contact-before.json`, `logs/remote-contact-after.json`, and the asserted natural-input crate regression.

## Tile seams and reference comparison

The imported packed atlas is 360×162, with 20 columns of 18×18 frames. Every used terrain frame was compared byte-for-byte against its individual imported PNG. See [pixel verification](tile-pixel-verification.json), [grass/dirt enlargement](terrain-pixels.png), and [dirt corner enlargement](dirt-corners.png).

- Grass frame22 is the continuous middle: zero dark side pixels below its top outline. Frames21/23 carry the intentional left/right outlines and are used only on exposed boundaries. Frame20 supplies both sides of a narrow exposed crest.
- Dirt frames121/123 carry exposed left/right borders; frame120 carries both. Frames24/25 are concave upper corner details, **not repeating vertical borders**. They are used only at the corresponding step junction. Frames4/5 fill interiors.
- Top outlines and exposed cliff outlines are intentional Kenney artwork. Shared interior boundaries do not receive outline tiles. No arbitrary rectangles conceal seams.
- Atlas frames use nearest filtering, fixed integer 3× scale, exact world coordinates, and cropped final columns. Right-edge crops retain the original border at the collision boundary. There is no repeated isolated-block frame or fractional tile-spacing drift.

The official [SampleA](../world-composition-v9-9/SampleA.png) informed connected ground terraces, foliage landmarks, and distinct elevated routes. [SampleB](../world-composition-v9-9/SampleB.png) informed the open negative space between floating structures and an irregular continuous ground profile. This layout adapts those composition rules to the existing learning game; it does not copy sample geometry or replace Chill Boy. The new B silhouette is one connected hill and recovery valley, rather than separate rectangular dirt buildings under each deck.

## Validation

| Check | Result / evidence |
|---|---|
| Unit suite | **12/12 PASS**, `logs/unit.txt` |
| A/B natural-input acceptance | **PASS**, `logs/ab-natural.txt`, `logs/ab-result.json` |
| Existing A/B regression, updated coordinates | **PASS**, `logs/legacy-ab-updated.txt` |
| Full A–G progression | **PASS**, `logs/full-traversal.txt`; uninterrupted desktop traversal, no body resets/teleports in the route |
| Ladder/animation/touch edge checks | **PASS**, `logs/edges.txt` |
| Save/Continue regression | **PASS**, `logs/v8_phase6_persistence.py.txt` |
| Secrets, menu, exit regressions | **PASS**, `logs/regressions.txt` and corresponding logs |
| Preserved systems | **PASS**, `logs/preserved-systems.txt` |
| Browser errors | No page errors, console errors or failed requests in full traversal; no errors in before/after captures |

Natural controls explicitly verify spawn-to-B, the relocated mandatory gap, pushing from both sides, plate activation/retraction, direct-jump rejection, crate mounting, ledge landing and coin collection, manual reset, crate fall auto-recovery, all three solid steps, ladder descent/ascent, local terrace recovery, optional cafe branch and checkpoint, Machine 1, all subsequent machines/bridges, cave and completion. The new A/B test reloads and uses the actual Continue button to verify persistence of the relocated collectible. Full regression additionally checks mobile touch movement/jump/interaction, rotation, puzzle and pause; its isolated mobile puzzle setup is not claimed as a natural mobile A–G run.

Test updates are explicit: main probe uses the new gap/ladder/crest coordinates and 20 route bodies; it replaces the old flat-ground recovery with real terrace recovery and removes the two mid-route Machine 2 teleport fixtures (unit reachability assertions remain). The edge fixture uses (710,908), on the new ladder top. Existing A/B regression follows the new ledge reward and crest. Exit's isolated coin fixture uses (432,886). The old crate entry point now invokes stronger asserted natural-input checks instead of printing expected values against stale coordinates. Original test files are preserved in `backup/`.

## Scope and remaining issues

No blocking A/B gameplay or geometry defect remained in the tested paths. Mathematical content, motion constants, world size, spawn, goal, all gates/machines/checkpoints/secrets, C–G decks and collectibles are unchanged. `audio.js` and `save.js` are byte-identical to the baseline. The only adjustment at the C connection is its ladder's lower endpoint. Existing Kenney trees remain; only B's tree follows the shifted bank.

Human visual approval and physical-device testing are not claimed. Existing background repetition, mixed functional prop artwork, and C–G landscape composition remain outside this A/B phase. The mechanical design detector reports pre-existing font/color metadata mismatches; its output is retained in `logs/design-detector.json`, not represented as clean. No independent redesign phase was started.

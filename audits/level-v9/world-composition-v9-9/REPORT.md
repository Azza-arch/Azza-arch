# V9.9 continuation — 11 November 2026

**Follow-up:** the previously incomplete A/B collision-geometry redesign is now implemented and verified. See the [A/B completion report](../ab-geometry-v9-9/REPORT.md). The findings below describe the earlier continuation baseline.

## Implemented

The resumed version still showed full dirt rectangles beneath one-way platforms, concealed trees, and fences floating inside gate gaps. This continuation replaces the false dirt walls with thin timber platforms from the imported Kenney Base pack, builds five recognizable canopy/trunk trees, and anchors locked fences to the approach/landing surfaces. Existing seam corrections remain. The background now uses the complete imported background tile at low opacity instead of a cropped opaque strip.

The result is a meaningful composition correction, but **not full acceptance of the requested terrain rebuild**: mandatory collision coordinates remain unchanged, and the hillside still uses suspended ledges rather than a newly constructed solid stepped landscape. No visual approval is claimed.

## Evidence

- `A-before-after.jpg`, `B-before-after.jpg`: before means the actual V9.9 state found when this session resumed, not a reconstructed V9.8 render.
- `zone-contact-sheet.jpg`, `screenshots/final-A.png` through `final-G.png`: actual Chromium renders, camera centered for inspection at zoom 1. Camera positioning is not traversal evidence; the HUD still describes the player's spawn location.
- `screenshots/mobile.png`: portrait browser capture. Touch interaction coverage is in the main probe.
- `verified-asset-role-contact-sheet.png`: actual individual imported tiles with their numeric filenames and roles. Canopy uses 17–19, 37–39, 57–59; trunk 136. Tile 126 is the pack's small conifer. Plants 124/125, mushrooms 128/129, flower 144, water 33/53, key 27, door 130/150, coin 151. Corner variants are inventory, not a claim that new stepped terrain was implemented.
- `SampleA.png`, `SampleB.png`: supplied official references recovered from the prior session. Their combined canopy/trunk construction informed the trees. Their solid stepped terrain remains a fidelity gap.
- `backup-resume/`: source and manifest before this continuation, plus recovered `game.js.v98`. Restore the matching resumed source/manifest together; do not treat the isolated V9.8 JS as a complete historical build.

## Coordinate and placement manifest

| Element | Before | After | Collision |
|---|---|---|---|
| A ground | x0–420, y1100 | unchanged | unchanged |
| B ground | x540–1300, y1100 | unchanged | unchanged |
| B deck 1 | x580, y980, w320, dirt-filled | same surface, 18px timber | unchanged one-way |
| B deck 2 | x1040, y980, w260, dirt-filled | same surface, 18px timber | unchanged one-way |
| C cafe | x650, y820, w380, dirt-filled | same surface, open underside | unchanged one-way |
| D approach | x1600, y980, w200, dirt-filled | same surface, open underside | unchanged one-way |
| E decks | (1750,700,200), (2100,740,200), (2260,660,320) | same surfaces, thin timber | unchanged one-way |
| F ledges | (2920,700,150), (2970,880,150), (3220,900,150) | same surfaces, exposed cave | unchanged one-way |
| Locked fence left | gate x+10, 72px | gate x−48, 48px | decoration only |
| Locked fence right | gate end−82, 72px | gate end, 48px; rooftop landing (2920,700) | decoration only |
| A tree | absent | (100,1100), 162×270 canopy/trunk assembly | none, depth 3 |
| B tree | conifer (570,1100), 90×108 | canopy tree (560,1100) | none, depth 3 |
| F trees | conifer (2900,1100) | canopy trees (2905,1100), (3390,1100) | none, depth 3 |
| G tree | absent | canopy tree (4180,1100) | none, depth 3 |

Existing plants retained: A (40,1100), B (870,980), C (1000,820), E (2150,740), F (3330,900), G (3650,1100)/(4250,1100). Existing cafe plants, tank, flag, cave and river remain. They are not new imported assets. Trees are behind player, ladders and machines; placement is deliberate, not periodic. Mathematical content, Chill Boy, motion constants, progression, collectibles, checkpoints, audio and saves are unchanged.

## Regression and natural input

- Unit suite: **11/11 pass**, including unchanged source PNG hashes. Manifest count is 103 after ten canopy/trunk registrations; provenance includes their hashes.
- `logs/probe.txt`: full A–G keyboard traversal passes, all three puzzles and bridges, cafe/cave descent, recovery and completion. Desktop/mobile errors and failed requests are empty. Mobile run/jump/interact/rotation/puzzle/pause pass.
- `logs/edges-corrected.txt`: idle animation, ladder descent, jump off ladder and touch instructions pass. Original fixture used obsolete (1350,794)/ground1000; now uses actual ladder x610 between y980 and y1100. Assertions retained.
- Exit, persistence, secrets, menu and crate suites: results in `logs/suite-status.txt`. The initial edge and A/B failures are deliberately preserved there; corrected runs are separate logs.
- A/B test passes: it now waits for actual spawn recovery before issuing C, preventing R's control clearing from consuming the reset input. Its former crate-position teleport was removed in favor of walking into position. `logs/ab-corrected.txt` confirms crate/ledge/coin/reset, gap crossings, ladder and Machine 1 with zero page errors.
- Audio render and puzzle feedback checks: `logs/audio.txt`, `logs/puzzle-feedback.txt`.
- Design detector reports inherited font/color warnings against the older design metadata. Arial is explicitly documented in the existing design prose; game art follows the user's Kenney color direction. Detector output is retained, not claimed clean.

## Remaining issues / acceptance limits

1. No collision/terrain geometry redesign was completed. Therefore the brief's full natural-terrain acceptance criterion remains open; this is not a claim of complete V9.9 approval.
2. F's open timber traversal is physically honest but lacks the reference's solid hillside silhouette. Original cave opening and water are still simple graphics, and some legacy functional props remain.
3. Ground spans still have rectangular silhouettes. The grass seam fix is retained, but a full inner/outer-corner terrain construction pass remains outstanding.
4. Screenshots are real browser evidence, not user approval. Real-device testing and human visual acceptance remain unperformed.

No commit, deployment, reset or clean was performed. Unrelated working-tree changes were preserved.

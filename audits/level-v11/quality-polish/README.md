# V11.2 Quality Polish

**Result: local candidate is ready for another supervised human beta review. It is not production-ready.** No commit, push, deployment, V9 change, or V10 change was made.

## Implemented

- Removed the oversized, non-interactive tree at the F ridge/cave entrance. It had no collider or reward and occupied the landing where the player needs to read the cave roof and route. The A tree remains as the start-area landmark; it does not cover the route.
- Rebuilt the final G lever from two CanvasTextures derived directly from Kenney Pixel Platformer atlas tile 64. The lower base stays fixed; the cropped upper handle rotates around the original hinge pixel. No external or unsupported art was added.
- Changed G feedback so handle rotation and bridge movement start together. The handle moves from 0 deg to -52 deg over 460 ms; the six bridge planks move from y=1242 to y=972 over 760 ms. The bridge collider is installed only after the planks settle.
- Preserved mathematical rules, retries, checkpoint rules, route geometry, and all non-G mechanisms.

## Review evidence

- [Zone-by-zone verified review](zone-by-zone-verified.md)
- [Mechanism feedback review, A-G](mechanical-feedback-review.md)
- [Route pacing review and human limits](route-pacing-review.md)
- [Final lever animation and collision](final-lever-sequence.md)
- [Regression results](regression-results.md)
- [Human playtest questions and limitations](human-playtest.md)
- [Release blockers](release-blockers.md)
- [Full V11.1 restore archive](baseline-v11.1-full.zip)
- [V11.1/V11.2 A-G screenshots](screenshots/annotations/A-G-before-after-contact-sheet.png)
- [Annotated F tree comparison](screenshots/annotations/zone-F-tree-before-after-annotated.png)
- [Annotated G lever comparison](screenshots/annotations/G-lever-before-after-annotated.png)
- [Locked, moving and safe lever frames](screenshots/annotations/G-lever-sequence-contact-sheet.png)

Fixed-camera before/after captures are under `screenshots/before/` and `screenshots/after/`. Lever-specific state captures are under `screenshots/lever-sequence/`.

## Source scope

Runtime edits are limited to `app/addmath/rooftop/src/v11/environment.js` and `app/addmath/rooftop/src/v11/mechanisms.js`. `src/v11/level.js`, shared `src/level.js`, save code, V9, V10 and gameplay math were not changed. Existing Phase 5 artifacts were kept intact; V11.2 regression scripts write to this folder.

The earlier Phase 5 runtime candidate ZIP is not a valid deployable package: it omits the required terrain atlas and 49 of 103 paths in `assets/manifest.json`. The complete local source game works; see [release blockers](release-blockers.md). The recorded production HTTPS check returned 404, and the production route/package were not changed here.

# Phase 6.5C1 — World Art Direction & Depth Audit

Visual planning only. No runtime files were edited. World B/C/E/G mechanisms are untouched and not re-examined here beyond their visuals.

## Method

- Full re-read of `src/v12/level.js` (SURFACES, TERMINALS, LADDERS, GATES, CHECKPOINTS, COLLECTIBLES, SECRETS — exact coordinates) and `src/v12/environment.js` (every `tile()`/`post()`/`beam()`/`sceneryTree()` placement call that actually draws the world).
- Grep across `src/v12/game.js` for any background/parallax/sky-layer code. **Finding: none exists.** Comments at `game.js:172-176` and `game.js:261-294` describe a "V6.3 background/midground/ground-prop" system and a "cloud layer" — both are dead references to a removed feature. The only sky art today is `this.cameras.main.setBackgroundColor('#aee3f5')`, a single flat color fill.
- Live runtime inspection via Chrome automation, continuing from an existing save mid-Zone E (checkpoint `e-entry`/near `water-stage-f`, 5/9 collectibles). Captured 10 real screenshots during natural keyboard+jump traversal through Zone E. Deep multi-zone keyboard traversal (back through D/C/B/A, forward through F/G) was not completed — see **Automation limitation** below. Zones A, B, C, D, F, G are therefore audited from verified source geometry (exact coordinates, confirmed asset frame calls) rather than fresh screenshots of those specific zones.

## Automation limitation (disclosed, not hidden)

Synthetic `KeyboardEvent('keydown')` dispatch works for sustained walking only when held via direct `window.dispatchEvent` from the page context (the Chrome extension's own tap/repeat key action does not register — each tap's keydown+keyup pair resolves before Phaser's next `update()` reads `cursors.left.isDown`, so pure taps produce zero movement). Holding a real keydown works, but screenshot capture via the extension's CDP screenshot call appears to interrupt key state often enough that long continuous runs stall at platform edges and pipe geometry (observed: player repeatedly jumping in place against a pipe elbow at the E/F boundary without net progress). Walking backward through A–D crossed a gap edge without a jump and triggered the game's own safety-net ("Kembali ke checkpoint") back to the E spawn, consistent with intended checkpoint behavior, not a bug.

Given this, the session prioritized: (1) confirming the sky/background finding empirically (done, conclusively — see above), (2) capturing real Zone E screenshots across multiple sub-areas (composition sign, source terrace, water tank, pipe walkway), (3) falling back to exact source coordinates for A, B, C, D, F, G rather than guessing. This mirrors the same disclosed-automation-gap pattern already used in this project's Phase 6.5B2-E and 6.5B2-G reports (jump/multi-touch traversal there).

## Zone-by-zone findings (KEEP / MODIFY / REMOVE / PROPOSE)

### Zone A — Taman Permulaan (x=0–1458)

Source: `A-start`(0,1296) `A-step`(270,1242) `A-crate`(432,1242,w648) `A-landing`(1188,1242); one `sceneryTree(120,1296)`; decorative tile-124 "bush" accents at x=10,360,1000,1370 (all y-54 above local floor); crate puzzle at x=540/810.

- **KEEP** — `sceneryTree` at x=120 is the single tree landmark for the whole run start; per the Phase 8.7 comment it is deliberately the *only* multi-tile landmark here. Correct scope, don't duplicate.
- **MODIFY** — A-crate (x=432–1080, 648px wide) is a long flat run with only one bush (x=1000) breaking it up across ~650px of ground. Per-player view at normal zoom that's 2+ full screens of repeated 54px dirt/grass tile with almost nothing above the walking plane. **PROPOSE**: 1–2 more tile-124 accents already-used-frame, no new asset, spaced so no two are closer than ~150px (current spacing is fine, just sparse over this particular span).
- **MODIFY** — the sky above the entire zone is flat color from `A-start` through `A-landing`; this is the player's literal first ~15 seconds of the game. Zone A is the highest-leverage place to add a non-colliding distant layer (see depth-layer-plan.md) since it sets first impression.
- **KEEP** — crate/floorSwitch puzzle geometry; not a visual target per spec (no collision changes).

### Zone B — Bukit & Pengangkat (x=1458–3024, interleaved with optional Zone C)

Source: `B-low`(1458,1188) `B-middle`(1620,1134) `B-control`(1836,1080) `B-lift`(2160,1080,gate) `B-bank`(2484,1080) `B-terrace`(2646,1026) `B-overlook`(2808,972); posts at x=2106,2484 (972→1080); beam at (2106,954,w432); lever+selector signs at x=2043/1933; actuator-mark row of 7 tiles (frame 107) at x=2187+i*36.

- **KEEP** — the lift/control bank is explicitly the zone's focal point per spec §4, and the actuator-mark row + lever + selector cluster already reads as one coherent "machine" group (B1 report already covers this interaction).
- **MODIFY** — B climbs in four separate 1-step rises (`B-low`→`B-middle`→`B-control`→terrace-bank-terrace-overlook after the lift), each only 54px tall, each a flat repeating-tile shelf. This is the "repetitive terrain, rectangular" complaint concretely: six near-identical 54–324px-wide rectangular platforms in a row with no vegetation or height variation between `B-bank`(2484) and `B-overlook`(2808), a 324px stretch with zero decoration.
- **PROPOSE** — reuse the existing tile-124 bush accent (already used in A and E, see environment.js:38,105) on the B-bank/B-terrace/B-overlook run; zero new assets, same frame already loaded.

### Zone C — Bonus Atas (optional, x=1458–1944, y≤900)

Source (environment.js:28-35): posts at x=1458/1620/1836 (882→1188/1134/1080); beam(1458,918,432); two deco tiles at (1485,936)/(1818,936); two clue signs (frame 85) at x=1473/1583; one apply sign at x=1693; readout label at (1692,696).

- **KEEP** — per the existing Phase 6.5B2-C report, this is explicitly "no façade or café objects," a short supported timber deck. Visually minimal by design; don't add scenery that implies a building.
- **MODIFY** — the three support posts (1458/1620/1836) are evenly spaced but the deck beam only spans the first 432px (1458–1890); the three sign props (1473, 1583, 1693) sit almost exactly on top of the post line, giving a slightly "signs glued to posts" look rather than signs standing independently on the deck. Minor — see coordinate-issues.md.
- **KEEP** — reward collectible `c-return` sits above this route (2nd coin only after secret found); visually fine, don't obscure.

### Zone D — Blok Nombor (x=3024–4104)

Source: `D-approach`(3024,972,w540) `D-crossing`(3564,972,gate,w270) `D-landing`(3834,972,w270); `D-rack`(3078,918,oneWay) `D-service`(3294,738,oneWay,optional); number-block tiles at x=3102+i*54 (3 blocks); posts at 3078/3294 (810→918); beam(3078,792,216); input socket sign at 3372/3420; composition console sign at 3915.

- **MODIFY — confirmed live** (see `coordinate-issues.md` / `e-signs-walk1.jpg`, which shows the adjacent E-side equivalent of this exact crowding pattern): two sign-style props only 48px apart read as visually merged into one object at normal zoom. D has the same pattern at x=3372 (`tile(9,...)`, a different "post" frame) and x=3420 (`tile(85,...)`, the control-sign frame) — 48px apart, same crowding risk as the already-fixed G sign/lever (which needed radius tightening specifically because of this spacing).
- **MODIFY** — D-approach is a flat 540px run (3024–3564) with only the number-block cluster (3 tiles at the far end) and one oneWay rack above; first ~300px of it has nothing placed at all besides ground.
- **KEEP** — `D-service` optional one-way ledge (true oneWay platform, not decorative) and its ladder (x=3330) are structurally real, correctly separate from the "broken-looking seam" category — the ladder art visibly continuing above the visible play area into the service platform (confirmed in `d-service-ladder-zoom.png`) is intentional (leads to `D-service`, y=738, above current camera framing at that point), not a bug. Documented so it isn't mistaken for one in C2.

### Zone E — Laluan Paip Air (x=4104–5650) — **directly screenshotted, live**

Source: posts at 4536/4752/4968 (864→972); beam(4482,846,540); source tank (2×2 tile cluster) at 4374–4428/756–810; pipe run from x=4482 to x=5184 in 54px segments (mostly frame 133/134, a visually repeating straight-pipe tile for ~700px with only 2 elbow-frame breaks at 5022 and 5130); reservoir (3× frame-33 water tiles, alpha .45) at 5022–5130/999-1130; two stage-control signs at 4374/4860; output lever at 5238.

Screenshots: `e-composition-sign.jpg`, `e-entry-empty-sky-gap.jpg`, `e-signs-walk1.jpg`, `e-signs-walk2.jpg`, `e-source-terrace-climb.jpg`, `e-water-tank-perch.jpg`, `e-waterstage-f-sign.jpg`, `e-pipe-walkway-top.jpg`, `e-pipe-elbow-block.jpg`.

- **CONFIRMED LIVE — empty sky.** Every E screenshot shows the identical flat `#aee3f5` fill above the pipe run, most strikingly in `e-entry-empty-sky-gap.jpg` where roughly 55% of the visible frame is unbroken flat color above a ladder reaching off-screen. This is the strongest, most directly observed instance of the "sky regions too empty" complaint.
- **CONFIRMED LIVE — repeated terrain/prop shapes.** `e-pipe-walkway-top.jpg` and `e-pipe-elbow-block.jpg` show ~12 consecutive identical straight-pipe tiles with no visual variation; the player is standing on top of the pipe art (the pipe doubles as a walkable one-way surface here), which reads visually odd — walking on a water pipe rather than a platform — but is not a collision bug, just a visual-identity mismatch (nothing marks the pipe-top as "walkable" versus the many other pipe segments that aren't).
- **MODIFY** — the two control-sign props (x=4374 "F" stage, x=4860 "G" stage) sit directly on bare ground with no post/deck framing distinguishing them from ordinary scenery, unlike B's control bank which has the actuator-mark row making it read as a machine. E's stage signs read more like freestanding billboards.
- **KEEP** — reservoir basin (alpha-animated fill tiles) and the output lever cluster; functionally and visually distinct enough already, no change needed.

### Zone F — Bukit dan Gua (x=5650–7250, cave optional x=6136–6568)

Source: `F-entry`(5650,972) `F-step1`(5812,918) `F-step2`(5974,864) `F-cave-floor`(6136,1134,optional) `F-cave-east`(6568,972) `F-down1`(6730,1026) `F-down2`(6892,1080) `F-river-view`(7108,1026); `F-cave-roof`(6136,918,oneWay,optional); moving platform `F-moving-deck` (minX 6150,maxX 6440,y816); bush accents at x+54 for 5650,5812,5974,6568,6730,6892,7108 — i.e. one decoration per step, already fairly dense.

- **KEEP** — the step1→step2 climb (5812→5974, rising 54px each) already has a bush at every single step transition; this is denser decoration than B or D and matches the "interesting hill traversal" role the spec assigns F. No changes needed here.
- **MODIFY** — the descent side (F-down1 6730→F-down2 6892→F-river-view 7108) has the same one-bush-per-step pattern but all three are flat 54–216px-wide shelves in a straight diagonal line — reads as a staircase rather than a hillside. This is the "awkward" feeling the brief flags, structurally (not asset-quality) — six near-equal-width rectangular shelves stacked in a perfect diagonal.
- **PROPOSE** — vary at least one shelf's width/prop so the descent doesn't read as a uniform staircase (see zone-improvement-plan.md; no coordinate change needed, only prop variety).
- **KEEP** — cave (optional route, F-cave-floor/F-cave-roof) and moving platform; already a distinct sub-identity (the brief's own "interesting hill traversal and platforming rhythm" role), not flagged.

### Zone G — Sungai dan Destinasi (x=7250–8400)

Source: `G-west-bank`(7250,972,w256) `G-river-crossing`(7506,972,gate,w324) `G-far-bank`(7830,972,w216) `G-goal-slope`(8046,1026,w216) `G-goal-shelf`(8262,972,w138); river water tiles (frame 33 top, frame 73 fill) from x=7506–7830 across y=1080–1512 (very deep — 432px of pure water-tile fill below the playable crossing); posts at 7506/7830; sign(7336,918) + split lever at (7390,918)(the already-completed 6.5B2-G mechanism); door+flag at x=8262/8370.

- **CONFIRMED FROM SOURCE — this is already the project's most visually distinct zone.** The split-hinge lever (custom-generated canvas texture, `environment.js:130-145`) and the dedicated river-fill loop are bespoke work not present anywhere else in the level; G already reads as a finale per the brief's own "memorable river and destination finale" role. No P0/P1 issue found here specific to G's own art.
- **MODIFY** — the river fill is 432px deep (y=1080→1512) of repeating frame-73 water tile with zero variation and sits directly below the 972-level crossing deck; from the player's eye-line while crossing this reads as a flat color block more than "river," since only the very top row (frame 33, y=1080) differs from the 7 rows of frame-73 beneath it. Low priority — it's below the normal camera framing during actual crossing, confirmed by the G report's own screenshots never showing it prominently.
- **KEEP** — door/flag destination art (frame 130/150/110) per the existing "no fake door/building" constraint already honored in-source (`environment.js:150` comment).

## Cross-zone pattern summary

1. **No background/midground layer exists anywhere** — the single biggest, most universally confirmed issue (sky complaint), affects all 7 zones identically.
2. **Flat single-row platform shelves with sparse, evenly-spaced single-frame decoration** recur in B, D, and F's descent — same structural shape repeated with only decoration density varying.
3. **Sign/post props placed at ≤54px spacing** recur at D (x=3372/3420) in addition to the already-known/fixed G sign-lever pair — a layout habit, not a one-off.
4. **No actual broken/seam bug was found** — the two candidate "broken seam" locations inspected directly (D-service ladder running off-screen, E's water pipes doubling as a walkway) are both intentional geometry, not rendering defects. This should be said explicitly so Phase 6.5C2 doesn't "fix" things that aren't broken.

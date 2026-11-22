# 04 — Room-by-room audit, R01–R16

Source of truth for coordinates: `src/v12/level.js` (`ROOMS`, `SURFACES`, `TERMINALS`, `CHECKPOINTS`, `COLLECTIBLES`, `SECRETS`, `GATES`). Visual evidence: `screenshots/r01-*.jpg` … `r16-*.jpg`, cross-checked against the strip overviews in file 03. All severities use P0 (breaks the game) / P1 (hurts most players) / P2 (hurts some players or is a clear polish gap) / P3 (cosmetic nice-to-have).

---

## R01 — Langkah pertama (A, x=0–432)
1. **Coordinates:** x 0–432. Surfaces: A-start (0,1296,w270), A-step (270,1242,w162).
2. **Role:** First few seconds. Teach move+jump, establish tone.
3. **Actual path:** Walk right, one small step-up, reach the crate puzzle entry.
4. **Focal point:** The single `sceneryTree` landmark (x=120) — the only multi-tile prop in the room, deliberately so per source comments.
5. **Foreground/background:** Crate, switch, two signs, tutorial toast all foreground; forest band + one midground tree behind.
6. **Terrain:** Two flat tiers, one 54px step. Clean, no seams.
7. **Platforms/supports:** None needed yet.
8. **Ladders:** None.
9. **Decorations/props:** Tree, one bush (x=10), crate+switch visible ahead.
10. **Collectibles:** None in-room (a-ledge is R02).
11. **Hazards/recovery:** None — flat ground, no fall risk.
12. **Camera framing:** Confirmed live (`r01-langkah-pertama.jpg`): forest band visible, tutorial text ("A/D untuk bergerak") and Chill Boy's opening line both on-screen simultaneously without overlapping each other — the only two text elements active here don't fight.
13. **Dialogue/UI:** `zone:A` line ("Baiklah, bekalan ni kena sampai ke seberang") + movement tutorial toast, both visible together in the capture, non-overlapping.
14. **Main issue:** None P0/P1. The single landmark tree is good restraint, not a problem — flagging it would be exactly the "add more trees" superficial note the brief warns against.
15. **Evidence:** `r01-langkah-pertama.jpg`, `strip-01-x0-2000.jpg`.
16. **Proposed correction:** None needed structurally. See 05/06 for whether the room needs any rhythm variation (it doesn't — it's 432px, correctly brief).
17. **Severity/confidence:** N/A (no defect) / High confidence (live-screenshotted).

## R02 — Kotak dan plet (A, optional, x=432–972)
1. **Coordinates:** x 432–972. A-crate (432,1242,w648) spans both R02 and part of R03's approach.
2. **Role:** Optional crate-push puzzle; first real "decision," reachable without being mandatory.
3. **Actual path:** Push crate onto switch (x=810) to raise a hidden ledge/reward (coin `a-ledge`).
4. **Focal point:** The crate itself (distinct Kenney chest art, warm gold vs. the brown/green terrain — genuinely successful color differentiation).
5. **Foreground/background:** Crate, switch, sign; forest band behind.
6. **Terrain:** One long flat 648px run — confirmed via source and `r02-kotak-dan-plet.jpg` to have only one bush (x=1000, right at the room's far edge) breaking it up. The 432–1000px interior of this run is genuinely bare ground with nothing above the walking plane.
7. **Platforms/supports:** The reward ledge (A-ledge, oneWay, optional) appears once solved — not visible/assessable in this pass since the puzzle wasn't solved during screenshot capture (gravity was disabled for camera positioning, which does not block visual inspection of the solved-state ledge sprite itself, but its *reveal* animation wasn't triggered).
8. **Ladders:** None.
9. **Decorations/props:** Crate, pressure plate, one bush, one sign.
10. **Collectibles:** `a-ledge` (x=855, reward for solving).
11. **Hazards/recovery:** None.
12. **Camera framing:** Clean, Chill Boy's line still visible from R01 carrying over (dialogue queue correctly persists across the room boundary rather than cutting off mid-sentence).
13. **Dialogue/UI:** `found:crate` line queued when near; not yet triggered in the capture.
14. **Main issue (P2):** ~560px of the 648px run (432–1000) has zero decoration above ground level — confirmed directly in the screenshot, not inferred. Not severe (A is meant to be simple), but it's the longest truly bare stretch in the first screen of the game.
15. **Evidence:** `r02-kotak-dan-plet.jpg`.
16. **Proposed correction:** One more already-used `tile(124)` bush accent roughly mid-run (~x=700), matching the exact pattern already used to fix a smaller version of this same issue on A-landing in Phase 6.5C2B. Zero new assets, zero risk.
17. **Severity/confidence:** P2 / High confidence.

## R03 — Jurang dan checkpoint (A, x=972–1458)
1. **Coordinates:** x 972–1458. A-landing (1188,1242,w270). FIRST_GAP at x=1080,w108.
2. **Role:** First real platforming decision (a jump over a gap) plus the run's first checkpoint.
3. **Actual path:** Jump the 108px gap, land, checkpoint (`a-gap`, x=1296) triggers automatically.
4. **Focal point:** None distinct — this room's only job is the gap itself.
5. **Foreground/background:** B's lift cluster is already visible in the distance on the right edge of frame (confirmed in `r03-jurang-checkpoint.jpg`), which is a genuinely good piece of forward-guidance — the player can see where they're headed before they get there.
6. **Terrain:** Two flat tiers separated by the gap.
7. **Platforms/supports:** None beyond the landing itself.
8. **Ladders:** None here (B's ladders visible ahead, not part of this room).
9. **Decorations/props:** One bush at the gap edge, one more mid-landing.
10. **Collectibles:** None.
11. **Hazards/recovery:** The gap is the room's only "hazard," and it's entirely safe — missing it just means falling to the ground below and walking back, confirmed by source (`respawn()` logic, no damage, no life loss).
12. **Camera framing:** Good — the gap and the landing are both in frame together before the jump is required, so the player can judge the jump before committing (Celeste/Mario "see before you leap" principle, already satisfied here — see file 02 for the principle itself).
13. **Dialogue/UI:** None active in the capture.
14. **Main issue:** None P0/P1.
15. **Evidence:** `r03-jurang-checkpoint.jpg`.
16. **Proposed correction:** None needed.
17. **Severity/confidence:** N/A / High confidence.

## R04 — Mendaki dan mencuba input (B, x=1458–1944)
1. **Coordinates:** x 1458–1944. B-low(1458,1188) B-middle(1620,1134). Overlaps C's x-range but C requires y≤900 (elevated) while B is grounded — confirmed they never spatially collide.
2. **Role:** Climb + first contact with the B-selector ("?" input chooser).
3. **Actual path:** Climb two short ladder/deck tiers, reach the selector, optionally climb further to C.
4. **Focal point:** The floating "?" label (`bSelectorLabel`) above the selector sign — a genuinely clear, simple indicator of "this hasn't been set yet."
5. **Foreground/background:** Confirmed in `r04-mendaki-dan-mencuba-input.jpg`: **two full post+ladder+deck assemblies stacked directly on top of each other in one screen**, plus a third visible at the frame edge. This is the single clearest screenshot evidence of the "repeated rectangular geometry" complaint in the entire audit.
6. **Terrain:** Two narrow stepped shelves (B-low w162, B-middle w216).
7. **Platforms/supports:** Two decks, each with its own full ladder+post frame — structurally fine (each genuinely carries a deck), but visually identical to each other at a glance.
8. **Ladders:** Two, back to back.
9. **Decorations/props:** Signs for the selector and lever (lever itself is in R05), a coin, a gem (`c-return`, requires secret).
10. **Collectibles:** `c-return` visible overhead (locked until secret found) — its visibility *before* it's obtainable is intentional per source (secret-gated coins start with `body.enable=false` but remain visible, a legitimate "something's here, come back" cue).
11. **Hazards/recovery:** Standard fall-and-walk-back; no damage.
12. **Camera framing:** The interaction glow ring and "E · Guna" prompt are both clearly visible and don't overlap the ladder art behind them.
13. **Dialogue/UI:** `found:probe`/selector-adjacent prompt visible correctly positioned.
14. **Main issue (P1):** Visual repetition of the ladder/deck module at point-blank range — two full copies in one screen, confirmed by direct screenshot, not an assumption about the whole zone.
15. **Evidence:** `r04-mendaki-dan-mencuba-input.jpg`.
16. **Proposed correction:** Not "add more props" — the opposite: vary the *silhouette* of one of the two decks (different width, or a single-sided rail instead of a full post-pair on the shorter B-low shelf) so the climb reads as ascending through different-shaped spaces rather than the same frame twice. A geometry-light fix (no new collision), not a decoration-heavy one.
17. **Severity/confidence:** P1 / High confidence (direct screenshot).

## R05 — Pengangkat fungsi (B, x=1944–2484)
1. **Coordinates:** x 1944–2484. B-control(1836,1080) B-lift gate(2160,1080,w324) B-bank(2484,1080).
2. **Role:** The zone's actual puzzle — set input via the selector, test via the lever, solve for output 7.
3. **Actual path:** Walk to selector, cycle input 0–4, walk to lever, test; repeat until output 7 raises the bridge.
4. **Focal point:** The lift mechanism — explicitly the best-composed cluster in zone B (actuator-mark row, lever, selector all grouped and visually distinct from plain terrain), confirmed live.
5. **Foreground/background:** The `#b-control` world-aside HTML panel (dark red, "f(x)=2x+1 · Sasaran kod:7") sits over the top third of the screen in the capture — confirmed functional and legible, but it is the first clearly "web dashboard" element the player sees: a bordered rectangle with system-ui text, not game-native chrome (see file 11 for the full UI critique).
6. **Terrain:** Flat tiers either side of the gated gap.
7. **Platforms/supports:** The lift's own gate art (grey plank, parked far below when unsolved) is visible, correctly distinct from the surrounding brown timber decks.
8. **Ladders:** One, leading to the upper B-control tier.
9. **Decorations/props:** Selector sign, lever, actuator-mark row (now extended toward the lever per Phase 6.5C2B).
10. **Collectibles:** A coin and a gem both floating overhead.
11. **Hazards/recovery:** None; failed tests just show "Hentian uji" (test stop) and let the player retry freely.
12. **Camera framing:** Confirmed: b-control panel, "?" selector label, lift readout text are all visible together without overlapping each other in this exact capture.
13. **Dialogue/UI:** `#b-control` panel active; correctly suppresses `#notice`/`#zone-toast`/`#mission-indicator`/`#chill-bubble` per its own CSS (`body.b-control-visible ...{visibility:hidden}` — verified by reading `b-control.css` directly, not just observed).
14. **Main issue:** None P0/P1 specific to this room's geometry — the mechanism itself is the strongest in the game. The UI-dashboard-feel issue is cross-cutting (file 11), not unique to R05.
15. **Evidence:** `r05-pengangkat-fungsi.jpg`.
16. **Proposed correction:** None for geometry. See file 11 for the panel's visual language.
17. **Severity/confidence:** N/A / High confidence.

## R06 — Bonus atas (C, optional, x=1458–1944, y≤900)
1. **Coordinates:** x 1458–1944, yMax 900. C-route (1458,864,w486).
2. **Role:** Optional elevated path; a genuinely different kind of puzzle — passive observation (two clue signs) then an "apply" confirmation, no modal, no form.
3. **Actual path:** Climb the C-entry ladder, press E at two signs, press E at a third; reward coin unlocks.
4. **Focal point:** The `#c-control` panel readout ("Perhatikan papan di laluan ini") plus the "E · Uji corak" prompt, both legible together.
5. **Foreground/background:** Confirmed in `r06-bonus-atas.jpg`: **architecturally identical to every other elevated deck in the game** — same post+beam+plank module, just higher up. The room's only differentiator is that it's quieter (fewer props), which Phase 6.5C1/6.5C2B already correctly identified as the *intended* identity ("an optional side-path should feel different by being quieter, not busier").
6. **Terrain:** A single long supported deck, no ground-tier terrain at all (fully elevated).
7. **Platforms/supports:** Three posts + one beam span, all standard-module.
8. **Ladders:** C-entry (x=1512) and C-return (x=1890), both standard ladder art.
9. **Decorations/props:** Two deco tiles (frames 90/92), three clue/apply signs.
10. **Collectibles:** `c-entry` coin and `c-return` coin (the latter secret-gated).
11. **Hazards/recovery:** None — falling off simply drops back to B below, no penalty.
12. **Camera framing:** Clean.
13. **Dialogue/UI:** `c-control` panel correctly shows "Belum ada pemerhatian" before either clue is seen.
14. **Main issue:** None P0/P1. See file 09 for whether the *puzzle itself* (not the room) is meaningful — that's the real C concern, not its visuals.
15. **Evidence:** `r06-bonus-atas.jpg`.
16. **Proposed correction:** None visual. Phase 6.5C2B already investigated and rejected adding an "optional route" marker here (the only candidate asset read as "blocked," not "optional") — that conclusion is reconfirmed in this independent pass.
17. **Severity/confidence:** N/A / High confidence.

## R07 — Menuju blok nombor (B, x=2484–3024)
1. **Coordinates:** x 2484–3024. B-bank(2484,1080) B-terrace(2646,1026) B-overlook(2808,972).
2. **Role:** Transition corridor from the lift to D; three stacked shelves climbing toward D's rack.
3. **Actual path:** Walk/climb through three short tiers, checkpoint (`b-review`) along the way.
4. **Focal point:** None — this room is explicitly transitional, and D's number-block rack is already visible on the right edge of frame (good forward-guidance, same pattern as R03→B).
5. **Foreground/background:** Confirmed live: a checkpoint flag mid-room, bushes now present at each tier (Phase 6.5C2A's bank→terrace→overlook fill already applied and visible).
6. **Terrain:** Three stacked 54px-rising shelves.
7. **Platforms/supports:** Standard.
8. **Ladders:** None required (the rises are jumpable steps).
9. **Decorations/props:** Three bush accents (one per tier, per the 6.5C2A fix), one checkpoint flag.
10. **Collectibles:** `b-return` coin.
11. **Hazards/recovery:** None.
12. **Camera framing:** Good — D's rack visible ahead without crowding.
13. **Dialogue/UI:** None blocking.
14. **Main issue:** None P0/P1 remaining — this was the exact room Phase 6.5C1/6.5C2A identified as "324px with zero vegetation" and fixed. Re-confirmed fixed in this independent pass.
15. **Evidence:** `r07-menuju-blok-nombor.jpg`.
16. **Proposed correction:** None.
17. **Severity/confidence:** N/A / High confidence.

## R08 — Blok nombor (D, x=3024–3564)
1. **Coordinates:** x 3024–3564. D-approach(3024,972,w540) D-rack(3078,918,w216,oneWay) D-crossing gate(3564,972,w270).
2. **Role:** The number-block puzzle — select a block (2/3/4), test against g(x)=3x−2=10.
3. **Actual path:** Walk to the rack, press E on a block directly (immediate test, no modal) OR interact with the console sign for the same test via a panel.
4. **Focal point:** The three number blocks themselves — bold, legible digit tiles, the single clearest "this is interactive and numbered" prop in the game.
5. **Foreground/background:** Confirmed in `r08-blok-nombor.jpg`: the two Phase 6.5C2A crates are visible on the D-service ledge above, correctly reading as "workshop stock," not clutter.
6. **Terrain:** One flat approach run into the rack.
7. **Platforms/supports:** Rack (oneWay) with post+beam frame; standard module again, but here it's load-bearing for an actual interactive object, not just a walkway.
8. **Ladders:** One, to D-service above.
9. **Decorations/props:** Crates (new), post+beam.
10. **Collectibles:** None directly in this sub-room (d-service is R09).
11. **Hazards/recovery:** None; wrong block just returns to the rack, explicitly "no penalty" per the dialogue line.
12. **Camera framing:** "E · Masukkan blok 4" prompt clear and unambiguous.
13. **Dialogue/UI:** `found:number` dialogue line.
14. **Main issue (P2, confirmed via source read, not screenshot):** Two interaction paths exist for the same puzzle — pressing E directly on any of the three number-input terminals (`selectNumberBlock()`, immediate test, no modal) and interacting with the `number` console terminal at x=3420 (opens the `#mechanism` modal, which for `kind==='number'` hides the token-grid and relies on `testDial()` routing back to the exact same 3×input check). A player who only ever presses E on blocks never needs the console at all — it is visually present (a full sign prop) but functionally redundant for solving the room. Not a bug; a design-clarity question, see file 09.
15. **Evidence:** `r08-blok-nombor.jpg`; console redundancy confirmed via `mechanisms.js` (`selectNumberBlock`) and `level.js` (`TERMINALS` 'number' vs 'number-input-*').
16. **Proposed correction:** Not visual — a mission-design question (file 09): either give the console a distinct role (e.g., it's the only place to see g(x)'s rule spelled out, which the direct-block path doesn't show) or accept it as a deliberate "read more if curious" secondary path and say so.
17. **Severity/confidence:** P2 / High confidence (source-verified).

## R09 — Laluan servis (D, optional, x=3100–3456)
1. **Coordinates:** x 3100–3456 (room range; actual ledge D-service at x=3294,y=738,w216,oneWay,optional).
2. **Role:** Optional elevated ledge reachable only by ladder; a genuine "went off the main path, found something" moment.
3. **Actual path:** Climb D-service ladder (x=3330), walk the ledge, find `d-service` coin.
4. **Focal point:** The two new crates (Phase 6.5C2A), now the room's only props besides the coin.
5. **Foreground/background:** Confirmed in `r09-laluan-servis.jpg`: clean, uncluttered, the "W/S" ladder prompt and coin both legible.
6. **Terrain:** A single thin oneWay ledge, correctly thin (18px visual) matching its real 16px collider.
7. **Platforms/supports:** The ledge's own post framing, shared visually with D-rack below (same frame, intentional per source comments — "D-service ladder running off the top of the normally-framed camera view... leads to the optional D-service platform," confirmed not a bug in Phase 6.5C1).
8. **Ladders:** One, the only access.
9. **Decorations/props:** Two crates.
10. **Collectibles:** `d-service` coin.
11. **Hazards/recovery:** None.
12. **Camera framing:** Good.
13. **Dialogue/UI:** None specific.
14. **Main issue:** None P0/P1.
15. **Evidence:** `r09-laluan-servis.jpg`.
16. **Proposed correction:** None.
17. **Severity/confidence:** N/A / High confidence.

## R10 — Susunan fungsi (D, x=3834–4104)
1. **Coordinates:** x 3834–4104. D-landing(3834,972,w270).
2. **Role:** A composition terminal (f then g, or g then f, input 2) — narratively "D leads into E" since this is the last stop before the waterworks.
3. **Actual path:** Walk to the composition console, open modal, pick f-then-g or g-then-f.
4. **Focal point:** None distinct in-room; the sign is generic (frame 85, same as every other sign in the game).
5. **Foreground/background:** Confirmed live: E's source tank and pipe run already visible on the right edge — good forward guidance, consistent with the pattern seen at every zone boundary so far.
6. **Terrain:** Flat landing run.
7. **Platforms/supports:** None beyond standard ground.
8. **Ladders:** None.
9. **Decorations/props:** One sign (composition console), a coin and crate visible on the left edge (D-rack's far side).
10. **Collectibles:** None directly new here.
11. **Hazards/recovery:** None.
12. **Camera framing:** Good.
13. **Dialogue/UI:** `found:composition` line.
14. **Main issue (P3):** This terminal's puzzle (f(2) vs g(2), compare orderings) is conceptually the *exact same skill* as Zone E's waterworks puzzle two rooms later (input 3 through f/g in either order) — see file 09 for whether this is useful repetition (practice before the "real" version) or redundant repetition (the same decision twice in a row with no new wrinkle).
15. **Evidence:** `r10-susunan-fungsi.jpg`.
16. **Proposed correction:** Mission-design question, not visual — see file 09.
17. **Severity/confidence:** P3 (pacing concern, not a defect) / Medium confidence (depends on playtest — see file 13).

## R11 — Laluan paip air (E, x=4104–4860)
1. **Coordinates:** x 4104–4860. E-entry(4104,972) E-step(4266,918) E-source-terrace(4374,864) E-cave-walkway(4590,972,w270,oneWay).
2. **Role:** Set up the waterworks puzzle — inspect F and G machine signs, choose an order.
3. **Actual path:** Walk/climb to the source tank, read F/G stage signs, choose order at the activator.
4. **Focal point:** The source tank + pipe run — the strongest material-based identity in the game (blue vs. the universal brown/green).
5. **Foreground/background:** Confirmed in `r11-laluan-paip-air.jpg`: the `#e-control` panel ("Belum pilih susunan") sits over the top, "E · Tetapkan F dahulu" prompt clear, pipe run and source tank both legible behind it.
6. **Terrain:** A raised terrace into the pipe/walkway gap (the Phase 6.5C2A tinted deck, confirmed present and visually distinct here).
7. **Platforms/supports:** The one real walkway (now tinted/capped) plus genuinely decorative pipe segments above it — already fixed and re-verified in this pass.
8. **Ladders:** E-cave-ladder (x=4806).
9. **Decorations/props:** Source tank (2×2 tile cluster), control board signs.
10. **Collectibles:** `e-waterwalk` coin below, in the sheltered lower route.
11. **Hazards/recovery:** A fall here just drops to the lower sheltered floor (E-recovery) — genuinely a *safe* recovery path, not a punishing one, confirmed by source geometry.
12. **Camera framing:** Good, confirmed.
13. **Dialogue/UI:** `e-control` panel active; **confirmed via source that this panel's CSS is missing the same notice/toast suppression rule that `b-control.css` and `c-control.css` both have** — see file 11 for the full writeup; flagged here as the room where it would manifest.
14. **Main issue:** The missing-suppression CSS gap (file 11) is the one real defect tied to this room; the geometry itself is sound.
15. **Evidence:** `r11-laluan-paip-air.jpg`; CSS diff in file 11.
16. **Proposed correction:** See file 11 (one-line CSS fix, not a geometry change).
17. **Severity/confidence:** P2 / High confidence (source-verified CSS gap).

## R12 — Komposisi dan takungan (E, x=4860–5650)
1. **Coordinates:** x 4860–5650. E-east-bank(4860,972) E-pool-floor(5022,1026) E-control-bank(5184,972) E-lower-crossing(5292,1296) E-far-bank(5508,972).
2. **Role:** Run the waterworks experiment (activate the lever), watch the flow animate stage-to-stage, reach output 19.
3. **Actual path:** Walk to the output lever, press E, watch the animated flow dot traverse `eWaterPath`, reservoir fills if correct.
4. **Focal point:** The animated flow — genuinely the best piece of *motion* feedback in the game (a dot physically travels the pipe path, pausing to show intermediate values at each stage).
5. **Foreground/background:** Confirmed live: reservoir tiles, output lever, and the elbow/joint pipe cluster all visible together, legible.
6. **Terrain:** A sequence of narrow banks separated by the recessed pool.
7. **Platforms/supports:** E-lower-crossing is a real solid tier well below the main path (y=1296 vs 972 elsewhere) — a genuine vertical outlier, confirmed in source, not visible in the capture at this camera height (not flagged as wrong, just noting the room has more vertical range than its screenshot shows).
8. **Ladders:** E-recover-left/right (x=5292/5508).
9. **Decorations/props:** Reservoir (animated alpha fill), output lever, elbow/joint pipe pieces.
10. **Collectibles:** None new.
11. **Hazards/recovery:** Standard.
12. **Camera framing:** Good.
13. **Dialogue/UI:** `e-control` panel again (same missing-suppression issue as R11).
14. **Main issue:** None new geometry-wise; the waterworks mechanism itself is the strongest *feedback* moment in the game (see file 12).
15. **Evidence:** `r12-komposisi-dan-takungan.jpg`.
16. **Proposed correction:** None visual.
17. **Severity/confidence:** N/A / High confidence.

## R13 — Bukit dan pandangan sungai (F, x=5650–7250)
1. **Coordinates:** x 5650–7250. F-entry(5650,972) F-step1(5812,918) F-step2(5974,864) … F-down1(6730,1026) F-down2(6892,1080) F-river-view(7108,1026).
2. **Role:** Pure traversal — the game's one real hillside climb-and-descend, no puzzle gating it.
3. **Actual path:** Climb three steps, optionally detour into the cave (R14), descend three more steps toward G.
4. **Focal point:** None singular — this room's value is rhythm, not a landmark.
5. **Foreground/background:** Confirmed live: bush-per-step on the ascent (already dense, per Phase 6.5C1), varied bush offsets on the descent (Phase 6.5C2B fix, confirmed present and visually breaking the "staircase" read compared to the pre-fix screenshot in that phase's own report).
6. **Terrain:** Six total shelves (three up, three down), all the standard brown/green module.
7. **Platforms/supports:** The moving platform (F_MOVING_PLATFORM) is visible overhead in the wide strip view but has no distinguishing color from the static decks — only its motion marks it, confirmed by direct comparison of its art call (`s.deck()`, identical frames to every static deck) against static decks nearby.
8. **Ladders:** F-cave-entry/return (x=6226/6478), serving the optional cave only.
9. **Decorations/props:** Bush accents, moving-platform deck art.
10. **Collectibles:** `f-ridge` coin.
11. **Hazards/recovery:** None — falling off a step just drops to the tier below.
12. **Camera framing:** Good, confirmed across `r13` and strip 4.
13. **Dialogue/UI:** `zone:F` line ("Eh, macam ada jalan lain dekat bawah tu") correctly hints at the cave without being forced.
14. **Main issue (P2):** The moving platform has zero visual distinction from a static deck except motion — a player who first sees it motionless (at either end of its travel) has no color/outline cue that it's rideable and moving, only the eventual observation that it slides. This is a legibility gap, not a collision bug (collision/physics is explicitly out of scope to touch per this audit's constraints, and this finding is cosmetic-only: a tint or outline, nothing structural).
15. **Evidence:** `r13-bukit-dan-pandangan-sungai.jpg`, `strip-04-x5200-7400.jpg`; moving-platform render call confirmed identical to static decks via `environment.js` (`s.deck({x:fDeckX,...})`, same function, same frames, as every other deck in the file).
16. **Proposed correction:** A distinct tint on the moving platform's deck art only (same technique already used successfully on E's walkway in Phase 6.5C2A) — zero new assets, zero collision risk.
17. **Severity/confidence:** P2 / High confidence (source-verified identical render call).

## R14 — Gua songsang (F, optional, x=6136–6568)
1. **Coordinates:** x 6136–6568. F-cave-floor(6136,1134,optional) F-cave-roof(6136,918,oneWay,optional).
2. **Role:** Optional inverse-function puzzle — "given f(x)=7, find x" (genuinely different cognitive direction from every other puzzle in the game, which all go forward).
3. **Actual path:** Enter via ladder, reach the secret marker, solve the inverse puzzle, claim `f-cave-gem`.
4. **Focal point:** The secret marker's glowing gem icon.
5. **Foreground/background:** Confirmed live in `r14-gua-songsang.jpg`: the moving platform's resting position is visible overhead, cave roof/floor framing clear, "E · Guna" prompt legible.
6. **Terrain:** A single enclosed volume between dirt floor and one-way roof — the only room in the game with a true "cave" silhouette (floor, roof, and end banks forming an enclosed shape) rather than an open-air platform stack.
7. **Platforms/supports:** F-cave-roof (oneWay), F-cave-floor (solid) — correct and distinct from the rest of the game's platform language, confirmed via direct inspection.
8. **Ladders:** F-cave-entry/return.
9. **Decorations/props:** None beyond the secret marker and sign.
10. **Collectibles:** `f-cave-gem` (secret-gated).
11. **Hazards/recovery:** None.
12. **Camera framing:** Good.
13. **Dialogue/UI:** None blocking.
14. **Main issue:** None P0/P1. This is, structurally, the single most distinct ROOM SILHOUETTE in the entire game (an actual enclosed cave shape, not a stack of shelves) — worth preserving exactly as-is.
15. **Evidence:** `r14-gua-songsang.jpg`.
16. **Proposed correction:** None.
17. **Severity/confidence:** N/A / High confidence.

## R15 — Sungai dan dua latch (G, x=7250–8046)
1. **Coordinates:** x 7250–8046. G-west-bank(7250,972) G-river-crossing gate(7506,972,w324) G-far-bank(7830,972).
2. **Role:** The finale puzzle — two sequential locks (solve h(x)=4x−3=17, then compare f/g ordering for a second target).
3. **Actual path:** Reach the sign+lever cluster, cycle input/order, activate lever twice (once per lock).
4. **Focal point:** The split-hinge lever — confirmed via source to be genuinely bespoke (a custom-generated canvas texture splitting the atlas's combined lever sprite at its hinge so only the handle rotates), the single most hand-crafted prop in the entire game.
5. **Foreground/background:** Confirmed live in `r15-sungai-dan-dua-latch.jpg`: `#g-control` panel ("Pengunci 1/2"), prompt, and the actual river water fill all visible together, legible.
6. **Terrain:** Banks either side of a true river gap, with real water-tile fill below (not just empty space).
7. **Platforms/supports:** Standard post framing on both banks.
8. **Ladders:** None in this sub-room.
9. **Decorations/props:** Sign+lever cluster, river water tiles.
10. **Collectibles:** None new.
11. **Hazards/recovery:** Falling into the river (confirmed via `game.js` line checking `player.x>7506&&player.x<7830&&body.bottom>1072`) triggers `respawn()` — a real fail state with a real visual (water), the only room in the game where the "hazard" has a matching visual threat (water) rather than being an invisible off-world boundary.
12. **Camera framing:** Good.
13. **Dialogue/UI:** `g-control` panel active; **same missing-suppression CSS gap as e-control** (file 11).
14. **Main issue:** The CSS gap (file 11); otherwise this is one of the two best-realized rooms in the game alongside R16's door.
15. **Evidence:** `r15-sungai-dan-dua-latch.jpg`.
16. **Proposed correction:** See file 11.
17. **Severity/confidence:** P2 / High confidence.

## R16 — Pintu destinasi (G, x=8046–8400)
1. **Coordinates:** x 8046–8400. G-goal-slope(8046,1026) G-goal-shelf(8262,972). GOAL={x:8316,feet:972}.
2. **Role:** The actual ending — reach the door, triggers `finish()`.
3. **Actual path:** Walk the final slope and shelf, press E at the door (or simply stand in range once all gates are solved).
4. **Focal point:** The door+flag prop.
5. **Foreground/background:** Confirmed live in `r16-pintu-destinasi.jpg` AND the Phase 6.5C2B fix specifically: **no midground tree sits behind the door** (the x<8100 exclusion added in that phase, re-verified present and correct in this independent pass using the disposable copy, which was copied from the repo *after* that fix landed).
6. **Terrain:** Final slope + shelf, standard module.
7. **Platforms/supports:** Standard.
8. **Ladders:** None.
9. **Decorations/props:** Door (frame 130/150), flag (frame 110).
10. **Collectibles:** `g-farbank` coin nearby.
11. **Hazards/recovery:** None — this is the safe ending ground.
12. **Camera framing:** Good.
13. **Dialogue/UI:** The completion dialog (`#complete`), confirmed functional and legible (`screenshots/ui-completion-screen.jpg`) — clean victory screen, time/coins/secrets summary, replay/menu options, no overlap with anything.
14. **Main issue (P2):** The door itself is small, sits directly on ground level with no elevation or framing device distinguishing it as "the end of an 8400px journey" from any other sign-and-post cluster in the game. Confirmed by direct visual comparison against every other room's screenshots — the door prop is not meaningfully larger or more elevated than, say, a checkpoint flag.
15. **Evidence:** `r16-pintu-destinasi.jpg`, `strip-05-x7000-9200.jpg`.
16. **Proposed correction:** See file 07/16 — raising the door's shelf slightly or framing it between two posts (reusing existing frames) would give the finale the "arrival" read it currently lacks. Not attempted in this audit (read-only).
17. **Severity/confidence:** P2 / Medium confidence (this is a composition judgment, not a measurable defect — flagged as a design opinion, not a verified bug).

---

## How the rooms form Zones A–G

- **A (R01–R03):** A clean three-beat introduction — move, optional detour, first real jump+checkpoint. Works as designed; only R02's bare stretch is a minor gap.
- **B (R04, R05, R07):** Climb → mechanism → transition. The mechanism (R05) is the strongest room in the zone; the climb (R04) is the weakest due to repeated module density.
- **C (R06):** A genuine sibling to B (literally overlapping x-range, different y), correctly quiet by design.
- **D (R08–R10):** Approach → puzzle → transition, mirroring B's own three-beat shape almost exactly — a structural pattern repeated zone-to-zone (see file 07/09 for whether that's a feature or a flaw).
- **E (R11–R12):** Setup → execution, the zone with the best combination of material identity (pipes) and feedback motion (the flow dot).
- **F (R13–R14):** The one zone built around traversal rhythm rather than a single mechanism, with a genuinely distinct optional cave silhouette.
- **G (R15–R16):** Finale puzzle → arrival. The puzzle is the most mechanically bespoke moment in the game; the arrival (the door itself) is the weakest *visual* beat for how much the game has been building toward it.

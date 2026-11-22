# Phase 6.5C2B — World visual validation + remaining zone polish — final report

Validates Phase 6.5C2A's background/midground layers and Zone D/E work across all seven zones, then applies a small number of evidence-based fixes. No feature from 6.5C2A was rebuilt. V9/V10/V11 untouched. Nothing committed, pushed, or deployed.

## 1. Files changed

Only `app/addmath/rooftop/src/v12/environment.js`, four small targeted edits, all additive/positional (no terrain, collision, or gate-math changes):

- Midground tree loop: added `if(x<8100)` so no tree lands in the Zone G goal approach.
- Zone A: one more `tile(124,...)` bush accent on `A-landing` at x=1260.
- Zone B: three more `tile(107,...)` actuator-mark accents (x=2079/2115/2151) extending the existing lift control-bank row back toward the lever.
- Zone F: descent shelves (`F-down1`/`F-down2`/`F-river-view`) now use varied offsets instead of the uniform `+54` every other decorated surface uses.

`app/addmath/rooftop/src/v12/game.js` again got a temporary query-gated debug hook (`?qadebug=1` → `window.__qaScene`) for screenshot QA, removed before finishing — confirmed by `grep -n "qadebug" src/v12/game.js` returning nothing, and by a final clean reload in a fresh tab.

## 2. Visual validation findings

All seven zones screenshotted (left/mid/right world-boundary coverage included). Checked against the brief's list:

| Check | Result |
|---|---|
| Background parallax coverage | **Pass.** Checked both world extremes (x≈0 and x≈8420) at the background's own y-band — fills edge-to-edge with no gap at either end, despite `scrollFactor(.3,.2)` lagging the foreground. The loop draws across the full `WORLD.width` with margin, which is intentionally more coverage than the parallax math strictly requires, and that margin is what prevents a gap. |
| Repeating seams | **Pass.** Zoomed into the forest-band tiling boundary (see inline check during this phase) — the `kpp_bg_hill` tile's own silhouette pattern is symmetric, so adjacent tiles join with no visible seam. |
| Empty spaces | **By design, not a defect.** A large flat-color band still sits above the forest strip in every screenshot. This is 6.5C2A's and depth-layer-plan.md's explicit choice (one low band, not a full-height fill) and was not re-litigated here — no new evidence surfaced in this pass to justify changing that decision, and the brief for this phase says not to add sprites without evidence. |
| Background cutoffs | **Pass.** See parallax coverage above — none found at either boundary. |
| Midground tree placement | **One confirmed defect, fixed** — see §3. Everywhere else, trees sit comfortably behind signs/platforms with no occlusion (depth 1.5 is always below gameplay layers); a few trees land fully behind opaque foreground art (e.g. the Zone E pipe elbow) and are simply invisible there — wasted but harmless, left alone. |
| Platform visibility | **Pass.** Lift deck, number-block rack, pipe walkway, moving platform, and all signs read clearly in every screenshot; nothing new sits in front of or behind them in a way that hides them. |
| Foreground/background contrast | **Pass.** The cool-toned background/midground never competes with the warm terrain/prop palette in any screenshot. |
| Zone-to-zone separation | **Pass.** The single continuous band (per depth-layer-plan.md's deliberate "one sky, not one per zone" choice) reads as one coherent world, not fragmented — confirmed across A, B, C, D, E, F, G shots. |
| Player visibility | **Pass.** Player sprite (depth ≥14) always renders in front of both new layers in every screenshot. |
| Mobile composition | **Pass.** Checked Zone B and Zone G (pre- and post-fix) forced to a 390×700 viewport — canvas stays confined to 390px with no horizontal overflow, HUD and prompts remain legible, background/midground scale cleanly. |

## 3. Confirmed defect and repair

**Found:** the midground tree loop's fixed 540px stride (starting x=150) places a tree at world x=8250 — 12px from the destination door (`tile(130/150,8262,...)`, drawn in 6.5C2A's base `environment.js`). Confirmed live: screenshot with the camera centered on the goal showed the tree sitting almost directly behind the door, diluting the one moment the brief specifically asked this phase to emphasize ("visual emphasis on the bridge/destination").

**Fix:** `if(x<8100)` on the tree-placement loop (environment.js). Smallest possible change — one loop condition, same asset, same every other tree position untouched, no coordinate/collision anywhere touched. Re-screenshotted (desktop + mobile) after the fix: the door now stands against open sky. See `screenshots/zone-g-goal-after.jpg` / `screenshots/mobile-zone-g.jpg`.

Checked three other coincidental tree/prop proximities before concluding this was the only fix needed:
- Tree near B's lift/lever cluster (x=2310): comfortable vertical clearance above the lever/selector — not a defect.
- Tree near D's input-socket signs (x=3390): close but doesn't obscure the sign, prompt, or socket — zone D is a busy workshop, not a composition-emphasis moment; left alone.
- Tree near E's pipe elbow (x=5010): fully hidden behind the opaque pipe art (depth 10 renders in front of depth 1.5) — invisible, not harmful, not worth a special case.

## 4. Zone polish (Section 3 of the brief)

Per-zone, evidence first:

- **A — "environmental rhythm along the introductory route."** `coordinate-issues.md` (Phase 6.5C1) flagged the 1188–1370 stretch on `A-landing` as having nothing between the gap edge and the first existing bush. Added one more `tile(124,...)` accent at x=1260 — same frame already used nine times elsewhere in this file, zero new asset. See `screenshots/zone-a-gap-after.jpg`.
- **B — "visual connection between selector, lever and lift."** The existing actuator-mark row (already tying the lift gate to its control bank) started at x=2187, leaving a 144px gap back to the lever at x=2043 with nothing in between. Extended the same row (same frame 107, same 36px stride, same alpha) three marks further left so it now runs continuously from near the lever to the lift. Did not move the lever, selector, or lift gate. See `screenshots/zone-b-actuator-after.jpg`.
- **C — "make the optional elevated path feel distinct without hiding signs or rewards."** Investigated `kpp_gate_barricade` (the one unused-but-loaded asset that looked like a plausible "optional route" marker per Phase 6.5C1's `verified-asset-options.md`) by inspecting its actual pixels: it's an X-braced wooden barricade, i.e. it reads as **closed/blocked**, not "optional but open." Using it at C's ladder entry would send the wrong signal. No safe, already-verified sprite was found that adds "optional" identity without either fabricating something new or misleading the player. Per this phase's own instruction ("if there is insufficient evidence for a proposed visual change, do not implement it merely to make the map busier") and Phase 6.5C1's own conclusion that C's sparseness *is* its correct identity — **no change made to Zone C.**
- **F — "depth and visual variety around the moving-platform traversal and hill area."** `zone-improvement-plan.md` (Phase 6.5C1) flagged the descent (`F-down1`→`F-down2`→`F-river-view`) as reading like a uniform staircase because every shelf's single bush sat at the identical `+54` offset from its surface's left edge. The ascent (already praised as reading like a real hillside) was left untouched. Varied only the descent's three offsets (`108`/`54`/`88`, all within each surface's own width, verified against `SURFACES` so nothing hangs off a shelf edge) — same frame, no coordinate/collision change. See `screenshots/zone-f-descent-after.jpg` vs `screenshots/zone-f-descent.jpg`.
- **G — "final river approach and visual emphasis on the bridge/destination."** Addressed directly by the tree-removal fix in §3 — the goal door now reads clearly against open sky, which is the concrete form "emphasis" takes here. No additional prop was added; Phase 6.5C1 already found G to be the most bespoke, already-distinct zone, and no new evidence surfaced in this pass to justify adding anything further.

## 5. Gameplay readability

Checked against the brief's list — nothing in this phase's four edits sits over a surface a player needs to read:
- Landing/gap/platform visibility: unaffected — every edit is either behind gameplay depth (trees, already true) or a small marker/bush beside, not over, a real surface.
- Moving-platform silhouette (F): not touched.
- Ladder visibility: not touched.
- Interaction prompts: the B and D terminals were opened live post-change (below) and their prompts render exactly as before.
- Collectible/checkpoint visibility: not touched by any of the four edits.
- Water/bridge collision readability: not touched — `environment.js`'s `DECKS`/`platform()` calls are byte-identical to 6.5C2A's state.

## 6. Testing

- **Asset-loading check**: both `kpp_bg_hill` and `kpp_tree` continued loading with zero console errors across every reload in this phase (desktop and the two forced-mobile reloads).
- **Runtime syntax checks**: `node --check` on both edited files, clean exit 0 on each.
- **Rendering checks**: all-zone screenshot pass (§2) plus the four targeted before/after pairs (§3–4).
- **Targeted interaction/collision smoke test** (not a full A–G regression, per the brief): opened the Zone D number-block terminal live post-change ("Bengkel blok nombor" panel opened correctly, same copy as 6.5C2A) — confirms Zone D's interaction radius and UI are unaffected by this phase's edits, none of which touch D. Did not re-run the full puzzle chain, consistent with "do not repeatedly run full A–G regression for decoration-only changes."
- **Desktop + mobile**: checked at 1366×633 (desktop) and a forced 390×700 mobile viewport (Zone B pre-change, Zone G post-change).
- **Clean-state verification**: after removing the temporary debug hook, reloaded in a brand-new tab (not one that had been through this session's manual camera/zoom manipulation) — loads instantly with zero console messages of any kind and the welcome-screen preview renders correctly. This also caught and ruled out a false alarm: the *previous*, heavily-manipulated tab was stuck on a blank blue screen after a reload, which looked like a possible regression at first. Checked directly: the server was serving correct, current file content (`curl` confirmed no `qadebug` string remained and `environment.js` had the expected line count), both edited files passed `node --check`, and a fresh tab loaded perfectly — so this was leftover corrupted Phaser/DOM state in that one tab from this session's own repeated manual `game.scale.setGameSize`/`.game-frame` style overrides during testing, not a code defect.

## 7. Visual issues still unresolved

- The large flat-color band above the forest strip remains in every zone (by design — see §2's "Empty spaces" row). If a future phase wants to revisit this, it would need new evidence/direction, not just "it's still mostly blue up there."
- Several midground trees render fully hidden behind opaque foreground art (e.g. Zone E's pipe elbow) — harmless, but technically wasted draw calls. Not worth a special case for a decorative layer at this scale.
- Zone C intentionally has no "optional path" visual marker — no safe asset was found for it (§4). If a future phase wants this, it likely needs either a new verified sprite or a deliberate decision to accept a very understated already-used-frame treatment (not attempted here per the "don't add without evidence" instruction).
- This phase's own QA (teleporting the player to inspect zones) incidentally picked up a collectible (`g-farbank`) and cleared the save's `checkpointId` on the local dev save used for testing, since positioning doesn't go through the game's real checkpoint triggers. This is a side effect of disclosed QA positioning, not a code change — the save is the local dev/test save, not shipped data, and is resettable in-game via "Mula Semula" if desired.

## 8. Recommendation for final UI phase

The world's visual base (background/midground depth, all seven zones' decoration, the one finale-emphasis fix) is now validated end-to-end with no outstanding defects beyond the two documented non-issues above. A final UI phase could reasonably move on to the game's HUD/menu chrome (welcome screen, pause menu, puzzle dialogs) without needing to revisit world art — nothing found in this validation pass suggests further world-decoration work is needed before that.

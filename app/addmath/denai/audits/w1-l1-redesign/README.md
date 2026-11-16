# Level 1-1 · Jejak Taman Fungsi: Phase C (redesign, World 1 V2)

Branch `claude/denai-l1-redesign` (from `claude/denai-map-masterplan-v2` @ `8053a64`). Not merged, not deployed.
Only Level 1-1 changed. Collision bodies for 1-2 and 1-3 are **identical** (`tests/w1-env-check.cjs`).
Local preview: `python3 -m http.server 8790` at the repo root → `http://localhost:8790/app/addmath/denai/main.html` → MAIN.

## Geometry changes (world units; 1 tile = 54)
| Area | Before | After |
|---|---|---|
| Kampung (x 0–216) | fence behind the spawn | stilt house: veranda (one-way, 0–162 at 1188), ladder x 135, posts, wall + door, roof. Optional; does not block the spawn. |
| Garden hill (x 810–1080) | flat step at 1242 | three surfaces: 1242 → crest 1188 (918–1026) → 1242. Each step is 54. The hill-top oak now stands on the crest. |
| Root arch (x 1242–1620) | two decks on 4 posts (1080) | a solid stone arch (1080–1188), carried by two tree trunks standing in the tunnel (art only, no collision). Its top stays at 1080, so the three canopy coins keep their height (canopy-3 moved 1647 → 1580 onto the arch). Clearance below: 216 over the root lane and 162 over root-step-1, so the main route is unchanged. |
| Root ladder | x 1296 (through the deck) | x 1215, in the shaft beside the arch, with a small landing (1188–1242 at 1080). |
| Construction yard | flat | a stack of plank crates (1944–2052, 54 high, solid) to hop over; column tree moved to 2088. Crane on the far bank (mast on the ground, jib over the gap, a bundle of planks on the rope). |
| Sawmill + jetty (NEW, optional) | — | sawmill on the far bank (3060), lever at the jetty head (cliff-1, 3375). Jetty 3402–3726 at 1458 (one-way, only after it is solved) + ladder x 3699 (1188–1458) + landing up to the rest cliff. Old posts are already standing in the water. |
| Treehouse | branch-right wall 918–1080 | wall lowered to 1040–1080 (still blocks walking off the branch deck), so a rope bridge 4536–4860 at 1026 can pass, landing on a ridge deck (4860–5022) that rests on a tree crown (T3 at 4941). The column tree at 4806 and the foreground tree at 4950 were removed. |
| Exit | plain sign | arrow sign + text "Ke Lembah Sungai →" beside the finish gate (link to 1-2). |

Bodies: 27 → 33 (+2 hill, +veranda, +arch, +arch landing, +crate stack, +rope bridge, +ridge deck, −2 canopy decks). The jetty adds 2 more only once solved.

## Main route and optional routes (real browser, real physics, keyboard)
| Check | Result |
|---|---|
| Main route spawn → hill → tunnel → steps → crate stack → machine (keyboard only) | ✓ reaches x 1840 (yard) and x 2464 (lever); 0 respawns |
| Main machine f(x) = 2x + 1 (real UI) | ✓ panel opens; the right answer locks the bridge (`solvedGates.has('lift')`) |
| Full playthrough (fresh save → bridge → 5 hops → finish) | ✓ `mode: complete`, save `completed: true`, `cp-final`; reload shows "Sambung" |
| P3 arch: ladder → arch top → yard | ✓ climbs to 1080, walks at 1080, drops onto the steps (loop G1) |
| P1 veranda: house ladder → veranda | ✓ stands on 1188 |
| Sawmill: b = 3 → lever | ✓ 8 planks shown at 55 % opacity, "kurang 3", jetty **not** built (no collision) |
| Sawmill: b = 4 → lever | ✓ 11 planks, "tepat! Jeti siap.", one-way collision + ladder appear |
| P4 jetty: cliff-1 → jetty (1458) → ladder → rest cliff (1188) | ✓; coin `pier-high` collected |
| G2 back west: rest cliff → pier-1 → cliff-1 → far bank | ✓ jumps checked from standing (from 3256 and 3300 the jump lands at 1242). The automated bot sometimes falls short; when the jetty is built it lands safely on the jetty, and the exit is the ladder. |
| P5 rope bridge → ridge deck → drop into the east forest | ✓ walks at 1026 to x 5008, then drops |
| All 6 checkpoints (dropped in with real physics) | ✓ land on the right surface |
| Touch (iPhone 13 landscape) | ✓ hold → moves 123 px; the "Guna" button appears at the sawmill (it was hidden before; fixed in `presentation.js`) and tapping it loads 1 log |
| Page errors | 0 |

Scripts: `tests/l1-redesign-check.cjs`, `tests/l1-playthrough.cjs`, `tests/sawmill.test.mjs`, `tests/w1-env-check.cjs`, `tests/w1-traversal-check.cjs`, `tests/w1-gameplay-shots.cjs`.

## Mathematics
- Main (unchanged): f(x) = 2x + 1, 7 planks, 12 mission variants; reducers not touched.
- Optional (new): sawmill g(b) = 3b − 1 (3 planks per log, 1 offcut). The jetty needs exactly 11 → b = 4. **Two steps:** choose b at the mill (the result is not shown), then pull the lever at the jetty head (the planks are laid and the result is visible). b = 3 → 8 "kurang 3" (jetty falls short); b = 5 → 14 "lebih 3" (extras stacked on the bench). Unit test: `tests/sawmill.test.mjs`.

## Saves and records
- Save schema unchanged (`denai-save-v14`, schema 2, layout 2). An old save (checkpoint `cp-gaunt-mid`, coins `canopy-3`, `pier-high`, …, secrets, gate, time) is sanitised with **nothing lost** (checkpoint, coin, secret and gate IDs unchanged).
- 15 coins / 2 secrets: totals unchanged; two coins moved position only (canopy-3, pier-high).
- The jetty is **not** saved (optional shortcut, rebuilt each session), so the schema is not touched.
- Leaderboard: the main route gains two small hops (hill, crate stack), and the jetty can skip one hop. Times are close but not strictly the same. **The PlayFab code was not changed.** Recommendation: the owner creates statistic + leaderboard `denai_l1_time_v2` in PlayFab Game Manager, then switch `leaderboards.allTime` in `src/v14/leaderboard/config.js` to the v2 board and keep `denai_l1_time` as the "Klasik" board (no deletion). Until then, new times still go to the current board.

## Not resolved
1. The crane is a visual landmark only (the planned "lift the bundle" interaction was not built).
2. No new secret (Jetty Chest) was added, so the 2-secret total and achievements stay the same; the jetty holds a moved coin instead.
3. Jetty progress resets every session (not saved).
4. From the jetty you cannot climb back onto cliff-1 (rise 162); the exit is the ladder to the rest cliff (stated in the design).
5. The sawmill text (3 lines) is quite dense on a phone at zoom ⅔; readable, but it could be simplified.
6. The 1-1 → 1-2 transition is visual only (sign + text); 1-2 has not been changed yet (needs approval).

## UI and visual pass (temporary area banners)
Evidence: `ui-pass/` (before/after pairs + desktop/phone banners). Tests: `tests/l1-banner-check.cjs`, `tests/l1-redesign-check.cjs`, `tests/l1-playthrough.cjs`.

**Area banner** (`game.js` `setStep()` + `zoneWithHysteresis()`, CSS `ui-system.css` `#zone-toast.area-banner`). It uses the existing `#zone-toast`; there is no second HUD.
- Timing: 0.2 s fade/slide in · 1.5 s readable · 0.3 s fade out = 2.0 s (measured ≈1.8–1.9 s at opacity > 5 %).
- Shown only on entering a different area; none while standing still. The boundary has 40 px hysteresis (jitter around 4212: 0 banners). The same area does not replay within 6 s. Respawn in the same area: 0 banners. A new area replaces the old banner at once (the animation restarts).
- The persistent HUD chip now shows the **current level** ("1–1 · Jejak Taman Fungsi"), not the area. Coins, pause, secrets and prompts are unchanged.
- Position: top centre, between the coin chip and pause. On phones (≤ 820 px wide or ≤ 540 px tall) the chip is smaller (13 px, max 260 px wide) and no longer appears bottom centre over the game. iPhone 13 landscape: banner at 291–459 × 8–48 px, no overlap with the coins or pause.
- Root cause found: the existing rule `.zone-toast:not(.show)` hides the element, so `show` is kept during the animation.

**Visual defects corrected (verified in the real render)**
1. Sawmill (`levels/sawmill.js`): three stacked texts over the player and under the prompt → one sign higher up (feet − 200: "KILANG PAPAN · g(b) = 3b − 1 / jeti perlu 11 papan"); the chosen b appears in the prompt; the result is a short screen notice (`notify`), not floating text.
2. Jetty: the result text overlapped pier-1's post and the "Panjat tangga" prompt → removed (notice + the planks themselves). The "Jeti perlu 11 papan" label above the lever (over the player's head) → moved onto the sawmill sign.
3. Rope bridge (`environment.js`): two loose posts above the deck → Kenney rope-railing tiles 90/91/92 along the span.
4. Area name: the persistent chip with the area name + a bottom-centre banner on phones → temporary top-centre banner (above).
Checked and **no defect found**: stone arch joins (60–63 / 140–143, no seams), crane rope/bundle (rope centre x 2727 = bundle centre), jetty and ladder alignment (ladder 3672–3726 against the rest cliff, landing at 1188), tree branches (`treeJoinErrors` = 0, no crown overlaps).

**Re-tested:** sawmill b = 3 (8 planks, jetty not built) and b = 4 (built), jetty → ladder → rest cliff, `pier-high` coin, arch, veranda, rope bridge, the main machine, touch "Guna" at the sawmill, full playthrough 2/2 (`complete`, save `completed: true`, 34 s), 1-2/1-3 collision unchanged, 0 console errors. The playthrough bot now stops 30–40 px before the edges (a bot change only).

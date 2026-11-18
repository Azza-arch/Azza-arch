# DENAI — Master Backlog (from Day 01 audit)

Effort: S ≤ ½ day · M ≈ 1 day · L 2–3 days · XL > 3 days. "Day" = suggested development day (D2 = tomorrow).
No P0 was found: no broken gameplay, no data loss, no failing test, no console error, no security leak (PlayFab Title ID is public by design; no secret in client).

## P0 — Critical
None found. (Re-check after every release: playthroughs + `w1-progression` + `w1-mobile-check`.)

## P1 — High
| ID | Title | Problem (evidence) | Proposed solution | Effort | Depends | Acceptance criteria | Files | Day |
|---|---|---|---|---|---|---|---|---|
| P1-01 | Pause/menus on short phones | Android 705×262: Tetapan & Menu utama below the fold, no scroll hint (buttons bottom 272/328 > 262) | Two-column pause layout or compact buttons ≤ 40 px at `max-height:320px`; show scroll shadow | S | — | All 4 pause buttons visible at 262 px; `w1-mobile-check` gains a pause check | `ui-system.css`, `ui/v4.css`, `tests/w1-mobile-check.cjs` | D2 |
| P1-02 | World map hierarchy | `wm-development` solid gold border reads as "selected" | Use neutral/blue "in development" style; keep gold only for selection/primary | S | — | Playable World 1 is the only gold element; screenshot desktop+phone | `menu/world-map.css` | D2 |
| P1-03 | Readable machine displays | Canvas Arial 9–12 px plates/meter digits; ≈ 10 px on short phones; meter off-screen in portrait | Larger pixel-font plates (Kenney digits already used), min 14 px on screen at zoom 0.5; in portrait, show the meter value in the bubble ("Bacaan 9") | M | — | Every maths value legible (≥ 12 CSS px) on 11 viewports; portrait shows reading with result | `sluice-line.js`, `workshop-line.js`, `environment.js`, `pixel-ui.js` | D3 |
| P1-04 | Remove/isolate legacy maths paths | `missions.js` variant selected each run for a hidden machine; `mechanisms.js` (621 lines) & b/c/e/g controls loaded | Stop calling `selectVariant` for new runs (keep reading old ids for migration); lazy-import or delete dead controls after confirming no level uses them | M | tests green | No legacy module executes in a fresh 1-1 run (instrumented); all 9 browser tests + 8 unit tests pass; old saves still load (`w1-progression`) | `game.js`, `missions.js`, `lift-panel.js`, `mechanisms.js`, `src/level.js` | D4 |
| P1-05 | Earlier mission hook in 1-1 | Objective revealed only at x≈2470 | Add a sign/Chill Boy line near start ("Jambatan di Stesen Kayu rosak…") and show the pin from the start as "Ke Stesen Kayu" | S | — | Pin visible within 10 s of start; dialogue log shows the hook | `levels/supply-quest.js`, `dialogue.js` | D2 |
| P1-06 | Shorten post-puzzle traversal | Long tails after the maths in all levels | Move finish closer or put an optional loop instead of mandatory hops; target ≤ 25 % of level time after the puzzle | L | P1-05 | Bot time after puzzle ≤ 25 % of total; playthroughs pass | `level.js`, `twin-world.js`, `inverse-world.js` | D5–D6 |
| P1-07 | Mastery step per level | 1-2 (2 orders) and 1-3 (7 settings) can be brute-forced | Add a second, independent step using the same idea (1-3: promote cave f⁻¹(15) to required; 1-2: second input or third machine) | L | P1-06 | Each level requires one step that cannot be solved by trying all options within 2 tries without reasoning (design review) | `sluice-*`, `workshop-*` | D6–D7 |
| P1-08 | Puzzle definition layer | No unified puzzle schema/ids; fixed numbers on replay | Add `puzzles.js` per level using the schema in DENAI_ADDMATH_AUDIT §4; validator test re-solves `check` | M | — | `tests/puzzles.test.mjs` passes; ids unique; scenes read params from definitions; saves unchanged | `levels/*`, new test | D4 |
| P1-09 | Learning summary at level end | No "what you learned" moment | One line on the victory card from the puzzle definition (e.g. "f⁻¹(13) = 5") | S | P1-08 | Victory card shows the learned rule for each level | `victory.js` | D5 |
| P1-10 | Victory card density | ≈ 9 actions + consent text | Primary: Teruskan; secondary: Main semula, Peta; move leaderboard name form behind "Sertai ranking" | M | — | ≤ 3 visible primary actions; leaderboard flow still works (`engagement-check`) | `victory.js`, `leaderboard/engage.js`, CSS | D5 |
| P1-11 | 1-2 lever route | Upper-deck lever via secret-bank ladder is hard to find | Sign + arrow or move lever beside the line; pin text "Naik ke dek atas" | S | — | New-player route to lever without detour; l2-playthrough passes | `twin-world.js`, `workshop-line.js` | D3 |
| P1-12 | 1-3 opening hazard | First water gap 2 s after spawn | Add a safe 2–3 tile run-up + sign before the creek | S | — | Spawn → first hazard ≥ 4 s at normal run | `inverse-world.js` | D3 |

## P2 — Medium
| ID | Title | Problem | Solution | Effort | Depends | Acceptance | Files | Day |
|---|---|---|---|---|---|---|---|---|
| P2-01 | Celebration System | Static completion | Implement flow in DENAI_ANIMATION_AUDIT (≤ 2.6 s, skippable, reduced-motion) | L | P2-02 | Plays on all 3 puzzle completions; 60 fps on phone profile (`w1-perf`) | `feel.js`, `ui/v4-ui.js`, scenes | D7+ |
| P2-02 | Character animations | No climb/land/cheer frames | Commission/draw climb (4–6), land (2), cheer (4) frames in the same pixel style | M–L (art) | owner art decision | Anims play in context; no frame jitter | `assets/chill-boy`, `core/player.js` | after D7 |
| P2-03 | Unified progress profile | 4 save keys, achievements only for 1-1 | Additive profile v2 that *reads* all keys (no deletion), world %, per-level stars/XP | L | P1-08 | Old saves load unchanged; new fields added; migration test | `progress.js`, stores | after D7 |
| P2-04 | Simple progression | No XP/stars/player level | Stars per level (complete / all coins / no hint) + world % on map; no daily streak pressure | M | P2-03 | Stars visible on map and victory card | menu, victory | after D7 |
| P2-05 | Sound pass | No music, missing ladder/valve/water/purchase SFX | Add short synth SFX + one ambient loop per world, volume in settings | M | — | Each listed action has SFX; mute works | `audio.js` | after D7 |
| P2-06 | Settings cleanup | Policy text in settings | Move to "Privasi" sub-page/link | S | — | Volume controls above the fold at 262 px | `main.html`, CSS | D2 |
| P2-07 | Menu leaderboard offline state | Menu leads with an error string offline | Hide card or show "Main untuk masuk ranking" when unreachable | S | — | No error text on first screen offline | `leaderboard/ui.js` | D2 |
| P2-08 | World 2 | Not playable; slice on unmerged branch | Review `claude/denai-w2-slice`, decide scope, then build with puzzle layer | XL | P1-08 | Owner-approved blueprint; first level playable | — | after D7 |

## P3 — Future
| ID | Title | Solution | Effort | Depends |
|---|---|---|---|---|
| P3-01 | Input-command layer | Abstract keyboard/touch into commands (prerequisite for replays & multiplayer) | M | — |
| P3-02 | Math Race prototype | Seeded shared puzzle, results only; authoritative check of pure models (Durable Objects or managed rooms — needs approval) | XL | P1-08, P3-01 |
| P3-03 | Co-op adventure | Position sync + shared interactables | XL | P3-02 |
| P3-04 | Branch hygiene | Owner decides archive of 9 unmerged branches (obsolete: add-denai-game, denai-leaderboard, l1-redesign, bg-forest, master-plan) | S | owner |
| P3-05 | CI | Run unit + key Playwright tests on PRs | M | — |

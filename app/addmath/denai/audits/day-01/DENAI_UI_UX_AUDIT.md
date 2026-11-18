# DENAI — UI/UX Audit (Day 01)

Screenshots: `shots/` (desktop 1280×720, iPhone 13 landscape/portrait, Android landscape with URL bar 705×262). Component references are to `main.html` ids and `src/v14/ui/*`.

## Journey
| # | Screen | Component | Desktop | Phone | Issues |
|---|---|---|---|---|---|
| 1 | Main menu | `#welcome`, `.title-copy`, `#play-main`, leaderboard card | Clear: logo, MAIN (+ next level label), PETA DUNIA, TETAPAN | OK; portrait shows rotate prompt first (`.rotate-stay`) | Leaderboard card shows "Ranking memerlukan sambungan internet" whenever PlayFab is unreachable — a menu should not lead with an error state (P2). "Rumah kampung" world label is clipped behind the logo (`desktop-01-menu`). |
| 2 | World selection | `menu/world-map.js` (`#world-map-page`) | Map art + 4 world cards + level panel | Cards readable; portrait shows list only | World 1 *is* selected (`.is-selected` = thin pale-gold outline), but **World 2 "Dalam pembangunan" gets a solid gold border** (`world-map.css:22 .wm-card.wm-development`) — the same colour language as "selected/primary", so the unplayable world looks like the main choice (P1, `desktop-02-peta-dunia`). |
| 3 | Mission selection | — | **Does not exist** | — | Structure is World → Level; "mission" is implicit inside a level (P1 information architecture). |
| 4 | Level selection | right panel of world map: 1-1 / 1-2 / 1-3 with Main / Dikunci | Clear lock state ("Selesaikan Level 1-1 dahulu") | OK | No stars/score per level, no replay value shown. |
| 5 | HUD | `.masthead` plaque `1–1 │ 0`, Journal button, pause | Minimal (V4) | OK | Plaque coin number has no icon at phone scale (only digits). |
| 6 | Journal | `#quest-tracker` (journal-open) | Clear parchment modal: mission, status, "? Petunjuk", collection | OK, fits after PR #16 | Contains only the current level; no history of solved missions/learned rules. |
| 7 | Dialogue | `#v4-dialog` | Portrait + 2–3 lines, typewriter, ▼ | Portrait layout stacks correctly | No speaker variety (only Chill Boy + fallback sign) — no NPC exists. |
| 8 | Question interface | in-world machines + 1-1 store receipt `#store-panel` | Store receipt: qty −/+, total, budget, Beli, Tutup, `C(x)` small | OK on 11 viewports | `C(x) = 4x + 6` is the smallest text on the receipt (monospace ≈ 10 px desktop) although it is the learning point (P1). |
| 9 | Hint / explanation | Journal "? Petunjuk" (3 levels) + "Lihat cara kira" after solving | Good scaffolding | OK | Explanation appears only on request; nothing summarises "what you learned" at the end of a level (P1). |
| 10 | Victory | `#complete` `.victory-panel` | Tally, time, record, name form, next-level teaser, 5 buttons | Portrait: panel fills the screen | Too dense: leaderboard consent text + form + teaser + Teroka Semula + Pengembaraan baharu + Peta Dunia + Kongsi + Menu utama (≈ 9 actions). Celebration is a static card (P1/P2). |
| 11 | Pause | `#paused` | Sambung, Mula semula, Tetapan, Menu utama, link back to Add Math | Portrait OK | **Android 705×262: only Sambung + Mula semula visible; Tetapan and Menu utama need an unhinted scroll** (measured: buttons bottom 272/328 px > 262; dialog `overflow-y` scrolls) (P1, `android-bar-05-jeda`). |
| 12 | Settings | `#settings` | Mute, master, SFX + long privacy text ("Simpanan", "Komuniti & papan pendahulu") | Portrait: text-heavy, scrolls | Settings mixes controls with ≈ 150 words of policy; volume sliders below the fold on short phones (P2). |

## Cross-cutting
- **Typography:** two UI fonts in use (system "Trebuchet/Segoe" UI font + monospace for maths/numbers) plus Phaser canvas text in Arial (machine plates, signs). Canvas Arial at 9–12 px is the weakest link on phones (plates "TETAPAN", "TANDA ASAL 13", meter digits).
- **Buttons:** consistent gold primary / parchment secondary (V4). Exceptions: world-map back button ("← Menu") and leaderboard links use a different style.
- **Information density:** gameplay screens are now light (V4); menus at the edges (victory, settings, leaderboard) are heavy.
- **Transitions:** level → victory is a modal over the frozen scene; menu → level is a camera cut. No scene-transition language (fade/iris) — acceptable but feels unfinished next to the polished HUD.
- **Loading:** < 0.5 s locally; no loading screen needed, none exists. Real-network load (1.2 MB Phaser + assets) not measured.

## What makes DENAI feel unfinished (honest list)
1. Static celebrations: a solved puzzle ends with a bubble and a stamp; the level ends with a form-heavy card.
2. One character, no NPCs, no voice/personality beyond short lines.
3. Machines are drawn with tiny canvas text instead of readable diegetic displays.
4. "World 2 in development" is presented more prominently than the playable World 1.
5. Settings/victory carry policy text and many buttons.

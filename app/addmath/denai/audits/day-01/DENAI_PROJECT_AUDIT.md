# DENAI — Project Architecture & Git Status (Day 01 audit, 2026-11-18)

Audit only. No production code changed. Evidence: repository at `origin/main` 35d8a68, browser runs on a local static server (`python3 -m http.server`), PlayFab blocked/stubbed in every automated run.

## 1. Technology stack
| Layer | What is used | Evidence |
|---|---|---|
| Runtime | Static site, native ES modules, **no bundler, no package.json** for the game | `main.html` loads `vendor/phaser-3.90.0.min.js` + `src/v14/game.js` (module) |
| Engine | Phaser **3.90**, `Phaser.CANVAS`, Arcade physics, `Scale.FIT`, canvas = frame CSS size, camera zoom does all scaling | `game.js` ≈ L1525–1535 |
| UI | DOM overlays (HUD, dialogs, Journal, store) styled by **15 stylesheets** | `main.html` L11–29 |
| Audio | WebAudio synthesised SFX (no audio files), settings in `lorong-audio-settings-v1` | `src/audio.js` |
| Persistence | `localStorage` only (see §5) | `save.js`, `progress.js`, `core/campaign-store.js`, `core/inverse-campaign.js` |
| Online | PlayFab **client** API for leaderboard + community count (public Title ID; no secret in client) | `src/v14/leaderboard/playfab.js` |
| Hosting | Cloudflare Pages + Workers build from GitHub `main` (checks green on 35d8a68) | GitHub check runs |
| Tests | Node built-in asserts (`tests/*.test.mjs`) + Playwright scripts (`tests/*.cjs`) run with globally installed Playwright; no CI workflow runs them | `tests/` |

## 2. Entry points & scenes
- `app/addmath/denai/main.html` → `src/v14/game.js` (1 557 lines). Served at `/app/addmath/denai/main`; `/denai/` is the landing page (`/denai/index.html`, `players.js`).
- One `Phaser.Game`, three scenes:
  - `Lorong` = Level 1-1 — class `Rooftop` in `game.js` (+ `environment.js`, `levels/supply-quest.js`, `presentation.js`, `mechanisms.js`, `lift-panel.js`)
  - `Jambatan` = Level 1-2 — `levels/twin-scene.js` (+ `twin-world.js`, `workshop-line.js`, `workshop-model.js`)
  - `GerbangSongsang` = Level 1-3 — `levels/inverse-scene.js` (+ `inverse-world.js`, `sluice-line.js`, `sluice-model.js`)
- Shared: `core/player*.js` (motion, coyote/buffer), `core/view-cull.js`, `core/speech-bubble.js`, `ui/v4-ui.js` (HUD, Journal, dialogue, stamp), `menu/world-map.js`, `menu/progress.js`, `levels/registry.js` (unlock rules).

## 3. Module map (gameplay / UI / maths)
| Concern | Files |
|---|---|
| Maths models (pure, unit-tested) | `levels/supply-quest.js` (C(x)=px+d), `levels/workshop-model.js` (composite), `levels/sluice-model.js` (inverse) |
| Legacy maths kept for save migration / dead paths | `missions.js` (12-variant "7 planks" bank), `lift-panel.js`, `levels/composition.js`, `levels/inverse.js`, `src/level.js` (V13 world; still imported for `MOTION` and `PUZZLES`) |
| Legacy mechanism code | `mechanisms.js` (621 lines: waterworks, b/c/e/g-controls, river selector, number blocks) + `b/c/e/g-control.js/.css`, `waterworks.js`, `moving-platform.js` |
| UI | `ui/v4-ui.js`, `ui/v4.css`, `ui-system.css` (686 lines), `presentation.*`, `dialogue*.js`, `pixel-ui.js`, `victory.js`, `menu/*`, `leaderboard/*` |

**Finding P-1 (P1):** ≈ 1 100 lines of legacy mechanism/mission code are still loaded and partly executed. Example: every new 1-1 run still calls `selectVariant()` and stores `run.missions.lift` (`game.js` L719–735) for a machine that V3 hides (`supply-quest.js` L81). E at the old `probe` (x 2151) and `lift` (x 2484) terminals opened nothing in the browser test (`mechanismOpen:false`) — dead, not broken — but it is maintenance weight and a regression risk.

## 4. Git status (read-only inspection)
- Working branch in this container: `claude/denai-trailer` (2 commits ahead of main: trailer docs/assets). **Untracked:** `design/trailer/denai-v2/` (45 s trailer outputs — owner asked not to commit). Nothing else uncommitted. No stash.
- Local `main` in this container is **stale and diverged** (old unrelated history); always branch from `origin/main`.
- `main` = 35d8a68: V4 UI (PR #15) **merged and deployed**; mobile zoom/fullscreen (PR #16) **merged and deployed**.
- **V4 (`claude/denai-v4-ui`) is fully merged** into main (ancestor check passed) and live.

Unmerged remote branches (9):
| Branch | Ahead | Content | Status |
|---|---|---|---|
| `claude/denai-w2-slice` | 4 | World 2 "Lembah Parabola" blueprint + **Stesen A vertical slice** in a test room, master plan, Kenney industrial/farm packs | **Relevant for next phase — review before building World 2** |
| `claude/denai-master-plan` | 2 | master plan + World 2 blueprint (subset of w2-slice) | superseded by w2-slice |
| `claude/denai-w1-environment` | 5 | World 1 visual overhaul + w2 commits | likely superseded by V3 env; verify |
| `claude/denai-l1-redesign` | 12 | older 1-1 Phase C redesign + map V2 designs | superseded by W1 V3 |
| `claude/denai-map-masterplan-v2` | 10 | world-map V2 designs (design only) | design reference |
| `claude/denai-bg-forest` | 1 | single forest background | likely superseded |
| `claude/denai-trailer` | 2 | trailer source/storyboard/CapCut assets | docs only |
| `add-denai-game`, `claude/denai-leaderboard` | 15/17 | earliest history (pre-PR #1) | obsolete |
24 other branches are merged. Recommendation: owner decides which to archive; nothing deleted today.

## 5. Save data (not cleared, not migrated)
| Key | Owner module | Content |
|---|---|---|
| `denai-save-v14` | `save.js` | Level 1-1 run (checkpoint, quest, coins, legacy mission id) |
| `denai-profile-v1` | `progress.js` | profile: 1-1 completions/best, coin & secret ids (1-1 only), achievements, variants |
| `denai-campaign-v1` | `core/campaign-store.js` | Level 1-2 (and generic levels) completions/run |
| `denai-l3-campaign-v1` | `core/inverse-campaign.js` | Level 1-3 |
| `denai-records-v14` | legacy, migrated into profile | — |
| `denai-l1-last-variant` | supply quest | variant rotation |
| `denai-lb-*`, `denai-community-cache` | leaderboard | name, consent, device id, submitted bests |
| `denai-rotate-dismissed` | orientation | session only |
Fresh play creates `denai-save-v14`, `denai-profile-v1`, `denai-lb-device`, `denai-l1-last-variant` (verified on 4 viewports). Old-save migration is covered by `w1-progression` (passed today).

**Finding P-2 (P1):** progress is split across 4 keys with 3 different shapes; achievements and coin/secret collections exist only for 1-1. This blocks a unified XP/stars/world-percentage system and any future cloud sync. Not a data-loss bug today.

## 6. Tests executed today (all actually run)
| Suite | Result |
|---|---|
| 8 unit tests (`analytics, inverse, progress-course, sluice, supply-quest, twins, workshop-v3, workshop`) | PASS |
| `l1-playthrough` / `l2-playthrough` / `l3-playthrough` (keyboard, full levels) | PASS (72 s / 71 s / 109 s, 0 errors) |
| `w1-progression` (fresh + old-save profile, 1-1→1-3, "Dunia 1 selesai") | PASS |
| `w1-mobile-check` (11 viewports × 3 levels) | PASS, 0 layout issues |
| `rc-check`, `menu-check`, `engagement-check` | PASS |
| `w1-perf` (CPU throttled phone profile + desktop) | PASS; desktop ≈ 59 fps, 0 frames > 33 ms at sampled spots |
| Add Math notes app `tests/run-all.sh` (content validator, 11 mutation tests, notes validator, regressions) | PASS (0 errors, 6 warnings, 93 items flagged for human review) |
Not run: `view-cull-check`, `l3-perf`, `render-maps`, `w1-env-check`, `w1-gameplay-shots`, `bg-theme`, `banner`, `traversal`, `landing-count`, `analytics-check` (passed on 2026-11-17, no code change since).

## 7. Browser diagnostics (journey script, 4 viewports + landing)
- Console: only `net::ERR_FAILED` = the deliberately aborted PlayFab request. No page errors, no 4xx/5xx, no missing assets. Landing `/denai/`: clean.
- Ready time (local): 0.39–0.45 s to playable menu. JS heap after menu → 1-1 → dialogue → Journal: 16–18 MB.
- Real-network performance, real devices and real PlayFab were **not** tested.

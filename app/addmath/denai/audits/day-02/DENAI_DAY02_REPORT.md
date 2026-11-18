# DENAI — Day 02 report: gameplay polish & player experience (2026-11-19)

Branch `claude/denai-day02-polish` from `origin/main` 35d8a68. Not merged, not deployed.
PlayFab was blocked/stubbed in every browser run: real online leaderboard behaviour is **not** verified.

## 1. Implementation summary
| Phase | Backlog | Change | Why |
|---|---|---|---|
| 1 Mobile pause | P1-01 | Short-landscape layout (`max-height:420px` + landscape): Sambung on top, Mula semula / Tetapan / Menu utama in one row, 40 px buttons, smaller ribbon; scroll fade if anything still overflows. Desktop & portrait untouched. New pause assertion in `w1-mobile-check` (visible without scrolling, ≥ 36 px, no overlap). | At 705×262 two of four actions were hidden below the fold with no hint. |
| 2 World map | P1-02 | Gold reserved for selected/playable; in-development = slate blue (border, badge, info box); coming-soon = grey; selected non-playable world uses a pale outline. | World 2 (not playable) had a solid gold border and looked like the main choice. |
| 3 Level 1-1 hook | P1-05 | New quest step `go` (derived from `found === false`, **no save change**): pin "Ke Stesen Kayu — jambatan perlu dibaiki." from the start + 3 hints; two non-blocking lines over Chill Boy at spawn ("Jambatan di hadapan rosak…", "Kita kena cari papan yang cukup tanpa melebihi bajet."). Bridge discovery dialogue kept. | The objective appeared only at x ≈ 2470. |
| 4 Level 1-2 route | P1-11 | Sign "Laluan rahsia ↑" → "Dek atas ↑" (the required route); new sign post "← Dek atas · tuas" at the yard; bobbing gold ▼ over the ladder top and the lever only while the order must be changed; pin "Naik ke dek atas · tukar susunan mesin…"; hint 2 points to the signed ladder. Secret notes, coins, lever and logic unchanged. | Players did not know the lever was up the "secret" ladder. |
| 5 Level 1-3 opening | P1-12 | The 54-unit pit at x 648–702 (reached ≈ 1.9 s after spawn, instant fall) is now ground; a one-tile step remains. Warning post "Awas · lompat" before the first real gap (x 1296). | Unfair early death; no telegraph. |
| 6 Settings | P2-06 | Audio controls first; the full saving/privacy text (unchanged words) folded into "Simpanan & privasi" (`<details>`); compact grid rows on short landscape. | Policy text pushed controls off short screens. |
| 7 Offline menu | P2-07 | Menu card offline text "Ranking memerlukan sambungan internet." → "Main dahulu untuk sertai ranking." Online paths, pending-result retry and the ranking dialog's own connection message unchanged. | First screen opened with an error. |

## 2. Files modified
- `app/addmath/denai/main.html` — settings section → `<details id="save-info">`
- `app/addmath/denai/src/v14/ui/v4.css` — pause (short landscape), settings fold + compact layout
- `app/addmath/denai/src/v14/menu/world-map.css` — state colours
- `app/addmath/denai/src/v14/levels/supply-quest.js` — `go` step, intro bubbles, `bubble(…, ms)`
- `app/addmath/denai/src/v14/levels/workshop-line.js` — sign post, guide markers, swap text/hint
- `app/addmath/denai/src/v14/levels/twin-scene.js` — "Dek atas ↑" sign
- `app/addmath/denai/src/v14/levels/inverse-world.js` — `stream-approach-east` width 162 → 216
- `app/addmath/denai/src/v14/levels/inverse-scene.js` — warning post
- `app/addmath/denai/src/v14/leaderboard/engage.js` — offline wording
- `app/addmath/denai/tests/w1-mobile-check.cjs` — pause assertion
- New: `app/addmath/denai/audits/day-02/DENAI_DAY02_REPORT.md`, `audits/day-02/shots/*.jpg`

## 3. Measured before → after
| Check | Before (main) | After |
|---|---|---|
| Pause at 705×262: actions visible without scroll | 2 / 4 | **4 / 4** (all 40 px, one screen) |
| Pause at 11 mobile viewports (new assertion) | — | 0 issues |
| Level 1-1: objective visible | at x ≈ 2470 (~9 s of running) | **pin at 1.3 s**, line 1 at ~0.7 s, line 2 at ~4.5 s; player moved while bubbles showed (no input lock) |
| Level 1-2: route cues to lever | 1 sign saying "Laluan rahsia" | signed ladder + yard sign + 2 markers after the first run; markers hidden before it (verified false/false → true/true) |
| Level 1-3: spawn → first lethal gap (hold right, jump when blocked) | ≈ 1.9 s (pit) | **4.5 s**, no death on the way, gap signed |
| Settings at 705×262: audio controls visible | mute + master only (SFX at 277 px > 262) | mute 114, master 160, SFX 206 px — all visible; privacy folded |
| Settings persistence (master volume 37 → reload) | — | 37 kept (desktop and 705×262) |
| Menu offline card | "Ranking memerlukan sambungan internet." | "Main dahulu untuk sertai ranking." |

## 4. Tests executed (all run on this branch, PlayFab blocked)
| Test | Result |
|---|---|
| Unit: analytics, inverse, progress-course, sluice, supply-quest, twins, workshop-v3, workshop | 8/8 PASS |
| l1-playthrough / l2-playthrough / l3-playthrough | PASS (79 s / 78 s / 116 s wall; 72 s / 71 s in-game) |
| w1-progression (fresh + old save) | PASS |
| w1-mobile-check (11 viewports × 3 levels + new pause check) | PASS, 0 issues |
| rc-check, menu-check, engagement-check, w1-perf | PASS |
| l1-v3-check, l2-check, l3-check (extra) | PASS |
| Day-02 verification script (screens + measurements above) | done, 0 page errors |

## 5. Screenshots (`shots/`)
01 desktop menu (offline card) · 02 desktop world map · 03 pause 705×262 · 04 Level 1-1 opening (pin + bubble) · 05/05b Level 1-2 lever navigation (signs + markers) · 06/06b Level 1-3 opening and warning post · 07 settings desktop · 07b settings 705×262.

## 6. Known issue (pre-existing, not fixed, needs a real device)
In headless Chromium at short heights (262/300 px), the Settings dialog opened **directly from the main menu** is modal and on top (hit-testing reaches it) but is not painted in screenshots; after opening the world map once it paints normally (07b). Reproduced identically on `origin/main`, so it is not a regression. It may be a headless rendering quirk; verify on a real Android phone before treating it as a bug.

## 7. Remaining observations
- Level 1-1: the new pin sits over the canvas label "Rumah kampung" at spawn (cosmetic).
- Level 1-2: the area banner "Laluan Rahsia" (zone name) still appears when climbing to the deck — the zone is genuinely the secret bank; left as is.
- Copy is Malay and new; owner review recommended.

## 8. GO / NO-GO
**CONDITIONAL GO** for review/merge: all acceptance criteria measured above pass and no regression was found. Conditions: owner checks the new Malay lines, and the Settings paint quirk (§6) is checked on a real phone. Do not merge or deploy without owner approval.

# DENAI — Master System-Wide Audit

> **Date:** 2026-11-23 · **Branch:** `claude/denai-hub-phase1` · **HEAD:** `d06921d` (feat(denai-hub): Phase 1 — real learning progress)
> **Scope:** the whole DENAI project: Learning Hub (`/denai/hub/`), Add Maths notes app (`/app/addmath/`), the DENAI Phaser game (`/app/addmath/denai/`), the landing page (`/denai/`), hosting config.
> **Method:** read-only. The project's own validators and tests were run; nothing was reset, committed, pushed, merged or deployed, and no product code was changed during this audit. Game browser checks need an HTTP server on `:8790`, which this environment does not allow to be started, so they were run **unmodified** through a scratchpad Playwright preload that serves the repository from disk to `denai.test:8790` (the same technique as `denai/hub/tests/serve.cjs`). Screenshots are in the session scratchpad (`evidence/`), not in the repository.

Status key: **DONE** implemented and verified by a test or by direct inspection · **PARTIAL** implemented but incomplete · **NOT STARTED** · **FAIL** implemented but failing · **UNVERIFIED** cannot be confirmed from current evidence. Priority: **P0** blocks release · **P1** should be fixed before or right after release · **P2** improvement.

---

## 0. Executive summary

| Area | Verdict |
|---|---|
| Learning content (18 bab, 59 subtopik, 275 contoh, 471 soalan) | **DONE** for automated validation; every DSKP standard covered; all answer keys independently re-derived where machine-checkable and accepted by the real checker. No human academic review yet (106 items listed). |
| Learning Hub (8 routes, 4 tabs, mastery, hints, revision) | **DONE**; hub smoke **217/217** after fixing the two test defects (§8.2). Committed and pushed on `claude/denai-hub-phase1`; **not on `origin/main`**. |
| Notes app | **DONE** (458/458 browser checks on all 18 chapters). |
| DENAI game (World 1, 3 levels) | Unit tests 11/11 pass. **FIXED (2026-11-23, after this audit):** the menu's community card covered **PETA DUNIA** and **TETAPAN** on desktop/tablet (on `origin/main` since 18 Nov); one-line fix in `leaderboard/engage.js`. `rc-check` still fails later on stale leaderboard-tab steps (test drift, 8.4). |
| Backend / accounts / sync | **NOT STARTED** for learning data (browser `localStorage` only). The only backend is PlayFab, used by the game leaderboard with an anonymous device ID. |
| Release state | `origin/main` still serves the Learning Hub v1 (demo data). Phase 1 is committed on this branch only; Hub v2 and all content work are uncommitted. |

---

## 1. Git and project structure

| # | Item | Status | Evidence | Actual problem | What to do | P |
|---|---|---|---|---|---|---|
| 1.1 | Branch / HEAD | DONE | `claude/denai-hub-phase1` @ `d06921d`, tracking `origin/claude/denai-hub-phase1` (up to date). `origin/main` = `87e1965` (PR #17 + #18, Learning Hub v1). The **local** `main` branch is stale at `86ac7f1` (no `denai/hub/` at all); do not merge or compare against it without `git fetch`. | — | — | — |
| 1.2 | Uncommitted work | DONE (after audit) | `git status`: 56 modified + 19 untracked files (1578+/638−). | Three layers are mixed in one working tree: **(a)** commit `d06921d` Hub Phase 1 (core/store, events, learner, mastery, keys); **(b)** earlier uncommitted Hub v2 work: `denai/hub/{PLAN.md, hub.css, index.html}`, `js/app.js`, `js/data.js`, `js/ui.js`, `js/core/*`, `js/pages/*`, `js/pages/written.js` (new), `PRODUCT-BLUEPRINT.md`, `UX-PLANNING.md` (new), `tests/core.test.mjs`; **(c)** this session's content work: all of `app/addmath/**` (T5 Bab 7–8, T5 V3, fixes, publication of T5, validators/tests), `denai/hub/PRODUCT-ROADMAP.md` (status section), `denai/hub/tests/hub-smoke.cjs`. Committed on owner instruction as `70b5870` (Hub v2), `2563725` (content), `5143a8a` (this audit) and pushed to `origin/claude/denai-hub-phase1`; follow-up fixes committed after. | Owner decision on merge to `origin/main`. | P1 |
| 1.3 | Game code untouched | DONE | `git diff --stat -- app/addmath/denai` is empty; last game commit `0e7b20a`. Hub smoke: "No game save key created or changed". | — | — | — |
| 1.4 | Modules | DONE | `/denai/` landing (`index.html`, `denai.js`, `players.js`); `/denai/hub/` Learning Hub; `/app/addmath/` notes app (`src/content`, `src/notes`, `src/screens`, `tests`); `/app/addmath/denai/` Phaser 3.90.0 game (`src/v14`, Kenney assets, `tests`); hosting `_headers`, `_redirects` (Cloudflare Pages). | — | — | — |
| 1.5 | Planning documents | PARTIAL | `denai/hub/`: `PLAN.md`, `PRODUCT-BLUEPRINT.md` (131 KB), `PRODUCT-ROADMAP.md`, `UX-PLANNING.md` (58 KB); `app/addmath/PROGRESS.md`. | Four overlapping plan documents in the hub folder; two are untracked. | Keep `PRODUCT-ROADMAP.md` (status) + `PROGRESS.md` (content) as the sources of truth; archive the rest after commit. | P2 |

## 2. Content system

All numbers from the project's own tools: `bash app/addmath/tests/run-all.sh` (validate-content, validator-selftest, validate-notes, regression, checker-roundtrip) and `node app/addmath/tests/content-audit.mjs`.

| # | Item | Status | Evidence | Actual problem | What to do | P |
|---|---|---|---|---|---|---|
| 2.1 | Coverage: 18 bab / 59 subtopik / 275 contoh / 471 soalan | DONE | `validate-notes`: **Ralat 0 · Amaran 0**; every SP of every chapter has concept + worked example + ≥1 question (coverage tables in `app/addmath/tests/last-notes-report.md`). | — | — | — |
| 2.2 | DSKP mapping (bab, SK, SP, IDs) | DONE | `validate-notes` structural checks (added in the acceptance phase): subtopic SK exists in DSKP, its SP list equals the SK's learning standards, section/example/question SP tags belong to the subtopic (application items may also name prerequisite SPs of the same chapter), question IDs follow `<bab>.<n>-NN`, statuses consistent. Mutation-tested. | DSKP was read page by page for every chapter except T4 Bab 3 (text layer only, no symbols). `curriculum.js` `VERIFICATION` still marks all but T4-1 as `'text'`, although `PROGRESS.md` records visual verification. | Update `VERIFICATION` to match `PROGRESS.md`. | P2 |
| 2.3 | Answer keys | DONE | 321 of 369 auto questions are re-derived by independent solvers (`tests/triangle.mjs`, `tests/solvers.mjs`); the other 48 are conceptual MCQs (`check: 'manual'`). | Conceptual MCQs and reasoning answers cannot be machine-checked. | Academic review (2.7). | P1 |
| 2.4 | Answer checker | DONE | `checker-roundtrip`: **474 answers and 648 misconception responses** typed into the real `checkSingle` behave as authored; hub smoke accepts the key on all 59 pools (369 questions) and all 105 written auto parts. | — | — | — |
| 2.5 | Misconception feedback | PARTIAL | `content-audit`: 365/369 auto questions. | 4 without targeted feedback (no realistic exact wrong value): `t4-4.4-01`, `t4-10.2-05`, `t5-2.1-02`, `t5-5.2-07`. | Optional per-question `hint` text. | P2 |
| 2.6 | Progressive hints | PARTIAL | `content-audit`: **95/471** questions qualify (hub rule D7: ≥3 solution steps, never the last two). | 376 questions have 1–2 step solutions, so no hints in the hub. Every question still has a full worked solution after answering. | Lengthen worked solutions for the most-used pools, or add an explicit `hints` field (needs a small hub change). | P1 |
| 2.7 | Human academic review | NOT STARTED | `review.mathReviewed` is `null` on every question of all 18 chapters; 106 items listed in `last-notes-report.md` ("Perlu semakan manusia"). | Owner accepted all content on 2026-11-23 (product decision); T5 is now `published` with `ownerApproved` recording that decision, **not** a mathematical review. Worked examples were AI-reviewed only. | Schedule a teacher review of the 106 items and of worked examples; record it in `mathReviewed`. | P1 |
| 2.8 | Mathematical errors | DONE (none open) | AI read-through of all 275 examples and 106 manual items (2026-11-23); validators. Fixed earlier: 2 shadowed misconception feedbacks, 3 questions that depended on a neighbouring question. | — | — | — |
| 2.9 | T4 Bab 10 data | PARTIAL | `PROGRESS.md`: illustrative data, labelled; DSKP asks for authentic data. | Owner decision still open. | Replace with DOSM CPI data or keep the label. | P2 |
| 2.10 | Legacy Bab 1 bank | DONE | `validate-content` + `validator-selftest` (11/11 mutations caught) on `src/content/questions/bab1.js`. | Two question systems coexist (legacy Bab 1 lessons + notes system). | Retire the legacy lessons once nothing links to them. | P2 |

## 3. UX audit (student journeys)

Evidence: `denai/hub/tests/hub-smoke.cjs` runs each journey for real at desktop 1280, tablet 820 and phone 390; screenshots `evidence/hub/*.png` (11 routes × 3 widths, none with horizontal overflow or console errors).

| # | Journey | Status | Evidence | Friction / problem | What to do | P |
|---|---|---|---|---|---|---|
| 3.1 | First-time user | DONE | "Utama: new learner view from an empty record", one primary action "Mula belajar" → note 1.1 (`hub-m.png`). | Landing `#/` and Utama `#/hub` are two different "home" pages; a new learner meets the landing first. | Keep; owner decision D-series already made. | — |
| 3.2 | Returning user / Sambung belajar | DONE | "Utama: one primary action, Sambung belajar", "resumes the set at question 2". | — | — | — |
| 3.3 | Explore chapters | DONE | Tingkatan 4 path 10 chapters, Tingkatan 5 path 8 chapters, chapter path with mastery (`bab-d.png`, `bab_t5-8-d.png`). | Chapter page offers 5 entry points per subtopic (Mula belajar + Nota/Contoh/Latihan/Soalan bertulis); dense on phone. | Consider collapsing the four chips behind the primary action on phone. | P2 |
| 3.4 | Open notes / worked examples | DONE | All 275 examples, formulas, mistakes, visuals present on 59/59 pages; step-by-step mode works. | — | — | — |
| 3.5 | Answer exercises / feedback / hints | DONE | Two attempts, misconception feedback, hints never show the last two steps, hinted answers not counted as first-try. | "Latihan (6)" tab label next to "Soalan 1 daripada 5" (sets of 5 drawn from the pool) reads as inconsistent (`latihan_t5-7_7_2-m.png`). Hints absent on most questions (2.6). | Label as "6 soalan dalam bank · set 5". | P2 |
| 3.6 | Revision | PARTIAL | Revision list from real activity; chapter revision sheet `#/bab/<id>/ulang-kaji`. | Merely opening a note puts it in "Perlu diulang kaji" (`kemajuan-d.png` after one note visit); wrong answers do not return later (no spaced review queue, roadmap M-17). | Only list notes opened > N minutes; add review queue. | P2 |
| 3.7 | Game launch and return | PARTIAL | "Game tab: Play opens the existing game route"; Phaser boots. | Return path from game to hub relies on the browser back button / game menu; no deep link back. Game menu World Map button blocked on desktop (7.2). | Fix 7.2; optional "Kembali ke Learning Hub" link in the game menu (needs owner approval: game change). | P1 |
| 3.8 | View learning progress | DONE | Kemajuan: mastery per chapter, finished sets, recent activity, storage notice, erase with confirmation. | Very long page on phone (4 056 px); all 18 chapters listed even if never started. | Collapse untouched chapters. | P2 |
| 3.9 | Notes app vs Hub | PARTIAL | Both are live: `/app/addmath/` (Fahami/Ulang Kaji/Latihan) and `/denai/hub/`. | Two learning front-ends with **separate progress records**; a student practising in the notes app gets no mastery in the hub. Roadmap decision M-5 still open. | Owner decision M-5: make the hub the student front-end, keep notes app as reference/owner tool. | P1 |

## 4. UI audit

| # | Item | Status | Evidence | Problem | What to do | P |
|---|---|---|---|---|---|---|
| 4.1 | Layout at 1280 / 820 / 390 | DONE | `shots.cjs`: 33 renders, overflow 0, no console errors; notes smoke: no horizontal overflow on any Fahami/Ulang Kaji/Latihan page (desktop + phone). | — | — | — |
| 4.2 | Typography / colour / components | DONE | Single token system in `hub.css`; screenshots consistent (cream surface, navy text, amber primary). | — | — | — |
| 4.3 | Mathematical readability | DONE | KaTeX self-hosted with MathML; 0 `katex-error` on all pages (notes smoke, notes-browser). Bab 8 readouts rounded to 3 d.p. | — | — | — |
| 4.4 | Contrast | DONE | Hub smoke WCAG AA probe: all 14 tokens ≥ 4.91:1. | — | — | — |
| 4.5 | Empty / error states | DONE | 404 route `tiada-laluan-*.png` ("Halaman ini tidak wujud" + two exits); empty Kemajuan states; storage-blocked fallback in `core/store.js`. | — | — | — |
| 4.6 | Loading states | PARTIAL | `.loading` placeholder in `#view` (hub smoke waits on it). | No visual evidence of slow-network behaviour; KaTeX/visual-heavy notes (up to 5 100 px on phone) not tested on throttled CPU. | Throttled-device check. | P2 |
| 4.7 | Accessibility beyond contrast | UNVERIFIED | Visual alt texts enforced by validator; aria labels present; focus scroll padding tested. | No automated a11y engine (axe) or screen-reader test has been run; keyboard-only journey not tested end to end. | Run axe + keyboard pass (roadmap A-1, A-3). | P1 |
| 4.8 | Game menu layout | FIXED | §7.2. | — | — | — |

## 5. Functional audit

| # | Function | Status | Evidence | Problem | What to do | P |
|---|---|---|---|---|---|---|
| 5.1 | Routes and links | DONE | Hub smoke: 278 hub routes visited, none broken; notes validator: every internal link in notes resolves (new check). | — | — | — |
| 5.2 | Answer checking | DONE | 2.4. | — | — | — |
| 5.3 | Scoring / set summary | DONE | "Completion summary: 4/5", attempts recorded, invalid input not counted. | — | — | — |
| 5.4 | Mastery calculation | DONE (rules) / UNVERIFIED (calibration) | `core/mastery.js`; `core.test.mjs` 18/18; hub smoke: note completion never changes mastery, hinted answers not first-try. | Thresholds (3 / 5 / 2 days) are hypotheses (roadmap O16); no pilot data. | Pilot with students. | P1 |
| 5.5 | Progress persistence | DONE (local) | Reload keeps notes, sets, active set; erase keeps game saves. | Browser-only (6). | — | — |
| 5.6 | Demo mode isolation | DONE | "Demo actions never write the real record". | — | — | — |
| 5.7 | Note-visit de-duplication | DONE | `core/events.js` 30-minute rule; test-ordering defect fixed (8.2). | — | — | — |

## 6. Backend and persistence

| # | Capability | Status | Evidence | Reality | What to do | P |
|---|---|---|---|---|---|---|
| 6.1 | Authentication | NOT STARTED | No auth code in hub or notes app (`grep` for login/auth/fetch: only game leaderboard). | — | Decide whether accounts are needed (minors, PDPA 2010). | P1 (decision) |
| 6.2 | Student accounts | NOT STARTED | — | Anonymous. | — | P1 |
| 6.3 | Database | NOT STARTED (learning) | Only external API: PlayFab title `1FD1D5` (`app/addmath/denai/src/v14/leaderboard/playfab.js`), `LoginWithCustomID` with a device ID; CSP `connect-src 'self' https://1fd1d5.playfabapi.com`. | Leaderboard/player count only; no learning data leaves the browser. | — | — |
| 6.4 | Persistent progress | PARTIAL | Hub: `localStorage` `denai-hub-progress-v1` (`core/store.js`, sanitised, quota fallback to memory). Notes app: `addmath-progress-v1` (`src/utils/storage.js`). Game: `denai-save-v14`, `denai-profile-v1`, `denai-records-v14`, `denai-campaign-v1`, `denai-l3-campaign-v1`. | Real persistence, but per browser only; clearing site data loses everything (the UI says so). | — | — |
| 6.5 | Answer and score storage | PARTIAL | Attempt events (question id, try, ok, hint) in the hub record; no free text stored. | Local only. | — | — |
| 6.6 | Session management | NOT STARTED | — | Not applicable without accounts. | — | — |
| 6.7 | Cross-device sync | NOT STARTED | — | Changing device = starting over. | Requires 6.1–6.3. | P2 |
| 6.8 | Data recovery / export | NOT STARTED | No export/import in hub (`grep`). | A cleared browser cannot be restored. | Export/import JSON of the hub record (no backend needed). | P1 |
| 6.9 | Security headers | DONE (config) / UNVERIFIED (live) | `_headers`: CSP, HSTS, nosniff, X-Frame-Options DENY, Permissions-Policy, COOP. | Not verified against the live site in this audit (no network check). | Check live headers. | P2 |
| 6.10 | Mock vs real data | DONE | Hub demo personas only behind `?demo=1` with banner; real mode never shows demo data (hub smoke). Game leaderboard has `mock.js` used by tests only. | — | — | — |

## 7. Game integration

| # | Item | Status | Evidence | Problem | What to do | P |
|---|---|---|---|---|---|---|
| 7.1 | Game code, Kenney assets, character, missions | DONE (unchanged) | No diff under `app/addmath/denai`; 11/11 game unit tests pass (`analytics`, `cistern`, `inverse`, `progress-course`, `puzzle-session`, `puzzles`, `sluice`, `supply-quest`, `twins`, `workshop-v3`, `workshop`). | — | — | — |
| 7.2 | Main menu: World Map and Settings buttons | **FIXED** | Before: `menu-check`, `rc-check`, `engagement-check` stopped with "`<aside id="community">` subtree intercepts pointer events"; centre of `#world-map-btn` covered at 1280×760, 1440×900, 1024×768 (`evidence/game-menu-*.png`, first run). Cause: `engage.css` makes the card `position:fixed` on wide landscape screens, but it stayed inside the transformed `.title-copy`, so it was pinned over the buttons (introduced by `192adc8`). Fix: `installEngage()` now re-parents the card to `#welcome` for both fixed layouts (it already did for short landscape phones). After: buttons uncovered at all four sizes, card bottom-right; `menu-check`, `engagement-check`, `landing-count-check`, `day05-gameplay-check` (11 viewports), `w1-mobile-check` (10 viewports) pass. | — | Deploy with the next release. | — |
| 7.3 | Save data | DONE | Unit tests (save migration, forged/corrupt saves); hub smoke: hub never writes game keys; "Erase my progress" leaves game save. | — | — | — |
| 7.4 | Leaderboard / analytics | DONE (local fakes) | `analytics-check` PASS (default build sends nothing; GPC respected), `landing-count-check` PASS, `puzzle-reload-check` PASS. `engagement-check` FAIL only because of 7.2. | Production PlayFab not contacted (by design of the tests). | — | — |
| 7.5 | Game progress ≠ mastery | DONE | `core/mastery.js` uses exercise attempts only; `keys.js` lists game keys as read-only and the hub never reads them; hub smoke "Game tab: game records kept apart from mastery". | — | — | — |
| 7.6 | Hub shows game progress | NOT STARTED | Roadmap I-1; hub Game tab lists worlds/missions from static data (`js/data.js` `GAME`, `WORLDS`). | Students do not see which levels they finished from the hub. | Read-only game status (roadmap I-1). | P2 |
| 7.7 | Game content beyond World 1 | NOT STARTED | `WORLDS`: Dunia 1 playable, Dunia 2 "development", 3–4 "soon". Only T4 Bab 1 has a game. | 17 of 18 chapters have no mission. | Content/game roadmap. | P2 |
| 7.8 | Full playthroughs | DONE | `l1/l2/l3-playthrough` and `w1-progression` pass with real keyboard input from a fresh profile; `w1-mobile-check` passes touch-only on 10 viewports. | Playthroughs enter levels without the desktop World Map button, so they do not hit 7.2. | — | — |

## 8. QA — test runs on 2026-11-23

| Suite | Result | Notes |
|---|---|---|
| `bash app/addmath/tests/run-all.sh` | **PASS** | validate-content OK · 11/11 mutations caught · validate-notes 0 errors 0 warnings · all regressions pass (incl. LP/kinematics solvers) · checker round trip 474 / 648 |
| `node app/addmath/tests/notes-smoke.cjs` | **PASS 458/458** | all 18 chapters, desktop + phone, after T5 publication |
| `node app/addmath/tests/notes-browser.cjs` | **PASS 18/18** | Bab 1 interactions (ported to the V3 pages in the acceptance phase) |
| `node denai/hub/tests/core.test.mjs` | **PASS 18/18** | |
| `node denai/hub/tests/hub-smoke.cjs` | **PASS 217/217** (after fixing 8.2; first run had 8 test-side failures) | see 8.2 |
| `denai/hub/tests/shots.cjs` (11 routes × 3 widths) | PASS | overflow 0, no console errors |
| Game unit tests (11 × `*.test.mjs`) | **PASS 11/11** | |
| Game browser checks (via harness, unmodified tests) | first run **8 PASS / 3 FAIL**; after the 7.2 fix `menu-check` and `engagement-check` PASS, `rc-check` FAIL on test drift (8.4) | PASS: `analytics-check`, `landing-count-check`, `puzzle-reload-check`, `l1-playthrough`, `l2-playthrough`, `l3-playthrough`, `w1-mobile-check` (10 viewports), `w1-progression` (fresh profile through all of World 1; needs `NODE_OPTIONS=--require <preload>` because it spawns child processes), `day05-gameplay-check` (11 viewports). FAIL: `menu-check`, `rc-check`, `engagement-check`, all on the same root cause, 7.2. Not run: `bg-theme`, `feel`, `l1-banner`, `l1-v3`, `l2`, `l3`, `l3-cistern`, `view-cull`, `w1-env`, `w1-traversal`, perf probes, screenshot generators (UNVERIFIED this session). |

### 8.2 Hub smoke failures (test defects, not product defects) — FIXED
1. **"Note visit recorded once" / "Reload within 30 min does not double-count the visit"** (desktop, tablet, phone = 6 failures). The acceptance-phase edit added two public T5 note visits (`#/nota/t5-2/2.1`, `#/nota/t5-8/8.3`) earlier in the same journey, so the record holds 3 `note-open` events when the test expects 1. Fix: count `note-open` events for `t4-1/1.1` only, or move the T5 visits after the count.
2. **"Kemajuan: every Tingkatan 5 chapter listed with its status"** (desktop, phone). Asserts 8 `.prog-ch.is-soon` T5 rows; after publication T5 chapters are no longer "soon". Fix: assert 8 T5 rows with no `is-soon`.
Both fixed after the audit as described; hub smoke 217/217.

### 8.4 `rc-check` test drift
After the 7.2 fix `rc-check` passes the menu and World Map steps but times out on `[data-lb-tab="classic"]` (line 62). Commit `192adc8` ("simplify leaderboard") intentionally removed the two leaderboard tabs; the release-candidate test still expects them. Not a product defect. **P1:** update `rc-check` to the single-board leaderboard (owner to confirm which board is current: `0e7b20a` submits to the existing PlayFab board).

### 8.3 Gaps without tests
- No automated accessibility engine / keyboard-only journey (4.7).
- No CI: suites are run by hand (roadmap M-22).
- No throttled-device performance test for the hub/notes (game has `w1-perf`, `l3-perf`).
- No live-site check of headers, redirects (`/app/addmath/denai/main` pretty URL) or caching.

---

## 9. Prioritised execution roadmap (from this audit)

**P0 — before any release**
1. ~~Game menu overlap (7.2)~~ FIXED. ~~Hub smoke test defects (8.2)~~ FIXED. ~~Commit and push (1.2)~~ DONE.
2. Owner decides the merge of `claude/denai-hub-phase1` into `origin/main` (currently Hub v1 with demo data; local `main` is stale, fetch first). Until then the fixes, the new chapters and Hub v2 are not live.
3. Update `rc-check` for the simplified leaderboard (8.4) so the release-candidate check is green again.

**P1 — release hardening**
4. Academic review of the 106 manual items and the worked examples; record `mathReviewed` (2.7).
5. Owner decision M-5: one student front-end (hub) vs notes app; unify or clearly separate progress (3.9).
6. Export/import of the hub learning record (6.8); decide on accounts/sync policy with PDPA review (6.1).
7. Accessibility pass: axe + keyboard + screen reader (4.7).
8. Progressive hints for more questions (2.6).
9. Pilot with students to calibrate mastery thresholds (5.4).

**P2 — after release**
10. Revision noise and review queue (3.6); Latihan label (3.5); phone density on chapter page and Kemajuan (3.3, 3.8).
11. Read-only game progress in the hub (7.6); game return link (3.7).
12. CI for all suites; throttled-device checks; live header check (8.3, 6.9).
13. Housekeeping: `VERIFICATION` map, plan-document consolidation, legacy Bab 1 bank, T4 Bab 10 data decision (2.2, 1.5, 2.10, 2.9).
14. Worlds 2–4 and missions for further chapters (7.7).

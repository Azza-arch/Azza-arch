# DENAI Learning Hub — audit and implementation plan

Branch: `claude/denai-learning-hub`. Read this first in any new session.

## Phase 0 audit (what already exists)

| Area | Where | Notes |
|---|---|---|
| Hosting | Cloudflare Pages, static, no build step | `_headers` (CSP, `/denai/*` no-cache), `_redirects` |
| Stack | Hand-written HTML/CSS/ES modules | No framework, no bundler. Keep it that way. |
| DENAI landing | `/denai/` (`denai/index.html`, `denai.css`, `denai.js`, `players.js`) | Game marketing page. Palette + fonts (Lilita One / Nunito) from the game's Kenney UI. |
| DENAI game | `/app/addmath/denai/main` (`main.html`, `src/v14/…`, Phaser 3.90 in `vendor/`) | World 1 (Fungsi): Level 1-1 kos `C(x)=4x+6`, 1-2 gubahan, 1-3 songsang. **Do not touch.** |
| Game storage | localStorage `denai-save-v14`, `denai-profile-v1`, `denai-records-v14`, `denai-campaign-v1`, `denai-lb-*`, … | Hub never reads or writes these. |
| Add Math notes app | `/app/addmath/` (hash router, `src/screens/*`) | Verified notes T4-1…T4-10 `published`; T5-1…T5-6 `review` (hidden publicly); T5-7, T5-8 not built. |
| Curriculum | `app/addmath/src/content/curriculum.js` | 18 chapters, titles and SK codes from DSKP KSSM (KPM 2018). Single source of truth for chapter names. |
| Notes content | `app/addmath/src/content/notes/<id>.js` + `v3/<id>.js` | Subtopic sections (concept, examples, formula, mistakes, summary) + V3 `idea/when/steps`. |
| Question bank | same files, `questions` | `mcq`, `numeric`, `expression` auto-checkable via `notes/practice.js#checkSingle`. |
| Maths | `app/addmath/src/notes/math.js` + self-hosted KaTeX | `renderMath()` for `\( \)` / `\[ \]`. |
| Visuals | `app/addmath/src/notes/visuals.js` | `mountVisual(host, spec)`; CSS classes ported into `hub.css`. |
| Game screenshots | `denai/img/menu.webp`, `main.webp`, `mesin.webp`, `jambatan.webp`, `chillboy-idle.webp` | Real captures, reused. |

### Conflicts identified
- `/app/addmath/denai` and `/app/addmath/denai/` already 301 to `/denai/`. The hub must not live there.
- `/app/addmath/` already has a hash router; the hub uses its own, separate page so neither router sees the other's hashes.
- Review-status content must stay hidden publicly → the hub only shows `published` subtopics and questions (same rule as the notes app).
- No game exists yet for chapters other than T4-1 → the hub says so instead of inventing one.

## Decisions
- **Location:** `/denai/hub/` — one HTML page, hash routes, covered by the existing `/denai/*` no-cache header and CSP.
- **Reuse, read-only imports** from `/app/addmath/src/…` (curriculum, notes loader, KaTeX, visuals, answer checker). No edits to those files.
- **Own design system** in `denai/hub/hub.css`, derived from the DENAI game palette. Dashboard/home are game-inspired; notes/exercises are plain, calm reading surfaces.
- **Demo data** (`js/demo.js`) is clearly labelled *DATA CONTOH* on every screen that uses it. Only the demo-state choice is stored (`denai-hub-demo-v1`). Exercises are not graded server-side and not saved.

## Routes
| # | Page | Hash |
|---|---|---|
| 01 | Home | `#/` |
| 02 | Learning Hub | `#/hub` |
| 03 | Chapter selection | `#/bab` (`#/bab?t=5`) |
| 04 | Chapter overview | `#/bab/<id>` |
| 05 | Concept notes | `#/nota/<id>/<sub>` |
| 06 | Exercise | `#/latihan/<id>/<sub>` |
| 07 | Game launch | `#/main` |
| 08 | My progress | `#/kemajuan` |

Play button → `/app/addmath/denai/main` (the real game route).

## Files
- Create: `denai/hub/index.html`, `hub.css`, `js/app.js`, `js/ui.js`, `js/data.js`, `js/demo.js`, `js/pages/*.js`, `tests/hub-smoke.cjs`.
- Must not modify: `app/addmath/denai/**` (game), `app/addmath/src/**` (notes app), `denai/index.html|css|js` (game landing), game saves.

## Status (2026-11-23)
| Phase | State |
|---|---|
| 0 Audit | done (this file) |
| 1 Design system | done — `hub.css` tokens: colour, type, 4-pt spacing, radii, buttons, nav, cards, chapter states, progress, exercise feedback, breakpoints 600/960 |
| 2 Pages 01–08 | done |
| 3 Navigation | done — top nav (≥960px), bottom tab bar (<960px), breadcrumbs, back links, empty states, 404 view |
| 4 Responsive | done — 1280 / 820 / 390 checked, no horizontal overflow on any route (all 60 note + exercise routes checked at 390) |
| 5 Motion | done — view fade, card hover, bar fill, feedback, landing scroll reveal; all off under `prefers-reduced-motion` |
| 6 QA | `hub-smoke.cjs` passes (journey, every exercise state, 93 routes link-crawl, console, real game boots Phaser 3.90.0) |

Content rules kept: only `published` subtopics/questions are shown; T5 chapters appear as *Dalam penyediaan*; only T4-1 claims a game.

## Phase 1 — Real learning progress (branch `claude/denai-hub-phase1`)
See `PRODUCT-ROADMAP.md` for the full analysis and later phases.
- `js/core/`: `keys.js` (storage key registry), `store.js` (ProgressStore, key `denai-hub-progress-v1`),
  `events.js` (note-open, note-done, attempt, set-done; sanitised, no personal data), `mastery.js`
  (Belum mula / Mencuba / Faham / Mahir), `practice.js` (set selection), `learner.js` (view model),
  `content.js` (the only importer of `/app/addmath/src/*`).
- Demo data only with `?demo=1` (banner "Mod demo", in-memory, never touches the real record); `?demo=0` leaves.
- Exercise: two attempts (first mistake → feedback only; answer + solution after a right answer or the
  second mistake), set resumes after reload, "Latihan lagi" draws a new set.
- WCAG: `--ink-faint` #5f6679, `.btn-ok` #1b7a55, `--ok` #17704a (all ≥4.5:1, checked in the smoke test).
- Game progress is not read (Phase 3); game keys are never written.

## Not done / next
- Phase 2+ in `PRODUCT-ROADMAP.md` (progressive hints from solution steps, maths input toolbar, stepped examples, chapter path, read-only game bridge).
- Exercise results live in this browser only; no account or sync (Later).

## Checks
No server needed: browser tests serve the repo from disk inside Playwright (`tests/serve.cjs`).
- `node denai/hub/tests/core.test.mjs` — unit tests: events, store sanitising, mastery, set selection.
- `node denai/hub/tests/hub-smoke.cjs` — full functional check, desktop + phone (journey, persistence after reload,
  two attempts, resume, demo isolation, contrast, link crawl, storage keys, Phaser boot).
- `node denai/hub/tests/shots.cjs <outdir> "#/" "#/hub" …` — screenshots at 1280/820/390 + overflow + console.
- `bash app/addmath/tests/run-all.sh` — content validators (unchanged content).

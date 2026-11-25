# DENAI — Product Evolution & UX Gap Analysis

> **Status:** analysis only. No existing file, route, game system or save format was changed to produce this document. Nothing here is implemented until the owner approves it.
> **Evidence base:** `main` at `87e1965` (Learning Hub #17 + landing link #18). The DENAI game, the Add Math notes app (`/app/addmath/`) and the hub (`/denai/hub/`) were inspected directly. Content counts were computed from the content files (script output, 2026-11-23). Existing content validators were run and pass (`app/addmath/tests/run-all.sh`).

**Legend**

| Mark | Meaning |
|---|---|
| **[EXISTS]** | Present in the code today (verified). |
| **[PROPOSED]** | Not built. A recommendation. |
| **Critical** | Blocks the product promise, or is a correctness / accessibility failure. Do first. |
| **High** | Large learning or UX gain for moderate effort. Next. |
| **Medium** | Clear value, not urgent. |
| **Later** | Depends on a backend, owner decisions or content that does not exist yet. |

Rules this document keeps:
- No DSKP content, mathematical explanation or game functionality is invented.
- Where a recommendation needs new content (hints, a misconception taxonomy, Tingkatan 5 approval), it is listed as a **dependency** on the owner or content work, not as something the code can produce.

---

## 1. Current product assessment

### 1.1 Summary

DENAI already has three strong, separate assets:

1. **A large, verified content bank.** It is published for Tingkatan 4 Bab 1–10:
   - 30 subtopics;
   - 148 worked examples with step-by-step reasons;
   - 54 formulas, 85 common-mistake entries and 39 interactive visuals;
   - 250 questions with full solutions and misconception-specific feedback.

   All of it is checked by independent validators.
2. **A polished Phaser game** (World 1, three levels), whose puzzles are data-driven and tagged with chapter, subtopic, SP and difficulty.
3. **A new Learning Hub** that ties the two together visually, with eight working pages.

The weakness is that **the hub does not learn anything about the student**:
- Progress, "continue", recommendations and game status are demo data.
- Reading a note or finishing an exercise changes nothing.
- The hub exposes only a thin slice of the content: one example per subtopic, at most five auto-checked questions, and the same five every time.

DENAI today is a well-designed **catalogue**, not yet a **learning loop**. The gap to Duolingo / Khan Academy / Brilliant-level quality is less about visuals and more about four things: (a) real state, (b) mastery, (c) richer practice interaction, and (d) the loop between learning and the game.

### 1.2 Scorecard (by audit area)

| # | Area | Today | Main gap |
|---|---|---|---|
| 1 | Student journey | Complete, navigable path from Home to exercise to game to progress | Nothing persists; the journey resets every visit |
| 2 | Dashboard & motivation | Clear layout, next-action card | Driven by a demo toggle, not by the student |
| 3 | Chapter / subtopic navigation | All 18 DSKP chapters, honest availability | Tingkatan 5 is a dead end; no search; no path view |
| 4 | Lesson structure | Consistent Fahami → Contoh → Ulang Kaji → Latihan | Read-only; text before interaction; no "done" moment |
| 5 | Explanations & examples | Verified, step-by-step with "why" | Hub shows 1 of ~5 examples per subtopic; examples are fully revealed |
| 6 | Exercises & feedback | All answer states, misconception feedback, full solution | Fixed first-5 set, no hints, no second attempt, 54 questions unreachable |
| 7 | Progress & mastery | Visual components ready | No real data, no mastery model |
| 8 | Gamification | Game itself is the motivation layer | Hub has no progression of its own; game and hub progress are disconnected |
| 9 | Game integration | Real Play link, level → subtopic mapping | One-way link; hub does not read game progress; game does not link back |
| 10 | Responsive & accessibility | No overflow at 1280/820/390; reduced motion; keyboard paths | 3 contrast failures; maths input hard on phones |
| 11 | Architecture & backend readiness | Clean static modules, data layer, demo-data seam | No progress store or event model; tight import coupling; no CI |

---

## 2. Current features inventory [EXISTS]

### 2.1 Learning Hub — `/denai/hub/`

| Feature | Where | Notes |
|---|---|---|
| 8 pages, hash routes `#/`, `#/hub`, `#/bab`, `#/bab/<id>`, `#/nota/<id>/<sub>`, `#/latihan/<id>/<sub>`, `#/main`, `#/kemajuan` | `js/app.js`, `js/pages/*` | Lazy-loaded page modules |
| Design system: tokens, buttons, cards, chapter states, progress bars, feedback, breakpoints 600/960 | `hub.css` | Two surfaces: *play* (game-inspired) and *read* (calm) |
| Top nav (≥960px), bottom tab bar (<960px), breadcrumbs, back links, 404 and error views | `app.js`, `ui.js` | Focus moves to `h1` on navigation |
| Demo states Pelajar Baharu / Pelajar Kembali, labelled "Data contoh" | `js/demo.js` | Only the selected state is stored (`denai-hub-demo-v1`) |
| Chapter catalogue from the DSKP curriculum; availability from publication status | `js/data.js` | `review` content hidden; T5 shown as *Dalam penyediaan* |
| Note page: V3 idea, "Bila guna", one visual, one worked example, formulas, method steps, summary, one common mistake, exercise CTA | `pages/note.js` | Full note linked in the notes app |
| Exercise: unanswered → selected → submitted → correct/incorrect → solution → next → completion; MCQ + numeric + expression | `pages/exercise.js` | Uses the notes app's `checkSingle`; up to 5 questions; nothing saved |
| Game page: real route `/app/addmath/denai/main`, level ↔ subtopic links, real screenshots, controls | `pages/game.js` | Level descriptions mirror the `/denai/` landing copy |
| Progress page (demo data) with empty states | `pages/progress.js` | |
| Smoke test + screenshot tool, no server needed | `tests/*.cjs` | Journey, all exercise states, 93-route link crawl, Phaser boot |

### 2.2 Add Math notes app — `/app/addmath/`

| Feature | Notes |
|---|---|
| Three modes per chapter: **Fahami** (`#/nota/<ch>/<sub>`), **Ulang Kaji** (`#/ulangkaji/<ch>`, with search), **Latihan** (`#/latihan/<ch>[/<sub>]`, filter by subtopic and difficulty) | More complete than the hub for reading and practice |
| Optional sections (deeper explanation, extra examples, other visuals and mistakes) | The hub shows only the "main" ones |
| Owner preview `?semak=1` for `review` content | Shared via sessionStorage; the hub respects it |
| Validators: data, mutation self-test, notes, regressions | Pass on current `main` |

### 2.3 Content bank (published, Tingkatan 4 Bab 1–10)

| Item | Count | Source of truth |
|---|---|---|
| Subtopics | 30 (+23 in `review`: T5 Bab 1–6) | `src/content/notes/*.js` |
| Worked examples (with steps, "why", check) | 148 | same |
| Visuals | 39 (32 plots, 6 tables, 1 mapping) | `notes/visuals.js` specs |
| Formulas / common mistakes | 54 / 85 | same |
| Questions | 250: 52 MCQ, 127 numeric, 17 expression, 22 structured, 32 reasoning (+172 in `review`) | same |
| Difficulty mix | 55 Asas · 106 Sederhana · 89 Cabaran | same |
| Questions with misconception-specific feedback | 165 | `options[].misconception`, `wrong[]` |
| Distinct misconception tags | 146 (not a shared taxonomy; most are used once) | same |
| SP codes covered by questions | 94 | `q.sp` |
| Authored hints on questions | **0** | No `hint` field in content |
| T5 Bab 7, 8 | written 2026-11-23, in `review` | `PROGRESS.md` |

### 2.4 DENAI game — `/app/addmath/denai/main` (do not redesign)

| Feature | Notes |
|---|---|
| World 1 (*Hutan & Sungai*, T4 Bab 1 Fungsi): 1-1 Jejak Taman Fungsi, 1-2 Jambatan Berkembar, 1-3 Gerbang Songsang; linear unlock | `levels/registry.js` |
| Data-driven puzzles with `chapter`, `subtopic`, `sp`, `difficulty`, `learningObjective`, `hints`, `explanation`, seeded variants | `puzzles/definitions/world1.js` (e.g. 1-1 → `1.1`, SP `1.1.3`; 1-2 → `1.2`, SP `1.2.1`, `1.2.2`) |
| Saves (browser only): `denai-save-v14`, `denai-profile-v1` (completions, best time, achievements, `mastered.types`), `denai-campaign-v1` (1-2), `denai-l3-campaign-v1` (1-3), attempts per mission (`wrong`/`correct`) | Sanitised on load; read-only menu view in `menu/progress.js` |
| World map lists W2 *Lembah Batu Kapur* (Fungsi Kuadratik, in development), W3, W4 (soon) | `menu/progress.js` |
| Optional PlayFab leaderboard + anonymous player count; analytics module **off by default** with a strict allowlist and GPC/DNT respect | `leaderboard/`, `analytics.js` |
| Precedent: the `/denai/` landing reads game saves **read-only** to show returning-player stats | `denai/denai.js` |

### 2.5 Platform

- Cloudflare Pages, static, no build step; CSP and cache headers in `_headers`.
- No `package.json`, **no CI**: all tests are run by hand.

---

## 3. UX problems and friction points

Each item has: evidence → impact → priority.

### 3.1 Student journey

| ID | Problem | Evidence | Impact | Priority |
|---|---|---|---|---|
| J-1 | Nothing the student does is remembered | Progress, "Sambung", recommendations come from `demo.js`; reading or finishing an exercise changes nothing | The core promise "Jejak kemajuan" is not real; no reason to return | **Critical** |
| J-2 | The demo toggle is visible to real students | `Pelajar Baharu / Pelajar Kembali` switch on Hub and Progress | Confusing in production; looks like a setting | **Critical** (once real progress exists) |
| J-3 | A new student lands on a dashboard before learning anything | Home → `Mula Belajar` → Hub dashboard (demo note, steps, cards) → recommendation → note 1.1: the shortest path is 2 clicks, but it passes a dashboard that has nothing to show a new student | Drop-off and choice overload before the first "aha" | High |
| J-4 | No "done" moment after a note | Note ends with a CTA; no completion state, nothing unlocks | Weak sense of progress | High |
| J-5 | Refresh or leaving mid-exercise loses the attempt | Exercise state is in memory only | Frustrating on phones (tab reloads) | High |
| J-6 | Two separate learning UIs | `/app/addmath/` (full notes, Ulang Kaji, filtered Latihan) and `/denai/hub/` (curated) look and behave differently; the hub links out for "full notes" | Context switch; content changes could diverge in presentation; unclear which is "the product" | **Critical** (decision) |

### 3.2 Dashboard and motivation

| ID | Problem | Priority |
|---|---|---|
| D-1 | Recommendations are rule-of-thumb on demo data (`score/total < 0.6`), not on the student's history | High (follows C-1) |
| D-2 | Dashboard shows percentages of notes read, which measures exposure, not understanding | High |
| D-3 | No short-session entry ("5-minute practice") for a student with little time | Medium |

### 3.3 Chapter and subtopic navigation

| ID | Problem | Priority |
|---|---|---|
| N-1 | Tingkatan 5 is entirely locked publicly (23 subtopics and 172 questions waiting for owner review). T5 is the SPM year. | **Critical dependency** (owner review, not code) |
| N-2 | No search across chapters (the notes app has per-chapter search in Ulang Kaji only) | Medium |
| N-3 | Chapter overview has no chapter-level revision (formula sheet); the notes app's `#/ulangkaji/<ch>` is not reachable from the hub | High |
| N-4 | No sense of a path through a chapter (order, what is next, what is mastered) beyond a list | High |

### 3.4 Lesson structure and interaction

| ID | Problem | Priority |
|---|---|---|
| L-1 | Notes are read-only: text first, visual second, example fully revealed. No moment where the student predicts or tries before being told | High |
| L-2 | The main visual (sliders, test lines) is placed after the explanation and is not connected to a question | Medium |
| L-3 | Hub shows only the V3 "main" example/visual/mistake; ~4 more examples per subtopic are only in the notes app | High |

### 3.5 Mathematical explanation and examples

| ID | Problem | Priority |
|---|---|---|
| E-1 | Worked example steps are shown all at once; no step-by-step reveal or "what would you do next?" | High |
| E-2 | "Kaedah" and "why" exist per step (good) but no faded examples (partially worked, student completes the last step) | Medium |

### 3.6 Exercises, feedback and explanations

| ID | Problem | Evidence | Priority |
|---|---|---|---|
| X-1 | Always the first ≤5 auto-checked questions in authored order; retry gives the identical set | `exerciseSet()` slices in order | **Critical** |
| X-2 | 54 published questions (22 structured, 32 reasoning) are unreachable in the hub; of 196 auto-checkable, at most 150 can ever appear | `AUTO` set + `slice(0, 5)` | High |
| X-3 | No second attempt: the correct answer and solution appear after the first wrong answer | `submit()` | High |
| X-4 | No hints before answering. The content has **no hint field**; only full solutions | content scan: 0 hints | High (needs a content decision; see §10) |
| X-5 | Typing expressions on a phone is hard (`(x-1)/2`, `x^2`); only a format hint helps | `exercise.js` input | High |
| X-6 | No preview of how a typed answer is read (e.g. KaTeX preview of `3/4x`) | | Medium |
| X-7 | Difficulty is not used (Asas/Sederhana/Cabaran exists on every question) | | High |

### 3.7 Progress and mastery

| ID | Problem | Priority |
|---|---|---|
| P-1 | No real progress store | **Critical** |
| P-2 | No mastery concept; "Bab selesai" = all notes opened | High |
| P-3 | Misconception data (165 questions) is shown once and then lost; could drive review | Medium (needs taxonomy, see §10) |

### 3.8 Gamification and progression

| ID | Problem | Priority |
|---|---|---|
| G-1 | The hub has no progression of its own; the game's achievements and coins live only in the game | High |
| G-2 | Game unlocks are independent of learning (by design); nothing suggests "learn 1.2 before Level 1-2" | Medium |

### 3.9 Game integration

| ID | Problem | Priority |
|---|---|---|
| I-1 | The hub does not read game progress, although a read-only precedent exists (`/denai/denai.js`) and `menu/progress.js` already exposes a read-only status view | High |
| I-2 | Level ↔ subtopic mapping in the hub is hand-written (`data.js#GAME`), although puzzle definitions carry `chapter`/`subtopic`/`sp` | Medium |
| I-3 | The game has no link back to the related note/exercise (would need a game change; see §10) | Later (owner approval) |
| I-4 | Only Bab 1 has a game; 9 published T4 chapters show "no mission yet" | Expected; content/game roadmap |

### 3.10 Responsive experience and accessibility

Measured contrast (WCAG 2.x):

| Token pair | Ratio | Used for | Verdict |
|---|---|---|---|
| white on `--grass` (`.btn-ok`) | **2.75:1** | "Semak jawapan", "Mula latihan" | Fails AA (text 17px) — **Critical** |
| `--ink-faint` on page/paper/white | **3.47–3.84:1** | breadcrumbs, tab-bar labels (12px), status text, tags | Fails AA for small text — **Critical** |
| `--ok` on `--ok-bg` | **3.86:1** | `tag-done`, correct-answer text | Fails AA for small text — **Critical** |
| `.tag-soon` | **3.28:1** | "Dalam penyediaan" | Fails — **Critical** |
| ink-soft, sky-ink, gold button, bad on bad-bg | 4.7–7.6:1 | | Pass |

| ID | Other issue | Priority |
|---|---|---|
| A-1 | Answer options use `role="radio"` but every option is a tab stop (no roving tabindex) | Medium |
| A-2 | Maths in feedback is announced via KaTeX MathML (good); typed answers have no spoken echo | Medium |
| A-3 | No automated accessibility check in tests | Medium |

### 3.11 Technical architecture

| ID | Problem | Priority |
|---|---|---|
| T-1 | No progress/event model; `demo.js` is the only state shape | **Critical** |
| T-2 | Hub imports internal modules by absolute path (`/app/addmath/src/notes/v3.js`, `practice.js`); a refactor of the notes app silently breaks the hub | High |
| T-3 | No CI; tests are run by hand (and the notes browser test needs a server) | Medium |
| T-4 | Storage keys are spread across apps with no registry (`addmath-progress-v1`, `denai-*`, `denai-hub-demo-v1`) | Medium |

---

## 4. Missing features [PROPOSED]

| # | Feature | Solves | Priority |
|---|---|---|---|
| M-1 | **Local progress store** (`denai-hub-progress-v1`): note visits/completions, exercise attempts per question, last location. Behind a small interface so a backend can replace it | J-1, P-1, T-1 | Critical |
| M-2 | Move the demo toggle behind `?demo=1` (owner/teacher preview only); real students see their own state | J-2 | Critical |
| M-3 | Contrast fixes for the four failing token pairs | §3.10 | Critical |
| M-4 | Varied practice sets: draw from all auto-checked questions of the subtopic, mixed by difficulty, new set on retry, "Latihan lagi" | X-1, X-2, X-7 | Critical |
| M-5 | **Product decision** on hub vs notes app roles (see §5.3). **DECIDED 2026-11-25: option A** | J-6 | Done |
| M-6 | Mastery per subtopic (and per SP) computed from attempts | P-2, D-2 | High |
| M-7 | Second attempt before the answer is revealed; solution after the second miss or on request | X-3 | High |
| M-8 | Progressive solution reveal ("Tunjuk langkah 1") built from the **existing** `solution` steps; no new content | X-4 (partly) | High |
| M-9 | Maths input toolbar on phones (`x`, `²`, `√`, `/`, `π`, `(` `)`, `−`) and a live preview of the parsed answer | X-5, X-6 | High |
| M-10 | Step-by-step worked examples (reveal next step; optional "predict the next step") using existing `steps` | E-1, L-1 | High |
| M-11 | Chapter path view: subtopic nodes → practice → related game level, with mastery state | N-4, G-1 | High |
| M-12 | Chapter revision page in the hub (formulas + mistakes for the whole chapter, from existing data) | N-3 | High |
| M-13 | Read game progress read-only (via the existing read-only `menu/progress.js` view or the same keys `/denai/` already reads) | I-1 | High |
| M-14 | Note completion moment (scroll-end or "Saya faham" button) feeding M-1 | J-4 | High |
| M-15 | Resume an exercise in progress (store the current set and position) | J-5 | High |
| M-16 | Show more examples in the hub (expandable "Contoh lain", reusing the notes data) | L-3 | High |
| M-17 | Review queue: questions answered wrong come back after a delay | P-3 | Medium |
| M-18 | Structured questions (parts) in the hub exercise | X-2 | Medium |
| M-19 | Derive level ↔ subtopic/SP from puzzle definitions | I-2 | Medium |
| M-20 | Search across published notes (titles, formulas) | N-2 | Medium |
| M-21 | "Try first" opener: one visual or MCQ before the explanation | L-1, L-2 | Medium |
| M-22 | CI (GitHub Actions) running content validators + hub smoke test | T-3 | Medium |
| M-23 | Storage key registry + a single "reset my data" control | T-4 | Medium |
| M-24 | Quick 5-minute mixed practice across mastered/weak subtopics | D-3 | Medium |
| M-25 | Accounts, cloud sync, teacher/class view | multi-device, schools | Later |
| M-26 | Game → hub back-links (victory screen "Ulang kaji konsep ini") | I-3 | Later (game change, owner approval) |
| M-27 | Offline / installable (PWA) | low-connectivity users | Later |

---

## 5. Recommended student journey [PROPOSED]

### 5.1 New student (first visit)

```
Home ── "Mula Belajar" ──► 1.1 Fungsi note directly (no dashboard first)
   └─ "Teroka Game" ──► Game page
1.1 note: try-first question → idea → stepped example → revision → "Saya faham"
   └─► Practice 1.1 (mixed difficulty, 2 tries, hints from solution steps)
        └─► Result: mastery shown for 1.1 → next: "1.2" or "Main Level 1-1"
Second visit: Hub opens on "Sambung 1.2" (real data)
```

### 5.2 Returning student

```
Hub: Continue (last real location) · Review due (wrong answers from earlier) · Next mastery goal
   └─ Chapter path: ● 1.1 Mahir  ◐ 1.2 Mencuba  ○ 1.3  ▶ Level 1-2 (game progress read from the game)
Progress: mastery per subtopic, practice history, game levels (real)
```

### 5.3 Role of the two learning UIs (M-5: decided 2026-11-25, option A)

**Owner decision (2026-11-25):** the Learning Hub is the student front door. The notes app stays as the full reference: every notes screen shows a bar linking to the matching Hub page and stating that its answers are not counted in Hub progress. Option B remains the later path once the Hub has parity.


| Option | Description | Recommendation |
|---|---|---|
| A | Hub = student front door and journey; notes app = full reference ("Nota penuh", Ulang Kaji, all questions) | **Recommended now**: no route changes, no duplication of content logic |
| B | Hub absorbs all notes-app features; notes app kept as an owner/review tool | Later, once the hub has parity |
| C | Keep both as equals | Not recommended: diverging UX |

---

## 6. Proposed learning loop [PROPOSED]

**Cuba → Fahami → Contoh → Latih → Main → Ulang**, measured per subtopic.

| Step | What the student does | Built from | Exists today? |
|---|---|---|---|
| Cuba (try) | One quick question or visual before reading | existing questions (`mudah`) / visuals | Data yes, step no |
| Fahami | Idea + "Bila guna" | V3 `idea`, `when` | **[EXISTS]** |
| Contoh | Stepped worked example, predict next step | example `steps`, `why` | Data yes, interaction no |
| Latih | Mixed set, 2 attempts, solution steps as hints | questions, `solution`, misconception feedback | Partly |
| Main | Related level, with the level's own learning objective | puzzle definitions (`learningObjective`, `sp`) | Link only |
| Ulang | Wrong answers return later; chapter revision sheet | attempts (M-1), formulas, mistakes | No |

**Mastery levels** (DENAI's own words, computed only from real attempts):

| Level | Rule (initial proposal, to tune with data) |
|---|---|
| Belum mula | no attempts |
| Mencuba | ≥1 attempt |
| Faham | ≥3 correct first-try answers in the subtopic, incl. ≥1 Sederhana |
| Mahir | Faham + ≥1 Cabaran correct + no wrong answer in the last 5 attempts, on a later day |

Mastery is per subtopic in the UI and stored per **SP code** (questions carry `sp`), so it can later aggregate to DSKP learning standards for teachers.

---

## 7. Gamification recommendations

### 7.1 Principles extracted (not copied)

| Source | Principle | DENAI translation |
|---|---|---|
| Duolingo | A visible **path** with small, ordered steps; short sessions; clear "what's next" | Chapter path view (M-11); 5-minute practice (M-24) |
| Duolingo | Progress that you can lose motivates only when it is forgiving | No punitive streaks; if a streak is ever added, it is opt-in and forgiving (Later) |
| Khan Academy | **Mastery levels** earned through practice, not page views; hints and step-by-step solutions | Mastery model (§6); progressive solution reveal (M-8) |
| Khan Academy | Explanations that show *why* each step works | Already present (`why` per step); make it interactive (M-10) |
| Brilliant | **Learn by doing**: a problem before the explanation; small interactive steps; feedback explains the idea, not only right/wrong | Try-first opener (M-21); visuals tied to questions; misconception feedback (exists) |
| Brilliant | Productive struggle: a second attempt before the answer | Two attempts (M-7) |

### 7.2 Recommended for DENAI

| Recommendation | Why | Priority |
|---|---|---|
| Mastery states on the chapter path (●/◐/○) as the primary progress signal | Honest, learning-based | High |
| "Jambatan bab" metaphor: each mastered subtopic adds a plank to the chapter's bridge (hub visual, reuses the game's bridge idea, no game change) | Identity tied to DENAI's world | Medium |
| Game levels shown on the path at the subtopic they practise | Connects playing with learning | High |
| Celebrate mastery transitions, not activity counts | Avoids hollow metrics | High |
| Show the game's own achievements (read-only) on Progress | Reuses existing rewards | Medium |

### 7.3 Not recommended now

- XP counters, leagues, gems or currencies in the hub: they duplicate the game's coins and add noise. The brief already rules them out.
- Mandatory daily streaks.
- Leaderboards for learning (the game has an opt-in time leaderboard; learning should stay private).
- Locking notes behind mastery: notes stay open. Only the *recommendation* follows mastery.

---

## 8. Proposed technical architecture [PROPOSED]

Constraints kept:
- static, no framework, no build step, no backend now;
- routes unchanged;
- game untouched;
- every new storage key separate from game keys.

```
denai/hub/js/
  core/
    store.js        ProgressStore interface + LocalStore (localStorage, versioned, sanitised like the game's saves)
    events.js       append-only attempt/visit events → derived state
    mastery.js      pure functions: events → mastery per SP / subtopic
    content.js      the ONLY module that imports /app/addmath/src/* (adapter; replaces direct imports in pages)
    game-bridge.js  READ-ONLY game status (same keys /denai/ already reads, or menu/progress.js view)
    keys.js         registry of all storage keys (hub + read-only game keys)
  pages/…           unchanged structure; read state from store/mastery instead of demo.js
  demo.js           kept, used only with ?demo=1
```

**Event shape** (backend-ready; no personal data):

```js
{ v: 1, t: 'attempt', at: '2026-11-23T10:00:00Z', ch: 't4-1', sub: '1.1', q: 't4-1.1-02',
  sp: ['1.1.3'], diff: 'mudah', try: 1, ok: false, misc: 'tanda', ms: 41000 }
{ v: 1, t: 'note', at: '…', ch: 't4-1', sub: '1.1', state: 'completed' }
```

**Backend later**:
- `ProgressStore` gets a `RemoteStore` with the same methods (`append`, `load`, `export`).
- Local events sync up once accounts exist.
- Question IDs are already stable, and SP codes already exist.

**Privacy**:
- Students are minors. Keep the current game policy for the hub: browser-only by default, nothing sent, GPC/DNT respected.
- Any future sync needs explicit opt-in, a privacy notice, and a review against Malaysian data-protection law (PDPA 2010) before launch.

---

## 9. Prioritised development roadmap [PROPOSED]

Each phase is shippable on its own and keeps routes, the game and existing saves intact.

### Phase 1: Make it real (Critical)

1. Contrast fixes (M-3).
2. `core/keys.js`, `core/store.js`, `core/events.js`; record note visits/completions and exercise attempts (M-1, M-14).
3. Demo toggle only with `?demo=1` (M-2).
4. Hub, overview and progress read real state; empty states for new students already exist.
5. Varied practice sets with a new set on retry; resume in progress (M-4, M-15).
6. `core/content.js` adapter (T-2).
7. Owner decisions: M-5 (hub vs notes app) and T5 review plan (N-1).

**Acceptance:**
- A student who reads 1.1 and does one set sees it on Hub and Progress after reload.
- No game key is written.
- All contrast pairs ≥4.5:1 for text.

### Phase 2: Learning interactions (High)

1. Mastery model (M-6) shown on overview/hub/progress.
2. Two attempts and progressive solution steps (M-7, M-8).
3. Maths input toolbar + parsed preview (M-9).
4. Stepped worked examples (M-10), "Contoh lain" (M-16).
5. Chapter revision page (M-12).

**Acceptance:** usability check with 3–5 students on phones (owner to arrange). Expression answers can be entered without a keyboard switch.

### Phase 3: Path and game loop (High → Medium)

1. Chapter path view (M-11) with game levels placed by SP.
2. Game bridge read-only (M-13); level mapping derived from puzzle definitions (M-19).
3. Mastery celebrations; "Jambatan bab" visual.

### Phase 4: Depth (Medium)

Review queue (M-17), structured questions (M-18), search (M-20), try-first openers (M-21), 5-minute practice (M-24), CI (M-22), key registry + reset (M-23), roving tabindex and automated a11y checks (A-1, A-3).

### Phase 5: Later

Accounts and sync (M-25), teacher view, game → hub links (M-26, owner approval), PWA/offline (M-27), misconception-driven review once a taxonomy exists.

---

## 10. Dependencies and risks

### 10.1 Dependencies (owner / content)

| Dependency | Blocks | Owner action |
|---|---|---|
| Tingkatan 5 review and publication (23 subtopics, 172 questions in `review`) | T5 students, half the curriculum | Review in `/app/addmath/?semak=1` and publish |
| T5 Bab 7 and 8 content | Full T5 coverage | Written 2026-11-23; awaiting review with the rest of T5 (`PROGRESS.md`) |
| Hints | True hints (X-4); M-8 is a partial substitute using existing solutions | Decide: author `hint` fields, or accept solution-step reveal |
| Misconception taxonomy | Review by misconception (P-3) | 146 ad-hoc tags → agree a short shared list |
| Hub vs notes app role (M-5) | Phase 1 scope | Choose option A/B/C |
| Any change inside the game (back-links, shared events) | M-26 | Explicit approval; outside current constraints |
| Student testing | Phase 2 acceptance | Arrange a small pilot |

### 10.2 Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hub progress diverges from the game's own progress and confuses students | Medium | Read game status only from the game's keys; never copy or write them |
| Coupling: notes-app refactor breaks the hub | Medium | `core/content.js` adapter + smoke test in CI |
| Mastery rules feel unfair or too easy | Medium | Start simple, show the rule ("3 betul cubaan pertama"), tune with pilot data |
| localStorage loss (shared school computers, cleared data, iOS eviction) | High | Say so in the UI (as the game's FAQ already does); export/import as a stop-gap; accounts later |
| Gamification drift (adding points that mean nothing) | Medium | §7.3 rules; only mastery-based signals |
| Privacy of minors if sync is added | Low now / High later | Opt-in, anonymous IDs, no free text, PDPA review before any backend |
| Scope creep into a second prototype | Medium | Every phase modifies `/denai/hub/` in place; routes unchanged |

---

## Appendix A: Open questions for the owner

1. Hub vs notes app: option A, B or C (§5.3)?
2. Should "Mula Belajar" for a new student go straight to note 1.1 (J-3)?
3. Hints: author new `hint` fields, or use progressive solution steps only?
4. Mastery rule (§6): accept the initial proposal for Phase 2?
5. Is a read-only view of game progress in the hub acceptable (same approach as `/denai/`)?
6. Timeline for the T5 review.

---

## Implementation status — Learning Hub v2 (2026-11-23, branch `claude/denai-hub-phase1`, not merged)

Built on the owner decisions D1–D15 and review directions A1–A8 (`PRODUCT-BLUEPRINT.md` §3).

| Phase | State | What was built |
|---|---|---|
| 1 Foundation | Done | Exactly four tabs: Utama `#/hub`, Belajar `#/bab`, Game `#/main`, Kemajuan `#/kemajuan`. `#/` stays the landing page (logo). Navigation-bar CTA removed. Scroll padding keeps focus clear of the sticky/fixed bars. Owner-preview flag on review content. |
| 2 Utama | Done | One primary action ("Sambung belajar"; "Mula belajar" for an empty record), the next step and its reason, position in the chapter, at most three revision items. Activity feed, statistics and shortcut cards moved out. |
| 3 Belajar | Done | Tingkatan → chapter path → subtopic path → Nota / Contoh / Latihan / Soalan bertulis. All 18 DSKP chapters listed with an honest status. Nothing locked. |
| 4 Notes | Done | Every published explanation section, visual, formula, summary and common mistake of all 30 T4 subtopics. Since the 2026-11-23 content pass, T5 Bab 1–8 (owner preview) also have the V3 layer, so all 59 subtopics use the same Fahami view. |
| 5 Worked examples | Done | All 148 published examples (104 more in T5 review), main example first, optional step-by-step reveal. |
| 6 Exercises | Done | Auto-checked sets (196 published questions), two attempts, misconception feedback, progressive hints from existing solution steps (never the last two; none for < 3 steps), resume after reload. Written practice for all 54 structured/reasoning questions: numeric/expression parts checked, reasoning compared with the model solution; never counted for mastery. |
| 7 Revision | Done | Revision list from real activity (unfinished sets, subtopics at Mencuba with the evidence behind it, notes opened but not finished) on Utama and Kemajuan; chapter revision sheet `#/bab/<id>/ulang-kaji`. No streaks or timers. |
| 8 Game | Done | Game tab: all four worlds from the game's map with their real state, three missions ↔ subtopic/SP, academic level shown separately, "game records are not mastery evidence". Game, saves and assets untouched. |
| 9 Progress | Done | Conservative mastery (D13): repeated questions are not new evidence, two study days need new questions, banks too small for a level show "Bukti belum mencukupi" instead of lowered thresholds (6.3, 8.3, 9.3, 9.4 cap at Faham). Hints recorded. Data & settings with "Padam kemajuan saya" (game saves untouched). |
| 10 QA | Done | See below. |

**Tests run (2026-11-23):** `node denai/hub/tests/core.test.mjs` 18/18 · `node denai/hub/tests/hub-smoke.cjs` 213 checks, all pass (desktop 1280, tablet 820, phone 390; every published and every review subtopic; 154-route link crawl; game boots Phaser 3.90.0) · `bash app/addmath/tests/run-all.sh` all pass · notes-app smoke 410/410.

**Content status (updated by the content completion pass, 2026-11-23; full checklist in `app/addmath/PROGRESS.md`):**

| Content | Status | Learner access |
|---|---|---|
| T4 Bab 1–10 (30 subtopics, 148 examples, 250 questions) | Published (owner-approved, validator-checked, every example and manual item AI-reviewed 2026-11-23; `mathReviewed` field empty) | Full |
| T5 Bab 1–6 (23 subtopics, 104 examples, 172 questions) | `review`; audited 2026-11-23, no mathematical errors found; V3 layer added | Listed as "Sedang disemak" with counts; full content only with `?semak=1` |
| T5 Bab 7–8 (6 subtopics, 23 examples, 49 questions) | `review`; written 2026-11-23 from DSKP PDF 142 and 146–148, every auto answer re-derived by an independent solver | Listed as "Sedang disemak"; full content only with `?semak=1` |

Content pass checks: `run-all.sh` (now including the checker round trip: 474 answers, 648 misconception responses through the real `checkSingle`) all pass · notes-app smoke 458/458 (all 18 chapters) · hub smoke 214/214 (its T5 expectations updated: Bab 1–8 "Sedang disemak", 29 review subtopics).

**Blockers outside code:** publishing T5 Bab 1–8 needs the owner's / an academic reviewer's sign-off (D8, O8; 106 manual items listed in `app/addmath/tests/last-notes-report.md`); the four small banks need more questions before Mahir can be evidenced; mastery numbers (3 / 5 / 2 days) remain hypotheses until pilot data (O16); no student testing has been run.

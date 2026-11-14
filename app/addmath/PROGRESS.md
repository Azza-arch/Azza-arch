# Add Math notes — progress and handover

Last updated: 2026-11-14. Read this first in any new session.

## Definitions (keep them separate)
- **Kod siap**: the component/screen exists and works in the browser.
- **Kandungan lengkap**: every DSKP learning standard of the chapter has concept + worked example + practice (validator coverage matrix all ✓).
- **Lulus ujian automatik**: `bash app/addmath/tests/run-all.sh` passes (+ browser test).
- **Diluluskan untuk diterbitkan**: the OWNER has reviewed it and set `status: 'published'` by hand (and filled `review.ownerApproved`). Nothing is published automatically.

## Status per chapter

| Bab | Tajuk | Kod | Kandungan | Ujian auto | Status | Nota |
|---|---|---|---|---|---|---|
| T4-1 | Fungsi | ✓ | ✓ (11/11 SP) | ✓ | review | 3 subtopik, 16 contoh, 9 visual, 29 soalan baharu; 4 item perlu semakan manusia. Nota ringkas asal (9 skrin) + 4 soalan lama kekal `published` (legacy). |
| T4-2 | Fungsi Kuadratik | ✓ | ✓ (11/11 SP) | ✓ | review | 3 subtopik, 19 contoh, 5 visual, 30 soalan; 4 item perlu semakan manusia. DSKP Bab 2 disahkan halaman demi halaman (hlm. 40–42). |
| T4-3 | Sistem Persamaan | – | – | – | coming_soon | seterusnya |
| T4-4 … T4-10, T5-1 … T5-8 | | – | – | – | coming_soon | |

## How the notes system works
- Chapter file: `src/content/notes/<id>.js` exporting `CHAPTER` (subtopics + questions). Register it in `src/content/notes/index.js` (`NOTE_MODULES` and `NOTE_STATUS`).
- Subtopic = one scrolling page (`#/nota/<id>/<sk>`), sections: intro, prereq, concept (tag `sp`), visual (`spec` + `alt` text), formula, examples (given/find/method/steps with why/check/conclusion), mistakes, summary, next. Practice is appended from `questions` with matching `subtopic`.
- Visual types (`src/notes/visuals.js`): `plot` (functions, relations, sliders, vertical/horizontal test lines, points, shading, readout), `mapping`, `table`. Add new types there when a chapter needs them (e.g. vectors, sectors, probability bars).
- Maths: write `\( … \)` inline and `\[ … \]` display inside `String.raw` strings; KaTeX is self-hosted in `vendor/katex` (MathML output for screen readers).
- Question types: `mcq`, `numeric`, `expression` (checked by equivalence), `structured` (parts), `reasoning` (manual). Each auto-checked item has a `check` spec that `tests/validate-notes.mjs` re-solves independently (see `expected()`/`checkExpression()`); add new check kinds there for new chapters (e.g. quadratic roots, discriminant, logs).
- Validator check kinds available: evaluate, solve (+pick), undefined, range-interval, compose-value, compose-solve, inverse-value, fixed-point, substitute, value, vertex-x; expression: compose-expr, find-inner, find-outer, iterate, inverse-expr, equiv-expr, from-roots; mcq: mapping-function, range-discrete, one-to-one, root-type, quad-ineq (sets between/outside/lt/gt), manual.
- Owner preview: open `/app/addmath/?semak=1` to see `review` content (banner shown); `?semak=0` to leave. Public visitors never see `review` content.

## Checks
- `bash app/addmath/tests/run-all.sh` — data validator, mutation self-test, notes validator (writes `tests/last-notes-report.md`), regressions (p2 = 10; 0.1 inverse display).
- Browser: `python3 -m http.server 8790` at repo root, then `node app/addmath/tests/notes-browser.cjs <outdir>` (Playwright).

## DSKP source
DSKP KSSM Matematik Tambahan T4 & T5 (KPM, Sept 2018), from the Google Site the owner gave
(`sites.google.com/moe-dl.edu.my/matematiktambahansembaka2022/pengurusan-dokumen-kurikulum`, file id `1klx4nCJfq_H0B2lHRfUqQmfgiDM3eWRw`,
download via `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`). Not stored in the repo (KPM copyright).
Before writing a chapter, read its Standard Kandungan pages including **Catatan** (render the pages with `pdftoppm` to see symbols).
Bab 1 and Bab 2 verified page by page (PDF pages 48–52 and 54–56); other chapters only at code level so far.

## Next steps (in order)
1. Bab 3 Sistem Persamaan (T4): read DSKP pp. ~44–47 (3.1 three-variable linear systems, 3.2 one linear + one non-linear), notes, visuals, questions; validator will need check kinds for systems (verify solutions by substitution).
2. Continue T4-4 … T4-10, then T5-1 … T5-8, one chapter per commit.
3. Owner reviews Bab 1 in `?semak=1` and decides publication.

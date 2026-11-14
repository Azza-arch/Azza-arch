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
| T4-3 | Sistem Persamaan | ✓ | ✓ (5/5 SP) | ✓ | review | 2 subtopik, 10 contoh, 2 visual, 14 soalan; 6 item perlu semakan manusia. Catatan DSKP Bab 3 tiada simbol, disahkan daripada teks (hlm. 46–47). |
| T4-4 | Indeks, Surd dan Logaritma | ✓ | ✓ (13/13 SP) | ✓ | review | 4 subtopik, 21 contoh, 4 visual, 37 soalan; 9 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 50–55). |
| T4-5 | Janjang | ✓ | ✓ (9/9 SP) | ✓ | review | 2 subtopik, 12 contoh, 2 visual, 21 soalan; 3 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 58–60). |
| T4-6 | Hukum Linear | ✓ | ✓ (6/6 SP) | ✓ | review | 3 subtopik, 10 contoh, 3 visual, 23 soalan; 7 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 64–65). |
| T4-7 | Geometri Koordinat | – | – | – | coming_soon | seterusnya |
| T4-8 … T4-10, T5-1 … T5-8 | | – | – | – | coming_soon | |

## How the notes system works
- Chapter file: `src/content/notes/<id>.js` exporting `CHAPTER` (subtopics + questions). Register it in `src/content/notes/index.js` (`NOTE_MODULES` and `NOTE_STATUS`).
- Subtopic = one scrolling page (`#/nota/<id>/<sk>`), sections: intro, prereq, concept (tag `sp`), visual (`spec` + `alt` text), formula, examples (given/find/method/steps with why/check/conclusion), mistakes, summary, next. Practice is appended from `questions` with matching `subtopic`.
- Visual types (`src/notes/visuals.js`): `plot` (per-axis gridX/gridY/labelStepX/labelStepY for large ranges; left margin auto-fits long labels) (functions, relations, sliders, vertical/horizontal test lines, points, shading, readout), `mapping`, `table`. Add new types there when a chapter needs them (e.g. vectors, sectors, probability bars).
- Maths: write `\( … \)` inline and `\[ … \]` display inside `String.raw` strings; KaTeX is self-hosted in `vendor/katex` (MathML output for screen readers).
- Question types: `mcq`, `numeric`, `expression` (checked by equivalence), `structured` (parts), `reasoning` (manual). Each auto-checked item has a `check` spec that `tests/validate-notes.mjs` re-solves independently (see `expected()`/`checkExpression()`); add new check kinds there for new chapters (e.g. quadratic roots, discriminant, logs).
- Validator check kinds available: line-two-points, law-from-line, law-fit (least squares on transformed data; verifies data follow the law), table-linear (mcq), seq (AP/GP term/sum/inf/n-for-term/first-n-sum-exceeds by iteration), bounce, first-n-power-below, seq-type (mcq), value-equal (mcq, exact-value options), solve with from/to interval, linear3 (Cramer), sim2 (linear + non-linear, substitution itself verified), evaluate, solve (+pick), undefined, range-interval, compose-value, compose-solve, inverse-value, fixed-point, substitute, value, vertex-x; expression: compose-expr, find-inner, find-outer, iterate, inverse-expr, equiv-expr, from-roots; mcq: mapping-function, range-discrete, one-to-one, root-type, quad-ineq (sets between/outside/lt/gt), manual.
- Owner preview: open `/app/addmath/?semak=1` to see `review` content (banner shown); `?semak=0` to leave. Public visitors never see `review` content.

## Checks
- `bash app/addmath/tests/run-all.sh` — data validator, mutation self-test, notes validator (writes `tests/last-notes-report.md`), regressions (p2 = 10; 0.1 inverse display).
- Browser: `python3 -m http.server 8790` at repo root, then `node app/addmath/tests/notes-smoke.cjs` (all registered chapters, desktop + phone: public hiding, rendering, KaTeX, visuals' sliders, console errors) and `node app/addmath/tests/notes-browser.cjs <outdir>` (Bab 1 interactions + screenshots).

## DSKP source
DSKP KSSM Matematik Tambahan T4 & T5 (KPM, Sept 2018), from the Google Site the owner gave
(`sites.google.com/moe-dl.edu.my/matematiktambahansembaka2022/pengurusan-dokumen-kurikulum`, file id `1klx4nCJfq_H0B2lHRfUqQmfgiDM3eWRw`,
download via `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`). Not stored in the repo (KPM copyright).
Before writing a chapter, read its Standard Kandungan pages including **Catatan** (render the pages with `pdftoppm` to see symbols).
Verified page by page: Bab 1 (PDF 48–52), Bab 2 (54–56), Bab 4 (64–69), Bab 5 (72–74), Bab 6 (78–79); Bab 3 from text (no symbols). Other chapters only at code level so far. PDF page ≈ printed page + 14.

## Next steps (in order)
1. Bab 7 Geometri Koordinat (T4): DSKP SK 7.1–7.4 (12 SP; find PDF pages with pdftotext search for '7.1.1'). Needs checks for division of a line segment, gradients (parallel/perpendicular), polygon area (shoelace, verify independently by triangulation), loci (verify points satisfy the locus).
2. Continue T4-8 … T4-10, then T5-1 … T5-8, one chapter per commit.
3. Owner reviews Bab 1 in `?semak=1` and decides publication.

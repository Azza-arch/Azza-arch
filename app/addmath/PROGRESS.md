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
| T4-7 | Geometri Koordinat | ✓ | ✓ (12/12 SP) | ✓ | review | 4 subtopik, 20 contoh, 4 visual, 31 soalan; 8 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 68–71). |
| T4-8 | Vektor | ✓ | ✓ (10/10 SP) | ✓ | review | 3 subtopik, 14 contoh, 3 visual (anak panah), 21 soalan; 7 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 74–78). |
| T4-9 | Penyelesaian Segi Tiga (elektif) | ✓ | ✓ (12/12 SP) | ✓ | review | 4 subtopik, 16 contoh, 5 visual, 28 soalan; 8 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 82–85), termasuk syarat kes berambiguiti. |
| T4-10 | Nombor Indeks (elektif) | ✓ | ✓ (5/5 SP) | ✓ | review | 2 subtopik, 10 contoh, 2 visual, 16 soalan; 4 item perlu semakan manusia. DSKP disahkan (hlm. 88–90). **Perlu keputusan pemilik:** DSKP minta "data autentik"; nota guna data ilustrasi berlabel jelas + rujukan ke IHP Jabatan Perangkaan Malaysia. Ganti dengan data sebenar jika mahu. |
| T5-1 | Sukatan Membulat | ✓ | ✓ (8/8 SP) | ✓ | review | 4 subtopik, 14 contoh, 4 visual, 24 soalan; 3 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 96–97). |
| T5-2 | Pembezaan | ✓ | ✓ (16/16 SP) | ✓ | review | 4 subtopik, 23 contoh, 4 visual, 37 soalan; 6 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 100–103). SK 2.4 (9 SP) ialah satu halaman panjang dengan cip navigasi. |
| T5-3 | Pengamiran | ✓ | ✓ (11/11 SP; DSKP tiada SP 3.4.1) | ✓ | review | 4 subtopik, 18 contoh, 5 visual, 30 soalan; 5 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 106–109). Jawapan kamiran tak tentu diterima sehingga pemalar (dengan/tanpa + c; peringatan jika c tiada). |
| T5-4 | Pilih Atur dan Gabungan | ✓ | ✓ (6/6 SP) | ✓ | review | 2 subtopik, 11 contoh, 2 visual (gambar rajah pokok, jadual nPr/nCr), 19 soalan; 4 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 112–113). |
| T5-5 | Taburan Kebarangkalian | ✓ | ✓ (14/14 SP) | ✓ | review | 3 subtopik, 17 contoh, 3 visual, 27 soalan; 6 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 116–119). Jawapan normal guna nilai jadual 4 t.p. (toleransi 0.0006). |
| T5-6 | Fungsi Trigonometri | ✓ | ✓ (12/12 SP) | ✓ | review | 6 subtopik, 20 contoh, 6 visual, 34 soalan; 7 item perlu semakan manusia. DSKP disahkan halaman demi halaman (hlm. 122–125). Input jawapan kini menerima kos, sek, kosek, kot. |
| T5-7 | Pengaturcaraan Linear (elektif) | – | – | – | coming_soon | belum dibina |
| T5-8 | Kinematik Gerakan Linear (elektif) | – | – | – | coming_soon | belum dibina |

## V3 (student-first) redesign — branch `claude/addmath-v3`
Three modes per chapter: **Fahami** (`#/nota/<ch>/<sk>`: idea utama + bila guna → rumus → satu visual → cara menyelesaikan → satu contoh → satu kesilapan → bahagian pilihan yang boleh dibuka), **Ulang Kaji** (`#/ulangkaji/<ch>`: rumus, bila guna, langkah, kesilapan; carian + lompat), **Latihan** (`#/latihan/<ch>[/<sk>]`: tapis tahap Asas/Sederhana/Cabaran dan subtopik, pilih soalan terus, jawapan + penyelesaian + pautan konsep selepas semak).
V3 text lives in `src/content/notes/v3/<ch>.js` (lead, idea, when, steps, example/visual/mistake indices) and is merged by `loadChapterNotes`; verified notes, questions and answers are untouched. Validator: every subtopic of a chapter with a V3 file must have all fields and valid indices; chapters without V3 get a warning and a fallback page.

| Batch | Bab | V3 ditulis | Ujian auto | Status |
|---|---|---|---|---|
| 1 | T4-1, T4-2 | ✓ | ✓ | review |
| 2 | T4-3 … T4-6 | ✓ | ✓ | review |
| 3 | T4-7 … T4-10 | ✓ | ✓ | review |
| 4 | T5-1 … T5-4 | – | – | belum (dihentikan atas arahan pemilik; sambung di sini) |
| 5 | T5-5 … T5-8 | – | – | belum (T5-7, T5-8 kandungan belum dibina) |

## How the notes system works
- Chapter file: `src/content/notes/<id>.js` exporting `CHAPTER` (subtopics + questions). Register it in `src/content/notes/index.js` (`NOTE_MODULES` and `NOTE_STATUS`).
- Subtopic = one scrolling page (`#/nota/<id>/<sk>`), sections: intro, prereq, concept (tag `sp`), visual (`spec` + `alt` text), formula, examples (given/find/method/steps with why/check/conclusion), mistakes, summary, next. Practice is appended from `questions` with matching `subtopic`.
- Visual types (`src/notes/visuals.js`): `plot` (noAxes for pure geometry; labels [{at,text}] free text; arrows [{from,to,label,dashed,color}] for vectors; equalAspect for geometry; polygons/segments; closed relations; per-axis gridX/gridY/labelStepX/labelStepY for large ranges; left margin auto-fits long labels) (functions, relations, sliders, vertical/horizontal test lines, points, shading, readout), `mapping`, `table`. Add new types there when a chapter needs them (e.g. vectors, sectors, probability bars).
- Maths: write `\( … \)` inline and `\[ … \]` display inside `String.raw` strings; KaTeX is self-hosted in `vendor/katex` (MathML output for screen readers).
- **Numeric tolerance is ABSOLUTE** (since the Bab 10 audit): use 0.0006 for answers to 3 d.p. and 0.006 for 2 d.p.; omit it for exact answers. Previously it was relative, which made large rounded answers far too lenient (regression test added).
- Wrong values can carry `derive: '<expr>'` (the stated mistake); the validator recomputes it. Use it for every new numeric distractor (two hand-computed distractors in T5-1 were wrong before this existed).
- Test evaluator (tests/solvers.mjs) supports pi, sin/cos/tan (radians).
- Question types: `mcq`, `numeric`, `expression` (checked by equivalence), `structured` (parts), `reasoning` (manual). Each auto-checked item has a `check` spec that `tests/validate-notes.mjs` re-solves independently (see `expected()`/`checkExpression()`); add new check kinds there for new chapters (e.g. quadratic roots, discriminant, logs).
- Validator check kinds available: trig-solve (all roots by scan: sign change + tangency + grid zeros, rejects asymptotes; count/min/max/nth; f in radians, interval in degrees), trig-graph (max/min/amp/period measured), prob-count (enumerated equally likely outcomes), binom (trial-by-trial convolution, no nCr), binom-stat, binom-find, normal (density integrated by Simpson, no table), normal-inv, normal-param, count (brute-force enumeration: perm/comb/product, identical items, circular, where-predicate), antideriv (expr; d/dx(answer) = integrand numerically, needs upToConstant), curve-through (expr), integral (Simpson), area-curve (|f − g| split at crossings), volume (π∫f² by Simpson), riemann, limit (two-sided, Richardson), deriv / deriv-at (5-point stencil, order 1|2), tangent-line / normal-line (expr), line-at, stationary (sign-change scan, pick, want y), nature (mcq), inflection, extremum (scan + golden), rate, rate-inverse, small-change (delta/approx/percent), circ (arc/chord/sector/segment/perimeters/annulus measured on a fine polygon; solveFor j|theta by bisection), index (Q1/Q0×100 from raw quantities; want q1/q0; qs chain), composite (Σ I·w / Σ w), tri (tests/triangle.mjs builds the triangle from coordinates — SSS, SAS, ASA/AAS, SSA incl. ambiguous count, two sides + area; want a/b/c/A/B/C/area/count, pick max/min), geo3 (3-D dist/angle/area from coordinates), tri-count (mcq), vec (Σ k·v; want x/y/mag/unit-x/unit-y, or ratio u/v for parallel vectors), divide (vector interpolation), dist-ratio, area (Heron fan, independent of shoelace), line-through (expression), locus & collinear (mcq), line-two-points, law-from-line, law-fit (least squares on transformed data; verifies data follow the law), table-linear (mcq), seq (AP/GP term/sum/inf/n-for-term/first-n-sum-exceeds by iteration), bounce, first-n-power-below, seq-type (mcq), value-equal (mcq, exact-value options), solve with from/to interval, linear3 (Cramer), sim2 (linear + non-linear, substitution itself verified), evaluate, solve (+pick), undefined, range-interval, compose-value, compose-solve, inverse-value, fixed-point, substitute, value, vertex-x; expression: compose-expr, find-inner, find-outer, iterate, inverse-expr, equiv-expr, from-roots; mcq: mapping-function, range-discrete, one-to-one, root-type, quad-ineq (sets between/outside/lt/gt), manual.
- Owner preview: open `/app/addmath/?semak=1` to see `review` content (banner shown); `?semak=0` to leave. Public visitors never see `review` content.

## Checks
- `bash app/addmath/tests/run-all.sh` — data validator, mutation self-test, notes validator (writes `tests/last-notes-report.md`), regressions (p2 = 10; 0.1 inverse display).
- Browser: `python3 -m http.server 8790` at repo root, then `node app/addmath/tests/notes-smoke.cjs` (all registered chapters, desktop + phone: public hiding, rendering, KaTeX, visuals' sliders, console errors) and `node app/addmath/tests/notes-browser.cjs <outdir>` (Bab 1 interactions + screenshots).

## DSKP source
DSKP KSSM Matematik Tambahan T4 & T5 (KPM, Sept 2018), from the Google Site the owner gave
(`sites.google.com/moe-dl.edu.my/matematiktambahansembaka2022/pengurusan-dokumen-kurikulum`, file id `1klx4nCJfq_H0B2lHRfUqQmfgiDM3eWRw`,
download via `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`). Not stored in the repo (KPM copyright).
Before writing a chapter, read its Standard Kandungan pages including **Catatan** (render the pages with `pdftoppm` to see symbols).
Verified page by page: Bab 1 (PDF 48–52), Bab 2 (54–56), Bab 4 (64–69), Bab 5 (72–74), Bab 6 (78–79), Bab 7 (82–85), Bab 8 (88–92), Bab 9 (96–99), Bab 10 (102–104), T5 Bab 1 (110–111), T5 Bab 2 (114–117), T5 Bab 3 (120–123), T5 Bab 4 (126–127), T5 Bab 5 (130–133), T5 Bab 6 (136–139); Bab 3 from text (no symbols). Other chapters only at code level so far. PDF page ≈ printed page + 14.

## Next steps (in order)

`\kos` = Malaysian 'kos'; `\had` = 'had' (lim). `\uv{a}` = vector notation (a with tilde under), defined in `src/notes/math.js` MACROS and in the validator's KaTeX options.

1. T5 Bab 7 Kinematik Gerakan Linear (elektif): find DSKP pages (pdftotext search for '7.1.1' after PDF 139), render and read Catatan. Reuse deriv-at, integral, stationary, trig-solve-style root scanning for displacement/velocity/acceleration. Then T5 Bab 8 Pengaturcaraan Linear (feasible region by grid search for optimum).
2. Continue T5-1 … T5-8, one chapter per commit.
3. Owner reviews Bab 1 in `?semak=1` and decides publication.

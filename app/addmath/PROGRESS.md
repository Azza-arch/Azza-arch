# Add Math notes — progress and handover

Last updated: 2026-11-23. Read this first in any new session.

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
| T5-7 | Pengaturcaraan Linear (elektif) | ✓ | ✓ (2/2 SP) | ✓ | review | Ditulis 2026-11-23. 2 subtopik, 8 contoh, 2 visual (rantau tersaur, garis objektif), 18 soalan; 6 item perlu semakan manusia. DSKP disahkan (PDF 142). Optimum disemak dengan penghitungan bucu + carian grid, atau carian semua titik integer. |
| T5-8 | Kinematik Gerakan Linear (elektif) | ✓ | ✓ (8/8 SP) | ✓ | review | Ditulis 2026-11-23. 4 subtopik, 15 contoh, 4 visual, 31 soalan; 7 item perlu semakan manusia. DSKP disahkan (PDF 146–148; rajah 8.2.1 dibaca daripada imej halaman). 8.1.2 hanya fungsi sesaran linear/kuadratik. Jawapan dibina semula secara berangka (RK4, beza terhingga, jumlah \|Δs\|). |

## V3 (student-first) redesign — branch `claude/addmath-v3`
Three modes per chapter: **Fahami** (`#/nota/<ch>/<sk>`: idea utama + bila guna → rumus → satu visual → cara menyelesaikan → satu contoh → satu kesilapan → bahagian pilihan yang boleh dibuka), **Ulang Kaji** (`#/ulangkaji/<ch>`: rumus, bila guna, langkah, kesilapan; carian + lompat), **Latihan** (`#/latihan/<ch>[/<sk>]`: tapis tahap Asas/Sederhana/Cabaran dan subtopik, pilih soalan terus, jawapan + penyelesaian + pautan konsep selepas semak).
V3 text lives in `src/content/notes/v3/<ch>.js` (lead, idea, when, steps, example/visual/mistake indices) and is merged by `loadChapterNotes`; verified notes, questions and answers are untouched. Validator: every subtopic of a chapter with a V3 file must have all fields and valid indices; chapters without V3 get a warning and a fallback page.

| Batch | Bab | V3 ditulis | Ujian auto | Status |
|---|---|---|---|---|
| 1 | T4-1, T4-2 | ✓ | ✓ | review |
| 2 | T4-3 … T4-6 | ✓ | ✓ | review |
| 3 | T4-7 … T4-10 | ✓ | ✓ | review |
| 4 | T5-1 … T5-4 | ✓ (2026-11-23) | ✓ | review |
| 5 | T5-5 … T5-8 | ✓ (2026-11-23) | ✓ | review |

## Chapter completion checklist (content audit 2026-11-23)

Regenerate the per-subtopic table with `node app/addmath/tests/content-audit.mjs`. All 18 chapters were audited against the actual files.

**What "verified" means here.** Auto-checked answers (numeric, expression, and MCQs with a data check) are re-derived by an independent solver in `tests/validate-notes.mjs` / `tests/triangle.mjs` and then typed into the real answer checker (`tests/checker-roundtrip.mjs`). Worked examples, conceptual MCQs (`check: manual`) and reasoning model answers cannot be machine-checked: on 2026-11-23 every one of them in all 18 chapters was read and its arithmetic recomputed by Claude (AI review). That is not a human academic review: `review.mathReviewed` stays empty until a person fills it.

### Honest status
| Status | Chapters |
|---|---|
| Fully completed and verified (published, owner-approved, AI-reviewed; no human `mathReviewed` sign-off recorded) | T4 Bab 1–10 |
| Completed, awaiting human academic review (`review`, visible only with `?semak=1`) | T5 Bab 1–6 (existing, audited), T5 Bab 7–8 (new) |
| Partially completed | none: every SP of every chapter has concept + worked example + questions |
| Blocked by missing source material | none. Owner decision still open: T4 Bab 10 uses clearly labelled illustrative data where the DSKP asks for authentic data |

### Per chapter
| Bab | Status | Subtopik | Contoh | Soalan | Auto | Jawapan disemak bebas | Bahagian berstruktur auto | Item semakan manusia |
|---|---|---|---|---|---|---|---|---|
| T4-1 | published | 3 | 16 | 29 | 24 | 23 | 7 | 4 |
| T4-2 | published | 3 | 19 | 30 | 20 | 19 | 15 | 4 |
| T4-3 | published | 2 | 10 | 14 | 10 | 7 | 4 | 5 |
| T4-4 | published | 4 | 21 | 37 | 30 | 29 | 2 | 7 |
| T4-5 | published | 2 | 12 | 21 | 19 | 19 | 0 | 2 |
| T4-6 | published | 3 | 10 | 23 | 19 | 15 | 2 | 7 |
| T4-7 | published | 4 | 20 | 31 | 26 | 25 | 0 | 6 |
| T4-8 | published | 3 | 14 | 21 | 16 | 12 | 4 | 7 |
| T4-9 | published | 4 | 16 | 28 | 20 | 16 | 10 | 8 |
| T4-10 | published | 2 | 10 | 16 | 12 | 10 | 4 | 4 |
| T5-1 | review | 4 | 14 | 24 | 20 | 18 | 4 | 4 |
| T5-2 | review | 4 | 23 | 38 | 31 | 27 | 8 | 7 |
| T5-3 | review | 4 | 18 | 30 | 24 | 20 | 6 | 7 |
| T5-4 | review | 2 | 11 | 19 | 16 | 14 | 2 | 4 |
| T5-5 | review | 3 | 17 | 26 | 19 | 14 | 10 | 8 |
| T5-6 | review | 6 | 21 | 35 | 27 | 22 | 10 | 9 |
| T5-7 | review | 2 | 8 | 18 | 12 | 10 | 8 | 6 |
| T5-8 | review | 4 | 15 | 31 | 24 | 21 | 9 | 7 |
| **Jumlah** | | **59** | **275** | **471** | **369** | **321** | **105** | **106** |

"Auto" = MCQ, numeric and expression questions (the hub practice pool). "Jawapan disemak bebas" = those whose key is re-derived by a solver (the rest are conceptual MCQs). Structured parts and reasoning are practised in the hub as written questions. Every auto question and every numeric/expression part also passes the checker round trip.

### Per subtopic
SP = learning standards with concept + example + question; Obj = learning objective (V3 `lead`); Nota = concept sections · formula block · visuals · common mistakes; Bebas = auto answers re-derived independently; MK = auto questions with targeted misconception feedback; Ptj = questions with progressive hints in the hub (≥ 3 solution steps, owner rule D7).

| Bab | Subtopik | Status | SP | Obj | Nota (konsep·rumus·visual·kesilapan) | Contoh | Auto | Bebas | Str/Pn | MK | Ptj |
|---|---|---|---|---|---|---|---|---|---|---|---|
| t4-1 | 1.1 Fungsi | published | 3/3 | ✓ | 6·✓·5·4 | 5 | 7 | 6 | 2/1 | 7/7 | 2/10 |
| t4-1 | 1.2 Fungsi Gubahan | published | 5/5 | ✓ | 5·✓·2·4 | 6 | 8 | 8 | 1/0 | 8/8 | 3/9 |
| t4-1 | 1.3 Fungsi Songsang | published | 3/3 | ✓ | 4·✓·2·4 | 5 | 9 | 9 | 0/1 | 9/9 | 6/10 |
| t4-2 | 2.1 Persamaan dan Ketaksamaan Kuadratik | published | 3/3 | ✓ | 4·✓·2·4 | 7 | 6 | 6 | 2/1 | 6/6 | 5/9 |
| t4-2 | 2.2 Jenis-jenis Punca Persamaan Kuadratik | published | 2/2 | ✓ | 2·✓·1·3 | 5 | 7 | 7 | 1/1 | 7/7 | 2/9 |
| t4-2 | 2.3 Fungsi Kuadratik | published | 6/6 | ✓ | 6·✓·2·4 | 7 | 7 | 6 | 4/1 | 7/7 | 3/12 |
| t4-3 | 3.1 Sistem Persamaan Linear dalam Tiga Pemboleh Ubah | published | 3/3 | ✓ | 4·✓·1·3 | 5 | 5 | 3 | 1/1 | 5/5 | 3/7 |
| t4-3 | 3.2 Persamaan Serentak: Satu Linear dan Satu Tak Linear | published | 2/2 | ✓ | 3·✓·1·3 | 5 | 5 | 4 | 1/1 | 5/5 | 4/7 |
| t4-4 | 4.1 Hukum Indeks | published | 2/2 | ✓ | 2·✓·1·3 | 5 | 7 | 7 | 0/1 | 7/7 | 1/8 |
| t4-4 | 4.2 Hukum Surd | published | 5/5 | ✓ | 5·✓·1·4 | 5 | 9 | 8 | 0/1 | 9/9 | 0/10 |
| t4-4 | 4.3 Hukum Logaritma | published | 5/5 | ✓ | 5·✓·1·3 | 6 | 9 | 9 | 0/3 | 9/9 | 1/12 |
| t4-4 | 4.4 Aplikasi Indeks, Surd dan Logaritma | published | 1/1 | ✓ | 1·✓·1·3 | 5 | 5 | 5 | 1/1 | 4/5 | 0/7 |
| t4-5 | 5.1 Janjang Aritmetik | published | 4/4 | ✓ | 4·✓·1·3 | 6 | 9 | 9 | 0/1 | 9/9 | 2/10 |
| t4-5 | 5.2 Janjang Geometri | published | 5/5 | ✓ | 5·✓·1·3 | 6 | 10 | 10 | 0/1 | 10/10 | 1/11 |
| t4-6 | 6.1 Hubungan Linear dan Tak Linear | published | 4/4 | ✓ | 4·✓·1·3 | 4 | 8 | 5 | 0/1 | 8/8 | 1/9 |
| t4-6 | 6.2 Hukum Linear dan Hubungan Tak Linear | published | 1/1 | ✓ | 1·✓·1·3 | 4 | 7 | 6 | 0/1 | 7/7 | 0/8 |
| t4-6 | 6.3 Aplikasi Hukum Linear | published | 1/1 | ✓ | 1·✓·1·2 | 2 | 4 | 4 | 1/1 | 4/4 | 1/6 |
| t4-7 | 7.1 Pembahagi Tembereng Garis | published | 3/3 | ✓ | 3·✓·1·2 | 5 | 7 | 7 | 0/1 | 7/7 | 0/8 |
| t4-7 | 7.2 Garis Lurus Selari dan Garis Lurus Serenjang | published | 2/2 | ✓ | 2·✓·1·2 | 5 | 6 | 5 | 0/1 | 6/6 | 1/7 |
| t4-7 | 7.3 Luas Poligon | published | 5/5 | ✓ | 4·✓·1·3 | 6 | 8 | 8 | 0/2 | 8/8 | 2/10 |
| t4-7 | 7.4 Persamaan Lokus | published | 2/2 | ✓ | 2·✓·1·2 | 4 | 5 | 5 | 0/1 | 5/5 | 0/6 |
| t4-8 | 8.1 Vektor | published | 4/4 | ✓ | 4·✓·1·2 | 5 | 7 | 5 | 0/1 | 7/7 | 2/8 |
| t4-8 | 8.2 Penambahan dan Penolakan Vektor | published | 2/2 | ✓ | 2·✓·1·2 | 4 | 5 | 3 | 0/1 | 5/5 | 0/6 |
| t4-8 | 8.3 Vektor dalam Satah Cartes | published | 4/4 | ✓ | 4·✓·1·2 | 5 | 4 | 4 | 2/1 | 4/4 | 0/7 |
| t4-9 | 9.1 Petua Sinus | published | 5/5 | ✓ | 4·✓·2·3 | 5 | 8 | 7 | 1/1 | 8/8 | 2/10 |
| t4-9 | 9.2 Petua Kosinus | published | 3/3 | ✓ | 3·✓·1·3 | 4 | 5 | 3 | 1/1 | 5/5 | 1/7 |
| t4-9 | 9.3 Luas Segi Tiga | published | 3/3 | ✓ | 3·✓·1·2 | 4 | 4 | 4 | 1/1 | 4/4 | 0/6 |
| t4-9 | 9.4 Aplikasi Petua Sinus, Petua Kosinus dan Luas Segi Tiga | published | 1/1 | ✓ | 1·✓·1·2 | 3 | 3 | 2 | 1/1 | 3/3 | 0/5 |
| t4-10 | 10.1 Nombor Indeks | published | 3/3 | ✓ | 3·✓·1·2 | 5 | 6 | 4 | 1/1 | 6/6 | 0/8 |
| t4-10 | 10.2 Indeks Gubahan | published | 2/2 | ✓ | 2·✓·1·2 | 5 | 6 | 6 | 1/1 | 5/6 | 3/8 |
| t5-1 | 1.1 Radian | review | 1/1 | ✓ | 1·✓·1·2 | 3 | 4 | 4 | 0/1 | 4/4 | 0/5 |
| t5-1 | 1.2 Panjang Lengkok Suatu Bulatan | review | 3/3 | ✓ | 3·✓·1·2 | 4 | 6 | 5 | 1/0 | 6/6 | 1/7 |
| t5-1 | 1.3 Luas Sektor Suatu Bulatan | review | 3/3 | ✓ | 3·✓·1·2 | 4 | 6 | 6 | 0/1 | 6/6 | 1/7 |
| t5-1 | 1.4 Aplikasi Sukatan Membulat | review | 1/1 | ✓ | 1·✓·1·2 | 3 | 4 | 3 | 1/0 | 4/4 | 0/5 |
| t5-2 | 2.1 Had dan Hubungannya dengan Pembezaan | review | 2/2 | ✓ | 2·✓·1·2 | 5 | 5 | 4 | 0/1 | 4/5 | 2/6 |
| t5-2 | 2.2 Pembezaan Peringkat Pertama | review | 4/4 | ✓ | 4·✓·1·3 | 5 | 8 | 7 | 0/1 | 8/8 | 2/9 |
| t5-2 | 2.3 Pembezaan Peringkat Kedua | review | 1/1 | ✓ | 1·✓·1·1 | 3 | 4 | 3 | 1/0 | 4/4 | 1/5 |
| t5-2 | 2.4 Aplikasi Pembezaan | review | 9/9 | ✓ | 6·✓·1·3 | 10 | 14 | 13 | 3/1 | 14/14 | 4/18 |
| t5-3 | 3.1 Pengamiran sebagai Songsangan Pembezaan | review | 1/1 | ✓ | 1·✓·1·1 | 3 | 4 | 3 | 0/1 | 4/4 | 0/5 |
| t5-3 | 3.2 Kamiran Tak Tentu | review | 4/4 | ✓ | 4·✓·1·3 | 5 | 7 | 6 | 1/0 | 7/7 | 0/8 |
| t5-3 | 3.3 Kamiran Tentu | review | 5/5 | ✓ | 4·✓·2·3 | 7 | 10 | 9 | 1/1 | 10/10 | 5/12 |
| t5-3 | 3.4 Aplikasi Pengamiran | review | 1/1 | ✓ | 1·✓·1·1 | 3 | 3 | 2 | 1/1 | 3/3 | 0/5 |
| t5-4 | 4.1 Pilih Atur | review | 3/3 | ✓ | 3·✓·1·3 | 6 | 10 | 9 | 0/1 | 10/10 | 4/11 |
| t5-4 | 4.2 Gabungan | review | 3/3 | ✓ | 3·✓·1·3 | 5 | 6 | 5 | 1/1 | 6/6 | 1/8 |
| t5-5 | 5.1 Pemboleh Ubah Rawak | review | 4/4 | ✓ | 3·✓·1·2 | 4 | 4 | 2 | 1/1 | 4/4 | 2/6 |
| t5-5 | 5.2 Taburan Binomial | review | 5/5 | ✓ | 5·✓·1·2 | 6 | 7 | 6 | 2/1 | 6/7 | 4/10 |
| t5-5 | 5.3 Taburan Normal | review | 5/5 | ✓ | 4·✓·1·3 | 7 | 8 | 6 | 1/1 | 8/8 | 1/10 |
| t5-6 | 6.1 Sudut Positif dan Sudut Negatif | review | 1/1 | ✓ | 1·✓·1·1 | 3 | 4 | 2 | 0/1 | 4/4 | 1/5 |
| t5-6 | 6.2 Nisbah Trigonometri bagi Sebarang Sudut | review | 2/2 | ✓ | 2·✓·1·2 | 3 | 5 | 5 | 1/0 | 5/5 | 0/6 |
| t5-6 | 6.3 Graf Fungsi Sinus, Kosinus dan Tangen | review | 2/2 | ✓ | 2·✓·1·2 | 4 | 6 | 5 | 0/1 | 6/6 | 2/7 |
| t5-6 | 6.4 Identiti Asas | review | 2/2 | ✓ | 2·✓·1·1 | 3 | 4 | 3 | 0/1 | 4/4 | 1/5 |
| t5-6 | 6.5 Rumus Sudut Majmuk dan Rumus Sudut Berganda | review | 3/3 | ✓ | 3·✓·1·2 | 4 | 4 | 4 | 1/1 | 4/4 | 0/6 |
| t5-6 | 6.6 Aplikasi Fungsi Trigonometri | review | 2/2 | ✓ | 2·✓·1·2 | 4 | 4 | 3 | 2/0 | 4/4 | 0/6 |
| t5-7 | 7.1 Model Pengaturcaraan Linear | review | 1/1 | ✓ | 2·✓·1·4 | 4 | 6 | 5 | 2/1 | 6/6 | 2/9 |
| t5-7 | 7.2 Aplikasi Pengaturcaraan Linear | review | 1/1 | ✓ | 2·✓·1·3 | 4 | 6 | 5 | 2/1 | 6/6 | 6/9 |
| t5-8 | 8.1 Sesaran, Halaju dan Pecutan sebagai Fungsi Masa | review | 2/2 | ✓ | 3·✓·1·3 | 4 | 7 | 5 | 1/0 | 7/7 | 2/8 |
| t5-8 | 8.2 Pembezaan dalam Kinematik Gerakan Linear | review | 3/3 | ✓ | 3·✓·1·3 | 4 | 8 | 7 | 0/1 | 8/8 | 2/9 |
| t5-8 | 8.3 Pengamiran dalam Kinematik Gerakan Linear | review | 2/2 | ✓ | 2·✓·1·3 | 4 | 5 | 5 | 1/1 | 5/5 | 2/7 |
| t5-8 | 8.4 Aplikasi Kinematik Gerakan Linear | review | 1/1 | ✓ | 1·✓·1·2 | 3 | 4 | 4 | 2/1 | 4/4 | 3/7 |

**Jumlah (2026-11-25):** 59 subtopik · 275 contoh · 488 soalan (386 auto, 338 dengan jawapan disemak bebas, 48 berstruktur, 54 penaakulan) · maklum balas salah faham 382/386 · petunjuk berperingkat 97/488

**2026-11-25: 17 soalan automatik ditambah** supaya setiap subtopik ada sekurang-kurangnya 5 soalan automatik (syarat bukti tahap Mahir di Learning Hub, `MAHIR_WINDOW = 5`). Subtopik: T4 6.3, 8.3, 9.3, 9.4 (+2); T5 1.1, 1.4, 2.3, 3.1, 3.4 (+2), 5.1, 6.1, 6.4, 6.5, 6.6, 8.4. Semua jawapan dikira semula secara bebas oleh `validate-notes` dan diuji melalui `checkSingle` (`checker-roundtrip`: 491 jawapan). Ditanda `provenance.createdAt: 2026-11-25`; diterbitkan atas arahan pemilik; belum disemak oleh guru (tambah kepada senarai semakan manusia).

### Fixed during this audit
- `t4-1.2-03`, `t4-2.1-04`: two misconceptions produced the same expression, so the second feedback could never appear. Merged into one feedback naming both causes (found by the new checker round trip).
- `t4-9.4-02`, `t4-9.4-05`, `t4-6.3-03`: prompts depended on a neighbouring question ("kuboid yang sama", "soalan piramid di atas", "hukum yang sama"), but the hub serves questions one at a time. Each now states its own data.
- 41 auto questions had no targeted misconception feedback; added verified wrong values (each `derive` recomputed by the validator, each value round-tripped through the checker). 4 remain without one because no realistic exact wrong value exists: `t4-4.4-01`, `t4-10.2-05`, `t5-2.1-02`, `t5-5.2-07` (they show the generic "semak langkah" message).
- T5 Bab 1–8 had no V3 layer (learning objective, main idea, when to use, steps); written for all 29 subtopics, so the hub's Fahami view is the same for T4 and T5.
- No mathematical error was found in any worked example or manual item of T4 Bab 1–10 or T5 Bab 1–6.

### Known gaps (not errors)
- Progressive hints: 95 of 471 questions qualify (≥ 3 steps). The rest still have full worked solutions after answering.
- Worked examples have no machine check; they rely on the 2026-11-23 AI read-through plus human review.

## How the notes system works
- Chapter file: `src/content/notes/<id>.js` exporting `CHAPTER` (subtopics + questions). Register it in `src/content/notes/index.js` (`NOTE_MODULES` and `NOTE_STATUS`).
- Subtopic = one scrolling page (`#/nota/<id>/<sk>`), sections: intro, prereq, concept (tag `sp`), visual (`spec` + `alt` text), formula, examples (given/find/method/steps with why/check/conclusion), mistakes, summary, next. Practice is appended from `questions` with matching `subtopic`.
- Visual types (`src/notes/visuals.js`): `plot` (noAxes for pure geometry; labels [{at,text}] free text; arrows [{from,to,label,dashed,color}] for vectors; equalAspect for geometry; polygons/segments; closed relations; per-axis gridX/gridY/labelStepX/labelStepY for large ranges; left margin auto-fits long labels) (functions, relations, sliders, vertical/horizontal test lines, points, shading, readout), `mapping`, `table`. Add new types there when a chapter needs them (e.g. vectors, sectors, probability bars).
- Maths: write `\( … \)` inline and `\[ … \]` display inside `String.raw` strings; KaTeX is self-hosted in `vendor/katex` (MathML output for screen readers).
- **Numeric tolerance is ABSOLUTE** (since the Bab 10 audit): use 0.0006 for answers to 3 d.p. and 0.006 for 2 d.p.; omit it for exact answers. Previously it was relative, which made large rounded answers far too lenient (regression test added).
- Wrong values can carry `derive: '<expr>'` (the stated mistake); the validator recomputes it. Use it for every new numeric distractor (two hand-computed distractors in T5-1 were wrong before this existed).
- Test evaluator (tests/solvers.mjs) supports pi, sin/cos/tan (radians).
- Question types: `mcq`, `numeric`, `expression` (checked by equivalence), `structured` (parts), `reasoning` (manual). Each auto-checked item has a `check` spec that `tests/validate-notes.mjs` re-solves independently (see `expected()`/`checkExpression()`); add new check kinds there for new chapters (e.g. quadratic roots, discriminant, logs).
- Validator check kinds available: lp (T5 Bab 7: vertex enumeration of all boundary-line crossings, cross-checked by a 2001² grid that must never beat it; integer: brute force over every lattice point; want value|x|y, x,y ≥ 0 implicit), line-cross, halfplane (mcq: inequality options compared as solution sets), lp-point (mcq), kin (T5 Bab 8, x stands for t: from a(t) RK4 with v0/s0, from v(t) Simpson, from s(t) finite differences; want s|v|a at t), kin-extreme (scan of the motion marched forward once), distance (Σ|Δs| on the marched grid), expr-equal (mcq, function equivalence), trig-solve (all roots by scan: sign change + tangency + grid zeros, rejects asymptotes; count/min/max/nth; f in radians, interval in degrees), trig-graph (max/min/amp/period measured), prob-count (enumerated equally likely outcomes), binom (trial-by-trial convolution, no nCr), binom-stat, binom-find, normal (density integrated by Simpson, no table), normal-inv, normal-param, count (brute-force enumeration: perm/comb/product, identical items, circular, where-predicate), antideriv (expr; d/dx(answer) = integrand numerically, needs upToConstant), curve-through (expr), integral (Simpson), area-curve (|f − g| split at crossings), volume (π∫f² by Simpson), riemann, limit (two-sided, Richardson), deriv / deriv-at (5-point stencil, order 1|2), tangent-line / normal-line (expr), line-at, stationary (sign-change scan, pick, want y), nature (mcq), inflection, extremum (scan + golden), rate, rate-inverse, small-change (delta/approx/percent), circ (arc/chord/sector/segment/perimeters/annulus measured on a fine polygon; solveFor j|theta by bisection), index (Q1/Q0×100 from raw quantities; want q1/q0; qs chain), composite (Σ I·w / Σ w), tri (tests/triangle.mjs builds the triangle from coordinates — SSS, SAS, ASA/AAS, SSA incl. ambiguous count, two sides + area; want a/b/c/A/B/C/area/count, pick max/min), geo3 (3-D dist/angle/area from coordinates), tri-count (mcq), vec (Σ k·v; want x/y/mag/unit-x/unit-y, or ratio u/v for parallel vectors), divide (vector interpolation), dist-ratio, area (Heron fan, independent of shoelace), line-through (expression), locus & collinear (mcq), line-two-points, law-from-line, law-fit (least squares on transformed data; verifies data follow the law), table-linear (mcq), seq (AP/GP term/sum/inf/n-for-term/first-n-sum-exceeds by iteration), bounce, first-n-power-below, seq-type (mcq), value-equal (mcq, exact-value options), solve with from/to interval, linear3 (Cramer), sim2 (linear + non-linear, substitution itself verified), evaluate, solve (+pick), undefined, range-interval, compose-value, compose-solve, inverse-value, fixed-point, substitute, value, vertex-x; expression: compose-expr, find-inner, find-outer, iterate, inverse-expr, equiv-expr, from-roots; mcq: mapping-function, range-discrete, one-to-one, root-type, quad-ineq (sets between/outside/lt/gt), manual.
- Owner preview: open `/app/addmath/?semak=1` to see `review` content (banner shown); `?semak=0` to leave. Public visitors never see `review` content.

## Checks
- `bash app/addmath/tests/run-all.sh` — data validator, mutation self-test, notes validator (writes `tests/last-notes-report.md`), regressions (p2 = 10; 0.1 inverse display; LP and kinematics solvers), and the **checker round trip** (`tests/checker-roundtrip.mjs`: every stored answer and every misconception value typed into the real `checkSingle` used by the notes app and the hub).
- `node app/addmath/tests/content-audit.mjs` — prints the chapter completion checklist below from the real content files.
- Browser: `node app/addmath/tests/notes-smoke.cjs` (files served in-process via `denai/hub/tests/serve.cjs`; `NOTES_SMOKE_SERVER=1` uses `python3 -m http.server 8790` instead) (all registered chapters, desktop + phone: public hiding, rendering, KaTeX, visuals' sliders, console errors) and `node app/addmath/tests/notes-browser.cjs <outdir>` (Bab 1 interactions + screenshots).

## DSKP source
DSKP KSSM Matematik Tambahan T4 & T5 (KPM, Sept 2018), from the Google Site the owner gave
(`sites.google.com/moe-dl.edu.my/matematiktambahansembaka2022/pengurusan-dokumen-kurikulum`, file id `1klx4nCJfq_H0B2lHRfUqQmfgiDM3eWRw`,
download via `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`). Not stored in the repo (KPM copyright).
Before writing a chapter, read its Standard Kandungan pages including **Catatan** (render the pages with `pdftoppm` to see symbols).
Verified page by page: T5 Bab 7 (PDF 142), T5 Bab 8 (PDF 146–148; 8.2.1 diagram from the rendered page), Bab 1 (PDF 48–52), Bab 2 (54–56), Bab 4 (64–69), Bab 5 (72–74), Bab 6 (78–79), Bab 7 (82–85), Bab 8 (88–92), Bab 9 (96–99), Bab 10 (102–104), T5 Bab 1 (110–111), T5 Bab 2 (114–117), T5 Bab 3 (120–123), T5 Bab 4 (126–127), T5 Bab 5 (130–133), T5 Bab 6 (136–139); Bab 3 from text (no symbols). Other chapters only at code level so far. PDF page ≈ printed page + 14.

## Next steps (in order)

`\kos` = Malaysian 'kos'; `\had` = 'had' (lim). `\uv{a}` = vector notation (a with tilde under), defined in `src/notes/math.js` MACROS and in the validator's KaTeX options.

1. Owner / academic reviewer: review T5 Bab 1–8 in `?semak=1` (the 106 "perlu semakan manusia" items first), then set `status: 'published'` and `review.ownerApproved` by hand per chapter (chapter file, its subtopics and questions, and `NOTE_STATUS`).
2. Owner decision on T4 Bab 10 illustrative vs authentic index data (unchanged).
3. Optional: progressive hints exist only for questions with ≥ 3 solution steps (owner rule D7); 376 of 471 questions have 1–2 steps. Longer worked solutions would add hints without changing the rule.

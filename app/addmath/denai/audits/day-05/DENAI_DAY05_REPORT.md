# DENAI — Day 05: Kualiti gameplay & UX puzzle (2026-11-18)

Branch `claude/denai-day05-gameplay`, dicabang daripada `82af8fd` (Day 04). Branch Day 04 tidak diubah. Tiada merge dan tiada deploy. `design/trailer/` tidak disentuh.

## 1. Ringkasan
Audit Fasa 1 ([`DAY05_GAMEPLAY_AUDIT.md`](DAY05_GAMEPLAY_AUDIT.md)) menemui 0 isu P0, 3 isu P1 dan 5 kumpulan P2. Pemilik meluluskan item 1–6 ([`DAY05_IMPLEMENTATION_PLAN.md`](DAY05_IMPLEMENTATION_PLAN.md)); P2-D dan P2-E tidak diluluskan dan tidak disentuh.

Keenam-enam item sudah dilaksanakan dalam 8 fail sumber (+40/−19 baris), tanpa mengubah save, sesi puzzle, matematik, fizik, laluan, progresi atau syarat kemenangan. Ujian regresi baharu `tests/day05-gameplay-check.cjs` disahkan:
- **gagal** pada kod Day 04 (`82af8fd`) bagi keenam-enam item;
- **lulus** pada kod Day 05.

## 2. Penemuan audit (ringkas)
| ID | Tahap | Isu |
|---|---|---|
| P1-A | P1 | Membuka semula stor dengan E/Guna terus membeli (`useQuest` → `openStore` + `buy`) |
| P1-B | P1 | Panel stor terpotong pada telefon landskap sempit, contohnya iPhone SE 568×320 (`ui/v4.css`, lebar 50% < baris butang) |
| P1-C | P1 | 1-2 memaparkan "E" pada peranti sentuh (label tetap dalam `twin-scene.js`). Fungsi Guna tidak terjejas. |
| P2-A | P2 | Gesaan penamat 1-2 dipotong oleh `slice(4)` ("jambatan bengkel dahulu"), dan label kekunci dipaparkan pada mesej yang bukan tindakan |
| P2-B | P2 | Jurnal boleh terbuka di atas stor, dan E masih membeli di belakang Jurnal |
| P2-C | P2 | Pin kekal "✓" selepas misi tanpa arah seterusnya |

## 3. Pembaikan
| # | Item | Perubahan | Fail |
|---|---|---|---|
| 1 | P1-A | E/Guna di pintu **hanya membuka** panel. Pembelian melalui butang **Beli**, atau E semasa panel terbuka iaitu pintasan kekunci yang tertulis pada butang "Beli · E". Guna semasa panel terbuka tidak membeli. Mesej lama dikosongkan setiap kali panel dibuka. Validasi bajet dan kuantiti tidak berubah. Pembelian berganda masih disekat oleh `qs.bought`. | `levels/supply-quest.js` |
| 2 | P1-B | Landskap pendek: lebar `min(430px, max(50%, 330px))`, `left` dihadkan supaya tepi kanan ≥ 8 px dari skrin. Bagi skrin ≤ 640 px, jarak antara butang dirapatkan (gap 4 px, butang ±38 px) supaya baris muat dalam bingkai kayu tanpa menutup lebih banyak pemandangan. Resit dan mesej boleh dibalut. | `ui/v4.css` |
| 3 | P1-C | Gesaan 1-2 guna `wsp.key`: "Guna" pada sentuh, "E" pada papan kekunci (seperti 1-1 dan 1-3) | `levels/twin-scene.js` |
| 4 | P2-A | Pembantu baharu `fixedPrompt({key, text})` untuk gesaan tetap 1-2/1-3. Teks tidak lagi dipotong mengikut panjang awalan. `key: null` bermaksud mesej penerangan, jadi tiada label kekunci. 1-1 (`placeWorldPrompt`) memaparkan semula label kekunci untuk gesaan tindakan. | `presentation.js`, `levels/twin-scene.js`, `levels/inverse-scene.js` |
| 5 | P2-B | `openJournal` memancarkan `journal-open`; 1-1 menutup stor bila menerimanya (pendengar dibuang semasa scene shutdown). Pengendali kekunci stor diabaikan semasa `journal-open`. Kedua-dua panel boleh dibuka semula. | `ui/v4-ui.js`, `levels/supply-quest.js` |
| 6 | P2-C | Pin selepas misi: "Jambatan dibaiki ✓ · Ke penamat →", "Jambatan bengkel siap ✓ · Ke penamat →", "Pintu air pulih ✓ · Ke penamat →". Teks sahaja; progresi tidak berubah. | `levels/supply-quest.js`, `levels/workshop-line.js`, `levels/sluice-line.js` |

**Nota tafsiran (item 1):** "pembelian hanya melalui butang Beli" dilaksanakan sebagai:
- butang Beli;
- pintasan papan kekunci E **semasa panel terbuka**, yang memang tertulis pada butang ("Beli · E") dan sudah wujud sejak V4.

E atau Guna **di pintu** tidak lagi membeli.

## 4. Fail diubah
- **Kod:**
  - `src/v14/levels/supply-quest.js`
  - `src/v14/levels/twin-scene.js`
  - `src/v14/levels/inverse-scene.js`
  - `src/v14/levels/workshop-line.js`
  - `src/v14/levels/sluice-line.js`
  - `src/v14/presentation.js`
  - `src/v14/ui/v4-ui.js`
  - `src/v14/ui/v4.css`
- **Ujian:**
  - `tests/day05-gameplay-check.cjs` (baharu)
  - `tests/w1-mobile-check.cjs`: tambah semakan kandungan panel stor (elemen anak dalam bingkai dan dalam skrin)
- **Dokumen:**
  - `audits/day-05/DAY05_GAMEPLAY_AUDIT.md`
  - `audits/day-05/DAY05_IMPLEMENTATION_PLAN.md`
  - laporan ini
  - `audits/day-05/shots/` (14 sebelum, 9 selepas)

## 5–6. Ujian dan keputusan
Semua dijalankan pada branch ini dengan `rc=$?` diambil sejurus selepas setiap arahan. Chromium headless sahaja; **tiada ujian pada peranti sebenar**. PlayFab di-stub dan hosnya disekat.

| Ujian | Kod keluar | Nota |
|---|---|---|
| `analytics.test.mjs` | 0 | 5 lulus |
| `inverse.test.mjs` | 0 | |
| `progress-course.test.mjs` | 0 | 4 lulus |
| `puzzle-session.test.mjs` | 0 | 10 lulus |
| `puzzles.test.mjs` | 0 | 8 lulus |
| `sluice.test.mjs` | 0 | |
| `supply-quest.test.mjs` | 0 | 4 lulus |
| `twins.test.mjs` | 0 | |
| `workshop-v3.test.mjs` | 0 | |
| `workshop.test.mjs` | 0 | |
| `puzzle-reload-check` | 0 | sesi kekal selepas reload; nombor pada skrin = sesi |
| **`day05-gameplay-check` (baharu)** | 0 | keenam-enam item; 11 viewport untuk panel stor |
| `day05-gameplay-check` pada `82af8fd` (bukti) | **1 (dijangka)** | gagal pada item 1, 2 (SE landskap: resit, jumlah, Tutup, mesej), 3, 4, 5 dan 6 |
| `l1-playthrough` / `l2-playthrough` / `l3-playthrough` | 0 / 0 / 0 | 76 / 75 / 113 s |
| `w1-progression` | 0 | 310 s; progresi 1-1 → 1-3, ulang main dan profil lama |
| `w1-mobile-check` | 0 | 11 viewport × 3 level, 0 isu termasuk semakan baharu kandungan stor |
| `rc-check` / `menu-check` | 0 / 0 | |
| `l1-v3-check` / `l2-check` / `l3-check` | 0 / 0 / 0 | putaran K2/K3, telefon "Guna", migrasi |

**Ralat konsol:** tiada dalam semua ujian di atas. Setiap ujian pelayar merekod `pageerror` dan `console.error`; ralat rangkaian PlayFab yang disekat ditapis.

**Semakan wajib:**
1. Sesi baharu kekal selepas reload, dan sesi sedia ada tidak dijana semula (`puzzle-reload-check`, `puzzle-session`).
2. Ulang main menjana sesi baharu (`puzzle-session` ujian 7, `l2-check`).
3. Save lama serasi (`puzzle-session` ujian 5, `l1-v3-check`, `l2-check`, `w1-progression`).
4. Objektif yang selesai kekal selesai (`puzzle-session` ujian 6, `w1-progression`).
5. Jawapan salah ditolak dan jawapan betul diterima (playthrough, `day05-gameplay-check`).
6. Ketiga-tiga level boleh dimainkan hingga tamat.
7. Susun atur mudah alih: 11 viewport.
8. Tiada ralat konsol baharu.

**Ukuran panel stor (selepas):** semua elemen dalam bingkai dan dalam skrin pada 11 viewport. iPhone SE landskap 568×320: panel x = 230…560, semua elemen anak ≤ 548 (tepi dalam bingkai). Sebelum ini Tutup dan resit menjangkau x = 597.

## 7. Tangkapan skrin (sebelum → selepas)
| Item | Sebelum | Selepas |
|---|---|---|
| 1 Buka semula stor | [a3](shots/a3-l1-buka-semula-terus-beli.png) "Dibeli 5 papan" tanpa tekan Beli | [selepas-1](shots/selepas-1-buka-semula-tiada-beli.png) panel terbuka, tiada pembelian |
| 2 Panel SE landskap | [d-se-landscape](shots/d-se-landscape-l1-stor.png) "Tutu", formula terpotong | [selepas-2](shots/selepas-2-stor-iphone-se-landskap.png) Tutup penuh, "C(x) = 4x + 6" lengkap |
| 3 1-2 telefon | [d-portrait-l2-tuas](shots/d-portrait-l2-tuas.png) "E · Jalankan bengkel" | [selepas-3](shots/selepas-3-l2-tuas-telefon.png) "Guna · Jalankan bengkel" (desktop: [E](shots/selepas-3-l2-tuas-desktop.png)) |
| 4 Gesaan penamat | [d-portrait-l2-penamat-sekat](shots/d-portrait-l2-penamat-sekat.png) "E · jambatan bengkel dahulu" | [selepas-4](shots/selepas-4-l2-penamat-telefon.png) "Bina jambatan bengkel dahulu", tanpa label |
| 5 Jurnal vs stor | [a7](shots/a7-l1-stor-dan-jurnal.png) dua panel bertindih | [selepas-5](shots/selepas-5-jurnal-tutup-stor.png) Jurnal sahaja |
| 6 Pin selepas misi | [a5](shots/a5-l1-tebing-berliku.png) "Jambatan dibaiki ✓" | [selepas-6 1-1](shots/selepas-6-l1-ke-penamat.png), [1-3](shots/selepas-6-l3-ke-penamat.png) "… ✓ · Ke penamat →" |

## 8. Isu yang tinggal
- **P2-D** (pin objektif 1-2/1-3 dari mula) dan **P2-E** (pin potret terpotong "…", saiz pemain pada telefon kecil, dan lain-lain): tidak diluluskan untuk Day 05; tidak disentuh.
- Pada iPhone SE landskap (568 px), panel stor perlukan sekurang-kurangnya 330 px. Semasa panel terbuka, ia menutup sebahagian pemain (pergerakan memang dikunci semasa panel terbuka). Sebelum ini kandungan terpotong.

## 9. Risiko
- Ujian hanya dalam Chromium headless. Saiz font dan rendering sebenar pada Safari iOS dan Android boleh berbeza sedikit; disyorkan semakan pada peranti sebenar (SE kecil, telefon Android biasa).
- CSS landskap pendek dikongsi semua telefon landskap. Ia disahkan pada 6 saiz landskap dan 5 potret/desktop/tablet tanpa isu.
- Pemain yang biasa "E di pintu = beli" kini perlu tekan E sekali lagi (atau Beli) selepas panel terbuka. Ini sengaja, untuk elakkan pembelian tanpa sengaja.

## 10. Git
- Branch `claude/denai-day05-gameplay`, dicabang daripada `82af8fd`.
- Commit: lihat mesej akhir dalam sesi. Hanya fail Day 05 di-commit; `design/trailer/` dikecualikan.

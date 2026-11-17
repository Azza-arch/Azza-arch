# World 1 V3 · Fasa F — Ujian penuh, prestasi & kemasan akhir

Branch calon keluaran: `claude/denai-w1-v3-rc` (dari `claude/denai-w1-v3-l3`; mengandungi semua kerja
Fasa C–F). `main` = `ef9c3b5`, tidak berubah sejak V3 bermula, jadi tiada konflik. **Tidak di-merge, tidak di-deploy.**

## 1. Keputusan ringkas
RESULT_SUMMARY

## 2. Prestasi (sebelum → selepas, syarat sama)
Alat: `tests/w1-perf.cjs`. Chromium tanpa kepala, **Phaser Canvas 2D** (`type: Phaser.CANVAS`, satu
`Phaser.Game` untuk ketiga-tiga level, disahkan dalam `game.js` dan semasa larian: `renderType = 1`).
Profil: desktop 1280×720; iPhone 13 landskap & potret dengan **CPU ×4 perlahan** (CDP). Setiap sampel
240 bingkai: masa bingkai (purata / median / p95 / p99 / maks), bingkai > 33 ms dan > 50 ms, masa dalam
`renderer.render`. Diukur diam di 4 lokasi + berlari (kamera bergerak) + 3 ujian pengasingan.
Tiada GPU: nombor mutlak ialah proksi telefon perlahan, bukan janji untuk telefon sebenar.

PERF_TABLE

**Punca (diukur, bukan diandaikan):** pemapar Canvas melukis setiap imej setiap bingkai, termasuk yang di
luar skrin — latar paralaks (bekas ~3 400 jubin) dan ~1 100–1 150 jubin rupa bumi. Ujian pengasingan
(hentikan putaran syiling, jeda pemasa/air, 10 letupan kutip serentak) tidak memberi perbezaan bermakna
sebelum mahupun selepas pembaikan → **tiada animasi atau kesan dikurangkan**.

**Pembaikan:** `core/view-cull.js` (dari 1-3) kini dalam 1-1 dan 1-2. Hanya `Image` statik dilangkau
lukisannya melalui `cameraFilter` (bukan `visible`), jadi fizik, perlanggaran, pengutip, rahsia dan objek
interaktif tidak tersentuh. Jaring keselamatan: imej dengan badan fizik dinamik tidak pernah di-cull;
imej yang bergerak selepas dipasang dilepaskan dan sentiasa dilukis.
**Pengesahan:** `tests/view-cull-check.cjs` — 62 pandangan (1-1: 22, 1-2: 18, 1-3: 22), cull hidup vs
mati, sebelum & selepas misi (jambatan dibaiki + kotak ditolak; mesin ditukar + jambatan bengkel; pintu
air dibuka + peti gua): **semua sama bait demi bait**, 0 ralat. Playthrough penuh (perlanggaran jambatan
1242/1242, batu 1701/1701) lulus dengan cull aktif.

## 3. UX telefon
- Penjejak misi tidak lagi menyentuh butang jeda (semua level); potret: kanan atas di bawah jeda;
  skrin pendek: lebih padat, "?" 44 px di penjuru, petunjuk menggantikan baris status, ketinggian dihadkan.
- Gelembung dialog (1-1/1-2/1-3, satu fungsi dikongsi): dibalut ikut lebar pandangan, kekal dalam skrin,
  elak HUD, penjejak, gesaan dan butang sentuh; di potret sempit tanpa ruang, penjejak berundur ~3 s.
- Gesaan bawah 1-2/1-3 di skrin pendek dipindah ke kiri (atas anak panah).
- `tests/w1-mobile-check.cjs`: **10 viewport** (iPhone SE, iPhone 13, Pixel 5, Galaxy S8, iPad Mini ×
  potret/landskap) × 3 level — panel stor 1-1, gelembung penemuan 1-1, bengkel 1-2, injap + aliran 1-3,
  petunjuk dibuka: **0 tindihan, 0 terpotong, 0 di luar skrin, 0 ralat.**

## 4. Progresi penuh Dunia 1 (`tests/w1-progression.cjs`)
PROGRESSION

## 5. Pengalaman pemain baharu (semakan, bukan ujian manusia)
**Tiada ujian dengan pemain manusia dibuat.** Di bawah ialah pemerhatian daripada larian automatik dan
semakan teks/skrin; perkara bertanda 🧑 memerlukan pemain sebenar untuk disahkan.

| | 1-1 Bekalan jambatan | 1-2 Bengkel dua mesin | 1-3 Pintu air lama |
|---|---|---|---|
| Masalah | Jambatan patah dilihat sebelum misi; gelembung "Jambatan ni kurang 5 papan." | Gelembung "Bengkel perlu 8 komponen… Ada 5."; jurang tanpa jambatan | Saluran banjir, batu tenggelam; gelembung "Air di saluran terlalu tinggi…" |
| Objektif segera | Penjejak: "Cari 5 papan…" → "Cari kunci…" → "Beli papan…" | "Hasilkan ≥ 8 komponen" → "Tukar susunan mesin…" | "Pulihkan pintu air: cari tetapan asal injap." + "Injap x · sasaran 13" |
| Ke mana seterusnya | Petunjuk 1–3 menunjuk arah (stor kiri, pondok atas gerbang akar) | Petunjuk 2: tuas di dek atas (naik tangga laluan rahsia) | Semua objek dalam satu halaman; batu muncul di hadapan |
| Fungsi objek | Gesaan "E/Guna · Pintu stor", panel stor dengan resit | Plat mesin "A · Gandaan f(x)=2x", "B · Kawalan kualiti g(x)=x−2"; gesaan tuas | Gesaan "Pusing injap (kini x)", "Tarik tuas aliran", meter bertanda 13 |
| Kenapa matematik penting | Bajet RM30: C(x) menentukan berapa papan mampu dibeli | Susunan menentukan cukup/tidak 8 komponen | Hanya bacaan 13 membuka pintu; catatan memberi petua untuk diundur |
| Apa berubah | Papan jatuh satu demi satu, jambatan boleh dipijak | Jambatan bengkel dibina dari 8 komponen | Pintu naik, air surut, batu timbul |

🧑 Perlu pemain sebenar: (a) adakah murid membaca catatan 1-3 sebelum mencuba injap (atau cuba-jaya 7
tetapan); (b) adakah tuas susunan di dek atas 1-2 ditemui tanpa petunjuk 2; (c) adakah "plat diam ~0.5 s"
injap gua difahami; (d) masa sebenar setiap level (bot: 66 s / 67 s / 101 s; sasaran reka bentuk 5–10 min);
(e) kefahaman sebenar gf ≠ fg dan f⁻¹ selepas bermain.

## 6. Ketepatan matematik
MATH

## 7. Kemasan visual & permainan
VISUAL

## 8. Penyekat keluaran
BLOCKERS

## 9. Isu yang tinggal (ikut keterukan)
ISSUES

## 10. Cadangan
RECOMMENDATION

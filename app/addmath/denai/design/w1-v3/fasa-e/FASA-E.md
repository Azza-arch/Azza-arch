# World 1 V3 · Fasa E — Level 1-3 "Pulihkan Pintu Air Lama"

Branch `claude/denai-w1-v3-l3` (dari `claude/denai-w1-v3-l2`). Level 1-1 dan 1-2 tidak diubah dari segi
reka bentuk; satu pembaikan visual di 1-2 dibuat atas permintaan (permata rahsia, lihat §5).

## 1. Misi
**Masalah ditemui secara semula jadi.** Saluran di bawah halaman mesin banjir; batu loncatan tenggelam
dan jurangnya (216 px) lebih lebar daripada lompatan. Apabila pemain tiba: *"Air di saluran terlalu
tinggi — batu loncatan tenggelam. Pintu air lama tidak berfungsi."* Penjejak misi muncul.

**Menyiasat.**
- *Catatan penyelenggaraan koyak* (papan tanda, E/Guna): «Kalibrasi injap: bacaan = 2 × tetapan + 3.
  Bacaan asal …» — selebihnya koyak.
- *Meter* pada paip: dail dengan tanda merah **TANDA ASAL 13**; jarum rehat sehingga aliran dibuka.
- *Roda injap* (0–6): setiap tekan = satu takuk 60° (roda berputar), nombor tetapan pada plat. 6 → 0.
- *Tuas aliran*: air bergerak dalam paip ke meter, jarum berayun ke f(x), digit bacaan muncul.

**Maklum balas fizikal (tiada popup matematik):**
| Bacaan | Apa berlaku |
|---|---|
| < 13 | Pintu air terangkat sedikit, riak air, jatuh semula. "Bacaan 9 — terlalu rendah…" |
| > 13 | Injap keselamatan memancut air, gegaran kecil, pintu kekal. "Bacaan 15 — terlalu tinggi!…" |
| = 13 | Pintu terangkat ke belakang ambang batu, air surut 54 px, 2 batu loncatan timbul (pepejal), air terjun memanjang |

Tiada penalti: tetapan kekal, boleh cuba lagi. Petunjuk 3 peringkat ("?") — selepas cubaan salah,
petunjuk 1 menyebut bacaan sebenar ("Bacaan 9 terlalu rendah — tetapan perlu lebih besar").
Ringkasan: **"Fungsi songsang membantu mencari semula input daripada output."** + "Lihat cara kira":
`f(x) = 2x + 3 · f(5) = 13 ✓ · f⁻¹(13) = (13 − 3) ÷ 2 = 5`.

**Injap gua (pilihan, D3) — cabaran berbeza.** Di laluan gerbang atas (naik tangga): 7 plat batu
bernombor 0–6, papan "INJAP GUA · meter rosak · perlu bacaan 15", dail retak tanpa jarum. Tetapan dipilih
dengan **berdiri diam di atas plat** (~0.45 s, plat tenggelam; berlari melintasi plat tidak mengubah
apa-apa), kemudian tarik tuas. Tiada meter → mesti dikira (15 − 3 = 12, 12 ÷ 2 = 6). Salah: air memancut
balik, plat dikembalikan. Betul: **peti rahsia** terbuka — 2 syiling bonus + catatan rahsia
(inverse-tablet: f⁻¹(15) = 6, f⁻¹ bukan 1/f, serpihan batu kapur → petunjuk Dunia 2).

**Dibuang:** panel 3 meterai, dek pratonton, pemacu, meterai gerbang. Gerbang batu kekal sebagai
mercu tanda penamat automatik.

## 2. Platforming, syiling, checkpoint, simpanan
- Laluan anak sungai/runtuhan/air terjun tidak diubah. Baharu: lompatan batu loncatan (bot: kaki 1701/1701)
  dan laluan gerbang atas dipanjangkan (4320–4806) untuk plat.
- Syiling 20 → **22** (2 dalam peti gua). Rahsia kekal 3 (id sama).
- Checkpoint `far-bank` dan `gate-court` memerlukan pintu air dipulihkan.
- `denai-l3-campaign-v1` → `run.sluice = {setting, tests, lastReading, open, noteRead, cave}`; disimpan
  sebelum animasi (reload semasa animasi selamat). Disanitasi: `open` hanya jika tetapan memang 5;
  `cave.solved` hanya jika 6; syiling/rahsia gua memerlukan injap gua selesai.
- **Migrasi:** larian lama dengan 3 meterai menyala → pintu air terbuka, batu ada, checkpoint kekal;
  belum lengkap → pintu air baharu, syiling & rahsia kekal. Main semula me-reset misi; kiraan tamat,
  syiling & rahsia seumur hidup kekal.

## 3. Prestasi — punca dahulu, bukan potong animasi
Alat: `tests/l3-perf.cjs` (Chromium tanpa kepala, **Phaser Canvas 2D**, raster perisian; profil
desktop 1280×720 dan iPhone 13 landskap/potret dengan **CPU ×4 perlahan** melalui CDP). Mengukur selang
rAF (fps, median, p95, p99, bingkai > 33 ms daripada 240) dan masa dalam `renderer.render` sebenar.

**Sebelum (kandungan 1-3 lama, telefon landskap CPU×4):** 20–25 fps, render 24–28 ms/bingkai,
234–240 daripada 240 bingkai > 33 ms.

**Ujian pengasingan (halaman mesin):**
| Ubah | Kesan |
|---|---|
| Hentikan putaran syiling | tiada (dalam hingar) |
| Hentikan animasi air | tiada |
| 10 kesan kutip syiling serentak | tiada |
| Sembunyi ~1 150 jubin luar skrin | render 22.6 → 16.4 ms |
| + sembunyi **satu** bekas latar paralaks | render → **0.9 ms** |

**Punca:** pemapar Canvas melukis setiap objek setiap bingkai. Latar paralaks ialah satu `Container`
dengan **~3 400 jubin** (tidak di-cull), dan ~1 150 jubin rupa bumi berada di luar skrin.
TileSprite bakar ditolak: kanvas dalaman ~7 500 × 2 400 px melebihi had kawasan kanvas iOS Safari.

**Pembaikan:** `core/view-cull.js` — imej statik di luar pandangan kamera tidak dilukis (`cameraFilter`,
bukan `visible`, jadi logik permainan tidak terganggu). Hanya `Image`; sprite (pemain, syiling), teks
dan objek bergerak sentiasa dilukis. **Piksel sama** (5 lokasi dibandingkan piksel demi piksel).
Hanya 1-3 menggunakannya.

RESULTS_PERF

## 4. Keputusan ujian
RESULTS_TESTS

## 5. Lain-lain
- **Permata biru 1-2 (permintaan pengguna):** penanda rahsia 1-2 dilukis melalui `tile(67,…,36,36)` yang
  memotong bingkai 18 px kepada 12 px → hanya ⅔ permata kelihatan. Kini bingkai penuh (36 × 36, tidak
  dipotong). Semakan semua level: 1-1 (2 permata, penuh; pudar 35 % sebelum ditemui — reka bentuk),
  1-2 (2, dibaiki), 1-3 (tiada).
- Butang "Reset kotak" (1-1) terpapar dalam 1-3 di telefon (wujud sejak 1-3 lama) → disembunyikan.
- Penjejak misi di telefon landskap menyentuh butang jeda 4 px → diturunkan untuk 1-3. 1-1/1-2 berkongsi
  CSS yang sama — dicadangkan dibaiki dalam Fasa F.
- Ujian yang menguji panel dibuang dipadam: `puzzle-clarity-check.cjs`, `inverse-smoke.py`,
  `twins-smoke.py` (panel 1-2 lama; sepatutnya dipadam dalam Fasa D).

## 6. Had
- Masa ialah bot; masa pemain sebenar belum diukur (sasaran 6–10 minit).
- Prestasi diukur pada Chromium emulasi (tiada GPU); telefon sebenar perlu disemak dalam Fasa F.
- 1-1 dan 1-2 menggunakan latar yang sama (RESULTS_OTHERS). View-cull belum dipasang di sana kerana
  arahan tidak mengubah 1-1/1-2; dicadangkan untuk Fasa F.

## Bukti
`L3-V3-desktop.jpg` (11 detik larian papan kekunci) · `L3-V3-telefon.jpg` (landskap & potret, sentuhan
sahaja) · `diamond-semua-level.png` · `perf-*.json`.

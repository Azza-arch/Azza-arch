# World 1 V3 · Fasa F — Ujian penuh, prestasi & kemasan akhir

Branch calon keluaran: `claude/denai-w1-v3-rc` (dari `claude/denai-w1-v3-l3`; mengandungi semua kerja
Fasa C–F). `main` = `ef9c3b5`, tidak berubah sejak V3 bermula, jadi tiada konflik. **Tidak di-merge, tidak di-deploy.**

## 1. Keputusan ringkas
**Semua ujian akhir LULUS pada commit akhir. Cadangan: GO bersyarat** (lihat §10).

| Ujian | Keputusan |
|---|---|
| Unit (8 fail): kos 1-1, gubahan 1-2, songsang 1-3, simpanan, migrasi, analitik, progres | ✅ PASS |
| `l1-playthrough` / `l2-playthrough` / `l3-playthrough` — papan kekunci sebenar, larian penuh | ✅ PASS (66 s / 66 s / 102 s bot · 0 ralat · kaki jambatan 1242/1242 · batu 1701/1701) |
| `l1-v3-check` / `l2-check` / `l3-check` — variasi, migrasi, main semula, petunjuk, sentuhan telefon | ✅ PASS · 0 ralat |
| `w1-progression` — profil baharu 1-1→1-2→1-3 + profil lama | ✅ PASS · 0 ralat |
| `view-cull-check` — 62 pandangan cull hidup vs mati | ✅ 62/62 sama bait demi bait |
| `w1-mobile-check` — 10 viewport × 3 level | ✅ 0 tindihan · 0 terpotong · 0 ralat |
| `engagement-check` — papan pendahulu V3 (PlayFab palsu tempatan) | ✅ PASS · 0 tulisan papan klasik |
| `rc-check` · `analytics-check` · `feel-check` · `menu-check` · `bg-theme-check` · `l1-banner-check` · `w1-traversal-check` (17/17) · `landing-count-check` | ✅ PASS · 0 peristiwa analitik |
| `w1-perf` — prestasi (§2) | ✅ PASS · 0 ralat |
| Landing page (desktop + telefon) | ✅ tiada limpahan, pautan game 200, 0 ralat |

## 2. Prestasi (sebelum → selepas, syarat sama)
Alat: `tests/w1-perf.cjs`. Chromium tanpa kepala, **Phaser Canvas 2D** (`type: Phaser.CANVAS`, satu
`Phaser.Game` untuk ketiga-tiga level, disahkan dalam `game.js` dan semasa larian: `renderType = 1`).
Profil: desktop 1280×720; iPhone 13 landskap & potret dengan **CPU ×4 perlahan** (CDP). Setiap sampel
240 bingkai: masa bingkai (purata / median / p95 / p99 / maks), bingkai > 33 ms dan > 50 ms, masa dalam
`renderer.render`. Diukur diam di 4 lokasi + berlari (kamera bergerak) + 3 ujian pengasingan.
Tiada GPU: nombor mutlak ialah proksi telefon perlahan, bukan janji untuk telefon sebenar.

`perf-sebelum.json` / `perf-selepas.json`. Lima sampel × 240 bingkai bagi setiap baris (4 lokasi diam + berlari).

| Level · profil | Purata masa bingkai | p95 | p99 terburuk | Maks | > 33 ms (/1200) | > 50 ms | Render |
|---|---|---|---|---|---|---|---|
| 1-1 · iPhone landskap CPU×4 | 31.4–39.6 → **16.9–18.4 ms** | 37–62 → 20–27 | 70 → 35 | 99 → 39 | 631 → **7** | 60 → **0** | 18–22 → 5–8 ms |
| 1-1 · iPhone potret CPU×4 | 33.3–37.8 → **16.7–17.1** | 43–54 → 18–22 | 65 → 26 | 88 → 46 | 654 → **1** | 48 → **0** | 19–21 → 4–5 |
| 1-2 · iPhone landskap CPU×4 | 33.0–40.5 → **16.7–19.1** | 47–56 → 21–27 | 78 → 32 | 125 → 37 | 811 → **2** | 63 → **0** | 17–19 → 5–8 |
| 1-2 · iPhone potret CPU×4 | 29.7–35.6 → **16.7–17.0** | 40–47 → 19–21 | 69 → 35 | 118 → 39 | 506 → **3** | 27 → **0** | 17–19 → 3–6 |
| 1-3 · iPhone landskap CPU×4 (cull sejak Fasa E) | 17.0–18.5 → 17.8–19.2 | 23–26 → 24–28 | 41 → 34 | 59 → 43 | 5 → 8 | 1 → 0 | 5–6 → 7–9 |
| Semua level · desktop 1280×720 | 16.7 → 16.7 (60 fps) | 17–20 → 17–17.5 | 25 → 21 | 30 → 23 | 0 → 0 | 0 → 0 | 4–5 → 1–2 |

1-3 "sebelum" Fasa E (tanpa cull): 20–25 fps, render 24–28 ms (`../fasa-e/perf-sebelum.json`).
Ujian tekanan `feel-check` (1-2 zum keluar seluruh level, telefon CPU×4): 51 fps, p95 26 ms.

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
**A. Profil baharu, satu profil pelayar sepanjang Dunia 1 (tiada data disuntik):**
Peta Dunia: 1-1 Tersedia, 1-2 & 1-3 Dikunci ("Selesaikan Level 1-1/1-2 dahulu") → `l1-playthrough` →
1-1 Selesai, 1-2 Tersedia → `l2-playthrough` → 1-2 Selesai, 1-3 Tersedia → `l3-playthrough` → semua Selesai,
menu: "Dunia 1 selesai · pilih level di Peta Dunia". Pencapaian: Jejak Pertama, Bajet Cermat, Jalan Pintas.
Main semula 1-2 dari Peta Dunia: bengkel di-reset (BA, 0 larian), checkpoint `entry`, kiraan tamat kekal 1.
Respawn (jatuh sengaja) dan reload di tengah misi dalam setiap playthrough: langkah wajib tidak perlu diulang.

**B. Profil sedia ada (simpanan kursus lama untuk ketiga-tiga level):** semua "Dalam perjalanan".
Sambung dari Peta Dunia: 1-1 jambatan sudah dibaiki, 1-2 bengkel sudah dihantar (cp `exit`), 1-3 pintu air
sudah terbuka + 2 batu (cp `far-bank`). Kekal selepas respawn (R) dan selepas reload; setiap level tamat;
pencapaian lama (Tepat Sekali, Tiga Cara) kekal; menu akhir "Dunia 1 selesai".

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
| Level | Model | Disemak | Keputusan |
|---|---|---|---|
| 1-1 | C(x) = px + d (K1 4x+6, K2 3x+9, K3 5x+5) | C(5)=26 ≤ 30; 5 atau 6 papan diterima; bajet bukan syiling | ✅ (unit `supply-quest`) |
| 1-2 | f(x)=2x, g(x)=x−2 | gf(5)=g(f(5))=g(10)=8 ✓; fg(5)=f(g(5))=f(3)=6; gf(x)=2x−2, fg(x)=2x−4 | ✅ notasi KSSM fg(x)=f(g(x)) |
| 1-3 | f(x)=2x+3, domain {0,…,6} | julat {3,…,15}, satu dengan satu; f⁻¹(13)=5, f⁻¹(15)=6 | ✅ (unit `sluice`) |

Istilah KSSM dibetulkan dalam Fasa F: tablet domain 1-3 kini "Julatnya {3,…,15}… setiap objek berbeza
mempunyai imej berbeza (fungsi satu dengan satu)"; "Fungsi songsang" (bukan "Songsangan"); kad Peta Dunia
1-3 "Fungsi songsang · pintu air lama". Ringkasan pilihan ("Lihat cara kira") wujud dalam ketiga-tiga level.
**Tiada jawapan bertindak sebagai kata laluan:** 1-1 menerima sebarang pembelian dalam bajet yang cukup
(5 atau 6); 1-2 & 1-3 menunjukkan hasil fizikal bagi setiap cubaan (6/8, bacaan 9/15) dan pemain boleh
mencuba lagi tanpa penalti; injap gua: plat mana-mana boleh dicuba, akibat ditunjukkan.

## 7. Kemasan visual & permainan
Disemak pada tangkapan skrin kod akhir (`F-desktop-*.jpg`, `F-telefon-10-viewport.jpg`):
jambatan rosak & animasi papan (1-1) ✓ · stor & laluan kunci ✓ · tali sawat & penerima bengkel ✓ · injap,
meter, pintu air, air surut, batu ✓ · latar hutan seragam (bg-theme: 1 lapisan hutan setiap level) ✓ ·
syiling berputar & permata penuh ✓ · checkpoint & bendera penamat ✓ · kamera & perlanggaran ✓ · menu,
Peta Dunia, kad kemenangan ✓.

Kecacatan disahkan & dibaiki dalam Fasa F:
- Kad Peta Dunia 1-3 mengira **/20 syiling** (sebenar 22) → kini dari data level (1-2 juga).
- Teaser kemenangan 1-1 dan 1-2 menerangkan level **lama** → teks V3.
- Toast (#notice) kelihatan **di atas kad kemenangan** 1-3 → disembunyikan semasa kad dibuka.
- Telefon: penjejak menyentuh butang jeda; penjejak di potret menindih gesaan; gelembung terkeluar skrin
  (iPhone SE potret); "?" terpotong dan penjejak melimpah di landskap pendek → semua dibaiki (§3).
- Landing page: teks dan 2 gambar permainan menunjukkan reka bentuk lama → dikemas kini.

## 8. Penyekat keluaran
| Perkara | Status |
|---|---|
| Papan `denai_l1_time_v3` — konfigurasi klien | ✅ satu-satunya papan yang ditulis; diuji dengan PlayFab palsu: tiada hantar sebelum izin, 1 hantar selepas izin, tiada duplikat selepas reload, lebih lambat tidak dihantar, lebih pantas dihantar, langkau = 0, sertai kemudian = 1, luar talian → cuba semula = 1 |
| Papan `denai_l1_time_v3` — wujud dalam PlayFab produksi | ⚠️ **TIDAK DISAHKAN** — ujian automatik tidak dibenarkan menghubungi PlayFab produksi. Jika belum dicipta, permainan memaparkan "Papan pendahulu kursus baharu sedang disediakan" dan tidak menulis ke papan klasik (diuji). **Tindakan pemilik:** cipta statistik + papan (Min, Ascending) dalam Game Manager |
| Papan klasik `denai_l1_time` | ✅ 0 tulisan dalam semua ujian; data palsu tidak berubah |
| Analitik | ✅ `enabled: false`, 0 peristiwa dihantar; tiada pengumpulan e-mel aktif (prototaip waitlist tidak dipautkan) |
| Landing page awam | ✅ dikemas kini (§7); tiada limpahan; pautan game berfungsi |
| Simpanan lama | ✅ 1-1/1-2/1-3 dimigrasi (§4B); kunci simpanan tidak berubah |
| Prestasi telefon | ✅ emulasi (§2) · ⚠️ belum diuji pada telefon sebenar |

## 9. Isu yang tinggal (ikut keterukan)
Tiada isu **kritikal** atau **tinggi** yang terbuka.

| # | Keterukan | Isu | Cadangan |
|---|---|---|---|
| 1 | Sederhana (operasi) | Papan `denai_l1_time_v3` belum disahkan wujud dalam PlayFab produksi | Pemilik cipta/sahkan sebelum deploy |
| 2 | Sederhana (pengesahan) | Tiada ujian pada telefon sebenar dan tiada ujian pemain manusia (§5 🧑) | Uji asap 10 minit pada 1 Android + 1 iPhone; 3–5 murid main Dunia 1 |
| 3 | Rendah | Telefon landskap pendek (cth. Pixel 5): teks dalam dunia (gelembung, plat, meter) ≈ 10 px kerana zum kamera | Akan ditangani dalam V4 (UI) |
| 4 | Rendah | Potret sempit: semasa gelembung ~3–4 s, penjejak berundur dan "?" tidak boleh ditekan | V4 (sistem dialog/jurnal) |
| 5 | Rendah | Rekod tempatan 1-2/1-3 bagi larian lama yang disambung menggunakan masa larian lama | Tempatan sahaja; tidak menyentuh papan pendahulu |
| 6 | Rendah (kod) | Kod lama tidak lagi dicapai (`composition*.js`, panel lif, `missions`) | Bersihkan selepas keluaran |
| 7 | Kosmetik | Permata rahsia 1-1 pudar (35 %) sehingga ditemui — reka bentuk, bukan pepijat | — |

## 10. Cadangan
**GO bersyarat** untuk keluaran World 1 V3 dari `claude/denai-w1-v3-rc`:
1. Pemilik mencipta/mengesahkan `denai_l1_time_v3` dalam PlayFab Game Manager (atau menerima keadaan
   "sedang disediakan" buat sementara — selamat, diuji).
2. Uji asap ringkas pada sekurang-kurangnya satu telefon sebenar sebelum merge.

Jika kedua-duanya selesai: **GO**. Tiada penyekat kod yang diketahui. Merge/deploy hanya dengan kelulusan pemilik.

## Bukti
`F-desktop-1-1-menu-peta.jpg` (1-1, Peta Dunia, menu akhir) · `F-desktop-1-2-1-3.jpg` (1-2, 1-3, simpanan
lama) · `F-kad-kemenangan.jpg` · `F-telefon-10-viewport.jpg` · `F-landing-desktop.jpg` · `F-landing-telefon.jpg` ·
`perf-sebelum.json` · `perf-selepas.json`. Ujian baharu Fasa F: `w1-perf.cjs`, `view-cull-check.cjs`,
`w1-mobile-check.cjs`, `w1-progression.cjs` (playthrough menerima `W1_PROFILE_DIR`).

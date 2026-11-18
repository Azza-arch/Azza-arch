# DENAI — Day 07: Prototaip kepingan menegak · Level 1-3 "Takungan Lama"

> **Status:** dilaksanakan dan diuji secara tempatan. **Tiada commit, push, merge atau deploy.** `app/addmath/denai/design/trailer/` tidak dibaca dan tidak disentuh.
> **[DILAKSANA]** = wujud dalam kod sekarang. **[CADANGAN]** = belum dibina.

## 1. Branch dan HEAD permulaan
| Perkara | Keadaan |
|---|---|
| Branch | `claude/denai-day06-world-design` (tempatan) |
| HEAD | `da139a0` (baseline Day 05), tidak berubah |
| Working tree permulaan | bersih; belum dijejak: `audits/day-06/` (Masterplan) dan `design/trailer/` (dilindungi) |
| Branch baharu / reset / commit | tiada |

## 2. Seni bina yang diperiksa
| Perkara | Penemuan (fail:baris) |
|---|---|
| Rupa bumi | Setiap lajur `AB_TERRAIN` adalah pepejal dari permukaan hingga `WORLD.floor` (collider dan seni), `environment.js:113-121`. `SLABS` (blok setebal terhad, udara sebenar di bawahnya) disokong oleh pembina yang sama, `environment.js:125-135`. |
| Respawn 1-3 | `body.bottom > WORLD.floor − 8` = 2098, `inverse-scene.js` (kemas kini) |
| Kamera 1-3 | `cameras.main.setBounds(0, 240, 5616, 1866)`, follow (−85, 100) dengan deadzone 150. Kamera hanya dihadkan berhampiran air untuk x ∈ (2640, 3716) dan x < 746, `core/player-motion.js:115`. |
| Gerakan | `MOTION` (lompatan 520, graviti 1400, iaitu lompatan maksimum ≈ 96 px), coyote dan buffer, `level.js` / `player-motion.js` |
| Tangga / dek | Dek sehala diabaikan semasa memanjat; pepejal tetap menghalang, `core/player.js` (collider). Turun dari atas tangga bermula dengan ↓ bila `body.bottom < ladder.bottom − 2`. |
| Interaksi | `sluicePrompt()` / `useSluice()` (senarai `near`, E atau Guna), gesaan tetap `fixedPrompt` (Day 05) |
| Puzzle | `sluice-model.js` → sesi Day 04 (`sluice.puzzle`), `meterOf(state)` |
| Simpanan | `denai-l3-campaign-v1`: larian (`run`) + medan seumur hayat (`coins`, `secrets`) yang disanitasi; pengawal `schemaVersion > 1` |
| Ujian bergantung koordinat | `inverse.test.mjs` (lompatan antara lajur, tangga), `l3-playthrough` (jurang [2484, 2538]), `l3-check` (teleport ke 2620, 2862, 3060, 5292) |
| Aset Kenney | permata 67 (tidak digunakan di 1-3), blok berkunci 28, tangga 71, papan tanda 86, tuas 64/66, digit 170–179, bahagian roda 93/94/113/114 |
| **Renderer** | Phaser **CANVAS**: `setTint()` **tiada kesan** (ditemui semasa semakan visual; lihat §11) |

## 3. Reka bentuk prototaip [DILAKSANA]
```mermaid
flowchart LR
  R[Laluan utama · runtuhan atas<br/>y 1674, x 1944–2484] --> H[Palka papan x 2106–2160<br/>rata dengan laluan · papan 'Takungan ↓']
  H -->|↓ / S · tangga x 2133| T[Takungan Lama<br/>x 2106–2430 · y 1782–2052]
  T --> D[Roda KOD 0–6 + tuas]
  D -->|f(kod) = sasaran| G[Jeriji blok berkunci terbuka]
  G --> K[Kristal Kapur di atas tapak batu]
  T -->|↑ / W · tangga yang sama| R
  R --> M[Halaman Mesin → pintu air (misi utama, tidak berubah)]
```

**Lokasi:** di bawah runtuhan atas, antara checkpoint `ruins` (x 1998) dan Halaman Mesin. Bahagian ini sebelum misi utama, jadi pemain menemuinya secara semula jadi. Ia berada di luar jalur kamera air dan jauh dari papan zon.

**Rupa bumi:** `upper-ruins` (1944–2484) dipecah kepada empat bahagian. Permukaan berjalan kekal pada y = 1674 tanpa jurang.

| Bahagian | Julat x | Butiran |
|---|---|---|
| `upper-ruins` | 1944–2106 | lajur pepejal |
| Palka sehala | 2106–2160 | dek pada y 1674, menutup syaf |
| `cistern-roof` (slab) | 2160–2430 | y 1674–1782, gaya `ruin` |
| `upper-ruins-east` | 2430–2484 | dinding pepejal |
| `cistern-floor` | 2106–2430 | lantai bilik pada y 2052 |

**Bilik:**
- Ruang 6 × 5 jubin dengan dinding belakang batu gelap (lapisan separa telus).
- Plat bertulis "TAKUNGAN LAMA · jeriji dibuka bila f(kod) = 9 · f(x) = 2x + 3" (nombor dari sesi aktif).
- Roda KOD, tuas, dan jeriji 5 blok berkunci (collider pepejal sehingga diselesaikan).
- Tapak batu dengan Kristal Kapur, bercahaya dan bergerak perlahan.

**Pembeza laluan:**
- Papan tanda "Takungan ↓" di sebelah palka.
- Tangga kelihatan di dalam syaf.
- Gesaan "S/↓ · Turun ke Takungan Lama" (bukan tindakan E).
- Dalam bilik, gesaan "W/↑ · Naik ke runtuhan" di kaki tangga.

**Kembali:** tangga yang sama. Pemain kembali tepat di palka atas laluan utama. Tiada jalan mati: setiap kawasan bilik mempunyai jalan keluar yang jelas.

## 4. Fail yang diubah
| Fail | Sebab |
|---|---|
| `src/v14/levels/inverse-world.js` | pecahan `upper-ruins`; `SLABS` (bumbung); tangga syaf; `CISTERN`; `ARTIFACTS`; `DEFINITION.SLABS` |
| `src/v14/environment.js` | gaya slab `ruin` (cabang aditif bersama `arch`; 1-1 tidak terjejas) |
| `src/v14/levels/sluice-model.js` | `CISTERN_SETTING` / `CISTERN_TARGET` dalam `meterOf`; `sluice.cistern` dalam `newSluice` / `sanitizeSluice`; `turnCistern`, `pullCistern` |
| `src/v14/levels/sluice-line.js` | `buildCistern` (seni, palka, jeriji, kristal); gesaan; `cisternDial` / `cisternLever` |
| `src/v14/levels/inverse-scene.js` | set artifak (cache); `collectArtifacts`; gesaan bukan tindakan (↓/↑); baris Jurnal "Artifak n/1"; butang Guna hanya untuk tindakan |
| `src/v14/core/inverse-campaign.js` | medan seumur hayat `artifacts` + `addArtifact()` |
| `tests/inverse.test.mjs` | **dikemas kini dengan sengaja:** lantai bilik dikecualikan daripada semakan lompatan antara lajur, dan semakan baharu memastikan permukaan atas bilik bersambung dan rata |
| `tests/cistern.test.mjs` (baharu) | model kod, sanitasi, stor artifak, data rosak, had peta |
| `tests/l3-cistern-check.cjs` (baharu) | ujian pelayar A–F (desktop + 2 telefon) |

## 5. Kegigihan koleksi [DILAKSANA]
- **Tiada kunci baharu.** Medan aditif `artifacts` di peringkat atas `denai-l3-campaign-v1`, sama seperti `coins` / `secrets` seumur hayat sedia ada.
- **Bukan dalam `run`:** main semula, larian baharu dan sesi puzzle baharu tidak membuang koleksi.
- `load()` menyaring melalui `unique(raw.artifacts, ARTIFACTS ids)`:
  - JSON rosak, jenis salah atau id asing menghasilkan `[]`;
  - save lama tanpa medan menghasilkan `[]`.
- `addArtifact(id)`:
  - id tidak dikenali → `false`;
  - sudah ada → `false` (tidak dikutip dua kali);
  - `schemaVersion > 1` → `false` (data lebih baharu tidak ditimpa);
  - kegagalan storan → `false`. Scene berhenti mencuba dan memaparkan mesej; tiada ulangan setiap bingkai.
- Scene membaca stor sekali semasa mula (`ownedArtifacts`), tanpa membaca localStorage setiap bingkai.
- **Tidak terjejas:** leaderboard, rekod 1-1, `denai-profile-v1`, `denai-campaign-v1`, sesi puzzle Day 04.
- Keadaan kunci bilik (`sluice.cistern {setting, tries, solved}`) disimpan dalam larian. Ia disanitasi, dan `solved` hanya diterima jika `f(setting)` benar-benar sama dengan sasaran (tidak boleh dipalsukan).

## 6. Interaksi AddMath [DILAKSANA]
- **Konsep:** fungsi songsang (subtopik 1.3, sama dengan 1-3), menggunakan **mesin dan sesi yang sama** dengan pintu air (`meterOf(sluice)`). Tiada seni bina puzzle kedua dan tiada skrin kuiz.
- **Sasaran:** x pertama dalam [3, 4, 2, 5, 1, 6] yang bukan tetapan pintu air dan bukan tetapan gua. Ini deterministik per sesi. Puzzle asal: f(x) = 2x + 3, sasaran 9, kod 3. Disahkan untuk 500 sesi berseed.
- **Interaksi:**
  - E/Guna pada roda: kod +1 (0–6, berbalik ke 0);
  - E/Guna pada tuas: semak.
  - Salah: "f(1) = 5, bukan 9. Jeriji masih berkunci." beserta bunyi dan goncangan kecil. Tiada kos, dan pemain boleh mencuba lagi.
  - Betul: "f(3) = 9 ✓ Jeriji terbuka.", blok naik dan pudar, collider dibuang.
- Tidak menghalang pergerakan: bilik itu pilihan, dan misi utama tidak memerlukannya.
- **Pedagogi:** ini pemanasan sebelum pintu air (f diberi, cari input bagi output), dengan maklum balas f(kod) yang mengajar.

## 7. Bukti kamera dan respawn tidak berubah
- `git diff --name-only` **tidak** mengandungi `core/player-motion.js`, `core/player.js`, `game.js` atau `level.js`.
- Carian diff untuk `setBounds|startFollow|setFollowOffset|respawn|floor-8|MOTION|gravity|jump|speed|coyote|buffer|setDeadzone|camOff|followOffset` hanya menemui:
  - baris `physics.world.setBounds(...)` dalam `inverse-scene.js`. Teksnya sama; ia hanya didahului oleh pernyataan baharu pada baris yang sama.
  - komen dan ujian.
- **Reka bentuk dalam had sedia ada:**
  - lantai bilik pada kaki 2052 < 2098 (garis respawn);
  - bilik pada x ≤ 2430 < 2640 (jalur kamera air);
  - bilik dalam batas kamera (≤ 2106);
  - ketinggian bilik 270 px > tinggi badan 60 px;
  - lompatan maksimum 96 px tidak boleh mencapai palka dari dalam bilik.

## 8. Tangkapan skrin
Disimpan dalam `audits/day-07/shots/` (14 fail, ~1 MB). Senarai penuh dalam jadual di §10.

## 9. Ujian dan kod keluar
Semua dijalankan dalam working tree ini (HEAD `da139a0` + perubahan Day 07 tempatan) dengan `rc=$?` diambil sejurus selepas setiap arahan. Chromium headless sahaja; PlayFab di-stub dan hosnya disekat.

**Ujian unit (11 fail, semua exit 0):**

| Ujian | Kod keluar | Lulus / gagal |
|---|---|---|
| `analytics.test.mjs` | 0 | 5 / 0 |
| `inverse.test.mjs` | 0 | 1 / 0 (dikemas kini, §4) |
| `progress-course.test.mjs` | 0 | 4 / 0 |
| `puzzle-session.test.mjs` | 0 | 10 / 0 |
| `puzzles.test.mjs` | 0 | 8 / 0 |
| `sluice.test.mjs` | 0 | 1 / 0 |
| `supply-quest.test.mjs` | 0 | 4 / 0 |
| `twins.test.mjs` | 0 | 1 / 0 |
| `workshop-v3.test.mjs` | 0 | 1 / 0 |
| `workshop.test.mjs` | 0 | 1 / 0 |
| **`cistern.test.mjs` (baharu)** | 0 | **6 / 0** |

**Semakan prototaip baharu, `tests/l3-cistern-check.cjs`: exit 0** (84 s dalam suite penuh)

| Semakan | Keputusan |
|---|---|
| A. Laluan utama di atas palka | kaki kekal 1674, checkpoint `ruins` tidak berubah, tiada respawn |
| B. Cawangan pilihan | S di palka → turun ke lantai 2052 tanpa respawn; gesaan "S · Turun ke Takungan Lama" / "W · Naik ke runtuhan"; naik semula ke palka (x 2133) dan laluan utama diteruskan |
| C. AddMath | kod 1 → "f(1) = 5, bukan 9. Jeriji masih berkunci.", jeriji menghalang (x < 2322); kod 3 → "f(3) = 9 ✓ Jeriji terbuka."; `sluice.puzzle` tidak berubah |
| D. Koleksi | dikutip sekali (`["kristal-kapur"]`); laluan kedua tidak menambah; Jurnal "Artifak 1/1"; selepas reload masih dimiliki (kristal alpha 0.25) dan jeriji kekal terbuka; main semula → sesi puzzle baharu, jeriji ditutup semula, artifak kekal, plat memaparkan peraturan sesi baharu (cth. "f(x) = 2x + 5", sasaran 11) |
| E. Data rosak | JSON rosak, `artifacts` bukan senarai, id asing, dan save lama tanpa medan: semuanya dimuatkan tanpa ralat, koleksi kosong, bilik tertutup |
| F. Telefon | iPhone 13 potret dan iPhone SE landskap (568×320): gesaan "↓ · Turun…", butang ↓ turun, "Guna · Pusing kod", Guna memusing roda, butang ↑ naik semula |

Semasa pembangunan, larian ujian ini gagal beberapa kali kerana **kesilapan dalam skrip ujian saya**, bukan permainan. Setiap kali, punca disiasat sehingga jelas:
1. Kes data rosak keempat menetapkan `completions: 1`, jadi butang Main tidak melancarkan 1-3. Itu tingkah laku menu sedia ada.
2. `mouse.down` tidak sesuai untuk menahan butang sentuh.
3. `page.waitForFunction` dengan rentetan disekat oleh **CSP permainan** (`script-src 'self'`, tiada `unsafe-eval`), kerana ia menggunakan eval dalam halaman. Ujian kini menggunakan gelung `page.evaluate`.

Larian akhir: exit 0.

## 10. Regresi
**Suite pelayar penuh (larian tunggal, semua exit 0):**

| Ujian | Kod keluar | Masa |
|---|---|---|
| `l3-cistern-check` (baharu) | 0 | 84 s |
| `puzzle-reload-check` | 0 | 14 s |
| `day05-gameplay-check` | 0 | 137 s |
| `l1-playthrough` | 0 | 77 s |
| `l2-playthrough` | 0 | 75 s |
| `l3-playthrough` | 0 | 114 s |
| `w1-progression` | 0 | 312 s |
| `w1-mobile-check` | 0 | 303 s (11 viewport × 3 level) |
| `rc-check` | 0 | 63 s |
| `menu-check` | 0 | 31 s |
| `l1-v3-check` | 0 | 55 s |
| `l2-check` | 0 | 44 s |
| `l3-check` | 0 | 79 s |

**Ralat konsol / halaman:** 64 senarai `errs`/`errors` dalam semua output, semuanya kosong. Tiada skrin kosong.

**Dilindungi dan disahkan:**
- 1-1 / 1-2: playthrough, `l1-v3-check`, `l2-check`, `day05-gameplay-check` (stor, Jurnal, gesaan Guna).
- 1-3: playthrough penuh merentas palka hingga ke penamat, dan `l3-check`.
- Progresi Dunia 1 dan profil lama (`w1-progression`).
- Sesi puzzle Day 04 (`puzzle-reload-check`, `puzzle-session`).
- Menu dan Peta Dunia (`menu-check`).
- Leaderboard / rekod 1-1 (`rc-check`); 1-1 tidak disentuh.

**Infrastruktur:** pelayan ujian tempatan dihidupkan semula sebelum suite (had masa latar belakang 2 jam), jadi suite selesai tanpa gangguan.

**Tangkapan skrin** (`audits/day-07/shots/`):

| Perkara | Fail |
|---|---|
| Peta penuh 1-3 sebelum / selepas | `0-peta-1-3-sebelum.png`, `0-peta-1-3-selepas.png` |
| Laluan utama + palka / cawangan | `1-laluan-utama-palka.png`, `2-palka-gesaan.png` |
| Bilik + lokasi koleksi | `3-bilik-takungan.png` |
| Interaksi puzzle | `4-kod-salah.png`, `5-jeriji-terbuka.png` |
| Kutipan + Jurnal | `6-kristal-dikutip.png`, `7-jurnal-artifak.png` |
| Kembali ke laluan utama | `8-kembali-laluan-utama.png` |
| Telefon | `9-iphone-13-potret-palka.png`, `9-iphone-13-potret-bilik.png`, `9-iphone-se-landskap-palka.png`, `9-iphone-se-landskap-bilik.png` |

## 11. Had yang diketahui
- **Tint tidak berfungsi dengan renderer CANVAS:**
  - kristal menggunakan warna Kenney asal (biru), bukan krim;
  - dinding belakang digelapkan dengan lapisan separa telus (alpha disokong).
  - Panggilan `setTint` lain yang sudah wujud dalam 1-3 juga tiada kesan. Ia kod sedia ada dan tidak disentuh.
- Hanya satu artifak dan satu bilik. Tiada tab Koleksi khas: kiraan dipaparkan dalam baris koleksi Jurnal.
- Kristal hanya diakui dalam 1-3 (stor level). Hab / keadaan dunia merentas level ialah **[CADANGAN]** (Masterplan §14).
- Pada telefon potret, plat bilik dilihat sebahagian dari permukaan, dan butang sentuh menutup sebahagian plat ketika di palka. Di dalam bilik, plat kelihatan penuh.
- Ujian dalam Chromium headless sahaja; **tiada peranti sebenar**.

## 12. Cadangan Day 08 [CADANGAN]
1. Sahkan rasa main di telefon sebenar (iPhone SE / Android kecil), terutamanya tangga dengan butang ↑ ↓.
2. Putuskan sama ada stor koleksi kekal per level atau dipindahkan ke kunci dunia `denai-world-v1` sebelum menambah artifak kedua.
3. Tambah satu Explorer Note sebagai petunjuk ke bilik, contohnya tablet `ruin-inscription` sedia ada, tanpa mengubah teksnya secara besar.
4. Paparan koleksi ringkas dalam Jurnal (senarai artifak), masih tanpa hab.
5. Jika aset cerah diperlukan (kristal "kapur" putih), pertimbangkan bingkai Kenney lain atau renderer WebGL. Yang kedua perlu kelulusan dan ujian prestasi.

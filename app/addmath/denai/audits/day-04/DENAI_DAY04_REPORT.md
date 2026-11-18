# DENAI — Day 04: Variasi puzzle & simpanan kekal (2026-11-18)

Branch `claude/denai-day04-puzzle-persistence`, dicabang daripada `claude/denai-day03-puzzle-architecture` (a5a6667, termasuk 675e43e). Tidak di-merge, tidak di-deploy. `design/trailer/` tidak disentuh.

## 1. Audit simpanan (Fasa 1)
Laporan penuh: [`FASA1_SAVE_AUDIT.md`](FASA1_SAVE_AUDIT.md). Ringkasan:
- Tiga level guna **tiga kunci berasingan**: `denai-save-v14` (1-1, `quest`), `denai-campaign-v1` (1-2, `levels['w1-l2'].run.workshop`), `denai-l3-campaign-v1` (1-3, `run.sluice`). `denai-profile-v1` hanya progres (tiada parameter puzzle). `denai-l1-last-variant` = putaran varian 1-1. Kunci tidak digabungkan.
- Sebelum Day 04 parameter puzzle tidak disimpan: 1-1 simpan id K1–K3; 1-2/1-3 bergantung pada pemalar modul.
- Setiap sanitizer membina semula objek dan membuang medan tidak dikenali, jadi medan baharu mesti diteruskan oleh sanitizer itu sendiri.

## 2. Reka bentuk sesi (Fasa 2)
`src/v14/puzzles/session.js`. Satu sesi = `{ v: 1, id, seed, difficulty, params }`, disimpan **di dalam objek level sedia ada** (`quest.puzzle`, `workshop.puzzle`, `sluice.puzzle`). Tiada kunci baharu dan tiada perubahan skema.

| Medan | Isi | Nota |
|---|---|---|
| `v` | 1 | versi format sesi |
| `id` | `w1.l2.workshop.main` atau `w1.l2.workshop.gen-<seed36>` | dalaman, tidak dipaparkan |
| `seed` | integer 32-bit atau `null` (puzzle asal) | dalaman, tidak dipaparkan |
| `difficulty` | `mudah` / `sederhana` / `cabaran` | 1-1 sahaja berubah |
| `params` | 1-1 `{price, delivery, budget, need, stock}` · 1-2 `{input, need, start, f:{a,b}, g:{a,b}}` · 1-3 `{rule:{a,b}, target, cave}` | 126–154 bait |

**Kenapa `params` penuh disimpan (bukan seed sahaja):** jika julat penjana diubah dalam build akan datang, seed yang sama akan menghasilkan puzzle lain di tengah jawapan. Params hanya beberapa integer, dan setiap kali dimuat ia **disemak semula** oleh model dan had mekanik level, jadi save yang diedit tidak boleh menghasilkan puzzle mustahil atau tidak boleh dilukis.

**Tidak disimpan (elak duplikasi):**
- Status selesai: sudah ada dalam `quest.repaired`, `workshop.delivered` dan `sluice.open`, yang tetap satu-satunya sumber.
- Hints, jawapan dan teks: dibina semula daripada `params` (fungsi tulen, dicache).

**Urutan pemulihan:**
1. Sesi tersimpan yang sah.
2. Jika params rosak tetapi seed sah, jana semula daripada seed.
3. Puzzle asal level (1-1 ikut id K1–K3 dalam save).

**Bila sesi dicipta:**

| Situasi | Sesi |
|---|---|
| Lawatan pertama | puzzle asal (sama seperti sebelum ini) |
| Ulang main | sesi baharu dengan seed rawak (1-2/1-3: `scene.restart({fresh:true})`; 1-1: `freshAdventure()`) |
| Scene load / refresh | tiada penjanaan; sesi dibaca daripada save |

1-1 ulang main: K2 dan K3 sekali setiap satu (putaran lama dikekalkan), kemudian senarai harga berseed dengan kesukaran berselang `mudah`/`cabaran`.

**Had mekanik (penapis konfigurasi):**
| Level | Had | Sebab |
|---|---|---|
| 1-1 | `need = 5`, `stock = 8`, harga 1–9, hantaran 0–20, bajet ≤ 99; pembelian tepat 5 mesti diterima | jambatan fizikal ada 5 papan |
| 1-2 | f(x) = 2x, g(x) = x − k (k = 1–3), input 4–6, mula BA, perlu = gf(input) | peti stok dilukis ≤ 6; nama "Gandaan"; tepat satu susunan berjaya (fg = 2n − 2k < gf = 2n − k) |
| 1-3 | domain **tetap** {0…6}, f(x) = ax + b (a ∈ {2,3}, b 1–5), tetapan jawapan 2–5, tetapan gua 1–6 dan ≠ jawapan, bacaan ≥ 0 | roda 7 takuk dan 7 plat gua; 0 ialah kedudukan mula roda; digit atlas 0–9 |

**Domain 1-3 tidak divariasikan.** Roda injap (7 takuk, balik 6 → 0) dan plat gua (7 plat bernombor 0–6) ialah objek fizikal, jadi mengubah domain akan mengubah mekanik. Hanya peraturan, sasaran dan jawapan berubah.

## 3. Contoh konfigurasi (dijana, semuanya disemak model)
| Seed | 1-1 mudah / cabaran | 1-2 | 1-3 |
|---|---|---|---|
| 1 | C(x) = 5x + 3, bajet RM35 → terima {5, 6} / bajet RM30 → {5} | f = 2x, g = x − 1, input 5, perlu 9: gf(5) = 9 ✓, fg(5) = 8 | f(x) = 3x + 1, sasaran 13 → tetapan 4; gua 7 → plat 2; julat {1,4,…,19} |
| 2 | C(x) = 5x + 5, RM36 → {5, 6} / RM31 → {5} | f = 2x, g = x − 1, input 4, perlu 7: gf(4) = 7 ✓, fg(4) = 6 | f(x) = 3x + 2, sasaran 11 → 3; gua 17 → 5 |
| 2026 | C(x) = 4x + 5, RM31 → {5, 6} / RM27 → {5} | f = 2x, g = x − 1, input 5, perlu 9 | f(x) = 2x + 2, sasaran 10 → 4; gua 12 → 5 |

Puzzle asal (lawatan pertama) kekal: K1 C(x) = 4x + 6 bajet RM30; 1-2 f = 2x, g = x − 2, input 5, perlu 8; 1-3 f(x) = 2x + 3, sasaran 13, gua 15.

Bilangan konfigurasi berbeza: 1-1 lebih 300, 1-3 200 (daripada 3 000 seed), 1-2 hanya **9** (3 input × 3 nilai k). Ruang 1-2 sengaja kecil supaya nama mesin dan saiz nombor kekal sesuai.

## 4. Bukti determinisme seed
Dalam `tests/puzzle-session.test.mjs`:
- **Ujian 1:** `createSession(L, {seed})` dua kali memberi objek yang sama tepat bagi 5 seed × 3 level, termasuk 0 dan 2³² − 1. Definisi (hints dan jawapan) juga sama, dan begitu juga `newWorkshop({seed})` dan `newSluice({seed})`.
- **Ujian 2:** seed berbeza memberi sekurang-kurangnya 6 konfigurasi berbeza bagi setiap level.
- **Ujian 10:** params rosak dengan seed sah dipulihkan kepada sesi yang **sama** dengan sesi asal.

## 5. Bukti reload
- **Unit (ujian 4):**
  - 1-2: susunan salah dijalankan sekali, kemudian sanitize semula → objek sama, termasuk plat mesin.
  - 1-3: injap dipusing dan satu ujian salah, kemudian reload → keadaan sama, dan tetapan jawapan masih membuka pintu.
  - 1-1: reload dua kali → senarai harga sama.
- **Unit (ujian 3):** pusingan simpan → muat melalui stor sebenar setiap level. Setiap stor hanya menulis kuncinya sendiri.
- **Pelayar (`tests/puzzle-reload-check.cjs`, Chromium headless):**
  - 1-2: ulang main, kemudian reload. Plat mesin `f(x) = …` / `g(x) = …` dan "Stok: n komponen" sama dengan params sesi, dan `runs` kekal.
  - 1-3: ulang main, kemudian reload. "TANDA ASAL n" dan "perlu bacaan n" sama dengan params sesi, dan tetapan serta `tests` kekal.
  - 1-1: putaran selepas K3 memberi senarai harga berseed. Resit Stor Kayu memaparkan nombor sesi, pembelian salah ditolak dengan sebab, dan selepas reload dan Sambung resit adalah sama.
  - Keputusan: lihat §8.

## 6. Keputusan migrasi
| Kes | Hasil (diuji) |
|---|---|
| Save baharu | lawatan pertama → sesi puzzle asal; ulang main → sesi berseed (ujian 3, 7) |
| Save lama tanpa sesi | 1-1: K1/K2/K3 → `w1.l1.supply.k1/k2/k3`, pembelian `bought` kekal sah; 1-2/1-3: sesi asal, `delivered`/`open`/`cave.solved` kekal; bait Day 03 melalui `createCampaignStore` → completions, checkpoint dan delivered kekal (ujian 5) |
| Save dengan sesi | dipulihkan sama tepat (ujian 3, 4) |
| Refresh di tengah puzzle | nombor dan kemajuan sama (ujian 4, semakan pelayar) |
| Selesai → reload | kekal selesai; jawapan puzzle lain tidak diterima sebagai "selesai" (ujian 6) |
| Ulang main selepas tamat | sesi baharu, kemajuan level bermula semula, profil/syiling kekal (ujian 7) |
| Seed tidak sah / data rosak | `createSession` menolak seed bukan integer 32-bit; params mustahil atau tidak boleh dilukis → puzzle asal; sampah (null, rentetan, tatasusunan, id terlalu panjang) tidak pernah mencetuskan ralat; medan asing dibuang; JSON rosak dalam stor → run kosong (ujian 10) |

Perubahan format adalah **tambahan** sahaja (medan `puzzle`), jadi build lama yang membaca save baharu hanya mengabaikannya. Satu-satunya perubahan tingkah laku pada kunci sedia ada: `denai-l1-last-variant` kini boleh bernilai `G` (senarai harga berseed).

## 7. UX & keadilan (Fasa 7)
- Seed dan id dalaman tidak pernah dipaparkan; hanya nombor puzzle.
- Nombor ditetapkan sekali setiap run dan tidak berubah semasa menjawab; tiada pemasa baharu.
- Petunjuk, maklum balas salah, Jurnal ("Lihat cara kira"), nota penyelenggaraan, plat gua, dail meter, rahsia (kanopi 1-2, tablet domain/songsang 1-3) dan petikan kemenangan dibina daripada sesi yang sama. Puzzle asal masih memaparkan teks Day 03 yang sama tepat (diuji).
- Tiada label HUD baharu. Nota Pokok Tinjau (1-1) yang menyebut mesin 1-2 kini umum ("f menggandakan komponen, g membuang komponen rosak") kerana mesin 1-2 boleh berubah.
- Dail 1-3 kini dilukis daripada julat sebenar (satu detik bagi setiap bacaan; jarum −120°…+120°), bukan detik tetap 3…15.

## 8. Ujian
Semua dijalankan pada branch ini dengan `rc=$?` diambil sejurus selepas setiap arahan. PlayFab di-stub dan hosnya disekat. Pelayar: Chromium headless sahaja.

| Ujian | Kod keluar | Nota |
|---|---|---|
| `analytics.test.mjs` | 0 | 5 lulus |
| `inverse.test.mjs` | 0 | |
| `progress-course.test.mjs` | 0 | 4 lulus |
| `sluice.test.mjs` | 0 | |
| `supply-quest.test.mjs` | 0 | 4 lulus |
| `twins.test.mjs` | 0 | |
| `workshop-v3.test.mjs` | 0 | jangkaan dikemas kini (medan `puzzle`) |
| `workshop.test.mjs` | 0 | |
| `puzzles.test.mjs` | 0 | 8 lulus, nilai Day 03 tidak berubah |
| **`puzzle-session.test.mjs` (baharu)** | 0 | **10 lulus, 0 gagal** |
| `l1-playthrough` | 0 | 76 s |
| `l2-playthrough` | 0 | 75 s |
| `l3-playthrough` | 0 | 113 s |
| `w1-progression` | 0 | 311 s |
| `w1-mobile-check` | 0 | 300 s, 11 viewport |
| `rc-check` | 0 | 63 s |
| `menu-check` | 0 | 30 s |
| `l1-v3-check` (tambahan) | 0 | putaran K2 → K3 kekal |
| `l2-check`, `l3-check` (tambahan) | 0 / 0 | |
| **`puzzle-reload-check` (baharu, pelayar)** | 0 | larian pertama exit 1: skrip tidak mencari teks di dalam container Phaser (plat mesin). Skrip dibaiki dan larian semula exit 0. Bukan pepijat permainan. |

Tangkapan skrin: [`shots/l1-variant-store.png`](shots/l1-variant-store.png) (resit dan penolakan bagi senarai harga berseed) dan [`shots/l2-variant.png`](shots/l2-variant.png).

## 9. Fail
- **Baharu:**
  - `src/v14/puzzles/session.js`
  - `tests/puzzle-session.test.mjs`
  - `tests/puzzle-reload-check.cjs`
  - `audits/day-04/FASA1_SAVE_AUDIT.md` dan laporan ini
- **Diubah:**
  - `src/v14/puzzles/generators/world1.js`: pilihan julat; lalai sama seperti Day 03, jadi seed lama memberi puzzle sama.
  - `src/v14/puzzles/definitions/world1.js`: pembina `caveDefinition`; hints gua dijana dan sama tepat.
  - `src/v14/levels/supply-quest.js`, `workshop-model.js`, `workshop-line.js`, `sluice-model.js`, `sluice-line.js`
  - `src/v14/levels/twin-scene.js`, `inverse-scene.js`
  - `src/v14/core/campaign-store.js`, `inverse-campaign.js`
  - `src/v14/game.js`, `src/v14/level.js`
  - `tests/workshop-v3.test.mjs`: jangkaan dikemas kini dengan sengaja kerana objek workshop kini membawa `puzzle`.

## 10. Risiko
- Hanya Chromium headless digunakan; **tiada ujian pada peranti sebenar**.
- Ruang variasi 1-2 kecil (9 konfigurasi). Ia boleh diluaskan (contohnya f = 3x) jika pemilik setuju dengan nama mesin dan saiz nombor.
- Domain 1-3 tetap kerana mekanik fizikal (lihat §2).
- Lawatan pertama setiap level kekal puzzle asal. Ujian playthrough bergantung padanya, dan ia juga memberi pemain baharu pengalaman yang sama.
- Teks fallback statik dalam `twin-world.js` dan `inverse-world.js` masih menyebut puzzle asal. Scene menggantikannya dengan teks sesi; ia hanya digunakan jika dipanggil terus.
- `missions.js`, `composition.js` dan `inverse.js` (legasi) tidak disentuh.

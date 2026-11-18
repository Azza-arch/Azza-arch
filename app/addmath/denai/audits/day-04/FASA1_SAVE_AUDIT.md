# DENAI Day 04 · Fasa 1 — Audit simpanan & progresi (sebelum implementasi)

| Kunci | Pemilik | Kandungan berkaitan puzzle | Ditulis bila | Dibaca bila |
|---|---|---|---|---|
| `denai-save-v14` | `save.js` (`SaveManager`), Level 1-1 | `quest` {variant K1–K3, found, doorTried, key, door, bought{x,cost}, planks, repaired, shortcut}; `runSeed` (untuk mesin lif legasi) | `writeSave()` (mechanisms.js) selepas setiap langkah quest, syiling, checkpoint, dialog | `continueFromSave()` / `loadRun()` semasa Sambung; `launchLevel('w1-l1')` |
| `denai-profile-v1` | `progress.js` | tiada parameter puzzle (completions, best, pencapaian) | tamat level | menu, `pickVariant()` (bilangan completion) |
| `denai-campaign-v1` | `core/campaign-store.js`, Level 1-2 | `levels['w1-l2'].run.workshop` {order, runs, lastOut, delivered, swaps} | `writeSave()` twin-scene → `saveRun()` | `init()` twin-scene (tanpa `fresh`) |
| `denai-l3-campaign-v1` | `core/inverse-campaign.js`, Level 1-3 | `run.sluice` {setting, tests, lastReading, open, noteRead, cave{setting, tries, solved}} | `writeSave()` inverse-scene → `save()` | `init()` inverse-scene (tanpa `fresh`) |
| `denai-l1-last-variant` | `supply-quest.js` | id varian 1-1 terakhir (putaran ulang main) | `newRun()` 1-1 | `pickVariant()` |
| `denai-records-v14`, `denai-lb-*` | legasi / leaderboard | tiada | — | migrasi baca sahaja |

**Penemuan**
1. Ketiga-tiga level guna laluan simpanan **berbeza** (tiga kunci, tiga sanitizer). Tidak digabungkan.
2. Setiap sanitizer (`sanitizeQuest`, `sanitizeWorkshop`, `sanitizeSluice`) membina semula objek daripada medan yang dikenali — medan baharu **akan dibuang** melainkan sanitizer meneruskannya. `sanitizeRun` (1-2, 1-3) memanggil sanitizer ini, jadi medan dalam objek level mengalir terus.
3. Parameter puzzle **tidak disimpan**: 1-1 simpan id varian (K1–K3) sahaja; 1-2/1-3 bergantung pada pemalar modul (`P = definisi tetap`). Jawapan disemak semula terhadap pemalar ini semasa muat (cth. `open` hanya jika `reading(setting) === 13`).
4. Refresh di tengah puzzle: 1-1 sambung dengan varian sama (id disimpan); 1-2/1-3 sambung dengan nombor tetap. Tiada penjanaan semula semasa scene load.
5. Ulang main: 1-1 `freshAdventure()` padam `denai-save-v14` dan `newRun()` pilih varian seterusnya; 1-2/1-3 `scene.restart({fresh:true})` → `newRun()` baharu (kemajuan profil/coins kekal).
6. Teks berkod keras yang perlu ikut parameter jika variasi diaktifkan: 1-2 petunjuk "Mesin pertama menerima 5", petikan kemenangan "gf(5) = 8, fg(5) = 6", rahsia kanopi (f = 2x, g = x − 2), nota Pokok Tinjau 1-1; 1-3 detik dail 3…15 + `angleFor`, "TANDA ASAL 13", nota "2 × tetapan + 3", plat gua "perlu bacaan 15", "Bacaan 13 ✓", "sasaran 13", "Lihat cara kira", plat gua jawapan `k===6`, petikan kemenangan f⁻¹(13), tablet domain/songsang.
7. Had mekanik: 1-1 jambatan ada 5 papan fizikal (need = 5, stok 8); 1-2 peti stok dilukis ≤ 6; 1-3 roda 7 takuk (0–6) dan 7 plat gua (0–6) → domain **tidak boleh** berubah; tetapan 0 ialah kedudukan mula roda (mesti bukan jawapan); digit atlas hanya 0–9 (bacaan mesti ≥ 0).

**Keputusan reka bentuk** — medan tambahan `puzzle` di dalam objek level sedia ada (`quest.puzzle`, `workshop.puzzle`, `sluice.puzzle`), tanpa kunci baharu dan tanpa ubah skema; save lama tanpa `puzzle` → sesi asas daripada definisi asal (1-1 ikut K1–K3 dalam save).

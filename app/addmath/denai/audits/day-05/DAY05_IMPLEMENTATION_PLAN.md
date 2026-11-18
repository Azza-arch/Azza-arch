# DENAI Day 05 · Pelan implementasi (menunggu kelulusan)

Status: **belum dilaksanakan**. Cadangan branch: `claude/denai-day05-gameplay` daripada `82af8fd`.

## Skop dicadangkan (P1 dahulu, P2 kecil yang berkaitan)
| # | Isu | Perubahan | Fail | Saiz |
|---|---|---|---|---|
| 1 | P1-A pembelian tanpa sengaja | `useQuest('buy')`: jika panel tertutup, hanya `openStore()`; `buy()` hanya bila panel sudah terbuka (butang Beli / E dalam panel / Guna semasa panel terbuka) | `levels/supply-quest.js` | ~3 baris |
| 2 | P1-B panel stor terpotong (≤ ~644 px landskap) | dalam blok `max-height:540px and landscape`: lebar mengikut kandungan dengan had skrin (`width:auto; max-width:calc(100% - 16px); left/right` dikira supaya tidak melepasi tepi), atau Beli/Tutup ke baris kedua bila sempit; resit boleh dibalut (`white-space:normal`) | `ui/v4.css` | ~4 baris CSS |
| 3 | P1-C label "E" pada sentuh (1-2) | guna `wsp.key` / `touch?'Guna':'E'` seperti 1-3 | `levels/twin-scene.js` | ~2 baris |
| 4 | P2-A gesaan penamat dipotong | buang awalan dengan `replace(/^E · /,'')`; sembunyikan label kekunci bagi mesej bukan tindakan (1-2 dan 1-3) | `levels/twin-scene.js`, `levels/inverse-scene.js` | ~3 baris |
| 5 | P2-B Jurnal di atas stor | `openJournal` menutup panel stor (atau pengendali kekunci stor abaikan bila `journal-open`) | `levels/supply-quest.js` | ~2 baris |
| 6 | P2-C arah selepas misi (pilihan) | teks pin `done` + "· teruskan ke penamat" (1-1/1-2/1-3) | `supply-quest.js`, `workshop-line.js`, `sluice-line.js` | teks sahaja |

P2-D (pin dari mula untuk 1-2/1-3) dan P2-E **tidak** dicadangkan untuk Day 05. Ia boleh dibuat kemudian jika diluluskan.

## Tidak akan diubah
Sistem save dan sesi puzzle Day 04, matematik dan penjana, fizik, perlanggaran, laluan, kedudukan objek, aset seni, HUD (tiada label baharu), dan `design/trailer/`.

## Ujian
- Ujian baharu atau dikemas kini:
  - `l1-v3-check` atau ujian baharu: buka semula stor → tiada pembelian, mesej kosong.
  - `w1-mobile-check`: tambah semakan limpahan anak (`scrollWidth`/kedudukan elemen) untuk panel stor, dan label gesaan 1-2 = "Guna" pada sentuh.
  - Tangkapan skrin sebelum/selepas: SE landskap stor, telefon 1-2 tuas, gesaan penamat.
- Regresi penuh:
  - 10 ujian unit;
  - `puzzle-reload-check`;
  - `l1-playthrough`, `l2-playthrough`, `l3-playthrough`;
  - `w1-progression`, `w1-mobile-check`;
  - `rc-check`, `menu-check`;
  - `l1-v3-check`, `l2-check`, `l3-check`.
- Kod keluar sebenar direkod.

## Risiko regresi
| Perubahan | Risiko | Kawalan |
|---|---|---|
| 1 | Ujian yang membeli dengan E di pintu semasa panel tertutup akan berubah. Semakan: `l1-playthrough` membeli dengan E **semasa panel terbuka** (pengendali panel); `l1-v3-check` mengetik `#sp-buy`. Jangkaan: tiada kesan. | jalankan kedua-duanya |
| 2 | CSS landskap pendek mempengaruhi semua telefon landskap; boleh menindih butang sentuh atau pin | `w1-mobile-check` 11 viewport + semakan limpahan baharu |
| 3–4 | rendah (teks / label) | `l2-check` (telefon), `l2-playthrough` |
| 5 | Jurnal/stor: urutan tutup/buka dan kunci UI | `w1-mobile-check` (jurnal), probe |
| 6 | Teks pin berubah; ujian yang menyemak teks `done` tepat mungkin perlu dikemas kini | grep ujian sebelum ubah |

# World 1 V3 · Fasa D — Level 1-2 "Bengkel Dua Mesin"

Branch `claude/denai-w1-v3-l2` (dari `claude/denai-w1-v3-l1`). Level 1-3 tidak diubah
(`git diff origin/main` kosong untuk `inverse-*`). Perubahan Level 1-1 V3 dikekalkan.

## 1. Pembaikan Level 1-1 (commit `b1af1f7`)
- **Panel stor di telefon:** susun atur bar kompak (resit → −/kuantiti/+ → jumlah → Beli, butang ≥ 40 px).
  Landskap: di tengah, di bawah cip HUD, tidak sampai ke butang jeda. Potret: selebar skrin di bawah HUD.
  Semasa membeli, penjejak misi dan gesaan dunia disembunyikan. Panel tutup sendiri 1.4 s selepas belian
  atau apabila pemain beredar. Diuji pada landskap, potret dan landskap kecil (iPhone SE): tiada tindihan.
- **Tangga:** pemain kini melangkah ke platform apabila kakinya dalam 6 px dari puncak tangga dan tidak
  menekan S, walaupun W dilepaskan sedikit awal. Hanya syarat keluar di puncak diubah; kelajuan, graviti
  dan lompatan tidak berubah. (Fail ini dikongsi semua level, jadi tangga di 1-2/1-3 juga mendapat manfaat.)

## 2. Level 1-2 — yang dibina
**Cerita:** jambatan hilir sungai perlu **8 komponen**. Stor bengkel ada **5 papan**. Dua mesin
bersambung dengan tali sawat:
- **Mesin A · Gandaan** `f(x) = 2x`
- **Mesin B · Kawalan kualiti** `g(x) = x − 2`

**Aliran misi (tiada kuiz, tiada panel soalan):**
1. **Lintasan batu loncatan** (D4): tiang rendah → tiang tinggi → dek atas. Platform semata-mata.
2. **Bengkel ditemui:** "Bengkel perlu 8 komponen untuk jambatan. Ada 5." Penjejak misi muncul.
3. **Larian demo:** susunan asal **B dahulu**. Pemain menarik tuas, 5 papan bergerak di tali sawat:
   B → 3, A → 6. Penerima: **6/8**. Komponen dikembalikan — tiada kehilangan, tiada penalti.
   "Mungkin susunan mesin silap? Tuas susunan ada di dek atas."
4. **Tuas susunan:** di dek atas (naik tangga tebing rahsia → kanopi → dek). Mesin bertukar tempat secara
   fizikal (animasi). "Kini A (f(x) = 2x) menerima bahan dahulu. Ramal hasilnya sebelum menjalankan."
5. **Larian kedua:** A → 10, B → 8. Penerima **8/8 ✓**, jambatan dibina papan demi papan.
   Ringkasan: "Susunan fungsi boleh mengubah hasil." + "Lihat cara kira":
   `gf(5) = g(f(5)) = g(10) = 8` dan `fg(5) = f(g(5)) = f(3) = 6`. Maka `gf ≠ fg` untuk contoh ini.
6. Pemain boleh menukar susunan berulang kali dan menjalankan semula; hanya hasil ≥ 8 membina jambatan.

**Petunjuk 3 peringkat** ("?"), sama gaya dengan 1-1. Zon: Jejak Masuk · Gudang · Batu Loncatan ·
Laluan Rahsia · Bengkel Dua Mesin. Rahsia: nota mandur di dek (urutan dalam `fg(x)`) dan nota kanopi
(`gf(x) = 2x − 2`, `fg(x) = 2x − 4`). Nota rahsia 1-1 di Pokok Tinjau kini menyebut mesin bengkel ini.

**Notasi KSSM:** `fg(x) = f(g(x))` — g dahulu. "A dahulu" = `gf`, "B dahulu" = `fg`.

## 3. Simpanan & migrasi
`denai-campaign-v1` → `run.workshop = {order, runs, lastOut, delivered, swaps}`, disimpan serta-merta
(tukar susunan, setiap larian). Disanitasi: susunan tidak sah → BA; `delivered` hanya diterima jika susunan
tersimpan memang menghasilkan ≥ 8; kiraan dihadkan 999.
- Larian lama dengan stesen akhir sudah selesai → bengkel `delivered`, jambatan berdiri, checkpoint kekal.
- Larian lama belum selesai → bengkel baharu; syiling/rahsia/checkpoint (kecuali `exit`) kekal.
- Main semula me-reset bengkel; kiraan tamat dan syiling seumur hidup kekal.
- Checkpoint `exit` dan pintu keluar memerlukan bengkel siap.

## 4. Keputusan ujian
RESULTS

## 5. Had & catatan
- Masa di atas ialah bot; masa pemain sebenar belum diukur.
- Kod stesen lama (`composition*.js`, `STATIONS` dalam `twin-world.js`) masih wujud untuk migrasi dan
  ujian geometri lama; tidak lagi dipaparkan dalam permainan.
- Tiada pencapaian baharu untuk 1-2 dalam fasa ini (boleh ditambah dalam Fasa F jika dipersetujui).
- Papan pendahulu V3 kekal tersembunyi sehingga `denai_l1_time_v3` dicipta oleh pemilik.

## Bukti
`L2-V3-desktop.jpg` (8 detik larian papan kekunci) · `L2-V3-telefon.jpg` (landskap & potret, sentuhan sahaja).

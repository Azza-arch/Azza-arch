Method: dual-agent (A: /root/gameplay_review · B: /root/evidence_review)

# Audit DENAI Level 1–3

Tarikh: 15 November 2026. Sasaran: `app/addmath/denai/index.html` → `src/v14/game.js`. Audit kod kerja semasa, termasuk fail Level 3 yang belum dijejak Git. Tiada pelaksanaan diubah.

DENAI mempunyai dunia platformer yang jelas, tetapi matematik masih terutama menjadi syarat membuka laluan. Level 2 paling hampir kepada eksperimen mesin. Level 3 memperlihatkan operasi songsang tanpa memerlukan pemain melakukannya sendiri. Ini penilaian reka bentuk berdasarkan kod, bukan ukuran pembelajaran pelajar.

| Level | Tindakan pemain | Kesan matematik pada dunia | Unsur kuiz |
|---|---|---|---|
| 1 | Teroka, tolak kotak, lompat, pilih input/peraturan, Semak, Buka jambatan | Output salah mempratonton papan; output 7 membina lintasan dengan collision | Fizik dijeda, pilihan jawapan dan semakan betul/salah dalam panel |
| 2 | Pilih input, tukar urutan, Hantar di dua stesen | Paket menunjukkan transformasi; kedua-dua penerima mengaktifkan jambatan | Sasaran tetap 9/25 kemudian 19/49; output lain tidak membuka kegunaan laluan |
| 3 | Pilih output 13/7/15 dan tekan Songsangkan | Mesin mengira input asal, menyalakan meterai; tiga meterai membuka jambatan | Pemain boleh memadankan nombor yang diberikan tanpa mencari songsangan |

## Bukti dan keutamaan

1. **P1 — Level 3 tidak memerlukan keputusan songsang.** `levels/inverse.js:5–10,21–29` mengira `(y−3)/2` secara automatik dan menandakan meterai berdasarkan output dipilih. Permainan bermula pada 13, sudah merupakan sasaran pertama. `inverse-scene.js:168` memberi urutan operasi. Cadangan: pemain memilih/menyusun operasi songsang, atau menggunakan hasil 5, 2 dan 6 untuk mengawal objek. Bezakan demonstrasi daripada ujian penguasaan. Arahan susulan: impeccable shape.
2. **P2 — Hasil matematik kebanyakannya hanya membuka satu keadaan laluan.** L1 aktif hanya mempunyai satu gate (`level.js:86`); preview salah tidak mempunyai collision (`lift-panel.js:95–109`). L2 memerlukan dua latch (`composition.js:18–22`), kemudian membuka dek tetap (`twin-scene.js:80–90`). Cadangan reka bentuk lebih besar: hasil berbeza mengawal panjang/aras yang berguna untuk laluan atau ganjaran berbeza. Arahan: impeccable shape.
3. **P1 — Teks akhir L2 memberi maklumat salah.** `twin-scene.js:201` menyebut L3 belum tersedia, tetapi `registry.js:4` menetapkannya ready dan L3 berjaya dibuka secara live. Cadangan: betulkan status dan sediakan sambungan kempen. Nota L1 `level.js:110` pula menyebut Bab 2 dengan g(x)=3x−2, sedangkan L2 menggunakan x²; jelaskan maksud Bab 2 atau selaraskan teaser. Arahan: impeccable clarify.
4. **P2 — Jejak perantaraan L2 hilang selepas animasi.** Paket dimusnahkan selepas proses (`twin-scene.js:120–132`); panel hanya menyimpan notasi/output (`:178`). `composition.js:8` sudah menyediakan trace penuh. Cadangan: kekalkan `2 → g → 4 → f → 9` dan bandingkan dengan `2 → f → 5 → g → 25`. Arahan: impeccable clarify.
5. **P2 — Pemilih L3 menyembunyikan langkah dua unit.** Label +/− (`inverse-scene.js:138`) mengubah nilai ±2 modulo 19 (`inverse.js:23–24`), termasuk 17→0. Cadangan: nyatakan langkah/kitaran atau gunakan pilihan nilai terus. Arahan: impeccable clarify.

## Kekuatan dan batas

- Tujuh papan L1 membentuk jambatan sebenar; output rendah menunjukkan lintasan pendek. Kamera memberi ruang untuk melihat kesan mesin.
- L2 menunjukkan nilai melalui dua fungsi, dan membenarkan eksperimen tanpa kehilangan nyawa akibat jawapan salah.
- Checkpoint, syiling, rahsia dan laluan pilihan mengukuhkan pengalaman platformer.

Pelajar baharu memerlukan jejak yang boleh dirujuk semula. Pemain mahir boleh menghafal urutan butang L2/L3. Bagi guru, completion membuktikan gate selesai, bukan semestinya penguasaan konsep. Ini inferens, belum diuji dengan pelajar.

## Skor heuristik sementara

| Heuristik | /4 |
|---|---:|
| Status sistem | 3 |
| Padanan dunia sebenar | 3 |
| Kawalan dan kebebasan | 3 |
| Konsistensi | 2 |
| Pencegahan kesilapan | 3 |
| Pengecaman berbanding ingatan | 2 |
| Fleksibiliti dan kecekapan | 2 |
| Minimalisme | 3 |
| Pemulihan ralat | 3 |
| Bantuan | 2 |
| Jumlah | 26/40 |

Skor bersifat penilaian kod dan paparan masuk L3, bukan usability test. Kontras, pembaca skrin, prestasi, rasa kawalan dan telefon tidak diukur. Lima pilihan input L1 ialah beban kecil; kehilangan jejak perantaraan L2 lebih penting.

## Pengesahan

- `inverse.test.mjs`: lulus.
- `twins.test.mjs`: gagal pada baris 38 kerana masih menjangka L3 tidak boleh dimainkan. Bukan bukti matematik L2 rosak; suite tidak selesai.
- A memeriksa L3 secara live dalam tab Chromium baharu, 1440×900; `storage/denai-audit-a-live.png`. Bukan traversal penuh.
- B berjaya memeriksa mekanisme L1–3 pada desktop 1440×900 dan telefon 390×844 selepas menggantikan readiness check yang ditolak CSP. Enam screenshot evidence-l{1,2,3}-{desktop,mobile}.png disimpan. Tiada page error atau limpahan mendatar pada sampel telefon. Pemeriksaan menggunakan pemindahan scene, bukan traversal penuh. Klik sebenar mengesahkan L2 stesen pertama selesai melalui Hantar → Tukar urutan → Hantar pada input lalai 2, dan L3 terus mendapat meterai 13 dengan Songsangkan; output 11 sah tetapi tidak memberi meterai, output 1 ditolak.
- Detector `index.html`: 0 dapatan, tetapi mod regex terhad kerana htmlparser2/css-select/css-tree/domutils tiada. Keputusan ini bukan pengesahan kontras, selector, CSS custom properties atau kualiti pedagogi.

Soalan reka bentuk untuk kerja seterusnya: adakah pemain mendapat laluan kerana memilih jawapan sasaran, atau menggunakan fungsi untuk membina laluan mereka sendiri?

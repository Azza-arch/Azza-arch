# Nota UX V2 — prototype untuk semakan

14 November 2026. Branch `addmath-nota-preview`, asas `168d3e9`.
`git ls-remote` mengesahkan `origin/claude/addmath-nota` masih pada commit tersebut.
Perubahan kerja terdahulu dikekalkan. Tiada push, deploy atau pertukaran status.

## Cuba melalui Laragon

- [Fahami: bentuk dan graf kuadratik](http://localhost/Azza-arch/app/addmath/?semak=1#/nota-v2/t4-2/2.3/fahami)
- [Ulang kaji: rumus seluruh Bab 2](http://localhost/Azza-arch/app/addmath/?semak=1#/nota-v2/t4-2/2.3/ulang-kaji)
- [Latihan: bank soalan Bab 2](http://localhost/Azza-arch/app/addmath/?semak=1#/nota-v2/t4-2/2.3/latihan)
- [Paparan asal 2.3](http://localhost/Azza-arch/app/addmath/?semak=1#/nota/t4-2/2.3)

Prototype Fahami hanya untuk **2.3**. Pautan 2.1 dan 2.2 menggunakan nota asal
dan dilabel demikian. Ulang kaji menggunakan enam rumus Bab 2; Latihan boleh
menapis semua 30 soalan Bab 2. Bab lain belum dimigrasikan.

## Audit implementation asal

Tiada screenshot dilampirkan dalam permintaan. Bukti sebelum dirakam daripada
halaman sebenar di Laragon, termasuk perubahan tab contoh terdahulu.

`noteScreen.js` merender semua section dahulu dan menambah seluruh `.q-list`
di bawahnya. Subtopik 2.3 mempunyai 14 section: enam konsep, dua visual,
satu kumpulan tujuh contoh, rumus, kesilapan, ringkasan, pengenalan dan kaitan
seterusnya. Dua graf mempunyai kawalan sendiri dan dipaparkan serentak.
12 soalan beserta input dan penyelesaian menambah panjang selepas nota.

Lebar `.note-screen` asal maksimum 760px, termasuk padding 32px; kawasan
kandungan 728px. Teks konsep 17px dengan line-height 1.7, pengenalan 18px,
tajuk utama 28–40px dan tajuk bahagian 21–26px. Saiz ini bukan punca utama
masalah. Hierarki tajuk berulang bersama label kecil dan chip DSKP menyebabkan
maklumat kelihatan sama berat. TOC menyorokkan label panjang dan bergulir
mendatar pada telefon. Ia mencampurkan destinasi konsep, visual dan latihan.

Pengulangan yang disengajakan: bucu/paksi simetri muncul dalam konsep, rumus,
contoh, kesilapan dan ringkasan. Ini berguna pada tahap pembelajaran berbeza;
V2 mengasingkan tujuan, bukan memadam pengulangan matematik secara rawak.
Syarat dan prasyarat tidak dipindahkan ke bahagian tersembunyi.

Komponen yang digunakan semula: `renderMath`/KaTeX, `mountVisual` dengan spec
asal, `renderQuestions` termasuk semakan jawapan dan feedback, registry nota,
curriculum DSKP, status dan kawalan preview lokal. Data kandungan tidak disalin
ke bank baharu. `quadraticPlan.js` hanya memetakan lokasi paparan dan panduan
rujukan. Shell mod, rendering contoh, rujukan rumus dan penapis latihan boleh
diekstrak menjadi komponen generik selepas model prototype dipersetujui.

## Apa berubah, apa kekal

| Bahan | Paparan V2 | Akses kandungan lengkap |
|---|---|---|
| Objektif | Satu ayat pada awal | Konteks air pancut asal dalam disclosure |
| Prasyarat | Terus kelihatan, menggunakan ulang kaji 2.1 | Pautan kepada penyempurnaan kuasa dua |
| Enam konsep 2.3 | Semua terus kelihatan | Teks asal, termasuk syarat dan sebab |
| Dua graf | Satu ruang, dua tab bentuk am/verteks | Kedua-dua spec, slider, readout dan alt-text asal |
| Tujuh contoh | Dua dibuka: baca bucu dan sempurnakan kuasa dua | Lima disclosure bertajuk kemahiran; semua langkah, sebab, semakan dan kesimpulan |
| Rumus | Enam entri dalam Ulang kaji Bab 2 | Maksud, syarat, bila guna, carian dan pautan tepat kepada konsep |
| Kaedah ulang kaji | Langkah ringkas di disclosure setiap subtopik | Pautan kepada contoh dengan sebab pengiraan |
| Kesilapan 2.3 | Empat kesilapan dan pembetulan terus kelihatan | Tiada kesilapan dipadam |
| Ringkasan/kaitan | Kekal dalam Fahami | Semua poin dan pautan asal |
| Latihan | Ruang khusus, satu soalan pilihan pada satu masa | Semua 30 soalan, semua bahagian berstruktur dan penyelesaian; tiada gating |

Label tahap `mudah/sederhana/mencabar` dipaparkan sebagai
**Asas/Sederhana/Cabaran**. Nilai data tidak berubah. Pilihan soalan tidak
memerlukan menekan Next berulang kali. Penapis telefon boleh dibuka melalui
“Tapis soalan”. Jawapan sementara kekal dalam memori tab sewaktu menukar
soalan atau kembali daripada pautan konsep; ia bukan simpanan kekal selepas reload.

Persamaan paparan yang panjang dipecahkan pada tanda sama dengan kepada
baris pengiraan, tanpa menukar sebutan. Jadual kes pembezalayan dipaparkan
sebagai D dan tiga baris syarat supaya boleh dibaca pada telefon. Semua
kandungan asal kekal boleh dilihat pada nota asal.

## Bukti pemetaan DSKP dan tiada kehilangan data

Tiada diff pada `src/content/`, termasuk curriculum, nota, soalan, jawapan,
langkah, provenance dan status. DENAI dan rooftop tidak disentuh.
Semakan menggunakan pemetaan DSKP sedia ada dalam repo, bukan dakwaan
pengauditan silibus luaran yang baharu.

| SP | Konsep yang terus kelihatan | Contoh asal | Soalan bertanda SP |
|---|---|---|---:|
| 2.3.1 | Kesan a, b, c | Contoh 2, boleh dibuka | 2 |
| 2.3.2 | Kedudukan graf dan jenis punca | Contoh 4, boleh dibuka | 2 |
| 2.3.3 | Bentuk verteks dan bentuk lain | Contoh 3, terbuka | 2 |
| 2.3.4 | Kesan a, h, k | Contoh 1 terbuka; Contoh 4 tambahan | 3 |
| 2.3.5 | Melakar graf | Contoh 5, boleh dibuka | 2 |
| 2.3.6 | Maksimum dan minimum | Contoh 6–7, boleh dibuka | 2 |

Satu soalan boleh meliputi lebih satu SP. Manifest
[`coverage.json`](tests/artifacts/nota-v2/coverage.json) merekodkan destinasi
**14/14 section, 7/7 contoh dan 30/30 soalan Bab 2**. Ujian menolak section
tanpa destinasi, SP tanpa konsep/contoh/latihan, pautan rumus tanpa konsep,
atau perubahan status prototype daripada review.

## Perbandingan sebelum/selepas

Ukuran pada state awal dengan disclosure tertutup, font selesai dimuatkan.
Ia membandingkan nota campuran asal dengan Fahami, bukan jumlah semua bahan.

| Viewport | Nota asal 2.3 | Fahami V2 | Pengurangan tinggi awal |
|---|---:|---:|---:|
| Desktop 1440 × 900 | 11,040px | 6,537px | 40.8% |
| Telefon 390 × 844 | 13,237px | 8,631px | 34.8% |

Fahami masih mempunyai panjang yang diperlukan untuk semua konsep penting.
Formula dan contoh boleh dicapai melalui pautan terus, tanpa menelusuri
keseluruhan halaman. Pengurangan panjang **bukan ukuran kefahaman**.

| Bukti screenshot penuh | Sebelum | Selepas |
|---|---|---|
| Desktop | [Asal](tests/artifacts/nota-v2/desktop-before-full.png) | [Fahami](tests/artifacts/nota-v2/desktop-fahami-full.png) |
| Telefon | [Asal](tests/artifacts/nota-v2/mobile-before-full.png) | [Fahami](tests/artifacts/nota-v2/mobile-fahami-full.png) |
| Ulang kaji | — | [Desktop](tests/artifacts/nota-v2/desktop-ulang-kaji-full.png), [Telefon](tests/artifacts/nota-v2/mobile-ulang-kaji-full.png) |
| Latihan | — | [Desktop](tests/artifacts/nota-v2/desktop-latihan-full.png), [Telefon](tests/artifacts/nota-v2/mobile-latihan-full.png) |

## Ujian teknikal dan pembelajaran

- `nota-v2.mjs`: pemetaan kandungan/DSKP lulus.
- `nota-v2-browser.py`: lulus pada 320, 390, 768 dan 1440px. Setiap lebar
  menguji semua 30 soalan, jawapan numerik/ungkapan, setiap pilihan MCQ,
  bahagian berstruktur, penyelesaian, filter kosong, graph tabs/papan kekunci,
  a=0, pautan konsep, Back dan pemulihan jawapan. Semua contoh boleh dibuka.
- Semua mod dan disclosure terbuka: tiada KaTeX error atau limpahan mendatar
  halaman dikesan. Soalan pertama muncul dalam viewport awal telefon.
- `validate-content.mjs` dan `regression.mjs`: lulus.
- `validate-notes.mjs`: 0 ralat, 0 amaran; **84 item memerlukan semakan manusia**
  untuk keseluruhan 15 bab sedia ada. Laporan disimpan di
  [math-validation.md](tests/artifacts/nota-v2/math-validation.md).
- Detector reka bentuk bagi fail V2: tiada penemuan mekanikal.

Ujian penemuan automatik: klik “Paksi simetri” terus ke rumus; atau pilih
Ulang kaji dan cari “paksi simetri”, yang menghasilkan satu entri. Pautan
penerangan penuh fokus kepada konsep s5; refresh URL masih menuju destinasi
itu. Carian “penyempurnaan” menghasilkan dua rujukan yang berkaitan.
Contoh berlangkah boleh dicapai terus daripada pautan awal; sebab −4 didarab
dengan 2, langkah kembangan semakan dan bucu (2, −5) kekal ditunjukkan.

**Belum ada ujian dengan pelajar sebenar.** Automasi membuktikan penemuan dan
fungsi, bukan bahawa pelajar memahami contoh tanpa bantuan. Sebelum rollout,
jalankan sesi berikut dengan 3–5 pelajar, tanpa menunjukkan lokasi butang:

1. Cari rumus paksi simetri dan sebut syaratnya. Catat masa, klik dan bantuan.
   Sasaran percubaan: kurang 30 saat, tanpa bantuan.
2. Baca contoh `2x² − 8x + 3`. Terangkan mengapa −4 menjadi −8 dan mengapa
   bucu ialah (2, −5). Catat penerangan, bukan sekadar jawapan akhir.
3. Pada graf, tukar a kepada negatif dan terangkan perubahan maksimum/minimum.
4. Cuba soalan 2.3, sengaja beri jawapan salah, cari konsep berkaitan dan
   kembali ke soalan. Catat jika pelajar sesat atau jawapan hilang.
5. Cari contoh luas maksimum dalam contoh tambahan dan penyelesaian penuh.

Tukar giliran asal/V2 antara pelajar untuk mengurangkan kesan latihan.
Keputusan belum diisi; jangan label ujian kefahaman sebagai lulus sehingga
pelajar melakukannya. Persetujuan reka bentuk dan model pembelajaran masih
menunggu semakan pemilik terhadap prototype ini.

## Pelan migrasi 18 bab — belum dilaksanakan

1. Semak prototype 2.3 dan dapatan pelajar/guru. Putuskan sama ada dua contoh
   utama, disclosure tambahan dan filter latihan memenuhi keperluan.
2. Ekstrak shell tiga mod, sidebar/pemilih, renderer contoh, carian rumus,
   visual switcher dan latihan kepada modul dikongsi. Gunakan ID semantik
   stabil, bukan indeks section khusus Bab 2. Asingkan panduan rumus daripada
   source matematik; validasi setiap rujukan.
3. Lengkapkan Bab 2 (2.1–2.2) dahulu. Audit SP, contoh dan prasyarat untuk
   setiap subtopik; pilih contoh utama oleh kemahiran, bukan kesemuanya
   menggunakan rule “dua contoh pertama”.
4. Migrasi 15 bab sedia ada dalam kelompok: algebra/fungsi, geometri/vektor/
   trigonometri, kalkulus, kemudian kombinatorik/kebarangkalian dan aplikasi.
   Kekalkan jenis visual sedia ada: jadual tanda, rajah koordinat, segi tiga,
   vektor, graf kadar perubahan dan taburan. Satu renderer tidak bermakna
   semua topik menerima pedagogi atau graf yang sama.
5. T5 Bab 6–8 **belum mempunyai fail nota** dalam branch ini. Sediakan dan
   semak kandungan DSKP untuk tiga bab tersebut sebelum menganggapnya sebagai
   migrasi. Jangan menjana tajuk kosong sebagai nota lengkap atau menerbitkan
   placeholder.
6. Untuk setiap kelompok: manifest sebelum/selepas, checksum kandungan,
   validator matematik, KaTeX semua state, interaksi semua soalan, navigasi
   Back/deep link, keyboard, 320–1440px dan ujian pelajar. Kekalkan laluan
   lama sehingga penerimaan; kawalan preview lokal tetap berkuat kuasa.
7. Penerbitan ialah keputusan berasingan selepas semakan. Rollout UI tidak
   menukar `review` kepada `published`. Kerja ini tidak menyentuh deployment.

## Jalankan semula

Apache Laragon mesti berjalan. Node dan Python Playwright sedia ada digunakan;
tiada dependency baharu dipasang.

```powershell
node app/addmath/tests/nota-v2.mjs
python app/addmath/tests/nota-v2-browser.py
python app/addmath/tests/nota-v2-capture.py
```

Jangan jalankan semula capture `--before` selepas menukar nota asal jika mahu
mengekalkan baseline ini. Data ukuran dan screenshot disimpan di
`tests/artifacts/nota-v2/`.

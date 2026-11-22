# Semakan lokal nota Add Math

Disemak pada 14 November 2026, branch `addmath-nota-preview`, asas commit `168d3e9`.
Apache Laragon telah dihidupkan. Tiada deploy, push atau perubahan status penerbitan.
DENAI dan `app/addmath/rooftop/` tidak diubah.

## Membuka nota

- Tingkatan 4: http://localhost/Azza-arch/app/addmath/?semak=1#/map/4
- Tingkatan 5: http://localhost/Azza-arch/app/addmath/?semak=1#/map/5
- Tutup preview: http://localhost/Azza-arch/app/addmath/?semak=0#/start

Preview disimpan bagi tab pelayar. Parameter `semak` mesti berada sebelum `#`.
Routing menggunakan hash: `#/bab/t4-1` membuka senarai subtopik;
`#/nota/t4-1/1.1` membuka nota. Refresh tidak memerlukan rewrite Apache.

| Bab | URL preview |
|---|---|
| T4 Bab 1 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-1 |
| T4 Bab 2 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-2 |
| T4 Bab 3 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-3 |
| T4 Bab 4 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-4 |
| T4 Bab 5 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-5 |
| T4 Bab 6 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-6 |
| T4 Bab 7 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-7 |
| T4 Bab 8 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-8 |
| T4 Bab 9 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-9 |
| T4 Bab 10 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t4-10 |
| T5 Bab 1 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t5-1 |
| T5 Bab 2 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t5-2 |
| T5 Bab 3 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t5-3 |
| T5 Bab 4 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t5-4 |
| T5 Bab 5 | http://localhost/Azza-arch/app/addmath/?semak=1#/bab/t5-5 |

## Keputusan

- Semua 15 bab diminta tersedia: 47 subtopik, 231 contoh, 387 soalan. Semua kekal `review`.
- `validate-content.mjs`: lulus.
- `validate-notes.mjs`: 0 ralat, 0 amaran, 84 item memerlukan semakan manusia.
- `validator-selftest.mjs`: semua 11 mutasi ditangkap.
- `regression.mjs`: semua lulus.
- `preview.mjs`: lulus; host awam ditolak walaupun `semak=1` atau sessionStorage sedia aktif; draft disembunyikan.
- `notes-smoke.cjs`: 348/348 lulus melalui Laragon, desktop dan emulasi iPhone 13.
  Meliputi semua subtopik, KaTeX tanpa ralat, visual, slider, semua pilihan MCQ,
  jawapan tersimpan bagi input numerik/ungkapan dan bahagian berstruktur, serta penyelesaian penuh.
  Tiada ralat konsol atau limpahan mendatar halaman.
- `notes-browser.cjs`: 22/22 lulus, termasuk sekatan URL nota tanpa preview,
  MathML/font KaTeX, jawapan setara, maklum balas salah dan slider Bab 1.
- Tangkapan skrin desktop dan telefon: `artifacts/local-preview/`.

## Batasan dan isu terbuka

84 item dalam `last-notes-report.md` memerlukan semakan manusia. Lulus automatik
bukan kelulusan pedagogi atau penerbitan. Soalan penaakulan menggunakan semakan
kendiri dengan model jawapan, bukan pemarkahan automatik.

T5 Bab 6–8 belum mempunyai modul nota (di luar skop diminta); sebab itu validator
melaporkan 15 daripada 18 bab keseluruhan.

`http://azza-arch.test/app/addmath/` tidak berfungsi dalam konfigurasi SSL semasa:
CSP `upgrade-insecure-requests` menaik taraf aset kepada HTTPS dan menghasilkan
`ERR_SSL_PROTOCOL_ERROR`. URL localhost di atas telah diuji dan berfungsi.
Dasar CSP asal dikekalkan.

Preview hanya dibenarkan pada `localhost`, `127.0.0.1`, `[::1]` dan
`azza-arch.test`, dengan HTTP/HTTPS serta `semak=1`. Ini kawalan paparan aplikasi
statik, bukan perlindungan akses fail sumber jika fail itu dimuat naik ke pelayan
awam. Tiada fail dimuat naik atau diterbitkan dalam kerja ini.

## Ulang ujian

Jalankan validator dengan Node dari root repo. Untuk browser test, gunakan
Playwright yang tersedia dan tetapkan PowerShell:

```powershell
$env:ADDMATH_BASE_URL='http://localhost/Azza-arch/app/addmath/'
node app/addmath/tests/notes-smoke.cjs
node app/addmath/tests/notes-browser.cjs app/addmath/tests/artifacts/local-preview
```

Sesi ini menggunakan Playwright sedia terpasang bersama pakej Python melalui
Node module resolver; `require('playwright')` biasa belum tersedia dalam repo.
Tiada dependency dimuat turun. Apache mesti berjalan sebelum browser test.

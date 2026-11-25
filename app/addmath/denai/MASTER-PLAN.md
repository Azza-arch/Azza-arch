# DENAI — Pelan Induk Dunia & Level

Asal: 15 Nov 2026 (`claude/denai-master-plan`). **Dikemas kini 25 Nov 2026 dengan keputusan pemilik:
semua 18 bab dalam ± 9 dunia gabungan.** Dokumen ini ialah hala tuju, bukan janji: setiap dunia
hanya direka terperinci apabila tiba gilirannya, dan pengelompokan di bawah masih boleh diubah pemilik.

## Konsep
- **DENAI = game PENGEMBARAAN Add Maths** (platformer 2D), **bukan kuiz**.
- **Matematik mesti mengubah dunia.** Jawapan pemain membina laluan, menggerakkan mesin atau membuka jalan.
- **Jawapan salah ialah pemerhatian, bukan hukuman.** Dunia menunjukkan *kenapa* (terlalu tinggi, tenggelam,
  terhantuk batu); tiada nyawa hilang, pemain ubah dan cuba lagi.
- Gelung: teroka → faham mekanik → guna matematik → dunia berubah → teruskan.
- Solo dahulu; co-op kemudian.

### Struktur: dunia gabungan (keputusan pemilik, 25 Nov 2026)
- **Bukan lagi "1 bab = 1 dunia" (18 dunia).** Semua 18 bab KSSM Add Math (T4 Bab 1–10, T5 Bab 1–8)
  dimasukkan dalam **± 9 dunia**; bab yang berkait secara matematik dikumpulkan.
- **Corak setiap dunia gabungan:** setiap level fokus pada **satu bab** dahulu; **level terakhir ialah
  kemuncak gabungan** yang menggunakan konsep semua bab dalam dunia itu bersama-sama.
  Satu dunia boleh ada **3–5 level**. Dunia satu bab (1, 2) kekal 3 level.
- **Formula level:** kawasan intro → penerokaan → mekanisme matematik → aplikasi (matematik mengubah dunia)
  → penamat + **bayangan level atau dunia seterusnya**.

### Pengembaraan (diperkukuh)
- **Satu cerita merentas dunia** — misi besar Chill Boy. Cadangan (belum muktamad): jaringan *denai*
  (laluan) yang menghubungkan tanah ini telah terputus; setiap dunia memulihkan satu bahagian, dan
  setiap kemuncak memberi satu kepingan peta yang membuka dunia seterusnya. Dunia 9 menutup cerita.
- **Setiap dunia ada:** tema sendiri, **mercu tanda** yang kelihatan dari jauh, **laluan pilihan** dan
  **rahsia** (syiling, jalan pintas, cincin emas).
- **Setiap level tamat** dengan bayangan level atau dunia seterusnya (contoh: penamat 1-3 menunjukkan
  Dunia 2 Lembah Batu Kapur).

### Peraturan peta
- Jangan terlalu banyak tanah rata; jangan ulang corak tangga/platform.
- Setiap struktur ada sebab; setiap dek ada sokongan.
- Laluan utama jelas; laluan rahsia pilihan.
- Setiap kawasan ada mercu tanda.
- Teka-teki mengubah dunia; elakkan "buka panel, jawab, selesai".

## Status sebenar (25 Nov 2026)
| Dunia | Status | Di mana |
|---|---|---|
| 1 Hutan & Sungai: 1-1 Jejak Taman Fungsi, 1-2 Jambatan Berkembar, 1-3 Gerbang Songsang | **boleh dimain (live)** | `main`; `src/v14/levels/registry.js` |
| 2 Lembah Batu Kapur | **lengkap (live)**: 2-1 Jejak Lengkung, 2-2 Lembah Puncak, 2-3 Gerbang Parabola; kemas visual Fasa 7 siap | `WORLD-2-BLUEPRINT.md`, `W2-POLISH-NOTES.md` |
| 3 Kilang & Lombong | **boleh dimain (live)**: 3-1 Tiga Injap, 3-2 Rel Memotong Cerun, 3-3 Bilik Kawalan, 3-4 Loji Optimum | `WORLD-3-BLUEPRINT.md`, `src/v14/levels/w3/` |
| 4–9 | dirancang (jadual di bawah) | dokumen ini |

## Senarai dunia (cadangan pemilik, 25 Nov 2026 — susunan belum muktamad)
"Asas" = Kenney Pixel Platformer (sedang digunakan). Industrial dan Farm = pek Kenney CC0 yang sudah ada
dalam repo cawangan (lihat Aset). Level ialah cadangan kerja; tajuk boleh berubah.

| # | Dunia | Bab DSKP | Tema cadangan | Level cadangan | Contoh matematik yang mengubah dunia | Aset utama | Status | Keutamaan |
|---|---|---|---|---|---|---|---|---|
| 1 | **Hutan & Sungai** | T4 Bab 1 Fungsi | hutan, sungai, jambatan kayu, mesin ringan | 1-1 Jejak Taman Fungsi · 1-2 Jambatan Berkembar · 1-3 Gerbang Songsang | C(x) = 4x + 6 menentukan papan jambatan; susunan dua mesin gf/fg; f⁻¹ memulihkan tetapan pintu air | Asas, Chill Boy | **siap (live)** | kemas kini kecil sahaja |
| 2 | **Lembah Batu Kapur** | T4 Bab 2 Fungsi Kuadratik | lembah karst, tebing, bumbung batu, sungai, pancur air | 2-1 Jejak Lengkung · 2-2 Lembah Puncak · 2-3 Gerbang Parabola | a, h, k membentuk batu loncatan; bucu = titik tertinggi untuk tangkap/loceng; punca = tempat ponton; pembezalayan = rantai sampai / sentuh / tak sampai | Asas (batu 40–43, air), Farm (pagar kandang 2-2) | **siap (live)**; kemas visual Fasa 7 | **kemas dahulu** |
| 3 | **Kilang & Lombong** | T4 Bab 3 Sistem Persamaan + T5 Bab 7 Pengaturcaraan Linear | kilang, paip, lombong, bilik kawalan | 3-1 Tiga Injap (3 pemboleh ubah) · 3-2 Rel Memotong Cerun (linear + tak linear) · 3-3 Bilik Kawalan (rantau tersaur, kekangan) · 3-4 Loji Optimum (kemuncak) | nilai yang memenuhi semua syarat serentak menghidupkan mesin; rantau tersaur menjadi lantai selamat; fungsi objektif memilih pengeluaran terbaik untuk membuka pintu | Industrial | **siap (live)** | kemas kini kecil |
| 4 | **Tanah Tinggi Ladang** | T4 Bab 4 Indeks, Surd & Logaritma + T4 Bab 5 Janjang | ladang teres, rumah hijau, pengairan | 4-1 Kebun Akar (indeks, surd) · 4-2 Rumah Hijau Log · 4-3 Teres Janjang (JA, JG) · 4-4 Ladang Gabungan (kemuncak) | sisi surd menentukan petak; log mencari masa pertumbuhan; teres naik ikut beza sepunya, air dibahagi ikut nisbah sepunya; kemuncak: pertumbuhan berganda = JG + log mencari n | Farm + Asas | dirancang | **seterusnya** |
| 5 | **Tapak Ukur** (cadangan) | T4 Bab 6 Hukum Linear + T4 Bab 7 Geometri Koordinat | tapak binaan di dataran, kren, tiang ukur | 5-1 Garis Ukur (bahagi tembereng, luas poligon) · 5-2 Jejak Lokus · 5-3 Data Kren (Y lawan X) · 5-4 Tapak Gabungan (kemuncak) | titik bahagi meletak tiang; luas poligon menentukan bahan; lokus membuka laluan rahsia; garis lurus daripada data memberi pemalar untuk menetapkan kren | Industrial (kren, gelegar) + Asas | dirancang | sederhana |
| 6 | **Gua & Tebing Angin** (cadangan) | T4 Bab 8 Vektor + T4 Bab 9 Penyelesaian Segi Tiga | gua, runtuhan batu, tebing berangin, menara pemerhati | 6-1 Jejak Arah · 6-2 Arus & Angin (laju paduan) · 6-3 Menara Sudut (petua sinus/kosinus, kes ambiguiti) · 6-4 Kuil Vektor (kemuncak) | vektor paduan menolak batu atau mengemudi rakit; petua sinus/kosinus mencari tinggi dan jarak untuk memasang tali; kes ambiguiti = dua kedudukan yang sah | Asas (batu) | dirancang | sederhana |
| 7 | **Teluk Kincir** (cadangan) | T5 Bab 1 Sukatan Membulat + T5 Bab 6 Fungsi Trigonometri | teluk, kincir air, jeti pasang surut, rumah api | 7-1 Kincir Air (radian, lengkok, sektor) · 7-2 Jeti Pasang Surut (graf sin/kos) · 7-3 Menara Identiti · 7-4 Teluk Gabungan (kemuncak) | sudut radian memutar kincir ke panjang lengkok yang betul; graf sinus menentukan bila air cukup tinggi untuk bot; persamaan trigonometri menyelaraskan dua gelombang | Asas (air) + Industrial (gear, paip) | dirancang | kemudian |
| 8 | **Bandar Kinematik** | T5 Bab 2 Pembezaan + T5 Bab 3 Pengamiran + T5 Bab 8 Kinematik Gerakan Linear | bandar ujian, landasan bukit, troli, lif | 8-1 Cerun Kecerunan (terbitan) · 8-2 Puncak Optimum (titik pegun) · 8-3 Takungan (kamiran: luas, isi padu) · 8-4 Trek Masa (s, v, a) · 8-5 Bandar Gabungan (kemuncak) | terbitan = kecerunan cerun untuk troli; titik pegun menempatkan pelantar; kamiran mengisi takungan; v = ds/dt dan a = dv/dt menentukan bila lif berhenti | Industrial | dirancang | kemudian |
| 9 | **Pekan Pasar** (cadangan) | T5 Bab 4 Pilih Atur & Gabungan + T5 Bab 5 Taburan Kebarangkalian + T4 Bab 10 Nombor Indeks | pekan, pasar, gudang, pesta penutup | 9-1 Kunci Gabungan (pilih atur) · 9-2 Jambatan Peluang (binomial, normal) · 9-3 Pasar Indeks · 9-4 Pesta Gabungan (kemuncak + penutup cerita) | bilangan susunan membuka kunci kombinasi; kebarangkalian menentukan berapa papan selamat perlu dibawa; indeks harga memilih bekalan; kemuncak menutup misi Chill Boy | Farm (peti, gerai) + Asas | dirancang | kemudian |

Liputan: T4 Bab 1–10 dan T5 Bab 1–8 masing-masing tepat sekali (18/18).

### Isu yang masih sah
1. **Dunia 3:** DSKP Bab 3 ialah (a) sistem linear **tiga** pemboleh ubah dan (b) satu linear + satu
   **tak linear**. "Dua pemboleh ubah, dua syarat" ialah Tingkatan 3: hanya sebagai pemanasan.
2. **Dunia 8:** Kinematik T5 berasaskan **pembezaan dan pengamiran** (v = ds/dt, a = dv/dt, s = ∫v dt),
   bukan sekadar laju = jarak ÷ masa. Sebab itu ia dikumpulkan dengan Bab 2 dan 3, dan level kinematik
   datang **selepas** level kalkulus dalam dunia itu.
3. **Bab elektif** (T4 Bab 9, T4 Bab 10, T5 Bab 7, T5 Bab 8) kini berada di dalam dunia gabungan. Perlu
   keputusan: level bab elektif wajib atau laluan pilihan, dan bagaimana kemuncak dunia tanpa bab itu.
4. **Nombor Indeks** (T4 Bab 10): DSKP minta data autentik (lihat `app/addmath/PROGRESS.md`); data dalam
   game mesti berlabel jelas sebagai ilustrasi atau diganti dengan data sebenar.

## Risiko
| Risiko | Kesan | Langkah |
|---|---|---|
| **Dunia lebih besar** (4–5 level berbanding 3) | lebih lama untuk siap setiap dunia; kemuncak gabungan lebih sukar direka | bina dan terbitkan level satu bab dahulu; kemuncak terakhir; satu level satu PR |
| **Bab yang sukar dijadikan mekanik laluan:** Nombor Indeks, Taburan Kebarangkalian, Pilih Atur & Gabungan | "matematik membina laluan" kurang semula jadi; risiko jatuh kembali kepada kuiz | rekabentuk teka-teki jenis lain yang masih mengubah dunia (kunci kombinasi, bekalan, peluang selamat), dan sahkan bahawa jawapan salah masih diperhatikan dalam dunia |
| **Seni yang belum ada:** latar karst (Dunia 2), gua (Dunia 6), pantai/teluk (Dunia 7), ais/salji (jika dipilih kemudian) | identiti visual tidak cukup jelas; godaan untuk redesign | guna aset Kenney sedia ada dahulu (lihat Aset); seni baharu hanya jika benar-benar perlu, direkod sebagai risiko dan diluluskan pemilik |
| **Peta dunia dalam game** (`assets/world-map/world-map.png`) hanya ada zon untuk Dunia 1–4 | 9 dunia tidak muat; nama dan bab Dunia 3–4 berubah | kemas kini peta dan senarai dunia apabila Dunia 3 hampir siap (lihat "Perlu dikemas kini kemudian") |
| **Kemuncak gabungan menjadi terlalu sukar** untuk murid T4/T5 | murid tersekat di akhir dunia | kemuncak guna semula mekanik yang sudah dipelajari dalam dunia itu; petunjuk dalam dunia; laluan mudah disahkan (peraturan di bawah) |

## Peraturan pengesahan teka-teki (wajib untuk semua dunia)
Diperoleh daripada Dunia 2: lompatan Chill Boy sangat murah hati (puncak 1.71 jubin, larian ≈ 3.9 jubin),
jadi tanpa semakan, jawapan salah biasanya masih boleh dilalui (blueprint asal Dunia 2: 25/25 dan 15/16
tetapan salah boleh dilalui).
1. **Setiap teka-teki yang membina laluan mesti disahkan dengan analisis lompatan sebenar sebelum dibina
   dalam peta** (`analyseStation` dalam `src/v14/levels/w2/quadratic.js`, atau setara untuk mekanik lain).
2. **Jawapan betul** mesti boleh dilalui dengan lompatan **5 % lebih lemah**.
3. **Setiap jawapan salah** mesti **gagal secara fizikal** dengan lompatan **5 % lebih kuat** (bukan kerana
   game berkata "salah").
4. **Laluan betul mesra murid:** panjat ≤ **1.5 jubin**, celah ≤ **2 jubin**.
5. **Geometri peta dijana daripada definisi yang sama yang diuji** (contoh: `level-2-1-data.js` dijana
   daripada stesen dalam `quadratic.js`, dan ujian membaca semula tanah peta untuk menganalisis setiap
   stesen sekali lagi).
6. **Fizik yang jujur dua arah** (pelajaran Fasa 3 Dunia 2): buktikan jawapan betul dengan model
   *ketat* (lompat dari berdiri, tanpa ketepatan), dan jawapan salah dengan model *murah hati*
   (trajektori 2D pada laju penuh; batu hanya menghalang di tempat badan berada). Lompatan Chill Boy
   menyeberang celah hingga ≈ 4 jubin, jadi perubahan kecil (anjakan 1 jubin) biasanya tidak boleh
   dibezakan oleh lompatan sahaja: guna **binaan berpaut** (struktur hanya wujud jika jawapan melalui
   semua sauh/cincin, dan tanpa struktur celah mesti mustahil) dan sahkan kedua-dua syarat itu.
7. Faktor kegagalan yang dipaparkan kepada murid mesti benar dari segi fizik (contoh: `buried`,
   `submerged`, `roof`, `climb`, `gap`, `loose` dalam Dunia 2).
8. Setiap level juga perlu ujian pelayar laluan penuh dengan fizik sebenar (desktop + telefon landskap)
   sebelum masuk ke menu.

## Aset
Kekalkan identiti visual DENAI. **Jangan redesign Chill Boy atau aset yang stabil.**

| Pek | Lokasi | Lesen | Nota |
|---|---|---|---|
| Kenney Pixel Platformer (asas) | `assets/kenney-pixel-platformer/` (di `main`) | CC0 | sedang digunakan oleh Dunia 1 dan 2 |
| Kenney Pixel Platformer Industrial Expansion | `assets/kenney-pixel-platformer-industrial/` (di `main` sejak Dunia 3: tilemap + lesen) | CC0 | Dunia 3 (lantai logam, dek bahaya, lampu amaran); Dunia 5, 7, 8 |
| Kenney Pixel Platformer Farm Expansion | `assets/kenney-pixel-platformer-farm/` (di `main` sejak 2-2: tilemap + lesen) | CC0 | pagar kandang 2-2; Dunia 4 |
| Chill Boy (Segel2D, versi percuma) | `assets/chill-boy/` | lihat SOURCE-README | watak pemain; tidak diubah |

Ketiga-tiga pek Kenney guna grid 18 px (dipapar 3×), jadi boleh dicampur dalam satu peta.
**Seni baharu hanya jika benar-benar perlu**, dan setiap keperluan direkod dalam Risiko.

## Peta jalan
1. **Siapkan Dunia 2 Lembah Batu Kapur dahulu** (`WORLD-2-BLUEPRINT.md`):
   - Fasa 3: peta penuh 2-1 Jejak Lengkung (pratonton, tiada pautan menu) — siap;
   - Fasa 4: integrasi (registry, menu, Peta Dunia, penamat 1-3, Hub) — siap;
   - Fasa 5: 2-2 Lembah Puncak — siap; Fasa 6: 2-3 Gerbang Parabola — siap;
   - Fasa 7: kemas visual & UI Dunia 2 (`W2-POLISH-NOTES.md`: garis tanah, rasuk loceng, tangga, HUD).
2. **Dunia 3 Kilang & Lombong** (gabungan Bab 3 + T5 Bab 7) — siap: empat level, disahkan, diintegrasi (menu, Peta Dunia, Hub, laman) (`WORLD-3-BLUEPRINT.md`).
3. Dunia seterusnya **satu demi satu**, mengikut susunan yang dipersetujui pemilik.
4. Peta dunia dalam game dikemas kini kepada 9 dunia apabila Dunia 3 hampir siap.

## Perlu dikemas kini kemudian (bukan dalam perubahan dokumen ini)
- `src/v14/menu/progress.js` `WORLDS`: Dunia 3 "Kilang & Lombong" topik menjadi Sistem Persamaan +
  Pengaturcaraan Linear; Dunia 4 "Tanah Tinggi Ladang" menjadi Indeks, Surd & Logaritma + Janjang;
  Dunia 5–9 belum ada dalam peta; `assets/world-map/world-map.png` hanya ada zon untuk 4 dunia.
- `denai/hub/js/data.js`: sejak Fasa 4 Dunia 2 ada `GAME_W2` dan `GAMES`; untuk dunia gabungan, satu
  objek game perlu menyokong beberapa bab (`chapter` → senarai bab).
- Tab Game Hub: notis "Bab X belum mempunyai misi game" patut menyebut dunia yang akan meliputi bab itu.
- Laman `/denai/`: bahagian Dunia 2 dikemas kini (Dunia 2 lengkap). Apabila Dunia 3 dibina, tambah bahagian baharu.
- Dokumen lain yang masih menyebut struktur lama: `WORLD-MAP-MASTERPLAN.md` (cawangan
  `claude/denai-map-masterplan-v2`), `denai/hub/PRODUCT-BLUEPRINT.md` dan `PRODUCT-ROADMAP.md` (Dunia 3–4).

## Rujukan susun atur (lima imej peta daripada pemilik)
Tafsiran (belum disahkan pemilik): kawasan gelap = pepejal, titik = letak objek/koleksi. Rujukan *rasa*
peta, bukan disalin: (1) gua berongga dengan pulau batu → Dunia 6; (2) laluan mendatar berbukit dengan
platform terapung → Dunia 1, 2; (3) bilik dan koridor padat → Dunia 3; (4) aci menegak berliku → bahagian
menegak Dunia 3 dan 2-2; (5) pulau terapung dengan lengkung lompatan → Dunia 2.

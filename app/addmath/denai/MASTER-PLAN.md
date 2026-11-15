# DENAI — Pelan Induk Dunia & Level

Disimpan 15 Nov 2026 daripada pelan pemilik, dengan semakan terhadap kod
semasa (`main` @ 9cf38f9) dan DSKP Matematik Tambahan KSSM. Dokumen ini ialah
hala tuju, bukan janji: setiap World hanya direka terperinci apabila tiba gilirannya.

## Konsep
- **DENAI = game pengembaraan Add Maths** (platformer 2D).
- 1 bab Add Maths = 1 World; 1 World = 2–4 level (lalai: 3); 1 level = 1 peta + beberapa aplikasi matematik.
- **Matematik mesti mengubah dunia**, bukan sekadar menjawab kuiz.
- Gelung: teroka → faham mekanik → guna matematik → dunia berubah → teruskan.
- Solo dahulu; co-op kemudian.

## Status sebenar (disemak dalam kod)
| World 1 — Taman Fungsi | ID | Status |
|---|---|---|
| 1-1 Jejak Taman Fungsi (fungsi: cari input, corak, petua) | `w1-l1` | boleh dimain |
| 1-2 Jambatan Berkembar (fungsi gubahan fg, gf) | `w1-l2` | boleh dimain |
| 1-3 Gerbang Songsang (fungsi songsang) | `w1-l3` | boleh dimain |

Sumber: `src/v14/levels/registry.js`, `LEVEL-1-2.md`,
`audits/denai-levels-1-3-review/gameplay-v2-completion.md`. Pilihan level,
simpan/sambung dan main semula sudah wujud, termasuk dialog "Peta Dunia" yang
menyenaraikan level Dunia 1. Yang belum: pemilihan merentas beberapa World, dan
World 2 ke atas.

Had yang direkod dalam audit (belum selesai): tiada ujian laluan penuh di
telefon, tiada ujian pelayar lain / teknologi bantuan, teka-teki tetap L2 boleh
dihafal, tiada kajian pembelajaran dengan murid sebenar.

## Senarai World
| # | World | Bab DSKP | Tema | Aset utama | Level cadangan | Aplikasi matematik | Keutamaan |
|---|---|---|---|---|---|---|---|
| 1 | Taman Fungsi | T4 Bab 1 Fungsi | taman, sungai, jambatan, mesin ringan | Kenney base | 1-1, 1-2, 1-3 (siap) | fungsi tentukan papan; gubahan dua mesin; songsang pulihkan input | **siap, kemas kini** |
| 2 | Lembah Parabola | T4 Bab 2 Fungsi Kuadratik | bukit, lembah, tebing, trajektori | base | 2-1 Jejak Lengkung, 2-2 Lembah Puncak, 2-3 Gerbang Parabola | laras a/h/k untuk bentuk laluan; bucu = titik tertinggi; punca = tempat mendarat; pembezalayan = sampai / sentuh / tak sampai | **seterusnya** |
| 3 | Kilang Persamaan | T4 Bab 3 Sistem Persamaan | kilang, paip, pintu keselamatan | industrial | 3-1 Pintu Berkunci, 3-2 Teras Kuasa, 3-3 Loji Persamaan | cari nilai yang memenuhi semua syarat serentak untuk hidupkan sistem | tinggi |
| 4 | Ladang Indeks & Surd | T4 Bab 4 (4.1, 4.2) | ladang, rumah hijau, pengairan | farm + base | 4-1 Kebun Akar, 4-2 Rumah Hijau Surd, 4-3 Ladang Indeks | pertumbuhan berganda, skala hasil | sederhana |
| 5 | Bukit Logaritma | T4 Bab 4 (4.3, 4.4) | bukit, gua, balai cerap, menara | base + teknikal ringan | 5-1 Lorong Gema, 5-2 Menara Log, 5-3 Gerbang Skala | log sebagai "kuasa berapa?"; skala bunyi/cahaya | kemudian |
| 6 | Gua Vektor | T4 Bab 8 Vektor | gua, runtuhan batu | base + gua | 6-1 Jejak Arah, 6-2 Daya Bergabung, 6-3 Kuil Vektor | gabung dua vektor untuk gerakkan objek | kemudian |
| 7 | Dunia Ais Trigonometri | T4 Bab 9 Penyelesaian Segi Tiga (elektif) atau T5 Bab 6 | ais, cerun, gunung | base (palet ais) | 7-1 Cerun Sejuk, 7-2 Menara Sudut, 7-3 Kuil Trigonometri | sudut, tinggi, jarak daripada segi tiga | kemudian; perlu gaya visual khas |
| 8 | Bandar Kinematik | T5 Bab 8 Kinematik Gerakan Linear (elektif) | bandar ujian, trek, lif | industrial | 8-1 Trek Masa, 8-2 Stesen Laju, 8-3 Bandar Kinematik | sesaran, halaju, pecutan | kemudian |

### Perkara yang perlu diputuskan (semakan DSKP)
1. **World 3:** DSKP Bab 3 ialah (a) sistem linear **tiga** pemboleh ubah dan
   (b) satu linear + satu **tak linear**. "Dua pemboleh ubah, dua syarat" ialah
   Tingkatan 3. Cadangan: 3-1 dua syarat sebagai pemanasan, 3-2 tiga pemboleh
   ubah (tiga injap/tuil), 3-3 garis memotong lengkung (linear + tak linear).
2. **World 8:** Kinematik T5 berasaskan **pembezaan dan pengamiran**
   (v = ds/dt, a = dv/dt), bukan sekadar laju = jarak ÷ masa. Sama ada World
   ini datang selepas World kalkulus, atau ditakrif semula.
3. **World 7:** tentukan bab: Penyelesaian Segi Tiga (petua sinus/kosinus,
   sesuai dengan "tinggi dan jarak") atau Fungsi Trigonometri T5 (graf, identiti).
4. **Bab tanpa World setakat ini:** T4 Janjang, Hukum Linear, Geometri
   Koordinat, Nombor Indeks; T5 Sukatan Membulat, Pembezaan, Pengamiran, Pilih
   Atur & Gabungan, Taburan Kebarangkalian, Pengaturcaraan Linear. "1 bab = 1
   World" bermaksud 18 World; lapan di atas ialah gelombang pertama.

## Formula reka bentuk
**Setiap World (3 level):** L1 perkenalkan konsep + dunia → L2 aplikasi lebih
mencabar → L3 gabungan / kemuncak + penutup.

**Setiap level:** kawasan intro → penerokaan → mekanisme matematik →
aplikasi (matematik mengubah dunia) → penamat + bayangan level seterusnya.

**Peraturan peta**
- Jangan terlalu banyak tanah rata; jangan ulang corak tangga/platform.
- Setiap struktur ada sebab; setiap dek ada sokongan.
- Laluan utama jelas; laluan rahsia pilihan.
- Setiap kawasan ada mercu tanda.
- Teka-teki mengubah dunia; elakkan "buka panel, jawab, selesai".
- Pemain bereksperimen dan melihat kesannya; jawapan salah ialah pemerhatian, bukan hukuman.

## Aset
| Pek | Lokasi | Lesen | Nota |
|---|---|---|---|
| Kenney Pixel Platformer (asas) | `assets/kenney-pixel-platformer/` | CC0 | sedang digunakan |
| Industrial Expansion 1.0 | `assets/kenney-pixel-platformer-industrial/` | CC0 | 112 jubin 18 px; World 3, 8. Belum dirujuk oleh kod |
| Farm Expansion | `assets/kenney-pixel-platformer-farm/` | CC0 | 112 jubin 18 px; World 4. Belum dirujuk oleh kod |
| Chill Boy (Segel2D, versi percuma) | `assets/chill-boy/` | lihat SOURCE-README | watak pemain |

Ketiga-tiga pek Kenney guna grid 18 px (dipapar 3×), jadi boleh dicampur dalam
satu peta. Tiada pek untuk ais atau gua: World 6 dan 7 perlukan palet/jubin
tersuai.

## Rujukan susun atur (lima imej peta daripada pemilik)
Tafsiran saya (belum disahkan pemilik): kawasan gelap = pepejal, titik = letak
objek/musuh/koleksi. Bentuk yang boleh dijadikan rujukan *rasa* peta, bukan disalin:
1. gua berongga dengan pulau batu → Gua Vektor;
2. laluan mendatar berbukit dengan platform terapung → Taman / Lembah;
3. bilik dan koridor padat → Kilang Persamaan;
4. aci menegak berliku → Menara Log / bahagian menegak kilang;
5. pulau terapung dengan lengkung lompatan → Lembah Parabola (trajektori).

## Peta jalan
1. **World 1:** kemas kini berdasarkan had audit (ujian telefon penuh, kebolehcapaian), luaskan dialog "Peta Dunia" sedia ada kepada kad World (lakaran kecil, status tersedia / akan datang, klik masuk).
2. **World 2:** blueprint 2-1 … 2-3 dan mekanik kuadratik, sebelum sebarang kod.
3. **World 3:** integrasi pek industrial; sistem persamaan sebagai teka-teki dunia.
4. World lain satu demi satu, ikut apa yang benar-benar menyeronokkan.

Peta dunia versi cantik (satu peta besar, setiap World satu zon/pulau) dibuat kemudian.

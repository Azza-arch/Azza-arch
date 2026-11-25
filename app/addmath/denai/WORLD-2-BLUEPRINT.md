# World 2 — Lembah Batu Kapur: blueprint

> **Keputusan pemilik dan status (25 Nov 2026)** — mengatasi teks di bawah jika bercanggah.
> - **Nama:** *Lembah Batu Kapur* (nama yang sudah live dalam game, Hub dan laman DENAI). "Lembah Parabola" dalam dokumen lama ialah nama kerja.
> - **Latar:** guna set latar hijau Kenney sedia ada + blok batu Kenney di latar depan. Tiada seni karst baharu; tiada redesign Chill Boy atau aset stabil.
> - **Pek farm/industrial (Kenney CC0):** dibawa masuk hanya apabila 2-2 (pagar) dan 2-3 (rantai) dibina.
> - Keputusan 16 Nov kekal: dibuka selepas 1-1; 1 unit matematik = 1 jubin; set cabaran tetap dahulu.
> - **Batu loncatan: satu pada setiap x integer, bukan setiap ½ unit** (hirisan Stesen A membuktikan ½ unit membenarkan jawapan salah). Setiap stesen mesti disahkan dengan sampul lompatan sebenar (`analyse` dalam `quadratic.js`): jawapan betul boleh dilalui, setiap jawapan salah gagal secara fizikal.
> - **Fasa 2 (25 Nov): Stesen B dan C direka semula dengan bukti** — lihat §4a. B kekal dua tuil (h, k) di bawah bumbung batu kapur; C hanya tuil k (a, h tetap) dengan gerbang batu di tengah.
> - **Status:** Fasa 1 siap — `quadratic.js`, ujian unit dan bilik ujian Stesen A (`lab-w2.html`, noindex, tiada pautan menu) ada di `main`. Kod World 1, simpanan dan papan pendahulu tidak disentuh. Fasa 2 siap (§4a). Seterusnya: Fasa 3 (peta penuh 2-1 sebagai scene `w2-l1`, masih melalui URL pratonton).


Ditulis 15 Nov 2026. Ini pelan reka bentuk untuk dipersetujui pemilik sebelum
sebarang pelaksanaan. Bab: **T4 Bab 2 Fungsi Kuadratik** (DSKP SK 2.1–2.3).
Mengikut `MASTER-PLAN.md`: matematik mesti mengubah dunia; tiada modal kuiz.

## 1. Idea teras
Di Lembah Parabola, **lengkung ialah bahan binaan**. Pemain mengawal mesin
"Pancur Lengkung" yang memancarkan air/cahaya mengikut satu fungsi kuadratik.
Lengkung itu dilukis secara langsung di dunia semasa pemain mengubah tuil, dan
apabila dikunci ia menjadi **batu loncatan pepejal** di sepanjang parabola.

Tiga soalan yang pemain belajar tanya, satu bagi setiap level:
| Level | Soalan pemain | Konsep |
|---|---|---|
| 2-1 Jejak Lengkung | "Bagaimana saya ubah bentuk dan kedudukan lengkung?" | kesan a, h, k; bentuk verteks |
| 2-2 Lembah Puncak | "Di mana titik tertinggi/terendah?" | bucu, paksi simetri, penyempurnaan kuasa dua, maks/min |
| 2-3 Gerbang Parabola | "Di mana lengkung mencecah aras, dan berapa kali?" | punca, pembezalayan, ketaksamaan |

Cerita ringkas: selepas Gerbang Songsang, Chill Boy tiba di lembah yang
jambatannya bukan lurus tetapi melengkung. Penjaga lembah (suara papan tanda,
seperti World 1) meminta bantuan menghidupkan semula tiga pancur.

## 2. Kekangan enjin (disahkan daripada kod)
- Grid: jubin Kenney 18 px dipapar 3× = **54 unit**. Cadangan: **1 unit matematik = 1 jubin**.
- Pergerakan sedia ada: laju 280 unit/s, lompat 520, graviti 1400 →
  tinggi lompatan ≈ **1.79 jubin**, jangkauan mendatar ≈ **3.85 jubin**.
  Batu loncatan diletak pada setiap **½ unit x** di sepanjang lengkung, dan
  hanya di antara cincin sasaran. Dengan itu kenaikan terbesar antara dua batu
  berturutan dalam stesen yang dirancang ialah 0.875 jubin (Stesen A, x = 1 ke
  1.5), jauh di bawah had lompatan. Had reka bentuk: ≤ 1.25 jubin menegak.
- Semua nilai teka-teki ialah integer atau separuh (tuil berlangkah), supaya
  setiap titik lengkung jatuh pada grid atau separuh grid.
- Guna semula: badan dan animasi pemain, kamera, dek sehala, tangga, input
  papan kekunci/sentuh, panel bukan modal di sisi (seperti L2), audio, kesan.

## 3. Mekanik bersama: Pancur Lengkung
- Tiga tuil fizikal di dunia (tekan E; butang yang sama di panel sentuh):
  **a** (bukaan: −2, −1, −½, ½, 1, 2), **h** (anjak mendatar), **k** (anjak menegak).
- Lengkung "hantu" dilukis serta-merta apabila tuil berubah; cincin sasaran
  menyala apabila lengkung melaluinya.
- Tuil **Kunci**: lengkung menjadi batu loncatan. Jika tidak melalui semua
  cincin, batu tetap terbina tetapi laluan tidak sampai: pemain *melihat*
  kenapa (terlalu rendah / terlalu sempit), buka kunci dan cuba lagi.
  Jawapan salah ialah pemerhatian, tiada nyawa hilang.
- Panel memaparkan persamaan semasa dalam bentuk yang sedang diajar dan jadual
  kecil nilai (x, y) bagi titik yang diserlahkan.

## 4. Level 2-1 — Jejak Lengkung
SP: 2.3.1 (kesan a, b, c pada bentuk), 2.3.4 (kesan a, h, k), pengenalan 2.3.3.
Peta ≈ 4,800 unit, empat bahagian:

1. **Rabung Masuk:** turun dari hutan World 1 ke lembah; bukit beralun (bukan
   tanah rata), satu pancur rosak sebagai mercu tanda; pemain nampak lengkung
   air semula jadi di latar.
2. **Stesen A, "Bukaan" (hanya a):** h = 3, k = 4 dikunci. Cincin di (1, 2)
   dan (5, 2). Jawapan: **a = −½** (y = −½(x − 3)² + 4). Dengan a = −1 lengkung
   jatuh ke (1, 0): terlalu sempit, batu tidak sampai ke cincin. Pemerhatian:
   |a| besar = sempit; a negatif = terbuka ke bawah.
3. **Stesen B, "Anjakan" (h, k; a = −1 dikunci):** cincin di (4, 3) dan
   (6, 3). Jawapan: **h = 5, k = 4**. Dengan h = 4, lengkung melalui (4, 4) dan
   (6, 0): pemain nampak seluruh lengkung teranjak. Pemerhatian: bucu = (h, k).
4. **Stesen C, "Jambatan Gantung" (a > 0):** kabel melendut mesti melepasi
   batu di (4, 0.5) dan menyambung tiang di (2, 3) dan (6, 3). Jawapan:
   **a = ½, h = 4, k = 1**. Pemerhatian: a positif = terbuka ke atas, ada
   titik minimum. Menyeberang jambatan gantung membawa ke pintu keluar.

Rahsia (pilihan): dua lengkung alternatif yang juga sah membawa ke pelantar
tinggi (contohnya di Stesen B, lengkung lain yang melalui cincin emas ketiga).
15 syiling diletak di sepanjang lengkung yang betul sebagai petunjuk halus.

## 4a. Fasa 2 — Stesen B dan C disahkan (25 Nov 2026)

**Masalah yang ditemui:** dengan susun atur §4, hampir semua jawapan salah boleh dilalui
(Stesen B: 25/25 gabungan h, k; Stesen C: 15/16). Sebab: lompatan pemain sangat murah hati
(puncak 1.71 jubin, larian ≈ 3.9 jubin), jadi satu batu di tengah kolam sudah cukup.

**Kaedah:** `analyseStation` dalam `src/v14/levels/w2/quadratic.js` (graf permukaan + simulasi
lompatan 60 Hz yang sama dengan Arcade Physics, termasuk kepala terhantuk bumbung) dan carian
menyeluruh atas susun atur. Syarat: jawapan betul boleh dilalui dengan lompatan 5 % lebih lemah;
setiap tetapan tuil lain gagal dengan lompatan 5 % lebih kuat; laluan betul tidak perlu panjat
> 1.5 jubin atau celah > 2 jubin. `tests/quadratic.test.mjs` menyemak semuanya.

**Stesen B "Anjakan"** (a = −1; tuil h ∈ {3…7}, k ∈ {1…5}; jawapan h = 5, k = 4):
kolam (air y = 2) dari x = 2.5 hingga 7.5 di bawah **bumbung batu kapur rendah** (bawah y = 4.5),
tebing y = 3, cincin (4, 3) dan (6, 3) pada aras tebing. Laluan: tebing → (4, 3) → (6, 3) → tebing
(celah 1 jubin, tiada panjatan). Bucu (5, 4) berada dalam batu (tiada ruang kepala): lukis lengkung
masuk ke dalam batu. Lengkung lebih tinggi tertanam dalam batu; lebih rendah tenggelam; teranjak
meninggalkan celah terlalu jauh untuk dilompat di bawah bumbung rendah. Ini sepadan dengan arah
visual ("kolam di bawah bumbung batu kapur").

**Stesen C "Jambatan Gantung"** (a = ½, h = 4 tetap; **tuil k sahaja** ∈ {0…4}; jawapan k = 1):
tiang kabel pepejal di x = 2 dan x = 6 (atas y = 2.5) dengan cincin sauh (2, 3) dan (6, 3);
tebing y = 1.5; air y = −0.5; **gerbang batu** di atas bahagian tengah (x 3.5–4.5, bawah y = 3.5).
k = 0: kabel terlalu rendah, tidak boleh panjat ke tiang jauh; k = 2: tiada ruang kepala di bawah
gerbang; k = 3, 4: batu tertanam dalam gerbang. **Perubahan daripada §4:** blueprint menggerakkan
a, h dan k di sini, tetapi carian tidak menemui sebarang susun atur dengan (a, k) bersama yang
mempunyai satu jawapan fizikal. Pelajaran C kini: k menaik/menurunkan seluruh lengkung
(SP 2.3.4), dengan a positif (terbuka ke atas, ada titik minimum).

**Faktor kegagalan** (`factors`, untuk mesej dalam permainan pada Fasa 3): `buried` (dalam batu),
`submerged` (tenggelam), `high` (di luar stesen), `roof` (bumbung/gerbang menghalang lompatan),
`climb` (panjatan melebihi lompatan), `gap` (celah terlalu jauh).

## 5. Level 2-2 — Lembah Puncak
SP: 2.3.3 (bentuk am ↔ verteks), 2.3.5 (ciri graf), 2.3.6 (maks/min).
Di sini mesin memberi persamaan dalam **bentuk am**; pemain mesti meramal bucu.

1. **Cerun Angin:** kawasan menegak pertama (tebing + tangga), mercu tanda
   Loceng Puncak yang tergantung tinggi.
2. **Stesen D, "Tangkap di Puncak":** pancur menembak mengikut
   y = −x² + 6x − 5. Pemain meletakkan **pelantar penangkap** (tuil x dan y)
   sebelum menembak. Bola hanya mendarat jika pelantar di bucu **(3, 4)**.
   Bantuan dalam dunia: papan tanda "paksi simetri x = −b/2a". Pelantar yang
   salah: bola melepasi atau jatuh pendek, jejaknya kekal kelihatan.
3. **Stesen E, "Loceng":** y = −2x² + 8x. Loceng di ketinggian 8. Pemain pilih
   kedudukan loceng mendatar: **x = 2** (bucu (2, 8)). Mengajar bahawa nilai
   maksimum ialah k dan berlaku pada x = h.
4. **Kandang Maksimum (aplikasi):** 12 unit pagar bergerak mengelilingi
   kandang segi empat tepat (empat sisi, jadi panjang + lebar = 6); lif hanya
   naik jika kandang memuatkan 9 peti.
   Luas x(6 − x) maksimum pada **x = 3, luas 9**. Pemain mengubah lebar x dan
   melihat bilangan peti yang muat berubah: naik, puncak, turun.

Stesen alternatif untuk main semula (variasi berbenih seperti L1):
y = −x² + 8x − 12 (bucu (4, 4)).

## 6. Level 2-3 — Gerbang Parabola
SP: 2.1.1 (menyelesaikan), 2.1.2 (bentuk persamaan daripada punca), 2.1.3
(ketaksamaan), 2.2.1–2.2.2 (jenis punca), 2.3.2 (kedudukan graf).

1. **Tebing Sungai:** sungai lebar; rantai besar tergantung melengkung di atasnya.
2. **Stesen F, "Dua Ponton":** rantai mengikut y = x² − 6x + 5 dan mencecah air
   (y = 0) di dua tempat. Pemain meletakkan dua ponton di punca **x = 1 dan
   x = 5**; rantai yang disokong menjadi jambatan.
3. **Stesen G, "Aras Rantai" (pembezalayan):** tuil c menaik/menurunkan
   rantai y = x² − 6x + c. Tiga tugasan, tiga keadaan dunia:
   - c = 8: dua titik cecah (x = 2, 4), pasang dua ponton;
   - **c = 9**: rantai tepat menyentuh air di x = 3 (b² − 4ac = 0), isi baldi;
   - c = 10: rantai tidak menyentuh air, bot boleh lalu di bawah.
   Panel menunjukkan b² − 4ac berubah bersama tuil (16, 4, 0, −4).
4. **Lorong Hujan Batu (ketaksamaan):** perisai lengkung y = x² − 6x + 5;
   kawasan selamat ialah di mana lengkung berada **di bawah** aras (f(x) < 0),
   iaitu 1 < x < 5. Pemain memilih julat berdiri sebelum hujan batu.
5. **Gerbang Parabola (kemuncak):** tiga meterai, satu bagi setiap level:
   Bentuk (bina lengkung melalui tiga cincin), Puncak (tangkap di bucu),
   Punca (bina persamaan daripada punca yang diberi, contohnya punca 2 dan 6
   → (x − 2)(x − 6)). Pintu terbuka ke bayangan World 3.

## 7. Pemetaan DSKP
| SP | Di mana |
|---|---|
| 2.1.1 menyelesaikan persamaan kuadratik | 2-3 F, G |
| 2.1.2 membentuk persamaan daripada punca | 2-3 Gerbang (meterai Punca) |
| 2.1.3 ketaksamaan kuadratik | 2-3 Lorong Hujan Batu |
| 2.2.1, 2.2.2 jenis punca, pembezalayan | 2-3 G |
| 2.3.1 kesan a, b, c | 2-1 A; 2-3 G (c) |
| 2.3.2 kedudukan graf dan jenis punca | 2-3 G |
| 2.3.3 bentuk am ↔ verteks | 2-2 D, E |
| 2.3.4 kesan a, h, k | 2-1 A, B, C |
| 2.3.5 melakar graf | lengkung hantu di semua stesen; 2-2 |
| 2.3.6 masalah maks/min | 2-2 Kandang Maksimum |

Nota jujur: game melatih intuisi dan ramalan; kemahiran menulis penyempurnaan
kuasa dua langkah demi langkah tetap perlu daripada nota (pautan ke nota Bab 2
dalam menu jeda).

## 8. Pelan teknikal (ikut corak World 1)
- `src/v14/levels/w2/quadratic.js`: modul tulen tanpa Phaser: nilai, bucu, punca,
  pembezalayan, "lengkung melalui cincin?", titik batu loncatan; boleh diuji
  dengan `node`.
- `quadratic-world.js` (data peta) dan `quadratic-scene.js` (persembahan) bagi
  setiap level; ID stabil `w2-l1`, `w2-l2`, `w2-l3` dalam `registry.js`.
- Simpanan: kunci baharu `denai-w2-campaign-v1`; tidak menulis ke kunci World 1
  atau papan pendahulu PlayFab.
- Ujian: unit bagi setiap stesen (jawapan betul, dua jawapan salah yang lazim,
  simpan/muat semula, main semula) dan ujian pelayar laluan penuh, termasuk telefon.
- Aset: pek asas mencukupi; tiada pek baharu diperlukan untuk World 2.

## 9. Keputusan yang diperlukan daripada pemilik
1. **Buka kunci World 2:** selepas tamat 1-3, atau terbuka kepada semua
   (murid yang sedang belajar Bab 2 boleh terus masuk)? Cadangan: terbuka
   selepas 1-1 sahaja.
2. **Skala:** 1 unit matematik = 1 jubin (cadangan), atau 2 jubin supaya
   lengkung lebih besar di skrin telefon?
3. **Variasi main semula:** set tetap dahulu (lebih cepat siap), atau terus
   berbenih seperti L1?

## 10. Urutan binaan yang dicadangkan
1. Hirisan menegak: **Stesen A sahaja** dalam bilik ujian (tuil a, lengkung
   hantu, kunci, batu loncatan, cincin). Uji rasa dahulu.
2. Jika seronok: lengkapkan 2-1 (peta, B, C, rahsia, simpanan, ujian).
3. 2-2, kemudian 2-3, satu level satu PR.

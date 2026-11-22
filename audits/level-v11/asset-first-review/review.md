# Audit aset dahulu, reka ruang kemudian

**Tiada perubahan kepada permainan V10. Tiada master map baharu dilukis pada peringkat ini.** Folder `level-v11` menandakan cadangan audit seterusnya sahaja, bukan versi playable baharu.

## 1. Katalog yang dikunci

Buka [katalog visual semua 180 frame](index.html). Setiap kad mempunyai nombor, sprite sebenar, kategori, fungsi cadangan dan amaran jika semantiknya belum disahkan. Semua frame juga tersedia sebagai [CSV](catalog-180.csv) dan [JSON](catalog-180.json).

- Sumber: Kenney Pixel Platformer 1.2, CC0, atlas sebenar 360×162, grid20×9, frame18×18.
- 180/180 potongan sepadan dengan PNG individu bagi alpha dan RGB yang kelihatan. RGB tersembunyi pada piksel transparent tidak dianggap kecacatan.
- [Manifest hash](asset-lock.json) mengunci semua fail pack; katalog ini tidak menukar aset asal.
- Kategori utama: 44 terrain, 34 interaksi, 3 collectible, 10 calon hazard/air, 89 hiasan termasuk label/UI. Kategori ialah **peranan perancangan**, bukan behavior native; air juga digunakan sebagai hiasan/isi mesin.
- Frame157 ialah titik kecil, bukan hub/gear yang telah disahkan. Frame145 mempunyai rupa nyalaan/makhluk yang belum jelas. Frame153–156 tidak dikunci sebagai awan. Nama fungsi rasmi tidak disertakan dalam atlas bernombor; katalog menggunakan label deskriptif, dengan ketidakpastian dinyatakan.

## 2. Hubungan aset dan aktiviti

[Matriks aset → gameplay](asset-gameplay.md) memisahkan sprite, contoh penggunaan, kod dan bajet ruang. Tiada sistem nyawa, kunci, musuh, api atau duri baharu dicadangkan. Gear B memerlukan keputusan visual; lebih baik pengangkat bertuil yang boleh dibaca daripada menggelar duri sebagai gear.

## 3. Cadangan 16 ruang gameplay

Semua ini **cadangan untuk disemak**, bukan geometri baharu yang sudah disahkan. A–G kekal zon besar; C optional. Setiap ruang ialah keputusan atau aktiviti, bukan satu skrin atau satu platform.

| # / zon | Ruang dan apa yang dilihat | Tindakan / pembelajaran | Perubahan & ganjaran | Laluan, kegagalan dan kembali | Masa sasaran |
|---|---|---|---|---|---|
| 01 A | Halaman selamat, penanda arah dan satu kenaikan rendah | Gerak, berhenti, lompat54px; belajar bahasa visual solid | Pemain mencapai pad pemerhatian | Main; tiada hazard; kembali berjalan | 20–35s |
| 02 A | Poket kotak luas, plet dan ledge yang kelihatan | Tolak dengan kontak; kaitkan tindakan dengan perubahan dunia | Plet membuka ledge; coin pilihan | Cabang atas pendek; reset kotak; jatuh ke halaman sama | 30–60s pilihan |
| 03 A | Gap tunggal, landing lebar dan bendera di seberang | Lompat dengan ruang takeoff; latihan sebelum naik ke mill | Checkpoint pertama | Main; gagal kembali checkpoint/spawn selamat; kotak tidak perlu | 15–30s |
| 04 B | Papan input/output sebelum tuil besar | Cuba domain {0,1,2,3}; satu input satu output | Nilai output berubah di papan | Main safe bay; semua percubaan sah; boleh terus ke05 | 30–45s |
| 05 B | Pengangkat bertuil dan lintasan tertutup, seberang sudah kelihatan | Gunakan f(3)=7; pengenalan gate matematik | Tuil/span berubah; checkpoint | Main; salah memaparkan f(3); tiada nyawa hilang | 40–60s |
| 06 C | Café atas, papan pasangan, ganjaran nampak dari B | Padankan semua input/output; bezakan julat dan kodomain | Nota/coin pilihan | Cabang atas dari B; tangga balik ke B; tidak membuka gate utama | 45–75s pilihan |
| 07 B→D | Teres peralihan dengan pandangan pertama rak blok D | Gunakan langkah/lompatan yang telah dikenali; jangka aktiviti seterusnya | Pandangan workshop terbuka | Main; bawah ialah recovery, bukan jalan pintas melangkaui gate | 15–25s |
| 08 D | Rak2/3/4, housing mesin, output10 | Pilih input bagi g(x)=3x−2; pembangunan idea fungsi | Blok bergerak masuk; output; lintasan terbuka | Main; blok salah kembali ke rak; ruang cuba semula | 45–75s |
| 09 D | Nota terlihat pada ledge servis atas | Pilih detour untuk contoh hubungan input/output | Nota dan coin pilihan | Cabang atas; tangga balik selepas mesin D; tidak mengunci perjalanan | 25–45s pilihan |
| 10 D→E | Dua tahap paip pada lantai selamat | Input2: banding f→g dengan g→f; pengenalan komposisi | Readout13 berbanding9 dan laluan aliran | Main bay tanpa gate; salah urutan ialah eksperimen | 40–60s |
| 11 E | Roof route di atas shelf pemulihan dan tangga jelas | Gabung ladder dan gap sederhana; baca laluan atas/bawah | Capai stesen air; coin atas pilihan | Main atas, recovery bawah; jatuh kembali melalui tangga | 25–45s |
| 12 E | Reservoir, dua tahap fungsi, sasaran19 | Input3, tentukan urutan; pembangunan/twist komposisi | Aliran3→7→19 membuka span; reverse menghasilkan15 | Main; salah kekal selamat; checkpoint dekat stesen | 45–75s |
| 13 F | Puncak kecil, bukit menurun, tanda gua dan sungai di hadapan | Pace break dengan keputusan meneruskan atau meneroka | Landmark sungai mula kelihatan; checkpoint | Main bersambung; turun terkawal; optional cave berasingan | 20–35s |
| 14 F | Alcove gua terbuka, output7 dan permata | Inverse mencari input3; bezakan inverse daripada reciprocal | Papan7→3, discovery pilihan | Cabang bawah; tangga keluar sentiasa tersedia walaupun belum jawab | 40–65s pilihan |
| 15 G | Tebing selamat, dua latch, sungai dan rumah di seberang | h(x)=17 →5, kemudian komposisi2→5→13; resolution | Dua latch disimpan; jambatan sebenar bergerak ke posisi selamat | Main; salah tanpa penalti; jatuh kembali bank; reload tidak memberi latch percuma | 60–90s |
| 16 G | Landing luas, pintu destinasi dan ringkasan discovery | Lintas hasil kerja sendiri; refleksi konsep ringkas | Completion dan save | Main tamat; tiada ujian mendadak baharu | 15–25s |

Masa ini sasaran reka bentuk: main route kira-kira6–10 minit, semua detour menambah2–4 minit. Perlu playtest pembaca sebenar; bukan diturunkan daripada bot traversal laju.

Urutan topologi cadangan: **01→03→04→05→07→08→10→11→12→13→15→16**. Detour **02** dari01 kembali sebelum03; **06** dariB kembali keB; **09** dariD kembali sebelum10; **14** dari13 kembali sebelum15. Main spine tidak bergantung pada ganjaran pilihan.

Empat langkah perkembangan digunakan pada keluarga idea fungsi: pengenalan04/05, pembangunan08, twist urutan10/12, resolution15. Inverse14 ialah peluasan pilihan, bukan syarat memahami finale. Gerakan diperkenalkan01/03, diperkembangkan07/11 dan dipakai dalam perjalanan akhir; tiada lompatan sukar baharu di pintu tamat.

## 4. Sebelum melukis master map teknikal

Semakan yang diperlukan sekarang ialah **susunan aktiviti 16 ruang** dan **identiti pengangkat B**. Ini checkpoint reka bentuk yang anda minta: “Selepas kita puas hati dengan susunan aktiviti, baru buat peta.” Bukan permintaan izin untuk menulis kod.

Selepas susunan dipersetujui, peta seterusnya akan:

1. Membahagikan kira-kira8400px mengikut bajet aktiviti, bukan memaksa semua ruang sama panjang. C berkongsi julat x B; detour atas/bawah tidak menambah koridor panjang.
2. Menentukan koordinat setiap solid, one-way, gap, tangga, input pad, recovery dan checkpoint; bezakan nilai calon daripada yang diuji.
3. Menggunakan fizik sebenar: v280, acceleration2100, braking2500, jump520, g1400, climb150, badan28×60. Apex ideal96.6px dan reach ideal208px **bukan** had reka bentuk yang selamat dari rest. Rise awal54px; gap108px ialah calon konservatif, tetap memerlukan traversal.
4. Memastikan headroom, landing, pandangan kamera dan tangga bebas halangan; tangga untuk kenaikan tinggi, bukan memaksa jump melebihi envelope.
5. Membina komposisi daripada frame yang disahkan; render berasingan bagi collision dan dekorasi. Jangan meniru rumah/gear/arch dalam ilustrasi jika komponennya tiada.
6. Menyertakan jadual migrasi checkpoint/save dan pelan ujian natural-input sebelum implementasi. Tiada perubahan kepada runtime, fizik atau save untuk fasa audit ini.

Rujukan V10.1 tetap digunakan untuk identiti zon dan hubungan laluan. Ia tidak dianggap spesifikasi sprite atau bukti geometri boleh dimainkan.

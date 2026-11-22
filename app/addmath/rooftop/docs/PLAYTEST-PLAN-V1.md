# Pelan Playtest Level 1 — draf V1.0

[Kembali ke LDD](LEVEL-DESIGN-V1.md). **Belum dijalankan.** Rekod browser prototaip sedia ada bukan keputusan kajian pelajar.

## Tujuan dan peserta

Uji sama ada pelajar boleh membaca laluan, memahami hubungan input/output, menggunakan hint dan menerangkan sebab perubahan dunia. Sasaran awal 5–8 pelajar Tingkatan 4 dengan pengalaman Add Math dan game yang berbeza. Saiz ini untuk mencari masalah usability dan pembelajaran awal, bukan membuat kesimpulan keberkesanan umum.

Guru menyemak soalan dan bahasa sebelum sesi. Gunakan ID peserta ringkas, bukan nama dalam game. Terangkan bahawa game sedang diuji, bukan kebolehan pelajar dinilai untuk markah sekolah. Ikut aturan sekolah bagi persetujuan penyertaan/rakaman jika diperlukan.

## Sebelum sesi pelajar: acceptance teknikal

| Pemeriksaan | Bukti yang diperlukan |
| --- | --- |
| Baseline | Keyboard run/jump, arah sprite, buffer, coyote, tangga naik/turun/lompat keluar dan kamera tidak rosak selepas refactor |
| Geometri | Playthrough semua kawasan dengan input sebenar, bukan teleport; pendaratan terlihat sebelum J1 |
| Bypass | Cuba melompat G1, naik tanpa M2, lalu bawah/atas G3 dan masuk goal sebelum mesin selesai; semua laluan tidak sah gagal dengan selamat |
| Mesin | Tiga set item berasingan; jawapan salah/kosong tidak membuka mekanisme; formula pada sprite, panel dan penunjuk konsisten |
| Matematik | Semua item/varian disemak; tanda negatif dan pembahagian sifar betul; Q07 tidak mengeluarkan Infinity/NaN |
| Input | Terima nombor setara dan tanda negatif; Enter tidak menghantar dua kali; key game tidak bergerak ketika input teks |
| Hint | H1–H3 sukarela; rekod pendedahan jawapan; pengukuhan tidak mencetuskan gelung tanpa akhir |
| Checkpoint | T1 tidak membuka mesin; CP1/2/3 selepas set selesai; jatuh/R tidak memadam progress |
| Reload | Uji selepas jawapan, selepas hint, semasa processing/reveal dan selepas goal; tiada mekanisme berulang atau state separuh terbuka |
| Storage | Disabled/quota/JSON rosak/versi lama; masih boleh bermain, notis jelas; `addmath-progress-v1` nota tidak berubah |
| UI | 1366×768 dan 1280×720; zoom teks, tab/fokus, Esc, reduced motion; tiada panel menutup input atau laluan secara tidak sengaja |
| Assets/audio | Tiada 404/console error dalam run normal; kegagalan aset jelas; mute kekal jika audio ada; audio gagal tidak menyekat puzzle |
| Regresi nota | MULA, peta Tingkatan 4, nota/latihan dan progress lama kekal boleh digunakan |

Jalankan juga satu sesi manual lengkap: rasa lompatan, keterbacaan objek boleh pijak, kedudukan kamera semasa turun tangga dan perkaitan jawapan dengan perubahan dunia tidak boleh disahkan oleh formula sahaja.

## Protokol sesi, sekitar 20–25 minit

1. **2–3 minit:** soalan awal tanpa hint atau pembetulan segera.
2. **8–12 minit sasaran:** beri arahan pendek “Cari jalan ke Menara Fungsi. Kamu boleh guna bantuan dalam game.” Jangan terangkan jawapan atau semua kawalan terlebih dahulu. Benarkan selesai lebih cepat/lambat; rekod masa sebenar.
3. **2–3 minit:** soalan pasca dengan nombor berlainan, tanpa game/hint.
4. **3–5 minit:** minta pemain terangkan satu input/output, satu jawapan salah yang membantu dan satu bahagian yang mengelirukan.

Jika peserta berhenti lebih kurang 60 saat tanpa tahu tindakan seterusnya, tanya neutral “Apa yang kamu sedang cuba buat?” Jika perlu beri arahan, rekod masa dan bantuan tersebut. Jangan mengira bantuan fasilitator sebagai permainan kendiri. Untuk sesi memerhati pacing, kurangkan soalan think-aloud berterusan kerana ia sendiri memanjangkan masa.

## Borang awal dan pasca yang dicadangkan

| Konsep | Borang A | Jawapan | Borang B | Jawapan |
| --- | --- | --- | --- | --- |
| Imej dengan input negatif | `f(x)=3x+1`, cari `f(−2)`; tunjuk langkah | −5 | `g(x)=2x−3`, cari `g(−2)`; tunjuk langkah | −7 |
| Objek daripada imej | `f(x)=2x+5`, `f(x)=15`; cari x | 5 | `g(x)=3x+2`, `g(x)=14`; cari x | 4 |
| Input terlarang | `f(x)=1/(x−4)`, input manakah dilarang, dan mengapa? | 4; penyebut sifar | `g(x)=1/(x+2)`, input manakah dilarang, dan mengapa? | −2; penyebut sifar |

Separuh peserta boleh menerima A sebelum/B selepas, separuh B sebelum/A selepas untuk mengurangkan bias susunan. Kesetaraan kesukaran kedua-dua borang belum dibuktikan; guru perlu menyemaknya. Jangan mengajar jawapan borang awal sebelum bermain.

Rubrik eksploratori bagi setiap item: 0 = belum menunjukkan kaedah berkaitan; 1 = jawapan betul tanpa penjelasan yang cukup, atau kaedah munasabah dengan silap aritmetik; 2 = jawapan dan alasan/langkah betul. Catat jawapan sebenar bersama skor supaya maklumat tidak hilang. Ini bukan rubrik TP rasmi.

## Pemerhatian yang perlu direkod

| Ukuran | Definisi operasional |
| --- | --- |
| Gerak pertama | Masa dari kawalan tersedia hingga bergerak sengaja |
| Tangga pertama | Dapat naik/keluar sendiri atau memerlukan arahan; catat prompt yang kelihatan |
| J1 | Cubaan, jatuh, titik take-off, sama ada pendaratan kelihatan; jangan hanya kira gagal |
| Membaca dunia | Objek yang disangka platform/tangga tetapi bukan; masa tersesat |
| Pemahaman mesin | Boleh menunjuk input, peraturan, output dan laluan yang mesin kawal |
| Item | Cubaan numerik, jawapan, hint tertinggi, pendedahan jawapan dan bantuan fasilitator |
| Salah yang produktif | Pemain boleh menerangkan apa yang berubah antara cubaan, bukan hanya terus meneka |
| Masa aktif | Traversal/penerokaan, puzzle, feedback; jangan kira dua kategori serentak |
| Frustrasi | Berhenti, meminta bantuan, input berulang tanpa perubahan strategi; catat konteks |
| Transfer | Langkah dan alasan pada pascaujian dengan nombor berlainan |

Anggap animasi pemprosesan sebagai masa feedback, memikirkan jawapan sebagai puzzle dan meninjau laluan sebagai penerokaan. Demo/teroka input masih aktiviti matematik; jangan mengklasifikasikannya sebagai berjalan untuk memenuhi nisbah 35%.

## Ambang keputusan awal, bukan hasil kajian

- Tiada softlock, kehilangan progress atau pembukaan laluan daripada jawapan salah.
- Sasaran sekurang-kurangnya 80% peserta dapat mencapai M1 tanpa arahan kawalan daripada fasilitator; laporkan bilangannya juga, contohnya 4/5, bukan peratus sahaja.
- Sasaran median cubaan J1 tidak melebihi 2. Jika peserta tersalah baca platform, ubah affordance/kamera dahulu sebelum menyalahkan kemahiran melompat.
- Perhatikan sama ada majoriti dapat menerangkan input → peraturan → output selepas bermain. Jawapan hafalan sahaja tidak mencukupi.
- Tinjau masa median dan julat, serta masa bagi setiap kawasan. Jika ramai selesai di bawah 8 minit dengan kefahaman baik, jangan tambah berjalan tanpa tujuan.
- Jika ramai menggunakan H3 tetapi gagal item pengukuhan/pasca, reka semula demo atau feedback sebelum menambah soalan.
- Perbezaan kecil skor awal/pasca tanpa kumpulan perbandingan, sampel besar atau penilaian tertunda bukan bukti kausal keberkesanan game.

## Bentuk laporan selepas sesi

Laporkan versi build, peserta n, peranti, masalah traversal, bantuan fasilitator, tahap hint, masa sebenar, contoh penjelasan pelajar serta had pemerhatian. Asingkan bug, masalah keterbacaan level dan masalah konsep matematik. Tentukan maksimum tiga perubahan utama untuk iterasi seterusnya, kemudian uji semula bahagian yang berubah.

Keputusan akhir: **baiki Level 1 dahulu**, atau **cukup stabil untuk pilot seterusnya**. Jangan menjadikan skor ringkas sebagai alasan terus membina Level 2–4 sebelum masalah asas selesai.

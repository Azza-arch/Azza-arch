# Bank Interaksi Level 1 — draf V1.0

[Kembali ke LDD](LEVEL-DESIGN-V1.md). Semua kandungan berikut ialah cadangan, belum dimasukkan ke game. Jawapan aritmetik disemak; kesesuaian bahasa dan scaffolding masih memerlukan semakan guru serta playtest.

## Agihan dan semakan ringkas

| ID | Mesin / mod | Soalan utama | Jawapan | Bukti pengiraan |
| --- | --- | --- | --- | --- |
| Q01 | M1 / demo dan teroka | `f(x)=2x+1`, masukkan 3 | 7 | `3×2=6; 6+1=7` |
| Q02 | M1 / imej berpandu | `f(x)=x+4`, cari `f(5)` | 9 | `5+4=9` |
| Q03 | M1 / imej kendiri | `f(x)=3x−2`, cari `f(4)` | 10 | `3×4−2=12−2=10` |
| Q04 | M2 / cari objek | `f(x)=2x+3`, output 11 | 4 | `2x+3=11; 2x=8; x=4` |
| Q05 | M2 / cari imej, cadangan diubah | `f(x)=3x−2`, cari `f(6)` | 16 | `3×6−2=18−2=16` |
| Q06 | M2 / input negatif | `f(x)=2x−1`, cari `f(−2)` | −5 | `2(−2)−1=−4−1=−5` |
| Q07 | M3 / input terlarang | `f(x)=1/(x−2)`, input manakah tidak dibenarkan? | 2 | `2−2=0`; pembahagian dengan sifar tidak tertakrif |
| Q08 | M3 / cari objek kendiri | `f(x)=4x−3`, output 17 | 5 | `4x−3=17; 4x=20; x=5` |

Q05 asal pengguna ialah mencari input bagi `3x−2=10`, jawapan 4. Ia betul, tetapi mengulangi pasangan Q03 dan menjadikan M2 “input, input, output negatif”. Draf ini sengaja menukarnya untuk memenuhi agihan “input, output, negatif”. Q07 sengaja menggunakan istilah “input terlarang”, bukan “pilih input yang sah”.

## Q01 — Lihat satu input diproses

**Paparan:** “Input ialah nombor yang masuk. Peraturan mesin menentukan outputnya.” Paparkan `f(3)` sebagai imej bagi objek 3, bukan `f × 3`.

**Interaksi:** selepas pemain memasuki M1, demo ringkas berjalan sekali: input 3 → darab 2 → 6 → tambah 1 → output 7. “Ulang” dan “Teruskan” tersedia. Dalam Teroka, ± pada input atau input nombor membolehkan cuba 0, 1 dan 3; nilai tersebut menghasilkan 1, 3 dan 7. Mengulangi 3 mesti tetap menghasilkan 7.

**Kesan dunia:** penunjuk output mesin bergerak kepada nilai; bridge kekal tersimpan kerana mesin belum selesai dikalibrasi. Jangan mendakwa hanya satu input boleh menghasilkan sesuatu output dalam semua fungsi.

Tiada salah/betul atau hint H1–H3 bagi demo. Demonstrasi dilihat direkod secara berasingan daripada soalan dijawab. Jangan mewajibkan beberapa cubaan sandbox atau masa minimum untuk meneruskan.

## Q02 — Cari imej, dengan panduan

**Prompt:** “Mesin menggunakan `f(x)=x+4`. Jika input ialah 5, apakah output `f(5)`?” Input 5 dikunci; pemain mengisi slot Output/Ramalan.

**H1:** “Gantikan x dengan input yang diberi.”
**H2:** “`f(5)=5+4`. Selesaikan operasi tambah itu.”
**H3:** “`5+4=9`, jadi imej bagi objek 5 ialah 9.”

**Salah:** “Input kekal 5. Peraturan mesin menambah 4 kepada input itu. Cuba semula.” Jangan melabel ramalan salah sebagai output sebenar. Jika panduan sudah menunjukkan 9, rekod penyelesaian sebagai dibantu.

**Betul:** aliran nombor menunjukkan `5 → +4 → 9`, satu status kalibrasi tambahan aktif. Laluan belum dibuka.

**Salah faham untuk diperhatikan:** menyalin input 5 sebagai jawapan; menganggap `f(5)` bermaksud darab f dengan 5.

## Q03 — Ramalan imej kendiri

**Prompt:** “Peraturan baharu: `f(x)=3x−2`. Ramalkan output apabila input ialah 4.” Tiada langkah penyelesaian automatik sebelum cubaan.

**H1:** “Lakukan darab dahulu, kemudian tolak.”
**H2:** “Gantikan x: `f(4)=3(4)−2`.”
**H3:** “`3×4=12`, kemudian `12−2=10`. Output ialah 10.”

**Salah:** “Semak urutan operasi pada peraturan. Nilai ramalan itu belum sepadan.” Jika jawapan ialah 6, boleh bertanya “Adakah kamu menolak 2 sebelum mendarab?”, tanpa mendakwa telah mengetahui cara fikir pemain.

**Betul:** tunjuk aliran `4 → ×3 → 12 → −2 → 10`, tandakan M1 siap, buka G1 dan simpan CP1. Mesin dunia menunjukkan formula/output terkini, bukan imej lama 3→7.

Jika pemain melihat jawapan penuh sebelum menghantar semula, ia bukan bukti kendiri. Keadaan itu tidak menghalang laluan; tawarkan pengukuhan imej.

## Q04 — Cari objek daripada imej

**Prompt:** “Mesin menggunakan `f(x)=2x+3`. Pengunci memerlukan output 11. Apakah input x?” Slot Output/Sasaran 11 dikunci; pemain mengubah slot Input.

**H1:** “Cari nombor yang menghasilkan 11 selepas didarab 2 dan ditambah 3.”
**H2:** “Tulis `2x+3=11`. Tolak 3 daripada kedua-dua belah.”
**H3:** “`2x=8`, maka `x=4`. Semak: `2(4)+3=11`.”

**Salah, contoh input 3:** “`f(3)=9`. Pengunci memerlukan 11.” Penunjuk bergerak ke 9 tetapi pengunci tidak terbuka. Jika pemain memasukkan 11, jelaskan bahawa 11 ialah output sasaran dan tunjuk hasil cubaan itu, `f(11)=25`.

**Betul:** satu pengunci M2 dilepaskan, tetapi tangga kekal tersimpan sehingga Q05/Q06 selesai. Jangan memperkenalkan tatatanda `f⁻¹` atau mengajar fungsi songsang dalam item ini.

## Q05 — Gunakan arah pemetaan yang berbeza

**Prompt:** “Sekarang input diberi: `f(x)=3x−2`. Cari imej bagi objek 6.” Slot input 6 dikunci; output kosong. Penggunaan label/slot yang sama menjelaskan arah soalan, bukannya menjadikan semua nombor sebagai nilai untuk dicuba.

**H1:** “Objek ialah input; imej ialah output.”
**H2:** “Kira `f(6)=3(6)−2`.”
**H3:** “`18−2=16`. Imej bagi objek 6 ialah 16.”

**Salah:** “Soalan ini memberikan input, bukan output sasaran. Ikut peraturan dari kiri ke kanan.” Jika jawapan 10, tawarkan semakan input yang sedang diberi; jangan terus mengatakan pemain menghafal Q03.

**Betul:** penunjuk output 16 mengaktifkan pengunci kedua. Tunjuk `f(6)=16` sebagai pengesahan, bukan hanya ikon betul.

## Q06 — Nilai negatif kekal input yang sah

**Prompt:** “Mesin menggunakan `f(x)=2x−1`. Apakah imej bagi input −2?” Tanda negatif dalam prompt mesti jelas, tidak dipisahkan daripada 2 ketika line wrap.

**H1:** “Input negatif masih boleh digunakan dalam peraturan ini.”
**H2:** “Gantikan bersama tanda: `f(−2)=2(−2)−1`.”
**H3:** “`2(−2)=−4`; `−4−1=−5`. Jadi output ialah −5.”

**Salah:** “Semak tanda negatif ketika mendarab dan selepas menolak 1.” Untuk −3, minta semak arah perubahan apabila 1 ditolak daripada −4; jangan ubah feedback menjadi hukuman kerana tanda salah.

**Betul:** output negatif ditunjukkan pada skala bernombor yang mempunyai nilai di bawah sifar. Jangan menukarnya kepada panjang fizikal negatif. Ia ialah bacaan/kalibrasi mesin; apabila set M2 lengkap, L3 turun dan CP2 disimpan.

## Q07 — Kenal pasti input terlarang

**Prompt:** “Bagi `f(x)=1/(x−2)`, input manakah membuat fungsi tidak tertakrif?” Pilihan: 1, 2, 3, 4. Ini soalan tentang input, bukan mencari nilai output.

**H1:** “Perhatikan penyebut, iaitu bahagian bawah pecahan.”
**H2:** “Input terlarang menjadikan `x−2=0`.”
**H3:** “`x=2` menjadikan penyebut 0. `1/0` tidak tertakrif, jadi input 2 tidak dibenarkan.”

**Feedback pilihan:**

| Pilihan | Maklum balas |
| --- | --- |
| 1 | “Penyebut ialah −1, bukan 0. Output −1 masih tertakrif.” |
| 2 | “Penyebut ialah 0. Mesin tidak boleh menghasilkan output yang tertakrif untuk input ini.” |
| 3 | “Penyebut ialah 1. Output 1 tertakrif; cuba cari input yang menjadikan penyebut 0.” |
| 4 | “Penyebut ialah 2. Output 1/2 tertakrif; pecahan juga boleh menjadi output.” |

**Kesan dunia:** pengadang keselamatan mesin menolak input terlarang daripada saluran percubaan; satu pengunci akhir menjadi sedia. Gate destinasi masih tertutup sehingga Q08. “Fungsi tidak tertakrif pada input 2” tidak bermaksud peraturan itu bukan fungsi pada domain yang sesuai.

Ini pengenalan sekatan input sahaja, bukan penilaian menyeluruh domain dan julat.

## Q08 — Cari input untuk membuka laluan akhir

**Prompt:** “Pusat kawalan menggunakan `f(x)=4x−3`. Gate memerlukan output 17. Cari input x.” Tiada demo awal, tetapi hint sukarela tetap tersedia.

**H1:** “Bentukkan persamaan dengan output sasaran.”
**H2:** “`4x−3=17`. Tambah 3 pada kedua-dua belah, kemudian bahagi dengan 4.”
**H3:** “`4x=20`, jadi `x=5`. Semak: `4(5)−3=17`.”

**Salah, contoh input 4:** “Input 4 menghasilkan `f(4)=13`. Sasaran ialah 17.” Penunjuk berhenti pada 13; tiada kehilangan progress.

**Betul:** `5 → ×4 → 20 → −3 → 17`; M3 siap, G3 terbuka dan CP3 disimpan. Pemain perlu berjalan ke destinasi sebelum ringkasan keluar.

## Variasi berkurasi untuk pengukuhan / ulang main

Varian dipilih secara terkawal dan disimpan bersama run. Jangan merawakkan operasi, kesukaran dan sasaran tanpa menyemak jawapan. Bagi V1, hanya varian yang disenaraikan di sini dianggap calon; jadual ini tidak terus menambah lapan soalan wajib lagi.

| Varian | Soalan | Jawapan | Semakan |
| --- | --- | --- | --- |
| R02 | `f(x)=x+6`, cari `f(4)` | 10 | `4+6=10` |
| R03 | `f(x)=2x−3`, cari `f(5)` | 7 | `10−3=7` |
| R04 | `f(x)=2x+1`, output 13, cari x | 6 | `(13−1)/2=6` |
| R05 | `f(x)=3x−1`, cari `f(5)` | 14 | `15−1=14` |
| R06 | `f(x)=3x−2`, cari `f(−2)` | −8 | `−6−2=−8` |
| R07 | `f(x)=1/(x+3)`, input terlarang; pilihan −3, −2, 0, 3 | −3 | `−3+3=0` |
| R08 | `f(x)=3x+2`, output 20, cari x | 6 | `(20−2)/3=6` |

Hint varian menggunakan pola yang sama tetapi setiap nombor/langkah mesti mengikuti varian itu; jangan menggunakan hint Q08 bagi R08 secara literal. Jika pola belum disemak dalam implementasi, tampilkan hanya soalan asas yang siap.

Pengukuhan imej dipadankan dengan kesukaran: selepas bantuan pada input negatif, gunakan R06, bukan soalan tambah mudah. Pengukuhan objek menggunakan R04/R08; input terlarang menggunakan R07. Satu per keluarga konsep dalam satu run, ditawarkan tanpa mengunci semula laluan.

## Rekod bukti setiap item

Simpan ID item/varian, mod, input dikunci atau output dikunci, bilangan cubaan numerik sah, hint tertinggi, sama ada jawapan pernah ditunjukkan, hasil terkini dan status pengukuhan. Demonstrasi tidak menyamar sebagai cubaan betul. Pilihan salah Q07 ialah cubaan matematik; teks kosong bukan cubaan matematik.

Teks ringkasan berasaskan rekod: “Selesai tanpa hint dalam 2 percubaan”, “Selesai dengan bantuan”, atau “Belum dicuba”. Selesai selepas menerima jawapan penuh tidak boleh dilabel kendiri hanya kerana cubaan terakhir betul.

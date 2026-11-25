# Dunia 2 — catatan penambahbaikan visual & UI

Dicatat 25 Nov 2026 atas permintaan pemilik semasa Fasa 6 bermula, supaya tidak terlupa.
**Fasa 7 bahagian 1 siap (25 Nov): A1–A4a dan batu loncatan.** **Bahagian B siap (25 Nov): 4, 5, 6, 7, 8, 10, 15, 18. Bahagian C siap (25 Nov): 9, 11, 12, 13, 14, 16, 17, 19.** Semua item ✅.
Disahkan dengan tangkapan skrin, ujian main penuh 2-1/2-2/2-3, dan `w1-env-check` (perlanggaran Dunia 1
sama persis dengan `main`). Peraturan jubin kini dalam `src/v14/levels/w2/art.js`.

## A. Daripada pemilik (dengan gambar)
1. ✅ **Garis tebal melintang pada tanah batu** — gaya baharu `karst` dalam `buildLandscape` guna permukaan 60–63 (tiada garis bawah); Dunia 1 (`stone`, 40–43) tidak berubah. (Level 2-2, dataran dan tebing; juga mana-mana tanah gaya
   `stone`). Tanah sudah ada garis tepi sendiri; baris batu atas (bingkai Kenney 40–43) melukis satu lagi
   garis gelap di bawahnya, jadi kelihatan garis tebal yang tidak perlu di sepanjang tanah.
   Punca kemungkinan: `style: 'stone'` dalam `buildLandscape` hanya menukar baris atas; baris tanah di
   bawahnya bermula dengan bingkai yang ada garis atas. Juga semak sambungan antara kepingan tanah yang
   bersebelahan pada ketinggian sama (`plateau-a` / `gate-floor` / `plateau-b`).
2. ✅ **Rasuk batu loceng tiada garis tebal di hujung** — kini slab terapung pada grid (41 / 42 / 43), x −1 hingga 5. (Level 2-2, Stesen E). Semua jubin rasuk guna
   bingkai tengah (42); hujung kiri/kanan perlu bingkai hujung (41 / 43) supaya bentuknya tertutup, dan
   kedudukan perlu ikut grid jubin (sekarang bermula di x = −0.5).
3. ✅ **Blok bertindan yang pelik** — D: tangga tanah padu (`solidColumns`, bingkai dipilih ikut jiran); F: perancah papan kayu 146 di atas tiang 89. (tangga batu Stesen D dan tebing peti lif Stesen F): lajur blok 47 / peti 26
   bertindan nampak seperti timbunan kotak, bukan tangga. Perlu bentuk tangga yang padu (tanah dengan
   bahagian atas, atau tangga kayu Kenney) dan animasi naik yang kemas.
4a. ✅ **Gerbang keluar ("KE 2-3", "KE DUNIA 3") — susunan jubin salah** — kini tiang isi 120 tanpa atap di bawah rasuk 41/42/43 (`exitGate`); dinding gerbang batu E dan 2-3 guna `stoneColumn` (penutup 60 + isi 120). (pemilik, gambar 25 Nov):
   tiang dibina dengan bingkai *permukaan tanah* 40 yang ditindan, jadi setiap blok ada "atap" batu
   sendiri dan nampak seperti timbunan kotak. Perlu tiang yang betul (bingkai tepi/isi tanpa atap,
   atau tiang batu/kayu Kenney), dan rasuk atas dengan bingkai hujung kiri / tengah / kanan.
   Sama di 2-1, 2-2 dan 2-3 (kod `tile(40, …)` / `tile(42, …)` untuk gerbang). **Keutamaan pertama Fasa 7.**
4. ✅ (HUD padat jauh dari stesen, label bertepi, nama stesen digabung ke skrin tuil) **Reka bentuk UI yang pelik di setiap dunia** — semak semula seluruh HUD dan papan tanda dalam dunia
   (lihat B).

- ✅ Batu loncatan 2-1 (dan bilik ujian): bingkai 147 (platform batu kecil), bukan 47 (kotak bercorak X).

## B. Diperhatikan semasa membina (untuk disemak bersama)
5. ✅ HUD jadi padat (persamaan sahaja) bila jauh dari stesen; skrin rendah (≤500px) sembunyi tag/penerangan. Panel HUD di kiri atas besar dan menutup sebahagian peta di telefon landskap; pertimbang panel yang
   boleh dilipat, atau ringkas → penuh bila dekat tuil.
6. ✅ Papan nama disembunyikan, nama stesen = skrin tuil (hijau + ✓ bila selesai); label cincin 2-1 kecil dan di atas cincin. Label dalam dunia bertindih: nama stesen + skrin tuil + label cincin + label grid kadang-kadang
   bertindih dengan tiang cawan (D), tebing atau batu.
7. ✅ Label grid kini bertepi krim tebal, boleh dibaca di atas tanah. Label nombor grid (0, 1, 2 …) di bawah tanah kadang-kadang terlukis di atas tanah dan sukar dibaca.
8. ✅ Tag di tengah stesen, di atas batu tertinggi (had y 8). Tag kegagalan merah (2-1) kadang-kadang separuh di luar skrin di sebelah kanan.
9. ✅ Tanpa perlu membaca: batu tenggelam kelihatan di bawah permukaan air (warna air + buih); batu tertanam = garis putus merah + pangkah, dan anak panah ↕ bila ruang sempit; batu tidak berpaut bergegar, jatuh dan memercik. Kamera 2-1 kini menunjukkan air setiap stesen. (Tint Phaser tidak berfungsi dalam Canvas, jadi lapisan dilukis.) Batu "sempit" / batu tenggelam / batu jatuh: pastikan semua keadaan mudah difahami tanpa membaca.
10. ✅ Satu gaya papan: skrin tuil sahaja (papan nama berasingan dibuang). Bendera checkpoint, tiang tuil dan papan nama: gaya berbeza antara stesen; seragamkan.
11. ✅ Papan kayu gaya Kenney (warna bingkai 86, paku, tiang kayu) dengan kertas pelan dipin. Papan pelan kandang (F): papan putih besar nampak seperti UI, bukan objek dunia; gunakan bingkai
    papan tanda kayu Kenney.
12. ✅ Kandang sebenar di tanah: pagar Farm sepanjang 6 − x, peti disusun x baris di dalamnya, baki peti kekal di luar. Pagar Kenney Farm di F hanya hiasan; pertimbang pagar yang benar-benar membentuk kandang di tanah.
13. ✅ Hanya mulut paip (bahagian atas 95) kelihatan rata dengan tanah, bola/air keluar dari mulutnya; pelancar D ikut punca pertama lengkung. Bola kini dilukis berwarna (tint tidak berfungsi). Pelancar bola (D) dan muncung air (E) guna paip Kenney 95 — semak saiz dan kedudukan.
14. ✅ `camera.js`: setiap level W2 mematikan garis "tanah tinggi" Dunia 1 (`camHighY`) dan boleh menambah zon bingkai (2-1: setiap stesen termasuk air; 2-2: Stesen E). Dunia 1 tidak berubah. Kamera: logik kamera Dunia 1 dalam `player-motion.js` guna pemalar ketinggian Dunia 1 (y < 1230);
    Dunia 2 mengimbanginya di Stesen E sahaja. Pertimbang tetapan kamera per level.
15. ✅ Siluet menara batu kapur (Graphics, parallax 0.35, di belakang jalur hutan) dalam ketiga-tiga level. Latar belakang: identiti karst Lembah Batu Kapur masih lemah (hanya jalur hijau); keputusan pemilik:
    guna set Kenney sedia ada + blok batu — perlu reka susun atur latar yang lebih jelas.
16. ✅ Rahsia: permata batu kapur (bingkai 67) di atas Rabung Masuk (2-1) dan di atas gerbang keluar (2-2), dicapai dengan batu loncatan; disahkan dengan lompatan 5 % lebih lemah; disimpan (`secrets`), tunjuk "Rahsia n/1" semasa tamat. Belum ada rahsia / laluan pilihan dalam 2-1 dan 2-2 (blueprint: gua bawah tebing, cincin emas ke-3).
17. ✅ Main semula ke-1, ke-3, …: Stesen D guna y = −x² + 8x − 12 (bucu (4, 4)); jawapan disemak ikut `variant` larian. Variasi main semula 2-2 (y = −x² + 8x − 12) belum dibina.
18. ✅ MAIN/SAMBUNG kini sambung ke level Dunia 2 seterusnya bila Dunia 1 selesai. Butang MAIN/SAMBUNG di menu utama hanya ikut Dunia 1.
19. ✅ Acara level_started / level_replayed / level_completed untuk w2-l1/2/3 (`track.js`); masih MATI selagi analitik dimatikan, dan halaman W2 hanya menyambung akaun tanpa nama yang sedia ada. Analitik belum merekod level Dunia 2 (analitik dimatikan buat masa ini).

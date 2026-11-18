# DENAI Day 05 · Fasa 1 — Audit gameplay (baca sahaja)

Branch `claude/denai-day04-puzzle-persistence` @ `82af8fd`. Tiada kod permainan diubah. Skrip probe audit disimpan di luar repo (scratchpad). Semua ujian dijalankan dalam **Chromium headless sahaja** dan bukan pada peranti sebenar. PlayFab di-stub dan hosnya disekat.

## 0. Baseline Day 04 (kod keluar sebenar)
| Ujian | Kod keluar | Nota |
|---|---|---|
| 10 ujian unit (`tests/*.test.mjs`) | 0 ×10 | `puzzle-session` 10/10, `puzzles` 8/8, `workshop-v3` 1/1 |
| `puzzle-reload-check` | 0 | |
| `l1-playthrough` | 0 | 76 s |
| `l2-playthrough` | 0 | 75 s |
| `l3-playthrough` | 0 | 114 s |
| `w1-progression` | 0 | 310 s |
| `w1-mobile-check` | 0 | 299 s, 11 viewport |
| `rc-check` | 0 | 63 s |
| `menu-check` | 0 | 30 s |
| `l1-v3-check` | 0 | 54 s |
| `l2-check` | 0 | 44 s |
| `l3-check` | 0 | 76 s |

**Ralat konsol:** tiada ralat halaman atau konsol dalam suite dan probe audit. Ralat rangkaian PlayFab disekat dengan sengaja dan ditapis.

**Probe audit:** 1280×720; iPhone 13 landskap 844×390; iPhone 13 potret 390×664; iPhone SE landskap 568×320.
- Larian probe pertama gagal kerana kesilapan skrip saya, bukan permainan:
  - satu perlumbaan masa (kekunci E dibaca pada bingkai seterusnya);
  - scene dilancar tanpa menghentikan scene sebelumnya.
- Bahagian telefon diulang dengan pelancaran sebenar melalui butang **Main**. Hanya data daripada larian yang sah digunakan.

## 1. Penemuan

### P0 — tiada
Tiada penghalang permainan, jawapan puzzle salah, progresi rosak, save rosak atau puzzle mustahil. Ketiga-tiga level boleh ditamatkan (playthrough dan progression exit 0). Nilai pada skrin sepadan dengan sesi aktif (`puzzle-reload-check`).

### P1-A · Stor Kayu 1-1: membuka semula stor terus membuat pembelian
- **Bukti:** [`a3-l1-buka-semula-terus-beli.png`](shots/a3-l1-buka-semula-terus-beli.png), [`a6-l1-buka-semula-ralat.png`](shots/a6-l1-buka-semula-ralat.png), [`d-landscape-l1-stor.png`](shots/d-landscape-l1-stor.png)
- **Langkah:**
  1. Buka stor, tetapkan papan = 5, kemudian tekan Tutup.
  2. Tekan E (atau ketik Guna) di pintu.
  3. Panel terbuka **dan** "Dibeli 5 papan · RM26" berlaku serta-merta, tanpa pemain menekan Beli.
  4. Dengan kuantiti 1, panel terus dibuka bersama ralat "1 papan tak cukup…". Pada telefon ini berlaku setiap kali stor dibuka semula dengan Guna.
- **Punca:** `levels/supply-quest.js` `useQuest()` — cabang `questReady==='buy'` memanggil `openStore(s); buy(s, …)`. Ketika panel tertutup, satu tekanan membuka **dan** menghantar jawapan. Pembukaan pertama (`door`) hanya membuka panel, jadi tingkah lakunya tidak konsisten.
- **Kesan:** penghantaran jawapan tanpa sengaja; maklum balas "salah" sebelum pemain mencuba. Kos tidak hilang kerana pembelian salah tidak dicaj, tetapi pembelian betul boleh berlaku tanpa semakan.
- **Cadangan:** jika panel tertutup, E/Guna di pintu hanya membuka panel. Pembelian kekal melalui butang Beli atau E semasa panel terbuka.

### P1-B · Stor Kayu 1-1: kandungan panel terpotong pada telefon landskap sempit (iPhone SE 568×320)
- **Bukti:** [`d-se-landscape-l1-stor.png`](shots/d-se-landscape-l1-stor.png); bandingan iPhone 13 landskap [`d-landscape-l1-stor.png`](shots/d-landscape-l1-stor.png)
- **Ukuran** (`#store-panel`, 568×320):
  - kotak panel x = 261…545 (lebar 284); `scrollWidth 324 > clientWidth 260`; `scrollHeight 107 = clientHeight 107`, jadi tiada limpahan menegak;
  - `overflow: visible`, maka kandungan melimpah keluar panel.

| Elemen | Kedudukan x | Dalam panel | Dalam skrin |
|---|---|---|---|
| `−` | 283–336 | ✓ | ✓ |
| kuantiti | 344–368 | ✓ | ✓ |
| `+` | 376–429 | ✓ | ✓ |
| Beli | 439–515 | ✓ | ✓ |
| **Tutup** | **523–597** | ✗ | ✗ (hanya 45/74 px kelihatan, teks "Tutu") |
| **Jumlah/Bajet** | 283–597 | ✗ | teks pendek, kelihatan |
| **Resit + formula C(x)** | 283–597 | ✗ | ✗ ("… C(x) = 4x" terpotong; "+ 6" tidak kelihatan) |
| **Mesej salah** | 283–597 | ✗ | melepasi bingkai panel |
| Tajuk "Pembekal Kayu Hutan" | — | disembunyikan dengan sengaja (`max-height:540px`) | — |

- Butang Tutup **masih boleh diketik** (ketikan ke tengah elemen berjaya; panel tertutup).
- Formula kos, iaitu maklumat matematik puzzle, tidak kelihatan sepenuhnya.
- iPhone 13 landskap (844×390) dan potret (390×664): semua elemen dalam panel dan dalam skrin.
- **Punca:** `ui/v4.css:162-168` (`@media (max-height:540px) and (orientation:landscape)`):
  - `#store-panel{left:46%; width:min(430px,50%)}` dengan grid `auto 1fr`;
  - baris pertama memerlukan kira-kira 322 px: −/qty/+ 138 + gap 10 + Beli 70 + 8 + Tutup 70, ditambah padding dan border;
  - 50% daripada 568 = 284 px sahaja. Grid tidak menyusut di bawah min-content, maka ia melimpah ke kanan.
  - Berlaku apabila lebar viewport kurang daripada kira-kira 644 px dalam landskap ≤ 540 px tinggi (kelas iPhone SE 1st gen / skrin 4 inci).
- **Mengapa `w1-mobile-check` terlepas:** ia hanya mengukur kotak `#store-panel`, yang masih dalam skrin, bukan elemen anak yang melimpah.
- **Cadangan:**
  - lebar panel = `min(430px, max(50%, kandungan))`, atau benarkan baris membalut (wrap) / letak Beli + Tutup pada baris kedua bila sempit;
  - pastikan `left` disesuaikan supaya `right ≥ 8px`;
  - tambah semakan limpahan anak dalam `w1-mobile-check`.

### P1-C · Bengkel 1-2: label gesaan "E" dipaparkan pada peranti sentuh
- **Bukti:** [`d-portrait-l2-tuas.png`](shots/d-portrait-l2-tuas.png), [`d-landscape-l2-tuas.png`](shots/d-landscape-l2-tuas.png); bandingan 1-3 [`d-portrait-l3-injap.png`](shots/d-portrait-l3-injap.png) yang memaparkan "Guna · Pusing injap (kini 0)".

| Level | Sumber label kekunci | Telefon |
|---|---|---|
| 1-1 | `game.js` `K('E','Guna')` (`touchDevice = matchMedia('(pointer: coarse)')`) | "Guna · Beli papan" ✓ |
| 1-2 | `levels/twin-scene.js:129` `$('world-prompt-key').textContent='E'` (tetap) | **"E · Jalankan bengkel"** ✗ |
| 1-3 | `levels/inverse-scene.js:204` `touch?'Guna':'E'` | "Guna · Pusing injap" ✓ |

- `workshopPrompt()` **sudah menerima** parameter `touch` (`twin-scene.js:115`) dan menghasilkan `key:'Guna'`, tetapi scene membuang `wsp.key` dan menulis `'E'`.
- **Fungsi:** tidak terjejas. Input `interact` datang daripada `core/player-motion.js` `updatePlayer()` yang dikongsi (E atau butang Guna). Butang Guna dipaparkan semasa gesaan (`twin-scene.js:127`).
  - Diuji: ketik Guna di tuas → `runs` 0 → 1 pada ketiga-tiga peranti.
  - Desktop: E berfungsi (playthrough exit 0).
- **Kesimpulan:** isu **label sahaja**, bukan fungsi.
- **Cadangan:** guna `wsp.key` (atau `touch?'Guna':'E'`) seperti 1-3.

### P2-A · Bengkel 1-2: gesaan penamat tersekat dipotong ("jambatan bengkel dahulu")
- **Bukti:** [`d-portrait-l2-penamat-sekat.png`](shots/d-portrait-l2-penamat-sekat.png)
- **Punca:** `twin-scene.js:124` menetapkan `prompt='Bina jambatan bengkel dahulu'`. Baris 129 kemudian memanggil `prompt.slice(4)` yang direka untuk membuang awalan `'E · '`, jadi "Bina" hilang. Label "E" juga dipaparkan walaupun tiada tindakan.
- 1-3 (`'Pulihkan pintu air dahulu'`) betul dari segi teks, tetapi masih memaparkan label "Guna/E" tanpa tindakan.
- **Skop:** dicapai dalam audit melalui teleport. Laluan biasa ke penamat sebelum jambatan dibina tidak disahkan. Mesej `notice` "Bina jambatan bengkel dahulu" yang betul turut muncul.
- **Cadangan:** keluarkan awalan dengan regex seperti 1-3, dan sembunyikan label kekunci untuk mesej yang bukan tindakan.

### P2-B · Stor Kayu 1-1: Jurnal boleh dibuka di atas panel stor (dua antara muka bertindih)
- **Bukti:** [`a7-l1-stor-dan-jurnal.png`](shots/a7-l1-stor-dan-jurnal.png)
- J membuka Jurnal sementara `#store-panel` masih terbuka. Pengendali kekunci stor (`supply-quest.js` `installQuestUI`, capture) hanya menyemak `st.hidden`. Oleh itu E semasa Jurnal terbuka masih memanggil `buy()`.
- **Cadangan:** tutup panel stor bila Jurnal dibuka, atau abaikan kekunci stor bila `journal-open`.

### P2-C · Objektif selepas puzzle selesai tidak menunjuk arah seterusnya
- **Bukti:** [`a5-l1-tebing-berliku.png`](shots/a5-l1-tebing-berliku.png), iaitu pin "Jambatan dibaiki ✓" di zon 04 sedangkan penamat di zon 06; [`c3-l3-selepas-pintu-air.png`](shots/c3-l3-selepas-pintu-air.png)
- Selepas misi selesai, pin kekal "✓". 1-1: jambatan x = 2510 → penamat x = 5751, merentasi tiga zon. 1-2/1-3 lebih pendek.
- Arah ke kanan ialah konvensyen platformer dan zon/penanda "TAMAT" wujud. Jadi ini bukan penghalang.
- **Cadangan:** teks pin langkah `done`, contohnya "Jambatan dibaiki ✓ · Teruskan ke Destinasi Terakhir". Tiada label HUD baharu.

### P2-D · 1-2 dan 1-3: tiada pin objektif sehingga sampai ke bengkel / pintu air
- **Bukti:** [`b0-l2-mula.png`](shots/b0-l2-mula.png)
- 1-1 memaparkan pin dari mula (Day 02 P1-05). 1-2 dan 1-3 hanya memaparkan toast mula, contohnya "Ikut sungai ke bengkel di hilir.", dan Jurnal kosong sehingga intro di lokasi puzzle. Konsistensi sahaja.
- **Cadangan:** pin "Bengkel Kayu" / "Pintu Air" dari mula, ikut corak 1-1 (`go`).

### P2-E · Lain-lain (dirakam, tidak dicadangkan untuk Day 05)
- Pin potret terpotong dengan "…" ("Naik ke dek atas untuk mengubah susunan me…") (`iphone-13-potret-1-2`). Teks penuh ada dalam Jurnal.
- Saiz pemain pada telefon: 40 px CSS (SE landskap), 50 px (iPhone 13 landskap) dan 60 px (potret). Ini keputusan zoom Day 02; tiada isu baharu.
- Jawapan "Lihat cara kira" berada dalam DOM tersembunyi (`hidden`) sebelum misi selesai. Ia tidak kelihatan dan tidak dibaca pembaca skrin.
- Gelembung cerita 1-1 boleh tersorok di belakang panel stor pada SE landskap (ia akan pudar sendiri).

## 2. Apa yang berfungsi baik (jangan diubah)
- **Maklum balas jawapan salah** jelas dan khusus pada ketiga-tiga level:
  - 1-1: "4 papan tak cukup…", "RM34 melebihi bajet RM30.";
  - 1-2: "Hasil 6 — belum cukup 8.", dan pin bertukar kepada arahan ke dek atas;
  - 1-3: "Aliran masih rendah." / "Tekanan terlalu tinggi!", dengan petunjuk khusus bacaan.
- Kawalan pendua: tuas 1-2 dan tuas aliran 1-3 diabaikan semasa animasi (`busy`). Pembelian 1-1 berhenti selepas `bought`.
- Jurnal dan petunjuk sepadan dengan sesi aktif (diuji dengan seed yang dijana, `puzzle-reload-check`).
- Save, sesi puzzle, migrasi, fizik, laluan dan kedudukan objek: semua ujian lulus. Jangan diubah.
- Saiz teks, HUD, pin dan dialog pada 11 viewport (`w1-mobile-check` exit 0).

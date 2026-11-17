# DENAI V4 · UI/UX — Audit & tiga konsep visual (untuk dipilih)

Asas: release candidate `claude/denai-w1-v3-rc` (`9c78e21`). **Tiada kod permainan diubah** untuk dokumen ini.
Mockup dibina di atas **tangkapan sebenar** ketiga-tiga level (kanvas sahaja, UI disembunyikan) dengan
**aset sedia ada sahaja**: panel Kenney *UI Pack – Pixel Adventure* (kayu, parchment, slate, reben, bingkai
lencana), ikon & digit piksel daripada tilemap Kenney, dan sprite Chill Boy. Tiada grafik AI.
Fon dalam mockup: Inter (OFL, belum dibundel dalam game) + digit piksel Kenney.

## A. Audit UI semasa (`audit-sebelum.jpg`, `audit-liputan.json`)
**Komponen:** HUD (plak kawasan, cip syiling/rahsia, jeda), toast kawasan, toast `#notice`, penjejak misi,
panel stor 1-1, gesaan "E · …", butang sentuh — **semuanya DOM/CSS di atas kanvas**. Gelembung dialog,
plat mesin, meter, papan tanda — **objek Phaser** dalam dunia.

**Liputan skrin oleh UI (DOM sahaja, gelembung dunia tidak dikira):**

| Keadaan | Desktop | Telefon landskap | Telefon potret |
|---|---|---|---|
| Teroka | 1.3 % | 9.3 % | 8.3 % |
| Penemuan misi | 5.4 % | 17.4 % | 18.6 % |
| Selepas penemuan (penjejak kekal) | 3.9 % | **16.9 %** | 16.2 % |
| Interaksi stor 1-1 | 8.5 % | **33.4 %** | 25.4 % |

**Masalah utama:**
1. Penjejak misi **kekal** sepanjang permainan selepas misi ditemui (≈ 7 % skrin telefon, berganda dengan HUD).
2. Panel stor 1-1 menutup **⅓** skrin telefon landskap.
3. **Maklumat berganda:** nama level di HUD + toast kawasan + teks penjejak; gelembung + toast + baris
   status penjejak menyebut perkara sama (cth. "Bacaan 5 — terlalu rendah…" dalam gelembung **dan** penjejak).
4. Gelembung terlalu panjang (2–4 baris, ayat penuh) — sepatutnya reaksi pendek; akibat sudah kelihatan di dunia.
5. Dialog sedia ada (`#chill-bubble`) hanya teks; tiada potret, tiada jeda pergerakan.
6. Telefon landskap pendek: teks dalam dunia ≈ 10 px (zum kamera).
7. Butang sentuh: semua sama berat visual; emas untuk Lompat dan hijau untuk Guna — sudah baik; tangga ↑↓ besar.

**Aset watak:** hanya **Chill Boy** (pemain). **Dunia 1 tiada NPC dan tiada aset potret NPC.**

## B. Tiga konsep (`konsep-A.jpg`, `konsep-B.jpg`, `konsep-C.jpg`)
Setiap konsep menunjukkan: teroka · penemuan misi · interaksi · gagal · selesai · telefon.

### Konsep 1 — Adventure RPG
- HUD: plak kayu kecil (level + syiling), ikon **Jurnal** (papan misi) dengan tanda "!", jeda.
- Penemuan, gagal, selesai: **kotak dialog RPG** di bawah dengan **potret besar** (pemain → Chill Boy);
  HUD dimalapkan, pergerakan dijeda, ▼ untuk teruskan.
- Interaksi: **tetingkap kedai** parchment di sisi (senarai harga, kuantiti, jumlah/bajet, C(x) kecil).
- **Jurnal dua halaman**: objektif, perkara diketahui, petunjuk 3 peringkat, rahsia & syiling.
- ➕ Paling "adventure", cerita jelas. ➖ Dialog untuk *setiap* reaksi = kerap menghentikan permainan;
  kotak dialog besar di telefon.

### Konsep 2 — Modern Platformer
- HUD tanpa panel: ikon syiling + nombor bergaris, jeda bulat lutsinar; nama kawasan sebagai teks pudar.
- Penemuan: **pil "Misi baharu"** meluncur dari atas, kemudian mengecil menjadi **cip objektif** di bawah syiling.
- Interaksi: **kawalan terapung terikat pada objek** (− 5 + · RM26/30 · Beli).
- Gagal: **teks terapung** "Rendah ↓" di sebelah meter. Selesai: sorotan ✓ besar di tengah.
- ➕ Paling bersih & pantas; dunia paling kelihatan. ➖ Kurang identiti DENAI/piksel; tiada dialog
  berpotret; kawalan terapung boleh bertindih dengan pemain (lihat B3).

### Konsep 3 — Hybrid RPG Platformer (**cadangan**)
- HUD: **satu plak kayu** (level · syiling) + Jurnal + jeda. Nama kawasan pada **reben Kenney** 2 s.
- Dialog berpotret **hanya untuk detik cerita** (penemuan masalah, kejayaan misi) — 1–2 baris.
- Selepas dialog: objektif menjadi **tag pin satu baris** di bawah plak (ketik → Jurnal). Boleh dibuka semula.
- Interaksi: **bahan ikut fungsi** — resit **parchment** kecil di sisi stor (1-1); panel **mekanikal slate**
  dengan digit piksel pada roda/meter (1-3: TETAPAN · BACAAN · SASARAN); plat mesin kekal di dunia (1-2).
- Gagal: **gelembung dunia satu baris** pada objek ("Aliran masih rendah."); akibat dilihat di dunia.
- Selesai: dialog pendek + **cap emas** "Misi selesai" yang meluncur ke ikon Jurnal.
- Telefon: kumpulan gerak kiri; kumpulan tindakan kanan (↑↓ kecil, Guna kontekstual, Lompat besar emas).
- **Peraturan potret** (C9): pemain → Chill Boy; NPC → potret NPC itu; tiada potret → ikon papan tanda
  dalam bingkai yang sama. Tiada nama watak.

## C. Perbandingan

| Kriteria | 1 · Adventure RPG | 2 · Modern Platformer | 3 · Hybrid |
|---|---|---|---|
| Dunia kelihatan semasa main | Baik (teroka) / rendah semasa dialog | **Terbaik** | Sangat baik |
| Identiti visual DENAI (piksel, kayu) | Kuat | Lemah | **Kuat** |
| Kejelasan objektif tanpa membaca banyak | Baik (Jurnal) | Baik (cip) | **Terbaik** (dialog sekali + tag pin + Jurnal) |
| Rasa "adventure game" | **Terkuat** | Lemah | Kuat |
| Gangguan pada aliran main | Tinggi (dialog kerap) | **Terendah** | Rendah (dialog hanya detik cerita) |
| Selesa di telefon | Sederhana (kotak dialog besar) | Baik | Baik |
| Kerumitan pelaksanaan | Sederhana | Rendah | Sederhana–tinggi |

**Cadangan: Konsep 3 (Hybrid)** — selari dengan pilihan anda. Ia mengekalkan dialog berpotret dan Jurnal
dari Konsep 1 untuk detik penting, dan kebersihan Konsep 2 untuk permainan biasa (tag pin, gelembung satu
baris, panel kecil terikat objek).

## D. Keputusan yang saya perlukan sebelum pelaksanaan
1. **Pilih konsep:** 1, 2, 3 — atau 3 dengan elemen tertentu daripada 1/2 (cth. cip objektif Konsep 2).
2. **Fon:** (a) Inter untuk teks + digit piksel Kenney untuk nombor (seperti mockup; Inter OFL perlu
   dibundel ~100 KB), atau (b) tambah fon piksel berlesen OFL (cth. Pixelify Sans) untuk tajuk pendek sahaja.
3. **NPC:** Dunia 1 tiada NPC. Sistem dialog akan menyokong potret NPC, tetapi tanpa aset NPC hanya
   pemain + fallback digunakan. Mahu saya tambah NPC kecil *pilihan* (cth. tukang bengkel) — memerlukan aset
   potret/karakter yang sah — atau kekal tanpa NPC dalam V4?
4. **Panel interaksi:** pergerakan dikunci semasa panel stor/injap dibuka (cadangan), atau pemain boleh
   beredar untuk menutup?

Selepas anda memilih, saya akan menulis sistem reka bentuk akhir dan mula melaksanakan pada branch baharu
daripada `claude/denai-w1-v3-rc`. Tiada merge atau deploy.

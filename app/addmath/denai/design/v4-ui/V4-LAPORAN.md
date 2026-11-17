# DENAI V4 · UI/UX — Sistem reka bentuk akhir & laporan pelaksanaan (Konsep 3 · Hybrid RPG Platformer)

Branch `claude/denai-v4-ui` (dari release candidate `claude/denai-w1-v3-rc`). **Tidak di-merge, tidak di-deploy.**
Konsep dipilih oleh pemilik: **Konsep 3**. Pilihan lalai (soalan belum dijawab): fon sedia ada + digit piksel,
tiada NPC dalam V4 (sistem menyokong potret NPC & fallback), pergerakan dikunci semasa panel stor dibuka.

## 1. Sistem reka bentuk
**Bahan (Kenney UI Pack – Pixel Adventure, aset sedia ada):**
| Bahan | Kegunaan |
|---|---|
| Kayu | Plak HUD, butang Jurnal & jeda, butang gerak sentuh |
| Parchment | Pin objektif, Jurnal, kotak dialog, resit stor, toast ganjaran |
| Slate | Plat mesin dalam dunia (1-2, 1-3) — tidak diubah |
| Reben merah | Nama kawasan (2 s) |
| Emas | Lompat, Beli, cap "Misi selesai" sahaja |

**Mod UI:**
- **A · Teroka:** plak kayu `1–3 │ 🪙 6`, butang Jurnal + jeda. Kiraan rahsia keluar dari HUD (dalam Jurnal).
  Syiling: denyutan + "+1". Kawasan baharu: reben 2 s (sekali setiap 6 s per kawasan). Pin objektif satu
  baris hanya selepas misi ditemui.
- **B · Penemuan:** dialog berpotret (2 halaman pendek, kesan menaip, ▼, E/Space/Enter/ketik). HUD dimalapkan,
  butang sentuh & gesaan disembunyikan, pergerakan dikunci. Selepas ditutup → pin + lencana "!" pada Jurnal.
- **C · Interaksi:** objek fizikal kekal antara muka utama (roda injap, meter, tuas, mesin). 1-1: resit
  parchment kecil di tepi pintu stor (kuantiti, jumlah/bajet, Beli, Tutup; `C(x)` sekunder); pergerakan dikunci,
  E = Beli, Esc atau kekunci gerak = Tutup.
- **Maklum balas:** gelembung dunia satu baris ("Aliran masih rendah.", "Tekanan terlalu tinggi!",
  "Hasil 6 — belum cukup 8.", "Stor berkunci. Kunci di pondok lama?"). Apa yang perlu dicuba seterusnya →
  status & petunjuk dalam Jurnal.
- **Selesai:** dialog kemenangan 2 baris + cap emas "Misi selesai · …" yang meluncur ke ikon Jurnal.
- **Jurnal (J / pin / butang):** objektif, status, "? Petunjuk" 3 peringkat (atas permintaan), "Lihat cara kira",
  koleksi syiling & rahsia. Esc menutup Jurnal (bukan menu jeda). Pergerakan dikunci semasa dibuka.

**Potret:** pemain → Chill Boy (sprite sedia ada, bingkai lencana Kenney); NPC → `{npc: url}` potret NPC itu;
tiada potret → ikon papan tanda dalam bingkai sama (digunakan untuk catatan & rahsia). Tiada nama watak.

**Kawalan sentuh:** kiri ← →; kanan ↑ ↓ (48 px, tangga), Guna (hijau, kontekstual), Lompat (emas, besar).

**Pergerakan semasa UI terbuka:** `scene.uiLocks` (dialog / jurnal / stor). Input tetap dibaca (supaya
tekanan kekunci tidak "terlepas" kemudian) tetapi diabaikan; fizik, graviti, lompatan tidak diubah.

## 2. Komponen dikongsi
`src/v14/ui/v4-ui.js` (182 baris): `hud()`, `areaRibbon()`, `decorateJournal()`, `openJournal()`/`closeJournal()`,
`syncJournal()`, `dialogue()`, `stamp()`, `reward()`, `pagesOf()`, `lock()`/`unlock()`.
`src/v14/ui/v4.css` (172 baris) — satu fail untuk ketiga-tiga level (tiada CSS khusus level baharu).
`core/speech-bubble.js` (sedia ada) — satu sistem gelembung untuk semua level.

## 3. Fail yang diubah (berbanding RC)
`main.html` (plak HUD + v4.css) · `core/player-motion.js` (kunci UI) · `game.js` (label level) ·
`presentation.js` (HUD 1-1; gesaan 1-1 di bawah pin) · `levels/supply-quest.js` (1-1: Jurnal, dialog, resit
stor, gelembung pendek) · `levels/workshop-line.js`, `levels/twin-scene.js` (1-2) · `levels/sluice-line.js`,
`levels/inverse-scene.js` (1-3; plat "TETAPAN") · baharu `ui/v4-ui.js`, `ui/v4.css` · ujian: `v4-helpers.cjs`
(baharu), `l1/l2/l3-playthrough`, `l1-v3-check`, `l2-check`, `l3-check`, `w1-mobile-check`.
**Tidak diubah:** fizik, terrain, peraturan misi, matematik, kunci simpanan, progresi, papan pendahulu, pencapaian.

## 4. Pengesahan
FINAL_TESTS

**Telefon (`w1-mobile-check`, 10 viewport, sentuhan sahaja):** dialog (kotak + potret) dalam skrin dan tidak
menyentuh HUD; butang sentuh tersembunyi semasa dialog; pin, resit stor, gesaan, gelembung tidak bertindih
dengan HUD/butang/pin; Jurnal tidak perlu skrol; petunjuk kelihatan — **0 isu, 0 ralat**. Semakan tambahan:
resit stor landskap (5 peranti) 112 px tinggi, tiada tindihan, butang 44 px; gesaan 1-1 di bawah pin (5 peranti).

**Prestasi (`w1-perf`, syarat sama dengan Fasa F):**
| Level · telefon CPU×4 landskap | RC (purata / p95 / > 50 ms) | V4 |
|---|---|---|
| 1-1 | 16.9–18.4 ms / 26.8 / 0 | 17.0–18.9 ms / 28.5 / 0 |
| 1-2 | 16.7–19.1 ms / 26.7 / 0 | 16.7–17.8 ms / 26.4 / 0 |
| 1-3 | 17.8–19.2 ms / 28.2 / 0 | 17.0–17.8 ms / 26.2 / 0 |
Desktop: 16.7 ms (60 fps) semua level. Perbezaan dalam hingar; V4 ialah DOM/CSS, tiada beban kanvas.

**Liputan skrin oleh UI semasa teroka selepas misi ditemui (telefon landskap):** RC 16.9 % (penjejak kekal) →
V4 hanya plak + pin satu baris + butang. Interaksi stor 1-1 landskap: RC 33.4 % → V4 resit 112 px di sisi.

## 5. Isu yang tinggal / untuk pemilik
| # | Keterukan | Perkara |
|---|---|---|
| 1 | Sederhana | Tiada NPC & aset potret NPC dalam Dunia 1 — sistem sedia, tetapi hanya potret pemain & fallback digunakan |
| 2 | Rendah | Teks dalam dunia (plat mesin, gelembung) ≈ 10 px pada telefon landskap pendek (zum kamera) — belum diubah (di luar skop UI DOM) |
| 3 | Rendah | Dialog menambah ~2–4 s pada masa larian 1-1 (papan pendahulu); sama untuk semua pemain |
| 4 | Rendah | Belum diuji pada telefon sebenar / pemain manusia |
| 5 | Kod | Sistem dialog lama 1-1 (`#chill-bubble`, 2 baris kursus lama) masih wujud tetapi hampir tidak digunakan |

## Bukti
`v4-sebelum-selepas.jpg` (kedudukan sama, RC vs V4: desktop + telefon) · `v4-desktop.jpg` · `v4-telefon.jpg` ·
`v4-mikro-animasi.jpg` · `perf-v4.json` · konsep & audit: `konsep-*.jpg`, `audit-sebelum.jpg`, `V4-KONSEP.md`.

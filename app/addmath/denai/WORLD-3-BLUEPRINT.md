# Dunia 3 — Kilang & Lombong (seperti dibina, 25 Nov 2026)

Dunia gabungan: **T4 Bab 3 Sistem Persamaan** (3.1 linear tiga pemboleh ubah, 3.2 satu linear + satu tak
linear) dan **T5 Bab 7 Pengaturcaraan Linear** (7.1 model / rantau tersaur, 7.2 aplikasi / fungsi objektif).
Setiap jawapan betul mengubah dunia (lif, gerbang, jambatan, lantai), dan setiap jawapan salah
gagal secara fizikal: cerun tidak boleh dipanjat, dinding kekal, atau pemain jatuh ke asid.

Kod: `src/v14/levels/w3/`
- `systems.js`: matematik
- `maps.js`: peta
- `scene.js`: satu enjin untuk empat halaman
- `campaign.js`: simpanan `denai-w3-campaign-v1`

Halaman: `w3-l1.html` … `w3-l4.html`. Aset: Kenney Pixel Platformer Industrial (hanya
`Tilemap/tilemap_packed.png` + lesen CC0), ditambah pek asas untuk tuil, syiling, bendera dan permata.
Chill Boy tidak diubah.

## Level dan stesen
| Level | Stesen | Matematik | Jawapan | Apa yang dilihat | Mekanisme |
|---|---|---|---|---|---|
| 3-1 Tiga Injap | A Dua Tangki (pemanasan, T3) | x + y = 7, 2x + y = 11 | (4, 3) | tangki diisi hingga nilai sebelah kiri; tanda merah = nilai sebelah kanan; limpah jika terlalu tinggi | tangga logam naik tebing 4 jubin |
| | B Tiga Injap | x + y + z = 6, 2x + y − z = 1, x − y + 2z = 5 | (1, 2, 3) | tiga tangki | dek jambatan merentasi kolam asid 6 jubin |
| | C Troli Bijih (situasi) | A + B + C = 9, 2A + B = 8, A + 2C = 11 | (3, 2, 4) | tiga troli/penimbang | lif kargo ke tebing keluar |
| 3-2 Rel Memotong Cerun | D Rel dan Cerun | y = x + 1, y = x² − 1 | x = −1, 2 | dua pengapit pada rel: terpaut / tergantung / tertanam | rel jambatan merentasi asid 8 jubin |
| | E Plat Penutup | x + y = 7, xy = 12 | (3, 4) atau (4, 3) | dua meter (bingkai, bukaan) + plat berskala | dinding 7 jubin turun |
| | F Roda Lombong | y = x − 1, x² + y² = 25 | x = −3, 4 | rim roda, pengapit di dalam / di luar roda | lif |
| 3-3 Bilik Kawalan | G Lantai Selamat | y ≤ x + 1, x + y ≤ 9, y ≥ 1 (pilih tanda) | ≤ ≤ ≥ | rantau berlorek + garis sempadan; pelantar laluan menyala hanya dalam rantau | pelantar menyala di atas asid |
| | H Bilik Mesin (situasi) | x + y ≤ 7, y ≥ 2, y ≤ 2x | ≤ ≥ ≤ | sama; 2 jubin bagi setiap unit x | pelantar menyala |
| 3-4 Loji Optimum | K Garis Keuntungan | P = 3x + 2y atas rantau H | k = 19 di (5, 2) | rel gantri 3x + 2y = k: memotong rantau / tidak menyentuh / terletak di bucu | lif |
| | L Kos Minimum | C = 2x + 3y, x + 2y ≥ 8, 3x + y ≥ 9 | (2, 3), C = 13 | titik pelan + garis kos melaluinya | dinding turun |

Setiap stesen ada tepat satu jawapan (D, E, F: dua penyelesaian simetri, kedua-duanya diterima). Sistem B dan C
bebas (det ≠ 0), jadi penyelesaian unik dalam nombor nyata, bukan hanya dalam pilihan tuil. (Versi awal C
bergantung, Q + R = 2P, dan mempunyai tiga penyelesaian. Ia dibetulkan dan diuji.)

## Pengesahan (peraturan MASTER-PLAN, `tests/w3.test.mjs`)
- **Setiap level, dibaca semula daripada peta**:
  - mudah ditamatkan dengan semua stesen selesai (lompatan 5 % lebih lemah, model ketat, panjat ≤ 1.5, celah ≤ 2)
  - mustahil ditamatkan tanpa mana-mana satu stesen (lompatan 5 % lebih kuat, model murah hati)
- **Lantai rantau (3-3)**: rantau tersaur sebagai "bahagian atas rantau" gagal. Kekangan bawah (y ≥ 2) tidak
  mengubah lantai, jadi tanda salah masih boleh dilalui. Reka bentuk akhir: bilik ada **laluan pelantar
  tetap** pada titik kekisi, dan hanya titik yang memenuhi SEMUA kekangan menyala (pepejal).
  - Setiap 7 gabungan tanda salah bagi G dan H disahkan gagal, termasuk dalam peta.
  - Pelantar H selebar 2 jubin (bersambung menjadi tangga). Pelantar 1 jubin dengan celah 1 jubin ternyata
    mudah dilajak semasa berlari (ujian pelayar), lalu diubah.
- **Rahsia** (satu permata setiap level): dicapai dengan batu loncatan, disahkan dengan lompatan lemah.
- **Ujian pelayar** `tests/w3-playthrough.cjs` (fizik sebenar, empat level):
  - di setiap stesen, tuil awal (salah) dicuba dan pemain tidak dapat melepasi mekanisme
  - jawapan ditetapkan dengan papan kekunci (Q/E, Z/X, C/V, F), kemudian pemain berjalan, melompat dan
    memanjat hingga tamat
  - muat semula di tengah larian; simpanan Dunia 1 dan 2 tidak berubah
  - telefon landskap: panel tiga tuil tidak menutup butang Lompat
- **Integrasi** `tests/w3-integration.cjs`:
  - 3-1 dibuka selepas 2-3, kemudian mengikut turutan
  - butang MAIN/SAMBUNG menyambung ke Dunia 3
  - Peta Dunia, keadaan semua selesai
  - Learning Hub: dunia gabungan dengan `chapters: ['t4-3', 't5-7']`, dan setiap level menamakan babnya

## Belum dibuat / keputusan pemilik
- Bab elektif T5 Bab 7 kini wajib dalam laluan (3-3, 3-4). Isu terbuka MASTER-PLAN #3: wajib atau pilihan.
- Variasi main semula untuk Dunia 3 belum ada (set tetap).
- Imej Peta Dunia masih imej lama (zon Dunia 3 sudah ada di peta). Dunia 5–9 belum ada pada peta.

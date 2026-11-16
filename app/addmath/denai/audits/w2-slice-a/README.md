# World 2 · 2-1 · Stesen A — hirisan menegak (bilik ujian)

Buka: `/app/addmath/denai/lab-w2.html` (noindex, tiada pautan dari menu, World 1 tidak diubah).
Kawalan: A/D atau ←/→ bergerak, Space lompat, R kembali ke tuil. Di tuil: **Q / E** ubah a, **F** kunci / buka.
Telefon: butang ←, →, Lompat; panel tuil `a −`, `a +`, `Kunci`.

## Reka bentuk akhir (diubah daripada blueprint selepas semakan fizik)
- y = a(x − 3)² + 4, h dan k dikunci. Pilihan a: −2, −1, −½, ½, 1, 2. Jawapan a = −½.
- 1 unit = 1 jubin (54). Tebing kiri/kanan atas y = ½, air y = −1, tiang pancur (pepejal) x 2.5–3.5 sehingga bucu (3, 4).
- **Satu batu pada setiap x integer** (x = 1, 2, 4, 5; x = 3 ialah puncak tiang), bukan setiap ½ unit.
  Sebab: lompatan sebenar (puncak 92.3 unit = 1.71 jubin, jangkauan larian 210 unit = 3.9 jubin) terlalu
  murah hati; dengan batu setiap ½ unit, a = −1 dan a = −2 juga boleh dilalui, jadi matematik tidak penting.
- Batu di bawah air: kabur, tiada collision. Batu di atas y = 8.5: penanda "↑ y = …".

## Keputusan ujian (fizik sebenar dalam pelayar)
| a | Hasil | Sebab yang dilihat pemain |
|---|---|---|
| −½ | **berjaya**: tebing → (1,2) → (2,3½) → (3,4) → (4,3½) → (5,2) → tebing | naik maks 1½ jubin (81 unit, margin 11 unit + toleransi dek 8) |
| −1 | gagal | batu (2,3) perlu naik 2½ jubin; kaki pemain hanya sampai 43 unit di bawahnya |
| −2 | gagal | sampai batu (2,2), tetapi tiang setinggi 2 jubin menghalang (kurang 16 unit) |
| ½, 1, 2 | gagal | batu terendah 4 jubin di atas tebing |

Collision setiap batu: `body.top` = y lengkung tepat, lebar 54 = lukisan. Telefon (iPhone 13 landskap):
zoom ⅔, pandangan 1125 × 513 unit, graf y = 0…4 dan kedua-dua cincin kelihatan.
Fail: `ujian-pelayar.json`, `tests/quadratic.test.mjs`, `tests/w2-lab-smoke.cjs` (perlu pelayan tempatan port 8790).

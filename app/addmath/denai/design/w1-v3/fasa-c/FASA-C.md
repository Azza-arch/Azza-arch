# World 1 V3 · Fasa C — Level 1-1 "Bekalan untuk Jambatan Kampung"

Branch `claude/denai-w1-v3-l1` (dari `claude/denai-w1-v3-design`, asas `origin/main` ef9c3b5).
Level 1-2 dan 1-3 tidak diubah (`git diff` kosong untuk fail twin-*/inverse-*).

## Yang dibina
- **Masalah dahulu:** jambatan di Stesen Kayu ada 1 papan, 5 tempat kosong, tali rel dan satu papan
  patah tergantung. Misi muncul hanya apabila pemain sampai di tebing ("Jambatan ni kurang 5 papan.").
- **Stor Kayu berkunci:** pondok mesin lama jadi stor (dinding papan, pintu, papan tanda). Tanpa kunci:
  "Stor berkunci. Kuncinya mungkin dekat pondok lama." Tiada soalan matematik pada pintu.
- **Kunci:** di pondok lama atas gerbang akar (tangga akar sedia ada). Jalan pulang: turun di hujung timur
  gerbang terus ke tangga halaman stor (pencapaian **Jalan Pintas**). Kunci boleh diambil lebih awal jika
  pemain mengikut laluan atas semasa lalu.
- **Belian:** panel kompak di pintu stor — resit `C(x) = px + d`, butang −/+, jumlah serta-merta,
  bajet misi (berasingan daripada syiling). Butang **Beli sentiasa aktif** (tiada petunjuk automatik);
  pilihan tidak sah ditolak dengan mesej pendek **tanpa kehilangan wang**. 5 atau 6 papan diterima
  (asas); 5 papan memberi **Bajet Cermat**.
- **Pasang:** "E / Guna · Pasang 5 papan" di tebing → 5 papan jatuh ke tempat satu demi satu (debu, bunyi),
  rel kekal, jambatan boleh dipijak, checkpoint disimpan. Ringkasan: "Fungsi membantu kita merancang kos
  berdasarkan kuantiti." + "Lihat cara kira" pilihan (C(5) = 4(5) + 6 = 26).
- **Penjejak misi** kecil (kanan atas) dengan petunjuk 3 peringkat ("?"), inventori "🪵 5 papan · baki RM4".
- **D1:** soalan kilang papan dibuang; jeti siap sebagai laluan syiling pilihan.
- **D2:** pencapaian baharu Bajet Cermat & Jalan Pintas; Tepat Sekali & Tiga Cara kekal jika sudah
  diperoleh (label "(lama)"); landing kira 5 pencapaian aktif.
- **D5:** `L1_COURSE='v3'`, papan `denai_l1_time_v3` (perlu dicipta pemilik); v2 dilangkau.
- **D6:** variasi main semula K1 (RM4+6, bajet 30), K2 (RM3+9, bajet 25), K3 (RM5+5, bajet 32);
  pengembaraan pertama sentiasa K1.
- Zon "03 · Stesen Kayu", objektif & dialog dikemas kini; mesin pengangkat/probe tidak lagi aktif.

## Simpanan
`denai-save-v14` mendapat medan `quest` (pilihan). Simpanan lama: jambatan sudah dibina → kekal dibaiki;
belum dibina → misi bermula di penemuan; syiling/rahsia/checkpoint kekal. Kunci, belian dan papan
disimpan serta-merta dan tidak boleh digandakan; respawn/checkpoint/reload tidak menghilangkannya.
Main semula (Peta Dunia) me-reset misi level sahaja; pencapaian kekal.

## Keputusan ujian
| Ujian | Keputusan |
|---|---|
| Unit (16) termasuk `supply-quest.test.mjs` (model kos, variasi, keadaan misi, migrasi) | lulus |
| `l1-playthrough.cjs` (papan kekunci sebenar, larian penuh) ×2 | lulus · 70 s & 72 s (bot) · kaki di atas jambatan 1242/1242 · 0 ralat |
| `l1-v3-check.cjs` (variasi K2/K3, migrasi, pencapaian lama, main semula, telefon sentuh) | lulus · 0 ralat |
| rc, engagement, analytics, feel, menu, puzzle-clarity, bg-theme, banner, traversal, landing-count | lulus · 0 tulisan papan klasik · 0 peristiwa analitik |
| Dibuang (menguji ciri yang dibuang) | `sawmill.test.mjs`, `l1-redesign-check.cjs` |

## Had & catatan
- Masa di atas ialah bot; masa pemain sebenar belum diukur (sasaran reka bentuk 5–8 minit).
- Tangga sedia ada hanya melepaskan pemain di puncak jika W masih ditekan (bukan perubahan V3).
- Kod mesin lama (lift-panel, missions, b-control) masih ada tetapi tidak dicapai; boleh dibersihkan kemudian.
- Di telefon, panel stor menindih cip HUD kiri atas semasa membeli.
- Papan pendahulu kursus V3 tersembunyi sehingga `denai_l1_time_v3` dicipta.

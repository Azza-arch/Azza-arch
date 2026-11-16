# DENAI · Pelan Pertumbuhan 30 Hari (draf untuk semakan pemilik)

Dokumen berkaitan dalam folder ini: `EMAIL-OPTIN-SPEC.md`, `OFFERS.md`, `CONTENT-30-DAY.md`,
`TEACHER-PILOT-PAGE.md`, `MEDIA-KIT.md`, `waitlist-prototype.html` (prototaip, tidak berfungsi).

Prinsip: permainan kekal percuma; tiada nombor, testimoni, ranking atau hasil pembelajaran
yang direka; tiada bayaran, e-mel atau hubungan penaja tanpa kelulusan pemilik.

## 0. Keadaan projek yang disahkan (16 Nov 2026)

| Perkara | Keadaan sebenar |
|---|---|
| Hosting | Cloudflare Pages, statik sahaja (`_headers`, `_redirects`). **Tiada backend / Pages Functions.** CSP `connect-src` hanya `self` + `1fd1d5.playfabapi.com`; `Permissions-Policy: payment=()`. |
| Produksi (`origin/main` 9ea9968) | Menu MAIN/SAMBUNG, Peta Dunia, 1-1 lama, 1-2, 1-3, papan `denai_l1_time`. |
| Belum di-merge (bertingkat) | `claude/denai-rc1` → `claude/denai-engagement-v1` → `claude/denai-game-feel-v2` → `claude/denai-growth-30d` (branch ini). Merge mengikut susunan ini sahaja. |
| Tidak untuk dikeluarkan | `claude/denai-w2-slice` (World 2), `claude/denai-map-masterplan-v2` (dokumen), `w1-environment` / `l1-redesign` asal (sudah di-cherry-pick ke RC). |
| Simpanan pemain | `localStorage` sahaja: `denai-profile-v1`, `denai-save-v14`, `denai-campaign-v1`, `denai-l3-campaign-v1`. Tiada akaun/awan. |
| Landing `/denai/` | Masih tulis "Level 1-2: akan datang" — lapuk selepas RC dikeluarkan. |
| Metrik sebenar | **Belum ada yang boleh dipercayai.** `denai_players` dan `denai_l1_time_v2` belum wujud dalam PlayFab (404). Bilangan peserta leaderboard ≠ bilangan pemain unik (penyertaan adalah pilihan). |

## 1. Penilaian keupayaan PlayFab

| Keperluan | PlayFab hari ini | Jurang / tindakan |
|---|---|---|
| Identiti tanpa daftar | `LoginWithCustomID` dengan ID rawak peranti — sudah digunakan | Seorang = satu pelayar/peranti. |
| Nama samaran awam | `UpdateUserTitleDisplayName` (unik) — sudah digunakan | — |
| Leaderboard | Statistic/Leaderboard v2, Min, menaik — `denai_l1_time` wujud | Cipta `denai_l1_time_v2` (lihat `../PLAYFAB-SETUP.md`). |
| Kiraan pemain unik | `EntryCount` papan `denai_players` | Cipta `denai_players`. |
| Peristiwa analitik | Event API `Event/WriteEvents` (namespace `custom.*`), entity token klien | **Perlu disahkan pemilik:** polisi API membenarkan klien menulis peristiwa; peristiwa kelihatan dalam Game Manager (PlayStream / Data Explorer). Had dan harga ikut pelan semasa PlayFab — semak dalam Game Manager. |
| Papan pemuka pemilik | Game Manager (log masuk akaun pemilik) — paparan pemain, PlayStream, Data Explorer jika tersedia untuk pelan title | Halaman statik **tidak boleh** menjadi papan pemuka peribadi yang selamat (perlukan kunci rahsia). Gunakan Game Manager. |
| E-mel / pemasaran | PlayFab boleh menyimpan contact email pemain, tetapi bukan alat persetujuan pemasaran (double opt-in, unsubscribe, rekod persetujuan) | Guna penyedia newsletter khusus; **jangan** simpan e-mel dalam PlayFab atau `localStorage`. |
| Bayaran | Tiada | Pautan keluar ke halaman checkout yang dihoskan penyedia (selepas kelulusan). |

## 2. Fasa A — Pelan instrumentasi analitik (DILAKSANA, DIMATIKAN)

Kod: `src/v14/analytics.js` (lalai `analytics.enabled:false` dalam `leaderboard/config.js`).

| Peristiwa | Bila | Medan (semua dari senarai tetap) |
|---|---|---|
| `game_started` | Pelancaran pertama dalam satu sesi halaman | `entry`: menu / continue |
| `level_started` | MAIN, Peta Dunia, "Teruskan ke level seterusnya" | `level` w1-l1/l2/l3, `mode` play/continue/replay/next |
| `level_replayed` | Main semula dari Peta Dunia | `level` |
| `level_completed` | Kemenangan automatik sebenar (bukan mod teroka) | `level`, `duration_s` (baldi 30…3600), `coins`, `secrets`, `ranked_eligible`, `first_completion` |
| `leaderboard_joined` | Selepas PlayFab menerima nama samaran | `level` |
| `result_shared` | Web Share berjaya / klik "Simpan gambar" | `level`, `method` native/image |
| `update_opt_in` | **Tidak dipancar** sehingga penyedia e-mel sebenar mengesahkan (double opt-in) | `source`, `channel` |
| `purchase_completed` | **Ditolak dalam kod** selagi `purchasesLive:false` (tiada checkout) | `offer`, `currency`, `amount_bucket` |

Privasi: hanya akaun PlayFab tanpa nama; tiada nama samaran, e-mel, teks bebas, URL, lokasi atau
peranti; `session` rawak setiap muat halaman (tidak disimpan); Global Privacy Control / Do Not
Track dihormati; pelayar automasi tidak pernah sampai ke PlayFab. Peristiwa tidak mencetuskan
log masuk sendiri.

Bukti: `tests/analytics.test.mjs` (5 ujian; seluruh suite unit 13/13 lulus) dan
`tests/analytics-check.cjs` — binaan lalai 0 peristiwa; dipaksa hidup: 8 peristiwa dijangka,
0 medan luar senarai, nama samaran tidak bocor; GPC: 0 peristiwa.

Untuk mengaktifkan (pemilik): sahkan polisi API + paparan peristiwa dalam Game Manager →
kemas kini notis privasi dalam Tetapan → tukar `enabled:true` → uji dengan satu peranti sebenar.

### Papan pemuka pemilik (cadangan pertanyaan, perlu disahkan dalam Data Explorer)

```kusto
// Funnel 7 hari: pemain unik setiap peringkat
['events.all']
| where Timestamp > ago(7d) and FullName_Namespace == "custom.denai"
| extend level = tostring(EventData.Payload.level)
| summarize players = dcount(Entity_Id) by FullName_Name, level
```

```kusto
// Pengekalan D1/D7: pemain yang kembali N hari selepas game_started pertama
let first = ['events.all'] | where FullName_Name == "game_started" | summarize d0 = startofday(min(Timestamp)) by Entity_Id;
['events.all'] | where FullName_Namespace == "custom.denai"
| join kind=inner first on Entity_Id
| extend day = datetime_diff('day', startofday(Timestamp), d0)
| summarize returned = dcount(Entity_Id) by day | where day in (1, 7)
```

Nama jadual/lajur di atas mengikut skema Data Explorer PlayFab yang lazim; semak sebelum guna.

## 3. Metrik funnel pertumbuhan

| Peringkat | Metrik | Sumber |
|---|---|---|
| Kesedaran | Lawatan `/denai/`, sumber trafik | Cloudflare Web Analytics (tanpa kuki) — perlu diaktifkan pemilik + tambah hos beacon pada CSP |
| Aktivasi | `game_started` ÷ lawatan landing | Analitik + CF |
| Pembelajaran teras | `level_completed w1-l1` ÷ `level_started w1-l1` | Analitik |
| Kemajuan | Selesai 1-2 ÷ selesai 1-1; selesai 1-3 ÷ selesai 1-2 | Analitik |
| Pengekalan | D1, D7 (pemain unik kembali) | Analitik |
| Komuniti | `leaderboard_joined` ÷ selesai 1-1 berkelayakan; pemain unik (`denai_players`) | Analitik + PlayFab |
| Rujukan organik | `result_shared` ÷ selesai | Analitik |
| Minat | Pendaftar notifikasi disahkan (double opt-in) | Penyedia e-mel |
| Kesanggupan bayar | Klik tawaran, pembayaran sebenar | Penyedia bayaran (selepas kelulusan) |

Garis dasar: **belum diketahui**. Minggu pertama selepas pengaktifan = garis dasar; sasaran
ditetapkan selepas itu, bukan sekarang.

## 4. Fasa C — Leaderboard & rujukan (semakan)

Sudah ada dalam `engagement-v1`: persetujuan nama samaran, kedudukan disahkan pelayan, kad
keputusan pilihan (tanpa kedudukan jika tidak disahkan), tiada rekod contoh dalam produksi.
Tiada perubahan diperlukan.

Rujukan: **tidak dilaksanakan**. Cadangan jika mahu kemudian: kod rujukan = cincang ID entiti
PlayFab (tiada nama); dikreditkan sekali sahaja bagi setiap akaun baharu yang menyelesaikan 1-1,
disahkan di pelayan (CloudScript/Azure Function), tanpa papan ranking rujukan, dan diterangkan
secara terbuka kepada pemain. Sebelum itu, kongsi pautan biasa dengan `?src=kad` untuk
mengukur kempen, bukan individu.

## 5. Kebergantungan teknikal & risiko

| # | Kebergantungan / risiko | Kesan | Mitigasi |
|---|---|---|---|
| 1 | 4 branch bertingkat belum di-merge | Ciri tertangguh; konflik jika merge tidak ikut susunan | Merge rc1 → engagement-v1 → game-feel-v2 → growth-30d; uji `rc-check` selepas setiap satu |
| 2 | `denai_l1_time_v2`, `denai_players` belum dicipta | Kiraan pemain & ranking kursus baharu tersembunyi | Langkah dalam `PLAYFAB-SETUP.md` |
| 3 | Polisi API Event belum disahkan | Analitik gagal senyap (barisan terhad 50) | Uji satu peranti sebenar sebelum `enabled:true` |
| 4 | Tiada backend untuk e-mel | Tidak boleh kumpul e-mel dengan selamat | Penyedia newsletter + double opt-in (lihat spesifikasi) |
| 5 | Pengguna bawah umur | Risiko persetujuan | E-mel hanya daripada dewasa/ibu bapa; tiada data pelajar dalam pilot guru |
| 6 | Data PDPA 2010 (dipinda 2024) | Kewajipan notis, keselamatan, hak akses | Notis privasi, penyedia dengan perjanjian pemprosesan, polisi simpanan |
| 7 | Pengesahan skor sisi klien | Skor boleh dipalsukan | Pengesahan pelayan kemudian; jangan janji hadiah berdasarkan ranking |
| 8 | Akaun PlayFab ujian (<15, tanpa nama/skor) dicipta semasa ujian 16 Nov | Kiraan pemain sedikit tercemar jika dikira kemudian | `denai_players` hanya dikira selepas 15 s main, dan akaun itu tiada statistik |
| 9 | CSP perlu dilonggarkan untuk penyedia luar | Risiko keselamatan jika terlalu luas | Tambah hos tepat sahaja (tiada wildcard) |
| 10 | Landing lapuk | Mesej salah kepada pelawat | Kemas kini selepas RC dikeluarkan |

## 6. Keutamaan pelaksanaan dicadangkan

1. **Minggu 1:** semak & merge branch bertingkat; cipta `denai_l1_time_v2`, `denai_players`;
   kemas kini landing; aktifkan Cloudflare Web Analytics.
2. **Minggu 1–2:** sahkan Event API → hidupkan analitik → kumpul garis dasar 7 hari.
3. **Minggu 2:** pilih penyedia e-mel; laksana borang sebenar (landing dahulu, kemudian panel
   kemenangan) mengikut `EMAIL-OPTIN-SPEC.md`.
4. **Minggu 2–4:** enjin kandungan (`CONTENT-30-DAY.md`) — rakam secara pukal.
5. **Minggu 3:** sediakan bahan pilot guru; jalankan 1–3 pilot rakan reka bentuk **percuma** dahulu.
6. **Minggu 4:** semak data; hanya selepas itu putuskan tawaran penyokong berbayar dan harga
   pilot; kit media diisi dengan metrik sebenar.

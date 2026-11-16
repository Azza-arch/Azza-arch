# DENAI · Spesifikasi notifikasi e-mel berasaskan persetujuan

Status: **reka bentuk sahaja.** Tiada infrastruktur selamat untuk data peribadi pada hosting
semasa (Cloudflare Pages statik). Prototaip `waitlist-prototype.html` dimatikan sepenuhnya:
tiada skrip, tiada `action`, semua medan `disabled`.

## Matlamat
- Beritahu orang yang berminat apabila dunia/level baharu diterbitkan.
- Bermain dan menyertai leaderboard **tidak** memerlukan e-mel.
- Notifikasi pelancaran dan maklumat promosi ialah dua persetujuan berasingan.

## Siapa boleh mendaftar
Dewasa sahaja: ibu bapa/penjaga, guru/pusat tuisyen, atau pelajar berumur 18+.
Pengguna utama DENAI ialah pelajar Tingkatan 4 (bawah umur), jadi borang meminta pelajar bawah
18 menyuruh ibu bapa/penjaga mendaftar dengan e-mel mereka. Tiada pengumpulan tarikh lahir —
hanya pengesahan kotak semak (dewasa atau ibu bapa/penjaga). Ini selaras dengan prinsip PDPA 2010
(dipinda 2024) dan amalan biasa untuk kanak-kanak (contohnya COPPA/GDPR untuk pelawat luar
negara); pemilik patut mendapatkan nasihat undang-undang sebelum pelancaran.

## Medan
| Medan | Wajib | Nota |
|---|---|---|
| E-mel | ya | Satu-satunya data hubungan. |
| Peranan | ya | Ibu bapa/penjaga · Guru/pusat tuisyen · Pelajar 18+ |
| Pengesahan umur/penjaga | ya | Kotak semak, tidak ditanda secara lalai. |
| Notifikasi pelancaran | ya (tujuan borang) | Tidak ditanda secara lalai; maks. 1 e-mel sebulan. |
| Maklumat program/sokongan (promosi) | tidak | Kotak berasingan, tidak ditanda secara lalai. |
| Sumber | auto | `landing` atau `victory` (bukan data peribadi). |

Tiada nama, sekolah, kelas, nama samaran permainan atau ID PlayFab dikaitkan dengan e-mel.

## Aliran
1. Borang → penyedia e-mel menyimpan status **belum disahkan**.
2. E-mel pengesahan (double opt-in). Tiada e-mel lain sehingga pautan diklik.
3. Selepas sah: e-mel selamat datang ringkas + pautan berhenti langganan.
4. Setiap e-mel: pautan berhenti langganan satu klik + pautan urus pilihan.
5. Hanya selepas langkah 2 berjaya, permainan boleh memancar `update_opt_in` (tanpa e-mel dalam
   peristiwa).

## Penempatan
- **Landing `/denai/`:** bahagian "Dunia 2" — kad kecil "Beritahu saya bila dibuka".
- **Dalam permainan:** pada panel kemenangan **selepas** langkah leaderboard selesai atau
  dilangkau, sebagai pautan teks "Beritahu ibu bapa/guru bila Dunia 2 dibuka" yang membuka
  halaman borang dalam tab baharu. Tidak dipaparkan semasa permainan, tidak dipaparkan lagi
  jika ditutup, dan tidak menghalang butang Teruskan.

## Notis privasi (kandungan minimum)
Data dikumpul, tujuan, pemproses (nama penyedia), lokasi penyimpanan, tempoh simpanan (padam
30 hari selepas berhenti; padam selepas 24 bulan tidak aktif), hak akses/pembetulan/pemadaman,
cara tarik balik persetujuan, alamat hubungan pemilik. E-mel tidak dijual, dikongsi atau
dipaparkan secara umum.

## Pilihan integrasi (pemilik pilih satu)
| Pilihan | Cara | Kelebihan | Kerja |
|---|---|---|---|
| A. Borang dihoskan penyedia (Buttondown, MailerLite, Brevo dll.) | Pautan keluar dari landing/permainan ke halaman borang penyedia | Tiada kod pelayan; double opt-in & unsubscribe terbina | Rendah. Tiada perubahan CSP jika pautan keluar. |
| B. Cloudflare Pages Function → API penyedia | `POST /api/subscribe` di domain sendiri, kunci API dalam rahsia Cloudflare | Borang dalam reka bentuk DENAI | Sederhana: Function, had kadar, Turnstile anti-bot, CSP `form-action`/`connect-src 'self'` sudah membenarkan |
| C. PlayFab contact email | — | — | **Tidak disyorkan**: tiada pengurusan persetujuan pemasaran |

Syor: mulakan dengan **A** (paling sedikit risiko), pindah ke **B** jika kadar penukaran rendah.

## Syarat sebelum diaktifkan
Penyedia dipilih & akaun milik pemilik · perjanjian pemprosesan data/terma penyedia disemak ·
notis privasi diterbitkan · e-mel pengesahan & unsubscribe diuji dengan alamat sebenar pemilik ·
`update_opt_in` hanya selepas pengesahan · kelulusan pemilik.

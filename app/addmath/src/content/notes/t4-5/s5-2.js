// Bab 5 · 5.2 Janjang Geometri (SP 5.2.1–5.2.5). Original.
// DSKP: derive Tₙ; derive Sₙ via Sₙ − rSₙ or a graphical representation;
// Tₙ = Sₙ − Sₙ₋₁; derive S∞ and use it; NOT included: combined AP/GP,
// grouped sequences such as (1), (2,3), (4,5,6), …
const R = String.raw;
const A = 8, M = 12;

export const S5_2 = {
  id: '5.2', sk: '5.2', title: 'Janjang Geometri', sp: ['5.2.1', '5.2.2', '5.2.3', '5.2.4', '5.2.5'], status: 'review', minutes: 55,
  sections: [
    { kind: 'intro', title: 'Bola yang melantun', html: R`
      <p>Sebiji bola dijatuhkan dari ketinggian 10 m. Setiap kali melantun, ia naik semula \(\tfrac{3}{5}\) daripada ketinggian sebelumnya: 6 m, 3.6 m, 2.16 m, … Setiap ketinggian ialah ketinggian sebelumnya <strong>didarab</strong> dengan nombor yang sama.</p>
      <p>Jujukan seperti ini dipanggil <strong>janjang geometri</strong>. Ia digunakan untuk pertumbuhan, susut nilai dan pantulan. Menariknya, walaupun bola melantun "selama-lamanya", jumlah jarak yang dilaluinya adalah terhingga, dan anda akan dapat mengiranya.</p>` },
    { kind: 'concept', title: 'Mengenal pasti janjang geometri', sp: ['5.2.1'], html: R`
      <p>Suatu jujukan ialah <strong>janjang geometri</strong> (JG) jika nisbah setiap sebutan kepada sebutan sebelumnya adalah <strong>sama</strong>. Nisbah ini dipanggil <strong>nisbah sepunya</strong>, \(r\):</p>
      \[r = \frac{T_2}{T_1} = \frac{T_3}{T_2} = \cdots\]
      <p>Contoh: 3, 6, 12, 24: nisbahnya 2, 2, 2, jadi JG dengan \(r = 2\). Jujukan 81, −27, 9, −3 juga JG (\(r = -\tfrac{1}{3}\)); tanda berselang-seli apabila \(r\) negatif.</p>` },
    { kind: 'concept', title: 'Rumus sebutan ke-n', sp: ['5.2.2'], html: R`
      <p>\(T_1 = a\), \(T_2 = ar\), \(T_3 = ar^2\), … Sebutan ke-\(n\) telah didarab dengan \(r\) sebanyak \((n - 1)\) kali:</p>
      \[T_n = ar^{n-1}\]` },
    { kind: 'concept', title: 'Rumus hasil tambah n sebutan pertama', sp: ['5.2.3'], html: R`
      <p>Tulis \(S_n\), kemudian darab dengan \(r\). Hampir semua sebutan sama, cuma beranjak satu tempat:</p>
      \[\begin{aligned} S_n &= a + ar + ar^2 + \cdots + ar^{n-1} \\ rS_n &= \phantom{a + {}} ar + ar^2 + \cdots + ar^{n-1} + ar^n \end{aligned}\]
      <p>Tolak (\(S_n - rS_n\)): semua sebutan tengah terbatal, dan tinggal \(S_n(1 - r) = a - ar^n\):</p>
      \[S_n = \frac{a(1 - r^n)}{1 - r} = \frac{a(r^n - 1)}{r - 1}, \qquad r \ne 1\]
      <p>Kedua-dua bentuk sama; bentuk kedua lebih kemas apabila \(r > 1\). Seperti JA, \(T_n = S_n - S_{n-1}\).</p>` },
    { kind: 'concept', title: 'Hasil tambah hingga ketakterhinggaan', sp: ['5.2.4'], html: R`
      <p>Jika \(-1 < r < 1\), maka \(r^n\) menjadi semakin hampir kepada 0 apabila \(n\) bertambah (contohnya \(0.5^{10} \approx 0.001\)). Jadi dalam \(S_n = \dfrac{a(1 - r^n)}{1 - r}\), sebutan \(r^n\) "hilang":</p>
      \[S_\infty = \frac{a}{1 - r}, \qquad |r| < 1\]
      <p>Jika \(|r| \ge 1\), sebutan tidak mengecil, jadi hasil tambah tidak menghampiri sebarang nilai dan \(S_\infty\) tidak wujud.</p>
      <p><strong>Perpuluhan berulang</strong> ialah \(S_\infty\): \(0.444\ldots = 0.4 + 0.04 + 0.004 + \cdots = \dfrac{0.4}{1 - 0.1} = \dfrac{4}{9}\).</p>` },
    { kind: 'visual', title: 'Hasil tambah separa menghampiri S∞', html: R`<p>JG dengan \(a = 8\). Titik-titik ialah \((n, S_n)\) dan garis putus-putus ialah \(S_\infty = \dfrac{8}{1 - r}\). Ubah \(r\). Apa yang berlaku apabila \(r\) negatif? Apabila \(r\) hampir 1?</p>`,
      spec: { type: 'plot', x: [0, 13], y: [0, 85], gridX: 1, gridY: 10, labelStepX: 2, labelStepY: 20, xLabel: 'n', yLabel: 'Sₙ', params: [{ name: 'r', label: R`\(r\)`, min: -0.8, max: 0.9, step: 0.1, value: 0.5 }],
        curves: [{ f: (x, p) => A / (1 - p.r), dashed: true, color: '#D9822B' }],
        points: Array.from({ length: M }, (_, i) => ({ at: (p) => [i + 1, (A * (1 - p.r ** (i + 1))) / (1 - p.r)] })),
        readout: (p, { fmt }) => { const r = +p.r.toFixed(1); if (r === 0) return R`\(r = 0\): selepas sebutan pertama semuanya sifar, jadi \(S_n = 8\).`; const S12 = (A * (1 - r ** 12)) / (1 - r); return R`\(S_\infty = \dfrac{8}{1 - (${fmt(r)})} = ${fmt(+(A / (1 - r)).toFixed(3))}\); \(S_{12} = ${fmt(+S12.toFixed(3))}\). ${r < 0 ? 'r negatif: Sₙ berayun di atas dan di bawah S∞ sambil menghampirinya.' : 'Sₙ menaik dan menghampiri S∞ tetapi tidak melepasinya.'}`; } },
      alt: R`Bagi a = 8 dan r = 0.5, hasil tambah separa ialah 8, 12, 14, 15, 15.5, … menghampiri S∞ = 16. Bagi r = −0.5, ia ialah 8, 4, 6, 5, 5.5, … berayun dan menghampiri 16/3 ≈ 5.333. Bagi r = 0.9, hasil tambah naik perlahan ke arah 80.` },
    { kind: 'concept', title: 'Menyelesaikan masalah janjang geometri', sp: ['5.2.5'], html: R`
      <p>Situasi "darab dengan faktor yang sama" ialah JG: pertumbuhan peratus tetap (\(r = 1 + \text{kadar}\)), susut nilai (\(r = 1 - \text{kadar}\)) dan pantulan. Untuk mencari \(n\) apabila \(r^n\) terlibat, gunakan logaritma (Bab 4). Kemudian tafsir \(n\) sebagai integer dalam konteks.</p>` },
    { kind: 'formula', items: [
      { tex: R`T_n = ar^{n-1}`, html: R`\(a\): sebutan pertama; \(r\): nisbah sepunya.` },
      { tex: R`S_n = \frac{a(1 - r^n)}{1 - r} = \frac{a(r^n - 1)}{r - 1}\ (r \ne 1), \qquad S_\infty = \frac{a}{1 - r}\ (|r| < 1)`, html: R`\(S_\infty\) hanya wujud jika \(-1 < r < 1\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['5.2.1'], question: R`Tunjukkan bahawa 3, 6, 12, 24, … ialah JG dan nyatakan \(r\).`, given: R`jujukan`, find: R`justifikasi dan \(r\)`, method: R`Bandingkan nisbah berturut-turut.`,
        steps: [{ do: R`\(\tfrac{6}{3} = \tfrac{12}{6} = \tfrac{24}{12} = 2\)` }],
        check: R`Nisbah sama setiap kali ✓`, conclusion: R`JG dengan \(r = 2\).` },
      { level: 'sederhana', sp: ['5.2.2'], question: R`Bagi JG 2, 6, 18, …, cari \(T_8\) dan tentukan sebutan keberapa yang bernilai 486.`, given: R`\(a = 2, r = 3\)`, find: R`\(T_8\); \(n\)`, method: R`Rumus \(T_n\).`,
        steps: [{ do: R`\(T_8 = 2(3)^7 = 4374\)` }, { do: R`\(2(3)^{n-1} = 486 \Rightarrow 3^{n-1} = 243 = 3^5 \Rightarrow n = 6\)` }],
        check: R`2, 6, 18, 54, 162, 486: sebutan ke-6 ✓`, conclusion: R`\(T_8 = 4374\); 486 ialah sebutan ke-6.` },
      { level: 'sederhana', sp: ['5.2.3'], question: R`Cari hasil tambah 8 sebutan pertama JG 2, 6, 18, …`, given: R`\(a = 2, r = 3, n = 8\)`, find: R`\(S_8\)`, method: R`\(r > 1\), jadi guna \(\dfrac{a(r^n - 1)}{r - 1}\).`,
        steps: [{ do: R`\(S_8 = \dfrac{2(3^8 - 1)}{3 - 1} = 3^8 - 1 = 6560\)` }],
        check: R`\(S_8 = S_7 + T_8 = 2186 + 4374 = 6560\) ✓`, conclusion: R`\(S_8 = 6560\).` },
      { level: 'mencabar', sp: ['5.2.4'], question: R`Cari hasil tambah hingga ketakterhinggaan bagi 24, 12, 6, …, dan ungkapkan \(0.444\ldots\) sebagai pecahan.`, given: R`\(a = 24, r = \tfrac{1}{2}\); \(0.4 + 0.04 + \cdots\)`, find: R`\(S_\infty\); pecahan`, method: R`\(S_\infty = \dfrac{a}{1 - r}\).`,
        steps: [{ do: R`\(S_\infty = \dfrac{24}{1 - \frac{1}{2}} = 48\)` }, { do: R`\(0.444\ldots\): \(a = 0.4\), \(r = 0.1\), jadi \(S_\infty = \dfrac{0.4}{0.9} = \dfrac{4}{9}\)` }],
        check: R`\(4 \div 9 = 0.444\ldots\) ✓`, conclusion: R`48; \(\tfrac{4}{9}\).` },
      { level: 'mencabar', sp: ['5.2.5'], question: R`Bola dalam pengenalan dijatuhkan dari 10 m dan melantun \(\tfrac{3}{5}\) ketinggian sebelumnya setiap kali. Cari jumlah jarak menegak yang dilalui sehingga bola berhenti.`, given: R`jatuh 10 m; lantunan 6, 3.6, …`, find: R`jumlah jarak`, method: R`Setiap lantunan dilalui dua kali (naik dan turun); guna \(S_\infty\).`,
        steps: [{ do: R`Ketinggian lantunan: JG dengan \(a = 6\), \(r = 0.6\), jadi \(S_\infty = \dfrac{6}{0.4} = 15\)` }, { do: R`Jumlah \(= 10 + 2(15) = 40\) m`, why: R`Jatuhan pertama 10 m dilalui sekali; setiap lantunan naik dan turun.` }],
        check: R`Simulasi 20 lantunan memberi \(\approx 39.99\) m ✓`, conclusion: R`40 m.` },
      { level: 'mencabar', sp: ['5.2.5'], question: R`Sebuah kereta berharga RM80 000 menyusut nilai 15% setahun. Selepas berapa tahun penuh nilainya kurang daripada RM40 000?`, given: R`nilai selepas \(n\) tahun \(= 80\,000(0.85)^n\)`, find: R`\(n\) terkecil`, method: R`Ketaksamaan dengan logaritma.`,
        steps: [{ do: R`\(0.85^n < 0.5\)` }, { do: R`\(n > \dfrac{\lg 0.5}{\lg 0.85} = 4.265\)`, why: R`\(\lg 0.85 < 0\), jadi tanda ketaksamaan terbalik apabila membahagi.` }, { do: R`\(n = 5\)` }],
        check: R`\(80\,000(0.85)^4 = 41\,760.50\) dan \(80\,000(0.85)^5 = 35\,496.42\) ✓`, conclusion: R`Selepas 5 tahun.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(T_n = ar^n\)`, why: R`Sebutan pertama belum didarab dengan \(r\).`, fix: R`\(T_n = ar^{n-1}\).` },
      { wrong: R`Menggunakan \(S_\infty\) untuk 2, 6, 18, …`, why: R`\(r = 3\), jadi sebutan semakin besar.`, fix: R`\(S_\infty\) hanya wujud jika \(|r| < 1\).` },
      { wrong: R`\(n > \dfrac{\lg 0.5}{\lg 0.85}\) ditulis sebagai \(n < \ldots\), atau sebaliknya.`, why: R`Membahagi dengan nombor negatif membalikkan ketaksamaan.`, fix: R`Semak dengan menggantikan nilai \(n\) ke dalam soalan asal.` },
    ] },
    { kind: 'summary', points: [R`JG: nisbah sepunya \(r\) yang tetap.`, R`\(T_n = ar^{n-1}\); \(S_n = \tfrac{a(1-r^n)}{1-r}\) (diterbitkan melalui \(S_n - rS_n\)).`, R`\(S_\infty = \tfrac{a}{1-r}\) hanya bagi \(|r| < 1\); perpuluhan berulang ialah contoh \(S_\infty\).`] },
    { kind: 'next', html: R`<p>Pertumbuhan JG ialah fungsi eksponen. Dalam <strong>Bab 6 Hukum Linear</strong>, hubungan eksponen seperti ini ditukar kepada garis lurus menggunakan logaritma.</p>`, links: [{ href: '#/bab/t4-5', label: 'Kembali ke Bab 5' }] },
  ],
};

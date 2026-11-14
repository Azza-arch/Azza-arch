// Bab 5 · 5.1 Janjang Aritmetik (SP 5.1.1–5.1.4). Original.
// DSKP: real-life situations; problem-based learning; derive Tₙ and Sₙ;
// Sₙ = n/2[2a + (n − 1)d], Sₙ = n/2[a + l], Tₙ = Sₙ − Sₙ₋₁; problems and
// situations based on an AP.
const R = String.raw;
const N = 10;

export const S5_1 = {
  id: '5.1', sk: '5.1', title: 'Janjang Aritmetik', sp: ['5.1.1', '5.1.2', '5.1.3', '5.1.4'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Kerusi di dewan', html: R`
      <p>Barisan pertama sebuah dewan mempunyai 20 kerusi, dan setiap barisan berikutnya mempunyai 2 kerusi lebih: 20, 22, 24, 26, … Berapakah kerusi di barisan ke-25? Berapakah jumlah kerusi dalam 25 barisan?</p>
      <p>Mengira satu per satu memang boleh, tetapi lambat. Corak "tambah nombor yang sama setiap kali" ini dipanggil <strong>janjang aritmetik</strong>, dan ada rumus untuk menjawab kedua-dua soalan dengan pantas.</p>` },
    { kind: 'concept', title: 'Mengenal pasti janjang aritmetik', sp: ['5.1.1'], html: R`
      <p>Suatu jujukan ialah <strong>janjang aritmetik</strong> (JA) jika beza antara setiap sebutan dengan sebutan sebelumnya adalah <strong>sama</strong>. Beza ini dipanggil <strong>beza sepunya</strong>, \(d\):</p>
      \[d = T_2 - T_1 = T_3 - T_2 = \cdots\]
      <p><strong>Justifikasi:</strong> untuk menunjukkan suatu jujukan ialah JA, kira beberapa beza berturut-turut dan tunjukkan semuanya sama. Contohnya 7, 11, 15, 19: bezanya 4, 4, 4, jadi JA dengan \(d = 4\). Tetapi 2, 4, 8, 16: bezanya 2, 4, 8, tidak sama, jadi bukan JA.</p>
      <p>\(d\) boleh negatif (jujukan menurun, contohnya 30, 25, 20, …) atau pecahan.</p>` },
    { kind: 'concept', title: 'Rumus sebutan ke-n', sp: ['5.1.2'], html: R`
      <p>Mulakan dengan \(a\), kemudian tambah \(d\) berulang kali:</p>
      \[T_1 = a,\quad T_2 = a + d,\quad T_3 = a + 2d,\quad \ldots\]
      <p>Sebutan ke-\(n\) telah menerima \(d\) sebanyak \((n - 1)\) kali, kerana sebutan pertama belum menerima apa-apa. Maka:</p>
      \[T_n = a + (n - 1)d\]` },
    { kind: 'visual', title: 'Sebutan JA berada pada garis lurus', html: R`<p>Titik-titik ialah \((n, T_n)\) bagi \(n = 1, 2, \ldots, 10\). Ubah \(a\) dan \(d\). Kenapa titik-titik sentiasa segaris? Kerana \(T_n = dn + (a - d)\) ialah fungsi linear dalam \(n\).</p>`,
      spec: { type: 'plot', x: [0, 11], y: [-30, 50], gridX: 1, gridY: 10, labelStepX: 2, labelStepY: 20, xLabel: 'n', yLabel: 'Tₙ', params: [{ name: 'a', label: R`\(a\)`, min: -5, max: 10, step: 1, value: 2 }, { name: 'd', label: R`\(d\)`, min: -3, max: 4, step: 0.5, value: 3 }],
        points: Array.from({ length: N }, (_, i) => ({ at: (p) => [i + 1, p.a + i * p.d] })),
        readout: (p, { fmt }) => { const S = (N / 2) * (2 * p.a + (N - 1) * p.d); return R`\(T_{10} = ${fmt(p.a)} + 9(${fmt(p.d)}) = ${fmt(p.a + 9 * p.d)}\); \(S_{10} = \tfrac{10}{2}[2(${fmt(p.a)}) + 9(${fmt(p.d)})] = ${fmt(S)}\).`; } },
      alt: R`Sepuluh titik (n, Tₙ) bagi janjang aritmetik. Dengan a = 2 dan d = 3, titiknya (1, 2), (2, 5), (3, 8), …, (10, 29), semuanya pada satu garis lurus. T₁₀ = 29 dan S₁₀ = 155. Jika d negatif, garis itu menurun.` },
    { kind: 'concept', title: 'Rumus hasil tambah n sebutan pertama', sp: ['5.1.3'], html: R`
      <p>Tulis hasil tambah dua kali, sekali ke hadapan dan sekali ke belakang (\(l\) ialah sebutan terakhir):</p>
      \[\begin{aligned} S_n &= a + (a + d) + \cdots + (l - d) + l \\ S_n &= l + (l - d) + \cdots + (a + d) + a \end{aligned}\]
      <p>Tambahkan secara menegak. Setiap pasangan memberi \(a + l\), dan ada \(n\) pasangan. Jadi \(2S_n = n(a + l)\):</p>
      \[S_n = \frac{n}{2}(a + l) = \frac{n}{2}\left[2a + (n - 1)d\right]\]
      <p>Bentuk kedua diperoleh dengan menggantikan \(l = a + (n - 1)d\). Satu lagi hubungan berguna: \(T_n = S_n - S_{n-1}\), kerana \(S_n\) dan \(S_{n-1}\) hanya berbeza pada sebutan terakhir.</p>` },
    { kind: 'concept', title: 'Menyelesaikan masalah janjang aritmetik', sp: ['5.1.4'], html: R`
      <ol><li>Kenal pasti situasi sebagai JA: adakah sesuatu bertambah atau berkurang dengan jumlah yang sama?</li><li>Tentukan \(a\), \(d\) dan \(n\). Berhati-hati dengan apa yang dikira sebagai "sebutan pertama".</li><li>Pilih: soalan tentang <em>satu</em> sebutan perlukan \(T_n\); soalan tentang <em>jumlah</em> perlukan \(S_n\).</li><li>Jika dua sebutan diberi, bina persamaan serentak untuk \(a\) dan \(d\).</li></ol>` },
    { kind: 'formula', items: [
      { tex: R`T_n = a + (n - 1)d`, html: R`\(a\): sebutan pertama; \(d\): beza sepunya; \(n\): kedudukan sebutan (integer positif).` },
      { tex: R`S_n = \frac{n}{2}\left[2a + (n - 1)d\right] = \frac{n}{2}(a + l)`, html: R`\(l\): sebutan terakhir. Dan \(T_n = S_n - S_{n-1}\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['5.1.1'], question: R`Tentukan sama ada 7, 11, 15, 19, … dan 2, 4, 8, 16, … ialah janjang aritmetik. Beri justifikasi.`, given: R`dua jujukan`, find: R`JA atau bukan`, method: R`Bandingkan beza berturut-turut.`,
        steps: [{ do: R`\(11 - 7 = 15 - 11 = 19 - 15 = 4\): beza sama, jadi JA dengan \(d = 4\)` }, { do: R`\(4 - 2 = 2\), \(8 - 4 = 4\): beza berbeza, jadi bukan JA` }],
        check: R`Satu beza yang berlainan sudah cukup untuk menolak JA ✓`, conclusion: R`Jujukan pertama JA (\(d = 4\)); yang kedua bukan JA.` },
      { level: 'sederhana', sp: ['5.1.2'], question: R`Bagi JA 5, 8, 11, …, cari \(T_{20}\), dan tentukan sebutan keberapa yang bernilai 98.`, given: R`\(a = 5\), \(d = 3\)`, find: R`\(T_{20}\); \(n\) apabila \(T_n = 98\)`, method: R`Rumus \(T_n\).`,
        steps: [{ do: R`\(T_{20} = 5 + 19(3) = 62\)` }, { do: R`\(5 + (n - 1)3 = 98 \Rightarrow n - 1 = 31 \Rightarrow n = 32\)`, why: R`\(n\) mesti integer positif; jika tidak, 98 bukan sebutan.` }],
        check: R`\(5 + 31 \times 3 = 98\) ✓`, conclusion: R`\(T_{20} = 62\); 98 ialah sebutan ke-32.` },
      { level: 'sederhana', sp: ['5.1.3'], question: R`Cari hasil tambah 20 sebutan pertama JA 5, 8, 11, …`, given: R`\(a = 5, d = 3, n = 20\)`, find: R`\(S_{20}\)`, method: R`Rumus \(S_n\), kemudian semak dengan \(\tfrac{n}{2}(a + l)\).`,
        steps: [{ do: R`\(S_{20} = \tfrac{20}{2}[2(5) + 19(3)] = 10(10 + 57) = 670\)` }],
        check: R`\(l = T_{20} = 62\): \(\tfrac{20}{2}(5 + 62) = 670\) ✓`, conclusion: R`\(S_{20} = 670\).` },
      { level: 'mencabar', sp: ['5.1.3'], question: R`Hasil tambah \(n\) sebutan pertama suatu JA ialah \(S_n = n^2 + 2n\). Cari \(T_5\) dan beza sepunya.`, given: R`\(S_n = n^2 + 2n\)`, find: R`\(T_5\), \(d\)`, method: R`\(T_n = S_n - S_{n-1}\).`,
        steps: [{ do: R`\(T_5 = S_5 - S_4 = 35 - 24 = 11\)` }, { do: R`\(T_4 = S_4 - S_3 = 24 - 15 = 9\), jadi \(d = 11 - 9 = 2\)` }],
        check: R`\(T_1 = S_1 = 3\), dan \(3 + 4(2) = 11 = T_5\) ✓`, conclusion: R`\(T_5 = 11\), \(d = 2\).` },
      { level: 'mencabar', sp: ['5.1.2', '5.1.4'], question: R`Sebutan ke-3 suatu JA ialah 11 dan sebutan ke-7 ialah 27. Cari \(a\), \(d\) dan \(S_{10}\).`, given: R`\(T_3 = 11\), \(T_7 = 27\)`, find: R`\(a, d, S_{10}\)`, method: R`Persamaan serentak daripada rumus \(T_n\).`,
        steps: [{ do: R`\(a + 2d = 11\), \(a + 6d = 27\)` }, { do: R`Tolak: \(4d = 16 \Rightarrow d = 4\), \(a = 3\)` }, { do: R`\(S_{10} = 5[6 + 9(4)] = 210\)` }],
        check: R`\(T_7 = 3 + 24 = 27\) ✓`, conclusion: R`\(a = 3\), \(d = 4\), \(S_{10} = 210\).` },
      { level: 'mencabar', sp: ['5.1.4'], question: R`Dewan dalam pengenalan: barisan pertama 20 kerusi, setiap barisan 2 kerusi lebih, 25 barisan. Cari bilangan kerusi di barisan terakhir dan jumlah kerusi.`, given: R`\(a = 20, d = 2, n = 25\)`, find: R`\(T_{25}\), \(S_{25}\)`, method: R`\(T_n\) untuk satu barisan, \(S_n\) untuk jumlah.`,
        steps: [{ do: R`\(T_{25} = 20 + 24(2) = 68\)` }, { do: R`\(S_{25} = \tfrac{25}{2}(20 + 68) = 1100\)` }],
        check: R`\(\tfrac{25}{2}[40 + 24(2)] = 1100\) ✓`, conclusion: R`68 kerusi di barisan terakhir; 1100 kerusi kesemuanya.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(T_n = a + nd\)`, why: R`Sebutan pertama belum menerima \(d\).`, fix: R`\(T_n = a + (n - 1)d\). Semak: \(T_1 = a\).` },
      { wrong: R`Menjawab \(n = 31.5\) sebagai "sebutan ke-31.5".`, why: R`Kedudukan sebutan mesti integer positif.`, fix: R`Jika \(n\) bukan integer, nilai itu bukan sebutan janjang.` },
      { wrong: R`Menggunakan \(T_n\) apabila soalan bertanya jumlah.`, why: R`\(T_n\) ialah satu sebutan; \(S_n\) ialah jumlah.`, fix: R`Baca soalan: "berapa di barisan ke-25" → \(T_{25}\); "jumlah" → \(S_{25}\).` },
    ] },
    { kind: 'summary', points: [R`JA: beza sepunya \(d\) yang tetap; justifikasi dengan beza berturut-turut.`, R`\(T_n = a + (n - 1)d\); \(S_n = \tfrac{n}{2}[2a + (n-1)d] = \tfrac{n}{2}(a + l)\).`, R`\(T_n = S_n - S_{n-1}\).`] },
    { kind: 'next', html: R`<p>Dalam <strong>5.2</strong>, setiap sebutan <em>didarab</em> (bukan ditambah) dengan nombor yang sama, iaitu janjang geometri.</p>`, links: [{ href: '#/nota/t4-5/5.2', label: '5.2 Janjang Geometri →' }] },
  ],
};

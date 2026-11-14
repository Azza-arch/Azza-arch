// Bab 4 · 4.3 Hukum Logaritma (SP 4.3.1–4.3.5). Original.
// DSKP: N = aˣ ⇔ log_a N = x (a > 0, a ≠ 1); log_a aˣ = x; log_a 1 = 0 and
// log_a a = 1 verified; graphs y = 10ˣ and x = log₁₀ y on the same axes;
// logs of zero and negative numbers explored; prove the laws; change of
// base log_b a = log_c a / log_c b and log_a b = 1 / log_b a; real-life problems.
const R = String.raw;
const lg = (x, a) => Math.log(x) / Math.log(a);

export const S4_3 = {
  id: '4.3', sk: '4.3', title: 'Hukum Logaritma', sp: ['4.3.1', '4.3.2', '4.3.3', '4.3.4', '4.3.5'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Soalan yang terbalik', html: R`
      <p>Dalam 4.1, kita tahu \(2^5 = 32\). Sekarang terbalikkan soalannya: <em>2 dikuasakan berapa untuk mendapat 32?</em> Jawapannya 5, dan kita tulis \(\log_2 32 = 5\).</p>
      <p>Logaritma ialah <strong>indeks</strong> yang dicari. Ia digunakan dalam sains untuk nombor yang sangat besar atau sangat kecil, contohnya skala pH bagi keasidan.</p>` },
    { kind: 'concept', title: 'Bentuk indeks dan bentuk logaritma', sp: ['4.3.1'], html: R`
      \[N = a^x \iff \log_a N = x, \qquad a > 0,\ a \ne 1\]
      <p>Baca \(\log_a N\) sebagai "logaritma \(N\) asas \(a\)". Contohnya \(3^4 = 81 \iff \log_3 81 = 4\).</p>
      <ul>
        <li>\(\log_a 1 = 0\), kerana \(a^0 = 1\).</li>
        <li>\(\log_a a = 1\), kerana \(a^1 = a\).</li>
        <li>\(\log_a a^x = x\): logaritma "membatalkan" kuasa dengan asas yang sama.</li>
      </ul>
      <p><strong>Logaritma nombor sifar atau negatif tidak tertakrif.</strong> Bagi \(a > 0\), \(a^x\) sentiasa positif, jadi tiada \(x\) yang memberi \(a^x = 0\) atau \(a^x = -5\). Cuba \(\log(-5)\) pada kalkulator: ia memberi ralat.</p>
      <p>\(\log_{10}\) biasanya ditulis \(\lg\) atau \(\log\) sahaja.</p>` },
    { kind: 'visual', title: 'Graf eksponen dan logaritma', html: R`<p>Biru: \(y = a^x\). Merah: \(y = \log_a x\). Putus-putus: \(y = x\). Persamaan \(x = \log_a y\) menggambarkan lengkung <em>biru</em> yang sama, kerana ia hanya bentuk lain bagi \(y = a^x\). Kedua-dua graf saling memantul pada \(y = x\), kerana ia fungsi songsang (Bab 1).</p>`,
      spec: { type: 'plot', x: [-3, 8], y: [-3, 8], params: [{ name: 'a', label: R`asas \(a\)`, min: 1.5, max: 10, step: 0.5, value: 2 }],
        curves: [{ f: (x) => x, dashed: true, color: '#9AA3B5' }, { f: (x, p) => p.a ** x }, { f: (x, p) => (x > 0 ? lg(x, p.a) : NaN), color: '#D9534F', domain: [0.001, 8] }],
        points: [{ at: () => [1, 0], label: '(1, 0)' }, { at: () => [0, 1], label: '(0, 1)' }],
        readout: (p, { fmt }) => R`\(\log_{${fmt(p.a)}} 1 = 0\), \(\log_{${fmt(p.a)}} ${fmt(p.a)} = 1\), \(\log_{${fmt(p.a)}} 8 = ${fmt(+lg(8, p.a).toFixed(4))}\). Lengkung merah tidak wujud bagi \(x \le 0\), kerana logaritma nombor sifar atau negatif tidak tertakrif.` },
      alt: R`Graf y = 2ˣ (melalui (0, 1) dan (3, 8)) dan y = log₂ x (melalui (1, 0) dan (8, 3)). Kedua-duanya pantulan pada garis y = x. Graf logaritma hanya wujud bagi x > 0, dan semakin menghampiri paksi-y apabila x menghampiri 0.` },
    { kind: 'concept', title: 'Membuktikan hukum logaritma', sp: ['4.3.2'], html: R`
      <p>Biar \(x = a^m\) dan \(y = a^n\), maka \(m = \log_a x\) dan \(n = \log_a y\).</p>
      <ul>
        <li><strong>Hasil darab:</strong> \(xy = a^m a^n = a^{m+n}\), jadi \(\log_a xy = m + n = \log_a x + \log_a y\).</li>
        <li><strong>Hasil bahagi:</strong> \(\tfrac{x}{y} = a^{m-n}\), jadi \(\log_a \tfrac{x}{y} = \log_a x - \log_a y\).</li>
        <li><strong>Kuasa:</strong> \(x^k = (a^m)^k = a^{mk}\), jadi \(\log_a x^k = k \log_a x\).</li>
      </ul>
      <p>Setiap hukum logaritma ialah hukum indeks yang "diterjemahkan", kerana logaritma <em>ialah</em> indeks.</p>` },
    { kind: 'concept', title: 'Mempermudahkan ungkapan logaritma', sp: ['4.3.3'], html: R`
      <p>Gabungkan sebutan menjadi satu logaritma menggunakan ketiga-tiga hukum: \(2\lg 5 + \lg 4 = \lg 5^2 + \lg 4 = \lg(25 \times 4) = \lg 100 = 2\).</p>
      <div class="callout is-warn"><p>\(\log_a(x + y) \ne \log_a x + \log_a y\). Hukum hasil darab adalah untuk <em>darab</em>, bukan tambah.</p></div>` },
    { kind: 'concept', title: 'Penukaran asas', sp: ['4.3.4'], html: R`
      <p>Kalkulator biasanya hanya ada \(\lg\) (asas 10) dan \(\ln\) (asas \(e\)). Untuk asas lain:</p>
      \[\log_b a = \frac{\log_c a}{\log_c b}\]
      <p><strong>Bukti:</strong> biar \(\log_b a = x\), maka \(b^x = a\). Ambil \(\log_c\) kedua-dua belah: \(x \log_c b = \log_c a\), jadi \(x = \dfrac{\log_c a}{\log_c b}\).</p>
      <p>Kes khas (\(c = a\)): \(\log_b a = \dfrac{1}{\log_a b}\). Contohnya \(\log_8 2 = \dfrac{1}{\log_2 8} = \dfrac{1}{3}\).</p>` },
    { kind: 'concept', title: 'Persamaan dan masalah logaritma', sp: ['4.3.5'], html: R`
      <p>Untuk menyelesaikan persamaan logaritma: gabungkan menjadi <em>satu</em> logaritma, tukar kepada bentuk indeks, selesaikan, kemudian <strong>buang jawapan yang menjadikan mana-mana logaritma asal tidak tertakrif</strong>.</p>
      <p><strong>Contoh sebenar, skala pH:</strong> \(\text{pH} = -\lg[\text{H}^+]\), dengan \([\text{H}^+]\) ialah kepekatan ion hidrogen (mol/L). Larutan dengan \([\text{H}^+] = 10^{-3}\) mempunyai pH 3.</p>` },
    { kind: 'formula', items: [
      { tex: R`\log_a xy = \log_a x + \log_a y, \quad \log_a \frac{x}{y} = \log_a x - \log_a y, \quad \log_a x^k = k\log_a x`, html: R`Bagi \(x, y > 0\), \(a > 0\), \(a \ne 1\).` },
      { tex: R`\log_b a = \frac{\log_c a}{\log_c b}, \qquad \log_b a = \frac{1}{\log_a b}`, html: R`Penukaran asas.` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['4.3.1'], question: R`Tulis \(2^5 = 32\) dalam bentuk logaritma, dan cari \(\log_3 81\).`, given: R`bentuk indeks`, find: R`bentuk logaritma; \(\log_3 81\)`, method: R`Gunakan \(N = a^x \iff \log_a N = x\).`,
        steps: [{ do: R`\(\log_2 32 = 5\)` }, { do: R`\(81 = 3^4\), jadi \(\log_3 81 = \log_3 3^4 = 4\)` }],
        check: R`\(3^4 = 81\) ✓`, conclusion: R`\(\log_2 32 = 5\); \(\log_3 81 = 4\).` },
      { level: 'sederhana', sp: ['4.3.2'], question: R`Buktikan \(\log_a xy = \log_a x + \log_a y\), kemudian sahkan dengan \(a = 2\), \(x = 4\), \(y = 8\).`, given: R`\(a > 0, a \ne 1\); \(x, y > 0\)`, find: R`bukti dan pengesahan`, method: R`Tulis \(x\) dan \(y\) dalam bentuk indeks, guna hukum indeks, kemudian tukar semula.`,
        steps: [{ do: R`Biar \(\log_a x = m\) dan \(\log_a y = n\), maka \(x = a^m\), \(y = a^n\)`, why: R`Takrif logaritma: \(\log_a N = x \iff N = a^x\).` }, { do: R`\(xy = a^m \cdot a^n = a^{m+n}\)`, why: R`Hukum indeks pendaraban.` }, { do: R`\(\log_a xy = m + n = \log_a x + \log_a y\)` }, { do: R`Pengesahan: \(\log_2 32 = 5\) dan \(\log_2 4 + \log_2 8 = 2 + 3 = 5\)` }],
        check: R`Kedua-dua belah memberi 5 ✓`, conclusion: R`Hukum hasil darab terbukti, dan sah bagi contoh berangka.` },
      { level: 'sederhana', sp: ['4.3.3'], question: R`Permudahkan \(2\log_3 6 - \log_3 4\).`, given: R`dua sebutan logaritma asas 3`, find: R`nilai`, method: R`Hukum kuasa, kemudian hukum hasil bahagi.`,
        steps: [{ do: R`\(\log_3 6^2 - \log_3 4 = \log_3 36 - \log_3 4\)` }, { do: R`\(= \log_3 \tfrac{36}{4} = \log_3 9 = 2\)` }],
        check: R`Kalkulator: \(2(1.6309) - 1.2619 = 2.0000\) ✓`, conclusion: R`2.` },
      { level: 'sederhana', sp: ['4.3.4'], question: R`Cari \(\log_3 20\) betul kepada empat angka bererti.`, given: R`asas 3`, find: R`nilai`, method: R`Penukaran asas kepada asas 10.`,
        steps: [{ do: R`\(\log_3 20 = \dfrac{\lg 20}{\lg 3} = \dfrac{1.30103}{0.47712}\)` }, { do: R`\(= 2.727\)` }],
        check: R`\(3^{2.727} \approx 20.0\) ✓`, conclusion: R`\(\log_3 20 = 2.727\).` },
      { level: 'mencabar', sp: ['4.3.5'], question: R`Selesaikan \(\log_2 x + \log_2 (x - 2) = 3\).`, given: R`persamaan logaritma`, find: R`\(x\)`, method: R`Gabungkan, tukar ke bentuk indeks, semak domain.`,
        steps: [{ do: R`\(\log_2 x(x - 2) = 3 \Rightarrow x(x - 2) = 2^3 = 8\)` }, { do: R`\(x^2 - 2x - 8 = 0 \Rightarrow (x - 4)(x + 2) = 0\)` }, { do: R`\(x = 4\) atau \(x = -2\); buang \(x = -2\)`, why: R`\(\log_2(-2)\) tidak tertakrif.` }],
        check: R`\(\log_2 4 + \log_2 2 = 2 + 1 = 3\) ✓`, conclusion: R`\(x = 4\).` },
      { level: 'mencabar', sp: ['4.3.5'], question: R`Jus limau mempunyai \([\text{H}^+] = 5.0 \times 10^{-3}\) mol/L. Cari pHnya, dan berapa kali ganda keasidannya berbanding air hujan dengan pH 5.6?`, given: R`\(\text{pH} = -\lg[\text{H}^+]\)`, find: R`pH; nisbah kepekatan`, method: R`Gantikan; kemudian tukar perbezaan pH kepada kuasa 10.`,
        steps: [{ do: R`\(\text{pH} = -\lg(5.0 \times 10^{-3}) = -(\lg 5 - 3) = 3 - 0.699 = 2.301\)` }, { do: R`Beza pH \(= 5.6 - 2.301 = 3.299\), jadi nisbah \(= 10^{3.299} \approx 1990\)`, why: R`Setiap 1 unit pH bermaksud kepekatan 10 kali ganda.` }],
        check: R`\(10^{-2.301} \approx 0.005\) ✓`, conclusion: R`pH ≈ 2.30; kira-kira 2000 kali lebih berasid.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(\log_2(x + 2) = \log_2 x + \log_2 2\)`, why: R`Hukum hasil darab hanya untuk \(\log(xy)\).`, fix: R`\(\log_2(x+2)\) tidak boleh dipecahkan.` },
      { wrong: R`\(\dfrac{\log 8}{\log 2} = \log 4\)`, why: R`Itu pembahagian dua logaritma, bukan logaritma suatu hasil bahagi.`, fix: R`\(\dfrac{\lg 8}{\lg 2} = \log_2 8 = 3\).` },
      { wrong: R`Menerima \(x = -2\) dalam \(\log_2 x + \log_2(x - 2) = 3\).`, why: R`Logaritma nombor negatif tidak tertakrif.`, fix: R`Sentiasa semak jawapan dalam setiap logaritma asal.` },
    ] },
    { kind: 'summary', points: [R`\(a^x = N \iff \log_a N = x\); \(\log_a 1 = 0\); \(\log_a a = 1\); logaritma nombor sifar atau negatif tidak tertakrif.`, R`Hukum: darab → tambah; bahagi → tolak; kuasa → darab dengan indeks.`, R`Penukaran asas: \(\log_b a = \dfrac{\log_c a}{\log_c b}\); \(\log_b a = \dfrac{1}{\log_a b}\).`, R`Persamaan logaritma: gabungkan, tukar ke bentuk indeks, buang jawapan tidak sah.`] },
    { kind: 'next', html: R`<p>Dalam <strong>4.4</strong>, logaritma (termasuk logaritma jati \(\ln\)) digunakan untuk menyelesaikan persamaan indeks yang asasnya tidak boleh disamakan, seperti faedah kompaun dan pereputan.</p>`, links: [{ href: '#/nota/t4-4/4.4', label: '4.4 Aplikasi →' }] },
  ],
};

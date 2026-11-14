// Bab 4 · 4.1 Hukum Indeks (SP 4.1.1, 4.1.2). Original. DSKP: real-life
// situations for 4.1.2.
const R = String.raw;

export const S4_1 = {
  id: '4.1', sk: '4.1', title: 'Hukum Indeks', sp: ['4.1.1', '4.1.2'], status: 'published', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Bakteria yang berganda', html: R`
      <p>Satu koloni bermula dengan 200 bakteria, dan bilangannya berganda setiap jam. Selepas 1 jam: \(200 \times 2\). Selepas 2 jam: \(200 \times 2 \times 2\). Selepas \(t\) jam:</p>
      \[N = 200 \times 2^t\]
      <p>Menulis "2 didarab sebanyak \(t\) kali" sebagai \(2^t\) jauh lebih ringkas. Dalam \(2^t\), 2 ialah <strong>asas</strong> dan \(t\) ialah <strong>indeks</strong> (kuasa). Hukum indeks membantu kita mempermudahkan dan menyelesaikan ungkapan seperti ini.</p>` },
    { kind: 'concept', title: 'Hukum indeks dan sebabnya', sp: ['4.1.1'], html: R`
      <p>Setiap hukum datang daripada maksud kuasa sebagai pendaraban berulang:</p>
      <ul>
        <li>\(a^m \times a^n = a^{m+n}\): \(a^2 \times a^3 = (a \cdot a)(a \cdot a \cdot a) = a^5\). Kita <em>mengira</em> faktor, jadi indeks ditambah.</li>
        <li>\(a^m \div a^n = a^{m-n}\): faktor yang sama dibatalkan.</li>
        <li>\((a^m)^n = a^{mn}\): \((a^2)^3 = a^2 \cdot a^2 \cdot a^2 = a^6\).</li>
        <li>\((ab)^n = a^n b^n\) dan \(\left(\tfrac{a}{b}\right)^n = \tfrac{a^n}{b^n}\).</li>
        <li>\(a^0 = 1\) (\(a \ne 0\)): kerana \(a^n \div a^n = a^0\), dan nombor dibahagi dengan dirinya sendiri ialah 1.</li>
        <li>\(a^{-n} = \dfrac{1}{a^n}\): kerana \(a^0 \div a^n = a^{-n}\).</li>
        <li>\(a^{\frac{1}{n}} = \sqrt[n]{a}\) dan \(a^{\frac{m}{n}} = \left(\sqrt[n]{a}\right)^m\): kerana \(\left(a^{\frac{1}{n}}\right)^n = a^1\).</li>
      </ul>
      <div class="callout is-warn"><p>Hukum ini hanya untuk <strong>asas yang sama</strong>. \(2^3 \times 3^2\) tidak boleh digabungkan menjadi \(6^5\).</p></div>` },
    { kind: 'visual', title: 'Lihat pertumbuhan eksponen', html: R`<p>Graf \(y = a^x\). Ubah asas \(a\). Perhatikan bahawa semua graf melalui \((0, 1)\), kerana \(a^0 = 1\).</p>`,
      spec: { type: 'plot', x: [-3, 4], y: [-1, 10], params: [{ name: 'a', label: R`asas \(a\)`, min: 0.5, max: 3, step: 0.5, value: 2 }],
        curves: [{ f: (x, p) => p.a ** x }], points: [{ at: () => [0, 1], label: '(0, 1)' }, { at: (p) => [2, p.a ** 2], label: (p) => `(2, ${p.a ** 2})` }],
        readout: (p, { fmt }) => R`\(a = ${fmt(p.a)}\): \(a^0 = 1\), \(a^2 = ${fmt(p.a ** 2)}\), \(a^{-1} = ${fmt(1 / p.a)}\). ${p.a > 1 ? 'Graf menaik.' : p.a < 1 ? 'Asas antara 0 dan 1: graf menurun.' : 'Asas 1: garis mengufuk y = 1.'}` },
      alt: R`Graf y = aˣ. Bagi a = 2, graf melalui (0, 1), (1, 2) dan (2, 4), menaik dengan cepat ke kanan dan menghampiri paksi-x ke kiri tanpa menyentuhnya. Bagi a = 0.5, graf menurun. Semua graf melalui (0, 1).` },
    { kind: 'concept', title: 'Menyelesaikan persamaan indeks', sp: ['4.1.2'], html: R`
      <p><strong>Idea utama:</strong> jika \(a^m = a^n\) (asas sama, \(a > 0\), \(a \ne 1\)), maka \(m = n\).</p>
      <ol><li>Tulis kedua-dua belah dengan <strong>asas yang sama</strong> (contohnya \(9 = 3^2\), \(27 = 3^3\)).</li><li>Samakan indeks dan selesaikan.</li></ol>
      <p>Jika ada sebutan seperti \(2^{x+2} - 2^x\), faktorkan \(2^x\): \(2^x(2^2 - 1)\). Jika asas tidak boleh disamakan (contohnya \(3^x = 20\)), kita perlukan logaritma (subtopik 4.3 dan 4.4).</p>` },
    { kind: 'formula', items: [
      { tex: R`a^m \times a^n = a^{m+n}, \quad a^m \div a^n = a^{m-n}, \quad (a^m)^n = a^{mn}`, html: R`Asas mesti sama.` },
      { tex: R`a^0 = 1, \quad a^{-n} = \frac{1}{a^n}, \quad a^{\frac{m}{n}} = \left(\sqrt[n]{a}\right)^m`, html: R`\(a \ne 0\) untuk indeks sifar dan negatif.` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['4.1.1'], question: R`Permudahkan \((2x^3y)^2 \times 3x^{-1}\).`, given: R`ungkapan dengan indeks`, find: R`bentuk termudah`, method: R`Kuasa bagi hasil darab, kemudian darab asas yang sama.`,
        steps: [{ do: R`\((2x^3y)^2 = 4x^6y^2\)`, why: R`Setiap faktor dikuasaduakan: \(2^2 = 4\), \((x^3)^2 = x^6\).` }, { do: R`\(4x^6y^2 \times 3x^{-1} = 12x^{6 + (-1)}y^2 = 12x^5y^2\)` }],
        check: R`Uji \(x = 1, y = 1\): kiri \(4 \times 3 = 12\), kanan 12 ✓`, conclusion: R`\(12x^5y^2\).` },
      { level: 'sederhana', sp: ['4.1.1'], question: R`Nilaikan \(27^{\frac{2}{3}} \times 4^{-\frac{1}{2}}\) tanpa kalkulator.`, given: R`indeks pecahan dan negatif`, find: R`nilai`, method: R`Punca dahulu, kemudian kuasa; indeks negatif bermaksud salingan.`,
        steps: [{ do: R`\(27^{\frac{2}{3}} = \left(\sqrt[3]{27}\right)^2 = 3^2 = 9\)`, why: R`Ambil punca dahulu supaya nombor kekal kecil.` }, { do: R`\(4^{-\frac{1}{2}} = \dfrac{1}{\sqrt{4}} = \dfrac{1}{2}\)` }, { do: R`\(9 \times \tfrac{1}{2} = 4.5\)` }],
        check: R`Kalkulator: \(27^{2/3} \approx 9\), \(4^{-0.5} = 0.5\) ✓`, conclusion: R`\(4.5\).` },
      { level: 'sederhana', sp: ['4.1.2'], question: R`Selesaikan \(9^x = 27^{x - 1}\).`, given: R`asas 9 dan 27`, find: R`\(x\)`, method: R`Tulis kedua-duanya sebagai kuasa 3.`,
        steps: [{ do: R`\((3^2)^x = (3^3)^{x - 1} \Rightarrow 3^{2x} = 3^{3x - 3}\)` }, { do: R`\(2x = 3x - 3 \Rightarrow x = 3\)`, why: R`Asas sama, jadi indeks mesti sama.` }],
        check: R`\(9^3 = 729\), \(27^2 = 729\) ✓`, conclusion: R`\(x = 3\).` },
      { level: 'mencabar', sp: ['4.1.2'], question: R`Selesaikan \(2^{x+2} - 2^x = 24\).`, given: R`dua sebutan dengan asas 2`, find: R`\(x\)`, method: R`Faktorkan \(2^x\).`,
        steps: [{ do: R`\(2^x \cdot 2^2 - 2^x = 24\)`, why: R`\(2^{x+2} = 2^x \times 2^2\).` }, { do: R`\(2^x(4 - 1) = 24 \Rightarrow 2^x = 8 = 2^3\)` }, { do: R`\(x = 3\)` }],
        check: R`\(2^5 - 2^3 = 32 - 8 = 24\) ✓`, conclusion: R`\(x = 3\).` },
      { level: 'mencabar', sp: ['4.1.2'], question: R`Bilangan bakteria ialah \(N = 200 \times 2^t\), dengan \(t\) dalam jam. Bilakah bilangannya mencapai 6400?`, given: R`\(N = 200 \times 2^t\), \(N = 6400\)`, find: R`\(t\)`, method: R`Asingkan kuasa, kemudian samakan asas.`,
        steps: [{ do: R`\(200 \times 2^t = 6400 \Rightarrow 2^t = 32\)` }, { do: R`\(2^t = 2^5 \Rightarrow t = 5\)` }],
        check: R`\(200 \times 32 = 6400\) ✓`, conclusion: R`Selepas 5 jam.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(a^2 \times a^3 = a^6\)`, why: R`Indeks didarab hanya untuk kuasa bagi kuasa, \((a^2)^3\).`, fix: R`\(a^2 \times a^3 = a^{2+3} = a^5\).` },
      { wrong: R`\(3x^{-2} = \dfrac{1}{3x^2}\)`, why: R`Indeks \(-2\) hanya pada \(x\), bukan pada 3.`, fix: R`\(3x^{-2} = \dfrac{3}{x^2}\).` },
      { wrong: R`\(2^{-3} = -8\)`, why: R`Indeks negatif bermaksud salingan, bukan nilai negatif.`, fix: R`\(2^{-3} = \dfrac{1}{8}\).` },
    ] },
    { kind: 'summary', points: [R`Darab: tambah indeks; bahagi: tolak indeks; kuasa bagi kuasa: darab indeks (asas sama sahaja).`, R`\(a^0 = 1\), \(a^{-n} = \tfrac{1}{a^n}\), \(a^{m/n} = (\sqrt[n]{a})^m\).`, R`Persamaan indeks: samakan asas, kemudian samakan indeks.`] },
    { kind: 'next', html: R`<p>Indeks pecahan seperti \(a^{\frac{1}{2}}\) ialah punca kuasa dua. Dalam <strong>4.2</strong>, kita kaji punca yang tidak boleh ditulis sebagai pecahan, iaitu surd.</p>`, links: [{ href: '#/nota/t4-4/4.2', label: '4.2 Hukum Surd →' }] },
  ],
};

// T5 Bab 5 Taburan Kebarangkalian (SP 5.1.1–5.3.5). Original.
// DSKP (PDF 130–133, verified as page images): real-life situations and technology;
// set-builder notation for discrete and continuous random variables (e.g.
// X = {x : x = 0, 1, 2, 3}, X = {x : x is height in cm, a₁ < x < a₂}); tree diagrams
// and probability formulas to introduce discrete distributions; coin/dice
// experiments; a distribution is a table or graph of values with probabilities;
// Bernoulli trial characteristics and their link to the binomial; tree diagrams to
// explore binomial values; P(X = r) = ⁿCᵣ pʳ qⁿ⁻ʳ need NOT be derived; Σ P = 1;
// mean as the expected average over many repetitions; interpret solutions;
// normal graph sketch and features; random variation and the Law of Large
// Numbers discussed; importance of converting to the standard normal; Z score;
// use of the Standard Normal Distribution Table emphasised (calculator/apps
// allowed); finding Z given a probability.
const R = String.raw;
const r3 = (v) => +v.toFixed(3);
const r4 = (v) => +v.toFixed(4);
const fact = (n) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
const nCr = (n, r) => fact(n) / (fact(r) * fact(n - r));
const binomP = (n, p, r) => nCr(n, r) * p ** r * (1 - p) ** (n - r);
const bar = (x, h, w = 0.7) => [[x - w / 2, 0], [x + w / 2, 0], [x + w / 2, h], [x - w / 2, h]];
const pdf = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
const Phi = (z) => { const n = 400, a = 0, b = Math.abs(z), h = (b - a) / n; let s = pdf(a) + pdf(b); for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * pdf(a + k * h); const half = (s * h) / 3; return z >= 0 ? 0.5 + half : 0.5 - half; };

// ---------------------------------------------------------------- 5.1
export const S5_1 = {
  id: '5.1', sk: '5.1', title: 'Pemboleh Ubah Rawak', sp: ['5.1.1', '5.1.2', '5.1.3', '5.1.4'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Nombor yang ditentukan oleh peluang', html: R`<p>Lambung tiga syiling dan kira bilangan kepala. Hasilnya mungkin 0, 1, 2 atau 3, tetapi kita tidak tahu yang mana sebelum melambung. Nilai yang ditentukan oleh hasil sesuatu eksperimen rawak dipanggil <strong>pemboleh ubah rawak</strong>.</p>` },
    { kind: 'prereq', title: 'Imbas kembali', html: R`<ul><li>\(P(A) = \dfrac{n(A)}{n(S)}\) bagi hasil yang sama mungkin.</li><li>Peristiwa tak bersandar: \(P(A \cap B) = P(A) \times P(B)\).</li><li>Peristiwa saling eksklusif: \(P(A \cup B) = P(A) + P(B)\).</li></ul>` },
    { kind: 'concept', title: 'Maksud pemboleh ubah rawak', sp: ['5.1.1'], html: R`<p><strong>Pemboleh ubah rawak</strong> ialah pemboleh ubah yang nilainya ditentukan oleh hasil suatu eksperimen rawak. Ia ditulis dengan huruf besar (\(X\)), dan nilainya dengan huruf kecil (\(x\)). Contoh: \(X\) = bilangan kepala dalam tiga lambungan syiling.</p>` },
    { kind: 'concept', title: 'Diskret berbanding selanjar', sp: ['5.1.2'], html: R`
      <table class="mini-table"><thead><tr><th>Diskret</th><th>Selanjar</th></tr></thead><tbody>
        <tr><td>nilai boleh dibilang (biasanya integer)</td><td>sebarang nilai dalam suatu selang</td></tr>
        <tr><td>bilangan kepala, bilangan murid tidak hadir</td><td>tinggi, jisim, masa, suhu</td></tr>
        <tr><td>\(X = \{x : x = 0, 1, 2, 3\}\)</td><td>\(X = \{x : x \text{ ialah tinggi murid dalam cm},\ 140 < x < 190\}\)</td></tr>
      </tbody></table>` },
    { kind: 'concept', title: 'Taburan kebarangkalian diskret', sp: ['5.1.3', '5.1.4'], html: R`
      <p><strong>Taburan kebarangkalian</strong> ialah jadual atau graf yang menunjukkan setiap nilai yang mungkin bagi pemboleh ubah rawak, bersama kebarangkaliannya. Untuk pemboleh ubah rawak diskret:</p>
      <ul><li>\(0 \le P(X = x) \le 1\) bagi setiap \(x\);</li><li>\(\displaystyle\sum P(X = x) = 1\) (semua kemungkinan diambil kira).</li></ul>
      <p>Gunakan <strong>gambar rajah pokok</strong> untuk menyenaraikan hasil, kemudian kumpulkan mengikut nilai \(X\). Graf taburan biasanya carta bar (\(x\) di paksi mengufuk, \(P(X = x)\) di paksi mencancang).</p>` },
    { kind: 'visual', title: 'Bilangan kepala apabila melambung syiling', html: R`<p>\(X\) = bilangan kepala apabila \(n\) syiling saksama dilambung. Ubah \(n\).</p>`,
      spec: { type: 'plot', x: [-0.2, 6.8], y: [-0.08, 0.6], gridX: 100, gridY: 0.1, labelStepY: 0.1, xLabel: 'x', yLabel: 'P(X = x)', params: [{ name: 'n', label: R`\(n\)`, min: 1, max: 5, step: 1, value: 3 }],
        polygons: Array.from({ length: 6 }, (_, r) => ({ at: (p) => (r <= p.n ? bar(r + 1, binomP(p.n, 0.5, r)) : null), color: '#3467D4' })),
        labels: [...Array.from({ length: 6 }, (_, r) => ({ at: (p) => (r <= p.n ? [r + 1, -0.04] : null), text: String(r) })), ...Array.from({ length: 6 }, (_, r) => ({ at: (p) => (r <= p.n ? [r + 1, binomP(p.n, 0.5, r) + 0.03] : null), text: (p) => `${nCr(p.n, r)}/${2 ** p.n}` }))],
        readout: (p, { fmt }) => R`\(2^{${fmt(p.n)}} = ${fmt(2 ** p.n)}\) hasil yang sama mungkin. Jumlah kebarangkalian \(= 1\).` },
      alt: R`Carta bar taburan kebarangkalian bilangan kepala X apabila n syiling dilambung. Dengan n = 3: P(X = 0) = 1/8, P(X = 1) = 3/8, P(X = 2) = 3/8, P(X = 3) = 1/8, berjumlah 1. Carta sentiasa simetri kerana syiling saksama, dan bar tengah paling tinggi.` },
    { kind: 'formula', items: [{ tex: R`\sum P(X = x) = 1, \quad 0 \le P(X = x) \le 1`, html: R`Syarat taburan kebarangkalian diskret.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['5.1.1', '5.1.2'], question: R`Kelaskan sebagai diskret atau selanjar: (a) bilangan panggilan telefon dalam sejam, (b) masa menunggu bas.`, given: R`dua pemboleh ubah rawak`, find: R`jenis`, method: R`Boleh dibilang atau sebarang nilai dalam selang?`, steps: [{ do: R`(a) 0, 1, 2, …: boleh dibilang, <strong>diskret</strong>` }, { do: R`(b) sebarang nilai seperti 3.47 minit: <strong>selanjar</strong>` }], check: R`Nilai pecahan "2.5 panggilan" tidak bermakna, tetapi "2.5 minit" bermakna ✓`, conclusion: R`(a) diskret; (b) selanjar.` },
      { level: 'sederhana', sp: ['5.1.3', '5.1.4'], question: R`Dua syiling saksama dilambung. \(X\) ialah bilangan kepala. Bina jadual taburan kebarangkalian.`, given: R`dua syiling`, find: R`jadual`, method: R`Senaraikan hasil (gambar rajah pokok).`, steps: [{ do: R`Hasil: HH, HE, EH, EE (4 sama mungkin)` }, { do: R`\(P(X = 0) = \tfrac14\), \(P(X = 1) = \tfrac24 = \tfrac12\), \(P(X = 2) = \tfrac14\)` }], check: R`\(\tfrac14 + \tfrac12 + \tfrac14 = 1\) ✓`, conclusion: R`\(x\): 0, 1, 2; \(P\): \(\tfrac14, \tfrac12, \tfrac14\).` },
      { level: 'mencabar', sp: ['5.1.4'], question: R`Sebuah beg mengandungi 3 guli merah dan 2 guli biru. Dua guli dikeluarkan satu demi satu <strong>tanpa dikembalikan</strong>. \(X\) ialah bilangan guli merah. Bina taburan kebarangkalian.`, given: R`3M, 2B, tanpa pengembalian`, find: R`\(P(X = x)\)`, method: R`Gambar rajah pokok; kebarangkalian berubah selepas cabutan pertama.`, steps: [{ do: R`\(P(X = 0) = \tfrac25 \times \tfrac14 = \tfrac{1}{10}\)` }, { do: R`\(P(X = 1) = \tfrac35 \times \tfrac24 + \tfrac25 \times \tfrac34 = \tfrac{6}{10}\)`, why: R`Dua cabang: MB dan BM.` }, { do: R`\(P(X = 2) = \tfrac35 \times \tfrac24 = \tfrac{3}{10}\)` }], check: R`\(0.1 + 0.6 + 0.3 = 1\) ✓`, conclusion: R`0.1, 0.6, 0.3.` },
      { level: 'mencabar', sp: ['5.1.3'], question: R`Taburan kebarangkalian \(X\) diberi oleh \(P(X = x) = kx\) bagi \(x = 1, 2, 3, 4\). Cari \(k\) dan \(P(X \ge 3)\).`, given: R`bentuk taburan`, find: R`\(k\); \(P(X \ge 3)\)`, method: R`\(\sum P = 1\).`, steps: [{ do: R`\(k(1 + 2 + 3 + 4) = 1 \Rightarrow k = \tfrac{1}{10}\)` }, { do: R`\(P(X \ge 3) = \tfrac{3}{10} + \tfrac{4}{10} = 0.7\)` }], check: R`Semua kebarangkalian di antara 0 dan 1 ✓`, conclusion: R`\(k = 0.1\); 0.7.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Dalam dua syiling, \(P(X = 1) = \tfrac13\) (tiga nilai, jadi sama mungkin).`, why: R`Nilai \(X\) tidak semestinya sama mungkin: \(X = 1\) ada dua hasil (HE, EH).`, fix: R`Senaraikan hasil asas dengan gambar rajah pokok.` },
      { wrong: R`Lupa mengemas kini kebarangkalian tanpa pengembalian.`, why: R`Selepas satu guli dikeluarkan, hanya 4 guli tinggal.`, fix: R`Penyebut berkurang pada cabutan kedua.` },
    ] },
    { kind: 'summary', points: [R`Pemboleh ubah rawak: nilai ditentukan oleh hasil rawak.`, R`Diskret (boleh dibilang) berbanding selanjar (selang).`, R`Taburan: jadual atau graf; \(\sum P = 1\).`] },
    { kind: 'next', html: R`<p>Corak 1–3–3–1 dalam visual bukan kebetulan. Seterusnya, <strong>5.2 Taburan Binomial</strong>.</p>`, links: [{ href: '#/nota/t5-5/5.2', label: '5.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 5.2
export const S5_2 = {
  id: '5.2', sk: '5.2', title: 'Taburan Binomial', sp: ['5.2.1', '5.2.2', '5.2.3', '5.2.4', '5.2.5'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Berjaya atau tidak', html: R`<p>Sebiji benih bercambah atau tidak. Seorang pemain menjaringkan atau tidak. Barang lulus pemeriksaan atau rosak. Apabila percubaan seperti ini diulang beberapa kali dengan peluang yang sama, bilangan "kejayaan" mengikut <strong>taburan binomial</strong>.</p>` },
    { kind: 'concept', title: 'Percubaan Bernoulli dan taburan binomial', sp: ['5.2.1'], html: R`
      <p><strong>Percubaan Bernoulli</strong> mempunyai tepat dua hasil: <em>berjaya</em> (kebarangkalian \(p\)) atau <em>gagal</em> (kebarangkalian \(q = 1 - p\)).</p>
      <p>Jika \(X\) ialah bilangan kejayaan dalam \(n\) percubaan Bernoulli dengan syarat:</p>
      <ol><li>bilangan percubaan \(n\) tetap;</li><li>setiap percubaan hanya dua hasil;</li><li>\(p\) sama bagi setiap percubaan;</li><li>percubaan tidak bersandar antara satu sama lain,</li></ol>
      <p>maka \(X\) mengikut <strong>taburan binomial</strong>, ditulis \(X \sim B(n, p)\).</p>` },
    { kind: 'concept', title: 'Kebarangkalian binomial', sp: ['5.2.2'], html: R`
      <p>Dengan gambar rajah pokok untuk \(n = 3\): setiap laluan dengan tepat \(r\) kejayaan mempunyai kebarangkalian \(p^r q^{n - r}\), dan bilangan laluan sedemikian ialah \({}^nC_r\) (memilih percubaan mana yang berjaya). Jadi</p>
      \[P(X = r) = {}^nC_r\,p^r q^{n - r}, \quad r = 0, 1, \dots, n\]
      <p>(Rumus ini tidak perlu diterbitkan.) Untuk "sekurang-kurangnya", gunakan pelengkap: \(P(X \ge 1) = 1 - P(X = 0)\).</p>` },
    { kind: 'concept', title: 'Jadual dan graf taburan binomial', sp: ['5.2.3'], html: R`<p>Kira \(P(X = r)\) bagi setiap \(r\) dari 0 hingga \(n\) dan lukis carta bar. Jika \(p = 0.5\), graf simetri; jika \(p < 0.5\), puncak di sebelah kiri; jika \(p > 0.5\), di sebelah kanan. Jumlah semua kebarangkalian \(\displaystyle\sum_{r = 0}^{n} P(X = r) = 1\).</p>` },
    { kind: 'concept', title: 'Min, varians dan sisihan piawai', sp: ['5.2.4'], html: R`
      \[\mu = np, \qquad \sigma^2 = npq, \qquad \sigma = \sqrt{npq}\]
      <p><strong>Min ialah nilai jangkaan</strong>: purata bilangan kejayaan jika eksperimen yang sama diulang berkali-kali. Contohnya, jika 20 soalan diteka dengan \(p = 0.25\), purata jangkaan ialah 5 betul; sesetengah percubaan memberi 3 atau 7, tetapi puratanya menghampiri 5.</p>` },
    { kind: 'visual', title: 'Bentuk taburan binomial', html: R`<p>\(X \sim B(n, p)\). Garis merah ialah min \(np\).</p>`,
      spec: { type: 'plot', x: [-0.2, 13.8], y: [-0.07, 0.62], gridX: 100, gridY: 0.1, labelStepY: 0.1, xLabel: 'r', yLabel: 'P(X = r)', params: [{ name: 'n', label: R`\(n\)`, min: 1, max: 12, step: 1, value: 8 }, { name: 'p', label: R`\(p\)`, min: 0.05, max: 0.95, step: 0.05, value: 0.3 }],
        polygons: [...Array.from({ length: 13 }, (_, r) => ({ at: (q) => (r <= q.n ? bar(r + 1, binomP(q.n, q.p, r), 0.6) : null), color: '#3467D4' })), { at: (q) => [[q.n * q.p + 1, 0], [q.n * q.p + 1, 0.6]], closed: false, color: '#D9534F' }],
        labels: Array.from({ length: 13 }, (_, r) => ({ at: (q) => (r <= q.n ? [r + 1, -0.035] : null), text: String(r) })),
        readout: (q, { fmt }) => R`\(\mu = np = ${fmt(r3(q.n * q.p))}\), \(\sigma^2 = npq = ${fmt(r3(q.n * q.p * (1 - q.p)))}\), \(\sigma = ${fmt(r3(Math.sqrt(q.n * q.p * (1 - q.p))))}\); \(P(X = 0) = ${fmt(r4((1 - q.p) ** q.n))}\).` },
      alt: R`Carta bar taburan binomial B(n, p) dengan garis merah pada min np. Dengan n = 8 dan p = 0.3, bar tertinggi pada r = 2 (P ≈ 0.2965), min = 2.4 dan sisihan piawai ≈ 1.296. Dengan p = 0.5 graf simetri; p > 0.5 menganjak puncak ke kanan.` },
    { kind: 'concept', title: 'Masalah taburan binomial', sp: ['5.2.5'], html: R`<p>Kenal pasti "kejayaan", \(n\) dan \(p\); semak syarat binomial; terjemah perkataan kepada ketaksamaan ("sekurang-kurangnya 5" ialah \(X \ge 5\), "paling banyak 2" ialah \(X \le 2\), "lebih daripada 2" ialah \(X > 2\)); kemudian <strong>tafsir</strong> jawapan dalam konteks.</p>` },
    { kind: 'formula', items: [{ tex: R`P(X = r) = {}^nC_r\,p^r q^{n - r}, \quad q = 1 - p`, html: R`\(X \sim B(n, p)\).` }, { tex: R`\mu = np, \quad \sigma = \sqrt{npq}`, html: R`Min (nilai jangkaan) dan sisihan piawai.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['5.2.1'], question: R`Adakah situasi ini taburan binomial? "Sebiji dadu dilambung 10 kali; \(X\) ialah bilangan kali mendapat 6."`, given: R`situasi`, find: R`ya/tidak, dengan sebab`, method: R`Semak empat syarat.`, steps: [{ do: R`\(n = 10\) tetap; dua hasil (6 atau bukan 6); \(p = \tfrac16\) tetap; lambungan tidak bersandar` }], check: R`Semua syarat dipenuhi ✓`, conclusion: R`Ya: \(X \sim B\left(10, \tfrac16\right)\).` },
      { level: 'sederhana', sp: ['5.2.2'], question: R`Kebarangkalian sebuah mentol rosak ialah 0.2. Tiga mentol dipilih. Guna gambar rajah pokok untuk mencari kebarangkalian tepat satu rosak.`, given: R`\(n = 3\), \(p = 0.2\)`, find: R`\(P(X = 1)\)`, method: R`Laluan dengan tepat satu "rosak".`, steps: [{ do: R`Laluan: RBB, BRB, BBR (R = rosak, B = baik), setiap satu \(0.2 \times 0.8^2 = 0.128\)` }, { do: R`\(3 \times 0.128 = 0.384\)`, why: R`Bilangan laluan = \({}^3C_1 = 3\).` }], check: R`Rumus: \({}^3C_1(0.2)(0.8)^2 = 0.384\) ✓`, conclusion: R`0.384.` },
      { level: 'sederhana', sp: ['5.2.2'], question: R`\(X \sim B(10, 0.3)\). Cari (a) \(P(X = 2)\), (b) \(P(X \ge 1)\).`, given: R`\(n = 10\), \(p = 0.3\)`, find: R`dua kebarangkalian`, method: R`Rumus; pelengkap.`, steps: [{ do: R`(a) \({}^{10}C_2(0.3)^2(0.7)^8 = 45 \times 0.09 \times 0.057648 = 0.2335\)` }, { do: R`(b) \(1 - P(X = 0) = 1 - 0.7^{10} = 0.9718\)`, why: R`Lebih pantas daripada menjumlahkan 10 sebutan.` }], check: R`Kedua-duanya di antara 0 dan 1 ✓`, conclusion: R`0.2335; 0.9718.` },
      { level: 'sederhana', sp: ['5.2.3'], question: R`Bina jadual taburan bagi \(X \sim B(4, 0.5)\).`, given: R`\(n = 4\), \(p = 0.5\)`, find: R`jadual`, method: R`\({}^4C_r(0.5)^4\).`, steps: [{ do: R`\(P(X = r) = \dfrac{{}^4C_r}{16}\): \(\tfrac{1}{16}, \tfrac{4}{16}, \tfrac{6}{16}, \tfrac{4}{16}, \tfrac{1}{16}\)` }], check: R`Jumlah \(\tfrac{16}{16} = 1\), simetri kerana \(p = 0.5\) ✓`, conclusion: R`0.0625, 0.25, 0.375, 0.25, 0.0625.` },
      { level: 'sederhana', sp: ['5.2.4'], question: R`Seorang murid meneka jawapan 20 soalan aneka pilihan (4 pilihan setiap satu). Cari min dan sisihan piawai bilangan jawapan betul, dan tafsir min.`, given: R`\(n = 20\), \(p = 0.25\)`, find: R`\(\mu\), \(\sigma\)`, method: R`\(np\), \(\sqrt{npq}\).`, steps: [{ do: R`\(\mu = 20 \times 0.25 = 5\)` }, { do: R`\(\sigma = \sqrt{20 \times 0.25 \times 0.75} = \sqrt{3.75} = 1.936\)` }], check: R`Min di antara 0 dan 20 ✓`, conclusion: R`\(\mu = 5\), \(\sigma = 1.936\). Jika meneka berulang kali, purata markah ialah 5 soalan betul.` },
      { level: 'mencabar', sp: ['5.2.5'], question: R`80% benih sejenis cili bercambah. Enam benih ditanam. Cari kebarangkalian sekurang-kurangnya 5 bercambah, dan tafsir.`, given: R`\(n = 6\), \(p = 0.8\)`, find: R`\(P(X \ge 5)\)`, method: R`\(P(X = 5) + P(X = 6)\).`, steps: [{ do: R`\(P(X = 5) = 6(0.8)^5(0.2) = 0.3932\)` }, { do: R`\(P(X = 6) = 0.8^6 = 0.2621\)` }, { do: R`\(P(X \ge 5) = 0.6554\)` }], check: R`Min \(= 4.8\), jadi 5 atau 6 ialah hasil yang lazim ✓`, conclusion: R`0.6554: kira-kira 2 daripada 3 dulang 6 benih akan mempunyai sekurang-kurangnya 5 benih bercambah.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(P(X \ge 1) = 1 - P(X = 1)\)`, why: R`Pelengkap bagi "sekurang-kurangnya 1" ialah "tiada".`, fix: R`\(1 - P(X = 0)\).` },
      { wrong: R`Guna binomial untuk cabutan tanpa pengembalian daripada kumpulan kecil.`, why: R`\(p\) berubah selepas setiap cabutan; syarat tidak dipenuhi.`, fix: R`Semak empat syarat sebelum guna binomial.` },
    ] },
    { kind: 'summary', points: [R`\(X \sim B(n, p)\): \(n\) tetap, dua hasil, \(p\) tetap, tak bersandar.`, R`\(P(X = r) = {}^nC_r p^r q^{n - r}\); guna pelengkap untuk "sekurang-kurangnya".`, R`\(\mu = np\) (nilai jangkaan), \(\sigma = \sqrt{npq}\).`] },
    { kind: 'next', html: R`<p>Apabila pemboleh ubah selanjar (tinggi, jisim), kita perlukan <strong>5.3 Taburan Normal</strong>.</p>`, links: [{ href: '#/nota/t5-5/5.3', label: '5.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 5.3
export const S5_3 = {
  id: '5.3', sk: '5.3', title: 'Taburan Normal', sp: ['5.3.1', '5.3.2', '5.3.3', '5.3.4', '5.3.5'], status: 'published', minutes: 70,
  sections: [
    { kind: 'intro', title: 'Lengkung loceng', html: R`<p>Ukur tinggi 1000 murid dan lukis histogram. Kebanyakan murid berhampiran purata, dan semakin jauh dari purata semakin sedikit. Bentuknya seperti loceng. Banyak data semula jadi (tinggi, jisim, ralat ukuran, markah) mengikut bentuk ini, iaitu <strong>taburan normal</strong>.</p>` },
    { kind: 'concept', title: 'Ciri-ciri graf taburan normal', sp: ['5.3.1'], html: R`
      <p>Jika \(X\) selanjar dan bertaburan normal dengan min \(\mu\) dan sisihan piawai \(\sigma\), kita tulis \(X \sim N(\mu, \sigma^2)\). Graf fungsi ketumpatannya:</p>
      <ul><li>berbentuk loceng dan <strong>simetri</strong> pada garis \(x = \mu\);</li><li>min = median = mod = \(\mu\) (puncak);</li><li>jumlah luas di bawah lengkung = 1; luas di antara \(a\) dan \(b\) = \(P(a < X < b)\);</li><li>hujung lengkung menghampiri paksi-\(x\) tetapi tidak menyentuhnya;</li><li>\(\sigma\) lebih besar: lengkung lebih lebar dan rendah.</li></ul>
      <p><strong>Variasi rawak dan Hukum Bilangan Besar:</strong> satu ukuran individu tidak dapat diramal, tetapi apabila bilangan cerapan sangat besar, histogram menghampiri lengkung normal dan min sampel menghampiri \(\mu\). Untuk pemboleh ubah selanjar, \(P(X = a) = 0\), jadi \(P(X < a) = P(X \le a)\).</p>` },
    { kind: 'concept', title: 'Taburan normal piawai', sp: ['5.3.2', '5.3.3'], html: R`
      <p>Setiap taburan normal mempunyai \(\mu\) dan \(\sigma\) yang berbeza, jadi kita tukarkan semuanya kepada satu taburan rujukan: <strong>taburan normal piawai</strong> \(Z \sim N(0, 1)\), dengan</p>
      \[Z = \frac{X - \mu}{\sigma}\]
      <p><strong>Skor piawai \(Z\)</strong> memberitahu berapa sisihan piawai sesuatu nilai berada di atas (\(Z > 0\)) atau di bawah (\(Z < 0\)) min. Contohnya \(Z = 1.6\): 1.6 sisihan piawai di atas min. Graf \(Z\) ialah graf \(X\) yang dianjak supaya pusatnya di 0 dan diskalakan supaya \(\sigma = 1\); luas yang sepadan tidak berubah.</p>` },
    { kind: 'concept', title: 'Mencari kebarangkalian', sp: ['5.3.4'], html: R`
      <p><strong>Jadual Taburan Normal Piawai</strong> memberi \(Q(z) = P(Z > z)\) bagi \(z \ge 0\). Dengan simetri:</p>
      <ul><li>\(P(Z > z) = Q(z)\); \(P(Z < z) = 1 - Q(z)\) (\(z > 0\))</li><li>\(P(Z < -z) = Q(z)\); \(P(Z > -z) = 1 - Q(z)\)</li><li>\(P(a < Z < b)\): luas di antara, iaitu jumlah 1 tolak dua hujung (lakar dahulu!)</li></ul>
      <p><strong>Songsang:</strong> diberi kebarangkalian, cari \(z\) daripada jadual (contohnya \(P(Z > z) = 0.025 \Rightarrow z = 1.96\)), kemudian \(x = \mu + z\sigma\). Kalkulator atau aplikasi boleh digunakan untuk menyemak.</p>` },
    { kind: 'visual', title: 'Luas di bawah lengkung normal', html: R`<p>Taburan normal piawai \(Z\). Ubah \(a\) dan \(b\); luas berlorek ialah \(P(a < Z < b)\).</p>`,
      spec: { type: 'plot', x: [-3.6, 3.6], y: [-0.03, 0.45], gridX: 1, gridY: 0.1, labelStepX: 1, labelStepY: 0.1, xLabel: 'z', yLabel: ' ', params: [{ name: 'a', label: R`\(a\)`, min: -3, max: 3, step: 0.1, value: -1 }, { name: 'b', label: R`\(b\)`, min: -3, max: 3, step: 0.1, value: 1 }],
        curves: [{ f: (z) => pdf(z) }],
        shade: { f: (z) => pdf(z), from: (p) => Math.min(p.a, p.b), to: (p) => Math.max(p.a, p.b) },
        readout: (p, { fmt }) => { const lo = Math.min(p.a, p.b), hi = Math.max(p.a, p.b); return R`\(P(${fmt(r3(lo))} < Z < ${fmt(r3(hi))}) = ${fmt(r4(Phi(hi) - Phi(lo)))}\).${lo === -hi ? ` Simetri: dua hujung masing-masing \\(${fmt(r4(1 - Phi(hi)))}\\).` : ''}`; } },
      alt: R`Lengkung normal piawai berbentuk loceng berpusat di z = 0, dengan luas berlorek di antara a dan b. Dengan a = −1 dan b = 1, luas ialah 0.6827 (kira-kira 68%). Dengan a = −2 dan b = 2, luas ialah 0.9545; dengan −3 hingga 3, 0.9973.` },
    { kind: 'concept', title: 'Masalah taburan normal', sp: ['5.3.5'], html: R`<ol><li>Tulis \(X \sim N(\mu, \sigma^2)\) dan apa yang dicari.</li><li>Lakar lengkung dan lorek rantau yang dikehendaki.</li><li>Tukar kepada \(Z\), guna jadual (atau songsang jadual).</li><li>Tafsir: kebarangkalian, peratusan, atau bilangan (\(\times\) jumlah).</li></ol>` },
    { kind: 'formula', items: [{ tex: R`Z = \frac{X - \mu}{\sigma}, \quad Z \sim N(0, 1)`, html: R`Skor piawai.` }, { tex: R`P(Z < -z) = P(Z > z), \quad P(Z < z) = 1 - P(Z > z)`, html: R`Simetri lengkung.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['5.3.1'], question: R`Lakar dan bandingkan graf \(X \sim N(50, 4^2)\) dan \(Y \sim N(50, 8^2)\).`, given: R`min sama, sisihan piawai berbeza`, find: R`perbandingan bentuk`, method: R`Ciri-ciri graf normal.`, steps: [{ do: R`Kedua-duanya simetri pada \(x = 50\) (min = median = mod = 50)` }, { do: R`\(Y\) mempunyai \(\sigma\) dua kali ganda: lengkungnya lebih lebar dan puncaknya lebih rendah`, why: R`Jumlah luas mesti kekal 1, jadi jika lengkung melebar, ia mesti merendah.` }], check: R`Kira-kira 68% data dalam \(\mu \pm \sigma\): 46 hingga 54 bagi \(X\), 42 hingga 58 bagi \(Y\) ✓`, conclusion: R`Paksi simetri sama; \(Y\) lebih tersebar.` },
      { level: 'sederhana', sp: ['5.3.2'], question: R`\(X \sim N(50, 4^2)\). Tunjukkan bahawa \(P(X < 56) = P(Z < 1.5)\), dan terangkan perkaitan antara kedua-dua graf.`, given: R`\(\mu = 50\), \(\sigma = 4\)`, find: R`kesetaraan`, method: R`Penjelmaan \(Z = \tfrac{X - \mu}{\sigma}\).`, steps: [{ do: R`\(X < 56 \iff \dfrac{X - 50}{4} < \dfrac{56 - 50}{4} \iff Z < 1.5\)`, why: R`Menolak dan membahagi dengan nombor positif tidak mengubah ketaksamaan.` }, { do: R`Graf \(Z\): graf \(X\) dianjak 50 ke kiri dan dimampatkan dengan faktor 4, jadi luas berlorek sama` }], check: R`\(P(Z < 1.5) = 1 - 0.0668 = 0.9332\) ✓`, conclusion: R`Kedua-dua kebarangkalian sama (0.9332).` },
      { level: 'mudah', sp: ['5.3.3'], question: R`Markah ujian \(X \sim N(60, 5^2)\). Cari skor piawai bagi markah 68 dan tafsir.`, given: R`\(\mu = 60\), \(\sigma = 5\), \(x = 68\)`, find: R`\(Z\)`, method: R`\(Z = \tfrac{x - \mu}{\sigma}\).`, steps: [{ do: R`\(Z = \dfrac{68 - 60}{5} = 1.6\)` }], check: R`68 di atas min, jadi \(Z > 0\) ✓`, conclusion: R`\(Z = 1.6\): markah itu 1.6 sisihan piawai di atas min.` },
      { level: 'sederhana', sp: ['5.3.4'], question: R`Cari (a) \(P(Z > 1.2)\), (b) \(P(-0.5 < Z < 1.2)\).`, given: R`\(Z \sim N(0, 1)\)`, find: R`dua kebarangkalian`, method: R`Jadual dan simetri; lakar.`, steps: [{ do: R`(a) Jadual: \(Q(1.2) = 0.1151\)` }, { do: R`(b) \(1 - P(Z < -0.5) - P(Z > 1.2) = 1 - 0.3085 - 0.1151 = 0.5764\)`, why: R`\(P(Z < -0.5) = Q(0.5) = 0.3085\) dengan simetri.` }], check: R`(b) melebihi 0.5 kerana rantau merangkumi pusat ✓`, conclusion: R`0.1151; 0.5764.` },
      { level: 'sederhana', sp: ['5.3.4'], question: R`\(X \sim N(50, 4^2)\). Cari \(P(46 < X < 56)\).`, given: R`\(\mu = 50\), \(\sigma = 4\)`, find: R`kebarangkalian`, method: R`Tukar kedua-dua had kepada \(Z\).`, steps: [{ do: R`\(z_1 = \tfrac{46 - 50}{4} = -1\), \(z_2 = \tfrac{56 - 50}{4} = 1.5\)` }, { do: R`\(1 - Q(1) - Q(1.5) = 1 - 0.1587 - 0.0668 = 0.7745\)` }], check: R`Antara 0.68 (±1σ) dan 0.95 (±2σ) ✓`, conclusion: R`0.7745.` },
      { level: 'mencabar', sp: ['5.3.4'], question: R`Cari \(z\) jika \(P(Z > z) = 0.025\), dan \(k\) jika \(P(Z < k) = 0.05\).`, given: R`kebarangkalian`, find: R`\(z\), \(k\)`, method: R`Songsang jadual.`, steps: [{ do: R`Jadual: \(Q(1.96) = 0.0250\), jadi \(z = 1.96\)` }, { do: R`\(P(Z < k) = 0.05 < 0.5\), jadi \(k\) negatif: \(Q(-k) = 0.05 \Rightarrow -k = 1.645\), \(k = -1.645\)` }], check: R`Hujung kiri kecil memerlukan \(k\) negatif ✓`, conclusion: R`\(z = 1.96\); \(k = -1.645\).` },
      { level: 'mencabar', sp: ['5.3.5'], question: R`Jisim paket beras \(X \sim N(500, 8^2)\) gram. (a) Berapa peratus paket kurang daripada 490 g? (b) Paket 5% terberat diberi label "premium". Cari jisim minimum label premium.`, given: R`\(\mu = 500\), \(\sigma = 8\)`, find: R`peratus; jisim minimum`, method: R`(a) \(Z\) dan jadual; (b) songsang jadual.`, steps: [{ do: R`(a) \(Z = \tfrac{490 - 500}{8} = -1.25\); \(P(Z < -1.25) = Q(1.25) = 0.1056\): 10.56%` }, { do: R`(b) \(P(Z > z) = 0.05 \Rightarrow z = 1.645\)` }, { do: R`\(x = 500 + 1.645(8) = 513.16\) g` }], check: R`(b) di atas min; (a) di bawah min ✓`, conclusion: R`10.56%; 513.16 g.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(P(Z < -1.25) = 1 - 0.1056\)`, why: R`Hujung kiri kecil; lakaran menunjukkan luas itu sama dengan hujung kanan \(Q(1.25)\).`, fix: R`Lakar dahulu, kemudian guna simetri.` },
      { wrong: R`\(Z = \dfrac{\mu - x}{\sigma}\)`, why: R`Tanda terbalik.`, fix: R`\(Z = \tfrac{x - \mu}{\sigma}\).` },
      { wrong: R`Guna varians \(\sigma^2 = 64\) sebagai pembahagi.`, why: R`\(N(500, 8^2)\): pembahagi ialah \(\sigma = 8\).`, fix: R`Ambil punca kuasa dua varians.` },
    ] },
    { kind: 'summary', points: [R`Lengkung loceng simetri pada \(\mu\); jumlah luas 1.`, R`\(Z = \tfrac{X - \mu}{\sigma}\), \(Z \sim N(0, 1)\).`, R`Jadual memberi \(P(Z > z)\); lakar dan guna simetri; songsang untuk mencari \(z\).`] },
    { kind: 'next', html: R`<p>Ini melengkapkan bidang Statistik dalam Teras. Seterusnya, <strong>Fungsi Trigonometri</strong> (Bab 6).</p>`, links: [{ href: '#/bab/t5-5', label: 'Kembali ke Bab 5' }] },
  ],
};

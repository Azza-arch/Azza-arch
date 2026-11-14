// T5 Bab 3 Pengamiran (SP 3.1.1–3.4.2; the DSKP has no SP 3.4.1). Original.
// DSKP (PDF 120–123, verified as page images): dynamic software encouraged;
// real-life situations; exploration. ∫axⁿ dx limited to a constant, n integer,
// n ≠ −1; the constant c must be emphasised. ∫(axⁿ) = a∫xⁿ; ∫[f ± g] = ∫f ± ∫g.
// (ax + b)ⁿ, n integer ≠ −1 (substitution may be used). Curve from gradient
// function. Definite integral properties ∫ₐᵇ = −∫ᵦᵃ and ∫ₐᶜ = ∫ₐᵇ + ∫ᵦᶜ;
// diagrams emphasised; Riemann sums: area = had Σ yᵢδx = ∫ y dx; meaning of
// positive/negative area; area between two curves; volume = had Σ πyᵢ²δx = ∫πy²dx
// (and ∫πx²dy); volume of a region between two curves NOT included.
const R = String.raw;
const r3 = (v) => +v.toFixed(3);

// ---------------------------------------------------------------- 3.1
export const S3_1 = {
  id: '3.1', sk: '3.1', title: 'Pengamiran sebagai Songsangan Pembezaan', sp: ['3.1.1'], status: 'review', minutes: 30,
  sections: [
    { kind: 'intro', title: 'Berundur dari kecerunan', html: R`<p>Dalam Bab 2, kita diberi fungsi dan mencari kecerunannya. Sekarang soalannya terbalik: kita tahu <strong>kecerunan</strong> (atau kadar perubahan) dan mahu mencari fungsi asal. Contohnya, jika kita tahu kadar air mengalir ke dalam tangki setiap minit, berapakah jumlah air? Proses songsang ini ialah <strong>pengamiran</strong>.</p>` },
    { kind: 'concept', title: 'Perkaitan pembezaan dan pengamiran', sp: ['3.1.1'], html: R`
      <p>Jika \(\dfrac{d}{dx}\big(F(x)\big) = f(x)\), maka</p>
      \[\int f(x)\,dx = F(x) + c\]
      <p>dibaca "kamiran \(f(x)\) terhadap \(x\)". Contohnya \(\tfrac{d}{dx}(x^3) = 3x^2\), jadi \(\int 3x^2\,dx = x^3 + c\).</p>
      <p><strong>Mengapa + c?</strong> \(x^3\), \(x^3 + 5\) dan \(x^3 - 2\) semuanya mempunyai terbitan \(3x^2\), kerana terbitan pemalar ialah 0. Jadi daripada kecerunan sahaja, kita tidak tahu pemalarnya. \(c\) dipanggil <strong>pemalar pengamiran</strong>, dan \(F(x) + c\) mewakili <em>satu keluarga</em> lengkung.</p>` },
    { kind: 'visual', title: 'Satu kecerunan, banyak lengkung', html: R`<p>Lengkung \(y = x^3 - 3x + c\). Ubah \(c\). Tangen pada \(x = 1.5\) sentiasa selari, kerana semua lengkung mempunyai \(\tfrac{dy}{dx} = 3x^2 - 3\).</p>`,
      spec: { type: 'plot', x: [-3, 3], y: [-6, 6], params: [{ name: 'c', label: R`\(c\)`, min: -3, max: 3, step: 0.5, value: 0 }],
        curves: [{ f: (x) => x ** 3 - 3 * x - 2, color: '#C9CED8' }, { f: (x) => x ** 3 - 3 * x + 2, color: '#C9CED8' }, { f: (x, p) => x ** 3 - 3 * x + p.c, color: '#3467D4' }, { f: (x, p) => 3.75 * (x - 1.5) + 1.5 ** 3 - 4.5 + p.c, color: '#2E9E6B' }],
        points: [{ at: (p) => [1.5, 1.5 ** 3 - 4.5 + p.c], label: 'x = 1.5' }],
        readout: (p, { fmt }) => R`\(y = x^3 - 3x ${p.c < 0 ? '-' : '+'} ${fmt(Math.abs(p.c))}\); kecerunan di \(x = 1.5\) \(= 3(1.5)^2 - 3 = 3.75\) bagi setiap \(c\).` },
      alt: R`Keluarga lengkung y = x³ − 3x + c. Lengkung biru dianjak ke atas atau ke bawah apabila c berubah, dengan dua lengkung kelabu (c = −2 dan c = 2) sebagai rujukan. Tangen hijau pada x = 1.5 sentiasa mempunyai kecerunan 3.75, jadi semua tangen pada x yang sama selari. Inilah sebabnya pengamiran memberi + c.` },
    { kind: 'formula', items: [{ tex: R`\frac{d}{dx}\big(F(x)\big) = f(x) \iff \int f(x)\,dx = F(x) + c`, html: R`Pengamiran ialah songsangan pembezaan.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['3.1.1'], question: R`Diberi \(\dfrac{d}{dx}(x^4 - 2x) = 4x^3 - 2\), cari \(\int (4x^3 - 2)\,dx\).`, given: R`satu terbitan`, find: R`kamiran`, method: R`Songsangan pembezaan.`, steps: [{ do: R`\(\int (4x^3 - 2)\,dx = x^4 - 2x + c\)` }], check: R`\(\tfrac{d}{dx}(x^4 - 2x + c) = 4x^3 - 2\) ✓`, conclusion: R`\(x^4 - 2x + c\).` },
      { level: 'sederhana', sp: ['3.1.1'], question: R`Diberi \(\dfrac{d}{dx}\left(\dfrac{x}{x + 1}\right) = \dfrac{1}{(x + 1)^2}\), cari \(\displaystyle\int \frac{5}{(x + 1)^2}\,dx\).`, given: R`terbitan suatu hasil bahagi`, find: R`kamiran`, method: R`Gunakan maklumat terbalik; keluarkan pemalar 5.`, steps: [{ do: R`\(\int \dfrac{1}{(x + 1)^2}\,dx = \dfrac{x}{x + 1} + c\)` }, { do: R`\(\int \dfrac{5}{(x + 1)^2}\,dx = \dfrac{5x}{x + 1} + c\)`, why: R`Pemalar dibawa keluar: \(\int 5f\,dx = 5\int f\,dx\). (\(5c\) masih pemalar, ditulis \(c\).)` }], check: R`Petua hasil bahagi: \(\tfrac{d}{dx}\tfrac{5x}{x + 1} = \tfrac{5(x + 1) - 5x}{(x + 1)^2} = \tfrac{5}{(x + 1)^2}\) ✓`, conclusion: R`\(\tfrac{5x}{x + 1} + c\).` },
      { level: 'mencabar', sp: ['3.1.1'], question: R`Tunjukkan bahawa \(\dfrac{d}{dx}\big(x(2x - 1)^3\big) = (2x - 1)^2(8x - 1)\), dan seterusnya cari \(\int (2x - 1)^2(8x - 1)\,dx\).`, given: R`hasil darab`, find: R`terbitan; kamiran`, method: R`Petua hasil darab, kemudian songsangkan.`, steps: [{ do: R`\(\dfrac{d}{dx} = (2x - 1)^3 + x \cdot 3(2x - 1)^2 \cdot 2 = (2x - 1)^2\big[(2x - 1) + 6x\big]\)` }, { do: R`\(= (2x - 1)^2(8x - 1)\)` }, { do: R`Maka \(\int (2x - 1)^2(8x - 1)\,dx = x(2x - 1)^3 + c\)` }], check: R`Pada \(x = 1\): \(1 \cdot 7 = 7\) dan terbitan berangka \(x(2x - 1)^3\) juga 7 ✓`, conclusion: R`\(x(2x - 1)^3 + c\).` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(\int 3x^2\,dx = x^3\)`, why: R`Banyak fungsi mempunyai terbitan \(3x^2\).`, fix: R`Sentiasa tambah \(+ c\) bagi kamiran tak tentu.` }] },
    { kind: 'summary', points: [R`\(\tfrac{d}{dx}F = f \iff \int f\,dx = F + c\).`, R`\(c\): pemalar pengamiran; satu keluarga lengkung selari.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>3.2</strong>: rumus untuk mengamir terus.</p>`, links: [{ href: '#/nota/t5-3/3.2', label: '3.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 3.2
export const S3_2 = {
  id: '3.2', sk: '3.2', title: 'Kamiran Tak Tentu', sp: ['3.2.1', '3.2.2', '3.2.3', '3.2.4'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Membalikkan petua kuasa', html: R`<p>Pembezaan: darab dengan kuasa, kemudian kurangkan kuasa. Pengamiran membalikkan setiap langkah dalam tertib terbalik: <strong>naikkan kuasa, kemudian bahagi</strong> dengan kuasa baharu.</p>` },
    { kind: 'concept', title: 'Rumus kamiran tak tentu', sp: ['3.2.1'], html: R`
      <p>Secara aruhan: \(\tfrac{d}{dx}\left(\tfrac{x^{n + 1}}{n + 1}\right) = x^n\). Jadi</p>
      \[\int ax^n\,dx = \frac{ax^{n + 1}}{n + 1} + c, \quad n \text{ integer}, \ n \ne -1\]
      <p><strong>Mengapa \(n \ne -1\)?</strong> Rumus akan membahagi dengan \(n + 1 = 0\). (Kamiran \(\tfrac1x\) memerlukan fungsi lain yang di luar skop bab ini.) Kes khas: \(\int a\,dx = ax + c\).</p>` },
    { kind: 'concept', title: 'Fungsi algebra', sp: ['3.2.2'], html: R`
      <ul><li>\(\int ax^n\,dx = a\int x^n\,dx\) (pemalar boleh dibawa keluar).</li><li>\(\int [f(x) \pm g(x)]\,dx = \int f(x)\,dx \pm \int g(x)\,dx\) (amir sebutan demi sebutan).</li></ul>
      <p>Seperti pembezaan, tulis semula dahulu: \(\dfrac{4}{x^3} = 4x^{-3}\); kembangkan \((x + 2)(x - 1)\); pisahkan \(\dfrac{x^3 + 1}{x^2} = x + x^{-2}\). <strong>Tiada</strong> petua hasil darab untuk pengamiran: \(\int uv\,dx \ne \int u\,dx \cdot \int v\,dx\).</p>` },
    { kind: 'concept', title: 'Fungsi berbentuk (ax + b)ⁿ', sp: ['3.2.3'], html: R`
      <p>Gantikan \(u = ax + b\), maka \(\tfrac{du}{dx} = a\), iaitu \(dx = \tfrac{du}{a}\):</p>
      \[\int (ax + b)^n\,dx = \int u^n\,\frac{du}{a} = \frac{(ax + b)^{n + 1}}{a(n + 1)} + c, \quad n \ne -1\]
      <p>Bahagi dengan \(a\) membatalkan faktor \(a\) yang akan muncul daripada petua rantai apabila kita membezakan semula.</p>` },
    { kind: 'concept', title: 'Persamaan lengkung daripada fungsi kecerunan', sp: ['3.2.4'], html: R`<p>Jika \(\dfrac{dy}{dx}\) diberi, \(y = \int \dfrac{dy}{dx}\,dx\) memberi satu keluarga lengkung. Satu titik pada lengkung menentukan nilai \(c\), jadi satu lengkung khusus dipilih.</p>` },
    { kind: 'visual', title: 'Memilih satu lengkung melalui titik', html: R`<p>\(\dfrac{dy}{dx} = 2x - 4\), jadi \(y = x^2 - 4x + c\). Lengkung mesti melalui \((1, k)\). Ubah \(k\).</p>`,
      spec: { type: 'plot', x: [-2, 6], y: [-6, 8], params: [{ name: 'k', label: R`\(k\)`, min: -4, max: 5, step: 0.5, value: 2 }],
        curves: [{ f: (x, p) => x * x - 4 * x + (p.k + 3) }],
        points: [{ at: (p) => [1, p.k], label: '(1, k)' }],
        readout: (p, { fmt }) => R`\(k = 1 - 4 + c \Rightarrow c = ${fmt(p.k + 3)}\); \(y = x^2 - 4x ${p.k + 3 < 0 ? '-' : '+'} ${fmt(Math.abs(p.k + 3))}\).` },
      alt: R`Parabola y = x² − 4x + c yang melalui titik (1, k). Apabila k = 2, c = 5 dan lengkung ialah y = x² − 4x + 5. Mengubah k menganjak parabola secara menegak; bentuk dan kecerunan pada setiap x tidak berubah.` },
    { kind: 'formula', items: [{ tex: R`\int ax^n\,dx = \frac{ax^{n + 1}}{n + 1} + c \ (n \ne -1)`, html: R`Naikkan kuasa, bahagi dengan kuasa baharu.` }, { tex: R`\int (ax + b)^n\,dx = \frac{(ax + b)^{n + 1}}{a(n + 1)} + c`, html: R`Bahagi juga dengan \(a\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['3.2.1', '3.2.2'], question: R`Cari \(\int (6x^2 - 4x + 3)\,dx\).`, given: R`polinomial`, find: R`kamiran`, method: R`Sebutan demi sebutan.`, steps: [{ do: R`\(\dfrac{6x^3}{3} - \dfrac{4x^2}{2} + 3x + c = 2x^3 - 2x^2 + 3x + c\)` }], check: R`Bezakan: \(6x^2 - 4x + 3\) ✓`, conclusion: R`\(2x^3 - 2x^2 + 3x + c\).` },
      { level: 'sederhana', sp: ['3.2.2'], question: R`Cari \(\displaystyle\int \frac{4}{x^3}\,dx\).`, given: R`pecahan`, find: R`kamiran`, method: R`Tulis sebagai \(4x^{-3}\).`, steps: [{ do: R`\(\int 4x^{-3}\,dx = \dfrac{4x^{-2}}{-2} + c\)`, why: R`Kuasa naik: \(-3 + 1 = -2\); bahagi dengan \(-2\).` }, { do: R`\(= -\dfrac{2}{x^2} + c\)` }], check: R`\(\tfrac{d}{dx}(-2x^{-2}) = 4x^{-3}\) ✓`, conclusion: R`\(-\tfrac{2}{x^2} + c\).` },
      { level: 'sederhana', sp: ['3.2.3'], question: R`Cari \(\int (3x - 2)^4\,dx\).`, given: R`\((ax + b)^n\)`, find: R`kamiran`, method: R`Rumus \((ax + b)^n\) dengan \(a = 3\).`, steps: [{ do: R`\(\dfrac{(3x - 2)^5}{3 \times 5} + c = \dfrac{(3x - 2)^5}{15} + c\)` }], check: R`Bezakan: \(\tfrac{5(3x - 2)^4 \cdot 3}{15} = (3x - 2)^4\) ✓`, conclusion: R`\(\tfrac{(3x - 2)^5}{15} + c\).` },
      { level: 'mencabar', sp: ['3.2.3'], question: R`Cari \(\displaystyle\int \frac{6}{(2x + 1)^4}\,dx\).`, given: R`pecahan dengan \((ax + b)^n\)`, find: R`kamiran`, method: R`\(6(2x + 1)^{-4}\), rumus dengan \(n = -4\), \(a = 2\).`, steps: [{ do: R`\(\dfrac{6(2x + 1)^{-3}}{2 \times (-3)} + c = -(2x + 1)^{-3} + c\)` }, { do: R`\(= -\dfrac{1}{(2x + 1)^3} + c\)` }], check: R`Bezakan: \(3(2x + 1)^{-4} \cdot 2 = 6(2x + 1)^{-4}\) ✓`, conclusion: R`\(-\tfrac{1}{(2x + 1)^3} + c\).` },
      { level: 'mencabar', sp: ['3.2.4'], question: R`Kecerunan suatu lengkung ialah \(\dfrac{dy}{dx} = 6x^2 - 2\), dan lengkung itu melalui \((1, 4)\). Cari persamaan lengkung.`, given: R`fungsi kecerunan dan satu titik`, find: R`\(y\)`, method: R`Kamirkan, kemudian guna titik untuk \(c\).`, steps: [{ do: R`\(y = 2x^3 - 2x + c\)` }, { do: R`\(4 = 2 - 2 + c \Rightarrow c = 4\)` }, { do: R`\(y = 2x^3 - 2x + 4\)` }], check: R`Pada \(x = 1\): \(2 - 2 + 4 = 4\) ✓`, conclusion: R`\(y = 2x^3 - 2x + 4\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(\int (3x - 2)^4\,dx = \dfrac{(3x - 2)^5}{5} + c\)`, why: R`Bezakan semula: muncul faktor 3 tambahan.`, fix: R`Bahagi juga dengan \(a = 3\).` },
      { wrong: R`\(\int x(x + 1)\,dx = \dfrac{x^2}{2} \cdot \dfrac{(x + 1)^2}{2}\)`, why: R`Tiada petua hasil darab untuk pengamiran.`, fix: R`Kembangkan dahulu: \(\int (x^2 + x)\,dx\).` },
      { wrong: R`\(\int 5\,dx = 0\)`, why: R`Itu terbitan, bukan kamiran.`, fix: R`\(\int 5\,dx = 5x + c\).` },
    ] },
    { kind: 'summary', points: [R`\(\int ax^n\,dx = \tfrac{ax^{n + 1}}{n + 1} + c\), \(n \ne -1\).`, R`\(\int (ax + b)^n\,dx = \tfrac{(ax + b)^{n + 1}}{a(n + 1)} + c\).`, R`Diberi satu titik: gantikan untuk mendapat \(c\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>3.3</strong>: kamiran tentu, yang memberi nombor, luas dan isi padu.</p>`, links: [{ href: '#/nota/t5-3/3.3', label: '3.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 3.3
const SQ = (x) => x * x;
export const S3_3 = {
  id: '3.3', sk: '3.3', title: 'Kamiran Tentu', sp: ['3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5'], status: 'review', minutes: 70,
  sections: [
    { kind: 'intro', title: 'Luas di bawah lengkung', html: R`<p>Luas segi empat tepat dan segi tiga mudah dikira. Tetapi bagaimana dengan luas di bawah lengkung \(y = x^2\)? Idea: pecahkan kepada banyak jalur nipis yang hampir segi empat tepat, jumlahkan, dan biarkan lebar jalur menghampiri sifar. Hasilnya ialah <strong>kamiran tentu</strong>.</p>` },
    { kind: 'concept', title: 'Nilai kamiran tentu dan sifatnya', sp: ['3.3.1'], html: R`
      <p>Jika \(\int f(x)\,dx = F(x) + c\), maka</p>
      \[\int_a^b f(x)\,dx = \Big[F(x)\Big]_a^b = F(b) - F(a)\]
      <p>(\(c\) terbatal, jadi tidak ditulis.) \(a\) ialah had bawah, \(b\) had atas. Sifat penting:</p>
      <ul><li>\(\displaystyle\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx\)</li><li>\(\displaystyle\int_a^c f(x)\,dx = \int_a^b f(x)\,dx + \int_b^c f(x)\,dx\), \(a < b < c\)</li><li>\(\displaystyle\int_a^b kf(x)\,dx = k\int_a^b f(x)\,dx\) dan \(\displaystyle\int_a^a f(x)\,dx = 0\)</li></ul>` },
    { kind: 'concept', title: 'Hasil tambah segi empat tepat dan luas', sp: ['3.3.2'], html: R`
      <p>Bahagikan \([a, b]\) kepada \(n\) jalur selebar \(\delta x\). Jalur ke-\(i\) hampir segi empat tepat dengan luas \(y_i\,\delta x\). Apabila \(n \to \infty\), \(\delta x \to 0\):</p>
      \[\text{luas di bawah lengkung} = \had_{\delta x \to 0} \sum_{i = 1}^{n} y_i\,\delta x = \int_a^b y\,dx\]` },
    { kind: 'visual', title: 'Lebih banyak jalur, lebih tepat', html: R`<p>\(y = x^2\) dari \(x = 0\) hingga \(x = 2\). Luas tepat \(= \int_0^2 x^2\,dx = \tfrac83 \approx 2.667\). Ubah bilangan jalur \(n\) (tinggi diambil di hujung kanan).</p>`,
      spec: { type: 'plot', x: [-0.3, 2.4], y: [-0.4, 4.4], params: [{ name: 'n', label: R`\(n\)`, min: 1, max: 40, step: 1, value: 4 }],
        curves: [{ f: (x) => SQ(x), color: '#3467D4' }],
        polygons: Array.from({ length: 40 }, (_, i) => ({ at: (p) => (i < p.n ? [[(2 * i) / p.n, 0], [(2 * (i + 1)) / p.n, 0], [(2 * (i + 1)) / p.n, SQ((2 * (i + 1)) / p.n)], [(2 * i) / p.n, SQ((2 * (i + 1)) / p.n)]] : null), color: '#E0A93B' })),
        readout: (p, { fmt }) => { let s = 0; for (let i = 1; i <= p.n; i++) s += SQ((2 * i) / p.n) * (2 / p.n); return R`\(\sum y_i\,\delta x = ${fmt(r3(s))}\) dengan \(n = ${fmt(p.n)}\); ralat \(= ${fmt(r3(s - 8 / 3))}\). Apabila \(n \to \infty\), hasil tambah \(\to \tfrac83\).`; } },
      alt: R`Lengkung y = x² dari 0 hingga 2 dengan n segi empat tepat jingga yang tingginya diambil di hujung kanan setiap jalur. Dengan n = 4, hasil tambah ialah 3.75, iaitu terlebih 1.083 daripada luas tepat 8/3 ≈ 2.667. Dengan n = 40, hasil tambah ialah 2.767. Apabila n bertambah, hasil tambah menghampiri 8/3.` },
    { kind: 'concept', title: 'Luas rantau', sp: ['3.3.3'], html: R`
      <ul><li>Jika lengkung berada <strong>di atas</strong> paksi-\(x\), \(\int_a^b y\,dx\) positif dan sama dengan luas.</li><li>Jika lengkung <strong>di bawah</strong> paksi-\(x\), kamiran itu <strong>negatif</strong>. Luas ialah nilai mutlaknya.</li><li>Jika lengkung memotong paksi dalam \([a, b]\), pecahkan pada titik potong dan tambah luas setiap bahagian. Jika tidak, bahagian positif dan negatif saling membatalkan.</li><li>Luas terhadap paksi-\(y\): \(\int_a^b x\,dy\).</li><li><strong>Di antara dua lengkung</strong>: \(\int_a^b (y_{\text{atas}} - y_{\text{bawah}})\,dx\), dengan \(a, b\) titik persilangan.</li></ul>` },
    { kind: 'visual', title: 'Luas bertanda', html: R`<p>\(y = x^2 - 4\) di bawah paksi-\(x\) bagi \(-2 < x < 2\). Ubah had atas \(b\) (had bawah \(-2\)).</p>`,
      spec: { type: 'plot', x: [-3, 4], y: [-5, 8], params: [{ name: 'b', label: R`\(b\)`, min: -1.5, max: 3.5, step: 0.5, value: 2 }],
        curves: [{ f: (x) => x * x - 4 }],
        shade: { f: (x) => x * x - 4, from: -2, to: (p) => p.b },
        readout: (p, { fmt }) => { const F = (x) => x ** 3 / 3 - 4 * x; const I = F(p.b) - F(-2); const A = p.b <= 2 ? Math.abs(I) : Math.abs(F(2) - F(-2)) + (F(p.b) - F(2)); return R`\(\int_{-2}^{${fmt(p.b)}} (x^2 - 4)\,dx = ${fmt(r3(I))}\); luas sebenar rantau berlorek \(= ${fmt(r3(A))}\).${p.b > 2 ? ' Kamiran lebih kecil daripada luas kerana bahagian negatif dan positif saling membatalkan.' : ''}`; } },
      alt: R`Graf y = x² − 4 dengan rantau berlorek di antara lengkung dan paksi-x dari x = −2 hingga x = b. Dengan b = 2, kamiran ialah −32/3 ≈ −10.667 (negatif kerana di bawah paksi) dan luas ialah 10.667. Dengan b = 3.5, sebahagian rantau di atas paksi, jadi kamiran (−5.042) jauh lebih kecil (dalam nilai mutlak) daripada luas sebenar (16.292).` },
    { kind: 'concept', title: 'Isi padu janaan', sp: ['3.3.4', '3.3.5'], html: R`
      <p>Kisarkan rantau di bawah \(y = f(x)\) melalui \(360^\circ\) pada paksi-\(x\). Setiap jalur menjadi <strong>silinder</strong> nipis berjejari \(y_i\) dan tebal \(\delta x\), isi padu \(\pi y_i^2\,\delta x\):</p>
      \[V = \had_{\delta x \to 0} \sum \pi y_i^2\,\delta x = \int_a^b \pi y^2\,dx \quad \text{(paksi-}x\text{)}, \qquad V = \int_a^b \pi x^2\,dy \quad \text{(paksi-}y\text{)}\]
      <p>Untuk paksi-\(y\), tulis \(x^2\) dalam sebutan \(y\), dan had ialah nilai \(y\). (Isi padu rantau di antara dua lengkung tidak termasuk dalam skop.)</p>` },
    { kind: 'formula', items: [{ tex: R`\int_a^b f(x)\,dx = F(b) - F(a)`, html: R`\(\int_a^b = -\int_b^a\); \(\int_a^c = \int_a^b + \int_b^c\).` }, { tex: R`\text{Luas} = \int_a^b y\,dx \ \text{atau}\ \int_a^b x\,dy`, html: R`Ambil nilai mutlak bagi bahagian di bawah paksi.` }, { tex: R`V_x = \int_a^b \pi y^2\,dx, \qquad V_y = \int_a^b \pi x^2\,dy`, html: R`Isi padu janaan.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['3.3.1'], question: R`Nilaikan \(\displaystyle\int_1^3 (3x^2 - 2x)\,dx\).`, given: R`kamiran tentu`, find: R`nilai`, method: R`\(\big[F(x)\big]_1^3\).`, steps: [{ do: R`\(\Big[x^3 - x^2\Big]_1^3 = (27 - 9) - (1 - 1) = 18\)` }], check: R`Positif kerana \(3x^2 - 2x > 0\) pada \([1, 3]\) ✓`, conclusion: R`18.` },
      { level: 'sederhana', sp: ['3.3.1'], question: R`Diberi \(\displaystyle\int_1^4 f(x)\,dx = 7\) dan \(\displaystyle\int_4^6 f(x)\,dx = -2\). Cari (a) \(\displaystyle\int_4^1 2f(x)\,dx\), (b) \(\displaystyle\int_1^6 f(x)\,dx\).`, given: R`dua kamiran`, find: R`(a), (b)`, method: R`Sifat kamiran tentu.`, steps: [{ do: R`(a) \(2 \times (-7) = -14\)`, why: R`Menukar had menukar tanda; pemalar 2 dibawa keluar.` }, { do: R`(b) \(7 + (-2) = 5\)` }], check: R`Sifat (b) memerlukan \(1 < 4 < 6\) ✓`, conclusion: R`\(-14\); 5.` },
      { level: 'sederhana', sp: ['3.3.2'], question: R`Anggarkan luas di bawah \(y = x^2\) dari 0 hingga 2 dengan 4 segi empat tepat, tinggi di hujung kanan. Bandingkan dengan nilai tepat.`, given: R`\(n = 4\), \(\delta x = 0.5\)`, find: R`anggaran; nilai tepat`, method: R`\(\sum y_i\,\delta x\); kamiran.`, steps: [{ do: R`\(0.5(0.25 + 1 + 2.25 + 4) = 3.75\)` }, { do: R`Tepat: \(\Big[\tfrac{x^3}{3}\Big]_0^2 = \tfrac83 = 2.667\)` }], check: R`Anggaran hujung kanan terlebih kerana lengkung menaik ✓`, conclusion: R`3.75 berbanding \(\tfrac83\).` },
      { level: 'sederhana', sp: ['3.3.3'], question: R`Cari luas rantau yang dibatasi oleh \(y = 4x - x^2\) dan paksi-\(x\).`, given: R`parabola`, find: R`luas`, method: R`Cari titik potong, kemudian kamiran.`, steps: [{ do: R`\(4x - x^2 = 0 \Rightarrow x = 0, 4\)` }, { do: R`\(\Big[2x^2 - \tfrac{x^3}{3}\Big]_0^4 = 32 - \tfrac{64}{3} = \tfrac{32}{3}\)` }], check: R`Kurang daripada segi empat tepat \(4 \times 4 = 16\) yang mengandunginya ✓`, conclusion: R`\(\tfrac{32}{3} \approx 10.667\) unit².` },
      { level: 'mencabar', sp: ['3.3.3'], question: R`Cari luas rantau di antara \(y = x^2\) dan \(y = 2x\).`, given: R`dua lengkung`, find: R`luas`, method: R`Titik persilangan; \(\int(\text{atas} - \text{bawah})\).`, steps: [{ do: R`\(x^2 = 2x \Rightarrow x = 0, 2\)` }, { do: R`Pada \(x = 1\): \(2x = 2 > x^2 = 1\), jadi garis di atas` }, { do: R`\(\displaystyle\int_0^2 (2x - x^2)\,dx = \Big[x^2 - \tfrac{x^3}{3}\Big]_0^2 = \tfrac43\)` }], check: R`Positif kerana atas tolak bawah ✓`, conclusion: R`\(\tfrac43\) unit².` },
      { level: 'mencabar', sp: ['3.3.5'], question: R`Rantau di bawah \(y = x^2\) dari \(x = 0\) hingga \(x = 2\) dikisarkan \(360^\circ\) pada paksi-\(x\). Cari isi padu janaan.`, given: R`\(y = x^2\), \(0 \le x \le 2\)`, find: R`\(V\)`, method: R`\(\int \pi y^2\,dx\).`, steps: [{ do: R`\(V = \pi\displaystyle\int_0^2 x^4\,dx = \pi\Big[\tfrac{x^5}{5}\Big]_0^2 = \tfrac{32\pi}{5}\)`, why: R`\(y^2 = (x^2)^2 = x^4\).` }], check: R`\(\tfrac{32\pi}{5} \approx 20.106\), kurang daripada silinder \(\pi(4)^2(2) = 100.5\) yang mengandunginya ✓`, conclusion: R`\(\tfrac{32\pi}{5}\) unit³.` },
      { level: 'mencabar', sp: ['3.3.4', '3.3.5'], question: R`Rantau yang dibatasi oleh \(y = x^2\), paksi-\(y\) dan garis \(y = 4\) (bagi \(x \ge 0\)) dikisarkan \(360^\circ\) pada paksi-\(y\). Cari isi padu janaan.`, given: R`\(x^2 = y\), \(0 \le y \le 4\)`, find: R`\(V\)`, method: R`\(\int \pi x^2\,dy\), had dalam \(y\).`, steps: [{ do: R`\(V = \pi\displaystyle\int_0^4 y\,dy = \pi\Big[\tfrac{y^2}{2}\Big]_0^4 = 8\pi\)` }], check: R`Bentuk mangkuk: separuh isi padu silinder \(\pi(2)^2(4) = 16\pi\) ✓`, conclusion: R`\(8\pi \approx 25.133\) unit³.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Luas di bawah paksi \(= \int_a^b y\,dx\) (negatif).`, why: R`Luas tidak negatif.`, fix: R`Ambil nilai mutlak; pecahkan pada titik potong paksi.` },
      { wrong: R`\(V = \pi\left(\int y\,dx\right)^2\)`, why: R`Setiap jalur ialah silinder \(\pi y^2\,\delta x\).`, fix: R`\(V = \int \pi y^2\,dx\): kuasa duakan dahulu, kemudian amir.` },
      { wrong: R`Untuk paksi-\(y\), guna had \(x\).`, why: R`Pengamiran terhadap \(y\).`, fix: R`Tukar had kepada nilai \(y\).` },
    ] },
    { kind: 'summary', points: [R`\(\int_a^b f\,dx = F(b) - F(a)\); sifat had.`, R`Luas = had hasil tambah jalur = \(\int y\,dx\); bahagian di bawah paksi negatif.`, R`Antara lengkung: \(\int(\text{atas} - \text{bawah})\,dx\). Isi padu: \(\int \pi y^2\,dx\) atau \(\int \pi x^2\,dy\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>3.4</strong>: masalah aplikasi.</p>`, links: [{ href: '#/nota/t5-3/3.4', label: '3.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 3.4
export const S3_4 = {
  id: '3.4', sk: '3.4', title: 'Aplikasi Pengamiran', sp: ['3.4.2'], status: 'review', minutes: 35,
  sections: [
    { kind: 'intro', title: 'Daripada kadar kepada jumlah', html: R`<p>Jika kita tahu <em>kadar</em> sesuatu (liter per minit, kos per unit, kelajuan), kamiran memberi <em>jumlah</em> keseluruhan. Bentuk lengkung pula membolehkan kita mengira luas tanah, kapasiti mangkuk atau isi padu bahan.</p><p class="note-small">Nota: DSKP mencetak SK 3.4 dengan SP 3.4.2 sahaja (tiada 3.4.1).</p>` },
    { kind: 'concept', title: 'Menyelesaikan masalah', sp: ['3.4.2'], html: R`
      <ul><li><strong>Jumlah daripada kadar:</strong> jika \(\dfrac{dQ}{dt} = r(t)\), perubahan \(Q\) dari \(t = a\) ke \(t = b\) ialah \(\displaystyle\int_a^b r(t)\,dt\).</li><li><strong>Bentuk daripada kecerunan:</strong> kamirkan fungsi kecerunan dan guna satu titik untuk \(c\).</li><li><strong>Luas dan isi padu objek:</strong> modelkan sempadan dengan fungsi, kemudian guna rumus luas atau isi padu janaan.</li></ul>` },
    { kind: 'visual', title: 'Jumlah air daripada kadar aliran', html: R`<p>Kadar aliran air \(r(t) = 3t^2 + 2\) liter/minit. Luas di bawah graf kadar dari 0 hingga \(T\) ialah jumlah air.</p>`,
      spec: { type: 'plot', x: [-0.3, 3.3], y: [-2, 32], gridY: 5, labelStepY: 10, xLabel: 't', yLabel: 'r', params: [{ name: 'T', label: R`\(T\) (minit)`, min: 0.5, max: 3, step: 0.5, value: 2 }],
        curves: [{ f: (x) => 3 * x * x + 2, domain: [0, 3.3] }],
        shade: { f: (x) => 3 * x * x + 2, from: 0, to: (p) => p.T },
        readout: (p, { fmt }) => R`\(\displaystyle\int_0^{${fmt(p.T)}} (3t^2 + 2)\,dt = \Big[t^3 + 2t\Big]_0^{${fmt(p.T)}} = ${fmt(r3(p.T ** 3 + 2 * p.T))}\) liter.` },
      alt: R`Graf kadar aliran r(t) = 3t² + 2 liter/minit untuk 0 ≤ t ≤ 3, dengan rantau di bawah graf dilorek dari 0 hingga T. Dengan T = 2, luas berlorek ialah 2³ + 2(2) = 12 liter. Dengan T = 3, jumlahnya 33 liter.` },
    { kind: 'formula', items: [{ tex: R`\Delta Q = \int_a^b \frac{dQ}{dt}\,dt`, html: R`Jumlah perubahan daripada kadar perubahan.` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['3.4.2'], question: R`Air mengalir ke dalam tangki pada kadar \(3t^2 + 2\) liter/minit. Berapa liter masuk dalam 2 minit pertama?`, given: R`kadar \(r(t)\)`, find: R`jumlah`, method: R`\(\int_0^2 r(t)\,dt\).`, steps: [{ do: R`\(\Big[t^3 + 2t\Big]_0^2 = 8 + 4 = 12\) liter` }], check: R`Kadar antara 2 dan 14 L/min selama 2 minit: jumlah antara 4 dan 28 ✓`, conclusion: R`12 liter.` },
      { level: 'mencabar', sp: ['3.4.2'], question: R`Sebuah mangkuk dibentuk dengan mengisarkan \(y = x^2\) (unit cm) dari \(y = 0\) hingga \(y = 9\) pada paksi-\(y\). Cari kapasiti mangkuk.`, given: R`\(x^2 = y\), \(0 \le y \le 9\)`, find: R`isi padu`, method: R`\(\int \pi x^2\,dy\).`, steps: [{ do: R`\(V = \pi\displaystyle\int_0^9 y\,dy = \pi\Big[\tfrac{y^2}{2}\Big]_0^9 = \tfrac{81\pi}{2}\)` }, { do: R`\(\approx 127.23\) cm³` }], check: R`Separuh silinder berjejari 3 dan tinggi 9 (\(81\pi\)) ✓`, conclusion: R`Kira-kira 127.23 cm³.` },
      { level: 'mencabar', sp: ['3.4.2'], question: R`Kecerunan sebuah lereng bukit (dalam keratan rentas) diberi oleh \(\dfrac{dy}{dx} = 0.6 - 0.12x\), dengan \(x\) dan \(y\) dalam meter dan kaki bukit di \((0, 0)\). Cari ketinggian maksimum lereng itu.`, given: R`fungsi kecerunan, titik \((0, 0)\)`, find: R`ketinggian maksimum`, method: R`Kamirkan untuk \(y\), kemudian titik pegun.`, steps: [{ do: R`\(y = 0.6x - 0.06x^2 + c\), dan \(c = 0\)` }, { do: R`\(\tfrac{dy}{dx} = 0 \Rightarrow x = 5\)` }, { do: R`\(y = 3 - 1.5 = 1.5\) m` }], check: R`\(\tfrac{d^2y}{dx^2} = -0.12 < 0\): maksimum ✓`, conclusion: R`1.5 m.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Jumlah air \(= r(2) = 14\) liter.`, why: R`\(r(2)\) ialah kadar pada saat \(t = 2\), bukan jumlah.`, fix: R`Jumlah = kamiran kadar.` }] },
    { kind: 'summary', points: [R`Jumlah = kamiran kadar.`, R`Model bentuk dengan fungsi; guna luas atau isi padu janaan.`] },
    { kind: 'next', html: R`<p>Pengamiran juga digunakan dalam <strong>Kinematik Gerakan Linear</strong> (Bab 7, elektif).</p>`, links: [{ href: '#/bab/t5-3', label: 'Kembali ke Bab 3' }] },
  ],
};

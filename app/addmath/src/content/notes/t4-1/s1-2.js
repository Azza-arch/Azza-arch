// Bab 1 · 1.2 Fungsi Gubahan (SP 1.2.1–1.2.5). Original content.
// DSKP scope: composition of TWO algebraic functions only; arrow-diagram
// representation; image/object of a composite; finding a related function
// given the composite and one function; f²(x), f³(x), …, fⁿ(x).
const R = String.raw;

export const S1_2 = {
  id: '1.2', sk: '1.2', title: 'Fungsi Gubahan', sp: ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Baucar dahulu, atau diskaun dahulu?', html: R`
      <p>Sebuah kedai memberi <strong>baucar RM20</strong> dan <strong>diskaun 20%</strong>. Bagi harga asal \(x\) ringgit, baucar memberi \(g(x) = x - 20\) dan diskaun memberi \(f(x) = 0.8x\).</p>
      <p>Untuk barang berharga RM150, cuba dua susunan:</p>
      <ul>
        <li><strong>Baucar dahulu, kemudian diskaun:</strong> \(150 - 20 = 130\), kemudian \(0.8 \times 130 = 104\). Bayar RM104.</li>
        <li><strong>Diskaun dahulu, kemudian baucar:</strong> \(0.8 \times 150 = 120\), kemudian \(120 - 20 = 100\). Bayar RM100.</li>
      </ul>
      <p>Output fungsi pertama menjadi input fungsi kedua. Gabungan seperti ini dipanggil <strong>fungsi gubahan</strong>, dan seperti contoh di atas, <strong>susunan mengubah jawapan</strong>.</p>` },
    { kind: 'concept', title: 'Maksud fg(x)', sp: ['1.2.1'], html: R`
      <p>\(fg(x)\) bermaksud \(f(g(x))\): <strong>\(g\) dikenakan dahulu</strong> pada \(x\), kemudian \(f\) dikenakan pada hasilnya. Fungsi yang paling dekat dengan \(x\) bertindak dahulu.</p>
      \[x \;\xrightarrow{\;g\;}\; g(x) \;\xrightarrow{\;f\;}\; f(g(x)) = fg(x)\]
      <p>Dalam gambar rajah anak panah, ada tiga set: \(x\) dalam set pertama, \(g(x)\) dalam set kedua, dan \(fg(x)\) dalam set ketiga. Gubahan \(fg\) ialah anak panah terus dari set pertama ke set ketiga.</p>
      <div class="callout is-warn"><p>\(fg(x)\) <strong>bukan</strong> \(f(x) \times g(x)\). Secara umum \(fg(x) \neq gf(x)\).</p></div>` },
    { kind: 'visual', title: 'Ikuti satu nilai melalui dua mesin', html: R`<p>\(f(x) = 2x + 1\) dan \(g(x) = x^2\). Gerakkan \(x\). Titik biru ialah \(fg(x)\) dan titik merah ialah \(gf(x)\).</p>`,
      spec: { type: 'plot', x: [-3, 3], y: [-2, 14], grid: 1, labelStep: 2, params: [{ name: 'x0', label: R`\(x\)`, min: -2, max: 1.5, step: 0.25, value: 1 }],
        curves: [{ f: (x) => 2 * x * x + 1, label: 'fg' }, { f: (x) => (2 * x + 1) ** 2, label: 'gf', color: '#D9534F' }],
        points: [{ at: (p) => [p.x0, 2 * p.x0 * p.x0 + 1], label: 'fg' }, { at: (p) => [p.x0, (2 * p.x0 + 1) ** 2], label: 'gf' }],
        readout: (p, { fmt }) => R`\(fg(${fmt(p.x0)})\): \(g(${fmt(p.x0)}) = ${fmt(p.x0 * p.x0)}\), kemudian \(f(${fmt(p.x0 * p.x0)}) = ${fmt(2 * p.x0 * p.x0 + 1)}\).<br>\(gf(${fmt(p.x0)})\): \(f(${fmt(p.x0)}) = ${fmt(2 * p.x0 + 1)}\), kemudian \(g(${fmt(2 * p.x0 + 1)}) = ${fmt((2 * p.x0 + 1) ** 2)}\).` },
      alt: R`Dua lengkung: fg(x) = 2x² + 1 (biru) dan gf(x) = (2x + 1)² (merah). Contohnya pada x = 1: fg(1) = f(1) = 3, tetapi gf(1) = g(3) = 9. Lengkung yang berbeza menunjukkan fg dan gf ialah fungsi yang berbeza.` },
    { kind: 'concept', title: 'Menentukan fungsi gubahan', sp: ['1.2.2'], html: R`
      <p>Untuk mencari \(fg(x)\), gantikan <strong>seluruh ungkapan</strong> \(g(x)\) ke tempat \(x\) dalam \(f\). Gunakan kurungan.</p>
      <p>Bagi \(f(x) = 3x - 1\) dan \(g(x) = x + 4\):</p>
      \[fg(x) = f(x + 4) = 3(x + 4) - 1 = 3x + 11\]
      \[gf(x) = g(3x - 1) = (3x - 1) + 4 = 3x + 3\]
      <p>Jika salah satu fungsi mempunyai nilai terkecuali, gubahannya juga mungkin ada. Contohnya, bagi \(f(x) = \dfrac{2}{x - 1}\) (\(x \ne 1\)) dan \(g(x) = x + 3\): \(fg(x) = \dfrac{2}{(x + 3) - 1} = \dfrac{2}{x + 2}\), dengan \(x \neq -2\).</p>` },
    { kind: 'concept', title: 'Imej dan objek bagi fungsi gubahan', sp: ['1.2.3'], html: R`
      <p><strong>Objek diberi:</strong> kira dari dalam ke luar. \(fg(2)\) bermaksud kira \(g(2)\) dahulu, kemudian masukkan hasilnya ke dalam \(f\).</p>
      <p><strong>Imej diberi:</strong> bina persamaan menggunakan ungkapan \(fg(x)\), kemudian selesaikan. Contoh: jika \(fg(x) = 3x + 11\) dan \(fg(k) = 26\), maka \(3k + 11 = 26\), jadi \(k = 5\).</p>` },
    { kind: 'concept', title: 'Mencari fungsi yang tidak diketahui', sp: ['1.2.4'], html: R`
      <p><strong>Kes 1: \(f\) dan \(fg\) diberi, cari \(g\).</strong> Tulis \(f(g(x))\) menggunakan peraturan \(f\), dengan \(g(x)\) sebagai "kotak", kemudian selesaikan untuk \(g(x)\).</p>
      <p>Contoh: \(f(x) = 2x + 5\) dan \(fg(x) = 6x - 1\). Maka \(2g(x) + 5 = 6x - 1\), jadi \(g(x) = 3x - 3\).</p>
      <p><strong>Kes 2: \(g\) dan \(fg\) diberi, cari \(f\).</strong> Gunakan penggantian: biar \(u = g(x)\), ungkapkan \(x\) dalam sebutan \(u\), dan masukkan ke dalam \(fg(x)\).</p>
      <p>Contoh: \(g(x) = x + 2\) dan \(fg(x) = 3x + 4\). Biar \(u = x + 2\), maka \(x = u - 2\). Jadi \(f(u) = 3(u - 2) + 4 = 3u - 2\), iaitu \(f(x) = 3x - 2\).</p>` },
    { kind: 'concept', title: 'Gubahan berulang: f²(x), f³(x), …, fⁿ(x)', sp: ['1.2.5'], html: R`
      <p>\(f^2(x)\) bermaksud \(ff(x) = f(f(x))\): kenakan \(f\) dua kali. Ia <strong>bukan</strong> \([f(x)]^2\).</p>
      <p>Bagi \(f(x) = 2x - 1\):</p>
      \[f^2(x) = 2(2x - 1) - 1 = 4x - 3, \qquad f^3(x) = 2(4x - 3) - 1 = 8x - 7\]
      <p>Coraknya: pekali \(x\) berganda setiap kali (\(2, 4, 8, \dots\)), jadi \(f^n(x) = 2^n x - (2^n - 1)\). Semak dengan \(n = 3\): \(8x - 7\) ✓.</p>` },
    { kind: 'visual', title: 'Lihat corak fⁿ(x) bagi f(x) = 2x − 1', html: R`<p>Jadual menunjukkan \(f^n(x)\) apabila \(x = 3\). Tambah nilai \(n\) sendiri untuk menguji rumus corak.</p>`,
      spec: { type: 'table', xs: [1, 2, 3, 4, 5], input: true, columns: [{ head: R`\(n\)` }, { head: R`\(f^n(3)\) (kira berulang)`, f: (n) => { if (!Number.isInteger(n) || n < 1 || n > 30) return NaN; let v = 3; for (let k = 0; k < n; k++) v = 2 * v - 1; return v; }, undefinedText: 'n mesti integer 1–30' }, { head: R`\(2^n(3) - (2^n - 1)\)`, f: (n) => (Number.isInteger(n) && n >= 1 && n <= 30 ? 2 ** n * 3 - (2 ** n - 1) : NaN), undefinedText: '—' }] },
      alt: R`Jadual f^n(3) bagi f(x) = 2x − 1: n = 1 memberi 5, n = 2 memberi 9, n = 3 memberi 17, n = 4 memberi 33, n = 5 memberi 65. Lajur ketiga, rumus 2^n(3) − (2^n − 1), memberi nilai yang sama setiap kali.` },
    { kind: 'formula', items: [
      { tex: R`fg(x) = f\big(g(x)\big)`, html: R`\(g\) dahulu, kemudian \(f\). Gubahan dalam DSKP terhad kepada dua fungsi algebra.` },
      { tex: R`f^2(x) = ff(x), \quad f^3(x) = fff(x)`, html: R`Kuasa di sini bermaksud bilangan kali fungsi dikenakan, bukan kuasa dua nilai \(f(x)\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.2.1', '1.2.3'], question: R`Diberi \(f(x) = 2x + 3\) dan \(g(x) = x^2\). Cari \(fg(2)\) dan \(gf(2)\).`, given: R`\(f(x) = 2x+3\), \(g(x) = x^2\), objek 2`, find: R`\(fg(2)\), \(gf(2)\)`, method: R`Kira dari dalam ke luar.`,
        steps: [{ do: R`\(g(2) = 4\), maka \(fg(2) = f(4) = 2(4) + 3 = 11\)`, why: R`Dalam \(fg\), \(g\) bertindak dahulu.` }, { do: R`\(f(2) = 7\), maka \(gf(2) = g(7) = 49\)`, why: R`Dalam \(gf\), \(f\) bertindak dahulu.` }],
        check: R`Dua jawapan berbeza (11 dan 49) menunjukkan susunan penting ✓`, conclusion: R`\(fg(2) = 11\), \(gf(2) = 49\).` },
      { level: 'sederhana', sp: ['1.2.2'], question: R`Diberi \(f(x) = 3x - 1\) dan \(g(x) = x + 4\). Cari \(fg(x)\) dan \(gf(x)\).`, given: R`\(f\) dan \(g\)`, find: R`ungkapan \(fg(x)\) dan \(gf(x)\)`, method: R`Gantikan seluruh fungsi dalam ke tempat \(x\) dalam fungsi luar.`,
        steps: [{ do: R`\(fg(x) = f(x + 4) = 3(x + 4) - 1 = 3x + 11\)`, why: R`Kurungan penting: pekali 3 mendarab kedua-dua sebutan \(x\) dan 4.` }, { do: R`\(gf(x) = g(3x - 1) = 3x - 1 + 4 = 3x + 3\)` }],
        check: R`Uji dengan \(x = 1\): \(g(1) = 5\), \(f(5) = 14\); dan \(3(1) + 11 = 14\) ✓`, conclusion: R`\(fg(x) = 3x + 11\), \(gf(x) = 3x + 3\).` },
      { level: 'sederhana', sp: ['1.2.3'], question: R`Diberi \(f(x) = 2x + 1\) dan \(g(x) = x - 3\). Cari \(k\) jika \(fg(k) = 9\).`, given: R`\(f\), \(g\), dan imej gubahan 9`, find: R`objek \(k\)`, method: R`Bina \(fg(x)\), kemudian selesaikan \(fg(k) = 9\).`,
        steps: [{ do: R`\(fg(x) = 2(x - 3) + 1 = 2x - 5\)` }, { do: R`\(2k - 5 = 9 \Rightarrow k = 7\)` }],
        check: R`\(g(7) = 4\), \(f(4) = 9\) ✓`, conclusion: R`\(k = 7\).` },
      { level: 'mencabar', sp: ['1.2.4'], question: R`Diberi \(f(x) = 2x + 5\) dan \(fg(x) = 6x - 1\). Cari \(g(x)\).`, given: R`\(f\) dan \(fg\)`, find: R`\(g(x)\)`, method: R`Fungsi luar \(f\) diketahui, jadi tulis \(f(g(x))\) dengan \(g(x)\) sebagai "kotak".`,
        steps: [{ do: R`\(f(g(x)) = 2g(x) + 5\)`, why: R`Peraturan \(f\): darab input dengan 2, tambah 5. Inputnya sekarang \(g(x)\).` }, { do: R`\(2g(x) + 5 = 6x - 1\)` }, { do: R`\(2g(x) = 6x - 6 \Rightarrow g(x) = 3x - 3\)` }],
        check: R`\(f(3x - 3) = 2(3x - 3) + 5 = 6x - 1\) ✓`, conclusion: R`\(g(x) = 3x - 3\).` },
      { level: 'mencabar', sp: ['1.2.4'], question: R`Diberi \(g(x) = x + 2\) dan \(fg(x) = 3x + 4\). Cari \(f(x)\).`, given: R`\(g\) dan \(fg\)`, find: R`\(f(x)\)`, method: R`Fungsi luar tidak diketahui, jadi guna penggantian \(u = g(x)\).`,
        steps: [{ do: R`Biar \(u = x + 2\), maka \(x = u - 2\)` }, { do: R`\(f(u) = 3(u - 2) + 4 = 3u - 2\)`, why: R`\(fg(x) = f(u)\). Tulis semula \(3x + 4\) dalam sebutan \(u\).` }, { do: R`\(f(x) = 3x - 2\)`, why: R`Nama pemboleh ubah tidak mengubah peraturan.` }],
        check: R`\(f(g(x)) = 3(x + 2) - 2 = 3x + 4\) ✓`, conclusion: R`\(f(x) = 3x - 2\).` },
      { level: 'mencabar', sp: ['1.2.5'], question: R`Diberi \(f(x) = 2x - 1\). Cari \(f^2(x)\) dan \(f^3(x)\), kemudian nilai \(f^4(2)\).`, given: R`\(f(x) = 2x - 1\)`, find: R`\(f^2(x)\), \(f^3(x)\), \(f^4(2)\)`, method: R`Gubah berulang kali, kemudian cari corak.`,
        steps: [{ do: R`\(f^2(x) = f(2x - 1) = 2(2x - 1) - 1 = 4x - 3\)` }, { do: R`\(f^3(x) = f(4x - 3) = 8x - 7\)` }, { do: R`Corak: \(f^n(x) = 2^n x - (2^n - 1)\), jadi \(f^4(x) = 16x - 15\)`, why: R`Pekali \(x\) berganda; pemalar sentiasa satu kurang daripada pekali.` }, { do: R`\(f^4(2) = 32 - 15 = 17\)` }],
        check: R`Kira terus: \(f(2) = 3\), \(f(3) = 5\), \(f(5) = 9\), \(f(9) = 17\) ✓`, conclusion: R`\(f^2(x) = 4x - 3\), \(f^3(x) = 8x - 7\), \(f^4(2) = 17\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(fg(x) = f(x) \times g(x)\)`, why: R`Gubahan ialah "masukkan output satu fungsi ke dalam fungsi lain", bukan pendaraban.`, fix: R`\(fg(x) = f(g(x))\).` },
      { wrong: R`Bagi \(fg(2)\), kira \(f(2)\) dahulu.`, why: R`Fungsi paling kanan (paling dekat dengan \(x\)) bertindak dahulu.`, fix: R`Kira \(g(2)\) dahulu, kemudian \(f\) bagi hasil itu.` },
      { wrong: R`\(f(x) = 3x - 1,\ g(x) = x + 4 \Rightarrow fg(x) = 3x + 4 - 1\)`, why: R`Kurungan tertinggal, jadi 3 hanya mendarab \(x\), bukan seluruh \(g(x)\).`, fix: R`\(fg(x) = 3(x + 4) - 1 = 3x + 11\).` },
      { wrong: R`\(f^2(x) = [f(x)]^2\)`, why: R`Dalam fungsi gubahan, indeks menunjukkan bilangan kali fungsi dikenakan.`, fix: R`\(f^2(x) = f(f(x))\).` },
    ] },
    { kind: 'summary', points: [
      R`\(fg(x) = f(g(x))\): \(g\) dahulu, kemudian \(f\). Secara umum \(fg \ne gf\).`,
      R`Untuk mencari \(fg(x)\), gantikan seluruh \(g(x)\) ke dalam \(f\), dengan kurungan.`,
      R`Diberi \(f\) dan \(fg\): tulis \(f(g(x))\) dan selesaikan untuk \(g(x)\). Diberi \(g\) dan \(fg\): biar \(u = g(x)\).`,
      R`\(f^n(x)\) ialah \(f\) dikenakan \(n\) kali. Cari corak, dan sentiasa semak dengan nilai sebenar.`,
    ] },
    { kind: 'next', html: R`<p>Dalam <strong>1.3 Fungsi Songsang</strong>, kita akan mencari fungsi \(g\) yang "membatalkan" \(f\), iaitu \(fg(x) = gf(x) = x\). Itulah gubahan yang memberi kembali objek asal.</p>`, links: [{ href: '#/nota/t4-1/1.3', label: '1.3 Fungsi Songsang →' }] },
  ],
};

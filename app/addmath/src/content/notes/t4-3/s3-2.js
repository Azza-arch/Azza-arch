// Bab 3 · 3.2 Persamaan Serentak: satu linear, satu tak linear (SP 3.2.1, 3.2.2).
// DSKP scope: two variables only; elimination, substitution and graphical
// representation; solving never needs equations above degree two.
const R = String.raw;

export const S3_2 = {
  id: '3.2', sk: '3.2', title: 'Persamaan Serentak: Satu Linear dan Satu Tak Linear', sp: ['3.2.1', '3.2.2'], status: 'review', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Pagar dan luas', html: R`
      <p>Sebuah taman segi empat tepat dipagari dengan 26 m pagar, dan luasnya 40 m². Jika panjangnya \(x\) dan lebarnya \(y\):</p>
      \[2x + 2y = 26 \qquad xy = 40\]
      <p>Persamaan pertama <strong>linear</strong>. Persamaan kedua <strong>tak linear</strong>, kerana ia mengandungi hasil darab \(xy\). Untuk mencari \(x\) dan \(y\), kita selesaikan kedua-duanya <strong>serentak</strong>.</p>` },
    { kind: 'concept', title: 'Kaedah penggantian', sp: ['3.2.1'], html: R`
      <ol><li>Daripada persamaan <strong>linear</strong>, ungkapkan satu pemboleh ubah dalam sebutan yang lain (contohnya \(y = 13 - x\)).</li><li>Gantikan ke dalam persamaan tak linear. Hasilnya persamaan kuadratik dalam satu pemboleh ubah.</li><li>Selesaikan persamaan kuadratik itu (faktor, penyempurnaan kuasa dua atau rumus).</li><li>Gantikan <strong>setiap</strong> nilai ke dalam persamaan linear untuk mendapat pasangan nilai yang sepadan.</li></ol>
      <div class="callout"><p>Kenapa pilih persamaan linear untuk langkah 1? Kerana ia mudah disusun semula tanpa punca kuasa dua atau pecahan yang rumit.</p></div>` },
    { kind: 'concept', title: 'Perwakilan graf', sp: ['3.2.1'], html: R`
      <p>Persamaan linear ialah garis lurus; persamaan tak linear ialah lengkung (parabola, bulatan, hiperbola…). Penyelesaian serentak ialah <strong>titik persilangan</strong> garis dan lengkung. Garis boleh memotong lengkung di 2 titik, menyentuhnya di 1 titik, atau tidak menyentuhnya langsung.</p>` },
    { kind: 'visual', title: 'Garis dan bulatan', html: R`<p>Bulatan \(x^2 + y^2 = 13\) dan garis \(y = mx + c\). Ubah \(m\) dan \(c\). Kira titik persilangan, kemudian bandingkan dengan pembezalayan persamaan kuadratik yang terhasil.</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-6, 6], params: [{ name: 'm', label: R`\(m\)`, min: -2, max: 2, step: 0.5, value: 1 }, { name: 'c', label: R`\(c\)`, min: -6, max: 6, step: 0.5, value: 1 }],
        relations: [{ ys: (x) => (Math.abs(x) <= Math.sqrt(13) ? [Math.sqrt(13 - x * x), -Math.sqrt(13 - x * x)] : []), color: '#D9534F' }],
        curves: [{ f: (x, p) => p.m * x + p.c }],
        points: [{ at: (p) => { const A = 1 + p.m * p.m, B = 2 * p.m * p.c, C = p.c * p.c - 13, D = B * B - 4 * A * C; if (D < 0) return null; const x = (-B + Math.sqrt(D)) / (2 * A); return [x, p.m * x + p.c]; } }, { at: (p) => { const A = 1 + p.m * p.m, B = 2 * p.m * p.c, C = p.c * p.c - 13, D = B * B - 4 * A * C; if (D <= 0) return null; const x = (-B - Math.sqrt(D)) / (2 * A); return [x, p.m * x + p.c]; } }],
        readout: (p, { fmt }) => { const A = 1 + p.m * p.m, B = 2 * p.m * p.c, C = p.c * p.c - 13, D = B * B - 4 * A * C; return R`Gantikan: \(${fmt(A)}x^2 + ${fmt(B)}x + ${fmt(C)} = 0\), pembezalayan \(${fmt(+D.toFixed(3))}\) → ${D > 1e-9 ? '2 titik persilangan' : Math.abs(D) <= 1e-9 ? '1 titik (garis tangen)' : 'tiada persilangan'}.`; } },
      alt: R`Bulatan x² + y² = 13 dan garis y = mx + c. Untuk y = x + 1, garis memotong bulatan di (2, 3) dan (−3, −2), dan persamaan selepas penggantian, 2x² + 2x − 12 = 0, mempunyai pembezalayan positif. Jika garis dianjak jauh dari pusat, ia tidak lagi menyentuh bulatan dan pembezalayan menjadi negatif.` },
    { kind: 'concept', title: 'Menyelesaikan masalah', sp: ['3.2.2'], html: R`
      <p>Dalam masalah berayat: (1) namakan pemboleh ubah dengan unit, (2) tulis satu persamaan linear dan satu tak linear daripada maklumat, (3) selesaikan, (4) <strong>tolak jawapan yang tidak munasabah</strong> (contohnya panjang negatif), dan (5) jawab soalan asal.</p>` },
    { kind: 'formula', items: [
      { tex: R`\text{linear} \to y = \ldots \;\Rightarrow\; \text{gantikan ke dalam tak linear} \;\Rightarrow\; ax^2 + bx + c = 0`, html: R`Setiap punca \(x\) memberi satu pasangan \((x, y)\). Gunakan persamaan <em>linear</em> untuk mencari \(y\) yang sepadan.` },
    ] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['3.2.1'], question: R`Selesaikan \(y = x + 1\) dan \(x^2 + y^2 = 13\).`, given: R`satu linear, satu tak linear`, find: R`semua pasangan \((x, y)\)`, method: R`Penggantian.`,
        steps: [{ do: R`\(x^2 + (x + 1)^2 = 13\)` }, { do: R`\(2x^2 + 2x - 12 = 0 \Rightarrow x^2 + x - 6 = 0 \Rightarrow (x + 3)(x - 2) = 0\)`, why: R`Bahagi dengan 2 untuk memudahkan pemfaktoran.` }, { do: R`\(x = 2 \Rightarrow y = 3\); \(x = -3 \Rightarrow y = -2\)`, why: R`Guna persamaan linear untuk \(y\), supaya \(y\) dipadankan dengan \(x\) yang betul.` }],
        check: R`\(4 + 9 = 13\) ✓ dan \(9 + 4 = 13\) ✓`, conclusion: R`\((2, 3)\) dan \((-3, -2)\).` },
      { level: 'sederhana', sp: ['3.2.1'], question: R`Selesaikan \(x + y = 4\) dan \(x^2 + 2y^2 = 18\). Beri jawapan betul kepada tiga tempat perpuluhan.`, given: R`\(y = 4 - x\)`, find: R`pasangan \((x, y)\)`, method: R`Penggantian, kemudian rumus.`,
        steps: [{ do: R`\(x^2 + 2(4 - x)^2 = 18 \Rightarrow 3x^2 - 16x + 14 = 0\)` }, { do: R`\(x = \dfrac{16 \pm \sqrt{256 - 168}}{6} = \dfrac{16 \pm \sqrt{88}}{6}\)` }, { do: R`\(x = 4.230,\ y = -0.230\) atau \(x = 1.103,\ y = 2.897\)` }],
        check: R`\(1.103^2 + 2(2.897)^2 \approx 1.217 + 16.785 = 18.00\) ✓`, conclusion: R`\((4.230, -0.230)\) dan \((1.103, 2.897)\).` },
      { level: 'mencabar', sp: ['3.2.1'], question: R`Cari titik persilangan garis \(y = 2x - 1\) dan lengkung \(y = x^2 - 2x + 2\).`, given: R`kedua-dua \(y\) diberi`, find: R`titik persilangan`, method: R`Samakan kedua-dua ungkapan \(y\) (penghapusan \(y\)).`,
        steps: [{ do: R`\(x^2 - 2x + 2 = 2x - 1 \Rightarrow x^2 - 4x + 3 = 0\)` }, { do: R`\((x - 1)(x - 3) = 0 \Rightarrow x = 1\) atau \(x = 3\)` }, { do: R`\(y = 2(1) - 1 = 1\); \(y = 2(3) - 1 = 5\)` }],
        check: R`Lengkung: \(1 - 2 + 2 = 1\) ✓, \(9 - 6 + 2 = 5\) ✓`, conclusion: R`\((1, 1)\) dan \((3, 5)\).` },
      { level: 'mencabar', sp: ['3.2.2'], question: R`Taman dalam pengenalan: perimeter 26 m dan luas 40 m². Cari panjang dan lebarnya.`, given: R`\(2x + 2y = 26\), \(xy = 40\)`, find: R`\(x\) dan \(y\)`, method: R`Permudahkan persamaan linear, kemudian gantikan.`,
        steps: [{ do: R`\(x + y = 13 \Rightarrow y = 13 - x\)` }, { do: R`\(x(13 - x) = 40 \Rightarrow x^2 - 13x + 40 = 0 \Rightarrow (x - 5)(x - 8) = 0\)` }, { do: R`\(x = 8, y = 5\) atau \(x = 5, y = 8\)`, why: R`Kedua-dua pasangan menggambarkan taman yang sama, cuma diputar.` }],
        check: R`\(2(8) + 2(5) = 26\) ✓, \(8 \times 5 = 40\) ✓`, conclusion: R`Taman berukuran 8 m × 5 m.` },
      { level: 'mencabar', sp: ['3.2.2'], question: R`Beza dua nombor ialah 3 dan hasil tambah kuasa dua kedua-duanya ialah 65. Cari nombor-nombor itu.`, given: R`\(x - y = 3\), \(x^2 + y^2 = 65\)`, find: R`\(x\) dan \(y\)`, method: R`\(x = y + 3\), gantikan.`,
        steps: [{ do: R`\((y + 3)^2 + y^2 = 65 \Rightarrow 2y^2 + 6y - 56 = 0 \Rightarrow y^2 + 3y - 28 = 0\)` }, { do: R`\((y + 7)(y - 4) = 0 \Rightarrow y = 4\) atau \(y = -7\)` }, { do: R`\(y = 4 \Rightarrow x = 7\); \(y = -7 \Rightarrow x = -4\)` }],
        check: R`\(49 + 16 = 65\) ✓, \(16 + 49 = 65\) ✓`, conclusion: R`7 dan 4, atau \(-4\) dan \(-7\) (soalan tidak mengehadkan nombor positif, jadi kedua-dua pasangan sah).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Mencari \(y\) menggunakan persamaan tak linear, contohnya \(y^2 = 13 - x^2\), lalu mendapat dua nilai \(y\) bagi setiap \(x\).`, why: R`Ini menghasilkan pasangan palsu yang tidak memenuhi persamaan linear.`, fix: R`Guna persamaan <strong>linear</strong> untuk mencari \(y\) yang sepadan.` },
      { wrong: R`\((4 - x)^2 = 16 - x^2\)`, why: R`Sebutan tengah tertinggal.`, fix: R`\((4 - x)^2 = 16 - 8x + x^2\).` },
      { wrong: R`Menerima panjang negatif dalam masalah berayat.`, why: R`Ukuran fizikal mesti positif.`, fix: R`Semak setiap jawapan terhadap konteks dan nyatakan sebab penolakan.` },
    ] },
    { kind: 'summary', points: [
      R`Susun persamaan linear, gantikan ke dalam persamaan tak linear, dan selesaikan persamaan kuadratik yang terhasil.`,
      R`Setiap nilai \(x\) memberi satu pasangan \((x, y)\); cari \(y\) menggunakan persamaan linear.`,
      R`Secara graf, penyelesaian ialah titik persilangan garis dan lengkung: 2, 1 atau 0 titik.`,
    ] },
    { kind: 'next', html: R`<p>Kemahiran menyusun semula dan menggantikan ungkapan akan digunakan dalam <strong>Bab 4</strong> (indeks, surd dan logaritma), dan teknik "samakan, kemudian pembezalayan" muncul semula dalam <strong>Geometri Koordinat</strong>.</p>`, links: [{ href: '#/bab/t4-3', label: 'Kembali ke Bab 3' }] },
  ],
};

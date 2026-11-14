// Bab 7 Geometri Koordinat (SP 7.1.1–7.4.2). Original.
// DSKP: ratio ↔ position of the dividing point, effect of changing the
// ratio; formula ((nx₁ + mx₂)/(m + n), (ny₁ + my₂)/(m + n)), midpoint = case
// m = n, m and n positive only; gradient vs tangent of the angle with the
// positive x-axis; parallel/perpendicular conjectures; derive the triangle
// area formula, link to the shoelace algorithm, box method as an
// alternative; quadrilateral and polygon generalisation; loci at a constant
// distance and constant ratio of distances, effect of the ratio, the 1:1
// case; real-life situations throughout.
const R = String.raw;
const A = [-2, 1], B = [6, 5];
const shoe = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; s += x1 * y2 - x2 * y1; } return s / 2; };

export const S7_1 = {
  id: '7.1', sk: '7.1', title: 'Pembahagi Tembereng Garis', sp: ['7.1.1', '7.1.2', '7.1.3'], status: 'published', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Di manakah injap patut dipasang?', html: R`<p>Paip lurus menghubungkan tangki A ke tangki B. Jurutera mahu memasang injap pada jarak dua pertiga dari A. Jika kedudukan A dan B diketahui sebagai koordinat, di manakah koordinat injap itu? Inilah masalah <strong>pembahagi tembereng garis</strong>.</p>` },
    { kind: 'concept', title: 'Nisbah dan kedudukan titik', sp: ['7.1.1'], html: R`
      <p>Titik \(P\) pada tembereng \(AB\) membahagi \(AB\) dengan nisbah \(m : n\) jika \(AP : PB = m : n\). Ini bermaksud \(P\) berada \(\tfrac{m}{m + n}\) daripada jalan dari \(A\) ke \(B\).</p>
      <ul><li>\(1 : 1\): \(P\) di tengah-tengah.</li><li>\(m\) lebih besar daripada \(n\): \(P\) lebih dekat kepada \(B\).</li><li>\(m\) lebih kecil daripada \(n\): \(P\) lebih dekat kepada \(A\).</li></ul>
      <p>Contoh: \(A(0, 0)\), \(B(6, 0)\), \(P(2, 0)\): \(AP = 2\), \(PB = 4\), jadi \(AP : PB = 1 : 2\).</p>` },
    { kind: 'visual', title: 'Ubah nisbah, lihat titik bergerak', html: R`<p>\(A(-2, 1)\) dan \(B(6, 5)\). Ubah \(m\) dan \(n\) dalam \(AP : PB = m : n\).</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-3, 7], y: [-1, 7], params: [{ name: 'm', label: R`\(m\)`, min: 1, max: 5, step: 1, value: 3 }, { name: 'n', label: R`\(n\)`, min: 1, max: 5, step: 1, value: 1 }],
        polygons: [{ at: () => [A, B], closed: false }],
        points: [{ at: () => A, label: 'A' }, { at: () => B, label: 'B' }, { at: (p) => [(p.n * A[0] + p.m * B[0]) / (p.m + p.n), (p.n * A[1] + p.m * B[1]) / (p.m + p.n)], label: 'P' }],
        readout: (p, { fmt }) => { const x = (p.n * A[0] + p.m * B[0]) / (p.m + p.n), y = (p.n * A[1] + p.m * B[1]) / (p.m + p.n); return R`\(P = \left(\dfrac{${p.n}(-2) + ${p.m}(6)}{${p.m + p.n}}, \dfrac{${p.n}(1) + ${p.m}(5)}{${p.m + p.n}}\right) = (${fmt(+x.toFixed(3))}, ${fmt(+y.toFixed(3))})\). P berada \(\tfrac{${p.m}}{${p.m + p.n}}\) daripada jalan dari A ke B.`; } },
      alt: R`Tembereng dari A(−2, 1) ke B(6, 5). Dengan nisbah 3 : 1, P = (4, 4), iaitu tiga perempat jalan dari A. Dengan 1 : 1, P ialah titik tengah (2, 3). Menambah m menggerakkan P ke arah B.` },
    { kind: 'concept', title: 'Rumus pembahagi tembereng garis', sp: ['7.1.2'], html: R`
      <p>Untuk sampai ke \(P\), mulakan di \(A\) dan bergerak \(\tfrac{m}{m+n}\) daripada perubahan \(A \to B\): \(x = x_1 + \tfrac{m}{m+n}(x_2 - x_1) = \dfrac{nx_1 + mx_2}{m + n}\). Begitu juga bagi \(y\):</p>
      \[P = \left(\frac{nx_1 + mx_2}{m + n},\ \frac{ny_1 + my_2}{m + n}\right)\]
      <p>Perhatikan "silang": \(n\) (bahagian dekat B) mendarab koordinat A. Apabila \(m = n\), rumus menjadi <strong>titik tengah</strong> \(\left(\tfrac{x_1 + x_2}{2}, \tfrac{y_1 + y_2}{2}\right)\). Dalam DSKP, \(m\) dan \(n\) ialah nilai positif.</p>` },
    { kind: 'concept', title: 'Masalah pembahagi tembereng', sp: ['7.1.3'], html: R`<p>Dalam masalah sebenar (paip, jalan, pagar), lukis rajah ringkas, tentukan titik mana A dan mana B, dan pastikan nisbah \(m : n\) ialah \(AP : PB\) mengikut susunan yang betul. Jika titik hujung tidak diketahui, gunakan rumus secara terbalik.</p>` },
    { kind: 'formula', items: [{ tex: R`P = \left(\frac{nx_1 + mx_2}{m + n}, \frac{ny_1 + my_2}{m + n}\right)`, html: R`\(AP : PB = m : n\), dengan \(A(x_1, y_1)\), \(B(x_2, y_2)\). Titik tengah: \(m = n\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['7.1.1'], question: R`\(A(0, 0)\), \(B(6, 0)\) dan \(P(2, 0)\). Cari \(AP : PB\).`, given: R`tiga titik pada paksi-\(x\)`, find: R`nisbah`, method: R`Ukur jarak.`, steps: [{ do: R`\(AP = 2\), \(PB = 4\)` }, { do: R`\(2 : 4 = 1 : 2\)` }], check: R`\(P\) lebih dekat kepada \(A\), sesuai dengan \(m < n\) ✓`, conclusion: R`\(1 : 2\).` },
      { level: 'sederhana', sp: ['7.1.2'], question: R`Cari \(P\) yang membahagi \(A(-2, 1)\) ke \(B(6, 5)\) dengan nisbah \(3 : 1\).`, given: R`\(m = 3, n = 1\)`, find: R`koordinat \(P\)`, method: R`Rumus pembahagi.`, steps: [{ do: R`\(x = \dfrac{1(-2) + 3(6)}{4} = 4\)`, why: R`\(n = 1\) mendarab \(x_1\); \(m = 3\) mendarab \(x_2\).` }, { do: R`\(y = \dfrac{1(1) + 3(5)}{4} = 4\)` }], check: R`\(AP = (6, 3)\) ialah \(\tfrac34\) daripada \(AB = (8, 4)\) ✓`, conclusion: R`\(P(4, 4)\).` },
      { level: 'sederhana', sp: ['7.1.2'], question: R`Cari titik tengah \((-3, 4)\) dan \((5, -2)\).`, given: R`dua titik`, find: R`titik tengah`, method: R`Kes \(m = n\).`, steps: [{ do: R`\(\left(\tfrac{-3 + 5}{2}, \tfrac{4 + (-2)}{2}\right) = (1, 1)\)` }], check: R`Jarak ke kedua-dua hujung \(= 5\) ✓`, conclusion: R`\((1, 1)\).` },
      { level: 'mencabar', sp: ['7.1.1', '7.1.2'], question: R`Titik \(P(4, 1)\) terletak pada tembereng \(A(-2, -2)\) ke \(B(6, 2)\). Cari nisbah \(AP : PB\).`, given: R`\(A, B, P\)`, find: R`\(m : n\)`, method: R`Bandingkan sesaran.`, steps: [{ do: R`\(P - A = (6, 3)\), \(B - A = (8, 4)\)` }, { do: R`\(P\) ialah \(\tfrac{6}{8} = \tfrac34\) daripada jalan, jadi \(AP : PB = 3 : 1\)` }], check: R`Rumus: \(\left(\tfrac{1(-2) + 3(6)}{4}, \tfrac{1(-2) + 3(2)}{4}\right) = (4, 1)\) ✓`, conclusion: R`\(3 : 1\).` },
      { level: 'mencabar', sp: ['7.1.3'], question: R`Paip lurus dari tangki \(A(1, 2)\) ke tangki \(B(13, 11)\) (unit: meter). Injap dipasang di \(C\) dengan \(AC : CB = 2 : 1\). Cari \(C\) dan panjang \(AC\).`, given: R`\(A, B\), nisbah \(2 : 1\)`, find: R`\(C\), \(AC\)`, method: R`Rumus pembahagi, kemudian jarak.`, steps: [{ do: R`\(C = \left(\tfrac{1(1) + 2(13)}{3}, \tfrac{1(2) + 2(11)}{3}\right) = (9, 8)\)` }, { do: R`\(AB = \sqrt{12^2 + 9^2} = 15\), jadi \(AC = \tfrac23(15) = 10\) m` }], check: R`\(\sqrt{8^2 + 6^2} = 10\) ✓`, conclusion: R`\(C(9, 8)\); \(AC = 10\) m.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(x = \dfrac{mx_1 + nx_2}{m + n}\)`, why: R`Pemberat tertukar; titik akan berada dekat hujung yang salah.`, fix: R`\(n\) mendarab \(x_1\), \(m\) mendarab \(x_2\). Semak: jika \(m\) besar, \(P\) dekat \(B\).` }, { wrong: R`Menganggap \(m : n\) sebagai \(PB : AP\).`, why: R`Susunan nisbah penting.`, fix: R`\(m : n = AP : PB\).` }] },
    { kind: 'summary', points: [R`\(AP : PB = m : n\) bermaksud \(P\) berada \(\tfrac{m}{m+n}\) dari \(A\).`, R`\(P = \left(\tfrac{nx_1 + mx_2}{m+n}, \tfrac{ny_1 + my_2}{m+n}\right)\); titik tengah apabila \(m = n\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>7.2</strong>: hubungan antara kecerunan garis selari dan garis serenjang.</p>`, links: [{ href: '#/nota/t4-7/7.2', label: '7.2 →' }] },
  ],
};

export const S7_2 = {
  id: '7.2', sk: '7.2', title: 'Garis Lurus Selari dan Garis Lurus Serenjang', sp: ['7.2.1', '7.2.2'], status: 'published', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Jalan terpendek ke jalan raya', html: R`<p>Dari sebuah rumah, laluan <em>terpendek</em> ke jalan raya yang lurus ialah laluan yang tegak lurus (serenjang) dengan jalan itu. Untuk menulis persamaan laluan itu, kita perlu tahu kaitan kecerunan dua garis yang serenjang.</p>` },
    { kind: 'concept', title: 'Kecerunan, sudut, garis selari dan serenjang', sp: ['7.2.1'], html: R`
      <p>Jika garis membuat sudut \(\theta\) dengan arah positif paksi-\(x\), maka kecerunannya \(m = \tan\theta\), iaitu "naik ÷ ke kanan".</p>
      <p><strong>Garis selari</strong> membuat sudut yang sama, jadi \(m_1 = m_2\).</p>
      <p><strong>Garis serenjang:</strong> memutar garis 90° menukar "naik \(a\), kanan \(b\)" kepada "naik \(b\), kiri \(a\)". Kecerunan berubah daripada \(\tfrac{a}{b}\) kepada \(-\tfrac{b}{a}\), jadi:</p>
      \[m_1 \times m_2 = -1\]
      <p>(bagi garis yang tidak mencancang atau mengufuk).</p>` },
    { kind: 'visual', title: 'Putar garis, lihat kecerunan serenjang', html: R`<p>Biru: \(y = mx + 1\). Merah: garis serenjang melalui \((0, 1)\).</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-5, 5], y: [-4, 6], params: [{ name: 'm', label: R`\(m_1\)`, min: -3, max: 3, step: 0.5, value: 2 }],
        curves: [{ f: (x, p) => p.m * x + 1 }, { f: (x, p) => (p.m ? -x / p.m + 1 : NaN), color: '#D9534F' }],
        readout: (p, { fmt }) => p.m === 0 ? R`\(m_1 = 0\): garis mengufuk; garis serenjangnya mencancang (kecerunan tidak tertakrif).` : R`\(m_1 = ${fmt(p.m)}\), \(m_2 = ${fmt(+(-1 / p.m).toFixed(4))}\), \(m_1 m_2 = -1\). Sudut \(\theta_1 = ${fmt(+(Math.atan(p.m) * 180 / Math.PI).toFixed(1))}^\circ\) dengan paksi-\(x\) positif.` },
      alt: R`Garis y = 2x + 1 dan garis serenjang y = −½x + 1 bersilang di (0, 1) pada sudut tegak. Hasil darab kecerunan 2 × (−½) = −1. Garis biru membuat sudut kira-kira 63.4° dengan paksi-x positif (tan 63.4° ≈ 2).` },
    { kind: 'concept', title: 'Persamaan garis selari dan serenjang', sp: ['7.2.2'], html: R`<p>Cari kecerunan yang diperlukan (sama, atau salingan negatif), kemudian guna titik yang diberi: \(y - y_1 = m(x - x_1)\). Pembahagi dua sama serenjang tembereng \(AB\) melalui titik tengah \(AB\) dengan kecerunan serenjang kepada \(AB\).</p>` },
    { kind: 'formula', items: [{ tex: R`m = \tan\theta, \quad m_1 = m_2 \ (\text{selari}), \quad m_1 m_2 = -1 \ (\text{serenjang})`, html: R`\(y - y_1 = m(x - x_1)\) untuk garis melalui \((x_1, y_1)\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['7.2.1'], question: R`Cari kecerunan garis yang selari dengan \(2y = 6x + 5\).`, given: R`\(2y = 6x + 5\)`, find: R`kecerunan`, method: R`Tulis dalam bentuk \(y = mx + c\).`, steps: [{ do: R`\(y = 3x + 2.5\), jadi \(m = 3\)` }, { do: R`Garis selari: kecerunan 3` }], check: R`\(x\) bertambah 1 → \(y\) bertambah 3 ✓`, conclusion: R`3.` },
      { level: 'sederhana', sp: ['7.2.1'], question: R`Adakah \(y = 2x + 3\) dan \(x + 2y = 4\) serenjang?`, given: R`dua garis`, find: R`serenjang?`, method: R`Darab kecerunan.`, steps: [{ do: R`\(m_1 = 2\); \(x + 2y = 4 \Rightarrow y = -\tfrac12x + 2\), jadi \(m_2 = -\tfrac12\)` }, { do: R`\(2 \times (-\tfrac12) = -1\)` }], check: R`Hasil darab \(-1\) ✓`, conclusion: R`Ya, serenjang.` },
      { level: 'sederhana', sp: ['7.2.2'], question: R`Cari persamaan garis melalui \((2, 3)\) yang selari dengan \(y = 4x - 1\).`, given: R`titik dan garis selari`, find: R`persamaan`, method: R`Kecerunan sama, 4.`, steps: [{ do: R`\(y - 3 = 4(x - 2)\)` }, { do: R`\(y = 4x - 5\)` }], check: R`\(4(2) - 5 = 3\) ✓`, conclusion: R`\(y = 4x - 5\).` },
      { level: 'mencabar', sp: ['7.2.2'], question: R`Cari pembahagi dua sama serenjang bagi \(A(1, 2)\) dan \(B(7, 6)\).`, given: R`\(A, B\)`, find: R`persamaan`, method: R`Titik tengah + kecerunan serenjang.`, steps: [{ do: R`Titik tengah \((4, 4)\); \(m_{AB} = \tfrac{4}{6} = \tfrac23\)` }, { do: R`Kecerunan serenjang \(-\tfrac32\): \(y - 4 = -\tfrac32(x - 4)\)` }, { do: R`\(y = -\tfrac32x + 10\)` }], check: R`Titik \((0, 10)\): jarak ke A \(= \sqrt{1 + 64} = \sqrt{65}\), ke B \(= \sqrt{49 + 16} = \sqrt{65}\) ✓`, conclusion: R`\(y = -\tfrac32 x + 10\).` },
      { level: 'mencabar', sp: ['7.2.2'], question: R`Jalan raya mengikut \(y = 0.5x + 2\). Rumah berada di \(H(6, -3)\). Cari titik di jalan yang paling dekat dengan rumah, dan jarak terpendek.`, given: R`garis dan titik`, find: R`kaki serenjang; jarak`, method: R`Garis serenjang melalui \(H\), kemudian persilangan.`, steps: [{ do: R`Kecerunan serenjang \(-2\): \(y = -2x + 9\)` }, { do: R`\(0.5x + 2 = -2x + 9 \Rightarrow x = 2.8\), \(y = 3.4\)` }, { do: R`Jarak \(= \sqrt{3.2^2 + 6.4^2} = \sqrt{51.2} = 7.16\) unit` }], check: R`\(m_{HF} = \tfrac{3.4 + 3}{2.8 - 6} = -2\) ✓`, conclusion: R`\((2.8, 3.4)\); kira-kira 7.16 unit.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Serenjang kepada \(m = 2\) ialah \(m = -2\).`, why: R`Perlu salingan <em>dan</em> tanda berlawanan.`, fix: R`\(m_2 = -\tfrac12\).` }, { wrong: R`Membaca kecerunan \(2y = 6x + 5\) sebagai 6.`, why: R`\(y\) belum menjadi perkara rumus.`, fix: R`Bahagi dengan 2: \(m = 3\).` }] },
    { kind: 'summary', points: [R`\(m = \tan\theta\).`, R`Selari: \(m_1 = m_2\); serenjang: \(m_1 m_2 = -1\).`, R`\(y - y_1 = m(x - x_1)\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>7.3</strong>: luas poligon daripada koordinat bucunya.</p>`, links: [{ href: '#/nota/t4-7/7.3', label: '7.3 →' }] },
  ],
};

export const S7_3 = {
  id: '7.3', sk: '7.3', title: 'Luas Poligon', sp: ['7.3.1', '7.3.2', '7.3.3', '7.3.4', '7.3.5'], status: 'published', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Luas tanah daripada koordinat', html: R`<p>Juruukur tanah merekod bucu-bucu sebidang tanah sebagai koordinat. Dengan rumus luas poligon, luas tanah boleh dikira terus tanpa memecahkannya kepada bentuk mudah satu per satu.</p>` },
    { kind: 'concept', title: 'Menerbitkan rumus luas segi tiga', sp: ['7.3.1'], html: R`
      <p>Bagi segi tiga dengan bucu \(A(x_1, y_1)\), \(B(x_2, y_2)\), \(C(x_3, y_3)\), lukis garis mencancang dari setiap bucu ke paksi-\(x\). Ini membentuk trapezium. Luas segi tiga ialah gabungan (tambah dan tolak) luas trapezium:</p>
      \[\text{Luas} = \tfrac12\left[(x_2 - x_1)(y_1 + y_2) + (x_3 - x_2)(y_2 + y_3) + (x_1 - x_3)(y_3 + y_1)\right]\]
      <p>Selepas dikembangkan, banyak sebutan terbatal, dan tinggal:</p>
      \[\text{Luas} = \tfrac12\left|(x_1y_2 + x_2y_3 + x_3y_1) - (x_2y_1 + x_3y_2 + x_1y_3)\right|\]
      <p>Tanda nilai mutlak memastikan luas positif walaupun bucu disusun mengikut arah jam.</p>` },
    { kind: 'concept', title: 'Algoritma shoelace dan kaedah kotak', sp: ['7.3.2'], html: R`
      <p><strong>Shoelace ("tali kasut"):</strong> tulis koordinat dalam dua baris, ulang bucu pertama di hujung, kemudian darab menyerong:</p>
      \[\text{Luas} = \frac12\left|\begin{matrix} x_1 & x_2 & x_3 & x_1 \\ y_1 & y_2 & y_3 & y_1 \end{matrix}\right| \]
      <p>Jumlahkan hasil darab "ke bawah kanan" (\(x_1y_2, x_2y_3, x_3y_1\)), tolak hasil darab "ke atas kanan" (\(x_2y_1, x_3y_2, x_1y_3\)), ambil nilai mutlak, dan bahagi 2.</p>
      <p><strong>Kaedah kotak</strong> (alternatif): lukis segi empat tepat terkecil yang melingkungi segi tiga, kemudian tolak luas segi tiga bersudut tegak di sekelilingnya.</p>` },
    { kind: 'visual', title: 'Gerakkan bucu C', html: R`<p>\(A(0, 0)\), \(B(5, 1)\) dan \(C(c_x, c_y)\). Luas dikira dengan shoelace. Apa yang berlaku apabila \(C\) segaris dengan \(A\) dan \(B\)?</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-2, 7], y: [-3, 6], params: [{ name: 'cx', label: R`\(c_x\)`, min: -1, max: 6, step: 0.5, value: 2 }, { name: 'cy', label: R`\(c_y\)`, min: -2, max: 5, step: 0.2, value: 4 }],
        polygons: [{ at: (p) => [[0, 0], [5, 1], [p.cx, p.cy]] }],
        points: [{ at: () => [0, 0], label: 'A' }, { at: () => [5, 1], label: 'B' }, { at: (p) => [p.cx, p.cy], label: 'C' }],
        readout: (p, { fmt }) => { const s = shoe([[0, 0], [5, 1], [p.cx, p.cy]]); return R`\(\tfrac12[(0 \cdot 1 + 5 \cdot ${fmt(p.cy)} + ${fmt(p.cx)} \cdot 0) - (5 \cdot 0 + ${fmt(p.cx)} \cdot 1 + 0 \cdot ${fmt(p.cy)})] = ${fmt(+s.toFixed(3))}\) → luas \(= ${fmt(+Math.abs(s).toFixed(3))}\). ${Math.abs(s) < 1e-9 ? 'Luas sifar: A, B dan C segaris.' : s > 0 ? 'Positif: A → B → C mengikut lawan arah jam.' : 'Negatif sebelum nilai mutlak: A → B → C mengikut arah jam.'}`; } },
      alt: R`Segi tiga A(0, 0), B(5, 1), C(2, 4) mempunyai luas ½|20 − 2| = 9 unit². Jika C diletakkan pada garis AB, contohnya C(2.5, 0.5), luas menjadi 0 kerana ketiga-tiga titik segaris. Jika C di bawah garis AB, nilai sebelum mutlak menjadi negatif (susunan arah jam).` },
    { kind: 'concept', title: 'Sisi empat dan poligon', sp: ['7.3.3', '7.3.4'], html: R`
      <p>Sisi empat boleh dibahagi kepada dua segi tiga. Rumus shoelace yang sama berfungsi terus dengan empat bucu, asalkan bucu disusun <strong>mengikut urutan</strong> di sekeliling sempadan (bukan bersilang):</p>
      \[\text{Luas} = \frac12\left|\begin{matrix} x_1 & x_2 & x_3 & x_4 & x_1 \\ y_1 & y_2 & y_3 & y_4 & y_1 \end{matrix}\right|\]
      <p><strong>Generalisasi:</strong> bagi poligon \(n\) bucu, \(\text{Luas} = \tfrac12\left|\sum (x_iy_{i+1} - x_{i+1}y_i)\right|\), dengan bucu ke-\((n+1)\) ialah bucu pertama.</p>` },
    { kind: 'concept', title: 'Masalah luas poligon', sp: ['7.3.5'], html: R`<p>Luas sifar bermaksud titik-titik <strong>segaris</strong>. Jika luas diberi dan satu koordinat tidak diketahui, bina persamaan nilai mutlak (dua kemungkinan) dan pilih yang sesuai dengan syarat soalan.</p>` },
    { kind: 'formula', items: [{ tex: R`\text{Luas} = \tfrac12\left|(x_1y_2 + x_2y_3 + x_3y_1) - (x_2y_1 + x_3y_2 + x_1y_3)\right|`, html: R`Bucu mengikut urutan. Luas 0 ⇔ titik segaris. Untuk poligon, lanjutkan corak yang sama.` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['7.3.1'], question: R`Gunakan kaedah trapezium (asas penerbitan rumus) untuk mencari luas segi tiga \(A(1, 2)\), \(B(5, 3)\), \(C(2, 7)\).`, given: R`tiga bucu`, find: R`luas melalui trapezium`, method: R`Bagi setiap sisi, luas bertanda trapezium di antara sisi itu dan paksi-\(x\) ialah \(\tfrac12(x_{\text{akhir}} - x_{\text{mula}})(y_{\text{mula}} + y_{\text{akhir}})\).`,
        steps: [{ do: R`\(A \to B\): \(\tfrac12(5 - 1)(2 + 3) = 10\)` }, { do: R`\(B \to C\): \(\tfrac12(2 - 5)(3 + 7) = -15\)`, why: R`Bergerak ke kiri memberi nilai negatif, jadi trapezium di bawah sisi atas ditolak.` }, { do: R`\(C \to A\): \(\tfrac12(1 - 2)(7 + 2) = -4.5\)` }, { do: R`Jumlah \(= 10 - 15 - 4.5 = -9.5\), jadi luas \(= |-9.5| = 9.5\)`, why: R`Jika dikembangkan secara am, jumlah ini menjadi rumus \(\tfrac12|(x_1y_2 + x_2y_3 + x_3y_1) - (x_2y_1 + x_3y_2 + x_1y_3)|\).` }],
        check: R`Sama dengan shoelace dan kaedah kotak ✓`, conclusion: R`9.5 unit²; ini menunjukkan dari mana rumus luas segi tiga datang.` },
      { level: 'mudah', sp: ['7.3.2'], question: R`Cari luas segi tiga dengan bucu \((1, 2)\), \((5, 3)\), \((2, 7)\).`, given: R`tiga bucu`, find: R`luas`, method: R`Shoelace.`, steps: [{ do: R`Ke bawah: \(1(3) + 5(7) + 2(2) = 42\)` }, { do: R`Ke atas: \(5(2) + 2(3) + 1(7) = 23\)` }, { do: R`\(\tfrac12|42 - 23| = 9.5\)` }], check: R`Kaedah kotak (contoh seterusnya) juga memberi 9.5 ✓`, conclusion: R`9.5 unit².` },
      { level: 'sederhana', sp: ['7.3.2'], question: R`Sahkan luas segi tiga yang sama dengan kaedah kotak.`, given: R`\((1, 2), (5, 3), (2, 7)\)`, find: R`luas`, method: R`Segi empat tepat lingkungan tolak tiga segi tiga tegak.`, steps: [{ do: R`Kotak: \(1 \le x \le 5\), \(2 \le y \le 7\), luas \(4 \times 5 = 20\)` }, { do: R`Segi tiga luar: \(\tfrac12(4)(1) + \tfrac12(3)(4) + \tfrac12(1)(5) = 2 + 6 + 2.5 = 10.5\)` }, { do: R`\(20 - 10.5 = 9.5\)` }], check: R`Sama dengan shoelace ✓`, conclusion: R`9.5 unit².` },
      { level: 'sederhana', sp: ['7.3.3'], question: R`Cari luas sisi empat \((0, 0)\), \((6, 0)\), \((7, 4)\), \((1, 3)\).`, given: R`empat bucu mengikut urutan`, find: R`luas`, method: R`Shoelace dengan empat bucu.`, steps: [{ do: R`Ke bawah: \(0 + 6(4) + 7(3) + 1(0) = 45\)` }, { do: R`Ke atas: \(0(6) + 0(7) + 4(1) + 3(0) = 4\)` }, { do: R`\(\tfrac12|45 - 4| = 20.5\)` }], check: R`Bahagi kepada dua segi tiga: \(12 + 8.5 = 20.5\) ✓`, conclusion: R`20.5 unit².` },
      { level: 'mencabar', sp: ['7.3.4'], question: R`Cari luas pentagon \((0, 0)\), \((4, 0)\), \((5, 3)\), \((2, 5)\), \((-1, 3)\).`, given: R`lima bucu`, find: R`luas`, method: R`Generalisasi shoelace.`, steps: [{ do: R`Ke bawah: \(0 + 4(3) + 5(5) + 2(3) + (-1)(0) = 43\)` }, { do: R`Ke atas: \(0 + 0 + 3(2) + 5(-1) + 3(0) = 1\)` }, { do: R`\(\tfrac12|43 - 1| = 21\)` }], check: R`Pembahagian kepada tiga segi tiga dari \((0, 0)\) memberi \(6 + 9.5 + 5.5 = 21\) ✓`, conclusion: R`21 unit².` },
      { level: 'mencabar', sp: ['7.3.5'], question: R`Luas segi tiga \((0, 0)\), \((4, 1)\), \((2, k)\) ialah 7 unit². Cari nilai positif \(k\).`, given: R`luas dan satu koordinat tidak diketahui`, find: R`\(k > 0\)`, method: R`Persamaan nilai mutlak.`, steps: [{ do: R`\(\tfrac12|4k - 2| = 7 \Rightarrow |4k - 2| = 14\)` }, { do: R`\(4k - 2 = 14\) atau \(4k - 2 = -14\), jadi \(k = 4\) atau \(k = -3\)` }, { do: R`Nilai positif: \(k = 4\)` }], check: R`\(\tfrac12|16 - 2| = 7\) ✓`, conclusion: R`\(k = 4\).` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Lupa mengulang bucu pertama di hujung susunan.`, why: R`Satu hasil darab silang tertinggal.`, fix: R`Tulis \(x_1, y_1\) sekali lagi di hujung.` }, { wrong: R`Bucu tidak mengikut urutan (bersilang).`, why: R`Rumus memberi luas yang salah.`, fix: R`Susun bucu mengikut urutan di sekeliling bentuk.` }, { wrong: R`Lupa nilai mutlak dan menjawab luas negatif.`, why: R`Susunan arah jam memberi nilai negatif.`, fix: R`Ambil nilai mutlak.` }] },
    { kind: 'summary', points: [R`Luas \(= \tfrac12|\Sigma\text{ke bawah} - \Sigma\text{ke atas}|\), dengan bucu mengikut urutan.`, R`Berfungsi untuk segi tiga, sisi empat dan semua poligon; kaedah kotak sebagai semakan.`, R`Luas 0 ⇔ segaris.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>7.4</strong>: lokus, iaitu laluan titik yang bergerak mengikut syarat.</p>`, links: [{ href: '#/nota/t4-7/7.4', label: '7.4 →' }] },
  ],
};

const apol = (k) => { const h = (-4 * k * k) / (1 - k * k), r2 = h * h + (16 * k * k) / (1 - k * k); return { h, r: Math.sqrt(r2) }; };
export const S7_4 = {
  id: '7.4', sk: '7.4', title: 'Persamaan Lokus', sp: ['7.4.1', '7.4.2'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Kambing yang ditambat', html: R`<p>Seekor kambing ditambat pada pancang dengan tali 5 m. Apabila tali tegang, kambing berada tepat 5 m dari pancang. Kedudukan kambing membentuk satu bulatan. Laluan semua titik yang memenuhi sesuatu syarat dipanggil <strong>lokus</strong>.</p>` },
    { kind: 'concept', title: 'Lokus jarak malar dan nisbah jarak malar', sp: ['7.4.1'], html: R`
      <p><strong>Jarak malar dari satu titik:</strong> biar \(P(x, y)\) dan titik tetap \(C(a, b)\). Syarat \(PC = r\), selepas dikuasaduakan, memberi:</p>
      \[(x - a)^2 + (y - b)^2 = r^2\]
      <p>Ini ialah bulatan berpusat \(C\) dengan jejari \(r\).</p>
      <p><strong>Nisbah jarak dari dua titik malar:</strong> syarat \(PA : PB = m : n\) bermaksud \(n \cdot PA = m \cdot PB\). Kuasaduakan kedua-dua belah untuk membuang punca kuasa dua, kemudian kembangkan dan permudahkan.</p>
      <ul><li>Nisbah \(1 : 1\) (\(PA = PB\)): lokusnya garis lurus, iaitu <strong>pembahagi dua sama serenjang</strong> \(AB\).</li><li>Nisbah lain: lokusnya bulatan (yang mengelilingi titik yang "lebih dekat").</li></ul>` },
    { kind: 'visual', title: 'Kesan nisbah terhadap bentuk lokus', html: R`<p>\(A(0, 0)\), \(B(4, 0)\). Lokus titik \(P\) dengan \(PA = k \cdot PB\). Ubah \(k\).</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-6, 10], y: [-7, 7], grid: 1, labelStep: 2, params: [{ name: 'k', label: R`\(k = \tfrac{PA}{PB}\)`, min: 0.5, max: 3, step: 0.25, value: 2 }],
        relations: [{ ys: (x, p) => { if (p.k === 1) return []; const { h, r } = apol(p.k); const d = r * r - (x - h) ** 2; return d >= 0 ? [Math.sqrt(d), -Math.sqrt(d)] : []; } }],
        vlinesAt: [{ at: (p) => (p.k === 1 ? 2 : NaN), label: 'x = 2' }],
        points: [{ at: () => [0, 0], label: 'A' }, { at: () => [4, 0], label: 'B' }],
        readout: (p, { fmt }) => { if (p.k === 1) return R`\(k = 1\): \(PA = PB\), jadi lokusnya garis \(x = 2\), pembahagi dua sama serenjang \(AB\).`; const { h, r } = apol(p.k); return R`Lokus: bulatan berpusat \((${fmt(+h.toFixed(3))}, 0)\), jejari \(${fmt(+r.toFixed(3))}\). ${p.k > 1 ? 'k > 1: P lebih dekat kepada B, jadi bulatan mengelilingi B.' : 'k < 1: P lebih dekat kepada A, jadi bulatan mengelilingi A.'}`; } },
      alt: R`Bagi A(0, 0) dan B(4, 0): jika PA = 2PB, lokus ialah bulatan berpusat (16/3, 0) dengan jejari 8/3, yang mengelilingi B dan memotong paksi-x di 8/3 dan 8. Jika PA = PB, lokus ialah garis x = 2. Jika k < 1, bulatan mengelilingi A.` },
    { kind: 'concept', title: 'Masalah lokus', sp: ['7.4.2'], html: R`<p>Tukar syarat dalam perkataan kepada persamaan jarak. Untuk menyemak sama ada sesuatu titik berada pada lokus, gantikan koordinatnya ke dalam persamaan lokus. Untuk mencari persilangan lokus dengan paksi atau garis, gantikan \(y = 0\) (atau persamaan garis) dan selesaikan.</p>` },
    { kind: 'formula', items: [{ tex: R`PC = r \Rightarrow (x - a)^2 + (y - b)^2 = r^2`, html: R`Lokus jarak malar dari \(C(a, b)\).` }, { tex: R`\frac{PA}{PB} = \frac{m}{n} \Rightarrow n^2 \cdot PA^2 = m^2 \cdot PB^2`, html: R`Kuasaduakan untuk membuang punca. Nisbah \(1 : 1\) memberi pembahagi dua sama serenjang.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['7.4.1'], question: R`Cari persamaan lokus titik \(P\) yang berjarak 3 unit dari \(C(1, 2)\).`, given: R`\(PC = 3\)`, find: R`persamaan`, method: R`Rumus jarak, kuasaduakan.`, steps: [{ do: R`\((x - 1)^2 + (y - 2)^2 = 9\)` }, { do: R`\(x^2 + y^2 - 2x - 4y - 4 = 0\)` }], check: R`Titik \((4, 2)\): \(16 + 4 - 8 - 8 - 4 = 0\) ✓`, conclusion: R`\(x^2 + y^2 - 2x - 4y - 4 = 0\).` },
      { level: 'sederhana', sp: ['7.4.1'], question: R`Cari lokus titik yang sama jarak dari \(A(1, 0)\) dan \(B(5, 0)\).`, given: R`\(PA = PB\)`, find: R`persamaan`, method: R`Kuasaduakan dan permudahkan.`, steps: [{ do: R`\((x - 1)^2 + y^2 = (x - 5)^2 + y^2\)` }, { do: R`\(-2x + 1 = -10x + 25 \Rightarrow 8x = 24 \Rightarrow x = 3\)` }], check: R`\(x = 3\) ialah garis mencancang melalui titik tengah \((3, 0)\) ✓`, conclusion: R`\(x = 3\).` },
      { level: 'mencabar', sp: ['7.4.1'], question: R`\(A(0, 0)\), \(B(3, 0)\). Cari lokus \(P\) dengan \(PA : PB = 2 : 1\).`, given: R`\(PA = 2PB\)`, find: R`persamaan`, method: R`\(PA^2 = 4PB^2\).`, steps: [{ do: R`\(x^2 + y^2 = 4[(x - 3)^2 + y^2]\)` }, { do: R`\(x^2 + y^2 = 4x^2 - 24x + 36 + 4y^2\)` }, { do: R`\(3x^2 + 3y^2 - 24x + 36 = 0 \Rightarrow x^2 + y^2 - 8x + 12 = 0\)` }], check: R`Titik \((2, 0)\): \(PA = 2\), \(PB = 1\) ✓; dan \(4 - 16 + 12 = 0\) ✓`, conclusion: R`\(x^2 + y^2 - 8x + 12 = 0\) (bulatan berpusat \((4, 0)\), jejari 2).` },
      { level: 'mencabar', sp: ['7.4.2'], question: R`Kambing ditambat dengan tali 5 m pada pancang \((2, 1)\). Tulis persamaan sempadan kawasan ragutnya, dan tentukan sama ada pokok di \((6, 4)\) berada tepat di sempadan.`, given: R`pusat \((2, 1)\), jejari 5`, find: R`persamaan; kedudukan pokok`, method: R`Lokus jarak malar.`, steps: [{ do: R`\((x - 2)^2 + (y - 1)^2 = 25 \Rightarrow x^2 + y^2 - 4x - 2y - 20 = 0\)` }, { do: R`Pokok: \(36 + 16 - 24 - 8 - 20 = 0\)` }], check: R`Jarak \(\sqrt{4^2 + 3^2} = 5\) ✓`, conclusion: R`Pokok berada tepat di sempadan.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(PA = 2PB \Rightarrow PA^2 = 2PB^2\)`, why: R`Faktor 2 juga dikuasaduakan.`, fix: R`\(PA^2 = 4PB^2\).` }, { wrong: R`\(\sqrt{(x-1)^2 + y^2} = x - 1 + y\)`, why: R`Punca kuasa dua jumlah bukan jumlah punca.`, fix: R`Kuasaduakan kedua-dua belah dahulu.` }] },
    { kind: 'summary', points: [R`Jarak malar dari titik: bulatan.`, R`Nisbah jarak malar: kuasaduakan; \(1 : 1\) memberi pembahagi dua sama serenjang, nisbah lain memberi bulatan.`, R`Semak titik pada lokus dengan menggantikan koordinat.`] },
    { kind: 'next', html: R`<p><strong>Bab 8 Vektor</strong> memberi cara lain untuk menerangkan kedudukan dan gerakan pada satah.</p>`, links: [{ href: '#/bab/t4-7', label: 'Kembali ke Bab 7' }] },
  ],
};

// Bab 9 Penyelesaian Segi Tiga (T4 elektif, SP 9.1.1–9.4.1). Original.
// DSKP (PDF 96–99, verified as page images): digital tools encouraged and
// real-life situations throughout; exploration for the sine rule, for the
// ambiguous case and for the area formula. Sine rule a/sin A = b/sin B = c/sin C
// (or the reciprocal form). Ambiguous case (given A, c and a): none if a < h,
// one if a = h or a ≥ c, two if h < a < c, where h = c sin A is the height.
// Cosine rule a² = b² + c² − 2bc kos A (and cyclic). Area ½ab sin C (and cyclic);
// Heron √(s(s−a)(s−b)(s−c)), s = (a+b+c)/2. 9.4: three-dimensional shapes must be included.
// Malaysian notation: "kos" (macro \kos), angles in degrees.
const R = String.raw;
const DEG = Math.PI / 180;
const r3 = (v) => +v.toFixed(3);
const r2 = (v) => +v.toFixed(2);
const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
const angAt = (P, Q, S) => { const u = [Q[0] - P[0], Q[1] - P[1]], w = [S[0] - P[0], S[1] - P[1]]; return Math.abs(Math.atan2(u[0] * w[1] - u[1] * w[0], u[0] * w[0] + u[1] * w[1])) / DEG; };

// ---------------------------------------------------------------- 9.1
const AMB = { A: 30, c: 10 }; // ambiguous-case explorer: B = c(kos A, sin A), base ray along x-axis
const AMB_B = [AMB.c * Math.cos(AMB.A * DEG), AMB.c * Math.sin(AMB.A * DEG)];
const ambC = (a) => { const h = AMB_B[1]; if (a < h - 1e-9) return []; const s = Math.sqrt(Math.max(0, a * a - h * h)); return [...new Set([AMB_B[0] - s, AMB_B[0] + s].map((t) => +t.toFixed(9)))].filter((t) => t > 1e-9).map((t) => [t, 0]); };

export const S9_1 = {
  id: '9.1', sk: '9.1', title: 'Petua Sinus', sp: ['9.1.1', '9.1.2', '9.1.3', '9.1.4', '9.1.5'], status: 'published', minutes: 55,
  sections: [
    { kind: 'intro', title: 'Mengukur tanpa sampai ke sana', html: R`<p>Seorang juruukur mahu tahu jarak sebuah rumah api di seberang teluk. Dia tidak boleh menyeberang, tetapi dia boleh berjalan 500 m di sepanjang pantai dan mengukur dua sudut. Dengan <strong>petua sinus</strong>, satu sisi dan dua sudut sudah cukup untuk mencari sisi-sisi lain, walaupun segi tiga itu <em>tidak bersudut tegak</em>.</p>` },
    { kind: 'prereq', title: 'Imbas kembali', html: R`<ul><li>Segi tiga bersudut tegak: \(\sin\theta = \dfrac{\text{sisi bertentangan}}{\text{hipotenus}}\).</li><li>Hasil tambah sudut dalam segi tiga ialah \(180^\circ\).</li><li>Tatatanda: sisi \(a\) bertentangan dengan sudut \(A\), sisi \(b\) bertentangan dengan \(B\), sisi \(c\) bertentangan dengan \(C\).</li><li>\(\sin\theta = \sin(180^\circ - \theta)\): contohnya \(\sin 30^\circ = \sin 150^\circ = 0.5\).</li></ul>` },
    { kind: 'concept', title: 'Konjektur: nisbah sisi kepada sinus sudut bertentangan', sp: ['9.1.1'], html: R`
      <p>Gunakan visual di bawah. Ubah bentuk segi tiga dan perhatikan tiga nisbah \(\dfrac{a}{\sin A}\), \(\dfrac{b}{\sin B}\) dan \(\dfrac{c}{\sin C}\). Konjektur: <strong>ketiga-tiganya sentiasa sama</strong>.</p>
      <p><strong>Mengapa benar?</strong> Lukis tinggi \(h\) dari \(C\) ke sisi \(AB\). Dalam dua segi tiga bersudut tegak yang terbentuk:</p>
      \[h = b\sin A \quad\text{dan}\quad h = a\sin B \;\Rightarrow\; b\sin A = a\sin B \;\Rightarrow\; \frac{a}{\sin A} = \frac{b}{\sin B}\]
      <p>Tinggi dari \(A\) memberi \(\dfrac{b}{\sin B} = \dfrac{c}{\sin C}\) dengan cara yang sama. (Jika \(B\) cakah, \(h = a\sin(180^\circ - B) = a\sin B\), jadi hasilnya tetap sama.) Inilah <strong>petua sinus</strong>.</p>` },
    { kind: 'visual', title: 'Tiga nisbah yang sentiasa sama', html: R`<p>\(A\) dan \(B\) tetap. Gerakkan \(C\) dengan gelangsar.</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-1.5, 9], y: [-1, 7], params: [{ name: 'cx', label: R`kedudukan mengufuk \(C\)`, min: -1, max: 8, step: 0.5, value: 2 }, { name: 'cy', label: R`tinggi \(C\)`, min: 1, max: 6, step: 0.5, value: 4 }],
        polygons: [{ at: (p) => [[0, 0], [7, 0], [p.cx, p.cy]] }],
        points: [{ at: () => [0, 0], label: 'A' }, { at: () => [7, 0], label: 'B' }, { at: (p) => [p.cx, p.cy], label: 'C' }],
        readout: (p, { fmt }) => { const A = [0, 0], B = [7, 0], C = [p.cx, p.cy]; const a = dist(B, C), b = dist(A, C), c = dist(A, B); const sA = Math.sin(angAt(A, B, C) * DEG), sB = Math.sin(angAt(B, A, C) * DEG), sC = Math.sin(angAt(C, A, B) * DEG);
          return R`\(a = ${fmt(r3(a))},\ b = ${fmt(r3(b))},\ c = ${fmt(r3(c))}\); \(A = ${fmt(r2(angAt(A, B, C)))}^\circ,\ B = ${fmt(r2(angAt(B, A, C)))}^\circ,\ C = ${fmt(r2(angAt(C, A, B)))}^\circ\).<br>\(\dfrac{a}{\sin A} = ${fmt(r3(a / sA))}\), \(\dfrac{b}{\sin B} = ${fmt(r3(b / sB))}\), \(\dfrac{c}{\sin C} = ${fmt(r3(c / sC))}\): <strong>sama</strong>.`; } },
      alt: R`Segi tiga ABC dengan A di (0, 0), B di (7, 0) dan C yang boleh digerakkan. Pada mulanya C di (2, 4): a ≈ 6.403, b ≈ 4.472, c = 7, dan setiap nisbah a/sin A, b/sin B, c/sin C bernilai kira-kira 7.159. Apabila C digerakkan, nilai bersama itu berubah tetapi ketiga-tiga nisbah kekal sama.` },
    { kind: 'concept', title: 'Bila guna petua sinus', sp: ['9.1.2'], html: R`
      <p>Petua sinus memerlukan <strong>satu pasangan lengkap</strong>: satu sisi bersama sudut yang bertentangan dengannya. Ia sesuai apabila diberi:</p>
      <ul><li><strong>dua sudut dan satu sisi</strong> (cari sudut ketiga dengan \(180^\circ\) dahulu), atau</li><li><strong>dua sisi dan satu sudut bukan kandung</strong> (sudut bertentangan dengan salah satu sisi yang diberi). Kes ini mungkin <em>berambiguiti</em>.</li></ul>
      <p>Untuk mencari sisi, guna \(\dfrac{a}{\sin A} = \dfrac{b}{\sin B}\). Untuk mencari sudut, lebih mudah guna bentuk terbalik \(\dfrac{\sin A}{a} = \dfrac{\sin B}{b}\).</p>` },
    { kind: 'concept', title: 'Kes berambiguiti', sp: ['9.1.3'], html: R`
      <p>Diberi sudut \(A\) (tirus), sisi \(c\) yang bersebelahan dengannya dan sisi \(a\) yang bertentangan dengannya. Bayangkan sisi \(a\) sebagai lengan yang berayun dari \(B\) dan cuba menyentuh garis dasar. Tinggi dari \(B\) ke garis dasar ialah \(h = c\sin A\).</p>
      <table class="mini-table"><thead><tr><th>Syarat</th><th>Bilangan segi tiga</th><th>Sebab</th></tr></thead><tbody>
        <tr><td>\(a < h\)</td><td>tiada</td><td>lengan terlalu pendek untuk sampai ke garis dasar</td></tr>
        <tr><td>\(a = h\)</td><td>satu (bersudut tegak)</td><td>lengan tepat menyentuh garis dasar</td></tr>
        <tr><td>\(h < a < c\)</td><td><strong>dua</strong></td><td>lengan memotong garis dasar di dua titik, kedua-duanya di sebelah kanan \(A\)</td></tr>
        <tr><td>\(a \ge c\)</td><td>satu</td><td>titik potong kedua jatuh di belakang \(A\) (atau tepat di \(A\)), jadi tidak membentuk segi tiga</td></tr>
      </tbody></table>
      <p>Dalam kes dua segi tiga, sudut \(C\) boleh tirus <em>atau</em> cakah: jika \(\sin C = k\), maka \(C = \theta\) atau \(C = 180^\circ - \theta\).</p>` },
    { kind: 'visual', title: 'Lengan yang berayun', html: R`<p>\(A = 30^\circ\), \(c = AB = 10\), jadi \(h = 10\sin 30^\circ = 5\). Ubah panjang \(a\). Lengkok jingga menunjukkan semua kedudukan hujung lengan \(a\) dari \(B\).</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-4, 21], y: [-2, 9], params: [{ name: 'a', label: R`\(a\)`, min: 3, max: 13, step: 0.5, value: 6 }],
        polygons: [
          { at: () => [[-4, 0], [21, 0]], closed: false, color: '#9AA3B5' },
          { at: () => [[0, 0], AMB_B], closed: false, color: '#3467D4' },
          { at: () => [AMB_B, [AMB_B[0], 0]], closed: false, color: '#C9CED8' },
          { at: (p) => { const pts = []; for (let k = 0; k <= 120; k++) { const th = Math.PI + (Math.PI * k) / 120; pts.push([AMB_B[0] + p.a * Math.cos(th), AMB_B[1] + p.a * Math.sin(th)]); } return pts; }, closed: false, color: '#E0A93B' },
          { at: (p) => { const s = ambC(p.a); return s[0] ? [[0, 0], AMB_B, s[0]] : null; }, color: '#2E9E6B' },
          { at: (p) => { const s = ambC(p.a); return s[1] ? [[0, 0], AMB_B, s[1]] : null; }, color: '#D9534F' },
        ],
        points: [{ at: () => [0, 0], label: 'A' }, { at: () => AMB_B, label: 'B' }, { at: (p) => ambC(p.a)[0] || null, label: 'C₁' }, { at: (p) => ambC(p.a)[1] || null, label: 'C₂' }],
        labels: [{ at: () => [AMB_B[0] + 0.7, 2.5], text: 'h = 5' }],
        readout: (p, { fmt }) => { const n = ambC(p.a).length; const why = p.a < 5 ? R`\(a < h\)` : p.a === 5 ? R`\(a = h\)` : p.a < 10 ? R`\(h < a < c\)` : R`\(a \ge c\)`; return R`\(a = ${fmt(p.a)}\): ${why}, jadi <strong>${n === 0 ? 'tiada segi tiga' : n === 1 ? 'satu segi tiga' : 'dua segi tiga'}</strong>.`; } },
      alt: R`Garis dasar mengufuk bermula di A. AB = 10 pada sudut 30°, jadi B berada 5 unit di atas garis dasar. Satu lengkok berjejari a dilukis dari B. Jika a < 5 lengkok tidak sampai ke garis dasar (tiada segi tiga). Jika a = 5 ia menyentuh di satu titik (segi tiga bersudut tegak). Jika 5 < a < 10 ia memotong garis dasar di dua titik C₁ dan C₂ di sebelah kanan A (dua segi tiga, contohnya a = 6). Jika a ≥ 10 titik potong kedua berada di belakang A, jadi hanya satu segi tiga.` },
    { kind: 'concept', title: 'Menyelesaikan kes berambiguiti dan masalah', sp: ['9.1.4', '9.1.5'], html: R`
      <ol><li>Semak syarat (atau terus kira \(\sin C\)). Jika \(\sin C > 1\): tiada segi tiga.</li><li>Cari \(\theta = \sin^{-1}(\ldots)\). Calon kedua: \(180^\circ - \theta\).</li><li>Uji setiap calon: hasil tambah dengan sudut yang diberi mesti kurang daripada \(180^\circ\).</li><li>Selesaikan setiap segi tiga yang sah hingga lengkap.</li></ol>
      <p>Dalam masalah kehidupan sebenar, lakar rajah dahulu, tandakan sisi dan sudut yang diketahui, kemudian pilih segi tiga yang mempunyai satu pasangan lengkap.</p>` },
    { kind: 'formula', items: [{ tex: R`\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} \quad\text{atau}\quad \frac{\sin A}{a} = \frac{\sin B}{b} = \frac{\sin C}{c}`, html: R`Perlu satu sisi bersama sudut bertentangannya.` }, { tex: R`h = c\sin A:\; a < h \text{ (tiada)},\; a = h \text{ atau } a \ge c \text{ (satu)},\; h < a < c \text{ (dua)}`, html: R`Kes berambiguiti apabila diberi \(A\) tirus, \(c\) dan \(a\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['9.1.1'], question: R`Segi tiga 3-4-5 mempunyai \(A = 36.87^\circ\), \(B = 53.13^\circ\), \(C = 90^\circ\) dengan \(a = 3\), \(b = 4\), \(c = 5\). Sahkan konjektur petua sinus.`, given: R`semua sisi dan sudut`, find: R`tiga nisbah`, method: R`Kira setiap nisbah \(\tfrac{\text{sisi}}{\sin(\text{sudut bertentangan})}\).`, steps: [{ do: R`\(\sin A = 0.6\), jadi \(\dfrac{3}{0.6} = 5\)`, why: R`Dalam segi tiga tegak ini, \(\sin A = \tfrac{3}{5}\).` }, { do: R`\(\sin B = 0.8\), jadi \(\dfrac{4}{0.8} = 5\)` }, { do: R`\(\sin 90^\circ = 1\), jadi \(\dfrac{5}{1} = 5\)` }], check: R`Nilai bersama ialah 5, iaitu hipotenus. Ini masuk akal kerana \(\sin 90^\circ = 1\) ✓`, conclusion: R`Ketiga-tiga nisbah sama dengan 5.` },
      { level: 'sederhana', sp: ['9.1.2'], question: R`Dalam \(\triangle ABC\), \(A = 40^\circ\), \(B = 65^\circ\) dan \(a = 10\) cm. Cari \(b\) dan \(c\).`, given: R`dua sudut, satu sisi`, find: R`\(b, c\)`, method: R`Cari \(C\) dahulu, kemudian petua sinus dengan pasangan \(a, A\).`, steps: [{ do: R`\(C = 180^\circ - 40^\circ - 65^\circ = 75^\circ\)` }, { do: R`\(b = \dfrac{10\sin 65^\circ}{\sin 40^\circ} = 14.10\) cm`, why: R`\(\dfrac{b}{\sin 65^\circ} = \dfrac{10}{\sin 40^\circ}\); darab kedua-dua belah dengan \(\sin 65^\circ\).` }, { do: R`\(c = \dfrac{10\sin 75^\circ}{\sin 40^\circ} = 15.03\) cm` }], check: R`Sudut terbesar (\(C = 75^\circ\)) bertentangan dengan sisi terpanjang (\(c\)) ✓`, conclusion: R`\(b = 14.10\) cm, \(c = 15.03\) cm.` },
      { level: 'sederhana', sp: ['9.1.3'], question: R`Diberi \(A = 30^\circ\) dan \(c = 10\) cm. Berapakah bilangan segi tiga yang boleh dibina jika (i) \(a = 4\) cm, (ii) \(a = 6\) cm, (iii) \(a = 12\) cm?`, given: R`\(A\), \(c\), tiga nilai \(a\)`, find: R`bilangan segi tiga`, method: R`Bandingkan \(a\) dengan \(h = c\sin A\) dan \(c\).`, steps: [{ do: R`\(h = 10\sin 30^\circ = 5\)` }, { do: R`(i) \(4 < 5\): tiada` }, { do: R`(ii) \(5 < 6 < 10\): dua` }, { do: R`(iii) \(12 \ge 10\): satu` }], check: R`Cuba (i) dengan petua sinus: \(\sin C = \tfrac{10 \times 0.5}{4} = 1.25 > 1\), mustahil ✓`, conclusion: R`Tiada; dua; satu.` },
      { level: 'mencabar', sp: ['9.1.4'], question: R`Selesaikan \(\triangle ABC\) dengan \(A = 30^\circ\), \(c = 10\) cm dan \(a = 6\) cm.`, given: R`dua sisi dan sudut bukan kandung`, find: R`semua kemungkinan \(C\), \(B\), \(b\)`, method: R`Petua sinus untuk \(C\), kemudian uji kedua-dua calon.`, steps: [{ do: R`\(\sin C = \dfrac{10\sin 30^\circ}{6} = 0.8333\)` }, { do: R`\(C = 56.44^\circ\) atau \(C = 180^\circ - 56.44^\circ = 123.56^\circ\)`, why: R`Sinus positif dalam sukuan pertama dan kedua.` }, { do: R`Kedua-duanya sah kerana \(30^\circ + 123.56^\circ < 180^\circ\)` }, { do: R`\(C = 56.44^\circ\): \(B = 93.56^\circ\), \(b = \dfrac{6\sin 93.56^\circ}{\sin 30^\circ} = 11.98\) cm` }, { do: R`\(C = 123.56^\circ\): \(B = 26.44^\circ\), \(b = \dfrac{6\sin 26.44^\circ}{\sin 30^\circ} = 5.34\) cm` }], check: R`Sepadan dengan syarat \(h < a < c\) (\(5 < 6 < 10\)), iaitu dua segi tiga ✓`, conclusion: R`Dua penyelesaian: \((C, B, b) = (56.44^\circ, 93.56^\circ, 11.98)\) atau \((123.56^\circ, 26.44^\circ, 5.34)\).` },
      { level: 'mencabar', sp: ['9.1.5'], question: R`Dua stesen \(P\) dan \(Q\) di pantai lurus berjarak 500 m. Sebuah rumah api \(L\) dicerap dengan \(\angle LPQ = 48^\circ\) dan \(\angle LQP = 72^\circ\). Cari jarak \(PL\) dan jarak terdekat rumah api itu dari pantai.`, given: R`\(PQ = 500\) m, dua sudut`, find: R`\(PL\); jarak serenjang ke pantai`, method: R`Petua sinus, kemudian trigonometri segi tiga tegak.`, steps: [{ do: R`\(\angle PLQ = 180^\circ - 48^\circ - 72^\circ = 60^\circ\)` }, { do: R`\(PL = \dfrac{500\sin 72^\circ}{\sin 60^\circ} = 549.09\) m`, why: R`\(PL\) bertentangan dengan sudut di \(Q\), dan \(PQ\) bertentangan dengan sudut di \(L\).` }, { do: R`Jarak ke pantai \(= PL\sin 48^\circ = 408.06\) m` }], check: R`408.06 m < 549.09 m kerana jarak serenjang ialah jarak terpendek ✓`, conclusion: R`\(PL = 549.09\) m; jarak ke pantai kira-kira 408.06 m.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Guna petua sinus dengan \(\dfrac{a}{\sin B}\).`, why: R`Sisi mesti berpasangan dengan sudut yang <em>bertentangan</em> dengannya.`, fix: R`\(a\) dengan \(A\), \(b\) dengan \(B\), \(c\) dengan \(C\).` },
      { wrong: R`\(\sin C = 0.8333 \Rightarrow C = 56.44^\circ\) sahaja.`, why: R`\(\sin(180^\circ - 56.44^\circ)\) juga 0.8333.`, fix: R`Dalam kes SSA, sentiasa uji \(180^\circ - \theta\) juga.` },
      { wrong: R`Kalkulator dalam mod radian.`, why: R`\(\sin 30\) dalam radian ialah \(-0.988\).`, fix: R`Pastikan mod <strong>DEG</strong>.` },
    ] },
    { kind: 'summary', points: [R`\(\dfrac{a}{\sin A} = \dfrac{b}{\sin B} = \dfrac{c}{\sin C}\): perlukan satu pasangan sisi dan sudut bertentangan.`, R`Kes berambiguiti (diberi \(A\), \(c\), \(a\)): \(h = c\sin A\); dua segi tiga jika \(h < a < c\).`, R`Calon kedua: \(180^\circ - \theta\); uji sama ada hasil tambah sudut kurang daripada \(180^\circ\).`] },
    { kind: 'next', html: R`<p>Jika tiada pasangan lengkap (contohnya diberi tiga sisi), petua sinus tidak boleh bermula. Seterusnya, <strong>9.2 Petua Kosinus</strong>.</p>`, links: [{ href: '#/nota/t4-9/9.2', label: '9.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 9.2
export const S9_2 = {
  id: '9.2', sk: '9.2', title: 'Petua Kosinus', sp: ['9.2.1', '9.2.2', '9.2.3'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Apabila petua sinus tersekat', html: R`<p>Dua kapal meninggalkan pelabuhan. Kita tahu jarak setiap kapal dan sudut antara laluannya, tetapi tiada sudut yang bertentangan dengan sisi yang diketahui. Petua sinus tidak boleh digunakan. <strong>Petua kosinus</strong> ialah "Pythagoras yang diperluas" untuk sebarang segi tiga.</p>` },
    { kind: 'concept', title: 'Mentahkikkan petua kosinus', sp: ['9.2.1'], html: R`
      <p>Letakkan \(A\) di asalan dan \(AB\) di sepanjang paksi-\(x\): \(A(0, 0)\), \(B(c, 0)\) dan \(C(b\kos A,\ b\sin A)\). Dengan rumus jarak:</p>
      \[a^2 = (b\kos A - c)^2 + (b\sin A)^2 = b^2(\kos^2 A + \sin^2 A) - 2bc\kos A + c^2\]
      <p>Oleh sebab \(\kos^2 A + \sin^2 A = 1\) (Pythagoras dalam bulatan unit):</p>
      \[a^2 = b^2 + c^2 - 2bc\kos A\]
      <p>Jika \(A = 90^\circ\), maka \(\kos A = 0\) dan petua ini menjadi \(a^2 = b^2 + c^2\), iaitu Teorem Pythagoras. Jika \(A\) cakah, \(\kos A < 0\), jadi \(a^2\) <em>lebih besar</em> daripada \(b^2 + c^2\).</p>` },
    { kind: 'visual', title: 'Pythagoras yang diperluas', html: R`<p>Ubah \(b\), \(c\) dan sudut kandung \(A\). Perhatikan sebutan pembetulan \(-2bc\kos A\).</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-8, 9], y: [-1, 8.5], params: [{ name: 'b', label: R`\(b = AC\)`, min: 2, max: 8, step: 0.5, value: 5 }, { name: 'c', label: R`\(c = AB\)`, min: 2, max: 8, step: 0.5, value: 7 }, { name: 'A', label: R`\(A\) (darjah)`, min: 20, max: 160, step: 5, value: 60 }],
        polygons: [{ at: (p) => [[0, 0], [p.c, 0], [p.b * Math.cos(p.A * DEG), p.b * Math.sin(p.A * DEG)]] }],
        points: [{ at: () => [0, 0], label: 'A' }, { at: (p) => [p.c, 0], label: 'B' }, { at: (p) => [p.b * Math.cos(p.A * DEG), p.b * Math.sin(p.A * DEG)], label: 'C' }],
        readout: (p, { fmt }) => { const corr = -2 * p.b * p.c * Math.cos(p.A * DEG); const a2 = p.b ** 2 + p.c ** 2 + corr; return R`\(a^2 = ${fmt(p.b ** 2)} + ${fmt(p.c ** 2)} ${corr < -1e-9 ? '-' : '+'} ${fmt(r3(Math.abs(corr)))} = ${fmt(r3(a2))}\), \(a = ${fmt(r3(Math.sqrt(a2)))}\). ${p.A === 90 ? 'Sudut tegak: pembetulan sifar, iaitu Pythagoras.' : p.A < 90 ? R`\(A\) tirus: \(a^2 < b^2 + c^2\).` : R`\(A\) cakah: \(a^2 > b^2 + c^2\).`}`; } },
      alt: R`Segi tiga dengan A di asalan, AB = c di sepanjang garis mengufuk dan AC = b pada sudut A. Dengan b = 5, c = 7 dan A = 60°: a² = 25 + 49 − 35 = 39, jadi a ≈ 6.245. Apabila A = 90°, sebutan −2bc kos A menjadi sifar (Pythagoras). Apabila A cakah, sebutan itu positif dan a lebih panjang.` },
    { kind: 'concept', title: 'Menyelesaikan segi tiga dengan petua kosinus', sp: ['9.2.2'], html: R`
      <p>Guna petua kosinus apabila diberi:</p>
      <ul><li><strong>dua sisi dan sudut kandung</strong> (sudut di antara kedua-dua sisi itu): cari sisi ketiga.</li><li><strong>tiga sisi</strong>: cari sudut dengan bentuk yang disusun semula \(\kos A = \dfrac{b^2 + c^2 - a^2}{2bc}\).</li></ul>
      <p>Kelebihan bentuk kosinus: jika \(\kos A < 0\), sudut itu cakah, jadi <strong>tiada kekeliruan</strong> seperti dalam kes berambiguiti. Selepas satu sudut diperoleh, petua sinus boleh digunakan untuk yang lain. Untuk mengelakkan kes berambiguiti, cari sudut yang <em>bertentangan dengan sisi terpanjang</em> dahulu dengan petua kosinus.</p>` },
    { kind: 'concept', title: 'Masalah melibatkan petua kosinus', sp: ['9.2.3'], html: R`<p>Navigasi (dua laluan dari satu titik), struktur kekuda bumbung dan padang berbentuk segi tiga sering memberi dua sisi dengan sudut di antaranya, atau tiga sisi. Lakar rajah dan tandakan sudut kandung dengan jelas.</p>` },
    { kind: 'formula', items: [{ tex: R`a^2 = b^2 + c^2 - 2bc\kos A`, html: R`Juga \(b^2 = a^2 + c^2 - 2ac\kos B\) dan \(c^2 = a^2 + b^2 - 2ab\kos C\).` }, { tex: R`\kos A = \frac{b^2 + c^2 - a^2}{2bc}`, html: R`Untuk mencari sudut daripada tiga sisi.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['9.2.2'], question: R`Dalam \(\triangle ABC\), \(b = 5\) cm, \(c = 7\) cm dan \(A = 60^\circ\). Cari \(a\).`, given: R`dua sisi dan sudut kandung`, find: R`\(a\)`, method: R`Petua kosinus.`, steps: [{ do: R`\(a^2 = 25 + 49 - 2(5)(7)\kos 60^\circ = 74 - 35 = 39\)`, why: R`\(\kos 60^\circ = 0.5\).` }, { do: R`\(a = \sqrt{39} = 6.245\) cm` }], check: R`\(a\) di antara \(c - b = 2\) dan \(c + b = 12\) (ketaksamaan segi tiga) ✓`, conclusion: R`\(a = 6.245\) cm.` },
      { level: 'sederhana', sp: ['9.2.1'], question: R`Tunjukkan bahawa petua kosinus menjadi Teorem Pythagoras apabila \(C = 90^\circ\).`, given: R`\(c^2 = a^2 + b^2 - 2ab\kos C\)`, find: R`bentuk apabila \(C = 90^\circ\)`, method: R`Gantikan nilai \(\kos 90^\circ\).`, steps: [{ do: R`\(\kos 90^\circ = 0\)` }, { do: R`\(c^2 = a^2 + b^2 - 0 = a^2 + b^2\)` }], check: R`\(c\) ialah hipotenus kerana bertentangan dengan sudut tegak ✓`, conclusion: R`Pythagoras ialah kes khas petua kosinus.` },
      { level: 'sederhana', sp: ['9.2.2'], question: R`Sisi-sisi sebuah segi tiga ialah 7 cm, 8 cm dan 10 cm. Cari sudut terbesar.`, given: R`tiga sisi`, find: R`sudut terbesar`, method: R`Sudut terbesar bertentangan dengan sisi terpanjang; guna bentuk kosinus.`, steps: [{ do: R`Biar \(c = 10\): \(\kos C = \dfrac{7^2 + 8^2 - 10^2}{2(7)(8)} = \dfrac{13}{112}\)` }, { do: R`\(C = 83.33^\circ\)` }], check: R`\(\kos C > 0\), jadi tirus; dan \(10^2 = 100 < 7^2 + 8^2 = 113\) ✓`, conclusion: R`\(83.33^\circ\).` },
      { level: 'mencabar', sp: ['9.2.3'], question: R`Kapal \(X\) belayar 12 km dan kapal \(Y\) belayar 15 km dari pelabuhan yang sama. Sudut antara laluannya ialah \(110^\circ\). Cari jarak antara dua kapal.`, given: R`dua jarak dan sudut di antaranya`, find: R`\(XY\)`, method: R`Petua kosinus; perhatikan \(\kos 110^\circ < 0\).`, steps: [{ do: R`\(XY^2 = 12^2 + 15^2 - 2(12)(15)\kos 110^\circ\)` }, { do: R`\(= 369 - 360(-0.3420) = 369 + 123.13 = 492.13\)`, why: R`Menolak nombor negatif bermaksud menambah.` }, { do: R`\(XY = 22.18\) km` }], check: R`Lebih panjang daripada \(\sqrt{12^2 + 15^2} = 19.21\) kerana sudut cakah ✓`, conclusion: R`Kira-kira 22.18 km.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(a^2 = (b^2 + c^2 - 2bc)\kos A\)`, why: R`Hanya sebutan \(2bc\) didarab dengan \(\kos A\).`, fix: R`\(a^2 = b^2 + c^2 - (2bc\kos A)\).` },
      { wrong: R`Dengan \(\kos 110^\circ\), tolak 123.13.`, why: R`\(\kos 110^\circ\) negatif, jadi \(-2bc\kos 110^\circ\) positif.`, fix: R`Masukkan tanda dengan teliti, atau taip seluruh ungkapan ke dalam kalkulator.` },
      { wrong: R`Guna sudut yang bukan kandung dalam petua kosinus.`, why: R`\(\kos A\) mesti untuk sudut di antara \(b\) dan \(c\), bertentangan dengan \(a\).`, fix: R`Sisi di sebelah kiri ialah sisi yang bertentangan dengan sudut dalam \(\kos\).` },
    ] },
    { kind: 'summary', points: [R`\(a^2 = b^2 + c^2 - 2bc\kos A\); Pythagoras ialah kes \(A = 90^\circ\).`, R`Dua sisi + sudut kandung: cari sisi ketiga. Tiga sisi: \(\kos A = \frac{b^2 + c^2 - a^2}{2bc}\).`, R`\(\kos\) negatif bermaksud sudut cakah (tiada kekeliruan).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>9.3</strong>: luas segi tiga tanpa perlu tahu tingginya.</p>`, links: [{ href: '#/nota/t4-9/9.3', label: '9.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 9.3
export const S9_3 = {
  id: '9.3', sk: '9.3', title: 'Luas Segi Tiga', sp: ['9.3.1', '9.3.2', '9.3.3'], status: 'published', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Luas tanah tanpa tinggi', html: R`<p>Sebidang tanah berbentuk segi tiga diukur dengan pita ukur: tiga sisinya sahaja. Tiada sesiapa mengukur "tinggi" tanah itu. Bab ini memberi dua rumus luas yang tidak memerlukan tinggi.</p>` },
    { kind: 'concept', title: 'Rumus ½ab sin C', sp: ['9.3.1'], html: R`
      <p>Mulakan dengan \(\text{Luas} = \tfrac12 \times \text{tapak} \times \text{tinggi}\). Ambil \(a = BC\) sebagai tapak. Tinggi dari \(A\) ke garis \(BC\) ialah \(h = b\sin C\) (sinus dalam segi tiga tegak yang terbentuk; jika \(C\) cakah, \(h = b\sin(180^\circ - C) = b\sin C\)). Jadi</p>
      \[\text{Luas} = \tfrac12 ab\sin C = \tfrac12 ac\sin B = \tfrac12 bc\sin A\]
      <p>Kuncinya: <strong>dua sisi dan sudut di antara keduanya</strong>.</p>` },
    { kind: 'visual', title: 'Sudut kandung dan luas', html: R`<p>\(a = CB = 6\) dan \(b = CA = 5\) tetap. Ubah sudut \(C\). Garis putus-putus ialah tinggi \(h = b\sin C\).</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-5.5, 7.5], y: [-1, 6], params: [{ name: 'C', label: R`\(C\) (darjah)`, min: 10, max: 170, step: 5, value: 50 }],
        polygons: [
          { at: (p) => [[Math.min(0, 5 * Math.cos(p.C * DEG)), 0], [0, 0]], closed: false, color: '#C9CED8' },
          { at: (p) => [[0, 0], [6, 0], [5 * Math.cos(p.C * DEG), 5 * Math.sin(p.C * DEG)]] },
          { at: (p) => [[5 * Math.cos(p.C * DEG), 5 * Math.sin(p.C * DEG)], [5 * Math.cos(p.C * DEG), 0]], closed: false, color: '#D9534F' },
        ],
        points: [{ at: () => [0, 0], label: 'C' }, { at: () => [6, 0], label: 'B' }, { at: (p) => [5 * Math.cos(p.C * DEG), 5 * Math.sin(p.C * DEG)], label: 'A' }],
        readout: (p, { fmt }) => { const ar = 15 * Math.sin(p.C * DEG); return R`Luas \(= \tfrac12(6)(5)\sin ${fmt(p.C)}^\circ = ${fmt(r3(ar))}\). ${p.C === 90 ? 'Maksimum apabila C = 90°.' : R`Sama dengan luas apabila \(C = ${fmt(180 - p.C)}^\circ\), kerana \(\sin C = \sin(180^\circ - C)\).`}`; } },
      alt: R`Segi tiga dengan C di asalan, CB = 6 mengufuk dan CA = 5 pada sudut C. Tinggi dari A ditunjukkan dengan garis merah. Dengan C = 50°, luas = 15 sin 50° ≈ 11.491. Luas paling besar (15) apabila C = 90°, dan sudut C serta 180° − C memberi luas yang sama.` },
    { kind: 'concept', title: 'Rumus Heron', sp: ['9.3.2'], html: R`
      <p>Jika hanya tiga sisi diketahui, guna separuh perimeter \(s = \dfrac{a + b + c}{2}\), kemudian</p>
      \[\text{Luas} = \sqrt{s(s - a)(s - b)(s - c)}\]
      <p>Setiap faktor \(s - a\), \(s - b\), \(s - c\) mesti positif. Jika salah satu sifar atau negatif, sisi-sisi itu tidak membentuk segi tiga (ketaksamaan segi tiga gagal).</p>` },
    { kind: 'concept', title: 'Masalah melibatkan luas', sp: ['9.3.3'], html: R`<p>Masalah luas boleh bergerak "ke belakang": diberi luas, cari sisi atau sudut. Jika mencari sudut daripada \(\sin C = k\), ingat <strong>dua kemungkinan</strong> \(C\) dan \(180^\circ - C\), kerana kedua-duanya memberi luas yang sama.</p>` },
    { kind: 'formula', items: [{ tex: R`\text{Luas} = \tfrac12 ab\sin C = \tfrac12 ac\sin B = \tfrac12 bc\sin A`, html: R`Dua sisi dan sudut kandung.` }, { tex: R`\text{Luas} = \sqrt{s(s - a)(s - b)(s - c)},\quad s = \frac{a + b + c}{2}`, html: R`Rumus Heron: tiga sisi.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['9.3.1'], question: R`Cari luas \(\triangle PQR\) dengan \(PQ = 8\) cm, \(PR = 6\) cm dan \(\angle QPR = 50^\circ\).`, given: R`dua sisi dan sudut kandung`, find: R`luas`, method: R`\(\tfrac12 ab\sin C\).`, steps: [{ do: R`\(\tfrac12(8)(6)\sin 50^\circ = 24 \times 0.7660 = 18.39\) cm²` }], check: R`Kurang daripada \(\tfrac12(8)(6) = 24\), had maksimum apabila sudut \(90^\circ\) ✓`, conclusion: R`18.39 cm².` },
      { level: 'sederhana', sp: ['9.3.2'], question: R`Cari luas segi tiga dengan sisi 7 cm, 8 cm dan 9 cm.`, given: R`tiga sisi`, find: R`luas`, method: R`Rumus Heron.`, steps: [{ do: R`\(s = \dfrac{7 + 8 + 9}{2} = 12\)` }, { do: R`\(\sqrt{12(12 - 7)(12 - 8)(12 - 9)} = \sqrt{12 \cdot 5 \cdot 4 \cdot 3} = \sqrt{720}\)` }, { do: R`\(= 26.83\) cm²` }], check: R`Semua faktor positif (5, 4, 3), jadi segi tiga sah ✓`, conclusion: R`26.83 cm².` },
      { level: 'mencabar', sp: ['9.3.3'], question: R`Luas \(\triangle ABC\) ialah 30 cm², dengan \(a = 10\) cm dan \(b = 8\) cm. Cari semua nilai \(C\) yang mungkin.`, given: R`luas, dua sisi`, find: R`\(C\)`, method: R`Susun semula rumus luas; ingat dua kemungkinan.`, steps: [{ do: R`\(\tfrac12(10)(8)\sin C = 30 \Rightarrow \sin C = 0.75\)` }, { do: R`\(C = 48.59^\circ\) atau \(C = 180^\circ - 48.59^\circ = 131.41^\circ\)`, why: R`Kedua-dua sudut mempunyai sinus 0.75, dan masing-masing sah sebagai sudut segi tiga.` }], check: R`\(40\sin 131.41^\circ = 40 \times 0.75 = 30\) ✓`, conclusion: R`\(C = 48.59^\circ\) atau \(131.41^\circ\).` },
      { level: 'mencabar', sp: ['9.3.3'], question: R`Sebidang tanah segi tiga bersisi 50 m, 60 m dan 70 m akan ditanam rumput pada kos RM2.50 per m². Cari kos keseluruhan.`, given: R`tiga sisi, kos per m²`, find: R`kos`, method: R`Heron, kemudian darab dengan kadar.`, steps: [{ do: R`\(s = 90\)` }, { do: R`Luas \(= \sqrt{90 \cdot 40 \cdot 30 \cdot 20} = \sqrt{2\,160\,000} = 1469.69\) m²` }, { do: R`Kos \(= 1469.69 \times 2.50 = \text{RM}3674.23\)` }], check: R`Anggaran kasar: \(\tfrac12 \times 60 \times 50 \approx 1500\) m² ✓`, conclusion: R`Kira-kira RM3674.23.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Luas \(= \tfrac12 ab\sin A\) dengan \(A\) bukan sudut di antara \(a\) dan \(b\).`, why: R`Sudut mesti sudut <em>kandung</em> antara dua sisi yang digunakan.`, fix: R`\(\tfrac12 ab\sin C\): \(C\) terletak di antara \(a\) dan \(b\).` },
      { wrong: R`Dalam Heron, guna perimeter penuh sebagai \(s\).`, why: R`\(s\) ialah <em>separuh</em> perimeter.`, fix: R`\(s = \tfrac{a + b + c}{2}\).` },
    ] },
    { kind: 'summary', points: [R`\(\tfrac12 ab\sin C\): dua sisi dan sudut kandung.`, R`Heron: \(\sqrt{s(s - a)(s - b)(s - c)}\), \(s\) = separuh perimeter.`, R`Diberi luas, \(\sin C = k\) memberi dua sudut yang mungkin.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>9.4</strong>: menggabungkan ketiga-tiga alat, termasuk dalam bentuk tiga dimensi.</p>`, links: [{ href: '#/nota/t4-9/9.4', label: '9.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 9.4
// Oblique projection of a 3-D point (x right, y into the page, z up).
const prj = ([x, y, z]) => [x + 0.35 * y, z + 0.45 * y]; // steep depth so AG does not appear to pass through D or F
const box = (h) => { const L = 8, W = 6; return { A: [0, 0, 0], B: [L, 0, 0], C: [L, W, 0], D: [0, W, 0], E: [0, 0, h], F: [L, 0, h], G: [L, W, h], H: [0, W, h] }; };
const EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];

export const S9_4 = {
  id: '9.4', sk: '9.4', title: 'Aplikasi Petua Sinus, Petua Kosinus dan Luas Segi Tiga', sp: ['9.4.1'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Segi tiga di dalam bentuk 3D', html: R`<p>Jurutera yang mereka khemah, bumbung atau tiang telekomunikasi bekerja dalam tiga dimensi, tetapi pengiraannya tetap dilakukan dalam <strong>segi tiga</strong>. Kemahirannya ialah mencari segi tiga yang betul di dalam bentuk itu.</p>` },
    { kind: 'concept', title: 'Strategi', sp: ['9.4.1'], html: R`
      <ol><li><strong>Kenal pasti</strong> segi tiga yang mengandungi kuantiti yang dicari. Lukis semula segi tiga itu secara rata (2D).</li><li><strong>Isi</strong> sisi dan sudut yang diketahui. Jika ada sisi yang belum diketahui, cari dahulu daripada segi tiga lain (selalunya segi tiga tegak di tapak).</li><li><strong>Pilih alat:</strong> segi tiga tegak: Pythagoras/trigonometri; pasangan lengkap: petua sinus; sudut kandung atau tiga sisi: petua kosinus; luas: \(\tfrac12 ab\sin C\) atau Heron.</li></ol>
      <p><strong>Sudut antara garis dan satah:</strong> turunkan garis serenjang dari hujung garis ke satah. Sudut yang dicari ialah sudut antara garis itu dengan <em>unjurannya</em> pada satah.</p>` },
    { kind: 'visual', title: 'Pepenjuru kuboid', html: R`<p>Kuboid \(8 \times 6 \times t\). Segi tiga merah \(ACG\) bersudut tegak di \(C\). Ubah tinggi \(t\).</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-1, 11.5], y: [-1, 13.5], params: [{ name: 't', label: R`tinggi \(t\)`, min: 2, max: 10, step: 1, value: 5 }],
        polygons: [
          ...EDGES.map((e) => ({ at: (p) => { const b = box(p.t); return [prj(b[e[0]]), prj(b[e[1]])]; }, closed: false, color: '#9AA3B5' })),
          { at: (p) => { const b = box(p.t); return [prj(b.A), prj(b.C), prj(b.G)]; }, color: '#D9534F' },
        ],
        points: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((n) => ({ at: (p) => prj(box(p.t)[n]), label: n })),
        readout: (p, { fmt }) => R`\(AC = \sqrt{8^2 + 6^2} = 10\); \(AG = \sqrt{10^2 + ${fmt(p.t)}^2} = ${fmt(r3(Math.hypot(10, p.t)))}\); sudut antara \(AG\) dengan tapak \(= \tan^{-1}\dfrac{${fmt(p.t)}}{10} = ${fmt(r2(Math.atan(p.t / 10) / DEG))}^\circ\).` },
      alt: R`Lukisan kuboid ABCDEFGH dengan tapak ABCD berukuran 8 kali 6 dan tinggi t. Segi tiga ACG diserlahkan: AC ialah pepenjuru tapak (10), CG ialah tinggi tegak, dan sudut di C ialah 90°. Dengan t = 5, AG = √125 ≈ 11.180 dan sudut antara AG dengan tapak ialah 26.57°.` },
    { kind: 'formula', items: [{ tex: R`\text{sudut antara garis } AG \text{ dan satah} = \angle GAC,\quad C = \text{unjuran } G \text{ pada satah}`, html: R`Cari unjuran dahulu, kemudian segi tiga tegak.` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['9.4.1'], question: R`Kuboid \(ABCDEFGH\) dengan \(AB = 8\) cm, \(BC = 6\) cm dan \(CG = 5\) cm. Cari panjang \(AG\) dan sudut antara \(AG\) dengan tapak \(ABCD\).`, given: R`dimensi kuboid`, find: R`\(AG\); sudut dengan tapak`, method: R`Segi tiga \(ABC\) di tapak, kemudian segi tiga tegak \(ACG\).`, steps: [{ do: R`\(AC = \sqrt{8^2 + 6^2} = 10\) cm` }, { do: R`\(AG = \sqrt{10^2 + 5^2} = \sqrt{125} = 11.18\) cm` }, { do: R`\(\tan\angle GAC = \tfrac{5}{10} \Rightarrow \angle GAC = 26.57^\circ\)`, why: R`\(C\) ialah unjuran \(G\) pada tapak, jadi \(\angle GAC\) ialah sudut yang dicari.` }], check: R`\(AG\) lebih panjang daripada \(AC\) dan \(CG\) ✓`, conclusion: R`\(AG = 11.18\) cm; \(26.57^\circ\).` },
      { level: 'mencabar', sp: ['9.4.1'], question: R`Piramid tegak \(VABCD\) mempunyai tapak segi empat sama bersisi 8 m, dan puncak \(V\) berada 6 m tegak di atas pusat tapak \(O\). Cari (a) \(VA\), (b) sudut antara \(VA\) dengan tapak, (c) \(\angle AVB\).`, given: R`tapak 8 m, tinggi 6 m`, find: R`\(VA\), sudut dengan tapak, \(\angle AVB\)`, method: R`Segi tiga tegak \(VOA\); kemudian petua kosinus dalam \(\triangle AVB\).`, steps: [{ do: R`\(OA = \tfrac12\sqrt{8^2 + 8^2} = \sqrt{32} = 5.657\) m`, why: R`\(O\) ialah titik tengah pepenjuru tapak.` }, { do: R`(a) \(VA = \sqrt{6^2 + 32} = \sqrt{68} = 8.246\) m` }, { do: R`(b) \(\tan\angle VAO = \dfrac{6}{\sqrt{32}} \Rightarrow 46.69^\circ\)` }, { do: R`(c) \(\kos\angle AVB = \dfrac{68 + 68 - 64}{2(68)} = \dfrac{72}{136}\Rightarrow \angle AVB = 58.03^\circ\)`, why: R`\(\triangle AVB\) bukan segi tiga tegak; tiga sisinya diketahui (\(\sqrt{68}, \sqrt{68}, 8\)), jadi guna petua kosinus.` }], check: R`\(\triangle AVB\) sama kaki: \(\angle VAB = \angle VBA = \tfrac{180^\circ - 58.03^\circ}{2} = 60.98^\circ\), dan \(\kos 60.98^\circ \times \sqrt{68} \approx 4\) = separuh tapak ✓`, conclusion: R`\(8.246\) m; \(46.69^\circ\); \(58.03^\circ\).` },
      { level: 'mencabar', sp: ['9.4.1'], question: R`Untuk piramid yang sama, cari luas satu muka sisi \(VAB\) dengan dua cara.`, given: R`\(VA = VB = \sqrt{68}\), \(AB = 8\), \(\angle AVB = 58.03^\circ\)`, find: R`luas \(\triangle VAB\)`, method: R`(i) \(\tfrac12 ab\sin C\); (ii) Heron, untuk semakan.`, steps: [{ do: R`(i) \(\tfrac12(68)\sin 58.03^\circ = 28.84\) m²`, why: R`\(\tfrac12 \times VA \times VB \times \sin\angle AVB\), dan \(VA \times VB = 68\).` }, { do: R`(ii) \(s = \sqrt{68} + 4 = 12.246\); \(\sqrt{12.246 \times 4 \times 4 \times 4.246} = 28.84\) m²` }], check: R`Tinggi condong \(= \sqrt{6^2 + 4^2} = \sqrt{52}\); \(\tfrac12 \times 8 \times \sqrt{52} = 28.84\) ✓ (cara ketiga)`, conclusion: R`28.84 m².` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Menganggap setiap segi tiga dalam rajah 3D bersudut tegak.`, why: R`Dalam lukisan, sudut kelihatan berbeza daripada sebenar.`, fix: R`Sahkan sudut tegak daripada maklumat (tegak, serenjang, tapak rata).` },
      { wrong: R`Sudut antara \(AG\) dan tapak ialah \(\angle GAB\).`, why: R`\(B\) bukan unjuran \(G\) pada tapak.`, fix: R`Guna unjuran: \(\angle GAC\).` },
    ] },
    { kind: 'summary', points: [R`Cari segi tiga yang betul, lukis semula secara rata, kemudian pilih alat.`, R`Sisi yang tiada selalunya datang daripada segi tiga tegak di tapak.`, R`Sudut garis–satah: guna unjuran garis pada satah.`] },
    { kind: 'next', html: R`<p>Teknik segi tiga ini akan digunakan lagi dalam <strong>Sukatan Membulat</strong> dan <strong>Fungsi Trigonometri</strong> di Tingkatan 5.</p>`, links: [{ href: '#/bab/t4-9', label: 'Kembali ke Bab 9' }] },
  ],
};

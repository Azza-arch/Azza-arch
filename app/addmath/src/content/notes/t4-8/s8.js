// Bab 8 Vektor (SP 8.1.1–8.3.4). Original.
// DSKP: vectors vs scalars (incl. situations that are neither; displacement/
// distance, velocity/speed, weight/mass); notation \uv{a}, AB→, |a|; initial
// and terminal points; zero, equal and negative vectors; |ka| = k|a| and
// direction by the sign of k; a ∥ b ⇔ a = kb; if a, b non-parallel non-zero
// and ha = kb then h = k = 0; addition/subtraction for parallel vectors and
// by triangle, parallelogram and polygon laws; a − b = a + (−b); xi + yj and
// column form; position vectors; unit vector r̂ = r/|r| with magnitude 1;
// arithmetic limited to +, −, scalar multiplication; real-life situations.
const R = String.raw;
const A = [2, 1];
const mag = (v) => Math.hypot(v[0], v[1]);

export const S8_1 = {
  id: '8.1', sk: '8.1', title: 'Vektor', sp: ['8.1.1', '8.1.2', '8.1.3', '8.1.4'], status: 'review', minutes: 45,
  sections: [
    { kind: 'intro', title: '"5 km" sahaja tidak cukup', html: R`<p>Seorang pendaki tersesat dan menghubungi pasukan penyelamat: "Saya 5 km dari kem." Pasukan itu tetap tidak tahu di mana dia berada. "5 km ke arah utara" barulah berguna. Kuantiti yang memerlukan <strong>magnitud dan arah</strong> dipanggil <strong>vektor</strong>.</p>` },
    { kind: 'concept', title: 'Vektor dan skalar', sp: ['8.1.1'], html: R`
      <ul><li><strong>Skalar:</strong> magnitud sahaja, contohnya jarak 5 km, laju 60 km/j, jisim 50 kg, suhu.</li><li><strong>Vektor:</strong> magnitud <em>dan</em> arah, contohnya sesaran 5 km ke utara, halaju 60 km/j ke timur, berat 490 N ke bawah.</li></ul>
      <table class="mini-table"><thead><tr><th>Skalar</th><th>Vektor</th><th>Bezanya</th></tr></thead><tbody>
        <tr><td>jarak</td><td>sesaran</td><td>sesaran ialah jarak lurus dari titik mula <em>ke arah</em> titik akhir</td></tr>
        <tr><td>laju</td><td>halaju</td><td>halaju ialah laju dalam arah tertentu</td></tr>
        <tr><td>jisim</td><td>berat</td><td>berat ialah daya graviti (sentiasa ke bawah)</td></tr>
      </tbody></table>
      <p>Ada juga pernyataan yang <strong>bukan vektor dan bukan skalar</strong>, kerana maklumatnya tidak lengkap: "angin bertiup ke arah selatan" (ada arah, tiada magnitud) atau "kereta dipandu laju" (tiada nilai).</p>` },
    { kind: 'concept', title: 'Mewakilkan vektor', sp: ['8.1.2'], html: R`
      <p>Vektor dilukis sebagai <strong>tembereng garis berarah</strong> (anak panah) dari <strong>titik awal</strong> ke <strong>titik terminal</strong>. Panjang anak panah ialah magnitud; arahnya ialah arah vektor.</p>
      <p>Tatatanda: \(\uv{a}\) (tulisan tangan), \(\mathbf{a}\) (cetakan tebal), atau \(\overrightarrow{AB}\). Magnitud ditulis \(|\uv{a}|\) atau \(|\overrightarrow{AB}|\).</p>
      <ul><li><strong>Vektor sifar</strong> \(\uv{0}\): magnitud 0.</li><li><strong>Vektor sama:</strong> magnitud dan arah sama (kedudukan tidak penting).</li><li><strong>Vektor negatif:</strong> \(-\uv{a}\) sama magnitud dengan \(\uv{a}\) tetapi bertentangan arah; \(\overrightarrow{BA} = -\overrightarrow{AB}\).</li></ul>` },
    { kind: 'concept', title: 'Pendaraban vektor dengan skalar', sp: ['8.1.3'], html: R`
      <p>Jika \(k\) ialah skalar, \(k\uv{a}\) ialah vektor dengan magnitud \(|k| \times |\uv{a}|\).</p>
      <ul><li>\(k > 0\): \(k\uv{a}\) sama arah dengan \(\uv{a}\).</li><li>\(k < 0\): \(k\uv{a}\) bertentangan arah dengan \(\uv{a}\).</li></ul>` },
    { kind: 'visual', title: 'Skalar meregang dan membalikkan vektor', html: R`<p>Biru: \(\uv{a}\). Merah: \(k\uv{a}\). Ubah \(k\).</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-6, 7], y: [-4, 5], params: [{ name: 'k', label: R`\(k\)`, min: -2, max: 3, step: 0.5, value: 2 }],
        arrows: [{ from: () => [0, 0], to: () => A, label: 'a', color: '#3467D4' }, { from: () => [0, -0.6], to: (p) => [p.k * A[0], p.k * A[1] - 0.6], label: 'ka', color: '#D9534F' }],
        readout: (p, { fmt }) => p.k === 0 ? R`\(k = 0\): \(0\uv{a} = \uv{0}\), iaitu vektor sifar.` : R`\(|k\uv{a}| = |${fmt(p.k)}| \times ${fmt(+mag(A).toFixed(3))} = ${fmt(+(Math.abs(p.k) * mag(A)).toFixed(3))}\); arah ${p.k > 0 ? 'sama dengan' : 'bertentangan dengan'} \(\uv{a}\). Kedua-duanya <strong>selari</strong>.` },
      alt: R`Vektor a dari asalan ke (2, 1) dan vektor ka (dianjak sedikit ke bawah supaya kelihatan). Dengan k = 2, ka dua kali panjang dan sama arah. Dengan k = −1, ka sama panjang tetapi menghala ke (−2, −1). Semua gandaan skalar selari dengan a.` },
    { kind: 'concept', title: 'Vektor selari', sp: ['8.1.4'], html: R`
      <p>\(\uv{a}\) dan \(\uv{b}\) selari <strong>jika dan hanya jika</strong> \(\uv{a} = k\uv{b}\) bagi suatu pemalar \(k\). Contohnya \(6\uv{p} - 9\uv{q} = 3(2\uv{p} - 3\uv{q})\), jadi kedua-dua vektor selari dan yang pertama tiga kali lebih panjang.</p>
      <p><strong>Sifat penting:</strong> jika \(\uv{a}\) dan \(\uv{b}\) <em>tidak selari</em> dan bukan sifar, dan \(h\uv{a} = k\uv{b}\), maka \(h = k = 0\). Sebabnya, gandaan \(\uv{a}\) hanya boleh selari dengan \(\uv{a}\). Satu-satunya cara gandaan \(\uv{a}\) sama dengan gandaan \(\uv{b}\) ialah apabila kedua-duanya sifar. Sifat ini membolehkan kita membandingkan pekali.</p>` },
    { kind: 'formula', items: [{ tex: R`|k\uv{a}| = |k|\,|\uv{a}|`, html: R`Arah sama jika \(k > 0\), bertentangan jika \(k < 0\).` }, { tex: R`\uv{a} \parallel \uv{b} \iff \uv{a} = k\uv{b}`, html: R`Jika \(\uv{a} \nparallel \uv{b}\) (bukan sifar) dan \(h\uv{a} = k\uv{b}\), maka \(h = k = 0\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.1.1'], question: R`Kelaskan: (i) halaju 60 km/j ke utara, (ii) jisim 5 kg, (iii) "angin bertiup ke arah selatan".`, given: R`tiga pernyataan`, find: R`vektor, skalar, atau bukan kedua-duanya`, method: R`Semak ada atau tiada magnitud dan arah.`, steps: [{ do: R`(i) magnitud dan arah: vektor` }, { do: R`(ii) magnitud sahaja: skalar` }, { do: R`(iii) arah sahaja, tiada magnitud: bukan vektor, bukan skalar` }], check: R`Setiap jawapan dijustifikasi dengan maklumat yang ada ✓`, conclusion: R`Vektor; skalar; bukan kedua-duanya.` },
      { level: 'sederhana', sp: ['8.1.2'], question: R`Anak panah \(\overrightarrow{AB}\) bergerak 3 unit ke kanan dan 4 unit ke atas. Cari \(|\overrightarrow{AB}|\) dan huraikan \(\overrightarrow{BA}\).`, given: R`komponen anak panah`, find: R`magnitud; \(\overrightarrow{BA}\)`, method: R`Pythagoras; vektor negatif.`, steps: [{ do: R`\(|\overrightarrow{AB}| = \sqrt{3^2 + 4^2} = 5\)` }, { do: R`\(\overrightarrow{BA} = -\overrightarrow{AB}\): magnitud 5, arah 3 ke kiri dan 4 ke bawah` }], check: R`Segi tiga 3-4-5 ✓`, conclusion: R`5 unit; \(\overrightarrow{BA}\) ialah vektor negatif bagi \(\overrightarrow{AB}\).` },
      { level: 'sederhana', sp: ['8.1.3'], question: R`\(|\uv{a}| = 4\). Huraikan \(-3\uv{a}\).`, given: R`\(|\uv{a}| = 4\), \(k = -3\)`, find: R`magnitud dan arah`, method: R`\(|k\uv{a}| = |k||\uv{a}|\).`, steps: [{ do: R`\(|-3\uv{a}| = 3 \times 4 = 12\)` }, { do: R`\(k < 0\): arah bertentangan dengan \(\uv{a}\)` }], check: R`Magnitud sentiasa positif ✓`, conclusion: R`Magnitud 12, arah bertentangan dengan \(\uv{a}\).` },
      { level: 'mencabar', sp: ['8.1.4'], question: R`\(\uv{a}\) dan \(\uv{b}\) tidak selari dan bukan sifar. Jika \((h - 2)\uv{a} = (3 - k)\uv{b}\), cari \(h\) dan \(k\).`, given: R`persamaan vektor`, find: R`\(h, k\)`, method: R`Sifat vektor tidak selari: kedua-dua pekali mesti sifar.`, steps: [{ do: R`\(h - 2 = 0\) dan \(3 - k = 0\)`, why: R`Jika \(h - 2 \ne 0\), maka \(\uv{a} = \tfrac{3 - k}{h - 2}\uv{b}\), iaitu \(\uv{a}\) selari dengan \(\uv{b}\). Ini bercanggah dengan maklumat soalan.` }, { do: R`\(h = 2\), \(k = 3\)` }], check: R`Kedua-dua belah menjadi \(\uv{0}\) ✓`, conclusion: R`\(h = 2\), \(k = 3\).` },
      { level: 'mencabar', sp: ['8.1.4'], question: R`\(\overrightarrow{PQ} = 6\uv{p} - 9\uv{q}\) dan \(\overrightarrow{RS} = 2\uv{p} - 3\uv{q}\). Tunjukkan \(PQ\) selari dengan \(RS\) dan cari nisbah \(|\overrightarrow{PQ}| : |\overrightarrow{RS}|\).`, given: R`dua vektor`, find: R`keselarian; nisbah`, method: R`Cari \(k\) supaya \(\overrightarrow{PQ} = k\overrightarrow{RS}\).`, steps: [{ do: R`\(6\uv{p} - 9\uv{q} = 3(2\uv{p} - 3\uv{q})\)` }, { do: R`\(\overrightarrow{PQ} = 3\overrightarrow{RS}\), jadi selari, dan nisbah \(3 : 1\)` }], check: R`Kedua-dua pekali berganda dengan faktor 3 yang sama ✓`, conclusion: R`Selari; \(3 : 1\).` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Sesaran dan jarak adalah sama.`, why: R`Berjalan 3 km ke timur kemudian 3 km ke barat: jarak 6 km, sesaran 0.`, fix: R`Sesaran mengambil kira arah.` }, { wrong: R`\(|-3\uv{a}| = -12\)`, why: R`Magnitud tidak negatif.`, fix: R`\(|-3\uv{a}| = 3|\uv{a}| = 12\).` }] },
    { kind: 'summary', points: [R`Vektor: magnitud dan arah; skalar: magnitud sahaja.`, R`\(|k\uv{a}| = |k||\uv{a}|\); \(k < 0\) membalikkan arah.`, R`\(\uv{a} \parallel \uv{b} \iff \uv{a} = k\uv{b}\); bagi vektor tidak selari, \(h\uv{a} = k\uv{b} \Rightarrow h = k = 0\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>8.2</strong>: menambah dan menolak vektor.</p>`, links: [{ href: '#/nota/t4-8/8.2', label: '8.2 →' }] },
  ],
};

export const S8_2 = {
  id: '8.2', sk: '8.2', title: 'Penambahan dan Penolakan Vektor', sp: ['8.2.1', '8.2.2'], status: 'review', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Bot menyeberang sungai', html: R`<p>Sebuah bot dihala lurus menyeberang sungai pada 4 m/s, tetapi arus menolaknya ke hilir pada 3 m/s. Bot tidak bergerak lurus ke seberang. Pergerakan sebenar ialah gabungan dua vektor, iaitu <strong>vektor paduan</strong>.</p>` },
    { kind: 'concept', title: 'Hukum-hukum penambahan', sp: ['8.2.1'], html: R`
      <ul>
        <li><strong>Vektor selari:</strong> sama arah, tambah magnitud; bertentangan arah, tolak magnitud. Contohnya 3 km timur + 5 km barat = 2 km barat.</li>
        <li><strong>Hukum segi tiga:</strong> letak ekor \(\uv{b}\) pada kepala \(\uv{a}\). Paduan \(\uv{a} + \uv{b}\) ialah dari ekor \(\uv{a}\) ke kepala \(\uv{b}\): \(\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}\).</li>
        <li><strong>Hukum segi empat selari:</strong> letak kedua-dua ekor bersama. Paduan ialah pepenjuru segi empat selari dari titik bersama itu.</li>
        <li><strong>Hukum poligon:</strong> sambung beberapa vektor kepala ke ekor: \(\overrightarrow{PQ} + \overrightarrow{QR} + \overrightarrow{RS} = \overrightarrow{PS}\).</li>
      </ul>
      <p><strong>Penolakan:</strong> \(\uv{a} - \uv{b} = \uv{a} + (-\uv{b})\), iaitu tambah vektor negatif. Dalam segi tiga \(OAB\) dengan \(\overrightarrow{OA} = \uv{a}\) dan \(\overrightarrow{OB} = \uv{b}\): \(\overrightarrow{AB} = \overrightarrow{AO} + \overrightarrow{OB} = -\uv{a} + \uv{b} = \uv{b} - \uv{a}\).</p>` },
    { kind: 'visual', title: 'Hukum segi tiga: tambah dan tolak', html: R`<p>Biru: \(\uv{a} = 3\uv{i} + \uv{j}\). Hijau: \(\uv{b}\) (atau \(-\uv{b}\) apabila menolak), diletakkan pada kepala \(\uv{a}\). Merah: paduan.</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-4, 8], y: [-4, 6], params: [{ name: 'bx', label: R`komponen-\(x\) bagi \(\uv{b}\)`, min: -3, max: 3, step: 1, value: 1 }, { name: 'by', label: R`komponen-\(y\) bagi \(\uv{b}\)`, min: -3, max: 4, step: 1, value: 3 }, { name: 'neg', label: 'Operasi (0 = a + b, 1 = a − b)', min: 0, max: 1, step: 1, value: 0 }],
        arrows: [{ from: () => [0, 0], to: () => [3, 1], label: 'a', color: '#3467D4' }, { from: () => [3, 1], to: (p) => [3 + (p.neg ? -1 : 1) * p.bx, 1 + (p.neg ? -1 : 1) * p.by], label: (p) => (p.neg ? '−b' : 'b'), color: '#2E9E6B' }, { from: () => [0, 0], to: (p) => [3 + (p.neg ? -1 : 1) * p.bx, 1 + (p.neg ? -1 : 1) * p.by], label: (p) => (p.neg ? 'a − b' : 'a + b'), color: '#D9534F' }],
        readout: (p, { fmt }) => { const s = p.neg ? -1 : 1, r = [3 + s * p.bx, 1 + s * p.by]; return R`\(\uv{a} ${p.neg ? '-' : '+'} \uv{b} = \begin{pmatrix} 3 \\ 1 \end{pmatrix} ${p.neg ? '-' : '+'} \begin{pmatrix} ${fmt(p.bx)} \\ ${fmt(p.by)} \end{pmatrix} = \begin{pmatrix} ${fmt(r[0])} \\ ${fmt(r[1])} \end{pmatrix}\), magnitud \(${fmt(+mag(r).toFixed(3))}\).`; } },
      alt: R`a = (3, 1) dari asalan; b = (1, 3) bermula dari kepala a; paduan a + b = (4, 4) dari asalan ke kepala b, dengan magnitud kira-kira 5.657. Untuk a − b, anak panah hijau dibalikkan menjadi −b = (−1, −3), dan paduan ialah (2, −2).` },
    { kind: 'concept', title: 'Masalah melibatkan vektor', sp: ['8.2.2'], html: R`<p>Dalam masalah navigasi dan daya, lukis rajah anak panah mengikut hukum segi tiga. Jika dua vektor serenjang, magnitud paduan diperoleh dengan Pythagoras, dan arah dengan trigonometri.</p>` },
    { kind: 'formula', items: [{ tex: R`\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}, \qquad \uv{a} - \uv{b} = \uv{a} + (-\uv{b})`, html: R`Hukum segi tiga; penolakan ialah penambahan vektor negatif.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.2.1'], question: R`Hitung sesaran paduan: 3 km ke timur kemudian 5 km ke barat.`, given: R`vektor selari bertentangan`, find: R`paduan`, method: R`Tolak magnitud; arah mengikut yang lebih besar.`, steps: [{ do: R`\(5 - 3 = 2\), ke barat` }], check: R`Jarak dilalui 8 km, tetapi sesaran hanya 2 km ✓`, conclusion: R`2 km ke barat.` },
      { level: 'sederhana', sp: ['8.2.1'], question: R`\(OACB\) ialah segi empat selari dengan \(\overrightarrow{OA} = \uv{a}\), \(\overrightarrow{OB} = \uv{b}\). Ungkapkan \(\overrightarrow{OC}\) dan \(\overrightarrow{BA}\).`, given: R`segi empat selari`, find: R`\(\overrightarrow{OC}\), \(\overrightarrow{BA}\)`, method: R`Hukum segi empat selari dan penolakan.`, steps: [{ do: R`\(\overrightarrow{OC} = \uv{a} + \uv{b}\) (pepenjuru dari O)` }, { do: R`\(\overrightarrow{BA} = \overrightarrow{BO} + \overrightarrow{OA} = -\uv{b} + \uv{a} = \uv{a} - \uv{b}\)` }], check: R`\(\overrightarrow{OB} + \overrightarrow{BA} = \uv{b} + \uv{a} - \uv{b} = \uv{a} = \overrightarrow{OA}\) ✓`, conclusion: R`\(\uv{a} + \uv{b}\); \(\uv{a} - \uv{b}\).` },
      { level: 'mencabar', sp: ['8.2.1'], question: R`Permudahkan \(\overrightarrow{PQ} + \overrightarrow{QR} + \overrightarrow{RS} - \overrightarrow{TS}\).`, given: R`rantaian vektor`, find: R`satu vektor`, method: R`Hukum poligon; \(-\overrightarrow{TS} = \overrightarrow{ST}\).`, steps: [{ do: R`\(\overrightarrow{PQ} + \overrightarrow{QR} + \overrightarrow{RS} = \overrightarrow{PS}\)` }, { do: R`\(\overrightarrow{PS} + \overrightarrow{ST} = \overrightarrow{PT}\)` }], check: R`Huruf tengah bersambung (Q–Q, R–R, S–S) ✓`, conclusion: R`\(\overrightarrow{PT}\).` },
      { level: 'mencabar', sp: ['8.2.2'], question: R`Bot dalam pengenalan: 4 m/s menyeberang dan arus 3 m/s ke hilir (serenjang). Cari laju paduan dan sudut sisihan dari arah menyeberang.`, given: R`dua halaju serenjang`, find: R`magnitud dan arah paduan`, method: R`Pythagoras dan tangen.`, steps: [{ do: R`\(\sqrt{4^2 + 3^2} = 5\) m/s` }, { do: R`\(\tan\theta = \tfrac34 \Rightarrow \theta = 36.87^\circ\) ke hilir` }], check: R`Segi tiga 3-4-5 ✓`, conclusion: R`5 m/s, menyisih 36.87° dari arah menyeberang.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(|\uv{a} + \uv{b}| = |\uv{a}| + |\uv{b}|\) sentiasa.`, why: R`Hanya benar jika sama arah.`, fix: R`Untuk vektor serenjang 3 dan 4, paduan ialah 5, bukan 7.` }, { wrong: R`\(\overrightarrow{AB} = \uv{a} - \uv{b}\) dalam segi tiga \(OAB\).`, why: R`Dari A ke B: balik ke O (\(-\uv{a}\)), kemudian ke B (\(+\uv{b}\)).`, fix: R`\(\overrightarrow{AB} = \uv{b} - \uv{a}\): "kepala tolak ekor".` }] },
    { kind: 'summary', points: [R`Segi tiga: kepala ke ekor; segi empat selari: pepenjuru; poligon: rantaian.`, R`\(\uv{a} - \uv{b} = \uv{a} + (-\uv{b})\); \(\overrightarrow{AB} = \uv{b} - \uv{a}\) jika \(\overrightarrow{OA} = \uv{a}\), \(\overrightarrow{OB} = \uv{b}\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>8.3</strong>: vektor dalam satah Cartes, iaitu dalam sebutan \(\uv{i}\) dan \(\uv{j}\).</p>`, links: [{ href: '#/nota/t4-8/8.3', label: '8.3 →' }] },
  ],
};

export const S8_3 = {
  id: '8.3', sk: '8.3', title: 'Vektor dalam Satah Cartes', sp: ['8.3.1', '8.3.2', '8.3.3', '8.3.4'], status: 'review', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Arah dengan nombor', html: R`<p>Daripada melukis anak panah setiap kali, kita boleh menerangkan vektor dengan dua nombor: berapa jauh ke kanan dan berapa jauh ke atas. Ini membolehkan vektor ditambah dan didarab dengan aritmetik biasa.</p>` },
    { kind: 'concept', title: 'Bentuk xi + yj dan bentuk lajur', sp: ['8.3.1'], html: R`
      <p>\(\uv{i}\) ialah vektor unit ke arah paksi-\(x\) positif, dan \(\uv{j}\) ke arah paksi-\(y\) positif. Sebarang vektor dalam satah:</p>
      \[\uv{r} = x\uv{i} + y\uv{j} = \begin{pmatrix} x \\ y \end{pmatrix}, \qquad |\uv{r}| = \sqrt{x^2 + y^2}\]
      <p><strong>Vektor kedudukan</strong> titik \(A(x, y)\) ialah \(\overrightarrow{OA} = x\uv{i} + y\uv{j}\), dari asalan ke titik itu. Kemudian \(\overrightarrow{AB} = \overrightarrow{OB} - \overrightarrow{OA}\) ("kepala tolak ekor").</p>` },
    { kind: 'concept', title: 'Vektor unit', sp: ['8.3.2'], html: R`
      <p>Vektor unit dalam arah \(\uv{r}\) mempunyai arah yang sama tetapi magnitud tepat <strong>1</strong>. Bahagikan vektor dengan magnitudnya:</p>
      \[\hat{\uv{r}} = \frac{\uv{r}}{|\uv{r}|} = \frac{x\uv{i} + y\uv{j}}{\sqrt{x^2 + y^2}}\]
      <p>Semak: \(|\hat{\uv{r}}| = \dfrac{|\uv{r}|}{|\uv{r}|} = 1\).</p>` },
    { kind: 'visual', title: 'Komponen dan vektor unit', html: R`<p>Biru: \(\uv{r} = x\uv{i} + y\uv{j}\). Putus-putus: komponen \(x\uv{i}\) dan \(y\uv{j}\). Merah: vektor unit \(\hat{\uv{r}}\) (panjang 1).</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-6, 6], y: [-5, 5], params: [{ name: 'x', label: R`\(x\)`, min: -5, max: 5, step: 1, value: 3 }, { name: 'y', label: R`\(y\)`, min: -4, max: 4, step: 1, value: 4 }],
        arrows: [{ from: () => [0, 0], to: (p) => [p.x, 0], dashed: true, color: '#9AA3B5' }, { from: (p) => [p.x, 0], to: (p) => [p.x, p.y], dashed: true, color: '#9AA3B5' }, { from: () => [0, 0], to: (p) => [p.x, p.y], label: 'r', color: '#3467D4' }, { from: () => [0, 0], to: (p) => { const m = Math.hypot(p.x, p.y); return m ? [p.x / m, p.y / m] : null; }, label: 'r̂', color: '#D9534F' }],
        readout: (p, { fmt }) => { const m = Math.hypot(p.x, p.y); return m === 0 ? R`Vektor sifar tiada arah, jadi tiada vektor unit.` : R`\(|\uv{r}| = \sqrt{${fmt(p.x)}^2 + ${fmt(p.y)}^2} = ${fmt(+m.toFixed(3))}\); \(\hat{\uv{r}} = ${fmt(+(p.x / m).toFixed(3))}\uv{i} + ${fmt(+(p.y / m).toFixed(3))}\uv{j}\), magnitud 1.`; } },
      alt: R`r = 3i + 4j dilukis dari asalan ke (3, 4), dengan komponen 3i (mengufuk) dan 4j (menegak) putus-putus. |r| = 5. Vektor unit r̂ = 0.6i + 0.8j berada sepanjang r tetapi dengan panjang 1.` },
    { kind: 'concept', title: 'Operasi aritmetik dalam bentuk komponen', sp: ['8.3.3'], html: R`
      <p>Tambah, tolak dan darab dengan skalar dilakukan <strong>komponen demi komponen</strong>:</p>
      \[\begin{pmatrix} a_1 \\ a_2 \end{pmatrix} \pm \begin{pmatrix} b_1 \\ b_2 \end{pmatrix} = \begin{pmatrix} a_1 \pm b_1 \\ a_2 \pm b_2 \end{pmatrix}, \qquad k\begin{pmatrix} a_1 \\ a_2 \end{pmatrix} = \begin{pmatrix} ka_1 \\ ka_2 \end{pmatrix}\]
      <p><strong>Selari dalam bentuk komponen:</strong> \(\begin{pmatrix} a_1 \\ a_2 \end{pmatrix} \parallel \begin{pmatrix} b_1 \\ b_2 \end{pmatrix}\) jika \(\dfrac{a_1}{b_1} = \dfrac{a_2}{b_2}\) (sama nisbah).</p>` },
    { kind: 'concept', title: 'Masalah vektor dalam satah Cartes', sp: ['8.3.4'], html: R`<p>Tukar setiap maklumat kepada vektor komponen (kedudukan, halaju, daya), lakukan operasi, kemudian tafsir: magnitud memberi laju atau jarak, dan vektor unit memberi arah.</p>` },
    { kind: 'formula', items: [{ tex: R`|x\uv{i} + y\uv{j}| = \sqrt{x^2 + y^2}, \qquad \hat{\uv{r}} = \frac{\uv{r}}{|\uv{r}|}`, html: R`Vektor unit mempunyai magnitud 1.` }, { tex: R`\overrightarrow{AB} = \overrightarrow{OB} - \overrightarrow{OA}`, html: R`Daripada vektor kedudukan.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.3.1'], question: R`Tulis \(\uv{r} = 3\uv{i} - 4\uv{j}\) dalam bentuk lajur dan cari \(|\uv{r}|\).`, given: R`\(\uv{r}\)`, find: R`bentuk lajur; magnitud`, method: R`Komponen dan Pythagoras.`, steps: [{ do: R`\(\begin{pmatrix} 3 \\ -4 \end{pmatrix}\)` }, { do: R`\(|\uv{r}| = \sqrt{9 + 16} = 5\)` }], check: R`Magnitud positif walaupun komponen negatif ✓`, conclusion: R`\(\begin{pmatrix} 3 \\ -4 \end{pmatrix}\); 5.` },
      { level: 'sederhana', sp: ['8.3.2'], question: R`Cari vektor unit dalam arah \(6\uv{i} + 8\uv{j}\).`, given: R`vektor`, find: R`\(\hat{\uv{r}}\)`, method: R`Bahagi dengan magnitud.`, steps: [{ do: R`\(|\uv{r}| = \sqrt{36 + 64} = 10\)` }, { do: R`\(\hat{\uv{r}} = \tfrac{6\uv{i} + 8\uv{j}}{10} = 0.6\uv{i} + 0.8\uv{j}\)` }], check: R`\(\sqrt{0.36 + 0.64} = 1\) ✓`, conclusion: R`\(0.6\uv{i} + 0.8\uv{j}\).` },
      { level: 'sederhana', sp: ['8.3.3'], question: R`\(\uv{a} = 2\uv{i} + 3\uv{j}\), \(\uv{b} = -\uv{i} + 4\uv{j}\). Cari \(2\uv{a} - 3\uv{b}\) dan magnitudnya.`, given: R`dua vektor`, find: R`gabungan dan magnitud`, method: R`Komponen demi komponen.`, steps: [{ do: R`\(2\uv{a} = 4\uv{i} + 6\uv{j}\), \(3\uv{b} = -3\uv{i} + 12\uv{j}\)` }, { do: R`\(2\uv{a} - 3\uv{b} = 7\uv{i} - 6\uv{j}\)` }, { do: R`\(|7\uv{i} - 6\uv{j}| = \sqrt{85} = 9.220\)` }], check: R`\(4 - (-3) = 7\), \(6 - 12 = -6\) ✓`, conclusion: R`\(7\uv{i} - 6\uv{j}\), magnitud \(\sqrt{85}\).` },
      { level: 'mencabar', sp: ['8.3.3'], question: R`\(2\uv{i} + 3\uv{j}\) selari dengan \(6\uv{i} + k\uv{j}\). Cari \(k\).`, given: R`dua vektor selari`, find: R`\(k\)`, method: R`Nisbah komponen sama.`, steps: [{ do: R`\(\tfrac{6}{2} = 3\), jadi \(6\uv{i} + k\uv{j} = 3(2\uv{i} + 3\uv{j})\)` }, { do: R`\(k = 9\)` }], check: R`\(\tfrac{9}{3} = \tfrac{6}{2}\) ✓`, conclusion: R`\(k = 9\).` },
      { level: 'mencabar', sp: ['8.3.4'], question: R`Sebuah pesawat terbang dengan halaju \(300\uv{i} + 400\uv{j}\) km/j, dan angin bertiup dengan halaju \(-50\uv{i}\) km/j. Cari halaju paduan dan laju pesawat.`, given: R`dua halaju`, find: R`paduan; laju`, method: R`Tambah komponen; magnitud.`, steps: [{ do: R`\(250\uv{i} + 400\uv{j}\) km/j` }, { do: R`Laju \(= \sqrt{250^2 + 400^2} = \sqrt{222\,500} = 471.70\) km/j` }], check: R`Angin bertentangan dengan komponen \(\uv{i}\), jadi komponen itu berkurang ✓`, conclusion: R`\(250\uv{i} + 400\uv{j}\); kira-kira 471.70 km/j.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(|3\uv{i} - 4\uv{j}| = \sqrt{9 - 16}\)`, why: R`Kuasa dua komponen negatif adalah positif.`, fix: R`\(\sqrt{3^2 + (-4)^2} = 5\).` }, { wrong: R`Vektor unit \(6\uv{i} + 8\uv{j}\) ialah \(\uv{i} + \uv{j}\).`, why: R`\(|\uv{i} + \uv{j}| = \sqrt2 \ne 1\), dan arahnya berbeza.`, fix: R`Bahagi dengan magnitud: \(0.6\uv{i} + 0.8\uv{j}\).` }] },
    { kind: 'summary', points: [R`\(x\uv{i} + y\uv{j} = \begin{pmatrix} x \\ y \end{pmatrix}\); \(|\uv{r}| = \sqrt{x^2 + y^2}\).`, R`\(\hat{\uv{r}} = \uv{r} / |\uv{r}|\) (magnitud 1).`, R`Operasi komponen demi komponen; selari ⇔ nisbah komponen sama.`] },
    { kind: 'next', html: R`<p>Vektor digunakan dalam fizik (daya, halaju) dan dalam <strong>Kinematik Gerakan Linear</strong> di Tingkatan 5.</p>`, links: [{ href: '#/bab/t4-8', label: 'Kembali ke Bab 8' }] },
  ],
};

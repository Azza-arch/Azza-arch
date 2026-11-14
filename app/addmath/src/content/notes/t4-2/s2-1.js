// Bab 2 · 2.1 Persamaan dan Ketaksamaan Kuadratik (SP 2.1.1–2.1.3). Original.
// DSKP scope: completing the square and the formula; derivation of the
// formula from completing the square; calculator only to CHECK answers;
// forming equations from roots, (x − α)(x − β) = 0 ⇔ x² − (α + β)x + αβ = 0,
// and its link with the general form; quadratic inequalities by graph
// sketch, number line and table.
const R = String.raw;

export const S2_1 = {
  id: '2.1', sk: '2.1', title: 'Persamaan dan Ketaksamaan Kuadratik', sp: ['2.1.1', '2.1.2', '2.1.3'], status: 'published', minutes: 55,
  sections: [
    { kind: 'intro', title: 'Berapakah lebar taman itu?', html: R`
      <p>Sebuah taman segi empat tepat mempunyai panjang 2 m lebih daripada lebarnya, dan luasnya 35 m². Jika lebarnya \(x\) m, maka panjangnya \((x + 2)\) m, dan</p>
      \[x(x + 2) = 35 \quad\Longrightarrow\quad x^2 + 2x - 35 = 0\]
      <p>Persamaan yang sebutan tertingginya \(x^2\) dipanggil <strong>persamaan kuadratik</strong>. Ia biasanya mempunyai <strong>dua</strong> penyelesaian (punca). Di sini, punca-puncanya ialah \(x = 5\) dan \(x = -7\). Lebar tidak boleh negatif, jadi lebar taman ialah 5 m.</p>` },
    { kind: 'prereq', title: 'Kembangan, pemfaktoran dan punca kuasa dua', html: R`
      <p><strong>Kembangan:</strong> \((x + 3)^2 = x^2 + 6x + 9\). Sebutan tengah ialah \(2 \times 3 \times x\). Ia sering terlupa.</p>
      <p><strong>Pemfaktoran:</strong> \(x^2 - 7x + 10 = (x - 2)(x - 5)\), kerana \((-2) \times (-5) = 10\) dan \((-2) + (-5) = -7\).</p>
      <p><strong>Punca kuasa dua:</strong> jika \(u^2 = 9\), maka \(u = 3\) <em>atau</em> \(u = -3\). Tulis \(u = \pm 3\).</p>` },
    { kind: 'concept', title: 'Kaedah penyempurnaan kuasa dua', sp: ['2.1.1'], html: R`
      <p>Idea utamanya: tulis semula \(x^2 + bx\) sebagai satu kuasa dua sempurna, tolak "lebihan"nya.</p>
      \[x^2 + bx = \left(x + \tfrac{b}{2}\right)^2 - \left(\tfrac{b}{2}\right)^2\]
      <p>Kenapa? Kembangkan \(\left(x + \tfrac{b}{2}\right)^2 = x^2 + bx + \left(\tfrac{b}{2}\right)^2\). Ia ada lebihan \(\left(\tfrac{b}{2}\right)^2\), jadi kita tolak semula lebihan itu.</p>
      <p>Contoh: \(x^2 + 6x + 5 = 0\). Separuh daripada 6 ialah 3, jadi \((x + 3)^2 - 9 + 5 = 0\), iaitu \((x + 3)^2 = 4\). Maka \(x + 3 = \pm 2\), memberi \(x = -1\) atau \(x = -5\).</p>
      <div class="callout"><p>Jika pekali \(x^2\) bukan 1 (contohnya \(2x^2 + 8x - 3 = 0\)), bahagi seluruh persamaan dengan pekali itu dahulu.</p></div>` },
    { kind: 'concept', title: 'Dari penyempurnaan kuasa dua kepada rumus', sp: ['2.1.1'], html: R`
      <p>Kita gunakan kaedah yang sama pada bentuk am \(ax^2 + bx + c = 0\), dengan \(a \neq 0\):</p>
      \[x^2 + \frac{b}{a}x = -\frac{c}{a}\]
      \[\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a^2} = -\frac{c}{a}\]
      \[\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}\]
      \[x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a} \quad\Longrightarrow\quad x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}\]
      <p>Inilah <strong>rumus kuadratik</strong>. Ia berfungsi untuk semua persamaan kuadratik, termasuk yang tidak boleh difaktorkan dengan mudah.</p>
      <div class="callout"><p>Kalkulator hanya untuk <strong>menyemak</strong> jawapan. Tunjukkan langkah penggantian ke dalam rumus.</p></div>` },
    { kind: 'visual', title: 'Punca = titik graf memotong paksi-x', html: R`<p>Graf \(y = x^2 + bx + c\). Ubah \(b\) dan \(c\). Punca-punca persamaan \(x^2 + bx + c = 0\) ialah koordinat-\(x\) titik merah.</p>`,
      spec: { type: 'plot', x: [-8, 8], y: [-10, 10], grid: 1, labelStep: 2, params: [{ name: 'b', label: R`\(b\)`, min: -6, max: 6, step: 1, value: 2 }, { name: 'c', label: R`\(c\)`, min: -9, max: 9, step: 1, value: -8 }],
        curves: [{ f: (x, p) => x * x + p.b * x + p.c }],
        points: [{ at: (p) => { const D = p.b * p.b - 4 * p.c; return D >= 0 ? [(-p.b + Math.sqrt(D)) / 2, 0] : null; } }, { at: (p) => { const D = p.b * p.b - 4 * p.c; return D > 0 ? [(-p.b - Math.sqrt(D)) / 2, 0] : null; } }],
        readout: (p, { fmt }) => { const D = p.b * p.b - 4 * p.c; if (D < 0) return R`\(b^2 - 4ac = ${fmt(D)} < 0\): graf tidak memotong paksi-\(x\), jadi tiada punca nyata.`; const r1 = (-p.b - Math.sqrt(D)) / 2, r2 = (-p.b + Math.sqrt(D)) / 2; return R`\(x = \dfrac{${fmt(-p.b)} \pm \sqrt{${fmt(D)}}}{2}\): punca ${D === 0 ? R`sama, \(x = ${fmt(r1)}\)` : R`\(x = ${fmt(+r1.toFixed(3))}\) dan \(x = ${fmt(+r2.toFixed(3))}\)`}.`; } },
      alt: R`Parabola y = x² + bx + c. Dengan b = 2 dan c = −8, graf memotong paksi-x di x = −4 dan x = 2, iaitu punca-punca x² + 2x − 8 = 0. Apabila c dinaikkan cukup tinggi, graf terangkat di atas paksi-x dan tidak lagi memotongnya, jadi tiada punca nyata.` },
    { kind: 'concept', title: 'Membentuk persamaan daripada punca', sp: ['2.1.2'], html: R`
      <p>Jika \(\alpha\) dan \(\beta\) ialah punca, maka \(x - \alpha = 0\) atau \(x - \beta = 0\). Gabungkan kedua-duanya:</p>
      \[(x - \alpha)(x - \beta) = 0 \quad\Longleftrightarrow\quad x^2 - (\alpha + \beta)x + \alpha\beta = 0\]
      <p>Jadi persamaan ditentukan oleh <strong>hasil tambah punca</strong> (HTP) \(\alpha + \beta\) dan <strong>hasil darab punca</strong> (HDP) \(\alpha\beta\).</p>
      <p><strong>Kaitan dengan bentuk am</strong> \(ax^2 + bx + c = 0\): bahagi dengan \(a\) untuk mendapat \(x^2 + \tfrac{b}{a}x + \tfrac{c}{a} = 0\), kemudian bandingkan pekali:</p>
      \[\alpha + \beta = -\frac{b}{a}, \qquad \alpha\beta = \frac{c}{a}\]` },
    { kind: 'concept', title: 'Ketaksamaan kuadratik', sp: ['2.1.3'], html: R`
      <p>Ketaksamaan seperti \(x^2 - 2x - 8 < 0\) bertanya: <em>bagi nilai \(x\) yang manakah ungkapan ini negatif?</em> Ada tiga cara yang memberi jawapan sama:</p>
      <ol>
        <li><strong>Lakaran graf:</strong> faktorkan, \((x + 2)(x - 4) < 0\). Graf \(y = (x + 2)(x - 4)\) memotong paksi-\(x\) di \(-2\) dan \(4\), dan terbuka ke atas. Bahagian <em>di bawah</em> paksi-\(x\) berada di antara kedua-dua punca: \(-2 < x < 4\).</li>
        <li><strong>Garis nombor:</strong> tanda titik \(-2\) dan \(4\). Uji satu nilai dalam setiap kawasan (contohnya \(x = -3, 0, 5\)) dan lihat tanda ungkapan.</li>
        <li><strong>Jadual:</strong> senaraikan tanda setiap faktor dalam setiap kawasan dan darabkan tanda-tanda itu.</li>
      </ol>
      <div class="callout is-warn"><p>Susun semula supaya satu belah ialah <strong>0</strong> sebelum memfaktorkan. Contohnya \(2x^2 + x \ge 6\) mesti ditulis dahulu sebagai \(2x^2 + x - 6 \ge 0\).</p></div>` },
    { kind: 'visual', title: 'Kaedah jadual: tanda setiap faktor', html: R`<p>Ungkapan \((x + 2)(x - 4)\). Nilai negatif dalam lajur terakhir menunjukkan di mana \(x^2 - 2x - 8 < 0\). Tambah nilai \(x\) sendiri untuk menguji.</p>`,
      spec: { type: 'table', xs: [-4, -2, -1, 0, 2, 4, 5], input: true, columns: [{ head: R`\(x\)` }, { head: R`\(x + 2\)`, f: (x) => x + 2 }, { head: R`\(x - 4\)`, f: (x) => x - 4 }, { head: R`\((x+2)(x-4)\)`, f: (x) => (x + 2) * (x - 4) }] },
      alt: R`Jadual nilai: x = −4 memberi (x+2)(x−4) = 16 (positif); x = −2 memberi 0; x = −1 memberi −5; x = 0 memberi −8; x = 2 memberi −8; x = 4 memberi 0; x = 5 memberi 7. Ungkapan negatif hanya apabila −2 < x < 4.` },
    { kind: 'formula', items: [
      { tex: R`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, html: R`Punca bagi \(ax^2 + bx + c = 0\), \(a \ne 0\). Gantikan \(a\), \(b\) dan \(c\) <em>bersama tandanya</em>.` },
      { tex: R`x^2 - (\alpha + \beta)x + \alpha\beta = 0`, html: R`Persamaan kuadratik dengan punca \(\alpha\) dan \(\beta\). Bagi \(ax^2 + bx + c = 0\): \(\alpha + \beta = -\tfrac{b}{a}\), \(\alpha\beta = \tfrac{c}{a}\).` },
      { tex: R`(x - \alpha)(x - \beta) < 0 \iff \alpha < x < \beta`, html: R`Bagi \(\alpha < \beta\). Sebaliknya \((x - \alpha)(x - \beta) > 0 \iff x < \alpha\) atau \(x > \beta\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.1.1'], question: R`Selesaikan \(x^2 - 4x - 5 = 0\) dengan kaedah penyempurnaan kuasa dua.`, given: R`\(x^2 - 4x - 5 = 0\)`, find: R`punca-punca`, method: R`Separuh pekali \(x\) ialah \(-2\).`,
        steps: [{ do: R`\((x - 2)^2 - 4 - 5 = 0\)`, why: R`\(x^2 - 4x = (x - 2)^2 - 4\).` }, { do: R`\((x - 2)^2 = 9\)` }, { do: R`\(x - 2 = \pm 3 \Rightarrow x = 5\) atau \(x = -1\)`, why: R`Kedua-dua punca kuasa dua (positif dan negatif) mesti diambil.` }],
        check: R`\(5^2 - 4(5) - 5 = 0\) ✓, \((-1)^2 - 4(-1) - 5 = 0\) ✓`, conclusion: R`\(x = 5\) atau \(x = -1\).` },
      { level: 'sederhana', sp: ['2.1.1'], question: R`Selesaikan \(2x^2 - 3x - 4 = 0\) menggunakan rumus. Beri jawapan betul kepada tiga tempat perpuluhan.`, given: R`\(a = 2,\ b = -3,\ c = -4\)`, find: R`punca-punca`, method: R`Persamaan tidak mudah difaktorkan, jadi guna rumus.`,
        steps: [{ do: R`\(x = \dfrac{-(-3) \pm \sqrt{(-3)^2 - 4(2)(-4)}}{2(2)}\)`, why: R`Letak setiap pekali dalam kurungan bersama tandanya.` }, { do: R`\(= \dfrac{3 \pm \sqrt{9 + 32}}{4} = \dfrac{3 \pm \sqrt{41}}{4}\)` }, { do: R`\(x = 2.351\) atau \(x = -0.851\)` }],
        check: R`Semak dengan kalkulator: \(2(2.351)^2 - 3(2.351) - 4 \approx 0\) ✓`, conclusion: R`\(x = 2.351\) atau \(x = -0.851\).` },
      { level: 'sederhana', sp: ['2.1.1'], question: R`Selesaikan \(2x^2 + 8x - 3 = 0\) dengan penyempurnaan kuasa dua, betul kepada tiga tempat perpuluhan.`, given: R`\(2x^2 + 8x - 3 = 0\)`, find: R`punca-punca`, method: R`Bahagi dengan 2 dahulu supaya pekali \(x^2\) ialah 1.`,
        steps: [{ do: R`\(x^2 + 4x - 1.5 = 0\)` }, { do: R`\((x + 2)^2 - 4 - 1.5 = 0 \Rightarrow (x + 2)^2 = 5.5\)` }, { do: R`\(x = -2 \pm \sqrt{5.5}\), iaitu \(x = 0.345\) atau \(x = -4.345\)` }],
        check: R`Rumus: \(x = \dfrac{-8 \pm \sqrt{64 + 24}}{4} = \dfrac{-8 \pm \sqrt{88}}{4}\), memberi jawapan sama ✓`, conclusion: R`\(x = 0.345\) atau \(x = -4.345\).` },
      { level: 'sederhana', sp: ['2.1.2'], question: R`Bentukkan persamaan kuadratik yang mempunyai punca \(3\) dan \(-5\).`, given: R`\(\alpha = 3,\ \beta = -5\)`, find: R`persamaan dalam bentuk am`, method: R`Guna HTP dan HDP.`,
        steps: [{ do: R`HTP \(= 3 + (-5) = -2\), HDP \(= 3 \times (-5) = -15\)` }, { do: R`\(x^2 - (-2)x + (-15) = 0 \Rightarrow x^2 + 2x - 15 = 0\)`, why: R`Tolak HTP (tanda berubah), tambah HDP.` }],
        check: R`\((x - 3)(x + 5) = x^2 + 2x - 15\) ✓`, conclusion: R`\(x^2 + 2x - 15 = 0\).` },
      { level: 'mencabar', sp: ['2.1.2'], question: R`Bentukkan persamaan kuadratik dengan pekali integer yang mempunyai punca \(\tfrac{1}{2}\) dan \(-3\).`, given: R`\(\alpha = \tfrac{1}{2},\ \beta = -3\)`, find: R`persamaan dengan pekali integer`, method: R`Bentuk persamaan, kemudian darab untuk menghapuskan pecahan.`,
        steps: [{ do: R`HTP \(= -\tfrac{5}{2}\), HDP \(= -\tfrac{3}{2}\)` }, { do: R`\(x^2 + \tfrac{5}{2}x - \tfrac{3}{2} = 0\)` }, { do: R`Darab dengan 2: \(2x^2 + 5x - 3 = 0\)`, why: R`Mendarab seluruh persamaan dengan nombor bukan sifar tidak mengubah puncanya.` }],
        check: R`\(2\left(\tfrac{1}{2}\right)^2 + 5\left(\tfrac{1}{2}\right) - 3 = \tfrac{1}{2} + \tfrac{5}{2} - 3 = 0\) ✓`, conclusion: R`\(2x^2 + 5x - 3 = 0\).` },
      { level: 'sederhana', sp: ['2.1.3'], question: R`Selesaikan \(x^2 - 2x - 8 < 0\).`, given: R`\(x^2 - 2x - 8 < 0\)`, find: R`julat nilai \(x\)`, method: R`Faktorkan, cari punca, lakar graf.`,
        steps: [{ do: R`\((x + 2)(x - 4) < 0\)` }, { do: R`Punca: \(x = -2\) dan \(x = 4\); graf terbuka ke atas` }, { do: R`Bahagian graf di bawah paksi-\(x\): \(-2 < x < 4\)`, why: R`"\(< 0\)" bermaksud nilai \(y\) negatif.` }],
        check: R`Uji \(x = 0\): \(-8 < 0\) ✓. Uji \(x = 5\): \(7 < 0\)? Tidak, jadi 5 di luar julat ✓`, conclusion: R`\(-2 < x < 4\).` },
      { level: 'mencabar', sp: ['2.1.3'], question: R`Selesaikan \(2x^2 + x \ge 6\).`, given: R`\(2x^2 + x \ge 6\)`, find: R`julat nilai \(x\)`, method: R`Susun semula kepada \(\ldots \ge 0\) dahulu, kemudian guna garis nombor.`,
        steps: [{ do: R`\(2x^2 + x - 6 \ge 0 \Rightarrow (2x - 3)(x + 2) \ge 0\)` }, { do: R`Punca: \(x = 1.5\) dan \(x = -2\)` }, { do: R`Graf terbuka ke atas, jadi \(\ge 0\) di luar punca: \(x \le -2\) atau \(x \ge 1.5\)`, why: R`Tanda "\(\ge\)" bermaksud punca itu sendiri juga termasuk.` }],
        check: R`Uji \(x = 0\): \(0 \ge 6\)? Tidak ✓ (0 di antara punca, jadi bukan penyelesaian). Uji \(x = 2\): \(10 \ge 6\) ✓`, conclusion: R`\(x \le -2\) atau \(x \ge 1.5\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(x^2 = 3x \Rightarrow x = 3\) (bahagi kedua-dua belah dengan \(x\))`, why: R`Membahagi dengan \(x\) menghilangkan punca \(x = 0\).`, fix: R`\(x^2 - 3x = 0 \Rightarrow x(x - 3) = 0 \Rightarrow x = 0\) atau \(x = 3\).` },
      { wrong: R`\((x - 2)^2 = 9 \Rightarrow x - 2 = 3\) sahaja.`, why: R`\((-3)^2\) juga 9.`, fix: R`\(x - 2 = \pm 3\), jadi \(x = 5\) atau \(x = -1\).` },
      { wrong: R`Bagi \(2x^2 - 3x - 4 = 0\), menulis \(-b = -3\).`, why: R`\(b = -3\), jadi \(-b = -(-3) = 3\).`, fix: R`Tulis setiap pekali dalam kurungan sebelum menggantikan.` },
      { wrong: R`\(x^2 - 2x - 8 < 0 \Rightarrow x < 4\)`, why: R`Ketaksamaan kuadratik biasanya memberi satu selang di antara punca, atau dua kawasan di luar punca.`, fix: R`Lakar graf: \(-2 < x < 4\).` },
    ] },
    { kind: 'summary', points: [
      R`Penyempurnaan kuasa dua: \(x^2 + bx = \left(x + \tfrac{b}{2}\right)^2 - \left(\tfrac{b}{2}\right)^2\). Ingat \(\pm\) apabila mengambil punca kuasa dua.`,
      R`Rumus kuadratik diterbitkan daripada penyempurnaan kuasa dua. Kalkulator hanya untuk menyemak.`,
      R`Punca \(\alpha, \beta\): \(x^2 - (\alpha+\beta)x + \alpha\beta = 0\); \(\alpha + \beta = -\tfrac{b}{a}\), \(\alpha\beta = \tfrac{c}{a}\).`,
      R`Ketaksamaan: jadikan satu belah 0, faktorkan, lakar graf (atau guna garis nombor atau jadual), dan baca kawasan yang betul.`,
    ] },
    { kind: 'next', html: R`<p>Dalam <strong>2.2</strong>, ungkapan \(b^2 - 4ac\) di bawah tanda punca kuasa dua dalam rumus akan memberitahu kita jenis punca, tanpa perlu menyelesaikan persamaan.</p>`, links: [{ href: '#/nota/t4-2/2.2', label: '2.2 Jenis-jenis Punca →' }] },
  ],
};

// Bab 2 · 2.3 Fungsi Kuadratik (SP 2.3.1–2.3.6). Original content.
// DSKP scope: effects of a, b, c on the graph; graph position vs root type;
// vertex form a(x − h)² + k related to other forms (with sketching and
// completing the square); effects of a, h, k incl. axis of symmetry,
// max/min values, x = −b/2a; sketching; real-life max/min problems.
const R = String.raw;

export const S2_3 = {
  id: '2.3', sk: '2.3', title: 'Fungsi Kuadratik', sp: ['2.3.1', '2.3.2', '2.3.3', '2.3.4', '2.3.5', '2.3.6'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Lengkung air pancut', html: R`
      <p>Air dari pancutan taman bergerak dalam lengkung yang naik, sampai ke titik tertinggi, kemudian turun. Lengkung ini ialah <strong>parabola</strong>, iaitu graf bagi fungsi kuadratik \(f(x) = ax^2 + bx + c\).</p>
      <p>Dalam subtopik ini, anda akan belajar membaca graf parabola: ke mana ia terbuka, di mana titik tertinggi atau terendahnya, dan berapa kali ia memotong paksi-\(x\). Kemudian kita gunakannya untuk menyelesaikan masalah seperti "berapakah luas maksimum?".</p>` },
    { kind: 'concept', title: 'Kesan a, b dan c', sp: ['2.3.1'], html: R`
      <ul>
        <li>\(a > 0\): graf terbuka ke atas, berbentuk "senyum" dengan titik minimum. \(a < 0\): terbuka ke bawah, dengan titik maksimum.</li>
        <li>\(|a|\) besar: graf lebih "sempit"; \(|a|\) kecil: lebih "lebar".</li>
        <li>\(c\): pintasan-\(y\), kerana \(f(0) = c\). Mengubah \(c\) menggerakkan graf ke atas atau ke bawah.</li>
        <li>\(b\) (bersama \(a\)): menggerakkan paksi simetri, \(x = -\dfrac{b}{2a}\), ke kiri atau ke kanan.</li>
      </ul>` },
    { kind: 'concept', title: 'Kedudukan graf dan jenis punca', sp: ['2.3.2'], html: R`
      <p>Punca \(f(x) = 0\) ialah pintasan-\(x\) graf, jadi:</p>
      <ul><li>\(b^2 - 4ac > 0\): graf memotong paksi-\(x\) di dua titik.</li><li>\(b^2 - 4ac = 0\): graf menyentuh paksi-\(x\) di satu titik (bucu di atas paksi-\(x\)).</li><li>\(b^2 - 4ac < 0\): graf tidak menyentuh paksi-\(x\). Jika \(a > 0\), seluruh graf berada di atas paksi-\(x\) (\(f(x) > 0\) bagi semua \(x\)); jika \(a < 0\), seluruh graf di bawah.</li></ul>` },
    { kind: 'visual', title: 'Teroka a, b dan c', html: R`<p>Ubah setiap pekali satu demi satu dan perhatikan apa yang berubah.</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-8, 8], params: [{ name: 'a', label: R`\(a\)`, min: -3, max: 3, step: 0.5, value: 1 }, { name: 'b', label: R`\(b\)`, min: -6, max: 6, step: 1, value: -2 }, { name: 'c', label: R`\(c\)`, min: -6, max: 6, step: 1, value: -3 }],
        curves: [{ f: (x, p) => p.a * x * x + p.b * x + p.c }], vlinesAt: [{ at: (p) => (p.a ? -p.b / (2 * p.a) : NaN), label: 'paksi simetri' }],
        points: [{ at: (p) => [0, p.c], label: 'pintasan-y' }],
        readout: (p, { fmt }) => { if (!p.a) return R`\(a = 0\): graf ialah garis lurus, bukan parabola.`; const h = -p.b / (2 * p.a), k = p.a * h * h + p.b * h + p.c, D = p.b * p.b - 4 * p.a * p.c; return R`${p.a > 0 ? 'Terbuka ke atas' : 'Terbuka ke bawah'}; paksi simetri \(x = ${fmt(+h.toFixed(3))}\); ${p.a > 0 ? 'minimum' : 'maksimum'} \(${fmt(+k.toFixed(3))}\); pintasan-\(y\) \(${fmt(p.c)}\); \(b^2 - 4ac = ${fmt(D)}\) → ${D > 0 ? '2' : D === 0 ? '1' : '0'} pintasan-\(x\).`; } },
      alt: R`Parabola y = ax² + bx + c dengan paksi simetri bertanda. Untuk y = x² − 2x − 3: terbuka ke atas, paksi simetri x = 1, nilai minimum −4, pintasan-y −3, dan dua pintasan-x di −1 dan 3. Menukar a kepada nilai negatif membalikkan graf ke bawah; menukar c menggerakkannya ke atas atau ke bawah.` },
    { kind: 'concept', title: 'Bentuk verteks dan bentuk-bentuk lain', sp: ['2.3.3'], html: R`
      <p>Fungsi kuadratik boleh ditulis dalam tiga bentuk:</p>
      <ul><li><strong>Bentuk am:</strong> \(f(x) = ax^2 + bx + c\) (pintasan-\(y\) mudah dibaca)</li><li><strong>Bentuk pintasan:</strong> \(f(x) = a(x - p)(x - q)\) (pintasan-\(x\) \(p\) dan \(q\) mudah dibaca)</li><li><strong>Bentuk verteks:</strong> \(f(x) = a(x - h)^2 + k\) (bucu \((h, k)\) mudah dibaca)</li></ul>
      <p>Penyempurnaan kuasa dua menukar bentuk am kepada bentuk verteks. Contohnya:</p>
      \[2x^2 - 8x + 3 = 2(x^2 - 4x) + 3 = 2\left[(x - 2)^2 - 4\right] + 3 = 2(x - 2)^2 - 5\]
      <p>Bucunya ialah \((2, -5)\). Perhatikan bahawa \(-4\) di dalam kurungan siku didarab dengan 2 apabila dikeluarkan.</p>` },
    { kind: 'concept', title: 'Kesan a, h dan k', sp: ['2.3.4'], html: R`
      <p>Bagi \(f(x) = a(x - h)^2 + k\):</p>
      <ul><li>Bucu (titik pusingan) ialah \((h, k)\), dan paksi simetri ialah \(x = h\).</li><li>Jika \(a > 0\), nilai minimum ialah \(k\) (berlaku apabila \(x = h\)). Jika \(a < 0\), nilai maksimum ialah \(k\).</li><li>Kenapa? \((x - h)^2 \ge 0\) sentiasa, dan sifar hanya apabila \(x = h\).</li></ul>
      <p>Daripada bentuk am, paksi simetri juga boleh dicari terus: \(x = -\dfrac{b}{2a}\).</p>
      <div class="callout is-warn"><p>\(f(x) = (x - 3)^2 + 1\) mempunyai bucu \((3, 1)\), bukan \((-3, 1)\). Tanda dalam kurungan diterbalikkan.</p></div>` },
    { kind: 'visual', title: 'Teroka bentuk verteks', html: R`<p>\(f(x) = a(x - h)^2 + k\). Gerakkan \(h\) dan \(k\) untuk menggerakkan bucu. Ubah \(a\) untuk menukar bentuk.</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-8, 8], params: [{ name: 'a', label: R`\(a\)`, min: -2, max: 2, step: 0.5, value: 1 }, { name: 'h', label: R`\(h\)`, min: -4, max: 4, step: 1, value: 2 }, { name: 'k', label: R`\(k\)`, min: -5, max: 5, step: 1, value: -3 }],
        curves: [{ f: (x, p) => p.a * (x - p.h) ** 2 + p.k }], vlinesAt: [{ at: (p) => p.h, label: 'x = h' }],
        points: [{ at: (p) => [p.h, p.k], label: (p) => `(${p.h}, ${p.k})` }],
        readout: (p, { fmt }) => p.a === 0 ? R`\(a = 0\): bukan fungsi kuadratik.` : R`Bucu \((${fmt(p.h)}, ${fmt(p.k)})\), paksi simetri \(x = ${fmt(p.h)}\), nilai ${p.a > 0 ? 'minimum' : 'maksimum'} \(${fmt(p.k)}\).` },
      alt: R`Parabola f(x) = a(x − h)² + k dengan bucu bertanda. Untuk a = 1, h = 2, k = −3, bucu di (2, −3), paksi simetri x = 2, dan nilai minimum −3. Menambah h menggerakkan graf ke kanan; menambah k menggerakkannya ke atas; a negatif menjadikan bucu titik maksimum.` },
    { kind: 'concept', title: 'Melakar graf fungsi kuadratik', sp: ['2.3.5'], html: R`
      <ol><li><strong>Bentuk:</strong> tanda \(a\) (∪ atau ∩).</li><li><strong>Pintasan-\(y\):</strong> \(f(0) = c\).</li><li><strong>Pintasan-\(x\)</strong> (jika ada): selesaikan \(f(x) = 0\).</li><li><strong>Bucu:</strong> bentuk verteks atau \(x = -\tfrac{b}{2a}\).</li><li>Plot titik-titik ini, lukis lengkung licin yang simetri, dan labelkan semuanya.</li></ol>` },
    { kind: 'concept', title: 'Masalah nilai maksimum dan minimum', sp: ['2.3.6'], html: R`
      <p>Banyak situasi sebenar memberi fungsi kuadratik: luas, ketinggian objek yang dilontar, keuntungan. Untuk mencari nilai terbesar atau terkecil:</p>
      <ol><li>Bina fungsi kuadratik daripada situasi (namakan pemboleh ubah dengan jelas).</li><li>Cari bucu: bentuk verteks atau \(x = -\tfrac{b}{2a}\).</li><li>Semak bahawa nilai itu munasabah dalam konteks (contohnya panjang mesti positif).</li><li>Jawab soalan dengan unit.</li></ol>` },
    { kind: 'formula', items: [
      { tex: R`f(x) = a(x - h)^2 + k`, html: R`Bucu \((h, k)\); paksi simetri \(x = h\); nilai min. (\(a > 0\)) atau maks. (\(a < 0\)) ialah \(k\).` },
      { tex: R`x = -\frac{b}{2a}`, html: R`Paksi simetri bagi \(f(x) = ax^2 + bx + c\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.3.4'], question: R`Bagi \(f(x) = -(x - 3)^2 + 7\), nyatakan bucu, paksi simetri, dan nilai maksimum atau minimum.`, given: R`\(a = -1,\ h = 3,\ k = 7\)`, find: R`bucu, paksi, nilai maks/min`, method: R`Baca terus daripada bentuk verteks.`,
        steps: [{ do: R`Bucu \((3, 7)\), paksi simetri \(x = 3\)`, why: R`Tanda dalam \((x - 3)\) diterbalikkan, jadi \(h = 3\).` }, { do: R`\(a = -1 < 0\): graf ∩, jadi nilai maksimum \(7\)` }],
        check: R`\(f(3) = 0 + 7 = 7\), dan \(f(2) = f(4) = 6 < 7\) ✓`, conclusion: R`Bucu \((3, 7)\); \(x = 3\); nilai maksimum 7.` },
      { level: 'mudah', sp: ['2.3.1'], question: R`Bandingkan graf \(f(x) = x^2 - 4x + 3\) dengan \(g(x) = x^2 - 4x + 7\) dan \(h(x) = -x^2 + 4x - 3\).`, given: R`tiga fungsi kuadratik`, find: R`kesan perubahan \(c\) dan tanda \(a\)`, method: R`Bandingkan pekali satu demi satu.`,
        steps: [{ do: R`\(f\) dan \(g\): \(a\) dan \(b\) sama, hanya \(c\) berubah dari 3 kepada 7`, why: R`Setiap nilai \(g(x)\) tepat 4 lebih besar daripada \(f(x)\).` }, { do: R`Jadi graf \(g\) ialah graf \(f\) yang dianjak 4 unit ke atas; paksi simetri kekal \(x = -\tfrac{-4}{2} = 2\)` }, { do: R`\(h(x) = -f(x)\): semua pekali bertukar tanda, jadi graf \(h\) ialah pantulan graf \(f\) pada paksi-\(x\) (terbuka ke bawah)` }],
        check: R`\(f(2) = -1\), \(g(2) = 3\) (4 lebih tinggi), \(h(2) = 1\) (pantulan) ✓`, conclusion: R`Mengubah \(c\) menganjak graf secara menegak; menukar tanda \(a\) (bersama \(b\) dan \(c\)) memantulkan graf pada paksi-\(x\).` },
      { level: 'sederhana', sp: ['2.3.3'], question: R`Ungkapkan \(f(x) = 2x^2 - 8x + 3\) dalam bentuk \(a(x - h)^2 + k\).`, given: R`\(f(x) = 2x^2 - 8x + 3\)`, find: R`bentuk verteks`, method: R`Faktorkan 2 daripada sebutan \(x\), kemudian sempurnakan kuasa dua di dalam kurungan.`,
        steps: [{ do: R`\(2(x^2 - 4x) + 3\)` }, { do: R`\(2\left[(x - 2)^2 - 4\right] + 3\)`, why: R`\(x^2 - 4x = (x - 2)^2 - 4\).` }, { do: R`\(2(x - 2)^2 - 8 + 3 = 2(x - 2)^2 - 5\)`, why: R`\(-4\) didarab dengan 2 apabila kurungan siku dibuka.` }],
        check: R`Kembangkan: \(2(x^2 - 4x + 4) - 5 = 2x^2 - 8x + 3\) ✓`, conclusion: R`\(f(x) = 2(x - 2)^2 - 5\), dengan bucu \((2, -5)\).` },
      { level: 'sederhana', sp: ['2.3.4', '2.3.2'], question: R`Tunjukkan bahawa \(f(x) = x^2 + 2x + 5\) sentiasa positif bagi semua nilai \(x\).`, given: R`\(f(x) = x^2 + 2x + 5\)`, find: R`bukti \(f(x) > 0\)`, method: R`Bentuk verteks memberi nilai minimum.`,
        steps: [{ do: R`\(f(x) = (x + 1)^2 + 4\)` }, { do: R`\((x + 1)^2 \ge 0\), jadi \(f(x) \ge 4 > 0\)`, why: R`Kuasa dua sentiasa tidak negatif.` }],
        check: R`Pembezalayan \(4 - 20 = -16 < 0\) dan \(a > 0\): graf di atas paksi-\(x\) ✓`, conclusion: R`Nilai minimum ialah 4, jadi \(f(x) > 0\) bagi semua \(x\).` },
      { level: 'mencabar', sp: ['2.3.5'], question: R`Lakar graf \(f(x) = x^2 - 4x - 5\).`, given: R`\(a = 1,\ b = -4,\ c = -5\)`, find: R`lakaran berlabel`, method: R`Ikut lima langkah lakaran.`,
        steps: [{ do: R`\(a > 0\): bentuk ∪` }, { do: R`Pintasan-\(y\): \(f(0) = -5\)` }, { do: R`Pintasan-\(x\): \((x - 5)(x + 1) = 0 \Rightarrow x = 5,\ x = -1\)` }, { do: R`Bucu: \(x = -\tfrac{-4}{2} = 2\), \(f(2) = 4 - 8 - 5 = -9\), jadi \((2, -9)\)` }, { do: R`Plot \((-1, 0)\), \((5, 0)\), \((0, -5)\), \((2, -9)\) dan lukis lengkung simetri pada \(x = 2\)` }],
        check: R`Pintasan-\(x\) simetri pada paksi: \(\tfrac{-1 + 5}{2} = 2\) ✓`, conclusion: R`Graf ∪ dengan bucu \((2, -9)\), pintasan-\(x\) \(-1\) dan 5, dan pintasan-\(y\) \(-5\).` },
      { level: 'mencabar', sp: ['2.3.6'], question: R`Seorang petani ada 40 m pagar untuk memagar sebuah kandang segi empat tepat. Cari luas maksimum kandang itu.`, given: R`perimeter 40 m`, find: R`luas maksimum`, method: R`Ungkapkan luas sebagai fungsi kuadratik satu pemboleh ubah.`,
        steps: [{ do: R`Biar lebar \(x\) m; maka panjang \(= 20 - x\) m`, why: R`Panjang + lebar = separuh perimeter = 20.` }, { do: R`\(A(x) = x(20 - x) = -x^2 + 20x\)` }, { do: R`Paksi simetri \(x = -\tfrac{20}{2(-1)} = 10\); \(A(10) = 100\)`, why: R`\(a = -1 < 0\), jadi bucu ialah titik maksimum.` }],
        check: R`\(A(9) = 99 < 100\) dan \(A(11) = 99 < 100\) ✓`, conclusion: R`Luas maksimum 100 m², apabila kandang berbentuk segi empat sama 10 m × 10 m.` },
      { level: 'mencabar', sp: ['2.3.6'], question: R`Tinggi sebiji bola, \(t\) saat selepas dilambung, ialah \(h(t) = -5t^2 + 20t + 1.5\) meter. Cari tinggi maksimum dan bilakah ia berlaku.`, given: R`\(h(t) = -5t^2 + 20t + 1.5\)`, find: R`tinggi maksimum dan masa`, method: R`Penyempurnaan kuasa dua.`,
        steps: [{ do: R`\(h(t) = -5(t^2 - 4t) + 1.5 = -5\left[(t - 2)^2 - 4\right] + 1.5\)` }, { do: R`\(= -5(t - 2)^2 + 21.5\)` }, { do: R`Maksimum 21.5 m apabila \(t = 2\) s` }],
        check: R`\(h(2) = -20 + 40 + 1.5 = 21.5\) ✓`, conclusion: R`Tinggi maksimum 21.5 m, pada \(t = 2\) saat.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Bucu \(f(x) = 2(x + 1)^2 - 3\) ialah \((1, -3)\).`, why: R`\((x + 1) = (x - (-1))\), jadi \(h = -1\).`, fix: R`Bucu \((-1, -3)\).` },
      { wrong: R`\(2(x^2 - 4x) + 3 = 2(x - 2)^2 - 4 + 3\)`, why: R`\(-4\) berada di dalam kurungan yang didarab dengan 2.`, fix: R`\(2[(x - 2)^2 - 4] + 3 = 2(x - 2)^2 - 5\).` },
      { wrong: R`\(f(x) = -x^2 + 6x\) mempunyai nilai minimum.`, why: R`\(a < 0\) bermaksud graf ∩, dengan titik maksimum.`, fix: R`Tentukan jenis titik pusingan daripada tanda \(a\) dahulu.` },
      { wrong: R`Paksi simetri \(x^2 + 6x + 2\) ialah \(x = 3\).`, why: R`\(x = -\tfrac{b}{2a} = -\tfrac{6}{2} = -3\).`, fix: R`Ingat tanda negatif dalam rumus.` },
    ] },
    { kind: 'summary', points: [
      R`\(a\): bentuk dan kelebaran; \(c\): pintasan-\(y\); paksi simetri \(x = -\tfrac{b}{2a}\).`,
      R`Bentuk verteks \(a(x - h)^2 + k\): bucu \((h, k)\); nilai minimum (\(a > 0\)) atau maksimum (\(a < 0\)) ialah \(k\).`,
      R`Bilangan pintasan-\(x\) ditentukan oleh \(b^2 - 4ac\).`,
      R`Masalah maks/min: bina fungsi, cari bucu, semak konteks, beri unit.`,
    ] },
    { kind: 'next', html: R`<p>Fungsi kuadratik muncul semula dalam <strong>Bab 3</strong> (persamaan serentak dengan satu persamaan tak linear) dan dalam <strong>Pembezaan</strong> di Tingkatan 5, iaitu cara lain untuk mencari nilai maksimum dan minimum.</p>`, links: [{ href: '#/bab/t4-2', label: 'Kembali ke Bab 2' }] },
  ],
};

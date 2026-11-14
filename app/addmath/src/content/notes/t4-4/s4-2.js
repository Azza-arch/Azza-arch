// Bab 4 · 4.2 Hukum Surd (SP 4.2.1–4.2.5). Original.
// DSKP: rational vs irrational (recurring/terminating decimals; √2, π, e);
// recurring decimals → fractions; surd = irrational number in root form ⁿ√a;
// "not every root is a surd"; reading surds ("surd 4 peringkat 3"); ⁿ√a vs
// n√a; laws limited to square roots; simplification excludes surd
// denominators; like vs unlike surds; rationalising m√a and m√a ± n√b
// (conjugate); problems involving indices.
const R = String.raw;

export const S4_2 = {
  id: '4.2', sk: '4.2', title: 'Hukum Surd', sp: ['4.2.1', '4.2.2', '4.2.3', '4.2.4', '4.2.5'], status: 'review', minutes: 55,
  sections: [
    { kind: 'intro', title: 'Pepenjuru yang tidak pernah "habis"', html: R`
      <p>Sebuah petak lantai berbentuk segi empat sama dengan sisi 1 m. Menurut teorem Pythagoras, pepenjurunya \(\sqrt{1^2 + 1^2} = \sqrt{2}\) m. Kalkulator memberi \(1.41421356\ldots\), dan digit-digitnya tidak pernah berulang atau berhenti.</p>
      <p>Jika kita bundarkan kepada \(1.41\), jawapan itu sudah tidak tepat. Jadi ahli matematik mengekalkan bentuk tepatnya, \(\sqrt{2}\). Nombor seperti ini dipanggil <strong>surd</strong>.</p>` },
    { kind: 'concept', title: 'Nombor nisbah, tak nisbah dan surd', sp: ['4.2.1'], html: R`
      <p><strong>Nombor nisbah</strong> boleh ditulis sebagai pecahan \(\tfrac{p}{q}\) (\(p, q\) integer, \(q \ne 0\)). Dalam bentuk perpuluhan, ia sama ada <em>berakhir</em> (\(0.5\), \(0.175\)) atau <em>berulang</em> (\(0.333\ldots\), \(0.1414\ldots\)).</p>
      <p><strong>Nombor tak nisbah</strong> mempunyai perpuluhan yang tidak berakhir dan tidak berulang, contohnya \(\sqrt{2} = 1.4142135\ldots\), \(\pi = 3.14159\ldots\) dan \(e = 2.71828\ldots\).</p>
      <p><strong>Menukar perpuluhan berulang kepada pecahan:</strong> biar \(x = 0.141414\ldots\). Maka \(100x = 14.1414\ldots\). Tolak: \(99x = 14\), jadi \(x = \tfrac{14}{99}\). Kita darab dengan \(10^k\), dengan \(k\) ialah panjang corak berulang, supaya bahagian berulang terbatal apabila ditolak.</p>
      <p><strong>Surd</strong> ialah nombor tak nisbah dalam bentuk punca, \(\sqrt[n]{a}\). <strong>Tidak semua punca ialah surd:</strong> \(\sqrt{9} = 3\) dan \(\sqrt[3]{8} = 2\) ialah nombor nisbah, tetapi \(\sqrt{12}\) dan \(\sqrt[3]{4}\) ialah surd.</p>
      <p><strong>Sebutan:</strong> \(\sqrt[3]{4}\) dibaca "surd 4 peringkat 3". Bezakan \(\sqrt[n]{a}\) (punca ke-\(n\) bagi \(a\)) dengan \(n\sqrt{a}\) (\(n\) darab \(\sqrt{a}\)). Contohnya \(\sqrt[3]{8} = 2\), tetapi \(3\sqrt{8} = 3 \times 2.828\ldots \approx 8.49\).</p>` },
    { kind: 'concept', title: 'Hukum surd: pendaraban dan pembahagian', sp: ['4.2.2'], html: R`
      <p>Cuba dengan nombor: \(\sqrt{4} \times \sqrt{9} = 2 \times 3 = 6\), dan \(\sqrt{4 \times 9} = \sqrt{36} = 6\). Sama! Kita buat konjektur, sahkan dengan contoh lain, kemudian generalisasikan (bagi \(a, b > 0\)):</p>
      \[\sqrt{a} \times \sqrt{b} = \sqrt{ab} \qquad \sqrt{a} \div \sqrt{b} = \sqrt{\frac{a}{b}}\]
      <p>Kenapa ia benar: \(\left(\sqrt{a}\sqrt{b}\right)^2 = a \cdot b\), dan \(\sqrt{a}\sqrt{b}\) positif, jadi ia ialah punca kuasa dua positif bagi \(ab\).</p>
      <div class="callout is-warn"><p><strong>Tiada hukum untuk tambah:</strong> \(\sqrt{9} + \sqrt{16} = 3 + 4 = 7\), tetapi \(\sqrt{25} = 5\). Jadi \(\sqrt{a} + \sqrt{b} \ne \sqrt{a + b}\).</p></div>` },
    { kind: 'concept', title: 'Mempermudahkan ungkapan surd', sp: ['4.2.3'], html: R`
      <p><strong>Keluarkan faktor kuasa dua sempurna:</strong> \(\sqrt{90} = \sqrt{9 \times 10} = 3\sqrt{10}\).</p>
      <p><strong>Surd serupa</strong> (bahagian punca yang sama) boleh ditambah atau ditolak seperti sebutan algebra serupa: \(3\sqrt{2} + 5\sqrt{2} = 8\sqrt{2}\). <strong>Surd tak serupa</strong>, seperti \(\sqrt{2} + \sqrt{3}\), tidak boleh digabungkan.</p>
      <p>Kadangkala surd menjadi serupa selepas dipermudahkan: \(\sqrt{18} - \sqrt{8} = 3\sqrt{2} - 2\sqrt{2} = \sqrt{2}\).</p>
      <p>Lain-lain: \(\sqrt{2} \times \sqrt{3} + \sqrt{6} = \sqrt{6} + \sqrt{6} = 2\sqrt{6}\); \(\dfrac{\sqrt{18}}{3} = \dfrac{3\sqrt{2}}{3} = \sqrt{2}\).</p>` },
    { kind: 'concept', title: 'Menisbahkan penyebut', sp: ['4.2.4'], html: R`
      <p>Ungkapan biasanya ditulis tanpa surd di penyebut. Kita darab atas dan bawah dengan nombor yang sesuai; ini sama seperti mendarab dengan 1, jadi nilai tidak berubah.</p>
      <p><strong>Penyebut \(m\sqrt{a}\):</strong> darab dengan \(\sqrt{a}\). Contoh: \(\dfrac{2}{\sqrt{3}} = \dfrac{2\sqrt{3}}{3}\).</p>
      <p><strong>Penyebut \(m\sqrt{a} \pm n\sqrt{b}\):</strong> darab dengan <strong>surd konjugat</strong> (tukar tanda di tengah). Kenapa? \((p + q)(p - q) = p^2 - q^2\), jadi kuasa dua menghapuskan punca:</p>
      \[\frac{3}{\sqrt{2} + \sqrt{5}} \times \frac{\sqrt{5} - \sqrt{2}}{\sqrt{5} - \sqrt{2}} = \frac{3(\sqrt{5} - \sqrt{2})}{5 - 2} = \sqrt{5} - \sqrt{2}\]` },
    { kind: 'visual', title: 'Nilai tidak berubah selepas penisbahan', html: R`<p>Lajur kedua dan ketiga sentiasa sama: \(\dfrac{1}{\sqrt{x}}\) dan bentuk yang telah dinisbahkan, \(\dfrac{\sqrt{x}}{x}\). Cuba nilai \(x\) anda sendiri.</p>`,
      spec: { type: 'table', xs: [2, 3, 5, 7, 12], input: true, columns: [{ head: R`\(x\)` }, { head: R`\(\dfrac{1}{\sqrt{x}}\)`, f: (x) => (x > 0 ? 1 / Math.sqrt(x) : NaN) }, { head: R`\(\dfrac{\sqrt{x}}{x}\)`, f: (x) => (x > 0 ? Math.sqrt(x) / x : NaN) }] },
      alt: R`Jadual: bagi x = 2, kedua-dua 1/√x dan √x/x bernilai 0.70710678…; bagi x = 3, kedua-duanya 0.57735026…; dan seterusnya. Penisbahan menukar bentuk, bukan nilai.` },
    { kind: 'concept', title: 'Masalah melibatkan surd dan indeks', sp: ['4.2.5'], html: R`
      <p>Dalam masalah geometri (luas, Pythagoras), jawapan surd mengekalkan ketepatan. Ingat juga \(\sqrt{a} = a^{\frac{1}{2}}\), jadi hukum indeks boleh digunakan: \(\left(\sqrt{5}\right)^4 = 5^2 = 25\).</p>` },
    { kind: 'formula', items: [
      { tex: R`\sqrt{a}\sqrt{b} = \sqrt{ab}, \quad \frac{\sqrt{a}}{\sqrt{b}} = \sqrt{\frac{a}{b}} \quad (a, b > 0)`, html: R`Tiada hukum serupa untuk tambah atau tolak.` },
      { tex: R`(\sqrt{a} + \sqrt{b})(\sqrt{a} - \sqrt{b}) = a - b`, html: R`Asas penisbahan menggunakan surd konjugat.` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['4.2.1'], question: R`Tukarkan \(3.45\dot{6} = 3.456666\ldots\) kepada pecahan.`, given: R`hanya digit 6 berulang`, find: R`pecahan`, method: R`Darab dengan 10 dan 100 supaya bahagian berulang sejajar.`,
        steps: [{ do: R`\(x = 3.45666\ldots\); \(100x = 345.666\ldots\); \(1000x = 3456.666\ldots\)` }, { do: R`\(1000x - 100x = 900x = 3111\)`, why: R`Kedua-dua nombor mempunyai bahagian ".666…" yang sama, jadi ia terbatal.` }, { do: R`\(x = \dfrac{3111}{900} = \dfrac{1037}{300}\)` }],
        check: R`\(1037 \div 300 = 3.456666\ldots\) ✓`, conclusion: R`\(\dfrac{1037}{300}\).` },
      { level: 'sederhana', sp: ['4.2.3'], question: R`Permudahkan \(\sqrt{18} - \sqrt{8} + \sqrt{50}\).`, given: R`tiga surd tak serupa`, find: R`bentuk termudah`, method: R`Keluarkan faktor kuasa dua sempurna supaya semua surd serupa.`,
        steps: [{ do: R`\(\sqrt{18} = 3\sqrt{2}\), \(\sqrt{8} = 2\sqrt{2}\), \(\sqrt{50} = 5\sqrt{2}\)` }, { do: R`\(3\sqrt{2} - 2\sqrt{2} + 5\sqrt{2} = 6\sqrt{2}\)` }],
        check: R`\(4.243 - 2.828 + 7.071 = 8.485\) dan \(6\sqrt{2} = 8.485\) ✓`, conclusion: R`\(6\sqrt{2}\).` },
      { level: 'sederhana', sp: ['4.2.2', '4.2.3'], question: R`Permudahkan \(\sqrt{2} \times \sqrt{3} + \sqrt{6}\) dan \(\dfrac{\sqrt{18}}{3}\).`, given: R`dua ungkapan`, find: R`bentuk termudah`, method: R`Hukum pendaraban, kemudian surd serupa.`,
        steps: [{ do: R`\(\sqrt{2}\sqrt{3} = \sqrt{6}\), jadi \(\sqrt{6} + \sqrt{6} = 2\sqrt{6}\)` }, { do: R`\(\dfrac{\sqrt{18}}{3} = \dfrac{3\sqrt{2}}{3} = \sqrt{2}\)` }],
        check: R`\(2\sqrt{6} \approx 4.899\) dan \(1.414 \times 1.732 + 2.449 \approx 4.899\) ✓`, conclusion: R`\(2\sqrt{6}\) dan \(\sqrt{2}\).` },
      { level: 'mencabar', sp: ['4.2.4'], question: R`Nisbahkan penyebut: \(\dfrac{3\sqrt{20}}{6 - \sqrt{5}}\).`, given: R`penyebut \(6 - \sqrt{5}\)`, find: R`bentuk tanpa surd di penyebut`, method: R`Darab dengan konjugat \(6 + \sqrt{5}\).`,
        steps: [{ do: R`\(3\sqrt{20} = 6\sqrt{5}\)` }, { do: R`\(\dfrac{6\sqrt{5}(6 + \sqrt{5})}{(6 - \sqrt{5})(6 + \sqrt{5})} = \dfrac{36\sqrt{5} + 30}{36 - 5}\)`, why: R`\(6\sqrt{5} \times \sqrt{5} = 6 \times 5 = 30\), dan penyebut menjadi \(6^2 - (\sqrt{5})^2\).` }, { do: R`\(= \dfrac{36\sqrt{5} + 30}{31}\)` }],
        check: R`Kedua-dua bentuk \(\approx 3.564\) ✓`, conclusion: R`\(\dfrac{30 + 36\sqrt{5}}{31}\).` },
      { level: 'mencabar', sp: ['4.2.5'], question: R`Sebuah segi empat tepat mempunyai sisi \((3 + \sqrt{2})\) cm dan \((3 - \sqrt{2})\) cm. Cari luas dan panjang pepenjurunya dalam bentuk surd.`, given: R`sisi dalam bentuk surd`, find: R`luas; pepenjuru`, method: R`Luas = darab sisi; pepenjuru = Pythagoras.`,
        steps: [{ do: R`Luas \(= (3 + \sqrt{2})(3 - \sqrt{2}) = 9 - 2 = 7\) cm²`, why: R`Bentuk \((p + q)(p - q)\).` }, { do: R`Pepenjuru\(^2 = (3 + \sqrt{2})^2 + (3 - \sqrt{2})^2 = (11 + 6\sqrt{2}) + (11 - 6\sqrt{2}) = 22\)` }, { do: R`Pepenjuru \(= \sqrt{22}\) cm` }],
        check: R`\(4.414 \times 1.586 \approx 7.00\) ✓`, conclusion: R`Luas 7 cm², pepenjuru \(\sqrt{22}\) cm.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(\sqrt{9 + 16} = \sqrt{9} + \sqrt{16} = 7\)`, why: R`Punca kuasa dua tidak boleh "dipecahkan" melalui tambah.`, fix: R`\(\sqrt{25} = 5\).` },
      { wrong: R`\(\sqrt{2} + \sqrt{3} = \sqrt{5}\)`, why: R`Surd tak serupa tidak boleh digabungkan.`, fix: R`Biarkan sebagai \(\sqrt{2} + \sqrt{3}\).` },
      { wrong: R`Menisbahkan \(\dfrac{3}{\sqrt{2} + \sqrt{5}}\) dengan mendarab \(\sqrt{2} + \sqrt{5}\).`, why: R`\((\sqrt{2} + \sqrt{5})^2 = 7 + 2\sqrt{10}\) masih mengandungi surd.`, fix: R`Darab dengan konjugat \(\sqrt{5} - \sqrt{2}\).` },
      { wrong: R`\(\sqrt{9}\) ialah surd.`, why: R`\(\sqrt{9} = 3\) ialah nombor nisbah.`, fix: R`Surd mesti nombor tak nisbah.` },
    ] },
    { kind: 'summary', points: [R`Surd ialah punca yang tak nisbah; tidak semua punca ialah surd.`, R`\(\sqrt{a}\sqrt{b} = \sqrt{ab}\), \(\tfrac{\sqrt{a}}{\sqrt{b}} = \sqrt{\tfrac{a}{b}}\); tiada hukum untuk tambah.`, R`Permudahkan dengan mengeluarkan kuasa dua sempurna; gabungkan surd serupa sahaja.`, R`Nisbahkan penyebut dengan \(\sqrt{a}\) atau dengan surd konjugat.`] },
    { kind: 'next', html: R`<p>Surd ialah indeks pecahan. Dalam <strong>4.3</strong>, kita bertanya soalan sebaliknya: diberi \(a^x = N\), apakah \(x\)? Jawapannya ialah logaritma.</p>`, links: [{ href: '#/nota/t4-4/4.3', label: '4.3 Hukum Logaritma →' }] },
  ],
};

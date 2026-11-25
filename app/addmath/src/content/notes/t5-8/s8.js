// T5 Bab 8 Kinematik Gerakan Linear (SP 8.1.1–8.4.1). Original.
// DSKP (PDF 146–148, printed pp. 132–134; the 8.2.1 diagram was read from the
// rendered page): number lines and graph sketches throughout; stress the symbols
// s, v, a, t, the relationships between them, scalar vs vector, distance vs
// displacement, speed vs velocity, and the meaning of positive / negative / zero
// s, v and a. 8.1.2: displacement functions LIMITED TO LINEAR AND QUADRATIC.
// 8.2.1: v = ds/dt, a = dv/dt = d²s/dt², s = ∫v dt, v = ∫a dt; graph interpretation.
// 8.2.2: maximum displacement, initial velocity, constant velocity. 8.2.3: maximum /
// minimum velocity, constant acceleration. 8.3.2: total distance must be included.
// Every number was re-derived numerically (tests/triangle.mjs kinState, pathLength).
const R = String.raw;
const s1 = (t) => t * t - 6 * t + 5;                 // 8.1 running example
const s2 = (t) => t ** 3 - 6 * t ** 2 + 9 * t, v2 = (t) => 3 * t * t - 12 * t + 9, a2 = (t) => 6 * t - 12; // 8.2
const v3 = (t) => t * t - 4 * t + 3, s3 = (t) => t ** 3 / 3 - 2 * t * t + 3 * t; // 8.3
const sP = (t) => t * t - 4 * t, sQ = (t) => 2 * t;  // 8.4
const r3 = (x) => Math.round(x * 1000) / 1000; // readouts: 3 d.p.
const side = (s, fmt) => (Math.abs(s) < 1e-9 ? 'di \\(O\\)' : `${fmt(r3(Math.abs(s)))} m di ${s > 0 ? 'kanan' : 'kiri'} \\(O\\)`);
const dir = (v) => (Math.abs(v) < 1e-9 ? 'pegun seketika' : v > 0 ? 'bergerak ke kanan' : 'bergerak ke kiri');

// ---------------------------------------------------------------- 8.1
export const S8_1 = {
  id: '8.1', sk: '8.1', title: 'Sesaran, Halaju dan Pecutan sebagai Fungsi Masa', sp: ['8.1.1', '8.1.2'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Zarah di atas garis lurus', html: R`<p>Sebuah kereta api bergerak di landasan lurus, kadang-kadang ke hadapan, kadang-kadang berundur. Untuk menghuraikan gerakannya, kita bayangkan satu <strong>zarah</strong> (objek bersaiz titik) yang bergerak di atas <strong>garis nombor</strong>, dengan titik tetap \(O\) sebagai rujukan dan arah ke kanan sebagai positif.</p>` },
    { kind: 'concept', title: 'Sesaran, halaju dan pecutan', sp: ['8.1.1'], html: R`
      <ul>
        <li>\(t\): <strong>masa</strong> (saat) sejak gerakan bermula.</li>
        <li>\(s\): <strong>sesaran</strong> (m), iaitu kedudukan zarah dari \(O\), dengan arah.</li>
        <li>\(v\): <strong>halaju</strong> (\(\text{m s}^{-1}\)), iaitu kadar perubahan sesaran terhadap masa.</li>
        <li>\(a\): <strong>pecutan</strong> (\(\text{m s}^{-2}\)), iaitu kadar perubahan halaju terhadap masa.</li>
      </ul>
      <p>Sesaran, halaju dan pecutan ialah <strong>kuantiti vektor</strong> (ada magnitud dan arah; tanda \(+\) atau \(-\) menunjukkan arah). <strong>Jarak</strong> dan <strong>laju</strong> ialah <strong>kuantiti skalar</strong> (magnitud sahaja). Contohnya, halaju \(-4\ \text{m s}^{-1}\) bermaksud laju 4 m s⁻¹ ke arah kiri.</p>
      <p>Nilai pada satu saat tertentu dipanggil nilai <strong>seketika</strong>: gantikan \(t\) ke dalam fungsi \(s(t)\), \(v(t)\) atau \(a(t)\).</p>` },
    { kind: 'concept', title: 'Maksud tanda positif, negatif dan sifar', sp: ['8.1.1'], html: R`
      <table class="mini-table"><thead><tr><th></th><th>Positif</th><th>Sifar</th><th>Negatif</th></tr></thead><tbody>
        <tr><td>\(s\)</td><td>di kanan \(O\)</td><td>di \(O\)</td><td>di kiri \(O\)</td></tr>
        <tr><td>\(v\)</td><td>bergerak ke kanan</td><td>pegun seketika (mungkin bertukar arah)</td><td>bergerak ke kiri</td></tr>
        <tr><td>\(a\)</td><td>halaju bertambah</td><td>halaju malar (seketika)</td><td>halaju berkurang</td></tr>
      </tbody></table>
      <p>Perhatikan: pecutan negatif tidak semestinya bermaksud zarah semakin perlahan. Jika \(v < 0\) dan \(a < 0\), halaju semakin negatif, jadi <em>laju</em> bertambah ke arah kiri.</p>` },
    { kind: 'concept', title: 'Jumlah jarak yang dilalui', sp: ['8.1.2'], html: R`
      <p>Jarak ialah panjang laluan sebenar. Jika zarah bertukar arah dalam suatu tempoh, sesaran sahaja tidak mencukupi: kira jarak bagi setiap bahagian dan tambah.</p>
      <ol>
        <li>Cari masa zarah bertukar arah. Bagi \(s = at^2 + bt + c\), ini berlaku di bucu graf \(s\) (penyempurnaan kuasa dua, atau \(t = -\tfrac{b}{2a}\)). Fungsi linear tidak bertukar arah.</li>
        <li>Kira \(s\) pada masa mula, masa bertukar arah dan masa akhir.</li>
        <li>Jumlah jarak \(= |s(t_1) - s(t_0)| + |s(t_2) - s(t_1)|\).</li>
      </ol>
      <p>Dalam subtopik ini, fungsi sesaran dihadkan kepada fungsi linear dan kuadratik.</p>` },
    { kind: 'visual', title: 'Graf sesaran–masa dan garis nombor', html: R`<p>\(s = t^2 - 6t + 5\). Gerakkan \(t\): titik pada graf menunjukkan sesaran; bacaan di bawah memberi kedudukan pada garis nombor.</p>`,
      spec: { type: 'plot', x: [-0.3, 6.3], y: [-5, 6], xLabel: 't (s)', yLabel: 's (m)', params: [{ name: 't', label: R`\(t\)`, min: 0, max: 6, step: 0.25, value: 2 }], vline: 't',
        curves: [{ f: (t) => s1(t), label: 's = t² − 6t + 5', domain: [0, 6] }],
        points: [{ at: (p) => [p.t, s1(p.t)], label: '' }, { at: () => [3, -4], label: '(3, −4)' }],
        readout: (p, { fmt }) => R`\(t = ${fmt(p.t)}\): \(s = ${fmt(r3(s1(p.t)))}\) m, iaitu ${side(s1(p.t), fmt)}; zarah ${dir(2 * p.t - 6)}.` },
      alt: R`Graf parabola s = t² − 6t + 5 bagi 0 ≤ t ≤ 6. Ia bermula pada s = 5 apabila t = 0, menurun melalui s = 0 pada t = 1, mencapai nilai terendah s = −4 pada t = 3, kemudian naik semula melalui s = 0 pada t = 5 dan sampai s = 5 pada t = 6. Zarah bergerak ke kiri bagi t < 3, pegun seketika pada t = 3, dan bergerak ke kanan bagi t > 3.` },
    { kind: 'formula', items: [{ tex: R`s,\ v,\ a:\ \text{vektor} \qquad \text{jarak, laju: skalar}`, html: R`Tanda menunjukkan arah (kanan positif).` }, { tex: R`\text{jumlah jarak} = |s(t_1) - s(t_0)| + |s(t_2) - s(t_1)|`, html: R`\(t_1\) ialah masa zarah bertukar arah.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.1.1'], question: R`Sesaran zarah dari \(O\) ialah \(s = t^2 - 6t + 5\) m. Cari (a) sesaran awal, (b) sesaran pada \(t = 2\), dan (c) masa zarah berada di \(O\).`, given: R`\(s(t)\)`, find: R`\(s(0)\), \(s(2)\), \(t\) apabila \(s = 0\)`, method: R`Gantikan \(t\); selesaikan \(s = 0\).`, steps: [{ do: R`(a) \(s(0) = 5\): 5 m di kanan \(O\)` }, { do: R`(b) \(s(2) = 4 - 12 + 5 = -3\): 3 m di kiri \(O\)`, why: R`Tanda negatif bermaksud kiri \(O\), bukan "jarak negatif".` }, { do: R`(c) \(t^2 - 6t + 5 = 0 \Rightarrow (t - 1)(t - 5) = 0\), jadi \(t = 1\) atau \(t = 5\)` }], check: R`Visual: graf memotong paksi-\(t\) pada 1 dan 5 ✓`, conclusion: R`5 m di kanan \(O\); 3 m di kiri \(O\); di \(O\) pada \(t = 1\) s dan \(t = 5\) s.` },
      { level: 'mudah', sp: ['8.1.1'], question: R`Halaju zarah ialah \(v = 12 - 3t\ \text{m s}^{-1}\). Huraikan gerakan pada \(t = 0\), \(t = 4\) dan \(t = 6\), dan nyatakan pecutannya.`, given: R`\(v(t)\)`, find: R`maksud \(v\) seketika`, method: R`Gantikan \(t\), tafsir tanda.`, steps: [{ do: R`\(v(0) = 12\): bergerak ke kanan dengan laju 12 m s⁻¹` }, { do: R`\(v(4) = 0\): pegun seketika` }, { do: R`\(v(6) = -6\): bergerak ke kiri dengan laju 6 m s⁻¹` }, { do: R`Halaju berkurang 3 m s⁻¹ setiap saat, jadi \(a = -3\ \text{m s}^{-2}\) (malar)`, why: R`Pecutan ialah kadar perubahan halaju.` }], check: R`Antara \(t = 4\) dan \(t = 6\), halaju berubah \(0 \to -6\): \(-3\) setiap saat ✓`, conclusion: R`Kanan, pegun seketika, kiri; \(a = -3\ \text{m s}^{-2}\).` },
      { level: 'sederhana', sp: ['8.1.2'], question: R`Bagi \(s = t^2 - 6t + 5\), cari jumlah jarak yang dilalui dalam 6 saat pertama.`, given: R`\(s(t)\) kuadratik`, find: R`jumlah jarak, \(0 \le t \le 6\)`, method: R`Cari masa bertukar arah di bucu graf.`, steps: [{ do: R`\(s = (t - 3)^2 - 4\): bucu \((3, -4)\), jadi zarah bertukar arah pada \(t = 3\)` }, { do: R`\(s(0) = 5\), \(s(3) = -4\), \(s(6) = 5\)` }, { do: R`Jarak \(= |-4 - 5| + |5 - (-4)| = 9 + 9 = 18\)` }], check: R`Sesaran bersih \(s(6) - s(0) = 0\): zarah kembali ke kedudukan asal, tetapi telah bergerak 18 m ✓`, conclusion: R`18 m.` },
      { level: 'sederhana', sp: ['8.1.2'], question: R`Sesaran zarah ialah \(s = 20 - 4t\) m. Cari masa zarah melalui \(O\) dan jumlah jarak dalam 8 saat pertama.`, given: R`\(s(t)\) linear`, find: R`\(t\) di \(O\); jarak`, method: R`Fungsi linear tidak bertukar arah.`, steps: [{ do: R`\(20 - 4t = 0 \Rightarrow t = 5\)` }, { do: R`\(s(0) = 20\), \(s(8) = -12\)` }, { do: R`Jarak \(= |-12 - 20| = 32\)`, why: R`Halaju sentiasa \(-4\ \text{m s}^{-1}\), jadi zarah sentiasa bergerak ke kiri.` }], check: R`8 s pada laju 4 m s⁻¹ \(= 32\) m ✓`, conclusion: R`Melalui \(O\) pada \(t = 5\) s; 32 m.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Jumlah jarak \(= |s(6) - s(0)| = 0\) bagi \(s = t^2 - 6t + 5\).`, why: R`Itu sesaran bersih. Zarah bertukar arah pada \(t = 3\).`, fix: R`Pecahkan pada masa bertukar arah: \(9 + 9 = 18\) m.` },
      { wrong: R`\(s = -3\) bermaksud jarak \(-3\) m.`, why: R`Jarak tidak negatif; tanda menunjukkan arah.`, fix: R`3 m di kiri \(O\).` },
      { wrong: R`Pecutan negatif sentiasa bermaksud zarah semakin perlahan.`, why: R`Jika \(v\) juga negatif, laju bertambah ke kiri.`, fix: R`Bandingkan tanda \(v\) dan \(a\): sama tanda, laju bertambah; berlainan tanda, laju berkurang.` },
    ] },
    { kind: 'summary', points: [R`\(s\), \(v\), \(a\) ialah vektor (tanda = arah); jarak dan laju ialah skalar.`, R`Nilai seketika: gantikan \(t\).`, R`Jumlah jarak: pecahkan pada masa bertukar arah, tambah nilai mutlak.`] },
    { kind: 'next', html: R`<p>Bagaimana mencari halaju terus daripada fungsi sesaran? Seterusnya, <strong>8.2 Pembezaan dalam Kinematik</strong>.</p>`, links: [{ href: '#/nota/t5-8/8.2', label: '8.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 8.2
export const S8_2 = {
  id: '8.2', sk: '8.2', title: 'Pembezaan dalam Kinematik Gerakan Linear', sp: ['8.2.1', '8.2.2', '8.2.3'], status: 'published', minutes: 70,
  sections: [
    { kind: 'intro', title: 'Kadar perubahan sesaran', html: R`<p>Halaju ialah kadar perubahan sesaran, dan pecutan ialah kadar perubahan halaju. Dalam Bab 2, kadar perubahan ialah terbitan. Jadi pembezaan menghubungkan ketiga-tiga fungsi gerakan.</p>` },
    { kind: 'concept', title: 'Hubungan antara s, v dan a', sp: ['8.2.1'], html: R`
      \[s = f(t) \;\xrightarrow{\;\frac{d}{dt}\;}\; v = \frac{ds}{dt} \;\xrightarrow{\;\frac{d}{dt}\;}\; a = \frac{dv}{dt} = \frac{d^2s}{dt^2}\]
      \[a \;\xrightarrow{\;\int dt\;}\; v = \int a\,dt \;\xrightarrow{\;\int dt\;}\; s = \int v\,dt\]
      <p>Pembezaan bergerak ke kanan (\(s \to v \to a\)); pengamiran bergerak ke kiri (\(a \to v \to s\)).</p>
      <p><strong>Tafsiran graf:</strong> kecerunan graf \(s\)–\(t\) ialah halaju; kecerunan graf \(v\)–\(t\) ialah pecutan. Titik pusingan graf \(s\) berlaku apabila \(v = 0\); titik pusingan graf \(v\) berlaku apabila \(a = 0\).</p>` },
    { kind: 'concept', title: 'Halaju daripada sesaran', sp: ['8.2.2'], html: R`
      <ul>
        <li><strong>Halaju awal:</strong> \(v\) pada \(t = 0\).</li>
        <li><strong>Pegun seketika:</strong> selesaikan \(v = 0\).</li>
        <li><strong>Sesaran maksimum:</strong> apabila \(v = 0\) dan \(a < 0\) (zarah berhenti bergerak ke kanan dan mula berpatah balik).</li>
        <li><strong>Halaju malar:</strong> jika \(s\) linear, contohnya \(s = 5t - 2\), maka \(v = 5\) sentiasa dan \(a = 0\).</li>
      </ul>` },
    { kind: 'concept', title: 'Pecutan daripada halaju dan sesaran', sp: ['8.2.3'], html: R`
      <ul>
        <li><strong>Pecutan seketika:</strong> \(a = \tfrac{dv}{dt}\) atau \(\tfrac{d^2s}{dt^2}\), kemudian gantikan \(t\).</li>
        <li><strong>Halaju maksimum atau minimum:</strong> apabila \(a = 0\); tentukan jenisnya dengan tanda \(a\) sebelum dan selepas (atau \(\tfrac{da}{dt}\)).</li>
        <li><strong>Pecutan malar:</strong> jika \(v\) linear (iaitu \(s\) kuadratik), \(a\) ialah pemalar.</li>
      </ul>` },
    { kind: 'visual', title: 'Graf s, v dan a', html: R`<p>\(s = t^3 - 6t^2 + 9t\) (biru), \(v = 3t^2 - 12t + 9\) (merah), \(a = 6t - 12\) (hijau). Gerakkan \(t\) dan perhatikan: apabila \(v = 0\), graf \(s\) mempunyai titik pusingan.</p>`,
      spec: { type: 'plot', x: [-0.2, 4.5], y: [-13, 17], gridY: 2, labelStepY: 4, xLabel: 't (s)', params: [{ name: 't', label: R`\(t\)`, min: 0, max: 4.5, step: 0.25, value: 1 }], vline: 't',
        curves: [{ f: (t) => s2(t), label: 's', domain: [0, 4.5] }, { f: (t) => v2(t), label: 'v', color: '#D9534F', domain: [0, 4.5] }, { f: (t) => a2(t), label: 'a', color: '#2E9E6B', domain: [0, 4.5] }],
        readout: (p, { fmt }) => R`\(t = ${fmt(p.t)}\): \(s = ${fmt(r3(s2(p.t)))}\), \(v = ${fmt(r3(v2(p.t)))}\), \(a = ${fmt(r3(a2(p.t)))}\). Zarah ${dir(v2(p.t))}${Math.abs(v2(p.t)) > 1e-9 && Math.abs(a2(p.t)) > 1e-9 ? (v2(p.t) * a2(p.t) > 0 ? ', laju bertambah' : ', laju berkurang') : ''}.` },
      alt: R`Tiga graf bagi 0 ≤ t ≤ 4.5. Graf sesaran s = t³ − 6t² + 9t naik ke titik maksimum (1, 4), turun ke titik minimum (3, 0), kemudian naik semula. Graf halaju v = 3t² − 12t + 9 ialah parabola yang memotong paksi-t pada t = 1 dan t = 3, dengan nilai terendah −3 pada t = 2. Graf pecutan a = 6t − 12 ialah garis lurus yang memotong paksi-t pada t = 2. Pada setiap titik pusingan graf s, nilai v ialah sifar; pada titik pusingan graf v, nilai a ialah sifar.` },
    { kind: 'formula', items: [{ tex: R`v = \frac{ds}{dt}, \qquad a = \frac{dv}{dt} = \frac{d^2s}{dt^2}`, html: R`Bezakan untuk bergerak dari \(s\) ke \(v\) ke \(a\).` }, { tex: R`v = 0 \Rightarrow s \text{ maks/min}; \qquad a = 0 \Rightarrow v \text{ maks/min}`, html: R`Halaju awal: \(t = 0\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.2.1', '8.2.2'], question: R`Sesaran zarah ialah \(s = t^3 - 6t^2 + 9t\) m. Cari \(v\) dan \(a\), halaju awal, dan masa zarah pegun seketika.`, given: R`\(s(t)\)`, find: R`\(v\), \(a\), \(v(0)\), \(t\) apabila \(v = 0\)`, method: R`Bezakan dua kali.`, steps: [{ do: R`\(v = \tfrac{ds}{dt} = 3t^2 - 12t + 9\)` }, { do: R`\(a = \tfrac{dv}{dt} = 6t - 12\)` }, { do: R`\(v(0) = 9\ \text{m s}^{-1}\)` }, { do: R`\(3t^2 - 12t + 9 = 0 \Rightarrow 3(t - 1)(t - 3) = 0\), jadi \(t = 1\) atau \(t = 3\)` }], check: R`Visual: graf \(s\) mempunyai titik pusingan pada \(t = 1\) dan \(t = 3\) ✓`, conclusion: R`\(v = 3t^2 - 12t + 9\), \(a = 6t - 12\); halaju awal 9 m s⁻¹; pegun seketika pada \(t = 1\) s dan \(t = 3\) s.` },
      { level: 'sederhana', sp: ['8.2.2'], question: R`Sesaran zarah ialah \(s = 8t - t^2\) m. Cari sesaran maksimum zarah dari \(O\).`, given: R`\(s(t)\)`, find: R`\(s_{\text{maks}}\)`, method: R`\(v = 0\), kemudian semak tanda \(a\).`, steps: [{ do: R`\(v = 8 - 2t = 0 \Rightarrow t = 4\)` }, { do: R`\(a = -2 < 0\): maksimum`, why: R`Zarah bergerak ke kanan sebelum \(t = 4\) dan ke kiri selepas itu.` }, { do: R`\(s(4) = 32 - 16 = 16\)` }], check: R`\(s = 16 - (t - 4)^2 \le 16\) ✓`, conclusion: R`16 m di kanan \(O\), pada \(t = 4\) s.` },
      { level: 'sederhana', sp: ['8.2.3'], question: R`Halaju zarah ialah \(v = t^2 - 4t + 3\ \text{m s}^{-1}\). Cari halaju minimum dan tafsirkan.`, given: R`\(v(t)\)`, find: R`\(v_{\text{min}}\)`, method: R`\(a = 0\).`, steps: [{ do: R`\(a = 2t - 4 = 0 \Rightarrow t = 2\)` }, { do: R`\(a < 0\) bagi \(t < 2\) dan \(a > 0\) bagi \(t > 2\): minimum` }, { do: R`\(v(2) = 4 - 8 + 3 = -1\)` }], check: R`\(v = (t - 2)^2 - 1 \ge -1\) ✓`, conclusion: R`\(-1\ \text{m s}^{-1}\) pada \(t = 2\): ketika itu zarah bergerak ke kiri dengan laju 1 m s⁻¹.` },
      { level: 'mudah', sp: ['8.2.2', '8.2.3'], question: R`Sesaran zarah ialah \(s = 5t - 2\) m. Huraikan gerakannya.`, given: R`\(s\) linear`, find: R`\(v\), \(a\), kedudukan awal`, method: R`Bezakan.`, steps: [{ do: R`\(v = 5\): halaju malar 5 m s⁻¹ ke kanan` }, { do: R`\(a = 0\): tiada pecutan` }, { do: R`\(s(0) = -2\): bermula 2 m di kiri \(O\)` }], check: R`Graf \(s\)–\(t\) ialah garis lurus dengan kecerunan 5 ✓`, conclusion: R`Bermula 2 m di kiri \(O\), bergerak ke kanan pada halaju malar 5 m s⁻¹.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Halaju awal \(= s(0)\).`, why: R`\(s(0)\) ialah kedudukan awal.`, fix: R`Halaju awal \(= v(0)\).` },
      { wrong: R`Halaju maksimum apabila \(v = 0\).`, why: R`\(v = 0\) memberi sesaran maksimum/minimum.`, fix: R`Halaju maksimum/minimum apabila \(a = 0\).` },
      { wrong: R`\(a = \left(\tfrac{ds}{dt}\right)^2\).`, why: R`Pecutan ialah terbitan kedua, bukan kuasa dua.`, fix: R`\(a = \tfrac{d^2s}{dt^2}\).` },
    ] },
    { kind: 'summary', points: [R`\(v = \tfrac{ds}{dt}\), \(a = \tfrac{dv}{dt} = \tfrac{d^2s}{dt^2}\).`, R`Halaju awal \(v(0)\); pegun seketika \(v = 0\); sesaran maksimum: \(v = 0\), \(a < 0\).`, R`Halaju maksimum/minimum: \(a = 0\); \(s\) linear: halaju malar; \(v\) linear: pecutan malar.`] },
    { kind: 'next', html: R`<p>Jika hanya pecutan diketahui, bagaimana mendapat halaju dan sesaran? Seterusnya, <strong>8.3 Pengamiran dalam Kinematik</strong>.</p>`, links: [{ href: '#/nota/t5-8/8.3', label: '8.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 8.3
export const S8_3 = {
  id: '8.3', sk: '8.3', title: 'Pengamiran dalam Kinematik Gerakan Linear', sp: ['8.3.1', '8.3.2'], status: 'published', minutes: 70,
  sections: [
    { kind: 'intro', title: 'Membalikkan pembezaan', html: R`<p>Meter laju kereta memberi halaju, bukan kedudukan. Untuk mengetahui sejauh mana kereta bergerak, kita "menjumlahkan" halaju sepanjang masa, iaitu <strong>mengamir</strong>.</p>` },
    { kind: 'concept', title: 'Halaju daripada pecutan', sp: ['8.3.1'], html: R`
      <p>\(v = \int a\,dt\). Kamiran tak tentu memberi pemalar \(c\); cari \(c\) dengan syarat awal, biasanya <strong>halaju awal</strong> (\(v\) pada \(t = 0\)). "Bermula dari keadaan rehat" bermaksud \(v = 0\) apabila \(t = 0\).</p>
      <p>Contoh: \(a = 6 - 2t\) dan bermula dari rehat: \(v = 6t - t^2 + c\), \(c = 0\).</p>` },
    { kind: 'concept', title: 'Sesaran dan jumlah jarak daripada halaju', sp: ['8.3.2'], html: R`
      <p>\(s = \int v\,dt\); cari \(c\) dengan kedudukan awal (bermula dari \(O\): \(s = 0\) apabila \(t = 0\)). Jika bermula dengan pecutan, amir dua kali dengan dua syarat awal.</p>
      <p>Kamiran tentu \(\int_{t_1}^{t_2} v\,dt\) ialah <strong>perubahan sesaran</strong> (luas bertanda di bawah graf \(v\)–\(t\)).</p>
      <p><strong>Jumlah jarak</strong>: cari masa \(v = 0\) dalam tempoh itu, pecahkan kamiran, dan tambah nilai mutlak setiap bahagian:</p>
      \[\text{jarak} = \left|\int_{t_0}^{t_1} v\,dt\right| + \left|\int_{t_1}^{t_2} v\,dt\right|\]` },
    { kind: 'visual', title: 'Luas di bawah graf halaju–masa', html: R`<p>\(v = t^2 - 4t + 3\). Kawasan berlorek dari 0 hingga \(T\): luas di atas paksi menambah sesaran, luas di bawah paksi menolaknya.</p>`,
      spec: { type: 'plot', x: [-0.2, 4.2], y: [-1.5, 3.5], xLabel: 't (s)', yLabel: 'v (m/s)', params: [{ name: 'T', label: R`\(T\)`, min: 0, max: 4, step: 0.25, value: 3 }], vline: 'T',
        curves: [{ f: (t) => v3(t), label: 'v = t² − 4t + 3', domain: [0, 4] }],
        shade: { f: (t) => v3(t), from: () => 0, to: (p) => p.T },
        readout: (p, { fmt }) => { const T = p.T, d = T <= 1 ? s3(T) : T <= 3 ? 2 * s3(1) - s3(T) : 2 * s3(1) - 2 * s3(3) + s3(T); return R`\(T = ${fmt(T)}\): sesaran \(s = ${fmt(r3(s3(T)))}\) m; jumlah jarak \(= ${fmt(r3(d))}\) m.`; } },
      alt: R`Graf parabola v = t² − 4t + 3 bagi 0 ≤ t ≤ 4, memotong paksi-t pada t = 1 dan t = 3. Antara 0 dan 1 graf di atas paksi (luas 4/3); antara 1 dan 3 di bawah paksi (luas 4/3); antara 3 dan 4 di atas paksi (luas 4/3). Pada T = 3, sesaran ialah 4/3 − 4/3 = 0, tetapi jumlah jarak ialah 4/3 + 4/3 = 8/3 m.` },
    { kind: 'formula', items: [{ tex: R`v = \int a\,dt, \qquad s = \int v\,dt`, html: R`Cari \(c\) dengan syarat awal (\(v(0)\), \(s(0)\)).` }, { tex: R`\text{jarak} = \sum \left|\int v\,dt\right| \text{ (pecah pada } v = 0)`, html: R`\(\int_{t_1}^{t_2} v\,dt\) sahaja ialah perubahan sesaran.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['8.3.1'], question: R`Pecutan zarah ialah \(a = 6 - 2t\ \text{m s}^{-2}\) dan zarah bermula dari keadaan rehat. Cari \(v\) pada \(t = 2\) dan halaju maksimum.`, given: R`\(a(t)\), \(v(0) = 0\)`, find: R`\(v(2)\), \(v_{\text{maks}}\)`, method: R`Amir, guna syarat awal.`, steps: [{ do: R`\(v = \int (6 - 2t)\,dt = 6t - t^2 + c\); \(v(0) = 0 \Rightarrow c = 0\)` }, { do: R`\(v(2) = 12 - 4 = 8\)` }, { do: R`Maksimum apabila \(a = 0\): \(t = 3\), \(v(3) = 18 - 9 = 9\)` }], check: R`Bezakan semula: \(\tfrac{d}{dt}(6t - t^2) = 6 - 2t\) ✓`, conclusion: R`\(v(2) = 8\ \text{m s}^{-1}\); halaju maksimum 9 m s⁻¹ pada \(t = 3\).` },
      { level: 'sederhana', sp: ['8.3.2'], question: R`Halaju zarah yang bermula dari \(O\) ialah \(v = t^2 - 4t + 3\ \text{m s}^{-1}\). Cari sesarannya pada \(t = 3\).`, given: R`\(v(t)\), \(s(0) = 0\)`, find: R`\(s(3)\)`, method: R`Amir dan guna \(s(0) = 0\).`, steps: [{ do: R`\(s = \tfrac{t^3}{3} - 2t^2 + 3t + c\); \(c = 0\)` }, { do: R`\(s(3) = 9 - 18 + 9 = 0\)` }], check: R`\(\int_0^3 v\,dt = 0\): luas di atas dan di bawah paksi sama (visual) ✓`, conclusion: R`\(s = 0\): zarah kembali ke \(O\) pada \(t = 3\).` },
      { level: 'mencabar', sp: ['8.3.2'], question: R`Bagi zarah yang sama, cari jumlah jarak yang dilalui dalam 3 saat pertama.`, given: R`\(v = t^2 - 4t + 3\)`, find: R`jumlah jarak, \(0 \le t \le 3\)`, method: R`Pecahkan pada \(v = 0\).`, steps: [{ do: R`\(v = (t - 1)(t - 3) = 0\): bertukar arah pada \(t = 1\)` }, { do: R`\(\int_0^1 v\,dt = s(1) - s(0) = \tfrac13 - 2 + 3 = \tfrac43\)` }, { do: R`\(\int_1^3 v\,dt = s(3) - s(1) = 0 - \tfrac43 = -\tfrac43\)` }, { do: R`Jarak \(= \tfrac43 + \tfrac43 = \tfrac83 \approx 2.667\)` }], check: R`Sesaran bersih 0 tetapi jarak \(\tfrac83\) m: zarah pergi \(\tfrac43\) m ke kanan dan kembali ✓`, conclusion: R`\(\tfrac83\) m \(\approx 2.667\) m.` },
      { level: 'mencabar', sp: ['8.3.1', '8.3.2'], question: R`Zarah bermula dari \(O\) dengan halaju \(5\ \text{m s}^{-1}\). Pecutannya \(a = 2t - 6\ \text{m s}^{-2}\). Cari sesarannya pada \(t = 3\).`, given: R`\(a(t)\), \(v(0) = 5\), \(s(0) = 0\)`, find: R`\(s(3)\)`, method: R`Amir dua kali.`, steps: [{ do: R`\(v = t^2 - 6t + c_1\); \(v(0) = 5 \Rightarrow c_1 = 5\)` }, { do: R`\(s = \tfrac{t^3}{3} - 3t^2 + 5t + c_2\); \(s(0) = 0 \Rightarrow c_2 = 0\)` }, { do: R`\(s(3) = 9 - 27 + 15 = -3\)` }], check: R`\(v = (t - 1)(t - 5)\): ke kanan hingga \(t = 1\), kemudian ke kiri; \(s(1) = \tfrac73 > 0\) lalu menurun ke \(-3\) ✓`, conclusion: R`3 m di kiri \(O\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(v = \int a\,dt\) tanpa \(+ c\).`, why: R`Halaju awal hilang; jawapan hanya betul jika bermula dari rehat.`, fix: R`Tambah \(c\) dan guna \(v(0)\).` },
      { wrong: R`Jumlah jarak \(= \int_0^3 v\,dt\).`, why: R`Bahagian di bawah paksi (bergerak ke kiri) membatalkan bahagian di atas.`, fix: R`Pecahkan pada \(v = 0\) dan tambah nilai mutlak.` },
      { wrong: R`Menggunakan \(v(0) = 0\) walaupun zarah "dilancarkan dengan halaju 5 m s⁻¹".`, why: R`Hanya "bermula dari rehat" memberi \(v(0) = 0\).`, fix: R`Baca syarat awal dengan teliti.` },
    ] },
    { kind: 'summary', points: [R`\(v = \int a\,dt\), \(s = \int v\,dt\); setiap kamiran perlukan satu syarat awal.`, R`\(\int_{t_1}^{t_2} v\,dt\) = perubahan sesaran (luas bertanda).`, R`Jumlah jarak: pecahkan pada \(v = 0\), tambah nilai mutlak.`] },
    { kind: 'next', html: R`<p>Seterusnya, gabungkan pembezaan dan pengamiran untuk masalah sebenar: <strong>8.4 Aplikasi</strong>.</p>`, links: [{ href: '#/nota/t5-8/8.4', label: '8.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 8.4
export const S8_4 = {
  id: '8.4', sk: '8.4', title: 'Aplikasi Kinematik Gerakan Linear', sp: ['8.4.1'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Brek, pertemuan dan perjalanan pergi balik', html: R`<p>Jarak brek kereta, masa dua objek bertemu, dan jarak sebenar yang dilalui oleh lif atau bola semuanya diselesaikan dengan alat yang sama: bezakan untuk mendapat kadar, amir untuk mendapat jumlah.</p>` },
    { kind: 'concept', title: 'Strategi penyelesaian', sp: ['8.4.1'], html: R`
      <ol>
        <li>Kenal pasti fungsi yang diberi (\(s\), \(v\) atau \(a\)) dan syarat awal.</li>
        <li>Terjemah soalan: "berhenti / pegun seketika" \(v = 0\); "kembali ke \(O\)" \(s = 0\); "bertemu" \(s_P = s_Q\); "halaju maksimum" \(a = 0\); "sesaran maksimum" \(v = 0\).</li>
        <li>Bezakan atau amir mengikut keperluan; jangan lupa \(+ c\).</li>
        <li>Untuk jarak, semak sama ada zarah bertukar arah dalam tempoh itu.</li>
        <li>"Dalam saat ke-\(n\)" bermaksud dari \(t = n - 1\) hingga \(t = n\).</li>
      </ol>` },
    { kind: 'visual', title: 'Dua zarah pada garis yang sama', html: R`<p>Zarah \(P\): \(s_P = t^2 - 4t\) (biru); zarah \(Q\): \(s_Q = 2t\) (merah). Kedua-duanya bermula dari \(O\). Gerakkan \(t\) dan cari bila mereka bertemu semula.</p>`,
      spec: { type: 'plot', x: [-0.3, 7.3], y: [-6, 22], gridY: 2, labelStepY: 4, xLabel: 't (s)', yLabel: 's (m)', params: [{ name: 't', label: R`\(t\)`, min: 0, max: 7, step: 0.5, value: 3 }], vline: 't',
        curves: [{ f: (t) => sP(t), label: 'P', domain: [0, 7] }, { f: (t) => sQ(t), label: 'Q', color: '#D9534F', domain: [0, 7] }],
        points: [{ at: () => [6, 12], label: '(6, 12)' }],
        readout: (p, { fmt }) => R`\(t = ${fmt(p.t)}\): \(s_P = ${fmt(sP(p.t))}\), \(s_Q = ${fmt(sQ(p.t))}\); jarak antara mereka \(${fmt(Math.abs(sP(p.t) - sQ(p.t)))}\) m${Math.abs(sP(p.t) - sQ(p.t)) < 1e-9 && p.t > 0 ? ': bertemu!' : '.'}` },
      alt: R`Graf sesaran–masa bagi dua zarah. P mengikut parabola s = t² − 4t: ia ke kiri O dahulu (paling jauh 4 m di kiri pada t = 2), kembali ke O pada t = 4, kemudian bergerak ke kanan semakin laju. Q mengikut garis lurus s = 2t. Kedua-dua graf bermula di asalan dan bersilang semula di (6, 12): zarah bertemu pada t = 6 s, 12 m di kanan O.` },
    { kind: 'formula', items: [{ tex: R`v = 0:\ \text{berhenti}, \quad s = 0:\ \text{di } O, \quad s_P = s_Q:\ \text{bertemu}`, html: R`Saat ke-\(n\): \(n - 1 \le t \le n\).` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['8.4.1'], question: R`Sebuah kereta mula membrek apabila \(t = 0\). Halajunya \(v = 20 - 4t\ \text{m s}^{-1}\). Cari masa untuk berhenti dan jarak brek.`, given: R`\(v(t)\)`, find: R`\(t\) apabila \(v = 0\); jarak`, method: R`\(v = 0\), kemudian amir.`, steps: [{ do: R`\(20 - 4t = 0 \Rightarrow t = 5\)` }, { do: R`Jarak \(= \int_0^5 (20 - 4t)\,dt = \big[20t - 2t^2\big]_0^5 = 100 - 50 = 50\)`, why: R`\(v \ge 0\) sepanjang \(0 \le t \le 5\), jadi tiada pertukaran arah.` }], check: R`Graf \(v\)–\(t\) ialah segi tiga dengan tapak 5 dan tinggi 20: luas \(\tfrac12(5)(20) = 50\) ✓`, conclusion: R`Berhenti selepas 5 s; jarak brek 50 m.` },
      { level: 'sederhana', sp: ['8.4.1'], question: R`Zarah \(P\) dan \(Q\) bermula dari \(O\) serentak, dengan \(s_P = t^2 - 4t\) dan \(s_Q = 2t\). Bilakah dan di manakah mereka bertemu semula?`, given: R`dua fungsi sesaran`, find: R`\(t > 0\) apabila \(s_P = s_Q\)`, method: R`Samakan sesaran.`, steps: [{ do: R`\(t^2 - 4t = 2t \Rightarrow t^2 - 6t = 0 \Rightarrow t(t - 6) = 0\)` }, { do: R`\(t = 6\) (\(t = 0\) ialah masa mula)` }, { do: R`\(s = 2(6) = 12\)` }], check: R`\(s_P(6) = 36 - 24 = 12\) ✓`, conclusion: R`Pada \(t = 6\) s, 12 m di kanan \(O\).` },
      { level: 'mencabar', sp: ['8.4.1'], question: R`Halaju zarah yang bermula dari \(O\) ialah \(v = 6t - 3t^2\ \text{m s}^{-1}\). Cari (a) jumlah jarak dalam 3 saat pertama, (b) jarak yang dilalui dalam saat ketiga.`, given: R`\(v(t)\), \(s(0) = 0\)`, find: R`jarak`, method: R`Pecahkan pada \(v = 0\).`, steps: [{ do: R`\(s = 3t^2 - t^3\); \(v = 3t(2 - t) = 0\) pada \(t = 2\)` }, { do: R`\(s(2) = 12 - 8 = 4\), \(s(3) = 27 - 27 = 0\)` }, { do: R`(a) Jarak \(= |4 - 0| + |0 - 4| = 8\)` }, { do: R`(b) Saat ketiga: \(2 \le t \le 3\), \(v < 0\) sepanjang tempoh itu, jarak \(= |s(3) - s(2)| = 4\)` }], check: R`Zarah pergi 4 m ke kanan (hingga \(t = 2\)) dan kembali ke \(O\) pada \(t = 3\) ✓`, conclusion: R`(a) 8 m; (b) 4 m.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`"Saat ketiga" ditafsir sebagai \(0 \le t \le 3\).`, why: R`Itu tiga saat pertama.`, fix: R`Saat ketiga: \(2 \le t \le 3\).` },
      { wrong: R`Mengambil \(t = 0\) sebagai masa "bertemu".`, why: R`Pada \(t = 0\) kedua-duanya baru bermula di \(O\).`, fix: R`Ambil penyelesaian \(t > 0\).` },
    ] },
    { kind: 'summary', points: [R`Terjemah ayat kepada syarat: \(v = 0\), \(s = 0\), \(s_P = s_Q\), \(a = 0\).`, R`Bezakan untuk kadar, amir untuk jumlah (dengan syarat awal).`, R`Untuk jarak, semak pertukaran arah.`] },
    { kind: 'next', html: R`<p>Ini bab terakhir Matematik Tambahan Tingkatan 5. Ulang kaji Bab 2 (Pembezaan) dan Bab 3 (Pengamiran) untuk mengukuhkan asas bab ini.</p>`, links: [{ href: '#/bab/t5-8', label: 'Kembali ke Bab 8' }] },
  ],
};

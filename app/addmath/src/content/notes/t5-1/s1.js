// T5 Bab 1 Sukatan Membulat (SP 1.1.1–1.4.1). Original.
// DSKP (PDF 110–111, verified as page images): real-life situations throughout;
// definition of one radian must be discussed; radian measure expressed in terms
// of π and without π; derivation of s = jθ must be discussed; perimeter of a
// segment (sine/cosine rule may be used); derivation of L = ½j²θ must be
// discussed; area of a segment (½ab sin c or Heron may be used).
// Malaysian notation: j = jejari (radius), θ in radians.
const R = String.raw;
const DEG = Math.PI / 180;
const r3 = (v) => +v.toFixed(3);
const r2 = (v) => +v.toFixed(2);
const arcPts = (j, th, n = 90, cx = 0, cy = 0, start = 0) => { const p = []; for (let k = 0; k <= n; k++) { const a = start + (th * k) / n; p.push([cx + j * Math.cos(a), cy + j * Math.sin(a)]); } return p; };

// ---------------------------------------------------------------- 1.1
export const S1_1 = {
  id: '1.1', sk: '1.1', title: 'Radian', sp: ['1.1.1'], status: 'review', minutes: 35,
  sections: [
    { kind: 'intro', title: 'Mengapa unit sudut yang baharu?', html: R`<p>Darjah dicipta oleh manusia: 360 dipilih kerana mudah dibahagi. <strong>Radian</strong> pula datang daripada bulatan itu sendiri, iaitu daripada jejarinya. Dengan radian, rumus panjang lengkok dan luas sektor menjadi sangat ringkas, dan radian digunakan dalam kalkulus, fizik (putaran roda, gerakan bandul) dan kejuruteraan.</p>` },
    { kind: 'prereq', title: 'Imbas kembali', html: R`<ul><li>Lilitan bulatan \(= 2\pi j\), luas bulatan \(= \pi j^2\), dengan \(j\) = jejari.</li><li>Satu pusingan lengkap \(= 360^\circ\).</li><li>\(\pi \approx 3.142\).</li></ul>` },
    { kind: 'concept', title: 'Takrif satu radian', sp: ['1.1.1'], html: R`
      <p><strong>Satu radian</strong> (1 rad) ialah sudut yang tercangkum di pusat bulatan oleh lengkok yang <strong>panjangnya sama dengan jejari</strong> bulatan itu.</p>
      <p>Lilitan penuh ialah \(2\pi j\), iaitu \(2\pi\) kali jejari. Jadi satu pusingan lengkap ialah \(2\pi\) radian:</p>
      \[2\pi \text{ rad} = 360^\circ \quad\Longrightarrow\quad \pi \text{ rad} = 180^\circ, \qquad 1 \text{ rad} = \frac{180^\circ}{\pi} \approx 57.30^\circ\]
      <p><strong>Penukaran:</strong> darjah ke radian, darab \(\dfrac{\pi}{180^\circ}\); radian ke darjah, darab \(\dfrac{180^\circ}{\pi}\).</p>
      <p>Sukatan radian boleh ditulis <strong>dalam sebutan \(\pi\)</strong> (tepat, contohnya \(\tfrac{5\pi}{6}\)) atau <strong>tanpa \(\pi\)</strong> (perpuluhan, contohnya 2.618 rad).</p>` },
    { kind: 'visual', title: 'Berapa jejari muat di sepanjang lengkok?', html: R`<p>Jejari bulatan ialah 1 unit. Ubah panjang lengkok (dalam unit jejari). Sudut di pusat, dalam radian, sama dengan bilangan jejari di sepanjang lengkok.</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-1.4, 1.4], y: [-1.3, 1.3], params: [{ name: 's', label: 'panjang lengkok (jejari)', min: 0.25, max: 6.25, step: 0.25, value: 1 }],
        polygons: [
          { at: () => arcPts(1, 2 * Math.PI, 120), closed: false, color: '#C9CED8' },
          { at: (p) => [[0, 0], ...arcPts(1, p.s, 90)], color: '#3467D4' },
          { at: (p) => arcPts(1.04, p.s, 90), closed: false, color: '#D9534F' },
        ],
        points: [{ at: () => [0, 0], label: 'O' }],
        readout: (p, { fmt }) => R`Lengkok \(= ${fmt(p.s)}j\), jadi \(\theta = ${fmt(p.s)}\) rad \(= ${fmt(p.s)} \times \dfrac{180^\circ}{\pi} = ${fmt(r2(p.s / DEG))}^\circ\). ${Math.abs(p.s - 2 * Math.PI) < 0.2 ? R`Hampir satu pusingan: \(2\pi \approx 6.283\) rad.` : ''}` },
      alt: R`Bulatan berjejari 1 dengan sektor biru dan lengkok merah bermula dari arah timur. Apabila panjang lengkok sama dengan satu jejari, sudut di pusat ialah 1 radian, kira-kira 57.30°. Lengkok 3 jejari memberi 3 rad (171.89°), dan satu pusingan lengkap memerlukan 2π ≈ 6.283 jejari.` },
    { kind: 'formula', items: [{ tex: R`\pi \text{ rad} = 180^\circ`, html: R`\(1 \text{ rad} \approx 57.30^\circ\), \(1^\circ = \tfrac{\pi}{180} \approx 0.01745\) rad.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.1.1'], question: R`Tukar \(150^\circ\) kepada radian, dalam sebutan \(\pi\) dan tanpa \(\pi\).`, given: R`\(150^\circ\)`, find: R`sudut dalam radian`, method: R`Darab dengan \(\tfrac{\pi}{180^\circ}\).`, steps: [{ do: R`\(150 \times \dfrac{\pi}{180} = \dfrac{5\pi}{6}\)`, why: R`Permudahkan \(\tfrac{150}{180} = \tfrac56\).` }, { do: R`\(\dfrac{5\pi}{6} = 2.618\) rad` }], check: R`\(150^\circ\) kurang sedikit daripada \(180^\circ = \pi \approx 3.142\) rad ✓`, conclusion: R`\(\tfrac{5\pi}{6}\) rad \(\approx 2.618\) rad.` },
      { level: 'sederhana', sp: ['1.1.1'], question: R`Tukar (a) \(1.2\pi\) rad dan (b) 2.5 rad kepada darjah.`, given: R`sudut dalam radian`, find: R`darjah`, method: R`Darab dengan \(\tfrac{180^\circ}{\pi}\).`, steps: [{ do: R`(a) \(1.2\pi \times \dfrac{180^\circ}{\pi} = 216^\circ\)`, why: R`\(\pi\) dibatalkan; tiada pembundaran.` }, { do: R`(b) \(2.5 \times \dfrac{180^\circ}{\pi} = 143.24^\circ\)` }], check: R`2.5 rad \(\approx 2.5 \times 57.3 = 143.25^\circ\) ✓`, conclusion: R`\(216^\circ\); \(143.24^\circ\).` },
      { level: 'mencabar', sp: ['1.1.1'], question: R`Jarum minit sebuah jam bergerak selama 20 minit. Cari sudut putarannya dalam radian.`, given: R`20 minit daripada 60`, find: R`sudut dalam radian`, method: R`Pecahan satu pusingan \(\times 2\pi\).`, steps: [{ do: R`\(\dfrac{20}{60} \times 2\pi = \dfrac{2\pi}{3}\)` }, { do: R`\(= 2.094\) rad` }], check: R`\(\tfrac{2\pi}{3}\) rad \(= 120^\circ\), iaitu satu pertiga pusingan ✓`, conclusion: R`\(\tfrac{2\pi}{3} \approx 2.094\) rad.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(1 \text{ rad} = 1^\circ\)`, why: R`1 rad ialah kira-kira 57.30°.`, fix: R`\(\pi \text{ rad} = 180^\circ\).` },
      { wrong: R`Kalkulator dalam mod DEG semasa mengira \(\sin 1.2\).`, why: R`Dalam bab ini sudut biasanya dalam radian.`, fix: R`Tukar kepada mod <strong>RAD</strong> apabila sudut dalam radian.` },
    ] },
    { kind: 'summary', points: [R`1 rad: sudut di pusat apabila lengkok = jejari.`, R`\(\pi \text{ rad} = 180^\circ\); \(1 \text{ rad} \approx 57.30^\circ\).`, R`Tulis dalam sebutan \(\pi\) (tepat) atau perpuluhan.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>1.2</strong>: panjang lengkok, dengan rumus yang sangat ringkas kerana radian.</p>`, links: [{ href: '#/nota/t5-1/1.2', label: '1.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 1.2
export const S1_2 = {
  id: '1.2', sk: '1.2', title: 'Panjang Lengkok Suatu Bulatan', sp: ['1.2.1', '1.2.2', '1.2.3'], status: 'review', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Jarak hujung bandul', html: R`<p>Hujung sebuah bandul berayun di sepanjang <strong>lengkok</strong> bulatan, bukan garis lurus. Berapa jauh ia bergerak dalam satu ayunan? Kita perlukan panjang lengkok.</p>` },
    { kind: 'concept', title: 'Menerbitkan \(s = j\theta\)', sp: ['1.2.1'], html: R`
      <p>Panjang lengkok berkadar dengan sudut di pusat. Bandingkan dengan bulatan penuh (lengkok \(2\pi j\), sudut \(2\pi\)):</p>
      \[\frac{s}{2\pi j} = \frac{\theta}{2\pi} \quad\Longrightarrow\quad s = j\theta\]
      <p>dengan \(\theta\) dalam <strong>radian</strong>. Rumus ini boleh disusun semula untuk mencari jejari \(j = \dfrac{s}{\theta}\) atau sudut \(\theta = \dfrac{s}{j}\).</p>
      <p>Jika sudut diberi dalam darjah, tukar dahulu kepada radian. (Rumus darjah ialah \(s = \tfrac{\theta^\circ}{360^\circ} \times 2\pi j\), yang memberi jawapan yang sama.)</p>` },
    { kind: 'concept', title: 'Perimeter tembereng', sp: ['1.2.2'], html: R`
      <p><strong>Tembereng</strong> ialah kawasan di antara lengkok dan perentas \(AB\). Perimeternya ialah</p>
      \[\text{perimeter tembereng} = s + AB\]
      <p>Panjang perentas \(AB\) boleh dicari dengan:</p>
      <ul><li>petua kosinus dalam \(\triangle OAB\): \(AB^2 = j^2 + j^2 - 2j^2\kos\theta\), atau</li><li>membahagi \(\triangle OAB\) kepada dua segi tiga tegak: \(AB = 2j\sin\dfrac{\theta}{2}\).</li></ul>
      <p><strong>Perimeter sektor</strong> pula ialah \(s + 2j\) (lengkok dan dua jejari).</p>` },
    { kind: 'visual', title: 'Sektor, lengkok dan perentas', html: R`<p>Ubah jejari dan sudut. Merah: lengkok \(s\). Hijau: perentas \(AB\).</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-11, 11], y: [-11, 11], params: [{ name: 'j', label: R`\(j\)`, min: 2, max: 10, step: 1, value: 8 }, { name: 't', label: R`\(\theta\) (rad)`, min: 0.2, max: 6, step: 0.1, value: 1.2 }],
        polygons: [
          { at: (p) => [[0, 0], ...arcPts(p.j, p.t)], color: '#3467D4' },
          { at: (p) => arcPts(p.j, p.t), closed: false, color: '#D9534F' },
          { at: (p) => [[p.j, 0], [p.j * Math.cos(p.t), p.j * Math.sin(p.t)]], closed: false, color: '#2E9E6B' },
        ],
        points: [{ at: () => [0, 0], label: 'O' }, { at: (p) => [p.j, 0], label: 'A' }, { at: (p) => [p.j * Math.cos(p.t), p.j * Math.sin(p.t)], label: 'B' }],
        readout: (p, { fmt }) => { const s = p.j * p.t, c = 2 * p.j * Math.sin(p.t / 2); return R`\(s = j\theta = ${fmt(p.j)} \times ${fmt(p.t)} = ${fmt(r3(s))}\); perentas \(AB = 2(${fmt(p.j)})\sin ${fmt(r2(p.t / 2))} = ${fmt(r3(c))}\); perimeter tembereng \(= ${fmt(r3(s + c))}\); perimeter sektor \(= ${fmt(r3(s + 2 * p.j))}\).`; } },
      alt: R`Sektor OAB dengan jejari j dan sudut θ radian. Dengan j = 8 dan θ = 1.2, lengkok s = 9.6, perentas AB = 2(8) sin 0.6 ≈ 9.034, perimeter tembereng ≈ 18.634 dan perimeter sektor = 25.6. Apabila θ menghampiri 2π, perentas menjadi pendek tetapi lengkok hampir sama dengan lilitan.` },
    { kind: 'concept', title: 'Masalah melibatkan panjang lengkok', sp: ['1.2.3'], html: R`<p>Contoh situasi: bandul, roda yang berputar (jarak dilalui \(= j \times\) sudut putaran), tali sawat pada takal, trek larian berbentuk lengkung, dan reka bentuk pintu gerbang. Tandakan pusat, jejari dan sudut di pusat; pastikan sudut dalam radian.</p>` },
    { kind: 'formula', items: [{ tex: R`s = j\theta`, html: R`\(\theta\) dalam radian. \(j = \tfrac{s}{\theta}\), \(\theta = \tfrac{s}{j}\).` }, { tex: R`AB = 2j\sin\frac{\theta}{2}`, html: R`Perentas; perimeter tembereng \(= j\theta + AB\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.2.1'], question: R`Cari panjang lengkok sektor berjejari 8 cm dengan sudut 1.2 rad.`, given: R`\(j = 8\), \(\theta = 1.2\)`, find: R`\(s\)`, method: R`\(s = j\theta\).`, steps: [{ do: R`\(s = 8 \times 1.2 = 9.6\) cm` }], check: R`1.2 rad sedikit lebih daripada 1 rad, jadi lengkok sedikit lebih daripada jejari 8 ✓`, conclusion: R`9.6 cm.` },
      { level: 'sederhana', sp: ['1.2.1'], question: R`Lengkok sepanjang 15 cm mencangkum sudut di pusat bulatan berjejari 6 cm. Cari sudut itu dalam radian dan darjah.`, given: R`\(s = 15\), \(j = 6\)`, find: R`\(\theta\)`, method: R`\(\theta = \tfrac{s}{j}\).`, steps: [{ do: R`\(\theta = \dfrac{15}{6} = 2.5\) rad` }, { do: R`\(2.5 \times \dfrac{180^\circ}{\pi} = 143.24^\circ\)` }], check: R`\(6 \times 2.5 = 15\) ✓`, conclusion: R`2.5 rad \(\approx 143.24^\circ\).` },
      { level: 'sederhana', sp: ['1.2.2'], question: R`Sektor \(OAB\) berjejari 10 cm dan \(\angle AOB = 1.2\) rad. Cari perimeter tembereng yang dibatasi oleh lengkok \(AB\) dan perentas \(AB\).`, given: R`\(j = 10\), \(\theta = 1.2\)`, find: R`perimeter tembereng`, method: R`Lengkok + perentas.`, steps: [{ do: R`\(s = 10 \times 1.2 = 12\) cm` }, { do: R`\(AB = 2(10)\sin 0.6 = 11.293\) cm`, why: R`Garis dari \(O\) ke titik tengah \(AB\) membahagi segi tiga sama kaki kepada dua segi tiga tegak dengan sudut \(0.6\) rad. Kalkulator dalam mod RAD.` }, { do: R`Perimeter \(= 12 + 11.293 = 23.293\) cm` }], check: R`Perentas lebih pendek daripada lengkok (garis lurus ialah jarak terpendek) ✓`, conclusion: R`23.293 cm.` },
      { level: 'mencabar', sp: ['1.2.3'], question: R`Sebuah bandul sepanjang 80 cm berayun melalui sudut \(35^\circ\). Cari jarak yang dilalui oleh hujungnya dalam satu ayunan.`, given: R`\(j = 80\), \(\theta = 35^\circ\)`, find: R`\(s\)`, method: R`Tukar sudut ke radian, kemudian \(s = j\theta\).`, steps: [{ do: R`\(35^\circ = 35 \times \dfrac{\pi}{180} = 0.6109\) rad` }, { do: R`\(s = 80 \times 0.6109 = 48.87\) cm` }], check: R`Rumus darjah: \(\tfrac{35}{360} \times 2\pi(80) = 48.87\) ✓`, conclusion: R`Kira-kira 48.87 cm.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(s = 8 \times 35 = 280\) cm (sudut dalam darjah).`, why: R`\(s = j\theta\) hanya sah jika \(\theta\) dalam radian.`, fix: R`Tukar dahulu: \(35^\circ = 0.6109\) rad.` },
      { wrong: R`Perimeter tembereng \(= s + 2j\).`, why: R`Itu perimeter <em>sektor</em>.`, fix: R`Tembereng: \(s + \) perentas.` },
    ] },
    { kind: 'summary', points: [R`\(s = j\theta\), \(\theta\) dalam radian.`, R`Perentas \(= 2j\sin\tfrac{\theta}{2}\) (atau petua kosinus).`, R`Perimeter sektor \(= s + 2j\); perimeter tembereng \(= s + \) perentas.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>1.3</strong>: luas sektor dan tembereng.</p>`, links: [{ href: '#/nota/t5-1/1.3', label: '1.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 1.3
export const S1_3 = {
  id: '1.3', sk: '1.3', title: 'Luas Sektor Suatu Bulatan', sp: ['1.3.1', '1.3.2', '1.3.3'], status: 'review', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Sepotong piza', html: R`<p>Piza berdiameter 30 cm dipotong kepada 8 potong sama besar. Berapakah luas sepotong? Setiap potong ialah <strong>sektor</strong> bulatan.</p>` },
    { kind: 'concept', title: 'Menerbitkan \(L = \tfrac12 j^2\theta\)', sp: ['1.3.1'], html: R`
      <p>Luas sektor berkadar dengan sudut di pusat. Bandingkan dengan bulatan penuh (luas \(\pi j^2\), sudut \(2\pi\)):</p>
      \[\frac{L}{\pi j^2} = \frac{\theta}{2\pi} \quad\Longrightarrow\quad L = \tfrac12 j^2\theta\]
      <p>dengan \(\theta\) dalam radian. Susun semula: \(\theta = \dfrac{2L}{j^2}\) atau \(j = \sqrt{\dfrac{2L}{\theta}}\).</p>` },
    { kind: 'concept', title: 'Luas tembereng', sp: ['1.3.2'], html: R`
      <p>Luas tembereng \(=\) luas sektor \(-\) luas \(\triangle OAB\). Luas segi tiga boleh dicari dengan \(\tfrac12 ab\sin C\):</p>
      \[\text{Luas tembereng} = \tfrac12 j^2\theta - \tfrac12 j^2\sin\theta = \tfrac12 j^2(\theta - \sin\theta)\]
      <p>Dalam \(\sin\theta\), \(\theta\) dalam radian, jadi kalkulator mesti dalam mod <strong>RAD</strong> (atau tukar \(\theta\) kepada darjah untuk \(\sin\) sahaja). Rumus Heron juga boleh digunakan untuk luas \(\triangle OAB\) jika panjang perentas diketahui.</p>` },
    { kind: 'visual', title: 'Sektor = segi tiga + tembereng', html: R`<p>Biru muda: \(\triangle OAB\). Jingga: tembereng. Ubah sudut.</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-7, 7], y: [-7, 7], params: [{ name: 't', label: R`\(\theta\) (rad)`, min: 0.2, max: 3.1, step: 0.1, value: 1.2 }],
        polygons: [
          { at: () => arcPts(6, 2 * Math.PI, 120), closed: false, color: '#E3E6EC' },
          { at: (p) => [[0, 0], [6, 0], [6 * Math.cos(p.t), 6 * Math.sin(p.t)]], color: '#3467D4' },
          { at: (p) => arcPts(6, p.t), color: '#E0A93B' },
        ],
        points: [{ at: () => [0, 0], label: 'O' }, { at: () => [6, 0], label: 'A' }, { at: (p) => [6 * Math.cos(p.t), 6 * Math.sin(p.t)], label: 'B' }],
        readout: (p, { fmt }) => { const sec = 18 * p.t, tri = 18 * Math.sin(p.t); return R`\(j = 6\): sektor \(= \tfrac12(36)(${fmt(p.t)}) = ${fmt(r3(sec))}\); segi tiga \(= \tfrac12(36)\sin ${fmt(p.t)} = ${fmt(r3(tri))}\); tembereng \(= ${fmt(r3(sec - tri))}\).`; } },
      alt: R`Bulatan berjejari 6 dengan sektor OAB. Segi tiga OAB diserlahkan biru dan tembereng di antara perentas AB dan lengkok diserlahkan jingga. Dengan θ = 1.2 rad: sektor = 21.6, segi tiga = 18 sin 1.2 ≈ 16.777, tembereng ≈ 4.823. Apabila θ kecil, tembereng sangat nipis; apabila θ hampir π, segi tiga menjadi nipis dan tembereng hampir separuh bulatan.` },
    { kind: 'concept', title: 'Masalah melibatkan luas sektor', sp: ['1.3.3'], html: R`<p>Contoh: potongan kek atau piza, kawasan disapu pengelap cermin kereta, taman berbentuk kipas, kawasan lampu sorot. Lukis rajah, kenal pasti sektor dan segi tiga, dan tolak atau tambah luas mengikut keperluan.</p>` },
    { kind: 'formula', items: [{ tex: R`L = \tfrac12 j^2\theta`, html: R`\(\theta\) dalam radian.` }, { tex: R`\text{Luas tembereng} = \tfrac12 j^2(\theta - \sin\theta)`, html: R`Sektor tolak segi tiga \(OAB\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.3.1'], question: R`Cari luas sektor berjejari 6 cm dengan sudut 1.5 rad.`, given: R`\(j = 6\), \(\theta = 1.5\)`, find: R`\(L\)`, method: R`\(L = \tfrac12 j^2\theta\).`, steps: [{ do: R`\(L = \tfrac12(36)(1.5) = 27\) cm²` }], check: R`Bulatan penuh \(36\pi \approx 113\); \(\tfrac{1.5}{2\pi} \approx 0.24\) daripadanya \(\approx 27\) ✓`, conclusion: R`27 cm².` },
      { level: 'sederhana', sp: ['1.3.1'], question: R`Sektor dengan sudut 1.5 rad mempunyai luas 75 cm². Cari jejarinya.`, given: R`\(L = 75\), \(\theta = 1.5\)`, find: R`\(j\)`, method: R`Susun semula rumus.`, steps: [{ do: R`\(\tfrac12 j^2(1.5) = 75 \Rightarrow j^2 = 100\)` }, { do: R`\(j = 10\) cm`, why: R`Jejari positif, jadi abaikan \(-10\).` }], check: R`\(\tfrac12(100)(1.5) = 75\) ✓`, conclusion: R`10 cm.` },
      { level: 'sederhana', sp: ['1.3.2'], question: R`Sektor \(OAB\) berjejari 10 cm dan \(\angle AOB = 1.2\) rad. Cari luas tembereng.`, given: R`\(j = 10\), \(\theta = 1.2\)`, find: R`luas tembereng`, method: R`Sektor tolak segi tiga.`, steps: [{ do: R`Sektor \(= \tfrac12(100)(1.2) = 60\) cm²` }, { do: R`\(\triangle OAB = \tfrac12(10)(10)\sin 1.2 = 46.602\) cm²`, why: R`Mod RAD: \(\sin 1.2 = 0.93204\).` }, { do: R`Tembereng \(= 60 - 46.602 = 13.398\) cm²` }], check: R`Positif dan jauh lebih kecil daripada sektor ✓`, conclusion: R`13.398 cm².` },
      { level: 'mencabar', sp: ['1.3.3'], question: R`Piza berdiameter 30 cm dipotong kepada 8 potong sama besar. Cari luas sepotong.`, given: R`\(j = 15\), 8 sektor sama`, find: R`luas sepotong`, method: R`Sudut setiap sektor \(= \tfrac{2\pi}{8}\).`, steps: [{ do: R`\(\theta = \dfrac{2\pi}{8} = \dfrac{\pi}{4}\)` }, { do: R`\(L = \tfrac12(15)^2\left(\dfrac{\pi}{4}\right) = 88.36\) cm²`, why: R`Jejari ialah separuh diameter.` }], check: R`\(8 \times 88.36 = 706.9 \approx \pi(15)^2\) ✓`, conclusion: R`Kira-kira 88.36 cm².` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Guna diameter sebagai \(j\).`, why: R`Rumus memerlukan jejari.`, fix: R`\(j = \tfrac{\text{diameter}}{2}\).` },
      { wrong: R`Luas tembereng \(= \tfrac12 j^2(\theta - \sin\theta)\) dengan kalkulator dalam mod DEG.`, why: R`\(\sin 1.2^\circ\) sangat berbeza daripada \(\sin(1.2 \text{ rad})\).`, fix: R`Mod RAD.` },
    ] },
    { kind: 'summary', points: [R`\(L = \tfrac12 j^2\theta\) (\(\theta\) dalam radian).`, R`Tembereng \(= \tfrac12 j^2(\theta - \sin\theta)\).`, R`Diberi \(L\): \(\theta = \tfrac{2L}{j^2}\) atau \(j = \sqrt{\tfrac{2L}{\theta}}\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>1.4</strong>: masalah gabungan.</p>`, links: [{ href: '#/nota/t5-1/1.4', label: '1.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 1.4
export const S1_4 = {
  id: '1.4', sk: '1.4', title: 'Aplikasi Sukatan Membulat', sp: ['1.4.1'], status: 'review', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Pengelap cermin kereta', html: R`<p>Bilah pengelap cermin kereta berputar pada satu pangsi. Ia tidak menyapu sektor penuh: bahagian berhampiran pangsi tidak dilapik getah. Kawasan yang dibersihkan ialah <strong>sektor besar tolak sektor kecil</strong>.</p>` },
    { kind: 'concept', title: 'Strategi', sp: ['1.4.1'], html: R`
      <ol><li>Lukis rajah dan tandakan pusat, jejari dan sudut (radian).</li><li>Pecahkan bentuk kepada <strong>sektor, segi tiga dan tembereng</strong>.</li><li>Tambah atau tolak luas; untuk perimeter, jumlahkan hanya sempadan luar.</li><li>Semak unit dan munasabah jawapan.</li></ol>
      <p><strong>Kawasan cincin sektor</strong> (antara dua lengkok sepusat): \(\tfrac12 R^2\theta - \tfrac12 r^2\theta = \tfrac12(R^2 - r^2)\theta\).</p>` },
    { kind: 'visual', title: 'Kawasan sapuan pengelap', html: R`<p>Bilah sepanjang \(R = 60\) cm dari pangsi; getah bermula pada jarak \(r\) dari pangsi. Ubah \(r\) dan sudut sapuan.</p>`,
      spec: { type: 'plot', noAxes: true, equalAspect: true, x: [-65, 65], y: [-8, 66], params: [{ name: 'r', label: R`\(r\) (cm)`, min: 0, max: 40, step: 5, value: 15 }, { name: 't', label: R`sudut sapuan (rad)`, min: 0.5, max: 3, step: 0.1, value: 2.2 }],
        polygons: [
          { at: (p) => { const st = (Math.PI - p.t) / 2; return [...arcPts(60, p.t, 90, 0, 0, st), ...arcPts(p.r, p.t, 90, 0, 0, st).reverse()]; }, color: '#3467D4' },
          { at: () => [[-62, 0], [62, 0]], closed: false, color: '#C9CED8' },
        ],
        points: [{ at: () => [0, 0], label: 'pangsi' }],
        readout: (p, { fmt }) => R`Luas \(= \tfrac12(60^2 - ${fmt(p.r)}^2)(${fmt(p.t)}) = ${fmt(r2(0.5 * (3600 - p.r * p.r) * p.t))}\) cm².` },
      alt: R`Kawasan berbentuk cincin sektor di antara lengkok berjejari 60 cm dan lengkok berjejari r, simetri di atas pangsi. Dengan r = 15 cm dan sudut 2.2 rad, luas yang disapu ialah ½(3600 − 225)(2.2) = 3712.5 cm². Jika r = 0, kawasan menjadi sektor penuh 3960 cm².` },
    { kind: 'formula', items: [{ tex: R`\tfrac12(R^2 - r^2)\theta`, html: R`Luas antara dua lengkok sepusat.` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['1.4.1'], question: R`Bilah pengelap 60 cm dari pangsi, dengan getah bermula 15 cm dari pangsi, menyapu sudut 2.2 rad. Cari luas yang dibersihkan.`, given: R`\(R = 60\), \(r = 15\), \(\theta = 2.2\)`, find: R`luas`, method: R`Sektor besar tolak sektor kecil.`, steps: [{ do: R`\(\tfrac12(60^2)(2.2) = 3960\) cm²` }, { do: R`\(\tfrac12(15^2)(2.2) = 247.5\) cm²` }, { do: R`\(3960 - 247.5 = 3712.5\) cm²` }], check: R`\(\tfrac12(3600 - 225)(2.2) = 3712.5\) ✓`, conclusion: R`3712.5 cm².` },
      { level: 'mencabar', sp: ['1.4.1'], question: R`Sebuah sektor kertas berjejari 12 cm dan bersudut \(150^\circ\) digulung menjadi kon (tanpa bertindih). Cari jejari tapak kon.`, given: R`\(j = 12\), \(\theta = 150^\circ\)`, find: R`jejari tapak kon`, method: R`Lengkok sektor menjadi lilitan tapak kon.`, steps: [{ do: R`\(\theta = \dfrac{5\pi}{6}\), jadi \(s = 12 \times \dfrac{5\pi}{6} = 10\pi\) cm` }, { do: R`\(2\pi r = 10\pi \Rightarrow r = 5\) cm`, why: R`Tepi lengkung sektor membentuk bulatan tapak; jejari sektor menjadi tinggi condong kon.` }], check: R`\(r = 5 < 12\) (tinggi condong) ✓`, conclusion: R`5 cm.` },
      { level: 'mencabar', sp: ['1.4.1', '1.3.2'], question: R`Dalam bulatan berjejari 10 cm, perentas \(AB\) mencangkum sudut \(\tfrac{\pi}{3}\) di pusat. Cari luas dan perimeter tembereng kecil.`, given: R`\(j = 10\), \(\theta = \tfrac{\pi}{3}\)`, find: R`luas dan perimeter tembereng`, method: R`\(\triangle OAB\) sama sisi (sudut \(60^\circ\), dua sisi 10).`, steps: [{ do: R`\(AB = 10\) cm (segi tiga sama sisi)` }, { do: R`Lengkok \(= 10 \times \tfrac{\pi}{3} = 10.472\) cm; perimeter \(= 20.472\) cm` }, { do: R`Luas \(= \tfrac12(100)\left(\tfrac{\pi}{3} - \sin\tfrac{\pi}{3}\right) = 9.059\) cm²` }], check: R`Heron untuk segi tiga sama sisi bersisi 10: \(\sqrt{15 \cdot 5 \cdot 5 \cdot 5} = 43.301\); sektor \(52.360 - 43.301 = 9.059\) ✓`, conclusion: R`9.059 cm²; 20.472 cm.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Kawasan cincin \(= \tfrac12(R - r)^2\theta\).`, why: R`\((R - r)^2 \ne R^2 - r^2\).`, fix: R`\(\tfrac12(R^2 - r^2)\theta\).` },
      { wrong: R`Perimeter bentuk gabungan termasuk garis dalaman.`, why: R`Perimeter hanya sempadan luar.`, fix: R`Surih sempadan dengan jari dan senaraikan setiap bahagian.` },
    ] },
    { kind: 'summary', points: [R`Pecahkan kepada sektor, segi tiga dan tembereng.`, R`Cincin sektor: \(\tfrac12(R^2 - r^2)\theta\).`, R`Lengkok sektor menjadi lilitan tapak kon.`] },
    { kind: 'next', html: R`<p>Radian akan digunakan sepanjang <strong>Pembezaan</strong>, <strong>Pengamiran</strong> dan <strong>Fungsi Trigonometri</strong>.</p>`, links: [{ href: '#/bab/t5-1', label: 'Kembali ke Bab 1' }] },
  ],
};

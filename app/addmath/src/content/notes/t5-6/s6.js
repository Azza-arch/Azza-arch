// T5 Bab 6 Fungsi Trigonometri (SP 6.1.1–6.6.2). Original.
// DSKP (PDF 136–139, verified as page images): angles in degrees and radians beyond
// 360° / 2π throughout; quadrant positions; degree–radian relation in terms of π;
// dynamic software suggested; complementary-angle relations sin θ = kos(90° − θ),
// tan θ = kot(90° − θ), sek θ = kosek(90° − θ) (and converses); special angles 30°,
// 45°, 60° from triangles; graphs y = a sin bx + c, y = a kos bx + c, y = a tan bx + c
// (b > 0) and the effect of a, b, c; absolute-value trig functions; graphical
// solving where y is not constant, sketches to count solutions; identities
// sin²A + kos²A = 1, 1 + tan²A = sek²A, 1 + kot²A = kosek²A (via right triangle or
// unit circle); compound angles sin(A ± B), kos(A ± B), tan(A ± B) (calculator may
// verify); double angles; half-angle formulas discussed; equations and problems.
// Malaysian notation: kos, sek, kosek, kot (macros \kos \sek \kosek \kot).
const R = String.raw;
const D = Math.PI / 180;
const r3 = (v) => +v.toFixed(3);
const r4 = (v) => +v.toFixed(4);
const quad = (t) => { const a = ((t % 360) + 360) % 360; return a === 0 || a === 90 || a === 180 || a === 270 ? 'pada paksi' : a < 90 ? 'sukuan I' : a < 180 ? 'sukuan II' : a < 270 ? 'sukuan III' : 'sukuan IV'; };
const arc = (r, from, to, n = 120) => { const p = []; for (let k = 0; k <= n; k++) { const a = (from + ((to - from) * k) / n) * D; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; };
const spiral = (t) => { const p = []; const n = Math.max(30, Math.ceil(Math.abs(t) / 4)); for (let k = 0; k <= n; k++) { const a = (t * k) / n; const r = 0.35 + (0.25 * Math.abs(a)) / 360; p.push([r * Math.cos(a * D), r * Math.sin(a * D)]); } return p; };
const nice = (v) => (Math.abs(v) > 1e6 ? NaN : v);

// ---------------------------------------------------------------- 6.1
export const S6_1 = {
  id: '6.1', sk: '6.1', title: 'Sudut Positif dan Sudut Negatif', sp: ['6.1.1'], status: 'published', minutes: 30,
  sections: [
    { kind: 'intro', title: 'Lebih daripada satu pusingan', html: R`<p>Roda kipas tidak berhenti pada 360°. Jarum jam berpusing ke arah bertentangan dengan arah lawan jam. Dalam trigonometri, sudut boleh melebihi \(360^\circ\) dan boleh <strong>negatif</strong>, bergantung pada arah putaran.</p>` },
    { kind: 'concept', title: 'Mewakilkan sudut dalam satah Cartes', sp: ['6.1.1'], html: R`
      <p>Sudut diukur dari <strong>paksi-\(x\) positif</strong>. Lengan yang berputar dipanggil lengan terminal.</p>
      <ul><li><strong>Sudut positif:</strong> putaran <em>lawan arah jam</em>.</li><li><strong>Sudut negatif:</strong> putaran <em>ikut arah jam</em>.</li><li>Sudut yang berbeza dengan \(360^\circ\) (atau \(2\pi\)) mempunyai lengan terminal yang sama, contohnya \(400^\circ\), \(40^\circ\) dan \(-320^\circ\).</li></ul>
      <p><strong>Sukuan:</strong> I (\(0^\circ\)–\(90^\circ\)), II (\(90^\circ\)–\(180^\circ\)), III (\(180^\circ\)–\(270^\circ\)), IV (\(270^\circ\)–\(360^\circ\)). Ingat \(\pi \text{ rad} = 180^\circ\): contohnya \(\tfrac{5\pi}{3} = 300^\circ\) (sukuan IV).</p>` },
    { kind: 'visual', title: 'Putaran lengan terminal', html: R`<p>Ubah sudut \(\theta\) (darjah). Lingkaran merah menunjukkan arah dan banyaknya putaran.</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-1.6, 1.6], y: [-1.4, 1.4], grid: 0.5, labelStep: 1, params: [{ name: 't', label: R`\(\theta\) (darjah)`, min: -720, max: 720, step: 15, value: 400 }],
        polygons: [{ at: () => arc(1, 0, 360), closed: false, color: '#E3E6EC' }, { at: (p) => spiral(p.t), closed: false, color: '#D9534F' }],
        arrows: [{ from: () => [0, 0], to: (p) => [Math.cos(p.t * D), Math.sin(p.t * D)], color: '#3467D4', label: 'lengan terminal' }],
        readout: (p, { fmt }) => R`\(\theta = ${fmt(p.t)}^\circ = ${fmt(r3(p.t * D))}\) rad; ${p.t >= 0 ? 'lawan arah jam' : 'ikut arah jam'}; lengan terminal di ${quad(p.t)} (sama seperti \(${fmt(((p.t % 360) + 360) % 360)}^\circ\)).` },
      alt: R`Bulatan unit dengan lengan terminal biru dari asalan. Spiral merah menunjukkan putaran dari paksi-x positif: lawan arah jam bagi sudut positif, ikut arah jam bagi sudut negatif. Dengan θ = 400°, lengan berpusing satu pusingan penuh dan 40° lagi, jadi lengan terminal di sukuan I sama seperti 40°. Dengan θ = −120°, lengan di sukuan III sama seperti 240°.` },
    { kind: 'formula', items: [{ tex: R`\theta \text{ dan } \theta \pm 360^\circ k \ (\pm 2\pi k) \text{ berkongsi lengan terminal}`, html: R`Positif: lawan arah jam; negatif: ikut arah jam.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.1.1'], question: R`Nyatakan sukuan bagi (a) \(400^\circ\), (b) \(-120^\circ\), (c) \(\tfrac{5\pi}{3}\) rad.`, given: R`tiga sudut`, find: R`sukuan`, method: R`Tolak/tambah \(360^\circ\); tukar radian ke darjah.`, steps: [{ do: R`(a) \(400^\circ - 360^\circ = 40^\circ\): sukuan I` }, { do: R`(b) \(-120^\circ + 360^\circ = 240^\circ\): sukuan III`, why: R`Ikut arah jam 120° dari paksi-\(x\) positif berakhir di bawah paksi, sebelah kiri.` }, { do: R`(c) \(\tfrac{5\pi}{3} = 300^\circ\): sukuan IV` }], check: R`Lakar setiap putaran ✓`, conclusion: R`I; III; IV.` },
      { level: 'sederhana', sp: ['6.1.1'], question: R`Cari sudut negatif dan sudut positif lain yang mempunyai lengan terminal sama dengan \(\tfrac{7\pi}{4}\).`, given: R`\(\tfrac{7\pi}{4}\)`, find: R`dua sudut setara`, method: R`Tambah/tolak \(2\pi\).`, steps: [{ do: R`\(\tfrac{7\pi}{4} - 2\pi = -\tfrac{\pi}{4}\)` }, { do: R`\(\tfrac{7\pi}{4} + 2\pi = \tfrac{15\pi}{4}\)` }], check: R`\(-\tfrac{\pi}{4} = -45^\circ\): ikut arah jam 45° ke sukuan IV, sama seperti \(315^\circ\) ✓`, conclusion: R`\(-\tfrac{\pi}{4}\) dan \(\tfrac{15\pi}{4}\).` },
      { level: 'mencabar', sp: ['6.1.1'], question: R`Sebuah roda berputar \(-780^\circ\). Nyatakan bilangan pusingan lengkap, arahnya, dan sukuan kedudukan akhir.`, given: R`\(-780^\circ\)`, find: R`pusingan; arah; sukuan`, method: R`Bahagi dengan \(360^\circ\).`, steps: [{ do: R`\(780 = 2 \times 360 + 60\): 2 pusingan lengkap ikut arah jam, kemudian \(60^\circ\) lagi` }, { do: R`\(-780^\circ \equiv -60^\circ \equiv 300^\circ\): sukuan IV` }], check: R`\(-780 + 3 \times 360 = 300\) ✓`, conclusion: R`2 pusingan ikut arah jam + 60°; sukuan IV.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(-120^\circ\) di sukuan II.`, why: R`Sudut negatif berputar ikut arah jam, ke bawah.`, fix: R`Tambah \(360^\circ\): \(240^\circ\), sukuan III.` }] },
    { kind: 'summary', points: [R`Positif: lawan arah jam; negatif: ikut arah jam; dari paksi-\(x\) positif.`, R`Tambah/tolak \(360^\circ\) (\(2\pi\)) untuk sudut setara.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>6.2</strong>: nisbah trigonometri bagi sebarang sudut.</p>`, links: [{ href: '#/nota/t5-6/6.2', label: '6.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 6.2
export const S6_2 = {
  id: '6.2', sk: '6.2', title: 'Nisbah Trigonometri bagi Sebarang Sudut', sp: ['6.2.1', '6.2.2'], status: 'published', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Melangkaui segi tiga tegak', html: R`<p>Dalam segi tiga tegak, sudut sentiasa kurang daripada \(90^\circ\). Bagaimana dengan \(\sin 150^\circ\) atau \(\kos 300^\circ\)? Dengan <strong>bulatan unit</strong>, setiap sudut mempunyai nilai sinus dan kosinus.</p>` },
    { kind: 'concept', title: 'Sekan, kosekan dan kotangen', sp: ['6.2.1'], html: R`
      <p>Titik pada bulatan unit bagi sudut \(\theta\) ialah \((\kos\theta, \sin\theta)\), dan \(\tan\theta = \dfrac{\sin\theta}{\kos\theta}\). Tiga nisbah salingan:</p>
      \[\sek\theta = \frac{1}{\kos\theta}, \qquad \kosek\theta = \frac{1}{\sin\theta}, \qquad \kot\theta = \frac{1}{\tan\theta} = \frac{\kos\theta}{\sin\theta}\]
      <p><strong>Sudut pelengkap:</strong> dalam segi tiga tegak, sisi bertentangan bagi \(\theta\) ialah sisi bersebelahan bagi \(90^\circ - \theta\). Maka \(\sin\theta = \kos(90^\circ - \theta)\), \(\tan\theta = \kot(90^\circ - \theta)\), \(\sek\theta = \kosek(90^\circ - \theta)\), dan sebaliknya.</p>` },
    { kind: 'concept', title: 'Nilai bagi sebarang sudut', sp: ['6.2.2'], html: R`
      <p><strong>Tanda mengikut sukuan</strong> ("Semua Sin Tan Kos"): I semua positif; II hanya \(\sin\) (dan \(\kosek\)); III hanya \(\tan\) (dan \(\kot\)); IV hanya \(\kos\) (dan \(\sek\)).</p>
      <p><strong>Sudut rujukan</strong> \(\alpha\) ialah sudut tirus di antara lengan terminal dan paksi-\(x\): II: \(180^\circ - \theta\); III: \(\theta - 180^\circ\); IV: \(360^\circ - \theta\). Nilai nisbah = \(\pm\) nilai bagi \(\alpha\), dengan tanda mengikut sukuan.</p>
      <p><strong>Sudut khas</strong> (daripada segi tiga sama sisi bersisi 2 dan segi tiga tegak sama kaki):</p>
      <table class="mini-table"><thead><tr><th></th><th>\(30^\circ\)</th><th>\(45^\circ\)</th><th>\(60^\circ\)</th></tr></thead><tbody><tr><td>\(\sin\)</td><td>\(\tfrac12\)</td><td>\(\tfrac{\sqrt2}{2}\)</td><td>\(\tfrac{\sqrt3}{2}\)</td></tr><tr><td>\(\kos\)</td><td>\(\tfrac{\sqrt3}{2}\)</td><td>\(\tfrac{\sqrt2}{2}\)</td><td>\(\tfrac12\)</td></tr><tr><td>\(\tan\)</td><td>\(\tfrac{1}{\sqrt3}\)</td><td>1</td><td>\(\sqrt3\)</td></tr></tbody></table>` },
    { kind: 'visual', title: 'Bulatan unit', html: R`<p>Titik \(P(\kos\theta, \sin\theta)\). Ubah \(\theta\) dan perhatikan tanda setiap nisbah.</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-1.5, 1.5], y: [-1.3, 1.3], grid: 0.5, labelStep: 1, params: [{ name: 't', label: R`\(\theta\) (darjah)`, min: -360, max: 360, step: 15, value: 150 }],
        polygons: [{ at: () => arc(1, 0, 360), closed: false, color: '#C9CED8' }, { at: (p) => [[Math.cos(p.t * D), 0], [Math.cos(p.t * D), Math.sin(p.t * D)]], closed: false, color: '#D9534F' }, { at: (p) => [[0, 0], [Math.cos(p.t * D), 0]], closed: false, color: '#2E9E6B' }],
        arrows: [{ from: () => [0, 0], to: (p) => [Math.cos(p.t * D), Math.sin(p.t * D)], color: '#3467D4' }],
        points: [{ at: (p) => [Math.cos(p.t * D), Math.sin(p.t * D)], label: 'P' }],
        readout: (p, { fmt }) => { const s = Math.sin(p.t * D), c = Math.cos(p.t * D); const z = (v) => (Math.abs(v) < 1e-12 ? 0 : v); const tn = Math.abs(c) < 1e-12 ? null : s / c; return R`${quad(p.t)}: \(\sin\theta = ${fmt(r4(z(s)))}\) (merah), \(\kos\theta = ${fmt(r4(z(c)))}\) (hijau), \(\tan\theta = ${tn === null ? R`\text{tak tertakrif}` : fmt(r4(z(tn)))}\); \(\kosek\theta = ${Math.abs(s) < 1e-12 ? R`\text{tak tertakrif}` : fmt(r4(1 / s))}\), \(\sek\theta = ${Math.abs(c) < 1e-12 ? R`\text{tak tertakrif}` : fmt(r4(1 / c))}\).`; } },
      alt: R`Bulatan unit dengan titik P(kos θ, sin θ). Garis merah menegak ialah sin θ dan garis hijau mengufuk ialah kos θ. Dengan θ = 150° (sukuan II), sin θ = 0.5 (positif) dan kos θ = −0.866 (negatif), jadi tan θ = −0.5774. Pada 90° dan 270°, kos θ = 0 dan tan θ tidak tertakrif.` },
    { kind: 'formula', items: [{ tex: R`\sek\theta = \frac{1}{\kos\theta},\ \kosek\theta = \frac{1}{\sin\theta},\ \kot\theta = \frac{1}{\tan\theta}`, html: R`Nisbah salingan.` }, { tex: R`\sin\theta = \kos(90^\circ - \theta),\ \tan\theta = \kot(90^\circ - \theta),\ \sek\theta = \kosek(90^\circ - \theta)`, html: R`Sudut pelengkap.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.2.1'], question: R`Diberi \(\sin\theta = \tfrac35\) dengan \(\theta\) tirus. Cari \(\kosek\theta\), \(\sek\theta\) dan \(\kot\theta\).`, given: R`\(\sin\theta = \tfrac35\)`, find: R`tiga nisbah salingan`, method: R`Segi tiga 3-4-5.`, steps: [{ do: R`Bertentangan 3, hipotenus 5, bersebelahan 4` }, { do: R`\(\kosek\theta = \tfrac53\), \(\sek\theta = \tfrac54\), \(\kot\theta = \tfrac43\)` }], check: R`\(\sin\theta \cdot \kosek\theta = 1\) ✓`, conclusion: R`\(\tfrac53, \tfrac54, \tfrac43\).` },
      { level: 'sederhana', sp: ['6.2.2'], question: R`Tanpa kalkulator, cari (a) \(\sin 240^\circ\), (b) \(\kos 315^\circ\), (c) \(\tan(-150^\circ)\).`, given: R`tiga sudut`, find: R`nilai tepat`, method: R`Sukuan, sudut rujukan, sudut khas.`, steps: [{ do: R`(a) III, \(\alpha = 60^\circ\), \(\sin\) negatif: \(-\tfrac{\sqrt3}{2}\)` }, { do: R`(b) IV, \(\alpha = 45^\circ\), \(\kos\) positif: \(\tfrac{\sqrt2}{2}\)` }, { do: R`(c) \(-150^\circ \equiv 210^\circ\): III, \(\alpha = 30^\circ\), \(\tan\) positif: \(\tfrac{1}{\sqrt3}\)` }], check: R`Kalkulator: \(-0.8660\), \(0.7071\), \(0.5774\) ✓`, conclusion: R`\(-\tfrac{\sqrt3}{2}\); \(\tfrac{\sqrt2}{2}\); \(\tfrac{1}{\sqrt3}\).` },
      { level: 'mencabar', sp: ['6.2.2'], question: R`Diberi \(\kos\theta = -\tfrac{5}{13}\) dan \(180^\circ \le \theta \le 360^\circ\). Cari \(\sin\theta\), \(\tan\theta\) dan \(\kosek\theta\).`, given: R`\(\kos\theta\) negatif`, find: R`nisbah lain`, method: R`Tentukan sukuan, guna segi tiga 5-12-13.`, steps: [{ do: R`\(\kos\) negatif dan \(180^\circ \le \theta \le 360^\circ\): sukuan III` }, { do: R`\(\sin\theta = -\tfrac{12}{13}\), \(\tan\theta = \tfrac{12}{5}\), \(\kosek\theta = -\tfrac{13}{12}\)`, why: R`Dalam sukuan III, \(\sin\) negatif dan \(\tan\) positif.` }], check: R`\(\left(\tfrac{12}{13}\right)^2 + \left(\tfrac{5}{13}\right)^2 = 1\) ✓`, conclusion: R`\(-\tfrac{12}{13}\); \(\tfrac{12}{5}\); \(-\tfrac{13}{12}\).` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(\sin 240^\circ = \sin 60^\circ\)`, why: R`Tanda sukuan III terlupa.`, fix: R`\(-\sin 60^\circ\).` }, { wrong: R`\(\sek\theta = \tfrac{1}{\sin\theta}\)`, why: R`Pasangan tertukar.`, fix: R`\(\sek\) dengan \(\kos\); \(\kosek\) dengan \(\sin\).` }] },
    { kind: 'summary', points: [R`\(P = (\kos\theta, \sin\theta)\); \(\tan = \tfrac{\sin}{\kos}\); salingan \(\sek, \kosek, \kot\).`, R`Sudut rujukan + tanda sukuan; sudut khas 30°, 45°, 60°.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>6.3</strong>: graf fungsi trigonometri.</p>`, links: [{ href: '#/nota/t5-6/6.3', label: '6.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 6.3
const TF = [(x) => Math.sin(x * D), (x) => Math.cos(x * D), (x) => Math.tan(x * D)];
const TN = ['\\sin', '\\kos', '\\tan'];
export const S6_3 = {
  id: '6.3', sk: '6.3', title: 'Graf Fungsi Sinus, Kosinus dan Tangen', sp: ['6.3.1', '6.3.2'], status: 'published', minutes: 55,
  sections: [
    { kind: 'intro', title: 'Gelombang di sekeliling kita', html: R`<p>Ketinggian air pasang surut, voltan arus ulang-alik dan kedudukan kerusi kincir ria berulang secara berkala. Graf sinus dan kosinus memodelkan keadaan ini.</p>` },
    { kind: 'concept', title: 'Graf y = a sin bx + c dan rakan-rakannya', sp: ['6.3.1'], html: R`
      <ul><li>\(y = \sin x\) dan \(y = \kos x\): nilai antara \(-1\) dan \(1\), kala \(360^\circ\) (\(2\pi\)).</li><li>\(y = \tan x\): kala \(180^\circ\), tak tertakrif (asimptot) pada \(90^\circ, 270^\circ, \dots\)</li></ul>
      <p>Untuk \(y = a\sin bx + c\) (atau \(\kos\)), dengan \(b > 0\):</p>
      <ul><li>\(|a|\) ialah <strong>amplitud</strong> (separuh jarak puncak ke lembah); \(a < 0\) memantulkan graf pada paksi-\(x\).</li><li>\(b\) ialah bilangan kitaran dalam \(360^\circ\): <strong>kala</strong> \(= \dfrac{360^\circ}{b}\) (untuk \(\tan\): \(\dfrac{180^\circ}{b}\)).</li><li>\(c\) menganjak graf secara menegak; nilai maksimum \(|a| + c\), minimum \(-|a| + c\).</li></ul>
      <p><strong>Fungsi nilai mutlak</strong> \(y = |a\sin bx|\): bahagian di bawah paksi-\(x\) dipantulkan ke atas, jadi kala menjadi separuh.</p>` },
    { kind: 'visual', title: 'Kesan a, b dan c', html: R`<p>Pilih fungsi dan ubah pemalar. Kelabu: graf asas.</p>`,
      spec: { type: 'plot', x: [0, 360], y: [-5, 5], gridX: 45, gridY: 1, labelStepX: 90, labelStepY: 2, params: [{ name: 'f', label: R`fungsi (0 = sin, 1 = kos, 2 = tan)`, min: 0, max: 2, step: 1, value: 0 }, { name: 'a', label: R`\(a\)`, min: -3, max: 3, step: 0.5, value: 2 }, { name: 'b', label: R`\(b\)`, min: 0.5, max: 4, step: 0.5, value: 2 }, { name: 'c', label: R`\(c\)`, min: -2, max: 2, step: 0.5, value: 1 }, { name: 'm', label: 'nilai mutlak (0 = tidak, 1 = ya)', min: 0, max: 1, step: 1, value: 0 }],
        curves: [{ f: (x, p) => nice(TF[p.f](x)), color: '#C9CED8' }, { f: (x, p) => { const v = p.a * TF[p.f](p.b * x); return nice((p.m ? Math.abs(v) : v) + p.c); }, color: '#3467D4' }],
        readout: (p, { fmt }) => { const body = `${fmt(p.a)}${TN[p.f]} ${fmt(p.b)}x`; const eq = p.m ? `|${body}|` : body; const per = (p.f === 2 ? 180 : 360) / (p.m && p.f !== 2 ? 2 * p.b : p.b); return R`\(y = ${eq} ${p.c < 0 ? '-' : '+'} ${fmt(Math.abs(p.c))}\): ${p.f === 2 ? 'tiada amplitud (tan tidak terbatas)' : `amplitud \\(${fmt(Math.abs(p.a))}\\)`}, kala \(${fmt(r3(per))}^\circ\)${p.f === 2 ? '' : `, maks \\(${fmt(p.m ? Math.abs(p.a) + p.c : Math.abs(p.a) + p.c)}\\), min \\(${fmt(p.m ? p.c : -Math.abs(p.a) + p.c)}\\)`}.`; } },
      alt: R`Graf y = a sin bx + c (atau kos, tan) bagi 0° hingga 360°, dengan graf asas kelabu. Dengan a = 2, b = 2, c = 1 (sinus): amplitud 2, dua kitaran dalam 360° (kala 180°), maksimum 3 dan minimum −1. Pilihan nilai mutlak memantulkan bahagian negatif ke atas dan mengurangkan kala kepada separuh.` },
    { kind: 'concept', title: 'Menyelesaikan persamaan dengan kaedah graf', sp: ['6.3.2'], html: R`<p>Untuk persamaan seperti \(2\kos x = 1 - \dfrac{x}{180^\circ}\), susun semula kepada \(f(x) = g(x)\) dengan \(f\) fungsi trigonometri. Lakar \(y = f(x)\) dan \(y = g(x)\) (garis lurus, \(y\) bukan pemalar) pada paksi yang sama. <strong>Bilangan titik persilangan</strong> dalam julat yang diberi ialah bilangan penyelesaian.</p>` },
    { kind: 'formula', items: [{ tex: R`y = a\sin bx + c:\ \text{amplitud } |a|,\ \text{kala } \tfrac{360^\circ}{b},\ \text{maks } |a| + c`, html: R`Sama untuk \(\kos\); \(\tan\): kala \(\tfrac{180^\circ}{b}\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.3.1'], question: R`Nyatakan amplitud, kala, nilai maksimum dan minimum bagi \(y = 3\sin 2x\) untuk \(0^\circ \le x \le 360^\circ\).`, given: R`\(a = 3\), \(b = 2\), \(c = 0\)`, find: R`ciri graf`, method: R`Baca daripada pemalar.`, steps: [{ do: R`Amplitud 3; kala \(\tfrac{360^\circ}{2} = 180^\circ\)` }, { do: R`Maks 3 (pada \(x = 45^\circ, 225^\circ\)); min \(-3\) (pada \(135^\circ, 315^\circ\))` }], check: R`Dua kitaran lengkap dalam \(360^\circ\) ✓`, conclusion: R`3; 180°; 3; −3.` },
      { level: 'sederhana', sp: ['6.3.1'], question: R`Lakar \(y = 2\kos x + 1\) bagi \(0^\circ \le x \le 360^\circ\) dan nyatakan julatnya.`, given: R`\(a = 2\), \(b = 1\), \(c = 1\)`, find: R`lakaran; julat`, method: R`Graf kos asas, regang menegak, anjak ke atas.`, steps: [{ do: R`Titik penting: \((0^\circ, 3)\), \((90^\circ, 1)\), \((180^\circ, -1)\), \((270^\circ, 1)\), \((360^\circ, 3)\)` }, { do: R`Julat: \(-1 \le y \le 3\)` }], check: R`Garis tengah \(y = 1 = c\) ✓`, conclusion: R`\(-1 \le y \le 3\).` },
      { level: 'sederhana', sp: ['6.3.1'], question: R`Huraikan graf \(y = |\sin 2x|\) bagi \(0^\circ \le x \le 360^\circ\).`, given: R`fungsi nilai mutlak`, find: R`kala; julat; bilangan "bonggol"`, method: R`Lakar \(\sin 2x\), pantulkan bahagian negatif.`, steps: [{ do: R`\(\sin 2x\): kala \(180^\circ\), dua kitaran` }, { do: R`Setiap lembah dipantul menjadi bonggol: kala \(90^\circ\), 4 bonggol` }, { do: R`Julat: \(0 \le y \le 1\)` }], check: R`Graf tidak pernah di bawah paksi-\(x\) ✓`, conclusion: R`Kala 90°, julat 0 hingga 1, 4 bonggol.` },
      { level: 'mencabar', sp: ['6.3.2'], question: R`Dengan melakar graf yang sesuai, cari bilangan penyelesaian bagi \(2\kos x = 1 - \dfrac{x}{180^\circ}\) untuk \(0^\circ \le x \le 360^\circ\).`, given: R`persamaan campuran`, find: R`bilangan penyelesaian`, method: R`Lakar \(y = 2\kos x\) dan garis \(y = 1 - \tfrac{x}{180^\circ}\).`, steps: [{ do: R`Garis: dari \((0^\circ, 1)\) ke \((360^\circ, -1)\)` }, { do: R`Lengkung kos: \(2\) di \(0^\circ\), \(-2\) di \(180^\circ\), \(2\) di \(360^\circ\)` }, { do: R`Pada \(0^\circ\), lengkung (2) di atas garis (1); pada \(180^\circ\), lengkung (−2) di bawah garis (0); pada \(360^\circ\), lengkung (2) di atas garis (−1): dua persilangan` }], check: R`Lengkung bertukar sisi dua kali ✓`, conclusion: R`2 penyelesaian.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Kala \(y = \sin 2x\) ialah \(720^\circ\).`, why: R`\(b = 2\) memampatkan graf (dua kitaran dalam \(360^\circ\)).`, fix: R`Kala \(= \tfrac{360^\circ}{b} = 180^\circ\).` }, { wrong: R`Amplitud \(y = -3\sin x\) ialah \(-3\).`, why: R`Amplitud ialah jarak, sentiasa positif.`, fix: R`\(|a| = 3\); tanda negatif memantulkan graf.` }] },
    { kind: 'summary', points: [R`\(|a|\): amplitud; \(\tfrac{360^\circ}{b}\): kala; \(c\): anjakan menegak.`, R`Nilai mutlak memantulkan bahagian negatif.`, R`Bilangan penyelesaian = bilangan persilangan graf.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>6.4</strong>: identiti asas.</p>`, links: [{ href: '#/nota/t5-6/6.4', label: '6.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 6.4
export const S6_4 = {
  id: '6.4', sk: '6.4', title: 'Identiti Asas', sp: ['6.4.1', '6.4.2'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Benar untuk setiap sudut', html: R`<p>Persamaan \(\sin x = 0.5\) benar untuk sudut tertentu sahaja. <strong>Identiti</strong> pula benar untuk <em>semua</em> sudut, seperti \(\sin^2 A + \kos^2 A = 1\). Identiti membolehkan ungkapan rumit dipermudahkan.</p>` },
    { kind: 'concept', title: 'Tiga identiti asas', sp: ['6.4.1'], html: R`
      <p>Dalam bulatan unit, titik \((\kos A, \sin A)\) berjarak 1 dari asalan. Dengan Pythagoras:</p>
      \[\sin^2 A + \kos^2 A = 1\]
      <p>Bahagi dengan \(\kos^2 A\): \(\tan^2 A + 1 = \sek^2 A\). Bahagi dengan \(\sin^2 A\): \(1 + \kot^2 A = \kosek^2 A\).</p>` },
    { kind: 'visual', title: 'Pythagoras dalam bulatan unit', html: R`<p>Ubah \(A\). Kuasa dua sisi merah dan hijau sentiasa berjumlah 1.</p>`,
      spec: { type: 'plot', equalAspect: true, x: [-1.5, 1.5], y: [-1.3, 1.3], grid: 0.5, labelStep: 1, params: [{ name: 't', label: R`\(A\) (darjah)`, min: 0, max: 360, step: 5, value: 35 }],
        polygons: [{ at: () => arc(1, 0, 360), closed: false, color: '#C9CED8' }, { at: (p) => [[0, 0], [Math.cos(p.t * D), 0], [Math.cos(p.t * D), Math.sin(p.t * D)]], color: '#3467D4' }, { at: (p) => [[Math.cos(p.t * D), 0], [Math.cos(p.t * D), Math.sin(p.t * D)]], closed: false, color: '#D9534F' }, { at: (p) => [[0, 0], [Math.cos(p.t * D), 0]], closed: false, color: '#2E9E6B' }],
        readout: (p, { fmt }) => { const s = Math.sin(p.t * D), c = Math.cos(p.t * D); return R`\(\sin^2 A + \kos^2 A = (${fmt(r4(s))})^2 + (${fmt(r4(c))})^2 = ${fmt(r4(s * s + c * c))}\).`; } },
      alt: R`Segi tiga tegak dalam bulatan unit dengan hipotenus 1, sisi menegak sin A (merah) dan sisi mengufuk kos A (hijau). Untuk sebarang A, contohnya 35° (0.5736 dan 0.8192), jumlah kuasa dua sisi ialah 1.` },
    { kind: 'concept', title: 'Membuktikan identiti', sp: ['6.4.2'], html: R`<ol><li>Mulakan dengan sebelah yang lebih rumit (selalunya kiri).</li><li>Tukar kepada \(\sin\) dan \(\kos\) jika perlu; satukan pecahan.</li><li>Gunakan identiti asas untuk menggantikan.</li><li>Tunjukkan langkah demi langkah sehingga sama dengan sebelah lagi. <strong>Jangan</strong> memindahkan sebutan merentasi tanda "=", kerana itu menganggap identiti sudah benar.</li></ol>` },
    { kind: 'formula', items: [{ tex: R`\sin^2 A + \kos^2 A = 1,\quad 1 + \tan^2 A = \sek^2 A,\quad 1 + \kot^2 A = \kosek^2 A`, html: R`Identiti asas.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.4.1'], question: R`Terbitkan \(1 + \tan^2 A = \sek^2 A\) daripada \(\sin^2 A + \kos^2 A = 1\).`, given: R`identiti pertama`, find: R`identiti kedua`, method: R`Bahagi dengan \(\kos^2 A\).`, steps: [{ do: R`\(\dfrac{\sin^2 A}{\kos^2 A} + \dfrac{\kos^2 A}{\kos^2 A} = \dfrac{1}{\kos^2 A}\)` }, { do: R`\(\tan^2 A + 1 = \sek^2 A\)` }], check: R`Sah apabila \(\kos A \ne 0\) ✓`, conclusion: R`Terbukti.` },
      { level: 'sederhana', sp: ['6.4.2'], question: R`Buktikan \(\dfrac{1 - \kos^2 x}{\sin x \kos x} = \tan x\).`, given: R`identiti`, find: R`bukti`, method: R`Guna \(1 - \kos^2 x = \sin^2 x\).`, steps: [{ do: R`Kiri \(= \dfrac{\sin^2 x}{\sin x \kos x}\)` }, { do: R`\(= \dfrac{\sin x}{\kos x} = \tan x\) = kanan` }], check: R`Cuba \(x = 30^\circ\): \(\tfrac{0.75}{0.4330} = 0.5774 = \tan 30^\circ\) ✓`, conclusion: R`Terbukti.` },
      { level: 'mencabar', sp: ['6.4.2'], question: R`Buktikan \(\sek^2 x + \kosek^2 x = \sek^2 x\,\kosek^2 x\).`, given: R`identiti`, find: R`bukti`, method: R`Tukar kepada \(\sin\), \(\kos\).`, steps: [{ do: R`Kiri \(= \dfrac{1}{\kos^2 x} + \dfrac{1}{\sin^2 x} = \dfrac{\sin^2 x + \kos^2 x}{\kos^2 x \sin^2 x}\)` }, { do: R`\(= \dfrac{1}{\kos^2 x \sin^2 x} = \sek^2 x\,\kosek^2 x\)` }], check: R`Cuba \(x = 45^\circ\): \(2 + 2 = 4 = 2 \times 2\) ✓`, conclusion: R`Terbukti.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(\sin^2 A + \kos^2 A = 1\) bermaksud \(\sin A + \kos A = 1\).`, why: R`Kuasa dua tidak boleh "dibuang".`, fix: R`Contoh lawan: \(A = 45^\circ\): \(\sin A + \kos A = 1.414\).` }] },
    { kind: 'summary', points: [R`Tiga identiti asas daripada bulatan unit.`, R`Bukti: mula dari sebelah rumit, tukar kepada \(\sin\)/\(\kos\), guna identiti.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>6.5</strong>: rumus sudut majmuk dan berganda.</p>`, links: [{ href: '#/nota/t5-6/6.5', label: '6.5 →' }] },
  ],
};

// ---------------------------------------------------------------- 6.5
export const S6_5 = {
  id: '6.5', sk: '6.5', title: 'Rumus Sudut Majmuk dan Rumus Sudut Berganda', sp: ['6.5.1', '6.5.2', '6.5.3'], status: 'published', minutes: 55,
  sections: [
    { kind: 'intro', title: 'sin 75° tanpa kalkulator', html: R`<p>\(75^\circ = 45^\circ + 30^\circ\), dan kita tahu nilai tepat bagi \(45^\circ\) dan \(30^\circ\). Tetapi \(\sin(45^\circ + 30^\circ) \ne \sin 45^\circ + \sin 30^\circ\). Rumus sudut majmuk memberi cara yang betul.</p>` },
    { kind: 'concept', title: 'Rumus sudut majmuk', sp: ['6.5.1'], html: R`
      \[\sin(A \pm B) = \sin A\kos B \pm \kos A\sin B\]
      \[\kos(A \pm B) = \kos A\kos B \mp \sin A\sin B\]
      \[\tan(A \pm B) = \frac{\tan A \pm \tan B}{1 \mp \tan A\tan B}\]
      <p>Perhatikan tanda: dalam \(\kos\), tanda <strong>bertukar</strong>. Kalkulator boleh digunakan untuk mengesahkan, contohnya \(\sin 75^\circ = 0.9659\).</p>` },
    { kind: 'concept', title: 'Rumus sudut berganda dan separuh', sp: ['6.5.2'], html: R`
      <p>Letakkan \(B = A\) dalam rumus sudut majmuk:</p>
      \[\sin 2A = 2\sin A\kos A, \qquad \tan 2A = \frac{2\tan A}{1 - \tan^2 A}\]
      \[\kos 2A = \kos^2 A - \sin^2 A = 2\kos^2 A - 1 = 1 - 2\sin^2 A\]
      <p><strong>Sudut separuh</strong> (gantikan \(A\) dengan \(\tfrac{A}{2}\)): \(\sin A = 2\sin\tfrac{A}{2}\kos\tfrac{A}{2}\), \(\kos A = 1 - 2\sin^2\tfrac{A}{2} = 2\kos^2\tfrac{A}{2} - 1\).</p>` },
    { kind: 'visual', title: 'sin 2x bukan 2 sin x', html: R`<p>Biru: \(y = \sin 2x\). Merah putus: \(y = 2\sin x\kos x\) (bertindih tepat). Kelabu: \(y = 2\sin x\). Gerakkan \(x\).</p>`,
      spec: { type: 'plot', x: [0, 360], y: [-2.3, 2.3], gridX: 45, gridY: 0.5, labelStepX: 90, labelStepY: 1, params: [{ name: 'x', label: R`\(x\) (darjah)`, min: 0, max: 360, step: 15, value: 60 }],
        curves: [{ f: (x) => 2 * Math.sin(x * D), color: '#C9CED8' }, { f: (x) => Math.sin(2 * x * D), color: '#3467D4' }, { f: (x) => 2 * Math.sin(x * D) * Math.cos(x * D), color: '#D9534F' }],
        points: [{ at: (p) => [p.x, Math.sin(2 * p.x * D)] }],
        readout: (p, { fmt }) => R`\(\sin ${fmt(2 * p.x)}^\circ = ${fmt(r4(Math.sin(2 * p.x * D)))}\); \(2\sin ${fmt(p.x)}^\circ\kos ${fmt(p.x)}^\circ = ${fmt(r4(2 * Math.sin(p.x * D) * Math.cos(p.x * D)))}\); tetapi \(2\sin ${fmt(p.x)}^\circ = ${fmt(r4(2 * Math.sin(p.x * D)))}\).` },
      alt: R`Tiga graf bagi 0° hingga 360°: y = sin 2x (biru), y = 2 sin x kos x (merah, bertindih tepat dengan biru), dan y = 2 sin x (kelabu, berbeza). Pada x = 60°: sin 120° = 0.8660 = 2 sin 60° kos 60°, tetapi 2 sin 60° = 1.7321.` },
    { kind: 'concept', title: 'Membuktikan identiti dengan rumus sudut berganda', sp: ['6.5.3'], html: R`<p>Pilih bentuk \(\kos 2A\) yang membatalkan sebutan: \(1 + \kos 2A = 2\kos^2 A\) dan \(1 - \kos 2A = 2\sin^2 A\) sangat berguna.</p>` },
    { kind: 'formula', items: [{ tex: R`\sin(A \pm B),\ \kos(A \pm B),\ \tan(A \pm B)`, html: R`Lihat rumus di atas; tanda \(\kos\) bertukar.` }, { tex: R`\sin 2A = 2\sin A\kos A,\quad \kos 2A = 2\kos^2 A - 1 = 1 - 2\sin^2 A`, html: R`\(\tan 2A = \tfrac{2\tan A}{1 - \tan^2 A}\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.5.1'], question: R`Cari nilai tepat \(\sin 75^\circ\).`, given: R`\(75^\circ = 45^\circ + 30^\circ\)`, find: R`nilai tepat`, method: R`\(\sin(A + B)\).`, steps: [{ do: R`\(\sin 45^\circ\kos 30^\circ + \kos 45^\circ\sin 30^\circ = \tfrac{\sqrt2}{2}\cdot\tfrac{\sqrt3}{2} + \tfrac{\sqrt2}{2}\cdot\tfrac12\)` }, { do: R`\(= \dfrac{\sqrt6 + \sqrt2}{4}\)` }], check: R`\(\approx 0.9659\), sama dengan kalkulator ✓`, conclusion: R`\(\tfrac{\sqrt6 + \sqrt2}{4}\).` },
      { level: 'sederhana', sp: ['6.5.1'], question: R`Diberi \(\sin A = \tfrac35\) dan \(\kos B = \tfrac{5}{13}\), \(A\) dan \(B\) tirus. Cari \(\kos(A + B)\).`, given: R`dua nisbah`, find: R`\(\kos(A + B)\)`, method: R`Cari nisbah lain dengan segi tiga, kemudian rumus.`, steps: [{ do: R`\(\kos A = \tfrac45\), \(\sin B = \tfrac{12}{13}\)` }, { do: R`\(\kos A\kos B - \sin A\sin B = \tfrac{20}{65} - \tfrac{36}{65} = -\tfrac{16}{65}\)` }], check: R`Negatif: \(A + B = 36.87^\circ + 67.38^\circ > 90^\circ\) ✓`, conclusion: R`\(-\tfrac{16}{65}\).` },
      { level: 'mencabar', sp: ['6.5.2'], question: R`Diberi \(\sin A = \tfrac35\) dengan \(A\) cakah. Cari \(\sin 2A\) dan \(\kos 2A\).`, given: R`\(A\) di sukuan II`, find: R`\(\sin 2A\), \(\kos 2A\)`, method: R`Tanda \(\kos A\), kemudian rumus berganda.`, steps: [{ do: R`\(\kos A = -\tfrac45\) (sukuan II)` }, { do: R`\(\sin 2A = 2\left(\tfrac35\right)\left(-\tfrac45\right) = -\tfrac{24}{25}\)` }, { do: R`\(\kos 2A = 1 - 2\left(\tfrac{9}{25}\right) = \tfrac{7}{25}\)` }], check: R`\(\left(\tfrac{24}{25}\right)^2 + \left(\tfrac{7}{25}\right)^2 = 1\) ✓`, conclusion: R`\(-\tfrac{24}{25}\); \(\tfrac{7}{25}\).` },
      { level: 'mencabar', sp: ['6.5.3'], question: R`Buktikan \(\dfrac{\sin 2x}{1 + \kos 2x} = \tan x\).`, given: R`identiti`, find: R`bukti`, method: R`\(1 + \kos 2x = 2\kos^2 x\).`, steps: [{ do: R`Kiri \(= \dfrac{2\sin x\kos x}{2\kos^2 x}\)` }, { do: R`\(= \dfrac{\sin x}{\kos x} = \tan x\)` }], check: R`\(x = 30^\circ\): \(\tfrac{0.8660}{1.5} = 0.5774\) ✓`, conclusion: R`Terbukti.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(\sin(A + B) = \sin A + \sin B\)`, why: R`\(\sin(30^\circ + 60^\circ) = 1\), tetapi \(0.5 + 0.866 = 1.366\).`, fix: R`Guna rumus sudut majmuk.` }, { wrong: R`\(\kos(A + B) = \kos A\kos B + \sin A\sin B\)`, why: R`Tanda dalam \(\kos\) bertukar.`, fix: R`\(\kos(A + B) = \kos A\kos B - \sin A\sin B\).` }] },
    { kind: 'summary', points: [R`Sudut majmuk: \(\sin\) kekal tanda; \(\kos\) tukar tanda.`, R`\(\sin 2A = 2\sin A\kos A\); tiga bentuk \(\kos 2A\).`, R`\(1 \pm \kos 2A\) memberi \(2\kos^2 A\) atau \(2\sin^2 A\).`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>6.6</strong>: menyelesaikan persamaan dan masalah.</p>`, links: [{ href: '#/nota/t5-6/6.6', label: '6.6 →' }] },
  ],
};

// ---------------------------------------------------------------- 6.6
export const S6_6 = {
  id: '6.6', sk: '6.6', title: 'Aplikasi Fungsi Trigonometri', sp: ['6.6.1', '6.6.2'], status: 'published', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Bilakah air pasang?', html: R`<p>Ketinggian air di sebuah jeti berubah mengikut fungsi sinus. Nelayan perlu tahu <em>bila</em> air cukup dalam untuk bot keluar. Ini memerlukan kita menyelesaikan persamaan trigonometri.</p>` },
    { kind: 'concept', title: 'Menyelesaikan persamaan trigonometri', sp: ['6.6.1'], html: R`
      <ol><li>Permudahkan kepada satu nisbah (guna identiti atau rumus sudut berganda jika perlu). Untuk persamaan kuadratik dalam \(\sin x\) atau \(\kos x\), faktorkan.</li><li>Cari sudut rujukan \(\alpha\) (positif) dengan kalkulator.</li><li>Tentukan sukuan daripada <strong>tanda</strong>, dan senaraikan <strong>semua</strong> penyelesaian dalam julat.</li><li>Untuk \(\sin 2x\), julat bagi \(2x\) ialah dua kali julat \(x\); bahagi dengan 2 di akhir.</li><li>Jangan membahagi dengan faktor yang mungkin sifar (seperti \(\kos x\)): faktorkan.</li></ol>` },
    { kind: 'visual', title: 'Penyelesaian sebagai persilangan', html: R`<p>\(y = 2\sin x\) dan garis \(y = k\). Ubah \(k\); titik persilangan ialah penyelesaian \(2\sin x = k\) bagi \(0^\circ \le x \le 360^\circ\).</p>`,
      spec: { type: 'plot', x: [0, 360], y: [-2.6, 2.6], gridX: 30, gridY: 0.5, labelStepX: 90, labelStepY: 1, params: [{ name: 'k', label: R`\(k\)`, min: -2.5, max: 2.5, step: 0.25, value: 1 }],
        curves: [{ f: (x) => 2 * Math.sin(x * D) }, { f: (x, p) => p.k, color: '#D9534F' }],
        points: [0, 1].map((i) => ({ at: (p) => { if (Math.abs(p.k) > 2) return null; const a = Math.asin(p.k / 2) / D; let sol = [a < 0 ? a + 360 : a, 180 - a].map((v) => ((v % 360) + 360) % 360); sol = [...new Set(sol.map((v) => +v.toFixed(6)))].sort((u, w) => u - w); return sol[i] === undefined ? null : [sol[i], p.k]; } })),
        readout: (p, { fmt }) => { if (Math.abs(p.k) > 2) return R`\(|k| > 2\): tiada penyelesaian, kerana \(2\sin x\) di antara \(-2\) dan \(2\).`; const a = Math.asin(p.k / 2) / D; let sol = [a < 0 ? a + 360 : a, 180 - a].map((v) => ((v % 360) + 360) % 360); sol = [...new Set(sol.map((v) => +v.toFixed(2)))].sort((u, w) => u - w); if (Math.abs(p.k) === 2) sol = [p.k > 0 ? 90 : 270]; if (p.k === 0) sol = [0, 180, 360]; return R`\(\sin x = ${fmt(p.k / 2)}\): \(x = ${sol.map((v) => `${fmt(v)}^\\circ`).join(',\\ ')}\).`; } },
      alt: R`Graf y = 2 sin x bagi 0° hingga 360° dan garis mengufuk y = k. Dengan k = 1, garis memotong lengkung di x = 30° dan 150°. Dengan k = 2, hanya satu titik sentuhan di 90°. Dengan k = 0, tiga penyelesaian: 0°, 180°, 360°. Jika |k| > 2, tiada persilangan.` },
    { kind: 'concept', title: 'Masalah melibatkan fungsi trigonometri', sp: ['6.6.2'], html: R`<p>Model berkala seperti \(h = c + a\sin(bt)^\circ\): \(c\) ialah aras purata, \(a\) amplitud, dan kala \(\tfrac{360}{b}\) unit masa. Untuk mencari bila \(h\) mencapai suatu nilai, selesaikan persamaan; untuk nilai maksimum/minimum, guna \(\sin = \pm 1\).</p>` },
    { kind: 'formula', items: [{ tex: R`\sin x = k:\ x = \alpha,\ 180^\circ - \alpha;\quad \kos x = k:\ x = \alpha,\ 360^\circ - \alpha;\quad \tan x = k:\ x = \alpha,\ 180^\circ + \alpha`, html: R`Bagi \(k > 0\), \(0^\circ \le x \le 360^\circ\); laraskan sukuan jika \(k < 0\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.6.1'], question: R`Selesaikan \(\sin x = 0.5\) bagi \(0^\circ \le x \le 360^\circ\).`, given: R`\(\sin x\) positif`, find: R`semua \(x\)`, method: R`Sukuan I dan II.`, steps: [{ do: R`\(\alpha = 30^\circ\)` }, { do: R`\(x = 30^\circ,\ 180^\circ - 30^\circ = 150^\circ\)` }], check: R`Visual dengan \(k = 1\) ✓`, conclusion: R`\(30^\circ, 150^\circ\).` },
      { level: 'sederhana', sp: ['6.6.1'], question: R`Selesaikan \(2\kos^2 x - \kos x - 1 = 0\) bagi \(0^\circ \le x \le 360^\circ\).`, given: R`kuadratik dalam \(\kos x\)`, find: R`semua \(x\)`, method: R`Faktorkan.`, steps: [{ do: R`\((2\kos x + 1)(\kos x - 1) = 0\)` }, { do: R`\(\kos x = 1\): \(x = 0^\circ, 360^\circ\)` }, { do: R`\(\kos x = -\tfrac12\): \(\alpha = 60^\circ\), sukuan II dan III: \(120^\circ, 240^\circ\)` }], check: R`\(x = 120^\circ\): \(2(0.25) + 0.5 - 1 = 0\) ✓`, conclusion: R`\(0^\circ, 120^\circ, 240^\circ, 360^\circ\).` },
      { level: 'mencabar', sp: ['6.6.1'], question: R`Selesaikan \(\sin 2x = \kos x\) bagi \(0^\circ \le x \le 360^\circ\).`, given: R`sudut berganda`, find: R`semua \(x\)`, method: R`\(\sin 2x = 2\sin x\kos x\); faktorkan (jangan bahagi dengan \(\kos x\)).`, steps: [{ do: R`\(2\sin x\kos x - \kos x = 0 \Rightarrow \kos x(2\sin x - 1) = 0\)` }, { do: R`\(\kos x = 0\): \(90^\circ, 270^\circ\)` }, { do: R`\(\sin x = \tfrac12\): \(30^\circ, 150^\circ\)`, why: R`Jika kita bahagi dengan \(\kos x\), penyelesaian 90° dan 270° hilang.` }], check: R`\(x = 270^\circ\): \(\sin 540^\circ = 0 = \kos 270^\circ\) ✓`, conclusion: R`\(30^\circ, 90^\circ, 150^\circ, 270^\circ\).` },
      { level: 'mencabar', sp: ['6.6.2'], question: R`Ketinggian air (m) di sebuah jeti diberi oleh \(h = 3 + 2\sin(30t)^\circ\), dengan \(t\) jam selepas tengah malam. (a) Cari ketinggian maksimum dan bila ia berlaku buat kali pertama. (b) Bila air mula-mula mencapai 4 m?`, given: R`model sinus`, find: R`maks; masa`, method: R`\(\sin = 1\) untuk maks; selesaikan persamaan.`, steps: [{ do: R`(a) maks \(3 + 2 = 5\) m apabila \(30t = 90 \Rightarrow t = 3\) (3:00 pagi)` }, { do: R`(b) \(3 + 2\sin 30t = 4 \Rightarrow \sin 30t = \tfrac12 \Rightarrow 30t = 30 \Rightarrow t = 1\) (1:00 pagi)` }], check: R`Kala \(\tfrac{360}{30} = 12\) jam: dua air pasang sehari ✓`, conclusion: R`5 m pada 3:00 pagi; 4 m pada 1:00 pagi.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Membahagi kedua-dua belah dengan \(\kos x\).`, why: R`Penyelesaian dengan \(\kos x = 0\) hilang.`, fix: R`Faktorkan.` }, { wrong: R`Untuk \(\sin 2x = \tfrac12\), hanya 15° dan 75°.`, why: R`\(2x\) berjulat \(0^\circ\)–\(720^\circ\): empat penyelesaian.`, fix: R`Senaraikan \(2x = 30^\circ, 150^\circ, 390^\circ, 510^\circ\), kemudian bahagi 2.` }] },
    { kind: 'summary', points: [R`Permudahkan kepada satu nisbah; faktorkan; cari \(\alpha\); senaraikan semua sukuan.`, R`Sudut berganda: luaskan julat sebelum membahagi.`, R`Model berkala: aras purata ± amplitud.`] },
    { kind: 'next', html: R`<p>Ini melengkapkan bab Teras Tingkatan 5. Bab elektif: <strong>Kinematik Gerakan Linear</strong> dan <strong>Pengaturcaraan Linear</strong>.</p>`, links: [{ href: '#/bab/t5-6', label: 'Kembali ke Bab 6' }] },
  ],
};

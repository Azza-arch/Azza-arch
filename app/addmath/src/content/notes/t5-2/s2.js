// T5 Bab 2 Pembezaan (SP 2.1.1–2.4.9). Original.
// DSKP (PDF 114–117, verified as page images): real-life situations; graphing
// calculator / dynamic geometry throughout; exploration with tables and graphs as
// the variable approaches zero FROM BOTH SIDES; notation had_{x→0} f(x); first
// principles dy/dx = had_{δx→0} δy/δx; derivative = gradient of tangent;
// d/dx(axⁿ) derived inductively (a constant, n integer); notations f'(x), dy/dx,
// d/dx( ); f vs f' graphs; chain rule (with limit-idea proof discussable);
// product and quotient rules; d²y/dx² = d/dx(dy/dx), f''(x) = d/dx(f'(x));
// turning points by (a) tangent sketch, (b) second derivative, (c) inflection;
// max/min problems (graph sketching); related rates (chain rule emphasised);
// small changes and approximation, problems limited to two variables.
const R = String.raw;
const r3 = (v) => +v.toFixed(3);
const r2 = (v) => +v.toFixed(2);

// ---------------------------------------------------------------- 2.1
export const S2_1 = {
  id: '2.1', sk: '2.1', title: 'Had dan Hubungannya dengan Pembezaan', sp: ['2.1.1', '2.1.2'], status: 'published', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Laju pada satu saat', html: R`<p>Meter laju kereta menunjukkan laju <em>pada saat itu</em>, bukan laju purata sepanjang perjalanan. Tetapi laju ialah jarak ÷ masa, dan dalam "satu saat yang tepat" masa yang berlalu ialah sifar. Bagaimana boleh membahagi dengan sifar? Jawapannya ialah idea <strong>had</strong>: kita lihat apa yang berlaku apabila selang masa <em>menghampiri</em> sifar.</p>` },
    { kind: 'prereq', title: 'Imbas kembali', html: R`<ul><li>Kecerunan garis lurus \(= \dfrac{y_2 - y_1}{x_2 - x_1}\).</li><li>Kembangan: \((x + h)^2 = x^2 + 2xh + h^2\).</li><li>Pemfaktoran dan permudahan pecahan algebra.</li></ul>` },
    { kind: 'concept', title: 'Had apabila pemboleh ubah menghampiri sifar', sp: ['2.1.1'], html: R`
      <p>Fungsi \(f(x) = \dfrac{x^2 + 5x}{x}\) <strong>tidak tertakrif</strong> pada \(x = 0\) (bahagi sifar). Tetapi kita boleh mengira nilai untuk \(x\) yang <em>sangat hampir</em> dengan 0, dari <strong>dua arah</strong>:</p>
      <table class="mini-table"><thead><tr><th>\(x\)</th><th>−0.1</th><th>−0.01</th><th>−0.001</th><th>0.001</th><th>0.01</th><th>0.1</th></tr></thead><tbody><tr><td>\(f(x)\)</td><td>4.9</td><td>4.99</td><td>4.999</td><td>5.001</td><td>5.01</td><td>5.1</td></tr></tbody></table>
      <p>Kedua-dua arah menghampiri 5. Kita tulis \(\had_{x \to 0} \dfrac{x^2 + 5x}{x} = 5\), dibaca "had bagi \(f(x)\) apabila \(x\) menghampiri 0 ialah 5".</p>
      <p><strong>Cara algebra:</strong> untuk \(x \ne 0\), \(\dfrac{x(x + 5)}{x} = x + 5\), dan \(x + 5 \to 5\). Perhatikan bahawa had wujud walaupun \(f(0)\) tidak tertakrif. Jika nilai dari kiri dan kanan berbeza, had <strong>tidak wujud</strong>.</p>` },
    { kind: 'concept', title: 'Pembezaan dengan prinsip pertama', sp: ['2.1.2'], html: R`
      <p>Ambil dua titik pada lengkung \(y = f(x)\): \(P(x, y)\) dan \(Q(x + \delta x,\ y + \delta y)\). Kecerunan perentas \(PQ\) ialah \(\dfrac{\delta y}{\delta x}\). Apabila \(Q\) menghampiri \(P\) (\(\delta x \to 0\)), perentas menjadi <strong>tangen</strong> di \(P\):</p>
      \[\frac{dy}{dx} = \had_{\delta x \to 0} \frac{\delta y}{\delta x}\]
      <p>Ini ialah <strong>terbitan pertama</strong> (atau fungsi kecerunan). Nilai \(\dfrac{dy}{dx}\) pada suatu titik ialah <strong>kecerunan tangen</strong> kepada lengkung pada titik itu.</p>
      <p><strong>Langkah prinsip pertama:</strong> (1) tulis \(y + \delta y = f(x + \delta x)\); (2) tolak untuk mendapat \(\delta y\); (3) bahagi dengan \(\delta x\); (4) ambil had \(\delta x \to 0\).</p>` },
    { kind: 'visual', title: 'Perentas menjadi tangen', html: R`<p>\(y = x^2\), \(P(1, 1)\). Ubah \(\delta x\) (positif atau negatif) dan perhatikan kecerunan perentas \(PQ\).</p>`,
      spec: { type: 'plot', x: [-1.5, 3], y: [-1, 5], params: [{ name: 'h', label: R`\(\delta x\)`, min: -1, max: 1, step: 0.05, value: 0.8 }],
        curves: [{ f: (x) => x * x }, { f: (x, p) => (p.h === 0 ? 2 * (x - 1) + 1 : (2 + p.h) * (x - 1) + 1), color: '#D9534F' }],
        points: [{ at: () => [1, 1], label: 'P' }, { at: (p) => (p.h === 0 ? null : [1 + p.h, (1 + p.h) ** 2]), label: 'Q' }],
        readout: (p, { fmt }) => (p.h === 0 ? R`\(\delta x = 0\): \(Q = P\), perentas tidak tertakrif. Had kecerunan ialah \(\dfrac{dy}{dx} = 2\), kecerunan tangen.` : R`\(\dfrac{\delta y}{\delta x} = \dfrac{(1 ${p.h < 0 ? '-' : '+'} ${fmt(Math.abs(p.h))})^2 - 1}{${p.h < 0 ? `(${fmt(p.h)})` : fmt(p.h)}} = 2 + \delta x = ${fmt(r3(2 + p.h))}\). Apabila \(\delta x \to 0\), nilai ini \(\to 2\).`) },
      alt: R`Lengkung y = x² dengan titik tetap P(1, 1) dan titik Q(1 + δx, (1 + δx)²). Garis merah ialah perentas PQ dengan kecerunan 2 + δx: 2.8 apabila δx = 0.8, 1.5 apabila δx = −0.5, dan menghampiri 2 dari kedua-dua arah apabila δx menghampiri 0. Pada had, garis itu menjadi tangen di P dengan kecerunan 2.` },
    { kind: 'formula', items: [{ tex: R`\frac{dy}{dx} = \had_{\delta x \to 0} \frac{\delta y}{\delta x} = \had_{\delta x \to 0} \frac{f(x + \delta x) - f(x)}{\delta x}`, html: R`Prinsip pertama; \(\tfrac{dy}{dx}\) ialah kecerunan tangen.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.1.1'], question: R`Cari \(\had_{x \to 0} \dfrac{x^2 + 5x}{x}\).`, given: R`fungsi tak tertakrif pada \(x = 0\)`, find: R`had`, method: R`Faktorkan dan permudahkan (untuk \(x \ne 0\)), kemudian gantikan \(x = 0\).`, steps: [{ do: R`\(\dfrac{x(x + 5)}{x} = x + 5\) untuk \(x \ne 0\)`, why: R`Pembatalan dibenarkan kerana \(x\) menghampiri 0 tetapi tidak sama dengan 0.` }, { do: R`\(\had_{x \to 0}(x + 5) = 5\)` }], check: R`Jadual: 4.999 dan 5.001 pada \(x = \mp 0.001\) ✓`, conclusion: R`5.` },
      { level: 'sederhana', sp: ['2.1.1'], question: R`Gunakan jadual untuk menganggar \(\had_{x \to 0} \dfrac{\sqrt{x + 4} - 2}{x}\), kemudian sahkan secara algebra.`, given: R`fungsi dengan punca kuasa dua`, find: R`had`, method: R`Jadual dari dua arah; kemudian darab dengan konjugat.`, steps: [{ do: R`\(x = -0.01\): 0.25016; \(x = 0.01\): 0.24984; \(x = \pm 0.001\): 0.25002, 0.24998` }, { do: R`\(\dfrac{\sqrt{x + 4} - 2}{x} \times \dfrac{\sqrt{x + 4} + 2}{\sqrt{x + 4} + 2} = \dfrac{x}{x(\sqrt{x + 4} + 2)} = \dfrac{1}{\sqrt{x + 4} + 2}\)`, why: R`\((\sqrt{x + 4} - 2)(\sqrt{x + 4} + 2) = (x + 4) - 4 = x\).` }, { do: R`Had \(= \dfrac{1}{2 + 2} = \dfrac14\)` }], check: R`Jadual dan algebra bersetuju ✓`, conclusion: R`\(\tfrac14\).` },
      { level: 'sederhana', sp: ['2.1.2'], question: R`Cari \(\dfrac{dy}{dx}\) bagi \(y = x^2\) dengan prinsip pertama.`, given: R`\(y = x^2\)`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Empat langkah prinsip pertama.`, steps: [{ do: R`\(y + \delta y = (x + \delta x)^2 = x^2 + 2x\,\delta x + (\delta x)^2\)` }, { do: R`\(\delta y = 2x\,\delta x + (\delta x)^2\)`, why: R`Tolak \(y = x^2\).` }, { do: R`\(\dfrac{\delta y}{\delta x} = 2x + \delta x\)` }, { do: R`\(\dfrac{dy}{dx} = \had_{\delta x \to 0}(2x + \delta x) = 2x\)` }], check: R`Pada \(x = 1\), kecerunan 2, sama dengan visual ✓`, conclusion: R`\(\tfrac{dy}{dx} = 2x\).` },
      { level: 'mencabar', sp: ['2.1.2'], question: R`Cari \(\dfrac{dy}{dx}\) bagi \(y = 3x^2 - 4x\) dengan prinsip pertama.`, given: R`\(y = 3x^2 - 4x\)`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Prinsip pertama.`, steps: [{ do: R`\(y + \delta y = 3(x + \delta x)^2 - 4(x + \delta x)\)` }, { do: R`\(\delta y = 6x\,\delta x + 3(\delta x)^2 - 4\,\delta x\)` }, { do: R`\(\dfrac{\delta y}{\delta x} = 6x + 3\,\delta x - 4\)` }, { do: R`\(\dfrac{dy}{dx} = 6x - 4\)` }], check: R`Sebutan dengan \(\delta x\) hilang apabila \(\delta x \to 0\) ✓`, conclusion: R`\(6x - 4\).` },
      { level: 'mencabar', sp: ['2.1.2'], question: R`Cari \(\dfrac{dy}{dx}\) bagi \(y = \dfrac{1}{x}\) dengan prinsip pertama.`, given: R`\(y = \tfrac1x\)`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Prinsip pertama dengan penyebut sepunya.`, steps: [{ do: R`\(\delta y = \dfrac{1}{x + \delta x} - \dfrac{1}{x} = \dfrac{x - (x + \delta x)}{x(x + \delta x)} = \dfrac{-\delta x}{x(x + \delta x)}\)` }, { do: R`\(\dfrac{\delta y}{\delta x} = \dfrac{-1}{x(x + \delta x)}\)` }, { do: R`\(\dfrac{dy}{dx} = -\dfrac{1}{x^2}\)` }], check: R`Kecerunan sentiasa negatif: graf \(y = \tfrac1x\) menurun pada setiap cabang ✓`, conclusion: R`\(-\tfrac{1}{x^2}\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(\had_{x \to 0} \dfrac{x^2 + 5x}{x}\) tidak wujud kerana \(f(0)\) tidak tertakrif.`, why: R`Had melihat nilai <em>berhampiran</em> 0, bukan pada 0.`, fix: R`Permudahkan dahulu, kemudian ambil had.` },
      { wrong: R`Gantikan \(\delta x = 0\) sebelum membahagi.`, why: R`Itu memberi \(\tfrac00\).`, fix: R`Bahagi dengan \(\delta x\) dahulu, kemudian ambil had.` },
    ] },
    { kind: 'summary', points: [R`Had: nilai yang dihampiri apabila \(x \to 0\) dari kedua-dua arah.`, R`\(\tfrac{dy}{dx} = \had_{\delta x \to 0} \tfrac{\delta y}{\delta x}\) (prinsip pertama).`, R`\(\tfrac{dy}{dx}\) pada suatu titik = kecerunan tangen.`] },
    { kind: 'next', html: R`<p>Prinsip pertama panjang. Seterusnya, <strong>2.2</strong>: corak yang memberi jalan pintas.</p>`, links: [{ href: '#/nota/t5-2/2.2', label: '2.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 2.2
const F = (x) => x ** 3 - 3 * x, FP = (x) => 3 * x * x - 3;
export const S2_2 = {
  id: '2.2', sk: '2.2', title: 'Pembezaan Peringkat Pertama', sp: ['2.2.1', '2.2.2', '2.2.3', '2.2.4'], status: 'published', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Jalan pintas', html: R`<p>Daripada prinsip pertama: \(\tfrac{d}{dx}(x) = 1\), \(\tfrac{d}{dx}(x^2) = 2x\), \(\tfrac{d}{dx}(x^3) = 3x^2\), \(\tfrac{d}{dx}(x^{-1}) = -x^{-2}\). Nampak coraknya? Bab ini mengubah corak itu menjadi petua yang pantas.</p>` },
    { kind: 'concept', title: 'Rumus terbitan bagi y = axⁿ', sp: ['2.2.1'], html: R`
      <p>Secara aruhan daripada corak di atas (kuasa turun menjadi pekali, dan kuasa berkurang satu):</p>
      \[\frac{d}{dx}\left(ax^n\right) = anx^{n - 1}, \quad a \text{ pemalar}, \ n \text{ integer}\]
      <p>Kes khas: \(\tfrac{d}{dx}(a) = 0\) (garis mengufuk, kecerunan sifar) dan \(\tfrac{d}{dx}(ax) = a\).</p>
      <p><strong>Tatatanda:</strong> jika \(y = f(x)\), terbitan pertama ditulis \(\dfrac{dy}{dx}\), \(f'(x)\) atau \(\dfrac{d}{dx}(f(x))\).</p>` },
    { kind: 'concept', title: 'Fungsi algebra', sp: ['2.2.2'], html: R`
      <p>Bezakan <strong>sebutan demi sebutan</strong>: \(\tfrac{d}{dx}(u \pm v) = \tfrac{du}{dx} \pm \tfrac{dv}{dx}\).</p>
      <p>Tulis semula dahulu supaya setiap sebutan berbentuk \(ax^n\): \(\dfrac{5}{x^2} = 5x^{-2}\), \(\dfrac{x^3 - 2x}{x} = x^2 - 2\), \((x + 3)^2 = x^2 + 6x + 9\).</p>
      <p>Graf \(f'(x)\) dipanggil <strong>graf fungsi kecerunan</strong>: nilainya pada setiap \(x\) ialah kecerunan graf \(f\) di situ (lihat visual).</p>` },
    { kind: 'visual', title: 'Graf f dan graf fungsi kecerunan f′', html: R`<p>Biru: \(f(x) = x^3 - 3x\). Merah: \(f'(x) = 3x^2 - 3\). Garis hijau ialah tangen di \(x = a\).</p>`,
      spec: { type: 'plot', x: [-3, 3], y: [-5, 7], params: [{ name: 'a', label: R`\(a\)`, min: -2.5, max: 2.5, step: 0.1, value: -1.5 }],
        curves: [{ f: (x) => F(x), color: '#3467D4' }, { f: (x) => FP(x), color: '#D9534F' }, { f: (x, p) => FP(p.a) * (x - p.a) + F(p.a), color: '#2E9E6B' }],
        points: [{ at: (p) => [p.a, F(p.a)], label: 'f' }, { at: (p) => [p.a, FP(p.a)], label: "f′" }],
        readout: (p, { fmt }) => { const m = FP(p.a); return R`Pada \(x = ${fmt(p.a)}\): kecerunan tangen \(= f'(${fmt(p.a)}) = ${fmt(r3(m))}\), ${Math.abs(m) < 1e-9 ? 'sifar: titik pegun' : m > 0 ? 'positif: graf f menaik' : 'negatif: graf f menurun'}.`; } },
      alt: R`Graf f(x) = x³ − 3x (biru) dan graf fungsi kecerunannya f′(x) = 3x² − 3 (merah). Tangen hijau dilukis pada x = a. Apabila a = −1.5, f′ = 3.75 (f menaik); apabila a = 0, f′ = −3 (f menurun); pada a = ±1, f′ = 0 dan graf merah memotong paksi-x, tepat di titik pusingan graf biru.` },
    { kind: 'concept', title: 'Fungsi gubahan: petua rantai', sp: ['2.2.3'], html: R`
      <p>Untuk \(y = (2x + 1)^5\), mengembangkan kuasa lima memenatkan. Biarkan \(u = 2x + 1\), jadi \(y = u^5\). Perubahan kecil dalam \(x\) mengubah \(u\), dan perubahan \(u\) mengubah \(y\): \(\dfrac{\delta y}{\delta x} = \dfrac{\delta y}{\delta u} \times \dfrac{\delta u}{\delta x}\). Ambil had:</p>
      \[\frac{dy}{dx} = \frac{dy}{du} \times \frac{du}{dx}\]
      <p>Bentuk ringkas yang kerap digunakan: \(\dfrac{d}{dx}(ax + b)^n = n(ax + b)^{n - 1} \times a\).</p>` },
    { kind: 'concept', title: 'Hasil darab dan hasil bahagi', sp: ['2.2.4'], html: R`
      <p>Jika \(u\) dan \(v\) ialah fungsi \(x\):</p>
      \[\frac{d}{dx}(uv) = u\frac{dv}{dx} + v\frac{du}{dx}, \qquad \frac{d}{dx}\left(\frac{u}{v}\right) = \frac{v\dfrac{du}{dx} - u\dfrac{dv}{dx}}{v^2}\]
      <p><strong>Awas:</strong> \(\tfrac{d}{dx}(uv) \ne \tfrac{du}{dx} \cdot \tfrac{dv}{dx}\). Contohnya \(x \cdot x = x^2\) mempunyai terbitan \(2x\), bukan \(1 \times 1 = 1\). Dalam petua hasil bahagi, tertib tolakan penting ("\(v\) du tolak \(u\) dv").</p>` },
    { kind: 'formula', items: [{ tex: R`\frac{d}{dx}(ax^n) = anx^{n - 1}`, html: R`\(n\) integer; \(\tfrac{d}{dx}(a) = 0\).` }, { tex: R`\frac{dy}{dx} = \frac{dy}{du} \times \frac{du}{dx}`, html: R`Petua rantai.` }, { tex: R`(uv)' = uv' + vu', \qquad \left(\frac uv\right)' = \frac{vu' - uv'}{v^2}`, html: R`Petua hasil darab dan hasil bahagi.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.2.1', '2.2.2'], question: R`Bezakan \(y = 4x^3 - 5x^2 + 7x - 2\).`, given: R`polinomial`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Sebutan demi sebutan.`, steps: [{ do: R`\(\tfrac{d}{dx}(4x^3) = 12x^2\), \(\tfrac{d}{dx}(-5x^2) = -10x\), \(\tfrac{d}{dx}(7x) = 7\), \(\tfrac{d}{dx}(-2) = 0\)` }, { do: R`\(\dfrac{dy}{dx} = 12x^2 - 10x + 7\)` }], check: R`Darjah turun satu (3 ke 2) ✓`, conclusion: R`\(12x^2 - 10x + 7\).` },
      { level: 'sederhana', sp: ['2.2.2'], question: R`Cari \(f'(x)\) bagi \(f(x) = \dfrac{2x^3 - 5}{x^2}\), dan nilai \(f'(1)\).`, given: R`pecahan algebra`, find: R`\(f'(x)\), \(f'(1)\)`, method: R`Pisahkan pecahan kepada sebutan \(ax^n\).`, steps: [{ do: R`\(f(x) = 2x - 5x^{-2}\)` }, { do: R`\(f'(x) = 2 + 10x^{-3} = 2 + \dfrac{10}{x^3}\)`, why: R`\(\tfrac{d}{dx}(-5x^{-2}) = (-5)(-2)x^{-3}\).` }, { do: R`\(f'(1) = 12\)` }], check: R`Petua hasil bahagi memberi hasil yang sama: \(\tfrac{x^2(6x^2) - (2x^3 - 5)(2x)}{x^4} = \tfrac{2x^4 + 10x}{x^4}\) ✓`, conclusion: R`\(f'(x) = 2 + \tfrac{10}{x^3}\); \(f'(1) = 12\).` },
      { level: 'sederhana', sp: ['2.2.3'], question: R`Bezakan \(y = (2x + 1)^5\).`, given: R`fungsi gubahan`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Petua rantai dengan \(u = 2x + 1\).`, steps: [{ do: R`\(y = u^5\), \(\dfrac{dy}{du} = 5u^4\); \(\dfrac{du}{dx} = 2\)` }, { do: R`\(\dfrac{dy}{dx} = 5u^4 \times 2 = 10(2x + 1)^4\)` }], check: R`Pada \(x = 0\): kembangan \(y \approx 1 + 10x + \dots\) memberi kecerunan 10 ✓`, conclusion: R`\(10(2x + 1)^4\).` },
      { level: 'mencabar', sp: ['2.2.3'], question: R`Bezakan \(y = \dfrac{4}{(3x - 1)^2}\).`, given: R`pecahan dengan gubahan`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Tulis sebagai \(4(3x - 1)^{-2}\), kemudian petua rantai.`, steps: [{ do: R`\(y = 4(3x - 1)^{-2}\)` }, { do: R`\(\dfrac{dy}{dx} = 4(-2)(3x - 1)^{-3}(3) = -\dfrac{24}{(3x - 1)^3}\)` }], check: R`Tanda negatif: apabila \(3x - 1\) membesar (\(x > \tfrac13\)), \(y\) mengecil ✓`, conclusion: R`\(-\tfrac{24}{(3x - 1)^3}\).` },
      { level: 'mencabar', sp: ['2.2.4'], question: R`Bezakan (a) \(y = x^2(3x - 1)^4\) dan (b) \(y = \dfrac{2x}{x + 3}\).`, given: R`hasil darab; hasil bahagi`, find: R`\(\tfrac{dy}{dx}\)`, method: R`Petua hasil darab (dengan petua rantai); petua hasil bahagi.`, steps: [{ do: R`(a) \(u = x^2\), \(v = (3x - 1)^4\); \(u' = 2x\), \(v' = 12(3x - 1)^3\)` }, { do: R`\(\dfrac{dy}{dx} = 12x^2(3x - 1)^3 + 2x(3x - 1)^4 = 2x(3x - 1)^3(9x - 1)\)`, why: R`Faktorkan \(2x(3x - 1)^3\): \(6x + (3x - 1) = 9x - 1\).` }, { do: R`(b) \(\dfrac{(x + 3)(2) - 2x(1)}{(x + 3)^2} = \dfrac{6}{(x + 3)^2}\)` }], check: R`(b) positif untuk semua \(x \ne -3\): fungsi sentiasa menaik pada setiap cabang ✓`, conclusion: R`(a) \(2x(3x - 1)^3(9x - 1)\); (b) \(\tfrac{6}{(x + 3)^2}\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(\tfrac{d}{dx}(2x + 1)^5 = 5(2x + 1)^4\)`, why: R`Terlupa mendarab dengan terbitan bahagian dalam.`, fix: R`Petua rantai: \(\times 2\).` },
      { wrong: R`\(\tfrac{d}{dx}\left(\tfrac{5}{x^2}\right) = \tfrac{5}{2x}\)`, why: R`Tidak boleh membezakan penyebut secara berasingan.`, fix: R`\(5x^{-2} \Rightarrow -10x^{-3}\).` },
      { wrong: R`\(\tfrac{d}{dx}(uv) = u'v'\)`, why: R`Contoh lawan: \(x \cdot x\).`, fix: R`\(uv' + vu'\).` },
    ] },
    { kind: 'summary', points: [R`\(\tfrac{d}{dx}(ax^n) = anx^{n - 1}\); bezakan sebutan demi sebutan.`, R`Petua rantai: \(\tfrac{dy}{dx} = \tfrac{dy}{du}\cdot\tfrac{du}{dx}\).`, R`\((uv)' = uv' + vu'\); \(\left(\tfrac uv\right)' = \tfrac{vu' - uv'}{v^2}\).`] },
    { kind: 'next', html: R`<p>Terbitan juga boleh dibezakan sekali lagi. Seterusnya, <strong>2.3</strong>.</p>`, links: [{ href: '#/nota/t5-2/2.3', label: '2.3 →' }] },
  ],
};

// ---------------------------------------------------------------- 2.3
const G = (x) => x ** 3 - 3 * x * x + 2, GP = (x) => 3 * x * x - 6 * x, GPP = (x) => 6 * x - 6;
export const S2_3 = {
  id: '2.3', sk: '2.3', title: 'Pembezaan Peringkat Kedua', sp: ['2.3.1'], status: 'published', minutes: 30,
  sections: [
    { kind: 'intro', title: 'Perubahan kepada perubahan', html: R`<p>Laju memberitahu betapa cepat kedudukan berubah. <strong>Pecutan</strong> memberitahu betapa cepat <em>laju</em> berubah. Dalam matematik, ini ialah terbitan kepada terbitan, iaitu <strong>terbitan kedua</strong>.</p>` },
    { kind: 'concept', title: 'Terbitan kedua', sp: ['2.3.1'], html: R`
      <p>Bezakan \(\dfrac{dy}{dx}\) sekali lagi:</p>
      \[\frac{d^2y}{dx^2} = \frac{d}{dx}\left(\frac{dy}{dx}\right), \qquad f''(x) = \frac{d}{dx}\big(f'(x)\big)\]
      <p>\(\dfrac{d^2y}{dx^2}\) mengukur kadar perubahan <em>kecerunan</em>. Jika positif, kecerunan sedang bertambah (graf melengkung ke atas, seperti cawan). Jika negatif, kecerunan sedang berkurang (melengkung ke bawah). Perhatikan: \(\dfrac{d^2y}{dx^2}\) <strong>bukan</strong> \(\left(\dfrac{dy}{dx}\right)^2\).</p>` },
    { kind: 'visual', title: 'Kecerunan yang berubah', html: R`<p>\(f(x) = x^3 - 3x^2 + 2\). Gerakkan titik dan bandingkan \(f'\) (kecerunan) dengan \(f''\) (perubahan kecerunan).</p>`,
      spec: { type: 'plot', x: [-1.5, 3.5], y: [-3, 4], params: [{ name: 'a', label: R`\(x\)`, min: -1, max: 3, step: 0.1, value: -0.5 }],
        curves: [{ f: (x) => G(x), color: '#3467D4' }, { f: (x, p) => GP(p.a) * (x - p.a) + G(p.a), color: '#2E9E6B' }],
        points: [{ at: (p) => [p.a, G(p.a)], label: 'P' }],
        readout: (p, { fmt }) => R`\(f'(${fmt(p.a)}) = ${fmt(r3(GP(p.a)))}\), \(f''(${fmt(p.a)}) = ${fmt(r3(GPP(p.a)))}\): ${GPP(p.a) > 1e-9 ? 'kecerunan sedang bertambah (melengkung ke atas)' : GPP(p.a) < -1e-9 ? 'kecerunan sedang berkurang (melengkung ke bawah)' : 'kelengkungan bertukar arah di sini'}.` },
      alt: R`Graf f(x) = x³ − 3x² + 2 dengan tangen di titik P. Untuk x < 1, f″(x) = 6x − 6 negatif dan graf melengkung ke bawah; untuk x > 1, f″ positif dan graf melengkung ke atas. Pada x = 1, f″ = 0 dan kelengkungan bertukar.` },
    { kind: 'formula', items: [{ tex: R`\frac{d^2y}{dx^2} = \frac{d}{dx}\left(\frac{dy}{dx}\right)`, html: R`Juga \(f''(x)\). Bukan \(\left(\tfrac{dy}{dx}\right)^2\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.3.1'], question: R`Cari \(\dfrac{d^2y}{dx^2}\) bagi \(y = 2x^4 - 3x^2 + x\).`, given: R`polinomial`, find: R`terbitan kedua`, method: R`Bezakan dua kali.`, steps: [{ do: R`\(\dfrac{dy}{dx} = 8x^3 - 6x + 1\)` }, { do: R`\(\dfrac{d^2y}{dx^2} = 24x^2 - 6\)` }], check: R`Darjah turun dua (4 ke 2) ✓`, conclusion: R`\(24x^2 - 6\).` },
      { level: 'sederhana', sp: ['2.3.1'], question: R`Diberi \(f(x) = (3x - 2)^4\), cari \(f''(1)\).`, given: R`fungsi gubahan`, find: R`\(f''(1)\)`, method: R`Petua rantai dua kali.`, steps: [{ do: R`\(f'(x) = 4(3x - 2)^3(3) = 12(3x - 2)^3\)` }, { do: R`\(f''(x) = 36(3x - 2)^2(3) = 108(3x - 2)^2\)` }, { do: R`\(f''(1) = 108\)` }], check: R`\(f'' \ge 0\) sentiasa: graf berbentuk "cawan" ✓`, conclusion: R`108.` },
      { level: 'mencabar', sp: ['2.3.1'], question: R`Diberi \(y = \dfrac{1}{x}\), tunjukkan bahawa \(x\dfrac{d^2y}{dx^2} + 2\dfrac{dy}{dx} = 0\).`, given: R`\(y = x^{-1}\)`, find: R`bukti`, method: R`Cari kedua-dua terbitan, gantikan.`, steps: [{ do: R`\(\dfrac{dy}{dx} = -x^{-2}\), \(\dfrac{d^2y}{dx^2} = 2x^{-3}\)` }, { do: R`\(x(2x^{-3}) + 2(-x^{-2}) = 2x^{-2} - 2x^{-2} = 0\)` }], check: R`Cuba \(x = 2\): \(2 \cdot \tfrac14 + 2(-\tfrac14) = 0\) ✓`, conclusion: R`Terbukti.` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`\(\dfrac{d^2y}{dx^2} = \left(\dfrac{dy}{dx}\right)^2\)`, why: R`Terbitan kedua ialah membezakan semula, bukan kuasa dua.`, fix: R`Bezakan \(\tfrac{dy}{dx}\) sekali lagi.` }] },
    { kind: 'summary', points: [R`\(\tfrac{d^2y}{dx^2} = \tfrac{d}{dx}\left(\tfrac{dy}{dx}\right)\), \(f''(x) = \tfrac{d}{dx}(f'(x))\).`, R`Positif: kecerunan bertambah; negatif: berkurang.`] },
    { kind: 'next', html: R`<p>Seterusnya, <strong>2.4</strong>: menggunakan terbitan untuk tangen, titik pusingan, pengoptimuman dan kadar perubahan.</p>`, links: [{ href: '#/nota/t5-2/2.4', label: '2.4 →' }] },
  ],
};

// ---------------------------------------------------------------- 2.4
const BOX = (x) => x * (20 - 2 * x) ** 2;
export const S2_4 = {
  id: '2.4', sk: '2.4', title: 'Aplikasi Pembezaan', sp: ['2.4.1', '2.4.2', '2.4.3', '2.4.4', '2.4.5', '2.4.6', '2.4.7', '2.4.8', '2.4.9'], status: 'published', minutes: 90,
  sections: [
    { kind: 'intro', title: 'Kotak terbesar', html: R`<p>Daripada sekeping kadbod 20 cm × 20 cm, potong segi empat sama di setiap bucu dan lipat menjadi kotak tanpa penutup. Jika potongan terlalu kecil, kotak cetek; terlalu besar, tapaknya kecil. Saiz potongan manakah memberi isi padu terbesar? Pembezaan menjawab soalan seperti ini, dan juga soalan tentang tangen, kadar perubahan dan anggaran.</p>` },
    { kind: 'concept', title: 'Kecerunan tangen pada titik berlainan', sp: ['2.4.1'], html: R`
      <ul><li>\(\dfrac{dy}{dx} > 0\): graf <strong>menaik</strong> pada titik itu.</li><li>\(\dfrac{dy}{dx} < 0\): graf <strong>menurun</strong>.</li><li>\(\dfrac{dy}{dx} = 0\): tangen mengufuk; titik itu ialah <strong>titik pegun</strong>.</li></ul>
      <p>Saiz \(\left|\dfrac{dy}{dx}\right|\) menunjukkan kecuraman.</p>` },
    { kind: 'concept', title: 'Persamaan tangen dan normal', sp: ['2.4.2', '2.4.3'], html: R`
      <p>Pada titik \((x_1, y_1)\) dengan kecerunan tangen \(m = \dfrac{dy}{dx}\Big|_{x = x_1}\):</p>
      <ul><li><strong>Tangen:</strong> \(y - y_1 = m(x - x_1)\).</li><li><strong>Normal</strong> (serenjang dengan tangen): kecerunan \(-\dfrac1m\), jadi \(y - y_1 = -\dfrac1m(x - x_1)\). Jika \(m = 0\), normal ialah garis mencancang \(x = x_1\).</li></ul>
      <p>Masalah lazim: cari titik dengan kecerunan tertentu (selesaikan \(\tfrac{dy}{dx} = m\)), atau cari titik persilangan tangen/normal dengan paksi.</p>` },
    { kind: 'concept', title: 'Titik pusingan dan sifatnya', sp: ['2.4.4'], html: R`
      <p>Selesaikan \(\dfrac{dy}{dx} = 0\) untuk titik pegun, kemudian tentukan sifatnya:</p>
      <p><strong>(a) Kaedah lakaran tangen</strong> (tanda \(\tfrac{dy}{dx}\) sebelum dan selepas):</p>
      <table class="mini-table"><thead><tr><th>Sebelum</th><th>Pada titik</th><th>Selepas</th><th>Sifat</th></tr></thead><tbody>
        <tr><td>+ ( / )</td><td>0 ( — )</td><td>− ( \ )</td><td>maksimum</td></tr>
        <tr><td>− ( \ )</td><td>0 ( — )</td><td>+ ( / )</td><td>minimum</td></tr>
        <tr><td>sama tanda</td><td>0</td><td>sama tanda</td><td>titik lengkuk balas pegun</td></tr>
      </tbody></table>
      <p><strong>(b) Kaedah terbitan kedua:</strong> \(\dfrac{d^2y}{dx^2} < 0\): maksimum; \(\dfrac{d^2y}{dx^2} > 0\): minimum; \(\dfrac{d^2y}{dx^2} = 0\): <em>tidak dapat ditentukan</em>, guna kaedah (a).</p>
      <p><strong>(c) Titik lengkuk balas:</strong> titik di mana kelengkungan bertukar arah, iaitu \(\dfrac{d^2y}{dx^2}\) bertukar tanda. Contohnya \(y = x^3\) pada \(x = 0\): \(\tfrac{dy}{dx} = 3x^2 \ge 0\) di kedua-dua belah, jadi bukan maksimum atau minimum.</p>` },
    { kind: 'visual', title: 'Isi padu kotak', html: R`<p>\(V = x(20 - 2x)^2\), dengan \(x\) = sisi segi empat sama yang dipotong (cm). Ubah \(x\).</p>`,
      spec: { type: 'plot', x: [0, 10], y: [0, 700], gridX: 1, gridY: 100, labelStepX: 2, labelStepY: 100, xLabel: 'x', yLabel: 'V', params: [{ name: 'x', label: R`\(x\) (cm)`, min: 0.5, max: 9.5, step: 0.5, value: 2 }],
        curves: [{ f: (x) => BOX(x), domain: [0, 10] }, { f: (x, p) => (12 * p.x * p.x - 160 * p.x + 400) * (x - p.x) + BOX(p.x), color: '#2E9E6B' }],
        points: [{ at: (p) => [p.x, BOX(p.x)], label: 'V' }, { at: () => [10 / 3, BOX(10 / 3)], label: 'maks' }],
        readout: (p, { fmt }) => { const d = 12 * p.x * p.x - 160 * p.x + 400; return R`\(V = ${fmt(r2(BOX(p.x)))}\) cm³; \(\dfrac{dV}{dx} = 12x^2 - 160x + 400 = ${fmt(r2(d))}\) (${d > 0 ? 'menaik' : 'menurun'}). Maksimum pada \(x = \tfrac{10}{3}\), \(V = 592.59\).`; } },
      alt: R`Graf V = x(20 − 2x)² bagi 0 ≤ x ≤ 10, dengan tangen hijau pada x yang dipilih. Graf naik dari 0, mencapai puncak V ≈ 592.59 cm³ pada x = 10/3 ≈ 3.33 cm (dV/dx = 0), kemudian turun ke 0 pada x = 10 (titik pegun minimum). Dengan x = 2, V = 512 dan dV/dx = 128 (menaik).` },
    { kind: 'concept', title: 'Masalah nilai maksimum dan minimum', sp: ['2.4.5'], html: R`
      <ol><li>Tulis kuantiti yang hendak dioptimumkan sebagai fungsi <strong>satu</strong> pemboleh ubah (guna kekangan untuk menghapuskan yang lain).</li><li>Bezakan dan selesaikan \(\tfrac{dy}{dx} = 0\).</li><li>Sahkan maksimum/minimum (terbitan kedua atau tanda).</li><li>Semak bahawa jawapan berada dalam julat yang munasabah, dan tafsir dalam konteks.</li></ol>` },
    { kind: 'concept', title: 'Kadar perubahan bagi kuantiti yang terhubung', sp: ['2.4.6', '2.4.7'], html: R`
      <p>Jika \(y\) bergantung pada \(x\), dan \(x\) berubah dengan masa \(t\), maka dengan <strong>petua rantai</strong>:</p>
      \[\frac{dy}{dt} = \frac{dy}{dx} \times \frac{dx}{dt}\]
      <p>Contoh: jejari belon bertambah 0.5 cm/s. Isi padu, luas permukaan dan lilitan semua berubah, masing-masing pada kadar yang berbeza. Kadar positif bermaksud bertambah; negatif bermaksud berkurang.</p>` },
    { kind: 'concept', title: 'Perubahan kecil dan penghampiran', sp: ['2.4.8', '2.4.9'], html: R`
      <p>Untuk perubahan kecil \(\delta x\), \(\dfrac{\delta y}{\delta x} \approx \dfrac{dy}{dx}\), jadi</p>
      \[\delta y \approx \frac{dy}{dx} \times \delta x, \qquad y_{\text{baharu}} \approx y + \delta y\]
      <p>Ini menggunakan tangen sebagai anggaran lengkung berhampiran titik itu. Semakin kecil \(\delta x\), semakin tepat anggaran. Perubahan peratus \(\approx \dfrac{\delta y}{y} \times 100\%\).</p>` },
    { kind: 'formula', items: [{ tex: R`y - y_1 = m(x - x_1), \quad m_{\text{normal}} = -\frac1m`, html: R`Tangen dan normal.` }, { tex: R`\frac{dy}{dx} = 0;\ \frac{d^2y}{dx^2} < 0 \Rightarrow \text{maks},\ > 0 \Rightarrow \text{min}`, html: R`Titik pusingan.` }, { tex: R`\frac{dy}{dt} = \frac{dy}{dx}\cdot\frac{dx}{dt}, \qquad \delta y \approx \frac{dy}{dx}\,\delta x`, html: R`Kadar perubahan terhubung; perubahan kecil.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.4.1'], question: R`Bagi \(y = x^2 - 4x\), tentukan sama ada graf menaik atau menurun pada \(x = 1\) dan \(x = 3\).`, given: R`\(y = x^2 - 4x\)`, find: R`kelakuan graf`, method: R`Tanda \(\tfrac{dy}{dx}\).`, steps: [{ do: R`\(\dfrac{dy}{dx} = 2x - 4\)` }, { do: R`\(x = 1\): \(-2 < 0\), menurun; \(x = 3\): \(2 > 0\), menaik` }], check: R`Bucu parabola pada \(x = 2\), di antara kedua-dua titik ✓`, conclusion: R`Menurun pada \(x = 1\); menaik pada \(x = 3\).` },
      { level: 'sederhana', sp: ['2.4.2'], question: R`Cari persamaan tangen dan normal kepada \(y = x^3 - 2x + 1\) pada titik \(x = 1\).`, given: R`lengkung dan \(x = 1\)`, find: R`tangen dan normal`, method: R`Cari titik, kecerunan, kemudian bentuk titik-kecerunan.`, steps: [{ do: R`\(y = 1 - 2 + 1 = 0\); titik \((1, 0)\)` }, { do: R`\(\dfrac{dy}{dx} = 3x^2 - 2 = 1\) pada \(x = 1\)` }, { do: R`Tangen: \(y = x - 1\)` }, { do: R`Normal: kecerunan \(-1\), \(y = -x + 1\)` }], check: R`Hasil darab kecerunan \(1 \times (-1) = -1\) (serenjang) ✓`, conclusion: R`Tangen \(y = x - 1\); normal \(y = -x + 1\).` },
      { level: 'sederhana', sp: ['2.4.3'], question: R`Cari koordinat titik pada \(y = x^2 - 6x + 5\) di mana tangen selari dengan garis \(y = 2x + 7\).`, given: R`kecerunan tangen = 2`, find: R`titik`, method: R`Selesaikan \(\tfrac{dy}{dx} = 2\).`, steps: [{ do: R`\(2x - 6 = 2 \Rightarrow x = 4\)` }, { do: R`\(y = 16 - 24 + 5 = -3\)` }], check: R`Garis selari mempunyai kecerunan yang sama ✓`, conclusion: R`\((4, -3)\).` },
      { level: 'sederhana', sp: ['2.4.4'], question: R`Cari titik pusingan \(y = x^3 - 3x\) dan tentukan sifatnya.`, given: R`kubik`, find: R`titik pusingan dan sifat`, method: R`\(\tfrac{dy}{dx} = 0\); terbitan kedua.`, steps: [{ do: R`\(3x^2 - 3 = 0 \Rightarrow x = \pm 1\)` }, { do: R`\(\dfrac{d^2y}{dx^2} = 6x\)` }, { do: R`\(x = -1\): \(-6 < 0\), maksimum \((-1, 2)\)` }, { do: R`\(x = 1\): \(6 > 0\), minimum \((1, -2)\)` }], check: R`Kaedah lakaran tangen pada \(x = 0\): \(\tfrac{dy}{dx} = -3\), menurun di antara kedua-dua titik ✓`, conclusion: R`Maksimum \((-1, 2)\); minimum \((1, -2)\).` },
      { level: 'mencabar', sp: ['2.4.4'], question: R`Tunjukkan bahawa \(y = x^4\) mempunyai minimum pada \((0, 0)\) walaupun \(\dfrac{d^2y}{dx^2} = 0\) di situ, dan bandingkan dengan \(y = x^3\).`, given: R`\(x^4\) dan \(x^3\)`, find: R`sifat titik pegun pada \(x = 0\)`, method: R`Terbitan kedua gagal; guna lakaran tangen.`, steps: [{ do: R`\(y = x^4\): \(\tfrac{dy}{dx} = 4x^3\), \(\tfrac{d^2y}{dx^2} = 12x^2 = 0\) pada 0: tidak dapat ditentukan` }, { do: R`Tanda \(4x^3\): negatif bagi \(x < 0\), positif bagi \(x > 0\): <strong>minimum</strong>` }, { do: R`\(y = x^3\): \(3x^2 \ge 0\) di kedua-dua belah: <strong>titik lengkuk balas</strong> (pegun)` }], check: R`\(x^4 \ge 0\) untuk semua \(x\), jadi \((0, 0)\) memang terendah ✓`, conclusion: R`\(x^4\): minimum; \(x^3\): titik lengkuk balas.` },
      { level: 'mencabar', sp: ['2.4.5'], question: R`Kotak dalam pengenalan: \(V = x(20 - 2x)^2\). Cari \(x\) yang memberi isi padu maksimum dan nilai maksimum itu.`, given: R`\(V(x)\), \(0 < x < 10\)`, find: R`\(x\), \(V_{\text{maks}}\)`, method: R`\(\tfrac{dV}{dx} = 0\) dan terbitan kedua.`, steps: [{ do: R`\(V = 400x - 80x^2 + 4x^3\)` }, { do: R`\(\dfrac{dV}{dx} = 400 - 160x + 12x^2 = 4(3x - 10)(x - 10) = 0\)` }, { do: R`\(x = \tfrac{10}{3}\) (kerana \(x = 10\) memberi \(V = 0\))`, why: R`\(x = 10\) bermaksud tapak kotak lebar 0; tidak bermakna.` }, { do: R`\(\dfrac{d^2V}{dx^2} = 24x - 160 = -80 < 0\) pada \(x = \tfrac{10}{3}\): maksimum` }, { do: R`\(V = \tfrac{10}{3}\left(\tfrac{40}{3}\right)^2 = \tfrac{16\,000}{27} = 592.59\) cm³` }], check: R`Sepadan dengan puncak dalam visual ✓`, conclusion: R`\(x = 3\tfrac13\) cm; \(V \approx 592.59\) cm³.` },
      { level: 'sederhana', sp: ['2.4.6'], question: R`Jejari bulatan bertambah pada kadar 0.5 cm/s. Cari kadar pertambahan luas apabila jejari 4 cm.`, given: R`\(\tfrac{dj}{dt} = 0.5\), \(j = 4\)`, find: R`\(\tfrac{dL}{dt}\)`, method: R`\(\tfrac{dL}{dt} = \tfrac{dL}{dj} \times \tfrac{dj}{dt}\).`, steps: [{ do: R`\(L = \pi j^2\), \(\dfrac{dL}{dj} = 2\pi j = 8\pi\)` }, { do: R`\(\dfrac{dL}{dt} = 8\pi \times 0.5 = 4\pi = 12.566\) cm²/s` }], check: R`Unit: cm × cm/s = cm²/s ✓`, conclusion: R`\(4\pi \approx 12.566\) cm²/s.` },
      { level: 'mencabar', sp: ['2.4.7'], question: R`Udara dipam ke dalam belon sfera pada kadar 20 cm³/s. Cari kadar pertambahan jejari apabila jejari 5 cm, dan tafsir.`, given: R`\(\tfrac{dV}{dt} = 20\), \(j = 5\)`, find: R`\(\tfrac{dj}{dt}\)`, method: R`\(\tfrac{dV}{dt} = \tfrac{dV}{dj} \times \tfrac{dj}{dt}\), selesaikan untuk \(\tfrac{dj}{dt}\).`, steps: [{ do: R`\(V = \tfrac43\pi j^3\), \(\dfrac{dV}{dj} = 4\pi j^2 = 100\pi\)` }, { do: R`\(20 = 100\pi \times \dfrac{dj}{dt} \Rightarrow \dfrac{dj}{dt} = \dfrac{1}{5\pi} = 0.0637\) cm/s` }], check: R`Apabila belon lebih besar, \(4\pi j^2\) lebih besar, jadi jejari bertambah lebih perlahan ✓`, conclusion: R`Kira-kira 0.0637 cm/s; jejari membesar semakin perlahan walaupun udara dipam pada kadar tetap.` },
      { level: 'sederhana', sp: ['2.4.8'], question: R`Diberi \(y = x^3\), anggarkan nilai \(2.01^3\) menggunakan pembezaan.`, given: R`\(x = 2\), \(\delta x = 0.01\)`, find: R`anggaran`, method: R`\(\delta y \approx \tfrac{dy}{dx}\delta x\).`, steps: [{ do: R`\(\dfrac{dy}{dx} = 3x^2 = 12\) pada \(x = 2\)` }, { do: R`\(\delta y \approx 12 \times 0.01 = 0.12\)` }, { do: R`\(2.01^3 \approx 8 + 0.12 = 8.12\)` }], check: R`Nilai sebenar 8.120601; ralat hanya 0.0006 ✓`, conclusion: R`8.12.` },
      { level: 'mencabar', sp: ['2.4.9'], question: R`Jejari sfera bertambah dari 5 cm kepada 5.02 cm. Anggarkan pertambahan isi padu.`, given: R`\(j = 5\), \(\delta j = 0.02\)`, find: R`\(\delta V\)`, method: R`\(\delta V \approx \tfrac{dV}{dj}\delta j\).`, steps: [{ do: R`\(\dfrac{dV}{dj} = 4\pi j^2 = 100\pi\)` }, { do: R`\(\delta V \approx 100\pi \times 0.02 = 2\pi = 6.283\) cm³` }], check: R`Nilai sebenar \(\tfrac43\pi(5.02^3 - 5^3) = 6.308\); anggaran hampir ✓`, conclusion: R`Kira-kira \(2\pi \approx 6.283\) cm³.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Kecerunan normal \(= \tfrac1m\).`, why: R`Garis serenjang: hasil darab kecerunan \(= -1\).`, fix: R`\(-\tfrac1m\).` },
      { wrong: R`\(\tfrac{d^2y}{dx^2} = 0 \Rightarrow\) titik lengkuk balas.`, why: R`\(y = x^4\) ialah contoh lawan (minimum).`, fix: R`Semak perubahan tanda.` },
      { wrong: R`Dalam kadar perubahan, gantikan \(j = 5\) sebelum membezakan.`, why: R`Pemalar mempunyai terbitan sifar.`, fix: R`Bezakan dahulu, gantikan kemudian.` },
    ] },
    { kind: 'summary', points: [R`Tangen \(y - y_1 = m(x - x_1)\); normal kecerunan \(-\tfrac1m\).`, R`Titik pegun: \(\tfrac{dy}{dx} = 0\); sifat dengan tanda \(\tfrac{dy}{dx}\) atau \(\tfrac{d^2y}{dx^2}\).`, R`\(\tfrac{dy}{dt} = \tfrac{dy}{dx}\tfrac{dx}{dt}\); \(\delta y \approx \tfrac{dy}{dx}\delta x\).`] },
    { kind: 'next', html: R`<p>Pembezaan mempunyai songsangnya: <strong>Pengamiran</strong> (Bab 3).</p>`, links: [{ href: '#/bab/t5-2', label: 'Kembali ke Bab 2' }] },
  ],
};

// Bab 1 · 1.3 Fungsi Songsang (SP 1.3.1–1.3.3). Original content.
// DSKP scope: single functions only; symbol f⁻¹; only one-to-one functions
// have inverses; f and g inverse iff fg(x) = x and gf(x) = x; domain f =
// range g and vice versa; graph reflected in y = x; (a, b) on f ⇔ (b, a) on
// f⁻¹; horizontal line test; algebraic functions only; ff⁻¹(x) = f⁻¹f(x) = x.
const R = String.raw;

export const S1_3 = {
  id: '1.3', sk: '1.3', title: 'Fungsi Songsang', sp: ['1.3.1', '1.3.2', '1.3.3'], status: 'published', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Kod rahsia dan cara membukanya', html: R`
      <p>Aina menghantar nombor rahsia kepada kawannya menggunakan peraturan "darab 3, kemudian tambah 2". Nombor 5 dihantar sebagai \(3(5) + 2 = 17\).</p>
      <p>Untuk membaca mesej, kawannya perlu <strong>membalikkan</strong> langkah, dengan susunan terbalik: "tolak 2, kemudian bahagi 3". Jadi \((17 - 2) \div 3 = 5\).</p>
      <p>Peraturan yang membatalkan peraturan asal dipanggil <strong>fungsi songsang</strong>. Jika \(f(x) = 3x + 2\), songsangannya ialah \(f^{-1}(x) = \dfrac{x - 2}{3}\).</p>` },
    { kind: 'prereq', title: 'Menjadikan x sebagai perkara rumus', html: R`
      <p>Untuk mencari songsang, kita perlu menyusun semula persamaan. Lakukan operasi yang sama pada <strong>kedua-dua belah</strong>, mengikut susunan terbalik daripada operasi asal.</p>
      <p>Contoh: \(y = \dfrac{x + 5}{3}\). Darab dengan 3: \(3y = x + 5\). Tolak 5: \(x = 3y - 5\).</p>` },
    { kind: 'concept', title: 'Maksud songsangan', sp: ['1.3.1'], html: R`
      <p>Jika \(f\) menghantar objek \(a\) kepada imej \(b\), maka songsangannya \(f^{-1}\) menghantar \(b\) kembali kepada \(a\):</p>
      \[f(a) = b \iff f^{-1}(b) = a\]
      <p>Contoh: \(f(x) = 2x + 3\) memberi \(f(4) = 11\), jadi \(f^{-1}(11) = 4\), walaupun kita belum mencari rumus \(f^{-1}\).</p>
      <div class="callout is-warn"><p>\(f^{-1}(x)\) <strong>bukan</strong> \(\dfrac{1}{f(x)}\). Simbol \(-1\) di sini bermaksud "songsang", bukan kuasa negatif.</p></div>` },
    { kind: 'concept', title: 'Bilakah fungsi songsang wujud?', sp: ['1.3.2'], html: R`
      <p>Hanya fungsi <strong>satu kepada satu</strong> mempunyai fungsi songsang. Untuk \(f(x) = x^2\), kita ada \(f(-3) = 9\) dan \(f(3) = 9\). Jika kita cuba membalikkan dari 9, kita tidak tahu sama ada hendak kembali ke \(-3\) atau \(3\). Satu input mempunyai dua output, dan itu bukan fungsi.</p>
      <p><strong>Ujian garis mengufuk:</strong> jika suatu garis mengufuk \(y = k\) memotong graf \(f\) lebih daripada sekali, maka \(f\) tidak mempunyai fungsi songsang (pada domain itu).</p>` },
    { kind: 'visual', title: 'Ujian garis mengufuk', html: R`<p>Graf \(f(x) = x^2 - 1\). Gerakkan garis mengufuk. Kemudian hadkan domain kepada \(x \geq 0\) dan lihat perbezaannya.</p>`,
      spec: { type: 'plot', x: [-4, 4], y: [-2, 7], params: [{ name: 'k', label: R`\(k\) (garis \(y = k\))`, min: -1.5, max: 6, step: 0.5, value: 3 }, { name: 'h', label: 'Hadkan domain kepada x ≥ 0 (0 = tidak, 1 = ya)', min: 0, max: 1, step: 1, value: 0 }],
        curves: [{ f: (x) => x * x - 1, domain: (p) => (p.h ? [0, 4] : [-4, 4]) }], hline: 'k',
        readout: (p, { fmt }) => { const n = p.k < -1 ? 0 : p.k === -1 ? 1 : (p.h ? 1 : 2); return R`Garis \(y = ${fmt(p.k)}\) memotong graf <strong>${n} kali</strong>. ${p.h ? 'Dengan domain x ≥ 0, setiap garis memotong paling banyak sekali, jadi f mempunyai songsang.' : (n === 2 ? 'Dua persilangan: f tidak satu kepada satu, jadi tiada songsang pada semua nombor nyata.' : '')}`; } },
      alt: R`Graf parabola y = x² − 1. Garis mengufuk y = 3 memotongnya di x = −2 dan x = 2, jadi fungsi ini tidak satu kepada satu dan tidak mempunyai songsang pada semua nombor nyata. Jika domain dihadkan kepada x ≥ 0, hanya cabang kanan tinggal, dan setiap garis mengufuk memotongnya paling banyak sekali.` },
    { kind: 'concept', title: 'Sifat-sifat fungsi songsang', sp: ['1.3.2'], html: R`
      <p>Jika \(f\) dan \(g\) ialah fungsi songsang antara satu sama lain:</p>
      <ul>
        <li>\(fg(x) = x\) bagi \(x\) dalam domain \(g\), dan \(gf(x) = x\) bagi \(x\) dalam domain \(f\). Sebaliknya, jika kedua-dua syarat ini dipenuhi, maka \(f\) dan \(g\) songsang antara satu sama lain.</li>
        <li>Domain \(f\) = julat \(g\), dan domain \(g\) = julat \(f\).</li>
        <li>Jika titik \((a, b)\) berada pada graf \(f\), maka titik \((b, a)\) berada pada graf \(g\).</li>
        <li>Graf \(g\) ialah <strong>pantulan</strong> graf \(f\) pada garis \(y = x\).</li>
      </ul>` },
    { kind: 'visual', title: 'Pantulan pada garis y = x', html: R`<p>Biru: \(f(x) = ax + b\). Merah: \(f^{-1}(x)\). Putus-putus: \(y = x\). Gerakkan titik \(t\) dan lihat \((t, f(t))\) berpasangan dengan \((f(t), t)\).</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-6, 6], params: [{ name: 'a', label: R`\(a\)`, min: 0.5, max: 3, step: 0.5, value: 2 }, { name: 'b', label: R`\(b\)`, min: -3, max: 3, step: 1, value: -1 }, { name: 't', label: R`\(t\)`, min: -2, max: 3, step: 0.5, value: 2 }],
        curves: [{ f: (x) => x, dashed: true, color: '#9AA3B5' }, { f: (x, p) => p.a * x + p.b }, { f: (x, p) => (x - p.b) / p.a, color: '#D9534F' }],
        points: [{ at: (p) => [p.t, p.a * p.t + p.b], label: (p) => `(${p.t}, ${+(p.a * p.t + p.b).toFixed(2)})` }, { at: (p) => [p.a * p.t + p.b, p.t], label: (p) => `(${+(p.a * p.t + p.b).toFixed(2)}, ${p.t})` }],
        readout: (p, { fmt }) => R`\(f(x) = ${fmt(p.a)}x ${p.b < 0 ? '-' : '+'} ${fmt(Math.abs(p.b))}\), maka \(f^{-1}(x) = \dfrac{x ${p.b < 0 ? '+' : '-'} ${fmt(Math.abs(p.b))}}{${fmt(p.a)}}\). Titik \((${fmt(p.t)}, ${fmt(p.a * p.t + p.b)})\) pada \(f\) berpasangan dengan \((${fmt(p.a * p.t + p.b)}, ${fmt(p.t)})\) pada \(f^{-1}\).` },
      alt: R`Graf garis f(x) = 2x − 1 dan songsangannya f⁻¹(x) = (x + 1)/2, bersama garis y = x. Kedua-dua graf adalah pantulan antara satu sama lain pada y = x. Contohnya, (2, 3) berada pada f dan (3, 2) berada pada f⁻¹. Kedua-dua graf bersilang pada garis y = x di (1, 1).` },
    { kind: 'concept', title: 'Menentukan fungsi songsang secara algebra', sp: ['1.3.3'], html: R`
      <ol>
        <li>Tulis \(y = f(x)\).</li>
        <li>Jadikan \(x\) sebagai perkara rumus (\(x\) dalam sebutan \(y\)).</li>
        <li>Itulah \(f^{-1}(y)\). Tukar nama pemboleh ubah kepada \(x\) untuk menulis \(f^{-1}(x)\).</li>
        <li>Semak: \(ff^{-1}(x) = x\) dan \(f^{-1}f(x) = x\).</li>
      </ol>
      <p>Contoh: \(f(x) = \dfrac{x + 5}{3}\). Daripada \(y = \dfrac{x + 5}{3}\), kita dapat \(x = 3y - 5\), jadi \(f^{-1}(x) = 3x - 5\). Semak: \(f(3x - 5) = \dfrac{3x - 5 + 5}{3} = x\) ✓.</p>` },
    { kind: 'formula', items: [
      { tex: R`f(a) = b \iff f^{-1}(b) = a`, html: R`Songsang membalikkan pasangan objek dan imej.` },
      { tex: R`ff^{-1}(x) = f^{-1}f(x) = x`, html: R`Gubahan fungsi dengan songsangnya memberi kembali objek asal. Gunakan ini untuk menyemak jawapan.` },
      { tex: R`\text{domain } f^{-1} = \text{julat } f`, html: R`Contohnya \(f(x) = \dfrac{4}{x - 2}\ (x \ne 2)\) tidak pernah bernilai 0, jadi \(f^{-1}\) tidak tertakrif pada \(x = 0\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.3.1'], question: R`Diberi \(f(x) = 2x + 3\). Tanpa mencari rumus \(f^{-1}\), cari \(f^{-1}(11)\).`, given: R`\(f(x) = 2x + 3\)`, find: R`\(f^{-1}(11)\)`, method: R`\(f^{-1}(11) = a\) bermaksud \(f(a) = 11\).`,
        steps: [{ do: R`\(2a + 3 = 11 \Rightarrow a = 4\)`, why: R`Cari objek \(a\) yang imejnya 11.` }],
        check: R`\(f(4) = 11\) ✓`, conclusion: R`\(f^{-1}(11) = 4\).` },
      { level: 'sederhana', sp: ['1.3.3'], question: R`Cari \(f^{-1}(x)\) bagi \(f(x) = \dfrac{x + 5}{3}\), dan sahkan jawapan anda.`, given: R`\(f(x) = \dfrac{x+5}{3}\)`, find: R`\(f^{-1}(x)\)`, method: R`Tulis \(y = f(x)\) dan jadikan \(x\) perkara rumus.`,
        steps: [{ do: R`\(y = \dfrac{x + 5}{3} \Rightarrow 3y = x + 5\)` }, { do: R`\(x = 3y - 5\)` }, { do: R`\(f^{-1}(x) = 3x - 5\)` }],
        check: R`\(ff^{-1}(x) = \dfrac{(3x - 5) + 5}{3} = x\) ✓ dan \(f^{-1}f(x) = 3\cdot\dfrac{x+5}{3} - 5 = x\) ✓`, conclusion: R`\(f^{-1}(x) = 3x - 5\).` },
      { level: 'sederhana', sp: ['1.3.2', '1.3.3'], question: R`Diberi \(f(x) = \dfrac{4}{x - 2}\), \(x \neq 2\). Cari \(f^{-1}(x)\) dan nyatakan nilai yang dikecualikan daripada domainnya.`, given: R`\(f(x) = \dfrac{4}{x-2}\)`, find: R`\(f^{-1}(x)\) dan domainnya`, method: R`Kaedah algebra, kemudian guna domain \(f^{-1}\) = julat \(f\).`,
        steps: [{ do: R`\(y = \dfrac{4}{x - 2} \Rightarrow y(x - 2) = 4\)` }, { do: R`\(x - 2 = \dfrac{4}{y} \Rightarrow x = \dfrac{4}{y} + 2\)`, why: R`Bahagi dengan \(y\). Ini memerlukan \(y \neq 0\).` }, { do: R`\(f^{-1}(x) = \dfrac{4}{x} + 2 = \dfrac{2x + 4}{x}\), \(x \neq 0\)`, why: R`\(f(x) = \dfrac{4}{x-2}\) tidak pernah sama dengan 0, jadi 0 bukan dalam julat \(f\) dan bukan dalam domain \(f^{-1}\).` }],
        check: R`\(x = 3\): \(f(3) = 4\), dan \(f^{-1}(4) = \dfrac{4}{4} + 2 = 3\) ✓`, conclusion: R`\(f^{-1}(x) = \dfrac{2x + 4}{x}\), \(x \ne 0\).` },
      { level: 'mencabar', sp: ['1.3.2'], question: R`Adakah \(f(x) = x^2 - 4\) mempunyai fungsi songsang bagi semua nombor nyata \(x\)? Jika tidak, cadangkan domain supaya songsangnya wujud, dan cari songsang itu.`, given: R`\(f(x) = x^2 - 4\)`, find: R`kewujudan songsang; domain sesuai; \(f^{-1}\)`, method: R`Uji satu kepada satu dengan dua objek berlawanan, kemudian hadkan domain.`,
        steps: [{ do: R`\(f(-3) = 5\) dan \(f(3) = 5\)`, why: R`Dua objek berbeza memberi imej yang sama. Garis \(y = 5\) memotong graf dua kali, jadi \(f\) tidak satu kepada satu.` }, { do: R`Hadkan domain kepada \(x \geq 0\)`, why: R`Cabang kanan parabola sentiasa menaik, jadi ia satu kepada satu.` }, { do: R`\(y = x^2 - 4 \Rightarrow x = \sqrt{y + 4}\)`, why: R`Kita ambil punca kuasa dua positif kerana \(x \geq 0\).` }, { do: R`\(f^{-1}(x) = \sqrt{x + 4}\), \(x \geq -4\)`, why: R`Julat \(f\) bagi \(x \ge 0\) ialah \(f(x) \ge -4\), dan itulah domain \(f^{-1}\).` }],
        check: R`\(f^{-1}(5) = \sqrt{9} = 3\) dan \(f(3) = 5\) ✓`, conclusion: R`Tiada songsang bagi semua nombor nyata. Dengan domain \(x \ge 0\), \(f^{-1}(x) = \sqrt{x + 4}\), \(x \ge -4\).` },
      { level: 'mencabar', sp: ['1.3.2', '1.3.3'], question: R`Diberi \(f(x) = 3x - 4\). Cari \(f^{-1}(x)\) dan titik persilangan graf \(f\) dengan graf \(f^{-1}\).`, given: R`\(f(x) = 3x - 4\)`, find: R`\(f^{-1}(x)\) dan titik persilangan`, method: R`Bagi fungsi garis lurus menaik ini, kedua-dua graf bersilang pada garis \(y = x\) (pantulan).`,
        steps: [{ do: R`\(y = 3x - 4 \Rightarrow x = \dfrac{y + 4}{3}\), jadi \(f^{-1}(x) = \dfrac{x + 4}{3}\)` }, { do: R`Selesaikan \(3x - 4 = \dfrac{x + 4}{3}\): \(9x - 12 = x + 4 \Rightarrow x = 2\)` }, { do: R`\(f(2) = 2\), jadi titiknya \((2, 2)\)`, why: R`Titik ini berada pada \(y = x\), selaras dengan sifat pantulan.` }],
        check: R`\(f^{-1}(2) = \dfrac{6}{3} = 2\) ✓`, conclusion: R`\(f^{-1}(x) = \dfrac{x+4}{3}\); graf bersilang di \((2, 2)\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(f(x) = 3x - 6 \Rightarrow f^{-1}(x) = \dfrac{1}{3x - 6}\)`, why: R`\(-1\) dalam \(f^{-1}\) bukan kuasa negatif.`, fix: R`\(y = 3x - 6 \Rightarrow x = \dfrac{y + 6}{3}\), jadi \(f^{-1}(x) = \dfrac{x + 6}{3}\).` },
      { wrong: R`Songsang "darab 3, tambah 2" ialah "bahagi 3, tolak 2".`, why: R`Langkah mesti dibalikkan dengan <em>susunan terbalik</em>.`, fix: R`"Tolak 2, kemudian bahagi 3": \(f^{-1}(x) = \dfrac{x - 2}{3}\).` },
      { wrong: R`\(f(x) = x^2\) mempunyai songsang \(\sqrt{x}\) bagi semua \(x\).`, why: R`\(x^2\) tidak satu kepada satu pada semua nombor nyata.`, fix: R`Hadkan domain dahulu (contohnya \(x \ge 0\)).` },
      { wrong: R`Lupa domain songsang, contohnya menulis \(f^{-1}(x) = \dfrac{4}{x} + 2\) tanpa \(x \ne 0\).`, why: R`Domain songsang ialah julat fungsi asal.`, fix: R`Nyatakan \(x \ne 0\).` },
    ] },
    { kind: 'summary', points: [
      R`\(f(a) = b \iff f^{-1}(b) = a\). \(f^{-1}(x) \ne \dfrac{1}{f(x)}\).`,
      R`Hanya fungsi satu kepada satu ada songsang. Gunakan ujian garis mengufuk.`,
      R`Cari \(f^{-1}\): \(y = f(x)\), jadikan \(x\) perkara rumus, tukar nama pemboleh ubah. Semak dengan \(ff^{-1}(x) = x\).`,
      R`Graf \(f^{-1}\) ialah pantulan graf \(f\) pada \(y = x\); domain dan julat bertukar tempat.`,
    ] },
    { kind: 'next', html: R`<p>Fungsi digunakan sepanjang Matematik Tambahan: <strong>Bab 2 Fungsi Kuadratik</strong> mengkaji graf parabola, dan <strong>Bab 4</strong> menggunakan sepasang fungsi songsang yang penting, iaitu eksponen dan logaritma.</p><p>Mahu cuba konsep fungsi dalam permainan? DENAI Level 1-1 menggunakan "mesin fungsi" untuk membina jambatan. Ia pilihan sahaja dan tidak diperlukan untuk nota ini.</p>`, links: [{ href: '/denai/', label: 'Main DENAI: Jejak Taman Fungsi' }, { href: '#/bab/t4-1', label: 'Kembali ke Bab 1' }] },
  ],
};

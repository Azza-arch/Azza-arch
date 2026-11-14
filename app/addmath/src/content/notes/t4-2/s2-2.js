// Bab 2 · 2.2 Jenis-jenis Punca (SP 2.2.1, 2.2.2). Original content.
// DSKP scope: link between root types and the discriminant; real and
// non-real cases; imaginary i = √−1 may be discussed; problems on root types.
const R = String.raw;

export const S2_2 = {
  id: '2.2', sk: '2.2', title: 'Jenis-jenis Punca Persamaan Kuadratik', sp: ['2.2.1', '2.2.2'], status: 'published', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Bolehkah bola itu sampai setinggi 10 m?', html: R`
      <p>Sebiji bola dilambung ke atas. Tingginya selepas \(t\) saat ialah \(h(t) = -5t^2 + 12t + 1\) meter. Bolehkah bola itu mencapai 10 m?</p>
      <p>Kita tanya: adakah \(-5t^2 + 12t + 1 = 10\), iaitu \(5t^2 - 12t + 9 = 0\), mempunyai penyelesaian? Kita tidak perlu menyelesaikannya. Cukup lihat nombor \(b^2 - 4ac = 144 - 180 = -36\). Nombor ini negatif, jadi tiada penyelesaian nyata: bola tidak pernah sampai 10 m.</p>
      <p>Nombor \(b^2 - 4ac\) ini dipanggil <strong>pembezalayan</strong>.</p>` },
    { kind: 'concept', title: 'Pembezalayan menentukan jenis punca', sp: ['2.2.1'], html: R`
      <p>Dalam rumus \(x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}\), segala-galanya bergantung pada nombor di bawah tanda punca kuasa dua.</p>
      <table class="mini-table"><thead><tr><th>\(b^2 - 4ac\)</th><th>Maksud</th><th>Jenis punca</th></tr></thead><tbody>
        <tr><td>\(> 0\)</td><td>\(+\sqrt{\ }\) dan \(-\sqrt{\ }\) berbeza</td><td>dua punca nyata yang berbeza</td></tr>
        <tr><td>\(= 0\)</td><td>\(\pm 0\) memberi satu nilai</td><td>dua punca nyata yang sama</td></tr>
        <tr><td>\(< 0\)</td><td>punca kuasa dua nombor negatif bukan nombor nyata</td><td>tiada punca nyata</td></tr>
      </tbody></table>
      <p><strong>Pengayaan:</strong> ahli matematik menamakan \(i = \sqrt{-1}\). Contohnya \(x^2 + 4 = 0\) memberi \(x = \pm 2i\). Ini punca <em>khayalan</em>, bukan punca nyata. Dalam bab ini, "tiada punca nyata" ialah jawapan yang dikehendaki apabila \(b^2 - 4ac < 0\).</p>` },
    { kind: 'visual', title: 'Lihat pembezalayan berubah', html: R`<p>Graf \(y = ax^2 + bx + c\). Bilangan titik persilangan dengan paksi-\(x\) sepadan dengan jenis punca.</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-8, 8], params: [{ name: 'a', label: R`\(a\)`, min: -2, max: 2, step: 0.5, value: 1 }, { name: 'b', label: R`\(b\)`, min: -6, max: 6, step: 1, value: -4 }, { name: 'c', label: R`\(c\)`, min: -6, max: 6, step: 1, value: 4 }],
        curves: [{ f: (x, p) => p.a * x * x + p.b * x + p.c }],
        readout: (p, { fmt }) => { if (p.a === 0) return R`Apabila \(a = 0\), persamaan bukan lagi kuadratik.`; const D = p.b * p.b - 4 * p.a * p.c; return R`\(b^2 - 4ac = (${fmt(p.b)})^2 - 4(${fmt(p.a)})(${fmt(p.c)}) = ${fmt(D)}\) → ${D > 0 ? 'dua punca nyata yang berbeza (memotong paksi-x dua kali)' : D === 0 ? 'dua punca nyata yang sama (menyentuh paksi-x sekali)' : 'tiada punca nyata (tidak menyentuh paksi-x)'}.`; } },
      alt: R`Parabola y = ax² + bx + c. Dengan a = 1, b = −4, c = 4, pembezalayan ialah 16 − 16 = 0 dan graf menyentuh paksi-x di satu titik (2, 0). Jika c dinaikkan kepada 5, pembezalayan menjadi −4 dan graf tidak menyentuh paksi-x. Jika c diturunkan kepada 3, pembezalayan menjadi 4 dan graf memotong paksi-x di dua titik.` },
    { kind: 'concept', title: 'Menyelesaikan masalah tentang jenis punca', sp: ['2.2.2'], html: R`
      <p>Jika persamaan mengandungi pemalar yang tidak diketahui (contohnya \(k\)), kita tukar <strong>syarat jenis punca</strong> kepada persamaan atau ketaksamaan dalam \(k\):</p>
      <ul><li>punca sama: \(b^2 - 4ac = 0\)</li><li>dua punca berbeza: \(b^2 - 4ac > 0\)</li><li>tiada punca nyata: \(b^2 - 4ac < 0\)</li><li>punca nyata (berbeza atau sama): \(b^2 - 4ac \ge 0\)</li></ul>
      <p>Garis yang <strong>menyentuh</strong> lengkung pada satu titik (tangen) juga ialah masalah "punca sama": samakan kedua-dua persamaan dan tetapkan \(b^2 - 4ac = 0\).</p>
      <div class="callout is-warn"><p>Jika \(k\) muncul dalam pekali \(x^2\), pastikan pekali itu bukan sifar, kerana jika sifar, persamaan bukan lagi kuadratik.</p></div>` },
    { kind: 'formula', items: [
      { tex: R`b^2 - 4ac \;\begin{cases} > 0 & \text{dua punca nyata berbeza} \\ = 0 & \text{dua punca nyata sama} \\ < 0 & \text{tiada punca nyata} \end{cases}`, html: R`Pembezalayan bagi \(ax^2 + bx + c = 0\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['2.2.1'], question: R`Tentukan jenis punca bagi \(2x^2 - 3x + 5 = 0\).`, given: R`\(a = 2,\ b = -3,\ c = 5\)`, find: R`jenis punca`, method: R`Kira pembezalayan.`,
        steps: [{ do: R`\(b^2 - 4ac = (-3)^2 - 4(2)(5) = 9 - 40 = -31\)`, why: R`\((-3)^2 = 9\), bukan \(-9\).` }, { do: R`\(-31 < 0\)` }],
        check: R`Graf terbuka ke atas dengan nilai minimum \(f(0.75) = 3.875 > 0\), jadi ia tidak memotong paksi-\(x\) ✓`, conclusion: R`Tiada punca nyata.` },
      { level: 'sederhana', sp: ['2.2.2'], question: R`Persamaan \(x^2 + kx + 9 = 0\) mempunyai dua punca sama. Cari nilai-nilai \(k\).`, given: R`\(a = 1,\ b = k,\ c = 9\); punca sama`, find: R`\(k\)`, method: R`Punca sama bermaksud \(b^2 - 4ac = 0\).`,
        steps: [{ do: R`\(k^2 - 4(1)(9) = 0 \Rightarrow k^2 = 36\)` }, { do: R`\(k = 6\) atau \(k = -6\)`, why: R`Jangan lupa punca negatif.` }],
        check: R`\(k = 6\): \(x^2 + 6x + 9 = (x + 3)^2\) ✓; \(k = -6\): \((x - 3)^2\) ✓`, conclusion: R`\(k = \pm 6\).` },
      { level: 'sederhana', sp: ['2.2.2'], question: R`Cari julat nilai \(p\) jika \(x^2 - 4x + p = 0\) mempunyai dua punca nyata yang berbeza.`, given: R`\(a = 1,\ b = -4,\ c = p\)`, find: R`julat \(p\)`, method: R`Dua punca berbeza: \(b^2 - 4ac > 0\).`,
        steps: [{ do: R`\(16 - 4p > 0\)` }, { do: R`\(16 > 4p \Rightarrow p < 4\)` }],
        check: R`\(p = 3\): \(x^2 - 4x + 3 = (x-1)(x-3)\), dua punca berbeza ✓. \(p = 4\): punca sama, jadi 4 tidak termasuk ✓`, conclusion: R`\(p < 4\).` },
      { level: 'mencabar', sp: ['2.2.2'], question: R`Persamaan \((p - 1)x^2 + 4x + 2 = 0\) tiada punca nyata. Cari julat nilai \(p\).`, given: R`\(a = p - 1,\ b = 4,\ c = 2\)`, find: R`julat \(p\)`, method: R`Tiada punca nyata: \(b^2 - 4ac < 0\). Semak juga \(a \ne 0\).`,
        steps: [{ do: R`\(16 - 4(p - 1)(2) < 0\)` }, { do: R`\(16 - 8p + 8 < 0 \Rightarrow 24 < 8p \Rightarrow p > 3\)` }, { do: R`Syarat \(p \ne 1\) dipenuhi secara automatik kerana \(p > 3\)` }],
        check: R`\(p = 4\): \(3x^2 + 4x + 2\), pembezalayan \(16 - 24 = -8 < 0\) ✓`, conclusion: R`\(p > 3\).` },
      { level: 'mencabar', sp: ['2.2.2'], question: R`Garis \(y = 2x + c\) menyentuh lengkung \(y = x^2 + 4\) pada satu titik sahaja. Cari \(c\).`, given: R`garis dan lengkung bertangen`, find: R`\(c\)`, method: R`Samakan, susun menjadi persamaan kuadratik, dan tetapkan punca sama.`,
        steps: [{ do: R`\(x^2 + 4 = 2x + c \Rightarrow x^2 - 2x + (4 - c) = 0\)` }, { do: R`\((-2)^2 - 4(1)(4 - c) = 0 \Rightarrow 4 - 16 + 4c = 0\)` }, { do: R`\(c = 3\)` }],
        check: R`\(x^2 - 2x + 1 = (x - 1)^2\), satu titik sentuhan di \(x = 1\), iaitu \((1, 5)\) ✓`, conclusion: R`\(c = 3\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\((-3)^2 = -9\)`, why: R`Kuasa dua nombor negatif adalah positif.`, fix: R`\((-3)^2 = 9\). Gunakan kurungan apabila menggantikan.` },
      { wrong: R`Dua punca berbeza: \(b^2 - 4ac \ge 0\).`, why: R`\(= 0\) memberi punca sama.`, fix: R`Dua punca <em>berbeza</em>: \(> 0\). Punca <em>nyata</em> (termasuk sama): \(\ge 0\).` },
      { wrong: R`\(k^2 = 36 \Rightarrow k = 6\)`, why: R`Nilai negatif terlupa.`, fix: R`\(k = \pm 6\).` },
    ] },
    { kind: 'summary', points: [
      R`Pembezalayan \(b^2 - 4ac\): \(> 0\) dua punca berbeza, \(= 0\) punca sama, \(< 0\) tiada punca nyata.`,
      R`Untuk masalah dengan pemalar tidak diketahui, tukar syarat jenis punca kepada persamaan atau ketaksamaan.`,
      R`Garis tangen kepada lengkung: samakan persamaan, kemudian guna "punca sama".`,
    ] },
    { kind: 'next', html: R`<p>Dalam <strong>2.3</strong>, kita lihat maksud pembezalayan pada graf: berapa kali parabola memotong paksi-\(x\).</p>`, links: [{ href: '#/nota/t4-2/2.3', label: '2.3 Fungsi Kuadratik →' }] },
  ],
};

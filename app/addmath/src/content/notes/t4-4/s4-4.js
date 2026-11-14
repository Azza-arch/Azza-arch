// Bab 4 · 4.4 Aplikasi Indeks, Surd dan Logaritma (SP 4.4.1). Original.
// DSKP: at most two variables; real-life situations; natural logarithm (ln).
const R = String.raw;

export const S4_4 = {
  id: '4.4', sk: '4.4', title: 'Aplikasi Indeks, Surd dan Logaritma', sp: ['4.4.1'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Bilakah simpanan berganda?', html: R`
      <p>Anda menyimpan RM5000 dalam akaun dengan faedah kompaun 4% setahun. Selepas \(t\) tahun, wangnya ialah \(A = 5000(1.04)^t\). Bilakah wang itu menjadi RM10 000?</p>
      <p>Kita perlu menyelesaikan \(1.04^t = 2\). Asas 1.04 dan 2 tidak boleh disamakan, jadi kaedah 4.1 tidak berfungsi. Penyelesaiannya ialah mengambil logaritma kedua-dua belah.</p>` },
    { kind: 'concept', title: 'Mengambil logaritma kedua-dua belah', sp: ['4.4.1'], html: R`
      <p>Jika \(a^x = N\) dan asas tidak boleh disamakan, ambil \(\lg\) (atau \(\ln\)) kedua-dua belah:</p>
      \[a^x = N \;\Rightarrow\; x\lg a = \lg N \;\Rightarrow\; x = \frac{\lg N}{\lg a}\]
      <p>Langkah ini sah kerana jika dua nombor positif sama, logaritmanya juga sama. Hukum kuasa kemudian "menurunkan" \(x\) daripada indeks.</p>
      <p><strong>Logaritma jati</strong>, \(\ln x = \log_e x\), menggunakan asas \(e \approx 2.71828\). Ia muncul secara semula jadi dalam pertumbuhan dan pereputan berterusan, seperti \(m = 80e^{-0.05t}\). Kerana \(\ln e^x = x\), persamaan dengan \(e\) paling mudah diselesaikan dengan \(\ln\).</p>
      <p>Kadangkala persamaan menjadi kuadratik dalam \(a^x\). Contohnya \(e^{2x} - 5e^x + 6 = 0\): biar \(u = e^x\), maka \(u^2 - 5u + 6 = 0\).</p>` },
    { kind: 'visual', title: 'Masa untuk simpanan berganda', html: R`<p>\(A = 5000(1 + r)^t\). Ubah kadar faedah \(r\) dan lihat bila graf mencapai garis RM10 000.</p>`,
      spec: { type: 'plot', x: [0, 40], y: [0, 20000], gridX: 5, gridY: 2500, labelStepX: 10, labelStepY: 5000, xLabel: 't (tahun)', yLabel: 'A (RM)', params: [{ name: 'r', label: R`kadar faedah \(r\) (%)`, min: 1, max: 10, step: 0.5, value: 4 }],
        curves: [{ f: (t, p) => 5000 * (1 + p.r / 100) ** t }, { f: () => 10000, dashed: true, color: '#D9822B' }],
        points: [{ at: (p) => { const t = Math.log(2) / Math.log(1 + p.r / 100); return [t, 10000]; } }],
        readout: (p, { fmt }) => { const t = Math.log(2) / Math.log(1 + p.r / 100); return R`\(5000(1 + ${fmt(p.r / 100)})^t = 10\,000 \Rightarrow t = \dfrac{\ln 2}{\ln ${fmt(1 + p.r / 100)}} = ${fmt(+t.toFixed(2))}\) tahun, jadi kira-kira <strong>${Math.ceil(t)} tahun</strong> (bilangan tahun penuh).`; } },
      alt: R`Graf A = 5000(1.04)ᵗ melengkung ke atas dan mencapai RM10 000 pada t ≈ 17.67 tahun. Dengan kadar 8%, ia mencapai RM10 000 lebih awal, kira-kira 9.01 tahun. Kadar lebih tinggi menjadikan graf lebih curam.` },
    { kind: 'formula', items: [
      { tex: R`a^x = N \Rightarrow x = \frac{\lg N}{\lg a} = \frac{\ln N}{\ln a}`, html: R`Bagi \(a, N > 0\), \(a \ne 1\).` },
      { tex: R`e^x = N \iff x = \ln N`, html: R`\(\ln\) ialah logaritma asas \(e\).` },
    ] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['4.4.1'], question: R`Selesaikan \(3^x = 20\), betul kepada tiga tempat perpuluhan.`, given: R`asas 3, tidak boleh disamakan dengan 20`, find: R`\(x\)`, method: R`Ambil \(\lg\) kedua-dua belah.`,
        steps: [{ do: R`\(x \lg 3 = \lg 20\)` }, { do: R`\(x = \dfrac{\lg 20}{\lg 3} = 2.727\)` }],
        check: R`\(3^{2.727} \approx 20.0\) ✓`, conclusion: R`\(x = 2.727\).` },
      { level: 'sederhana', sp: ['4.4.1'], question: R`Selesaikan \(5^{2x - 1} = 40\), betul kepada tiga tempat perpuluhan.`, given: R`indeks linear dalam \(x\)`, find: R`\(x\)`, method: R`Ambil \(\lg\), kemudian selesaikan persamaan linear.`,
        steps: [{ do: R`\((2x - 1)\lg 5 = \lg 40\)` }, { do: R`\(2x - 1 = \dfrac{\lg 40}{\lg 5} = 2.2920\)` }, { do: R`\(x = 1.646\)` }],
        check: R`\(5^{2(1.646) - 1} = 5^{2.292} \approx 40\) ✓`, conclusion: R`\(x = 1.646\).` },
      { level: 'mencabar', sp: ['4.4.1'], question: R`RM5000 disimpan pada faedah kompaun 4% setahun. Selepas berapa tahun penuh simpanan itu mula melebihi RM10 000?`, given: R`\(A = 5000(1.04)^t\)`, find: R`\(t\) terkecil`, method: R`Selesaikan \(1.04^t = 2\) dengan logaritma, kemudian tafsir dalam konteks.`,
        steps: [{ do: R`\(1.04^t = 2 \Rightarrow t = \dfrac{\ln 2}{\ln 1.04} = 17.67\)` }, { do: R`Faedah dikreditkan setiap tahun, jadi selepas 17 tahun belum cukup; selepas 18 tahun sudah melebihi.`, why: R`\(5000(1.04)^{17} = 9739.50\) dan \(5000(1.04)^{18} = 10\,129.08\).` }],
        check: R`\(1.04^{18} = 2.0258 > 2\) ✓`, conclusion: R`Selepas 18 tahun.` },
      { level: 'mencabar', sp: ['4.4.1'], question: R`Jisim bahan radioaktif ialah \(m = 80e^{-0.05t}\) gram, dengan \(t\) dalam hari. Bilakah jisimnya 20 g?`, given: R`\(m = 80e^{-0.05t}\)`, find: R`\(t\) apabila \(m = 20\)`, method: R`Asingkan \(e^{(\ldots)}\), kemudian ambil \(\ln\).`,
        steps: [{ do: R`\(e^{-0.05t} = \tfrac{20}{80} = 0.25\)` }, { do: R`\(-0.05t = \ln 0.25 \Rightarrow t = \dfrac{\ln 4}{0.05} = 27.73\)`, why: R`\(\ln 0.25 = -\ln 4\).` }],
        check: R`\(80e^{-0.05(27.73)} \approx 20.0\) ✓`, conclusion: R`Kira-kira 27.73 hari.` },
      { level: 'mencabar', sp: ['4.4.1'], question: R`Selesaikan \(e^{2x} - 5e^x + 6 = 0\).`, given: R`kuadratik dalam \(e^x\)`, find: R`\(x\)`, method: R`Gantian \(u = e^x\).`,
        steps: [{ do: R`\(u^2 - 5u + 6 = 0 \Rightarrow (u - 2)(u - 3) = 0\)`, why: R`\(e^{2x} = (e^x)^2 = u^2\).` }, { do: R`\(e^x = 2\) atau \(e^x = 3\)` }, { do: R`\(x = \ln 2 = 0.693\) atau \(x = \ln 3 = 1.099\)` }],
        check: R`\(4 - 10 + 6 = 0\) ✓, \(9 - 15 + 6 = 0\) ✓`, conclusion: R`\(x = 0.693\) atau \(x = 1.099\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(3^x = 20 \Rightarrow x = \dfrac{20}{3}\)`, why: R`Pembahagian tidak "membatalkan" kuasa.`, fix: R`\(x = \dfrac{\lg 20}{\lg 3}\).` },
      { wrong: R`\(\dfrac{\lg 20}{\lg 3} = \lg \dfrac{20}{3}\)`, why: R`Pembahagian logaritma bukan logaritma hasil bahagi.`, fix: R`Kira \(\lg 20\) dan \(\lg 3\) secara berasingan, kemudian bahagi.` },
      { wrong: R`Membundarkan terlalu awal (contohnya \(\lg 3 \approx 0.5\)).`, why: R`Ralat besar dalam jawapan akhir.`, fix: R`Simpan sekurang-kurangnya 4 angka bererti sehingga langkah terakhir.` },
    ] },
    { kind: 'summary', points: [R`Asas tidak boleh disamakan → ambil \(\lg\) atau \(\ln\) kedua-dua belah.`, R`\(\ln\) ialah \(\log_e\); \(e^x = N \iff x = \ln N\).`, R`Tafsir jawapan dalam konteks (contohnya bilangan tahun penuh).`] },
    { kind: 'next', html: R`<p>Logaritma digunakan semula dalam <strong>Bab 6 Hukum Linear</strong> untuk menukar hubungan tak linear (seperti \(y = ab^x\)) kepada garis lurus.</p>`, links: [{ href: '#/bab/t4-4', label: 'Kembali ke Bab 4' }] },
  ],
};

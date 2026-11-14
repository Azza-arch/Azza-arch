// Bab 10 Nombor Indeks (T4 elektif, SP 10.1.1–10.2.2). Original.
// DSKP (PDF 102–104): real-life situations and AUTHENTIC data throughout;
// exploration of relative change against a base time; I = Q1/Q0 × 100
// (Q0 base time, Q1 specific time); various kinds of index (price, pollution,
// accident, commodity, BMI, gold); determine and interpret; problems
// (contextual learning, futures study). Composite index Ī = ΣIᵢWᵢ / ΣWᵢ without
// and with weights; meaning of weight; weights as counts, ratios, percentages,
// bar- or pie-chart readings; interpret trends; various data representations.
// NOTE: the numbers here are illustrative. Owner review: link or replace with
// authentic data (e.g. Jabatan Perangkaan Malaysia's IHP) — see PROGRESS.md.
const R = String.raw;
const r2 = (v) => +v.toFixed(2);
const YEARS = [2019, 2020, 2021, 2022, 2023];
const PRICE = [8.0, 8.4, 9.0, 9.6, 10.0]; // illustrative RM per kg
const bar = (x, h, w = 0.6) => [[x - w / 2, 0], [x + w / 2, 0], [x + w / 2, h], [x - w / 2, h]];

export const S10_1 = {
  id: '10.1', sk: '10.1', title: 'Nombor Indeks', sp: ['10.1.1', '10.1.2', '10.1.3'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Naik RM1 itu banyak atau sedikit?', html: R`<p>Harga sepinggan nasi lemak naik RM1, dan harga sebuah telefon juga naik RM1. Kenaikan yang sama, tetapi kesannya sangat berbeza. <strong>Nombor indeks</strong> membandingkan perubahan secara <em>relatif</em>, iaitu berbanding nilai asal, supaya perubahan mudah dibandingkan.</p><p class="note-small">Angka dalam nota ini ialah contoh ilustrasi untuk latihan. Untuk data sebenar, rujuk penerbitan rasmi seperti Indeks Harga Pengguna (IHP) oleh Jabatan Perangkaan Malaysia.</p>` },
    { kind: 'prereq', title: 'Imbas kembali', html: R`<ul><li>Peratus: \(\dfrac{\text{bahagian}}{\text{keseluruhan}} \times 100\).</li><li>Perubahan peratus \(= \dfrac{\text{baharu} - \text{asal}}{\text{asal}} \times 100\%\).</li></ul>` },
    { kind: 'concept', title: 'Takrif dan kegunaan', sp: ['10.1.1'], html: R`
      <p><strong>Nombor indeks</strong> ialah ukuran yang menunjukkan perubahan suatu kuantiti pada masa tertentu berbanding <strong>masa asas</strong>:</p>
      \[I = \frac{Q_1}{Q_0} \times 100\]
      <p>\(Q_0\) = kuantiti pada masa asas, \(Q_1\) = kuantiti pada masa tertentu. Indeks pada masa asas sentiasa <strong>100</strong>.</p>
      <p><strong>Kegunaan:</strong> membandingkan perubahan harga, kos sara hidup atau keadaan alam sekitar dari masa ke masa, merancang belanjawan, dan membuat dasar. Contoh jenis indeks:</p>
      <ul><li>indeks harga (contohnya Indeks Harga Pengguna) dan indeks komoditi (getah, minyak sawit)</li><li>indeks emas (harga emas)</li><li>indeks pencemaran udara dan indeks kemalangan</li><li>indeks jisim badan (BMI). Perhatian: BMI \(= \dfrac{\text{jisim (kg)}}{\text{tinggi (m)}^2}\) dinamakan "indeks" tetapi <em>bukan</em> nisbah berbanding masa asas. Ia ukuran ringkas yang membolehkan perbandingan antara orang.</li></ul>` },
    { kind: 'visual', title: 'Pilihan tahun asas', html: R`<p>Harga sekilogram suatu barang (data ilustrasi): RM8.00, RM8.40, RM9.00, RM9.60, RM10.00 bagi 2019–2023. Pilih tahun asas.</p>`,
      spec: { type: 'plot', x: [-0.6, 5.6], y: [-16, 150], gridX: 100, gridY: 20, labelStepY: 20, yLabel: 'indeks', xLabel: ' ', params: [{ name: 'yr', label: 'tahun asas', min: 2019, max: 2023, step: 1, value: 2019 }],
        polygons: [...YEARS.map((_, i) => ({ at: (p) => bar(i + 1, (PRICE[i] / PRICE[p.yr - 2019]) * 100), color: '#3467D4' })), { at: () => [[0, 100], [5.6, 100]], closed: false, color: '#D9534F' }],
        labels: [...YEARS.map((y, i) => ({ at: () => [i + 1, -9], text: String(y) })), ...YEARS.map((_, i) => ({ at: (p) => [i + 1, (PRICE[i] / PRICE[p.yr - 2019]) * 100 + 7], text: (p) => String(r2((PRICE[i] / PRICE[p.yr - 2019]) * 100)) }))],
        readout: (p, { fmt }) => R`Tahun asas ${p.yr}: indeks ${p.yr} \(= 100\). Indeks 2023 \(= \dfrac{10.00}{${PRICE[p.yr - 2019].toFixed(2)}} \times 100 = ${fmt(r2((10 / PRICE[p.yr - 2019]) * 100))}\). Harga sebenar tidak berubah; hanya rujukan yang berubah.` },
      alt: R`Carta bar indeks harga bagi 2019 hingga 2023 dengan garis merah pada 100. Dengan 2019 sebagai tahun asas, indeksnya ialah 100, 105, 112.5, 120 dan 125. Dengan 2021 sebagai tahun asas, indeksnya menjadi 88.89, 93.33, 100, 106.67 dan 111.11. Bar bagi tahun asas sentiasa tepat 100; tahun sebelum asas di bawah 100.` },
    { kind: 'concept', title: 'Mentafsir nombor indeks', sp: ['10.1.2'], html: R`
      <table class="mini-table"><thead><tr><th>Indeks</th><th>Maksud</th></tr></thead><tbody>
        <tr><td>\(I > 100\)</td><td>kuantiti <strong>bertambah</strong> sebanyak \((I - 100)\%\) berbanding masa asas</td></tr>
        <tr><td>\(I = 100\)</td><td>tiada perubahan</td></tr>
        <tr><td>\(I < 100\)</td><td>kuantiti <strong>berkurang</strong> sebanyak \((100 - I)\%\)</td></tr>
      </tbody></table>
      <p>Contoh: indeks harga 2023 berasaskan 2019 ialah 125, jadi harga naik 25% dari 2019 ke 2023. Indeks bagi kemalangan 85 bermaksud bilangan kemalangan turun 15%.</p>` },
    { kind: 'concept', title: 'Menyelesaikan masalah', sp: ['10.1.3'], html: R`
      <p>Susun semula rumus untuk mencari kuantiti yang tidak diketahui:</p>
      \[Q_1 = \frac{I \times Q_0}{100}, \qquad Q_0 = \frac{Q_1 \times 100}{I}\]
      <p><strong>Indeks berantai:</strong> jika \(I_{B/A}\) ialah indeks pada masa \(B\) berasaskan \(A\), dan \(I_{C/B}\) pada masa \(C\) berasaskan \(B\), maka</p>
      \[I_{C/A} = \frac{Q_C}{Q_A} \times 100 = \frac{Q_C}{Q_B} \times \frac{Q_B}{Q_A} \times 100 = \frac{I_{C/B} \times I_{B/A}}{100}\]` },
    { kind: 'formula', items: [{ tex: R`I = \frac{Q_1}{Q_0} \times 100`, html: R`\(Q_0\): masa asas; \(Q_1\): masa tertentu.` }, { tex: R`I_{C/A} = \frac{I_{C/B} \times I_{B/A}}{100}`, html: R`Mengubah masa asas melalui masa perantaraan.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['10.1.1', '10.1.2'], question: R`Harga sepinggan nasi lemak ialah RM2.00 pada 2015 dan RM3.00 pada 2024. Hitung indeks harga pada 2024 berasaskan 2015 dan tafsirkan.`, given: R`\(Q_0 = 2.00\), \(Q_1 = 3.00\)`, find: R`\(I\) dan maksudnya`, method: R`\(I = \tfrac{Q_1}{Q_0} \times 100\).`, steps: [{ do: R`\(I = \dfrac{3.00}{2.00} \times 100 = 150\)` }, { do: R`\(150 - 100 = 50\): harga naik 50%` }], check: R`\(2.00 \times 1.5 = 3.00\) ✓`, conclusion: R`\(I = 150\); harga naik 50% dari 2015 ke 2024.` },
      { level: 'sederhana', sp: ['10.1.2'], question: R`Bacaan purata suatu pencemar di sebuah bandar ialah 125 unit pada 2020 dan 100 unit pada 2023. Hitung indeks pencemaran 2023 berasaskan 2020 dan tafsirkan.`, given: R`\(Q_0 = 125\), \(Q_1 = 100\)`, find: R`\(I\)`, method: R`Rumus indeks.`, steps: [{ do: R`\(I = \dfrac{100}{125} \times 100 = 80\)` }, { do: R`\(100 - 80 = 20\): pencemaran turun 20%`, why: R`Penurunan 25 unit dibandingkan dengan nilai <em>asas</em> 125, bukan dengan 100.` }], check: R`\(125 \times 0.8 = 100\) ✓`, conclusion: R`\(I = 80\); turun 20%.` },
      { level: 'sederhana', sp: ['10.1.3'], question: R`Indeks harga sebuah telefon pada 2024 berasaskan 2020 ialah 115. Harganya pada 2020 ialah RM1200. Cari harganya pada 2024.`, given: R`\(I = 115\), \(Q_0 = 1200\)`, find: R`\(Q_1\)`, method: R`\(Q_1 = \tfrac{I \times Q_0}{100}\).`, steps: [{ do: R`\(Q_1 = \dfrac{115 \times 1200}{100} = 1380\)` }], check: R`\(\tfrac{1380}{1200} \times 100 = 115\) ✓`, conclusion: R`RM1380.` },
      { level: 'mencabar', sp: ['10.1.3'], question: R`Indeks harga suatu barang pada 2022 berasaskan 2020 ialah 120, dan pada 2024 berasaskan 2022 ialah 110. Cari indeks pada 2024 berasaskan 2020.`, given: R`\(I_{22/20} = 120\), \(I_{24/22} = 110\)`, find: R`\(I_{24/20}\)`, method: R`Indeks berantai.`, steps: [{ do: R`\(I_{24/20} = \dfrac{110 \times 120}{100} = 132\)`, why: R`Harga didarab 1.2, kemudian 1.1; jumlahnya didarab \(1.32\).` }], check: R`Andaikan harga 2020 = RM100: 2022 = RM120, 2024 = RM132 ✓`, conclusion: R`132 (bukan \(120 + 10 = 130\)).` },
      { level: 'mencabar', sp: ['10.1.3'], question: R`Harga sekotak barang pada 2024 ialah RM45.50, dan indeks harganya berasaskan 2019 ialah 130. Cari harga pada 2019.`, given: R`\(Q_1 = 45.50\), \(I = 130\)`, find: R`\(Q_0\)`, method: R`\(Q_0 = \tfrac{Q_1 \times 100}{I}\).`, steps: [{ do: R`\(Q_0 = \dfrac{45.50 \times 100}{130} = 35.00\)` }], check: R`\(35 \times 1.3 = 45.50\) ✓`, conclusion: R`RM35.00.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(I = \dfrac{Q_0}{Q_1} \times 100\)`, why: R`Masa asas berada di <em>penyebut</em>.`, fix: R`\(I = \tfrac{Q_1}{Q_0} \times 100\), "baharu per asas".` },
      { wrong: R`\(I_{24/20} = 120 + 10 = 130\) (menambah peratus).`, why: R`Kenaikan kedua dikira daripada harga yang sudah naik.`, fix: R`Darab: \(\tfrac{120 \times 110}{100} = 132\).` },
    ] },
    { kind: 'summary', points: [R`\(I = \tfrac{Q_1}{Q_0} \times 100\); indeks masa asas = 100.`, R`\(I > 100\): naik \((I - 100)\%\); \(I < 100\): turun \((100 - I)\%\).`, R`Indeks berantai: \(I_{C/A} = \tfrac{I_{C/B} \times I_{B/A}}{100}\).`] },
    { kind: 'next', html: R`<p>Satu indeks menerangkan satu barang. Untuk "kos hidup" yang melibatkan banyak barang, kita perlukan <strong>10.2 Indeks Gubahan</strong>.</p>`, links: [{ href: '#/nota/t4-10/10.2', label: '10.2 →' }] },
  ],
};

const ITEMS = [{ n: 'Makanan', I: 120 }, { n: 'Pengangkutan', I: 105 }, { n: 'Elektrik', I: 140 }];
const comp = (w) => { const s = w.reduce((a, b) => a + b, 0); return s ? ITEMS.reduce((a, it, k) => a + it.I * w[k], 0) / s : NaN; };

export const S10_2 = {
  id: '10.2', sk: '10.2', title: 'Indeks Gubahan', sp: ['10.2.1', '10.2.2'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Satu nombor untuk banyak barang', html: R`<p>Sebuah keluarga membelanjakan wang untuk makanan, pengangkutan dan elektrik. Harga makanan naik 20%, pengangkutan 5% dan elektrik 40%. Berapakah kenaikan "kos hidup" keluarga itu? Jawapannya bergantung pada <strong>berapa banyak</strong> mereka berbelanja untuk setiap satu. Inilah idea <strong>pemberat</strong>.</p>` },
    { kind: 'concept', title: 'Indeks gubahan dan pemberat', sp: ['10.2.1'], html: R`
      <p><strong>Indeks gubahan</strong> ialah purata nombor indeks beberapa barang:</p>
      \[\bar{I} = \frac{\sum I_i W_i}{\sum W_i}\]
      <p>\(I_i\) = nombor indeks barang ke-\(i\), \(W_i\) = <strong>pemberat</strong> barang itu, iaitu ukuran kepentingannya (contohnya peratus perbelanjaan).</p>
      <ul><li><strong>Tanpa pemberat:</strong> semua \(W_i\) sama, jadi \(\bar{I}\) ialah min biasa: \(\bar{I} = \dfrac{\sum I_i}{n}\).</li><li><strong>Dengan pemberat:</strong> barang yang lebih penting mempengaruhi \(\bar{I}\) lebih banyak.</li></ul>
      <p>Pemberat boleh diberi sebagai <strong>bilangan</strong>, <strong>nisbah</strong> (contohnya \(3 : 2 : 1\)), <strong>peratusan</strong>, atau dibaca daripada <strong>carta bar</strong> atau <strong>carta pai</strong> (sudut sektor). Yang penting ialah nilai relatifnya: mendarab semua pemberat dengan nombor yang sama tidak mengubah \(\bar{I}\).</p>` },
    { kind: 'visual', title: 'Kesan pemberat', html: R`<p>Indeks (data ilustrasi): makanan 120, pengangkutan 105, elektrik 140. Garis merah ialah indeks gubahan. Ubah pemberat.</p>`,
      spec: { type: 'plot', x: [-0.6, 5.2], y: [-16, 160], gridX: 100, gridY: 20, labelStepY: 20, yLabel: 'indeks', xLabel: ' ', params: ITEMS.map((it, k) => ({ name: `w${k}`, label: `pemberat ${it.n}`, min: 0, max: 10, step: 1, value: [5, 3, 2][k] })),
        polygons: [...ITEMS.map((it, k) => ({ at: () => bar(1 + 1.6 * k, it.I, 0.7), color: '#3467D4' })), { at: (p) => { const c = comp([p.w0, p.w1, p.w2]); return Number.isFinite(c) ? [[0, c], [5.2, c]] : null; }, closed: false, color: '#D9534F' }],
        labels: [...ITEMS.map((it, k) => ({ at: () => [1 + 1.6 * k, -9], text: it.n })), ...ITEMS.map((it, k) => ({ at: () => [1 + 1.6 * k, it.I + 7], text: String(it.I) }))],
        readout: (p, { fmt }) => { const w = [p.w0, p.w1, p.w2]; const c = comp(w); return Number.isFinite(c) ? R`\(\bar{I} = \dfrac{120(${fmt(w[0])}) + 105(${fmt(w[1])}) + 140(${fmt(w[2])})}{${fmt(w[0] + w[1] + w[2])}} = ${fmt(r2(c))}\)` : R`Semua pemberat sifar: \(\sum W_i = 0\), jadi indeks gubahan tidak tertakrif.`; } },
      alt: R`Tiga bar indeks: makanan 120, pengangkutan 105, elektrik 140, dengan garis merah bagi indeks gubahan. Dengan pemberat 5, 3, 2, indeks gubahan ialah (600 + 315 + 280)/10 = 119.5. Jika pemberat elektrik dinaikkan, garis merah bergerak ke arah 140; jika semua pemberat sama, ia menjadi min biasa 121.67.` },
    { kind: 'concept', title: 'Masalah melibatkan indeks gubahan', sp: ['10.2.2'], html: R`
      <ul><li><strong>Mencari nilai yang hilang:</strong> jika \(\bar{I}\) diberi tetapi satu pemberat atau indeks tidak diketahui, bentukkan persamaan daripada rumus dan selesaikan.</li><li><strong>Meramal kos:</strong> \(\text{kos}_1 = \dfrac{\bar{I} \times \text{kos}_0}{100}\).</li><li><strong>Trend:</strong> bandingkan indeks beberapa tahun untuk melihat sama ada kenaikan semakin cepat atau perlahan.</li><li><strong>Perubahan seragam:</strong> jika setiap barang naik \(p\%\) lagi, indeks gubahan juga didarab \(\left(1 + \tfrac{p}{100}\right)\).</li></ul>` },
    { kind: 'formula', items: [{ tex: R`\bar{I} = \frac{\sum I_i W_i}{\sum W_i}`, html: R`Tanpa pemberat: \(\bar{I} = \tfrac{\sum I_i}{n}\).` }, { tex: R`\text{kos}_1 = \frac{\bar{I} \times \text{kos}_0}{100}`, html: R`Menggunakan indeks gubahan untuk meramal jumlah kos.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['10.2.1'], question: R`Indeks tiga barang ialah 110, 125 dan 105. Cari indeks gubahan tanpa pemberat.`, given: R`tiga indeks`, find: R`\(\bar{I}\)`, method: R`Min biasa.`, steps: [{ do: R`\(\bar{I} = \dfrac{110 + 125 + 105}{3} = \dfrac{340}{3} = 113.33\)` }], check: R`Di antara indeks terkecil (105) dan terbesar (125) ✓`, conclusion: R`113.33.` },
      { level: 'sederhana', sp: ['10.2.1'], question: R`Barang \(A, B, C, D\) mempunyai indeks 120, 110, 130, 105 dan pemberat 4, 3, 2, 1. Cari indeks gubahan.`, given: R`indeks dan pemberat`, find: R`\(\bar{I}\)`, method: R`\(\tfrac{\sum I_i W_i}{\sum W_i}\).`, steps: [{ do: R`\(\sum I_i W_i = 480 + 330 + 260 + 105 = 1175\)` }, { do: R`\(\sum W_i = 10\), jadi \(\bar{I} = 117.5\)` }], check: R`Lebih dekat kepada 120 kerana \(A\) mempunyai pemberat terbesar ✓`, conclusion: R`117.5.` },
      { level: 'sederhana', sp: ['10.2.1'], question: R`Carta pai perbelanjaan: makanan \(150^\circ\), sewa \(120^\circ\), lain-lain \(90^\circ\). Indeks masing-masing 115, 108 dan 125. Cari indeks gubahan.`, given: R`sudut sektor sebagai pemberat`, find: R`\(\bar{I}\)`, method: R`Guna sudut terus sebagai pemberat.`, steps: [{ do: R`\(\sum I_i W_i = 115(150) + 108(120) + 125(90) = 41\,460\)` }, { do: R`\(\sum W_i = 360\), jadi \(\bar{I} = \dfrac{41\,460}{360} = 115.17\)`, why: R`Sudut berkadar dengan peratus perbelanjaan, jadi tidak perlu ditukar kepada peratus.` }], check: R`Dengan peratus (41.67%, 33.33%, 25%) hasilnya sama ✓`, conclusion: R`115.17.` },
      { level: 'mencabar', sp: ['10.2.2'], question: R`Indeks bagi tiga barang ialah 120, 110 dan 140 dengan pemberat 3, \(x\) dan 2. Indeks gubahan ialah 122. Cari \(x\).`, given: R`\(\bar{I} = 122\)`, find: R`\(x\)`, method: R`Bentuk persamaan daripada rumus.`, steps: [{ do: R`\(\dfrac{360 + 110x + 280}{5 + x} = 122\)` }, { do: R`\(640 + 110x = 610 + 122x\)` }, { do: R`\(30 = 12x \Rightarrow x = 2.5\)` }], check: R`\(\tfrac{360 + 275 + 280}{7.5} = \tfrac{915}{7.5} = 122\) ✓`, conclusion: R`\(x = 2.5\).` },
      { level: 'mencabar', sp: ['10.2.2'], question: R`Indeks gubahan kos operasi sebuah kedai pada 2024 berasaskan 2020 ialah 117.5. Kos bulanan pada 2020 ialah RM8000. (a) Cari kos pada 2024. (b) Jika setiap kos naik 10% lagi dari 2024 ke 2026, cari indeks gubahan 2026 berasaskan 2020 dan kos bulanan pada 2026.`, given: R`\(\bar{I}_{24/20} = 117.5\), kos 2020`, find: R`kos 2024; \(\bar{I}_{26/20}\); kos 2026`, method: R`\(\text{kos}_1 = \tfrac{\bar{I} \times \text{kos}_0}{100}\); kenaikan seragam 10% memberi indeks 110.`, steps: [{ do: R`(a) \(\dfrac{117.5 \times 8000}{100} = \text{RM}9400\)` }, { do: R`(b) \(\bar{I}_{26/24} = 110\), jadi \(\bar{I}_{26/20} = \dfrac{110 \times 117.5}{100} = 129.25\)` }, { do: R`Kos 2026 \(= \dfrac{129.25 \times 8000}{100} = \text{RM}10\,340\)` }], check: R`\(9400 \times 1.1 = 10\,340\) ✓`, conclusion: R`RM9400; 129.25; RM10 340.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Membahagi \(\sum I_i W_i\) dengan bilangan barang \(n\).`, why: R`Dengan pemberat, pembahagi ialah jumlah pemberat.`, fix: R`\(\bar{I} = \tfrac{\sum I_i W_i}{\sum W_i}\).` },
      { wrong: R`Menukar sudut carta pai kepada peratus, kemudian membundarkan terlalu awal.`, why: R`Pembundaran awal memberi jawapan yang sedikit berbeza.`, fix: R`Guna sudut terus sebagai pemberat.` },
    ] },
    { kind: 'summary', points: [R`\(\bar{I} = \tfrac{\sum I_i W_i}{\sum W_i}\); tanpa pemberat: min biasa.`, R`Pemberat boleh dalam bentuk bilangan, nisbah, peratus atau sudut carta pai; hanya nilai relatif penting.`, R`\(\text{kos}_1 = \tfrac{\bar{I} \times \text{kos}_0}{100}\).`] },
    { kind: 'next', html: R`<p>Ini melengkapkan Tingkatan 4. Tingkatan 5 bermula dengan <strong>Sukatan Membulat</strong>.</p>`, links: [{ href: '#/bab/t4-10', label: 'Kembali ke Bab 10' }] },
  ],
};

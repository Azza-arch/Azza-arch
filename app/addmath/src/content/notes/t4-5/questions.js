// Bab 5 question bank (status 'review', original). See tests/validate-notes.mjs.
const R = String.raw;
const P = { origin: 'original', author: 'Claude', createdAt: '2026-11-14', note: 'Ditulis asal untuk laman ini; bukan soalan SPM sebenar.' };
const RV = { autoChecked: true, mathReviewed: null, ownerApproved: { by: 'pemilik', date: '2026-11-14', note: 'Arahan pemilik: terbitkan terus kepada umum' } };
const q = (o) => ({ chapter: 't4-5', status: 'published', provenance: P, review: RV, ...o });
const T = (...terms) => ({ terms });
const V = (value) => ({ value });

export const QUESTIONS = [
  // ---------------------------------------------------------------- 5.1
  q({ id: 't4-5.1-01', subtopic: '5.1', sp: ['5.1.1'], difficulty: 'mudah', type: 'mcq', prompt: R`Jujukan manakah ialah janjang aritmetik?`, check: { kind: 'seq-type', type: 'ap' },
    options: [
      { text: R`\(3, 6, 12, 24, \ldots\)`, data: T(3, 6, 12, 24), correct: false, misconception: 'ja-jg', feedback: R`Bezanya 3, 6, 12: tidak sama. (Ini JG.)` },
      { text: R`\(20, 14, 8, 2, \ldots\)`, data: T(20, 14, 8, 2), correct: true, feedback: R`Betul. Beza sepunya \(d = -6\); JA boleh menurun.` },
      { text: R`\(1, 4, 9, 16, \ldots\)`, data: T(1, 4, 9, 16), correct: false, misconception: 'ja', feedback: R`Bezanya 3, 5, 7: tidak sama.` },
      { text: R`\(2, 3, 5, 8, \ldots\)`, data: T(2, 3, 5, 8), correct: false, misconception: 'ja', feedback: R`Bezanya 1, 2, 3: tidak sama.` },
    ], solution: [R`Kira beza berturut-turut. Hanya \(20, 14, 8, 2\) mempunyai beza tetap, \(-6\).`] }),
  q({ id: 't4-5.1-02', subtopic: '5.1', sp: ['5.1.2'], difficulty: 'mudah', type: 'numeric', prompt: R`Cari sebutan ke-15 bagi JA 4, 9, 14, …`, answer: 74, check: { kind: 'seq', type: 'ap', a: 4, d: 5, n: 15, what: 'term' },
    wrong: [{ value: 79, feedback: R`\(T_{15} = a + 14d\), bukan \(a + 15d\).` }], solution: [R`\(a = 4, d = 5\)`, R`\(T_{15} = 4 + 14(5) = 74\)`] }),
  q({ id: 't4-5.1-03', subtopic: '5.1', sp: ['5.1.2'], difficulty: 'sederhana', type: 'numeric', prompt: R`Sebutan keberapakah dalam JA 3, 7, 11, … yang bernilai 199?`, answer: 50, check: { kind: 'seq', type: 'ap', a: 3, d: 4, what: 'n-for-term', value: 199 },
    wrong: [{ value: 49, feedback: R`\(n - 1 = 49\), jadi \(n = 50\).` }], solution: [R`\(3 + (n - 1)4 = 199\)`, R`\(n - 1 = 49 \Rightarrow n = 50\)`] }),
  q({ id: 't4-5.1-04', subtopic: '5.1', sp: ['5.1.3'], difficulty: 'sederhana', type: 'numeric', prompt: R`Cari hasil tambah 25 sebutan pertama JA 1, 3, 5, …`, answer: 625, check: { kind: 'seq', type: 'ap', a: 1, d: 2, n: 25, what: 'sum' },
    wrong: [{ value: 49, feedback: R`49 ialah \(T_{25}\). Soalan meminta hasil tambah.` }], solution: [R`\(S_{25} = \tfrac{25}{2}[2 + 24(2)] = \tfrac{25}{2}(50) = 625\)`] }),
  q({ id: 't4-5.1-05', subtopic: '5.1', sp: ['5.1.3'], difficulty: 'sederhana', type: 'numeric', prompt: R`Hasil tambah \(n\) sebutan pertama suatu JA ialah \(S_n = 3n^2 - n\). Cari \(T_6\).`, answer: 32, check: { kind: 'value', expr: '(3*6^2-6)-(3*5^2-5)' },
    wrong: [{ value: 102, feedback: R`102 ialah \(S_6\). \(T_6 = S_6 - S_5\).` }], solution: [R`\(S_6 = 102\), \(S_5 = 70\)`, R`\(T_6 = 102 - 70 = 32\)`] }),
  q({ id: 't4-5.1-06', subtopic: '5.1', sp: ['5.1.2'], difficulty: 'mencabar', type: 'numeric', prompt: R`Sebutan ke-4 suatu JA ialah 13 dan sebutan ke-10 ialah 31. Cari beza sepunya.`, answer: 3, check: { kind: 'substitute', expr: '13+6*d', variable: 'd', equals: 31 },
    wrong: [{ value: 18, feedback: R`18 ialah \(T_{10} - T_4\), iaitu \(6d\). Bahagi dengan 6.` }], solution: [R`\(T_{10} - T_4 = (a + 9d) - (a + 3d) = 6d\)`, R`\(6d = 18 \Rightarrow d = 3\)`] }),
  q({ id: 't4-5.1-07', subtopic: '5.1', sp: ['5.1.4'], difficulty: 'mencabar', type: 'numeric', prompt: R`Gaji permulaan Aiman ialah RM2500 sebulan, dan gaji bulanannya naik RM150 setiap tahun. Berapakah jumlah gaji bulanan pada <em>tahun pertama hingga tahun ke-10</em>, jika setiap tahun dikira dengan satu nilai gaji bulanan? (Jumlah 10 nilai gaji bulanan itu.)`, answer: 31750, unit: 'RM', check: { kind: 'seq', type: 'ap', a: 2500, d: 150, n: 10, what: 'sum' },
    solution: [R`JA: \(a = 2500\), \(d = 150\), \(n = 10\)`, R`\(S_{10} = 5[5000 + 9(150)] = 5(6350) = 31\,750\)`] }),
  q({ id: 't4-5.1-08', subtopic: '5.1', sp: ['5.1.4'], difficulty: 'mencabar', type: 'numeric', prompt: R`Bagi JA 2, 5, 8, …, cari bilangan sebutan terkecil supaya hasil tambahnya melebihi 500.`, answer: 19, check: { kind: 'seq', type: 'ap', a: 2, d: 3, what: 'first-n-sum-exceeds', value: 500 },
    wrong: [{ value: 18, feedback: R`\(S_{18} = 495\), belum melebihi 500.` }], solution: [R`\(S_n = \tfrac{n}{2}(3n + 1) > 500\)`, R`\(S_{18} = 495\), \(S_{19} = 551\)`, R`\(n = 19\)`] }),
  q({ id: 't4-5.1-09', subtopic: '5.1', sp: ['5.1.3'], difficulty: 'mencabar', type: 'reasoning', prompt: R`Terangkan, dengan menulis \(S_n\) ke hadapan dan ke belakang, mengapa \(1 + 2 + 3 + \cdots + 100 = 5050\).`, check: { kind: 'manual' },
    solution: [R`\(S = 1 + 2 + \cdots + 100\) dan \(S = 100 + 99 + \cdots + 1\).`, R`Tambah menegak: setiap pasangan ialah 101, dan ada 100 pasangan, jadi \(2S = 100 \times 101\).`, R`\(S = 5050\). Ini ialah \(\tfrac{n}{2}(a + l)\) dengan \(n = 100\), \(a = 1\), \(l = 100\).`] }),
  q({ id: 't4-5.1-10', subtopic: '5.1', sp: ['5.1.1'], difficulty: 'sederhana', type: 'mcq', prompt: R`Jujukan manakah ialah janjang aritmetik dengan beza sepunya pecahan?`, check: { kind: 'seq-type', type: 'ap' },
    options: [
      { text: R`\(\tfrac{1}{2}, 1, \tfrac{3}{2}, 2, \ldots\)`, data: T(0.5, 1, 1.5, 2), correct: true, feedback: R`Betul. Beza sepunya \(d = \tfrac12\).` },
      { text: R`\(\tfrac{1}{2}, \tfrac{1}{4}, \tfrac{1}{8}, \ldots\)`, data: T(0.5, 0.25, 0.125), correct: false, misconception: 'ja-jg', feedback: R`Bezanya \(-\tfrac14, -\tfrac18\): tidak sama. (Ini JG dengan \(r = \tfrac12\).)` },
      { text: R`\(1, \tfrac{1}{2}, \tfrac{1}{3}, \tfrac{1}{4}, \ldots\)`, data: T(1, 1 / 2, 1 / 3, 1 / 4), correct: false, misconception: 'ja', feedback: R`Bezanya \(-\tfrac12, -\tfrac16, -\tfrac1{12}\): tidak sama.` },
      { text: R`\(\tfrac{1}{3}, \tfrac{2}{3}, \tfrac{4}{3}, \ldots\)`, data: T(1 / 3, 2 / 3, 4 / 3), correct: false, misconception: 'ja-jg', feedback: R`Bezanya \(\tfrac13, \tfrac23\): tidak sama.` },
    ], solution: [R`Hanya \(\tfrac12, 1, \tfrac32, 2\) mempunyai beza yang sama, \(\tfrac12\).`] }),
  // ---------------------------------------------------------------- 5.2
  q({ id: 't4-5.2-01', subtopic: '5.2', sp: ['5.2.1'], difficulty: 'mudah', type: 'mcq', prompt: R`Jujukan manakah ialah janjang geometri?`, check: { kind: 'seq-type', type: 'gp' },
    options: [
      { text: R`\(5, 10, 15, 20, \ldots\)`, data: T(5, 10, 15, 20), correct: false, misconception: 'ja-jg', feedback: R`Nisbahnya 2, 1.5, 1.33: tidak sama. (Ini JA.)` },
      { text: R`\(64, -32, 16, -8, \ldots\)`, data: T(64, -32, 16, -8), correct: true, feedback: R`Betul. \(r = -\tfrac{1}{2}\); tanda berselang-seli.` },
      { text: R`\(1, 2, 4, 7, \ldots\)`, data: T(1, 2, 4, 7), correct: false, misconception: 'jg', feedback: R`Nisbahnya 2, 2, 1.75: tidak sama.` },
      { text: R`\(2, 4, 6, 8, \ldots\)`, data: T(2, 4, 6, 8), correct: false, misconception: 'ja-jg', feedback: R`Ini JA dengan \(d = 2\).` },
    ], solution: [R`Kira nisbah berturut-turut. Hanya \(64, -32, 16, -8\) mempunyai nisbah tetap \(-\tfrac12\).`] }),
  q({ id: 't4-5.2-02', subtopic: '5.2', sp: ['5.2.2'], difficulty: 'mudah', type: 'numeric', prompt: R`Cari sebutan ke-6 bagi JG 5, 10, 20, …`, answer: 160, check: { kind: 'seq', type: 'gp', a: 5, r: 2, n: 6, what: 'term' },
    wrong: [{ value: 320, feedback: R`\(T_6 = ar^5\), bukan \(ar^6\).` }], solution: [R`\(T_6 = 5(2)^5 = 160\)`] }),
  q({ id: 't4-5.2-03', subtopic: '5.2', sp: ['5.2.2'], difficulty: 'sederhana', type: 'numeric', prompt: R`Sebutan keberapakah dalam JG 3, 6, 12, … yang bernilai 768?`, answer: 9, check: { kind: 'seq', type: 'gp', a: 3, r: 2, what: 'n-for-term', value: 768 },
    wrong: [{ value: 8, feedback: R`\(2^{n-1} = 256 = 2^8\), jadi \(n - 1 = 8\) dan \(n = 9\).` }], solution: [R`\(3(2)^{n-1} = 768 \Rightarrow 2^{n-1} = 256 = 2^8\)`, R`\(n = 9\)`] }),
  q({ id: 't4-5.2-04', subtopic: '5.2', sp: ['5.2.3'], difficulty: 'sederhana', type: 'numeric', prompt: R`Cari hasil tambah 6 sebutan pertama JG 4, 12, 36, …`, answer: 1456, check: { kind: 'seq', type: 'gp', a: 4, r: 3, n: 6, what: 'sum' },
    solution: [R`\(S_6 = \dfrac{4(3^6 - 1)}{3 - 1} = 2(728) = 1456\)`] }),
  q({ id: 't4-5.2-05', subtopic: '5.2', sp: ['5.2.4'], difficulty: 'sederhana', type: 'numeric', prompt: R`Cari hasil tambah hingga ketakterhinggaan bagi JG 18, 6, 2, …`, answer: 27, check: { kind: 'seq', type: 'gp', a: 18, r: 1 / 3, what: 'inf' },
    wrong: [{ value: 13.5, feedback: R`\(1 - r = 1 - \tfrac13 = \tfrac23\), jadi \(S_\infty = 18 \div \tfrac23 = 27\).` }], solution: [R`\(r = \tfrac13\)`, R`\(S_\infty = \dfrac{18}{1 - \frac13} = 27\)`] }),
  q({ id: 't4-5.2-06', subtopic: '5.2', sp: ['5.2.4'], difficulty: 'mencabar', type: 'mcq', prompt: R`Ungkapkan \(0.272727\ldots\) sebagai pecahan termudah.`, check: { kind: 'value-equal', target: '0.272727272727272727' },
    options: [
      { text: R`\(\dfrac{3}{11}\)`, data: V('3/11'), correct: true, feedback: R`Betul. \(a = 0.27\), \(r = 0.01\): \(\dfrac{0.27}{0.99} = \dfrac{27}{99} = \dfrac{3}{11}\).` },
      { text: R`\(\dfrac{27}{100}\)`, data: V('27/100'), correct: false, misconception: 'berakhir', feedback: R`Itu \(0.27\) sahaja.` },
      { text: R`\(\dfrac{27}{90}\)`, data: V('27/90'), correct: false, misconception: 'nisbah', feedback: R`Corak berulang 2 digit, jadi \(r = 0.01\) dan penyebut 99.` },
      { text: R`\(\dfrac{2}{7}\)`, data: V('2/7'), correct: false, misconception: 'teka', feedback: R`\(\tfrac27 = 0.2857\ldots\)` },
    ], solution: [R`\(0.27 + 0.0027 + \cdots\): \(a = 0.27\), \(r = 0.01\)`, R`\(S_\infty = \dfrac{0.27}{0.99} = \dfrac{3}{11}\)`] }),
  q({ id: 't4-5.2-07', subtopic: '5.2', sp: ['5.2.5'], difficulty: 'mencabar', type: 'numeric', prompt: R`Sebiji bola dijatuhkan dari ketinggian 10 m dan setiap lantunan mencapai \(\tfrac{3}{5}\) ketinggian sebelumnya. Cari jumlah jarak menegak yang dilalui bola.`, answer: 40, unit: 'm', check: { kind: 'bounce', h0: 10, ratio: 0.6 },
    wrong: [{ value: 25, feedback: R`Setiap lantunan dilalui dua kali (naik dan turun): \(10 + 2(15)\).` }, { value: 15, feedback: R`15 ialah jumlah ketinggian lantunan sahaja.` }],
    solution: [R`Lantunan: \(6 + 3.6 + \cdots = \dfrac{6}{1 - 0.6} = 15\)`, R`Jumlah \(= 10 + 2(15) = 40\) m`] }),
  q({ id: 't4-5.2-08', subtopic: '5.2', sp: ['5.2.5'], difficulty: 'mencabar', type: 'numeric', prompt: R`Nilai sebuah mesin ialah RM80 000 dan susut 15% setiap tahun. Selepas berapa tahun penuh nilainya mula kurang daripada RM40 000?`, answer: 5, unit: 'tahun', check: { kind: 'first-n-power-below', a: 80000, r: 0.85, limit: 40000 },
    wrong: [{ value: 4, feedback: R`Selepas 4 tahun nilainya RM41 760.50, belum kurang daripada RM40 000.` }], solution: [R`\(80\,000(0.85)^n < 40\,000 \Rightarrow 0.85^n < 0.5\)`, R`\(n > \dfrac{\lg 0.5}{\lg 0.85} = 4.27\)`, R`\(n = 5\) tahun`] }),
  q({ id: 't4-5.2-09', subtopic: '5.2', sp: ['5.2.2'], difficulty: 'sederhana', type: 'numeric', prompt: R`Dalam suatu JG, \(T_2 = 12\) dan \(T_5 = 96\). Cari nisbah sepunya.`, answer: 2, check: { kind: 'substitute', expr: '12*r^3', variable: 'r', equals: 96 },
    wrong: [{ value: 8, feedback: R`8 ialah \(r^3\). Ambil punca kuasa tiga.` }], solution: [R`\(\dfrac{T_5}{T_2} = \dfrac{ar^4}{ar} = r^3 = 8\)`, R`\(r = 2\)`] }),
  q({ id: 't4-5.2-10', subtopic: '5.2', sp: ['5.2.3', '5.2.4'], difficulty: 'mencabar', type: 'reasoning', prompt: R`Terangkan mengapa JG 1, 2, 4, 8, … tidak mempunyai hasil tambah hingga ketakterhinggaan, sedangkan 1, ½, ¼, … mempunyai.`, check: { kind: 'manual' },
    solution: [R`Dalam \(S_n = \dfrac{a(1 - r^n)}{1 - r}\), jika \(|r| < 1\) maka \(r^n \to 0\), jadi \(S_n \to \dfrac{a}{1 - r}\). Bagi \(r = \tfrac12\): \(S_\infty = 2\).`, R`Jika \(r = 2\), \(r^n\) membesar tanpa had, jadi \(S_n\) juga membesar tanpa had dan tiada nilai yang dihampiri.`] }),
  q({ id: 't4-5.2-11', subtopic: '5.2', sp: ['5.2.1'], difficulty: 'sederhana', type: 'mcq', prompt: R`Jujukan manakah ialah janjang geometri?`, check: { kind: 'seq-type', type: 'gp' },
    options: [
      { text: R`\(0.2, 0.04, 0.008, \ldots\)`, data: T(0.2, 0.04, 0.008), correct: true, feedback: R`Betul. \(r = 0.2\).` },
      { text: R`\(0.2, 0.4, 0.6, \ldots\)`, data: T(0.2, 0.4, 0.6), correct: false, misconception: 'ja-jg', feedback: R`Nisbahnya 2 kemudian 1.5. Ini JA dengan \(d = 0.2\).` },
      { text: R`\(1, 0.1, 0.01, 0.002, \ldots\)`, data: T(1, 0.1, 0.01, 0.002), correct: false, misconception: 'jg', feedback: R`Nisbah terakhir ialah 0.2, bukan 0.1.` },
      { text: R`\(9, 3, 0, -3, \ldots\)`, data: T(9, 3, 0, -3), correct: false, misconception: 'jg', feedback: R`Sebutan sifar tidak boleh berada dalam JG kerana nisbah tidak tertakrif.` },
    ], solution: [R`Hanya \(0.2, 0.04, 0.008\) mempunyai nisbah tetap 0.2.`] }),
];

// Bab 6 question bank (status 'review', original). See tests/validate-notes.mjs.
const R = String.raw;
const P = { origin: 'original', author: 'Claude', createdAt: '2026-11-14', note: 'Ditulis asal untuk laman ini; bukan soalan SPM sebenar.' };
const RV = { autoChecked: true, mathReviewed: null, ownerApproved: { by: 'pemilik', date: '2026-11-14', note: 'Arahan pemilik: terbitkan terus kepada umum' } };
const q = (o) => ({ chapter: 't4-6', status: 'published', provenance: P, review: RV, ...o });
const TB = (xs, ys) => ({ xs, ys });
const BACT = [[0, 50], [1, 80], [2, 128], [3, 204.8], [4, 327.68]];
const PEND = [0.25, 0.5, 1, 1.5, 2].map((L) => [L, 2.006 * Math.sqrt(L)]);

export const QUESTIONS = [
  // ---------------------------------------------------------------- 6.1
  q({ id: 't4-6.1-01', subtopic: '6.1', sp: ['6.1.1'], difficulty: 'mudah', type: 'mcq', prompt: R`Jadual manakah menunjukkan hubungan linear?`, check: { kind: 'table-linear' },
    options: [
      { text: R`\(x\): 0, 1, 2, 3; \(y\): 1, 2, 4, 8`, data: TB([0, 1, 2, 3], [1, 2, 4, 8]), correct: false, misconception: 'beza', feedback: R`Beza \(y\): 1, 2, 4, tidak tetap.` },
      { text: R`\(x\): 0, 2, 4, 6; \(y\): 7, 4, 1, −2`, data: TB([0, 2, 4, 6], [7, 4, 1, -2]), correct: true, feedback: R`Betul. Bagi langkah \(x\) yang tetap (2), \(y\) berkurang dengan jumlah tetap (3).` },
      { text: R`\(x\): 1, 2, 3, 4; \(y\): 1, 4, 9, 16`, data: TB([1, 2, 3, 4], [1, 4, 9, 16]), correct: false, misconception: 'beza', feedback: R`Beza \(y\): 3, 5, 7 (ini \(y = x^2\)).` },
      { text: R`\(x\): 1, 2, 4, 8; \(y\): 2, 3, 4, 5`, data: TB([1, 2, 4, 8], [2, 3, 4, 5]), correct: false, misconception: 'langkah-x', feedback: R`Langkah \(x\) tidak sama (1, 2, 4), tetapi \(y\) bertambah sama banyak, jadi bukan linear.` },
    ], solution: [R`Bandingkan perubahan \(y\) bagi perubahan \(x\) yang sama. Hanya pilihan B: setiap \(+2\) dalam \(x\) memberi \(-3\) dalam \(y\).`] }),
  q({ id: 't4-6.1-02', subtopic: '6.1', sp: ['6.1.3'], difficulty: 'mudah', type: 'numeric', prompt: R`Garis penyuaian terbaik melalui \((2, 5)\) dan \((6, 13)\). Cari kecerunannya.`, answer: 2, check: { kind: 'line-two-points', p1: [2, 5], p2: [6, 13], want: 'm' },
    wrong: [{ value: 0.5, feedback: R`Kecerunan ialah \(\dfrac{\Delta y}{\Delta x} = \dfrac{8}{4}\), bukan \(\dfrac{\Delta x}{\Delta y}\).` }], solution: [R`\(m = \dfrac{13 - 5}{6 - 2} = 2\)`] }),
  q({ id: 't4-6.1-03', subtopic: '6.1', sp: ['6.1.3'], difficulty: 'sederhana', type: 'numeric', prompt: R`Bagi garis yang sama (melalui \((2, 5)\) dan \((6, 13)\)), cari pintasan-\(y\).`, answer: 1, check: { kind: 'line-two-points', p1: [2, 5], p2: [6, 13], want: 'c' },
    wrong: [{ value: 5, feedback: R`5 ialah nilai \(y\) apabila \(x = 2\), bukan \(x = 0\).` }], solution: [R`\(c = 5 - 2(2) = 1\)`] }),
  q({ id: 't4-6.1-04', subtopic: '6.1', sp: ['6.1.4'], difficulty: 'sederhana', type: 'numeric', prompt: R`Garis penyuaian terbaik melalui \((0, 3)\) dan \((4, 11)\). Cari \(x\) apabila \(y = 12\).`, answer: 4.5, check: { kind: 'line-two-points', p1: [0, 3], p2: [4, 11], want: 'x-at', at: 12 },
    wrong: [{ value: 27, derive: '2*12+3', feedback: R`Itu nilai \(y\) apabila \(x = 12\). Diberi \(y = 12\): selesaikan \(12 = 2x + 3\).` }], solution: [R`\(m = 2\), \(c = 3\), jadi \(y = 2x + 3\)`, R`\(12 = 2x + 3 \Rightarrow x = 4.5\)`] }),
  q({ id: 't4-6.1-05', subtopic: '6.1', sp: ['6.1.4'], difficulty: 'mencabar', type: 'numeric', prompt: R`Panjang spring ialah \(L = 0.05m + 12\) (cm), dengan \(m\) dalam gram. Anggarkan panjang spring apabila jisim beban 150 g.`, answer: 19.5, unit: 'cm', check: { kind: 'line-two-points', p1: [0, 12], p2: [100, 17], want: 'y-at', at: 150 },
    wrong: [{ value: 7.5, derive: '0.05*150', feedback: R`7.5 cm ialah pertambahan panjang sahaja. Tambah panjang asal 12 cm.` }], solution: [R`\(L = 0.05(150) + 12 = 7.5 + 12 = 19.5\) cm`] }),
  q({ id: 't4-6.1-06', subtopic: '6.1', sp: ['6.1.4'], difficulty: 'sederhana', type: 'mcq', prompt: R`Bagi \(L = 0.05m + 12\) (spring), apakah maksud 0.05?`, check: { kind: 'manual' },
    options: [
      { text: R`Pertambahan panjang 0.05 cm bagi setiap gram beban.`, correct: true, feedback: R`Betul. Kecerunan ialah kadar perubahan \(L\) terhadap \(m\).` },
      { text: R`Panjang asal spring.`, correct: false, misconception: 'pintasan', feedback: R`Panjang asal ialah pintasan, 12 cm.` },
      { text: R`Jisim maksimum yang boleh ditampung.`, correct: false, misconception: 'tafsiran', feedback: R`Persamaan tidak memberi maklumat had.` },
      { text: R`Panjang apabila \(m = 1\) g.`, correct: false, misconception: 'tafsiran', feedback: R`\(L(1) = 12.05\) cm, bukan 0.05.` },
    ], solution: [R`Dalam \(y = mx + c\), \(m\) ialah perubahan \(y\) bagi setiap 1 unit \(x\): di sini 0.05 cm per gram.`] }),
  q({ id: 't4-6.1-07', subtopic: '6.1', sp: ['6.1.2'], difficulty: 'sederhana', type: 'reasoning', prompt: R`Farid berkata garis penyuaian terbaik mesti melalui titik data pertama dan terakhir. Terangkan mengapa pendapat ini tidak tepat.`, check: { kind: 'manual' },
    solution: [R`Garis penyuaian terbaik mewakili corak <em>semua</em> titik, bukan dua titik tertentu.`, R`Titik pertama atau terakhir mungkin mempunyai ralat ukuran yang besar, dan garis melaluinya akan condong.`, R`Garis sepatutnya mempunyai titik yang tersebar seimbang di kedua-dua belah; ia tidak semestinya melalui mana-mana titik.`] }),
  q({ id: 't4-6.1-08', subtopic: '6.1', sp: ['6.1.2'], difficulty: 'mudah', type: 'mcq', prompt: R`Antara berikut, yang manakah ciri garis penyuaian terbaik yang dilukis dengan kaedah pemerinyuan?`, check: { kind: 'manual' },
    options: [
      { text: R`Titik-titik tersebar lebih kurang seimbang di atas dan di bawah garis.`, correct: true, feedback: R`Betul.` },
      { text: R`Garis menyambung semua titik.`, correct: false, misconception: 'sambung-titik', feedback: R`Itu graf garis "sambung titik", bukan garis penyuaian.` },
      { text: R`Garis mesti melalui asalan.`, correct: false, misconception: 'asalan', feedback: R`Pintasan bergantung pada data.` },
      { text: R`Semua titik mesti berada di atas garis.`, correct: false, misconception: 'seimbang', feedback: R`Titik sepatutnya di kedua-dua belah.` },
    ], solution: [R`Garis penyuaian terbaik mengikut arah corak dengan titik tersebar seimbang di kedua-dua belah.`] }),
  q({ id: 't4-6.1-09', subtopic: '6.1', sp: ['6.1.1'], difficulty: 'sederhana', type: 'mcq', prompt: R`Dengan memerhati graf (bukan jadual), bagaimanakah anda tahu hubungan dua pemboleh ubah adalah linear?`, check: { kind: 'manual' },
    options: [
      { text: R`Titik-titik terletak pada atau hampir pada satu garis lurus.`, correct: true, feedback: R`Betul.` },
      { text: R`Graf melalui asalan.`, correct: false, misconception: 'asalan', feedback: R`\(y = 2x + 1\) linear tetapi tidak melalui asalan.` },
      { text: R`Nilai \(y\) sentiasa bertambah.`, correct: false, misconception: 'menaik', feedback: R`\(y = x^2\) (bagi \(x > 0\)) juga bertambah tetapi melengkung.` },
      { text: R`Graf simetri.`, correct: false, misconception: 'simetri', feedback: R`Parabola simetri tetapi tak linear.` },
    ], solution: [R`Hubungan linear memberi graf garis lurus.`] }),
  // ---------------------------------------------------------------- 6.2
  q({ id: 't4-6.2-01', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'sederhana', type: 'numeric', prompt: R`Bagi \(y = ax^2 + bx\), graf \(\tfrac{y}{x}\) melawan \(x\) ialah garis lurus melalui \((1, 5)\) dan \((3, 11)\). Cari \(a\).`, answer: 3, check: { kind: 'law-from-line', law: 'ax^2+bx', p1: [1, 5], p2: [3, 11], want: 'a' },
    wrong: [{ value: 2, derive: '5-3*1', feedback: R`2 ialah pintasan, iaitu \(b\). Dalam \(\tfrac yx = ax + b\), \(a\) ialah kecerunan.` }], solution: [R`\(\tfrac{y}{x} = ax + b\): kecerunan \(= \dfrac{11 - 5}{3 - 1} = 3 = a\)`] }),
  q({ id: 't4-6.2-02', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'sederhana', type: 'numeric', prompt: R`Daripada soalan sebelumnya (garis melalui \((1, 5)\) dan \((3, 11)\)), cari \(b\).`, answer: 2, check: { kind: 'law-from-line', law: 'ax^2+bx', p1: [1, 5], p2: [3, 11], want: 'b' },
    wrong: [{ value: 3, feedback: R`3 ialah kecerunan, iaitu \(a\). \(b\) ialah pintasan-\(Y\).` }], solution: [R`Pintasan \(= 5 - 3(1) = 2 = b\). Hukum: \(y = 3x^2 + 2x\).`] }),
  q({ id: 't4-6.2-03', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Bagi \(y = ab^x\), graf \(\lg y\) melawan \(x\) ialah garis lurus melalui \((1, 0.778)\) dan \((3, 1.380)\). Cari \(b\) betul kepada dua angka bererti.`, answer: 2, tolerance: 0.003, check: { kind: 'law-from-line', law: 'ab^x', p1: [1, 0.778], p2: [3, 1.38], want: 'b' },
    wrong: [{ value: 0.301, feedback: R`0.301 ialah kecerunan, iaitu \(\lg b\). \(b = 10^{0.301}\).` }], solution: [R`Kecerunan \(= 0.301 = \lg b\)`, R`\(b = 10^{0.301} = 2.0\)`] }),
  q({ id: 't4-6.2-04', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Daripada soalan sebelumnya, cari \(a\) betul kepada dua angka bererti.`, answer: 3, tolerance: 0.003, check: { kind: 'law-from-line', law: 'ab^x', p1: [1, 0.778], p2: [3, 1.38], want: 'a' },
    wrong: [{ value: 0.477, feedback: R`0.477 ialah \(\lg a\). \(a = 10^{0.477}\).` }], solution: [R`Pintasan \(= 0.778 - 0.301 = 0.477 = \lg a\)`, R`\(a = 10^{0.477} = 3.0\)`] }),
  q({ id: 't4-6.2-05', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Bagi \(y = ax^n\), graf \(\lg y\) melawan \(\lg x\) melalui \((0, 0.301)\) dan \((2, 3.301)\). Cari \(n\).`, answer: 1.5, check: { kind: 'law-from-line', law: 'ax^n', p1: [0, 0.301], p2: [2, 3.301], want: 'n' },
    wrong: [{ value: 2, feedback: R`2 ialah \(a = 10^{0.301}\) (daripada pintasan). \(n\) ialah kecerunan graf.` }], solution: [R`Kecerunan \(= \dfrac{3.301 - 0.301}{2} = 1.5 = n\)`] }),
  q({ id: 't4-6.2-06', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Bagi \(y = \dfrac{a}{x} + b\), graf \(y\) melawan \(\tfrac{1}{x}\) melalui \((0.5, 7)\) dan \((0.25, 5)\). Unjurkan \(y\) apabila \(x = 2\).`, answer: 7, check: { kind: 'law-from-line', law: 'a/x+b', p1: [0.5, 7], p2: [0.25, 5], want: 'y-at', at: 2 },
    wrong: [{ value: 19, feedback: R`\(X = \tfrac{1}{x} = 0.5\), bukan 2. \(y = 8(0.5) + 3\).` }], solution: [R`\(a = 8\), \(b = 3\)`, R`\(y(2) = \tfrac{8}{2} + 3 = 7\)`] }),
  q({ id: 't4-6.2-07', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'mudah', type: 'mcq', prompt: R`Untuk menjadikan \(y = ab^x\) linear, apakah yang perlu diplot?`, check: { kind: 'manual' },
    options: [
      { text: R`\(\lg y\) melawan \(x\)`, correct: true, feedback: R`Betul. \(\lg y = (\lg b)x + \lg a\).` },
      { text: R`\(y\) melawan \(\lg x\)`, correct: false, misconception: 'pemboleh-ubah', feedback: R`\(x\) berada dalam indeks, jadi \(\lg\) diambil pada \(y\).` },
      { text: R`\(\lg y\) melawan \(\lg x\)`, correct: false, misconception: 'hukum-kuasa', feedback: R`Itu untuk \(y = ax^n\).` },
      { text: R`\(\tfrac{y}{x}\) melawan \(x\)`, correct: false, misconception: 'hukum-kuadratik', feedback: R`Itu untuk \(y = ax^2 + bx\).` },
    ], solution: [R`Ambil \(\lg\): \(\lg y = x\lg b + \lg a\), jadi \(Y = \lg y\), \(X = x\).`] }),
  q({ id: 't4-6.2-08', subtopic: '6.2', sp: ['6.2.1'], difficulty: 'sederhana', type: 'reasoning', prompt: R`Terangkan mengapa mengambil logaritma menjadikan graf \(y = ax^n\) suatu garis lurus.`, check: { kind: 'manual' },
    solution: [R`\(\lg y = \lg(ax^n) = \lg a + n\lg x\) (hukum hasil darab dan hukum kuasa).`, R`Dengan \(Y = \lg y\) dan \(X = \lg x\), ini menjadi \(Y = nX + \lg a\), iaitu bentuk \(Y = mX + c\), maka graf garis lurus.`] }),
  // ---------------------------------------------------------------- 6.3
  q({ id: 't4-6.3-01', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'mudah', type: 'numeric', prompt: R`Suatu hubungan memberi \(\lg y = 2x + 1\). Cari \(y\) apabila \(x = 0.5\).`, answer: 100, check: { kind: 'value', expr: '10^(2*0.5+1)' },
    wrong: [{ value: 2, feedback: R`2 ialah \(\lg y\). Maka \(y = 10^2\).` }], solution: [R`\(\lg y = 2(0.5) + 1 = 2\)`, R`\(y = 10^2 = 100\)`] }),
  q({ id: 't4-6.3-02', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Data bakteria: \(t = 0, 1, 2, 3, 4\) jam; \(N = 50, 80, 128, 204.8, 327.68\). Dengan menganggap \(N = ab^t\), cari \(b\).`, answer: 1.6, check: { kind: 'law-fit', law: 'ab^x', data: BACT, want: 'b' },
    wrong: [{ value: 0.204, feedback: R`0.204 ialah kecerunan, iaitu \(\lg b\). Cari \(b = 10^{0.204}\).` }], solution: [R`\(\lg N\): 1.699, 1.903, 2.107, 2.311, 2.515 (garis lurus)`, R`Kecerunan \(0.204 = \lg b \Rightarrow b = 1.6\)`] }),
  q({ id: 't4-6.3-03', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'mencabar', type: 'numeric', prompt: R`Data bakteria: \(t = 0, 1, 2, 3, 4\) jam; \(N = 50, 80, 128, 204.8, 327.68\). Dengan menganggap \(N = ab^t\), unjurkan \(N\) pada \(t = 6\), betul kepada dua tempat perpuluhan.`, answer: 838.86, tolerance: 0.006, check: { kind: 'law-fit', law: 'ab^x', data: BACT, want: 'y-at', at: 6 },
    wrong: [{ value: 480, derive: '50*1.6*6', feedback: R`\(b^t\) ialah kuasa, bukan \(b \times t\): \(50(1.6)^6\).` }], solution: [R`\(a = 50\), \(b = 1.6\)`, R`\(N(6) = 50(1.6)^6 = 838.86\)`] }),
  q({ id: 't4-6.3-04', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'sederhana', type: 'numeric', prompt: R`Data bandul: \(L = 0.25, 0.5, 1, 1.5, 2\) m dan \(T = 1.003, 1.4185, 2.006, 2.4568, 2.8369\) s. Dengan menganggap \(T = kL^n\), cari \(n\).`, answer: 0.5, tolerance: 0.0006, check: { kind: 'law-fit', law: 'ax^n', data: PEND, want: 'n' },
    wrong: [{ value: 2.006, feedback: R`2.006 ialah \(k\) (daripada pintasan). \(n\) ialah kecerunan graf \(\lg T\) melawan \(\lg L\).` }], solution: [R`Plot \(\lg T\) melawan \(\lg L\)`, R`Kecerunan \(= 0.5 = n\)`] }),
  q({ id: 't4-6.3-05', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'mencabar', type: 'reasoning', prompt: R`Mengapakah unjuran jauh di luar julat data (contohnya bilangan bakteria selepas 100 jam) mungkin tidak boleh dipercayai?`, check: { kind: 'manual' },
    solution: [R`Hukum hanya disahkan dalam julat data yang diukur.`, R`Dalam keadaan sebenar, faktor lain (makanan, ruang) akhirnya menghadkan pertumbuhan, jadi corak eksponen tidak berterusan selama-lamanya.`, R`Maka unjuran jauh di luar data ialah anggaran kasar sahaja.`] }),
  q({ id: 't4-6.3-06', subtopic: '6.3', sp: ['6.3.1'], difficulty: 'mencabar', type: 'structured', prompt: R`Gunakan data bandul (\(T = kL^n\), dengan \(n = 0.5\)).`,
    parts: [
      { prompt: R`Cari \(k\) betul kepada tiga tempat perpuluhan.`, type: 'numeric', answer: 2.006, tolerance: 0.0006, check: { kind: 'law-fit', law: 'ax^n', data: PEND, want: 'a' }, wrong: [{ value: 0.302, feedback: R`0.302 ialah \(\lg k\) (pintasan). \(k = 10^{0.302}\).` }], solution: [R`Pintasan graf \(\lg T\) melawan \(\lg L\) ialah \(0.3023 = \lg k\)`, R`\(k = 10^{0.3023} = 2.006\)`] },
      { prompt: R`Cari panjang \(L\) (m) bagi tempoh 1.5 s, betul kepada tiga tempat perpuluhan.`, type: 'numeric', answer: 0.559, tolerance: 0.0006, check: { kind: 'substitute', expr: '2.006*sqrt(x)', variable: 'x', equals: 1.5 }, solution: [R`\(1.5 = 2.006\sqrt{L}\)`, R`\(L = \left(\tfrac{1.5}{2.006}\right)^2 = 0.559\) m`] },
    ] }),
];

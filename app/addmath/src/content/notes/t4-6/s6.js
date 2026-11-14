// Bab 6 Hukum Linear (SP 6.1.1–6.1.4, 6.2.1, 6.3.1). Original.
// DSKP: linear vs non-linear from tables and graphs; line of best fit by
// inspection compared with digital technology (need not pass through any
// point); equation of the line; interpretation (y from x and back, gradient
// as rate of change, y-intercept, projection); reducing non-linear relations
// to linear form, finding constants, interpretation and projection;
// problem-based learning.
const R = String.raw;
const DATA = [[1, 3.2], [2, 4.8], [3, 7.3], [4, 8.7], [5, 11.2], [6, 12.9]];
const ls = (pts) => { const n = pts.length, sx = pts.reduce((s, p) => s + p[0], 0), sy = pts.reduce((s, p) => s + p[1], 0), sxx = pts.reduce((s, p) => s + p[0] ** 2, 0), sxy = pts.reduce((s, p) => s + p[0] * p[1], 0); const m = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { m, c: (sy - m * sx) / n }; };
const FIT = ls(DATA);
const lg = Math.log10;

export const S6_1 = {
  id: '6.1', sk: '6.1', title: 'Hubungan Linear dan Tak Linear', sp: ['6.1.1', '6.1.2', '6.1.3', '6.1.4'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Data eksperimen tidak pernah sempurna', html: R`
      <p>Dalam eksperimen sains, anda menggantung beban pada spring dan mengukur panjangnya. Titik-titik data hampir segaris, tetapi tidak tepat, kerana setiap ukuran ada sedikit ralat.</p>
      <p>Untuk meringkaskan corak dan meramal nilai baharu, kita lukis satu <strong>garis lurus penyuaian terbaik</strong>, iaitu garis yang paling mewakili semua titik.</p>` },
    { kind: 'concept', title: 'Linear atau tak linear?', sp: ['6.1.1'], html: R`
      <p><strong>Daripada jadual:</strong> jika \(x\) bertambah dengan langkah yang sama dan \(y\) juga berubah dengan jumlah yang sama, hubungan itu <strong>linear</strong>. Contoh:</p>
      <table class="mini-table"><tr><th>\(x\)</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>\(y\)</th><td>5</td><td>8</td><td>11</td><td>14</td></tr></table>
      <p>Beza \(y\): 3, 3, 3, jadi linear. Bandingkan dengan \(y\): 2, 5, 10, 17 (beza 3, 5, 7), yang tak linear.</p>
      <p><strong>Daripada graf:</strong> hubungan linear memberi titik-titik pada (atau hampir pada) satu garis lurus. Hubungan tak linear memberi lengkung.</p>` },
    { kind: 'concept', title: 'Garis lurus penyuaian terbaik', sp: ['6.1.2'], html: R`
      <p><strong>Kaedah pemerinyuan</strong> (dengan mata): lukis garis lurus supaya titik-titik tersebar seimbang di kedua-dua belah, kira-kira sama banyak di atas dan di bawah, dan mengikut arah corak.</p>
      <p>Garis ini <strong>tidak semestinya melalui mana-mana titik</strong>. Ia mewakili corak keseluruhan, bukan menyambung titik.</p>
      <p><strong>Teknologi digital</strong> (kalkulator grafik, hamparan) menggunakan kaedah kuasa dua terkecil, yang meminimumkan jumlah kuasa dua jarak menegak titik dari garis. Bandingkan garis anda dengan garis itu.</p>` },
    { kind: 'visual', title: 'Cuba lukis garis anda sendiri', html: R`<p>Laraskan kecerunan \(m\) dan pintasan \(c\) garis biru sehingga ia mewakili titik-titik dengan baik. Garis kelabu putus-putus ialah garis daripada teknologi digital (kuasa dua terkecil).</p>`,
      spec: { type: 'plot', x: [0, 7], y: [0, 15], grid: 1, labelStep: 2, params: [{ name: 'm', label: R`kecerunan \(m\)`, min: 0.5, max: 3.5, step: 0.1, value: 1.5 }, { name: 'c', label: R`pintasan \(c\)`, min: -2, max: 5, step: 0.1, value: 2 }],
        points: DATA.map(([x, y]) => ({ at: () => [x, y] })),
        curves: [{ f: (x) => FIT.m * x + FIT.c, dashed: true, color: '#9AA3B5' }, { f: (x, p) => p.m * x + p.c, color: '#3467D4' }],
        readout: (p, { fmt }) => { const sse = DATA.reduce((s, [x, y]) => s + (y - (p.m * x + p.c)) ** 2, 0), best = DATA.reduce((s, [x, y]) => s + (y - (FIT.m * x + FIT.c)) ** 2, 0); const above = DATA.filter(([x, y]) => y > p.m * x + p.c).length; return R`Garis anda: \(y = ${fmt(+p.m.toFixed(1))}x ${p.c < 0 ? '-' : '+'} ${fmt(Math.abs(+p.c.toFixed(1)))}\); ${above} titik di atas, ${DATA.length - above} di bawah; jumlah kuasa dua sisihan \(= ${fmt(+sse.toFixed(2))}\). Teknologi digital: \(y = ${fmt(+FIT.m.toFixed(3))}x + ${fmt(+FIT.c.toFixed(3))}\) (jumlah \(${fmt(+best.toFixed(2))}\), yang paling kecil mungkin).`; } },
      alt: R`Enam titik data: (1, 3.2), (2, 4.8), (3, 7.3), (4, 8.7), (5, 11.2), (6, 12.9). Garis kuasa dua terkecil ialah lebih kurang y = 1.974x + 1.107. Ia tidak melalui sebarang titik tepat, tetapi titik-titik tersebar seimbang di kedua-dua belahnya.` },
    { kind: 'concept', title: 'Persamaan garis penyuaian terbaik', sp: ['6.1.3'], html: R`
      <p>Pilih <strong>dua titik pada garis yang dilukis</strong>, yang jauh antara satu sama lain (bukan semestinya titik data). Kemudian:</p>
      \[m = \frac{y_2 - y_1}{x_2 - x_1}, \qquad c = y_1 - m x_1, \qquad y = mx + c\]` },
    { kind: 'concept', title: 'Mentafsir garis penyuaian terbaik', sp: ['6.1.4'], html: R`
      <ul><li><strong>Diberi \(x\), cari \(y\):</strong> gantikan ke dalam persamaan, atau baca dari graf.</li><li><strong>Diberi \(y\), cari \(x\):</strong> selesaikan persamaan.</li><li><strong>Kecerunan</strong> ialah kadar perubahan: setiap pertambahan 1 unit \(x\) mengubah \(y\) sebanyak \(m\) unit.</li><li><strong>Pintasan-\(y\)</strong> ialah nilai \(y\) apabila \(x = 0\) (contohnya panjang asal spring tanpa beban).</li><li><strong>Unjuran:</strong> anggaran di luar julat data. Gunakan dengan berhati-hati, kerana corak mungkin berubah di luar data yang diukur.</li></ul>` },
    { kind: 'formula', items: [{ tex: R`y = mx + c, \quad m = \frac{y_2 - y_1}{x_2 - x_1}`, html: R`\(m\): kadar perubahan \(y\) terhadap \(x\); \(c\): nilai \(y\) apabila \(x = 0\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['6.1.1'], question: R`Jadual A: \(x = 1, 2, 3, 4\); \(y = 5, 8, 11, 14\). Jadual B: \(x = 1, 2, 3, 4\); \(y = 2, 5, 10, 17\). Yang manakah linear?`, given: R`dua jadual`, find: R`hubungan linear`, method: R`Langkah \(x\) sama, jadi bandingkan beza \(y\).`,
        steps: [{ do: R`A: beza 3, 3, 3, jadi linear` }, { do: R`B: beza 3, 5, 7, jadi tak linear (sebenarnya \(y = x^2 + 1\))` }],
        check: R`A memenuhi \(y = 3x + 2\) ✓`, conclusion: R`A linear; B tak linear.` },
      { level: 'sederhana', sp: ['6.1.2', '6.1.3'], question: R`Garis penyuaian terbaik bagi data dalam visual di atas dilukis melalui titik \((1, 3)\) dan \((6, 13)\) (titik pada garis, bukan titik data). Cari persamaannya.`, given: R`dua titik pada garis`, find: R`\(y = mx + c\)`, method: R`Kecerunan, kemudian pintasan.`,
        steps: [{ do: R`\(m = \dfrac{13 - 3}{6 - 1} = 2\)` }, { do: R`\(c = 3 - 2(1) = 1\)` }],
        check: R`Garis teknologi digital \(y \approx 1.97x + 1.11\) hampir sama ✓`, conclusion: R`\(y = 2x + 1\).` },
      { level: 'sederhana', sp: ['6.1.4'], question: R`Menggunakan \(y = 2x + 1\), cari \(y\) apabila \(x = 4.5\), dan \(x\) apabila \(y = 9\). Tafsirkan kecerunannya.`, given: R`\(y = 2x + 1\)`, find: R`\(y(4.5)\); \(x\) bila \(y = 9\); maksud \(m\)`, method: R`Gantikan; selesaikan.`,
        steps: [{ do: R`\(y = 2(4.5) + 1 = 10\)` }, { do: R`\(9 = 2x + 1 \Rightarrow x = 4\)` }, { do: R`\(m = 2\): setiap kali \(x\) bertambah 1, \(y\) bertambah 2` }],
        check: R`\(2(4) + 1 = 9\) ✓`, conclusion: R`\(y = 10\); \(x = 4\); kadar perubahan 2.` },
      { level: 'mencabar', sp: ['6.1.4'], question: R`Garis penyuaian terbaik bagi panjang spring \(L\) (cm) melawan jisim beban \(m\) (g), untuk data \(0 \le m \le 200\), ialah \(L = 0.05m + 12\). Tafsirkan pintasan dan kecerunan, dan anggarkan \(L\) bagi \(m = 300\).`, given: R`\(L = 0.05m + 12\)`, find: R`tafsiran dan unjuran`, method: R`Maksud fizikal setiap pemalar.`,
        steps: [{ do: R`Pintasan 12: panjang asal spring tanpa beban ialah 12 cm` }, { do: R`Kecerunan 0.05: spring memanjang 0.05 cm bagi setiap gram (5 cm bagi 100 g)` }, { do: R`\(L(300) = 15 + 12 = 27\) cm`, why: R`Ini unjuran di luar julat data. Spring mungkin melepasi had kenyalnya, jadi anggaran ini perlu dianggap kasar.` }],
        check: R`Unit: cm/g × g = cm ✓`, conclusion: R`Panjang asal 12 cm; kadar 0.05 cm/g; anggaran 27 cm (dengan berhati-hati).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Garis penyuaian terbaik mesti melalui titik pertama dan terakhir.`, why: R`Dua titik itu mungkin mempunyai ralat besar.`, fix: R`Seimbangkan semua titik di kedua-dua belah garis.` },
      { wrong: R`Mengira kecerunan menggunakan dua titik data yang tidak berada pada garis.`, why: R`Persamaan mesti mewakili garis, bukan dua titik sahaja.`, fix: R`Pilih dua titik pada garis yang dilukis.` },
      { wrong: R`Mempercayai unjuran jauh di luar julat data.`, why: R`Corak mungkin berubah.`, fix: R`Nyatakan bahawa unjuran ialah anggaran.` },
    ] },
    { kind: 'summary', points: [R`Linear: beza \(y\) tetap (bagi langkah \(x\) tetap), titik-titik segaris.`, R`Garis penyuaian terbaik: titik tersebar seimbang; bandingkan dengan teknologi digital.`, R`\(m\) ialah kadar perubahan; \(c\) ialah nilai \(y\) apabila \(x = 0\); unjuran dibuat dengan berhati-hati.`] },
    { kind: 'next', html: R`<p>Dalam <strong>6.2</strong>, hubungan yang melengkung (contohnya \(y = ab^x\)) ditukar menjadi garis lurus supaya teknik yang sama boleh digunakan.</p>`, links: [{ href: '#/nota/t4-6/6.2', label: '6.2 Hukum Linear →' }] },
  ],
};

export const S6_2 = {
  id: '6.2', sk: '6.2', title: 'Hukum Linear dan Hubungan Tak Linear', sp: ['6.2.1'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Meluruskan lengkung', html: R`
      <p>Lebih mudah mengenal pasti garis lurus daripada lengkung, dan pemalar garis lurus (\(m\), \(c\)) mudah dibaca. Jadi jika data mengikut hukum tak linear seperti \(y = 3 \cdot 2^x\), kita tukar pemboleh ubah supaya graf baharu menjadi garis lurus.</p>` },
    { kind: 'concept', title: 'Menukar kepada bentuk Y = mX + c', sp: ['6.2.1'], html: R`
      <p>Susun semula hukum supaya ia kelihatan seperti \(Y = mX + c\), dengan \(Y\) dan \(X\) ialah ungkapan yang boleh dikira daripada data:</p>
      <table class="mini-table"><thead><tr><th>Hukum</th><th>Bentuk linear</th><th>\(Y\)</th><th>\(X\)</th><th>\(m\)</th><th>\(c\)</th></tr></thead><tbody>
        <tr><td>\(y = ax^2 + bx\)</td><td>\(\tfrac{y}{x} = ax + b\)</td><td>\(\tfrac{y}{x}\)</td><td>\(x\)</td><td>\(a\)</td><td>\(b\)</td></tr>
        <tr><td>\(y = \tfrac{a}{x} + b\)</td><td>\(y = a\left(\tfrac{1}{x}\right) + b\)</td><td>\(y\)</td><td>\(\tfrac{1}{x}\)</td><td>\(a\)</td><td>\(b\)</td></tr>
        <tr><td>\(y = ab^x\)</td><td>\(\lg y = (\lg b)x + \lg a\)</td><td>\(\lg y\)</td><td>\(x\)</td><td>\(\lg b\)</td><td>\(\lg a\)</td></tr>
        <tr><td>\(y = ax^n\)</td><td>\(\lg y = n\lg x + \lg a\)</td><td>\(\lg y\)</td><td>\(\lg x\)</td><td>\(n\)</td><td>\(\lg a\)</td></tr>
      </tbody></table>
      <p>Bagi hukum eksponen dan kuasa, kita ambil \(\lg\) kedua-dua belah (Bab 4). Hukum logaritma menukar darab menjadi tambah dan kuasa menjadi darab, dan itulah yang menjadikan graf linear.</p>
      <p><strong>Penentuan pemalar:</strong> cari \(m\) dan \(c\) daripada garis lurus, kemudian padankan dengan jadual. Contohnya jika \(\lg b = m\), maka \(b = 10^m\).</p>` },
    { kind: 'visual', title: 'Lengkung menjadi garis lurus', html: R`<p>Data daripada \(y = 3 \cdot 2^x\). Lajur \(y\) bertambah semakin cepat (tak linear), tetapi lajur \(\lg y\) bertambah dengan jumlah tetap, lebih kurang 0.301 setiap langkah, iaitu \(\lg 2\). Jadi graf \(\lg y\) melawan \(x\) ialah garis lurus.</p>`,
      spec: { type: 'table', xs: [0, 1, 2, 3, 4, 5], input: true, columns: [{ head: R`\(x\)` }, { head: R`\(y = 3 \cdot 2^x\)`, f: (x) => 3 * 2 ** x }, { head: R`\(\lg y\)`, f: (x) => +lg(3 * 2 ** x).toFixed(4) }] },
      alt: R`Jadual: x = 0, 1, 2, 3, 4, 5 memberi y = 3, 6, 12, 24, 48, 96 dan lg y = 0.4771, 0.7782, 1.0792, 1.3802, 1.6812, 1.9823. Beza lg y sentiasa 0.3010 (= lg 2), jadi lg y melawan x ialah garis lurus dengan kecerunan lg 2 dan pintasan lg 3.` },
    { kind: 'formula', items: [{ tex: R`y = ab^x \;\Rightarrow\; \lg y = (\lg b)\,x + \lg a`, html: R`Plot \(\lg y\) melawan \(x\): kecerunan \(\lg b\), pintasan \(\lg a\).` }, { tex: R`y = ax^n \;\Rightarrow\; \lg y = n \lg x + \lg a`, html: R`Plot \(\lg y\) melawan \(\lg x\): kecerunan \(n\), pintasan \(\lg a\).` }] },
    { kind: 'examples', items: [
      { level: 'sederhana', sp: ['6.2.1'], question: R`Pemboleh ubah \(x\) dan \(y\) dihubungkan oleh \(y = ax^2 + bx\). Graf \(\tfrac{y}{x}\) melawan \(x\) ialah garis lurus melalui \((1, 5)\) dan \((4, 14)\). Cari \(a\) dan \(b\).`, given: R`dua titik pada garis \(\tfrac{y}{x}\) melawan \(x\)`, find: R`\(a\), \(b\)`, method: R`\(\tfrac{y}{x} = ax + b\): kecerunan \(a\), pintasan \(b\).`,
        steps: [{ do: R`\(m = \dfrac{14 - 5}{4 - 1} = 3\), jadi \(a = 3\)` }, { do: R`\(c = 5 - 3(1) = 2\), jadi \(b = 2\)` }],
        check: R`\(y = 3x^2 + 2x\): bagi \(x = 4\), \(y = 56\) dan \(\tfrac{56}{4} = 14\) ✓`, conclusion: R`\(a = 3\), \(b = 2\).` },
      { level: 'mencabar', sp: ['6.2.1'], question: R`Bagi \(y = ab^x\), graf \(\lg y\) melawan \(x\) ialah garis lurus melalui \((1, 0.778)\) dan \((3, 1.380)\). Cari \(a\) dan \(b\).`, given: R`dua titik pada garis \(\lg y\) melawan \(x\)`, find: R`\(a\), \(b\)`, method: R`\(\lg y = (\lg b)x + \lg a\).`,
        steps: [{ do: R`Kecerunan \(= \dfrac{1.380 - 0.778}{3 - 1} = 0.301 = \lg b\), jadi \(b = 10^{0.301} = 2.00\)` }, { do: R`Pintasan \(= 0.778 - 0.301 = 0.477 = \lg a\), jadi \(a = 10^{0.477} = 3.00\)` }],
        check: R`\(y = 3(2)^x\): \(\lg y(3) = \lg 24 = 1.380\) ✓`, conclusion: R`\(a = 3\), \(b = 2\), iaitu \(y = 3(2^x)\).` },
      { level: 'mencabar', sp: ['6.2.1'], question: R`Bagi \(y = ax^n\), graf \(\lg y\) melawan \(\lg x\) mempunyai kecerunan 1.5 dan pintasan 0.301. Cari \(a\) dan \(n\), kemudian anggarkan \(y\) apabila \(x = 4\).`, given: R`kecerunan dan pintasan`, find: R`\(a, n, y(4)\)`, method: R`\(\lg y = n\lg x + \lg a\).`,
        steps: [{ do: R`\(n = 1.5\)` }, { do: R`\(\lg a = 0.301 \Rightarrow a = 2.00\)` }, { do: R`\(y = 2(4)^{1.5} = 2(8) = 16\)` }],
        check: R`\(\lg 16 = 1.204\) dan \(1.5\lg 4 + 0.301 = 0.903 + 0.301 = 1.204\) ✓`, conclusion: R`\(a = 2\), \(n = 1.5\), \(y = 16\).` },
      { level: 'mencabar', sp: ['6.2.1'], question: R`Bagi \(y = \dfrac{a}{x} + b\), graf \(y\) melawan \(\tfrac{1}{x}\) melalui \((0.5, 7)\) dan \((0.25, 5)\). Cari \(a\) dan \(b\), dan unjurkan \(y\) apabila \(x = 4\).`, given: R`dua titik`, find: R`\(a, b, y(4)\)`, method: R`\(Y = y\), \(X = \tfrac{1}{x}\).`,
        steps: [{ do: R`\(a = \dfrac{7 - 5}{0.5 - 0.25} = 8\)` }, { do: R`\(b = 7 - 8(0.5) = 3\)` }, { do: R`\(y(4) = \tfrac{8}{4} + 3 = 5\)`, why: R`\(x = 4\) bermaksud \(X = 0.25\), iaitu salah satu titik yang diberi.` }],
        check: R`Titik \((0.25, 5)\) memberi \(y = 5\) ✓`, conclusion: R`\(a = 8\), \(b = 3\), \(y(4) = 5\).` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Bagi \(y = ab^x\), menganggap kecerunan ialah \(b\).`, why: R`Kecerunan ialah \(\lg b\).`, fix: R`\(b = 10^{\text{kecerunan}}\).` },
      { wrong: R`\(\lg(ab^x) = \lg a \times x\lg b\)`, why: R`Hukum hasil darab menukar darab kepada <em>tambah</em>.`, fix: R`\(\lg a + x\lg b\).` },
      { wrong: R`Membaca pintasan pada paksi yang salah apabila \(X = \lg x\).`, why: R`Pintasan berlaku apabila \(X = 0\), iaitu \(x = 1\), bukan \(x = 0\).`, fix: R`Fikir dalam sebutan \(X\) dan \(Y\).` },
    ] },
    { kind: 'summary', points: [R`Tulis hukum dalam bentuk \(Y = mX + c\), kemudian kenal pasti \(X\), \(Y\), \(m\) dan \(c\).`, R`Hukum eksponen dan kuasa: ambil \(\lg\) dahulu.`, R`Pemalar daripada \(m\) dan \(c\); gunakan semula hukum asal untuk unjuran.`] },
    { kind: 'next', html: R`<p>Dalam <strong>6.3</strong>, kaedah ini digunakan pada data sebenar daripada eksperimen.</p>`, links: [{ href: '#/nota/t4-6/6.3', label: '6.3 Aplikasi →' }] },
  ],
};

export const S6_3 = {
  id: '6.3', sk: '6.3', title: 'Aplikasi Hukum Linear', sp: ['6.3.1'], status: 'review', minutes: 40,
  sections: [
    { kind: 'intro', title: 'Mencari hukum tersembunyi dalam data', html: R`<p>Ahli sains sering mempunyai jadual data tanpa rumus. Jika kita meneka bentuk hukum (contohnya \(T = kL^n\) bagi bandul), hukum linear membolehkan kita mengesahkan tekaan itu dan mencari pemalarnya daripada graf.</p>` },
    { kind: 'concept', title: 'Langkah penyelesaian masalah', sp: ['6.3.1'], html: R`
      <ol><li>Teka bentuk hukum daripada konteks atau corak data.</li><li>Tukar kepada bentuk linear dan bina jadual \(X\), \(Y\).</li><li>Plot \(Y\) melawan \(X\). Jika titik hampir segaris, tekaan disokong. Lukis garis penyuaian terbaik.</li><li>Cari \(m\) dan \(c\), kemudian pemalar hukum.</li><li>Gunakan hukum untuk menjawab soalan, dan semak dengan sekurang-kurangnya satu titik data.</li></ol>` },
    { kind: 'visual', title: 'Data bandul ringkas', html: R`<p>Tempoh ayunan \(T\) (s) bagi bandul dengan panjang \(L\) (m). Lajur \(\lg T\) dan \(\lg L\) menunjukkan hubungan linear dengan kecerunan 0.5, sepadan dengan \(T = kL^{0.5}\).</p>`,
      spec: { type: 'table', xs: [0.25, 0.5, 1, 1.5, 2], input: true, columns: [{ head: R`\(L\) (m)` }, { head: R`\(T = 2.006\sqrt{L}\)`, f: (L) => +(2.006 * Math.sqrt(L)).toFixed(4) }, { head: R`\(\lg L\)`, f: (L) => +lg(L).toFixed(4) }, { head: R`\(\lg T\)`, f: (L) => +lg(2.006 * Math.sqrt(L)).toFixed(4) }] },
      alt: R`Jadual bandul: L = 0.25, 0.5, 1, 1.5, 2 m memberi T = 1.003, 1.4185, 2.006, 2.4568, 2.8369 s. Apabila lg L bertambah 0.301 (L berganda), lg T bertambah 0.1505, iaitu separuh. Jadi lg T melawan lg L ialah garis lurus dengan kecerunan 0.5 dan pintasan lg 2.006 = 0.3023.` },
    { kind: 'formula', items: [{ tex: R`T = kL^n \;\Rightarrow\; \lg T = n\lg L + \lg k`, html: R`Hukum kuasa: plot \(\lg T\) melawan \(\lg L\).` }] },
    { kind: 'examples', items: [
      { level: 'mencabar', sp: ['6.3.1'], question: R`Gunakan data bandul untuk mencari \(k\) dan \(n\) dalam \(T = kL^n\), kemudian cari panjang bandul yang tempohnya 1.5 s.`, given: R`jadual \(L\), \(T\)`, find: R`\(k\), \(n\), \(L\)`, method: R`Plot \(\lg T\) melawan \(\lg L\).`,
        steps: [{ do: R`Titik \((\lg L, \lg T)\): \((-0.602, 0.0013)\), …, \((0, 0.3023)\), …` }, { do: R`Kecerunan \(= \dfrac{0.3023 - 0.0013}{0 - (-0.602)} = 0.500\), jadi \(n = 0.5\)` }, { do: R`Pintasan \(= 0.3023 = \lg k\), jadi \(k = 2.006\)` }, { do: R`\(1.5 = 2.006\sqrt{L} \Rightarrow L = \left(\tfrac{1.5}{2.006}\right)^2 = 0.559\) m` }],
        check: R`\(2.006\sqrt{0.559} = 1.500\) ✓`, conclusion: R`\(T = 2.006L^{0.5}\); panjang \(\approx 0.559\) m.` },
      { level: 'mencabar', sp: ['6.3.1'], question: R`Bilangan bakteria \(N\) pada masa \(t\) jam: \(t = 0, 1, 2, 3, 4\); \(N = 50, 80, 128, 204.8, 327.68\). Tunjukkan \(N = ab^t\), cari \(a\) dan \(b\), dan unjurkan \(N\) pada \(t = 6\).`, given: R`jadual data`, find: R`\(a, b, N(6)\)`, method: R`Plot \(\lg N\) melawan \(t\).`,
        steps: [{ do: R`\(\lg N\): 1.699, 1.903, 2.107, 2.311, 2.515, bertambah 0.204 setiap jam, jadi linear ✓` }, { do: R`Kecerunan \(0.204 = \lg b\), jadi \(b = 1.6\); pintasan \(1.699 = \lg a\), jadi \(a = 50\)` }, { do: R`\(N(6) = 50(1.6)^6 = 838.86\)` }],
        check: R`\(50(1.6)^3 = 204.8\) ✓`, conclusion: R`\(N = 50(1.6)^t\); \(N(6) \approx 839\).` },
    ] },
    { kind: 'mistakes', items: [{ wrong: R`Menggunakan \(L\) dan \(T\) asal untuk mencari kecerunan.`, why: R`Graf \(T\) melawan \(L\) ialah lengkung, bukan garis lurus.`, fix: R`Gunakan \(\lg L\) dan \(\lg T\).` }, { wrong: R`Membundarkan \(\lg\) kepada 1 tempat perpuluhan.`, why: R`Ralat kecil dalam \(\lg\) menjadi besar selepas \(10^{(\ldots)}\).`, fix: R`Simpan sekurang-kurangnya 3–4 tempat perpuluhan.` }] },
    { kind: 'summary', points: [R`Teka bentuk hukum, tukar kepada bentuk linear, plot, cari pemalar, semak dengan data.`] },
    { kind: 'next', html: R`<p><strong>Bab 7 Geometri Koordinat</strong> mengkaji garis lurus dan bentuk pada satah Cartes dengan lebih mendalam.</p>`, links: [{ href: '#/bab/t4-6', label: 'Kembali ke Bab 6' }] },
  ],
};

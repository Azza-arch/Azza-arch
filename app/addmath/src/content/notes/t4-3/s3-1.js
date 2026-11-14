// Bab 3 · 3.1 Sistem Persamaan Linear dalam Tiga Pemboleh Ubah (SP 3.1.1–3.1.3).
// DSKP scope: real-life situations; three linear equations in three
// variables; planes may be introduced; compare with two variables;
// elimination and substitution; the NO-SOLUTION case must be discussed.
const R = String.raw;
const L1 = (k) => (x) => 6 - k - x, L2 = (k) => (x) => 2 * x - 3 + k, L3 = (k) => (x) => (2 + k - x) / 2;

export const S3_1 = {
  id: '3.1', sk: '3.1', title: 'Sistem Persamaan Linear dalam Tiga Pemboleh Ubah', sp: ['3.1.1', '3.1.2', '3.1.3'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Tiga barang, tiga resit', html: R`
      <p>Di koperasi sekolah, harga sebatang pen, sebuah buku latihan dan sebiji pemadam tidak dipaparkan. Anda cuma ada tiga resit lama:</p>
      <ul><li>2 pen + 1 buku + 3 pemadam = RM8.50</li><li>1 pen + 2 buku + 1 pemadam = RM10.00</li><li>3 pen + 1 buku + 2 pemadam = RM9.50</li></ul>
      <p>Ada <strong>tiga</strong> nilai yang tidak diketahui, jadi kita perlukan <strong>tiga</strong> maklumat (persamaan). Gabungan persamaan seperti ini dipanggil <strong>sistem persamaan linear dalam tiga pemboleh ubah</strong>. Di akhir subtopik ini, anda akan dapat mencari harga setiap barang.</p>` },
    { kind: 'prereq', title: 'Imbas kembali: dua persamaan, dua pemboleh ubah', html: R`
      <p>Dalam Tingkatan 3, anda menyelesaikan \(x + y = 5\) dan \(x - y = 1\). Tambah kedua-duanya: \(2x = 6\), jadi \(x = 3\) dan \(y = 2\). Setiap persamaan linear dua pemboleh ubah ialah satu <strong>garis lurus</strong>, dan penyelesaiannya ialah titik persilangan kedua-dua garis.</p>` },
    { kind: 'concept', title: 'Apakah sistem tiga pemboleh ubah?', sp: ['3.1.1'], html: R`
      <p>Sistem persamaan linear dalam tiga pemboleh ubah mempunyai bentuk:</p>
      \[\begin{aligned} a_1x + b_1y + c_1z &= d_1 \\ a_2x + b_2y + c_2z &= d_2 \\ a_3x + b_3y + c_3z &= d_3 \end{aligned}\]
      <p>Setiap persamaan adalah <em>linear</em>, iaitu tiada \(x^2\), \(xy\) atau \(\tfrac{1}{x}\). <strong>Penyelesaian</strong> ialah satu set \((x, y, z)\) yang memenuhi <em>ketiga-tiga</em> persamaan serentak.</p>
      <p>Dalam ruang tiga dimensi, setiap persamaan mewakili sebuah <strong>satah</strong>. Penyelesaian unik ialah titik di mana ketiga-tiga satah bertemu. Bandingkan dengan dua pemboleh ubah, di mana setiap persamaan ialah garis dan penyelesaian ialah titik persilangan dua garis.</p>` },
    { kind: 'visual', title: 'Potong satah pada ketinggian z = k', html: R`<p>Sistem: \(x + y + z = 6\), \(2x - y + z = 3\), \(x + 2y - z = 2\). Jika kita tetapkan \(z = k\), setiap satah menjadi satu garis pada satah-\(xy\). Gerakkan \(k\). Ketiga-tiga garis bertemu di satu titik <strong>hanya</strong> apabila \(k\) ialah nilai \(z\) penyelesaian.</p>`,
      spec: { type: 'plot', x: [-2, 6], y: [-2, 6], params: [{ name: 'k', label: R`\(k\) (nilai \(z\))`, min: 0, max: 6, step: 0.5, value: 1 }],
        curves: [{ f: (x, p) => L1(p.k)(x) }, { f: (x, p) => L2(p.k)(x), color: '#D9534F' }, { f: (x, p) => L3(p.k)(x), color: '#2E9E6B' }],
        readout: (p, { fmt }) => p.k === 3 ? R`Pada \(z = 3\), ketiga-tiga garis bersilang di \((1, 2)\). Penyelesaian sistem ialah \((x, y, z) = (1, 2, 3)\).` : R`Pada \(z = ${fmt(p.k)}\), garis-garis itu membentuk segi tiga kecil dan tidak bertemu di satu titik. Cuba nilai \(k\) yang lain.` },
      alt: R`Bagi setiap nilai z = k, tiga satah dipotong menjadi tiga garis: y = 6 − k − x, y = 2x − 3 + k, dan y = (2 + k − x)/2. Hanya apabila k = 3, ketiga-tiga garis bertemu di titik (1, 2). Ini menunjukkan penyelesaian unik (1, 2, 3).` },
    { kind: 'concept', title: 'Kaedah penghapusan dan penggantian', sp: ['3.1.2'], html: R`
      <p><strong>Strategi:</strong> kurangkan masalah tiga pemboleh ubah kepada masalah dua pemboleh ubah yang sudah anda kuasai.</p>
      <ol><li>Pilih satu pemboleh ubah untuk dihapuskan (biasanya yang pekalinya mudah, contohnya \(z\) dengan pekali \(\pm 1\)).</li><li>Gabungkan dua pasangan persamaan untuk menghapuskannya. Hasilnya dua persamaan baharu dalam dua pemboleh ubah.</li><li>Selesaikan sistem dua pemboleh ubah itu.</li><li>Gantikan semula untuk mencari pemboleh ubah ketiga.</li><li><strong>Semak</strong> dalam ketiga-tiga persamaan asal.</li></ol>
      <p><strong>Penggantian</strong> lebih pantas jika satu persamaan sudah memberi satu pemboleh ubah secara terus (contohnya \(x = 2y\)).</p>` },
    { kind: 'concept', title: 'Bila tiada penyelesaian', sp: ['3.1.2'], html: R`
      <p>Tidak semua sistem mempunyai penyelesaian. Contohnya \(x + y + z = 4\) dan \(2x + 2y + 2z = 10\). Persamaan kedua bermaksud \(x + y + z = 5\). Jumlah yang sama tidak boleh bernilai 4 <em>dan</em> 5, jadi sistem itu <strong>tiada penyelesaian</strong>. Kedua-dua satah selari dan tidak pernah bertemu.</p>
      <p>Semasa penghapusan, tanda sistem tiada penyelesaian ialah pernyataan palsu seperti \(0 = 2\).</p>
      <p class="callout">Ada juga sistem dengan <em>banyak</em> penyelesaian, misalnya apabila satu persamaan hanya gandaan persamaan lain. Dalam kes ini, kita tidak boleh menentukan nilai unik.</p>` },
    { kind: 'concept', title: 'Memodelkan masalah sebenar', sp: ['3.1.3'], html: R`
      <ol><li><strong>Namakan</strong> tiga perkara yang tidak diketahui, dengan unit (contohnya \(p\) = harga sebatang pen dalam RM).</li><li><strong>Terjemah</strong> setiap maklumat kepada satu persamaan. Pastikan ada tiga maklumat yang berbeza.</li><li><strong>Selesaikan</strong> dengan penghapusan atau penggantian.</li><li><strong>Tafsir</strong> jawapan dalam konteks: bilangan orang mesti nombor bulat tidak negatif, harga mesti positif. Jika jawapan tidak munasabah, semak semula persamaan anda.</li></ol>
      <p>Petua: ayat seperti "A ialah 1 lebih daripada B" memberi persamaan ringkas \(A = B + 1\). Gunakan ia untuk penggantian.</p>` },
    { kind: 'formula', items: [
      { tex: R`\text{3 pemboleh ubah} \Rightarrow \text{perlukan 3 persamaan bebas}`, html: R`Dua persamaan sahaja tidak cukup untuk menentukan tiga nilai unik.` },
      { tex: R`0 = k,\ k \neq 0 \;\Rightarrow\; \text{tiada penyelesaian}`, html: R`Pernyataan palsu semasa penghapusan menunjukkan sistem tidak konsisten.` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['3.1.1'], question: R`Tentukan sama ada \((1, 2, 3)\) ialah penyelesaian bagi sistem \(x + y + z = 6\), \(2x - y + z = 3\), \(x + 2y - z = 2\).`, given: R`calon \((x, y, z) = (1, 2, 3)\)`, find: R`adakah ia memenuhi ketiga-tiga persamaan`, method: R`Gantikan ke dalam setiap persamaan.`,
        steps: [{ do: R`\(1 + 2 + 3 = 6\) ✓` }, { do: R`\(2(1) - 2 + 3 = 3\) ✓` }, { do: R`\(1 + 2(2) - 3 = 2\) ✓`, why: R`Penyelesaian mesti memenuhi <em>semua</em> persamaan, bukan satu atau dua sahaja.` }],
        check: R`Ketiga-tiga persamaan dipenuhi ✓`, conclusion: R`Ya, \((1, 2, 3)\) ialah penyelesaian.` },
      { level: 'sederhana', sp: ['3.1.2'], question: R`Selesaikan sistem: \(x + y + z = 6\) (1), \(2x - y + z = 3\) (2), \(x + 2y - z = 2\) (3).`, given: R`tiga persamaan linear`, find: R`\(x, y, z\)`, method: R`Hapuskan \(z\) kerana pekalinya \(\pm 1\).`,
        steps: [{ do: R`(1) + (3): \(2x + 3y = 8\) (4)`, why: R`\(+z\) dan \(-z\) saling membatalkan.` }, { do: R`(2) + (3): \(3x + y = 5\) (5)` }, { do: R`Daripada (5): \(y = 5 - 3x\). Masukkan ke (4): \(2x + 15 - 9x = 8 \Rightarrow x = 1\)` }, { do: R`\(y = 5 - 3 = 2\), dan daripada (1): \(z = 6 - 1 - 2 = 3\)` }],
        check: R`(2): \(2 - 2 + 3 = 3\) ✓; (3): \(1 + 4 - 3 = 2\) ✓`, conclusion: R`\(x = 1,\ y = 2,\ z = 3\).` },
      { level: 'sederhana', sp: ['3.1.2'], question: R`Selesaikan: \(x = 2y\), \(y + z = 7\), \(x + y + z = 11\).`, given: R`satu persamaan memberi \(x\) secara terus`, find: R`\(x, y, z\)`, method: R`Penggantian.`,
        steps: [{ do: R`Gantikan \(y + z = 7\) ke dalam \(x + (y + z) = 11\): \(x + 7 = 11\), jadi \(x = 4\)`, why: R`Perhatikan \(y + z\) muncul sebagai satu kumpulan dalam persamaan ketiga.` }, { do: R`\(y = \tfrac{x}{2} = 2\), \(z = 7 - 2 = 5\)` }],
        check: R`\(4 = 2(2)\) ✓, \(2 + 5 = 7\) ✓, \(4 + 2 + 5 = 11\) ✓`, conclusion: R`\(x = 4,\ y = 2,\ z = 5\).` },
      { level: 'mencabar', sp: ['3.1.2'], question: R`Tunjukkan bahawa sistem \(x + y + z = 4\), \(2x + 2y + 2z = 10\), \(x - y + z = 1\) tiada penyelesaian.`, given: R`tiga persamaan`, find: R`bukti tiada penyelesaian`, method: R`Hapuskan dan cari percanggahan.`,
        steps: [{ do: R`Persamaan kedua − 2 × persamaan pertama: \(0 = 10 - 8 = 2\)` }, { do: R`\(0 = 2\) ialah pernyataan palsu`, why: R`Tiada nilai \(x, y, z\) yang boleh menjadikan pernyataan palsu benar.` }],
        check: R`Secara geometri, \(x + y + z = 4\) dan \(x + y + z = 5\) ialah satah selari ✓`, conclusion: R`Sistem tiada penyelesaian.` },
      { level: 'mencabar', sp: ['3.1.3'], question: R`Gunakan resit di bahagian pengenalan untuk mencari harga sebatang pen (\(p\)), sebuah buku (\(b\)) dan sebiji pemadam (\(e\)) dalam RM.`, given: R`\(2p + b + 3e = 8.5\), \(p + 2b + e = 10\), \(3p + b + 2e = 9.5\)`, find: R`\(p, b, e\)`, method: R`Ungkapkan \(e\) daripada persamaan kedua, kemudian gantikan.`,
        steps: [{ do: R`\(e = 10 - p - 2b\)` }, { do: R`Persamaan 1: \(2p + b + 30 - 3p - 6b = 8.5 \Rightarrow p + 5b = 21.5\)` }, { do: R`Persamaan 3: \(3p + b + 20 - 2p - 4b = 9.5 \Rightarrow p - 3b = -10.5\)` }, { do: R`Tolak: \(8b = 32 \Rightarrow b = 4\); \(p = 1.5\); \(e = 10 - 1.5 - 8 = 0.5\)` }],
        check: R`\(2(1.5) + 4 + 3(0.5) = 8.5\) ✓, \(3(1.5) + 4 + 2(0.5) = 9.5\) ✓`, conclusion: R`Pen RM1.50, buku RM4.00, pemadam RM0.50.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Berhenti selepas mendapat \(x\) dan \(y\).`, why: R`Masih ada pemboleh ubah ketiga.`, fix: R`Gantikan semula untuk mencari \(z\), kemudian semak dalam ketiga-tiga persamaan.` },
      { wrong: R`Menghapuskan \(z\) daripada (1) dan (2), kemudian sekali lagi daripada (1) dan (2).`, why: R`Itu memberi persamaan yang sama dua kali, bukan dua persamaan bebas.`, fix: R`Gunakan dua <em>pasangan berbeza</em>, contohnya (1) & (3) dan (2) & (3).` },
      { wrong: R`Memperoleh \(0 = 2\) dan menganggap ada kesilapan pengiraan.`, why: R`Pernyataan palsu boleh jadi petanda sistem tiada penyelesaian.`, fix: R`Semak pengiraan sekali. Jika betul, nyatakan "tiada penyelesaian".` },
    ] },
    { kind: 'summary', points: [
      R`Penyelesaian sistem tiga pemboleh ubah ialah \((x, y, z)\) yang memenuhi ketiga-tiga persamaan; secara geometri, titik pertemuan tiga satah.`,
      R`Hapuskan satu pemboleh ubah menggunakan dua pasangan persamaan, selesaikan sistem dua pemboleh ubah, dan gantikan semula.`,
      R`Pernyataan palsu seperti \(0 = 2\) bermaksud tiada penyelesaian.`,
      R`Sentiasa semak jawapan dalam semua persamaan asal.`,
    ] },
    { kind: 'next', html: R`<p>Dalam <strong>3.2</strong>, salah satu persamaan menjadi tak linear (contohnya ada \(x^2\) atau \(xy\)), dan anda akan menggunakan kemahiran persamaan kuadratik dari Bab 2.</p>`, links: [{ href: '#/nota/t4-3/3.2', label: '3.2 Persamaan Serentak →' }] },
  ],
};

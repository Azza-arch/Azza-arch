// T5 Bab 4 Pilih Atur dan Gabungan (SP 4.1.1–4.2.3). Original.
// DSKP (PDF 126–127, verified as page images): real-life situations and TREE
// DIAGRAMS throughout; calculator only after the concept is understood;
// multiplication rule (m × n); notation n!; nPr = n!/(n − r)! emphasised;
// identical objects; problems with conditions — cases with identical objects or
// circular arrangements are LIMITED TO ONE CONDITION; nCr = nPr / r! discussed.
const R = String.raw;
const fact = (n) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };
const P = (n, r) => fact(n) / fact(n - r);
const C = (n, r) => P(n, r) / fact(r);

// ---------------------------------------------------------------- 4.1
export const S4_1 = {
  id: '4.1', sk: '4.1', title: 'Pilih Atur', sp: ['4.1.1', '4.1.2', '4.1.3'], status: 'review', minutes: 60,
  sections: [
    { kind: 'intro', title: 'Berapa banyak kata laluan?', html: R`<p>Kunci basikal dengan 3 roda nombor (0 hingga 9) mempunyai 1000 kombinasi. Kata laluan 8 aksara mempunyai berbilion. Bagaimana kita mengira tanpa menyenaraikan setiap satu? Bab ini membina cara mengira yang pantas, bermula daripada satu idea mudah: <strong>petua pendaraban</strong>.</p>` },
    { kind: 'concept', title: 'Petua pendaraban', sp: ['4.1.1'], html: R`
      <p>Ali ada 3 baju dan 2 seluar. Lukis <strong>gambar rajah pokok</strong>: setiap baju bercabang kepada 2 seluar, jadi terdapat \(3 \times 2 = 6\) pasangan.</p>
      <p><strong>Petua pendaraban:</strong> jika satu peristiwa boleh berlaku dalam \(m\) cara dan peristiwa kedua boleh berlaku dalam \(n\) cara, kedua-dua peristiwa boleh berlaku dalam \(m \times n\) cara. Ini boleh dilanjutkan kepada tiga atau lebih peristiwa.</p>` },
    { kind: 'visual', title: 'Gambar rajah pokok', html: R`<p>Peristiwa pertama: \(m\) cara (cabang biru). Peristiwa kedua: \(n\) cara untuk setiap cabang (cabang hijau). Kira hujung cabang.</p>`,
      spec: { type: 'plot', noAxes: true, x: [-0.5, 4.5], y: [-0.5, 16.5], params: [{ name: 'm', label: R`\(m\)`, min: 1, max: 4, step: 1, value: 3 }, { name: 'n', label: R`\(n\)`, min: 1, max: 4, step: 1, value: 2 }],
        polygons: [
          ...Array.from({ length: 4 }, (_, i) => ({ at: (p) => (i < p.m ? [[0, 8], [2, ((i + 0.5) * 16) / p.m]] : null), closed: false, color: '#3467D4' })),
          ...Array.from({ length: 16 }, (_, k) => ({ at: (p) => { const i = Math.floor(k / 4), j = k % 4; if (i >= p.m || j >= p.n) return null; const y1 = ((i + 0.5) * 16) / p.m, y2 = ((i * p.n + j + 0.5) * 16) / (p.m * p.n); return [[2, y1], [4, y2]]; }, closed: false, color: '#2E9E6B' })),
        ],
        points: [{ at: () => [0, 8], label: 'mula' }, ...Array.from({ length: 16 }, (_, k) => ({ at: (p) => (k < p.m * p.n ? [4, ((k + 0.5) * 16) / (p.m * p.n)] : null) }))],
        readout: (p, { fmt }) => R`\(${fmt(p.m)} \times ${fmt(p.n)} = ${fmt(p.m * p.n)}\) hujung cabang, iaitu ${fmt(p.m * p.n)} cara.` },
      alt: R`Gambar rajah pokok bermula di satu titik. Ia bercabang kepada m cabang biru (peristiwa pertama), dan setiap cabang biru bercabang lagi kepada n cabang hijau (peristiwa kedua). Dengan m = 3 dan n = 2, terdapat 6 hujung cabang. Bilangan hujung sentiasa m × n.` },
    { kind: 'concept', title: 'Bilangan pilih atur', sp: ['4.1.2'], html: R`
      <p><strong>Pilih atur</strong> ialah susunan objek dengan <strong>tertib yang diambil kira</strong> (AB berbeza daripada BA).</p>
      <ul>
        <li><strong>(i) \(n\) objek berbeza, semua disusun:</strong> \(n \times (n - 1) \times \cdots \times 1 = n!\) (dibaca "\(n\) faktorial"). Takrif: \(0! = 1\).</li>
        <li><strong>(ii) \(r\) daripada \(n\) objek berbeza:</strong> tempat pertama \(n\) pilihan, kedua \(n - 1\), …, hingga \(r\) tempat: \({}^nP_r = \dfrac{n!}{(n - r)!}\).</li>
        <li><strong>(iii) objek secaman:</strong> jika terdapat \(a\) objek yang sama, \(b\) objek lain yang sama, …: \(\dfrac{n!}{a!\,b!\cdots}\). Sebabnya, menukar tempat dua objek yang sama tidak menghasilkan susunan baharu, jadi kita membahagi dengan bilangan cara menyusun setiap kumpulan yang sama.</li>
      </ul>` },
    { kind: 'concept', title: 'Pilih atur dengan syarat', sp: ['4.1.3'], html: R`
      <ul>
        <li><strong>Isi tempat bersyarat dahulu</strong>, contohnya digit terakhir mesti genap, atau huruf pertama mesti vokal.</li>
        <li><strong>Objek mesti bersama:</strong> ikat mereka sebagai satu "blok", susun blok bersama objek lain, kemudian darab dengan susunan dalam blok.</li>
        <li><strong>Susunan dalam bulatan:</strong> putaran yang sama dikira sekali. Tetapkan satu objek, susun yang lain: \((n - 1)!\).</li>
      </ul>
      <p>Untuk objek secaman atau susunan bulatan, bab ini hanya melibatkan <strong>satu syarat</strong>.</p>` },
    { kind: 'formula', items: [{ tex: R`n! = n(n - 1)\cdots 2 \cdot 1, \quad 0! = 1`, html: R`Susun \(n\) objek berbeza.` }, { tex: R`{}^nP_r = \frac{n!}{(n - r)!}`, html: R`Susun \(r\) daripada \(n\) objek berbeza.` }, { tex: R`\frac{n!}{a!\,b!\cdots}, \qquad (n - 1)!`, html: R`Objek secaman; susunan dalam bulatan.` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['4.1.1'], question: R`Sebuah kafe menawarkan 3 jenis roti dan 4 jenis minuman. Berapakah set sarapan (1 roti + 1 minuman) yang mungkin?`, given: R`3 roti, 4 minuman`, find: R`bilangan set`, method: R`Petua pendaraban.`, steps: [{ do: R`\(3 \times 4 = 12\)`, why: R`Setiap roti boleh dipasangkan dengan setiap minuman (gambar rajah pokok dengan 3 cabang, setiap satu 4 cabang).` }], check: R`Senarai untuk satu roti: 4 set; tiga roti: 12 ✓`, conclusion: R`12 set.` },
      { level: 'sederhana', sp: ['4.1.2'], question: R`(a) Berapa cara 5 buku berbeza boleh disusun di atas rak? (b) Berapa cara 3 daripada 7 pelajar boleh dipilih dan disusun di barisan hadapan?`, given: R`\(n = 5\); \(n = 7\), \(r = 3\)`, find: R`bilangan susunan`, method: R`\(n!\); \({}^nP_r\).`, steps: [{ do: R`(a) \(5! = 120\)` }, { do: R`(b) \({}^7P_3 = 7 \times 6 \times 5 = 210\)`, why: R`Tempat pertama 7 pilihan, kedua 6, ketiga 5.` }], check: R`\(\tfrac{7!}{4!} = \tfrac{5040}{24} = 210\) ✓`, conclusion: R`120; 210.` },
      { level: 'sederhana', sp: ['4.1.2'], question: R`Berapakah bilangan susunan berbeza bagi huruf-huruf perkataan MALAYSIA?`, given: R`8 huruf, A berulang 3 kali`, find: R`bilangan susunan`, method: R`Objek secaman.`, steps: [{ do: R`\(\dfrac{8!}{3!} = \dfrac{40\,320}{6} = 6720\)`, why: R`Menukar tempat tiga huruf A sesama sendiri (\(3! = 6\) cara) memberi perkataan yang sama.` }], check: R`Huruf lain (M, L, Y, S, I) semuanya berbeza ✓`, conclusion: R`6720.` },
      { level: 'mencabar', sp: ['4.1.3'], question: R`Berapakah nombor tiga digit <strong>genap</strong> yang boleh dibentuk daripada digit 1, 2, 3, 4, 5, 6 tanpa ulangan?`, given: R`6 digit, tiada ulangan`, find: R`bilangan nombor genap`, method: R`Isi tempat bersyarat (digit unit) dahulu.`, steps: [{ do: R`Digit unit: 2, 4 atau 6 (3 cara)` }, { do: R`Digit ratus: 5 baki; digit puluh: 4 baki` }, { do: R`\(3 \times 5 \times 4 = 60\)` }], check: R`Separuh daripada \({}^6P_3 = 120\) kerana separuh digit genap ✓`, conclusion: R`60.` },
      { level: 'mencabar', sp: ['4.1.3'], question: R`Berapa cara huruf-huruf perkataan BUNGA boleh disusun jika kedua-dua vokal mesti bersebelahan?`, given: R`B, U, N, G, A; vokal U, A`, find: R`bilangan susunan`, method: R`Ikat vokal sebagai satu blok.`, steps: [{ do: R`Unit: [UA], B, N, G: 4 unit, \(4! = 24\)` }, { do: R`Dalam blok: UA atau AU, \(2! = 2\)` }, { do: R`\(24 \times 2 = 48\)` }], check: R`Tanpa syarat \(5! = 120\); 48 < 120 ✓`, conclusion: R`48.` },
      { level: 'mencabar', sp: ['4.1.3'], question: R`Enam orang duduk mengelilingi meja bulat. Berapa susunan yang berbeza?`, given: R`6 orang, bulatan`, find: R`bilangan susunan`, method: R`Tetapkan satu orang; susun 5 yang lain.`, steps: [{ do: R`\((6 - 1)! = 5! = 120\)`, why: R`Memusing semua orang satu tempat memberi susunan yang sama (setiap orang mempunyai jiran yang sama), jadi \(6!\) dibahagi 6.` }], check: R`\(\tfrac{6!}{6} = 120\) ✓`, conclusion: R`120.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Bilangan susunan MALAYSIA \(= 8!\)`, why: R`Tiga huruf A yang sama dikira berulang.`, fix: R`Bahagi dengan \(3!\).` },
      { wrong: R`Mengisi tempat mengikut tertib biasa walaupun ada syarat.`, why: R`Tempat bersyarat mungkin kehabisan pilihan.`, fix: R`Isi tempat bersyarat dahulu.` },
      { wrong: R`Susunan bulatan 6 orang \(= 6!\).`, why: R`Putaran dikira berulang.`, fix: R`\((n - 1)!\).` },
    ] },
    { kind: 'summary', points: [R`Petua pendaraban: \(m \times n\).`, R`\(n!\); \({}^nP_r = \tfrac{n!}{(n - r)!}\); objek secaman \(\tfrac{n!}{a!\,b!\cdots}\); bulatan \((n - 1)!\).`, R`Syarat: isi tempat bersyarat dahulu; objek bersama sebagai blok.`] },
    { kind: 'next', html: R`<p>Bagaimana jika tertib tidak penting, seperti memilih ahli jawatankuasa? Seterusnya, <strong>4.2 Gabungan</strong>.</p>`, links: [{ href: '#/nota/t5-4/4.2', label: '4.2 →' }] },
  ],
};

// ---------------------------------------------------------------- 4.2
export const S4_2 = {
  id: '4.2', sk: '4.2', title: 'Gabungan', sp: ['4.2.1', '4.2.2', '4.2.3'], status: 'review', minutes: 50,
  sections: [
    { kind: 'intro', title: 'Pasukan, bukan barisan', html: R`<p>Memilih 3 pemain untuk pasukan bola tampar: Ali, Bala, Chong ialah pasukan yang sama dengan Chong, Ali, Bala. Tertib tidak penting. Pemilihan seperti ini ialah <strong>gabungan</strong>.</p>` },
    { kind: 'concept', title: 'Pilih atur berbanding gabungan', sp: ['4.2.1'], html: R`
      <p>Pilih 2 huruf daripada A, B, C:</p>
      <table class="mini-table"><thead><tr><th>Pilih atur (tertib penting)</th><th>Gabungan (tertib tidak penting)</th></tr></thead><tbody><tr><td>AB, BA, AC, CA, BC, CB: 6</td><td>{A, B}, {A, C}, {B, C}: 3</td></tr></tbody></table>
      <p>Setiap gabungan 2 huruf boleh disusun dalam \(2! = 2\) cara. Secara umum, setiap gabungan \(r\) objek muncul sebagai \(r!\) pilih atur, jadi</p>
      \[{}^nC_r = \frac{{}^nP_r}{r!} = \frac{n!}{(n - r)!\,r!}\]
      <p><strong>Tanya:</strong> adakah menukar tertib menghasilkan sesuatu yang berbeza? Ya: pilih atur. Tidak: gabungan.</p>` },
    { kind: 'concept', title: 'Bilangan gabungan', sp: ['4.2.2'], html: R`
      <p>\({}^nC_r\) ialah bilangan cara memilih \(r\) objek daripada \(n\) objek berbeza. Sifat berguna:</p>
      <ul><li>\({}^nC_0 = {}^nC_n = 1\)</li><li>\({}^nC_r = {}^nC_{n - r}\): memilih \(r\) untuk dibawa sama dengan memilih \(n - r\) untuk ditinggalkan.</li></ul>` },
    { kind: 'visual', title: 'Jadual pilih atur dan gabungan', html: R`<p>Untuk \(n = 6\). Perhatikan \({}^6P_r = {}^6C_r \times r!\), dan jadual \({}^6C_r\) simetri. (Taip nilai \(r\) lain dari 0 hingga 6 di bawah jadual.)</p>`,
      spec: { type: 'table', xs: [0, 1, 2, 3, 4, 5, 6], input: true, columns: [{ head: R`\(r\)` }, { head: R`\({}^6P_r\)`, f: (r) => (Number.isInteger(r) && r >= 0 && r <= 6 ? P(6, r) : NaN), undefinedText: '—' }, { head: R`\(r!\)`, f: (r) => (Number.isInteger(r) && r >= 0 && r <= 6 ? fact(r) : NaN), undefinedText: '—' }, { head: R`\({}^6C_r\)`, f: (r) => (Number.isInteger(r) && r >= 0 && r <= 6 ? C(6, r) : NaN), undefinedText: '—' }] },
      alt: R`Jadual bagi n = 6 dan r dari 0 hingga 6. ⁶Pᵣ: 1, 6, 30, 120, 360, 720, 720. r!: 1, 1, 2, 6, 24, 120, 720. ⁶Cᵣ: 1, 6, 15, 20, 15, 6, 1. Setiap ⁶Pᵣ sama dengan ⁶Cᵣ × r!, dan lajur ⁶Cᵣ simetri kerana memilih r sama dengan meninggalkan 6 − r.` },
    { kind: 'concept', title: 'Gabungan dengan syarat', sp: ['4.2.3'], html: R`
      <ul>
        <li><strong>Dua kumpulan</strong> (contohnya lelaki dan perempuan): pilih daripada setiap kumpulan secara berasingan, kemudian <em>darab</em>.</li>
        <li><strong>"Sekurang-kurangnya" / "paling banyak":</strong> senaraikan kes-kes yang memenuhi syarat dan <em>tambah</em>; atau kira jumlah tolak kes yang tidak dikehendaki.</li>
        <li><strong>Orang tertentu mesti dipilih:</strong> masukkan dia dahulu, pilih baki daripada yang lain. <strong>Mesti tidak dipilih:</strong> keluarkan dia daripada senarai.</li>
      </ul>` },
    { kind: 'formula', items: [{ tex: R`{}^nC_r = \frac{{}^nP_r}{r!} = \frac{n!}{(n - r)!\,r!}`, html: R`\({}^nC_r = {}^nC_{n - r}\).` }] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['4.2.1'], question: R`Daripada 4 calon, seorang ketua dan seorang penolong dipilih. Adakah ini pilih atur atau gabungan? Berapa cara?`, given: R`4 calon, 2 jawatan berbeza`, find: R`jenis; bilangan`, method: R`Tanya sama ada tertib penting.`, steps: [{ do: R`Ali ketua + Bala penolong \(\ne\) Bala ketua + Ali penolong: tertib penting, pilih atur` }, { do: R`\({}^4P_2 = 12\)` }], check: R`Jika dua jawatan sama (2 wakil), \({}^4C_2 = 6 = \tfrac{12}{2!}\) ✓`, conclusion: R`Pilih atur; 12 cara.` },
      { level: 'sederhana', sp: ['4.2.2'], question: R`Berapa cara 5 buku boleh dipilih daripada 9 buku yang berbeza?`, given: R`\(n = 9\), \(r = 5\)`, find: R`\({}^9C_5\)`, method: R`Rumus gabungan.`, steps: [{ do: R`\({}^9C_5 = \dfrac{9!}{4!\,5!} = 126\)` }], check: R`\({}^9C_4\) juga 126 (meninggalkan 4 buku) ✓`, conclusion: R`126.` },
      { level: 'sederhana', sp: ['4.2.3'], question: R`Sebuah jawatankuasa terdiri daripada 3 lelaki dipilih daripada 6 dan 2 perempuan dipilih daripada 5. Berapa jawatankuasa yang mungkin?`, given: R`dua kumpulan`, find: R`bilangan jawatankuasa`, method: R`Pilih setiap kumpulan, kemudian darab.`, steps: [{ do: R`\({}^6C_3 \times {}^5C_2 = 20 \times 10 = 200\)` }], check: R`Petua pendaraban: setiap pilihan lelaki boleh dipasangkan dengan setiap pilihan perempuan ✓`, conclusion: R`200.` },
      { level: 'mencabar', sp: ['4.2.3'], question: R`Jawatankuasa 4 orang dipilih daripada 5 lelaki dan 4 perempuan. Berapa cara jika sekurang-kurangnya 2 perempuan?`, given: R`5L, 4P, pilih 4`, find: R`bilangan`, method: R`Senaraikan kes 2P, 3P, 4P dan tambah.`, steps: [{ do: R`2P 2L: \({}^4C_2 \times {}^5C_2 = 6 \times 10 = 60\)` }, { do: R`3P 1L: \({}^4C_3 \times {}^5C_1 = 4 \times 5 = 20\)` }, { do: R`4P: \({}^4C_4 = 1\)` }, { do: R`Jumlah \(= 81\)` }], check: R`Jumlah tolak kes tidak dikehendaki: \({}^9C_4 - [{}^5C_4 + {}^4C_1\,{}^5C_3] = 126 - (5 + 40) = 81\) ✓`, conclusion: R`81.` },
      { level: 'mencabar', sp: ['4.2.3'], question: R`Empat orang dipilih daripada 8 orang. Berapa cara jika Siti mesti dipilih?`, given: R`8 orang, pilih 4, Siti wajib`, find: R`bilangan`, method: R`Masukkan Siti, pilih baki 3 daripada 7.`, steps: [{ do: R`\({}^7C_3 = 35\)` }], check: R`Tanpa Siti: \({}^7C_4 = 35\); jumlah \(35 + 35 = 70 = {}^8C_4\) ✓`, conclusion: R`35.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`Guna \({}^nP_r\) untuk memilih ahli jawatankuasa biasa.`, why: R`Tertib tidak penting; setiap kumpulan dikira \(r!\) kali.`, fix: R`\({}^nC_r\).` },
      { wrong: R`Dalam dua kumpulan, tambah \({}^6C_3 + {}^5C_2\).`, why: R`Kedua-dua pilihan berlaku bersama.`, fix: R`Darab.` },
      { wrong: R`"Sekurang-kurangnya 2" dikira sebagai tepat 2.`, why: R`Kes 3 dan 4 juga memenuhi syarat.`, fix: R`Senaraikan semua kes, atau guna jumlah tolak.` },
    ] },
    { kind: 'summary', points: [R`Tertib penting: pilih atur; tidak: gabungan.`, R`\({}^nC_r = \tfrac{{}^nP_r}{r!}\); \({}^nC_r = {}^nC_{n - r}\).`, R`Kumpulan berbeza: darab; kes berbeza: tambah.`] },
    { kind: 'next', html: R`<p>Kiraan ini ialah asas <strong>Taburan Kebarangkalian</strong> (Bab 5), terutamanya taburan binomial.</p>`, links: [{ href: '#/bab/t5-4', label: 'Kembali ke Bab 4' }] },
  ],
};

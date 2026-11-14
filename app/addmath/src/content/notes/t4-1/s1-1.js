// Bab 1 · 1.1 Fungsi (SP 1.1.1, 1.1.2, 1.1.3). Original content.
// DSKP scope checked: notation f : x → …, objek/imej; undefined at a value
// (3/(x − 1), x ≠ 1 type); absolute value function and its graph on a given
// domain; vertical line test; domain/kodomain/julat; discrete, continuous and
// absolute-value functions; image ↔ object including |…|; real-life contexts.
const R = String.raw;

export const S1_1 = {
  id: '1.1', sk: '1.1', title: 'Fungsi', sp: ['1.1.1', '1.1.2', '1.1.3'], status: 'published', minutes: 45,
  sections: [
    { kind: 'intro', title: 'Satu input, satu keputusan', html: R`
      <p>Bayangkan tempat letak kereta yang mengenakan <strong>RM3 bagi setiap jam</strong>. Jika anda letak kereta selama 2 jam, bayarannya RM6. Jika 5 jam, RM15. Untuk setiap tempoh masa, hanya ada <strong>satu</strong> jumlah bayaran. Tiada siapa akan menerima dua resit berbeza untuk tempoh yang sama.</p>
      <p>Hubungan seperti ini dipanggil <strong>fungsi</strong>: setiap input menghasilkan tepat satu output. Kita boleh menulisnya sebagai \(f(t) = 3t\), dengan \(t\) ialah bilangan jam.</p>
      <p>Bandingkan dengan hubungan "murid → nombor telefon penjaga". Seorang murid mungkin ada dua nombor penjaga (ibu dan bapa). Satu input boleh ada lebih daripada satu output, jadi hubungan ini <strong>bukan</strong> fungsi.</p>` },
    { kind: 'prereq', title: 'Tiga perkara yang kita guna dalam subtopik ini', html: R`
      <p><strong>1. Penggantian.</strong> Jika \(x = -2\), maka \(3x + 5 = 3(-2) + 5 = -6 + 5 = -1\). Letak nilai dalam kurungan supaya tanda negatif tidak hilang.</p>
      <p><strong>2. Tertib operasi.</strong> Kurungan dahulu, kemudian kuasa, kemudian darab/bahagi, dan akhir sekali tambah/tolak.</p>
      <p><strong>3. Nilai mutlak.</strong> \(|a|\) ialah <em>jarak</em> nombor \(a\) dari 0 pada garis nombor, jadi ia tidak pernah negatif: \(|5| = 5\), \(|-5| = 5\), \(|0| = 0\).</p>` },
    { kind: 'concept', title: 'Objek, imej dan tatatanda fungsi', sp: ['1.1.1'], html: R`
      <p>Dalam suatu fungsi, input dipanggil <strong>objek</strong> dan output dipanggil <strong>imej</strong>. Jika fungsi \(f\) menghantar objek \(x\) kepada imej \(2x + 1\), kita boleh tulis dalam dua cara yang sama maksud:</p>
      \[f : x \mapsto 2x + 1 \qquad \text{atau} \qquad f(x) = 2x + 1\]
      <p>Baca \(f(x)\) sebagai "\(f\) bagi \(x\)". Ia <strong>bukan</strong> \(f \times x\). Contohnya, \(f(3) = 2(3) + 1 = 7\): imej bagi objek 3 ialah 7.</p>
      <div class="callout"><p><strong>Syarat fungsi:</strong> setiap objek dalam domain mesti mempunyai <em>tepat satu</em> imej. Dua objek berbeza boleh berkongsi imej yang sama (banyak kepada satu) dan itu masih fungsi.</p></div>` },
    { kind: 'visual', title: 'Bandingkan jenis hubungan', html: R`<p>Tekan setiap butang. Perhatikan sama ada <strong>setiap objek di sebelah kiri</strong> mempunyai tepat satu anak panah keluar.</p>`,
      spec: { type: 'mapping', sets: [
        { label: 'Satu kepada satu', domain: [1, 2, 3], codomain: [4, 5, 6], pairs: [[1, 4], [2, 5], [3, 6]], note: R`<strong>Fungsi.</strong> Setiap objek ada satu imej, dan setiap imej datang daripada objek berlainan.` },
        { label: 'Banyak kepada satu', domain: [-2, 2, 3], codomain: [4, 9], pairs: [[-2, 4], [2, 4], [3, 9]], note: R`<strong>Fungsi.</strong> \(-2\) dan \(2\) berkongsi imej 4 (seperti \(f(x) = x^2\)). Ini dibenarkan.` },
        { label: 'Satu kepada banyak', domain: [4, 9], codomain: [-3, -2, 2, 3], pairs: [[4, -2], [4, 2], [9, -3], [9, 3]], note: R`<strong>Bukan fungsi.</strong> Objek 4 mempunyai dua imej, iaitu \(-2\) dan \(2\).` },
        { label: 'Objek tanpa imej', domain: [1, 2, 3], codomain: [5, 7], pairs: [[1, 5], [2, 7]], note: R`<strong>Bukan fungsi</strong> pada domain \(\{1, 2, 3\}\): objek 3 tiada imej.` },
      ] },
      alt: R`Empat gambar rajah anak panah. (1) 1→4, 2→5, 3→6: fungsi satu kepada satu. (2) −2→4, 2→4, 3→9: fungsi banyak kepada satu. (3) 4→−2, 4→2, 9→−3, 9→3: bukan fungsi kerana setiap objek ada dua imej. (4) Domain {1, 2, 3} dengan 1→5 dan 2→7 sahaja: bukan fungsi kerana 3 tiada imej.` },
    { kind: 'concept', title: 'Fungsi pada graf: ujian garis mencancang', sp: ['1.1.1'], html: R`
      <p>Pada graf, objek ialah nilai \(x\) dan imej ialah nilai \(y\). Jika suatu garis mencancang \(x = k\) memotong graf <strong>lebih daripada sekali</strong>, maka objek \(k\) mempunyai lebih daripada satu imej, jadi graf itu bukan graf fungsi.</p>` },
    { kind: 'visual', title: 'Gerakkan garis mencancang', html: R`<p>Graf biru ialah \(y = \tfrac{1}{2}x^2 - 2\). Graf merah ialah bulatan \(x^2 + y^2 = 9\). Gerakkan garis jingga dan kira titik persilangan bagi setiap graf.</p>`,
      spec: { type: 'plot', x: [-5, 5], y: [-4, 5], params: [{ name: 'k', label: R`\(k\) (garis \(x = k\))`, min: -4.5, max: 4.5, step: 0.5, value: 1 }],
        curves: [{ f: (x) => x * x / 2 - 2, label: 'parabola' }],
        equalAspect: true, relations: [{ ys: (x) => (Math.abs(x) <= 3 ? [Math.sqrt(9 - x * x), -Math.sqrt(9 - x * x)] : []), color: '#D9534F' }],
        vline: 'k',
        readout: (p, { fmt }) => { const c = Math.abs(p.k) < 3 ? 2 : Math.abs(p.k) === 3 ? 1 : 0; return R`Garis \(x = ${fmt(p.k)}\) memotong parabola <strong>1 kali</strong> dan bulatan <strong>${c} kali</strong>. ${c === 2 ? 'Bulatan gagal ujian ini, jadi bulatan bukan graf fungsi.' : 'Cuba nilai k di antara −3 dan 3 untuk bulatan.'}`; } },
      alt: R`Parabola y = ½x² − 2 dipotong tepat sekali oleh setiap garis mencancang, jadi ia graf fungsi. Bulatan x² + y² = 9 dipotong dua kali oleh garis x = k bagi −3 < k < 3, contohnya x = 1 memotong di (1, √8) dan (1, −√8). Maka bulatan bukan graf fungsi.` },
    { kind: 'concept', title: 'Fungsi yang tidak tertakrif pada nilai tertentu', sp: ['1.1.1', '1.1.2'], html: R`
      <p>Pertimbangkan \(f(x) = \dfrac{3}{x - 1}\). Apabila \(x = 1\), penyebutnya \(1 - 1 = 0\), dan pembahagian dengan sifar tidak ditakrifkan. Jadi \(f\) <strong>tidak tertakrif</strong> pada \(x = 1\), dan kita tulis:</p>
      \[f(x) = \frac{3}{x - 1}, \quad x \neq 1\]
      <p>Nilai \(x = 1\) dikeluarkan daripada domain. Pada graf, garis \(x = 1\) tidak pernah disentuh.</p>` },
    { kind: 'visual', title: 'Apa yang berlaku dekat x = 1?', html: R`<p>Lihat jadual nilai. Masukkan nilai sendiri, termasuk 1, 0.99 dan 1.01.</p>`,
      spec: { type: 'table', xs: [-2, 0, 0.5, 0.9, 1, 1.1, 2, 4], input: true, columns: [{ head: R`\(x\)` }, { head: R`\(f(x) = \dfrac{3}{x-1}\)`, f: (x) => (x === 1 ? NaN : 3 / (x - 1)) }] },
      alt: R`Jadual nilai f(x) = 3/(x − 1): x = −2 memberi −1; x = 0 memberi −3; x = 0.5 memberi −6; x = 0.9 memberi −30; x = 1 tidak tertakrif; x = 1.1 memberi 30; x = 2 memberi 3; x = 4 memberi 1. Apabila x menghampiri 1, nilai f(x) menjadi sangat besar (positif atau negatif).` },
    { kind: 'concept', title: 'Fungsi nilai mutlak', sp: ['1.1.1', '1.1.2'], html: R`
      <p>Fungsi nilai mutlak memberi jarak dari sifar, jadi output tidak pernah negatif. Takrifnya:</p>
      \[|x| = \begin{cases} x, & x \geq 0 \\ -x, & x < 0 \end{cases}\]
      <p>Contoh: \(|-4| = -(-4) = 4\). Bagi \(f(x) = |x - 2|\), kita kira \(x - 2\) dahulu, kemudian ambil nilai mutlaknya: \(f(0) = |0 - 2| = |-2| = 2\).</p>
      <p>Graf \(y = |ax + b|\) berbentuk huruf V. Bahagian yang sepatutnya di bawah paksi-\(x\) "dipantulkan" ke atas. Bucu V berada di titik \(ax + b = 0\).</p>` },
    { kind: 'visual', title: 'Bina graf y = |ax + b|', html: R`<p>Ubah \(a\) dan \(b\). Garis putus-putus ialah \(y = ax + b\) sebelum nilai mutlak diambil.</p>`,
      spec: { type: 'plot', x: [-6, 6], y: [-4, 8], params: [{ name: 'a', label: R`\(a\)`, min: -3, max: 3, step: 0.5, value: 1 }, { name: 'b', label: R`\(b\)`, min: -4, max: 4, step: 1, value: -2 }],
        curves: [{ f: (x, p) => p.a * x + p.b, dashed: true, color: '#9AA3B5' }, { f: (x, p) => Math.abs(p.a * x + p.b) }],
        points: [{ at: (p) => (p.a !== 0 ? [-p.b / p.a, 0] : null), label: 'bucu' }],
        readout: (p, { fmt }) => p.a === 0 ? R`Apabila \(a = 0\), \(y = |${fmt(p.b)}| = ${fmt(Math.abs(p.b))}\) ialah garis mengufuk.` : R`Bucu pada \(x = ${fmt(-p.b / p.a)}\), iaitu apabila \(${fmt(p.a)}x ${p.b < 0 ? '-' : '+'} ${fmt(Math.abs(p.b))} = 0\). Nilai terkecil \(y\) ialah 0.` },
      alt: R`Graf y = |ax + b| berbentuk V dengan bucu pada (−b/a, 0). Contohnya y = |x − 2| mempunyai bucu (2, 0), melalui (0, 2) dan (4, 2). Bahagian garis y = x − 2 yang negatif (x < 2) dipantulkan ke atas paksi-x.` },
    { kind: 'concept', title: 'Domain, kodomain dan julat', sp: ['1.1.2'], html: R`
      <ul>
        <li><strong>Domain</strong>: set semua objek yang dibenarkan.</li>
        <li><strong>Kodomain</strong>: set yang mengandungi semua imej yang <em>mungkin</em>, ditetapkan oleh soalan.</li>
        <li><strong>Julat</strong>: set imej yang <em>benar-benar terhasil</em>. Julat sentiasa sebahagian daripada kodomain.</li>
      </ul>
      <p><strong>Fungsi diskret</strong> mempunyai domain berupa nilai berasingan, contohnya \(\{1, 2, 3\}\). Julatnya disenaraikan satu per satu. <strong>Fungsi selanjar</strong> mempunyai domain berupa selang, contohnya \(-1 \leq x \leq 4\). Julatnya ditulis sebagai ketaksamaan, dan cara paling selamat mencarinya ialah <strong>melakar graf</strong>.</p>
      <div class="callout is-warn"><p>Untuk fungsi nilai mutlak, jangan kira imej di hujung domain sahaja. Jika bucu V berada dalam domain, nilai terkecil julat ialah 0.</p></div>` },
    { kind: 'visual', title: 'Julat bergantung pada domain', html: R`<p>Fungsi \(f(x) = |x - 2|\). Ubah hujung domain \(m \leq x \leq n\) dan lihat julat berubah.</p>`,
      spec: { type: 'plot', x: [-4, 8], y: [-1, 7], params: [{ name: 'm', label: R`\(m\)`, min: -3, max: 2, step: 0.5, value: -1 }, { name: 'n', label: R`\(n\)`, min: 2.5, max: 7, step: 0.5, value: 4 }],
        curves: [{ f: (x) => Math.abs(x - 2), dashed: true, color: '#C9CED8' }, { f: (x) => Math.abs(x - 2), domain: (p) => [p.m, p.n], closedEnds: true }],
        readout: (p, { fmt }) => { const lo = p.m <= 2 && p.n >= 2 ? 0 : Math.min(Math.abs(p.m - 2), Math.abs(p.n - 2)); const hi = Math.max(Math.abs(p.m - 2), Math.abs(p.n - 2)); return R`Domain \(${fmt(p.m)} \leq x \leq ${fmt(p.n)}\): \(f(${fmt(p.m)}) = ${fmt(Math.abs(p.m - 2))}\), \(f(${fmt(p.n)}) = ${fmt(Math.abs(p.n - 2))}\), bucu \(f(2) = 0\). Julat: \(${fmt(lo)} \leq f(x) \leq ${fmt(hi)}\).`; } },
      alt: R`Graf f(x) = |x − 2| dilukis dari x = m hingga x = n. Bagi domain −1 ≤ x ≤ 4: f(−1) = 3, f(4) = 2 dan bucu f(2) = 0 berada dalam domain, jadi julat ialah 0 ≤ f(x) ≤ 3, bukan 2 ≤ f(x) ≤ 3.` },
    { kind: 'concept', title: 'Mencari imej dan mencari objek', sp: ['1.1.3'], html: R`
      <p><strong>Objek diberi, cari imej:</strong> gantikan objek ke dalam fungsi. Bagi \(f(x) = 5 - 3x\): \(f(-2) = 5 - 3(-2) = 11\).</p>
      <p><strong>Imej diberi, cari objek:</strong> bina persamaan \(f(x) = \text{imej}\), kemudian selesaikan. Bagi \(f(x) = 5 - 3x\) dan imej \(-7\): \(5 - 3x = -7\), jadi \(x = 4\).</p>
      <p>Bagi nilai mutlak, \(|x - 2| = 3\) bermaksud \(x - 2\) berjarak 3 dari sifar. Jadi \(x - 2 = 3\) <strong>atau</strong> \(x - 2 = -3\), memberi <strong>dua</strong> objek: \(x = 5\) atau \(x = -1\).</p>
      <p>Tetapi \(|x - 2| = -1\) tiada penyelesaian, kerana nilai mutlak tidak boleh negatif.</p>` },
    { kind: 'formula', items: [
      { tex: R`f : x \mapsto f(x)`, html: R`\(f\) ialah nama fungsi, \(x\) ialah objek dan \(f(x)\) ialah imej bagi \(x\).` },
      { tex: R`|x| = \begin{cases} x, & x \ge 0 \\ -x, & x < 0 \end{cases}`, html: R`Nilai mutlak sentiasa \(\geq 0\). Persamaan \(|u| = k\) dengan \(k > 0\) memberi \(u = k\) atau \(u = -k\).` },
      { tex: R`\text{Julat} \subseteq \text{Kodomain}`, html: R`Julat ialah imej yang benar-benar terhasil daripada domain.` },
    ] },
    { kind: 'examples', items: [
      { level: 'mudah', sp: ['1.1.3'], question: R`Diberi \(f(x) = 5 - 3x\). Cari imej bagi \(-2\).`, given: R`\(f(x) = 5 - 3x\), objek \(x = -2\)`, find: R`\(f(-2)\)`, method: R`Gantikan objek ke dalam fungsi.`,
        steps: [{ do: R`\(f(-2) = 5 - 3(-2)\)`, why: R`Letak \(-2\) dalam kurungan supaya tanda negatif tidak hilang.` }, { do: R`\(= 5 + 6 = 11\)`, why: R`Darab dahulu: \(-3 \times -2 = 6\).` }],
        check: R`\(5 - 3(-2) = 5 + 6 = 11\) ✓`, conclusion: R`Imej bagi \(-2\) ialah 11.` },
      { level: 'sederhana', sp: ['1.1.3'], question: R`Diberi \(f : x \mapsto 3x - 4\). Cari nilai \(a\) jika \(f(a) = 11\).`, given: R`\(f(x) = 3x - 4\) dan imej 11`, find: R`objek \(a\)`, method: R`Imej diberi, jadi bina persamaan \(f(a) = 11\).`,
        steps: [{ do: R`\(3a - 4 = 11\)` }, { do: R`\(3a = 15\)`, why: R`Tambah 4 pada kedua-dua belah supaya sebutan \(a\) tinggal sendirian.` }, { do: R`\(a = 5\)` }],
        check: R`\(f(5) = 3(5) - 4 = 11\) ✓`, conclusion: R`\(a = 5\).` },
      { level: 'sederhana', sp: ['1.1.1', '1.1.2', '1.1.3'], question: R`Diberi \(g(x) = \dfrac{6}{x + 2}\). (a) Nyatakan nilai \(x\) yang tidak boleh berada dalam domain. (b) Cari objek yang imejnya \(-3\).`, given: R`\(g(x) = \dfrac{6}{x+2}\)`, find: R`nilai yang dikecualikan, dan objek bagi imej \(-3\)`, method: R`Penyebut tidak boleh sifar. Untuk (b), selesaikan \(g(x) = -3\).`,
        steps: [{ do: R`(a) \(x + 2 = 0 \Rightarrow x = -2\)`, why: R`Pada \(x = -2\), kita perlu bahagi dengan sifar, jadi \(g\) tidak tertakrif. Tulis \(x \neq -2\).` }, { do: R`(b) \(\dfrac{6}{x+2} = -3 \Rightarrow 6 = -3(x + 2)\)`, why: R`Darab kedua-dua belah dengan \(x + 2\). Ini selamat kerana \(x \neq -2\).` }, { do: R`\(6 = -3x - 6 \Rightarrow 3x = -12 \Rightarrow x = -4\)` }],
        check: R`\(g(-4) = \dfrac{6}{-4+2} = \dfrac{6}{-2} = -3\) ✓, dan \(-4 \neq -2\) ✓`, conclusion: R`(a) \(x = -2\). (b) Objeknya ialah \(-4\).` },
      { level: 'mencabar', sp: ['1.1.2', '1.1.3'], question: R`Fungsi \(f(x) = |2x - 3|\) ditakrifkan bagi \(-1 \leq x \leq 4\). (a) Lakar graf dan cari julat. (b) Cari objek-objek yang imejnya 3.`, given: R`\(f(x) = |2x - 3|\), domain \(-1 \le x \le 4\)`, find: R`julat; objek apabila \(f(x) = 3\)`, method: R`Cari bucu dan imej di kedua-dua hujung domain, kemudian selesaikan dua kes nilai mutlak.`,
        steps: [{ do: R`Bucu: \(2x - 3 = 0 \Rightarrow x = 1.5\), \(f(1.5) = 0\)`, why: R`Bucu ialah titik terendah graf V. Ia berada dalam domain kerana \(-1 \le 1.5 \le 4\).` }, { do: R`\(f(-1) = |-5| = 5\), \(f(4) = |5| = 5\)` }, { do: R`Julat: \(0 \leq f(x) \leq 5\)`, why: R`Nilai terkecil ialah 0 di bucu (bukan di hujung domain); nilai terbesar ialah 5.` }, { do: R`(b) \(2x - 3 = 3\) atau \(2x - 3 = -3\)`, why: R`\(|u| = 3\) bermaksud \(u = 3\) atau \(u = -3\).` }, { do: R`\(x = 3\) atau \(x = 0\)`, why: R`Kedua-duanya berada dalam domain \(-1 \le x \le 4\), jadi kedua-duanya diterima.` }],
        check: R`\(f(3) = |3| = 3\) ✓ dan \(f(0) = |-3| = 3\) ✓`, conclusion: R`Julat \(0 \le f(x) \le 5\); objek-objeknya ialah 0 dan 3.` },
      { level: 'mencabar', sp: ['1.1.2', '1.1.3'], question: R`Penghawa dingin sebuah bilik ditetapkan pada 24°C. Sisihan suhu \(T\) daripada tetapan itu ialah \(d(T) = |T - 24|\), dengan \(16 \leq T \leq 30\). (a) Cari julat \(d\). (b) Pada suhu berapakah sisihannya 3°C?`, given: R`\(d(T) = |T - 24|\), \(16 \le T \le 30\)`, find: R`julat \(d\); nilai \(T\) apabila \(d = 3\)`, method: R`Fungsi nilai mutlak dengan domain terhad: semak bucu dan kedua-dua hujung.`,
        steps: [{ do: R`Bucu: \(T = 24\), \(d = 0\) (dalam domain)` }, { do: R`\(d(16) = 8\), \(d(30) = 6\)`, why: R`Hujung kiri lebih jauh dari 24, jadi ia memberi nilai terbesar.` }, { do: R`Julat: \(0 \le d \le 8\)` }, { do: R`(b) \(T - 24 = 3\) atau \(T - 24 = -3\), jadi \(T = 27\) atau \(T = 21\)`, why: R`Kedua-duanya dalam \(16 \le T \le 30\).` }],
        check: R`\(|27 - 24| = 3\) ✓, \(|21 - 24| = 3\) ✓`, conclusion: R`Julat \(0 \le d \le 8\) (dalam °C). Sisihan 3°C berlaku pada 21°C dan 27°C.` },
    ] },
    { kind: 'mistakes', items: [
      { wrong: R`\(f(3)\) bermaksud \(f \times 3\).`, why: R`\(f\) ialah nama peraturan, bukan nombor.`, fix: R`\(f(3)\) ialah imej apabila objek 3 dimasukkan ke dalam peraturan.` },
      { wrong: R`Julat \(f(x) = |x - 2|\) bagi \(-1 \le x \le 4\) ialah \(2 \le f(x) \le 3\), kerana \(f(4) = 2\) dan \(f(-1) = 3\).`, why: R`Bucu \(x = 2\) berada dalam domain dan \(f(2) = 0\) lebih kecil daripada nilai di kedua-dua hujung.`, fix: R`Lakar graf dahulu. Julatnya ialah \(0 \le f(x) \le 3\).` },
      { wrong: R`\(|x + 1| = 4 \Rightarrow x = 3\) sahaja.`, why: R`Kes negatif terlupa: \(x + 1\) juga boleh bernilai \(-4\).`, fix: R`\(x + 1 = 4\) atau \(x + 1 = -4\), maka \(x = 3\) atau \(x = -5\). Semak kedua-duanya dalam domain.` },
      { wrong: R`Banyak kepada satu bukan fungsi kerana dua objek menghala ke imej yang sama.`, why: R`Syarat fungsi hanya melarang <em>satu objek</em> mempunyai dua imej.`, fix: R`Banyak kepada satu ialah fungsi. Satu kepada banyak bukan fungsi.` },
    ] },
    { kind: 'summary', points: [
      R`Fungsi: setiap objek dalam domain mempunyai tepat satu imej. Tatatanda: \(f : x \mapsto 2x+1\) atau \(f(x) = 2x + 1\).`,
      R`Ujian garis mencancang: jika satu garis \(x = k\) memotong graf lebih daripada sekali, graf itu bukan fungsi.`,
      R`Nilai yang menjadikan penyebut sifar dikeluarkan daripada domain, contohnya \(x \ne 1\) bagi \(\dfrac{3}{x-1}\).`,
      R`Julat ⊆ kodomain. Untuk fungsi selanjar, lakar graf dan semak bucu serta hujung domain.`,
      R`\(|u| = k\ (k>0)\) memberi dua kes: \(u = k\) atau \(u = -k\). Buang jawapan di luar domain.`,
    ] },
    { kind: 'next', html: R`<p>Dalam <strong>1.2 Fungsi Gubahan</strong>, imej daripada satu fungsi menjadi objek bagi fungsi kedua. Kemahiran mencari imej dan objek di sini digunakan terus di sana.</p>`, links: [{ href: '#/nota/t4-1/1.2', label: '1.2 Fungsi Gubahan →' }] },
  ],
};

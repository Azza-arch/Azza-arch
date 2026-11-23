// V3 layer for T5 Bab 8 Kinematik Gerakan Linear. Original wording.
const R = String.raw;
export const V3 = {
  '8.1': {
    lead: R`Huraikan dan tentukan sesaran, halaju dan pecutan seketika, serta jumlah jarak yang dilalui.`,
    idea: R`<p>Zarah bergerak di atas garis nombor dengan titik tetap \(O\). Sesaran \(s\), halaju \(v\) dan pecutan \(a\) ialah vektor: tanda menunjukkan arah (kanan positif). Jarak dan laju ialah skalar.</p><p>Jika zarah bertukar arah, jumlah jarak lebih besar daripada magnitud sesaran: pecahkan perjalanan pada titik bertukar arah.</p>`,
    when: R`Menafsir kedudukan dan arah gerakan pada masa tertentu, dan mengira jarak sebenar yang dilalui.`,
    steps: [R`Gantikan \(t\) untuk nilai seketika; tafsir tanda (kiri/kanan, arah gerakan).`, R`Untuk jarak, cari masa bertukar arah (bucu graf \(s\) kuadratik).`, R`Kira \(s\) pada masa mula, bertukar arah dan akhir.`, R`Tambah nilai mutlak setiap perubahan.`],
    example: 2, visual: 0, mistake: 0,
  },
  '8.2': {
    lead: R`Hubungkan \(s\), \(v\) dan \(a\) melalui pembezaan, dan tafsir halaju dan pecutan seketika.`,
    idea: R`<p>\(v = \tfrac{ds}{dt}\) dan \(a = \tfrac{dv}{dt} = \tfrac{d^2s}{dt^2}\). Kecerunan graf \(s\)–\(t\) ialah halaju; kecerunan graf \(v\)–\(t\) ialah pecutan.</p><p>\(v = 0\): pegun seketika (sesaran maksimum/minimum). \(a = 0\): halaju maksimum/minimum. Halaju awal ialah \(v(0)\).</p>`,
    when: R`Apabila fungsi sesaran atau halaju diberi dan soalan bertanya tentang halaju, pecutan atau nilai maksimum.`,
    steps: [R`Bezakan \(s\) untuk mendapat \(v\); bezakan \(v\) untuk mendapat \(a\).`, R`Halaju awal: \(t = 0\); pegun seketika: selesaikan \(v = 0\).`, R`Sesaran maksimum: \(v = 0\) dan \(a < 0\); halaju maksimum/minimum: \(a = 0\).`, R`Tafsir jawapan dengan unit dan arah.`],
    example: 1, visual: 0, mistake: 1,
  },
  '8.3': {
    lead: R`Tentukan halaju dan sesaran melalui pengamiran, termasuk jumlah jarak.`,
    idea: R`<p>\(v = \int a\,dt\) dan \(s = \int v\,dt\). Setiap kamiran memerlukan satu syarat awal untuk mencari \(c\) (contohnya "bermula dari rehat": \(v(0) = 0\); "bermula dari \(O\)": \(s(0) = 0\)).</p><p>\(\int_{t_1}^{t_2} v\,dt\) ialah perubahan sesaran. Untuk jarak, pecahkan pada \(v = 0\) dan tambah nilai mutlak.</p>`,
    when: R`Apabila pecutan atau halaju diberi dan halaju, kedudukan atau jarak diminta.`,
    steps: [R`Amir dan tambah \(c\).`, R`Guna syarat awal untuk mencari \(c\).`, R`Untuk sesaran pada masa tertentu, gantikan \(t\).`, R`Untuk jarak, cari \(t\) apabila \(v = 0\) dalam tempoh itu, kemudian tambah \(\left|\int v\,dt\right|\) setiap bahagian.`],
    example: 2, visual: 0, mistake: 1,
  },
  '8.4': {
    lead: R`Selesaikan masalah kinematik gerakan linear yang melibatkan pembezaan dan pengamiran.`,
    idea: R`<p>Terjemah ayat kepada syarat: berhenti \(v = 0\); di \(O\) \(s = 0\); bertemu \(s_P = s_Q\); halaju maksimum \(a = 0\); "saat ke-\(n\)" ialah \(n - 1 \le t \le n\).</p><p>Bezakan untuk kadar, amir untuk jumlah, dan sentiasa semak pertukaran arah sebelum mengira jarak.</p>`,
    when: R`Masalah sebenar: jarak brek, objek dilambung, dua zarah bertemu, jarak dalam saat tertentu.`,
    steps: [R`Kenal pasti fungsi yang diberi dan syarat awal.`, R`Terjemah soalan kepada syarat matematik.`, R`Bezakan atau amir mengikut keperluan.`, R`Semak pertukaran arah, unit dan munasabah jawapan.`],
    example: 2, visual: 0, mistake: 0,
  },
};

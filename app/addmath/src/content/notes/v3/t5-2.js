// V3 layer for T5 Bab 2 Pembezaan. Original wording.
const R = String.raw;
export const V3 = {
  '2.1': {
    lead: R`Tentukan had suatu fungsi dan cari terbitan pertama dengan prinsip pertama.`,
    idea: R`<p><strong>Had</strong> ialah nilai yang dihampiri oleh \(f(x)\) apabila \(x\) menghampiri suatu nilai, dari kedua-dua arah. Had boleh wujud walaupun fungsi tidak tertakrif di titik itu.</p><p>Kecerunan perentas \(\tfrac{\delta y}{\delta x}\) menjadi kecerunan tangen apabila \(\delta x \to 0\): \(\tfrac{dy}{dx} = \had_{\delta x \to 0}\tfrac{\delta y}{\delta x}\).</p>`,
    when: R`Apabila gantian terus memberi \(\tfrac00\), dan apabila soalan meminta "prinsip pertama".`,
    steps: [R`Had: permudahkan (faktor atau darab konjugat), kemudian gantikan nilai \(x\).`, R`Prinsip pertama: tulis \(y + \delta y = f(x + \delta x)\).`, R`Tolak \(y\) untuk mendapat \(\delta y\), kemudian bahagi dengan \(\delta x\).`, R`Ambil had \(\delta x \to 0\).`],
    example: 2, visual: 0, mistake: 1,
  },
  '2.2': {
    lead: R`Bezakan fungsi algebra dengan rumus \(\tfrac{d}{dx}(ax^n)\), petua rantai, petua hasil darab dan petua hasil bahagi.`,
    idea: R`<p>\(\tfrac{d}{dx}(ax^n) = anx^{n - 1}\): kuasa turun menjadi pekali, dan kuasa berkurang satu. Bezakan sebutan demi sebutan.</p><p>Fungsi dalam fungsi: petua rantai \(\tfrac{dy}{dx} = \tfrac{dy}{du}\times\tfrac{du}{dx}\). Hasil darab: \(uv' + vu'\). Hasil bahagi: \(\tfrac{vu' - uv'}{v^2}\).</p>`,
    when: R`Untuk mendapat kecerunan lengkung atau kadar perubahan daripada rumus.`,
    steps: [R`Tulis semula setiap sebutan sebagai \(ax^n\) (contohnya \(\tfrac{5}{x^2} = 5x^{-2}\)).`, R`Kenal pasti bentuk: kurungan berkuasa → rantai; dua faktor → hasil darab; pecahan dua fungsi → hasil bahagi.`, R`Bezakan dan permudahkan (faktorkan jika boleh).`, R`Gantikan nilai \(x\) jika soalan meminta kecerunan pada titik.`],
    example: 2, visual: 0, mistake: 0,
  },
  '2.3': {
    lead: R`Cari terbitan kedua \(\tfrac{d^2y}{dx^2}\) dan fahami maksudnya.`,
    idea: R`<p>Terbitan kedua ialah terbitan bagi \(\tfrac{dy}{dx}\): \(\tfrac{d^2y}{dx^2} = \tfrac{d}{dx}\left(\tfrac{dy}{dx}\right)\). Ia mengukur kadar perubahan kecerunan.</p><p>Positif: kecerunan bertambah (melengkung ke atas). Negatif: kecerunan berkurang (melengkung ke bawah). Ia bukan \(\left(\tfrac{dy}{dx}\right)^2\).</p>`,
    when: R`Menentukan sifat titik pusingan, dan soalan "tunjukkan bahawa" yang melibatkan \(\tfrac{dy}{dx}\) dan \(\tfrac{d^2y}{dx^2}\).`,
    steps: [R`Cari \(\tfrac{dy}{dx}\) dan permudahkan.`, R`Bezakan \(\tfrac{dy}{dx}\) sekali lagi (guna petua rantai jika perlu).`, R`Gantikan nilai \(x\) jika diminta.`],
    example: 1, visual: 0, mistake: 0,
  },
  '2.4': {
    lead: R`Gunakan pembezaan untuk kecerunan, tangen dan normal, titik pusingan, pengoptimuman, kadar perubahan terhubung dan perubahan kecil.`,
    idea: R`<p>\(\tfrac{dy}{dx}\) ialah kecerunan tangen. Pada titik pusingan, \(\tfrac{dy}{dx} = 0\); tanda \(\tfrac{d^2y}{dx^2}\) (atau perubahan tanda \(\tfrac{dy}{dx}\)) menentukan maksimum atau minimum.</p><p>Kadar terhubung: \(\tfrac{dy}{dt} = \tfrac{dy}{dx}\cdot\tfrac{dx}{dt}\). Perubahan kecil: \(\delta y \approx \tfrac{dy}{dx}\,\delta x\).</p>`,
    when: R`Persamaan tangen/normal, nilai terbesar atau terkecil (luas, isi padu, kos), kuantiti yang berubah dengan masa, dan anggaran.`,
    steps: [R`Bezakan fungsi yang berkaitan.`, R`Tangen/normal: kecerunan \(m\) di titik, normal \(-\tfrac1m\), kemudian \(y - y_1 = m(x - x_1)\).`, R`Titik pusingan/optimum: selesaikan \(\tfrac{dy}{dx} = 0\), sahkan sifat, semak domain.`, R`Kadar: tulis petua rantai dengan unit; gantikan nilai selepas membezakan.`, R`Anggaran: \(\delta y \approx \tfrac{dy}{dx}\,\delta x\).`],
    example: 3, visual: 0, mistake: 1,
  },
};

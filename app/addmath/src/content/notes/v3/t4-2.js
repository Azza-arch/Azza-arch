// V3 layer for T4 Bab 2 Fungsi Kuadratik. Original wording.
const R = String.raw;
export const V3 = {
  '2.1': {
    lead: R`Selesaikan persamaan kuadratik, bentuk persamaan daripada punca, dan selesaikan ketaksamaan.`,
    idea: R`<p>Persamaan kuadratik \(ax^2 + bx + c = 0\) (\(a \ne 0\)) mempunyai paling banyak dua punca, iaitu nilai \(x\) di mana graf memotong paksi-\(x\). Punca boleh dicari dengan penyempurnaan kuasa dua atau rumus.</p><p>Untuk ketaksamaan, cari punca dahulu, kemudian tentukan bahagian graf yang di atas atau di bawah paksi-\(x\).</p>`,
    when: R`Apabila pemboleh ubah dikuasaduakan, contohnya luas, gerakan objek dilontar, atau keuntungan.`,
    steps: [R`Susun kepada bentuk am \(ax^2 + bx + c = 0\) (sebelah kanan sifar).`, R`Faktorkan jika boleh; jika tidak, guna rumus \(x = \tfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}\) atau penyempurnaan kuasa dua.`, R`Bentuk persamaan daripada punca \(\alpha, \beta\): \(x^2 - (\alpha + \beta)x + \alpha\beta = 0\).`, R`Ketaksamaan: cari punca, lakar parabola atau guna jadual tanda, kemudian pilih julat yang memenuhi tanda.`],
    example: 1, visual: 0, mistake: 0,
  },
  '2.2': {
    lead: R`Guna pembezalayan \(b^2 - 4ac\) untuk mengetahui jenis punca tanpa menyelesaikan persamaan.`,
    idea: R`<p>Pembezalayan \(b^2 - 4ac\) ialah bahagian di bawah punca kuasa dua dalam rumus. Tandanya memberitahu bilangan punca nyata: positif (dua berbeza), sifar (dua sama), negatif (tiada punca nyata).</p><p>Secara graf: dua titik potong, satu titik sentuhan, atau tiada persilangan dengan paksi-\(x\).</p>`,
    when: R`Apabila soalan bertanya tentang jenis punca, atau syarat bagi \(k\) supaya persamaan ada/tiada punca, atau garis menyentuh lengkung.`,
    steps: [R`Tulis dalam bentuk am dan kenal pasti \(a\), \(b\), \(c\) (dengan tanda).`, R`Bentuk syarat: \(b^2 - 4ac > 0\), \(= 0\) atau \(< 0\).`, R`Selesaikan persamaan atau ketaksamaan untuk pemalar yang tidak diketahui.`],
    example: 1, visual: 0, mistake: 1,
  },
  '2.3': {
    lead: R`Fahami bentuk graf \(f(x) = ax^2 + bx + c\), bentuk verteks, lakaran dan masalah maksimum/minimum.`,
    idea: R`<p>Graf fungsi kuadratik ialah parabola. Jika \(a > 0\) ia terbuka ke atas (ada nilai minimum); jika \(a < 0\), terbuka ke bawah (ada nilai maksimum).</p><p>Bentuk verteks \(f(x) = a(x - h)^2 + k\) terus memberi bucu \((h, k)\), paksi simetri \(x = h\), dan nilai maksimum atau minimum \(k\).</p>`,
    when: R`Untuk melakar parabola, mencari nilai terbesar/terkecil (luas, keuntungan, tinggi bola), atau menunjukkan ungkapan sentiasa positif.`,
    steps: [R`Tukar ke bentuk verteks dengan penyempurnaan kuasa dua (atau guna \(x = -\tfrac{b}{2a}\)).`, R`Baca bucu \((h, k)\) dan jenis titik (maks jika \(a < 0\), min jika \(a > 0\)).`, R`Untuk lakaran: tandakan bucu, pintasan-\(y\) (\(c\)) dan pintasan-\(x\) (punca, jika ada).`, R`Masalah konteks: bentuk fungsi kuadratik bagi kuantiti, kemudian cari bucunya.`],
    example: 2, visual: 1, mistake: 0,
  },
};

// V3 layer for T5 Bab 7 Pengaturcaraan Linear. Original wording.
const R = String.raw;
export const V3 = {
  '7.1': {
    lead: R`Bentukkan model matematik daripada kekangan situasi sebenar dan wakilkannya secara grafik.`,
    idea: R`<p>Setiap had dalam situasi ialah satu <strong>kekangan</strong>, ditulis sebagai ketaksamaan linear dalam \(x\) dan \(y\). Tambah \(x \ge 0\), \(y \ge 0\).</p><p>Rantau yang memenuhi <strong>semua</strong> kekangan serentak ialah <strong>rantau tersaur</strong> \(R\): setiap titik di dalamnya ialah pilihan yang dibenarkan.</p>`,
    when: R`Apabila masalah menyebut had seperti "tidak melebihi", "sekurang-kurangnya", "paling banyak" untuk dua kuantiti.`,
    steps: [R`Takrif \(x\) dan \(y\) dengan jelas.`, R`Terjemah setiap had kepada ketaksamaan; permudahkan pekali.`, R`Lukis garis sempadan (penuh untuk \(\le, \ge\); putus-putus untuk \(<, >\)).`, R`Guna titik ujian (bukan pada garis) untuk menentukan sebelah; lorek \(R\).`],
    example: 1, visual: 0, mistake: 1,
  },
  '7.2': {
    lead: R`Selesaikan masalah pengaturcaraan linear secara graf untuk mencari nilai optimum.`,
    idea: R`<p><strong>Fungsi objektif</strong> \(k = ax + by\) ialah kuantiti yang hendak dimaksimumkan atau diminimumkan. Garis \(ax + by = k\) semuanya selari.</p><p>Gerakkan garis objektif merentasi \(R\): titik terakhir yang disentuh memberi maksimum, titik pertama memberi minimum. Optimum berlaku di bucu \(R\).</p>`,
    when: R`Mencari untung maksimum, kos minimum atau bilangan terbaik apabila terdapat beberapa kekangan.`,
    steps: [R`Bina kekangan dan fungsi objektif \(k = ax + by\).`, R`Lukis \(R\) dan satu garis objektif \(ax + by = k_0\).`, R`Gerakkan garis selari merentasi \(R\); kenal pasti titik terakhir (maks) atau pertama (min).`, R`Kira \(k\) di titik itu; semak dengan bucu lain.`, R`Jika perlu integer, semak titik integer berhampiran dalam \(R\).`],
    example: 0, visual: 0, mistake: 0,
  },
};

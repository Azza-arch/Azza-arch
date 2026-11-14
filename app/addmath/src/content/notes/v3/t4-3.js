// V3 layer for T4 Bab 3 Sistem Persamaan. Original wording.
const R = String.raw;
export const V3 = {
  '3.1': {
    lead: R`Selesaikan tiga persamaan linear dengan tiga pemboleh ubah \(x\), \(y\), \(z\).`,
    idea: R`<p>Tiga pemboleh ubah yang tidak diketahui memerlukan tiga persamaan. Strateginya: hapuskan satu pemboleh ubah untuk mendapat dua persamaan dengan dua pemboleh ubah, selesaikan, kemudian gantikan balik.</p><p>Jika penghapusan memberi pernyataan mustahil seperti \(0 = 2\), sistem itu tiada penyelesaian.</p>`,
    when: R`Apabila tiga kuantiti tidak diketahui dihubungkan oleh tiga maklumat, contohnya harga tiga barang daripada tiga resit.`,
    steps: [R`Labelkan persamaan (1), (2), (3).`, R`Pilih satu pemboleh ubah dan hapuskannya daripada <em>dua pasangan</em> persamaan berbeza: dapat (4) dan (5).`, R`Selesaikan (4) dan (5) untuk dua pemboleh ubah.`, R`Gantikan ke salah satu persamaan asal untuk pemboleh ubah ketiga; semak dalam ketiga-tiga persamaan.`],
    example: 1, visual: 0, mistake: 0,
  },
  '3.2': {
    lead: R`Selesaikan satu persamaan linear dan satu persamaan tak linear secara serentak.`,
    idea: R`<p>Penyelesaian ialah titik persilangan garis dengan lengkung, jadi boleh ada dua, satu atau tiada pasangan \((x, y)\).</p><p>Kaedahnya penggantian: jadikan satu pemboleh ubah perkara rumus daripada persamaan <strong>linear</strong>, gantikan ke dalam persamaan tak linear, lalu selesaikan persamaan kuadratik yang terhasil.</p>`,
    when: R`Apabila satu syarat linear (perimeter, beza) dan satu syarat tak linear (luas, kuasa dua) berlaku serentak.`,
    steps: [R`Daripada persamaan linear, tulis \(y = \ldots\) (atau \(x = \ldots\)).`, R`Gantikan ke dalam persamaan tak linear dengan kurungan; kembangkan.`, R`Selesaikan persamaan kuadratik untuk satu pemboleh ubah.`, R`Gantikan setiap nilai ke dalam persamaan <em>linear</em> untuk pasangannya; tolak jawapan yang tidak bermakna dalam konteks.`],
    example: 0, visual: 0, mistake: 0,
  },
};

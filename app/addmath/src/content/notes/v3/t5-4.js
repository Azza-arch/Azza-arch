// V3 layer for T5 Bab 4 Pilih Atur dan Gabungan. Original wording.
const R = String.raw;
export const V3 = {
  '4.1': {
    lead: R`Kira bilangan susunan dengan petua pendaraban, \(n!\), \({}^nP_r\), objek secaman dan syarat.`,
    idea: R`<p><strong>Petua pendaraban:</strong> \(m\) cara diikuti \(n\) cara memberi \(m \times n\) cara.</p><p><strong>Pilih atur</strong> mengambil kira tertib: \(n!\) bagi semua \(n\) objek, \({}^nP_r = \tfrac{n!}{(n - r)!}\) bagi \(r\) daripada \(n\). Objek secaman: bahagi dengan \(a!\,b!\cdots\). Bulatan: \((n - 1)!\).</p>`,
    when: R`Apabila menukar tertib menghasilkan susunan berbeza: barisan, kata laluan, nombor, kedudukan pemenang.`,
    steps: [R`Tanya: adakah tertib penting? Ya: pilih atur.`, R`Isi tempat bersyarat dahulu; ikat objek yang mesti bersama sebagai satu blok.`, R`Darab bilangan pilihan bagi setiap tempat (atau guna \(n!\), \({}^nP_r\)).`, R`Bahagi dengan faktorial objek secaman; guna \((n - 1)!\) untuk bulatan.`],
    example: 2, visual: 0, mistake: 0,
  },
  '4.2': {
    lead: R`Bezakan pilih atur dan gabungan, dan kira \({}^nC_r\) termasuk masalah bersyarat.`,
    idea: R`<p><strong>Gabungan</strong> ialah pilihan tanpa mengambil kira tertib. Setiap gabungan \(r\) objek muncul sebagai \(r!\) pilih atur, jadi \({}^nC_r = \tfrac{{}^nP_r}{r!} = \tfrac{n!}{(n - r)!\,r!}\).</p><p>Kumpulan berbeza: darab. Kes berbeza ("sekurang-kurangnya"): tambah.</p>`,
    when: R`Memilih ahli pasukan, jawatankuasa, soalan untuk dijawab, atau barang untuk dibawa.`,
    steps: [R`Tanya: adakah tertib penting? Tidak: gabungan.`, R`Orang yang mesti dipilih: masukkan dahulu; yang tidak boleh: keluarkan.`, R`Dua kumpulan: \({}^{n_1}C_{r_1} \times {}^{n_2}C_{r_2}\).`, R`"Sekurang-kurangnya/paling banyak": senaraikan kes dan tambah, atau jumlah tolak kes tidak dikehendaki.`],
    example: 2, visual: 0, mistake: 0,
  },
};

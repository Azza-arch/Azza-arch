// V3 layer for T4 Bab 8 Vektor. Original wording.
const R = String.raw;
export const V3 = {
  '8.1': {
    lead: R`Bezakan vektor dan skalar, wakilkan vektor, dan fahami vektor selari.`,
    idea: R`<p>Vektor mempunyai <strong>magnitud dan arah</strong> (sesaran, halaju, daya); skalar hanya magnitud (jarak, jisim). Vektor diwakili oleh anak panah \(\overrightarrow{AB}\) atau \(\uv{a}\).</p><p>Mendarab dengan skalar \(k\) meregangkan vektor; jika \(k < 0\), arahnya terbalik. Dua vektor selari jika satu ialah gandaan skalar yang lain.</p>`,
    when: R`Apabila arah sama penting dengan saiz, contohnya navigasi, daya dan halaju.`,
    steps: [R`Semak sama ada kuantiti mempunyai arah: vektor atau skalar.`, R`Magnitud \(|k\uv{a}| = |k||\uv{a}|\); arah ditentukan oleh tanda \(k\).`, R`Untuk selari: tunjukkan \(\uv{u} = k\uv{v}\).`, R`Jika \(\uv{a}, \uv{b}\) tidak selari dan \(h\uv{a} = k\uv{b}\), maka \(h = k = 0\).`],
    example: 2, visual: 0, mistake: 1,
  },
  '8.2': {
    lead: R`Tambah dan tolak vektor dengan hukum segi tiga, segi empat selari dan poligon.`,
    idea: R`<p>Untuk menambah vektor, sambungkan <strong>kepala ke ekor</strong>; vektor paduan ialah dari ekor pertama ke kepala terakhir. Menolak \(\uv{b}\) sama dengan menambah \(-\uv{b}\).</p><p>Dalam segi tiga \(OAB\), \(\overrightarrow{AB} = \uv{b} - \uv{a}\) ("kepala tolak ekor").</p>`,
    when: R`Untuk mencari sesaran atau halaju paduan, dan mengungkapkan vektor dalam rajah geometri.`,
    steps: [R`Cari laluan dari titik mula ke titik akhir melalui vektor yang diketahui.`, R`Tambah vektor di sepanjang laluan; tukar tanda jika bergerak bertentangan arah.`, R`Untuk magnitud vektor serenjang, guna Pythagoras.`],
    example: 1, visual: 0, mistake: 1,
  },
  '8.3': {
    lead: R`Tulis vektor dalam bentuk \(x\uv{i} + y\uv{j}\), cari magnitud, vektor unit dan lakukan operasi.`,
    idea: R`<p>Dalam satah Cartes, setiap vektor boleh ditulis \(x\uv{i} + y\uv{j}\), dengan \(\uv{i}\) dan \(\uv{j}\) vektor unit pada paksi-\(x\) dan paksi-\(y\). Magnitud \(|x\uv{i} + y\uv{j}| = \sqrt{x^2 + y^2}\).</p><p>Vektor unit (magnitud 1) dalam arah \(\uv{r}\) ialah \(\tfrac{\uv{r}}{|\uv{r}|}\). Tambah, tolak dan darab dengan skalar dibuat komponen demi komponen.</p>`,
    when: R`Apabila vektor diberi dengan koordinat atau komponen, contohnya halaju pesawat dan angin.`,
    steps: [R`Tulis setiap vektor dalam bentuk komponen (vektor kedudukan: \(\overrightarrow{AB} = \overrightarrow{OB} - \overrightarrow{OA}\)).`, R`Operasi komponen demi komponen.`, R`Magnitud \(\sqrt{x^2 + y^2}\); vektor unit = vektor ÷ magnitud.`, R`Selari: nisbah komponen sama.`],
    example: 2, visual: 0, mistake: 0,
  },
};

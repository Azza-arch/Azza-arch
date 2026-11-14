// V3 layer for T4 Bab 10 Nombor Indeks. Original wording.
const R = String.raw;
export const V3 = {
  '10.1': {
    lead: R`Kira dan tafsir nombor indeks untuk membandingkan perubahan berbanding masa asas.`,
    idea: R`<p>Nombor indeks membandingkan nilai pada masa tertentu (\(Q_1\)) dengan nilai pada <strong>masa asas</strong> (\(Q_0\)), dalam bentuk peratus: \(I = \tfrac{Q_1}{Q_0} \times 100\). Indeks masa asas sentiasa 100.</p><p>\(I > 100\) bermaksud naik \((I - 100)\%\); \(I < 100\) bermaksud turun \((100 - I)\%\).</p>`,
    when: R`Untuk membandingkan perubahan harga, pencemaran, kemalangan atau sebarang kuantiti dari masa ke masa.`,
    steps: [R`Kenal pasti masa asas (\(Q_0\), di penyebut) dan masa tertentu (\(Q_1\)).`, R`Kira \(I = \tfrac{Q_1}{Q_0} \times 100\), atau susun semula untuk \(Q_1\) atau \(Q_0\).`, R`Indeks berantai: \(I_{C/A} = \tfrac{I_{C/B} \times I_{B/A}}{100}\) (darab, jangan tambah).`],
    example: 2, visual: 0, mistake: 0,
  },
  '10.2': {
    lead: R`Gabungkan beberapa indeks dengan pemberat menjadi satu indeks gubahan.`,
    idea: R`<p>Indeks gubahan ialah purata berpemberat bagi beberapa indeks: \(\bar I = \tfrac{\sum I_i W_i}{\sum W_i}\). Pemberat menunjukkan kepentingan setiap barang, seperti peratus perbelanjaan.</p><p>Hanya nilai relatif pemberat penting; pemberat boleh dalam bentuk bilangan, nisbah, peratus atau sudut carta pai.</p>`,
    when: R`Untuk mengukur perubahan keseluruhan, contohnya kos hidup atau kos operasi yang melibatkan banyak barang.`,
    steps: [R`Senaraikan setiap indeks \(I_i\) dan pemberatnya \(W_i\).`, R`Kira \(\sum I_iW_i\) dan \(\sum W_i\), kemudian bahagi.`, R`Nilai yang hilang: bentuk persamaan daripada rumus dan selesaikan.`, R`Ramalan kos: \(\text{kos}_1 = \tfrac{\bar I \times \text{kos}_0}{100}\).`],
    example: 1, visual: 0, mistake: 0,
  },
};

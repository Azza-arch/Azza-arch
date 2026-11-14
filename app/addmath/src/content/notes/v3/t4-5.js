// V3 layer for T4 Bab 5 Janjang. Original wording.
const R = String.raw;
export const V3 = {
  '5.1': {
    lead: R`Kenal pasti janjang aritmetik, cari sebutan ke-\(n\) dan hasil tambah \(n\) sebutan.`,
    idea: R`<p>Janjang aritmetik (JA) bertambah atau berkurang dengan <strong>beza sepunya</strong> \(d\) yang tetap: \(d = T_2 - T_1 = T_3 - T_2\).</p><p>Sebutan ke-\(n\) ialah sebutan pertama ditambah \((n - 1)\) kali \(d\), kerana dari \(T_1\) ke \(T_n\) ada \(n - 1\) langkah.</p>`,
    when: R`Apabila sesuatu berubah dengan jumlah tetap setiap langkah: kerusi setiap barisan, simpanan tetap bulanan.`,
    steps: [R`Kenal pasti \(a\) dan \(d\) (semak beza sama untuk beberapa pasangan).`, R`Sebutan tertentu: \(T_n = a + (n - 1)d\); untuk "sebutan keberapa", selesaikan untuk \(n\) (mesti integer positif).`, R`Hasil tambah: \(S_n = \tfrac n2[2a + (n - 1)d]\).`, R`Jika diberi dua sebutan, bentuk dua persamaan dalam \(a\) dan \(d\).`],
    example: 1, visual: 0, mistake: 0,
  },
  '5.2': {
    lead: R`Kenal pasti janjang geometri, cari \(T_n\), \(S_n\) dan hasil tambah hingga ketakterhinggaan.`,
    idea: R`<p>Janjang geometri (JG) didarab dengan <strong>nisbah sepunya</strong> \(r\) yang tetap: \(r = \tfrac{T_2}{T_1} = \tfrac{T_3}{T_2}\).</p><p>Jika \(-1 < r < 1\), sebutan semakin kecil dan hasil tambah menghampiri nilai terhingga \(S_\infty = \tfrac{a}{1 - r}\).</p>`,
    when: R`Apabila sesuatu berubah dengan peratus tetap: susut nilai, pertumbuhan, lantunan bola, perpuluhan berulang.`,
    steps: [R`Kenal pasti \(a\) dan \(r\) (semak nisbah sama).`, R`Sebutan: \(T_n = ar^{n - 1}\); untuk "sebutan keberapa", guna log jika perlu.`, R`Hasil tambah: \(S_n = \tfrac{a(1 - r^n)}{1 - r}\) (\(r \ne 1\)).`, R`Hingga ketakterhinggaan hanya jika \(|r| < 1\): \(S_\infty = \tfrac{a}{1 - r}\).`],
    example: 1, visual: 0, mistake: 0,
  },
};

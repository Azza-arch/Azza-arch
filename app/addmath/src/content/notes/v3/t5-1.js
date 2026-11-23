// V3 layer for T5 Bab 1 Sukatan Membulat. Original wording.
const R = String.raw;
export const V3 = {
  '1.1': {
    lead: R`Tukar sukatan sudut antara darjah dan radian, dalam sebutan \(\pi\) atau perpuluhan.`,
    idea: R`<p>Satu <strong>radian</strong> ialah sudut di pusat yang dicangkum oleh lengkok sepanjang jejari. Satu pusingan penuh ialah \(2\pi\) radian, jadi \(\pi \text{ rad} = 180^\circ\).</p><p>Darjah ke radian: darab \(\tfrac{\pi}{180^\circ}\). Radian ke darjah: darab \(\tfrac{180^\circ}{\pi}\).</p>`,
    when: R`Setiap kali rumus bab ini digunakan (\(s = j\theta\), \(L = \tfrac12 j^2\theta\)), kerana sudut mesti dalam radian.`,
    steps: [R`Kenal pasti unit sudut yang diberi.`, R`Darjah → radian: darab \(\tfrac{\pi}{180^\circ}\); permudahkan pecahan jika jawapan dalam sebutan \(\pi\).`, R`Radian → darjah: darab \(\tfrac{180^\circ}{\pi}\).`, R`Semak: \(1 \text{ rad} \approx 57.3^\circ\), jadi jawapan mesti munasabah.`],
    example: 1, visual: 0, mistake: 0,
  },
  '1.2': {
    lead: R`Kira panjang lengkok, jejari atau sudut dengan \(s = j\theta\), dan perimeter tembereng.`,
    idea: R`<p>Panjang lengkok berkadar dengan sudut di pusat: \(s = j\theta\), dengan \(\theta\) dalam <strong>radian</strong>.</p><p>Perimeter sektor = \(s + 2j\). Perimeter tembereng = \(s +\) perentas, dengan perentas \(AB = 2j\sin\tfrac{\theta}{2}\).</p>`,
    when: R`Jarak di sepanjang bahagian bulatan: hujung bandul, roda berputar, tali sawat, trek lengkung.`,
    steps: [R`Tukar sudut kepada radian jika perlu.`, R`Guna \(s = j\theta\), atau susun semula: \(j = \tfrac{s}{\theta}\), \(\theta = \tfrac{s}{j}\).`, R`Untuk tembereng, cari perentas (\(2j\sin\tfrac{\theta}{2}\) atau petua kosinus) dan tambah lengkok.`, R`Nyatakan unit.`],
    example: 2, visual: 0, mistake: 0,
  },
  '1.3': {
    lead: R`Kira luas sektor dengan \(L = \tfrac12 j^2\theta\), dan luas tembereng.`,
    idea: R`<p>Luas sektor berkadar dengan sudut: \(L = \tfrac12 j^2\theta\), \(\theta\) dalam radian.</p><p>Luas tembereng = luas sektor − luas \(\triangle OAB\) \(= \tfrac12 j^2(\theta - \sin\theta)\). Kalkulator mesti dalam mod RAD untuk \(\sin\theta\).</p>`,
    when: R`Kawasan berbentuk hirisan bulatan: potongan piza, kawasan pengelap cermin, taman berbentuk kipas.`,
    steps: [R`Pastikan sudut dalam radian dan guna jejari (bukan diameter).`, R`Sektor: \(L = \tfrac12 j^2\theta\); cari \(j\) atau \(\theta\) dengan menyusun semula jika perlu.`, R`Tembereng: tolak luas segi tiga \(\tfrac12 j^2\sin\theta\).`, R`Nyatakan unit persegi.`],
    example: 2, visual: 0, mistake: 1,
  },
  '1.4': {
    lead: R`Selesaikan masalah sebenar yang melibatkan lengkok, sektor dan tembereng.`,
    idea: R`<p>Pecahkan bentuk kepada sektor, segi tiga dan tembereng. Tambah atau tolak luas; untuk perimeter, jumlahkan sempadan luar sahaja.</p><p>Kawasan antara dua lengkok sepusat: \(\tfrac12(R^2 - r^2)\theta\).</p>`,
    when: R`Rajah gabungan: pengelap cermin, kipas tangan, kon daripada sektor kertas, tingkap gerbang.`,
    steps: [R`Lukis rajah; tandakan pusat, jejari dan sudut (radian).`, R`Kenal pasti bahagian: sektor, segi tiga, tembereng.`, R`Kira setiap bahagian, kemudian tambah atau tolak.`, R`Semak unit dan munasabah jawapan.`],
    example: 0, visual: 0, mistake: 0,
  },
};

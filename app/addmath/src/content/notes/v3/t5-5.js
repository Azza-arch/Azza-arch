// V3 layer for T5 Bab 5 Taburan Kebarangkalian. Original wording.
const R = String.raw;
export const V3 = {
  '5.1': {
    lead: R`Kenal pasti pemboleh ubah rawak diskret dan selanjar, dan bina taburan kebarangkalian.`,
    idea: R`<p><strong>Pemboleh ubah rawak</strong> memberi nombor kepada setiap kesudahan. <strong>Diskret</strong>: nilai boleh dibilang (0, 1, 2, …). <strong>Selanjar</strong>: sebarang nilai dalam selang (masa, tinggi).</p><p>Dalam taburan kebarangkalian diskret, \(\sum P(X = x) = 1\).</p>`,
    when: R`Apabila hasil eksperimen rawak dikira (bilangan kepala, guli merah) dan kebarangkalian setiap nilai diperlukan.`,
    steps: [R`Senaraikan semua kesudahan (gambar rajah pokok).`, R`Tentukan nilai \(X\) bagi setiap kesudahan.`, R`Kumpul kebarangkalian bagi setiap nilai \(X\); kemas kini penyebut jika tanpa pengembalian.`, R`Semak \(\sum P(X = x) = 1\).`],
    example: 2, visual: 0, mistake: 0,
  },
  '5.2': {
    lead: R`Kenal pasti taburan binomial, kira \(P(X = r)\), min dan sisihan piawai.`,
    idea: R`<p>\(X \sim B(n, p)\) jika ada \(n\) percubaan tetap, setiap satu berjaya dengan kebarangkalian \(p\) yang sama, secara tak bersandar.</p><p>\(P(X = r) = {}^nC_r\,p^r q^{n - r}\), \(q = 1 - p\). Min \(\mu = np\); sisihan piawai \(\sigma = \sqrt{npq}\).</p>`,
    when: R`Bilangan "berjaya" dalam percubaan berulang yang sama: lambungan dadu, benih bercambah, produk rosak.`,
    steps: [R`Semak syarat binomial; nyatakan \(n\) dan \(p\).`, R`Tukar ayat kepada nilai \(X\): "sekurang-kurangnya 1" ialah \(1 - P(X = 0)\).`, R`Kira setiap \(P(X = r)\) dengan rumus dan tambah jika perlu.`, R`Min \(np\), sisihan piawai \(\sqrt{npq}\); tafsir dalam konteks.`],
    example: 2, visual: 0, mistake: 0,
  },
  '5.3': {
    lead: R`Fahami taburan normal, tukar kepada skor-\(z\) dan cari kebarangkalian atau nilai.`,
    idea: R`<p>\(X \sim N(\mu, \sigma^2)\) berbentuk loceng, simetri pada \(\mu\); kebarangkalian ialah luas di bawah lengkung (jumlah 1).</p><p>\(Z = \tfrac{X - \mu}{\sigma}\) menukar semua taburan normal kepada \(N(0, 1)\), jadi satu jadual \(Q(z) = P(Z > z)\) mencukupi.</p>`,
    when: R`Ukuran yang bertabur secara normal: jisim paket, markah, tinggi. Cari peratus, atau nilai sempadan bagi peratus tertentu.`,
    steps: [R`Lakar lengkung dan lorek kawasan yang dikehendaki.`, R`Tukar \(x\) kepada \(z = \tfrac{x - \mu}{\sigma}\) (pembahagi \(\sigma\), bukan \(\sigma^2\)).`, R`Guna jadual dan simetri: \(P(Z < -a) = Q(a)\), \(P(Z < a) = 1 - Q(a)\).`, R`Jika kebarangkalian diberi, cari \(z\) daripada jadual, kemudian \(x = \mu + z\sigma\).`],
    example: 4, visual: 0, mistake: 0,
  },
};

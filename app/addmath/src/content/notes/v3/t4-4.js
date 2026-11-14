// V3 layer for T4 Bab 4 Indeks, Surd dan Logaritma. Original wording.
const R = String.raw;
export const V3 = {
  '4.1': {
    lead: R`Guna hukum indeks untuk permudahkan ungkapan dan selesaikan persamaan eksponen.`,
    idea: R`<p>Indeks menunjukkan berapa kali asas didarab dengan dirinya. Hukum indeks berlaku untuk asas yang <strong>sama</strong>: darab, tambah indeks; bahagi, tolak indeks; kuasa bagi kuasa, darab indeks.</p><p>Indeks sifar, negatif dan pecahan mempunyai maksud khas: \(a^0 = 1\), \(a^{-n} = \tfrac{1}{a^n}\), \(a^{\frac{m}{n}} = \left(\sqrt[n]{a}\right)^m\).</p>`,
    when: R`Untuk permudahkan ungkapan berkuasa, menilai tanpa kalkulator, dan menyelesaikan persamaan seperti \(9^x = 27^{x - 1}\).`,
    steps: [R`Tulis setiap nombor sebagai kuasa bagi asas yang sama (contohnya \(9 = 3^2\), \(27 = 3^3\)).`, R`Guna hukum indeks untuk menggabungkan kepada satu kuasa di setiap belah.`, R`Asas sama, jadi samakan indeks dan selesaikan.`, R`Jika ada sebutan seperti \(2^{x + 2} - 2^x\), faktorkan \(2^x\) dahulu.`],
    example: 1, visual: 0, mistake: 0,
  },
  '4.2': {
    lead: R`Kenal pasti surd, permudahkan, dan nisbahkan penyebut.`,
    idea: R`<p>Surd ialah punca kuasa yang tidak boleh ditulis sebagai nombor nisbah, contohnya \(\sqrt{2}\). Ia memberi nilai <strong>tepat</strong>, berbeza daripada perpuluhan yang dibundarkan.</p><p>Permudahkan dengan mengeluarkan faktor kuasa dua sempurna (\(\sqrt{18} = 3\sqrt2\)). Hanya surd yang serupa boleh ditambah atau ditolak.</p>`,
    when: R`Apabila jawapan perlu dalam bentuk tepat, dan untuk menghapuskan surd daripada penyebut.`,
    steps: [R`Faktorkan nombor di bawah punca supaya ada kuasa dua sempurna: \(\sqrt{50} = \sqrt{25 \times 2} = 5\sqrt2\).`, R`Gabungkan surd serupa sahaja: \(3\sqrt2 + 5\sqrt2 = 8\sqrt2\).`, R`Nisbahkan \(\tfrac{k}{\sqrt a}\): darab atas dan bawah dengan \(\sqrt a\).`, R`Nisbahkan \(\tfrac{k}{a + \sqrt b}\): darab dengan konjugat \(a - \sqrt b\).`],
    example: 1, visual: 0, mistake: 1,
  },
  '4.3': {
    lead: R`Fahami logaritma sebagai songsangan indeks dan guna hukum logaritma.`,
    idea: R`<p>Logaritma menjawab soalan "kuasa berapa?": \(\log_a N = x\) bermaksud \(a^x = N\) (\(a > 0\), \(a \ne 1\), \(N > 0\)).</p><p>Hukum logaritma menukar darab kepada tambah, bahagi kepada tolak, dan kuasa kepada darab. Rumus tukar asas membolehkan kita guna kalkulator.</p>`,
    when: R`Untuk menyelesaikan persamaan di mana pemboleh ubah berada di indeks atau di dalam log, dan dalam skala seperti pH atau desibel.`,
    steps: [R`Tukar antara bentuk indeks dan log: \(a^x = N \iff \log_a N = x\).`, R`Gabungkan log dengan asas sama menjadi satu log menggunakan hukum.`, R`Tukar kembali ke bentuk indeks dan selesaikan.`, R`Semak: nilai di dalam setiap log mesti positif; tolak penyelesaian yang tidak sah.`],
    example: 2, visual: 0, mistake: 0,
  },
  '4.4': {
    lead: R`Selesaikan masalah sebenar (faedah kompaun, pereputan, pertumbuhan) dengan indeks dan logaritma.`,
    idea: R`<p>Banyak situasi sebenar berubah secara eksponen: simpanan, populasi, bahan radioaktif. Apabila yang tidak diketahui ialah <strong>masa</strong> (di tempat indeks), ambil logaritma kedua-dua belah.</p><p>Logaritma jati \(\ln\) (asas \(e\)) digunakan untuk model dengan \(e^x\).</p>`,
    when: R`Apabila soalan bertanya "selepas berapa lama" atau "berapa tahun" bagi kuantiti yang bertambah atau berkurang dengan peratus tetap.`,
    steps: [R`Bentuk persamaan, contohnya \(P(1 + r)^n = A\) atau \(m = m_0e^{-kt}\).`, R`Asingkan sebutan eksponen di satu belah.`, R`Ambil \(\lg\) (atau \(\ln\)) kedua-dua belah dan selesaikan; jangan bundarkan terlalu awal.`, R`Tafsir: untuk "tahun penuh", bundarkan ke atas mengikut konteks.`],
    example: 0, visual: 0, mistake: 0,
  },
};

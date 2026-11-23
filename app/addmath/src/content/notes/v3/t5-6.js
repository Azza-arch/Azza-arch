// V3 layer for T5 Bab 6 Fungsi Trigonometri. Original wording.
const R = String.raw;
export const V3 = {
  '6.1': {
    lead: R`Wakilkan sudut positif dan negatif dalam satah Cartes dan tentukan sukuan.`,
    idea: R`<p>Sudut diukur dari paksi-\(x\) positif. <strong>Sudut positif</strong> berputar lawan arah jam; <strong>sudut negatif</strong> ikut arah jam.</p><p>Sudut yang berbeza dengan \(360^\circ\) (\(2\pi\)) berkongsi lengan terminal yang sama.</p>`,
    when: R`Sebelum mencari nisbah trigonometri sebarang sudut, dan untuk putaran lebih daripada satu pusingan.`,
    steps: [R`Tambah atau tolak \(360^\circ\) sehingga sudut di antara \(0^\circ\) dan \(360^\circ\).`, R`Tentukan sukuan: I (0–90°), II (90–180°), III (180–270°), IV (270–360°).`, R`Untuk radian, tukar kepada darjah atau bandingkan dengan \(\tfrac{\pi}{2}\), \(\pi\), \(\tfrac{3\pi}{2}\), \(2\pi\).`],
    example: 0, visual: 0, mistake: 0,
  },
  '6.2': {
    lead: R`Cari sek, kosek dan kot, serta nilai nisbah trigonometri bagi sebarang sudut.`,
    idea: R`<p>\(\sek\theta = \tfrac{1}{\kos\theta}\), \(\kosek\theta = \tfrac{1}{\sin\theta}\), \(\kot\theta = \tfrac{1}{\tan\theta}\).</p><p>Bagi sebarang sudut: cari <strong>sudut rujukan</strong> \(\alpha\) (sudut tirus dengan paksi-\(x\)), kemudian beri tanda mengikut sukuan (Semua, Sin, Tan, Kos positif di sukuan I, II, III, IV).</p>`,
    when: R`Nilai tepat bagi sudut seperti \(240^\circ\) atau \(-150^\circ\), dan nisbah lain apabila satu nisbah dan sukuan diberi.`,
    steps: [R`Tentukan sukuan sudut.`, R`Cari sudut rujukan \(\alpha\).`, R`Nilai nisbah bagi \(\alpha\) (segi tiga khas atau segi tiga daripada nisbah yang diberi).`, R`Beri tanda mengikut sukuan; guna salingan untuk sek, kosek, kot.`],
    example: 1, visual: 0, mistake: 0,
  },
  '6.3': {
    lead: R`Lakar graf sinus, kosinus dan tangen, dan kaji kesan perubahan pemalar.`,
    idea: R`<p>Bagi \(y = a\sin bx + c\) (atau kos): <strong>amplitud</strong> \(|a|\), <strong>kala</strong> \(\tfrac{360^\circ}{b}\), dan \(c\) menganjak graf secara menegak. Bagi \(\tan bx\), kala \(\tfrac{180^\circ}{b}\).</p><p>Nilai maksimum \(c + |a|\), minimum \(c - |a|\). Graf \(y = |f(x)|\) memantulkan bahagian negatif ke atas.</p>`,
    when: R`Melakar graf, menentukan julat, dan mengira bilangan penyelesaian persamaan dengan melukis garis lurus yang sesuai.`,
    steps: [R`Kenal pasti \(a\), \(b\), \(c\): amplitud, kala, anjakan.`, R`Bahagikan satu kala kepada empat bahagian; plot maksimum, minimum dan titik tengah.`, R`Lukis lengkung licin dalam domain yang diberi.`, R`Bilangan penyelesaian: lukis garis bagi sebelah lagi persamaan dan kira persilangan.`],
    example: 0, visual: 0, mistake: 0,
  },
  '6.4': {
    lead: R`Terbitkan dan gunakan identiti asas trigonometri untuk membuktikan identiti lain.`,
    idea: R`<p>\(\sin^2 A + \kos^2 A = 1\). Bahagi dengan \(\kos^2 A\): \(1 + \tan^2 A = \sek^2 A\). Bahagi dengan \(\sin^2 A\): \(1 + \kot^2 A = \kosek^2 A\).</p><p>Untuk membuktikan identiti, mulakan dengan sebelah yang lebih rumit dan ubah ke sebelah lagi.</p>`,
    when: R`Soalan "buktikan", dan persamaan yang mengandungi dua nisbah berbeza (contohnya \(\sin^2\) dan \(\kos\)).`,
    steps: [R`Pilih sebelah yang lebih rumit.`, R`Tukar sek, kosek, kot, tan kepada sin dan kos.`, R`Gabungkan pecahan dan guna identiti asas untuk memudahkan.`, R`Berhenti apabila sama dengan sebelah lagi.`],
    example: 1, visual: 0, mistake: 0,
  },
  '6.5': {
    lead: R`Gunakan rumus sudut majmuk dan sudut berganda untuk nilai tepat, permudahan dan bukti.`,
    idea: R`<p>\(\sin(A \pm B) = \sin A\kos B \pm \kos A\sin B\); \(\kos(A \pm B) = \kos A\kos B \mp \sin A\sin B\); \(\tan(A \pm B) = \tfrac{\tan A \pm \tan B}{1 \mp \tan A\tan B}\).</p><p>Sudut berganda (letak \(B = A\)): \(\sin 2A = 2\sin A\kos A\), \(\kos 2A = \kos^2 A - \sin^2 A = 2\kos^2 A - 1 = 1 - 2\sin^2 A\).</p>`,
    when: R`Nilai tepat seperti \(\sin 75^\circ\), dan ungkapan yang mengandungi \(2A\) atau \(A + B\).`,
    steps: [R`Kenal pasti rumus yang sesuai (majmuk atau berganda).`, R`Cari nisbah yang diperlukan, dengan tanda sukuan yang betul.`, R`Gantikan dan permudahkan.`],
    example: 1, visual: 0, mistake: 1,
  },
  '6.6': {
    lead: R`Selesaikan persamaan trigonometri dan masalah yang melibatkan fungsi trigonometri.`,
    idea: R`<p>Ubah persamaan kepada satu nisbah dalam satu sudut (guna identiti atau rumus berganda), kemudian faktorkan. <strong>Jangan bahagi</strong> dengan \(\sin x\) atau \(\kos x\): penyelesaian akan hilang.</p><p>Bagi setiap nilai nisbah, cari sudut rujukan dan semua sukuan yang sepadan dalam julat.</p>`,
    when: R`Persamaan seperti \(2\kos^2 x - \kos x - 1 = 0\) atau \(\sin 2x = \kos x\), dan model berkala (pasang surut, putaran).`,
    steps: [R`Guna identiti supaya hanya satu nisbah dan satu sudut.`, R`Faktorkan atau selesaikan kuadratik dalam nisbah itu.`, R`Bagi setiap nilai, cari sudut rujukan dan sukuan yang sesuai.`, R`Untuk \(2x\), lanjutkan julat kepada \(0^\circ\)–\(720^\circ\) dahulu, kemudian bahagi 2.`],
    example: 1, visual: 0, mistake: 0,
  },
};

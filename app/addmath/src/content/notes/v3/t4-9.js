// V3 layer for T4 Bab 9 Penyelesaian Segi Tiga. Original wording.
const R = String.raw;
export const V3 = {
  '9.1': {
    lead: R`Guna petua sinus untuk segi tiga tidak bersudut tegak, termasuk kes berambiguiti.`,
    idea: R`<p>Dalam sebarang segi tiga, nisbah setiap sisi kepada sinus sudut bertentangannya adalah sama. Petua ini memerlukan <strong>satu pasangan lengkap</strong>: satu sisi bersama sudut yang bertentangan dengannya.</p><p>Jika diberi dua sisi dan sudut bukan kandung, mungkin ada dua segi tiga (kes berambiguiti), kerana \(\sin\theta = \sin(180^\circ - \theta)\).</p>`,
    when: R`Diberi dua sudut dan satu sisi, atau dua sisi dan satu sudut bukan kandung.`,
    steps: [R`Lakar dan labelkan; sisi \(a\) bertentangan dengan sudut \(A\), dan seterusnya.`, R`Jika dua sudut diberi, cari sudut ketiga dengan \(180^\circ\).`, R`Guna \(\tfrac{a}{\sin A} = \tfrac{b}{\sin B}\) untuk sisi, atau bentuk terbalik untuk sudut.`, R`Bila mencari sudut, uji juga \(180^\circ - \theta\).`],
    example: 1, visual: 1, mistake: 1,
  },
  '9.2': {
    lead: R`Guna petua kosinus apabila diberi tiga sisi, atau dua sisi dan sudut kandung.`,
    idea: R`<p>Petua kosinus ialah "Pythagoras yang diperluas": \(a^2 = b^2 + c^2 - 2bc\kos A\). Jika \(A = 90^\circ\), sebutan terakhir hilang dan menjadi Pythagoras.</p><p>Tanda \(\kos A\) terus memberitahu sama ada sudut itu tirus atau cakah, jadi tiada kekeliruan dua jawapan.</p>`,
    when: R`Diberi dua sisi dan sudut di antaranya, atau ketiga-tiga sisi.`,
    steps: [R`Kenal pasti sudut kandung dan sisi bertentangan dengannya.`, R`Mencari sisi: \(a^2 = b^2 + c^2 - 2bc\kos A\).`, R`Mencari sudut: \(\kos A = \tfrac{b^2 + c^2 - a^2}{2bc}\); cari sudut terbesar dahulu.`],
    example: 0, visual: 0, mistake: 0,
  },
  '9.3': {
    lead: R`Cari luas segi tiga dengan \(\tfrac12 ab\sin C\) atau rumus Heron.`,
    idea: R`<p>Luas segi tiga boleh dikira tanpa tinggi: \(\tfrac12 ab\sin C\), dengan \(C\) sudut <strong>di antara</strong> sisi \(a\) dan \(b\).</p><p>Jika hanya tiga sisi diketahui, guna rumus Heron dengan separuh perimeter \(s\).</p>`,
    when: R`Untuk luas tanah atau bentuk segi tiga apabila tinggi tidak diberi.`,
    steps: [R`Dua sisi + sudut kandung: \(\tfrac12 ab\sin C\).`, R`Tiga sisi: \(s = \tfrac{a + b + c}{2}\), luas \(= \sqrt{s(s - a)(s - b)(s - c)}\).`, R`Diberi luas, cari sudut: \(\sin C = \tfrac{2L}{ab}\), dan ingat dua kemungkinan \(C\) dan \(180^\circ - C\).`],
    example: 0, visual: 0, mistake: 0,
  },
  '9.4': {
    lead: R`Selesaikan masalah segi tiga dalam situasi sebenar dan bentuk tiga dimensi.`,
    idea: R`<p>Dalam bentuk 3D, cari segi tiga yang mengandungi kuantiti yang dicari, lukis semula secara rata, kemudian pilih alat yang sesuai. Sisi yang tiada selalunya datang daripada segi tiga tegak di tapak.</p><p>Sudut antara garis dan satah diukur dengan <strong>unjuran</strong> garis itu pada satah.</p>`,
    when: R`Untuk kuboid, piramid, khemah, bumbung dan masalah navigasi yang melibatkan beberapa segi tiga.`,
    steps: [R`Kenal pasti segi tiga yang betul; lukis semula secara rata.`, R`Cari sisi yang tiada daripada segi tiga tegak (Pythagoras/trigonometri).`, R`Pilih petua sinus, petua kosinus atau rumus luas mengikut maklumat.`],
    example: 0, visual: 0, mistake: 1,
  },
};

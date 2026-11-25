// V3 layer for T5 Bab 3 Pengamiran. Original wording.
const R = String.raw;
export const V3 = {
  '3.1': {
    lead: R`Fahami pengamiran sebagai songsangan pembezaan.`,
    idea: R`<p>Jika \(\tfrac{d}{dx}F(x) = f(x)\), maka \(\int f(x)\,dx = F(x) + c\). Pengamiran membalikkan pembezaan.</p><p>Pemalar \(c\) perlu kerana pemalar hilang apabila dibezakan: \(x^2\), \(x^2 + 7\) dan \(x^2 - 1\) semuanya mempunyai terbitan \(2x\).</p>`,
    when: R`Apabila soalan memberi hasil pembezaan dan meminta kamiran fungsi yang berkaitan ("seterusnya, cari…").`,
    steps: [R`Kenal pasti terbitan yang diberi: \(\tfrac{d}{dx}F(x) = f(x)\).`, R`Padankan kamiran yang diminta dengan \(f(x)\); keluarkan pemalar darab jika ada.`, R`Tulis \(F(x) + c\) (darab dengan pemalar itu).`],
    example: 1, visual: 0, mistake: 0,
  },
  '3.2': {
    lead: R`Cari kamiran tak tentu bagi \(ax^n\) dan \((ax + b)^n\), dan persamaan lengkung daripada fungsi kecerunan.`,
    idea: R`<p>\(\int ax^n\,dx = \tfrac{ax^{n + 1}}{n + 1} + c\) bagi \(n \ne -1\): tambah satu kepada kuasa, bahagi dengan kuasa baharu.</p><p>\(\int (ax + b)^n\,dx = \tfrac{(ax + b)^{n + 1}}{a(n + 1)} + c\). Diberi satu titik pada lengkung, gantikan untuk mencari \(c\).</p>`,
    when: R`Apabila fungsi kecerunan diberi dan fungsi asal diminta.`,
    steps: [R`Tulis semula setiap sebutan sebagai \(ax^n\) (kembangkan hasil darab dahulu).`, R`Amir sebutan demi sebutan; untuk \((ax + b)^n\), bahagi juga dengan \(a\).`, R`Tambah \(+ c\).`, R`Jika titik diberi, gantikan untuk mencari \(c\).`],
    example: 2, visual: 0, mistake: 0,
  },
  '3.3': {
    lead: R`Nilaikan kamiran tentu dan gunakannya untuk luas rantau dan isi padu janaan.`,
    idea: R`<p>\(\int_a^b f(x)\,dx = F(b) - F(a)\). Ia ialah had hasil tambah jalur nipis, iaitu luas bertanda di bawah lengkung.</p><p>Luas di bawah paksi-\(x\) memberi nilai negatif, jadi ambil nilai mutlak. Isi padu kisaran pada paksi-\(x\): \(\pi\int_a^b y^2\,dx\); pada paksi-\(y\): \(\pi\int_a^b x^2\,dy\).</p>`,
    when: R`Luas rantau yang dibatasi lengkung dan garis, dan isi padu bentuk yang terhasil daripada kisaran.`,
    steps: [R`Lakar rantau; cari titik persilangan sebagai had.`, R`Tentukan lengkung mana di atas (atau kisaran pada paksi mana).`, R`Tulis kamiran: luas \(\int (\text{atas} - \text{bawah})\), isi padu \(\pi\int y^2\,dx\) atau \(\pi\int x^2\,dy\).`, R`Amir, gantikan had, tolak: \(F(b) - F(a)\).`, R`Semak tanda dan unit.`],
    example: 3, visual: 0, mistake: 0,
  },
  '3.4': {
    lead: R`Gunakan pengamiran untuk menyelesaikan masalah sebenar.`,
    idea: R`<p>Jika suatu kadar diberi (liter per minit, meter per saat, kecerunan), jumlah perubahan ialah kamiran kadar itu. Luas di bawah graf kadar memberi jumlah.</p><p>Bentuk bekas yang dikisar memberi isi padu melalui \(\pi\int y^2\,dx\) atau \(\pi\int x^2\,dy\).</p>`,
    when: R`Jumlah air, jarak atau kos daripada kadar; kapasiti mangkuk atau bekas; profil daripada kecerunan.`,
    steps: [R`Kenal pasti kadar atau fungsi kecerunan yang diberi, dengan unit.`, R`Tentukan had (masa mula dan akhir, atau ketinggian).`, R`Amir dan nilaikan; gunakan syarat awal untuk \(c\) jika kamiran tak tentu.`, R`Tafsir jawapan dalam konteks dengan unit.`],
    example: 0, visual: 0, mistake: 0,
  },
};

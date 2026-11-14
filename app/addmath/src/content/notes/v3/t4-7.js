// V3 layer for T4 Bab 7 Geometri Koordinat. Original wording.
const R = String.raw;
export const V3 = {
  '7.1': {
    lead: R`Cari titik yang membahagi tembereng garis mengikut nisbah \(m : n\).`,
    idea: R`<p>Titik \(P\) yang membahagi \(AB\) dengan nisbah \(m : n\) berada \(\tfrac{m}{m + n}\) daripada perjalanan dari \(A\) ke \(B\). Rumus pembahagi tembereng memberi koordinatnya terus.</p><p>Titik tengah ialah kes khas \(1 : 1\).</p>`,
    when: R`Apabila titik terletak di sepanjang garis antara dua titik dengan nisbah jarak tertentu, contohnya injap pada paip.`,
    steps: [R`Kenal pasti \(A(x_1, y_1)\), \(B(x_2, y_2)\) dan nisbah \(AP : PB = m : n\).`, R`Guna \(P = \left(\tfrac{nx_1 + mx_2}{m + n}, \tfrac{ny_1 + my_2}{m + n}\right)\): \(m\) dipasangkan dengan \(B\), \(n\) dengan \(A\).`, R`Untuk mencari nisbah, bandingkan jarak mendatar (atau menegak) \(AP\) dan \(PB\).`],
    example: 1, visual: 0, mistake: 0,
  },
  '7.2': {
    lead: R`Guna kecerunan untuk mengenal pasti garis selari dan serenjang, dan cari persamaannya.`,
    idea: R`<p>Garis <strong>selari</strong> mempunyai kecerunan yang sama: \(m_1 = m_2\). Garis <strong>serenjang</strong> mempunyai hasil darab kecerunan \(-1\): \(m_1 m_2 = -1\), iaitu kecerunan salingan negatif.</p><p>Tulis persamaan dalam bentuk \(y = mx + c\) dahulu untuk membaca kecerunan.</p>`,
    when: R`Untuk garis melalui satu titik yang selari atau serenjang dengan garis lain, pembahagi dua sama serenjang, dan jarak terdekat ke garis.`,
    steps: [R`Tukar setiap persamaan kepada \(y = mx + c\) dan baca \(m\).`, R`Selari: guna \(m\) yang sama; serenjang: guna \(-\tfrac{1}{m}\).`, R`Bentuk persamaan dengan \(y - y_1 = m(x - x_1)\).`],
    example: 2, visual: 0, mistake: 0,
  },
  '7.3': {
    lead: R`Cari luas segi tiga dan poligon daripada koordinat bucunya.`,
    idea: R`<p>Luas poligon boleh dikira terus daripada koordinat bucu dengan rumus "darab silang". Bucu mesti disenaraikan <strong>mengikut urutan</strong> di sekeliling poligon, dan bucu pertama diulang di hujung.</p><p>Ambil nilai mutlak; jika luas sifar, titik-titik itu segaris.</p>`,
    when: R`Untuk luas segi tiga atau sisi empat dalam satah Cartes, menguji titik segaris, atau mencari koordinat apabila luas diberi.`,
    steps: [R`Susun bucu mengikut urutan (ikut atau lawan arah jam), ulang bucu pertama di hujung.`, R`Darab silang: jumlah \(x_1y_2 + x_2y_3 + \dots\) tolak jumlah \(y_1x_2 + y_2x_3 + \dots\).`, R`Luas \(= \tfrac12 |\text{beza}|\).`],
    example: 1, visual: 0, mistake: 0,
  },
  '7.4': {
    lead: R`Bina persamaan lokus bagi titik yang memenuhi syarat jarak.`,
    idea: R`<p>Lokus ialah laluan semua titik \(P(x, y)\) yang memenuhi sesuatu syarat. Tulis syarat itu menggunakan rumus jarak, kemudian kuasa duakan untuk menghapuskan punca kuasa dua.</p><p>Jarak tetap dari satu titik memberi bulatan; sama jarak dari dua titik memberi pembahagi dua sama serenjang.</p>`,
    when: R`Apabila soalan menerangkan pergerakan titik dengan syarat jarak, contohnya kambing yang ditambat.`,
    steps: [R`Biarkan \(P(x, y)\) dan tulis syarat, contohnya \(PA = 2PB\).`, R`Guna rumus jarak bagi setiap jarak.`, R`Kuasa duakan kedua-dua belah (seluruh sebelah, termasuk pekali).`, R`Kembangkan dan permudahkan kepada persamaan lokus.`],
    example: 1, visual: 0, mistake: 0,
  },
};

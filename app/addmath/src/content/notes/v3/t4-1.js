// V3 layer for T4 Bab 1 Fungsi. Original wording. Indices point into the
// subtopic's examples / visual sections / mistakes (validated).
const R = String.raw;
export const V3 = {
  '1.1': {
    lead: R`Kenal pasti fungsi, guna tatatanda \(f(x)\), dan cari imej, objek, domain serta julat.`,
    idea: R`<p>Fungsi ialah hubungan yang memberi <strong>tepat satu imej</strong> kepada setiap objek. Objek ialah input \(x\); imej ialah output \(f(x)\).</p><p>Domain ialah set objek, kodomain ialah set yang mungkin bagi imej, dan julat ialah imej yang benar-benar terhasil. Fungsi mungkin tidak tertakrif pada nilai tertentu (contohnya bahagi dengan sifar).</p>`,
    when: R`Apabila satu kuantiti ditentukan sepenuhnya oleh kuantiti lain, contohnya harga mengikut berat.`,
    steps: [R`Cari imej: gantikan objek ke dalam \(f(x)\) dan kira.`, R`Cari objek: tulis \(f(x) = \) imej, kemudian selesaikan persamaan untuk \(x\).`, R`Untuk nilai mutlak \(|u| = k\): selesaikan \(u = k\) <em>dan</em> \(u = -k\).`, R`Graf ialah fungsi jika setiap garis mencancang memotongnya paling banyak sekali.`],
    example: 1, visual: 0, mistake: 0,
  },
  '1.2': {
    lead: R`Gabungkan dua fungsi menjadi \(fg(x)\), cari fungsi yang tidak diketahui, dan kira \(f^n(x)\).`,
    idea: R`<p>Fungsi gubahan \(fg\) bermaksud "buat \(g\) dahulu, kemudian \(f\)": \(fg(x) = f\big(g(x)\big)\). Tertib penting, jadi biasanya \(fg \ne gf\).</p><p>\(f^2(x) = ff(x)\) ialah \(f\) dilakukan dua kali, bukan \([f(x)]^2\).</p>`,
    when: R`Apabila output satu proses menjadi input proses seterusnya.`,
    steps: [R`Kenal pasti fungsi dalam (dibuat dahulu) dan fungsi luar.`, R`Gantikan <em>seluruh</em> ungkapan fungsi dalam ke tempat \(x\) dalam fungsi luar, dengan kurungan.`, R`Kembangkan dan permudahkan.`, R`Jika satu fungsi tidak diketahui: tulis gubahan menggunakan fungsi yang diketahui, kemudian samakan dengan ungkapan yang diberi.`],
    example: 1, visual: 0, mistake: 0,
  },
  '1.3': {
    lead: R`Fahami fungsi songsang \(f^{-1}\), bila ia wujud, dan cara mencarinya.`,
    idea: R`<p>Fungsi songsang \(f^{-1}\) "membatalkan" \(f\): jika \(f(a) = b\), maka \(f^{-1}(b) = a\). Hanya fungsi <strong>satu dengan satu</strong> mempunyai songsang (lulus ujian garis mengufuk).</p><p>Graf \(f^{-1}\) ialah pantulan graf \(f\) pada garis \(y = x\), dan domain \(f^{-1}\) ialah julat \(f\).</p>`,
    when: R`Apabila diberi output dan perlu mencari input, contohnya menukar suhu °F kembali ke °C.`,
    steps: [R`Tulis \(y = f(x)\).`, R`Jadikan \(x\) perkara rumus.`, R`Tukar \(x\) dan \(y\): ungkapan baharu ialah \(f^{-1}(x)\).`, R`Semak: \(ff^{-1}(x) = x\); nyatakan nilai yang dikecualikan.`],
    example: 1, visual: 1, mistake: 0,
  },
};

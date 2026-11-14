// V3 layer for T4 Bab 6 Hukum Linear. Original wording.
const R = String.raw;
export const V3 = {
  '6.1': {
    lead: R`Bezakan hubungan linear dan tak linear, lukis garis penyuaian terbaik dan buat ramalan.`,
    idea: R`<p>Data mempunyai hubungan linear jika titik-titiknya hampir membentuk garis lurus. <strong>Garis penyuaian terbaik</strong> dilukis supaya titik-titik tertabur seimbang di kedua-dua sisinya; ia tidak semestinya melalui mana-mana titik data.</p><p>Persamaan garis \(y = mx + c\) membolehkan kita meramal nilai di dalam julat data.</p>`,
    when: R`Apabila data eksperimen atau tinjauan menunjukkan corak garis lurus dan kita mahu persamaan atau ramalan.`,
    steps: [R`Plot data dan semak sama ada titik hampir segaris.`, R`Lukis garis penyuaian terbaik (titik seimbang di atas dan bawah).`, R`Pilih dua titik yang jauh <em>pada garis</em> untuk kecerunan \(m\); baca pintasan \(c\).`, R`Tulis \(y = mx + c\) dan guna untuk ramalan dalam julat data.`],
    example: 1, visual: 0, mistake: 0,
  },
  '6.2': {
    lead: R`Tukar hubungan tak linear kepada bentuk linear \(Y = mX + c\) untuk mencari pemalar.`,
    idea: R`<p>Lengkung sukar dibaca, tetapi garis lurus mudah. Dengan menukar pemboleh ubah (contohnya plot \(\lg y\) melawan \(x\)), hubungan tak linear menjadi bentuk \(Y = mX + c\).</p><p>Kecerunan dan pintasan garis itu kemudian memberi pemalar dalam persamaan asal.</p>`,
    when: R`Apabila hubungan berbentuk \(y = ab^x\), \(y = ax^n\), \(y = \tfrac ax + b\) dan seumpamanya, dan pemalar perlu dicari daripada graf.`,
    steps: [R`Susun semula persamaan (ambil \(\lg\) atau bahagi) supaya sepadan dengan \(Y = mX + c\).`, R`Kenal pasti \(Y\), \(X\), \(m\) dan \(c\) dalam sebutan pemalar asal.`, R`Cari \(m\) dan \(c\) daripada graf atau dua titik.`, R`Selesaikan untuk pemalar asal (contohnya \(a = 10^c\)).`],
    example: 0, visual: 0, mistake: 0,
  },
  '6.3': {
    lead: R`Guna hukum linear pada data sebenar untuk mencari pemalar dan membuat ramalan.`,
    idea: R`<p>Dalam eksperimen, kita tidak tahu pemalar seperti \(k\) dan \(n\) dalam \(T = kL^n\). Tukar data kepada bentuk linear, lukis garis penyuaian terbaik, dan baca pemalar daripada kecerunan dan pintasan.</p>`,
    when: R`Apabila diberi jadual data eksperimen dan model yang dicadangkan, contohnya tempoh bandul atau pertumbuhan bakteria.`,
    steps: [R`Bina jadual baharu bagi \(X\) dan \(Y\) (contohnya \(\lg L\), \(\lg T\)) dengan sekurang-kurangnya 2 tempat perpuluhan.`, R`Plot \(Y\) melawan \(X\) dan lukis garis penyuaian terbaik.`, R`Kecerunan dan pintasan memberi pemalar; tukar balik (contohnya \(k = 10^c\)).`, R`Guna persamaan untuk ramalan dalam julat data.`],
    example: 0, visual: 0, mistake: 0,
  },
};

import { mappingRows, chipSet } from '../utils/diagramKit.js';

// Bab 1 - Fungsi (Tingkatan 4). Running example used throughout: f(x) = 2x + 1.
// Each lesson focuses on exactly one idea (see objective) and stays on one
// screen: diagram/equation on the left, explanation on the right.
//
// Shape of a lesson:
//   id, title, objective
//   diagramHtml       - left panel markup
//   defaultExplainHtml - right panel content shown first
//   explainMap         - { 'data-part value': htmlToShowOnClick }
//   tabs (optional)     - { maksud, contoh, jalanKerja } alternate explanations
//   hasBasicHelp        - show the "Lupa asas? y = mx + c" link
//   misconceptions      - short list shown under the explanation
//   compute (optional)  - (rawValue) => html, used by the live numeric input
//   computeDefault      - default value for the numeric input

export const CHAPTER1_LESSONS = [
  {
    id: 1,
    title: 'Apa itu fungsi',
    objective: 'Setiap input mempunyai tepat satu output.',
    diagramHtml: `
      <div class="diagram-toggle" role="group" aria-label="Pilih contoh">
        <button type="button" class="toggle-btn is-active" data-toggle="valid">Contoh sah</button>
        <button type="button" class="toggle-btn" data-toggle="invalid">Bukan fungsi</button>
      </div>
      <div class="diagram-variant" data-variant="valid">
        ${mappingRows([[1, 2], [2, 4], [3, 6]])}
      </div>
      <div class="diagram-variant" data-variant="invalid" hidden>
        <div class="mapping-rows">
          <div class="mapping-row">
            <span class="chip chip-in">1</span>
            <span class="mapping-arrow" aria-hidden="true">&rarr;</span>
            <span class="chip chip-out">2</span>
          </div>
          <div class="mapping-row">
            <span class="chip chip-in">1</span>
            <span class="mapping-arrow" aria-hidden="true">&rarr;</span>
            <span class="chip chip-out">5</span>
          </div>
        </div>
      </div>
    `,
    defaultExplainHtml: `<p>Klik satu contoh di sebelah kiri untuk lihat sebabnya.</p>`,
    explainMap: {
      valid: `<p><strong>Ini fungsi.</strong> Input 1, 2 dan 3 masing-masing mempunyai tepat satu output (2, 4 dan 6).</p>`,
      invalid: `<p><strong>Ini BUKAN fungsi.</strong> Input 1 menghasilkan dua output berbeza, iaitu 2 dan 5. Satu input tidak boleh mempunyai dua output.</p>`,
    },
    tabs: {
      maksud: `<p>Fungsi ialah hubungan di mana <strong>setiap input mempunyai tepat satu output</strong>. Input berbeza boleh menghasilkan output yang sama &mdash; itu masih sah.</p>`,
      contoh: `<p><strong>Contoh harian:</strong> Sebuah kedai mengenakan RM2 setiap foto dicetak, ditambah caj tetap RM1 setiap pesanan. Jika <em>x</em> = bilangan foto, jumlah bayaran f(x) = 2x + 1.</p>
        <p>Setiap pesanan dengan bilangan foto yang sama akan membayar jumlah yang sama &mdash; tidak mungkin dua jumlah berbeza untuk bilangan foto yang sama.</p>`,
    },
    hasBasicHelp: false,
    misconceptions: [
      'Input berbeza BOLEH menghasilkan output yang sama &mdash; itu masih sah.',
      'Satu input TIDAK BOLEH menghasilkan dua output yang berbeza.',
    ],
  },

  {
    id: 2,
    title: 'Maksud f, x dan f(x)',
    objective: 'Kenal bahagian f, x dan f(x) dalam f(x) = 2x + 1.',
    diagramHtml: `
      <div class="eq-big">
        <span class="eq-part" data-part="f" tabindex="0" role="button">f</span><span class="eq-op">(</span><span class="eq-part" data-part="x" tabindex="0" role="button">x</span><span class="eq-op">)</span>
        <span class="eq-op">=</span>
        <span class="eq-part" data-part="rule" tabindex="0" role="button">2x + 1</span>
      </div>
      <button type="button" class="fx-whole" data-part="fx">Apa maksud f(x) secara keseluruhan?</button>
    `,
    defaultExplainHtml: `<p>Klik <strong>f</strong>, <strong>x</strong>, atau <strong>2x + 1</strong> untuk lihat maksud setiap bahagian.</p>`,
    explainMap: {
      f: `<p><strong>f</strong> ialah nama fungsi ini &mdash; seperti nama bagi satu peraturan pengiraan.</p>`,
      x: `<p><strong>x</strong> ialah input &mdash; nombor yang kita masukkan ke dalam fungsi.</p>`,
      rule: `<p><strong>2x + 1</strong> ialah peraturan fungsi: darab input dengan 2, kemudian tambah 1.</p>`,
      fx: `<p><strong>f(x)</strong> ialah output &mdash; nilai yang terhasil selepas peraturan itu digunakan pada x.</p>
        <p>f(x) <strong>bukan</strong> f didarab dengan x. "f(x)" dibaca sebagai "f daripada x".</p>`,
    },
    hasBasicHelp: true,
    misconceptions: ['f(x) bukan f &times; x.', 'f ialah nama fungsi, bukan satu nombor.'],
  },

  {
    id: 3,
    title: 'Mengira nilai fungsi',
    objective: 'Kira f(x) dengan menggantikan nilai x.',
    diagramHtml: `
      <div class="eq-big eq-static">f(x) = 2x + 1</div>
      <label class="compute-label" for="compute-x">Pilih nilai x</label>
      <input id="compute-x" class="compute-input" type="number" step="1" value="3" data-role="compute-input" />
      <div class="compute-result" data-role="compute-result" aria-live="polite"></div>
    `,
    defaultExplainHtml: `<p>Tukar nilai x di sebelah kiri. Langkah penggantian akan dikemas kini serta-merta.</p>`,
    explainMap: {},
    hasBasicHelp: true,
    misconceptions: [
      'Gantikan nilai x dahulu, sebelum mendarab dan menambah.',
      'Ikut tertib operasi: darab dahulu, kemudian tambah.',
    ],
    computeDefault: 3,
    compute(raw) {
      const x = Number(raw);
      if (raw === '' || Number.isNaN(x)) {
        return `<p class="compute-error">Masukkan nombor yang sah.</p>`;
      }
      const result = 2 * x + 1;
      return `
        <p class="compute-step">f(${x}) = 2(${x}) + 1</p>
        <p class="compute-step">f(${x}) = ${2 * x} + 1</p>
        <p class="compute-step compute-final">f(${x}) = ${result}</p>
      `;
    },
  },

  {
    id: 4,
    title: 'Domain',
    objective: 'Domain ialah set semua input yang dibenarkan.',
    diagramHtml: `
      ${mappingRows([[1, 2], [2, 4], [3, 6]])}
      <div class="chip-sets">
        ${chipSet('Domain', [1, 2, 3], 'domain')}
      </div>
    `,
    defaultExplainHtml: `<p>Klik set "Domain" di sebelah kiri.</p>`,
    explainMap: {
      domain: `<p><strong>Domain</strong> ialah set SEMUA input yang dibenarkan masuk ke dalam fungsi. Di sini, domain = {1, 2, 3}.</p>`,
    },
    hasBasicHelp: true,
    misconceptions: [
      'Domain ialah set INPUT, bukan output.',
      'Dalam contoh bilangan foto, x = 0 tidak boleh dianggap sebagai satu pesanan sebenar &mdash; nyatakan domain yang munasabah mengikut konteks.',
    ],
  },

  {
    id: 5,
    title: 'Kodomain dan julat',
    objective: 'Bezakan kodomain (set sasaran) dengan julat (output sebenar).',
    diagramHtml: `
      ${mappingRows([[1, 3], [2, 5], [3, 7]])}
      <div class="chip-sets">
        ${chipSet('Kodomain', [3, 5, 7, 9, 11], 'codomain')}
        ${chipSet('Julat', [3, 5, 7], 'range')}
      </div>
    `,
    defaultExplainHtml: `<p>Klik "Kodomain" atau "Julat" untuk lihat perbezaannya.</p>`,
    explainMap: {
      codomain: `<p><strong>Kodomain</strong> ialah set SASARAN yang kita tetapkan terlebih dahulu. Ia boleh mengandungi nilai yang tidak pernah terhasil, seperti 9 dan 11 di sini.</p>`,
      range: `<p><strong>Julat</strong> ialah set nilai OUTPUT SEBENAR yang terhasil daripada domain. Julat sentiasa subset (sebahagian) daripada kodomain.</p>`,
    },
    hasBasicHelp: false,
    misconceptions: [
      'Julat tidak semestinya sama dengan kodomain.',
      'Julat hanya mengandungi nilai yang betul-betul terhasil.',
    ],
  },

  {
    id: 6,
    title: 'Fungsi melalui pemetaan',
    objective: 'Kenal pasti sama ada satu pemetaan ialah fungsi.',
    diagramHtml: `
      <div class="diagram-toggle" role="group" aria-label="Pilih jenis pemetaan">
        <button type="button" class="toggle-btn is-active" data-toggle="a">A</button>
        <button type="button" class="toggle-btn" data-toggle="b">B</button>
        <button type="button" class="toggle-btn" data-toggle="c">C</button>
        <button type="button" class="toggle-btn" data-toggle="d">D</button>
      </div>
      <div class="diagram-variant" data-variant="a">
        <p class="variant-caption">Satu-satu</p>
        ${mappingRows([[1, 2], [2, 4], [3, 6]])}
      </div>
      <div class="diagram-variant" data-variant="b" hidden>
        <p class="variant-caption">Banyak-satu</p>
        ${mappingRows([[1, 5], [2, 5], [3, 9]])}
      </div>
      <div class="diagram-variant" data-variant="c" hidden>
        <p class="variant-caption">Satu-banyak</p>
        ${mappingRows([['1', '4'], ['1', '7'], ['2', '9']])}
      </div>
      <div class="diagram-variant" data-variant="d" hidden>
        <p class="variant-caption">Domain dinyatakan: {1, 2, 3}</p>
        ${mappingRows([[1, 4], [2, 6]])}
        <p class="variant-note">3 tidak mempunyai sebarang output.</p>
      </div>
    `,
    defaultExplainHtml: `<p>Klik A, B, C atau D untuk semak sama ada setiap pemetaan itu fungsi.</p>`,
    explainMap: {
      a: `<p><strong>A ialah fungsi</strong> (satu-satu). Setiap input mempunyai tepat satu output, dan setiap output datang daripada input berbeza.</p>`,
      b: `<p><strong>B tetap fungsi</strong> (banyak-satu). Beberapa input berkongsi output yang sama &mdash; ini dibenarkan.</p>`,
      c: `<p><strong>C BUKAN fungsi</strong> (satu-banyak). Input 1 menghasilkan dua output berbeza, iaitu 4 dan 7.</p>`,
      d: `<p><strong>D BUKAN fungsi</strong> pada domain {1, 2, 3} yang dinyatakan. Input 3 tidak mempunyai sebarang output.</p>`,
    },
    hasBasicHelp: false,
    misconceptions: ['Banyak-satu tetap fungsi.', 'Satu-banyak tidak pernah menjadi fungsi.'],
  },

  {
    id: 7,
    title: 'Fungsi gubahan',
    objective: 'fg(x) bermaksud f(g(x)) &mdash; output g menjadi input f.',
    diagramHtml: `
      <div class="eq-big eq-static">f(x) = 2x &nbsp;&nbsp; g(x) = x + 1</div>
      <button type="button" class="fx-whole" data-part="fg">Apa maksud fg(x)?</button>
      <label class="compute-label" for="compute-fg">Pilih nilai x</label>
      <input id="compute-fg" class="compute-input" type="number" step="1" value="3" data-role="compute-input" />
      <div class="compute-result" data-role="compute-result" aria-live="polite"></div>
    `,
    defaultExplainHtml: `<p>Tukar nilai x, atau klik butang untuk maksud fg(x).</p>`,
    explainMap: {
      fg: `<p><strong>fg(x)</strong> bermaksud <strong>f(g(x))</strong>. g digunakan DAHULU pada x, kemudian hasilnya menjadi input kepada f.</p>
        <p>fg(x) <strong>bukan</strong> f(x) &times; g(x).</p>`,
    },
    hasBasicHelp: false,
    misconceptions: ['fg(x) bukan f(x) &times; g(x).', 'g digunakan dahulu, bukan f.'],
    computeDefault: 3,
    compute(raw) {
      const x = Number(raw);
      if (raw === '' || Number.isNaN(x)) {
        return `<p class="compute-error">Masukkan nombor yang sah.</p>`;
      }
      const gx = x + 1;
      const fgx = 2 * gx;
      return `
        <p class="compute-step">g(${x}) = ${x} + 1 = ${gx}</p>
        <p class="compute-step">f(g(${x})) = f(${gx}) = 2(${gx}) = ${2 * gx}</p>
        <p class="compute-step compute-final">fg(${x}) = ${fgx}</p>
      `;
    },
  },

  {
    id: 8,
    title: 'Tertib gubahan',
    objective: 'fg(x) dan gf(x) biasanya memberi hasil berbeza.',
    diagramHtml: `
      <div class="eq-big eq-static">f(x) = 2x &nbsp;&nbsp; g(x) = x + 1</div>
      <div class="diagram-toggle" role="group" aria-label="Pilih tertib">
        <button type="button" class="toggle-btn is-active" data-toggle="fg">fg(x)</button>
        <button type="button" class="toggle-btn" data-toggle="gf">gf(x)</button>
      </div>
      <label class="compute-label" for="compute-order">Pilih nilai x</label>
      <input id="compute-order" class="compute-input" type="number" step="1" value="3" data-role="compute-input" />
      <div class="compute-result" data-role="compute-result" aria-live="polite" data-order="fg"></div>
    `,
    defaultExplainHtml: `<p>Bandingkan fg(x) dengan gf(x) menggunakan nilai x yang sama.</p>`,
    explainMap: {
      fg: `<p><strong>fg(x) = f(g(x)):</strong> g digunakan dahulu, kemudian f.</p>`,
      gf: `<p><strong>gf(x) = g(f(x)):</strong> f digunakan dahulu, kemudian g.</p>`,
    },
    hasBasicHelp: false,
    misconceptions: ['fg(x) secara umum TIDAK sama dengan gf(x).'],
    computeDefault: 3,
    computeOrder: {
      fg(x) {
        const gx = x + 1;
        const fgx = 2 * gx;
        return `
          <p class="compute-step">g(${x}) = ${x} + 1 = ${gx}</p>
          <p class="compute-step">f(g(${x})) = 2(${gx}) = ${fgx}</p>
          <p class="compute-step compute-final">fg(${x}) = ${fgx}</p>
        `;
      },
      gf(x) {
        const fx = 2 * x;
        const gfx = fx + 1;
        return `
          <p class="compute-step">f(${x}) = 2(${x}) = ${fx}</p>
          <p class="compute-step">g(f(${x})) = ${fx} + 1 = ${gfx}</p>
          <p class="compute-step compute-final">gf(${x}) = ${gfx}</p>
        `;
      },
    },
  },

  {
    id: 9,
    title: 'Fungsi songsang',
    objective: 'Cari f&#8315;&#185;(x) dengan menukar peranan x dan y.',
    diagramHtml: `
      <div class="inverse-steps">
        <p class="compute-step">Biar y = 2x + 1</p>
        <p class="compute-step">Tukar x dan y: x = 2y + 1</p>
        <p class="compute-step">Selesaikan untuk y: y = (x &minus; 1) &divide; 2</p>
        <p class="compute-step compute-final">f&#8315;&#185;(x) = (x &minus; 1) &divide; 2</p>
      </div>
      <label class="compute-label" for="compute-inverse">Uji dengan satu nilai (v)</label>
      <input id="compute-inverse" class="compute-input" type="number" step="1" value="3" data-role="compute-input" />
      <div class="compute-result" data-role="compute-result" aria-live="polite"></div>
    `,
    defaultExplainHtml: `<p>Masukkan satu nilai v. App akan tunjukkan f(v), kemudian gunakan f&#8315;&#185; ke atas hasil itu untuk kembali kepada v.</p>`,
    explainMap: {},
    tabs: {
      maksud: `<p>Fungsi songsang f&#8315;&#185; "membalikkan" hubungan f. Jika f(a) = b, maka f&#8315;&#185;(b) = a.</p>
        <p>f&#8315;&#185;(x) <strong>bukan</strong> 1/f(x).</p>`,
      jalanKerja: `<p>Langkah mencari f&#8315;&#185;: tulis y = f(x), tukar kedudukan x dan y, kemudian selesaikan semula untuk y.</p>`,
    },
    hasBasicHelp: false,
    misconceptions: [
      'f&#8315;&#185;(x) bukan 1/f(x).',
      'f&#8315;&#185; wujud dengan selamat hanya jika f satu-dengan-satu pada domain yang digunakan.',
    ],
    computeDefault: 3,
    compute(raw) {
      const v = Number(raw);
      if (raw === '' || Number.isNaN(v)) {
        return `<p class="compute-error">Masukkan nombor yang sah.</p>`;
      }
      const fv = 2 * v + 1;
      const backToV = (fv - 1) / 2;
      return `
        <p class="compute-step">f(${v}) = 2(${v}) + 1 = ${fv}</p>
        <p class="compute-step">f&#8315;&#185;(${fv}) = (${fv} &minus; 1) &divide; 2 = ${backToV}</p>
        <p class="compute-step compute-final">Kembali kepada v = ${backToV}</p>
      `;
    },
  },
];

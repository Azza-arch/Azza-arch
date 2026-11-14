// Bab 1 Fungsi — question bank (Tingkatan 4).
// Schema: see tests/validate-content.mjs (it enforces every field below).
//   given      structured data the validator re-solves independently
//   checker    which independent solver applies ('manual' = human review only)
//   options[]  text + correct + feedback + misconception, and optionally
//              derive: an expression the validator evaluates to confirm that the
//              distractor really is the result of the stated mistake
//   status     draft | review | published (owner approves → published)
//   provenance origin of the item; review: what has been checked, by whom
import { STATUS } from '../status.js';

const LEGACY = {
  origin: 'legacy',
  note: 'Wujud dalam app sebelum sistem bank soalan; ditulis asal untuk laman ini.',
};
const AUDIT = { mathReviewed: { by: 'Claude (audit Fasa A)', date: '2026-11-14' }, ownerApproved: null };

export const BAB1_QUESTIONS = [
  {
    id: 'b1-1.1-001', legacyId: 'p1', chapter: 't4-1', sk: '1.1', sp: ['1.1.1'], relatedLesson: 2,
    difficulty: 'mudah', type: 'mcq', checker: 'manual',
    prompt: 'Diberi f(x) = 2x + 1. Apakah maksud f(3)?',
    given: { rule: '2x+1', x: 3 },
    options: [
      { text: 'f didarab dengan 3', correct: false, misconception: 'notasi-sebagai-darab', feedback: 'f(3) bukan f &times; 3. "f(3)" bermaksud x digantikan dengan 3, bukan f didarab dengan 3.' },
      { text: 'Nilai x digantikan dengan 3', correct: true, feedback: 'Betul. f(3) bermaksud kita gantikan x dengan 3 ke dalam peraturan fungsi.' },
      { text: 'Jawapannya ialah 3', correct: false, misconception: 'objek-sebagai-imej', feedback: '3 ialah nilai input (x), bukan jawapan (output).' },
      { text: 'x mestilah 3 untuk semua fungsi', correct: false, misconception: 'nilai-x-tetap', feedback: 'x = 3 hanya untuk soalan ini. Fungsi f(x) = 2x + 1 boleh menerima pelbagai nilai x lain.' },
    ],
    solution: ['f(3) dibaca "f bagi 3": ia ialah imej apabila objek x = 3.', 'Gantikan x dengan 3 dalam peraturan: f(3) = 2(3) + 1 = 7.'],
    status: STATUS.PUBLISHED, provenance: LEGACY, review: AUDIT,
  },
  {
    id: 'b1-1.1-002', legacyId: 'p2', chapter: 't4-1', sk: '1.1', sp: ['1.1.3'], relatedLesson: 3,
    difficulty: 'mudah', type: 'mcq', checker: 'evaluate',
    prompt: 'Diberi f(x) = 3x &minus; 2. Berapakah f(4)?',
    given: { rule: '3x-2', x: 4 },
    options: [
      { text: '10', correct: true, feedback: 'Betul. f(4) = 3(4) &minus; 2 = 12 &minus; 2 = 10.' },
      { text: '9', correct: false, misconception: 'salah-aritmetik', feedback: 'Semak semula: 3(4) = 12, kemudian 12 &minus; 2 = 10, bukan 9 &mdash; cuba kira semula langkah demi langkah.' },
      { text: '14', correct: false, misconception: 'tanda-songsang', derive: '3*4+2', feedback: 'Ini akan betul jika tanda ialah tambah (3x + 2), tetapi peraturan di sini ialah tolak.' },
      { text: '6', correct: false, misconception: 'tertib-operasi', derive: '3*(4-2)', feedback: 'Ini terhasil jika 2 ditolak daripada 4 sebelum didarab: 3(4 &minus; 2) = 6. Darab dahulu, kemudian tolak.' },
    ],
    solution: ['Gantikan x = 4: f(4) = 3(4) &minus; 2.', 'Darab dahulu: 3(4) = 12.', 'Kemudian tolak: 12 &minus; 2 = 10.'],
    status: STATUS.PUBLISHED, provenance: { ...LEGACY, history: ['2026-11-14: jawapan disimpan sebagai "9" (salah); dibetulkan kepada 10.'] }, review: AUDIT,
  },
  {
    id: 'b1-1.1-003', legacyId: 'p3', chapter: 't4-1', sk: '1.1', sp: ['1.1.2'], relatedLesson: 4,
    difficulty: 'mudah', type: 'mcq', checker: 'domain-of-mapping',
    prompt: 'Satu pemetaan menghubungkan 1&rarr;2, 2&rarr;4 dan 3&rarr;6. Apakah domain pemetaan ini?',
    given: { mapping: [[1, 2], [2, 4], [3, 6]] },
    options: [
      { text: '{2, 4, 6}', correct: false, misconception: 'domain-julat-tertukar', feedback: '{2, 4, 6} ialah set OUTPUT (julat), bukan domain.' },
      { text: '{1, 2, 3}', correct: true, feedback: 'Betul. Domain ialah set INPUT, iaitu {1, 2, 3}.' },
      { text: '{1, 2, 3, 4, 6}', correct: false, misconception: 'gabung-input-output', feedback: 'Domain hanya mengandungi nilai INPUT, bukan input dan output digabungkan.' },
      { text: '{6}', correct: false, misconception: 'satu-nilai-sahaja', feedback: '6 hanyalah satu daripada output. Domain mengandungi SEMUA input, iaitu {1, 2, 3}.' },
    ],
    solution: ['Domain ialah set semua objek (input) yang dipetakan.', 'Objek dalam pemetaan ini ialah 1, 2 dan 3, jadi domain = {1, 2, 3}.'],
    status: STATUS.PUBLISHED, provenance: LEGACY, review: AUDIT,
  },
  {
    id: 'b1-1.1-004', legacyId: 'p4', chapter: 't4-1', sk: '1.1', sp: ['1.1.1'], relatedLesson: 6,
    difficulty: 'mudah', type: 'mcq', checker: 'is-function-mapping',
    prompt: 'Pemetaan manakah ialah fungsi?',
    given: {},
    options: [
      { text: '1 &rarr; 4, 1 &rarr; 7, 2 &rarr; 9', data: { domain: [1, 2], pairs: [[1, 4], [1, 7], [2, 9]] }, correct: false, misconception: 'satu-banyak', feedback: 'Input 1 mempunyai dua output (4 dan 7) &mdash; ini satu-banyak, bukan fungsi.' },
      { text: '1 &rarr; 5, 2 &rarr; 5, 3 &rarr; 9', data: { domain: [1, 2, 3], pairs: [[1, 5], [2, 5], [3, 9]] }, correct: true, feedback: 'Betul. Ini banyak-satu: 1 dan 2 berkongsi output 5. Itu masih dibenarkan untuk fungsi.' },
      { text: 'Domain {1, 2, 3} tetapi 3 tidak mempunyai output', data: { domain: [1, 2, 3], pairs: [[1, 4], [2, 6]] }, correct: false, misconception: 'objek-tanpa-imej', feedback: 'Setiap input dalam domain yang dinyatakan mesti mempunyai output. 3 tidak mempunyai output, jadi ini bukan fungsi.' },
      { text: '1 dan 2 kedua-duanya memetakan kepada 4 dan juga kepada 6', data: { domain: [1, 2], pairs: [[1, 4], [1, 6], [2, 4], [2, 6]] }, correct: false, misconception: 'banyak-banyak', feedback: 'Jika satu input memetakan kepada lebih daripada satu output, ini bukan fungsi.' },
    ],
    solution: ['Suatu hubungan ialah fungsi jika setiap objek dalam domain mempunyai tepat satu imej.', 'Hanya pilihan kedua memenuhi syarat ini: 1, 2 dan 3 masing-masing mempunyai satu imej (banyak-satu dibenarkan).'],
    status: STATUS.PUBLISHED, provenance: LEGACY, review: AUDIT,
  },
];

// Parameterised template (DRAFT — never shown publicly until approved).
// SP 1.1.3: image of a linear function f(x) = ax + b at an integer object.
// Distractors model real mistakes: sign of b flipped, b added before
// multiplying (a(x + b)), and multiplying only (ax).
export const BAB1_GENERATORS = [
  {
    id: 'b1-1.1-gen-image-linear', chapter: 't4-1', sk: '1.1', sp: ['1.1.3'], difficulty: 'mudah', type: 'mcq', checker: 'evaluate',
    status: STATUS.DRAFT, provenance: { origin: 'original', author: 'Claude', createdAt: '2026-11-14' }, review: { mathReviewed: null, ownerApproved: null },
    generate(rand) {
      const pick = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
      const a = pick(2, 9), b = pick(1, 9) * (rand() < 0.5 ? -1 : 1), x = pick(-5, 6);
      const rule = `${a}x${b < 0 ? '-' : '+'}${Math.abs(b)}`;
      const sign = b < 0 ? '&minus;' : '+';
      return {
        prompt: `Diberi f(x) = ${a}x ${sign} ${Math.abs(b)}. Berapakah f(${x})?`,
        given: { rule, x },
        options: [
          { text: String(a * x + b), correct: true, feedback: `Betul. f(${x}) = ${a}(${x}) ${sign} ${Math.abs(b)} = ${a * x + b}.` },
          { text: String(a * x - b), correct: false, misconception: 'tanda-songsang', derive: `${a}*${x}-(${b})`, feedback: 'Tanda pemalar telah diterbalikkan. Semak sama ada peraturan menambah atau menolak.' },
          { text: String(a * (x + b)), correct: false, misconception: 'tertib-operasi', derive: `${a}*(${x}+(${b}))`, feedback: 'Pemalar telah digabungkan dengan x sebelum didarab. Darab dahulu, kemudian tambah atau tolak.' },
          { text: String(a * x), correct: false, misconception: 'tertinggal-pemalar', derive: `${a}*${x}`, feedback: 'Pemalar dalam peraturan tertinggal. Selepas mendarab, masih perlu tambah atau tolak pemalar.' },
        ],
        solution: [`Gantikan x = ${x}: f(${x}) = ${a}(${x}) ${sign} ${Math.abs(b)}.`, `Darab dahulu: ${a}(${x}) = ${a * x}.`, `Kemudian ${b < 0 ? 'tolak' : 'tambah'}: ${a * x} ${sign} ${Math.abs(b)} = ${a * x + b}.`],
      };
    },
  },
];

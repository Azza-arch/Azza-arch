// Bab 1 (Fungsi) practice: one question at a time, one correct answer each,
// wrong options reflect plausible misunderstandings (not random noise).

export const CHAPTER1_PRACTICE = [
  {
    id: 'p1',
    relatedLesson: 2,
    prompt: 'Diberi f(x) = 2x + 1. Apakah maksud f(3)?',
    options: [
      'f didarab dengan 3',
      'Nilai x digantikan dengan 3',
      'Jawapannya ialah 3',
      'x mestilah 3 untuk semua fungsi',
    ],
    answer: 1,
    feedback: [
      'f(3) bukan f &times; 3. "f(3)" bermaksud x digantikan dengan 3, bukan f didarab dengan 3.',
      'Betul. f(3) bermaksud kita gantikan x dengan 3 ke dalam peraturan fungsi.',
      '3 ialah nilai input (x), bukan jawapan (output).',
      'x = 3 hanya untuk soalan ini. Fungsi f(x) = 2x + 1 boleh menerima pelbagai nilai x lain.',
    ],
  },
  {
    id: 'p2',
    relatedLesson: 3,
    prompt: 'Diberi f(x) = 3x &minus; 2. Berapakah f(4)?',
    options: ['10', '9', '14', '1'],
    answer: 1,
    feedback: [
      'Semak semula: 3(4) = 12, kemudian 12 &minus; 2 = 10, bukan 9 &mdash; cuba kira semula langkah demi langkah.',
      'Betul. f(4) = 3(4) &minus; 2 = 12 &minus; 2 = 10.',
      'Ini akan betul jika tanda ialah tambah (3x + 2), tetapi peraturan di sini ialah tolak.',
      'Ini terhasil jika 2 ditolak sebelum didarab dengan 3. Darab dahulu, kemudian tolak.',
    ],
  },
  {
    id: 'p3',
    relatedLesson: 4,
    prompt: 'Satu pemetaan menghubungkan 1&rarr;2, 2&rarr;4 dan 3&rarr;6. Apakah domain pemetaan ini?',
    options: ['{2, 4, 6}', '{1, 2, 3}', '{1, 2, 3, 4, 6}', '{6}'],
    answer: 1,
    feedback: [
      '{2, 4, 6} ialah set OUTPUT (julat), bukan domain.',
      'Betul. Domain ialah set INPUT, iaitu {1, 2, 3}.',
      'Domain hanya mengandungi nilai INPUT, bukan input dan output digabungkan.',
      '6 hanyalah satu daripada output. Domain mengandungi SEMUA input, iaitu {1, 2, 3}.',
    ],
  },
  {
    id: 'p4',
    relatedLesson: 6,
    prompt: 'Pemetaan manakah ialah fungsi?',
    options: [
      '1 &rarr; 4, 1 &rarr; 7, 2 &rarr; 9',
      '1 &rarr; 5, 2 &rarr; 5, 3 &rarr; 9',
      'Domain {1, 2, 3} tetapi 3 tidak mempunyai output',
      '1 dan 2 kedua-duanya memetakan kepada 4 dan juga kepada 6',
    ],
    answer: 1,
    feedback: [
      'Input 1 mempunyai dua output (4 dan 7) &mdash; ini satu-banyak, bukan fungsi.',
      'Betul. Ini banyak-satu: 1 dan 2 berkongsi output 5. Itu masih dibenarkan untuk fungsi.',
      'Setiap input dalam domain yang dinyatakan mesti mempunyai output. 3 tidak mempunyai output, jadi ini bukan fungsi.',
      'Jika satu input memetakan kepada lebih daripada satu output, ini bukan fungsi.',
    ],
  },
];

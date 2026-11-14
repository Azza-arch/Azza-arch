// Bab 1 Fungsi (Tingkatan 4, Teras, Algebra) — notes chapter file.
import { S1_1 } from './t4-1/s1-1.js';
import { S1_2 } from './t4-1/s1-2.js';
import { S1_3 } from './t4-1/s1-3.js';
import { QUESTIONS } from './t4-1/questions.js';

const R = String.raw;
export const CHAPTER = {
  id: 't4-1', status: 'published',
  intro: R`<p>Fungsi ialah "peraturan" yang memberi tepat satu output bagi setiap input. Dalam bab ini, anda akan belajar membaca dan menulis fungsi, mencari domain dan julat, menggabungkan dua fungsi (gubahan), dan membalikkan fungsi (songsang).</p>`,
  subtopics: [S1_1, S1_2, S1_3],
  questions: QUESTIONS,
  denai: { href: '/denai/', label: 'DENAI: Jejak Taman Fungsi' },
};

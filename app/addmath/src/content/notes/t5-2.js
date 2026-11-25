// T5 Bab 2 Pembezaan (Tingkatan 5, Teras, Kalkulus).
import { S2_1, S2_2, S2_3, S2_4 } from './t5-2/s2.js';
import { QUESTIONS } from './t5-2/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't5-2', status: 'published',
  intro: R`<p>Pembezaan mengukur <strong>kadar perubahan</strong>: kecerunan tangen, laju pada satu saat, betapa cepat isi padu belon bertambah. Bab ini bermula dengan idea had, membina petua pembezaan, kemudian menggunakannya untuk tangen, titik pusingan, pengoptimuman dan anggaran.</p>`,
  subtopics: [S2_1, S2_2, S2_3, S2_4],
  questions: QUESTIONS,
};

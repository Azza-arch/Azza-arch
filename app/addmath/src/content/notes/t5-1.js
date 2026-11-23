// T5 Bab 1 Sukatan Membulat (Tingkatan 5, Teras, Geometri).
import { S1_1, S1_2, S1_3, S1_4 } from './t5-1/s1.js';
import { QUESTIONS } from './t5-1/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't5-1', status: 'published',
  intro: R`<p>Bab ini memperkenalkan <strong>radian</strong>, unit sudut yang lahir daripada bulatan itu sendiri, dan menggunakannya untuk mengira panjang lengkok, luas sektor dan luas tembereng dalam situasi sebenar.</p>`,
  subtopics: [S1_1, S1_2, S1_3, S1_4],
  questions: QUESTIONS,
};

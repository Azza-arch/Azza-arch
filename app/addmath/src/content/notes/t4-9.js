// Bab 9 Penyelesaian Segi Tiga (Tingkatan 4, Elektif: Aplikasi Sains dan Teknologi).
import { S9_1, S9_2, S9_3, S9_4 } from './t4-9/s9.js';
import { QUESTIONS } from './t4-9/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't4-9', status: 'review',
  intro: R`<p>Bab elektif ini menyelesaikan segi tiga <strong>yang tidak bersudut tegak</strong>: petua sinus, petua kosinus dan rumus luas, kemudian menggunakannya dalam masalah sebenar dan bentuk tiga dimensi. Pastikan kalkulator dalam mod darjah (DEG).</p>`,
  subtopics: [S9_1, S9_2, S9_3, S9_4],
  questions: QUESTIONS,
};

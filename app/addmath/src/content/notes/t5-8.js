// T5 Bab 8 Kinematik Gerakan Linear (Tingkatan 5, Elektif: Aplikasi Sains dan Teknologi, Kalkulus).
import { S8_1, S8_2, S8_3, S8_4 } from './t5-8/s8.js';
import { QUESTIONS } from './t5-8/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't5-8', status: 'published',
  intro: R`<p>Bab ini menghuraikan gerakan zarah di atas garis lurus menggunakan <strong>sesaran</strong>, <strong>halaju</strong> dan <strong>pecutan</strong> sebagai fungsi masa, dan menghubungkan ketiga-tiganya dengan pembezaan dan pengamiran (Bab 2 dan Bab 3).</p>`,
  subtopics: [S8_1, S8_2, S8_3, S8_4],
  questions: QUESTIONS,
};

// Bab 3 Sistem Persamaan (Tingkatan 4, Teras, Algebra) — notes chapter file.
import { S3_1 } from './t4-3/s3-1.js';
import { S3_2 } from './t4-3/s3-2.js';
import { QUESTIONS } from './t4-3/questions.js';

const R = String.raw;
export const CHAPTER = {
  id: 't4-3', status: 'review',
  intro: R`<p>Banyak masalah sebenar mempunyai lebih daripada satu nilai yang tidak diketahui. Dalam bab ini, anda akan menyelesaikan tiga persamaan linear dengan tiga pemboleh ubah, dan pasangan persamaan yang satu linear dan satu lagi tak linear.</p>`,
  subtopics: [S3_1, S3_2],
  questions: QUESTIONS,
};

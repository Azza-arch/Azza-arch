// Bab 2 Fungsi Kuadratik (Tingkatan 4, Teras, Algebra) — notes chapter file.
import { S2_1 } from './t4-2/s2-1.js';
import { S2_2 } from './t4-2/s2-2.js';
import { S2_3 } from './t4-2/s2-3.js';
import { QUESTIONS } from './t4-2/questions.js';

const R = String.raw;
export const CHAPTER = {
  id: 't4-2', status: 'published',
  intro: R`<p>Fungsi kuadratik menghasilkan graf berbentuk parabola, seperti laluan bola atau lengkung air pancut. Bab ini mengajar cara menyelesaikan persamaan dan ketaksamaan kuadratik, membaca jenis punca daripada pembezalayan, dan menggunakan graf untuk mencari nilai maksimum atau minimum.</p>`,
  subtopics: [S2_1, S2_2, S2_3],
  questions: QUESTIONS,
};

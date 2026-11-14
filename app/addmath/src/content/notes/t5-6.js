// T5 Bab 6 Fungsi Trigonometri (Tingkatan 5, Teras, Trigonometri).
import { S6_1, S6_2, S6_3, S6_4, S6_5, S6_6 } from './t5-6/s6.js';
import { QUESTIONS } from './t5-6/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't5-6', status: 'review',
  intro: R`<p>Bab ini meluaskan trigonometri kepada <strong>sebarang sudut</strong>: sudut positif dan negatif, enam nisbah trigonometri, graf berkala, identiti, rumus sudut majmuk dan berganda, serta penyelesaian persamaan dan masalah.</p>`,
  subtopics: [S6_1, S6_2, S6_3, S6_4, S6_5, S6_6],
  questions: QUESTIONS,
};

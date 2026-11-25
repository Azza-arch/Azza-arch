// T5 Bab 5 Taburan Kebarangkalian (Tingkatan 5, Teras, Statistik).
import { S5_1, S5_2, S5_3 } from './t5-5/s5.js';
import { QUESTIONS } from './t5-5/questions.js';
const R = String.raw;
export const CHAPTER = {
  id: 't5-5', status: 'published',
  intro: R`<p>Bab ini memodelkan ketidakpastian dengan <strong>pemboleh ubah rawak</strong>: taburan diskret, <strong>taburan binomial</strong> untuk bilangan kejayaan, dan <strong>taburan normal</strong> untuk data selanjar seperti tinggi dan jisim. Sediakan Jadual Taburan Normal Piawai.</p>`,
  subtopics: [S5_1, S5_2, S5_3],
  questions: QUESTIONS,
};

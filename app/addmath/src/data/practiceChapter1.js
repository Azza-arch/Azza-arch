// Bab 1 (Fungsi) practice, served from the question bank. Only items whose
// status is 'published' reach pupils; draft / review items stay hidden.
// Adapter keeps the shape practiceScreen.js already expects.
import { BAB1_QUESTIONS } from '../content/questions/bab1.js';
import { isPublic } from '../content/status.js';

export const CHAPTER1_PRACTICE = BAB1_QUESTIONS.filter(isPublic).map((q) => ({
  id: q.legacyId || q.id,
  relatedLesson: q.relatedLesson,
  prompt: q.prompt,
  options: q.options.map((o) => o.text),
  answer: q.options.findIndex((o) => o.correct),
  feedback: q.options.map((o) => o.feedback),
}));

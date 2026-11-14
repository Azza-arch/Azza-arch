// Registry of chapter note modules (loaded on demand). Add a chapter here
// once its file exists; its own `status` decides who can see it.
export const NOTE_MODULES = {
  't4-1': () => import('./t4-1.js'),
  't4-2': () => import('./t4-2.js'),
  't4-3': () => import('./t4-3.js'),
  't4-4': () => import('./t4-4.js'),
  't4-5': () => import('./t4-5.js'),
  't4-6': () => import('./t4-6.js'),
  't4-7': () => import('./t4-7.js'),
  't4-8': () => import('./t4-8.js'),
  't4-9': () => import('./t4-9.js'),
  't4-10': () => import('./t4-10.js'),
  't5-1': () => import('./t5-1.js'),
  't5-2': () => import('./t5-2.js'),
  't5-3': () => import('./t5-3.js'),
  't5-4': () => import('./t5-4.js'),
  't5-5': () => import('./t5-5.js'),
  't5-6': () => import('./t5-6.js'),
};
// Highest status among a chapter's subtopics, for the catalogue map (kept in
// sync with the chapter files; tests/validate-content.mjs enforces it).
export const NOTE_STATUS = {
  't4-1': 'review',
  't4-2': 'review',
  't4-3': 'review',
  't4-4': 'review',
  't4-5': 'review',
  't4-6': 'review',
  't4-7': 'review',
  't4-8': 'review',
  't4-9': 'review',
  't4-10': 'review',
  't5-1': 'review',
  't5-2': 'review',
  't5-3': 'review',
  't5-4': 'review',
  't5-5': 'review',
  't5-6': 'review',
};

// V3 "student-first" layer: per-subtopic main idea, overview line, when-to-use,
// solution steps and which example / visual / mistake to show first. Kept apart
// from the verified content so V3 edits never touch questions or answers.
export const V3_MODULES = {
  't4-1': () => import('./v3/t4-1.js'),
  't4-2': () => import('./v3/t4-2.js'),
  't4-3': () => import('./v3/t4-3.js'),
  't4-4': () => import('./v3/t4-4.js'),
  't4-5': () => import('./v3/t4-5.js'),
  't4-6': () => import('./v3/t4-6.js'),
  't4-7': () => import('./v3/t4-7.js'),
  't4-8': () => import('./v3/t4-8.js'),
  't4-9': () => import('./v3/t4-9.js'),
  't4-10': () => import('./v3/t4-10.js'),
};
export async function attachV3(id, chapter) {
  const load = V3_MODULES[id];
  if (!load || !chapter) return chapter;
  const { V3 } = await load();
  for (const s of chapter.subtopics) if (V3[s.id]) s.v3 = V3[s.id];
  return chapter;
}

export async function loadChapterNotes(id) {
  const load = NOTE_MODULES[id];
  if (!load) return null;
  const mod = await load();
  return attachV3(id, mod.CHAPTER);
}

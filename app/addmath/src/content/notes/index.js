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
};

export async function loadChapterNotes(id) {
  const load = NOTE_MODULES[id];
  if (!load) return null;
  const mod = await load();
  return mod.CHAPTER;
}

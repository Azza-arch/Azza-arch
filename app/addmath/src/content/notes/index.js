// Registry of chapter note modules (loaded on demand). Add a chapter here
// once its file exists; its own `status` decides who can see it.
export const NOTE_MODULES = {
  't4-1': () => import('./t4-1.js'),
  't4-2': () => import('./t4-2.js'),
};
// Highest status among a chapter's subtopics, for the catalogue map (kept in
// sync with the chapter files; tests/validate-content.mjs enforces it).
export const NOTE_STATUS = {
  't4-1': 'review',
  't4-2': 'review',
};

export async function loadChapterNotes(id) {
  const load = NOTE_MODULES[id];
  if (!load) return null;
  const mod = await load();
  return mod.CHAPTER;
}

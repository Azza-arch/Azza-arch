// Content adapter — the ONLY hub module that imports the Add Math notes app.
// Everything is read-only reuse of verified content and helpers; if the notes
// app moves a file, only this adapter changes (and the smoke test catches it).
export { CURRICULUM, chapterById } from '/app/addmath/src/content/curriculum.js';
export { NOTE_STATUS, loadChapterNotes } from '/app/addmath/src/content/notes/index.js';
export { visibleStatus } from '/app/addmath/src/notes/preview.js';
export { renderMath, tex } from '/app/addmath/src/notes/math.js';
export { mountVisual } from '/app/addmath/src/notes/visuals.js';
export { v3Of, sectionsOf, itemsOf, answerHtml } from '/app/addmath/src/notes/v3.js';
export { checkSingle } from '/app/addmath/src/notes/practice.js';

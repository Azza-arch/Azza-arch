// Namespace bootstrap for the NEW (Phase 2+) grammar/data/gameplay system.
// Load this ONE script before any new-system file. Every new module
// attaches itself here (window.TenseTales.grammar.*, .data.*, .gameplay.*)
// instead of declaring bare globals or reusing an existing global name —
// this is what lets the new system and the legacy system
// (GrammarEngine, StoryData, SubjectData, Tenses, TenseLabels, ... from
// src/data/tenses.js, src/data/legacy-*.js, src/grammar/legacy-*.js)
// coexist on the same page without any redeclaration or overwrite.
//
// See MIGRATION.md for the full audit of what collided and why this
// approach (a single namespace object) was chosen over ES modules.
if (typeof window !== 'undefined') {
  window.TenseTales = window.TenseTales || { grammar: {}, data: {}, gameplay: {}, utils: {} };
  window.TenseTales.utils = window.TenseTales.utils || {};
}

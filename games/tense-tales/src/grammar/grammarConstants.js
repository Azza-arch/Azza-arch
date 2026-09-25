// Shared enums/constants for the Phase 2 grammar engine. Pure data, no
// Phaser, no DOM. V1 scope only: Present Simple, Past Simple, Future
// Simple ("will") — no continuous/perfect/passive forms.
//
// Wrapped in an IIFE and attached to window.TenseTales.grammar.constants
// (never a bare global) because the legacy system already declares
// top-level `const Tenses` / `const TenseLabels` in src/data/tenses.js —
// a second bare `const Tenses` on the same page would be a redeclaration
// SyntaxError. See MIGRATION.md.

(function () {
  var Tenses = {
    PRESENT_SIMPLE: 'presentSimple',
    PAST_SIMPLE: 'pastSimple',
    FUTURE_SIMPLE: 'futureSimple',
  };

  var TenseLabels = {
    presentSimple: 'Present Simple',
    pastSimple: 'Past Simple',
    futureSimple: 'Future Simple',
  };

  var DifficultyLevels = {
    YEAR1_2: 'year1_2',
    YEAR3_4: 'year3_4',
    YEAR5_6: 'year5_6',
  };

  // Time cues are metadata only — a sentence is never required to contain
  // one (see getTimeCueForTense in grammarEngine.js).
  var TimeCues = {
    presentSimple: ['every day', 'every morning', 'usually', 'on weekends'],
    pastSimple: ['yesterday', 'last night', 'earlier', 'this morning'],
    futureSimple: ['tomorrow', 'later', 'next week'],
  };

  var api = { Tenses: Tenses, TenseLabels: TenseLabels, DifficultyLevels: DifficultyLevels, TimeCues: TimeCues };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.TenseTales.grammar.constants = api;
  }
})();

// Phase 2 grammar engine. Pure JS — no Phaser, no DOM. Works as a plain
// <script> global (if ever loaded in a page) or via require() in Node.
//
// Scope (V1, intentionally limited):
//   Present Simple, Past Simple, Future Simple ("will" + base) only.
//   No continuous/perfect/passive forms, no automatic morphology beyond
//   what's explicitly stored in verbCatalog.js.

(function () {
  var verbCatalog;
  var subjects;
  var constants;

  if (typeof module !== 'undefined' && module.exports) {
    verbCatalog = require('./verbCatalog.js');
    subjects = require('../data/subjects.js');
    constants = require('./grammarConstants.js');
  } else {
    verbCatalog = window.TenseTales.grammar.verbCatalog;
    subjects = window.TenseTales.data.subjects;
    constants = window.TenseTales.grammar.constants;
  }

  var TenseIds = constants.Tenses;

  function resolveVerb(verbId) {
    var verb = verbCatalog[verbId];
    if (!verb) throw new Error('Unknown verb: ' + verbId);
    return verb;
  }

  function resolveSubject(subject) {
    if (subject && typeof subject === 'object') return subject;
    var found = subjects[subject];
    if (!found) throw new Error('Unknown subject: ' + subject);
    return found;
  }

  function isThirdPersonSingular(subject) {
    return subject.person === 3 && subject.number === 'singular';
  }

  // getVerbForm({ verbId, tense, subject }) -> conjugated verb string.
  // `subject` may be a subject id ("theBoy") or a resolved subject object.
  function getVerbForm(input) {
    var verb = resolveVerb(input.verbId);

    switch (input.tense) {
      case TenseIds.PRESENT_SIMPLE: {
        var subject = resolveSubject(input.subject);
        return isThirdPersonSingular(subject) ? verb.thirdPerson : verb.base;
      }
      case TenseIds.PAST_SIMPLE:
        return verb.past;
      case TenseIds.FUTURE_SIMPLE:
        return verb.future;
      default:
        throw new Error('Unsupported tense: ' + input.tense);
    }
  }

  function collapseSpaces(text) {
    return text.replace(/\s+/g, ' ').replace(/\s+\./, '.').trim();
  }

  // buildSentence({ subject, verbId, tense, object, complement, timePhrase })
  // -> full sentence string. object/complement/timePhrase are all optional;
  // a sentence is never required to carry a time phrase (see section 7 of
  // the Phase 2 brief — time context is metadata, not a grammar requirement).
  function buildSentence(input) {
    var subject = resolveSubject(input.subject);
    var verbForm = getVerbForm({ verbId: input.verbId, tense: input.tense, subject: subject });

    var parts = [subject.text, verbForm, input.object || '', input.complement || '', input.timePhrase || ''];
    return collapseSpaces(parts.join(' ') + '.');
  }

  function normalizeText(text) {
    return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.+$/, '');
  }

  // validateVerbChoice({ chosen, verbId, tense, subject }) -> { correct, expected }
  function validateVerbChoice(input) {
    var expected = getVerbForm({ verbId: input.verbId, tense: input.tense, subject: input.subject });
    return { correct: normalizeText(input.chosen) === normalizeText(expected), expected: expected };
  }

  // validateSentenceTokens(tokens, correctTokens) -> boolean. Generic
  // ordered-token-list comparison — deliberately has no knowledge of
  // subjects/verbs/assets, so any future drag-and-drop token UI (sentence
  // builder, story order, anything else) can reuse it instead of each
  // screen writing its own array-equality check.
  function validateSentenceTokens(tokens, correctTokens) {
    if (!Array.isArray(tokens) || !Array.isArray(correctTokens)) return false;
    if (tokens.length !== correctTokens.length) return false;
    return tokens.every(function (token, i) { return token === correctTokens[i]; });
  }

  function getTenseLabel(tense) {
    var label = constants.TenseLabels[tense];
    if (!label) throw new Error('Unsupported tense: ' + tense);
    return label;
  }

  // getTimeCueForTense(tense, index=0) -> a cue phrase for that tense.
  // Time cues are metadata, kept separate from grammar — callers pick one
  // (or don't use one at all) rather than the engine forcing it into a
  // sentence.
  function getTimeCueForTense(tense, index) {
    var cues = constants.TimeCues[tense];
    if (!cues) throw new Error('Unsupported tense: ' + tense);
    return cues[index || 0];
  }

  var api = {
    Tenses: TenseIds,
    getVerbForm: getVerbForm,
    buildSentence: buildSentence,
    validateVerbChoice: validateVerbChoice,
    validateSentenceTokens: validateSentenceTokens,
    getTenseLabel: getTenseLabel,
    getTimeCueForTense: getTimeCueForTense,
    isThirdPersonSingular: isThirdPersonSingular,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    // Deliberately NOT window.GrammarEngine — the legacy system already
    // owns that name (src/grammar/legacy-grammar-engine.js) with an
    // incompatible (positional-args) function signature. See MIGRATION.md.
    window.TenseTales.grammar.engine = api;
  }
})();

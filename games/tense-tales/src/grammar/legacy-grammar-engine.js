// Pure grammar logic — no Phaser, no DOM. Runnable in the browser (loaded
// as a plain script, after the data files) or in Node (via require, for
// the tests in tests/grammar-engine.test.js).

(function () {
  var verbsData;
  var subjectsData;
  var timeCueData;
  var sentenceTemplateData;
  var tensesData;

  if (typeof module !== 'undefined' && module.exports) {
    verbsData = require('../data/verbs.js');
    subjectsData = require('../data/legacy-subjects.js');
    timeCueData = require('../data/time-cues.js');
    sentenceTemplateData = require('../data/sentence-templates.js');
    tensesData = require('../data/tenses.js');
  } else {
    verbsData = VerbData;
    subjectsData = SubjectData;
    timeCueData = TimeCueData;
    sentenceTemplateData = SentenceTemplates;
    tensesData = { Tenses: Tenses, TenseLabels: TenseLabels };
  }

  var TenseIds = tensesData.Tenses;

  function resolveVerb(verbId) {
    var verb = verbsData[verbId];
    if (!verb) throw new Error('Unknown verb: ' + verbId);
    return verb;
  }

  function resolveSubject(subjectId) {
    var subject = subjectsData[subjectId];
    if (!subject) throw new Error('Unknown subject: ' + subjectId);
    return subject;
  }

  function isThirdPersonSingular(subject) {
    return subject.person === 3 && subject.number === 'singular';
  }

  // getVerbForm(verbId, tense, subjectId) -> conjugated verb string.
  // subjectId is only needed for Present Simple (base vs. third person).
  function getVerbForm(verbId, tense, subjectId) {
    var verb = resolveVerb(verbId);

    switch (tense) {
      case TenseIds.PRESENT_SIMPLE: {
        var subject = resolveSubject(subjectId);
        return isThirdPersonSingular(subject) ? verb.thirdPerson : verb.base;
      }
      case TenseIds.PAST_SIMPLE:
        return verb.past;
      case TenseIds.FUTURE_SIMPLE:
        return verb.future;
      default:
        throw new Error('Unsupported tense: ' + tense);
    }
  }

  function capitalize(text) {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // buildSentence({ subjectId, verbId, tense, complement }) -> full sentence.
  function buildSentence(input) {
    var subject = resolveSubject(input.subjectId);
    var verbForm = getVerbForm(input.verbId, input.tense, input.subjectId);
    var template = sentenceTemplateData[input.tense];
    if (!template) throw new Error('No sentence template for tense: ' + input.tense);

    var complement = (input.complement || '').trim();

    var sentence = template
      .replace('{Subject}', capitalize(subject.label))
      .replace('{verb}', verbForm)
      .replace('{complement}', complement);

    // Collapse the double space that appears when complement is empty.
    return sentence.replace(/\s+/g, ' ').replace(/\s+\./, '.').trim();
  }

  function normalizeText(text) {
    return String(text || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\.+$/, '');
  }

  // validateSentenceChoice(selection, correct) -> { correct, errors }
  // Both are { subjectId, verbId, tense, complement }. Reports which
  // specific part(s) are wrong so the UI can give targeted feedback.
  function validateSentenceChoice(selection, correct) {
    var errors = [];

    if (selection.subjectId !== correct.subjectId) errors.push('subject');
    if (selection.tense !== correct.tense) errors.push('tense');

    var selectionVerbForm;
    var correctVerbForm;
    try {
      selectionVerbForm = getVerbForm(selection.verbId, selection.tense, selection.subjectId);
      correctVerbForm = getVerbForm(correct.verbId, correct.tense, correct.subjectId);
    } catch (err) {
      errors.push('verb');
    }
    if (selectionVerbForm !== undefined && selectionVerbForm !== correctVerbForm) {
      errors.push('verb');
    }

    if (normalizeText(selection.complement) !== normalizeText(correct.complement)) {
      errors.push('complement');
    }

    return { correct: errors.length === 0, errors: errors };
  }

  // getTenseFromContext(cue, contextHint?) -> tense id or null.
  // contextHint (a tense id) resolves ambiguous cues that appear under
  // more than one tense; otherwise the first matching tense wins.
  function getTenseFromContext(cue, contextHint) {
    var normalized = normalizeText(cue);

    if (contextHint && timeCueData[contextHint] && timeCueData[contextHint].indexOf(normalized) !== -1) {
      return contextHint;
    }

    var tenseKeys = Object.keys(timeCueData);
    for (var i = 0; i < tenseKeys.length; i += 1) {
      if (timeCueData[tenseKeys[i]].indexOf(normalized) !== -1) {
        return tenseKeys[i];
      }
    }

    return null;
  }

  var api = {
    Tenses: TenseIds,
    getVerbForm: getVerbForm,
    buildSentence: buildSentence,
    validateSentenceChoice: validateSentenceChoice,
    getTenseFromContext: getTenseFromContext,
    isThirdPersonSingular: isThirdPersonSingular,
    capitalize: capitalize,
    normalizeText: normalizeText,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.GrammarEngine = api;
  }
})();

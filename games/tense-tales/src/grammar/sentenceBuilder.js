// Story-aware layer on top of grammarEngine.js: resolves a story panel
// (subjectId/verbId/object/complement) into an actual sentence, and
// validates a story's shape. No Phaser, no DOM.

(function () {
  var grammarEngine;
  var subjects;
  var verbCatalog;
  var constants;

  if (typeof module !== 'undefined' && module.exports) {
    grammarEngine = require('./grammarEngine.js');
    subjects = require('../data/subjects.js');
    verbCatalog = require('./verbCatalog.js');
    constants = require('./grammarConstants.js');
  } else {
    grammarEngine = window.TenseTales.grammar.engine;
    subjects = window.TenseTales.data.subjects;
    verbCatalog = window.TenseTales.grammar.verbCatalog;
    constants = window.TenseTales.grammar.constants;
  }

  var validTenses = Object.keys(constants.Tenses).map(function (key) { return constants.Tenses[key]; });

  // resolvePanelSentence(panel, tense, timeCueIndex?) -> {
  //   subject, verbForm, object, complement, timePhrase, sentence
  // }
  // `panel.sentenceOverride` (a plain string), if present, is used verbatim
  // instead of generating the sentence — for the rare case natural English
  // needs a hand-written exception (see stories.js comments).
  function resolvePanelSentence(panel, tense, timeCueIndex) {
    var subject = subjects[panel.subjectId];
    if (!subject) throw new Error('Unknown subjectId "' + panel.subjectId + '" in panel "' + panel.id + '"');
    if (!verbCatalog[panel.verbId]) throw new Error('Unknown verbId "' + panel.verbId + '" in panel "' + panel.id + '"');

    var verbForm = grammarEngine.getVerbForm({ verbId: panel.verbId, tense: tense, subject: subject });
    var timePhrase = typeof timeCueIndex === 'number' ? grammarEngine.getTimeCueForTense(tense, timeCueIndex) : undefined;

    var sentence = panel.sentenceOverride
      || grammarEngine.buildSentence({
        subject: subject,
        verbId: panel.verbId,
        tense: tense,
        object: panel.object,
        complement: panel.complement,
        timePhrase: timePhrase,
      });

    return {
      subject: subject,
      verbForm: verbForm,
      object: panel.object || null,
      complement: panel.complement || null,
      timePhrase: timePhrase || null,
      sentence: sentence,
    };
  }

  // buildStorySentences(story, tense, timeCueIndex?) -> resolved sentence
  // per panel, in panel order.
  function buildStorySentences(story, tense, timeCueIndex) {
    if (story.supportedTenses.indexOf(tense) === -1) {
      throw new Error('Story "' + story.id + '" does not support tense: ' + tense);
    }
    return story.panels
      .slice()
      .sort(function (a, b) { return a.order - b.order; })
      .map(function (panel) { return resolvePanelSentence(panel, tense, timeCueIndex); });
  }

  // validateStoryShape(story) -> { valid, errors }. Checks the structural
  // rules tests rely on: exactly 4 panels, unique orders, every referenced
  // verb/subject exists, and every supportedTenses entry is a real tense.
  function validateStoryShape(story) {
    var errors = [];

    if (!Array.isArray(story.panels) || story.panels.length !== 4) {
      errors.push('Story "' + story.id + '" must have exactly 4 panels, has ' + (story.panels ? story.panels.length : 0));
    } else {
      var orders = story.panels.map(function (p) { return p.order; });
      var uniqueOrders = orders.slice().sort().filter(function (v, i, arr) { return arr.indexOf(v) === i; });
      if (uniqueOrders.length !== orders.length) {
        errors.push('Story "' + story.id + '" has duplicate panel orders: ' + orders.join(','));
      }

      story.panels.forEach(function (panel) {
        if (!subjects[panel.subjectId]) errors.push('Panel "' + panel.id + '" references unknown subjectId "' + panel.subjectId + '"');
        if (!verbCatalog[panel.verbId]) errors.push('Panel "' + panel.id + '" references unknown verbId "' + panel.verbId + '"');
      });
    }

    if (!Array.isArray(story.supportedTenses) || story.supportedTenses.length === 0) {
      errors.push('Story "' + story.id + '" has no supportedTenses');
    } else {
      story.supportedTenses.forEach(function (tense) {
        if (validTenses.indexOf(tense) === -1) errors.push('Story "' + story.id + '" has invalid tense: ' + tense);
      });
    }

    return { valid: errors.length === 0, errors: errors };
  }

  var api = {
    resolvePanelSentence: resolvePanelSentence,
    buildStorySentences: buildStorySentences,
    validateStoryShape: validateStoryShape,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.TenseTales.grammar.sentenceBuilder = api;
  }
})();

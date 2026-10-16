// Builds the word/phrase cards for the Phase 4 sentence builder from a
// story's sentenceData entry. Pure data logic — no Phaser — so it can be
// unit tested directly (see tests/sentence-chunks.test.js).

(function () {
  var subjectsData;
  var verbsData;
  var grammarEngine;

  if (typeof module !== 'undefined' && module.exports) {
    subjectsData = require('../data/legacy-subjects.js');
    verbsData = require('../data/verbs.js');
    grammarEngine = require('./legacy-grammar-engine.js');
  } else {
    subjectsData = SubjectData;
    verbsData = VerbData;
    grammarEngine = window.GrammarEngine;
  }

  var Tenses = grammarEngine.Tenses;

  // Fixed order a correct sentence is built in: subject, verb, complement,
  // then the time cue chunk. One meaningful distractor (the same verb in
  // the "opposite" simple tense, e.g. go/went, eat/ate, plays/played) is
  // mixed into the bank alongside the four correct chunks.
  function buildChunksForEntry(entry) {
    var subject = subjectsData[entry.subjectId];
    var correctVerbForm = grammarEngine.getVerbForm(entry.verbId, entry.tense, entry.subjectId);
    var distractorTense = entry.tense === Tenses.PRESENT_SIMPLE ? Tenses.PAST_SIMPLE : Tenses.PRESENT_SIMPLE;
    var distractorVerbForm = grammarEngine.getVerbForm(entry.verbId, distractorTense, entry.subjectId);

    var correctChunks = [
      { id: 'subject', text: grammarEngine.capitalize(subject.label), type: 'subject' },
      { id: 'verb', text: correctVerbForm, type: 'verb' },
      { id: 'complement', text: entry.complement, type: 'complement' },
      { id: 'timeCue', text: entry.timeCueId, type: 'timeCue' },
    ];

    var distractorChunk = {
      id: 'verb-distractor',
      text: distractorVerbForm,
      type: 'verb',
      isDistractor: true,
    };

    var correctOrder = correctChunks.map(function (chunk) { return chunk.id; });
    var bankChunks = shuffle(correctChunks.concat([distractorChunk]));

    return { correctChunks: correctChunks, distractorChunk: distractorChunk, bankChunks: bankChunks, correctOrder: correctOrder };
  }

  // The full sentence a player is building, including the time-cue chunk
  // (grammar-engine.buildSentence() only produces the Subject+verb+complement
  // core, so the cue is appended here instead). Generated on demand from
  // structured data — never stored per-tense — so the Phase 5 Time Switch
  // can replay the same story under a different tense for free.
  function buildFullSentenceText(entry) {
    var core = grammarEngine.buildSentence(entry).replace(/\.$/, '');
    return core + ' ' + entry.timeCueId + '.';
  }

  // Merges a story's tense-invariant sentenceData entry with a specific
  // tense's time-cue (from story.timeModes) into the { subjectId, verbId,
  // complement, tense, timeCueId } shape the rest of this module expects.
  // Per-tense `overrides` on the entry (e.g. a different complement some
  // tense needs for natural English) win over the base fields.
  function resolveSentenceEntry(baseEntry, story, tenseId) {
    var mode = story.timeModes[tenseId];
    if (!mode) throw new Error('Story "' + story.storyId + '" has no time mode for tense: ' + tenseId);

    var overrides = (baseEntry.overrides && baseEntry.overrides[tenseId]) || {};

    return Object.assign({}, baseEntry, { tense: tenseId, timeCueId: mode.timeCueId }, overrides);
  }

  // Short, max-two-line grammar explanation for the feedback panel.
  function buildGrammarNote(entry) {
    var verb = verbsData[entry.verbId];
    var tenseNote = {
      presentSimple: 'means this happens often.',
      pastSimple: 'means this already happened.',
      futureSimple: 'means this will happen.',
    }[entry.tense];
    var correctForm = {
      presentSimple: verb.thirdPerson,
      pastSimple: verb.past,
      futureSimple: verb.future,
    }[entry.tense];

    var line1 = grammarEngine.capitalize(entry.timeCueId) + ' ' + tenseNote;
    var line2 = verb.base + ' → ' + correctForm;
    return line1 + '\n' + line2;
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  var api = {
    buildChunksForEntry: buildChunksForEntry,
    buildFullSentenceText: buildFullSentenceText,
    buildGrammarNote: buildGrammarNote,
    resolveSentenceEntry: resolveSentenceEntry,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.SentenceChunks = api;
  }
})();

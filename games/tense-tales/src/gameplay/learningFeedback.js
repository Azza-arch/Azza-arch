(function () {
  var sentenceBuilder;
  if (typeof module !== 'undefined' && module.exports) {
    sentenceBuilder = require('../grammar/sentenceBuilder.js');
  } else {
    sentenceBuilder = window.TenseTales.grammar.sentenceBuilder;
  }

  function otherTense(tense) {
    return tense === 'pastSimple' ? 'presentSimple' : 'pastSimple';
  }

  function tenseName(tense) {
    return tense === 'pastSimple' ? 'Past Simple' : 'Present Simple';
  }

  function timeLabel(tense) {
    return tense === 'pastSimple' ? 'Yesterday' : 'Every day';
  }

  function sentenceParts(panel, tense) {
    var resolved = sentenceBuilder.resolvePanelSentence(panel, tense);
    return {
      sentence: resolved.sentence,
      subject: resolved.subject.text,
      verb: resolved.verbForm,
      tense: tense,
      tenseName: tenseName(tense),
      timeLabel: timeLabel(tense),
    };
  }

  function comparison(panel, selectedTense) {
    return {
      selected: sentenceParts(panel, selectedTense),
      other: sentenceParts(panel, otherTense(selectedTense)),
    };
  }

  function storyHint(story, attempts) {
    var panels = story.panels.slice().sort(function (a, b) { return a.order - b.order; });
    if (attempts <= 1) {
      return {
        title: 'Find the beginning first.',
        body: 'Start with the picture where the boy or Aina ' + panels[0].actionLabel.toLowerCase() + '.',
      };
    }
    if (attempts === 2) {
      return {
        title: 'Use the first change as your clue.',
        body: story.hints.secondAttempt + ' Then look for: ' + panels[1].actionLabel.toLowerCase() + '.',
      };
    }
    return {
      title: 'Check the beginning and ending.',
      body: 'The story begins with “' + panels[0].actionLabel + '” and ends with “' + panels[panels.length - 1].actionLabel + '”. Arrange the two middle moments between them.',
    };
  }

  function startsWith(actual, expectedStart) {
    return expectedStart.every(function (word, index) { return actual[index] === word; });
  }

  function wordHint(panel, tense, actualWords, tokenize, attempts) {
    var parts = sentenceParts(panel, tense);
    var expected = tokenize(parts.sentence);
    var subjectWords = tokenize(parts.subject);
    var verbIndex = subjectWords.length;

    if (!startsWith(actualWords, subjectWords)) {
      return {
        title: 'Start with who is doing the action.',
        body: 'Put “' + parts.subject + '” first. A sentence begins with its subject.',
      };
    }
    if (actualWords[verbIndex] !== parts.verb) {
      return {
        title: 'Put the action after the subject.',
        body: 'For ' + parts.tenseName + ', place “' + parts.verb + '” after “' + parts.subject + '”.',
      };
    }

    var mismatch = expected.findIndex(function (word, index) { return actualWords[index] !== word; });
    var clueStart = Math.max(0, mismatch - 1);
    var clue = expected.slice(clueStart, Math.min(expected.length, mismatch + (attempts >= 2 ? 3 : 2))).join(' ');
    return {
      title: attempts >= 2 ? 'Use this word group.' : 'The subject and verb are right.',
      body: 'Keep “' + clue + '” together, then read the whole sentence from left to right.',
    };
  }

  var api = {
    otherTense: otherTense,
    tenseName: tenseName,
    timeLabel: timeLabel,
    sentenceParts: sentenceParts,
    comparison: comparison,
    storyHint: storyHint,
    wordHint: wordHint,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.learningFeedback = api;
})();

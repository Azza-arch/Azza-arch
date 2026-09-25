(function () {
  var builder, catalog;
  if (typeof module !== 'undefined' && module.exports) {
    builder = require('../grammar/sentenceBuilder.js');
    catalog = require('../grammar/verbCatalog.js');
  } else {
    builder = window.TenseTales.grammar.sentenceBuilder;
    catalog = window.TenseTales.grammar.verbCatalog;
  }

  function otherTense(tense) { return tense === 'pastSimple' ? 'presentSimple' : 'pastSimple'; }
  function unique(values) { return values.filter(function (value, index, list) { return value && list.indexOf(value) === index; }); }
  function deterministicShuffle(values, seed) {
    var result = values.slice();
    for (var i = result.length - 1; i > 0; i -= 1) {
      var j = Math.abs((seed + i * 17) % (i + 1));
      var temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  }
  function verbQuestion(story, tense) {
    var panel = story.wordChallenge;
    var answer = builder.resolvePanelSentence(panel, tense);
    var alternate = builder.resolvePanelSentence(panel, otherTense(tense));
    var verb = catalog[panel.verbId];
    var options = unique([answer.verbForm, alternate.verbForm, verb.base, verb.thirdPerson, verb.past, verb.base + 'ing']).slice(0, 3);
    if (options.length < 3) options.push('will ' + verb.base);
    return {
      type: 'verbChoice', storyId: story.id, panelId: panel.panelId,
      prompt: answer.sentence.replace(answer.verbForm, '_____'),
      answer: answer.verbForm,
      options: deterministicShuffle(unique(options).slice(0, 3), story.level + (tense === 'pastSimple' ? 3 : 0)),
      explanation: (tense === 'pastSimple' ? 'Past Simple shows an action that already happened.' : 'Present Simple shows an action that happens now or regularly.'),
    };
  }
  function timeQuestion(story, tense) {
    var panel = story.wordChallenge;
    var resolved = builder.resolvePanelSentence(panel, tense);
    return {
      type: 'timeSort', storyId: story.id, panelId: panel.panelId,
      prompt: resolved.sentence,
      answer: tense,
      options: ['presentSimple', 'pastSimple'],
      explanation: '“' + resolved.verbForm + '” is the ' + (tense === 'pastSimple' ? 'Past Simple' : 'Present Simple') + ' form.',
    };
  }
  function queue(stories, tense, mastery, errors) {
    return Object.keys(stories).map(function (id) {
      var story = stories[id];
      var branch = mastery && mastery[tense];
      var mastered = branch && branch.storyOrder && branch.wordOrder && branch.storyOrder[story.level] && branch.wordOrder[story.level]
        && branch.storyOrder[story.level].mastered && branch.wordOrder[story.level].mastered;
      var errorCount = errors && errors[tense] && errors[tense][id] ? errors[tense][id].total : 0;
      return { story: story, weight: errorCount * 10 + (mastered ? 0 : 5) + (6 - story.level) / 10 };
    }).sort(function (a, b) { return b.weight - a.weight; }).map(function (item) { return item.story; });
  }
  var api = { otherTense: otherTense, verbQuestion: verbQuestion, timeQuestion: timeQuestion, queue: queue };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.practiceEngine = api;
})();

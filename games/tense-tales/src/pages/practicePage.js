(function () {
  var tense, activity, stories, round, current, answered;
  var els = {};
  function cache() {
    ['practice-shell','practice-back','practice-tense','practice-picker','practice-session','practice-complete','practice-recommendation','practice-verb','practice-time','practice-round','practice-story','practice-picture','practice-prompt','practice-options','practice-feedback','practice-feedback-title','practice-feedback-body','practice-next','practice-again','practice-games'].forEach(function (id) { els[id] = document.getElementById(id); });
  }
  function show(part) {
    ['practice-picker','practice-session','practice-complete'].forEach(function (id) { els[id].hidden = id !== part; });
  }
  function recommendation() {
    var mastery = window.TenseTales.gameplay.masteryStore.load();
    var errors = window.TenseTales.gameplay.practiceStore.load();
    var queue = window.TenseTales.gameplay.practiceEngine.queue(window.TenseTales.data.stories, tense, mastery, errors);
    var top = queue[0];
    var item = errors[tense][top.id];
    if (item && item.total > 0) return 'Recommended: practise ' + top.title + ' again based on earlier answers.';
    return 'Recommended: begin with ' + top.title + ' to strengthen both game modes.';
  }
  function open(selectedTense) {
    cache(); tense = selectedTense; activity = null; round = 0; answered = false;
    window.TenseTales.gameplay.appFlow.state.screen = 'practice';
    document.querySelectorAll('body > main, #game-root, #story-order-shell').forEach(function (el) { el.hidden = true; });
    els['practice-shell'].hidden = false;
    els['practice-tense'].textContent = tense === 'pastSimple' ? 'Past Simple' : 'Present Simple';
    window.TenseTales.gameplay.appFlow.placeSoundControls(els['practice-shell']);
    els['practice-recommendation'].textContent = recommendation();
    show('practice-picker');
    requestAnimationFrame(function(){var h=els['practice-picker'].querySelector('h1');h.tabIndex=-1;h.focus();});
  }
  function start(type) {
    activity = type; round = 0;
    var mastery = window.TenseTales.gameplay.masteryStore.load();
    var errors = window.TenseTales.gameplay.practiceStore.load();
    stories = window.TenseTales.gameplay.practiceEngine.queue(window.TenseTales.data.stories, tense, mastery, errors);
    show('practice-session'); renderRound(); requestAnimationFrame(function(){els['practice-prompt'].tabIndex=-1;els['practice-prompt'].focus();});
  }
  function renderPicture(story, panelId) {
    var panel = story.panels.find(function (item) { return item.id === panelId; });
    els['practice-picture'].setAttribute('aria-label', 'Picture from ' + story.title);
    window.TenseTales.utils.sceneComposition.renderDom(els['practice-picture'], panel.scene, window.TenseTales.data.assetCatalog);
  }
  function renderRound() {
    answered = false;
    var story = stories[round % stories.length];
    current = activity === 'verbChoice'
      ? window.TenseTales.gameplay.practiceEngine.verbQuestion(story, tense)
      : window.TenseTales.gameplay.practiceEngine.timeQuestion(story, round % 2 === 0 ? tense : window.TenseTales.gameplay.practiceEngine.otherTense(tense));
    els['practice-round'].textContent = 'Round ' + (round + 1) + ' of 5';
    els['practice-story'].textContent = story.title;
    els['practice-prompt'].textContent = current.prompt;
    els['practice-options'].textContent = '';
    els['practice-options'].className = 'practice-options' + (current.type === 'timeSort' ? ' is-time-sort' : '');
    els['practice-feedback'].hidden = true;
    els['practice-next'].hidden = true;
    els['practice-next'].textContent = round === 4 ? 'Finish Practice' : 'Next Question';
    renderPicture(story, current.panelId);
    current.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button'; button.className = 'practice-option'; button.dataset.value = option;
      button.textContent = current.type === 'timeSort' ? (option === 'pastSimple' ? 'Yesterday' : 'Every day') : option;
      button.addEventListener('click', function () { answer(option, button); });
      els['practice-options'].appendChild(button);
    });
  }
  function answer(value, button) {
    if (answered) return;
    answered = true;
    var correct = value === current.answer;
    els['practice-options'].querySelectorAll('button').forEach(function (option) {
      option.disabled = true;
      if (option.dataset.value === current.answer) option.classList.add('is-correct');
    });
    if (!correct) button.classList.add('is-wrong');
    els['practice-feedback'].hidden = false;
    els['practice-feedback'].className = 'learning-feedback ' + (correct ? 'is-correct' : 'is-hint');
    els['practice-feedback-title'].textContent = correct ? 'Correct: that answer fits.' : 'Not yet: try this form next time.';
    els['practice-feedback-body'].textContent = current.explanation;
    var store = window.TenseTales.gameplay.practiceStore;
    if (correct) { store.recordSuccess(tense, current.storyId, current.type); window.TenseTales.utils.audioManager.tone('correct'); }
    else { store.recordError(tense, current.storyId, current.type); window.TenseTales.utils.audioManager.tone('retry'); }
    els['practice-next'].hidden = false;
  }
  function next() {
    round += 1;
    if (round >= 5) { show('practice-complete'); requestAnimationFrame(function(){var h=els['practice-complete'].querySelector('h1');h.tabIndex=-1;h.focus();}); return; }
    renderRound();
  }
  function back() {
    window.TenseTales.utils.audioManager.stopNarration();
    if (!els['practice-session'].hidden || !els['practice-complete'].hidden) { show('practice-picker'); return; }
    els['practice-shell'].hidden = true; window.TenseTales.gameplay.appFlow.showGameSelect();
  }
  document.addEventListener('DOMContentLoaded', function () {
    cache();
    els['practice-back'].addEventListener('click', back);
    els['practice-verb'].addEventListener('click', function () { start('verbChoice'); });
    els['practice-time'].addEventListener('click', function () { start('timeSort'); });
    els['practice-next'].addEventListener('click', next);
    els['practice-again'].addEventListener('click', function () { start(activity); });
    els['practice-games'].addEventListener('click', function () { els['practice-shell'].hidden = true; window.TenseTales.gameplay.appFlow.showGameSelect(); });
  });
  window.TenseTales.gameplay.openPracticePage = open;
})();

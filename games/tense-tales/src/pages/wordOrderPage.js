(function () {
  let story;
  let tense;
  let expected = [];
  let tokens = [];
  let orderedIds = [];
  let draggedId = null;
  let attempts = 0;
  let challengePanel = null;
  const els = {};

  function cache() {
    ['word-order-shell', 'wo-back', 'wo-level-label', 'wo-tense-chip', 'wo-context', 'wo-story-title', 'wo-picture', 'wo-complete-picture', 'wo-gameplay', 'wo-answer', 'wo-empty', 'wo-bank', 'wo-feedback', 'wo-feedback-title', 'wo-feedback-body', 'wo-check', 'wo-complete', 'wo-final-sentence', 'wo-tense-compare', 'wo-listen', 'wo-next', 'wo-replay', 'wo-levels'].forEach((id) => { els[id] = document.getElementById(id); });
  }

  function renderPicture(panel) {
    els['wo-picture'].textContent = '';
    els['wo-picture'].setAttribute('aria-label', `Picture from ${story.title}`);
    const composition = window.TenseTales.utils.sceneComposition;
    composition.renderDom(els['wo-picture'], panel.scene, window.TenseTales.data.assetCatalog);
  }

  function sentenceForChallenge() {
    return window.TenseTales.grammar.sentenceBuilder.resolvePanelSentence(Object.assign({ id: `${story.id}-word` }, story.wordChallenge), tense).sentence;
  }

  function renderTokens() {
    els['wo-answer'].querySelectorAll('.word-tile').forEach((el) => el.remove());
    els['wo-bank'].textContent = '';
    const ordered = orderedIds.map((id) => tokens.find((token) => token.id === id));
    const remaining = tokens.filter((token) => orderedIds.indexOf(token.id) === -1);
    ordered.forEach((token) => els['wo-answer'].insertBefore(makeTile(token, true), els['wo-answer'].querySelector('.wo-period')));
    remaining.forEach((token) => els['wo-bank'].appendChild(makeTile(token, false)));
    els['wo-empty'].hidden = ordered.length > 0;
  }

  function makeTile(token, placed) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `word-tile${placed ? ' is-placed' : ''}`;
    button.textContent = token.word;
    button.draggable = true;
    button.dataset.tokenId = token.id;
    button.setAttribute('aria-label', `${token.word}${placed ? `, position ${orderedIds.indexOf(token.id) + 1}. Use Left or Right arrow to reorder.` : ', in word bank'}`);
    button.addEventListener('click', () => toggleToken(token.id));
    button.addEventListener('dragstart', () => { draggedId = token.id; button.classList.add('is-dragging'); });
    button.addEventListener('dragend', () => { draggedId = null; button.classList.remove('is-dragging'); });
    button.addEventListener('keydown', (event) => {
      if (!placed || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
      event.preventDefault(); const from = orderedIds.indexOf(token.id); const to = Math.max(0, Math.min(orderedIds.length - 1, from + (event.key === 'ArrowLeft' ? -1 : 1)));
      if (from === to) return; orderedIds.splice(from, 1); orderedIds.splice(to, 0, token.id); renderTokens(); const next = document.querySelector(`[data-token-id="${token.id}"]`); if (next) next.focus();
    });
    return button;
  }

  function toggleToken(id) {
    clearFeedback();
    window.TenseTales.utils.audioManager.tone('move');
    const index = orderedIds.indexOf(id);
    if (index === -1) orderedIds.push(id); else orderedIds.splice(index, 1);
    renderTokens();
  }

  function bindDropZone(element, inAnswer) {
    element.addEventListener('dragover', (event) => event.preventDefault());
    element.addEventListener('drop', (event) => {
      event.preventDefault();
      if (!draggedId) return;
      const oldIndex = orderedIds.indexOf(draggedId);
      if (oldIndex !== -1) orderedIds.splice(oldIndex, 1);
      if (inAnswer) {
        const target = event.target.closest('.word-tile');
        const targetIndex = target ? orderedIds.indexOf(target.dataset.tokenId) : orderedIds.length;
        orderedIds.splice(targetIndex < 0 ? orderedIds.length : targetIndex, 0, draggedId);
      }
      renderTokens();
    });
  }

  function reset() {
    window.TenseTales.utils.audioManager.stopNarration();
    const sentence = sentenceForChallenge();
    expected = window.TenseTales.gameplay.wordOrder.tokenize(sentence);
    const shuffled = window.TenseTales.gameplay.wordOrder.shuffled(expected);
    tokens = shuffled.map((word, index) => ({ id: `word-${index}`, word }));
    orderedIds = [];
    attempts = 0;
    clearFeedback();
    els['wo-complete'].hidden = true;
    els['wo-gameplay'].hidden = false;
    renderTokens();
  }

  function clearFeedback() {
    els['wo-feedback'].hidden = true;
    els['wo-feedback'].className = 'learning-feedback';
    els['wo-feedback-title'].textContent = '';
    els['wo-feedback-body'].textContent = '';
  }

  function showFeedback(kind, title, body) {
    els['wo-feedback'].hidden = false;
    els['wo-feedback'].className = `learning-feedback is-${kind}`;
    els['wo-feedback-title'].textContent = title;
    els['wo-feedback-body'].textContent = body;
  }

  function appendMarkedSentence(container, parts) {
    const sentence = parts.sentence;
    const subjectStart = sentence.indexOf(parts.subject);
    const verbStart = sentence.indexOf(parts.verb, subjectStart + parts.subject.length);
    const line = document.createElement('p');
    line.className = 'marked-sentence';
    const subject = document.createElement('mark'); subject.className = 'grammar-subject'; subject.textContent = parts.subject;
    const verb = document.createElement('mark'); verb.className = 'grammar-verb'; verb.textContent = parts.verb;
    line.append(subject, document.createTextNode(sentence.slice(subjectStart + parts.subject.length, verbStart)), verb, document.createTextNode(sentence.slice(verbStart + parts.verb.length)));
    container.appendChild(line);
  }

  function renderLearningSummary() {
    const feedback = window.TenseTales.gameplay.learningFeedback;
    const comparison = feedback.comparison(story.wordChallenge, tense);
    els['wo-final-sentence'].textContent = '';
    appendMarkedSentence(els['wo-final-sentence'], comparison.selected);
    els['wo-tense-compare'].textContent = '';
    [comparison.selected, comparison.other].forEach((parts) => {
      const column = document.createElement('div');
      const label = document.createElement('span'); label.className = 'tense-compare-label'; label.textContent = parts.timeLabel;
      column.appendChild(label); appendMarkedSentence(column, parts); els['wo-tense-compare'].appendChild(column);
    });
  }

  function check() {
    const words = orderedIds.map((id) => tokens.find((token) => token.id === id).word);
    if (words.length !== expected.length) {
      showFeedback('hint', 'The sentence is not complete yet.', `Move all ${expected.length} words into the sentence, then check again.`);
      return;
    }
    if (!window.TenseTales.gameplay.wordOrder.isCorrect(words, expected)) {
      attempts += 1;
      window.TenseTales.utils.audioManager.tone('retry');
      const hint = window.TenseTales.gameplay.learningFeedback.wordHint(story.wordChallenge, tense, words, window.TenseTales.gameplay.wordOrder.tokenize, attempts);
      showFeedback('hint', hint.title, hint.body);
      els['wo-answer'].classList.remove('is-wrong'); void els['wo-answer'].offsetWidth; els['wo-answer'].classList.add('is-wrong');
      return;
    }
    window.TenseTales.utils.audioManager.tone('correct');
    if (window.TenseTales.gameplay.appFlow.shouldSaveProgress()) {
      window.TenseTales.gameplay.progressStore.unlock(tense, 'wordOrder', story.level);
      window.TenseTales.gameplay.masteryStore.record(tense, 'wordOrder', story.level, attempts);
    }
    window.TenseTales.gameplay.appFlow.finishActivity(attempts);
    renderLearningSummary();
    els['wo-next'].hidden = story.level === 5;
    els['wo-gameplay'].hidden = true;
    els['wo-complete'].hidden = false;
    requestAnimationFrame(() => { const heading = els['wo-complete'].querySelector('h1'); heading.tabIndex = -1; heading.focus(); });
    playCompletedSentence();
  }

  function playCompletedSentence() {
    window.TenseTales.utils.sceneMotion.playDom(els['wo-complete-picture'], challengePanel);
    return window.TenseTales.utils.audioManager.speak(sentenceForChallenge());
  }

  function open(storyId, selectedTense) {
    cache();
    story = window.TenseTales.data.stories[storyId];
    tense = selectedTense;
    window.TenseTales.gameplay.appFlow.state.screen = 'wordOrder';
    document.querySelectorAll('body > main, #game-root, #story-order-shell').forEach((el) => { el.hidden = true; });
    els['word-order-shell'].hidden = false;
    els['wo-level-label'].textContent = `Level ${story.level} of 5`;
    els['wo-tense-chip'].textContent = tense === 'pastSimple' ? 'Past' : 'Present';
    window.TenseTales.gameplay.appFlow.placeSoundControls(els['word-order-shell']);
    els['wo-context'].textContent = tense === 'pastSimple' ? 'YESTERDAY' : 'EVERY DAY';
    els['wo-story-title'].textContent = story.title;
    challengePanel = story.panels.find((panel) => panel.id === story.wordChallenge.panelId);
    renderPicture(challengePanel);
    els['wo-complete-picture'].textContent = '';
    els['wo-complete-picture'].setAttribute('aria-label', `Picture from ${story.title}`);
    window.TenseTales.utils.sceneComposition.renderDom(els['wo-complete-picture'], challengePanel.scene, window.TenseTales.data.assetCatalog);
    reset();
    if (window.TenseTales.gameplay.appFlow.assistance() === 'guided') window.TenseTales.utils.audioManager.speak('Tap or drag the words into the correct order.');
  }

  document.addEventListener('DOMContentLoaded', () => {
    cache();
    bindDropZone(els['wo-answer'], true);
    bindDropZone(els['wo-bank'], false);
    els['wo-check'].addEventListener('click', check);
    els['wo-listen'].addEventListener('click', playCompletedSentence);
    els['wo-back'].addEventListener('click', () => { window.TenseTales.utils.audioManager.stopNarration(); window.TenseTales.gameplay.appFlow.exitGameplay(); });
    els['wo-next'].addEventListener('click', () => window.TenseTales.gameplay.appFlow.openNext());
    els['wo-replay'].addEventListener('click', reset);
    els['wo-levels'].addEventListener('click', () => window.TenseTales.gameplay.appFlow.exitGameplay());
  });

  window.TenseTales.gameplay.openWordOrderPage = open;
})();

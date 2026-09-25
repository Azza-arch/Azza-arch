(function () {
  let story;
  let tense;
  let expected = [];
  let tokens = [];
  let orderedIds = [];
  let draggedId = null;
  const els = {};

  function cache() {
    ['word-order-shell', 'wo-back', 'wo-level-label', 'wo-tense-chip', 'wo-context', 'wo-story-title', 'wo-picture', 'wo-gameplay', 'wo-answer', 'wo-empty', 'wo-bank', 'wo-feedback', 'wo-check', 'wo-complete', 'wo-final-sentence', 'wo-next', 'wo-replay', 'wo-levels'].forEach((id) => { els[id] = document.getElementById(id); });
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
    button.addEventListener('click', () => toggleToken(token.id));
    button.addEventListener('dragstart', () => { draggedId = token.id; button.classList.add('is-dragging'); });
    button.addEventListener('dragend', () => { draggedId = null; button.classList.remove('is-dragging'); });
    return button;
  }

  function toggleToken(id) {
    els['wo-feedback'].textContent = '';
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
    const sentence = sentenceForChallenge();
    expected = window.TenseTales.gameplay.wordOrder.tokenize(sentence);
    const shuffled = window.TenseTales.gameplay.wordOrder.shuffled(expected);
    tokens = shuffled.map((word, index) => ({ id: `word-${index}`, word }));
    orderedIds = [];
    els['wo-feedback'].textContent = '';
    els['wo-complete'].hidden = true;
    els['wo-gameplay'].hidden = false;
    renderTokens();
  }

  function check() {
    const words = orderedIds.map((id) => tokens.find((token) => token.id === id).word);
    if (words.length !== expected.length) { els['wo-feedback'].textContent = 'Use every word before checking.'; return; }
    if (!window.TenseTales.gameplay.wordOrder.isCorrect(words, expected)) {
      els['wo-feedback'].textContent = 'Not quite. Read the picture and try a different order.';
      els['wo-answer'].classList.remove('is-wrong'); void els['wo-answer'].offsetWidth; els['wo-answer'].classList.add('is-wrong');
      return;
    }
    window.TenseTales.gameplay.progressStore.unlock(tense, 'wordOrder', story.level);
    els['wo-final-sentence'].textContent = sentenceForChallenge();
    els['wo-next'].hidden = story.level === 5;
    els['wo-gameplay'].hidden = true;
    els['wo-complete'].hidden = false;
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
    els['wo-context'].textContent = tense === 'pastSimple' ? 'YESTERDAY' : 'EVERY DAY';
    els['wo-story-title'].textContent = story.title;
    renderPicture(story.panels.find((panel) => panel.id === story.wordChallenge.panelId));
    reset();
  }

  document.addEventListener('DOMContentLoaded', () => {
    cache();
    bindDropZone(els['wo-answer'], true);
    bindDropZone(els['wo-bank'], false);
    els['wo-check'].addEventListener('click', check);
    els['wo-back'].addEventListener('click', () => window.TenseTales.gameplay.appFlow.showLevelMap());
    els['wo-next'].addEventListener('click', () => window.TenseTales.gameplay.appFlow.openNext());
    els['wo-replay'].addEventListener('click', reset);
    els['wo-levels'].addEventListener('click', () => window.TenseTales.gameplay.appFlow.showLevelMap());
  });

  window.TenseTales.gameplay.openWordOrderPage = open;
})();

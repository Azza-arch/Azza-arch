// Phase 3.1 — page controller for the responsive Story Order screen.
//
// This is the DOM <-> Phaser bridge: it owns a small, separate Phaser.Game
// instance (distinct from the main phone-shaped legacy game in #game-root)
// sized to fit a normal HTML page layout, and wires the HTML chrome
// (header, context badge, question, feedback, instruction, buttons,
// completion recap) to the StoryOrderGridScene's imperative API.
//
// Nothing here touches gameplay logic (shuffle/swap/validation/hints/
// grammar) — it only decides how the page looks and forwards clicks.

(function () {
  const els = {};
  let grid = null; // the mini Phaser.Game instance
  let scene = null; // its StoryOrderGridScene instance
  let currentStory = null;
  let currentTense = 'pastSimple';
  let resizeObserver = null;
  let stageMode = 'gameplay'; // 'gameplay' (2x2 grid) or 'completion' (1x4 mini row)
  let narrationRun = 0;

  function cacheEls() {
    els.gameRoot = document.getElementById('game-root');
    els.homeShell = document.getElementById('home-shell');
    els.shell = document.getElementById('story-order-shell');
    els.back = document.getElementById('so-back');
    els.title = document.getElementById('so-title');
    els.contextBadge = document.querySelector('#so-context-block .so-context-badge');
    els.storyName = document.getElementById('so-story-name');
    els.progress = document.getElementById('so-progress');
    els.contextBlock = document.getElementById('so-context-block');
    els.completionHeading = document.getElementById('so-completion-heading');
    els.feedbackTitle = document.getElementById('so-feedback-title');
    els.feedbackBody = document.getElementById('so-feedback-body');
    els.feedback = document.getElementById('so-feedback');
    els.canvasMount = document.getElementById('so-canvas-mount');
    els.instruction = document.getElementById('so-instruction');
    els.gameplayActions = document.getElementById('so-gameplay-actions');
    els.check = document.getElementById('so-check');
    els.continueBtn = document.getElementById('so-continue');
    els.completionBlock = document.getElementById('so-completion-block');
    els.recap = document.getElementById('so-recap');
    els.tenseCompare = document.getElementById('so-tense-compare');
    els.playAgain = document.getElementById('so-play-again');
    els.readStory = document.getElementById('so-read-story');
    els.nextLevel = document.getElementById('so-next-level');
    els.backMenu = document.getElementById('so-back-menu');
    els.dots = Array.prototype.slice.call(document.querySelectorAll('#so-progress .so-dot'));
    els.keyboardSlots = document.getElementById('so-keyboard-slots');
    els.slotStatus = document.getElementById('so-slot-status');
  }

  function setProgress(filledCount) {
    els.dots.forEach((dot, i) => dot.classList.toggle('is-filled', i < filledCount));
  }

  // Mirrors StoryOrderGridScene.computeLayout()'s card sizing so the HTML
  // mount is given a matching height up front (avoids a 0-height canvas
  // before the scene runs, and avoids a layout jump on first paint).
  function computeGameplayStageHeight(width) {
    const gap = Phaser.Math.Clamp(width * 0.035, 14, 28);
    const cardWidth = Phaser.Math.Clamp((width - gap * 3) / 2, 140, 340);
    const cardHeight = cardWidth * 0.72;
    return Math.round(cardHeight * 2 + gap * 3);
  }

  // Mirrors StoryOrderGridScene.layoutCompletionCards()'s mini-card sizing
  // so the mount shrinks to a single short row instead of keeping the full
  // 2x2 grid height (which left a large empty gap above the recap text).
  function computeCompletionStageHeight(width) {
    const count = 4;
    const gap = Phaser.Math.Clamp(width * 0.02, 8, 16);
    const miniWidth = Phaser.Math.Clamp((width - gap * (count + 1)) / count, 70, 150);
    const miniHeight = miniWidth * 0.85;
    return Math.round(miniHeight * 1.2);
  }

  function sizeMount() {
    const width = Math.max(1, Math.round(els.canvasMount.clientWidth || els.shell.clientWidth));
    const height = stageMode === 'completion'
      ? computeCompletionStageHeight(width)
      : computeGameplayStageHeight(width);
    els.canvasMount.style.height = height + 'px';
    return { width, height };
  }

  function createGame(storyId) {
    const { width, height } = sizeMount();

    grid = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'so-canvas-mount',
      backgroundColor: '#ffffff',
      width,
      height,
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'so-canvas-mount',
        expandParent: false,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      // A bare class in the scene array auto-starts, same pattern already
      // used for BootScene/MenuScene/GameScene/SentenceScene in the main
      // game config. grid.scene.keys isn't populated until the Game's
      // 'ready' event, so we wait for that before wiring the page to it.
      scene: [StoryOrderGridScene],
    });

    grid.events.once(Phaser.Core.Events.READY, () => {
      scene = grid.scene.keys.StoryOrderGridScene;
      scene.events.once('grid-ready', onGridReady);
      // Restart with the requested story id (auto-start already ran once
      // with no data, defaulting to 'climbing-the-tree' via init()).
      scene.scene.restart({ storyId });
    });
  }

  function onGridReady() {
    scene.events.on('state', onStateChanged);
    renderKeyboardSlots();
  }

  function onStateChanged() {
    // Clearing feedback text is the only page-level reaction to a swap;
    // correctness itself is only surfaced by Check Story.
    clearFeedback();
    window.TenseTales.utils.audioManager.tone('move');
    renderKeyboardSlots();
  }

  function renderKeyboardSlots() {
    if (!scene || !els.keyboardSlots) return;
    const state = scene.getState();
    const focused = document.activeElement && document.activeElement.dataset.slotIndex;
    els.keyboardSlots.textContent = '';
    state.orderedPanelIds.forEach((id, index) => {
      const panel = currentStory.panels.find((item) => item.id === id);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'so-slot-button'; button.dataset.slotIndex = String(index);
      button.setAttribute('aria-pressed', String(state.selectedSlot === index)); button.textContent = `Slot ${index + 1}: ${panel.actionLabel}`;
      button.addEventListener('click', () => { scene.handleTapSlot(index); els.slotStatus.textContent = `Selected slot ${index + 1}. Select another slot to swap pictures.`; });
      els.keyboardSlots.appendChild(button);
    });
    if (focused != null) { const next = els.keyboardSlots.querySelector(`[data-slot-index="${focused}"]`); if (next) next.focus(); }
  }

  function clearFeedback() {
    els.feedback.hidden = true;
    els.feedback.className = 'learning-feedback';
    els.feedbackTitle.textContent = '';
    els.feedbackBody.textContent = '';
  }

  function showFeedback(kind, title, body) {
    els.feedback.hidden = false;
    els.feedback.className = `learning-feedback is-${kind}`;
    els.feedbackTitle.textContent = title;
    els.feedbackBody.textContent = body;
  }

  function appendMarkedSentence(container, parts) {
    const line = document.createElement('p');
    line.className = 'marked-sentence';
    const subjectText = typeof parts.subject === 'string' ? parts.subject : parts.subject.text;
    const subject = document.createElement('mark');
    subject.className = 'grammar-subject';
    subject.textContent = subjectText;
    const verb = document.createElement('mark');
    verb.className = 'grammar-verb';
    verb.textContent = parts.verb;
    const sentence = parts.sentence;
    const subjectStart = sentence.indexOf(subjectText);
    const verbStart = sentence.indexOf(parts.verb, subjectStart + subjectText.length);
    if (subjectStart > 0) line.append(document.createTextNode(sentence.slice(0, subjectStart)));
    line.append(subject, document.createTextNode(sentence.slice(subjectStart + subjectText.length, verbStart)), verb, document.createTextNode(sentence.slice(verbStart + parts.verb.length)));
    container.appendChild(line);
  }

  function renderComparison(container, panel) {
    const comparison = window.TenseTales.gameplay.learningFeedback.comparison(panel, currentTense);
    container.textContent = '';
    [comparison.selected, comparison.other].forEach((parts) => {
      const column = document.createElement('div');
      const label = document.createElement('span');
      label.className = 'tense-compare-label';
      label.textContent = parts.timeLabel;
      column.appendChild(label);
      appendMarkedSentence(column, parts);
      container.appendChild(column);
    });
  }

  function resetGameplayPanel() {
    els.contextBlock.hidden = false;
    els.completionHeading.hidden = true;
    els.instruction.hidden = false;
    els.gameplayActions.hidden = false;
    els.completionBlock.hidden = true;
    els.check.hidden = false;
    els.continueBtn.hidden = true;
    clearFeedback();
    setProgress(0);
  }

  function handleCheck() {
    if (!scene) return;
    const result = scene.check();
    if (!result) return;

    if (result.correct) {
      window.TenseTales.utils.audioManager.tone('correct');
      showFeedback('correct', 'The story is in the right order.', 'Now read how each action changes with time.');
      els.check.hidden = true;
      els.continueBtn.hidden = false;
      setProgress(4);
    } else {
      window.TenseTales.utils.audioManager.tone('retry');
      const hint = window.TenseTales.gameplay.learningFeedback.storyHint(currentStory, result.attempts);
      showFeedback('hint', hint.title, hint.body);
    }
  }

  function handleContinue() {
    stageMode = 'completion';
    const { width, height } = sizeMount();
    grid.scale.resize(width, height);
    scene.showCompletion();

    els.contextBlock.hidden = true;
    els.completionHeading.hidden = false;
    els.instruction.hidden = true;
    els.gameplayActions.hidden = true;
    els.completionBlock.hidden = false;

    const sentences = window.TenseTales.grammar.sentenceBuilder.buildStorySentences(currentStory, currentTense);
    els.recap.textContent = '';
    sentences.forEach((parts) => appendMarkedSentence(els.recap, Object.assign({ tense: currentTense }, parts)));
    renderComparison(els.tenseCompare, currentStory.wordChallenge);
    const attempts = scene.getState().attempts;
    if (window.TenseTales.gameplay.appFlow.shouldSaveProgress()) {
      window.TenseTales.gameplay.progressStore.unlock(currentTense, 'storyOrder', currentStory.level);
      window.TenseTales.gameplay.masteryStore.record(currentTense, 'storyOrder', currentStory.level, attempts);
    }
    window.TenseTales.gameplay.appFlow.finishActivity(attempts);
    els.nextLevel.hidden = currentStory.level === 5;
    readStoryAloud();
    requestAnimationFrame(() => { els.completionHeading.tabIndex = -1; els.completionHeading.focus(); });
  }

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function readStoryAloud() {
    const run = ++narrationRun;
    window.TenseTales.utils.audioManager.stopNarration();
    const sentences = window.TenseTales.grammar.sentenceBuilder.buildStorySentences(currentStory, currentTense);
    els.readStory.disabled = true;
    els.readStory.textContent = 'Reading…';
    for (let i = 0; i < sentences.length && run === narrationRun; i += 1) {
      scene.focusCompletionStep(i);
      scene.playCompletionAction(i);
      const spoken = await window.TenseTales.utils.audioManager.speak(sentences[i].sentence);
      if (!spoken) await wait(720);
      else await wait(120);
    }
    if (run === narrationRun) {
      scene.clearCompletionFocus();
      els.readStory.disabled = false;
      els.readStory.textContent = 'Read Story';
    }
  }

  function handlePlayAgain() {
    narrationRun += 1;
    window.TenseTales.utils.audioManager.stopNarration();
    stageMode = 'gameplay';
    const { width, height } = sizeMount();
    grid.scale.resize(width, height);
    scene.playAgain();
    resetGameplayPanel();
  }

  function closePage() {
    narrationRun += 1;
    window.TenseTales.utils.audioManager.stopNarration();
    els.shell.hidden = true;
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (grid) {
      grid.destroy(true);
      grid = null;
      scene = null;
    }
    window.TenseTales.gameplay.appFlow.exitGameplay();
  }

  function bindOnce() {
    if (els.check.dataset.bound) return;
    els.back.addEventListener('click', closePage);
    els.backMenu.addEventListener('click', closePage);
    els.check.addEventListener('click', handleCheck);
    els.continueBtn.addEventListener('click', handleContinue);
    els.playAgain.addEventListener('click', handlePlayAgain);
    els.readStory.addEventListener('click', readStoryAloud);
    els.nextLevel.addEventListener('click', () => {
      closeGrid();
      window.TenseTales.gameplay.appFlow.openNext();
    });
    els.check.dataset.bound = 'true';
  }

  function closeGrid() {
    narrationRun += 1;
    window.TenseTales.utils.audioManager.stopNarration();
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    if (grid) { grid.destroy(true); grid = null; scene = null; }
    els.shell.hidden = true;
  }

  function watchResize() {
    if (typeof ResizeObserver === 'undefined') return;
    resizeObserver = new ResizeObserver(() => {
      if (!grid) return;
      const { width, height } = sizeMount();
      grid.scale.resize(width, height);
    });
    resizeObserver.observe(els.canvasMount);
    resizeObserver.observe(els.shell);
  }

  function openStoryOrderPage(storyId, tense) {
    cacheEls();
    currentStory = window.TenseTales.data.stories[storyId];
    currentTense = tense || 'pastSimple';
    stageMode = 'gameplay';

    els.title.textContent = `Level ${currentStory.level} of 5`;
    els.storyName.textContent = currentStory.title;
    els.contextBadge.textContent = currentTense === 'pastSimple' ? 'YESTERDAY' : 'EVERY DAY';
    document.getElementById('so-question').textContent = currentTense === 'pastSimple' ? 'What happened?' : 'What happens?';
    resetGameplayPanel();
    bindOnce();

    els.gameRoot.hidden = true;
    els.homeShell.hidden = true;
    document.getElementById('menu-shell').hidden = true;
    document.getElementById('word-order-shell').hidden = true;
    window.TenseTales.gameplay.appFlow.state.screen = 'storyOrder';
    els.shell.hidden = false;
    window.TenseTales.gameplay.appFlow.placeSoundControls(els.shell);

    createGame(storyId);
    watchResize();
    const assistance = window.TenseTales.gameplay.appFlow.assistance();
    if (assistance === 'guided') window.TenseTales.utils.audioManager.speak('The pictures start mixed up. Move them into the correct story order.');
  }

  window.TenseTales.gameplay.openStoryOrderPage = openStoryOrderPage;
})();

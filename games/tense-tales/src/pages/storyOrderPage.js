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
    els.canvasMount = document.getElementById('so-canvas-mount');
    els.instruction = document.getElementById('so-instruction');
    els.gameplayActions = document.getElementById('so-gameplay-actions');
    els.check = document.getElementById('so-check');
    els.continueBtn = document.getElementById('so-continue');
    els.completionBlock = document.getElementById('so-completion-block');
    els.recap = document.getElementById('so-recap');
    els.playAgain = document.getElementById('so-play-again');
    els.nextLevel = document.getElementById('so-next-level');
    els.backMenu = document.getElementById('so-back-menu');
    els.dots = Array.prototype.slice.call(document.querySelectorAll('#so-progress .so-dot'));
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
    const width = Math.max(280, Math.round(els.canvasMount.clientWidth || els.shell.clientWidth));
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
  }

  function onStateChanged() {
    // Clearing feedback text is the only page-level reaction to a swap;
    // correctness itself is only surfaced by Check Story.
    els.feedbackTitle.textContent = '';
    els.feedbackTitle.className = 'so-feedback-title';
    els.feedbackBody.textContent = '';
  }

  function resetGameplayPanel() {
    els.contextBlock.hidden = false;
    els.completionHeading.hidden = true;
    els.instruction.hidden = false;
    els.gameplayActions.hidden = false;
    els.completionBlock.hidden = true;
    els.check.hidden = false;
    els.continueBtn.hidden = true;
    els.feedbackTitle.textContent = '';
    els.feedbackTitle.className = 'so-feedback-title';
    els.feedbackBody.textContent = '';
    setProgress(0);
  }

  function handleCheck() {
    if (!scene) return;
    const result = scene.check();
    if (!result) return;

    if (result.correct) {
      els.feedbackTitle.textContent = 'Nice! The story is in the right order.';
      els.feedbackTitle.className = 'so-feedback-title so-feedback-correct';
      els.feedbackBody.textContent = '';
      els.check.hidden = true;
      els.continueBtn.hidden = false;
      setProgress(4);
    } else {
      els.feedbackTitle.textContent = 'Not quite.';
      els.feedbackTitle.className = 'so-feedback-title so-feedback-incorrect';
      els.feedbackBody.textContent = result.showHint
        ? currentStory.hints.secondAttempt
        : 'Look at what happened first.';
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

    const sentences = window.TenseTales.grammar.sentenceBuilder
      .buildStorySentences(currentStory, currentTense)
      .map((s) => s.sentence);
    els.recap.textContent = sentences.join('\n');
    window.TenseTales.gameplay.progressStore.unlock(currentTense, 'storyOrder', currentStory.level);
    els.nextLevel.hidden = currentStory.level === 5;
  }

  function handlePlayAgain() {
    stageMode = 'gameplay';
    const { width, height } = sizeMount();
    grid.scale.resize(width, height);
    scene.playAgain();
    resetGameplayPanel();
  }

  function closePage() {
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
    window.TenseTales.gameplay.appFlow.showLevelMap();
  }

  function bindOnce() {
    if (els.check.dataset.bound) return;
    els.back.addEventListener('click', closePage);
    els.backMenu.addEventListener('click', closePage);
    els.check.addEventListener('click', handleCheck);
    els.continueBtn.addEventListener('click', handleContinue);
    els.playAgain.addEventListener('click', handlePlayAgain);
    els.nextLevel.addEventListener('click', () => {
      closeGrid();
      window.TenseTales.gameplay.appFlow.openNext();
    });
    els.check.dataset.bound = 'true';
  }

  function closeGrid() {
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

    createGame(storyId);
    watchResize();
  }

  window.TenseTales.gameplay.openStoryOrderPage = openStoryOrderPage;
})();

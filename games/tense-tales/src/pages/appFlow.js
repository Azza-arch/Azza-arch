(function () {
  const STORY_IDS = ['climbing-the-tree', 'reading-under-the-tree', 'the-new-phone', 'getting-ready', 'doing-homework'];
  const state = { screen: 'home', tense: null, mode: null, level: 1 };
  const titles = { presentSimple: 'Present', pastSimple: 'Past', storyOrder: 'Order the Story', wordOrder: 'Build the Sentence' };
  const shells = ['home-shell', 'menu-shell', 'story-order-shell', 'word-order-shell', 'game-root'];

  function hideAll() { shells.forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = true; }); }
  function showShell(id) { hideAll(); document.getElementById(id).hidden = false; }

  function showHome() { state.screen = 'home'; showShell('home-shell'); }

  function showTenseSelect() {
    state.screen = 'tense';
    showShell('menu-shell');
    document.getElementById('tense-screen').hidden = false;
    document.getElementById('game-screen').hidden = true;
    document.getElementById('level-screen').hidden = true;
  }

  function showGameSelect(tense) {
    state.tense = tense || state.tense;
    state.screen = 'game';
    showShell('menu-shell');
    document.getElementById('tense-screen').hidden = true;
    document.getElementById('game-screen').hidden = false;
    document.getElementById('level-screen').hidden = true;
    document.getElementById('game-tense-label').textContent = `${titles[state.tense]} Simple`;
  }

  function renderLevels() {
    const progress = window.TenseTales.gameplay.progressStore.load();
    const unlocked = progress[state.tense][state.mode];
    const grid = document.getElementById('level-grid');
    grid.textContent = '';
    STORY_IDS.forEach((storyId, index) => {
      const story = window.TenseTales.data.stories[storyId];
      const level = index + 1;
      const locked = level > unlocked;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `level-button${locked ? ' is-locked' : ''}${level < unlocked ? ' is-complete' : ''}`;
      button.disabled = locked;
      button.innerHTML = `<span class="level-number">${level}</span><strong>${story.title}</strong><small>${locked ? 'Locked' : (level < unlocked ? 'Complete' : 'Ready')}</small>`;
      button.addEventListener('click', () => openLevel(level));
      grid.appendChild(button);
    });
  }

  function showLevelMap(mode) {
    state.mode = mode || state.mode;
    state.screen = 'levels';
    showShell('menu-shell');
    document.getElementById('tense-screen').hidden = true;
    document.getElementById('game-screen').hidden = true;
    document.getElementById('level-screen').hidden = false;
    document.getElementById('level-context').textContent = `${titles[state.tense]} Simple · ${titles[state.mode]}`;
    renderLevels();
  }

  function openLevel(level) {
    state.level = level;
    const storyId = STORY_IDS[level - 1];
    if (state.mode === 'wordOrder') window.TenseTales.gameplay.openWordOrderPage(storyId, state.tense);
    else window.TenseTales.gameplay.openStoryOrderPage(storyId, state.tense);
  }

  function openNext() {
    if (state.level < 5) openLevel(state.level + 1);
    else showLevelMap();
  }

  function handleBack() {
    if (state.screen === 'tense') showHome();
    else if (state.screen === 'game') showTenseSelect();
    else if (state.screen === 'levels') showGameSelect();
  }

  function bind() {
    document.getElementById('home-play').addEventListener('click', showTenseSelect);
    document.getElementById('flow-back').addEventListener('click', handleBack);
    document.querySelectorAll('[data-tense]').forEach((button) => button.addEventListener('click', () => showGameSelect(button.dataset.tense)));
    document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => showLevelMap(button.dataset.mode)));
  }

  window.TenseTales.gameplay.appFlow = { state, STORY_IDS, bind, showHome, showTenseSelect, showGameSelect, showLevelMap, openLevel, openNext };
})();

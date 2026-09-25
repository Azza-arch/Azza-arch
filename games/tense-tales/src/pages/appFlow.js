(function () {
  const STORY_IDS = ['climbing-the-tree', 'reading-under-the-tree', 'the-new-phone', 'getting-ready', 'doing-homework'];
  const state = { screen: 'home', tense: null, mode: null, level: 1, teacherSession: { active: false, saveProgress: false, assistance: null } };
  const titles = { presentSimple: 'Present', pastSimple: 'Past', storyOrder: 'Order the Story', wordOrder: 'Build the Sentence' };
  const shells = ['home-shell', 'menu-shell', 'story-order-shell', 'word-order-shell', 'practice-shell', 'game-root'];

  function hideAll() { shells.forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = true; }); }
  function focusScreen(id) { requestAnimationFrame(() => { const root = document.getElementById(id); const heading = root && root.querySelector('h1'); if (heading) { heading.tabIndex = -1; heading.focus(); } }); }
  function placeSoundControls(root) { const controls = document.querySelector('.sound-controls'); const header = root.querySelector('.flow-header, .so-header'); const target = header ? header.lastElementChild : (root.querySelector('.home-copy') || root); target.appendChild(controls); }
  function showShell(id) { hideAll(); const root = document.getElementById(id); root.hidden = false; placeSoundControls(root); focusScreen(id); }

  function showHome() { state.screen = 'home'; state.teacherSession.active = false; showShell('home-shell'); }

  function showTenseSelect() {
    state.screen = 'tense';
    showShell('menu-shell');
    document.getElementById('tense-screen').hidden = false;
    document.getElementById('game-screen').hidden = true;
    document.getElementById('level-screen').hidden = true;
    document.getElementById('teacher-screen').hidden = true;
  }

  function showGameSelect(tense) {
    state.tense = tense || state.tense;
    state.screen = 'game';
    showShell('menu-shell');
    document.getElementById('tense-screen').hidden = true;
    document.getElementById('game-screen').hidden = false;
    document.getElementById('level-screen').hidden = true;
    document.getElementById('teacher-screen').hidden = true;
    document.getElementById('game-tense-label').textContent = `${titles[state.tense]} Simple`;
  }

  function renderLevels() {
    const progress = window.TenseTales.gameplay.progressStore.load();
    const mastery = window.TenseTales.gameplay.masteryStore.load();
    const unlocked = progress[state.tense][state.mode];
    const grid = document.getElementById('level-grid');
    grid.textContent = '';
    STORY_IDS.forEach((storyId, index) => {
      const story = window.TenseTales.data.stories[storyId];
      const level = index + 1;
      const locked = level > unlocked;
      const learning = mastery[state.tense][state.mode][level];
      const status = locked ? 'Locked' : learning
        ? (learning.mastered ? 'Mastered' : 'Practising')
        : (level < unlocked ? 'Complete' : 'Ready');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `level-button${locked ? ' is-locked' : ''}${level < unlocked ? ' is-complete' : ''}${learning && learning.mastered ? ' is-mastered' : ''}${learning && !learning.mastered ? ' is-practising' : ''}`;
      button.disabled = locked;
      button.innerHTML = `<span class="level-number">${level}</span><strong>${story.title}</strong><small>${status}</small>`;
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
    document.getElementById('teacher-screen').hidden = true;
    document.getElementById('level-context').textContent = `${titles[state.tense]} Simple · ${titles[state.mode]}`;
    renderLevels();
  }

  function showTeacherQuickLaunch() {
    state.screen = 'teacher'; showShell('menu-shell');
    document.getElementById('tense-screen').hidden = true; document.getElementById('game-screen').hidden = true; document.getElementById('level-screen').hidden = true; document.getElementById('teacher-screen').hidden = false;
    focusScreen('teacher-screen');
  }

  function startRecommended() {
    state.teacherSession.active = false;
    const pick = window.TenseTales.gameplay.learnerProfile.recommendation(window.TenseTales.gameplay.learnerProfile.load());
    state.tense = pick.tense; state.mode = pick.mode; state.level = pick.level; openLevel(pick.level);
  }

  function shouldSaveProgress() { return window.TenseTales.gameplay.sessionPolicy.shouldSaveProgress(state.teacherSession); }
  function assistance() { return window.TenseTales.gameplay.sessionPolicy.assistance(state.teacherSession,window.TenseTales.gameplay.learnerProfile.load()); }

  function finishActivity(attempts) {
    if (!shouldSaveProgress()) return;
    window.TenseTales.gameplay.learnerProfile.record({ firstTry: attempts === 0, errors: attempts, activity: { tense: state.tense, mode: state.mode, level: state.level } });
  }

  function exitGameplay() { if (state.teacherSession.active) showTeacherQuickLaunch(); else showLevelMap(); }

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
    if (state.screen === 'tense' || state.screen === 'teacher') showHome();
    else if (state.screen === 'game') showTenseSelect();
    else if (state.screen === 'levels') showGameSelect();
  }

  function bind() {
    document.getElementById('home-play').addEventListener('click', startRecommended);
    document.getElementById('home-explore').addEventListener('click', () => { state.teacherSession.active = false; showTenseSelect(); });
    document.getElementById('home-teacher').addEventListener('click', showTeacherQuickLaunch);
    document.getElementById('flow-back').addEventListener('click', handleBack);
    document.querySelectorAll('[data-tense]').forEach((button) => button.addEventListener('click', () => showGameSelect(button.dataset.tense)));
    document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => showLevelMap(button.dataset.mode)));
    document.getElementById('practice-entry').addEventListener('click', () => window.TenseTales.gameplay.openPracticePage(state.tense));
    document.getElementById('teacher-form').addEventListener('submit', (event) => {
      event.preventDefault(); state.tense = document.getElementById('teacher-tense').value; state.mode = document.getElementById('teacher-mode').value; state.level = Number(document.getElementById('teacher-level').value);
      state.teacherSession = { active: true, saveProgress: document.getElementById('teacher-save').checked, assistance: document.getElementById('teacher-assistance').value };
      openLevel(state.level);
    });
  }

  window.TenseTales.gameplay.appFlow = { state, STORY_IDS, bind, showHome, showTenseSelect, showGameSelect, showLevelMap, showTeacherQuickLaunch, startRecommended, shouldSaveProgress, assistance, finishActivity, exitGameplay, placeSoundControls, openLevel, openNext };
})();

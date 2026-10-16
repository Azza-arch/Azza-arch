document.addEventListener('DOMContentLoaded', () => {
  const audio = window.TenseTales.utils.audioManager;
  const soundToggle = document.getElementById('sound-toggle');
  const soundPopover = document.getElementById('sound-popover');
  const soundMute = document.getElementById('sound-mute');
  const soundClose = document.getElementById('sound-close');
  const soundVolume = document.getElementById('sound-volume');
  const isMobile = window.matchMedia('(max-width: 767px)');
  function setPopover(open, returnFocus) {
    soundPopover.hidden = !open;
    soundToggle.setAttribute('aria-expanded', String(open));
    if (open) soundMute.focus();
    if (!open && returnFocus) soundToggle.focus();
  }
  const renderSoundState = () => {
    const settings = audio.load();
    soundToggle.textContent = settings.muted ? 'Sound off' : 'Sound on';
    soundToggle.setAttribute('aria-pressed', String(settings.muted));
    soundMute.textContent = settings.muted ? 'Unmute sound' : 'Mute sound';
    soundMute.setAttribute('aria-pressed', String(settings.muted));
    soundVolume.value = String(Math.round(settings.volume * 100));
    soundVolume.disabled = settings.muted;
  };
  soundToggle.addEventListener('click', () => {
    if (isMobile.matches) setPopover(soundPopover.hidden);
    else { audio.toggleMuted(); renderSoundState(); if (!audio.load().muted) audio.tone('tap'); }
  });
  soundMute.addEventListener('click', () => { audio.toggleMuted(); renderSoundState(); if (!audio.load().muted) audio.tone('tap'); });
  soundClose.addEventListener('click', () => setPopover(false, true));
  document.addEventListener('pointerdown', (event) => {
    if (!soundPopover.hidden && !event.target.closest('.sound-controls')) setPopover(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !soundPopover.hidden) { event.preventDefault(); setPopover(false, true); }
  });
  isMobile.addEventListener('change', () => setPopover(false));
  soundVolume.addEventListener('input', () => {
    const settings = audio.load();
    settings.volume = Number(soundVolume.value) / 100;
    audio.save(settings);
  });
  soundVolume.addEventListener('change', () => audio.tone('tap'));
  document.addEventListener('click', (event) => {
    if (event.target.closest('button') && event.target !== soundToggle) audio.tone('tap');
  });
  renderSoundState();
  const params = new URLSearchParams(window.location.search);
  const debugGameplayRoute = params.get('debug') === '1';
  const storyOrderRoute = params.get('story-order');
  const wordOrderRoute = params.get('word-order');
  const routeTense = params.get('tense') === 'presentSimple' ? 'presentSimple' : 'pastSimple';
  const legacyRoute = params.get('legacy');
  const sceneAuditRoute = params.get('scene-audit');
  window.TenseTales.gameplay.appFlow.bind();
  window.TenseTales.utils.helpSupport.bind();
  if (sceneAuditRoute === '1') {
    window.TenseTales.gameplay.openSceneAudit();
  } else if (debugGameplayRoute && wordOrderRoute) {
    const story = window.TenseTales.data.stories[wordOrderRoute];
    window.TenseTales.gameplay.appFlow.state.tense = routeTense;
    window.TenseTales.gameplay.appFlow.state.mode = 'wordOrder';
    window.TenseTales.gameplay.appFlow.state.level = story ? story.level : 1;
    window.TenseTales.gameplay.openWordOrderPage(wordOrderRoute, routeTense);
  } else if (debugGameplayRoute && storyOrderRoute) {
    const story = window.TenseTales.data.stories[storyOrderRoute];
    window.TenseTales.gameplay.appFlow.state.tense = routeTense;
    window.TenseTales.gameplay.appFlow.state.mode = 'storyOrder';
    window.TenseTales.gameplay.appFlow.state.level = story ? story.level : 1;
    window.TenseTales.gameplay.openStoryOrderPage(storyOrderRoute, routeTense);
  } else if (legacyRoute === '1') {
    document.getElementById('home-shell').hidden = true;
    document.getElementById('game-root').hidden = false;
    window.game = new Phaser.Game(GameConfig);
  } else {
    window.TenseTales.gameplay.appFlow.showHome();
  }
});

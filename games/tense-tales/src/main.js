document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const debugGameplayRoute = params.get('debug') === '1';
  const storyOrderRoute = params.get('story-order');
  const wordOrderRoute = params.get('word-order');
  const routeTense = params.get('tense') === 'presentSimple' ? 'presentSimple' : 'pastSimple';
  const legacyRoute = params.get('legacy');
  const sceneAuditRoute = params.get('scene-audit');
  window.TenseTales.gameplay.appFlow.bind();
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
  }
});

// Game-wide config, kept separate from scene logic so it can be tuned
// without touching gameplay code.

const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

const GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#0e0f1a',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Portrait mobile first; FIT keeps the canvas from stretching
    // excessively wide on desktop.
    min: {
      width: GAME_WIDTH * 0.5,
      height: GAME_HEIGHT * 0.5,
    },
    max: {
      width: GAME_WIDTH * 1.5,
      height: GAME_HEIGHT * 1.5,
    },
  },
  scene: [BootScene, MenuScene, GameScene, SentenceScene],
};

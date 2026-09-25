class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.32, 'Tense Tales', {
        fontFamily: 'Georgia, serif',
        fontSize: '56px',
        color: '#f4f1ff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.32 + 60, 'Learn grammar through stories.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#a9a4c9',
      })
      .setOrigin(0.5);

    const playButton = this.add
      .rectangle(width / 2, height * 0.55, 220, 70, 0x6c5ce7)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.55, 'Play', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    playButton.on('pointerover', () => playButton.setFillStyle(0x7d6cf0));
    playButton.on('pointerout', () => playButton.setFillStyle(0x6c5ce7));
    playButton.on('pointerdown', () => this.scene.start('GameScene'));

    // Phase 3: additive entry point for the new Story Order gameplay
    // (new grammar/data/asset system). The primary "Play" button above
    // still goes to the legacy Missed-Bus GameScene, untouched.
    //
    // Phase 3.1: Story Order now lives on its own responsive HTML/CSS page
    // (see src/pages/storyOrderPage.js) rather than as a Phaser scene in
    // this fixed-resolution game, so this button hands off to that page
    // instead of calling this.scene.start(...).
    const newButton = this.add
      .rectangle(width / 2, height * 0.55 + 90, 260, 60, 0x2a2c40)
      .setStrokeStyle(2, 0x6c5ce7)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.55 + 90, 'New: Story Order', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#f4f1ff',
      })
      .setOrigin(0.5);

    newButton.on('pointerover', () => newButton.setFillStyle(0x3a3d57));
    newButton.on('pointerout', () => newButton.setFillStyle(0x2a2c40));
    newButton.on('pointerdown', () => window.TenseTales.gameplay.openStoryOrderPage('climbing-the-tree'));
  }
}

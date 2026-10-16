// A single draggable/tappable word or phrase pill used by SentenceBuilder.

const WordChipStyle = {
  bank: { bg: 0xfbf9ff, border: 0xd8ceff },
  placed: { bg: 0xece7ff, border: 0x6c5ce7 },
  correct: { bg: 0xcdf3d8, border: 0x4fae6d },
  incorrect: { bg: 0xffd9d6, border: 0xe0776f },
};

class WordChip extends Phaser.GameObjects.Container {
  constructor(scene, chunk) {
    super(scene, 0, 0);

    this.chunk = chunk;
    this.location = 'bank';
    this.dragHappened = false;

    const paddingX = 22;
    const paddingY = 14;

    this.label = scene.add.text(0, 0, chunk.text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#332e4d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.chipWidth = this.label.width + paddingX * 2;
    this.chipHeight = this.label.height + paddingY * 2;

    this.bg = scene.add.graphics();
    this.setStyle('bank');

    this.add([this.bg, this.label]);
    this.setSize(this.chipWidth, this.chipHeight);
    this.setInteractive({ useHandCursor: true });
    scene.input.setDraggable(this);

    this.on('pointerdown', () => { this.dragHappened = false; });
    this.on('dragstart', () => { this.dragHappened = true; });

    scene.add.existing(this);
  }

  setStyle(state) {
    const style = WordChipStyle[state] || WordChipStyle.bank;
    this.bg.clear();
    this.bg.fillStyle(style.bg, 1);
    this.bg.fillRoundedRect(-this.chipWidth / 2, -this.chipHeight / 2, this.chipWidth, this.chipHeight, this.chipHeight / 2);
    this.bg.lineStyle(3, style.border, 1);
    this.bg.strokeRoundedRect(-this.chipWidth / 2, -this.chipHeight / 2, this.chipWidth, this.chipHeight, this.chipHeight / 2);
  }

  refreshStyle() {
    this.setStyle(this.location === 'sentence' ? 'placed' : 'bank');
  }

  shake(reduced) {
    if (reduced) return;
    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 6,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.x = originalX; },
    });
  }
}

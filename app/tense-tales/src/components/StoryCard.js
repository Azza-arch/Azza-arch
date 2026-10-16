class StoryCard extends Phaser.GameObjects.Container {
  constructor(scene, panelData, size) {
    super(scene, 0, 0);

    this.panelData = panelData;
    this.cardSize = size;
    this.slotIndex = null;
    this.isSelected = false;
    this.dragHappened = false;
    this.baseScale = 1;

    this.frame = scene.add.image(0, 0, 'card-frame').setDisplaySize(size, size);
    this.icon = scene.add.image(0, -size * 0.1, panelData.iconKey).setDisplaySize(size * 0.46, size * 0.46);
    this.caption = scene.add.text(0, size * 0.3, panelData.caption, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${Math.round(size * 0.09)}px`,
      color: '#332e4d',
      align: 'center',
      wordWrap: { width: size * 0.82 },
    }).setOrigin(0.5);

    this.badge = scene.add.circle(-size * 0.36, -size * 0.36, size * 0.1, 0x6c5ce7);
    this.badgeText = scene.add.text(-size * 0.36, -size * 0.36, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${Math.round(size * 0.1)}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.frame, this.icon, this.caption, this.badge, this.badgeText]);

    this.setSize(size, size);
    this.setInteractive({ useHandCursor: true });
    scene.input.setDraggable(this);

    this.on('pointerdown', () => { this.dragHappened = false; });
    this.on('dragstart', () => { this.dragHappened = true; });

    scene.add.existing(this);
  }

  setSlotNumber(n) {
    this.badgeText.setText(String(n));
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.frame.setTint(selected ? 0xd8ceff : 0xffffff);
  }

  playCorrectPulse(reduced) {
    this.frame.setTint(0xcdf3d8);
    const delay = reduced ? 0 : 450;
    this.scene.time.delayedCall(delay, () => {
      if (this.frame && this.frame.active) this.frame.clearTint();
    });
  }

  playIncorrectPulse(reduced) {
    this.frame.setTint(0xffd9d6);
    const delay = reduced ? 0 : 450;
    this.scene.time.delayedCall(delay, () => {
      if (this.frame && this.frame.active) this.frame.clearTint();
    });
  }

  shake(reduced) {
    if (reduced) return;
    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 8,
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => { this.x = originalX; },
    });
  }
}

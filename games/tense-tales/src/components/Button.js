class UIButton extends Phaser.GameObjects.Container {
  constructor(scene, {
    width,
    height,
    label,
    fontSize = 22,
    bgColor = 0x6c5ce7,
    hoverColor = 0x7d6cf0,
    textColor = '#ffffff',
    radius = 16,
  }) {
    super(scene, 0, 0);

    this.buttonWidth = width;
    this.buttonHeight = height;
    this.bgColor = bgColor;
    this.hoverColor = hoverColor;
    this.radius = radius;

    this.bg = scene.add.graphics();
    this.drawBackground(bgColor);

    this.label = scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => this.drawBackground(this.hoverColor));
    this.on('pointerout', () => this.drawBackground(this.bgColor));

    scene.add.existing(this);
  }

  drawBackground(color) {
    this.bg.clear();
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight, this.radius);
  }
}

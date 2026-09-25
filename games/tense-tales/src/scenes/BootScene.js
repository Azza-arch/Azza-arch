class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.drawLoadingBar(0);

    this.load.on('progress', (value) => this.drawLoadingBar(value));

    AssetManifest.images.forEach(({ key, path }) => this.load.image(key, path));
    AssetManifest.spritesheets.forEach(({ key, path, frameConfig }) =>
      this.load.spritesheet(key, path, frameConfig)
    );
    AssetManifest.audio.forEach(({ key, path }) => this.load.audio(key, path));
  }

  create() {
    this.scene.start('MenuScene');
  }

  drawLoadingBar(progress) {
    const { width, height } = this.scale;

    if (!this.loadingBox) {
      this.loadingBox = this.add.graphics();
    }

    this.loadingBox.clear();
    this.loadingBox.fillStyle(0x1c1e2e, 1);
    this.loadingBox.fillRect(width / 2 - 150, height / 2 - 10, 300, 20);
    this.loadingBox.fillStyle(0x6c5ce7, 1);
    this.loadingBox.fillRect(width / 2 - 145, height / 2 - 5, 290 * progress, 10);
  }
}

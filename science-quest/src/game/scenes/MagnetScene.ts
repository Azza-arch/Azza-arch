
import Phaser from 'phaser';

export class MagnetScene extends Phaser.Scene {
  constructor() {
    super('MagnetScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#EAF8FF');

    // Ground
    const ground = this.add.rectangle(
      width / 2,
      height - 40,
      width,
      80,
      0x8bd17c,
    );

    ground.setDepth(1);

    // Title
    this.add.text(width / 2, 45, 'MAGNET & FORCE', {
      fontSize: '32px',
      color: '#17345C',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Instruction
    this.add.text(width / 2, 90, 'Explore the power of magnets!', {
      fontSize: '18px',
      color: '#42627E',
    }).setOrigin(0.5);

    // Magnet placeholder
    this.add.circle(
      width / 2,
      height / 2,
      55,
      0x18b6c9,
    );

    this.add.text(width / 2, height / 2, 'U', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}

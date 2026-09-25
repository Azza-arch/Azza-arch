const TENSE_ORDER = ['pastSimple', 'presentSimple', 'futureSimple'];

class SentenceScene extends Phaser.Scene {
  constructor() {
    super('SentenceScene');
  }

  init(data) {
    this.storyId = (data && data.storyId) || 'story-01';
    const story = StoryData[this.storyId];
    this.tense = (data && data.tense) || story.tense;
  }

  create() {
    ensurePlaceholderAssets(this);

    this.reduced = prefersReducedMotion();
    this.story = StoryData[this.storyId];
    this.panelIndex = 0;

    const { width } = this.scale;
    const cx = width / 2;

    this.buildTopBar(cx);
    this.buildPictureArea(cx);

    this.builder = new SentenceBuilder(this, {
      originX: cx,
      originY: 400,
      width: 580,
      reduced: this.reduced,
      onSolved: () => this.advance(),
    });

    this.loadPanel(0);
  }

  buildTopBar(cx) {
    const backButton = new UIButton(this, {
      width: 120,
      height: 56,
      label: 'Back',
      bgColor: 0x2a2c40,
      hoverColor: 0x3a3d57,
    });
    backButton.setPosition(100, 70);
    backButton.on('pointerdown', () => this.scene.start('MenuScene'));

    this.progressLabel = this.add.text(cx, 70, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f4f1ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.modeBadge = this.add.text(cx + 220, 70, this.story.timeModes[this.tense].label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#6c5ce7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  buildPictureArea(cx) {
    this.pictureIcon = this.add.image(cx, 200, this.story.panels[0].iconKey).setDisplaySize(190, 190);
    this.pictureCaption = this.add.text(cx, 310, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#f4f1ff',
    }).setOrigin(0.5);
  }

  loadPanel(index) {
    this.panelIndex = index;
    const panel = this.story.panels[index];
    const baseEntry = this.story.sentenceData.find((e) => e.panelId === panel.id);
    const entry = SentenceChunks.resolveSentenceEntry(baseEntry, this.story, this.tense);

    this.pictureIcon.setTexture(panel.iconKey);
    this.pictureCaption.setText(panel.caption);
    this.progressLabel.setText(`Sentence ${index + 1} of ${this.story.panels.length}`);

    this.builder.loadEntry(entry);
  }

  advance() {
    if (this.panelIndex + 1 < this.story.panels.length) {
      this.loadPanel(this.panelIndex + 1);
    } else {
      this.showRecap();
    }
  }

  showRecap() {
    this.builder.destroy();
    this.pictureIcon.destroy();
    this.pictureCaption.destroy();
    this.progressLabel.destroy();
    this.modeBadge.destroy();

    const cx = this.scale.width / 2;

    this.add.text(cx, 90, 'Story complete!', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#f4f1ff',
    }).setOrigin(0.5);

    this.add.text(cx, 130, this.story.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#a9a4c9',
    }).setOrigin(0.5);

    this.recapCards = this.buildRecapGrid(cx, 220);

    this.add.text(cx, 500, 'Try telling it in another time.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      color: '#a9a4c9',
    }).setOrigin(0.5);

    this.timeSwitch = new TimeSwitch(this, {
      x: cx,
      y: 640,
      spacing: 62,
      tenseOrder: TENSE_ORDER,
      timeModes: this.story.timeModes,
      activeTense: this.tense,
      reduced: this.reduced,
      onSelect: (newTense) => this.handleTimeSwitch(newTense),
    });

    this.transientPrompt = this.add.text(cx, 830, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#f4f1ff',
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setAlpha(0);

    const menuButton = new UIButton(this, {
      width: 240,
      height: 76,
      label: 'Back to Menu',
      fontSize: 22,
      bgColor: 0x2a2c40,
      hoverColor: 0x3a3d57,
      radius: 18,
    });
    menuButton.setPosition(cx, 970);
    menuButton.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  buildRecapGrid(cx, startY) {
    const size = 130;
    const gap = 20;
    const half = gap / 2 + size / 2;
    const positions = [
      { x: cx - half, y: startY },
      { x: cx + half, y: startY },
      { x: cx - half, y: startY + size + gap },
      { x: cx + half, y: startY + size + gap },
    ];

    return this.story.panels.map((panel, i) => {
      const pos = positions[i];
      const frame = this.add.image(pos.x, pos.y, 'card-frame').setDisplaySize(size, size);
      const icon = this.add.image(pos.x, pos.y - size * 0.1, panel.iconKey).setDisplaySize(size * 0.46, size * 0.46);
      const caption = this.add.text(pos.x, pos.y + size * 0.32, panel.caption, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#332e4d',
        align: 'center',
        wordWrap: { width: size * 0.85 },
      }).setOrigin(0.5);

      return this.add.container(0, 0, [frame, icon, caption]);
    });
  }

  handleTimeSwitch(newTense) {
    this.timeSwitch.locked = true;
    const mode = this.story.timeModes[newTense];

    this.recapCards.forEach((card, i) => {
      if (this.reduced) {
        card.setAlpha(0.3);
        return;
      }
      this.tweens.add({
        targets: card,
        alpha: 0.25,
        x: card.x - 10,
        duration: 180,
        delay: i * 30,
        yoyo: true,
      });
    });

    this.transientPrompt.setText(`Now tell the same story about ${mode.contextBadge.toLowerCase()}.`);
    if (this.reduced) {
      this.transientPrompt.setAlpha(1);
    } else {
      this.tweens.add({
        targets: this.transientPrompt,
        alpha: { from: 0, to: 1 },
        duration: 250,
        delay: 200,
      });
    }

    this.time.delayedCall(this.reduced ? 300 : 1100, () => {
      this.scene.restart({ storyId: this.storyId, tense: newTense });
    });
  }
}

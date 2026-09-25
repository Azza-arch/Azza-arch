class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    ensurePlaceholderAssets(this);

    this.reduced = prefersReducedMotion();
    this.selectedCard = null;
    this.slots = [null, null, null, null];
    this.locked = false;

    const story = StoryData['story-01'];
    this.story = story;
    const { width } = this.scale;
    const cx = width / 2;

    this.buildTopBar(story, cx);
    this.buildContextAndPrompt(story, cx);

    this.cardSize = 250;
    this.cardGap = 26;
    this.slotPositions = this.computeSlotPositions(cx, 465);

    this.buildCards(story);
    this.buildInstructionAndButton(story, cx, this.slotPositions[2].y + this.cardSize / 2);

    this.input.dragDistanceThreshold = 8;
    this.setupInput();
  }

  buildTopBar(story, cx) {
    const backButton = new UIButton(this, {
      width: 120,
      height: 56,
      label: 'Back',
      bgColor: 0x2a2c40,
      hoverColor: 0x3a3d57,
    });
    backButton.setPosition(100, 70);
    backButton.on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(cx, 70, story.label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#f4f1ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const dotCount = 4;
    const dotSpacing = 24;
    const dotStartX = cx + 200 - ((dotCount - 1) * dotSpacing) / 2;
    for (let i = 0; i < dotCount; i += 1) {
      this.add.circle(dotStartX + i * dotSpacing, 70, 7, i === 0 ? 0x6c5ce7 : 0x33324a)
        .setStrokeStyle(2, 0x4a4867);
    }
  }

  buildContextAndPrompt(story, cx) {
    const mode = story.timeModes[story.tense];

    const badgeText = this.add.text(0, 0, mode.contextBadge, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#2f2b45',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const badgeWidth = badgeText.width + 48;
    const badgeHeight = 40;
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(0xffd166, 1);
    badgeBg.fillRoundedRect(-badgeWidth / 2, -badgeHeight / 2, badgeWidth, badgeHeight, badgeHeight / 2);

    const badge = this.add.container(cx, 170, [badgeBg, badgeText]);
    badge.setSize(badgeWidth, badgeHeight);

    this.add.text(cx, 232, mode.prompt, {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#f4f1ff',
    }).setOrigin(0.5);

    this.toast = this.add.text(cx, 300, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#8ee6a8',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
  }

  computeSlotPositions(cx, startY) {
    const half = this.cardGap / 2 + this.cardSize / 2;
    return [
      { x: cx - half, y: startY },
      { x: cx + half, y: startY },
      { x: cx - half, y: startY + this.cardSize + this.cardGap },
      { x: cx + half, y: startY + this.cardSize + this.cardGap },
    ];
  }

  buildCards(story) {
    const order = this.shuffledOrder(story.panels.length);

    story.panels.forEach((panelData, i) => {
      const card = new StoryCard(this, panelData, this.cardSize);
      const slotIndex = order[i];
      this.placeCardInSlot(card, slotIndex, false);
    });
  }

  shuffledOrder(count) {
    const indices = Array.from({ length: count }, (_, i) => i);
    const isSorted = () => indices.every((v, i) => v === i);

    do {
      for (let i = indices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    } while (isSorted());

    return indices;
  }

  placeCardInSlot(card, slotIndex, animate) {
    const pos = this.slotPositions[slotIndex];
    card.slotIndex = slotIndex;
    card.setSlotNumber(slotIndex + 1);
    this.slots[slotIndex] = card;

    if (animate && !this.reduced) {
      this.tweens.add({
        targets: card,
        x: pos.x,
        y: pos.y,
        duration: 220,
        ease: 'Back.easeOut',
      });
    } else {
      card.setPosition(pos.x, pos.y);
    }
  }

  swapCards(cardA, cardB) {
    const slotA = cardA.slotIndex;
    const slotB = cardB.slotIndex;
    this.placeCardInSlot(cardA, slotB, true);
    this.placeCardInSlot(cardB, slotA, true);
  }

  buildInstructionAndButton(story, cx, gridBottomY) {
    this.add.text(cx, gridBottomY + 50, story.instruction, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#a9a4c9',
    }).setOrigin(0.5);

    const checkButton = new UIButton(this, {
      width: 280,
      height: 84,
      label: 'Check Story',
      fontSize: 26,
      bgColor: 0x6c5ce7,
      hoverColor: 0x7d6cf0,
      radius: 20,
    });
    checkButton.setPosition(cx, gridBottomY + 160);
    checkButton.on('pointerdown', () => this.checkStory());
  }

  setupInput() {
    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.locked || !(gameObject instanceof StoryCard)) return;
      this.children.bringToTop(gameObject);
      this.clearSelection();
      if (!this.reduced) {
        this.tweens.add({ targets: gameObject, scale: 1.06, duration: 120 });
      }
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (!(gameObject instanceof StoryCard)) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      if (!(gameObject instanceof StoryCard)) return;
      if (!this.reduced) {
        this.tweens.add({ targets: gameObject, scale: 1, duration: 120 });
      }

      const targetSlot = this.nearestSlot(gameObject.x, gameObject.y);
      const occupant = this.slots[targetSlot];

      if (occupant !== gameObject) {
        this.swapCards(gameObject, occupant);
      } else {
        this.placeCardInSlot(gameObject, gameObject.slotIndex, true);
      }
    });

    this.slots.forEach((card) => this.registerTap(card));
  }

  registerTap(card) {
    if (!card) return;
    card.on('pointerup', () => {
      if (card.dragHappened) return;
      this.handleTap(card);
    });
  }

  handleTap(card) {
    if (this.locked) return;
    if (!this.selectedCard) {
      this.selectedCard = card;
      card.setSelected(true);
      return;
    }

    if (this.selectedCard === card) {
      this.clearSelection();
      return;
    }

    const other = this.selectedCard;
    this.clearSelection();
    this.swapCards(card, other);
  }

  clearSelection() {
    if (this.selectedCard) {
      this.selectedCard.setSelected(false);
      this.selectedCard = null;
    }
  }

  nearestSlot(x, y) {
    let best = 0;
    let bestDist = Infinity;
    this.slotPositions.forEach((pos, i) => {
      const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  checkStory() {
    if (this.locked) return;
    this.clearSelection();
    const isCorrect = this.slots.every((card, i) => card.panelData.order === i + 1);

    if (isCorrect) {
      this.locked = true;
      this.slots.forEach((card, i) => {
        card.playCorrectPulse(this.reduced);
        if (!this.reduced) {
          this.tweens.add({
            targets: card,
            scale: 1.08,
            duration: 140,
            yoyo: true,
            delay: i * 60,
            ease: 'Sine.easeOut',
          });
        }
      });
      this.showToast('Great job!');
      this.time.delayedCall(this.reduced ? 400 : 1200, () => {
        this.scene.start('SentenceScene', { storyId: this.story.storyId });
      });
    } else {
      this.slots.forEach((card, i) => {
        if (card.panelData.order !== i + 1) {
          card.playIncorrectPulse(this.reduced);
          card.shake(this.reduced);
        }
      });
    }
  }

  showToast(message) {
    this.toast.setText(message);
    this.toast.setAlpha(1);
    if (this.reduced) {
      this.time.delayedCall(900, () => this.toast.setAlpha(0));
      return;
    }
    this.tweens.add({
      targets: this.toast,
      alpha: { from: 1, to: 0 },
      delay: 700,
      duration: 400,
    });
  }
}

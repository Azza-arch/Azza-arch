// Reusable sentence-building widget: bank of word/phrase chips + a sentence
// row the player fills by tapping (or dragging) chips back and forth, plus
// Undo/Check controls and a short grammar-explanation line. Not a Phaser
// GameObject itself — it just creates and positions plain scene objects at
// absolute coordinates, the same way GameScene/StoryCard already do, so
// drag math never has to fight a transformed container.
//
// Usage:
//   const builder = new SentenceBuilder(scene, { originX, originY, width, onSolved });
//   builder.loadEntry(sentenceDataEntry); // call again for each new panel
//   builder.destroy(); // when the scene shuts down

class SentenceBuilder {
  constructor(scene, { originX, originY, width, onSolved, reduced = false }) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
    this.width = width;
    this.onSolved = onSolved;
    this.reduced = reduced;

    this.entry = null;
    this.correctOrder = [];
    this.placed = [];
    this.history = [];
    this.chipsById = {};
    this.locked = false;

    this.sentencePanelHeight = 96;
    this.bankStartY = this.originY + this.sentencePanelHeight + 40;
    this.feedbackY = this.bankStartY + 150;
    this.controlsY = this.feedbackY + 90;

    this.buildStaticUI();
    this.bindDragHandlers();
  }

  buildStaticUI() {
    const panelWidth = this.width + 40;

    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x1c1e2e, 1);
    this.panel.fillRoundedRect(this.originX - panelWidth / 2, this.originY, panelWidth, this.sentencePanelHeight, 20);
    this.panel.lineStyle(2, 0x3a3d57, 1);
    this.panel.strokeRoundedRect(this.originX - panelWidth / 2, this.originY, panelWidth, this.sentencePanelHeight, 20);

    this.emptyHint = this.scene.add.text(this.originX, this.originY + this.sentencePanelHeight / 2, 'Tap a word below to build the sentence.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#6b6690',
    }).setOrigin(0.5);

    this.feedbackText = this.scene.add.text(this.originX, this.feedbackY, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#a9a4c9',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: this.width },
    }).setOrigin(0.5);

    this.undoButton = new UIButton(this.scene, {
      width: 130,
      height: 62,
      label: 'Undo',
      fontSize: 20,
      bgColor: 0x2a2c40,
      hoverColor: 0x3a3d57,
    });
    this.undoButton.setPosition(this.originX - 150, this.controlsY);
    this.undoButton.on('pointerdown', () => this.undo());

    this.checkButton = new UIButton(this.scene, {
      width: 220,
      height: 72,
      label: 'Check',
      fontSize: 24,
      bgColor: 0x6c5ce7,
      hoverColor: 0x7d6cf0,
      radius: 18,
    });
    this.checkButton.setPosition(this.originX + 90, this.controlsY);
    this.checkButton.on('pointerdown', () => this.check());
  }

  bindDragHandlers() {
    this.handleDragStart = (pointer, gameObject) => {
      if (this.locked || !this.ownsChip(gameObject)) return;
      this.scene.children.bringToTop(gameObject);
      if (!this.reduced) {
        this.scene.tweens.add({ targets: gameObject, scale: 1.06, duration: 100 });
      }
    };

    this.handleDrag = (pointer, gameObject, dragX, dragY) => {
      if (this.locked || !this.ownsChip(gameObject)) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    };

    this.handleDragEnd = (pointer, gameObject) => {
      if (this.locked || !this.ownsChip(gameObject)) return;
      if (!this.reduced) {
        this.scene.tweens.add({ targets: gameObject, scale: 1, duration: 100 });
      }
      this.resolveDrop(gameObject);
    };

    this.scene.input.on('dragstart', this.handleDragStart);
    this.scene.input.on('drag', this.handleDrag);
    this.scene.input.on('dragend', this.handleDragEnd);
  }

  ownsChip(gameObject) {
    return Boolean(gameObject && gameObject.chunk && this.chipsById[gameObject.chunk.id] === gameObject);
  }

  loadEntry(entry) {
    this.clearChips();
    this.entry = entry;
    this.placed = [];
    this.history = [];
    this.locked = false;
    this.feedbackText.setText('');

    const { bankChunks, correctOrder } = SentenceChunks.buildChunksForEntry(entry);
    this.correctOrder = correctOrder;

    bankChunks.forEach((chunk) => {
      const chip = new WordChip(this.scene, chunk);
      chip.location = 'bank';
      this.chipsById[chunk.id] = chip;
      chip.on('pointerup', () => {
        if (!chip.dragHappened) this.toggle(chip);
      });
    });

    this.layout();
  }

  clearChips() {
    Object.values(this.chipsById).forEach((chip) => chip.destroy());
    this.chipsById = {};
  }

  toggle(chip) {
    if (this.locked) return;
    this.pushHistory();
    if (chip.location === 'bank') {
      this.placed.push(chip.chunk.id);
    } else {
      this.placed = this.placed.filter((id) => id !== chip.chunk.id);
    }
    this.layout();
  }

  resolveDrop(chip) {
    const bandTop = this.originY - 20;
    const bandBottom = this.originY + this.sentencePanelHeight + 20;
    const droppedInSentence = chip.y >= bandTop && chip.y <= bandBottom;
    const wasPlaced = chip.location === 'sentence';

    if (droppedInSentence && wasPlaced) {
      // Reorder among the other placed chips based on horizontal drop position.
      const others = this.placed
        .filter((id) => id !== chip.chunk.id)
        .map((id) => this.chipsById[id]);
      let insertIndex = others.findIndex((other) => chip.x < other.x);
      if (insertIndex === -1) insertIndex = others.length;
      const newPlaced = others.map((c) => c.chunk.id);
      newPlaced.splice(insertIndex, 0, chip.chunk.id);
      this.pushHistory();
      this.placed = newPlaced;
      this.layout();
    } else if (droppedInSentence && !wasPlaced) {
      this.pushHistory();
      this.placed.push(chip.chunk.id);
      this.layout();
    } else if (!droppedInSentence && wasPlaced) {
      this.pushHistory();
      this.placed = this.placed.filter((id) => id !== chip.chunk.id);
      this.layout();
    } else {
      this.layout();
    }
  }

  pushHistory() {
    this.history.push(this.placed.slice());
    if (this.history.length > 20) this.history.shift();
  }

  undo() {
    if (this.locked || !this.history.length) return;
    this.placed = this.history.pop();
    this.layout();
  }

  layout() {
    Object.values(this.chipsById).forEach((chip) => {
      chip.location = this.placed.indexOf(chip.chunk.id) !== -1 ? 'sentence' : 'bank';
      chip.refreshStyle();
    });

    this.layoutSentenceRow();
    this.layoutBank();
    this.emptyHint.setAlpha(this.placed.length === 0 ? 1 : 0);
  }

  layoutSentenceRow() {
    const gapX = 14;
    const chips = this.placed.map((id) => this.chipsById[id]);
    const rowWidth = chips.reduce((sum, chip, i) => sum + chip.chipWidth + (i > 0 ? gapX : 0), 0);
    let x = this.originX - rowWidth / 2;
    const y = this.originY + this.sentencePanelHeight / 2;

    chips.forEach((chip) => {
      this.moveChip(chip, x + chip.chipWidth / 2, y);
      x += chip.chipWidth + gapX;
    });
  }

  layoutBank() {
    const gapX = 14;
    const gapY = 16;
    const bankChips = Object.values(this.chipsById).filter((chip) => chip.location === 'bank');

    const rows = [];
    let currentRow = [];
    let currentWidth = 0;

    bankChips.forEach((chip) => {
      const addedWidth = chip.chipWidth + (currentRow.length ? gapX : 0);
      if (currentRow.length && currentWidth + addedWidth > this.width) {
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }
      currentRow.push(chip);
      currentWidth += chip.chipWidth + (currentRow.length > 1 ? gapX : 0);
    });
    if (currentRow.length) rows.push(currentRow);

    rows.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, chip, i) => sum + chip.chipWidth + (i > 0 ? gapX : 0), 0);
      let x = this.originX - rowWidth / 2;
      const y = this.bankStartY + rowIndex * (58 + gapY);

      row.forEach((chip) => {
        this.moveChip(chip, x + chip.chipWidth / 2, y);
        x += chip.chipWidth + gapX;
      });
    });
  }

  moveChip(chip, x, y) {
    if (this.reduced) {
      chip.setPosition(x, y);
      return;
    }
    this.scene.tweens.add({
      targets: chip,
      x,
      y,
      duration: 200,
      ease: 'Sine.easeOut',
    });
  }

  check() {
    if (this.locked || !this.entry) return { correct: false };

    const expected = this.correctOrder;
    const isCorrect = this.placed.length === expected.length
      && this.placed.every((id, i) => id === expected[i]);

    this.placed.forEach((id, i) => {
      const chip = this.chipsById[id];
      const isRight = id === expected[i];
      chip.setStyle(isRight ? 'correct' : 'incorrect');
      if (!isRight) chip.shake(this.reduced);
    });

    if (isCorrect) {
      this.feedbackText.setColor('#8ee6a8');
      this.feedbackText.setText(`Great!\n${SentenceChunks.buildFullSentenceText(this.entry)}`);
      this.locked = true;
      this.scene.time.delayedCall(this.reduced ? 300 : 1300, () => {
        this.locked = false;
        if (this.onSolved) this.onSolved(this.entry);
      });
    } else {
      this.feedbackText.setColor('#ffb4ac');
      this.feedbackText.setText(SentenceChunks.buildGrammarNote(this.entry));
    }

    return { correct: isCorrect };
  }

  destroy() {
    this.scene.input.off('dragstart', this.handleDragStart);
    this.scene.input.off('drag', this.handleDrag);
    this.scene.input.off('dragend', this.handleDragEnd);
    this.clearChips();
    this.panel.destroy();
    this.emptyHint.destroy();
    this.feedbackText.destroy();
    this.undoButton.destroy();
    this.checkButton.destroy();
  }
}

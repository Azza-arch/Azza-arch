// Phase 3.1 — the Phaser side of Story Order is now ONLY the visual scene:
// the 2x2 card grid, tap/drag/swap interaction, and the completion mini-row.
// Everything that used to be drawn as Phaser text/buttons (header, context
// badge, question, feedback, instruction, Check Story / Continue / Play
// Again / Back to Menu) has moved to HTML/CSS — see src/pages/storyOrderPage.js
// and the #story-order-shell markup in index.html.
//
// This scene owns no page chrome and knows nothing about DOM elements. It
// exposes a small imperative API (check/playAgain/showCompletion/getState)
// that the page controller calls, and fires plain events for the state
// changes the page controller needs to reflect in the DOM.
//
// Gameplay logic itself (shuffle, swap, validation, hints, grammar recap)
// is unchanged from Phase 3 — this file only changed how it renders/sizes.

class StoryOrderGridScene extends Phaser.Scene {
  constructor() {
    super('StoryOrderGridScene');
  }

  init(data) {
    this.storyId = (data && data.storyId) || 'climbing-the-tree';
  }

  preload() {
    const catalog = window.TenseTales.data.assetCatalog;
    const composition = window.TenseTales.utils.sceneComposition;
    const story = window.TenseTales.data.stories[this.storyId];
    const queue = (key, path) => { if (!this.textures.exists(key)) this.load.image(key, path); };
    story.panels.forEach((panel) => {
      composition.resolve(panel.scene, catalog).forEach((layer) => { if (layer.path) queue(layer.texture, layer.path); });
    });
  }

  create() {
    this.reduced = prefersReducedMotion();
    this.story = window.TenseTales.data.stories[this.storyId];
    this.controller = window.TenseTales.gameplay.storyOrderController.createStoryOrderController(this.story);
    this.locked = false;
    this.cards = {};
    this.completionMode = false;
    this.miniCards = [];

    this.computeLayout();
    this.buildCards();

    this.input.dragDistanceThreshold = 8;
    this.bindInput();

    this.renderFromState(true);

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.handleResize, this));

    // Told once create() has actually run — the page controller waits for
    // this before wiring buttons, instead of racing Phaser's boot process.
    this.events.emit('grid-ready');
  }

  // Derives card size + grid geometry purely from the current canvas size
  // (this.scale.width/height), which the page controller keeps in sync
  // with the responsive HTML container. No fixed 360x640 assumption.
  computeLayout() {
    const w = this.scale.width;
    const h = this.scale.height;

    const gap = Phaser.Math.Clamp(w * 0.035, 14, 28);
    let cardWidth = Phaser.Math.Clamp((w - gap * 3) / 2, 1, 340);
    let cardHeight = cardWidth * 0.72;

    const neededHeight = cardHeight * 2 + gap * 3;
    if (neededHeight > h) {
      const shrink = h / neededHeight;
      cardHeight *= shrink;
      cardWidth = cardHeight / 0.72;
    }

    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.cardGap = gap;
    this.cx = w / 2;
    this.cy = h / 2;
    this.slotPositions = this.computeSlotPositions();
  }

  computeSlotPositions() {
    const halfW = this.cardGap / 2 + this.cardWidth / 2;
    const halfH = this.cardGap / 2 + this.cardHeight / 2;
    const gridHeight = this.cardHeight * 2 + this.cardGap;
    const topY = this.cy - gridHeight / 2 + this.cardHeight / 2;
    const bottomY = topY + this.cardHeight + this.cardGap;
    return [
      { x: this.cx - halfW, y: topY },
      { x: this.cx + halfW, y: topY },
      { x: this.cx - halfW, y: bottomY },
      { x: this.cx + halfW, y: bottomY },
    ];
  }

  handleResize() {
    this.computeLayout();
    Object.values(this.cards).forEach((card) => card.resizeTo(this.cardWidth, this.cardHeight));
    if (this.completionMode) {
      this.layoutCompletionCards();
    } else {
      this.renderFromState(true);
    }
  }

  layersForPanel(panelId) {
    const panel = this.story.panels.find((item) => item.id === panelId);
    return window.TenseTales.utils.sceneComposition.resolve(panel.scene, window.TenseTales.data.assetCatalog, { width: this.cardWidth, height: this.cardHeight }, { storyId: this.story.id, panelId: panel.id });
  }

  buildCards() {
    this.story.panels.forEach((panel) => {
      const card = new KenneySceneCard(this, {
        panelId: panel.id, width: this.cardWidth, height: this.cardHeight, layers: this.layersForPanel(panel.id),
      });
      this.cards[panel.id] = card;
      card.on('pointerup', () => {
        if (!card.dragHappened && !this.completionMode) this.handleTapSlot(this.slotIndexOf(panel.id));
      });
    });
  }

  bindInput() {
    this.input.on('dragstart', (pointer, gameObject) => {
      if (this.locked || this.completionMode || !(gameObject instanceof KenneySceneCard)) return;
      this.children.bringToTop(gameObject);
      gameObject.drawShadow('dragging');
      if (!this.reduced) this.tweens.add({ targets: gameObject, scale: 1.06, duration: 100 });
    });
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.locked || this.completionMode || !(gameObject instanceof KenneySceneCard)) return;
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.input.on('dragend', (pointer, gameObject) => {
      if (this.locked || this.completionMode || !(gameObject instanceof KenneySceneCard)) return;
      if (!this.reduced) this.tweens.add({ targets: gameObject, scale: 1, duration: 100 });
      gameObject.drawShadow('default');
      const fromIndex = this.slotIndexOf(gameObject.panelId);
      const toIndex = this.nearestSlot(gameObject.x, gameObject.y);
      if (toIndex === fromIndex) {
        this.renderFromState();
        return;
      }
      const result = this.controller.dragSwap(fromIndex, toIndex);
      this.renderFromState();
      this.events.emit('state', this.controller.getState(), result);
    });
  }

  slotIndexOf(panelId) {
    return this.controller.getState().orderedPanelIds.indexOf(panelId);
  }

  nearestSlot(x, y) {
    let best = 0;
    let bestDist = Infinity;
    this.slotPositions.forEach((pos, i) => {
      const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  handleTapSlot(index) {
    if (this.locked) return;
    const result = this.controller.selectSlot(index);
    this.renderFromState();
    this.events.emit('state', this.controller.getState(), result);
  }

  // Called by the page controller when "Check Story" is clicked. Returns
  // the same {correct, attempts, showHint} shape the old in-canvas version
  // used, so the HTML feedback text can be driven directly from it.
  check() {
    if (this.locked) return null;
    const result = this.controller.check();

    if (result.correct) {
      this.locked = true;
      Object.values(this.cards).forEach((card) => {
        card.playSettlePulse(this.reduced);
        card.markCorrect();
      });
      return result;
    }

    const canonical = window.TenseTales.gameplay.storyValidation.getCanonicalOrder(this.story);
    const state = this.controller.getState();
    state.orderedPanelIds.forEach((panelId, i) => {
      if (canonical[i] !== panelId) this.cards[panelId].shake(this.reduced);
    });
    return result;
  }

  getState() {
    return this.controller.getState();
  }

  getStory() {
    return this.story;
  }

  renderFromState(instant) {
    const state = this.controller.getState();
    state.orderedPanelIds.forEach((panelId, slotIndex) => {
      const card = this.cards[panelId];
      const pos = this.slotPositions[slotIndex];
      card.setSlotNumber(slotIndex + 1);
      card.setSelected(state.selectedSlot === slotIndex);
      if (this.reduced || instant) {
        card.setPosition(pos.x, pos.y);
      } else {
        this.tweens.add({ targets: card, x: pos.x, y: pos.y, duration: 220, ease: 'Back.easeOut' });
      }
    });
  }

  // Swaps the interactive grid out for a small non-interactive row showing
  // the canonical (correct) order — the recap text itself is rendered in
  // HTML by the page controller via the grammar engine.
  showCompletion() {
    this.completionMode = true;
    Object.values(this.cards).forEach((card) => card.setVisible(false).disableInteractive());
    this.buildCompletionCards();
  }

  buildCompletionCards() {
    this.destroyCompletionCards();
    const canonicalIds = window.TenseTales.gameplay.storyValidation.getCanonicalOrder(this.story);
    this.miniCards = canonicalIds.map((panelId, i) => {
      const mini = new KenneySceneCard(this, {
        panelId, width: 1, height: 1, layers: this.layersForPanel(panelId),
      });
      mini.setSlotNumber(i + 1);
      mini.disableInteractive();
      return mini;
    });
    this.layoutCompletionCards();
  }

  layoutCompletionCards() {
    if (!this.miniCards.length) return;
    const w = this.scale.width;
    const h = this.scale.height;
    const count = this.miniCards.length;
    const gap = Phaser.Math.Clamp(w * 0.02, 8, 16);
    let miniWidth = Phaser.Math.Clamp((w - gap * (count + 1)) / count, 70, 150);
    let miniHeight = miniWidth * 0.85;
    if (miniHeight > h * 0.9) {
      miniHeight = h * 0.9;
      miniWidth = miniHeight / 0.85;
    }
    const totalWidth = miniWidth * count + gap * (count - 1);
    const startX = w / 2 - totalWidth / 2 + miniWidth / 2;
    this.miniCards.forEach((mini, i) => {
      mini.resizeTo(miniWidth, miniHeight);
      mini.setPosition(startX + i * (miniWidth + gap), h / 2);
    });
  }

  focusCompletionStep(index) {
    this.miniCards.forEach((card, i) => {
      card.setAlpha(i === index ? 1 : 0.48);
      card.setScale(i === index && !this.reduced ? 1.06 : 1);
    });
  }

  playCompletionAction(index) {
    const panels = this.story.panels.slice().sort((a, b) => a.order - b.order);
    const card = this.miniCards[index];
    if (card && panels[index]) card.playSemanticAction(panels[index], this.reduced);
  }

  clearCompletionFocus() {
    this.miniCards.forEach((card) => card.setAlpha(1).setScale(1));
  }

  destroyCompletionCards() {
    this.miniCards.forEach((mini) => mini.destroy());
    this.miniCards = [];
  }

  playAgain() {
    this.completionMode = false;
    this.destroyCompletionCards();
    Object.values(this.cards).forEach((card) => card.destroy());
    this.cards = {};
    this.locked = false;
    this.controller.playAgain();
    this.computeLayout();
    this.buildCards();
    this.renderFromState(true);
  }
}

// Phase 3 story-order card: a real layered Kenney scene (sky/tree/grass/
// character), not a tiny icon. Positions every sprite with the same
// left/bottom (or left/top) percentage convention already validated in
// story-prototypes.html, so the visual composition is unchanged — this
// class just renders it inside a Phaser container instead of static HTML.
//
// The slot-number badge shows the CURRENT slot (1-4), never the panel's
// canonical `order` — set via setSlotNumber(), independent of panel data.
//
// Phase 3.1: the card must be able to resize in place (resizeTo) so the
// responsive grid can rescale it when the containing page/canvas resizes,
// without destroying and recreating the Phaser objects.
//
// Phase 3.2: card chrome (border/badge colours) uses the storybook palette
// instead of the old dark-prototype purple. Visual states: default, selected
// (tap-to-swap), correct (all cards after a successful Check Story) and
// incorrect (a brief coral flash during shake()).

const KenneySceneCardPalette = {
  borderDefault: 0xcfe8ea,
  borderSelected: 0x34b7a5,
  borderCorrect: 0x78c850,
  borderIncorrect: 0xf28773,
  badgeFill: 0x3b82c4,
  badgeStroke: 0xdff4f5,
};

class KenneySceneCard extends Phaser.GameObjects.Container {
  constructor(scene, { panelId, width, height, layers }) {
    super(scene, 0, 0);

    this.panelId = panelId;
    this.cardWidth = width;
    this.cardHeight = height;
    this.layerDefs = layers;
    // The container's own (x,y) is its CENTER, matching every other slot/
    // grid calculation in the scene — so every child layer below is offset
    // by (-width/2, -height/2) from the top-left-relative math it's easiest
    // to reason about in percentages.
    this.anchorX = -width / 2;
    this.anchorY = -height / 2;
    this.dragHappened = false;
    this.isSelected = false;
    this.visualState = 'default'; // 'default' | 'selected' | 'correct'

    this.shadow = scene.add.graphics();
    this.drawShadow('default');

    this.sprites = layers.map((layer) => this.createLayer(layer));

    this.border = scene.add.graphics();
    this.drawBorder('default');

    this.badgeRadius = this.badgeRadiusFor(width);
    this.badge = scene.add.circle(0, 0, this.badgeRadius, KenneySceneCardPalette.badgeFill)
      .setStrokeStyle(2, KenneySceneCardPalette.badgeStroke);
    this.badgeText = scene.add.text(0, 0, '', {
      fontFamily: "'Baloo 2', Arial, sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.selectionMarker = scene.add.graphics().setVisible(false);
    this.positionBadge();

    this.addAt(this.shadow, 0);
    this.add([this.border, this.badge, this.badgeText, this.selectionMarker]);

    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });
    scene.input.setDraggable(this);

    this.on('pointerdown', () => { this.dragHappened = false; });
    this.on('dragstart', () => { this.dragHappened = true; });

    scene.add.existing(this);
  }

  badgeRadiusFor(width) {
    return Phaser.Math.Clamp(width * 0.06, 12, 17);
  }

  positionBadge() {
    const inset = this.badgeRadius + 4;
    this.badge.setPosition(this.anchorX + inset, this.anchorY + inset);
    this.badge.setRadius(this.badgeRadius);
    this.badgeText.setPosition(this.anchorX + inset, this.anchorY + inset);
    this.badgeText.setFontSize(Math.round(this.badgeRadius * 1.3));
    this.drawSelectionMarker();
  }

  drawShadow(state) {
    if (!this.shadow) return;
    this.shadow.clear();
    const offset = state === 'dragging' ? 12 : 7;
    const alpha = state === 'dragging' ? 0.18 : 0.10;
    this.shadow.fillStyle(0x23343b, alpha);
    this.shadow.fillRoundedRect(this.anchorX + 2, this.anchorY + offset, this.cardWidth - 4, this.cardHeight - 2, 16);
  }

  drawSelectionMarker() {
    if (!this.selectionMarker) return;
    const x = this.anchorX + this.cardWidth - this.badgeRadius - 5;
    const y = this.anchorY + this.badgeRadius + 5;
    const r = Math.max(11, this.badgeRadius - 1);
    this.selectionMarker.clear();
    this.selectionMarker.fillStyle(KenneySceneCardPalette.borderSelected, 1);
    this.selectionMarker.fillCircle(x, y, r);
    this.selectionMarker.lineStyle(3, 0xffffff, 1);
    this.selectionMarker.beginPath();
    this.selectionMarker.moveTo(x - r * 0.45, y);
    this.selectionMarker.lineTo(x - r * 0.1, y + r * 0.35);
    this.selectionMarker.lineTo(x + r * 0.5, y - r * 0.35);
    this.selectionMarker.strokePath();
  }

  createLayer(layer) {
    if (layer.role === 'surface') {
      const color = Phaser.Display.Color.HexStringToColor(layer.surface.color).color;
      const rect = this.scene.add.rectangle(0, 0, 1, 1, color).setOrigin(0, 0);
      this.layoutLayer(layer, rect);
      this.add(rect);
      return rect;
    }
    const image = this.scene.add.image(0, 0, layer.texture);
    this.layoutLayer(layer, image);
    if (layer.cover) {
      this.addAt(image, 0);
    } else {
      this.add(image);
    }
    return image;
  }

  layoutLayer(layer, image) {
    if (layer.role === 'surface') {
      image.setPosition(this.anchorX + layer.x / 100 * this.cardWidth, this.anchorY + layer.y / 100 * this.cardHeight);
      image.setSize(layer.width / 100 * this.cardWidth, (layer.height || 16) / 100 * this.cardHeight);
      image.setDisplaySize(layer.width / 100 * this.cardWidth, (layer.height || 16) / 100 * this.cardHeight);
      return;
    }
    if (layer.cover) {
      image.setOrigin(0, 0);
      image.setDisplaySize(this.cardWidth, this.cardHeight);
      image.setPosition(this.anchorX, this.anchorY);
      return;
    }

    const naturalWidth = image.width;
    const naturalHeight = image.height;
    const displayWidth = (layer.width / 100) * this.cardWidth;
    const displayHeight = displayWidth * (naturalHeight / naturalWidth);
    image.setDisplaySize(displayWidth, displayHeight);

    const x = this.anchorX + (layer.x / 100) * this.cardWidth;
    const y = this.anchorY + (layer.y / 100) * this.cardHeight;
    if (layer.anchor === 'center') image.setOrigin(0.5, 0.5);
    else if (layer.anchor === 'top-left') image.setOrigin(0, 0);
    else if (layer.anchor === 'top') image.setOrigin(0.5, 0);
    else image.setOrigin(0.5, 1);
    image.setPosition(x, y);
    image.setFlipX(Boolean(layer.flipX));
    image.setAngle(layer.rotation || 0);
    image.setAlpha(layer.opacity == null ? 1 : layer.opacity);
  }

  // Rescale this card in place (used when the responsive page/canvas
  // resizes). Re-lays-out every existing sprite rather than destroying and
  // recreating them.
  resizeTo(width, height) {
    this.cardWidth = width;
    this.cardHeight = height;
    this.anchorX = -width / 2;
    this.anchorY = -height / 2;

    this.sprites.forEach((image, i) => this.layoutLayer(this.layerDefs[i], image));
    this.drawBorder(this.visualState);
    this.drawShadow('default');

    this.badgeRadius = this.badgeRadiusFor(width);
    this.positionBadge();

    this.setSize(width, height);
  }

  drawBorder(state) {
    this.border.clear();
    const radius = 18;
    const widths = { default: 2, selected: 5, correct: 4, incorrect: 4 };
    const colors = {
      default: KenneySceneCardPalette.borderDefault,
      selected: KenneySceneCardPalette.borderSelected,
      correct: KenneySceneCardPalette.borderCorrect,
      incorrect: KenneySceneCardPalette.borderIncorrect,
    };
    this.border.lineStyle(widths[state], colors[state], 1);
    this.border.strokeRoundedRect(this.anchorX + 1, this.anchorY + 1, this.cardWidth - 2, this.cardHeight - 2, radius);
  }

  setSlotNumber(n) {
    this.badgeText.setText(String(n));
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.visualState = selected ? 'selected' : 'default';
    this.drawBorder(this.visualState);
    this.selectionMarker.setVisible(selected);
    // Border alone would be colour-only-ish at a glance — add a small lift
    // (scale + shadow-free y offset) so selection reads even in grayscale.
    this.scene.tweens.add({
      targets: this,
      scaleX: selected ? 1.04 : 1,
      scaleY: selected ? 1.04 : 1,
      duration: 120,
      ease: 'Sine.easeOut',
    });
  }

  // Subtle green confirmation treatment, held until the next shuffle/reset
  // (not just a brief flash) — the resting state of a solved grid.
  markCorrect() {
    this.visualState = 'correct';
    this.drawBorder('correct');
    this.selectionMarker.setVisible(false);
  }

  shake(reduced) {
    const previousState = this.visualState;
    this.drawBorder('incorrect');
    const restoreBorder = () => this.drawBorder(previousState);

    if (reduced) {
      this.scene.time.delayedCall(220, restoreBorder);
      return;
    }

    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 8,
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.x = originalX;
        restoreBorder();
      },
    });
  }

  playSettlePulse(reduced) {
    if (reduced) return;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 140,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  playSemanticAction(panel, reduced) {
    if (!panel) return;
    const plan = window.TenseTales.utils.sceneMotion.motionFor(panel);
    let indexes = [];
    this.layerDefs.forEach((layer, index) => {
      if (plan.target === 'prop' && /Prop$/.test(layer.role)) indexes.push(index);
      if (plan.target === 'actor' && layer.role === 'actor') indexes.push(index);
    });
    if (!indexes.length) this.layerDefs.forEach((layer, index) => { if (layer.role === 'actor') indexes.push(index); });
    indexes.forEach((index) => {
      const target = this.sprites[index];
      if (!target) return;
      if (reduced) {
        this.scene.tweens.add({ targets: target, alpha: 0.68, duration: 150, yoyo: true });
        return;
      }
      const originX = target.x;
      const originY = target.y;
      const originAngle = target.angle;
      this.scene.tweens.add({
        targets: target,
        x: originX + plan.x,
        y: originY + plan.y,
        angle: originAngle + plan.rotate,
        duration: 310,
        yoyo: true,
        ease: 'Sine.easeInOut',
        onComplete: () => target.setPosition(originX, originY).setAngle(originAngle),
      });
    });
  }
}

// The signature "Time Switch" control: a vertical timeline with three
// stops (Past / Present / Future) and a glowing marker that slides between
// them. Deliberately not a segmented-control/tab bar — it's meant to read
// as a lever on a timeline, not an admin dashboard widget.

class TimeSwitch {
  constructor(scene, {
    x,
    y,
    spacing = 64,
    tenseOrder,
    timeModes,
    activeTense,
    reduced = false,
    onSelect,
  }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.spacing = spacing;
    this.tenseOrder = tenseOrder;
    this.timeModes = timeModes;
    this.activeTense = activeTense;
    this.reduced = reduced;
    this.onSelect = onSelect;
    this.locked = false;

    this.trackX = x - 90;

    this.stops = this.tenseOrder.map((tenseId, i) => ({
      tenseId,
      y: this.y + (i - 1) * this.spacing,
    }));

    this.tickGraphics = {};
    this.labelTexts = {};
    this.hitZones = {};

    this.buildTrack();
    this.buildStops();
    this.buildGlow();
    this.refresh();
  }

  buildTrack() {
    const top = this.stops[0].y;
    const bottom = this.stops[this.stops.length - 1].y;
    this.track = this.scene.add.graphics();
    this.track.lineStyle(4, 0x2a2c40, 1);
    this.track.lineBetween(this.trackX, top, this.trackX, bottom);
  }

  buildStops() {
    this.stops.forEach(({ tenseId, y }) => {
      const mode = this.timeModes[tenseId];

      const tick = this.scene.add.graphics();
      this.tickGraphics[tenseId] = tick;

      const label = this.scene.add.text(this.trackX + 30, y, mode.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#6b6690',
      }).setOrigin(0, 0.5);
      this.labelTexts[tenseId] = label;

      const hitZone = this.scene.add.zone(this.trackX + 60, y, 200, this.spacing * 0.9)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      hitZone.on('pointerup', () => this.select(tenseId));
      this.hitZones[tenseId] = hitZone;
    });
  }

  buildGlow() {
    this.glow = this.scene.add.circle(this.trackX, this.activeStopY(), 12, 0x6c5ce7, 0.35);
    this.pip = this.scene.add.circle(this.trackX, this.activeStopY(), 8, 0x6c5ce7, 1);
    this.pip.setStrokeStyle(2, 0x9b8cff, 0.9);
  }

  activeStopY() {
    const stop = this.stops.find((s) => s.tenseId === this.activeTense);
    return stop ? stop.y : this.y;
  }

  refresh() {
    this.stops.forEach(({ tenseId, y }) => {
      const isActive = tenseId === this.activeTense;
      const tick = this.tickGraphics[tenseId];
      tick.clear();
      tick.fillStyle(isActive ? 0x6c5ce7 : 0x2a2c40, 1);
      tick.fillCircle(this.trackX, y, isActive ? 5 : 6);
      tick.lineStyle(2, isActive ? 0x9b8cff : 0x3a3d57, 1);
      tick.strokeCircle(this.trackX, y, isActive ? 5 : 6);

      const label = this.labelTexts[tenseId];
      label.setColor(isActive ? '#f4f1ff' : '#6b6690');
      label.setFontStyle(isActive ? 'bold' : 'normal');
    });
  }

  select(tenseId) {
    if (this.locked || tenseId === this.activeTense) return;

    this.activeTense = tenseId;
    this.refresh();

    const targetY = this.activeStopY();
    if (this.reduced) {
      this.glow.y = targetY;
      this.pip.y = targetY;
    } else {
      this.scene.tweens.add({ targets: [this.glow, this.pip], y: targetY, duration: 320, ease: 'Cubic.easeInOut' });
      this.scene.tweens.add({ targets: this.pip, scale: 1.3, duration: 140, yoyo: true, ease: 'Sine.easeOut' });
    }

    if (this.onSelect) this.onSelect(tenseId);
  }

  destroy() {
    this.track.destroy();
    Object.values(this.tickGraphics).forEach((g) => g.destroy());
    Object.values(this.labelTexts).forEach((t) => t.destroy());
    Object.values(this.hitZones).forEach((z) => z.destroy());
    this.glow.destroy();
    this.pip.destroy();
  }
}

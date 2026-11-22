// V13 Phase 1 — Kenney "UI Pack - Pixel Adventure" (CC0 1.0) foundation.
// Source: C:\Users\syhaz\Downloads\kenney_ui-pack-pixel-adventure.zip, verified
// by inspecting actual tile pixels before use (see phase report). Only the
// "Large tiles / Thick outline" sheet is used here (32x32 native frames,
// packed with no inter-tile spacing — assets/kenney-ui-pixel-adventure/
// large-tiles-thick-outline.png, loaded as 'kpp_ui_large').
//
// Verified frame roles (inspected pixel-by-pixel, not guessed):
//  - Frame 1: solid brown panel, 4px dark/highlight border on all sides,
//    confirmed clean (no protruding rivets) — safe for Phaser NineSlice.
//  - Frames 69/70/71: a left-cap / seamless-middle / right-cap triple for a
//    riveted blue-grey stadium bar — confirmed middle tile (70) is plain and
//    tileable, caps (69,71) carry the rivet, matching a standard 3-slice
//    button shape already present in the pack's own sample mockup.
//  - Frame 4: riveted square frame (cream centre, brown border) — has
//    corner studs that would distort if stretched, so it is only ever used
//    here at its native 32x32 size (a compact HUD badge), never 9-sliced.
//
// Every factory below returns plain Phaser GameObjects (a Container for the
// button/panel, an Image for the badge) — nothing here mutates v12, and
// nothing here is wired into gameplay logic; game.js only toggles this
// cluster's visibility by reading (never writing) this.mode.

const UI_SHEET = 'kpp_ui_large';
const PANEL_FRAME = 1;
const BUTTON_LEFT = 69, BUTTON_MID = 70, BUTTON_RIGHT = 71;
const BADGE_FRAME = 4;
const BORDER = 4; // px, native scale — measured directly from frame 1's pixels

/**
 * A stretchable framed panel built from the pack's own bordered-panel tile
 * (frame 1), assembled corner/edge/centre by hand via setCrop() tiling.
 *
 * This project runs Phaser in Canvas mode (`type:Phaser.CANVAS`, confirmed
 * in game.js's init call), and Phaser's built-in NineSlice GameObject only
 * renders under the WebGL renderer — tried first, confirmed silently blank
 * under Canvas (zero pixels drawn despite correct bounds/visible/alpha), so
 * it was replaced with this manual-tile approach instead. This is the same
 * crop-and-repeat technique `environment.js`'s own `tile()`/`post()`/
 * `beam()` helpers already use throughout v12/v13 for every multi-piece
 * structure in the game world, so it's proven compatible with this
 * project's renderer, not a new or risky primitive.
 */
export function createPixelPanel(scene, x, y, width, height, scale = 2) {
  const group = scene.add.container(x, y).setScrollFactor(0);
  const step = BORDER * scale;
  // setCrop() clips a window of the texture but does not re-anchor it to
  // the object's own origin — the visible pixels stay at their original
  // offset within the frame's full (uncropped) footprint. Compensating the
  // object's position by -sx*scale/-sy*scale is what makes the cropped
  // window land exactly at (px,py); confirmed necessary by direct pixel
  // measurement (every piece reported a 70.4px display box before this
  // fix, not the intended 8.8px, and the crop content was drawn offset by
  // its source (sx,sy) rather than flush with the image's position).
  const img = (sx, sy, px, py) => {
    const im = scene.add.image(px - sx * scale, py - sy * scale, UI_SHEET, PANEL_FRAME).setOrigin(0, 0).setScale(scale).setCrop(sx, sy, BORDER, BORDER);
    group.add(im);
    return im;
  };
  const cols = Math.max(0, Math.round((width - 2 * step) / step));
  const rows = Math.max(0, Math.round((height - 2 * step) / step));
  // Corners (true frame corners, never stretched).
  img(0, 0, 0, 0);
  img(32 - BORDER, 0, width - step, 0);
  img(0, 32 - BORDER, 0, height - step);
  img(32 - BORDER, 32 - BORDER, width - step, height - step);
  // Edges and centre, tiled from a uniform mid-border/fill sample — safe
  // here because frame 1's border and fill are each a single flat colour
  // across their full span (verified by sampling its pixels directly).
  for (let c = 0; c < cols; c++) {
    img(BORDER, 0, step + c * step, 0);
    img(BORDER, 32 - BORDER, step + c * step, height - step);
  }
  for (let r = 0; r < rows; r++) {
    img(0, BORDER, 0, step + r * step);
    img(32 - BORDER, BORDER, width - step, step + r * step);
  }
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    img(BORDER, BORDER, step + c * step, step + r * step);
  }
  return group;
}

/**
 * A reusable, pointer- and keyboard-activatable button built from the
 * pack's own 3-piece stadium-bar tile (left cap / tileable middle / right
 * cap) plus a text label. Demonstrates the one required "interactive
 * focus/pressed state": hover brightens (tint), press darkens + squashes
 * (tint + a 2px downward nudge, the same restrained technique already used
 * for Chill Boy's own landing squash in v12/game.js), and Enter/Space
 * trigger the identical pressed visual while the button holds demo focus.
 */
export function createPixelButton(scene, x, y, label, { width = 160, height = 44, scale = 1, onActivate } = {}) {
  // Deliberately NOT nested in a Container: a Zone's interactive hit area
  // nested inside a Container never received real pointer events in this
  // project's Canvas-renderer setup (confirmed live — the scene's own
  // global 'pointerdown' fired at the exact right coordinates, but the
  // nested Zone's own listener never did), so every piece here is placed
  // at absolute scene coordinates instead, with one top-level interactive
  // Rectangle doing the hit-testing. This matches how every other
  // interactive element in this game already works (world-space objects
  // with a scene-level overlap/E-key check, never a sprite-nested pointer
  // zone) — this component just adds real pointer support on top of that
  // same flat-hierarchy pattern.
  const segW = 32 * scale;
  const midScaleX = Math.max(1, (width - segW * 2) / 32);
  const left = scene.add.image(x, y, UI_SHEET, BUTTON_LEFT).setOrigin(0, 0).setScale(scale).setScrollFactor(0);
  const mid = scene.add.image(x + segW, y, UI_SHEET, BUTTON_MID).setOrigin(0, 0).setScale(midScaleX, scale).setScrollFactor(0);
  const right = scene.add.image(x + segW + midScaleX * 32, y, UI_SHEET, BUTTON_RIGHT).setOrigin(0, 0).setScale(scale).setScrollFactor(0);
  const text = scene.add.text(x + width / 2, y + height / 2, label, {
    fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '16px', fontStyle: 'bold', color: '#2b2016',
  }).setOrigin(0.5).setScrollFactor(0);
  const focusRing = scene.add.rectangle(x + width / 2, y + height / 2, width + 6, height + 6)
    .setStrokeStyle(3, 0xfff2b1, 1).setOrigin(0.5).setVisible(false).setScrollFactor(0);
  const hit = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0, 0)
    .setScrollFactor(0).setInteractive({ useHandCursor: true });

  const sprites = [left, mid, right];
  const all = [left, mid, right, text, focusRing, hit];
  const setPressedVisual = (pressed) => {
    sprites.forEach(s => s.setTint(pressed ? 0xb9a98a : 0xffffff));
    text.setY(y + height / 2 + (pressed ? 2 : 0));
  };
  hit.on('pointerover', () => sprites.forEach(s => s.setTint(0xfff0cf)));
  hit.on('pointerout', () => { sprites.forEach(s => s.setTint(0xffffff)); setPressedVisual(false); });
  hit.on('pointerdown', () => setPressedVisual(true));
  hit.on('pointerup', () => { setPressedVisual(false); onActivate?.(); });

  // Keyboard activation: Tab moves demo focus onto the button, Enter
  // activates it — additive-only input handling local to this component;
  // it never touches the game's existing keyboard map (A/D/Space/W/S/E/R,
  // all still owned exclusively by game.js's own this.keys/controls).
  return {
    all,
    setFocused: (focused) => focusRing.setVisible(focused),
    triggerPressAnimation: () => {
      // Synchronous, not a scene.time.delayedCall: keeps keyboard
      // activation exactly as reliable as pointer activation regardless of
      // this scene's own timer/pause lifecycle state.
      setPressedVisual(true);
      onActivate?.();
      requestAnimationFrame(() => setTimeout(() => setPressedVisual(false), 90));
    },
    setVisible: (v) => all.forEach(o => o.setVisible(v)),
  };
}

/** A compact, fixed-size HUD badge (icon frame + short text), native scale only. */
export function createHudBadge(scene, x, y, text, scale = 1.5) {
  const icon = scene.add.image(x, y, UI_SHEET, BADGE_FRAME).setOrigin(0, 0).setScale(scale).setScrollFactor(0);
  const label = scene.add.text(x + 32 * scale + 6, y + (32 * scale) / 2, text, {
    fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '13px', fontStyle: 'bold', color: '#fff2ce',
  }).setOrigin(0, 0.5).setScrollFactor(0);
  return { icon, label, setText: (t) => label.setText(t) };
}

/**
 * Builds the Phase 1 demonstration cluster: one panel, one button, one HUD
 * badge, all screen-fixed (scrollFactor 0) in the otherwise-empty right
 * side of the welcome screen's canvas preview. Returns a Container so the
 * whole cluster can be shown/hidden with one call; game.js only ever reads
 * `scene.mode` to decide visibility, never writes it from here.
 */
export function buildPixelUIDemo(scene) {
  const DEPTH = 100;
  const group = scene.add.container(0, 0).setDepth(DEPTH).setScrollFactor(0);
  const panel = createPixelPanel(scene, 760, 90, 300, 170, 2.2);
  const title = scene.add.text(790, 112, 'UI KIT · V13', {
    fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '15px', fontStyle: 'bold', color: '#4a3419',
  }).setScrollFactor(0);
  const body = scene.add.text(790, 140, 'Kenney UI Pack\nPixel Adventure (CC0)', {
    fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px', color: '#5a4327', lineSpacing: 4,
  }).setScrollFactor(0);
  const badge = createHudBadge(scene, 790, 190, 'Koleksi 0 / 9');
  group.add([panel, title, body, badge.icon, badge.label]);

  // The button is kept outside `group` (a flat, non-nested set of absolute-
  // position GameObjects — see createPixelButton's own comment for why) so
  // its hit area actually receives pointer input; its depth is set to
  // match the panel group so it still layers correctly above it.
  const button = createPixelButton(scene, 790, 230, 'DEMO', {
    width: 150, height: 42,
    onActivate: () => body.setText('Butang ditekan!\nPixel Adventure (CC0)'),
  });
  button.all.forEach(o => o.setDepth(DEPTH));

  // Keyboard focus/activation, additive-only: Tab is unused anywhere else
  // in this game's own key map (A/D/Space/W/S/E/R, all still owned
  // exclusively by game.js's existing this.keys), so binding it here can't
  // shadow or race any existing control. Enter is likewise only consumed
  // elsewhere while mode==='mechanism' (presentation.js), inert whenever
  // this demo is shown (welcome/playing only).
  let focused = false;
  scene.input.keyboard.on('keydown-TAB', (event) => {
    if (scene.mode !== 'welcome' && scene.mode !== 'playing') return;
    event.preventDefault();
    focused = !focused;
    button.setFocused(focused);
  });
  scene.input.keyboard.on('keydown-ENTER', () => {
    if ((scene.mode !== 'welcome' && scene.mode !== 'playing') || !focused) return;
    button.triggerPressAnimation();
  });

  return {
    badge,
    button,
    setVisible: (v) => { group.setVisible(v); button.setVisible(v); if (!v) button.setFocused(false); },
  };
}

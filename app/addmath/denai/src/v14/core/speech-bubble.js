// Short world-space speech bubble near the player — shared by Levels 1-1, 1-2
// and 1-3 (Fasa F). Placement tries, in order: above the player, below the
// player; a spot is accepted only if the whole bubble is inside the camera
// view, below the HUD chips, above the touch buttons and clear of the mission
// tracker (sliding left of it when needed). Otherwise it falls back to above
// the player, kept inside the view. Text wraps to the view width, so narrow
// portrait phones (iPhone SE) never push it off-screen. A toast shown at the
// same moment is dismissed: the bubble is the more specific message.
const $ = (id) => document.getElementById(id);
export const BUBBLE_STYLE = { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#2b2118', backgroundColor: '#ffffff', padding: { x: 8, y: 5 } };
export function makeBubble(s, text) {
  const n = $('notice'); if (n?.classList.contains('show')) { n.classList.remove('show'); document.body.dataset.notice = 'false'; }
  const view = s.cameras.main.worldView;
  return s.add.text(s.player.x, s.player.body.top - 18, text, { ...BUBBLE_STYLE, wordWrap: { width: Math.max(140, Math.min(340, view.width - 40)) } }).setOrigin(0, 0).setDepth(45);
}
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
export function placeBubbleObj(s, b) {
  if (!b?.active) return;
  const cam = s.cameras.main, view = cam.worldView, c = s.game.canvas.getBoundingClientRect(), k = c.height ? view.height / c.height : 1 / cam.zoom; // world px per CSS px
  const toWorld = (r) => ({ x: view.x + (r.left - c.left) * k, y: view.y + (r.top - c.top) * k, w: r.width * k, h: r.height * k });
  if (b.width > view.width - 16 * k) b.setWordWrapWidth(Math.max(120, view.width - 32 * k));
  const hudBottom = view.y + 60 * k;
  const touchTops = [...document.querySelectorAll('#touch-controls button')].filter((x) => x.offsetParent).map((x) => x.getBoundingClientRect()).filter((r) => r.width);
  const floor = touchTops.length ? view.y + (Math.min(...touchTops.map((r) => r.top)) - c.top) * k - 6 * k : view.bottom - 6 * k;
  const tr = $('quest-tracker'), tRect = tr && !tr.hidden && tr.offsetParent ? tr.getBoundingClientRect() : null, track = tRect && tRect.width ? toWorld(tRect) : null;
  const wp = $('world-prompt'), pRect = wp && !wp.hidden && wp.offsetParent ? wp.getBoundingClientRect() : null, prompt = pRect && pRect.width ? toWorld(pRect) : null;
  const w = b.width, h = b.height, px = s.player.x, minX = view.x + 8 * k, maxX = view.right - 8 * k - w;
  const tops = [s.player.body.top - 18 - h, s.player.body.bottom + 12];
  for (const y of tops) {
    if (y < hudBottom || y + h > floor) continue;
    let x = Math.min(Math.max(px - w / 2, minX), maxX), r = { x, y, w, h };
    if (track && overlaps(r, { ...track, x: track.x - 6 * k, w: track.w + 12 * k })) { x = track.x - 6 * k - w; r = { x, y, w, h }; if (x < minX) continue; }
    if (prompt && overlaps(r, prompt)) continue; // the 'E · …' prompt stays readable
    b.setPosition(Math.round(x), Math.round(y)); coverTracker(b, false); return;
  }
  // No free spot (narrow portrait): above the player; if that covers the
  // tracker, the tracker steps aside while this short bubble is shown.
  const y = Math.max(hudBottom, Math.min(tops[0], floor - h)), x = Math.round(Math.min(Math.max(px - w / 2, minX), maxX));
  b.setPosition(x, Math.round(y)); coverTracker(b, !!(track && overlaps({ x, y, w, h }, track)));
}
function coverTracker(b, on) {
  document.body.classList.toggle('bubble-over-tracker', on);
  if (on && !b.__coverHook) { b.__coverHook = true; b.once('destroy', () => document.body.classList.remove('bubble-over-tracker')); }
}
// Level 1-3 helpers (state on the scene).
export function say(s, text, ms = 3000) { s.bubble?.destroy(); s.bubble = makeBubble(s, text); s.bubbleUntil = s.time.now + ms; placeBubbleObj(s, s.bubble); }
export function placeBubble(s) { if (!s.bubble) return; if (s.time.now > s.bubbleUntil) { s.bubble.destroy(); s.bubble = null; return; } placeBubbleObj(s, s.bubble); }

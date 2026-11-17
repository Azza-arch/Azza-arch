// Short world-space speech bubble above (or below) the player, kept inside the
// view, clear of the mission tracker, and replacing a toast shown at the same
// moment. Same behaviour as the Level 1-2 workshop bubble, as a reusable helper.
const $ = (id) => document.getElementById(id);
export function say(s, text, ms = 3000) {
  s.bubble?.destroy();
  const n = $('notice'); if (n?.classList.contains('show')) { n.classList.remove('show'); document.body.dataset.notice = 'false'; }
  s.bubble = s.add.text(s.player.x, s.player.body.top - 18, text, { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#2b2118', backgroundColor: '#ffffff', padding: { x: 8, y: 5 }, wordWrap: { width: Math.min(340, s.cameras.main.worldView.width - 40) } }).setOrigin(0.5, 1).setDepth(45);
  s.bubbleUntil = s.time.now + ms; placeBubble(s);
}
export function placeBubble(s) {
  const b = s.bubble, cam = s.cameras.main; if (!b) return;
  if (s.time.now > s.bubbleUntil) { b.destroy(); s.bubble = null; return; }
  const view = cam.worldView, above = s.player.body.top - 18 - b.height >= view.y + 58 / cam.zoom;
  const top = above ? s.player.body.top - 18 - b.height : s.player.body.bottom + 12;
  let right = view.right; const tr = $('quest-tracker');
  if (tr && !tr.hidden) {
    const r = tr.getBoundingClientRect(), c = s.game.canvas.getBoundingClientRect(), k = view.height / c.height;
    const ty0 = view.y + (r.top - c.top) * k, ty1 = view.y + (r.bottom - c.top) * k;
    if (r.width && top < ty1 && top + b.height > ty0) right = Math.min(right, view.x + (r.left - c.left) * k - 6);
  }
  const room = right - view.x - 16; if (b.width > room && room > 160) b.setWordWrapWidth(room - 16);
  const half = b.width / 2 + 8, x = Math.min(Math.max(s.player.x, view.x + half), right - half);
  if (above) b.setOrigin(0.5, 1).setPosition(x, s.player.body.top - 18);
  else b.setOrigin(0.5, 0).setPosition(x, s.player.body.bottom + 12);
}

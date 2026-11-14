// Phones: play in landscape. Separate from the game (no gameplay, save or
// leaderboard code is touched).
// - Android/Chrome: on the first touch, enter fullscreen and lock landscape
//   (browsers only allow an orientation lock in fullscreen after a user gesture).
// - Where locking is impossible (iPhone Safari) or refused: while the phone is
//   held upright, show a "turn your phone" card. The game also has a portrait
//   layout, so the player may dismiss it and keep playing upright.
const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 900;
const DISMISS_KEY = 'denai-rotate-dismissed'; // session only; separate from the game's saves

function makeCard() {
  const el = document.createElement('div');
  el.className = 'rotate-card'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'rotate-title'); el.hidden = true;
  el.innerHTML = `<div class="rotate-box">
      <div class="rotate-icon" aria-hidden="true"><span>📱</span></div>
      <p id="rotate-title" class="rotate-title">Pusingkan telefon anda</p>
      <p class="rotate-text">DENAI paling seronok dimain dalam mod <strong>landskap</strong>. Matikan kunci putaran skrin jika perlu.</p>
      <button type="button" class="rotate-stay">Teruskan dalam potret</button>
    </div>`;
  document.body.append(el);
  el.querySelector('.rotate-stay').addEventListener('click', () => { try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch {} update(); });
  return el;
}
let card = null;
const dismissed = () => { try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; } };
const portrait = () => matchMedia('(orientation: portrait)').matches;
function update() {
  if (!card) return;
  const show = portrait() && !dismissed();
  card.hidden = !show;
  if (show) card.querySelector('.rotate-stay').focus({ preventScroll: true });
}

async function goLandscape() {
  const de = document.documentElement;
  try {
    if (!document.fullscreenElement && (de.requestFullscreen || de.webkitRequestFullscreen)) await (de.requestFullscreen ? de.requestFullscreen({ navigationUI: 'hide' }) : de.webkitRequestFullscreen());
  } catch { /* fullscreen refused: fine */ }
  try { await screen.orientation?.lock?.('landscape'); } catch { /* not supported (iOS) or refused: the card covers it */ }
  update();
}

if (phone) {
  card = makeCard();
  update();
  matchMedia('(orientation: portrait)').addEventListener('change', update);
  addEventListener('resize', update);
  // first touch anywhere (including the card itself) asks for landscape once
  addEventListener('pointerdown', goLandscape, { once: true, capture: true });
}

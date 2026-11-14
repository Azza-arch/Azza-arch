// DENAI landing.
// 1) Returning player: READ-ONLY look at the game's own storage (same origin) to
//    offer "Sambung" and show their stats. Never writes or deletes game saves.
// 2) "Cuba mesin" demo: f(x) = 2x + 1, target 7 planks; builds a plank bridge.
// 3) Phone dock: a compact play button once the hero has scrolled away.
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const mmss = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const $ = (id) => document.getElementById(id);

function returning() {
  const save = read('denai-save-v14'), profile = read('denai-profile-v1');
  const lv = profile?.levels?.['w1-l1'];
  if (!(save || (lv && (lv.completions > 0 || lv.best)))) return;
  for (const id of ['play', 'play3']) { const l = $(id)?.querySelector('.btn-label'); if (l) l.textContent = 'SAMBUNG'; }
  $('cta-note').textContent = 'Kemajuan anda tersimpan dalam pelayar ini.';
  const stats = [];
  if (lv?.completions > 0) stats.push(['Tamat Level 1-1', `${lv.completions}×`]);
  if (lv?.best?.timeMs > 0) stats.push(['Masa terbaik', mmss(lv.best.timeMs)]);
  if (Array.isArray(profile?.coinIds) && profile.coinIds.length) stats.push(['Syiling', `${profile.coinIds.length}/15`]);
  if (Array.isArray(profile?.achievements) && profile.achievements.length) stats.push(['Pencapaian', `${profile.achievements.length}/5`]);
  if (stats.length) $('stats').innerHTML = stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('returning').hidden = false;
}

function machine() {
  const TARGET = 7, f = (x) => 2 * x + 1;
  const planks = $('planks'), msg = $('m-msg'), out = $('m-out'), inp = $('m-in'), cta = $('m-cta');
  const btns = [...document.querySelectorAll('#machine [data-x]')];
  btns.forEach((b) => b.addEventListener('click', () => {
    const x = Number(b.dataset.x), y = f(x);
    btns.forEach((o) => o.classList.toggle('is-picked', o === b));
    inp.textContent = `x = ${x}`; out.textContent = `${y} papan`;
    planks.innerHTML = Array.from({ length: Math.min(y, 11) }, (_, i) => `<i style="--i:${i}"></i>`).join('');
    planks.dataset.state = y === TARGET ? 'ok' : y < TARGET ? 'short' : 'long';
    if (y === TARGET) { msg.innerHTML = `<b class="ok">Tepat!</b> f(${x}) = 2(${x}) + 1 = 7. Jambatan terbina. Dalam game, ada 12 variasi misi seperti ini.`; cta.hidden = false; }
    else if (y < TARGET) { msg.innerHTML = `f(${x}) = ${y} papan: <b>kurang ${TARGET - y}</b>, jambatan tidak sampai. Cuba input lebih besar.`; cta.hidden = true; }
    else { msg.innerHTML = `f(${x}) = ${y} papan: <b>lebih ${y - TARGET}</b>, papan terlebih. Cuba input lebih kecil.`; cta.hidden = true; }
  }));
}

function dock() {
  const d = $('dock'), hero = $('hero');
  if (!('IntersectionObserver' in window) || !d || !hero) return;
  new IntersectionObserver(([e]) => { d.hidden = e.isIntersecting; }, { threshold: 0.05 }).observe(hero);
}

function init() { returning(); machine(); dock(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

// DENAI landing: detect a returning player on this device and offer "Sambung".
// READ-ONLY: never writes, edits or deletes the game's saves (same origin keys
// written by /app/addmath/denai). Works without storage (private mode) too.
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const mmss = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function init() {
  const save = read('denai-save-v14');
  const profile = read('denai-profile-v1');
  const lv = profile?.levels?.['w1-l1'];
  const returning = !!save || (lv && (lv.completions > 0 || lv.best));
  if (!returning) return;
  for (const id of ['play', 'play2']) { const a = document.getElementById(id); if (a) a.textContent = 'SAMBUNG PENGEMBARAAN'; }
  document.getElementById('cta-note').textContent = 'Kemajuan anda tersimpan dalam pelayar ini.';
  const stats = [];
  if (lv?.completions > 0) stats.push(['Tamat Level 1-1', `${lv.completions} kali`]);
  if (lv?.best?.timeMs > 0) stats.push(['Masa terbaik', mmss(lv.best.timeMs)]);
  if (Array.isArray(profile?.coinIds) && profile.coinIds.length) stats.push(['Syiling ditemui', `${profile.coinIds.length} / 15`]);
  if (Array.isArray(profile?.achievements) && profile.achievements.length) stats.push(['Pencapaian', `${profile.achievements.length} / 5`]);
  const box = document.getElementById('returning');
  if (stats.length) document.getElementById('stats').innerHTML = stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  box.hidden = false;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

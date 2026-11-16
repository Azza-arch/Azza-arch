// DENAI landing: real unique-player count from PlayFab (no estimate, no fallback number).
// Same anonymous client + same device id as the game (same origin), so a visitor who
// later plays keeps one identity. Source: EntryCount of the 'denai_players' board,
// which the game writes once per player after 15 s of real play. If the board is
// missing, offline, or the response has no EntryCount, nothing is shown.
import { LEADERBOARD_CONFIG as CFG } from '/app/addmath/denai/src/v14/leaderboard/config.js';
import * as PF from '/app/addmath/denai/src/v14/leaderboard/playfab.js';

const KEY = 'denai-players-cache', TTL = CFG.community?.cacheMs ?? 300000;
const store = { get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } }, set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} } };

export async function playerCount() {
  const board = CFG.community?.playersBoard;
  if (!board || CFG.provider !== 'playfab' || !CFG.playfab.enabled) return null;
  const c = store.get();
  if (c && Date.now() - c.at < TTL) return c.players;
  const { entryCount } = await PF.board(board, 1);
  store.set({ at: Date.now(), players: entryCount });
  return entryCount;
}

export async function showPlayerCount(el) {
  if (!el) return;
  try {
    const n = await playerCount();
    if (!Number.isSafeInteger(n) || n <= 0) return;
    el.textContent = `${n.toLocaleString('ms-MY')} pemain telah mencuba DENAI`;
    el.hidden = false;
  } catch (e) { console.warn('DENAI: kiraan pemain tidak dapat dibaca —', e?.code || e?.message || e); } // stay hidden
}

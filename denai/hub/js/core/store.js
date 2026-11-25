// ProgressStore — the hub's single source of learner state.
// Real mode: localStorage key HUB.progress, re-read on every call so the state
// survives refreshes and other tabs. Demo mode (?demo=1): an in-memory copy
// seeded with sample events; it never reads or writes the real record.
// A backend can later implement the same five methods (state, append,
// setActive, clearActive, reset) with the same event shapes.
import { HUB } from './keys.js';
import { sanitizeEvent } from './events.js';

const MAX_EVENTS = 5000; // ≈ 0.7 MB worst case; oldest events drop first
const ID = /^[a-z0-9.\-]{1,60}$/i;

function storageOk(kind) {
  try { const s = window[kind]; const k = '__denai_hub__'; s.setItem(k, '1'); s.removeItem(k); return true; } catch { return false; }
}
const LOCAL = typeof window !== 'undefined' && storageOk('localStorage');
const SESSION = typeof window !== 'undefined' && storageOk('sessionStorage');

// ---------------------------------------------------------------- demo mode
/** ?demo=1 turns demo mode on for this tab, ?demo=0 turns it off. */
export function isDemoMode() {
  try {
    const q = new URLSearchParams(location.search).get('demo');
    if (SESSION) {
      if (q === '1') sessionStorage.setItem(HUB.demoMode, '1');
      if (q === '0') sessionStorage.removeItem(HUB.demoMode);
      return sessionStorage.getItem(HUB.demoMode) === '1';
    }
    return q === '1';
  } catch { return false; }
}

// ---------------------------------------------------------------- sanitising
const int10 = (v) => (Number.isInteger(v) && v >= 0 && v <= 10 ? v : 0);
const empty = () => ({ v: 1, events: [], active: {} });
function sanitizeActive(a) {
  if (!a || typeof a !== 'object' || !ID.test(a.id || '') || !Array.isArray(a.qids) || !a.qids.length) return null;
  const qids = a.qids.filter((x) => typeof x === 'string' && ID.test(x)).slice(0, 20);
  const results = (Array.isArray(a.results) ? a.results : []).filter((r) => r && qids.includes(r.q)).map((r) => ({ q: r.q, first: r.first === true, ok: r.ok === true, hint: r.hint === true })).slice(0, qids.length);
  const i = Math.min(results.length, qids.length - 1);
  const cur = a.cur && typeof a.cur === 'object' ? { try: a.cur.try === 2 ? 2 : 1, wrong: Array.isArray(a.cur.wrong) ? a.cur.wrong.filter(Number.isInteger).slice(0, 6) : [], text: typeof a.cur.text === 'string' ? a.cur.text.slice(0, 120) : '', hints: int10(a.cur.hints) } : { try: 1, wrong: [], text: '', hints: 0 };
  return { id: a.id, qids, i, results, cur, startedAt: typeof a.startedAt === 'string' ? a.startedAt : null };
}
export function sanitizeState(raw) {
  const s = empty();
  if (!raw || raw.v !== 1) return s;
  s.events = (Array.isArray(raw.events) ? raw.events : []).map(sanitizeEvent).filter(Boolean).slice(-MAX_EVENTS);
  if (raw.active && typeof raw.active === 'object') {
    for (const [k, v] of Object.entries(raw.active)) { const a = sanitizeActive(v); if (a && /^[a-z0-9\-]+\/[0-9.]+$/i.test(k)) s.active[k] = a; }
  }
  return s;
}

// ---------------------------------------------------------------- backends
const local = {
  read() { if (!LOCAL) return memoryReal; try { return sanitizeState(JSON.parse(localStorage.getItem(HUB.progress) || 'null')); } catch { return empty(); } },
  write(s) { if (!LOCAL) { memoryReal = s; return; } try { localStorage.setItem(HUB.progress, JSON.stringify(s)); } catch { memoryReal = s; quotaFailed = true; } },
};
let memoryReal = empty(), quotaFailed = false;
let demoState = null; // in-memory only

const backend = () => (demoState ? { read: () => demoState, write: (s) => { demoState = s; } } : local);

// ---------------------------------------------------------------- public API
export const store = {
  /** True when real progress is saved in this browser. */
  get persistent() { return !demoState && LOCAL && !quotaFailed; },
  get demo() { return !!demoState; },
  state() { return backend().read(); },
  append(event) {
    const e = sanitizeEvent(event); if (!e) return false;
    const s = backend().read(); s.events.push(e); if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
    backend().write(s); return true;
  },
  active(key) { return backend().read().active[key] || null; },
  setActive(key, a) { const s = backend().read(); const clean = sanitizeActive(a); if (!clean) return; s.active[key] = clean; backend().write(s); },
  clearActive(key) { const s = backend().read(); delete s.active[key]; backend().write(s); },
  /** Erase the learner's record (real mode: the hub key only; demo: the sample). Game saves are never touched. */
  reset() { if (demoState) { demoState = empty(); return; } memoryReal = empty(); quotaFailed = false; try { if (LOCAL) localStorage.removeItem(HUB.progress); } catch { /* blocked */ } },
  /** Demo mode only: replace the in-memory sample record. */
  useDemo(events) { demoState = sanitizeState({ v: 1, events, active: {} }); },
};

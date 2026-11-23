// Learning events: the only facts the hub records. Everything else (notes
// done, scores, mastery, "continue") is derived from them, so a backend can
// later receive the same events unchanged. No personal data: ids, codes,
// booleans, small numbers and timestamps only.
export const EVENT_VERSION = 1;
const ID = /^[a-z0-9.\-]{1,40}$/i;
const DIFF = ['mudah', 'sederhana', 'mencabar'];
const TYPES = ['mcq', 'numeric', 'expression'];

const str = (v, re = ID) => (typeof v === 'string' && re.test(v) ? v : null);
const int = (v, min, max) => (Number.isInteger(v) && v >= min && v <= max ? v : null);
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) && v.length <= 30 ? v : null);

/** Validate one stored event; returns a clean copy or null (dropped). */
export function sanitizeEvent(e) {
  if (!e || typeof e !== 'object' || e.v !== EVENT_VERSION) return null;
  const base = { v: EVENT_VERSION, t: e.t, at: iso(e.at), ch: str(e.ch), sub: str(e.sub) };
  if (!base.at || !base.ch || !base.sub) return null;
  switch (e.t) {
    case 'note-open':
    case 'note-done':
      return base;
    case 'attempt': {
      const q = str(e.q), set = str(e.set), tr = int(e.try, 1, 2);
      if (!q || !set || !tr || typeof e.ok !== 'boolean') return null;
      const sp = Array.isArray(e.sp) ? e.sp.map((x) => str(x)).filter(Boolean).slice(0, 8) : [];
      const out = { ...base, q, set, try: tr, ok: e.ok, sp, diff: DIFF.includes(e.diff) ? e.diff : null, type: TYPES.includes(e.type) ? e.type : null };
      const misc = str(e.misc, /^[a-z0-9\-]{1,40}$/); if (misc) out.misc = misc;
      return out;
    }
    case 'set-done': {
      const set = str(e.set), total = int(e.total, 1, 50), first = int(e.first, 0, 50), right = int(e.right, 0, 50);
      if (!set || !total || first === null || right === null || first > right || right > total) return null;
      return { ...base, set, total, first, right };
    }
    default: return null;
  }
}

const now = () => new Date().toISOString();
export const noteOpen = (ch, sub) => ({ v: EVENT_VERSION, t: 'note-open', at: now(), ch, sub });
export const noteDone = (ch, sub) => ({ v: EVENT_VERSION, t: 'note-done', at: now(), ch, sub });
export function attempt({ ch, sub, q, set, tryNo, ok, misc }) {
  const e = { v: EVENT_VERSION, t: 'attempt', at: now(), ch, sub, q: q.id, set, try: tryNo, ok, sp: q.sp || [], diff: q.difficulty || null, type: q.type };
  if (misc) e.misc = misc;
  return e;
}
export const setDone = ({ ch, sub, set, total, first, right }) => ({ v: EVENT_VERSION, t: 'set-done', at: now(), ch, sub, set, total, first, right });

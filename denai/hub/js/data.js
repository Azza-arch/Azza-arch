// Learning Hub data layer. READ-ONLY reuse of the verified Add Math content
// (via core/content.js: DSKP chapter names, published notes and questions).
// Nothing here edits that content.
import { CURRICULUM, chapterById, NOTE_STATUS, loadChapterNotes, visibleStatus } from './core/content.js';

/** The real DENAI game route (served as main.html by Cloudflare Pages). */
export const GAME_URL = '/app/addmath/denai/main';
export const NOTES_APP_URL = '/app/addmath/';
export const GAME_LANDING_URL = '/denai/';

// The existing DENAI game, described for the hub. Names mirror the shipped game
// (levels/registry.js, menu/progress.js, puzzles/definitions/world1.js); the hub
// never imports game modules (they load the game's save system) and never reads
// or writes game saves. Level → subtopic/SP from the puzzle definitions.
export const GAME = {
  chapter: 't4-1',
  world: 'Dunia 1',
  name: 'Hutan & Sungai',
  levels: [
    { no: '1-1', title: 'Jejak Taman Fungsi', concept: 'Fungsi sebagai model', sub: '1.1', sp: ['1.1.3'], text: String.raw`Beli papan untuk membaiki jambatan: jumlah kos \(C(x) = 4x + 6\) bagi \(x\) papan, dalam bajet.` },
    { no: '1-2', title: 'Jambatan Berkembar', concept: 'Fungsi gubahan', sub: '1.2', sp: ['1.2.1', '1.2.2'], text: String.raw`Susunan mesin mengubah hasil: \(gf(5) = 8\) tetapi \(fg(5) = 6\).` },
    { no: '1-3', title: 'Gerbang Songsang', concept: 'Fungsi songsang', sub: '1.3', sp: ['1.3.1', '1.3.2'], text: String.raw`Daripada bacaan meter 13, cari tetapan asal pintu air: \(f^{-1}(13) = 5\).` },
  ],
  shots: [
    { src: '/denai/img/main.webp', w: 1200, h: 675, title: 'Teroka', alt: 'Chill Boy melompat di Taman Permulaan sambil mengutip syiling', text: 'Lari, lompat, panjat tangga dan tolak kotak.' },
    { src: '/denai/img/mesin.webp', w: 1200, h: 737, title: 'Fikir', alt: 'Stor kayu Level 1-1: pilih bilangan papan, jumlah kos C(x) = 4x + 6 dan bajet RM30', text: 'Matematik dibuat melalui tindakan: beli papan, susun mesin, pusing injap.' },
    { src: '/denai/img/jambatan.webp', w: 1200, h: 737, title: 'Bina', alt: 'Level 1-3: bacaan meter 13, pintu air terangkat, air surut dan batu loncatan timbul', text: 'Misi yang selesai mengubah dunia.' },
  ],
  menuShot: { src: '/denai/img/menu.webp', w: 1200, h: 675, alt: 'Skrin menu game DENAI' },
};

/** Every world on the game's own map (menu/progress.js), with its real state. */
export const WORLDS = [
  { no: 1, name: 'Hutan & Sungai', topic: 'Fungsi', chapter: 't4-1', state: 'playable' },
  { no: 2, name: 'Lembah Batu Kapur', topic: 'Fungsi Kuadratik', chapter: 't4-2', state: 'playable', soon: ['2-3 Gerbang Parabola'] },
  { no: 3, name: 'Kilang & Lombong', topic: 'Sistem Persamaan', chapter: 't4-3', state: 'soon' },
  { no: 4, name: 'Tanah Tinggi Ladang', topic: 'Indeks, Surd & Logaritma', chapter: 't4-4', state: 'soon' },
];
/** World 2 · Lembah Batu Kapur (app/addmath/denai/w2-l1.html; levels/w2/level-2-1-data.js). */
export const GAME_W2 = {
  chapter: 't4-2', world: 'Dunia 2', name: 'Lembah Batu Kapur', url: '/app/addmath/denai/w2-l1.html',
  levels: [
    { no: '2-1', title: 'Jejak Lengkung', concept: 'Kesan a, h dan k pada graf', sub: '2.3', sp: ['2.3.4'], text: String.raw`Ubah \(a\), \(h\) dan \(k\) dalam \(y = a(x - h)^2 + k\) supaya lengkung melalui cincin: batu loncatan dan jambatan gantung terbina daripada lengkung itu.` },
    { no: '2-2', title: 'Lembah Puncak', concept: 'Bucu, nilai maksimum dan masalah maksimum', sub: '2.3', sp: ['2.3.3', '2.3.5', '2.3.6'], url: '/app/addmath/denai/w2-l2.html', text: String.raw`Tangkap bola di bucu \(y = -x^2 + 6x - 5\), bunyikan loceng di titik tertinggi \(y = -2x^2 + 8x\), dan cari lebar kandang yang memberi luas maksimum \(A(x) = x(6 - x)\).` },
  ],
};
/** Every playable game world, in map order. */
export const GAMES = [GAME, GAME_W2];
export const gameLevelFor = (chId, subId) => GAMES.find((g) => g.chapter === chId)?.levels.find((l) => l.sub === subId) || null;

const isAvailable = (id) => visibleStatus(NOTE_STATUS[id]);

/**
 * Honest content status of a chapter:
 *   'published' — verified and public;
 *   'review'    — written, waiting for owner review (shown only with ?semak=1);
 *   'none'      — not written yet.
 */
export const contentStatus = (id) => NOTE_STATUS[id] || 'none';
export const STATUS_LABEL = { published: 'Diterbitkan', review: 'Sedang disemak', none: 'Belum ditulis' };

/** All 18 chapters in DSKP order, with availability. */
export const CHAPTERS = CURRICULUM.map((c) => ({
  id: c.id, form: c.form, number: c.number, title: c.title,
  package: c.package, bidang: c.bidang, track: c.track,
  standards: c.contentStandards.map((s) => ({ code: s.code, title: s.title })),
  status: contentStatus(c.id),
  available: isAvailable(c.id),
  preview: contentStatus(c.id) === 'review' && isAvailable(c.id),
  hasGame: GAMES.some((g) => g.chapter === c.id),
}));

export const chapter = (id) => CHAPTERS.find((c) => c.id === id) || null;
export const chaptersOfForm = (form) => CHAPTERS.filter((c) => c.form === form);
export const subtopicTitle = (chId, code) => chapterById(chId)?.contentStandards.find((s) => s.code === code)?.title || code;
export const chapterLabel = (c) => `Bab ${c.number}: ${c.title}`;

const AUTO = new Set(['mcq', 'numeric', 'expression']);
const cache = new Map();

/** Published notes for a chapter: { meta, intro, subtopics[], questions[] } or null. */
export async function loadChapter(id) {
  const meta = chapter(id);
  if (!meta || !meta.available) return null;
  if (cache.has(id)) return cache.get(id);
  const raw = await loadChapterNotes(id);
  if (!raw) return null;
  const subtopics = raw.subtopics.filter((s) => visibleStatus(s.status));
  const questions = (raw.questions || []).filter((q) => visibleStatus(q.status));
  const out = { meta, intro: raw.intro || '', subtopics, questions };
  cache.set(id, out);
  return out;
}

/**
 * Size of a chapter's content without showing it — used to tell students
 * honestly how much is waiting for review. Counts only; no content leaves here.
 */
export async function contentStats(id) {
  if (contentStatus(id) === 'none') return null;
  const raw = await loadChapterNotes(id);
  if (!raw) return null;
  const items = (s, kind) => s.sections.filter((x) => x.kind === kind).reduce((n, x) => n + (x.items || []).length, 0);
  return { subtopics: raw.subtopics.length, examples: raw.subtopics.reduce((n, s) => n + items(s, 'examples'), 0), questions: (raw.questions || []).length };
}

/** Every published, auto-checkable question of one subtopic (the practice pool), in authored order. */
export function questionPool(ch, subId) {
  return ch.questions.filter((q) => q.subtopic === subId && AUTO.has(q.type) && !q.parts);
}
export const exerciseCount = (ch, subId) => questionPool(ch, subId).length;
/** Written questions (structured with parts, reasoning): practised in the hub, never graded for mastery. */
export function writtenPool(ch, subId) {
  return ch.questions.filter((q) => q.subtopic === subId && (q.type === 'structured' || q.type === 'reasoning'));
}

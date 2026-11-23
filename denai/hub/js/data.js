// Learning Hub data layer. READ-ONLY reuse of the verified Add Math content in
// /app/addmath/src (chapter names from the DSKP catalogue, published notes and
// questions, KaTeX, answer checking). Nothing here edits that content.
import { CURRICULUM, chapterById } from '/app/addmath/src/content/curriculum.js';
import { NOTE_STATUS, loadChapterNotes } from '/app/addmath/src/content/notes/index.js';
import { visibleStatus } from '/app/addmath/src/notes/preview.js';

/** The real DENAI game route (served as main.html by Cloudflare Pages). */
export const GAME_URL = '/app/addmath/denai/main';
export const NOTES_APP_URL = '/app/addmath/';
export const GAME_LANDING_URL = '/denai/';

// Which chapter the existing game teaches and how its levels map to subtopics.
// Level descriptions mirror the shipped game (see /denai/index.html "Apa yang dilatih").
export const GAME = {
  chapter: 't4-1',
  world: 'Dunia 1',
  name: 'Jejak Taman Fungsi',
  levels: [
    { no: '1-1', title: 'Fungsi sebagai model', sub: '1.1', text: String.raw`Beli papan untuk membaiki jambatan: jumlah kos \(C(x) = 4x + 6\) bagi \(x\) papan, dalam bajet.` },
    { no: '1-2', title: 'Fungsi gubahan', sub: '1.2', text: String.raw`Susunan mesin mengubah hasil: \(gf(5) = 8\) tetapi \(fg(5) = 6\).` },
    { no: '1-3', title: 'Fungsi songsang', sub: '1.3', text: String.raw`Daripada bacaan meter 13, cari tetapan asal pintu air: \(f^{-1}(13) = 5\).` },
  ],
  shots: [
    { src: '/denai/img/main.webp', w: 1200, h: 675, title: 'Teroka', alt: 'Chill Boy melompat di Taman Permulaan sambil mengutip syiling', text: 'Lari, lompat, panjat tangga dan tolak kotak.' },
    { src: '/denai/img/mesin.webp', w: 1200, h: 737, title: 'Fikir', alt: 'Stor kayu Level 1-1: pilih bilangan papan, jumlah kos C(x) = 4x + 6 dan bajet RM30', text: 'Matematik dibuat melalui tindakan: beli papan, susun mesin, pusing injap.' },
    { src: '/denai/img/jambatan.webp', w: 1200, h: 737, title: 'Bina', alt: 'Level 1-3: bacaan meter 13, pintu air terangkat, air surut dan batu loncatan timbul', text: 'Misi yang selesai mengubah dunia.' },
  ],
  menuShot: { src: '/denai/img/menu.webp', w: 1200, h: 675, alt: 'Skrin menu DENAI: Jejak Taman Fungsi' },
};

const isAvailable = (id) => visibleStatus(NOTE_STATUS[id]);

/** All 18 chapters in DSKP order, with availability. */
export const CHAPTERS = CURRICULUM.map((c) => ({
  id: c.id, form: c.form, number: c.number, title: c.title,
  package: c.package, bidang: c.bidang, track: c.track,
  standards: c.contentStandards.map((s) => ({ code: s.code, title: s.title })),
  available: isAvailable(c.id),
  hasGame: c.id === GAME.chapter,
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

/** Up to `max` auto-checkable questions for one subtopic, in authored order. */
export function exerciseSet(ch, subId, max = 5) {
  return ch.questions.filter((q) => q.subtopic === subId && AUTO.has(q.type) && !q.parts).slice(0, max);
}
export const exerciseCount = (ch, subId) => exerciseSet(ch, subId).length;

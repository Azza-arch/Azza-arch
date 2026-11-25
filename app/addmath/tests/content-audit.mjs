// Content completion audit: one row per subtopic of all 18 DSKP chapters,
// counted from the real content files (nothing hand-typed).
//   node app/addmath/tests/content-audit.mjs            (markdown to stdout)
// Columns
//   SP        learning standards with concept + example + ≥1 question / all SP of the subtopic
//   Obj       learning objective line (V3 `lead`)
//   Nota      concept sections · formula block · visuals · common-mistake items
//   Contoh    worked examples
//   Auto      auto-checked questions (mcq / numeric / expression) — the hub practice pool
//   Bebas     of those, answers re-derived independently by validate-notes (check kind ≠ manual)
//   Str/Pn    structured / reasoning questions (written practice, model solution)
//   MK        auto questions with targeted misconception feedback (MCQ options or `wrong` values)
//   Ptj       questions with progressive hints in the hub (≥ 3 solution steps)
import { CURRICULUM } from '../src/content/curriculum.js';
import { NOTE_MODULES, attachV3 } from '../src/content/notes/index.js';

const AUTO = new Set(['mcq', 'numeric', 'expression']);
const out = [];
const tot = { sub: 0, ex: 0, q: 0, auto: 0, indep: 0, str: 0, rsn: 0, mk: 0, hint: 0 };
const indep = (q) => (q.type === 'mcq' ? q.check?.kind !== 'manual' : true); // numeric/expression always re-solved (validator errors otherwise)
const mk = (q) => (q.type === 'mcq' ? q.options.filter((o) => !o.correct).every((o) => o.feedback) : (q.wrong || []).length > 0);

out.push('| Bab | Subtopik | Status | SP | Obj | Nota (konsep·rumus·visual·kesilapan) | Contoh | Auto | Bebas | Str/Pn | MK | Ptj |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const c of CURRICULUM) {
  const load = NOTE_MODULES[c.id];
  if (!load) { for (const s of c.contentStandards) out.push(`| ${c.id} | ${s.code} ${s.title} | belum ditulis | 0/${s.learningStandards.length} | – | – | 0 | 0 | 0 | 0/0 | 0 | 0 |`); continue; }
  const { CHAPTER } = await load(); await attachV3(c.id, CHAPTER);
  const qs = CHAPTER.questions || [];
  for (const s of CHAPTER.subtopics) {
    const sec = (k) => s.sections.filter((x) => x.kind === k);
    const items = (k) => sec(k).reduce((n, x) => n + (x.items || []).length, 0);
    const sq = qs.filter((q) => q.subtopic === s.id);
    const auto = sq.filter((q) => AUTO.has(q.type));
    const spOk = s.sp.filter((sp) => sec('concept').some((x) => (x.sp || []).includes(sp)) && sec('examples').some((x) => x.items.some((e) => (e.sp || []).includes(sp))) && qs.some((q) => (q.sp || []).includes(sp))).length;
    const r = { ex: items('examples'), auto: auto.length, indep: auto.filter(indep).length, str: sq.filter((q) => q.type === 'structured').length, rsn: sq.filter((q) => q.type === 'reasoning').length, mk: auto.filter(mk).length, hint: sq.filter((q) => (q.solution || []).length >= 3).length };
    tot.sub++; tot.ex += r.ex; tot.q += sq.length; for (const k of ['auto', 'indep', 'str', 'rsn', 'mk', 'hint']) tot[k] += r[k];
    out.push(`| ${c.id} | ${s.id} ${s.title} | ${s.status} | ${spOk}/${s.sp.length} | ${s.v3?.lead ? '✓' : '–'} | ${sec('concept').length}·${sec('formula').length ? '✓' : '–'}·${sec('visual').length}·${items('mistakes')} | ${r.ex} | ${r.auto} | ${r.indep} | ${r.str}/${r.rsn} | ${r.mk}/${r.auto} | ${r.hint}/${sq.length} |`);
  }
}
out.push('', `**Jumlah:** ${tot.sub} subtopik · ${tot.ex} contoh · ${tot.q} soalan (${tot.auto} auto, ${tot.indep} dengan jawapan disemak bebas, ${tot.str} berstruktur, ${tot.rsn} penaakulan) · maklum balas salah faham ${tot.mk}/${tot.auto} · petunjuk berperingkat ${tot.hint}/${tot.q}`);
console.log(out.join('\n'));

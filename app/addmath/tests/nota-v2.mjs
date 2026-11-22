import assert from 'node:assert/strict';
import { CHAPTER } from '../src/content/notes/t4-2.js';
import { PLAN, FORMULA_GUIDES, coverageManifest } from '../src/notes/v2/quadraticPlan.js';
import { chapterById } from '../src/content/curriculum.js';
const manifest = coverageManifest(CHAPTER);
const sub = CHAPTER.subtopics.find(s => s.id === '2.3');
assert.equal(CHAPTER.status, 'review');
assert.equal(sub.status, 'review');
assert.equal(manifest.sections.length, sub.sections.length);
assert(manifest.sections.every(s => s.destination), 'every section must have a destination');
assert.deepEqual(PLAN.coreConcepts, sub.sections.flatMap((s, i) => s.kind === 'concept' ? [i] : []));
assert.deepEqual(PLAN.visuals, sub.sections.flatMap((s, i) => s.kind === 'visual' ? [i] : []));
assert.deepEqual(manifest.sp, chapterById('t4-2').contentStandards.find(s => s.code === '2.3').learningStandards);
for (const sp of manifest.sp) {
  assert(PLAN.coreConcepts.some(i => sub.sections[i].sp.includes(sp)), `${sp} taught in visible core`);
  assert(manifest.examples.some(e => e.sp.includes(sp)), `${sp} exemplified`);
  assert(manifest.questions.some(q => q.sp.includes(sp)), `${sp} practised`);
}
assert.equal(manifest.examples.length, 7);
assert.equal(manifest.examples.filter(e => e.destination === 'fahami/featured').length, 2);
assert.equal(manifest.questions.length, CHAPTER.questions.length);
assert.equal(new Set(manifest.questions.map(q => q.id)).size, 30);
for (const s of CHAPTER.subtopics) {
  assert.equal(FORMULA_GUIDES[s.id].length, s.sections.find(x => x.kind === 'formula').items.length);
  for (const guide of FORMULA_GUIDES[s.id]) assert.equal(s.sections[guide.section].kind, 'concept');
}
console.log('PASS V2: 14/14 sections, 7/7 examples, 30/30 questions; every SP 2.3.1–2.3.6 taught, exemplified and practised. All review.');

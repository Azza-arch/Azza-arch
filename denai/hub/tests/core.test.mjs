// Unit tests for the hub's pure core: events, store sanitising, mastery, set selection.
// Usage: node denai/hub/tests/core.test.mjs
import assert from 'node:assert/strict';
import { sanitizeEvent, attempt, noteDone, setDone, EVENT_VERSION } from '../js/core/events.js';
import { sanitizeState } from '../js/core/store.js';
import { outcomes, levelFor, poolOf, bySp } from '../js/core/mastery.js';
import { pickSet, mulberry32 } from '../js/core/practice.js';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`); };

const day = (d, h = 10) => new Date(Date.UTC(2026, 10, d, h)).toISOString();
const q = (id, difficulty = 'mudah', type = 'numeric') => ({ id, difficulty, type, sp: ['1.1.3'] });
const A = (qq, set, tryNo, ok, at) => ({ ...attempt({ ch: 't4-1', sub: '1.1', q: qq, set, tryNo, ok }), at });

console.log('events');
test('valid events survive sanitising unchanged', () => {
  const e = A(q('t4-1.1-01'), 's1', 1, true, day(1));
  assert.deepEqual(sanitizeEvent(e), e);
  assert.ok(sanitizeEvent(noteDone('t4-1', '1.1')));
  assert.ok(sanitizeEvent(setDone({ ch: 't4-1', sub: '1.1', set: 's1', total: 5, first: 3, right: 4 })));
});
test('malformed or foreign events are dropped', () => {
  assert.equal(sanitizeEvent(null), null);
  assert.equal(sanitizeEvent({ v: 2, t: 'note-done', at: day(1), ch: 't4-1', sub: '1.1' }), null);
  assert.equal(sanitizeEvent({ v: EVENT_VERSION, t: 'note-done', at: 'yesterday', ch: 't4-1', sub: '1.1' }), null);
  assert.equal(sanitizeEvent({ v: EVENT_VERSION, t: 'attempt', at: day(1), ch: 't4-1', sub: '1.1', q: 'x', set: 's', try: 3, ok: true }), null);
  assert.equal(sanitizeEvent({ v: EVENT_VERSION, t: 'set-done', at: day(1), ch: 't4-1', sub: '1.1', set: 's', total: 5, first: 4, right: 3 }), null);
  assert.equal(sanitizeEvent({ v: EVENT_VERSION, t: 'note-done', at: day(1), ch: '<script>', sub: '1.1' }), null);
});
test('no free text: unknown fields are not kept', () => {
  const e = sanitizeEvent({ ...A(q('a'), 's1', 1, true, day(1)), name: 'Aina', email: 'x@y' });
  assert.equal(e.name, undefined); assert.equal(e.email, undefined);
});

console.log('store');
test('garbage state → empty record; valid parts kept', () => {
  assert.deepEqual(sanitizeState('nope'), { v: 1, events: [], active: {} });
  const s = sanitizeState({ v: 1, events: [A(q('a'), 's1', 1, true, day(1)), { bad: 1 }], active: { 't4-1/1.1': { id: 's1', qids: ['a', 'b'], results: [{ q: 'a', first: true, ok: true }], cur: { try: 2, wrong: [1] } }, 'bad key': {} } });
  assert.equal(s.events.length, 1);
  assert.deepEqual(Object.keys(s.active), ['t4-1/1.1']);
  assert.equal(s.active['t4-1/1.1'].cur.try, 2);
});

console.log('mastery');
const pool5 = poolOf([q('a'), q('b'), q('c', 'sederhana'), q('d', 'sederhana'), q('e', 'mencabar')]);
test('no attempts → belum', () => assert.equal(levelFor([], pool5), 'belum'));
test('one wrong answer → mencuba', () => assert.equal(levelFor(outcomes([A(q('a'), 's1', 1, false, day(1)), A(q('a'), 's1', 2, false, day(1))]), pool5), 'mencuba'));
test('second-try success is not a first-try success', () => {
  const r = outcomes([A(q('a'), 's1', 1, false, day(1)), A(q('a'), 's1', 2, true, day(1))]);
  assert.equal(r[0].kind, 'second');
});
test('3 first-try right but all Asas → still mencuba (needs Sederhana)', () => {
  const ev = ['a', 'b', 'a'].map((id, i) => A(q(id), `s${i}`, 1, true, day(1)));
  ev.push(A(q('x'), 's9', 1, true, day(1)));
  assert.equal(levelFor(outcomes(ev), pool5), 'mencuba');
});
test('3 distinct first-try incl. Sederhana → faham', () => {
  const ev = [A(q('a'), 's1', 1, true, day(1)), A(q('b'), 's1', 1, true, day(1)), A(q('c', 'sederhana'), 's1', 1, true, day(1))];
  assert.equal(levelFor(outcomes(ev), pool5), 'faham');
});
test('mahir needs Cabaran, a clean last 5 and two different days', () => {
  const s1 = ['a', 'b', 'c', 'd', 'e'].map((id) => A(q(id, { c: 'sederhana', d: 'sederhana', e: 'mencabar' }[id] || 'mudah'), 's1', 1, true, day(1)));
  assert.equal(levelFor(outcomes(s1), pool5), 'faham', 'one day only');
  const s2 = ['a', 'b', 'c', 'd', 'e'].map((id) => A(q(id, { c: 'sederhana', d: 'sederhana', e: 'mencabar' }[id] || 'mudah'), 's2', 1, true, day(3)));
  assert.equal(levelFor(outcomes([...s1, ...s2]), pool5), 'mahir');
  const slip = [...s1, ...s2, A(q('a'), 's3', 1, false, day(4)), A(q('a'), 's3', 2, true, day(4))];
  assert.equal(levelFor(outcomes(slip), pool5), 'faham', 'a recent slip drops mahir');
});
test('small pools stay reachable', () => {
  const tiny = poolOf([q('a'), q('b')]);
  const ev = [A(q('a'), 's1', 1, true, day(1)), A(q('b'), 's1', 1, true, day(2))];
  assert.equal(levelFor(outcomes(ev), tiny), 'mahir');
});
test('per-SP view counts results', () => {
  const r = outcomes([A(q('a'), 's1', 1, true, day(1)), A(q('b'), 's1', 1, false, day(1))]);
  assert.deepEqual(bySp(r), [{ sp: '1.1.3', first: 1, second: 0, miss: 1 }]);
});

console.log('practice sets');
const bank = [...'abcdefghij'].map((id, i) => q(id, ['mudah', 'mudah', 'mudah', 'sederhana', 'sederhana', 'sederhana', 'sederhana', 'mencabar', 'mencabar', 'mencabar'][i]));
test('5 questions, mixed difficulty, easiest first', () => {
  const ids = pickSet(bank, [], [], mulberry32(1));
  const d = ids.map((id) => bank.find((x) => x.id === id).difficulty);
  assert.equal(ids.length, 5);
  assert.deepEqual(d, ['mudah', 'mudah', 'sederhana', 'sederhana', 'mencabar']);
});
test('"Latihan lagi" avoids the previous set when the pool allows', () => {
  const first = pickSet(bank, [], [], mulberry32(2));
  const second = pickSet(bank, [], first, mulberry32(3));
  assert.ok(second.filter((id) => first.includes(id)).length <= 1, `${first} vs ${second}`);
});
test('within a difficulty, missed questions come before mastered ones', () => {
  // Asas bank is a, b, c; a and b mastered, c missed → c is picked, plus only one of a/b to reach the 2-Asas mix.
  const hist = [{ q: 'a', kind: 'first' }, { q: 'b', kind: 'first' }, { q: 'c', kind: 'miss' }];
  const ids = pickSet(bank, hist, [], mulberry32(4));
  assert.ok(ids.includes('c') && !(ids.includes('a') && ids.includes('b')), String(ids));
});
test('pool smaller than 5 → whole pool', () => assert.equal(pickSet(bank.slice(0, 3), [], [], mulberry32(5)).length, 3));

console.log(`\n${n} core tests passed`);

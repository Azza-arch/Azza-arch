const assert = require('assert');
const engine = require('../src/gameplay/practiceEngine.js');
const stories = require('../src/data/stories.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
test('verb question has one exact answer and three unique choices', () => {
  const question = engine.verbQuestion(stories['doing-homework'], 'pastSimple');
  assert.strictEqual(question.answer, 'wrote');
  assert.strictEqual(question.options.length, 3);
  assert.strictEqual(new Set(question.options).size, 3);
  assert.ok(question.options.includes('wrote'));
  assert.match(question.prompt, /Aina _____ with a pencil/);
});
test('time question preserves the exact sentence and tense answer', () => {
  const question = engine.timeQuestion(stories['the-new-phone'], 'presentSimple');
  assert.strictEqual(question.prompt, 'The boy shows the phone to Aina.');
  assert.strictEqual(question.answer, 'presentSimple');
});
test('adaptive queue prioritises a story with recorded errors', () => {
  const errors = { presentSimple: { 'doing-homework': { total: 3 } }, pastSimple: {} };
  const mastery = { presentSimple: { storyOrder: {}, wordOrder: {} }, pastSimple: { storyOrder: {}, wordOrder: {} } };
  assert.strictEqual(engine.queue(stories, 'presentSimple', mastery, errors)[0].id, 'doing-homework');
});
test('other tense switches only between public tenses', () => { assert.strictEqual(engine.otherTense('presentSimple'), 'pastSimple'); assert.strictEqual(engine.otherTense('pastSimple'), 'presentSimple'); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

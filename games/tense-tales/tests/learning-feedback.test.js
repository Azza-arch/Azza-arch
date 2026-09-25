const assert = require('assert');
const feedback = require('../src/gameplay/learningFeedback.js');
const stories = require('../src/data/stories.js');
const wordOrder = require('../src/gameplay/wordOrder.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
test('comparison generates exact present and past forms', () => {
  const result = feedback.comparison(stories['doing-homework'].wordChallenge, 'presentSimple');
  assert.strictEqual(result.selected.sentence, 'Aina writes with a pencil.');
  assert.strictEqual(result.other.sentence, 'Aina wrote with a pencil.');
  assert.strictEqual(result.selected.subject, 'Aina');
  assert.strictEqual(result.selected.verb, 'writes');
});
test('word hint identifies a missing subject first', () => {
  const result = feedback.wordHint(stories['climbing-the-tree'].wordChallenge, 'pastSimple', ['walked', 'The', 'boy'], wordOrder.tokenize, 1);
  assert.match(result.body, /“The boy” first/);
});
test('word hint identifies the tense verb after a correct subject', () => {
  const result = feedback.wordHint(stories['climbing-the-tree'].wordChallenge, 'pastSimple', ['The', 'boy', 'tree', 'walked'], wordOrder.tokenize, 1);
  assert.match(result.body, /“walked”/);
  assert.match(result.body, /Past Simple/);
});
test('story hints become more specific across attempts', () => {
  const story = stories['the-new-phone'];
  assert.notStrictEqual(feedback.storyHint(story, 1).body, feedback.storyHint(story, 3).body);
  assert.match(feedback.storyHint(story, 3).body, /Holds the phone/);
  assert.match(feedback.storyHint(story, 3).body, /Children cheer/);
});
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

const assert = require('assert');
const store = require('../src/gameplay/masteryStore.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
function memory(initial) { let value = initial || null; return { getItem: () => value, setItem: (key, next) => { value = next; } }; }
test('malformed storage safely returns empty mastery', () => { assert.deepStrictEqual(store.load(memory('{bad')), store.empty()); });
test('clean completion is mastered', () => { const storage = memory(); store.record('presentSimple', 'storyOrder', 1, 0, storage); assert.strictEqual(store.status('presentSimple', 'storyOrder', 1, storage), 'mastered'); });
test('completion after retries is practising', () => { const storage = memory(); store.record('pastSimple', 'wordOrder', 2, 2, storage); assert.strictEqual(store.status('pastSimple', 'wordOrder', 2, storage), 'practising'); });
test('replay can improve best mastery without affecting other branches', () => { const storage = memory(); store.record('pastSimple', 'wordOrder', 2, 2, storage); store.record('pastSimple', 'wordOrder', 2, 0, storage); assert.strictEqual(store.status('pastSimple', 'wordOrder', 2, storage), 'mastered'); assert.strictEqual(store.status('presentSimple', 'wordOrder', 2, storage), 'ready'); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

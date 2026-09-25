const assert = require('assert');
const store = require('../src/gameplay/progressStore.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
function memory(initial) { let value = initial || null; return { getItem: () => value, setItem: (key, next) => { value = next; } }; }
test('defaults unlock level 1 independently for all four branches', () => { assert.deepStrictEqual(store.load(memory()), store.defaults()); });
test('malformed storage safely returns defaults', () => { assert.deepStrictEqual(store.load(memory('{bad json')), store.defaults()); });
test('unlock advances only the selected tense and mode', () => { const storage = memory(); const result = store.unlock('presentSimple', 'storyOrder', 1, storage); assert.strictEqual(result.presentSimple.storyOrder, 2); assert.strictEqual(result.presentSimple.wordOrder, 1); assert.strictEqual(result.pastSimple.storyOrder, 1); });
test('unlock never regresses and caps at level 5', () => { const storage = memory(); store.unlock('pastSimple', 'wordOrder', 5, storage); store.unlock('pastSimple', 'wordOrder', 1, storage); assert.strictEqual(store.load(storage).pastSimple.wordOrder, 5); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

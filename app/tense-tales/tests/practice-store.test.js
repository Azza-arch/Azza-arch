const assert = require('assert');
const store = require('../src/gameplay/practiceStore.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
function memory(initial) { let value = initial || null; return { getItem: () => value, setItem: (key, next) => { value = next; } }; }
test('malformed practice history safely recovers', () => { assert.deepStrictEqual(store.load(memory('{bad')), store.empty()); });
test('errors remain independent by tense and activity', () => { const storage = memory(); store.recordError('pastSimple', 'doing-homework', 'verbChoice', storage); const data = store.load(storage); assert.strictEqual(data.pastSimple['doing-homework'].verbChoice, 1); assert.strictEqual(data.pastSimple['doing-homework'].timeSort, 0); assert.deepStrictEqual(data.presentSimple, {}); });
test('a later success reduces the relevant practice priority', () => { const storage = memory(); store.recordError('presentSimple', 'the-new-phone', 'timeSort', storage); store.recordSuccess('presentSimple', 'the-new-phone', 'timeSort', storage); assert.strictEqual(store.load(storage).presentSimple['the-new-phone'].total, 0); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

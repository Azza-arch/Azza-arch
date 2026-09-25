const assert = require('assert');
const wordOrder = require('../src/gameplay/wordOrder.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
test('tokenize creates individual words and removes final punctuation', () => { assert.deepStrictEqual(wordOrder.tokenize('The boy walked toward the tree.'), ['The', 'boy', 'walked', 'toward', 'the', 'tree']); });
test('shuffle preserves every word and never returns the solved order', () => { const words = ['Aina', 'waters', 'the', 'flower']; const result = wordOrder.shuffled(words, () => 0); assert.deepStrictEqual(result.slice().sort(), words.slice().sort()); assert.notDeepStrictEqual(result, words); });
test('validation requires exact word order', () => { assert.strictEqual(wordOrder.isCorrect(['The', 'boy', 'reads'], ['The', 'boy', 'reads']), true); assert.strictEqual(wordOrder.isCorrect(['boy', 'The', 'reads'], ['The', 'boy', 'reads']), false); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

const assert = require('assert');
const audio = require('../src/utils/audioManager.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
function memory(initial) { let value = initial || null; return { getItem: () => value, setItem: (key, next) => { value = next; } }; }
test('audio defaults are safe and narration is enabled', () => { assert.deepStrictEqual(audio.load(memory()), audio.defaults()); });
test('malformed settings recover to defaults', () => { assert.deepStrictEqual(audio.load(memory('{bad')), audio.defaults()); });
test('volume is clamped to a valid range', () => { assert.strictEqual(audio.normalize({ volume: 4 }).volume, 1); assert.strictEqual(audio.normalize({ volume: -2 }).volume, 0); });
test('mute preference persists and toggles', () => { const storage = memory(); assert.strictEqual(audio.toggleMuted(storage).muted, true); assert.strictEqual(audio.toggleMuted(storage).muted, false); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

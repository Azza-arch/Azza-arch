const assert = require('assert');
const motion = require('../src/utils/sceneMotion.js');
let passed = 0; let failed = 0;
function test(name, fn) { try { fn(); passed += 1; console.log(`PASS  ${name}`); } catch (error) { failed += 1; console.log(`FAIL  ${name}`); console.log(`      ${error.message}`); } }
test('walking motion moves the actor horizontally', () => { const plan = motion.motionFor({ actionLabel: 'Walks to the tree' }); assert.strictEqual(plan.target, 'actor'); assert.ok(plan.x > 0); });
test('climbing motion moves the actor upward', () => { const plan = motion.motionFor({ actionLabel: 'Climbs higher' }); assert.strictEqual(plan.target, 'actor'); assert.ok(plan.y < 0); });
test('writing motion targets the held prop', () => { const plan = motion.motionFor({ actionLabel: 'Writes with a pencil' }); assert.strictEqual(plan.target, 'prop'); });
console.log(`\n${passed} passed, ${failed} failed`); process.exit(failed === 0 ? 0 : 1);

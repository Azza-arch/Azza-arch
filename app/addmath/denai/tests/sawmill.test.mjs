// Level 1-1 sawmill (Phase C): g(b) = 3b − 1, jetty needs exactly 11 planks. Run: node tests/sawmill.test.mjs
import assert from 'node:assert/strict';
import { sawmillPlanks, sawmillFeedback, nextLogs, SAWMILL_TARGET, MAX_LOGS } from '../src/v14/levels/sawmill.js';
assert.equal(SAWMILL_TARGET, 11);
assert.deepEqual([1, 2, 3, 4, 5, 6].map(sawmillPlanks), [2, 5, 8, 11, 14, 17]);
assert.deepEqual([1, 2, 3, 4, 5, 6].filter((b) => sawmillFeedback(b).done), [4], 'only b = 4 builds the jetty');
assert.equal(sawmillFeedback(3).diff, -3); assert.equal(sawmillFeedback(5).diff, 3);
assert.deepEqual(Array.from({ length: 7 }, (_, i) => nextLogs(i)), [1, 2, 3, 4, 5, 6, 1]);
assert.equal(MAX_LOGS, 6);
console.log('sawmill: ok');

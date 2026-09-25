const assert=require('assert');const policy=require('../src/gameplay/sessionPolicy.js');
assert.strictEqual(policy.shouldSaveProgress({active:false,saveProgress:false}),true);
assert.strictEqual(policy.shouldSaveProgress({active:true,saveProgress:false}),false,'teacher launch isolates learner progress by default');
assert.strictEqual(policy.shouldSaveProgress({active:true,saveProgress:true}),true,'teacher may explicitly opt into local progress');
assert.strictEqual(policy.assistance({active:true,assistance:'challenge'},{assistance:'guided'}),'challenge');
assert.strictEqual(policy.assistance({active:false},{assistance:'standard'}),'standard');
console.log('session-policy.test.js: all tests passed');

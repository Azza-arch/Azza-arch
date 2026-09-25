const assert = require('assert');
const profile = require('../src/gameplay/learnerProfile.js');
function storage(seed){let value=seed||null;return{getItem(){return value;},setItem(k,v){value=v;}};}
let s=storage();
assert.deepStrictEqual(profile.load(s),profile.defaults());
profile.record({firstTry:true,errors:0,activity:{tense:'presentSimple',mode:'storyOrder',level:1}},s);
profile.record({firstTry:true,errors:0,activity:{tense:'presentSimple',mode:'storyOrder',level:2}},s);
let p=profile.record({firstTry:true,errors:0,activity:{tense:'presentSimple',mode:'storyOrder',level:3}},s);
assert.strictEqual(p.assistance,'standard','three first-try completions reduce support');
p=profile.record({firstTry:false,errors:2,activity:{tense:'presentSimple',mode:'storyOrder',level:4}},s);
p=profile.record({firstTry:false,errors:2,activity:{tense:'presentSimple',mode:'storyOrder',level:4}},s);
assert.strictEqual(p.assistance,'guided','two difficult activities restore guided support');
assert.deepStrictEqual(profile.recommendation(profile.defaults()),{tense:'presentSimple',mode:'storyOrder',level:1});
console.log('learner-profile.test.js: all tests passed');

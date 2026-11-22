import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as v10 from '../src/v10/level.js';
import * as v9 from '../src/level.js';
import {SaveManager,sanitize} from '../src/v10/save.js';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
test('isolated full world keeps exact original movement and mathematical questions',()=>{
 assert.equal(v10.MOTION,v9.MOTION);assert.deepEqual(v10.WORLD,{width:8400,height:1600,gravity:1400});
 assert.equal(v10.BATCH_END,8400);assert.equal(v10.BASELINE_QUESTIONS,v9.PUZZLES);
 for(const [i,n] of [[0,7],[1,4],[2,5]])assert.equal(v10.BASELINE_QUESTIONS[i].check(n).correct,true);
});
test('actual batch geometry agrees with approved tables',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../../../../audits/level-v10/master-architecture/proposed-world.json',import.meta.url)));
 assert.deepEqual(v10.SURFACES,d.surfaces);
 for(const l of v10.LADDERS)for(const feet of [l.top,l.bottom]) assert.ok(v10.SURFACES.some(s=>l.x>s.x+14&&l.x<s.x+s.width-14&&s.y===feet));
});
test('gate cannot be jumped from ground or optional cafe',()=>{
 const {jump:j,speed:v,bodyWidth:w,coyote}=v10.MOTION,g=v10.WORLD.gravity;
 assert.ok(v10.GATES[0].width>2*j/g*v+w+v*coyote/1000);
 const drop270=v*(j+Math.sqrt(j*j+2*g*270))/g+w+v*coyote/1000;
 assert.ok(2376-1944>drop270);
});
test('legacy import is explicit, accepts v1/v2, leaves old save bytes intact',()=>{
 for(const schemaVersion of [1,2]){
  memory.clear();const old=JSON.stringify({schemaVersion,levelId:'lorong-atas-bumbung-1',checkpointId:'cp3-bridge',solvedGateIds:['workshop-gate','rooftop-gate','final-gate'],collectedCoinIds:['coin-a','coin-e1'],discoveredSecretIds:['secret-oyen','secret-function-note'],completed:true});
  memory.set('lorong-save-v1',old);assert.equal(SaveManager.load(),null);assert.equal(SaveManager.importLegacy(),true);
  const saved=SaveManager.load();assert.equal(saved.checkpointId,'cp-e');assert.deepEqual(saved.solvedGateIds,['gear','block']);assert.deepEqual(saved.finalLatches,{input:true,composition:false});assert.equal(saved.completed,false);
  assert.deepEqual(saved.collectedCoinIds,['coin-a','coin-e1']);assert.equal(saved.legacyProgress.completed,true);assert.equal(memory.get('lorong-save-v1'),old);
  assert.equal(SaveManager.importLegacy(),false);SaveManager.clear();assert.equal(memory.get('lorong-save-v1'),old);
 }
});
test('checkpoint sanitization rejects unsafe far bank without earned gate',()=>{
 memory.clear();SaveManager.save({checkpointId:'cp-b-exit',solvedGateIds:[]});assert.equal(SaveManager.load().checkpointId,null);
 SaveManager.save({checkpointId:'cp-b-exit',solvedGateIds:['gear']});assert.equal(SaveManager.load().checkpointId,'cp-b-exit');
 SaveManager.save({checkpointId:'cp-c',mappingInputs:[0,1,2,3],solvedGateIds:[]});assert.equal(SaveManager.load().checkpointId,'cp-c');assert.equal(SaveManager.load().mappingDone,true);
});
test('corrupt, wrong layout and unsupported saves fail safely',()=>{
 assert.equal(sanitize({schemaVersion:3,layoutVersion:9,levelId:SaveManager.LEVEL_ID}),null);
 assert.equal(sanitize({schemaVersion:4,layoutVersion:10,levelId:SaveManager.LEVEL_ID}),null);
 memory.set(SaveManager.STORAGE_KEY,'{bad');assert.equal(SaveManager.load(),null);
});

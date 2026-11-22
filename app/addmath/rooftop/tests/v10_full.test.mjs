import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as L from '../src/v10/level.js';
import * as V9 from '../src/level.js';
import {f,g,h,compose,inverse} from '../src/v10/math.js';
import {SaveManager,sanitize} from '../src/v10/save.js';
const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
test('original movement and all three questions remain the original objects',()=>{
 assert.equal(L.MOTION,V9.MOTION);assert.equal(L.BASELINE_QUESTIONS,V9.PUZZLES);assert.deepEqual(L.WORLD,{width:8400,height:1600,gravity:1400});
 [7,4,5].forEach((n,i)=>assert.equal(L.BASELINE_QUESTIONS[i].check(n).correct,true));
});
test('every installed surface exactly matches the approved candidate',()=>{
 const candidate=JSON.parse(fs.readFileSync(new URL('../src/v10/candidate-world.json',import.meta.url)));
 for(const s of L.SURFACES)assert.deepEqual(s,candidate.surfaces.find(c=>c.id===s.id));
 if(L.BUILD_STAGE===5){assert.equal(L.SURFACES.length,41);assert.equal(L.BATCH_END,8400);assert.deepEqual(L.GOAL,{x:8316,feet:1296});}
});
test('all ladder shafts are clear and endpoints land on real surfaces',()=>{
 for(const l of L.LADDERS){
  for(const feet of [l.top,l.bottom])assert.ok(L.SURFACES.some(s=>s.y===feet&&l.x>s.x+14&&l.x<s.x+s.width-14),l.id);
  assert.ok(!L.AB_TERRAIN.some(s=>s.x<l.x+14&&s.x+s.width>l.x-14&&s.y<l.bottom),l.id);
 }
});
test('all controls and checkpoints have a full body-width standing pad',()=>{
 for(const p of [...L.TERMINALS,...L.CHECKPOINTS])assert.ok(L.SURFACES.some(s=>s.kind!=='gate'&&s.y===p.feet&&p.x>s.x+14&&p.x<s.x+s.width-14),p.id);
});
test('gate cuts cannot be bypassed by full-speed coyote jumps',()=>{
 const bound=2*520/1400*280+28+280*.11;
 for(const g of L.GATES)assert.ok(g.width>bound+40);
 assert.ok(2376-1944>280*(520+Math.sqrt(520**2+2*1400*270))/1400+28+280*.11);
});
test('function arithmetic and composition order are accurate',()=>{
 assert.equal(f(3),7);assert.equal(g(4),10);assert.equal(h(5),17);
 assert.deepEqual([compose(3).middle,compose(3).output],[7,19]);assert.equal(compose(3,true).output,15);
 assert.deepEqual([compose(2).middle,compose(2).output],[5,13]);assert.equal(compose(2,true).output,9);
});
test('inverse is defined on the actual range, not the larger codomain',()=>{
 for(const n of [0,1,2,3])assert.equal(inverse(f(n)),n);
 assert.equal(inverse(2),null);assert.equal(inverse(8),null);assert.equal(inverse(7),3);
});
test('checkpoints cannot restore past an unearned gate; C is independent',()=>{
 mem.clear();SaveManager.save({checkpointId:'cp-c',solvedGateIds:[]});assert.equal(SaveManager.load().checkpointId,'cp-c');
 for(const cp of L.CHECKPOINTS.filter(c=>c.requires?.length)){
  SaveManager.save({checkpointId:cp.id,solvedGateIds:[]});assert.equal(SaveManager.load().checkpointId,null);
  SaveManager.save({checkpointId:cp.id,solvedGateIds:cp.requires});assert.equal(SaveManager.load().checkpointId,cp.id);
 }
});
test('future gate ids, broken prerequisite chains and false completions are rejected',()=>{
 mem.clear();SaveManager.save({solvedGateIds:['pipe','final'],completed:true});assert.deepEqual(SaveManager.load().solvedGateIds,[]);assert.equal(SaveManager.load().completed,false);
 SaveManager.save({solvedGateIds:['gear','block','pipe','final'],finalLatches:{input:true,composition:false},completed:true});assert.ok(!SaveManager.load().solvedGateIds.includes('final'));assert.equal(SaveManager.load().completed,false);
});
test('independent final latches and complete state survive round trips',()=>{
 if(L.BUILD_STAGE<5)return;
 mem.clear();SaveManager.save({checkpointId:'cp-g',solvedGateIds:['gear','block','pipe'],finalLatches:{input:true,composition:false},elapsedMs:1234});
 assert.deepEqual(SaveManager.load().finalLatches,{input:true,composition:false});assert.equal(SaveManager.load().elapsedMs,1234);
 SaveManager.save({...SaveManager.load(),solvedGateIds:['gear','block','pipe','final'],finalLatches:{input:true,composition:true},completed:true});assert.equal(SaveManager.load().completed,true);
});
test('explicit legacy v1/v2 imports preserve bytes and archive compatible discoveries',()=>{
 for(const schemaVersion of [1,2]){
  mem.clear();const old=JSON.stringify({schemaVersion,levelId:'lorong-atas-bumbung-1',checkpointId:'cp3-bridge',solvedGateIds:['workshop-gate','rooftop-gate','final-gate'],collectedCoinIds:['coin-a','coin-e1'],discoveredSecretIds:['secret-oyen','secret-function-note','secret-cave-treasure'],completed:true});mem.set('lorong-save-v1',old);
  assert.equal(SaveManager.load(),null);assert.equal(SaveManager.importLegacy(),true);const s=SaveManager.load();assert.deepEqual(s.solvedGateIds,['gear','block']);assert.equal(s.finalLatches.input,true);assert.equal(s.finalLatches.composition,false);assert.equal(s.completed,false);assert.equal(s.legacyProgress.completed,true);assert.equal(mem.get('lorong-save-v1'),old);
  SaveManager.clear();assert.equal(mem.get('lorong-save-v1'),old);
 }
});
test('old Batch1 saves load without earning new world completion',()=>{
 mem.clear();SaveManager.save({checkpointId:'cp-b-exit',solvedGateIds:['gear'],batch1Completed:true,completed:true,mappingInputs:[0,1,2,3]});const s=SaveManager.load();assert.equal(s.checkpointId,'cp-b-exit');assert.equal(s.completed,false);assert.equal(s.mappingDone,true);
});
test('malformed and wrong layout saves fail safely',()=>{
 mem.set(SaveManager.STORAGE_KEY,'not json');assert.equal(SaveManager.load(),null);assert.equal(sanitize({schemaVersion:3,layoutVersion:11,levelId:SaveManager.LEVEL_ID}),null);
});

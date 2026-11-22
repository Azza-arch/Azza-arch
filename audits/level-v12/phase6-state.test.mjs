import test from 'node:test';
import assert from 'node:assert/strict';
import {riverInput,riverOrder,riverStatus} from '../../app/addmath/rooftop/src/v12/finale.js';
import {sanitize} from '../../app/addmath/rooftop/src/v12/save.js';
import {COLLECTIBLES,SECRETS} from '../../app/addmath/rooftop/src/v12/level.js';
test('finale preserves h and approved V11 composition with real non-target outputs',()=>{
 assert.deepEqual(riverInput(4),{valid:true,output:13,correct:false});assert.equal(riverInput(5).output,17);assert.equal(riverInput(5).correct,true);
 assert.equal(riverInput(NaN).valid,false);assert.equal(riverInput(10).valid,false);
 assert.deepEqual(riverOrder('fg'),{intermediate:5,output:13,correct:true});assert.deepEqual(riverOrder('gf'),{intermediate:4,output:9,correct:false});assert.equal(riverOrder('unknown'),null);
});
const base={schemaVersion:1,layoutVersion:120,levelId:'denai-bab1-functions-v12',solvedGateIds:['lift','number-span','water-crossing'],waterOrder:'fg',waterworksState:'CROSSING_SAFE'};
test('partial finale cannot restore an unearned east-bank checkpoint or completion',()=>{
 const s=sanitize({...base,solvedGateIds:[...base.solvedGateIds,'river-input'],checkpointId:'g-river-east',completed:true});
 assert.equal(s.checkpointId,null);assert.equal(s.completed,false);assert.ok(!s.solvedGateIds.includes('river-crossing'));
 assert.match(riverStatus(new Set(s.solvedGateIds)),/Pengunci 1/);
});
test('optional rewards are never required for main completion and duplicate ids do not inflate results',()=>{
 const raw={...base,checkpointId:'g-goal',solvedGateIds:[...base.solvedGateIds,'river-input','river-composition','river-crossing'],completed:true,collectedCoinIds:['g-farbank','g-farbank','fake']};
 const s=sanitize(raw);
 assert.equal(sanitize({...raw,checkpointId:'g-river'}).completed,false);
 assert.equal(s.completed,true);assert.deepEqual(s.discoveredSecretIds,[]);assert.deepEqual(s.collectedCoinIds,['g-farbank']);
 assert.equal(COLLECTIBLES.find(c=>c.id==='c-return').requiresSecret,'bonus-mapping');assert.equal(SECRETS.find(s=>s.id==='bonus-mapping').puzzleTerminal,true);
});

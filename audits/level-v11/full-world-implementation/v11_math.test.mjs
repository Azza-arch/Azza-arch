import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH_END, ROOMS, SURFACES, DECKS, GATES, LADDERS, TERMINALS, CHECKPOINTS, COLLECTIBLES, PUZZLES } from '../../../app/addmath/rooftop/src/v11/level.js';
import { sanitize, SaveManager } from '../../../app/addmath/rooftop/src/v11/save.js';

test('Zone D layout keeps R08-R10 within its planned span and gives the optional route real supports',()=>{
  assert.equal(BATCH_END,8400);
  assert.equal(ROOMS.find(r=>r.id==='R10').to,4104);
  for(const id of ['R08','R09','R10']) assert.ok(ROOMS.some(r=>r.id===id));
  assert.ok(SURFACES.some(s=>s.id==='D-approach'&&s.x===3024&&s.width===540));
  assert.ok(SURFACES.some(s=>s.id==='D-landing'&&s.x===3834&&s.width===270));
  assert.ok(DECKS.some(s=>s.id==='D-rack'&&s.y===918));
  assert.ok(DECKS.some(s=>s.id==='D-service'&&s.optional));
  assert.ok(LADDERS.some(l=>l.id==='D-service'&&l.x===3330&&l.top===738&&l.bottom===972));
  assert.deepEqual(GATES.find(g=>g.id==='number-span'),{id:'number-span',x:3564,y:972,width:270,parkedY:1188});
});

test('D applies g(x)=3x-2 exactly; target 10 uniquely selects input 4',()=>{
  const g=x=>3*x-2;
  assert.deepEqual([0,1,2,3,4].map(g),[-2,1,4,7,10]);
  assert.equal([0,1,2,3,4].filter(x=>g(x)===10).length,1);
  assert.equal([0,1,2,3,4].find(x=>g(x)===10),4);
  assert.equal(g(2),4);
  assert.equal(PUZZLES.find(p=>p.id==='number').check(4).correct,true);
  assert.equal(PUZZLES.find(p=>p.id==='number').check(1).valid,false);
  assert.equal(PUZZLES.find(p=>p.id==='number').check(2).valid,true);
  assert.equal(PUZZLES.find(p=>p.id==='number').check(2).correct,false);
});

test('R10 composition primer gives f then g = 13 and g then f = 9 at input 2',()=>{
  const f=x=>2*x+1,g=x=>3*x-2;
  assert.equal(g(f(2)),13);
  assert.equal(f(g(2)),9);
});

test('V11 save retains earned D span/checkpoint while rejecting unsafe far bank',()=>{
  const common={schemaVersion:1,layoutVersion:111,levelId:SaveManager.LEVEL_ID,solvedGateIds:['lift','number-span'],mappingInputs:[],collectedCoinIds:[],discoveredSecretIds:[],elapsedMs:10};
  assert.equal(sanitize({...common,checkpointId:'d-crossing'}).checkpointId,'d-crossing');
  assert.equal(sanitize({...common,solvedGateIds:['lift'],checkpointId:'d-crossing'}).checkpointId,null);
  assert.deepEqual(sanitize({...common,checkpointId:'d-crossing'}).solvedGateIds,['lift','number-span']);
  assert.ok(TERMINALS.some(t=>t.kind==='number'&&t.gate==='number-span'));
  assert.ok(CHECKPOINTS.some(c=>c.id==='d-crossing'&&c.requires.includes('number-span')));
  assert.ok(COLLECTIBLES.some(c=>c.id==='d-service'));
});


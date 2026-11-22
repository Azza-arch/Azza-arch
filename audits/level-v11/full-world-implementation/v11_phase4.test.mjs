import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUILD_STAGE, BATCH_END, WORLD, GOAL, ROOMS, SURFACES, DECKS, LADDERS, GATES, TERMINALS, CHECKPOINTS, COLLECTIBLES, SECRETS, PUZZLES } from '../../../app/addmath/rooftop/src/v11/level.js';
import { sanitize, SaveManager } from '../../../app/addmath/rooftop/src/v11/save.js';

test('Phase 4 extends the existing Level 1 map through R16 and keeps the optional cave',()=>{
 assert.equal(BUILD_STAGE,4);assert.equal(BATCH_END,8400);assert.equal(WORLD.width,8400);assert.deepEqual(GOAL,{x:8316,feet:972});
 for(const id of ['R13','R14','R15','R16'])assert.ok(ROOMS.some(r=>r.id===id));
 assert.equal(ROOMS.find(r=>r.id==='R14').optional,true);
 const at=id=>SURFACES.find(s=>s.id===id);
 assert.deepEqual([at('F-entry').x,at('F-entry').y,at('F-entry').width],[5650,972,162]);
 assert.deepEqual([at('F-step1').x,at('F-step1').y,at('F-step1').width],[5812,918,162]);
 assert.deepEqual([at('F-step2').x,at('F-step2').y,at('F-step2').width],[5974,864,162]);
 assert.ok(DECKS.some(s=>s.id==='F-cave-roof'&&s.x===6136&&s.y===918&&s.width===432));
 assert.ok(LADDERS.some(l=>l.id==='F-cave-entry'&&l.top===918&&l.bottom===1134));
 assert.deepEqual([at('G-river-crossing').x,at('G-river-crossing').width],[7506,324]);
 assert.deepEqual(GATES.find(g=>g.id==='river-crossing'),{id:'river-crossing',x:7506,y:972,width:324,parkedY:1242});
 assert.equal(CHECKPOINTS.find(c=>c.id==='g-river-east').requires.includes('river-crossing'),true);
 assert.ok(TERMINALS.some(t=>t.kind==='river-final'&&t.gate==='river-crossing'));
 assert.ok(COLLECTIBLES.some(c=>c.id==='f-cave-gem'&&c.kind==='gem'&&c.requiresSecret==='f-inverse'));
 assert.ok(SECRETS.some(s=>s.id==='f-inverse'&&s.puzzleTerminal));
});

test('Final latch math and order switch calculate actual outputs',()=>{
 const h=x=>4*x-3,f=x=>2*x+1,g=x=>3*x-2;
 assert.equal(h(5),17);assert.equal(h(4),13);
 assert.equal(g(f(2)),13);assert.equal(f(g(2)),9);
 assert.deepEqual(PUZZLES.find(p=>p.id==='river-input').check(5),{valid:true,correct:true,output:17});
 assert.deepEqual(PUZZLES.find(p=>p.id==='river-input').check(4),{valid:true,correct:false,output:13});
 assert.deepEqual(PUZZLES.find(p=>p.id==='river-composition').check('fg'),{valid:true,correct:true,output:13});
 assert.deepEqual(PUZZLES.find(p=>p.id==='river-composition').check('gf'),{valid:true,correct:false,output:9});
});

test('Layout 111 saves migrate without losing earned progress; final completion is gated',()=>{
 const base={schemaVersion:1,layoutVersion:111,levelId:SaveManager.LEVEL_ID,checkpointId:'e-crossing',solvedGateIds:['lift','number-span','water-crossing'],mappingInputs:[0,1],collectedCoinIds:['e-waterwalk'],discoveredSecretIds:['bonus-mapping'],elapsedMs:1234,completed:true};
 const migrated=sanitize(base);assert.equal(migrated.layoutVersion,112);assert.equal(migrated.checkpointId,'e-crossing');assert.deepEqual(migrated.mappingInputs,[0,1]);assert.deepEqual(migrated.collectedCoinIds,['e-waterwalk']);assert.equal(migrated.completed,false);
 const final={...base,layoutVersion:112,checkpointId:'g-river-east',solvedGateIds:['lift','number-span','water-crossing','river-input','river-composition','river-crossing']};
 assert.equal(sanitize(final).checkpointId,'g-river-east');assert.equal(sanitize(final).completed,true);
 assert.equal(sanitize({...final,solvedGateIds:['lift','number-span','water-crossing','river-crossing']}).checkpointId,null);
});

test('Visual water is separate from collision and the final collider is installed after bridge settle',()=>{
 const source=readFileSync(new URL('../../../app/addmath/rooftop/src/v11/environment.js',import.meta.url),'utf8');
 const mechanisms=readFileSync(new URL('../../../app/addmath/rooftop/src/v11/mechanisms.js',import.meta.url),'utf8');
 assert.match(source,/for\(let x=7506;x<7830;x\+=54\).*tile\(33/);
 assert.match(source,/s\.riverBridge=s\.deck\(\{\.\.\.GATES\[3\],y:GATES\[3\]\.parkedY\}\)/);
 assert.ok(mechanisms.indexOf("this.gateBodies['river-crossing']=this.platform")>mechanisms.indexOf('targets:this.riverBridge,y:GATES[3].y'));
 assert.match(mechanisms,/restoreRiver\(\)/);
});

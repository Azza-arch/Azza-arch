import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { BATCH_END, ROOMS, SURFACES, DECKS, GATES, LADDERS, TERMINALS, CHECKPOINTS, COLLECTIBLES, PUZZLES, MOTION } from '../../../app/addmath/rooftop/src/v11/level.js';
import { sanitize, SaveManager } from '../../../app/addmath/rooftop/src/v11/save.js';

test('R11-R12 use supported low works, stepped access, cave recovery and recessed pool',()=>{
  assert.equal(BATCH_END,8400);
  assert.deepEqual(ROOMS.find(r=>r.id==='R11'),{id:'R11',zone:'E',from:4104,to:4860,name:'Laluan paip air'});
  assert.deepEqual(ROOMS.find(r=>r.id==='R12'),{id:'R12',zone:'E',from:4860,to:5650,name:'Komposisi dan takungan'});
  const top=id=>SURFACES.find(s=>s.id===id);
  assert.deepEqual([top('E-entry').x,top('E-entry').y,top('E-entry').width],[4104,972,162]);
  assert.deepEqual([top('E-step').x,top('E-step').y,top('E-step').width],[4266,918,108]);
  assert.deepEqual([top('E-source-terrace').x,top('E-source-terrace').y,top('E-source-terrace').width],[4374,864,216]);
  assert.equal(top('E-step').y-top('E-source-terrace').y,54);
  assert.deepEqual([top('E-recovery').x,top('E-recovery').y,top('E-recovery').width],[4590,1188,270]);
  assert.ok(DECKS.some(s=>s.id==='E-cave-walkway'&&s.x===4590&&s.y===972&&s.width===270));
  assert.ok(LADDERS.some(l=>l.id==='E-cave-ladder'&&l.x===4806&&l.top===972&&l.bottom===1188));
  assert.deepEqual([top('E-pool-floor').x,top('E-pool-floor').y,top('E-pool-floor').width],[5022,1026,162]);
  assert.deepEqual([top('E-control-bank').x,top('E-control-bank').y,top('E-control-bank').width],[5184,972,108]);
  assert.equal(LADDERS.some(l=>l.id==='E-entry'),false);
  assert.ok(COLLECTIBLES.some(c=>c.id==='e-waterwalk'&&c.x===4644&&c.y===1158));
  assert.ok(CHECKPOINTS.some(c=>c.id==='e-entry'&&c.x===4122&&c.feet===972));
  assert.ok(CHECKPOINTS.some(c=>c.id==='e-crossing'&&c.requires.includes('water-crossing')));
  assert.equal(MOTION.bodyHeight,60);
});


test('frame-94 inlet elbow meets its vertical riser and both risers enter the same basin',()=>{
  const elbowTileX=5022, inletTileX=5022, outletTileX=5130, tileSize=54;
  const elbowOutletCenter=elbowTileX+tileSize/2;
  const inletCenter=inletTileX+tileSize/2;
  const outletCenter=outletTileX+tileSize/2;
  assert.equal(elbowOutletCenter,inletCenter);
  const pool= SURFACES.find(s=>s.id==='E-pool-floor');
  assert.ok(inletCenter>=pool.x&&inletCenter<pool.x+pool.width);
  assert.ok(outletCenter>=pool.x&&outletCenter<pool.x+pool.width);
  const environment=readFileSync(new URL('../../../app/addmath/rooftop/src/v11/environment.js',import.meta.url),'utf8');
  assert.match(environment,/tile\(94,5022,783/);
  assert.match(environment,/tile\(95,5022,837/);
});

test('Zone E composition distinguishes g(f(3))=19 from f(g(3))=15',()=>{
  const f=x=>2*x+1,g=x=>3*x-2;
  assert.equal(f(3),7);
  assert.equal(g(f(3)),19);
  assert.equal(g(3),7);
  assert.equal(f(g(3)),15);
  assert.deepEqual(PUZZLES.find(p=>p.id==='water-crossing').check('fg'),{valid:true,correct:true,output:19});
  assert.deepEqual(PUZZLES.find(p=>p.id==='water-crossing').check('gf'),{valid:true,correct:false,output:15});
  assert.deepEqual(PUZZLES.find(p=>p.id==='water-crossing').check('multiply'),{valid:false,correct:false,output:null});
  assert.ok(TERMINALS.some(t=>t.kind==='water-composition'&&t.gate==='water-crossing'));
  assert.deepEqual(GATES.find(gate=>gate.id==='water-crossing'),{id:'water-crossing',x:5292,y:972,width:216,parkedY:1188});
  assert.equal(SURFACES.find(s=>s.id==='E-far-bank').width,142);
  assert.equal(TERMINALS.find(t=>t.kind==='water-composition').x,5238);
});

test('E crossing checkpoint is accepted only after saved gate state',()=>{
  const common={schemaVersion:1,layoutVersion:111,levelId:SaveManager.LEVEL_ID,solvedGateIds:['lift','number-span','water-crossing'],mappingInputs:[],collectedCoinIds:['e-waterwalk'],discoveredSecretIds:[],elapsedMs:200};
  assert.equal(sanitize({...common,checkpointId:'e-crossing'}).checkpointId,'e-crossing');
  assert.equal(sanitize({...common,solvedGateIds:['lift','number-span'],checkpointId:'e-crossing'}).checkpointId,null);
  assert.ok(CHECKPOINTS.some(c=>c.id==='e-entry'));
  assert.ok(COLLECTIBLES.some(c=>c.id==='e-waterwalk'));
});

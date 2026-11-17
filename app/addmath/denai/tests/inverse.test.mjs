import assert from 'node:assert/strict';
import {forward,reverseOutput,newPuzzle,puzzleCommand,solved,SEAL_OUTPUTS,sanitizePuzzle,work,stage} from '../src/v14/levels/inverse.js';
import {createInverseStore,newRun,KEY} from '../src/v14/core/inverse-campaign.js';
import {AB_TERRAIN,DECKS,LADDERS,CHECKPOINTS,CHANNEL,COINS,SECRETS,GOAL,WATER,WATERFALL} from '../src/v14/levels/inverse-world.js';
import {newSluice} from '../src/v14/levels/sluice-model.js';
import {canPlay} from '../src/v14/levels/registry.js';
import {inFinishZone} from '../src/v14/levels/inverse.js';

for(let x=0;x<=6;x++){assert.equal(forward(x),2*x+3);assert.equal(reverseOutput(forward(x)).input,x);}
for(const y of [0,1,2,4,16,18])assert.equal(reverseOutput(y).ok,false);
let puzzle=newPuzzle();
assert(!solved(puzzleCommand(puzzle,'apply')));
puzzle=puzzleCommand(puzzle,'demo');assert(!puzzle.seals[13],'demo alone earns nothing');assert.equal(work(puzzle).value,5);
puzzle=puzzleCommand(puzzle,'apply');assert(puzzle.seals[13]);assert.equal(stage(puzzle),'guided');
puzzle=puzzleCommand(puzzle,'select',7);
puzzle=puzzleCommand(puzzle,'divide');puzzle=puzzleCommand(puzzle,'subtract');
assert.equal(work(puzzle).value,.5);assert(!puzzleCommand(puzzle,'apply').seals[7]);
puzzle=puzzleCommand(puzzle,'undo');assert.equal(work(puzzle).value,3.5);
puzzle=puzzleCommand(puzzle,'reset');
puzzle=puzzleCommand(puzzle,'subtract');puzzle=puzzleCommand(puzzle,'divide');
assert.equal(work(puzzle).value,2);assert(!puzzle.seals[7]);
const midway=sanitizePuzzle(JSON.parse(JSON.stringify(puzzle)));assert.deepEqual(midway.steps,puzzle.steps);assert.equal(work(midway).value,2);
puzzle=puzzleCommand(midway,'apply');assert(puzzle.seals[7]);assert.equal(stage(puzzle),'independent');
puzzle=puzzleCommand(puzzle,'select',15);puzzle=puzzleCommand(puzzle,'subtract');puzzle=puzzleCommand(puzzle,'divide');
puzzle=puzzleCommand(puzzle,'actuator',4);puzzle=puzzleCommand(puzzle,'apply');assert(!puzzle.seals[15]);assert.equal(puzzle.applied.output,11);
puzzle=puzzleCommand(puzzle,'actuator',6);puzzle=puzzleCommand(puzzle,'apply');assert(solved(puzzle));
assert.equal(puzzleCommand({...newPuzzle(),output:0},'down').output,0);
assert.equal(puzzleCommand({...newPuzzle(),output:18},'up').output,18);
assert.equal(puzzleCommand({...newPuzzle(),output:11},'up').output,12);
assert(!puzzleCommand(puzzleCommand(newPuzzle(),'select',1),'apply').applied);
assert.throws(()=>puzzleCommand(newPuzzle(),'unknown'));
for(const y of [3,5,7,9,11,13,15]){let p=puzzleCommand(newPuzzle(),'select',y);p=puzzleCommand(p,'subtract');p=puzzleCommand(p,'divide');assert.equal(forward(work(p).value),y);}
const legacy=sanitizePuzzle({output:15,seals:{13:true,7:true,15:true},revision:8});assert(solved(legacy));assert.equal(legacy.version,2);
const corrupt=sanitizePuzzle({version:2,steps:['__proto__','divide'],actuator:99,applied:{input:99}});assert.deepEqual(corrupt.steps,['divide']);assert.equal(corrupt.actuator,0);assert.equal(corrupt.applied,null);
assert(inFinishZone({x:GOAL.x,feet:GOAL.feet,grounded:true},GOAL));
assert(!inFinishZone({x:GOAL.x,feet:GOAL.feet,grounded:false},GOAL));

const data=new Map([['denai-campaign-v1','legacy-l2-bytes']]);
const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
// V3: the run stores the sluice (the seal puzzle above is kept only to migrate old saves).
const store=createInverseStore(storage),run=newRun();run.checkpointId='gate-court';run.sluice={...newSluice(),setting:5,open:true,lastReading:13,tests:2};run.completed=true;run.elapsedMs=52000;run.coins=[COINS[0].id];run.secrets=[SECRETS[0].id];
assert(store.save(run));assert(store.save(run));assert.equal(store.load().completions,1);assert.equal(store.load().bestMs,52000);assert.equal(data.get('denai-campaign-v1'),'legacy-l2-bytes');
assert.equal(store.load().run.sluice.setting,5);assert(store.load().run.sluice.open);
assert(store.save(newRun()));assert.equal(store.load().completions,1);assert(!store.load().run.sluice.open);
const invalid={...run,checkpointId:'gate-court',sluice:newSluice(),completed:true,coins:['bad']};assert.equal((await import('../src/v14/core/inverse-campaign.js')).sanitizeRun(invalid).checkpointId,'entry');
assert(!canPlay('w1-l3',['w1-l1']));assert(canPlay('w1-l3',['w1-l2']));assert(canPlay('w1-l3',[],{localPreview:true}));
for(const s of [...AB_TERRAIN,...DECKS])for(const n of [s.x,s.y,s.width])assert.equal(n%54,0);
const range=280*(2*520/1400),peak=520**2/(2*1400);
for(let i=1;i<AB_TERRAIN.length;i++){const a=AB_TERRAIN[i-1],b=AB_TERRAIN[i],gap=b.x-a.x-a.width;if(gap>108&&!(a.id==='machine-yard'&&gap===CHANNEL.width))assert.fail(`unexpected gap ${a.id} -> ${b.id}: ${gap}`);if(a.id==='machine-yard'){assert.equal(gap,CHANNEL.width);assert(gap>range);}else assert(a.y-b.y<=54&&a.y-b.y<peak);}
for(const l of LADDERS){assert([...DECKS,...AB_TERRAIN].some(d=>l.x>=d.x&&l.x<=d.x+d.width&&d.y===l.top));assert([...AB_TERRAIN,...DECKS].some(d=>l.x>=d.x&&l.x<=d.x+d.width&&d.y===l.bottom));}
for(const cp of CHECKPOINTS)assert(AB_TERRAIN.some(d=>cp.x>=d.x&&cp.x<=d.x+d.width&&cp.feet===d.y));
assert(DECKS.some(d=>d.id==='root-balcony'&&d.x===756&&SECRETS[0].x>=d.x&&SECRETS[0].x<=d.x+d.width),'first secret remains on the optional canopy route');
assert(DECKS.some(d=>d.id==='creek-crossing'&&d.x===378&&d.width===108),'entry creek must retain a safe bridge crossing');
assert.equal(WATERFALL.x,CHANNEL.x);assert.equal(WATERFALL.width,54,'single pipe outlet feeds one waterfall lane');assert(WATERFALL.top<WATERFALL.bottom);assert.equal(WATERFALL.bottom,1674);assert(WATER.some(w=>WATERFALL.x>=w.x&&WATERFALL.x+w.width<=w.x+w.width));
assert.equal(COINS.length,22);assert.equal(SECRETS.length,3);assert.equal(KEY,'denai-l3-campaign-v1');
console.log('PASS: inverse domain/range, legacy seal model (migration), isolated/idempotent persistence, progression gates, and route geometry.');

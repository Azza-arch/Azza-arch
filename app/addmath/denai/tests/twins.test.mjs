import assert from 'node:assert/strict';
import {compose,command,initialPuzzle,solved,inFinishZone} from '../src/v14/levels/composition.js';
import {createCampaignStore,newRun,sanitizeRun,CAMPAIGN_KEY} from '../src/v14/core/campaign-store.js';
import {canPlay} from '../src/v14/levels/registry.js';
import {AB_TERRAIN,DECKS,LADDERS,STATIONS,COINS,CHECKPOINTS} from '../src/v14/levels/twin-world.js';
import {MISSION_BANK,validateVariant} from '../src/v14/missions.js';

for(const mission of MISSION_BANK)assert(validateVariant(mission).ok,mission.id);

for(let x=0;x<=4;x++){
 assert.equal(compose(x,'fg').output,2*x*x+1);
 assert.equal(compose(x,'gf').output,(2*x+1)**2);
 assert.equal(compose(x,'fg').middle,x*x);
 assert.equal(compose(x,'gf').middle,2*x+1);
}
assert.throws(()=>compose(NaN,'fg'));assert.throws(()=>compose(2,'gf(x)'));
assert.equal(compose(0,'fg').output,compose(0,'gf').output);
function solve(station,input){let state={...initialPuzzle(),input};state=command(state,'send',station);assert(!solved(state));state=command(state,'order',station);state=command(state,'send',station);assert(solved(state));return state;}
const twins=solve('twins',2),final=solve('final',3);
assert(!solved(command({...initialPuzzle(),input:3},'send','twins')));
const bytes=new Map([
 ['denai-save-v14',JSON.stringify({schemaVersion:2,completed:true,collectedCoinIds:['old-coin']})],
 ['denai-profile-v1',JSON.stringify({schemaVersion:1,levels:{'w1-l1':{completions:7,best:{timeMs:54000}}},secretIds:['old-secret']})],
 ['denai-records-v14',JSON.stringify({'bab1-l1-jejak-taman-fungsi':{completions:3}})],
]);
const original=new Map(bytes),storage={getItem:k=>bytes.get(k)||null,setItem:(k,v)=>bytes.set(k,v)},store=createCampaignStore(storage);
assert(store.load().levels['w1-l1'].completed);
const run=newRun();run.puzzles={twins,final};run.checkpointId='exit';run.completed=true;run.elapsedMs=45000;run.coins=[COINS[0].id];
assert(store.saveRun(run));assert(store.saveRun(run));assert.equal(store.load().levels['w1-l2'].completions,1);
assert(store.saveRun(newRun()));assert.equal(store.load().levels['w1-l2'].completions,1);assert.deepEqual(store.load().levels['w1-l2'].coins,[COINS[0].id]);
for(const [k,v]of original)assert.equal(bytes.get(k),v,'legacy bytes must be unchanged');
const invalid=sanitizeRun({...newRun(),checkpointId:'exit',completed:true,coins:['bad','bad'],puzzles:{final}});
assert.equal(invalid.checkpointId,'entry');assert(!invalid.completed);assert.deepEqual(invalid.coins,[]);
bytes.set(CAMPAIGN_KEY,'{broken');assert.equal(store.load().levels['w1-l2'].run,null);
bytes.set(CAMPAIGN_KEY,'{"schemaVersion":2}');assert(!store.saveRun(newRun()));assert.equal(bytes.get(CAMPAIGN_KEY),'{"schemaVersion":2}');
const legacyOnly=createCampaignStore({getItem:k=>k==='denai-records-v14'?original.get(k):null});assert(legacyOnly.load().levels['w1-l1'].completed);
const denied=createCampaignStore({getItem:()=>null,setItem:()=>{throw Error('quota');}});assert(!denied.saveRun(newRun()));assert(denied.error);
assert(!canPlay('w1-l2',[]));assert(canPlay('w1-l2',['w1-l1']));assert(canPlay('w1-l2',[],{localPreview:true}));assert(!canPlay('w1-l3',['w1-l1','w1-l2'],{localPreview:true}));
// Geometry: all solid joins are on the real atlas grid, mandatory gaps fit
// the unchanged jump arc, gate gaps exceed the horizontal jump range.
for(const s of [...AB_TERRAIN,...DECKS])for(const n of [s.x,s.y,s.width])assert.equal(n%54,0);
const jumpRange=280*(2*520/1400),peak=520**2/(2*1400);
assert(inFinishZone({x:4698,feet:1188,grounded:true},{x:4698,feet:1188}));
assert(!inFinishZone({x:4698,feet:1188,grounded:false},{x:4698,feet:1188}));
assert(!inFinishZone({x:4783,feet:1188,grounded:true},{x:4698,feet:1188}));
for(let i=1;i<AB_TERRAIN.length;i++){
 const a=AB_TERRAIN[i-1],b=AB_TERRAIN[i],gap=b.x-a.x-a.width;
 if(STATIONS.some(s=>s.bridge.x===a.x+a.width)){assert(gap>jumpRange+28);continue;}
 assert(gap<=108);assert(a.y-b.y<=54&&a.y-b.y<peak);
}
for(const l of LADDERS){assert(DECKS.some(d=>l.x>=d.x&&l.x<=d.x+d.width&&l.top===d.y));assert(AB_TERRAIN.some(d=>l.x>=d.x&&l.x<=d.x+d.width&&l.bottom===d.y));}
for(const cp of CHECKPOINTS)assert(AB_TERRAIN.some(d=>cp.x>=d.x&&cp.x<=d.x+d.width&&cp.feet===d.y));
console.log('PASS: composition, receivers, migration isolation, idempotent completion, replay, corrupt/quota storage, progression and terrain geometry.');

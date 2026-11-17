// Level 1-2 (World 1 V3): two-machine workshop model + campaign-store migration.
import assert from 'node:assert/strict';
import {STOCK,NEED,MACHINES,runLine,newWorkshop,sanitizeWorkshop,workshopStep} from '../src/v14/levels/workshop-model.js';
import {createCampaignStore,newRun} from '../src/v14/core/campaign-store.js';
assert.equal(STOCK,5);assert.equal(NEED,8);
assert.equal(MACHINES.A.fn(5),10);assert.equal(MACHINES.B.fn(5),3);
const ab=runLine('AB'),ba=runLine('BA');
assert.deepEqual([ab.mid,ab.out,ab.enough],[10,8,true]);assert.equal(ab.notation,'gf(5) = g(f(5)) = g(10) = 8');
assert.deepEqual([ba.mid,ba.out,ba.enough],[3,6,false]);assert.equal(ba.notation,'fg(5) = f(g(5)) = f(3) = 6');
assert.notEqual(ab.out,ba.out,'order changes the result');
assert.throws(()=>runLine('AA'));assert.equal(runLine('BA',1).ok,false);
// fresh workshop starts on the wrong order: the first run is a demonstration
const w0=newWorkshop();assert.equal(w0.order,'BA');assert.equal(workshopStep(w0),'run');
assert.equal(workshopStep({...w0,runs:1,lastOut:6}),'swap');
assert.equal(workshopStep({...w0,runs:1,order:'AB'}),'run');
assert.equal(workshopStep({...w0,delivered:true}),'done');assert.equal(workshopStep(null),'none');
// sanitize: garbage, caps, forged delivery
assert.deepEqual(sanitizeWorkshop('x'),newWorkshop());
const bad=sanitizeWorkshop({order:'ZZ',runs:-3,swaps:1e9,lastOut:7,delivered:true});
assert.deepEqual(bad,{order:'BA',runs:0,lastOut:null,delivered:false,swaps:999},'BA cannot be delivered');
assert.equal(sanitizeWorkshop({order:'AB',runs:5000,delivered:true}).runs,999);
assert.equal(sanitizeWorkshop({order:'AB',runs:2,delivered:true,lastOut:8}).delivered,true);
// legacy course finished → bridge stands
assert.deepEqual(sanitizeWorkshop(undefined,true),{order:'AB',runs:1,lastOut:8,delivered:true,swaps:0});
// store round trip + migration of the previous 1-2 course
const mk=(seed)=>{const bytes=new Map(Object.entries(seed||{}));return createCampaignStore({getItem:k=>bytes.get(k)??null,setItem:(k,v)=>bytes.set(k,v)});};
const st=mk(),run=newRun();assert.deepEqual(run.workshop,newWorkshop());
run.workshop={order:'AB',runs:2,lastOut:8,delivered:true,swaps:1};run.checkpointId='exit';assert(st.saveRun(run));
assert.deepEqual(st.load().levels['w1-l2'].run.workshop,run.workshop);
const solved={input:2,order:'gf',revision:4,receivers:{fg:true,gf:true},last:null,route:null,history:{},drives:{}};
const open0={...solved,order:'fg',revision:0,receivers:{fg:false,gf:false}};
const old=(final,cp)=>({'denai-campaign-v1':JSON.stringify({schemaVersion:1,levels:{'w1-l2':{completions:0,completedRuns:[],coins:['l2-coin-1'],secrets:[],bestMs:null,run:{id:'r',checkpointId:cp,coins:['l2-coin-1'],secrets:[],puzzles:{twins:solved,final},elapsedMs:9e4,completed:false}}}})});
const done=mk(old(solved,'exit')).load().levels['w1-l2'].run;assert(done.workshop.delivered);assert.equal(done.checkpointId,'exit');
const openRun=mk(old(open0,'exit')).load().levels['w1-l2'].run;assert(!openRun.workshop.delivered);assert.notEqual(openRun.checkpointId,'exit','exit checkpoint requires the workshop');
assert.deepEqual(openRun.coins,['l2-coin-1']);
console.log('PASS: runLine gf(5)=8 / fg(5)=6, demo-first steps, sanitize caps & forged delivery, legacy migration, store round trip.');

import assert from 'node:assert/strict';
import {initialPuzzle,restorePuzzle,solved,compose} from '../src/v14/levels/composition.js';
import {workshopCommand as cmd,driveFraction} from '../src/v14/levels/composition-workshop.js';
import {createCampaignStore,newRun} from '../src/v14/core/campaign-store.js';
for(const station of ['twins','final']){
 let p={...initialPuzzle(),input:station==='twins'?2:3};
 p=cmd(p,'send',station);assert(!p.receivers.fg,'no implicit destination');
 p=cmd(p,'route-gf',station);p=cmd(p,'send',station);assert(!solved(p));assert(!p.receivers.fg);assert(driveFraction(p,station,'gf')<1);
 p=cmd(p,'route-fg',station);p=cmd(p,'send',station);assert(p.receivers.fg);assert.equal(driveFraction(p,station,'fg'),1);
 p=cmd(p,'order',station);assert.equal(p.route,null);
 p=cmd(p,'send',station);assert(!solved(p));
 p=cmd(p,'route-gf',station);p=cmd(p,'send',station);assert(solved(p));
 const restored=restorePuzzle(JSON.parse(JSON.stringify(p)),station);
 assert.deepEqual(restored.history,p.history);assert.deepEqual(restored.drives,p.drives);assert(solved(restored));
 const x=p.input;assert.equal(p.history[`${x}:fg`].trace,compose(x,'fg').trace);assert.equal(p.history[`${x}:gf`].trace,compose(x,'gf').trace);
 const alternate=cmd(cmd(p,'input',station),'send',station);assert.equal(Object.keys(alternate.history).length,3);assert.equal(Object.keys(p.history).length,2,'immutable history');assert(solved(alternate),'experiments never remove secured receivers');
}
const old=restorePuzzle({input:2,order:'fg',receivers:{fg:true,gf:true},last:{input:2,order:'gf'}},'twins');assert(solved(old));assert(old.history['2:gf']);
assert.equal(restorePuzzle({history:{'2:fg':{input:4,order:'fg'}}},'twins').history['2:fg'],undefined);
const bytes=new Map(),store=createCampaignStore({getItem:k=>bytes.get(k),setItem:(k,v)=>bytes.set(k,v)}),run=newRun();
run.puzzles.twins=cmd(cmd(initialPuzzle(),'route-fg','twins'),'send','twins');assert(store.saveRun(run));assert(store.load().levels['w1-l2'].run.puzzles.twins.history['2:fg']);
console.log('PASS: deliberate routing, physical drive fractions, immutable comparison traces, old-save migration, new-save/reload.');

// World 1 V3 · Level 1-1 purchase model and quest-state sanitising.
import test from 'node:test';
import assert from 'node:assert/strict';
import {VARIANTS,NEED,STOCK,cost,checkPurchase,acceptedChoices,sanitizeQuest,newQuest,questStep,variantById} from '../src/v14/levels/supply-quest.js';
test('base supplier: C(x) = 4x + 6, budget RM30 → accept 5 and 6 only',()=>{
  const v=variantById('K1');
  assert.deepEqual([1,2,3,4,5,6,7,8].map(x=>cost(v,x)),[10,14,18,22,26,30,34,38]);
  assert.deepEqual(acceptedChoices(v),[5,6]);
  assert.deepEqual(checkPurchase(v,5),{ok:true,cost:26,change:4,exact:true});
  assert.equal(checkPurchase(v,6).exact,false);
  assert.equal(checkPurchase(v,4).code,'short');
  assert.equal(checkPurchase(v,7).code,'budget');
  assert.equal(checkPurchase(v,0).code,'range');assert.equal(checkPurchase(v,2.5).code,'range');assert.equal(checkPurchase(v,STOCK+1).code,'range');
});
test('every replay variant has at least one valid purchase and needs ≥ 5 planks',()=>{
  for(const v of VARIANTS){const ok=acceptedChoices(v);assert.ok(ok.length>=1,v.id);assert.ok(ok.every(x=>x>=NEED&&cost(v,x)<=v.budget),v.id);assert.ok(ok.includes(NEED),`${v.id} accepts the exact 5`);}
  assert.deepEqual(acceptedChoices(variantById('K2')),[5]);assert.deepEqual(acceptedChoices(variantById('K3')),[5]);
});
test('quest state: steps imply earlier ones; invalid purchases are dropped',()=>{
  const q=sanitizeQuest({variant:'K1',bought:{x:5}});assert.equal(q.door,true);assert.equal(q.key,true);assert.equal(q.found,true);assert.equal(q.planks,5);assert.equal(q.bought.cost,26);
  assert.equal(sanitizeQuest({variant:'K1',bought:{x:7}}).bought,null,'over budget never restored');
  assert.equal(sanitizeQuest({variant:'ZZ'}).variant,'K1');
  assert.equal(questStep(newQuest()),'none');assert.equal(questStep({...newQuest(),found:true}),'find');assert.equal(questStep({...newQuest(),found:true,doorTried:true}),'key');
});
test('old saves with the bridge already built stay repaired',()=>{
  const q=sanitizeQuest(undefined,true);assert.equal(q.repaired,true);assert.equal(questStep(q),'done');
  assert.equal(sanitizeQuest(undefined,false).repaired,false);
});

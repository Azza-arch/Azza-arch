import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitize} from '../../../app/addmath/rooftop/src/v12/save.js';
import {B_STOPS,validBInput} from '../../../app/addmath/rooftop/src/v12/b-control.js';
const base={schemaVersion:1,layoutVersion:120,levelId:'denai-bab1-functions-v12',checkpointId:'b-lift',solvedGateIds:[]};
test('old saves remain unselected and forged trial outputs never grant a gate',()=>{
 const old=sanitize(base);assert.equal(old.bInput,null);assert.equal(old.bLastTrial,null);
 const trial=sanitize({...base,bInput:0,bLastTrial:{input:0,output:7}});
 assert.equal(trial.bInput,0);assert.deepEqual(trial.bLastTrial,{input:0,output:1});assert.deepEqual(trial.solvedGateIds,[]);
 for(const value of [null,undefined,-1,5,NaN,'3',1.5]){
  assert.equal(validBInput(value),false);assert.equal(sanitize({...base,bInput:value}).bInput,null);
 }
});
test('all five mathematical outputs retain the approved non-proportional preset mapping',()=>{
 for(const [input,y] of [[0,1272],[1,1230],[2,1188],[3,1080],[4,1146]]){
  const s=sanitize({...base,bInput:input,bLastTrial:{input}});
  assert.equal(s.bLastTrial.output,2*input+1);assert.equal(B_STOPS[s.bLastTrial.output],y);
  assert.deepEqual(s.solvedGateIds,[]);
 }
});

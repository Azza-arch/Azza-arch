import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateWaterOrder, recoverWaterworksState, transitionWaterworks, WATERWORKS_STATE as S } from '../../app/addmath/rooftop/src/v12/waterworks.js';
import { sanitize, SaveManager } from '../../app/addmath/rooftop/src/v12/save.js';

test('F then G evaluates input 3 through both functions and reaches 19',()=>{
  assert.deepEqual(evaluateWaterOrder('fg',3),{order:'fg',input:3,intermediate:7,output:19,stages:['F','G']});
});

test('G then F evaluates input 3 through both functions and leaves a retryable 15',()=>{
  assert.deepEqual(evaluateWaterOrder('gf',3),{order:'gf',input:3,intermediate:7,output:15,stages:['G','F']});
  assert.equal(transitionWaterworks(S.RUNNING,'result',15),S.NON_TARGET_RESULT);
  assert.equal(transitionWaterworks(S.NON_TARGET_RESULT,'choose-order','fg'),S.CONFIGURED);
});

test('illegal and rapid repeat actions cannot skip configuration or run a second experiment',()=>{
  assert.equal(transitionWaterworks(S.LOCKED,'activate'),S.LOCKED);
  const running=transitionWaterworks(transitionWaterworks(S.LOCKED,'choose-order','gf'),'activate');
  assert.equal(running,S.RUNNING);
  assert.equal(transitionWaterworks(running,'activate'),S.RUNNING);
  assert.equal(transitionWaterworks(running,'result',15),S.NON_TARGET_RESULT);
  assert.equal(transitionWaterworks(S.NON_TARGET_RESULT,'result',19),S.NON_TARGET_RESULT);
});

test('target result must pass through bridge activation before safe crossing',()=>{
  assert.equal(transitionWaterworks(S.RUNNING,'result',19),S.TARGET_REACHED);
  assert.equal(transitionWaterworks(S.TARGET_REACHED,'crossing-safe'),S.TARGET_REACHED);
  assert.equal(transitionWaterworks(S.TARGET_REACHED,'begin-crossing'),S.CROSSING_ACTIVATING);
  assert.equal(transitionWaterworks(S.CROSSING_ACTIVATING,'crossing-safe'),S.CROSSING_SAFE);
});

test('pause is state preserving and reload resolves each saved state without unsafe motion',()=>{
  const base={schemaVersion:1,layoutVersion:120,levelId:SaveManager.LEVEL_ID,checkpointId:'e-entry',solvedGateIds:['lift','number-span'],waterOrder:'gf'};
  assert.equal(recoverWaterworksState(S.RUNNING,'gf'),S.CONFIGURED);
  assert.equal(recoverWaterworksState(S.NON_TARGET_RESULT,'gf'),S.NON_TARGET_RESULT);
  assert.equal(transitionWaterworks(S.RUNNING,'pause'),S.RUNNING);
  assert.equal(transitionWaterworks(S.RUNNING,'resume'),S.RUNNING);
  assert.equal(sanitize({...base,waterworksState:S.RUNNING}).waterworksState,S.CONFIGURED);
  assert.equal(sanitize({...base,waterworksState:S.NON_TARGET_RESULT}).waterworksState,S.NON_TARGET_RESULT);
  assert.equal(sanitize({...base,waterOrder:'fg',waterworksState:S.TARGET_REACHED}).waterworksState,S.CROSSING_SAFE);
  assert.equal(sanitize({...base,waterOrder:'fg',waterworksState:S.CROSSING_ACTIVATING}).waterworksState,S.CROSSING_SAFE);
  const safe=sanitize({...base,waterOrder:'fg',waterworksState:S.CROSSING_SAFE});
  assert.equal(safe.solvedGateIds.includes('water-crossing'),true);
  assert.equal(safe.checkpointId,'e-entry');
});

test('V12 E uses world interactions and does not retain the answer-to-unlock E terminal or V11 hook',()=>{
  const level=readFileSync(new URL('../../app/addmath/rooftop/src/v12/level.js',import.meta.url),'utf8');
  const game=readFileSync(new URL('../../app/addmath/rooftop/src/v12/game.js',import.meta.url),'utf8');
  assert.match(level,/kind:'water-stage',stage:'f'/);
  assert.match(level,/kind:'water-stage',stage:'g'/);
  assert.match(level,/kind:'water-activate'/);
  assert.doesNotMatch(level,/kind:'water-composition'/);
  assert.match(game,/interactWaterworks\(terminal\)/);
  assert.doesNotMatch(game,/window\.rooftop|URLSearchParams\(location\.search\).*test/);
});

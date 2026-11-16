// Save compatibility: Level 1-1 personal bests are separated by course.
import test from 'node:test';
import assert from 'node:assert/strict';
import {_setStorage,loadProfile,saveProfile,recordCompletion,migrateLegacy,PROFILE_KEY,LEVEL_KEY,L1_COURSE} from '../src/v14/progress.js';
const mem=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m};};
// A profile exactly as the current production build (origin/main) writes it.
const oldProfile={schemaVersion:1,createdAt:'2026-10-01T00:00:00.000Z',levels:{'w1-l1':{completions:3,firstCompletedAt:'2026-10-01T01:00:00.000Z',best:{timeMs:95000,coins:9,secrets:1,at:'2026-10-02T00:00:00.000Z'}}},
  coinIds:['c1'],secretIds:[],achievements:['jejak-pertama','tepat-sekali'],adventuresCompleted:3,mastered:{variants:['v1'],types:['find-input']},recentVariants:{lift:['v1']},migrated:['records-v14','run-v1']};
test('old best (no course tag) becomes classicBest; nothing else is lost',()=>{
  const s=mem();_setStorage(s);s.setItem(PROFILE_KEY,JSON.stringify(oldProfile));
  const p=loadProfile(),lv=p.levels[LEVEL_KEY];
  assert.equal(lv.best,null);assert.equal(lv.classicBest.timeMs,95000);
  assert.equal(lv.completions,3);assert.deepEqual(p.achievements,['jejak-pertama','tepat-sekali']);assert.equal(p.adventuresCompleted,3);
});
test('new course run: slower than the classic best is still the first v2 best; classic kept',()=>{
  const s=mem();_setStorage(s);s.setItem(PROFILE_KEY,JSON.stringify(oldProfile));
  const r=recordCompletion({timeMs:140000,coins:5,secrets:0,eligible:true,wrongAttempts:1});
  assert.equal(r.isNewBest,true);assert.equal(r.prevBest,null);assert.equal(r.best.course,L1_COURSE);
  const lv=loadProfile().levels[LEVEL_KEY];assert.equal(lv.best.timeMs,140000);assert.equal(lv.classicBest.timeMs,95000);assert.equal(lv.completions,4);
  const r2=recordCompletion({timeMs:150000,coins:5,secrets:0,eligible:true,wrongAttempts:0});
  assert.equal(r2.isNewBest,false);assert.equal(r2.prevBest.timeMs,140000);
  const r3=recordCompletion({timeMs:120000,coins:6,secrets:0,eligible:true,wrongAttempts:0});
  assert.equal(r3.isNewBest,true);assert.equal(r3.prevBest.timeMs,140000);
  assert.equal(loadProfile().levels[LEVEL_KEY].best.timeMs,120000);
});
test('ineligible (resumed) run never sets a best',()=>{
  _setStorage(mem());const r=recordCompletion({timeMs:60000,coins:1,secrets:0,eligible:false,wrongAttempts:0});
  assert.equal(r.isNewBest,false);assert.equal(loadProfile().levels[LEVEL_KEY].best,null);
});
test('round trip keeps the v2 tag; legacy records-v14 migrate into classicBest',()=>{
  const s=mem();_setStorage(s);recordCompletion({timeMs:100000,coins:1,secrets:0,eligible:true,wrongAttempts:0});
  saveProfile(loadProfile());assert.equal(loadProfile().levels[LEVEL_KEY].best.course,L1_COURSE);
  const s2=mem();_setStorage(s2);s2.setItem('denai-records-v14',JSON.stringify({'bab1-l1-jejak-taman-fungsi':{completions:2,best:{timeMs:88000,coins:3,secrets:0}}}));
  migrateLegacy(null);const lv=loadProfile().levels[LEVEL_KEY];
  assert.equal(lv.best,null);assert.equal(lv.classicBest.timeMs,88000);assert.equal(lv.completions,2);
});

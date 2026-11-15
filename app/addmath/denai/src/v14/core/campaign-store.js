import {CHECKPOINTS,COINS,SECRETS} from '../levels/twin-world.js';
import {initialPuzzle,restorePuzzle,solved} from '../levels/composition.js';
export const CAMPAIGN_KEY='denai-campaign-v1';
const unique=(value,allowed)=>[...new Set(Array.isArray(value)?value.filter(id=>allowed.includes(id)):[])];
const count=n=>Number.isSafeInteger(n)&&n>=0?n:0;
export function newRun() {
  return {id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,checkpointId:'entry',coins:[],secrets:[],puzzles:{twins:initialPuzzle(),final:initialPuzzle()},elapsedMs:0,completed:false};
}
export function sanitizeRun(raw) {
  if(!raw||typeof raw.id!=='string')return null;
  const puzzles={twins:restorePuzzle(raw.puzzles?.twins,'twins'),final:restorePuzzle(raw.puzzles?.final,'final')};
  // Final progress is impossible before crossing the first bridge.
  if(!solved(puzzles.twins))puzzles.final=initialPuzzle();
  const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId&&(!c.requires||solved(puzzles[c.requires])))||CHECKPOINTS[0];
  return {id:raw.id.slice(0,100),checkpointId:cp.id,coins:unique(raw.coins,COINS.map(c=>c.id)),secrets:unique(raw.secrets,SECRETS.map(s=>s.id)),puzzles,elapsedMs:Math.max(0,Math.min(Number(raw.elapsedMs)||0,86400000)),completed:raw.completed===true&&solved(puzzles.final)&&cp.id==='exit'};
}
export function createCampaignStore(storage) {
  let lastError=null;
  const read=key=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};
  function load() {
    const raw=read(CAMPAIGN_KEY);
    const oldProfile=read('denai-profile-v1'),oldSave=read('denai-save-v14'),oldRecords=read('denai-records-v14');
    const l1=oldProfile?.levels?.['w1-l1'];
    const previous=raw?.levels?.['w1-l2']||{};
    return {schemaVersion:1,levels:{
      // Read-through migration: legacy stores remain the authority for L1;
      // never write, clear or replace their bytes.
      'w1-l1':{completed:!!(l1?.completions||oldSave?.completed||oldRecords?.['bab1-l1-jejak-taman-fungsi']?.completions),legacyKeys:['denai-profile-v1','denai-save-v14','denai-records-v14']},
      'w1-l2':{completions:count(previous.completions),completedRuns:unique(previous.completedRuns,Array.isArray(previous.completedRuns)?previous.completedRuns.filter(id=>typeof id==='string'):[]),coins:unique(previous.coins,COINS.map(c=>c.id)),secrets:unique(previous.secrets,SECRETS.map(s=>s.id)),bestMs:Number.isFinite(previous.bestMs)&&previous.bestMs>0?previous.bestMs:null,run:sanitizeRun(previous.run)},
    }};
  }
  function saveRun(run) {
    const existing=read(CAMPAIGN_KEY);
    if(existing?.schemaVersion>1){lastError=new Error('Newer campaign schema');return false;}
    const state=load(),level=state.levels['w1-l2'];level.run=sanitizeRun(run);
    if(!level.run)return false;
    level.coins=[...new Set([...level.coins,...level.run.coins])];
    level.secrets=[...new Set([...level.secrets,...level.run.secrets])];
    if(level.run.completed&&!level.completedRuns.includes(run.id)){
      level.completedRuns.push(run.id);level.completions++;
      level.bestMs=Math.min(level.bestMs||Infinity,level.run.elapsedMs);
    }
    try{storage.setItem(CAMPAIGN_KEY,JSON.stringify(state));lastError=null;return true;}
    catch(error){lastError=error;return false;}
  }
  return {load,saveRun,get error(){return lastError;}};
}

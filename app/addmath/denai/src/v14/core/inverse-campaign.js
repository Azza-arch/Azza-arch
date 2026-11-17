import {CHECKPOINTS,COINS,SECRETS} from '../levels/inverse-world.js';
import {sanitizePuzzle,solved} from '../levels/inverse.js'; // previous course (3 seals): read for migration only
import {newSluice,sanitizeSluice} from '../levels/sluice-model.js';
export const KEY='denai-l3-campaign-v1';
const unique=(v,allowed)=>[...new Set(Array.isArray(v)?v.filter(x=>allowed.includes(x)):[])];
export function newRun(){return {id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,checkpointId:'entry',coins:[],secrets:[],sluice:newSluice(),elapsedMs:0,completed:false};}
export function sanitizeRun(raw){
 if(!raw||typeof raw.id!=='string')return null;
 // V3: a previous-course run with all three seals lit keeps its crossing open.
 const sluice=sanitizeSluice(raw.sluice,!raw.sluice&&raw.puzzle!=null&&solved(sanitizePuzzle(raw.puzzle)));
 const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId&&(!c.requires||sluice.open))||CHECKPOINTS[0];
 return {id:raw.id.slice(0,100),checkpointId:cp.id,coins:unique(raw.coins,COINS.filter(c=>!c.cave||sluice.cave.solved).map(c=>c.id)),secrets:unique(raw.secrets,SECRETS.filter(s=>!s.cave||sluice.cave.solved||(raw.secrets||[]).includes(s.id)&&!raw.sluice).map(s=>s.id)),sluice,elapsedMs:Math.max(0,Math.min(Number(raw.elapsedMs)||0,86400000)),completed:raw.completed===true&&sluice.open&&cp.id==='gate-court'};
}
export function createInverseStore(storage){
 const read=()=>{try{return JSON.parse(storage.getItem(KEY)||'null');}catch{return null;}};
 const load=()=>{const raw=read();return {schemaVersion:1,completions:Number.isSafeInteger(raw?.completions)&&raw.completions>=0?raw.completions:0,completedRuns:unique(raw?.completedRuns,Array.isArray(raw?.completedRuns)?raw.completedRuns.filter(x=>typeof x==='string'):[]),coins:unique(raw?.coins,COINS.map(c=>c.id)),secrets:unique(raw?.secrets,SECRETS.map(s=>s.id)),bestMs:Number.isFinite(raw?.bestMs)&&raw.bestMs>0?raw.bestMs:null,run:sanitizeRun(raw?.run)};};
 const save=run=>{const raw=read();if(raw?.schemaVersion>1)return false;const state=load();state.run=sanitizeRun(run);if(!state.run)return false;state.coins=[...new Set([...state.coins,...state.run.coins])];state.secrets=[...new Set([...state.secrets,...state.run.secrets])];if(state.run.completed&&!state.completedRuns.includes(run.id)){state.completedRuns.push(run.id);state.completions++;state.bestMs=Math.min(state.bestMs||Infinity,state.run.elapsedMs);}try{storage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}};
 return {load,save};
}

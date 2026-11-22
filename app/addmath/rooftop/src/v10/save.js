import { CHECKPOINTS, COLLECTIBLES, SECRETS, GATES } from './level.js';
import { SaveManager as Legacy } from '../save.js';
const STORAGE_KEY='lorong-save-v10';
const LEVEL_ID='lorong-atas-bumbung-v10';
const ids=(raw,allowed)=>Array.isArray(raw)?[...new Set(raw.filter(x=>allowed.includes(x)))]:[];
export function sanitize(raw) {
  if(!raw||raw.schemaVersion!==3||raw.layoutVersion!==10||raw.levelId!==LEVEL_ID)return null;
  const legacy=raw.legacyProgress;
  const earned=ids(raw.solvedGateIds,GATES.map(g=>g.id));
  // A prior explicit Batch1 import may carry earned questions from later V9 zones.
  if(legacy?.solvedGateIds?.includes('workshop-gate')&&!earned.includes('gear'))earned.push('gear');
  if(legacy?.solvedGateIds?.includes('rooftop-gate')&&GATES.some(g=>g.id==='block')&&!earned.includes('block'))earned.push('block');
  const finalLatches={input:raw.finalLatches?.input===true||legacy?.solvedGateIds?.includes('final-gate')===true,composition:raw.finalLatches?.composition===true};
  const solvedGateIds=[];
  for(const id of ['gear','block','pipe','final']){
    if(!earned.includes(id))break;
    if(id==='final'&&!(finalLatches.input&&finalLatches.composition))break;
    solvedGateIds.push(id);
  }
  const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId);
  const checkpointId=cp&&(!cp.requires||cp.requires.every(id=>solvedGateIds.includes(id)))?cp.id:null;
  const mappingInputs=ids(raw.mappingInputs,[0,1,2,3]);
  return {schemaVersion:3,layoutVersion:10,levelId:LEVEL_ID,checkpointId,solvedGateIds,
    collectedCoinIds:ids([...(Array.isArray(raw.collectedCoinIds)?raw.collectedCoinIds:[]),...(Array.isArray(legacy?.collectedCoinIds)?legacy.collectedCoinIds:[])],COLLECTIBLES.map(c=>c.id)),
    discoveredSecretIds:ids([...(Array.isArray(raw.discoveredSecretIds)?raw.discoveredSecretIds:[]),...(Array.isArray(legacy?.discoveredSecretIds)?legacy.discoveredSecretIds:[])],SECRETS.map(s=>s.id)),
    mappingInputs,mappingDone:mappingInputs.length===4,
    finalLatches,inverseSolved:raw.inverseSolved===true,primerSeen:raw.primerSeen===true,
    legacyProgress:raw.legacyProgress&&typeof raw.legacyProgress==='object'?raw.legacyProgress:null,
    batch1Completed:raw.batch1Completed===true&&solvedGateIds.includes('gear'),completed:raw.completed===true&&solvedGateIds.length===4,
    elapsedMs:Number.isFinite(raw.elapsedMs)&&raw.elapsedMs>=0?raw.elapsedMs:0,
    updatedAt:Number.isFinite(raw.updatedAt)?raw.updatedAt:0};
}
export const SaveManager={
  STORAGE_KEY,LEVEL_ID,SCHEMA_VERSION:3,
  load(){try{return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}},
  save(snapshot){try{const data=sanitize({...snapshot,schemaVersion:3,layoutVersion:10,levelId:LEVEL_ID});if(!data)return false;localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true;}catch{return false;}},
  clear(){try{localStorage.removeItem(STORAGE_KEY);}catch{}},
  legacyAvailable(){return !!Legacy.load();},
  importLegacy(){
    if(this.load())return false;
    const old=Legacy.load();if(!old)return false;
    const gear=old.solvedGateIds.includes('workshop-gate');
    const block=gear&&old.solvedGateIds.includes('rooftop-gate')&&GATES.some(g=>g.id==='block');
    return this.save({checkpointId:block&&CHECKPOINTS.some(c=>c.id==='cp-e')?'cp-e':gear?'cp-d':old.checkpointId==='cp1-cafe'?'cp-c':null,
      solvedGateIds:block?['gear','block']:gear?['gear']:[],collectedCoinIds:old.collectedCoinIds,discoveredSecretIds:old.discoveredSecretIds,
      finalLatches:{input:old.solvedGateIds.includes('final-gate'),composition:false},
      legacyProgress:old,updatedAt:Date.now()});
  }
};

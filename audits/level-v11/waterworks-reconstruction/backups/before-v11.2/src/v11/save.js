import {CHECKPOINTS,COLLECTIBLES,SECRETS} from './level.js';
const STORAGE_KEY='lorong-save-v11',LEVEL_ID='lorong-atas-bumbung-v11';
const pick=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
export function sanitize(raw){
 if(!raw||raw.schemaVersion!==1||raw.layoutVersion!==111||raw.levelId!==LEVEL_ID)return null;
 const solvedGateIds=pick(raw.solvedGateIds,['lift','number-span','water-crossing']);
 const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId);
 const mappingInputs=pick(raw.mappingInputs,[0,1,2,3]);
 return {schemaVersion:1,layoutVersion:111,levelId:LEVEL_ID,
  checkpointId:cp&&(!cp.requires||cp.requires.every(id=>solvedGateIds.includes(id)))?cp.id:null,
  solvedGateIds,mappingInputs,mappingDone:mappingInputs.length===4,
  collectedCoinIds:pick(raw.collectedCoinIds,COLLECTIBLES.map(c=>c.id)),
  discoveredSecretIds:mappingInputs.length===4?pick(raw.discoveredSecretIds,SECRETS.map(s=>s.id)):[],
  phase1Reviewed:raw.phase1Reviewed===true&&solvedGateIds.includes('lift'),completed:false,
  elapsedMs:Number.isFinite(raw.elapsedMs)&&raw.elapsedMs>=0?raw.elapsedMs:0};
}
export const SaveManager={STORAGE_KEY,LEVEL_ID,SCHEMA_VERSION:1,
 load(){try{return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}},
 save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sanitize({...s,schemaVersion:1,layoutVersion:111,levelId:LEVEL_ID})));return true;}catch{return false;}},
 clear(){try{localStorage.removeItem(STORAGE_KEY);}catch{}},
 // Explicit isolation: neither old save coordinates nor earned gates are imported.
 legacyAvailable(){return false;},importLegacy(){return false;}
};

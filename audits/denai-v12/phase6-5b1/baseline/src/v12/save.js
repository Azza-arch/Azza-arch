import {CHECKPOINTS,COLLECTIBLES,SECRETS} from './level.js';
import {recoverWaterworksState} from './waterworks.js';
import {sanitizeDialogue} from './dialogue.js';
const STORAGE_KEY='denai-save-v12',LEVEL_ID='denai-bab1-functions-v12';
const pick=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
export function sanitize(raw){
 if(!raw||raw.schemaVersion!==1||raw.layoutVersion!==120||raw.levelId!==LEVEL_ID)return null;
 const solved=new Set(pick(raw.solvedGateIds,['lift','number-span','water-crossing','river-input','river-composition','river-crossing']));
 if(!solved.has('water-crossing')){solved.delete('river-input');solved.delete('river-composition');solved.delete('river-crossing');}
 if(!solved.has('river-input')){solved.delete('river-composition');solved.delete('river-crossing');}
 if(!solved.has('river-composition'))solved.delete('river-crossing');
 const waterOrder=['fg','gf'].includes(raw.waterOrder)?raw.waterOrder:null;
 const waterworksState=recoverWaterworksState(raw.waterworksState,waterOrder);
 if(waterworksState==='CROSSING_SAFE')solved.add('water-crossing');
 const solvedGateIds=[...solved];
 const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId);
 const mappingInputs=pick(raw.mappingInputs,[0,1,2,3]);
 const validCompletion=['lift','number-span','water-crossing','river-input','river-composition','river-crossing'].every(id=>solvedGateIds.includes(id));
 return {schemaVersion:1,layoutVersion:120,levelId:LEVEL_ID,
  checkpointId:cp&&(!cp.requires||cp.requires.every(id=>solvedGateIds.includes(id)))?cp.id:null,
  solvedGateIds,mappingInputs,mappingDone:mappingInputs.length===4,
  collectedCoinIds:pick(raw.collectedCoinIds,COLLECTIBLES.map(c=>c.id)),
  discoveredSecretIds:pick(raw.discoveredSecretIds,SECRETS.map(s=>s.id)),
  phase1Reviewed:raw.phase1Reviewed===true&&solvedGateIds.includes('lift'),completed:raw.completed===true&&validCompletion&&cp?.id==='g-goal',
  waterOrder,waterworksState,dialogue:sanitizeDialogue(raw.dialogue),
  elapsedMs:Number.isFinite(raw.elapsedMs)&&raw.elapsedMs>=0?raw.elapsedMs:0};
}
export const SaveManager={STORAGE_KEY,LEVEL_ID,SCHEMA_VERSION:1,
 load(){try{return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}},
 save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sanitize({...s,schemaVersion:1,layoutVersion:120,levelId:LEVEL_ID})));return true;}catch{return false;}},
 clear(){try{localStorage.removeItem(STORAGE_KEY);}catch{}},
 // Explicit isolation: neither old save coordinates nor earned gates are imported.
 legacyAvailable(){return false;},importLegacy(){return false;}
};

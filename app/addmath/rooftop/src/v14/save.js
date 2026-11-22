import {validBInput,sanitizeBTrial} from './b-control.js';
import {CHECKPOINTS,COLLECTIBLES,SECRETS,GATES} from './level.js';
import {sanitizeDialogue} from './dialogue.js';
// V14: this slice has no water/river content (only the 'lift' gate exists —
// see level.js's header comment), so the river/waterworks sanitization V13
// carried here is dropped rather than kept as dead weight. Separate
// STORAGE_KEY/LEVEL_ID/layoutVersion from V13's so a V13 save is never
// misread by this build (sanitize() below rejects anything with a
// different levelId) and vice versa.
const STORAGE_KEY='denai-save-v14',LEVEL_ID='denai-bab1-functions-v14-slice';
const pick=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
export function sanitize(raw){
 if(!raw||raw.schemaVersion!==1||raw.layoutVersion!==1||raw.levelId!==LEVEL_ID)return null;
 const gateIds=GATES.map(g=>g.id);
 const solvedGateIds=pick(raw.solvedGateIds,gateIds);
 const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId);
 const cClues=pick(raw.cClues,['a','b']);
 const validCompletion=gateIds.every(id=>solvedGateIds.includes(id));
 return {schemaVersion:1,layoutVersion:1,levelId:LEVEL_ID,
  checkpointId:cp&&(!cp.requires||cp.requires.every(id=>solvedGateIds.includes(id)))?cp.id:null,
  solvedGateIds,cClues,
  collectedCoinIds:pick(raw.collectedCoinIds,COLLECTIBLES.map(c=>c.id)),
  discoveredSecretIds:pick(raw.discoveredSecretIds,SECRETS.map(s=>s.id)),
  phase1Reviewed:raw.phase1Reviewed===true&&solvedGateIds.includes('lift'),completed:raw.completed===true&&validCompletion&&cp?.id==='cp-final',
  bInput:validBInput(raw.bInput)?raw.bInput:null,bLastTrial:sanitizeBTrial(raw.bLastTrial),
  dialogue:sanitizeDialogue(raw.dialogue),
  elapsedMs:Number.isFinite(raw.elapsedMs)&&raw.elapsedMs>=0?raw.elapsedMs:0};
}
export const SaveManager={STORAGE_KEY,LEVEL_ID,SCHEMA_VERSION:1,
 load(){try{return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}},
 save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sanitize({...s,schemaVersion:1,layoutVersion:1,levelId:LEVEL_ID})));return true;}catch{return false;}},
 clear(){try{localStorage.removeItem(STORAGE_KEY);}catch{}},
 // Explicit isolation: neither old save coordinates nor earned gates are imported.
 legacyAvailable(){return false;},importLegacy(){return false;}
};

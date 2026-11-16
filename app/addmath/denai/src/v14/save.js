import {validBInput,sanitizeBTrial} from './b-control.js';
import {CHECKPOINTS,COLLECTIBLES,SECRETS,GATES} from './level.js';
import {sanitizeDialogue} from './dialogue.js';
import {MISSION_BANK} from './missions.js';
import {sanitizeQuest} from './levels/supply-quest.js';
const variantIds=MISSION_BANK.map(v=>v.id);
const count=v=>Number.isInteger(v)&&v>=0&&v<1e6?v:0;
// V14: this slice has no water/river content (only the 'lift' gate exists —
// see level.js's header comment), so the river/waterworks sanitization V13
// carried here is dropped rather than kept as dead weight. Separate
// STORAGE_KEY/LEVEL_ID/layoutVersion from V13's so a V13 save is never
// misread by this build (sanitize() below rejects anything with a
// different levelId) and vice versa.
const STORAGE_KEY='denai-save-v14',LEVEL_ID='denai-bab1-functions-v14-slice';
const pick=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
export function sanitize(raw){
 // Phase 2A migration: layout 1 (pre-redesign) saves are accepted and
 // upgraded to layout 2. Unknown coin ids (tower-1, tower-2, mid-bonus) are
 // dropped by pick(); checkpoint/gate/secret ids are unchanged.
 // Schema 2 (retention pass) adds run identity + mission variant. Schema 1
 // saves migrate in place: a run already in progress keeps variant 'A' (the
 // original question) so an active puzzle is never silently replaced.
 if(!raw||![1,2].includes(raw.schemaVersion)||![1,2].includes(raw.layoutVersion)||raw.levelId!==LEVEL_ID)return null;
 const legacy=raw.schemaVersion===1;
 const gateIds=GATES.map(g=>g.id);
 const solvedGateIds=pick(raw.solvedGateIds,gateIds);
 const cp=CHECKPOINTS.find(c=>c.id===raw.checkpointId);
 const cClues=pick(raw.cClues,['a','b']);
 const validCompletion=gateIds.every(id=>solvedGateIds.includes(id));
 return {schemaVersion:2,layoutVersion:2,levelId:LEVEL_ID,worldId:'w1',levelKey:'w1-l1',
  runId:!legacy&&typeof raw.runId==='string'&&raw.runId.length<64?raw.runId:'legacy-v1',
  runSeed:!legacy&&Number.isInteger(raw.runSeed)&&raw.runSeed>=0?raw.runSeed>>>0:0,
  missions:{lift:!legacy&&variantIds.includes(raw.missions?.lift)?raw.missions.lift:'A'},
  attempts:{lift:{wrong:count(raw.attempts?.lift?.wrong),correct:count(raw.attempts?.lift?.correct)}},
  eligible:!legacy&&raw.eligible===true,explore:!legacy&&raw.explore===true,
  startedAt:!legacy&&typeof raw.startedAt==='string'?raw.startedAt:null,
  checkpointId:cp&&(!cp.requires||cp.requires.every(id=>solvedGateIds.includes(id)))?cp.id:null,
  solvedGateIds,cClues,
  collectedCoinIds:pick(raw.collectedCoinIds,COLLECTIBLES.map(c=>c.id)),
  discoveredSecretIds:pick(raw.discoveredSecretIds,SECRETS.map(s=>s.id)),
  phase1Reviewed:raw.phase1Reviewed===true&&solvedGateIds.includes('lift'),completed:raw.completed===true&&validCompletion&&cp?.id==='cp-final',
  bInput:validBInput(raw.bInput)?raw.bInput:null,bLastTrial:sanitizeBTrial(raw.bLastTrial),
  dialogue:sanitizeDialogue(raw.dialogue),
  // World 1 V3 quest state (optional field: older saves migrate in place).
  quest:sanitizeQuest(raw.quest,solvedGateIds.includes('lift')),
  elapsedMs:Number.isFinite(raw.elapsedMs)&&raw.elapsedMs>=0?raw.elapsedMs:0};
}
export const SaveManager={STORAGE_KEY,LEVEL_ID,SCHEMA_VERSION:2,
 load(){try{return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return null;}},
 save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sanitize({...s,schemaVersion:2,layoutVersion:2,levelId:LEVEL_ID})));return true;}catch{return false;}},
 raw(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch{return null;}},
 clear(){try{localStorage.removeItem(STORAGE_KEY);}catch{}},
 // Explicit isolation: neither old save coordinates nor earned gates are imported.
 legacyAvailable(){return false;},importLegacy(){return false;}
};

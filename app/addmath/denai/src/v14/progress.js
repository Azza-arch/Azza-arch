// DENAI permanent player progress (B). Survives new adventures and replays.
// Stored ONLY in this browser (localStorage); nothing is sent anywhere.
// Separate from the current-run save (save.js, A + C) on purpose: starting
// a new adventure clears the run save but never this profile.
import {COLLECTIBLES,SECRETS} from './level.js';
export const PROFILE_KEY='denai-profile-v1', LEVEL_KEY='w1-l1';
// Current Level 1-1 course (bump when the 1-1 map changes so old times stay separate).
export const L1_COURSE='v3'; // World 1 V3: storeroom + purchase mission
const LEGACY_RECORDS_KEY='denai-records-v14', LEGACY_RECORDS_LEVEL='bab1-l1-jejak-taman-fungsi';
const coinIds=COLLECTIBLES.map(c=>c.id), secretIds=SECRETS.map(s=>s.id);
const pick=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
const num=(v,min=0)=>Number.isFinite(v)&&v>=min?v:null;
// World 1 V3: 'tepat-sekali' and 'tiga-cara' belonged to the retired lift
// machine. They are no longer awarded, but players who earned them keep
// them (legacy:true keeps them valid in saves and visible in the journal).
export const ACHIEVEMENTS=[
 {id:'jejak-pertama',title:'Jejak Pertama',desc:'Selesaikan Level 1-1.'},
 {id:'bajet-cermat',title:'Bajet Cermat',desc:'Beli tepat 5 papan dalam bajet di Stor Kayu.'},
 {id:'pemburu-syiling',title:'Pemburu Syiling',desc:`Kumpul ${coinIds.length}/${coinIds.length} syiling dalam satu pengembaraan.`},
 {id:'penjejak-rahsia',title:'Penjejak Rahsia',desc:`Temui ${secretIds.length}/${secretIds.length} rahsia.`},
 {id:'jalan-pintas',title:'Jalan Pintas',desc:'Guna laluan turun dari gerbang akar ke Stor Kayu.'},
 {id:'tepat-sekali',title:'Tepat Sekali',desc:'Hidupkan mesin fungsi lama tanpa jawapan salah.',legacy:true},
 {id:'tiga-cara',title:'Tiga Cara Berfikir',desc:'Selesaikan mesin lama dengan tiga jenis misi.',legacy:true},
];
export const ACTIVE_ACHIEVEMENTS=ACHIEVEMENTS.filter(a=>!a.legacy);
const levelDefault=()=>({completions:0,firstCompletedAt:null,best:null,classicBest:null});
export function defaultProfile(){
 return {schemaVersion:1,createdAt:new Date().toISOString(),levels:{[LEVEL_KEY]:levelDefault()},
  coinIds:[],secretIds:[],achievements:[],adventuresCompleted:0,
  mastered:{variants:[],types:[]},recentVariants:{lift:[]},migrated:[]};
}
export function sanitizeProfile(raw){
 const p=defaultProfile();if(!raw||raw.schemaVersion!==1)return p;
 const lv=raw.levels?.[LEVEL_KEY]||{},entry=e=>e&&num(e.timeMs,1)?{timeMs:e.timeMs,coins:num(e.coins)??0,secrets:num(e.secrets)??0,at:String(e.at||'')}:null;
 // Level 1-1 course versions: the map changed in the World 1 redesign, so
 // times from the old course are not comparable. A best without a course
 // tag (or with a different one) is kept as classicBest, never as the
 // current-course best that can be ranked.
 const tagged=lv.best?.course===L1_COURSE?entry(lv.best):null,legacy=lv.best&&lv.best.course!==L1_COURSE?entry(lv.best):null;
 const classicBest=[entry(lv.classicBest),legacy].filter(Boolean).sort((a,b)=>a.timeMs-b.timeMs)[0]||null;
 p.createdAt=typeof raw.createdAt==='string'?raw.createdAt:p.createdAt;
 p.levels[LEVEL_KEY]={completions:num(lv.completions)??0,firstCompletedAt:typeof lv.firstCompletedAt==='string'?lv.firstCompletedAt:null,best:tagged&&{...tagged,course:L1_COURSE},classicBest};
 p.coinIds=pick(raw.coinIds,coinIds);p.secretIds=pick(raw.secretIds,secretIds);
 p.achievements=pick(raw.achievements,ACHIEVEMENTS.map(a=>a.id));
 p.adventuresCompleted=num(raw.adventuresCompleted)??0;
 p.mastered={variants:Array.isArray(raw.mastered?.variants)?[...new Set(raw.mastered.variants.map(String))]:[],types:pick(raw.mastered?.types,['find-input','find-rule','pattern'])};
 p.recentVariants={lift:Array.isArray(raw.recentVariants?.lift)?raw.recentVariants.lift.map(String).slice(-4):[]};
 p.migrated=Array.isArray(raw.migrated)?raw.migrated.map(String):[];
 return p;
}
let storage=(()=>{try{return globalThis.localStorage;}catch{return null;}})();
export function _setStorage(s){storage=s;} // tests only
export function loadProfile(){try{return sanitizeProfile(JSON.parse(storage?.getItem(PROFILE_KEY)||'null'));}catch{return defaultProfile();}}
export function saveProfile(p){try{storage?.setItem(PROFILE_KEY,JSON.stringify(sanitizeProfile(p)));return true;}catch{return false;}}
const update=fn=>{const p=loadProfile();const r=fn(p);saveProfile(p);return r;};
// One-time, non-destructive migration of pre-profile data (old keys are left in place).
export function migrateLegacy(oldRunSave){
 return update(p=>{
  if(!p.migrated.includes('records-v14')){
   try{const old=JSON.parse(storage?.getItem(LEGACY_RECORDS_KEY)||'null')?.[LEGACY_RECORDS_LEVEL];
    if(old){const lv=p.levels[LEVEL_KEY];lv.completions=Math.max(lv.completions,num(old.completions)??0);
     if(old.best&&num(old.best.timeMs,1))lv.classicBest=(!lv.classicBest||old.best.timeMs<lv.classicBest.timeMs)?{timeMs:old.best.timeMs,coins:old.best.coins??0,secrets:old.best.secrets??0,at:old.best.at||''}:lv.classicBest;}}catch{}
   p.migrated.push('records-v14');
  }
  if(oldRunSave&&!p.migrated.includes('run-v1')){
   p.coinIds=[...new Set([...p.coinIds,...pick(oldRunSave.collectedCoinIds,coinIds)])];
   p.secretIds=[...new Set([...p.secretIds,...pick(oldRunSave.discoveredSecretIds,secretIds)])];
   if(oldRunSave.completed){const lv=p.levels[LEVEL_KEY];lv.completions=Math.max(lv.completions,1);lv.firstCompletedAt||=new Date().toISOString();if(!p.achievements.includes('jejak-pertama'))p.achievements.push('jejak-pertama');}
   p.migrated.push('run-v1');
  }
  return p;
 });
}
// Quest achievements are given at the moment they happen (once).
export const awardAchievement=id=>update(p=>{if(ACHIEVEMENTS.some(a=>a.id===id&&!a.legacy)&&!p.achievements.includes(id))p.achievements.push(id);});
export const addCoin=id=>update(p=>{if(coinIds.includes(id)&&!p.coinIds.includes(id))p.coinIds.push(id);});
export const addSecret=id=>update(p=>{if(secretIds.includes(id)&&!p.secretIds.includes(id))p.secretIds.push(id);});
export const noteRunVariant=id=>update(p=>{p.recentVariants.lift=[...p.recentVariants.lift.filter(x=>x!==id),id].slice(-4);});
export const recentVariants=()=>loadProfile().recentVariants.lift;
export function recordSolved(variant){return update(p=>{if(!p.mastered.variants.includes(variant.id))p.mastered.variants.push(variant.id);if(!p.mastered.types.includes(variant.type))p.mastered.types.push(variant.type);});}
const better=(a,b)=>!b||a.timeMs<b.timeMs||(a.timeMs===b.timeMs&&(a.coins>b.coins||(a.coins===b.coins&&a.secrets>b.secrets)));
// Called once per completed run. Returns what changed so the victory card can say so.
export function recordCompletion(run){
 return update(p=>{
  const lv=p.levels[LEVEL_KEY],before=new Set(p.achievements),prevBest=lv.best,entry={timeMs:Math.round(run.timeMs),coins:run.coins,secrets:run.secrets,at:new Date().toISOString(),course:L1_COURSE};
  lv.completions++;lv.firstCompletedAt||=entry.at;p.adventuresCompleted++;
  let isNewBest=false;if(run.eligible&&better(entry,lv.best)){lv.best=entry;isNewBest=true;}
  const has=id=>p.achievements.includes(id),give=id=>{if(!has(id))p.achievements.push(id);};
  give('jejak-pertama');
  if(run.coins>=coinIds.length)give('pemburu-syiling');
  if(p.secretIds.length>=secretIds.length)give('penjejak-rahsia');
  return {isNewBest,best:lv.best,prevBest,completions:lv.completions,newAchievements:p.achievements.filter(a=>!before.has(a))};
 });
}

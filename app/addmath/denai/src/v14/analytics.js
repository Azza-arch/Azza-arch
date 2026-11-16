// DENAI product analytics (Growth plan, Phase A).
// - OFF by default (config.analytics.enabled). Nothing is queued or sent.
// - Strict allowlist: every event has fixed fields with fixed value types.
//   No names, nicknames, e-mail, free text, URLs, device or location data.
// - Identity = the anonymous PlayFab account the game already uses; events
//   never trigger a login on their own and wait for an existing session.
// - Respects Global Privacy Control / Do Not Track: nothing is sent.
// - Automated browsers never reach PlayFab (guard in playfab.js).
import {LEADERBOARD_CONFIG as CFG} from './leaderboard/config.js';
import * as PF from './leaderboard/playfab.js';

const LEVELS=['w1-l1','w1-l2','w1-l3'];
const enumOf=list=>v=>list.includes(v)?v:undefined;
const int=(min,max)=>v=>Number.isInteger(v)&&v>=min&&v<=max?v:undefined;
const bool=v=>typeof v==='boolean'?v:undefined;
const level=enumOf(LEVELS);
// Duration is bucketed (seconds, capped) so it describes pacing, not people.
export const durationBucket=ms=>{const s=Math.round(ms/1000);return [30,60,120,180,300,600,1200,3600].find(b=>s<=b)??3601;};
export const SCHEMA=Object.freeze({
  game_started:{entry:enumOf(['menu','map','continue'])},
  level_started:{level,mode:enumOf(['play','continue','replay','next'])},
  level_replayed:{level},
  level_completed:{level,duration_s:int(1,3601),coins:int(0,99),secrets:int(0,9),ranked_eligible:bool,first_completion:bool},
  leaderboard_joined:{level},
  result_shared:{level,method:enumOf(['native','image'])},
  update_opt_in:{source:enumOf(['victory','landing']),channel:enumOf(['release'])},
  purchase_completed:{offer:enumOf(['supporter','teacher-pilot']),currency:enumOf(['MYR']),amount_bucket:enumOf(['<10','10-49','50-199','200+'])},
});
const cfg=()=>CFG.analytics||{};
const privacySignal=()=>globalThis.navigator?.globalPrivacyControl===true||globalThis.navigator?.doNotTrack==='1';
export function enabled(){
  if(globalThis.__DENAI_ANALYTICS_FORCE__===true)return !privacySignal(); // tests only (with a local PlayFab fake)
  return cfg().enabled===true&&CFG.provider==='playfab'&&CFG.playfab.enabled&&!privacySignal();
}
// Validate against the schema; unknown events/fields are dropped, never sent.
export function clean(name,data={}){
  const spec=SCHEMA[name];if(!spec)return null;
  if(name==='purchase_completed'&&cfg().purchasesLive!==true)return null; // no checkout exists yet
  const out={};
  for(const [k,check] of Object.entries(spec)){const v=check(data[k]);if(v!==undefined)out[k]=v;}
  return out;
}
const SESSION=Math.random().toString(36).slice(2,10); // per page load, not stored
let queue=[],timer=null,startedThisSession=false;
export const _queue=()=>queue; // tests
export function track(name,data){
  if(!enabled())return false;
  const payload=clean(name,data);if(!payload)return false;
  queue.push({EventNamespace:cfg().namespace||'custom.denai',Name:name,Payload:{...payload,session:SESSION,v:1}});
  if(queue.length>=(cfg().flushEvery||10))flush();
  else if(!timer)timer=setTimeout(()=>flush(),cfg().flushMs||30000);
  return true;
}
// game_started: once per page session, at the first real launch.
export function trackGameStart(entry){if(startedThisSession)return;startedThisSession=true;track('game_started',{entry});}
export async function flush({keepalive=false}={}){
  clearTimeout(timer);timer=null;
  if(!queue.length||!PF.hasSession())return; // keep events until a session exists
  const batch=queue.splice(0,25);
  try{await PF.writeEvents(batch,{keepalive});}
  catch{queue.unshift(...batch.slice(0,50-queue.length));} // bounded retry buffer
  if(queue.length&&!timer)timer=setTimeout(()=>flush(),cfg().flushMs||30000);
}
if(typeof addEventListener==='function')addEventListener('pagehide',()=>{if(enabled())flush({keepalive:true});});

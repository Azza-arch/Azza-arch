// Minimal PlayFab REST calls (no SDK). Public Title ID only, no secret key.
// Login + display name: Client API. Scores + rankings: Progression API
// (Statistic / Leaderboard v2) with the player's entity token.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
const BASE=`https://${CFG.playfab.titleId.toLowerCase()}.playfabapi.com/`;
const DEVICE_KEY='denai-lb-device';      // random anonymous id, not a password
const SUBMITTED_KEY='denai-lb-submitted'; // + ':<board>': best time (ms) already sent from this device to that board
const sentKey=board=>`${SUBMITTED_KEY}:${board}`;
let session=null,pending=null;
const store={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
export class LeaderboardError extends Error{constructor(code,msg){super(msg||code);this.code=code;}}
async function call(path,body,auth=null){
  const headers={'Content-Type':'application/json'};
  if(auth==='ticket')headers['X-Authorization']=session.ticket;
  if(auth==='entity')headers['X-EntityToken']=session.entityToken;
  let res;
  try{res=await fetch(BASE+path,{method:'POST',headers,body:JSON.stringify(body)});}
  catch{throw new LeaderboardError('offline');}
  let json=null;try{json=await res.json();}catch{}
  if(!res.ok||!json||json.code!==200)throw new LeaderboardError(json?.error||`http-${res.status}`,json?.errorMessage);
  return json.data;
}
function deviceId(){
  let id=store.get(DEVICE_KEY);
  if(!id){id='denai-'+(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''));store.set(DEVICE_KEY,id);}
  return id;
}
export function login(){
  if(session)return Promise.resolve(session);
  return pending||=(async()=>{try{return await doLogin();}finally{pending=null;}})();
}
async function doLogin(){
  const d=await call('Client/LoginWithCustomID',{TitleId:CFG.playfab.titleId,CustomId:deviceId(),CreateAccount:true,InfoRequestParameters:{GetPlayerProfile:true,ProfileConstraints:{ShowDisplayName:true}}});
  session={ticket:d.SessionTicket,entityToken:d.EntityToken?.EntityToken,entity:d.EntityToken?.Entity,name:d.InfoResultPayload?.PlayerProfile?.DisplayName||''};
  if(!session.entityToken||!session.entity)throw new LeaderboardError('no-entity');
  return session;
}
export async function setDisplayName(name){
  await login();await call('Client/UpdateUserTitleDisplayName',{DisplayName:name},'ticket');session.name=name;return name;
}
const toRow=e=>({rank:e.Rank,name:e.DisplayName||'Pemain tanpa nama',timeMs:Number(e.Scores?.[0]),entityId:e.Entity?.Id});
const valid=r=>Number.isFinite(r.timeMs)&&r.timeMs>0;
export async function topTimes(board,max=CFG.playfab.top){
  await login();
  const d=await call('Leaderboard/GetLeaderboard',{LeaderboardName:board,StartingPosition:1,PageSize:max},'entity');
  return (d.Rankings||[]).map(toRow).filter(valid);
}
export async function myRank(board){
  await login();
  const d=await call('Leaderboard/GetLeaderboardAroundEntity',{LeaderboardName:board,Entity:{Id:session.entity.Id,Type:session.entity.Type},MaxSurroundingEntries:1},'entity');
  const e=(d.Rankings||[]).find(r=>r.Entity?.Id===session.entity.Id);return e&&valid(toRow(e))?toRow(e):null;
}
// Writes ONLY the current-course statistics (never the classic archive).
export async function submitTime(timeMs){
  await login();
  const names=[CFG.playfab.leaderboards.allTime,CFG.playfab.leaderboards.weekly].filter(n=>n&&n!==CFG.playfab.classic);
  await call('Statistic/UpdateStatistics',{Statistics:names.map(Name=>({Name,Scores:[String(Math.round(timeMs))]}))},'entity');
  store.set(sentKey(CFG.playfab.leaderboards.allTime),String(Math.round(timeMs)));
}
// The legacy unscoped key belonged to the classic board; it never counts for v2.
export function submittedTime(board=CFG.playfab.leaderboards.allTime){const v=Number(store.get(sentKey(board)));return v>0?v:null;}
export function currentName(){return session?.name||'';}
export function playerId(){return session?.entity?.Id||null;}

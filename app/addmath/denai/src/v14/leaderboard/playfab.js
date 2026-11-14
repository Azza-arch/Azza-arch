// Minimal PlayFab Client REST calls (no SDK). Public Title ID only.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
const BASE=`https://${CFG.playfab.titleId.toLowerCase()}.playfabapi.com/Client/`;
const DEVICE_KEY='denai-lb-device';      // random anonymous id, not a password
const SUBMITTED_KEY='denai-lb-submitted'; // best time (ms) already sent from this device
let session=null,pending=null;
const store={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
export class LeaderboardError extends Error{constructor(code,msg){super(msg||code);this.code=code;}}
async function call(api,body,auth=true){
  let res;
  try{res=await fetch(BASE+api,{method:'POST',headers:{'Content-Type':'application/json',...(auth&&session?{'X-Authorization':session.ticket}:{})},body:JSON.stringify(body)});}
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
  const d=await call('LoginWithCustomID',{TitleId:CFG.playfab.titleId,CustomId:deviceId(),CreateAccount:true,InfoRequestParameters:{GetPlayerProfile:true,ProfileConstraints:{ShowDisplayName:true}}},false);
  session={ticket:d.SessionTicket,playerId:d.PlayFabId,name:d.InfoResultPayload?.PlayerProfile?.DisplayName||''};
  return session;
}
export async function setDisplayName(name){
  await login();await call('UpdateUserTitleDisplayName',{DisplayName:name});session.name=name;return name;
}
const toRow=e=>({rank:e.Position+1,name:e.DisplayName||'Pemain tanpa nama',timeMs:-e.StatValue,playerId:e.PlayFabId});
export async function topTimes(stat,max=CFG.playfab.top){
  await login();
  const d=await call('GetLeaderboard',{StatisticName:stat,StartPosition:0,MaxResultsCount:max});
  return (d.Leaderboard||[]).filter(e=>e.StatValue<0).map(toRow);
}
export async function myRank(stat){
  await login();
  const d=await call('GetLeaderboardAroundPlayer',{StatisticName:stat,MaxResultsCount:1});
  const e=(d.Leaderboard||[])[0];return e&&e.StatValue<0?toRow(e):null;
}
export async function submitTime(timeMs){
  await login();
  const stats=[CFG.playfab.statistics.allTime,CFG.playfab.statistics.weekly].filter(Boolean).map(StatisticName=>({StatisticName,Value:-Math.round(timeMs)}));
  await call('UpdatePlayerStatistics',{Statistics:stats});
  store.set(SUBMITTED_KEY,String(Math.round(timeMs)));
}
export function submittedTime(){const v=Number(store.get(SUBMITTED_KEY));return v>0?v:null;}
export function currentName(){return session?.name||'';}
export function playerId(){return session?.playerId||null;}

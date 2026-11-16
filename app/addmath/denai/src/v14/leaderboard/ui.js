// Leaderboard dialog. PlayFab provider: real global times, opt-in submission
// of the player's own eligible personal best. Mock provider: labelled samples.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
import {MOCK_LEADERBOARDS,MOCK_NOTICE} from './mock.js';
import {personalBest,formatTime,compareRuns} from './records.js';
import * as PF from './playfab.js';
import {track} from '../analytics.js';
const $=id=>document.getElementById(id);
const live=()=>CFG.provider==='playfab'&&CFG.playfab.enabled;
let tab='allTime',busy=false;
const PRIVACY='Papan ini dikongsi dengan semua pemain. Jika anda hantar rekod, nama paparan dan masa terbaik anda dipaparkan secara umum, bersama ID rawak peranti ini (disimpan oleh PlayFab, Microsoft). Jangan guna nama penuh sebenar.';
// Display names: short, plain characters, no obvious insults (PlayFab also requires them to be unique).
const BLOCK=/(babi|bodoh|sial|puki|pukimak|kimak|lancau|bangang|celaka|fuck|shit|bitch|asshole|dick|pussy|nigg)/i;
export function checkName(raw){
  const name=String(raw||'').trim().replace(/\s+/g,' ');
  if(name.length<3||name.length>16)return {ok:false,msg:'Nama perlu 3 hingga 16 aksara.'};
  if(!/^[A-Za-z0-9 _.-]+$/.test(name))return {ok:false,msg:'Guna huruf, nombor, ruang, titik, - atau _ sahaja.'};
  if(BLOCK.test(name.replace(/[^a-z]/gi,'')))return {ok:false,msg:'Sila pilih nama lain.'};
  return {ok:true,name};
}
const NAME_ERRORS=new Set(['NameNotAvailable','InvalidParams','ProfaneDisplayName']);
const friendly=(e,ctx='board')=>(ctx==='board'&&NAME_ERRORS.has(e?.code))?'Papan pendahulu tidak dapat dihubungi sekarang. Cuba lagi kemudian.':({
  offline:'Tiada sambungan internet. Papan pendahulu memerlukan talian.',
  PlayerCreationDisabled:'Papan pendahulu sedang disediakan. Cuba lagi kemudian.',
  APINotEnabledForGameClientAccess:'Papan pendahulu sedang disediakan. Cuba lagi kemudian.',
  LeaderboardNotFound:'Papan pendahulu sedang disediakan. Cuba lagi kemudian.',
  StatisticNotFound:'Papan pendahulu sedang disediakan. Cuba lagi kemudian.',
  ProductDisabledForTitle:'Papan pendahulu sedang disediakan. Cuba lagi kemudian.',
  NameNotAvailable:'Nama itu sudah digunakan pemain lain. Cuba nama lain.',
  InvalidParams:'Nama tidak diterima. Cuba nama lain.',
  ProfaneDisplayName:'Sila pilih nama lain.',
}[e?.code]||'Papan pendahulu tidak dapat dihubungi sekarang. Cuba lagi kemudian.');
function row(r,i,me=false){
  const tr=document.createElement('tr');if(me)tr.className='lb-me';
  for(const v of [r.rank?String(r.rank):(me?'—':String(i+1)),r.name,formatTime(r.timeMs)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}
  return tr;
}
function status(text){const body=$('lb-rows');body.replaceChildren();const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.className='lb-status';td.textContent=text;tr.append(td);body.append(tr);}
// Tabs: current course (ranked, writable) and the classic course archive
// (old 1-1 map, read-only). Times from different courses are never mixed.
const boardFor=t=>t==='classic'?CFG.playfab.classic:CFG.playfab.leaderboards.allTime;
let boardReady=true; // false once PlayFab says the current-course board does not exist yet
const NOT_READY=new Set(['LeaderboardNotFound','StatisticNotFound']);
function renderTabs(){
  const tabs=live()&&!!CFG.playfab.classic;
  document.querySelector('.lb-tabs').hidden=!tabs;
  if(!tabs)tab='allTime';
  document.querySelectorAll('[data-lb-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.lbTab===tab)));
}
function renderSubmit(){
  const box=$('lb-submit'),pb=personalBest(),sent=PF.submittedTime();
  const msg=$('lb-submit-msg');msg.textContent='';
  if(tab==='classic'){box.hidden=true;$('lb-pb').textContent='Arkib kursus lama Level 1-1 (sebelum reka bentuk semula). Rekod baharu tidak dihantar ke sini.';return;}
  if(!boardReady){box.hidden=true;$('lb-pb').textContent=pb?`Rekod peribadi anda (${formatTime(pb.timeMs)}) disimpan dalam peranti ini. Papan kursus baharu sedang disediakan.`:'Papan kursus baharu sedang disediakan.';return;}
  if(!pb){box.hidden=true;$('lb-pb').textContent='Tamatkan Level 1-1 dari awal tanpa sambung untuk mendapat masa yang boleh dihantar.';return;}
  if(sent&&sent<=pb.timeMs){box.hidden=true;$('lb-pb').textContent=`Rekod terbaik anda (${formatTime(pb.timeMs)}) sudah dihantar.`;return;}
  $('lb-pb').textContent=`Rekod peribadi anda: ${formatTime(pb.timeMs)}${sent?` (lebih pantas daripada ${formatTime(sent)} yang dihantar dulu)`:''}`;
  box.hidden=false;$('lb-name').value=$('lb-name').value||PF.currentName();
  $('lb-send').textContent=`Hantar ${formatTime(pb.timeMs)}`;
}
async function loadLive(){
  status('Memuatkan papan pendahulu…');
  try{
    const stat=boardFor(tab);
    const [rows,me]=await Promise.all([PF.topTimes(stat),PF.myRank(stat)]);
    const body=$('lb-rows');body.replaceChildren();
    if(!rows.length)status('Belum ada rekod. Jadilah yang pertama!');
    const myId=PF.playerId();
    if(!$('lb-name').value&&PF.currentName())$('lb-name').value=PF.currentName(); // known only after login
    rows.forEach((r,i)=>body.append(row(r,i,r.entityId===myId)));
    if(me&&!rows.some(r=>r.entityId===myId))body.append(row(me,0,true));
  }catch(e){
    if(tab!=='classic'&&NOT_READY.has(e?.code)){boardReady=false;renderSubmit();status('Papan pendahulu kursus baharu sedang disediakan. Rekod anda selamat dalam peranti ini.');return;}
    status(friendly(e));
  }
}
export function renderLeaderboard(){
  renderTabs();
  if(!live()){
    $('lb-notice').textContent=MOCK_NOTICE;$('lb-submit').hidden=true;
    const body=$('lb-rows');body.replaceChildren();[...(MOCK_LEADERBOARDS[tab]||[])].sort(compareRuns).forEach((r,i)=>body.append(row(r,i)));
    const pb=personalBest();$('lb-pb').textContent=pb?`Rekod peribadi anda (peranti ini): ${formatTime(pb.timeMs)}`:'Rekod peribadi anda: belum ada larian penuh yang layak.';
    return;
  }
  $('lb-notice').textContent=PRIVACY;
  renderSubmit();loadLive();
}
async function send(ev){
  ev.preventDefault();if(busy)return;
  const pb=personalBest(),msg=$('lb-submit-msg');if(!pb)return;
  const c=checkName($('lb-name').value);if(!c.ok){msg.textContent=c.msg;return;}
  busy=true;$('lb-send').disabled=true;msg.textContent='Menghantar…';
  try{
    await PF.login();
    if(PF.currentName()!==c.name)await PF.setDisplayName(c.name);
    await PF.submitTime(pb.timeMs);
    try{localStorage.setItem('denai-lb-consent','joined');localStorage.setItem('denai-lb-name',c.name);}catch{} // explicit consent via this form
    track('leaderboard_joined',{level:'w1-l1'});
    msg.textContent='';renderSubmit();await loadLive();
  }catch(e){if(NOT_READY.has(e?.code)){boardReady=false;renderSubmit();}msg.textContent=friendly(e,'send');}
  finally{busy=false;$('lb-send').disabled=false;}
}
export function installLeaderboard(){
  const open=()=>{renderLeaderboard();$('leaderboard').showModal();};
  $('lb-open-complete')?.addEventListener('click',open);
  $('lb-open-settings')?.addEventListener('click',open);
  $('lb-btn')?.addEventListener('click',open);
  $('lb-close').addEventListener('click',()=>$('leaderboard').close());
  $('lb-submit').addEventListener('submit',send);
  document.querySelectorAll('[data-lb-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.lbTab;renderLeaderboard();}));
}

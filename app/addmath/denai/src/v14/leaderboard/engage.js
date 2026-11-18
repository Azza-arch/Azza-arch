// DENAI Player Engagement V1.
// - Main menu: real unique-player count (PlayFab EntryCount), levels
//   available, top 3 of the current Level 1-1 board, ranking shortcut.
// - Level 1-1 victory: personal best / improvement, optional public
//   nickname consent, confirmed submission + rank, share card.
// All text from the network is written with textContent (never HTML).
// No synthetic rows: if data is missing, the element is hidden or says so.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
import * as PF from './playfab.js';
import {checkName} from './ui.js';
import {formatTime,personalBest} from './records.js';
import {LEVELS} from '../levels/registry.js';
import {track} from '../analytics.js';

const $=id=>document.getElementById(id);
const BOARD=CFG.playfab.leaderboards.allTime,COMMUNITY=CFG.community||{};
const K={consent:'denai-lb-consent',name:'denai-lb-name',counted:`denai-counted:${COMMUNITY.playersBoard}`,cache:'denai-community-cache',last:'denai-lb-last-submit'};
const store={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}},del(k){try{localStorage.removeItem(k);}catch{}}};
const live=()=>CFG.provider==='playfab'&&CFG.playfab.enabled;
const NOT_READY=new Set(['LeaderboardNotFound','StatisticNotFound']);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
export const consent=()=>store.get(K.consent); // 'joined' | 'skipped' | null
export const savedName=()=>store.get(K.name)||'';
let confirmed=null; // {rank,timeMs} confirmed by the board this session (share card)

// ── Player counting ─────────────────────────────────────────────────────
// Counted once per player identity (anonymous PlayFab account of this
// browser) when they start a level; reloads and later sessions do not count
// again (local flag + PlayFab keeps one entry per identity).
let countRequest=null;
export function armPlayerCount(){
  if(!live()||!COMMUNITY.playersBoard||store.get(K.counted)||countRequest)return;
  countRequest=PF.markStarted(COMMUNITY.playersBoard)
    .then(()=>{store.set(K.counted,'1');store.del(K.cache);})
    .catch(e=>console.warn('DENAI: kiraan pemain gagal —',e?.code||e?.message||e))
    .finally(()=>{countRequest=null;});
}

// ── Community data (cached) ─────────────────────────────────────────────
export async function community({force=false}={}){
  let c=null;try{c=JSON.parse(store.get(K.cache)||'null');}catch{}
  if(!force&&c&&Date.now()-c.at<(COMMUNITY.cacheMs??300000))return c;
  await PF.login(); // throws when offline: caller shows the fallback
  const [players,top]=await Promise.allSettled([COMMUNITY.playersBoard?PF.board(COMMUNITY.playersBoard,1):Promise.reject(new Error('off')),PF.board(BOARD,3)]);
  const out={at:Date.now(),players:players.status==='fulfilled'?players.value.entryCount:null,
    top:top.status==='fulfilled'?top.value.rows.slice(0,3):null,boardReady:!(top.status==='rejected'&&NOT_READY.has(top.reason?.code))};
  store.set(K.cache,JSON.stringify(out));return out;
}

// ── Submission (idempotent, throttled) ──────────────────────────────────
// Sends the current-course personal best only if it beats what this device
// already sent to the same board. Resolves with what the server confirmed.
let inflight=null;
export function submitBest(){
  if(inflight)return inflight;
  const run=(async()=>{
    try{
      const pb=personalBest();if(!pb)return {status:'none'};
      const sent=PF.submittedTime();if(sent&&sent<=pb.timeMs)return {status:'unchanged',timeMs:sent};
      const last=Number(store.get(K.last))||0;
      if(Date.now()-last<CFG.rules.minSubmitIntervalMs)return {status:'later'};
      await PF.submitTime(pb.timeMs);store.set(K.last,String(Date.now()));store.del(K.cache); // throttle counts accepted writes only
      return {status:'sent',timeMs:pb.timeMs};
    }catch(e){return {status:NOT_READY.has(e?.code)?'not-ready':e?.code==='offline'?'offline':'error',code:e?.code};}
  })();
  inflight=run;run.finally(()=>{if(inflight===run)inflight=null;});
  return run;
}
// Pending results (offline / throttled earlier) go out on the next menu visit.
function retryPending(){
  if(!live()||consent()!=='joined')return;
  const pb=personalBest(),sent=PF.submittedTime();
  if(pb&&(!sent||pb.timeMs<sent))submitBest();
}

// ── Main menu ───────────────────────────────────────────────────────────
let menuBusy=false;
export async function renderMenuCommunity(){
  const box=$('community');if(!box||menuBusy)return;
  $('cm-levels').textContent=`${LEVELS.filter(l=>l.ready).length} level tersedia`;
  box.hidden=false;
  if(!live()){$('cm-players').hidden=true;$('cm-top-wrap').hidden=true;return;}
  menuBusy=true;
  try{
    retryPending();
    const c=await community();
    const n=c.players;$('cm-players').hidden=!(Number.isSafeInteger(n)&&n>0);
    if(!$('cm-players').hidden)$('cm-players').textContent=`${n.toLocaleString('ms-MY')} pemain direkodkan`;
    $('cm-count-note').hidden=$('cm-players').hidden;
    const list=$('cm-top');list.replaceChildren();$('cm-top-wrap').hidden=false;
    if(!c.boardReady)list.append(el('li','cm-empty','Ranking kursus baharu akan dibuka tidak lama lagi.'));
    else if(!c.top)list.append(el('li','cm-empty','Ranking tidak dapat dimuatkan sekarang.'));
    else if(!c.top.length)list.append(el('li','cm-empty','Belum ada rekod. Jadi pemain pertama!'));
    else for(const r of c.top){const li=el('li',r.entityId&&r.entityId===PF.playerId()?'is-me':'');li.append(el('b',null,`${r.rank}.`),el('span','cm-name',r.name),el('span','cm-time',formatTime(r.timeMs)));list.append(li);}
  }catch{
    // Day 02 · P2-07: offline / PlayFab unreachable — an invitation, not a
    // technical error, on the first screen. The ranking dialog (on request)
    // still explains the connection state; pending results retry next visit.
    $('cm-players').hidden=true;$('cm-top-wrap').hidden=false;$('cm-count-note').hidden=true;
    $('cm-top').replaceChildren(el('li','cm-empty cm-offline','Main dahulu untuk sertai ranking.'));
  }finally{menuBusy=false;}
}

// ── Victory (Level 1-1) ─────────────────────────────────────────────────
const secs=ms=>Math.max(1,Math.round(ms/1000));
function pbLine(res){
  if(!res)return '';
  if(!res.verdict?.eligible)return `Masa ini tidak dikira untuk ranking: ${res.verdict?.reasons?.[0]||'larian tidak lengkap.'}`;
  if(res.isNewBest&&res.prevBest)return `Rekod peribadi baharu! ${secs(res.prevBest.timeMs-res.best.timeMs)} s lebih pantas daripada ${formatTime(res.prevBest.timeMs)}.`;
  if(res.isNewBest)return 'Rekod peribadi pertama anda untuk kursus ini!';
  if(res.best)return `Rekod terbaik anda kekal ${formatTime(res.best.timeMs)} · ${secs(Math.max(0,res.timeMs-res.best.timeMs))} s lagi untuk mengatasinya.`;
  return '';
}
function show(part){for(const id of ['vrank-join','vrank-result','vrank-later'])$(id).hidden=id!==part;}
function status(text){show('vrank-result');$('vrank-status').textContent=text;$('vrank-list').replaceChildren();$('vrank-list').hidden=true;$('vrank-edit').hidden=true;}
async function showRank(lead=''){
  status(`${lead}Memuatkan kedudukan…`);
  try{
    const [top,near]=await Promise.all([PF.topTimes(BOARD,3),PF.aroundMe(BOARD,2)]);
    const me=near.find(r=>r.entityId===PF.playerId());
    const rows=[...top];for(const r of near)if(!rows.some(x=>x.rank===r.rank))rows.push(r);rows.sort((a,b)=>a.rank-b.rank);
    const list=$('vrank-list');list.replaceChildren();
    let prev=0;for(const r of rows){if(prev&&r.rank>prev+1)list.append(el('li','vrank-gap','…'));const li=el('li',r.entityId===PF.playerId()?'is-me':'');li.append(el('b',null,`#${r.rank}`),el('span',null,r.name),el('span',null,formatTime(r.timeMs)));if(li.className)li.setAttribute('aria-label',`Anda: kedudukan ${r.rank}, ${formatTime(r.timeMs)}`);list.append(li);prev=r.rank;}
    list.hidden=!rows.length;
    confirmed=me?{rank:me.rank,timeMs:me.timeMs}:null;
    $('vrank-status').textContent=me?`${lead}Kedudukan anda: #${me.rank} · ${formatTime(me.timeMs)}`:`${lead}Rekod diterima. Kedudukan sedang dikemas kini — semak papan pendahulu sebentar lagi.`;
    $('vrank-edit').hidden=false;
  }catch(e){
    $('vrank-status').textContent=NOT_READY.has(e?.code)?'Papan kursus baharu sedang disediakan. Rekod anda selamat dalam peranti ini.':'Kedudukan tidak dapat dimuatkan sekarang. Rekod anda selamat dalam peranti ini.';
  }
}
async function afterSubmit(r){
  if(r.status==='sent')return showRank('Rekod dihantar. ');
  if(r.status==='unchanged')return showRank();
  status({'not-ready':'Nama disimpan. Papan kursus baharu sedang disediakan; rekod anda akan dihantar apabila ia dibuka.',
    offline:'Tiada sambungan. Rekod disimpan dalam peranti ini dan akan dihantar kemudian.',
    later:'Rekod disimpan dan akan dihantar sebentar lagi.',
    none:'Tamatkan Level 1-1 dari awal tanpa sambung untuk mendapat masa ranking.'}[r.status]||'Rekod belum dapat dihantar. Ia disimpan dalam peranti ini; cuba lagi kemudian.');
}
function openJoin(focus=false){
  show('vrank-join');$('vrank-msg').textContent='';
  const n=$('vrank-name');n.value=n.value||savedName()||PF.currentName();
  if(focus===true)requestAnimationFrame(()=>n.focus({preventScroll:false}));
}
let joining=false;
async function join(ev){
  ev.preventDefault();if(joining)return;
  const c=checkName($('vrank-name').value),msg=$('vrank-msg');
  if(!c.ok){msg.textContent=c.msg;return;}
  joining=true;$('vrank-send').disabled=true;msg.textContent='Menyimpan nama…';
  try{
    await PF.login();
    if(PF.currentName()!==c.name)await PF.setDisplayName(c.name);
    store.set(K.consent,'joined');store.set(K.name,c.name);msg.textContent='';track('leaderboard_joined',{level:'w1-l1'});
    await afterSubmit(await submitBest());
  }catch(e){
    msg.textContent=e?.code==='NameNotAvailable'?'Nama itu sudah digunakan pemain lain. Cuba nama lain.':e?.code==='ProfaneDisplayName'||e?.code==='InvalidParams'?'Nama tidak diterima. Cuba nama lain.':e?.code==='offline'?'Tiada sambungan internet. Cuba lagi kemudian.':'Tidak dapat menyimpan nama sekarang. Cuba lagi kemudian.';
  }finally{joining=false;$('vrank-send').disabled=false;}
}
let lastRes=null;
export function onVictory(res,timeMs){
  const box=$('vrank');if(!box)return;
  if(!res){box.hidden=true;return;} // explore replay: nothing new to rank
  const fresh=res!==lastRes;lastRes=res;
  box.hidden=false;
  $('vrank-pb').textContent=pbLine({...res,timeMs});
  $('vrank-pb').classList.toggle('is-best',!!res.isNewBest);
  if(!live()){show(null);return;}
  const pb=personalBest();
  if(!pb){show(null);return;}
  if(consent()==='joined'){if(fresh)submitBest().then(afterSubmit);return;}
  if(consent()==='skipped'){show('vrank-later');return;}
  openJoin();
}

// ── Share card ──────────────────────────────────────────────────────────
function cardCanvas({timeMs,coins,totalCoins}){
  const W=1200,H=630,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#7ff0a5');grad.addColorStop(1,'#2eb082');g.fillStyle=grad;g.fillRect(0,0,W,H);
  g.fillStyle='#fdf3dc';g.strokeStyle='#5b3a1e';g.lineWidth=12;g.beginPath();g.roundRect(60,60,W-120,H-120,18);g.fill();g.stroke();
  g.textAlign='center';g.fillStyle='#2b2118';
  g.font='900 92px system-ui, sans-serif';g.fillText('DENAI',W/2,170);
  g.font='700 34px system-ui, sans-serif';g.fillStyle='#8a5a2b';g.fillText('Dunia 1 · Level 1-1 · Jejak Taman Fungsi',W/2,222);
  const name=consent()==='joined'?savedName():'';
  if(name){g.font='800 40px system-ui, sans-serif';g.fillStyle='#2b2118';g.fillText(name,W/2,292);}
  const stats=[['MASA',formatTime(timeMs)],['SYILING',`${coins}/${totalCoins}`]];
  if(confirmed&&personalBest()&&confirmed.timeMs===personalBest().timeMs)stats.push(['KEDUDUKAN',`#${confirmed.rank}`]);
  const step=(W-240)/stats.length;
  stats.forEach(([k,v],i)=>{const x=120+step*(i+.5);g.fillStyle='#2b2118';g.font='900 78px ui-monospace, monospace';g.fillText(v,x,410);g.fillStyle='#8a5a2b';g.font='800 26px system-ui, sans-serif';g.fillText(k,x,450);});
  g.fillStyle='#5b3a1e';g.font='600 26px system-ui, sans-serif';g.fillText(location.host+location.pathname,W/2,528);
  return c;
}
let shareUrl=null,shareBlob=null;
export function openShare(stats){
  const c=cardCanvas(stats);
  c.toBlob(blob=>{
    if(!blob)return;shareBlob=blob;if(shareUrl)URL.revokeObjectURL(shareUrl);shareUrl=URL.createObjectURL(blob);
    $('share-img').src=shareUrl;$('share-save').href=shareUrl;
    const file=new File([blob],'denai-keputusan.png',{type:'image/png'});
    $('share-native').hidden=!(navigator.canShare?.({files:[file]}));
    $('share-msg').textContent='';$('share-dialog').showModal();
  },'image/png');
}
export function installEngage(){
  // Short landscape phones: the title column is transformed, so the card is
  // re-parented to #welcome to sit in the free bottom-right corner.
  const mq=matchMedia('(max-height:520px) and (min-aspect-ratio:1/1)');
  const place=()=>{const c=$('community'),home=document.querySelector('#welcome .title-copy');if(c&&home&&$('welcome'))(mq.matches?$('welcome'):home).append(c);};
  mq.addEventListener?.('change',place);place();
  $('vrank-join')?.addEventListener('submit',join);
  $('vrank-skip')?.addEventListener('click',()=>{store.set(K.consent,'skipped');show('vrank-later');});
  $('vrank-later-join')?.addEventListener('click',()=>openJoin(true));
  $('vrank-edit')?.addEventListener('click',()=>openJoin(true));
  $('cm-ranking')?.addEventListener('click',()=>$('lb-btn')?.click());
  $('share-close')?.addEventListener('click',()=>$('share-dialog').close());
  $('share-save')?.addEventListener('click',()=>track('result_shared',{level:'w1-l1',method:'image'}));
  $('share-native')?.addEventListener('click',async()=>{
    if(!shareBlob)return;
    try{await navigator.share({files:[new File([shareBlob],'denai-keputusan.png',{type:'image/png'})],title:'DENAI',text:'Keputusan DENAI saya',url:location.origin+location.pathname});track('result_shared',{level:'w1-l1',method:'native'});}
    catch(e){if(e?.name!=='AbortError')$('share-msg').textContent='Perkongsian tidak tersedia. Guna Simpan gambar.';}
  });
}

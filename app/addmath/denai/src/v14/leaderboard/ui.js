// Leaderboard dialog (mock provider). Shows sample rows, clearly labelled,
// and the player's real local personal best.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
import {MOCK_LEADERBOARDS,MOCK_NOTICE} from './mock.js';
import {personalBest,formatTime,compareRuns} from './records.js';
const $=id=>document.getElementById(id);
let tab='allTime';
function row(r,i,me=false){
  const tr=document.createElement('tr');if(me)tr.className='lb-me';
  for(const v of [me?'—':String(i+1),r.name,formatTime(r.timeMs),`${r.coins}`,`${r.secrets}`]){const td=document.createElement('td');td.textContent=v;tr.append(td);}
  return tr;
}
export function renderLeaderboard(){
  $('lb-notice').textContent=MOCK_NOTICE;
  document.querySelectorAll('[data-lb-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.lbTab===tab)));
  const body=$('lb-rows');body.replaceChildren();
  [...MOCK_LEADERBOARDS[tab]].sort(compareRuns).forEach((r,i)=>body.append(row(r,i)));
  const pb=personalBest();
  $('lb-pb').textContent=pb?`Rekod peribadi anda (peranti ini): ${formatTime(pb.timeMs)} · ${pb.coins} syiling · ${pb.secrets} rahsia`:'Rekod peribadi anda: belum ada larian penuh yang layak.';
  $('lb-provider').textContent=CFG.provider==='mock'?'Mod: contoh (tiada sambungan pelayan)':'';
}
export function installLeaderboard(){
  const open=()=>{renderLeaderboard();$('leaderboard').showModal();};
  $('lb-open-complete')?.addEventListener('click',open);
  $('lb-open-settings')?.addEventListener('click',open);
  $('lb-close').addEventListener('click',()=>$('leaderboard').close());
  document.querySelectorAll('[data-lb-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.lbTab;renderLeaderboard();}));
}

// Zone E only: a compact, always-optional readout for the waterworks order/
// result, mirroring the Zone B/C world-aside pattern. Never blocks play —
// the machines themselves remain configurable and the lever remains
// operable with this panel hidden or ignored.
import { WATERWORKS_STATE as WS } from './waterworks.js';
export function syncEControl(s){
 const box=document.getElementById('e-control');
 // BUGFIX: this was x>=4104&&x<5650 (V13's Zone E range) — it overlapped
 // V14's own finish area (4450-4774), so this dead water-puzzle panel
 // ("Belum pilih susunan"/"Periksa mesin F dan G") was rendering right at
 // the goal. V14 has no waterworks content at all (see level.js's header
 // comment), so this is permanently disabled rather than re-ranged to
 // some other V14 zone it was never designed for.
 const inE=false;
 const visible=inE&&['playing','mechanism-transition'].includes(s.mode);
 box.hidden=!visible;
 if(!s.eControlBound){
  s.eControlBound=true;
  document.getElementById('e-help').onclick=()=>{if(s.mode==='playing')s.openWaterHelp();};
  s.events.once('shutdown',()=>{box.hidden=true;});
 }
 if(!visible)return;
 const state=s.waterworksState;
 document.getElementById('e-order').textContent=!s.waterOrder?'Belum pilih susunan':s.waterOrder==='fg'?'Susunan: F → G':'Susunan: G → F';
 document.getElementById('e-status').textContent=
  state===WS.LOCKED?'Periksa mesin F dan G, kemudian pilih susunan':
  state===WS.CONFIGURED?'Input 3 · Sasaran 19':
  state===WS.RUNNING?'Aliran bergerak · tunggu':
  state===WS.NON_TARGET_RESULT?`Output ${s.lastWaterResult?.output??''} · Cuba susunan lain`:
  'Output 19 · Aliran pulih!';
 document.getElementById('e-help').disabled=s.mode!=='playing';
}

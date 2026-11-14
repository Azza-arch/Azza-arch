// V14: repositioned to this slice's own gate (level.js 'lift-gate' at
// x1810-2080, approach/post-gate ground at y1296) — not V13's coordinates.
import {LEGACY_DX} from './level.js';
// Phase 2A: legacy station shifted right by LEGACY_DX with the rest of S03.
export const B_SELECTOR={id:'b-selector',kind:'b-selector',x:1707+LEGACY_DX,feet:1296};
export const nextBInput=value=>Number.isInteger(value)&&value>=0&&value<4?value+1:0;
export function validBInput(value){return Number.isInteger(value)&&value>=0&&value<=4;}
export function sanitizeBTrial(value){return validBInput(value?.input)?{input:value.input,output:2*value.input+1}:null;}
// Parked art travels GATES[0].parkedY(1480) -> GATES[0].y(1296) on solve;
// these intermediate "wrong answer" resting heights are a small arc across
// that same 184px span (closest to 1296 = closest to correct).
export const B_STOPS={1:1480,3:1434,5:1388,7:1296,9:1342};
export function syncBControl(s){
 const box=document.getElementById('b-control');
 const inB=s.player&&s.player.x>=1612+LEGACY_DX&&s.player.x<2296+LEGACY_DX&&s.player.body.bottom>1150;
 const visible=false; // Compact interaction now lives at the terminal only.
 box.hidden=!visible;document.body.classList.toggle('b-control-visible',!!visible);
 if(!s.bControlBound){
  s.bControlBound=true;
  document.getElementById('b-help').onclick=()=>{if(s.mode==='playing')s.openBHelp();};
  s.events.once('shutdown',()=>{box.hidden=true;document.body.classList.remove('b-control-visible');});
 }
 if(!s.bSelectorLabel)return;
 const selected=validBInput(s.bInput)?String(s.bInput):'?';
 s.bSelectorLabel.setText(selected).setVisible(false); // obsolete board label (machine panel owns input)
 if(!visible)return;
 document.getElementById('chill-bubble').hidden=true;
 document.getElementById('b-selected').textContent=`Input ${selected==='?'?'belum dipilih':selected}`;
 const trial=s.bLastTrial;
 document.getElementById('b-result').textContent=trial?`Ujian terakhir: ${trial.input} → kod ${trial.output}`:'Belum diuji · output ialah kod hentian';
 document.getElementById('b-state').textContent=s.liftExperimentBusy?'Pengangkat bergerak · tunggu':s.solvedGates.has('lift')?'Dek selamat · lintas ke seberang':trial?.output===7?'Ujian terhenti · guna tuil semula':trial?'Hentian uji · belum boleh dipijak':'Pilih di papan, kemudian guna tuil';
 document.getElementById('b-help').disabled=s.mode!=='playing';
 // The local screen-safe readout replaces duplicate world labels/notices.
 s.liftReadout.setVisible(false);s.liftState.setVisible(false);
}

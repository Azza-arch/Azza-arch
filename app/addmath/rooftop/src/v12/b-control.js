// Zone B only: one world selector, separate lever, no keyboard sub-mode.
export const B_SELECTOR={id:'b-selector',kind:'b-selector',x:1960,feet:1080};
export const nextBInput=value=>Number.isInteger(value)&&value>=0&&value<4?value+1:0;
export function validBInput(value){return Number.isInteger(value)&&value>=0&&value<=4;}
export function sanitizeBTrial(value){return validBInput(value?.input)?{input:value.input,output:2*value.input+1}:null;}
export const B_STOPS={1:1272,3:1230,5:1188,7:1080,9:1146};
export function syncBControl(s){
 const box=document.getElementById('b-control');
 const inB=s.player&&s.player.x>=1836&&s.player.x<2646&&s.player.body.bottom>1000;
 const visible=inB&&['playing','mechanism-transition'].includes(s.mode);
 box.hidden=!visible;document.body.classList.toggle('b-control-visible',!!visible);
 if(!s.bControlBound){
  s.bControlBound=true;
  document.getElementById('b-help').onclick=()=>{if(s.mode==='playing')s.openBHelp();};
  s.events.once('shutdown',()=>{box.hidden=true;document.body.classList.remove('b-control-visible');});
 }
 if(!s.bSelectorLabel)return;
 const selected=validBInput(s.bInput)?String(s.bInput):'?';
 s.bSelectorLabel.setText(selected).setVisible(!s.solvedGates.has('lift'));
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

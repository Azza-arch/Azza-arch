// Zone G only: one sign (reused for both locks), one lever, one compact
// readout. Never a required panel — mirrors the Zone B/C/E world-aside
// pattern exactly.
export function syncGControl(s){
 const box=document.getElementById('g-control');
 const inG=s.player&&s.player.x>=7250&&s.player.x<7830;
 const visible=inG&&['playing','mechanism-transition'].includes(s.mode);
 box.hidden=!visible;
 if(!s.gControlBound){
  s.gControlBound=true;
  document.getElementById('g-help').onclick=()=>{if(s.mode==='playing')s.openRiverHelp();};
  s.events.once('shutdown',()=>{box.hidden=true;});
 }
 if(!visible)return;
 const stage2=s.solvedGates.has('river-input'),done=s.solvedGates.has('river-crossing');
 document.getElementById('g-lock').textContent=done?'Jambatan terbuka!':`Pengunci ${stage2?2:1}/2`;
 document.getElementById('g-select').textContent=done?'':!stage2
  ?(Number.isInteger(s.riverInputSel)?`Input ${s.riverInputSel}`:'Belum pilih input')
  :(s.riverOrderSel?`Susunan ${s.riverOrderSel==='fg'?'F → G':'G → F'}`:'Belum pilih susunan');
 const trial=!stage2?s.riverLastInputTrial:s.riverLastOrderTrial;
 document.getElementById('g-status').textContent=done?'Lintas ke destinasi'
  :!trial?(stage2?'Susun F dan G, kemudian tekan tuil':'Pilih input, kemudian tekan tuil')
  :!stage2?`Input ${trial.input} → Output ${trial.output}`
  :`Output ${trial.output} · Sasaran 13`;
 document.getElementById('g-help').disabled=s.mode!=='playing';
}

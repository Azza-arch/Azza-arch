// Zone C only: two world-mounted clue signs (passive observations) plus one
// apply sign near the reward. No required panel — the compact readout below
// is informational, never blocking; pressing the signs' E/Guna is the only
// required action, and it never opens a modal.
export const C_PAIR=clue=>({input:clue==='a'?0:1,output:clue==='a'?1:3});
export function syncCControl(s){
 const box=document.getElementById('c-control');
 const inC=s.player&&s.player.x>=1458&&s.player.x<1944&&s.player.body.bottom<=900;
 const visible=inC&&s.mode==='playing';
 box.hidden=!visible;
 if(!s.cControlBound){
  s.cControlBound=true;
  document.getElementById('c-help').onclick=()=>{if(s.mode==='playing')s.openCHelp();};
  s.events.once('shutdown',()=>{box.hidden=true;});
 }
 if(!visible)return;
 const pairs=['a','b'].filter(c=>s.cClues.has(c)).map(c=>{const {input,output}=C_PAIR(c);return `${input}→${output}`;});
 document.getElementById('c-observed').textContent=pairs.length?pairs.join('   '):'Belum ada pemerhatian';
 const done=s.discoveredSecrets.has('bonus-mapping');
 document.getElementById('c-status').textContent=done?'Corak disahkan · ganjaran diambil':s.cClues.size<2?'Perhatikan papan di laluan ini':'Corak nampak? Sahkan di penguji berhampiran ganjaran';
}

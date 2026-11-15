export const DOMAIN=Object.freeze([0,1,2,3,4,5,6]);
export const RANGE=Object.freeze(DOMAIN.map(x=>2*x+3));
export const SEAL_OUTPUTS=Object.freeze([13,7,15]);
export const forward=x=>DOMAIN.includes(x)?2*x+3:null;
export function reverseOutput(y){
 if(!RANGE.includes(y))return {ok:false,output:y,input:null,trace:`${y} bukan dalam imej f`};
 const input=(y-3)/2;
 return {ok:true,output:y,input,trace:`${y} − 3 = ${y-3}; ${y-3} ÷ 2 = ${input}`};
}
export const OPERATIONS=Object.freeze({subtract:{label:'−3',run:x=>x-3},divide:{label:'÷2',run:x=>x/2},add:{label:'+3',run:x=>x+3},multiply:{label:'×2',run:x=>x*2}});
export function newPuzzle(){return {version:2,output:13,seals:{13:false,7:false,15:false},revision:0,last:null,steps:[],actuator:0,demoSeen:false,applied:null};}
export const solved=p=>SEAL_OUTPUTS.every(y=>p?.seals?.[y]===true);
export const stage=p=>!p.seals[13]?'demo':!p.seals[7]?'guided':!p.seals[15]?'independent':'complete';
export const target=p=>SEAL_OUTPUTS.find(y=>!p.seals[y])??15;
export function work(p){let value=p.output;const parts=[String(value)];for(const key of p.steps){value=OPERATIONS[key].run(value);parts.push(`${OPERATIONS[key].label} → ${value}`);}return {value,trace:parts.join(' → ')};}
export function inFinishZone({x,feet,grounded},goal){return grounded&&Math.abs(x-goal.x)<84&&Math.abs(feet-goal.feet)<16;}
// Additive v1 -> v2 migration: keep earned seals, require new interactions only on replay.
export function sanitizePuzzle(raw){
 const state=newPuzzle();
 if(Number.isInteger(raw?.output)&&raw.output>=0&&raw.output<=18)state.output=raw.output;
 for(const y of SEAL_OUTPUTS)state.seals[y]=raw?.seals?.[y]===true;
 state.revision=Number.isSafeInteger(raw?.revision)&&raw.revision>=0?raw.revision:0;
 if(raw?.version===2){
  state.steps=Array.isArray(raw.steps)?raw.steps.filter(k=>Object.hasOwn(OPERATIONS,k)).slice(0,8):[];
  state.actuator=DOMAIN.includes(raw.actuator)?raw.actuator:0;
  state.demoSeen=raw.demoSeen===true;
  if(raw.applied&&DOMAIN.includes(raw.applied.input)&&Number.isInteger(raw.applied.target)&&raw.applied.target>=0&&raw.applied.target<=18)state.applied={input:raw.applied.input,output:forward(raw.applied.input),target:raw.applied.target};
 }
 state.demoSeen ||= state.seals[13];
 return state;
}
export function puzzleCommand(state,action,value){
 const next={...state,seals:{...state.seals},steps:[...state.steps],revision:state.revision+1,last:null};
 const feedback=trace=>{next.last={trace};return next;};
 if(action==='select'||action==='up'||action==='down'){
  const y=action==='select'?value:Math.max(0,Math.min(18,state.output+(action==='up'?1:-1)));
  if(!Number.isInteger(y)||y<0||y>18)return feedback('Pilih output bulat antara 0 dan 18.');
  next.output=y;next.steps=[];return feedback(`${y} dipilih. ${RANGE.includes(y)?'Jejak operasi untuk memulangkan input.':'Di luar imej {3,5,7,9,11,13,15}; tiada input dalam domain.'}`);
 }
 if(action==='actuator'){if(DOMAIN.includes(value))next.actuator=value;return next;}
 if(action==='undo'){next.steps.pop();return next;}
 if(action==='reset'){next.steps=[];return next;}
 if(action==='reverse'||action==='demo'){
  if(stage(state)!=='demo'||state.output!==13)return feedback('Demonstrasi menggunakan output 13. Selepas itu gunakan tuas operasi sendiri.');
  next.steps=['subtract','divide'];next.demoSeen=true;next.actuator=5;
  return feedback('13 − 3 = 10; 10 ÷ 2 = 5. Salurkan input 5: f(5)=13 mengangkat dek ke tanda sasaran.');
 }
 if(Object.hasOwn(OPERATIONS,action)){
  if(!RANGE.includes(state.output))return feedback(`${state.output} bukan dalam imej f. Pilih output sah sebelum mengundur operasi.`);
  if(next.steps.length===8)return feedback('Lapan langkah telah dicuba. Undur atau mula semula untuk membandingkan laluan.');
  next.steps.push(action);const result=work(next);
  return feedback(`${result.trace}. ${DOMAIN.includes(result.value)?'Nilai dalam domain; semak dengan f(x).':'Belum input dalam domain {0…6}. Undur atau teruskan operasi.'}`);
 }
 if(action==='apply'){
  const result=work(state),input=['independent','complete'].includes(stage(state))?state.actuator:result.value;
  if(!RANGE.includes(state.output))return feedback(`${state.output} bukan dalam imej f; dek tidak bergerak.`);
  if(!DOMAIN.includes(input))return feedback(`Nilai ${input} di luar domain {0…6}. Dek kekal selamat; undur operasi.`);
  next.applied={input,output:forward(input),target:state.output};
  const recovered=state.steps.length>0&&result.value===input&&forward(input)===state.output;
  const expected=target(state);
  if(recovered&&state.output===expected&&(stage(state)!=='demo'||state.demoSeen)){
   next.seals[state.output]=true;
   return feedback(`Input ${input} → f(${input})=${forward(input)}. Dek sejajar dengan tanda ${state.output}; pengunci kekal. ${solved(next)?'Lintasan selamat.':`Sasaran seterusnya ${target(next)}.`}`);
  }
  return feedback(`Input ${input} → f(${input})=${forward(input)}; tanda ${state.output}. ${!recovered?'Dek belum sepadan dengan jejak songsang. Undur operasi atau laras input pemacu.':`Eksperimen sah. Pengunci semasa memerlukan output ${expected}.`} Tiada kemajuan hilang.`);
 }
 throw new RangeError('Unknown inverse command');
}

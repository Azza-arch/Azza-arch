// Level 1-2 (World 1 V3) · workshop model — pure (no DOM), used by the scene,
// the campaign store and tests. See workshop-line.js for the story.
export const STOCK=5, NEED=8;
export const MACHINES=Object.freeze({
 A:{id:'A',name:'Mesin Gandaan',short:'Gandaan',rule:'f(x) = 2x',fn:x=>2*x,min:1},
 B:{id:'B',name:'Mesin Kawalan Kualiti',short:'Kawalan kualiti',rule:'g(x) = x − 2',fn:x=>x-2,min:2},
});
export const ORDERS=['AB','BA'];
// One production run through both machines in the given order.
export function runLine(order,input=STOCK){
 if(!ORDERS.includes(order))throw new RangeError('order');
 const [m1,m2]=[MACHINES[order[0]],MACHINES[order[1]]];
 if(input<m1.min)return {order,input,ok:false,stoppedAt:m1.id};
 const mid=m1.fn(input);
 if(mid<m2.min)return {order,input,mid,ok:false,stoppedAt:m2.id};
 const out=m2.fn(mid);
 // A first means f is applied first: g(f(x)) = gf(x).
 const outer=order==='AB'?'g':'f',inner=order==='AB'?'f':'g';
 return {order,input,mid,out,ok:true,enough:out>=NEED,inner,outer,
  notation:`${outer}${inner}(${input}) = ${outer}(${inner}(${input})) = ${outer}(${mid}) = ${out}`};
}
export function newWorkshop(){return {order:'BA',runs:0,lastOut:null,delivered:false,swaps:0};}
export function sanitizeWorkshop(raw,legacyDone=false){
 const w=newWorkshop();
 if(raw&&typeof raw==='object'){
  if(ORDERS.includes(raw.order))w.order=raw.order;
  w.runs=Number.isSafeInteger(raw.runs)&&raw.runs>=0?Math.min(raw.runs,999):0;
  w.swaps=Number.isSafeInteger(raw.swaps)&&raw.swaps>=0?Math.min(raw.swaps,999):0;
  w.lastOut=[6,8].includes(raw.lastOut)?raw.lastOut:null;
  // Delivered only if the saved order really produces enough.
  w.delivered=raw.delivered===true&&runLine(w.order).enough;
 }
 if(legacyDone)Object.assign(w,{order:'AB',delivered:true,lastOut:8,runs:Math.max(w.runs,1)});
 return w;
}
export const workshopStep=w=>!w?'none':w.delivered?'done':w.runs===0?'run':w.order==='BA'?'swap':'run';


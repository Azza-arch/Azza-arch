// Level 1-2 (World 1 V3) · workshop model — pure (no DOM), used by the scene,
// the campaign store and tests. See workshop-line.js for the story.
// Day 03: machines, input and target come from the puzzle definition
// 'w1.l2.workshop.main'; the run is computed by puzzles/models/composite.js.
// Exports keep their previous names and shapes (saves store order/lastOut).
import {puzzleById} from '../puzzles/index.js';
import * as composite from '../puzzles/models/composite.js';
import {evalRule,ruleText} from '../puzzles/rules.js';

export const DEFINITION=puzzleById('w1.l2.workshop.main');
const P=DEFINITION.parameters;
export const STOCK=P.input, NEED=P.need;
export const MACHINES=Object.freeze(Object.fromEntries(Object.entries(P.machines).map(([id,m])=>[id,Object.freeze({id,name:m.name,short:m.short,rule:`${m.letter}(x) = ${ruleText(m.rule)}`,fn:x=>evalRule(m.rule,x),min:m.min})])));
export const ORDERS=composite.ORDERS;
const OUTPUTS=Object.values(DEFINITION.answer.outputs).filter(Number.isInteger);
// One production run through both machines in the given order.
// A first means f is applied first: g(f(x)) = gf(x).
export function runLine(order,input=STOCK){return composite.runLine(P,order,input);}
export function newWorkshop(){return {order:P.start,runs:0,lastOut:null,delivered:false,swaps:0};}
export function sanitizeWorkshop(raw,legacyDone=false){
 const w=newWorkshop();
 if(raw&&typeof raw==='object'){
  if(ORDERS.includes(raw.order))w.order=raw.order;
  w.runs=Number.isSafeInteger(raw.runs)&&raw.runs>=0?Math.min(raw.runs,999):0;
  w.swaps=Number.isSafeInteger(raw.swaps)&&raw.swaps>=0?Math.min(raw.swaps,999):0;
  w.lastOut=OUTPUTS.includes(raw.lastOut)?raw.lastOut:null;
  // Delivered only if the saved order really produces enough.
  w.delivered=raw.delivered===true&&runLine(w.order).enough;
 }
 if(legacyDone)Object.assign(w,{order:'AB',delivered:true,lastOut:8,runs:Math.max(w.runs,1)});
 return w;
}
export const workshopStep=w=>!w?'none':w.delivered?'done':w.runs===0?'run':w.order==='BA'?'swap':'run';


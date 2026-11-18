// Level 1-2 (World 1 V3) · workshop model — pure (no DOM), used by the scene,
// the campaign store and tests. See workshop-line.js for the story.
// Day 03: machines, input and target come from a puzzle definition; the run
// is computed by puzzles/models/composite.js.
// Day 04: the definition comes from the run's puzzle session
// (workshop.puzzle, see puzzles/session.js). A save without one keeps the
// original puzzle 'w1.l2.workshop.main'. The module-level exports below are
// that original puzzle (kept for old callers/tests); the scene uses lineOf(w).
import * as composite from '../puzzles/models/composite.js';
import {evalRule,ruleText,makeRule} from '../puzzles/rules.js';
import {BASE,baseSession,createSession,restoreSession,definitionFor,newSeed} from '../puzzles/session.js';

const LEVEL='w1-l2';
export const BASE_SESSION=baseSession(LEVEL,BASE[LEVEL]);
// Everything the scene shows, derived from one session (cached per session).
const views=new Map();
export function lineFor(session){
 const key=JSON.stringify(session.params);
 if(views.has(key))return views.get(key);
 const def=definitionFor(LEVEL,session),P=def.parameters;
 const view=Object.freeze({
  definition:def,params:P,STOCK:P.input,NEED:P.need,START:P.start,WORKING:def.answer.working[0],
  OUTPUTS:Object.values(def.answer.outputs).filter(Number.isInteger),
  MACHINES:Object.freeze(Object.fromEntries(Object.entries(P.machines).map(([id,m])=>[id,Object.freeze({id,name:m.name,short:m.short,rule:`${m.letter}(x) = ${ruleText(m.rule)}`,fn:x=>evalRule(m.rule,x),min:m.min})]))),
  runLine:(order,input=P.input)=>composite.runLine(P,order,input),
 });
 if(views.size>32)views.clear();views.set(key,view);return view;
}
export const lineOf=w=>lineFor(w?.puzzle||BASE_SESSION);

const base=lineFor(BASE_SESSION);
export const DEFINITION=base.definition;
export const STOCK=base.STOCK, NEED=base.NEED, MACHINES=base.MACHINES;
export const ORDERS=composite.ORDERS;
// One production run through both machines in the given order (original puzzle).
// A first means f is applied first: g(f(x)) = gf(x).
export function runLine(order,input=STOCK){return base.runLine(order,input);}

// A new workshop. Default: the original puzzle (first visit). A seed gives a
// generated puzzle (replays) — the same seed always gives the same machines.
export function newWorkshop({seed}={}){
 const puzzle=Number.isSafeInteger(seed)?createSession(LEVEL,{seed}):BASE_SESSION;
 return {order:lineFor(puzzle).START,runs:0,lastOut:null,delivered:false,swaps:0,puzzle};
}
export const replayWorkshop=()=>newWorkshop({seed:newSeed()});
export function sanitizeWorkshop(raw,legacyDone=false){
 const puzzle=restoreSession(LEVEL,raw&&typeof raw==='object'?raw.puzzle:null);
 const L=lineFor(puzzle),w={order:L.START,runs:0,lastOut:null,delivered:false,swaps:0,puzzle};
 if(raw&&typeof raw==='object'){
  if(ORDERS.includes(raw.order))w.order=raw.order;
  w.runs=Number.isSafeInteger(raw.runs)&&raw.runs>=0?Math.min(raw.runs,999):0;
  w.swaps=Number.isSafeInteger(raw.swaps)&&raw.swaps>=0?Math.min(raw.swaps,999):0;
  w.lastOut=L.OUTPUTS.includes(raw.lastOut)?raw.lastOut:null;
  // Delivered only if the saved order really produces enough for this puzzle.
  w.delivered=raw.delivered===true&&L.runLine(w.order).enough;
 }
 if(legacyDone)Object.assign(w,{order:L.WORKING,delivered:true,lastOut:L.runLine(L.WORKING).out,runs:Math.max(w.runs,1)});
 return w;
}
export const workshopStep=w=>!w?'none':w.delivered?'done':w.runs===0?'run':w.order!==lineOf(w).WORKING?'swap':'run';
// Texts that quote the machines (secret note, victory line), from the session.
export function canopyNote(w){
 const P=lineOf(w).params,f=P.machines.A.rule,g=P.machines.B.rule;
 const gf=makeRule(g.a*f.a,g.a*f.b+g.b),fg=makeRule(f.a*g.a,f.a*g.b+f.b),diff=Math.abs(gf.b-fg.b);
 return `Dengan f(x) = ${ruleText(f)} dan g(x) = ${ruleText(g)}: gf(x) = ${ruleText(gf)} tetapi fg(x) = ${ruleText(fg)}. Untuk setiap x, bezanya sentiasa ${diff}.`;
}
export function victoryLine(w){const L=lineOf(w),ab=L.runLine('AB'),ba=L.runLine('BA');return `Susunan fungsi boleh mengubah hasil: gf(${L.STOCK}) = ${ab.out}, fg(${L.STOCK}) = ${ba.out}.`;}

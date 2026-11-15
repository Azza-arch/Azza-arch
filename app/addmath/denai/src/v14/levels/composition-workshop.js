// Routing layer: the original composition reducer remains the arithmetic authority.
import {command,TARGETS} from './composition.js';
export function workshopCommand(state,action,station){
 if(action==='route-fg'||action==='route-gf')return {...state,route:action.slice(6),revision:state.revision+1};
 const next=command(state,action,station);
 next.history={...state.history};next.drives={...state.drives};
 if(action==='input'||action==='order')next.route=null;
 if(action==='send'){
  next.history[`${next.last.input}:${next.last.order}`]=next.last;
  // A number must be deliberately sent to a receiver. Changing order does not reroute it.
  next.receivers={...state.receivers};
  if(state.route){
   next.drives[state.route]=next.last;
   if(next.last.output===TARGETS[station][state.route]&&state.route===next.last.order)next.receivers[state.route]=true;
  }
 }
 return next;
}
export function driveFraction(state,station,route){
 if(state.receivers[route])return 1;
 const output=state.drives?.[route]?.output??0;
 return Math.max(0,Math.min(1,output/TARGETS[station][route]));
}

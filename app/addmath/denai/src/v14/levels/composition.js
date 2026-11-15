// Pure commands: no Phaser, DOM, persistence or service dependency.
export const FUNCTIONS=Object.freeze({f:x=>2*x+1,g:x=>x*x});
export const TARGETS=Object.freeze({twins:{fg:9,gf:25},final:{fg:19,gf:49}});
export function compose(input,order) {
  if(!Number.isInteger(input)||input<0||input>4||!['fg','gf'].includes(order))throw new RangeError('Invalid composition');
  const [outer,inner]=order;
  const middle=FUNCTIONS[inner](input),output=FUNCTIONS[outer](middle);
  return {input,order,inner,outer,middle,output,notation:`${outer}(${inner}(${input}))`,trace:`${input} → ${inner} → ${middle} → ${outer} → ${output}`};
}
export function initialPuzzle() {return {input:2,order:'fg',revision:0,receivers:{fg:false,gf:false},last:null,route:null,history:{},drives:{}};}
export function command(state,action,station) {
  if(!TARGETS[station])throw new RangeError('Unknown station');
  const next={...state,receivers:{...state.receivers},revision:state.revision+1};
  if(action==='input')next.input=(state.input+1)%5;
  else if(action==='order')next.order=state.order==='fg'?'gf':'fg';
  else if(action==='send') {
    next.last=compose(state.input,state.order);
    if(next.last.output===TARGETS[station][state.order])next.receivers[state.order]=true;
  } else throw new RangeError('Unknown command');
  return next;
}
export const solved=state=>!!state.receivers.fg&&!!state.receivers.gf;
export function inFinishZone({x,feet,grounded},goal){return grounded&&Math.abs(x-goal.x)<84&&Math.abs(feet-goal.feet)<16;}
export function restorePuzzle(raw,station) {
  const state=initialPuzzle();
  if(raw&&Number.isInteger(raw.input)&&raw.input>=0&&raw.input<=4)state.input=raw.input;
  if(raw?.order==='gf')state.order='gf';
  state.revision=Number.isSafeInteger(raw?.revision)&&raw.revision>=0?raw.revision:0;
  for(const order of ['fg','gf'])state.receivers[order]=raw?.receivers?.[order]===true;
  if(raw?.last){try{state.last=compose(raw.last.input,raw.last.order);}catch{}}
  // Optional workshop fields migrate old saves without changing receiver latches.
  if(['fg','gf'].includes(raw?.route))state.route=raw.route;
  for(let x=0;x<=4;x++)for(const order of ['fg','gf']){
    const key=`${x}:${order}`,trace=raw?.history?.[key];
    if(trace?.input===x&&trace.order===order)state.history[key]=compose(x,order);
  }
  if(state.last&&!state.history[`${state.last.input}:${state.last.order}`])state.history[`${state.last.input}:${state.last.order}`]=state.last;
  for(const route of ['fg','gf']){const trace=raw?.drives?.[route];if(trace){try{state.drives[route]=compose(trace.input,trace.order);}catch{}}}
  return state;
}

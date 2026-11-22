// Text-only reactions. No timers, physics changes, asset loads or answer hints.
// V14: new level architecture (see level.js's header comment) — a start
// plateau with an optional tower detour (Zone A), the relocated lift
// puzzle (Zone B), and a stepping-stone gauntlet to the slice's own finish
// (Zone C). No water/river/number/C-clue content exists in this build.
// PHASE 5 trim: dropped the zone-entry/found/activated chatter V13's
// pattern carried over (seven lines firing automatically on proximity —
// "Baiklah, mari kita mula teroka...", "Plet dah ditekan...", etc., the
// exact over-explaining this was flagged for). World-state changes (the
// crate's plate, the bridge rising) are already visible without a line
// telling the player it happened. Kept only the two lines that carry
// information the world doesn't otherwise show: a wrong-answer nudge and
// the end-of-level line.
export const MISSION='Cari pengangkat dan uji fungsinya.';
export const LINES={
 'failed:lift':'Belum sampai ke lintasan. Cuba input lain.',
 'destination':'Slice prototaip ini selesai!'
};
export function sanitizeDialogue(raw){
 const valid=xs=>Array.isArray(xs)?[...new Set(xs.filter(id=>Object.hasOwn(LINES,id)))]:[];
 const seen=valid(raw?.seen);
 return {seen,pending:valid(raw?.pending).filter(id=>!seen.includes(id))};
}
export class DialogueQueue{
 constructor(saved){const data=sanitizeDialogue(saved);this.seen=new Set(data.seen);this.pending=data.pending;this.active=null;this.remaining=0;this.cooldown=0;}
 enqueue(id){if(!Object.hasOwn(LINES,id)||this.seen.has(id)||this.pending.includes(id))return false;this.pending.push(id);return true;}
 dismiss(){this.active=null;this.remaining=0;this.cooldown=1600;}
 retireStale(zone,solved){
  const origins={};
  const resolved={lift:'lift'};
  const stale=id=>{const [kind,key]=id.split(':');const origin=kind==='zone'?key:origins[key];return (origin&&origin!==zone)||(kind==='failed'&&solved.has(resolved[key]));};
  let changed=false;
  this.pending=this.pending.filter(id=>{if(!stale(id))return true;this.seen.add(id);changed=true;return false;});
  if(this.active&&stale(this.active)){this.dismiss();changed=true;}
  return changed;
 }
 tick(delta,available){
  if(!available)return false;
  const dt=Math.max(0,Math.min(delta,100));
  if(this.active){this.remaining-=dt;if(this.remaining<=0)this.dismiss();return false;}
  this.cooldown=Math.max(0,this.cooldown-dt);
  if(this.cooldown||!this.pending.length)return false;
  this.active=this.pending.shift();this.seen.add(this.active);this.remaining=5600;return true;
 }
 snapshot(){return {seen:[...this.seen],pending:[...this.pending]};}
}
export function missionObjective(scene){
 if(scene.levelCompleted)return 'Slice prototaip selesai.';
 if(!scene.solvedGates.has('lift'))return 'Cari pengangkat dan uji fungsinya.';
 return 'Lintasi laluan batu loncatan ke destinasi slice.';
}

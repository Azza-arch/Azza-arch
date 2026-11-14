// Run eligibility + formatting for records. Personal bests now live in the
// permanent player profile (progress.js); this module no longer keeps its
// own storage, so there is one source of truth for lifetime progress.
import {LEADERBOARD_CONFIG as CFG} from './config.js';
import {loadProfile,LEVEL_KEY} from '../progress.js';
// A run is eligible for ranking only if it is a complete, uninterrupted
// first-to-last run (started fresh, not resumed, not an exploration replay).
export function evaluateRun(run){
  const reasons=[];
  if(!run.completed)reasons.push('Level belum selesai.');
  if(!run.requiredGates?.every(g=>run.solvedGates?.includes(g)))reasons.push('Mesin fungsi belum diselesaikan.');
  if(run.source!=='fresh')reasons.push('Larian disambung daripada simpanan (masa tidak berterusan).');
  if(!(run.timeMs>=CFG.rules.minPlausibleMs))reasons.push('Masa terlalu singkat untuk disahkan.');
  if(run.timeMs>CFG.rules.maxRunMs)reasons.push('Masa melebihi had larian.');
  return {eligible:reasons.length===0,reasons};
}
export function compareRuns(a,b){return a.timeMs-b.timeMs||b.coins-a.coins||b.secrets-a.secrets;}
export function formatTime(ms){const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
export function personalBest(){return loadProfile().levels[LEVEL_KEY].best;}

(function () {
  var KEY = 'tenseTales.learner.v1';
  var LEVELS = ['guided', 'standard', 'challenge'];
  function defaults(){return{assistance:'guided',firstTryRun:0,difficultRun:0,helpBm:false,lastActivity:null};}
  function normalize(value){var d=defaults();if(!value||typeof value!=='object')return d;d.assistance=LEVELS.indexOf(value.assistance)>=0?value.assistance:'guided';d.firstTryRun=Math.max(0,Math.floor(Number(value.firstTryRun)||0));d.difficultRun=Math.max(0,Math.floor(Number(value.difficultRun)||0));d.helpBm=value.helpBm===true;if(value.lastActivity&&typeof value.lastActivity==='object')d.lastActivity={tense:value.lastActivity.tense,mode:value.lastActivity.mode,level:Math.max(1,Math.min(5,Number(value.lastActivity.level)||1))};return d;}
  function load(storage){try{return normalize(JSON.parse((storage||localStorage).getItem(KEY)||'null'));}catch(e){return defaults();}}
  function save(value,storage){var clean=normalize(value);try{(storage||localStorage).setItem(KEY,JSON.stringify(clean));}catch(e){}return clean;}
  function record(outcome,storage){var p=load(storage),first=outcome&&outcome.firstTry===true,difficult=Number(outcome&&outcome.errors)>=2;p.firstTryRun=first?p.firstTryRun+1:0;p.difficultRun=difficult?p.difficultRun+1:0;if(outcome&&outcome.activity)p.lastActivity={tense:outcome.activity.tense,mode:outcome.activity.mode,level:outcome.activity.level};if(p.difficultRun>=2){p.assistance='guided';p.difficultRun=0;p.firstTryRun=0;}else if(p.firstTryRun>=3){p.assistance=p.assistance==='guided'?'standard':'challenge';p.firstTryRun=0;}return save(p,storage);}
  function recommendation(profile){var p=normalize(profile),a=p.lastActivity;if(!a)return{tense:'presentSimple',mode:'storyOrder',level:1};return{tense:a.tense==='pastSimple'?'pastSimple':'presentSimple',mode:a.mode==='wordOrder'?'wordOrder':'storyOrder',level:a.level>=5?1:a.level+1};}
  var api={KEY:KEY,LEVELS:LEVELS,defaults:defaults,normalize:normalize,load:load,save:save,record:record,recommendation:recommendation};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.TenseTales.gameplay.learnerProfile=api;
})();

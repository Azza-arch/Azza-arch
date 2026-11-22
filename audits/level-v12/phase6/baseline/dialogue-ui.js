import {LINES,MISSION,missionObjective} from './dialogue.js';
import {ZONES,SURFACES} from './level.js';
const $=id=>document.getElementById(id);
const intersects=(a,b)=>a.left<b.right+8&&a.right>b.left-8&&a.top<b.bottom+8&&a.bottom>b.top-8;
const rect=(x,y,w,h)=>({left:x,top:y,right:x+w,bottom:y+h});
function placeBubble(scene){
 const bubble=$('chill-bubble'),canvas=scene.game.canvas.getBoundingClientRect(),cam=scene.cameras.main;
 const sx=canvas.width/scene.scale.width,sy=canvas.height/scene.scale.height;
 const x=canvas.left+(scene.player.x-cam.worldView.x)*cam.zoom*sx;
 const y=canvas.top+(scene.player.body.top-cam.worldView.y)*cam.zoom*sy;
 const player=rect(x-25*sx,y-30*sy,50*sx,100*sy);
 const obstacles=[player,...[...document.querySelectorAll('.masthead,#mission-indicator,#touch-controls button:not([hidden]),#tutorial.show,#notice.show,#zone-toast.show')]
  .filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden').map(n=>n.getBoundingClientRect())];
 const surfaces=[...SURFACES];
 if(scene.fMovingPlatform)surfaces.push({x:scene.fMovingPlatform.x,y:scene.fMovingPlatform.config.y,width:scene.fMovingPlatform.config.width});
 for(const p of surfaces)obstacles.push(rect(canvas.left+(p.x-cam.worldView.x)*cam.zoom*sx,canvas.top+(p.y-cam.worldView.y)*cam.zoom*sy-8,p.width*cam.zoom*sx,24));
 if(scene.prompt?.visible){const p=scene.prompt.getBounds();obstacles.push(rect(canvas.left+(p.x-cam.worldView.x)*cam.zoom*sx,canvas.top+(p.y-cam.worldView.y)*cam.zoom*sy,p.width*cam.zoom*sx,p.height*cam.zoom*sy));}
 bubble.hidden=false;bubble.style.visibility='hidden';
 const w=bubble.offsetWidth,h=bubble.offsetHeight;
 const clampX=v=>Math.max(canvas.left+12,Math.min(v,canvas.right-w-12));
 const candidates=[[x-w/2,player.top-h-14],[player.right+16,player.top],[player.left-w-16,player.top],[(canvas.left+canvas.right-w)/2,120],[(canvas.left+canvas.right-w)/2,canvas.bottom-h-110]];
 for(const [cx,cy] of candidates){
  const r=rect(clampX(cx),cy,w,h);
  if(r.top<canvas.top+12||r.bottom>canvas.bottom-12||obstacles.some(o=>intersects(r,o)))continue;
  bubble.style.left=`${r.left}px`;bubble.style.top=`${r.top}px`;bubble.style.visibility='visible';return true;
 }
 bubble.hidden=true;return false;
}
export function refreshMission(scene){
 $('mission-current').textContent=missionObjective(scene);
 $('mission-summary').textContent=MISSION;
 $('mission-history').replaceChildren(...[...scene.dialogue.seen].map(id=>{const li=document.createElement('li');li.textContent=LINES[id];return li;}));
}
export function syncDialogue(scene,delta){
 const queue=scene.dialogue,bubble=$('chill-bubble');
 if(!scene.dialogueBound){
  scene.dialogueBound=true;
  $('dialogue-dismiss').onclick=()=>{queue.dismiss();bubble.hidden=true;$('game').focus({preventScroll:true});};
  $('mission-indicator').onclick=()=>{scene.pauseRun();refreshMission(scene);$('mission-notes').open=true;};
  scene.events.once('shutdown',()=>{bubble.hidden=true;$('mission-indicator').hidden=true;});
 }
 const playing=scene.mode==='playing'&&!document.hidden;
 $('mission-indicator').hidden=!playing;
 const objective=missionObjective(scene);if($('mission-indicator').textContent!==objective)$('mission-indicator').textContent=objective;
 if(!playing){bubble.hidden=true;return;}
 const zone=ZONES[scene.currentZoneIndex()].name[0];scene.say(`zone:${zone}`);
 const terminal=scene.nearestTerminal();
 if(terminal){let kind=terminal.kind;if(kind==='number-input')kind='number';if(kind.startsWith('water-'))kind='water';scene.say(`found:${kind}`);}
 if(Math.abs(scene.player.x-810)<150&&scene.player.body.bottom>1100)scene.say('found:crate');
 if(scene.crateSwitchActive)scene.say('activated:crate');
 // Reserve a measured bubble rectangle before starting its readable lifetime.
 const id=queue.active||queue.pending[0];
 if(!id){bubble.hidden=true;queue.tick(delta,true);return;}
 if($('dialogue-line').textContent!==LINES[id])$('dialogue-line').textContent=LINES[id];
 const safe=placeBubble(scene);
 if(queue.tick(delta,safe))scene.writeSave();
 bubble.hidden=!safe||!queue.active;
}

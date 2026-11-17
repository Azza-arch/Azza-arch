// Level 1-3 (World 1 V3) · "Pulihkan Pintu Air Lama" — scene side.
// Story: the old sluice no longer holds the river; the channel below the
// machine yard is flooded and its stepping stones are under water. A torn
// maintenance note gives the calibration (bacaan = 2 × tetapan + 3), the meter
// on the pipe still carries its original mark (13). The player turns the
// valve wheel, opens the flow and reads the needle; only the original setting
// lifts the gate fully, the water drops and the stones emerge.
// Optional: the cave valve on the arch walk (broken meter, needs 15). Its
// setting is chosen by standing on numbered plates, then pulling a lever.
// The rule f(x) = 2x + 3 appears only on the note / summary (blueprint B5).
import {burst} from '../feel.js';
import {say,placeBubble} from '../core/speech-bubble.js';
import {decorateJournal,syncJournal,dialogue} from '../ui/v4-ui.js';
import {TARGET,CAVE_TARGET,reading,inverseSteps,turnValve,testFlow,readNote,stepPlate,pullCave,sluiceStep} from './sluice-model.js';
import {SLUICE,CAVE,CHANNEL,STONES,WATER_Y} from './inverse-world.js';
export {newSluice,sanitizeSluice} from './sluice-model.js';
const $=id=>document.getElementById(id);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ATLAS='kpp_terrain_atlas';
const DIAL={x:SLUICE.meterX,y:1494,r:30};
const angleFor=r=>-120+(Math.max(3,Math.min(15,r))-3)*20; // 3…15 → −120°…+120°

// Pixel digits from the Kenney atlas (170–179), centred on x.
function digits(s,group,value,x,y,scale=2,depth=16){
 group.forEach(d=>d.destroy());group.length=0;if(value===null||value===undefined)return group;
 const str=String(value),w=18*scale-4;
 [...str].forEach((ch,i)=>group.push(s.add.image(x+(i-(str.length-1)/2)*w,y,ATLAS,170+Number(ch)).setScale(scale).setDepth(depth)));
 return group;
}

export function buildSluice(s){
 const tile=s.tile,state=s.run.sluice;
 const v=s.sluice={busy:false,setDigits:[],readDigits:[],caveDigits:[],stoneBodies:[],plates:[]};
 // Torn maintenance note on a sign post.
 v.note=tile(86,SLUICE.noteX-27,SLUICE.feet-54,11);
 s.add.image(SLUICE.noteX+6,SLUICE.feet-38,ATLAS,130).setScale(1).setDepth(11.2).setAlpha(.9);
 // Valve wheel: the round pipe junction (four quarters) as a hand wheel with a
 // spoke, mounted on the service post; one notch = 60°.
 const wheel=s.add.container(SLUICE.wheelX,1518).setDepth(12);
 [[93,-18,-18],[94,18,-18],[113,-18,18],[114,18,18]].forEach(([f,x,y])=>wheel.add(s.add.image(x,y,ATLAS,f).setScale(2)));
 // Spokes + hub make it read as a hand wheel and show each 60° notch.
 wheel.add([s.add.rectangle(0,0,58,7,0x394238),s.add.rectangle(0,0,7,58,0x394238),s.add.rectangle(0,-25,9,9,0xd8a35a).setStrokeStyle(2,0x394238),s.add.circle(0,0,8,0xd8a35a).setStrokeStyle(2,0x394238)]);
 v.wheel=wheel.setAngle(state.setting*60);
 const plate=s.add.rectangle(SLUICE.wheelX+56,1500,40,30,0x394238).setDepth(11.5).setStrokeStyle(2,0xf9f2d8);
 v.setLabel=s.add.text(SLUICE.wheelX+56,1478,'TETAPAN',{fontFamily:'Arial',fontSize:'9px',fontStyle:'bold',color:'#f9f2d8'}).setOrigin(.5,1).setDepth(11.6);
 v.showSetting=()=>digits(s,v.setDigits,s.run.sluice.setting,SLUICE.wheelX+56,1500,1.4,12);
 v.showSetting();plate.setData('noCull',true);
 // Meter on the pipe: dial, ticks 3…15, original mark 13, needle.
 const g=s.add.graphics().setDepth(11.8);
 g.fillStyle(0x394238,1).fillCircle(DIAL.x,DIAL.y,DIAL.r+4);g.fillStyle(0xf9f2d8,1).fillCircle(DIAL.x,DIAL.y,DIAL.r);
 for(let r=3;r<=15;r+=2){const a=Phaser.Math.DegToRad(angleFor(r)-90),k=r===TARGET?1:0;g.lineStyle(k?4:2,k?0xc0392b:0x394238,1).lineBetween(DIAL.x+Math.cos(a)*(DIAL.r-9),DIAL.y+Math.sin(a)*(DIAL.r-9),DIAL.x+Math.cos(a)*(DIAL.r-2),DIAL.y+Math.sin(a)*(DIAL.r-2));}
 g.lineStyle(2,0x394238,1).lineBetween(DIAL.x,DIAL.y-DIAL.r-4,DIAL.x,1458); // hangs from the pipe
 v.dial=g;
 v.needle=s.add.container(DIAL.x,DIAL.y,[s.add.rectangle(0,0,4,DIAL.r-6,0x8a2b2b).setOrigin(.5,1),s.add.circle(0,0,4,0x394238)]).setDepth(12).setAngle(state.open?angleFor(TARGET):-130);
 v.mark=s.add.text(DIAL.x,DIAL.y+DIAL.r+6,'TANDA ASAL 13',{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#fff1cf',stroke:'#394238',strokeThickness:3}).setOrigin(.5,0).setDepth(12);
 if(state.open)digits(s,v.readDigits,TARGET,DIAL.x,DIAL.y+DIAL.r+34,1.3,12);
 // Flow lever.
 v.lever=tile(state.open?66:64,SLUICE.leverX-27,SLUICE.feet-54,12);
 s.add.text(SLUICE.leverX,SLUICE.feet-60,'Tuas aliran',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#fff1cf',stroke:'#394238',strokeThickness:3}).setOrigin(.5,1).setDepth(12);
 // Sluice gate in the flooded channel: stone lintel on chains, crate panel.
 const gx=SLUICE.gateX,gw=SLUICE.gateWidth;
 for(let x=gx;x<gx+gw;x+=54)s.add.image(x,1458,x===gx?'l3-stone-left':'l3-stone-right').setOrigin(0).setDisplaySize(54,54).setDepth(5.75); // lintel hides the raised panel
 s.add.text(gx+gw/2,1452,'PINTU AIR',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#fff1cf',stroke:'#394238',strokeThickness:3}).setOrigin(.5,1).setDepth(12);
 v.chains=[gx+14,gx+gw-14].map(x=>s.add.rectangle(x,1512,4,108,0x5c4a3a).setOrigin(.5,0).setDepth(5.5));
 v.gate=s.add.container(0,0).setDepth(5.7);
 for(let x=gx;x<gx+gw;x+=54)for(let y=1620;y<1728;y+=54)v.gate.add(tile(29,x,y,5.7).setData('noCull',true));
 // Stepping stones: under the water line until the sluice works.
 v.stones=STONES.map(st=>s.add.image(st.x,st.y,'l3-stone-center').setOrigin(0).setDisplaySize(54,54).setDepth(5.8).setTint(0xcfc6b4));
 // Cave valve on the arch walk: sign with broken meter, 7 plates, lever, chest.
 const c=state.cave;
 s.add.text(CAVE.plateX+189,CAVE.feet-112,'INJAP GUA · meter rosak\nperlu bacaan 15',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#203e36',backgroundColor:'#f9f2d8',padding:{x:6,y:3},align:'center'}).setOrigin(.5,1).setDepth(12);
 const cg=s.add.graphics().setDepth(11.8),cx=CAVE.leverX,cy=CAVE.feet-92;
 cg.fillStyle(0x394238,1).fillCircle(cx,cy,18);cg.fillStyle(0xd9d2bf,1).fillCircle(cx,cy,15);cg.lineStyle(2,0x394238,1).lineBetween(cx-10,cy-9,cx+2,cy+1).lineBetween(cx+2,cy+1,cx-3,cy+11).lineBetween(cx+2,cy+1,cx+11,cy-4); // cracked glass
 for(let k=0;k<7;k++){
  const x=CAVE.plateX+k*54;
  const art=tile(c.setting===k||c.solved&&k===6?149:148,x,CAVE.feet-54,11);
  const num=s.add.image(x+27,CAVE.feet-70,ATLAS,170+k).setScale(1.3).setDepth(11);
  v.plates.push({k,art,num});
 }
 v.caveLever=tile(c.solved?66:64,CAVE.leverX-27,CAVE.feet-54,12);
 v.chest=tile(c.solved?11:28,CAVE.chestX-27,CAVE.feet-54,11);
 // Water: the channel's surface row and the row under it (hidden when drained).
 v.water=s.channelWater;v.waterY=WATER_Y;
 if(state.open)openSluice(s,false);
 return v;
}

function openSluice(s,animate){
 const v=s.sluice,d=SLUICE.waterDrop,ms=animate&&!reduced()?1200:1;
 v.waterY=WATER_Y+d;
 // The panel rises up behind the stone lintel: the channel is clearly open.
 s.tweens.add({targets:v.gate.list,y:`-=${d*3}`,duration:animate?ms*.8:1,ease:'Sine.inOut'});
 v.chains.forEach(c=>s.tweens.add({targets:c,scaleY:.05,duration:animate?ms*.8:1}));
 // The spillway now falls one row further, into the lower pool.
 if(!v.extraFall)v.extraFall=s.tile(73,3240,1674,6);
 s.tweens.add({targets:v.water.surface,y:`+=${d}`,duration:ms,ease:'Sine.inOut'});
 v.water.firstRow.forEach(t=>s.tweens.add({targets:t,alpha:0,duration:ms}));
 v.stones.forEach(st=>st.setDepth(6.2));
 if(!v.stoneBodies.length)v.stoneBodies=STONES.map(st=>s.platform(st));
 v.lever.setFrame(66);
}

// Prompt for the nearest interactable in range (or null). Called each frame.
export function sluicePrompt(s,grounded,touch){
 const v=s.sluice,st=s.run.sluice;s.sluiceReady=null;if(!v)return null;
 const px=s.player.x,feet=s.player.body.bottom,key=touch?'Guna':'E';
 placeBubble(s);
 if(!s.sluiceIntro&&px>2560&&px<3240&&Math.abs(feet-SLUICE.feet)<10&&!st.open){s.sluiceIntro=true;renderTracker(s);dialogue(s,['Air di saluran terlalu tinggi.','Batu loncatan tenggelam — pintu air lama rosak.']);}
 // Cave plates: standing still on one for a moment presses it (walking past
 // at running speed does not), which sets the cave valve.
 const k=Math.floor((px-CAVE.plateX)/54),onPlate=grounded&&Math.abs(feet-CAVE.feet)<6&&k>=0&&k<7&&!st.cave.solved&&!v.busy;
 if(onPlate&&Math.abs(s.player.body.velocity.x)<25){
  if(s.plateDwell?.k!==k)s.plateDwell={k,since:s.time.now};
  const held=s.time.now-s.plateDwell.since,p=v.plates[k];
  if(st.cave.setting!==k){p.art.y=CAVE.feet-54+Math.min(1,held/450)*5;if(held>=450){p.art.y=CAVE.feet-54;setPlate(s,k);}}
 }else if(s.plateDwell){const p=v.plates[s.plateDwell.k];if(p&&st.cave.setting!==p.k)p.art.y=CAVE.feet-54;s.plateDwell=null;}
 if(!s.caveIntro&&grounded&&Math.abs(feet-CAVE.feet)<6&&px>CAVE.plateX&&px<CAVE.leverX&&!st.cave.solved){s.caveIntro=true;say(s,'Berdiri diam atas plat untuk set injap gua.',3600);}
 if(!grounded||v.busy)return null;
 const near=[];
 if(Math.abs(feet-SLUICE.feet)<8){
  near.push({id:'note',x:SLUICE.noteX,r:40,text:'Baca catatan penyelenggaraan'});
  if(!st.open){near.push({id:'wheel',x:SLUICE.wheelX,r:44,text:`Pusing injap (kini ${st.setting})`});near.push({id:'flow',x:SLUICE.leverX,r:40,text:'Tarik tuas aliran'});}
 }
 if(Math.abs(feet-CAVE.feet)<8){
  if(!st.cave.solved)near.push({id:'cave',x:CAVE.leverX,r:34,text:'Tarik tuas injap gua'});
 }
 const best=near.filter(n=>Math.abs(px-n.x)<n.r).sort((a,b)=>Math.abs(px-a.x)-Math.abs(px-b.x))[0];
 if(!best)return null;
 s.sluiceReady=best.id;return {key,text:best.text};
}
export function useSluice(s,{audio,SFX}={}){
 const id=s.sluiceReady;if(!id)return;
 if(id==='note')return note(s);
 if(id==='wheel')return wheel(s,{audio,SFX});
 if(id==='flow')return flow(s,{audio,SFX});
 if(id==='cave')return cave(s,{audio,SFX});
}
function note(s){
 s.run.sluice=readNote(s.run.sluice);s.writeSave();renderTracker(s);
 dialogue(s,['Catatan penyelenggaraan (koyak):\n«Kalibrasi injap: bacaan = 2 × tetapan + 3. Bacaan asal …»','Selebihnya koyak.'],{portrait:'none'}); // V4: the note speaks
}
function wheel(s,{audio,SFX}){
 const v=s.sluice;s.run.sluice=turnValve(s.run.sluice);const x=s.run.sluice.setting;
 SFX?.ui?.(audio);s.tweens.killTweensOf(v.wheel);
 s.tweens.add({targets:v.wheel,angle:x===0?360:x*60,duration:reduced()?1:400,ease:'Back.out',onComplete:()=>{if(x===0)v.wheel.setAngle(0);}});
 v.showSetting();s.writeSave();renderTracker(s);
 if(x===0)say(s,'Injap kembali ke 0.',1600);
}
function flow(s,{audio,SFX}){
 const v=s.sluice;if(v.busy)return;
 const before=s.run.sluice,t=testFlow(before);s.run.sluice=t.state;s.writeSave(); // state first: reload mid-animation is safe
 v.busy=true;v.lever.setFrame(66);SFX?.machine?.(audio);
 const R=reduced(),D=k=>R?1:k;
 // Water pulses along the pipe from the spring to the meter.
 const path=(s.pipeCells||[]).map(c=>({x:c.x+27,y:c.y+27}));
 if(!R&&path.length){for(let i=0;i<4;i++){const dot=s.add.circle(path[0].x,path[0].y,5,0x7fd8ff).setDepth(11.9).setAlpha(.9);const seq=path.filter(p=>p.x<=DIAL.x+27);s.tweens.chain({targets:dot,delay:i*120,tweens:seq.map(p=>({x:p.x,y:p.y,duration:900/seq.length})),onComplete:()=>dot.destroy()});}}
 s.time.delayedCall(D(900),()=>{
  s.tweens.add({targets:v.needle,angle:angleFor(t.reading),duration:D(650),ease:'Back.out'});
  digits(s,v.readDigits,t.reading,DIAL.x,DIAL.y+DIAL.r+34,1.3,12);
 });
 s.time.delayedCall(D(1700),()=>{
  if(t.result==='open'){
   SFX?.correct?.(audio);SFX?.bridge?.(audio);openSluice(s,true);
   if(!R)s.cameras.main.shake(260,.003);
   say(s,'Bacaan 13 ✓',2000);
   s.time.delayedCall(D(1400),()=>{v.busy=false;renderTracker(s);});
   s.time.delayedCall(D(2600),()=>s.summary?.());
   return;
  }
  const low=t.result==='low';
  if(low){
   const lift=Math.max(8,(t.reading-3)*3);
   s.tweens.add({targets:v.gate.list,y:`-=${lift}`,duration:D(500),yoyo:true,hold:D(500),ease:'Sine.inOut'});
   burst(s,SLUICE.gateX+54,1680,6,0x7fd8ff,R);
   say(s,'Aliran masih rendah.',2800);
  }else{
   SFX?.incorrect?.(audio);if(!R)s.cameras.main.shake(180,.004);
   for(let i=0;i<3;i++)s.time.delayedCall(D(i*140),()=>burst(s,DIAL.x+30,1404,10,0x7fd8ff,R));
   say(s,'Tekanan terlalu tinggi!',2800);
  }
  s.time.delayedCall(D(1600),()=>{
   s.tweens.add({targets:v.needle,angle:-130,duration:D(500)});digits(s,v.readDigits,null);
   v.lever.setFrame(64);v.busy=false;renderTracker(s);
  });
 });
 renderTracker(s);
}
function setPlate(s,k){
 const v=s.sluice;s.run.sluice=stepPlate(s.run.sluice,k);
 v.plates.forEach(p=>p.art.setFrame(p.k===k?149:148));
 s.sfxRef?.ui?.(s.audioRef);s.writeSave();
}
function cave(s,{audio,SFX}){
 const v=s.sluice,r=pullCave(s.run.sluice);
 if(r.result==='none'){say(s,'Pijak satu plat dahulu.',2400);return;}
 s.run.sluice=r.state;s.writeSave();v.busy=true;v.caveLever.setFrame(66);SFX?.machine?.(audio);
 const R=reduced(),D=k=>R?1:k;
 s.time.delayedCall(D(700),()=>{
  if(r.result==='solved'){
   SFX?.correct?.(audio);v.chest.setFrame(11);burst(s,CAVE.chestX,CAVE.feet-30,10,0xffe27a,R);
   s.revealCave?.();
   say(s,'Klik! Peti tersembunyi terbuka.',3000);v.busy=false;renderTracker(s);
   return;
  }
  SFX?.incorrect?.(audio);
  for(let i=0;i<3;i++)s.time.delayedCall(D(i*120),()=>burst(s,CAVE.leverX+20,CAVE.feet-100,8,0x7fd8ff,R));
  v.plates.forEach(p=>p.art.setFrame(148));
  say(s,'Air memancut balik. Plat dikembalikan.',3000);
  s.time.delayedCall(D(900),()=>{v.caveLever.setFrame(64);v.busy=false;});
 });
}

// ── Compact tracker (same look as Levels 1-1/1-2) ──
const HINTS={
 investigate:['Meter pada paip menunjukkan tanda asal 13. Pintu air terbuka hanya jika bacaan tepat 13.','Baca catatan penyelenggaraan: bacaan = 2 × tetapan + 3. Tetapan berapa memberi 13?',`Undur langkah mesin: ${inverseSteps(TARGET)}. Pusing injap ke 5, kemudian tarik tuas aliran.`],
};
function hintsFor(st){
 if(sluiceStep(st)!=='retry')return HINTS.investigate;
 const r=st.lastReading;return [`Bacaan ${r} ${r<TARGET?'terlalu rendah':'terlalu tinggi'} — sasaran 13. ${r<TARGET?'Tetapan perlu lebih besar.':'Tetapan perlu lebih kecil.'}`,HINTS.investigate[1],HINTS.investigate[2]];
}
export function installTracker(s){
 const frame=document.querySelector('.game-frame');if(!frame)return;
 $('quest-tracker')?.remove();
 const tr=document.createElement('aside');tr.id='quest-tracker';tr.hidden=true;tr.setAttribute('aria-label','Misi semasa');
 tr.innerHTML='<p class="qt-head">Misi</p><p id="qt-text" role="status" aria-live="polite"></p><p id="qt-inv" hidden></p><div class="qt-row"><button type="button" id="qt-hint" aria-label="Petunjuk">?</button><button type="button" id="qt-math" class="link-btn" hidden>Lihat cara kira</button></div><p id="qt-hint-text" hidden></p><p id="qt-math-text" hidden></p>';
 frame.append(tr);decorateJournal(tr,s,{level:'1–3'});
 const abort=new AbortController();s.events.once('shutdown',()=>{abort.abort();tr.remove();});
 $('qt-hint').addEventListener('click',()=>{s.hintLevel=((s.hintLevel||0)%3)+1;renderTracker(s);},{signal:abort.signal});
 $('qt-math').addEventListener('click',()=>{const t=$('qt-math-text');t.hidden=!t.hidden;},{signal:abort.signal});
}
const trackerShown=s=>s.mode==='playing'&&(s.sluiceIntro||s.run.sluice.tests>0||s.run.sluice.noteRead||s.run.sluice.open);
export function renderTracker(s){
 const tr=$('quest-tracker'),st=s.run.sluice;if(!tr)return;
 const step=sluiceStep(st),show=trackerShown(s);tr.hidden=!show;if(!show)return;
 $('qt-text').textContent=step==='done'?'Pintu air dipulihkan ✓':'Pulihkan pintu air: cari tetapan asal injap.';
 const inv=$('qt-inv');inv.hidden=step==='done';
 inv.textContent=`Injap ${st.setting} · sasaran 13${st.lastReading!==null?` · bacaan lalu ${st.lastReading}`:''}`; // max 2 lines (formula: note + hint 2)
 if(s.lastHintStep!==step){s.lastHintStep=step;s.hintLevel=0;}
 const lvl=s.hintLevel||0,hint=$('qt-hint-text');$('qt-hint').hidden=step==='done';
 hint.hidden=!lvl||step==='done';if(lvl)hint.textContent=`Petunjuk ${lvl}: ${hintsFor(st)[lvl-1]}`;
 $('quest-tracker').classList.toggle('hint-open',!hint.hidden);$('quest-tracker').classList.toggle('has-hint-btn',!$('qt-hint').hidden);$('quest-tracker').scrollTop=0; // short screens: hint takes the status line's place
 $('qt-math').hidden=step!=='done';
 $('qt-math-text').textContent=`f(x) = 2x + 3 · f(5) = 13 ✓ · f⁻¹(13) = (13 − 3) ÷ 2 = 5${st.cave.solved?' · Injap gua: f⁻¹(15) = (15 − 3) ÷ 2 = 6':''}.`;
}
export function syncSluiceUI(s){const tr=$('quest-tracker');if(!tr)return;if(tr.hidden===trackerShown(s))renderTracker(s);syncJournal(s);}
export const sluiceWaterY=s=>s.sluice?.waterY??WATER_Y;
export {CHANNEL,reading};

// Level 1-2 (World 1 V3) · "Aliran Bengkel Dua Mesin".
// A woodworks needs at least 8 usable components to build the next
// crossing. It has 5 component units and two machines on one conveyor:
//   Mesin A (Gandaan)        f(x) = 2x      — doubles a batch using the
//                                             workshop's own raw timber
//                                             (the timber pile visibly shrinks)
//   Mesin B (Kawalan Kualiti) g(x) = x − 2  — removes 2 damaged units from a
//                                             batch; needs a batch of ≥ 2
// The machine that receives the batch first is set by a lever on the upper
// deck (the machines physically swap places). KSSM notation: fg(x) = f(g(x)).
//   A then B: g(f(5)) = gf(5) = g(10) = 8  ✓ enough
//   B then A: f(g(5)) = fg(5) = f(3)  = 6  ✗ not enough (components return)
// The workshop starts on "B then A" (mis-set), so the first run is the
// demonstration; nothing is lost by running again.
import {notify} from '../presentation.js';
import {planksDrop,burst} from '../feel.js';
import {makeBubble,placeBubbleObj} from '../core/speech-bubble.js';
import {decorateJournal,syncJournal,dialogue,stamp} from '../ui/v4-ui.js';
import {signText} from '../environment.js';

import {STOCK,NEED,MACHINES,runLine,workshopStep} from './workshop-model.js';
export {STOCK,NEED,MACHINES,ORDERS,runLine,newWorkshop,sanitizeWorkshop,workshopStep} from './workshop-model.js';

// ── World layout (Level 1-2 final yard: 3456–3888 @1242) ──
export const LINE={y:1242,beltY:1188,beltX0:3473,beltX1:3837,hopperX:3510,slots:[3640,3780],receiverX:3864,runLeverX:3440,orderLever:{x:3214,feet:1026},guideSignX:3360,ladderX:3024,ladderTop:1080,bridge:{id:'workshop-bridge',x:3888,y:1242,width:324}};
const $=id=>document.getElementById(id);
const TXT={fontFamily:'Arial, sans-serif',fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

export function buildWorkshop(s,{audio,SFX}={}){
 const tile=s.tile,w=s.run.workshop;
 s.add.text(3672,1000,'BENGKEL KAYU',{...TXT,fontSize:'18px'}).setOrigin(.5,1).setDepth(11.6);
 // Conveyor: plank rail on posts from the stock pile to the receiver.
 for(let x=LINE.beltX0;x<LINE.beltX1;x+=54)tile(x===LINE.beltX0?48:x+54>=LINE.beltX1?50:49,x,LINE.beltY,10.2,Math.min(54,LINE.beltX1-x),18);
 for(const x of [3600,3720,3810])tile(89,x-27,LINE.beltY+18,10.1,54,36);
 // Stock: five component crates; the raw timber pile machine A draws from.
 const stock=[];for(let i=0;i<STOCK;i++)stock.push(s.add.image(LINE.hopperX-22+(i%3)*22,LINE.beltY-(Math.floor(i/3)?22:0),'kpp_terrain_atlas',26).setOrigin(.5,1).setScale(1.2).setDepth(10.4));
 const timber=[tile(7,3486,1210,10.3,54,18),tile(7,3486,1224,10.3,54,18),tile(8,3540,1214,10.3,54,18)];
 s.add.text(LINE.hopperX,LINE.beltY-48,`Stok: ${STOCK} komponen`,{...TXT,fontSize:'12px'}).setOrigin(.5,1).setDepth(11.6);
 // Two machines (2×2 tiles each) standing on the conveyor, each with a plate.
 const machine=id=>{
  const c=s.add.container(0,0).setDepth(11);
  const body=[s.add.image(-54,-108,'kpp_terrain_atlas',id==='A'?31:29),s.add.image(0,-108,'kpp_terrain_atlas',id==='A'?29:31),s.add.image(-54,-54,'kpp_terrain_atlas',29),s.add.image(0,-54,'kpp_terrain_atlas',29)];
  body.forEach(b=>b.setOrigin(0).setScale(3));c.add(body);
  const m=MACHINES[id];
  const plate=s.add.text(0,-120,`${id} · ${m.short}\n${m.rule}`,{fontFamily:'ui-monospace,Consolas,monospace',fontSize:'11px',fontStyle:'bold',color:'#fee481',backgroundColor:'#434a5f',padding:{x:6,y:3},align:'center'}).setOrigin(.5,1);
  c.add(plate);return c;
 };
 const machines={A:machine('A'),B:machine('B')};
 const place=(order,animate)=>{order.split('').forEach((id,i)=>{const x=LINE.slots[i],y=LINE.beltY;const m=machines[id];if(animate&&!reduced())s.tweens.add({targets:m,x,y,duration:450,ease:'Sine.inOut'});else m.setPosition(x,y);});};
 place(w.order,false);
 // Receiver bin at the bridge mouth and the counter above it.
 tile(9,LINE.receiverX-27,LINE.y-54,10.5);
 const counter=s.add.text(LINE.receiverX,LINE.y-62,'',{...TXT,fontSize:'14px'}).setOrigin(.5,1).setDepth(11.7);
 // Levers: run (floor) and order (upper deck, with a sign).
 const runLever=tile(64,LINE.runLeverX-27,LINE.y-54,11.5);
 const orderLever=tile(w.order==='AB'?66:64,LINE.orderLever.x-27,LINE.orderLever.feet-54,11.5);
 s.add.text(LINE.orderLever.x,LINE.orderLever.feet-60,'Tuas susunan mesin',{...TXT,fontSize:'12px'}).setOrigin(.5,1).setDepth(11.6);
 // Day 02 · P1-11 — wayfinding to the order lever. A sign post at the west
 // end of the yard points back to the ladder; one gold marker bobs over the
 // ladder top while the order still has to be changed and the player has not
 // climbed yet (the lever keeps its own label, so it gets no marker).
 tile(86,LINE.guideSignX-27,LINE.y-54,11);signText(s,'← Dek atas',LINE.guideSignX,LINE.y-6);
 const marker=(x,y)=>{const m=s.add.text(x,y,'▼',{...TXT,fontSize:'22px',color:'#ffd25a'}).setOrigin(.5,1).setDepth(13).setVisible(false);
  if(!reduced())s.tweens.add({targets:m,y:y-8,duration:700,yoyo:true,repeat:-1,ease:'Sine.inOut'});return m;};
 const guides=[marker(LINE.ladderX,LINE.ladderTop-56)];
 // The crossing: posts in the water now, deck appears when 8 components arrive.
 for(const x of [LINE.bridge.x+54,LINE.bridge.x+LINE.bridge.width-54])tile(89,x-27,LINE.y,6.5,54,54),tile(89,x-27,LINE.y+54,6.5,54,54);
 s.workshop={machines,place,counter,runLever,orderLever,stock,timber,guides,bridgeArt:null,busy:false,bubble:null};
 if(w.delivered)buildBridge(s,false,{audio,SFX});
 renderCounter(s);installTracker(s);
}
function renderCounter(s){const w=s.run.workshop,v=s.workshop;v.counter.setText(w.delivered?`Penerima ${NEED}/${NEED} ✓`:w.lastOut!=null?`Penerima ${w.lastOut}/${NEED}`:`Penerima: perlu ≥ ${NEED}`);}
export function buildBridge(s,animate,{audio,SFX}={}){
 const v=s.workshop;if(v.bridgeArt)return;
 v.bridgeArt=s.deck(LINE.bridge);s.platform(LINE.bridge);
 if(animate)planksDrop(s,v.bridgeArt,{audio,SFX});
}
export function bubble(s,text,ms=3000){
 const v=s.workshop;v.bubble?.destroy();
 v.bubble=makeBubble(s,text);v.bubbleUntil=s.time.now+ms;placeBubbleObj(s,v.bubble);
}
const placeBubble=s=>placeBubbleObj(s,s.workshop.bubble); // shared placement (core/speech-bubble.js)

// Prompt + passive triggers, called each frame while playing.
export function workshopPrompt(s,grounded,touch){
 const w=s.run.workshop,v=s.workshop;s.workshopReady=null;if(!w||!v)return null;
 const px=s.player.x,feet=s.player.body.bottom,key=touch?'Guna':'E';
 if(v.bubble){placeBubble(s);if(s.time.now>v.bubbleUntil){v.bubble.destroy();v.bubble=null;}}
 // Ladder marker: only while the order must change and the player has not climbed yet.
 const guide=workshopStep(w)==='swap'&&!v.busy&&feet>LINE.ladderTop+20;for(const g of v.guides||[])if(g.visible!==guide)g.setVisible(guide);
 if(!s.workshopIntro&&px>3420&&Math.abs(feet-LINE.y)<8){s.workshopIntro=true;if(!w.delivered){renderTracker(s);dialogue(s,[`Bengkel perlu ${NEED} komponen untuk jambatan.`,`Stok cuma ada ${STOCK}. Mesin mesti hasilkan lebih.`]);}}
 if(!grounded||v.busy||w.delivered)return null;
 if(Math.abs(px-LINE.runLeverX)<50&&Math.abs(feet-LINE.y)<8){s.workshopReady='run';return {key,text:'Jalankan bengkel',x:LINE.runLeverX,y:LINE.y-110};}
 if(Math.abs(px-LINE.orderLever.x)<36&&Math.abs(feet-LINE.orderLever.feet)<8){s.workshopReady='swap';return {key,text:'Tukar susunan mesin',x:LINE.orderLever.x,y:LINE.orderLever.feet-110};}
 return null;
}
export function useWorkshop(s,{audio,SFX}={}){
 if(s.workshopReady==='swap')return swap(s,{audio,SFX});
 if(s.workshopReady==='run')return runBatch(s,{audio,SFX});
}
function swap(s,{audio,SFX}){
 const w=s.run.workshop,v=s.workshop;if(v.busy||w.delivered)return;
 w.order=w.order==='AB'?'BA':'AB';w.swaps++;
 v.orderLever.setFrame(w.order==='AB'?66:64);v.place(w.order,true);SFX?.machine?.(audio);
 const first=MACHINES[w.order[0]];
 bubble(s,`Kini ${first.id} dahulu.`);
 s.writeSave();renderTracker(s);
}
// A production run: five crates ride the conveyor; each machine relabels the
// batch with its output; the receiver shows the total.
function runBatch(s,{audio,SFX}){
 const w=s.run.workshop,v=s.workshop;if(v.busy||w.delivered)return;
 const r=runLine(w.order);v.busy=true;w.runs++;
 v.runLever.setFrame(66);SFX?.machine?.(audio);
 const token=s.add.text(LINE.hopperX,LINE.beltY-16,String(STOCK),{fontFamily:'ui-monospace,monospace',fontSize:'18px',fontStyle:'bold',color:'#2b2118',backgroundColor:'#ffe27a',padding:{x:6,y:2}}).setOrigin(.5,1).setDepth(30);
 const d=reduced()?1:700;
 const step=(x,label,cb)=>s.tweens.add({targets:token,x,duration:d,ease:'Sine.inOut',onComplete:()=>{token.setText(label);burst(s,x,LINE.beltY-30,5,0xffe27a);SFX?.coin?.(audio);cb();}});
 if(w.order[0]==='A'||w.order[1]==='A')v.timber.forEach(t=>t.setAlpha(.45)); // machine A draws raw timber
 step(LINE.slots[0],String(r.mid),()=>step(LINE.slots[1],String(r.out),()=>s.tweens.add({targets:token,x:LINE.receiverX,duration:d,onComplete:()=>finishRun(s,r,token,{audio,SFX})})));
 bubble(s,`${MACHINES[w.order[0]].id} dahulu: ${STOCK} → ${r.mid} → ${r.out}`,2600);
}
function finishRun(s,r,token,{audio,SFX}){
 const w=s.run.workshop,v=s.workshop;w.lastOut=r.out;v.runLever.setFrame(64);
 if(r.enough){
  w.delivered=true;token.destroy();v.busy=false;
  renderCounter(s);buildBridge(s,true,{audio,SFX});SFX?.correct?.(audio);
  s.writeSave();renderTracker(s);
  // V4: completion = short portrait dialogue + gold stamp (maths summary in the Journal).
  s.time.delayedCall(900,()=>{dialogue(s,[`${r.out} komponen! Jambatan bengkel dah dibina.`,'Susunan mesin mengubah hasil.']).then(()=>stamp('Misi selesai · Jambatan bengkel'));});
  return;
 }
 renderCounter(s);SFX?.incorrect?.(audio);
 bubble(s,`Hasil ${r.out} — belum cukup ${NEED}.`,3200); // what to try next is in the Journal (status + hints)
 // Nothing is lost: the batch rides back to the stock pile.
 s.tweens.add({targets:token,x:LINE.hopperX,alpha:.4,duration:reduced()?1:900,onComplete:()=>{token.destroy();v.busy=false;v.timber.forEach(t=>t.setAlpha(1));}});
 s.writeSave();renderTracker(s);
}

// ── Compact tracker (same look as Level 1-1) ──
const HINTS={
 run:[`Jambatan perlukan sekurang-kurangnya ${NEED} komponen.`,'Tarik tuas Jalankan dan lihat nombor di antara mesin.','Mesin pertama menerima 5; hasilnya menjadi input mesin kedua.'],
 swap:['Hasil 6 tak cukup. Apa yang berubah jika mesin lain bermula dahulu?','Tuas berada di dek atas, berhampiran tangga.','Cuba gandakan dahulu, kemudian buang 2: g(f(5)).'],
};
function installTracker(s){
 const frame=document.querySelector('.game-frame');if(!frame)return;
 $('quest-tracker')?.remove();
 const tr=document.createElement('aside');tr.id='quest-tracker';tr.hidden=true;tr.setAttribute('aria-label','Misi semasa');tr.dataset.level='1–2';
 tr.innerHTML='<p class="qt-head">Misi</p><p id="qt-text" role="status" aria-live="polite"></p><p id="qt-inv" hidden></p><div class="qt-row"><button type="button" id="qt-hint" aria-label="Petunjuk">?</button><button type="button" id="qt-math" class="link-btn" hidden>Lihat cara kira</button></div><p id="qt-hint-text" hidden></p><p id="qt-math-text" hidden></p>';
 frame.append(tr);decorateJournal(tr,s,{level:'1–2'});
 const abort=new AbortController();s.events.once('shutdown',()=>{abort.abort();tr.remove();});
 $('qt-hint').addEventListener('click',()=>{s.hintLevel=((s.hintLevel||0)%3)+1;renderTracker(s);},{signal:abort.signal});
 $('qt-math').addEventListener('click',()=>{const t=$('qt-math-text');t.hidden=!t.hidden;},{signal:abort.signal});
}
export function renderTracker(s){
 const tr=$('quest-tracker'),w=s.run.workshop;if(!tr)return;
 const step=workshopStep(w),show=s.mode==='playing'&&(s.workshopIntro||w.runs>0||w.delivered);
 tr.hidden=!show;if(!show)return;
 const first=MACHINES[w.order[0]];
 $('qt-text').textContent=step==='done'?'Jambatan bengkel dibina ✓':step==='swap'?'Naik ke dek atas untuk mengubah susunan mesin.':`Hasilkan ≥ ${NEED} komponen untuk jambatan.`;
 const inv=$('qt-inv');inv.hidden=step==='done';inv.textContent=`Susunan: ${first.id} dahulu · penerima ${w.lastOut??0}/${NEED}`;
 if(s.lastHintStep!==step){s.lastHintStep=step;s.hintLevel=0;}
 const lvl=s.hintLevel||0,hint=$('qt-hint-text');$('qt-hint').hidden=step==='done';
 hint.hidden=!lvl||step==='done';if(lvl&&HINTS[step])hint.textContent=`Petunjuk ${lvl}: ${HINTS[step][lvl-1]}`;
 $('quest-tracker').classList.toggle('hint-open',!hint.hidden);$('quest-tracker').classList.toggle('has-hint-btn',!$('qt-hint').hidden);$('quest-tracker').scrollTop=0; // short screens: hint takes the status line's place
 $('qt-math').hidden=step!=='done';
 $('qt-math-text').textContent=`${runLine('AB').notation} ✓ · ${runLine('BA').notation}. Maka gf ≠ fg untuk contoh ini.`;
}
export function syncWorkshopUI(s){const tr=$('quest-tracker');if(!tr)return;const w=s.run.workshop,show=s.mode==='playing'&&(s.workshopIntro||w.runs>0||w.delivered);if(tr.hidden===show)renderTracker(s);syncJournal(s);}

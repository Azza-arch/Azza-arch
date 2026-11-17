// Level 1-1 (World 1 V3) · "Bekalan untuk Jambatan Kampung".
// The bridge at the Stesen Kayu is missing 5 planks. The timber storeroom is
// locked; its key lies at the old hut on top of the root arch (movement, not
// maths). Inside, the supplier charges a fixed price per plank plus one
// delivery fee: C(x) = p·x + d. The player chooses how many planks to buy
// within the mission budget (separate from collectible coins), carries them
// to the bridge and installs them.
//
// Maths model (validated in tests/supply-quest.test.mjs):
//   x = number of planks bought (integer 1…STOCK), C(x) = p·x + d ringgit.
//   A purchase is accepted when x ≥ NEED (enough for the bridge) and
//   C(x) ≤ budget. Every variant has at least one accepted x; the base
//   variant accepts x = 5 (RM26) and x = 6 (RM30).
// Wrong choices are refused with short feedback and cost nothing.
import {GATES,CHECKPOINTS} from '../level.js';
import {notify,showCheckpointToast} from '../presentation.js';
import {planksDrop,burst} from '../feel.js';
import {makeBubble,placeBubbleObj} from '../core/speech-bubble.js';
import {awardAchievement,loadProfile,LEVEL_KEY} from '../progress.js';

export const NEED=5, STOCK=8;
export const VARIANTS=Object.freeze([
 {id:'K1',price:4,delivery:6,budget:30},
 {id:'K2',price:3,delivery:9,budget:25},
 {id:'K3',price:5,delivery:5,budget:32},
]);
export const variantById=id=>VARIANTS.find(v=>v.id===id)||VARIANTS[0];
export const cost=(v,x)=>v.price*x+v.delivery;
export const formula=v=>`C(x) = ${v.price}x + ${v.delivery}`;
export function checkPurchase(v,x){
 if(!Number.isInteger(x)||x<1||x>STOCK)return {ok:false,code:'range'};
 const c=cost(v,x);
 if(x<NEED)return {ok:false,code:'short',cost:c};
 if(c>v.budget)return {ok:false,code:'budget',cost:c};
 return {ok:true,cost:c,change:v.budget-c,exact:x===NEED};
}
export const acceptedChoices=v=>Array.from({length:STOCK},(_,i)=>i+1).filter(x=>checkPurchase(v,x).ok);

// ── Quest state (stored in the run save; see save.js sanitizeQuest) ──
export function newQuest(variant='K1'){return {variant:variantById(variant).id,found:false,doorTried:false,key:false,door:false,bought:null,planks:0,repaired:false,shortcut:false};}
export function sanitizeQuest(raw,bridgeSolved=false){
 const q=newQuest(raw?.variant);
 if(raw&&typeof raw==='object'){
  for(const k of ['found','doorTried','key','door','repaired','shortcut'])q[k]=raw[k]===true;
  const b=raw.bought;
  if(b&&Number.isInteger(b.x)&&checkPurchase(variantById(q.variant),b.x).ok)q.bought={x:b.x,cost:cost(variantById(q.variant),b.x)};
  q.planks=q.bought&&!q.repaired?q.bought.x:0;
  // Each step implies the ones before it (no impossible combinations).
  if(q.bought){q.door=true;q.key=true;q.found=true;}
  if(q.door)q.key=true;
 }
 // Saves from the previous course (bridge built by the old machine) keep
 // the bridge: nothing the player already did is taken away.
 if(bridgeSolved||q.repaired)Object.assign(q,{found:true,doorTried:true,key:true,door:true,repaired:true,planks:0});
 return q;
}
const LAST_VARIANT_KEY='denai-l1-last-variant';
// First adventure: base prices. Replays rotate through the other variants.
export function pickVariant(){
 let completions=0;try{completions=loadProfile().levels[LEVEL_KEY].completions;}catch{}
 if(!completions)return 'K1';
 let last=null;try{last=localStorage.getItem(LAST_VARIANT_KEY);}catch{}
 const i=VARIANTS.findIndex(v=>v.id===last);
 return VARIANTS[(i+1)%VARIANTS.length].id;
}
export function noteVariant(id){try{localStorage.setItem(LAST_VARIANT_KEY,id);}catch{}}

// ── World layout (existing Level 1-1 geometry) ──
export const STORE={doorX:2367,feet:1242,wallX:2232,wallW:270,top:1080};
export const HUT={x:1404,feet:1080,keyX:1431};
export const BRIDGE_EDGE={x:2510,feet:1242};
const ARCH={x0:1242,x1:1620,top:1080},SHORTCUT={x0:1620,x1:1782,feet:1296};
const $=id=>document.getElementById(id);
const TEXT={fontFamily:'Arial, sans-serif',fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'};

export function buildSupplyQuest(s){
 const tile=s.tile;
 // The old function machine becomes the timber storeroom: its art is hidden
 // (kept for legacy code paths) and a plank wall with a door closes the shelter.
 for(const k of ['machineScreen','machineSub','lever','probeReadout','liftReadout','liftState'])s[k]?.setVisible(false);
 const walls=[];
 for(let x=STORE.wallX;x<STORE.wallX+STORE.wallW;x+=54)for(let y=STORE.top;y<STORE.feet;y+=54){
  if(x===STORE.doorX-27&&y>=STORE.top+54)continue;walls.push(tile(29,x,y,11.4));
 }
 const doorway=s.add.rectangle(STORE.doorX,STORE.feet,54,108,0x2b1d14).setOrigin(.5,1).setDepth(11.35).setVisible(false);
 const timber=[tile(7,STORE.doorX-22,STORE.feet-40,11.36,54,18),tile(7,STORE.doorX-22,STORE.feet-62,11.36,54,18)].map(t=>t.setVisible(false));
 const door=[tile(130,STORE.doorX-27,STORE.feet-108,11.5),tile(150,STORE.doorX-27,STORE.feet-54,11.5)];
 s.add.text(STORE.doorX,STORE.top-4,'STOR KAYU',{...TEXT,fontSize:'13px'}).setOrigin(.5,1).setDepth(11.6);
 // Old hut on the root arch: a wall block, a door and a plank roof.
 tile(29,HUT.x-54,HUT.feet-54,10.5);tile(29,HUT.x-54,HUT.feet-108,10.5);
 tile(130,HUT.x,HUT.feet-108,10.5);tile(150,HUT.x,HUT.feet-54,10.5);
 tile(48,HUT.x-54,HUT.feet-126,10.6,54,18);tile(50,HUT.x,HUT.feet-126,10.6,54,18);
 s.add.text(HUT.x,HUT.feet-130,'Pondok lama',{...TEXT,fontSize:'12px'}).setOrigin(.5,1).setDepth(10.7);
 const key=s.add.image(HUT.keyX,HUT.feet-24,'kpp_terrain_atlas',27).setScale(2.4).setDepth(14);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)s.tweens.add({targets:key,y:key.y-6,duration:800,yoyo:true,repeat:-1,ease:'Sine.inOut'});
 // Bridge: 6 plank slots; the first plank is still there (with collision so
 // it never looks walkable without being so), the other 5 are missing.
 const g=GATES[0];s.liftPlanks?.[0]?.setVisible(true).setAlpha(1);
 const stub=s.platform({id:'bridge-stub',x:g.x,y:g.y,width:g.width/g.planks});
 // The rope rails still hang across the gap and a snapped plank dangles from
 // the stub: it reads as a damaged bridge, not as an empty chasm.
 s.bridgeRails?.forEach(r=>r.setVisible(true));
 const snapped=s.add.image(g.x+g.width/g.planks+6,g.y+4,'kpp_terrain_atlas',49).setOrigin(0,0).setScale(3).setCrop(0,0,18,6).setAngle(58).setDepth(10);
 s.supply={walls,door,doorway,timber,key,stub,snapped,bubble:null};
 installQuestUI(s);
}

// ── Small world bubble above the player (2.6 s) ──
export function bubble(s,text){
 s.supply?.bubble?.destroy();
 const t=makeBubble(s,text); // Fasa F: wraps and stays on screen (core/speech-bubble.js)
 s.supply.bubble=t;s.supply.bubbleUntil=s.time.now+2600;placeBubbleObj(s,t);
}

const q=s=>s.run?.quest;
export function questStep(qs){
 if(!qs)return 'none';
 if(qs.repaired)return 'done';
 if(qs.bought)return 'repair';
 if(qs.door)return 'buy';
 if(qs.key)return 'open';
 if(qs.doorTried)return 'key';
 if(qs.found)return 'find';
 return 'none';
}

// Called every frame from the scene (only while playing). Returns a world
// prompt for the nearest quest interaction, and handles passive triggers.
export function questPrompt(s,onGround,touch){
 const qs=q(s);s.questReady=null;if(!qs||!s.supply)return null;
 const sp=s.supply,px=s.player.x,feet=s.player.body.bottom,key=touch?'Guna':'E';
 if(sp.bubble){placeBubbleObj(s,sp.bubble);if(s.time.now>sp.bubbleUntil){sp.bubble.destroy();sp.bubble=null;}}
 // 1. Discover the problem at the bridge edge.
 if(!qs.found&&onGround&&px>2430&&px<2560&&Math.abs(feet-1242)<6){qs.found=true;bubble(s,`Jambatan ni kurang ${NEED} papan.`);s.writeSave();renderTracker(s);}
 // 2. Key: touch it.
 if(!qs.key&&Math.abs(px-HUT.keyX)<40&&Math.abs(feet-HUT.feet)<10){
  qs.key=true;sp.key.destroy();burst(s,HUT.keyX,HUT.feet-24,10,0xffe27a);s.sfx?.coin?.();
  bubble(s,qs.found?'Kunci stor! Turun di hujung timur gerbang — jalan pintas.':'Kunci lama… mungkin untuk Stor Kayu.');
  s.writeSave();renderTracker(s);
 }
 // 3. Shortcut: walked on the arch with the key, then dropped east to the yard steps.
 if(qs.key&&!qs.door){
  if(Math.abs(feet-ARCH.top)<6&&px>ARCH.x0&&px<ARCH.x1)s.onArchAt=s.time.now;
  if(!qs.shortcut&&onGround&&Math.abs(feet-SHORTCUT.feet)<6&&px>SHORTCUT.x0&&px<SHORTCUT.x1&&s.time.now-(s.onArchAt||-1e9)<3000){
   qs.shortcut=true;awardAchievement('jalan-pintas');notify('Jalan pintas ke Stor Kayu!');s.writeSave();
  }
 }
 if(!onGround)return null;
 const at=(x,r,f=1242)=>Math.abs(px-x)<r&&Math.abs(feet-f)<6;
 // 4. Door / purchase.
 if(at(STORE.doorX,60)&&!qs.bought){
  if(!qs.door){s.questReady='door';return {key,text:qs.key?'Buka stor dengan kunci':'Pintu stor',x:STORE.doorX,y:STORE.feet-128};}
  s.questReady='buy';return {key,text:'Beli papan',x:STORE.doorX,y:STORE.feet-128};
 }
 // 5. Repair.
 if(qs.bought&&!qs.repaired&&at(BRIDGE_EDGE.x,64)){s.questReady='repair';return {key,text:`Pasang ${NEED} papan`,x:BRIDGE_EDGE.x,y:BRIDGE_EDGE.feet-110};}
 return null;
}

export function useQuest(s,{audio,SFX}={}){
 const qs=q(s);if(!qs)return;
 if(s.questReady==='door'){
  qs.doorTried=true;
  if(!qs.key){bubble(s,'Stor berkunci. Kuncinya mungkin dekat pondok lama.');s.writeSave();renderTracker(s);return;}
  if(!qs.found){qs.found=true;}
  openDoor(s,true);qs.door=true;SFX?.checkpoint?.(audio);
  bubble(s,'Stor dibuka. Lihat harga papan.');s.writeSave();renderTracker(s);openStore(s);return;
 }
 if(s.questReady==='buy'){openStore(s);buy(s,{audio,SFX});return;}
 if(s.questReady==='repair')repair(s,{audio,SFX});
}

function openDoor(s,animate){
 const sp=s.supply;sp.doorway.setVisible(true);sp.timber.forEach(t=>t.setVisible(true));
 sp.walls.forEach(w=>w.setAlpha(1));
 if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){sp.door.forEach(d=>s.tweens.add({targets:d,y:d.y-24,alpha:0,duration:320,ease:'Quad.in'}));burst(s,STORE.doorX,STORE.feet-60,6,0xc9a27a);}
 else sp.door.forEach(d=>d.setVisible(false));
}

// ── Purchase panel (compact, next to the store; stays open while near) ──
function installQuestUI(s){
 const frame=document.querySelector('.game-frame');if(!frame)return;
 $('quest-tracker')?.remove();$('store-panel')?.remove();
 const tr=document.createElement('aside');tr.id='quest-tracker';tr.hidden=true;tr.setAttribute('aria-label','Misi semasa');
 tr.innerHTML='<p class="qt-head">Misi</p><p id="qt-text" role="status" aria-live="polite"></p><p id="qt-inv" hidden></p><div class="qt-row"><button type="button" id="qt-hint" aria-label="Petunjuk">?</button><button type="button" id="qt-math" class="link-btn" hidden>Lihat cara kira</button></div><p id="qt-hint-text" hidden></p><p id="qt-math-text" hidden></p>';
 const st=document.createElement('section');st.id='store-panel';st.hidden=true;st.setAttribute('aria-label','Pembekal kayu');
 st.innerHTML='<p class="sp-head">Pembekal Kayu Hutan</p><p class="sp-receipt" id="sp-receipt"></p><div class="sp-row"><span>Papan</span><button type="button" id="sp-minus" aria-label="Kurangkan papan">−</button><output id="sp-qty">1</output><button type="button" id="sp-plus" aria-label="Tambah papan">+</button></div><p class="sp-total" id="sp-total"></p><button type="button" id="sp-buy" class="sp-buy">Beli · E</button><p id="sp-msg" role="status" aria-live="polite"></p>';
 frame.append(tr,st);
 if(matchMedia('(pointer: coarse)').matches)$('sp-buy').textContent='Beli';
 const abort=new AbortController(),signal=abort.signal;s.events.once('shutdown',()=>{abort.abort();tr.remove();st.remove();document.body.classList.remove('store-open');});
 s.storeQty=1;
 const setQty=n=>{s.storeQty=Math.max(1,Math.min(STOCK,n));$('sp-msg').textContent='';renderStore(s);};
 $('sp-minus').addEventListener('click',()=>setQty(s.storeQty-1),{signal});
 $('sp-plus').addEventListener('click',()=>setQty(s.storeQty+1),{signal});
 $('sp-buy').addEventListener('click',()=>buy(s,{audio:s.audioRef,SFX:s.sfxRef}),{signal});
 document.addEventListener('keydown',e=>{if(st.hidden||e.repeat)return;if(['Minus','NumpadSubtract'].includes(e.code)){e.preventDefault();setQty(s.storeQty-1);}if(['Equal','NumpadAdd'].includes(e.code)){e.preventDefault();setQty(s.storeQty+1);}},{signal});
 $('qt-hint').addEventListener('click',()=>{s.hintLevel=((s.hintLevel||0)%3)+1;renderTracker(s);},{signal});
 $('qt-math').addEventListener('click',()=>{const t=$('qt-math-text');t.hidden=!t.hidden;},{signal});
}
function setStore(open){const st=$('store-panel');if(st)st.hidden=!open;document.body.classList.toggle('store-open',!!open);}
function openStore(s){const st=$('store-panel');if(st&&st.hidden){setStore(true);renderStore(s);}}
export function renderStore(s){
 const qs=q(s);if(!qs||!$('store-panel'))return;const v=variantById(qs.variant),x=s.storeQty;
 $('sp-receipt').textContent=`RM${v.price} sebatang + RM${v.delivery} hantaran · ${formula(v)}`;
 $('sp-qty').textContent=String(x);
 $('sp-total').textContent=`Jumlah: RM${cost(v,x)} · Bajet: RM${v.budget}`;
}
function buy(s,{audio,SFX}={}){
 const qs=q(s);if(!qs||qs.bought||!qs.door)return;
 const v=variantById(qs.variant),x=s.storeQty,r=checkPurchase(v,x),msg=$('sp-msg');
 if(!r.ok){
  msg.className='bad';msg.textContent=r.code==='short'?`${x} papan tak cukup: jambatan perlukan ${NEED}.`:r.code==='budget'?`RM${r.cost} melebihi bajet RM${v.budget}.`:'Pilih bilangan papan.';
  SFX?.incorrect?.(audio);return; // nothing is spent
 }
 qs.bought={x,cost:r.cost};qs.planks=x;
 if(r.exact)awardAchievement('bajet-cermat');
 msg.className='good';msg.textContent=`Dibeli ${x} papan · RM${r.cost} · baki RM${r.change}`;
 SFX?.correct?.(audio);burst(s,STORE.doorX,STORE.feet-40,8,0xffe27a);
 s.writeSave();renderTracker(s);
 bubble(s,`${x} papan dibeli. Bawa ke jambatan.`);
 s.time.delayedCall(1400,()=>setStore(false));
}
function repair(s,{audio,SFX}={}){
 const qs=q(s);if(!qs||!qs.bought||qs.repaired||s.repairing)return;
 const g=GATES[0],missing=s.liftPlanks.slice(1);s.repairing=true;
 s.supply?.snapped?.setVisible(false);
 missing.forEach(a=>a.setVisible(true).setAlpha(1));
 planksDrop(s,missing,{audio,SFX});
 const done=()=>{
  s.repairing=false;qs.repaired=true;qs.planks=0;
  s.supply?.snapped?.setVisible(false);
  if(!s.gateBodies.lift)s.gateBodies.lift=s.platform({id:'lift-open',x:g.x,y:g.y,width:g.width});
  s.solvedGates.add('lift');
  const i=CHECKPOINTS.findIndex(c=>c.id==='cp-gate');if(i>=0){s.checkpointIndex=i;s.checkpointArts[i]?.setFrame(112);}
  s.writeSave();renderTracker(s);
  showCheckpointToast('Jambatan dibaiki · checkpoint disimpan');
  s.time.delayedCall(2300,()=>notify('Fungsi membantu kita merancang kos berdasarkan kuantiti.',2)); // after the checkpoint toast
 };
 // Planks land one by one (≈60 ms apart); walking on the deck is safe once all are down.
 s.time.delayedCall(matchMedia('(prefers-reduced-motion: reduce)').matches?0:missing.length*60+260,done);
}

// Restore world art from a saved quest (continue / reload).
export function applyQuestState(s){
 const qs=q(s);if(!qs||!s.supply)return;
 if(qs.key&&s.supply.key?.active)s.supply.key.destroy();
 if(qs.door)openDoor(s,false);
 if(qs.repaired)s.supply.snapped?.setVisible(false);
 renderTracker(s);
}

const HINTS={
 find:['Stor Kayu di sebelah kiri anda.','Pintu stor mungkin berkunci — cuba dahulu.','Kunci ada di pondok lama atas gerbang akar.'],
 key:['Pondok lama di atas gerbang akar, di belakang anda.','Panjat tangga di hujung barat laluan akar.','Selepas ambil kunci, turun di hujung timur gerbang: jalan pintas.'],
 open:['Bawa kunci ke pintu Stor Kayu.','Tekan E / Guna di pintu stor.','Stor di sebelah kiri jambatan.'],
 buy:[`Jambatan perlukan ${NEED} papan.`,'Kos = harga setiap papan × bilangan + hantaran (sekali).','Kira dahulu: C(5) = ? Bandingkan dengan bajet.'],
 repair:['Bawa papan ke tebing jambatan.','Berdiri di hujung jambatan dan tekan E / Guna.','Papan dipasang satu demi satu.'],
};
export function renderTracker(s){
 const tr=$('quest-tracker'),qs=q(s);if(!tr)return;
 const step=questStep(qs),playing=s.mode==='playing';
 tr.hidden=!playing||step==='none';if(tr.hidden)return;
 const v=variantById(qs.variant);
 $('qt-text').textContent={find:`Cari ${NEED} papan untuk baiki jambatan.`,key:'Cari kunci Stor Kayu di pondok lama.',open:'Buka Stor Kayu.',buy:`Beli papan secukupnya · bajet RM${v.budget}.`,repair:`Pasang ${NEED} papan di jambatan.`,done:'Jambatan dibaiki ✓'}[step];
 const inv=$('qt-inv');inv.hidden=!qs.bought;if(qs.bought)inv.textContent=qs.repaired?`Dibeli ${qs.bought.x} papan · RM${qs.bought.cost}`:`🪵 ${qs.planks} papan · baki RM${v.budget-qs.bought.cost}`;
 const hint=$('qt-hint-text'),lvl=s.hintLevel||0;
 $('qt-hint').hidden=step==='done';
 hint.hidden=!lvl||step==='done';if(lvl&&HINTS[step])hint.textContent=`Petunjuk ${lvl}: ${HINTS[step][lvl-1]}`;
 $('quest-tracker').classList.toggle('hint-open',!hint.hidden);$('quest-tracker').classList.toggle('has-hint-btn',!$('qt-hint').hidden);$('quest-tracker').scrollTop=0; // short screens: hint takes the status line's place
 if(s.lastHintStep!==step){s.lastHintStep=step;s.hintLevel=0;hint.hidden=true;}
 const m=$('qt-math');m.hidden=step!=='done'||!qs.bought;
 if(qs.bought)$('qt-math-text').textContent=`C(${qs.bought.x}) = ${v.price}(${qs.bought.x}) + ${v.delivery} = ${qs.bought.cost} · fungsi memetakan bilangan papan kepada kos.`;
}
// Called from the scene each frame: keep panels in sync with position/mode.
export function syncQuestUI(s){
 const qs=q(s),st=$('store-panel');
 if(st&&!st.hidden){const near=Math.abs(s.player.x-STORE.doorX)<90&&Math.abs(s.player.body.bottom-STORE.feet)<10;if(!near||s.mode!=='playing')setStore(false);}
 const tr=$('quest-tracker');if(tr){const show=s.mode==='playing'&&questStep(qs)!=='none';if(tr.hidden===show)renderTracker(s);}
}

// Game Feel V2: small, readable feedback built ONLY from frames that exist in
// Kenney Pixel Platformer's tilemap_packed.png (18 px, loaded as
// 'kpp_terrain_atlas'). Shared by 1-1 (Lorong), 1-2 (Jambatan), 1-3
// (GerbangSongsang). Visual only: no physics, save or puzzle state here.
//   151 coin (face)  152 coin (edge)  — the sheet's only coin frames.
// prefers-reduced-motion: no spin, no tweens, no particles (sounds still
// follow the player's own audio settings).
export const ATLAS='kpp_terrain_atlas',COIN_FACE=151,COIN_EDGE=152,COIN_SCALE=1.78;
const prefersReduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;

// Coin idle: a long face hold, then a quick turn to the edge frame and back.
// Reads as a glint/turn at ~1 Hz instead of a constant flicker.
export function ensureCoinSpin(scene){
  if(scene.anims.exists('coin-spin'))return;
  scene.anims.create({key:'coin-spin',repeat:-1,frames:[
    {key:ATLAS,frame:COIN_FACE,duration:1050},{key:ATLAS,frame:COIN_EDGE,duration:90},
    {key:ATLAS,frame:COIN_FACE,duration:60},{key:ATLAS,frame:COIN_EDGE,duration:90}]});
}
// Each coin starts at a different point so a row never turns in unison.
export function startCoin(scene,sprite,index=0,reduced=prefersReduced()){
  sprite.setFrame(COIN_FACE);
  if(reduced||!sprite.anims)return sprite;
  ensureCoinSpin(scene);
  sprite.play({key:'coin-spin',delay:(index*173)%1100});
  return sprite;
}

// One pooled emitter per scene (re-created after a scene restart).
function ensureDot(scene){
  if(scene.textures.exists('fx-dot'))return;
  const g=scene.make.graphics({x:0,y:0,add:false});
  g.fillStyle(0xffffff,1).fillCircle(4,4,4);g.generateTexture('fx-dot',8,8);g.destroy();
}
export function burst(scene,x,y,count=6,tint=0xffe27a,reduced=prefersReduced()){
  if(reduced||!count)return;
  ensureDot(scene);
  let e=scene.__feelEmitter;
  if(!e||!e.active){
    e=scene.add.particles(0,0,'fx-dot',{speed:{min:40,max:110},angle:{min:0,max:360},scale:{start:.55,end:0},alpha:{start:.9,end:0},lifespan:380,emitting:false,maxParticles:64}).setDepth(21);
    scene.__feelEmitter=e;scene.events.once('shutdown',()=>{scene.__feelEmitter=null;});
  }
  e.setParticleTint?.(tint);e.explode(Math.min(count,10),x,y);
}

// Pickup: the coin turns edge-on, rises and thins out (280 ms) + a few sparks.
// Purely cosmetic; callers update state/save BEFORE calling this.
export function coinPickup(scene,x,y,{frame=COIN_EDGE,scale=COIN_SCALE,reduced=prefersReduced()}={}){
  if(reduced)return;
  const g=scene.add.image(x,y,ATLAS,frame).setScale(scale).setDepth(15);
  scene.tweens.add({targets:g,y:y-30,scaleX:scale*.25,alpha:0,duration:280,ease:'Quad.out',onComplete:()=>g.destroy()});
  burst(scene,x,y,6,0xffe27a,false);
}

// Checkpoint flag (a 54x54 'tile' image, origin top-left): springs up from
// the ground in 280 ms, a few warm sparks, and the checkpoint chime.
export function checkpointFx(scene,art,{audio,SFX,reduced=prefersReduced()}={}){
  SFX?.checkpoint?.(audio);
  if(reduced||!art)return;
  const y0=art.getData?.('y0')??art.y,sy=art.getData?.('sy')??art.scaleY,h=art.displayHeight;
  art.setData?.('y0',y0);art.setData?.('sy',sy);
  scene.tweens.killTweensOf(art);
  art.setScale(art.scaleX,sy*.4).setY(y0+h*.6);
  scene.tweens.add({targets:art,scaleY:sy,y:y0,duration:280,ease:'Back.out'});
  burst(scene,art.x+art.displayWidth/2,y0+8,8,0xfee481,false);
}

// Bridge / deck planks (tile images, origin top-left) drop into place one by
// one with a little dust as each lands. Collision is NOT delayed by this.
export function planksDrop(scene,arts,{audio,SFX,reduced=prefersReduced(),sound=true}={}){
  if(sound)SFX?.bridge?.(audio);
  if(reduced)return;
  arts.forEach((a,i)=>{
    const y0=a.y;a.setY(y0-36).setAlpha(.2);
    scene.tweens.add({targets:a,y:y0,alpha:1,duration:240,delay:i*60,ease:'Back.out',
      onComplete:()=>burst(scene,a.x+a.displayWidth/2,y0+4,3,0xc9a27a,false)});
  });
}

// A round seal/indicator lighting up: one soft pop (scale 1 → 1.35 → 1).
export function sealPop(scene,shape,{reduced=prefersReduced()}={}){
  if(reduced||!shape)return;
  scene.tweens.add({targets:shape,scale:1.35,duration:140,yoyo:true,ease:'Quad.out'});
  burst(scene,shape.x,shape.y,8,0xe6c75f,false);
}

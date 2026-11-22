import { F_MOVING_PLATFORM } from './level.js';

export function advanceMovingPlatform(x, direction, deltaMs, config=F_MOVING_PLATFORM) {
  const dt=Math.max(0,Math.min(Number.isFinite(deltaMs)?deltaMs:0,50));
  let next=x+(direction<0?-1:1)*config.speed*dt/1000;
  let nextDirection=direction<0?-1:1;
  if(next>=config.maxX){next=config.maxX;nextDirection=-1;}
  else if(next<=config.minX){next=config.minX;nextDirection=1;}
  return {x:next,direction:nextDirection};
}

export function updateMovingPlatform(scene,deltaMs) {
  const platform=scene.fMovingPlatform;
  if(!platform||scene.mode!=='playing')return;
  const pBody=platform.body.body,playerBody=scene.player.body;
  const riding=playerBody.velocity.y>=0&&
    Math.abs(playerBody.bottom-pBody.top)<=2&&
    playerBody.right>pBody.left+1&&playerBody.left<pBody.right-1;
  const next=advanceMovingPlatform(platform.x,platform.direction,deltaMs,platform.config);
  const dx=next.x-platform.x;
  if(dx===0){platform.direction=next.direction;return;}
  platform.x=next.x;platform.direction=next.direction;
  platform.art.forEach((tile,index)=>tile.setX(platform.x+index*54));
  platform.body.setPosition(platform.x+platform.config.width/2,platform.config.y+platform.config.height/2);
  // Arcade's static collision body is refreshed from the same rendered
  // rectangle position before the next physics step.
  platform.body.body.updateFromGameObject();
  platform.body.body.position.y=platform.config.y;
  platform.body.body.updateCenter();
  if(riding){
    scene.player.setX(scene.player.x+dx);
    // Do not let the approach jump's horizontal momentum slide the rider off
    // while no direction is held. Arcade syncs this Game Object to its body
    // in the upcoming physics pre-step; updating both here would apply dx a
    // second time during Arcade postUpdate. Input later in this scene update
    // can still accelerate left or right to jump off intentionally.
    playerBody.setVelocityX(0);
  }
}

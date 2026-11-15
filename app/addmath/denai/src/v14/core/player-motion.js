import {MOTION} from '../level.js';
export function updatePlayer(scene,time,delta,{controls,audio,SFX,reducedMotion,BASE_SCALE,WATER,WATER_Y}) {
    const body=scene.player.body;
    const key=scene.keys;
    const left=key.left.isDown||key.a.isDown||controls.left;
    const right=key.right.isDown||key.d.isDown||controls.right;
    const up=key.up.isDown||key.w.isDown||controls.up;
    const down=key.down.isDown||key.s.isDown||controls.down;
    const jump=Phaser.Input.Keyboard.JustDown(key.jump)||controls.jump;
    const interact=Phaser.Input.Keyboard.JustDown(key.interact)||controls.interact;
    controls.jump=false;controls.interact=false;
    if(Phaser.Input.Keyboard.JustDown(key.restart)||controls.restart) {controls.restart=false;scene.respawn();return {respawned:true};}
    if(Phaser.Input.Keyboard.JustDown(key.resetCrate)||controls.resetCrate) {controls.resetCrate=false;scene.resetCrate(false);}
    if(jump) scene.jumpAt=time;
    if(body.blocked.down||body.touching.down) scene.groundedAt=time;
    const nearby=scene.ladderZones.find(zone=>scene.physics.overlap(scene.player,zone)&&Math.abs(scene.player.x-zone.x)<34)?.getData('ladder');
    if(!scene.climbing&&nearby&&time>scene.climbLockUntil&&(up||down)) {
      if((up&&body.bottom>nearby.top+2)||(down&&body.bottom<nearby.bottom-2)) {
        scene.climbing=nearby;body.setAllowGravity(false);body.setVelocity(0,0);
        body.reset(nearby.x,scene.player.y);
      }
    }
    if(scene.climbing) {
      const ladder=scene.climbing;
      body.setVelocity(0,(down?1:0)-(up?1:0)); body.velocity.y*=MOTION.climb;
      if(jump) {
        scene.climbing=null;scene.climbLockUntil=time+250;body.setAllowGravity(true);
        body.setVelocity((right?1:left?-1:0)*MOTION.speed,-MOTION.jump);scene.jumpAt=-1000;
        scene.dustBurst(scene.player.x,body.bottom,4);SFX.jump(audio);
      } else if(body.bottom<=ladder.top && up) {
        body.reset(ladder.x,ladder.top-MOTION.bodyHeight/2-1);
        scene.climbing=null;body.setAllowGravity(true);body.setVelocity(0,0);scene.climbLockUntil=time+180;
      } else if(body.bottom>=ladder.bottom && down) {
        body.reset(ladder.x,ladder.bottom-MOTION.bodyHeight/2-1);
        scene.climbing=null;body.setAllowGravity(true);body.setVelocity(0,0);scene.climbLockUntil=time+180;
      }
    } else {
      const direction=(right?1:0)-(left?1:0);
      const target=direction*MOTION.speed;
      const change=(direction?MOTION.acceleration:MOTION.braking)*Math.min(delta,40)/1000;
      body.setVelocityX(body.velocity.x+Phaser.Math.Clamp(target-body.velocity.x,-change,change));
      if(time-scene.jumpAt<MOTION.buffer&&time-scene.groundedAt<MOTION.coyote) {
        body.setVelocityY(-MOTION.jump);scene.jumpAt=-1000;scene.groundedAt=-1000;
        // V8 Phase 3: dust exactly at the moment the impulse is applied,
        // not merely when the 'jump' animation flag turns on — this line
        // only ever runs once per real jump, since jumpAt is immediately
        // reset to -1000 right after, so it can't re-trigger next frame.
        scene.dustBurst(scene.player.x,body.bottom,5);SFX.jump(audio);
      }
    }
    // V8 Phase 2 fix: the original `vy>60?'fall':...'run':'idle'` left a
    // dead zone (-35 <= vy <= 60) where the character is airborne but
    // shows neither jump nor fall — confirmed live (Playwright, frame-by-
    // frame velocity logging) to produce a one-to-three-frame flash of the
    // STANDING idle pose at the apex of every jump, and a "running in
    // midair" flash for a couple of frames after walking off any ledge
    // (the earliest part of an ordinary fall, before gravity has built vy
    // past 60). Fix: once airborne (not grounded, not climbing), the only
    // choice is jump (still rising, vy<-35, unchanged threshold/feel) or
    // fall (everything else airborne) — run/idle are grounded-only states.
    const grounded=body.blocked.down||body.touching.down;
    let anim=scene.climbing?'idle':body.velocity.y<-35?'jump':!grounded?'fall':Math.abs(body.velocity.x)>20?'run':'idle';
    if(reducedMotion) scene.visual.setTexture(`${anim}-00`);
    else scene.visual.play(anim,true);
    scene.visual.setOrigin(346/659,(anim==='jump'?463:anim==='fall'?461:525)/626);
    // Source frames (idle/run/jump/fall) are drawn facing left by default;
    // flip only when moving right so the sprite always faces its travel
    // direction instead of walking backward. Idle keeps whatever facing it
    // last had (velocity.x===0 skips the flip call entirely below).
    if(body.velocity.x!==0) scene.visual.setFlipX(body.velocity.x>0);
    // V8 Phase 2: subtle sprite-only squash/stretch on takeoff and landing
    // — scales only scene.visual (the animated sprite), never the physics
    // body/collider, so timing and collision are untouched. Skipped
    // entirely under prefers-reduced-motion, consistent with every other
    // motion effect in this file (camera lerp, bridge reveal).
    if(!reducedMotion) {
      if(anim==='jump'&&scene.lastAnim!=='jump') {
        scene.tweens.killTweensOf(scene.visual);
        scene.visual.setScale(BASE_SCALE*.88,BASE_SCALE*1.14);
        scene.tweens.add({targets:scene.visual,scaleX:BASE_SCALE,scaleY:BASE_SCALE,duration:160,ease:'Sine.out'});
      } else if(grounded&&!scene.lastGrounded&&!scene.climbing) {
        scene.tweens.killTweensOf(scene.visual);
        scene.visual.setScale(BASE_SCALE*1.16,BASE_SCALE*.82);
        scene.tweens.add({targets:scene.visual,scaleX:BASE_SCALE,scaleY:BASE_SCALE,duration:130,ease:'Sine.out'});
        // V8 Phase 3: landing dust, reusing this EXACT same already-proven
        // single-fire edge (grounded&&!lastGrounded&&!climbing) as the
        // Phase 2 squash — no separate detection logic, no risk of firing
        // on every grounded frame. Scaled modestly by impact speed
        // (scene.lastVy, captured below before being overwritten): a light
        // step-off landing (~small vy) gives a faint 2-particle puff, a
        // hard fall from height (vy approaching the 850 velocity cap)
        // gives a fuller 8-particle burst.
        const impact=Math.min(1,scene.lastVy/700);
        scene.dustBurst(scene.player.x,scene.player.body.bottom,Math.round(2+impact*6));
        SFX.land(audio,impact);
      }
    }
    scene.lastAnim=anim;scene.lastGrounded=grounded;scene.lastVy=body.velocity.y;
    // Camera pass: adaptive vertical framing. On main-route ground the
    // player sits low in the frame (less dirt, more route ahead); on high
    // platforms the camera eases down so the landing area below stays in
    // view. Eased, so it never snaps; camera only, physics untouched.
    // Near water (station chasm, Tebing Berliku) the frame always reaches the
    // water line, so the hazard under every gap is readable.
    // Stability pass: the framing target is only re-evaluated while standing
    // (or climbing), never mid-jump, and eases slowly — so a jump no longer
    // drags the camera up and down.
    {const cam=scene.cameras.main;if(cam._follow){
      if(grounded||scene.climbing||scene.camTgt===undefined){let tgt=body.bottom<1230?-110:(scene.followOffsetY??100);
        if(WATER.some(w=>scene.player.x>w.x-600&&scene.player.x<w.x+w.width+260)){const vh=scene.viewUnits?.h??645;tgt=Math.min(tgt,(body.bottom-30)+vh/2-(WATER_Y+40));}
        {const vh=scene.viewUnits?.h??645;tgt=Math.max(tgt,-(vh/2)+vh*.22+30);} // never push the player's head into the top 22% (HUD band)
        scene.camTgt=tgt;}
      scene.camOffY=scene.camOffY===undefined?scene.camTgt:scene.camOffY+(scene.camTgt-scene.camOffY)*Math.min(1,(reducedMotion?1000:delta)/600);
      cam.setFollowOffset(-85,scene.camOffY);}}
    scene.syncVisual();
return {body,left,right,up,down,jump,interact,nearby,grounded};
}

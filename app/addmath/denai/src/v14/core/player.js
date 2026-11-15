import {MOTION} from '../level.js';
export function createPlayer(scene,{SPAWN,BASE_SCALE,reducedMotion,controls}) {
    // A separate rectangular body means animation transparency never changes collisions.
    scene.player = scene.add.rectangle(SPAWN.x, SPAWN.feet - MOTION.bodyHeight/2, MOTION.bodyWidth, MOTION.bodyHeight, 0xffffff, 0);
    scene.physics.add.existing(scene.player);
    scene.player.body.setSize(MOTION.bodyWidth, MOTION.bodyHeight).setMaxVelocity(MOTION.speed, 850).setCollideWorldBounds(true);
    scene.events.on('postupdate',()=>{if(scene.player&&!scene.celebration&&scene.mode!=='complete')scene.syncVisual();});
    scene.visual = scene.add.sprite(SPAWN.x, SPAWN.feet, 'idle-00').setOrigin(346/659, 525/626).setScale(BASE_SCALE).setDepth(20);
    for (const [key,count,fps] of [['idle',12,8],['run',10,14],['jump',1,1],['fall',1,1]]) {
      if (!scene.anims.exists(key)) scene.anims.create({ key, frames:Array.from({length:count},(_,i)=>({key:`${key}-${String(i).padStart(2,'0')}`})), frameRate:fps, repeat:-1 });
    }
    if(reducedMotion) scene.visual.setTexture('idle-00');
    else scene.visual.play('idle');
    scene.physics.add.collider(scene.player, scene.solids, undefined, (_player, platform) => {
      if (scene.climbing && platform.getData('oneWay')) return false;
      // Decks are one-way. Solid street geometry is never bypassed.
      if (platform.getData('oneWay')) return scene.player.body.velocity.y >= 0 && scene.player.body.prev.y + MOTION.bodyHeight <= platform.body.top + 8;
      return true;
    });
    // V9 Phase 1: a real solid collider between the player and the crate —
    // without this the two dynamic bodies simply pass through each other
    // (no amount of touching.left/right logic in update() means anything
    // without the collider that actually sets those flags). This is what
    // makes pushing reliable regardless of approach speed: Arcade resolves
    // the overlap every physics step, so the crate can never be walked
    // through, only pushed.
    if (scene.crate) scene.physics.add.collider(scene.player, scene.crate);
    scene.keys = scene.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',up:'UP',down:'DOWN',a:'A',d:'D',w:'W',s:'S',jump:'SPACE',interact:'E',restart:'R',resetCrate:'C'});
    // Latch even a very short tap between render frames; held keys do not auto-jump.
    for(const action of ['jump','interact','restart','resetCrate']) scene.keys[action].on('down',()=>{
      if(scene.mode==='playing') controls[action]=true;
    });
    scene.input.keyboard.removeCapture(['W','A','S','D','E','R','C','ESC']);

}

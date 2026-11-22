import test from 'node:test';
import assert from 'node:assert/strict';
import { MOTION } from '../../app/addmath/rooftop/src/v12/level.js';
import { F_MOVING_PLATFORM, SURFACES, CHECKPOINTS } from '../../app/addmath/rooftop/src/v12/level.js';
import { advanceMovingPlatform } from '../../app/addmath/rooftop/src/v12/moving-platform.js';
import { readFileSync } from 'node:fs';

test('F platform remains inside the cave and within a verified jump from the waiting shelf',()=>{
  const wait=SURFACES.find(s=>s.id==='F-step2');
  const roof=SURFACES.find(s=>s.id==='F-cave-roof');
  const maxRise=MOTION.jump**2/(2*1400);
  assert.equal(F_MOVING_PLATFORM.minX,6150);
  assert.equal(F_MOVING_PLATFORM.maxX,6440);
  assert.equal(F_MOVING_PLATFORM.y,816);
  assert.equal(F_MOVING_PLATFORM.width,108);
  assert.ok(F_MOVING_PLATFORM.y<wait.y&&wait.y-F_MOVING_PLATFORM.y<maxRise);
  assert.ok(F_MOVING_PLATFORM.minX>=roof.x);
  assert.ok(F_MOVING_PLATFORM.maxX+F_MOVING_PLATFORM.width<=roof.x+roof.width);
  assert.ok(F_MOVING_PLATFORM.y+F_MOVING_PLATFORM.height<roof.y);
  assert.deepEqual(CHECKPOINTS.find(c=>c.id==='f-platform-wait'),{id:'f-platform-wait',x:6084,feet:864,requires:['water-crossing']});
  assert.ok(6084+MOTION.bodyWidth/2<F_MOVING_PLATFORM.minX);
});

test('platform turns continuously at both safe bounds and caps frame travel',()=>{
  const right=advanceMovingPlatform(6438,1,50);
  assert.deepEqual(right,{x:6440,direction:-1});
  const left=advanceMovingPlatform(6152,-1,50);
  assert.deepEqual(left,{x:6150,direction:1});
  const capped=advanceMovingPlatform(6150,1,1000);
  assert.equal(capped.x,6153.6);
  assert.ok(capped.x>=F_MOVING_PLATFORM.minX&&capped.x<=F_MOVING_PLATFORM.maxX);
  const afterTurn=advanceMovingPlatform(right.x,right.direction,16);
  assert.ok(afterTurn.x<right.x&&Math.abs(afterTurn.x-right.x)<2);
});

test('physics constants remain unchanged and platform rendering uses existing timber deck tiles',()=>{
  assert.deepEqual(MOTION,{speed:280,acceleration:2100,braking:2500,jump:520,climb:150,coyote:110,buffer:130,bodyWidth:28,bodyHeight:60});
  const environment=readFileSync(new URL('../../app/addmath/rooftop/src/v12/environment.js',import.meta.url),'utf8');
  const updater=readFileSync(new URL('../../app/addmath/rooftop/src/v12/moving-platform.js',import.meta.url),'utf8');
  assert.match(environment,/s\.deck\(\{x:fDeckX,y:F_MOVING_PLATFORM\.y,width:F_MOVING_PLATFORM\.width\}\)/);
  assert.match(environment,/s\.platform\(\{id:F_MOVING_PLATFORM\.id/);
  assert.match(updater,/body\.body\.updateFromGameObject\(\)/);
  assert.match(updater,/if\(riding\)/);
});

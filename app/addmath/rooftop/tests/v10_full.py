"""Fresh-save A–G traversal, real keyboard input; no avatar or scene-state writes."""
from pathlib import Path
import json,time,sys
from playwright.sync_api import sync_playwright
STAGE=int(sys.argv[1]) if len(sys.argv)>1 else 5
MOBILE='--mobile' in sys.argv
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/full-world-implementation'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 ctx=b.new_context(viewport={'width':844,'height':390} if MOBILE else {'width':1440,'height':1000},has_touch=MOBILE,is_mobile=MOBILE,record_video_dir=str(OUT/'video') if STAGE==5 else None)
 pg=ctx.new_page();errors=[];console=[];failed=[];events=[];start=time.monotonic()
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda m:console.append(m.text) if m.type=='error' else None);pg.on('requestfailed',lambda r:failed.append(r.url))
 pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/v10.html?test',wait_until='networkidle');pg.click('#start')
 keys=pg.keyboard
 if MOBILE:
  cdp=ctx.new_cdp_session(pg);points={}
  class TouchControls:
   directions={'d':'right','a':'left','w':'up','s':'down'}
   def touch(self,selector,id,down):
    if down:
     box=pg.locator(selector).bounding_box();points[id]={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':id}
    else:ended=points.pop(id)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart' if down else 'touchEnd','touchPoints':list(points.values()) if down else [ended]})
   def down(self,key):self.touch('[data-hold="'+self.directions[key]+'"]',1,True)
   def up(self,key):self.touch('[data-hold="'+self.directions[key]+'"]',1,False)
   def press(self,key):
    if key=='Space':
     self.touch('[data-action="jump"]',2,True);pg.wait_for_timeout(50);self.touch('[data-action="jump"]',2,False)
    else:pg.tap({'e':'[data-action="interact"]','ArrowRight':'#dial-more','Enter':'#dial-test','c':'[data-action="resetCrate"]','r':'[data-action="restart"]'}[key])
  keys=TouchControls()
 def state():return pg.evaluate('''()=>{let s=rooftop.scene,b=s.player.body;return {x:s.player.x,feet:b.bottom,mode:s.mode,gates:[...s.solvedGates],coins:[...s.collectedCoinIds],cp:s.checkpointIndex,elapsed:s.elapsed}}''')
 def wait(expr,timeout=15000):
  try:pg.wait_for_function('()=>{let s=rooftop.scene,b=s.player.body;return '+expr+'}',timeout=timeout)
  except Exception:
   print('FAIL',expr,state(),errors,flush=True);pg.screenshot(path=str(OUT/'screenshots'/f'failure-batch{STAGE}.png'));raise
 def walk(x):
  right=state()['x']<x;k='d' if right else 'a';keys.down(k);wait(f's.player.x {">=" if right else "<="} {x}');keys.up(k);wait('Math.abs(b.velocity.x)<1')
  for _ in range(20):
   delta=x-state()['x']
   if abs(delta)<8:break
   k='d' if delta>0 else 'a';keys.down(k);pg.wait_for_timeout(45);keys.up(k);wait('Math.abs(b.velocity.x)<1')
 def jump_to(x,feet):
  right=state()['x']<x;k='d' if right else 'a';keys.down(k);keys.press('Space');wait('b.velocity.y<0');wait(f's.player.x {">=" if right else "<="} {x}');keys.up(k);wait('b.blocked.down || b.touching.down');assert abs(state()['feet']-feet)<3,state()
 def climb(key,feet):
  keys.down(key);wait(f'{"b.bottom<=" if key=="w" else "b.bottom>="}{feet+1 if key=="w" else feet-1} && !s.climbing');keys.up(key);wait('b.blocked.down');assert abs(state()['feet']-feet)<3,state()
 def use():keys.press('e');wait('s.mode==="mechanism"')
 def end_animation():wait('s.mode==="playing" && !s.dialBusy')
 def shot(name):pg.screenshot(path=str(OUT/'screenshots'/f'{"mobile-" if MOBILE else ""}{name}.png'))
 def log(name):events.append({'name':name,**state()});print(name,state(),flush=True)
 wait('b.blocked.down');shot('A-garden');walk(205);jump_to(365,1296);walk(580)
 keys.down('d');wait('s.player.x>=600');keys.press('Space');wait('b.velocity.y<0');wait('s.player.x>=800');keys.up('d');wait('b.blocked.down')
 walk(960);jump_to(1060,1242);jump_to(1170,1188);jump_to(1280,1134);walk(1605);jump_to(1720,1080);walk(1920)
 use();pg.click('#dial-test');assert not state()['gates'];shot('B-gear-wrong')
 for _ in range(4):keys.press('ArrowRight')
 keys.press('Enter');end_animation();assert pg.evaluate('!!rooftop.scene.gateBodies.gear');shot('B-gear-open')
 walk(2460);jump_to(2630,1026);jump_to(2740,972);walk(3160);log('B to D; C skipped')
 use();pg.click('[data-token="2"]');pg.click('#dial-test');wait('!s.dialBusy');assert '4, bukan 10' in pg.inner_text('#mechanism-feedback');assert not pg.evaluate('!!rooftop.scene.gateBodies.block');shot('D-block-wrong')
 pg.click('[data-token="4"]');pg.click('#dial-test');end_animation();assert pg.evaluate('!!rooftop.scene.gateBodies.block');shot('D-block-open')
 walk(3830);climb('w',756);walk(3980);keys.press('e');wait('s.mode==="note"');pg.click('#secret-note-close');wait('s.mode==="playing"');shot('D-service-note');walk(3834);climb('s',972)
 walk(3930);use();pg.click('[data-order="gf"]');pg.click('#dial-test');end_animation();assert '2 → 4 → 9' in pg.evaluate('rooftop.scene.readouts.primer.text')
 use();pg.click('[data-order="fg"]');pg.click('#dial-test');end_animation();assert '2 → 5 → 13' in pg.evaluate('rooftop.scene.readouts.primer.text');shot('D-primer');log('D workshop passed')
 if STAGE>=3:
  walk(4212);climb('w',756)
  # Miss the roof gap deliberately, use its real recovery shelf and ladder.
  walk(4480);wait('b.blocked.down && Math.abs(b.bottom-1080)<3');walk(4374);climb('w',756);shot('E-recovery')
  walk(4360);keys.down('d');wait('s.player.x>=4380');keys.press('Space');wait('b.velocity.y<0');wait('s.player.x>=4580');keys.up('d');wait('b.blocked.down');assert abs(state()['feet']-810)<3,state()
  walk(4698);climb('w',648);walk(4790);use();pg.click('[data-order="gf"]');pg.click('#dial-test');wait('!s.dialBusy');assert '15' in pg.inner_text('#mechanism-feedback');assert not pg.evaluate('!!rooftop.scene.gateBodies.pipe');shot('E-order-wrong')
  pg.click('[data-order="fg"]');pg.click('#dial-test');end_animation();assert pg.evaluate('!!rooftop.scene.gateBodies.pipe');shot('E-water-flow');walk(5480);log('E waterworks passed')
 if STAGE>=4:
  walk(5610);jump_to(5800,702);walk(6520);wait('b.blocked.down && Math.abs(b.bottom-918)<3');walk(6588);climb('s',1242)
  walk(6620);use();pg.click('#dial-test');assert 'bukan 7' in pg.inner_text('#mechanism-feedback')
  for _ in range(3):pg.click('#dial-more')
  pg.click('#dial-test');end_animation();assert pg.evaluate('rooftop.scene.inverseSolved && rooftop.scene.discoveredSecrets.has("secret-cave-treasure")');shot('F-cave-inverse')
  walk(6588);climb('w',918);walk(7210);wait('b.blocked.down');shot('F-hill');log('F cave and return passed')
 if STAGE>=5:
  walk(7610);wait('b.blocked.down');use();pg.click('#dial-test');assert 'bukan 17' in pg.inner_text('#mechanism-feedback')
  for _ in range(5):pg.click('#dial-more')
  pg.click('#dial-test');end_animation();assert pg.evaluate('rooftop.scene.finalLatches.input && !rooftop.scene.gateBodies.final');shot('G-first-latch')
  # Reload after one latch: no unsafe bridge, no erased earned latch.
  pg.reload(wait_until='networkidle');pg.click('#continue-btn');wait('b.blocked.down');assert pg.evaluate('rooftop.scene.finalLatches.input && !rooftop.scene.gateBodies.final')
  walk(7610);use();pg.click('[data-order="gf"]');pg.click('#dial-test');wait('!s.dialBusy');assert '9' in pg.inner_text('#mechanism-feedback')
  pg.click('[data-order="fg"]');pg.click('#dial-test');end_animation();assert pg.evaluate('!!rooftop.scene.gateBodies.final');shot('G-bridge-open')
  walk(8316);keys.press('e');wait('s.mode==="complete"');shot('G-home-complete');assert pg.evaluate('JSON.parse(localStorage.getItem("lorong-save-v10")).completed')
  log('Full A to G complete')
 result={'stage':STAGE,'passed':True,'mobile':MOBILE,'freshStart':True,'teleports':False,'wallSeconds':round(time.monotonic()-start,2),'events':events,'errors':errors,'consoleErrors':console,'failedRequests':failed,'final':state()}
 assert not errors and not console and not failed,result
 (OUT/'logs'/f'batch{STAGE}-{"mobile" if MOBILE else "natural"}.json').write_text(json.dumps(result,indent=2));ctx.close();b.close()

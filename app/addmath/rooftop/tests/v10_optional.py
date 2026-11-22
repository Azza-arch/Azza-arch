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
  right=state()['x']<x;k='d' if right else 'a';keys.press('Space');wait('b.velocity.y<0');keys.down(k);wait(f's.player.x {">=" if right else "<="} {x}');keys.up(k);wait('b.blocked.down || b.touching.down');assert abs(state()['feet']-feet)<3,state()
 def climb(key,feet):
  keys.down(key);wait(f'{"b.bottom<=" if key=="w" else "b.bottom>="}{feet+1 if key=="w" else feet-1} && !s.climbing');keys.up(key);wait('b.blocked.down');assert abs(state()['feet']-feet)<3,state()
 def use():keys.press('e');wait('s.mode==="mechanism"')
 def end_animation():wait('s.mode==="playing" && !s.dialBusy')
 def shot(name):pg.screenshot(path=str(OUT/'screenshots'/f'{"mobile-" if MOBILE else ""}{name}.png'))
 def log(name):events.append({'name':name,**state()});print(name,state(),flush=True)
 wait('b.blocked.down');initial=pg.evaluate('rooftop.scene.crate.x');walk(170);assert pg.evaluate('rooftop.scene.crate.x')==initial
 keys.down('d');wait('s.crateSwitchActive');keys.up('d');wait('Math.abs(b.velocity.x)<1 && Math.abs(s.crate.body.velocity.x)<1');shot('A-plate')
 cx=pg.evaluate('rooftop.scene.crate.x');walk(cx-48);jump_to(cx-5,1248);jump_to(490,1176);assert 'coin-a' in state()['coins'];shot('A-optional-ledge')
 keys.press('r');wait('s.player.x<100 && b.blocked.down');keys.press('c');wait('Math.abs(s.crate.x-270)<1 && !s.crateSwitchActive')
 walk(205);jump_to(365,1296);walk(600);keys.down('d');wait('s.player.x>=620');keys.press('Space');wait('b.velocity.y<0');wait('s.player.x>=800');keys.up('d');wait('b.blocked.down')
 walk(960);jump_to(1060,1242);jump_to(1170,1188);jump_to(1280,1134);walk(1566);climb('w',810);walk(1730);use()
 for i in range(4):
  pg.click('#dial-test')
  if i<3:pg.click('#dial-more')
 end_animation();assert pg.evaluate('rooftop.scene.mappingDone');shot('C-cafe')
 walk(1900);keys.press('e');wait('s.discoveredSecrets.has("secret-oyen")');walk(1836);climb('s',1080);climb('w',810);walk(1566);climb('s',1134)
 pg.reload(wait_until='networkidle');pg.click('#continue-btn');wait('b.blocked.down');assert pg.evaluate('rooftop.scene.mappingDone && rooftop.scene.discoveredSecrets.has("secret-oyen") && rooftop.scene.collectedCoinIds.has("coin-a")');log('Crate, ledge, optional C and saved discoveries passed')
 assert not errors and not console and not failed
 (OUT/'logs/optional-regression.json').write_text(json.dumps({'passed':True,'teleports':False,'events':events,'errors':errors},indent=2));ctx.close();b.close()

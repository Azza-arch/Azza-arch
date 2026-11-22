from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/level-v12/phase5';SHOTS=OUT/'screenshots';SHOTS.mkdir(parents=True,exist_ok=True);URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
HOOK="""(()=>{Object.defineProperty(window,'Phaser',{configurable:true,set(P){let G=P.Game;P.Game=new Proxy(G,{construct(T,a,N){let sc=a[0].scene,O=Array.isArray(sc)?sc[0]:sc;if(typeof O==='function'){class Q extends O{create(...x){let r=super.create(...x);window.__s=this;return r}}a[0].scene=Array.isArray(sc)?[Q,...sc.slice(1)]:Q}return Reflect.construct(T,a,N)}});Object.defineProperty(window,'Phaser',{value:P,writable:true,configurable:true})}})})();"""
errs=[];con=[];failed=[];events=[]
def ev(page,expr):return page.evaluate("(()=>{const s=window.__s,b=s.player.body;return "+expr+"})()")
def state(page):return ev(page,"({x:Math.round(s.player.x),feet:Math.round(b.bottom),mode:s.mode,grounded:!!b.blocked.down,solved:[...s.solvedGates],checkpoint:s.checkpointIndex,water:s.waterworksState})")
def wait(page,expr,timeout=12000):
 end=time.monotonic()+timeout/1000
 while time.monotonic()<end:
  if ev(page,expr):return
  page.wait_for_timeout(40)
 raise AssertionError({'waiting':expr,'state':state(page)})
def walk(page,x):
 q=state(page);k='d' if x>q['x'] else 'a';page.keyboard.down(k);wait(page,f's.player.x {">=" if k=="d" else "<="} {x}');page.keyboard.up(k);wait(page,'Math.abs(b.velocity.x)<1');events.append({'walk':x,**state(page)})
def jump(page,x):
 q=state(page);k='d' if x>q['x'] else 'a';page.keyboard.down(k);page.keyboard.press('Space');wait(page,'b.velocity.y<0');wait(page,f's.player.x {">=" if k=="d" else "<="} {x}');page.keyboard.up(k);wait(page,'b.blocked.down||b.touching.down');events.append({'jump':x,**state(page)})
def climb(page,direction,feet):
 key='w' if direction=='up' else 's';page.keyboard.down(key);wait(page,'!!s.climbing',3000);wait(page,f'!s.climbing&&Math.abs(b.bottom-{feet})<4&&b.blocked.down',12000);page.keyboard.up(key);events.append({'climb':direction,'feet':feet,**state(page)})
def snap(page,name):page.screenshot(path=str(SHOTS/(name+'.png')))
def interact(page):page.keyboard.press('e');page.wait_for_timeout(160)
def wait_mode(page,mode,timeout=8000):wait(page,f's.mode==="{mode}"',timeout)
with sync_playwright() as p:
 br=p.chromium.launch(headless=True);ctx=br.new_context(viewport={'width':1440,'height':900},device_scale_factor=1);page=ctx.new_page();page.add_init_script(HOOK);page.on('pageerror',lambda e:errs.append(str(e)));page.on('console',lambda m:con.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
 page.goto(URL,wait_until='networkidle');page.locator('#start').wait_for();page.click('#start');wait(page,'b.blocked.down');snap(page,'natural-a-start')
 # Required A route: step, gap, and B approach; optional crate and C branch skipped.
 walk(page,220);jump(page,390);walk(page,1020);jump(page,1240);wait(page,'Math.abs(b.bottom-1242)<5');walk(page,1400);jump(page,1540);jump(page,1690);jump(page,1900);snap(page,'natural-b-arrival')
 walk(page,2000);interact(page);wait_mode(page,'mechanism');page.click('[data-token="2"]');page.click('#dial-test');wait_mode(page,'playing');assert not ev(page,'!!s.gateBodies.lift');assert ev(page,'s.liftPlanks.some(a=>a.y===1188)')
 interact(page);wait_mode(page,'mechanism');page.click('[data-token="3"]');page.click('#dial-test');wait(page,'s.mode==="playing"&&!!s.gateBodies.lift');assert ev(page,'s.liftPlanks.every(a=>Math.abs(a.y-1080)<1)');snap(page,'natural-b-safe')
 walk(page,2520);jump(page,2700);jump(page,2900);walk(page,3070);interact(page);wait_mode(page,'playing');assert '= 4' in ev(page,'s.numberReadout.text')
 walk(page,3150);interact(page);wait_mode(page,'playing');assert '= 7' in ev(page,'s.numberReadout.text')
 walk(page,3237);interact(page);wait(page,'s.mode==="playing"&&!!s.gateBodies["number-span"]');assert '= 10' in ev(page,'s.numberReadout.text');snap(page,'natural-d-safe')
 walk(page,3915);walk(page,4104);walk(page,4220);jump(page,4320);jump(page,4480);walk(page,4806);walk(page,4914);interact(page);assert ev(page,'s.waterOrder')=='gf';page.keyboard.press('r');wait(page,'Math.abs(s.player.x-4122)<2&&Math.abs(b.bottom-972)<3');walk(page,4220);jump(page,4320);jump(page,4480);walk(page,4428);interact(page);assert ev(page,'s.waterOrder')=='fg';walk(page,5100);jump(page,5238);interact(page);wait(page,'s.waterworksState==="NON_TARGET_RESULT"||s.waterworksState==="TARGET_REACHED"',15000);assert ev(page,'s.lastWaterResult.output')==19;wait(page,'s.waterworksState==="CROSSING_SAFE"',12000);snap(page,'natural-e-crossing-safe');walk(page,5598);wait(page,'s.checkpointIndex===8',6000);snap(page,'natural-a-to-e-checkpoint')
 result={'passed':not(errs or con or failed),'route':'natural keyboard A main path, B lift, D blocks and crossing, E function stages and safe crossing','optionalBranches':'crate bonus, C, D service skipped','events':events,'state':state(page),'pageErrors':errs,'consoleErrors':con,'failedRequests':failed};(OUT/'a-to-e-regression.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result,indent=2));assert result['passed'];ctx.close();br.close()

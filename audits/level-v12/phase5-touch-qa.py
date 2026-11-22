from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/level-v12/phase5';SHOTS=OUT/'screenshots';SHOTS.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
base={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
D={**base,'checkpointId':'d-machine','solvedGateIds':['lift']}
HOOK="""(()=>{Object.defineProperty(window,'Phaser',{configurable:true,set(P){let G=P.Game;P.Game=new Proxy(G,{construct(T,a,N){let sc=a[0].scene,O=Array.isArray(sc)?sc[0]:sc;if(typeof O==='function'){class Q extends O{create(...x){let r=super.create(...x);window.__s=this;return r}}a[0].scene=Array.isArray(sc)?[Q,...sc.slice(1)]:Q}return Reflect.construct(T,a,N)}});Object.defineProperty(window,'Phaser',{value:P,writable:true,configurable:true})}})})();"""
def hold(page,sel,ms):
 l=page.locator(sel);b=l.bounding_box();x=b['x']+b['width']/2;y=b['y']+b['height']/2;page._cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':3}]});page.wait_for_timeout(ms);page._cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(180)
def boot(page,data):
 page.goto(URL,wait_until='networkidle');page.evaluate('(d)=>localStorage.setItem("denai-save-v12",JSON.stringify(d))',data);page.reload(wait_until='networkidle');page.click('#continue-btn');page.wait_for_timeout(250);assert page.locator('#touch-controls').is_visible()
def state(page):return page.evaluate("(()=>{let s=window.__s;return {mode:s.mode,x:s.player.x,solved:[...s.solvedGates],lift:!!s.gateBodies.lift,number:!!s.gateBodies['number-span'],out:s.numberReadout.text};})()")
def until(page,pred,timeout=6000):
 end=time.monotonic()+timeout/1000
 while time.monotonic()<end:
  s=state(page)
  if pred(s):return s
  page.wait_for_timeout(50)
 raise AssertionError(state(page))
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce');page=c.new_page();page._cdp=c.new_cdp_session(page);page.add_init_script(HOOK);errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 boot(page,base);page.locator('[data-action="interact"]').tap();page.locator('#mechanism:not([hidden])').wait_for();page.locator('[data-token="3"]').tap();page.locator('#dial-test').tap();s=until(page,lambda s:s['lift']);page.screenshot(path=str(SHOTS/'mobile-b-target.png'))
 boot(page,D);hold(page,'[data-hold="left"]',650);page.locator('[data-action="interact"]').tap();until(page,lambda s:s['mode']=='playing');s=state(page);assert not s['number'] and '= 4' in s['out'],s;page.screenshot(path=str(SHOTS/'mobile-d-retry.png'))
 hold(page,'[data-hold="right"]',430);page.locator('[data-action="interact"]').tap();s=until(page,lambda s:s['number']);assert 'number-span' in s['solved'] and '= 10' in s['out'],s;page.screenshot(path=str(SHOTS/'mobile-d-safe.png'))
 result={'passed':not errs,'mobileTouchControls':True,'reducedMotion':'reduce','B':'input3 activates lift','D':'block2 retries; block4 activates crossing','pageErrors':errs};(OUT/'phase5-touch-qa.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result,indent=2));assert result['passed'];c.close();b.close()

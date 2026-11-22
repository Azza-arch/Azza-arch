from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/level-v12/phase5';SHOTS=OUT/'screenshots';SHOTS.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
B={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
D={**B,'checkpointId':'d-machine','solvedGateIds':['lift']}
HOOK="""(()=>{Object.defineProperty(window,'Phaser',{configurable:true,set(P){const G=P.Game;P.Game=new Proxy(G,{construct(T,a,N){let s=a[0].scene,O=Array.isArray(s)?s[0]:s;if(typeof O==='function'){class Q extends O{create(...x){let r=super.create(...x);window.__s=this;return r}}a[0].scene=Array.isArray(s)?[Q,...s.slice(1)]:Q}return Reflect.construct(T,a,N)}});Object.defineProperty(window,'Phaser',{value:P,writable:true,configurable:true})}})})();"""
errs=[];con=[];failed=[]
def boot(page,save):
 page.goto(URL,wait_until='networkidle');page.evaluate('(x)=>localStorage.setItem("denai-save-v12",JSON.stringify(x))',save);page.reload(wait_until='networkidle');page.click('#continue-btn');page.wait_for_timeout(350)
def snap(page,n):page.screenshot(path=str(SHOTS/(n+'.png')))
def info(page):return page.evaluate("""(()=>{let s=window.__s;return {mode:s.mode,x:+s.player.x.toFixed(1),feet:+s.player.body.bottom.toFixed(1),terminal:s.nearestTerminal()?.id,machineBusy:s.numberMachineBusy,numberSelected:s.numberSelected,solved:[...s.solvedGates],liftY:s.liftPlanks.map(a=>+a.y.toFixed(1)),liftCollision:!!s.gateBodies.lift,liftReadoutVisible:s.liftReadout.visible,numberY:s.numberSpan.map(a=>+a.y.toFixed(1)),numberCollision:!!s.gateBodies['number-span'],numberX:s.numberBlockArts.map(a=>a?+a.x.toFixed(1):null),numberReadout:s.numberReadout.text,numberReadoutVisible:s.numberReadout.visible,save:JSON.parse(localStorage.getItem('denai-save-v12')||'{}')};})()""")
def hold(page,k,ms):page.keyboard.down(k);page.wait_for_timeout(ms);page.keyboard.up(k);page.wait_for_timeout(180)
def waitmode(page,mode,timeout=6000):
 end=time.monotonic()+timeout/1000
 while time.monotonic()<end:
  if page.evaluate('window.__s.mode')==mode:return
  page.wait_for_timeout(50)
 raise AssertionError({'expectedMode':mode,'actual':info(page)})
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);ctx=b.new_context(viewport={'width':1440,'height':900});page=ctx.new_page();page.add_init_script(HOOK)
 page.on('pageerror',lambda e:errs.append(str(e)));page.on('console',lambda m:con.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
 # Zone B: inspect console, test a non-target preset, retry target, verify crossing.
 boot(page,B);assert info(page)['x']==2000
 page.keyboard.press('e');page.wait_for_selector('#mechanism:not([hidden])');snap(page,'b-console-before-test');page.click('#dial-hint');assert 'preset mesin' in page.locator('#mechanism-feedback').inner_text()
 for value,output,y in [(0,1,1272),(1,3,1230),(2,5,1188),(4,9,1146)]:
  page.click(f'[data-token="{value}"]');assert f'f({value}) = {output}' in page.locator('#mechanism-value').inner_text();page.click('#dial-test')
  if value==2:page.wait_for_timeout(120);snap(page,'b-nontarget-moving')
  waitmode(page,'playing',5000);x=info(page);assert x['solved']==[] and not x['liftCollision'] and all(abs(n-y)<1 for n in x['liftY']) and x['liftReadoutVisible'],{'value':value,**x}
  snap(page,f'b-nontarget-code-{output}')
  page.keyboard.press('e');page.wait_for_selector('#mechanism:not([hidden])')
 page.click('[data-token="3"]');assert 'f(3) = 7' in page.locator('#mechanism-value').inner_text();page.click('#dial-test');page.wait_for_timeout(120);snap(page,'b-target-moving')
 waitmode(page,'playing',7000);x=info(page);assert 'lift' in x['solved'] and x['liftCollision'] and x['liftReadoutVisible'] and all(abs(y-1080)<1 for y in x['liftY']),x
 snap(page,'b-safe-crossing')
 assert x['save']['checkpointId']=='b-lift' and 'lift' in x['save']['solvedGateIds']
 page.keyboard.press('Escape');page.wait_for_selector('#paused[open]');page.click('#resume');page.wait_for_timeout(150);page.reload(wait_until='networkidle');page.click('#continue-btn');page.wait_for_timeout(300);x=info(page);assert x['liftCollision'] and 'lift' in x['solved'] and x['x']==2000,x;snap(page,'b-continue-safe')
 # D: physical rack input 2 and 3 produce visible non-target outputs and return home.
 boot(page,D);hold(page,'d',400);page.keyboard.press('e');page.wait_for_selector('#mechanism:not([hidden])');assert page.locator('#token-options').is_hidden();page.click('#dial-hint');assert '3x−2' in page.locator('#mechanism-feedback').inner_text();snap(page,'d-machine-explanation');page.click('#dial-close');page.wait_for_timeout(150)
 hold(page,'a',1200);x=info(page);assert x['x']<3129,x
 page.keyboard.press('e');waitmode(page,'playing',5000);x=info(page);assert x['numberX'][2]==3102 and not x['numberCollision'] and '= 4' in x['numberReadout'] and x['numberReadoutVisible'],x;snap(page,'d-input-2-output-4')
 hold(page,'d',400);page.keyboard.press('e');waitmode(page,'playing',5000);x=info(page);assert x['numberX'][3]==3156 and not x['numberCollision'] and '= 7' in x['numberReadout'] and x['numberReadoutVisible'],x;snap(page,'d-input-3-output-7')
 hold(page,'d',240);x=info(page);page.keyboard.press('e');waitmode(page,'playing',7000);x=info(page);assert x['numberCollision'] and x['numberReadoutVisible'] and 'number-span' in x['solved'] and all(abs(y-972)<1 for y in x['numberY']) and '= 10' in x['numberReadout'],x;snap(page,'d-input-4-safe-crossing')
 page.reload(wait_until='networkidle');page.click('#continue-btn');page.wait_for_timeout(250);x=info(page);assert x['numberCollision'] and 'number-span' in x['solved'],x;snap(page,'d-continue-safe')
 result={'passed':not(errs or con or failed),'B':'f(0..4) -> outputs 1,3,5,7,9; non-target presets are visible and non-colliding; f(3)=7 adds collision after the lift settles; pause/Continue restores safely','D':'g(2)=4 and g(3)=7 move existing blocks to the socket, show output, return home and allow retry; g(4)=10 opens crossing after settle; hint and Continue verified','pageErrors':errs,'consoleErrors':con,'failedRequests':failed}
 (OUT/'phase5-browser-qa.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result,indent=2));assert result['passed']
 ctx.close();b.close()


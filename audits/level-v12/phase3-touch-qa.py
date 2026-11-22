from pathlib import Path
import json, time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'audits/level-v12/phase3/screenshots'
OUT.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
SAVE={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'f-platform-wait','solvedGateIds':['lift','number-span','water-crossing'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':'fg','waterworksState':'CROSSING_SAFE'}
INSTR="""(()=>{Object.defineProperty(window,'Phaser',{configurable:true,set(P){const Game=P.Game;P.Game=new Proxy(Game,{construct(T,args,N){const cfg=args[0],ss=cfg.scene,O=Array.isArray(ss)?ss[0]:ss;class Q extends O{create(...a){const r=super.create(...a);window.__phase3Scene=this;return r}}cfg.scene=Array.isArray(ss)?[Q,...ss.slice(1)]:Q;return Reflect.construct(T,args,N)}});Object.defineProperty(window,'Phaser',{value:P,writable:true,configurable:true})}})})();"""

def snap(page,name):page.screenshot(path=str(OUT/name))
def state(page):return page.evaluate("(()=>{const s=window.__phase3Scene,p=s?.player?.body,f=s?.fMovingPlatform,b=f?.body?.body;return s?{mode:s.mode,playerX:s.player.x,playerBottom:p.bottom,grounded:p.blocked.down,platformX:f.x,platformArtLeft:f.art[0].x,platformLeft:b.left,platformRight:b.right,platformTop:b.top,direction:f.direction}:null})()")
def wait_for(page,predicate,timeout=7000):
 end=time.monotonic()+timeout/1000
 while time.monotonic()<end:
  s=state(page)
  if s and predicate(s):return s
  page.wait_for_timeout(35)
 raise AssertionError(f'timed out: {state(page)}')
def touch_hold(page,selectors,duration):
 points=[]
 for i,selector in enumerate(selectors,1):
  box=page.locator(selector).bounding_box()
  points.append({'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':i})
 page._cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points})
 page.wait_for_timeout(duration)
 page._cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 page.wait_for_timeout(250)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,record_video_dir=str(OUT),record_video_size={'width':390,'height':844})
 page=context.new_page();page._cdp=context.new_cdp_session(page);page.add_init_script(INSTR)
 errors=[];console_errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' else None);page.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure}) if 'ERR_ABORTED' not in (r.failure or '') else None)
 page.goto(URL,wait_until='networkidle');page.evaluate('d=>localStorage.setItem("denai-save-v12",JSON.stringify(d))',SAVE)
 page.reload(wait_until='networkidle');page.locator('#continue-btn:not([hidden])').wait_for();page.click('#continue-btn')
 wait_for(page,lambda s:s is not None);assert page.locator('#touch-controls').is_visible()
 wait_for(page,lambda s:s['platformX']<6170 and s['direction']>0,timeout=12000)
 touch_hold(page,['[data-hold="right"]','[data-action="jump"]'],800)
 boarded=wait_for(page,lambda s:s['grounded'] and abs(s['playerBottom']-817)<3 and s['playerX']+14>s['platformLeft'] and s['playerX']-14<s['platformRight'],timeout=5000)
 snap(page,'mobile-touch-platform-boarded.png')
 relative0=boarded['playerX']-boarded['platformX']
 page.wait_for_timeout(700);carried=state(page);snap(page,'mobile-touch-platform-carried.png')
 relative1=carried['playerX']-carried['platformX'];assert abs(relative1-relative0)<16,(boarded,carried)
 wait_for(page,lambda s:s['platformX']>6425 and s['direction']<0,timeout=8000)
 snap(page,'mobile-touch-platform-turnaround.png')
 touch_hold(page,['[data-hold="right"]','[data-action="jump"]'],600)
 landed=wait_for(page,lambda s:s['grounded'] and 970<=s['playerBottom']<=1030 and 6568<=s['playerX']<=6892,timeout=5000)
 snap(page,'mobile-touch-east-landing.png')
 assert abs(landed['platformArtLeft']-landed['platformLeft'])<.1
 result={'passed':not errors and not console_errors and not failed,'viewport':'390x844','touchBoardAndExit':True,'carriedOffsetBefore':relative0,'carriedOffsetAfter':relative1,'eastLanding':landed,'pageErrors':errors,'consoleErrors':console_errors,'failedRequests':failed}
 (OUT/'touch-qa.json').write_text(json.dumps(result,indent=2),encoding='utf8')
 print(json.dumps(result,indent=2));assert result['passed']
 video=page.video.path();context.close()
 Path(video).replace(OUT/'moving-platform-touch-traversal.webm')
 browser.close()

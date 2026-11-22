from pathlib import Path
import ast,json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/denai-v12/phase6-5b1';SHOTS=OUT/'screenshots'
source=(ROOT/'audits/level-v12/phase5-browser-qa.py').read_text(encoding='utf-8-sig')
tree=ast.parse(source);HOOK=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='HOOK' for t in n.targets))
BASE={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
def ev(p,s):return p.evaluate('(()=>{const s=window.__s,b=s.player.body;return '+s+'})()')
def wait(p,s,timeout=10):
 end=time.monotonic()+timeout
 while time.monotonic()<end:
  if ev(p,s):return
  p.wait_for_timeout(30)
 raise AssertionError({'wait':s,'state':state(p)})
def state(p):return ev(p,'({x:s.player.x,feet:b.bottom,mode:s.mode,input:s.bInput,last:s.bLastTrial,terminal:s.nearestTerminal()?.id,ys:s.liftPlanks.map(a=>a.y),collider:!!s.gateBodies.lift,solved:[...s.solvedGates]})')
def move(p,x,touch,attempt=0):
 direction='right' if ev(p,'s.player.x')<x else 'left'
 if touch:
  box=p.locator('[data-hold="'+direction+'"]').bounding_box();cdp=p.context.new_cdp_session(p)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}]})
 else:p.keyboard.down('d' if direction=='right' else 'a')
 wait(p,f's.player.x {">=" if direction=="right" else "<="} {x}')
 if touch:cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
 else:p.keyboard.up('d' if direction=='right' else 'a')
 wait(p,'Math.abs(b.velocity.x)<1')
 if abs(ev(p,'s.player.x')-x)>22 and attempt<5:move(p,x,touch,attempt+1)
def use(p,touch):
 if touch:p.locator('[data-action="interact"]').tap()
 else:p.keyboard.press('e')
def click(p,sel,touch):
 if touch:p.locator(sel).tap()
 else:p.locator(sel).click()
def shot(p,name):p.screenshot(path=str(SHOTS/(name+'.png')))
def reload(p):
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'s.mode==="playing"&&b.blocked.down')
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for name,w,h,touch in [('desktop',1440,900,False),('portrait',390,844,True),('landscape',844,390,True)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  p=ctx.new_page();p.add_init_script(HOOK);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  p.on('requestfailed',lambda r:errors.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
  p.goto(URL,wait_until='networkidle');p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',BASE);reload(p)
  assert ev(p,'s.bInput===null&&s.bLastTrial===null');assert p.locator('#mechanism').is_hidden()
  move(p,1960,touch);shot(p,name+'-unselected')
  # Lever without selection cannot evaluate or create a body.
  move(p,2070,touch);use(p,touch);p.wait_for_timeout(100);assert ev(p,'s.bLastTrial===null&&!s.gateBodies.lift')
  trials=[]
  for value in [0,1,2,4,3]:
   move(p,1960,touch);assert ev(p,'s.nearestTerminal()?.id')=='b-selector',state(p)
   for _ in range(5):
    if ev(p,'s.bInput')==value:break
    use(p,touch);p.wait_for_timeout(70)
   assert ev(p,'s.bInput')==value
   assert ev(p,'s.mode')=='playing';assert p.locator('#mechanism').is_hidden()
   if value==1:
    before=state(p);click(p,'#b-help',touch);wait(p,'s.mode==="mechanism"')
    assert p.locator('#token-options').is_hidden();click(p,'#dial-hint',touch);click(p,'#dial-solution',touch)
    assert 'x=3' in p.locator('#worked-solution').inner_text()
    click(p,'#dial-close',touch);wait(p,'s.mode==="playing"');assert ev(p,'s.bInput')==1
    assert p.evaluate('document.activeElement.id')=='game'
    click(p,'#pause',touch);p.wait_for_timeout(100);click(p,'#resume',touch);assert ev(p,'s.bInput')==1
    reload(p);assert ev(p,'s.bInput')==1;assert ev(p,'s.bLastTrial.output')==1
   move(p,2070,touch);assert ev(p,'s.nearestTerminal().id')=='lift'
   use(p,touch);wait(p,'s.mode==="mechanism-transition"')
   assert not ev(p,'!!s.gateBodies.lift')
   if value==2:
    click(p,'#pause',touch);ys=ev(p,'s.liftPlanks.map(a=>a.y)');p.wait_for_timeout(180)
    assert ev(p,'s.liftPlanks.map(a=>a.y)')==ys
    click(p,'#resume',touch)
   if value==3:shot(p,name+'-moving')
   wait(p,'s.mode==="playing"&&!s.liftExperimentBusy');q=state(p);trials.append(q)
   expected={0:1272,1:1230,2:1188,3:1080,4:1146}[value]
   assert all(abs(y-expected)<.01 for y in q['ys']);assert q['collider']==(value==3)
   assert q['last']=={'input':value,'output':2*value+1}
   shot(p,name+('-target' if value==3 else '-trial-'+str(value)))
   if value==4:
    reload(p);assert ev(p,'s.bInput')==4;assert ev(p,'s.liftPlanks.every(a=>a.y===1146)&&!s.gateBodies.lift')
  reload(p);assert ev(p,'!!s.gateBodies.lift&&s.liftPlanks.every(a=>a.y===1080)')
  assert ev(p,'s.player.x')<2160
  move(p,2520,touch);wait(p,'b.blocked.down&&Math.abs(b.bottom-1080)<2');shot(p,name+'-crossed')
  results[name]={'passed':not errors,'trials':trials,'crossed':state(p),'errors':errors}
  assert not errors;ctx.close()
 browser.close()
(OUT/'browser-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results,indent=2))

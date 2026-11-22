"""Independent B then D verification; existing mechanics are tested through UI."""
from pathlib import Path
import ast,json,time,sys
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/level-v12/phase5-verification';OUT.mkdir(exist_ok=True)
source=(ROOT/'audits/level-v12/phase5-browser-qa.py').read_text(encoding='utf-8-sig')
tree=ast.parse(source)
HOOK=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='HOOK' for t in n.targets))
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
ZONE=sys.argv[1];CAPTURE='--before' in sys.argv
BASE={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift' if ZONE=='B' else 'd-machine','solvedGateIds':[] if ZONE=='B' else ['lift'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
S='window.__s'
def ev(p,s):return p.evaluate(f'(()=>{{const s={S};return {s}}})()')
def wait(p,s):
 end=time.monotonic()+12
 while time.monotonic()<end:
  if ev(p,s):return
  p.wait_for_timeout(40)
 raise AssertionError({'waiting':s,'mode':ev(p,'s.mode'),'x':ev(p,'s.player.x')})
def shot(p,name):p.screenshot(path=str(OUT/(name+'.png')))
def action(p,selector,touch):
 if touch:p.locator(selector).tap()
 else:p.locator(selector).click()
def move(p,x,touch):
 direction='right' if ev(p,'s.player.x')<x else 'left'
 if touch:
  r=p.locator(f'[data-hold="{direction}"]').bounding_box();cdp=p.context.new_cdp_session(p)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x']+r['width']/2,'y':r['y']+r['height']/2,'id':1}]})
 else:p.keyboard.down('d' if direction=='right' else 'a')
 wait(p,f's.player.x {">=" if direction=="right" else "<="} {x}')
 if touch:cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
 else:p.keyboard.up('d' if direction=='right' else 'a')
 wait(p,'Math.abs(s.player.body.velocity.x)<1')
def interact(p,touch):
 if touch:p.locator('[data-action="interact"]').tap()
 else:p.keyboard.press('e')
def boot(p):
 p.goto(URL,wait_until='networkidle');p.evaluate('d=>localStorage.setItem("denai-save-v12",JSON.stringify(d))',BASE)
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'s.mode==="playing"');p.wait_for_timeout(300)
def reload(p):
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'s.mode==="playing"');p.wait_for_timeout(250)
def open_console(p,touch):
 interact(p,touch);p.locator('#mechanism:not([hidden])').wait_for()
def help_check(p,touch):
 action(p,'#dial-hint',touch);assert p.locator('#mechanism-feedback').inner_text()
 action(p,'#dial-solution',touch);assert p.locator('#worked-solution').is_visible()
 assert ('x=3' if ZONE=='B' else 'x=4') in p.locator('#worked-solution').inner_text()
 shot(p,ZONE+'-'+('touch' if touch else 'desktop')+'-explanation')
 action(p,'#dial-close',touch);open_console(p,touch)
 assert p.locator('#worked-solution').is_hidden(),'stale worked solution on reopening'
def pause_motion(p,touch,expr):
 action(p,'#pause',touch);p.locator('#paused[open]').wait_for();before=ev(p,expr);p.wait_for_timeout(250);assert ev(p,expr)==before
 action(p,'#resume',touch);wait(p,'s.mode==="playing"')
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for device,w,h,touch in [('desktop',1440,900,False),('touch',390,844,True)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  p=ctx.new_page();p.add_init_script(HOOK);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  p.on('requestfailed',lambda r:errors.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
  boot(p)
  if CAPTURE:
   shot(p,ZONE+'-'+device+'-before');
   if ZONE=='D':move(p,3370,touch)
   open_console(p,touch);shot(p,ZONE+'-'+device+'-before-console');ctx.close();continue
  samples=[]
  if ZONE=='B':
   open_console(p,touch);help_check(p,touch)
   for value,output,y in [(0,1,1272),(1,3,1230),(2,5,1188),(4,9,1146)]:
    action(p,f'[data-token="{value}"]',touch);assert f'f({value}) = {output}' in p.locator('#mechanism-value').inner_text()
    action(p,'#dial-test',touch);wait(p,'s.mode==="playing"')
    assert not ev(p,'!!s.gateBodies.lift');assert ev(p,f's.liftPlanks.every(a=>Math.abs(a.y-{y})<1)')
    assert ev(p,'s.liftReadout.visible');assert f'f({value}) = {output}' in p.locator('#notice.show').inner_text();shot(p,f'B-{device}-output-{output}');samples.append([value,output,y])
    open_console(p,touch)
   action(p,'[data-token="3"]',touch);action(p,'#dial-test',touch)
   assert not ev(p,'!!s.gateBodies.lift');pause_motion(p,touch,'s.liftPlanks.map(a=>a.y)')
   assert ev(p,'!!s.gateBodies.lift&&s.liftPlanks.every(a=>a.y===1080)');shot(p,'B-'+device+'-after')
   # Normal-speed movement must cross the real newly colliding deck.
   move(p,2510,touch);assert abs(ev(p,'s.player.body.bottom')-1080)<2
   shot(p,'B-'+device+'-crossed');reload(p);assert ev(p,'!!s.gateBodies.lift');assert abs(ev(p,'s.player.body.bottom')-1080)<2
   # Reload mid-experiment must not invent an unlocked bridge.
   boot(p);open_console(p,touch);action(p,'[data-token="0"]',touch);action(p,'#dial-test',touch);reload(p)
   assert not ev(p,'!!s.gateBodies.lift');assert ev(p,'s.mode==="playing"')
  else:
   move(p,3370,touch);open_console(p,touch);assert p.locator('#token-options').is_hidden();help_check(p,touch);action(p,'#dial-close',touch)
   for value,x,output,home in [(2,3100,4,3102),(3,3160,7,3156),(2,3100,4,3102),(4,3210,10,3210)]:
    move(p,x,touch);assert ev(p,'s.nearestTerminal()?.value')==value
    interact(p,touch);assert not ev(p,'!!s.gateBodies["number-span"]')
    if value==4:pause_motion(p,touch,'s.numberBlockArts[4].x')
    else:wait(p,'s.mode==="playing"')
    assert f'= {output}' in ev(p,'s.numberReadout.text');assert ev(p,'s.numberReadout.visible')
    if value!=4:
     assert ev(p,f's.numberBlockArts[{value}].x')==home and not ev(p,'!!s.gateBodies["number-span"]')
     assert f'g({value}) = {output}' in p.locator('#notice.show').inner_text()
    else:assert ev(p,'!!s.gateBodies["number-span"]&&s.numberSpan.every(a=>a.y===972)')
    shot(p,f'D-{device}-output-{output}');samples.append([value,output])
   shot(p,'D-'+device+'-after');move(p,3880,touch);assert abs(ev(p,'s.player.body.bottom')-972)<2;shot(p,'D-'+device+'-crossed')
   reload(p);assert ev(p,'!!s.gateBodies["number-span"]');assert abs(ev(p,'s.player.body.bottom')-972)<2
   boot(p);move(p,3100,touch);interact(p,touch);reload(p);assert not ev(p,'!!s.gateBodies["number-span"]')
  assert not errors,errors
  results[device]={'passed':True,'inputOutput':samples,'hintAndExplanation':True,'retry':True,'pauseDuringMotion':True,'collisionAfterSettle':True,'naturalCrossing':True,'saveContinue':True,'reloadDuringExperiment':True,'errors':errors}
  ctx.close()
 browser.close()
if not CAPTURE:(OUT/(ZONE+'-results.json')).write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))

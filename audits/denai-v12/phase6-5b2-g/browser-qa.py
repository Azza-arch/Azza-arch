from pathlib import Path
import ast,json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/denai-v12/phase6-5b2-g';SHOTS=OUT/'screenshots'
source=(ROOT/'audits/level-v12/phase5-browser-qa.py').read_text(encoding='utf-8-sig')
tree=ast.parse(source);HOOK=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='HOOK' for t in n.targets))
BASE={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'g-river','solvedGateIds':['lift','number-span','water-crossing'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':'fg','waterworksState':'CROSSING_SAFE'}
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
SIGN,LEVER,GOAL=7363,7423,8316
def ev(p,s):return p.evaluate('(()=>{const s=window.__s,b=s.player.body;return '+s+'})()')
def wait(p,s,timeout=10):
 end=time.monotonic()+timeout
 while time.monotonic()<end:
  if ev(p,s):return
  p.wait_for_timeout(30)
 raise AssertionError({'wait':s,'state':ev(p,'({x:s.player.x,feet:b.bottom,mode:s.mode,sel:s.riverInputSel,order:s.riverOrderSel})')})
def walk(p,x,touch):
 if touch:
  direction='right' if ev(p,'s.player.x')<x else 'left'
  box=p.locator('[data-hold="'+direction+'"]').bounding_box();cdp=p.context.new_cdp_session(p)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}]})
  wait(p,f's.player.x {">=" if direction=="right" else "<="} {x}')
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
 else:
  k='d' if x>ev(p,'s.player.x') else 'a'
  p.keyboard.down(k);wait(p,f's.player.x {">=" if k=="d" else "<="} {x}');p.keyboard.up(k)
 wait(p,'Math.abs(b.velocity.x)<1')
def jump(p,x,touch):
 # Keyboard for both runs — traversal is pre-existing cross-zone
 # platforming (same disclosed scope choice as Phase 6.5B2-E's QA: CDP
 # multi-touch does not reliably synthesize the simultaneous second
 # pointerdown a real two-thumb jump needs). Touch is still exercised for
 # every Zone G interaction itself via use()/nudgeTo() below.
 k='d' if x>ev(p,'s.player.x') else 'a'
 p.keyboard.down(k);p.keyboard.press('Space');wait(p,'b.velocity.y<0');wait(p,f's.player.x {">=" if k=="d" else "<="} {x}');p.keyboard.up(k)
 wait(p,'b.blocked.down||b.touching.down')
def use(p,touch):
 if touch:p.locator('[data-action="interact"]').tap()
 else:p.keyboard.press('e')
def nudgeTo(p,x,touch,terminal_id,tries=16):
 # The existing sign/lever art (reused per the brief) sits only 60px
 # apart; a 25px interaction radius each (tightened this phase — see the
 # final report) avoids overlap but leaves little slack for movement
 # overshoot, so final positioning is a short nudge loop rather than one
 # coarse walk. A real player does this naturally by watching the prompt.
 walk(p,x,touch)
 for _ in range(tries):
  if ev(p,'s.nearestTerminal()?.id')==terminal_id:return
  cur=ev(p,'s.player.x');k='d' if x>cur else 'a'
  if touch:
   direction='right' if x>cur else 'left'
   box=p.locator('[data-hold="'+direction+'"]').bounding_box();cdp=p.context.new_cdp_session(p)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}]})
   p.wait_for_timeout(35)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
  else:
   p.keyboard.down(k);p.wait_for_timeout(35);p.keyboard.up(k)
  p.wait_for_timeout(60)
 raise AssertionError({'nudgeTo failed':terminal_id,'x':ev(p,'s.player.x'),'terminal':ev(p,'s.nearestTerminal()')})
def shot(p,name):p.screenshot(path=str(SHOTS/(name+'.png')))
def reload(p):
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'(s.mode==="playing"&&b.blocked.down)||s.mode==="complete"')
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for name,w,h,touch in [('desktop',1440,900,False),('portrait',390,844,True)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  p=ctx.new_page();p.add_init_script(HOOK);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  p.on('requestfailed',lambda r:errors.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
  p.goto(URL,wait_until='networkidle');p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',BASE);reload(p)
  assert ev(p,'s.riverInputSel')is None;assert not ev(p,'s.solvedGates.has("river-input")')
  assert p.locator('#mechanism').is_hidden();assert not p.locator('#g-control').is_hidden()
  shot(p,name+'-g-locked')
  nudgeTo(p,SIGN,touch,'river-select')
  shot(p,name+'-first-selector')
  for _ in range(4):use(p,touch);p.wait_for_timeout(80)  # cycles to 3 (wrong)
  assert ev(p,'s.riverInputSel')==3
  nudgeTo(p,LEVER,touch,'river-lever')
  use(p,touch);p.wait_for_timeout(150)
  assert ev(p,'s.riverLastInputTrial')=={'input':3,'output':9}
  assert not ev(p,'s.solvedGates.has("river-input")')
  shot(p,name+'-first-non-target')
  nudgeTo(p,SIGN,touch,'river-select')
  for _ in range(2):use(p,touch);p.wait_for_timeout(80)  # 3 -> 4 -> 5 (correct)
  assert ev(p,'s.riverInputSel')==5
  nudgeTo(p,LEVER,touch,'river-lever')
  use(p,touch);wait(p,'s.solvedGates.has("river-input")')
  assert ev(p,'s.riverLastInputTrial')=={'input':5,'output':17}
  wait(p,'s.mode==="playing"')
  shot(p,name+'-first-activated')
  assert not ev(p,'s.solvedGates.has("river-crossing")')  # bridge still locked
  # Bantuan is reachable mid-sequence and never mutates progress.
  p.locator('#g-help').click();p.wait_for_timeout(100)
  assert ev(p,'s.mode')=='mechanism';assert 'F' in p.locator('#mechanism-rule').inner_text()
  p.locator('#dial-close').click();p.wait_for_timeout(100)
  assert ev(p,'s.mode')=='playing';assert ev(p,'s.solvedGates.has("river-input")')
  nudgeTo(p,SIGN,touch,'river-select')
  shot(p,name+'-order-selection')
  use(p,touch);p.wait_for_timeout(80)  # first press -> 'gf' (wrong), never auto-reveals 'fg'
  assert ev(p,'s.riverOrderSel')=='gf'
  nudgeTo(p,LEVER,touch,'river-lever')
  use(p,touch);p.wait_for_timeout(150)
  assert ev(p,'s.riverLastOrderTrial')=={'order':'gf','intermediate':4,'output':9}
  assert not ev(p,'s.solvedGates.has("river-composition")')
  shot(p,name+'-second-non-target')
  nudgeTo(p,SIGN,touch,'river-select')
  use(p,touch);p.wait_for_timeout(80)  # gf -> fg (correct)
  assert ev(p,'s.riverOrderSel')=='fg'
  nudgeTo(p,LEVER,touch,'river-lever')
  use(p,touch);wait(p,'!!s.riverLastOrderTrial&&s.riverLastOrderTrial.order==="fg"')
  assert ev(p,'s.riverLastOrderTrial')=={'order':'fg','intermediate':5,'output':13}
  shot(p,name+'-final-activation')
  # No early collider while the bridge is tweening.
  assert not ev(p,'!!s.gateBodies["river-crossing"]')
  shot(p,name+'-bridge-moving')
  wait(p,'s.solvedGates.has("river-crossing")',8)
  assert ev(p,'!!s.gateBodies["river-crossing"]')  # collider only after settle
  wait(p,'s.mode==="playing"')
  shot(p,name+'-safe-bridge')
  # Natural keyboard/touch crossing to the real goal (no fixture teleport).
  walk(p,7900,touch);walk(p,8170,touch);jump(p,GOAL,touch)
  use(p,touch);wait(p,'s.levelCompleted',5)
  assert ev(p,'s.mode')=='complete'
  shot(p,name+'-real-goal')
  reload(p)
  assert ev(p,'s.solvedGates.has("river-crossing")');assert ev(p,'!!s.gateBodies["river-crossing"]')
  assert ev(p,'s.levelCompleted')
  results[name]={'passed':not errors,'errors':errors}
  assert not errors;ctx.close()
 browser.close()
with sync_playwright() as pw:
 # Pause mid-second-lock-activation (interrupted-animation safety), and
 # partial-progress Continue (lock 1 solved, lock 2 untested).
 browser=pw.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':1440,'height':900})
 p=ctx.new_page();p.add_init_script(HOOK);errs=[]
 p.on('pageerror',lambda e:errs.append(str(e)));p.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
 p.goto(URL,wait_until='networkidle');p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',BASE);reload(p)
 nudgeTo(p,SIGN,False,'river-select')
 for _ in range(6):use(p,False);p.wait_for_timeout(60)
 nudgeTo(p,LEVER,False,'river-lever');use(p,False);wait(p,'s.solvedGates.has("river-input")')
 wait(p,'s.mode==="playing"')
 reload(p)
 assert ev(p,'s.solvedGates.has("river-input")');assert not ev(p,'s.solvedGates.has("river-composition")')
 assert ev(p,'s.riverLever.angle')==-24  # partial-lock lever angle restored
 nudgeTo(p,SIGN,False,'river-select')
 for _ in range(2):use(p,False);p.wait_for_timeout(60)  # gf -> fg (correct, needed to reach the animated path)
 assert ev(p,'s.riverOrderSel')=='fg'
 nudgeTo(p,LEVER,False,'river-lever');use(p,False);wait(p,'s.mode==="mechanism-transition"')
 p.locator('#pause').click();before=ev(p,'s.riverBridge[0].y');p.wait_for_timeout(200)
 assert ev(p,'s.riverBridge[0].y')==before
 p.locator('#resume').click();wait(p,'s.mode==="playing"',8)
 results['pause-and-partial-continue']={'passed':not errs,'errors':errs}
 assert not errs
 ctx.close();browser.close()
(OUT/'browser-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results,indent=2))

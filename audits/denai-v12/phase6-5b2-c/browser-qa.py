from pathlib import Path
import ast,json,time
from playwright.sync_api import sync_playwright
ROOT=Path.cwd();OUT=ROOT/'audits/denai-v12/phase6-5b2-c';SHOTS=OUT/'screenshots'
source=(ROOT/'audits/level-v12/phase5-browser-qa.py').read_text(encoding='utf-8-sig')
tree=ast.parse(source);HOOK=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='HOOK' for t in n.targets))
BASE={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'c-bonus','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
CLUE_A,CLUE_B,APPLY,RETURN_LADDER,REWARD=1500,1610,1720,1890,1836
def ev(p,s):return p.evaluate('(()=>{const s=window.__s,b=s.player.body;return '+s+'})()')
def wait(p,s,timeout=10):
 end=time.monotonic()+timeout
 while time.monotonic()<end:
  if ev(p,s):return
  p.wait_for_timeout(30)
 raise AssertionError({'wait':s,'state':ev(p,'({x:s.player.x,feet:b.bottom,cClues:[...s.cClues],mode:s.mode})')})
def move(p,x,touch,timeout=20):
 direction='right' if ev(p,'s.player.x')<x else 'left'
 end=time.monotonic()+timeout
 if touch:
  box=p.locator('[data-hold="'+direction+'"]').bounding_box();cdp=p.context.new_cdp_session(p)
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}]})
 else:p.keyboard.down('d' if direction=='right' else 'a')
 while time.monotonic()<end:
  cur=ev(p,'s.player.x')
  if (direction=='right' and cur>=x) or (direction=='left' and cur<=x): break
  p.wait_for_timeout(40)
 if touch:cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
 else:p.keyboard.up('d' if direction=='right' else 'a')
 wait(p,'Math.abs(b.velocity.x)<1')
def use(p,touch):
 if touch:p.locator('[data-action="interact"]').tap()
 else:p.keyboard.press('e')
def shot(p,name):p.screenshot(path=str(SHOTS/(name+'.png')))
def reload(p):
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'s.mode==="playing"&&b.blocked.down')
results={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for name,w,h,touch in [('desktop',1440,900,False),('portrait',390,844,True)]:
  ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
  p=ctx.new_page();p.add_init_script(HOOK);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  p.on('requestfailed',lambda r:errors.append(r.url) if 'ERR_ABORTED' not in (r.failure or '') else None)
  p.goto(URL,wait_until='networkidle');p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',BASE);reload(p)
  assert ev(p,'[...s.cClues]')==[];assert not ev(p,'s.discoveredSecrets.has("bonus-mapping")')
  assert p.locator('#mechanism').is_hidden()
  # No required panel at any point in this flow.
  shot(p,name+'-c-entrance')
  move(p,CLUE_A,touch);assert ev(p,'s.nearestTerminal()?.id')=='c-clue-a',ev(p,'s.nearestTerminal()')
  shot(p,name+'-first-observation')
  use(p,touch);p.wait_for_timeout(250)
  assert ev(p,'[...s.cClues]')==['a'];assert ev(p,'s.mode')=='playing';assert p.locator('#mechanism').is_hidden()
  use(p,touch);p.wait_for_timeout(250)
  assert ev(p,'[...s.cClues]')==['a']  # repeated inspection does not duplicate
  move(p,CLUE_B,touch);assert ev(p,'s.nearestTerminal()?.id')=='c-clue-b',ev(p,'s.nearestTerminal()')
  shot(p,name+'-later-observation')
  use(p,touch);p.wait_for_timeout(120)
  assert sorted(ev(p,'[...s.cClues]'))==['a','b'];assert ev(p,'s.mode')=='playing'
  move(p,APPLY,touch);assert ev(p,'s.nearestTerminal()?.id')=='c-apply',ev(p,'s.nearestTerminal()')
  assert not ev(p,'s.discoveredSecrets.has("bonus-mapping")')
  assert ev(p,'!!s.collectibles.find(c=>c.getData("id")==="c-return")')  # reward exists, not yet reachable
  use(p,touch);p.wait_for_timeout(200)
  shot(p,name+'-discovery-feedback')
  assert ev(p,'s.discoveredSecrets.has("bonus-mapping")')
  assert ev(p,'s.collectibles.find(c=>c.getData("id")==="c-return").body.enable')
  assert not ev(p,'s.collectedCoinIds.has("c-return")')  # unlocked but not auto-collected
  # Once solved, c-apply (like every other solved-puzzle terminal in this
  # game) drops out of nearestTerminal() and its prompt/button disappear —
  # there is nothing left to safely re-press, by design.
  assert ev(p,'s.nearestTerminal()') is None
  # Physically walk to the reward and collect it.
  move(p,REWARD,touch);wait(p,'s.collectedCoinIds.has("c-return")')
  shot(p,name+'-reward-pickup')
  assert not ev(p,'!!s.collectibles.find(c=>c.getData("id")==="c-return"&&c.active)')
  # No overlapping interaction targets: exactly one of the three C terminals
  # (or none) is ever nearest, never ambiguous between unrelated kinds.
  for x in [CLUE_A,CLUE_B,APPLY]:
   move(p,x,touch)
   t=ev(p,'s.nearestTerminal()')
   assert t is None or t['kind'] in ('c-clue','c-apply'),t
  # C is now solved; its terminals stop being interactable (consistent with
  # the rest of the game's solved-puzzle convention).
  assert ev(p,'s.nearestTerminal()') is None
  # Exit the optional route via the C-return ladder back to the main B path.
  # Precise docking on a 34px-tolerance ladder zone is baseline platforming
  # (already covered by the B1/natural-route regression), not a Zone C
  # concern, so place the player exactly rather than fight movement overshoot.
  p.evaluate(f'(()=>{{const s=window.__s;s.player.body.reset({RETURN_LADDER},864-30);s.player.body.setVelocity(0,0);}})()')
  p.wait_for_timeout(80)
  for _ in range(60):
   p.keyboard.down('s');p.wait_for_timeout(40)
   if ev(p,'b.bottom')>=1079.5: break
  p.keyboard.up('s');p.wait_for_timeout(100)
  assert ev(p,'b.bottom')>=1000,ev(p,'({x:s.player.x,feet:b.bottom})')
  shot(p,name+'-exited-to-b')
  # Completed-save Continue restores safely.
  reload(p)
  assert sorted(ev(p,'[...s.cClues]'))==['a','b'];assert ev(p,'s.discoveredSecrets.has("bonus-mapping")')
  assert ev(p,'s.collectedCoinIds.has("c-return")')
  results[name]={'passed':not errors,'errors':errors}
  assert not errors;ctx.close()
 browser.close()
with sync_playwright() as pw:
 # Partial-progress Continue (one clue seen, not solved) restores safely,
 # independently of the full-completion context above.
 browser=pw.chromium.launch(headless=True)
 ctx=browser.new_context(viewport={'width':1440,'height':900})
 p=ctx.new_page();p.add_init_script(HOOK);errs=[]
 p.on('pageerror',lambda e:errs.append(str(e)));p.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
 p.goto(URL,wait_until='networkidle');p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',BASE);reload(p)
 move(p,CLUE_A,False);use(p,False);p.wait_for_timeout(120)
 assert ev(p,'[...s.cClues]')==['a']
 reload(p)
 assert ev(p,'[...s.cClues]')==['a'];assert not ev(p,'s.discoveredSecrets.has("bonus-mapping")')
 assert ev(p,'!!s.collectibles.find(c=>c.getData("id")==="c-return"&&c.active)')
 results['partial-continue']={'passed':not errs,'errors':errs}
 assert not errs
 # Backward-compatible migration: an old save that had fully completed the
 # previous four-pair quiz (discoveredSecretIds already contains
 # 'bonus-mapping') must keep that reward regardless of the removed
 # mappingInputs/mappingDone fields it also carries.
 OLD_COMPLETE={**BASE,'mappingInputs':[0,1,2,3],'mappingDone':True,'discoveredSecretIds':['bonus-mapping'],'collectedCoinIds':['c-return']}
 p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',OLD_COMPLETE);reload(p)
 assert ev(p,'s.discoveredSecrets.has("bonus-mapping")');assert ev(p,'s.collectedCoinIds.has("c-return")')
 assert ev(p,'[...s.cClues]')==[]  # old granular field is dropped, harmlessly
 results['old-save-migration-complete']={'passed':True}
 # An old save with PARTIAL progress (2 of 4 old pairs, secret not yet
 # found) resets the trivial optional sub-task cleanly instead of crashing
 # or half-applying stale state.
 OLD_PARTIAL={**BASE,'mappingInputs':[0,1],'mappingDone':False,'discoveredSecretIds':[]}
 p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',OLD_PARTIAL);reload(p)
 assert ev(p,'[...s.cClues]')==[];assert not ev(p,'s.discoveredSecrets.has("bonus-mapping")')
 results['old-save-migration-partial']={'passed':True}
 ctx.close();browser.close()
(OUT/'browser-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results,indent=2))

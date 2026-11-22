from pathlib import Path
import ast,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'audits/level-v12/phase4';OUT.mkdir(exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
tree=ast.parse((ROOT/'audits/level-v12/phase3-browser-qa.py').read_text())
INSTRUMENT=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='INSTRUMENT' for t in n.targets))
S='window.__phase3Scene'
results={}
def shot(p,name):p.screenshot(path=str(OUT/(name+'.png')))
def state(p):return p.evaluate(f'({{active:{S}.dialogue.active,pending:{S}.dialogue.pending,seen:[...{S}.dialogue.seen],remaining:{S}.dialogue.remaining,mode:{S}.mode,x:{S}.player.x}})')
def visible(p):p.locator('#chill-bubble').wait_for(state='visible',timeout=10000)
def clear(p):p.evaluate(f'{S}.dialogue.active=null;{S}.dialogue.pending=[];{S}.dialogue.cooldown=0')
def assert_layout(p):
 return p.evaluate('''()=>{
 const b=document.querySelector('#chill-bubble'),r=b.getBoundingClientRect();
 if(!r.width||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight)throw Error('bubble outside screen');
 const targets=[...document.querySelectorAll('.masthead,#mission-indicator,#touch-controls button:not([hidden]),#tutorial.show,#notice.show,#zone-toast.show')];
 const overlap=targets.filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).opacity!=='0').filter(n=>{const a=n.getBoundingClientRect();return r.left<a.right&&r.right>a.left&&r.top<a.bottom&&r.bottom>a.top;});
 if(overlap.length)throw Error('HUD overlap: '+overlap.map(n=>n.id||n.outerHTML));
 return {x:r.x,y:r.y,width:r.width,height:r.height};}''')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for name,width,height,touch in [('desktop',1440,900,False),('portrait',390,844,True),('landscape',844,390,True)]:
  ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch)
  p=ctx.new_page();p.add_init_script(INSTRUMENT);errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  p.goto(URL,wait_until='networkidle');p.click('#start');visible(p)
  assert state(p)['active']=='zone:A',state(p)
  layout=assert_layout(p);shot(p,name+'-first-trigger')
  p.wait_for_timeout(2800);assert p.locator('#mission-indicator').is_visible();assert_layout(p);shot(p,name+'-objective')
  before=state(p)['x']
  if touch:
   box=p.locator('[data-hold="right"]').bounding_box();cdp=ctx.new_cdp_session(p)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+20,'y':box['y']+20,'id':1}]});p.wait_for_timeout(300)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  else:p.keyboard.down('d');p.wait_for_timeout(300);p.keyboard.up('d')
  assert state(p)['x']>before+20
  p.click('#pause');frozen=state(p);p.wait_for_timeout(400)
  assert state(p)['remaining']==frozen['remaining'];assert not p.locator('#chill-bubble').is_visible()
  p.locator('#mission-notes summary').click();assert p.locator('#mission-summary').inner_text();shot(p,name+'-mission-notes')
  p.click('#resume');visible(p);p.click('#dialogue-dismiss');p.wait_for_timeout(80)
  assert state(p)['active'] is None
  p.evaluate(f'{S}.say("zone:A")');assert 'zone:A' not in state(p)['pending']
  p.reload(wait_until='networkidle');p.click('#continue-btn');p.wait_for_timeout(300)
  assert 'zone:A' in state(p)['seen'] and state(p)['active']!='zone:A'
  clear(p);p.evaluate(f'{S}.say("found:crate");{S}.say("activated:crate");{S}.say("activated:crate")');visible(p)
  assert state(p)['active']=='found:crate' and state(p)['pending']==['activated:crate']
  p.click('#dialogue-dismiss');p.wait_for_timeout(500);assert state(p)['active'] is None
  visible(p);assert state(p)['active']=='activated:crate';assert_layout(p);shot(p,name+'-queued-reaction')
  # Change orientation on the live mobile run, retaining its active reaction.
  if touch:
   p.set_viewport_size({'width':height,'height':width});p.wait_for_timeout(350);visible(p);assert_layout(p);shot(p,name+'-rotated')
  p.click('#pause');p.click('#pause-menu');p.wait_for_timeout(200)
  assert not p.locator('#chill-bubble').is_visible();assert not p.locator('#mission-indicator').is_visible()
  p.click('#continue-btn');p.wait_for_timeout(250);assert state(p)['mode']=='playing'
  assert not errors,errors
  results[name]={'firstTrigger':True,'naturalMovementDuringBubble':True,'pauseResume':True,'dismiss':True,'revisitDedup':True,'saveReload':True,'queueCooldown':True,'menuContinue':True,'layout':layout,'errors':errors}
  ctx.close()
 # Controlled scene fixtures test real mechanism event wiring, without adding runtime test hooks.
 ctx=browser.new_context(viewport={'width':1440,'height':900});p=ctx.new_page();p.add_init_script(INSTRUMENT)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL,wait_until='networkidle');p.click('#start');clear(p)
 for zone,x,feet in [('B',1500,1188),('C',1692,864),('D',3100,972),('E',4428,864),('F',6084,864),('G',7300,972)]:
  p.evaluate(f'{S}.player.body.reset({x},{feet-30})');p.wait_for_timeout(120)
  assert 'zone:'+zone in state(p)['pending']+state(p)['seen'],zone
  first=(state(p)['pending']+state(p)['seen']).count('zone:'+zone)
  p.evaluate(f'{S}.say("zone:{zone}")');assert (state(p)['pending']+state(p)['seen']).count('zone:'+zone)==first==1
 clear(p)
 p.evaluate(f'{S}.player.body.reset(2070,1050)');p.wait_for_timeout(500)
 assert 'found:lift' in state(p)['pending']+state(p)['seen'];clear(p)
 p.evaluate(f'{S}.runLiftExperiment(0)');p.wait_for_timeout(800)
 assert 'failed:lift' in state(p)['pending']+state(p)['seen']
 p.evaluate(f'{S}.runLiftExperiment(3)');p.wait_for_timeout(1800)
 assert 'activated:lift' in state(p)['pending']+state(p)['seen'];shot(p,'lift-activation')
 clear(p);p.evaluate(f'{S}.discoverSecret("bonus-mapping")');p.wait_for_timeout(300)
 assert 'secret:bonus-mapping' in state(p)['pending']+state(p)['seen']
 clear(p)
 p.evaluate(f'for(const id of ["lift","number-span","water-crossing","river-input","river-composition","river-crossing"]){S}.solvedGates.add(id);{S}.player.body.reset(8316,942)')
 p.wait_for_timeout(350);p.evaluate(f'{S}.finish()')
 p.locator('#complete[open]').wait_for();assert 'Bekalan' in p.locator('#destination-reaction').inner_text();shot(p,'destination')
 assert not p.locator('#chill-bubble').is_visible();assert not errors,errors
 results['eventWiring']={'discovery':True,'failedExperiment':True,'activation':True,'secret':True,'completion':True,'errors':errors}
 ctx.close();browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))

"""Full Level 3 keyboard traversal and focused touch/viewport smoke."""
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE='http://localhost/Azza-arch/app/addmath/denai/main.html?level=w1-l3'
ART=Path(__file__).parent/'artifacts'/'gameplay-v2'
ART.mkdir(parents=True,exist_ok=True)
HOOK="""Object.defineProperty(window,'Phaser',{configurable:true,set(value){
 const Original=value.Game;value.Game=class extends Original{constructor(config){super(config);window.testGame=this;}};
 Object.defineProperty(window,'Phaser',{value,writable:true,configurable:true});
}});"""
S="testGame.scene.getScene('GerbangSongsang')"

def wait(page,expression,seconds=12):
 deadline=time.monotonic()+seconds
 while time.monotonic()<deadline:
  if page.evaluate(expression):return
  page.wait_for_timeout(50)
 raise AssertionError(expression)

def pos(page):
 return page.evaluate(f"(()=>{{const s={S},b=s.player.body;return {{x:s.player.x,feet:b.bottom,ground:b.blocked.down||b.touching.down,mode:s.mode,cp:s.run.checkpointId}}}})()")

def drive(page,target,jumps=()):
 at=pos(page);direction='ArrowRight' if at['x']<target else 'ArrowLeft';pending=list(jumps);deadline=time.monotonic()+24
 page.keyboard.down(direction)
 try:
  while time.monotonic()<deadline:
   at=pos(page)
   if at['mode']!='playing':break
   if (direction=='ArrowRight' and at['x']>=target-5) or (direction=='ArrowLeft' and at['x']<=target+5):break
   if pending and at['x']>=pending[0] and at['ground']:
    page.keyboard.press('Space');pending.pop(0)
   page.wait_for_timeout(20)
  else:raise AssertionError({'target':target,'at':pos(page),'pending':pending})
 finally:page.keyboard.up(direction)
 page.wait_for_timeout(200)
 for _ in range(18):
  x=pos(page)['x']
  if abs(x-target)<24:break
  key='ArrowLeft' if x>target else 'ArrowRight';page.keyboard.down(key);page.wait_for_timeout(65);page.keyboard.up(key);page.wait_for_timeout(130)

def climb_to(page,feet,direction='ArrowUp'):
 page.keyboard.down(direction)
 try:wait(page,f"!{S}.climbing && {S}.player.body.bottom{'<=' if direction=='ArrowUp' else '>='}{feet+2 if direction=='ArrowUp' else feet-2}",8)
 finally:page.keyboard.up(direction)
 page.wait_for_timeout(180)

def action(page,key):
 page.locator('#inverse-panel [data-action="'+key+'"]').click()
 wait(page,f'!{S}.busy',5)

with sync_playwright() as p:
 browser=p.chromium.launch()
 errors=[]
 try:
  page=browser.new_page(viewport={'width':1440,'height':900})
  page.add_init_script(HOOK);page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE);wait(page,f'!!window.testGame?.scene.getScene("GerbangSongsang")?.player',30)
  page.wait_for_timeout(700)
  page.evaluate("localStorage.removeItem('denai-l3-campaign-v1')")
  page.evaluate(f"{S}.scene.restart({{fresh:true}})");wait(page,f'{S}.mode==="playing"')
  assert pos(page)['cp']=='entry'
  assert page.evaluate(f'{S}.worldObjects.filter(o=>o.x>=3240 && o.x<3294 && o.y>=1512 && o.y<1674).every(o=>o.collision===false)')
  page.screenshot(path=str(ART/'13-l3-entry-desktop.png'))

  # Optional upper ruins branch: real climb from approach through both decks.
  drive(page,918,[620]);climb_to(page,1512)
  drive(page,972);climb_to(page,1512)
  drive(page,945);page.keyboard.press('e');wait(page,f'{S}.run.secrets.includes("ruin-inscription")')
  page.screenshot(path=str(ART/'14-l3-upper-ruins-desktop.png'))
  # Step off the low secret ledge onto the entry terrace below.
  drive(page,1045);wait(page,f'({S}.player.body.blocked.down||{S}.player.body.touching.down) && {S}.player.body.bottom>=1672',6)
  drive(page,1998,[1270,1860]);assert pos(page)['cp']=='ruins'

  # Machine yard, useful wrong experiment, all three seals, and local save.
  drive(page,2592,[2440]);assert pos(page)['cp']=='machine'
  drive(page,2862);wait(page,"document.querySelector('#inverse-panel:not([hidden])')")
  page.screenshot(path=str(ART/'15-l3-machine-yard-desktop.png'))
  assert page.evaluate(f'{S}.run.puzzle.output===13')
  page.keyboard.down('ArrowRight');page.wait_for_timeout(1800);page.keyboard.up('ArrowRight')
  wait(page,f'{S}.run.checkpointId==="machine" && {S}.player.x<2650',8)
  assert pos(page)['cp']=='machine'
  drive(page,2862);wait(page,"document.querySelector('#inverse-panel:not([hidden])')")
  action(page,'demo');assert not page.evaluate(f'{S}.run.puzzle.seals[13]')
  action(page,'apply');assert page.evaluate(f'{S}.run.puzzle.seals[13]')
  page.locator('#inverse-output').select_option('1');action(page,'apply')
  assert page.locator('.inverse-trace').inner_text().find('bukan dalam imej')>=0
  page.locator('#inverse-output').select_option('7');action(page,'divide');action(page,'subtract');action(page,'apply')
  assert not page.evaluate(f'{S}.run.puzzle.seals[7]')
  page.screenshot(path=str(ART/'l3-wrong-order.png'))
  action(page,'reset');page.locator('#game').focus();page.keyboard.press('j');wait(page,f'!{S}.busy');page.keyboard.press('k');wait(page,f'!{S}.busy')
  # Restore an unfinished operation sequence, not just a completed latch.
  page.reload();wait(page,f'!!window.testGame?.scene.getScene("GerbangSongsang")?.player',30)
  drive(page,2862);wait(page,'!document.querySelector("#inverse-panel").hidden')
  assert page.evaluate(f'{S}.run.puzzle.steps.join(",")==="subtract,divide"')
  action(page,'apply');assert page.evaluate(f'{S}.run.puzzle.seals[7]')
  page.locator('#inverse-output').select_option('15');action(page,'subtract');action(page,'divide')
  page.locator('#inverse-actuator').fill('4');action(page,'apply')
  assert not page.evaluate(f'{S}.run.puzzle.seals[15]')
  page.screenshot(path=str(ART/'l3-independent-misaligned.png'))
  page.locator('#inverse-actuator').fill('6');action(page,'apply')
  assert page.evaluate(f'{S}.run.puzzle.seals[15] && {S}.bridgeArt.length>0')

  # Read the formula note, then reload and verify the exact run/puzzle restore.
  drive(page,3024);page.keyboard.press('e');wait(page,f'{S}.run.secrets.includes("domain-tablet")')
  page.screenshot(path=str(ART/'16-l3-waterfall-desktop.png'))
  run_id=page.evaluate(f'{S}.run.id');revision=page.evaluate(f'{S}.run.puzzle.revision')
  page.reload();wait(page,f'!!window.testGame?.scene.getScene("GerbangSongsang")?.player',30)
  wait(page,f'{S}.mode==="playing"');assert page.evaluate(f'{S}.run.id')==run_id
  assert page.evaluate(f'{S}.run.puzzle.revision==={revision} && {S}.run.puzzle.seals[13] && {S}.run.puzzle.seals[7] && {S}.run.puzzle.seals[15]')
  assert pos(page)['cp']=='machine'

  drive(page,3564,[3210]);assert pos(page)['cp']=='far-bank'

  # Gate arch optional route and final finish.
  drive(page,4590,[4010]);climb_to(page,1242)
  drive(page,4590);page.keyboard.press('e');wait(page,f'{S}.run.secrets.includes("inverse-tablet")')
  drive(page,4770);wait(page,f'({S}.player.body.blocked.down||{S}.player.body.touching.down) && {S}.player.body.bottom>=1564',8)
  drive(page,4860);assert pos(page)['cp']=='gate-court'
  page.screenshot(path=str(ART/'17-l3-gate-approach-desktop.png'))
  drive(page,5292);wait(page,f'{S}.mode==="complete"',10)
  page.screenshot(path=str(ART/'18-l3-victory-desktop.png'))
  saved=page.evaluate("JSON.parse(localStorage.getItem('denai-l3-campaign-v1'))")
  assert saved['completions']==1
  page.locator('#inverse-replay').click();wait(page,f'{S}.mode==="playing"')
  assert page.evaluate(f'{S}.run.coins.length===0 && !{S}.run.completed')
  assert page.evaluate(f'{S}.store.load().completions===1')
  assert not errors,errors

  # Touch layouts: focus the station using test-only positioning, exercise the
  # actual touch buttons, and ensure all controls/panel remain in the viewport.
  for width,height in [(390,844),(320,740),(844,390)]:
   context=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True,reduced_motion='reduce')
   phone=context.new_page();phone.add_init_script(HOOK);phone.on('pageerror',lambda e:errors.append(str(e)))
   phone.goto(BASE);wait(phone,f'!!window.testGame?.scene.getScene("GerbangSongsang")?.player',30)
   phone.evaluate(f'{S}.player.body.reset(2862,1589)');phone.wait_for_timeout(600)
   panel=phone.locator('#inverse-panel');wait(phone,'!document.querySelector("#inverse-panel").hidden')
   for selector in ['#pause','[data-action="jump"]','[data-action="interact"]','[data-hold="left"]','[data-hold="right"]','[data-hold="up"]','[data-hold="down"]']:
    box=phone.locator(selector).bounding_box();assert box and box['x']>=0 and box['x']+box['width']<=width+1,(selector,box,width)
    assert box['y']>=0 and box['y']+box['height']<=height+1,(selector,box,height)
   bounds=panel.bounding_box();assert bounds and bounds['x']>=0 and bounds['x']+bounds['width']<=width+1 and bounds['y']>=0 and bounds['y']+bounds['height']<=height+1,(bounds,width,height)
   phone.locator('#inverse-panel [data-action="demo"]').tap();wait(phone,f'!{S}.busy')
   phone.locator('#inverse-panel [data-action="apply"]').tap();wait(phone,f'!{S}.busy')
   assert phone.evaluate(f'{S}.run.puzzle.seals[13]')
   name=f'19-l3-phone-{width}x{height}.png';phone.screenshot(path=str(ART/name))
   phone.locator('#pause').tap();assert phone.evaluate(f'{S}.mode==="paused"');phone.locator('#inverse-resume').tap()
   assert phone.evaluate('document.documentElement.scrollWidth<=innerWidth')
   context.close()
  assert not errors,errors
  result={'passed':True,'desktop':'full keyboard traversal, three secrets, wrong/correct experiments, three seals, save/reload, fall/respawn, exit/replay','phones':[{'width':w,'height':h} for w,h in [(390,844),(320,740),(844,390)]],'errors':errors}
  (ART/'inverse-smoke-result.json').write_text(json.dumps(result,indent=2))
  print(json.dumps(result),flush=True)
 finally:browser.close()

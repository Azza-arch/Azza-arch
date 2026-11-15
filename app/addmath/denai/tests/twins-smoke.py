"""Focused local browser smoke. Scene access is injected by this test only."""
import json
import time
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE='http://localhost/Azza-arch/app/addmath/denai/'
ART=Path(__file__).parent/'artifacts'/'gameplay-v2'
ART.mkdir(parents=True,exist_ok=True)
HOOK="""Object.defineProperty(window,'Phaser',{configurable:true,set(value){
 const Original=value.Game;value.Game=class extends Original{constructor(config){super(config);window.testGame=this;}};
 Object.defineProperty(window,'Phaser',{value,writable:true,configurable:true});
}});"""
S="testGame.scene.getScene('Jambatan')"
def wait(page,expression,seconds=10):
 deadline=time.monotonic()+seconds
 while time.monotonic()<deadline:
  if page.evaluate(expression):return
  page.wait_for_timeout(50)
 raise AssertionError(expression)

def position(page):
 return page.evaluate(f"(()=>{{const s={S},b=s.player.body;return {{x:s.player.x,feet:b.bottom,ground:b.blocked.down||b.touching.down,mode:s.mode,cp:s.run.checkpointId}}}})()")

def drive(page,target,jumps=()):
 direction='ArrowRight' if position(page)['x']<target else 'ArrowLeft'
 pending=list(jumps);deadline=time.monotonic()+15
 page.keyboard.down(direction)
 try:
  while time.monotonic()<deadline:
   at=position(page)
   if at['mode']=='complete':break
   if abs(at['x']-target)<10 or (direction=='ArrowRight' and at['x']>=target) or (direction=='ArrowLeft' and at['x']<=target):break
   if pending and at['x']>=pending[0] and at['ground']:
    page.keyboard.press('Space');pending.pop(0)
   page.wait_for_timeout(20)
  else:raise AssertionError({'target':target,'at':position(page),'pending':pending})
 finally:page.keyboard.up(direction)
 page.wait_for_timeout(180)
 # Rendering/IPC can overshoot a polling sample; correct using real key taps.
 for _ in range(16):
  x=position(page)['x']
  if abs(x-target)<24:break
  key='ArrowLeft' if x>target else 'ArrowRight'
  page.keyboard.down(key);page.wait_for_timeout(70);page.keyboard.up(key);page.wait_for_timeout(140)

def climb(page,feet):
 page.keyboard.down('ArrowUp')
 try:wait(page,f'{S}.player.body.bottom<={feet+2}',5)
 finally:page.keyboard.up('ArrowUp')
 page.wait_for_timeout(200)

def send(page):
 route=page.evaluate(f'{S}.run.puzzles[{S}.nearStation.id].order')
 page.locator('[data-command="route-'+route+'"]').click()
 page.locator('[data-command="send"]').click()
 wait(page,f'!{S}.busy',5)

with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.add_init_script(HOOK)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  if '--inverse-menu' in sys.argv:
   page.goto(BASE+'?level=w1-l2')
   wait(page,"!!window.testGame?.scene.getScene('Jambatan')?.player",30)
   page.keyboard.press('Escape');page.locator('#twin-menu').click()
   wait(page,"testGame.scene.getScene('Lorong').sys.isActive()")
   assert page.locator('#level-select').is_visible()
   assert not page.locator('#level3-action').is_disabled()
   page.locator('#level3-action').click()
   wait(page,"!!testGame.scene.getScene('GerbangSongsang')?.player",20)
   scene="testGame.scene.getScene('GerbangSongsang')"
   page.wait_for_timeout(500)
   before=page.evaluate(f'{scene}.player.x')
   page.keyboard.down('ArrowRight');page.wait_for_timeout(500);page.keyboard.up('ArrowRight')
   after=page.evaluate(f'{scene}.player.x')
   assert after>before+30,{'before':before,'after':after,'errors':errors}
   assert not errors,errors
   assert page.locator('#hud-area').inner_text().startswith('1–3')
   page.screenshot(path=str(ART/'10-inverse-level-select-launch.png'))
   page.evaluate(f'{scene}.player.body.reset(2862,1560)')
   page.wait_for_timeout(350)
   page.screenshot(path=str(ART/'11-inverse-kenney-pipeline.png'))
   page.evaluate(f'{scene}.player.body.reset(3456,1614)')
   page.wait_for_timeout(150)
   page.screenshot(path=str(ART/'12-inverse-stream-crossing.png'))
   print(json.dumps({'passed':True,'scene':'GerbangSongsang','xBefore':before,'xAfter':after,'errors':errors}),flush=True)
   sys.exit(0)
  page.goto(BASE+'?level=w1-l2')
  wait(page,"!!window.testGame?.scene.getScene('Jambatan')?.player",30)
  page.wait_for_timeout(900)
  # Start the traversal with clean L2 progress without changing L1 saves.
  page.evaluate("localStorage.removeItem('denai-campaign-v1')")
  page.evaluate(f"{S}.scene.restart({{fresh:true}})")
  wait(page,f'{S}.mode===\"playing\"',10)
  if '--lifecycle' in sys.argv:
   page.keyboard.press('Escape');page.locator('#twin-menu').click()
   page.wait_for_timeout(700)
   print('After return',errors,page.evaluate("testGame.scene.scenes.map(s=>({key:s.sys.settings.key,mode:s.mode,active:s.sys.isActive()}))"),flush=True)
   page.locator('#level1-action').click();page.wait_for_timeout(700)
   print('After start',errors,page.evaluate("testGame.scene.scenes.map(s=>({key:s.sys.settings.key,mode:s.mode,active:s.sys.isActive()}))"),flush=True)
   page.screenshot(path=str(ART/'lifecycle.png'))
   sys.exit(0)
  if '--phone' in sys.argv:
   # Saved scene placement is only for this focused rendering regression;
   # the full smoke above/below proves traversal through real keyboard input.
   for width,height in [(390,844),(320,740),(844,390)]:
    context=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True,reduced_motion='reduce')
    phone=context.new_page();phone.add_init_script(HOOK);phone.on('pageerror',lambda e:errors.append(str(e)))
    phone.goto(BASE+'?level=w1-l2');wait(phone,f'!!window.testGame?.scene.getScene("Jambatan")?.player',30)
    phone.evaluate(f"{S}.player.body.reset(1404,1266)");phone.wait_for_timeout(600)
    for selector in ['#pause','[data-action="jump"]','[data-action="interact"]','[data-hold="left"]','[data-hold="right"]','[data-hold="up"]','[data-hold="down"]']:
     bounds=phone.locator(selector).bounding_box()
     assert bounds and bounds['x']>=0 and bounds['x']+bounds['width']<=width+1,(selector,bounds,width)
     assert bounds['y']>=0 and bounds['y']+bounds['height']<=height+1
    phone.locator('[data-command="route-fg"]').tap();phone.locator('[data-command="send"]').tap();wait(phone,f'!{S}.busy')
    phone.locator('[data-command="order"]').tap();phone.locator('[data-command="route-gf"]').tap();phone.locator('[data-command="send"]').tap();wait(phone,f'!{S}.busy')
    assert phone.evaluate(f'!!{S}.bridges.twins')
    name='07-machines-phone-portrait.png' if width==390 else '08-machines-phone-landscape.png' if width==844 else '09-machines-small-phone.png'
    phone.screenshot(path=str(ART/name))
    phone.locator('#pause').tap();assert position(phone)['mode']=='paused';phone.locator('#twin-resume').tap()
    phone.locator('[data-action="jump"]').tap();phone.wait_for_timeout(120)
    assert position(phone)['feet']<1260
    assert phone.evaluate('document.documentElement.scrollWidth<=innerWidth')
    context.close()
   assert not errors,errors
   (ART/'phone-result.json').write_text(json.dumps({'passed':True,'widths':[320,390,844],'errors':errors,'checks':'every touch control inside viewport; tap jump and pause/resume; both machine orders; reduced motion'},indent=2))
   print('PASS phone controls and screenshots at 320, 390 and 844 pixels',flush=True)
   sys.exit(0)
  legacy=page.evaluate("[localStorage.getItem('denai-save-v14'),localStorage.getItem('denai-profile-v1')]")
  page.screenshot(path=str(ART/'01-entry-desktop.png'))
  drive(page,1404,[610,940])
  assert position(page)['cp']=='machines'
  send(page)
  assert page.evaluate(f"{S}.run.puzzles.twins.receivers.fg && !{S}.bridges.twins")
  page.locator('[data-command="order"]').click()
  send(page)
  assert page.evaluate(f"!!{S}.bridges.twins")
  page.wait_for_timeout(700)
  page.screenshot(path=str(ART/'02-twin-machines-desktop.png'))
  run_id=page.evaluate(f'{S}.run.id')
  page.reload();wait(page,f'!!window.testGame?.scene.getScene("Jambatan")?.player',30)
  assert page.evaluate(f'{S}.run.id')==run_id
  assert page.evaluate(f'!!{S}.bridges.twins')
  assert position(page)['cp']=='machines'
  drive(page,1755)
  climb(page,1134)
  drive(page,2376)
  assert position(page)['cp']=='beyond-twins'
  page.keyboard.press('e')
  wait(page,f'{S}.run.secrets.length===1')
  page.screenshot(path=str(ART/'03-upper-secret-desktop.png'))
  # Descend naturally from the upper bridge to the far bank.
  drive(page,2445)
  wait(page,f'{S}.player.body.blocked.down')
  drive(page,2460)
  # Deliberately walk off the stream bank: verify the fair respawn checkpoint.
  page.keyboard.down('ArrowRight');page.wait_for_timeout(600);page.keyboard.up('ArrowRight')
  page.wait_for_timeout(1100)
  # Upper and lower bridge routes share the safe lower-bank checkpoint.
  assert position(page)['feet']<1512
  assert position(page)['cp']=='beyond-twins'
  print('Traversal and first bridge passed',position(page),flush=True)
  # Re-enter the lower route, then take the two stream jumps.
  drive(page,2440)
  drive(page,2700,[2450])
  drive(page,3024,[2770])
  climb(page,1080)
  drive(page,3294,[3080])
  page.keyboard.press('e');wait(page,f'{S}.run.secrets.length===2')
  page.screenshot(path=str(ART/'04-canopy-secret-desktop.png'))
  drive(page,3510)
  # Wrong input is a visible experiment and does not activate the final bridge.
  send(page)
  assert not page.evaluate(f'!!{S}.bridges.final')
  page.locator('[data-command="input"]').click() # 2 -> 3
  send(page)
  page.locator('[data-command="order"]').click()
  page.locator('[data-command="route-gf"]').click()
  page.locator('[data-command="send"]').click()
  page.wait_for_timeout(200);page.keyboard.press('Escape')
  assert position(page)['mode']=='paused'
  revision=page.evaluate(f'{S}.run.puzzles.final.revision')
  page.wait_for_timeout(500)
  assert page.evaluate(f'{S}.run.puzzles.final.revision')==revision
  page.locator('#twin-resume').click();wait(page,f'!{S}.busy')
  assert page.evaluate(f'!!{S}.bridges.final')
  page.screenshot(path=str(ART/'05-final-machines-desktop.png'))
  drive(page,4698,[4500]);wait(page,f"{S}.mode==='complete'")
  page.screenshot(path=str(ART/'06-victory-desktop.png'))
  saved=page.evaluate("JSON.parse(localStorage.getItem('denai-campaign-v1'))")
  assert saved['levels']['w1-l2']['completions']==1
  assert legacy==page.evaluate("[localStorage.getItem('denai-save-v14'),localStorage.getItem('denai-profile-v1')]")
  page.locator('#twin-replay').click();page.wait_for_timeout(500)
  assert page.evaluate(f'{S}.run.coins.length===0 && !{S}.run.completed')
  assert page.evaluate(f"{S}.store.load().levels['w1-l2'].completions===1")
  page.keyboard.press('Escape');page.locator('#twin-menu').click()
  wait(page,"testGame.scene.getScene('Lorong').sys.isActive()")
  assert page.locator('#level-select').is_visible()
  page.locator('#level1-action').click();page.wait_for_timeout(500)
  assert page.evaluate("testGame.scene.getScene('Lorong').mode==='playing'")
  page.keyboard.down('ArrowRight');page.wait_for_timeout(500);page.keyboard.up('ArrowRight')
  assert page.evaluate("testGame.scene.getScene('Lorong').player.x>100")
  # Phone: use real touch buttons for the machine, check layout in both orientations.
  context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
  phone=context.new_page();phone.add_init_script(HOOK);phone.on('pageerror',lambda e:errors.append(str(e)))
  phone.goto(BASE+'?level=w1-l2');wait(phone,f'!!window.testGame?.scene.getScene("Jambatan")?.player',30)
  assert phone.locator('#touch-controls').is_visible()
  arrow=phone.locator('[data-hold="right"]');box=arrow.bounding_box()
  phone.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);phone.mouse.down();phone.wait_for_timeout(450);phone.mouse.up()
  assert position(phone)['x']>150
  drive(phone,1404,[610,940])
  phone.locator('[data-command="route-fg"]').tap();phone.locator('[data-command="send"]').tap();wait(phone,f'!{S}.busy')
  phone.locator('[data-command="order"]').tap();phone.locator('[data-command="route-gf"]').tap();phone.locator('[data-command="send"]').tap();wait(phone,f'!{S}.busy')
  assert phone.evaluate(f'!!{S}.bridges.twins')
  phone.screenshot(path=str(ART/'07-machines-phone-portrait.png'))
  phone.set_viewport_size({'width':844,'height':390});phone.wait_for_timeout(600)
  phone.screenshot(path=str(ART/'08-machines-phone-landscape.png'))
  for selector in ['#twin-panel','#touch-controls']:
   bounds=phone.locator(selector).bounding_box()
   assert bounds['x']>=0 and bounds['x']+bounds['width']<=845
  assert phone.evaluate('document.documentElement.scrollWidth<=innerWidth')
  context.close()
  assert not errors,errors
  report={'passed':True,'errors':errors,'completion':saved['levels']['w1-l2'],'checks':'real keyboard traversal, both ladders/secrets, machine animation, pause, checkpoint reload, completion, replay, L1 return, legacy isolation, touch controls, portrait/landscape, reduced motion'}
  (ART/'smoke-result.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
  print(json.dumps(report,ensure_ascii=True),flush=True)
 except Exception:
  print(json.dumps({'errors':errors,'scenes':page.evaluate("testGame.scene.scenes.map(s=>({key:s.sys.settings.key,mode:s.mode,active:s.sys.isActive()}))")},ensure_ascii=True),flush=True)
  page.screenshot(path=str(ART/'failure.png'))
  raise
 finally:browser.close()

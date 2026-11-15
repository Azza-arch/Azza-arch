"""Focused L1 mechanism regression; placement is injected, actions use UI/keyboard."""
import json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
ART=Path(__file__).parent/'artifacts'/'gameplay-v2'
ART.mkdir(parents=True,exist_ok=True)
HOOK="""Object.defineProperty(window,'Phaser',{configurable:true,set(v){const G=v.Game;v.Game=class extends G{constructor(c){super(c);window.testGame=this}};Object.defineProperty(window,'Phaser',{value:v,writable:true,configurable:true})}});"""
S="testGame.scene.getScene('Lorong')"
def wait(p,expr,seconds=12):
 end=time.monotonic()+seconds
 while time.monotonic()<end:
  if p.evaluate(expr):return
  p.wait_for_timeout(50)
 raise AssertionError(expr)
def choices(p):
 return p.evaluate(f"(()=>{{const v={S}.mission;const outs=v.type==='find-rule'?v.options.map(r=>r.a*v.input+r.b):[0,1,2,3,4].map(x=>v.rule.a*x+v.rule.b);return {{short:outs.findIndex(x=>x>0&&x<7),right:outs.indexOf(7),outs}}}})()")
with sync_playwright() as pw:
 browser=pw.chromium.launch();p=browser.new_page(viewport={'width':1440,'height':900});p.add_init_script(HOOK);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 try:
  p.goto('http://localhost/Azza-arch/app/addmath/denai/main.html');wait(p,'!!window.testGame?.scene.getScene("Lorong")?.player',30)
  p.locator('#start').click();wait(p,f'{S}.mode==="playing"')
  p.evaluate(f'{S}.player.body.reset(2484,1211)');p.wait_for_timeout(500);p.keyboard.press('e');wait(p,f'{S}.mode==="mechanism"')
  c=choices(p);assert c['short']>=0
  p.locator('[data-token="'+str(c['short'])+'"]').click();p.locator('#dial-test').click();p.wait_for_timeout(600)
  p.screenshot(path=str(ART/'l1-short-output.png'))
  p.locator('#dial-preview').click();wait(p,f'{S}.mode==="playing" && !!{S}.trialDeck')
  assert not p.evaluate(f'{S}.solvedGates.has("lift")')
  width=p.evaluate(f'{S}.trialDeck.width');assert abs(width-324*c['outs'][c['short']]/7)<1
  # Walk onto the deck; no timer or disappearance under the player.
  p.keyboard.down('ArrowRight');p.wait_for_timeout(400);p.keyboard.up('ArrowRight');p.wait_for_timeout(200)
  assert p.evaluate(f'{S}.trialDeck.active');p.screenshot(path=str(ART/'l1-trial-deck.png'))
  p.evaluate(f'{S}.writeSave()');mission=p.evaluate(f'{S}.mission.id')
  p.reload();wait(p,'!!window.testGame?.scene.getScene("Lorong")?.player',30)
  p.locator('#continue-btn').click();wait(p,f'{S}.mode==="playing"')
  assert not p.evaluate(f'!!{S}.trialDeck');assert not p.evaluate(f'{S}.solvedGates.has("lift")');assert p.evaluate(f'{S}.mission.id')==mission
  p.evaluate(f'{S}.player.body.reset(2484,1211)');p.wait_for_timeout(500);p.keyboard.press('e');wait(p,f'{S}.mode==="mechanism"')
  c=choices(p);p.locator('[data-token="'+str(c['right'])+'"]').click();p.locator('#dial-test').click();p.locator('#puzzle-go').click();wait(p,f'{S}.solvedGates.has("lift") && {S}.mode==="playing"')
  assert p.evaluate(f'!!{S}.gateBodies.lift');p.screenshot(path=str(ART/'l1-locked-bridge.png'))
  # Existing finish guard and persistence; this is not a traversal claim.
  p.evaluate(f'{S}.player.body.reset(5751,1103)');p.wait_for_timeout(500)
  assert not errors,errors
  result={'passed':True,'mission':mission,'trialWidth':width,'checks':['UI wrong/correct output','walkable untimed trial','save/reload clears trial and keeps mission','correct bridge collision'],'errors':errors}
  (ART/'intro-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
 finally:browser.close()

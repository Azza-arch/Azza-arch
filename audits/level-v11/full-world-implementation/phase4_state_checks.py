"""Focused browser state tests; save fixtures are explicit, never traversal proof."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'audits/level-v11/full-world-implementation'
BASE='http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test'
checks=[]; errors=[]
base=dict(schemaVersion=1,layoutVersion=112,levelId='lorong-atas-bumbung-v11',checkpointId='g-river',solvedGateIds=['lift','number-span','water-crossing'],mappingInputs=[],collectedCoinIds=[],discoveredSecretIds=[],elapsedMs=1200)
with sync_playwright() as p:
 b=p.chromium.launch()
 page=b.new_page(viewport={'width':1440,'height':900})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE);page.wait_for_selector('#welcome:not([hidden])')
 def wait(expr): page.wait_for_function('()=>'+expr)
 def restore(data):
  page.evaluate('(data)=>localStorage.setItem("lorong-save-v11",JSON.stringify(data))',data)
  page.reload();page.wait_for_selector('#continue-btn:not([hidden])');page.click('#continue-btn')
  wait("rooftop.scene.mode==='playing'")
 def walk(x):
  current=page.evaluate('rooftop.scene.player.x');key='d' if x>current else 'a'
  page.keyboard.down(key);wait(f'rooftop.scene.player.x {">=" if key=="d" else "<="} {x}');page.keyboard.up(key)
  wait('Math.abs(rooftop.scene.player.body.velocity.x)<1')
 def solve_first():
  walk(7390);page.keyboard.press('e');wait("rooftop.scene.mode==='mechanism'")
  page.click('#dial-hint');assert '4x' in page.locator('#mechanism-feedback').inner_text()
  page.click('[data-token="5"]');page.click('#dial-test')
 restore(base)
 assert page.evaluate("!rooftop.scene.gateBodies['river-crossing']")
 page.click('#pause');wait("rooftop.scene.mode==='paused'")
 before=page.evaluate('rooftop.scene.elapsed');page.wait_for_timeout(200)
 assert page.evaluate('rooftop.scene.elapsed')==before
 page.click('#resume');wait("rooftop.scene.mode==='playing'")
 checks.append('Pause freezes active timer; Resume restores play')
 solve_first()
 saved=page.evaluate('JSON.parse(localStorage.getItem("lorong-save-v11"))')
 assert 'river-input' in saved['solvedGateIds'] and 'river-crossing' not in saved['solvedGateIds']
 restore(saved);walk(7390);page.keyboard.press('e');wait("rooftop.scene.mode==='mechanism'")
 assert page.locator('[data-order="fg"]').is_visible()
 page.click('[data-order="fg"]')
 wait("rooftop.scene.mode==='mechanism-transition'")
 assert page.evaluate("!rooftop.scene.gateBodies['river-crossing']")
 page.reload();page.wait_for_selector('#continue-btn:not([hidden])');page.click('#continue-btn')
 wait("rooftop.scene.mode==='playing'")
 assert page.evaluate("!!rooftop.scene.gateBodies['river-crossing']&&rooftop.scene.riverBridge.every(a=>a.y===972)")
 checks.append('First latch persists alone; mid-animation reload restores safe bridge')
 # Optional F can be exited without solving; upper branch can be skipped.
 restore({**base,'checkpointId':'e-crossing'})
 walk(5760)
 def jump(x):
  page.keyboard.down('d');page.keyboard.press('Space');wait('rooftop.scene.player.body.velocity.y<0')
  wait(f'rooftop.scene.player.x>={x}');page.keyboard.up('d');wait('rooftop.scene.player.body.blocked.down')
 jump(5890);jump(6050);walk(6226)
 page.keyboard.down('s');wait('!!rooftop.scene.climbing');wait('!rooftop.scene.climbing&&rooftop.scene.player.body.bottom===1134');page.keyboard.up('s')
 walk(6478);page.keyboard.down('w');wait('!!rooftop.scene.climbing');wait('!rooftop.scene.climbing&&rooftop.scene.player.body.bottom===918');page.keyboard.up('w')
 assert page.evaluate("!rooftop.scene.discoveredSecrets.has('f-inverse')")
 walk(7000);jump(7180);jump(7330)
 checks.append('Unsolved optional F entry and return via opposite ladder; main route reaches G')
 restore({**base,'checkpointId':'e-crossing'})
 walk(5760);jump(5890);jump(6050);walk(7000);jump(7180);jump(7330)
 assert page.evaluate("rooftop.scene.discoveredSecrets.size===0")
 checks.append('F lower route skipped safely')
 restore({**base,'checkpointId':'a-gap','solvedGateIds':[]})
 walk(1400);jump(1540);jump(1740);jump(1930);walk(2070)
 assert page.evaluate('rooftop.scene.discoveredSecrets.size===0&&rooftop.scene.mappingInputs.size===0')
 checks.append('C upper branch skipped: natural jumps on B main route reach lift')
 # Restart is a real UI action, with its existing confirmation accepted.
 page.on('dialog',lambda d:d.accept());page.click('#pause');page.click('#restart')
 wait("rooftop.scene.mode==='playing'&&rooftop.scene.player.x<150")
 checks.append('Restart returns to A')
 b.close()
(OUT/'logs/phase4-state-checks.json').write_text(json.dumps({'passed':not errors,'checks':checks,'pageErrors':errors},indent=2),encoding='utf-8')
print(json.dumps({'passed':not errors,'checks':checks,'pageErrors':errors}))

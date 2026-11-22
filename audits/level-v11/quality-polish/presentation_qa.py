"""Presentation QA with explicit checkpoint fixtures; not traversal evidence."""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent; (OUT/'screenshots/final').mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test'
errors=[];results=[]
base=dict(schemaVersion=1,layoutVersion=112,levelId='lorong-atas-bumbung-v11',checkpointId='g-river',solvedGateIds=['lift','number-span','water-crossing'],mappingInputs=[],collectedCoinIds=[],discoveredSecretIds=[],elapsedMs=1200)
with sync_playwright() as p:
 b=p.chromium.launch()
 for name,size in [('desktop',{'width':1440,'height':900}),('laptop',{'width':1365,'height':633}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
  ctx=b.new_context(viewport=size,is_mobile=name in ['portrait','landscape'],has_touch=name in ['portrait','landscape'])
  page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:errors.append(r.url));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  def wait(expr):page.wait_for_function('()=>'+expr)
  def shot(label):page.screenshot(path=str(OUT/f'screenshots/final/{name}-{label}.png'))
  def fits():
   page.wait_for_function('()=>{const r=document.querySelector("canvas").getBoundingClientRect();return Math.abs(r.width-innerWidth)<2&&Math.abs(r.height-innerHeight)<2}',timeout=3000)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight'),'document scroll'
   r=page.locator('canvas').bounding_box();assert abs(r['width']-size['width'])<2 and abs(r['height']-size['height'])<2,r
  started=time.monotonic();page.goto(BASE);page.wait_for_selector('#welcome:not([hidden])');fits();shot('title')
  page.click('#how-to-play');assert page.locator('#help').evaluate('(e)=>e.open');shot('help');page.click('#help-close')
  page.click('#settings-btn');page.check('#audio-mute');page.click('#settings-close')
  page.click('#level-select-btn');assert page.locator('#level1-status').inner_text()=='Belum mula';page.click('#level-select-close')
  page.click('#start');wait("rooftop.scene.mode==='playing'");assert page.evaluate('document.activeElement.id')=='game'
  fits();shot('hud');page.click('#pause');shot('pause');page.click('#resume')
  page.evaluate('(s)=>localStorage.setItem("lorong-save-v11",JSON.stringify(s))',base);page.reload();page.wait_for_selector('#continue-btn:not([hidden])');shot('continue-title');page.click('#continue-btn')
  wait("rooftop.scene.mode==='playing'");page.keyboard.down('d');wait('rooftop.scene.player.x>=7380');page.keyboard.up('d');wait('Math.abs(rooftop.scene.player.body.velocity.x)<1');shot('context')
  page.keyboard.press('e');wait("rooftop.scene.mode==='mechanism'");shot('math');fits()
  assert page.locator('#touch-controls').evaluate('(e)=>getComputedStyle(e).display')=='none'
  page.click('#dial-hint');assert '4x' in page.locator('#mechanism-feedback').inner_text()
  page.click('#dial-solution');assert 'x=5' in page.locator('#worked-solution').inner_text();shot('solution')
  page.click('#dial-solution');page.locator('#dial-close').focus();page.keyboard.press('Tab');assert page.evaluate('document.activeElement.closest("#mechanism")!==null')
  page.click('[data-token="4"]');page.click('#dial-test');assert '13' in page.locator('#mechanism-value').inner_text()
  page.click('[data-token="5"]');page.click('#dial-test');page.click('[data-order="fg"]')
  wait("rooftop.scene.mode==='mechanism-transition'");page.click('#pause');before=page.evaluate('rooftop.scene.riverBridge.map(a=>a.y)');page.wait_for_timeout(250);assert page.evaluate('rooftop.scene.riverBridge.map(a=>a.y)')==before
  page.click('#resume');wait("rooftop.scene.mode==='playing'&&!!rooftop.scene.gateBodies['river-crossing']");shot('bridge-safe')
  page.set_viewport_size({'width':size['width']-30,'height':size['height']-20});page.wait_for_timeout(250);page.set_viewport_size(size);page.wait_for_timeout(250);fits()
  results.append({'viewport':name,'pass':True,'sessionSeconds':round(time.monotonic()-started,2)})
  ctx.close()
 b.close()
(OUT/'presentation-qa.json').write_text(json.dumps({'passed':not errors,'results':results,'errors':errors},indent=2))
print(json.dumps({'passed':not errors,'results':results,'errors':errors}))

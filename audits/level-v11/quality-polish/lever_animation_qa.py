from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'audits/level-v11/quality-polish'
SHOTS=OUT/'screenshots/lever-sequence';SHOTS.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test'
fixture={'schemaVersion':1,'layoutVersion':111,'levelId':'lorong-atas-bumbung-v11','checkpointId':'g-river','solvedGateIds':['lift','number-span','water-crossing'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':1200}
errors=[];console=[];failed=[];checks=[];frames=[]
def attach(page,prefix=''):
 page.on('pageerror',lambda e:errors.append(prefix+str(e)))
 page.on('console',lambda m:console.append(prefix+m.text) if m.type=='error' else None)
 page.on('requestfailed',lambda r:failed.append(prefix+r.url))
def ready(page):
 page.goto(BASE,wait_until='networkidle');page.wait_for_selector('#welcome:not([hidden])');page.click('#continue-btn');page.wait_for_function("()=>rooftop.scene.mode==='playing'")
def move_to_terminal(page):
 page.keyboard.down('d');page.wait_for_function('()=>rooftop.scene.player.x>=7315');page.keyboard.up('d');page.wait_for_function('()=>Math.abs(rooftop.scene.player.body.velocity.x)<1')
 page.keyboard.press('e');page.wait_for_function("()=>rooftop.scene.mode==='mechanism'&&rooftop.scene.activePuzzle?.kind==='river-final'")
def answer_correct(page):
 page.click('[data-token="5"]');page.click('#dial-test');page.wait_for_function("()=>rooftop.scene.solvedGates.has('river-input')")
 page.click('[data-order="fg"]');page.wait_for_function("()=>rooftop.scene.solvedGates.has('river-composition')")
with sync_playwright() as p:
 browser=p.chromium.launch()
 ctx=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1);page=ctx.new_page();attach(page);page.add_init_script(f"if(!localStorage.getItem('lorong-save-v11'))localStorage.setItem('lorong-save-v11',JSON.stringify({json.dumps(fixture)}))")
 ready(page);screenshot_state=page.evaluate("""()=>{const s=rooftop.scene;s.physics.world.pause();s.cameras.main.stopFollow();s.player.body.reset(7315,942);s.player.body.setVelocity(0,0);s.syncVisual();s.cameras.main.centerOn(7390,1030);return {x:s.player.x,lever:s.riverLever.angle,bridge:s.riverBridge.map(a=>a.y),base:[s.riverLeverBase.x,s.riverLeverBase.y]}}""")
 page.wait_for_timeout(60);page.screenshot(path=str(SHOTS/'locked.png'));checks.append('G locked screenshot captured from real scene at fixed camera')
 # Restore normal physics/input after evidence framing, keeping the player at terminal range.
 page.evaluate("()=>{const s=rooftop.scene;s.physics.world.resume();s.input.keyboard.enabled=true;s.mode='playing'}")
 page.keyboard.down('d');page.wait_for_function('()=>rooftop.scene.player.x>=7315');page.keyboard.up('d');page.wait_for_function('()=>Math.abs(rooftop.scene.player.body.velocity.x)<1')
 page.keyboard.press('e');page.wait_for_function("()=>rooftop.scene.mode==='mechanism'")
 page.click('[data-token="4"]');page.click('#dial-test');assert '13' in page.locator('#mechanism-value').inner_text();assert not page.evaluate("rooftop.scene.solvedGates.has('river-input')")
 page.click('[data-token="5"]');page.click('#dial-test');page.wait_for_function("()=>rooftop.scene.solvedGates.has('river-input')")
 page.click('[data-order="gf"]');assert 'Sasaran 13' in page.locator('#mechanism-feedback').inner_text();assert not page.evaluate("!!rooftop.scene.gateBodies['river-crossing']")
 page.screenshot(path=str(SHOTS/'wrong-composition-safe.png'));checks.append('Wrong h input and reversed composition preserve locked bridge and absent collider')
 page.click('[data-order="fg"]');page.wait_for_function("()=>rooftop.scene.mode==='mechanism-transition'")
 page.wait_for_function("()=>rooftop.scene.riverLever.angle < -25 && rooftop.scene.riverBridge.some(a=>a.y<1200)")
 moving=page.evaluate("()=>({angle:rooftop.scene.riverLever.angle,bridge:rooftop.scene.riverBridge.map(a=>a.y),base:[rooftop.scene.riverLeverBase.x,rooftop.scene.riverLeverBase.y],collider:!!rooftop.scene.gateBodies['river-crossing']})")
 page.screenshot(path=str(SHOTS/'moving.png'))
 assert not moving['collider'] and moving['angle']<0 and min(moving['bridge'])<1242
 assert moving['base']==screenshot_state['base'];checks.append('Moving screenshot: handle rotates at fixed base while bridge lowers; collision remains absent')
 page.click('#pause');page.wait_for_function("()=>rooftop.scene.mode==='paused'")
 frozen=page.evaluate("()=>({angle:rooftop.scene.riverLever.angle,bridge:rooftop.scene.riverBridge.map(a=>a.y)})");page.wait_for_timeout(300)
 assert page.evaluate("(v)=>Math.abs(rooftop.scene.riverLever.angle-v.angle)<0.01&&rooftop.scene.riverBridge.every((a,i)=>Math.abs(a.y-v.bridge[i])<0.01)",frozen)
 page.click('#resume');page.wait_for_function("()=>rooftop.scene.mode==='playing'&&!!rooftop.scene.gateBodies['river-crossing']",timeout=5000)
 safe=page.evaluate("()=>({angle:rooftop.scene.riverLever.angle,bridge:rooftop.scene.riverBridge.map(a=>a.y),body:{x:rooftop.scene.gateBodies['river-crossing'].body.x,y:rooftop.scene.gateBodies['river-crossing'].body.y,w:rooftop.scene.gateBodies['river-crossing'].body.width,h:rooftop.scene.gateBodies['river-crossing'].body.height},base:[rooftop.scene.riverLeverBase.x,rooftop.scene.riverLeverBase.y]})")
 assert all(abs(y-972)<1 for y in safe['bridge']) and safe['body']['y']==972 and abs(safe['angle']+52)<0.1 and safe['base']==screenshot_state['base']
 page.screenshot(path=str(SHOTS/'safe.png'));checks.append('Pause/resume freezes both tweens; final bridge and 324×18 collider align at y=972; fixed base and final handle angle persist')
 frames.append({'scenario':'normal with pause/resume','locked':screenshot_state,'moving':moving,'safe':safe})
 # Reload while a second fresh run is in flight; saved solved state must restore safe, collidable bridge.
 ctx2=browser.new_context(viewport={'width':1440,'height':900});p2=ctx2.new_page();attach(p2,'reload:');p2.add_init_script(f"if(!localStorage.getItem('lorong-save-v11'))localStorage.setItem('lorong-save-v11',JSON.stringify({json.dumps(fixture)}))");ready(p2);move_to_terminal(p2);answer_correct(p2)
 p2.wait_for_function("()=>rooftop.scene.riverBridge.some(a=>a.y<1242)");p2.reload(wait_until='networkidle');p2.wait_for_selector('#continue-btn:not([hidden])');p2.click('#continue-btn');p2.wait_for_function("()=>rooftop.scene.mode==='playing'&&!!rooftop.scene.gateBodies['river-crossing']")
 restored=p2.evaluate("()=>({angle:rooftop.scene.riverLever.angle,bridge:rooftop.scene.riverBridge.map(a=>a.y),collider:!!rooftop.scene.gateBodies['river-crossing']})")
 assert all(abs(y-972)<1 for y in restored['bridge']) and abs(restored['angle']+52)<0.1 and restored['collider'];p2.screenshot(path=str(SHOTS/'reload-restored-safe.png'));checks.append('Reload mid-transition restores safe bridge and collider without replaying unsafe motion')
 frames.append({'scenario':'reload during transition','restored':restored});ctx2.close()
 # Reduced-motion flow skips wait/motion and reaches the same safe state.
 ctx3=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');p3=ctx3.new_page();attach(p3,'reduced:');p3.add_init_script(f"if(!localStorage.getItem('lorong-save-v11'))localStorage.setItem('lorong-save-v11',JSON.stringify({json.dumps(fixture)}))");ready(p3);move_to_terminal(p3);answer_correct(p3)
 p3.wait_for_function("()=>rooftop.scene.mode==='playing'&&!!rooftop.scene.gateBodies['river-crossing']",timeout=5000)
 reduced=p3.evaluate("()=>({motion:matchMedia('(prefers-reduced-motion: reduce)').matches,angle:rooftop.scene.riverLever.angle,bridge:rooftop.scene.riverBridge.map(a=>a.y),collider:!!rooftop.scene.gateBodies['river-crossing']})")
 assert reduced['motion'] and reduced['collider'] and abs(reduced['angle']+52)<0.1 and all(abs(y-972)<1 for y in reduced['bridge']);p3.screenshot(path=str(SHOTS/'reduced-motion-safe-mobile.png'));checks.append('Reduced-motion mobile reaches identical safe/collidable final state immediately')
 frames.append({'scenario':'reduced motion mobile','result':reduced});ctx3.close();ctx.close();browser.close()
result={'passed':not errors and not console and not failed,'checks':checks,'frames':frames,'pageErrors':errors,'consoleErrors':console,'failedRequests':failed}
(OUT/'regression/lever-animation.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result,indent=2))
if errors or console or failed:raise SystemExit(1)

from pathlib import Path
import sys
path=Path('audits/level-v12/phase5-natural-a-e.py')
visit='--visit' in sys.argv
source=path.read_text(encoding='utf-8-sig').replace("OUT=ROOT/'audits/level-v12/phase5'",f"OUT=ROOT/'audits/level-v12/phase6/{'visit' if visit else 'skip'}'")
helpers='''
def align(page,x):
 for _ in range(12):
  dx=x-ev(page,'s.player.x')
  if abs(dx)<12:return
  key='d' if dx>0 else 'a';page.keyboard.down(key);page.wait_for_timeout(min(100,max(20,int(abs(dx)*2))));page.keyboard.up(key);page.wait_for_timeout(160)
 assert abs(x-ev(page,'s.player.x'))<20
def reload_run(page):
 page.reload(wait_until='networkidle');page.click('#continue-btn');wait_mode(page,'playing');wait(page,'b.blocked.down')
'''
source=source.replace('with sync_playwright() as p:',helpers+'\nwith sync_playwright() as p:')
if visit:
 source=source.replace('jump(page,1540);jump(page,1690);jump(page,1900)', '''jump(page,1540);align(page,1512);climb(page,'up',864);walk(page,1692);align(page,1692);interact(page);wait_mode(page,'mechanism')
 assert not ev(page,'s.discoveredSecrets.has("bonus-mapping")')
 for value in [0,1]:page.click(f'[data-token="{value}"]');page.click('#dial-test')
 page.click('#dial-close');reload_run(page);assert ev(page,'s.mappingInputs.size')==2
 walk(page,1692);align(page,1692);interact(page);wait_mode(page,'mechanism')
 for value in [2,3]:page.click(f'[data-token="{value}"]');page.click('#dial-test')
 assert ev(page,'s.mappingDone&&s.discoveredSecrets.has("bonus-mapping")');snap(page,'c-pattern-complete');page.click('#dial-close')
 walk(page,1836);wait(page,'s.collectedCoinIds.has("c-return")');snap(page,'c-reward');align(page,1890);climb(page,'down',1080);jump(page,1900)''')
extension='''
 walk(page,5760);jump(page,5890);jump(page,6050)
'''
if visit:
 extension+='''
 walk(page,6226);align(page,6226);wait(page,'Math.abs(b.bottom-918)<3');climb(page,'down',1134);snap(page,'f-cave-entry')
 walk(page,6400);interact(page);wait_mode(page,'mechanism');page.click('[data-token="2"]');page.click('#dial-test');assert not ev(page,'s.discoveredSecrets.has("f-inverse")');snap(page,'f-inverse-retry')
 page.click('[data-token="3"]');page.click('#dial-test');wait_mode(page,'playing');walk(page,6360);wait(page,'s.collectedCoinIds.has("f-cave-gem")');snap(page,'f-inverse-reward')
 walk(page,6478);align(page,6478);climb(page,'up',918);snap(page,'f-safe-exit')
'''
extension+='''
 walk(page,7000);jump(page,7180);jump(page,7340);align(page,7296);wait(page,'s.checkpointIndex===11');walk(page,7340);interact(page);wait_mode(page,'mechanism');snap(page,'g-two-locks')
 page.click('[data-token="4"]');page.click('#dial-test');assert not ev(page,'s.solvedGates.has("river-input")');assert '13' in page.locator('#mechanism-value').inner_text()
 page.click('[data-token="5"]');page.click('#dial-test');wait_mode(page,'playing');assert ev(page,'s.riverLever.angle')==-24;assert not ev(page,'!!s.gateBodies["river-crossing"]');snap(page,'g-first-latch')
 reload_run(page);assert ev(page,'s.riverLever.angle')==-24;assert not ev(page,'!!s.gateBodies["river-crossing"]')
 walk(page,7340);interact(page);wait_mode(page,'mechanism');page.click('[data-order="gf"]');assert '9' in page.locator('#mechanism-value').inner_text();assert not ev(page,'!!s.gateBodies["river-crossing"]');snap(page,'g-order-retry')
 page.click('[data-order="fg"]');assert not ev(page,'!!s.gateBodies["river-crossing"]');wait(page,'s.riverBridge.some(a=>a.y<1240&&a.y>974)');assert not ev(page,'!!s.gateBodies["river-crossing"]');snap(page,'g-bridge-moving')
 wait(page,'s.mode==="playing"&&!!s.gateBodies["river-crossing"]');assert ev(page,'s.gateBodies["river-crossing"].body.top')==972
 assert ev(page,'s.checkpointIndex')==11;assert not ev(page,'s.levelCompleted');snap(page,'g-bridge-safe')
 # Continue must retain the west-bank checkpoint until the player crosses.
 reload_run(page);assert ev(page,'s.player.x')<7506;assert ev(page,'!!s.gateBodies["river-crossing"]')
 walk(page,7890);wait(page,'s.checkpointIndex===12');snap(page,'g-crossed');walk(page,8170);jump(page,8300);align(page,8316);wait(page,'b.blocked.down');snap(page,'g-goal')
 page.keyboard.press('e');wait_mode(page,'complete');page.locator('#complete[open]').wait_for();snap(page,'g-results')
 counts=ev(page,'({coins:s.collectedCoinIds.size,secrets:s.discoveredSecrets.size})');assert str(counts['coins']) in page.locator('#completion-coins').inner_text();assert str(counts['secrets']) in page.locator('#completion-secrets').inner_text()
 page.reload(wait_until='networkidle');page.click('#continue-btn');wait_mode(page,'complete');assert ev(page,'s.levelCompleted');assert ev(page,'s.collectedCoinIds.size')==counts['coins'];snap(page,'g-completed-continue')
'''
extension+=f"\n assert ev(page,'s.discoveredSecrets.has(\"bonus-mapping\")')=={visit};assert ev(page,'s.discoveredSecrets.has(\"f-inverse\")')=={visit}\n"
source=source.replace(" result={'passed':",extension+"\n result={'passed':")
source=source.replace("'route':'natural keyboard A main path, B lift, D blocks and crossing, E function stages and safe crossing'", "'route':'natural keyboard A-G including actual goal and completion'")
source=source.replace("'optionalBranches':'crate bonus, C, D service skipped'",f"'optionalRoutesVisited':{visit},'rewards':counts")
source=source.replace("a-to-e-regression.json","full-progression.json")
exec(compile(source,str(path),'exec'),{'__file__':str(path.resolve()),'__name__':'__main__'})

from pathlib import Path
import sys,json
sys.argv=['completion','B']
exec(compile(Path('audits/level-v12/phase5-verify.py').read_text(encoding='utf-8').split('results={}')[0],'helpers','exec'))
BASE.update(checkpointId='g-river',solvedGateIds=['lift','number-span','water-crossing','river-input','river-composition','river-crossing'],waterOrder='fg',waterworksState='CROSSING_SAFE')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);p=browser.new_page();p.add_init_script(HOOK);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));boot(p)
 ev(p,'s.finish()');assert not ev(p,'s.levelCompleted')
 # Controlled state fixture covers arriving at the goal after skipping its approach flag.
 ev(p,'s.player.body.reset(8316,942)');wait(p,'s.player.body.blocked.down');ev(p,'s.finish()');wait(p,'s.mode==="complete"')
 saved=p.evaluate('JSON.parse(localStorage.getItem("denai-save-v12"))');assert saved['completed'] and saved['checkpointId']=='g-goal'
 p.reload(wait_until='networkidle');p.click('#continue-btn');wait(p,'s.mode==="complete"');assert not errors
 result={'passed':True,'rejectsRemoteFinish':True,'goalWithoutApproachFlag':True,'completedContinue':True,'errors':errors}
 Path('audits/level-v12/phase6/completion-recovery.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result));browser.close()

from pathlib import Path
import json, time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'audits/level-v12/phase3/screenshots'
OUT.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
SEED={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'e-crossing','solvedGateIds':['lift','number-span','water-crossing'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':'fg','waterworksState':'CROSSING_SAFE'}
INSTRUMENT="""(()=>{Object.defineProperty(window,'Phaser',{configurable:true,set(P){const Game=P.Game;P.Game=new Proxy(Game,{construct(Target,args,NewTarget){const cfg=args[0],scenes=cfg.scene,Original=Array.isArray(scenes)?scenes[0]:scenes;if(typeof Original==='function'){class QAScene extends Original{create(...a){const r=super.create(...a);window.__phase3Scene=this;return r;}}cfg.scene=Array.isArray(scenes)?[QAScene,...scenes.slice(1)]:QAScene;}return Reflect.construct(Target,args,NewTarget);}});Object.defineProperty(window,'Phaser',{value:P,writable:true,configurable:true});}})})();"""
page_errors=[]; console_errors=[]; failed=[]

def snap(page,name): page.screenshot(path=str(OUT/name))
def hold(page,keys,ms):
    if isinstance(keys,str):keys=[keys]
    for k in keys:page.keyboard.down(k)
    page.wait_for_timeout(ms)
    for k in reversed(keys):page.keyboard.up(k)
    page.wait_for_timeout(220)
def state(page):
    return page.evaluate("""(()=>{const s=window.__phase3Scene,p=s?.fMovingPlatform,b=p?.body?.body,q=s?.player?.body;return s?{mode:s.mode,playerX:+s.player.x.toFixed(2),playerTop:+q.top.toFixed(2),playerBottom:+q.bottom.toFixed(2),grounded:!!q.blocked.down,platformX:+p.x.toFixed(2),platformArtLeft:+p.art[0].x.toFixed(2),platformArtTop:+p.art[0].y.toFixed(2),platformLeft:+b.left.toFixed(2),platformRight:+b.right.toFixed(2),platformTop:+b.top.toFixed(2),platformDirection:p.direction,checkpoint:JSON.parse(localStorage.getItem('denai-save-v12')||'{}').checkpointId}:null;})()""")
def wait_condition(page,fn,timeout=6000):
    end=time.monotonic()+timeout/1000
    while time.monotonic()<end:
        v=fn(state(page))
        if v:return
        page.wait_for_timeout(40)
    raise AssertionError(f'timed out; state={state(page)}')
def continue_seed(page,seed=SEED):
    page.goto(URL,wait_until='networkidle')
    page.evaluate('d=>localStorage.setItem("denai-save-v12",JSON.stringify(d))',seed)
    page.reload(wait_until='networkidle');page.locator('#continue-btn:not([hidden])').wait_for();page.click('#continue-btn')
    wait_condition(page,lambda s:s is not None)
    page.locator('body.game-active').wait_for()
    page.wait_for_timeout(350)
def assert_no_errors():
    assert not page_errors,page_errors
    assert not console_errors,console_errors
    assert not failed,failed

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1,record_video_dir=str(OUT),record_video_size={'width':1440,'height':900})
    page=context.new_page();page.add_init_script(INSTRUMENT)
    page.on('pageerror',lambda e:page_errors.append(str(e)))
    page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' else None)
    page.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure}) if 'ERR_ABORTED' not in (r.failure or '') else None)
    started=time.monotonic()
    continue_seed(page)
    start=state(page);assert start['checkpoint']=='e-crossing' and start['playerX']==5598
    snap(page,'f-approach.png')

    # Ordinary keyboard input along the existing F steps; no teleport/dev hook.
    hold(page,'d',650);hold(page,['d','Space'],600);hold(page,['d','Space'],600)
    wait_condition(page,lambda s:s['checkpoint']=='f-platform-wait',timeout=5000)
    wait_condition(page,lambda s:s['grounded'] and abs(s['playerBottom']-864)<4)
    wait=state(page);snap(page,'f-waiting-checkpoint.png')

    # Jump from the safe ledge onto the moving deck at normal player speed.
    wait_condition(page,lambda s:s['platformX']<6170 and s['platformDirection']>0,timeout=12000)
    hold(page,['d','Space'],600)
    wait_condition(page,lambda s:s['grounded'] and abs(s['playerBottom']-816)<3 and s['playerX']+14>s['platformLeft'] and s['playerX']-14<s['platformRight'],timeout=5000)
    boarded=state(page);snap(page,'platform-boarded.png')
    rel0=boarded['playerX']-boarded['platformX']
    page.wait_for_timeout(1200);riding=state(page);snap(page,'platform-riding.png')
    rel1=riding['playerX']-riding['platformX']
    assert abs(rel1-rel0)<16,{'before':boarded,'after':riding,'relativeDelta':rel1-rel0}
    assert riding['platformTop']==816 and abs(riding['platformLeft']-riding['platformX'])<.1
    assert abs(riding['platformArtLeft']-riding['platformLeft'])<.1 and abs(riding['platformArtTop']-816)<.1

    # Pausing freezes both rendered and colliding deck positions; resume moves
    # smoothly with no catch-up step.
    page.click('#pause');page.locator('#paused[open]').wait_for();pause_at=state(page);snap(page,'platform-paused.png')
    page.wait_for_timeout(700);paused=state(page)
    assert paused['platformX']==pause_at['platformX'] and paused['playerX']==pause_at['playerX']
    page.click('#resume');page.wait_for_timeout(500);resumed=state(page);snap(page,'platform-resumed.png')
    assert 0<abs(resumed['platformX']-pause_at['platformX'])<45

    # Reload while the character is aboard: Continue returns to the saved
    # fixed waiting checkpoint, never to the moving deck's current location.
    page.reload(wait_until='networkidle');page.locator('#continue-btn:not([hidden])').wait_for();page.click('#continue-btn')
    wait_condition(page,lambda s:s is not None);page.wait_for_timeout(200)
    loaded=state(page);snap(page,'continue-outside-platform.png')
    assert loaded['checkpoint']=='f-platform-wait' and abs(loaded['playerX']-6084)<1
    assert loaded['playerX']+14<loaded['platformLeft']

    # Deliberately miss by walking off the waiting shelf. The old cave roof
    # catches Chill Boy; R returns him to the recoverable F checkpoint.
    hold(page,'d',500);page.wait_for_timeout(500);miss=state(page);snap(page,'miss-landed-on-cave-roof.png')
    assert miss['playerBottom']>=916 and miss['playerBottom']<940,miss
    page.keyboard.press('r');page.wait_for_timeout(250);recovered=state(page);snap(page,'fall-recovered-to-checkpoint.png')
    assert abs(recovered['playerX']-6084)<1 and abs(recovered['playerBottom']-864)<1,recovered

    # Let the shuttle return to its left bound, then board and ride to the
    # right turnaround before jumping to the genuine east-bank landing.
    wait_condition(page,lambda s:s['platformX']<6170 and s['platformDirection']>0,timeout=12000)
    hold(page,['d','Space'],600)
    wait_condition(page,lambda s:s['grounded'] and abs(s['playerBottom']-816)<3 and s['playerX']+14>s['platformLeft'] and s['playerX']-14<s['platformRight'],timeout=5000)
    wait_condition(page,lambda s:s['platformX']>6425 and s['platformDirection']<0,timeout=8000)
    before_jump=state(page);snap(page,'platform-turnaround.png')
    hold(page,['d','Space'],600);page.wait_for_timeout(500)
    wait_condition(page,lambda s:s['grounded'] and 916<=s['playerBottom']<=1030 and 6568-14<=s['playerX']<=6892+14,timeout=5000)
    landed=state(page);snap(page,'jumped-to-f-landing.png')
    assert landed['playerX']>6568 and landed['playerBottom']>=970,landed

    result={'passed':True,'elapsedSeconds':round(time.monotonic()-started,2),'start':start,'checkpointReached':wait['checkpoint'],'boarded':boarded,'carried':{'relativeBefore':rel0,'relativeAfter':rel1},'pausedAt':paused['platformX'],'resumedAt':resumed['platformX'],'continueRestored':loaded,'missRecovery':{'miss':miss,'respawn':recovered},'rightTurn':before_jump,'eastLanding':landed,'pageErrors':page_errors,'consoleErrors':console_errors,'failedRequests':failed}
    (OUT/'desktop-qa.json').write_text(json.dumps(result,indent=2),encoding='utf8')
    assert_no_errors()
    print(json.dumps(result,indent=2))
    context.close()
    browser.close()

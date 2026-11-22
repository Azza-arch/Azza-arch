"""Natural-input A/B acceptance. No body resets, teleports or state writes."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[4]/'audits/level-v9/ab-geometry-v9-9'
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={'width':1440,'height':1000})
    errors=[];pg.on('pageerror',lambda e: errors.append(str(e)))
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle');pg.click('#start')
    def wait(expr): pg.wait_for_function('()=>{let s=rooftop.scene,b=s.player.body,c=s.crate.body;return '+expr+'}',timeout=15000)
    def state(): return pg.evaluate('''()=>{let s=rooftop.scene,b=s.player.body;return {x:s.player.x,feet:b.bottom,crate:s.crate.x,plate:s.crateSwitchActive,coins:[...s.collectedCoinIds]}}''')
    def walk(x):
        right=state()['x']<x;key='d' if right else 'a'
        pg.keyboard.down(key);wait(f's.player.x {">=" if right else "<="} {x}');pg.keyboard.up(key);wait('Math.abs(b.velocity.x)<1')
    def jump_to(x,feet):
        right=state()['x']<x;key='d' if right else 'a'
        pg.keyboard.press('Space');wait('b.velocity.y<0');pg.keyboard.down(key)
        wait(f's.player.x {">=" if right else "<="} {x}');pg.keyboard.up(key);wait('b.blocked.down || b.touching.down')
        assert abs(state()['feet']-feet)<3,state()
    wait('b.blocked.down')
    initial=state()['crate'];pg.wait_for_timeout(600);assert state()['crate']==initial
    walk(140);assert state()['crate']==initial
    pg.keyboard.down('d');wait('s.crateSwitchActive');pg.keyboard.up('d');wait('Math.abs(b.velocity.x)<1 && Math.abs(c.velocity.x)<1')
    assert pg.evaluate('!!rooftop.scene.cratePlatformBody')
    print('Contact push and pressure plate:',state(),flush=True)
    # Vault past the crate onto clear ground, then try the active ledge
    # from ground level: neither ledge nor reward may be reached directly.
    jump_to(468,1100)
    pg.keyboard.press('Space');wait('b.velocity.y<0');wait('b.blocked.down')
    assert abs(state()['feet']-1100)<3 and 'coin-a' not in state()['coins'],state()
    print('Active ledge and reward cannot be reached by direct ground jump',flush=True)
    # Approach the far side and confirm leftward contact pushing retracts it.
    pg.keyboard.down('a');wait('!s.crateSwitchActive');pg.keyboard.up('a');wait('Math.abs(b.velocity.x)<1')
    assert not pg.evaluate('!!rooftop.scene.cratePlatformBody')
    pg.keyboard.press('r');wait('s.player.x<100 && b.blocked.down')
    pg.keyboard.press('c');wait('Math.abs(s.crate.x-220)<1 && !s.crateSwitchActive')
    pg.keyboard.down('d');wait('s.crateSwitchActive');pg.keyboard.up('d');wait('Math.abs(b.velocity.x)<1')
    cx=state()['crate'];walk(cx-48)
    jump_to(cx-5,1052)
    print('Mounted crate naturally:',state(),flush=True)
    jump_to(424,980)
    assert 'coin-a' in state()['coins'] and pg.evaluate('rooftop.scene.crateLedgeDiscovered'),state()
    pg.screenshot(path=str(OUT/'after/crate-solved.png'))
    print('Optional ledge and coin reached via crate:',state(),flush=True)
    # Return/reset leaves the saved collectible intact.
    pg.keyboard.press('r');wait('s.player.x<100 && b.blocked.down')
    pg.keyboard.press('c');wait('Math.abs(s.crate.x-220)<1 && !s.crateSwitchActive')
    assert 'coin-a' in state()['coins']
    print('Reset preserves collectible:',state(),flush=True)
    pg.reload(wait_until='networkidle');pg.click('#continue-btn');wait('s.mode==="playing" && b.blocked.down')
    assert 'coin-a' in state()['coins']
    print('Save/Continue preserves relocated ledge coin:',state(),flush=True)
    # Mandatory gap; stop at the solid hill, checking the distant crate.
    pg.keyboard.down('d');wait('s.player.x>=500');pg.keyboard.press('Space');wait('b.velocity.y<0')
    wait('s.player.x>=675');pg.keyboard.up('d');wait('b.blocked.down')
    pg.keyboard.press('c');wait('Math.abs(s.crate.x-220)<1')
    pg.keyboard.down('d');pg.wait_for_timeout(1000);pg.keyboard.up('d')
    assert abs(state()['crate']-220)<1,state()
    assert abs(state()['x']-754)<1,state()
    print('Remote terrain contact does not move crate:',state(),flush=True)
    # Ascend all three real, solid steps without ladder assistance.
    jump_to(802,1046);jump_to(910,992);jump_to(1008,938)
    print('Three solid 54px terrain steps climbed naturally:',state(),flush=True)
    walk(710);pg.keyboard.down('s');wait('b.bottom>=1099 && !s.climbing');pg.keyboard.up('s');wait('b.blocked.down')
    pg.keyboard.down('w');wait('b.bottom<=939 && !s.climbing');pg.keyboard.up('w');wait('b.blocked.down')
    assert abs(state()['feet']-938)<3
    print('Ladder descent and ascent:',state(),flush=True)
    pg.keyboard.press('r');wait('s.player.x<100 && b.blocked.down')
    pg.keyboard.press('c');wait('Math.abs(s.crate.x-220)<1')
    pg.keyboard.down('d');wait('s.crate.x>552');pg.keyboard.up('d')
    wait('Math.abs(s.crate.x-220)<1 && c.blocked.down')
    assert not pg.evaluate('!!rooftop.scene.cratePlatformBody')
    print('Crate fall auto-recovery after the relocated gap:',state(),flush=True)
    assert not errors,errors
    (OUT/'logs/ab-result.json').write_text(json.dumps({'passed':True,'final':state(),'errors':errors},indent=2))
    b.close()

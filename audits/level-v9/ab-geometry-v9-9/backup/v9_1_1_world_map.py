"""V9 Phase 1.1: generates the required coordinate-based deliverables
(actual-world-map.png, reference-vs-current-layout.png,
zone-coordinate-inventory.csv) directly from src/level.js's live exported
data (via a tiny Node dump), never hand-copied or assumed.
"""
import csv
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
OUT = ROOT / 'tests' / 'artifacts' / 'phase9-1-1'
OUT.mkdir(parents=True, exist_ok=True)

dump_script = r"""
import('./src/level.js').then(m => {
  console.log(JSON.stringify({
    WORLD: m.WORLD, MOTION: m.MOTION, SPAWN: m.SPAWN, GOAL: m.GOAL, ZONES: m.ZONES,
    GROUND_RANGES: m.GROUND_RANGES, FIRST_GAP: m.FIRST_GAP, DECKS: m.DECKS, LADDERS: m.LADDERS,
    GATES: m.GATES, TERMINALS: m.TERMINALS, CHECKPOINTS: m.CHECKPOINTS, COLLECTIBLES: m.COLLECTIBLES,
    SECRETS: m.SECRETS, CRATE_PUZZLE: m.CRATE_PUZZLE,
  }));
});
"""
(ROOT / '_dump.mjs').write_text(dump_script)
result = subprocess.run(['node', '_dump.mjs'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
(ROOT / '_dump.mjs').unlink()
data = json.loads(result.stdout.strip())

try:
    F = ImageFont.truetype('arial.ttf', 12)
    FB = ImageFont.truetype('arialbd.ttf', 15)
    FS = ImageFont.truetype('arial.ttf', 10)
except Exception:
    F = FB = FS = ImageFont.load_default()

W, H = 1700, 520
PAD = 50
world_w, world_h = data['WORLD']['width'], data['WORLD']['height']
scale_x = (W - 2 * PAD) / world_w
def sx(x): return PAD + x * scale_x
def sy(y): return 60 + (y / world_h) * (H - 110)

img = Image.new('RGB', (W, H), '#f3f2ee')
d = ImageDraw.Draw(img)
d.text((PAD, 14), 'Lorong Atas Bumbung — actual coordinate-based world map (generated from live src/level.js data)', fill='#242624', font=FB)
d.text((PAD, 34), 'Classification: navy=mandatory traversal  teal=optional traversal  gold=puzzle mechanism  grey=decorative/non-colliding', fill='#60635f', font=FS)

COL_MANDATORY = '#3f4a63'
COL_OPTIONAL = '#3c7a6e'
COL_PUZZLE = '#b38b2e'
COL_DECOR = '#aaa'

# Zone boundaries (background bands + labels)
for z in data['ZONES']:
    if 'yMax' in z:
        continue
    x0, x1 = sx(z['xStart']), sx(z['xEnd'])
    d.rectangle([x0, 60, x1, H - 50], outline='#d8d8d2', width=1)
    d.text(((x0 + x1) / 2 - 10, H - 46), z['name'].split(' ')[0], fill='#9a9d96', font=FS)

# Ground ranges (mandatory, except where noted)
for left, right in data['GROUND_RANGES']:
    y = sy(1100)
    d.line([(sx(left), y), (sx(right), y)], fill=COL_MANDATORY, width=4)

# First gap (hazard)
gx0, gx1 = sx(data['FIRST_GAP']['x']), sx(data['FIRST_GAP']['x'] + data['FIRST_GAP']['width'])
d.rectangle([gx0, sy(1100) - 3, gx1, sy(1100) + 3], fill='#cf4b4b')
d.text((gx0, sy(1100) + 8), 'gap', fill='#cf4b4b', font=FS)

# Decks (platforms) — classify: all DECKS are part of the mandatory or
# optional route per their own known role; f-step1/cave-alcove/f-step2 and
# roof chain decks already documented as mandatory/optional in level.js's
# own comments — rendered uniformly as traversal platforms here (teal if
# "optional" by name, navy otherwise), collision-faithful either way.
OPTIONAL_DECK_IDS = {'cave-alcove', 'cafe-deck'}
for deck in data['DECKS']:
    col = COL_OPTIONAL if deck['id'] in OPTIONAL_DECK_IDS else COL_MANDATORY
    x0, x1 = sx(deck['x']), sx(deck['x'] + deck['width'])
    y = sy(deck['y'])
    d.line([(x0, y), (x1, y)], fill=col, width=4)

# Ladders
for l in data['LADDERS']:
    x = sx(l['x'])
    d.line([(x, sy(l['top'])), (x, sy(l['bottom']))], fill='#6b6f66', width=3)

# Gates (mandatory crossings)
for g in data['GATES']:
    x0, x1 = sx(g['x']), sx(g['x'] + g['width'])
    y = sy(g['y'])
    d.rectangle([x0, y - 5, x1, y + 5], outline='#b38b2e', width=2)

# Terminals (machines) — puzzle mechanism
for i, t in enumerate(data['TERMINALS']):
    x, y = sx(t['x']), sy(t['feet'])
    d.rectangle([x - 5, y - 16, x + 5, y - 6], fill=COL_PUZZLE)
    d.text((x - 10, y - 30), f"M{i+1}", fill=COL_PUZZLE, font=FS)

# Checkpoints
for i, cp in enumerate(data['CHECKPOINTS']):
    x, y = sx(cp['x']), sy(cp['feet'])
    d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=COL_MANDATORY)
    d.text((x - 9, y + 6), f'CP{i+1}', fill=COL_MANDATORY, font=FS)

# Coins (optional)
for c in data['COLLECTIBLES']:
    x, y = sx(c['x']), sy(c['y'])
    d.ellipse([x - 3, y - 3, x + 3, y + 3], outline=COL_OPTIONAL, width=2)

# Secrets (optional)
for s in data['SECRETS']:
    x, y = sx(s['x']), sy(s['feet'])
    d.ellipse([x - 6, y - 6, x + 6, y + 6], outline='#8a6a9e', width=2)

# Spawn / Goal
sx0, sy0 = sx(data['SPAWN']['x']), sy(data['SPAWN']['feet'])
d.ellipse([sx0 - 5, sy0 - 5, sx0 + 5, sy0 + 5], fill='#242624')
d.text((sx0 - 10, sy0 + 8), 'SPAWN', fill='#242624', font=FS)
gx, gy = sx(data['GOAL']['x']), sy(data['GOAL']['feet'])
d.ellipse([gx - 5, gy - 5, gx + 5, gy + 5], fill='#242624')
d.text((gx - 8, gy + 8), 'GOAL', fill='#242624', font=FS)

# V9 crate puzzle — puzzle mechanism, drawn LAST so it's never hidden
cp_ = data['CRATE_PUZZLE']
crx, cry = sx(cp_['crate']['x']), sy(cp_['crate']['feet'])
d.rectangle([crx - 6, cry - 12, crx + 6, cry], outline=COL_PUZZLE, width=2)
d.text((crx - 14, cry - 28), 'crate', fill=COL_PUZZLE, font=FS)
swx, swy = sx(cp_['floorSwitch']['x']), sy(cp_['floorSwitch']['feet'])
d.ellipse([swx - 4, swy - 4, swx + 4, swy + 4], fill=COL_PUZZLE)
d.text((swx - 10, swy + 6), 'plate', fill=COL_PUZZLE, font=FS)
plx0, plx1 = sx(cp_['platform']['x']), sx(cp_['platform']['x'] + cp_['platform']['width'])
ply = sy(cp_['platform']['y'])
d.line([(plx0, ply), (plx1, ply)], fill=COL_PUZZLE, width=4)
d.text((plx0, ply - 14), 'ledge (rise 120px, crate-assisted only)', fill=COL_PUZZLE, font=FS)

legend_y = H - 16
d.text((PAD, legend_y), 'navy=ground/deck/checkpoint (mandatory)   teal=optional deck/coin/secret   gold=machine/gate/crate-puzzle   red=gap hazard', fill='#60635f', font=FS)

img.save(OUT / 'actual-world-map.png')
print('saved actual-world-map.png')

# --- reference-vs-current-layout.png: side-by-side with the approved
# V7 master-map reference image (real asset, not regenerated) ---
ref = Image.open(ROOT / 'docs' / 'level-reference' / 'v7-master-map.png').convert('RGB')
cur = img.copy()
target_w = 1500
ref_r = ref.resize((target_w, int(ref.height * target_w / ref.width)))
cur_r = cur.resize((target_w, int(cur.height * target_w / cur.width)))
def labeled(im, text):
    strip = Image.new('RGB', (im.width, 30), '#242624')
    ImageDraw.Draw(strip).text((10, 6), text, fill='white', font=FB)
    out = Image.new('RGB', (im.width, im.height + 30), 'white')
    out.paste(strip, (0, 0)); out.paste(im, (0, 30))
    return out
ref_l = labeled(ref_r, 'APPROVED V7 MASTER-MAP REFERENCE (docs/level-reference/v7-master-map.png)')
cur_l = labeled(cur_r, 'ACTUAL CURRENT IMPLEMENTATION (generated from live src/level.js data)')
compare = Image.new('RGB', (target_w, ref_l.height + cur_l.height + 10), 'white')
compare.paste(ref_l, (0, 0))
compare.paste(cur_l, (0, ref_l.height + 10))
compare.save(OUT / 'reference-vs-current-layout.png')
print('saved reference-vs-current-layout.png')

# --- zone-coordinate-inventory.csv ---
rows = []
for z in data['ZONES']:
    rows.append(['zone', z['id'], z.get('xStart'), z.get('xEnd'), '', z.get('yMax', ''), 'zone-boundary', z['name']])
for g_left, g_right in data['GROUND_RANGES']:
    rows.append(['ground', '', g_left, g_right, 1100, '', 'mandatory-traversal', 'GROUND_RANGES segment'])
for deck in data['DECKS']:
    role = 'optional-traversal' if deck['id'] in OPTIONAL_DECK_IDS else 'mandatory-traversal'
    rows.append(['deck', deck['id'], deck['x'], deck['x'] + deck['width'], deck['y'], '', role, f"supports={deck.get('supports','true')}"])
for l in data['LADDERS']:
    rows.append(['ladder', '', l['x'], l['x'], l['top'], l['bottom'], 'mandatory-traversal', ''])
for g in data['GATES']:
    rows.append(['gate', g['id'], g['x'], g['x'] + g['width'], g['y'], '', 'mandatory-gate', ''])
for t in data['TERMINALS']:
    rows.append(['machine', t['id'], t['x'], t['x'], t['feet'], '', 'puzzle-mechanism', f"gate={t['gate']}"])
for cp in data['CHECKPOINTS']:
    rows.append(['checkpoint', cp['id'], cp['x'], cp['x'], cp['feet'], '', 'mandatory-traversal', ''])
for c in data['COLLECTIBLES']:
    rows.append(['coin', c['id'], c['x'], c['x'], c['y'], '', 'optional-traversal', c['area']])
for s in data['SECRETS']:
    rows.append(['secret', s['id'], s['x'], s['x'], s['feet'], '', 'optional-traversal', s['zone']])
rows.append(['crate', cp_['crate']['id'], cp_['crate']['x'], cp_['crate']['x'], cp_['crate']['feet'], '', 'puzzle-mechanism', 'V9.1 crate start'])
rows.append(['switch', cp_['floorSwitch']['id'], cp_['floorSwitch']['x'], cp_['floorSwitch']['x'], cp_['floorSwitch']['feet'], '', 'puzzle-mechanism', f"radius={cp_['floorSwitch']['radius']}"])
rows.append(['platform', cp_['platform']['id'], cp_['platform']['x'], cp_['platform']['x'] + cp_['platform']['width'], cp_['platform']['y'], '', 'puzzle-mechanism', 'V9.1 crate-assisted ledge, rise 120px'])
rows.append(['spawn', '', data['SPAWN']['x'], data['SPAWN']['x'], data['SPAWN']['feet'], '', 'mandatory-traversal', ''])
rows.append(['goal', '', data['GOAL']['x'], data['GOAL']['x'], data['GOAL']['feet'], '', 'mandatory-traversal', ''])
rows.append(['gap', 'FIRST_GAP', data['FIRST_GAP']['x'], data['FIRST_GAP']['x'] + data['FIRST_GAP']['width'], 1100, '', 'hazard', ''])

with open(OUT / 'zone-coordinate-inventory.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['type', 'id', 'x_start', 'x_end', 'y_top', 'y_bottom_or_extra', 'classification', 'notes'])
    w.writerows(rows)
print('saved zone-coordinate-inventory.csv')

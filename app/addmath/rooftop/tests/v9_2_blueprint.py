"""V9.2 (design-only): generates the two required blueprint images
(proposed-full-tilemap.png, proposed-seven-zone-layouts.png) as SCHEMATIC
diagrams from live src/level.js data — NOT real Kenney Pixel Platformer
artwork (that pack is not present in this repository; see
kenney-asset-compatibility.md). Colored blocks stand in for tile ROLES
only. No source files are read/written other than this script's own
output images.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
OUT = ROOT / 'tests' / 'artifacts' / 'phase9-2'
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads((ROOT / 'tests' / 'artifacts' / 'level_data.json').read_text(encoding='utf-8'))

try:
    F = ImageFont.truetype('arial.ttf', 11)
    FB = ImageFont.truetype('arialbd.ttf', 15)
    FS = ImageFont.truetype('arial.ttf', 9)
    FBB = ImageFont.truetype('arialbd.ttf', 20)
except Exception:
    F = FB = FS = FBB = ImageFont.load_default()

EXISTING = '#3f4a63'     # existing, unchanged coordinates
PROPOSED_VIS = '#3c7a6e' # proposed visual-only re-skin (same coordinates)
PROPOSED_GEOM = '#b3482e' # proposed geometry change (coordinates differ) — NONE implemented, shown for review only
PUZZLE = '#b38b2e'
GAP = '#cf4b4b'

def draw_banner(d, w, text, sub=None):
    d.rectangle([0, 0, w, 46 if sub else 30], fill='#242624')
    d.text((14, 8), text, fill='white', font=FB)
    if sub:
        d.text((14, 28), sub, fill='#cfcfca', font=FS)

def legend(d, x, y):
    items = [(EXISTING, 'existing coordinates, unchanged'), (PROPOSED_VIS, 'proposed visual-only re-skin (same coordinates)'),
              (PUZZLE, 'machine / gate / crate-puzzle'), (GAP, 'gap / hazard')]
    for i, (col, text) in enumerate(items):
        yy = y + i * 16
        d.rectangle([x, yy, x + 12, yy + 12], fill=col)
        d.text((x + 18, yy - 1), text, fill='#242624', font=FS)

# ============================================================
# 1. proposed-full-tilemap.png — the complete playable route
# ============================================================
W, H = 1800, 560
img = Image.new('RGB', (W, H), '#f3f2ee')
d = ImageDraw.Draw(img)
draw_banner(d, W, 'V9.2 PROPOSED FULL TILEMAP — SCHEMATIC BLUEPRINT (not real Pixel Platformer artwork — pack not present locally)',
            'Every position below is the EXISTING live src/level.js coordinate — this pass proposes a Kenney Pixel Platformer re-skin, not a geometry change.')
PAD = 50
world_w, world_h = data['WORLD']['width'], data['WORLD']['height']
scale_x = (W - 2 * PAD) / world_w
def sx(x): return PAD + x * scale_x
def sy(y): return 90 + (y / world_h) * (H - 150)

for z in data['ZONES']:
    if 'yMax' in z:
        continue
    x0, x1 = sx(z['xStart']), sx(z['xEnd'])
    d.rectangle([x0, 60, x1, H - 60], outline='#d8d8d2', width=1)
    d.text(((x0 + x1) / 2 - 60, 64), z['name'], fill='#9a9d96', font=FS)

for left, right in data['GROUND_RANGES']:
    y = sy(1100)
    d.rectangle([sx(left), y - 4, sx(right), y + 10], fill=EXISTING)
gx0, gx1 = sx(data['FIRST_GAP']['x']), sx(data['FIRST_GAP']['x'] + data['FIRST_GAP']['width'])
d.rectangle([gx0, sy(1100) - 4, gx1, sy(1100) + 10], fill=GAP)

OPTIONAL_DECK_IDS = {'cave-alcove', 'cafe-deck'}
for deck in data['DECKS']:
    x0, x1 = sx(deck['x']), sx(deck['x'] + deck['width'])
    y = sy(deck['y'])
    d.rectangle([x0, y - 4, x1, y + 6], fill=EXISTING)
for l in data['LADDERS']:
    x = sx(l['x'])
    d.line([(x, sy(l['top'])), (x, sy(l['bottom']))], fill='#6b6f66', width=4)
for g in data['GATES']:
    x0, x1 = sx(g['x']), sx(g['x'] + g['width'])
    y = sy(g['y'])
    d.rectangle([x0, y - 8, x1, y + 8], outline=PUZZLE, width=2)
for i, t in enumerate(data['TERMINALS']):
    x, y = sx(t['x']), sy(t['feet'])
    d.rectangle([x - 6, y - 20, x + 6, y - 6], fill=PUZZLE)
    d.text((x - 10, y - 34), f"M{i+1}", fill=PUZZLE, font=FS)
for i, cp in enumerate(data['CHECKPOINTS']):
    x, y = sx(cp['x']), sy(cp['feet'])
    d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=EXISTING)
    d.text((x - 10, y + 7), f'CP{i+1}', fill=EXISTING, font=FS)
cp_ = data['CRATE_PUZZLE']
crx, cry = sx(cp_['crate']['x']), sy(cp_['crate']['feet'])
d.rectangle([crx - 7, cry - 14, crx + 7, cry], outline=PUZZLE, width=2)
swx, swy = sx(cp_['floorSwitch']['x']), sy(cp_['floorSwitch']['feet'])
d.ellipse([swx - 5, swy - 5, swx + 5, swy + 5], fill=PUZZLE)
plx0, plx1 = sx(cp_['platform']['x']), sx(cp_['platform']['x'] + cp_['platform']['width'])
ply = sy(cp_['platform']['y'])
d.rectangle([plx0, ply - 4, plx1, ply + 6], fill=PUZZLE)
d.text((plx0, ply - 18), 'crate ledge', fill=PUZZLE, font=FS)
sx0, sy0 = sx(data['SPAWN']['x']), sy(data['SPAWN']['feet'])
d.text((sx0 - 14, sy0 + 10), 'SPAWN', fill='#242624', font=FS)
gx, gy = sx(data['GOAL']['x']), sy(data['GOAL']['feet'])
d.text((gx - 10, gy + 10), 'GOAL', fill='#242624', font=FS)
legend(d, PAD, H - 50)
img.save(OUT / 'proposed-full-tilemap.png')
print('saved proposed-full-tilemap.png')

# ============================================================
# 2. proposed-seven-zone-layouts.png — 7-panel per-zone blueprint
# ============================================================
zone_defs = [
    ('A', 0, 650, 'Clean starting terrain + optional crate puzzle'),
    ('B', 550, 1350, 'Elevated two-deck route, readable gap jump'),
    ('C', 600, 1100, 'Optional elevated checkpoint/secret (above B)'),
    ('D', 1250, 1850, 'Workshop — Machine 1 + gate'),
    ('E', 1650, 2650, 'Multi-height roof chain — Machine 2'),
    ('F', 2850, 3300, 'Stepped hillside + optional cave'),
    ('G', 3650, 4300, 'River crossing — Machine 3 + goal'),
]
panel_w, panel_h = 560, 260
cols = 2
rows = 4
sheet = Image.new('RGB', (panel_w * cols + 20, panel_h * rows + 20), '#f3f2ee')
sd = ImageDraw.Draw(sheet)
draw_banner(sd, sheet.width, 'V9.2 PROPOSED SEVEN-ZONE LAYOUTS — SCHEMATIC BLUEPRINT (existing coordinates; visual re-skin proposal only)')

def panel_sx(x, zx0, zx1, px0, pw): return px0 + (x - zx0) / (zx1 - zx0) * pw
def panel_sy(y, py0, ph): return py0 + 20 + (y - 600) / (1200 - 600) * (ph - 60)

for i, (zid, zx0, zx1, desc) in enumerate(zone_defs):
    col, row = i % cols, i // cols
    px0, py0 = 10 + col * panel_w, 56 + row * panel_h
    sd.rectangle([px0, py0, px0 + panel_w - 10, py0 + panel_h - 10], outline='#cececa')
    sd.text((px0 + 8, py0 + 4), f'ZONE {zid}', fill='#242624', font=FB)
    sd.text((px0 + 8, py0 + 22), desc, fill='#60635f', font=FS)
    def psx(x): return panel_sx(x, zx0, zx1, px0 + 8, panel_w - 26)
    def psy(y): return panel_sy(y, py0, panel_h)
    for left, right in data['GROUND_RANGES']:
        l, r = max(left, zx0), min(right, zx1)
        if l < r:
            y = psy(1100)
            sd.rectangle([psx(l), y - 3, psx(r), y + 6], fill=EXISTING)
    gl, gr = max(data['FIRST_GAP']['x'], zx0), min(data['FIRST_GAP']['x'] + data['FIRST_GAP']['width'], zx1)
    if gl < gr:
        y = psy(1100)
        sd.rectangle([psx(gl), y - 3, psx(gr), y + 6], fill=GAP)
    for deck in data['DECKS']:
        dl, dr = max(deck['x'], zx0), min(deck['x'] + deck['width'], zx1)
        if dl < dr:
            y = psy(deck['y'])
            sd.rectangle([psx(dl), y - 3, psx(dr), y + 5], fill=EXISTING)
    for l in data['LADDERS']:
        if zx0 <= l['x'] <= zx1:
            x = psx(l['x'])
            sd.line([(x, psy(l['top'])), (x, psy(l['bottom']))], fill='#6b6f66', width=3)
    for g in data['GATES']:
        if zx0 <= g['x'] <= zx1:
            x0, x1 = psx(g['x']), psx(g['x'] + g['width'])
            y = psy(g['y'])
            sd.rectangle([x0, y - 6, x1, y + 6], outline=PUZZLE, width=2)
    for j, t in enumerate(data['TERMINALS']):
        if zx0 <= t['x'] <= zx1:
            x, y = psx(t['x']), psy(t['feet'])
            sd.rectangle([x - 5, y - 16, x + 5, y - 5], fill=PUZZLE)
            sd.text((x - 8, y - 28), f'M{j+1}', fill=PUZZLE, font=FS)
    for j, cp in enumerate(data['CHECKPOINTS']):
        if zx0 <= cp['x'] <= zx1:
            x, y = psx(cp['x']), psy(cp['feet'])
            sd.ellipse([x - 4, y - 4, x + 4, y + 4], fill=EXISTING)
            sd.text((x - 8, y + 6), f'CP{j+1}', fill=EXISTING, font=FS)
    if zid == 'A':
        crx, cry = psx(cp_['crate']['x']), psy(cp_['crate']['feet'])
        sd.rectangle([crx - 6, cry - 12, crx + 6, cry], outline=PUZZLE, width=2)
        plx0, plx1 = psx(cp_['platform']['x']), psx(cp_['platform']['x'] + cp_['platform']['width'])
        ply = psy(cp_['platform']['y'])
        sd.rectangle([plx0, ply - 3, plx1, ply + 5], fill=PUZZLE)

legend(sd, 16, sheet.height - 50)
sheet.save(OUT / 'proposed-seven-zone-layouts.png')
print('saved proposed-seven-zone-layouts.png')

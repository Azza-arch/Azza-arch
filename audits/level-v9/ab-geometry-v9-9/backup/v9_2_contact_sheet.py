"""V9.2 (design-only): builds the required Kenney asset contact sheet.
Shows REAL crops of the actual local asset files (true filenames, no
invented names), organized by the role the brief asks for, with each
role's current family honestly labeled and a prominent banner for every
role the Kenney Pixel Platformer pack would need to fill but can't,
because that pack is not present in this repository. No assets are
downloaded or fabricated.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
OUT = ROOT / 'tests' / 'artifacts' / 'phase9-2'
OUT.mkdir(parents=True, exist_ok=True)

try:
    F = ImageFont.truetype('arial.ttf', 11)
    FB = ImageFont.truetype('arialbd.ttf', 18)
    FS = ImageFont.truetype('arial.ttf', 10)
except Exception:
    F = FB = FS = ImageFont.load_default()

ROLES = [
    ('Ground tiles', [
        ('assets/kenney/tiles/terrain_stone_horizontal_left.png', 'kenney/terrain_stone_horizontal_left.png (64x64)'),
        ('assets/kenney/tiles/terrain_stone_horizontal_middle.png', 'kenney/terrain_stone_horizontal_middle.png (64x64)'),
        ('assets/kenney/tiles/terrain_stone_horizontal_right.png', 'kenney/terrain_stone_horizontal_right.png (64x64)'),
        ('assets/production/Ground/ground_center.png', 'production/Ground/ground_center.png (64x64)'),
    ]),
    ('Platform edges', [
        ('assets/kenney/tiles/terrain_stone_block_top_left.png', 'kenney/terrain_stone_block_top_left.png'),
        ('assets/kenney/tiles/terrain_stone_block_top.png', 'kenney/terrain_stone_block_top.png'),
        ('assets/kenney/tiles/terrain_stone_block_top_right.png', 'kenney/terrain_stone_block_top_right.png'),
        ('assets/production/Traversal/platform_wood_left.png', 'production/Traversal/platform_wood_left.png'),
    ]),
    ('Fill / support tiles', [
        ('assets/kenney/tiles/terrain_stone_block_center.png', 'kenney/terrain_stone_block_center.png'),
        ('assets/kenney/tiles/terrain_stone_block_left.png', 'kenney/terrain_stone_block_left.png'),
        ('assets/kenney/tiles/terrain_stone_block_right.png', 'kenney/terrain_stone_block_right.png'),
        ('assets/kenney/tiles/block_blue.png', 'kenney/block_blue.png (reused as the V9.1 pressure plate)'),
    ]),
    ('Ladders', [
        ('assets/kenney/tiles/ladder_top.png', 'kenney/ladder_top.png'),
        ('assets/kenney/tiles/ladder_middle.png', 'kenney/ladder_middle.png'),
        ('assets/kenney/tiles/ladder_bottom.png', 'kenney/ladder_bottom.png'),
        ('assets/production/Traversal/ladder_middle.png', 'production/Traversal/ladder_middle.png'),
    ]),
    ('Doors', [
        ('assets/kenney/tiles/door_closed.png', 'kenney/door_closed.png'),
        ('assets/kenney/tiles/door_closed_top.png', 'kenney/door_closed_top.png (used at the V8.7 goal exit)'),
    ]),
    ('Switch candidates', [
        ('assets/kenney/tiles/lever.png', 'kenney/lever.png (idle lever, unused since Phase 8.5)'),
        ('assets/kenney/tiles/lever_left.png', 'kenney/lever_left.png (pulled lever, unused since Phase 8.5)'),
        ('assets/kenney/tiles/lever_right.png', 'kenney/lever_right.png (unused, never wired up)'),
        ('assets/kenney/tiles/block_blue.png', 'kenney/block_blue.png (flattened — current V9.1 pressure-plate re-skin)'),
    ]),
    ('Crate candidates', [
        ('assets/kenney/tiles/terrain_stone_block_center.png', 'kenney/terrain_stone_block_center.png (tinted — current V9.1 crate)'),
    ]),
    ('Collectibles', [
        ('assets/kenney/tiles/coin_gold.png', 'kenney/coin_gold.png'),
        ('assets/kenney/tiles/hud_coin.png', 'kenney/hud_coin.png'),
    ]),
    ('Bridges / gates', [
        ('assets/kenney/tiles/bridge.png', 'kenney/bridge.png'),
        ('assets/kenney/tiles/bridge_logs.png', 'kenney/bridge_logs.png (unused)'),
    ]),
    ('Flags / signs', [
        ('assets/kenney/tiles/flag_green_a.png', 'kenney/flag_green_a.png'),
        ('assets/kenney/tiles/flag_green_b.png', 'kenney/flag_green_b.png'),
        ('assets/kenney/tiles/sign.png', 'kenney/sign.png (unused since Phase 8.5)'),
    ]),
    ('Backgrounds', [
        ('assets/kenney/backgrounds/background_clouds.png', 'kenney/backgrounds/background_clouds.png'),
        ('assets/background-legacy/bg_hills.png', 'background-legacy/bg_hills.png'),
    ]),
]
MISSING_ROLES = [
    'Industrial assets (Pixel Platformer Industrial Expansion)',
    'Nature tiles (Pixel Platformer Farm Expansion / base pack foliage)',
    'Native 18x18 Pixel Platformer ground/platform/ladder/door/switch/crate/collectible tiles',
]

cell = 190
cols = 4
cell_img = 64
row_h = cell_img + 34  # image + two lines of label

def rows_needed(n): return (n + cols - 1) // cols

W = cell * cols + 40
H = 70 + sum(28 + rows_needed(len(items)) * row_h + 16 for _, items in ROLES) + 50 + len(MISSING_ROLES) * 20 + 40

img = Image.new('RGB', (W, H), '#f3f2ee')
d = ImageDraw.Draw(img)
d.rectangle([0, 0, W, 50], fill='#242624')
d.text((14, 8), 'V9.2 KENNEY ASSET CONTACT SHEET', fill='white', font=FB)
d.text((14, 32), 'Real local files only — labeled with ACTUAL filenames. No fabricated sprites.', fill='#cfcfca', font=FS)

def wrap_label(text, width=24):
    if len(text) <= width:
        return [text]
    cut = text.rfind(' ', 0, width)
    if cut <= 0:
        cut = width
    return [text[:cut], text[cut:].strip()]

y = 62
for role, items in ROLES:
    d.text((14, y), role, fill='#242624', font=FB)
    y += 28
    x = 20
    col = 0
    for path, label in items:
        p = ROOT / path
        if p.exists():
            im = Image.open(p).convert('RGBA')
            im.thumbnail((cell_img, cell_img))
            bg = Image.new('RGBA', (cell_img, cell_img), (230, 230, 225, 255))
            bg.paste(im, ((cell_img - im.width) // 2, (cell_img - im.height) // 2), im)
            img.paste(bg.convert('RGB'), (x, y), bg)
            d.rectangle([x, y, x + cell_img, y + cell_img], outline='#cececa')
        for li, line in enumerate(wrap_label(label)):
            d.text((x, y + cell_img + 2 + li * 12), line, fill='#60635f', font=FS)
        col += 1
        if col >= cols:
            col = 0; x = 20; y += row_h
        else:
            x += cell
    if col != 0:
        y += row_h
    y += 16

d.rectangle([10, y, W - 10, y + 24 + len(MISSING_ROLES) * 20], outline='#b3482e', width=2)
d.text((20, y + 4), 'MISSING — Kenney Pixel Platformer base/Industrial/Farm packs are NOT present in this repository:', fill='#b3482e', font=FB)
yy = y + 28
for role in MISSING_ROLES:
    d.text((30, yy), f'• {role} — not available, not downloaded, not fabricated', fill='#8a3322', font=FS)
    yy += 20

img.save(OUT / 'kenney-asset-contact-sheet.png')
print('saved kenney-asset-contact-sheet.png')

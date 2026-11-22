from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent / 'artifacts' / 'phase8-7'
OLD = Path(__file__).parent / 'artifacts' / 'phase8-5' / 'after'  # pre-8.7 (heavy architecture) state
NEW = ROOT / 'zones'
AB = ROOT / 'camera-ab'

try:
    FONT_S = ImageFont.truetype('arial.ttf', 14)
    FONT_B = ImageFont.truetype('arialbd.ttf', 14)
except Exception:
    FONT_S = FONT_B = ImageFont.load_default()


def label(img, text):
    strip = Image.new('RGB', (img.width, 26), '#242624')
    ImageDraw.Draw(strip).text((8, 4), text, fill='white', font=FONT_S)
    out = Image.new('RGB', (img.width, img.height + 26), 'white')
    out.paste(strip, (0, 0)); out.paste(img, (0, 26))
    return out


# --- Zone contact sheet: before (8.5 heavy) vs after (8.7 simplified) ---
zones = [
    ('A-taman-perumahan.png', 'A · Taman Perumahan'),
    ('B-lorong-pekan.png', 'B · Lorong Pekan'),
    ('E-deretan-bumbung.png', 'E · Deretan Bumbung'),
    ('F-bukit-tanjung-gua.png', 'F · Bukit Tanjung & Gua'),
]
cw, ch = 460, 322
rows = []
for fname, title in zones:
    b = label(Image.open(OLD / fname).resize((cw, ch)), f'{title} — BEFORE (8.5, architectural)')
    a = label(Image.open(NEW / fname).resize((cw, ch)), f'{title} — AFTER (8.7, simplified)')
    row = Image.new('RGB', (cw * 2 + 14, b.height), 'white')
    row.paste(b, (0, 0)); row.paste(a, (cw + 14, 0))
    rows.append(row)
sheet = Image.new('RGB', (rows[0].width, sum(r.height for r in rows) + 14 * (len(rows) - 1)), 'white')
y = 0
for r in rows:
    sheet.paste(r, (0, y)); y += r.height + 14
sheet.save(ROOT / 'v8-7-zone-before-after.png')

# --- Camera A/B comparison: 3 viewport categories x 3 zooms, one moment ---
viewports = ['desktop', 'short-wide-laptop', 'mobile-landscape']
zooms = ['1.0', '1.2', '1.3']
cw2, ch2 = 360, 200
grid_rows = []
for vp in viewports:
    cells = []
    for z in zooms:
        img = Image.open(AB / f'{vp}_z{z}_machine1-approach.png').resize((cw2, ch2))
        cells.append(label(img, f'{vp}  zoom {z}'))
    row = Image.new('RGB', (cw2 * 3 + 10 * 2, cells[0].height), 'white')
    for i, c in enumerate(cells):
        row.paste(c, (i * (cw2 + 10), 0))
    grid_rows.append(row)
ab_sheet = Image.new('RGB', (grid_rows[0].width, sum(r.height for r in grid_rows) + 10 * 2), 'white')
y = 0
for r in grid_rows:
    ab_sheet.paste(r, (0, y)); y += r.height + 10
ab_sheet.save(ROOT / 'v8-7-camera-ab-comparison.png')

print('composed 2 images')

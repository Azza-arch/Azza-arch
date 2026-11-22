"""V8 Phase 8.5: composes the four required deliverable images from the
REAL browser screenshots already captured in tests/artifacts/phase8-5/
(before/ and after/) — no synthetic/generated artwork, only crops/labels/
grid layout on top of actual Phaser canvas captures.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent / 'artifacts' / 'phase8-5'
BEFORE = ROOT / 'before'
AFTER = ROOT / 'after'
OUT = ROOT

try:
    FONT = ImageFont.truetype('arialbd.ttf', 18)
    FONT_S = ImageFont.truetype('arial.ttf', 14)
except Exception:
    FONT = FONT_S = ImageFont.load_default()


def label_strip(img, text):
    strip = Image.new('RGB', (img.width, 28), '#242624')
    d = ImageDraw.Draw(strip)
    d.text((10, 5), text, fill='white', font=FONT_S)
    out = Image.new('RGB', (img.width, img.height + 28), 'white')
    out.paste(strip, (0, 0))
    out.paste(img, (0, 28))
    return out


# --- 1. world overview: the real zoomed-out capture, as-is ---
Image.open(AFTER / 'world-overview.png').save(OUT / 'v8-5-world-overview.png')

# --- 2. before/after grid: 4 representative zones, before|after pairs ---
pairs = [
    ('A-taman-perumahan.png', 'A — Taman Perumahan'),
    ('E-deretan-bumbung.png', 'E — Deretan Bumbung'),
    ('F-bukit-tanjung-gua.png', 'F — Bukit Tanjung & Gua'),
    ('gate-workshop-locked.png', 'Workshop gate (locked)'),
]
cell_w, cell_h = 480, 336
rows = []
for fname, title in pairs:
    b = Image.open(BEFORE / fname).resize((cell_w, cell_h))
    a = Image.open(AFTER / fname).resize((cell_w, cell_h))
    b = label_strip(b, f'{title} — BEFORE')
    a = label_strip(a, f'{title} — AFTER')
    row = Image.new('RGB', (cell_w * 2 + 16, b.height), 'white')
    row.paste(b, (0, 0)); row.paste(a, (cell_w + 16, 0))
    rows.append(row)
grid = Image.new('RGB', (rows[0].width, sum(r.height for r in rows) + 16 * (len(rows) - 1)), 'white')
y = 0
for r in rows:
    grid.paste(r, (0, y)); y += r.height + 16
grid.save(OUT / 'v8-5-before-after.png')

# --- 3. zone contact sheet: all 7 zones, AFTER, 2 columns ---
zone_files = [
    ('A-taman-perumahan.png', 'A · Taman Perumahan'),
    ('B-lorong-pekan.png', 'B · Lorong Pekan'),
    ('C-cafe-atas-angin.png', 'C · Café Atas Angin'),
    ('D-bengkel-fungsi.png', 'D · Bengkel Fungsi'),
    ('E-deretan-bumbung.png', 'E · Deretan Bumbung'),
    ('F-bukit-tanjung-gua.png', 'F · Bukit Tanjung & Gua'),
    ('G-jambatan-sungai.png', 'G · Jambatan Sungai'),
]
cw, ch = 420, 294
cols = 2
cells = []
for fname, title in zone_files:
    img = Image.open(AFTER / fname).resize((cw, ch))
    cells.append(label_strip(img, title))
rows_n = (len(cells) + cols - 1) // cols
sheet = Image.new('RGB', (cw * cols + 12 * (cols - 1), (ch + 28) * rows_n + 12 * (rows_n - 1)), 'white')
for i, cell in enumerate(cells):
    col, row = i % cols, i // cols
    sheet.paste(cell, (col * (cw + 12), row * (ch + 28 + 12)))
sheet.save(OUT / 'v8-5-zone-contact-sheet.png')

# --- 4. platform-art alignment: 3 pan frames side by side ---
pans = [Image.open(AFTER / f'pan-align-{i}.png') for i in range(3)]
pw, ph = 420, 294
pans = [label_strip(p.resize((pw, ph)), f'Pan frame {i+1}/3 (camera moving right)') for i, p in enumerate(pans)]
align = Image.new('RGB', (pw * 3 + 12 * 2, pans[0].height), 'white')
for i, p in enumerate(pans):
    align.paste(p, (i * (pw + 12), 0))
align.save(OUT / 'v8-5-platform-art-alignment.png')

print('composed 4 deliverable images')

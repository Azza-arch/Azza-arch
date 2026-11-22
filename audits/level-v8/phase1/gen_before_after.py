"""Composite real before/after screenshots for V8 Phase 1 (before = Phase 0
baseline, scenery disabled; after = this phase, scenery enabled)."""
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\laragon\www\Azza-arch"
BEFORE = ROOT + r"\audits\level-v8\baseline-screenshots"
AFTER = ROOT + r"\audits\level-v8\phase1\screenshots"
OUT = ROOT + r"\audits\level-v8\phase1"

def load(path, size=(900, 505)):
    im = Image.open(path).convert("RGB")
    im.thumbnail(size, Image.LANCZOS)
    return im

def font(sz, bold=False):
    try:
        return ImageFont.truetype("arialbd.ttf" if bold else "arial.ttf", sz)
    except Exception:
        return ImageFont.load_default()

def label_strip(w, text, color):
    bar = Image.new("RGB", (w, 30), color)
    d = ImageDraw.Draw(bar)
    d.text((10, 5), text, fill="white", font=font(16))
    return bar

zones = ["A", "B", "C", "D", "E", "F", "G"]
names = {"A": "Taman Perumahan", "B": "Lorong Pekan", "C": "Café Atas Angin", "D": "Bengkel Fungsi",
         "E": "Deretan Bumbung", "F": "Bukit Tanjung & Gua", "G": "Jambatan Sungai"}

rows = []
for z in zones:
    b = load(f"{BEFORE}\\desktop-zone{z}.png")
    a = load(f"{AFTER}\\desktop-zone{z}.png")
    w = b.width + a.width + 20
    h = max(b.height, a.height) + 30
    row = Image.new("RGB", (w, h), (255, 255, 255))
    row.paste(label_strip(b.width, "BEFORE (scenery disabled)", (30, 30, 30)), (0, 0))
    row.paste(label_strip(a.width, "AFTER (Phase 1)", (30, 70, 30)), (b.width + 20, 0))
    row.paste(b, (0, 30))
    row.paste(a, (b.width + 20, 30))
    rows.append((row, f"{z} — {names[z]}"))

pad = 30
total_h = sum(r.height for r, _ in rows) + pad * (len(rows) + 1) + 40
total_w = max(r.width for r, _ in rows) + pad * 2
canvas = Image.new("RGB", (total_w, total_h), (255, 255, 255))
d = ImageDraw.Draw(canvas)
d.text((pad, 10), "Lorong Atas Bumbung — V8 Phase 1: Visual Coherence, Before / After (real browser renders)", fill="black", font=font(22, True))
y = 50
for row, title in rows:
    d.text((pad, y), title, fill="#333", font=font(15, True))
    canvas.paste(row, (pad, y + 20))
    y += row.height + pad + 20
canvas.save(OUT + r"\phase1-before-after.png")
print("saved", canvas.size)

# Contact sheet of AFTER only
thumbs = [load(f"{AFTER}\\desktop-zone{z}.png", (640, 360)) for z in zones]
cols, rows_n = 2, 4
cell_w, cell_h = 660, 400
sheet = Image.new("RGB", (cell_w * cols + 40, cell_h * rows_n + 60), (255, 255, 255))
dd = ImageDraw.Draw(sheet)
dd.text((20, 12), "Lorong Atas Bumbung — V8 Phase 1: Seven-Zone Contact Sheet (after, real browser renders)", fill="black", font=font(20, True))
for i, (z, im) in enumerate(zip(zones, thumbs)):
    cx, cy = (i % cols) * cell_w + 20, (i // cols) * cell_h + 55
    sheet.paste(im, (cx, cy + 22))
    dd.text((cx, cy), f"{z} — {names[z]}", fill="#111", font=font(16, True))
sheet.save(OUT + r"\phase1-zone-contact-sheet.png")
print("saved", sheet.size)

"""Composite real browser-render screenshots: before/after (V6.2 baseline
vs this Phase 1 run) and a 7-zone contact sheet, all from actual captures."""
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\laragon\www\Azza-arch"
V62 = ROOT + r"\audits\level-v6.2\screenshots"
P1 = ROOT + r"\app\addmath\rooftop\tests\artifacts\phase1"
OUT = ROOT + r"\audits\level-v6.3"

def load(path, size=(960, 540)):
    im = Image.open(path).convert("RGB")
    im.thumbnail(size, Image.LANCZOS)
    return im

def font(sz, bold=False):
    try:
        return ImageFont.truetype("arialbd.ttf" if bold else "arial.ttf", sz)
    except Exception:
        return ImageFont.load_default()

def label_strip(w, text, h=32, color=(30, 30, 30)):
    bar = Image.new("RGB", (w, h), color)
    d = ImageDraw.Draw(bar)
    d.text((10, 5), text, fill="white", font=font(17))
    return bar

# ---------------------------------------------------------------
# before/after (V6.2 baseline -> Phase 1)
# ---------------------------------------------------------------
pairs = [
    ("Zone B — Lorong Pekan", V62 + r"\desktop-zoneb-b2.png", P1 + r"\1920x1080__zone-B.png"),
    ("Zone E — Deretan Bumbung (Machine 2)", V62 + r"\desktop-zonee-m2-solved.png", P1 + r"\1920x1080__zone-E.png"),
    ("Zone C — Café Atas Angin", V62 + r"\desktop-cafe.png", P1 + r"\1920x1080__zone-C.png"),
    ("Zone A — Taman Perumahan", V62 + r"\desktop-welcome.png", P1 + r"\1920x1080__zone-A.png"),
]
rows = []
for title, b_path, a_path in pairs:
    b, a = load(b_path), load(a_path)
    w = b.width + a.width + 20
    h = max(b.height, a.height) + 32
    row = Image.new("RGB", (w, h), (255, 255, 255))
    row.paste(label_strip(b.width, "BEFORE (V6.2, no scenery)"), (0, 0))
    row.paste(label_strip(a.width, "AFTER (V6.3 Phase 1)", color=(30, 70, 30)), (b.width + 20, 0))
    row.paste(b, (0, 32))
    row.paste(a, (b.width + 20, 32))
    rows.append((row, title))

pad = 40
total_h = sum(r.height for r, _ in rows) + pad * (len(rows) + 1) + 50
total_w = max(r.width for r, _ in rows) + pad * 2
canvas = Image.new("RGB", (total_w, total_h), (255, 255, 255))
d = ImageDraw.Draw(canvas)
d.text((pad, 12), "Lorong Atas Bumbung — V6.3 Phase 1: Before / After (real browser renders)", fill="black", font=font(26, True))
y = 60
for row, title in rows:
    d.text((pad, y), title, fill="#333", font=font(18, True))
    canvas.paste(row, (pad, y + 26))
    y += row.height + pad + 26
canvas.save(OUT + r"\phase1-before-after.png")
print("saved before-after", canvas.size)

# ---------------------------------------------------------------
# 7-zone contact sheet (this run, 1920x1080 captures)
# ---------------------------------------------------------------
zones = ["A", "B", "C", "D", "E", "F", "G"]
names = {"A": "Taman Perumahan", "B": "Lorong Pekan", "C": "Café Atas Angin", "D": "Bengkel Fungsi",
         "E": "Deretan Bumbung", "F": "Bukit Tanjung & Gua", "G": "Jambatan Sungai"}
thumbs = [load(f"{P1}\\1920x1080__zone-{z}.png", (640, 360)) for z in zones]
cols, rows_n = 2, 4
cell_w, cell_h = 660, 400
sheet = Image.new("RGB", (cell_w * cols + 40, cell_h * rows_n + 60), (255, 255, 255))
dd = ImageDraw.Draw(sheet)
dd.text((20, 12), "Lorong Atas Bumbung — V6.3 Phase 1: Seven-Zone Contact Sheet (1920x1080 browser renders)", fill="black", font=font(20, True))
for i, (z, im) in enumerate(zip(zones, thumbs)):
    cx, cy = (i % cols) * cell_w + 20, (i // cols) * cell_h + 55
    sheet.paste(im, (cx, cy + 22))
    dd.text((cx, cy), f"{z} — {names[z]}", fill="#111", font=font(16, True))
sheet.save(OUT + r"\phase1-zone-contact-sheet.png")
print("saved contact sheet", sheet.size)

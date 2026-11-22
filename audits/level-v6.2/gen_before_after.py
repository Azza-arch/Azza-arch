"""Composite real browser-render screenshots into a before/after comparison.
'Before' uses V6.1's own shipped-state screenshots (that IS this pass's
starting point — p2 at x=5570/feet=1000, Zone B's 3 same-height awnings,
confirmed by reading src/level.js's git-free history in the V6.1 implementation
report). 'After' uses this pass's fresh probe.py screenshots. No diagram is
substituted for either half."""
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\laragon\www\Azza-arch"
V61 = ROOT + r"\audits\level-v6.1\screenshots"
ARTS = ROOT + r"\app\addmath\rooftop\tests\artifacts"
OUT = ROOT + r"\audits\level-v6.2"

def load(path, size=(1366, 500)):
    im = Image.open(path).convert("RGB")
    im.thumbnail(size, Image.LANCZOS)
    return im

def label_strip(w, text, h=36):
    bar = Image.new("RGB", (w, h), (30, 30, 30))
    d = ImageDraw.Draw(bar)
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font = ImageFont.load_default()
    d.text((12, 6), text, fill="white", font=font)
    return bar

def stack_row(label, before_path, after_path, before_crop=None, after_crop=None):
    b = load(before_path)
    a = load(after_path)
    w = max(b.width, a.width) * 2 + 20
    h = max(b.height, a.height) + 40
    row = Image.new("RGB", (w, h), (245, 245, 245))
    row.paste(label_strip(b.width, "BEFORE (V6.1 shipped state)"), (0, 0))
    row.paste(label_strip(a.width, "AFTER (V6.2 implemented)"), (b.width + 20, 0))
    row.paste(b, (0, 40))
    row.paste(a, (b.width + 20, 40))
    return row, label

rows = []
r, t = stack_row("Zone B — awning count/height", V61 + r"\zoneB-overview-after.png", ARTS + r"\desktop-zoneb-b2.png")
rows.append((r, t))
r, t = stack_row("Zone E — Machine 2 reachability", V61 + r"\zoneE-06-at-m2.png", ARTS + r"\desktop-zonee-m2-solved.png")
rows.append((r, t))

pad = 50
total_h = sum(r.height for r, _ in rows) + pad * (len(rows) + 1) + 40
total_w = max(r.width for r, _ in rows) + pad * 2
canvas = Image.new("RGB", (total_w, total_h), (255, 255, 255))
d = ImageDraw.Draw(canvas)
try:
    title_font = ImageFont.truetype("arialbd.ttf", 26)
    sub_font = ImageFont.truetype("arial.ttf", 18)
except Exception:
    title_font = sub_font = ImageFont.load_default()
d.text((pad, 10), "Lorong Atas Bumbung — V6.2 Implementation: Before / After (real browser renders)", fill="black", font=title_font)
y = 55
for row, title in rows:
    d.text((pad, y), title, fill="#333", font=sub_font)
    canvas.paste(row, (pad, y + 25))
    y += row.height + pad + 25

canvas.save(OUT + r"\level-v6.2-before-after.png")
print("saved", OUT + r"\level-v6.2-before-after.png", canvas.size)

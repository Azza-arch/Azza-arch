# DENAI world map mock-up built ONLY from real Kenney tiles (design tool, not game code).
# Side-view adventure panorama, one region per World. UI overlays (path, nodes, chips) are drawn on top.
# Run from app/addmath/denai:  python3 design/world-map-mock.py
from PIL import Image, ImageDraw, ImageFont
import os
A = 'assets/'
base = Image.open(A + 'kenney-pixel-platformer/Tilemap/tilemap_packed.png').convert('RGBA')
farm = Image.open(A + 'kenney-pixel-platformer-farm/Tilemap/tilemap_packed.png').convert('RGBA')
ind = Image.open(A + 'kenney-pixel-platformer-industrial/Tilemap/tilemap_packed.png').convert('RGBA')
bg = Image.open(A + 'kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png').convert('RGBA')
S = 2                       # pixel scale (18 px → 36 px)
TS = 18 * S
W, H = 64, 16               # map size in tiles
img = Image.new('RGBA', (W * TS, H * TS + 150), (174, 227, 245, 255))

def fr(sheet, i, cols):
    c, r = i % cols, i // cols
    return sheet.crop((c * 18, r * 18, c * 18 + 18, r * 18 + 18)).resize((TS, TS), Image.NEAREST)
def put(sheet, i, x, y, cols):
    t = fr(sheet, i, cols); img.alpha_composite(t, (int(x * TS), int(y * TS)))
B = lambda i, x, y: put(base, i, x, y, 20)
F = lambda i, x, y: put(farm, i, x, y, 16)
I = lambda i, x, y: put(ind, i, x, y, 16)

# sky gradient + green forest band (same palette as World 1 in game)
d = ImageDraw.Draw(img)
for y in range(H * TS):
    t = y / (H * TS); d.line([(0, y), (W * TS, y)], fill=(int(143 + (176 - 143) * t), int(210 + (240 - 210) * t), int(239 + (210 - 239) * t), 255))
for x in range(0, W * TS, 24 * S):
    i = (x // (24 * S)) % 2
    band = bg.crop(((6 + i) * 24, 24, (7 + i) * 24, 48)).resize((24 * S, 24 * S), Image.NEAREST)
    img.alpha_composite(band, (x, 7 * TS))
    fill = bg.crop(((6 + i) * 24, 48, (7 + i) * 24, 72)).resize((24 * S, 24 * S), Image.NEAREST)
    for yy in range(7 * TS + 24 * S, H * TS, 24 * S): img.alpha_composite(fill, (x, yy))
# snow region background: Kenney snow set (no recolouring)
for x in range(56 * TS, W * TS, 24 * S):
    i = (x // (24 * S)) % 4
    img.alpha_composite(bg.crop((i * 24, 24, i * 24 + 24, 48)).resize((24 * S, 24 * S), Image.NEAREST), (x, 6 * TS))
    for yy in range(6 * TS + 24 * S, H * TS, 24 * S): img.alpha_composite(bg.crop((i * 24, 48, i * 24 + 24, 72)).resize((24 * S, 24 * S), Image.NEAREST), (x, yy))

B4, B5 = 'b4', 'b5'
def column(x, top, topL, topM, topR, fill, sheet=None, width=1, edge=None):
    sheet = sheet or B
    for k in range(width):
        f = topL if k == 0 else topR if k == width - 1 else topM
        if width == 1: f = topM
        sheet(f, x + k, top)
        for y in range(top + 1, H):
            q = fill[(k + y) % len(fill)]
            (B if isinstance(q, str) or sheet is B else sheet)(int(q[1:]) if isinstance(q, str) else q, x + k, y)
def tree(x, feet, big=False):
    B(137, x, feet - 1); B(136, x, feet - 2)
    if big:
        B(117, x, feet - 3); B(99, x + 1, feet - 3); B(98, x - 1, feet - 3); top = feet - 3
    else: top = feet - 2
    B(17, x - 1, top - 2); B(18, x, top - 2); B(19, x + 1, top - 2)
    B(57, x - 1, top - 1); B(97, x, top - 1); B(59, x + 1, top - 1)

# ── World 1: forest & river (x 0–13) ──
column(0, 11, 21, 22, 23, [4, 5], width=5)
for x in range(5, 8):
    B(33, x, 12); [B(73, x, y) for y in range(13, H)]
column(8, 11, 21, 22, 23, [4, 5], width=6)
for x, f in [(4.5, 48), (5.5, 49), (6.5, 49), (7.5, 50)]: B(f, x, 11)          # plank bridge over the river
for x in (4.6, 7.4): B(89, x, 12)                                               # bridge posts
tree(2, 11, big=True); tree(11, 11); B(126, 13, 10); B(124, 9, 10); B(125, 1, 10)
B(105, 3, 10); B(106, 4, 10)
# ── World 2: limestone valley (x 14–25): tall stone-topped pillars, river at the bottom ──
for (x, top, w) in [(14, 6, 2), (16, 9, 2), (18, 4, 3), (21, 8, 2), (23, 5, 2)]:
    column(x, top, 41, 42, 43, [4, 5], width=w)
for x in range(25, 26): B(33, x, 13); [B(73, x, y) for y in range(14, H)]
B(126, 18.5, 3); B(125, 23, 4)
# ── World 3: factory & tin mine (x 26–37) ──
for x in range(26, 38): I(1 if 26 < x < 37 else (0 if x == 26 else 3), x, 11); [B(4 + (x + y) % 2, x, y) for y in range(12, H)]
for y in range(4, 11): I(75 if y > 4 else 59, 28, y)
for y in range(6, 11): I(75 if y > 6 else 59, 35, y)
for x, f in [(29, 4), (30, 5), (31, 5), (32, 5), (33, 5), (34, 6)]: I(f, x, 8)
for y in (9, 10): I(52, 31, y); I(52, 33, y)
I(9, 30, 10); I(10, 32, 10); I(62, 36, 10); I(58, 27, 9); I(74, 27, 10)
F(6, 39, 10); F(20, 45, 7); F(36, 45, 8); F(22, 48, 6); F(23, 49, 6)
# ── World 4: highland farm terraces (x 38–49) ──
for i, (x, top) in enumerate([(38, 11), (41, 10), (44, 9), (47, 8)]):
    column(x, top, 1, 2, 3, [B4, B5], sheet=F, width=3)
    for k, crop in enumerate([56, 58, 59]): F(crop, x + k, top - 1)
# ── Coast (x 50–55): sand and sea ──
column(50, 12, 41, 42, 43, [4, 5], width=3)
for x in range(53, 56): B(33, x, 12); [B(73, x, y) for y in range(13, H)]
# ── Fantasy snow highlands (x 56–63) ──
for (x, top, w) in [(56, 9, 3), (59, 6, 2), (61, 8, 3)]:
    column(x, top, 81, 82, 83, [4, 5], width=w)
B(145, 57, 8); B(154, 60, 4); B(155, 61, 4)

# fog over regions that are not open yet (UI overlay, tiles are not recoloured)
fog = Image.new('RGBA', img.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(fog)
for x0, x1, a in [(26, 50, 70), (50, 64, 120)]: fd.rectangle([x0 * TS, 0, x1 * TS, H * TS], fill=(255, 255, 255, a))
img.alpha_composite(fog)

# path + nodes (UI)
d = ImageDraw.Draw(img)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18); small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except OSError: font = small = ImageFont.load_default()
nodes = [(3, 10, '1', 'Hutan & Sungai', 'Fungsi · Selesai 2/3 · Tersedia 3/3', (47, 157, 85)),
         (19, 3, '2', 'Lembah Batu Kapur', 'F. Kuadratik · Dalam pembangunan', (215, 162, 31)),
         (31, 7, '3', 'Kilang & Lombong', 'Sistem Persamaan · Akan datang', (154, 163, 160)),
         (48, 7, '4', 'Tanah Tinggi Ladang', 'Indeks, Surd & Log · Akan datang', (154, 163, 160)),
         (51, 11, '?', 'Pantai & Bakau', 'Tema cadangan', (190, 198, 196)),
         (60, 5, '?', 'Puncak Salji (fantasi)', 'Tema cadangan', (190, 198, 196))]
pts = [((x + .5) * TS, (y + .5) * TS) for x, y, *_ in nodes]
for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
    n = int(((x1 - x0) ** 2 + (y1 - y0) ** 2) ** .5 // 14)
    for k in range(n):
        if k % 2: continue
        t0, t1 = k / n, (k + 1) / n
        d.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0), (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=(32, 62, 54, 255), width=4)
for (x, y, num, name, sub, col), (px, py) in zip(nodes, pts):
    d.ellipse([px - 20, py - 20, px + 20, py + 20], fill=col + (255,), outline=(255, 255, 255, 255), width=4)
    d.text((px, py), num, font=font, fill=(255, 255, 255, 255), anchor='mm')
    tw = max(d.textlength(name, font=font), d.textlength(sub, font=small)) + 16
    bx, by = px - tw / 2, py + 26
    d.rounded_rectangle([bx, by, bx + tw, by + 44], 8, fill=(255, 253, 245, 235), outline=(32, 62, 54, 255), width=2)
    d.text((px, by + 13), name, font=font, fill=(32, 62, 54, 255), anchor='mm'); d.text((px, by + 32), sub, font=small, fill=(60, 80, 74, 255), anchor='mm')
d.rectangle([0, H * TS, W * TS, H * TS + 150], fill=(255, 255, 255, 255))
d.text((16, H * TS + 16), 'DENAI · Peta Dunia — mockup daripada jubin Kenney sebenar (2×). Laluan bertitik + nod + kad = lapisan UI. Kawasan belum dibuka diberi kabus putih (jubin tidak diwarnakan semula).', font=small, fill=(32, 62, 54, 255))
d.text((16, H * TS + 40), 'World 1 hutan & sungai (rumput, pokok, jambatan papan) · World 2 tiang batu tinggi (jubin batu/pasir 40–43; latar karst belum ada) · World 3 pek industrial (cerobong paip, galang, tong)', font=small, fill=(32, 62, 54, 255))
d.text((16, H * TS + 62), 'World 4 teres ladang (pek farm, tanaman) · Pantai (pasir + laut) · Puncak salji (tanah salji 80–83, set latar salji, orang salji, awan salji). Tiada jubin ais: perlu seni baharu.', font=small, fill=(32, 62, 54, 255))
d.text((16, H * TS + 92), 'Kad World 1 membezakan "Selesai 2/3" (level tamat) dan "Tersedia 3/3" (level boleh dimain). Telefon: senarai kad (world-select.svg).', font=small, fill=(32, 62, 54, 255))
os.makedirs('design/blueprints', exist_ok=True)
img.convert('RGB').save('design/blueprints/world-map-pixel.png')
print(img.size)

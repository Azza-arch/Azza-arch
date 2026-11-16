# DENAI world map mock-up built ONLY from real Kenney tiles (design tool, not game code).
# Side-view adventure panorama, one region per World.
# V2.1: the world route is now pixel art that hugs the terrain (path dots on surfaces, plank
# bridges, ladders, an industrial girder walkway); no diagram line crosses the sky.
# Terrain columns use each pack's real edge pieces (single / left / middle / right).
# Run from app/addmath/denai:  python3 design/world-map-mock.py
from PIL import Image, ImageDraw, ImageFont
import os
A = 'assets/'
base = Image.open(A + 'kenney-pixel-platformer/Tilemap/tilemap_packed.png').convert('RGBA')
farm = Image.open(A + 'kenney-pixel-platformer-farm/Tilemap/tilemap_packed.png').convert('RGBA')
ind = Image.open(A + 'kenney-pixel-platformer-industrial/Tilemap/tilemap_packed.png').convert('RGBA')
bg = Image.open(A + 'kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png').convert('RGBA')
S = 2; TS = 18 * S; W, H = 64, 16
img = Image.new('RGBA', (W * TS, H * TS + 150), (174, 227, 245, 255))

def fr(sheet, i, cols):
    c, r = i % cols, i // cols
    return sheet.crop((c * 18, r * 18, c * 18 + 18, r * 18 + 18)).resize((TS, TS), Image.NEAREST)
def put(sheet, i, x, y, cols): img.alpha_composite(fr(sheet, i, cols), (int(round(x * TS)), int(round(y * TS))))
B = lambda i, x, y: put(base, i, x, y, 20)
F = lambda i, x, y: put(farm, i, x, y, 16)
I = lambda i, x, y: put(ind, i, x, y, 16)

# sky gradient + Kenney green forest band (same palette as World 1 in game)
d = ImageDraw.Draw(img)
for y in range(H * TS):
    t = y / (H * TS); d.line([(0, y), (W * TS, y)], fill=(int(143 + 33 * t), int(210 + 30 * t), int(239 - 29 * t), 255))
def bgtile(i, x, y): img.alpha_composite(bg.crop(((i % 8) * 24, (i // 8) * 24, (i % 8) * 24 + 24, (i // 8) * 24 + 24)).resize((24 * S, 24 * S), Image.NEAREST), (x, y))
for k, x in enumerate(range(0, 56 * TS, 24 * S)):
    bgtile(14 + k % 2, x, 7 * TS)
    for yy in range(7 * TS + 24 * S, H * TS, 24 * S): bgtile(22 + k % 2, x, yy)
for k, x in enumerate(range(56 * TS, W * TS, 24 * S)):                      # snow set behind the snow peaks
    bgtile(8 + k % 4, x, 6 * TS)
    for yy in range(6 * TS + 24 * S, H * TS, 24 * S): bgtile(16 + k % 4, x, yy)

# ── terrain columns with correct edge pieces ──
BASE_GRASS = dict(top=(20, 21, 22, 23), body=(120, 121, (4, 5), 123), put=B)
BASE_STONE = dict(top=(40, 41, 42, 43), body=(120, 121, (4, 5), 123), put=B)
BASE_SNOW = dict(top=(80, 81, 82, 83), body=(120, 121, (4, 5), 123), put=B)
IND = dict(top=(0, 1, 2, 3), body=(32, 33, 34, 35), put=I)
FARM = dict(top=(0, 1, 2, 3), body=(32, 33, 34, 35), put=F)
def block(x0, x1, top, kit):
    """Solid land from column x0 to x1-1, surface at row `top`, down to the map bottom."""
    for x in range(x0, x1):
        k = 0 if x1 - x0 == 1 else 1 if x == x0 else 3 if x == x1 - 1 else 2
        kit['put'](kit['top'][k], x, top)
        for y in range(top + 1, H):
            f = kit['body'][k]
            kit['put'](f[(x + y) % 2] if isinstance(f, tuple) else f, x, y)
def water(x0, x1, top):
    for x in range(x0, x1):
        B(33, x, top)
        for y in range(top + 1, H): B(73, x, y)
def tree(x, feet, big=False):
    B(137, x, feet - 1); B(136, x, feet - 2)
    if big: B(117, x, feet - 3); B(99, x + 1, feet - 3); B(98, x - 1, feet - 3); top = feet - 3
    else: top = feet - 2
    B(17, x - 1, top - 2); B(18, x, top - 2); B(19, x + 1, top - 2)
    B(57, x - 1, top - 1); B(97, x, top - 1); B(59, x + 1, top - 1)
def planks(x0, x1, row, posts=()):
    for x in range(x0, x1): B(48 if x == x0 else 50 if x == x1 - 1 else 49, x, row)
    for (px, bottom) in posts:
        for y in range(row + 1, bottom): B(89, px, y)
def ladder(x, top, bottom, metal=False):
    for y in range(top, bottom + 1):
        if metal: I(11 if y == top else 43 if y == bottom else 27, x, y)
        else: B(71, x, y)

# World 1 · forest & river (x 0–13), surface row 11
block(0, 5, 11, BASE_GRASS); water(5, 8, 12); block(8, 13, 11, BASE_GRASS)
planks(4, 9, 11, posts=[(5, 13), (7, 13)])                                   # plank bridge over the river
tree(2, 11, big=True); tree(11, 11); B(126, 9, 10); B(125, 1, 10)
# World 2 · limestone valley (x 13–25): stone-topped pillars linked by ladders and a plank bridge
block(13, 15, 8, BASE_STONE); block(15, 17, 10, BASE_STONE); block(17, 20, 5, BASE_STONE); block(20, 22, 9, BASE_STONE); block(22, 24, 8, BASE_STONE)
water(24, 25, 12)
ladder(12, 8, 10)                                                            # W1 → first pillar
planks(15, 17, 8, posts=[(15, 10), (16, 10)])                                # bridge over the valley dip
ladder(16, 5, 7)                                                             # up the tall pillar (node 2)
ladder(20, 5, 8)                                                             # down its east face
B(126, 18, 4); B(125, 23, 7)
# World 3 · factory & tin mine (x 25–37): ground + elevated girder walkway
block(26, 38, 11, IND)
for y in range(3, 11): I(59 if y == 3 else 107 if y == 10 else 75, 28, y)    # chimney stands on the ground
for y in range(5, 11): I(59 if y == 5 else 107 if y == 10 else 75, 35, y)
for x in range(24, 37): I(4 if x == 24 else 6 if x == 36 else 5, x, 8)        # one continuous girder walkway
for x in (26, 31, 34):
    I(52, x, 9); I(68, x, 10)                                                # scaffold legs reach the ground
I(9, 27, 10); I(10, 29, 10); I(62, 32, 10); I(42, 33, 10)
ladder(37, 8, 10, metal=True)                                                # walkway → ground at the east end
# World 4 · highland farm terraces (x 38–49), one-tile steps
for (x, top) in [(38, 11), (41, 10), (44, 9), (47, 8)]:
    block(x, x + 3, top, FARM)
    for k, crop in enumerate((56, 58, 59)): F(crop, x + k, top - 1)
F(22, 47, 6); F(23, 48, 6); F(20, 49, 6); F(36, 49, 7)
# Coast (x 50–55) and fantasy snow peaks (x 56–63)
block(50, 53, 12, BASE_STONE); water(53, 56, 12)
ladder(50, 8, 11)                                                            # terrace → beach
planks(53, 56, 12, posts=[(54, 14)])                                        # small pier
block(56, 59, 9, BASE_SNOW); block(59, 61, 6, BASE_SNOW); block(61, 64, 8, BASE_SNOW)
ladder(55, 9, 11)                                                            # pier → first snow ledge
ladder(58, 6, 8)                                                             # up to the peak
B(145, 57, 8); B(154, 60, 3); B(155, 61, 3)

# ── route marker: Kenney dot (frame 157) along walkable surfaces ──
ROUTE = [(1, 11), (2, 11), (3, 11), (4, 11), (5, 11), (6, 11), (7, 11), (8, 11), (9, 11), (10, 11), (11, 11),
         (13, 8), (14, 8), (15, 8), (16, 8), (17, 5), (18, 5), (19, 5), (21, 9), (22, 8), (23, 8),
         (24, 8), (25, 8), (26, 8), (27, 8), (29, 8), (30, 8), (31, 8), (32, 8), (33, 8), (34, 8), (36, 8),
         (38, 11), (39, 11), (40, 11), (41, 10), (42, 10), (43, 10), (44, 9), (45, 9), (46, 9), (47, 8), (48, 8), (49, 8),
         (51, 12), (52, 12), (53, 12), (54, 12), (56, 9), (57, 9), (59, 6), (60, 6)]
for (x, row) in ROUTE: B(157, x, row - 1)

# regions not yet open: white mist overlay (tiles are not recoloured)
fog = Image.new('RGBA', img.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(fog)
for x0, x1, a in [(25, 50, 70), (50, 64, 120)]: fd.rectangle([x0 * TS, 0, x1 * TS, H * TS], fill=(255, 255, 255, a))
img.alpha_composite(fog)

# nodes + label cards (UI layer)
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18); small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except OSError: font = small = ImageFont.load_default()
nodes = [(3, 11, '1', 'Hutan & Sungai', 'Fungsi · Selesai 2/3 · Tersedia 3/3', (47, 157, 85), 'below'),
         (18.5, 5, '2', 'Lembah Batu Kapur', 'F. Kuadratik · Prototaip (Stesen A)', (215, 162, 31), 'above'),
         (31, 8, '3', 'Kilang & Lombong', 'Sistem Persamaan · Akan datang', (154, 163, 160), 'above'),
         (48, 8, '4', 'Tanah Tinggi Ladang', 'Indeks, Surd & Log · Akan datang', (154, 163, 160), 'above'),
         (52, 12, '?', 'Pantai & Bakau', 'Tema cadangan', (190, 198, 196), 'below'),
         (60, 6, '?', 'Puncak Salji (fantasi)', 'Tema cadangan', (190, 198, 196), 'above')]
for (x, row, num, name, sub, col, side) in nodes:
    px, py = (x + .5) * TS, (row - 1) * TS + TS * .35
    d.ellipse([px - 17, py - 17, px + 17, py + 17], fill=col + (255,), outline=(255, 255, 255, 255), width=4)
    d.text((px, py), num, font=font, fill=(255, 255, 255, 255), anchor='mm')
    tw = max(d.textlength(name, font=font), d.textlength(sub, font=small)) + 16
    bx = min(max(px - tw / 2, 4), W * TS - tw - 4)
    by = py + 24 if side == 'below' else py - 24 - 44
    d.rounded_rectangle([bx, by, bx + tw, by + 44], 8, fill=(255, 253, 245, 238), outline=(32, 62, 54, 255), width=2)
    d.text((bx + tw / 2, by + 13), name, font=font, fill=(32, 62, 54, 255), anchor='mm'); d.text((bx + tw / 2, by + 32), sub, font=small, fill=(60, 80, 74, 255), anchor='mm')
d.rectangle([0, H * TS, W * TS, H * TS + 150], fill=(255, 255, 255, 255))
for k, line in enumerate([
    'DENAI · Peta Dunia V2.1 — mockup daripada jubin Kenney sebenar (2×). Laluan dunia = titik Kenney di atas permukaan + jambatan papan + tangga + laluan galang industri.',
    'World 1 hutan & sungai · World 2 tiang batu (jubin batu/pasir 40–43; latar karst belum ada) · World 3 kilang: tanah industri bertepi betul, laluan galang bersambung, kaki perancah dan cerobong berdiri di tanah.',
    'World 4 teres ladang · Pantai · Puncak salji (tanah salji 80–83, set latar salji, orang salji, awan). Kabus putih = belum dibuka (jubin tidak diwarnakan semula). Nod + kad = lapisan UI.',
    'Kad: "Selesai" (level tamat) berbeza daripada "Tersedia" (level boleh dimain). Telefon: senarai kad (world-select.svg).']):
    d.text((16, H * TS + 16 + k * 22), line, font=small, fill=(32, 62, 54, 255))
os.makedirs('design/blueprints', exist_ok=True)
img.convert('RGB').save('design/blueprints/world-map-pixel.png')
print(img.size)

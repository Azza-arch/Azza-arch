# DENAI world map mock-up built ONLY from real Kenney tiles (design tool, not game code).
# Side-view adventure panorama, one region per World.
# V2.1: the world route is now pixel art that hugs the terrain (path dots on surfaces, plank
# bridges, ladders, an industrial girder walkway); no diagram line crosses the sky.
# Terrain uses each pack's surface pieces (not the floating-slab row) and draws an outline only on exposed sides.
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
props = Image.new('RGBA', img.size, (0, 0, 0, 0)); land = Image.new('RGBA', img.size, (0, 0, 0, 0))
target = [props]
def put(sheet, i, x, y, cols): target[0].alpha_composite(fr(sheet, i, cols), (int(round(x * TS)), int(round(y * TS))))
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
BASE_STONE = dict(top=(60, 61, 62, 63), body=(120, 121, (4, 5), 123), put=B)
BASE_SNOW = dict(top=(100, 101, 102, 103), body=(120, 121, (4, 5), 123), put=B)
IND = dict(top=(16, 17, 18, 19), body=(32, 33, 34, 35), put=I)
FARM = dict(top=(16, 17, 18, 19), body=(32, 33, 34, 35), put=F)
LAND = {}
def block(x0, x1, top, kit):
    """Record solid land for columns x0..x1-1 (surface row `top`); drawn later by draw_land()."""
    for x in range(x0, x1): LAND[x] = (top, kit)
def draw_land():
    # An outline only where the ground is really exposed: a side edge is drawn on a row
    # only if the neighbouring column has no ground on that row. No lines inside the land.
    target[0] = land
    filled = lambda x, y: x in LAND and LAND[x][0] <= y
    for x, (top, kit) in LAND.items():
        for y in range(top, H):
            l, r = not filled(x - 1, y), not filled(x + 1, y)
            k = 0 if l and r else 1 if l else 3 if r else 2
            f = (kit['top'] if y == top else kit['body'])[k]
            kit['put'](f[(x + y) % 2] if isinstance(f, tuple) else f, x, y)
    target[0] = props
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

# ── helpers for the richer composition (V2.2) ──
def ceiling(x0, x1, bottom):
    """Rock overhang hanging from the top edge (rows 0..bottom), outlined on its exposed sides only."""
    for x in range(x0, x1):
        for y in range(0, bottom + 1):
            l, r = x == x0, x == x1 - 1
            k = 0 if l and r else 1 if l else 3 if r else 2
            f = (140, 141, 142, 143)[k] if y == bottom else (120, 121, (4, 5), 123)[k]
            target[0] = land; B(f[(x + y) % 2] if isinstance(f, tuple) else f, x, y); target[0] = props
def waterfall(x, top, bottom, alt=False):
    for y in range(top, bottom + 1): B((35 if alt else 34) if y == top else (75 if alt else 74) if y == bottom else (55 if alt else 54), x, y)
def slime_pool(x0, x1, top):
    for x in range(x0, x1):
        I(29, x, top)
        for y in range(top + 1, H): I(45, x, y)
def autumn_tree(x, feet):
    F(13, x - 1, feet - 5); F(14, x, feet - 5); F(15, x + 1, feet - 5)
    F(60, x - 1, feet - 4); F(77, x, feet - 4); F(63, x + 1, feet - 4)
    F(92, x, feet - 3); F(92, x, feet - 2); F(108, x, feet - 1)

# World 1 · forest & river (x 0–12): overhang, stepped bank, river with plank bridge, rising far bank
ceiling(0, 5, 2)
block(0, 4, 10, BASE_GRASS); block(4, 6, 11, BASE_GRASS); water(6, 9, 12); block(9, 12, 10, BASE_GRASS)
planks(5, 10, 11, posts=[(6, 13), (8, 13)])
tree(2, 10, big=True); tree(10, 10); B(128, 4, 10); B(125, 0, 9); B(124, 11, 9); B(86, 3, 9)
# World 2 · limestone valley (x 12–24): pillars, a karst spring falling into a pool, floating stones, clouds
block(12, 15, 7, BASE_STONE); water(15, 17, 11); block(17, 20, 4, BASE_STONE); block(20, 22, 9, BASE_STONE); block(22, 25, 7, BASE_STONE)
waterfall(15, 8, 10)                                                          # karst spring out of the pillar face into the pool
ladder(16, 4, 6)                                                              # bridge → top of the tall pillar
ladder(11, 7, 9)                                                              # forest bank → first pillar
planks(15, 17, 7, posts=[])                                                   # plank bridge over the pool to the tall pillar
ladder(20, 4, 8)                                                              # down the east face
ladder(21, 7, 8)                                                              # up to the last pillar
B(147, 13, 4); B(153, 21, 3); B(154, 22, 3); B(155, 23, 3); B(126, 18, 3); B(125, 23, 6); B(129, 13, 6)
# World 3 · factory & tin mine (x 25–38): two blocks around a slime pool, pipe into the pool, crane, conveyor
block(25, 28, 9, IND); slime_pool(28, 31, 11); block(31, 34, 9, IND); block(34, 38, 11, IND)
for y in range(2, 9): I(59 if y == 2 else 107 if y == 8 else 75, 26, y)       # chimney standing on the left block
for x, f in [(28, 108), (29, 109)]: I(f, x, 10)                               # pipe leaves the wall below the walkway…
I(77, 30, 10)                                                                 # …and bends down into the slime pool
for x in range(28, 31): I(4 if x == 28 else 6 if x == 30 else 5, x, 9)        # girder bridge over the pool (the route)
I(9, 25, 8); I(10, 27, 8); I(42, 31, 8)                                       # barrels, warning sign
for y in range(3, 9): I(53, 33, y)                                            # crane tower on the right block
for x in range(29, 36): I(4 if x == 29 else 6 if x == 35 else 5, x, 2)        # crane jib
I(8, 30, 3); I(24, 30, 4); I(39, 30, 5); I(38, 30, 6)                        # chain, hook, crate over the pool
for x, f in [(35, 84), (36, 85), (37, 86)]: I(f, x, 10)                       # conveyor on the low yard
ladder(34, 9, 10, metal=True)
# World 4 · highland farm (x 38–50): climbing terraces, autumn tree, planters, greenhouse on top
for (x, top) in [(38, 11), (41, 10), (44, 9), (47, 8)]: block(x, x + 3, top, FARM)
for k, f in enumerate((38, 39, 40)): F(f, 38 + k, 10)
autumn_tree(42, 10)
for k, crop in enumerate((56, 58, 59)): F(crop, 44 + k, 8)
for k, f in enumerate((64, 66, 67)): F(f, 47 + k, 5)
for k, f in enumerate((80, 82, 83)): F(f, 47 + k, 6)
for k, f in enumerate((96, 97, 99)): F(f, 47 + k, 7)
# Coast (x 50–55): sandy steps, mushroom platform, a spring falling into the sea, pier
block(50, 52, 11, BASE_STONE); block(52, 54, 12, BASE_STONE); water(54, 56, 13)
ladder(50, 8, 10)
B(12, 52, 9); B(13, 53, 9); B(15, 54, 9); B(32, 53, 10); B(72, 53, 11)       # mushroom platform on the lower step
planks(54, 56, 13, posts=[(55, 15)])
# Fantasy snow peaks (x 56–63): ledges, peak, clouds, snowman
block(56, 58, 10, BASE_SNOW); block(58, 60, 7, BASE_SNOW); block(60, 64, 9, BASE_SNOW)
ladder(55, 10, 12); ladder(57, 7, 9)
B(145, 56, 9); B(153, 60, 3); B(154, 61, 3); B(155, 62, 3); B(156, 57, 4); B(106, 62, 8); B(111, 63, 8)

draw_land(); img.alpha_composite(land); img.alpha_composite(props); target[0] = img
# ── route marker: Kenney dot (frame 157) along walkable surfaces ──
ROUTE = [(1, 10), (2, 10), (3, 10), (4, 11), (5, 11), (6, 11), (7, 11), (8, 11), (9, 11), (10, 10),
         (12, 7), (13, 7), (14, 7), (15, 7), (16, 7), (17, 4), (18, 4), (19, 4), (21, 9), (22, 7), (23, 7), (24, 7),
         (25, 9), (27, 9), (28, 9), (29, 9), (30, 9), (31, 9), (32, 9), (35, 11), (36, 11), (37, 11),
         (38, 11), (39, 11), (40, 11), (41, 10), (43, 10), (44, 9), (45, 9), (46, 9), (47, 8), (49, 8),
         (51, 11), (52, 12), (53, 12), (54, 13), (55, 13), (56, 10), (58, 7), (59, 7)]
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
nodes = [(2, 10, '1', 'Hutan & Sungai', 'Fungsi · Selesai 2/3 · Tersedia 3/3', (47, 157, 85), 'below'),
         (18, 4, '2', 'Lembah Batu Kapur', 'F. Kuadratik · Prototaip (Stesen A)', (215, 162, 31), 'above'),
         (32, 9, '3', 'Kilang & Lombong', 'Sistem Persamaan · Akan datang', (154, 163, 160), 'above'),
         (48, 5, '4', 'Tanah Tinggi Ladang', 'Indeks, Surd & Log · Akan datang', (154, 163, 160), 'above'),
         (51, 11, '?', 'Pantai & Bakau', 'Tema cadangan', (190, 198, 196), 'below'),
         (58.5, 7, '?', 'Puncak Salji (fantasi)', 'Tema cadangan', (190, 198, 196), 'above')]
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
    'DENAI · Peta Dunia V2.2 — mockup daripada jubin Kenney sebenar (2×). Susunan berlapis ala contoh Kenney: tebing tergantung, mata air ke kolam, kolam lendir, kren, rumah hijau, platform cendawan.',
    'Laluan dunia = titik Kenney di atas permukaan + jambatan papan/galang + tangga; setiap objek ada sebab (paip keluar dari dinding, kren di atas tanah, air terjun dari mata air ke kolam).',
    'World 4 teres ladang · Pantai · Puncak salji (tanah salji 80–83, set latar salji, orang salji, awan). Kabus putih = belum dibuka (jubin tidak diwarnakan semula). Nod + kad = lapisan UI.',
    'Kad: "Selesai" (level tamat) berbeza daripada "Tersedia" (level boleh dimain). Telefon: senarai kad (world-select.svg).']):
    d.text((16, H * TS + 16 + k * 22), line, font=small, fill=(32, 62, 54, 255))
os.makedirs('design/blueprints', exist_ok=True)
img.convert('RGB').save('design/blueprints/world-map-pixel.png')
print(img.size)

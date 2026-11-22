"""Read supplied exports without altering them; create a review contact sheet."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image, ImageDraw
from io import BytesIO
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path.home() / 'Downloads'
out = ROOT / 'tests' / 'artifacts'
out.mkdir(parents=True, exist_ok=True)
samples = []
inventory = []
for archive in ['Untitled (1).zip', 'Untitled (2).zip', 'Untitled (3).zip', 'Untitled (4).zip', 'Untitled (5).zip', 'Untitled (6).zip', '6b4685617198dc462000894496292b56152abb5c (1).zip']:
    with ZipFile(DOWNLOADS / archive) as z:
        for info in z.infolist():
            if not info.filename.endswith('.png'):
                continue
            data = z.read(info)
            im = Image.open(BytesIO(data)).convert('RGBA')
            inventory.append(dict(archive=archive, file=info.filename, size=im.size,
                alpha=im.getextrema()[3], bounds=im.getbbox(), date=info.date_time,
                sha256=hashlib.sha256(data).hexdigest()))
            if (info.filename.endswith(('house_1_full.png', 'ground_center.png', 'ladder_middle.png', 'platform_wood_center.png', 'function_machine_idle.png', 'house_3_full.png', 'water_tank_stand.png', 'Normal_Idle_000.png', 'Running_000.png'))
                or 'FINAL (' in info.filename):
                samples.append((archive, info.filename, im.copy()))
sheet = Image.new('RGB', (1200, ((len(samples)+3)//4)*240), '#ddd')
d = ImageDraw.Draw(sheet)
for i, (archive, name, im) in enumerate(samples):
    x, y = (i%4)*300, (i//4)*240
    im.thumbnail((280,190))
    sheet.paste(im, (x+(300-im.width)//2,y+8), im)
    d.text((x+8,y+203), archive[:30], fill='black')
    d.text((x+8,y+220), Path(name).name[:36], fill='black')
sheet.save(out/'asset-review.jpg')
(out/'source-inventory.json').write_text(json.dumps(inventory, indent=2))
print(f'{len(inventory)} PNGs inspected; {len(samples)} visual samples.')

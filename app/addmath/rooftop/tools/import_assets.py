"""Copy selected original PNGs, keeping source versions and hashes explicit."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image
from io import BytesIO
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path.home() / 'Downloads'
files = {}
records = []

def copy(z, name, target, key):
    data = z.read(name)
    dest = ROOT / 'assets' / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    im = Image.open(BytesIO(data)).convert('RGBA')
    files[key] = 'assets/' + target
    records.append(dict(key=key, source=Path(z.filename).name, entry=name,
        path=files[key], dimensions=im.size, alphaBounds=im.getbbox(),
        sha256=hashlib.sha256(data).hexdigest()))

selected = {
    'Ground': ['ground_left','ground_center','ground_right','ground_center_alt01'],
    'Houses': ['house_1_full','house_2_full','house_3_full'],
    'Traversal': ['ladder_middle','ladder_top','ladder_bottom','platform_wood_center',
        'platform_wood_left','platform_wood_right','platform_post','walkway_railing'],
    'Props': ['water_tank_stand','plant_pot_leafy','plant_pot_tall','plant_hanging',
        'plant_bush','laundry_line','flag_malaysia','lamp_wall'],
    'HouseParts': ['h3_roof_hut','h3_wall_upper','h3_wall_lower','h3_window_casement',
        'h3_door_grille','h1_roof_porch','h3_parapet'],
    'Puzzle': ['function_machine_idle','function_machine_active','checkpoint_post_idle',
        'checkpoint_post_active','answer_sign'],
}
with ZipFile(DOWNLOADS/'Untitled (6).zip') as z:
    for category, names in selected.items():
        for name in names:
            copy(z, f'Level1/{category}/{name}.png', f'production/{category}/{name}.png', name)
with ZipFile(DOWNLOADS/'Untitled (1).zip') as z:
    for name in ['bg_hills','bg_cloud','bg_house_row','bg_palm','bg_mosque']:
        copy(z, f'Level1/Background/{name}.png', f'background-legacy/{name}.png', name)
with ZipFile(DOWNLOADS/'6b4685617198dc462000894496292b56152abb5c (1).zip') as z:
    for state, folder in [('idle','01-Normal_Idle'),('run','06-Running'),('jump','07-Jump_Up'),('fall','08-Jump_Fall')]:
        names = sorted(n for n in z.namelist() if f'/{folder}/' in n and n.endswith('.png'))
        for i,name in enumerate(names):
            copy(z, name, f'chill-boy/{state}-{i:02}.png', f'{state}-{i:02}')
    (ROOT/'assets'/'chill-boy'/'SOURCE-README.txt').write_bytes(z.read('CHILL BOY BASIC ANIMATION/ReadMe.txt'))

(ROOT/'assets'/'manifest.json').write_text(json.dumps(files, indent=2))
(ROOT/'assets'/'provenance.json').write_text(json.dumps(records, indent=2))
print(f'Imported {len(records)} unchanged PNGs. Manifest and SHA-256 provenance saved.')

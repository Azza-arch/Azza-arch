"""Read-only game integrity and offline blueprint artifact checks."""
from pathlib import Path
import hashlib, json, re
from PIL import Image

out = Path(__file__).resolve().parent
game = out.parents[2] / 'app/addmath/rooftop'
before = json.loads((out/'evidence/working-game-before.json').read_text(encoding='utf-8-sig'))
changed = [p for p,h in before.items() if not (game/p).is_file() or hashlib.sha256((game/p).read_bytes()).hexdigest()!=h]
current = {p.relative_to(game).as_posix() for folder in ['src','assets'] for p in (game/folder).rglob('*') if p.is_file()}
current.update(['index.html','style.css'])
added = sorted(current-set(before))
missing_links=[]
for doc in out.glob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)',doc.read_text(encoding='utf-8')):
        if not link.startswith(('http:','https:','#')) and not (doc.parent/link.split('#')[0]).exists():
            missing_links.append([doc.name,link])
images={}
for name in ['master-world-topology.png','master-gameplay-blockout.png','master-kenney-composition.png']:
    with Image.open(out/name) as im:
        im.verify()
    with Image.open(out/name) as im: images[name]=list(im.size)
result=dict(checkedGameFiles=len(before),changed=changed,addedGameFiles=added,gameUnchanged=not changed and not added,missingDocumentLinks=missing_links,images=images,scope='Offline design validation only; no Phaser traversal claimed')
(out/'evidence/working-game-unchanged.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
assert result['gameUnchanged'], result
assert not missing_links, missing_links
print(json.dumps(result,indent=2))

"""Allowlist only files required by V11. No publish, route switch or git writes."""
from pathlib import Path
import json,re,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[3];OUT=Path(__file__).parent
GAME=ROOT/'app/addmath/rooftop'
selected={GAME/'v11.html',GAME/'style.css',GAME/'assets/manifest.json',GAME/'vendor/phaser-3.90.0.min.js'}
selected.update((GAME/'src/v11').glob('*.js'));selected.update((GAME/'src/v11').glob('*.css'))
selected.update([GAME/'src/audio.js',GAME/'src/level.js'])
manifest=json.loads((GAME/'assets/manifest.json').read_text(encoding='utf-8-sig'))
for key,path in manifest.items():
 if key.startswith('kpp_') or re.match(r'^(idle|run|jump|fall)-',key):selected.add(GAME/path)
# CSS URLs are local and must resolve inside the game root.
for f in list(selected):
 if f.suffix=='.css':
  for url in re.findall(r'url\([\'"]?([^\)\'\"]+)',f.read_text(encoding='utf-8-sig')):
   if url.startswith('data:'):continue
   asset=(f.parent/url).resolve();assert asset.is_relative_to(GAME.resolve());selected.add(asset)
selected.update((GAME/'assets/kenney-pixel-platformer').glob('*LICENSE*'))
for f in selected:assert f.is_file(),f
archive=OUT/'v11-phase5-runtime-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(selected):z.write(f,f.relative_to(ROOT).as_posix())
entries={f.relative_to(ROOT).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(selected)}
assert not any('/tests/' in name or '/audits/' in name or '.env' in name or '/docs/' in name for name in entries)
(OUT/'runtime-package-manifest.json').write_text(json.dumps({'files':entries,'archiveBytes':archive.stat().st_size,'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'deploymentPerformed':False},indent=2))
print(f'Allowlisted {len(entries)} runtime files, archive {archive.stat().st_size} bytes. No deployment.')

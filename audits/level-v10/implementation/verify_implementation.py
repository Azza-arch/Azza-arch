from pathlib import Path
import hashlib,json,csv
out=Path(__file__).resolve().parent
root=out.parents[2];game=root/'app/addmath/rooftop'
baseline=json.loads((out/'baseline-hashes.json').read_text())
changed=[name for name,h in baseline.items() if not (game/name).exists() or hashlib.sha256((game/name).read_bytes()).hexdigest()!=h]
assert not changed,changed
data=json.loads((game/'src/v10/candidate-world.json').read_text())
rows=[s for s in data['surfaces'] if s['zone'] in ['A','B','C']]
with (out/'implemented-surfaces.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
assets=game/'assets/kenney-pixel-platformer'
inventory={'atlas':'Tilemap/tilemap_packed.png','nativeFrame':[18,18],'columns':20,'rows':9,'frames':180,'atlasSha256':hashlib.sha256((assets/'Tilemap/tilemap_packed.png').read_bytes()).hexdigest(),'environmentFrames':[4,5,9,12,13,15,17,18,19,20,21,22,23,37,38,39,48,49,50,57,58,59,64,65,66,68,69,71,84,85,89,91,107,111,112,120,121,123,124,125,128,136,151,157]}
assert all((assets/f'Tiles/tile_{i:04}.png').is_file() for i in inventory['environmentFrames'])
(out/'asset-inventory.json').write_text(json.dumps(inventory,indent=2))
result={'v9FilesChecked':len(baseline),'v9ChangedFiles':changed,'v9Preserved':not changed,'v10Entry':'app/addmath/rooftop/v10.html','snapshot':'v9-baseline.zip','implementedZones':['A','B','C'],'futureZonesImplemented':False,'worldDimensions':[8400,1600],'playableRightBoundary':2916,'surfaceCount':len(rows),'snapshotSha256':hashlib.sha256((out/'v9-baseline.zip').read_bytes()).hexdigest()}
(out/'logs/integrity.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))

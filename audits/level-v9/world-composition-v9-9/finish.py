from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
GAME = ROOT / 'app/addmath/rooftop'
p = GAME / 'src/game.js'
s = p.read_text(encoding='utf-8')
start = s.index('    const supports =', s.index('  deck(data,'))
end = s.index('    return images;', start)
s = s[:start] + '''    // One-way decks have open air beneath them, matching their collision.
    // A continuous timber edge distinguishes them from solid grass ground.
    const images = [];
    for (let x = 0; x < data.width; x += 54) {
      const width = Math.min(54, data.width - x);
      const key = x === 0 ? 'kpp_bridge_left' : x + 54 >= data.width ? 'kpp_bridge_right' : 'kpp_bridge_mid';
      images.push(this.add.image(data.x + x, data.y, key).setOrigin(0).setDisplaySize(width, 18).setDepth(10));
    }
''' + s[end:]
s = s.replace("g.x + 10, g.y", "g.x - 48, g.y").replace("g.x + g.width - 82, g.y", "g.x + g.width, g.y").replace("setDisplaySize(72, 72).setDepth(11)", "setDisplaySize(48, 48).setDepth(11)")
s = s.replace("    prop('flag_malaysia', 160, 1100, .8);", "    prop('flag_malaysia', 160, 1100, .8);\n    this.sceneryTree(100, 1100);\n    this.sceneryTree(2855, 1100);\n    this.sceneryTree(4180, 1100);")
s = s.replace("this.add.image(570, 1100, 'kpp_tree').setOrigin(.5, 1).setDisplaySize(90, 108).setDepth(8);", "this.sceneryTree(560, 1100);")
s = s.replace("this.add.image(2900, 1100, 'kpp_tree').setOrigin(.5, 1).setDisplaySize(90, 108).setDepth(8);", "this.sceneryTree(3390, 1100);")
start = s.index('  buildScenery() {')
s = s[:start] + '''  sceneryTree(x, groundY) {
    // Verified Base-pack canopy and trunk tiles; scenery has no body.
    for (let row = 0; row < 3; row++) {
      this.add.image(x - 27, groundY - 54 * (row + 1), 'kpp_trunk').setOrigin(0).setDisplaySize(54, 54).setDepth(3);
    }
    const canopy = [[17,18,19],[37,38,39],[57,58,59]];
    canopy.forEach((line, row) => line.forEach((id, col) => {
      this.add.image(x - 81 + col * 54, groundY - 270 + row * 54, `kpp_canopy_${id}`).setOrigin(0).setDisplaySize(54,54).setDepth(3);
    }));
  }
''' + s[start:]
# Keep the distant band in the camera's horizon rather than below its viewport.
s = s.replace("x, 1000, 'kpp_bg_hill_crop'", "x, 420, 'kpp_bg_hill_crop'")
p.write_text(s, encoding='utf-8')
p = GAME / 'assets/manifest.json'
m = json.loads(p.read_text())
for n in [17,18,19,37,38,39,57,58,59]:
    m[f'kpp_canopy_{n}'] = f'assets/kenney-pixel-platformer/Tiles/tile_{n:04}.png'
m['kpp_trunk'] = 'assets/kenney-pixel-platformer/Tiles/tile_0136.png'
p.write_text(json.dumps(m, indent=2)+'\n')

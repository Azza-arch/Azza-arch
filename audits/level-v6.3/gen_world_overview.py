"""Technical visual-composition overview — a labeled diagram distinguishing
layers and existing-vs-proposed elements, rendered from the live V6.2
src/level.js geometry. NOT concept art."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(22, 6))

zones = [("A", 0, 1100), ("B", 1100, 2200), ("C", 2200, 3100), ("D", 3100, 4300),
         ("E", 4300, 6150), ("F", 6150, 6800), ("G", 6800, 7400)]
for i, (name, x0, x1) in enumerate(zones):
    ax.axvspan(x0, x1, color="#f5f5f2" if i % 2 == 0 else "#ffffff", zorder=0)
    ax.text((x0 + x1) / 2, 420, name, ha="center", fontsize=14, fontweight="bold", color="#555")

# LAYER 1 - Background (proposed, lightest, hatched to mark "proposed")
bg_band = patches.Rectangle((0, 420), 7400, 260, facecolor="#e4e4df", edgecolor="none", zorder=1)
ax.add_patch(bg_band)
ax.text(60, 450, "LAYER 1 — BACKGROUND (proposed: bg_house_row / bg_hills / bg_mosque)", fontsize=8, color="#888", style="italic")
for x, w, label in [(150, 256, "bg_house_row"), (1300, 256, "bg_house_row"), (5600, 512, "bg_hills"), (6600, 512, "bg_hills (cont.)"), (2900, 176, "bg_mosque (x1)")]:
    ax.add_patch(patches.Rectangle((x, 500), w, 120, facecolor="#dcdcd6", edgecolor="#bbb", linestyle="--", linewidth=0.8, zorder=1))

# LAYER 2 - Midground (proposed, dashed = proposed addition)
mg_band_y = 680
for x, w, h, label in [
    (200, 448, 150, "house_1_full"), (750, 448, 150, "house_2_full"),
    (1250, 130, 70, "h3_roof_hut"), (1510, 130, 70, "h3_roof_hut"),
    (2700, 213, 50, "h1_roof_porch"), (2650, 468, 180, "house_3_full"),
    (3700, 224, 120, "workshop (h3_wall+door_grille)"),
    (4500, 900, 90, "roof-mass (h3_roof_hut x N + h3_parapet)"),
]:
    ax.add_patch(patches.Rectangle((x, mg_band_y - h), w, h, facecolor="#b9bcb2", edgecolor="#777", linestyle="--", linewidth=1, zorder=2))
    ax.text(x + w / 2, mg_band_y - h - 6, label, ha="center", fontsize=5.5, color="#555")
ax.text(60, 690, "LAYER 2 — MIDGROUND (proposed building/landmark silhouettes, non-collidable)", fontsize=8, color="#777", style="italic")

# LAYER 3 - Gameplay terrain (EXISTING, solid, from live level.js)
def ground(x0, x1, y=1000):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 24, facecolor="#4b4e47", edgecolor="black", linewidth=0.5, zorder=4))
def deck(x0, x1, y):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 14, facecolor="#4b4e47", edgecolor="black", linewidth=0.5, zorder=4))
def ladder(x, y0, y1):
    ax.plot([x, x], [y0, y1], color="#c08a1e", linewidth=2.5, zorder=5)

for x0, x1 in [(0, 420), (540, 3850), (4300, 5650), (6150, 7400)]:
    ground(x0, x1)
deck(1250, 1370, 900); deck(1510, 1660, 960)
ladder(1280, 900, 1000); ladder(1630, 960, 1000)
deck(2700, 2880, 824); ladder(2720, 824, 1000)
deck(4550, 4690, 960); deck(4800, 4960, 896); deck(4880, 5040, 800); deck(5200, 5350, 940)
ladder(4900, 800, 896)
deck(6400, 6550, 824); ladder(6460, 824, 1000)
deck(6700, 7400, 824); ladder(6720, 824, 1000)
ax.text(60, 1060, "LAYER 3 — GAMEPLAY TERRAIN (existing, unchanged V6.2 geometry, darkest = highest contrast)", fontsize=8, color="#222", fontweight="bold")

# LAYER 4 - Interactive (EXISTING positions, proposed sprite upgrade marked with star)
def interactive(x, y, label):
    ax.scatter([x], [y], s=90, facecolor="#8a1a1a", edgecolor="black", zorder=6, marker="D")
    ax.text(x, y - 26, label, ha="center", fontsize=6.5, fontweight="bold", color="#8a1a1a")

interactive(3750, 1000, "M1*")
interactive(5020, 800, "M2*")
interactive(6820, 824, "M3*")
for x, y, label in [(2750, 1000, "CP1*"), (6200, 1000, "CP2*"), (6780, 824, "CP3*")]:
    ax.scatter([x], [y], s=60, facecolor="#1b5e20", edgecolor="black", zorder=6, marker="^")
    ax.text(x, y - 26, label, ha="center", fontsize=6.5, fontweight="bold", color="#1b5e20")
ax.text(60, 760, "LAYER 4 — INTERACTIVE (existing positions, unchanged; * = proposed sprite swap to function_machine_*/checkpoint_post_*)", fontsize=8, color="#8a1a1a", fontweight="bold")

ax.set_title("Lorong Atas Bumbung — V6.3 World Visual-Composition Overview (technical diagram, not concept art)\nSolid fill = existing/unchanged geometry · Dashed outline = proposed addition (non-collidable)", fontsize=11, fontweight="bold", pad=18)
ax.set_xlim(-150, 7550)
ax.set_ylim(380, 1080)
ax.invert_yaxis()
ax.set_xlabel("world x (px)")
ax.set_yticks([])
ax.grid(True, axis="x", linewidth=0.3, alpha=0.3)
fig.tight_layout()
fig.savefig(r"C:\laragon\www\Azza-arch\audits\level-v6.3\level-v6.3-world-overview.png", dpi=155)
print("done")

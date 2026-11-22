"""Technical overview rendered directly from the live, shipped src/level.js
constants (same convention as level-v6.1-implemented-geometry.png) — this is
a labeled diagram of what IS implemented, not a proposal."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def ground(ax, x0, x1, y=1000, color="#6b6b6b"):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 24, facecolor=color, edgecolor="black", linewidth=0.6, zorder=2))

def deck(ax, x0, x1, y, color="#3a7ca5", label=None):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 14, facecolor=color, edgecolor="black", linewidth=0.6, zorder=3))
    if label:
        ax.text((x0 + x1) / 2, y - 18, label, ha="center", va="top", fontsize=6.5, zorder=5)

def ladder(ax, x, y0, y1, color="#c08a1e"):
    ax.plot([x, x], [y0, y1], color=color, linewidth=3, zorder=4)

def marker(ax, x, y, label, color="#b22222", shape="o"):
    ax.scatter([x], [y], s=70, facecolor=color, edgecolor="black", zorder=6, marker=shape)
    ax.text(x, y - 30, label, ha="center", va="top", fontsize=6.5, fontweight="bold", zorder=6)

fig, ax = plt.subplots(figsize=(20, 5))
zones = [("A", 0, 1100), ("B", 1100, 2200), ("C", 2200, 3100), ("D", 3100, 4300),
         ("E", 4300, 6150), ("F", 6150, 6800), ("G", 6800, 7400)]
for i, (name, x0, x1) in enumerate(zones):
    ax.axvspan(x0, x1, color="#eef3f7" if i % 2 == 0 else "#ffffff", zorder=0)
    ax.text((x0 + x1) / 2, 60, name, ha="center", fontsize=13, fontweight="bold", color="#555")

for x0, x1 in [(0, 420), (540, 3850), (4300, 5650), (6150, 7400)]:
    ground(ax, x0, x1)
ax.add_patch(patches.Rectangle((420, 1000), 120, 24, facecolor="white", edgecolor="red", linestyle=":", linewidth=1, zorder=2))
marker(ax, 480, 1000, "FIRST_GAP", color="#888", shape="x")

# Zone B — IMPLEMENTED: two platforms, varied height (awning-b3 removed)
deck(ax, 1250, 1370, 900, label="awning-b1")
deck(ax, 1510, 1660, 960, label="awning-b2")
ladder(ax, 1280, 900, 1000)
ladder(ax, 1630, 960, 1000)
ax.annotate("", xy=(1510, 900), xytext=(1370, 900), arrowprops=dict(arrowstyle="->", color="#2e7d32", linestyle="--"))
ax.text((1370 + 1510) / 2, 870, "140px / drop 60px", fontsize=6.5, ha="center", color="#2e7d32")
marker(ax, 1310, 870, "coin-b1", color="#f1c40f", shape="o")
marker(ax, 1585, 925, "coin-b2", color="#f1c40f", shape="o")

# Zone C
deck(ax, 2700, 2880, 824, color="#8e6bbf", label="café roof")
ladder(ax, 2720, 824, 1000)
marker(ax, 2750, 1000, "CP1", color="#1b5e20", shape="^")

# Zone D
marker(ax, 3750, 1000, "M1", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((3850, 1000), 450, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))

# Zone E — IMPLEMENTED: chain unchanged, M2 relocated to roof-e3
deck(ax, 4550, 4690, 960, label="roof-e1")
deck(ax, 4800, 4960, 896, label="roof-e2")
deck(ax, 4880, 5040, 800, label="roof-e3 (MANDATORY — hosts M2)")
deck(ax, 5200, 5350, 940, label="roof-e4 (optional branch)")
ladder(ax, 4900, 800, 896)
marker(ax, 5020, 800, "M2", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((5650, 1000), 500, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))
marker(ax, 6200, 1000, "CP2", color="#1b5e20", shape="^")
marker(ax, 4850, 870, "coin-e1", color="#f1c40f", shape="o")
marker(ax, 5280, 910, "coin-e2", color="#f1c40f", shape="o")

# Zone F
deck(ax, 6400, 6550, 824, color="#8e6bbf", label="cave")
ladder(ax, 6460, 824, 1000)
deck(ax, 6700, 7400, 824, color="#3a7ca5", label="hill plateau")
ladder(ax, 6720, 824, 1000)
marker(ax, 6780, 824, "CP3", color="#1b5e20", shape="^")

# Zone G
marker(ax, 6820, 824, "M3", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((6900, 824), 350, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))
marker(ax, 7330, 824, "GOAL", color="gold", shape="*")
marker(ax, 156, 1000, "SPAWN", color="#1b5e20", shape="P")

ax.set_title("Lorong Atas Bumbung — V6.2 IMPLEMENTED Geometry (rendered from the live src/level.js constants)", fontsize=11, fontweight="bold")
ax.set_xlim(-100, 7500)
ax.set_ylim(680, 1080)
ax.invert_yaxis()
ax.set_xlabel("world x (px)")
ax.set_ylabel("world y (px, inverted)")
ax.grid(True, linewidth=0.3, alpha=0.4)
fig.tight_layout()
fig.savefig(r"C:\laragon\www\Azza-arch\audits\level-v6.2\level-v6.2-implemented-map.png", dpi=160)
print("done")

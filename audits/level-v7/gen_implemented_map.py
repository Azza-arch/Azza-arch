"""Technical full-map diagram rendered directly from the live, shipped
src/level.js constants — not concept art, not the reference image."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def ground(ax, x0, x1, y=1100, color="#6b6b6b"):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 24, facecolor=color, edgecolor="black", linewidth=0.6, zorder=2))

def deck(ax, x0, x1, y, color="#3a7ca5", label=None, dash=False):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 14, facecolor=color, edgecolor="black",
                 linewidth=0.8, linestyle="--" if dash else "-", zorder=3))
    if label:
        ax.text((x0 + x1) / 2, y - 16, label, ha="center", va="top", fontsize=6, zorder=5)

def ladder(ax, x, y0, y1, color="#c08a1e"):
    ax.plot([x, x], [y0, y1], color=color, linewidth=3, zorder=4)

def marker(ax, x, y, label, color="#b22222", shape="o"):
    ax.scatter([x], [y], s=90, facecolor=color, edgecolor="black", zorder=6, marker=shape)
    ax.text(x, y - 28, label, ha="center", va="top", fontsize=7, fontweight="bold", zorder=6)

fig, ax = plt.subplots(figsize=(22, 9))

zones = [("A", 0, 620), ("B", 620, 1300), ("D", 1300, 1750), ("E", 1700, 2880),
         ("F", 2880, 3700), ("G", 3700, 4300)]
for i, (name, x0, x1) in enumerate(zones):
    ax.axvspan(x0, x1, color="#f2f2ee" if i % 2 == 0 else "#ffffff", zorder=0)

# Ground
for x0, x1 in [(0, 420), (540, 1300), (1600, 1800), (2880, 3700), (4000, 4300)]:
    ground(ax, x0, x1)
ax.add_patch(patches.Rectangle((420, 1100), 120, 24, facecolor="white", edgecolor="red", linestyle=":", linewidth=1, zorder=2))
marker(ax, 480, 1100, "FIRST_GAP", color="#888", shape="x")

# Decks
deck(ax, 580, 900, 980, label="town-walk-1")
deck(ax, 1040, 1300, 980, label="town-walk-2")
deck(ax, 650, 1030, 820, color="#8e6bbf", label="cafe-deck (C)")
deck(ax, 1600, 1800, 980, label="workshop-approach")
deck(ax, 1750, 1950, 700, dash=True, label="roof-entry")
deck(ax, 2100, 2300, 740, dash=True, label="roof-laundry")
deck(ax, 2260, 2580, 660, dash=True, label="roof-m2")
deck(ax, 2920, 3070, 700, label="f-step1")
deck(ax, 2970, 3120, 880, color="#8e6bbf", label="cave-alcove (opt.)")
deck(ax, 3220, 3370, 900, label="f-step2")

# Ladders
for x, y0, y1 in [(610, 980, 1100), (750, 820, 980), (1770, 700, 980), (2280, 660, 740), (3000, 700, 880), (3230, 900, 1100)]:
    ladder(ax, x, y0, y1)

# Gates
for x0, x1, y in [(1300, 1600, 980), (2580, 2880, 660), (3700, 4000, 1100)]:
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1.2, zorder=2))

# Terminals, checkpoints, spawn, goal
marker(ax, 1250, 980, "M1", color="#b22222", shape="D")
marker(ax, 2400, 660, "M2", color="#b22222", shape="D")
marker(ax, 3650, 1100, "M3", color="#b22222", shape="D")
marker(ax, 950, 820, "CP1", color="#1b5e20", shape="^")
marker(ax, 2950, 700, "CP2", color="#1b5e20", shape="^")
marker(ax, 3550, 1100, "CP3", color="#1b5e20", shape="^")
marker(ax, 80, 1100, "SPAWN", color="#1b5e20", shape="P")
marker(ax, 4100, 1100, "GOAL", color="gold", shape="*")

# Main route arrows (schematic)
route = [(80,1100),(610,1100),(610,980),(900,980),(1040,980),(1300,980),(1600,980),
         (1770,980),(1770,700),(1950,700),(2100,740),(2280,740),(2280,660),(2580,660),
         (2920,700),(3070,700),(3220,900),(3370,900),(3230,900),(3230,1100),(3700,1100),(4100,1100)]
rx = [p[0] for p in route]; ry = [p[1] for p in route]
ax.plot(rx, ry, color="#2e7d32", linewidth=1.5, linestyle="--", alpha=0.6, zorder=1)

# Optional branch (cave)
ax.plot([2950,3000,3000,2950],[700,700,880,880], color="#1565c0", linewidth=1.5, linestyle=":", alpha=0.7, zorder=1)

for name, x0, x1 in zones:
    ax.text((x0 + x1) / 2, 560, name, ha="center", fontsize=16, fontweight="bold", color="#555")
ax.text(960, 560, "C", ha="center", fontsize=16, fontweight="bold", color="#555")

ax.set_title("Lorong Atas Bumbung — V7 IMPLEMENTED Full Map (rendered from the live src/level.js constants)\nDashed outline = no ground beneath (checkpoint-recovery chain) · Dotted red = unsolved gate gap · Dashed green = main route · Dotted blue = optional branch",
             fontsize=11, fontweight="bold")
ax.set_xlim(-100, 4400)
ax.set_ylim(540, 1180)
ax.invert_yaxis()
ax.set_xlabel("world x (px)")
ax.set_ylabel("world y (px, inverted)")
ax.grid(True, linewidth=0.3, alpha=0.3)
fig.tight_layout()
fig.savefig(r"C:\laragon\www\Azza-arch\audits\level-v7\v7-implemented-full-map.png", dpi=150)
print("done")

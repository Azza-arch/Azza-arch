"""Technical 2D topology diagrams for V6.2 (design-only, not concept art)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUT = "."

def ground(ax, x0, x1, y=1000, color="#6b6b6b", label=None):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 24, facecolor=color, edgecolor="black", linewidth=0.6, zorder=2))

def deck(ax, x0, x1, y, color="#3a7ca5", label=None):
    ax.add_patch(patches.Rectangle((x0, y), x1 - x0, 14, facecolor=color, edgecolor="black", linewidth=0.6, zorder=3))
    if label:
        ax.text((x0 + x1) / 2, y - 18, label, ha="center", va="top", fontsize=6.5, zorder=5)

def ladder(ax, x, y0, y1, color="#c08a1e"):
    ax.plot([x, x], [y0, y1], color=color, linewidth=3, zorder=4)

def jump_arc(ax, x0, y0, x1, y1, color="#2e7d32", dashed=True):
    import numpy as np
    xs = np.linspace(x0, x1, 30)
    t = np.linspace(0, 1, 30)
    peak = min(y0, y1) - 40
    ys = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * peak + t ** 2 * y1
    ax.plot(xs, ys, color=color, linewidth=1.2, linestyle="--" if dashed else "-", zorder=4)

def marker(ax, x, y, label, color="#b22222", shape="o"):
    ax.scatter([x], [y], s=70, facecolor=color, edgecolor="black", zorder=6, marker=shape)
    ax.text(x, y - 30, label, ha="center", va="top", fontsize=6.5, fontweight="bold", zorder=6)

def finalize(fig, ax, title, xlim, ylim, fname, figsize_note=""):
    ax.set_title(title, fontsize=11, fontweight="bold")
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.invert_yaxis()
    ax.set_xlabel("world x (px)")
    ax.set_ylabel("world y (px, inverted: lower value = higher up)")
    ax.grid(True, linewidth=0.3, alpha=0.4)
    ax.set_aspect("auto")
    fig.tight_layout()
    fig.savefig(f"{OUT}/{fname}", dpi=160)
    plt.close(fig)

# ---------------------------------------------------------------
# 1. Full Level 1 proposed topology overview
# ---------------------------------------------------------------
fig, ax = plt.subplots(figsize=(20, 5))

zones = [
    ("A", 0, 1100), ("B", 1100, 2200), ("C", 2200, 3100), ("D", 3100, 4300),
    ("E", 4300, 6150), ("F", 6150, 6800), ("G", 6800, 7400),
]
for name, x0, x1 in zones:
    ax.axvspan(x0, x1, color="#eef3f7" if zones.index((name, x0, x1)) % 2 == 0 else "#ffffff", zorder=0)
    ax.text((x0 + x1) / 2, 60, name, ha="center", fontsize=13, fontweight="bold", color="#555")

# Ground ranges (mandatory lower route / recovery street)
for x0, x1 in [(0, 420), (540, 3850), (4300, 5450), (5450, 5650), (6150, 7400)]:
    ground(ax, x0, x1)
ax.text(100, 1040, "ground / recovery street", fontsize=7, color="#444")

# FIRST_GAP
ax.add_patch(patches.Rectangle((420, 1000), 120, 24, facecolor="white", edgecolor="red", linestyle=":", linewidth=1, zorder=2))
marker(ax, 480, 1000, "FIRST_GAP", color="#888", shape="x")

# Zone B upper route (optional shortcut, B1)
deck(ax, 1250, 1370, 900, color="#3a7ca5", label="B1")
deck(ax, 1500, 1620, 900, color="#3a7ca5", label="B2")
deck(ax, 1750, 1870, 900, color="#3a7ca5", label="B3")
ladder(ax, 1280, 900, 1000)
ladder(ax, 1850, 900, 1000)
jump_arc(ax, 1370, 900, 1500, 900)
jump_arc(ax, 1620, 900, 1750, 900)
marker(ax, 1370, 975, "obstacle (B1, new)", color="#d4820a", shape="s")

# Zone C
deck(ax, 2700, 2880, 824, color="#8e6bbf", label="café roof")
ladder(ax, 2720, 824, 1000)
marker(ax, 2750, 1000, "CP1", color="#1b5e20", shape="^")

# Zone D
marker(ax, 3750, 1000, "M1", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((3850, 1000), 450, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))
ax.text(4075, 1040, "workshop-gate", ha="center", fontsize=6.5, color="#b22222")

# Zone E chain (mandatory, V6.2)
deck(ax, 4550, 4690, 960, label="E1")
deck(ax, 4800, 4960, 896, label="E2")
deck(ax, 4880, 5040, 800, label="E3")
deck(ax, 5200, 5350, 940, label="E4")
ladder(ax, 4900, 800, 896)
jump_arc(ax, 4450, 1000, 4550, 960)
jump_arc(ax, 4690, 960, 4800, 896)
jump_arc(ax, 5040, 800, 5200, 940)
jump_arc(ax, 5350, 940, 5450, 1000)
ax.add_patch(patches.Rectangle((5350, 780), 100, 220, facecolor="#555", edgecolor="black", zorder=3))
ax.text(5400, 770, "LIP (new, V6.2)", ha="center", fontsize=6.5, fontweight="bold")
marker(ax, 5570, 1000, "M2 (pocket)", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((5650, 1000), 500, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))
marker(ax, 6200, 1000, "CP2", color="#1b5e20", shape="^")

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

finalize(fig, ax, "Lorong Atas Bumbung — V6.2 Proposed Full-Level Topology (design-only)",
         (-100, 7500), (680, 1080), "level-v6.2-proposed-topology.png")

# ---------------------------------------------------------------
# 2. Zone B detail (B1 recommended)
# ---------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 5))
ground(ax, 900, 1950)
deck(ax, 1250, 1370, 900, label="awning-b1")
deck(ax, 1500, 1620, 900, label="awning-b2")
deck(ax, 1750, 1870, 900, label="awning-b3")
ladder(ax, 1280, 900, 1000)
ladder(ax, 1850, 900, 1000)
jump_arc(ax, 1370, 900, 1500, 900)
jump_arc(ax, 1620, 900, 1750, 900)
ax.add_patch(patches.Rectangle((1320, 976), 60, 24, facecolor="#d4820a", edgecolor="black", zorder=4))
ax.text(1350, 1030, "NEW: street obstacle\n(hop, no gap)", ha="center", fontsize=7, color="#8a4b00")
marker(ax, 1310, 870, "coin-b1", color="#f1c40f", shape="o")
marker(ax, 1810, 870, "coin-b2", color="#f1c40f", shape="o")
ax.annotate("ladder up\nx=1280", (1280, 950), fontsize=6.5, ha="center")
ax.annotate("ladder down\nx=1850", (1850, 950), fontsize=6.5, ha="center")
ax.annotate("130px / dy=0", ((1370+1500)/2, 890), fontsize=6.5, ha="center", color="#2e7d32")
ax.annotate("130px / dy=0", ((1620+1750)/2, 890), fontsize=6.5, ha="center", color="#2e7d32")
ax.text(1050, 1040, "lower street (unchanged, continuous)\n+1 new obstacle = genuine time cost", fontsize=7, color="#444")
finalize(fig, ax, "Zone B — Lorong Pekan: B1 Rooftop Shortcut (recommended)",
         (870, 1980), (770, 1080), "level-v6.2-zone-b-detail.png")

# ---------------------------------------------------------------
# 3. Zone E detail (E2 recommended)
# ---------------------------------------------------------------
fig, ax = plt.subplots(figsize=(13, 5.5))
ground(ax, 4300, 5450, label="recovery street")
ground(ax, 5450, 5650, color="#a3c9a8", label="terminal pocket")
deck(ax, 4550, 4690, 960, label="roof-e1\n(rise 40)")
deck(ax, 4800, 4960, 896, label="roof-e2\n(rise 64)")
deck(ax, 4880, 5040, 800, label="roof-e3\n(ladder rise 96)")
deck(ax, 5200, 5350, 940, label="roof-e4\n(drop 140)")
ladder(ax, 4900, 800, 896)
jump_arc(ax, 4450, 1000, 4550, 960)
jump_arc(ax, 4690, 960, 4800, 896)
jump_arc(ax, 5040, 800, 5200, 940)
jump_arc(ax, 5350, 940, 5450, 1000)
ax.add_patch(patches.Rectangle((5350, 780), 100, 220, facecolor="#555", edgecolor="black", zorder=3))
ax.text(5400, 770, "LIP (new)\n~200px tall\n(> 96.6px max jump rise)", ha="center", fontsize=6.5, fontweight="bold")
marker(ax, 5570, 1000, "M2 terminal\n(feet=1000, unchanged)", color="#b22222", shape="D")
ax.add_patch(patches.Rectangle((5650, 1000), 500, 24, facecolor="white", edgecolor="#b22222", linestyle=":", linewidth=1, zorder=2))
ax.text(5900, 1040, "rooftop-gate\n(opens on solve)", ha="center", fontsize=7, color="#b22222")
marker(ax, 4850, 870, "coin-e1", color="#f1c40f", shape="o")
marker(ax, 5280, 910, "coin-e2", color="#f1c40f", shape="o")
ax.annotate("street walk CANNOT reach\nthe pocket (blocked by lip)", (4900, 1040), fontsize=7, color="#b22222", ha="center")
ax.annotate("only the chain's final\njump clears the lip from above", (5400, 870), fontsize=7, color="#2e7d32", ha="center")
finalize(fig, ax, "Zone E — Deretan Bumbung: E2 Rooftop-to-Terminal Access (recommended)",
         (4250, 5750), (750, 1080), "level-v6.2-zone-e-detail.png")

print("done")

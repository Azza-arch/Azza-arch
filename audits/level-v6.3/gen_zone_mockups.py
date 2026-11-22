"""Seven schematic greybox composition mockups, one per zone. Technical
diagrams only — labeled boxes standing in for proposed asset placement,
not generated artwork."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

zones = [
    ("A · Taman Perumahan", [
        ("bg", "bg_house_row (bg)", 0.05, 0.62, 0.9, 0.18),
        ("mg", "house_1_full", 0.08, 0.42, 0.22, 0.22),
        ("mg", "house_2_full", 0.42, 0.42, 0.22, 0.22),
        ("fg", "ground + FIRST_GAP", 0.0, 0.08, 1.0, 0.1),
        ("prop", "flag_malaysia", 0.72, 0.3, 0.06, 0.1),
    ]),
    ("B · Lorong Pekan", [
        ("bg", "bg_house_row (bg, cont.)", 0.05, 0.62, 0.9, 0.18),
        ("mg", "h3_roof_hut", 0.18, 0.38, 0.18, 0.16),
        ("mg", "h3_roof_hut", 0.5, 0.3, 0.18, 0.16),
        ("fg", "awning-b1 (y900)", 0.15, 0.46, 0.12, 0.06),
        ("fg", "awning-b2 (y960)", 0.46, 0.38, 0.15, 0.06),
        ("fg", "ground", 0.0, 0.08, 1.0, 0.1),
        ("prop", "lamp_wall", 0.05, 0.2, 0.05, 0.14),
    ]),
    ("C · Café Atas Angin", [
        ("bg", "house_3_full (bg)", 0.3, 0.3, 0.4, 0.4),
        ("mg", "h1_roof_porch (canopy)", 0.32, 0.46, 0.36, 0.1),
        ("fg", "cafe-roof + checkpoint", 0.35, 0.56, 0.3, 0.06),
        ("fg", "ground", 0.0, 0.08, 1.0, 0.1),
        ("prop", "plant_pot_tall x2", 0.42, 0.18, 0.16, 0.12),
    ]),
    ("D · Bengkel Fungsi", [
        ("mg", "h3_wall_lower + door_grille", 0.35, 0.2, 0.3, 0.42),
        ("interact", "M1 (function_machine)", 0.4, 0.3, 0.2, 0.2),
        ("fg", "workshop-gate", 0.68, 0.08, 0.14, 0.44),
        ("fg", "ground", 0.0, 0.08, 1.0, 0.1),
    ]),
    ("E · Deretan Bumbung", [
        ("bg", "bg_hills (far)", 0.05, 0.6, 0.9, 0.16),
        ("mg", "roof-mass: h3_roof_hut xN + h3_parapet", 0.05, 0.32, 0.9, 0.2),
        ("fg", "roof-e1", 0.1, 0.42, 0.12, 0.05),
        ("fg", "roof-e2", 0.28, 0.36, 0.12, 0.05),
        ("fg", "roof-e3", 0.42, 0.26, 0.12, 0.05),
        ("interact", "M2", 0.47, 0.18, 0.08, 0.08),
        ("fg", "roof-e4", 0.62, 0.38, 0.12, 0.05),
        ("fg", "ground (recovery street)", 0.0, 0.08, 1.0, 0.1),
        ("prop", "water_tank_stand", 0.75, 0.34, 0.08, 0.14),
    ]),
    ("F · Bukit Tanjung & Gua", [
        ("bg", "bg_hills (near)", 0.05, 0.55, 0.9, 0.18),
        ("fg", "gua-alcove (ledge)", 0.12, 0.42, 0.16, 0.06),
        ("fg", "hill-plateau (rising ground)", 0.35, 0.3, 0.6, 0.18),
        ("prop", "plant_bush x2", 0.55, 0.22, 0.14, 0.08),
    ]),
    ("G · Jambatan & Destinasi", [
        ("fg", "riverbank L", 0.0, 0.08, 0.35, 0.1),
        ("fg", "final-gate / bridge", 0.35, 0.08, 0.3, 0.1),
        ("fg", "riverbank R", 0.65, 0.08, 0.35, 0.1),
        ("interact", "M3", 0.2, 0.2, 0.08, 0.08),
        ("goal", "GOAL flag", 0.82, 0.14, 0.05, 0.22),
    ]),
]

colors = {"bg": "#dcdcd6", "mg": "#b9bcb2", "fg": "#4b4e47", "interact": "#8a1a1a", "prop": "#7a8a73", "goal": "#c9a227"}
labelcolor = {"bg": "#777", "mg": "#555", "fg": "white", "interact": "white", "prop": "white", "goal": "black"}

fig, axes = plt.subplots(4, 2, figsize=(14, 18))
axes = axes.flatten()
for ax, (title, elements) in zip(axes, zones):
    ax.set_facecolor("#f7f7f4")
    for kind, label, x, y, w, h in elements:
        ax.add_patch(patches.Rectangle((x, y), w, h, facecolor=colors[kind], edgecolor="black",
                                        linewidth=0.8, linestyle="--" if kind in ("bg", "mg", "prop") else "-"))
        ax.text(x + w / 2, y + h / 2, label, ha="center", va="center", fontsize=6.5,
                color=labelcolor[kind], wrap=True)
    ax.set_title(title, fontsize=11, fontweight="bold")
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_color("#ccc")

axes[-1].axis("off")
legend_elements = [patches.Patch(facecolor=colors[k], edgecolor="black",
                   linestyle="--" if k in ("bg", "mg", "prop") else "-", label=l)
                   for k, l in [("bg", "Layer 1: Background (proposed)"), ("mg", "Layer 2: Midground (proposed)"),
                                ("fg", "Layer 3: Gameplay terrain (existing)"),
                                ("interact", "Layer 4: Interactive (existing position)"),
                                ("prop", "Layer 2: Props (proposed)"), ("goal", "Goal marker (existing)")]]
axes[-1].legend(handles=legend_elements, loc="center", fontsize=9, frameon=False)

fig.suptitle("Lorong Atas Bumbung — V6.3 Zone Composition Mockups (schematic greybox diagrams, not generated artwork)", fontsize=13, fontweight="bold")
fig.tight_layout(rect=[0, 0, 1, 0.97])
fig.savefig(r"C:\laragon\www\Azza-arch\audits\level-v6.3\level-v6.3-zone-mockups.png", dpi=150)
print("done")

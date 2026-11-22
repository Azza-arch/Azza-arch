from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\laragon\www\Azza-arch"
REF = ROOT + r"\app\addmath\rooftop\docs\level-reference\v7-master-map.png"
IMPL = ROOT + r"\audits\level-v7\v7-implemented-full-map.png"
OUT = ROOT + r"\audits\level-v7\v7-reference-comparison.png"

def font(sz, bold=False):
    try:
        return ImageFont.truetype("arialbd.ttf" if bold else "arial.ttf", sz)
    except Exception:
        return ImageFont.load_default()

ref = Image.open(REF).convert("RGB")
impl = Image.open(IMPL).convert("RGB")
w = 1700
ref_r = ref.resize((w, int(ref.height * w / ref.width)))
impl_r = impl.resize((w, int(impl.height * w / impl.width)))

pad, gap, head = 40, 30, 110
total_h = head + ref_r.height + gap + 30 + impl_r.height + pad
canvas = Image.new("RGB", (w + pad * 2, total_h), (255, 255, 255))
d = ImageDraw.Draw(canvas)
d.text((pad, 15), "Lorong Atas Bumbung — V7 Reference vs. Implementation", fill="black", font=font(28, True))
d.text((pad, 55), "Top: docs/level-reference/v7-master-map.png (user-approved reference)  ·  Bottom: rendered from the live src/level.js constants", fill="#444", font=font(15))
canvas.paste(ref_r, (pad, head))
d.text((pad, head + ref_r.height + 6), "REFERENCE (topology authority: zone order, relative tiers, M1/M2/M3 and checkpoint placement, main route A→G)", fill="#333", font=font(14, True))
canvas.paste(impl_r, (pad, head + ref_r.height + gap + 30))
canvas.save(OUT)
print("saved", canvas.size)

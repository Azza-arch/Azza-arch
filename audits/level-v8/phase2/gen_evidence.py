from PIL import Image, ImageDraw, ImageFont

SRC = r"C:\laragon\www\Azza-arch\app\addmath\rooftop\tests\artifacts\phase2"
OUT = r"C:\laragon\www\Azza-arch\audits\level-v8\phase2\phase2-jump-sequence.png"

def font(sz, bold=False):
    try:
        return ImageFont.truetype("arialbd.ttf" if bold else "arial.ttf", sz)
    except Exception:
        return ImageFont.load_default()

frames = ["jump-00-jump.png", "jump-01-jump.png", "jump-02-fall.png", "jump-03-fall.png", "jump-04-idle.png", "jump-05-idle.png"]
labels = ["takeoff (stretch)", "rising (jump)", "apex->fall", "falling", "landed (squash)", "recovered"]
thumbs = [Image.open(f"{SRC}\\{f}").convert("RGB") for f in frames]
w, h = thumbs[0].size
cols = 3
rows = 2
pad = 20
cell_w, cell_h = w + pad, h + 50
canvas = Image.new("RGB", (cell_w * cols + pad, cell_h * rows + 60), (255, 255, 255))
d = ImageDraw.Draw(canvas)
d.text((pad, 10), "Lorong Atas Bumbung — V8 Phase 2: Jump Sequence (real browser frames, 45ms apart, fixed build)", fill="black", font=font(16, True))
for i, (im, label) in enumerate(zip(thumbs, labels)):
    cx = pad + (i % cols) * cell_w
    cy = 50 + (i // cols) * cell_h
    canvas.paste(im, (cx, cy + 20))
    d.text((cx, cy), f"{i}: {label}", fill="#222", font=font(13, True))
canvas.save(OUT)
print("saved", canvas.size)

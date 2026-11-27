"""tools/rallyx-fit.py: places the player photo inside the Rally X window so that his face and his paddle both show
through the brush-stroke X (client, 27 Nov 2026: "ensure the paddle and face is visible on the X").
The X (src/data/rallyx-x.json, traced by tools/rallyx-x.py) is drawn as a mask and shrunk by the inner shadow's width,
so "visible" means clear of the shadow. The photo is portrait and the paddle sits at its far left, so no placement that
covers the whole X shows both; the sharp photo is therefore placed freely (its edges feathered by the page), over the
same photo blurred to fill the rest of the X. Every scale and position is scored by how much of the face and of the
paddle land inside the mask, at the top, middle and bottom of the small scroll pan, then by how much of the X the
sharp photo fills. The best is written back into rallyx-x.json under "fit"; a check image goes to
audit/rallyx-fit-preview.png.
Run: python3 -I tools/rallyx-fit.py [--pan=6] [--shadow=5]"""
import json, os, re, sys
import numpy as np, cv2
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src/data/rallyx-x.json")
PHOTO = os.path.join(ROOT, "refs/rallyx/rx-1.png")    # rallyx-forehand
PREVIEW = os.path.join(ROOT, "audit/rallyx-fit-preview.png")
ARGS = dict(a.lstrip("-").split("=", 1) for a in sys.argv[1:] if "=" in a)
PAN = int(ARGS.get("pan", 6))         # the scroll pan moves the photo by this much (viewBox units); the fit must hold across it
SHADOW = int(ARGS.get("shadow", 5))   # inner shadow width to keep clear of (viewBox units)
FEATHER = 14                          # the sharp photo fades out over this width at its edges (viewBox units)
# the features, as fractions of the photo (read off a 10% grid laid over rx-1.png)
FACE = (0.345, 0.255, 0.445, 0.335)
PADDLE = (0.01, 0.475, 0.13, 0.55)    # the paddle head and its edge, which make it read as a paddle

x = json.load(open(DATA))
w, h = int(round(x["w"])), int(round(x["h"]))
polys = []
for sub in re.findall(r"M([^M]+)", x["d"]):
    pts = np.array([[float(v) for v in p.split()] for p in sub.rstrip("Z").split("L")], np.float32)
    polys.append(np.round(pts).astype(np.int32))
mask = np.zeros((h + 1, w + 1), np.uint8)
cv2.fillPoly(mask, polys, 1)  # alternating fill: the dry-brush holes stay open
inner = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * SHADOW + 1, 2 * SHADOW + 1)))
sat_in = np.pad(inner.astype(np.int64).cumsum(0).cumsum(1), ((1, 0), (1, 0)))   # summed-area tables
sat_x = np.pad(mask.astype(np.int64).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
x_area = float(mask.sum())

pw, ph = Image.open(PHOTO).size
ratio = ph / pw

def box_sum(sat, x0, y0, x1, y1):
    x0 = np.clip(np.round(x0), 0, w + 1).astype(int); x1 = np.clip(np.round(x1), 0, w + 1).astype(int)
    y0 = np.clip(np.round(y0), 0, h + 1).astype(int); y1 = np.clip(np.round(y1), 0, h + 1).astype(int)
    return sat[y1, x1] - sat[y0, x1] - sat[y1, x0] + sat[y0, x0]

def cover(X0, Y0, W, box):
    """share of a feature box (photo fractions) that lands inside the shrunk X"""
    H = W * ratio
    area = (box[2] - box[0]) * W * (box[3] - box[1]) * H
    return box_sum(sat_in, X0 + box[0] * W, Y0 + box[1] * H, X0 + box[2] * W, Y0 + box[3] * H) / area

best = None
for W in range(240, 760, 4):
    H = W * ratio
    X0, Y0 = np.meshgrid(np.arange(-W * 0.6, w - W * 0.4, 2.0), np.arange(-H * 0.7, h - H * 0.3, 2.0))
    face = np.minimum.reduce([cover(X0, Y0 + p, W, FACE) for p in (-PAN, 0, PAN)])
    paddle = np.minimum.reduce([cover(X0, Y0 + p, W, PADDLE) for p in (-PAN, 0, PAN)])
    fill = box_sum(sat_x, X0 + FEATHER, Y0 + FEATHER, X0 + W - FEATHER, Y0 + H - FEATHER) / x_area  # X filled by the sharp photo
    score = 3 * np.minimum(face, paddle) + face + paddle + 0.6 * fill
    i = np.unravel_index(np.argmax(score), score.shape)
    if best is None or score[i] > best[0]:
        best = (float(score[i]), W, float(X0[i]), float(Y0[i]), float(face[i]), float(paddle[i]), float(fill[i]))

_, W, X0, Y0, fc, pc, fl = best
H = W * ratio
# the blurred backdrop covers the whole X, centred on the sharp photo's centre so the scene carries on behind it
s = max((w + 2 * PAN) / W, (h + 2 * PAN) / H, 1.0)
BW, BH = W * s, H * s
BX = min(0.0, max(w - BW, X0 + W / 2 - BW / 2)); BY = min(-PAN, max(h + PAN - BH, Y0 + H / 2 - BH / 2))
x["fit"] = {"photo": "rallyx-forehand", "x": round(X0, 1), "y": round(Y0, 1), "width": W, "height": round(H, 1),
            "back": {"x": round(BX, 1), "y": round(BY, 1), "width": round(BW, 1), "height": round(BH, 1)},
            "feather": FEATHER, "pan": PAN, "face_inside": round(fc, 3), "paddle_inside": round(pc, 3), "x_filled_sharp": round(fl, 3)}
json.dump(x, open(DATA, "w"), indent=1)

# check image: blurred backdrop, feathered sharp photo, seen through the X (shadow margin darker), feature boxes outlined
S = 2
src = Image.open(PHOTO).convert("RGB")
canvas = Image.new("RGB", ((w + 1) * S, (h + 1) * S), (5, 5, 5))
back = src.resize((int(BW * S), int(BH * S)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6 * S))
back = Image.eval(back, lambda v: int(v * .85))
canvas.paste(back, (int(BX * S), int(BY * S)))
sharp = src.resize((int(W * S), int(H * S)), Image.LANCZOS)
fe = Image.new("L", sharp.size, 0)
fe.paste(255, (FEATHER * S, FEATHER * S, sharp.size[0] - FEATHER * S, sharp.size[1] - FEATHER * S))
fe = fe.filter(ImageFilter.GaussianBlur(FEATHER * S / 2))
canvas.paste(sharp, (int(X0 * S), int(Y0 * S)), fe)
out = np.array(canvas)
m = cv2.resize(mask, (out.shape[1], out.shape[0]), interpolation=cv2.INTER_NEAREST)[..., None]
mi = cv2.resize(inner, (out.shape[1], out.shape[0]), interpolation=cv2.INTER_NEAREST)[..., None]
out = out * mi + (out * 0.45).astype(np.uint8) * (m - mi)
for box, col in ((FACE, (255, 60, 60)), (PADDLE, (60, 160, 255))):
    p0 = (int((X0 + box[0] * W) * S), int((Y0 + box[1] * H) * S)); p1 = (int((X0 + box[2] * W) * S), int((Y0 + box[3] * H) * S))
    cv2.rectangle(out, p0, p1, col, 2)
os.makedirs(os.path.dirname(PREVIEW), exist_ok=True)
Image.fromarray(out.astype(np.uint8)).save(PREVIEW)
print(f"fit: sharp photo {W} wide at ({X0:.0f}, {Y0:.0f}); face {fc:.0%}, paddle {pc:.0%} inside the X clear of the shadow "
      f"across a +-{PAN} pan; it fills {fl:.0%} of the X, the blurred backdrop the rest")

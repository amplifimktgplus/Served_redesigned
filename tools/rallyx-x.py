"""tools/rallyx-x.py: traces the brush-stroke X of the Rally X logo, as printed on the venue's banner in the client's
photo refs/rallyx/rx-3.png (supplied 26 Nov 2026), into a vector outline for the home page's Rally X window, where a
photo shows through the X (client, 27 Nov 2026: "the X window should look like the X from this logo").
Lime pixels are picked by hue inside a crop around the X, so the white "Rally" and the black banner drop out and the
banner's other lime streaks stay outside. Dry-brush gaps inside the strokes are kept as holes (even-odd fill).
Also samples the logo's lime at the bright top-right of the X and the deeper green at its foot.
Writes src/data/rallyx-x.json, and a check image at audit/rallyx-x-preview.png.
Run: python3 -I tools/rallyx-x.py"""
import json, os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "refs/rallyx/rx-3.png")
OUT = os.path.join(ROOT, "src/data/rallyx-x.json")
PREVIEW = os.path.join(ROOT, "audit/rallyx-x-preview.png")
CROP = (500, 150, 995, 470)  # x0, y0, x1, y1 around the X in rx-3.png
K = 4                        # trace at 4x so edges land between pixels
MIN_SPECK = 6                # specks smaller than this many source pixels are dropped as noise
MIN_HOLE = 25                # dry-brush holes smaller than this (source px^2) are filled, so the photo reads through
                             # the X (client, 27 Nov 2026: "large enough to see what's inside"); the long streaks stay

rgb = np.array(Image.open(SRC).convert("RGB").crop(CROP))
hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)  # OpenCV hue runs 0-179
hue, sat, val = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
lime = ((hue >= 25) & (hue <= 85) & (sat >= 90) & (val >= 55)).astype(np.uint8) * 255
# the banner's thin lime frame lines start where the X's lower-right arm ends: an opening wider than those lines
# (about 3 px) but far narrower than the brush arm (about 40 px) removes them, in that corner only
fx, fy = 880 - CROP[0], 418 - CROP[1]
lime[fy:, fx:] = cv2.morphologyEx(lime[fy:, fx:], cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))

# drop single-pixel noise, keep the bristle specks that belong to the brush look
n, lab, stats, _ = cv2.connectedComponentsWithStats(lime, 8)
keep = np.zeros_like(lime)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] >= MIN_SPECK:
        keep[lab == i] = 255

h0, w0 = keep.shape
big = cv2.resize(keep, (w0 * K, h0 * K), interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), K * 0.45)
mask = (big >= 128).astype(np.uint8) * 255
contours, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
hier = hier[0]
ys, xs = np.nonzero(mask)
X0, Y0 = xs.min() / K, ys.min() / K
W, H = (xs.max() + 1) / K - X0, (ys.max() + 1) / K - Y0

def path(c):
    pts = cv2.approxPolyDP(c, 0.8, True).reshape(-1, 2) / K - (X0, Y0)
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"

d, outer, holes = "", 0, 0
for i, c in enumerate(contours):
    a = cv2.contourArea(c) / K / K
    if a < 2 or (hier[i][3] != -1 and a < MIN_HOLE):
        continue
    d += path(c)
    if hier[i][3] == -1:
        outer += 1
    else:
        holes += 1

# the logo's colours: the bright lime of the top-right arm and the deeper green at the foot of the X
on = keep > 0
yy, xx = np.nonzero(on)
def tone(sel):
    px = rgb[yy[sel], xx[sel]]
    lum = px.sum(axis=1)
    px = px[lum >= np.percentile(lum, 75)]  # the lit pixels, not the leaf shadows across the banner
    return "#%02x%02x%02x" % tuple(int(v) for v in np.median(px, axis=0))
top_right = (xx > w0 * 0.62) & (yy < h0 * 0.35)
foot = (yy > h0 * 0.7)
colors = {"light": tone(top_right), "deep": tone(foot)}

data = {"source": "refs/rallyx/rx-3.png", "crop": list(CROP), "w": round(W, 1), "h": round(H, 1), "d": d, "colors": colors}
json.dump(data, open(OUT, "w"), indent=1)

# check image: the traced outline filled lime on black, beside the source crop
prev = np.zeros((h0 * 2, w0, 3), np.uint8)
prev[:h0] = rgb
fill = np.zeros((h0 * K, w0 * K), np.uint8)
cv2.drawContours(fill, contours, -1, 255, thickness=cv2.FILLED, hierarchy=hier[np.newaxis], maxLevel=2)
small = cv2.resize(fill, (w0, h0), interpolation=cv2.INTER_AREA)
prev[h0:, :, 1] = small
prev[h0:, :, 0] = (small * 0.75).astype(np.uint8)
os.makedirs(os.path.dirname(PREVIEW), exist_ok=True)
Image.fromarray(prev).save(PREVIEW)
print(f"traced X: {outer} shapes, {holes} holes, {W:.0f} x {H:.0f} px from the photo, path {len(d)} chars; colours {colors}")

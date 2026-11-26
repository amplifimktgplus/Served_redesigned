"""tools/logo.py: traces the official Served. logo (refs/client/served-logo.png, black on transparent,
supplied 27 Nov 2026) into vector outlines, split into its three separate shapes: the S, the joined
letters "erved" and the full stop. The build recolours the logo, animates the full stop on its own and
cuts the favicon from the S, without redrawing any of it. Writes src/data/logo.json.
Run: python3 -I tools/logo.py"""
import json, os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "refs/client/served-logo.png")
OUT = os.path.join(ROOT, "src/data/logo.json")
K = 4  # trace at 4x the source so edges land between pixels

alpha = Image.open(SRC).convert("RGBA").getchannel("A")
w0, h0 = alpha.size
big = alpha.resize((w0 * K, h0 * K), Image.LANCZOS)
mask = (np.array(big) >= 128).astype(np.uint8) * 255
contours, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
hier = hier[0]
ys, xs = np.nonzero(mask)
X0, Y0 = xs.min() / K, ys.min() / K
W, H = (xs.max() + 1) / K - X0, (ys.max() + 1) / K - Y0

def path(c):
    pts = cv2.approxPolyDP(c, 0.7, True).reshape(-1, 2) / K - (X0, Y0)
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"

def box(c):
    x, y, w, h = cv2.boundingRect(c)
    return [x / K - X0, y / K - Y0, w / K, h / K]

shapes = []
for i, c in enumerate(contours):
    if hier[i][3] != -1:
        continue  # holes are added to their parent below
    d = path(c)
    j = hier[i][2]
    while j != -1:  # children of this outer contour: the counters of e, e and d
        d += path(contours[j])
        j = hier[j][0]
    shapes.append({"box": box(c), "area": cv2.contourArea(c) / K / K, "d": d})

shapes.sort(key=lambda s: s["box"][0])
s_shape = shapes[0]                                     # leftmost: the S
dot = max(shapes, key=lambda s: s["box"][0])            # rightmost: the full stop
letters = [s for s in shapes if s is not s_shape and s is not dot]
assert dot["area"] < s_shape["area"], "the full stop should be the small rightmost shape"
erved_bottom = max(s["box"][1] + s["box"][3] for s in letters)
data = {
    "source": "refs/client/served-logo.png", "w": round(W, 1), "h": round(H, 1),
    "s": {"d": s_shape["d"], "box": [round(v, 1) for v in s_shape["box"]]},
    "letters": "".join(s["d"] for s in letters),
    "dot": {"d": dot["d"], "box": [round(v, 1) for v in dot["box"]]},
    "baseline": round(erved_bottom, 1),
}
json.dump(data, open(OUT, "w"), indent=1)
print("shapes", len(shapes), "letters", len(letters), "size", data["w"], "x", data["h"], "baseline", data["baseline"],
      "S", data["s"]["box"], "dot", data["dot"]["box"], "bytes", len(json.dumps(data)))

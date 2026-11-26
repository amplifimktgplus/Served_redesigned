"""tools/images.py: right-sizes every image the build uses into src/assets/img/ as WebP.
Sources: refs/rallyx (client-supplied Rally X photos), assets/live (captured from the staging site),
refs/commons/full (Wikimedia Commons, credits in refs/commons/credits.json).
Run: python3 -I tools/images.py"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/assets/img")
os.makedirs(OUT, exist_ok=True)

RALLY = {1: "rallyx-forehand", 2: "rallyx-backhand-net", 3: "rallyx-paddle-ball", 4: "rallyx-target-net",
         5: "rallyx-tennis-player", 6: "rallyx-paddle-wall", 7: "rallyx-paddle-wall-tall", 8: "rallyx-court-logo",
         9: "rallyx-now-open", 10: "rallyx-ready-position", 11: "rallyx-facade", 12: "rallyx-paddles-court"}
LIVE = {"hero-court": "live-hero-court", "cta-court": "live-cta-court", "venue-pickleball": "live-pickleball",
        "venue-tennis": "live-tennis", "venue-badminton": "live-badminton"}

jobs = []
for i, n in RALLY.items():
    jobs.append((os.path.join(ROOT, f"refs/rallyx/rx-{i}.png"), n))
for s, n in LIVE.items():
    jobs.append((os.path.join(ROOT, f"assets/live/{s}.jpg"), n))
# client-supplied hero art (orange duotone, vertical wordmark), 26 Nov 2026
jobs.append((os.path.join(ROOT, "refs/client/hero-run.png"), "hero-run"))
# sport card photos supplied by the user, 26 Nov 2026
jobs.append((os.path.join(ROOT, "refs/client/card-tennis.png"), "card-tennis"))
jobs.append((os.path.join(ROOT, "refs/client/card-badminton.png"), "card-badminton"))
for c in json.load(open(os.path.join(ROOT, "refs/commons/credits.json"))):
    jobs.append((os.path.join(ROOT, f"refs/commons/full/{c['file']}.jpg"), c["file"]))

manifest = {}
for src, name in jobs:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size
    # file names carry the ACTUAL width, so srcset w-descriptors are true
    sizes = sorted(set(min(t, w) for t in (1600, 1000, 600)))
    for s in sizes:
        r = im if s >= w else im.resize((s, round(h * s / w)), Image.LANCZOS)
        r.save(os.path.join(OUT, f"{name}-{s}.webp"), "WEBP", quality=78 if s > 600 else 74, method=6)
    manifest[name] = {"w": w, "h": h, "sizes": sizes}
    print(name, w, h, sizes)

# brand wordmark (kept as supplied) + social card
wm = Image.open(os.path.join(ROOT, "assets/live/served-wordmark.png"))
wm.save(os.path.join(OUT, "served-wordmark.png"))
og = ImageOps.fit(ImageOps.exif_transpose(Image.open(os.path.join(ROOT, "refs/rallyx/rx-1.png"))).convert("RGB"), (1200, 630), Image.LANCZOS, centering=(0.5, 0.45))
og.save(os.path.join(OUT, "og-served.jpg"), "JPEG", quality=82, optimize=True)
json.dump(manifest, open(os.path.join(ROOT, "src/data/images.json"), "w"), indent=1)
print("images:", len(manifest))

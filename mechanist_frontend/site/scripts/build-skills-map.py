#!/usr/bin/env python3
"""Prepare the Mechanism Methods tools map for the homepage.

The source (`mechanist-skills-tools-map.png`, exported from tools.pdf) is a flat
plate: the taxonomy sits on an opaque #e5e4e5 rectangle. Placed on the page that
rectangle is a second background behind the section's own, so any crop, mask or
tone change on the section shows up as an edge. Two passes fix that:

  1. background → transparent. Flood-filled from the border, so only the outer
     field and the gaps that connect to it are cleared; the near-white fills
     inside the briefcases are content and stay. The image is then trimmed to
     its ink and given uniform breathing room, so the figure's own margins no
     longer decide where it sits on the page — CSS does.

  2. a light tone pass. The export is a slide graphic: pure-black strokes and
     pastels a good deal more saturated than anything else on this site. The
     strokes are pulled to the site's ink and the fills desaturated a little,
     which is enough to stop the block reading as a foreign object. This is
     deliberately mild — the colours are category labels, not data, but they are
     still the paper's own and should stay recognisable.

Usage: python3 scripts/build-skills-map.py
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

FIG = Path(__file__).resolve().parent.parent / "public" / "figures"
SRC = FIG / "mechanist-skills-tools-map.png"
DEST = FIG / "mechanism-skills-map.png"

BG_TOLERANCE = 10      # channel distance from the corner colour still counted as field
PAD = 24               # transparent margin kept around the trimmed ink, in source pixels
INK = np.array([29, 39, 42], dtype=float)   # --text
INK_MIX = 0.55         # how far the black strokes move towards --text
SATURATION = 0.86      # pastel fills, relative to the export

# Where the export's own field colour is sent. This is the mid stop of the
# section gradient in HowItWorks.css (.section.skills-foundation) — the two are
# a pair. The field itself ends up transparent, but every anti-aliased edge on
# the cut-out is part field, so if the two tones disagree the whole diagram
# picks up a cool fringe. Light pixels move with it and dark strokes do not,
# which also carries the near-white card fills into the same warm family.
FIELD_TARGET = np.array([234, 230, 221], dtype=float)   # #eae6dd
LIGHT_LO, LIGHT_HI = 140.0, 205.0   # luminance band over which the shift ramps in


def background_mask(rgb: np.ndarray) -> np.ndarray:
    """Field pixels reachable from the border without crossing ink."""
    bg = rgb[0, 0].astype(int)
    flat = np.abs(rgb.astype(int) - bg).max(axis=2) <= BG_TOLERANCE
    h, w = flat.shape
    seen = np.zeros((h, w), dtype=bool)
    queue = deque()

    for y in range(h):
        for x in (0, w - 1):
            if flat[y, x] and not seen[y, x]:
                seen[y, x] = True
                queue.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if flat[y, x] and not seen[y, x]:
                seen[y, x] = True
                queue.append((y, x))

    # Scanline flood: fill each run horizontally, then push the rows either side.
    while queue:
        y, x = queue.popleft()
        left = x
        while left > 0 and flat[y, left - 1] and not seen[y, left - 1]:
            left -= 1
            seen[y, left] = True
        right = x
        while right < w - 1 and flat[y, right + 1] and not seen[y, right + 1]:
            right += 1
            seen[y, right] = True
        for ny in (y - 1, y + 1):
            if 0 <= ny < h:
                for nx in range(left, right + 1):
                    if flat[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((ny, nx))
    return seen


LUMA = np.array([0.2126, 0.7152, 0.0722])


def _tone_no_shift(c: np.ndarray) -> np.ndarray:
    """Ink and chroma passes, on float RGB of any shape ending in 3."""
    lum = c @ LUMA

    # Strokes: the export draws them at near-black, which is heavier than any
    # rule on the site. Mix towards --text rather than lightening them, so the
    # line weight is untouched and only the colour of the ink changes.
    dark = np.clip((70.0 - lum) / 70.0, 0.0, 1.0)[..., None]
    c = c * (1 - dark * INK_MIX) + INK * (dark * INK_MIX)

    # Fills: pull the chroma in towards the muted range the rest of the page
    # works in, without touching which hue each family reads as.
    lum = (c @ LUMA)[..., None]
    return lum + (c - lum) * SATURATION


def tone(rgb: np.ndarray, field: np.ndarray) -> np.ndarray:
    c = _tone_no_shift(rgb.astype(float))

    # Everything light moves by whatever it takes to land the export's field on
    # FIELD_TARGET; strokes and saturated chips stay where they are.
    shift = FIELD_TARGET - _tone_no_shift(field.astype(float))
    lum = (c @ LUMA)[..., None]
    w = np.clip((lum - LIGHT_LO) / (LIGHT_HI - LIGHT_LO), 0.0, 1.0)
    c = c + shift * w
    return np.clip(c, 0, 255).astype(np.uint8)


def main() -> int:
    rgb = np.asarray(Image.open(SRC).convert("RGB"))
    field = background_mask(rgb)

    alpha = np.where(field, 0, 255).astype(np.uint8)
    out = np.dstack([tone(rgb, rgb[0, 0]), alpha])

    ys, xs = np.where(alpha > 0)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD + 1, alpha.shape[0])
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD + 1, alpha.shape[1])
    cropped = out[y0:y1, x0:x1]

    Image.fromarray(cropped, "RGBA").save(DEST, optimize=True)
    h, w = cropped.shape[:2]
    print(f"{DEST.relative_to(FIG.parent.parent)}  {w}x{h}  "
          f"{DEST.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

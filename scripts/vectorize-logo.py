"""
Turns assets/LOGO.jpeg into a two-tone vector brand mark:

  assets/LOGO.jpeg  ->  public/assets/brand-logo.svg  (full logo, compact trace)
                    ->  public/assets/brand-mark.svg  (square nav mark, from the same trace)

The artwork sits on a solid black field, so only the ink matters. The trace keeps
the dominant flat planes plus outlines, which is what reads at 24-96px in a header;
fine texture (ball fuzz, wood grain) is dropped on purpose so the file stays small
and the shape stays crisp at any zoom.

Run:  python scripts/vectorize-logo.py
"""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "LOGO.jpeg"
LOGO_OUT = ROOT / "public" / "assets" / "brand-logo.svg"
MARK_OUT = ROOT / "public" / "assets" / "brand-mark.svg"

WORK_W = 720
ALPHA_FLOOR = 45
MIN_REGION_PX = 120
DETAIL = 1.2
COLORS = 12
MIN_LAYER_PX = 900


def load_rgba() -> np.ndarray:
    im = Image.open(SRC).convert("RGB")
    width, height = im.size
    resized = im.resize((WORK_W, round(height * WORK_W / width)), Image.LANCZOS)
    rgb = np.asarray(resized).astype(np.float32)

    distance = rgb.max(axis=2)
    alpha = np.clip((distance - 14.0) / 22.0, 0.0, 1.0)
    alpha = ndimage.binary_opening(alpha > 0.4, np.ones((2, 2))).astype(np.float32)
    alpha = np.clip((ndimage.gaussian_filter(alpha, 0.6) - 0.18) / 0.64, 0.0, 1.0)

    rgba = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    ys, xs = np.nonzero(rgba[..., 3] > ALPHA_FLOOR)
    pad = 2
    x0, x1 = max(int(xs.min()) - pad, 0), min(int(xs.max()) + pad + 1, rgba.shape[1])
    y0, y1 = max(int(ys.min()) - pad, 0), min(int(ys.max()) + pad + 1, rgba.shape[0])
    return rgba[y0:y1, x0:x1]


def quantise(rgba: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    quantised = Image.fromarray(rgba[..., :3]).convert("P", palette=Image.ADAPTIVE, colors=COLORS)
    indices = np.asarray(quantised).astype(np.int32)
    palette = np.asarray(quantised.getpalette()).reshape(-1, 3)[:COLORS].astype(np.float32)
    colors = palette[indices]

    flat = colors.astype(np.uint8).copy()
    h, w = flat.shape[:2]
    textured = np.abs(cv2.medianBlur(flat, 5).astype(np.float32) - colors).max(axis=2) > 34

    for _ in range(10):
        for y in range(1, h - 1):
            ref = flat[y - 1, 1:-1].astype(np.int16)
            cur = flat[y, 1:-1].astype(np.int16)
            same = (~textured[y, 1:-1]) & (np.abs(cur - ref).sum(axis=1) < 90)
            flat[y, 1:-1][same] = ref[same].astype(np.uint8)
        for x in range(1, w - 1):
            ref = flat[1:-1, x - 1].astype(np.int16)
            cur = flat[1:-1, x].astype(np.int16)
            same = (~textured[1:-1, x]) & (np.abs(cur - ref).sum(axis=1) < 90)
            flat[1:-1, x][same] = ref[same].astype(np.uint8)

    flat = cv2.bilateralFilter(flat, 9, 70, 70)
    for _ in range(2):
        major = cv2.medianBlur(flat, 7)
        keep = np.abs(flat.astype(np.int16) - major.astype(np.int16)).sum(axis=2) <= 70
        flat = np.where(keep[..., None], flat, major)
    return indices, flat


def orient(pts: np.ndarray) -> np.ndarray:
    x, y = pts[:, 0], pts[:, 1]
    twice_area = np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)
    return pts[::-1] if twice_area < 0 else pts


def simplify(pts: np.ndarray) -> np.ndarray:
    if len(pts) < 4:
        return pts
    approx = cv2.approxPolyDP(pts.reshape(-1, 1, 2).astype(np.int32), DETAIL, True)
    out = approx.reshape(-1, 2).astype(np.float64)
    return out if len(out) >= 3 else pts


def to_path(contour: np.ndarray) -> str:
    pts = simplify(orient(contour.reshape(-1, 2).astype(np.float64)))
    if len(pts) < 3:
        return ""
    coords = "L".join(f"{px:g} {py:g}" for px, py in pts)
    return f"M{coords}Z"


def hex_of(rgb: np.ndarray) -> str:
    r, g, b = (int(round(float(c))) for c in rgb)
    return f"#{r:02x}{g:02x}{b:02x}"


def layer_paths(region: np.ndarray) -> list[str]:
    padded = np.pad(region, 1, mode="constant")
    contours, hierarchy = cv2.findContours(padded, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)
    if not contours:
        return []
    hierarchy = hierarchy[0]

    groups: dict[int, list[int]] = {}
    for idx in range(len(contours)):
        pts = contours[idx].reshape(-1, 2).astype(np.float64) - 1.0
        if abs(cv2.contourArea(pts.reshape(-1, 1, 2).astype(np.float32))) < MIN_REGION_PX * 0.25:
            continue
        groups.setdefault(int(hierarchy[idx][3]), []).append(idx)

    paths: list[str] = []
    for parent, kids in groups.items():
        if parent == -1:
            for root in kids:
                d = to_path((contours[root].reshape(-1, 2) - 1).astype(np.float32))
                if d:
                    paths.append(d)
        else:
            parts = [to_path((contours[parent].reshape(-1, 2) - 1).astype(np.float32))]
            parts.extend(
                to_path((contours[kid].reshape(-1, 2) - 1).astype(np.float32)) for kid in kids
            )
            d = "".join(part for part in parts if part)
            if d:
                paths.append(d)
    return paths


def clean(region: np.ndarray) -> np.ndarray | None:
    if region.sum() < MIN_REGION_PX:
        return None
    core = cv2.erode(region, np.ones((2, 2), np.uint8)) > 0
    if core.sum() < MIN_REGION_PX:
        return None
    labels, _ = ndimage.label(region > 0)
    keep = np.unique(labels[core])
    kept = np.isin(labels, keep[keep > 0]).astype(np.uint8)
    return ndimage.binary_fill_holes(kept).astype(np.uint8)


def trace(rgba: np.ndarray) -> tuple[list[str], int, int]:
    height, width = rgba.shape[:2]
    subjects = (rgba[..., 3] > ALPHA_FLOOR).astype(np.uint8)
    indices, flat = quantise(rgba)

    codes, counts = np.unique(indices[subjects > 0], return_counts=True)
    freq = dict(zip(codes.tolist(), counts.tolist()))
    light = {code: float(flat[indices == code].mean()) for code in freq}
    order = sorted(freq, key=lambda c: (light[c] < 90, light[c]))

    layers: list[str] = []
    for code in order:
        region = ((indices == code) & (subjects > 0)).astype(np.uint8)
        if region.sum() < MIN_LAYER_PX:
            continue
        cleaned = clean(region)
        if cleaned is None:
            continue
        fill = hex_of(flat[cleaned > 0].mean(axis=0))
        for d in layer_paths(cleaned):
            layers.append(f'<path fill="{fill}" fill-rule="evenodd" d="{d}"/>')
    return layers, width, height


def write_svg(path: Path, layers: list[str], width: int, height: int, label: str) -> None:
    body = "".join(layers)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'preserveAspectRatio="xMidYMid meet" role="img" aria-label="{label}">'
        f"<title>{label}</title>{body}</svg>\n"
    )
    path.write_text(svg, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}  layers={len(layers)}  {len(svg) / 1024:.1f}KB")


def build() -> None:
    rgba = load_rgba()
    layers, width, height = trace(rgba)
    write_svg(LOGO_OUT, layers, width, height, "T-KPL logo")

    # Nav mark: square window over the ball + lightning cluster of the same trace.
    side = round(height * 0.52)
    left = round(width * 0.63)
    top = round(height * 0.02)
    layers_by_pos = []
    for layer in layers:
        layers_by_pos.append(layer)
    mark_svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left} {top} {side} {side}" '
        f'preserveAspectRatio="xMidYMid slice" role="img" aria-label="T-KPL">'
        f"<title>T-KPL</title>" + "".join(layers_by_pos) + "</svg>\n"
    )
    MARK_OUT.write_text(mark_svg, encoding="utf-8")
    print(f"wrote {MARK_OUT.relative_to(ROOT)}  {len(mark_svg) / 1024:.1f}KB  viewBox={left} {top} {side} {side}")


if __name__ == "__main__":
    build()

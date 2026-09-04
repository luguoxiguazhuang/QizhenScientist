"""Export paper figure panels from `paper/figures/` into web-ready WebP.

The paper source is gitignored, so most contributors never have it. The
*outputs* are committed instead: `site/public/figures/*.webp` plus the
generated manifest `site/src/content/figures.generated.js`. Running this
script is only necessary when a figure in the paper changes.

    cd site && python3 scripts/build-figures.py            # incremental
    cd site && python3 scripts/build-figures.py --force    # rebuild all
    cd site && python3 scripts/build-figures.py --only belief-a-heads
    cd site && python3 scripts/build-figures.py --grid subliminal.png

Crop rectangles in `figures.spec.json` are FRACTIONAL — [x, y, w, h] in 0..1
of the source page — not pixels. A figure re-exported from the paper at a
different DPI keeps the same spec. The `--grid` mode writes a labelled 10%
overlay to `public/figures/_grid/` so those fractions can be read off the
image by eye; that directory is gitignored.

PDF panels are rasterized by ghostscript first and cropped by ImageMagick
second. IM6's own PDF delegate shells out to ghostscript anyway, with less
control over antialiasing. `pngalpha` yields a transparent background, which
is why the convert step forces white: dropped into one of the site's dark
blocks, a transparent figure loses all its black axis labels.

Requires ImageMagick 6 (`convert`, `identify`) with a webp delegate and
ghostscript (`gs`). No third-party Python packages.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # site/
SCRIPT_DIR = Path(__file__).resolve().parent        # site/scripts/
SPEC_PATH = SCRIPT_DIR / "figures.spec.json"

# Persisted next to the outputs so a fresh checkout that *does* have paper/
# still skips panels whose committed webp is already current.
STATE_NAME = ".build-state.json"

WEBP_QUALITY = "82"


# ---------------------------------------------------------------------------
# Shell helpers
# ---------------------------------------------------------------------------

def run(cmd: list[str]) -> str:
    """Run a command, raising with the full stderr if it fails."""
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"command failed ({proc.returncode}): {' '.join(cmd)}\n"
            f"{proc.stderr.strip() or proc.stdout.strip()}"
        )
    return proc.stdout


def require_tools() -> None:
    missing = []
    for tool, probe in (("convert", ["convert", "-version"]),
                        ("identify", ["identify", "-version"]),
                        ("gs", ["gs", "--version"])):
        try:
            run(probe)
        except (RuntimeError, FileNotFoundError):
            missing.append(tool)
    if missing:
        sys.exit(f"ERROR: missing required tool(s): {', '.join(missing)}")


def image_size(path: Path) -> tuple[int, int]:
    out = run(["identify", "-format", "%w %h", f"{path}[0]"]).split()
    return int(out[0]), int(out[1])


def has_alpha(path: Path) -> bool:
    return "a" in run(["identify", "-format", "%[channels]", str(path)]).strip().lower()


# ---------------------------------------------------------------------------
# Rasterization
# ---------------------------------------------------------------------------

def rasterize_pdf(src: Path, page: int, density: int, tmpdir: Path,
                  cache: dict) -> Path:
    """Render one PDF page to PNG via ghostscript. Cached per (file, page, dpi)."""
    key = (str(src), page, density)
    if key in cache:
        return cache[key]
    out = tmpdir / f"{src.stem}-p{page}-{density}.png"
    run([
        "gs", "-q", "-dSAFER", "-dBATCH", "-dNOPAUSE",
        "-sDEVICE=pngalpha", f"-r{density}",
        "-dTextAlphaBits=4", "-dGraphicsAlphaBits=4",
        f"-dFirstPage={page}", f"-dLastPage={page}",
        f"-sOutputFile={out}", str(src),
    ])
    cache[key] = out
    return out


def resolve_panel_source(panel: dict, src_dir: Path) -> Path:
    """Paper sources live under src_dir; hand-cropped panels can live next to
    this script under figure-sources/ (committed) when the paper crop is wrong."""
    name = panel["from"]
    if name.startswith("figure-sources/"):
        return (SCRIPT_DIR / name).resolve()
    return (src_dir / name).resolve()


def source_raster(src: Path, panel: dict, tmpdir: Path, cache: dict) -> Path:
    """The bitmap to crop from — a PDF page gets rasterized first."""
    if src.suffix.lower() == ".pdf":
        page = int(panel.get("page", 1))
        density = int(panel.get("density", 400))
        return rasterize_pdf(src, page, density, tmpdir, cache)
    return src


# ---------------------------------------------------------------------------
# Crop geometry
# ---------------------------------------------------------------------------

def crop_geometry(crop: list[float] | None, w: int, h: int) -> str | None:
    """Fractional [x, y, w, h] → ImageMagick `WxH+X+Y`, clamped to the image."""
    if not crop:
        return None
    fx, fy, fw, fh = (float(v) for v in crop)
    x = max(0, min(w - 1, round(fx * w)))
    y = max(0, min(h - 1, round(fy * h)))
    cw = max(1, min(w - x, round(fw * w)))
    ch = max(1, min(h - y, round(fh * h)))
    return f"{cw}x{ch}+{x}+{y}"


# ---------------------------------------------------------------------------
# Panel export
# ---------------------------------------------------------------------------

def export_variant(raster: Path, geometry: str | None,
                   target_w: int, dest: Path) -> None:
    # Flattening onto white is mandatory, not cosmetic. gs writes pngalpha with
    # a fully transparent page, and the paper's own PNG exports are RGBA too;
    # either one dropped into a dark section block loses all its black ink.
    cmd = [
        "convert", str(raster),
        "-background", "white", "-alpha", "remove", "-alpha", "off",
    ]
    if geometry:
        cmd += ["-crop", geometry, "+repage"]
    cmd += [
        "-colorspace", "sRGB", "-strip",
        "-filter", "Lanczos",
        "-resize", f"{target_w}x>",          # '>' == shrink only, never upscale
        "-quality", WEBP_QUALITY,
        "-define", "webp:method=6",
        str(dest),
    ]
    run(cmd)


def spec_fingerprint(panel: dict, widths: dict, src: Path) -> str:
    payload = {
        "panel": panel,
        "widths": widths,
        "src_mtime_ns": src.stat().st_mtime_ns,
        "src_size": src.stat().st_size,
        "quality": WEBP_QUALITY,
    }
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Grid overlay (crop-discovery helper)
# ---------------------------------------------------------------------------

def write_grid(src: Path, out_dir: Path, page: int, density: int,
               tmpdir: Path, cache: dict) -> Path:
    """Labelled 10% grid over the source, for reading fractional crops by eye."""
    raster = (rasterize_pdf(src, page, density, tmpdir, cache)
              if src.suffix.lower() == ".pdf" else src)
    w, h = image_size(raster)
    # Work at a legible-but-bounded size; the grid is fractional so the scale
    # it is drawn at does not matter.
    view_w = min(w, 1600)
    view_h = round(h * view_w / w)
    margin = 56  # gutter for the axis labels, so they never cover the figure

    lines = []
    for i in range(0, 11):
        x = round(i / 10 * (view_w - 1))
        y = round(i / 10 * (view_h - 1))
        lines.append(f"line {x},0 {x},{view_h}")
        lines.append(f"line 0,{y} {view_w},{y}")

    label_cmds: list[str] = []
    for i in range(0, 11):
        x = round(i / 10 * (view_w - 1))
        y = round(i / 10 * (view_h - 1))
        # Top edge: x fractions. Left edge: y fractions.
        label_cmds += ["-annotate", f"+{margin + x + 4}+{margin - 12}", f"{i / 10:.1f}"]
        label_cmds += ["-annotate", f"+{4}+{margin + y - 6}", f"{i / 10:.1f}"]

    out_dir.mkdir(parents=True, exist_ok=True)
    dest = out_dir / f"{src.stem}-grid.png"
    run([
        "convert", str(raster),
        "-background", "white", "-alpha", "remove", "-alpha", "off",
        "-resize", f"{view_w}x{view_h}!",
        "-bordercolor", "white", "-border", f"{margin}x{margin}",
        "-fill", "none", "-stroke", "red", "-strokewidth", "2",
        "-draw", f"translate {margin},{margin} " + " ".join(lines),
        "-stroke", "none", "-fill", "red", "-pointsize", "26",
        *label_cmds,
        str(dest),
    ])
    return dest


# ---------------------------------------------------------------------------
# Manifest
# ---------------------------------------------------------------------------

MANIFEST_HEADER = """\
// AUTOGENERATED by scripts/build-figures.py from scripts/figures.spec.json.
// Do not edit by hand — rerun `npm run figures` instead.
//
// Panels are exported from the paper sources under paper/figures/, which is
// gitignored; these outputs are committed so the site builds without it.
//
// `src2x` is omitted when the panel is narrower in the source than the 2x
// target: the resize never upscales, so the two files would be identical.
//
// `src` / `src2x` are RELATIVE paths. Consumers must pass them through
// withBase() from src/lib/basePath.js — the site also deploys under a
// GitHub Pages subpath, where a leading slash would 404.
//
// `width` / `height` are the true 1x pixel dimensions, so a consumer can set
// intrinsic size on the <img> and avoid layout shift while the image loads.
"""

MANIFEST_FOOTER = """
/** Look up a figure by id. Returns undefined (and warns in dev) on a miss. */
export function getFigure(id) {
  const figure = FIGURES[id]
  if (!figure && import.meta.env?.DEV) {
    console.warn(
      `[figures] unknown figure id "${id}". Known ids: ${Object.keys(FIGURES).join(', ')}`,
    )
  }
  return figure
}

/** Every exported figure id, in spec order. */
export const FIGURE_IDS = Object.keys(FIGURES)
"""


def js_string(value: str) -> str:
    # JSON string syntax is a subset of JS string syntax, and the manifest is an
    # ES module rather than an inline <script>, so json.dumps needs no fixups.
    return json.dumps(value, ensure_ascii=False)


def write_manifest(dest: Path, records: list[dict]) -> None:
    lines = [MANIFEST_HEADER, "export const FIGURES = {"]
    for r in records:
        lines.append(f"  {js_string(r['id'])}: {{")
        lines.append(f"    src: {js_string(r['src'])},")
        if r.get("src2x"):
            lines.append(f"    src2x: {js_string(r['src2x'])},")
        lines.append(f"    width: {r['width']},")
        lines.append(f"    height: {r['height']},")
        lines.append(f"    alt: {js_string(r['alt'])},")
        lines.append(f"    source: {js_string(r['source'])},")
        lines.append(f"    plate: {'true' if r['plate'] else 'false'},")
        lines.append("  },")
    lines.append("}")
    lines.append(MANIFEST_FOOTER)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def human_size(n: int) -> str:
    return f"{n / 1024:.0f} KB" if n < 1024 * 1024 else f"{n / 1024 / 1024:.2f} MB"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--force", action="store_true",
                    help="rebuild every panel, ignoring the cache")
    ap.add_argument("--only", metavar="ID",
                    help="build a single panel id (repeatable via commas)")
    ap.add_argument("--grid", metavar="FILE",
                    help="write a labelled 10%% crop grid for a source file "
                         "into public/figures/_grid/ and exit")
    ap.add_argument("--page", type=int, default=1,
                    help="page to use with --grid on a PDF (default 1)")
    ap.add_argument("--density", type=int, default=300,
                    help="DPI to use with --grid on a PDF (default 300)")
    args = ap.parse_args()

    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    src_dir = (SCRIPT_DIR / spec["source"]).resolve()
    out_dir = (SCRIPT_DIR / spec["out"]).resolve()
    manifest_path = (SCRIPT_DIR / spec["manifest"]).resolve()
    widths: dict[str, int] = spec["widths"]

    if not src_dir.is_dir():
        print(f"paper/ not found at {src_dir} — figures are committed, run this "
              f"only when regenerating them. Nothing to do.")
        return 0

    require_tools()
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="build-figures-") as tmp:
        tmpdir = Path(tmp)
        raster_cache: dict = {}

        if args.grid:
            src = src_dir / args.grid
            if not src.exists():
                sys.exit(f"ERROR: no such source file: {src}")
            dest = write_grid(src, out_dir / "_grid", args.page, args.density,
                              tmpdir, raster_cache)
            print(f"grid → {dest}")
            return 0

        state_path = out_dir / STATE_NAME
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            state = {}

        wanted = None
        if args.only:
            wanted = {s.strip() for s in args.only.split(",") if s.strip()}
            unknown = wanted - {p["id"] for p in spec["panels"]}
            if unknown:
                sys.exit(f"ERROR: unknown panel id(s): {', '.join(sorted(unknown))}")

        records: list[dict] = []
        rows: list[tuple] = []
        n_written = 0

        for panel in spec["panels"]:
            pid = panel["id"]
            src = resolve_panel_source(panel, src_dir)
            if not src.exists():
                sys.exit(f"ERROR: panel '{pid}' references missing source {src}")

            names = {k: f"{pid}@{k}.webp" for k in widths}
            dests = {k: out_dir / v for k, v in names.items()}
            fingerprint = spec_fingerprint(panel, widths, src)

            # A panel whose 2x came out byte-identical to its 1x has no 2x file
            # on disk at all (see the dedup below), so "are this panel's outputs
            # present?" cannot just ask whether both paths exist — for those
            # panels the answer is permanently no, and the panel would rebuild
            # on every run forever. The last run records which shape it settled
            # on; `has_2x` absent means the state predates the dedup, so rebuild
            # once to establish it.
            prev = state.get(pid, {})
            had_2x = prev.get("has_2x")
            expected = [dests["1x"]] + ([dests["2x"]] if had_2x else [])

            # --only narrows what gets *built*; every panel still contributes to
            # the manifest, so a partial run never truncates it.
            if wanted is not None and pid not in wanted:
                skip = True
            elif args.force:
                skip = False
            else:
                skip = (prev.get("hash") == fingerprint
                        and had_2x is not None
                        and all(d.exists() for d in expected))

            if skip and not all(d.exists() for d in expected):
                sys.exit(f"ERROR: panel '{pid}' has no committed output and was "
                         f"excluded by --only; run without --only first.")

            if not skip:
                raster = source_raster(src, panel, tmpdir, raster_cache)
                rw, rh = image_size(raster)
                geometry = crop_geometry(panel.get("crop"), rw, rh)
                for key, target_w in widths.items():
                    export_variant(raster, geometry, target_w, dests[key])
                n_written += 1

            w1, h1 = image_size(dests["1x"])
            if has_alpha(dests["1x"]):
                sys.exit(f"ERROR: panel '{pid}' kept an alpha channel — it would "
                         f"render as invisible ink on a dark background.")

            # Several panels are narrower in the source than the 2x target, and
            # the resize is shrink-only, so 1x and 2x come out byte-identical.
            # Shipping both means committing the file twice and handing the
            # browser a srcset descriptor that buys it nothing. Drop the
            # duplicate and omit src2x; Figure.jsx already renders a plain src
            # when there is no distinct 2x.
            if skip:
                # Nothing was rebuilt, so there is nothing to compare: disk is
                # the truth about whether this panel has a distinct 2x.
                same = not dests["2x"].exists()
            else:
                same = dests["2x"].read_bytes() == dests["1x"].read_bytes()
                if same:
                    dests["2x"].unlink()

            state[pid] = {"hash": fingerprint, "width": w1, "height": h1,
                          "has_2x": not same}
            records.append({
                "id": pid,
                "src": f"figures/{names['1x']}",
                **({} if same else {"src2x": f"figures/{names['2x']}"}),
                "width": w1,
                "height": h1,
                "alt": panel["alt"],
                "source": panel["source"],
                "plate": bool(panel.get("plate")),
            })
            rows.append((
                pid, panel["from"], f"{w1}x{h1}",
                human_size(dests["1x"].stat().st_size),
                "= 1x" if same else human_size(dests["2x"].stat().st_size),
                "skipped" if skip else "written",
            ))

        state_path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n",
                              encoding="utf-8")
        write_manifest(manifest_path, records)

    head = ("id", "source", "1x dims", "1x size", "2x size", "status")
    widths_c = [max(len(str(r[i])) for r in [head, *rows]) for i in range(6)]
    fmt = "  ".join(f"{{:<{w}}}" for w in widths_c)
    print(fmt.format(*head))
    print("  ".join("-" * w for w in widths_c))
    for r in rows:
        print(fmt.format(*r))

    total = sum(p.stat().st_size for p in out_dir.glob("*.webp"))
    print(f"\n{n_written} written, {len(rows) - n_written} skipped · "
          f"{len(list(out_dir.glob('*.webp')))} files, {human_size(total)} total")
    print(f"manifest → {manifest_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

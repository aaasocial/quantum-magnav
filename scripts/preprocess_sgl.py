"""Extract the SGL 2020 line excerpts and Ottawa map crops shipped in data/ (LOCAL ONLY).

This is the only file in the repository that imports h5py. It reads the licensed raw
HDF5 files from data_raw/ (gitignored) and writes small, byte-reproducible excerpts:

    data/flt1006_line08.npz   calibration line 1006.08
    data/flt1003_line02.npz   held-out line 1003.02
    data/flt1007_line06.npz   held-out line 1007.06
    data/map_eastern_395.npz  Eastern_395 crop (1003.02 bbox + 5 km, also covers 1006.08)
    data/map_renfrew_395.npz  Renfrew_395 crop (1007.06 bbox + 5 km)
    data/provenance.json      sources, SHA-256 hashes, ranges, decimation, channels

Run from the repository root:
    uv run --with h5py python -I scripts/preprocess_sgl.py [--raw data_raw] [--out data]

Conventions (see .planning/phases/02-*/02-RESEARCH.md):
- exact float equality on the line id (tolerance matching merges neighbouring lines);
- 10 Hz -> 2 Hz by a block mean of 5 (the scipy FIR decimator zero-pads 53,000 nT edges);
  ins_yaw by a circular mean;
- igrf = mag_1_dc - mag_1_igrf (there is no igrf dataset in the files);
- maps are written by Julia, so h5py sees map/mask transposed: rows = lat after .T;
- savez_compressed with sorted keys and JSON without timestamps -> byte-identical re-runs.
"""

import argparse
import hashlib
import json
from pathlib import Path

import h5py
import numpy as np

Q = 5  # 10 Hz -> 2 Hz
DS = 4  # map downsample factor (~30 m -> ~120 m)
MARGIN_M = 5000.0

LINES = [
    # (source file, line id, expected 10 Hz count, output name, role)
    ("Flt1006_train.h5", 1006.08, 8391, "flt1006_line08.npz", "calibration"),
    ("Flt1003_train.h5", 1003.02, 37841, "flt1003_line02.npz", "held_out"),
    ("Flt1007_train.h5", 1007.06, 52401, "flt1007_line06.npz", "held_out"),
]
MAPS = [
    # (source file, output name, line used for the crop, lines that must lie on valid cells)
    ("Eastern_395.h5", "map_eastern_395.npz", 1003.02, (1003.02, 1006.08)),
    ("Renfrew_395.h5", "map_renfrew_395.npz", 1007.06, (1007.06,)),
]
MAP_DIR = Path("ottawa_area_maps") / "ottawa_area_maps"

CUR = [
    "cur_ac_hi", "cur_ac_lo", "cur_acpwr", "cur_bat_1", "cur_bat_2", "cur_com_1", "cur_flap",
    "cur_heat", "cur_outpwr", "cur_srvo_i", "cur_srvo_m", "cur_srvo_o", "cur_strb", "cur_tank",
]  # fmt: skip
F32 = (
    ["mag_1_c", "mag_1_igrf", "diurnal", "mag_3_uc", "mag_4_uc", "mag_5_uc"]
    + [f"flux_{c}_{a}" for c in "abcd" for a in "xyzt"]
    + CUR
    + ["ins_pitch", "ins_roll", "ins_vn", "ins_vw", "ins_vu", "utm_z"]
)
F64 = ["tt", "lat", "lon", "utm_x", "utm_y"]
DATASET = (
    "SGL 2020 MagNav Challenge (USAF Cooperative Agreement FA8750-19-2-1000; "
    "Gnadt et al. arXiv:2007.12158); maps from MagNav.jl (ottawa_area_maps)"
)


def block_mean(v: np.ndarray, q: int = Q) -> np.ndarray:
    n = len(v) // q * q
    return np.asarray(v[:n], dtype=np.float64).reshape(-1, q).mean(1)


def circ_mean_deg(v: np.ndarray, q: int = Q) -> np.ndarray:
    n = len(v) // q * q
    r = np.deg2rad(np.asarray(v[:n], dtype=np.float64)).reshape(-1, q)
    return np.rad2deg(np.arctan2(np.sin(r).mean(1), np.cos(r).mean(1))) % 360.0


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def save_npz(path: Path, arrays: dict) -> None:
    np.savez_compressed(path, **dict(sorted(arrays.items())))


def extract_line(src: Path, line_id: float, expected: int) -> tuple[dict, dict]:
    with h5py.File(src, "r") as f:
        mask = f["line"][:] == line_id  # exact equality, never a tolerance match
        idx = np.flatnonzero(mask)
        assert len(idx) == expected, (src.name, line_id, len(idx), expected)
        i0, i1 = int(idx[0]), int(idx[-1]) + 1
        assert i1 - i0 == expected, "line samples are not contiguous"
        raw = {k: f[k][i0:i1].astype(np.float64) for k in F32 + F64}
        raw["mag_1_dc"] = f["mag_1_dc"][i0:i1].astype(np.float64)
        raw["ins_yaw"] = f["ins_yaw"][i0:i1].astype(np.float64)
    tt10 = raw["tt"]
    assert np.allclose(np.diff(tt10), 0.1, atol=1e-6, rtol=0), "10 Hz tt not uniform"
    for k, v in raw.items():
        assert np.all(np.isfinite(v)), f"non-finite values in {k}"
    igrf10 = raw["mag_1_dc"] - raw["mag_1_igrf"]  # derive at 10 Hz before decimation

    out: dict[str, np.ndarray] = {}
    for k in F64:
        out[k] = block_mean(raw[k]).astype(np.float64)
    for k in F32:
        out[k] = block_mean(raw[k]).astype(np.float32)
    out["igrf"] = block_mean(igrf10).astype(np.float32)
    out["ins_yaw"] = circ_mean_deg(raw["ins_yaw"]).astype(np.float32)
    out["line"] = np.array(line_id, dtype=np.float64)
    assert np.allclose(np.diff(out["tt"]), 0.5, atol=1e-6, rtol=0)
    meta = {"n_10hz": expected, "n_2hz": len(out["tt"])}
    return out, meta


def crop_map(src: Path, lat: np.ndarray, lon: np.ndarray) -> tuple[dict, dict]:
    with h5py.File(src, "r") as f:
        xx = f["xx"][:].astype(np.float64)  # lon, deg
        yy = f["yy"][:].astype(np.float64)  # lat, deg
        assert f["map"].shape == (len(xx), len(yy)), "unexpected map orientation"
        assert np.all(np.diff(xx) > 0) and np.all(np.diff(yy) > 0)
        lat0 = float(lat.mean())
        dlat = MARGIN_M / 110540.0
        dlon = MARGIN_M / (111320.0 * np.cos(np.deg2rad(lat0)))
        ix = np.flatnonzero((xx >= lon.min() - dlon) & (xx <= lon.max() + dlon))
        iy = np.flatnonzero((yy >= lat.min() - dlat) & (yy <= lat.max() + dlat))
        nx, ny = len(ix) // DS, len(iy) // DS
        x0, y0 = int(ix[0]), int(iy[0])
        xs, ys = slice(x0, x0 + nx * DS), slice(y0, y0 + ny * DS)
        # h5py sees (lon, lat); read the crop only, then transpose to rows = lat.
        sub = f["map"][xs, ys].T.astype(np.float64)
        subm = f["mask"][xs, ys].T.astype(bool)
        alt = float(np.asarray(f["alt"][()]).ravel()[0])
        info = f["info"][()]
    if isinstance(info, np.ndarray):
        info = info.ravel()[0] if info.size else b""
    info = info.decode("utf-8", "replace") if isinstance(info, bytes) else str(info)
    assert sub.shape == (ny * DS, nx * DS) and np.all(np.isfinite(sub))
    grid = sub.reshape(ny, DS, nx, DS).mean(axis=(1, 3)).astype(np.float32)
    valid = subm.reshape(ny, DS, nx, DS).all(axis=(1, 3))
    xx4 = xx[xs].reshape(nx, DS).mean(1)
    yy4 = yy[ys].reshape(ny, DS).mean(1)
    arrays = {"alt": np.array(alt, dtype=np.float64), "map": grid, "mask": valid, "xx": xx4, "yy": yy4}
    meta = {"alt": alt, "info": info[:300], "shape": [int(ny), int(nx)], "valid_fraction": float(valid.mean())}
    return arrays, meta


def track_valid_fraction(arrays: dict, lat: np.ndarray, lon: np.ndarray) -> float:
    xx, yy, valid = arrays["xx"], arrays["yy"], arrays["mask"]
    ci = np.clip(np.rint((lon - xx[0]) / (xx[1] - xx[0])).astype(np.int64), 0, len(xx) - 1)
    cj = np.clip(np.rint((lat - yy[0]) / (yy[1] - yy[0])).astype(np.int64), 0, len(yy) - 1)
    inside = (lon >= xx[0]) & (lon <= xx[-1]) & (lat >= yy[0]) & (lat <= yy[-1])
    return float(np.mean(inside & valid[cj, ci]))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--raw", default="data_raw", help="directory holding the raw SGL files")
    ap.add_argument("--out", default="data", help="output directory")
    args = ap.parse_args()
    raw, out = Path(args.raw), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    files: dict[str, dict] = {}
    tracks: dict[float, tuple[np.ndarray, np.ndarray]] = {}
    for src_name, line_id, expected, out_name, role in LINES:
        src = raw / src_name
        arrays, meta = extract_line(src, line_id, expected)
        path = out / out_name
        save_npz(path, arrays)
        tracks[line_id] = (arrays["lat"], arrays["lon"])
        tt = arrays["tt"]
        files[f"data/{out_name}"] = {
            "kind": "line",
            "source_file": src_name,
            "source_sha256": sha256(src),
            "line": f"{line_id:.2f}",
            "role": role,
            "tt_range": [float(tt[0]), float(tt[-1])],
            "n_10hz": meta["n_10hz"],
            "n_2hz": meta["n_2hz"],
            "decimation": {"factor": Q, "method": "block_mean", "yaw": "circular_mean", "fs_hz": 2.0},
            "channels": sorted(arrays),
            "igrf_derivation": "mag_1_dc - mag_1_igrf",
            "output_sha256": sha256(path),
        }
        print(f"{path}: {meta['n_2hz']} samples, {path.stat().st_size} bytes")

    for src_name, out_name, crop_line, check_lines in MAPS:
        src = raw / MAP_DIR / src_name
        lat, lon = tracks[crop_line]
        arrays, meta = crop_map(src, lat, lon)
        tvf = {}
        for lid in check_lines:
            frac = track_valid_fraction(arrays, *tracks[lid])
            assert frac == 1.0, (out_name, lid, frac)
            tvf[f"{lid:.2f}"] = frac
        path = out / out_name
        save_npz(path, arrays)
        files[f"data/{out_name}"] = {
            "kind": "map",
            "source_file": src_name,
            "source_sha256": sha256(src),
            "crop_for_line": f"{crop_line:.2f}",
            "margin_m": int(MARGIN_M),
            "downsample": DS,
            "downsample_method": "block_mean",
            "mask_rule": "all_valid",
            "shape": meta["shape"],
            "valid_fraction": meta["valid_fraction"],
            "track_valid_fraction": tvf,
            "alt": meta["alt"],
            "info": meta["info"],
            "keys": sorted(arrays),
            "output_sha256": sha256(path),
        }
        print(f"{path}: shape {meta['shape']}, valid {meta['valid_fraction']:.3f}, "
              f"{path.stat().st_size} bytes")

    prov = {
        "schema_version": 1,
        "generator": "scripts/preprocess_sgl.py",
        "dataset": DATASET,
        "files": files,
    }
    text = json.dumps(prov, indent=1, sort_keys=True, allow_nan=False) + "\n"
    (out / "provenance.json").write_text(text, encoding="utf-8")
    print(f"{out / 'provenance.json'} written")


if __name__ == "__main__":
    main()

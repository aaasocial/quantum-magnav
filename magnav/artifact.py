"""RunArtifact v1 (D-16): the columnar JSON that the Phase 3 player replays without Python compute.

One shared downsample index per line; metres rounded to integers, nT to 0.1, t to 0.1 s,
ncc to 3 decimals, metrics to 0.1. NaN/inf become null; no wall-clock timestamps, so the
same run produces the same bytes (Pitfall 11).
"""

import json
import math

import numpy as np

ARTIFACT_PATH = "data/precomputed_run.json"  # literal: Qollab preloads literal paths only
SCHEMA_VERSION = 1
MAX_POINTS = 1500
MAX_SERIES = 2000  # D-16 hard cap per series
PREVIEW_MAX = 160
MAX_BYTES = 2 * 1024 * 1024
CODE_VERSION = "0.1.0"
TITLE = "Quantum MagNav - SGL 2020 classical pipeline"
SENSORS = ("mag_5_uc", "mag_4_uc")
DENOISERS = ("raw", "lowpass", "tl", "tl_currents", "krr", "quantum")
TERCOM_PROVENANCE = {
    "window_s": 60,
    "stride_s": 10,
    "search_m": 3000,
    "step_m": 60,
    "gate": 0.85,
    "median": 3,
    "prior": "recursive_ins_propagated",
    "score": "ncc_mean_removed",
    "invalid_cells": "excluded",
}
REQUIRED_TOP = (
    "schema_version", "title", "sensors", "default_sensor", "denoisers", "thresholds_m",
    "provenance", "lines", "metrics_table", "acceptance",
)  # fmt: skip
REQUIRED_LINE = (
    "line", "map_file", "frame", "map_preview", "jam", "t", "truth", "dead_reckoning", "estimates", "metrics",
)  # fmt: skip


def downsample_idx(n: int, jam_idx: int, max_points: int = MAX_POINTS) -> np.ndarray:
    """Shared display index: a uniform stride plus the jam sample and the last sample."""
    step = max(1, math.ceil(n / max_points))
    idx = np.union1d(np.arange(0, n, step), [int(jam_idx), n - 1])
    return idx.astype(np.int64)


def _r(a, nd: int) -> list:
    """Round an array to nd decimals (nd=0 gives ints); non-finite -> None."""
    a = np.asarray(a, dtype=np.float64)
    out = []
    for v in a.tolist():
        if not math.isfinite(v):
            out.append(None)
        elif nd == 0:
            out.append(round(v))
        else:
            out.append(round(v, nd))
    return out


def _clean(obj, nd: int = 6):
    """Recursive JSON-safe copy: numpy scalars/arrays to Python, NaN/inf to None."""
    if isinstance(obj, dict):
        return {str(k): _clean(v, nd) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_clean(v, nd) for v in obj]
    if isinstance(obj, np.ndarray):
        return _clean(obj.tolist(), nd)
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        v = float(obj)
        return round(v, nd) if math.isfinite(v) else None
    return obj


def map_preview(tile, max_side: int = PREVIEW_MAX) -> dict:
    """Block-mean preview of a MapTile (all-valid rule), rows south-to-north, row-major."""
    k = max(1, math.ceil(max(tile.nx, tile.ny) / max_side))
    ny, nx = tile.ny // k, tile.nx // k
    M = np.asarray(tile.M, dtype=np.float64)[: ny * k, : nx * k].reshape(ny, k, nx, k)
    V = np.asarray(tile.V, dtype=bool)[: ny * k, : nx * k].reshape(ny, k, nx, k)
    valid = V.all(axis=(1, 3))
    Mm = np.where(V, M, 0.0).sum(axis=(1, 3)) / np.maximum(V.sum(axis=(1, 3)), 1)
    nT = np.clip(np.round(np.where(valid, Mm, 0.0)), -32768, 32767).astype(np.int64)
    gx = np.asarray(tile.gx, dtype=np.float64)[: nx * k].reshape(nx, k).mean(axis=1)
    gy = np.asarray(tile.gy, dtype=np.float64)[: ny * k].reshape(ny, k).mean(axis=1)
    return {
        "nx": int(nx),
        "ny": int(ny),
        "block": int(k),
        "x_min": round(float(gx[0])),
        "x_max": round(float(gx[-1])),
        "y_min": round(float(gy[0])),
        "y_max": round(float(gy[-1])),
        "extent_note": "cell-centre coordinates (local m) of the first/last preview cells",
        "nT": nT.ravel().tolist(),
        "valid": valid.astype(np.int64).ravel().tolist(),
    }


def _metrics(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if k in ("line", "sensor", "denoiser"):
            continue
        if v is None or isinstance(v, (int, np.integer)):
            out[k] = None if v is None else int(v)
        else:
            out[k] = round(float(v), 1) if math.isfinite(float(v)) else None
    return out


def _table_row(row: dict) -> dict:
    return {"line": row["line"], "sensor": row["sensor"], "denoiser": row["denoiser"], **_metrics(row)}


def _sources(provenance: dict) -> list:
    out = []
    for path, info in provenance.get("files", {}).items():
        out.append(
            {
                "file": path,
                "kind": info.get("kind"),
                "source_file": info.get("source_file"),
                "source_sha256": info.get("source_sha256"),
                "line": info.get("line", info.get("crop_for_line")),
                "tt_range": info.get("tt_range"),
            }
        )
    return out


def build_run_artifact(result: dict, provenance: dict) -> dict:
    """Assemble RunArtifact v1 from run_pipeline() output and data/provenance.json."""
    from magnav.metrics import acceptance_checks

    cfg = result["config"]
    lines_out = []
    for line_id, L in result["lines"].items():
        n = int(L["n"])
        jam = int(L["jam_idx"])
        idx = downsample_idx(n, jam)
        t = np.asarray(L["t"], dtype=np.float64)
        estimates, metrics = {}, {"dead_reckoning": _metrics(L["dr_metrics"])}
        for sensor, dens in L["results"].items():
            estimates[sensor], metrics[sensor] = {}, {}
            for name, r in dens.items():
                we = np.asarray(r["window_end"], dtype=np.int64)
                estimates[sensor][name] = {
                    "x": _r(np.asarray(r["x"])[idx], 0),
                    "y": _r(np.asarray(r["y"])[idx], 0),
                    "signal_nT": _r(np.asarray(r["signal"])[idx], 1),
                    "window_t": _r(t[np.clip(we - 1, 0, n - 1)] - t[0], 1),
                    "ncc": _r(r["ncc"], 3),
                    "accepted": [int(bool(a)) for a in np.asarray(r["accepted"]).tolist()],
                }
                metrics[sensor][name] = _metrics(r["metrics"])
        frame = L["frame"]
        lines_out.append(
            {
                "line": line_id,
                "map_file": L["map_file"],
                "frame": {"type": "local_equirectangular", "lat0": frame["lat0"], "lon0": frame["lon0"], "R_m": frame["R"]},
                "map_preview": map_preview(L["tile"]),
                "jam": {
                    "index": jam,
                    "t_s": round(float(t[jam] - t[0]), 1),
                    "display_index": int(np.searchsorted(idx, jam)),
                },
                "metric_start_index": int(L["metric_start"]),
                "t": _r(t[idx] - t[0], 1),
                "truth": {
                    "x": _r(np.asarray(L["truth_x"])[idx], 0),
                    "y": _r(np.asarray(L["truth_y"])[idx], 0),
                    "anomaly_nT": _r(np.asarray(L["truth_anomaly"])[idx], 1),
                },
                "dead_reckoning": {"x": _r(np.asarray(L["dr_x"])[idx], 0), "y": _r(np.asarray(L["dr_y"])[idx], 0)},
                "estimates": estimates,
                "metrics": metrics,
            }
        )

    table = [_table_row(r) for r in result["metrics_table"]]
    prov = {
        "dataset": provenance.get("dataset"),
        "code_version": CODE_VERSION,
        "data_provenance_file": "data/provenance.json",
        "sources": _sources(provenance),
        "decimation": {"factor": 5, "method": "block_mean", "fs_hz": 2.0},
        "seed": cfg["seed"],
        "jam_fraction": cfg["jam_fraction"],
        "cal_line": cfg["cal_line"],
        "ins_drift": {
            line_id: {
                "seed": cfg["dr"]["line_seeds"][line_id],
                "seed_rule": "SeedSequence([seed, int(line_id without '.')]).generate_state(1)[0]",
                "bias_mps": cfg["dr"]["bias_mps"],
                "bias_signs": signs,
                "rw_sigma_mps_per_sqrt_s": cfg["dr"]["rw_sigma"],
            }
            for line_id, signs in cfg["dr"]["bias_signs"].items()
        },
        "tl": cfg["tl"],
        "krr": cfg["krr"],
        "quantum": cfg["quantum"],
        "tercom": dict(TERCOM_PROVENANCE),
    }
    obj = {
        "schema_version": SCHEMA_VERSION,
        "title": TITLE,
        "sensors": list(cfg["sensors"]),
        "default_sensor": cfg["default_sensor"],
        "denoisers": list(DENOISERS),
        "thresholds_m": [int(v) for v in cfg["thresholds_m"]],
        "provenance": prov,
        "lines": lines_out,
        "metrics_table": table,
        "acceptance": acceptance_checks(table),
    }
    return _clean(obj)


def dumps_artifact(obj: dict) -> str:
    return json.dumps(obj, allow_nan=False, separators=(",", ":"))


def write_run_artifact(obj: dict, path: str = ARTIFACT_PATH) -> int:
    text = dumps_artifact(obj) + "\n"
    data = text.encode("utf-8")
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def validate_artifact(obj: dict) -> list:
    """Return a list of problems; an empty list means valid."""
    errs = []
    if not isinstance(obj, dict):
        return ["artifact is not an object"]
    if obj.get("schema_version") != SCHEMA_VERSION:
        errs.append(f"schema_version {obj.get('schema_version')!r} != {SCHEMA_VERSION}")
    errs += [f"missing top-level key {k}" for k in REQUIRED_TOP if k not in obj]
    sensors = obj.get("sensors", [])
    denoisers = obj.get("denoisers", [])
    errs += [f"unknown sensor {s}" for s in sensors if s not in SENSORS]
    errs += [f"unknown denoiser {d}" for d in denoisers if d not in DENOISERS]
    if obj.get("default_sensor") not in sensors:
        errs.append("default_sensor not in sensors")
    for L in obj.get("lines", []):
        lid = L.get("line", "?")
        miss = [k for k in REQUIRED_LINE if k not in L]
        if miss:
            errs.append(f"line {lid}: missing {miss}")
            continue
        n = len(L["t"])
        if n > MAX_SERIES:
            errs.append(f"line {lid}: t has {n} points > {MAX_SERIES}")
        series = {"truth." + k: v for k, v in L["truth"].items()}
        series.update({"dead_reckoning." + k: v for k, v in L["dead_reckoning"].items()})
        for s, dens in L["estimates"].items():
            if s not in SENSORS:
                errs.append(f"line {lid}: unknown sensor key {s}")
            for d, e in dens.items():
                if d not in DENOISERS:
                    errs.append(f"line {lid}: unknown denoiser key {d}")
                for k in ("x", "y", "signal_nT"):
                    series[f"estimates.{s}.{d}.{k}"] = e.get(k, [])
                lens = {len(e.get(k, [])) for k in ("window_t", "ncc", "accepted")}
                if len(lens) != 1:
                    errs.append(f"line {lid}: {s}/{d} window arrays differ in length")
        for name, v in series.items():
            if len(v) != n:
                errs.append(f"line {lid}: {name} has {len(v)} points, t has {n}")
    try:
        size = len(dumps_artifact(obj).encode("utf-8")) + 1
    except ValueError as exc:  # NaN/inf left in the object
        errs.append(f"not strict JSON: {exc}")
    else:
        if size >= MAX_BYTES:
            errs.append(f"serialized size {size} >= {MAX_BYTES}")
    return errs


def load_artifact() -> dict:
    with open("data/precomputed_run.json", encoding="utf-8") as f:
        return json.load(f)

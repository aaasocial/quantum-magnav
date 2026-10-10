"""End-to-end orchestrator: fit on 1006.08, jam GPS on the held-out lines, navigate, score.

This module and the metrics are the only places that touch `Truth`. Denoisers get the
calibration target as a bare array; the navigator gets Sensors-derived signals, the DR
track, the map tile and the last GPS fix as a plain (x, y) tuple.
"""

import dataclasses

import numpy as np

from magnav.classical import (
    KRR_CV_BLOCKS,
    KRR_FEATURES,
    KRR_TARGET,
    TL_BAND_HZ,
    TL_TERMS,
    build_denoisers,
    select_tl_config,
)
from magnav.data import (
    FLT1003_LINE02,
    FLT1006_LINE08,
    FLT1007_LINE06,
    MAP_EASTERN,
    MAP_RENFREW,
    load_line,
    load_map,
)
from magnav.frames import ll_to_local
from magnav.metrics import THRESHOLDS_M, position_metrics, signal_metrics
from magnav.nav import anomaly_signal, simulate_dr, tercom

SENSORS = ("mag_5_uc", "mag_4_uc")  # D-17: both cabin sensors; Mag 5 is the demo default
DEFAULT_SENSOR = "mag_5_uc"
SEED = 0
JAM_FRACTION = 0.25  # D-04
CAL_LINE = "1006.08"
# literal constants only (Qollab preloads literal paths)
HELD_OUT = {
    "1003.02": (FLT1003_LINE02, MAP_EASTERN),
    "1007.06": (FLT1007_LINE06, MAP_RENFREW),
}
TERCOM_PARAMS = {
    "window": 120,
    "stride": 20,
    "half_width_m": 1500.0,
    "step_m": 60.0,
    "gate": 0.85,
    "median": 3,
}
DR_PARAMS = {"bias_mps": 0.3, "rw_sigma": 0.05}


def line_seed(seed: int, line_id: str) -> int:
    """Deterministic per-line DR seed from the base seed and the line id (WR-03).

    Each held-out line gets its own drift realisation (bias signs and random walk);
    the mapping is fixed (no Python hash randomisation), so runs are reproducible.
    """
    ss = np.random.SeedSequence([int(seed), int(line_id.replace(".", ""))])
    return int(ss.generate_state(1)[0])


def _truncate(obj, n: int):
    """Slice every per-sample array (and dict of arrays) of a frozen dataclass to n."""
    changes = {}
    for f in dataclasses.fields(obj):
        v = getattr(obj, f.name)
        if isinstance(v, np.ndarray) and v.ndim == 1:
            changes[f.name] = v[:n]
        elif isinstance(v, dict):
            changes[f.name] = {k: a[:n] for k, a in v.items()}
    return dataclasses.replace(obj, **changes)


def select_and_build(cal_sensors, cal_target, mag_key: str, backend=None) -> tuple:
    """D-19 config selection on the calibration line, then the (unfitted) denoiser set."""
    sel = select_tl_config(cal_sensors, cal_target, mag_key)
    dens = build_denoisers(mag_key, backend, fluxgate=sel["fluxgate"], lam=sel["lambda"])
    return dens, sel


def fit_sensor(cal_sensors, cal_target, mag_key: str, backend=None, names=None) -> tuple:
    """select_and_build, then fit every denoiser (or only `names`), keeping build order."""
    dens, sel = select_and_build(cal_sensors, cal_target, mag_key, backend)
    fitted = {name: d.fit(cal_sensors, cal_target) for name, d in dens.items() if names is None or name in names}
    return fitted, sel


def prepare_line(line_id: str, seed: int = SEED, truncate=None) -> dict:
    """Load one held-out line, jam GPS, simulate DR and score DR (shared by run_pipeline and live)."""
    if line_id not in HELD_OUT:
        raise ValueError(f"unknown held-out line {line_id!r}; expected one of {sorted(HELD_OUT)}")
    window = TERCOM_PARAMS["window"]
    line_path, map_path = HELD_OUT[line_id]
    sens, truth = load_line(line_path)
    if truncate is not None:
        sens, truth = _truncate(sens, int(truncate)), _truncate(truth, int(truncate))
    tile = load_map(map_path)
    n = sens.n
    jam_idx = int(JAM_FRACTION * n)
    tx, ty = ll_to_local(truth.lat, truth.lon, tile.frame)
    fix_xy = (float(tx[jam_idx]), float(ty[jam_idx]))  # last GPS fix before the jam
    seed_used = line_seed(seed, line_id)
    dr = simulate_dr(sens, jam_idx, fix_xy, seed=seed_used, **DR_PARAMS)
    start = jam_idx + window  # D-07: magnetic-only segment from the first full window
    if start >= n:
        raise ValueError(f"line {line_id}: {n} samples is too short (jam {jam_idx} + window {window})")

    dr_x = np.concatenate([tx[:jam_idx], dr.x])
    dr_y = np.concatenate([ty[:jam_idx], dr.y])
    dr_row = {"line": line_id, "sensor": "-", "denoiser": "dead_reckoning",
              "signal_err_std_nT": None, "signal_rmse_nT": None,
              "accepted": None, "windows": None}  # fmt: skip
    dr_row.update(position_metrics(dr_x, dr_y, tx, ty, start))
    return {
        "line": line_id,
        "map_file": map_path,
        "sens": sens,
        "truth": truth,
        "tile": tile,
        "n": n,
        "jam_idx": jam_idx,
        "tx": tx,
        "ty": ty,
        "fix_xy": fix_xy,
        "dr": dr,
        "start": start,
        "dr_x": dr_x,
        "dr_y": dr_y,
        "dr_row": dr_row,
        "seed_used": seed_used,
    }


def score_result(ctx: dict, mag_key: str, name: str, cleaned, sig, nav) -> dict:
    """Results entry for one sensor/denoiser: GPS-aided lead-in + nav track, metrics row."""
    tx, ty, jam_idx, start = ctx["tx"], ctx["ty"], ctx["jam_idx"], ctx["start"]
    ex = np.concatenate([tx[:jam_idx], nav.x])  # GPS-aided lead-in, then nav
    ey = np.concatenate([ty[:jam_idx], nav.y])
    row = {"line": ctx["line"], "sensor": mag_key, "denoiser": name}
    row.update(signal_metrics(cleaned, ctx["truth"].mag_1_c, start))
    row.update(position_metrics(ex, ey, tx, ty, start))
    row["accepted"] = int(nav.accepted.sum())
    row["windows"] = len(nav.window_end)
    return {
        "cleaned": cleaned,
        "signal": sig,
        "x": ex,
        "y": ey,
        "window_end": nav.window_end,
        "ncc": nav.ncc,
        "accepted": nav.accepted,
        "metrics": row,
    }


def line_out(ctx: dict, results: dict) -> dict:
    """run_pipeline out_lines entry (the input of artifact.line_entry)."""
    sens, truth, tile = ctx["sens"], ctx["truth"], ctx["tile"]
    return {
        "line": ctx["line"],
        "map_file": ctx["map_file"],
        "tile": tile,
        "frame": dataclasses.asdict(tile.frame),
        "n": ctx["n"],
        "jam_idx": ctx["jam_idx"],
        "jam_t": float(sens.t[ctx["jam_idx"]]),
        "metric_start": ctx["start"],
        "t": sens.t,
        "truth_x": ctx["tx"],
        "truth_y": ctx["ty"],
        "truth_anomaly": truth.mag_1_c - sens.igrf - sens.diurnal,
        "dr_x": ctx["dr_x"],
        "dr_y": ctx["dr_y"],
        "dr_metrics": ctx["dr_row"],
        "results": results,
    }


def run_pipeline(
    backend=None, sensors=SENSORS, lines=("1003.02", "1007.06"), truncate=None, seed=SEED
) -> dict:
    """backend: injected device for the quantum slot (the stub never submits a job)."""
    cal_sensors, cal_truth = load_line(FLT1006_LINE08)
    cal_target = cal_truth.mag_1_c  # bare array: the only truth a denoiser ever sees

    fitted, selection = {}, {}
    for mag_key in sensors:
        # D-19: fluxgate + lambda by blocked CV on the calibration line only
        fitted[mag_key], selection[mag_key] = fit_sensor(cal_sensors, cal_target, mag_key, backend)
    tl_config, krr_config, quantum_config = {}, {}, {}
    for mag_key in sensors:
        krr = fitted[mag_key]["krr"].model
        krr_config[mag_key] = {
            "gamma": krr.gamma,
            "lambda": krr.lam,
            "n_train": krr.n_train,
            "features": KRR_FEATURES,
            "fluxgate": selection[mag_key]["fluxgate"],
            "target": KRR_TARGET + " " + CAL_LINE,
            "selection": f"{KRR_CV_BLOCKS}-block CV on {CAL_LINE} only",
            "cv_rmse_nT": krr.cv_rmse,
        }
        quantum_config[mag_key] = fitted[mag_key]["quantum"].model.provenance
        tl, tlc = fitted[mag_key]["tl"], fitted[mag_key]["tl_currents"]
        sel = selection[mag_key]
        tl_config[mag_key] = {
            "fluxgate": tl.fluxgate,
            "terms": TL_TERMS,
            "band_hz": list(TL_BAND_HZ),
            "lambda": tl.lam,
            "cal_line": CAL_LINE,
            "selection": {
                "method": "D-19 blocked CV on the calibration line only",
                "n_blocks": sel["n_blocks"],
                "score": sel["score"],
                "cv_rmse_nT": sel["cv_rmse_nT"],
                "cv_table": sel["cv_table"],
            },
            "tl_currents": {
                "fluxgate": tlc.fluxgate,
                "currents": list(tlc.current_names),
                "lambda": tlc.lam,
                "cv_rmse_nT": tlc.cv["cv_rmse_nT"],
            },
        }

    out_lines: dict = {}
    rows: list = []
    bias_signs: dict = {}
    line_seeds: dict = {}
    for line_id in lines:
        ctx = prepare_line(line_id, seed=seed, truncate=truncate)
        line_seeds[line_id] = ctx["seed_used"]
        bias_signs[line_id] = ctx["dr"].bias_signs
        rows.append(ctx["dr_row"])

        results: dict = {}
        for mag_key in sensors:
            results[mag_key] = {}
            for name, den in fitted[mag_key].items():
                cleaned = den.predict(ctx["sens"])
                sig = anomaly_signal(cleaned, ctx["sens"])
                nav = tercom(sig, ctx["dr"], ctx["jam_idx"], ctx["fix_xy"], ctx["tile"], **TERCOM_PARAMS)
                entry = score_result(ctx, mag_key, name, cleaned, sig, nav)
                rows.append(entry["metrics"])
                results[mag_key][name] = entry

        out_lines[line_id] = line_out(ctx, results)

    config = {
        "seed": int(seed),
        "jam_fraction": JAM_FRACTION,
        "cal_line": CAL_LINE,
        "fs_hz": float(cal_sensors.fs),
        "sensors": list(sensors),
        "default_sensor": DEFAULT_SENSOR,
        "thresholds_m": list(THRESHOLDS_M),
        "tercom": dict(TERCOM_PARAMS, prior="recursive_ins_propagated"),
        "dr": dict(DR_PARAMS, seed=int(seed), line_seeds=line_seeds, bias_signs=bias_signs),
        "tl": tl_config,
        "krr": krr_config,
        "quantum": quantum_config,
        "truncate": truncate,
    }
    return {"config": config, "lines": out_lines, "metrics_table": rows}

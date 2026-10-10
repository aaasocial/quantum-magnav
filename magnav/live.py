"""Chunked live run of one held-out line x one sensor (D-14), driven by magnav.api.live_*.

This is an orchestrator like pipeline.py: it may touch Truth (through pipeline.prepare_line
and score_result) to score the run, so it is not in the truth-guard list. It never submits
a quantum job (D-16): denoisers are built with backend=None and the quantum slot is the stub.

The work is split so no single call blocks the page for long (Pyodide shares the page's
main thread):
  start()  stage 1: allowlist check, load calibration + held-out line, jam, DR.
  step()   stage 2: first call runs select_tl_config + build_denoisers only ("select"),
           each later call fits exactly ONE denoiser of LIVE_FIT and computes its signal.
           stage 3: advances one TERCOM generator per LIVE_ORDER entry for ~budget_ms.
  result() assembles one artifact lines[i] entry with the pipeline's own helpers, so the
           numbers equal the precomputed artifact's by construction.
Module state persists between calls; one run at a time (a new start discards the old one).
"""

import time

import numpy as np

from magnav import artifact, pipeline
from magnav.data import FLT1006_LINE08, load_line
from magnav.nav import anomaly_signal, tercom_steps

LIVE_ORDER = ("tl", "raw", "lowpass")  # tl first: the hero series
LIVE_FIT = ("raw", "lowpass", "tl", "quantum")  # KRR and tl_currents skipped for time (D-14)
SKIPPABLE = ("raw", "lowpass")
BUDGET_MIN_MS = 50
BUDGET_MAX_MS = 2000
RESULT_ORDER = ("raw", "lowpass", "tl", "quantum")  # artifact DENOISERS order, minus krr/tl_currents

_STATE: dict = {}


def clamp_budget(budget_ms) -> int:
    return max(BUDGET_MIN_MS, min(BUDGET_MAX_MS, int(budget_ms)))


def current_stage():
    """Stage of the run in progress (for failure reports), or None."""
    if not _STATE:
        return None
    return 3 if _STATE["phase"] in ("tercom", "done") else 2


def _require():
    if not _STATE:
        raise RuntimeError("No live run in progress: call live_start first")
    return _STATE


def _elapsed(st) -> float:
    return round(time.perf_counter() - st["t0"], 3)


def start(line_id, sensor, simulate_failure=False) -> dict:
    """Stage 1. Allowlist first (before any file access), then load and jam the line."""
    _STATE.clear()
    line_id, sensor = str(line_id), str(sensor)
    if line_id not in pipeline.HELD_OUT:
        raise ValueError(f"unknown line {line_id[:40]!r}; expected one of {sorted(pipeline.HELD_OUT)}")
    if sensor not in pipeline.SENSORS:
        raise ValueError(f"unknown sensor {sensor[:40]!r}; expected one of {list(pipeline.SENSORS)}")
    if simulate_failure:
        raise RuntimeError("Simulated failure (demo of the fallback)")
    t0 = time.perf_counter()
    cal_sensors, cal_truth = load_line(FLT1006_LINE08)
    ctx = pipeline.prepare_line(line_id)
    w, s = pipeline.TERCOM_PARAMS["window"], pipeline.TERCOM_PARAMS["stride"]
    first = ctx["jam_idx"] + w
    windows_total = (ctx["n"] - first) // s + 1 if first <= ctx["n"] else 0
    _STATE.update(
        line_id=line_id,
        sensor=sensor,
        t0=t0,
        ctx=ctx,
        cal_sensors=cal_sensors,
        cal_target=cal_truth.mag_1_c,  # bare array, as in run_pipeline
        phase="select",
        dens=None,
        fits_done=0,
        cleaned={},
        signal={},
        gens={},
        run_order=[],
        current=0,
        progress={},
        navs={},
        skipped=[],
        windows_total=windows_total,
    )
    return {
        "ok": True,
        "stage": 1,
        "line": line_id,
        "sensor": sensor,
        "windows_total": windows_total,
        "order": list(LIVE_ORDER),
    }


def _progress(st, fitting=None) -> dict:
    total = st["windows_total"]
    done = st["phase"] == "done"
    name = None
    if st["phase"] == "tercom" and st["current"] < len(st["run_order"]):
        name = st["run_order"][st["current"]]
    return {
        "ok": True,
        "stage": 3 if st["phase"] in ("tercom", "done") else 2,
        "fitting": fitting,
        "fits_done": st["fits_done"],
        "fits_total": len(LIVE_FIT) + 1,
        "denoiser": name,
        "windows_done": total if done else (st["progress"].get(name, 0) if name else 0),
        "windows_total": total,
        "per_denoiser": {d: [st["progress"].get(d, 0), total] for d in st["run_order"]},
        "elapsed_s": _elapsed(st),
        "done": done,
        "skipped": list(st["skipped"]),
    }


def _create_generators(st):
    ctx = st["ctx"]
    order = [d for d in LIVE_ORDER if d not in st["skipped"]]
    if not np.array_equal(st["cleaned"]["quantum"], st["cleaned"]["tl"]):
        order.append("quantum")  # Phase 4: a real quantum correction needs its own TERCOM
    for d in order:
        st["gens"][d] = tercom_steps(
            st["signal"][d], ctx["dr"], ctx["jam_idx"], ctx["fix_xy"], ctx["tile"], **pipeline.TERCOM_PARAMS
        )
        st["progress"][d] = 0
    st["run_order"] = order
    st["current"] = 0
    st["phase"] = "tercom"


def _advance(st, deadline):
    while st["current"] < len(st["run_order"]):
        name = st["run_order"][st["current"]]
        try:
            st["progress"][name] = next(st["gens"][name])
        except StopIteration as stop:
            st["navs"][name] = stop.value
            st["progress"][name] = len(stop.value.window_end)
            del st["gens"][name]
            st["current"] += 1
        if time.perf_counter() >= deadline:
            break
    if st["current"] >= len(st["run_order"]):
        st["phase"] = "done"


def step(budget_ms=250) -> dict:
    """One bounded chunk of stage 2 or 3; returns the progress shape."""
    st = _require()
    budget = clamp_budget(budget_ms)
    deadline = time.perf_counter() + budget / 1000.0
    if st["phase"] == "select":
        st["dens"], _ = pipeline.select_and_build(st["cal_sensors"], st["cal_target"], st["sensor"], backend=None)
        st["phase"] = "fit"
        st["fits_done"] = 1
        return _progress(st, fitting="select")
    if st["phase"] == "fit":
        k = st["fits_done"] - 1
        if k < len(LIVE_FIT):
            name = LIVE_FIT[k]
            den = st["dens"][name].fit(st["cal_sensors"], st["cal_target"])
            cleaned = den.predict(st["ctx"]["sens"])
            st["cleaned"][name] = cleaned
            st["signal"][name] = anomaly_signal(cleaned, st["ctx"]["sens"])
            st["fits_done"] += 1
            return _progress(st, fitting=name)
        _create_generators(st)
    if st["phase"] == "tercom":
        _advance(st, deadline)
    return _progress(st)


def skip(denoiser) -> dict:
    """Drop raw or lowpass (never tl) before it finishes."""
    st = _require()
    denoiser = str(denoiser)
    if denoiser not in SKIPPABLE:
        raise ValueError(f"only {list(SKIPPABLE)} can be skipped, not {denoiser[:40]!r}")
    if denoiser in st["navs"]:
        raise ValueError(f"{denoiser} already finished")
    if denoiser not in st["skipped"]:
        st["skipped"].append(denoiser)
        if denoiser in st["run_order"]:
            i = st["run_order"].index(denoiser)
            st["run_order"].pop(i)
            st["gens"].pop(denoiser, None)
            st["progress"].pop(denoiser, None)
            if i < st["current"]:
                st["current"] -= 1
            if st["phase"] == "tercom" and st["current"] >= len(st["run_order"]):
                st["phase"] = "done"
    return {"ok": True, "skipped": list(st["skipped"])}


_skip = skip  # run_line's `skip` parameter shadows the function


def result() -> dict:
    """Assemble one artifact lines[i] entry for the chosen sensor (cheap: no TERCOM here)."""
    st = _require()
    if st["phase"] != "done":
        raise RuntimeError("Live run not finished: call live_step until done")
    ctx, sensor, navs = st["ctx"], st["sensor"], dict(st["navs"])
    if "quantum" not in navs:
        navs["quantum"] = navs["tl"]  # stub: cleaned quantum == cleaned tl, same TERCOM result
    results = {}
    for name in RESULT_ORDER:
        if name in st["skipped"]:
            continue
        results[name] = pipeline.score_result(ctx, sensor, name, st["cleaned"][name], st["signal"][name], navs[name])
    L = pipeline.line_out(ctx, {sensor: results})
    entry = artifact._clean(artifact.line_entry(st["line_id"], L))
    out = {
        "ok": True,
        "line_id": st["line_id"],
        "sensor": sensor,
        "computed": list(results),
        "skipped": list(st["skipped"]),
        "elapsed_s": _elapsed(st),
        "line": entry,
    }
    _STATE.clear()
    return out


def cancel() -> dict:
    _STATE.clear()
    return {"ok": True}


def run_line(line_id, sensor, skip=()) -> dict:
    """Python-only convenience: start, skip, step until done, result."""
    start(line_id, sensor)
    for d in skip:
        _skip(d)
    while not step(BUDGET_MAX_MS)["done"]:
        pass
    return result()

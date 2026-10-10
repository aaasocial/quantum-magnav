"""Simulated INS drift and TERCOM-style windowed map matching.

Nothing here accepts truth: the navigator sees the anomaly signal derived from Sensors,
the dead-reckoning track, the map tile, and the last GPS fix as a plain (x, y) tuple.
"""

from collections.abc import Generator
from dataclasses import dataclass

import numpy as np

from magnav.data import MapTile, Sensors


@dataclass(frozen=True)
class DRResult:
    """Dead-reckoning track from the jam index onward (index 0 == jam_idx == fix)."""

    x: np.ndarray
    y: np.ndarray
    bias_mps: float
    bias_signs: list
    rw_sigma: float
    seed: int


@dataclass(frozen=True)
class NavResult:
    """Per-sample navigation track (aligned with DRResult) plus per-window diagnostics."""

    x: np.ndarray
    y: np.ndarray
    window_end: np.ndarray  # absolute exclusive end index of each window
    ncc: np.ndarray  # best normalised correlation per window
    accepted: np.ndarray  # bool: best ncc passed the gate
    est_x: np.ndarray  # raw per-window estimate at sample window_end - 1 (before median)
    est_y: np.ndarray


def simulate_dr(
    sensors: Sensors,
    jam_idx: int,
    fix_xy: tuple,
    seed: int = 0,
    bias_mps: float = 0.3,
    rw_sigma: float = 0.05,
) -> DRResult:
    """Integrate INS velocities from the last fix with a velocity bias and random walk.

    East velocity is -ins_vw (the dataset stores west velocity); north is ins_vn.
    RNG draws happen in a fixed order: bias signs first, then the random walk.
    """
    n = sensors.n
    j = int(jam_idx)
    m = n - j
    dt = 1.0 / sensors.fs
    rng = np.random.default_rng(seed)
    signs = rng.choice([-1, 1], 2)
    rw = np.cumsum(rng.normal(0.0, rw_sigma * np.sqrt(dt), (m, 2)), axis=0)
    ve = -sensors.ins_vw[j:] + bias_mps * signs[0] + rw[:, 0]
    vn = sensors.ins_vn[j:] + bias_mps * signs[1] + rw[:, 1]
    x = np.empty(m)
    y = np.empty(m)
    x[0], y[0] = float(fix_xy[0]), float(fix_xy[1])
    x[1:] = x[0] + np.cumsum(ve[:-1] * dt)
    y[1:] = y[0] + np.cumsum(vn[:-1] * dt)
    return DRResult(
        x=x,
        y=y,
        bias_mps=float(bias_mps),
        bias_signs=[int(s) for s in signs],
        rw_sigma=float(rw_sigma),
        seed=int(seed),
    )


def anomaly_signal(cleaned: np.ndarray, sensors: Sensors) -> np.ndarray:
    """Map-matching signal: cleaned total field minus IGRF model and diurnal."""
    return np.asarray(cleaned, dtype=np.float64) - sensors.igrf - sensors.diurnal


def _offsets(half_width_m: float, step_m: float):
    off = np.arange(-half_width_m, half_width_m + 1e-9, step_m)
    ox, oy = np.meshgrid(off, off)
    return ox.ravel(), oy.ravel()


def match_window(tile: MapTile, s_win, px, py, rx, ry, ox, oy):
    """Best NCC offset for one window. Candidates touching invalid cells score -inf."""
    X = px + ox[:, None] + rx[None, :]
    Y = py + oy[:, None] + ry[None, :]
    mv, ok = tile.sample(X, Y)
    w = s_win - s_win.mean()
    mc = mv - mv.mean(axis=1, keepdims=True)
    ncc = (mc @ w) / (np.linalg.norm(mc, axis=1) * np.linalg.norm(w) + 1e-9)
    ncc[~ok.all(axis=1)] = -np.inf
    k = int(np.argmax(ncc))
    return float(ox[k]), float(oy[k]), float(ncc[k])


def tercom_steps(
    signal: np.ndarray,
    dr: DRResult,
    jam_idx: int,
    fix_xy: tuple,
    tile: MapTile,
    window: int = 120,
    stride: int = 20,
    half_width_m: float = 1500.0,
    step_m: float = 60.0,
    gate: float = 0.85,
    median: int = 3,
) -> Generator[int, None, NavResult]:
    """Resumable tercom(): same arguments, yields the number of windows done after each window.

    Drained with next() until StopIteration, StopIteration.value is the NavResult that
    tercom(...) returns. Lets the live API spread TERCOM over short calls.
    """
    signal = np.asarray(signal, dtype=np.float64)
    n = len(signal)
    j = int(jam_idx)
    dx_, dy_ = dr.x, dr.y
    assert len(dx_) == n - j, "DR track must cover jam_idx..n-1"
    ox, oy = _offsets(half_width_m, step_m)

    ends, nccs, acc, est_x, est_y, out_x, out_y = [], [], [], [], [], [], []
    ex, ey = float(fix_xy[0]), float(fix_xy[1])
    ref = 0  # DR-local index of the current raw estimate (jam fix at index 0)
    e = j + window
    while e <= n:
        last = e - 1 - j  # DR-local index of the window's last sample
        px = ex + (dx_[last] - dx_[ref])
        py = ey + (dy_[last] - dy_[ref])
        lo = e - window - j
        rx = dx_[lo : last + 1] - dx_[last]
        ry = dy_[lo : last + 1] - dy_[last]
        bx, by, c = match_window(tile, signal[e - window : e], px, py, rx, ry, ox, oy)
        ok = c >= gate
        ex, ey = (px + bx, py + by) if ok else (px, py)
        ref = last
        ends.append(e)
        nccs.append(c)
        acc.append(ok)
        est_x.append(ex)
        est_y.append(ey)
        # causal median of the last `median` raw estimates, propagated to this time
        k0 = max(0, len(ends) - median)
        hx = [est_x[i] + dx_[last] - dx_[ends[i] - 1 - j] for i in range(k0, len(ends))]
        hy = [est_y[i] + dy_[last] - dy_[ends[i] - 1 - j] for i in range(k0, len(ends))]
        out_x.append(float(np.median(hx)))
        out_y.append(float(np.median(hy)))
        e += stride
        yield len(ends)  # windows done so far

    x = dx_.copy()
    y = dy_.copy()
    for i, end in enumerate(ends):
        a = end - 1 - j
        b = (ends[i + 1] - 1 - j) if i + 1 < len(ends) else n - j
        x[a:b] = out_x[i] + (dx_[a:b] - dx_[a])
        y[a:b] = out_y[i] + (dy_[a:b] - dy_[a])
    return NavResult(
        x=x,
        y=y,
        window_end=np.asarray(ends, dtype=np.int64),
        ncc=np.asarray(nccs, dtype=np.float64),
        accepted=np.asarray(acc, dtype=bool),
        est_x=np.asarray(est_x, dtype=np.float64),
        est_y=np.asarray(est_y, dtype=np.float64),
    )


def tercom(
    signal: np.ndarray,
    dr: DRResult,
    jam_idx: int,
    fix_xy: tuple,
    tile: MapTile,
    window: int = 120,
    stride: int = 20,
    half_width_m: float = 1500.0,
    step_m: float = 60.0,
    gate: float = 0.85,
    median: int = 3,
) -> NavResult:
    """Gated TERCOM with a recursive INS-propagated prior.

    For each window ending at e (exclusive): prior p = last raw estimate + DR movement
    since then (initialised at the jam fix); search a square of +/- half_width_m around
    p on a step_m grid; accept the best NCC offset only if it reaches `gate`, otherwise
    coast on p. The output is a causal median over the last `median` raw estimates, each
    propagated to the current window end by DR increments; the median is output-only and
    never fed back into the prior.
    """
    gen = tercom_steps(signal, dr, jam_idx, fix_xy, tile, window, stride, half_width_m, step_m, gate, median)
    while True:
        try:
            next(gen)
        except StopIteration as stop:
            return stop.value

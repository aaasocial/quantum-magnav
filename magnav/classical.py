"""Classical denoisers for a cabin magnetometer.

Protocol (shared with the later TL / KRR / quantum denoisers):
    fit(cal: Sensors, target: np.ndarray) -> self   # target = calibration-line truth array
    predict(sensors: Sensors) -> np.ndarray         # absolute nT, calibration bias removed
    name: str
Denoisers never see Truth: the orchestrator passes the calibration target as a bare array.
"""

import numpy as np
from scipy import signal

from magnav.data import Sensors
from magnav.quantum import QuantumDenoiser


class RawDenoiser:
    """No compensation: the cabin magnetometer minus its calibration-line offset."""

    name = "raw"

    def __init__(self, mag_key: str):
        self.mag_key = mag_key
        self.bias = 0.0

    def _clean(self, sensors: Sensors) -> np.ndarray:
        return np.asarray(sensors.mag[self.mag_key], dtype=np.float64)

    def fit(self, cal: Sensors, target: np.ndarray):
        self.bias = float(np.mean(self._clean(cal) - np.asarray(target, dtype=np.float64)))
        return self

    def predict(self, sensors: Sensors) -> np.ndarray:
        return self._clean(sensors) - self.bias


class LowPassDenoiser(RawDenoiser):
    """Naive floor (D-12): zero-phase Butterworth low-pass on the cabin magnetometer."""

    name = "lowpass"

    def __init__(self, mag_key: str, cutoff_hz: float = 0.05, order: int = 4):
        super().__init__(mag_key)
        self.cutoff_hz = float(cutoff_hz)
        self.order = int(order)

    def _clean(self, sensors: Sensors) -> np.ndarray:
        x = np.asarray(sensors.mag[self.mag_key], dtype=np.float64)
        sos = signal.butter(self.order, self.cutoff_hz, btype="low", fs=sensors.fs, output="sos")
        mu = float(x.mean())  # filter the deviation so the ~53,000 nT level adds no edge transient
        return signal.sosfiltfilt(sos, x - mu) + mu


# ---------------------------------------------------------------------------
# Tolles-Lawson (numpy/scipy port of MagNav.jl create_TL_A / create_TL_coef)
# ---------------------------------------------------------------------------

BT_SCALE = 50000.0
FLUXGATE = "flux_a"  # MagNav.jl default use_vec; only a fallback, the pipeline selects per sensor (D-19)
TL_BAND_HZ = (0.1, 0.9)
TL_TRIM = 4  # MagNav trims 20 samples at 10 Hz -> 4 at 2 Hz
TL_TERMS = 18
LAMBDA_GRID = (1e-4, 1e-3, 1e-2, 1e-1, 1.0, 10.0, 100.0)
_EPS = 1e-12


def fdm(x: np.ndarray) -> np.ndarray:
    """Per-sample central difference (not divided by dt), one-sided at the ends."""
    x = np.asarray(x, dtype=np.float64)
    d = np.empty_like(x)
    d[1:-1] = (x[2:] - x[:-2]) / 2.0
    d[0] = x[1] - x[0]
    d[-1] = x[-1] - x[-2]
    return d


def tl_A(bx, by, bz) -> np.ndarray:
    """18-term Tolles-Lawson A matrix: 3 permanent, 6 induced, 9 eddy-current columns."""
    bx, by, bz = (np.asarray(v, dtype=np.float64) for v in (bx, by, bz))
    bt = np.sqrt(bx**2 + by**2 + bz**2)
    X, Y, Z = bx / bt, by / bt, bz / bt
    dx, dy, dz = fdm(bx), fdm(by), fdm(bz)
    s = BT_SCALE
    cols = [X, Y, Z, X * bx / s, X * by / s, X * bz / s, Y * by / s, Y * bz / s, Z * bz / s]
    cols += [h * d / s for h in (X, Y, Z) for d in (dx, dy, dz)]
    return np.column_stack(cols)


def bpf(x, fs: float, lo: float = TL_BAND_HZ[0], hi: float = TL_BAND_HZ[1], order: int = 4) -> np.ndarray:
    """Zero-phase Butterworth bandpass (sos form, sosfiltfilt) along axis 0."""
    sos = signal.butter(order, [lo, hi], btype="band", fs=fs, output="sos")
    return signal.sosfiltfilt(sos, np.asarray(x, dtype=np.float64), axis=0)


def ridge(A: np.ndarray, y: np.ndarray, lam: float) -> np.ndarray:
    """Ridge regression coefficients (A^T A + lam I)^-1 A^T y."""
    return np.linalg.solve(A.T @ A + lam * np.eye(A.shape[1]), A.T @ y)


def _col_scale(A: np.ndarray) -> np.ndarray:
    sd = A.std(axis=0)
    return np.where(sd > _EPS, sd, 1.0)


# ---------------------------------------------------------------------------
# D-19: per-sensor fluxgate + lambda by blocked CV on the calibration line only
# ---------------------------------------------------------------------------

FLUXGATES = ("flux_a", "flux_b", "flux_c", "flux_d")
CV_BLOCKS = 5
CV_SCORE = "full-band out-of-block RMSE (nT) of compensated cabin mag vs calibration truth, bias fitted on training blocks"


def _tl_design(cal: Sensors, fluxgate: str, current_names=()) -> np.ndarray:
    f = cal.flux
    A = tl_A(f[f"{fluxgate}_x"], f[f"{fluxgate}_y"], f[f"{fluxgate}_z"])
    if current_names:
        cur = np.column_stack([np.asarray(cal.cur[c], dtype=np.float64) for c in current_names])
        A = np.hstack([A, cur])
    return A


def _compensate(mag: np.ndarray, A: np.ndarray, coef: np.ndarray, fs: float) -> np.ndarray:
    """mag minus the TL contribution (full band) minus the current contribution, bandpassed.

    Columns beyond TL_TERMS are current regressors. They are fitted in the TL band, so
    their contribution is applied in the same band (RESEARCH Pitfall 5): steps and DC
    shifts in the currents, outside the band the fit constrains, are not subtracted.
    """
    comp = mag - A[:, :TL_TERMS] @ coef[:TL_TERMS]
    if A.shape[1] > TL_TERMS:
        comp = comp - bpf(A[:, TL_TERMS:] @ coef[TL_TERMS:], fs)
    return comp


def _segments(mask: np.ndarray) -> list:
    """Contiguous True runs of a boolean mask as (start, stop) pairs."""
    idx = np.flatnonzero(np.diff(np.concatenate([[0], mask.astype(np.int8), [0]])))
    return list(zip(idx[::2], idx[1::2]))


def _cv_scores(A: np.ndarray, mag: np.ndarray, target: np.ndarray, fs: float, grid, n_blocks: int) -> dict:
    """Out-of-block full-band RMSE per lambda for one design matrix (all arrays from one line)."""
    n = len(mag)
    edges = np.linspace(0, n, n_blocks + 1).astype(int)
    sq = {float(lam): 0.0 for lam in grid}
    count = 0
    for k in range(n_blocks):
        test = np.zeros(n, dtype=bool)
        test[edges[k] : edges[k + 1]] = True
        A_parts, y_parts = [], []
        for a, b in _segments(~test):  # bandpass each contiguous training segment on its own
            if b - a <= 2 * TL_TRIM + 30:
                continue
            A_parts.append(bpf(A[a:b], fs)[TL_TRIM : b - a - TL_TRIM])
            y_parts.append(bpf(mag[a:b], fs)[TL_TRIM : b - a - TL_TRIM])
        A_f, y_f = np.vstack(A_parts), np.concatenate(y_parts)
        sd = _col_scale(A_f)
        train = ~test
        for lam in grid:
            coef = ridge(A_f / sd, y_f, lam) / sd
            comp = _compensate(mag, A, coef, fs)
            bias = float(np.mean(comp[train] - target[train]))
            err = comp[test] - bias - target[test]
            sq[float(lam)] += float(np.sum(err * err))
        count += int(test.sum())
    return {lam: float(np.sqrt(v / count)) for lam, v in sq.items()}


def select_tl_config(
    cal: Sensors,
    cal_target: np.ndarray,
    mag_key: str,
    fluxgates=FLUXGATES,
    grid=LAMBDA_GRID,
    current_names=(),
    n_blocks: int = CV_BLOCKS,
) -> dict:
    """D-19: choose (fluxgate, lambda) jointly by blocked CV on ONE calibration line.

    `cal` / `cal_target` must be the calibration line (1006.08) and its truth array; the
    function sees no other data. Score: CV_SCORE. Ties break to the earlier fluxgate,
    then the smaller lambda.
    """
    mag = np.asarray(cal.mag[mag_key], dtype=np.float64)
    target = np.asarray(cal_target, dtype=np.float64)
    table = {}
    best = (None, None, np.inf)
    for fg in fluxgates:
        scores = _cv_scores(_tl_design(cal, fg, current_names), mag, target, cal.fs, grid, n_blocks)
        table[fg] = scores
        for lam in grid:
            if scores[float(lam)] < best[2]:
                best = (fg, float(lam), scores[float(lam)])
    return {
        "fluxgate": best[0],
        "lambda": best[1],
        "cv_rmse_nT": best[2],
        "cv_table": {fg: {f"{lam:g}": s for lam, s in sc.items()} for fg, sc in table.items()},
        "n_blocks": int(n_blocks),
        "score": CV_SCORE,
        "cal_line": cal.line,
    }


class TLDenoiser:
    """Tolles-Lawson compensation of one cabin magnetometer from one fluxgate (BASE-01).

    With n_currents > 0 the n largest-std current channels of the calibration line are
    appended as extra regressors (D-10, "tl_currents"); their contribution is bandpassed
    to the TL band at fit and apply time (see _compensate). With lam=None the ridge lambda is
    chosen at fit time by the D-19 blocked CV on the calibration arrays (fluxgate fixed).
    """

    def __init__(self, mag_key: str, fluxgate: str = FLUXGATE, n_currents: int = 0, lam: float | None = None):
        self.mag_key = mag_key
        self.fluxgate = fluxgate
        self.n_currents = int(n_currents)
        self.lam_fixed = None if lam is None else float(lam)
        self.cv = None
        self.name = "tl" if self.n_currents == 0 else "tl_currents"
        self.current_names: tuple = ()
        self.coef = None
        self.lam = None
        self.bias = 0.0

    def _A(self, sensors: Sensors) -> np.ndarray:
        return _tl_design(sensors, self.fluxgate, self.current_names)

    def fit(self, cal: Sensors, target: np.ndarray):
        if self.n_currents:
            stds = {k: float(np.std(v)) for k, v in cal.cur.items()}
            self.current_names = tuple(sorted(stds, key=lambda k: -stds[k])[: self.n_currents])
        mag = np.asarray(cal.mag[self.mag_key], dtype=np.float64)
        A = self._A(cal)
        trim = slice(TL_TRIM, len(mag) - TL_TRIM)
        A_f = bpf(A, cal.fs)[trim]
        y_f = bpf(mag, cal.fs)[trim]  # classic TL target (MagNav y_type :e); bandpass removes DC
        if self.lam_fixed is None:
            self.cv = select_tl_config(cal, target, self.mag_key, fluxgates=(self.fluxgate,), current_names=self.current_names)
            self.lam = self.cv["lambda"]
        else:
            self.lam = self.lam_fixed
        sd = _col_scale(A_f)
        self.coef = ridge(A_f / sd, y_f, self.lam) / sd
        comp = _compensate(mag, A, self.coef, cal.fs)
        self.bias = float(np.mean(comp - np.asarray(target, dtype=np.float64)))
        return self

    def predict(self, sensors: Sensors) -> np.ndarray:
        mag = np.asarray(sensors.mag[self.mag_key], dtype=np.float64)
        return _compensate(mag, self._A(sensors), self.coef, sensors.fs) - self.bias


# ---------------------------------------------------------------------------
# Equal-feature RBF kernel ridge on the TL residual (BASE-02, D-11)
# ---------------------------------------------------------------------------

KRR_CURRENTS = ("cur_outpwr", "cur_acpwr", "cur_heat", "cur_ac_hi")
KRR_FEATURES = 22
KRR_GAMMA_FACTORS = (0.25, 1.0, 4.0)
KRR_LAMBDA_GRID = (1e-2, 1e-1, 1.0, 10.0, 100.0)  # 100 lets the CV shrink toward zero correction
KRR_CV_BLOCKS = 5
KRR_CHUNK = 1000
KRR_TARGET = "full-band TL residual (TL output minus mag_1_c) on the calibration line"


def kernel_features(sensors: Sensors, fluxgate: str = FLUXGATE, current_names=KRR_CURRENTS) -> np.ndarray:
    """Per-sample (n, 22) features shared by KRR and the quantum slot.

    Columns 0-8: the 3 permanent + 6 induced TL direction-cosine terms; 9-17: their fdm
    derivatives; 18-21: the D-10 currents. No history window. Phase 4's quantum feature
    map consumes exactly this function.
    """
    f = sensors.flux
    A9 = tl_A(f[f"{fluxgate}_x"], f[f"{fluxgate}_y"], f[f"{fluxgate}_z"])[:, :9]
    dA9 = np.column_stack([fdm(A9[:, j]) for j in range(9)])
    cur = np.column_stack([np.asarray(sensors.cur[c], dtype=np.float64) for c in current_names])
    return np.hstack([A9, dA9, cur])


def _sqdist(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    d2 = (a * a).sum(1)[:, None] + (b * b).sum(1)[None, :] - 2.0 * a @ b.T
    return np.maximum(d2, 0.0)


def rbf(a: np.ndarray, b: np.ndarray, gamma: float) -> np.ndarray:
    return np.exp(-gamma * _sqdist(a, b))


def krr_fit(Z: np.ndarray, y: np.ndarray, gamma: float, lam: float) -> np.ndarray:
    return np.linalg.solve(rbf(Z, Z, gamma) + lam * np.eye(len(Z)), y)


def krr_predict(Zt: np.ndarray, Z: np.ndarray, alpha: np.ndarray, gamma: float, chunk: int = KRR_CHUNK) -> np.ndarray:
    """Row-chunked prediction so the held-out kernel never exceeds chunk x n_train."""
    if len(Zt) == 0:
        return np.zeros(0)
    return np.concatenate([rbf(Zt[i : i + chunk], Z, gamma) @ alpha for i in range(0, len(Zt), chunk)])


def _blocked_cv_rmse(Z: np.ndarray, y: np.ndarray, gamma: float, lam: float, n_blocks: int) -> float:
    """Out-of-block RMSE of KRR over n_blocks contiguous time blocks of ONE line."""
    edges = np.linspace(0, len(y), n_blocks + 1).astype(int)
    sq, count = 0.0, 0
    for k in range(n_blocks):
        test = np.zeros(len(y), dtype=bool)
        test[edges[k] : edges[k + 1]] = True
        a = krr_fit(Z[~test], y[~test], gamma, lam)
        err = y[test] - krr_predict(Z[test], Z[~test], a, gamma)
        sq += float(np.sum(err * err))
        count += int(test.sum())
    return float(np.sqrt(sq / count))


class KRRResidual:
    """RBF kernel ridge residual model: fit(features, residual), predict(features) in nT.

    Features are standardised with calibration-row mean/std. gamma (median heuristic x
    {0.25, 1, 4}) and lambda are chosen by KRR_CV_BLOCKS-fold blocked CV (contiguous time
    blocks) on the training (calibration) rows only, then refitted on all of them.
    """

    name = "krr"

    def __init__(self, n_train_stride: int = 1):
        self.n_train_stride = int(n_train_stride)
        self.n_train = None
        self.gamma = None
        self.lam = None
        self.mu = None
        self.sd = None
        self._Z = None
        self._alpha = None
        self.cv_rmse = None

    def _standardise(self, features) -> np.ndarray:
        return (np.asarray(features, dtype=np.float64) - self.mu) / self.sd

    def fit(self, features, residual):
        F = np.asarray(features, dtype=np.float64)
        y_all = np.asarray(residual, dtype=np.float64)
        self.mu = F.mean(axis=0)
        sd = F.std(axis=0)
        self.sd = np.where(sd > _EPS, sd, 1.0)
        Z = self._standardise(F)[:: self.n_train_stride]
        y = y_all[:: self.n_train_stride]
        self.n_train = len(Z)
        med = float(np.median(_sqdist(Z, Z)[np.triu_indices(len(Z), k=1)]))  # median heuristic
        g0 = 1.0 / med if med > _EPS else 1.0
        best, best_err = None, np.inf
        for gf in KRR_GAMMA_FACTORS:
            for lam in KRR_LAMBDA_GRID:
                g = g0 * gf
                err = _blocked_cv_rmse(Z, y, g, float(lam), KRR_CV_BLOCKS)
                if err < best_err:
                    best, best_err = (g, float(lam)), err
        self.gamma, self.lam = best
        self.cv_rmse = best_err
        self._Z = Z
        self._alpha = krr_fit(Z, y, self.gamma, self.lam)
        return self

    def predict(self, features) -> np.ndarray:
        return krr_predict(self._standardise(features), self._Z, self._alpha, self.gamma)


class ResidualCorrected:
    """Denoiser = base denoiser minus a residual model on kernel_features.

    The residual model (KRRResidual or QuantumDenoiser) is trained on the FULL-BAND
    calibration residual of the base denoiser (KRR_TARGET), and its prediction is
    subtracted at full band, so the band it is trained on is the band it is applied in.
    TL is fitted in 0.1-0.9 Hz; the residual left after TL is mostly below 0.1 Hz, which
    is exactly what this second stage gets to model.
    """

    def __init__(self, base, model, name: str):
        self.base = base
        self.model = model
        self.name = name

    def fit(self, cal: Sensors, target: np.ndarray):
        self.base.fit(cal, target)
        r = self.base.predict(cal) - np.asarray(target, dtype=np.float64)
        self.model.fit(kernel_features(cal, self.base.fluxgate), r - r.mean())
        return self

    def predict(self, sensors: Sensors) -> np.ndarray:
        return self.base.predict(sensors) - self.model.predict(kernel_features(sensors, self.base.fluxgate))


def build_denoisers(mag_key: str, backend=None, fluxgate: str = FLUXGATE, lam: float | None = None) -> dict:
    """Ordered denoiser set for one cabin sensor (NAV-02: all share one navigator).

    `fluxgate` / `lam` come from select_tl_config on the calibration line (D-19); the same
    fluxgate feeds TL, TL+currents and the KRR/quantum kernel_features.
    """
    return {
        "raw": RawDenoiser(mag_key),
        "lowpass": LowPassDenoiser(mag_key),
        "tl": TLDenoiser(mag_key, fluxgate, lam=lam),
        "tl_currents": TLDenoiser(mag_key, fluxgate, n_currents=4),
        "krr": ResidualCorrected(TLDenoiser(mag_key, fluxgate, lam=lam), KRRResidual(), "krr"),
        "quantum": ResidualCorrected(TLDenoiser(mag_key, fluxgate, lam=lam), QuantumDenoiser(backend), "quantum"),
    }

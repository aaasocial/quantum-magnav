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
FLUXGATE = "flux_a"  # MagNav.jl default use_vec (fixed a priori, never chosen on held-out lines)
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


def select_lambda(A_f: np.ndarray, y_f: np.ndarray, grid=LAMBDA_GRID) -> float:
    """Choose the ridge lambda on the given (calibration) arrays only.

    Columns are scaled to unit std (bandpassed columns are already ~zero-mean), then a
    blocked 70/30 time split picks the lambda with the lowest validation residual std.
    """
    A_f = np.asarray(A_f, dtype=np.float64)
    y_f = np.asarray(y_f, dtype=np.float64)
    Z = A_f / _col_scale(A_f)
    k = int(0.7 * len(y_f))
    best, best_err = None, np.inf
    for lam in grid:
        c = ridge(Z[:k], y_f[:k], lam)
        err = float(np.std(y_f[k:] - Z[k:] @ c))
        if err < best_err:
            best, best_err = float(lam), err
    return best


class TLDenoiser:
    """Tolles-Lawson compensation of one cabin magnetometer from one fluxgate (BASE-01).

    With n_currents > 0 the n largest-std current channels of the calibration line are
    appended as extra regressors (D-10, "tl_currents").
    """

    def __init__(self, mag_key: str, fluxgate: str = FLUXGATE, n_currents: int = 0):
        self.mag_key = mag_key
        self.fluxgate = fluxgate
        self.n_currents = int(n_currents)
        self.name = "tl" if self.n_currents == 0 else "tl_currents"
        self.current_names: tuple = ()
        self.coef = None
        self.lam = None
        self.bias = 0.0

    def _A(self, sensors: Sensors) -> np.ndarray:
        f = sensors.flux
        g = self.fluxgate
        A = tl_A(f[f"{g}_x"], f[f"{g}_y"], f[f"{g}_z"])
        if self.current_names:
            cur = np.column_stack([np.asarray(sensors.cur[c], dtype=np.float64) for c in self.current_names])
            A = np.hstack([A, cur])
        return A

    def fit(self, cal: Sensors, target: np.ndarray):
        if self.n_currents:
            stds = {k: float(np.std(v)) for k, v in cal.cur.items()}
            self.current_names = tuple(sorted(stds, key=lambda k: -stds[k])[: self.n_currents])
        mag = np.asarray(cal.mag[self.mag_key], dtype=np.float64)
        A = self._A(cal)
        trim = slice(TL_TRIM, len(mag) - TL_TRIM)
        A_f = bpf(A, cal.fs)[trim]
        y_f = bpf(mag, cal.fs)[trim]  # classic TL target (MagNav y_type :e); bandpass removes DC
        self.lam = select_lambda(A_f, y_f)
        sd = _col_scale(A_f)
        self.coef = ridge(A_f / sd, y_f, self.lam) / sd
        self.bias = float(np.mean((mag - A @ self.coef) - np.asarray(target, dtype=np.float64)))
        return self

    def predict(self, sensors: Sensors) -> np.ndarray:
        mag = np.asarray(sensors.mag[self.mag_key], dtype=np.float64)
        return mag - self._A(sensors) @ self.coef - self.bias


def build_denoisers(mag_key: str) -> dict:
    """Ordered denoiser set for one cabin sensor."""
    return {
        "raw": RawDenoiser(mag_key),
        "lowpass": LowPassDenoiser(mag_key),
        "tl": TLDenoiser(mag_key),
        "tl_currents": TLDenoiser(mag_key, n_currents=4),
    }

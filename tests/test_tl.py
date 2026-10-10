"""Tolles-Lawson: A-matrix terms, planted-coefficient recovery, lambda selection, real data."""

import numpy as np
import pytest

from magnav.classical import (
    LAMBDA_GRID,
    TL_TRIM,
    TLDenoiser,
    bpf,
    fdm,
    ridge,
    select_lambda,
    tl_A,
)
from magnav.data import FLT1003_LINE02, FLT1006_LINE08, FLT1007_LINE06, load_line
from magnav.metrics import signal_metrics


def test_tl_A_shape_and_terms():
    rng = np.random.default_rng(1)
    bx, by, bz = (rng.normal(0, 30000, 50) for _ in range(3))
    A = tl_A(bx, by, bz)
    assert A.shape == (50, 18)
    np.testing.assert_allclose(np.linalg.norm(A[:, :3], axis=1), 1.0, rtol=1e-12)
    x = rng.normal(size=20)
    d = fdm(x)
    np.testing.assert_allclose(d[1:-1], (x[2:] - x[:-2]) / 2.0)
    assert d[0] == pytest.approx(x[1] - x[0])
    assert d[-1] == pytest.approx(x[-1] - x[-2])


def _manoeuvre(n=2000, fs=2.0):
    """Earth field rotated by in-band pitch/roll/yaw oscillations, as a body-frame fluxgate sees it."""
    t = np.arange(n) / fs
    pitch = 0.15 * np.sin(2 * np.pi * 0.21 * t) + 0.05 * np.sin(2 * np.pi * 0.47 * t)
    roll = 0.20 * np.sin(2 * np.pi * 0.33 * t + 0.4) + 0.04 * np.sin(2 * np.pi * 0.71 * t)
    yaw = 0.8 * t / t[-1] * 2 * np.pi + 0.1 * np.sin(2 * np.pi * 0.27 * t)
    bt = 53000.0 + 300.0 * np.sin(2 * np.pi * 0.37 * t)
    inc = np.deg2rad(70.0)
    e = np.array([np.cos(inc), 0.0, np.sin(inc)])
    b = np.empty((n, 3))
    for i in range(n):
        cy, sy = np.cos(yaw[i]), np.sin(yaw[i])
        cp, sp = np.cos(pitch[i]), np.sin(pitch[i])
        cr, sr = np.cos(roll[i]), np.sin(roll[i])
        rz = np.array([[cy, sy, 0], [-sy, cy, 0], [0, 0, 1]])
        ry = np.array([[cp, 0, -sp], [0, 1, 0], [sp, 0, cp]])
        rx = np.array([[1, 0, 0], [0, cr, sr], [0, -sr, cr]])
        b[i] = rx @ ry @ rz @ e * bt[i]
    return t, b


def test_tl_recovers_planted_coefficients():
    fs = 2.0
    t, b = _manoeuvre(fs=fs)
    A = tl_A(b[:, 0], b[:, 1], b[:, 2])
    rng = np.random.default_rng(7)
    planted = rng.normal(0, 50, 18)
    earth = 53000.0 + 40.0 * np.sin(2 * np.pi * 0.004 * t)  # < 0.02 Hz, outside the band
    mag = earth + A @ planted
    s = slice(TL_TRIM, -TL_TRIM)
    coef = ridge(bpf(A, fs)[s], bpf(mag, fs)[s], 1e-6)
    assert np.linalg.norm(coef - planted) / np.linalg.norm(planted) < 0.01


def test_select_lambda_uses_only_given_data():
    rng = np.random.default_rng(3)
    A = rng.normal(size=(400, 18))
    y = A @ rng.normal(size=18) + rng.normal(0, 0.5, 400)
    lam1 = select_lambda(A, y)
    lam2 = select_lambda(A.copy(), y.copy())
    assert lam1 in LAMBDA_GRID
    assert lam1 == lam2


@pytest.fixture(scope="module")
def lines():
    cal = load_line(FLT1006_LINE08)
    held = {"1003.02": load_line(FLT1003_LINE02), "1007.06": load_line(FLT1007_LINE06)}
    return cal, held


def test_real_tl_improves(lines):
    (cal_s, cal_t), held = lines
    for mag_key in ("mag_4_uc", "mag_5_uc"):
        tl = TLDenoiser(mag_key).fit(cal_s, cal_t.mag_1_c)
        assert tl.name == "tl"
        assert tl.lam in LAMBDA_GRID
        for line_id, (s, t) in held.items():
            tl_std = signal_metrics(tl.predict(s), t.mag_1_c, 0)["signal_err_std_nT"]
            raw_std = signal_metrics(s.mag[mag_key], t.mag_1_c, 0)["signal_err_std_nT"]
            if mag_key == "mag_4_uc":
                assert tl_std < 0.7 * raw_std, (line_id, tl_std, raw_std)
            else:
                assert tl_std < 40.0, (line_id, tl_std)


def test_tl_currents_columns(lines):
    (cal_s, cal_t), _ = lines
    tlc = TLDenoiser("mag_4_uc", n_currents=4).fit(cal_s, cal_t.mag_1_c)
    assert tlc.name == "tl_currents"
    assert tuple(tlc.current_names) == ("cur_outpwr", "cur_acpwr", "cur_heat", "cur_ac_hi")
    assert len(tlc.coef) == 22

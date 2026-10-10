"""Metric formulas and the low-pass denoiser on hand-built inputs."""

import numpy as np
import pytest

from magnav.classical import LowPassDenoiser, RawDenoiser
from magnav.data import Sensors
from magnav.metrics import format_metrics_table, position_metrics, signal_metrics


def test_position_metrics_known():
    err = np.arange(10) * 100.0
    m = position_metrics(err, np.zeros(10), np.zeros(10), np.zeros(10), 0)
    assert m["mean_err_m"] == pytest.approx(450.0)
    assert m["final_err_m"] == pytest.approx(900.0)
    assert m["cep50_m"] == pytest.approx(450.0)
    assert m["pct_under_556"] == pytest.approx(60.0)
    assert m["pct_under_1852"] == pytest.approx(100.0)
    assert m["pct_under_3704"] == pytest.approx(100.0)


def test_position_metrics_start():
    est = np.array([5000.0, 5000.0, 0.0, 30.0, 40.0])
    m = position_metrics(est, np.zeros(5), np.zeros(5), np.zeros(5), 2)
    assert m["mean_err_m"] == pytest.approx(70.0 / 3)
    assert m["pct_under_556"] == pytest.approx(100.0)


def test_signal_metrics_known():
    rng = np.random.default_rng(0)
    truth = 53000.0 + rng.normal(0, 50, 200_000)
    noise = rng.normal(0, 3.0, truth.size)
    m = signal_metrics(truth + 5.0 + noise, truth, 0)
    assert m["signal_rmse_nT"] == pytest.approx(np.sqrt(25 + 9), rel=0.01)
    assert m["signal_err_std_nT"] == pytest.approx(3.0, rel=0.01)


def _sensors(mag: np.ndarray, fs: float = 2.0) -> Sensors:
    n = len(mag)
    z = np.zeros(n)
    return Sensors(
        t=np.arange(n) / fs, fs=fs, line="0000.00", mag={"mag_4_uc": mag}, flux={}, cur={},
        ins_pitch=z, ins_roll=z, ins_yaw=z, ins_vn=z, ins_vw=z, ins_vu=z, igrf=z, diurnal=z,
    )  # fmt: skip


def test_lowpass_denoiser():
    t = np.arange(8000) / 2.0
    slow = 100.0 * np.sin(2 * np.pi * 0.005 * t)
    fast = 50.0 * np.sin(2 * np.pi * 0.5 * t)
    s = _sensors(53000.0 + slow + fast)
    den = LowPassDenoiser("mag_4_uc").fit(s, 53000.0 + slow + fast)
    assert den.bias == pytest.approx(0.0, abs=1.0)
    out = den.predict(s) + den.bias - 53000.0
    mid = slice(1000, -1000)
    assert np.max(np.abs(out[mid] - slow[mid])) < 0.02 * 100.0 + 0.05 * 50.0
    resid_fast = out - slow
    assert np.std(resid_fast[mid]) < 0.05 * np.std(fast)
    assert np.max(np.abs(out - slow)) < 50.0  # no edge transient on a 53,000 nT level


def test_raw_denoiser_removes_cal_bias():
    mag = np.full(100, 53100.0)
    s = _sensors(mag)
    den = RawDenoiser("mag_4_uc").fit(s, np.full(100, 53000.0))
    assert np.allclose(den.predict(s), 53000.0)


def test_format_metrics_table_handles_none():
    rows = [{"line": "1003.02", "sensor": "-", "denoiser": "dead_reckoning", "mean_err_m": 1000.0,
             "signal_err_std_nT": None, "accepted": None, "windows": None}]  # fmt: skip
    text = format_metrics_table(rows)
    assert "dead_reckoning" in text and "1000" in text and " -" in text

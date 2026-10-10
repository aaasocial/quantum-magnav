"""Thin end-to-end run on a truncated real line."""

import math

from magnav.pipeline import line_seed, run_pipeline


def test_thin_pipeline():
    res = run_pipeline(sensors=("mag_5_uc",), lines=("1003.02",), truncate=2000)
    assert res["lines"]["1003.02"]["jam_idx"] == 500
    rows = res["metrics_table"]
    names = {r["denoiser"] for r in rows}
    assert {"raw", "lowpass", "dead_reckoning"} <= names
    for r in rows:
        assert math.isfinite(r["mean_err_m"])
        assert 0.0 <= r["pct_under_556"] <= 100.0
    assert res["config"]["dr"]["bias_signs"]["1003.02"]
    assert res["config"]["seed"] == 0
    assert res["config"]["dr"]["line_seeds"] == {"1003.02": line_seed(0, "1003.02")}


def test_line_seed_per_line_and_deterministic():
    """WR-03: the held-out lines get different, reproducible DR seeds."""
    a, b = line_seed(0, "1003.02"), line_seed(0, "1007.06")
    assert a != b
    assert a == line_seed(0, "1003.02")
    assert line_seed(1, "1003.02") != a
    assert all(isinstance(v, int) and v >= 0 for v in (a, b))

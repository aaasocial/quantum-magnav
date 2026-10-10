"""Thin end-to-end run on a truncated real line."""

import math

from magnav.pipeline import run_pipeline


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

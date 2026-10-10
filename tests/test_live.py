"""Chunked live API (D-13..D-16): equivalence with the committed artifact, allowlists,
failure contract, stage-2 chunking, per-call cost, and no backend.run anywhere."""

import ast
import json
import time
from pathlib import Path

import pytest
from qiskit.providers.basic_provider import BasicSimulator

from magnav import api, live
from magnav.artifact import load_artifact

ROOT = Path(__file__).resolve().parent.parent
LINE, SENSOR = "1003.02", "mag_5_uc"


class SpySim(BasicSimulator):
    """BasicSimulator that counts run() calls (copied from test_api_smoke)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.calls = 0

    def run(self, *a, **kw):
        self.calls += 1
        return super().run(*a, **kw)


def _strict(raw: str) -> dict:
    assert isinstance(raw, str)

    def reject(constant):  # JS JSON.parse has no NaN/Infinity
        raise ValueError(constant)

    return json.loads(raw, parse_constant=reject)


@pytest.fixture(autouse=True)
def _clean_state():
    api.live_cancel(None)
    yield
    api.live_cancel(None)


@pytest.fixture(scope="module")
def committed_line():
    art = load_artifact()
    return next(L for L in art["lines"] if L["line"] == LINE)


@pytest.fixture(scope="module")
def live_tl_run():
    """One tl-only live run through the JSON API with a spy backend (shared by tests)."""
    spy = SpySim()
    api.live_cancel(spy)
    t0 = time.perf_counter()
    start = _strict(api.live_start(spy, LINE, SENSOR))
    assert start["ok"] is True, start
    assert _strict(api.live_skip(spy, "raw"))["ok"] is True
    assert _strict(api.live_skip(spy, "lowpass"))["skipped"] == ["raw", "lowpass"]
    steps = []
    while True:
        p = _strict(api.live_step(spy, 10000))
        assert p["ok"] is True, p
        steps.append(p)
        if p["done"]:
            break
    res = _strict(api.live_result(spy))
    wall = time.perf_counter() - t0
    print(f"\n[live] tl-only live run {LINE}/{SENSOR}: {wall:.2f} s wall, {len(steps)} live_step calls")
    return {"spy": spy, "start": start, "steps": steps, "result": res, "wall_s": wall}


def test_artifact_json_returns_artifact_without_backend_run():
    spy = SpySim()
    out = _strict(api.artifact_json(spy))
    assert out["ok"] is True
    assert out["artifact"]["schema_version"] == 1
    assert len(out["artifact"]["lines"]) == 2
    assert spy.calls == 0


def test_live_tl_equals_committed_artifact(live_tl_run, committed_line):
    res = live_tl_run["result"]
    assert res["ok"] is True
    assert res["line_id"] == LINE and res["sensor"] == SENSOR
    assert res["skipped"] == ["raw", "lowpass"]
    assert res["computed"] == ["tl", "quantum"]
    line = res["line"]
    est = line["estimates"][SENSOR]
    ref = committed_line["estimates"][SENSOR]
    for k in ("x", "y", "signal_nT", "window_t", "ncc", "accepted"):
        assert est["tl"][k] == ref["tl"][k], k
    assert est["quantum"] == est["tl"]
    assert line["metrics"][SENSOR]["tl"] == committed_line["metrics"][SENSOR]["tl"]
    assert line["metrics"]["dead_reckoning"] == committed_line["metrics"]["dead_reckoning"]
    for k in ("t", "truth", "dead_reckoning", "jam", "metric_start_index", "map_preview", "frame", "map_file"):
        assert line[k] == committed_line[k], k
    assert set(line["estimates"]) == {SENSOR}
    assert live_tl_run["start"]["windows_total"] == len(ref["tl"]["window_t"])


def test_live_sequence_never_calls_backend_run(live_tl_run):
    assert live_tl_run["spy"].calls == 0
    assert live_tl_run["steps"][-1]["done"] is True


@pytest.mark.parametrize("line,sensor", [("9999.99", SENSOR), (LINE, "mag_3_uc"), (LINE, "../x"), ("../x", SENSOR)])
def test_live_start_rejects_outside_allowlist(line, sensor):
    out = _strict(api.live_start(SpySim(), line, sensor))
    assert out["ok"] is False and out["error_type"] == "ValueError"
    assert out["stage"] == 1


def test_live_start_simulated_failure():
    out = _strict(api.live_start(SpySim(), LINE, SENSOR, simulate_failure=True))
    assert out == {
        "ok": False,
        "stage": 1,
        "error_type": "RuntimeError",
        "error": "Simulated failure (demo of the fallback)",
    }


def test_step_and_result_without_start_fail_cleanly():
    assert _strict(api.live_cancel(None)) == {"ok": True}
    for raw in (api.live_step(None, 250), api.live_result(None), api.live_skip(None, "raw")):
        out = _strict(raw)
        assert out["ok"] is False and out["error_type"] == "RuntimeError"


@pytest.mark.parametrize("bad", ["abc", True, None, 2.5])
def test_live_step_bad_budget(bad):
    out = _strict(api.live_step(None, bad))
    assert out["ok"] is False and out["error_type"] == "ValueError"


def test_budget_is_clamped(monkeypatch):
    seen = []
    monkeypatch.setattr(live, "step", lambda b: seen.append(b) or {"ok": True})
    api.live_step(None, 1)
    api.live_step(None, 999999)
    api.live_step(None, "300")
    assert seen == [50, 2000, 300]


def test_tl_is_never_skippable():
    assert _strict(api.live_start(None, LINE, SENSOR))["ok"] is True
    out = _strict(api.live_skip(None, "tl"))
    assert out["ok"] is False and out["error_type"] == "ValueError"
    out = _strict(api.live_skip(None, "quantum"))
    assert out["ok"] is False and out["error_type"] == "ValueError"


def test_result_before_done_fails():
    assert _strict(api.live_start(None, LINE, SENSOR))["ok"] is True
    _strict(api.live_step(None, 50))
    out = _strict(api.live_result(None))
    assert out["ok"] is False and out["error_type"] == "RuntimeError"


def test_stage2_chunking_and_per_call_cost():
    """One fit per stage-2 call, in LIVE_FIT order; records the max per-call ms per stage."""
    spy = SpySim()
    cost = {"live_start": 0.0, "stage 2": 0.0, "stage 3": 0.0, "live_result": 0.0}
    t = time.perf_counter()
    start = _strict(api.live_start(spy, LINE, SENSOR))
    cost["live_start"] = (time.perf_counter() - t) * 1000
    assert start["ok"] is True and start["stage"] == 1
    assert start["order"] == ["tl", "raw", "lowpass"]
    assert _strict(api.live_skip(spy, "raw"))["ok"] is True
    assert _strict(api.live_skip(spy, "lowpass"))["ok"] is True

    stage2, n3 = [], 0
    while True:
        t = time.perf_counter()
        p = _strict(api.live_step(spy, 250))
        ms = (time.perf_counter() - t) * 1000
        assert p["ok"] is True, p
        if p["stage"] == 2:
            stage2.append((p["fitting"], p["fits_done"], p["fits_total"]))
            cost["stage 2"] = max(cost["stage 2"], ms)
        else:
            assert p["stage"] == 3
            n3 += 1
            cost["stage 3"] = max(cost["stage 3"], ms)
            assert p["windows_total"] == start["windows_total"]
            assert p["fits_done"] == len(live.LIVE_FIT) + 1
        if p["done"]:
            assert p["denoiser"] is None and p["per_denoiser"]["tl"][0] == p["windows_total"]
            break
    t = time.perf_counter()
    res = _strict(api.live_result(spy))
    cost["live_result"] = (time.perf_counter() - t) * 1000
    assert res["ok"] is True

    total = len(live.LIVE_FIT) + 1
    assert stage2 == [("select", 1, total)] + [(name, i + 2, total) for i, name in enumerate(live.LIVE_FIT)]
    assert n3 >= 2  # TERCOM spread over several calls
    assert spy.calls == 0
    print("\n[live] max per-call ms: " + ", ".join(f"{k} {v:.0f}" for k, v in cost.items()) + f" ({n3} stage-3 calls)")


def test_skip_after_finish_is_rejected():
    assert _strict(api.live_start(None, LINE, SENSOR))["ok"] is True
    p = {"done": False}
    while not p["done"]:
        p = _strict(api.live_step(None, 2000))
        if p["stage"] == 3 and p["per_denoiser"].get("raw", [0, 1])[0] > 0:
            break
    # raw is running or finished; lowpass has not started and can still be skipped
    assert _strict(api.live_skip(None, "lowpass"))["ok"] is True
    while not p["done"]:
        p = _strict(api.live_step(None, 2000))
    assert "lowpass" not in p["per_denoiser"]
    out = _strict(api.live_skip(None, "raw"))
    assert out["ok"] is False and out["error_type"] == "ValueError"


def test_live_source_never_calls_backend_run():
    tree = ast.parse((ROOT / "magnav" / "live.py").read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.Attribute) and node.attr == "run":
            base = ast.unparse(node.value)
            assert "backend" not in base.lower(), f"live.py:{node.lineno} {base}.run"

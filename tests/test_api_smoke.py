"""magnav.api smoke tests: one-job guard, counts shape, JSON contract."""
import json
from pathlib import Path

from qiskit.providers.basic_provider import BasicSimulator

import magnav.api as api

ROOT = Path(__file__).resolve().parent.parent


class SpySim(BasicSimulator):
    """BasicSimulator that counts run() calls (subclass keeps a real Target for transpile)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.calls = 0

    def run(self, *a, **kw):
        self.calls += 1
        return super().run(*a, **kw)


class BoomSim(BasicSimulator):
    def run(self, *a, **kw):
        raise RuntimeError("boom")


def _dominant(counts: dict) -> str:
    return max(counts, key=counts.get)


def test_run_bell_batch_one_job_32_circuits():
    spy = SpySim()
    raw = api.run_bell_batch(spy, 32, 100)
    assert isinstance(raw, str)
    out = json.loads(raw)
    assert spy.calls == 1
    assert out["ok"] is True
    assert len(out["counts"]) == 32
    assert out["ordering_ok"] is True
    assert out["n_circuits"] == 32 and out["shots"] == 100


def test_run_bell_batch_two_circuits_shape_and_order():
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, 2, 200))
    assert spy.calls == 1
    assert len(out["counts"]) == 2
    assert _dominant(out["counts"][0]) in {"00", "11"}
    assert _dominant(out["counts"][1]) in {"01", "10"}


def test_rejects_circuit_count_outside_allowlist():
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, 3, 200))
    assert out["ok"] is False and out["error_type"] == "ValueError"
    assert spy.calls == 0


def test_rejects_shots_outside_allowlist():
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, 2, 999))
    assert out["ok"] is False and out["error_type"] == "ValueError"
    assert spy.calls == 0


def test_backend_error_is_returned_not_raised():
    out = json.loads(api.run_bell_batch(BoomSim(), 2, 200))
    assert out["ok"] is False
    assert out["error_type"] == "RuntimeError"
    assert "boom" in out["error"]


def test_backend_info_submits_no_job():
    spy = SpySim()
    info = json.loads(api.backend_info(spy))
    assert spy.calls == 0
    assert info["name"] == "basic_simulator"
    assert info["is_ionq"] is False
    assert info["qiskit"] == "2.5.2"
    expected = json.loads((ROOT / "data" / "smoke.json").read_text(encoding="utf-8"))
    assert info["data_file"] == expected


def test_api_source_has_no_forbidden_names():
    src = (ROOT / "magnav" / "api.py").read_text(encoding="utf-8")
    for name in ("BackendSamplerV2", "IonQProvider", "AerSimulator"):
        assert name not in src, name

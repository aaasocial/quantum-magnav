"""magnav.api smoke tests: one-job guard, counts shape, JSON contract."""
import json
from pathlib import Path

import pytest
from qiskit import QuantumCircuit
from qiskit.providers.basic_provider import BasicSimulator

from magnav import api

ROOT = Path(__file__).resolve().parent.parent


class SpySim(BasicSimulator):
    """BasicSimulator that counts run() calls and records the payload (keeps a real Target)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.calls = 0
        self.last_payload = None

    def run(self, *a, **kw):
        self.calls += 1
        self.last_payload = a[0] if a else kw.get("run_input")
        return super().run(*a, **kw)


class FakeIonQSim(SpySim):
    """Looks like a qiskit-ionq backend by provider module, not by name."""

    __module__ = "qiskit_ionq.fake"


class IonQNamedSim(SpySim):
    """Detected by name only (module is this test file)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.name = "ionq_simulator"  # BackendV2 stores name as a plain attribute


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


def test_single_circuit_submits_bare_circuit():
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, 1, 200))
    assert spy.calls == 1
    assert isinstance(spy.last_payload, QuantumCircuit)  # ionq.circuit.v1, not multi-circuit
    assert out["ok"] is True and len(out["counts"]) == 1
    assert _dominant(out["counts"][0]) in {"00", "11"}


def test_multi_circuit_submits_list_on_non_ionq():
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, 2, 200))
    assert spy.calls == 1
    assert isinstance(spy.last_payload, list) and len(spy.last_payload) == 2
    assert out["ok"] is True


@pytest.mark.parametrize("cls", [FakeIonQSim, IonQNamedSim])
def test_ionq_rejects_multi_circuit_without_submitting(cls):
    fake = cls()
    out = json.loads(api.run_bell_batch(fake, 2, 200))
    assert fake.calls == 0  # the run's one IonQ job is not spent
    assert out["ok"] is False and out["error_type"] == "ValueError"
    assert "single-circuit" in out["error"]


def test_ionq_single_circuit_is_allowed():
    fake = FakeIonQSim()
    out = json.loads(api.run_bell_batch(fake, 1, 200))
    assert fake.calls == 1 and isinstance(fake.last_payload, QuantumCircuit)
    assert out["ok"] is True


@pytest.mark.parametrize("cls", [FakeIonQSim, IonQNamedSim])
def test_backend_info_detects_ionq(cls):
    assert json.loads(api.backend_info(cls()))["is_ionq"] is True


@pytest.mark.parametrize(
    "n, s",
    [(object(), 200), (None, 200), (True, 200), (2, 200.9), (2, float("nan")), (2, float("inf"))],
)
def test_bad_inputs_return_json_not_raise(n, s):
    spy = SpySim()
    out = json.loads(api.run_bell_batch(spy, n, s))
    assert out["ok"] is False and out["error_type"] == "ValueError"
    assert spy.calls == 0


def test_backend_info_rejects_nan_in_data_file(tmp_path, monkeypatch):
    bad = tmp_path / "smoke.json"
    bad.write_text('{"x": NaN}', encoding="utf-8")
    monkeypatch.setattr(api, "SMOKE_DATA", str(bad))
    raw = api.backend_info(SpySim())

    def reject(constant):  # mimic JS JSON.parse, which has no NaN/Infinity
        raise ValueError(constant)

    assert json.loads(raw, parse_constant=reject)["data_file"].startswith("error:")

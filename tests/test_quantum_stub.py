"""Quantum slot stub: final interface, never touches the backend."""

import json

import numpy as np

from magnav.pipeline import run_pipeline
from magnav.quantum import QuantumDenoiser


class SpyBackend:
    name = "spy_backend"

    def __init__(self):
        self.calls = 0

    def run(self, *a, **kw):
        self.calls += 1
        raise AssertionError("QuantumDenoiser stub must never call backend.run")


def test_quantum_stub_never_runs_backend():
    spy = SpyBackend()
    F = np.random.default_rng(0).normal(size=(50, 22))
    r = np.zeros(50)
    q = QuantumDenoiser(backend=spy)
    assert q.name == "quantum" and q.status == "stub"
    assert q.fit(F, r) is q
    out = q.predict(F)
    assert np.array_equal(out, np.zeros(50))
    info = json.loads(q.run_inference(F))
    assert spy.calls == 0
    assert info["status"] == "stub" and info["ok"] is False
    assert info["backend"] == "spy_backend"
    assert info["n_windows"] == 50
    prov = q.provenance
    assert prov["source"] == "stub"
    assert prov["backend"] == "spy_backend"
    assert prov["n_features"] == 22
    assert prov["circuit"] is None


def test_quantum_stub_without_backend():
    q = QuantumDenoiser()
    assert q.provenance["backend"] is None
    assert json.loads(q.run_inference(np.zeros((3, 22))))["backend"] is None


def test_quantum_slot_equals_tl():
    spy = SpyBackend()
    res = run_pipeline(backend=spy, sensors=("mag_5_uc",), lines=("1003.02",), truncate=2000)
    results = res["lines"]["1003.02"]["results"]["mag_5_uc"]
    assert list(results) == ["raw", "lowpass", "tl", "tl_currents", "krr", "quantum"]
    assert np.array_equal(results["quantum"]["cleaned"], results["tl"]["cleaned"])
    names = {r["denoiser"] for r in res["metrics_table"]}
    assert {"tl", "quantum", "krr", "tl_currents"} <= names
    assert spy.calls == 0
    assert res["config"]["quantum"]["mag_5_uc"]["source"] == "stub"
    assert res["config"]["krr"]["mag_5_uc"]["features"] == 22

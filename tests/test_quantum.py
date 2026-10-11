"""Quantum feature-map denoiser: frozen circuit, two exact engines, counts decoding."""

import json

import numpy as np
import pytest
from qiskit import QuantumCircuit, transpile
from qiskit.providers.basic_provider import BasicSimulator

from magnav import quantum


def _theta(seed: int, n: int) -> np.ndarray:
    return np.random.default_rng(seed).uniform(-np.pi, np.pi, (n, quantum.N_SLOTS))


# ---------------------------------------------------------------------------
# Task 1: circuit contract, engines, random map, packed circuit, counts decoding
# ---------------------------------------------------------------------------


def test_masks_and_signs():
    assert list(quantum.MASKS) == [1, 2, 4, 8, 3, 5, 6, 9, 10, 12, 7, 11, 13, 14, 15]
    weights = [m.bit_count() for m in quantum.MASKS]
    assert [weights.count(w) for w in (1, 2, 3, 4)] == [4, 6, 4, 1]
    assert quantum.SIGNS.shape == (16, 15)
    assert set(np.unique(quantum.SIGNS)) == {-1.0, 1.0}


def test_batch_equals_statevector():
    th = _theta(1, 50)
    for fmap in ("designed", "random"):
        a = quantum.correlators_statevector(th, fmap=fmap)
        b = quantum.correlators_batch(th, fmap=fmap)
        assert a.shape == (50, 15)
        assert np.abs(a - b).max() < 1e-12, fmap


def test_no_dead_slots():
    th = _theta(2, 1)
    base = quantum.correlators_statevector(th)
    for s in range(quantum.N_FEATURES):
        p = th.copy()
        p[0, s] += 0.3
        assert np.abs(quantum.correlators_statevector(p) - base).max() > 1e-6, f"slot {s} is dead"


def test_feature_block_gate_order():
    qc = quantum.feature_block()
    names = [ins.operation.name for ins in qc.data]
    assert names[:4] == ["h"] * 4 and names[-4:] == ["h"] * 4
    layer = ["rz"] * 4 + ["ry"] * 4 + ["cz"] * 4
    assert names[4:-4] == layer * 3
    assert len(qc.parameters) == quantum.N_SLOTS
    assert dict(qc.count_ops()) == {"h": 8, "rz": 12, "ry": 12, "cz": 12}


def test_angles_spare_slots_zero():
    z = np.random.default_rng(0).normal(size=(10, 22)) * 2
    th = quantum.angles(z, 0.25)
    assert th.shape == (10, 24)
    assert np.all(th[:, 22:] == 0.0)
    assert np.abs(th).max() <= 0.25 * np.pi + 1e-15


def _xblock(bits: int) -> QuantumCircuit:
    qc = QuantumCircuit(4)
    for q in range(4):
        if (bits >> q) & 1:
            qc.x(q)
    return qc


def test_counts_decoding_deterministic():
    states = [0b0001, 0b0110, 0b1011]
    qc = QuantumCircuit(12)
    for k, s in enumerate(states):
        qc.compose(_xblock(s), qubits=range(4 * k, 4 * k + 4), inplace=True)
    qc.measure_all()
    sim = BasicSimulator()
    counts = sim.run(qc, shots=100, seed_simulator=1).result().get_counts()
    corr, marg, total = quantum.block_correlators_from_counts(counts, 3)
    assert total == 100
    assert [int(np.argmax(m)) for m in marg] == states
    assert marg.dtype.kind == "i"
    np.testing.assert_allclose(corr, quantum.SIGNS[states], atol=0)
    # keys with spaces (multi-register) and counts not summing to requested shots
    key = format(states[2] << 8 | states[1] << 4 | states[0], "012b")
    spaced = {key[:4] + " " + key[4:]: 7}
    corr2, marg2, total2 = quantum.block_correlators_from_counts(spaced, 3)
    assert total2 == 7 and [int(np.argmax(m)) for m in marg2] == states
    np.testing.assert_allclose(corr2, corr)


def test_counts_match_statevector_k2():
    th = np.random.default_rng(3).uniform(-1, 1, (2, 24))
    exact = quantum.correlators_statevector(th)
    sim = BasicSimulator()
    tqc = transpile(quantum.packed_circuit(th), sim, optimization_level=1)
    counts = sim.run(tqc, shots=20000, seed_simulator=11).result().get_counts()
    est, _, shots = quantum.block_correlators_from_counts(counts, 2)
    assert shots == 20000
    assert np.abs(est - exact).max() < 5 / np.sqrt(20000)


def test_random_map_deterministic():
    g1 = quantum.random_map_gates(quantum.RANDOM_MAP_SEED)
    g2 = quantum.random_map_gates(quantum.RANDOM_MAP_SEED)
    assert g1 == g2
    assert g1["seed"] == quantum.RANDOM_MAP_SEED and len(g1["layers"]) == quantum.N_LAYERS
    for layer in g1["layers"]:
        assert sorted(layer["perm"]) == list(range(24))
        assert len(layer["rz"]) == 4 and len(layer["ry"]) == 4
        pairs = {tuple(sorted(p)) for p in layer["cz"]}
        assert len(pairs) == 4 and all(a != b for a, b in pairs)

    assert json.loads(json.dumps(g1)) == g1
    th = _theta(4, 5)
    a = quantum.correlators_statevector(th, fmap="random", gates=g1)
    b = quantum.correlators_statevector(th, fmap="random", gates=g2)
    assert np.array_equal(a, b)
    assert not np.allclose(a, quantum.correlators_statevector(th))


def test_packed_circuit_shape():
    th = _theta(5, 3)
    qc = quantum.packed_circuit(th)
    assert qc.num_qubits == 12
    assert [c.name for c in qc.cregs] == ["meas"]
    assert qc.cregs[0].size == 12


# ---------------------------------------------------------------------------
# Task 2: shot-aware ridge, QuantumDenoiser, frozen mode, verification, model I/O
# ---------------------------------------------------------------------------


class SpyBackend:
    name = "spy_backend"

    def __init__(self):
        self.calls = 0

    def run(self, *a, **kw):
        self.calls += 1
        raise AssertionError("QuantumDenoiser must never call backend.run")


@pytest.fixture(scope="module")
def cal_fit():
    """mag_5_uc on 1006.08: TL + designed quantum readout, fitted once (CV over the full grid)."""
    from magnav.classical import (
        ResidualCorrected,
        TLDenoiser,
        kernel_features,
        select_tl_config,
    )
    from magnav.data import FLT1006_LINE08, load_line

    sens, truth = load_line(FLT1006_LINE08)
    target = truth.mag_1_c
    sel = select_tl_config(sens, target, "mag_5_uc")
    spy = SpyBackend()
    rc = ResidualCorrected(
        TLDenoiser("mag_5_uc", sel["fluxgate"], lam=sel["lambda"]), quantum.QuantumDenoiser(spy), "quantum"
    )
    rc.fit(sens, target)
    pred = rc.predict(sens)
    F = kernel_features(sens, sel["fluxgate"])
    r = rc.base.predict(sens) - target
    return {"spy": spy, "rc": rc, "den": rc.model, "pred": pred, "F": F, "r": r - r.mean()}


def test_fit_predict_never_calls_backend(cal_fit):
    den = cal_fit["den"]
    assert cal_fit["spy"].calls == 0
    assert den.name == "quantum" and den.status == "feature_map_ridge"
    assert den.n_features == 22
    assert cal_fit["pred"].shape == (1678,) and np.isfinite(cal_fit["pred"]).all()
    prov = den.provenance
    assert prov["source"] == "feature_map_ridge" and prov["feature_map"] == "designed"
    assert prov["backend"] == "spy_backend"
    assert prov["circuit"]["order"] == quantum.CIRCUIT_ORDER
    assert prov["circuit"]["gate_counts_per_block"] == {"h": 8, "rz": 12, "ry": 12, "cz": 12}
    assert len(prov["cv_table"]) == len(quantum.BANDWIDTHS) * len(quantum.LAMBDAS_QUANTUM)
    assert prov["statevector_check_max_abs"] < 1e-12
    assert not hasattr(den, "run_inference")
    json.dumps(prov, allow_nan=False)


def test_shot_sigma_bound(cal_fit):
    den = cal_fit["den"]
    assert den.bandwidth in quantum.BANDWIDTHS and den.lam in quantum.LAMBDAS_QUANTUM
    s4096 = den.shot_sigma_nT["4096"]
    assert 0 < s4096 < den.shot_sigma_nT["500"]
    assert s4096 < 0.25 * float(np.std(cal_fit["r"]))


def test_ridge_shot_aware_closed_form():
    rng = np.random.default_rng(0)
    C = rng.uniform(-0.5, 0.5, (40, 15))
    y = rng.normal(size=40)
    w, m, ym = quantum.ridge_shot_aware(C, y, 1.0, shots=100)
    Cc = C - C.mean(0)
    noise = np.mean((1 - C**2) / 100, axis=0)
    ref = np.linalg.solve(Cc.T @ Cc + np.diag(40 * noise) + np.eye(15), Cc.T @ (y - y.mean()))
    np.testing.assert_allclose(w, ref, atol=1e-12)
    np.testing.assert_allclose(m, C.mean(0))
    assert np.isclose(ym, y.mean())
    sig = quantum.shot_sigma(C, w, 100)
    assert np.isclose(sig, np.sqrt(np.mean(np.sum(w**2 * (1 - C**2) / 100, axis=1))))


def test_frozen_roundtrip_identical(cal_fit):
    den, F, r = cal_fit["den"], cal_fit["F"], cal_fit["r"]
    readout = json.loads(json.dumps(den.readout, allow_nan=False))
    frozen = quantum.QuantumDenoiser(None, frozen=readout).fit(F, r)
    assert np.array_equal(frozen.predict(F), den.predict(F))
    assert frozen.bandwidth == den.bandwidth and frozen.lam == den.lam
    assert frozen.provenance["statevector_check_max_abs"] < 1e-12
    assert frozen.provenance["cv_table"] == den.provenance["cv_table"]


def test_frozen_stale_raises(cal_fit):
    den, F, r = cal_fit["den"], cal_fit["F"], cal_fit["r"]
    readout = json.loads(json.dumps(den.readout))
    readout["feature_mu"] = [m + s for m, s in zip(readout["feature_mu"], readout["feature_sd"], strict=True)]
    with pytest.raises(ValueError, match="data/quantum_model.json is stale"):
        quantum.QuantumDenoiser(None, frozen=readout).fit(F, r)


def test_identity_and_random_maps_fit(cal_fit):
    F, r = cal_fit["F"], cal_fit["r"]
    ident = quantum.QuantumDenoiser(None, feature_map="identity").fit(F, r)
    rand = quantum.QuantumDenoiser(None, feature_map="random").fit(F, r)
    assert ident.bandwidth is None and ident.lam in quantum.LAMBDAS_IDENTITY
    assert rand.bandwidth in quantum.BANDWIDTHS and rand.lam in quantum.LAMBDAS_QUANTUM
    for d in (ident, rand):
        p = d.predict(F)
        assert p.shape == (1678,) and np.isfinite(p).all()
        json.dumps(d.provenance, allow_nan=False)
    assert ident.shot_sigma_nT == {"500": 0.0, "4096": 0.0}
    assert rand.readout["gates"] == quantum.random_map_gates(quantum.RANDOM_MAP_SEED)
    # frozen random readout reproduces predictions too
    fr = quantum.QuantumDenoiser(None, feature_map="random", frozen=json.loads(json.dumps(rand.readout)))
    assert np.array_equal(fr.fit(F, r).predict(F), rand.predict(F))
    fi = quantum.QuantumDenoiser(None, feature_map="identity", frozen=json.loads(json.dumps(ident.readout)))
    assert np.array_equal(fi.fit(F, r).predict(F), ident.predict(F))


def test_readout_sha256_stable(cal_fit):
    ro = cal_fit["den"].readout
    a = {"mag_5_uc": ro, "mag_4_uc": {"x": 1}}
    b = {"mag_4_uc": {"x": 1}, "mag_5_uc": dict(reversed(list(ro.items())))}
    assert quantum.readout_sha256(a) == quantum.readout_sha256(b)
    assert len(quantum.readout_sha256(a)) == 64
    c = {"mag_5_uc": dict(ro, y_mean=ro["y_mean"] + 1.0), "mag_4_uc": {"x": 1}}
    assert quantum.readout_sha256(c) != quantum.readout_sha256(a)


def _exact_counts(exact_probs: np.ndarray, total: float) -> dict:
    """Joint counts of K independent 4-qubit blocks from exact block probabilities."""
    k = len(exact_probs)
    joint = np.ones(1)
    for j in range(k - 1, -1, -1):  # block k-1 is the most significant nibble
        joint = np.outer(joint, exact_probs[j]).ravel()
    return {format(v, f"0{4 * k}b"): round(p * total) for v, p in enumerate(joint) if p * total >= 0.5}


def test_verification_summary_exact_counts(cal_fit):
    from qiskit.quantum_info import Statevector

    den, F = cal_fit["den"], cal_fit["F"]
    sample = quantum.verification_samples(den, F, [10, 500, 900])
    assert sample["indices"] == [10, 500, 900]
    assert np.array(sample["theta"]).shape == (3, 24) and np.array(sample["exact_corr"]).shape == (3, 15)
    np.testing.assert_allclose(sample["exact_pred_nT"], den.predict(F[[10, 500, 900]]), atol=1e-9)
    json.dumps(sample, allow_nan=False)
    probs = np.array([Statevector(quantum.feature_block(t)).probabilities() for t in sample["theta"][:2]])
    counts = _exact_counts(probs, 1e9)
    out = quantum.verification_summary(counts, sample, den.readout, 2)
    assert out["K"] == 2 and out["total_shots"] == sum(counts.values())
    assert out["max_abs_corr_err"] < 1e-3 and out["rms_corr_err"] <= out["max_abs_corr_err"]
    assert [row["index"] for row in out["samples"]] == [10, 500]
    for row in out["samples"]:
        assert set(row) == {"index", "exact_pred_nT", "shot_pred_nT", "delta_nT"}
        assert abs(row["delta_nT"]) < 1.0
    assert np.array(out["marginals"]).shape == (2, 16)
    assert out["max_abs_pred_delta_nT"] >= out["rms_pred_delta_nT"] >= 0
    json.dumps(out, allow_nan=False)


def test_concentration_diagnostics(cal_fit):
    den, F, r = cal_fit["den"], cal_fit["F"], cal_fit["r"]
    rand = quantum.QuantumDenoiser(None, feature_map="random").fit(F, r)
    z = den.standardise(F)
    zs = {"1006.08": z, "1003.02": z[:800] * 1.5, "1007.06": z[800:]}
    d = quantum.concentration_diagnostics(den, rand, zs)
    assert set(d["frac_clipped"]) == set(zs) and d["frac_clipped"]["1006.08"] == float(np.mean(np.abs(z) > 3))
    for m in ("designed", "random"):
        blk = d[m]
        assert set(blk["corr_var"]) == set(zs) and len(blk["corr_var"]["1003.02"]) == 15
        hist = np.array(blk["corr_hist"]["1006.08"])
        assert hist.shape == (15, 20) and (hist.sum(axis=1) == len(z)).all()
        assert len(blk["pair_dist"]["1007.06"]["corr"]) == 5 and len(blk["pair_dist"]["1007.06"]["input"]) == 5
        assert set(blk["shot_sigma_nT"]) == {"500", "4096"}
    json.dumps(d, allow_nan=False)
    assert d == quantum.concentration_diagnostics(den, rand, zs)


def test_model_write_load_deterministic(cal_fit, tmp_path):
    den, F = cal_fit["den"], cal_fit["F"]
    sample = quantum.verification_samples(den, F, list(range(100, 107)))
    model = quantum.build_model(
        {"mag_5_uc": den.readout},
        {"identity": {}, "random": {}},
        {"1003.02": {"mag_5_uc": sample}},
        quantum.random_map_gates(quantum.RANDOM_MAP_SEED),
        den.statevector_check_max_abs,
    )
    assert model["schema"] == quantum.MODEL_SCHEMA
    assert model["k_policy"] == {"builtin": 4, "ionq_max": 7, "shots_ionq_sim": 4096, "shots_hardware": 500}
    assert model["readout_sha256"] == quantum.readout_sha256(model["sensors"])
    p1, p2 = tmp_path / "a.json", tmp_path / "b.json"
    n1 = quantum.write_model(model, p1)
    quantum.write_model(model, p2)
    assert p1.read_bytes() == p2.read_bytes() and n1 == len(p1.read_bytes())
    assert p1.read_bytes().endswith(b"\n") and n1 < 200_000
    assert quantum.load_model(p1) == json.loads(json.dumps(model))
    with pytest.raises(ValueError):
        quantum.write_model({"big": [0.123456789] * 300_000}, tmp_path / "c.json")

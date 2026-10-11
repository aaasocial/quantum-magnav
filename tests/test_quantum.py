"""Quantum feature-map denoiser: frozen circuit, two exact engines, counts decoding."""

import numpy as np
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
    import json

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

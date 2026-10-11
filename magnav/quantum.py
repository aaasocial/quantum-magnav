"""Quantum feature-map denoiser (Phase 4): the ONE definition of the frozen circuit.

The slot is a residual model with the same protocol as `classical.KRRResidual`:
    fit(features, residual) -> self      # features = classical.kernel_features(sensors)
    predict(features) -> np.ndarray      # residual correction in nT
so `ResidualCorrected(TLDenoiser(...), QuantumDenoiser(backend), "quantum")` is a drop-in
denoiser.

Circuit (D-01..D-03, D-19): one 4-qubit block per sample, gate order
    H, [RZ(4), RY(4), CZ ring (0-1, 1-2, 2-3, 3-0)] x 3, H
with 24 angle slots (slot 8l+q = RZ on qubit q in layer l, slot 8l+4+q = RY). Readout
features are the 15 Z-basis correlators of the block (4 <Z>, 6 <ZZ>, 4 <ZZZ>, 1 <ZZZZ>).

Two exact engines of the identical gate sequence (D-04, D-18):
- `correlators_statevector`: qiskit.quantum_info.Statevector (canonical; training rows and
  verification samples);
- `correlators_batch`: a vectorised numpy statevector (full-line and in-page prediction),
  cross-checked against Statevector on every fit.

The backend is always injected (on Qollab the platform's pre-created `backend` global);
this module never constructs a backend, provider or simulator and never submits a job.
Training is classical (ridge on exact correlators). The single verification job lives in
`magnav.api`.
"""

import json

import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector

# ---------------------------------------------------------------------------
# Frozen constants
# ---------------------------------------------------------------------------

N_QUBITS = 4
N_LAYERS = 3
N_SLOTS = 24
N_FEATURES = 22
RING = ((0, 1), (1, 2), (2, 3), (3, 0))
CLIP_SD = 3.0
BANDWIDTHS = (0.05, 0.1, 0.25, 0.5, 1.0)
LAMBDAS_QUANTUM = (0.0, 1e-2, 1e-1, 1.0, 10.0, 100.0, 1000.0)
LAMBDAS_IDENTITY = (1e-2, 1e-1, 1.0, 10.0, 100.0, 1e3, 1e4)
SHOTS_REF = 4096
CV_BLOCKS = 5
RANDOM_MAP_SEED = 20261010
VERIFY_SEED = 20261010
N_VERIFY_SAMPLES = 7
# D-17 K/shots policy; K_IONQ_MAX and SHOTS_IONQ_SIM are the one-line Forte ladder knobs
K_BUILTIN = 4
K_IONQ_MAX = 7
SHOTS_IONQ_SIM = 4096
SHOTS_HARDWARE = 500
MODEL_PATH = "data/quantum_model.json"
MODEL_SCHEMA = "magnav.quantum_model.v1"
MODEL_MAX_BYTES = 2 * 1024 * 1024
CIRCUIT_ORDER = "H,[RZ(4),RY(4),CZ ring(0-1,1-2,2-3,3-0)]x3,H"
SLOTS_TEXT = "slot j = feature j (j<22); slots 22,23 = 0; slot 8l+q = RZ(q), slot 8l+4+q = RY(q) in layer l"
ANGLE_TEXT = "b*pi*clip(z,-3,3)/3"

# Correlator order: weight 1 (4), weight 2 (6), weight 3 (4), weight 4 (1); masks sorted by
# (popcount, value). Bit q of a mask / basis index = qubit q (qiskit little-endian).
MASKS = tuple(sorted(range(1, 16), key=lambda m: (m.bit_count(), m)))
SIGNS = np.array([[(-1.0) ** (s & m).bit_count() for m in MASKS] for s in range(16)], dtype=np.float64)

_DIM = 2**N_QUBITS
_IDX = np.arange(_DIM)
_LO = [_IDX[((_IDX >> q) & 1) == 0] for q in range(N_QUBITS)]  # basis indices with bit q = 0
_HI = [i | (1 << q) for q, i in enumerate(_LO)]  # partner indices with bit q = 1
_SQRT_HALF = 1.0 / np.sqrt(2.0)


def angles(z, bandwidth: float) -> np.ndarray:
    """(n, 24) angles from calibration-standardised features z (n, 22) (D-05)."""
    z = np.asarray(z, dtype=np.float64)
    theta = np.zeros((len(z), N_SLOTS))
    theta[:, :N_FEATURES] = float(bandwidth) * np.pi * np.clip(z, -CLIP_SD, CLIP_SD) / CLIP_SD
    # slots 22, 23 fixed to 0 per D-02
    return theta


# ---------------------------------------------------------------------------
# Circuits
# ---------------------------------------------------------------------------


def feature_block(theta=None) -> QuantumCircuit:
    """Designed 4-qubit block (D-19 order). theta: length-24 floats, or None for a ParameterVector."""
    th = ParameterVector("x", N_SLOTS) if theta is None else [float(t) for t in theta]
    qc = QuantumCircuit(N_QUBITS, name="magnav_fmap")
    qc.h(range(N_QUBITS))
    for layer in range(N_LAYERS):
        for q in range(N_QUBITS):
            qc.rz(th[8 * layer + q], q)
        for q in range(N_QUBITS):
            qc.ry(th[8 * layer + 4 + q], q)
        for a, b in RING:
            qc.cz(a, b)
    qc.h(range(N_QUBITS))
    return qc


def random_map_gates(seed: int = RANDOM_MAP_SEED) -> dict:
    """Seeded random ablation map of the same skeleton depth (D-10b), as a JSON-ready gate list.

    One seeded permutation of the 24 slots is stored in every layer; layer l feeds data slot
    perm[8l+q] to RZ on qubit q and perm[8l+4+q] to RY on qubit q (so each slot enters once).
    Each layer then applies fixed RZ(U[0, 2pi)) and RY(U[0, pi)) per qubit and 4 CZs on
    seeded distinct qubit pairs.
    """
    rng = np.random.default_rng(int(seed))
    perm = [int(p) for p in rng.permutation(N_SLOTS)]
    all_pairs = [(a, b) for a in range(N_QUBITS) for b in range(a + 1, N_QUBITS)]
    layers = []
    for _ in range(N_LAYERS):
        rz = [float(v) for v in rng.uniform(0.0, 2.0 * np.pi, N_QUBITS)]
        ry = [float(v) for v in rng.uniform(0.0, np.pi, N_QUBITS)]
        pick = rng.choice(len(all_pairs), size=4, replace=False)
        cz = [[int(all_pairs[i][0]), int(all_pairs[i][1])] for i in pick]
        layers.append({"perm": list(perm), "rz": rz, "ry": ry, "cz": cz})
    return {"seed": int(seed), "layers": layers}


def _random_ops(gates: dict):
    """Gate list of the random map: ('h'|'rz'|'ry'|'cz', qubits, slot or fixed angle)."""
    ops = [("h", q, None) for q in range(N_QUBITS)]
    for layer, g in enumerate(gates["layers"]):
        perm = g["perm"]
        ops += [("rz", q, ("slot", perm[8 * layer + q])) for q in range(N_QUBITS)]
        ops += [("ry", q, ("slot", perm[8 * layer + 4 + q])) for q in range(N_QUBITS)]
        ops += [("rz", q, ("fixed", g["rz"][q])) for q in range(N_QUBITS)]
        ops += [("ry", q, ("fixed", g["ry"][q])) for q in range(N_QUBITS)]
        ops += [("cz", (int(a), int(b)), None) for a, b in g["cz"]]
    ops += [("h", q, None) for q in range(N_QUBITS)]
    return ops


def _designed_ops():
    ops = [("h", q, None) for q in range(N_QUBITS)]
    for layer in range(N_LAYERS):
        ops += [("rz", q, ("slot", 8 * layer + q)) for q in range(N_QUBITS)]
        ops += [("ry", q, ("slot", 8 * layer + 4 + q)) for q in range(N_QUBITS)]
        ops += [("cz", ab, None) for ab in RING]
    ops += [("h", q, None) for q in range(N_QUBITS)]
    return ops


def random_block(theta, gates: dict) -> QuantumCircuit:
    """Random-map 4-qubit block built from floats and the recorded gate list."""
    th = [float(t) for t in theta]
    qc = QuantumCircuit(N_QUBITS, name="magnav_random_map")
    for name, q, arg in _random_ops(gates):
        if name == "h":
            qc.h(q)
        elif name == "cz":
            qc.cz(*q)
        else:
            val = th[arg[1]] if arg[0] == "slot" else float(arg[1])
            getattr(qc, name)(val, q)
    return qc


def _resolve(fmap: str, gates):
    if fmap == "designed":
        return None
    if fmap == "random":
        return random_map_gates(RANDOM_MAP_SEED) if gates is None else gates
    raise ValueError(f"unknown feature map {fmap!r}; expected 'designed' or 'random'")


def _block(theta, fmap: str = "designed", gates=None) -> QuantumCircuit:
    g = _resolve(fmap, gates)
    return feature_block(theta) if g is None else random_block(theta, g)


def packed_circuit(theta_k, fmap: str = "designed", gates=None) -> QuantumCircuit:
    """K disjoint 4-qubit blocks in ONE circuit, then measure_all (single 'meas' register)."""
    theta_k = np.atleast_2d(np.asarray(theta_k, dtype=np.float64))
    k = len(theta_k)
    qc = QuantumCircuit(N_QUBITS * k, name=f"magnav_verify_k{k}")
    for i, t in enumerate(theta_k):
        qc.compose(_block(t, fmap, gates), qubits=range(N_QUBITS * i, N_QUBITS * i + N_QUBITS), inplace=True)
    qc.measure_all()
    return qc


# ---------------------------------------------------------------------------
# Engines
# ---------------------------------------------------------------------------


def correlators_statevector(theta, fmap: str = "designed", gates=None) -> np.ndarray:
    """Canonical engine (D-04): Statevector per row, probabilities() @ SIGNS -> (n, 15)."""
    from qiskit.quantum_info import Statevector

    theta = np.atleast_2d(np.asarray(theta, dtype=np.float64))
    g = _resolve(fmap, gates)
    if len(theta) == 0:
        return np.zeros((0, len(MASKS)))
    probs = np.array([Statevector(feature_block(t) if g is None else random_block(t, g)).probabilities() for t in theta])
    return probs @ SIGNS


def correlators_batch(theta, fmap: str = "designed", gates=None) -> np.ndarray:
    """Vectorised numpy statevector of the identical gate sequence (D-18) -> (n, 15)."""
    theta = np.atleast_2d(np.asarray(theta, dtype=np.float64))
    g = _resolve(fmap, gates)
    ops = _designed_ops() if g is None else _random_ops(g)
    n = len(theta)
    psi = np.zeros((n, _DIM), dtype=np.complex128)
    psi[:, 0] = 1.0
    for name, q, arg in ops:
        if name == "cz":
            a, b = q
            psi[:, (((_IDX >> a) & 1) & ((_IDX >> b) & 1)) == 1] *= -1.0
            continue
        lo, hi = _LO[q], _HI[q]
        a0, a1 = psi[:, lo], psi[:, hi]
        if name == "h":
            psi[:, lo], psi[:, hi] = (a0 + a1) * _SQRT_HALF, (a0 - a1) * _SQRT_HALF
            continue
        ang = theta[:, arg[1]] if arg[0] == "slot" else np.full(n, float(arg[1]))
        if name == "rz":  # diag(exp(-i t/2), exp(+i t/2))
            psi[:, lo] = a0 * np.exp(-0.5j * ang)[:, None]
            psi[:, hi] = a1 * np.exp(0.5j * ang)[:, None]
        else:  # ry: [[c, -s], [s, c]], c = cos(t/2), s = sin(t/2)
            c, s = np.cos(0.5 * ang)[:, None], np.sin(0.5 * ang)[:, None]
            psi[:, lo], psi[:, hi] = c * a0 - s * a1, s * a0 + c * a1
    return (np.abs(psi) ** 2) @ SIGNS


def block_correlators_from_counts(counts: dict, k: int):
    """Decode packed-circuit counts -> (corr (K, 15), marginals (K, 16) ints, total_shots).

    Clbit i is bit i of int(key, 2) (keys are MSB-left); block j is (v >> 4j) & 15.
    Normalised by the SUM of the counts, never the requested shots (Pitfall 12).
    """
    k = int(k)
    marg = np.zeros((k, _DIM), dtype=np.int64)
    total = 0
    for key, c in counts.items():
        v = int(str(key).replace(" ", ""), 2)
        c = int(c)
        total += c
        for j in range(k):
            marg[j, (v >> (N_QUBITS * j)) & 15] += c
    if total <= 0:
        raise ValueError("counts are empty")
    return (marg / total) @ SIGNS, marg, total


# ---------------------------------------------------------------------------
# Residual model slot
# ---------------------------------------------------------------------------


def _backend_name(backend):
    try:
        name = getattr(backend, "name", None)
    except Exception:  # noqa: BLE001
        return None
    return None if name is None else str(name)



class QuantumDenoiser:
    """Quantum residual model slot. Status "stub": zero correction, no job submitted."""

    name = "quantum"
    status = "stub"

    def __init__(self, backend=None):
        self.backend = backend
        self.n_features = None

    def fit(self, features, residual):
        """Phase 4: classical readout training on the quantum feature map (statevector locally)."""
        f = np.asarray(features, dtype=np.float64)
        self.n_features = int(f.shape[1]) if f.ndim == 2 else None
        return self

    def predict(self, features) -> np.ndarray:
        """Residual correction in nT; the stub returns zeros."""
        return np.zeros(len(features))

    @property
    def provenance(self) -> dict:
        return {
            "source": "stub",
            "backend": _backend_name(self.backend),
            "n_features": self.n_features,
            "circuit": None,
        }

    def run_inference(self, features) -> str:
        """Return a JSON string describing the inference run.

        Phase 4 builds exactly one circuit here and submits it in exactly one backend.run
        call (the Qollab platform allows one single-circuit job per Run). The stub submits
        nothing and reports status "stub".
        """
        return json.dumps(
            {
                "ok": False,
                "status": self.status,
                "backend": _backend_name(self.backend),
                "n_windows": len(features),
                "n_features": self.n_features,
            },
            allow_nan=False,
        )

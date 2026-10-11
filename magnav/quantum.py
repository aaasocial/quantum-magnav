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

import hashlib
import json
from pathlib import Path

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
# Shot-aware ridge readout (D-04, D-19)
# ---------------------------------------------------------------------------

_EPS = 1e-12
FEATURE_MAPS = ("designed", "identity", "random")
SELECTION_MAP = "5-block CV on 1006.08 only, score sqrt(CV^2 + sigma_shot(4096)^2)"
SELECTION_IDENTITY = "5-block CV on 1006.08 only, score CV RMSE (plain ridge on the 22 standardised features)"
ENGINE_TEXT = (
    "qiskit Statevector (training, verification samples) + numpy batch statevector (prediction), cross-checked"
)
RANDOM_ORDER = "H,[data RZ(4),data RY(4) on a seeded slot permutation, fixed RZ(4), fixed RY(4), 4 seeded CZ]x3,H"


def _ridge(X: np.ndarray, y: np.ndarray, lam: float, noise: np.ndarray):
    """Centred ridge with per-column Tikhonov term N*noise: returns (w, x_mean, y_mean)."""
    m, ym = X.mean(axis=0), float(y.mean())
    Xc = X - m
    A = Xc.T @ Xc + np.diag(len(X) * noise) + float(lam) * np.eye(X.shape[1])
    b = Xc.T @ (y - ym)
    try:
        w = np.linalg.solve(A, b)
    except np.linalg.LinAlgError:
        w = np.linalg.lstsq(A, b, rcond=None)[0]
    return w, m, ym


def ridge_shot_aware(C, y, lam: float, shots: int = SHOTS_REF):
    """Ridge on RAW correlators with the expected shot covariance as penalty (RESEARCH Pattern 3).

    Penalty = N * diag(mean((1 - C^2) / shots)) + lambda * I; no per-column standardisation
    (standardising tiny-variance correlators is exactly what amplifies shot noise).
    Returns (w, corr_mean, y_mean); predict = (C - corr_mean) @ w + y_mean.
    """
    C = np.asarray(C, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    noise = np.mean((1.0 - C**2) / float(shots), axis=0)
    return _ridge(C, y, lam, noise)


def shot_sigma(C, w, shots: int) -> float:
    """Expected prediction standard deviation (nT) from shot noise at `shots` shots."""
    C = np.asarray(C, dtype=np.float64)
    w = np.asarray(w, dtype=np.float64)
    return float(np.sqrt(np.mean(np.sum(w**2 * (1.0 - C**2) / float(shots), axis=1))))


def _blocked_cv(X: np.ndarray, y: np.ndarray, fit, n_blocks: int = CV_BLOCKS) -> float:
    """Out-of-block RMSE over contiguous blocks (edges as classical._blocked_cv_rmse)."""
    edges = np.linspace(0, len(y), n_blocks + 1).astype(int)
    sq, count = 0.0, 0
    for k in range(n_blocks):
        test = np.zeros(len(y), dtype=bool)
        test[edges[k] : edges[k + 1]] = True
        w, m, ym = fit(X[~test], y[~test])
        err = y[test] - ((X[test] - m) @ w + ym)
        sq += float(np.sum(err * err))
        count += int(test.sum())
    return float(np.sqrt(sq / count))


# calibration Statevector correlators keyed by (sha1(z bytes), fmap, gates hash, bandwidth), so
# a second sensor with the same fluxgate (identical standardised features) reuses them
_CAL_CORR_CACHE: dict = {}


def _gates_key(gates) -> str:
    return "" if gates is None else hashlib.sha1(json.dumps(gates, sort_keys=True).encode()).hexdigest()


def _cal_correlators(Z: np.ndarray, fmap: str, gates, bandwidth: float) -> np.ndarray:
    zkey = hashlib.sha1(np.ascontiguousarray(Z, dtype=np.float64).tobytes()).hexdigest()
    key = (zkey, fmap, _gates_key(gates), float(bandwidth))
    if key not in _CAL_CORR_CACHE:
        _CAL_CORR_CACHE[key] = correlators_statevector(angles(Z, bandwidth), fmap, gates)
    return _CAL_CORR_CACHE[key]


def _circuit_info(fmap: str):
    if fmap == "identity":
        return None
    info = {
        "n_qubits": N_QUBITS,
        "layers": N_LAYERS,
        "order": CIRCUIT_ORDER if fmap == "designed" else RANDOM_ORDER,
        "slots": SLOTS_TEXT,
        "clip_sd": CLIP_SD,
        "angle": ANGLE_TEXT,
        "correlator_masks": list(MASKS),
    }
    if fmap == "designed":
        info["gate_counts_per_block"] = {"h": 8, "rz": 12, "ry": 12, "cz": 12}
    else:
        info["gate_counts_per_block"] = {"h": 8, "rz": 24, "ry": 24, "cz": 12}
        info["seed"] = RANDOM_MAP_SEED
    return info


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
    """Fixed feature map + shot-aware ridge readout on the TL residual (QNT-01, QNT-02).

    feature_map: "designed" (the frozen circuit), "random" (seeded ablation map, D-10b) or
    "identity" (ridge on the 22 standardised features, D-10a); all three train through
    this one code path. `frozen` is a readout dict (from data/quantum_model.json): fit()
    then only loads it and checks it still matches the calibration features.
    The injected backend is recorded for provenance and never used.
    """

    name = "quantum"
    status = "feature_map_ridge"

    def __init__(self, backend=None, feature_map: str = "designed", frozen=None):
        if feature_map not in FEATURE_MAPS:
            raise ValueError(f"unknown feature map {feature_map!r}; expected one of {FEATURE_MAPS}")
        if frozen is not None and frozen.get("feature_map", feature_map) != feature_map:
            raise ValueError(f"frozen readout is for feature map {frozen.get('feature_map')!r}, not {feature_map!r}")
        self.backend = backend
        self.feature_map = feature_map
        self.frozen = frozen
        self.gates = random_map_gates(RANDOM_MAP_SEED) if feature_map == "random" else None
        self.n_features = None
        self.mu = None
        self.sd = None
        self.bandwidth = None
        self.lam = None
        self.corr_mean = None
        self.weights = None
        self.y_mean = None
        self.cv_score = None
        self.cv_table = None
        self.shot_sigma_nT = None
        self.statevector_check_max_abs = None

    # -- helpers ----------------------------------------------------------------------
    def standardise(self, features) -> np.ndarray:
        """Calibration-standardised features z = (F - mu) / sd."""
        return (np.asarray(features, dtype=np.float64) - self.mu) / self.sd

    def _readout_input(self, Z: np.ndarray) -> np.ndarray:
        if self.feature_map == "identity":
            return Z
        return correlators_batch(angles(Z, self.bandwidth), self.feature_map, self.gates)

    def _check_engines(self, Z: np.ndarray, C_sv=None) -> float:
        if self.feature_map == "identity":
            return 0.0
        theta = angles(Z, self.bandwidth)
        if C_sv is None:
            C_sv = correlators_statevector(theta, self.feature_map, self.gates)
        return float(np.abs(correlators_batch(theta, self.feature_map, self.gates) - C_sv).max())

    # -- training ---------------------------------------------------------------------
    def fit(self, features, residual):
        F = np.asarray(features, dtype=np.float64)
        y = np.asarray(residual, dtype=np.float64)
        self.n_features = int(F.shape[1])
        if self.frozen is not None:
            return self._load_frozen(F)
        self.mu = F.mean(axis=0)
        sd = F.std(axis=0)
        self.sd = np.where(sd > _EPS, sd, 1.0)
        Z = self.standardise(F)
        if self.feature_map == "identity":
            self._fit_identity(Z, y)
        else:
            self._fit_map(Z, y)
        return self

    def _fit_identity(self, Z: np.ndarray, y: np.ndarray) -> None:
        zero = np.zeros(Z.shape[1])
        table, best = [], None
        for lam in LAMBDAS_IDENTITY:
            cv = _blocked_cv(Z, y, lambda X, t, lam=lam: _ridge(X, t, lam, zero))
            table.append({"bandwidth": None, "lambda": float(lam), "cv_rmse": cv, "shot_sigma_4096": 0.0, "score": cv})
            key = (round(cv, 9), -float(lam))
            if best is None or key < best[0]:
                best = (key, float(lam), cv)
        _, self.lam, self.cv_score = best
        self.bandwidth = None
        self.weights, self.corr_mean, self.y_mean = _ridge(Z, y, self.lam, zero)
        self.cv_table = table
        self.shot_sigma_nT = {"500": 0.0, "4096": 0.0}
        self.statevector_check_max_abs = 0.0

    def _fit_map(self, Z: np.ndarray, y: np.ndarray) -> None:
        table, best = [], None
        for b in BANDWIDTHS:
            C = _cal_correlators(Z, self.feature_map, self.gates, b)
            for lam in LAMBDAS_QUANTUM:
                cv = _blocked_cv(C, y, lambda X, t, lam=lam: ridge_shot_aware(X, t, lam))
                w, _, _ = ridge_shot_aware(C, y, lam)
                sig = shot_sigma(C, w, SHOTS_REF)
                score = float(np.sqrt(cv * cv + sig * sig))
                table.append(
                    {"bandwidth": float(b), "lambda": float(lam), "cv_rmse": cv, "shot_sigma_4096": sig, "score": score}
                )
                key = (round(score, 9), -float(lam), float(b))  # ties: larger lambda, then smaller bandwidth
                if best is None or key < best[0]:
                    best = (key, float(b), float(lam), score)
        _, self.bandwidth, self.lam, self.cv_score = best
        C = _cal_correlators(Z, self.feature_map, self.gates, self.bandwidth)
        self.weights, self.corr_mean, self.y_mean = ridge_shot_aware(C, y, self.lam)
        self.cv_table = table
        self.shot_sigma_nT = {
            "500": shot_sigma(C, self.weights, SHOTS_HARDWARE),
            "4096": shot_sigma(C, self.weights, SHOTS_REF),
        }
        self.statevector_check_max_abs = self._check_engines(Z, C)

    def _load_frozen(self, F: np.ndarray):
        ro = self.frozen
        mu = np.asarray(ro["feature_mu"], dtype=np.float64)
        sd = np.asarray(ro["feature_sd"], dtype=np.float64)
        now = F.mean(axis=0)
        if now.shape != mu.shape or np.any(np.abs(now - mu) > 1e-6 * (np.abs(mu) + sd)):
            raise ValueError("data/quantum_model.json is stale for these calibration features")
        self.mu, self.sd = mu, sd
        self.bandwidth = None if ro["bandwidth"] is None else float(ro["bandwidth"])
        self.lam = float(ro["lambda"])
        self.corr_mean = np.asarray(ro["corr_mean"], dtype=np.float64)
        self.weights = np.asarray(ro["weights"], dtype=np.float64)
        self.y_mean = float(ro["y_mean"])
        self.cv_score = ro.get("cv_score")
        self.cv_table = ro.get("cv_table")
        self.shot_sigma_nT = dict(ro.get("shot_sigma_nT") or {})
        if self.feature_map == "random":
            self.gates = ro["gates"]
        self.statevector_check_max_abs = self._check_engines(self.standardise(F[:8]))
        return self

    # -- inference --------------------------------------------------------------------
    def predict(self, features) -> np.ndarray:
        """Residual correction in nT (numpy batch engine; never touches the backend)."""
        if self.weights is None:
            raise RuntimeError("QuantumDenoiser.predict called before fit")
        F = np.asarray(features, dtype=np.float64)
        if len(F) == 0:
            return np.zeros(0)
        return (self._readout_input(self.standardise(F)) - self.corr_mean) @ self.weights + self.y_mean

    @property
    def readout(self) -> dict:
        """JSON-ready frozen readout (the per-sensor entry of data/quantum_model.json)."""
        if self.weights is None:
            raise RuntimeError("QuantumDenoiser.readout requested before fit")
        out = {
            "feature_map": self.feature_map,
            "feature_mu": [float(v) for v in self.mu],
            "feature_sd": [float(v) for v in self.sd],
            "bandwidth": self.bandwidth,
            "lambda": float(self.lam),
            "corr_mean": [float(v) for v in self.corr_mean],
            "weights": [float(v) for v in self.weights],
            "y_mean": float(self.y_mean),
            "cv_score": None if self.cv_score is None else float(self.cv_score),
            "cv_table": self.cv_table,
            "shot_sigma_nT": {k: float(v) for k, v in self.shot_sigma_nT.items()},
        }
        if self.feature_map == "random":
            out["gates"] = self.gates
        return out

    @property
    def provenance(self) -> dict:
        return {
            "source": "feature_map_ridge",
            "feature_map": self.feature_map,
            "backend": _backend_name(self.backend),
            "n_features": self.n_features,
            "circuit": _circuit_info(self.feature_map),
            "bandwidth": self.bandwidth,
            "lambda": self.lam,
            "cv_score": self.cv_score,
            "cv_table": self.cv_table,
            "selection": SELECTION_IDENTITY if self.feature_map == "identity" else SELECTION_MAP,
            "shots_ref": SHOTS_REF,
            "shot_sigma_nT": self.shot_sigma_nT,
            "statevector_check_max_abs": self.statevector_check_max_abs,
            "engine": "numpy ridge on standardised features" if self.feature_map == "identity" else ENGINE_TEXT,
        }


# ---------------------------------------------------------------------------
# Verification samples (D-07..D-09)
# ---------------------------------------------------------------------------


def verification_samples(den: QuantumDenoiser, features, indices) -> dict:
    """Exact (Statevector) correlators and predictions for the K verification samples."""
    if den.feature_map == "identity" or den.weights is None:
        raise ValueError("verification_samples needs a fitted feature-map (designed/random) denoiser")
    idx = [int(i) for i in indices]
    theta = angles(den.standardise(np.asarray(features, dtype=np.float64)[idx]), den.bandwidth)
    C = correlators_statevector(theta, den.feature_map, den.gates)
    pred = (C - den.corr_mean) @ den.weights + den.y_mean
    return {
        "indices": idx,
        "theta": theta.tolist(),
        "exact_corr": C.tolist(),
        "exact_pred_nT": [float(v) for v in pred],
    }


def verification_summary(counts: dict, sample: dict, readout: dict, k: int) -> dict:
    """Compare shot-estimated correlators/predictions with the exact ones (pure; D-08)."""
    k = int(k)
    if k < 1 or k > len(sample["indices"]):
        raise ValueError(f"K={k} outside 1..{len(sample['indices'])}")
    corr, marg, total = block_correlators_from_counts(counts, k)
    exact = np.asarray(sample["exact_corr"], dtype=np.float64)[:k]
    err = corr - exact
    cm = np.asarray(readout["corr_mean"], dtype=np.float64)
    w = np.asarray(readout["weights"], dtype=np.float64)
    shot_pred = (corr - cm) @ w + float(readout["y_mean"])
    exact_pred = np.asarray(sample["exact_pred_nT"], dtype=np.float64)[:k]
    delta = shot_pred - exact_pred
    rows = [
        {"index": int(i), "exact_pred_nT": float(e), "shot_pred_nT": float(s), "delta_nT": float(d)}
        for i, e, s, d in zip(sample["indices"][:k], exact_pred, shot_pred, delta, strict=True)
    ]
    return {
        "K": k,
        "total_shots": int(total),
        "max_abs_corr_err": float(np.abs(err).max()),
        "rms_corr_err": float(np.sqrt(np.mean(err**2))),
        "samples": rows,
        "rms_pred_delta_nT": float(np.sqrt(np.mean(delta**2))),
        "max_abs_pred_delta_nT": float(np.abs(delta).max()),
        "marginals": marg.tolist(),
    }


# ---------------------------------------------------------------------------
# Concentration diagnostics (D-11)
# ---------------------------------------------------------------------------

DIAG_QUANTILES = (5, 25, 50, 75, 95)
DIAG_BINS = 20
DIAG_PAIRS = 2000


def concentration_diagnostics(den_designed: QuantumDenoiser, den_random: QuantumDenoiser, z_by_dataset: dict) -> dict:
    """Correlator variance/histograms and pairwise-distance quantiles per dataset (RESEARCH Pattern 7).

    z_by_dataset: {"1006.08" | "1003.02" | "1007.06": calibration-standardised features (n, 22)}.
    """
    pairs, input_q, frac = {}, {}, {}
    for ds, z in z_by_dataset.items():
        z = np.asarray(z, dtype=np.float64)
        rng = np.random.default_rng(VERIFY_SEED)
        i = rng.integers(0, len(z), DIAG_PAIRS)
        j = rng.integers(0, len(z), DIAG_PAIRS)
        pairs[ds] = (i, j)
        d_in = np.linalg.norm(z[i] - z[j], axis=1) / np.sqrt(z.shape[1])
        input_q[ds] = [float(v) for v in np.percentile(d_in, DIAG_QUANTILES)]
        frac[ds] = float(np.mean(np.abs(z) > CLIP_SD))
    out = {
        "quantiles": list(DIAG_QUANTILES),
        "hist_bins": DIAG_BINS,
        "hist_range": [-1.0, 1.0],
        "n_pairs": DIAG_PAIRS,
        "seed": VERIFY_SEED,
        "frac_clipped": frac,
    }
    for label, den in (("designed", den_designed), ("random", den_random)):
        corr_var, corr_hist, pair_dist = {}, {}, {}
        for ds, z in z_by_dataset.items():
            C = np.clip(den._readout_input(np.asarray(z, dtype=np.float64)), -1.0, 1.0)
            corr_var[ds] = [float(v) for v in C.var(axis=0)]
            corr_hist[ds] = [
                [int(c) for c in np.histogram(C[:, m], bins=DIAG_BINS, range=(-1.0, 1.0))[0]] for m in range(C.shape[1])
            ]
            i, j = pairs[ds]
            d_c = np.linalg.norm(C[i] - C[j], axis=1) / np.sqrt(C.shape[1])
            pair_dist[ds] = {"corr": [float(v) for v in np.percentile(d_c, DIAG_QUANTILES)], "input": input_q[ds]}
        out[label] = {
            "feature_map": den.feature_map,
            "bandwidth": den.bandwidth,
            "corr_var": corr_var,
            "corr_hist": corr_hist,
            "pair_dist": pair_dist,
            "shot_sigma_nT": {k: float(v) for k, v in den.shot_sigma_nT.items()},
        }
    return out


# ---------------------------------------------------------------------------
# Model file I/O (data/quantum_model.json)
# ---------------------------------------------------------------------------


def readout_sha256(sensors_dict: dict) -> str:
    """sha256 of the per-sensor readouts, independent of key order."""
    text = json.dumps(sensors_dict, sort_keys=True, separators=(",", ":"), allow_nan=False)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def build_model(sensors: dict, ablation: dict, samples: dict, random_gates: dict, statevector_check: float) -> dict:
    """Assemble the data/quantum_model.json document (schema magnav.quantum_model.v1)."""
    return {
        "schema": MODEL_SCHEMA,
        "circuit": _circuit_info("designed"),
        "shots_ref": SHOTS_REF,
        "k_policy": {
            "builtin": K_BUILTIN,
            "ionq_max": K_IONQ_MAX,
            "shots_ionq_sim": SHOTS_IONQ_SIM,
            "shots_hardware": SHOTS_HARDWARE,
        },
        "sensors": sensors,
        "ablation": ablation,
        "samples": samples,
        "random_map": random_gates,
        "statevector_check_max_abs": float(statevector_check),
        "readout_sha256": readout_sha256(sensors),
    }


def write_model(model: dict, path=MODEL_PATH) -> int:
    """Deterministic JSON (sorted keys, no NaN, trailing newline); returns bytes written."""
    data = (json.dumps(model, sort_keys=True, separators=(",", ":"), allow_nan=False) + "\n").encode("utf-8")
    if len(data) > MODEL_MAX_BYTES:
        raise ValueError(f"quantum model is {len(data)} bytes, above the 2 MB Qollab file limit")
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    return len(data)


def load_model(path=MODEL_PATH) -> dict:
    """Load the frozen model with json.load only (no pickle)."""
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)

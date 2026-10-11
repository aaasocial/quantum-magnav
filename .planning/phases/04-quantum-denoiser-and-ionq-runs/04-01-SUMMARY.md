---
phase: 04-quantum-denoiser-and-ionq-runs
plan: 01
subsystem: quantum
tags: [qiskit, statevector, feature-map, ridge, shot-noise, ablation]
requires: []
provides:
  - "magnav/quantum.py: frozen 4-qubit feature-map circuit (D-19 order), two exact engines, packed verification circuit, counts decoding"
  - "QuantumDenoiser(backend=None, feature_map='designed'|'identity'|'random', frozen=None) with a shot-aware ridge readout and blocked CV"
  - "verification_samples / verification_summary, concentration_diagnostics, readout_sha256, build_model / write_model / load_model"
affects: [04-02 pipeline wiring + data/quantum_model.json, 04-04 api.quantum_verify, live mode]
tech-stack:
  added: []
  patterns:
    - "One circuit definition; Statevector for training and verification, numpy batch engine for prediction, max |delta| recorded"
    - "Shot-aware Tikhonov ridge on raw correlators, selected by sqrt(CV^2 + sigma_shot(4096)^2)"
key-files:
  created:
    - tests/test_quantum.py
  modified:
    - magnav/quantum.py
  deleted:
    - tests/test_quantum_stub.py
decisions:
  - "Random ablation map: one seeded permutation of the 24 slots stored in every layer's 'perm', so each feature enters exactly once; per layer data RZ, data RY, fixed RZ, fixed RY, 4 CZ on distinct pairs"
  - "Frozen readout stale guard: |mean_now - feature_mu| > 1e-6 * (|feature_mu| + feature_sd) raises ValueError"
  - "Readout dict carries cv_table/cv_score/shot_sigma_nT, so frozen provenance equals trained provenance (artifact determinism for Plan 02)"
  - "write_model uses compact separators plus sort_keys and a trailing newline; 2 MB cap raises ValueError"
metrics:
  duration: "~11 min"
  completed: 2026-10-11
  tasks: 2
  files: 3
---

# Phase 4 Plan 01: Frozen quantum feature map and shot-aware denoiser module Summary

`magnav/quantum.py` now holds the real Qiskit feature-map denoiser. It has a frozen 4-qubit circuit (H, [RZ, RY, CZ ring] x3, H) and two exact engines: qiskit Statevector and numpy batch. They agree to about 1e-15. The readout is a shot-aware ridge chosen by blocked CV, and identity and random ablation maps train through the same code path. The module also has a frozen-readout mode, concentration diagnostics, verification helpers and deterministic model-file I/O. It never touches the backend.

## Final function signatures

```python
angles(z, bandwidth) -> np.ndarray (n, 24)            # slots 22, 23 = 0
feature_block(theta=None) -> QuantumCircuit           # ParameterVector("x", 24) when None
random_map_gates(seed=RANDOM_MAP_SEED) -> dict        # {seed, layers:[{perm, rz, ry, cz}] x3}
random_block(theta, gates) -> QuantumCircuit
correlators_statevector(theta, fmap="designed", gates=None) -> (n, 15)
correlators_batch(theta, fmap="designed", gates=None) -> (n, 15)
packed_circuit(theta_k, fmap="designed", gates=None) -> QuantumCircuit  # 4K qubits, one "meas" creg
block_correlators_from_counts(counts, k) -> (corr (K,15), marginals (K,16) int64, total_shots)
ridge_shot_aware(C, y, lam, shots=SHOTS_REF) -> (w, corr_mean, y_mean)
shot_sigma(C, w, shots) -> float
class QuantumDenoiser(backend=None, feature_map="designed", frozen=None)
    .fit(features, residual) / .predict(features) / .standardise(features)
    .readout (dict) / .provenance (dict)
    attrs: bandwidth, lam, cv_score, cv_table, shot_sigma_nT, statevector_check_max_abs, gates
verification_samples(den, features, indices) -> {indices, theta, exact_corr, exact_pred_nT}
verification_summary(counts, sample, readout, k) -> {K, total_shots, max_abs_corr_err, rms_corr_err,
    samples[{index, exact_pred_nT, shot_pred_nT, delta_nT}], rms_pred_delta_nT, max_abs_pred_delta_nT, marginals}
concentration_diagnostics(den_designed, den_random, z_by_dataset) -> dict
readout_sha256(sensors_dict) -> str
build_model(sensors, ablation, samples, random_gates, statevector_check) -> dict
write_model(model, path=MODEL_PATH) -> int (bytes)
load_model(path=MODEL_PATH) -> dict
```

## Measured results

**CV fit, mag_5_uc on 1006.08** (fluxgate flux_a; calibration residual std 16.53 nT):

| Map | bandwidth | lambda | CV score (nT) | sigma_shot @500 / @4096 (nT) |
|---|---|---|---|---|
| designed | 0.25 | 0.1 | 16.932 | 5.241 / 1.831 |
| random | 0.05 | 1.0 | 16.447 | 4.642 / 1.622 |
| identity | None | 1000 | 15.991 | 0 / 0 |

These match the research numbers: the designed map comes out near the predict-zero level, and the random and identity maps score slightly better. Plan 02 and the README should report this as measured (D-12).

**statevector_check_max_abs:** 1.1e-15 for the designed fit, measured over all 1678 training rows at the chosen bandwidth (random map also 1.1e-15). On 200 random theta rows over the full angle range, the max |batch - Statevector| was 7.8e-16 for the designed map and 1.0e-15 for the random map. The batch engine took 1.2 ms for those 200 rows; Statevector took 193 ms.

**Runtimes:**
- `tests/test_quantum.py`: 19 tests in 24 s. The designed CV fit takes about 9 s, the random fit about 13 s, and the Statevector cache makes repeat fits nearly free.
- Plan test selection (`--ignore` the three deferred files): 138 passed in 52 s.
- Full suite before Task 2, with the stub still in place: 160 passed in 112 s.
- The three deferred files run on their own in 103 s.

## Tasks

| Task | Commits |
|---|---|
| 1. Circuit contract, engines, random map, packed circuit, counts decoding | 5971253 (test), a641ef3 (feat) |
| 2. Shot-aware ridge, QuantumDenoiser, diagnostics, verification helpers, model I/O | c165c49 (test, removes test_quantum_stub.py), bfc69a9 (feat) |

## Expected interim failures (resolved by Plan 02)

The plan says these stub-era assertions will fail until Plan 02 regenerates the artifact. Four tests fail:
- `test_artifact_regression.py::test_signal_and_dr_metrics_match_artifact[1003.02]` and `[1007.06]`.
- `test_live.py::test_live_tl_equals_committed_artifact`: TL still matches; only `est["quantum"] == est["tl"]` fails.
- `test_live.py::test_step_never_starts_a_second_denoiser`.

`tests/test_artifact.py` still passes, because it reads the committed stub-era artifact.

## Deviations from Plan

**1. [Rule 2 - Completeness] Extra tests beyond the behavior list.** I added `test_feature_block_gate_order` (exact D-19 gate sequence and gate counts), `test_angles_spare_slots_zero`, `test_ridge_shot_aware_closed_form` and `test_concentration_diagnostics`. The must-haves call for computable diagnostics, and the plan listed no test for them. The new tests are in commits 5971253 and c165c49.

**2. Constructor guard.** `QuantumDenoiser(feature_map=..., frozen=...)` raises ValueError if the frozen readout's `feature_map` differs from the requested one. Without this, a random-map readout could be applied silently with the designed circuit.

Otherwise the plan ran as written. All grep gates hold: zero `.run(`, no classical or pipeline imports, no simulator or provider names, a literal `MODEL_PATH`, no `run_inference`, and exactly one `class QuantumDenoiser`.

## Known Stubs

None. `live.py` and `pipeline.py` still describe the quantum slot as a stub in comments. Plan 02 owns that wiring.

## TDD Gate Compliance

Each task has a RED `test(04-01)` commit followed by a GREEN `feat(04-01)` commit. No refactor commits were needed.

## Self-Check: PASSED

- FOUND: magnav/quantum.py, tests/test_quantum.py; tests/test_quantum_stub.py removed
- FOUND commits: 5971253, a641ef3, c165c49, bfc69a9

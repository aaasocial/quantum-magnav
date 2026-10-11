# Phase 4: Quantum Denoiser and IonQ Runs - Context

**Gathered:** 2026-10-10
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous); 4 grey areas, all accepted by the builder

<domain>
## Phase Boundary

The quantum slot holds a real Qiskit feature-map denoiser that a visitor can run on IonQ Forte 1 from Qollab in exactly one single-circuit job, its contribution is shown by ablation rather than assumed, and one real hardware result is captured as early as the circuit is final. Requirements: QNT-01..QNT-06, UI-04. Delivers: `magnav/quantum.py` real implementation (same `fit/predict` residual-model protocol as `KRRResidual`, consuming `classical.kernel_features` = 22 features), Statevector training, ridge readout, ablation and concentration diagnostics, the packed single-circuit IonQ verification job via `backend.run(circuit)` + `get_counts()`, hardware capture file, artifact/provenance additions, and the UI-04 badges and table rows. Out of scope: training on any backend, multi-circuit jobs, quantum map matching, publishing (gated), posting to organizers (gated).

Platform constraints (docs/QOLLAB_FINDINGS.md): Qollab IonQ proxy accepts only `ionq.circuit.v1` (one bare circuit per `backend.run`), one IonQ job per Run; Forte 1 remote simulator 29 qubits with `forte-1` noise model, ~12 s per job, 4096 shots OK; built-in simulator 24 qubits ideal; hardware "IonQ Forte 1 (36q) Credits apply", balance 100 credits, the runner quotes a price and asks approval above the allowance; Pyodide Python 3.14, qiskit 2.5.2, numpy/scipy only (no scikit-learn), Python on the main thread (chunk long work at ~250 ms via the Phase 3 live_step pattern); `BackendSamplerV2` returns zeros on IonQ (never use it); the quantum code runs on Qollab via `magnav.api` with the injected `backend`.

</domain>

<decisions>
## Implementation Decisions

### Feature map (D-01..D-05)
- D-01: 4 qubits per sample block. Six blocks fit the 24-qubit built-in simulator; seven fit Forte 1 (29 qubits).
- D-02: Encoding: the 22 standardized TL-residual features (`classical.kernel_features`, standardized on calibration data only) are angle-encoded over 3 RY/RZ encoding layers (8 angles per layer, 24 slots; the 2 spare slots are fixed to 0 or reuse the two highest-variance features, stated in code), interleaved with 3 CZ-ring entangling layers (the ROADMAP hard limit of ≤3 entangling layers).
- D-03: Readout features: all Z-basis correlators of the 4 qubits (4 ⟨Z⟩, 6 ⟨ZZ⟩, 4 ⟨ZZZ⟩, 1 ⟨ZZZZ⟩ = 15 values), so a single Z-basis measurement of one circuit yields every readout feature.
- D-04: Training expectations are computed with exact `qiskit.quantum_info.Statevector` locally (and in-page for live mode); the classical ridge readout is fit on the TL residual of calibration line 1006.08 with blocked CV for lambda, exactly like KRR (D-09/D-19 of Phase 2); no training on any backend.
- D-05: Feature scaling into angles: features are clipped to ±3 standard deviations and scaled to a bandwidth parameter (chosen by the same blocked CV on 1006.08 from a small grid); the chosen bandwidth is recorded in provenance.

### The one IonQ job (D-06..D-09)
- D-06: Full-line quantum predictions use Statevector expectations for every sample (computed locally for the artifact and in-page for live mode via the chunked `live_step` pattern).
- D-07: The IonQ job is a verification showcase: K held-out samples (K = 6 on the 24-qubit built-in simulator, K = 7 on Forte 1) are packed as disjoint 4-qubit blocks into ONE circuit, measured in the Z basis with 4096 shots on the simulator (500 on hardware), submitted with exactly one `backend.run(circuit, shots=...)` call and read with `get_counts()`; a test asserts one call with a bare `QuantumCircuit`.
- D-08: The shot-estimated correlators are compared with the exact Statevector correlators for the same samples; the resulting quantum-prediction difference (nT) is reported as the hardware/shot-noise error bar in the artifact and UI.
- D-09: On the built-in simulator the same packed circuit runs (ideal) with a notice; on Forte 1 the `forte-1` noise model applies; the K samples are the first K navigator-window centre samples after the jam on the selected line/sensor (deterministic).

### Ablation and honesty checks (D-10..D-12)
- D-10: Three readouts trained identically on 1006.08: (a) identity map = ridge on the 22 standardized features, (b) random fixed 4-qubit unitary of the same depth (seeded, recorded), (c) the designed feature map; held-out signal RMSE/std and position metrics for all three appear in the benchmark table and artifact.
- D-11: Concentration diagnostics: histogram and variance of each of the 15 correlators on calibration vs held-out data, plus the pairwise feature-distance distribution; recorded in the artifact (`quantum.diagnostics`) and summarized in the README.
- D-12: Results are reported as measured; no held-out tuning; if the designed map does not beat the identity/random maps, the README says so plainly (the theme requires honesty, not advantage claims).

### Hardware run and provenance UI (D-13..D-16)
- D-13: The real IonQ Forte 1 (36q) hardware job is the same packed verification circuit at 500 shots, submitted from the builder's account through the Qollab runner as soon as the circuit is frozen; because it spends credits, the orchestrator asks the builder for explicit in-session approval before pressing Run on the hardware backend (treat as `checkpoint:human-action`); executors never submit hardware jobs.
- D-14: Counts, backend name, shots, timestamp and the K sample ids go to `data/forte_hardware_run.json`; the UI shows a labeled "recorded hardware result" badge; if credits are refused or the job fails, the `forte-1` noise-model simulator result is shown and labeled "proxy (noise model)".
- D-15: UI-04: StatusStrip gains provenance badges for the quantum leg (backend name, shots, timestamp, "recorded hardware result" / "proxy"), and the metrics table gains the quantum rows (designed, identity, random) with the shot-noise error bar; the "Quantum slot (stub until Phase 4)" label is replaced by "Quantum feature map".
- D-16: Phase 4 keeps every Phase 3 contract: single `main.js` ES module < 1.5 MB, zero exports, precomputed-first with live fallback, one aria-live region, no `setTimeout` outside probe.js.

### Post-research amendments (D-17..D-19, accepted by the builder 2026-10-10 after 04-RESEARCH.md)
- D-17 (amends D-07/D-09): K = 4 samples (16 qubits) on the built-in simulator; K = 7 (28 qubits) on IonQ Forte 1 remote simulator and hardware. A free "ladder" run on the Forte remote simulator (K=7 @4096 shots → K=7 @1024 → K=6 → K=5) is performed right after the circuit is frozen to find the largest K that runs; the chosen K is recorded in provenance.
- D-18 (amends D-06): full-line and in-page quantum predictions use a numpy simulation of the identical circuit (verified to match `qiskit.quantum_info.Statevector` to ~6e-16, ~70× faster); training (readout fit) and the K verification samples still use Qiskit `Statevector` exactly; every run records the max |Δ| between the two engines in provenance.
- D-19 (amends D-02/D-04): gate order H, [RZ, RY, CZ-ring] × 3, H so every angle and every CZ affects the Z-basis measurement; the ridge readout is shot-noise-aware (penalises the expected shot variance of each correlator), chosen by the same blocked CV on 1006.08; the resulting shot-noise error bar is reported (D-08).

### Claude's Discretion
Exact ridge/bandwidth grids, circuit transpilation settings for IonQ (`optimization_level` 0–1), how correlators are extracted from counts (bitstring ordering), the Statevector batching for 7568 samples (vectorize by building the state per sample; ~ms each), artifact field names under `quantum.*`, and the in-page progress wording for the quantum stages.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `magnav/quantum.py` stub with the final interface (`fit/predict/provenance/run_inference`), `magnav/classical.py` (`kernel_features`, `KRRResidual`, `ResidualCorrected`, blocked-CV helpers, `select_tl_config`), `magnav/live.py` chunked stages, `magnav/api.py` (`backend_info`, `run_bell_batch` single-circuit submission + `get_counts(i)`, `_failure`, `is_ionq`), `magnav/artifact.py` (`line_entry`, validators), `tests/test_quantum_stub.py`, `tests/test_live.py`.
- Frontend: StatusStrip badges, MetricsTable rows, Announcer, `liveRun.js` driver, dev stub `magnavApiStub.js`.

### Established Patterns
- One `backend.run` per Run with a bare circuit; `get_counts()`; never `BackendSamplerV2`; never construct providers.
- Calibration-only selection; held-out results reported as measured.
- Chunked Python calls for in-page work; probes; artifact regeneration via `main.py` (byte-identical check in tests).

### Integration Points
- `main.py` pipeline run (adds quantum rows; regenerates `data/precomputed_run.json`, keep < 2 MB), `tests/test_artifact_regression.py`, `scripts/package_qollab.sh` allowlist (`data/forte_hardware_run.json`), README method notes, `requirements.txt` unchanged (qiskit only).

</code_context>

<specifics>
## Specific Ideas

- Freeze the circuit as early as possible in the phase so the hardware request can be made to the builder while the rest proceeds.
- Keep the Statevector training fast: 1678 calibration rows × 4 qubits is trivial; the 7568-row held-out evaluation also fine; in-page (Pyodide ~3× slower) still seconds.
- The quantum verification job UI flow mirrors Phase 1's smoke page: a "Verify on this backend" button that submits the single packed circuit once per Run and locks, with the comparison shown in the status strip.

</specifics>

<deferred>
## Deferred Ideas

- Multi-basis readouts (X/Y correlators) — would need more than one circuit per Run.
- QAOA feature selection, quantum reservoir with memory (v2).
- Compact layout for the 520 px preview (Phase 5).

</deferred>

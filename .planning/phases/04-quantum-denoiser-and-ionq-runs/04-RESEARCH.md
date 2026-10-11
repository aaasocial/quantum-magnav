# Phase 4: Quantum Denoiser and IonQ Runs - Research

**Researched:** 2026-10-10 (~17:00-18:30 PDT)
**Domain:** Qiskit 2.5 fixed feature map + classical ridge readout (quantum extreme-learning style), single-circuit IonQ verification job on Qollab, provenance UI
**Confidence:** HIGH for circuit mechanics, timings, bit ordering, qiskit-ionq behaviour (all measured locally or read from the 1.0.2 source); MEDIUM for IonQ remote-simulator behaviour at 28 qubits and the hardware cost (not testable locally); results of the model itself are measured on the real data below.

## Summary

Every mechanical question in this phase now has a measured answer. The 4-qubit, 3-layer feature map builds as a 24-slot `ParameterVector` circuit. One exact `Statevector` costs 0.78 ms per sample in CPython, which is 1.3 s for the 1678 calibration rows and 8.2 s for the 10480 rows of line 1007.06. A vectorised numpy statevector of the same circuit agrees with `qiskit.quantum_info.Statevector` to 5.6e-16 and runs all 10480 rows in 82 ms. All 15 Z-basis correlators come from `probabilities() @ S`, where S is a fixed 16x15 sign matrix. Packing K blocks into one circuit with `measure_all()` gives a single `meas` register, so the bitstrings have no spaces. Clbit i is bit i of `int(bitstring, 2)`, so block k is `(v >> 4k) & 15` (verified with a deterministic X-gate test). IonQ's QIS target lists `cz` natively, its coupling map is all-to-all (812 = 29x28 edges), and `transpile(..., optimization_level=1)` on a 28-qubit packing gives depth 20, 84 CZ and no SWAPs.

Three findings change the locked plan, and the planner must act on them:

1. **K = 6 on the built-in simulator is not feasible.** BasicSimulator on 24 qubits at 4096 shots takes 51.9 s and 1.04 GB RSS in CPython. With Pyodide about 2.7x slower, that is roughly 140 s of frozen main thread. 20 qubits takes 2.8 s (about 7.5 s in-page) and 16 qubits takes 0.17 s (about 0.5 s in-page). Use **K = 4 (16 qubits) on the built-in simulator** and K = 7 (28 qubits) on Forte 1.
2. **The naive gate order wastes slots.** RY, RZ then CZ makes the last RZ layer and the last CZ ring diagonal before a Z measurement: slots 20-23 measured dead. Putting the CZ ring first after H fixes the dead slots, but the 4-cycle graph state leaves every qubit maximally mixed, and that variant had the worst CV. The recommended order is **H, [RZ(4), RY(4), CZ ring] x 3, H**: every slot and every CZ matters, and it had the best CV.
3. **Concentration really does blow up shot noise.** At the CV-preferred small bandwidth, the correlator variances are about 1e-4. A plain standardised ridge then gets weights up to 14,000 nT per unit, so the predicted shot-noise error bar is **459 nT at 4096 shots and 1313 nT at 500 shots**. The fix is a **shot-aware ridge**: Tikhonov regularisation with the expected shot covariance at 4096 shots, selected by sqrt(CV^2 + sigma_shot^2). That brings the bar to **1.9 nT at 4096 and 5.5 nT at 500** (Mag 5), or 10.3 and 29.4 nT (Mag 4).

Honest expectation for the benchmark (D-12): on the real data, the designed map **does not beat** the identity or random maps, or KRR. Its calibration CV is essentially the "predict zero correction" level (16.8 vs 16.5 nT residual std for Mag 5; 80.8 vs 80.9 nT for Mag 4). Held-out RMSE (whole segment) / error std: Mag 5 on 1003.02 goes from TL 40.7/29.5 to designed 38.1/29.9; Mag 4 on 1003.02 goes from TL 384.8/194.2 to designed 365.2/198.9. The random map with the same readout is slightly better than the designed one. The README must say so plainly.

**Primary recommendation:** Build `magnav/quantum.py` around one shared circuit definition. Use two exact engines: qiskit `Statevector` (canonical, used for training and for the verification samples) and a numpy batch engine that every run cross-checks against it (used for full-line and in-page prediction). Use a shot-aware ridge readout and ship its weights in `data/quantum_model.json`. Add one `api.quantum_verify(backend, line, sensor)` that submits exactly one bare packed circuit (K = 4 built-in, K = 7 IonQ). Freeze the circuit first (Plan 1), then check the K = 7 / 4096-shot Forte simulator ladder (free), then raise the hardware checkpoint.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Feature map, correlators, readout training | Python (local CPython, `main.py`) | Python in-page (Pyodide) for live mode | Training is classical and deterministic. The artifact is generated locally, and live mode re-fits in-page with the fast engine. |
| Trained model (weights, scaling, chosen samples) | Static data file `data/quantum_model.json` | Artifact `provenance.quantum` (hash + summary) | `quantum_verify` must not train in-page or depend on a live run having happened. |
| Packed circuit build + single `backend.run` | Python in-page (`magnav.api.quantum_verify`) | Qollab runner / IonQ cloud (executes job) | The injected `backend` exists only in-page. One bare circuit per Run. |
| One-job lock | JS (button state) | Python module flag (defence in depth) | JS stops double clicks. Python refuses a second IonQ submission in the same interpreter session. |
| Recorded hardware/proxy result | Static data file `data/forte_hardware_run.json` | Python reader `api.quantum_recorded` | Captured once by the builder. The page reads it every load. |
| Badges, metrics rows, verify panel | Browser (React) | — | Display only. The numbers come from Python JSON, never recomputed in JS. |
| Ablation + diagnostics | Python local (`main.py`) into the artifact | — | Needs truth (scoring) and TERCOM, so it is precomputed. |

## User Constraints

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Feature map (D-01..D-05)
- D-01: 4 qubits per sample block. Six blocks fit the 24-qubit built-in simulator; seven fit Forte 1 (29 qubits).
- D-02: Encoding: the 22 standardized TL-residual features (`classical.kernel_features`, standardized on calibration data only) are angle-encoded over 3 RY/RZ encoding layers (8 angles per layer, 24 slots; the 2 spare slots are fixed to 0 or reuse the two highest-variance features, stated in code), interleaved with 3 CZ-ring entangling layers (the ROADMAP hard limit of ≤3 entangling layers).
- D-03: Readout features: all Z-basis correlators of the 4 qubits (4 ⟨Z⟩, 6 ⟨ZZ⟩, 4 ⟨ZZZ⟩, 1 ⟨ZZZZ⟩ = 15 values), so a single Z-basis measurement of one circuit yields every readout feature.
- D-04: Training expectations are computed with exact `qiskit.quantum_info.Statevector` locally (and in-page for live mode); the classical ridge readout is fit on the TL residual of calibration line 1006.08 with blocked CV for lambda, exactly like KRR (D-09/D-19 of Phase 2); no training on any backend.
- D-05: Feature scaling into angles: features are clipped to ±3 standard deviations and scaled to a bandwidth parameter (chosen by the same blocked CV on 1006.08 from a small grid); the chosen bandwidth is recorded in provenance.

#### The one IonQ job (D-06..D-09)
- D-06: Full-line quantum predictions use Statevector expectations for every sample (computed locally for the artifact and in-page for live mode via the chunked `live_step` pattern).
- D-07: The IonQ job is a verification showcase: K held-out samples (K = 6 on the 24-qubit built-in simulator, K = 7 on Forte 1) are packed as disjoint 4-qubit blocks into ONE circuit, measured in the Z basis with 4096 shots on the simulator (500 on hardware), submitted with exactly one `backend.run(circuit, shots=...)` call and read with `get_counts()`; a test asserts one call with a bare `QuantumCircuit`.
- D-08: The shot-estimated correlators are compared with the exact Statevector correlators for the same samples; the resulting quantum-prediction difference (nT) is reported as the hardware/shot-noise error bar in the artifact and UI.
- D-09: On the built-in simulator the same packed circuit runs (ideal) with a notice; on Forte 1 the `forte-1` noise model applies; the K samples are the first K navigator-window centre samples after the jam on the selected line/sensor (deterministic).

#### Ablation and honesty checks (D-10..D-12)
- D-10: Three readouts trained identically on 1006.08: (a) identity map = ridge on the 22 standardized features, (b) random fixed 4-qubit unitary of the same depth (seeded, recorded), (c) the designed feature map; held-out signal RMSE/std and position metrics for all three appear in the benchmark table and artifact.
- D-11: Concentration diagnostics: histogram and variance of each of the 15 correlators on calibration vs held-out data, plus the pairwise feature-distance distribution; recorded in the artifact (`quantum.diagnostics`) and summarized in the README.
- D-12: Results are reported as measured; no held-out tuning; if the designed map does not beat the identity/random maps, the README says so plainly (the theme requires honesty, not advantage claims).

#### Hardware run and provenance UI (D-13..D-16)
- D-13: The real IonQ Forte 1 (36q) hardware job is the same packed verification circuit at 500 shots, submitted from the builder's account through the Qollab runner as soon as the circuit is frozen; because it spends credits, the orchestrator asks the builder for explicit in-session approval before pressing Run on the hardware backend (treat as `checkpoint:human-action`); executors never submit hardware jobs.
- D-14: Counts, backend name, shots, timestamp and the K sample ids go to `data/forte_hardware_run.json`; the UI shows a labeled "recorded hardware result" badge; if credits are refused or the job fails, the `forte-1` noise-model simulator result is shown and labeled "proxy (noise model)".
- D-15: UI-04: StatusStrip gains provenance badges for the quantum leg (backend name, shots, timestamp, "recorded hardware result" / "proxy"), and the metrics table gains the quantum rows (designed, identity, random) with the shot-noise error bar; the "Quantum slot (stub until Phase 4)" label is replaced by "Quantum feature map".
- D-16: Phase 4 keeps every Phase 3 contract: single `main.js` ES module < 1.5 MB, zero exports, precomputed-first with live fallback, one aria-live region, no `setTimeout` outside probe.js.

### Claude's Discretion
Exact ridge/bandwidth grids, circuit transpilation settings for IonQ (`optimization_level` 0–1), how correlators are extracted from counts (bitstring ordering), the Statevector batching for 7568 samples (vectorize by building the state per sample; ~ms each), artifact field names under `quantum.*`, and the in-page progress wording for the quantum stages.

### Deferred Ideas (OUT OF SCOPE)
- Multi-basis readouts (X/Y correlators) — would need more than one circuit per Run.
- QAOA feature selection, quantum reservoir with memory (v2).
- Compact layout for the 520 px preview (Phase 5).
</user_constraints>

### Evidence-driven deviations the planner must surface (not silently apply)

| Locked text | Evidence | Recommended reading | Needs builder OK? |
|---|---|---|---|
| D-01/D-07 "K = 6 on the 24-qubit built-in simulator" | 24 q BasicSimulator, 4096 shots: 51.9 s and 1.04 GB in CPython, so about 140 s in-page on the main thread | K = 4 (16 q, 0.17 s CPython) on built-in; K = 7 on Forte 1 | Yes (one-line confirm; D-01's "six fit" is about capacity, not feasibility) |
| D-04/D-06 "Statevector ... in-page" | Per-sample `Statevector` is about 2.1 ms in Pyodide. 1007.06 would need about 22 s of chunked work and would push the live run past its 80 s skip rule | Training locally uses qiskit `Statevector` verbatim. Full-line and in-page use a numpy batch engine of the same circuit, cross-checked against `Statevector` in tests and on every run (max abs diff is recorded) | Yes (wording); fallback is chunked Statevector at about 100 samples per `live_step` |
| D-02 "3 RY/RZ layers interleaved with 3 CZ rings" (order unspecified) | Naive order leaves 4 dead slots and a dead CZ ring | H, [RZ, RY, CZ ring] x 3, H. Still 3 encoding and 3 entangling layers; the H layers are fixed basis changes | No (inside D-02) |
| D-04 "classical ridge readout" | Plain ridge on concentrated correlators gives a 459-1313 nT shot-noise bar | Shot-aware ridge (Tikhonov with the expected shot covariance), still a closed-form classical ridge | No (inside "exact ridge grids" discretion), but state it in the README |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QNT-01 | 4-6 qubit fixed feature map, ≤3 entangling layers, encodes the aircraft-state features | Pattern 1 (circuit), measured dead-slot check, slot map = `kernel_features` columns 0-21, spare slots 22-23 = 0 |
| QNT-02 | Training via exact `Statevector`, never `backend.run`; ridge readout on the TL residual | Pattern 2 (engines), Pattern 3 (shot-aware ridge + blocked CV), measured CV numbers |
| QNT-03 | Exactly ONE `backend.run(circuit)` with a bare circuit; disjoint blocks; `get_counts()`; test asserts one call | Pattern 4 (packing + counts decoding), Pattern 5 (`quantum_verify`), the spy test in Validation |
| QNT-04 | Takes `backend`; runs on Forte 1 remote sim; degrades on built-in | K/shots policy table, measured BasicSimulator limits, IonQ transpile check, Forte K-ladder checkpoint |
| QNT-05 | Ablation (identity/random) + concentration/histogram check reported | Pattern 6 (random map), Pattern 7 (diagnostics), measured ablation numbers |
| QNT-06 | One real hardware job ≥500 shots → `data/forte_hardware_run.json`, labeled; proxy fallback | Hardware capture flow, file schema, cost analysis, human-action checkpoint |
| UI-04 | Metrics panel benchmark table + provenance badges (backend, shots, timestamp, hardware label) | UI section: StatusStrip badges, MetricsTable rows, VerifyPanel, dev stub |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Approval gate:** no agent may (a) submit to the hackathon, (b) publish/republish a Qollab version, or (c) post to organizer channels without explicit in-session approval. Every such step is a `checkpoint:human-action`. **The hardware job spends credits (D-13): it is also `checkpoint:human-action`; executors never submit it.** Simulator jobs, uploading files into the editor without publishing, building the zip and pushing to GitHub are allowed.
- All quantum code goes through Qiskit. The `backend` is injected, so never construct a provider or simulator in shipped code; tests inject `BasicSimulator`/spies.
- One `backend.run` per Run with a **bare** `QuantumCircuit` (Qollab IonQ proxy accepts only `ionq.circuit.v1`). Never `BackendSamplerV2`. Never `qiskit.execute`.
- Data files load on Qollab only if their path is a **literal string** in Python (`"data/quantum_model.json"`, `"data/forte_hardware_run.json"`), and they must be added to the `scripts/package_qollab.sh` allowlist. Each file is under 2 MB; 100 files max.
- No scikit-learn on Qollab (not preloaded). Use numpy/scipy only. `requirements.txt` stays `qiskit>=2.5.2,<3.0.0`.
- Python runs on the page's main thread, so keep each Python call short (about 250 ms budget for live steps). Use no JS `setTimeout` outside `probe.js`. Use one aria-live region. `main.js` stays a single ES module under 1.5 MB with zero exports.
- The precomputed artifact is deterministic (no wall-clock timestamps in it). The recorded hardware file is separate and may hold timestamps.
- Accessibility is required: text badges (not colour-only), labelled buttons, and announcements through `Announcer`.
- MIT license, attribution, and AI/library disclosure stay intact (README).

## Standard Stack

### Core (already installed; no new packages)
| Library | Version (verified locally) | Purpose | Why |
|---------|---------|---------|-----|
| qiskit | 2.5.2 (`uv run python`; Qollab runtime also 2.5.2 per QOLLAB_FINDINGS) | `QuantumCircuit`, `ParameterVector`, `transpile`, `quantum_info.Statevector`, `providers.basic_provider.BasicSimulator` (tests/local) | Hackathon rule; same version on platform [VERIFIED: local import + docs/QOLLAB_FINDINGS.md] |
| numpy | 2.4.6 | Batch statevector engine, ridge, diagnostics | Pyodide ships 2.4.6 [VERIFIED: local + findings] |
| scipy | 1.18.x | Not needed for this phase | — |
| qiskit-ionq | 1.1.1 local dev only; **1.0.2 on Qollab** | Local transpile/target inspection only (`IonQProvider(token="dummy").get_backend("simulator")` works offline) | 1.0.2 source inspected: same `map_output`/`_build_counts`, `sampler_seed`, `ErrorMitigation` [VERIFIED: PyPI wheel 1.0.2 source] |
| qiskit-aer | 0.17.2 local dev only | Not required. BasicSimulator suffices for tests (K ≤ 4). | — |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Linear shot-aware ridge on 15 correlators | KRR (RBF) on the 15 correlators ("projected quantum kernel") | Measured: Mag 5 CV 15.65 vs 15.80 for KRR on the 22 raw features (marginal gain); Mag 4 is worse (73.4 vs 67.5). It needs 1678-row kernels in-page, and D-04 says ridge. **Do not use.** At most, mention it in the README as tried. |
| numpy batch engine for full-line | Chunked per-sample `Statevector` in `live_step` | Literal D-06 compliance, but about 22 s extra in-page on 1007.06, which risks the 80/90 s live rules. Keep it as the documented fallback only. |
| `backend.run` + counts | `BackendEstimatorV2` | Estimator works on IonQ but submits multi-PUB jobs (`ionq.multi-circuit.v1` risk with this proxy). Counts give all 15 correlators from one circuit. **Use counts.** |
| `optimization_level=1` for IonQ | `optimization_level=0` | Both fine (level 1: depth 20, 84 CZ, folds H·RZ into RX; level 0: as written). Keep 1 to match `run_bell_batch`. |

**Installation:** none. `requirements.txt` unchanged.

## Package Legitimacy Audit

No external packages are installed in this phase. Everything used (qiskit, numpy, and the dev-only qiskit-ionq, qiskit-aer, pytest) is already pinned in `pyproject.toml`/`uv.lock` from Phase 1 and verified there. slopcheck was not run because there is nothing new to check.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none new) | — | — | — | — | n/a | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
                         LOCAL (CPython, main.py)                                   QOLLAB PAGE (Pyodide + React)
 1006.08 npz ──► TL fit ──► residual y ──┐                               ┌── artifact_json ──► React player (rows, badges)
 kernel_features(cal) ─► standardize ─► angles(b) ─► Statevector ─► C(15) ┤                     ▲
                                                     (training)          │                     │ quantum_recorded()
         blocked CV over (map, b, λ): score = √(CV² + σ_shot(4096)²)     │   data/forte_hardware_run.json (captured once)
                       │                                                  │
                       ▼                                                  │   "Verify on this backend" (one per Run)
          shot-aware ridge weights ──► data/quantum_model.json ──────────┼──► api.quantum_verify(backend, line, sensor)
                       │                                                  │        │ load model, pick K samples (D-09)
 held-out lines ─► batch engine C ─► ŷ ─► cleaned = TL − ŷ ─► TERCOM ─► rows   │        │ exact C via Statevector (K blocks)
   (designed / identity / random, + diagnostics)  ──► precomputed_run.json ┘        │ packed circuit (4K qubits) + measure_all
                                                                                   │ transpile(opt=1) ──► backend.run(qc, shots) ×1
                                                                                   │              │
                                                                                   │     BasicSimulator (K=4, 4096) │ IonQ sim (K=7, 4096) │ Forte QPU (K=7, 500, credits, approval)
                                                                                   │              ▼
                                                                                   └─ get_counts() ─► per-block marginals ─► Ĉ ─► ŷ_shot vs ŷ_exact (nT) ─► JSON (+print, +sendFile)
```

### Recommended Project Structure (changes only)
```
magnav/
├── quantum.py        # circuit, engines, correlators, shot-aware ridge, CV, QuantumDenoiser, ablation maps, diagnostics, model (de)serialisation, packed circuit + counts decoding
├── api.py            # + quantum_verify(backend, line, sensor), quantum_recorded(backend), one-job guard
├── pipeline.py       # quantum provenance + ablation rows (identity/random) with TERCOM
├── artifact.py       # provenance.quantum block passthrough; validator for quantum block size/keys
├── live.py           # quantum fit uses fast engine (cheap); quantum TERCOM already wired (_create_generators)
data/
├── quantum_model.json         # NEW, written by main.py (< 50 KB)
└── forte_hardware_run.json    # NEW, captured from the page (hardware or proxy), < 200 KB
web/src/
├── components/StatusStrip.jsx   # quantum provenance badges
├── components/MetricsTable.jsx  # quantum rows (designed/identity/random) + ± shot-noise bar
├── components/VerifyPanel.jsx   # NEW: button + result + JSON textarea (passed as StatusStrip children)
├── lib/quantum.js               # NEW: pure formatting/state helpers (node --test)
├── theme.js                     # label "Quantum feature map"
└── dev/magnavApiStub.js         # + quantum_verify, quantum_recorded
tests/
├── test_quantum.py              # replaces test_quantum_stub.py
└── test_quantum_verify.py       # one-call spy, counts decoding, K policy, guard
```

### Pattern 1: The feature-map block (QNT-01, D-02)
**What:** One 4-qubit block with 24 parameter slots. Slot `8l+q` is RZ on qubit q in layer l, and slot `8l+4+q` is RY. Feature j maps to slot j for j < 22, and slots 22 and 23 are fixed to 0 (state it in code).
**Why this order:** measured with finite differences on the correlators:
- RY, RZ, then CZ (naive): slots 20-23 dead, and the last CZ ring is dead.
- H then [CZ, RZ, RY]: no dead slots, but the |++++> 4-cycle graph state is locally maximally mixed. Its CV was the worst (Mag 4: 83.2 vs a zero model of 80.9).
- **H, [RZ, RY, CZ] x 3, H: all slots live and the best CV.** Ending with RY(pi/2) instead of H gave bit-identical results (H = RY(pi/2)·Z up to phase, and Z commutes with the measurement).

```python
# Verified in scratchpad/exp6.py (qiskit 2.5.2)
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector

N_QUBITS, N_LAYERS, N_SLOTS = 4, 3, 24
RING = ((0, 1), (1, 2), (2, 3), (3, 0))

def feature_block(theta=None) -> QuantumCircuit:
    """theta: ParameterVector(24) or a length-24 float array."""
    th = ParameterVector("x", N_SLOTS) if theta is None else theta
    qc = QuantumCircuit(N_QUBITS, name="magnav_fmap")
    qc.h(range(N_QUBITS))
    for l in range(N_LAYERS):
        for q in range(N_QUBITS):
            qc.rz(th[8 * l + q], q)
        for q in range(N_QUBITS):
            qc.ry(th[8 * l + 4 + q], q)
        for a, b in RING:
            qc.cz(a, b)
    qc.h(range(N_QUBITS))
    return qc
# depth 21 (with measure), ops per block: 12 rz, 12 ry, 12 cz, 8 h
```
Bind with `qc.assign_parameters(values)`. Binding a list follows `qc.parameters` order, and `ParameterVector` elements sort by index (verified: x[8], x[9], x[10], ...). Building the block directly from floats (pass a float array as `theta`) avoids binding entirely and is what the packed circuit should do.

**Angles (D-05):** `theta[:, :22] = b * pi * clip(z, -3, 3) / 3`, where z is the calibration-standardised feature. b comes from the grid `BANDWIDTHS = (0.05, 0.1, 0.25, 0.5, 1.0)`. The CV optimum fell at the low edge of a 0.1-1.0 grid, so include 0.05.

### Pattern 2: Two exact engines, one definition (QNT-02, D-04/D-06)
```python
# Correlator order: weight-1 (4), weight-2 (6), weight-3 (4), weight-4 (1); masks sorted by (popcount, value)
MASKS = tuple(sorted(range(1, 16), key=lambda m: (bin(m).count("1"), m)))
SIGNS = np.array([[(-1) ** bin(s & m).count("1") for m in MASKS] for s in range(16)], float)  # (16, 15)

def correlators_statevector(theta):            # canonical; theta (n, 24)
    from qiskit.quantum_info import Statevector
    return np.array([Statevector(feature_block(t)).probabilities() for t in theta]) @ SIGNS

def correlators_batch(theta):                  # same circuit, numpy, vectorised over samples
    # gate-by-gate on psi (n, 16) complex; bit(q) = (arange(16) >> q) & 1
    # H: pairs (i0, i1 = i0 | 1<<q) -> ((a0+a1)/√2, (a0-a1)/√2); RZ(z): psi *= exp(∓ i z/2);
    # RY(y): (c a0 - s a1, s a0 + c a1); CZ(a,b): psi *= where(bit a & bit b, -1, 1)
    ...
    return (np.abs(psi) ** 2) @ SIGNS
```
Measured: `Statevector` costs 0.745 ms per sample plus 0.025 ms to bind (CPython). The batch engine takes 82 ms for 10480 samples. The max abs probability difference was 5.6e-16 (200 samples) and 2.2e-16 for the H-sandwich variant. The qiskit index convention is little-endian (index bit q = qubit q), which is what `SIGNS` assumes.

**Use:** training rows (1678 x 5 bandwidths x 2 maps, about 13 s per fluxgate) go through `correlators_statevector`, which honours D-04 verbatim. Held-out full lines (7568 + 10480 rows) and everything in-page go through `correlators_batch`. On every fit, `QuantumDenoiser` recomputes the first 8 training rows with `Statevector` and stores `statevector_check_max_abs` (expect < 1e-12) in provenance. Tests assert equality to 1e-12.

Projected in-page cost (x2.7 Pyodide factor measured in Phase 3): live fit with CV over 5 bandwidths is about 0.3 s, and 1007.06 prediction is about 0.25 s. **Split it across two `live_step` calls**: call 1 is the CV and fit, call 2 is the prediction plus the TERCOM generator setup.

### Pattern 3: Shot-aware ridge readout + blocked CV (QNT-02, D-04/D-05)
The readout uses raw correlators with no per-column standardisation; standardising tiny-variance columns is exactly what amplifies shot noise. Penalty = N · diag(E[(1 − C_m²)/shots]) + λI, at the deployment shot count 4096. Training on noisy features is equivalent in expectation to this Tikhonov term [ASSUMED: standard noise-injection/Tikhonov equivalence (Bishop 1995), training knowledge].
```python
SHOTS_REF = 4096
LAMBDAS = (0.0, 1e-2, 1e-1, 1.0, 10.0, 100.0, 1000.0)

def ridge_shot_aware(C, y, lam, shots=SHOTS_REF):
    m, ym = C.mean(0), y.mean()
    Cc = C - m
    noise = np.mean((1.0 - C**2) / shots, axis=0)              # per-correlator shot variance
    w = np.linalg.solve(Cc.T @ Cc + np.diag(len(C) * noise) + lam * np.eye(C.shape[1]), Cc.T @ (y - ym))
    return w, m, ym                                            # predict: (C - m) @ w + ym

def shot_sigma(C, w, shots):                                    # expected prediction σ (nT) from shot noise
    return float(np.sqrt(np.mean(np.sum(w**2 * (1.0 - C**2) / shots, axis=1))))
```
**Selection:** use 5 contiguous blocks on 1006.08 (same edges as `classical._blocked_cv_rmse`). Score = sqrt(CV_RMSE² + shot_sigma(C_cal, w_full, 4096)²). Ties go to the larger λ, then the smaller bandwidth. Record the full table in provenance.

The identity map uses the same ridge with a zero noise term on the 22 standardised features. Its grid needs λ up to 1e4, because the CV picked the edge (1e3 or 1e4).

**Measured results (2026-10-10, 1006.08 CV; held-out = error RMSE / error std from the metric start):**

| Sensor | Map | CV score | b | λ | σ_shot@4096 / @500 | 1003.02 | 1007.06 |
|---|---|---|---|---|---|---|---|
| Mag 5 (y std 16.5) | TL only | — | — | — | — | 40.7 / 29.5 | 89.0 / 22.8 |
| | identity (plain ridge) | 16.56 | — | 1e4 | 0 | 33.6 / 28.5 | 71.4 / 21.4 |
| | designed (shot-aware) | 16.93 | 0.25 | 0 | 1.9 / 5.5 nT | 38.1 / 29.9 | 83.6 / 25.2 |
| | random (shot-aware) | 16.57 | 0.1 | 10 | 0.7 / 2.0 nT | 36.7 / 29.1 | 81.1 / 21.9 |
| | KRR (Phase 2) | 15.80 | — | — | — | 36.4 / 31.9 | 87.8 / 23.5 |
| Mag 4 (y std 80.9) | TL only | — | — | — | — | 384.8 / 194.2 | 786.5 / 121.5 |
| | identity | 79.79 | — | 1e3 | 0 | 241.6 / 167.6 | 492.6 / 105.7 |
| | designed | 81.48 | 0.25 | 0.1 | 10.3 / 29.4 nT | 365.2 / 198.9 | 749.4 / 131.4 |
| | random | 75.12 | 0.1 | 1 | 9.6 / 27.4 nT | 317.8 / 185.9 | 681.6 / 118.7 |

The executor's numbers will differ slightly (the exact random seed, the slot map and the final grids). The *conclusion* is robust: no quantum advantage, and the readout shrinks toward zero correction. Most of the held-out RMSE gain over TL in every row is a DC offset shift (RMSE falls while the error std does not). The README should cite the error std.

### Pattern 4: Packed verification circuit + counts decoding (QNT-03, D-07)
```python
def packed_circuit(theta_k) -> QuantumCircuit:         # theta_k: (K, 24) floats
    K = len(theta_k)
    qc = QuantumCircuit(4 * K, name=f"magnav_verify_k{K}")   # no classical register yet
    for k, t in enumerate(theta_k):
        qc.compose(feature_block(t), qubits=range(4 * k, 4 * k + 4), inplace=True)
    qc.measure_all()                                    # ONE register "meas" -> no spaces in keys
    return qc

def block_correlators_from_counts(counts: dict, K: int):
    P = np.zeros((K, 16)); shots = 0
    for key, c in counts.items():
        v = int(str(key).replace(" ", ""), 2)            # clbit i == bit i of v (little-endian)
        shots += c
        for k in range(K):
            P[k, (v >> (4 * k)) & 15] += c
    return (P / shots) @ SIGNS, P, shots                 # (K, 15) correlators, marginal counts
```
Verified with a deterministic test: blocks prepared as |0001>, |0110>, |1011> with X gates decoded to `[1, 6, 11]`. Statistically, max |Ĉ − C_exact| over 15·K values at 4096 shots was 0.031-0.046, consistent with about 3σ for σ ≤ 1/64 = 0.0156.

Circuit size for K = 7 (logical): 84 CZ, 84 RY, 84 RZ, 56 H, 28 measure, depth 21. After `transpile(qc, ionq_backend, optimization_level=1)`: 84 CZ, 84 RY, 56 RZ, 28 RX, 28 H, depth 20, padded to the backend width (29 or 36) with a trivial layout and no SWAPs (all-to-all coupling). qiskit-ionq maps results through `meas_mapped`/clbits, so decoding by **classical bit** is layout-independent.

### Pattern 5: `api.quantum_verify(backend, line, sensor)` (QNT-03/04, D-07..D-09)
Signature: take only `line` and `sensor` from JS and derive K and shots in Python, so the page cannot request a wasteful job.

| Backend (detection) | K | shots | Notice |
|---|---|---|---|
| `_is_ionq` and class name contains `QPU` or `name` starts with `ionq_qpu` | `min(7, num_qubits // 4)` = 7 | **500** (≥500 enables debiasing; QNT-06) | "IonQ Forte 1 hardware (credits apply)" |
| `_is_ionq` (simulator, `num_qubits` 29) | `min(7, 29 // 4)` = 7 | 4096 | "IonQ remote simulator, noise model {options.noise_model}" |
| anything else (BasicSimulator `num_qubits` is `None`) | **4** | 4096 | "Built-in simulator (ideal, no noise): shows shot noise only" |

Steps, all in one `try` that returns `_failure`-style JSON and never raises:
1. Validate `line` in `pipeline.HELD_OUT` and `sensor` in `pipeline.SENSORS` (allowlist before file access).
2. If `_is_ionq(backend)` and `_VERIFY_SUBMITTED` is already True, return `{"ok": false, "error_type": "OneJobPerRun", ...}` without calling `run`.
3. Load `data/quantum_model.json` (literal path) and take `model[sensor]` and `samples[line][sensor]`: the indices, the 24 angles per sample, and the exact correlators and predictions.
4. Recompute exact correlators for the K samples with `correlators_statevector` and assert agreement with the shipped values to 1e-9 (catches model/code drift before spending the job).
5. Build `packed_circuit(theta[:K])`, then `tqc = transpile(qc, backend, optimization_level=1)`. Check `tqc.num_qubits <= backend.num_qubits` when that is not None.
6. For IonQ, set `_VERIFY_SUBMITTED = True` **immediately before** the single `job = backend.run(tqc, shots=shots)`. Capture `job.job_id()` right away and `print()` it to the console, so the id survives a failure in `result()`.
7. `counts = dict(job.result().get_counts())`. Use the bare form, because there is exactly one circuit. `get_counts(0)` also works.
8. Decode Ĉ, then compute ŷ_shot = predict(Ĉ), ŷ_exact = predict(C), and Δ = ŷ_shot − ŷ_exact (nT). Return the per-sample rows, `max_abs_corr_err`, `rms_corr_err`, `rms_pred_delta_nT`, `max_abs_pred_delta_nT`, the analytic `shot_sigma_nT` at this shot count, `backend`, `backend_class`, `noise_model`, `shots`, `K`, `sample_indices`, `job_id`, `submit_to_result_s`, `timestamp_utc`, `model_sha256`, `counts`, `marginals` (K x 16 ints) and `is_hardware`.
9. Best-effort capture: `print("[quantum_verify] " + text)` always (the Qollab console shows stdout with a copy affordance for text). Also try `from js import sendFile; sendFile("quantum_verify_result.json", "application/json", text)` inside `try/except Exception` (documented for Python projects; unverified in JS projects).

Errors: `type(e).__name__` surfaces `IonQAPIError`, `IonQJobFailureError` and `IonQJobError` (class names verified in the 1.0.2 `exceptions.py`). The failure codes `TooManyGates`, `SimulationTimeout`, `TooLongPredictedExecutionTime`, `NotEnoughQubits`, `QuotaExhaustedError` and `DebiasingError` appear in the message text (Qollab error reference).

### Pattern 6: Random-unitary ablation (D-10b)
The random map uses the same skeleton depth: H, then 3 layers of (data RZ/RY on a **seeded random permutation** of the 24 slots, fixed random RZ(U[0,2π)) and RY(U[0,π)) on each qubit, 4 CZs on seeded random distinct pairs), then H. The seed is recorded (for example `RANDOM_MAP_SEED = 20261010`) and stored as the explicit gate list in provenance, so it is reproducible without the RNG. It uses the same shot-aware ridge and the same CV. The determinism test checks that the same seed gives an identical gate list and correlators.

### Pattern 7: Concentration diagnostics (D-11), cheap
Per sensor (or per fluxgate, since correlators depend only on the fluxgate and bandwidth), for the designed and random maps at their chosen bandwidth:
- `corr_var`: 15 variances on calibration, 1003.02 and 1007.06.
- `corr_hist`: `np.histogram(C[:, m], bins=20, range=(-1, 1))` counts per correlator per dataset (15 x 20 ints x 3).
- `pair_dist`: from 2000 seeded random pairs per dataset, the quantiles (5/25/50/75/95) of ‖C(x) − C(x')‖ divided by sqrt(15), next to the same quantiles of ‖z − z'‖ divided by sqrt(22) for the inputs.
- `frac_clipped`: the share of |z| > 3 on each dataset. Measured: 10.5 % on 1003.02 and 13.3 % on 1007.06 against 0 % by construction on calibration, a distribution-shift flag the README should mention.
- `shot_sigma_nT` at 500 and 4096.

Measured flavour: at b = 0.05 the median correlator variance is about 1e-4, against 0.04-0.05 at b = 1. The held-out variance is lower than calibration for the same b (for example 0.0013 against 0.0085), which is concentration under shift. The whole block is a few KB.

### Anti-Patterns to Avoid
- **A list to `backend.run`** on IonQ: HTTP 400 `ionq.multi-circuit.v1` (Phase 1). Always pass the bare `tqc`.
- **`Statevector(packed_qc)`** on a circuit with measurements raises an error. Run Statevector only on unmeasured blocks.
- **A full-width statevector of the packed circuit** for the "exact" values: the blocks are a product state, so the exact values are the per-block Statevector values. Never simulate 28 qubits.
- **Standardised ridge on raw correlators**: this is the 459-1313 nT shot-noise blow-up (measured).
- **`noise_model="ideal"` with 28 qubits on IonQ**: an ideal IonQ simulation returns the full probability distribution, up to 16^7 ≈ 2.7e8 nonzero entries for 7 independent blocks. Never override the backend's noise model (Qollab's Forte 1 sim reports `forte-1`).
- **Calling `quantum_verify` during a live run**, or keeping the 30-min idle keep-alive running while a hardware job queues (see Pitfalls).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exact expectations (reference) | Your own simulator as the *only* engine | `qiskit.quantum_info.Statevector` as canonical; the batch engine is a cross-checked accelerator | D-04 names Statevector; the cross-check makes the fast path defensible |
| Circuit sampling | Sampling probabilities yourself to fake shots | `backend.run(tqc, shots=...)` + `get_counts()` | The shot noise must come from the backend (BasicSimulator, IonQ client sampler, QPU) |
| Gate decomposition/target mapping | Manual native-gate (GPI/MS) circuits | `transpile(qc, backend, optimization_level=1)` with the QIS gateset | IonQ recompiles server-side; native gateset adds risk |
| Counts → bitstrings | Parsing with assumptions about register order | One register via `measure_all()` on a creg-free circuit, plus `replace(" ", "")` defensively | Multi-register keys contain spaces (verified: `'0001 00'`) |
| Blocked CV | A new CV splitter | Reuse the edges convention from `classical._blocked_cv_rmse` (`np.linspace(0, n, 6).astype(int)`) | Identical splits to KRR/TL (fair comparison) |
| JSON safety | Ad-hoc float handling | `artifact._clean`, `json.dumps(..., allow_nan=False)` | JS `JSON.parse` rejects NaN |

**Key insight:** in this phase the expensive mistakes are not in the maths. They are in spending the one IonQ job (or credits) on a circuit that later changes, so freeze the circuit and validate everything *before* `backend.run`.

## Runtime State Inventory

Not a rename/refactor phase, so this section is omitted except for one relevant item. The **Qollab project's uploaded files** are live state outside git: after Phase 4, `data/quantum_model.json`, `data/forte_hardware_run.json`, the new `magnav/*.py` and `main.js` must be re-uploaded (Edit Code → Browse → Unpack, "Keep and add"). Publishing remains gated.

## Common Pitfalls

### Pitfall 1: BasicSimulator at 24 qubits freezes the page
**What goes wrong:** K = 6 packs 24 qubits. BasicSimulator holds a dense 2^24 statevector and runs the einsum per gate. **What we measured:** 51.9 s and 1.04 GB RSS in CPython; 20 q: 2.76 s, 174 MB; 16 q: 0.17 s, 82 MB; 12 q: 0.03 s. **Avoid:** K = 4 on non-IonQ backends. A test asserts `k_for(BasicSimulator()) == 4`. **Warning sign:** a "Verify" call over 1 s in the probe log.

### Pitfall 2: Forte remote simulator near its 29-qubit ceiling
**What goes wrong:** Qollab's compute-backends doc says simulations near the Forte-class qubit limit may still fail depending on the circuit, and noise-model simulation runs once per shot. K = 7 uses 28 of 29 qubits, while Phase 1 only tested 2 qubits. **Avoid:** a free simulator ladder run by the orchestrator on Qollab right after the circuit freezes: K = 7 at 4096 shots, then K = 7 at 1024, then K = 6 at 4096, then K = 5. Record each outcome and time in QOLLAB_FINDINGS. Make `K_IONQ_MAX` and `SHOTS_IONQ_SIM` module constants so the ladder result is a one-line change. Simulator jobs are allowed without approval (CLAUDE.md); each needs Stop, then Run. **Warning signs:** `SimulationTimeout` or `TooLongPredictedExecutionTime`.

### Pitfall 3: Concentration × shot noise
Covered in Pattern 3. A test asserts that `shot_sigma_nT(4096)` for the chosen designed model is below 25 % of the calibration residual std. That fails loudly if someone reverts to plain standardised ridge.

### Pitfall 4: Dead parameters from diagonal gates before a Z measurement
RZ and CZ commute with Z-basis measurement, so anything diagonal at the end of the circuit (or RZ acting on |0>) is invisible. A test perturbs each of the 22 used slots by 0.3 rad and asserts that some correlator changes by more than 1e-6.

### Pitfall 5: The one IonQ job gets consumed by a bad submission
A list payload, an oversize circuit, or a crash after submission all spend the Run's only job. **Avoid:** do every check before `run` (allowlists, model load, the Statevector drift check, transpile, the width check). The Python `_VERIFY_SUBMITTED` flag is set right before `run`. The JS button disables on click, not on result.

### Pitfall 6: Idle keep-alive or Stop during a hardware queue
App.jsx resolves `runDone` after 30 minutes without input (`IDLE_LIMIT_MS`). A Forte QPU job can wait in the queue longer than that, and Qollab's Stop gives Python only 5 s to finish. **Avoid:** pause the idle check while `verify.state === 'submitting'`, and tell the builder in the checkpoint not to press Stop. The `job_id` is printed before `result()`.

### Pitfall 7: Qiskit 2.x API traps
There is no `qiskit.execute` and no `Aer` from `qiskit`. Import `Statevector` from `qiskit.quantum_info`. `BasicSimulator` lives in `qiskit.providers.basic_provider`. `BasicSimulator().num_qubits` is `None` (verified), so don't use it for K. `MAX_QUBITS_STATEVECTOR = 24` is in the source. V1 primitives are gone. `qc.compose(..., qubits=..., inplace=True)` is the packing call. `measure_all()` adds a `meas` register and a barrier.

### Pitfall 8: Parameter binding order
List binding follows `qc.parameters` (sorted). `ParameterVector` sorts by index (verified), but mixing parameter names breaks this. Build blocks from floats directly (`feature_block(t)` with a float array), or bind with a dict.

### Pitfall 9: Endianness
Statevector index bit q = qubit q. Counts keys are MSB-left (clbit 0 is the rightmost character), so `int(key, 2)` restores bit i = clbit i. Both are covered by the tests (deterministic X-gate blocks and the statistical agreement test).

### Pitfall 10: Live-mode time budget
1007.06 already projects to about 36-40 s live. A real quantum correction adds its own TERCOM pass (about 383 windows × 31.6 ms ≈ 12 s, already wired in `live._create_generators`). With the batch engine the quantum fit adds about 0.6 s. With per-sample Statevector it would add about 22 s, which risks the 80 s skip projection. Keep the batch engine for live use.

### Pitfall 11: Artifact determinism
The artifact must stay byte-deterministic. No timestamps or job ids go in `precomputed_run.json`. Those live in `data/forte_hardware_run.json` (read separately). The local "built-in verification" stored in the artifact uses BasicSimulator with `seed_simulator=` fixed.

### Pitfall 12: The hardware result's counts may not sum to shots
For a QPU, qiskit-ionq builds counts as `round(prob * shots)` from debiased probabilities (1.0.2 `_build_counts`), so the sum can differ from 500 by a few. Normalise by `sum(counts.values())`, never by `shots`.

## Code Examples

### One-call spy test (QNT-03)
```python
# Pattern from tests/test_api_smoke.py (SpySim subclasses BasicSimulator to keep a real Target)
def test_quantum_verify_submits_one_bare_circuit():
    spy = SpySim()
    out = json.loads(api.quantum_verify(spy, "1003.02", "mag_5_uc"))
    assert out["ok"] is True, out
    assert spy.calls == 1
    assert isinstance(spy.last_payload, QuantumCircuit)          # bare circuit, not a list
    assert spy.last_payload.num_qubits == 16 and out["K"] == 4    # built-in policy
    assert out["shots"] == 4096 and len(out["samples"]) == 4

def test_ionq_like_second_call_refused():
    spy = FakeIonQSim()                                            # module "qiskit_ionq.fake"
    api._reset_verify_guard()                                      # test-only helper
    json.loads(api.quantum_verify(spy, "1003.02", "mag_5_uc"))
    second = json.loads(api.quantum_verify(spy, "1003.02", "mag_5_uc"))
    assert spy.calls == 1 and second["ok"] is False and second["error_type"] == "OneJobPerRun"
```
Note that `FakeIonQSim` is a BasicSimulator, so with K = 7 it would build 28 qubits, which is above BasicSimulator's 24-qubit cap and would take 50 s or more. For IonQ-like test backends, set `num_qubits` small or monkeypatch `K_IONQ_MAX` to 2.

### Statevector vs counts agreement (K = 2, 8 qubits)
```python
def test_counts_match_statevector_k2():
    th = np.random.default_rng(3).uniform(-1, 1, (2, 24))
    exact = quantum.correlators_statevector(th)
    sim = BasicSimulator()
    counts = sim.run(transpile(quantum.packed_circuit(th), sim, optimization_level=1),
                     shots=20000, seed_simulator=11).result().get_counts()
    est, _, shots = quantum.block_correlators_from_counts(counts, 2)
    assert shots == 20000 and np.abs(est - exact).max() < 5 / np.sqrt(20000)   # ~0.035
```

### Hardware result file schema (`data/forte_hardware_run.json`)
```json
{
  "schema": "magnav.quantum_run.v1",
  "kind": "hardware",                       // or "proxy_noise_model"
  "label": "recorded hardware result",      // or "proxy (noise model)"
  "backend": "ionq_qpu.forte-1", "backend_class": "IonQQPUBackend", "noise_model": null,
  "shots": 500, "K": 7, "line": "1003.02", "sensor": "mag_5_uc",
  "sample_indices": [1952, 1972, 1992, 2012, 2032, 2052, 2072],
  "job_id": "…", "timestamp_utc": "2026-10-10T…Z", "submit_to_result_s": 0.0,
  "qiskit": "2.5.2", "qiskit_ionq": "1.0.2", "model_sha256": "…",
  "counts": {"0101…": 3, "…": 1},          // 28-char keys, ≤ shots entries
  "marginals": [[...16 ints...], ...],       // K x 16
  "max_abs_corr_err": 0.0, "rms_pred_delta_nT": 0.0, "shot_sigma_nT": 0.0,
  "samples": [{"index": 1952, "exact_pred_nT": 0.0, "shot_pred_nT": 0.0, "delta_nT": 0.0}]
}
```
This is exactly the JSON `quantum_verify` returns, plus `kind`/`label`/`schema`, which the builder or orchestrator adds when saving. Size: about 18 KB for 500 shots, up to about 150 KB for 4096-shot proxy counts. Ship one file under one literal path. If hardware is refused, the file holds the Forte simulator result with `kind: "proxy_noise_model"`. `api.quantum_recorded(backend)` returns `{"ok": true, "recorded": <file>}` or `{"ok": false, "error_type": "FileNotFoundError"}`. Keep a committed placeholder `{"schema": "...", "kind": "none"}` until capture, so the package allowlist check passes.

### `data/quantum_model.json` schema (written by main.py; target < 50 KB)
```json
{
  "schema": "magnav.quantum_model.v1",
  "circuit": {"n_qubits": 4, "layers": 3, "order": "H,[RZ(4),RY(4),CZ ring(0-1,1-2,2-3,3-0)]x3,H",
              "slots": "slot j = feature j (j<22); slots 22,23 = 0", "clip_sd": 3, "angle": "b*pi*clip(z,-3,3)/3",
              "correlator_masks": [1,2,4,8,3,5,6,9,10,12,7,11,13,14,15]},
  "shots_ref": 4096,
  "sensors": {
    "mag_5_uc": {"fluxgate": "flux_a", "feature_mu": [22], "feature_sd": [22],
                 "bandwidth": 0.25, "lambda": 0.0, "corr_mean": [15], "weights": [15], "y_mean": 0.0,
                 "cv_score": 0.0, "shot_sigma_nT": {"500": 0.0, "4096": 0.0}}
  },
  "samples": {"1003.02": {"mag_5_uc": {"indices": [7], "theta": [[24] x7], "exact_corr": [[15] x7], "exact_pred_nT": [7]}}},
  "random_map": {"seed": 20261010, "gates": [...]},
  "statevector_check_max_abs": 1e-16
}
```
`model_sha256` = sha256 of `json.dumps(model["sensors"], sort_keys=True, separators=(",", ":"))`, stored in both the model file and the artifact's `provenance.quantum.readout_sha256`. A test asserts they match.

Sample choice (D-09): window i ends at `jam_idx + window + stride*i` (120/20 samples, `pipeline.TERCOM_PARAMS`), and its centre is `end - window//2`. The first K = 7 centres per line are stored, and the built-in path uses the first 4 of them.

### Artifact additions (`provenance.quantum[sensor]` replaces the stub dict)
`source: "feature_map_ridge"`, `circuit` (as above plus logical and transpiled-IonQ gate counts: `{"cz": 84, ...}` for K = 7), `bandwidth`, `lambda`, `cv_table`, `selection`, `readout_sha256`, `shots_ref`, `shot_sigma_nT`, `statevector_check_max_abs`, `engine: "qiskit Statevector (training) + numpy batch statevector (prediction), cross-checked"`, `ablation: {identity: {...}, random: {..., seed, gates}}`, `diagnostics: {...}` (Pattern 7), `verification_builtin: {K: 4, shots: 4096, seed_simulator, max_abs_corr_err, rms_pred_delta_nT}`.
Ablation rows go into `metrics_table` with `denoiser` values `"quantum_identity"` and `"quantum_random"`. They are **not** added to `DENOISERS` or `estimates`, so the series and size contracts are untouched. They need TERCOM for position metrics: 8 extra runs (2 maps × 2 lines × 2 sensors), about 30 s more for `main.py`. The validator must accept these two extra denoiser names in `metrics_table` only. The size impact is a few KB for rows and diagnostics. The artifact stays about 1.04-1.06 MB, well under 2 MB.

## UI-04 (minimal changes)

- **theme.js:** `SERIES.quantum.label = 'Quantum feature map'`. Add `QUANTUM_ROWS = { quantum: 'Quantum feature map', quantum_identity: 'Ablation: identity map (no circuit)', quantum_random: 'Ablation: random circuit' }`.
- **MetricsTable:** after the denoiser rows, render the two ablation rows from `artifact.metrics_table` filtered by line and sensor. That means passing `ablationRows` from App (computed with `useMemo`), since `view.metrics` only has estimate-backed denoisers. In the quantum row's Signal RMSE cell, add `± {shot_sigma_nT@4096}` and give the cell an `aria-label` that spells the bar out ("±1.9 nanotesla shot-noise bar at 4096 shots"). Add a caption footnote: "± = expected shot-noise error of the quantum readout at 4096 shots; see Verify for a measured value."
- **StatusStrip:** add an optional `quantum` prop and render up to three text badges, for example `IonQ Forte 1 hardware · 500 shots · 2026-10-10 21:14 UTC · recorded hardware result`, or `ionq_simulator (forte-1) · 4096 shots · proxy (noise model)`. They come from `quantum_recorded` and fall back to "no recorded IonQ result yet". Badges are text, not colour-only. Put the `VerifyPanel` in `children` (the slot already exists).
- **VerifyPanel (new):** a button labelled "Verify on this backend (one job per Run)". It is disabled when `!qBackend` (and not in DEV), while a live run is in flight, while playback controls are locked, or once `state !== 'idle'`. On click: `setState('submitting')`, then announce "Submitting one quantum job to {backend}…", then `callPy('quantum_verify', line, sensor)`. On `ok`, set state to `'done'`, show `K`, `shots`, `backend`, `rms_pred_delta_nT`, `max_abs_corr_err`, the job id and a 4-7 row mini-table (exact vs shot prediction in nT), and announce one summary sentence through `announce()`. On failure, set state to `'failed'`, show `error_type: error`, and keep the button locked on IonQ (the job may be spent). Add a `<details><summary>Result JSON</summary><textarea readOnly>` for manual copy, plus a "Download result JSON" button using a Blob and `<a download>` (best-effort; the sandbox may block it; the console print is the reliable path). The live controls are disabled while `state === 'submitting'`.
- **App.jsx:** load `quantum_recorded` once after the artifact (one extra Python call, about 10 ms, queued through `bridge.enqueue`). Hold the verify state. Skip the idle-limit resolve while submitting (Pitfall 6).
- **Dev stub:** add `quantum_verify` (a deterministic fake with `K: 4`, `shots: 4096`, `backend: 'dev-stub'`, fixed counts and rows, and an optional `globalThis.__MAGNAV_DEV_VERIFY_FAIL__` failure) and `quantum_recorded` (a fake `kind: 'proxy_noise_model'`), both returning JSON strings.
- **Contracts:** no new timers (use the MessageChannel `tick` in the stub); one Announcer; the bundle grows by about 5-10 KB (850 KB now, cap 1.5 MB); zero exports from main.js. `tests/test_qollab_contract.py` already pins the timer count and the export count, so run it after the build.

## Hardware capture flow (QNT-06, D-13/D-14)

1. **The circuit is frozen** (Plan 1 done: `quantum_model.json` and its hash committed). The orchestrator uploads the zip to the Qollab editor (allowed, no publish).
2. **Simulator ladder (orchestrator, free, allowed):** select "IonQ Forte 1 (Remote simulator)", Run, then Verify. Expect about 12 s or more. Record the outcome and save the JSON as the proxy result (`kind: "proxy_noise_model"`). Fall back down the ladder on failure (Pitfall 2).
3. **`checkpoint:human-action` (builder):** show the builder exactly what will run: backend "IonQ Forte 1 (36q) Credits apply", the circuit (K = 7, 28 qubits, 84 CZ / about 196 1q gates after transpile), 500 shots, and line/sensor 1003.02 / Mag 5. The runner's allowance defaults to 10 credits (a tenth of the 100 balance), so it **will stop and show a price quote next to the balance**. Declining charges nothing. After the job, the runner shows the actual credits withdrawn. The console shows IonQ's predicted waiting time once queued [CITED: qollab.xyz/learn/docs/how-credits-work, /before-you-spend-credits]. The builder approves or declines in person.
4. **Cost expectation:** Qollab gives no conversion from IonQ dollars to credits [CITED: how-credits-work]. On the Azure Quantum list, Forte costs $0.0001645 per 1q gate-shot and $0.001121 per 2q gate-shot, with a per-program minimum of **$168.20 with error mitigation (debiasing, on by default at ≥500 shots)** or $25.79 without [CITED: learn.microsoft.com/azure/quantum/pricing]. Our job is 84 × 500 × 0.001121 + about 200 × 500 × 0.0001645 ≈ $47 + $16 ≈ $63, below the minimum, so **the charge is the per-circuit minimum whatever K is.** Use K = 7 (the most data for the same price). Whether 100 Qollab credits cover that minimum is unknown until the quote appears [ASSUMED].
5. **Capture:** with Python `print` the JSON appears in the Qollab console (copyable). The page textarea, `sendFile` (best-effort) and the Download button are backups. The builder (or the orchestrator with the builder present) saves it as `data/forte_hardware_run.json` with `kind: "hardware"`, commits, re-packages and re-uploads (no publish).
6. **If declined, unaffordable or failed:** keep the step-2 proxy file and label it "proxy (noise model)". The README says why.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `qiskit.execute(qc, backend)` | `backend.run(transpile(qc, backend))` | Removed in Qiskit 1.0 | Use `run` only |
| V1 `Sampler`/`Estimator` | V2 primitives; counts via `backend.run` | Removed in Qiskit 2.0 | Never `BackendSamplerV2` on IonQ (returns zeros) |
| Multi-circuit IonQ jobs | Single bare circuit per job on Qollab proxy | Qollab proxy behaviour, observed 2026-10-10 | Pack blocks into one circuit |
| Fidelity quantum kernels (N² circuits) | Projected / measured-feature readouts (N circuits) | Literature consensus on cost and concentration | Our ridge-on-correlators design |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The builder accepts K = 4 (not 6) on the built-in simulator | Deviations, Pattern 5 | Low: the alternative freezes the page for about 140 s |
| A2 | The builder accepts the numpy batch engine (cross-checked) for full-line and in-page predictions, with qiskit Statevector for training and verification | Pattern 2 | Medium: fallback is chunked Statevector, about 22 s extra live on 1007.06 |
| A3 | The Forte remote simulator can run 28 qubits × 4096 shots inside its timeout | Pitfall 2 | Medium: the ladder mitigates it; K drops to 6 or 5 |
| A4 | Noise injection ≡ Tikhonov (shot-aware ridge) is a sound justification | Pattern 3 | Low: it is empirically measured anyway |
| A5 | 100 credits cover one Forte job's per-circuit minimum | Hardware flow | Medium: the proxy path covers it (D-14) |
| A6 | `from js import sendFile` works in a JS project | Pattern 5 | Low: print plus the textarea are the primary paths |
| A7 | `<a download>` works in Qollab's sandboxed frame | UI-04 | Low: backup only |
| A8 | The page stays responsive while `job.result()` waits (JSPI suspension) | Pitfall 6 | Low: the button shows "submitting"; Phase 1 saw no errors over 12 s |
| A9 | The Pyodide slowdown factor is about 2.7× (Phase 3 measurement) and also applies to BasicSimulator einsum and numpy batch | Pitfalls 1/10 | Low: the K = 4 margin is large (0.5 s) |

## Open Questions (RESOLVED)

1. **K on the built-in simulator?** RESOLVED: K = 4 (16 qubits, 0.17 s CPython). Handled in Plan 2 (`quantum_verify` K policy and test `k_for(BasicSimulator()) == 4`). Builder confirmation is a one-line note in the plan's checkpoint (A1).
2. **How to compute 18k held-out rows and in-page live predictions fast enough?** RESOLVED: the numpy batch engine, cross-checked against Statevector (tests plus `statevector_check_max_abs` per fit). Handled in Plan 1 (engines) and Plan 3 (live split into two `live_step` calls). Fallback documented (A2).
3. **Gate order inside D-02?** RESOLVED: H, [RZ, RY, CZ ring] × 3, H, with the dead-slot test. Plan 1.
4. **Shot-noise blow-up from concentration?** RESOLVED: shot-aware ridge plus a sqrt(CV² + σ²) selection score, with a test bounding σ. Plan 1.
5. **Bandwidth/λ grids?** RESOLVED: b ∈ {0.05, 0.1, 0.25, 0.5, 1.0}. λ ∈ {0, 1e-2, ..., 1e3} for the quantum maps; {1e-2, ..., 1e4} for identity. Plan 1.
6. **Does K = 7 at 28 qubits run on the Forte simulator?** RESOLVED as a procedure: the free ladder (orchestrator) right after the freeze, with module constants for K and shots. Plan 2 checkpoint (`checkpoint:human-verify`, simulator only, allowed).
7. **How is the hardware result captured without POST or fetch?** RESOLVED: console `print` (primary), page textarea, `sendFile` and Download (best-effort); saved manually into `data/forte_hardware_run.json`. Plan 2 hardware `checkpoint:human-action` (D-13).
8. **Does the hardware cost depend on K?** RESOLVED: the cost falls under the per-circuit minimum, so use K = 7. The quote and approval happen in the runner. Plan 2 checkpoint text.
9. **Where do the ablation rows live without breaking the UI and size contracts?** RESOLVED: `metrics_table` rows `quantum_identity`/`quantum_random` plus `provenance.quantum.ablation`, with no estimates arrays. Plan 3 (pipeline/artifact) and Plan 4 (MetricsTable).
10. **How does the page know the recorded result?** RESOLVED: `api.quantum_recorded` reads `data/forte_hardware_run.json` (a placeholder until capture), so the artifact does not need regenerating after capture. Plans 2 and 4.
11. **Keep-alive versus the hardware queue?** RESOLVED: suspend the idle bound while submitting, and the checkpoint tells the builder not to press Stop. Plan 4.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| uv + Python 3.13 venv | all Python work | ✓ | 3.13.16 (`$HOME/.local/bin/uv`) | — |
| qiskit | circuit/Statevector/BasicSimulator | ✓ | 2.5.2 | — |
| qiskit-ionq (dev) | offline IonQ target/transpile inspection | ✓ | 1.1.1 (platform 1.0.2, source checked) | — |
| Node / npm | web build, node --test | ✓ | 24.20.0 / 11.19.0 | — |
| Qollab editor + IonQ Forte 1 remote sim | ladder and proxy capture | ✓ (via builder's account, Playwright Chrome) | qiskit-ionq 1.0.2 | — |
| IonQ Forte 1 QPU | QNT-06 hardware | Credits 100, approval required | — | Proxy (noise model) per D-14 |
| IonQ API key locally | — | ✗ (by design) | — | None needed; Qollab is the only IonQ path |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** hardware credits, which fall back to the proxy result.

## Validation Architecture

Skipped: `workflow.nyquist_validation` is `false` in `.planning/config.json`. The test plan still matters for QNT-03, so here is the recommended test list (pytest locally under `uv run pytest`, plus `npm --prefix web test`):

- `tests/test_quantum.py`: batch engine equals Statevector to 1e-12; dead-slot check; correlator masks and sign matrix (weights 4/6/4/1); counts decoding (deterministic X-gate blocks, spaces stripped); K = 2 Statevector against counts at 20000 shots on BasicSimulator; shot-aware ridge bound (σ@4096 < 0.25 × residual std); CV determinism; random-map determinism (same seed gives the same gates and C); model file round trip and hash match with the artifact; model file < 2 MB (actually < 50 KB); `QuantumDenoiser` still satisfies the `fit/predict` protocol inside `ResidualCorrected`; and `fit` and `predict` never call `backend.run` (spy). This replaces `test_quantum_stub.py`. Update `test_live.py` (quantum no longer equals TL; `computed` includes quantum) and `test_artifact_regression.py` (quantum rows recomputed).
- `tests/test_quantum_verify.py`: one call with a bare circuit (BasicSimulator spy, K = 4, 16 qubits); IonQ-like guard refuses a second call; allowlist rejections make zero calls; `BoomSim` gives `ok: false` with an `error_type`; JSON strict (`allow_nan=False`); the `quantum_recorded` placeholder and the missing-file case.
- `web/src/lib/quantum.test.js`: badge text, ± formatting, verify state machine (idle → submitting → done/failed, never back to idle on IonQ).
- Artifact: `validate_artifact` passes and the size is < 2 MB; ablation rows exist for each line and sensor.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Qollab handles auth; no keys in the repo (backend injected) |
| V3 Session Management | no | — |
| V4 Access Control | partial | The credit-spending hardware job is gated by a human checkpoint plus the runner's price approval |
| V5 Input Validation | yes | `line`/`sensor` allowlists before file access; K and shots derived server-side (not from JS); `_as_int`-style strictness for any numeric arg |
| V6 Cryptography | no | sha256 only for content hashing (`hashlib`), not security |

| Pattern | STRIDE | Mitigation |
|---------|--------|-----------|
| Page requests an oversized or wasteful job | Denial of service / cost | Python-side K/shots policy; width check before `run`; one-job guard |
| Secrets leaking into the recorded result or repo | Information disclosure | The recorded JSON holds only backend name, job id and counts; the package script's secret scan still runs |
| Tampered model file changes predictions silently | Tampering | `model_sha256` in the model, the artifact and the result; Statevector drift check before submit |

## Sources

### Primary (HIGH confidence)
- Local experiments, 2026-10-10 (`uv run python`, qiskit 2.5.2, numpy 2.4.6) in the session scratchpad: exp1 (dead slots, Statevector timing), exp2 (batch engine equality and timing), exp3/4/8/9 (real-data CV, held-out, shot sigma), exp5 (KRR on correlators), exp6 (packed circuit on BasicSimulator K = 2-6, time and memory), exp7 (IonQ target and transpile), bit-order check.
- qiskit 2.5.2 source: `providers/basic_provider/basic_simulator.py` (`MAX_QUBITS_STATEVECTOR = 24`).
- qiskit-ionq 1.0.2 wheel source (PyPI, uploaded 2025-08-30): `ionq_job.py` (`map_output`, `_build_counts`, client-side sampling, `result(timeout=None)`), `helpers.py` (`ionq.circuit.v1` vs `multi-circuit.v1` by `isinstance(list)`, noise block), `ionq_backend.py` (ideal-sim notes), `exceptions.py`, `constants.ErrorMitigation`.
- docs/QOLLAB_FINDINGS.md (single-circuit proxy, one job per Run, Forte sim 29 q / forte-1 / about 12 s / 4096 OK, credits 100, Pyodide 2.7×, main-thread Python).
- https://qollab.xyz/learn/docs/error-reference: IonQ failure codes, no numeric gate limits, debiasing at ≥500 shots.
- https://qollab.xyz/learn/docs/how-credits-work and /before-you-spend-credits: allowance (a tenth of the balance), quote and approval, actual credits withdrawn, predicted waiting time.
- https://qollab.xyz/learn/docs/compute-backends: 29/36/24-qubit ceilings, near-limit failure warning, per-shot noise simulation.
- https://qollab.xyz/learn/docs/runtime-environment: `from js import sendFile`, console shows stdout, Stop gives 5 s.

### Secondary (MEDIUM confidence)
- https://learn.microsoft.com/azure/quantum/pricing: Forte gate-shot rates and per-program minimums ($168.195 with error mitigation, $25.7899 without). Reseller pricing; Qollab credits are not convertible.
- https://docs.ionq.com/api-reference/v0.3/error-codes: `TooManyGates` defined as a preflight per-circuit gate limit, with no number published.

### Tertiary (LOW confidence)
- Noise-injection ≡ Tikhonov justification (training knowledge; the effect is measured here anyway).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, since nothing new and the versions were verified locally and on the platform.
- Architecture and patterns: HIGH, every code pattern was executed locally.
- Model performance expectations: HIGH for direction (measured on the real data), MEDIUM for exact numbers (seed, grid and slot-map details).
- IonQ remote-sim feasibility at 28 q and hardware cost in credits: MEDIUM to LOW, resolved procedurally by the ladder and the quote checkpoint.

**Research date:** 2026-10-10
**Valid until:** deadline (2026-10-11 16:00 PDT); platform behaviour may change without notice.

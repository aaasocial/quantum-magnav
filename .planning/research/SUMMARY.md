# Project Research Summary

**Project:** Magnetic Field Detector (Quantum MagNav)
**Domain:** Hybrid quantum/classical GPS-denied magnetic-anomaly navigation demo (Qiskit + IonQ via Qollab, React UI), solo 40-hour hackathon
**Researched:** 2026-10-09
**Confidence:** MEDIUM-HIGH (platform and stack facts are HIGH; quantum-model payoff and Qollab bundle behavior are unproven until run)

## Executive Summary

This is a MagNav demo in the style of MIT's MagNav Challenge / MagNav.jl and SandboxAQ's AQNav. Real practice splits the problem the same way this project does. Platform-noise compensation comes first, with Tolles-Lawson (TL) regression as the standard baseline. Map matching comes second, using a classical EKF or particle filter. The quantum part here is a bounded denoising subroutine, not the sensor. That is honest, defensible, and is the novelty hook. The recommended build is a TL-then-quantum-residual hybrid: a classical physics baseline removes the attitude-driven terms, and a small Qiskit model predicts the leftover interference from observable drone-state features (direction cosines, motor current, throttle). A 2D particle filter then matches the cleaned trace to a synthetic Gaussian-random-field map, using a drifting INS prior so the "GPS jammed" story is visible.

**The platform decides the architecture.** STACK.md was checked against Qollab's own runtime docs and overrides the other three files. A published Qollab project runs entirely in the visitor's browser. Python runs on Pyodide, and a React bundle (one `main.js` + `main.css`) calls the Python modules in-page. WebSocket, XHR, web workers and POST are blocked. Only the quantum job runs server-side, and IonQ backends accept **one `backend.run` per Run**. So the FastAPI + SSE "live mode" in ARCHITECTURE.md cannot be deployed. "Live" now means Python computes the flight in-page and React animates it with `requestAnimationFrame`. ARCHITECTURE.md's single `RunArtifact` / frame-player idea and its "quantum never on the critical path" principle still hold. They carry over unchanged: one schema, one player, a precomputed `data/precomputed_run.json` (under 2 MB, literal path) as the fallback. FastAPI is at most an optional local dev harness.

**Recommended quantum model (single call, consistent with the one-job rule):** a fixed (untrained) quantum feature map, in the quantum extreme learning machine / reservoir style, on 4-6 qubits, with a **classical ridge readout** trained on the TL residual. Training features are computed exactly with `qiskit.quantum_info.Statevector`, which is not a `backend.run`, so it is free and unlimited. Inference is **one batched `backend.run([...circuits])`** of about 32-128 window circuits, read through `get_counts()` (never `BackendSamplerV2`, which returns all zeros on IonQ). This resolves the research disagreement. FEATURES favored quantum kernel ridge, but it needs N_test x N_train fidelity circuits, which hits the single-job limit and the shot-noise floor. ARCHITECTURE favored a VQC, but it needs a training loop that cannot run on IonQ and is the hardest to make beat a baseline (barren plateaus). PITFALLS favored a kernel with 6 qubits or fewer, which is directionally right on qubit count and on avoiding a training loop. The feature-map plus ridge route keeps those virtues, costs N circuits instead of N^2, and has the simplest story. Keep the kernel route (N_train <= 16, N_test <= 8) as a documented fallback only. Compare against equal-feature classical RBF kernel ridge and TL-only on an identical split, and report honestly whichever wins. No advantage claim.

The key risks are all manageable if sequenced right. First, Qollab runtime unknowns: smoke-test a Vite-bundled React hello-world and a Bell circuit on IonQ Forte 1 (remote simulator) in the first hours. Second, "quantum decoration" and an unfair comparison: run the ablation, share features and splits, and publish negative results. Third, leakage of truth into the estimator: enforce `Truth` vs `Sensors` separation by function signatures. Fourth, a synthetic map or noise model tuned wrongly, so that denoising looks irrelevant: sweep and tune by experiment. Fifth, compliance misses (MIT LICENSE, verbatim attribution line, AI/library disclosure, theme tag, logged-out test) that can disqualify the project.

## Key Findings

### Recommended Stack

Develop locally on Python 3.13 via `uv` (the system Python 3.9 is too old), and pin to the Pyodide families so "works locally, fails on Qollab" cannot happen. Ship to Qollab as a JS project: `index.html` (body only) + Vite-built `main.js`/`main.css` + a `magnav/` Python package + `requirements.txt` (only `qiskit>=2.5.2,<3.0.0`) + README (becomes the write-up) + LICENSE + `data/precomputed_run.json`. Python modules accept `backend` as an argument; never construct a provider or `AerSimulator` in shipped code. See STACK.md for the tested Vite config and folder layout.

**Core technologies:**
- **Qiskit 2.5.2** (+ qiskit-aer 0.17.2 locally only): circuits and simulation. Matches Qollab's pin; required by the rules.
- **qiskit-ionq 1.1.1 (local type-checking only)**: Qollab injects `backend`; there is no local IonQ access, and no API key.
- **numpy 2.4.x / scipy 1.18.x / scikit-learn 1.8.x**: the exact Pyodide families. They cover map synthesis (FFT / `gaussian_filter`), TL ridge, `KernelRidge` baseline, interpolation and optimizers. Not listed in `requirements.txt` (Pyodide supplies them).
- **React 19.3 + Vite 8.3 (lib mode, `external: [/^magnav(\..+)?$/]`)**: one `main.js` ES module, about 758 kB, under the 2 MB cap. Built and tested locally, not yet on Qollab.
- **recharts 3.10 + canvas heatmap with SVG overlay + d3-scale-chromatic (cividis/viridis)**: accessible, small charts; downsample to 2,000 points or fewer per series.
- **pytest, ruff, eslint-plugin-jsx-a11y, uv**: add a test asserting `backend.run` is called exactly once per inference.
- **Do not use:** `BackendSamplerV2` on IonQ, any second `backend.run`, Sampler-based qiskit-machine-learning, filterpy/torch/plotly, WebSocket/SSE, `optimization_level` above 1 for IonQ, f-string data paths, or V1 primitives and `execute`.

**Platform corrections to carry into every doc:** the "24 qubits" figure is Qollab's built-in browser simulator. IonQ Forte 1 (remote simulator) allows 29 qubits, and Forte 1 hardware has 36. Test submissions on **IonQ Forte 1 (remote simulator)**, not only the built-in one. Use Chrome (WebAssembly JSPI; Firefox 153+; Safari unsupported). Keep circuits to 4-8 qubits, 3 or fewer entangling layers, and 100-500 shots, with all circuits in one job.

### Expected Features

Mirror real MagNav structure in simulation: 10 Hz, a scalar mag, a vector mag (for direction cosines), 2-4 current channels, and a "clean" trace playing the role of `mag_1_c`.

**Must have (table stakes):**
- T1 synthetic anomaly map: spectral Gaussian random field (power-law, upward-continued, +/-100-500 nT, a few dipole blobs), seeded
- T2 flight at 10 Hz with turns and attitude manoeuvres, plus a true clean trace and a drifting INS stream
- T3 physically motivated self-noise: TL attitude terms, aliased motor tone, current-dependent offset, white noise and drift
- T4 TL ridge baseline, and T5 equal-feature classical learner (RBF kernel ridge or MLP), plus a naive low-pass floor
- T6 quantum denoiser (feature map + ridge readout on the TL residual) running on IonQ Forte 1 remote simulator
- T7 particle-filter map matching (2D, 500-2000 particles) run once per denoiser output
- T8 metrics (signal RMSE/std in nT, position error, CEP50/95), multi-seed mean +/- std
- T9 map view (true vs estimated path, drone, GPS-jammed marker, error readout), T10 signal panel with residual subplot
- T11 precomputed replay (the same code path as "live")
- T12 README with per-criterion summary, T13 accessibility, T14 one captured hardware result (submit early; credits are unconfirmed)

**Should have (differentiators):**
- D12 hybrid residual framing (TL then quantum residual), the strongest novelty argument
- D1 honest benchmark table with a negative-results section; D4 nT-to-metres curve; D2 train-size regime sweep
- D3 shot/hardware-noise robustness (ideal vs shots vs `forte-1` noise); D6 particle cloud; D7 dual-drone race (raw vs quantum-cleaned)
- D8 circuit figure, D9 reproducibility kit (one command regenerates `results/metrics.json`), D10 real-practice mapping table

**Defer (v2+ / "Extending this project"):**
- Real EMAG2/NAMAM maps and the MagNav Challenge HDF5 data
- Pinson 17-state EKF / INS error model
- QAOA TL-term feature selection (D11), quantum reservoir with temporal memory (QRC)
- Quantum map matching (Grover/QAOA), QFT filtering, quantum sensor physics, 3D globe maps, auth and persistence
- Training on IonQ and live QPU calls during judging, and any quantum-advantage claim (never)

### Architecture Approach

One pure library (`magnav/`) is the product. The Qollab Python modules and the dev harness both call it, so numbers match everywhere. The frontend only ever plays back a `RunArtifact` through one frame player. On Qollab, "live" and "replay" differ only in where the artifact comes from: computed in-page by Pyodide just now, or loaded from `data/precomputed_run.json`. A `JsBridge` abstraction has two implementations, `QollabBridge` (`import * as api from 'magnav.api'`, called with `callPromising(backend, seed)`) and `DevBridge` (a static JSON fixture, or optional local FastAPI returning plain JSON). The quantum leg takes `backend` as an argument. Training features come from exact `Statevector`. The IonQ leg is a single batched job, and its counts, backend name, shots and timestamp are saved as provenance and shown in the UI. Keep a `main.py` entry that runs the pipeline and prints metrics with matplotlib figures, as the Python-project fallback if the React bundle fails on Qollab.

**Major components:**
1. `magnav.sim` (map, flight + INS drift, noise): seeded pure functions returning a `Truth` object and a separate `Sensors` object
2. `magnav.classical` (TL ridge + RBF-KRR/low-pass baselines): same interface as the quantum denoiser
3. `magnav.quantum` (feature-map circuits, Statevector training features, ridge readout, single-job `backend.run` inference, counts to features)
4. `magnav.nav` (particle filter with INS propagation + map likelihood; Sensors + map only, never truth)
5. `magnav.metrics` / `magnav.api` (the only module touching truth; builds and serializes the `RunArtifact`, columnar JSON, map as a Float32 grid or PNG)
6. `web/` (React player: MapView, SignalPanel, MetricsPanel, Controls, ModeBadge "computed in-page" vs "precomputed replay"; plus honest provenance badges for the IonQ and hardware runs)

### Critical Pitfalls

1. **Quantum decoration / unfair comparison** — State in one sentence what the circuit computes. Give the quantum and classical models identical features, split and tuning budget. Run the identity/random-feature-map ablation. Report multi-seed results with the losing cases included.
2. **Violating the IonQ one-job rule** — Never loop `backend.run` or Estimator calls, and never train on IonQ. Train on exact `Statevector`, build all inference circuits up front, and submit them in one list. Add a test that `backend.run` is called exactly once. Probe batch size early (32 to 64 to 128) for `TooManyGates` / timeout limits.
3. **Qollab runtime surprises discovered late** — In the first hours: Vite-bundled React hello-world, a Bell circuit on Forte 1 remote simulator, publish, and open logged out. Record the findings. Keep the `main.py` fallback alive. Ask in `#hackathon-help`.
4. **Truth leakage and a mis-tuned map/noise** — Enforce `Truth` vs `Sensors` by signature (grep check). Train on a calibration flight and evaluate on a disjoint flight/seed. Tune map roughness and noise by a sweep so raw fails, cleaned succeeds, and denoiser differences reach position error. Match a profile or use a particle filter, never single-point matching.
5. **Compliance and honesty misses** — Commit the MIT LICENSE, verbatim attribution line "This effort is supported by Qollab & IonQ.", AI/library disclosure and theme tag (Quantum Impact) in the scaffold phase. State plainly that AQNav's quantum part is the sensor and ours is the compute, that data is synthetic, and that no advantage is claimed. Add accessibility from the first UI commit (keyboard, aria-live, colorblind-safe palette plus dash patterns, reduced motion, chart text alternatives).

## Implications for Roadmap

Seven phases, vertical slice first, quantum bounded, docs protected. Timeline is about H0 = Oct 9 11 PM PDT to deadline Oct 11 4 PM PDT (about 41 wall hours, about 32-34 working hours plus buffer).

### Phase 1: Scaffold, Compliance and Qollab Smoke Test (H0-H3)
**Rationale:** Platform access is the highest-uncertainty dependency, and the platform dictates the architecture. Find out in hour 1, not hour 22.
**Delivers:** Repo, `uv` env with pins, MIT LICENSE, README skeleton with the attribution line and disclosures, Qollab folder layout. Spikes: (a) Vite-built React hello-world running in a Qollab JS project, (b) Bell circuit with one batched `backend.run` on Forte 1 remote simulator (probe 32/64/128 circuits, shots), (c) publish and open logged out. Schema v1 of the `RunArtifact` (JS types mirrored by hand).
**Addresses:** T12 scaffolding, compliance
**Avoids:** Pitfalls on Qollab unknowns, Qiskit API breakage, credential confusion, compliance misses

### Phase 2: Synthetic World and Classical Pipeline (H3-H12)
**Rationale:** The valid-even-if-quantum-fails floor. Metrics must exist by about H12.
**Delivers:** Map, flight with INS drift, TL-style noise, `Truth`/`Sensors` split, TL baseline, equal-feature RBF-KRR, low-pass floor, particle filter, metrics, a map/noise sweep that picks the regime, and `precomputed_run.json`. A `main.py` that prints metrics and saves figures.
**Addresses:** T1-T5, T7, T8, D12 groundwork
**Avoids:** Map-gradient, noise-realism, leakage and unit pitfalls
**Uses:** numpy, scipy, scikit-learn (Pyodide families)

### Phase 3: Frontend Vertical Slice and In-Page "Live" (H12-H18)
**Rationale:** A visible demo exists early, built against the real artifact schema. Doing it before quantum protects the Core Value (drone holds position).
**Delivers:** `JsBridge` (Qollab + dev fixture), the frame player, MapView, SignalPanel, MetricsPanel, GPS-jammed beat, error readout, mode badge, in-page Pyodide compute then `requestAnimationFrame` animation, precomputed fallback. Accessibility basics from the first commit.
**Addresses:** T9, T10, T11, T13 (partial), D6/D7
**Avoids:** Live-path fragility, accessibility as a final pass
**Implements:** Artifact-first, source-agnostic playback (re-scoped, no SSE)

### Phase 4: Quantum Denoiser, Local (H18-H26)
**Rationale:** Bounded 8-hour box with hard stops: 6 qubits or fewer, one feature-map iteration after the first working version, a 2-hour check that it beats a trivial predictor on held-out data.
**Delivers:** Feature-map circuits, exact Statevector training features, ridge readout on the TL residual, identity/random ablation, comparison versus TL and RBF-KRR on identical features/splits, kernel-concentration and histogram check, nav result with quantum-cleaned signal.
**Addresses:** T6, D12, D1 core, D2
**Avoids:** Quantum decoration, kernel/VQC cost and convergence traps, unfair comparison

### Phase 5: IonQ Forte 1 Simulator Run and Hardware Capture (H26-H30)
**Rationale:** Required for submission and the longest external wait. Submit the QPU job as early as possible.
**Delivers:** One batched `backend.run` on Forte 1 remote simulator (counts to features to readout) that the whole app runs on without errors from the visitor's Run; a tested fallback to the built-in simulator; one hardware job (500+ shots; saved counts in `data/forte_hardware_run.json`, shown via a recorded-result selector); exact-vs-shots-vs-`forte-1` comparison (D3); provenance in the UI.
**Addresses:** T14, D3
**Avoids:** Aer-vs-IonQ divergence, BackendSamplerV2 zeros, hardware queue/credit risk

### Phase 6: Benchmarks, Accessibility and Polish (H30-H34)
**Rationale:** Turns a working demo into credible, reproducible evidence.
**Delivers:** Multi-seed mean +/- std, benchmark table with negative results, nT-to-metres curve, noise ablation, circuit figure, full a11y pass (keyboard walkthrough, axe/Lighthouse, reduced motion, chart text alternatives), feature freeze at about T-8h.
**Addresses:** T8 (multi-seed), D1, D4, D5, D8, D9, T13
**Avoids:** Cherry-picked results, accessibility misses

### Phase 7: Docs, Publish and Submission (H34-H41)
**Rationale:** Documentation is a quarter of the score. Write it incrementally, then audit.
**Delivers:** README (what/why/run/replicate/extend, per-criterion summary, honest AQNav framing, real-practice table, limitations, Chrome note, "select IonQ Forte 1 (Remote simulator)"), publish by zip, theme tag, repo and video links, demo video recorded from the precomputed path, logged-out test, compliance audit. About 3 hours of buffer; never schedule features into it.

### Phase Ordering Rationale

- Platform spike first because the Qollab runtime rewrote the architecture; every later phase inherits its limits.
- Classical before quantum: the theme demands a strong baseline, and the classical pipeline makes the map demo work at all.
- UI before quantum: protects the Core Value and exercises the artifact schema early. The quantum stub keeps its final interface so Phase 4 is a drop-in.
- Quantum training stays off IonQ entirely; the single IonQ job is inference only, and it is sequenced early enough for the hardware queue.
- Cut order if behind: hardware result, then the dual-drone race and the sweeps, then simplify nav to windowed correlation (TERCOM-style). Never cut: classical baseline, IonQ Forte 1 simulator run, README, LICENSE and attribution, the precomputed fallback.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Qollab bundle behavior (React in the sandboxed frame), max circuits per IonQ job, and whether credits cover the hardware run. These are empirical spikes, not research-able in advance.
- **Phase 4:** Quantum feature-map design (encoding, bandwidth, entangling layer, concentration check) is the least-proven part, and there is no guaranteed quantum edge.
- **Phase 5:** Forte remote-simulator limits (`TooManyGates`, `TooLongPredictedExecutionTime`), shot cost, and noise-floor handling in the readout.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Spectral GRF maps, TL regression, particle filters, and metrics are well documented (MagNav.jl / Challenge paper).
- **Phase 3:** React + canvas/SVG + recharts, with the bundle config already tested.
- **Phase 6:** Standard experiment scripting and a11y practice.
- **Phase 7:** Documentation and submission checklist.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against Qollab runtime docs, PyPI, npm, the Pyodide lock file, plus a local install and Vite build. The one MEDIUM item: the bundle has not run inside Qollab yet. |
| Features | MEDIUM | Real-practice items (MagNav Challenge, MagNav.jl) are HIGH. Quantum feasibility is engineering judgment, and AQNav figures are company-reported. |
| Architecture | MEDIUM | Component structure and the artifact/provenance patterns are solid. The FastAPI/SSE and notebook parts were written without Qollab knowledge and are superseded, so the live path is re-derived from STACK.md. |
| Pitfalls | MEDIUM | Qiskit 2.0 removals and IonQ behavior are HIGH. QML training behavior is literature plus training knowledge. Qollab items in PITFALLS were LOW and are now mostly resolved by STACK.md. |

**Overall confidence:** MEDIUM-HIGH. The platform and tooling are well established. Whether the quantum model produces any measurable benefit is unknown, and the plan is built to be valid either way.

### Gaps to Address

- **React bundle on Qollab:** not run in the real sandbox. Phase 1 smoke test; fallback is CDN imports or a Python-project (`main.py` + matplotlib) submission with the UI hosted separately.
- **Max circuits and gate budget per IonQ job on Forte 1 remote simulator:** undocumented. Probe 32/64/128 early; shrink the demo segment if rejected.
- **Hardware credits for the one QPU run:** unconfirmed. Ask in `#hackathon-help` on Day 1; if unavailable, show the `forte-1` noise-model result clearly labeled as a proxy.
- **Whether judges will pick Forte 1 remote simulator themselves:** the UI should say what to select and degrade gracefully on the built-in simulator, noting the shot-noise and noise-floor differences.
- **Training-vs-inference feature mismatch:** training features come from noise-free Statevector but IonQ inference is shot-noisy and noise-modeled. Measure the gap in Phase 5, and consider regularization or noise-aware calibration.
- **Pyodide performance:** the particle filter and in-page compute time are untested in-browser. Keep particle counts moderate and precompute as default.
- **qiskit-ionq 1.0.2 on the platform vs 1.1.1 locally:** do not rely on 1.1-only features such as `memory=True`.
- **Dual-use of ARCHITECTURE.md:** its SSE, `api/`, notebook and `CachedResults` sections are superseded. The RunArtifact schema, provenance fields, windowing, and the INS-drift design remain valid.

## Sources

### Primary (HIGH confidence)
- qollab.xyz/learn/docs (runtime-environment, js-qiskit-projects, compute-backends, primitives, transpilation, error-reference, upload-your-files, publish, python-qiskit-projects): Pyodide runtime, one-job-per-run, blocked network APIs, backend list and qubit ceilings, BackendSamplerV2 failure, file limits
- PyPI JSON API and npm registry (2026-10-09): pinned versions
- Pyodide 314.0.7 lock file: numpy/scipy/scikit-learn families; absence of filterpy and torch
- MagNav Challenge paper (arXiv:2007.12158) and MagNav.jl docs: sensors, TL terms, 10 Hz, metrics, EKF/MPF navigation
- IonQ Qiskit SDK docs, Qiskit 2.0 release notes: provider usage, transpile guidance, removed APIs, noise models
- Local verification in the scratchpad: stack install, batched-circuit test, Vite lib-mode build

### Secondary (MEDIUM confidence)
- SandboxAQ / Acubed AQNav reports (July 2025): company-reported results
- Q-CTRL MagNav field-trial paper (arXiv:2504.08167), JuliaCon MagNav talks
- Azure Quantum IonQ provider docs, qiskit-machine-learning release notes
- Barren plateau and kernel-concentration literature (training knowledge)

### Tertiary (LOW confidence)
- Hackathon announcement coverage (no runtime details)
- GRF map-synthesis parameters and the NISQ model-feasibility ratings: training knowledge; validate by the Phase 2 sweep and Phase 4 experiments

---
*Research completed: 2026-10-09*
*Ready for roadmap: yes*

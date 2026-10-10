# Requirements: Magnetic Field Detector (Quantum MagNav)

**Defined:** 2026-10-09
**Core Value:** Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.

## v1 Requirements

Requirements for the hackathon submission (deadline Oct 11, 2026, 7:00 PM ET). Each maps to roadmap phases.

### Platform & Compliance

- [ ] **PLAT-01**: Project is a Qollab JS project (`index.html` + Vite-built single `main.js`/`main.css` + `magnav/` Python package + `requirements.txt` + `data/`) that runs entirely in the visitor's browser on Qollab.xyz
- [ ] **PLAT-02**: A Phase-1 smoke test proves a Vite-bundled React page can call an in-page Python module and run one batched `backend.run` Bell-circuit job on IonQ Forte 1 (remote simulator) from Qollab, with findings (max circuits per job, shot limits, hardware credits) recorded in the repo
- [ ] **PLAT-03**: Local dev environment uses Python 3.13 via `uv` with pins matching Qollab/Pyodide (qiskit 2.5.2, numpy 2.4.x, scipy 1.18.x, scikit-learn 1.8.x) so code that works locally works on Qollab
- [ ] **PLAT-04**: Repo contains the MIT LICENSE, the verbatim attribution line "This effort is supported by Qollab & IonQ.", the Quantum Impact theme tag, and a disclosure section listing AI tools and libraries used, all committed in the first phase
- [ ] **PLAT-05**: All code is written during the build window; no pre-existing code is reused

### Simulation

- [ ] **SIM-01**: User can generate a seeded synthetic crustal magnetic anomaly map (spectral Gaussian random field with power-law spectrum, upward continuation, ±100–500 nT scale, a few dipole blobs) as a 2D grid with bilinear interpolation
- [ ] **SIM-02**: User can simulate a seeded drone flight at 10 Hz with turns and attitude manoeuvres, producing true position, heading/pitch/roll, direction cosines, a drifting INS (dead-reckoning) track, and the true clean magnetometer trace
- [ ] **SIM-03**: Simulator injects physically motivated drone self-noise with separately adjustable terms: Tolles-Lawson attitude terms (permanent/induced/eddy), aliased motor/ESC tones modulated by throttle, current-dependent offset, white noise, and slow drift, yielding the raw sensor trace plus 2–4 current channels
- [ ] **SIM-04**: Simulation output is split into a `Truth` object and a `Sensors` object so that no estimator function can accept truth; truth is used only by metrics
- [ ] **SIM-05**: A map-roughness vs noise-level sweep selects a regime where raw-signal navigation fails, cleaned-signal navigation succeeds, and denoiser differences are visible in position error

### Classical Baselines

- [ ] **BASE-01**: Tolles-Lawson ridge regression (permanent + induced + eddy terms from the vector mag, optional current columns, 0.1–0.9 Hz bandpass) cleans the raw trace and serves as the primary classical baseline
- [ ] **BASE-02**: An equal-feature classical learner (RBF kernel ridge) trained on the TL residual with exactly the features and train/test split the quantum model uses serves as the fair comparison partner
- [ ] **BASE-03**: A naive low-pass filter is reported as the floor
- [ ] **BASE-04**: Models are trained on a calibration flight/seed and evaluated on a disjoint held-out flight/seed

### Quantum Denoiser

- [ ] **QNT-01**: A Qiskit fixed feature-map circuit on 4–6 qubits (≤3 entangling layers) encodes the drone-state features (direction cosines and derivatives, motor current, throttle) for each window
- [ ] **QNT-02**: Training features are computed with exact `qiskit.quantum_info.Statevector` locally, so training never calls `backend.run`; a classical ridge readout is fit on the TL residual
- [ ] **QNT-03**: Inference submits all window circuits as exactly one batched `backend.run([...])` call (32–128 circuits, 100–500 shots), reads results via `get_counts()` (never `BackendSamplerV2`), and a test asserts `backend.run` is called exactly once
- [ ] **QNT-04**: The quantum module accepts `backend` as an argument and runs without errors on IonQ Forte 1 (remote simulator) when a visitor presses Run on Qollab, and degrades gracefully on the built-in browser simulator
- [ ] **QNT-05**: An ablation (identity / random feature map) and a kernel-concentration / feature-histogram check are run and reported so the circuit's contribution is demonstrated, not assumed
- [ ] **QNT-06**: One real IonQ hardware job (≥500 shots) is submitted early, its counts saved to `data/forte_hardware_run.json` with backend name, shots, and timestamp, and shown in the UI as a labeled recorded result; if credits are unavailable the `forte-1` noise-model result is shown clearly labeled as a proxy

### Navigation

- [ ] **NAV-01**: A 2D particle filter (500–2000 particles, INS-drift motion model, Gaussian map-likelihood with σ set to the denoiser's residual std, systematic resampling) estimates position from `Sensors` and the map only
- [ ] **NAV-02**: The filter is run once per denoiser output (raw, low-pass, TL, classical KRR, quantum) on identical seeds so position error can be compared across denoisers
- [ ] **NAV-03**: A "GPS jammed at t=X" event switches estimation to magnetic-only after that point, so the demo shows drift without MagNav and hold with it

### Metrics & Benchmarks

- [ ] **METR-01**: Per denoiser, the pipeline reports signal RMSE and error std (nT), mean and final position error (m), CEP50/CEP95, and % time under an RNP-style threshold
- [ ] **METR-02**: Results are reported over 5–10 seeds as mean ± std in a benchmark table that includes a negative-results section stating plainly where the quantum model ties or loses and why
- [ ] **METR-03**: A nT-to-metres curve (position error vs injected signal RMSE) places each denoiser on the curve
- [ ] **METR-04**: A training-set-size sweep (e.g. 20/50/100/200 samples) compares quantum vs classical KRR to identify any regime where quantum helps
- [ ] **METR-05**: One command regenerates `results/metrics.json`, CSVs, and every figure from fixed seeds (reproducibility kit)

### Demo UI

- [ ] **UI-01**: The React frontend plays back a single `RunArtifact` JSON (versioned schema, columnar, < 2 MB) through one frame player, whether the artifact was computed in-page by Pyodide or loaded from `data/precomputed_run.json`
- [ ] **UI-02**: Map view shows the anomaly heatmap, true path (solid), estimated path (dashed), dead-reckoning-only path, drone icon, GPS-jammed marker, live position-error readout, and a downsampled particle cloud
- [ ] **UI-03**: Signal panel shows truth, raw, TL, classical KRR, and quantum-cleaned traces with toggles, an RMSE badge per series, and a residual subplot
- [ ] **UI-04**: Metrics panel shows the benchmark table and provenance badges ("computed in-page" vs "precomputed replay"; IonQ backend name, shots, timestamp for the quantum leg; hardware result label)
- [ ] **UI-05**: "Live" mode computes a fresh flight in-page (seed selectable) and animates it with `requestAnimationFrame`; if compute or the quantum job fails, the UI automatically falls back to the precomputed replay with identical visuals and a visible badge
- [ ] **UI-06**: A dual-drone view runs the raw and quantum-cleaned estimators on the same path side by side

### Accessibility

- [ ] **A11Y-01**: All controls are keyboard-operable with visible focus, charts and toggles have aria-labels, and status changes are announced via aria-live
- [ ] **A11Y-02**: Meaning is never carried by colour alone (colour-blind-safe palette plus line dash patterns), `prefers-reduced-motion` switches animation to stepped updates, and each chart has a text or table alternative
- [ ] **A11Y-03**: An automated accessibility check (axe or Lighthouse) and a keyboard walkthrough pass before submission

### Documentation & Submission

- [ ] **DOCS-01**: README explains what the project does, the problem, how to run locally and on Qollab (select IonQ Forte 1 remote simulator; Chrome recommended), and how to replicate or extend it
- [ ] **DOCS-02**: README contains a written summary per judging criterion (novelty, technical execution, impact, documentation), the honest framing that AQNav's quantum part is the sensor while ours is the compute, that data is synthetic, and that no quantum advantage is claimed
- [ ] **DOCS-03**: README includes a real-practice mapping table (what we simulate vs MagNav Challenge / MagNav.jl / AQNav), a circuit figure with a 3-sentence encoding explanation, and a limitations / future-work section
- [ ] **DOCS-04**: Project is published on Qollab.xyz under MIT with theme tag, repo link, and a short demo video recorded from the precomputed path, and is verified to run start to finish from a logged-out browser before the deadline

## v2 Requirements

Deferred to "Extending this project". Tracked but not in current roadmap.

### Data Realism

- **DATA-01**: Ingest a real crustal anomaly map (NOAA EMAG2 / NAMAM) as an alternative map source
- **DATA-02**: Load MagNav Challenge HDF5 flight data and run the pipeline on real sensor channels

### Navigation Fidelity

- **NAVX-01**: Pinson 17-state INS error model with EKF
- **NAVX-02**: Altitude dimension and upward continuation of the map to flight altitude

### Quantum Extensions

- **QNTX-01**: QAOA selection of Tolles-Lawson terms on ~20–24 qubits, benchmarked against greedy selection
- **QNTX-02**: Quantum reservoir computing with temporal memory for the motor/eddy components
- **QNTX-03**: Shot-noise and `forte-1` noise-model robustness study with simple mitigation (PSD projection, diagonal renormalization)
- **QNTX-04**: Noise-source ablation table (TL / motor / current / white) per model

### Dev Tooling

- **DEV-01**: Optional local FastAPI harness serving the same `RunArtifact` JSON for faster frontend iteration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real magnetometer or phone sensor data | No quantum magnetometer available; synthetic keeps 40 h achievable and deterministic |
| Simulating quantum sensor physics (NV-center / spin dynamics) on the QPU | Different project; the QPU does the denoising step |
| Live QPU hardware calls during the judged demo | Queue and credit risk; one captured hardware result instead |
| Training on the IonQ simulator or QPU | One `backend.run` per Run on Qollab; training is free locally via Statevector |
| FastAPI/SSE/WebSocket backend in the deployed demo | Qollab blocks WebSocket, XHR, POST and workers; everything runs in-page |
| Quantum map matching (Grover / QAOA position search), QFT filtering | No advantage at demo scale; recognised overclaim pattern |
| Deep VQC (>8 qubits, many layers) trained by gradient | Barren plateaus and training loops cannot run under the one-job rule |
| 3D globe / Mapbox / Cesium | API keys, heavy deps, accessibility and Qollab deploy friction |
| Auth, persistence, run history | Zero judging value for a single-user demo |
| Claiming quantum advantage | False at this scale; costs credibility with technical judges |
| filterpy, plotly, torch | Not available in Pyodide / over the 2 MB per-file cap |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (filled by roadmapper) | | |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 0
- Unmapped: 41 ⚠️

---
*Requirements defined: 2026-10-09*
*Last updated: 2026-10-09 after initial definition*

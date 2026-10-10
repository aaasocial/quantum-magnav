# Requirements: Magnetic Field Detector (Quantum MagNav)

**Defined:** 2026-10-09
**Core Value:** Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.

## v1 Requirements

Requirements for the hackathon submission (deadline Oct 11, 2026, 7:00 PM ET). Each maps to roadmap phases.

### Platform & Compliance

- [x] **PLAT-01**: Project is a Qollab JS project (`index.html` + Vite-built single `main.js`/`main.css` + `magnav/` Python package + `requirements.txt` + `data/`) that runs entirely in the visitor's browser on Qollab.xyz
- [x] **PLAT-02**: A Phase-1 smoke test proves a Vite-bundled React page can call an in-page Python module and run one `backend.run` Bell-circuit job on IonQ Forte 1 (remote simulator) from Qollab, with findings (max circuits per job, shot limits, hardware credits) recorded in the repo. *(Amended 2026-10-10: Qollab's IonQ proxy accepts only single-circuit jobs (`ionq.circuit.v1`); multi-circuit batches return HTTP 400. Proven with one circuit at 200 and 4096 shots.)*
- [x] **PLAT-03**: Local dev environment uses Python 3.13 via `uv` with pins matching Qollab/Pyodide (qiskit 2.5.2, numpy 2.4.x, scipy 1.18.x, scikit-learn 1.8.x) so code that works locally works on Qollab
- [x] **PLAT-04**: Repo contains the MIT LICENSE, the verbatim attribution line "This effort is supported by Qollab & IonQ.", the Quantum Impact theme tag, and a disclosure section listing AI tools and libraries used, all committed in the first phase
- [x] **PLAT-05**: All code is written during the build window; no pre-existing code is reused

### Real Data

- [x] **DATA-01**: A local-only preprocessing script `scripts/preprocess_sgl.py` (uses h5py, runs only on the dev machine, never imported by `magnav/` or shipped to Qollab) reads Flt1006, Flt1003 and Flt1007 from `data_raw/`, extracts calibration line 1006.08 (tt 55770–56609) and held-out lines 1003.02 (tt 50713–54497) and 1007.06 (tt 57770–63010), keeps only the needed channels (`tt`, `mag_1_c`, `mag_1_igrf`, `mag_3_uc`, `mag_4_uc`, `mag_5_uc`, `flux_a..d` x/y/z/t, `cur_*`, `ins_pitch`/`ins_roll`/`ins_yaw`, `ins_vn`/`ins_vw`, `lat`/`lon`, `utm_x`/`utm_y`/`utm_z`), and decimates or crops so each output (`data/flt1006_line08.npz`, `data/flt1003_line02.npz`, `data/flt1007_line06.npz`) is under 2 MB
- [x] **DATA-02**: The same script crops MagNav.jl `Eastern_395.h5` and `Renfrew_395.h5` (395 m HAE, nT) to each held-out line's bounding box plus a margin and writes `data/map_eastern_395.npz` and `data/map_renfrew_395.npz` (nT grid, lon/lat vectors, validity mask), each under 2 MB; k-NN-filled cells are marked invalid, and EMAG2v3 (DOI 10.7289/V5H70CVX) is used at most as a coarse-map comparison, never as the navigation map
- [x] **DATA-03**: A provenance sidecar `data/provenance.json` records, per output file, the source file, line number, tt range, decimation factor, channel list and source-file SHA-256; reproducibility means the same input files plus the same script give byte-identical outputs, and a test asserts every file in `data/` is under 2 MB
- [x] **DATA-04**: `magnav/` loads the excerpts through literal path strings (e.g. `"data/flt1003_line02.npz"`) and splits each line into a `Truth` object (`mag_1_c`, `mag_1_igrf`, `lat`/`lon`, `utm_x`/`utm_y`/`utm_z`) and a `Sensors` object (cabin mags, fluxgates, `cur_*`, INS attitude and velocities, simulated INS track) so that no estimator or denoiser function can accept truth; truth is used only by metrics
- [x] **DATA-05**: A simulated INS-drift track integrates `ins_vn`/`ins_vw` from the last GPS fix at the jam time, adding a constant velocity bias and a random walk with documented parameters and a fixed recorded RNG state, because the recorded INS channels are GPS-aided and do not drift

### Classical Baselines

- [x] **BASE-01**: Tolles-Lawson ridge regression (permanent + induced + eddy terms from the fluxgate vector, optional `cur_*` columns, 0.1–0.9 Hz bandpass) fitted on calibration line 1006.08 compensates one cabin magnetometer toward the stinger reference (`mag_1_c`) and serves as the primary classical baseline
- [x] **BASE-02**: An equal-feature classical learner (RBF kernel ridge) trained on the TL residual with exactly the features and train/test split the quantum model uses serves as the fair comparison partner
- [x] **BASE-03**: A naive low-pass filter on the cabin magnetometer is reported as the floor
- [x] **BASE-04**: Models are trained on calibration line 1006.08 and evaluated only on held-out lines 1003.02 and 1007.06; denoisers predict `mag_1_c`, and the map-matching leg uses the `mag_1_igrf`-equivalent (IGRF + diurnal removed) cleaned signal

### Quantum Denoiser

- [ ] **QNT-01**: A Qiskit fixed feature-map circuit on 4–6 qubits (≤3 entangling layers) encodes the aircraft-state features (fluxgate direction cosines and their derivatives, plus `cur_*` current channels) for each window
- [ ] **QNT-02**: Training features are computed with exact `qiskit.quantum_info.Statevector` locally, so training never calls `backend.run`; a classical ridge readout is fit on the TL residual
- [ ] **QNT-03**: Inference on IonQ submits exactly ONE `backend.run(circuit)` call per Run holding a single circuit (Qollab rejects multi-circuit jobs); all evaluation windows are packed into that one circuit on disjoint qubit blocks (≤29 qubits on Forte 1) or run on the built-in/local simulator with the forte-1 noise model, results are read via `get_counts()` (never `BackendSamplerV2`), and a test asserts `backend.run` is called exactly once with a bare circuit
- [ ] **QNT-04**: The quantum module accepts `backend` as an argument and runs without errors on IonQ Forte 1 (remote simulator) when a visitor presses Run on Qollab, and degrades gracefully on the built-in browser simulator
- [ ] **QNT-05**: An ablation (identity / random feature map) and a kernel-concentration / feature-histogram check are run and reported so the circuit's contribution is demonstrated, not assumed
- [ ] **QNT-06**: One real IonQ hardware job (≥500 shots) is submitted early, its counts saved to `data/forte_hardware_run.json` with backend name, shots, and timestamp, and shown in the UI as a labeled recorded result; if credits are unavailable the `forte-1` noise-model result is shown clearly labeled as a proxy

### Navigation

- [x] **NAV-01**: Windowed-correlation (TERCOM-style) matching slides each cleaned-signal window over the Eastern_395 / Renfrew_395 map within a search region centred on the simulated INS-drift prior, picks the best-correlating offset, never matches through invalid (k-NN-filled) cells, and estimates position from `Sensors` and the map only
- [x] **NAV-02**: The matcher is run once per denoiser output (raw cabin, low-pass, TL, classical KRR, quantum) on identical held-out lines and segments so position error can be compared across denoisers
- [x] **NAV-03**: A "GPS jammed at t=X" event switches estimation to magnetic-only after that point, so the demo shows drift without MagNav and hold with it

### Metrics & Benchmarks

- [x] **METR-01**: Per denoiser, the pipeline reports signal RMSE and error std (nT), mean and final position error (m), CEP50/CEP95, and % time under an RNP-style threshold
- [ ] **METR-02**: Results are reported over N contiguous segments of held-out lines 1003.02 and 1007.06 (N = 5–10) as mean ± std in a benchmark table that includes a negative-results section stating plainly where the quantum model ties or loses and why
- [ ] **METR-03**: A nT-to-metres curve (position error vs cleaned-signal RMSE) places each denoiser and each cabin sensor on the curve
- [ ] **METR-04**: A training-set-size sweep (e.g. 20/50/100/200 windows subsampled from 1006.08) compares quantum vs classical KRR to identify any regime where quantum helps
- [ ] **METR-05**: One command regenerates `results/metrics.json`, CSVs, and every figure from the committed `data/` excerpts (reproducibility kit; no seeds involved)
- [ ] **METR-06**: A cabin-sensor sweep runs TL, KRR and quantum on Mag 3 vs Mag 4 vs Mag 5 and reports which cabin position each denoiser handles best

### Demo UI

- [x] **UI-01**: The React frontend plays back a single `RunArtifact` JSON (versioned schema, columnar, < 2 MB) through one frame player, whether the artifact was computed in-page by Pyodide or loaded from `data/precomputed_run.json`
- [ ] **UI-02**: Map view shows the real anomaly heatmap tile (Eastern_395 or Renfrew_395, invalid cells visibly hatched or greyed), true path (solid), estimated path (dashed), dead-reckoning-only (simulated INS drift) path, drone icon, GPS-jammed marker, and live position-error readout; a downsampled particle cloud appears only if the optional particle filter (NAVX-03) is built
- [ ] **UI-03**: Signal panel shows truth, raw, TL, classical KRR, and quantum-cleaned traces with toggles, an RMSE badge per series, and a residual subplot
- [ ] **UI-04**: Metrics panel shows the benchmark table and provenance badges ("computed in-page" vs "precomputed replay"; IonQ backend name, shots, timestamp for the quantum leg; hardware result label)
- [x] **UI-05**: "Live" mode computes a selectable held-out line or segment (1003.02 or 1007.06) in-page and animates it with `requestAnimationFrame`; if compute or the quantum job fails, the UI automatically falls back to the precomputed replay with identical visuals and a visible badge
- [ ] **UI-06**: A dual-drone view runs the raw and quantum-cleaned estimators on the same path side by side

### Accessibility

- [ ] **A11Y-01**: All controls are keyboard-operable with visible focus, charts and toggles have aria-labels, and status changes are announced via aria-live
- [ ] **A11Y-02**: Meaning is never carried by colour alone (colour-blind-safe palette plus line dash patterns), `prefers-reduced-motion` switches animation to stepped updates, and each chart has a text or table alternative
- [ ] **A11Y-03**: An automated accessibility check (axe or Lighthouse) and a keyboard walkthrough pass before submission

### Documentation & Submission

- [ ] **DOCS-01**: README explains what the project does, the problem, how to run locally and on Qollab (select IonQ Forte 1 remote simulator; Chrome recommended), and how to replicate or extend it
- [ ] **DOCS-02**: README contains a written summary per judging criterion (novelty, technical execution, impact, documentation), the honest framing that AQNav's quantum part is the sensor while ours is the compute, a real-data provenance statement (SGL 2020 flight data and MagNav.jl maps, cropped excerpts only), and that no quantum advantage is claimed
- [ ] **DOCS-03**: README includes a real-practice mapping table (what is real data vs what we simulate, i.e. the GPS jam and INS drift, compared with MagNav Challenge / MagNav.jl / AQNav), a circuit figure with a 3-sentence encoding explanation, and a limitations / future-work section
- [ ] **DOCS-04**: Project is published on Qollab.xyz under MIT with theme tag, repo link, and a short demo video recorded from the precomputed path, and is verified to run start to finish from a logged-out browser before the deadline
- [ ] **DOCS-05**: README carries the citation "[DataSet Name] provided by the United States Air Force pursuant to Cooperative Agreement Number FA8750-19-2-1000 - [dates used]" filled in for the SGL 2020 dataset, the challenge-paper BibTeX (Gnadt et al., arXiv:2007.12158), MagNav.jl map attribution, the EMAG2v3 DOI if EMAG2 is used, notes the dataset's public-domain LICENSE.md and non-profit DATA_SHARING_AGREEMENT.md, and states that only cropped excerpts are redistributed

## v2 Requirements

Deferred to "Extending this project". Tracked but not in current roadmap.

### Navigation Fidelity

- **NAVX-01**: Pinson 17-state INS error model with EKF
- **NAVX-02**: Altitude dimension and upward continuation of the map to flight altitude
- **NAVX-03**: Optional stretch: 2D particle filter (500–2000 particles, INS-drift motion model, Gaussian map likelihood with σ set to the denoiser's residual std, systematic resampling) as an alternative to windowed correlation

### Data Extensions

- **DATAX-01**: EMAG2v3 coarse-map comparison showing navigation error with a 4 km-altitude 2 arc-min map vs the 395 m Ottawa maps

### Quantum Extensions

- **QNTX-01**: QAOA selection of Tolles-Lawson terms on ~20–24 qubits, benchmarked against greedy selection
- **QNTX-02**: Quantum reservoir computing with temporal memory for the motor/eddy components
- **QNTX-03**: Shot-noise and `forte-1` noise-model robustness study with simple mitigation (PSD projection, diagonal renormalization)
- **QNTX-04**: Feature-group ablation table (TL attitude terms / fluxgate / current channels) per model

### Dev Tooling

- **DEV-01**: Optional local FastAPI harness serving the same `RunArtifact` JSON for faster frontend iteration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Collecting our own magnetometer or phone sensor data | No quantum magnetometer available; the public SGL 2020 dataset supplies real polluted and clean channels |
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
| Synthetic map generator, synthetic noise model, seeded flights, map-roughness sweep | Replaced by real SGL data and Ottawa maps (2026-10-10) |
| Shipping raw SGL HDF5 or reading HDF5 on Qollab | 63–123 MB files exceed the 2 MB cap; data-sharing agreement; only cropped `.npz` excerpts ship |
| Navigating through k-NN-filled map cells | Not real data |
| EMAG2v3 as the navigation map | 4 km altitude, 2 arc-min: too coarse for 400 m flight |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Complete |
| PLAT-02 | Phase 1 | Complete |
| PLAT-03 | Phase 1 | Complete |
| PLAT-04 | Phase 1 | Complete |
| PLAT-05 | Phase 1 | Complete |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 2 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 2 | Complete |
| DATA-05 | Phase 2 | Complete |
| BASE-01 | Phase 2 | Complete |
| BASE-02 | Phase 2 | Complete |
| BASE-03 | Phase 2 | Complete |
| BASE-04 | Phase 2 | Complete |
| QNT-01 | Phase 4 | Pending |
| QNT-02 | Phase 4 | Pending |
| QNT-03 | Phase 4 | Pending |
| QNT-04 | Phase 4 | Pending |
| QNT-05 | Phase 4 | Pending |
| QNT-06 | Phase 4 | Pending |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| METR-01 | Phase 2 | Complete |
| METR-02 | Phase 5 | Pending |
| METR-03 | Phase 5 | Pending |
| METR-04 | Phase 5 | Pending |
| METR-05 | Phase 5 | Pending |
| METR-06 | Phase 5 | Pending |
| UI-01 | Phase 3 | Complete |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 4 | Pending |
| UI-05 | Phase 3 | Complete |
| UI-06 | Phase 5 | Pending |
| A11Y-01 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 5 | Pending |
| DOCS-01 | Phase 6 | Pending |
| DOCS-02 | Phase 6 | Pending |
| DOCS-03 | Phase 6 | Pending |
| DOCS-04 | Phase 6 | Pending |
| DOCS-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-09*
*Last updated: 2026-10-10 after switching to real SGL flight data and Ottawa maps*

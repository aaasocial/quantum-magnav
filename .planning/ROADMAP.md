# Roadmap: Magnetic Field Detector (Quantum MagNav)

## Overview

A solo, ~40-hour build (Oct 9, 2026 ~11 PM PDT to the Oct 11, 2026 4:00 PM PDT / 7:00 PM ET deadline) that goes from an empty repo to a published Qollab.xyz project. The order is vertical slice first. Phase 1 proves the Qollab runtime and locks compliance. Phase 2 turns real public data (SGL 2020 flight lines and the MagNav.jl Ottawa maps) into cropped Qollab-sized excerpts and builds the classical baselines, windowed-correlation navigation and metrics on it, which give a valid result even if quantum fails. Phase 3 puts that result in front of a judge as an accessible React player with a precomputed fallback. Only then does Phase 4 replace the quantum stub with the real Qiskit feature-map denoiser, its single IonQ Forte 1 job and the early hardware capture. Phase 5 turns the working demo into honest multi-segment evidence, and Phase 6 ships the docs and submission while protecting about 3 hours of buffer.

The research SUMMARY proposed 7 phases. Under the "coarse" granularity setting, its Phase 4 (quantum, local) and Phase 5 (IonQ run and hardware capture) are merged into one quantum phase, because the hardware job must be submitted the moment the circuit is final. That gives 6 phases, each a clean vertical increment.

**Time budget** (working hours; done-by times in PDT are targets that assume about 5 hours of sleep on night 1 and none on night 2):

| Phase | Budget | Target done by |
|-------|--------|----------------|
| 1. Scaffold, Compliance and Qollab Smoke Test | ~3 h | Fri Oct 10, 2 AM |
| 2. Real Flight Data and Classical Pipeline | ~8 h | Fri Oct 10, 3 PM |
| 3. Frontend Vertical Slice | ~5 h | Fri Oct 10, 8 PM |
| 4. Quantum Denoiser and IonQ Runs | ~9 h | Sat Oct 11, 5 AM |
| 5. Benchmarks, Accessibility and Polish | ~3 h | Sat Oct 11, 8 AM |
| 6. Docs, Publish and Submission | ~4 h + ~3 h buffer | Docs done Sat 12-1 PM; buffer until 4 PM PDT |

**Cut order if behind:** hardware result (fall back to the labeled `forte-1` noise-model proxy), then the dual-drone view and the sweeps, then the second held-out line (keep 1003.02, drop 1007.06 / Renfrew). **Never cut:** the classical baseline, the IonQ Forte 1 simulator run, README, LICENSE and attribution, the precomputed fallback.

**Data note (2026-10-10):** the synthetic world was replaced with real SGL 2020 flight data and MagNav.jl Ottawa maps; raw HDF5 stays in gitignored `data_raw/` and only cropped `data/*.npz` excerpts ship.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scaffold, Compliance and Qollab Smoke Test** - Prove the Qollab runtime end to end and commit every compliance artifact (~3 h) (completed 2026-10-10)
- [x] **Phase 2: Real Flight Data and Classical Pipeline** - Preprocess SGL 2020 lines and Ottawa maps into <2 MB excerpts, Truth/Sensors split, simulated INS drift, Tolles-Lawson and KRR baselines, windowed-correlation nav, metrics and the precomputed artifact (~8 h) (completed 2026-10-10)
- [x] **Phase 3: Frontend Vertical Slice** - Accessible React player showing the drone hold position after GPS jamming, with in-page compute and precomputed fallback (~5 h) (completed 2026-10-10)
- [ ] **Phase 4: Quantum Denoiser and IonQ Runs** - Replace the quantum stub with the feature-map denoiser, one single-circuit IonQ Forte 1 job (Qollab rejects multi-circuit jobs), and the early hardware capture (~9 h)
- [ ] **Phase 5: Benchmarks, Accessibility and Polish** - Multi-segment benchmark evidence, training-size and cabin-sensor sweeps, reproducibility kit, dual-drone view, accessibility audit (~3 h)
- [ ] **Phase 6: Docs, Publish and Submission** - README, published Qollab project, demo video, logged-out verification, with ~3 h buffer (~4 h + buffer)

## Phase Details

### Phase 1: Scaffold, Compliance and Qollab Smoke Test

**Goal**: The builder knows, within the first hours, that a Vite-bundled React page can call in-page Python and run one single-circuit IonQ Forte 1 job (Qollab rejects multi-circuit jobs) on Qollab, and the repo already satisfies every licensing and disclosure rule
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05
**Budget**: ~3 hours (H0-H3)
**Success Criteria** (what must be TRUE):

  1. Opening the Qollab JS project (`index.html` + Vite-built `main.js`/`main.css` + `magnav/` package + `requirements.txt` + `data/`) and pressing Run shows a bundled page that calls an in-page Python function and displays the counts of a Bell circuit submitted in one batched `backend.run` on IonQ Forte 1 (remote simulator)
  2. A findings file in the repo records max circuits per job (32/64/128 probe), shot limits, and whether hardware credits are available, so later phases size the quantum job against facts
  3. The published smoke-test project opens from a logged-out browser
  4. `uv sync` on Python 3.13 installs the pinned stack (qiskit 2.5.2, numpy 2.4.x, scipy 1.18.x, scikit-learn 1.8.x) and the same `magnav` import that works on Qollab works locally
  5. The repo contains the MIT LICENSE, the verbatim line "This effort is supported by Qollab & IonQ.", the Quantum Impact theme tag, and an AI-tools/library disclosure section, with first commits dated inside the build window

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — uv/Python 3.13 pinned env, compliance set (LICENSE, README attribution/theme/disclosure), magnav.api one-job Bell API + main.py fallback

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Vite lib-mode toolchain, magnav.api bridge and React smoke page bundled to root main.js/main.css, Qollab contract test

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Packaging zips, findings template with prepared repo commands, human Qollab checkpoint (public repo, IonQ Forte 1 run, 32/64/128 probe, publish, logged-out, credits)

### Phase 2: Real Flight Data and Classical Pipeline

**Goal**: Running one command on real SGL 2020 data shows, with numbers, that after a simulated GPS jam the dead-reckoning and raw-cabin-signal tracks drift while the Tolles-Lawson-cleaned track holds position on held-out lines; this is the valid-even-if-quantum-fails floor
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, BASE-01, BASE-02, BASE-03, BASE-04, NAV-01, NAV-02, NAV-03, METR-01
**Budget**: ~8 hours (H3-H12 working)
**Success Criteria** (what must be TRUE):

  1. `scripts/preprocess_sgl.py` (local only, h5py) reads Flt1006/1003/1007 and Eastern_395/Renfrew_395 from `data_raw/` and writes `data/flt1006_line08.npz`, `data/flt1003_line02.npz`, `data/flt1007_line06.npz`, `data/map_eastern_395.npz`, `data/map_renfrew_395.npz` and `data/provenance.json`; every file is under 2 MB, and re-running on the same inputs gives byte-identical outputs
  2. `python main.py` loads the excerpts by literal path, simulates INS drift from `ins_vn`/`ins_vw` with bias and random walk, and after the "GPS jammed at t=X" event the printed metrics show the raw-cabin and dead-reckoning tracks drifting while the TL-cleaned track stays within the RNP-style threshold on 1003.02 (and 1007.06)
  3. Tolles-Lawson is fitted on calibration line 1006.08 only, and a metrics table reports signal RMSE/std (nT, vs `mag_1_c`), mean/final position error (m), CEP50/CEP95 and % time under threshold for raw cabin, low-pass, TL, classical KRR and the quantum slot (a stub with the final denoiser interface), evaluated only on held-out lines 1003.02 and 1007.06
  4. Windowed-correlation (TERCOM-style) matching against the Eastern_395 / Renfrew_395 tile is the navigator, and it never matches through invalid (k-NN-filled) map cells
  5. Estimator and denoiser functions cannot receive the `Truth` object (enforced by signature and a grep/test check); only metrics touch truth
  6. `data/precomputed_run.json` (versioned `RunArtifact`, columnar, under 2 MB) is written from the same run

**Plans**: 3 plans

**Wave 1**

- [x] 02-01-PLAN.md — preprocess_sgl.py excerpts + provenance (<2 MB, byte-identical), Truth/Sensors loader, INS drift, gated recursive-prior TERCOM, metrics, thin `python main.py` (DR/raw/low-pass, both sensors)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Tolles-Lawson and TL+currents fitted on 1006.08, equal-feature numpy KRR, QuantumDenoiser stub (never calls backend.run), six-denoiser run for Mag 5 and Mag 4

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — RunArtifact v1 `data/precomputed_run.json` (<2 MB), D-17 acceptance checks (6/6 PASS), results/ figures, README data citation and reproduction

### Phase 3: Frontend Vertical Slice

**Goal**: A judge opening the Qollab project sees the drone icon hold its position after GPS is jammed, with the denoising evidence beside it, and the demo never breaks because a failed live run falls back to the precomputed replay
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-05, A11Y-01, A11Y-02
**Budget**: ~5 hours (H12-H17 working)
**Success Criteria** (what must be TRUE):

  1. On Qollab, the map view plays the flight over the real Eastern_395 / Renfrew_395 anomaly heatmap (invalid cells visibly marked) with true (solid), estimated (dashed) and dead-reckoning paths, the drone icon, the GPS-jammed marker and a live position-error readout; a particle cloud appears only if the optional particle filter is built
  2. The signal panel shows stinger truth, raw cabin, TL, classical KRR and quantum-slot traces with toggles, an RMSE badge per series, and a residual subplot
  3. "Live" mode computes a chosen held-out line or segment in-page and animates it; forcing a compute failure switches automatically to `data/precomputed_run.json` with identical visuals and a visible "precomputed replay" badge
  4. A keyboard-only user can operate every control with visible focus, status changes are announced via aria-live, and screen-reader labels exist on charts and toggles
  5. With colour removed, series are still distinguishable by dash pattern; with `prefers-reduced-motion` on, animation becomes stepped; each chart has a text or table alternative

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Python live API: resumable tercom_steps, artifact.line_entry, magnav/live.py (stage 2 one fit per call), api.artifact_json + live_start/step/skip/result/cancel, equivalence and no-backend.run tests

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02-PLAN.md — JS data + map core: pinned deps, serialized bridge + dev stub (?raw), artifact/playback/colormap/geo libs with node tests, theme, usePlayback, cividis MapView

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-03-PLAN.md — Playable App shell: ControlBar, StatusStrip, dark theme, MapView mounted, UI-SPEC keyboard map, reduced motion, keep-alive, probes, single aria-live Announcer

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03-04-PLAN.md — SignalPanel + residual (recharts), metrics/text tables, jam banner, pure node-tested runLive with fallback, bundle/compliance gates, packaging, Qollab editor check (no publish)
**UI hint**: yes

### Phase 4: Quantum Denoiser and IonQ Runs

**Goal**: The quantum slot holds a real Qiskit feature-map denoiser that a visitor can run on IonQ Forte 1 from Qollab in exactly one job, its contribution is shown by ablation rather than assumed, and one real hardware result is captured as early as the circuit is final
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: QNT-01, QNT-02, QNT-03, QNT-04, QNT-05, QNT-06, UI-04
**Budget**: ~9 hours (H17-H26 working); hard stops: at most 6 qubits, one feature-map iteration after the first working version, and a 2-hour check that it beats a trivial predictor on held-out data
**Success Criteria** (what must be TRUE):

  1. The quantum denoiser (4-6 qubit fixed feature map, at most 3 entangling layers, Statevector-trained ridge readout on the TL residual) drops into the existing interface, and the signal and map views show quantum-cleaned results next to TL and KRR on the same held-out data and features
  2. Pressing Run on Qollab with IonQ Forte 1 (remote simulator) selected completes without errors using exactly one batched `backend.run` read via `get_counts()` (a test asserts one call), and on the built-in browser simulator the app degrades gracefully with a notice
  3. The identity/random feature-map ablation and the kernel-concentration/feature-histogram check are recorded, so it is visible whether the circuit adds anything
  4. A hardware job (500+ shots) is submitted as soon as the circuit is frozen; `data/forte_hardware_run.json` holds counts, backend name, shots and timestamp, or the `forte-1` noise-model result is used and labeled as a proxy
  5. The metrics panel shows the benchmark table and provenance badges: "computed in-page" vs "precomputed replay", IonQ backend/shots/timestamp for the quantum leg, and the hardware-result label

**Plans**: 3 plans
Plans:
**Wave 1**

- [ ] 04-01-PLAN.md — Frozen feature-map circuit, Statevector + numpy engines, shot-aware ridge, identity/random ablations, diagnostics, data/quantum_model.json, pipeline/artifact/main.py/live integration, quantum rows + label renames in the UI

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 04-02-PLAN.md — api.quantum_verify single bare-circuit job + one-job guard, quantum_recorded, VerifyPanel/badges (UI-04), bundle + zip, Qollab check (upload only, built-in K=4, Forte 1 sim ladder)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 04-03-PLAN.md — Builder-approved IonQ Forte 1 hardware Run (human-action), data/forte_hardware_run.json (hardware or labeled proxy), ladder constants, honest README method notes
**UI hint**: yes

### Phase 5: Benchmarks, Accessibility and Polish

**Goal**: A technical judge can trust the comparison, because the results are multi-segment on real held-out lines, include the losing cases, regenerate from one command, and the UI passes an accessibility audit; feature freeze happens at the end of this phase
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: METR-02, METR-03, METR-04, METR-05, METR-06, UI-06, A11Y-03
**Budget**: ~3 hours (H26-H29 working); feature freeze at about T-8h
**Success Criteria** (what must be TRUE):

  1. The benchmark table reports mean ± std over 5-10 segments of held-out lines 1003.02 and 1007.06 per denoiser, with a negative-results section stating plainly where quantum ties or loses and why
  2. The nT-to-metres curve, the training-size sweep (20/50/100/200 windows from 1006.08) and the cabin-sensor sweep (Mag 3 vs 4 vs 5) figures exist and show where each denoiser sits and whether any regime favors quantum
  3. One command regenerates `results/metrics.json`, CSVs and every figure from the committed `data/` excerpts
  4. A dual-drone view shows raw and quantum-cleaned estimators flying the same path side by side
  5. An axe or Lighthouse check and a keyboard walkthrough of the full demo pass with no blocking issues

**Plans**: TBD (target 2: multi-segment benchmarks + training-size and cabin-sensor sweeps + repro kit; dual-drone view + a11y audit)
**UI hint**: yes

### Phase 6: Docs, Publish and Submission

**Goal**: The project is submitted, published under MIT on Qollab.xyz, runs start to finish for a logged-out judge, and the README lets anyone understand, run, replicate and extend it, with about 3 hours of buffer left before 4:00 PM PDT
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Budget**: ~4 hours of work, plus ~3 hours of buffer before the deadline that no feature work may use
**Success Criteria** (what must be TRUE):

  1. A newcomer following the README can run the project locally and on Qollab (select IonQ Forte 1 remote simulator, Chrome recommended) and knows how to replicate or extend it
  2. The README has a per-criterion summary (novelty, technical execution, impact, documentation), the honest AQNav framing (their quantum part is the sensor, ours is the compute), a real-data provenance statement (SGL 2020 flights, MagNav.jl maps, only cropped excerpts redistributed), and an explicit no-advantage claim
  3. The README includes the real-practice mapping table, a circuit figure with a 3-sentence encoding explanation, and a limitations/future-work section
  4. The published Qollab project carries the theme tag, repo link and demo video (recorded from the precomputed path), and a logged-out browser runs it start to finish before the deadline
  5. The README carries the USAF citation ("... provided by the United States Air Force pursuant to Cooperative Agreement Number FA8750-19-2-1000 - [dates used]"), the Gnadt et al. arXiv:2007.12158 BibTeX, MagNav.jl map attribution, and the EMAG2v3 DOI if EMAG2 was used

**Plans**: TBD (target 2: README write-up; publish + video + logged-out test + compliance audit)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold, Compliance and Qollab Smoke Test | 0/3 | Planned | - |
| 2. Real Flight Data and Classical Pipeline | 0/TBD | Not started | - |
| 3. Frontend Vertical Slice | 0/TBD | Not started | - |
| 4. Quantum Denoiser and IonQ Runs | 0/TBD | Not started | - |
| 5. Benchmarks, Accessibility and Polish | 0/TBD | Not started | - |
| 6. Docs, Publish and Submission | 0/TBD | Not started | - |

---
*Roadmap created: 2026-10-09*
*Updated: 2026-10-10 — synthetic world replaced with SGL 2020 flight data and Ottawa maps*

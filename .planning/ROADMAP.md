# Roadmap: Magnetic Field Detector (Quantum MagNav)

## Overview

A solo, ~40-hour build (Oct 9, 2026 ~11 PM PDT to the Oct 11, 2026 4:00 PM PDT / 7:00 PM ET deadline) that goes from an empty repo to a published Qollab.xyz project. The order is vertical slice first. Phase 1 proves the Qollab runtime and locks compliance. Phase 2 builds the synthetic world, the classical baselines, particle-filter navigation and metrics, which give a valid result even if quantum fails. Phase 3 puts that result in front of a judge as an accessible React player with a precomputed fallback. Only then does Phase 4 replace the quantum stub with the real Qiskit feature-map denoiser, its single IonQ Forte 1 job and the early hardware capture. Phase 5 turns the working demo into honest multi-seed evidence, and Phase 6 ships the docs and submission while protecting about 3 hours of buffer.

The research SUMMARY proposed 7 phases. Under the "coarse" granularity setting, its Phase 4 (quantum, local) and Phase 5 (IonQ run and hardware capture) are merged into one quantum phase, because the hardware job must be submitted the moment the circuit is final. That gives 6 phases, each a clean vertical increment.

**Time budget** (working hours; done-by times in PDT are targets that assume about 5 hours of sleep on night 1 and none on night 2):

| Phase | Budget | Target done by |
|-------|--------|----------------|
| 1. Scaffold, Compliance and Qollab Smoke Test | ~3 h | Fri Oct 10, 2 AM |
| 2. Synthetic World and Classical Pipeline | ~8 h | Fri Oct 10, 3 PM |
| 3. Frontend Vertical Slice | ~5 h | Fri Oct 10, 8 PM |
| 4. Quantum Denoiser and IonQ Runs | ~9 h | Sat Oct 11, 5 AM |
| 5. Benchmarks, Accessibility and Polish | ~3 h | Sat Oct 11, 8 AM |
| 6. Docs, Publish and Submission | ~4 h + ~3 h buffer | Docs done Sat 12-1 PM; buffer until 4 PM PDT |

**Cut order if behind:** hardware result (fall back to the labeled `forte-1` noise-model proxy), then the dual-drone view and the sweeps, then simplify navigation to windowed correlation. **Never cut:** the classical baseline, the IonQ Forte 1 simulator run, README, LICENSE and attribution, the precomputed fallback.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scaffold, Compliance and Qollab Smoke Test** - Prove the Qollab runtime end to end and commit every compliance artifact (~3 h)
- [ ] **Phase 2: Synthetic World and Classical Pipeline** - Seeded map, flight and noise, classical denoisers, particle-filter nav, metrics and the precomputed artifact (~8 h)
- [ ] **Phase 3: Frontend Vertical Slice** - Accessible React player showing the drone hold position after GPS jamming, with in-page compute and precomputed fallback (~5 h)
- [ ] **Phase 4: Quantum Denoiser and IonQ Runs** - Replace the quantum stub with the feature-map denoiser, one batched IonQ Forte 1 job, and the early hardware capture (~9 h)
- [ ] **Phase 5: Benchmarks, Accessibility and Polish** - Multi-seed benchmark evidence, sweeps, reproducibility kit, dual-drone view, accessibility audit (~3 h)
- [ ] **Phase 6: Docs, Publish and Submission** - README, published Qollab project, demo video, logged-out verification, with ~3 h buffer (~4 h + buffer)

## Phase Details

### Phase 1: Scaffold, Compliance and Qollab Smoke Test

**Goal**: The builder knows, within the first hours, that a Vite-bundled React page can call in-page Python and run one batched IonQ Forte 1 job on Qollab, and the repo already satisfies every licensing and disclosure rule
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

- [ ] 01-01-PLAN.md — uv/Python 3.13 pinned env, compliance set (LICENSE, README attribution/theme/disclosure), magnav.api one-job Bell API + main.py fallback

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02-PLAN.md — Vite lib-mode toolchain, magnav.api bridge and React smoke page bundled to root main.js/main.css, Qollab contract test

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Packaging zips, findings template with prepared repo commands, human Qollab checkpoint (public repo, IonQ Forte 1 run, 32/64/128 probe, publish, logged-out, credits)

### Phase 2: Synthetic World and Classical Pipeline

**Goal**: Running one command simulates a GPS-jammed drone flight over a synthetic anomaly map and shows, with numbers, that raw-signal navigation drifts while classically cleaned navigation holds position; this is the valid-even-if-quantum-fails floor
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: SIM-01, SIM-02, SIM-03, SIM-04, SIM-05, BASE-01, BASE-02, BASE-03, BASE-04, NAV-01, NAV-02, NAV-03, METR-01
**Budget**: ~8 hours (H3-H12 working)
**Success Criteria** (what must be TRUE):

  1. `python main.py --seed N` generates a seeded anomaly map and 10 Hz flight, injects the separately adjustable noise terms (TL attitude, motor/ESC tones, current offset, white, drift), and saves figures of map, paths and traces; the same seed gives identical output
  2. After the "GPS jammed at t=X" event, the printed metrics show the raw-signal and dead-reckoning tracks drifting while the TL-cleaned track stays within the RNP-style threshold, in a regime picked by the recorded map-roughness vs noise sweep
  3. A metrics table reports signal RMSE/std (nT), mean/final position error (m), CEP50/CEP95 and % time under threshold for raw, low-pass, TL, classical KRR and the quantum slot (a stub with the final denoiser interface), all evaluated on a held-out flight/seed disjoint from calibration
  4. Estimator and denoiser functions cannot receive the `Truth` object (enforced by signature and a grep/test check); only metrics touch truth
  5. `data/precomputed_run.json` (versioned `RunArtifact`, columnar, under 2 MB) is written from the same run

**Plans**: TBD (target 3: sim + Truth/Sensors split; classical denoisers; particle filter + metrics + artifact + sweep)

### Phase 3: Frontend Vertical Slice

**Goal**: A judge opening the Qollab project sees the drone icon hold its position after GPS is jammed, with the denoising evidence beside it, and the demo never breaks because a failed live run falls back to the precomputed replay
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-05, A11Y-01, A11Y-02
**Budget**: ~5 hours (H12-H17 working)
**Success Criteria** (what must be TRUE):

  1. On Qollab, the map view plays the flight over the anomaly heatmap with true (solid), estimated (dashed) and dead-reckoning paths, the drone icon, the GPS-jammed marker, a downsampled particle cloud and a live position-error readout
  2. The signal panel shows truth, raw, TL, classical KRR and quantum-slot traces with toggles, an RMSE badge per series, and a residual subplot
  3. "Live" mode computes a fresh flight in-page for a chosen seed and animates it; forcing a compute failure switches automatically to `data/precomputed_run.json` with identical visuals and a visible "precomputed replay" badge
  4. A keyboard-only user can operate every control with visible focus, status changes are announced via aria-live, and screen-reader labels exist on charts and toggles
  5. With colour removed, series are still distinguishable by dash pattern; with `prefers-reduced-motion` on, animation becomes stepped; each chart has a text or table alternative

**Plans**: TBD (target 2: artifact player + map view + bridge/fallback; signal panel + a11y baseline)
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

**Plans**: TBD (target 3: circuit + Statevector training + readout + ablation; single-job IonQ inference + Qollab run; hardware submission + provenance UI)
**UI hint**: yes

### Phase 5: Benchmarks, Accessibility and Polish

**Goal**: A technical judge can trust the comparison, because the results are multi-seed, include the losing cases, regenerate from one command, and the UI passes an accessibility audit; feature freeze happens at the end of this phase
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: METR-02, METR-03, METR-04, METR-05, UI-06, A11Y-03
**Budget**: ~3 hours (H26-H29 working); feature freeze at about T-8h
**Success Criteria** (what must be TRUE):

  1. The benchmark table reports 5-10 seed mean ± std per denoiser, with a negative-results section stating plainly where quantum ties or loses and why
  2. The nT-to-metres curve and the training-size sweep (20/50/100/200) figures exist and show where each denoiser sits and whether any regime favors quantum
  3. One command regenerates `results/metrics.json`, CSVs and every figure from fixed seeds
  4. A dual-drone view shows raw and quantum-cleaned estimators flying the same path side by side
  5. An axe or Lighthouse check and a keyboard walkthrough of the full demo pass with no blocking issues

**Plans**: TBD (target 2: multi-seed benchmarks + sweeps + repro kit; dual-drone view + a11y audit)
**UI hint**: yes

### Phase 6: Docs, Publish and Submission

**Goal**: The project is submitted, published under MIT on Qollab.xyz, runs start to finish for a logged-out judge, and the README lets anyone understand, run, replicate and extend it, with about 3 hours of buffer left before 4:00 PM PDT
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Budget**: ~4 hours of work, plus ~3 hours of buffer before the deadline that no feature work may use
**Success Criteria** (what must be TRUE):

  1. A newcomer following the README can run the project locally and on Qollab (select IonQ Forte 1 remote simulator, Chrome recommended) and knows how to replicate or extend it
  2. The README has a per-criterion summary (novelty, technical execution, impact, documentation), the honest AQNav framing (their quantum part is the sensor, ours is the compute), a synthetic-data statement, and an explicit no-advantage claim
  3. The README includes the real-practice mapping table, a circuit figure with a 3-sentence encoding explanation, and a limitations/future-work section
  4. The published Qollab project carries the theme tag, repo link and demo video (recorded from the precomputed path), and a logged-out browser runs it start to finish before the deadline

**Plans**: TBD (target 2: README write-up; publish + video + logged-out test + compliance audit)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold, Compliance and Qollab Smoke Test | 0/3 | Planned | - |
| 2. Synthetic World and Classical Pipeline | 0/TBD | Not started | - |
| 3. Frontend Vertical Slice | 0/TBD | Not started | - |
| 4. Quantum Denoiser and IonQ Runs | 0/TBD | Not started | - |
| 5. Benchmarks, Accessibility and Polish | 0/TBD | Not started | - |
| 6. Docs, Publish and Submission | 0/TBD | Not started | - |

---
*Roadmap created: 2026-10-09*

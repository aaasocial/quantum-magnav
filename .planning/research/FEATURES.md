# Feature Research

**Domain:** Hybrid quantum/classical magnetic anomaly navigation (MagNav) demo: synthetic map, simulated drone, quantum-assisted denoising, classical map matching. Built for the Qollab x IonQ Hackathon, Quantum Impact theme.
**Researched:** 2026-10-09
**Confidence:** MEDIUM overall. Real-practice items checked against MagNav.jl docs and the MagNav Challenge paper are HIGH. Quantum-approach feasibility ratings come from engineering judgment plus training knowledge (MEDIUM). Judging-reward items are inferred from the rubric in PROJECT.md (MEDIUM).

---

## 0. Reference Point: What Real MagNav Practice Includes

Use this table to decide what the demo should copy. A row marked "Mirror" is cheap and makes the demo look like real practice.

| Element | MagNav Challenge dataset (MIT / USAF, SGL 2020) | MagNav.jl | SandboxAQ AQNav (public info only) | Demo decision |
|---|---|---|---|---|
| Platform | Cessna Grand Caravan, flown near Ottawa (Renfrew, Eastern Ontario, FOM area), 400–800 m AGL | Loads that data; can also simulate flights | Standard aircraft; 150+ flight-hours across the continental US (Acubed, July 2025) | Drone at a fixed low altitude. Say in the docs that real systems fly fixed-wing at 400–800 m |
| Sensors | 5 cesium scalar mags (Mag 1 on tail stinger = clean reference, Mags 2–5 in the cabin = noisy). 4 fluxgate vector mags (Flux A–D). INS. 14 current sensors (`cur_strb`, `cur_acpwr`, `cur_heat`, `cur_bat_1`, `cur_srvo_*`, ...) | Same fields | Quantum (optically pumped / atomic) magnetometers | **Mirror:** simulate 1 scalar mag, 1 vector mag (attitude/direction cosines), and 2–4 "current sensor" channels (motor current, ESC PWM). These are the regressors the denoiser uses |
| Sample rate | 10 Hz (MagNav.jl TL defaults use `fs = 10.0`) | Same | Not disclosed | **Mirror:** 10 Hz |
| Truth signal | `mag_1_c`: professionally compensated tail-stinger mag | Same | Not disclosed | **Mirror:** the "clean" synthetic trace plays the role of `mag_1_c` |
| Compensation baseline | Tolles-Lawson: permanent + induced + eddy terms, bandpass 0.1–0.9 Hz before fitting | `create_TL_A`, `create_TL_coef` (defaults: permanent, induced, eddy; optional bias). Linear models (`LinCompParams`) and NN models (m1, m2a–d, m3 family, physics-informed) via `comp_train` / `comp_test` | "Large Quantitative Models" (AI) strip platform interference. Architecture not public | **Mirror:** TL regression is the first classical baseline. A small MLP using TL features + currents is the second |
| Compensation metric | Std dev of error vs truth, per flight line, in nT | Same | Not disclosed | **Mirror:** report nT RMSE and std per segment |
| Navigation filter | n/a (the challenge is compensation only) | `run_filt` with `:ekf` or `:mpf` (marginalized particle filter); `:ekf_online_nn`; Pinson 17-state INS error model + FOGM state; `crlb` | Map matching against the North American Magnetic Anomaly Map; beat GNSS-denied INS on 100% of 2h+ flights; best <74 m on one flight; RNP 0.3 met 64% of the time | **Simplify:** 2D particle filter over (x, y) using velocity/heading dead-reckoning plus map likelihood. Skip the Pinson INS model |
| Map | Ottawa-area survey maps (MagNav.jl artifact), Perth mini-survey at 800 m | `itp_mapS` interpolation, `der_mapS` vertical derivative, upward continuation | NAMAM (public) | Synthetic GRF map with bilinear interpolation. Optional "EMAG2 / NAMAM" mode is an anti-feature for 40 h |
| Nav metrics | n/a | CRLB, position error vs time (DRMS-style) | Position error in m, % of time meeting RNP 0.3 / 1 / 2 | **Mirror:** position error vs time, final error, CEP50/CEP95, and a "% time under X m" column (RNP-style) |

**Key takeaway for the roadmap:** in real practice the hard ML problem is *platform-noise compensation* (MagNav Challenge). Map matching uses classical filters (EKF / particle filter). This matches the project's planned split exactly (quantum = denoising, classical = navigation). That split is defensible. Cite it.

---

## Feature Landscape

### Table Stakes (judges dismiss the project without these)

| # | Feature | Why Expected | Complexity / Time | Notes |
|---|---------|--------------|-------------------|-------|
| T1 | **Synthetic anomaly map, realistic scale** | Without plausible nT values and spatial correlation the "navigation" result is meaningless | LOW, 1–2 h | Gaussian random field built by spectral synthesis: white noise → FFT → multiply by a power-law spectrum `P(k) ∝ k^-β` (β ≈ 2.5–3.5) → optionally apply upward continuation `exp(-|k|·h)` → IFFT. Scale to roughly ±100–500 nT anomaly amplitude and a few nT to tens of nT/km gradients at survey altitude. Add 2–5 Gaussian "dipole blobs" (intrusions, 200–1000 nT peaks) so the map has recognizable features. GRF + upward continuation beats Perlin noise because it has the physical spectrum shape and the smoothing-with-altitude story. Seed everything |
| T2 | **Flight path + true magnetometer trace** | Core of the demo | LOW, 1–2 h | Waypoint or lawnmower-plus-turns path, constant speed (10–20 m/s for a drone), 10 Hz. True trace = bilinear interpolation of the map + a constant IGRF core-field offset (about 50,000 nT, removed later) |
| T3 | **Self-noise model with physically motivated terms** | "Denoising" needs a credible noise source. Judges with domain knowledge will look for Tolles-Lawson | MEDIUM, 2–3 h | Sum of: (a) TL-style terms from attitude, meaning direction cosines × permanent/induced/eddy coefficients (eddy uses the derivative of the direction cosines). Generate heading/pitch/roll manoeuvres so these terms are excited. (b) Motor/ESC interference: sinusoids at RPM-linked frequency. Note that at 10 Hz the true ESC frequencies (hundreds of Hz to kHz) alias, so model them as aliased low-frequency tones plus amplitude modulation by throttle. (c) Current-dependent offset `k·I_motor(t)`, with throttle correlated to climbs and turns. (d) White sensor noise (0.1–1 nT) plus slow drift (FOGM / random walk). Expose per-term amplitudes so ablations are possible. Keep total noise at about 10–100× the sensor floor (tens of nT), comparable to cabin mags in the challenge data |
| T4 | **Classical baseline #1: Tolles-Lawson regression** | Mandatory for the theme. This is what the field actually uses | LOW, 1–2 h | Build the 18-ish term A-matrix (3 permanent + 6 induced + 9 eddy) from the simulated vector mag, bandpass 0.1–0.9 Hz, ridge least squares. NumPy only. Add current channels as extra columns ("TL + currents"), which is a known real-practice extension |
| T5 | **Classical baseline #2: small MLP or ridge on the same features** | The quantum model must be compared with an *equal-feature* classical learner, or the comparison is unfair | LOW, 1 h | scikit-learn `MLPRegressor` / `KernelRidge(RBF)` using exactly the features the quantum model gets. **Classical RBF kernel ridge is the most important comparison partner for a quantum kernel model.** Also report a plain low-pass filter as a "naive" floor |
| T6 | **Quantum denoiser (Qiskit) on simulator** | Submission requirement. The novelty hook | MEDIUM–HIGH, 6–10 h | See Section 2. Recommended: quantum kernel ridge regression on residuals after TL, 4–8 features, 4–8 qubits. It runs on the IonQ simulator via Qollab without errors |
| T7 | **Map-matching navigation** | "Holds position without GPS" is the Core Value | MEDIUM, 3–4 h | 2D particle filter, 500–2000 particles. Motion model: noisy velocity/heading (simulated INS drift). Measurement likelihood: Gaussian on (cleaned mag − map(x,y)), with σ set to the denoiser's residual std. Resample with systematic resampling. Run it once per denoiser output (raw / TL / MLP / quantum) on identical seeds |
| T8 | **Metrics table: signal RMSE + position error** | Theme text requires showing *where* quantum improves quality | LOW, 1–2 h | Per denoiser: signal RMSE (nT), signal error std (challenge metric), final position error (m), mean position error, CEP50, CEP95. Fixed seed. Repeat over N=5–10 seeds and report mean ± std |
| T9 | **Map view: true vs estimated path, drone icon, GPS-jammed state, error readout** | The visual that sells Impact | MEDIUM, 3–4 h | Map heatmap (canvas/PNG from backend) + SVG polylines. A "GPS jammed at t=X" marker after which estimation is mag-only. Live error numbers. Particle cloud overlay is cheap once the PF exists and is very persuasive |
| T10 | **Signal panel: raw vs classical vs quantum vs truth** | Sells the quantum contribution | LOW–MEDIUM, 2 h | Overlaid time-series (Recharts / uPlot) with toggleable series and an RMSE badge per series. Include a residual subplot (signal − truth), because errors are invisible at the 50,000 nT scale |
| T11 | **Precomputed replay fallback** | Explicit project constraint. Demos fail live | LOW, 1–2 h | Backend dumps a run to JSON; frontend can play from a static file with no backend. This also makes the Qollab.xyz deploy robust |
| T12 | **README with per-criterion summary, how-to-run, how-to-extend, attribution, AI/library disclosure** | Submission checklist. Documentation is 25% of score | MEDIUM, 3–4 h total | One command to reproduce (`make demo` or `python -m magnav.run --seed 0`). Pin requirements. Explain the honest framing: AQNav's quantum part is the sensor, ours is the compute |
| T13 | **Accessibility basics** | Explicit submission requirement | LOW, 1–2 h | Keyboard-operable controls, aria-labels on charts and toggles, a colour-blind-safe palette (true = solid, estimated = dashed, so meaning is not carried by colour alone), `prefers-reduced-motion` turns animation into stepped updates, and a text/table alternative for each chart |
| T14 | **Captured IonQ hardware result** | Listed as Active requirement | LOW code, HIGH schedule risk | One kernel-matrix block or a handful of predictions run on QPU. Show it next to the simulator values, with shot count and date. Submit the job early (Day 2 morning), because queue times are unknown |

### Differentiators (target Quantum Impact theme, Most Novel, Best Documentation)

| # | Feature | Value Proposition | Complexity / Time | Notes |
|---|---------|-------------------|-------------------|-------|
| D1 | **Honest benchmark table with a negative-result section** | The theme says "show where quantum improves". Judges reward credibility. Most hackathon QML projects overclaim | LOW, 1 h | Columns: model, #params, #qubits, train size, signal RMSE, position CEP50, train time, inference time. A row for classical RBF-KRR next to quantum KRR. If quantum ties or loses, say so and analyze why (expressivity, kernel concentration, shot noise). This is likely the single highest-ROI item for Best Documentation |
| D2 | **Regime analysis: where quantum helps** | Turns "quantum ≈ classical" into a finding. Directly answers the theme text | MEDIUM, 2–3 h | Sweep training-set size (e.g. 20, 50, 100, 200 samples) and noise level. Quantum kernels sometimes do relatively better at very small training sets. Plot RMSE vs N for quantum vs classical. Small-data compensation is realistic: a calibration flight is short |
| D3 | **Shot-noise / hardware-noise robustness study** | A "technical extension (noise/error mitigation, benchmarking)" is an explicit novelty path in the rules | MEDIUM, 2 h | Same quantum model at shots ∈ {∞ (statevector), 1024, 256} and with the IonQ noise model or the hardware point. Shows the error budget. Optionally add simple mitigation (kernel matrix PSD projection, diagonal renormalization), which is cheap and legitimate |
| D4 | **Downstream impact chain: nT → metres** | Shows *why* a few nT matter: the denoiser's gain carries through to navigation error | LOW once T7/T8 exist, 1 h | Plot position error vs injected signal RMSE (sweep σ). Place each denoiser on that curve. Very persuasive for Impact |
| D5 | **Ablation of noise sources** | Shows which interference terms each model handles | LOW, 1 h | Toggle TL-attitude / motor / current / white terms. Table of RMSE per model per noise source |
| D6 | **Particle cloud + uncertainty ellipse in UI** | Makes the filter legible, so judges *see* the drone get lost when raw noise is used | LOW after T7, 1 h | Send a downsampled set of particles (e.g. 200) per frame |
| D7 | **Side-by-side "raw vs quantum-cleaned" dual-drone race** | One glance tells the story: one drone drifts, one holds | LOW–MEDIUM, 1–2 h | Run two PFs on the same path and draw both estimated tracks on the same map |
| D8 | **Circuit explainer panel / docs figure** | Makes the quantum part understandable for documentation judges | LOW, 1 h | Render the feature-map circuit (`qc.draw('mpl')`) as a PNG. Explain the encoding of each feature in 3 sentences |
| D9 | **Reproducibility kit** | Best Documentation | LOW, 1–2 h | Fixed seeds, `results/` committed JSON + CSV, a script to regenerate every figure, versions pinned, a notebook that walks the pipeline. Mention test-from-logged-out browser |
| D10 | **Real-practice mapping section in the docs** | Credibility; shows research depth | LOW, 30 min | Section 0's table in the README: what we simulate vs what the MagNav Challenge / MagNav.jl / AQNav use |

### Anti-Features (do NOT build in 40 hours)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real EMAG2 / NAMAM map ingestion | Realism | GeoTIFF/grid wrangling, projections, and resolution mismatch eat 3–6 h. Adds no quantum value | GRF map with a physical spectrum. Cite EMAG2 in the docs as future work. Pick an nT scale that matches it |
| Using the real MagNav Challenge HDF5 data | Realism and "real data" points | Julia-centric tooling, large files, 18+ features, hours of plumbing. A quantum model on ≤24 qubits will not beat the published NN results on it | Mirror its *structure* (Section 0) in simulation. List it as the "next step" |
| Full Pinson 17-state INS error model / EKF with TL states | Matches MagNav.jl | Days of work. Judges cannot see the difference in a demo | 2D PF with a simple velocity-noise dead-reckoning model |
| Quantum sensor physics (NV centers, spin dynamics) | "Quantum magnetometer" story | Already out of scope in PROJECT.md. A different project | One paragraph explaining AQNav's sensor vs our compute |
| Quantum map matching (Grover search over map cells, QAOA position estimation) | Sounds "more quantum" | No advantage at demo scale. Oracle construction is hard. Grover on 24 qubits on a simulator is slow and trivially beaten by NumPy argmin. Judges with QC knowledge will see through it | Keep navigation classical. Say so explicitly, in line with the theme ("quantum subroutine where it might help") |
| Deep VQC with many layers / >12 qubits trained by gradient on the simulator | Bigger feels better | Barren plateaus, and parameter-shift gradients cost 2×params circuits per step. The shared IonQ simulator queue makes training impossibly slow | Train locally with Aer statevector. Send only *inference* or *kernel evaluation* to IonQ. Keep ≤8 qubits |
| Training on the IonQ simulator or QPU | "Runs on IonQ" | Thousands of circuit calls, queue time, and the shared quota | Train on Aer. Verify/evaluate on IonQ simulator. One small QPU job |
| WebSocket streaming with complex backpressure / multi-client sync | "Live" feel | Single-user demo. Brittle | SSE or polling at 10–20 fps from a precomputed or quickly computed array, the same code path as replay |
| 3D globe / Mapbox / Cesium map | Wow factor | API keys, licensing, heavy deps, accessibility headaches, deploy friction on Qollab.xyz | 2D canvas heatmap + SVG paths in local metres |
| Auth, persistence, run history DB | Polish | Zero judging value | Static JSON results |
| Real-time IonQ calls during the judged demo | "Live quantum" | Queue/latency. Explicitly out of scope | Show cached quantum outputs labelled "IonQ simulator, run at <timestamp>" |
| Claiming quantum advantage | Tempting headline | False at this scale. It costs credibility with every technical judge | Claim "competitive with an equal-feature classical baseline in regime X". Report where it loses |

---

## 2. Quantum Denoising Options: Feasibility at ≤24 Qubits and 40 Hours

The quantum model should predict the **residual interference** (raw − truth, or raw − TL-compensated) from a small feature vector, for example: 3 direction cosines, 1–2 of their derivatives, motor current, and throttle. Then subtract the prediction. Cast this way, it is a small tabular regression problem, which fits NISQ-scale models. Do NOT feed raw time-series windows of 100+ samples into a circuit.

| Approach | Qubits needed | Fits 24 qubits? | Build time | Run cost on IonQ sim | Likely quality vs classical | Explainability | Verdict |
|---|---|---|---|---|---|---|---|
| **Quantum Kernel Ridge Regression (QKRR) / QSVR** with a ZZ- or IQP-style feature map (`FidelityQuantumKernel` or hand-rolled compute-uncompute) | = #features (4–8) | Yes, easily | 4–6 h | Kernel needs N_train² / 2 circuits for training + N_test × N_train for prediction. With N_train = 50–100 that is about 1–5k circuits: fine on Aer, borderline on the shared IonQ sim. Use a small subset or batch submissions | Comparable to RBF-KRR at best. Small-data regime is the one place it can be competitive | High: "kernel = state overlap". Easy to chart and explain | **RECOMMENDED (primary).** Training is deterministic (closed-form ridge, no optimizer loop), which is the lowest-risk option. A direct apples-to-apples comparison with classical KRR. Tune the kernel bandwidth/feature scaling to avoid exponential concentration (all off-diagonals ≈ 0) |
| **Variational Quantum Regressor (VQR)** (angle encoding + hardware-efficient ansatz, ⟨Z⟩ readout, COBYLA/SPSA) | 4–8 | Yes | 4–8 h (tuning heavy) | Inference cheap (1 circuit per sample). Training costly; do it on Aer only | Usually below MLP. Optimizer noise and barren plateaus | Medium | **Secondary / stretch.** Good if you want "trained parameters"; risky to get it to converge in time. Use data re-uploading with 2–3 layers if attempted |
| **Quantum Reservoir Computing (QRC)** (fixed random circuit, time-series input injected sequentially, measure Pauli expectations, train classical linear readout) | 6–12 | Yes | 5–8 h | Moderate: one circuit per time step per window. With a sliding-window formulation, cost scales with sequence length | Plausible for the temporal (motor/eddy) components. Literature results are mostly toy tasks | Medium: "quantum feature expansion + linear readout" | **Novelty pick, MEDIUM risk.** Training is linear (cheap, robust), and it handles temporal structure naturally. Fallback: the "quantum extreme learning machine" variant (no memory, single-shot random circuit feature map + ridge), which is about 3 h and nearly as novel |
| **Quantum Extreme Learning Machine (QELM)** (random fixed circuit as a feature map, measure many observables, ridge readout) | 4–10 | Yes | 2–4 h | Low: N_samples circuits total (not N²) | Similar to a random-features model | Medium | **Strong fallback.** Cheapest quantum option with linear-cost evaluation. Good for the IonQ sim quota and the hardware run |
| **QAOA-flavoured feature selection** (choose k of ~18–24 TL + current features as QUBO: relevance − redundancy, mutual-information style) | = #candidate features (18–24) | Yes, at the limit. 24 qubits matches the 18 TL terms + 4–6 currents nicely | 4–6 h | p=1–2 QAOA: optimizer loop on Aer is fine. Statevector at 24 qubits is slow (~256 MB per state, every evaluation). Use MPS or sampling | The selected subset feeds a classical TL/ridge model. Gain is likely ≈ brute-force/greedy selection. Classically solvable exactly at this size | High narrative value: "QUBO over TL terms" is a novel domain mapping | **Differentiator / stretch only.** It uses the 24-qubit device size meaningfully, which is attractive for the hardware run. Must be benchmarked against greedy/brute-force selection to be honest. Not a denoiser by itself |
| Quantum Boltzmann machines, QGANs, quantum autoencoders for signal denoising | 8–20 | Technically | 10+ h | High | Poor at this scale | Low | **Reject.** Too slow to train, hard to make work in 40 h |
| Quantum Fourier Transform-based filtering | log₂(N) | Yes | 4–6 h | Needs amplitude encoding, which costs exponential state preparation | No advantage; readout destroys it | Low | **Reject.** A classic overclaim pattern. Judges know QFT cannot replace an FFT here |

**Recommended stack:** QKRR as the primary quantum denoiser (T6). Run it on residuals after TL (a "TL + quantum residual correction" hybrid), so the quantum part does a bounded, explainable job. QELM is the fallback if kernel cost or concentration bites. QAOA feature selection (D11 below) is the optional 24-qubit hardware showcase.

| # | Extra differentiator | Value | Complexity | Notes |
|---|---|---|---|---|
| D11 | QAOA TL-term feature selection on ~20–24 qubits | Uses the full device width. Novel mapping | HIGH (4–6 h) | Only after T1–T14 work. Compare with greedy selection |
| D12 | Hybrid residual architecture: TL (classical physics) → quantum residual model | Mirrors MagNav.jl's physics-informed "TL + NN" models (the m2/m3 family) with the NN replaced by a quantum model. Strong novelty argument with real-practice grounding | LOW extra once T4 + T6 exist | **Strongly recommended**: this is the framing |

---

## Feature Dependencies

```
T1 Map ──> T2 Flight + true trace ──> T3 Self-noise (raw trace)
                                          │
              ┌───────────────────────────┼─────────────────────────┐
              v                           v                         v
        T4 TL baseline ──────────> T5 Classical ML  ──────>  T6 Quantum denoiser
              │   (TL residuals feed both)       (same features)    │
              └──────────────> D12 Hybrid residual <────────────────┘
                                          │
                                          v
                           T7 Particle-filter map matching
                                          │
                                          v
                           T8 Metrics (signal + position)
                              │           │           │
                              v           v           v
                     T11 JSON replay   D1/D2/D4 benchmarks   T14 hardware point
                              │
              ┌───────────────┼──────────────┐
              v               v              v
          T9 Map view   T10 Signal panel   D6/D7 particle cloud, dual drone
              └──────> T13 Accessibility (applies to all UI)
                              │
                              v
               T12 README + per-criterion summary + video
```

### Dependency Notes

- **T3 requires the vector-mag and attitude simulation in T2:** TL terms need direction cosines and their derivatives. The flight must include manoeuvres (turns, pitch/roll variation), or TL is unidentifiable and every model looks the same.
- **T5 and T6 must share an identical feature set and train/test split:** otherwise the comparison is invalid and D1 is meaningless.
- **T7 requires a per-denoiser noise σ:** feed the measured residual std into the PF likelihood, so the better denoiser yields a tighter likelihood. That is the mechanism linking nT to metres (D4).
- **T9/T10 depend on T11's JSON schema, not on the live backend:** define the run-JSON schema early (Phase 1–2). The frontend can then be built against a static file in parallel with backend work, even when working solo.
- **T14 depends on T6 being finalized:** the hardware job must use the final circuit. Submit early because of queue risk.
- **D2/D3 enhance T8:** they reuse the same pipeline with sweeps, so they only cost time once the pipeline is scripted.
- **D11 conflicts with schedule, not code:** 24-qubit statevector simulation is slow. Do not start it before the end-to-end vertical slice works.
- **Live mode conflicts with deploy simplicity on Qollab.xyz:** if Qollab.xyz hosting cannot run a Python backend, replay mode (T11) *is* the deployed demo. Verify hosting constraints early (open question).

---

## MVP Definition

### Launch With (v1): the vertical slice, aim for hour ~16

- [ ] T1 GRF map (±hundreds of nT, upward continued, seeded)
- [ ] T2 lawnmower + turns flight at 10 Hz with attitude
- [ ] T3 noise: TL attitude terms + motor current offset + aliased motor tone + white noise
- [ ] T4 TL ridge regression baseline
- [ ] T6 QKRR on Aer (4–6 qubits), residual-after-TL formulation (D12)
- [ ] T5 classical RBF-KRR on identical features
- [ ] T7 2D particle filter
- [ ] T8 metrics table (single seed)
- [ ] T11 JSON run export + T9/T10 minimal UI reading the JSON

### Add After the Slice Works (hours 16–32)

- [ ] T6 running on the IonQ simulator via Qollab (required for submission)
- [ ] T14 one hardware job (submit as early as possible)
- [ ] T8 multi-seed mean ± std; D1 honest benchmark table
- [ ] D4 nT → metres curve; D2 train-size sweep
- [ ] D6 particle cloud, D7 dual-drone race
- [ ] T13 accessibility pass
- [ ] Live mode (SSE from backend), using the same frame schema as replay

### Final Hours (32–40): documentation and submission

- [ ] T12 README, per-criterion summary, disclosure, attribution, MIT license
- [ ] D8 circuit figure, D9 reproducibility kit, D10 real-practice table
- [ ] Demo video; logged-out test on Qollab.xyz

### Future Consideration (write as "Extending this project")

- [ ] EMAG2/NAMAM real map; MagNav Challenge HDF5 data
- [ ] D11 QAOA feature selection (if not done)
- [ ] QRC temporal model
- [ ] EKF with an INS error model; altitude dimension; upward continuation of the map to the flight altitude

---

## Feature Prioritization Matrix

| Feature | Judge Value | Cost | Priority |
|---|---|---|---|
| T1–T3 synthetic map / flight / noise | HIGH | LOW–MED | P1 |
| T4 TL baseline | HIGH | LOW | P1 |
| T5 equal-feature classical ML | HIGH | LOW | P1 |
| T6 quantum KRR (Aer → IonQ sim) | HIGH | MED–HIGH | P1 |
| T7 particle filter | HIGH | MED | P1 |
| T8 metrics | HIGH | LOW | P1 |
| T9 map view / T10 signal panel | HIGH | MED | P1 |
| T11 replay fallback | HIGH (risk) | LOW | P1 |
| T12 README / submission docs | HIGH | MED | P1 |
| T13 accessibility | MED (required) | LOW | P1 |
| T14 hardware point | MED | LOW code / HIGH schedule | P1 (start early) |
| D12 hybrid residual framing | HIGH | LOW | P1 |
| D1 honest benchmark + negative results | HIGH | LOW | P1 |
| D4 nT → metres curve | HIGH | LOW | P2 |
| D2 train-size regime sweep | HIGH | MED | P2 |
| D3 shot-noise study | MED | MED | P2 |
| D6 particle cloud / D7 dual drone | MED–HIGH | LOW | P2 |
| D8 circuit figure / D9 repro kit / D10 practice table | MED | LOW | P2 |
| D5 noise ablation | MED | LOW | P3 |
| QELM fallback | MED | LOW–MED | P2 (only if QKRR fails) |
| D11 QAOA feature selection | MED–HIGH (novelty) | HIGH | P3 |
| QRC | MED (novelty) | MED–HIGH | P3 |
| Live streaming mode | MED | MED | P2 (replay first) |

---

## Competitor / Reference Feature Analysis

| Feature | MagNav Challenge / MagNav.jl | SandboxAQ AQNav | Typical hackathon QML project | Our Approach |
|---|---|---|---|---|
| Data | Real SGL flights, 10 Hz, 5 scalar + 4 vector mags, 14 current channels | Proprietary, 150+ flight-hours | Iris/MNIST or toy sine waves | Synthetic data with the same *structure* (scalar + vector + currents, 10 Hz) |
| Compensation | TL (perm/induced/eddy, 0.1–0.9 Hz bandpass) + linear + NN models | AI "Large Quantitative Models" | VQC on toy data | TL → quantum residual model (QKRR), compared against TL + classical KRR/MLP |
| Navigation | EKF / MPF with 17-state Pinson + FOGM, CRLB | Map matching on NAMAM; RNP-percent metrics | Usually absent | 2D particle filter; CEP and %-time-under-threshold metrics |
| Metrics | nT error std per line; position error vs CRLB | Position error (m), RNP 0.3 / 1 / 2 compliance | Accuracy on toy data, often without a classical baseline | nT RMSE + std, position error, CEP50/95, timing, qubits/params, multi-seed |
| Honesty | Peer-reviewed | Company press release (unverified) | Often overclaims advantage | Explicit negative-results section and regime analysis |

---

## Open Questions (flag for later phases)

- Can Qollab.xyz host a live Python backend, or only static/notebook content? This decides whether the deployed demo is replay-only. **Verify in Phase 1.**
- IonQ simulator quota / per-job circuit limits via Qollab. This bounds the QKRR training-set size on the IonQ sim. Fallback: compute the kernel on Aer and verify a subset on IonQ.
- Exact TL term count: classic formulations use 18 terms (3 + 6 + 9). MagNav.jl's TL coefficient state vector is length 19 in the nav code (likely including bias). Use 18 + optional bias. Minor detail.
- Whether quantum KRR shows any small-N edge on this data is unknown until run. Plan the narrative to work either way (D1/D2).

## Sources

- MagNav Challenge paper, "MagNav: Signal Enhancement and Machine Learning for Magnetic Navigation" (Gnadt et al.), arXiv:2007.12158, HTML v2: https://arxiv.org/html/2007.12158v2 (sensors, current channels, Ottawa flights, altitudes, `mag_1_c` truth, error-std metric). HIGH
- MagNav.jl repository: https://github.com/MIT-AI-Accelerator/MagNav.jl (project concluded, maintenance-only; dataset on Zenodo doi:10.5281/zenodo.4271803). HIGH
- MagNav.jl docs, compensation: https://mit-ai-accelerator.github.io/MagNav.jl/stable/comp/ (`create_TL_A`/`create_TL_coef`, perm/induced/eddy/bias, bandpass 0.1–0.9 Hz, fs 10 Hz). HIGH
- MagNav.jl docs, navigation: https://mit-ai-accelerator.github.io/MagNav.jl/stable/nav/ (`run_filt` :ekf/:mpf/:ekf_online_nn, Pinson 17 states + FOGM, `itp_mapS`, `der_mapS`, `crlb`). HIGH
- SandboxAQ / Acubed AQNav results (July 2025): https://www.sandboxaq.com/post/sandboxaq-and-acubed-achieve-remarkable-progress-in-magnetic-navigation ; https://thequantuminsider.com/2025/07/16/sandboxaq-and-acubed-achieve-progress-in-magnetic-navigation/ ; https://www.gpsworld.com/sandboxaq-and-acubed-advance-magnetic-navigation/ (150+ h, NAMAM, <74 m best case, RNP compliance percentages, LQM denoising). MEDIUM (company-reported)
- Quantum approach feasibility (QKRR, VQR, QRC/QELM, QAOA): training knowledge plus Qiskit Machine Learning conventions. MEDIUM. STACK research should verify current `qiskit-machine-learning` APIs (`FidelityQuantumKernel`, `QSVR`, `VQR`)
- GRF map synthesis parameters (power-law spectrum, upward continuation `exp(-|k|h)`, ±hundreds nT): standard potential-field geophysics; training knowledge. MEDIUM

---
*Feature research for: hybrid quantum/classical magnetic anomaly navigation demo*
*Researched: 2026-10-09*

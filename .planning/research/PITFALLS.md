# Pitfalls Research

**Domain:** Hybrid quantum/classical magnetic anomaly navigation (MagNav) hackathon demo. Qiskit denoiser on the IonQ simulator via Qollab, classical map matching, React + Vite frontend.
**Researched:** 2026-10-09
**Confidence:** MEDIUM overall. HIGH for the Qiskit 2.0 removals and the qiskit-ionq compatibility/transpile notes (official docs). MEDIUM for QML training behavior and MagNav simulation (well-established literature plus training knowledge). LOW for anything about the Qollab platform itself: there are no public docs, so verify it in the first hours.

> Phase labels below assume a roadmap shaped roughly like this:
> **P1** synthetic map + flight + noise · **P2** classical baseline + map matching + metrics (end-to-end vertical slice) · **P3** quantum denoiser on local Aer · **P4** IonQ simulator via Qollab + one hardware capture · **P5** backend API + precomputed runs · **P6** frontend (map + denoising panel, a11y) · **P7** docs, video, submission.
> Rename these to match the real roadmap. The order is what matters.

---

## Critical Pitfalls

### Pitfall 1: "Quantum decoration". The circuit does nothing the result depends on.

**What goes wrong:**
The quantum circuit sits next to the pipeline instead of inside it. Common forms: a VQC whose output gets multiplied by roughly 0. A "quantum feature" concatenated onto 20 classical features that the classical regressor ignores. A circuit that only produces random numbers. Judges under "Quantum Impact" are told to look for where the quantum subroutine *improves* quality, efficiency, or accuracy. The rules say a missing contribution can score 0 on Novelty and Technical Execution.

**Why it happens:**
The quantum part gets bolted on last, after the classical pipeline already works. Nobody runs the ablation.

**How to avoid:**
- Pick a narrow, explainable quantum job early. The recommended job: a quantum kernel (or a small VQC regressor) that predicts the *interference component* from a few drone-state features (motor RPM/current, heading direction cosines, maybe 2-4 features). Subtract that prediction from the raw trace. This mirrors Tolles-Lawson / MagNav compensation, so it is a real, defensible job.
- Make the baseline the *same model family with a classical kernel*: quantum-kernel SVR/KRR vs RBF-kernel KRR vs Tolles-Lawson linear regression. All three get the same features and the same train/test split. That is an honest A/B.
- Run the ablation and publish it: replace the quantum kernel with an identity or random kernel and show that the metric degrades.
- If quantum only *matches* classical, say so and reframe the contribution as "benchmarking and noise-robustness study on IonQ noise models". The rules accept benchmarking as a technical extension.

**Warning signs:**
- You can't explain in one sentence what the circuit computes.
- Removing the circuit doesn't change the position error.
- The quantum branch has a different feature set or more training data than the baseline.

**Phase to address:** P3 (design), verified in P7 (write-up).

---

### Pitfall 2: Quantum kernel cost explodes. O(N^2) circuits on a shared simulator.

**What goes wrong:**
A fidelity quantum kernel needs one circuit per *pair* of samples. Training on 300 samples is about 45,000 circuits, and test-vs-train adds N_test x N_train more. On Aer that takes seconds to minutes. On the shared IonQ simulator through a web queue it can take hours, or never finish before the deadline.

**Why it happens:**
Tutorials use 20-50 samples on statevector simulators, where cost is invisible.

**How to avoid:**
- Compute the training kernel locally on Aer, or exactly with `qiskit.quantum_info.Statevector`. Budget N_train at 40-80 samples (subsample the trace; the interference model is low-dimensional).
- For the IonQ submission run, send a small, fixed evaluation batch, for example a 10x10 kernel block or 20-50 inference circuits. Batch them into a single `backend.run([...])` call (qiskit-ionq accepts a list). Compare those IonQ-simulator kernel entries against the Aer values and report the deviation. Then do the full denoise with Aer-equivalent values, and say so in the README.
- Keep shots modest: 256-1024 for kernel entries (the estimator is P(all zeros)). Report shot noise.
- Alternative that avoids N^2: a projected kernel, or "quantum feature map -> measured expectation features -> classical ridge regression". That is N circuits, not N^2.

**Warning signs:**
- A single kernel evaluation on Aer takes more than 1 minute.
- The job count to the IonQ simulator is above roughly 100 circuits.
- No progress bar or ETA in your scripts.

**Phase to address:** P3 (architecture choice), P4 (batch sizing).

---

### Pitfall 3: Variational training that never converges in the time box (barren plateaus, shot noise, parameter-shift cost)

**What goes wrong:**
A VQC/QNN with hardware-efficient ansatz, global cost, many layers or qubits gives vanishing gradients (barren plateaus). Shot-based gradients are noisy. Parameter-shift needs 2 x P circuit evaluations per sample per step. Training wanders for hours, and the "quantum" result ends up worse than a constant predictor.

**Why it happens:**
Copying a 6-8 qubit, 4-layer EfficientSU2/RealAmplitudes tutorial, training with shots, and using SPSA/COBYLA with default maxiter.

**How to avoid:**
- Prefer a quantum kernel (no training loop, convex classical solve) over a VQC. If you use a VQC: 3-4 qubits, 1-2 layers, local cost (single-qubit Z expectation), trained *exactly* on statevector (`StatevectorEstimator`), COBYLA/L-BFGS-B with a hard cap (for example maxiter=150).
- Set a hard 2-hour timebox on getting a quantum model to beat the trivial baseline on held-out data. If it misses, fall back to the kernel approach or the "honestly matches" framing.
- Kernel concentration is the kernel-side barren plateau. With many qubits or deep feature maps, all off-diagonal kernel values go to roughly 0 or roughly equal (exponential concentration). Keep the qubits at the feature count (2-6), tune a bandwidth/scaling factor on the input features, and check the kernel matrix histogram.
- Fix all seeds (`seed_simulator`, `seed_transpiler`, numpy).

**Warning signs:**
- Loss plateaus after the first few iterations.
- Gradient norms below 1e-3.
- Kernel off-diagonals all within +/-0.02 of each other, or the kernel matrix looks like the identity.
- Training wall time per epoch above 5 minutes.

**Phase to address:** P3.

---

### Pitfall 4: Qiskit 1.x/2.x API breakage from copied tutorials and AI-generated code

**What goes wrong:**
Code from older tutorials, Stack Overflow, or LLM suggestions imports APIs that no longer exist. Each import error costs 15-60 minutes:
- `from qiskit import execute`. Removed in Qiskit 1.0. Use `backend.run(transpile(qc, backend))` or primitives.
- `qiskit.algorithms` / `qiskit.utils.QuantumInstance`. Removed long ago; algorithms moved to `qiskit_algorithms` (community-maintained) and `QuantumInstance` is gone.
- `from qiskit import Aer` / `qiskit.providers.aer`. Use `from qiskit_aer import AerSimulator`.
- V1 primitives `qiskit.primitives.Sampler` / `Estimator` / `BackendSampler` / `BackendEstimator`. **Removed in Qiskit 2.0** (verified, official release notes). Use `StatevectorSampler` / `StatevectorEstimator`, `BackendSamplerV2` / `BackendEstimatorV2`, or Aer's V2 primitives.
- `BackendV1`, `qiskit.providers.models`, `BackendV2Converter`, Qobj, `qiskit.pulse`. **Removed in 2.0** (verified).
- qiskit-machine-learning: V1 primitive support was deprecated and slated for removal in 0.9. `FidelityQuantumKernel` / `QSVR` / `EstimatorQNN` must be built with V2 primitives (LOW-MEDIUM confidence on the exact version; check the installed release notes).

**Why it happens:**
Most Qiskit content online predates 1.0. LLMs also emit pre-1.0 idioms.

**How to avoid:**
- Hour 1: create a pinned `requirements.txt` from a fresh venv with `qiskit>=2,<3`, `qiskit-aer`, `qiskit-ionq>=1.0` (IonQ docs: 1.0+ is required for Qiskit 2.0), and optionally `qiskit-machine-learning`. Run a 10-line smoke test: build circuit -> Aer -> IonQ provider object -> transpile.
- **Before writing quantum code, find out which Qiskit/qiskit-ionq versions Qollab's runtime has** (LOW confidence: no public docs found). If Qollab pins Qiskit 1.x, match it locally. Don't develop against 2.x and discover the mismatch at submission.
- Prefer raw `qiskit` + `qiskit_aer` + `quantum_info` over heavy wrappers. Writing a fidelity kernel by hand is about 20 lines (`feature_map(x).compose(feature_map(y).inverse())`, measure, P(0...0)), and it removes the qiskit-machine-learning dependency risk.

**Warning signs:**
- `ImportError` on `execute`, `Aer`, `Sampler`, `QuantumInstance`.
- `DeprecationWarning` spam.
- Pip resolver downgrading qiskit when you install qiskit-machine-learning or qiskit-ionq.

**Phase to address:** P1 (environment setup, before any quantum code), re-checked at the start of P4.

---

### Pitfall 5: Circuit runs on Aer but fails or behaves differently on the IonQ backend

**What goes wrong:**
- Unsupported instructions: mid-circuit `reset`, conditional ops / `if_test`, `initialize` with arbitrary states, `save_statevector` (an Aer-only instruction), barriers in odd places, custom unitary gates, parameterized circuits submitted *unbound*.
- Missing measurements. IonQ docs explicitly warn that results may be wrong without `measure`/`measure_all`.
- Too many qubits for the selected noise model. IonQ says noise-model simulations use up to the corresponding QPU's qubit count; the ideal simulator handles up to 29 qubits (per Azure provider docs). Fine for 2-6 qubits, but don't scale up.
- Transpiler friction. IonQ docs recommend `optimization_level=1` (or 0) when transpiling for IonQ, and IonQ's compiler optimizes server-side. Otherwise you get `IonQTranspileLevelWarning`. Native-gate mode (`gpi`, `gpi2`, `ms`/`zz`) is a separate gateset option. Don't use it unless you deliberately target native gates; the default QIS gateset is simpler.
- Results differ. The ideal simulator resamples from a stored distribution, so `get_counts()` on retrieval isn't reproducible. With a noise model (`forte-1`), kernel values shrink toward the uniform distribution, so a 4-qubit kernel's P(0000) floor rises to about 1/16.
- `IonQProvider()` doesn't validate credentials at construction. Auth errors appear only at `run()`, so the first real error happens late.

**Why it happens:**
Aer accepts almost everything. Devs test on statevector paths, then switch backends at the end.

**How to avoid:**
- Write the circuit builder once, with `measure_all()`, all parameters bound (`assign_parameters`) before submission, and only standard gates (h, rx, ry, rz, cx/rzz). No reset, no classical control, no `initialize`.
- Every quantum function takes a `backend` argument. CI-style test: run the same 3 circuits on `AerSimulator()` and on `AerSimulator` with a depolarizing noise model, and assert that both work and the outputs are close.
- In P4, submit a single tiny circuit to the IonQ simulator through Qollab *on day 1*, not day 2. Then try the noise model `forte-1` (aria models are legacy/retired per IonQ docs).
- Correct kernel values for the noise floor, or report raw and corrected values side by side.

**Warning signs:**
- `TranspilerError`, `IonQAPIError`, "gate not supported".
- All-zero or uniform counts.
- Jobs stuck in QUEUED with no timeout handling.

**Phase to address:** P3 (circuit hygiene), P4 (first remote run within the first ~12 hours of the hackathon).

---

### Pitfall 6: Map matching is trivial or impossible because the synthetic map has the wrong gradient

**What goes wrong:**
- The map is too smooth (huge correlation length, low amplitude). Many locations have the same reading, the matcher is ambiguous, and position error is large regardless of denoising. The quantum contribution can't show up.
- The map is too rough (white noise, tiny correlation length). A single reading pins the location, the matcher becomes a lookup, and noise barely matters. Again denoising looks irrelevant.
- The magnitude is unrealistic. Crustal anomalies are typically tens to a few hundred nT (sometimes over 1000 nT over strong sources), and gradients are typically a few nT per 100 m at altitude. Platform interference in real aircraft ranges from tens to thousands of nT before compensation. If noise is 10x or 0.01x the anomaly signal, the demo doesn't say anything.

**Why it happens:**
`np.random.randn` blurred by an arbitrary sigma, with no check of the information content.

**How to avoid:**
- Generate the map as a sum of Gaussian random fields at two or three spatial scales (for example 2 km, 500 m, 100 m correlation lengths) plus a few dipole-like anomalies, scaled to an RMS of about 100-200 nT. Optionally upward-continue (FFT low-pass by exp(-|k|h)) to mimic flight altitude. That is real physics and a nice documentation point.
- **Tune the map by the experiment, not by eye.** Sweep noise level x map roughness and plot position error for raw / classical / quantum. Pick a regime where raw fails, cleaned succeeds, and quality differences between denoisers show up as position differences. Document the sweep; it is a strong Technical Execution artifact.
- Match *profiles* (a window of N samples along track, TERCOM-style correlation) or use a particle filter, not single points. Single-point matching on a scalar field is fundamentally ambiguous.

**Warning signs:**
- Position error barely changes between raw and cleaned traces.
- Raw-trace position error is already near 0.
- Correlation surface has many equal peaks.

**Phase to address:** P1 (map generation), validated in P2 (sweep).

---

### Pitfall 7: Leaking the true position or the clean signal into the estimator

**What goes wrong:**
Results look great because the estimator sees the answer:
- The matcher's search window is centered on the *true* position instead of the dead-reckoned/INS estimate.
- The "predicted map value" in the filter is sampled at the true position.
- The denoiser is trained with the clean trace as target, *and* evaluated on the same flight segment.
- Noise parameters (motor frequency, current coefficients) are passed to the classical baseline as known constants. A real system doesn't know them, and a knowledgeable judge will notice.
- Global normalization statistics computed on the full trace including test data.

**Why it happens:**
In simulation the truth is one variable away, and pipelines get written fast.

**How to avoid:**
- Structural separation. The simulator returns a `Truth` object (true positions, clean trace) and a `Sensors` object (raw mag trace, noisy INS/odometry with drift, motor current, heading). The estimator module **only accepts `Sensors` + map**. Enforce it by function signatures; truth is used only in `metrics.py`.
- Give the navigator a drifting dead-reckoning prior (velocity bias + random walk) and search around *that*.
- Train denoisers on calibration flight A (a separate "compensation flight" with maneuvers, which is exactly how real Tolles-Lawson calibration works) and evaluate on flight B with a different path and seed. This is realistic and makes the README stronger.

**Warning signs:**
- Position error below the map grid resolution.
- Perfect results that don't degrade as noise increases.
- Any `truth` import outside `metrics`/plots.

**Phase to address:** P1 (data interfaces), P2 (navigator), P3 (train/test protocol).

---

### Pitfall 8: Cherry-picked or unreproducible quantum-vs-classical comparison

**What goes wrong:**
A single seed where quantum wins by a little. A baseline left untuned (default RBF gamma) while the quantum model is tuned. Different splits. Results that can't be regenerated. A judge running the repo gets different numbers.

**How to avoid:**
- Tune hyperparameters for **both** with the same budget (small grid on calibration-flight CV).
- Report mean +/- std over 5-10 seeds or flights, plus a per-seed table. Include the case where classical wins.
- A single script `python -m magnav.experiments.compare --seed 0..9` writes `results/metrics.json` and the plots. The README quotes numbers from that file, and the frontend fallback loads that same file.
- Report cost too (circuits, shots, wall time). Honest efficiency numbers count under "Quantum Impact".

**Warning signs:**
- You re-run and the "win" flips.
- Numbers in the README were typed by hand.

**Phase to address:** P3/P4 (experiment script), P7 (write-up).

---

### Pitfall 9: The live demo path depends on a slow or remote quantum call

**What goes wrong:**
The judged demo or video blocks on an IonQ simulator job (queue on a shared simulator), a WebSocket drops, the backend isn't running on the judge's machine, or the Qollab-hosted environment can't run the React app at all. The core visual (the drone holding position) never appears.

**Why it happens:**
"Live" feels more impressive. Devs test only on localhost with a warm backend.

**How to avoid:**
- **Precompute everything quantum.** The live simulation runs classical code plus *cached* quantum predictions (or Aer locally, which takes milliseconds for a few qubits). IonQ simulator results are captured once by a script, saved to JSON with job IDs, and displayed as evidence.
- Make the fallback the *default* data source for the frontend: a static `replay.json` bundled with the build. Live mode is an enhancement toggled when the backend health check passes. Same render code for both, so the visuals are identical.
- Prefer Server-Sent Events, or simple polling of `/step?t=`, over WebSockets. Or stream the whole precomputed flight and animate client-side with `requestAnimationFrame`. If you use WebSockets, add auto-reconnect and a "switch to replay" button on error.
- Record the demo video from the replay path to eliminate surprises.

**Warning signs:**
- The frontend shows a spinner when the backend is off.
- Demo start needs more than one terminal command.
- Any `await ionq_job.result()` reachable from an HTTP handler.

**Phase to address:** P5 (backend/precompute), P6 (frontend data-source abstraction).

---

### Pitfall 10: Qollab publishing and runnability unknowns discovered at the deadline

**What goes wrong:**
The requirement is "published and runnable on Qollab.xyz" and "runs without errors on the Qollab-provided IonQ simulator". The Qollab project format is undocumented publicly (LOW confidence). It might be notebook-based, it might not host a React frontend or a long-running Python server, and it might have a different Python or Qiskit version. Discovering this at hour 38 is fatal. A project page that works only when logged in fails the logged-out check.

**How to avoid:**
- **Hours 0-3:** create a throwaway Qollab project, run a 2-qubit Bell circuit on the IonQ simulator there, publish it, and open it in a private/incognito window. Record: runtime type, Python/Qiskit versions, whether files and multiple modules are supported, and whether a web UI can be embedded or must be linked externally.
- Structure the repo so the **Qollab artifact is a self-contained entry point** (for example `qollab_run.py` or a notebook) that runs the quantum denoiser end-to-end on the IonQ simulator with small batches and prints metrics. It shouldn't depend on the React app. Host the frontend separately (GitHub Pages/Vercel static build using `replay.json`) and link to it.
- Ask in mentor Slack office hours (Oct 10) early about the Qollab runtime constraints.

**Warning signs:**
- You haven't opened the published page logged out.
- The Qollab entry point imports frontend or server code.
- Job runs require your personal environment variables.

**Phase to address:** P1 (spike), P4 (Qollab entry point), P7 (logged-out test).

---

### Pitfall 11: Solo 40-hour time traps (UI polish first, quantum over-scope)

**What goes wrong:**
Hours go into map styling, animations, or a fancy ansatz while the end-to-end pipeline doesn't run. Or the quantum part grows (more qubits, data re-uploading, error mitigation, a hardware sweep) and eats the docs time. Documentation is 25% of the score and is typically written in the last 2 hours.

**How to avoid:**
- Vertical slice by about hour 10-12: synthetic map -> noisy flight -> Tolles-Lawson baseline -> profile matcher -> metrics JSON -> ugly static plot. Only then the quantum work.
- Quantum budget: about 10 hours total including IonQ integration. Hard stop rules: no more than 6 qubits, at most 1 feature-map design iteration after the first working version, hardware run attempted once (queue time is not under your control; submit early, for example Oct 10 evening, and don't block on it).
- UI budget: about 8 hours. Use a plain canvas/SVG or a lightweight chart lib, no real basemap tiles needed (the "map" is a heatmap of your synthetic anomaly grid, which is more on-message anyway).
- Docs budget: at least 5 hours. Write the README incrementally at each phase end (append results as they appear).
- Sleep. Two short sleeps beat a hallucinating hour 34.
- Freeze features at about T-8h (Oct 11 ~8 AM PDT). After that only fixes, docs, video, submission.

**Warning signs:**
- At hour 12 there is no metrics number.
- At hour 24 the IonQ simulator hasn't returned a single result.
- At T-6h the README is a stub.

**Phase to address:** Roadmap structure itself, with all phases gated by checkpoints.

---

### Pitfall 12: Submission compliance misses (disqualification-level)

**What goes wrong:**
Missing `LICENSE` (MIT) file, or a license only in the README. Missing the exact attribution line "This effort is supported by Qollab & IonQ." No disclosure of AI tools (Claude Code / GSD) and libraries. No theme tag. No video link. Code timestamps that look like pre-existing work. Accessibility unaddressed even though it's an explicit requirement.

**How to avoid:**
- P1: commit `LICENSE` (MIT, with name and year 2026), a README skeleton with the attribution line verbatim, a `DISCLOSURES` section (AI tools: Claude Code and the GSD workflow; libraries: qiskit, qiskit-aer, qiskit-ionq, numpy, scipy, React, Vite, chart lib, and so on; templates: Vite starter), and a theme tag note.
- Git history starts after the window opened (Oct 9, 7 PM ET). Keep committing regularly; it is your originality evidence.
- Submission checklist script/README section, ticked off at T-3h, not T-15min.
- Qollab project page: same attribution, license, disclosure, repo link, video link.

**Warning signs:**
- `ls LICENSE` fails.
- `grep "supported by Qollab & IonQ"` finds nothing in the README and the project page.

**Phase to address:** P1 (scaffold), P7 (final audit).

---

## Moderate Pitfalls

### Pitfall 13: Unrealistic noise model makes both denoisers look perfect or useless
**What goes wrong:** Pure Gaussian white noise, which a moving average removes. Or noise uncorrelated with any observable, which no model can predict. Real platform interference is mostly *deterministic given the platform state*: permanent/induced/eddy terms depending on heading/attitude (Tolles-Lawson), plus current-dependent offsets from motors and ESCs, plus periodic components at motor RPM harmonics.
**Prevention:** Noise = TL-style terms from heading/attitude direction cosines + k x motor_current(t) + periodic term at RPM-linked frequency + slow drift + white noise. The denoiser inputs (current, RPM, attitude) are *observable* sensors; the coefficients are hidden. That makes the denoising problem meaningful and lets a nonlinear (kernel) model beat linear TL on, for example, a nonlinear current term. That's a legitimate place for the quantum kernel to show an edge. Disclose that you designed the noise; don't overclaim.

### Pitfall 14: Denoiser evaluated on training data, or filtering that destroys the anomaly signal
**What goes wrong:** Reported signal RMSE is on the training segment. Or a low-pass "denoiser" also removes the high-frequency map content the matcher needs.
**Prevention:** Separate calibration and evaluation flights (see Pitfall 7). Always report *position error*, not just signal RMSE, because position error is the metric that counts. Plot the residual spectrum.

### Pitfall 15: Shots and noise misread as model quality
**What goes wrong:** Comparing an exact-statevector classical kernel with a shot-noise quantum kernel conflates estimator variance with model capacity.
**Prevention:** Report three quantum numbers: exact (statevector), Aer with shots, IonQ simulator (ideal, and `forte-1` noise if feasible). Shot noise on kernel entries is about sqrt(p(1-p)/shots). Regularize the KRR/SVR (add lambda to the diagonal) so noisy kernels stay PSD-ish.

### Pitfall 16: qiskit-ionq / Qollab credential confusion
**What goes wrong:** The organizers say the Qollab account *is* the simulator access, with no separate IonQ key. Code that hardcodes `IonQProvider("token")` or expects `IONQ_API_KEY`/`QISKIT_IONQ_API_TOKEN` may not match how Qollab injects access. A key committed to the public repo is a security problem.
**Prevention:** Confirm the auth mechanism in the P1 spike. Read credentials from env only, add `.env` to `.gitignore`, and put a backend factory in one file (`get_backend(kind="aer"|"ionq_sim"|"ionq_qpu")`).

### Pitfall 17: Accessibility treated as a final pass
**What goes wrong:** Canvas-only map with no text alternative. Red/green true-vs-estimated paths (colorblind failure). Auto-playing animation ignoring `prefers-reduced-motion`. Controls that aren't keyboard reachable. Charts with no labels.
**Prevention:** From the first frontend commit: semantic `<button>`s, visible focus, an `aria-live="polite"` region announcing "GPS jammed", position error, and phase changes, a colorblind-safe palette (blue/orange) plus line-style differences (solid vs dashed), a data table or summary text alternative for each chart, a reduced-motion mode that steps instead of animating, and WCAG AA contrast. Run Lighthouse/axe once at the end of P6.

### Pitfall 18: Overclaiming the AQNav comparison or quantum advantage
**What goes wrong:** The write-up implies quantum sensing or quantum advantage. Judges with domain knowledge penalize it.
**Prevention:** State plainly: SandboxAQ's quantum part is the magnetometer; this project's quantum part is a kernel/denoising subroutine; data is synthetic; no advantage claim at this scale; the result is a benchmark of where it helps or doesn't. Honesty here is a documentation and credibility win.

---

## Minor Pitfalls

### Pitfall 19: Coordinate/unit mixups
**What goes wrong:** Map in grid indices, flight in meters, heading in degrees vs radians, nT vs T.
**Prevention:** One `units.py`. Map object carries its extent in meters. Bilinear interpolation via `scipy.interpolate.RegularGridInterpolator`.

### Pitfall 20: Non-determinism across runs
**What goes wrong:** Unseeded RNG makes replay data differ from what the README shows.
**Prevention:** Seed everything. The replay file includes the seed and git hash.

### Pitfall 21: Frontend/backend CORS and port issues during the video recording
**Prevention:** Vite dev proxy to the backend, or serve the built frontend from the Python server. Static replay needs neither.

### Pitfall 22: Hardware run blocked by queue or credits
**What goes wrong:** The one real-QPU result never returns before the deadline.
**Prevention:** Submit a tiny job (a few circuits, 100-500 shots) by Oct 10 evening, save the job ID, retrieve with the *same backend type* (IonQ docs requirement), and write a fallback sentence in the README if it doesn't return.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Compute full kernel on Aer/statevector, only sample a block on IonQ sim | Feasible runtime | Must disclose clearly | Always for this hackathon. Document it. |
| Hardcoded hyperparameters | Saves tuning hours | Baseline fairness questioned | Only if the same tuning budget was given to both models and it's written down |
| Static `replay.json` instead of live backend | Bulletproof demo | Less "live" | Acceptable as default; live is a bonus |
| Single-file backend script | Fast | Harder to extend (documentation criterion) | OK if README explains the module layout; split into `sim/`, `denoise/`, `nav/`, `metrics/` if time allows |
| Skipping particle filter, using windowed correlation matcher | Hours saved | Lower nav realism | Acceptable. Mention particle filter/EKF as extension in README. |
| Using qiskit-machine-learning wrappers | Less code | Version/primitive breakage risk | Only after a smoke test passes on the exact Qollab versions |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| qiskit-ionq | Using <1.0 with Qiskit 2.x, or 1.x with Qiskit 1.x | Match: qiskit-ionq >=1.0 for Qiskit 2.x (IonQ docs); verify Qollab's versions first |
| qiskit-ionq transpile | Default optimization level 2+ -> `IonQTranspileLevelWarning` / over-optimization | `transpile(qc, backend, optimization_level=1)`; IonQ compiles server-side |
| IonQ simulator | Unbound parameters, no measurements, Aer-only instructions | Bind params, `measure_all()`, standard gates only |
| IonQ noise models | Using `aria-1`/`harmony` names | `forte-1` (aria models legacy per IonQ docs) |
| IonQ jobs | One job per circuit, no timeout | Batch list into one `run()`, poll with timeout, persist job IDs |
| Job retrieval | Retrieving via a different backend object | Retrieve with the same backend type used to submit |
| Qollab runtime | Assuming local env == Qollab env | Spike in hours 0-3; pin to Qollab's versions |
| Frontend <-> backend | WebSocket without reconnect | SSE/polling or fully client-side replay; health check toggles live mode |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N^2 kernel circuits | Hours-long jobs | N_train 40-80, statevector locally, small IonQ block | N > ~100 on remote sim |
| Parameter-shift gradients with shots | Epochs take minutes | Exact statevector training, few params | > ~20 params x > ~50 samples |
| Re-transpiling per sample | CPU-bound slowdown | Transpile the parameterized template once, then `assign_parameters` | > ~100 circuits |
| Map interpolation in Python loops | Slow nav step | Vectorized `RegularGridInterpolator`, precompute correlation via FFT/NumPy | Grids > 500x500 or long flights |
| Streaming every sample over WS | Janky UI | Send at 10-20 Hz or send whole track and animate client-side | > ~50 msgs/s |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing IonQ/Qollab tokens to public repo | Credit theft, account abuse | Env vars, `.gitignore .env`, scan with `git grep -i token` before publishing |
| Backend endpoint that triggers remote quantum jobs publicly | Anyone can burn your shared quota | No remote-quantum endpoints in the deployed demo; precomputed only |
| Wide-open CORS on deployed backend | Minor | Restrict to frontend origin, or deploy static only |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Judges can't tell what "quantum" did | Novelty/Impact undersold | Denoising panel: raw / classical / quantum traces + numeric RMSE + position error, one-sentence caption of the circuit's job |
| No "GPS jammed" moment | No story | Scripted beat: GPS on -> jammed at t=X -> raw drifts off, cleaned holds |
| Animation too fast/long | Judges miss the point | 30-60 s flight, play/pause/step, speed control |
| Error numbers without units/context | Confusing | Meters and nT, with a "raw vs cleaned" delta badge |
| Red/green paths only | Colorblind users can't distinguish | Color + dash pattern + legend + text summary |

## "Looks Done But Isn't" Checklist

- [ ] **Quantum denoiser:** runs on Aer *and* returns a result from the Qollab IonQ simulator. Verify via saved job ID and output file.
- [ ] **Baseline:** tuned with the same budget, same features, same split. Verify via the experiment config in the repo.
- [ ] **Metrics:** multi-seed, held-out flight, position error reported. Verify that `results/metrics.json` regenerates from one command.
- [ ] **No leakage:** estimator imports nothing from truth. Verify with `grep -r truth src/nav src/denoise`.
- [ ] **Fallback:** frontend works with the backend killed. Verify by stopping the server and reloading.
- [ ] **Qollab:** published project opens and runs in a logged-out incognito window.
- [ ] **Hardware result:** one job ID + counts + date captured and shown, or an honest note if it didn't return.
- [ ] **Compliance:** `LICENSE` (MIT), attribution line verbatim in README + project page, AI/library/template disclosure, theme tag, video link, repo link.
- [ ] **A11y:** keyboard-only walkthrough, reduced-motion respected, contrast AA, chart text alternatives, aria-live status.
- [ ] **README:** what/why/how-to-run/how-to-replicate/how-to-extend + per-criterion summary + honest AQNav framing + limitations.
- [ ] **Fresh clone test:** `git clone` -> install from pinned requirements -> run in a clean venv.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| VQC won't converge | LOW | Switch to fidelity-kernel KRR (no training loop); reuse the feature map |
| Quantum doesn't beat classical | LOW | Reframe as an honest benchmark: show where it matches, cost, noise sensitivity (forte-1 vs ideal). Still satisfies "technical extension: benchmarking" |
| IonQ sim queue/timeouts | MEDIUM | Shrink batch to 10-20 circuits, fewer shots; show IonQ-vs-Aer agreement on that subset |
| Qollab can't host frontend | LOW (if detected early) | Static deploy elsewhere + link; Qollab entry is the quantum script/notebook |
| Version mismatch on Qollab | MEDIUM | Drop wrappers, use core `QuantumCircuit` + `backend.run` only (most version-stable surface) |
| Map makes nav trivial/impossible | LOW | Re-tune RMS/correlation lengths via the sweep script; regenerate replay |
| Hardware job never returns | LOW | Report job ID + status; show IonQ noisy-sim (`forte-1`) result as proxy, clearly labeled |
| Live demo breaks during judging | LOW | Toggle to replay (default anyway) |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 4 API breakage, 10 Qollab unknowns, 16 credentials | P1 (env + Qollab spike, hours 0-3) | Bell circuit result from Qollab IonQ sim; versions recorded in README |
| 12 Compliance scaffold | P1 | LICENSE + attribution + disclosure stubs committed |
| 6 Map gradient, 13 Noise realism, 19 units | P1 | Sweep plot shows raw fails / cleaned succeeds regime |
| 7 Leakage | P1 interfaces, P2 navigator | Estimator signature takes only Sensors + map |
| 11 Time traps | Roadmap gating | Metrics JSON exists by ~hour 12 |
| 1 Decoration, 2 Kernel cost, 3 Convergence, 15 Shots | P3 | Ablation + exact/shots/IonQ comparison table |
| 5 Aer-vs-IonQ divergence, 22 Hardware | P4 | Saved IonQ sim job IDs + outputs; hardware job submitted by Oct 10 evening |
| 8 Cherry-picking, 14 Train-on-test | P3/P4 experiments | Multi-seed held-out metrics regenerate from one command |
| 9 Live demo fragility, 21 CORS | P5/P6 | Frontend works with backend killed |
| 17 Accessibility | P6 (from first commit) | Keyboard walkthrough + axe/Lighthouse pass |
| 18 Overclaiming, 12 Compliance final | P7 | README review against judging criteria; logged-out Qollab test |

## Sources

- IonQ Qiskit SDK docs (qiskit-ionq >=1.0 required for Qiskit 2.0; `optimization_level=1` recommendation and `IonQTranspileLevelWarning`; noise models `forte-1`/`forte-enterprise-1`, aria legacy; measure requirement; same-backend retrieval; `IonQProvider()` doesn't validate credentials; ideal sim resampling): https://docs.ionq.com/sdks/qiskit/index.md (HIGH)
- IonQ noise-model simulation guide (depolarizing approximation, qubit count tied to QPU): https://docs.ionq.com/guides/simulation-with-noise-models (HIGH)
- Azure Quantum IonQ provider (ideal simulator up to 29 qubits): https://learn.microsoft.com/azure/quantum/provider-ionq (MEDIUM)
- Qiskit 2.0 release notes (removed BackendV1, providers.models, BackendV2Converter, V1 primitives Sampler/Estimator/BackendSampler/BackendEstimator, qiskit.pulse, qobj): https://quantum.cloud.ibm.com/docs/api/qiskit/release-notes/2.0 (HIGH)
- qiskit-machine-learning release notes (V1 primitives deprecated, slated for removal in 0.9): https://qiskit.org/ecosystem/machine-learning/release_notes.html (MEDIUM)
- MagNav.jl / JuliaCon talks (Tolles-Lawson baseline, compensation -> EKF navigation pipeline): https://pretalx.com/juliacon2023/talk/9AKT3R/ , https://pretalx.com/juliacon2024/talk/GBHW7G/ (MEDIUM)
- Q-CTRL quantum-assured MagNav field trials (joint denoise + map matching, TL-like coefficients): https://arxiv.org/pdf/2504.08167 (MEDIUM)
- Hackathon announcement (Oct 9, 2026 SESSION): https://quantumzeitgeist.com/ionq-quantum-hackathon-qollab-host/ (LOW: no runtime details)
- Barren plateaus (McClean et al. 2018) and exponential concentration of quantum kernels (Thanasilp et al. 2022/2024): training knowledge, MEDIUM. Well established in the QML literature.
- Removal of `execute` (Qiskit 1.0) and `qiskit.algorithms` -> `qiskit_algorithms`: training knowledge, MEDIUM. Not re-verified this session.

---
*Pitfalls research for: hybrid quantum/classical MagNav hackathon demo*
*Researched: 2026-10-09*

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Magnetic Field Detector (Quantum MagNav)**

A hackathon demo of GPS-denied drone navigation by magnetic anomaly matching (MagNav), modeled on what SandboxAQ's AQNav does. A simulated drone flies over a synthetic map of Earth's crustal magnetic anomalies while its own electronics pollute the magnetometer signal; a hybrid pipeline strips that noise with a Qiskit quantum circuit and then matches the cleaned signal against the map classically to recover position without GPS. Built solo in ~40 hours for the Qollab × IonQ Hackathon (Oct 9–11, 2026), with a React + Vite frontend and a Python backend.

**Core Value:** Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.

### Constraints

- **Tech stack**: Frontend JavaScript (React + Vite); backend Python; all quantum code through Qiskit — hackathon rule plus user preference
- **Quantum runtime**: IonQ simulator via Qollab for the submitted run; Qiskit Aer locally for development; real 24-qubit device at most once for a captured result — fragility and queue times
- **Timeline**: Submission deadline Oct 11, 2026 7:00 PM ET (4:00 PM PDT); ~40 hours solo — scope must be a vertical slice that demos end-to-end early, then deepens
- **Licensing**: MIT license, attribution line, and disclosure of all AI tools and libraries — hackathon rules, disqualification risk otherwise
- **Originality**: all code written during the build window; no prior work reused — hackathon rule
- **Accessibility**: UI must follow accessibility best practices — explicit submission requirement
- **Demo reliability**: live simulation must have a precomputed fallback so the judged demo never depends on a live compute path
## Submission approval gate (hard rule for every agent and subagent)

No agent or subagent may, without the user's explicit, in-words approval of that specific action in the current session, given after seeing exactly what will be submitted:

- **(a) Submit the project to the hackathon** through any submission form, portal, email, or Slack message to organizers.
- **(b) Publish or republish a Qollab project version** (the Publish action, which changes what visitors see).
- **(c) Post on the builder's behalf** to #hackathon-help or any organizer channel.

Approval for an earlier publish (for example `v0.1-smoke` on 2026-10-10) does not carry forward to any later publish or submission. Still allowed without asking: uploading files into the Qollab editor without publishing, building the upload zip, pushing to GitHub, and running jobs on simulators. GSD plans must mark any gated step as a human checkpoint (`checkpoint:human-action`) that stops and waits; it is never a task the executor performs.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## READ THIS FIRST: Qollab changes the architecture
| Fact | Consequence for this project |
|------|------------------------------|
| Python runs on **Pyodide (Python 3.14, WebAssembly)** in the browser. No code runs on a server except the quantum job itself. | There is no FastAPI/Flask server on Qollab. The Python pipeline must be pure Python + Pyodide-available packages. |
| A top-level `index.html` + `main.js` makes a **JS project**: the page renders above a console, and `main.js` can `import * as m from 'magnav.api'` (your Python modules, by dotted name) and call `await m.fn.callPromising(backend, ...)`. | This is how "React frontend + Python backend" maps onto Qollab: React in `main.js`, Python in a `magnav/` package, linked by an in-page Pyodide bridge instead of HTTP. |
| `index.html` is **body content only**. `<script>` tags do not run. `main.css` is the only stylesheet loaded. JS can import other project JS files with `./` paths, or **any library from a full URL** (e.g. `https://cdn.jsdelivr.net/npm/<pkg>/+esm`). | Vite must build to **one `main.js` (ES module) + one `main.css`**, with the Python module specifiers marked external. Tested locally: it works (see Packaging). |
| **No WebSocket, no XHR, no web workers, no POST.** GET `fetch` only, and only to CORS `*` hosts. No localStorage/IndexedDB. | Drop WebSocket/SSE streaming. "Live" mode means: Python computes the flight in-page, then JS animates it with `requestAnimationFrame`. |
| **IonQ backends accept ONE job per run.** A second `backend.run` (or a second Estimator call) stops the run with an error. Local simulators allow any number. | You **cannot train a variational circuit on the IonQ simulator** on Qollab. Train locally / on the built-in simulator, then do **one batched multi-circuit inference job** on IonQ. This is the most important design constraint. |
| `backend` is **pre-created and injected** (global in `main.py`, available in `main.js`). Do not construct a provider or hardcode a backend. | The quantum module must take `backend` as a parameter. Locally, inject `AerSimulator()`; on Qollab, use whatever the visitor picks. |
| **`BackendSamplerV2` silently returns all-zero bitstrings on IonQ** (qiskit-ionq returns no per-shot memory). `BackendEstimatorV2` works on IonQ. Raw `backend.run(...).result().get_counts()` works everywhere. | Do NOT use Sampler-based qiskit-machine-learning components (SamplerQNN, default FidelityQuantumKernel) on the IonQ path. Use `backend.run(list_of_circuits)` + counts, which is the simplest reliable option. |
| Files: at most **100 files, 2 MB each**, 200 MB per account. A data file loads only if its path appears as a **literal string** in the Python code. | The precomputed fallback JSON must be under 2 MB and referenced as a literal path, e.g. `"data/precomputed_run.json"`. Plotly (4.8 MB min) cannot be bundled. |
| Browser needs **WebAssembly JSPI**: recent Chrome/Edge/Opera, Firefox 153+. Safari is not listed. | Record and demo in Chrome. Say so in the README. |
| A top-level `README.md` in an upload **becomes the project write-up** (max 65,000 chars). Upload accepts a folder or a `.zip`; a single wrapping folder is stripped. | Write the README with this in mind. Publish via zip upload of a `qollab/` build folder. |
| Backend | Kind | Qubits | Where | Cost |
|---------|------|--------|-------|------|
| Built-in simulator (Qiskit `BasicSimulator`) | Ideal | 24 | Browser | Free |
| AWS Braket local simulator | Ideal | 25 | Browser | Free |
| IBM Boston/Kingston/Fez/... (Aer + fake-backend noise) | Noise model | 120–156 | Browser | Free |
| IonQ Aria 1 / Aria 2 (remote sim; hardware retired) | Noise model | 25 | IonQ cloud | Free |
| **IonQ Forte 1 / Forte Enterprise 1 (remote sim)** | Noise model | 29 | IonQ cloud | Free |
| IonQ Forte 1 / Forte Enterprise 1 (QPU) | Hardware | 36 | IonQ hardware | Credits |
## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Python | **3.13** locally (Qollab runs 3.14 on Pyodide) | Pipeline language | 3.13 has wheels for the whole stack, including qiskit-aer 0.17.2, and was tested here. 3.14 would match Qollab exactly and also has wheels. **The machine's system Python is 3.9.6, which is too old** (Qiskit 2.x needs ≥3.10, NumPy 2.5 needs ≥3.12). Install via `uv`. | HIGH |
| qiskit | **2.5.2** (pin `qiskit>=2.5.2,<3.0.0`) | Circuits, transpiler, primitives, quantum_info | Qollab adds exactly `qiskit>=2.5.2,<3.0.0` when requirements.txt omits it. Using the same pin locally gives parity. Required by hackathon rules. | HIGH |
| qiskit-aer | **0.17.2** | Fast local simulation (statevector + noise models) for development and training | The same version Qollab ships in its PQCA bundle. Works with Qiskit 2.5.2 (tested). Use **locally only**. On Qollab, use the injected `backend`. | HIGH |
| qiskit-ionq | **1.1.1** locally (Qollab's docs mention 1.0.2 on the platform) | IonQ provider | Only needed locally to type-check behavior and set `IonQTranspileLevelWarning` expectations. You have **no IonQ API key**, so local runs against IonQ are impossible; Qollab is the only IonQ path. Backend names resolve to `ionq_simulator` (29 qubits) and `ionq_qpu.forte-1` (36 qubits) (tested). | HIGH |
| numpy | **2.4.x** for parity (Pyodide ships 2.4.6; PyPI latest is 2.5.3) | Arrays, FFT, least squares | Ships with Pyodide, so it needs no listing on Qollab. Pin `<2.5` locally so you don't use an API Pyodide lacks. | HIGH |
| scipy | **1.18.x** (Pyodide 1.18.0) | `scipy.signal` (Butterworth/notch filters, `savgol_filter`), `scipy.optimize` (COBYLA/L-BFGS for circuit training), `scipy.ndimage.gaussian_filter` (synthetic anomaly map), `RegularGridInterpolator` (map lookup) | One library covers the synthetic map, the classical filters, the optimizer, and map interpolation. Ships with Pyodide. | HIGH |
| scikit-learn | **1.8.x** (Pyodide 1.8.0; PyPI latest 1.9.1) | Ridge regression for the Tolles-Lawson-style classical baseline, `KernelRidge(kernel="precomputed")` if you take the quantum-kernel route, metrics | Ships with Pyodide. Pin `<1.9` for parity. | HIGH |
| React | **19.3.0** | UI | User preference. Bundles fine into a single ES module for Qollab (tested). | HIGH |
| Vite | **8.3.4** + `@vitejs/plugin-react` **6.1.2** | Dev server + build to a single `main.js`/`main.css` | Library mode with `formats:['es']`, `fileName:'main.js'`, `cssFileName:'main'`, and `external: [/^magnav(\..+)?$/]` produces exactly what Qollab loads (tested: 758 kB unminified, 190 kB gzip, well under the 2 MB cap). | MEDIUM (works locally; confirm on Qollab in Phase 1) |
### Supporting Libraries
| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| recharts | **3.10.1** | Raw vs classical vs quantum time-series panel, error bars | Declarative React SVG charts, quick to build. SVG makes the charts easy to label for accessibility. **Downsample to ≤ ~2,000 points per series** because SVG slows down past that. | HIGH |
| d3-scale + d3-scale-chromatic | **4.0.2** + **3.1.0** | Colormap for the anomaly-map heatmap (use `interpolateCividis` or `interpolateViridis`, which are colorblind-safe and perceptually uniform) | Draw the map on `<canvas>` from a Float32 grid that Python returns. Overlay the true path, estimated path, and drone in an absolutely positioned `<svg>`. | HIGH |
| qiskit-machine-learning | **0.9.1** (Qollab Libraries toggle pins this exact version) | Optional: `FidelityStatevectorKernel` for local kernel computation, optimizers | **Optional.** Use it only for local/statevector work. Its Sampler-based QNNs and kernels **break silently on IonQ** (see above), and `TorchConnector` is unusable because torch is not in Pyodide. A hand-rolled circuit + `scipy.optimize` is less code than adapting QML to the one-job rule. | HIGH (facts) / opinion |
| matplotlib | 3.10.x (Pyodide) | Figures for the write-up and console output on Qollab (`plt.savefig` offers a download) | README figures and the notebook-style evidence. Not used in the React UI. | HIGH |
| FastAPI + uvicorn | **0.143.0** + **0.54.0** | **Local dev harness only**: `POST /api/run` returns the same JSON the Pyodide bridge returns, so `vite dev` can hit real Python with hot reload | Optional. Plain JSON endpoints only, **no WebSocket/SSE**, since that path doesn't exist on Qollab. If short on time, skip it and develop the UI against `data/precomputed_run.json`. | HIGH (versions) |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| uv **0.13.0** | Python install + venv + pip | `uv python install 3.13`, `uv venv`, `uv pip install -r requirements-dev.txt`. Solves the system-Python-3.9 problem in one command. Node 24.20 is already installed. |
| pytest **9.1.1** | Pipeline unit tests (map generation, noise injection, Kalman, matcher, quantum module with `AerSimulator`) | One test should assert **`backend.run` is called exactly once** per quantum inference. That guards the IonQ one-job rule. |
| ruff **0.17.0** | Lint/format Python | Zero-config. |
| eslint **10.x** + eslint-plugin-jsx-a11y **6.10.2** | Catch accessibility mistakes (labels, roles, keyboard handlers) | Accessibility is a submission requirement. This is a cheap automated check. |
| Chrome (JSPI) | Qollab runtime + demo recording | Firefox needs 153+. Safari is unsupported. |
## Installation
# Python (system python is 3.9.6, so use uv)
# requirements-dev.txt (local only)
# optional: "qiskit-machine-learning==0.9.1"
# qollab/requirements.txt (what ships to Qollab; no env markers, no pip flags allowed)
# numpy/scipy/scikit-learn/matplotlib load from Pyodide automatically, so don't list them
# do NOT list qiskit-aer or qiskit-ionq: the runtime injects `backend`
# Frontend
### Packaging for Qollab (tested build config)
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Qollab **JS project** (React bundle + Python modules via Pyodide) | Qollab **Python project** (`main.py`, console + matplotlib output only) | A fallback if the React bundle fails on Qollab. A `main.py` that runs the pipeline, prints metrics, and `plt.savefig`s the map and traces still satisfies "runnable on Qollab". **Keep `magnav/` importable from a `main.py` too**, so this fallback costs about 20 lines. |
| Hand-rolled parameterized circuit + `scipy.optimize` (train on statevector), one batched `backend.run` for inference | qiskit-machine-learning `EstimatorQNN`/`VQR`/`NeuralNetworkRegressor` | When training happens only locally and you want the QML API for the write-up. Don't let QML objects touch the IonQ backend: they issue multiple primitive calls, and Sampler-based ones return zeros on IonQ. |
| Quantum reservoir / fixed feature-map + classical ridge readout (train only the readout) | Full VQC training | A reservoir approach needs **no quantum training loop at all**. Training is classical ridge on quantum features, and inference is one batched job. It fits the one-job-per-run rule best. Full VQC training is fine locally but harder to explain and to make beat the baseline. |
| `backend.run(circuits, shots=N)` + `get_counts()` | `BackendEstimatorV2` | Estimator works on IonQ (one call per run, all PUBs in that one call). Use it if you prefer `<Z>` expectations without parsing counts. Counts are more transparent and work identically on every backend. |
| recharts | visx 4.0 / ECharts 6.1 / uPlot 1.6 | uPlot if you need 10k+ point traces at 60 fps (canvas, about 50 kB). ECharts (1.1 MB) if you want canvas plus built-in heatmaps in one library. visx if you want low-level D3-style control. |
| Canvas heatmap + SVG overlay (custom, ~100 lines) | deck.gl 9.4 / react-leaflet 5.0 | Only if you switch to real lat/lon data (EMAG2) on a basemap. Basemap tiles need network access and add weight. On a synthetic km grid they add nothing. |
| Client-side animation of a precomputed trajectory | FastAPI WebSocket / SSE (sse-starlette 3.5) | Only for a locally hosted demo outside Qollab. Not possible in the Qollab sandbox. |
| Ridge-based Tolles-Lawson + a hand-written 1D/2D Kalman in numpy (~40 lines) | filterpy | filterpy is **sdist-only (last release 2018) and not in Pyodide**, so it **will not install on Qollab**. A constant-velocity Kalman in numpy is short and shows your own work. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `qiskit.execute`, `qiskit.algorithms`, `qiskit.opflow`, `qiskit-aqua`, `qiskit-ibmq-provider` / `IBMQ` | Removed (execute/opflow/algorithms in Qiskit 1.0) or dead packages. Tutorials using them won't import on Qiskit 2.5. | `backend.run` / primitives V2; `qiskit-algorithms` 0.4.0 only if truly needed |
| V1 primitives (`qiskit.primitives.Sampler`, `Estimator`, `BackendSampler`, `BackendEstimator`), `BackendV1`, `qiskit.pulse`, `assemble`/Qobj | Removed in Qiskit 2.0 (MEDIUM confidence on exact removal list: training data plus the fact that all current packages require qiskit>=2.0) | `StatevectorEstimator`/`StatevectorSampler` locally, `BackendEstimatorV2`, `backend.run` |
| `BackendSamplerV2` (and anything built on it) **on IonQ backends** | Silently returns all-`0` bitstrings because qiskit-ionq returns no memory (Qollab docs) | `backend.run(...).result().get_counts()` |
| Any loop that calls `backend.run`/Estimator more than once per run | IonQ on Qollab rejects the second job: "only one job is allowed per code run" | Build every inference circuit up front and submit them as **one list** in one `backend.run` |
| Constructing `IonQProvider(...)`, `AerSimulator()` etc. inside code shipped to Qollab | Qollab ignores the visitor's QPU choice. There is no API key in the browser, and Aer isn't loaded unless requested. | Accept `backend` as a function argument and inject `AerSimulator()` only in local tests |
| qiskit-ibm-runtime | Targets IBM Quantum Platform. Irrelevant for IonQ, and the IBM noise models on Qollab are already provided in-browser. | Nothing |
| filterpy, torch, numba, or any package without a pure-Python wheel or Pyodide build | Install fails on Qollab: "Could not install every package listed in requirements.txt" | numpy/scipy/sklearn implementations |
| plotly.js / react-plotly.js | 4.8 MB minified exceeds Qollab's **2 MB per-file** cap when bundled. Loading it from a CDN URL works but is heavy and network-dependent. | recharts + canvas |
| WebSocket / SSE / Flask-SocketIO streaming | No server on Qollab, and WebSocket is blocked in the sandbox | Python returns arrays and JS animates them |
| `transpile(..., optimization_level=2/3)` before IonQ | Triggers `IonQTranspileLevelWarning`. IonQ re-synthesizes anyway, so aggressive pre-optimization can hurt. | Don't transpile for IonQ, or use `optimization_level=1`. Do transpile for the built-in/IBM simulators if you use `PauliEvolutionGate`. |
| Deep circuits / >~12 qubits / >1000 shots on the IonQ remote simulator | Per-shot noise simulation, plus `SimulationTimeout`, `TooManyGates`, `TooLongPredictedExecutionTime` risks | 4–8 qubits, shallow (≤ ~3 entangling layers), 200–500 shots, all circuits in one job |
| Building paths with f-strings for data files (`open(f"data/{x}.json")`) | Qollab only preloads files whose path appears as a literal string | `PRECOMPUTED = "data/precomputed_run.json"` |
## Stack Patterns by Variant
- Replace the bundled React with CDN imports (`import React from 'https://esm.sh/react@19.3.0'`), or
- Fall back to a **Python project** (`main.py` + matplotlib figures + printed metrics) for the Qollab submission, and host the React UI separately (e.g. GitHub Pages pointing at precomputed JSON) as the demo-video visual.
- The reason: "published and runnable on Qollab" beats "pretty". Keep the Python core runtime-agnostic so either shell works.
- Encode a sliding window of k raw samples plus 1–2 nuisance features (simulated motor current/RPM) into 4–6 qubits (angle encoding + a fixed entangling layer, optionally a re-upload). Measure all qubits. Features = single-qubit `<Z>` and `<ZZ>` correlators from counts. Train a ridge readout classically.
- On Qollab: precompute training features with the **built-in simulator or statevector** (free, unlimited jobs). For the IonQ run, submit **one job** of ~32–128 window circuits for a demo segment, then compare that segment's error against the classical baseline.
- Training kernel by `FidelityStatevectorKernel` locally (exact). IonQ inference needs N_test × N_train fidelity circuits. Keep N_train ≤ 16 and N_test ≤ 8, so ≤128 circuits in one job. Compute fidelities from the all-zeros count frequency.
- Same single batched job, selected as "IonQ Forte 1 (Quantum computer)" in the dialog. Use ≥500 shots so debiasing applies. Save the counts to `data/forte_hardware_run.json`, and show them through a recorded-result selector (Qollab's own "Quantum Hackathon Soundtrack" project uses this pattern).
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| qiskit 2.5.2 | qiskit-aer 0.17.2, qiskit-ionq 1.1.1, qiskit-machine-learning 0.9.1 | **Tested together** on Python 3.13 (2026-10-09): all import; batched 64-circuit runs on BasicSimulator/AerSimulator work; `BackendEstimatorV2(AerSimulator())` works with parameter sweeps. |
| qiskit-machine-learning 0.9.1 | qiskit>=2.0, numpy>=2.0, scikit-learn>=1.2 | Also requires `dill`, `setuptools` (pure Python, fine in Pyodide). torch extra not available in Pyodide. |
| qiskit-ionq 1.1.x | qiskit>=2.0 | Qollab's docs say the platform uses 1.0.2. Don't rely on 1.1-only features like `memory=True` on Qollab. |
| numpy 2.4.x / scipy 1.18.x / scikit-learn 1.8.x | Pyodide 314.0.x (Python 3.14.2) | These are the exact families Pyodide ships. PyPI has newer (numpy 2.5.3, sklearn 1.9.1). **Pin locally to the Pyodide families** to avoid "works locally, fails on Qollab". |
| numpy 2.5.x | Python ≥3.12 | Another reason system Python 3.9 can't be used. |
| react-dom 19.3 | recharts 3.10.1 (peer ^19), react-leaflet 5.0 (peer ^19) | OK |
| @vitejs/plugin-react 6.1.2 | vite ^8.0.0 | Vite 8 uses Rolldown. Lib mode output was not whitespace-minified in the test (758 kB). That's fine under the 2 MB cap. Switch to app mode with `rollupOptions.output.entryFileNames:'main.js'` if you want smaller output. |
| Qollab runtime | Chrome/Edge/Opera current, Firefox ≥153 | Requires WebAssembly JSPI |
## Qollab Submission Format: Verified vs. Still Unknown
## Sources
- https://qollab.xyz/learn/docs/runtime-environment: Pyodide/Python 3.14, JS vs Python project, injected `backend`, one-job-per-run on IonQ, requirements.txt rules, network/WebSocket restrictions, 2 MB/100-file limits, literal data paths, JSPI (HIGH)
- https://qollab.xyz/learn/docs/js-qiskit-projects: `callPromising`, `.toJs()`, `callKwargs`, no `new` (HIGH)
- https://qollab.xyz/learn/docs/compute-backends: backend list, qubit ceilings (24/25/29/36), free vs credits (HIGH)
- https://qollab.xyz/learn/docs/primitives: BackendSamplerV2 broken on IonQ, BackendEstimatorV2 works (HIGH)
- https://qollab.xyz/learn/docs/transpilation, /how-your-circuit-is-compiled, /ideal-vs-noise-model-simulators, /error-mitigation, /error-reference, /upload-your-files, /publish, /python-qiskit-projects (HIGH)
- Participant Plan PDF (local copy in ~/Downloads): submission checklist, "test locally to stay off shared queue" (HIGH)
- PyPI JSON API (2026-10-09): qiskit 2.5.2, qiskit-aer 0.17.2, qiskit-machine-learning 0.9.1, qiskit-ionq 1.1.1, qiskit-ibm-runtime 0.50.0, numpy 2.5.3, scipy 1.18.1, scikit-learn 1.9.1, filterpy 1.4.5 (2018, sdist only), fastapi 0.143.0, uvicorn 0.54.0 (HIGH)
- Pyodide lock file (pyodide 314.0.7 on jsDelivr): Python 3.14.2, numpy 2.4.6, scipy 1.18.0, scikit-learn 1.8.0, matplotlib 3.10.8, no filterpy/torch (HIGH)
- npm registry (2026-10-09): react 19.3.0, vite 8.3.4, @vitejs/plugin-react 6.1.2, recharts 3.10.1, d3-scale 4.0.2, d3-scale-chromatic 3.1.0, plotly.js-dist-min 4.8 MB (HIGH)
- qiskit-ionq README (PyPI): provider usage, `noise_model`, `memory`, `dry_run`, transpilation guidance (HIGH)
- Local verification in scratchpad: uv + Python 3.13 install of the full stack; batched-circuit and estimator smoke test; IonQ backend name resolution; Vite 8 lib-mode build to single main.js with external `magnav.api` (HIGH for local behavior)
- Qiskit 2.0 removals (V1 primitives, BackendV1, pulse, Qobj): training data, consistent with package metadata (MEDIUM)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

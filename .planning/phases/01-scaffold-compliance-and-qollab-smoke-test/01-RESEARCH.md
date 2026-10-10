# Phase 1: Scaffold, Compliance and Qollab Smoke Test - Research

**Researched:** 2026-10-09
**Domain:** Qollab.xyz JS-project runtime (Pyodide + in-page Qiskit), Vite 8 lib-mode packaging, uv Python env, hackathon compliance
**Confidence:** HIGH for documented Qollab rules, local build, and env (verified this session). MEDIUM for "does a React bundle run inside the Qollab iframe" (consistent with the docs, but only the human smoke test can prove it).

## Summary

Qollab's docs (fetched directly this session) answer most of the contract questions. A project with top-level `index.html` + `main.js` is a JS project. `index.html` is body-only, `<script>` tags do not run, and `main.css` is the only stylesheet. `main.js` imports Python modules by dotted name (`import * as api from 'magnav.api'`) and calls them with `api.fn.callPromising(backend, ...args)`. A plain call fails on IonQ with a `ConnectionError` saying XHR is not supported. `backend` is pre-created and injected. It is the provider's real backend object (Qiskit `BasicSimulator` for the built-in simulator, `IonQProvider` backends for IonQ). IonQ backends accept exactly one job per run, and a second job stops the run with "only one job is allowed per code run". Uploads accept a folder or a zip (a single wrapping folder is stripped). The limits are 100 files and 2 MB per file. A top-level `README.md` is **not stored as a file**: it becomes the project write-up, and it is **skipped** when files are added to an existing project later. Publishing creates an immutable version at a stable URL `qollab.xyz/u/<user>/<project>`, with up to 10 publishes per hour. Later phases republish to the same URL.

I verified locally in this session: (1) `uv sync` on CPython 3.13.16 with the pyproject below resolves exactly qiskit 2.5.2, numpy 2.4.6, scipy 1.18.1, scikit-learn 1.8.0, qiskit-aer 0.17.2, qiskit-ionq 1.1.1. (2) A Vite 8.3.4 lib-mode build with `outDir: '..'` writes a single `main.js` (ES module, first line `import * as e from "magnav.api";`, zero `export` statements, ~298 kB for a React smoke page) plus `main.css` into the repo root. `publicDir: false` keeps `web/public` out of the root. (3) A dev-server alias swaps `magnav.api` for a JS stub, so the UI runs locally without Pyodide. (4) `result.get_counts()` returns a **list** of dicts for a multi-circuit job but a **single** `Counts` for a one-element list, so always index with `get_counts(i)`. (5) The IonQ backend names are `ionq_simulator` (29 qubits, `options.noise_model` = `'ideal'` or `'forte-1'`) and `ionq_qpu.forte-1` (36 qubits). `BasicSimulator.name` is `basic_simulator`.

Two environment gaps: **`uv` is not installed on PATH** (system Python is 3.9.6, no Homebrew), and the repo has **no git remote** yet, while a code-repository link is a submission requirement. Two things only the human can establish: whether interactive button clicks inside the Qollab iframe can trigger a job after the page has loaded, and whether a logged-out visitor can *run* (docs list "Can't run quantum jobs as an anonymous user at the moment" as a possible message). The plan must end at a human checkpoint with a findings template.

**Primary recommendation:** Make the repo root the Qollab project root. React source goes in `web/`, and Vite builds `main.js`/`main.css` into the root, where they are committed. Python lives in `magnav/` with `api.py` as the only JS-facing module, and every function returns a `json.dumps(...)` string. A `scripts/package_qollab.sh` allowlist-zips the runtime files into `dist/qollab-upload.zip`. The smoke page submits one batched Bell job when the user clicks, with a selectable circuit count (2/32/64/128) and shot count. Ship a `main.py` Python-project fallback in a second zip for probing if the JS page fails.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
(CONTEXT.md has no `## Decisions` section with locked choices. It has an infrastructure-phase discretion grant plus mandatory manual steps, reproduced verbatim below.)

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow `.planning/research/STACK.md` (verified against Qollab's runtime docs) for the folder layout, Vite config (`external: [/^magnav(\..+)?$/]`), pins, and the list of things that do not work on Qollab (WebSocket/XHR/POST/workers, filterpy/plotly/torch, second `backend.run`, `BackendSamplerV2`).

### Manual steps the builder must perform (Claude cannot do these)
- Upload the smoke-test project to Qollab.xyz, press Run with **IonQ Forte 1 (Remote simulator)** selected, and report what happened.
- Run the 32/64/128 circuit probe on Qollab and paste results into the findings file.
- Publish the smoke test and open it from a logged-out browser.
- Ask in the hackathon `#hackathon-help` Slack whether credits cover one real hardware run.
Plans should produce everything needed for these steps (a zip or folder ready to upload, exact click-by-click instructions, and a findings template with blanks), then stop at a human checkpoint rather than claiming the Qollab run passed.

### Specific Ideas (from CONTEXT.md)
- The local scratchpad research already produced a working Vite lib-mode config and a 758 kB bundle (see STACK.md); reuse that config rather than re-deriving it.
- Keep a `main.py` Python-project entry alive from this phase as the fallback submission format if the React bundle fails inside Qollab's sandbox.
- Findings file lives at `docs/QOLLAB_FINDINGS.md` (or similar) and is referenced by later phases when sizing the quantum job.

### Deferred Ideas (OUT OF SCOPE)
None — infrastructure phase. (Also out of this phase: any simulation, denoising, navigation or product UI code.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAT-01 | Qollab JS project (`index.html` + single `main.js`/`main.css` + `magnav/` + `requirements.txt` + `data/`) running in-browser | File contract (§Architecture Pattern 1), verified Vite config (§Code Examples), allowlist zip (§Pattern 4), literal data path rule (§Pitfall 6) |
| PLAT-02 | Smoke test: bundled React page → in-page Python → one batched `backend.run` Bell job on IonQ Forte 1 remote sim; findings recorded | `magnav/api.py` pattern (§Code Examples), click-to-submit design (§Pattern 3), counts-shape pitfall, error names, human checklist + findings template (§Human Checkpoint) |
| PLAT-03 | Python 3.13 via uv, pins match Pyodide | Verified `pyproject.toml` + `uv sync` output (§Standard Stack, §Code Examples); uv missing on PATH (§Environment) |
| PLAT-04 | MIT LICENSE, verbatim attribution, Quantum Impact tag, AI/library disclosure, committed in phase 1 | Compliance checklist with exact text and verified licenses (§Compliance Checklist) |
| PLAT-05 | All code written during build window | Existing commits dated 2026-10-09 22:58–23:21 PDT, after the 4:00 PM PDT kickoff (verified `git log`); no templates or prior code; disclosure states this (§Compliance) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Frontend is JavaScript (React + Vite). Backend is Python. **All quantum code goes through Qiskit.**
- Quantum runtime: IonQ simulator via Qollab for the submitted run. Locally, Aer/BasicSimulator only. Real hardware at most once.
- Licensing: MIT license, the attribution line, and disclosure of all AI tools and libraries. Missing any of these risks disqualification.
- Originality: all code written during the build window. No prior work reused.
- Accessibility: the UI must follow accessibility best practices. This applies even to the smoke page: semantic `<button>`, `aria-live` status, visible focus.
- Demo reliability: a precomputed fallback is required (later phases). In Phase 1, the `main.py` fallback serves the same role.
- Do not use: `qiskit.execute`, V1 primitives, `BackendSamplerV2` on IonQ, a second `backend.run` per run, constructing `IonQProvider`/`AerSimulator` in shipped code, `transpile(optimization_level>=2)` for IonQ, WebSocket/XHR/POST/workers, filterpy/plotly/torch, f-string data paths.
- GSD workflow: repo edits go through GSD commands (the executor runs under `/gsd-execute-phase`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page rendering, controls, status display | Browser / Client (React bundle `main.js` in Qollab sandboxed iframe) | — | Qollab JS project: page renders above the console |
| Circuit construction, transpile, single `backend.run`, counts parsing | Browser / Client (Pyodide, `magnav/api.py`) | IonQ cloud (job execution) | All Python runs in Pyodide. Only the quantum job leaves the browser |
| Backend selection | Qollab platform (Select QPU dialog) | — | `backend` is injected. Code must never choose it |
| Data files (`data/*.json`) | Pyodide in-memory FS (preloaded by literal path) | — | JS cannot `fetch` project files. Python reads them and returns them to JS |
| Build/packaging | Local dev machine (Vite, zip script) | — | Qollab has no build step. The built artifacts are uploaded |
| Compliance artifacts | Repo + Qollab Project Card (write-up, Tags, Links) | — | README becomes the write-up. Tags and repo link are set manually in the sidebar |

## Standard Stack

### Core (versions verified this session)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Python (CPython via uv) | 3.13.16 | Local runtime | Has wheels for the whole stack. Qollab runs 3.14 on Pyodide, and 3.13 code runs there [VERIFIED: local `uv sync`] |
| qiskit | 2.5.2 (`>=2.5.2,<3.0.0`) | Circuits, transpile | The exact line Qollab auto-adds [CITED: qollab.xyz/learn/docs/runtime-environment] [VERIFIED: uv resolve] |
| numpy | 2.4.6 (`>=2.4,<2.5`) | Arrays | Pyodide family parity [VERIFIED: uv resolve; STACK.md Pyodide lock] |
| scipy | 1.18.1 (`>=1.18,<1.19`) | Later phases | Pyodide ships 1.18.0 [VERIFIED: uv resolve] |
| scikit-learn | 1.8.0 (`>=1.8,<1.9`) | Later phases | Pyodide ships 1.8.0 [VERIFIED: uv resolve] |
| react / react-dom | 19.3.0 | Smoke page UI | [VERIFIED: npm view] |
| vite | 8.3.4 | Lib-mode build to single `main.js` | [VERIFIED: npm view + local build] |
| @vitejs/plugin-react | 6.1.2 | JSX transform | [VERIFIED: npm view + local build] |
| uv | 0.13.0 | Python install + lock + sync | [VERIFIED: ran 0.13.0 from scratch venv; not on PATH] |

### Supporting (dev group only, never shipped to Qollab)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| qiskit-aer | 0.17.2 | Local AerSimulator for tests | Same version as Qollab's PQCA bundle |
| qiskit-ionq | 1.1.1 | Inspect IonQ backend names/options offline (no API key, so cannot submit) | Optional parity checks. Qollab's own qiskit-ionq version is unknown (docs don't state it) |
| matplotlib | 3.10.9 | Later figures | dev |
| pytest | 9.1.1 | Tests | dev |
| ruff | 0.17.0 | Lint/format | dev |

Phase 1 needs no recharts or d3. Add them in Phase 3, not now, so the smoke bundle stays minimal.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Repo root = Qollab root | `qollab/` build subfolder | A subfolder duplicates `magnav/` (copy step) or needs symlinks that zip may not follow. A root layout with an allowlist zip avoids both |
| JSON-string returns from Python | PyProxy + `.toJs({dict_converter: Object.fromEntries})` | Proxies must be `destroy()`ed or they leak [CITED: pyodide.org type-conversions]. They also differ from the local stub/FastAPI shape. JSON strings convert implicitly |
| `uv` project (`pyproject.toml` + `uv.lock`) | `uv venv` + `requirements-dev.txt` (STACK.md) | The success criterion says `uv sync`, which needs a pyproject. Use the project form |

**Installation:**
```bash
# uv (not on PATH; no Homebrew on this machine)
curl -LsSf https://astral.sh/uv/install.sh | sh     # installs to ~/.local/bin (already on PATH: gh lives there)
# fallback: python3 -m pip install --user uv
uv python install 3.13
uv sync                      # reads pyproject.toml + .python-version, creates .venv, writes uv.lock

# frontend
cd web && npm install        # package.json pins exact versions below
```

## Package Legitimacy Audit

slopcheck 0.x ran via `slopcheck scan` on a manifest containing every package in this phase.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| react, react-dom | npm | 12+ yrs | very high | github.com/facebook/react | [OK] | Approved (no postinstall) |
| vite | npm | 6+ yrs | very high | github.com/vitejs/vite | [OK] | Approved (no postinstall) |
| @vitejs/plugin-react | npm | 5+ yrs | very high | github.com/vitejs/vite-plugin-react | [OK] | Approved (no postinstall) |
| qiskit, qiskit-aer, qiskit-ionq | PyPI | multi-year | high | github.com/Qiskit, github.com/qiskit-community/qiskit-ionq | [OK] | Approved |
| numpy, scipy, scikit-learn, matplotlib | PyPI | 15+ yrs | very high | official orgs | [OK] | Approved |
| pytest, ruff | PyPI | multi-year | very high | pytest-dev, astral-sh | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
 Builder (local)                                   Qollab.xyz (visitor's Chrome tab)
 ───────────────                                   ─────────────────────────────────
 web/src/*.jsx ──vite build──▶ main.js, main.css    Visitor presses Run ─▶ Select QPU dialog
 magnav/*.py, data/*.json, index.html,                    │ (Built-in sim | IonQ Forte 1 remote sim | QPU)
 requirements.txt, LICENSE, README.md                     ▼
        │                                          runtime injects `backend`, installs requirements.txt
 scripts/package_qollab.sh (allowlist)                    ▼
        ▼                                          index.html (body) + main.css ─▶ sandboxed iframe page
 dist/qollab-upload.zip ──human upload──▶ project         ▼
                                                   main.js (React) renders controls (no job yet)
 Local dev: vite dev ─alias─▶ magnavApiStub.js             │ user clicks "Submit one job (N circuits × S shots)"
 Local tests: pytest ─▶ magnav.api(BasicSimulator)         ▼
                                                   api.run_bell_batch.callPromising(backend, N, S)
                                                          ▼  (Pyodide, JSPI)
                                                   build N Bell circuits ─▶ transpile(opt=1) ─▶ ONE backend.run(list, shots=S)
                                                          │                                  │
                                                          │                     IonQ cloud (remote sim) / browser (built-in)
                                                          ▼                                  │
                                                   result.get_counts(i) for i in range(N) ◀──┘
                                                          ▼
                                                   json.dumps({backend, counts, timing, ok/err}) ─▶ JS string
                                                          ▼
                                                   React renders counts + backend name; button locks (one job/run)
```

### Recommended Project Structure
```
/ (repo root == Qollab project root)
├── index.html              # body-only: <div id="root"></div> plus a short static line shown until React mounts
├── main.js                 # BUILT by Vite (committed). Never hand-edit
├── main.css                # BUILT by Vite (committed)
├── main.py                 # Python-project fallback (ignored by Qollab while index.html+main.js exist)
├── requirements.txt        # exactly: qiskit>=2.5.2,<3.0.0
├── LICENSE                 # MIT, "Copyright (c) 2026 Eason Ha"
├── README.md               # becomes Qollab write-up; attribution, theme, disclosure
├── magnav/
│   ├── __init__.py         # keep empty/light (imported on every magnav.* import)
│   └── api.py              # ONLY JS-facing module; returns JSON strings
├── data/
│   └── smoke.json          # tiny file, read via literal path to prove data/ loading
├── docs/
│   └── QOLLAB_FINDINGS.md  # template with blanks; human fills it
├── scripts/
│   └── package_qollab.sh   # build + allowlist zip + limit checks
├── tests/
│   ├── test_api_smoke.py   # BasicSimulator/Aer: one run call, counts shape, JSON contract
│   └── test_qollab_contract.py  # static checks on index.html, main.js, requirements.txt, sizes
├── web/                    # frontend SOURCE (not uploaded)
│   ├── package.json, package-lock.json, vite.config.js
│   ├── index.html          # dev-only shell with <script type=module src=/src/main.jsx>
│   └── src/ main.jsx, App.jsx, bridge.js, app.css, dev/magnavApiStub.js
├── pyproject.toml, uv.lock, .python-version (3.13)
└── .gitignore              # .venv/, web/node_modules/, dist/, __pycache__/, .pytest_cache/, .ruff_cache/, .DS_Store
```
Do **not** gitignore `main.js`/`main.css`. They are the shipped artifact, and anyone cloning the repo link should be able to upload it without a build.

### Pattern 1: Qollab JS-project file contract (verified rules)
- Runtime type is decided at each Run from **top-level** files: `index.html` + `main.js` → JS project; else `main.py` → Python project. If all three are present, it runs as JS [CITED: runtime-environment].
- `index.html`: body content only. `<html>/<head>/<body>` are dropped and `<script>` does not run [CITED: runtime-environment].
- `main.css`: optional, and the only stylesheet loaded. Other `.css`/`.html` files are not loaded [CITED].
- `main.js`: ES module semantics. Top-level `await` works. It can import `./`/`../` JS files, Python modules by dotted name, `three`/`postprocessing` by name, and anything else by full URL [CITED: runtime-environment, js-qiskit-projects].
- Python import: `import * as api from 'magnav.api'` (named or namespace only, since a default import gives `undefined`). Call with `api.fn.callPromising(...args)` or `.callPromisingKwargs(...)` [CITED: js-qiskit-projects].
- `backend` is available in `main.js` and any JS file it imports [CITED]. Whether it is a true global (`globalThis.backend`) or a lexical binding is **not documented**. Read it with `typeof backend !== 'undefined' ? backend : (globalThis.backend ?? null)`. I verified this survives the Rolldown build unchanged.
- Python packages used only from JS must still be listed in `requirements.txt` (qiskit is auto-added anyway) [CITED].
- Return values: Python `str/int/float/bool` convert to JS primitives implicitly. Other objects arrive as PyProxy, which needs `.toJs()` and must be destroyed to avoid leaks [CITED: pyodide.org/en/stable/usage/type-conversions.html].
- `console.log` prints objects as `[object Object]`, so wrap them in `JSON.stringify` [CITED].

### Pattern 2: Python API returns JSON strings; `backend` always a parameter
`magnav/api.py` functions take `backend` first, never construct one, call `backend.run` at most once, and return `json.dumps(payload)`. JS does `JSON.parse(await api.fn.callPromising(backend, ...))`. The same contract serves the local stub (Phase 1) and an optional FastAPI harness later. Errors are caught and returned as `{"ok": false, "error_type": type(e).__name__, "error": str(e)}` so the page shows IonQ's CamelCase error name (`TooManyGates`, `TooLongPredictedExecutionTime`, `TooManyShots`, `SimulationTimeout`, ...) [CITED: error-reference].

### Pattern 3: Click-to-submit, one job per run, run kept alive
- On load, call `api.backend_info.callPromising(backend)`. This submits **no job** and returns the backend name, class, num_qubits, `options.noise_model`, `sys.version`, `sys.platform`, and the versions of qiskit/numpy/scipy, plus whether `import sklearn` succeeded without being listed. Display it.
- Controls: circuits ∈ {2, 32, 64, 128}, shots ∈ {100, 200, 500, 1024}. Default 2 × 200. One **Submit one job** button.
- After one submission on an IonQ backend (`backend.name.startswith('ionq')`), disable the button and announce via `aria-live`: "IonQ allows one job per run. Press Stop, then Run, to submit another." Local simulators allow unlimited jobs [CITED: compute-backends].
- Keep the run alive. Docs say there is no run time limit, that Stop ends a run, and that page state persists until Stop/reload [CITED: runtime-environment]. It is not documented whether the run ends when `main.js` top-level evaluation finishes. Belt and braces: at the end of `main.jsx`, `await` a promise that resolves only after the first job completes (or never, on local simulators). Clicks then happen inside a live run either way.
- Ordering check: alternate circuits are Φ+ (expect `00`/`11`) and Ψ+ (`x(1)` added, expect `01`/`10`). The API reports `ordering_ok` by checking each `get_counts(i)` dominant bitstrings. This proves per-circuit result ordering in multi-circuit IonQ jobs, which later phases rely on.
- Record `submit_to_result_s` wall time per job. This sizes the Phase 4 job.

### Pattern 4: Allowlist zip (repo root → upload)
`scripts/package_qollab.sh`: `npm --prefix web ci && npm --prefix web run build`, then `zip -X dist/qollab-upload.zip index.html main.js main.css main.py requirements.txt LICENSE README.md magnav/*.py data/*`. Then assert file count ≤ 100, each file < 2 MB, README < 65,000 chars, and that no `__pycache__` or `.DS_Store` is present. Zip from the root with no wrapping folder (Qollab would strip one anyway) [CITED: upload-your-files]. Also emit `dist/qollab-fallback-py.zip` **without** `index.html`/`main.js`, so it runs as a Python project (the `main.py` fallback/probe).

### Anti-Patterns to Avoid
- **Uploading the whole repo folder:** `web/node_modules` blows the 100-file limit, and the upload is refused entirely [CITED: upload-your-files].
- **Auto-submitting the Bell job on page load:** it consumes the single IonQ job, so the 32/64/128 probe would need a code edit and re-upload per size.
- **`def main(x: int = ...)` in `main.py` plus `if __name__ == "__main__": main()`:** Qollab auto-calls a valid `main()` after the script, and calling it yourself makes it run twice [CITED: runtime-environment]. In the fallback, guard with `if "backend" not in globals():` (local only), or avoid the auto-called signature.
- **Returning PyProxies (dicts/lists) to JS:** leaks, and needs `dict_converter`. Return JSON strings.
- **`globalThis.backend` only:** undocumented. Use the `typeof` guard.
- **Heavy imports in `magnav/__init__.py`:** every `magnav.*` import pays for them in Pyodide.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Python↔JS bridge | custom postMessage/HTTP layer | Qollab's dotted-name import + `callPromising` | Built into the runtime. HTTP POST/XHR/WebSocket are blocked |
| Backend selection/provider | `IonQProvider(...)`, `AerSimulator()` in shipped code | injected `backend` | Dialog choice is ignored otherwise, and there is no API key in the browser [CITED] |
| Bundling to one file | hand-concatenated scripts / CDN React | Vite lib mode (`formats:['es']`, external `magnav.*`) | Verified output shape |
| Python env/pins | system pip/venv | `uv python install 3.13` + `uv sync` | System Python is 3.9.6, too old for Qiskit 2.x |
| Counts aggregation | parsing `job.result().results[i].data` | `result.get_counts(i)` | Works on every provider. `BackendSamplerV2` returns all-zero bitstrings on IonQ [CITED: STACK.md/primitives doc] |

**Key insight:** In this sandbox, the platform already provides the bridge, the backend, and the Python runtime. Every custom layer either duplicates it or hits a blocked capability.

## Runtime State Inventory
Not a rename/refactor phase. Omitted.

## Common Pitfalls

### Pitfall 1: `get_counts()` return shape flips with circuit count
**What goes wrong:** `result.get_counts()` returns `list[dict]` for ≥2 circuits but a single `Counts` for a one-element list [VERIFIED locally with BasicSimulator].
**How to avoid:** Always `[dict(result.get_counts(i)) for i in range(len(circuits))]`.

### Pitfall 2: README.md is not a file on Qollab, and is skipped on later uploads
**What goes wrong:** On project creation, README becomes the write-up. When adding files to an existing project, `README.md` is **skipped**, so later README changes silently don't reach Qollab [CITED: upload-your-files].
**How to avoid:** The LICENSE must be its own file. The attribution line must also live in a stored file: put it in the React page footer (in `main.js`) and in README. Record in findings: "README updates = paste into write-up row manually."

### Pitfall 3: Second job on IonQ stops the run
**What goes wrong:** Any second `backend.run` (or Estimator call) errors with "only one job is allowed per code run" [CITED].
**How to avoid:** A single `backend.run(list)`. The page locks after one IonQ submission. A pytest spy asserts exactly one `run` call.

### Pitfall 4: Plain call instead of `callPromising`
**What goes wrong:** `api.fn(backend, ...)` works on the built-in simulator but fails on IonQ with a `ConnectionError` saying XHR is not supported [CITED: js-qiskit-projects].
**How to avoid:** Route every Python call through one `callPy(name, ...args)` helper in `web/src/bridge.js` that uses `.callPromising`. Test on IonQ, not only the built-in simulator.

### Pitfall 5: Logged-out visitors may not be able to run IonQ jobs
**What goes wrong:** Error reference lists "Can't run quantum jobs as an anonymous user at the moment" [CITED: error-reference]. A logged-out check may show the page but refuse Run.
**How to avoid:** Success criterion 3 only requires the project to *open* logged out. Record in findings: page opens? built-in sim runs logged out? IonQ runs logged out? The participant plan allows "a logged out browser **or a teammate's account**" for the run-through.

### Pitfall 6: Data file not preloaded
**What goes wrong:** Paths built with f-strings, `+`, or `os.path.join` aren't loaded and raise `OSError` [CITED].
**How to avoid:** `SMOKE_DATA = "data/smoke.json"` as a literal, relative to project root. JS cannot `fetch` project files.

### Pitfall 7: Vite copies `web/public` into the repo root / emits extra files
**What goes wrong:** With `outDir: '..'`, the default `publicDir` would copy into the root. Assets over the inline limit become separate files.
**How to avoid:** `publicDir: false`, `copyPublicDir: false`, `assetsInlineLimit: 100_000_000`, `cssCodeSplit: false`, `emptyOutDir: false` (never let Vite empty the repo root). Verified: only `main.js`/`main.css` are written.

### Pitfall 8: Lib mode does not replace `process.env.NODE_ENV`
**What goes wrong:** React's CJS entry references `process.env.NODE_ENV`, and `process` is undefined in the iframe.
**How to avoid:** `define: { 'process.env.NODE_ENV': JSON.stringify('production') }` (in the verified config).

### Pitfall 9: scikit-learn auto-loading unverified
**What goes wrong:** Docs say NumPy/SciPy/Matplotlib "load on import". scikit-learn is not named. STACK.md's claim that it needs no listing is unverified.
**How to avoid:** `backend_info` tries `import sklearn` in try/except and reports it. If it fails, Phase 2 adds `scikit-learn` to `requirements.txt`. Do not add it in Phase 1: CONTEXT fixes requirements.txt to the qiskit line.

### Pitfall 10: `uv` missing and Python 3.9 system default
**What goes wrong:** `uv sync` fails with command-not-found. `python3` is 3.9.6.
**How to avoid:** The first task installs uv. All Python commands go through `uv run ...`.

### Pitfall 11: Remote-sim job time scales with shots
**What goes wrong:** The IonQ noise-model sim runs one simulation per shot, which risks `TooLongPredictedExecutionTime`/`SimulationTimeout` [CITED: compute-backends, error-reference].
**How to avoid:** Probe at 100 shots for 32/64/128 circuits first. Then shots up to 1024 on 2 circuits. Record wall time.

## Code Examples

### `pyproject.toml` (verified: `uv sync` → qiskit 2.5.2, numpy 2.4.6, scipy 1.18.1, scikit-learn 1.8.0)
```toml
[project]
name = "magnav"
version = "0.1.0"
description = "Quantum-assisted magnetic anomaly navigation demo (Qollab x IonQ Hackathon)"
readme = "README.md"
license = "MIT"
requires-python = ">=3.13,<3.15"
dependencies = [
    "qiskit>=2.5.2,<3.0.0",
    "numpy>=2.4,<2.5",
    "scipy>=1.18,<1.19",
    "scikit-learn>=1.8,<1.9",
]

[dependency-groups]
dev = [
    "qiskit-aer==0.17.2",
    "qiskit-ionq==1.1.1",
    "matplotlib>=3.10,<3.11",
    "pytest>=9.1",
    "ruff>=0.17",
]

[tool.uv]
package = false

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```
Plus `.python-version` containing `3.13`. Parity check: `uv run python -c "import magnav.api; print(magnav.api.backend_info.__name__)"`.

### `requirements.txt` (shipped to Qollab)
```text
qiskit>=2.5.2,<3.0.0
```
No env markers, pip flags, or URLs (refused) [CITED]. Do not list qiskit-aer/qiskit-ionq.

### `web/vite.config.js` (verified build + dev alias this session)
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  publicDir: false,
  resolve: command === 'serve'
    ? { alias: { 'magnav.api': fileURLToPath(new URL('./src/dev/magnavApiStub.js', import.meta.url)) } }
    : {},
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: '..',                 // repo root == Qollab root
    emptyOutDir: false,           // NEVER empty the repo root
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    copyPublicDir: false,
    lib: { entry: 'src/main.jsx', formats: ['es'], fileName: () => 'main.js', cssFileName: 'main' },
    rollupOptions: { external: [/^magnav(\..+)?$/] },
  },
}));
```
`web/package.json`: `{"private":true,"type":"module","scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"19.3.0","react-dom":"19.3.0"},"devDependencies":{"vite":"8.3.4","@vitejs/plugin-react":"6.1.2"}}`. The verified build output starts with `import * as e from "magnav.api";` and contains 0 `export` lines (~298 kB, 77 kB gzip).

### `web/src/dev/magnavApiStub.js` (local, no Pyodide)
```js
const py = (impl) => ({ callPromising: async (...args) => impl(...args) });
export const backend_info = py(async () => JSON.stringify({ name: 'dev-stub', is_ionq: false, platform: 'browser-dev' }));
export const run_bell_batch = py(async (_backend, n, shots) => JSON.stringify({
  ok: true, backend: 'dev-stub', n_circuits: n, shots, ordering_ok: true,
  counts: Array.from({ length: n }, (_, i) => (i % 2 ? { '01': shots / 2, '10': shots / 2 } : { '00': shots / 2, '11': shots / 2 })),
}));
```

### `web/src/bridge.js`
```js
import * as api from 'magnav.api';           // external in build, stub in dev
export const qBackend = typeof backend !== 'undefined' ? backend : (globalThis.backend ?? null);
export async function callPy(name, ...args) {
  const fn = api[name];
  if (!fn) throw new Error(`magnav.api.${name} not found`);
  return JSON.parse(await fn.callPromising(qBackend, ...args));   // never a plain call (XHR error on IonQ)
}
```

### `magnav/api.py` (pattern; executor writes it fresh)
```python
"""JS-facing API. Every function takes the injected backend and returns a JSON string."""
import json
import sys
import time

from qiskit import QuantumCircuit, __version__ as QISKIT_VERSION, transpile

SMOKE_DATA = "data/smoke.json"   # literal path: Qollab preloads only literal paths


def _bell(i: int) -> QuantumCircuit:
    qc = QuantumCircuit(2, 2, name=f"bell_{i}")
    qc.h(0)
    qc.cx(0, 1)
    if i % 2:            # odd circuits -> Psi+ (01/10) so ordering is checkable
        qc.x(1)
    qc.measure([0, 1], [0, 1])
    return qc


def backend_info(backend) -> str:
    info = {"name": getattr(backend, "name", None), "class": type(backend).__name__,
            "num_qubits": getattr(backend, "num_qubits", None),
            "noise_model": getattr(getattr(backend, "options", None), "noise_model", None),
            "python": sys.version, "platform": sys.platform, "qiskit": QISKIT_VERSION}
    for mod in ("numpy", "scipy", "sklearn"):
        try:
            info[mod] = __import__(mod).__version__
        except Exception as e:  # noqa: BLE001 - report, don't crash
            info[mod] = f"unavailable: {type(e).__name__}"
    with open(SMOKE_DATA) as f:
        info["data_file"] = json.load(f)
    return json.dumps(info)


def run_bell_batch(backend, n_circuits=2, shots=200) -> str:
    n, s = int(n_circuits), int(shots)
    circuits = [_bell(i) for i in range(n)]
    try:
        tqc = transpile(circuits, backend, optimization_level=1)   # 0-1 for IonQ
        t0 = time.time()
        job = backend.run(tqc, shots=s)                             # EXACTLY ONE job
        result = job.result()
        counts = [dict(result.get_counts(i)) for i in range(n)]     # never get_counts() bare
        ok_order = all(max(c, key=c.get) in (("00", "11") if i % 2 == 0 else ("01", "10"))
                       for i, c in enumerate(counts))
        return json.dumps({"ok": True, "backend": backend.name, "n_circuits": n, "shots": s,
                           "submit_to_result_s": round(time.time() - t0, 2),
                           "ordering_ok": ok_order, "counts": counts})
    except Exception as e:  # noqa: BLE001 - surface IonQ CamelCase error names to the page
        return json.dumps({"ok": False, "backend": getattr(backend, "name", None), "n_circuits": n,
                           "shots": s, "error_type": type(e).__name__, "error": str(e)[:2000]})
```
Python `str` crosses to JS as a JS string, so `JSON.parse` on the JS side works directly [CITED: pyodide type-conversions].

### `tests/test_api_smoke.py` (one-job guard, runs offline)
```python
import json
from qiskit.providers.basic_provider import BasicSimulator
import magnav.api as api

class Spy:
    def __init__(self, inner): self.inner, self.calls = inner, 0
    def __getattr__(self, k): return getattr(self.inner, k)
    def run(self, *a, **kw): self.calls += 1; return self.inner.run(*a, **kw)

def test_run_bell_batch_one_job_and_shape():
    spy = Spy(BasicSimulator())
    out = json.loads(api.run_bell_batch(spy, 32, 100))
    assert spy.calls == 1 and out["ok"] and len(out["counts"]) == 32 and out["ordering_ok"]
```
Note: `transpile(circuits, spy, ...)` needs a real `BackendV2`. If the spy proxy breaks transpile's target lookup, transpile against `spy.inner` in the test by monkeypatching, or make the spy subclass `BasicSimulator` and override `run`. Prefer the subclass: `class SpySim(BasicSimulator): def run(self, *a, **kw): self.calls += 1; return super().run(*a, **kw)`.

### `tests/test_qollab_contract.py` (static checks the executor can run)
Assert: `index.html` contains no `<script`, `<html`, `<head`, `<body`. `main.js` exists, < 2 MB, contains `from "magnav.api"`, and has no line starting with `export`. `main.css` exists. `requirements.txt` non-comment lines == `["qiskit>=2.5.2,<3.0.0"]`. `magnav/api.py` contains the literal `"data/smoke.json"` and `data/smoke.json` exists. `LICENSE` starts with `MIT License` and contains `2026`. README contains the exact string `This effort is supported by Qollab & IonQ.` and `Quantum Impact`. The total allowlisted file count is ≤ 100.

### `main.py` fallback (Python project)
```python
"""Qollab Python-project fallback. Qollab injects `backend`; locally we use BasicSimulator."""
if "backend" not in globals():                      # local only; on Qollab backend is injected
    from qiskit.providers.basic_provider import BasicSimulator
    backend = BasicSimulator()
from magnav.api import backend_info, run_bell_batch
print(backend_info(backend))
print(run_bell_batch(backend, 2, 200))   # edit N here for a Python-project probe (one job per run)
```
Don't define `def main(...)` with annotations, because Qollab would auto-call it [CITED]. Phase 2 can repurpose `main.py` as the CLI. Keep the `backend` guard.

## Compliance Checklist (PLAT-04, PLAT-05)

Source: Participant Plan PDF (local copy) plus hackathon page. Items:

| Item | Where | Exact content |
|------|-------|---------------|
| MIT license | `/LICENSE` (uploaded as file) | Standard MIT text, `Copyright (c) 2026 Eason Ha` (git author name, verified via `git log`) |
| Attribution line | README (write-up) + page footer in React UI | `This effort is supported by Qollab & IonQ.` (verbatim, including period and `&`) |
| Theme tag | Qollab sidebar **Tags** (manual) + README line | `Theme: Quantum Impact` in README, and tag `Quantum Impact` in the sidebar (plus `qiskit`, `ionq`) |
| AI tools + libraries disclosure, with license confirmation | README section `## AI tools and libraries used` | See skeleton below |
| Built during window | README statement + git history | First commit 2026-10-09 22:58 PDT (after 4:00 PM PDT kickoff) |
| Repo link | Qollab sidebar Links (manual) | Needs a public GitHub repo. No remote exists yet (human decision) |
| Keep live 12 months | Rule acknowledgement | n/a in code |

README skeleton (Phase 1 version; Phase 6 expands it):
```markdown
# Quantum MagNav: GPS-denied drone navigation with a quantum-assisted magnetic denoiser

This effort is supported by Qollab & IonQ.

**Theme:** Quantum Impact · **License:** MIT (see LICENSE) · **Hackathon:** Qollab × IonQ Hackathon, Oct 9–11, 2026

> Status: Phase 1 smoke test. The page calls in-page Python and submits one batched Bell-circuit job.

## How to run on Qollab
Press **Run on Qollab**, choose **IonQ Forte 1 (Remote simulator)**, and use Chrome/Edge (WebAssembly JSPI required; Firefox 153+; Safari unsupported).

## How to run locally
`uv sync` · `uv run pytest` · `cd web && npm install && npm run dev`

## Originality
All code in this repository was written during the hackathon build window (from Oct 9, 2026, 4:00 PM PDT). No pre-existing code, coursework, or templates were reused.

## AI tools and libraries used
**AI tools:** Claude Code (Anthropic; model Claude Opus 5.5) was used for planning, research, and code generation. All output was reviewed by the author.
**Libraries (all used under their open-source licenses, which permit this use):**
| Library | License | Use |
|---|---|---|
| Qiskit | Apache-2.0 | Circuits, transpilation |
| qiskit-aer (local dev only) | Apache-2.0 | Local simulation/tests |
| qiskit-ionq (local dev only; Qollab provides the IonQ backend) | Apache-2.0 | Backend inspection |
| NumPy | BSD-3-Clause | Numerics |
| SciPy | BSD-3-Clause | Signal processing/optimization (later phases) |
| scikit-learn | BSD-3-Clause | Ridge/kernel ridge baselines (later phases) |
| Matplotlib | Matplotlib License (PSF-based) | Figures |
| React, React DOM | MIT | UI |
| Vite, @vitejs/plugin-react | MIT | Build |
| pytest, Ruff, uv | MIT / MIT / MIT OR Apache-2.0 | Dev tooling |
| Pyodide (provided by the Qollab runtime) | MPL-2.0 | In-browser Python |
**Templates / outside code:** none. The Qollab docs' examples were consulted for API usage only.
The author confirms they are licensed to use all of the above.
```
Keep this table current as later phases add recharts (MIT) and d3-scale/d3-scale-chromatic (ISC).

## Human Checkpoint (what only the builder can do)

**Executor can verify locally:** `uv sync`, `uv run pytest` (API + contract tests), `npm --prefix web run build`, `vite dev` with the stub, the zip script and its limit checks, compliance strings, and commits.

**Human must do (click-by-click, in Chrome, signed in):**
1. qollab.xyz → **+ New Project** → **Upload your own files** → drop `dist/qollab-upload.zip` → confirm the card says it will run as **JS** → **Create**. Choose the final project slug now (e.g. `quantum-magnav`) so the URL stays stable. The pencil can rename it later.
2. Code tab → **Run Project** → **Run** → pick **Built-in simulator** → page shows backend info → **Submit one job** (2 × 200) → expect Φ+/Ψ+ counts, `ordering_ok: true`. This is free and instant.
3. **Stop** → **Run** → **IonQ Forte 1 (Remote simulator)** → **Submit one job** (2 × 200). Record backend name, noise_model, wall time, counts.
4. Repeat Stop→Run with IonQ Forte 1 for **32 × 100**, **64 × 100**, **128 × 100**. Stop at the first failure and record the exact `error_type`/message.
5. Shots probe on 2 circuits: **1024**, then optionally 4096. Record time or failure (`TooManyShots`/`TooLongPredictedExecutionTime`).
6. Optional: click Submit a second time on IonQ to confirm the lock message, or that the runtime error text appears.
7. Project Card: confirm the write-up = README. **Tags**: `Quantum Impact`, `qiskit`, `ionq`. **Links**: repo URL if created.
8. **Publish** → Version name `v0.1-smoke` → Visibility "public and the new default" → open `qollab.xyz/u/<user>/<project>` in an **incognito window**. Record whether the page opens, whether Run works on the built-in simulator, and whether IonQ runs (or the anonymous-user message appears).
9. Slack `#hackathon-help`: "Do hackathon participants get credits for one IonQ Forte 1 hardware run (~500 shots, ≤128 small circuits)? My balance shows __." Also check the credit balance in profile settings.
10. If step 2 shows a blank page or a JS error, upload `dist/qollab-fallback-py.zip` as a separate project, run it on IonQ Forte 1, and record the result. This decides the fallback submission format.

### `docs/QOLLAB_FINDINGS.md` template (executor creates with blanks)
```markdown
# Qollab Findings (Phase 1 smoke test)
Date/time (PDT): ___  Browser/version: ___  Qollab project URL: ___

## Runtime facts (from backend_info)
| Field | Built-in sim | IonQ Forte 1 (remote sim) |
|---|---|---|
| backend.name | ___ | ___ |
| class | ___ | ___ |
| num_qubits | ___ | ___ |
| options.noise_model | ___ | ___ |
| python / platform | ___ | ___ |
| qiskit / numpy / scipy | ___ | ___ |
| sklearn import without listing? | ___ | ___ |
| data/smoke.json loaded? | ___ | ___ |

## React bundle in sandbox
- Page rendered? ___  Button click after load triggered a job? ___  Console errors: ___

## Batched job probe (IonQ Forte 1 remote sim, one job per Run)
| Circuits | Shots | Result (ok / error_type) | submit→result (s) | ordering_ok | Notes |
|---|---|---|---|---|---|
| 2 | 200 | | | | |
| 32 | 100 | | | | |
| 64 | 100 | | | | |
| 128 | 100 | | | | |
| 2 | 1024 | | | | |
| 2 | 4096 (optional) | | | | |
**Max circuits per job confirmed:** ___   **Max shots tested OK:** ___
Second-job behaviour (exact text): ___

## Publishing
- Published version name / time: ___
- Opens logged out (incognito)? ___  Built-in sim runs logged out? ___  IonQ runs logged out? ___ (anonymous-user message?)
- Republish workflow noted: new version, same URL; README must be pasted manually on later uploads.

## Credits
- Balance in profile: ___   #hackathon-help answer (who/when/what): ___
- Decision for QNT-06: real hardware run / labeled forte-1 proxy: ___

## Decision
- Submission format: JS project (React) / Python-project fallback: ___
- Phase 4 job sizing: N circuits = ___, shots = ___
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `qiskit.execute`, V1 primitives, BackendV1 | `backend.run` / V2 primitives | Qiskit 1.0 / 2.0 | Copied tutorials break. Use `backend.run(list)` + `get_counts(i)` |
| `uv venv` + `pip install -r` | `uv` projects (`pyproject.toml`, `uv.lock`, `uv sync`) | uv 0.3+ | Matches "uv sync" success criterion |
| Vite/Rollup | Vite 8 uses Rolldown (`rollupOptions` still accepted) | Vite 8 | Verified that config keys work unchanged |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A ~300 kB Vite React bundle with a top-level `import * as e from "magnav.api"` runs unmodified in Qollab's JS runtime (import scanner accepts double quotes, the bundle's IIFE-free ES output, and helper code) | Pattern 1 | Smoke test fails. Fall back to the Python project or CDN React imports. This is exactly what the human checkpoint tests |
| A2 | Button clicks after load can call `callPromising` and submit a job while the run is active | Pattern 3 | Probe must then auto-run on load with N set in code (re-upload per size) or use the main.py fallback |
| A3 | `backend` is reachable via a `typeof backend` guard in bundled code | Pattern 1 | If injected differently, the page shows "backend unavailable". Diagnose from the console |
| A4 | scikit-learn auto-loads on import in Pyodide without being listed | Pitfall 9 | Phase 2 adds it to requirements.txt (probe reports it) |
| A5 | IonQ multi-circuit results preserve submission order for `get_counts(i)` on Qollab's qiskit-ionq version | Pattern 3 | `ordering_ok` flags it. Fall back to counts by circuit name |
| A6 | Pyodide license MPL-2.0; Claude model naming "Claude Opus 5.5" in the disclosure | Compliance | Minor. Confirm wording before final README |
| A7 | uv installer script installs into `~/.local/bin` | Installation | Use `python3 -m pip install --user uv` fallback |

## Open Questions

1. **Max circuits per job and per-job gate limits on the Forte remote sim.** Undocumented. The probe answers it. Phase 4 sizes to the largest passing N with margin.
2. **Whether Qollab's qiskit-ionq version is 1.0.2 or newer.** Docs fetched today don't state it. `backend_info` can add `qiskit_ionq.__version__` via a guarded import. Recommend adding that line.
3. **Hardware credits.** Only Slack or the balance can answer. QNT-06 falls back to the labeled forte-1 proxy.
4. **Repo remote.** No `origin` exists. Creating a public GitHub repo and pushing is a user action (`gh` exists at `~/.local/bin/gh`, auth unknown). The plan should include it as an optional human step, required by Phase 6 at the latest.
5. **Whether anonymous visitors can run IonQ jobs.** Record it. It doesn't block criterion 3.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| uv | PLAT-03 | ✗ (not on PATH) | — (0.13.0 verified via scratch venv) | Install: `curl -LsSf https://astral.sh/uv/install.sh \| sh` or `python3 -m pip install --user uv` |
| Python 3.13 | PLAT-03 | ✗ system (3.9.6) | via `uv python install 3.13` → 3.13.16 | — |
| Node / npm | Vite build | ✓ | 24.20.0 / 11.19.0 | — |
| zip | packaging | ✓ | /usr/bin/zip | — |
| git | commits | ✓ | author "Eason Ha" | — |
| GitHub remote / gh | repo link | partial (gh binary present, no remote) | — | Human creates repo later |
| Homebrew | — | ✗ | — | not needed |
| Chrome (JSPI) | Qollab run | assumed (human) | — | Edge/Opera, Firefox 153+ |

**Missing dependencies with no fallback:** none.
**Missing with fallback:** uv (install step), Python 3.13 (uv-managed).

## Validation Architecture
Skipped (`workflow.nyquist_validation: false` in `.planning/config.json`). Test commands are still listed: `uv run pytest -q` (API one-job + contract tests, < 10 s), `npm --prefix web run build`, `bash scripts/package_qollab.sh`.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Qollab owns auth. No credentials in the project |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (minimal) | `int()` coercion and an allowlist of circuit counts {2,32,64,128} and shots {100,200,500,1024,4096} in `run_bell_batch` |
| V6 Cryptography | no | — |
| Secrets | yes | Never put API keys/tokens in published code [CITED: runtime-environment]. The platform holds the IonQ key |

| Threat | STRIDE | Mitigation |
|--------|--------|-----------|
| Accidental credit spend if a visitor picks the QPU | Elevation / cost | Runner shows the cost and asks above the allowance [CITED: how-credits-work]. Keep default shots small. The page labels the backend clearly |
| Leaking secrets via repo/upload | Information disclosure | Allowlist zip. `.gitignore` covers `.env*` |
| Supply chain (npm/PyPI) | Tampering | Exact pins, lockfiles committed, slopcheck OK, no postinstall scripts |

## Sources

### Primary (HIGH confidence)
- https://qollab.xyz/learn/docs/js-qiskit-projects: file roles, dotted import, `callPromising`/`callPromisingKwargs`, XHR error on plain call, `.toJs()`, no `new`
- https://qollab.xyz/learn/docs/runtime-environment: project-type rules, injected backend, one job per run, requirements.txt rules, network limits, literal data paths, body-only HTML, limits, JSPI
- https://qollab.xyz/learn/docs/python-qiskit-projects: backend is the provider's real object (BasicSimulator / Fake / IonQProvider), multi-circuit lists pass through
- https://qollab.xyz/learn/docs/upload-your-files: zip/folder, wrapper stripping, 100×2 MB, README → write-up and skipped on later uploads, Keep-and-add vs Erase-first
- https://qollab.xyz/learn/docs/publish and /project-anatomy: immutable versions, stable URL, 10/hour, sidebar Tags/Links
- https://qollab.xyz/learn/docs/compute-backends, /error-reference, /transpilation, /run-your-code, /how-credits-work, /write-your-project-page
- https://pyodide.org/en/stable/usage/type-conversions.html: str/int/float/bool implicit, PyProxy destroy
- Participant Plan PDF (~/Downloads): submission checklist, attribution line, disclosure + license confirmation, logged-out or teammate check
- Local verification (this session): `uv sync` resolution; Vite 8.3.4 build to root + dev alias; BasicSimulator multi-circuit `get_counts` shape; qiskit-ionq 1.1.1 backend names/options and multi-circuit child-job handling (source read); npm/PyPI licenses; slopcheck scan

### Secondary (MEDIUM)
- `.planning/research/STACK.md` and `PITFALLS.md` (earlier session, same doc sources)

### Tertiary (LOW)
- None relied on.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH. Resolved and built locally today.
- Architecture/file contract: HIGH for documented rules. MEDIUM for bundle-in-iframe and click-after-load (A1, A2).
- Pitfalls: HIGH (docs + local reproduction).

**Research date:** 2026-10-09
**Valid until:** 2026-10-11 (hackathon end). Qollab docs could change during the event.

# Walking Skeleton — Quantum MagNav (Magnetic Field Detector)

**Phase:** 1
**Generated:** 2026-10-09

## Capability Proven End-to-End

A visitor presses Run on Qollab, chooses IonQ Forte 1 (Remote simulator), clicks **Submit one job**, and sees Bell-circuit counts produced by one batched IonQ job. The React page gets them by calling in-page Python.

> **Template adaptation:** this project has no database, server, auth or deploy pipeline of its own. Everything runs in the visitor's browser on Qollab (Pyodide). The template's "one real read AND one real write" becomes: (a) the React page calls a real in-page Python function (`magnav.api.backend_info`, which also reads `data/smoke.json` from Qollab's preloaded file system), and (b) that Python submits one real batched `backend.run` job (`magnav.api.run_bell_batch`) and returns the counts, which the page renders. "Deployment" means a published Qollab project version at a stable URL.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Runtime | Qollab JS project: `index.html` (body only) + Vite-built `main.js`/`main.css` at the repo root, with Python running in Pyodide in the same page | Qollab has no server side. HTTP POST, XHR, WebSocket and workers are blocked. The platform supplies the Python runtime and the JS-to-Python bridge |
| Frontend | React 19.3.0 + Vite 8.3.4 in lib mode (`formats: ['es']`, `external: [/^magnav(\..+)?$/]`, `outDir: '..'`, `emptyOutDir: false`, `publicDir: false`). Source in `web/`. Built `main.js`/`main.css` are committed | One ES-module file whose first line is `import * as x from "magnav.api"`. No export statements. Anyone with the repo link can upload without building |
| JS to Python bridge | `web/src/bridge.js`: `callPy(name, ...args)` makes a namespace import from `magnav.api` and calls `api[name].callPromising(qBackend, ...args)`, then `JSON.parse` | A plain call fails on IonQ (XHR ConnectionError). One choke point for every call |
| Python API contract | `magnav/api.py` is the only JS-facing module. Every function takes `backend` first and returns a `json.dumps` string. Errors come back as `{ok:false, error_type, error}` | Avoids PyProxy leaks. One shape for the dev stub, tests and Qollab. IonQ error names reach the UI |
| Quantum execution | Qollab injects `backend`, and the code never constructs a provider or `AerSimulator`. Exactly one `backend.run(list_of_circuits, shots=S)` per Run. Results are read with `result.get_counts(i)` per index. `BackendSamplerV2` is never used. Transpile uses `optimization_level=1` | IonQ allows one job per run. `get_counts()` changes return shape with circuit count. The sampler returns zeros on IonQ |
| Data layer | No database. Static files under `data/` are read by Python through literal path constants (`SMOKE_DATA = "data/smoke.json"`) and handed to JS as JSON strings | Qollab preloads only literal paths, and JS cannot fetch project files. Later phases put `data/precomputed_run.json` here |
| Auth | None in the project. Qollab owns accounts and IonQ credentials | No secrets in code. A logged-out visitor sees the published page |
| Deployment target | `scripts/package_qollab.sh` builds an allowlist zip (`dist/qollab-upload.zip`), which is uploaded to Qollab and published at `qollab.xyz/u/<user>/<project>`. Republishing creates a new immutable version at the same URL | Respects the 100-file and 2 MB-per-file limits and keeps `node_modules` out. README becomes the write-up and is skipped on later uploads, so it has to be pasted by hand |
| Fallback format | `main.py` Python-project entry (`if "backend" not in globals()` guard, no `def main`), shipped as `dist/qollab-fallback-py.zip` | If the React bundle fails in the Qollab iframe, the submission still runs as a Python project |
| Local dev | Python 3.13 via `uv` (`pyproject.toml` + `uv.lock`, `package = false`). Pins: qiskit 2.5.2, numpy 2.4.x, scipy 1.18.x, scikit-learn 1.8.x. Dev group: qiskit-aer 0.17.2, qiskit-ionq 1.1.1, pytest, ruff. `requirements.txt` (shipped) = `qiskit>=2.5.2,<3.0.0` only | Matches the Pyodide package set, so code that works locally works on Qollab |
| Testing | pytest: `tests/test_api_smoke.py` (a `BasicSimulator` subclass spy asserts `backend.run` is called exactly once, plus the JSON contract and input allowlist), `tests/test_qollab_contract.py` (static checks on `main.js`, `index.html` and `main.css`), `tests/test_compliance.py` | Offline guards for the platform rules that cost a run if they break |
| Directory layout | Repo root = Qollab project root: `index.html`, `main.js`, `main.css`, `main.py`, `requirements.txt`, `LICENSE`, `README.md`, `magnav/` (Python library; `__init__.py` has no imports), `data/`. Not uploaded: `web/` (React source), `tests/`, `scripts/`, `docs/`, `.planning/` | No copy step and no symlinks. The allowlist zip decides what ships |
| Accessibility baseline | Native `<button>`/`<select>` with visible labels, a `role="status" aria-live="polite"` status region, `:focus-visible` outline, table captions | Required by the submission. The baseline is set here and every later UI inherits it |
| Compliance | MIT `LICENSE` (2026 Eason Ha). Verbatim `This effort is supported by Qollab & IonQ.` in README and in the page footer (stored inside `main.js`). Theme: Quantum Impact. AI-tools and library disclosure in README | README is not stored as a file on Qollab, so the attribution must also live in a shipped file |

## Stack Touched in Phase 1

- [ ] Project scaffold: uv project + pytest + ruff (Python); Vite + React lib-mode build (JS); `scripts/package_qollab.sh`. *(Plans 01-01 and 01-02)*
- [ ] Routing (adapted): a single Qollab entry page (`index.html` → `main.js`). This is a single-page demo with no router. *(Plan 01-02)*
- [ ] Data layer (adapted, replaces "DB read/write"): the React page calls a real in-page Python function (`backend_info`, which reads `data/smoke.json`), and that Python submits one real batched `backend.run` Bell job (`run_bell_batch`) and returns counts that the page renders. *(Plan 01-01 builds the Python side; Plan 01-02 wires the page)*
- [ ] UI: a **Submit one job** button with circuit/shot selects, wired to `run_bell_batch` through `callPromising`. It locks after one IonQ submission. *(Plan 01-02)*
- [ ] Deployment: the upload zip is published on Qollab and opens logged out. This is **human-verified** at the Plan 01-02 checkpoint. The documented local full-stack command is `uv run python main.py` (Python path) plus `npm --prefix web run dev` (UI with the JS stub). *(Plan 01-02)*

## Out of Scope (Deferred to Later Slices)

- Any simulation, denoising, navigation, metrics or product UI (Phases 2–5)
- recharts, d3, and charts of any kind (Phase 3)
- Precomputed `RunArtifact` replay and automatic fallback (Phases 2–3)
- The quantum feature-map denoiser and the real IonQ hardware run (Phase 4)
- Adding `scikit-learn` to `requirements.txt` (Phase 2, if the Phase 1 probe shows it does not auto-load)
- A local FastAPI harness (v2, DEV-01)
- A router, state library, auth, persistence

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without changing its architectural decisions:

- Phase 2: `python main.py --seed N` simulates a GPS-jammed flight and shows raw-signal navigation drifting while TL-cleaned navigation holds. It writes `data/precomputed_run.json`.
- Phase 3: A judge on Qollab watches the drone hold position after jamming, with live in-page compute through `magnav.api` and an automatic precomputed-replay fallback.
- Phase 4: The quantum slot runs the real feature-map denoiser in one batched IonQ Forte 1 job (sized from `docs/QOLLAB_FINDINGS.md`), with ablation and a captured hardware result.
- Phase 5: Multi-seed benchmarks, sweeps, the reproducibility kit, the dual-drone view and an accessibility audit.
- Phase 6: README write-up, a published version on the same URL, the demo video and a logged-out run-through.

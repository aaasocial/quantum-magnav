# Quantum MagNav: GPS-denied drone navigation with a quantum-assisted magnetic denoiser

This effort is supported by Qollab & IonQ.

**Theme:** Quantum Impact · **License:** MIT (see LICENSE) · **Hackathon:** Qollab × IonQ Hackathon, Oct 9–11, 2026

> Status: Phase 1 smoke test. The Python API builds Bell circuits (alternating Φ+ and Ψ+), sends them to the injected backend in one `backend.run` call and returns the counts as JSON.

Repository: https://github.com/aaasocial/quantum-magnav

Qollab project: https://qollab.xyz/u/eehhaa/quantum-magnav

## How to run on Qollab

1. Open the project on Qollab. Use **Chrome or Edge**: the runtime needs WebAssembly JSPI (Firefox 153+ also works; Safari is not supported).
2. Press **Run** and choose **IonQ Forte 1 (Remote simulator)**. The built-in simulator also works and is instant.
3. When the page shows the backend info, pick the number of circuits and shots, then press **Submit one job**. On IonQ Forte 1, choose **1** circuit: each IonQ job holds one Bell circuit, because Qollab's IonQ service accepts only single-circuit jobs and rejects a list of circuits with HTTP 400. The built-in simulator accepts lists (2, 32, 64 or 128 circuits).
4. The page shows the counts for each Bell circuit and the raw result JSON. IonQ allows one job per run, so the button locks after the first IonQ job. Press **Stop** and **Run** again to submit another.

## Build the Qollab upload

```bash
bash scripts/package_qollab.sh
```

This builds `main.js` and `main.css` from `web/`, then writes `dist/qollab-upload.zip` (the JS project to upload) and `dist/qollab-fallback-py.zip` (a Python-project fallback that runs `main.py`). The script zips an explicit list of runtime files only and checks Qollab's limits (at most 100 files, each under 2 MB, README under 65,000 characters, no `node_modules`, `.env`, `__pycache__` or `.DS_Store`).

## How to run locally

```bash
uv sync
uv run pytest
uv run python main.py
```

`main.py` uses Qiskit's `BasicSimulator` locally. On Qollab the platform injects `backend`.

## Originality

All code in this repository was written during the hackathon build window, starting Oct 9, 2026, 4:00 PM PDT. No pre-existing code, coursework or templates were reused.

## AI tools and libraries used

**AI tools:** Claude Code (Anthropic) was the coding agent. Models: Claude Fable 5.1, Claude Opus 5.5 and Claude Sonnet 5.5 (Anthropic), via Claude Code, with the GSD workflow framework (MIT). Claude Fable 5.1 ran the orchestrating session, Claude Opus 5.5 ran the planning, research and execution subagents, and Claude Sonnet 5.5 ran the synthesizer and plan checker. They were used for planning, research and code generation. All output was reviewed by the author.

**Libraries (all used under their open-source licenses, which permit this use):**

| Library | License | Use |
|---|---|---|
| Qiskit | Apache-2.0 | Circuits, transpilation, backend jobs |
| qiskit-aer (local dev only) | Apache-2.0 | Local simulation and tests |
| qiskit-ionq (local dev only; Qollab provides the IonQ backend) | Apache-2.0 | Backend inspection |
| NumPy | BSD-3-Clause | Numerics |
| SciPy | BSD-3-Clause | Signal processing and optimization (later phases) |
| scikit-learn | BSD-3-Clause | Ridge and kernel ridge baselines (later phases) |
| Matplotlib | Matplotlib License (PSF-based) | Figures |
| React and React DOM | MIT | UI |
| Vite and @vitejs/plugin-react | MIT | Build |
| recharts (added in Phase 3) | MIT | Charts |
| pytest | MIT | Tests |
| Ruff | MIT | Linting |
| uv | MIT OR Apache-2.0 | Python environment management |
| Pyodide (provided by the Qollab runtime) | MPL-2.0 | In-browser Python |

**Templates / outside code:** none; Qollab docs examples consulted for API usage only.

The author confirms they are licensed to use all of the above.

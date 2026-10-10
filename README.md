# Quantum MagNav: GPS-denied drone navigation with a quantum-assisted magnetic denoiser

This effort is supported by Qollab & IonQ.

**Theme:** Quantum Impact · **License:** MIT (see LICENSE) · **Hackathon:** Qollab × IonQ Hackathon, Oct 9–11, 2026

> Status: Phase 1 smoke test. The Python API submits one batched Bell-circuit job (alternating Φ+ and Ψ+ circuits) to the injected backend and returns the counts as JSON.

## How to run on Qollab

Instructions are added once the React page is built (next step of Phase 1).

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

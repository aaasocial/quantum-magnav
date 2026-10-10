# Phase 1: Scaffold, Compliance and Qollab Smoke Test - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning
**Mode:** Infrastructure phase (smart discuss skipped — no user-facing behaviour to decide)

<domain>
## Phase Boundary

Prove the Qollab runtime end to end and lock compliance before any product code exists. Deliverables: a pinned local dev environment (Python 3.13 via `uv`, qiskit 2.5.2, numpy 2.4.x, scipy 1.18.x, scikit-learn 1.8.x; React 19.3 + Vite 8.3 lib-mode build), the Qollab JS-project folder layout (`index.html` body-only + single `main.js`/`main.css` + `magnav/` Python package + `requirements.txt` containing only `qiskit>=2.5.2,<3.0.0` + `data/`), a smoke-test page that calls an in-page Python function via `import * as api from 'magnav.api'` / `callPromising(backend, ...)` and submits a Bell circuit batch in exactly one `backend.run([...])` (counts read via `get_counts()`, never `BackendSamplerV2`), a probe script for max circuits per job (32/64/128) and shot limits, a findings file recording the results, and the compliance set (MIT LICENSE, verbatim attribution line "This effort is supported by Qollab & IonQ.", Quantum Impact theme tag, AI-tools and library disclosure section, README skeleton).

Out of this phase: any simulation, denoising, navigation or product UI code.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow `.planning/research/STACK.md` (verified against Qollab's runtime docs) for the folder layout, Vite config (`external: [/^magnav(\..+)?$/]`), pins, and the list of things that do not work on Qollab (WebSocket/XHR/POST/workers, filterpy/plotly/torch, second `backend.run`, `BackendSamplerV2`).

### Manual steps the builder must perform (Claude cannot do these)
- Upload the smoke-test project to Qollab.xyz, press Run with **IonQ Forte 1 (Remote simulator)** selected, and report what happened.
- Run the 32/64/128 circuit probe on Qollab and paste results into the findings file.
- Publish the smoke test and open it from a logged-out browser.
- Ask in the hackathon `#hackathon-help` Slack whether credits cover one real hardware run.
Plans should produce everything needed for these steps (a zip or folder ready to upload, exact click-by-click instructions, and a findings template with blanks), then stop at a human checkpoint rather than claiming the Qollab run passed.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — empty repository (only `.planning/` and `CLAUDE.md`).

### Established Patterns
- None yet. This phase establishes them: `magnav/` as a pure library with `api.py` as the only JS-facing module; Python functions accept `backend` as an argument and never construct providers or `AerSimulator` in shipped code.

### Integration Points
- Qollab JS project entry (`index.html` + `main.js`), Pyodide-side `magnav.api`, and the `backend` object Qollab injects at Run time.

</code_context>

<specifics>
## Specific Ideas

- The local scratchpad research already produced a working Vite lib-mode config and a 758 kB bundle (see STACK.md); reuse that config rather than re-deriving it.
- Keep a `main.py` Python-project entry alive from this phase as the fallback submission format if the React bundle fails inside Qollab's sandbox.
- Findings file lives at `docs/QOLLAB_FINDINGS.md` (or similar) and is referenced by later phases when sizing the quantum job.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>

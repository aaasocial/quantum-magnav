---
phase: 01-scaffold-compliance-and-qollab-smoke-test
plan: 01
subsystem: python-core-and-compliance
tags: [uv, qiskit, compliance, api, smoke-test]
requires: []
provides:
  - "magnav.api.backend_info(backend) -> JSON str"
  - "magnav.api.run_bell_batch(backend, n_circuits, shots) -> JSON str (exactly one backend.run)"
  - "main.py Python-project fallback"
  - "Pinned Python 3.13 uv environment (qiskit 2.5.2, numpy 2.4.6, scipy 1.18.1, scikit-learn 1.8.0)"
  - "LICENSE, README compliance sections"
affects: [01-02, 01-03]
tech-stack:
  added: [uv 0.13.0, CPython 3.13.16, qiskit 2.5.2, numpy 2.4.6, scipy 1.18.1, scikit-learn 1.8.0, qiskit-aer 0.17.2 (dev), qiskit-ionq 1.1.1 (dev), pytest, ruff 0.17.0]
  patterns: ["backend always a parameter", "JSON-string return contract", "single batched backend.run", "literal data paths", "input allowlists before any backend call"]
key-files:
  created: [pyproject.toml, .python-version, uv.lock, .gitignore, requirements.txt, LICENSE, README.md, magnav/__init__.py, magnav/api.py, data/smoke.json, main.py, tests/test_compliance.py, tests/test_api_smoke.py]
  modified: []
decisions:
  - "run_bell_batch also maps non-integer inputs (int() failure) to ValueError failure JSON, so no exception escapes to the JS bridge"
  - "README 'How to run on Qollab' left as a one-line placeholder for Plan 02"
metrics:
  duration: "~6 min"
  completed: 2026-10-09
  tasks: 2
  files: 13
---

# Phase 1 Plan 01: Pinned env, compliance set and magnav.api smoke API Summary

uv-managed Python 3.13 project pinned to Qollab/Pyodide parity (qiskit 2.5.2, numpy 2.4.6, scipy 1.18.1, scikit-learn 1.8.0), the full MIT/attribution/disclosure compliance set, and `magnav.api` with an allowlisted, one-job `run_bell_batch` plus `backend_info`, driven end to end by `main.py`.

## What was built

- **Environment (PLAT-03):** uv 0.13.0 installed to `~/.local/bin`, CPython 3.13.16 via `uv python install`. `uv sync` resolves qiskit 2.5.2 / numpy 2.4.6 / scipy 1.18.1 / scikit-learn 1.8.0; qiskit-aer and qiskit-ionq are dev-group only. Node v24.20.0 / npm 11.19.0 present at `~/.local/node/bin` (needed by Plan 02; not on the default PATH, so Plan 02 must prepend it).
- **Qollab files (PLAT-01):** `requirements.txt` is exactly `qiskit>=2.5.2,<3.0.0`; `.gitignore` does not exclude `main.js`/`main.css`; `data/smoke.json` read via the literal `SMOKE_DATA = "data/smoke.json"`.
- **Compliance (PLAT-04/05):** MIT `LICENSE` (2026, Eason Ha); README with H1 title, verbatim `This effort is supported by Qollab & IonQ.`, `**Theme:** Quantum Impact`, Phase 1 status note, local run steps, Originality section, AI tools + 14-row library license table, templates statement and license confirmation.
- **magnav.api:** `backend_info` (name, class, num_qubits, noise_model, is_ionq, python, platform, version report for qiskit/numpy/scipy/sklearn/qiskit_ionq, data_file) never calls `backend.run`. `run_bell_batch` validates against `ALLOWED_CIRCUITS`/`ALLOWED_SHOTS` before building circuits, transpiles at optimization_level=1, calls `backend.run` exactly once, collects `get_counts(i)` per circuit, checks Phi+/Psi+ ordering, and returns failure JSON with the exception class name on any error.
- **main.py:** `if "backend" not in globals()` guard, no `def main`, no `__name__` check. Local run output: `{"ok": true, "backend": "basic_simulator", "n_circuits": 2, "shots": 200, ..., "ordering_ok": true, "counts": [{"11": 103, "00": 97}, {"10": 108, "01": 92}]}`.

## Tests

`uv run pytest -q`: 13 passed (6 compliance, 7 API: SpySim one-call guard for 32 circuits, 2-circuit shape and order, both allowlist rejections with zero run calls, RuntimeError("boom") captured, backend_info no-job + data file, forbidden-name source scan). `uv run ruff check magnav tests main.py`: clean.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | 52735f2 | chore(01-01): pinned uv project, compliance files and repo layout |
| 2 (RED) | ebf13e0 | test(01-01): add failing magnav.api smoke tests |
| 2 (GREEN) | 0383a14 | feat(01-01): magnav.api smoke functions and main.py fallback |

## PLAT-05 build window

PLAT-05 build window: first code commit (`git log --reverse --format='%aI' -- pyproject.toml | head -1`) = `2026-10-09T23:48:48-07:00`; `>= 2026-10-09T16:00:00-07:00` -> **True**. All ten earlier commits (f60191d 22:58 through c478f54 23:46 PDT) touch only `.planning/` docs and `CLAUDE.md`, no code.

## Builder to confirm before submission

Verify the README AI-tools disclosure (Claude Fable 5.1, Claude Opus 5.5 and Claude Sonnet 5.5 (Anthropic), via Claude Code, with the GSD workflow framework (MIT)) still matches the models actually used across the whole build.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Lint] Ruff 0.17 defaults flagged two findings**
- **Found during:** Task 2
- **Issue:** RUF100 (unused `# noqa: E402` in main.py, E402 not enabled) and PLR0402 (`import magnav.api as api` in the test).
- **Fix:** `ruff check --fix`: removed the noqa; test now uses `from magnav import api`.
- **Files modified:** main.py, tests/test_api_smoke.py
- **Commit:** 0383a14

**2. [Rule 2 - Input validation] Non-numeric inputs**
- **Found during:** Task 2
- **Issue:** The plan's `int()` coercion would raise outside the try block for non-numeric input, letting an exception escape to the JS bridge.
- **Fix:** `int()` failure returns the ValueError failure JSON (T-01-02).
- **Files modified:** magnav/api.py
- **Commit:** 0383a14

## TDD Gate Compliance

RED `test(01-01)` (ebf13e0) precedes GREEN `feat(01-01)` (0383a14). RED failed at collection with `ModuleNotFoundError: No module named 'magnav.api'`. No refactor commit needed.

## Known Stubs

- README.md "How to run on Qollab" section is a one-line placeholder; Plan 02 fills it (intentional per plan).

## Self-Check: PASSED

All 13 created files found; commits 52735f2, ebf13e0, 0383a14 found in git log; no keys, tokens or emails in committed files.

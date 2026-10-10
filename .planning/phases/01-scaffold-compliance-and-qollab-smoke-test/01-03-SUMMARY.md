---
phase: 01-scaffold-compliance-and-qollab-smoke-test
plan: 03
subsystem: qollab-packaging-and-smoke-test
tags: [qollab, ionq, packaging, smoke-test, github, findings]
requires:
  - "React smoke page main.js/main.css + magnav.api bridge (01-02)"
  - "magnav.api backend_info / run_bell_batch, compliance set (01-01)"
provides:
  - "scripts/package_qollab.sh -> dist/qollab-upload.zip (JS project) + dist/qollab-fallback-py.zip, with limit and secret-path checks"
  - "docs/QOLLAB_FINDINGS.md filled: runtime facts, IonQ probe, shots, publish, credits, decision"
  - "Public repo https://github.com/aaasocial/quantum-magnav (origin, main tracks origin/main)"
  - "Published Qollab project https://qollab.xyz/u/eehhaa/quantum-magnav (version v0.1-smoke)"
  - "magnav.api single-circuit path (n_circuits=1 submits a bare circuit, job type ionq.circuit.v1)"
affects: [phase-04-quantum, phase-06-submission, QNT-06]
tech-stack:
  added: []
  patterns: ["explicit allowlist zip + zipinfo limit checks", "single-circuit IonQ job per Run"]
key-files:
  created: [scripts/package_qollab.sh, docs/QOLLAB_FINDINGS.md]
  modified: [README.md, magnav/api.py, web/src/App.jsx, main.js]
decisions:
  - "Qollab's IonQ proxy accepts only job type ionq.circuit.v1: every IonQ job holds exactly 1 circuit, and there is 1 IonQ job per Run. This replaces the earlier 'one batched backend.run' plan"
  - "Phase 4 packs all windows into ONE circuit (separate 4-6-qubit blocks on the 29-qubit Forte 1 sim) or runs the bulk on the built-in sim/local Aer with forte-1 noise and keeps the single IonQ job as the showcase"
  - "Submission format is the Qollab JS project (React bundle + magnav/ Python); the Python fallback is not needed"
  - "Shots up to 4096 are accepted on Forte 1 sim; latency ~12 s per job regardless of shots"
  - "scikit-learn is not preloaded on Qollab: list it in requirements.txt or use numpy implementations"
  - "Platform qiskit-ionq is 1.0.2; do not rely on 1.1-only features"
metrics:
  duration: "~45 min (00:20-01:05 PDT, including human-checkpoint browser session)"
  completed: 2026-10-10
  tasks: 2
  files: 6
---

# Phase 1 Plan 03: Qollab packaging, smoke test and findings Summary

Allowlist packaging script, live Qollab smoke test on the built-in simulator and IonQ Forte 1 (29q remote simulator), a public GitHub repo and a published `v0.1-smoke` project. The test found that Qollab's IonQ proxy accepts only single-circuit jobs (`ionq.circuit.v1`), so Phase 4 must fit its quantum inference into one circuit per IonQ job.

## What was built

- **Task 1 (c1cbdb2):** `scripts/package_qollab.sh` builds `main.js`/`main.css` and writes `dist/qollab-upload.zip` and `dist/qollab-fallback-py.zip` from an explicit allowlist. It checks the 100-file, 2 MB and README-length limits and that no forbidden paths are included. Also in this commit: the `docs/QOLLAB_FINDINGS.md` template with the prepared repo commands and secret scans, and the README "How to run on Qollab" and "Build the Qollab upload" sections.
- **Task 2 (human checkpoint, run by the orchestrator in a browser with the builder's authorization):** created the repo and pushed, uploaded to Qollab, ran both backends, probed shots, set up the project card and published. Results are in `docs/QOLLAB_FINDINGS.md` (63d5e0e). README now has the `Repository:` line and the Qollab project URL. The run instructions now say an IonQ job holds one Bell circuit, the built-in simulator accepts lists, and the circuit selector has a 1-circuit option.

## Qollab smoke result

| Run | Result |
|---|---|
| Built-in sim (`basic_simulator`), 2 x 200 | ok, 0.01 s, ordering passed, `[{"11":104,"00":96},{"10":99,"01":101}]` |
| IonQ Forte 1 remote sim (`ionq_simulator`, 29q, `forte-1`), 2 x 200 | **FAILED**: `IonQAPIError(message='Only job type ionq.circuit.v1 is supported', status_code=400, ...)` from `https://api.qollab.xyz/api/ionq/jobs` |
| IonQ Forte 1, 1 x 200 (after d991b47) | ok, 11.38 s, ordering passed, `[{"10":1,"11":92,"00":106,"01":1}]` |
| IonQ Forte 1, 1 x 4096 | ok, 11.77 s, ordering passed, `[{"10":16,"11":2055,"00":2017,"01":8}]` |
| 32/64/128 probe | Not applicable: any list is rejected with the HTTP 400 |
| Second IonQ job in one Run | Blocked: "IonQ allows one job per run. Press Stop, then Run, to submit another." |
| React bundle in sandbox | Rendered; no console errors or warnings |
| Publish | `v0.1-smoke` is the default version; a logged-out curl returns HTTP 200 (SPA shell) |
| Credits | 100 (profile settings) |

## Platform constraints discovered

- IonQ jobs must hold exactly one circuit. Qollab's proxy accepts only `ionq.circuit.v1`. qiskit-ionq sends lists as `ionq.multi-circuit.v1`, and the proxy rejects them with HTTP 400. This contradicts Qollab's own docs, which say to pass every circuit to one `backend.run` call.
- One IonQ job per Run.
- scikit-learn is not preloaded (`ModuleNotFoundError`).
- Python 3.14.2, qiskit 2.5.2, numpy 2.4.6, scipy 1.18.0 on the platform. qiskit-ionq 1.0.2 is present only when the IonQ backend is chosen.
- IonQ Forte 1 remote simulator: 29 qubits, `forte-1` noise. A job takes about 12 s whether it uses 200 or 4096 shots. 4096 shots are accepted.
- Credits: 100. Simulators are free. Only the Forte 1 (36q) hardware backend spends credits, with an approval prompt above 10% of the balance.
- The Qollab tag list is curated and has no "Quantum Impact" tag.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1/3 - Blocking] Added a single-circuit option because Qollab's IonQ proxy rejects multi-circuit jobs**
- **Found during:** Task 2 (checkpoint, step 3)
- **Issue:** `backend.run([2 circuits])` on IonQ Forte 1 returned HTTP 400 "Only job type ionq.circuit.v1 is supported". The plan's 2/32/64/128 batched probe could not succeed.
- **Fix:** Added `1` to `ALLOWED_CIRCUITS` and `CIRCUIT_OPTIONS`. When `n == 1`, `run_bell_batch` submits the bare transpiled circuit (job type `ionq.circuit.v1`). Rebuilt `main.js` and re-uploaded.
- **Files modified:** magnav/api.py, web/src/App.jsx, main.js
- **Commit:** d991b47

**2. [Scope] Probe table rows 32/64/128 marked not applicable** instead of measured, because any list fails the same way. The max-circuits finding is recorded as "1 per IonQ job".

**3. [Docs] README wording changed:** it no longer claims a batched multi-circuit IonQ job (63d5e0e). The compliance strings are unchanged and all 19 tests pass.

## Requirement status

- **PLAT-01:** Complete (already marked). The upload zip was accepted as "9 files · 303.8 KB · Runs as JS".
- **PLAT-02:** **Complete (incognito run check pending).** The React page called in-page Python and ran a Bell job on IonQ Forte 1 from Qollab, and the findings are committed. However, PLAT-02's wording requires "one batched `backend.run`", and the batched form fails on this platform. The plan also says not to mark PLAT-02 complete when a failure is reported, and the logged-out run check (Phase SC3) is still pending. So REQUIREMENTS.md leaves PLAT-02 **Pending**. The builder can mark it complete after the incognito check, accepting "single-circuit job" in place of "batched".

## Pending from the builder

1. **Incognito Run test:** open https://qollab.xyz/u/eehhaa/quantum-magnav in a Chrome incognito window. Confirm the card and write-up render, press Run, and try the built-in simulator and IonQ Forte 1 (Remote simulator). Record the results (or any "Can't run quantum jobs as an anonymous user" text) in `docs/QOLLAB_FINDINGS.md` > Publishing.
2. **Slack #hackathon-help:** ask whether participants get extra credits and what one ~500-shot small-circuit Forte 1 hardware run costs. Optionally also report the `ionq.multi-circuit.v1` HTTP 400 against the docs. Record the answer in the Credits section; it decides QNT-06.
3. **Theme tag:** Qollab has no "Quantum Impact" tag. Find out how the hackathon wants the theme applied (submission form or announcement).
4. **AI disclosure (builder to confirm before submission):** the README disclosure lists Claude Fable 5.1, Claude Opus 5.5 and Claude Sonnet 5.5 via Claude Code with GSD. The orchestrator also drove a Playwright-controlled Chrome for the Qollab upload and publish steps. Confirm the disclosure is accurate and complete (consider mentioning the browser-automation use) before submitting.

## Threat Flags

None. The repo went public only after the filename and content secret scans came back clean, and no keys exist in the code because Qollab injects `backend`.

## Known Stubs

None that block this plan's goal. The smoke page and API are intentionally Phase 1 scaffolding.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | c1cbdb2 | feat(01-03): Qollab packaging script and findings template |
| deviation | d991b47 | feat(01-03): add single-circuit option; Qollab IonQ proxy rejects multi-circuit jobs (HTTP 400) |
| 2 | 63d5e0e | docs(01-03): record Qollab smoke-test findings and repository link |

## Self-Check: PASSED

- FOUND: scripts/package_qollab.sh, docs/QOLLAB_FINDINGS.md, README.md
- FOUND commits: c1cbdb2, d991b47, 63d5e0e
- `uv run pytest -q`: 19 passed; `uv run ruff check magnav tests`: all checks passed
- `git remote get-url origin` = https://github.com/aaasocial/quantum-magnav.git; main pushed (211a511..63d5e0e)

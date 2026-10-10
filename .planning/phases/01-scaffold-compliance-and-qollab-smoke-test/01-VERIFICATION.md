---
phase: 01-scaffold-compliance-and-qollab-smoke-test
verified: 2026-10-10T00:00:00Z
status: human_needed
score: 5/5 requirements verified (PLAT-02 with an explicit goal-wording discrepancy)
overrides_applied: 0
human_verification:
  - test: "Open https://qollab.xyz/u/eehhaa/quantum-magnav in an incognito window, confirm card and write-up render, press Run on both the built-in simulator and IonQ Forte 1 (Remote simulator)"
    expected: "Page loads logged out and Run works, or the exact anonymous-user error text is recorded in docs/QOLLAB_FINDINGS.md"
    why_human: "Logged-out behavior of a client-rendered SPA cannot be checked by curl (only HTTP 200 confirmed)"
  - test: "Ask #hackathon-help about hardware credits (extra credits? cost of a ~500-shot single-circuit Forte 1 hardware run?) and record the answer"
    expected: "Answer recorded in docs/QOLLAB_FINDINGS.md Credits section; QNT-06 hardware-vs-proxy decision made"
    why_human: "External Slack interaction"
  - test: "Decide how the Quantum Impact theme tag is applied (Qollab tag list has no such tag)"
    expected: "Theme applied at submission or as the hackathon announces; README already states the theme"
    why_human: "Depends on organizer process"
---

# Phase 1 Verification

**Goal:** A Vite-bundled React page can call in-page Python and run one batched IonQ Forte 1 job on Qollab, and the repo satisfies every licensing and disclosure rule.

## Discrepancy (stated explicitly, not a silent pass)
The literal goal "one batched IonQ Forte 1 job" is NOT achievable on Qollab. docs/QOLLAB_FINDINGS.md records that the Qollab IonQ proxy rejects multi-circuit jobs (HTTP 400, "Only job type ionq.circuit.v1 is supported") and allows one IonQ job per Run. What was proven: the React bundle runs in the sandbox and calls in-page Python; the built-in simulator accepts a 2-circuit list (0.01 s); the Forte 1 remote simulator (29q, forte-1 noise) accepted a single-circuit job (11.38 s) and a 4096-shot job (11.77 s). PLAT-02's purpose (find out the batching limit and record it) is met: findings are in the repo, and magnav/api.py enforces n=1 for IonQ and rejects before submitting. The wording of PLAT-02 and the ROADMAP criterion ("batched") should be amended to "one single-circuit job per Run, max circuits per job = 1". This is a platform-driven deviation. Override suggestion (needs builder acceptance):
overrides: must_have "one batched backend.run job on IonQ Forte 1", reason "Qollab proxy accepts only ionq.circuit.v1; single-circuit job proven, limit documented".

## Requirements

| ID | Status | Evidence |
|----|--------|----------|
| PLAT-01 | VERIFIED | index.html, main.js (Vite bundle, starts `import * as e from "magnav.api"`), main.css, main.py, magnav/, requirements.txt, data/ present; ran on Qollab per findings |
| PLAT-02 | VERIFIED WITH DISCREPANCY | See above; findings recorded; REQUIREMENTS.md still marks it Pending and should be updated |
| PLAT-03 | VERIFIED | pyproject pins qiskit>=2.5.2, numpy 2.4, scipy 1.18, scikit-learn 1.8; .python-version 3.13; `uv run pytest -q`: 41 passed; ruff: all checks passed |
| PLAT-04 | VERIFIED | LICENSE is MIT (c) 2026 Eason Ha; attribution line count 1 in README.md and 1 in main.js; README has Theme: Quantum Impact and "AI tools and libraries used" section |
| PLAT-05 | VERIFIED | First code commit 2026-10-09T23:48 PDT, after window start 2026-10-09T16:00 PDT; public remote https://github.com/aaasocial/quantum-magnav; no pre-existing code found |

No orphaned requirement IDs: PLAN frontmatter (01-01: PLAT-01/03/04/05; 01-02: PLAT-01/04; 01-03: PLAT-01/02) covers all five IDs mapped to Phase 1.

## Warnings (non-blocking, for later phases)
- requirements.txt lists only qiskit; findings say scikit-learn is not preloaded in Pyodide, so Phase 4 must add it or use numpy code.
- Local qiskit-ionq is pinned 1.1.1 but platform has 1.0.2; avoid 1.1-only features.
- Quantum Impact tag absent from Qollab tag list.
- Working tree has untracked .playwright-mcp/ (consider .gitignore).
- Anti-pattern scan: no TBD/FIXME/XXX gating issues observed in the checked files; 01-REVIEW.md status fixed.

## Gaps
None blocking beyond the PLAT-02 wording discrepancy; status is human_needed because of the pending incognito test and Slack question.

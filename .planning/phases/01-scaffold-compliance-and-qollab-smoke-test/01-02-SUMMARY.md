---
phase: 01-scaffold-compliance-and-qollab-smoke-test
plan: 02
subsystem: web-smoke-page
tags: [react, vite, qollab, pyodide-bridge, accessibility]
requires:
  - "magnav.api.backend_info / run_bell_batch (01-01)"
provides:
  - "web/ Vite 8 lib-mode toolchain building main.js + main.css into the repo root"
  - "web/src/bridge.js callPy(name, ...args) via callPromising + JSON.parse; qBackend typeof guard"
  - "Body-only root index.html with #root"
  - "Committed main.js (304 kB, first line `import * as e from \"magnav.api\";`, no exports) and main.css"
  - "tests/test_qollab_contract.py static contract checks"
affects: [01-03]
tech-stack:
  added: [react 19.3.0, react-dom 19.3.0, vite 8.3.4, "@vitejs/plugin-react 6.1.2"]
  patterns: ["single callPy bridge (callPromising only)", "IonQ lock set before the call", "top-level await keep-alive", "magnav.* external in lib build, stub alias in dev"]
key-files:
  created: [web/package.json, web/package-lock.json, web/vite.config.js, web/index.html, web/src/bridge.js, web/src/dev/magnavApiStub.js, web/src/main.jsx, web/src/App.jsx, web/src/app.css, index.html, main.js, main.css, tests/test_qollab_contract.py]
  modified: []
decisions:
  - "IonQ lock is set before run_bell_batch is awaited (plus a synchronous ref guard), so a double click or a thrown error can never submit a second IonQ job"
  - "firstJobDone resolves in finally after the first IonQ submission, success or error"
  - "Dev server shows 'Backend unavailable' unless globalThis.backend is set; the stub only answers once a backend object exists"
metrics:
  duration: "~5 min"
  completed: 2026-10-09
  tasks: 2
  files: 13
---

# Phase 1 Plan 02: React smoke page bundled for Qollab Summary

Vite 8 lib-mode build turns a React 19 smoke page into exactly `main.js` + `main.css` in the repo root, calling `magnav.api` only through `callPromising`, submitting one batched Bell job per click and locking after one IonQ submission, with the attribution line stored in `main.js`.

## What was built

- **Toolchain:** `web/package.json` with exact pins (no caret), `package-lock.json` committed, 0 vulnerabilities. `web/vite.config.js` follows RESEARCH.md plus `build.target: 'esnext'` (top-level await), `publicDir: false`, `emptyOutDir: false`, `cssCodeSplit: false`, `external: [/^magnav(\..+)?$/]`, dev-only alias to the stub, `process.env.NODE_ENV` defined.
- **Bridge:** `web/src/bridge.js` exports `qBackend` (typeof guard, survives the build as `typeof backend < "u" ? backend : globalThis.backend ?? null`) and `callPy`, which throws on unknown names and returns `JSON.parse(await fn.callPromising(qBackend, ...args))`.
- **Page (`App.jsx`):** h1, backend `dl` from `backend_info` on mount (no job), labelled native selects (circuits 2/32/64/128, default 2; shots 100/200/500/1024/4096, default 200), native "Submit one job" button, `role="status" aria-live="polite"` status with the specified messages, "Counts per circuit" table (Circuit / Expected Φ+ or Ψ+ / Counts), focusable raw JSON `pre`, `console.log(JSON.stringify(result))`, footer with `This effort is supported by Qollab & IonQ.` and `Theme: Quantum Impact · MIT License`.
- **Keep-alive:** `main.jsx` renders and ends with `await firstJobDone`; the built bundle ends with `..., await b;`.
- **Entry:** root `index.html` is a single `#root` div with a loading paragraph, no html/head/body/script.

## Verification

- `npm --prefix web run build`: only `main.js` (303.90 kB, 78.62 kB gzip) and `main.css` (1.51 kB) appear in the root; no `assets/`.
- `uv run pytest -q`: 19 passed (13 from Plan 01 + 6 contract tests).
- All acceptance greps pass (attribution 1, callPromising 1, exports 0, `process.env` 0 in main.js).
- Dev server sanity: `vite` serves `bridge.js` with `magnav.api` rewritten to the stub and `App.jsx` returns 200; server stopped.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (RED) | 5c2561f | test(01-02): add failing Qollab contract test |
| 1 | 55149d7 | feat(01-02): Vite lib-mode toolchain, magnav.api bridge and body-only entry |
| 2 (GREEN) | 8ba8d06 | feat(01-02): React smoke page bundled to main.js with magnav.api bridge |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Cost safety] IonQ lock applied before the job, not after**
- **Found during:** Task 2
- **Issue:** Locking only after the result returns would allow a second click (or a retry after a thrown error) to attempt a second IonQ job, which stops the run (T-01-06).
- **Fix:** `ionqLocked` is set and a `useRef` guard flipped before `callPy('run_bell_batch', ...)`; selects are also disabled while busy or locked. The lock message is appended to both success and error statuses.
- **Files modified:** web/src/App.jsx
- **Commit:** 8ba8d06

Minor: `web/package.json` carries `"name": "magnav-web"` in addition to the RESEARCH.md fields (cosmetic, makes `npm ls` output readable).

## TDD Gate Compliance

RED `test(01-02)` (5c2561f, all 6 failing) precedes the `feat(01-02)` commits; index.html test turned green in 55149d7, the remaining five in 8ba8d06. No refactor commit needed.

## Known Stubs

- `web/src/dev/magnavApiStub.js` is intentional and dev-only (aliased only under `vite serve`, never bundled).
- README "How to run on Qollab" placeholder from Plan 01 remains for Plan 03 (packaging + human Qollab run).

## Threat Flags

None beyond the plan's threat model.

## Self-Check: PASSED

All 13 files found; commits 5c2561f, 55149d7, 8ba8d06 found in git log.

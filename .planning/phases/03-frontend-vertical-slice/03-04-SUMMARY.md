---
phase: 03-frontend-vertical-slice
plan: 04
subsystem: web-player-signal-live
tags: [ui-03, ui-05, a11y-01, a11y-02, recharts, live-mode, fallback, qollab, probes]
requires:
  - "03-01: magnav.api live_start/live_step/live_skip/live_result/live_cancel and artifact_json"
  - "03-03: App shell, ControlBar, StatusStrip, Announcer/announce(), probe.js, keep-alive liveRunFlag"
provides:
  - "web/src/components/SignalPanel.jsx: signal + residual LineCharts (accessibilityLayer off), RMSE legend, hook-based playhead"
  - "web/src/components/MetricsTable.jsx, TextAlternatives.jsx, JamBanner.jsx"
  - "web/src/lib/signal.js: signal/residual row builders, sampleIndices (60 s)"
  - "web/src/lib/liveRun.js: runLive, createLiveRunner, DEADLINE_MS, SKIP_PROJECTION_MS, STEP_BUDGET_MS"
  - "web/src/hooks/useLiveRun.js: React wrapper (probed callPy, performance.now, MessageChannel yield)"
  - "web/src/probe.js: measureFrames, probeLiveCall (main_thread, live_step, live_result, live_summary probes)"
  - "THIRD_PARTY_LICENSES.md shipped in dist/qollab-upload.zip"
  - "docs/QOLLAB_FINDINGS.md: Phase 3 player on Qollab section"
affects: [04, 05, 06]
tech-stack:
  added: [recharts (bundled, MIT), react-is (MIT)]
  patterns:
    - "Pure decision driver (runLive) with injected callPy/now/yield/validate; React hook holds no logic"
    - "90 s performance.now deadline checked before every live_step and before live_result; 80 s skip projection for raw/lowpass"
    - "Live result and precomputed data both go through lineView, so the fallback has identical visuals"
    - "Mode announcements joined with the triggering message in one announce() call (single polite region)"
key-files:
  created:
    - web/src/components/SignalPanel.jsx
    - web/src/components/MetricsTable.jsx
    - web/src/components/TextAlternatives.jsx
    - web/src/components/JamBanner.jsx
    - web/src/lib/signal.js
    - web/src/lib/signal.test.js
    - web/src/lib/liveRun.js
    - web/src/lib/liveRun.test.js
    - web/src/hooks/useLiveRun.js
    - THIRD_PARTY_LICENSES.md
  modified:
    - web/src/App.jsx
    - web/src/app.css
    - web/src/theme.js
    - web/src/components/ControlBar.jsx
    - web/src/components/StatusStrip.jsx
    - web/src/hooks/useArtifact.js
    - web/src/lib/announce.js
    - web/src/lib/announce.test.js
    - web/src/probe.js
    - tests/test_qollab_contract.py
    - tests/test_compliance.py
    - scripts/package_qollab.sh
    - README.md
    - main.js
    - main.css
    - docs/QOLLAB_FINDINGS.md
key-decisions:
  - "Chunked live mode validated on Qollab: 31.6 ms/window in Pyodide (2.7x CPython 11.5 ms); 1003.02 live run 28.8 s, 1007.06 projected ~40 s, both inside 90 s"
  - "Python runs on the page main thread on Qollab (1 frame during a 159 ms call): keep every Python call short; the 250 ms chunking is load-bearing"
  - "Qollab's injected setTimeout is not native and returns a promise: schedule with rAF / MessageChannel / performance.now only"
  - "Metrics table lives in the results section (UI-SPEC deliberate deviation from CONTEXT D-04); status strip keeps badge + provenance"
  - "Line/sensor selects are locked while a live run is in flight"
requirements-completed: [UI-03, UI-05, A11Y-01, A11Y-02]
metrics:
  duration: "~35 min (10:00-10:35 PDT, incl. Qollab check) + ~5 min wrap-up"
  completed: 2026-10-10
---

# Phase 3 Plan 04: Signal panel, live run with fallback, and Qollab check Summary

This plan adds a recharts signal and residual panel with RMSE badges, a results table and 60 s text tables, and the jam banner. It also adds an in-page live run driven by a pure, node-tested `runLive` with automatic fallback to the precomputed replay. The run was confirmed in the Qollab editor on the built-in simulator, uploaded and not published: 1003.02 / Mag 5 computed live in 28.8 s at 31.6 ms per window.

## Tasks

| # | Task | Commits | Result |
|---|------|---------|--------|
| 1 | Signal panel, metrics table, text alternatives, jam banner (TDD) | 99ee68e (test), 3c5af4f (feat) | Done |
| 2 | Pure runLive driver, useLiveRun, Run live UI, fallback, live probes (TDD) | b2aca3e (test), d2dc8e0 (feat) | Done |
| 3 | Bundle and compliance gates, README library rows, license file in upload | 6789dc8 | Done |
| 4 | Qollab editor check on the built-in simulator, upload only and no publish (checkpoint:human-verify) | 97edb8a (findings) | Approved. The orchestrator ran it with the builder's authorization |

## What was built

- **SignalPanel (UI-03).** Two recharts `LineChart`s (signal and residual), each with `accessibilityLayer={false}` and `isAnimationActive={false}`. Each series has its own colour and dash pattern, and the legend carries an RMSE badge from the artifact metrics. The residual subplot starts at the metric start, both charts have a "GPS jammed" reference line, and the playhead is drawn through `useXAxisScale` and the playback store, so playback does not re-render the charts.
- **MetricsTable.** The "Navigation accuracy" table shows mean error, CEP50/95, % under 556 m and signal RMSE. Dead reckoning is the first row, the current map track is marked "(on map)", and every number comes from the artifact.
- **TextAlternatives (A11Y-02).** Two closed `<details>` elements, "Map track data (every 60 s)" and "Signal data (every 60 s)", with captions, `th scope` on header cells, the jam row marked, and an RMSE `<tfoot>`.
- **JamBanner.** Shows "GPS jammed at t = … s — magnetic-only from here". It is not a live region.
- **runLive / createLiveRunner (UI-05).** Calls live_start, then live_step(250) in a loop, then live_result, with Step n of 4 progress. The 90 s deadline is checked before every step and again before live_result. raw and lowpass are skipped when the projection passes 80 s. Any failure calls live_cancel, and a synchronous guard rejects a second start. The node tests cover throw, `ok:false`, simulated failure, InvalidShape, Timeout before a step and before live_result, both skip cases, and the Busy guard.
- **Live UI.** "Run live in-page" has help text, and a Demo options entry "Simulate a compute failure". Success switches the badge to "computed in-page". Failure clears `liveOverride`, shows the precomputed replay with the "precomputed replay" badge, and adds a danger notice. All announcements go through Plan 03's single polite region.
- **Gates.** main.js must stay under 1.5 MB, contain no artifact copy, and have `accessibilityLayer={false}` on every LineChart. Unsafe HTML is banned in web/src. UI copy must be present in the bundle, and THIRD_PARTY_LICENSES.md is checked for presence and freshness and ships in the upload zip. The README discloses recharts, react-is, d3-scale-chromatic and the libraries bundled with recharts.

**Final sizes:** main.js 848,058 bytes (budget 1,500,000), main.css 9,691 bytes. **Tests:** 45 node lib tests pass; `uv run pytest -q` 148 passed.

## Qollab check (Task 4), 2026-10-10 10:30-10:35 PDT

Chrome (Playwright), signed in as `eehhaa`, project https://qollab.xyz/u/eehhaa/quantum-magnav in edit mode. `dist/qollab-upload.zip` (27 files, 6.5 MB unpacked, each under 2 MB) was uploaded with Unpack → "Keep and add". **Not published.** Visitors still see v0.1.1-smoke. Full record: `docs/QOLLAB_FINDINGS.md`, "Phase 3 player on Qollab (2026-10-10)".

- **Render:** the full player appeared about 10 s after Pyodide's package install. The only console message was Qollab's own Babel ">500KB deoptimised styling" note, which is not fatal.
- **Probes:**
  - `[probe] timers {"sameAsGlobal":false,"nativeGlobal":true,"returnsPromise":true,"setIntervalType":"function","setIntervalNative":true}`
  - `[probe] main_thread {"call":"artifact_json","ms":7,"frames":1,"maxGapMs":0}`
  - `[probe] artifact_load {"ms":9}`
  - `[probe] frame {"innerHeight":520,"scrollHeight":1797,"dpr":2}`
  - `[probe] live_step` ×107. The first was `{"ms":159,"budgetMs":250,"frames":1,"maxGapMs":0,"stage":2,"fitting":"select","windowsDone":0}`
  - `[probe] live_result {"ms":68,"frames":1,"maxGapMs":0}`
  - `[probe] live_summary {"line":"1003.02","sensor":"mag_5_uc","totalS":28.77,"windows":834,"msPerWindow":31.6,"maxStage2CallMs":160,"budgetMs":250,"skipped":[],"outcome":"ok"}`
- **Playback:** at 60×, 25 s of wall time reached t = 2,157 s and the jam banner showed. The readout said TL was 279 m off and dead reckoning 1605 m off.
- **Live run:** finished in 28.8 s with the "computed in-page" badge. Nothing was skipped.
- **Fallback:** a simulated failure produced the "precomputed replay" badge and the exact notice "Live run failed: RuntimeError: Simulated failure (demo of the fallback). Showing the precomputed replay for 1003.02 / Mag 5."
- **Line/sensor switch** to 1007.06 / Mag 4: the slider, hint, map caption, RMSE footnote and announcement all updated. No errors.

**Interpretation:**
1. Python runs on the page's main thread, so the 250 ms chunking is what keeps the UI responsive.
2. The injected `setTimeout` is not the native one and returns a promise. Keep using rAF, MessageChannel and `performance.now`.
3. The preview iframe is a fixed 520 px tall while the content is 1797 px. See Follow-ups.
4. Live mode runs at 31.6 ms per window, 2.7× CPython and inside the 1.5-3× assumption. 1007.06 projects to about 40 s, well inside 90 s.

## Deviations from Plan

### Auto-adjusted during Tasks 1-3

1. **[Rule 1 - Bug] Announcements are joined.** The single polite region only keeps the latest text, so a mode change is announced in the same `announce()` call as the message that caused it. Examples: "Mode: computing in-page. Step 1 of 4." and "Live run failed. Showing the precomputed replay. Mode: precomputed replay." `modeText` drops the badge's trailing ellipsis so speech ends on one full stop. Files: web/src/App.jsx, web/src/lib/announce.js (+ test). Commit d2dc8e0.
2. **Mode keys.** The App mode values are `precomputed`, `computing` and `computed`, not the plan's `'live'`. They map one-to-one to the UI-SPEC badges "precomputed replay", "computing in-page…" and "computed in-page" through `badgeText`. Commit d2dc8e0.
3. **Probe location.** The `main_thread` probe for `artifact_json` is in `web/src/hooks/useArtifact.js`, where the call is made, instead of App. The `live_step` and `live_result` probes come from a `probeLiveCall` wrapper around the bridge `callPy` in `useLiveRun`, instead of `onStep`, so every Python call is timed, including stage-2 fits and live_result. The probe output is the same. Commit d2dc8e0.
4. **[Rule 2 - Correctness] Selects are locked during a live run.** The Flight line and Sensor selects are disabled (`selectionLocked={live.inFlight}`) while a live run is running. Without this, a selection change mid-run could apply a result to the wrong line × sensor. Changing the selection after a run still clears `liveOverride` as the plan specifies. Commit d2dc8e0.
5. **Success message.** "Live run finished in {s} s. Showing results computed in your browser." goes in the status strip's normal status line, not a danger or success notice. It stays until the next selection change or run. Commit d2dc8e0.

### Design note (not a deviation from the UI-SPEC)

- **D-04 metrics-table placement.** CONTEXT D-04 puts a metrics mini-table in the status strip. The UI-SPEC deliberately moves it to the results section ("Navigation accuracy") and reads `lines[i].metrics`, the same numbers as `metrics_table`. The status strip keeps the mode badge and provenance line. This plan follows the UI-SPEC.

## Pending / Follow-ups

- **Publish is not done.** Publishing a new Qollab version, for example v0.2, needs a separate checkpoint:human-action with the builder's explicit written approval (CLAUDE.md gate). Visitors still see v0.1.1-smoke.
- **Keyboard walkthrough on Qollab itself was not repeated.** The tab order, reduced-motion check and achromatopsia check were done in headless Chrome on `vite dev` during Tasks 1-3. The full walkthrough on Qollab belongs to A11Y-03 in Phase 5.
- **1007.06 live run on Qollab was not run.** It projects to about 40 s.
- **Preview iframe height (Phase 5 polish).** The Qollab preview is a fixed 520 px tall while the page is 1797 px, so a judge sees only the header and control bar without scrolling or pressing Fullscreen. Phase 5 should make the layout compact (map first, smaller control bar), and the README "How to run" should tell judges to use Fullscreen.
- Qollab passes main.js through Babel and logs a >500KB deoptimisation note. It does not break anything. A smaller bundle would make it go away.

## Known Stubs

- The quantum series is still the Phase 3 stub: it copies TL ("Same as TL until Phase 4"). This is intentional, and Phase 4 replaces it.

## Threat Flags

None. No new network endpoints or job-submission paths were added. No JS path calls `run_bell_batch` (grep gate), and live_* never call backend.run.

## Self-Check: PASSED

- Files exist: web/src/components/SignalPanel.jsx, web/src/lib/liveRun.js, web/src/hooks/useLiveRun.js, THIRD_PARTY_LICENSES.md, docs/QOLLAB_FINDINGS.md (Phase 3 section count 1)
- Commits exist: 99ee68e, 3c5af4f, b2aca3e, d2dc8e0, 6789dc8, 97edb8a

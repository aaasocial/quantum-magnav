---
phase: 03-frontend-vertical-slice
verified: 2026-10-10T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Re-run live mode in a browser (Qollab or vite dev) after the review fixes CR-01, WR-01, WR-02, WR-05"
    expected: "Live run still finishes, raw and lowpass are skipped by the new _advance logic, End run during a live run does not overwrite status, and fallback badge still works"
    why_human: "The fixes were made after the Qollab run and are covered by unit tests only; no browser re-check is recorded"
  - test: "Full keyboard walkthrough on Qollab itself"
    expected: "Every control reachable with visible focus; Space and Enter work; no focus trap inside the iframe"
    why_human: "Only done in headless Chrome on vite dev; 03-04-SUMMARY defers the Qollab-side walkthrough (A11Y-03, Phase 5)"
  - test: "prefers-reduced-motion and achromatopsia emulation on Qollab"
    expected: "Stepped updates under reduced motion; series distinguishable by dash pattern and markers without colour"
    why_human: "Visual check, done only on vite dev"
---

# Phase 3: Frontend vertical slice Verification Report

**Phase Goal:** A judge opening the Qollab project sees the drone icon hold its position after GPS is jammed, with the denoising evidence beside it, and the demo never breaks because a failed live run falls back to the precomputed replay.
**Status:** human_needed (all automated and recorded checks pass)

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Player renders on Qollab from a single RunArtifact (UI-01) | VERIFIED | 03-04-SUMMARY Qollab run; main.js bundle 850,757 B (<1.5 MB), starts with `import * as ... from "magnav.api"`, 0 `export` lines, 0 `precomputed_run` refs; artifact 1.03 MB |
| 2 | Map shows drone holding position after jam with error readout (UI-02) | VERIFIED | Qollab playback: at t=2157 s jam banner shown, TL 279 m off vs dead reckoning 1605 m |
| 3 | Signal panel with traces, RMSE badges, residual, text tables (UI-03) | VERIFIED | SignalPanel.jsx present, `accessibilityLayer={false}` x2; 57 JS tests pass; Qollab render recorded |
| 4 | Live run in-page, automatic fallback with badge (UI-05) | VERIFIED | Qollab: live run 28.8 s, "computed in-page" badge; simulated failure gave "precomputed replay" badge and notice; magnav/live.py in upload zip; `backend.run` absent from live.py |
| 5 | Keyboard, aria-live, non-colour encoding, reduced motion, text alternatives (A11Y-01/02) | VERIFIED (code and headless evidence) | Single aria-live region (Announcer.jsx role=status polite); headless Chrome checks in 03-03/03-04; see human items for Qollab-side repeat |

**Score:** 5/5

## Probes and spot-checks

| Check | Result |
|-------|--------|
| `uv run pytest -q` | 151 passed |
| `npm --prefix web test` | 57 pass, 0 fail |
| `ruff check` | All checks passed |
| dist/qollab-upload.zip | contains magnav/live.py, data/precomputed_run.json, THIRD_PARTY_LICENSES.md; no main.py, node_modules, web/ |
| TBD/FIXME/XXX in web/src, live.py | none |

## Requirements Coverage

| ID | Plans | Status |
|----|-------|--------|
| UI-01 | 03-01, 03-03 | SATISFIED |
| UI-02 | 03-03, 03-04 | SATISFIED |
| UI-03 | 03-02, 03-04 | SATISFIED |
| UI-05 | 03-01, 03-02 | SATISFIED |
| A11Y-01 | 03-02, 03-04 | SATISFIED |
| A11Y-02 | 03-02, 03-03, 03-04 | SATISFIED |

No orphaned requirements: UI-04 (Phase 4), UI-06 and A11Y-03 (Phase 5) are mapped to later phases.

## Notes (not gaps)

- The Qollab preview iframe is 520 px tall against 1797 px of content, so a judge sees only the header and controls without Fullscreen. This is a UX concern for Phase 5 polish.
- Publishing a new Qollab version is still pending the CLAUDE.md approval gate; visitors see v0.1.1-smoke.
- 03-REVIEW.md is status fixed, but CR-01/WR-01/WR-02/WR-05 are marked as needing a browser check (human item 1).

## Gaps Summary

None. Remaining items are human confirmations only.

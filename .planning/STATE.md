---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: ready_to_plan
stopped_at: Phase 3 complete (4/4) — ready to discuss Phase 4
last_updated: 2026-10-10T17:58:31.064Z
last_activity: 2026-10-10
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 10
  completed_plans: 10
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-10-09)

**Core value:** Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.
**Current focus:** Phase 4 — quantum denoiser and ionq runs

## Current Position

Phase: 4 of 6 (quantum denoiser and ionq runs)
Plan: Not started
Status: Ready to plan
Last activity: 2026-10-10

Progress: [██████████] 100%

**Deadline:** Oct 11, 2026 4:00 PM PDT (7:00 PM ET). Phase 6 keeps ~3 h buffer before it.

## Performance Metrics

**Velocity:**

- Total plans completed: 10
- Average duration: -
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | - | - |
| 2 | 3 | - | - |
| 3 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 6 min | 2 tasks | 13 files |
| Phase 01 P02 | 5 min | 2 tasks | 13 files |
| Phase 01 P03 | 45 min | 2 tasks | 6 files |
| Phase 02 P01 | 10 min | 3 tasks | 21 files |
| Phase 02 P02 | 35 min | 2 tasks | 8 files |
| Phase 02 P03 | 21 min | 3 tasks | 16 files |
| Phase 03 P01 | 7 min | 2 tasks | 7 files |
| Phase 03 P02 | 12 min | 2 tasks | 22 files |
| Phase 03 P03 | 9 min | 3 tasks | 15 files |
| Phase 03 P04 | 35 min | 4 tasks | 26 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Research SUMMARY phases 4 (quantum local) and 5 (IonQ run + hardware) merged into one Phase 4 under coarse granularity; 6 phases total
- [Roadmap]: Vertical slice (sim → classical → nav → precomputed artifact → React player) completes in Phases 2-3 before quantum work; the quantum slot is a stub with its final interface until Phase 4
- [Roadmap]: BASE-02 (equal-feature KRR) built in Phase 2 so the fair comparison partner exists before the quantum model
- [Roadmap]: Training only via local Statevector; exactly one batched `backend.run` for inference; hardware job submitted as soon as the circuit is frozen in Phase 4
- [Phase 01]: [01-01]: magnav.api returns JSON strings, validates inputs against allowlists before any backend call, and calls backend.run exactly once (pytest spy guard)
- [Phase 01]: [01-01]: Node lives at ~/.local/node/bin and is not on the default PATH; Plan 02 must prepend it
- [Phase 01]: IonQ lock set before run_bell_batch is awaited, with a synchronous ref guard, so no second IonQ job is possible
- [Phase 01]: Vite build.target esnext required for main.jsx top-level await keep-alive
- [Phase 01]: [01-03]: Qollab IonQ proxy accepts only job type ionq.circuit.v1 - every IonQ job holds exactly 1 circuit and 1 job per Run (supersedes 'one batched backend.run'); Phase 4 packs all windows into one circuit (disjoint qubit blocks on 29q Forte 1 sim) or runs bulk on built-in sim/Aer forte-1 noise
- [Phase 01]: [01-03]: Submission format = Qollab JS project; shots <= 4096 (verified), ~12 s per Forte 1 job; sklearn not preloaded (add to requirements.txt or use numpy); platform qiskit-ionq 1.0.2
- [Phase 02]: [02-01]: TERCOM output median uses the last 3 raw estimates propagated to the current window end by DR increments (output-only)
- [Phase 02]: [02-01]: Thin run: raw/lowpass drift on both lines; DR mean 1091/1112 m; truth-signal TERCOM holds at ~70-80 m
- [Phase 02]: 02-02: kept flux_a + calibration-split lambda (D-09); held-out-informed alternatives documented in 02-02-SUMMARY, not applied
- [Phase 02]: D-19 applied: flux_a kept for both sensors by 5-block full-band CV on 1006.08; lambda Mag 5 0.1, Mag 4 0.01; Mag 5 TL now holds on both held-out lines (98.6% / 100.0% under 556 m)
- [Phase 02]: RunArtifact v1 committed (1.04 MB) with acceptance block 7/7 PASS; Phase 3 replays data/precomputed_run.json
- [Phase 03]: 03-01: live API stage 2 fits one denoiser per live_step call (select, raw, lowpass, tl, quantum); stage 3 advances tercom_steps within budget_ms (clamped 50-2000)
- [Phase 03]: 03-01: live quantum estimate copies TL while the quantum slot is the stub; a quantum TERCOM generator is added automatically once cleaned quantum differs from TL
- [Phase 03]: 03-02: estimate/DR overlays and jam marker start at jam.display_index (pre-jam they equal truth exactly)
- [Phase 03]: 03-02: node lib tests run as node --test "src/lib/*.test.js" (Node 24 rejects a directory argument)
- [Phase 03]: 03-02: app.css has a MapView section using UI-SPEC tokens only; the Plan 03 theme rewrite must keep it
- [Phase 03]: 03-03: announce throttle has mark(); Play and jam announcements restart the 10 s readout interval so the readout never clobbers them
- [Phase 03]: 03-03: keep-alive treats playing / live-in-flight as activity; runDone resolves only on End run or 30 min idle (never on missing backend)
- [Phase 03]: 03-04: chunked live mode validated on Qollab: 31.6 ms/window in Pyodide (2.7x CPython); 1003.02 live run 28.8 s, 1007.06 projected ~40 s, inside the 90 s deadline
- [Phase 03]: 03-04: on Qollab Python runs on the page main thread and the injected setTimeout returns a promise; keep Python calls short and schedule with rAF/MessageChannel/performance.now

### Pending Todos

None yet.

### Blockers/Concerns

- Windowed-correlation (TERCOM-style) navigation is now the default; the particle filter is an optional stretch, and if built its Pyodide performance is untested (keep particle counts moderate; precompute is the default)
- Raw data verified 2026-10-10: Flt1003/1006/1007_train.h5 (123/83/88 MB, sizes match Zenodo) and ottawa_area_maps Eastern_395/Renfrew_395/Perth_800/HighAlt_5181.h5 open with h5py in `data_raw/`; lines 1003.02 (63 min), 1006.08 (14 min), 1007.06 (87 min) present. Maps are ~30 m grids (Eastern 6238x4881, Renfrew 3331x3841), so Phase 2 must crop to the line bounding box and downsample to stay under 2 MB
- Map coverage: line bounding boxes fall inside the Eastern_395 (1003.02, 1006.08) and Renfrew_395 (1007.06) extents; still confirm in Phase 2 preprocessing that they lie in the valid (non-k-NN-filled) mask area (Eastern mask 46% valid, Renfrew 56%)
- Incognito (logged-out) Run test of https://qollab.xyz/u/eehhaa/quantum-magnav pending from builder; PLAT-02 stays Pending until done
- Slack #hackathon-help credits question pending (extra credits? cost of ~500-shot Forte 1 hardware run); 100 credits on profile; decides QNT-06
- Phase 4 must use exactly one circuit per IonQ job (multi-circuit jobs rejected with HTTP 400)
- Qollab has no 'Quantum Impact' tag; theme-tag mechanism for submission unknown
- Mag 5 TL does not hold on 1007.06 (26.9% under 556 m) with flux_a/cal-split lambda; user must choose TL config (A plan / B flux_d / C MagNav lambda 0.025) at the Plan 03 checkpoint - see 02-02-SUMMARY
- Qollab preview iframe is a fixed 520 px tall vs 1797 px content: judges see only header + control bar without scrolling/Fullscreen; Phase 5 compact map-first layout + README How-to-run note
- Phase 3 player uploaded to the Qollab editor but NOT published (visitors see v0.1.1-smoke); publishing needs builder's explicit approval

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| fast | add submission approval gate for agents (CLAUDE.md, PROJECT.md) | 2026-10-10 | 9d704bd | — |
| 261010-0kt | replace synthetic world with SGL flight data and Ottawa maps in planning docs | 2026-10-10 | 4785288 | [261010-0kt-replace-synthetic-world-with-sgl-flight-](./quick/261010-0kt-replace-synthetic-world-with-sgl-flight-/) |

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-10-10T17:38:06.921Z
Stopped at: Completed 03-04-PLAN.md
Resume file: None

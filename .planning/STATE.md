---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Completed 01-03-PLAN.md
last_updated: "2026-10-10T08:07:55.225Z"
last_activity: 2026-10-10
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 17
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-10-09)

**Core value:** Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.
**Current focus:** Phase 1 - Scaffold, Compliance and Qollab Smoke Test

## Current Position

Phase: 1 of 6 (Scaffold, Compliance and Qollab Smoke Test)
Plan: 3 of 3 in current phase
Status: Phase complete — ready for verification
Last activity: 2026-10-10 - Completed 01-03 (Qollab smoke test, findings, public repo, v0.1-smoke published)

Progress: [██████████] 100%

**Deadline:** Oct 11, 2026 4:00 PM PDT (7:00 PM ET). Phase 6 keeps ~3 h buffer before it.

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 6 min | 2 tasks | 13 files |
| Phase 01 P02 | 5 min | 2 tasks | 13 files |
| Phase 01 P03 | 45 min | 2 tasks | 6 files |

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

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 261010-0kt | replace synthetic world with SGL flight data and Ottawa maps in planning docs | 2026-10-10 | 4785288 | [261010-0kt-replace-synthetic-world-with-sgl-flight-](./quick/261010-0kt-replace-synthetic-world-with-sgl-flight-/) |

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-10-10T08:05:37.138Z
Stopped at: Completed 01-02-PLAN.md
Resume file: None

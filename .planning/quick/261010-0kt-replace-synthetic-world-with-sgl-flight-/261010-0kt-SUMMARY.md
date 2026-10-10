---
phase: quick-261010-0kt
plan: 01
subsystem: planning-docs
tags: [planning, data, sgl-2020, magnav, scope-change]
requirements: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, METR-06, DOCS-05]
key-files:
  modified:
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/STATE.md
    - .gitignore
decisions:
  - Real SGL 2020 flight data replaces the synthetic world (stinger Mag 1 = truth, cabin Mags 3/4/5 = polluted sensors)
  - Calibration line 1006.08; held-out lines 1003.02 and 1007.06
  - INS drift is simulated from ins_vn/ins_vw (recorded INS is GPS-aided)
  - Navigation map is MagNav.jl Eastern_395 / Renfrew_395 with validity mask; EMAG2v3 comparison only
  - Windowed-correlation (TERCOM-style) navigation is the default; particle filter is optional stretch NAVX-03
  - Phase 5 evidence is multi-segment plus training-size and cabin-sensor sweeps; map-roughness sweep dropped
metrics:
  completed: 2026-10-10
  tasks: 3
  files: 5
---

# Quick 261010-0kt: Replace Synthetic World with SGL Flight Data Summary

The planning docs now describe a real-data MagNav pipeline. It uses DAF-MIT AIA / SGL 2020 flight lines (calibration line 1006.08, held-out lines 1003.02 and 1007.06) and the MagNav.jl Eastern_395 / Renfrew_395 maps. A simulated INS drift serves as the prior, and windowed-correlation navigation is the default. `data_raw/` is gitignored.

## Tasks

| Task | Result |
|------|--------|
| 1. PROJECT.md rewrite, Key Decisions, STATE.md blockers, .gitignore | Done. The verify command printed OK |
| 2. REQUIREMENTS.md: SIM-* replaced by DATA-*, plus METR-06 and DOCS-05, traceability updated | Done. The verify command printed OK. There are 43 v1 checkbox requirements and 43 are mapped |
| 3. ROADMAP.md: Phase 2 rewritten; Phases 3/5/6, overview, cut order and progress table updated | Done. The verify command printed OK |

All three tasks went into a single commit, as instructed: `4785288` docs(planning): replace synthetic world with SGL 2020 flight data and Ottawa maps.

## Verification

- Task 1, 2 and 3 automated grep checks: all printed `OK`.
- `git diff --stat` (before commit) touched only .gitignore, PROJECT.md, REQUIREMENTS.md, ROADMAP.md and STATE.md.
- `git status --short` no longer lists `data_raw/` (`git check-ignore data_raw/LICENSE.md` succeeds).
- Core Value lines in PROJECT.md and REQUIREMENTS.md are unchanged. They appear in the diff only as hunk context.
- ROADMAP Phase 1 and Phase 4 sections are unchanged. Only the overview paragraph mentioning them was edited, as the plan specified.
- Scan of added lines for "placeholder", "for now" and "simplified" found nothing. "v1" appears only in the pre-existing "v1 requirements: 43 total" coverage label that the plan specifies.
- Remaining "synthetic"/"seeded" mentions are only in Out of Scope entries, the superseded Key Decision row and the Data note/footer, which the plan intends.

## Deviations from Plan

The plan said to use the Edit tool. The session's bypass-mode instruction prefers Bash, so the edits were applied with a Python exact-string replacement script that asserts exactly one match per replacement. The resulting content matches the plan text. There were no content deviations.

## Known Stubs

None. This task changed docs only.

## Self-Check: PASSED

- All five modified files exist and are in commit 4785288 (`git show --stat HEAD`).
- data_raw/ was not staged or committed.

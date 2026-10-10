---
phase: 02-real-flight-data-and-classical-pipeline
verified: 2026-10-10T00:00:00Z
status: human_needed
score: 5/5 roadmap truths verified (SC2 qualified per sensor)
overrides_applied: 0
gaps: []
human_verification:
  - test: "Run `uv run python main.py` once on the dev machine and read the printed table and figures"
    expected: "Numbers match data/precomputed_run.json (DR drifts, raw drifts, Mag 5 TL holds >= 90%); 7/7 acceptance checks print PASS"
    why_human: "Full run takes 3-4 min; verifier relied on the regression test tying the artifact to the code instead of re-running"
  - test: "Decide whether the Mag 4 result on 1007.06 (TL holds 80.1% under 556 m, mean 454 m; KRR degrades to 7480 m) is acceptable to present"
    expected: "Judge accepts reporting Mag 5 as the headline sensor and Mag 4 as an honest partial result"
    why_human: "Roadmap SC2 wording does not name a sensor; this is a presentation/honesty judgment"
---

# Phase 2 Verification

**Goal:** One command on real SGL 2020 data shows, with numbers, that after a simulated GPS jam DR and raw-cabin tracks drift while the TL-cleaned track holds on held-out lines.

## Checks run
- `uv run pytest -q`: 111 passed. `ruff check`: clean.
- `data/` files all under 2 MB (largest 1.48 MB, precomputed_run.json 1.03 MB). `git grep h5py -- magnav/`: no matches (h5py is confined to scripts/).
- Artifact: schema_version 1, keys include acceptance, metrics_table, provenance. Acceptance 7/7 passed. Provenance has source SHA-256s, tt ranges, decimation, seed, jam_fraction, cal_line, INS drift parameters.

## Truths
| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Real SGL excerpts and cropped maps exist, small, with provenance (DATA-01..03) | VERIFIED | Three line npz, two map npz, provenance.json with SHA-256 |
| 2 | Truth/Sensors split; simulated INS drift (DATA-04/05) | VERIFIED | magnav/data.py, frames.py, tests/test_truth_guard.py pass; DR mean error 2270.6 m (1003.02), 5438.5 m (1007.06), above 556 m |
| 3 | Baselines TL, KRR, low-pass, trained on 1006.08, evaluated on held-out lines (BASE-01..04) | VERIFIED | classical.py; metrics rows for raw, lowpass, tl, tl_currents, krr per sensor and line |
| 4 | TERCOM matcher run per denoiser after a jam event (NAV-01..03) | VERIFIED | nav.py, pipeline.py; jam_fraction 0.25; all denoisers evaluated on identical windows |
| 5 | Metrics reported (METR-01) | VERIFIED | RMSE, error std, mean, final, CEP50/95, % under thresholds in metrics_table |

### Roadmap SC2 (TL holds within RNP threshold), judged per sensor
- Mag 5 (mag_5_uc): TL holds 99.3% (1003.02) and 99.5% (1007.06) under 556 m; mean 127.9 m and 146.2 m. Raw: 8.9% and 0.8%. Clear pass.
- Mag 4 (mag_4_uc): on 1003.02 TL mean 170.7 m vs DR 2270.6 m and raw 1985.9 m (beats both). On 1007.06 TL mean 454.0 m vs DR 5438.5 m and raw 4108.5 m, but holds only 80.1% under 556 m, below the 90% bar used for Mag 5. This is a partial result for Mag 4, stated as such and not averaged away. (The brief said about 70%; the artifact shows 80.1%.)
- KRR (BASE-02) is implemented with equal features and split. It matches TL on Mag 5 but degrades Mag 4 on 1007.06 (mean 7480.1 m, 20.7% under 556 m). Reported, not tuned.

## Requirements coverage
All 13 IDs (DATA-01..05, BASE-01..04, NAV-01..03, METR-01) appear in the PLAN frontmatter (02-01: BASE-01/02/04, NAV-02; 02-02: DATA-01..05, BASE-03, NAV-01/03, METR-01; 02-03: METR-01, NAV-02, BASE-04, DATA-03) and are marked Complete in REQUIREMENTS.md. No orphans. All SATISFIED by the evidence above.

## Notes and warnings
- The "quantum" denoiser is currently a stub: its metrics are identical to TL. That is expected for Phase 2 (floor only), but it must not be presented as a quantum result.
- No TBD/FIXME debt markers were searched exhaustively; the code review (02-REVIEW.md) is status fixed, and the post-fix artifact is regression-tested.
- Full main.py was not re-run (per instruction).

## Gaps
None blocking. Status is human_needed only because of the two human items above.

---
phase: 02-real-flight-data-and-classical-pipeline
plan: 01
subsystem: data-and-navigation
tags: [sgl2020, preprocessing, npz, tercom, dead-reckoning, metrics]
requires: []
provides:
  - "data/*.npz excerpts (3 lines, 2 maps) + data/provenance.json"
  - "magnav.data (Truth/Sensors/MapTile, literal paths, loaders)"
  - "magnav.frames (local true-north frame)"
  - "magnav.nav (simulate_dr, anomaly_signal, tercom)"
  - "magnav.classical (denoiser protocol, raw, lowpass, build_denoisers)"
  - "magnav.metrics (signal/position metrics, table)"
  - "magnav.pipeline.run_pipeline"
affects: [02-02, 02-03, phase-03, phase-04]
tech-stack:
  added: []
  patterns:
    - "h5py only in scripts/preprocess_sgl.py, run via uv run --with h5py python -I"
    - "savez_compressed with sorted keys; JSON without timestamps -> byte-identical re-runs"
    - "Recursive INS-propagated TERCOM prior with NCC gate and coasting"
key-files:
  created:
    - scripts/preprocess_sgl.py
    - data/flt1006_line08.npz
    - data/flt1003_line02.npz
    - data/flt1007_line06.npz
    - data/map_eastern_395.npz
    - data/map_renfrew_395.npz
    - data/provenance.json
    - magnav/data.py
    - magnav/frames.py
    - magnav/nav.py
    - magnav/classical.py
    - magnav/metrics.py
    - magnav/pipeline.py
    - tests/test_data_files.py
    - tests/test_preprocess_repro.py
    - tests/test_nav.py
    - tests/test_truth_guard.py
    - tests/test_metrics.py
    - tests/test_pipeline.py
  modified:
    - scripts/package_qollab.sh
    - main.py
decisions:
  - "TERCOM output median is taken over the last 3 raw estimates each propagated to the current window end by DR increments (a median of raw positions 10 s apart would lag ~680 m)"
  - "NavResult carries extra est_x/est_y (raw per-window estimates) so the invalid-cell guarantee is testable"
  - "Sensors.t and Truth.t are seconds since line start (jam t = 946.0 s / 1310.0 s)"
  - "LowPassDenoiser filters the deviation from the line mean so the ~53,000 nT level adds no edge transient"
metrics:
  duration: "~10 min"
  completed: 2026-10-10
  tasks: 3
  files: 21
---

# Phase 2 Plan 01: Real SGL Excerpts, INS Drift, TERCOM and Thin Metrics Summary

The real SGL 2020 data now ships as five byte-reproducible npz excerpts plus a provenance file. `magnav/` loads them into a Truth/Sensors split, simulates seeded INS drift, and runs a gated recursive-prior TERCOM over the Eastern/Renfrew tiles. `python main.py` prints dead-reckoning, raw-cabin and low-pass rows for Mag 5 and Mag 4 on both held-out lines.

## What was built

- **Task 1 (e352e4f, bd4555c):** `scripts/preprocess_sgl.py`, the only file that imports h5py. It matches the line id exactly, decimates 10 Hz to 2 Hz with a block mean of 5 (circular mean for yaw), derives `igrf = mag_1_dc - mag_1_igrf` at 10 Hz, crops each map with the transpose applied (bbox + 5 km), downsamples 4x with an all-valid mask, and writes compressed npz files with sorted keys. `provenance.json` records the source and output SHA-256, tt range, decimation, channels, and track-valid fractions (all 1.0, including 1006.08 on the Eastern crop). The `DATA_FILES` allowlist was extended. Tests cover the size cap, npz layout and dtypes, the provenance hashes, and a byte-identical re-run (it PASSES on this machine; it does not skip).
- **Task 2 (be09da7):** `magnav/frames.py` provides the equirectangular true-north frame. `magnav/data.py` holds the literal path constants, the frozen `Truth`/`Sensors`/`MapTile` classes, and bilinear sampling whose validity requires all 4 neighbouring cells. `magnav/nav.py` provides `simulate_dr` (`ve = -ins_vw`, bias signs drawn before the walk), `anomaly_signal`, and `tercom`. Tests cover the split, frame vs UTM (< 0.5%), map vs `mag_1_igrf` (corr > 0.99), DR signs and seed, and three synthetic TERCOM checks (planted 700 m offset, masked band, pure-noise coast). An AST truth guard and an h5py/pickle guard were added, plus `test_literal_paths`.
- **Task 3 (eefa792, c820b06):** `magnav/classical.py` has `RawDenoiser` and `LowPassDenoiser` (4th-order Butterworth at 0.05 Hz, sosfiltfilt) and `build_denoisers`. `magnav/metrics.py` and `magnav/pipeline.py` (`run_pipeline`) are new. `main.py` was rewritten as the one-command runner (no `main()`, the backend fallback is kept, `run_bell_batch` was dropped).

Sanity check outside the test suite: TERCOM fed the truth anomaly signal (`mag_1_c - igrf - diurnal`) holds at 71 m mean / 65 m CEP50 on 1003.02 and 78 m / 63 m on 1007.06, with every window accepted. This matches the research prototype's 60/68 m.

## Data file sizes

| File | Bytes |
|---|---|
| data/flt1006_line08.npz | 255,411 |
| data/flt1003_line02.npz | 1,076,448 |
| data/flt1007_line06.npz | 1,476,627 |
| data/map_eastern_395.npz | 419,729 (353 x 323, 100% valid) |
| data/map_renfrew_395.npz | 1,296,710 (624 x 558, 84% valid) |
| data/provenance.json | 6,115 |

## Printed metrics table (`uv run python main.py`, 55 s locally)

```
Quantum MagNav - classical pipeline on SGL 2020 (calibration line 1006.08)
seed=0  INS bias=0.3 m/s  random walk=0.05 m/s/sqrt(s)  TERCOM gate=0.85
Line 1003.02: GPS jammed at t=946.0 s (index 1892) of 7568 samples
Line 1007.06: GPS jammed at t=1310.0 s (index 2620) of 10480 samples

line     sensor    denoiser         sig_std  sig_rmse   mean_m  final_m   cep50   cep95  %<556  %<1nmi  %<2nmi  acc/win
-----------------------------------------------------------------------------------------------------------------------
1003.02  -         dead_reckoning         -         -     1091      957    1204    1718   24.5   100.0   100.0        -
1003.02  mag_5_uc  raw                104.6     106.9     3286      275    4083    7464   35.6    41.3    43.5  202/278
1003.02  mag_5_uc  lowpass            104.6     106.9      452      659     137    2724   80.4    93.2    99.3  260/278
1003.02  mag_4_uc  raw                197.4     202.5     1972     7870    1288    5614   39.2    56.9    77.0  189/278
1003.02  mag_4_uc  lowpass            189.3     194.5     5250     7429    5783    9945   10.4    22.3    32.0  196/278
1007.06  -         dead_reckoning         -         -     1112     3058    1092    2483   19.6    89.3   100.0        -
1007.06  mag_5_uc  raw                 91.2      91.4    14736    16245   15114   20180    0.8     1.0     1.5  227/388
1007.06  mag_5_uc  lowpass             91.7      91.9    11892     1036   11997   19130    1.8     2.6     3.9  301/388
1007.06  mag_4_uc  raw                262.9     337.0     6562    12446    6546   12946    9.3    17.8    33.8  205/388
1007.06  mag_4_uc  lowpass            261.0     335.4    12460    18454   12222   20763    0.8     6.7    12.1  239/388
```

Dead reckoning drifts past 556 m mean error on both held-out lines (1091 m and 1112 m, in line with the research figures of 1089/1108 m). Raw and low-pass cabin signals do mostly worse than DR. The one exception is Mag 5 low-pass on 1003.02 (452 m mean), which still falls apart on 1007.06. This sets up the "noise breaks MagNav" baseline that Tolles-Lawson (Plan 02) has to fix.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TERCOM median over time-aligned estimates**
- **Found during:** Task 2
- **Issue:** Taking a per-axis median of raw window estimates spaced 10 s (~680 m) apart would make the output lag by about one stride.
- **Fix:** Before taking the median, each of the last 3 raw estimates is propagated to the current window end with DR increments. The median still affects only the output and is never fed back into the prior.
- **Commit:** be09da7

**2. [Rule 2 - Testability] NavResult has `est_x`/`est_y`**
- The contract fields (x, y, window_end, ncc, accepted) are unchanged. The raw per-window estimates were added so `test_tercom_never_uses_invalid_cells` can rebuild each accepted candidate path.

**3. [Rule 3 - Blocking] Comment wording in the preprocess script**
- The acceptance greps for `isclose` and `signal.decimate` matched explanatory comments, so the comments were reworded (bd4555c).

**4. [Rule 1 - Lint] ruff RUF046 in pipeline.py**
- The Task 3 commit went in with one ruff finding (a redundant `int()`), because a `;` in the shell chain did not stop the commit. Fixed in c820b06. Ruff is now clean.

### TDD note
The tests for each task were written in the same commit as the implementation, not as separate RED commits. Task 1's data had to exist before its tests could mean anything. All behaviour-block tests exist and pass.

## Known Stubs
None. The denoiser set in `build_denoisers` is intentionally thin (raw, lowpass). Plan 02 appends tl, tl_currents, krr and quantum.

## Threat Flags
None. No new surface beyond the plan's threat model. `allow_pickle=False` is enforced by an AST test, h5py is absent from magnav/, and every data file is under 2 MB and allowlisted.

## Verification
- `uv run pytest -q`: 72 passed
- `uv run ruff check`: clean
- `find data -type f -size +2047k`: empty. `git grep -l "import h5py"`: only scripts/preprocess_sgl.py

## Self-Check: PASSED

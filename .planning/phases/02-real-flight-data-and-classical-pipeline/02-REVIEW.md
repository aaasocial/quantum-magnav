---
phase: 02
reviewed: 2026-10-10T10:02:10Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - scripts/preprocess_sgl.py
  - magnav/data.py
  - magnav/frames.py
  - magnav/nav.py
  - magnav/classical.py
  - magnav/metrics.py
  - magnav/pipeline.py
  - magnav/quantum.py
  - magnav/artifact.py
  - magnav/figures.py
  - main.py
  - scripts/package_qollab.sh
  - tests/test_acceptance.py
  - tests/test_artifact.py
  - tests/test_classical.py
  - tests/test_data_files.py
  - tests/test_metrics.py
  - tests/test_nav.py
  - tests/test_pipeline.py
  - tests/test_preprocess_repro.py
  - tests/test_quantum_stub.py
  - tests/test_tl.py
  - tests/test_truth_guard.py
findings:
  critical: 1
  warning: 7
  info: 10
  total: 18
status: fixed
fixed_at: 2026-10-10
---

# Phase 02: Code Review Report

**Reviewed:** 2026-10-10T10:02:10Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

I reviewed all Phase 2 Python and shell sources and tests (`git diff --name-only 9502050..HEAD`). I traced the scientific path from the decimated excerpts through TL/KRR, DR and TERCOM to the artifact, and checked several claims numerically against the shipped data using `.venv/bin/python`.

Verified correct (no finding):
- **East velocity sign.** East is `-ins_vw`, and this is bound by `test_dr_signs`.
- **Frame.** DR, map and metrics all use the true-north equirectangular frame.
- **Map orientation.** The `.T` on the maps is correct.
- **Line selection.** Line ids use exact float equality.
- **Decimation.** Block-mean decimation with a circular mean for yaw.
- **IGRF derivation.** I checked `mag_1_c - igrf - diurnal` against `mag_1_igrf`: the mean difference is about 0 and the std is 1 to 3 nT.
- **Mask downsampling.** The all-valid rule is applied.
- **Bilinear validity.** Sampling requires all 4 cells to be valid, and every candidate whose window path touches an invalid cell is set to -inf.
- **TERCOM gate and prior.** The 0.85 gate, coasting, and the recursive prior centred on the last estimate plus INS movement are all correct.
- **Filtering and TL.** The bandpass is zero-phase and applied identically to A and to the target. The 18-term A matrix matches the cited MagNav.jl form.
- **Standardisation.** The KRR mean/std are computed on calibration data and reused at test time.
- **Calibration-only selection.** The D-19 CV uses only the calibration line.
- **Artifact.** `allow_pickle=False`, `allow_nan=False`, literal paths, and a lazy matplotlib import.

The main problems are scientific, not mechanical:
1. The KRR baseline, and the quantum slot that shares its wrapper, is structurally a no-op. It is trained on the one band TL has already minimised, so the Phase 4 "quantum vs classical" comparison is set up to compare two near-zero corrections.
2. The navigator and the D-19 procedure were designed after held-out results were seen, but the README states that the held-out lines are never consulted.
3. Both held-out lines share an identical DR noise realisation.
4. The tests do not bind the committed artifact to the current code.

## Critical Issues

### CR-01: KRR residual baseline (and the quantum slot) is structurally inert: trained on the band TL already minimised

**File:** `magnav/classical.py:367-374` (with `KRRResidual.fit` at 326-349)
**Issue:** `ResidualCorrected.fit` trains the residual model on `bpf(r, cal.fs)`, the 0.1-0.9 Hz part of the TL residual on the calibration line. TL itself is a least-squares fit in exactly that band, so what remains in-band is small and mostly not explainable from per-sample features. The held-out TL error is almost entirely below 0.1 Hz (the `test_real_tl_improves` docstring says so), and the residual model never sees that band. Measured on 1003.02 with the committed configuration:

| Sensor | KRR correction std (held-out) | TL residual std |
|---|---|---|
| mag_4_uc | 1.34 nT | ~194 nT |
| mag_5_uc | 0.52 nT | ~29.5 nT |

On calibration the correction is only 3.2 and 1.2 nT. As a result, the metrics rows `krr` and `tl` are equal to within 0.1 nT and a few metres in every row. The artifact and README nonetheless present KRR as a distinct classical baseline. Phase 4 plugs `QuantumDenoiser` into the same `ResidualCorrected` wrapper, so any quantum model will also "honestly match" because both models are capped at about 1 nT of effect. That undercuts the project's core value (quantum vs classical on the same data), and a judge reading the table will notice that krr and tl are identical.
**Fix:** Before Phase 4, choose a residual target the model can actually learn and that matters for navigation. Options:
- Train on the full-band, or the 0.01-0.9 Hz, calibration residual `r - r.mean()`, and score it with the same CV used by D-19.
- Or train on the per-60 s-window mean-removed residual, which is what NCC sees.

Then assert in a test that the residual model's held-out correction std is at least a few nT, or report explicitly that it is not. For example:
```python
# classical.py ResidualCorrected.fit
r = self.base.predict(cal) - np.asarray(target, dtype=np.float64)
r = r - r.mean()
lo = signal.butter(4, 0.01, btype="high", fs=cal.fs, output="sos")
self.model.fit(kernel_features(cal, self.base.fluxgate), signal.sosfiltfilt(lo, r))
```
Fix the choice before looking at held-out numbers, and record it as a decision (D-20).

## Warnings

### WR-01: Navigator and D-19 procedure were shaped by held-out results; README says held-out lines are "never consulted"

**File:** `magnav/pipeline.py:42-50`, `magnav/classical.py:128-209`, README.md:61
**Issue:**
- **Navigator.** `TERCOM_PARAMS` (the 0.85 gate, coasting, the recursive prior and the median) was adopted after prototypes on 1003.02/1007.06 showed the ungated matcher diverging (02-RESEARCH Pitfall 4: "1007.06 mean error 9.7 km"; assumption A4).
- **D-19.** The procedure was introduced after 02-02 showed that the fluxgate choice changed which held-out lines held. Its score definition (5 blocks, full band) then moved Mag 5 / 1007.06 from 26.9% to 100%.
- **Code vs process.** The code never reads the held-out lines during fitting, but the process did. README:61 says "The held-out lines 1003.02 and 1007.06 are never consulted," which a judge will read as a claim about the whole method.

**Fix:**
- Either add a third line that nobody has looked at (for example another Flt1002/Flt1006 line on a shipped map) as a truly blind test, reported with frozen parameters,
- Or disclose the history in the README: say that the gate, prior and CV design were developed while looking at 1003.02/1007.06, and include the 02-02 numbers (lambda 1e-4: Mag 5 on 1007.06 held 26.9%).

### WR-02: Residual models are fitted to a bandpassed target but subtracted full-band

**File:** `magnav/classical.py:370,374`
**Issue:** The model is trained on `bpf(r)`, but at predict time its raw output is subtracted from the full-band TL output. Measured on 1003.02, 90% of the KRR correction's std on held-out data is out of band: 1.21 nT outside the band vs 0.58 nT inside it (Mag 4). That out-of-band part comes from extrapolation on the current features, whose held-out std is about 2x the calibration std. So the correction applied is in a band the model was never trained to predict. Phase 4 inherits this.
**Fix:** Make train and apply consistent. Either bandpass the prediction:
```python
def predict(self, sensors):
    corr = self.model.predict(kernel_features(sensors, self.base.fluxgate))
    return self.base.predict(sensors) - bpf(corr, sensors.fs)
```
or train on the same band you apply (see CR-01).

### WR-03: Both held-out lines use the identical DR noise realisation (same seed, same bias signs)

**File:** `magnav/pipeline.py:128`, `magnav/nav.py:56-58`
**Issue:** `simulate_dr(..., seed=seed)` is called with the same seed for every line, so both lines draw the same bias signs (artifact: `[1, 1]` for 1003.02 and 1007.06) and the same random-walk prefix. D-05's "random sign" is therefore one draw reused. The two lines are not independent drift trials, and the drift is always north-east. The headline results (DR > 556 m, and TL holding against DR) rest on a single realisation.
**Fix:** Derive a per-line seed deterministically and record it:
```python
line_seed = int(np.random.SeedSequence([seed, int(line_id.replace(".", ""))]).generate_state(1)[0])
dr = simulate_dr(sens, jam_idx, fix_xy, seed=line_seed, **DR_PARAMS)
```
Better still, add a small multi-seed sweep that reports the mean and spread of `pct_under_556`.

### WR-04: Artifact TERCOM and decimation provenance is hard-coded, not taken from the run config

**File:** `magnav/artifact.py:23-33,195,206`
**Issue:** `TERCOM_PROVENANCE` (window_s 60, stride_s 10, search_m 3000, gate 0.85, ...) and `"decimation": {"factor": 5, ...}` are literal duplicates. `cfg["tercom"]`, which `run_pipeline` builds at pipeline.py:192, is discarded. If anyone changes `TERCOM_PARAMS`, the artifact will silently report parameters that were not used. `test_committed_artifact` checks `prov["tercom"]["gate"] == 0.85` against the duplicate, not against the run.
**Fix:** Build the provenance from `cfg["tercom"]` (convert samples to seconds with `fs`, and `search_m = 2 * half_width_m`). Read the decimation from `provenance["files"][...]["decimation"]`. Assert in a test that they agree.

### WR-05: Acceptance and committed-artifact tests never tie the artifact to the current code

**File:** `tests/test_acceptance.py:68-72`, `tests/test_artifact.py:70-101`
**Issue:** `test_committed_acceptance` recomputes acceptance from the `metrics_table` stored in the JSON, so it only proves the file agrees with itself. A change that breaks TL, the DR sign or the gate leaves every test green until someone re-runs `main.py`. The thin end-to-end tests (`test_thin_pipeline`) only check that values are finite and in [0, 100]. The suite is too loose to catch a scientific regression.
**Fix:** Add a slow-marked test that runs `run_pipeline()` in full and compares `metrics_table` with the committed artifact to within a small tolerance (for example 1 m / 0.1 pp). Alternatively, store a hash of the shipped `magnav/*.py` in the artifact provenance and assert it matches.

### WR-06: Runtime selector spy does not bind the TL+currents selection path

**File:** `tests/test_tl.py:197-211`; call site `magnav/classical.py:245`
**Issue:** The spy patches `magnav.pipeline.select_tl_config`. `TLDenoiser.fit` (used for `tl_currents`) calls `select_tl_config` through `magnav.classical`'s module global, so those calls bypass the spy. The test claims "selector runtime sees only calibration line" but checks one of the three call sites per sensor.
**Fix:** Also patch the classical module:
```python
import magnav.classical as cl
monkeypatch.setattr(cl, "select_tl_config", spy)
monkeypatch.setattr(pl, "select_tl_config", spy)
...
assert seen and set(seen) == {"1006.08"}
```

### WR-07: TL+currents regressors are unscaled at selection and unfiltered at apply, producing 10x blow-ups shown as a "baseline"

**File:** `magnav/classical.py:236-238,254-256`
**Issue:** The currents are ranked by raw std across channels with different scales. At apply time their full-band contribution, including steps and DC shifts, is subtracted, even though the calibration-line current std is about half the held-out std (measured: cur_heat 0.26 vs 0.79). Results: Mag 4 tl_currents has a signal RMSE of 2548 and 4009 nT and a mean error of 5 to 16 km. That is far worse than raw. 02-RESEARCH Pitfall 5 recommended bandpassing the current contribution at apply time, and this was not done. The table shows a broken variant as if it were a reasonable D-10 baseline.
**Fix:** Apply `bpf` to the current columns' contribution at predict time, `mag - A_tl @ c_tl - bpf(A_cur @ c_cur)`. Fix this before seeing held-out numbers and record it as a decision. Or label the row in the README as a known-unstable diagnostic.

## Info

### IN-01: Metric window excludes the first 60 s after the jam
**File:** `magnav/pipeline.py:130`
**Issue:** `start = jam_idx + window`, but D-07 says "after the jam". Those 60 s are pure DR with low error, so leaving them out slightly inflates DR's mean error, which helps `dr_drifts_*`.
**Fix:** Document this in the README, or compute from `jam_idx`.

### IN-02: `downsample_idx` can return MAX_POINTS + 2 points
**File:** `magnav/artifact.py:43-47`
**Issue:** The union with `jam_idx` and `n-1` can push the count to 1502. The test allows `MAX_POINTS + 2`, but the docstring and focus say <= 1500.
**Fix:** Use `step = ceil(n / (max_points - 2))`.

### IN-03: Acceptance is evaluated on metrics already rounded to 0.1
**File:** `magnav/artifact.py:189,218`
**Issue:** A `pct_under_556` of 89.95 rounds to 90.0 and passes the `>= 90` check.
**Fix:** Call `acceptance_checks(result["metrics_table"])` on the unrounded rows, then clean.

### IN-04: Short lines crash in metrics and TERCOM
**File:** `magnav/metrics.py:19-27`, `magnav/pipeline.py:130`
**Issue:** If `n - jam_idx < window` (for example `truncate < ~160`), `p` is empty. `p[-1]` then raises IndexError and `mean` returns NaN.
**Fix:** Guard with `if start >= n: raise ValueError(...)`.

### IN-05: `select_lambda` is dead code kept only for its own test
**File:** `magnav/classical.py:105-121`
**Fix:** Remove it and its test, or mark it as legacy.

### IN-06: Truth guard is name-based only
**File:** `tests/test_truth_guard.py:34-47`
**Issue:** The guard does not catch `import magnav.data as d; d.Truth`, or truth-derived arrays passed under another name. For example, `fit(target=...)` legitimately receives truth.
**Fix:** Also reject `ast.Attribute(attr="Truth")` and plain `import magnav.data`. Keep the runtime spy approach for predict paths.

### IN-07: Byte-identical artifact holds per machine only
**File:** `magnav/artifact.py:64-79`, `main.py:35-38`
**Issue:** Values rounded to 6 decimal places (the cv_table, gamma) depend on BLAS. The artifact also embeds the backend name (`basic_simulator`). Locally, `main.py` requires qiskit only to construct a backend that the stub never uses.
**Fix:** Round CV/gamma to 3-4 significant figures, and make the local backend optional (`backend = None` if qiskit is missing).

### IN-08: `igrf` in Sensors is evaluated at GPS-truth positions
**File:** `scripts/preprocess_sgl.py:104`
**Issue:** The channel is derived from `mag_1_dc - mag_1_igrf`, a truth channel evaluated along the true track. The effect is negligible (gradient 1-2 nT/km; high-pass std about 0.01-0.03 nT measured), but it is still truth-derived data inside `Sensors`.
**Fix:** Keep the README disclosure. In the future, evaluate IGRF at the estimated position.

### IN-09: Preprocessing track-validity check is weaker than the navigator's rule
**File:** `scripts/preprocess_sgl.py:151-156`
**Issue:** The check uses the nearest cell, while `MapTile.sample` requires all 4 bilinear cells. `test_map_reproduces_anomaly` covers this today.
**Fix:** Check the 4-corner rule in preprocessing too.

### IN-10: `ncc` may be null in the artifact; the schema does not say so
**File:** `magnav/nav.py:95-97`, `magnav/artifact.py:160`
**Issue:** When every candidate in a window is invalid, the best score is `-inf` and becomes `null` in the artifact. The committed artifact has 8, 51 and 31 such windows (mag_4 raw, lowpass and tl_currents). Phase 3 must handle this.
**Fix:** Document it in the schema and add a `validate_artifact` check that `null` appears only where `accepted == 0`.

## Fix Outcomes

Fixed by gsd-code-fixer on 2026-10-10. Scope: every Critical and Warning finding, plus the Info findings that were trivial and safe (IN-02, IN-04, IN-05, IN-10). All held-out numbers below were measured after the fixes and were not used to choose anything.

| Finding | Outcome | Commit |
|---|---|---|
| CR-01 | Fixed. `ResidualCorrected` trains the residual model on the full-band calibration TL residual (mean removed), with features standardised on calibration data. KRR gamma/lambda come from 5-block blocked CV on 1006.08 only, and the lambda grid now includes 100. Features unchanged (22, D-11). | 94f1ca2 |
| WR-02 | Fixed (same change as CR-01). Train band = apply band: full band. A test checks that the target is the full-band residual and that the correction is subtracted unfiltered. | 94f1ca2 |
| WR-07 | Fixed. The current contribution is bandpassed to 0.1-0.9 Hz at apply time, in the bias and in the D-19 CV score. Mag 4 TL+currents is still worse than TL on 1007.06 (mean 3058 m vs 454 m). It is reported as is, and the row is kept. | 74a9e91 |
| WR-03 | Fixed. Per-line seed `SeedSequence([seed, int(line_id)])`, recorded in `config.dr.line_seeds` and `provenance.ins_drift[line].seed`. Note: both lines drew bias signs [1, -1], but their random walks differ. | 306b61b |
| WR-04 | Fixed. `provenance.tercom` is built from `config.tercom` and `fs`, and `provenance.decimation` is read from `data/provenance.json`. Tested. | 1e163b0 |
| WR-05 | Fixed. `tests/test_artifact_regression.py` recomputes the D-19 selection, the KRR/TL+currents hyperparameters, every denoiser's held-out signal error and the DR metrics, and compares them with the committed artifact (about 15 s, no TERCOM). | e2d1ec7 |
| WR-06 | Fixed. The spy patches both `magnav.pipeline` and `magnav.classical` and asserts that the classical path fired. A second test binds the TL+currents fit to the patched attribute. | 1a1c60c |
| WR-01 | Fixed (disclosure option). The README says no parameter is fitted or selected on the held-out lines, but that the navigator design and the calibration-only CV were decided after prototype runs on them. | 6257699 |
| IN-02 | Fixed. The display index is <= 1500 points. | 11dcc34 |
| IN-04 | Fixed. A ValueError is raised for lines too short for the metric window. | e2be5b5 |
| IN-05 | Fixed. `select_lambda` and its test were removed. | 0b3acca |
| IN-10 | Fixed. Nullable `ncc` is documented, and `validate_artifact` rejects a null ncc in an accepted window. | 99d5e82 |
| IN-01, IN-03, IN-06, IN-07, IN-08, IN-09 | Skipped: out of the requested scope (not trivial, or documentation-only follow-ups). | - |

The artifact and figures were regenerated in 6bc110e (1,034,710 bytes). ACCEPTANCE after the fixes is 7/7 PASS:

```
PASS mag5_tl_hold_1003.02: 99.3 vs 90.0 (rule mag_5_uc tl pct_under_556 >= 90)
PASS mag5_tl_hold_1007.06: 99.5 vs 90.0 (rule mag_5_uc tl pct_under_556 >= 90)
PASS mag4_tl_beats_dr_1003.02: 170.7 vs 2270.6 (rule mag_4_uc tl mean_err_m < dead_reckoning mean_err_m)
PASS dr_drifts_1003.02: 2270.6 vs 556.0 (rule dead_reckoning mean_err_m > 556)
PASS dr_drifts_1007.06: 5438.5 vs 556.0 (rule dead_reckoning mean_err_m > 556)
PASS mag4_raw_drifts_1003.02: 1985.9 vs 170.7 (rule mag_4_uc raw mean_err_m > mag_4_uc tl mean_err_m)
PASS mag4_raw_drifts_abs_1007.06: 4108.5 vs 556.0 (rule mag_4_uc raw mean_err_m > 556)
ACCEPTANCE 7/7 PASS
```

KRR correction magnitude (std of TL output minus KRR output, in nT; the RMS is in parentheses where it differs; full line):

| Sensor / line | Before (bandpassed target) | After (full-band target) |
|---|---|---|
| Mag 5, 1006.08 (cal) | 1.25 | 10.77 |
| Mag 5, 1003.02 | 0.52 (0.58) | 7.52 (12.41) |
| Mag 5, 1007.06 | 0.00 | 2.70 (3.19) |
| Mag 4, 1006.08 (cal) | 3.23 | 54.29 |
| Mag 4, 1003.02 | 1.34 (2.33) | 31.08 (133.41) |
| Mag 4, 1007.06 | 0.73 (3.04) | 33.71 (118.34) |

KRR is no longer inert. On the calibration line it lowers the error std (Mag 4: 80.9 to 53.1 nT). On held-out data it slightly raises the error std (Mag 4 1003.02: 181.6 to 186.2; Mag 4 1007.06: 122.9 to 143.2). Navigation: Mag 4 1003.02 improves (mean 158 m vs TL 171 m), but Mag 4 1007.06 degrades badly (7480 m vs TL 454 m). This is reported, not tuned. The quantum slot (still the stub) equals TL.

---

_Reviewed: 2026-10-10T10:02:10Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

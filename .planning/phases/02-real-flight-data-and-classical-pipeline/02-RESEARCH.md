# Phase 2: Real Flight Data and Classical Pipeline - Research

**Researched:** 2026-10-10
**Domain:** Aeromagnetic compensation (Tolles-Lawson) and magnetic-anomaly map matching on SGL 2020 data, built with numpy/scipy only and running on Pyodide
**Confidence:** HIGH for data facts, file sizes, TL maths and conventions (all checked with probes on the real files and against MagNav.jl source). MEDIUM for navigation performance (a prototype ran on the real lines, but with one seed per configuration and a few gate settings).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Data excerpts (D-01..D-04)
- D-01: Flight excerpts are decimated from 10 Hz to 2 Hz (anti-aliased, e.g. scipy.signal.decimate or boxcar mean of 5) and stored as float32 so each line file stays well under 2 MB.
- D-02: The primary polluted sensor is cabin Mag 4 (`mag_4_uc`); `mag_3_uc` and `mag_5_uc` are kept in the excerpts for a Phase 5 cabin-sensor sweep.
- D-03: Maps are cropped to each held-out line's bounding box plus a 5 km margin and downsampled from ~30 m to ~120 m cells (4x) so each map file is under 2 MB; the validity mask is downsampled with "all-valid" semantics (a coarse cell is valid only if all fine cells are valid).
- D-04: The GPS jam happens 25% into each held-out line, leaving a GPS-aided lead-in and a long magnetic-only tail.

#### INS drift and thresholds (D-05..D-08)
- D-05: Dead reckoning integrates `ins_vn`/`ins_vw` from the last fix at the jam time, adding a constant per-axis velocity bias of 0.3 m/s (random sign) plus a random walk with sigma 0.05 m/s/sqrt(s); the RNG seed is fixed and recorded in the artifact and provenance.
- D-06: The RNP-style threshold is 556 m (0.3 nmi, the AQNav figure); 1 nmi and 2 nmi are also reported as "% time under threshold".
- D-07: Metrics are computed over the magnetic-only segment after the jam.
- D-08: Truth position is `utm_x`/`utm_y` from the dataset; truth magnetic signal is `mag_1_c` (map-matching uses the IGRF/diurnal-removed equivalent).

#### Baselines (D-09..D-12)
- D-09: Tolles-Lawson uses the 18 classic terms (3 permanent, 6 induced, 9 eddy) plus bias, with a 0.1–0.9 Hz bandpass applied before fitting and a ridge lambda chosen on the calibration line 1006.08 only.
- D-10: The TL+currents variant adds the 4 largest-variance `cur_*` channels as extra regressors.
- D-11: KRR features are the 9 TL direction-cosine terms, their derivatives, and the 4 currents, evaluated per sample (no history window) so the feature set is identical to what the quantum feature map will consume in Phase 4.
- D-12: The naive low-pass floor is a 4th-order Butterworth at 0.05 Hz on the cabin mag.

#### Navigation and artifact (D-13..D-16)
- D-13: TERCOM window = 60 s of cleaned signal (120 samples at 2 Hz) with a 10 s stride.
- D-14: Search region = 3 km square centred on the INS-drift prior; score = normalized cross-correlation on mean-removed windows; invalid (k-NN-filled) map cells are excluded from every candidate.
- D-15: Position estimate = best-correlation offset, smoothed with a 3-window median.
- D-16: RunArtifact v1 = columnar JSON with `t`, truth xy, dead-reckoning xy, per-denoiser estimated xy and cleaned signal (downsampled to <= 2000 points per series), the metrics table, provenance (source files, line, tt range, decimation, seed), and `schema_version: 1`; written to `data/precomputed_run.json` under 2 MB.

### Claude's Discretion
Everything not listed above: module layout inside `magnav/` (e.g. `magnav.data`, `magnav.classical`, `magnav.nav`, `magnav.metrics`, `magnav.artifact`), exact ridge/KRR hyperparameter search, figure styling in `main.py`, test structure, and whether KRR is scikit-learn (with `scikit-learn` added to requirements.txt) or a numpy implementation.

### Deferred Ideas (OUT OF SCOPE)
- EMAG2v3 coarse-map comparison (offered, not selected; stays optional in Phase 5/6 docs).
- Particle-filter navigator (NAVX-03 stretch).
- Cabin-sensor and training-size sweeps (Phase 5).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | `scripts/preprocess_sgl.py` extracts 1006.08 / 1003.02 / 1007.06, keeps the channel list, decimates, each output < 2 MB | Line index spans and sample counts verified (see "Verified Data Facts"). Block-mean decimation is recommended over `scipy.signal.decimate` (Pitfall 1). `savez_compressed` is required because 1007.06 is 2.28 MB as a plain npz and 1.48 MB compressed |
| DATA-02 | Crop Eastern_395 / Renfrew_395 to the held-out line bbox + margin, nT grid + lon/lat + mask, < 2 MB | h5py reads the map transposed (Pitfall 2). Mask 1 = real survey. Crop sizes measured: Eastern 353x323 at 0.42 MB, Renfrew 624x558 at 1.30 MB (both compressed) |
| DATA-03 | `data/provenance.json` with source SHA-256, tt range, decimation, channels; byte-identical re-runs; < 2 MB test | numpy 2.4.6 `savez`/`savez_compressed` are byte-deterministic (verified). Provenance schema below |
| DATA-04 | Literal-path loaders; `Truth` / `Sensors` split; no estimator accepts truth | Pattern 2 (frozen dataclasses), plus an AST guard test |
| DATA-05 | Simulated INS drift from `ins_vn`/`ins_vw` with bias + random walk, recorded RNG | `ins_ve = -ins_vw` (MagNav source plus data check, corr -0.9999). Integrate in a true-north local frame, not UTM (Pitfall 6). Measured drift is 1-5 km final |
| BASE-01 | TL ridge (18 terms, optional currents, 0.1-0.9 Hz bandpass) fitted on 1006.08 compensates a cabin mag toward `mag_1_c` | Exact MagNav.jl port (Pattern 3). Measured held-out error std: Mag 4 raw 193/236 nT, TL about 70-96 / 88-106 nT |
| BASE-02 | RBF KRR on the TL residual with the quantum model's features | 40-line numpy KRR (Pattern 5). Measured: no gain over TL on held-out lines (honest negative result to expect) |
| BASE-03 | Naive low-pass floor | 4th-order Butterworth at 0.05 Hz, `sosfiltfilt`. Measured 186/234 nT (barely better than raw) |
| BASE-04 | Train on 1006.08, evaluate on 1003.02 and 1007.06; denoisers predict `mag_1_c`; matching uses the IGRF+diurnal-removed signal | `igrf` is not an HDF5 key. Derive it as `mag_1_dc - mag_1_igrf` (MagNav source). Map-matching signal = cleaned - igrf - diurnal |
| NAV-01 | TERCOM over Eastern/Renfrew within a search region centred on the INS prior, never through invalid cells | Pattern 6 (vectorised NCC, 2601 candidates x 120 samples, about 20 ms per window in CPython). The recursive prior is needed (Open Question 1) |
| NAV-02 | Matcher run once per denoiser on identical segments | Same seed, same windows. Per-denoiser loop in the pipeline |
| NAV-03 | "GPS jammed at t=X" switches to magnetic-only | Jam index = `int(0.25*n)`: 1003.02 index 1892 (946 s, tt ≈ 51659); 1007.06 index 2620 (1310 s, tt ≈ 59080) |
| METR-01 | Signal RMSE / error std, mean/final position error, CEP50/95, % under thresholds | Formulas in Pattern 7 |
</phase_requirements>

## Summary

The SGL 2020 files and Ottawa maps fit this phase well, with three exceptions the planner must design around. First, **the data is clean and well aligned**: every target line is contiguous at 10 Hz with no NaNs in any channel we need. The aircraft flies at 398 m HAE on all three lines, right at the 395 m map altitude. Sampling the full-resolution map along the true track reproduces `mag_1_igrf` to **5.5-7.7 nT std** (correlation 0.9993-0.9998), and 100% of each track lies on real-survey (mask = 1) cells. With the true signal, TERCOM holds position to about 60 m mean error. The map-matching foundation is sound.

Second, **two library defaults silently break the data**. (a) `scipy.signal.decimate(..., ftype='fir', zero_phase=True)` zero-pads ~53,000 nT signals at the edges. After it, the TL test error rose from 70 to 1,500 nT and the low-pass floor from 186 to 591 nT. A block mean of 5 has no edge transients and matches the 10 Hz TL results. (b) h5py reads the Julia-written `map`/`mask` transposed: shape is `(len(xx), len(yy))`, so the arrays must be `.T`'d. Also, `np.isclose(line, 1006.08)` with default tolerances silently merges neighbouring lines (34,123 samples instead of 8,391). Use exact equality.

Third, and most important for the demo story, **Mag 4 (locked by D-02) is a hard sensor for this pipeline**. Classic TL brings Mag 4 from 193/236 nT error std to about 70-105 nT on the held-out lines (1003.02 / 1007.06). That is enough for TERCOM to hold on 1003.02, but only with an NCC acceptance gate (about 0.85), and it is fragile across seeds. On 1007.06 it holds only at gate 0.85 (CEP50 250 m, 64% under 556 m). Without a gate it diverges and does worse than dead reckoning. By contrast, **TL on Mag 5 reaches 15-24 nT and holds robustly** (CEP50 60-110 m, 97-99% under 556 m, at every gate and seed tried). Raw Mag 4 does worse than dead reckoning, which tells the "noise breaks MagNav" story well. Per-sample RBF KRR on the TL residual gave no held-out gain. TL+currents is unstable because the calibration line's current variance is about 3x smaller than on the test flights. The planner should keep D-02 but make the primary sensor one constant, add the NCC gate, and insert a human checkpoint after the first metrics table that shows Mag 4 vs Mag 5 numbers.

**Primary recommendation:** Build the pipeline with numpy/scipy only: block-mean decimation, a MagNav-exact TL port, a recursive-prior gated TERCOM in a local equirectangular frame, and a numpy KRR. Ship `savez_compressed` excerpts. Gate Phase 2 completion on a human checkpoint that reviews the Mag 4 vs Mag 5 nav table before Phase 3 consumes the artifact.

## Project Constraints (from CLAUDE.md)

- Python runs on **Pyodide 3.14 / numpy 2.4.6 / scipy 1.18.0** on Qollab. Shipped code must be pure Python plus Pyodide packages. `scikit-learn` is **not preloaded** (docs/QOLLAB_FINDINGS.md).
- **Never import h5py in `magnav/`.** h5py appears only in `scripts/preprocess_sgl.py`, run via `export PATH="$HOME/.local/bin:$PATH"; uv run --with h5py python -I scripts/preprocess_sgl.py`.
- **Data files load only via literal path strings** (`"data/flt1003_line02.npz"`), never f-strings. Every shipped data file must also be added to `DATA_FILES` in `scripts/package_qollab.sh`.
- At most **100 files, 2 MB each** (limit `< 2097152` bytes, as `package_qollab.sh` checks).
- **Never construct providers or simulators in shipped code.** Functions take `backend` as an argument. The quantum stub must follow this.
- IonQ accepts **one single-circuit job per Run**. The quantum slot's inference method must later submit exactly one bare circuit.
- `json.dumps(..., allow_nan=False)` for anything returned to JS (existing `api.py` convention).
- `uv run pytest -q` and `uv run ruff check` gate every commit. Use conventional commits with a Co-Authored-By trailer.
- **Submission approval gate:** no publishing or submitting without explicit user approval. Phase 2 has no gated step, but any "upload to Qollab" in this phase must be upload-only, never Publish.
- GSD workflow: edits happen through GSD commands.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HDF5 read, line extraction, decimation, map crop | Local dev script (`scripts/preprocess_sgl.py`) | — | h5py never ships, and raw data (1.4 GB) stays in gitignored `data_raw/` |
| Excerpt storage | Static data files (`data/*.npz`, `data/provenance.json`) | — | Qollab preloads literal-path files of 2 MB or less |
| Loading + Truth/Sensors split | Python package in browser (`magnav/data.py`) | — | Runs identically in Pyodide and CPython |
| Denoisers (low-pass, TL, TL+cur, KRR, quantum stub) | Python package (`magnav/classical.py`, `magnav/quantum_slot.py`) | — | numpy/scipy only |
| INS drift simulation | Python package (`magnav/nav.py`) | — | Deterministic given the seed |
| TERCOM navigation | Python package (`magnav/nav.py`) | — | Heavy compute (~60-80 s CPython for all runs), so precompute it for the UI |
| Metrics | Python package (`magnav/metrics.py`) | — | The only consumer of `Truth` besides the pipeline orchestrator |
| RunArtifact v1 | Static JSON (`data/precomputed_run.json`) written by local run | Browser reads it in Phase 3 | Demo-reliability fallback |
| JSON bridge to JS | `magnav/api.py` | — | Existing JSON-string convention |

## Verified Data Facts

All facts in this section come from h5py probes run on the real files on 2026-10-10 [VERIFIED: local probe], unless tagged otherwise.

### HDF5 layout
- 98 datasets per flight file, all 1-D float64 of length N. **No HDF5 attributes** (no units in-file). Scalars: `N`, `dt` (= 0.1), `flight`.
- **There is no `igrf` dataset.** MagNav.jl derives it as `igrf = mag_1_dc - mag_1_igrf` [CITED: MagNav.jl src/get_XYZ.jl, "provided IGRF for convenience"].
- Relations verified numerically: `mag_1_dc = mag_1_lag - diurnal` (max abs diff 0.001 nT). `mag_1_c - mag_1_igrf - igrf - diurnal` has mean ≈ 0 and std 1.1 / 3.4 / 2.1 nT on 1006.08 / 1003.02 / 1007.06. In other words, **`mag_1_igrf` ≈ `mag_1_c - igrf - diurnal`** to within a few nT.

### Channel units and sign conventions
[CITED: MagNav.jl src/MagNav.jl XYZ20 field table and src/get_XYZ.jl; checked against data ranges]

| Channel | Unit / meaning | Data check |
|---|---|---|
| `tt` | s past midnight | contiguous 0.1 s steps within a line; **adjacent lines share one duplicate boundary timestamp** |
| `line` | float64 line id, e.g. 1003.02 | exact equality works (`f["line"][:] == 1003.02`) |
| `lat`, `lon` | **deg** in the HDF5 (MagNav converts to rad on load) | 44.6-45.7 / -77.1 to -75.8 |
| `utm_x`, `utm_y` | m, **WGS-84 UTM zone 18N** | 335-435 km E, 4.94-5.06 Mm N. All lines and both maps are inside zone 18 (-78 to -72 deg), so no zone edge |
| `utm_z` | m, GPS altitude above the WGS-84 ellipsoid | mean 398 m on all three lines |
| `mag_1_c` | nT, compensated tail-stinger total field (truth) | ~53,200-54,100 nT |
| `mag_1_igrf` | nT, Mag 1 IGRF- and diurnal-corrected (anomaly) | -680 to +1593 nT |
| `mag_N_uc` | nT, uncompensated total field | see the noise table below |
| `flux_{a..d}_{x,y,z,t}` | nT, fluxgate vector components + total | x ≈ -50,000, y/z ±20-40k (attitude dependent) |
| `cur_*` (14 channels) | A | list below |
| `ins_pitch`, `ins_roll`, `ins_yaw` | **deg**. Yaw is in [0, 360) and **wraps** | roll ±35 deg on the calibration line |
| `ins_vn` | m/s, north | corr with d(utm_y)/dt = 0.9999 |
| `ins_vw` | m/s, **west**: `ins_ve = -ins_vw` [CITED: get_XYZ.jl] | corr with d(utm_x)/dt = -0.9999 |
| `ins_vu` | m/s, up: `ins_vd = -ins_vu` | |
| `diurnal` | nT, base-station temporal variation | std 0.5-1.0 nT per line |

### Target lines (exact `line == L` mask)

| Line | Role | Index span (10 Hz) | Samples 10 Hz → 2 Hz | Duration | tt range | Mean utm_z | lat range | lon range | utm_x range (m) | utm_y range (m) | Track length | Map |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1006.08 | calibration | 86796..95186 | 8391 → 1678 | 839 s (14 min) | 55770-56609 | 398 m | 44.754-44.831 | -76.151 to -76.038 | 409034-417898 | 4956249-4964781 | 57.6 km | Eastern |
| 1003.02 | held-out | 8931..46771 | 37841 → 7568 | 3784 s (63 min) | 50713-54497 | 399 m | 44.621-44.909 | -76.187 to -75.826 | 406253-434498 | 4941195-4973415 | 254 km | Eastern |
| 1007.06 | held-out | 54204..106604 | 52401 → 10480 | 5240 s (87 min) | 57770-63010 | 398 m | 45.083-45.654 | -77.110 to -76.405 | 335034-389747 | 4993207-5057481 | 357 km | Renfrew |

Ground speed is about 68 m/s on all lines. The calibration line 1006.08 has strong manoeuvres (roll std 11 deg, ±35 deg) and lies inside the Eastern crop of 1003.02.

### Cabin magnetometer noise (std of `mag_N_uc - mag_1_c`, nT)

| Line | mag_2 | mag_3 | mag_4 | mag_5 | mag_1_uc |
|---|---|---|---|---|---|
| 1006.08 | 8771 (broken: values down to -3213) | 1231 | 405 | 126 | 2.2 |
| 1003.02 | 1190 | 969 | 193 | 104 | 1.6 |
| 1007.06 | 1223 | 1083 | 236 | 106 | 1.7 |

**Noisiest usable cabin mag on the held-out lines is Mag 3, then Mag 4, then Mag 5.** Mag 2 is unusable on 1006.08.

### Current channels ranked by std on 1006.08 (A)
`cur_outpwr` 0.543, `cur_acpwr` 0.541, `cur_heat` 0.258, `cur_ac_hi` 0.165, `cur_srvo_o` 0.154, `cur_srvo_i` 0.074, `cur_srvo_m` 0.042, `cur_strb` 0.036, `cur_ac_lo` 0.011, `cur_com_1` 0.008, `cur_tank` 0.008, `cur_flap` 0.005, `cur_bat_2` 0.001, `cur_bat_1` 0.001.
- **D-10's top 4 = `cur_outpwr`, `cur_acpwr`, `cur_heat`, `cur_ac_hi`.** Note that `cur_outpwr` and `cur_acpwr` are nearly collinear (both ~29 A with the same std).
- On the held-out lines the same currents have about **3x larger std** (`cur_outpwr` 1.49-1.51 A). This extrapolation is why TL+currents is unstable (Pitfall 5).

### Maps (`Eastern_395.h5`, `Renfrew_395.h5`)
- Keys: `alt` (395.0), `border` (2 x K lon/lat polyline of the survey edge), `info` (bytes: "...upward continued to 395 m above WGS-84 Ellipsoid ... UTM Zone 18N ... Filled in using k-nearest neighbors (k=3)"), `map` (float64 nT), `mask` (int8 0/1), `xx` (lon, **deg**), `yy` (lat, **deg**). Both coordinate vectors are strictly increasing and uniformly spaced (Eastern dlon 0.00037628, dlat 0.00026739, ≈ 29.6 m).
- **h5py shape of `map`/`mask` is `(len(xx), len(yy))`**, e.g. Eastern (6238, 4881). MagNav defines the map as `ny x nx` [CITED: MagNav.jl MapS docstring], but Julia is column-major, so h5py sees it transposed. **Use `M = f["map"][:].T` to get rows = lat (yy), cols = lon (xx).**
- `mask == 1` means real survey data. 0 means k-NN filled [CITED: MapS docstring "mask for valid (not filled-in) map data"]. Valid fraction: Eastern 46%, Renfrew 56% overall, but **100% along every target track**.
- No NaNs in `map`. Values range -2,067 to +7,447 nT.

### Crop + 4x downsample results (bbox + 5 km, block mean, all-valid mask)

| Line → map file | Fine crop | 4x grid | Valid coarse cells | Plain npz | `savez_compressed` | Map residual std (`mag_1_igrf` - map, 4x) | Median gradient |
|---|---|---|---|---|---|---|---|
| 1003.02 → `map_eastern_395.npz` | 1415 x 1295 | 353 x 323 | 100% | 0.58 MB | 0.42 MB | 7.6 nT (mean offset ≈ +7.6) | 145 nT/km |
| 1007.06 → `map_renfrew_395.npz` | 2499 x 2233 | 624 x 558 | 84% | 1.75 MB | **1.30 MB** | 5.4 nT (mean offset ≈ +2.0) | 96 nT/km |
| (1006.08, for reference) | 626 x 634 | 156 x 158 | 100% | 0.13 MB | 0.09 MB | 5.6 nT | 109 nT/km |

1006.08 lies inside the 1003.02 Eastern crop, so one Eastern file serves both.

### Line excerpt sizes (2 Hz block mean; 43 float32 channels + 5 float64 [`tt`, `lat`, `lon`, `utm_x`, `utm_y`] + derived `igrf`)

| File | Plain npz | `savez_compressed` |
|---|---|---|
| `data/flt1006_line08.npz` | 0.37 MB | 0.26 MB |
| `data/flt1003_line02.npz` | 1.65 MB | 1.08 MB |
| `data/flt1007_line06.npz` | **2.28 MB (over limit)** | **1.48 MB** |

**`savez_compressed` is mandatory.** Total shipped data is about 4.5 MB in 6 files, well inside the 100-file / 200 MB account limits.

## Standard Stack

### Core (all already pinned in pyproject; nothing new to install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| numpy | 2.4.6 (Pyodide) / `>=2.4,<2.5` local | arrays, `lstsq`/`solve`, npz I/O, bilinear sampling | Preloaded in Pyodide [VERIFIED: docs/QOLLAB_FINDINGS.md] |
| scipy | 1.18.0 (Pyodide) / `>=1.18,<1.19` local | `signal.butter(..., output='sos')`, `signal.sosfiltfilt` | Preloaded in Pyodide [VERIFIED: docs/QOLLAB_FINDINGS.md] |
| h5py | latest via `uv run --with h5py` (**local only, never in magnav/**) | read SGL HDF5 in `scripts/preprocess_sgl.py` | The standard HDF5 binding. Used successfully in this session [VERIFIED: local probe] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| matplotlib | 3.10.x (dev group) | `main.py` figures (local only, guarded import) | README figures |
| hashlib / json / zipfile (stdlib) | — | provenance SHA-256, artifact JSON | always |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| numpy KRR (~40 lines) | `sklearn.kernel_ridge.KernelRidge` | scikit-learn 1.8.0 is in the Pyodide distribution [CITED: Pyodide lock per .planning research STACK.md] but **not preloaded on Qollab**. It needs `scikit-learn` in requirements.txt (allowlist test `ALLOWED_REQUIREMENTS` must permit it) and adds a large wasm download at page load. A numpy KRR fit on 1678 samples takes 0.08 s (measured). **Use numpy.** |
| block mean of 5 | `scipy.signal.decimate(q=5, ftype='fir', zero_phase=True)` | Destroys the edges of large-DC signals (Pitfall 1). Could be fixed by demeaning first, but the block mean is simpler, deterministic, and matched 10 Hz TL accuracy in testing |
| local equirectangular frame | dataset UTM 18N | UTM grid north differs from true north by 0.65-1.26 deg here, while INS velocities are true-north (Pitfall 6). The map grid is regular in lon/lat, not UTM |

**Installation:** none. Do not add anything to `requirements.txt` in this phase.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| h5py | PyPI | >10 yrs [ASSUMED] | very high [ASSUMED] | github.com/h5py/h5py [ASSUMED] | not run | Approved for local-only use. Already used by the builder (CONTEXT.md) and in this session. Never shipped |
| numpy, scipy | PyPI / Pyodide | — | — | — | not run | Already pinned project dependencies (Phase 1) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
*slopcheck was not installed (this session did not install unvetted tooling). No new package is introduced by this phase, so no install checkpoint is needed. h5py is run ephemerally with `uv run --with h5py` and is not added to `pyproject.toml`.*

## Architecture Patterns

### System Architecture Diagram

```
 LOCAL ONLY (dev machine)                          SHIPPED (CPython locally == Pyodide on Qollab)
 ─────────────────────────                          ──────────────────────────────────────────────
 data_raw/Flt100{3,6,7}_train.h5 ──┐
 data_raw/.../Eastern_395.h5 ──────┤
 data_raw/.../Renfrew_395.h5 ──────┤
                                   v
             scripts/preprocess_sgl.py (h5py)
             - exact line mask, assert counts
             - block-mean /5 (yaw: circular mean)
             - derive igrf = mag_1_dc - mag_1_igrf
             - map .T, crop bbox+5km, 4x mean, mask all()
             - savez_compressed, sha256 -> provenance
                                   │
                                   v
        data/flt1006_line08.npz  data/flt1003_line02.npz  data/flt1007_line06.npz
        data/map_eastern_395.npz data/map_renfrew_395.npz data/provenance.json
                                   │  (literal paths)
                                   v
                     magnav.data.load_line() ──> Truth (mag_1_c, mag_1_igrf, lat/lon, utm)
                                   │                      │ (only metrics + orchestrator)
                                   v                      │
                               Sensors ───────────────────┼──────────────┐
          (cabin mags, flux, cur, INS att/vel, igrf, diurnal)            │
                │                                          │             │
   calibration line 1006.08 ── fit ──> Denoisers <─ target array from cal Truth (training only)
                │                     (lowpass | TL | TL+cur | KRR | quantum stub)
                v                                          │
   held-out Sensors ── predict ──> cleaned scalar (nT) ── minus (igrf+diurnal) ──> anomaly signal
                                                           │
   Sensors.ins_vn/vw + jam idx + seed ──> simulate_dr() ──> DR track (local m)
                                                           │
                                   v                       v
                    magnav.nav.tercom(signal, DR, MapTile) -- recursive prior, NCC, gate, median
                                   │
                                   v
                    estimated track per denoiser ──> magnav.metrics (uses Truth) ──> table
                                   │
                                   v
                    magnav.artifact.build_run_artifact() ──> data/precomputed_run.json (Phase 3)
```

### Recommended Project Structure

```
scripts/
└── preprocess_sgl.py      # local only; h5py; writes data/*.npz + data/provenance.json
magnav/
├── api.py                 # existing JSON bridge; add run_pipeline_json / load_artifact later (Phase 3)
├── data.py                # literal paths, load_line(), load_map(), Truth/Sensors/MapTile dataclasses
├── frames.py              # ll_to_local(), local_to_ll(); equirectangular about the tile centre
├── classical.py           # tl_A(), bpf(), fit_tl(), TLDenoiser, LowPassDenoiser, KRRDenoiser (numpy)
├── quantum_slot.py        # QuantumDenoiserStub with the final interface (fit/predict/run_inference(backend))
├── nav.py                 # simulate_dr(), tercom(), MapTile.sample()
├── metrics.py             # signal_metrics(), position_metrics() -- the only module that takes Truth
├── artifact.py            # build_run_artifact(), downsample_idx(), validate_artifact()
└── pipeline.py            # run_pipeline(): orchestrates fit on 1006.08, eval on held-out, returns dict
main.py                    # one-command runner: prints metrics table, saves figures (local), writes artifact
tests/
├── test_data_files.py     # every data/ file < 2 MB, literal paths, provenance sha round trip
├── test_tl.py             # synthetic planted-coefficient recovery
├── test_nav.py            # planted-offset TERCOM on a synthetic map; DR sign conventions
├── test_truth_guard.py    # AST: no estimator signature accepts Truth
├── test_artifact.py       # schema validation, size, no NaN
└── test_preprocess_repro.py  # skipped when data_raw/ absent; byte-identical re-run
```

### Pattern 1: Preprocessing (local only)

**What:** Extract exact lines, decimate by block mean, write compressed npz plus provenance.
**Key rules:**
- Mask: `m = f["line"][:] == L`. Assert `m.sum()` equals the expected count (8391 / 37841 / 52401) and that `np.diff(tt[m])` is all 0.1 ± 1e-6.
- Trim to a multiple of 5, then `v[:n].reshape(-1, 5).mean(1)`. `tt` is the block mean (block-centre time).
- **`ins_yaw`: circular mean.** `np.rad2deg(np.arctan2(sin.mean, cos.mean)) % 360`. A plain mean of 359 and 1 gives 180.
- dtypes: `float64` for `tt`, `lat`, `lon`, `utm_x`, `utm_y` (float32 would quantise `utm_y` ≈ 5e6 to 0.5 m). `float32` for everything else.
- Store `line` as a 0-d float64 array and the channel list in provenance.
- Use `np.savez_compressed(path, **dict(sorted(arrays.items())))`. Sorted keys keep output deterministic.

```python
# scripts/preprocess_sgl.py (sketch) -- Source: local probes 2026-10-10
import hashlib, json, h5py, numpy as np
LINES = [("data_raw/Flt1006_train.h5", 1006.08, 8391, "data/flt1006_line08.npz"),
         ("data_raw/Flt1003_train.h5", 1003.02, 37841, "data/flt1003_line02.npz"),
         ("data_raw/Flt1007_train.h5", 1007.06, 52401, "data/flt1007_line06.npz")]
CUR = ["cur_ac_hi","cur_ac_lo","cur_acpwr","cur_bat_1","cur_bat_2","cur_com_1","cur_flap",
       "cur_heat","cur_outpwr","cur_srvo_i","cur_srvo_m","cur_srvo_o","cur_strb","cur_tank"]
F32 = (["mag_1_c","mag_1_igrf","diurnal","mag_3_uc","mag_4_uc","mag_5_uc"]
       + [f"flux_{c}_{a}" for c in "abcd" for a in "xyzt"] + CUR
       + ["ins_pitch","ins_roll","ins_vn","ins_vw","ins_vu","utm_z"])
F64 = ["tt","lat","lon","utm_x","utm_y"]
Q = 5
def block_mean(v):  n = len(v)//Q*Q; return v[:n].reshape(-1, Q).mean(1)
def circ_mean_deg(v):
    n = len(v)//Q*Q; r = np.deg2rad(v[:n]).reshape(-1, Q)
    return np.rad2deg(np.arctan2(np.sin(r).mean(1), np.cos(r).mean(1))) % 360.0
def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""): h.update(chunk)
    return h.hexdigest()
```

### Pattern 2: Truth / Sensors split (DATA-04)

```python
# magnav/data.py
from dataclasses import dataclass
import numpy as np

FLT1006_LINE08 = "data/flt1006_line08.npz"   # literal paths: Qollab preloads only these
FLT1003_LINE02 = "data/flt1003_line02.npz"
FLT1007_LINE06 = "data/flt1007_line06.npz"
MAP_EASTERN = "data/map_eastern_395.npz"
MAP_RENFREW = "data/map_renfrew_395.npz"

@dataclass(frozen=True)
class Truth:            # ONLY metrics.py and pipeline.py may touch this
    t: np.ndarray; mag_1_c: np.ndarray; mag_1_igrf: np.ndarray
    lat: np.ndarray; lon: np.ndarray; utm_x: np.ndarray; utm_y: np.ndarray; utm_z: np.ndarray

@dataclass(frozen=True)
class Sensors:
    t: np.ndarray; fs: float
    mag: dict[str, np.ndarray]          # mag_3_uc, mag_4_uc, mag_5_uc
    flux: dict[str, np.ndarray]         # flux_a_x ... flux_d_t
    cur: dict[str, np.ndarray]          # 14 cur_* channels
    ins_pitch: np.ndarray; ins_roll: np.ndarray; ins_yaw: np.ndarray
    ins_vn: np.ndarray; ins_vw: np.ndarray
    igrf: np.ndarray; diurnal: np.ndarray   # external corrections (IGRF model / base station), see Pitfall 7

def load_line(path: str) -> tuple[Sensors, Truth]:
    with np.load(path, allow_pickle=False) as z:
        ...
```
Callers pass literal constants (`load_line(FLT1003_LINE02)`). Never build paths. The `Sensors` side never contains `mag_1_*`, `lat`, `lon` or `utm_*`. The simulated INS track is computed from `Sensors` plus the jam-time fix (Pattern 4), and the fix position is passed in as an explicit `(x0, y0)` tuple, not a Truth object.

### Pattern 3: Tolles-Lawson exactly as MagNav.jl (BASE-01)

[CITED: MagNav.jl src/tolles_lawson.jl `create_TL_A`, `create_TL_coef`, `fdm`; src/analysis_util.jl `get_bpf`, `bpf_data`, `linreg`; src/compensation.jl TL path, `linear_test`, `err_segs`]

- **A matrix** from one fluxgate (Bx, By, Bz), with `Bt = |B|` and `Bt_scale = 50000`:
  - permanent (3): `Bx/Bt, By/Bt, Bz/Bt`
  - induced (6): `X*Bx, X*By, X*Bz, Y*By, Y*Bz, Z*Bz`, each `/50000` (X = Bx/Bt, etc.)
  - eddy (9): `X*dBx, X*dBy, X*dBz, Y*dBx, Y*dBy, Y*dBz, Z*dBx, Z*dBy, Z*dBz`, each `/50000`. `dB` = `fdm` central difference **per sample** (not divided by dt): `(x[i+1]-x[i-1])/2`, with one-sided differences at the ends.
  - optional bias: a column of ones.
- **Filter:** DSP.jl `digitalfilter(Bandpass(0.1, 0.9), Butterworth(4); fs)` + `filtfilt`. In scipy: `sos = butter(4, [0.1, 0.9], btype="band", fs=fs, output="sos")`, `sosfiltfilt(sos, x, axis=0)`. Both are 4-pole prototypes, so the bandpass order is 8, zero-phase. At fs = 2 Hz the band 0.1-0.9 Hz sits below the 1 Hz Nyquist (OK). Constant columns are skipped (MagNav skips columns with std ≤ eps).
- **Fit:** bandpass the A columns and the target, trim edges (MagNav `trim=20` at 10 Hz, so **4 at 2 Hz**), then ridge `coef = (AᵀA + λI)⁻¹ Aᵀy`. MagNav's classic TL target is `y = bpf(mag_uc - sub)` (`y_type = :e`). Using `bpf(mag_uc - mag_1_c)` instead (supervised) gave the same result on these lines (95.5 vs 95.7 nT), so use the classic target.
- **Apply:** `compensated = mag_uc - A_unfiltered @ coef`. Bandpassing removed DC, so the compensated signal has an arbitrary offset. MagNav evaluates `err = y_hat - y` **with the per-line mean removed** (`err_segs`) and reports its std. D-09's "plus bias": the bias column is all zeros after bandpassing, so do not regress it. Instead set `bias = mean(compensated_cal - mag_1_c_cal)` on the calibration line and subtract it, so absolute levels line up for plots and RMSE.
- **Fluxgate:** MagNav's default `use_vec = :flux_a` [CITED: src/MagNav.jl CompParams defaults]. Measured on Mag 4, flux a/b/c/d all land within about ±5 nT of each other. Use `flux_a` as the constant (the prototype numbers below used `flux_d`).
- **λ on the calibration line only (D-09):** standardise the bandpassed columns (z-score), then do a blocked 70/30 time split of 1006.08 over the grid λ ∈ {1e-4 … 1e2}. Refit on all of 1006.08 with the chosen λ and rescale `coef /= sd`. **Never choose λ on held-out lines.**

```python
# magnav/classical.py -- numpy/scipy port of MagNav.jl TL
import numpy as np
from scipy import signal

BT_SCALE = 50000.0

def fdm(x):
    d = np.empty_like(x)
    d[1:-1] = (x[2:] - x[:-2]) / 2.0
    d[0] = x[1] - x[0]; d[-1] = x[-1] - x[-2]
    return d

def tl_A(bx, by, bz):
    bt = np.sqrt(bx**2 + by**2 + bz**2)
    X, Y, Z = bx / bt, by / bt, bz / bt
    dx, dy, dz = fdm(bx), fdm(by), fdm(bz)
    s = BT_SCALE
    cols = [X, Y, Z,
            X*bx/s, X*by/s, X*bz/s, Y*by/s, Y*bz/s, Z*bz/s]
    cols += [h*d/s for h in (X, Y, Z) for d in (dx, dy, dz)]
    return np.column_stack(cols)            # (n, 18)

def bpf(x, fs, lo=0.1, hi=0.9, order=4):
    sos = signal.butter(order, [lo, hi], btype="band", fs=fs, output="sos")
    return signal.sosfiltfilt(sos, x, axis=0)

def ridge(A, y, lam):
    return np.linalg.solve(A.T @ A + lam * np.eye(A.shape[1]), A.T @ y)
```

### Pattern 4: INS drift (DATA-05)

- Local frame: `x` = east, `y` = north, metres, from lat/lon via equirectangular about the map-tile centre (Pattern 6). East velocity `ve = -ins_vw`, north velocity `vn = ins_vn`.
- At jam index `j = int(0.25*n)` the DR track starts at the truth local position (the last GPS fix, passed in as `x0, y0`). Before `j`, the "estimate" is GPS (truth) for every denoiser.
- `rng = np.random.default_rng(seed)`, `bias = 0.3 * rng.choice([-1, 1], 2)`, `rw = np.cumsum(rng.normal(0, 0.05*np.sqrt(dt), (n-j, 2)), 0)`. Velocities after the jam: `ve + bias[0] + rw[:,0]`, `vn + bias[1] + rw[:,1]`. Integrate with forward Euler (`np.cumsum(v[:-1]*dt)`). Draw the RNG in a fixed order (bias first, then the walk) and record `seed` plus the drawn bias signs in provenance and the artifact.
- **Measured drift (seed 0):** 1003.02 DR mean error 1.09 km, final 0.95 km. 1007.06 mean 1.11 km, final 3.03 km. Seeds 1 and 2 on 1003.02: final 4.6 / 4.8 km. Analytic order: the bias gives about 0.42 m/s x t = 1.2 km at 2840 s. The random walk gives a per-axis position std of `0.05·t^1.5/√3` ≈ 4 km at 2840 s. **The drift story works**: DR is well beyond 556 m within minutes.
- Note that the DR track will leave the 5 km map margin late in 1007.06. That is fine for DR itself (it is only drawn), but Phase 3 must clip or extend the view.

### Pattern 5: numpy KRR (BASE-02, D-11)

- Features, per sample (shared function `kernel_features(sensors)`, to be reused verbatim by Phase 4):
  - the 9 permanent + induced A-columns (all built from direction cosines);
  - their 9 `fdm` derivatives;
  - the 4 D-10 currents.
  - That makes 22 columns, standardised with calibration-line mean/std (stored in the model).
- Target: TL residual on the calibration line, `r = (mag_uc - A@coef - bias) - mag_1_c`. Bandpass it 0.1-0.9 Hz. The demeaned unfiltered target **hurt** (70→88 nT, 93→130 nT). The bandpassed target was neutral (70.2→70.4, 93.3→93.4).
- Kernel `exp(-γ‖a-b‖²)`, γ = median heuristic x {0.25, 1, 4}, λ ∈ {1e-2 … 10}, chosen by blocked 70/30 split on 1006.08. Solve `(K + λI) α = y`. Predict in **row chunks of 1000** (a 10480 x 1678 float64 kernel is 140 MB unchunked).
- Measured cost: fit 0.06-0.08 s, predict 0.1 s per line (CPython).
- Expose `n_train` (subsample stride) so Phase 4/5 can match the quantum model's training size exactly.

```python
def rbf(a, b, gamma):
    d2 = (a*a).sum(1)[:, None] + (b*b).sum(1)[None, :] - 2.0 * a @ b.T
    return np.exp(-gamma * np.maximum(d2, 0.0))

def krr_fit(Z, y, gamma, lam):
    return np.linalg.solve(rbf(Z, Z, gamma) + lam * np.eye(len(Z)), y)

def krr_predict(Zt, Z, alpha, gamma, chunk=1000):
    return np.concatenate([rbf(Zt[i:i+chunk], Z, gamma) @ alpha for i in range(0, len(Zt), chunk)])
```

### Pattern 6: TERCOM windowed correlation (NAV-01..03, D-13..D-15)

- **Frame:** `x = radians(lon - lon0)·R·cos(radians(lat0))`, `y = radians(lat - lat0)·R`, with R = 6,371,008.8 m and (lat0, lon0) = the tile centre. Map cell centres convert with the same formula, so sampling is consistent by construction. Distortion compared with UTM: median distance ratio 0.9995 (1003.02) / 0.9990 (1007.06). This is negligible for errors of hundreds of metres.
- **MapTile.sample(x, y):** vectorised bilinear interpolation on the regular grid. A sample is valid only if all 4 neighbouring coarse cells have mask True and lie inside the grid.
- **Signal:** `s = cleaned - igrf - diurnal` (Sensors channels). The truth equivalent is `mag_1_c - igrf - diurnal` ≈ `mag_1_igrf`.
- **Per window k** (end index `e = j + W + k·S`, W = 120, S = 20):
  1. **Prior (recursive, INS-propagated):** `p = est_{k-1} + (DR[e-1] - DR[e_prev-1])`, with `est_{-1}` = the fix at the jam. See Open Question 1 for why a raw-DR-centred box fails.
  2. Window path shape = the DR track over `[e-W, e)` relative to its last point. Candidate path = `p + offset + shape`.
  3. Offsets: a 51 x 51 grid at 60 m step over ±1500 m (the 3 km square, D-14), so 2601 candidates. `X = p_x + OX[:,None] + rx[None,:]` gives a (2601, 120) array.
  4. `mv, ok = tile.sample(X, Y)`. Candidates with any invalid sample get score -inf (D-14).
  5. NCC: `w = s_win - mean`, `m̃ = mv - mean(mv, axis=1)`, `ncc = (m̃ @ w) / (‖m̃‖·‖w‖ + eps)`.
  6. **Gate (recommended addition, see Open Question 2):** if `max(ncc) >= 0.85`, `est_k = p + best_offset`. Otherwise `est_k = p` (coast on the INS increment).
  7. Output position = a **causal** 3-window median of `est` (k-2..k) per axis (D-15). The median is used for output only and is not fed back into the prior.
- **Per-sample track** for metrics and plots: between window ends, propagate the last output estimate with DR increments. Before the first full window (jam .. jam+60 s) the estimate equals DR.
- **Cost:** about 18-21 ms per window in CPython (2601 x 120 bilinear + NCC). 1003.02 has 278 windows and 1007.06 has 387, so ~6-8 s per (line, denoiser). Five denoisers x two lines ≈ 60-80 s locally. Pyodide is typically slower than CPython [ASSUMED: ~1.5-3x], so **precompute for the UI**. If a live in-browser run is wanted in Phase 3, use coarse-to-fine: a 26 x 26 grid at 120 m, then 7 x 7 at 30 m around the best, which is ~3.5x fewer samples.
- **Memory:** (2601 x 120) float64 temporaries are ~2.5 MB each, ~20 MB peak. The map tile is ≤ 1.4 MB float32. Both are fine for Pyodide.

```python
# magnav/nav.py (core of one window) -- prototype verified on real lines 2026-10-10
off = np.arange(-1500.0, 1500.0 + 1e-9, 60.0)
OX, OY = (a.ravel() for a in np.meshgrid(off, off))
def match_window(tile, s_win, px, py, rx, ry, gate=0.85):
    X = px + OX[:, None] + rx[None, :]; Y = py + OY[:, None] + ry[None, :]
    mv, ok = tile.sample(X, Y)
    w = s_win - s_win.mean(); mc = mv - mv.mean(1, keepdims=True)
    ncc = (mc @ w) / (np.linalg.norm(mc, axis=1) * np.linalg.norm(w) + 1e-9)
    ncc[~ok.all(1)] = -np.inf
    k = int(np.argmax(ncc))
    return (px + OX[k], py + OY[k], float(ncc[k])) if ncc[k] >= gate else (px, py, float(ncc[k]))
```

### Pattern 7: Metrics (METR-01)

Computed over the **magnetic-only segment `[j + W, n)`**, i.e. from the end of the first full window after the jam (D-07). Also report the DR row on the same samples.
- Signal (vs `mag_1_c`, held-out line): `e = cleaned - mag_1_c`. `signal_err_std_nT = std(e - mean(e))` (the MagNav challenge metric). `signal_rmse_nT = sqrt(mean(e²))` after the calibration-line bias correction.
- Position: `p_i = hypot(x̂_i - x_i, ŷ_i - y_i)` per 2 Hz sample.
  - `mean_err_m = mean(p)`, `final_err_m = p[-1]`.
  - `cep50_m = percentile(p, 50)`, `cep95_m = percentile(p, 95)` (numpy linear interpolation).
  - `pct_under_556 / _1852 / _3704 = 100·mean(p < thr)`.
- Truth position for metrics = lat/lon converted with the same local frame as the map (`utm_x`/`utm_y` are kept in Truth per D-08 and cross-checked by a test: track length local vs UTM within 0.5%).

### Pattern 8: RunArtifact v1 (D-16) for Phase 3

```json
{
  "schema_version": 1,
  "title": "Quantum MagNav - SGL 2020 classical pipeline",
  "provenance": {
    "dataset": "SGL 2020 MagNav Challenge (USAF CA FA8750-19-2-1000; Gnadt et al. arXiv:2007.12158); maps from MagNav.jl",
    "code_version": "0.1.0",
    "decimation": {"factor": 5, "method": "block_mean", "fs_hz": 2.0},
    "seed": 0, "ins_drift": {"bias_mps": 0.3, "bias_signs": [1, -1], "rw_sigma_mps_per_sqrt_s": 0.05},
    "tl": {"fluxgate": "flux_a", "terms": 18, "band_hz": [0.1, 0.9], "lambda": 0.01, "cal_line": "1006.08"},
    "tercom": {"window_s": 60, "stride_s": 10, "search_m": 3000, "step_m": 60, "gate": 0.85, "median": 3},
    "sources": [{"file": "Flt1003_train.h5", "sha256": "...", "line": "1003.02", "tt_range": [50713.0, 54497.0]}]
  },
  "denoisers": ["raw", "lowpass", "tl", "tl_currents", "krr", "quantum"],
  "lines": [{
    "line": "1003.02", "map_file": "data/map_eastern_395.npz",
    "frame": {"type": "local_equirectangular", "lat0": 44.76, "lon0": -76.0, "R_m": 6371008.8},
    "map_preview": {"nx": 160, "ny": 176, "x_min": -19000, "x_max": 19000, "y_min": -21000, "y_max": 21000,
                    "nT_int16_rowmajor_south_to_north": [], "valid": []},
    "jam": {"index": 1892, "t_s": 946.0},
    "t": [], "truth": {"x": [], "y": [], "anomaly_nT": []},
    "dead_reckoning": {"x": [], "y": []},
    "estimates": {"tl": {"x": [], "y": [], "signal_nT": [], "ncc": []}},
    "metrics": {"tl": {"signal_err_std_nT": 0, "signal_rmse_nT": 0, "mean_err_m": 0, "final_err_m": 0,
                       "cep50_m": 0, "cep95_m": 0, "pct_under_556": 0, "pct_under_1852": 0, "pct_under_3704": 0},
                "dead_reckoning": {}}
  }],
  "metrics_table": [{"line": "1003.02", "denoiser": "tl", "...": 0}]
}
```
- Downsample each series with one shared index: `idx = arange(0, n, ceil(n/2000))`, then union with `{jam index, n-1}` and sort. 1007.06 (10480 samples) gets stride 6, about 1748 points.
- Rounding: metres to 1 decimal, nT to 2 decimals, `t` to 0.1 s. Write with `json.dumps(..., allow_nan=False, separators=(",", ":"))` and map NaN to `null` beforehand.
- Do **not** include a wall-clock timestamp. That keeps the artifact byte-reproducible.
- Size estimate: 2 lines x ~25 series x ~1750 points x ~8 chars ≈ 0.7 MB, plus two int16 map previews of ~200 KB each, so under 2 MB. Assert this in a test.
- `quantum` entry: present with `"status": "stub"` and passthrough (TL) values, so Phase 3 can wire the UI before Phase 4.

### Pattern 9: Quantum slot stub (final interface)

```python
# magnav/quantum_slot.py
class QuantumDenoiserStub:
    name = "quantum"
    status = "stub"                      # Phase 4 replaces with the real feature-map model
    def fit(self, features_cal, target_cal): ...          # classical readout training (statevector locally)
    def predict(self, features):                          # returns residual correction (nT); stub -> zeros
        return np.zeros(len(features))
    def run_inference(self, backend, features) -> str:    # Phase 4: builds ONE circuit, ONE backend.run; JSON string
        return json.dumps({"ok": False, "status": "stub", "backend": getattr(backend, "name", None)})
```
It consumes `kernel_features(sensors)` (the same as KRR) and must never construct a backend.

### Anti-Patterns to Avoid
- **Centring the 3 km search on the raw DR position.** DR error grows to 1-5 km, so the truth leaves the box. Use the recursive INS-propagated prior.
- **Integrating INS velocities in UTM coordinates.** Grid convergence of up to 1.26 deg creates a fake cross-track drift. Integrate in the true-north local frame.
- **Choosing λ/γ on held-out lines.** That leaks test data (D-09 forbids it). In the probe, held-out-chosen λ looked 20% better than calibration-chosen λ, so the temptation is real.
- **Passing `Truth` into a denoiser or navigator.** The training target is passed in as a bare array by the orchestrator, for the calibration line only.
- **Plain `np.savez` for 1007.06** (2.28 MB).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zero-phase Butterworth | custom IIR / FFT masking | `scipy.signal.butter(..., output="sos")` + `sosfiltfilt` | `ba` form is numerically fragile for an 8th-order bandpass at fs = 2 Hz. `sos` is stable |
| HDF5 parsing | anything custom | h5py (local only) | — |
| npz writing/reading | a custom zip writer | `np.savez_compressed`, `np.load(path, allow_pickle=False)` | Verified deterministic in numpy 2.4.6 |
| Map interpolation inside the TERCOM loop | `RegularGridInterpolator` per candidate | a vectorised bilinear on index arithmetic (~15 lines) | Must return a validity flag from the mask in the same pass, and must handle (2601 x 120) at once. RGI is fine for one-off checks |
| SHA-256 | — | `hashlib.sha256` streamed | — |
| Percentiles/CEP | sorting by hand | `np.percentile` | — |

**Key insight:** the risky parts here are conventions, not algorithms: transposed maps, the west-velocity sign, line-id float matching, edge transients, true north vs grid north. Each one is a one-line fix with a matching one-line test.

## Common Pitfalls

### Pitfall 1: `scipy.signal.decimate` edge transients on large-DC signals
**What goes wrong:** With `decimate(x, 5, ftype='fir', zero_phase=True)` on ~53,000 nT channels, the TL held-out error rose from 70 to 1,500 nT, the low-pass floor from 186 to 591 nT, and TL+currents blew up.
**Why:** The FIR zero-phase path pads with zeros at the edges, so a 53,000 nT step appears at both ends.
**How to avoid:** Use a block mean of 5 (verified to match 10 Hz TL accuracy). Use a circular mean for yaw.
**Warning signs:** errors concentrated in the first/last ~50 samples; low-pass floor worse than raw.

### Pitfall 2: Transposed maps from Julia-written HDF5
**What goes wrong:** `f["map"].shape == (len(xx), len(yy))`. Indexing it as `[lat_row, lon_col]` silently samples the wrong place, or fails on non-square maps (Eastern 6238 x 4881).
**How to avoid:** `M = f["map"][:].T` and `mask = f["mask"][:].T.astype(bool)`. Assert `M.shape == (len(yy), len(xx))`. Test: sampling at the true track reproduces `mag_1_igrf` with correlation > 0.99 (measured 0.9993-0.9998).

### Pitfall 3: Line-id float matching
**What goes wrong:** `np.isclose(line, 1006.08)` (rtol = 1e-5, about 0.01 at this magnitude) selected 1006.07 + 1006.08 + 1006.09 (34,123 samples).
**How to avoid:** `line == 1006.08` (exact float64 values) or `np.abs(line - L) < 1e-6`. Assert the expected count. Selecting by `tt` range instead would pull in the duplicated boundary sample of the neighbouring line.

### Pitfall 4: Mag 4 + TL is marginal for TERCOM (most important)
**What goes wrong:** TL on Mag 4 leaves about 70-105 nT of error (30-45 nT after per-60 s-window mean removal), against a map signal of ~100-150 nT/km. With no gate the matcher locks onto wrong offsets and walks away (1007.06 mean error 9.7 km, worse than DR at 1.1 km).
**How to avoid:** Use the NCC gate (0.85) with coasting, the recursive prior, and the causal median. Make `PRIMARY_MAG` one constant. Show the Mag 5 row in the metrics table (it is already in the excerpts) and add a human checkpoint (Open Question 3).
**Warning signs:** accepted-fix ratio below 90%; position error jumping in multiples of the search half-width.

### Pitfall 5: TL+currents extrapolation
**What goes wrong:** The calibration line's current std is about 3x smaller than on the test flights. With small λ, held-out error went to 600-1,500 nT. With λ = 1 on raw-scale columns it helped (69→61, 91→77 nT on Mag 4), and on Mag 3 it hurt (59→166 nT).
**How to avoid:** Standardise columns and choose λ on the calibration split. Report TL+currents honestly even when it loses. Consider bandpassing the currents' contribution at apply time (low-frequency current steps are not TL physics). Keep it as a reported variant, not the primary.

### Pitfall 6: True north vs UTM grid north
**What goes wrong:** INS `vn`/`vw` are true-north. UTM grid north is rotated 0.65 deg (1003.02) to 1.26 deg (1007.06), which gives a spurious DR error of about 2% of net displacement.
**How to avoid:** Run DR, map and metrics all in the local equirectangular frame. Keep `utm_x`/`utm_y` in Truth only for a cross-check test.

### Pitfall 7: IGRF/diurnal provenance
**What goes wrong:** `igrf` is not in the file, so a missing derivation silently yields a ~53,600 nT offset. Also, the dataset IGRF was evaluated at GPS positions.
**How to avoid:** Derive `igrf = mag_1_dc - mag_1_igrf` in preprocessing. Document it as an external-model channel. Its spatial gradient is about 1-2 nT/km (std 13-65 nT over a line), and NCC removes each window's mean, so the leak is negligible. Say this in the README.

### Pitfall 8: Heading wrap
A block mean of `ins_yaw` across 359→1 gives 180. Use a circular mean (Pattern 1). Yaw is not used by TL or TERCOM but is shipped and may be plotted.

### Pitfall 9: Mask alignment after downsampling
The crop start index must be the same for map, mask, xx and yy, and each block must be trimmed to a multiple of 4 before reshaping. Coarse coordinates = the block mean of the fine coordinates (cell centres). Test: the coarse map at coarse centres ≈ fine map bilinear at the same points (residual ≪ 10 nT in smooth regions); the coarse mask is never True where any fine cell is False.

### Pitfall 10: KRR memory in Pyodide
A full held-out kernel (10480 x 1678 float64) is 140 MB. Chunk the prediction (Pattern 5). The calibration kernel (1678²) is 22 MB, which is fine.

### Pitfall 11: Byte-identical outputs
numpy 2.4.6 `savez`/`savez_compressed` produced identical bytes across runs 2 s apart (verified). Keep the dict key order deterministic, avoid timestamps in JSON, and write JSON with fixed separators and rounding.

## Code Examples

### Map crop + 4x all-valid downsample (local script)
```python
# Source: verified with p5.py probe 2026-10-10
f = h5py.File("data_raw/ottawa_area_maps/ottawa_area_maps/Renfrew_395.h5", "r")
xx, yy = f["xx"][:], f["yy"][:]
M = f["map"][:].T; mk = f["mask"][:].T.astype(bool)          # rows = lat, cols = lon
assert M.shape == (len(yy), len(xx))
lat0 = lat.mean(); dlat = 5000/110540; dlon = 5000/(111320*np.cos(np.deg2rad(lat0)))
ix = np.flatnonzero((xx >= lon.min()-dlon) & (xx <= lon.max()+dlon))
iy = np.flatnonzero((yy >= lat.min()-dlat) & (yy <= lat.max()+dlat))
k = 4; ny, nx = len(iy)//k, len(ix)//k
sub = M[iy[0]:iy[0]+ny*k, ix[0]:ix[0]+nx*k]; subm = mk[iy[0]:iy[0]+ny*k, ix[0]:ix[0]+nx*k]
grid = sub.reshape(ny, k, nx, k).mean(axis=(1, 3)).astype(np.float32)
valid = subm.reshape(ny, k, nx, k).all(axis=(1, 3))
xx4 = xx[ix[0]:ix[0]+nx*k].reshape(nx, k).mean(1); yy4 = yy[iy[0]:iy[0]+ny*k].reshape(ny, k).mean(1)
np.savez_compressed("data/map_renfrew_395.npz", alt=np.float64(395.0), map=grid, mask=valid, xx=xx4, yy=yy4)
```

### Vectorised bilinear with validity
```python
def sample(self, x, y):
    fx = (x - self.gx[0]) / self.dx; fy = (y - self.gy[0]) / self.dy
    i0 = np.floor(fx).astype(np.int64); j0 = np.floor(fy).astype(np.int64)
    inside = (i0 >= 0) & (j0 >= 0) & (i0 < self.nx - 1) & (j0 < self.ny - 1)
    i0 = np.clip(i0, 0, self.nx - 2); j0 = np.clip(j0, 0, self.ny - 2)
    tx = fx - i0; ty = fy - j0; M = self.M; V = self.V
    v = (M[j0, i0]*(1-tx)*(1-ty) + M[j0, i0+1]*tx*(1-ty) + M[j0+1, i0]*(1-tx)*ty + M[j0+1, i0+1]*tx*ty)
    ok = inside & V[j0, i0] & V[j0, i0+1] & V[j0+1, i0] & V[j0+1, i0+1]
    return v, ok
```
Because x/y come from the equirectangular conversion of lon/lat, `gx`/`gy` (cell centres in local m) are uniform, so this exact index arithmetic is valid.

## Prototype Results (real data, 2 Hz block mean, seed 0 unless noted)

These are measured numbers. They are not targets, but the plan's verification should expect values of this order.

**Signal error std vs `mag_1_c` (mean removed), held-out 1003.02 / 1007.06, nT**

| Denoiser | Mag 4 | Mag 5 | Mag 3 |
|---|---|---|---|
| raw | 193 / 236 | 104 / 106 | 969 / 1083 |
| low-pass 0.05 Hz | 186 / 234 | — | — |
| TL (λ from the cal split; flux_d) | 70-96 / 88-106 | 15-16 / 22-24 | 57-60 / 82-101 |
| TL + 4 currents | unstable: 61 / 77 at λ = 1 raw-scale; 600-1500 with tiny λ | 22-25 / 24-30 | 166-184 / 177-188 |
| TL + RBF KRR (bandpassed residual target) | 70.4 / 93.4 (no gain) | — | — |

**Navigation (TERCOM, recursive prior, 60 s / 10 s, ±1.5 km at 60 m, median 3)**

| Config | 1003.02 mean / CEP50 / %<556 m | 1007.06 mean / CEP50 / %<556 m |
|---|---|---|
| truth signal (`mag_1_c` anomaly) | 60 m / 52 m / 100% | 68 m / 56 m / 100% |
| DR only | 1089 m (final 954) | 1108 m (final 3032) |
| raw Mag 4, gate 0.85 | 2008 m / 1202 / 38% | 8192 m / 10568 / 9% |
| TL Mag 4, no gate | 2236 m / 276 / 60% | 9719 m / 6834 / 14% |
| TL Mag 4, gate 0.70 | 858 m / 165 / 77% | 6229 m / 6100 / 33% |
| **TL Mag 4, gate 0.85** | **282 m / 118 / 88%** | **931 m / 250 / 64%** |
| TL Mag 4, gate 0.70, seeds 1 and 2 (1003.02) | 2424 / 328 / 56%; 2142 / 282 / 61% | — |
| **TL Mag 5, any gate** | **138-177 m / 71-110 / 97%** | **92-94 m / 61 / 98-99%** |

(The prototype used a centred, non-causal median and flux_d. A causal median shifts numbers slightly.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Eddy terms `X·d(X̂)·Bt` | Eddy terms `X̂·dB` (direct derivative of the components) | MagNav.jl (comment: "original (slightly incorrect) eddy current terms") | Use the current form (Pattern 3) [CITED: tolles_lawson.jl] |
| Filter `ba` coefficients | `sos` + `sosfiltfilt` | scipy ≥ 0.16 | Numerical stability |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pyodide runs this numpy code about 1.5-3x slower than CPython | Pattern 6 | A live in-browser TERCOM run could take minutes; mitigated by the precomputed artifact and coarse-to-fine search |
| A2 | `np.load` of `savez_compressed` (deflate) works in Pyodide (zlib is in the Pyodide stdlib) | Standard Stack | If wrong, ship plain npz, but 1007.06 then needs fewer channels (e.g. drop 8 low-variance `cur_*`), or split the file. Verify by uploading one npz to the Qollab editor (upload only, no Publish) |
| A3 | The NCC gate + coasting is an acceptable reading of D-14/D-15 | Pattern 6 / OQ2 | If the user rejects it, Mag 4 TL navigation diverges on 1007.06 |
| A4 | The recursive INS-propagated prior satisfies "centred on the INS-drift prior" (D-14) | OQ1 | If the user meant the raw DR position, no denoiser can hold once DR error passes 1.5 km |
| A5 | D-11's "9 TL direction-cosine terms" means the 3 permanent + 6 induced A-columns | Pattern 5 | Phase 4 feature parity; the shared `kernel_features()` keeps both models consistent whichever way it is read |
| A6 | h5py package metadata (age, repo) | Package audit | None (local only) |

## Open Questions (RESOLVED)

1. **What does "search centred on the INS-drift prior" mean (D-14)?** — RESOLVED
   - Finding: centring on the raw DR position fails, because DR error reaches 1-5 km while the box is only ±1.5 km.
   - Resolution: prior = last estimate + DR displacement since the last window (recursive INS propagation), initialised at the jam fix. This is standard TERCOM practice and is how the prototype held position.
   - Plan handling: the `nav.tercom()` task implements it. A unit test plants an offset on a synthetic map and checks the recursion. The provenance records `"prior": "recursive_ins_propagated"`.

2. **Is fix gating allowed alongside D-15?** — RESOLVED (with a user-visible note)
   - Finding: without a gate, Mag 4 TL diverges on 1007.06. Gate 0.85 restores holding.
   - Resolution: implement `gate` as a parameter (default 0.85). Below the gate, coast on the prior. Record `gate` and the accepted-fix count per denoiser in the artifact. The 3-window median (D-15) is still applied to the output.
   - Plan handling: the nav task, plus the Pattern 8 artifact fields `ncc` and `accepted`. The checkpoint in Q3 shows the gate's effect.

3. **Mag 4 (D-02) holds only marginally. Do we keep it as primary?** — RESOLVED by checkpoint
   - Finding: TL Mag 4 gives 282 m / 931 m mean error at gate 0.85 and is seed-sensitive. TL Mag 5 gives about 100-150 m robustly.
   - Resolution: keep D-02 (`PRIMARY_MAG = "mag_4_uc"` as one constant). Also compute a `tl_mag5` reference row in the metrics table, since `mag_5_uc` is already in the excerpts. Add a **`checkpoint:human-verify`** after the first full `main.py` run that shows the table and asks the builder whether to keep Mag 4 or switch `PRIMARY_MAG` to Mag 5 before Phase 3 consumes the artifact. Mag 4 leaves the most headroom for the Phase 4 quantum residual model. Mag 5 gives the most reliable "holds position" demo.
   - Plan handling: the last task of the pipeline plan, before the artifact is declared final.

4. **Which fluxgate?** — RESOLVED: `flux_a` (the MagNav default). Measured differences between a/b/c/d are within about ±5 nT on Mag 4. One constant in `classical.py`.

5. **scikit-learn or numpy KRR?** — RESOLVED: numpy (Pattern 5). No requirements.txt change. The `test_sklearn_use_is_listed_in_requirements` guard stays green.

6. **Decimation method?** — RESOLVED: block mean of 5 (Pitfall 1), with a circular mean for yaw. Recorded in provenance as `"method": "block_mean"`.

7. **Where do the metrics start?** — RESOLVED: from `jam + W` (the first full window) to the end of the line, with the DR row computed on the same samples. The artifact also includes the full post-jam track for display.

8. **How does Phase 3 get the map?** — RESOLVED: the artifact includes a small int16 `map_preview` (≤ 200 x 200) plus extent, so the precomputed fallback needs only the JSON. The full-resolution tile stays in npz for Python.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| uv | running preprocessing with h5py | ✓ | (`$HOME/.local/bin/uv`) | — |
| h5py (ephemeral) | `scripts/preprocess_sgl.py` | ✓ via `uv run --with h5py` | latest | — |
| Raw HDF5 + maps | preprocessing | ✓ in `data_raw/` (gitignored) | Zenodo files; sizes verified | — |
| numpy 2.4.6 / scipy 1.18 | everything | ✓ (project venv) | pinned | — |
| matplotlib | `main.py` figures | ✓ (dev group) | 3.10.x | skip figures if the import fails |

**Missing dependencies with no fallback:** none.
**Note:** `test_preprocess_repro.py` must `pytest.skip` when `data_raw/` is absent (CI / fresh clone).

## Validation Architecture

(`workflow.nyquist_validation` is false. This compact test map is included because it was requested.)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 9.1 (existing `tests/`, `pythonpath = ["."]`) |
| Quick run command | `uv run pytest -q tests/test_tl.py tests/test_nav.py tests/test_data_files.py` |
| Full suite command | `uv run pytest -q && uv run ruff check` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01/02 | every `data/*` < 2,097,152 bytes; expected npz keys/dtypes; map shape == (len(yy), len(xx)) | unit | `pytest tests/test_data_files.py -x` | ❌ Wave 0 |
| DATA-03 | provenance lists every data file with an sha256 that matches the file bytes; repro re-run is byte-identical (skip without data_raw) | unit | `pytest tests/test_data_files.py tests/test_preprocess_repro.py` | ❌ |
| DATA-03 | every `DATA_FILES` entry in package_qollab.sh appears as a literal in `magnav/*.py`, and vice versa | unit | `pytest tests/test_data_files.py::test_literal_paths` | ❌ |
| DATA-04 | AST: no function in `classical.py`/`nav.py`/`quantum_slot.py` has a parameter named `truth` or annotated `Truth`, and those modules do not import `Truth` | unit | `pytest tests/test_truth_guard.py` | ❌ |
| DATA-05 | DR with zero bias/walk reproduces the truth track to < 1% of distance (sign conventions); same seed gives identical arrays | unit (real npz) | `pytest tests/test_nav.py::test_dr_signs` | ❌ |
| BASE-01 | synthetic fluxgate manoeuvre with planted 18 coefficients (+ low-frequency "earth" signal outside the band) is recovered to < 1% | unit | `pytest tests/test_tl.py` | ❌ |
| BASE-01 | on the real npz, TL Mag 4 held-out err std < raw err std (sanity, ≈ 70-110 vs 193-236) | integration | `pytest tests/test_tl.py::test_real_tl_improves` | ❌ |
| BASE-02 | numpy KRR matches a closed-form solution on a tiny problem; chunked predict == unchunked | unit | `pytest tests/test_classical.py` | ❌ |
| NAV-01 | synthetic smooth random map + planted 700 m offset: TERCOM recovers it within one grid step; candidates touching invalid cells are never chosen | unit | `pytest tests/test_nav.py` | ❌ |
| METR-01 | metrics on hand-built error arrays (known CEP/percentages) | unit | `pytest tests/test_metrics.py` | ❌ |
| D-16 | artifact: schema_version 1, every series ≤ 2000 points and the same length as `t`, no NaN, < 2 MB, required keys present | unit | `pytest tests/test_artifact.py` | ❌ |

### Wave 0 Gaps
- [ ] `tests/test_data_files.py`, `tests/test_truth_guard.py`, `tests/test_tl.py`, `tests/test_nav.py`, `tests/test_metrics.py`, `tests/test_artifact.py`, `tests/test_preprocess_repro.py`
- [ ] Extend `scripts/package_qollab.sh` `DATA_FILES` with the 6 new data files plus `data/precomputed_run.json`

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (light) | `np.load(..., allow_pickle=False)` (blocks pickle code execution from npz). Strict int coercion on any JS-supplied parameters (existing `_as_int`). Run h5py scripts with `python -I` |
| V6 Cryptography | no (SHA-256 for integrity only) | `hashlib` |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Pickle payload in npz | Tampering / EoP | `allow_pickle=False` everywhere |
| Untrusted downloaded files executing code | EoP | Raw data stays in `data_raw/`. Scripts live elsewhere and run with `-I` |
| Data-licence breach | Repudiation | Ship only excerpts, cite the dataset (USAF CA FA8750-19-2-1000, arXiv:2007.12158, MagNav.jl maps) per DATA_SHARING_AGREEMENT; the README lists it |

## Sources

### Primary (HIGH confidence)
- Local h5py probes on `data_raw/Flt1003/1006/1007_train.h5`, `Eastern_395.h5`, `Renfrew_395.h5` (2026-10-10): line spans, channel stats, map orientation, mask, crop sizes, npz sizes, TL/KRR/TERCOM prototypes. Scripts are in the session scratchpad.
- MagNav.jl source (GitHub master, fetched 2026-10-10): `src/tolles_lawson.jl` (create_TL_A, create_TL_coef, fdm), `src/analysis_util.jl` (get_bpf, bpf_data, linreg, detrend, err_segs, get_y), `src/compensation.jl` (TL train/test path, linear_fit/linear_test), `src/get_XYZ.jl` (igrf derivation, `ins_ve = -ins_vw`, deg→rad), `src/get_map.jl` (xx/yy deg, ny x nx), `src/MagNav.jl` (XYZ20 field units, UTM zone 18N, MapS mask semantics, `use_vec = :flux_a` default).
- `data_raw/datasheet_sgl_2020_train.pdf`: sensor layout (Mag 1 tail stinger; Mags 2-5 cabin; Flux A-D positions), 10 Hz downsampled from 160 Hz, `mag_1_c` is truth, dt erratum.
- `docs/QOLLAB_FINDINGS.md`: Pyodide versions, sklearn not preloaded, 2 MB limit.

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` (Pyodide lock contents, including scikit-learn 1.8.0).

### Tertiary (LOW confidence)
- Pyodide-vs-CPython speed ratio (A1), from general knowledge.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. No new packages; all versions pinned and verified in Phase 1.
- Data facts / conventions: HIGH. Measured on the real files and cross-checked with MagNav.jl source.
- TL implementation: HIGH. Ported from source; numbers reproduce the expected order of magnitude.
- Navigation performance: MEDIUM. Real-data prototype, few seeds. The Mag 4 result is fragile by nature.
- Pitfalls: HIGH. Most were reproduced, not inferred.

**Research date:** 2026-10-10
**Valid until:** end of hackathon (2026-10-11). The data and MagNav conventions are stable.

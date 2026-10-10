# Phase 2: Real Flight Data and Classical Pipeline - Context

**Gathered:** 2026-10-10
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous); 4 grey areas, all accepted by the builder

<domain>
## Phase Boundary

Running one command on real SGL 2020 data shows, with numbers, that after a simulated GPS jam the dead-reckoning and raw-cabin-signal tracks drift while the Tolles-Lawson-cleaned track holds position on held-out lines; this is the valid-even-if-quantum-fails floor. Delivers: `scripts/preprocess_sgl.py` (local-only, h5py) producing `data/*.npz` excerpts under 2 MB plus `data/provenance.json`; `magnav/` loaders with the `Truth`/`Sensors` split; simulated INS drift; Tolles-Lawson, TL+currents, low-pass and classical KRR denoisers; a quantum-slot stub with the final denoiser interface; windowed-correlation (TERCOM-style) navigation on the Eastern_395/Renfrew_395 tiles; the metrics table; and `data/precomputed_run.json` (RunArtifact v1). No frontend work (Phase 3) and no real quantum circuit (Phase 4).

Platform constraints inherited from Phase 1 (see docs/QOLLAB_FINDINGS.md): Qollab runs Python 3.14.2 on Pyodide with numpy 2.4.6 / scipy 1.18.0; scikit-learn is NOT preloaded (add `scikit-learn` to requirements.txt or implement ridge/KRR in numpy); every shipped file must be under 2 MB and loaded by a literal path string; h5py never ships. IonQ accepts one single-circuit job per Run, which shapes the quantum-slot interface: the stub must take `backend` and expose a method that will later submit exactly one circuit.

</domain>

<decisions>
## Implementation Decisions

### Data excerpts (D-01..D-04)
- D-01: Flight excerpts are decimated from 10 Hz to 2 Hz (anti-aliased, e.g. scipy.signal.decimate or boxcar mean of 5) and stored as float32 so each line file stays well under 2 MB.
- D-02: The primary polluted sensor is cabin Mag 4 (`mag_4_uc`); `mag_3_uc` and `mag_5_uc` are kept in the excerpts for a Phase 5 cabin-sensor sweep.
- D-03: Maps are cropped to each held-out line's bounding box plus a 5 km margin and downsampled from ~30 m to ~120 m cells (4x) so each map file is under 2 MB; the validity mask is downsampled with "all-valid" semantics (a coarse cell is valid only if all fine cells are valid).
- D-04: The GPS jam happens 25% into each held-out line, leaving a GPS-aided lead-in and a long magnetic-only tail.

### INS drift and thresholds (D-05..D-08)
- D-05: Dead reckoning integrates `ins_vn`/`ins_vw` from the last fix at the jam time, adding a constant per-axis velocity bias of 0.3 m/s (random sign) plus a random walk with sigma 0.05 m/s/sqrt(s); the RNG seed is fixed and recorded in the artifact and provenance.
- D-06: The RNP-style threshold is 556 m (0.3 nmi, the AQNav figure); 1 nmi and 2 nmi are also reported as "% time under threshold".
- D-07: Metrics are computed over the magnetic-only segment after the jam.
- D-08: Truth position is `utm_x`/`utm_y` from the dataset; truth magnetic signal is `mag_1_c` (map-matching uses the IGRF/diurnal-removed equivalent).

### Baselines (D-09..D-12)
- D-09: Tolles-Lawson uses the 18 classic terms (3 permanent, 6 induced, 9 eddy) plus bias, with a 0.1–0.9 Hz bandpass applied before fitting and a ridge lambda chosen on the calibration line 1006.08 only.
- D-10: The TL+currents variant adds the 4 largest-variance `cur_*` channels as extra regressors.
- D-11: KRR features are the 9 TL direction-cosine terms, their derivatives, and the 4 currents, evaluated per sample (no history window) so the feature set is identical to what the quantum feature map will consume in Phase 4.
- D-12: The naive low-pass floor is a 4th-order Butterworth at 0.05 Hz on the cabin mag.

### Navigation and artifact (D-13..D-16)
- D-13: TERCOM window = 60 s of cleaned signal (120 samples at 2 Hz) with a 10 s stride.
- D-14: Search region = 3 km square centred on the INS-drift prior; score = normalized cross-correlation on mean-removed windows; invalid (k-NN-filled) map cells are excluded from every candidate.
- D-15: Position estimate = best-correlation offset, smoothed with a 3-window median.
- D-16: RunArtifact v1 = columnar JSON with `t`, truth xy, dead-reckoning xy, per-denoiser estimated xy and cleaned signal (downsampled to <= 2000 points per series), the metrics table, provenance (source files, line, tt range, decimation, seed), and `schema_version: 1`; written to `data/precomputed_run.json` under 2 MB.

### Post-research amendments (D-17..D-18, accepted by the builder 2026-10-10 after 02-RESEARCH.md)
- D-17: The pipeline runs BOTH cabin sensors, Mag 4 (`mag_4_uc`) and Mag 5 (`mag_5_uc`), through every denoiser and the navigator; the artifact and metrics table carry both; the default demo sensor is Mag 5 (reliable hold) and Mag 4 is the "hard case" where denoiser differences are compared. D-02 is superseded accordingly (Mag 4 is no longer the single primary).
- D-18: The navigator (a) skips fixes whose normalized correlation is below 0.85 and coasts on the INS estimate instead, and (b) centres the 3 km search box on the last accepted fix plus INS movement since then, not on raw dead reckoning. D-14/D-15 are amended accordingly.

### Post-execution amendment (D-19, accepted by the builder 2026-10-10 after 02-02 results)
- D-19: The Tolles-Lawson fluxgate is selected PER SENSOR among flux_a, flux_b, flux_c, flux_d using blocked cross-validation on the calibration line 1006.08 ONLY (no held-out data is consulted); lambda is selected the same way. The chosen fluxgate and CV score are recorded in the artifact provenance and the README. Held-out results are reported as they come out; no further tuning. Rationale: 02-02 found flux_a vs flux_d changes which sensor/line combinations hold, and the only defensible selection is one made on calibration data.

### Claude's Discretion
Everything not listed above: module layout inside `magnav/` (e.g. `magnav.data`, `magnav.classical`, `magnav.nav`, `magnav.metrics`, `magnav.artifact`), exact ridge/KRR hyperparameter search, figure styling in `main.py`, test structure, and whether KRR is scikit-learn (with `scikit-learn` added to requirements.txt) or a numpy implementation.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `magnav/api.py`: JSON-returning API pattern, `backend_info`, single-circuit `run_bell_batch`, `_failure` helper, IonQ detection (`is_ionq`). The quantum-slot stub should follow this JSON/`backend` convention.
- `scripts/package_qollab.sh`: allowlist packaging with limits and secret scan; `data/` files must be added to its explicit list.
- `tests/`: pytest layout, one-job spy test, compliance and Qollab contract tests (`tests/test_qollab_contract.py` has the 2 MB and requirements allowlist checks to extend).
- `main.py`: Python-project fallback entry; Phase 2 turns it into the one-command pipeline runner that prints metrics and saves figures.

### Established Patterns
- Python functions accept `backend` as an argument; never construct providers or simulators in shipped code.
- Literal path strings for data files; no f-string paths.
- Conventional commits with Co-Authored-By trailer; `uv run pytest -q` and `uv run ruff check` gate every commit.

### Integration Points
- `data/` folder (shipped to Qollab) vs `data_raw/` (gitignored, local only, ~1.4 GB).
- `requirements.txt` (Pyodide packages) — add `scikit-learn` if used.
- Phase 3 reads `data/precomputed_run.json` (RunArtifact v1); Phase 4 replaces the quantum stub.

</code_context>

<specifics>
## Specific Ideas

- Raw data verified on 2026-10-10 01:20 PDT: Flt1003/1006/1007 sizes match the Zenodo record; lines 1006.08, 1003.02, 1007.06 present; Eastern_395 (6238x4881, std 356 nT) and Renfrew_395 (3331x3841, std 199 nT) open with keys alt/border/info/map/mask/xx/yy.
- Run h5py via `uv run --with h5py` (not a project dependency) or add it to a `[dependency-groups] dev` group; it must never be imported by `magnav/`.
- Cite the dataset per PROJECT.md: USAF Cooperative Agreement FA8750-19-2-1000, Gnadt et al. arXiv:2007.12158, MagNav.jl maps.

</specifics>

<deferred>
## Deferred Ideas

- EMAG2v3 coarse-map comparison (offered, not selected; stays optional in Phase 5/6 docs).
- Particle-filter navigator (NAVX-03 stretch).
- Cabin-sensor and training-size sweeps (Phase 5).

</deferred>

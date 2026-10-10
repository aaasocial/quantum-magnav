# Quantum MagNav: GPS-denied drone navigation with a quantum-assisted magnetic denoiser

This effort is supported by Qollab & IonQ.

**Theme:** Quantum Impact · **License:** MIT (see LICENSE) · **Hackathon:** Qollab × IonQ Hackathon, Oct 9–11, 2026

> Status: Phase 1 smoke test. The Python API builds Bell circuits (alternating Φ+ and Ψ+), sends them to the injected backend in one `backend.run` call and returns the counts as JSON.

Repository: https://github.com/aaasocial/quantum-magnav

Qollab project: https://qollab.xyz/u/eehhaa/quantum-magnav

## How to run on Qollab

1. Open the project on Qollab. Use **Chrome or Edge**: the runtime needs WebAssembly JSPI (Firefox 153+ also works; Safari is not supported).
2. Press **Run** and choose **IonQ Forte 1 (Remote simulator)**. The built-in simulator also works and is instant.
3. When the page shows the backend info, pick the number of circuits and shots, then press **Submit one job**. On IonQ Forte 1, choose **1** circuit: each IonQ job holds one Bell circuit, because Qollab's IonQ service accepts only single-circuit jobs and rejects a list of circuits with HTTP 400. The built-in simulator accepts lists (2, 32, 64 or 128 circuits).
4. The page shows the counts for each Bell circuit and the raw result JSON. IonQ allows one job per run, so the button locks after the first IonQ job. Press **Stop** and **Run** again to submit another.

## Build the Qollab upload

```bash
bash scripts/package_qollab.sh
```

This builds `main.js` and `main.css` from `web/`, then writes `dist/qollab-upload.zip` (the JS project to upload) and `dist/qollab-fallback-py.zip` (a Python-project fallback that runs `main.py`). The script zips an explicit list of runtime files only and checks Qollab's limits (at most 100 files, each under 2 MB, README under 65,000 characters, no `node_modules`, `.env`, `__pycache__` or `.DS_Store`).

## How to run locally

```bash
uv sync
uv run pytest
uv run python main.py
```

`main.py` uses Qiskit's `BasicSimulator` locally. On Qollab the platform injects `backend`.

## Data and reproduction

**Data citation.** Flight data: the SGL 2020 MagNav Challenge dataset, collected by Sander Geophysics Ltd. under USAF Cooperative Agreement FA8750-19-2-1000 and described in Gnadt et al., "Signal Enhancement for Magnetic Navigation Challenge Problem", arXiv:2007.12158. Magnetic anomaly maps: the Ottawa-area maps (Eastern_395, Renfrew_395) distributed with MagNav.jl (MIT Lincoln Laboratory).

**What ships.** Only cropped, decimated excerpts are in `data/`: three flight lines decimated from 10 Hz to 2 Hz (block mean of 5) and two map tiles cropped to each line's area plus 5 km and downsampled 4x. Each file is under 2 MB. The raw HDF5 files stay local (`data_raw/`, git-ignored), in line with the dataset's data-sharing agreement. `data/provenance.json` records the source file, SHA-256 hash and time range of every excerpt.

**Reproduce.**

```bash
uv run --with h5py python -I scripts/preprocess_sgl.py   # only with the raw HDF5 files in data_raw/
uv run python main.py                                     # about 3 minutes
```

`main.py` fits every denoiser on calibration line 1006.08 only. It then jams GPS 25% of the way into each held-out line (1003.02 and 1007.06) and navigates magnetic-only with TERCOM: a 60 s window, a 3 km search box, and a 0.85 correlation gate. It prints the metrics table for both cabin sensors, then the acceptance checks. It writes `data/precomputed_run.json`, the replay file used by the web page and the Qollab fallback, and the figures below. The headline threshold is 556 m (0.3 nmi, the RNP-style figure AQNav quotes); 1 nmi and 2 nmi are also reported. Mag 5 (`mag_5_uc`) is the default demo sensor. Mag 4 (`mag_4_uc`) is the hard case, where the denoisers differ most.

Figures:
- [Tracks on line 1003.02](results/nav_1003_02.png)
- [Tracks on line 1007.06](results/nav_1007_06.png)
- [Mag 4 signal vs truth after the jam, line 1003.02](results/signal_1003_02_mag4.png)
- [Position error vs time after the jam](results/error_vs_time.png)

## Method notes

**Tolles-Lawson fluxgate and ridge lambda (decision D-19).** The aircraft carries four vector fluxgates (`flux_a` to `flux_d`). For each cabin sensor, the pipeline picks the fluxgate used by Tolles-Lawson, and the ridge lambda, jointly. It uses 5-fold blocked cross-validation (5 contiguous time blocks) on the calibration line 1006.08 only. The score is the full-band out-of-block RMSE of the compensated cabin magnetometer against the compensated reference `mag_1_c`, with the calibration offset fitted on the training blocks. The held-out lines 1003.02 and 1007.06 are never consulted. The chosen fluxgate also drives TL+currents (whose lambda is chosen by the same CV with that fluxgate fixed) and the 22 KRR/quantum features for that sensor. The choice is printed by `main.py` and stored in the run artifact's provenance (`provenance.tl`).

| Sensor | Fluxgate | Lambda | CV RMSE on 1006.08 | TL+currents lambda |
|---|---|---|---|---|
| Mag 5 (`mag_5_uc`) | flux_a | 0.1 | 18.3 nT | 1e-4 |
| Mag 4 (`mag_4_uc`) | flux_a | 0.01 | 86.8 nT | 1e-4 |

## Originality

All code in this repository was written during the hackathon build window, starting Oct 9, 2026, 4:00 PM PDT. No pre-existing code, coursework or templates were reused.

## AI tools and libraries used

**AI tools:** Claude Code (Anthropic) was the coding agent. Models: Claude Fable 5.1, Claude Opus 5.5 and Claude Sonnet 5.5 (Anthropic), via Claude Code, with the GSD workflow framework (MIT). Claude Fable 5.1 ran the orchestrating session, Claude Opus 5.5 ran the planning, research and execution subagents, and Claude Sonnet 5.5 ran the synthesizer and plan checker. They were used for planning, research and code generation. All output was reviewed by the author.

**Libraries (all used under their open-source licenses, which permit this use):**

| Library | License | Use |
|---|---|---|
| Qiskit | Apache-2.0 | Circuits, transpilation, backend jobs |
| qiskit-aer (local dev only) | Apache-2.0 | Local simulation and tests |
| qiskit-ionq (local dev only; Qollab provides the IonQ backend) | Apache-2.0 | Backend inspection |
| NumPy | BSD-3-Clause | Numerics |
| SciPy | BSD-3-Clause | Signal processing and optimization (later phases) |
| scikit-learn | BSD-3-Clause | Ridge and kernel ridge baselines (later phases) |
| Matplotlib | Matplotlib License (PSF-based) | Figures |
| React and React DOM | MIT | UI |
| Vite and @vitejs/plugin-react | MIT | Build |
| recharts (added in Phase 3) | MIT | Charts |
| pytest | MIT | Tests |
| Ruff | MIT | Linting |
| uv | MIT OR Apache-2.0 | Python environment management |
| Pyodide (provided by the Qollab runtime) | MPL-2.0 | In-browser Python |

**Templates / outside code:** none; Qollab docs examples consulted for API usage only.

The author confirms they are licensed to use all of the above.

# Phase 3: Frontend Vertical Slice - Context

**Gathered:** 2026-10-10
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous); 4 grey areas, all accepted by the builder

<domain>
## Phase Boundary

A judge opening the Qollab project sees the drone icon hold its position after GPS is jammed, with the denoising evidence beside it, and the demo never breaks because a failed live run falls back to the precomputed replay. Delivers the React player for `data/precomputed_run.json` (RunArtifact v1): control bar, canvas map view with heatmap and tracks, recharts signal panel with residual subplot, status strip with mode badge and metrics mini-table, in-page "Run live" for one line × one sensor via `magnav.api` with automatic fallback, keyboard operability, aria-live announcements, colour-independent encoding, reduced-motion behaviour, and text/table alternatives. Requirements: UI-01, UI-02, UI-03, UI-05, A11Y-01, A11Y-02. Out of scope: the benchmark views and dual-drone race (Phase 5), the real quantum denoiser (Phase 4), publishing (gated; builder approval required per CLAUDE.md).

Artifact facts (verified 2026-10-10): top-level keys `schema_version, title, sensors, default_sensor ("mag_5_uc"), denoisers, thresholds_m, provenance, lines, metrics_table, acceptance`; each of the 2 `lines` entries has `line, map_file, frame {lat0, lon0, R_m}, map_preview {nx, ny, block, x_min..y_max, nT[], valid[]}, jam {index, t_s, display_index}, metric_start_index, t[1264], truth {x, y, anomaly_nT}, dead_reckoning {x, y}, estimates {<sensor>: {<denoiser>: {x, y, signal_nT, window_t, ncc, accepted}}}`. Denoisers: raw, lowpass, tl, tl_currents, krr, quantum (stub = tl). File is ~1.03 MB. Qollab facts: page runs in a sandboxed iframe on Qollab's dark UI; Python via Pyodide; one `backend.run` per Run on IonQ (not used in Phase 3); 2 MB per file; `main.js` must stay a single ES module importing `magnav.api` with no exports (`build.target esnext`).

</domain>

<decisions>
## Implementation Decisions

### Layout and flow (D-01..D-04)
- D-01: Single page inside Qollab's iframe. Control bar at top: line selector (1003.02 / 1007.06), sensor selector (Mag 5 default, Mag 4 labelled "hard case"), denoiser toggles (truth always on; raw, lowpass, tl, tl_currents, krr, quantum), play/pause, scrub slider, speed selector.
- D-02: Map view on the left: canvas heatmap rendered from `map_preview` (cividis), invalid cells hatched grey, truth track solid, estimate dashed, dead reckoning dotted, drone icon at the current index, GPS-jammed marker at `jam.display_index`, live position-error readout (metres) for the selected denoiser.
- D-03: Signal panel on the right (stacks below on narrow widths): truth anomaly vs raw / TL / KRR / quantum traces with per-series RMSE badges (computed over the magnetic-only segment from `metric_start_index`) and a residual subplot (series minus truth).
- D-04: Status strip: mode badge ("precomputed replay" / "computed in-page"), provenance line (dataset, code_version, seed), and a metrics mini-table for the selected line/sensor (mean error, CEP50/95, % under 556 m) from `metrics_table`.

### Visual language (D-05..D-08)
- D-05: Dark theme matching Qollab's page; explicit background colour; CSS variables for all colours.
- D-06: Okabe-Ito colour-blind-safe palette; meaning is always doubled by line style (truth solid, estimates dashed, DR dotted) and by marker shape for points.
- D-07: cividis colormap for the anomaly heatmap; legend with nT scale; invalid cells hatched grey with a legend entry.
- D-08: System font stack, minimal chrome, data first; the GPS-jam moment is highlighted with a vertical marker on the signal panel, a map marker, and a one-line banner ("GPS jammed at t = X s — magnetic-only from here").

### Charting and playback (D-09..D-12)
- D-09: Map = HTML canvas + SVG overlay (no map library). Signal panel = recharts 3.10.x (exact pin) with the artifact's 1264-point series (already ≤ 1500 points).
- D-10: Playback default 60× real time (10×/60×/300× options); the current index advances with `requestAnimationFrame` from `t[]`.
- D-11: Keyboard: Space play/pause, ArrowLeft/ArrowRight step one navigator window, Home/End jump, all controls tabbable with visible focus; selects and toggles are native elements with labels.
- D-12: With `prefers-reduced-motion`, animation becomes stepped (one update per second of wall time); aria-live (polite) announces jam, mode changes and a throttled (every 10 s) error readout.

### Live mode and fallback (D-13..D-16)
- D-13: The page always opens on `data/precomputed_run.json` first (fetched via the Pyodide bridge or a literal-path Python loader), so the hold is visible within seconds.
- D-14: "Run live" computes ONE line × ONE sensor in-page through `magnav.api` (new function, e.g. `run_line(backend, line, sensor)` returning the same per-line JSON shape as an artifact `lines[i]` entry restricted to the chosen sensor, with denoisers raw, lowpass, tl, quantum-stub; KRR skipped for time), with a progress indicator fed by staged status messages.
- D-15: On any exception or a 90 s timeout, the page switches automatically to the precomputed data for that line/sensor with identical visuals and the "precomputed replay" badge; the failure reason is shown in the status strip and logged.
- D-16: Phase 3 never calls `backend.run`; the quantum row remains the stub (identical to TL) and is labelled "quantum slot (stub until Phase 4)".

### Claude's Discretion
Component split (e.g. `ControlBar`, `MapView`, `SignalPanel`, `StatusStrip`, `usePlayback`), the dev-stub extension for the new API function, exact canvas scaling, chart text-alternative format (a hidden table or a toggle), and the exact aria-live wording.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `web/src/bridge.js` (`callPy`, `qBackend` guard), `web/src/dev/magnavApiStub.js`, `web/src/App.jsx` smoke page (backend badge, aria-live status, lock logic), `web/src/app.css` (focus-visible styles), `web/vite.config.js` (lib mode, external magnav.*, esnext).
- `magnav/api.py` JSON conventions and `_failure`; `magnav/pipeline.py` `run_pipeline`; `magnav/artifact.py` builders/validators (reuse to build the per-line JSON for live mode); `magnav/data.py` literal-path loaders.
- Tests: `tests/test_qollab_contract.py` (bundle contract, 2 MB, rebuild check), `tests/test_artifact.py`.

### Established Patterns
- One `main.js` ES module, zero exports, imports `magnav.api`; `callPromising` for every Python call; `runDone` keep-alive promise pattern; literal data paths; `allow_pickle=False`.
- Accessibility baseline from Phase 1 (aria-live, labels, focus-visible).

### Integration Points
- `data/precomputed_run.json` (Phase 2 output, regenerated by `main.py`), `scripts/package_qollab.sh` allowlist, `requirements.txt` (no new Python packages expected), `web/package.json` (add recharts 3.10.x exact).

</code_context>

<specifics>
## Specific Ideas

- The smoke-test page from Phase 1 is replaced by the player; keep the attribution footer and theme line.
- Default view on load: line 1003.02, sensor Mag 5, denoisers truth + raw + tl visible, playback paused at index 0 with a "Press play" hint; the metrics mini-table already filled.
- The Mag 4 / 1007.06 partial result is shown as-is (builder decision 2026-10-10): no hiding.

</specifics>

<deferred>
## Deferred Ideas

- Dual-drone race view, particle cloud, benchmark sweeps (Phase 5 / NAVX-03).
- Publishing a new Qollab version (requires explicit builder approval; not part of this phase's executor tasks).

</deferred>

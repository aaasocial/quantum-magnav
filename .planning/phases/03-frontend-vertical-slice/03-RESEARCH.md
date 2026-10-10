# Phase 3: Frontend Vertical Slice - Research

**Researched:** 2026-10-10
**Domain:** React 19 single-file ES bundle in Qollab's sandboxed iframe: canvas heatmap, recharts signal panel, rAF playback, Pyodide bridge for in-page live compute with fallback, WCAG-oriented accessibility
**Confidence:** HIGH for bundle/contract, artifact shape, recharts behaviour, and CPython timings (measured this session). MEDIUM for Pyodide runtime behaviour (main thread vs worker, speed ratio, injected `setTimeout`, iframe height), which only a Qollab run can settle. Each of these has a probe and a defensive design below.

## Summary

The artifact, the bundle contract, and the chart library all check out. `recharts@3.10.1` renders under React 19.3.0 in real Chrome (headless DOM dump this session). In the project's Vite 8 lib-mode build it takes `main.js` from 304,935 B to 810,193 B raw (78 kB to 200 kB gzip), with no `export` statements and no XHR, Worker, or localStorage use. That leaves about 1.2 MB of headroom under the 2 MB file cap. `d3-scale-chromatic@3.1.0` (`interpolateCividis`, chosen in the UI-SPEC) adds about 0.8 kB. Its cividis is a polynomial that differs from matplotlib's table by at most 19/255, which is fine for a heatmap. JS cannot `fetch` project files on Qollab. The docs say so directly ("`fetch("data.csv")` does not reach them"), so the artifact has to come through Python: return the file text as-is from a `magnav.api` function. `JSON.parse` of the 1.03 MB artifact takes 4 ms in Node 24.

Live mode is the main risk. Measured in CPython this session, TERCOM costs about 18-20 ms per window, and 92% of that is `MapTile.sample` (numpy gather plus elementwise work, single-threaded, so BLAS does not matter). That works out to 5.5 s per denoiser for 1003.02 (278 windows) and 7.7 s for 1007.06 (388 windows). Pyodide is 1-5x slower than native, depending on the benchmark. The full D-14 set is raw, lowpass, tl, and quantum. The quantum stub produces exactly TL's output, so its result can be reused instead of recomputed. Even so, the set runs to about 25-66 s (1003.02) or 35-92 s (1007.06) in Pyodide, which can exceed the 90 s budget. One `callPromising(run_line)` call would also freeze the page for the whole run if Pyodide shares the page's main thread, which is likely: workers are blocked and JSPI is required. `Promise.race` cannot stop a running Python call either. **Recommendation:** use a chunked, generator-driven live API (`live_start` → repeated `live_step(budget_ms)` → `live_result`), with one Python call in flight at a time. This keeps the UI responsive between ~250 ms chunks, gives real per-window progress, and lets JS enforce the 90 s deadline between chunks. Compute in this order: tl, then raw, then lowpass only if the projected time fits. Quantum is copied from TL.

Accessibility needs one non-obvious fix. recharts 3 defaults to `accessibilityLayer=true`, which makes each chart SVG `role="application" tabindex="0"` (verified in the DOM dump). That adds two tab stops per chart where arrow keys move a tooltip through 1264 points, and it clashes with the D-11 Arrow/Space shortcuts. Set `accessibilityLayer={false}` and carry the semantics in the `<figure>`/`<figcaption>` plus the `<details>` data tables from the UI-SPEC. The second performance fix: never re-render the recharts trees at 60 Hz. The playhead has to be its own subscriber (an external store plus a custom child that uses recharts 3's `useXAxisScale`/`usePlotArea` hooks), not a `ReferenceLine` prop driven from App state.

**Primary recommendation:** Build three slices. (1) A Python live API: a `tercom_steps` generator, `magnav/live.py`, the `api.artifact_json`/`live_*` functions, and an extracted `artifact.line_entry`. (2) The JS player core: a serialized bridge, the artifact loader and validator, a playback store, MapView, controls, and status. (3) The SignalPanel, accessibility, the live/fallback UI, the contract tests, and a human Qollab check that records four runtime probes. Pin `recharts@3.10.1`, `react-is@19.3.0`, and `d3-scale-chromatic@3.1.0` exactly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Layout and flow (D-01..D-04)
- D-01: Single page inside Qollab's iframe. Control bar at top: line selector (1003.02 / 1007.06), sensor selector (Mag 5 default, Mag 4 labelled "hard case"), denoiser toggles (truth always on; raw, lowpass, tl, tl_currents, krr, quantum), play/pause, scrub slider, speed selector.
- D-02: Map view on the left: canvas heatmap rendered from `map_preview` (cividis), invalid cells hatched grey, truth track solid, estimate dashed, dead reckoning dotted, drone icon at the current index, GPS-jammed marker at `jam.display_index`, live position-error readout (metres) for the selected denoiser.
- D-03: Signal panel on the right (stacks below on narrow widths): truth anomaly vs raw / TL / KRR / quantum traces with per-series RMSE badges (computed over the magnetic-only segment from `metric_start_index`) and a residual subplot (series minus truth).
- D-04: Status strip: mode badge ("precomputed replay" / "computed in-page"), provenance line (dataset, code_version, seed), and a metrics mini-table for the selected line/sensor (mean error, CEP50/95, % under 556 m) from `metrics_table`.

#### Visual language (D-05..D-08)
- D-05: Dark theme matching Qollab's page; explicit background colour; CSS variables for all colours.
- D-06: Okabe-Ito colour-blind-safe palette; meaning is always doubled by line style (truth solid, estimates dashed, DR dotted) and by marker shape for points.
- D-07: cividis colormap for the anomaly heatmap; legend with nT scale; invalid cells hatched grey with a legend entry.
- D-08: System font stack, minimal chrome, data first; the GPS-jam moment is highlighted with a vertical marker on the signal panel, a map marker, and a one-line banner ("GPS jammed at t = X s — magnetic-only from here").

#### Charting and playback (D-09..D-12)
- D-09: Map = HTML canvas + SVG overlay (no map library). Signal panel = recharts 3.10.x (exact pin) with the artifact's 1264-point series (already ≤ 1500 points).
- D-10: Playback default 60× real time (10×/60×/300× options); the current index advances with `requestAnimationFrame` from `t[]`.
- D-11: Keyboard: Space play/pause, ArrowLeft/ArrowRight step one navigator window, Home/End jump, all controls tabbable with visible focus; selects and toggles are native elements with labels.
- D-12: With `prefers-reduced-motion`, animation becomes stepped (one update per second of wall time); aria-live (polite) announces jam, mode changes and a throttled (every 10 s) error readout.

#### Live mode and fallback (D-13..D-16)
- D-13: The page always opens on `data/precomputed_run.json` first (fetched via the Pyodide bridge or a literal-path Python loader), so the hold is visible within seconds.
- D-14: "Run live" computes ONE line × ONE sensor in-page through `magnav.api` (new function, e.g. `run_line(backend, line, sensor)` returning the same per-line JSON shape as an artifact `lines[i]` entry restricted to the chosen sensor, with denoisers raw, lowpass, tl, quantum-stub; KRR skipped for time), with a progress indicator fed by staged status messages.
- D-15: On any exception or a 90 s timeout, the page switches automatically to the precomputed data for that line/sensor with identical visuals and the "precomputed replay" badge; the failure reason is shown in the status strip and logged.
- D-16: Phase 3 never calls `backend.run`; the quantum row remains the stub (identical to TL) and is labelled "quantum slot (stub until Phase 4)".

### Claude's Discretion
Component split (e.g. `ControlBar`, `MapView`, `SignalPanel`, `StatusStrip`, `usePlayback`), the dev-stub extension for the new API function, exact canvas scaling, chart text-alternative format (a hidden table or a toggle), and the exact aria-live wording.

### Deferred Ideas (OUT OF SCOPE)
- Dual-drone race view, particle cloud, benchmark sweeps (Phase 5 / NAVX-03).
- Publishing a new Qollab version (requires explicit builder approval; not part of this phase's executor tasks).

### Approved UI design contract
`.planning/phases/03-frontend-vertical-slice/03-UI-SPEC.md` (status: approved) fixes the colours, dash patterns, copy, layout, component inventory, keyboard map and aria-live phrasing. This research does not override it. It adds technical constraints the UI-SPEC did not cover. Where an implementation detail differs, it is flagged below:
- the playhead is implemented as a custom recharts child, not a `ReferenceLine` re-rendered from App state;
- `accessibilityLayer={false}`;
- `useLiveRun` drives the chunked `live_*` API, and its "Step n of 4" stages map onto it one-to-one.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | One frame player plays a single RunArtifact JSON, whether computed in-page or loaded from `data/precomputed_run.json` | `api.artifact_json` returns the file text as-is (§Pattern 2). The live API returns the same `lines[i]` shape through an extracted `artifact.line_entry` (§Pattern 4). A JS validator normalizes both into one `LineData` view (§Pattern 3). |
| UI-02 | Map: real anomaly heatmap with invalid cells marked, true path (solid), estimate (dashed), DR path, drone icon, jam marker, live error readout | Canvas heatmap via ImageData plus a hatch pattern, DPR scaling, world-to-pixel transform, and an SVG overlay with casing (§Pattern 6). Verified extents and cell sizes (§Artifact facts). |
| UI-03 | Signal panel: truth, raw, TL, KRR, quantum traces with toggles, RMSE badge per series, residual subplot | recharts config (§Pattern 7). RMSE from `lines[i].metrics[sensor][denoiser].signal_rmse_nT`, which is exactly the residual plotted (§Artifact facts). Two charts with a fixed YAxis width share the x domain. |
| UI-05 | Live mode computes a held-out line in-page and animates it; on failure, automatic fallback with identical visuals and a badge | Chunked live API, deadline between chunks, fallback state machine (§Pattern 4/5). Measured CPython cost and projected Pyodide cost (§Live-mode budget). A forced-failure switch makes the fallback demonstrable on Qollab. |
| A11Y-01 | Keyboard-operable controls with visible focus, aria-labels on charts and toggles, aria-live announcements | Native controls, a global key handler with target filtering, slider `onKeyDown` window stepping, `accessibilityLayer={false}` plus figure/figcaption, and a single throttled Announcer (§Pattern 8). |
| A11Y-02 | Colour never the only cue (palette plus dash patterns), reduced motion gives stepped updates, text/table alternative for each chart | UI-SPEC dash table, map casing contrast (computed), `matchMedia` stepped clock in the playback store, `<details>` tables (§Pattern 8). Node-testable checks (§Validation notes). |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Submission approval gate (hard rule):** no agent may submit to the hackathon, publish or republish a Qollab version, or post to organizer channels without the builder's explicit in-words approval in the current session. Any publish step must be a `checkpoint:human-action`, never an executor task. Allowed without asking: uploading files into the Qollab editor **without publishing**, building the zip, pushing to GitHub, and running simulator jobs.
- Frontend is JavaScript (React + Vite). Backend is Python. All quantum code goes through Qiskit. Phase 3 never calls `backend.run` (D-16).
- Accessibility best practices are an explicit submission requirement.
- Demo reliability: the live path must have the precomputed fallback.
- Licensing: MIT, the attribution line ("This effort is supported by Qollab & IonQ."), and disclosure of **all** libraries. New npm dependencies must be added to the README library table (see §Compliance).
- Originality: all code is written in the build window.
- Qollab rules (STACK.md / QOLLAB_FINDINGS.md): one `main.js` ES module whose first line is `import * as … from "magnav.api"`, with zero exports; `main.css` is the only stylesheet; `index.html` is body-only; Python calls only via `callPromising`; literal data paths; `allow_pickle=False`; 2 MB per file; no XHR, WebSocket, POST, workers, or storage.
- GSD workflow: file changes go through GSD commands. Tests use pytest (`.venv`, Python 3.13 locally). Bundle freshness is enforced by `tests/test_qollab_contract.py::test_committed_bundle_matches_fresh_build`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Read `data/precomputed_run.json` | Pyodide (Python, in-memory FS) | Browser JS (parse and validate) | JS cannot fetch project files on Qollab [CITED: qollab.xyz/learn/docs/runtime-environment] |
| Live compute (TL fit, DR, TERCOM, metrics) | Pyodide (`magnav/live.py`, `magnav/nav.py`) | Browser JS (drives chunks, deadline) | Pipeline is Python. JS orchestrates so the UI never hangs on one long call |
| Artifact/line validation and normalization | Browser JS (`web/src/lib/artifact.js`) | Python `validate_artifact` (tests only) | Validating in JS avoids a Python dumps/loads round trip on load |
| Playback clock, index, reduced motion | Browser JS (external store + rAF) | — | Pure presentation timing |
| Heatmap raster | Browser canvas 2D | — | 12.5k-21.7k cells; ImageData plus one scaled `drawImage` |
| Tracks, drone, jam marker | Browser SVG overlay | — | Cheap per-frame updates, crisp at any DPR |
| Signal and residual charts | Browser (recharts SVG) | — | D-09 |
| Metrics, RMSE values | Python (precomputed or live) | Browser displays only | UI-SPEC: the UI never recomputes metrics, so live and precomputed numbers match |
| Keep-alive of the Qollab run | Browser JS (`runDone` in main.jsx) | — | Phase 1 Pattern 3 |

## Artifact facts (verified 2026-10-10 by loading `data/precomputed_run.json`)

| Fact | 1003.02 | 1007.06 |
|------|---------|---------|
| Display points (`t.length`) | **1264** | **1499** (not 1264; size all arrays from `t.length`) |
| `t` range / step | 0 … 3783.5 s, 3.0 s | 0 … 5239.5 s, 3.5 s |
| `jam` | index 1892 (raw), t_s 946.0, display_index 316 | index 2620, t_s 1310.0, display_index 375 |
| `metric_start_index` (raw samples, fs = 2 Hz) | 2012 → t = 1006 s | 2740 → t = 1370 s |
| Navigator windows (`window_t.length`) | 278 (first window_t 1005.5, stride 10 s) | 388 (first 1369.5) |
| `map_preview` nx × ny, block | 107 × 117, 3 | 139 × 156, 4 |
| extent x_min..x_max / y_min..y_max (cell centres, m) | -19013..18775 / -20813..20575 | -32305..32072 / -36484..36484 |
| Cell size dx / dy | 356.5 / 356.8 m (isotropic) | 468.0 / 471.0 m |
| nT range (valid) | -835 … 2065 | -487 … 2857 |
| invalid cells | **0 of 12519** (no hatching visible on 1003.02) | 3561 of 21684 |
| Nulls | none in x/y/signal/ncc for any series | none |

- `map_preview.nT`/`valid` are row-major with **rows south to north** (row 0 = y_min). Canvas rows run top to bottom, so flip with `row_canvas = ny - 1 - j` [VERIFIED: magnav/artifact.py `map_preview`].
- `metric_start_index` and `jam.index` are **raw-sample** indices. Only `jam.display_index` is a display index. `metric_start_t = metric_start_index * jam.t_s / jam.index` (= idx / fs because `t[0] = 0`) [VERIFIED].
- `signal_nT` = cleaned − IGRF − diurnal and `truth.anomaly_nT` = mag_1_c − IGRF − diurnal, so the residual `signal_nT − anomaly_nT` is exactly `cleaned − mag_1_c`. That is the quantity behind `signal_rmse_nT` (full resolution, from `metric_start`). The RMSE badge and the residual chart therefore agree. Use the artifact value; do not recompute from the 3 s display samples [VERIFIED: magnav/nav.py `anomaly_signal`, magnav/metrics.py `signal_metrics`].
- `window_t` = t at the last sample of each window (relative seconds). Before the jam there are no windows. The UI-SPEC step rule is "10 s, nearest display index", which matches `provenance.tercom.stride_s = 10`.
- Values are ints when integral (`_num`/`_r(…,0)`). This makes no difference in JS (one number type), but tests comparing Python and JS must compare numerically.
- `ncc[i]` may be `null` (all candidates touched invalid cells), and then `accepted[i] == 0` (enforced by `validate_artifact`). The current artifact has no nulls, but the JS must still treat null as "no valid match".
- `quantum` estimates are bit-identical to `tl` (stub). The UI-SPEC draws quantum dotted on top of TL.

## Standard Stack

### Core (already in repo)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | 19.3.0 (exact) | UI | Existing; Phase 1 verified in the Qollab iframe |
| vite | 8.3.4 | Lib-mode single-file build | Existing tested config |
| @vitejs/plugin-react | 6.1.2 | JSX | Existing |

### Added in this phase
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | **3.10.1** (exact; latest, published 2026-07-25) | Signal and residual charts | D-09, locked. Peer: react ^19 and react-is ^19 [VERIFIED: npm registry] |
| react-is | **19.3.0** (exact, must equal the React version) | recharts peer dependency | Install explicitly so npm does not resolve a mismatched react-is [VERIFIED: npm registry] |
| d3-scale-chromatic | **3.1.0** (exact) | `interpolateCividis` for the heatmap LUT | UI-SPEC R-decision. +0.8 kB measured. Deps d3-color and d3-interpolate (ISC) |
| axe-core (devDependency) | **4.14.0** (exact) | Dev-only accessibility scan | `import.meta.env.DEV`-guarded dynamic import. Verified to be **eliminated from the build** (0 occurrences in `main.js`, no extra chunk) |

No new Python packages. scipy 1.18 and numpy 2.4.6 are already on Qollab (`backend_info`).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | Hand-rolled SVG `<polyline>` charts (≈0 kB) | Saves ~500 kB raw, but means re-implementing axes, ticks and tooltips. The bundle has 1.2 MB headroom, so there is no strong reason to deviate from D-09. |
| d3-scale-chromatic | Generated 256-entry matplotlib LUT (`scripts/gen_cividis_lut.py` → hex string, max error 0) | Exact matplotlib match, but adds a generator script. The polynomial error ≤19/255 (mean 2.65) is visually negligible. Follow the UI-SPEC. |
| Single `run_line` call | Chunked `live_start/step/result` | A single call is simpler but freezes the UI for 25-90 s if Pyodide is on the main thread, and it cannot be stopped at 90 s. Chunked is recommended; keep `run_line` as a Python convenience for tests. |

**Installation (exact pins, from `web/`):**
```bash
npm --prefix web install --save-exact recharts@3.10.1 react-is@19.3.0 d3-scale-chromatic@3.1.0
npm --prefix web install --save-dev --save-exact axe-core@4.14.0
```

**Version verification (this session):** `npm view recharts version` → 3.10.1 (latest; canary 3.11.0-canary.5 must not be used); react-is 19.3.0 (2026-09-09); d3-scale-chromatic 3.1.0; axe-core 4.14.0. Resolved transitive versions: @reduxjs/toolkit 2.13.0, react-redux 9.3.0, immer 11.1.21, victory-vendor 37.3.6, es-toolkit 1.52.0.

## Package Legitimacy Audit

slopcheck could not be installed in this environment (`pip install slopcheck` did not produce a `slopcheck` command), so per protocol every package below is tagged **[ASSUMED]** for legitimacy, even though registry data is strong.

| Package | Registry | Age | Downloads/wk | Source Repo | slopcheck | Disposition |
|---------|----------|-----|--------------|-------------|-----------|-------------|
| recharts | npm | created 2015-08 | 56.3M | github.com/recharts/recharts | unavailable [ASSUMED] | Approved (user-locked D-09); no install/postinstall scripts |
| react-is | npm | React monorepo | 368M | github.com/facebook/react | unavailable [ASSUMED] | Approved; no install scripts |
| d3-scale-chromatic | npm | d3 org, 3.1.0 from 2024-03 | 24.7M | github.com/d3/d3-scale-chromatic | unavailable [ASSUMED] | Approved (UI-SPEC); no install scripts |
| axe-core (dev) | npm | created 2015-06 | 78.2M | github.com/dequelabs/axe-core | unavailable [ASSUMED] | Approved dev-only; no install scripts; never bundled |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none. Because slopcheck was unavailable, the planner should add one `checkpoint:human-verify` before the `npm install` that confirms the four names and versions above. All four are long-established and very widely used, and recharts was chosen by the builder.

## Architecture Patterns

### System Architecture Diagram

```
 Qollab "Run" (backend injected) ──▶ main.js (ES module, top-level await runDone)
                                          │
                                          ▼
                              React App ── bridge.callPy (serialized queue: ONE Python call in flight)
                                │                    │
      ┌─────────────────────────┤                    ├──▶ api.artifact_json(backend) ──▶ reads data/precomputed_run.json (literal path, Pyodide MEMFS)
      │                         │                    │         returns '{"ok":true,"artifact":<file text>}' (string concat, no re-serialize)
      │                         │                    │
      │  [Run live] ────────────┤                    ├──▶ api.live_start(backend, line, sensor, fail) ─▶ live.py: load excerpts, select TL, fit raw/lowpass/tl/quantum, DR, build task list
      │                         │   loop until done  ├──▶ api.live_step(backend, budget_ms) ─▶ advance tercom_steps generators for ~budget_ms; return progress
      │                         │   or deadline 90 s │        (JS yields to event loop between chunks: paint + input)
      │                         │                    └──▶ api.live_result(backend) ─▶ artifact.line_entry(...) for ONE sensor ─▶ JSON
      │                         ▼
      │            validateLine() ──ok──▶ dataset = {mode:"computed in-page", line}
      │                 │fail/timeout/exception
      │                 └──────────────▶ dataset = precomputed line×sensor, mode "precomputed replay", danger notice + console.error
      ▼
 Playback store (t[], speed, playing, reducedMotion) ◀── rAF tick (stepped 1 Hz if reduced motion)
      │ index (useSyncExternalStore; only small subscribers re-render)
      ├──▶ MapView: canvas heatmap (static per line/resize) + SVG overlay (tracks sliced to index, drone, estimate, DR, jam marker) + ErrorReadout
      ├──▶ SignalPanel: memoized LineCharts (no index prop) + <Playhead/> child using useXAxisScale/usePlotArea
      ├──▶ ControlBar slider (aria-valuetext), JamBanner
      └──▶ Announcer (single polite region; throttled 10 s error readout)
```

### Recommended Project Structure
```
magnav/
├── nav.py          # + tercom_steps() generator; tercom() drains it (bit-identical output)
├── live.py         # NEW orchestrator (may touch Truth; NOT in the truth-guard list): start/step/result state machine
├── pipeline.py     # optional: extract per-line prep shared with live.py (keep run_pipeline output identical)
├── artifact.py     # + line_entry(line_id, L) extracted from build_run_artifact (byte-identical artifact)
└── api.py          # + artifact_json, live_start, live_step, live_result, live_cancel (all return JSON strings, never raise)
web/src/
├── main.jsx        # unchanged contract: render + `await runDone`; DEV-only axe import
├── bridge.js       # + serialized queue; callPy (JSON) and callPyText
├── App.jsx         # selection state, mode, wiring; owns runDone keep-alive
├── theme.js        # series colours/dashes/labels (UI-SPEC)
├── lib/            # PURE .js (no JSX) so `node --test` can import them
│   ├── artifact.js     # validateArtifact, validateLine, lineView(line, sensor), metricStartT, windowStepIndex
│   ├── playback.js     # createPlaybackStore (clock, speed, stepped mode), indexAtTime (binary search)
│   ├── geo.js          # mapGeometry(preview, cssW) -> {toPx, cell rects, aspect}
│   ├── colormap.js     # buildCividisLut() -> Uint8ClampedArray(768); percentileDomain()
│   ├── announce.js     # throttle helper for the Announcer
│   └── *.test.js       # node:test unit tests
├── hooks/useArtifact.js, useLiveRun.js, usePlayback.js, useReducedMotion.js
├── components/ControlBar.jsx, StatusStrip.jsx, JamBanner.jsx, MapView.jsx, SignalPanel.jsx, MetricsTable.jsx, TextAlternatives.jsx, Announcer.jsx
└── dev/magnavApiStub.js   # + artifact_json (real file via ?raw), live_* simulation, forced failure
```

### Pattern 1: Serialized Python bridge (one call in flight)
**What:** All `callPromising` calls go through one promise chain.
**Why:** The Pyodide docs do not say what happens if a second `callPromising` enters the interpreter while another is suspended (JSPI) or running [CITED: pyodide.org js-api `callPromising` "Experimental"; behaviour while suspended not documented]. Polling a progress function in parallel would be undefined behaviour, so do not do it.
```js
// web/src/bridge.js
import * as api from 'magnav.api';
export const qBackend = typeof backend !== 'undefined' ? backend : (globalThis.backend ?? null);
let chain = Promise.resolve();
function enqueue(fn) { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; }
export function callPyText(name, ...args) {
  return enqueue(async () => {
    const fn = api[name];
    if (!fn) throw new Error(`magnav.api.${name} not found`);
    return String(await fn.callPromising(qBackend, ...args)); // Python str -> JS string (implicit); never .toJs() a string
  });
}
export async function callPy(name, ...args) { return JSON.parse(await callPyText(name, ...args)); }
```

### Pattern 2: Artifact via Python, returned as text
```python
# magnav/api.py
from magnav.artifact import ARTIFACT_PATH  # literal "data/precomputed_run.json" lives in artifact.py

def artifact_json(backend) -> str:
    """Precomputed RunArtifact as JSON text. Never raises; no re-serialization (1 MB)."""
    try:
        with open(ARTIFACT_PATH, encoding="utf-8") as f:
            text = f.read()
        return '{"ok":true,"artifact":' + text.strip() + "}"
    except Exception as e:  # noqa: BLE001
        return json.dumps({"ok": False, "error_type": type(e).__name__, "error": str(e)[:2000]})
```
Qollab preloads a data file only if its literal path appears in the Python code. `ARTIFACT_PATH = "data/precomputed_run.json"` is already a literal in `magnav/artifact.py`, and Phase 2's `main.py` replay relies on the same literal. Keep `open(ARTIFACT_PATH)` (a constant name, not an f-string). Cost: the file read is in-memory, the str→JS string conversion is about 1 MB of UTF-16, and `JSON.parse` is 4 ms (measured in Node 24). The total should be well under 0.5 s [ASSUMED for the Pyodide part].

### Pattern 3: One normalized line view for both sources (UI-01)
`lineView(line, sensor)` → `{t, jamIdx, jamT, metricStartT, metricStartIdx, truth, dr, est: {den: {x,y,signal,residual,windowT,ncc,accepted}}, metrics, preview, frame, available: Set<denoiser>}`. Precomputed: `artifact.lines.find(l => l.line === id)` restricted to `sensor`. Live: the `live_result` entry (same keys, one sensor, denoisers `tl, raw, quantum[, lowpass]`). Missing denoisers become disabled checkboxes (UI-SPEC copy). Validate before use: `schema_version === 1`, `t.length` equals every series length, `jam.display_index < t.length`, and the `window_t`/`ncc`/`accepted` lengths agree. On a validation failure in live mode, apply the D-15 fallback.

### Pattern 4: Chunked live compute (D-14/D-15)
**Python: make TERCOM resumable without changing its output.**
```python
# magnav/nav.py: move the body of tercom() into a generator; yield once per window.
def tercom_steps(signal, dr, jam_idx, fix_xy, tile, window=120, stride=20, half_width_m=1500.0,
                 step_m=60.0, gate=0.85, median=3):
    ...identical setup...
    while e <= n:
        ...identical per-window body...
        e += stride
        yield len(ends)                       # windows done so far
    ...identical post-processing...
    return NavResult(...)

def tercom(*args, **kwargs) -> NavResult:
    gen = tercom_steps(*args, **kwargs)
    while True:
        try:
            next(gen)
        except StopIteration as stop:
            return stop.value
```
```python
# magnav/live.py (orchestrator; module-level state persists across callPromising calls in one run)
_STATE: dict = {}
LIVE_ORDER = ("tl", "raw", "lowpass")    # quantum is copied from tl while the slot is the stub

def start(line_id, sensor, simulate_failure=False): ...   # validate against HELD_OUT / SENSORS allowlists,
    # load cal + line + map (literal constants), select_tl_config(sensor), build + fit raw/lowpass/tl/quantum,
    # jam, DR (line_seed), cleaned signals, create one tercom_steps generator per LIVE_ORDER entry,
    # total_windows; record t0. simulate_failure -> raise RuntimeError("Simulated failure (demo of fallback)") in step 1.
def step(budget_ms=250) -> dict:  # advance generators until budget spent; returns
    # {"ok":True,"stage":3,"denoiser":"raw","windows_done":k,"windows_total":K,"elapsed_s":..,"done":bool}
def result() -> dict:  # quantum := tl result IF np.array_equal(cleaned_quantum, cleaned_tl) (stub) else compute;
    # assemble L like run_pipeline's out_lines entry for ONE sensor, then artifact.line_entry(line_id, L)
def skip(denoiser): ...  # JS may drop "lowpass" if the projected time exceeds the budget
```
Make every `api.live_*` wrapper return `json.dumps(..., allow_nan=False)` and catch everything into `{"ok": false, "stage": n, "error_type", "error"}`.

**Equivalence guarantee:** the live path uses the same seed (`line_seed`), the same `select_tl_config`, the same `TERCOM_PARAMS`/`DR_PARAMS`, and the same `line_entry` rounding, so a live `tl` estimate must equal the precomputed one exactly. That makes a strong pytest check, and it lets "identical visuals" in D-15 hold by construction.

**JS driver:**
```js
// web/src/hooks/useLiveRun.js (core loop)
const yieldToBrowser = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });
const DEADLINE_MS = 90_000;
async function runLive(line, sensor, simulateFailure, onStage) {
  const t0 = performance.now();
  const check = (res) => { if (!res.ok) throw Object.assign(new Error(res.error), { name: res.error_type ?? 'Error' }); return res; };
  onStage(1); check(await callPy('live_start', line, sensor, simulateFailure));
  let p;
  do {
    if (performance.now() - t0 > DEADLINE_MS) throw Object.assign(new Error('timeout'), { name: 'Timeout' });
    p = check(await callPy('live_step', 250));
    onStage(p.stage, p);                               // stage 2/3 + windows_done/windows_total
    // Adaptive: after tl finishes, project remaining time; drop lowpass if it would cross ~80 s.
    await yieldToBrowser();                            // paint + input between chunks
  } while (!p.done);
  onStage(4); const res = check(await callPy('live_result'));
  return validateLine(res.line);                        // throws on shape mismatch -> fallback
}
```
Use MessageChannel for the yield, not rAF or `setTimeout`. rAF stops when the sandboxed (cross-origin) iframe is scrolled out of view, which would stall the compute. The `setTimeout` in a Qollab JS project is "injected" and "returns a promise" (§Pitfall 5). React's scheduler already depends on MessageChannel, and that worked in Phase 1.

### Pattern 5: Fallback state machine (D-15)
`mode: 'precomputed' | 'computing' | 'live'`. On any throw (Python `ok:false`, JS exception, validation error, or `Timeout`):
1. `console.error('[live] failed', err)`.
2. Set the dataset to the precomputed `lineView(line, sensor)`, `mode = 'precomputed'`, index 0, paused.
3. Show the danger notice with the UI-SPEC copy and announce it.
4. Call `live_cancel` (best effort) to drop the generators and free memory.

A later line/sensor change in `live` mode returns to precomputed. **Forced failure for verification:** a checkbox under the Run live button (or a `<details>` "Demo options"), "Simulate a compute failure", passes `simulate_failure=True`. This lets success criterion 3 be checked on Qollab without editing code.

### Pattern 6: Canvas heatmap + SVG overlay (UI-02)
```js
// lib/colormap.js
import { interpolateCividis } from 'd3-scale-chromatic';
export function buildCividisLut() {           // 256 x RGB; parse "rgb(r, g, b)" (no d3-color import needed)
  const lut = new Uint8ClampedArray(768);
  for (let i = 0; i < 256; i++) {
    const [r, g, b] = interpolateCividis(i / 255).match(/\d+/g).map(Number);
    lut.set([r, g, b], 3 * i);
  }
  return lut;
}
export function percentileDomain(nT, valid, lo = 0.02, hi = 0.98) {
  const v = nT.filter((_, i) => valid[i]).sort((a, b) => a - b);
  return [v[Math.floor(lo * (v.length - 1))], v[Math.ceil(hi * (v.length - 1))]];
}
```
```js
// MapView: draw once per (line, size); never per frame
function drawHeatmap(canvas, preview, lut, [d0, d1], cssW, cssH) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`; canvas.style.height = `${cssH}px`;
  const { nx, ny, nT, valid } = preview;
  const off = document.createElement('canvas'); off.width = nx; off.height = ny;   // 1 px per cell
  const img = off.getContext('2d').createImageData(nx, ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const src = j * nx + i, dst = ((ny - 1 - j) * nx + i) * 4;                    // flip: row 0 is SOUTH
    if (!valid[src]) { img.data.set([0x24, 0x28, 0x2f, 255], dst); continue; }
    const k = Math.max(0, Math.min(255, Math.round(((nT[src] - d0) / (d1 - d0)) * 255)));
    img.data[dst] = lut[3 * k]; img.data[dst + 1] = lut[3 * k + 1]; img.data[dst + 2] = lut[3 * k + 2]; img.data[dst + 3] = 255;
  }
  off.getContext('2d').putImageData(img, 0, 0);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;                                               // crisp cells
  ctx.drawImage(off, 0, 0, cssW, cssH);
  // hatch invalid cells: one Path2D of rects filled with a pattern from an 8x8 tile (stripe #3A3F47 every 4 px)
}
```
**Geometry:** cell edges are `x_min − dx/2 … x_max + dx/2` with `dx = (x_max − x_min)/(nx − 1)`, and the same for y. `toPx(x, y) = [(x − X0)/(nx·dx)·W, (Y1 − y)/(ny·dy)·H]` with `X0 = x_min − dx/2` and `Y1 = y_max + dy/2`. Local metres are isotropic, so `H = W · (ny·dy)/(nx·dx)`, capped at 520 px with the aspect ratio kept (UI-SPEC). Track the size with a `ResizeObserver` on the wrapper and redraw the canvas only when the size, line, or DPR changes. Use one SVG overlay (`position:absolute; inset:0`) whose `viewBox="0 0 W H"` uses the same pixel coordinates. Precompute pixel point strings per series on resize, then per frame render `points.slice(0, idx + 1).join(' ')` (≤1499 pairs, negligible cost). Draw each track twice: a 4 px `#000` casing, then the 2 px coloured stroke with the UI-SPEC dash. Computed contrast (this session): every Okabe-Ito colour fails 3:1 against cividis yellow `#fee838` (1.06-3.10), but the black casing gives ≥3:1 everywhere. The canvas gets `aria-hidden="true"` and the figure carries the description.

### Pattern 7: Signal panel without 60 Hz re-renders (UI-03)
```jsx
// SignalPanel.jsx (memoized; props change only on line/sensor/toggle changes)
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, ResponsiveContainer,
         useXAxisScale, usePlotArea } from 'recharts';
import { useSyncExternalStore } from 'react';

function Playhead({ store }) {                       // only this re-renders per frame
  const t = useSyncExternalStore(store.subscribe, store.getTime);
  const x = useXAxisScale(); const area = usePlotArea();   // recharts >=3.8 / >=3.1 hooks [VERIFIED: recharts/types/hooks.d.ts]
  if (!x || !area) return null;
  const px = x(t);
  return <line x1={px} x2={px} y1={area.y} y2={area.y + area.height} stroke="var(--color-accent)" strokeWidth={1} aria-hidden="true" />;
}

const Y_AXIS_WIDTH = 56;                             // fixed so both plot areas align horizontally
<ResponsiveContainer width="100%" height={240}>
  <LineChart data={rows} accessibilityLayer={false} syncId="signal" margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
    <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" />
    <XAxis dataKey="t" type="number" domain={[0, tEnd]} allowDataOverflow tickCount={7} />
    <YAxis width={Y_AXIS_WIDTH} />
    <Tooltip isAnimationActive={false} />
    <ReferenceLine x={jamT} stroke="#FFD166" strokeDasharray="4 2" label="GPS jammed" />
    <Line dataKey="truth" stroke={c.truth} dot={false} isAnimationActive={false} strokeWidth={2} />
    {visible.map((k) => <Line key={k} dataKey={k} stroke={c[k]} strokeDasharray={dash[k]} dot={false} isAnimationActive={false} strokeWidth={2} />)}
    <Playhead store={playback} />
  </LineChart>
</ResponsiveContainer>
```
- Rows are built once per (line, sensor) with `useMemo`: `{t, truth, raw, …}` for the main chart and `{t, raw_res, …}` for the residual chart. Use `null` before `metricStartIdx` so the residual starts after GPS loss (recharts leaves gaps for null; `connectNulls` defaults to false).
- `isAnimationActive={false}` on every Line and `dot={false}` (default dots would draw 1264 circles per series).
- Use the HTML legend and toggles (checkbox + inline SVG dash swatch + RMSE badge) instead of `<Legend>`. A legend that doubles as the toggle list is accessible and shows dash patterns. If you keep `<Legend>`, use `legendType="plainline"`, which honours `strokeDasharray` [VERIFIED: recharts DefaultLegendContent.js].
- The residual chart is a second `LineChart` with the same `syncId`, the same `XAxis` domain, and the same `Y_AXIS_WIDTH`/margins, so the jam line and playhead align across both charts.

### Pattern 8: Keyboard, focus, announcements, reduced motion (A11Y-01/02)
```js
// global shortcuts (App effect)
function onKeyDown(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const el = e.target;
  const formish = el.closest?.('input, select, textarea, button, summary, [contenteditable="true"]');
  if (formish && !(el.matches?.('input[type="range"]') && e.key !== ' ')) return; // slider handles arrows itself
  switch (e.key) {
    case ' ': e.preventDefault(); playback.toggle(); break;          // preventDefault stops iframe scrolling
    case 'ArrowLeft': case 'ArrowRight': e.preventDefault(); playback.stepWindow(e.key === 'ArrowRight' ? 1 : -1); break;
    case 'Home': e.preventDefault(); playback.seekIndex(0); break;
    case 'End': e.preventDefault(); playback.seekIndex(n - 1); break;
    case 'j': case 'J': playback.seekTime(jamT - 5); break;
  }
}
document.addEventListener('keydown', onKeyDown);
```
- Slider: native `<input type="range" min=0 max=n-1 step=1>` with `aria-valuetext` (UI-SPEC copy). Its `onKeyDown` intercepts ArrowLeft/Right (10 s window step) and PageUp/PageDown (60 s) with `preventDefault`. Home and End stay native.
- Keyboard events reach the iframe document only after the iframe has focus. The judge has to click into the page once. Show the "Press Play or Space…" hint and focus nothing automatically.
- Announcer: one visually hidden `<p role="status" aria-live="polite">` rendered empty at mount (a live region must exist before its content changes). To re-announce identical text, clear it, then set the text on the next frame. The visible error readout is **not** inside a live region, otherwise it would announce at 60 Hz. The throttled readout announces at most every 10 s of wall time, only while playing and after `metricStartT`.
- Reduced motion: `const mq = matchMedia('(prefers-reduced-motion: reduce)')`, kept current with `mq.addEventListener('change', …)`. The playback store keeps advancing play time continuously but publishes the index only when `Math.floor(wallElapsed)` changes (1 Hz). CSS rule: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }`.
- Focus ring: `:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }` (`#A5B4FC` on `#111318` is high contrast). The figures get `tabIndex={0}` so shortcuts work after focusing them (UI-SPEC).
- Text alternatives: `<details>` tables sampled every 60 s plus the jam row (≈64 rows for 1003.02, ≈88 for 1007.06), with `<caption>`, `<th scope>`, and a `<tfoot>` RMSE row.

### Pattern 9: Playback store (D-10/D-12)
```js
// lib/playback.js (pure; inject now() and raf for tests)
export function indexAtTime(t, time) { let lo = 0, hi = t.length - 1; if (time <= t[0]) return 0;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (t[mid] <= time) lo = mid; else hi = mid - 1; } return lo; }
export function nextWindowTime(time, dir, strideS = 10) { // step one navigator window (10 s); clamp at the ends
  return dir > 0 ? Math.floor(time / strideS + 1e-9) * strideS + strideS : Math.ceil(time / strideS - 1e-9) * strideS - strideS; }
export function createPlaybackStore({ now = () => performance.now(), raf = requestAnimationFrame, caf = cancelAnimationFrame } = {}) {
  // state: t[], time, speed (60), playing, reduced; listeners; tick(ts): time += (ts - last)/1000 * speed;
  // publish index = indexAtTime(t, time) every frame, or only when floor(wall seconds) changes if reduced;
  // stop at end (playing=false; next play restarts at 0). Methods: load(t), play, pause, toggle, seekIndex,
  // seekTime, stepWindow, setSpeed, setReduced, subscribe, getIndex, getTime.
}
```
Keep the clock in seconds of flight time. Line lengths: 1003.02 at 60× takes 63 s, and 1007.06 takes 87 s (300×: 13/17 s; 10×: 6.3/8.7 min).

### Pattern 10: Keep-alive (`runDone`) for a player
Keep the Phase 1 semantics: `main.jsx` does `await runDone`, and `runDone` resolves on a terminal state. For the player the terminal states are (a) an explicit "End run" button (small, in the footer or status strip) and (b) an **activity-based** idle bound: 15 min with no `pointerdown`/`keydown`, not playing, and no live run in flight. Do **not** resolve when `qBackend` is null: the replay works without a backend, and in dev there is never one. Do not gate the artifact load on `qBackend` either. Only "Run live" needs the run to be alive, and on Qollab a backend always exists after Run. Check idle time with `performance.now()` comparisons on activity events plus a coarse check (`globalThis.setInterval` at 30 s, guarded by the timer probe in Pitfall 5). Never rely on `clearTimeout` of the injected `setTimeout`.

### Anti-Patterns to Avoid
- **App-level `useState(index)` updated every rAF:** this re-renders both recharts trees (18k+ SVG path points) at 60 Hz. Use the external store and leaf subscribers.
- **`ReferenceLine x={currentT}` as the playhead:** same problem. Use the custom child (Pattern 7).
- **Default `accessibilityLayer`:** gives `role="application" tabindex="0"` on each chart SVG (verified). Turn it off and use figure/figcaption plus tables.
- **One blocking `run_line` call + `Promise.race` timeout:** the race rejects in JS, but Python keeps running and blocks every later bridge call (the serialized queue) and possibly the UI.
- **`fetch('data/precomputed_run.json')` in production code:** never reaches project files on Qollab.
- **`100vh` / viewport-relative heights:** inside an iframe that may auto-size to content this can cause runaway growth or clipping. Use fixed px heights (UI-SPEC: 520/240/140).
- **`dangerouslySetInnerHTML` for error messages:** Python error strings are untrusted text. Render as text only.
- **Rendering the error readout inside the aria-live region:** it would announce on every frame.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart axes, ticks, tooltips, sync | Custom SVG chart kit | recharts 3.10.1 (D-09) | Axis tick generation and tooltip sync are fiddly; bundle headroom is ample |
| Perceptual colormap | Hand-typed RGB stops | `interpolateCividis` (d3-scale-chromatic) → 256 LUT | Published, perceptually uniform, CVD-safe |
| Python↔JS transport | postMessage/HTTP layer | `callPromising` via `bridge.js` | Platform-provided; XHR/WebSocket/POST blocked |
| Third-party license notices | Hand-written NOTICE file | Vite 8 `build.license` (emits a markdown file of every bundled dependency's license) | Verified this session: 27 entries, 26 kB; bundle has **no** license comments otherwise |
| Accessibility scan | Manual DOM checks | axe-core 4.14.0 dev-only | Standard engine; removed from the build (verified) |
| Unit test runner for pure JS | vitest/jest install | Node 24 built-in `node --test` | Zero new deps; lib modules are plain ESM |

**Key insight:** In this sandbox the expensive mistakes are runtime ones (blocking the only thread, a re-render storm, timers that behave differently), not library choices. Spend the effort on the store/chunking architecture, not on custom widgets.

## Live-mode budget (UI-05)

Measured this session (CPython 3.13, Apple Silicon, `OMP_NUM_THREADS=1` gave the same result, so the time is not BLAS-bound):

| Step | 1003.02 | 1007.06 |
|------|---------|---------|
| `import magnav.pipeline` (scipy.signal dominates) | 1.2 s | (once per run) |
| load cal + line + map | 0.02 s | 0.03 s |
| `select_tl_config` (one sensor) | 0.10 s | 0.09 s |
| fit raw/lowpass/tl/quantum-stub | ≈0 s | ≈0 s |
| (KRR fit, skipped live) | 3.0 s | 3.0 s |
| TERCOM per denoiser | **5.5 s** (278 windows, 19.8 ms/window; 92% in `MapTile.sample`) | **7.7 s** (388 windows) |

Projected Pyodide time for tl + raw + lowpass (quantum copied) at 1.5-4x [ASSUMED; literature says 1-5x, NumPy-heavy code is nearer native]: **1003.02 ≈ 25-66 s; 1007.06 ≈ 35-92 s**, plus 2-5 s for the first scipy import. Policy: compute `tl` first (the hero series), then `raw`, then `lowpass` only if `elapsed + projected_lowpass < 80 s`. Otherwise mark lowpass "skipped for time" (same UI as KRR). Record the real ms/window from the first Qollab live run in `docs/QOLLAB_FINDINGS.md`.

## Common Pitfalls

### Pitfall 1: The UI freezes during live compute
**What goes wrong:** the page stops painting and ignoring input for 30-90 s, the progress bar never moves, and the timeout never fires.
**Why:** Pyodide most likely runs on the page's main thread (web workers are unavailable in Qollab JS projects, and JSPI is required) [ASSUMED; the docs do not say]. A long Python call blocks the event loop.
**How to avoid:** the chunked API (Pattern 4) with `budget_ms = 250` and a MessageChannel yield between chunks.
**Warning signs:** in the Qollab probe, the JS-measured duration of each `live_step` greatly exceeds `budget_ms`, or no frames render during a step.

### Pitfall 2: The recharts re-render storm
**What goes wrong:** playback stutters at 60× and the fans spin up.
**How to avoid:** memoized charts, a Playhead subscriber, and data rows built once per line/sensor.
**Warning signs:** React Profiler shows `SignalPanel` committing every frame.

### Pitfall 3: recharts' accessibility layer fights the keyboard contract
`role="application" tabindex="0"` on every chart SVG (verified in the Chrome DOM dump), with ArrowLeft/Right moving the tooltip. Set `accessibilityLayer={false}`. Check that no `.recharts-surface` has a `tabindex` in the built page.

### Pitfall 4: Mixing raw-sample indices with display indices
`metric_start_index` (2012) and `jam.index` (1892) are raw samples, while arrays have ≤1499 display points. Indexing `t[2012]` gives `undefined` on 1003.02 (length 1264). Use `jam.display_index` and `metricStartT` → `indexAtTime` (UI-SPEC data mapping rules). Add a unit test.

### Pitfall 5: Qollab's injected `setTimeout`
The docs say "the injected `setTimeout` returns a promise you can await while polling `job.status()`" [CITED: qollab.xyz/learn/docs/js-qiskit-projects]. Whether it also accepts a callback, and whether `clearTimeout` cancels it, is undocumented. Phase 1's 10-min idle timer might never have fired, silently. React's scheduler uses MessageChannel, and recharts uses `setTimeout` in animation and event middleware (grep of `recharts/es6`). Animations are disabled here, and the default tooltip throttle is `'raf'`.
**How to avoid:** never depend on `setTimeout`/`clearTimeout` for correctness. Use rAF for the playback clock, MessageChannel for yields, and `performance.now()` comparisons for the deadline and idle checks. Log a one-line startup probe: `console.log('[probe] timers', JSON.stringify({ sameAsGlobal: typeof setTimeout === 'function' && setTimeout === globalThis.setTimeout, nativeGlobal: String(globalThis.setTimeout).includes('[native code]'), returnsPromise: (() => { const h = setTimeout(() => {}, 0); return typeof h?.then === 'function'; })() }))`.

### Pitfall 6: Blurry canvas on HiDPI, or a heatmap redrawn per frame
Set the backing store to `cssW × dpr` and `setTransform(dpr,…)`, with `imageSmoothingEnabled = false` for crisp cells. Redraw only on line, size, or DPR change, using a `ResizeObserver` plus `matchMedia('(resolution: …dppx)')` (or simply redraw on every ResizeObserver callback). Never redraw from the playback tick.

### Pitfall 7: Iframe height and the first view
In the Qollab editor screenshots from Phase 1 (1200×646 viewport), the Preview panel starts about 340 px down the page, so only about 300 px of the page is visible at first. Whether the iframe grows with its content or scrolls internally is undocumented [ASSUMED].
**How to avoid:** put the control bar, status strip, jam banner, and the top of the map first (as in the UI-SPEC order). Use no `vh` units. Use fixed chart heights. Log the probe `{innerHeight, scrollHeight: document.documentElement.scrollHeight, dpr}` once after first render. Qollab's Preview has an expand button, so mention "expand the preview" in the README demo steps. Screenshots also show the Qollab editor chrome in light theme around a white Preview. D-05's dark theme still holds, but `:root`/`body`/`#root` must set `background: var(--color-bg)` and `color-scheme: dark` explicitly, or the page renders dark panels on white.

### Pitfall 8: Concurrent Python calls
A second `callPromising` while one is in flight (for example a progress poll, or the line select firing a reload during live) has undocumented behaviour. Serialize all calls (Pattern 1). Disable "Run live" while one is in flight.

### Pitfall 9: The dev stub drifts from the real API
The stub must return **strings** (JSON text), exactly like Python, and implement the same `ok`/`error_type` contract and `live_*` progress shape. Otherwise dev hides `JSON.parse` and shape bugs. Add a forced-failure path in the stub too.

### Pitfall 10: React StrictMode double effects
`main.jsx` does not use StrictMode, so keep it that way in the build. If StrictMode is added in dev, every effect (artifact load, rAF loop, global keydown listener) must clean up, or there will be two rAF loops (2× speed) and duplicate Python calls. The module-level `runDone` promise is unaffected.

### Pitfall 11: Missing license notices
The lib build strips license comments (0 `@license`/`Copyright` strings in `main.js`). Recharts' and React's MIT/ISC terms require the notice to ship with copies. Enable `build.license: { fileName: 'THIRD_PARTY_LICENSES.md' }`, add the file to `scripts/package_qollab.sh` `COMMON` and to the bundle-freshness test, and add rows to the README library table (`react-is`, `d3-scale-chromatic` ISC, the recharts transitive set, `axe-core` MPL-2.0 dev-only).

### Pitfall 12: The artifact refactor changes bytes
Extracting `line_entry` or `tercom_steps` must leave `data/precomputed_run.json` byte-identical. Verify with `.venv/bin/python main.py && git diff --exit-code data/precomputed_run.json` (≈1-2 min) plus the existing `test_artifact_regression.py` and `test_nav.py`.

## Code Examples

### Dev stub: serve the real artifact in `vite dev` without touching the Qollab build
```js
// web/src/dev/magnavApiStub.js (aliased to 'magnav.api' only when command === 'serve')
export const artifact_json = py(async () => {
  const text = (await import('../../../data/precomputed_run.json?raw')).default;   // Vite ?raw -> string
  return '{"ok":true,"artifact":' + text.trim() + '}';
});
```
```js
// web/vite.config.js addition (serve-only effect; build output unchanged: verified 0 'precomputed_run' strings in main.js)
server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
```
Verified this session: without `fs.allow`, Vite answers 403 for `../data`. With it, 200. The build still contains no artifact. In the stub, simulate `live_*` from the precomputed line (restricted to the sensor, denoisers tl/raw/quantum/lowpass) with about 30 steps of fake progress. Add `globalThis.__MAGNAV_DEV_FAIL__` or honour the `simulate_failure` argument so the fallback can be exercised in dev.

### Contract test additions (`tests/test_qollab_contract.py`)
```python
MAX_MAIN_JS = 1_500_000   # headroom under Qollab's 2 MB per-file cap; recharts build measured 810,193 B

def test_main_js_budget():
    assert MAIN_JS.stat().st_size < MAX_MAIN_JS

def test_no_production_fetch_of_project_files():
    text = MAIN_JS.read_text(encoding="utf-8")
    assert "precomputed_run.json" not in text          # artifact must come through Python, never bundled/fetched
    assert "axe-core" not in text and "axe.run" not in text

def test_charts_have_accessibility_layer_disabled():
    src = (WEB / "src").rglob("*.jsx")
    assert all("accessibilityLayer={false}" in p.read_text() for p in src if "<LineChart" in p.read_text())
```
Extend `test_committed_bundle_matches_fresh_build` to compare `THIRD_PARTY_LICENSES.md` as well.

### Python tests to add
- `tests/test_live.py`: (a) `api.live_start` → loop `live_step(10_000)` → `live_result` for `1003.02/mag_5_uc` with only `tl` (≈6 s); assert `line_entry` estimates `tl.x/y/signal_nT/window_t/ncc/accepted` **equal** the committed artifact's, and `metrics` equal. (b) Unknown line or sensor gives `ok:false` and does not raise. (c) `simulate_failure=True` gives `ok:false` with `error_type == "RuntimeError"`. (d) `live_step` before `live_start` gives `ok:false`. (e) `artifact_json` output `json.loads` cleanly to `{"ok": true, "artifact": {...schema_version: 1}}`.
- `tests/test_nav.py`: `tercom_steps` drained equals `tercom` (arrays equal) on the planted-offset fixture, and the number of yields equals the number of windows.
- `tests/test_truth_guard.py`: unchanged. `live.py` is an orchestrator like `pipeline.py`. Add a module docstring saying so.

### JS unit tests (`node --test web/src/lib/`), wrapped by a pytest that skips when node is missing
- `artifact.test.js`: loads `data/precomputed_run.json` from disk. `validateArtifact` passes. `lineView('1007.06','mag_4_uc').t.length === 1499`. `metricStartT('1003.02') === 1006`. `jam.display_index` maps to `t = 946`. A mutated copy (a dropped series point, or `schema_version: 2`) fails validation.
- `playback.test.js`: `indexAtTime` at the boundaries. Fake `now`/`raf` driving 1 s at 60× advances time by 60 s. Reduced mode publishes ≤1 index change per wall second. `stepWindow(+1)` from 946 goes to 950, then 960. Playback stops at the end and the next play restarts at 0.
- `colormap.test.js`: the LUT has 768 bytes. `lut[0..2] = [0,32,81]` and the last entry is `[253,234,69]` (d3 polynomial endpoints, verified). Relative luminance is non-decreasing over the 256 entries (cividis is monotone). `percentileDomain` on a known array.
- `geo.test.js`: `toPx(x_min − dx/2, y_max + dy/2) = [0,0]`; `toPx(x_max + dx/2, y_min − dy/2) = [W,H]`; aspect for 1003.02 ≈ 0.914.

### Manual / human checks (cannot be automated here)
1. **Dev (Chrome):** keyboard-only walkthrough (Tab order matches the UI-SPEC, Space/Arrows/Home/End/J, visible focus on every control and figure). VoiceOver smoke test on the announcements. macOS "Reduce motion" on gives 1 Hz stepping. Grayscale filter (DevTools → Rendering → Emulate vision deficiencies: achromatopsia) shows series distinguishable by dash. `axe.run()` from the dev console shows 0 serious/critical issues (formal A11Y-03 is Phase 5).
2. **Qollab (`checkpoint:human-verify`, upload to the editor only, NO publish):** upload `dist/qollab-upload.zip` → Run on the built-in simulator → the replay appears within seconds → Play, scrub, keyboard. Record the probes from the console: timers, `{innerHeight, scrollHeight}`, and the per-`live_step` JS duration vs `budget_ms`. Run live on 1003.02/Mag 5 and record the total seconds and ms/window. Check the "Simulate a compute failure" path shows the fallback badge and notice. Optionally repeat on IonQ Forte 1 (remote simulator), where no job is submitted. Write the results into `docs/QOLLAB_FINDINGS.md`. **Publishing a new version is a separate `checkpoint:human-action` requiring the builder's explicit approval (CLAUDE.md gate). It is not part of this phase's executor tasks.**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ResponsiveContainer` only | `responsive` prop on charts (CSS sizing) | recharts 3.3+ (prop present in 3.10.1 types) | Either works. UI-SPEC uses `ResponsiveContainer`, which is fine. |
| Custom children could not read chart scales | `useXAxisScale` (3.8), `usePlotArea` (3.1), `useOffset`, etc. | recharts 3.x | Enables the cheap playhead overlay |
| `accessibilityLayer` opt-in (2.x) | Default `true` (3.x) | recharts 3.0 | Must opt out explicitly here |
| Manual license file | `build.license` in Vite | Vite 7+ (present in 8.3.4 types) | One config line for compliance |

**Deprecated/outdated:** the recharts 2.x `<Customized>` wrapper pattern for overlays. In 3.x, plain children can call the hooks.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pyodide on Qollab shares the page's main thread, so long Python calls block the UI | Pattern 4, Pitfall 1 | Low: the chunked design works either way, with a little overhead if Python is actually in a worker |
| A2 | Pyodide is 1.5-4x slower than CPython for this numpy gather workload | Live-mode budget | If more than 4x, 1007.06 exceeds 90 s even with raw+tl. The adaptive lowpass skip and fallback cover it, but live mode on 1007.06 may always fall back. The probe settles it. |
| A3 | Module-level Python state (generators in `live._STATE`) persists between `callPromising` calls in one run | Pattern 4 | Medium: if each call got a fresh interpreter, chunking breaks. Mitigation: Phase 1 already made several calls per run in the same module. Confirm in the probe. |
| A4 | Python `str` return values arrive as JS strings (implicit conversion) | Pattern 1/2 | Low: Phase 1 `JSON.parse(await …callPromising())` already worked |
| A5 | MessageChannel works in the sandboxed iframe | Pattern 4 | Low: React's scheduler uses it and the Phase 1 page rendered |
| A6 | The injected `setTimeout` may not support callbacks or `clearTimeout` | Pitfall 5 | Low impact: the design avoids depending on it |
| A7 | The Qollab iframe's height policy (auto-grow vs fixed/scroll) | Pitfall 7 | Layout only. The probe records it. |
| A8 | Package legitimacy (slopcheck unavailable) | Package Audit | Very low: long-established packages, builder-chosen recharts |
| A9 | Reading 1 MB and converting it to a JS string takes < 0.5 s in Pyodide | Pattern 2 | Low: worst case is a slightly longer "Loading precomputed flight…" |

## Open Questions (RESOLVED)

1. **Can JS `fetch` the artifact on Qollab?** RESOLVED: No. The docs: "`fetch("data.csv")` does not reach them". → Plan: `api.artifact_json` (Pattern 2), in the Python-API plan. The JS loader uses `callPyText`.
2. **recharts weight, compatibility, and a11y in this build?** RESOLVED: 810 kB raw / 200 kB gzip total, renders under React 19.3 in Chrome, default `role="application"`. → Plan: SignalPanel task with `accessibilityLayer={false}`, the Playhead child, and the `test_main_js_budget` (< 1.5 MB) contract test.
3. **How to show progress and enforce 90 s with no streaming and possibly blocked main thread?** RESOLVED: chunked `live_start/step/result` with a serialized bridge, MessageChannel yields, and a `performance.now()` deadline. → Plan: Python live API plan (`tercom_steps`, `live.py`, `api.live_*`) plus `useLiveRun` in the live/fallback task.
4. **Is the live run fast enough?** RESOLVED (with a fallback): CPython is measured; Pyodide is projected at 25-92 s. Order tl → raw → lowpass, adaptive skip, quantum copied from the TL stub. → Plan: `live.py` skip logic, and a Qollab probe task recording the real timing in `docs/QOLLAB_FINDINGS.md`.
5. **Pyodide on main thread or worker, injected `setTimeout` semantics, iframe height?** RESOLVED by design (independent of the answer) plus a probe. → Plan: startup `console.log` probes (timers, sizes) and per-step timing, recorded in the human Qollab check.
6. **How does dev mode get the real artifact without affecting the build?** RESOLVED: `?raw` import in the stub plus `server.fs.allow: ['..']` (verified 403 → 200; build unaffected). → Plan: bridge/dev-stub task.
7. **How to test without a browser?** RESOLVED: `node --test` for pure `web/src/lib/*.js`, pytest for the Python live API equivalence and the bundle contract. Manual checklist plus the Qollab human-verify for the rest. → Plan: a test task in each plan, and the final human checkpoint.
8. **Cividis source?** RESOLVED: d3-scale-chromatic 3.1.0 `interpolateCividis` (UI-SPEC), with LUT endpoints and monotonicity unit-tested. → Plan: MapView task.
9. **License/disclosure for new deps?** RESOLVED: Vite `build.license` file plus README rows. → Plan: build/packaging task (update `scripts/package_qollab.sh` allowlist and the freshness test).
10. **Keep-alive semantics for a player?** RESOLVED: End-run button plus a 15-min activity-based idle bound. Do not end the run when there is no backend. → Plan: App/main.jsx task.
11. **D-05 "dark like Qollab" vs the light editor chrome seen in screenshots?** RESOLVED: keep D-05 and make the background explicit (`:root`, `body`, `#root`, `color-scheme: dark`). → Plan: theme/CSS task.

**Suggested plan split (roadmap target was 2; 3 parallelizable slices fit ~5 h better):**
- **03-01 Python live API (wave 1):** `tercom_steps` + `tercom` wrapper, `artifact.line_entry` extraction, `magnav/live.py`, `api.artifact_json` / `live_start` / `live_step` / `live_result` / `live_cancel`, tests, and a byte-identical artifact check.
- **03-02 JS player core (wave 1, parallel):** deps plus exact pins, `build.license`, bridge queue, dev stub (`?raw`, `live_*` sim), `lib/*` with node tests, playback store, App/ControlBar/StatusStrip/JamBanner/MapView/MetricsTable, theme CSS, keep-alive.
- **03-03 Signal panel, a11y, live UI (wave 2):** SignalPanel plus residual plus Playhead, TextAlternatives, Announcer, keyboard handler, reduced motion, `useLiveRun` plus fallback plus forced-failure toggle, contract tests, README rows, build plus commit `main.js`/`main.css`/license file, packaging, manual checklist, and the **human-verify Qollab check (no publish)**.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build, `node --test` | ✓ | v24.20.0 | — |
| npm | deps | ✓ | 11.19.0 (blocks install scripts by default; none needed) | — |
| Vite (web/node_modules) | build | ✓ | 8.3.4 | — |
| Python venv | pytest, main.py regeneration | ✓ | 3.13.16 (`.venv`), pytest 9.1.1 | — |
| matplotlib | (optional exact LUT generation) | ✓ | 3.10.9 | not needed with d3 |
| Google Chrome | manual a11y checks, headless smoke | ✓ | installed | — |
| Playwright Chromium cache | optional automation | ✓ (cache `chromium-1243`, no npm package installed) | — | manual checks |
| `uv` | — | ✗ on PATH | — | use `.venv/bin/python` directly |
| slopcheck | package audit | ✗ | — | [ASSUMED] tags + human-verify |
| ctx7 / Context7 | docs lookup | ✗ | — | verified from installed package source and official docs |
| Qollab account / editor | human Qollab check | ✓ (builder) | — | — |

**Missing dependencies with no fallback:** none.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth. Qollab handles accounts |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Python: allowlist `line ∈ HELD_OUT`, `sensor ∈ SENSORS`, `budget_ms` int-clamped 50-2000 (reuse `_as_int`); JS: `validateArtifact`/`validateLine` before rendering |
| V6 Cryptography | no | — |
| V12/V14 Files & Config | yes | Literal data paths only; `allow_pickle=False` (existing guard test); no secrets (Qollab injects `backend`) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via error text from Python rendered as HTML | Tampering | React text nodes only; never `dangerouslySetInnerHTML`; truncate to 2000 chars (existing `_failure` pattern) |
| Path traversal via user-chosen line id | Tampering / Info disclosure | Map line id → literal constant via `HELD_OUT` dict; reject anything else |
| Denial of service (runaway live compute) | DoS | Chunked steps, a 90 s JS deadline, `live_cancel`, a single in-flight call |
| Supply chain (new npm deps) | Tampering | Exact pins, committed lockfile, `npm ci` in packaging, install scripts blocked by npm 11, human-verify of the names |
| Accidental `backend.run` in Phase 3 | Elevation (spends the run's one IonQ job) | Test: `live.py`/`api.live_*` never call `backend.run` (mock backend counting calls, like `test_backend_info_submits_no_job`) |

## Compliance (disclosure)

README "Libraries" table additions: `react-is` (MIT), `d3-scale-chromatic` + `d3-color` + `d3-interpolate` (ISC), the libraries recharts bundles (`@reduxjs/toolkit`, `react-redux`, `redux`, `redux-thunk`, `immer`, `reselect`, `es-toolkit`, `clsx`, `eventemitter3`, `decimal.js-light`, `tiny-invariant`, `use-sync-external-store` MIT; `victory-vendor` MIT AND ISC with d3-* ISC/BSD-3-Clause), and `axe-core` (MPL-2.0, dev only, not shipped). `tests/test_compliance.py` already checks the README strings, so extend it if it lists libraries.

## Sources

### Primary (HIGH confidence)
- Local experiments (this session): Vite 8.3.4 builds with recharts 3.10.1 (sizes, export regex, forbidden APIs), headless Chrome DOM dump (recharts renders under React 19.3; `role="application"`), Vite dev `fs.allow` 403→200, `build.license` output, dev-only axe elimination, CPython timings and cProfile of TERCOM, artifact field and extent inspection, Node `JSON.parse` timing, contrast ratios, cividis comparison.
- recharts 3.10.1 package source: `types/util/types.d.ts` (`accessibilityLayer` default true, `responsive`, `syncId`), `types/hooks.d.ts` (`useXAxisScale` since 3.8, `usePlotArea` since 3.1), `es6/container/RootSurface.js`, `es6/component/DefaultLegendContent.js`.
- d3-scale-chromatic 3.1.0 source `src/sequential-multi/cividis.js`.
- npm registry: recharts, react-is, d3-scale-chromatic, axe-core versions, dates, licenses, weekly downloads (api.npmjs.org).
- https://qollab.xyz/learn/docs/runtime-environment: JS cannot fetch project files; GET-only fetch to CORS hosts; no XHR, WebSocket, or workers; no storage; literal-path preload; runs have no time limit.
- https://qollab.xyz/learn/docs/js-qiskit-projects: sandboxed iframe, `callPromising`, injected `backend` and `setTimeout` (returns a promise), top-level await.
- https://pyodide.org/en/stable/usage/api/js-api.html: `callPromising` "Call the function with stack switching enabled… can use run_sync()"; experimental.
- https://pyodide.org/en/stable/usage/api/python-api/ffi.html: `run_sync` requires JSPI and a `callPromising` entry.
- Repo: `magnav/*.py`, `web/*`, `tests/*`, `docs/QOLLAB_FINDINGS.md`, `.playwright-mcp/run-*.png` (Qollab Preview layout).

### Secondary (MEDIUM confidence)
- https://qollab.xyz/learn/docs/run-your-code, /faq: JSPI browser requirement; nothing on iframe height or threads.

### Tertiary (LOW confidence)
- Pyodide speed relative to native (1x-16x in 2019, "3x to 5x" in the later roadmap, NumPy "nearly native" informal): [LWN Pyodide article](https://lwn.net/Articles/855875), [Pyodide roadmap](https://pyodide.org/en/0.20.0/project/roadmap.html), [Nexedi 2018 presentation](https://erp5.nexedi.com/latest/NXD-Presentation.News.2018). Used only to bracket the live-mode projection, which the Qollab probe must confirm.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Pinned versions verified on the registry and built and rendered locally.
- Architecture: HIGH for the bundle, render, and store design. MEDIUM for the Pyodide threading and timing assumptions (a probe is planned, and the design works either way).
- Pitfalls: HIGH for the recharts a11y layer, the index-space mixing, the license stripping, and dev fs access (all reproduced). MEDIUM for the injected `setTimeout` and the iframe height (docs are thin).

**Research date:** 2026-10-10
**Valid until:** 2026-10-17 (hackathon window; Qollab runtime may change without notice)

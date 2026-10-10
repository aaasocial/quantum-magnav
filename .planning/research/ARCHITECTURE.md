# Architecture Research

**Domain:** Hybrid quantum/classical ML demo: magnetic anomaly navigation (MagNav) with a Qiskit denoiser, a classical map-matching navigator, and a live web frontend
**Researched:** 2026-10-09
**Confidence:** MEDIUM overall. The component structure and data contracts are HIGH: they are standard patterns and depend on no external service. The IonQ/Qiskit integration is HIGH, checked against the IonQ Qiskit docs. The FastAPI streaming APIs are HIGH, checked against the FastAPI docs. How Qollab.xyz actually runs projects is LOW: it could not be confirmed (see Gaps).

---

## Guiding Principle

**The frontend only ever plays back a `RunArtifact`.** "Live" and "replay" differ in one way: where the frames come from. In live mode the backend computes them now and streams them. In replay mode they are read from a precomputed JSON file. The visuals are identical by construction, because one player component renders the same frame schema either way.

**Quantum hardware and remote simulators never run during the demo.** Remote quantum results (IonQ simulator via Qollab, plus one QPU run) are produced offline by a batch script and saved as a cache file with provenance (job IDs, backend, shots). Live mode either reads that cache or runs the trained circuit on local Aer statevector, which takes milliseconds and has no network or queue.

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│ OFFLINE / BATCH (scripts + Qollab notebook; run before the demo)           │
│                                                                            │
│  train_quantum.py ──► artifacts/models/qdenoise_params.json  (Aer, exact)  │
│  run_quantum_remote.py ──► artifacts/quantum_cache/<run>_<backend>.json    │
│        (IonQ simulator via Qollab; QPU once; stores job_ids + counts)      │
│  precompute.py ──► artifacts/runs/<scenario>_<seed>.json (RunArtifact)     │
│        └─ copied to web/public/runs/  (static replay fallback)             │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ files only (no network at demo time)
┌───────────────────────────────▼──────────────────────────────────────────┐
│ CORE LIBRARY  magnav/   (pure Python: numpy/scipy/qiskit; no I/O, no web)  │
│                                                                            │
│  ┌──────────┐   ┌────────────────────┐   ┌──────────┐   ┌──────────┐      │
│  │   sim    │──►│ denoise_classical  │──►│   nav    │──►│ metrics  │      │
│  │ map,     │   ├────────────────────┤   │ map-     │   │ signal + │      │
│  │ flight,  │──►│ denoise_quantum    │──►│ matching │   │ position │      │
│  │ noise,   │   │ (params + backend) │   │ filter   │   │ errors   │      │
│  │ INS      │   └────────────────────┘   └──────────┘   └──────────┘      │
│  └──────────┘              ▲                                               │
│                            │ QuantumBackend: aer_statevector | cache |     │
│                            │                 ionq_sim | ionq_qpu           │
│  pipeline.run(scenario, seed, qbackend) ──► RunArtifact (dataclass)        │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ Python function call
┌───────────────────────────────▼──────────────────────────────────────────┐
│ API  api/  (FastAPI, single process)                                       │
│  GET  /api/health                                                          │
│  GET  /api/scenarios                                                       │
│  GET  /api/runs/{id}          → full RunArtifact JSON (precomputed/cached) │
│  GET  /api/runs/live/stream   → SSE: meta event, N frame events, summary   │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ HTTP + SSE (Vite dev proxy /api)
┌───────────────────────────────▼──────────────────────────────────────────┐
│ WEB  web/  (React + Vite)                                                  │
│  FrameSource ── LiveSource (EventSource)  ─┐                               │
│              └─ ReplaySource (fetch /runs/*.json) ─┐ auto-fallback          │
│                                             ▼                              │
│  usePlayback (frame index, play/pause/speed, reduced-motion)              │
│      ├── MapView (heatmap, true path, est paths, drone icon, GPS jammed)   │
│      ├── SignalPanel (raw / classical / quantum vs clean, RMSE)            │
│      └── MetricsPanel (position error per method, provenance badge)        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation | Talks To |
|-----------|----------------|------------------------|----------|
| `magnav.sim.map` | Synthetic crustal anomaly grid in nT. Bilinear lookup `field_at(xy)` | Gaussian-filtered white noise plus a few Gaussian "dipole" blobs, scaled to about ±200–500 nT, with a fixed seed. Stored as `float32 (ny, nx)` plus metadata | flight, nav |
| `magnav.sim.flight` | True trajectory (waypoints → smooth path at fixed dt), true clean magnetometer trace, aux channels (motor current, throttle, attitude), and an **INS/odometry stream with drift** | numpy. INS = true velocity + bias + random walk, so dead reckoning visibly drifts once GPS is jammed | map, noise, nav |
| `magnav.sim.noise` | Drone self-noise: periodic motor/ESC harmonics, current-dependent offset (Tolles-Lawson-like linear terms in the aux channels), white noise | Pure function `raw = clean + noise(aux, rng)`. Also returns the noise components, for honest plots | flight |
| `magnav.denoise_classical` | Baseline: estimate noise from aux channels and subtract it | Linear regression on aux features (Tolles-Lawson-style) plus an optional low-pass or Kalman filter. Same interface as the quantum denoiser | metrics, nav |
| `magnav.denoise_quantum` | Quantum subroutine: windowed features → predicted noise correction | Small VQC (4–8 qubits, angle encoding plus a hardware-efficient ansatz), with a classical pre/post-processing head. `fit()` on Aer, `predict()` against a pluggable backend | backends, nav |
| `magnav.quantum_backends` | Hides where circuits run | `AerStatevector` (Estimator, exact), `CachedResults` (reads JSON), `IonQSim` / `IonQQPU` (qiskit-ionq, list-of-circuits job, counts → ⟨Z⟩) | denoise_quantum |
| `magnav.nav` | Cleaned trace + INS + map → estimated position track | Particle filter (about 500–2000 particles) with INS propagation and a map-likelihood update, **or** a TERCOM-style batch correlation over a sliding window. Run once per denoiser variant (raw / classical / quantum) | metrics |
| `magnav.metrics` | Signal RMSE vs clean, position error per step / mean / final, improvement ratios | Pure numpy, returns a dict | pipeline |
| `magnav.pipeline` | Orchestrates one run and builds the `RunArtifact`. Also yields frames for streaming | `run(scenario, seed, qbackend) -> RunArtifact`, plus `iter_frames(artifact)` | everything above |
| `magnav.schema` | Single source of truth for artifact / frame shape and version | Dataclasses + `to_json()`. A hand-mirrored TS type in `web/src/types.ts` | api, scripts, web |
| `api` | Thin HTTP layer only. No science lives here | FastAPI. `EventSourceResponse` from `fastapi.sse` (or `sse-starlette`) | pipeline, artifacts/ |
| `web` | Visualization and playback | React + Vite. Canvas/SVG map, a charting lib for the signals | api, static runs/ |
| `notebooks/qollab_magnav.ipynb` | Judge-facing runnable deliverable on Qollab: runs the pipeline end to end and shows plots + metrics + the IonQ run | Imports `magnav`, picks the backend via one variable | magnav |

---

## Recommended Project Structure

```
.
├── magnav/                       # core library: pure, importable, no web deps
│   ├── __init__.py
│   ├── config.py                 # Scenario dataclass (map size, dt, duration, noise levels, jam window, seed)
│   ├── schema.py                 # RunArtifact / Frame dataclasses + SCHEMA_VERSION + to_json()
│   ├── sim/
│   │   ├── map.py                # make_map(), field_at()
│   │   ├── flight.py             # make_flight() -> true xy, clean trace, aux, ins
│   │   └── noise.py              # add_drone_noise()
│   ├── denoise_classical.py      # ClassicalDenoiser.fit/predict
│   ├── denoise_quantum.py        # QuantumDenoiser.fit/predict, circuit builder, feature windowing
│   ├── quantum_backends.py       # AerStatevector | CachedResults | IonQSim | IonQQPU
│   ├── nav.py                    # ParticleFilterNavigator (or TERCOM)
│   ├── metrics.py
│   └── pipeline.py               # run(), iter_frames()
├── scripts/
│   ├── train_quantum.py          # Aer training -> artifacts/models/qdenoise_params.json
│   ├── run_quantum_remote.py     # IonQ sim / QPU batch -> artifacts/quantum_cache/*.json
│   └── precompute.py             # build RunArtifacts -> artifacts/runs + web/public/runs
├── artifacts/                    # COMMITTED to git (small JSON); the demo's safety net
│   ├── models/qdenoise_params.json
│   ├── quantum_cache/
│   └── runs/
├── api/
│   └── main.py                   # FastAPI app: health, scenarios, runs/{id}, live SSE
├── web/
│   ├── public/runs/              # copies of artifacts/runs/*.json (static replay)
│   ├── src/
│   │   ├── types.ts              # mirrors magnav/schema.py
│   │   ├── sources/              # LiveSource.ts, ReplaySource.ts, FrameSource.ts
│   │   ├── hooks/usePlayback.ts
│   │   ├── components/           # MapView, SignalPanel, MetricsPanel, Controls, ModeBadge
│   │   └── App.tsx
│   └── vite.config.ts            # proxy /api -> http://localhost:8000
├── notebooks/
│   └── qollab_magnav.ipynb       # Qollab-runnable entry point
├── run_pipeline.py               # CLI: python run_pipeline.py --backend aer|ionq_sim --scenario demo
├── tests/                        # a few shape/smoke tests (sim shapes, artifact round-trip)
├── pyproject.toml / requirements.txt
├── LICENSE (MIT)
└── README.md
```

### Structure Rationale

- **`magnav/` is pure and web-free.** The same code path serves the notebook (Qollab), the CLI, the precompute script, and the API. That one fact makes "runnable on Qollab" and "web demo" the same project rather than two.
- **`artifacts/` is committed.** Replay JSON, trained params and the quantum cache are small (hundreds of KB). Committing them means a fresh clone, a judge, or a logged-out browser on a static host can run the demo with no compute.
- **`scripts/` holds the slow or fragile steps** (training, remote quantum). They are never imported by `api/`.
- **`web/public/runs/` lets the frontend run with no backend at all.** It can be deployed as a static site (GitHub Pages / Netlify / Vercel) as the always-available public demo link.

---

## Data Shapes and Contracts

### In-memory (Python, numpy)

| Object | Shape / Type | Units | Notes |
|--------|--------------|-------|-------|
| `map.grid` | `float32 (ny, nx)`, e.g. 256×256 | nT | Plus `cell_m` (e.g. 20 m), `origin_xy` (0,0). Extent is about 5 km square |
| `t` | `float64 (N,)` | s | dt = 0.1 s (10 Hz), duration about 120 s gives N = 1200. Keep N small for quantum cost |
| `true_xy` | `float64 (N, 2)` | m | Map frame (east, north) |
| `ins_vel` | `float64 (N, 2)` | m/s | True velocity + bias + random walk (the drift source) |
| `aux` | `float64 (N, k)`, k ≈ 3–5 | mixed | motor current (A), throttle (0–1), heading/attitude terms |
| `clean` | `float64 (N,)` | nT | `field_at(true_xy)` (+ constant core field optional; prefer anomaly only) |
| `raw` | `float64 (N,)` | nT | `clean + noise` |
| `denoised[method]` | `float64 (N,)` | nT | method ∈ {raw, classical, quantum} |
| `est_xy[method]` | `float64 (N, 2)` | m | Navigator output per method. Also `dead_reckoning` as the no-mag baseline |
| `pos_err[method]` | `float64 (N,)` | m | ‖est − true‖ |
| `jam` | `(start_idx, end_idx)` | idx | GPS available before `start_idx`. The navigator is seeded with the GPS fix |

### Quantum denoiser I/O (windowed, batch)

- **Windowing:** split the raw trace into windows of W samples (e.g. W = 10 → 1 s), giving M = N/W ≈ 120 windows per run. Per window, compute a small feature vector (d = n_qubits, e.g. 4–6): mean current, throttle, the dominant-harmonic amplitude from FFT/Goertzel, raw residual vs a low-pass, and so on. Scale it to [0, π].
- **Circuit:** angle-encode d features → ansatz with θ (≈ 20–60 params) → measure ⟨Z⟩ on 1–2 qubits → a classical linear head maps that to a per-window noise correction (or to correction coefficients applied to the W samples).
- **Cost:** inference = M circuits per run (~120). Training happens only on Aer.
- **Cached result format** (`artifacts/quantum_cache/<run_id>_<backend>.json`):
  ```json
  {
    "run_id": "demo_s42", "backend": "ionq_simulator", "noise_model": "forte-1|null",
    "shots": 1024, "params_sha": "ab12...", "n_qubits": 6, "n_windows": 120,
    "job_ids": ["..."], "submitted_at": "...", "completed_at": "...",
    "expvals": [[0.12, -0.31], ...],          // (M, n_measured)
    "correction_nT": [3.1, -2.4, ...]         // (M,) after classical head
  }
  ```
  Store both raw expvals and post-processed values, so the head can be re-tuned without re-running remotely.

### RunArtifact JSON (backend → frontend; also the replay file)

Columnar layout: one array per series, which is compact and quick to parse. Round to 2 decimals. At N = 1200 this comes to about 150–300 KB.

```json
{
  "schema_version": 1,
  "run_id": "demo_s42",
  "scenario": "demo", "seed": 42,
  "created_at": "2026-10-10T18:00:00Z",
  "provenance": {
    "git_sha": "abc123",
    "quantum": { "backend": "ionq_simulator", "shots": 1024, "job_ids": ["..."],
                 "params_sha": "ab12...", "source": "cache|aer_live" },
    "hardware_result": { "backend": "qpu.forte-1", "job_id": "...", "n_circuits": 1,
                         "summary": "..." }
  },
  "map": {
    "nx": 256, "ny": 256, "cell_m": 20, "origin": [0, 0],
    "min_nT": -412.3, "max_nT": 388.9,
    "png_base64": "iVBORw0..."          // pre-rendered heatmap, accessible colormap (viridis/cividis)
  },
  "dt": 0.1, "n": 1200,
  "gps_jam": { "start_idx": 100, "end_idx": 1200 },
  "series": {
    "t": [...],
    "true_xy": [[x, y], ...],
    "signal": { "clean": [...], "raw": [...], "classical": [...], "quantum": [...] },
    "est_xy": { "dead_reckoning": [[...]], "raw": [[...]], "classical": [[...]], "quantum": [[...]] },
    "pos_err_m": { "dead_reckoning": [...], "raw": [...], "classical": [...], "quantum": [...] }
  },
  "metrics": {
    "signal_rmse_nT": { "raw": 41.2, "classical": 9.8, "quantum": 8.9 },
    "pos_err_m": {
      "mean":  { "dead_reckoning": 310, "raw": 180, "classical": 42, "quantum": 38 },
      "final": { "dead_reckoning": 620, "raw": 240, "classical": 35, "quantum": 31 }
    }
  }
}
```

The map goes over the wire as a **PNG** rather than a 65k-number grid. The frontend only draws it. The navigator never runs in the browser.

### Frame (SSE event payload; also produced by `ReplaySource` from the columnar artifact)

```json
{ "i": 412, "t": 41.2, "gps_jammed": true,
  "true_xy": [1823.4, 902.1],
  "signal": { "clean": 112.3, "raw": 151.0, "classical": 114.0, "quantum": 113.1 },
  "est_xy": { "dead_reckoning": [...], "raw": [...], "classical": [...], "quantum": [...] },
  "err_m":  { "dead_reckoning": 211.0, "raw": 96.2, "classical": 28.4, "quantum": 25.0 } }
```

SSE stream sequence: `event: meta` (everything in the artifact except `series`, i.e. map PNG, jam window, provenance) → N × `event: frame` → `event: summary` (metrics) → close. `ReplaySource` emits exactly the same sequence from the static file, at the same rate. **The player never knows which source it is reading.**

---

## Architectural Patterns

### Pattern 1: Artifact-first, source-agnostic playback

**What:** Define `RunArtifact` / `Frame` on day one. Every producer writes it: notebook, CLI, precompute, API. Every consumer reads it: web, notebook plots. The web has a `FrameSource` interface with two implementations.
**When to use:** Any demo that has a "live with fallback" requirement.
**Trade-offs:** The schema has to stay in sync between Python and TS by hand. Mitigate with `schema_version` and one round-trip test. In return, the fallback costs almost nothing and comes from the same code.

```typescript
// web/src/sources/FrameSource.ts
export interface FrameSource {
  start(handlers: { onMeta(m: RunMeta): void; onFrame(f: Frame): void;
                    onSummary(s: Metrics): void; onError(e: unknown): void }): void;
  stop(): void;
}
// App: try LiveSource with a 3 s first-event timeout; on error/timeout -> ReplaySource('/runs/demo_s42.json')
// UI shows a ModeBadge: "LIVE" or "REPLAY (precomputed)", which is honest and visible to judges.
```

### Pattern 2: Train offline, cache parameters, batch inference behind a backend interface

**What:** `QuantumDenoiser.fit()` runs only on Aer statevector (exact expectation values, fast gradients via parameter-shift or SPSA/COBYLA). The parameters go to JSON with a hash. `predict()` takes a `QuantumBackend` and submits **all M windows as one list of circuits** (qiskit-ionq accepts a list in `backend.run([...])`, one job). That avoids M separate queue round-trips.
**When to use:** Always. Per-window streaming calls to a remote simulator would put network and queue time on the critical path.
**Trade-offs:** Cached quantum outputs tie a specific run (scenario + seed) to a specific cache file. Live mode on a *new* seed must fall back to Aer statevector for the quantum leg, and the badge has to say so (`quantum.source: "aer_live"`).

```python
# magnav/quantum_backends.py
class QuantumBackend(Protocol):
    name: str
    def expvals(self, circuits: list[QuantumCircuit], observables) -> np.ndarray: ...  # (M, k)

class AerStatevector:   # Estimator on statevector; exact; ms per circuit; used for training + live
class CachedResults:    # loads artifacts/quantum_cache/<run_id>_<backend>.json; zero compute
class IonQBackend:      # qiskit_ionq.IonQProvider().get_backend("simulator" | "qpu.forte-1")
                        # transpile(optimization_level=1), add measurements, run(list, shots),
                        # counts -> <Z>; write cache with job_ids
```

### Pattern 3: Compute-then-pace streaming (the live path is cheap and deterministic)

**What:** The live endpoint runs `pipeline.run()` fully in-process first (sim + classical + nav + quantum via cache/Aer, about 1–5 s), then **paces** frames out over SSE at playback speed (e.g. 20–30 fps, with a speed multiplier). It does not compute step by step in lockstep with the stream.
**When to use:** Demos where "live" means "computed now, not pre-recorded," not real-time sensor ingest.
**Trade-offs:** A short startup delay, which a "Computing run..." spinner covers. In exchange, frame pacing has no jitter, a failure surfaces *before* streaming starts (clean fallback point), and the stream is byte-identical to replay.

```python
# api/main.py
from fastapi import FastAPI
from fastapi.sse import EventSourceResponse, ServerSentEvent   # or sse_starlette
app = FastAPI()

@app.get("/api/runs/live/stream", response_class=EventSourceResponse)
async def live(scenario: str = "demo", seed: int = 42, speed: float = 1.0):
    art = await run_in_threadpool(pipeline.run, scenario, seed, qbackend="cache_or_aer")
    yield ServerSentEvent(event="meta", data=art.meta_json())
    for f in pipeline.iter_frames(art):
        yield ServerSentEvent(event="frame", data=f)
        await asyncio.sleep(art.dt / speed)
    yield ServerSentEvent(event="summary", data=art.metrics)
```

### Pattern 4: One library, three entry points (Qollab-runnable + web)

**What:** `magnav` is the product. The entry points are thin:
1. `notebooks/qollab_magnav.ipynb`: the Qollab deliverable. Cells: setup → generate map/flight/noise (plots) → classical baseline → quantum denoiser (load params; `BACKEND = "ionq_sim"` runs on the Qollab IonQ simulator, `"aer"` locally) → navigation → metrics table + matplotlib map of true vs estimated paths → "hardware result" cell showing the captured QPU job.
2. `run_pipeline.py`: the same thing as a CLI, which also writes the RunArtifact.
3. `api/main.py` + `web/`: the visual demo.

**Trade-offs:** If Qollab cannot `pip install -e .` or read a local package, the notebook needs a fallback. Either add `sys.path.insert(0, "..")`, or, worst case, generate a single-file `magnav_bundle.py` that the notebook `%run`s. **Verify the Qollab runtime in the first 2 hours** (see Gaps).

---

## Data Flow

### Offline flow (before the demo; rerunnable)

```
Scenario(seed) ─► sim.map ─► sim.flight ─► sim.noise ─► (raw, aux, ins, clean, true_xy)
                                                         │
             train split (different seeds/scenarios) ────┤
                                                         ▼
                         train_quantum.py (Aer) ─► qdenoise_params.json
                         ClassicalDenoiser.fit  ─► (fit inline, cheap; no file needed)
                                                         │
          demo run (seed 42) windows ─► run_quantum_remote.py ─► IonQ simulator (Qollab)
                                                         └─► quantum_cache/demo_s42_ionq_sim.json
                                                         │
                         precompute.py ─► pipeline.run(qbackend=CachedResults)
                                       ─► artifacts/runs/demo_s42.json ─► web/public/runs/
```

Train on seeds that are **disjoint** from the demo seed, or the quantum and classical comparison is invalid. The classical baseline must be fit on the same training data under the same rules.

### Live demo flow

```
[Click "Fly (GPS jammed at t=10s)"]
    ↓
LiveSource ── GET /api/runs/live/stream?scenario=demo&seed=42 ──► FastAPI
    │                                                         pipeline.run (in-process)
    │                                                           quantum leg: CachedResults if
    │                                                           cache exists for run_id,
    │                                                           else AerStatevector
    │  ◄── meta, frame×N, summary (SSE) ─────────────────────────┘
    ↓   (error / no first event within 3 s)
ReplaySource ── fetch /runs/demo_s42.json ── same events, same pacing
    ↓
usePlayback ─► MapView / SignalPanel / MetricsPanel
```

### State Management (web)

```
FrameSource ─(onMeta/onFrame/onSummary)─► useReducer store
   { mode: 'live'|'replay', meta, frames: Frame[], cursor, playing, speed, metrics }
        ↓ subscribe
MapView (frames[0..cursor]) · SignalPanel (window around cursor) · MetricsPanel (metrics + err at cursor)
Controls ─► dispatch(play | pause | seek | speed)   // keyboard accessible; reduced-motion => jump to end / step mode
```

Buffer all frames on the client, so seek and replay work after the stream ends. React state is enough. No Redux or Zustand needed.

### Key Data Flows

1. **Quantum flow:** features (M, d) → circuits (M) → expvals (M, k) → classical head → correction (M,) → upsample to (N,) → `signal.quantum`. On the demo critical path this is a JSON read or millisecond Aer statevector, never a network call.
2. **Navigation flow:** for each method, `nav.run(denoised[method], ins_vel, map, gps_fix_at_jam_start)` → `est_xy[method]`. Running it 4 times (dead_reckoning, raw, classical, quantum) on 1200 steps with a vectorized particle filter takes seconds.
3. **Evidence flow:** remote job IDs and backend names travel `quantum_cache` → `RunArtifact.provenance` → UI badge + README. That gives a judge a traceable claim that the circuit ran on IonQ.

---

## Transport Decision: SSE (recommended) vs WebSocket vs Polling

| Criterion | SSE | WebSocket | Polling / single fetch |
|-----------|-----|-----------|------------------------|
| Direction needed | Server → client only. **Matches the need** | Bidirectional (unneeded) | Client pulls |
| Browser API | `EventSource`, built in, auto-reconnect | `WebSocket`, manual reconnect | `fetch` |
| FastAPI support | `fastapi.sse.EventSourceResponse` (newer FastAPI; version unverified) or `sse-starlette` | Native `@app.websocket` | Trivial |
| Vite proxy / static hosting | Plain HTTP, proxies cleanly | Needs `ws: true` in the proxy | Works everywhere |
| Fallback similarity | Event stream ≈ replay event stream | Same | The replay *is* this |

**Recommendation:** SSE for live, with controls (scenario, seed, speed) passed as query params. A new run means opening a new stream. Use WebSocket only if mid-flight interactive control becomes a requirement (e.g. "jam GPS now" button). Even then, the cheaper fix is to restart the stream with new params. Single fetch plus client-side pacing is the replay path, and it is also the **first thing to build** (see build order).

---

## Keeping Quantum Off the Critical Path (checklist)

1. Training happens **only** in `scripts/train_quantum.py` on Aer. `api/` never imports training code.
2. Remote IonQ calls happen **only** in `scripts/run_quantum_remote.py` and the notebook. `api/` never imports `qiskit_ionq`. Enforce this with a simple grep test.
3. The live endpoint's quantum leg is `CachedResults` → `AerStatevector`, in that order, with the source labeled in provenance.
4. Precomputed `RunArtifact` JSON for the demo seed(s) is committed and also copied into `web/public/runs/`.
5. The frontend auto-falls back to replay on any live error or timeout, and can be forced into replay with `?mode=replay` (use that during the judged demo if the network is shaky).
6. The static web build can be deployed with no backend, so a public demo link always works.
7. Submit the one QPU job **early** (the queue). Store its result as a separate small JSON (`artifacts/quantum_cache/hardware_<date>.json`) and display it as a captured result, not live.

---

## Suggested Build Order (40-hour solo, vertical slice first)

Start at about H0 = Oct 9, 11 PM PDT. Deadline = Oct 11, 4 PM PDT (about 41 wall hours including sleep, so plan about 32–34 working hours plus buffer).

| # | Hours | Phase | Output / exit criterion | Depends on |
|---|-------|-------|--------------------------|------------|
| 0 | H0–H1.5 | **Scaffold + contracts + Qollab smoke test** | Repo layout, `schema.py` + `types.ts` v1, MIT license, attribution line. **A 30-min spike: a 2-qubit Qiskit circuit runs on the Qollab IonQ simulator and on local Aer.** Learn how Qollab runs/publishes projects | none |
| 1 | H1.5–H8 | **Vertical slice: ugly but end to end** | `sim` (map, simple flight, simple noise, INS drift), `denoise_classical` = low-pass, `denoise_quantum` = **identity stub with the real interface**, `nav` = simplest workable (sliding-window correlation or a basic PF), `metrics`, `precompute.py` writes `demo_s42.json`. Web: `ReplaySource` + MapView (heatmap PNG, true vs est path, drone icon) + SignalPanel. **Exit: open the browser and watch a replay with no backend running.** The fallback now exists | 0 |
| 2 | H8–H13 | **Real classical baseline + navigation that works** | Tolles-Lawson-style regression on aux channels. Nav tuned until classical-cleaned clearly beats raw and dead reckoning on position error. Metrics panel. **This is the scientific floor: the demo is valid even if quantum fails** | 1 |
| 3 | H13–H22 | **Quantum denoiser (Aer)** | Windowing + features, VQC, training script, params JSON, `AerStatevector` backend, swap out the stub. Compare against classical on held-out seeds. Honest result either way. Try a hybrid "classical + quantum residual" variant if the pure VQC underperforms | 2 |
| 4 | H22–H25 | **IonQ simulator run + hardware submission + Qollab notebook** | `IonQBackend`, batch job for the demo run's windows → cache with job IDs. Submit the 1 QPU circuit/eval now (queue). Notebook runs end to end with `BACKEND="ionq_sim"`. Re-run `precompute.py` with `CachedResults` | 3, 0 |
| 5 | H25–H29 | **Live path** | FastAPI + SSE, `LiveSource`, auto-fallback + ModeBadge, Vite proxy. Live run of a new seed uses Aer for quantum | 1 (could move earlier; deliberately after the science) |
| 6 | H29–H33 | **Polish + accessibility + hardware result** | Keyboard controls, ARIA labels, contrast-safe colormap, `prefers-reduced-motion`, text alternatives for the charts (metrics table). Show the captured QPU result in UI + notebook | 4, 5 |
| 7 | H33–H38 | **Docs + publish + video** | README (what/why/how-to-run/replicate/extend, per-criterion summary, AI/library disclosure, honest AQNav framing), publish on Qollab, static deploy of web, logged-out test, demo video | all |
| — | H38–H41 | **Buffer** | Slippage absorbs here. Never schedule features into it | none |

**Ordering rationale:**
- **Replay before live.** The fallback is the first thing built, so a demo exists from about H8 onward. Live streaming is a thin layer added later over a working artifact.
- **Classical before quantum.** The theme requires a strong baseline, the quantum comparison is meaningless without one, and the classical pipeline (sim → nav → metrics) is what makes the map demo work at all.
- **The quantum stub has its final interface in Phase 1,** so Phase 3 is a drop-in replacement and does not ripple through nav, metrics, schema, or web.
- **The Qollab/IonQ smoke test is in Phase 0, not Phase 4.** Platform access is the highest-uncertainty external dependency. Find out on hour 1, not hour 22.
- **QPU submission happens in Phase 4,** about 15 hours before the deadline, which leaves room for queue delays.

**Cut lines if behind schedule (in order):** drop live SSE (replay-only web is acceptable: the project's own constraint says the demo must not depend on live compute) → drop the QPU result (keep the IonQ simulator, which is required) → simplify nav to TERCOM batch correlation → reduce the quantum model to a quantum-kernel / single small VQC on fewer windows. **Never cut:** the classical baseline, the IonQ simulator run, the README, the MIT license and attribution.

---

## Scaling Considerations

This is a single-user demo. Ignore scale beyond these:

| Concern | Reality | Approach |
|---------|---------|----------|
| Quantum circuit count | M windows × shots per run. The remote simulator is shared across the hackathon | Keep M ≈ 100–200 and qubits ≤ 8. Use one list-of-circuits job. Never per-sample circuits |
| Artifact size | N = 1200 × ~20 values ≈ 200 KB | Columnar + rounding. A PNG for the map. Fine for static hosting |
| Particle filter runtime | 4 methods × 1200 steps × ~1000 particles | Vectorize with numpy. If slow, use fewer particles or the TERCOM fallback |
| Concurrent viewers | Judges and the presenter only | Single uvicorn process. The static replay deploy handles any public traffic |

### Bottlenecks in order

1. **Remote quantum queue:** mitigated by offline batching and caching.
2. **Nav filter tuning time** (a human bottleneck, not compute): mitigated by building nav in the vertical slice and tuning it in Phase 2 before quantum work.

---

## Anti-Patterns

### Anti-Pattern 1: Calling the quantum backend inside the request/stream loop
**What people do:** Evaluate the VQC per frame inside the streaming endpoint, against the IonQ simulator.
**Why it's wrong:** Network latency and shared queue time land on the stage demo, and one hiccup freezes the drone.
**Do this instead:** Batch offline, cache with provenance, live = cache or Aer statevector.

### Anti-Pattern 2: Separate code paths for "live" and "replay" visuals
**What people do:** Build a live WebSocket view, then later a different "fallback video/GIF" or a separate replay component.
**Why it's wrong:** Double the UI work, and the fallback drifts from the live view and goes untested.
**Do this instead:** One player and one frame schema. Two `FrameSource` implementations.

### Anti-Pattern 3: Science logic in the API layer or notebook
**What people do:** Write the simulation and denoising in notebook cells, then copy-paste into FastAPI handlers.
**Why it's wrong:** Two diverging implementations, so the Qollab notebook and web demo show different numbers. That undermines Technical Execution.
**Do this instead:** All logic lives in `magnav/`. The notebook and API only call `pipeline.run()`.

### Anti-Pattern 4: Training and evaluating on the same flight
**What people do:** Fit the VQC (and classical regression) on the demo flight, then report its error on the same flight.
**Why it's wrong:** It is leakage, the numbers are inflated, and a knowledgeable judge will catch it.
**Do this instead:** Train on seeds that are disjoint from the demo seed. State the split in the README.

### Anti-Pattern 5: Building the frontend against a not-yet-defined API
**What people do:** Start React components with guessed data, then rework them once the backend exists.
**Why it's wrong:** Rework at hour 30.
**Do this instead:** Schema v1 at hour 1. The first frontend consumes a real (if crude) `demo_s42.json` produced by real Python.

### Anti-Pattern 6: No INS/odometry model in the simulator
**What people do:** Simulate only the magnetometer, then "navigate" by searching the whole map per sample.
**Why it's wrong:** Map matching on a scalar field is ambiguous without motion constraints. The results look random, and there is no GPS-jammed drift story to contrast against.
**Do this instead:** Simulate drifting INS velocity. Nav = INS propagation + magnetic likelihood correction. Show the dead-reckoning-only track as the "what happens without MagNav" baseline.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| IonQ cloud simulator (via Qollab) | `qiskit_ionq.IonQProvider().get_backend("simulator")`, `backend.run([circuits], shots=N)`, `job.get_counts(circuit)` | Include explicit measurements. Transpile with `optimization_level` 0–1 (Qiskit ≥1.3 defaults to 2). Optional `set_options(noise_model="forte-1")` for a noisy-sim comparison. qiskit-ionq ≥1.0 targets Qiskit 2.x. Save `job.job_id()`, and retrieve with `backend.retrieve_job(id)` if the session dies. **How Qollab supplies credentials (env var vs pre-configured provider) is unverified.** |
| IonQ QPU (`qpu.forte-1` or as Qollab exposes) | Same provider, one small job | Run once, early. Store counts + job ID as a static artifact |
| Qiskit Aer | `qiskit_aer` Estimator / statevector | Used for training and the live quantum leg. Exact expvals, no shot noise |
| Qollab.xyz | Publish the notebook + repo link | Runtime/publishing mechanics unknown. Phase 0 spike |
| Static host (GitHub Pages / Netlify / Vercel) | `vite build` with `base` set; serves `public/runs/*.json` | Backend-free public demo link for judges |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| sim → denoisers / nav | Direct function call, numpy arrays | Pure functions, everything seeded |
| denoise_quantum ↔ quantum_backends | `QuantumBackend` protocol | Lets Aer / cache / IonQ swap with no other change |
| pipeline → api | Direct call in a threadpool | The API holds no science |
| api → web | HTTP JSON + SSE, `schema_version` checked | The web refuses or warns on a version mismatch |
| scripts → artifacts → api/web | Files (JSON) | The decoupling that keeps quantum off the critical path |
| notebook → magnav | Import | Same numbers as the web demo, by construction |

---

## Gaps / Open Questions

- **Qollab.xyz runtime and publishing model (LOW confidence):** the public site exposes no docs about hosted notebooks, package installation, or how IonQ simulator credentials are injected. PROJECT.md says the Qollab account *is* the simulator access. Resolve in Phase 0 by checking the participant docs and mentor Slack. If Qollab only hosts a notebook, the notebook becomes the primary "runnable" artifact and the web demo is linked from the static deploy plus the repo.
- **IonQ simulator throughput and limits for list-of-circuits jobs:** the IonQ docs do not state a batch size limit. If ~120 circuits per job is rejected or slow, chunk into jobs of 20–50 and/or reduce M.
- **QPU name and access through Qollab** (`qpu.forte-1` vs another): confirm during Phase 4.
- **Version for native `fastapi.sse`:** one secondary source says FastAPI 0.135.0. Unverified. Use `sse-starlette` if the installed FastAPI lacks `fastapi.sse`.
- **Quantum model choice** (VQC regression vs quantum-kernel ridge regression): this is an ML-design question for STACK/FEATURES. Architecturally, a kernel method needs M × N_train kernel circuits at inference, which is much more remote-simulator load. **Prefer the VQC** for the remote run unless the kernel training set is tiny (≤ 30 points).

## Sources

- IonQ Qiskit SDK docs (provider, backends, noise models, list-of-circuits jobs, retrieve_job, transpile guidance): https://docs.ionq.com/sdks/qiskit/index (HIGH)
- qiskit-ionq on PyPI: https://pypi.org/project/qiskit-ionq (HIGH)
- FastAPI WebSockets: https://fastapi.tiangolo.com/advanced/websockets/ (HIGH)
- FastAPI SSE reference (`fastapi.sse.EventSourceResponse`, `ServerSentEvent`): https://fastapi.tiangolo.com/reference/sse/ (HIGH for existence; version LOW)
- sse-starlette (fallback SSE lib): https://simple-repository.app.cern.ch/project/sse-starlette (MEDIUM)
- Qollab.xyz landing page (no technical docs found): https://qollab.xyz (LOW)
- Project context: .planning/PROJECT.md
- MagNav domain patterns (Tolles-Lawson compensation, INS + map-matching filters, TERCOM-style correlation): training knowledge, MEDIUM. Validate in the STACK/FEATURES research

---
*Architecture research for: hybrid quantum/classical MagNav hackathon demo*
*Researched: 2026-10-09*

---
phase: 03-frontend-vertical-slice
plan: 01
subsystem: python-live-api
tags: [d-13, d-14, d-15, d-16, ui-01, ui-05, live-mode, chunking, artifact-json]
requires:
  - "02-03: RunArtifact v1 (magnav.artifact), run_pipeline, data/precomputed_run.json"
provides:
  - "magnav.nav.tercom_steps (resumable TERCOM generator; tercom drains it)"
  - "magnav.artifact.line_entry (one lines[i] entry, shared by build_run_artifact and live)"
  - "magnav.pipeline select_and_build / fit_sensor / prepare_line / score_result / line_out"
  - "magnav.live: start / step / skip / result / cancel / run_line chunked state machine"
  - "magnav.api: artifact_json, live_start, live_step, live_skip, live_result, live_cancel (JSON strings, never raise)"
affects: [03-02, 03-03, 03-04]
tech-stack:
  added: []
  patterns:
    - "Long Python work exposed to JS as a resumable generator plus a budget_ms step call"
    - "Live output assembled with the pipeline's own helpers, so equality with the precomputed artifact holds by construction"
key-files:
  created:
    - magnav/live.py
    - tests/test_live.py
  modified:
    - magnav/nav.py
    - magnav/artifact.py
    - magnav/pipeline.py
    - magnav/api.py
    - tests/test_nav.py
decisions:
  - "prepare_line raises ValueError (not KeyError) for an unknown line id; run_pipeline's committed output is unaffected"
  - "Stage-2 fits run all of LIVE_FIT even when raw/lowpass are skipped (fits cost about 0 s), so the stage-2 call sequence is fixed: select, raw, lowpass, tl, quantum"
  - "The step call that finishes the last fit is not a separate call: the call after the last fit creates the generators and immediately advances TERCOM within its budget"
  - "During stage 2 per_denoiser is {} and denoiser is null; when done, denoiser is null and windows_done == windows_total"
  - "live_result failure reports stage 4 when a run exists (not finished), else null"
metrics:
  duration: "7 min"
  completed: 2026-10-10
  tasks: 2
  files: 7
---

# Phase 3 Plan 01: Python live API and artifact_json Summary

JS can now get the precomputed RunArtifact as text through `api.artifact_json`, and can drive a chunked live run of one held-out line x one sensor (`live_start` -> `live_step`* -> `live_result`). The live result is an artifact `lines[i]` entry whose TL numbers equal the committed artifact's for 1003.02 / mag_5_uc. No path calls `backend.run`.

## What was built

**Task 1 (refactor, `0c62c74`).** The `tercom` body moved verbatim into the generator `tercom_steps`, which yields the number of windows done after each window. `tercom` keeps its signature and drains the generator. `line_entry(line_id, L)` was extracted from `build_run_artifact`. The per-line block of `run_pipeline` was split into `select_and_build`, `fit_sensor`, `prepare_line`, `score_result` and `line_out`. A full `uv run python main.py` (99 s on this machine) printed ACCEPTANCE 7/7 PASS. `git diff --exit-code data/precomputed_run.json` then exited 0, so the artifact is byte-identical, and the `results/*.png` files were also unchanged.

**Task 2 (feat, `6ef614f`).** `magnav/live.py` is a module-state machine. `start` checks `line_id in HELD_OUT` and `sensor in SENSORS` before any file access, then raises the simulated failure if one was requested, then loads the data. In stage 2, the first `step` call runs only `select_and_build`. Each of the next 4 calls fits one denoiser, in the order raw, lowpass, tl, quantum. Stage 3 advances one `tercom_steps` generator per non-skipped entry of `("tl","raw","lowpass")` until `budget_ms` is used up. A generator for `quantum` is added only if its cleaned signal differs from TL's (Phase 4). `result` reuses TL's NavResult for the stub quantum and builds the entry with `score_result` -> `line_out` -> `line_entry` -> `_clean`. The `api.live_*` wrappers import `live` lazily and ignore `backend`. They coerce and clamp the budget to 50-2000 ms and catch every exception into `{"ok":false,"stage","error_type","error"[:2000]}`.

## Measured costs (CPython 3.13, Apple Silicon)

| Measurement | Value |
|---|---|
| tl-only live run 1003.02/mag_5_uc (start, skip raw+lowpass, step(10000) until done, result) | **3.43 s** wall, 7 `live_step` calls |
| tl + raw live run (lowpass skipped), budget 250 ms | 7.04 s total, 31 `live_step` calls |
| TERCOM speed | ~11.5 ms/window (278 windows in ~3.2 s); RESEARCH had measured 19.8 ms/window |
| max per-call: `live_start` | **10 ms** |
| max per-call: stage-2 `live_step` (select or one fit) | **52 ms** |
| max per-call: stage-3 `live_step` (budget 250) | **261 ms** (13 stage-3 calls, tl only) |
| max per-call: `live_result` | **19 ms** |

Source: `uv run pytest -q -s tests/test_live.py` (`[live]` lines). Pyodide will be slower by an unknown factor. Record the real numbers in the Qollab probe (Plan 04).

## Exact JSON shapes (Plan 02's dev stub mirrors these)

```
live_start  -> {"ok":true,"stage":1,"line":"1003.02","sensor":"mag_5_uc","windows_total":278,"order":["tl","raw","lowpass"]}
live_skip   -> {"ok":true,"skipped":["lowpass"]}
live_step (stage 2, first call) ->
  {"ok":true,"stage":2,"fitting":"select","fits_done":1,"fits_total":5,"denoiser":null,"windows_done":0,
   "windows_total":278,"per_denoiser":{},"elapsed_s":0.071,"done":false,"skipped":["lowpass"]}
live_step (stage 2, fit calls) -> same with "fitting":"raw"|"lowpass"|"tl"|"quantum", fits_done 2..5
live_step (stage 3) ->
  {"ok":true,"stage":3,"fitting":null,"fits_done":5,"fits_total":5,"denoiser":"tl","windows_done":22,
   "windows_total":278,"per_denoiser":{"tl":[22,278],"raw":[0,278]},"elapsed_s":0.337,"done":false,"skipped":["lowpass"]}
live_step (final) ->
  {"ok":true,"stage":3,"fitting":null,"fits_done":5,"fits_total":5,"denoiser":null,"windows_done":278,
   "windows_total":278,"per_denoiser":{"tl":[278,278],"raw":[278,278]},"elapsed_s":6.494,"done":true,"skipped":["lowpass"]}
live_result ->
  {"ok":true,"line_id":"1003.02","sensor":"mag_5_uc","computed":["raw","tl","quantum"],"skipped":["lowpass"],
   "elapsed_s":6.512,"line":{line,map_file,frame,map_preview,jam,metric_start_index,t,truth,dead_reckoning,
   estimates:{"mag_5_uc":{raw,tl,quantum}},metrics:{"dead_reckoning":{...},"mag_5_uc":{raw,tl,quantum}}}}
live_cancel -> {"ok":true}
failure     -> {"ok": false, "stage": 1|2|3|4|null, "error_type": "ValueError"|"RuntimeError"|..., "error": "..."}
artifact_json -> '{"ok":true,"artifact":<file text>}'  |  {"ok": false, "error_type": ..., "error": ...}
```

Notes for JS:
- `computed` is in artifact DENOISERS order (raw, lowpass, tl, quantum), minus skipped entries.
- The order of the `per_denoiser` keys is the TERCOM run order (tl first).
- Success strings use compact separators. Failure strings use default `json.dumps` spacing. Both parse the same way.
- `live_result` clears the run, so a second call returns `ok:false` with RuntimeError.

## Tests

- `tests/test_nav.py`: `test_tercom_steps_matches_tercom` and `test_tercom_steps_yield_count`.
- `tests/test_live.py` (19 tests):
  - artifact_json with a spy backend (`calls == 0`)
  - tl equivalence with the committed artifact: x, y, signal_nT, window_t, ncc, accepted, the tl and dead_reckoning metrics, t/truth/dead_reckoning/jam/metric_start_index/map_preview/frame/map_file, and quantum == tl
  - no `backend.run` across the whole live sequence
  - 4 allowlist rejections, including `../x`
  - simulated failure
  - step, result and skip without a run
  - 4 bad budgets
  - clamping (1 -> 50, 999999 -> 2000)
  - tl and quantum are not skippable
  - result before done
  - stage-2 ordering plus per-call cost
  - skip after finish is rejected
  - AST guard: no `<backend>.run` in live.py
- Full suite: 132 passed. `ruff check` is clean.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Acceptance grep matched a docstring**
- **Found during:** Task 2
- **Issue:** The live.py module docstring said "never calls backend.run", so `grep -v '^\s*#' magnav/live.py | grep -c "backend.run"` returned 1, not 0.
- **Fix:** Reworded it to "never submits a quantum job (D-16)".
- **Files modified:** magnav/live.py
- **Commit:** 6ef614f

**2. [Rule 3 - Blocking] ruff S110 on live_cancel's try/except/pass**
- **Fix:** `# noqa: BLE001, S110` with a reason. live_cancel must always return ok.
- **Commit:** 6ef614f

Additional tests beyond the plan's list: quantum is not skippable, result before done fails, skip after finish is rejected, and an extra `("../x", sensor)` allowlist case.

## Known Stubs

None introduced. The live quantum estimate is a copy of TL because the Phase 2 quantum slot is still the zero-correction stub. Phase 4 replaces it, and `_create_generators` then adds a quantum TERCOM generator automatically.

## Self-Check: PASSED

- FOUND: magnav/live.py, tests/test_live.py, magnav/nav.py (`def tercom_steps(`), magnav/artifact.py (`def line_entry(`)
- FOUND commits: 0c62c74, 6ef614f
- data/precomputed_run.json: `git diff --exit-code` exit 0

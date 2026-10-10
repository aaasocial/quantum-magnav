---
phase: 03
reviewed: 2026-10-10T18:00:00Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - magnav/live.py
  - magnav/api.py
  - magnav/nav.py
  - magnav/pipeline.py
  - magnav/artifact.py
  - scripts/package_qollab.sh
  - tests/test_live.py
  - tests/test_compliance.py
  - tests/test_qollab_contract.py
  - tests/test_web_lib.py
  - web/package.json
  - web/vite.config.js
  - web/src/App.jsx
  - web/src/main.jsx
  - web/src/bridge.js
  - web/src/probe.js
  - web/src/theme.js
  - web/src/app.css
  - web/src/components/MapView.jsx
  - web/src/components/ControlBar.jsx
  - web/src/components/StatusStrip.jsx
  - web/src/components/SignalPanel.jsx
  - web/src/components/MetricsTable.jsx
  - web/src/components/TextAlternatives.jsx
  - web/src/components/JamBanner.jsx
  - web/src/components/Announcer.jsx
  - web/src/hooks/usePlayback.js
  - web/src/hooks/useArtifact.js
  - web/src/hooks/useLiveRun.js
  - web/src/hooks/useReducedMotion.js
  - web/src/lib/artifact.js
  - web/src/lib/playback.js
  - web/src/lib/colormap.js
  - web/src/lib/geo.js
  - web/src/lib/signal.js
  - web/src/lib/liveRun.js
  - web/src/lib/liveRun.test.js
  - web/src/lib/announce.js
  - web/src/lib/format.js
  - web/src/dev/magnavApiStub.js
findings:
  critical: 1
  warning: 6
  info: 10
  total: 17
status: fixed
---

# Phase 03: Code Review Report

**Reviewed:** 2026-10-10
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

I reviewed the Phase 3 vertical slice: the chunked Python live API (`magnav/live.py`, `api.live_*`, `nav.tercom_steps`), the JS live driver and bridge, the playback store, the map, signal and text-alternative components, the announcer, and the bundle and packaging gates. I also checked the built `main.js`.

Several things hold up:
- The allowlist check runs before any file access, and `live.py` never calls `backend.run`.
- The bridge queue cannot deadlock on a rejected promise: `chain = p.catch(() => {})`.
- The double-start guard is synchronous.
- A stale result cannot overwrite another line or sensor. The selects are locked during a run, and `liveOverride` is keyed by `runLine`/`runSensor`.
- The heatmap is not redrawn every frame, and HiDPI scaling and the y-flip are correct.
- There is exactly one first-party `aria-live` region, and both charts set `accessibilityLayer={false}`.
- The bundle has no exports, no artifact copy and no `innerHTML`.

**One BLOCKER:** the 80 s "skip raw/lowpass for time" safety mechanism can't trigger in real runs. Python's chunking moves into the next denoiser within the same call, and the JS rule "a running denoiser is never skipped" then always applies. The node tests pass only because their fake Python never does that. The warnings cover End run during a live run, focus loss when controls disable themselves, a negative frame delta in the playback clock, a misleading progress counter, calls that the 90 s deadline cannot bound, and bundled third-party code that calls Qollab's injected `setTimeout`.

## Critical Issues

### CR-01: The skip-for-time logic is dead code against the real Python driver (raw and lowpass are never skipped)

**File:** `magnav/live.py:140-153`, `web/src/lib/liveRun.js:74-88` (line 80), `web/src/lib/liveRun.test.js:44-50`
**Issue:** `_advance` keeps looping until the time budget runs out. When a generator raises `StopIteration`, it sets `current += 1` and goes straight on to call `next()` on the *next* denoiser in the same `live_step` call:

```python
except StopIteration as stop:
    ...
    st["current"] += 1
if time.perf_counter() >= deadline:   # only breaks on time, not at a denoiser boundary
    break
```

TL's last `yield` reports `windows_done == total`, but its `StopIteration` comes on the next `next()`. That call happens inside the same chunk, and raw then advances for the rest of the 250 ms budget. So the first `per_denoiser` in which JS sees `tl[0] >= tl[1]` almost always also shows `raw[0] > 0`. `runLive` then hits `if (p[0] > 0) break; // running` and never evaluates the projection for raw. The same thing happens for lowpass once raw finishes. In practice neither denoiser is ever skipped, so the D-14 guarantee does not hold. A run where TL finishes at, say, 60 s keeps computing raw and lowpass, hits the 90 s Timeout, and throws away the finished hero TL result.

The node tests don't catch this because `makeSim` advances only one denoiser per step (`const cur = s.order.find(...)`, lines 44-50), which is not how Python behaves. Note that Python's `skip()` already accepts a running denoiser.

**Fix:** end the chunk at every denoiser boundary, so JS always gets to decide before the next denoiser starts:

```python
def _advance(st, deadline):
    while st["current"] < len(st["run_order"]):
        name = st["run_order"][st["current"]]
        try:
            st["progress"][name] = next(st["gens"][name])
        except StopIteration as stop:
            st["navs"][name] = stop.value
            st["progress"][name] = len(stop.value.window_end)
            del st["gens"][name]
            st["current"] += 1
            break  # hand control back to JS at each denoiser boundary (skip decision)
        if time.perf_counter() >= deadline:
            break
    if st["current"] >= len(st["run_order"]):
        st["phase"] = "done"
```

Then make `makeSim` reproduce the Python spill-over, or add a Python test: start, step until `per_denoiser["tl"]` is complete, and assert `per_denoiser["raw"][0] == 0`. Alternatively, let JS skip a running denoiser by projecting the time it has left, `tlMs * (1 - p[0]/p[1])`.

## Warnings

### WR-01: End run during a live run is not handled

**File:** `web/src/App.jsx:161-167`, `web/src/App.jsx:247-287`, `web/src/components/StatusStrip.jsx:71`
**Issue:** End run stays enabled while a live run is in flight. `endRun` resolves `runDone`, so `main.jsx` finishes its top-level await and Qollab treats the run as over, while Python calls are still queued. When the run then completes, `onRunLive` overwrites the "This run has ended…" status with "Live run finished…", sets the badge to "computed in-page" and announces it. If Qollab tears down Pyodide, the run instead shows a "Live run failed" danger notice after the user has ended the run. `liveRunFlag` and `_STATE` are never cleaned up either.
**Fix:** Disable End run while `live.inFlight`, or make `onRunLive` check `endedRef.current` after the `await` and return without touching mode, status or announcements:

```js
res = await live.start(...);
...
if (endedRef.current) return; // run ended while computing: leave the ended state alone
```

### WR-02: Keyboard focus is lost when "Run live in-page" disables itself

**File:** `web/src/components/ControlBar.jsx:189-196`, `web/src/App.jsx:322`
**Issue:** Activating the button sets `live.inFlight`, and `disabled={!live.enabled}` then disables the focused element. Chrome moves focus to `<body>`, so a keyboard or screen-reader user loses their place (WCAG 2.4.3). The Flight line and Sensor selects have the same problem through `selectionLocked`. When the run finishes, focus is not restored.
**Fix:** Keep the button focusable and block activation instead: `aria-disabled={!live.enabled}`, with `onClick` returning early when it is not enabled. Or save `document.activeElement` before the run and restore focus to the button in a `finally` once `live.inFlight` returns to false.

### WR-03: The playback clock can run backwards or go negative on the first frame after play or seek

**File:** `web/src/lib/playback.js:66`, `web/src/lib/playback.js:89-92`, `web/src/lib/playback.js:117`
**Issue:** `last` is set from `performance.now()` in `play()` and `seek()`, but `tick` receives the rAF frame timestamp. In Chrome that timestamp is the frame's begin time, and rAF-aligned input such as pointermove during scrubbing is dispatched after it. So `ts - last` can be negative. At 300× a 16 ms negative delta moves `time` back by about 5 s, and from index 0 `time` drops below 0, so the readout and the "Paused at -1 seconds" announcement can show negative values. `tick` never clamps.
**Fix:**

```js
time = clamp(time + (Math.max(0, ts - last) / 1000) * speed);
```

### WR-04: The live progress counter mixes aggregate totals with the current denoiser's label

**File:** `web/src/hooks/useLiveRun.js:57-65`, `web/src/components/StatusStrip.jsx:31-33`
**Issue:** `windowsDone` and `windowsTotal` are summed over every denoiser in `per_denoiser`, but the counter adds the *current* denoiser's name. While raw runs, for example, it reads "350 of 834 map-matching windows (Raw cabin)" when raw is actually at 72 of 278. This is misleading visible text, and the `<progress>` value is wrong for the label next to it.
**Fix:** Use `step.windows_done` / `step.windows_total` (already per current denoiser in `_progress`) for the labelled counter. Or label the aggregate as such: "{done} of {total} windows across {k} methods".

### WR-05: The 90 s deadline cannot bound a single Python call, and a call that never settles locks the bridge forever

**File:** `web/src/lib/liveRun.js:42-57`, `web/src/lib/liveRun.js:93-95`, `web/src/bridge.js:10-15`, `web/src/App.jsx:219`, `magnav/live.py:161-175`
**Issue:** `checkDeadline()` runs only *between* calls. Stage-2 calls (`select_and_build`, each `fit`) and `live_result` have no time budget at all. They measured about 160 ms on Qollab, but a slower machine or the Phase 4 quantum fit can take much longer, and Python runs on the page's main thread. If `callPromising` never settles, the module-level `chain` never advances, so every later Python call, including `live_cancel`, waits forever. `liveRunFlag.inFlight` then stays true, so the keep-alive never ends the run.
**Fix:** Race each live call against a deadline built from the injected clock (for example, a promise that a rAF/`performance.now()` poll resolves) and fail with `Timeout`. Document that Python work can't be pre-empted, and keep every stage-2 fit within the budget. At minimum, fail the run if any single call exceeds `DEADLINE_MS - elapsed()`.

### WR-06: Bundled third-party code still calls Qollab's injected `setTimeout`/`clearTimeout`

**File:** `main.js:61` (React scheduler), `main.js:13116-13121` (RTK `autoBatchEnhancer`), `main.js:13970` (es-toolkit debounce), `main.js:15252-15255` (recharts animation timeout controller), `main.js:25269` (recharts tooltip sync); the gate is described in `web/src/probe.js:1-3`
**Issue:** The Qollab probe recorded `sameAsGlobal:false, returnsPromise:true`, so module-scope `setTimeout` in `main.js` is Qollab's injected, promise-returning version. The "no setTimeout outside probe.js" gate covers only first-party source. The bundled code above uses that injected `setTimeout` and calls `clearTimeout` on its return value, which (if it is a promise) cancels nothing. This works today only because the affected paths are mostly off: no animations, no `ResponsiveContainer` debounce, and the RTK guard flag. Turning any of them on, such as `debounce` or `isAnimationActive`, would break silently on Qollab only.
**Fix:** Add a bundle test that lists the expected third-party call sites, so new ones fail CI. Document in `probe.js` that third-party timers do run on Qollab's injected timer. Keep `isAnimationActive={false}` and no `debounce` as enforced rules, for example with a grep test on `web/src`.

## Info

### IN-01: No yield between `live_start` and the first `live_step`

**File:** `web/src/lib/liveRun.js:52-57`
**Issue:** The `await yieldFn()` comes at the *end* of the loop, so `live_start` and the stage-2 "select" call run back to back. `announce()` cancels its pending rAF on every new call (`Announcer.jsx:17`). If no frame renders between the two calls, "Mode: computing in-page. Step 1 of 4." is replaced by "Step 2 of 4." before it is ever set, and "Step 1 of 4" is never painted in the status strip.
**Fix:** Add `await yieldFn();` right after the `live_start` `checkOk`.

### IN-02: The `live_result` payload is not checked against the requested line and sensor

**File:** `web/src/lib/liveRun.js:95-98`
**Issue:** `validate(res.line, sensor)` checks the shape only. A result whose `res.line.line` / `res.sensor` differ from the request is still accepted, and App files it under `runLine`.
**Fix:** `if (String(res.line.line) !== String(line) || res.sensor !== sensor) throw namedError('InvalidShape', 'live_result is for a different line/sensor');`

### IN-03: Holding Space toggles play and pause at key-repeat rate

**File:** `web/src/App.jsx:185-189`
**Issue:** Auto-repeat keydowns toggle playback many times per second and flood the live region with Playing/Paused announcements.
**Fix:** `if (e.repeat && (e.key === ' ' || e.key === 'Spacebar')) { e.preventDefault(); return; }`

### IN-04: The budget clamp is duplicated with magic numbers

**File:** `magnav/api.py:215`
**Issue:** `max(50, min(2000, ...))` repeats `live.BUDGET_MIN_MS`/`BUDGET_MAX_MS`, which `live.step` then applies again.
**Fix:** Call `live.clamp_budget(_as_int(budget_ms))` once.

### IN-05: A private function is used across modules, plus an alias workaround

**File:** `magnav/live.py:204`, `magnav/live.py:221`
**Issue:** `artifact._clean` is private but `live.py` calls it. `_skip = skip` exists only because `run_line`'s `skip` parameter shadows the function.
**Fix:** Make `clean` public in `artifact.py`. Rename the parameter to `skip_denoisers`.

### IN-06: Unused props

**File:** `web/src/components/ControlBar.jsx:120,127`, `web/src/components/StatusStrip.jsx:60`
**Issue:** `seriesDisabled` and `children` are never passed by App.
**Fix:** Remove them, or wire them up.

### IN-07: The packaging script doesn't enforce its own "literal path" rule

**File:** `scripts/package_qollab.sh:30-32`
**Issue:** The comment says every data entry must appear verbatim in `magnav/*.py`, but nothing checks it. All entries comply today. A future rename would ship a file that Qollab never preloads.
**Fix:** `for f in "${DATA_FILES[@]}"; do grep -qF "\"$f\"" magnav/*.py || fail "$f is not a literal path in magnav/*.py"; done`

### IN-08: The production `NODE_ENV` define also applies to `vite dev`

**File:** `web/vite.config.js:14`
**Issue:** The `define` is not scoped to `command === 'build'`, so dev runs React with production `process.env.NODE_ENV` checks and React's dev warnings are hidden.
**Fix:** `define: command === 'build' ? { 'process.env.NODE_ENV': '"production"' } : {}`.

### IN-09: The view silently falls back to a different line

**File:** `web/src/App.jsx:69`
**Issue:** If `line` is not in the artifact, `?? artifact.lines[0]` shows another line, while the select and "Run live" still target `line`.
**Fix:** Show a `viewError` instead of falling back, or initialise `line` from `artifact.lines[0].line`.

### IN-10: `metricStartT` assumes uniform sampling from raw index 0

**File:** `web/src/lib/artifact.js:76-78`
**Issue:** `metric_start_index * jam.t_s / jam.index` is only exact when the sample rate is constant. A gap in the raw data would shift the metric start shown in the UI away from the one the metrics used.
**Fix:** Emit `metric_start_t_s` from `artifact.line_entry`, as `t[metric_start] - t[0]`, and read it directly.

## Fix Outcomes

**Fixed:** 2026-10-10 (gsd-code-fixer, iteration 1). Scope: CR-01, WR-01..WR-06, plus the trivial Info items IN-01..IN-03.
**Gates after fixes:** `ruff` clean; `pytest` 151 passed; `node --test` 57 passed; `main.js` rebuilt (850,757 B, zero exports, first line imports `magnav.api`); `scripts/package_qollab.sh` OK. Nothing was uploaded to Qollab.

| ID | Outcome | Commit | Notes |
|----|---------|--------|-------|
| CR-01 | fixed: requires human verification | 4b6e3b0 | `_advance` breaks at every denoiser boundary. The node fake and the dev stub follow the same contract. New JS tests: tl finishes inside a step at 80 s, so raw and lowpass are skipped and the tl result is returned (with and without the lagging StopIteration). New Python test: a step never starts a second denoiser (it fails on the old code). |
| WR-01 | fixed: requires human verification | 6a4fdfb | Chosen behaviour is cancel-then-end. `createLiveRunner.cancel()` stops the run before its next Python call and calls `live_cancel`. End run announces "Live run cancelled." joined with the run-ended message, awaits the cancel, then resolves `runDone`. `onRunLive` leaves the ended state alone. |
| WR-02 | fixed: requires human verification | 2b290f5 | Focus parks on the status message (`tabIndex={-1}`) when Run live, the line select, the sensor select or End run disables itself. It returns to the same control once that control is enabled again. Not checked in a browser yet. |
| WR-03 | fixed | e2c45b8 | Frame delta clamped to [0, 250 ms] (`MAX_FRAME_MS`); `last` stays monotonic; `time` is clamped to [0, tEnd]. Covered by a node test that fails on the old code. |
| WR-04 | fixed | 811c6e7 | `liveProgress(step)` gives the current denoiser's own windows plus "denoiser k of K". The progress bar label names the same denoiser. |
| WR-05 | fixed: requires human verification | 8f0f738 | Each live call is raced against the 90 s deadline and `cancel()` on a rAF tick (`performance.now`). An overrunning call is abandoned: Timeout, then fallback, and its late result is discarded. `live_cancel` is queued but not awaited. `bridge.js` documents that a hung Pyodide call cannot be interrupted and holds the queue until it returns. Not exercised against real Pyodide. |
| WR-06 | fixed | c4d9f76 | Note added to `docs/QOLLAB_FINDINGS.md` and `probe.js`. New contract tests: every recharts element has `isAnimationActive={false}` with no `debounce`, and the bundle's timer call sites are pinned (setTimeout 32, clearTimeout 13, setInterval 3). |
| IN-01 | fixed | 4fcd889 | `yieldFn()` runs after `live_start`. |
| IN-02 | fixed | 50f6dd7 | A `live_result` whose `line.line` or `sensor` differs from the request is InvalidShape. |
| IN-03 | fixed | 95dedb6 | Auto-repeated Space keydowns are ignored. |
| IN-04..IN-10 | skipped: out of fix scope | — | Not in scope for this pass (only trivial Info items were requested). They remain open. |

The rebuilt bundle is in commit 93579fc.

---

_Reviewed: 2026-10-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

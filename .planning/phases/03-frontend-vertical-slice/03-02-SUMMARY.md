---
phase: 03-frontend-vertical-slice
plan: 02
subsystem: web-player-core
tags: [ui-01, ui-02, a11y-02, map, playback, bridge, dev-stub, cividis]
requires:
  - "03-01: magnav.api artifact_json + live_* JSON shapes"
provides:
  - "web/src/bridge.js: qBackend, callPyText, callPy (one Python call in flight)"
  - "web/src/dev/magnavApiStub.js: artifact_json (real file via ?raw, dev only) + live_start/step/skip/result/cancel simulation"
  - "web/src/lib/artifact.js: validateArtifact, validateLine, lineView, metricStartT, errorAt, drErrorAt"
  - "web/src/lib/playback.js: indexAtTime, nextWindowTime, createPlaybackStore"
  - "web/src/lib/colormap.js: buildCividisLut, percentileDomain, colorbarTicks"
  - "web/src/lib/geo.js: mapGeometry"
  - "web/src/lib/format.js: fmtInt, fmtSeconds"
  - "web/src/theme.js: SERIES, SERIES_ORDER, TRUTH, DR, SENSOR_LABELS, LINE_LABELS, JAM_COLOR, CASING, INVALID_BASE, INVALID_STRIPE, TEXT_COLOR"
  - "web/src/hooks/usePlayback.js: playback (singleton store), usePlaybackIndex, usePlaybackTime, usePlaybackPlaying"
  - "web/src/components/MapView.jsx: default export MapView({view, mapTrack, sensorLabel})"
affects: [03-03, 03-04]
tech-stack:
  added:
    - "recharts 3.10.1 (exact; not yet imported)"
    - "react-is 19.3.0 (exact; recharts peer)"
    - "d3-scale-chromatic 3.1.0 (exact; used by colormap.js, bundled once MapView is mounted)"
  patterns:
    - "Module-level promise chain serializes every Python call"
    - "External playback store + useSyncExternalStore; only the SVG overlay and readout subscribe per frame"
    - "Canvas heatmap drawn once per (line, size, DPR); never from the playback tick"
key-files:
  created:
    - web/src/lib/artifact.js
    - web/src/lib/playback.js
    - web/src/lib/format.js
    - web/src/lib/colormap.js
    - web/src/lib/geo.js
    - web/src/lib/artifact.test.js
    - web/src/lib/playback.test.js
    - web/src/lib/colormap.test.js
    - web/src/lib/geo.test.js
    - web/src/theme.js
    - web/src/hooks/usePlayback.js
    - web/src/components/MapView.jsx
    - tests/test_web_lib.py
    - THIRD_PARTY_LICENSES.md
  modified:
    - web/package.json
    - web/package-lock.json
    - web/vite.config.js
    - web/src/bridge.js
    - web/src/dev/magnavApiStub.js
    - web/src/app.css
    - main.js
    - main.css
decisions:
  - "Estimate and dead-reckoning tracks and markers are drawn from jam.display_index onward. Before the jam both equal truth exactly (checked: max error 0 m on both lines), so drawing them would only stack three identical lines"
  - "The jam marker and its 'GPS jammed' label appear once the index reaches the jam, not before"
  - "Colorbar ticks round inward (ceil the min, floor the max to 100) so every tick sits inside the domain; the middle '0' label is hidden when it would overlap an end label (1007.06)"
  - "Reduced mode publishes only when at least 1000 ms of wall time has passed since the last publish (strict), not on floor(seconds) buckets, which allowed two updates about 983 ms apart"
  - "The figcaption appends the sensor label in parentheses after the map name (uses the sensorLabel prop)"
metrics:
  duration: "12 min"
  completed: 2026-10-10
  tasks: 2
  files: 22
---

# Phase 3 Plan 02: Player data libs, bridge, dev stub and MapView Summary

The player's data and map half now exists. The changes:
- One-call-at-a-time Python bridge.
- A dev stub that serves the real artifact and mirrors every Plan 01 `live_*` JSON string.
- Node-tested pure libraries for artifact validation and line views, the playback clock, the cividis colormap and map geometry.
- Theme constants and a playback store with React hooks.
- A MapView that renders the real cividis heatmap with hatched no-data cells, plus cased truth, estimate and DR tracks, the drone, the jam marker and the error readout, all driven by the store index.

## What was built

**Task 1 (`5f7aca2` test, `3f179cc` feat)**
- **Supply-chain gate.** Each of `recharts@3.10.1`, `react-is@19.3.0` and `d3-scale-chromatic@3.1.0` was checked with `npm view <pkg>@<ver> scripts --json` for preinstall/install/postinstall keys. None had any. They were then installed with `--save-exact --ignore-scripts`.
- **Vite config.** Added `server.fs.allow: ['..']` (dev only) and `build.license` (writes `THIRD_PARTY_LICENSES.md`).
- **`bridge.js`.** `callPyText`/`callPy` share one module-level promise chain, so exactly one Python call is in flight.
- **Dev stub.**
  - `artifact_json` reads `../../../data/precomputed_run.json?raw` and returns `'{"ok":true,"artifact":'+text+'}'`.
  - `live_start/step/skip/result/cancel` replay the precomputed line restricted to the chosen sensor: 5 stage-2 calls (select, raw, lowpass, tl, quantum), then 25 stage-3 calls. Each call waits one MessageChannel tick. Failure paths match Python: `simulate_failure`, `globalThis.__MAGNAV_DEV_FAIL__ === true`, allowlist ValueError, and RuntimeError when no run is active.
  - Every function returns a JSON string.
- **Libs.** `artifact.js`, `playback.js` and `format.js`.
- **pytest wrapper.** `tests/test_web_lib.py` runs the node tests from pytest.

**Task 2 (`bbc312a` test, `0d4493c` feat)**
- **Theme and libs.** `theme.js` holds the UI-SPEC series table. `colormap.js` builds a 256-entry LUT from `interpolateCividis`, plus `percentileDomain` (2nd/98th percentile, floor/ceil rule) and `colorbarTicks`. `geo.js` computes cell-edge extents with an isotropic aspect, capped at 520 px.
- **Hooks.** `usePlayback.js` exports the singleton store and the hooks.
- **MapView.jsx** (413 lines):
  - `<figure role="group" aria-labelledby tabIndex=0>` with the h2 "Map" and a figcaption.
  - The canvas (`aria-hidden`) is redrawn only when `ResizeObserver` or a DPR `matchMedia` change fires. It draws 1 px per cell offscreen with the south-to-north row flip, then scales up with `imageSmoothingEnabled = false`. Invalid cells are filled `#24282F` and hatched by a 4x4 45° stripe pattern, applied as one Path2D of row runs.
  - The memoized SVG `Overlay` (`aria-hidden`) subscribes to `usePlaybackIndex` and draws:
    - each track twice (4 px black casing, then the coloured stroke): truth solid, the estimate dashed `8 5`, DR dotted `1 4` (2.5 px, round caps);
    - the 24 px quad-rotor drone, the 12 px estimate diamond and the 12 px DR square;
    - the 16 px jam circle-X with a cased "GPS jammed" label;
    - the 1 px error link at 60% opacity.
  - The legend has a 160x12 cividis colorbar with tick labels, the "Magnetic anomaly (nT)" caption, and a hatched 12x12 "No survey data" swatch.
  - `ErrorReadout` shows "GPS available", then "Collecting first map-matching window…", then `{n} m` with `Dead reckoning: {n} m` below. It is not a live region.
  - The loading state is "Loading precomputed flight…".
  - app.css gained a MapView section that uses only the UI-SPEC `var(--…)` tokens. **Plan 03's theme rewrite must keep that section.**

## Exports Plans 03 and 04 import

| Module | Exports |
|---|---|
| `bridge.js` | `qBackend`, `callPyText(name, ...args)`, `callPy(name, ...args)` |
| `lib/artifact.js` | `validateArtifact(obj) -> string[]`, `validateLine(line, sensor) -> string[]`, `lineView(line, sensor)`, `metricStartT(line)`, `errorAt(view, den, i)`, `drErrorAt(view, i)` |
| `lineView` result | `{id, mapName, t, n, tEnd, jamIdx, jamT, metricStartT, metricStartIdx, truth:{x,y,anomaly}, dr:{x,y}, est:{den:{x,y,signal,windowT,ncc,accepted}}, available:Set, metrics:{dead_reckoning, ...metrics[sensor]}, preview, frame}` |
| `lib/playback.js` | `indexAtTime(t, time)`, `nextWindowTime(time, dir, strideS=10)`, `createPlaybackStore({now, raf, caf})` |
| store methods | `load(t)`, `play()`, `pause()`, `toggle()`, `seekIndex(i)`, `seekTime(s)`, `stepWindow(dir)`, `stepSeconds(s)`, `setSpeed(x)`, `setReduced(bool)`, `subscribe(fn) -> unsubscribe`, `on('play'/'pause'/'end'/'seek', fn) -> off`, `getIndex()`, `getTime()` (published), `isPlaying()`, `getSpeed()`, `isReduced()`, `getTimes()` |
| `hooks/usePlayback.js` | `playback`, `usePlaybackIndex()`, `usePlaybackTime()`, `usePlaybackPlaying()` |
| `lib/colormap.js` | `buildCividisLut()`, `percentileDomain(nT, valid, lo, hi)`, `colorbarTicks([d0, d1])` |
| `lib/geo.js` | `mapGeometry(preview, cssW, maxH=520) -> {W, H, dx, dy, aspect, toPx}` |
| `lib/format.js` | `fmtInt(n)`, `fmtSeconds(s)` |
| `theme.js` | `SERIES`, `SERIES_ORDER`, `TRUTH`, `DR`, `SENSOR_LABELS`, `LINE_LABELS`, `JAM_COLOR`, `CASING`, `INVALID_BASE`, `INVALID_STRIPE`, `TEXT_COLOR` |
| `components/MapView.jsx` | default `MapView({view, mapTrack, sensorLabel})` (pass `view = null` for the loading state) |

## Build numbers

- `main.js`: **305,122 bytes**. It is unchanged in size because nothing imports MapView, recharts or d3 yet. The first line is `import * as e from "magnav.api";`. It has zero exports and 0 `precomputed_run` strings.
- `main.css`: 3,355 bytes.
- `THIRD_PARTY_LICENSES.md`: **3 entries** (react-dom 19.3.0, react 19.3.0, scheduler 0.28.0, all MIT). Entries for recharts and d3 will appear when Plans 03 and 04 import them.

## Verification

- `npm --prefix web test`: 24 node tests pass (artifact 10, playback 7, colormap 4, geo 3).
- `uv run pytest -q`: 133 passed. This includes bundle freshness and the new `test_web_lib.py`.
- `uv run ruff check magnav tests main.py scripts`: clean.
- **vite dev render check.** A throwaway, uncommitted harness page mounted MapView with `callPyText('artifact_json')` → `validateArtifact` (0 errors) → `lineView`, then played at 300x. Headless Chrome was driven over CDP at DPR 2.
  - Canvas backing store 950x1040 for 1003.02 (about 475x520 CSS px, W/H 0.914) and 918x1040 for 1007.06.
  - Hatched no-data regions are visible on Renfrew; none on Eastern, which has no invalid cells.
  - All markers render, and the tracks are cased.
  - The readout went from "GPS available" to "35 m / Dead reckoning: 37 m", and changed again over 1 s of play.
  - `/@fs/.../data/precomputed_run.json?raw` returned 200 from vite dev, so `fs.allow` works.
- **Stub check.** The `live_*` sequence was replayed in Node through a scratch copy of the stub. Its output matches the 03-01 shapes, including the second `live_result`, simulated failure, allowlist failure and cancel cases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `node --test src/lib/` fails on Node 24**
- **Found during:** Task 1 RED run.
- **Issue:** Node 24.20 treats a directory argument to `--test` as a module path and fails with MODULE_NOT_FOUND.
- **Fix:** The test script is now `node --test "src/lib/*.test.js"` (Node's built-in glob). `tests/test_web_lib.py` passes the same glob without a shell.
- **Files modified:** web/package.json, tests/test_web_lib.py
- **Commit:** 5f7aca2, 3f179cc

**2. [Rule 1 - Bug] Reduced mode could publish twice within 1 s**
- **Found during:** Task 1 GREEN.
- **Issue:** Bucketing on `Math.floor(wallSeconds)` with float frame timestamps let two updates land about 983 ms apart.
- **Fix:** Publish only when at least 1000 ms have passed since the last published update.
- **Commit:** 3f179cc

**3. [Rule 1 - Bug] Overlapping colorbar labels on 1007.06**
- **Found during:** Task 2 visual check.
- **Issue:** The "0" label overlapped "-200 nT".
- **Fix:** `tickFits` hides the middle label when it would collide with an end label. The 0 tick value is still in `colorbarTicks`.
- **Commit:** 0d4493c

**4. [Rule 3] ruff PLW1510 on the new pytest wrapper.** Fixed with an explicit `check=False`. The return code is asserted instead.

### Plan text corrections (no code impact)

- **`hasInstallScript` gate.** `grep -c '"hasInstallScript": true' web/package-lock.json` returns **1**, not 0. The entry is `fsevents`, an optional macOS dependency of vite. It was already in the lockfile before this plan (`git show HEAD~4:web/package-lock.json` also gives 1). The three new packages add no install scripts, and installs use `--ignore-scripts`. I did not remove fsevents from the lockfile, because doing so would break vite's own lock.
- **Aspect wording.** The plan's geo behaviour says "H/W is about 0.914". For 1003.02 the map spans 107 × 356.5 m wide by 117 × 356.8 m tall, so W/H = 0.914 and H/W = 1.094. The test asserts W/H ≈ 0.914, which matches RESEARCH ("aspect ≈ 0.914").
- **Behaviour additions.** The RESEARCH and UI-SPEC do not say what to draw before the jam. The estimate and DR overlays start at the jam (see decisions).

## Known Stubs

None. MapView is complete but not mounted yet; Plan 03 Task 2 mounts it in App. `recharts` and `react-is` are installed and pinned but not imported until Plan 04's SignalPanel.

## Threat Flags

None. The surface matches the plan's threat model:
- `?raw` is used only in the serve-only stub.
- `fs.allow` is dev-only.
- No `innerHTML`, `dangerouslySetInnerHTML` or `eval`.
- No network fetch.
- Nothing was published or uploaded.

## TDD Gate Compliance

RED commits `5f7aca2` and `bbc312a` (test) come before GREEN commits `3f179cc` and `0d4493c` (feat). No refactor commits were needed.

## Self-Check: PASSED

- FOUND: web/src/lib/{artifact,playback,format,colormap,geo}.js, the four `*.test.js` files, web/src/theme.js, web/src/hooks/usePlayback.js, web/src/components/MapView.jsx, tests/test_web_lib.py, THIRD_PARTY_LICENSES.md
- FOUND commits: 5f7aca2, 3f179cc, bbc312a, 0d4493c

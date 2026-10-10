---
phase: 03-frontend-vertical-slice
plan: 03
subsystem: web-player-shell
tags: [ui-02, a11y-01, a11y-02, keyboard, aria-live, reduced-motion, keep-alive, dark-theme]
requires:
  - "03-02: bridge, playback store + hooks, artifact/format libs, theme.js, MapView"
provides:
  - "web/src/App.jsx: player shell; exports runDone and liveRunFlag"
  - "web/src/components/ControlBar.jsx: default ControlBar, SPEEDS"
  - "web/src/components/StatusStrip.jsx: default StatusStrip, badgeText, pausedHint"
  - "web/src/components/Announcer.jsx: default Announcer, announce(text)"
  - "web/src/lib/announce.js: createThrottle, speedWords, loadedText, playText, pausedText, jamText, readoutText, modeText, stageText, liveFailedText, finishedText, selectionText"
  - "web/src/hooks/useArtifact.js, web/src/hooks/useReducedMotion.js"
  - "web/src/probe.js: logTimerProbe, logFrameProbe"
affects: [03-04]
tech-stack:
  added: []
  patterns:
    - "Leaf subscribers (PlayButton, Scrubber, TimeReadout) keep ControlBar off the per-frame path"
    - "One document keydown listener that skips form controls and summary; slider owns its own arrows/PageUp/PageDown"
    - "Keep-alive idle bound from performance.now comparisons, checked on activity and by a coarse globalThis.setInterval"
    - "Single polite live region with a module-level announce(); readout throttle is marked by play and jam so it never clobbers them"
key-files:
  created:
    - web/src/hooks/useArtifact.js
    - web/src/hooks/useReducedMotion.js
    - web/src/components/ControlBar.jsx
    - web/src/components/StatusStrip.jsx
    - web/src/components/Announcer.jsx
    - web/src/lib/announce.js
    - web/src/lib/announce.test.js
    - web/src/probe.js
  modified:
    - web/src/App.jsx
    - web/src/main.jsx
    - web/src/app.css
    - index.html
    - main.js
    - main.css
    - THIRD_PARTY_LICENSES.md
decisions:
  - "The throttle has mark(): Play and the jam announcement start a new 10 s readout interval, so the readout cannot replace them in the polite region about 1 s later (at 60x the metric start is ~1 s of wall time after the jam)"
  - "While playing or computing, the idle check refreshes lastActivity, so the 30 min bound counts only real idle time after playback stops"
  - "Shift is not treated as a blocking modifier, so Shift+J (J) works; Alt/Ctrl/Meta combinations are ignored"
  - "finishedText falls back to 'Replay finished.' when the map track has no estimate"
  - "Extra tokens --color-ok-bg (#13261E) and --color-danger-bg (#2B1719) hold the UI-SPEC badge/notice backgrounds so no hex appears outside :root"
metrics:
  duration: "9 min"
  completed: 2026-10-10
  tasks: 3
  files: 15
---

# Phase 3 Plan 03: Playable player shell, keyboard, keep-alive and announcer Summary

The player is now playable on `vite dev` and in the bundle. It has a dark-theme App shell that mounts MapView on the real artifact, plus a labelled native ControlBar, a StatusStrip with a text mode badge, the full UI-SPEC keyboard map, reduced-motion stepping, a keep-alive that never ends the run just because there is no backend, timer and frame probes, and a single polite aria-live Announcer with the exact UI-SPEC phrasing.

## What was built

**Task 1 (`fd4f0b9`)**
- `useArtifact`: `callPyText('artifact_json')` with no backend gate. It checks `ok === true`, runs `validateArtifact` and logs `[probe] artifact_load {ms}`. It returns `{status, artifact, error}`.
- `useReducedMotion`: a `matchMedia` boolean that follows change events.
- `ControlBar`: controls in UI-SPEC order: Flight line, Sensor (Mag 4 help via `aria-describedby`), Track on map, Play/Pause (accent fill, visible text equals `aria-label`, `aria-hidden` SVG glyph), the Flight time slider, the `t = … s / … s` readout, Speed, and a `children` slot for Plan 04's Run live button. The slider has `aria-valuetext`, with ArrowLeft/Right going to `stepWindow` and PageDown/PageUp to `stepSeconds(∓60)`. Home/End stay native and Space is not handled. Below the row is the Signal series fieldset: the truth item is not interactive, there are six checkboxes with dash swatches, and unavailable denoisers are disabled with the help text linked by `aria-describedby`.
- `StatusStrip`: the mode badge (`precomputed replay` / `computing in-page…` / `computed in-page`, the last in the ok colour), the status message (the paused hint by default), an End run button, a danger notice (text node), a `children` slot, and the provenance line (`· seed 0` is shown because the artifact has seed 0).
- `app.css`: all UI-SPEC tokens on `:root`, including `--color-border-control: #6B7380`. It sets `color-scheme: dark` and the background on `:root`, `html`, `body` and `#root`, uses 36 px controls, checkbox rows of at least 32 px, and the 3 px accent `:focus-visible` ring. The grid has 2 columns at 900 px and up, the slider row takes full width below 600 px, motion is off under reduced motion, there is `.sr-only` and a 40 px `.jam-slot`, and there are no `vh` units. The MapView section from 03-02 is kept verbatim.

**Task 2 (`7210174`)**
- `App.jsx`: the h1, intro, ControlBar, StatusStrip, jam slot, main grid (MapView plus an empty `section.signal-col`), an empty `.results-slot`, and the original footer text.
  - **State:** `line` ('1003.02'), `sensor` (null, then `artifact.default_sensor`), `mapTrack` ('tl'), `visible` (Set raw, tl), `speed` (60), `mode` ('precomputed'), `runEnded`, `statusMessage`.
  - **View and playback:** `view = useMemo(lineView(entry, activeSensor))`, which also runs `validateLine` for the chosen sensor. A view change calls `playback.load(view.t)`, which pauses and resets to index 0.
  - **Load error:** the UI-SPEC danger copy is shown and every control except the series fieldset is disabled.
- **Keyboard:** one `document` keydown listener. It ignores Alt/Ctrl/Meta combinations and any target inside `input, select, textarea, button, summary, [contenteditable]`. For body and figures it maps Space to toggle, Arrows to `stepWindow`, Home/End to the first/last index, and j/J to `jamT - 5`.
- **Keep-alive:** `runDone` resolves only from the End run button or after 30 min idle (`performance.now() - lastActivity >= 30 * 60 * 1000`). Idle means no pointerdown/keydown, not playing, and `liveRunFlag.inFlight` false. It is checked on every activity event and by `globalThis.setInterval` every 30 s. A null `qBackend` never ends the run. The end messages follow the UI-SPEC, and the idle one is prefixed "Keep-alive limit (30 min) reached.".
- `probe.js` is the only file that names setTimeout. It logs `[probe] timers` (Pitfall 5 fields plus `setIntervalType`/`setIntervalNative`) and `[probe] frame {innerHeight, scrollHeight, dpr}` after two rAFs.
- `main.jsx` keeps the same contract with no StrictMode. The `index.html` placeholder now reads "Loading Quantum MagNav… press Run to start."

**Task 3 (`7b43d4b` test, `8c6b785` feat)**
- `announce.js` builders, covered by 4 node tests:
  - The tests check exact strings, integer rounding and that no output contains "×".
  - `createThrottle(intervalMs, now)` returns `allow()` with `.mark()` and `.reset()`.
- `Announcer.jsx`: one `<p role="status" aria-live="polite" className="sr-only">`. `announce(text)` clears the region and sets the text on the next rAF, so identical text is re-read. A message sent before mount is queued.
- App wiring:
  - loaded (once)
  - `on('play')` and `on('pause')`
  - the jam, announced when a subscriber sees `prev < jamIdx <= idx` while playing
  - the error readout, at most once per 10 s of wall time, only while playing and at or after `metricStartIdx`
  - `on('end')` gives `finishedText`
  - a line or sensor change gives `selectionText`

## Interfaces for Plan 04

| Item | Detail |
|---|---|
| `Announcer.jsx` | `import { announce } from './components/Announcer.jsx'`. App already renders the only `<Announcer />`; do not add another live region. |
| `lib/announce.js` | `modeText(badge)`, `stageText(n)`, `liveFailedText()` are built and tested, waiting to be wired. `badgeText(mode)` from StatusStrip gives the badge string for `modeText`. |
| `App.jsx` exports | `runDone`, and `liveRunFlag` (set `liveRunFlag.inFlight = true` for the duration of a live run so the idle bound never ends it). |
| App state | `line`, `sensor`/`activeSensor`, `mapTrack`, `visible` (Set), `speed`, `mode` (`useState('precomputed')`; Plan 04 adds the setter), `runEnded`, `statusMessage` (null shows the paused hint). `view` is derived from the artifact; Plan 04 swaps in the live line entry for the selected line × sensor. |
| `ControlBar` props | `lines, sensors, line, sensor, mapTrack, visible, speed, view, disabled, seriesDisabled, onLineChange, onSensorChange, onMapTrackChange, onToggleSeries(key, on), onSpeedChange, children` (children render at the end of the control row: put Run live and its help there). Map-track options and series checkboxes are disabled when the key is not in `view.available`. |
| `StatusStrip` props | `mode ('precomputed'|'computing'|'computed'), message, jamT, provenance, danger, onEndRun, runEnded, children` (children render below the danger notice, e.g. a stage counter). |
| Layout slots | `<div className="jam-slot" />` (JamBanner), `<section className="signal-col" />` (SignalPanel; give it `tabIndex={0}` on its figure for the keyboard map), `<div className="results-slot" />` (MetricsTable plus TextAlternatives). |

## Build numbers

- `main.js`: **338,056 bytes**, up from 305,122 now that MapView, d3-scale-chromatic and the shell are imported. The first line is `import * as e from "magnav.api";`. Zero exports, 0 `precomputed_run` strings.
- `main.css`: 6,770 bytes.
- `THIRD_PARTY_LICENSES.md` was regenerated by the build. Task 2 changed it (d3 is now bundled).

## Verification

- `npm --prefix web test`: 28 node tests pass (24 from Plan 02 plus 4 for announce).
- `uv run pytest -q`: 133 passed, including bundle freshness, the contract and the node wrapper. `uv run ruff check magnav tests main.py scripts`: clean.
- All grep gates from the plan pass. No setTimeout, clearTimeout, innerHTML, dangerouslySetInnerHTML, StrictMode or eval appears outside `probe.js`. There is exactly one `aria-live`, no `vh`, and no hex literal in any `.jsx` file.
- **vite dev check.** I ran `npm --prefix web run dev` on port 5199 and drove headless Chrome over CDP at 1200×900 with a throwaway harness in the scratchpad (nothing committed).
  - **Initial state:** h1, badge "precomputed replay", the paused hint "…GPS is jammed at t = 946 s.", the provenance line, and body background rgb(17,19,24). The slider sits at 0 with `aria-valuetext` "t = 0 s of 3,784 s", and the readout shows "GPS available".
  - **Body keys:** Space played for 1.5 s and reached t = 97 s, so 60× is correct; a second Space paused. Home went to 0. ArrowRight went to 10 s, then 20 s, and ArrowLeft back to 10 s. End went to index 1263 with valuetext "…, GPS jammed" and a readout of 53 m against 5,267 m dead reckoning. j went to t = 941 s.
  - **Native keys kept:** Space inside the Speed select did not toggle. Space on the slider did not toggle. Space on the Play button toggled exactly once.
  - **Slider keys:** Home went to 0, ArrowRight to 10 s, PageUp to 70 s, PageDown back to 10 s, End to the last index.
  - **Map figure focused:** Space played, and Space again paused.
  - **Tab order:** Flight line, Sensor, Track on map, Play, Flight time, Speed, 6 checkboxes, End run, Map figure. Every stop showed a 3px solid outline.
  - **Reduced motion:** with emulated `prefers-reduced-motion: reduce` at 300×, the index changed at 1008, 2027 and 3025 ms (once per second). Without it, the index changed 211 times in 3.5 s.
  - **Probes:** `[probe] timers {"sameAsGlobal":true,"nativeGlobal":true,"returnsPromise":false,"setIntervalType":"function","setIntervalNative":true}`, then `[probe] artifact_load {"ms":25}`, then `[probe] frame {"innerHeight":900,"scrollHeight":1411,"dpr":1}`.
  - **Announcements**, captured from the live region:
    - "Precomputed flight loaded. Line 1003.02, Mag 5. Press Play or Space to start."
    - "Playing at 60 times speed."
    - "GPS jammed at 946 seconds. Navigating by magnetic map matching."
    - 10 s later: "1545 seconds. Position error, Tolles-Lawson (TL): 36 metres. Dead reckoning: 577 metres."
    - "Paused at 1727 seconds."
    - "Playing at 300 times speed."
    - "Replay finished. Final position error, Tolles-Lawson (TL): 53 metres."
    - "Line 1007.06, Mag 5. Paused at start."
    - "Line 1007.06, Mag 4 (hard case). Paused at start."
    - The page had exactly one live region. With Mag 4 selected, its help text was shown and linked through `aria-describedby`.
  - **Screenshot:** the paused and playing screenshots show the dark page, the cividis heatmap, the cased tracks, the drone, the "GPS jammed" marker and the "35 m / Dead reckoning: 36 m" chip.
- `curl -s http://localhost:5199/ | grep -c root` returned 2, so the dev server serves the page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] The readout throttle could clobber the jam and Play announcements.**
- **Found during:** Task 3 design. At 60× the metric start comes about 1 s of wall time after the jam, so the first throttled readout would replace "GPS jammed…" in the polite region before a screen reader finished it.
- **Fix:** `createThrottle` gained `.mark()` and `.reset()`. Play and the jam announcement call `mark()`, so the readout waits 10 s after them. Verified: the jam was announced at 2.7 s and the first readout at 12.7 s.
- **Files:** web/src/lib/announce.js, web/src/App.jsx
- **Commit:** 8c6b785

**2. [Rule 1 - Bug] Shift+J would be ignored.**
- **Issue:** my first draft treated Shift as a modifier to ignore, but the plan maps both j and J.
- **Fix:** only Alt, Ctrl and Meta are ignored. This was fixed before the Task 2 commit.

### Plan text notes (no code impact)

- `--color-ok-bg` and `--color-danger-bg` are extra `:root` tokens holding the UI-SPEC background hexes (#13261E, #2B1719). With them, `.jsx` and the rest of the CSS stay hex-free.
- The keep-alive refreshes `lastActivity` while playing or while a live run is in flight. "Idle" therefore starts counting when playback stops, not when the last key was pressed.
- The status message keeps the paused hint while playing. The UI-SPEC defines only the initial hint, and Plan 04 owns the live status messages.

## Known Stubs

- `<section className="signal-col" />`, `<div className="jam-slot" />` and `<div className="results-slot" />` are empty layout slots on purpose. Plan 04 fills them with SignalPanel, JamBanner and the MetricsTable/TextAlternatives. Until then the map takes the left column at 900 px and up, and the right column is blank.
- `mode` has no setter yet; Plan 04's live run adds it.
- The series checkboxes update `visible`, but nothing draws from it until Plan 04's SignalPanel.

## Threat Flags

None. The surface matches the threat model.
- T-03-07: artifact and error strings render only as React text nodes.
- T-03-09: `main.js` is 338 kB, under the 1.5 MB gate.
- T-03-10: nothing was uploaded or published.
- T-03-18: there is no setTimeout outside `probe.js`, and the run ends only on End run or the idle bound.
- T-03-19: there is one region, the readout is limited to one per 10 s, and the jam is announced once per crossing.

## TDD Gate Compliance

RED `7b43d4b` (`test(03-03)`) failed because `announce.js` was missing. GREEN came in `8c6b785` (`feat(03-03)`). No refactor commit was needed.

## Self-Check: PASSED

- FOUND: web/src/hooks/useArtifact.js, web/src/hooks/useReducedMotion.js, web/src/components/ControlBar.jsx, web/src/components/StatusStrip.jsx, web/src/components/Announcer.jsx, web/src/lib/announce.js, web/src/lib/announce.test.js, web/src/probe.js
- FOUND commits: fd4f0b9, 7210174, 7b43d4b, 8c6b785

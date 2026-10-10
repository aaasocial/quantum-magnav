// Player shell: artifact load, selection state, layout slots, global keyboard map and the
// Qollab keep-alive. Per-frame state lives in the playback store, never in App state.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlBar from './components/ControlBar.jsx';
import StatusStrip, { badgeText } from './components/StatusStrip.jsx';
import MapView from './components/MapView.jsx';
import SignalPanel from './components/SignalPanel.jsx';
import MetricsTable from './components/MetricsTable.jsx';
import TextAlternatives from './components/TextAlternatives.jsx';
import JamBanner from './components/JamBanner.jsx';
import Announcer, { announce } from './components/Announcer.jsx';
import { useArtifact } from './hooks/useArtifact.js';
import { useLiveRun } from './hooks/useLiveRun.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { playback } from './hooks/usePlayback.js';
import { drErrorAt, errorAt, lineView, validateLine } from './lib/artifact.js';
import {
  createThrottle, finishedText, jamText, liveFailedText, loadedText, modeText, pausedText, playText, readoutText,
  selectionText, stageText,
} from './lib/announce.js';
import { qBackend } from './bridge.js';
import { logFrameProbe, logTimerProbe } from './probe.js';
import { SENSOR_LABELS, SERIES } from './theme.js';

const DEFAULT_LINE = '1003.02';
const DEFAULT_TRACK = 'tl';
const DEFAULT_VISIBLE = ['raw', 'tl'];
const DEFAULT_SPEED = 60;
const IDLE_LIMIT_MS = 30 * 60 * 1000; // keep-alive bound: 30 min with no input
const IDLE_CHECK_MS = 30 * 1000;
const RUN_ENDED_MESSAGE = 'This run has ended. Press Stop, then Run, to start a new one.';
const IDLE_MESSAGE = `Keep-alive limit (30 min) reached. ${RUN_ENDED_MESSAGE}`;
const READOUT_EVERY_MS = 10 * 1000; // announced error readout: at most once per 10 s wall time

// main.jsx awaits runDone to keep the Qollab run alive. It resolves only on End run or the
// idle bound; never because no backend is selected (the replay needs none). Resolving twice is harmless.
let resolveRunDone;
export const runDone = new Promise((resolve) => { resolveRunDone = resolve; });

// Set by Plan 04's live run; the idle check never ends the run while it is true.
export const liveRunFlag = { inFlight: false };

const SKIP_TARGETS = 'input, select, textarea, button, summary, [contenteditable]';

export default function App() {
  const { status, artifact, error } = useArtifact();
  const reduced = useReducedMotion();
  const [line, setLine] = useState(DEFAULT_LINE);
  const [sensor, setSensor] = useState(null);
  const [mapTrack, setMapTrack] = useState(DEFAULT_TRACK);
  const [visible, setVisible] = useState(() => new Set(DEFAULT_VISIBLE));
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [mode, setMode] = useState('precomputed');
  const [liveOverride, setLiveOverride] = useState(null); // {line, sensor, data} from live_result
  const [liveDanger, setLiveDanger] = useState(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const live = useLiveRun();
  const [runEnded, setRunEnded] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const endedRef = useRef(false);

  const activeSensor = sensor ?? artifact?.default_sensor ?? null;

  const { view, viewError } = useMemo(() => {
    if (!artifact || !activeSensor) return { view: null, viewError: null };
    const useLive = liveOverride && liveOverride.line === line && liveOverride.sensor === activeSensor;
    const entry = useLive
      ? liveOverride.data
      : artifact.lines.find((l) => String(l.line) === line) ?? artifact.lines[0];
    const errs = validateLine(entry, activeSensor);
    if (errs.length) return { view: null, viewError: errs.slice(0, 3).join('; ') };
    return { view: lineView(entry, activeSensor), viewError: null };
  }, [artifact, line, activeSensor, liveOverride]);

  const viewRef = useRef(view);
  viewRef.current = view;
  const trackRef = useRef(mapTrack);
  trackRef.current = mapTrack;
  const loadedAnnounced = useRef(false);

  const sensorLabelOf = (s) => (s ? (SENSOR_LABELS[s] ?? s) : '');
  const trackLabelOf = (k) => SERIES[k]?.label ?? k;

  // Initial artifact ready (once).
  useEffect(() => {
    if (!view || loadedAnnounced.current) return;
    loadedAnnounced.current = true;
    announce(loadedText(view.id, sensorLabelOf(activeSensor)));
  }, [view, activeSensor]);

  // Playback announcements: play/pause, jam crossed once per forward pass, the throttled
  // error readout while playing after the metric start, and replay finished.
  useEffect(() => {
    const readoutAllowed = createThrottle(READOUT_EVERY_MS);
    let prevIdx = playback.getIndex();
    const offPlay = playback.on('play', () => {
      readoutAllowed.mark();
      announce(playText(playback.getSpeed()));
    });
    const offPause = playback.on('pause', () => announce(pausedText(playback.getTime())));
    const offEnd = playback.on('end', () => {
      const v = viewRef.current;
      if (!v) return;
      const k = trackRef.current;
      announce(finishedText(trackLabelOf(k), errorAt(v, k, v.n - 1)));
    });
    const unsubscribe = playback.subscribe(() => {
      const v = viewRef.current;
      const idx = playback.getIndex();
      const prev = prevIdx;
      prevIdx = idx;
      if (!v || !playback.isPlaying()) return;
      if (prev < v.jamIdx && v.jamIdx <= idx) {
        readoutAllowed.mark();
        announce(jamText(v.jamT));
        return;
      }
      if (idx >= v.metricStartIdx && idx < v.n && readoutAllowed()) {
        const k = trackRef.current;
        const err = errorAt(v, k, idx);
        if (err !== null) announce(readoutText(v.t[idx], trackLabelOf(k), err, drErrorAt(v, idx)));
      }
    });
    return () => {
      offPlay();
      offPause();
      offEnd();
      unsubscribe();
    };
  }, []);

  // Mode changes are announced where they happen, joined with the message that caused them:
  // the single polite region replaces its text, so two separate calls would drop the first.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const modeSuffix = (next) => (modeRef.current === next ? '' : ` ${modeText(badgeText(next))}`);

  // A live result for another line/sensor never shows: selection changes return to the replay.
  useEffect(() => {
    if (!liveOverride) return;
    if (liveOverride.line !== line || liveOverride.sensor !== activeSensor) {
      setLiveOverride(null);
      setMode('precomputed'); // announced by onLineChange / onSensorChange
      setStatusMessage(null);
    }
  }, [line, activeSensor, liveOverride]);

  // A map track the current view lacks (live mode skips some) falls back to TL.
  useEffect(() => {
    if (view && !view.available.has(mapTrack) && view.available.has(DEFAULT_TRACK)) setMapTrack(DEFAULT_TRACK);
  }, [view, mapTrack]);

  // A new line/sensor view: load its time axis (pauses and resets to index 0).
  useEffect(() => {
    if (view) playback.load(view.t);
  }, [view]);

  useEffect(() => { playback.setSpeed(speed); }, [speed]);
  useEffect(() => { playback.setReduced(reduced); }, [reduced]);

  const endRun = useCallback((message) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setRunEnded(true);
    setStatusMessage(message);
    resolveRunDone();
  }, []);

  // Probes once on mount (Pitfalls 5 and 7).
  useEffect(() => {
    logTimerProbe();
    logFrameProbe();
  }, []);

  // Global keyboard map (UI-SPEC Keyboard table, D-11). Form controls keep their native keys;
  // the slider handles its own arrows and PageUp/PageDown.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target;
      if (el instanceof Element && el.closest(SKIP_TARGETS)) return;
      const v = viewRef.current;
      if (!v) return;
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          playback.toggle();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          playback.stepWindow(e.key === 'ArrowRight' ? 1 : -1);
          break;
        case 'Home':
          e.preventDefault();
          playback.seekIndex(0);
          break;
        case 'End':
          e.preventDefault();
          playback.seekIndex(v.n - 1);
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          playback.seekTime(v.jamT - 5);
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Keep-alive idle bound: performance.now comparisons, checked on activity and every 30 s.
  useEffect(() => {
    let lastActivity = performance.now();
    const busy = () => playback.isPlaying() || liveRunFlag.inFlight;
    const check = () => {
      if (endedRef.current) return;
      const now = performance.now();
      if (busy()) {
        lastActivity = now; // playing or computing counts as activity
        return;
      }
      if (now - lastActivity >= IDLE_LIMIT_MS) endRun(IDLE_MESSAGE);
    };
    const onActivity = () => {
      check();
      lastActivity = performance.now();
    };
    document.addEventListener('pointerdown', onActivity, true);
    document.addEventListener('keydown', onActivity, true);
    const offEnd = playback.on('end', () => { lastActivity = performance.now(); });
    const handle = globalThis.setInterval(check, IDLE_CHECK_MS);
    return () => {
      document.removeEventListener('pointerdown', onActivity, true);
      document.removeEventListener('keydown', onActivity, true);
      offEnd();
      globalThis.clearInterval(handle);
    };
  }, [endRun]);

  // Run live in-page (D-14/D-15): success swaps in the computed line for this line x sensor;
  // any failure falls back to the precomputed data with the same visuals and a danger notice.
  const onRunLive = useCallback(async () => {
    if (live.inFlight || endedRef.current || !activeSensor) return;
    const runLine = line;
    const runSensor = activeSensor;
    const label = sensorLabelOf(runSensor);
    playback.pause();
    setLiveDanger(null);
    setStatusMessage(null);
    announce(`${modeText(badgeText('computing'))} ${stageText(1)}`);
    setMode('computing');
    liveRunFlag.inFlight = true;
    let res;
    try {
      res = await live.start({
        line: runLine,
        sensor: runSensor,
        simulateFailure,
        onStage: (n) => { if (n > 1) announce(stageText(n)); },
      });
    } finally {
      liveRunFlag.inFlight = false;
    }
    if (res.ok) {
      setLiveOverride({ line: runLine, sensor: runSensor, data: res.line });
      announce(modeText(badgeText('computed')));
      setMode('computed');
      setStatusMessage(`Live run finished in ${(res.elapsedMs / 1000).toFixed(1)} s. Showing results computed in your browser.`);
      playback.pause();
      playback.seekIndex(0);
      return;
    }
    setLiveOverride(null);
    setMode('precomputed');
    playback.pause();
    playback.seekIndex(0);
    const why = res.reason.name === 'Timeout'
      ? 'Live run took longer than 90 s.'
      : `Live run failed: ${res.reason.name}: ${res.reason.message}.`;
    setLiveDanger(`${why} Showing the precomputed replay for ${runLine} / ${label}.`);
    announce(`${liveFailedText()} ${modeText(badgeText('precomputed'))}`);
  }, [live, line, activeSensor, simulateFailure]);

  const onLineChange = useCallback((id) => {
    setLiveDanger(null);
    playback.pause();
    playback.seekIndex(0);
    setLine(id);
    announce(`${selectionText(id, sensorLabelOf(activeSensor))}${modeSuffix('precomputed')}`);
  }, [activeSensor]);
  const onSensorChange = useCallback((s) => {
    setLiveDanger(null);
    playback.pause();
    playback.seekIndex(0);
    setSensor(s);
    announce(`${selectionText(line, sensorLabelOf(s))}${modeSuffix('precomputed')}`);
  }, [line]);
  const onToggleSeries = useCallback((key, on) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const loadError = status === 'error' ? error : viewError;
  const danger = loadError
    ? `Could not load the precomputed flight (${loadError}). Press Stop, then Run, to reload the project.`
    : liveDanger;
  const controlsDisabled = status !== 'ready' || !view;
  const lines = artifact ? artifact.lines.map((l) => String(l.line)) : [DEFAULT_LINE];
  const sensors = artifact ? artifact.sensors : Object.keys(SENSOR_LABELS);
  const sensorLabel = sensorLabelOf(activeSensor);
  const hasBackend = Boolean(qBackend) || import.meta.env.DEV;
  const liveControls = {
    enabled: hasBackend && !live.inFlight && !runEnded && !controlsDisabled,
    hasBackend,
    onRun: onRunLive,
    simulateFailure,
    onSimulateFailureChange: setSimulateFailure,
  };

  return (
    <main className="page">
      <header>
        <h1>Quantum MagNav: holding position without GPS</h1>
        <p className="intro">
          A real survey flight over the Ottawa magnetic anomaly map. After GPS is jammed, position comes only
          from matching the cleaned magnetometer signal against the map.
        </p>
      </header>

      <ControlBar
        lines={lines}
        sensors={sensors}
        line={line}
        sensor={activeSensor ?? 'mag_5_uc'}
        mapTrack={mapTrack}
        visible={visible}
        speed={speed}
        view={view}
        disabled={controlsDisabled}
        selectionLocked={live.inFlight}
        live={liveControls}
        onLineChange={onLineChange}
        onSensorChange={onSensorChange}
        onMapTrackChange={setMapTrack}
        onToggleSeries={onToggleSeries}
        onSpeedChange={setSpeed}
      />

      <StatusStrip
        mode={mode}
        message={statusMessage}
        jamT={view ? view.jamT : null}
        provenance={artifact?.provenance ?? null}
        danger={danger}
        onEndRun={() => endRun(RUN_ENDED_MESSAGE)}
        runEnded={runEnded}
        live={live.inFlight ? { stage: live.stage, progress: live.progress } : null}
        reduced={reduced}
      />

      <div className="jam-slot">
        <JamBanner view={view} />
      </div>

      <div className="main-grid">
        <MapView view={view} mapTrack={mapTrack} sensorLabel={sensorLabel} />
        <section className="signal-col">
          <SignalPanel view={view} visible={visible} />
        </section>
      </div>

      <section className="panel results" aria-labelledby="results-title">
        <h2 id="results-title">Navigation accuracy</h2>
        <MetricsTable view={view} sensor={activeSensor} mapTrack={mapTrack} />
        <TextAlternatives view={view} visible={visible} mapTrack={mapTrack} sensor={activeSensor} />
      </section>

      <Announcer />

      <footer>
        <p>This effort is supported by Qollab &amp; IonQ.</p>
        <p>Theme: Quantum Impact · MIT License</p>
      </footer>
    </main>
  );
}

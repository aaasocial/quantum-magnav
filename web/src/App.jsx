// Player shell: artifact load, selection state, layout slots, global keyboard map and the
// Qollab keep-alive. Per-frame state lives in the playback store, never in App state.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ControlBar from './components/ControlBar.jsx';
import StatusStrip from './components/StatusStrip.jsx';
import MapView from './components/MapView.jsx';
import { useArtifact } from './hooks/useArtifact.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { playback } from './hooks/usePlayback.js';
import { lineView, validateLine } from './lib/artifact.js';
import { logFrameProbe, logTimerProbe } from './probe.js';
import { SENSOR_LABELS } from './theme.js';

const DEFAULT_LINE = '1003.02';
const DEFAULT_TRACK = 'tl';
const DEFAULT_VISIBLE = ['raw', 'tl'];
const DEFAULT_SPEED = 60;
const IDLE_LIMIT_MS = 30 * 60 * 1000; // keep-alive bound: 30 min with no input
const IDLE_CHECK_MS = 30 * 1000;
const RUN_ENDED_MESSAGE = 'This run has ended. Press Stop, then Run, to start a new one.';
const IDLE_MESSAGE = `Keep-alive limit (30 min) reached. ${RUN_ENDED_MESSAGE}`;

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
  const [mode] = useState('precomputed');
  const [runEnded, setRunEnded] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const endedRef = useRef(false);

  const activeSensor = sensor ?? artifact?.default_sensor ?? null;

  const { view, viewError } = useMemo(() => {
    if (!artifact || !activeSensor) return { view: null, viewError: null };
    const entry = artifact.lines.find((l) => String(l.line) === line) ?? artifact.lines[0];
    const errs = validateLine(entry, activeSensor);
    if (errs.length) return { view: null, viewError: errs.slice(0, 3).join('; ') };
    return { view: lineView(entry, activeSensor), viewError: null };
  }, [artifact, line, activeSensor]);

  const viewRef = useRef(view);
  viewRef.current = view;

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

  const onLineChange = useCallback((id) => {
    playback.pause();
    playback.seekIndex(0);
    setLine(id);
  }, []);
  const onSensorChange = useCallback((s) => {
    playback.pause();
    playback.seekIndex(0);
    setSensor(s);
  }, []);
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
    : null;
  const controlsDisabled = status !== 'ready' || !view;
  const lines = artifact ? artifact.lines.map((l) => String(l.line)) : [DEFAULT_LINE];
  const sensors = artifact ? artifact.sensors : Object.keys(SENSOR_LABELS);
  const sensorLabel = activeSensor ? (SENSOR_LABELS[activeSensor] ?? activeSensor) : '';

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
      />

      <div className="jam-slot" />

      <div className="main-grid">
        <MapView view={view} mapTrack={mapTrack} sensorLabel={sensorLabel} />
        <section className="signal-col" />
      </div>

      <div className="results-slot" />

      <footer>
        <p>This effort is supported by Qollab &amp; IonQ.</p>
        <p>Theme: Quantum Impact · MIT License</p>
      </footer>
    </main>
  );
}

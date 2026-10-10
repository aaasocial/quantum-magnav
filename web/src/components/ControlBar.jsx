// Playback controls (D-01, D-11): native, labelled elements in UI-SPEC order. Only the leaf
// Scrubber, TimeReadout and PlayButton subscribe to the playback store, so the bar itself
// re-renders on selection changes only.
import { memo, useId } from 'react';
import { playback, usePlaybackIndex, usePlaybackPlaying, usePlaybackTime } from '../hooks/usePlayback.js';
import { fmtSeconds } from '../lib/format.js';
import { LINE_LABELS, SENSOR_LABELS, SERIES, SERIES_ORDER } from '../theme.js';

export const SPEEDS = [10, 60, 300];
const MAG4_HELP = 'Mag 4 sits closer to aircraft noise, so errors are larger. Results are shown unedited.';
const UNAVAILABLE_HELP = 'Not computed in live mode (skipped for time). Shown in the precomputed replay.';
const LIVE_HELP = 'Computes this line and sensor in your browser (up to 90 s). If it fails, the precomputed replay is shown instead.';
const LIVE_NO_BACKEND_HELP = 'Run live needs a backend: press Run on Qollab and pick one. The replay works without it.';

function PlayGlyph({ playing }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      {playing ? (
        <>
          <rect x="2" y="1" width="3.5" height="12" fill="currentColor" />
          <rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" />
        </>
      ) : (
        <path d="M3 1 L12.5 7 L3 13 Z" fill="currentColor" />
      )}
    </svg>
  );
}

const PlayButton = memo(function PlayButton({ disabled }) {
  const playing = usePlaybackPlaying();
  const text = playing ? 'Pause' : 'Play';
  return (
    <button type="button" className="btn-primary play-btn" aria-label={text} onClick={() => playback.toggle()} disabled={disabled}>
      <PlayGlyph playing={playing} />
      <span>{text}</span>
    </button>
  );
});

function onSliderKeyDown(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault();
      playback.stepWindow(e.key === 'ArrowRight' ? 1 : -1);
      break;
    case 'PageDown':
    case 'PageUp':
      e.preventDefault();
      playback.stepSeconds(e.key === 'PageUp' ? 60 : -60);
      break;
    default:
      break; // Home/End stay native; Space is not handled here (UI-SPEC Keyboard table)
  }
}

const Scrubber = memo(function Scrubber({ id, view, disabled }) {
  const idx = usePlaybackIndex();
  const n = view ? view.n : 1;
  const i = Math.min(idx, n - 1);
  const valueText = view
    ? `t = ${fmtSeconds(view.t[i])} s of ${fmtSeconds(view.tEnd)} s${i >= view.jamIdx ? ', GPS jammed' : ''}`
    : 'Loading';
  return (
    <input
      id={id}
      type="range"
      className="scrubber"
      min={0}
      max={Math.max(0, n - 1)}
      step={1}
      value={i}
      aria-valuetext={valueText}
      onChange={(e) => playback.seekIndex(Number(e.target.value))}
      onKeyDown={onSliderKeyDown}
      disabled={disabled}
    />
  );
});

const TimeReadout = memo(function TimeReadout({ view }) {
  const time = usePlaybackTime();
  return (
    <span className="time-readout">
      {view ? `t = ${fmtSeconds(time)} s / ${fmtSeconds(view.tEnd)} s` : 't = – s'}
    </span>
  );
});

function DashSwatch({ series }) {
  return (
    <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true" focusable="false" className="dash-swatch">
      <line
        x1="1"
        y1="5"
        x2="27"
        y2="5"
        stroke={series.color}
        strokeWidth="2"
        strokeDasharray={series.dash || undefined}
        strokeLinecap={series.key === 'quantum' ? 'round' : 'butt'}
      />
    </svg>
  );
}

export default function ControlBar({
  lines,
  sensors,
  line,
  sensor,
  mapTrack,
  visible,
  speed,
  view,
  disabled = false,
  selectionLocked = false,
  seriesDisabled = false,
  live = null,
  focusRefs = null,
  onLineChange,
  onSensorChange,
  onMapTrackChange,
  onToggleSeries,
  onSpeedChange,
  children,
}) {
  const lineId = useId();
  const sensorId = useId();
  const sensorHelpId = useId();
  const trackId = useId();
  const sliderId = useId();
  const speedId = useId();
  const unavailableHelpId = useId();
  const liveHelpId = useId();
  const simulateId = useId();
  const isAvailable = (k) => !view || view.available.has(k);
  const anyUnavailable = view ? SERIES_ORDER.some((k) => !view.available.has(k)) : false;
  const mag4 = sensor === 'mag_4_uc';

  return (
    <section className="panel control-bar" aria-label="Playback controls">
      <div className="control-row">
        <div className="field">
          <label htmlFor={lineId}>Flight line</label>
          <select
            id={lineId}
            ref={focusRefs?.line}
            value={line}
            onChange={(e) => onLineChange(e.target.value)}
            disabled={disabled || selectionLocked}
          >
            {lines.map((id) => <option key={id} value={id}>{LINE_LABELS[id] ?? id}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={sensorId}>Sensor</label>
          <select
            id={sensorId}
            ref={focusRefs?.sensor}
            value={sensor}
            onChange={(e) => onSensorChange(e.target.value)}
            disabled={disabled || selectionLocked}
            aria-describedby={mag4 ? sensorHelpId : undefined}
          >
            {sensors.map((s) => <option key={s} value={s}>{SENSOR_LABELS[s] ?? s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={trackId}>Track on map</label>
          <select id={trackId} value={mapTrack} onChange={(e) => onMapTrackChange(e.target.value)} disabled={disabled}>
            {SERIES_ORDER.map((k) => (
              <option key={k} value={k} disabled={!isAvailable(k)}>{SERIES[k].label}</option>
            ))}
          </select>
        </div>
        <div className="field field-button">
          <PlayButton disabled={disabled || !view} />
        </div>
        <div className="field field-slider">
          <label htmlFor={sliderId}>Flight time</label>
          <div className="slider-row">
            <Scrubber id={sliderId} view={view} disabled={disabled || !view} />
            <TimeReadout view={view} />
          </div>
        </div>
        <div className="field">
          <label htmlFor={speedId}>Speed</label>
          <select id={speedId} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} disabled={disabled}>
            {SPEEDS.map((s) => <option key={s} value={s}>{`${s}×`}</option>)}
          </select>
        </div>
        {live && (
          <div className="field field-button">
            <button
              type="button"
              className="btn-primary run-live"
              ref={focusRefs?.runLive}
              onClick={live.onRun}
              disabled={!live.enabled}
              aria-describedby={liveHelpId}
            >
              Run live in-page
            </button>
          </div>
        )}
        {children}
      </div>
      {mag4 && <p id={sensorHelpId} className="help">{MAG4_HELP}</p>}
      {live && (
        <div className="live-extra">
          <p id={liveHelpId} className="help">{live.hasBackend ? LIVE_HELP : LIVE_NO_BACKEND_HELP}</p>
          <details className="demo-options">
            <summary>Demo options</summary>
            <div className="demo-options-body">
              <input
                id={simulateId}
                type="checkbox"
                checked={live.simulateFailure}
                onChange={(e) => live.onSimulateFailureChange(e.target.checked)}
              />
              <label htmlFor={simulateId}>Simulate a compute failure</label>
            </div>
          </details>
        </div>
      )}
      <fieldset className="series-fieldset" disabled={seriesDisabled}>
        <legend>Signal series</legend>
        <div className="series-list">
          <span className="series-item series-fixed">
            <DashSwatch series={SERIES.truth} />
            <span>Truth (stinger), always shown</span>
          </span>
          {SERIES_ORDER.map((k) => {
            const s = SERIES[k];
            const ok = isAvailable(k);
            return (
              <label key={k} className="series-item">
                <input
                  type="checkbox"
                  checked={visible.has(k)}
                  onChange={(e) => onToggleSeries(k, e.target.checked)}
                  disabled={!ok}
                  aria-describedby={ok ? undefined : unavailableHelpId}
                />
                <DashSwatch series={s} />
                <span>{s.label}</span>
              </label>
            );
          })}
        </div>
        {anyUnavailable && <p id={unavailableHelpId} className="help">{UNAVAILABLE_HELP}</p>}
      </fieldset>
    </section>
  );
}

// Signal panel (UI-03, D-09): truth plus the toggled series, an RMSE badge per series from the
// artifact metrics, and a residual subplot from the metric start. The charts render only when
// (view, visible) change; the Playhead child is the only per-frame subscriber (RESEARCH Pattern 7).
import { memo, useId, useMemo, useSyncExternalStore } from 'react';
import {
  CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
  usePlotArea, useXAxisScale,
} from 'recharts';
import { playback } from '../hooks/usePlayback.js';
import { buildResidualRows, buildSignalRows } from '../lib/signal.js';
import { fmtInt, fmtSeconds } from '../lib/format.js';
import { ACCENT, GRID, JAM_COLOR, MUTED, SERIES, SERIES_ORDER, TRUTH } from '../theme.js';

const Y_AXIS_WIDTH = 56; // fixed so both plot areas align horizontally
const MARGIN = { top: 8, right: 16, bottom: 8, left: 0 };
const TICK = { fill: MUTED, fontSize: 12 };
const TOOLTIP_STYLE = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  color: 'var(--color-text)',
  fontSize: 13,
};
const QUANTUM_NOTE = 'Same as TL until Phase 4, so the lines overlap.';

// Quantum last so it is drawn on top of TL (the stub equals TL).
const DRAW_ORDER = [...SERIES_ORDER.filter((k) => k !== 'quantum'), 'quantum'];

function Playhead() {
  const t = useSyncExternalStore(playback.subscribe, playback.getTime);
  const x = useXAxisScale();
  const area = usePlotArea();
  if (!x || !area) return null;
  const px = x(t);
  if (!Number.isFinite(px)) return null;
  return (
    <line
      x1={px}
      x2={px}
      y1={area.y}
      y2={area.y + area.height}
      stroke={ACCENT}
      strokeWidth={1}
      aria-hidden="true"
      pointerEvents="none"
    />
  );
}

function Swatch({ series }) {
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

const rmseText = (m) => {
  const v = Number(m?.signal_rmse_nT);
  return Number.isFinite(v) ? `RMSE ${v.toFixed(1)} nT` : 'RMSE n/a';
};

const tooltipValue = (value, name) => [Number.isFinite(value) ? `${value.toFixed(1)} nT` : 'n/a', name];
const tooltipLabel = (t) => `t = ${fmtSeconds(t)} s`;

function seriesLine(k, dataKey) {
  const s = SERIES[k];
  return (
    <Line
      key={dataKey}
      dataKey={dataKey}
      name={s.label}
      stroke={s.color}
      strokeDasharray={s.dash || undefined}
      strokeLinecap={k === 'quantum' ? 'round' : 'butt'}
      dot={false}
      activeDot={false}
      isAnimationActive={false}
      strokeWidth={2}
      connectNulls={false}
    />
  );
}

function SignalPanel({ view, visible }) {
  const titleId = useId();
  const residualTitleId = useId();
  const keys = useMemo(
    () => (view ? DRAW_ORDER.filter((k) => visible.has(k) && view.available.has(k)) : []),
    [view, visible],
  );
  const rows = useMemo(() => (view ? buildSignalRows(view, keys) : []), [view, keys]);
  const resRows = useMemo(() => (view ? buildResidualRows(view, keys) : []), [view, keys]);

  if (!view) {
    return (
      <figure className="signal-figure" role="group" aria-labelledby={titleId} tabIndex={0}>
        <h2 id={titleId}>Magnetic signal</h2>
        <div className="signal-loading">Loading precomputed flight…</div>
      </figure>
    );
  }

  const legendKeys = SERIES_ORDER.filter((k) => keys.includes(k));
  const labels = legendKeys.map((k) => SERIES[k].label);
  const mainLabel = `Magnetic anomaly in nanotesla over flight time for truth${labels.length ? ` and ${labels.join(', ')}` : ''}. Data table available below.`;
  const domain = [0, view.tEnd];
  const xAxis = (
    <XAxis
      dataKey="t"
      type="number"
      domain={domain}
      allowDataOverflow
      tickCount={7}
      tick={TICK}
      stroke={GRID}
      tickFormatter={fmtInt}
    />
  );
  const yAxis = <YAxis width={Y_AXIS_WIDTH} tick={TICK} stroke={GRID} tickFormatter={fmtInt} />;
  const grid = <CartesianGrid stroke={GRID} strokeDasharray="2 4" />;
  const tooltip = (
    <Tooltip
      isAnimationActive={false}
      contentStyle={TOOLTIP_STYLE}
      labelStyle={{ color: 'var(--color-text)' }}
      formatter={tooltipValue}
      labelFormatter={tooltipLabel}
    />
  );
  const jamLine = (
    <ReferenceLine
      x={view.jamT}
      stroke={JAM_COLOR}
      strokeDasharray="4 2"
      label={{ value: 'GPS jammed', fill: JAM_COLOR, fontSize: 12, position: 'insideTopRight' }}
    />
  );

  return (
    <figure className="signal-figure" role="group" aria-labelledby={titleId} tabIndex={0}>
      <h2 id={titleId}>Magnetic signal</h2>
      <ul className="signal-legend">
        <li className="signal-legend-item">
          <Swatch series={TRUTH} />
          <span>{TRUTH.label}</span>
          <span className="rmse-badge rmse-badge-ref">reference</span>
        </li>
        {legendKeys.map((k) => (
          <li key={k} className="signal-legend-item">
            <Swatch series={SERIES[k]} />
            <span>{SERIES[k].label}</span>
            <span className="rmse-badge">{rmseText(view.metrics[k])}</span>
            {k === 'quantum' && <span className="legend-note">{QUANTUM_NOTE}</span>}
          </li>
        ))}
      </ul>
      {keys.length === 0 && <p className="help">Only truth is shown. Turn on a series above to compare.</p>}
      <div className="chart-box" role="img" aria-label={mainLabel}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={rows} accessibilityLayer={false} syncId="signal" margin={MARGIN}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {jamLine}
            <Line
              dataKey="truth"
              name={TRUTH.label}
              stroke={TRUTH.color}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              strokeWidth={2}
            />
            {keys.map((k) => seriesLine(k, k))}
            <Playhead />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <h3 id={residualTitleId} className="chart-title">Residual (series − truth), nT</h3>
      {keys.length === 0 ? (
        <p className="help residual-empty">Turn on a series to see its residual.</p>
      ) : (
        <div
          className="chart-box"
          role="img"
          aria-label="Residual of each series against truth after GPS loss, in nanotesla."
        >
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={resRows} accessibilityLayer={false} syncId="signal" margin={MARGIN}>
              {grid}
              {xAxis}
              {yAxis}
              {tooltip}
              {jamLine}
              {keys.map((k) => seriesLine(k, `${k}_res`))}
              <Playhead />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="help">{`RMSE is measured after GPS loss, from t = ${fmtSeconds(view.metricStartT)} s.`}</p>
    </figure>
  );
}

export default memo(SignalPanel);

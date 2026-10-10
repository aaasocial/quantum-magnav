// Navigation accuracy mini-table (UI-SPEC results section). Numbers come only from the
// artifact's lines[i].metrics; the UI never recomputes them.
import { memo } from 'react';
import { SENSOR_LABELS, SERIES, SERIES_ORDER } from '../theme.js';

const num1 = (v) => {
  const n = Number(v);
  return v === null || v === undefined || !Number.isFinite(n) ? 'n/a' : n.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
};

function Row({ label, m, rmse, current }) {
  return (
    <tr className={current ? 'row-current' : undefined}>
      <th scope="row">{current ? `${label} (on map)` : label}</th>
      <td>{num1(m?.mean_err_m)}</td>
      <td>{num1(m?.cep50_m)}</td>
      <td>{num1(m?.cep95_m)}</td>
      <td>{num1(m?.pct_under_556)}</td>
      <td>{rmse}</td>
    </tr>
  );
}

function MetricsTable({ view, sensor, mapTrack }) {
  if (!view) return null;
  const sensorLabel = SENSOR_LABELS[sensor] ?? sensor;
  const dens = SERIES_ORDER.filter((k) => view.available.has(k) && view.metrics[k]);
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption>{`Position error after GPS loss: line ${view.id}, ${sensorLabel}`}</caption>
        <thead>
          <tr>
            <th scope="col">Method</th>
            <th scope="col">Mean error (m)</th>
            <th scope="col">CEP50 (m)</th>
            <th scope="col">CEP95 (m)</th>
            <th scope="col">Under 556 m (%)</th>
            <th scope="col">Signal RMSE (nT)</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Dead reckoning" m={view.metrics.dead_reckoning} rmse="n/a" current={false} />
          {dens.map((k) => (
            <Row
              key={k}
              label={SERIES[k].label}
              m={view.metrics[k]}
              rmse={num1(view.metrics[k]?.signal_rmse_nT)}
              current={k === mapTrack}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default memo(MetricsTable);

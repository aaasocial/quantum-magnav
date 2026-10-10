// Table alternatives for the map and the signal charts (A11Y-02): rows every 60 s of flight
// time plus the jam row, in closed native <details>.
import { memo, useMemo } from 'react';
import { drErrorAt, errorAt } from '../lib/artifact.js';
import { fmtInt, fmtSeconds } from '../lib/format.js';
import { sampleIndices } from '../lib/signal.js';
import { SENSOR_LABELS, SERIES, SERIES_ORDER } from '../theme.js';

const nT = (v) => (Number.isFinite(v) ? v.toFixed(1) : 'n/a');

function TimeCell({ view, i }) {
  const jam = i === view.jamIdx;
  return <th scope="row">{jam ? `${fmtSeconds(view.t[i])} (GPS jammed)` : fmtSeconds(view.t[i])}</th>;
}

function TextAlternatives({ view, visible, mapTrack, sensor }) {
  const idx = useMemo(() => (view ? sampleIndices(view, 60) : []), [view]);
  if (!view) return null;
  const sensorLabel = SENSOR_LABELS[sensor] ?? sensor;
  const track = view.available.has(mapTrack) ? mapTrack : null;
  const trackLabel = track ? SERIES[track].label : 'Estimate';
  const keys = SERIES_ORDER.filter((k) => visible.has(k) && view.available.has(k));

  return (
    <div className="text-alternatives">
      <details>
        <summary>Map track data (every 60 s)</summary>
        <div className="table-scroll">
          <table className="data-table">
            <caption>{`Map track for line ${view.id}, ${sensorLabel}: truth position and position errors`}</caption>
            <thead>
              <tr>
                <th scope="col">t (s)</th>
                <th scope="col">Truth x (m)</th>
                <th scope="col">Truth y (m)</th>
                <th scope="col">{`${trackLabel} error (m)`}</th>
                <th scope="col">Dead reckoning error (m)</th>
              </tr>
            </thead>
            <tbody>
              {idx.map((i) => (
                <tr key={i}>
                  <TimeCell view={view} i={i} />
                  <td>{fmtInt(view.truth.x[i])}</td>
                  <td>{fmtInt(view.truth.y[i])}</td>
                  <td>{track ? fmtInt(errorAt(view, track, i)) : 'n/a'}</td>
                  <td>{fmtInt(drErrorAt(view, i))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details>
        <summary>Signal data (every 60 s)</summary>
        <div className="table-scroll">
          <table className="data-table">
            <caption>{`Magnetic signal for line ${view.id}, ${sensorLabel}, in nanotesla`}</caption>
            <thead>
              <tr>
                <th scope="col">t (s)</th>
                <th scope="col">Truth (nT)</th>
                {keys.map((k) => <th key={k} scope="col">{`${SERIES[k].label} (nT)`}</th>)}
              </tr>
            </thead>
            <tbody>
              {idx.map((i) => (
                <tr key={i}>
                  <TimeCell view={view} i={i} />
                  <td>{nT(view.truth.anomaly[i])}</td>
                  {keys.map((k) => <td key={k}>{nT(view.est[k].signal[i])}</td>)}
                </tr>
              ))}
            </tbody>
            {keys.length > 0 && (
              <tfoot>
                <tr>
                  <th scope="row">RMSE after GPS loss</th>
                  <td>reference</td>
                  {keys.map((k) => <td key={k}>{nT(Number(view.metrics[k]?.signal_rmse_nT))}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </details>
    </div>
  );
}

export default memo(TextAlternatives);

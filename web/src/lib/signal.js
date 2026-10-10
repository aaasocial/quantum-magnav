// Row builders for the signal panel and the 60 s text-alternative tables. Pure ESM so
// node --test can import it. Everything is indexed by the display index of lineView.

// Main chart rows: {t, truth, <key>: signal_nT} for every display index.
export function buildSignalRows(view, keys) {
  const ks = keys.filter((k) => view.est[k]);
  const rows = new Array(view.n);
  for (let i = 0; i < view.n; i += 1) {
    const row = { t: view.t[i], truth: view.truth.anomaly[i] };
    for (const k of ks) row[k] = view.est[k].signal[i];
    rows[i] = row;
  }
  return rows;
}

// Residual rows: {t, <key>_res: signal - truth} from the metric start on, null before it.
export function buildResidualRows(view, keys) {
  const ks = keys.filter((k) => view.est[k]);
  const rows = new Array(view.n);
  for (let i = 0; i < view.n; i += 1) {
    const row = { t: view.t[i] };
    const after = i >= view.metricStartIdx;
    for (const k of ks) row[`${k}_res`] = after ? view.est[k].signal[i] - view.truth.anomaly[i] : null;
    rows[i] = row;
  }
  return rows;
}

// Display indices nearest each multiple of everyS seconds of flight time, plus the jam index.
export function sampleIndices(view, everyS = 60) {
  const out = new Set([0, view.jamIdx]);
  let i = 0;
  for (let target = 0; target <= view.tEnd + 1e-9; target += everyS) {
    while (i + 1 < view.n && Math.abs(view.t[i + 1] - target) <= Math.abs(view.t[i] - target)) i += 1;
    out.add(i);
  }
  return [...out].sort((a, b) => a - b);
}

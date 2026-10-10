// RunArtifact v1 validation and the one normalized per-line view every component reads.
// Pure ESM (no JSX, no DOM) so node --test can import it. Works for the precomputed
// artifact's lines[i] and for a live_result `line` entry (one sensor, fewer denoisers).

const TOP_KEYS = [
  'schema_version', 'title', 'sensors', 'default_sensor', 'denoisers', 'thresholds_m',
  'provenance', 'lines', 'metrics_table', 'acceptance',
];
const LINE_KEYS = [
  'line', 'map_file', 'frame', 'map_preview', 'jam', 'metric_start_index', 't',
  'truth', 'dead_reckoning', 'estimates', 'metrics',
];

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const len = (v) => (Array.isArray(v) ? v.length : -1);

export function validateLine(line, sensor) {
  const errs = [];
  if (!isObj(line)) return ['line is not an object'];
  const id = String(line.line ?? '?');
  for (const k of LINE_KEYS) if (!(k in line)) errs.push(`line ${id}: missing ${k}`);
  if (errs.length) return errs;
  const n = len(line.t);
  if (n < 2) return [`line ${id}: t must have at least 2 points`];
  const want = (arr, name) => {
    if (len(arr) !== n) errs.push(`line ${id}: ${name} has ${len(arr)} points, t has ${n}`);
  };
  want(line.truth?.x, 'truth.x');
  want(line.truth?.y, 'truth.y');
  want(line.truth?.anomaly_nT, 'truth.anomaly_nT');
  want(line.dead_reckoning?.x, 'dead_reckoning.x');
  want(line.dead_reckoning?.y, 'dead_reckoning.y');
  const di = line.jam?.display_index;
  if (!Number.isInteger(di) || di < 0 || di >= n) errs.push(`line ${id}: jam.display_index ${di} out of range`);
  if (!(Number(line.jam?.index) > 0) || !Number.isFinite(Number(line.jam?.t_s))) {
    errs.push(`line ${id}: jam.index / jam.t_s invalid`);
  }
  const p = line.map_preview;
  if (!isObj(p) || len(p.nT) !== p.nx * p.ny || len(p.valid) !== p.nx * p.ny || p.nx < 2 || p.ny < 2) {
    errs.push(`line ${id}: map_preview grid does not match nx * ny`);
  }
  const est = line.estimates?.[sensor];
  if (!isObj(est) || Object.keys(est).length === 0) {
    errs.push(`line ${id}: no estimates for sensor ${sensor}`);
  } else {
    for (const [den, e] of Object.entries(est)) {
      want(e?.x, `${sensor}.${den}.x`);
      want(e?.y, `${sensor}.${den}.y`);
      want(e?.signal_nT, `${sensor}.${den}.signal_nT`);
      const w = len(e?.window_t);
      if (w < 0 || len(e?.ncc) !== w || len(e?.accepted) !== w) {
        errs.push(`line ${id}: ${sensor}.${den} window_t/ncc/accepted lengths disagree`);
      }
    }
  }
  if (!isObj(line.metrics?.dead_reckoning) || !isObj(line.metrics?.[sensor])) {
    errs.push(`line ${id}: metrics missing for dead_reckoning or ${sensor}`);
  }
  return errs;
}

export function validateArtifact(obj) {
  if (!isObj(obj)) return ['artifact is not an object'];
  const errs = [];
  if (obj.schema_version !== 1) errs.push(`unsupported schema_version ${obj.schema_version}`);
  for (const k of TOP_KEYS) if (!(k in obj)) errs.push(`missing ${k}`);
  if (!Array.isArray(obj.lines) || obj.lines.length === 0) {
    errs.push('lines must be a non-empty array');
    return errs;
  }
  for (const line of obj.lines) errs.push(...validateLine(line, obj.default_sensor));
  return errs;
}

// metric_start_index and jam.index are RAW-sample indices; convert through time (never index t with them).
export function metricStartT(line) {
  return (line.metric_start_index * line.jam.t_s) / line.jam.index;
}

function firstIndexAtOrAfter(t, time) {
  let lo = 0;
  let hi = t.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (t[mid] < time - 1e-9) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(lo, t.length - 1);
}

export function lineView(line, sensor) {
  const t = line.t;
  const msT = metricStartT(line);
  const est = {};
  for (const [den, e] of Object.entries(line.estimates[sensor] ?? {})) {
    est[den] = {
      x: e.x, y: e.y, signal: e.signal_nT, windowT: e.window_t, ncc: e.ncc, accepted: e.accepted,
    };
  }
  return {
    id: line.line,
    mapName: String(line.map_file).toLowerCase().includes('eastern') ? 'Eastern' : 'Renfrew',
    t,
    n: t.length,
    tEnd: t[t.length - 1],
    jamIdx: line.jam.display_index,
    jamT: line.jam.t_s,
    metricStartT: msT,
    metricStartIdx: firstIndexAtOrAfter(t, msT),
    truth: { x: line.truth.x, y: line.truth.y, anomaly: line.truth.anomaly_nT },
    dr: { x: line.dead_reckoning.x, y: line.dead_reckoning.y },
    est,
    available: new Set(Object.keys(est)),
    metrics: { dead_reckoning: line.metrics.dead_reckoning, ...(line.metrics[sensor] ?? {}) },
    preview: line.map_preview,
    frame: line.frame,
  };
}

// Euclidean position errors in metres at display index i (null if the series is absent).
export function errorAt(view, den, i) {
  const e = view.est[den];
  if (!e) return null;
  return Math.hypot(e.x[i] - view.truth.x[i], e.y[i] - view.truth.y[i]);
}

export function drErrorAt(view, i) {
  return Math.hypot(view.dr.x[i] - view.truth.x[i], view.dr.y[i] - view.truth.y[i]);
}

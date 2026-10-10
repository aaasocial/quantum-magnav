// Local stand-in for the Pyodide 'magnav.api' module (vite dev only, never bundled).
// Every function returns a JSON STRING, exactly like Python, so dev exercises JSON.parse
// and the same ok / error_type contract (03-01-SUMMARY "Exact JSON shapes").
const py = (impl) => ({ callPromising: async (...args) => impl(...args) });

export const backend_info = py(async () => JSON.stringify({
  name: 'dev-stub',
  class: 'DevStub',
  num_qubits: 24,
  noise_model: null,
  is_ionq: false,
  python: 'n/a (vite dev stub)',
  platform: 'browser-dev',
  qiskit: 'n/a',
  numpy: 'n/a',
  scipy: 'n/a',
  sklearn: 'n/a',
  qiskit_ionq: 'n/a',
  data_file: { note: 'stub' },
}));

export const run_bell_batch = py(async (_backend, n = 2, shots = 200) => JSON.stringify({
  ok: true,
  backend: 'dev-stub',
  n_circuits: n,
  shots,
  submit_to_result_s: 0.01,
  ordering_ok: true,
  counts: Array.from({ length: n }, (_, i) => (i % 2
    ? { '01': shots / 2, '10': shots / 2 }
    : { '00': shots / 2, '11': shots / 2 })),
}));

// ---- precomputed artifact (the real file, served by vite dev through server.fs.allow) ----

let artifactText = null;
async function loadArtifactText() {
  if (artifactText === null) {
    artifactText = (await import('../../../data/precomputed_run.json?raw')).default.trim();
  }
  return artifactText;
}

export const artifact_json = py(async () => '{"ok":true,"artifact":' + (await loadArtifactText()) + '}');

// ---- live run simulation (mirrors magnav/live.py + magnav/api.py live_*) ----

const HELD_OUT = ['1003.02', '1007.06'];
const SENSORS = ['mag_5_uc', 'mag_4_uc'];
const LIVE_ORDER = ['tl', 'raw', 'lowpass'];
const FIT_SEQUENCE = ['select', 'raw', 'lowpass', 'tl', 'quantum'];
const RESULT_ORDER = ['raw', 'lowpass', 'tl', 'quantum'];
const SKIPPABLE = ['raw', 'lowpass'];
const STAGE3_CALLS = 25;

let run = null;

// One macrotask tick (no timers: Qollab injects its own timer functions).
function tick() {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => { ch.port1.close(); resolve(); };
    ch.port2.postMessage(0);
  });
}

const ok = (payload) => JSON.stringify(payload);
const fail = (stage, errorType, error) => JSON.stringify({
  ok: false, stage, error_type: errorType, error: String(error).slice(0, 2000),
});
const elapsed = () => Math.round(performance.now() - run.t0) / 1000;
const currentStage = () => (run ? (run.phase === 'tercom' || run.phase === 'done' ? 3 : 2) : null);

function progress(fitting = null) {
  const total = run.windowsTotal;
  const done = run.phase === 'done';
  const name = run.phase === 'tercom' && run.current < run.order.length ? run.order[run.current] : null;
  return {
    ok: true,
    stage: currentStage(),
    fitting,
    fits_done: run.fitsDone,
    fits_total: FIT_SEQUENCE.length,
    denoiser: name,
    windows_done: done ? total : (name ? run.progress[name] ?? 0 : 0),
    windows_total: total,
    per_denoiser: Object.fromEntries(run.order.map((d) => [d, [run.progress[d] ?? 0, total]])),
    elapsed_s: elapsed(),
    done,
    skipped: [...run.skipped],
  };
}

function advance() {
  let budget = run.perCall;
  while (budget > 0 && run.current < run.order.length) {
    const name = run.order[run.current];
    const n = Math.min(budget, run.windowsTotal - run.progress[name]);
    run.progress[name] += n;
    budget -= n;
    if (run.progress[name] >= run.windowsTotal) {
      run.finished.add(name);
      run.current += 1;
      break; // like live.py _advance: a call ends at a denoiser boundary (CR-01)
    }
  }
  if (run.current >= run.order.length) run.phase = 'done';
}

export const live_start = py(async (_backend, line, sensor, simulateFailure = false) => {
  await tick();
  run = null;
  const lineId = String(line);
  const sensorId = String(sensor);
  if (!HELD_OUT.includes(lineId)) {
    return fail(1, 'ValueError', `unknown line '${lineId.slice(0, 40)}'; expected one of ${JSON.stringify(HELD_OUT)}`);
  }
  if (!SENSORS.includes(sensorId)) {
    return fail(1, 'ValueError', `unknown sensor '${sensorId.slice(0, 40)}'; expected one of ${JSON.stringify(SENSORS)}`);
  }
  if (simulateFailure || globalThis.__MAGNAV_DEV_FAIL__ === true) {
    return fail(1, 'RuntimeError', 'Simulated failure (demo of the fallback)');
  }
  const artifact = JSON.parse(await loadArtifactText());
  const entry = artifact.lines.find((l) => l.line === lineId);
  const windowsTotal = entry.estimates[sensorId].tl.window_t.length;
  run = {
    lineId, sensorId, entry, windowsTotal,
    t0: performance.now(),
    phase: 'fit', fitsDone: 0, order: [], current: 0,
    progress: {}, finished: new Set(), skipped: [], perCall: 1,
  };
  return ok({ ok: true, stage: 1, line: lineId, sensor: sensorId, windows_total: windowsTotal, order: [...LIVE_ORDER] });
});

export const live_step = py(async (_backend, _budgetMs = 250) => {
  await tick();
  if (!run) return fail(null, 'RuntimeError', 'No live run in progress: call live_start first');
  if (run.phase === 'fit') {
    if (run.fitsDone < FIT_SEQUENCE.length) {
      const fitting = FIT_SEQUENCE[run.fitsDone];
      run.fitsDone += 1;
      return ok(progress(fitting));
    }
    run.order = LIVE_ORDER.filter((d) => !run.skipped.includes(d));
    run.order.forEach((d) => { run.progress[d] = 0; });
    run.perCall = Math.max(1, Math.ceil((run.windowsTotal * run.order.length) / STAGE3_CALLS));
    run.phase = 'tercom';
  }
  if (run.phase === 'tercom') advance();
  return ok(progress());
});

export const live_skip = py(async (_backend, denoiser) => {
  await tick();
  if (!run) return fail(null, 'RuntimeError', 'No live run in progress: call live_start first');
  const den = String(denoiser);
  if (!SKIPPABLE.includes(den)) {
    return fail(currentStage(), 'ValueError', `only ${JSON.stringify(SKIPPABLE)} can be skipped, not '${den.slice(0, 40)}'`);
  }
  if (run.finished.has(den)) return fail(currentStage(), 'ValueError', `${den} already finished`);
  if (!run.skipped.includes(den)) {
    run.skipped.push(den);
    const i = run.order.indexOf(den);
    if (i >= 0) {
      run.order.splice(i, 1);
      delete run.progress[den];
      if (i < run.current) run.current -= 1;
      if (run.phase === 'tercom' && run.current >= run.order.length) run.phase = 'done';
    }
  }
  return ok({ ok: true, skipped: [...run.skipped] });
});

export const live_result = py(async () => {
  await tick();
  if (!run) return fail(null, 'RuntimeError', 'No live run in progress: call live_start first');
  if (run.phase !== 'done') return fail(4, 'RuntimeError', 'Live run not finished: call live_step until done');
  const { entry, sensorId, lineId } = run;
  const computed = RESULT_ORDER.filter((d) => !run.skipped.includes(d));
  const pick = (obj) => Object.fromEntries(computed.map((d) => [d, obj[d]]));
  const line = {
    line: entry.line,
    map_file: entry.map_file,
    frame: entry.frame,
    map_preview: entry.map_preview,
    jam: entry.jam,
    metric_start_index: entry.metric_start_index,
    t: entry.t,
    truth: entry.truth,
    dead_reckoning: entry.dead_reckoning,
    estimates: { [sensorId]: pick(entry.estimates[sensorId]) },
    metrics: { dead_reckoning: entry.metrics.dead_reckoning, [sensorId]: pick(entry.metrics[sensorId]) },
  };
  const out = {
    ok: true, line_id: lineId, sensor: sensorId, computed, skipped: [...run.skipped], elapsed_s: elapsed(), line,
  };
  run = null;
  return ok(out);
});

export const live_cancel = py(async () => {
  run = null;
  return '{"ok":true}';
});

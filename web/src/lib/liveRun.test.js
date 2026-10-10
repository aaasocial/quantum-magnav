import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLine } from './artifact.js';
import { DEADLINE_MS, SKIP_PROJECTION_MS, createLiveRunner, liveProgress, runLive } from './liveRun.js';

const ARTIFACT = JSON.parse(readFileSync(new URL('../../../data/precomputed_run.json', import.meta.url), 'utf8'));
const LINE_1003 = ARTIFACT.lines.find((l) => l.line === '1003.02');
const FITS = ['select', 'raw', 'lowpass', 'tl', 'quantum'];

// A scripted stand-in for magnav.api live_*: a fake clock advanced by each call, stage-2 fit
// calls, then stage-3 calls that advance one denoiser at a time (tl, raw, lowpass) by up to
// `perStep` windows at `msPerWindow[den]` each. Every call is recorded with the clock value.
//
// Same contract as magnav/live.py `_advance` (CR-01): a stage-3 call crosses at most ONE
// denoiser boundary and never starts the next denoiser in the call that finished the previous
// one. `stopLag` models the Python generator whose last yield reports windows_done == total
// while its StopIteration only comes on the next call (an extra call with no new windows).
function makeSim({
  windows = 10, perStep = 5, startMs = 0, fitMs = 1000, msPerWindow = { tl: 100, raw: 100, lowpass: 100 },
  failAt = null, result = null, stopLag = false,
} = {}) {
  const clock = { t: 0 };
  const calls = [];
  const s = {
    fits: 0, order: ['tl', 'raw', 'lowpass'], progress: {}, finished: new Set(), skipped: [], done: false, steps: 0,
  };
  const perDen = () => Object.fromEntries(s.order.map((d) => [d, [s.progress[d] ?? 0, windows]]));
  const stepJson = (extra) => ({
    ok: true, fits_done: s.fits, fits_total: 5, windows_total: windows, per_denoiser: perDen(),
    elapsed_s: clock.t / 1000, done: s.done, skipped: [...s.skipped], ...extra,
  });
  async function callPy(name, ...args) {
    calls.push({ name, args, at: clock.t });
    if (failAt) {
      const f = failAt(name, calls.filter((c) => c.name === name).length);
      if (f instanceof Error) throw f;
      if (f) return f;
    }
    switch (name) {
      case 'live_start':
        clock.t += startMs;
        return { ok: true, stage: 1, windows_total: windows, order: ['tl', 'raw', 'lowpass'] };
      case 'live_step': {
        s.steps += 1;
        if (s.fits < FITS.length) {
          clock.t += fitMs;
          s.fits += 1;
          return stepJson({ stage: 2, fitting: FITS[s.fits - 1], denoiser: null, windows_done: 0, per_denoiser: {} });
        }
        const cur = s.order.find((d) => !s.finished.has(d));
        if (cur) {
          if ((s.progress[cur] ?? 0) >= windows) {
            s.finished.add(cur); // the lagging StopIteration: this call ends at the boundary
          } else {
            const n = Math.min(perStep, windows - (s.progress[cur] ?? 0));
            s.progress[cur] = (s.progress[cur] ?? 0) + n;
            clock.t += n * msPerWindow[cur];
            if (s.progress[cur] >= windows && !stopLag) s.finished.add(cur); // ends the call too
          }
        }
        s.done = s.order.every((d) => s.finished.has(d));
        const next = s.order.find((d) => !s.finished.has(d)) ?? null;
        return stepJson({ stage: 3, fitting: null, denoiser: s.done ? null : next, windows_done: next ? (s.progress[next] ?? 0) : windows });
      }
      case 'live_skip':
        if (s.finished.has(args[0])) return { ok: false, error_type: 'ValueError', error: `${args[0]} already finished` };
        s.skipped.push(args[0]);
        s.order = s.order.filter((d) => d !== args[0]);
        return { ok: true, skipped: [...s.skipped] };
      case 'live_result':
        return result ?? {
          ok: true, computed: ['tl', 'quantum'].concat(['raw', 'lowpass'].filter((d) => !s.skipped.includes(d))),
          skipped: [...s.skipped], elapsed_s: clock.t / 1000, line: LINE_1003,
        };
      case 'live_cancel':
        return { ok: true };
      default:
        throw new Error(`unexpected ${name}`);
    }
  }
  return { clock, calls, callPy, s, names: () => calls.map((c) => c.name) };
}

function deps(sim, extra = {}) {
  const stages = [];
  const steps = [];
  return {
    stages,
    steps,
    args: {
      line: '1003.02',
      sensor: 'mag_5_uc',
      simulateFailure: false,
      callPy: sim.callPy,
      now: () => sim.clock.t,
      yieldFn: async () => {},
      validate: validateLine,
      onStage: (n) => stages.push(n),
      onStep: (json, ms) => steps.push({ json, ms }),
      ...extra,
    },
  };
}

test('constants match the D-14 budget', () => {
  assert.equal(DEADLINE_MS, 90000);
  assert.equal(SKIP_PROJECTION_MS, 80000);
});

test('happy path: start, 5 fit steps, stage-3 steps until done, result; stages 1-4 in order', async () => {
  const sim = makeSim();
  const d = deps(sim);
  const res = await runLive(d.args);
  assert.equal(res.ok, true, JSON.stringify(res.reason));
  assert.equal(res.line, LINE_1003);
  assert.ok(Number.isFinite(res.elapsedMs));
  assert.deepEqual(d.stages, [1, 2, 3, 4]);
  const names = sim.names();
  assert.equal(names[0], 'live_start');
  assert.deepEqual(sim.calls[0].args, ['1003.02', 'mag_5_uc', false]);
  assert.equal(names.at(-1), 'live_result');
  assert.ok(!names.includes('live_cancel'));
  assert.ok(!names.includes('live_skip'));
  assert.equal(names.filter((n) => n === 'live_step').length, 5 + 6); // 3 denoisers x 10 windows / 5
  assert.equal(d.steps.length, 11);
  assert.equal(sim.calls[1].args[0], 250);
});

test('callPy throwing on the 3rd live_step fails with the JS error name and cancels', async () => {
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 3 ? new Error('bridge broke') : null) });
  const d = deps(sim);
  const res = await runLive(d.args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Error');
  assert.equal(res.reason.message, 'bridge broke');
  assert.equal(res.stage, 2);
  assert.equal(sim.names().at(-1), 'live_cancel');
});

test('live_step ok:false becomes an error named by error_type and cancels', async () => {
  const sim = makeSim({
    failAt: (name, n) => (name === 'live_step' && n === 7
      ? { ok: false, stage: 3, error_type: 'RuntimeError', error: 'boom' } : null),
  });
  const d = deps(sim);
  const res = await runLive(d.args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'RuntimeError');
  assert.equal(res.reason.message, 'boom');
  assert.equal(res.stage, 3);
  assert.equal(sim.names().at(-1), 'live_cancel');
  assert.ok(!sim.names().includes('live_result'));
});

test('simulateFailure: live_start returns the RuntimeError JSON, stage 1, cancel called', async () => {
  const sim = makeSim({
    failAt: (name, _n) => (name === 'live_start'
      ? { ok: false, stage: 1, error_type: 'RuntimeError', error: 'Simulated failure (demo of the fallback)' } : null),
  });
  const d = deps(sim, { simulateFailure: true });
  const res = await runLive(d.args);
  assert.equal(res.ok, false);
  assert.equal(res.stage, 1);
  assert.equal(res.reason.name, 'RuntimeError');
  assert.match(res.reason.message, /Simulated failure/);
  assert.deepEqual(sim.calls[0].args, ['1003.02', 'mag_5_uc', true]);
  assert.deepEqual(sim.names(), ['live_start', 'live_cancel']);
});

test('a result line that fails validation is InvalidShape and cancels', async () => {
  const sim = makeSim();
  const d = deps(sim, { validate: () => ['bad length'] });
  const res = await runLive(d.args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'InvalidShape');
  assert.match(res.reason.message, /bad length/);
  assert.equal(res.stage, 4);
  assert.equal(sim.names().at(-1), 'live_cancel');
});

test('a live_result without a line is InvalidShape', async () => {
  const sim = makeSim({ result: { ok: true, computed: [], skipped: [], elapsed_s: 1 } });
  const res = await runLive(deps(sim).args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'InvalidShape');
});

test('deadline passed before a live_step: Timeout and no further live_step', async () => {
  // Stage 3 at 10 s per window: 5 windows per call = 50 s per call.
  const sim = makeSim({ msPerWindow: { tl: 10000, raw: 10000, lowpass: 10000 } });
  const res = await runLive(deps(sim).args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Timeout');
  const steps = sim.calls.filter((c) => c.name === 'live_step');
  assert.ok(steps.every((c) => c.at <= DEADLINE_MS), JSON.stringify(steps.map((c) => c.at)));
  assert.ok(sim.clock.t > DEADLINE_MS);
  assert.equal(sim.names().at(-1), 'live_cancel');
  assert.ok(!sim.names().includes('live_result'));
});

test('deadline is checked again before live_result', async () => {
  // Everything finishes at 89 s; the yield before the result lets the clock reach 90.001 s.
  const sim = makeSim({ fitMs: 0, msPerWindow: { tl: 2900, raw: 2900, lowpass: 2900 }, windows: 10, perStep: 10 });
  // 3 x 10 x 2.9 s = 87 s; add 2 s at start to finish at 89 s.
  const d = deps(sim, {
    yieldFn: async () => { if (sim.s.done) sim.clock.t = 90001; },
  });
  sim.clock.t = 0;
  const startSim = sim.callPy;
  d.args.callPy = async (name, ...args) => {
    const r = await startSim(name, ...args);
    if (name === 'live_start') sim.clock.t += 2000;
    return r;
  };
  // The 29 s projection asks to skip lowpass at 60 s; this fake ignores the skip so every
  // denoiser still runs and the last step ends at 89 s.
  d.args.callPy = wrapIgnoreSkip(d.args.callPy);
  const res = await runLive(d.args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Timeout');
  assert.ok(sim.s.done, 'all steps finished');
  assert.ok(!sim.names().includes('live_result'));
  assert.equal(sim.names().at(-1), 'live_cancel');
});

// Answers live_skip with ok but leaves the simulated run unchanged.
function wrapIgnoreSkip(callPy) {
  return async (name, ...args) => {
    if (name === 'live_skip') return { ok: true, skipped: [] };
    return callPy(name, ...args);
  };
}

test('skip projection: raw kept at 40 + 25 s, lowpass skipped at 70 + 25 s', async () => {
  // Stage 2 ends at 15 s; tl takes 25 s (done at 40 s); raw 30 s (done at 70 s).
  const sim = makeSim({ fitMs: 3000, windows: 10, perStep: 5, msPerWindow: { tl: 2500, raw: 3000, lowpass: 2500 } });
  const res = await runLive(deps(sim).args);
  assert.equal(res.ok, true, JSON.stringify(res.reason));
  const skips = sim.calls.filter((c) => c.name === 'live_skip');
  assert.deepEqual(skips.map((c) => c.args[0]), ['lowpass']);
  assert.equal(skips[0].at, 70000);
  assert.ok(sim.calls.findIndex((c) => c.name === 'live_skip') > 0);
  assert.equal(sim.s.progress.raw, 10);
  assert.deepEqual(res.skipped, ['lowpass']);
});

test('skip projection: tl done at 60 s skips raw and lowpass', async () => {
  // Stage 2 ends at 35 s; tl takes 25 s (done at 60 s); 60 + 25 > 80 for both.
  const sim = makeSim({ fitMs: 7000, windows: 10, perStep: 5, msPerWindow: { tl: 2500, raw: 2500, lowpass: 2500 } });
  const res = await runLive(deps(sim).args);
  assert.equal(res.ok, true, JSON.stringify(res.reason));
  assert.deepEqual(sim.calls.filter((c) => c.name === 'live_skip').map((c) => c.args[0]), ['raw', 'lowpass']);
  assert.equal(sim.s.progress.raw, undefined);
  assert.deepEqual(res.skipped, ['raw', 'lowpass']);
});

// CR-01: the real sequencing. tl finishes INSIDE a step (12 windows, 5 per call: the third
// call does only 2) at exactly 80 s; raw has not started, so it and lowpass are skipped and the
// finished tl result is still returned (no Timeout).
for (const stopLag of [false, true]) {
  test(`skip projection with tl finishing inside a step at 80 s (stopLag ${stopLag})`, async () => {
    // Stage 2: 5 fits x 10 s = 50 s; tl: 12 windows x 2.5 s = 30 s -> done at 80 s.
    const sim = makeSim({ fitMs: 10000, windows: 12, perStep: 5, stopLag, msPerWindow: { tl: 2500, raw: 2500, lowpass: 2500 } });
    const d = deps(sim);
    const res = await runLive(d.args);
    assert.equal(res.ok, true, JSON.stringify(res.reason));
    const skips = sim.calls.filter((c) => c.name === 'live_skip');
    assert.deepEqual(skips.map((c) => c.args[0]), ['raw', 'lowpass']);
    assert.ok(skips.every((c) => c.at === 80000), JSON.stringify(skips.map((c) => c.at)));
    assert.equal(sim.s.progress.raw, undefined, 'raw never started');
    assert.equal(sim.s.progress.lowpass, undefined, 'lowpass never started');
    assert.deepEqual(res.skipped, ['raw', 'lowpass']);
    assert.ok(res.computed.includes('tl'));
    assert.equal(res.line, LINE_1003);
    assert.equal(sim.names().at(-1), 'live_result');
    // Every stage-3 step the driver saw crossed at most one denoiser boundary.
    for (const { json } of d.steps.filter((x) => x.json.stage === 3)) {
      const running = Object.values(json.per_denoiser).filter(([a, b]) => a > 0 && a < b);
      assert.ok(running.length <= 1, JSON.stringify(json.per_denoiser));
    }
  });
}

test('createLiveRunner: a second start while in flight is Busy and calls no Python', async () => {
  const sim = makeSim();
  const d = deps(sim);
  const { line, sensor, simulateFailure, onStage, onStep, ...rest } = d.args;
  const runner = createLiveRunner(rest);
  assert.equal(runner.isInFlight(), false);
  const first = runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(runner.isInFlight(), true);
  const before = sim.calls.length;
  const second = runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(sim.calls.length, before);
  const r2 = await second;
  assert.equal(r2.ok, false);
  assert.equal(r2.reason.name, 'Busy');
  const r1 = await first;
  assert.equal(r1.ok, true);
  assert.equal(runner.isInFlight(), false);
  const r3 = await runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(r3.ok, true);
});

test('createLiveRunner clears the in-flight flag after a failure', async () => {
  const sim = makeSim({ failAt: (name) => (name === 'live_start' ? new Error('nope') : null) });
  const { line, sensor, simulateFailure, onStage, onStep, ...rest } = deps(sim).args;
  const runner = createLiveRunner(rest);
  const r = await runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(r.ok, false);
  assert.equal(runner.isInFlight(), false);
});

test('createLiveRunner.cancel stops at the next Python call, cancels in Python and resolves Cancelled', async () => {
  const sim = makeSim();
  let runner = null;
  let cancelP = null;
  let steps = 0;
  const { line, sensor, simulateFailure, onStage, onStep, ...rest } = deps(sim, {
    yieldFn: async () => {
      steps += 1;
      if (steps === 3) cancelP = runner.cancel();
    },
  }).args;
  runner = createLiveRunner(rest);
  assert.equal(await runner.cancel(), null, 'cancel while idle is a no-op');
  const res = await runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Cancelled');
  assert.equal(await cancelP, res, 'cancel() resolves with the run result');
  const names = sim.names();
  assert.equal(names.filter((n) => n === 'live_step').length, 3);
  assert.equal(names.at(-1), 'live_cancel');
  assert.ok(!names.includes('live_result'));
  assert.equal(runner.isInFlight(), false);
  const again = await runner.start({ line, sensor, simulateFailure, onStage, onStep });
  assert.equal(again.ok, true, 'a cancel does not leak into the next run');
});

test('liveProgress reports the current denoiser\'s own windows and its position k of K', () => {
  const step = {
    stage: 3, denoiser: 'raw', windows_done: 72, windows_total: 278, fitting: null,
    per_denoiser: { tl: [278, 278], raw: [72, 278], lowpass: [0, 278] },
  };
  assert.deepEqual(liveProgress(step), {
    windowsDone: 72, windowsTotal: 278, denoiser: 'raw', denoiserIndex: 2, denoiserCount: 3, fitting: null,
  });
  // After skips only the remaining denoisers count.
  const skipped = liveProgress({ stage: 3, denoiser: 'tl', windows_done: 10, windows_total: 278, per_denoiser: { tl: [10, 278] } });
  assert.equal(skipped.denoiserIndex, 1);
  assert.equal(skipped.denoiserCount, 1);
  // Stage 2 has no denoiser yet.
  const fit = liveProgress({ stage: 2, fitting: 'tl', denoiser: null, windows_done: 0, windows_total: 278, per_denoiser: {} });
  assert.equal(fit.denoiserIndex, 0);
  assert.equal(fit.fitting, 'tl');
});

// ---- WR-05: watchdog on a single Python call ----

// A tick that is one macrotask and advances the fake clock by stepMs (a frame of wall time).
const tickBy = (sim, stepMs) => () => new Promise((resolve) => {
  setImmediate(() => { sim.clock.t += stepMs; resolve(); });
});

test('watchdog: a normal run with a ticking watchdog still succeeds', async () => {
  const sim = makeSim();
  const res = await runLive(deps(sim, { tick: tickBy(sim, 0) }).args);
  assert.equal(res.ok, true, JSON.stringify(res.reason));
  assert.equal(sim.names().at(-1), 'live_result');
});

test('watchdog: a call that never returns fails with Timeout once the deadline passes', async () => {
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 3 ? new Promise(() => {}) : null) });
  const res = await runLive(deps(sim, { tick: tickBy(sim, 1000) }).args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Timeout');
  assert.ok(res.elapsedMs > DEADLINE_MS && res.elapsedMs <= DEADLINE_MS + 1000, String(res.elapsedMs));
  assert.equal(sim.names().at(-1), 'live_cancel', 'live_cancel is queued behind the hung call');
  assert.ok(!sim.names().includes('live_result'));
});

test('watchdog: the late result of an abandoned call is discarded', async () => {
  let release;
  const late = new Promise((resolve) => { release = resolve; });
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 6 ? late : null) });
  const res = await runLive(deps(sim, { tick: tickBy(sim, 5000) }).args);
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Timeout');
  const before = sim.names().length;
  release({ ok: true, stage: 3, done: true, per_denoiser: {} }); // the call finally returns
  await new Promise((r) => setImmediate(r));
  assert.equal(sim.names().length, before, 'no Python call follows the late result');
  assert.equal(res.reason.name, 'Timeout');
});

test('watchdog: cancel() ends the run while a call is still pending', async () => {
  const sim = makeSim({ failAt: (name, n) => (name === 'live_step' && n === 2 ? new Promise(() => {}) : null) });
  const { line, sensor, simulateFailure, onStage, onStep, ...rest } = deps(sim, { tick: tickBy(sim, 10) }).args;
  const runner = createLiveRunner(rest);
  const run = runner.start({ line, sensor, simulateFailure, onStage, onStep });
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  const res = await runner.cancel();
  assert.equal(res.ok, false);
  assert.equal(res.reason.name, 'Cancelled');
  assert.equal(await run, res);
  assert.ok(res.elapsedMs < DEADLINE_MS);
  assert.equal(runner.isInFlight(), false);
});

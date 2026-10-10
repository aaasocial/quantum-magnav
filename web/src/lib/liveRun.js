// Live-run driver (D-14/D-15, RESEARCH Patterns 4 and 5). Pure ESM: the Python calls, the clock
// and the yield between chunks are injected, so node --test can prove every decision.
//
// Sequence: live_start -> live_step(250) until done (stage 2 = one fit per call, stage 3 = map
// matching in ~250 ms chunks) -> live_result. The 90 s deadline is checked before EVERY
// live_step and again before live_result. After tl finishes, raw and then lowpass are skipped
// when elapsed + projected (tl's own duration) would pass 80 s. Any failure cancels the run.
// cancel() (End run during a live run, WR-01) is honoured before every Python call and ends
// the run with reason Cancelled, after live_cancel has cleared the Python state.
//
// Watchdog (WR-05): with an injected `tick` (one animation frame in the app), every Python call
// is raced against the deadline and cancel(), re-checked on each tick with the injected clock.
// A call that outlives the 90 s deadline is ABANDONED: the run fails with Timeout at once (the
// UI falls back), its late result is ignored, and live_cancel is queued behind it without being
// awaited. Pyodide cannot interrupt Python running on the page's thread: the bridge queue only
// moves on once that call returns, and a truly hung call keeps the queue blocked.

export const DEADLINE_MS = 90000;
export const SKIP_PROJECTION_MS = 80000;
export const STEP_BUDGET_MS = 250;
const SKIPPABLE = ['raw', 'lowpass'];

function namedError(name, message) {
  const e = new Error(message);
  e.name = name;
  return e;
}

// ok:false from Python becomes an Error named by its error_type.
function checkOk(res, what) {
  if (!res || typeof res !== 'object') throw namedError('InvalidShape', `${what} returned no JSON object`);
  if (res.ok !== true) {
    throw namedError(String(res.error_type ?? 'Error'), String(res.error ?? `${what} failed`));
  }
  return res;
}

export async function runLive({
  line, sensor, simulateFailure = false, callPy, now, yieldFn, validate,
  onStage = () => {}, onStep = () => {}, isCancelled = () => false, tick = null,
}) {
  const t0 = now();
  const elapsed = () => now() - t0;
  let stage = 0;
  const enter = (n) => {
    if (n > stage) {
      stage = n;
      onStage(n);
    }
  };
  const checkDeadline = () => {
    if (isCancelled()) throw namedError('Cancelled', 'Live run cancelled');
    if (elapsed() > DEADLINE_MS) throw namedError('Timeout', 'Live run took longer than 90 s');
  };

  // Races one Python call against the deadline and cancel() (no-op without a tick function).
  const call = async (...args) => {
    const p = Promise.resolve(callPy(...args));
    if (!tick) return p;
    let settled = false;
    const watch = (async () => {
      while (!settled) {
        await tick();
        if (settled) return undefined;
        let err = null;
        if (isCancelled()) err = namedError('Cancelled', 'Live run cancelled');
        else if (elapsed() > DEADLINE_MS) err = namedError('Timeout', 'Live run took longer than 90 s');
        if (err) {
          err.abandoned = true;
          p.catch(() => {}); // the late result (or error) of the abandoned call is discarded
          throw err;
        }
      }
      return undefined;
    })();
    try {
      return await Promise.race([p, watch]);
    } finally {
      settled = true;
    }
  };

  const skipped = [];
  let stage3StartMs = null; // elapsed time when map matching began (end of the last fit call)
  let tlMs = null; // tl's measured duration = projected duration of each remaining denoiser

  try {
    enter(1);
    checkOk(await call('live_start', line, sensor, Boolean(simulateFailure)), 'live_start');

    for (;;) {
      checkDeadline();
      const c0 = now();
      const step = checkOk(await call('live_step', STEP_BUDGET_MS), 'live_step');
      const callMs = now() - c0;
      if (step.stage === 2) {
        enter(2);
        stage3StartMs = elapsed();
      } else if (step.stage === 3) {
        enter(3);
        if (stage3StartMs === null) stage3StartMs = elapsed() - callMs;
      }
      onStep(step, callMs);
      if (step.done) break;

      const per = step.per_denoiser ?? {};
      const tl = per.tl;
      if (tlMs === null && Array.isArray(tl) && tl[1] > 0 && tl[0] >= tl[1]) {
        tlMs = Math.max(0, elapsed() - (stage3StartMs ?? 0));
      }
      if (tlMs !== null) {
        // Evaluate raw, then lowpass, only once everything before it has finished or been skipped.
        for (const den of SKIPPABLE) {
          const p = per[den];
          if (skipped.includes(den) || !Array.isArray(p)) continue;
          if (p[0] >= p[1]) continue; // finished
          if (p[0] > 0) break; // running: it decides the timing of the ones after it
          if (elapsed() + tlMs > SKIP_PROJECTION_MS) {
            checkDeadline();
            checkOk(await call('live_skip', den), 'live_skip');
            skipped.push(den);
            continue;
          }
          break;
        }
      }
      await yieldFn();
    }

    await yieldFn();
    checkDeadline();
    enter(4);
    const res = checkOk(await call('live_result'), 'live_result');
    if (!res.line || typeof res.line !== 'object') throw namedError('InvalidShape', 'live_result has no line');
    const problems = validate(res.line, sensor);
    if (problems.length) throw namedError('InvalidShape', problems.slice(0, 3).join('; '));
    return {
      ok: true,
      line: res.line,
      computed: res.computed ?? [],
      skipped: res.skipped ?? skipped,
      elapsedMs: elapsed(),
    };
  } catch (err) {
    try {
      const cancelled = Promise.resolve(callPy('live_cancel'));
      // An abandoned call still holds the bridge queue: queue the cancel, do not wait for it.
      if (err?.abandoned) cancelled.catch(() => {});
      else await cancelled;
    } catch {
      // best effort: the run is already failing
    }
    return {
      ok: false,
      reason: { name: String(err?.name ?? 'Error'), message: String(err?.message ?? err) },
      stage: stage || 1,
      elapsedMs: elapsed(),
      skipped,
    };
  }
}

// Progress for the status strip from one live_step JSON (WR-04): the CURRENT denoiser's own
// window count (never a sum across denoisers) and its position k of K in the run order.
export function liveProgress(step) {
  const per = step?.per_denoiser ?? {};
  const order = Object.keys(per);
  const denoiser = step?.denoiser ?? null;
  const k = denoiser ? order.indexOf(denoiser) + 1 : 0;
  const own = k > 0 && Array.isArray(per[denoiser]) ? per[denoiser] : null;
  return {
    windowsDone: own ? own[0] : (step?.windows_done ?? 0),
    windowsTotal: own ? own[1] : (step?.windows_total ?? 0),
    denoiser,
    denoiserIndex: k,
    denoiserCount: order.length,
    fitting: step?.fitting ?? null,
  };
}

// One live run at a time. The in-flight flag is set before the first await (Pitfall 8), so a
// second start() is refused without touching Python. cancel() asks the run in flight to stop
// at its next Python call and resolves with that run's (Cancelled) result; null when idle.
export function createLiveRunner(deps) {
  let inFlight = false;
  let cancelRequested = false;
  let current = null;
  return {
    isInFlight: () => inFlight,
    start(args) {
      if (inFlight) {
        return Promise.resolve({ ok: false, reason: { name: 'Busy', message: 'A live run is already in progress' } });
      }
      inFlight = true;
      cancelRequested = false;
      current = runLive({ ...deps, ...args, isCancelled: () => cancelRequested }).finally(() => {
        inFlight = false;
        current = null;
      });
      return current;
    },
    cancel() {
      if (!inFlight) return Promise.resolve(null);
      cancelRequested = true;
      return current;
    },
  };
}

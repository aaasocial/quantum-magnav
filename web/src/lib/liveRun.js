// Live-run driver (D-14/D-15, RESEARCH Patterns 4 and 5). Pure ESM: the Python calls, the clock
// and the yield between chunks are injected, so node --test can prove every decision.
//
// Sequence: live_start -> live_step(250) until done (stage 2 = one fit per call, stage 3 = map
// matching in ~250 ms chunks) -> live_result. The 90 s deadline is checked before EVERY
// live_step and again before live_result. After tl finishes, raw and then lowpass are skipped
// when elapsed + projected (tl's own duration) would pass 80 s. Any failure cancels the run.

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
  onStage = () => {}, onStep = () => {},
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
    if (elapsed() > DEADLINE_MS) throw namedError('Timeout', 'Live run took longer than 90 s');
  };

  const skipped = [];
  let stage3StartMs = null; // elapsed time when map matching began (end of the last fit call)
  let tlMs = null; // tl's measured duration = projected duration of each remaining denoiser

  try {
    enter(1);
    checkOk(await callPy('live_start', line, sensor, Boolean(simulateFailure)), 'live_start');

    for (;;) {
      checkDeadline();
      const c0 = now();
      const step = checkOk(await callPy('live_step', STEP_BUDGET_MS), 'live_step');
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
            checkOk(await callPy('live_skip', den), 'live_skip');
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
    const res = checkOk(await callPy('live_result'), 'live_result');
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
      await callPy('live_cancel');
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

// One live run at a time. The in-flight flag is set before the first await (Pitfall 8), so a
// second start() is refused without touching Python.
export function createLiveRunner(deps) {
  let inFlight = false;
  return {
    isInFlight: () => inFlight,
    start(args) {
      if (inFlight) {
        return Promise.resolve({ ok: false, reason: { name: 'Busy', message: 'A live run is already in progress' } });
      }
      inFlight = true;
      return runLive({ ...deps, ...args }).finally(() => { inFlight = false; });
    },
  };
}

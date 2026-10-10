// Thin React wrapper around createLiveRunner: the real bridge callPy (probed), performance.now
// and a MessageChannel yield. All decisions (deadline, skip, cancel, fallback reason) live in
// lib/liveRun.js and are node-tested; this hook only mirrors progress into React state.
import { useCallback, useRef, useState } from 'react';
import { callPy } from '../bridge.js';
import { validateLine } from '../lib/artifact.js';
import { STEP_BUDGET_MS, createLiveRunner } from '../lib/liveRun.js';
import { probeLiveCall } from '../probe.js';

// One macrotask turn so input and paint can run between Python chunks (no timers, no rAF).
function yieldToEventLoop() {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      ch.port1.close();
      resolve();
    };
    ch.port2.postMessage(0);
  });
}

const runner = createLiveRunner({
  callPy: probeLiveCall(callPy),
  now: () => performance.now(),
  yieldFn: yieldToEventLoop,
  validate: validateLine,
});

const EMPTY = { windowsDone: 0, windowsTotal: 0, denoiser: null, fitting: null };

export function useLiveRun() {
  const [inFlight, setInFlight] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(EMPTY);
  const stageCb = useRef(null);

  const start = useCallback(async ({ line, sensor, simulateFailure, onStage }) => {
    if (runner.isInFlight()) return { ok: false, reason: { name: 'Busy', message: 'A live run is already in progress' } };
    stageCb.current = onStage ?? null;
    setInFlight(true);
    setStage(0);
    setProgress(EMPTY);
    let maxStage2CallMs = 0;
    let stage3Ms = 0;
    let lastPer = {};
    const res = await runner.start({
      line,
      sensor,
      simulateFailure,
      onStage: (n) => {
        setStage(n);
        stageCb.current?.(n);
      },
      onStep: (step, callMs) => {
        if (step.stage === 2) maxStage2CallMs = Math.max(maxStage2CallMs, callMs);
        if (step.stage === 3) stage3Ms += callMs;
        const per = step.per_denoiser ?? {};
        if (Object.keys(per).length) lastPer = per;
        const vals = Object.values(per);
        setProgress({
          windowsDone: vals.reduce((s, p) => s + p[0], 0),
          windowsTotal: vals.reduce((s, p) => s + p[1], 0),
          denoiser: step.denoiser ?? null,
          fitting: step.fitting ?? null,
        });
      },
    });
    const windows = Object.values(lastPer).reduce((s, p) => s + p[0], 0);
    console.log('[probe] live_summary', JSON.stringify({
      line,
      sensor,
      totalS: Math.round(res.elapsedMs) / 1000,
      windows,
      msPerWindow: windows ? Math.round((stage3Ms / windows) * 10) / 10 : null,
      maxStage2CallMs: Math.round(maxStage2CallMs),
      budgetMs: STEP_BUDGET_MS,
      skipped: res.skipped ?? [],
      outcome: res.ok ? 'ok' : `${res.reason.name}: ${res.reason.message}`,
    }));
    if (!res.ok) console.error('[live] failed', res.reason);
    setInFlight(false);
    setStage(0);
    return res;
  }, []);

  // End run during a live run (WR-01): stop at the next Python call; resolves with the result.
  const cancel = useCallback(() => runner.cancel(), []);

  return { inFlight, stage, progress, start, cancel };
}

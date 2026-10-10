// Runtime probes for the Qollab sandbox (RESEARCH Pitfalls 5 and 7). This is the only file
// that names setTimeout, because it inspects Qollab's injected replacement; nothing here is
// used for correctness.
//
// Bundled third-party code (React scheduler, recharts, RTK, es-toolkit) still calls the
// injected setTimeout/clearTimeout at module scope (WR-06). Nothing user-facing depends on it:
// React's scheduler uses MessageChannel when available, recharts animations are off
// (isAnimationActive={false}) and no debounce is used. tests/test_qollab_contract.py enforces
// both rules and pins the bundle's timer call-site count.

export function logTimerProbe() {
  let returnsPromise = null;
  try {
    const h = setTimeout(() => {}, 0);
    returnsPromise = typeof h?.then === 'function';
  } catch {
    returnsPromise = 'threw';
  }
  console.log('[probe] timers', JSON.stringify({
    sameAsGlobal: typeof setTimeout === 'function' && setTimeout === globalThis.setTimeout,
    nativeGlobal: String(globalThis.setTimeout).includes('[native code]'),
    returnsPromise,
    setIntervalType: typeof globalThis.setInterval,
    setIntervalNative: String(globalThis.setInterval).includes('[native code]'),
  }));
}

// Logs the iframe geometry once the first frame after mount has painted.
export function logFrameProbe() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    console.log('[probe] frame', JSON.stringify({
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      dpr: window.devicePixelRatio,
    }));
  }));
}

// Runs asyncFn while counting animation frames and the largest gap between them, which shows
// whether a Python call blocks the main thread (RESEARCH Pitfall 1). Rethrows asyncFn's error.
export async function measureFrames(asyncFn) {
  let frames = 0;
  let maxGapMs = 0;
  let last = performance.now();
  let running = true;
  let handle = 0;
  const tick = (ts) => {
    if (!running) return;
    frames += 1;
    maxGapMs = Math.max(maxGapMs, ts - last);
    last = ts;
    handle = requestAnimationFrame(tick);
  };
  handle = requestAnimationFrame(tick);
  const t0 = performance.now();
  try {
    const result = await asyncFn();
    return { result, ms: Math.round(performance.now() - t0), frames, maxGapMs: Math.round(maxGapMs) };
  } finally {
    running = false;
    cancelAnimationFrame(handle);
  }
}

// Wraps the bridge's callPy so every live call logs its JS-measured cost and frame count.
export function probeLiveCall(callPy) {
  return async (name, ...args) => {
    const { result, ms, frames, maxGapMs } = await measureFrames(() => callPy(name, ...args));
    if (name === 'live_step') {
      console.log('[probe] live_step', JSON.stringify({
        ms,
        budgetMs: args[0],
        frames,
        maxGapMs,
        stage: result?.stage ?? null,
        fitting: result?.fitting ?? null,
        windowsDone: result?.windows_done ?? null,
      }));
    } else if (name === 'live_result') {
      console.log('[probe] live_result', JSON.stringify({ ms, frames, maxGapMs }));
    }
    return result;
  };
}

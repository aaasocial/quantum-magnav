// Runtime probes for the Qollab sandbox (RESEARCH Pitfalls 5 and 7). This is the only file
// that names setTimeout, because it inspects Qollab's injected replacement; nothing here is
// used for correctness.

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

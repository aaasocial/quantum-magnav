// The only path from JS to Python. External in the build (Qollab's Pyodide), stub in dev.
import * as api from 'magnav.api';

// `backend` is injected by Qollab; whether it is a lexical binding or a global is undocumented.
// eslint-disable-next-line no-undef
export const qBackend = typeof backend !== 'undefined' ? backend : (globalThis.backend ?? null);

// Exactly one Python call in flight: a second callPromising while one is suspended is
// undocumented in Pyodide, so every call joins one module-level promise chain. The chain moves
// on when the call settles (resolved or rejected). Python running on the page's thread cannot
// be interrupted: the live watchdog (lib/liveRun.js) can abandon a slow call and fall back, but
// the queue (and any live_cancel queued behind it) only resumes once that call returns.
let chain = Promise.resolve();
function enqueue(task) {
  const p = chain.then(task, task);
  chain = p.catch(() => {});
  return p;
}

// Python functions return JSON strings. Always callPromising: a plain call fails on IonQ (XHR).
export function callPyText(name, ...args) {
  return enqueue(async () => {
    const fn = api[name];
    if (!fn) throw new Error(`magnav.api.${name} not found`);
    return String(await fn.callPromising(qBackend, ...args));
  });
}

export async function callPy(name, ...args) {
  return JSON.parse(await callPyText(name, ...args));
}

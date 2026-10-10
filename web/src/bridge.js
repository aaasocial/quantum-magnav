// The only path from JS to Python. External in the build (Qollab's Pyodide), stub in dev.
import * as api from 'magnav.api';

// `backend` is injected by Qollab; whether it is a lexical binding or a global is undocumented.
// eslint-disable-next-line no-undef
export const qBackend = typeof backend !== 'undefined' ? backend : (globalThis.backend ?? null);

// Python functions return JSON strings. Always callPromising: a plain call fails on IonQ (XHR).
export async function callPy(name, ...args) {
  const fn = api[name];
  if (!fn) throw new Error(`magnav.api.${name} not found`);
  return JSON.parse(await fn.callPromising(qBackend, ...args));
}

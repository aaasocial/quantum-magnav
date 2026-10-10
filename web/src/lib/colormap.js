// Heatmap colour helpers (D-07). Pure ESM; node-tested.
import { interpolateCividis } from 'd3-scale-chromatic';
import { fmtInt } from './format.js';

// 256-entry RGB lookup table (768 bytes) from d3's cividis; parses "rgb(r, g, b)".
export function buildCividisLut() {
  const lut = new Uint8ClampedArray(768);
  for (let i = 0; i < 256; i++) {
    const [r, g, b] = interpolateCividis(i / 255).match(/\d+/g).map(Number);
    lut[3 * i] = r;
    lut[3 * i + 1] = g;
    lut[3 * i + 2] = b;
  }
  return lut;
}

// [lo, hi] percentiles of the valid cells: v[floor(lo*(n-1))], v[ceil(hi*(n-1))].
export function percentileDomain(nT, valid, lo = 0.02, hi = 0.98) {
  const v = [];
  for (let i = 0; i < nT.length; i++) if (valid[i]) v.push(nT[i]);
  if (!v.length) return [0, 1];
  v.sort((a, b) => a - b);
  const d0 = v[Math.floor(lo * (v.length - 1))];
  const d1 = v[Math.ceil(hi * (v.length - 1))];
  return d1 > d0 ? [d0, d1] : [d0, d0 + 1];
}

// Colorbar ticks at the domain minimum, 0 (if inside) and maximum, rounded inward to 100.
export function colorbarTicks([d0, d1]) {
  const lo = Math.ceil(d0 / 100) * 100;
  const hi = Math.floor(d1 / 100) * 100;
  const values = [lo];
  if (lo < 0 && hi > 0) values.push(0);
  if (hi > lo) values.push(hi);
  return values.map((value) => ({ value: value + 0, label: value === 0 ? '0' : `${fmtInt(value)} nT` }));
}

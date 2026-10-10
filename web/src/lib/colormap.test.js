import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCividisLut, percentileDomain, colorbarTicks } from './colormap.js';

const lum = (r, g, b) => {
  const c = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};

test('cividis LUT has 256 RGB entries with the d3 endpoints', () => {
  const lut = buildCividisLut();
  assert.ok(lut instanceof Uint8ClampedArray);
  assert.equal(lut.length, 768);
  assert.deepEqual([...lut.slice(0, 3)], [0, 32, 81]);
  assert.deepEqual([...lut.slice(765, 768)], [253, 234, 69]);
});

test('cividis relative luminance is non-decreasing', () => {
  const lut = buildCividisLut();
  let prev = -1;
  for (let i = 0; i < 256; i++) {
    const L = lum(lut[3 * i], lut[3 * i + 1], lut[3 * i + 2]);
    assert.ok(L >= prev - 1e-12, `entry ${i}`);
    prev = L;
  }
});

test('percentileDomain uses the 2nd/98th percentiles of valid cells (floor/ceil rule)', () => {
  const nT = Array.from({ length: 100 }, (_, i) => i);
  const valid = nT.map(() => 1);
  assert.deepEqual(percentileDomain(nT, valid), [1, 98]);
  // invalid cells are excluded: huge outliers marked invalid do not move the domain
  const nT2 = [...nT, -1e6, 1e6];
  const valid2 = [...valid, 0, 0];
  assert.deepEqual(percentileDomain(nT2, valid2), [1, 98]);
});

test('colorbarTicks gives min, 0 and max rounded to 100 inside the domain', () => {
  const ticks = colorbarTicks([-835, 2065]);
  assert.deepEqual(ticks.map((k) => k.value), [-800, 0, 2000]);
  assert.deepEqual(ticks.map((k) => k.label), ['-800 nT', '0', '2,000 nT']);
  for (const k of ticks) assert.equal(Math.abs(k.value % 100), 0);
  // zero outside the domain is omitted
  assert.deepEqual(colorbarTicks([150, 1490]).map((k) => k.value), [200, 1400]);
});

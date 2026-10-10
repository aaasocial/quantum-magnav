import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lineView } from './artifact.js';
import { buildResidualRows, buildSignalRows, sampleIndices } from './signal.js';

const ARTIFACT = JSON.parse(readFileSync(new URL('../../../data/precomputed_run.json', import.meta.url), 'utf8'));
const view = (id, sensor = 'mag_5_uc') => lineView(ARTIFACT.lines.find((l) => l.line === id), sensor);

test('buildSignalRows has one row per display index with t, truth and the chosen keys', () => {
  const v = view('1003.02');
  const rows = buildSignalRows(v, ['raw', 'tl']);
  assert.equal(rows.length, v.n);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['raw', 't', 'tl', 'truth']);
  assert.equal(rows[10].t, v.t[10]);
  assert.equal(rows[10].truth, v.truth.anomaly[10]);
  assert.equal(rows[10].tl, v.est.tl.signal[10]);
  assert.equal(rows[10].raw, v.est.raw.signal[10]);
});

test('buildSignalRows ignores keys the view does not have', () => {
  const v = view('1003.02');
  const rows = buildSignalRows(v, ['tl', 'nope']);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['t', 'tl', 'truth']);
});

test('buildResidualRows is null before the metric start and signal - truth afterwards', () => {
  const v = view('1003.02');
  const rows = buildResidualRows(v, ['raw', 'tl']);
  assert.equal(rows.length, v.n);
  const ms = v.metricStartIdx;
  assert.ok(ms > 0);
  assert.equal(rows[ms - 1].tl_res, null);
  assert.equal(rows[0].raw_res, null);
  assert.equal(rows[ms].tl_res, v.est.tl.signal[ms] - v.truth.anomaly[ms]);
  assert.equal(rows[v.n - 1].raw_res, v.est.raw.signal[v.n - 1] - v.truth.anomaly[v.n - 1]);
  assert.equal(rows[ms].t, v.t[ms]);
});

test('sampleIndices is sorted, unique, has 0 and the jam index, about one per 60 s', () => {
  const v = view('1003.02');
  const idx = sampleIndices(v, 60);
  assert.deepEqual(idx, [...new Set(idx)].sort((a, b) => a - b));
  assert.ok(idx.includes(0));
  assert.ok(idx.includes(v.jamIdx));
  assert.ok(idx.length >= 60 && idx.length <= 70, `got ${idx.length}`);
  assert.ok(idx.every((i) => Number.isInteger(i) && i >= 0 && i < v.n));
});

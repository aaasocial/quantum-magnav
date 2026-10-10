import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateArtifact, validateLine, lineView, metricStartT, errorAt, drErrorAt } from './artifact.js';

const ARTIFACT_TEXT = readFileSync(new URL('../../../data/precomputed_run.json', import.meta.url), 'utf8');
const fresh = () => JSON.parse(ARTIFACT_TEXT);
const findLine = (a, id) => a.lines.find((l) => l.line === id);

test('the committed artifact validates', () => {
  assert.deepEqual(validateArtifact(fresh()), []);
});

test('lineView sizes every series from t (1007.06 has 1499 points)', () => {
  const v = lineView(findLine(fresh(), '1007.06'), 'mag_4_uc');
  assert.equal(v.t.length, 1499);
  assert.equal(v.n, 1499);
  assert.equal(v.truth.x.length, 1499);
  assert.equal(v.dr.y.length, 1499);
  assert.equal(v.est.tl.signal.length, 1499);
  assert.equal(v.mapName, 'Renfrew');
  assert.equal(v.id, '1007.06');
});

test('metric start converts raw-sample index to time', () => {
  const a = fresh();
  assert.equal(metricStartT(findLine(a, '1003.02')), 1006);
  assert.equal(metricStartT(findLine(a, '1007.06')), 1370);
});

test('jam display index maps to t = 946 on 1003.02', () => {
  const line = findLine(fresh(), '1003.02');
  const v = lineView(line, 'mag_5_uc');
  assert.equal(v.t[line.jam.display_index], 946);
  assert.equal(v.jamIdx, 316);
  assert.equal(v.jamT, 946);
  assert.equal(v.mapName, 'Eastern');
});

test('metricStartIdx is the first display index with t >= metric start time', () => {
  const v = lineView(findLine(fresh(), '1003.02'), 'mag_5_uc');
  assert.ok(v.t[v.metricStartIdx] >= 1006);
  assert.ok(v.t[v.metricStartIdx - 1] < 1006);
  assert.ok(v.metricStartIdx < v.n);
});

test('a mutated artifact fails validation', () => {
  const bumped = fresh();
  bumped.schema_version = 2;
  assert.ok(validateArtifact(bumped).length > 0);

  const dropped = fresh();
  findLine(dropped, '1003.02').truth.x.pop();
  assert.ok(validateArtifact(dropped).length > 0);
  assert.ok(validateLine(findLine(dropped, '1003.02'), 'mag_5_uc').length > 0);
});

test('validateLine rejects a missing sensor and a jam index out of range', () => {
  const line = findLine(fresh(), '1003.02');
  assert.ok(validateLine(line, 'mag_9_uc').length > 0);
  line.jam.display_index = line.t.length;
  assert.ok(validateLine(line, 'mag_5_uc').length > 0);
});

test('available lists the denoisers present for the sensor', () => {
  const line = findLine(fresh(), '1003.02');
  const v = lineView(line, 'mag_5_uc');
  assert.ok(v.available instanceof Set);
  assert.deepEqual([...v.available].sort(), ['krr', 'lowpass', 'quantum', 'raw', 'tl', 'tl_currents']);
  // a live-style entry with only some denoisers
  const live = structuredClone(line);
  live.estimates = { mag_5_uc: { tl: line.estimates.mag_5_uc.tl, raw: line.estimates.mag_5_uc.raw } };
  assert.deepEqual([...lineView(live, 'mag_5_uc').available].sort(), ['raw', 'tl']);
  assert.deepEqual(validateLine(live, 'mag_5_uc'), []);
});

test('metrics merge dead reckoning with the sensor block', () => {
  const line = findLine(fresh(), '1003.02');
  const v = lineView(line, 'mag_5_uc');
  assert.equal(v.metrics.dead_reckoning.mean_err_m, line.metrics.dead_reckoning.mean_err_m);
  assert.equal(v.metrics.tl.cep50_m, line.metrics.mag_5_uc.tl.cep50_m);
});

test('errorAt and drErrorAt are Euclidean distances in metres', () => {
  const line = findLine(fresh(), '1003.02');
  const v = lineView(line, 'mag_5_uc');
  const i = 600;
  const ex = Math.hypot(v.est.tl.x[i] - v.truth.x[i], v.est.tl.y[i] - v.truth.y[i]);
  assert.equal(errorAt(v, 'tl', i), ex);
  const dx = Math.hypot(v.dr.x[i] - v.truth.x[i], v.dr.y[i] - v.truth.y[i]);
  assert.equal(drErrorAt(v, i), dx);
  assert.equal(errorAt(v, 'nope', i), null);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapGeometry } from './geo.js';

const artifact = JSON.parse(readFileSync(new URL('../../../data/precomputed_run.json', import.meta.url), 'utf8'));
const preview = artifact.lines.find((l) => l.line === '1003.02').map_preview;
const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test('cell-edge extents map to the canvas corners', () => {
  const g = mapGeometry(preview, 400);
  const [x0, y0] = g.toPx(preview.x_min - g.dx / 2, preview.y_max + g.dy / 2);
  close(x0, 0);
  close(y0, 0);
  const [x1, y1] = g.toPx(preview.x_max + g.dx / 2, preview.y_min - g.dy / 2);
  close(x1, g.W);
  close(y1, g.H);
});

test('aspect follows the metric extents (1003.02: W/H about 0.914)', () => {
  const g = mapGeometry(preview, 400);
  assert.equal(g.W, 400);
  close(g.W / g.H, 0.914, 0.002);
  close(g.H / g.W, (preview.ny * g.dy) / (preview.nx * g.dx));
});

test('height is capped at 520 px and the width shrinks to keep the aspect', () => {
  const g = mapGeometry(preview, 1000);
  close(g.H, 520);
  close(g.W / g.H, 0.914, 0.002);
  assert.ok(g.W < 1000);
  const g2 = mapGeometry(preview, 1000, 300);
  close(g2.H, 300);
});

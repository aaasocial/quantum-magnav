import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createThrottle, speedWords, loadedText, playText, pausedText, jamText, readoutText,
  modeText, stageText, liveFailedText, finishedText, selectionText,
} from './announce.js';

test('createThrottle allows the first call, blocks within the interval, allows after', () => {
  let now = 1000;
  const allow = createThrottle(10000, () => now);
  assert.equal(allow(), true);
  now += 5000;
  assert.equal(allow(), false);
  now += 4999;
  assert.equal(allow(), false);
  now += 1;
  assert.equal(allow(), true);
  now += 100;
  assert.equal(allow(), false);
  allow.reset();
  assert.equal(allow(), true);
});

test('speedWords never uses the multiplication sign', () => {
  assert.equal(speedWords(60), '60 times speed');
  assert.equal(speedWords(10), '10 times speed');
  assert.equal(speedWords(300), '300 times speed');
});

test('builders return the exact UI-SPEC strings', () => {
  assert.equal(loadedText('1003.02', 'Mag 5'), 'Precomputed flight loaded. Line 1003.02, Mag 5. Press Play or Space to start.');
  assert.equal(playText(60), 'Playing at 60 times speed.');
  assert.equal(pausedText(946), 'Paused at 946 seconds.');
  assert.equal(jamText(946), 'GPS jammed at 946 seconds. Navigating by magnetic map matching.');
  assert.equal(
    readoutText(1200, 'Tolles-Lawson (TL)', 312, 2481),
    '1200 seconds. Position error, Tolles-Lawson (TL): 312 metres. Dead reckoning: 2481 metres.',
  );
  assert.equal(modeText('computed in-page'), 'Mode: computed in-page.');
  assert.equal(modeText('computing in-page…'), 'Mode: computing in-page.');
  assert.equal(stageText(2), 'Step 2 of 4.');
  assert.equal(liveFailedText(), 'Live run failed. Showing the precomputed replay.');
  assert.equal(finishedText('Tolles-Lawson (TL)', 53), 'Replay finished. Final position error, Tolles-Lawson (TL): 53 metres.');
  assert.equal(selectionText('1007.06', 'Mag 4 (hard case)'), 'Line 1007.06, Mag 4 (hard case). Paused at start.');
});

test('non-integer inputs are rounded and no output contains the multiplication sign', () => {
  assert.equal(jamText(945.6), 'GPS jammed at 946 seconds. Navigating by magnetic map matching.');
  assert.equal(pausedText(96.4), 'Paused at 96 seconds.');
  assert.equal(
    readoutText(1199.7, 'Raw cabin', 311.5, 2480.49),
    '1200 seconds. Position error, Raw cabin: 312 metres. Dead reckoning: 2480 metres.',
  );
  assert.equal(stageText(2.2), 'Step 2 of 4.');
  const all = [
    speedWords(60), loadedText('1003.02', 'Mag 5'), playText(300), pausedText(1), jamText(1),
    readoutText(1, 'TL', 1, 1), modeText('precomputed replay'), stageText(1), liveFailedText(),
    finishedText('TL', 1), selectionText('1003.02', 'Mag 5'),
  ];
  for (const s of all) assert.ok(!s.includes('×'), s);
});

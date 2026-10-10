import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_FRAME_MS, indexAtTime, nextWindowTime, createPlaybackStore } from './playback.js';

// Deterministic clock: raf callbacks queue; frame(dtMs) advances the clock and runs them.
function fakeClock() {
  let nowMs = 0;
  let queue = [];
  let id = 0;
  const raf = (cb) => { id += 1; queue.push({ id, cb }); return id; };
  const caf = (h) => { queue = queue.filter((q) => q.id !== h); };
  const now = () => nowMs;
  const frame = (dtMs = 1000 / 60) => {
    nowMs += dtMs;
    const run = queue;
    queue = [];
    run.forEach(({ cb }) => cb(nowMs));
  };
  const pending = () => queue.length;
  return { raf, caf, now, frame, pending };
}

const T = Array.from({ length: 101 }, (_, i) => i * 3); // 0..300 s every 3 s

test('indexAtTime at t[0], between samples and past the end', () => {
  assert.equal(indexAtTime(T, 0), 0);
  assert.equal(indexAtTime(T, -5), 0);
  assert.equal(indexAtTime(T, 4), 1);
  assert.equal(indexAtTime(T, 6), 2);
  assert.equal(indexAtTime(T, 5.99), 1);
  assert.equal(indexAtTime(T, 1e9), 100);
});

test('nextWindowTime steps one 10 s navigator window', () => {
  assert.equal(nextWindowTime(946, +1), 950);
  assert.equal(nextWindowTime(950, +1), 960);
  assert.equal(nextWindowTime(950, -1), 940);
  assert.equal(nextWindowTime(946, -1), 940);
});

test('1 s of frames at 60x advances flight time by 60 s', () => {
  const c = fakeClock();
  const s = createPlaybackStore(c);
  s.load(T);
  assert.equal(s.getSpeed(), 60);
  s.play();
  for (let k = 0; k < 60; k++) c.frame(1000 / 60);
  assert.ok(Math.abs(s.getTime() - 60) < 1e-6, `time ${s.getTime()}`);
  assert.equal(s.getIndex(), 20);
  s.setSpeed(300);
  for (let k = 0; k < 30; k++) c.frame(1000 / 60);
  assert.ok(Math.abs(s.getTime() - 210) < 1e-6, `time ${s.getTime()}`);
});

test('subscribers are notified when the index changes and unsubscribe works', () => {
  const c = fakeClock();
  const s = createPlaybackStore(c);
  s.load(T);
  let calls = 0;
  const off = s.subscribe(() => { calls += 1; });
  s.seekIndex(10);
  assert.equal(s.getIndex(), 10);
  assert.equal(s.getTime(), 30);
  assert.ok(calls >= 1);
  off();
  const before = calls;
  s.seekIndex(20);
  assert.equal(calls, before);
});

test('reduced mode publishes at most one index change per wall second', () => {
  const c = fakeClock();
  const s = createPlaybackStore(c);
  s.load(T);
  s.setSpeed(10);
  s.setReduced(true);
  const seen = [];
  s.subscribe(() => seen.push([c.now(), s.getIndex()]));
  s.play();
  for (let k = 0; k < 60 * 5; k++) c.frame(1000 / 60); // 5 wall seconds
  const changes = [];
  let last = 0;
  for (const [ms, idx] of seen) if (idx !== last) { changes.push(ms); last = idx; }
  assert.ok(changes.length >= 4 && changes.length <= 5, `changes ${changes.length}`);
  for (let k = 1; k < changes.length; k++) assert.ok(changes[k] - changes[k - 1] >= 999, 'two changes within a second');
  // the clock itself still ran at full speed
  assert.ok(Math.abs(s.getTime() - 50) < 10.01);
});

test('stops at the end, fires end once, and the next play restarts at 0', () => {
  const c = fakeClock();
  const s = createPlaybackStore(c);
  s.load(T);
  s.setSpeed(300);
  let ends = 0;
  s.on('end', () => { ends += 1; });
  s.play();
  for (let k = 0; k < 120; k++) c.frame(1000 / 60); // 2 s * 300 = 600 s > 300 s
  assert.equal(s.isPlaying(), false);
  assert.equal(ends, 1);
  assert.equal(s.getIndex(), 100);
  assert.equal(s.getTime(), 300);
  assert.equal(c.pending(), 0);
  s.play();
  assert.equal(s.isPlaying(), true);
  assert.equal(s.getIndex(), 0);
  assert.equal(s.getTime(), 0);
  s.pause();
  assert.equal(ends, 1);
});

test('stepWindow, stepSeconds, seekTime and toggle', () => {
  const c = fakeClock();
  const s = createPlaybackStore(c);
  const t = Array.from({ length: 400 }, (_, i) => i * 3);
  s.load(t);
  s.seekTime(946);
  s.stepWindow(+1);
  assert.equal(s.getTime(), 950);
  s.stepWindow(+1);
  assert.equal(s.getTime(), 960);
  s.stepWindow(-1);
  assert.equal(s.getTime(), 950);
  s.stepSeconds(60);
  assert.equal(s.getTime(), 1010);
  s.stepSeconds(-5000);
  assert.equal(s.getTime(), 0);
  s.stepSeconds(1e6);
  assert.equal(s.getTime(), t[t.length - 1]);
  const events = [];
  s.on('play', () => events.push('play'));
  s.on('pause', () => events.push('pause'));
  s.seekIndex(0);
  s.toggle();
  s.toggle();
  assert.deepEqual(events, ['play', 'pause']);
});

test('a frame timestamp before play/seek never moves time backwards or below 0; gaps are clamped', () => {
  const c = fakeClock();
  // play() and seek() read now() after the frame began: 50 ms ahead of the next rAF timestamp.
  const s = createPlaybackStore({ ...c, now: () => c.now() + 50 });
  s.load(T);
  s.setSpeed(300);
  s.play();
  c.frame(16); // ts 16 < last 50: negative delta
  assert.equal(s.getTime(), 0);
  c.frame(40); // ts 56: only the 6 ms after last count
  assert.ok(Math.abs(s.getTime() - 1.8) < 1e-9, `time ${s.getTime()}`);
  s.seekTime(30); // last = now() = 106 while the next frame is at 72
  c.frame(16);
  assert.equal(s.getTime(), 30);
  c.frame(5000); // a 5 s gap counts as MAX_FRAME_MS: 30 + 0.25 s x 300 = 105
  assert.ok(Math.abs(s.getTime() - (30 + (MAX_FRAME_MS / 1000) * 300)) < 1e-9, `time ${s.getTime()}`);
});

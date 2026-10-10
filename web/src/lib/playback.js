// Playback clock for the player (D-10/D-12). Pure ESM; the frame scheduler and the clock
// are injectable so node tests drive it deterministically. Timing uses requestAnimationFrame
// timestamps only (no timer callbacks: Qollab injects its own timer functions).

const EPS = 1e-9;
// Frame delta clamp (WR-03): rAF timestamps are the frame's begin time, so input handled
// after it (play/seek set `last` from now()) can make ts - last negative; a long gap (hidden
// tab, blocked main thread) must not jump the flight either.
export const MAX_FRAME_MS = 250;

// Last i with t[i] <= time (0 before the start, n-1 past the end).
export function indexAtTime(t, time) {
  if (!t.length || time <= t[0]) return 0;
  let lo = 0;
  let hi = t.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (t[mid] <= time + EPS) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// Next navigator-window boundary (multiples of strideS seconds) in direction dir.
export function nextWindowTime(time, dir, strideS = 10) {
  return dir > 0
    ? Math.floor(time / strideS + EPS) * strideS + strideS
    : Math.ceil(time / strideS - EPS) * strideS - strideS;
}

export function createPlaybackStore({
  now = () => globalThis.performance.now(),
  raf = (cb) => globalThis.requestAnimationFrame(cb),
  caf = (h) => globalThis.cancelAnimationFrame(h),
} = {}) {
  let t = [];
  let time = 0;
  let speed = 60;
  let playing = false;
  let reduced = false;
  let publishedIndex = 0;
  let publishedTime = 0;
  let frameId = null;
  let last = 0;
  let lastPublishWall = 0;
  const listeners = new Set();
  const handlers = { play: new Set(), pause: new Set(), end: new Set(), seek: new Set() };

  const tEnd = () => (t.length ? t[t.length - 1] : 0);
  const clamp = (x) => Math.max(0, Math.min(tEnd(), x));
  const notify = () => listeners.forEach((fn) => fn());
  const emit = (type) => handlers[type].forEach((fn) => fn());

  function publish() {
    const idx = indexAtTime(t, time);
    if (idx === publishedIndex && time === publishedTime) return;
    publishedIndex = idx;
    publishedTime = time;
    notify();
  }

  function stopFrames() {
    if (frameId !== null) caf(frameId);
    frameId = null;
  }

  function tick(ts) {
    frameId = null;
    if (!playing) return;
    const dt = Math.min(MAX_FRAME_MS, Math.max(0, ts - last));
    time = clamp(time + (dt / 1000) * speed);
    last = Math.max(last, ts);
    if (time >= tEnd()) {
      time = tEnd();
      playing = false;
      publish();
      notify();
      emit('end');
      return;
    }
    if (reduced) {
      // Stepped mode (D-12): at most one published update per second of wall time.
      if (ts - lastPublishWall >= 1000 - 1e-6) {
        lastPublishWall = ts;
        publish();
      }
    } else {
      publish();
    }
    frameId = raf(tick);
  }

  function seek(x) {
    time = clamp(x);
    if (playing) {
      last = now();
      lastPublishWall = last;
    }
    publish();
    emit('seek');
  }

  const store = {
    load(times) {
      const was = playing;
      playing = false;
      stopFrames();
      t = Array.from(times ?? []);
      time = 0;
      publishedIndex = 0;
      publishedTime = 0;
      notify();
      if (was) emit('pause');
    },
    play() {
      if (playing || t.length < 2) return;
      if (time >= tEnd()) {
        time = 0;
        publish();
      }
      playing = true;
      last = now();
      lastPublishWall = last;
      frameId = raf(tick);
      notify();
      emit('play');
    },
    pause() {
      if (!playing) return;
      playing = false;
      stopFrames();
      publish();
      notify();
      emit('pause');
    },
    toggle() {
      if (playing) store.pause();
      else store.play();
    },
    seekIndex(i) {
      if (!t.length) return;
      seek(t[Math.max(0, Math.min(t.length - 1, Math.round(i)))]);
    },
    seekTime(x) { seek(x); },
    stepWindow(dir) { seek(nextWindowTime(time, dir)); },
    stepSeconds(sec) { seek(time + sec); },
    setSpeed(s) {
      const v = Number(s);
      if (Number.isFinite(v) && v > 0) speed = v;
    },
    setReduced(on) {
      reduced = Boolean(on);
      if (!reduced) publish();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    on(type, fn) {
      handlers[type].add(fn);
      return () => handlers[type].delete(fn);
    },
    getIndex: () => publishedIndex,
    getTime: () => publishedTime,
    isPlaying: () => playing,
    getSpeed: () => speed,
    isReduced: () => reduced,
    getTimes: () => t,
  };
  return store;
}

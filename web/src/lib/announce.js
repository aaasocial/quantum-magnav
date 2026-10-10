// aria-live phrasing (UI-SPEC table, D-12). Pure ESM so node --test can import it.
// Numbers are spoken as whole integers without separators; never use the multiplication sign.

const int = (n) => String(Math.round(Number(n)));

// Returns allow(): true at most once per intervalMs of wall time (measured from the last
// allowed or marked call). allow.mark() starts a new interval without announcing, so a
// throttled readout never clobbers a just-made announcement; allow.reset() clears it.
export function createThrottle(intervalMs, now = () => globalThis.performance.now()) {
  let last = null;
  const allow = () => {
    const t = now();
    if (last !== null && t - last < intervalMs) return false;
    last = t;
    return true;
  };
  allow.mark = () => { last = now(); };
  allow.reset = () => { last = null; };
  return allow;
}

export const speedWords = (speed) => `${int(speed)} times speed`;

export const loadedText = (line, sensorLabel) =>
  `Precomputed flight loaded. Line ${line}, ${sensorLabel}. Press Play or Space to start.`;

export const playText = (speed) => `Playing at ${speedWords(speed)}.`;

export const pausedText = (t) => `Paused at ${int(t)} seconds.`;

export const jamText = (t) => `GPS jammed at ${int(t)} seconds. Navigating by magnetic map matching.`;

export const readoutText = (t, trackLabel, err, drErr) =>
  `${int(t)} seconds. Position error, ${trackLabel}: ${int(err)} metres. Dead reckoning: ${int(drErr)} metres.`;

// A trailing ellipsis in the badge ("computing in-page…") is dropped so speech ends on one full stop.
export const modeText = (badge) => `Mode: ${String(badge).replace(/…$/, '')}.`;

export const stageText = (n) => `Step ${int(n)} of 4.`;

export const liveFailedText = () => 'Live run failed. Showing the precomputed replay.';

export const finishedText = (trackLabel, err) => (
  err === null || err === undefined || !Number.isFinite(Number(err))
    ? 'Replay finished.'
    : `Replay finished. Final position error, ${trackLabel}: ${int(err)} metres.`
);

export const selectionText = (line, sensorLabel) => `Line ${line}, ${sensorLabel}. Paused at start.`;

// Jam banner (D-08) in the fixed-height jam slot. Not a live region: the single Announcer
// already speaks the jam once per forward pass.
import { usePlaybackIndex } from '../hooks/usePlayback.js';
import { fmtSeconds } from '../lib/format.js';

export default function JamBanner({ view }) {
  const idx = usePlaybackIndex();
  if (!view || idx < view.jamIdx) return null;
  return <p className="jam-banner">{`GPS jammed at t = ${fmtSeconds(view.jamT)} s — magnetic-only from here`}</p>;
}

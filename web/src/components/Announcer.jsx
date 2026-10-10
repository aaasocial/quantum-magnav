// The page's single polite live region (D-12). Rendered empty at mount; announce(text)
// clears it and sets the text on the next animation frame so repeated messages are re-read.
import { useEffect, useState } from 'react';

let setText = null;
let queued = null;
let frame = null;

export function announce(text) {
  if (!text) return;
  if (!setText) {
    queued = text; // before mount: delivered once the region exists
    return;
  }
  const set = setText;
  set('');
  if (frame !== null) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = null;
    set(text);
  });
}

export default function Announcer() {
  const [text, setState] = useState('');
  useEffect(() => {
    setText = setState;
    if (queued) {
      const q = queued;
      queued = null;
      announce(q);
    }
    return () => {
      if (setText === setState) setText = null;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };
  }, []);
  return <p role="status" aria-live="polite" className="sr-only">{text}</p>;
}

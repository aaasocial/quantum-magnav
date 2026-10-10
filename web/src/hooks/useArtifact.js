// Loads the precomputed RunArtifact through magnav.api (D-13: no backend needed for the replay).
import { useEffect, useState } from 'react';
import { callPyText } from '../bridge.js';
import { validateArtifact } from '../lib/artifact.js';
import { measureFrames } from '../probe.js';

export function useArtifact() {
  const [state, setState] = useState({ status: 'loading', artifact: null, error: null });
  useEffect(() => {
    let cancelled = false;
    const t0 = performance.now();
    (async () => {
      try {
        const call = await measureFrames(() => callPyText('artifact_json'));
        console.log('[probe] main_thread', JSON.stringify({
          call: 'artifact_json', ms: call.ms, frames: call.frames, maxGapMs: call.maxGapMs,
        }));
        const res = JSON.parse(call.result);
        if (res?.ok !== true) {
          throw new Error(res?.error_type ? `${res.error_type}: ${res.error}` : String(res?.error ?? 'artifact_json failed'));
        }
        const errs = validateArtifact(res.artifact);
        if (errs.length) throw new Error(`invalid artifact: ${errs.slice(0, 3).join('; ')}`);
        console.log('[probe] artifact_load', JSON.stringify({ ms: Math.round(performance.now() - t0) }));
        if (!cancelled) setState({ status: 'ready', artifact: res.artifact, error: null });
      } catch (e) {
        console.error('[artifact] load failed', e);
        const reason = e?.message ?? String(e);
        if (!cancelled) setState({ status: 'error', artifact: null, error: reason });
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return state;
}

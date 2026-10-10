// Run status (D-04): text mode badge, status message, provenance, danger notice, End run.
// The status message is plain text; announcements go through the single Announcer.
const BADGE = {
  precomputed: 'precomputed replay',
  computing: 'computing in-page…',
  computed: 'computed in-page',
};

export function badgeText(mode) {
  return BADGE[mode] ?? BADGE.precomputed;
}

export function pausedHint(jamT) {
  return `Press Play or Space to fly the line. GPS is jammed at t = ${Math.round(jamT)} s.`;
}

function provenanceText(provenance) {
  const code = provenance?.code_version ?? 'unknown';
  const seed = provenance?.seed;
  const seedPart = seed === undefined || seed === null ? '' : ` · seed ${seed}`;
  return `Data: SGL 2020 MagNav Challenge · maps: MagNav.jl Ottawa · code ${code}${seedPart}`;
}

export default function StatusStrip({ mode, message, jamT, provenance, danger, onEndRun, runEnded, children }) {
  const text = message ?? (jamT === null || jamT === undefined ? '' : pausedHint(jamT));
  return (
    <section className="panel status-strip" aria-label="Run status">
      <div className="status-row">
        <span className={`mode-badge${mode === 'computed' ? ' mode-badge-ok' : ''}`}>{badgeText(mode)}</span>
        <p className="status-message">{text}</p>
        <button type="button" className="btn-small end-run" onClick={onEndRun} disabled={runEnded}>
          End run
        </button>
      </div>
      {danger && <p className="danger-notice">{danger}</p>}
      {children}
      {provenance && <p className="provenance">{provenanceText(provenance)}</p>}
    </section>
  );
}

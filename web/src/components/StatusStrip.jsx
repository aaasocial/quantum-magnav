// Run status (D-04): text mode badge, status message, provenance, danger notice, End run.
// The status message is plain text; announcements go through the single Announcer.
const BADGE = {
  precomputed: 'precomputed replay',
  computing: 'computing in-page…',
  computed: 'computed in-page',
};

const FIT_LABELS = {
  select: 'choosing the TL configuration',
  raw: 'fitting Raw cabin',
  lowpass: 'fitting Low-pass',
  tl: 'fitting Tolles-Lawson (TL)',
  quantum: 'fitting the quantum slot',
};
const STAGE_TEXT = {
  1: 'Step 1 of 4: loading flight data…',
  2: 'Step 2 of 4: cleaning signal (raw, low-pass, TL, quantum slot)…',
  3: 'Step 3 of 4: matching against the map…',
  4: 'Step 4 of 4: packaging results…',
};
const DEN_LABELS = { tl: 'Tolles-Lawson (TL)', raw: 'Raw cabin', lowpass: 'Low-pass' };

// Live progress message for the status strip (UI-SPEC "Live progress stages").
export function stageMessage(stage, fitting) {
  const base = STAGE_TEXT[stage] ?? STAGE_TEXT[1];
  return stage === 2 && FIT_LABELS[fitting] ? `${base} Now ${FIT_LABELS[fitting]}.` : base;
}

function LiveProgress({ progress, reduced }) {
  const { windowsDone, windowsTotal, denoiser } = progress;
  if (!windowsTotal) return null;
  const counter = `${windowsDone} of ${windowsTotal} map-matching windows${DEN_LABELS[denoiser] ? ` (${DEN_LABELS[denoiser]})` : ''}`;
  return (
    <div className="live-progress">
      {!reduced && (
        <progress max={windowsTotal} value={Math.min(windowsDone, windowsTotal)} aria-label="Map matching progress" />
      )}
      <span className="live-counter">{counter}</span>
    </div>
  );
}

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

export default function StatusStrip({
  mode, message, jamT, provenance, danger, onEndRun, runEnded, live = null, reduced = false, children,
}) {
  const computing = live && live.stage > 0;
  const text = computing
    ? stageMessage(live.stage, live.progress.fitting)
    : message ?? (jamT === null || jamT === undefined ? '' : pausedHint(jamT));
  return (
    <section className="panel status-strip" aria-label="Run status">
      <div className="status-row">
        <span className={`mode-badge${mode === 'computed' ? ' mode-badge-ok' : ''}`}>{badgeText(mode)}</span>
        <p className="status-message">{text}</p>
        <button type="button" className="btn-small end-run" onClick={onEndRun} disabled={runEnded}>
          End run
        </button>
      </div>
      {computing && live.stage === 3 && <LiveProgress progress={live.progress} reduced={reduced} />}
      {danger && <p className="danger-notice">{danger}</p>}
      {children}
      {provenance && <p className="provenance">{provenanceText(provenance)}</p>}
    </section>
  );
}

import { useEffect, useId, useRef, useState } from 'react';
import { callPy, qBackend } from './bridge.js';

const CIRCUIT_OPTIONS = [1, 2, 32, 64, 128];
const SHOT_OPTIONS = [100, 200, 500, 1024, 4096];
const INFO_FIELDS = [
  'name', 'class', 'num_qubits', 'noise_model', 'python', 'qiskit',
  'numpy', 'scipy', 'sklearn', 'qiskit_ionq', 'data_file',
];
const IONQ_CIRCUITS_HELP = "Qollab's IonQ proxy accepts only single-circuit jobs, so IonQ runs use 1 circuit.";
const IONQ_LOCK_MESSAGE = 'IonQ allows one job per run. Press Stop, then Run, to submit another.';

// Resolved after the first IonQ job finishes; main.jsx awaits it to keep the Qollab run alive.
let resolveFirstJobDone;
export const firstJobDone = new Promise((resolve) => { resolveFirstJobDone = resolve; });

function show(value) {
  if (value === null || value === undefined) return 'none';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export default function App() {
  const circuitsId = useId();
  const shotsId = useId();
  const circuitsHelpId = useId();
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState(qBackend ? 'Loading backend info…' : '');
  const [nCircuits, setNCircuits] = useState(1); // 1 is the only value IonQ on Qollab accepts
  const [shots, setShots] = useState(200);
  const [busy, setBusy] = useState(false);
  const [ionqLocked, setIonqLocked] = useState(false);
  const [result, setResult] = useState(null);
  const submitted = useRef(false); // synchronous guard against double clicks

  useEffect(() => {
    if (!qBackend) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await callPy('backend_info'); // no job submitted
        if (cancelled) return;
        setInfo(data);
        setStatus(`Backend ready: ${data.name}. Choose circuits and shots, then submit one job.`);
      } catch (e) {
        if (!cancelled) setStatus(`Error: ${e?.name ?? 'Error'}: ${e?.message ?? e}`);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isIonq = info?.is_ionq === true; // detected in Python (provider module or name)

  useEffect(() => {
    if (isIonq) setNCircuits(1);
  }, [isIonq]);
  const disabled = !qBackend || !info || busy || ionqLocked;

  async function submit() {
    if (disabled || (isIonq && submitted.current)) return;
    submitted.current = true;
    const n = isIonq ? 1 : nCircuits; // never send a multi-circuit job to IonQ
    setBusy(true);
    setResult(null);
    if (isIonq) setIonqLocked(true); // lock before the call: one job per IonQ run
    setStatus(`Submitting ${n} circuits × ${shots} shots to ${info.name}…`);
    try {
      const res = await callPy('run_bell_batch', n, shots);
      console.log(JSON.stringify(res));
      setResult(res);
      let message = res.ok
        ? `Done in ${res.submit_to_result_s} s. Ordering check: ${res.ordering_ok ? 'passed' : 'failed'}`
        : `Error: ${res.error_type}: ${res.error}`;
      if (isIonq) message += ` ${IONQ_LOCK_MESSAGE}`;
      setStatus(message);
    } catch (e) {
      let message = `Error: ${e?.name ?? 'Error'}: ${e?.message ?? e}`;
      if (isIonq) message += ` ${IONQ_LOCK_MESSAGE}`;
      setStatus(message);
    } finally {
      setBusy(false);
      if (isIonq) resolveFirstJobDone();
    }
  }

  return (
    <main className="page">
      <h1>Quantum MagNav: Qollab smoke test</h1>

      <section aria-labelledby="backend-heading">
        <h2 id="backend-heading">Backend</h2>
        {!qBackend && (
          <p className="warning">Backend unavailable: press Run on Qollab and choose a backend</p>
        )}
        {info && (
          <dl className="info">
            {INFO_FIELDS.map((key) => (
              <div key={key} className="info-row">
                <dt>{key}</dt>
                <dd>{show(info[key])}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="job-heading">
        <h2 id="job-heading">Batched Bell job</h2>
        <div className="controls">
          <div className="field">
            <label htmlFor={circuitsId}>Circuits per job</label>
            <select
              id={circuitsId}
              value={nCircuits}
              onChange={(e) => setNCircuits(Number(e.target.value))}
              disabled={busy || ionqLocked}
              aria-describedby={isIonq ? circuitsHelpId : undefined}
            >
              {CIRCUIT_OPTIONS.map((n) => (
                <option key={n} value={n} disabled={isIonq && n !== 1}>{n}</option>
              ))}
            </select>
            {isIonq && <p id={circuitsHelpId} className="help">{IONQ_CIRCUITS_HELP}</p>}
          </div>
          <div className="field">
            <label htmlFor={shotsId}>Shots</label>
            <select
              id={shotsId}
              value={shots}
              onChange={(e) => setShots(Number(e.target.value))}
              disabled={busy || ionqLocked}
            >
              {SHOT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="button" onClick={submit} disabled={disabled}>
            Submit one job
          </button>
        </div>
        <p role="status" aria-live="polite" className="status">{status}</p>
      </section>

      {result?.ok && (
        <section aria-labelledby="results-heading">
          <h2 id="results-heading">Results</h2>
          <table>
            <caption>Counts per circuit</caption>
            <thead>
              <tr>
                <th scope="col">Circuit</th>
                <th scope="col">Expected</th>
                <th scope="col">Counts</th>
              </tr>
            </thead>
            <tbody>
              {result.counts.map((counts, i) => (
                <tr key={i}>
                  <th scope="row">{i}</th>
                  <td>{i % 2 ? 'Ψ+ (01/10)' : 'Φ+ (00/11)'}</td>
                  <td><code>{JSON.stringify(counts)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {result && (
        <section aria-labelledby="raw-heading">
          <h2 id="raw-heading">Raw result JSON</h2>
          <pre tabIndex={0} aria-label="Raw result JSON">{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}

      <footer>
        <p>This effort is supported by Qollab &amp; IonQ.</p>
        <p>Theme: Quantum Impact · MIT License</p>
      </footer>
    </main>
  );
}

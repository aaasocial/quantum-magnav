// Local stand-in for the Pyodide 'magnav.api' module (vite dev only, never bundled).
const py = (impl) => ({ callPromising: async (...args) => impl(...args) });

export const backend_info = py(async () => JSON.stringify({
  name: 'dev-stub',
  class: 'DevStub',
  num_qubits: 24,
  noise_model: null,
  is_ionq: false,
  python: 'n/a (vite dev stub)',
  platform: 'browser-dev',
  qiskit: 'n/a',
  numpy: 'n/a',
  scipy: 'n/a',
  sklearn: 'n/a',
  qiskit_ionq: 'n/a',
  data_file: { note: 'stub' },
}));

export const run_bell_batch = py(async (_backend, n = 2, shots = 200) => JSON.stringify({
  ok: true,
  backend: 'dev-stub',
  n_circuits: n,
  shots,
  submit_to_result_s: 0.01,
  ordering_ok: true,
  counts: Array.from({ length: n }, (_, i) => (i % 2
    ? { '01': shots / 2, '10': shots / 2 }
    : { '00': shots / 2, '11': shots / 2 })),
}));

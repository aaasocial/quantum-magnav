# Qollab Findings (Phase 1 smoke test)

Status: FILLED 2026-10-10 01:05 PDT (orchestrator-run; incognito test and Slack question pending from builder)

The orchestrator ran these steps with the builder's authorization in a Playwright-controlled Chrome, signed in to Qollab as `eehhaa` (Eason Ha), between 00:45 and 01:05 PDT. The steps follow Plan 03, Task 2 (`.planning/phases/01-scaffold-compliance-and-qollab-smoke-test/01-03-PLAN.md`, steps 0-11). Two items are still **PENDING** and must be done by the builder: the incognito Run test and the #hackathon-help credits question.

Date/time (PDT): 2026-10-10 00:45-01:05  Browser/version: Chrome (Playwright-controlled)  Qollab project URL: https://qollab.xyz/u/eehhaa/quantum-magnav

## Platform constraints discovered

These facts change how later phases are built. Phase 4 must follow them.

- **IonQ jobs must hold exactly one circuit.** Qollab's IonQ proxy (`https://api.qollab.xyz/api/ionq/jobs`) accepts only job type `ionq.circuit.v1`. qiskit-ionq sends a list of circuits as `ionq.multi-circuit.v1`, so the proxy rejects it with HTTP 400 (`Only job type ionq.circuit.v1 is supported`). This happens with a list of 2, so the limit is 1 circuit per IonQ job. It contradicts Qollab's own docs: the error reference says "Pass every circuit to one backend.run call", and the primitives doc says the Estimator wrapper "submits them as one multi-circuit" job. Worth raising in #hackathon-help.
- **One IonQ job per Run.** After one IonQ job the page locks the Submit button and shows "IonQ allows one job per run. Press Stop, then Run, to submit another."
- **The built-in simulator accepts lists.** `basic_simulator` ran a 2-circuit list in 0.01 s.
- **scikit-learn is not preloaded.** `import sklearn` raises `ModuleNotFoundError` on both backends. List it in `requirements.txt` for Pyodide, or replace it with numpy code.
- **Runtime versions:** Python 3.14.2, qiskit 2.5.2, numpy 2.4.6, scipy 1.18.0.
- **qiskit-ionq is 1.0.2 on the platform** (only present when the IonQ backend is chosen). Do not rely on features that need qiskit-ionq 1.1 or later.
- **IonQ Forte 1 remote simulator:** 29 qubits, `forte-1` noise model. A job takes about 11-12 s whether it uses 200 or 4096 shots.
- **4096 shots are accepted** on the Forte 1 simulator.
- **Credits: 100** on the profile. Simulators are free. Only the "IonQ Forte 1 (36q) Credits apply" hardware backend spends credits.

## Runtime facts (from backend_info)

| Field | Built-in sim | IonQ Forte 1 (remote sim) |
|---|---|---|
| backend.name | `basic_simulator` | `ionq_simulator` |
| class | `BasicSimulator` | `IonQSimulatorBackend` |
| num_qubits | none (UI lists 24q) | 29 |
| options.noise_model | none | `forte-1` |
| python / platform | 3.14.2 (Pyodide) | 3.14.2 (Pyodide) |
| qiskit / numpy / scipy | 2.5.2 / 2.4.6 / 1.18.0 | 2.5.2 / 2.4.6 / 1.18.0 |
| qiskit_ionq version | unavailable: ModuleNotFoundError | 1.0.2 |
| sklearn import without listing? | No (unavailable: ModuleNotFoundError) | No (unavailable: ModuleNotFoundError) |
| data/smoke.json loaded? | Yes (`{"purpose":"Phase 1 smoke test data file","schema_version":1}`) | Yes |

## React bundle in sandbox

- Page rendered? Yes, the React bundle rendered inside the sandbox iframe.  Button click after load triggered a job? Yes  Console errors: none (no errors or warnings)

## Batched job probe (IonQ Forte 1 remote sim, one job per Run)

| Circuits | Shots | Result (ok / error_type) | submit→result (s) | ordering_ok | Notes |
|---|---|---|---|---|---|
| 2 (built-in sim) | 200 | ok | 0.01 | passed | counts `[{"11":104,"00":96},{"10":99,"01":101}]` |
| 2 | 200 | error: `IonQAPIError` HTTP 400 | n/a | n/a | `IonQAPIError(message='Only job type ionq.circuit.v1 is supported', status_code=400, body={"statusCode":400,"error":"Bad Request","message":"Only job type ionq.circuit.v1 is supported"})` from `https://api.qollab.xyz/api/ionq/jobs` |
| 1 (retry after commit d991b47) | 200 | ok | 11.38 | passed | counts `[{"10":1,"11":92,"00":106,"01":1}]`; forte-1 noise bit flips visible |
| 32 | 100 | not run (N/A) | | | Any list is rejected with the HTTP 400 above, whatever its length |
| 64 | 100 | not run (N/A) | | | Same |
| 128 | 100 | not run (N/A) | | | Same |
| 1 | 4096 | ok | 11.77 | passed | counts `[{"10":16,"11":2055,"00":2017,"01":8}]` |

**Max circuits per job confirmed:** 1 per IonQ job (Qollab's proxy accepts only `ionq.circuit.v1`), and 1 IonQ job per Run. The built-in simulator accepts lists.   **Max shots tested OK:** 4096 (Forte 1 remote sim, 1 circuit)

Second-job behaviour (exact text): "IonQ allows one job per run. Press Stop, then Run, to submit another." (the Submit button is disabled)

## Publishing

- Upload: `dist/qollab-upload.zip` went in via + New Project → Upload your own files. The card read "9 files · 303.8 KB · Runs as JS" and "README.md → project write-up". The project slug is `quantum-magnav`. A rebuilt zip (with commit d991b47) was uploaded later through Edit Code → file tree → Browse → Files… → Unpack → "Keep and add". It replaced the 9 files at the same paths and skipped the README, as documented.
- Project card: the write-up shows the README with "This effort is supported by Qollab & IonQ." The tags are `qiskit`, `noise` and `nisq` (3/20). The tag list is curated and has **no "Quantum Impact" tag** (searches for "Quantum Impact" and "impact" both return "No tags found"), so the theme has to be applied at submission or however the hackathon announces. Repository link is set to https://github.com/aaasocial/quantum-magnav and appears on the card as "GitHub repository".
- Published version name / time: `v0.1-smoke`, 2026-10-10 ~01:00 PDT, with release notes. Qollab confirmed "v0.1-smoke was created and is now the default version — this is what visitors see."
- Opens logged out (incognito)? Partly checked. A logged-out `curl` of https://qollab.xyz/u/eehhaa/quantum-magnav returns HTTP 200. The page is a client-rendered SPA shell, so curl cannot confirm the content. **PENDING (builder):** open the URL in a Chrome incognito window, check that the card and write-up render, press Run, and try both the built-in simulator and IonQ Forte 1 (Remote simulator). Write the results here.  Built-in sim runs logged out? PENDING (builder)  IonQ runs logged out? PENDING (builder). Qollab docs warn that anonymous users may see "Can't run quantum jobs as an anonymous user"; if so, copy the exact text here.
- Republish workflow noted: publish a new version at the same URL. On later uploads, the README must be pasted into the write-up by hand.

## Credits

- Balance in profile: **100 credits** (https://qollab.xyz/u/settings). Per Qollab docs, simulators are free and only the "IonQ Forte 1 (36q) Credits apply" hardware backend spends credits. The runner quotes an estimate and asks for approval when a job costs more than the allowance, which defaults to a tenth of the balance (10). The hackathon program page lists compute credits only as prizes.
- #hackathon-help answer (who/when/what): **PENDING (builder).** Ask whether participants get extra credits and what one small-circuit Forte 1 hardware run of about 500 shots costs.
- Decision for QNT-06: real hardware run / labeled forte-1 proxy: **Undecided until the Slack answer arrives.** If 100 credits covers one small single-circuit hardware job, do one real Forte 1 run. Otherwise use the Forte 1 remote simulator with the `forte-1` noise model and label it a proxy.

## Repository

Repository URL: https://github.com/aaasocial/quantum-magnav

Publishing the repository makes every tracked file and every commit (including author name and email) public. Only the builder runs these commands, at the Phase 1 checkpoint. The executor wrote them but did not run them.

**Pre-publication scan (run by the executor 2026-10-09 23:55 PDT, at commit c47e057 plus this plan's new files):**

- Filename scan, `git ls-files | grep -iE '\.env|secret|token|key'`: scan clean, no matches.
- Content scan, `git grep -nIE '(api[_-]?key|token|secret)\s*[:=]' -- . ':!.planning' ':!*.lock'`: scan clean, no matches.
- `~/.local/bin/gh auth status` (read-only): logged in to github.com as `aaasocial` (keyring), git protocol https, scopes include `repo`. Step (a) is therefore probably not needed.
- `git remote`: empty (no remote configured).
- No API keys exist in the code: Qollab injects `backend`, so the repo never holds an IonQ key.

**Commands (run from the repo root):**

(a) Only if not authenticated (choose GitHub.com, HTTPS, log in with a web browser):

```bash
~/.local/bin/gh auth login
```

(b) Create the public repo, add it as `origin` and push `main`:

```bash
~/.local/bin/gh repo create quantum-magnav --public --source=. --remote=origin --push --description "Quantum MagNav - Qollab x IonQ Hackathon 2026"
```

(c) Manual alternative: create a public repository named `quantum-magnav` at https://github.com/new (no README, no license, no .gitignore, so the first push does not conflict), then:

```bash
git remote add origin <url>
git push -u origin main
```

**Outcome (2026-10-10, ~00:45 PDT):** the repository was created with the builder's authorization and `main` was pushed. It is public at https://github.com/aaasocial/quantum-magnav. `origin` is set and `main` tracks `origin/main`. The filename and content secret scans were re-run before the push and came back clean.

## Decision

- Submission format: **Qollab JS project** (React bundle `main.js`/`main.css` + `index.html` + `main.py` + `magnav/` Python). Confirmed working on both backends. The Python-project fallback is not needed.
- Phase 4 job sizing: **N circuits = 1 per IonQ job (one job per Run)**, up to 29 qubits on the Forte 1 remote simulator. **Shots ≤ 4096** (4096 verified). Expect about 12 s per IonQ job.
  - Pack all windows into ONE circuit, for example independent 4-6-qubit feature-map blocks on separate qubit groups of the 29-qubit simulator, read out from the marginals of one counts dict. Alternatively, run the bulk on the built-in simulator or local Aer with the forte-1 noise model, and keep the single IonQ job as the verified showcase.
  - Add scikit-learn to `requirements.txt` for Pyodide, or use numpy versions of ridge and kernel ridge, because it is not preloaded.
  - Platform qiskit-ionq is 1.0.2. Do not use features that need 1.1 or later.

---
phase: 01
reviewed: 2026-10-10T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - magnav/__init__.py
  - magnav/api.py
  - main.py
  - pyproject.toml
  - scripts/package_qollab.sh
  - tests/test_api_smoke.py
  - tests/test_compliance.py
  - tests/test_qollab_contract.py
  - index.html
  - web/index.html
  - web/src/App.jsx
  - web/src/app.css
  - web/src/bridge.js
  - web/src/dev/magnavApiStub.js
  - web/src/main.jsx
  - web/vite.config.js
findings:
  critical: 2
  warning: 8
  info: 8
  total: 18
status: fixed
fixed_at: 2026-10-10
---

# Phase 01: Code Review Report

**Reviewed:** 2026-10-10
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

The Python API keeps to the main platform rules. It makes exactly one `backend.run` per call, uses `get_counts(i)`, constructs no provider, and returns errors from the backend as JSON instead of raising them. The React page locks before submission and uses a synchronous ref guard against double submits. The Vite config builds a single `main.js` with `magnav.api` kept external. `uv run pytest -q` gives 19 passed, and the committed `main.js` matches the current source (it has the `1` option and `useState(2)`).

The main problem: the code still treats multi-circuit IonQ jobs as valid, even though this phase found that Qollab's IonQ proxy rejects them with HTTP 400. On an IonQ backend, the default UI choice (2 circuits) and the `main.py` fallback are both guaranteed to fail. Because the page locks after any IonQ submission, that failure also uses up the run's single job. No layer enforces the new rule (Python, UI or tests). The one-job lock also depends on a fragile name-prefix check. Smaller issues: the "always return JSON, never raise" contract can break, the test suite conflicts with the declared Python range and with the Phase 4 plan for requirements.txt, and the packaging script's allowlist takes in all of `data/*` without checks.

## Critical Issues

### CR-01: The default IonQ submission always fails and uses up the run's single IonQ job

**File:** `web/src/App.jsx:4,26,57` (also `magnav/api.py:11,76,91`)
**Issue:** `nCircuits` defaults to `2`, and `CIRCUIT_OPTIONS`/`ALLOWED_CIRCUITS` still allow 2/32/64/128 on every backend. QOLLAB_FINDINGS.md records that any list sent to an IonQ backend on Qollab fails with `IonQAPIError ... Only job type ionq.circuit.v1 is supported` (HTTP 400). A visitor who picks IonQ Forte 1 and presses "Submit one job" without changing the default gets a certain failure. Line 57 then sets `ionqLocked`, and the `finally` block resolves `firstJobDone`, so the Run ends. The visitor has to Stop and Run again, and nothing on the page tells them to choose 1 circuit. For the published judged demo this is a broken default path. `run_bell_batch` accepts `n > 1` for IonQ backends, so the Python layer does not protect against it either.
**Fix:** Enforce the rule in Python, which is the source of truth, and in the UI.
```python
# magnav/api.py, after the allowlist check
if _is_ionq(backend) and n != 1:
    return _failure(backend, n, s, "ValueError",
                    "Qollab's IonQ proxy accepts only single-circuit jobs (ionq.circuit.v1); use n_circuits=1")
```
```jsx
// App.jsx: after info loads, force 1 circuit and offer only [1] on IonQ
const circuitOptions = isIonq ? [1] : CIRCUIT_OPTIONS;
useEffect(() => { if (isIonq) setNCircuits(1); }, [isIonq]);
```
Add a pytest that uses a backend named `ionq_simulator` and asserts `n_circuits=2` returns `ok: false` with `calls == 0`.

### CR-02: The `main.py` fallback always fails on IonQ and ships in the JS upload zip

**File:** `main.py:15`, `scripts/package_qollab.sh:29-30`
**Issue:** `run_bell_batch(backend, 2, 200)` is hardcoded, so the Python-project fallback (`dist/qollab-fallback-py.zip`) fails with HTTP 400 on every IonQ backend, for the same reason as CR-01. `main.py` is also in `COMMON` and therefore in `qollab-upload.zip`. The docs do not say whether Qollab runs `main.py` in a JS project. The smoke test suggests it does not, but if it did, `main.py` would submit a job before the React page and take the one IonQ job.
**Fix:** Use a single circuit, and leave `main.py` out of the JS upload unless it is required.
```python
print(run_bell_batch(backend, 1, 200))  # Qollab IonQ: 1 circuit per job, 1 job per run
```
```bash
COMMON=(requirements.txt LICENSE README.md "${PY_FILES[@]}" "${DATA_FILES[@]}")
UPLOAD=(index.html main.js main.css "${COMMON[@]}")
FALLBACK=(main.py "${COMMON[@]}")
```

## Warnings

### WR-01: The one-job lock depends on a name-prefix heuristic

**File:** `magnav/api.py:42`, `web/src/App.jsx:49,53,57`
**Issue:** `is_ionq = str(name).startswith("ionq")` is the only input to the UI's one-job lock. If Qollab or qiskit-ionq exposes an IonQ backend whose name does not start with `ionq` (for example a `qpu.forte-1`-style name, a wrapper class, or `name=None`), then `isIonq` is false. The ref guard is skipped, the selects stay enabled, and a second submit stops the Run with the platform error. `firstJobDone` is never resolved either.
**Fix:** Detect by provider module as well as name.
```python
def _is_ionq(backend) -> bool:
    mod = type(backend).__module__ or ""
    return mod.startswith("qiskit_ionq") or str(getattr(backend, "name", "")).lower().startswith("ionq")
```

### WR-02: `run_bell_batch` can raise instead of returning JSON (the contract breaks)

**File:** `magnav/api.py:73-75`
**Issue:** If `int()` fails on a non-numeric argument (such as a Pyodide `JsProxy`, `None` or an object), `_failure` is called with the raw value and `json.dumps` raises `TypeError: Object of type ... is not JSON serializable`. Verified locally: `run_bell_batch(sim, object(), 200)` raises. The check also lets `True` through as 1 circuit and truncates floats (`200.9` becomes 200).
**Fix:**
```python
except (TypeError, ValueError) as e:
    return _failure(backend, repr(n_circuits)[:50], repr(shots)[:50], "ValueError", str(e))
```
Also reject `bool` and non-integral floats: `if isinstance(x, bool) or (isinstance(x, float) and not x.is_integer())`.

### WR-03: No test covers the single-circuit (bare `QuantumCircuit`) submission path

**File:** `tests/test_api_smoke.py:12-21,33-51`
**Issue:** The key platform finding (`payload = tqc[0] if n == 1 else tqc`) is untested. `SpySim` counts calls but does not record what was passed to it. No test uses `n=1`, checks that a bare circuit is sent rather than a list, or checks the IonQ restriction. If someone reverts line 91 to `backend.run(tqc)`, all 19 tests still pass, but every IonQ run fails.
**Fix:** Have `SpySim.run` store `self.last_payload = a[0]`, then add:
```python
def test_single_circuit_submits_bare_circuit():
    spy = SpySim(); out = json.loads(api.run_bell_batch(spy, 1, 200))
    assert spy.calls == 1 and isinstance(spy.last_payload, QuantumCircuit)
    assert out["ok"] and len(out["counts"]) == 1
```

### WR-04: The Python version test contradicts the declared range and the target platform

**File:** `tests/test_compliance.py:55-56`, `pyproject.toml:7`
**Issue:** `pyproject.toml` declares `>=3.13,<3.15`, and the platform runs Python 3.14.2, but `test_python_313` fails on anything other than 3.13. Running the suite on the same interpreter Qollab uses fails falsely.
**Fix:** `assert (3, 13) <= sys.version_info[:2] < (3, 15)`, or narrow `requires-python` to 3.13 if 3.13 is really intended.

### WR-05: The requirements test blocks the documented Phase 4 plan, and pyproject declares a package the runtime lacks

**File:** `tests/test_compliance.py:33-39`, `pyproject.toml:12`
**Issue:** QOLLAB_FINDINGS.md says scikit-learn is not preloaded and must be listed in `requirements.txt`, or replaced with numpy code. `test_requirements_is_only_qiskit_pin` requires `requirements.txt` to contain only the qiskit pin, so following the documented plan fails CI. Meanwhile `scikit-learn` is a runtime dependency in `pyproject.toml`, so code can import sklearn locally and pass every test, then fail with `ModuleNotFoundError` on Qollab. That is the "works locally, fails on Qollab" failure CLAUDE.md warns about.
**Fix:** Move `scikit-learn` to the dev group, or keep `requirements.txt` and pyproject in sync. Change the test to assert an allowlist of requirement names (`{"qiskit", "scikit-learn"}`) instead of one exact list.

### WR-06: The packaging allowlist takes in all of `data/*` without checks

**File:** `scripts/package_qollab.sh:25,29,36,12`
**Issue:** `DATA_FILES=(data/*)` puts every file in `data/` into a public upload, so this is not an explicit allowlist. A subdirectory under `data/` fails with the misleading message "allowlisted file missing", and `zip` without `-r` would not add its contents anyway. The forbidden-path regex checks only names, and the script never scans contents, although the findings doc says secret scans were run. The `\.env` pattern also misses names like `data/credentials.json`.
**Fix:** List data files explicitly (they must be literal paths in Python anyway, e.g. `DATA_FILES=(data/smoke.json)`). Alternatively, fail on non-files with a clear message and add a content scan:
```bash
for f in "${DATA_FILES[@]}"; do [ -f "$f" ] || fail "data entry is not a regular file: $f"; done
if grep -nIE '(api[_-]?key|token|secret|password)\s*[:=]' "${UPLOAD[@]}" 2>/dev/null; then fail "possible secret in upload"; fi
```

### WR-07: Contract tests check the committed `main.js`, not a fresh build

**File:** `tests/test_qollab_contract.py:21-37`
**Issue:** The tests read the `main.js` in the repo root, but nothing ensures it was rebuilt from `web/src`. If `App.jsx` is edited without running `npm run build`, every contract test still passes on the stale bundle, and `package_qollab.sh` is the only thing that rebuilds. Also, `test_main_js_no_exports_and_size` checks only `export{` and `export` at the start of a line, so a minified `;export {x}` would get through.
**Fix:** Add a check (CI or test) that rebuilds and confirms the result matches, e.g. `npm --prefix web run build && git diff --exit-code main.js main.css`. Use the regex `re.search(r'(^|[;}\s])export\s*[{*]|export\s+default', text, re.M)`.

### WR-08: The keep-alive promise never resolves unless the IonQ path runs

**File:** `web/src/main.jsx:8`, `web/src/App.jsx:74`
**Issue:** `firstJobDone` is resolved only in the `finally` block of an IonQ submit. In three cases the top-level `await` hangs forever: (a) `backend_info` fails (the button stays disabled forever), (b) `is_ionq` is misdetected (WR-01), or (c) `qBackend` is null. The Run then never finishes and keeps waiting for a job that cannot happen. Hanging on the built-in simulator is intended, but these error states are not.
**Fix:** Resolve `firstJobDone` when the page reaches a terminal state, for example in the `backend_info` catch block and when `!qBackend`. Also export a single `endRun()` helper so every terminal path calls the same function.

## Info

### IN-01: Empty counts dict is not handled in the ordering check

**File:** `magnav/api.py:96-99`
**Issue:** `max(c, key=c.get)` raises `ValueError` on an empty counts dict. The outer `except` catches it, but the job has already run, so its real counts are lost and the result is reported as a failure.
**Fix:** `max(c, key=c.get) if c else None` and treat `None` as an ordering failure.

### IN-02: A NaN or Infinity in the data file breaks `JSON.parse` in the bridge

**File:** `magnav/api.py:51,54`, `web/src/bridge.js:12`
**Issue:** `json.load` accepts `NaN`/`Infinity`, and `json.dumps` writes them back out. `JSON.parse` in JS rejects them, so `backend_info` throws on the page.
**Fix:** `json.dumps(info, allow_nan=False)` inside a try block, or load with `parse_constant` to reject them.

### IN-03: Leftover `console.log` debug output

**File:** `web/src/App.jsx:61`
**Issue:** This logs the full result to the Qollab console. It may be intentional for the smoke test, but it should be removed or labelled before the final demo.
**Fix:** Remove it, or prefix it (`console.info('[magnav] result', ...)`).

### IN-04: Non-IonQ double submit is guarded only by stale state

**File:** `web/src/App.jsx:53`
**Issue:** On non-IonQ backends the ref guard is skipped, and `disabled` comes from the render closure. Two clicks before React re-renders can start two concurrent jobs, and their status and result updates race.
**Fix:** `if (disabled || submitted.current && (isIonq || busyRef.current)) return;` with a `busyRef` set synchronously.

### IN-05: `aria-label` on a `<pre>` with no role

**File:** `web/src/App.jsx:159`
**Issue:** ARIA does not support `aria-label` on a generic element with no role, so screen readers may ignore it. Focus is also not moved to, or announced for, the results table when it appears.
**Fix:** `<pre role="region" aria-labelledby="raw-heading" tabIndex={0}>`.

### IN-06: `qBackend` is captured once at module evaluation

**File:** `web/src/bridge.js:6`
**Issue:** If Qollab injects or replaces `backend` after `main.js` runs, the page keeps the stale `null` or the old backend.
**Fix:** Read it inside `callPy` through a getter: `const getBackend = () => (typeof backend !== 'undefined' ? backend : globalThis.backend ?? null);`.

### IN-07: The dev alias covers only `magnav.api`

**File:** `web/vite.config.js:10-12,24`
**Issue:** The build marks every `magnav.*` module as external, but the dev server aliases only `magnav.api`. A future `import ... from 'magnav.flight'` will fail in `vite dev`. Writing to `outDir: '..'` with `emptyOutDir: false` is safe for now because lib mode writes only `main.js` and `main.css` and assets are inlined. Any future emitted asset (e.g. a worker or a large wasm file) would land loose in the repo root, and only `test_no_stray_build_output` checks for `assets/`.
**Fix:** Use a regex alias such as `{ find: /^magnav\.(.+)$/, replacement: '/src/dev/stubs/$1.js' }`. Keep `assetsInlineLimit`, and set `build.rollupOptions.output.assetFileNames` to fail loudly, or check that only `main.js` and `main.css` changed after the build.

### IN-08: Minor wording and pattern looseness

**File:** `web/src/App.jsx:58,100`, `scripts/package_qollab.sh:58`
**Issue:** The status reads "Submitting 1 circuits". The heading still says "Batched Bell job" although IonQ is single-circuit. `has_entry` uses `grep -x` with an unescaped `.` (`main.js` also matches `mainXjs`).
**Fix:** Pluralize properly, rename the heading to "Bell job", and use `grep -qxF "$2"`.


## Fix Outcomes

Applied 2026-10-10 by gsd-code-fixer. Final state: `uv run ruff check` clean, `uv run pytest -q` 41 passed (was 19), `scripts/package_qollab.sh` OK. `main.js` starts with `import * as e from "magnav.api";` and has no export statements.

| ID | Outcome | Commit | Notes |
|----|---------|--------|-------|
| CR-01 | fixed | cc53bf7 | `run_bell_batch` rejects n_circuits>1 on IonQ before submitting (ValueError JSON). Page defaults to 1, disables multi-circuit options on IonQ with help text, and always sends n=1 to IonQ. Tests in aad0eef. |
| CR-02 | fixed | a6dc3bf | `main.py` defaults to 1 circuit (optional CLI arg). Removed from the JS upload zip, kept in the fallback, and the script now fails if it reaches the upload. Also fixed a latent `has_entry` SIGPIPE/pipefail bug. |
| WR-01 | fixed | cc53bf7 | `_is_ionq`: provider module `qiskit_ionq*` or name prefix `ionq` (case-insensitive). Exposed as `is_ionq`; the page relies on it. |
| WR-02 | fixed | 1fec379 | `_failure` repr()s inputs and stringifies name/error, so it never raises. Bools and non-integral/NaN/inf floats are rejected. Tests in aad0eef. |
| WR-03 | fixed | aad0eef | Tests: bare QuantumCircuit for n=1, list for n=2 on non-IonQ, fake IonQ (module `qiskit_ionq.fake` and name `ionq_simulator`) with n=2 returns ok=false and makes 0 `run` calls. |
| WR-04 | fixed | 5e31f0d | The version test accepts 3.13 <= v < 3.15, matching `requires-python`. |
| WR-05 | fixed (partial) | 436d00b | Requirements test is an allowlist (qiskit required, scikit-learn optional; forbids flags, markers, aer/ionq/numpy/scipy/torch). New test requires scikit-learn in requirements.txt if magnav imports sklearn. scikit-learn was left in pyproject runtime deps (moving it would change uv.lock). The new test covers the drift risk. |
| WR-06 | fixed | 0def0ca | Explicit `DATA_FILES=(data/smoke.json)` with a regular-file check. Content secret scan (keyword assignments + AWS/GitHub/Slack/sk-/private-key shapes) fails the script. Wider forbidden-name pattern. |
| WR-07 | fixed | 5e3e77c | Export regex catches `;export{`, `}export *`, `export default` and declaration exports. New test builds into a temp dir and requires byte-equal main.js/main.css (skips without node_modules). |
| WR-08 | fixed | 3de9c87 | `runDone` resolves on the IonQ job finishing, no backend, a backend_info failure, or a 10-min idle bound (never while a job is in flight). Submit is disabled once the run ends. |
| IN-01 | fixed | b427a64 | Empty counts fail `ordering_ok` instead of raising. |
| IN-02 | fixed | b427a64 | `backend_info` uses `allow_nan=False` and reports a NaN data file as an error string. Test added. |
| IN-03 | fixed | b695fb7 | Removed the debug `console.log`. |
| IN-04 | fixed | 3de9c87 | The synchronous `submitted`/`busyRef` guard now applies on every backend. |
| IN-05 | fixed | b695fb7 | `<pre role="region" aria-labelledby="raw-heading" tabIndex={0}>`. |
| IN-06 | skipped | - | Design change to bridge backend lookup. Not trivial, and there was no observed failure on Qollab. |
| IN-07 | skipped | - | Dev-only alias/asset-name hardening, deferred until a second `magnav.*` module exists. WR-07's fresh-build test partly covers stray output. |
| IN-08 | fixed | b695fb7, a6dc3bf | Pluralized status and "Bell job" heading (b695fb7). `has_entry` uses `grep -xF` (a6dc3bf). |

Follow-ups: the live Qollab project still contains the `main.py` uploaded earlier ("Keep and add" does not delete files). Remove it in the Qollab file tree if needed. `web/src/dev/magnavApiStub.js` still defaults `n=2` (dev only, harmless).

---

_Reviewed: 2026-10-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

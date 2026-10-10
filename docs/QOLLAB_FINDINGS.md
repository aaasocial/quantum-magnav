# Qollab Findings (Phase 1 smoke test)

Status: TEMPLATE — filled in by the builder at the Phase 1 human checkpoint

**How to fill this in:** follow the click-by-click steps in Plan 03, Task 2 (`.planning/phases/01-scaffold-compliance-and-qollab-smoke-test/01-03-PLAN.md`, steps 0-11). Replace every `___` and empty table cell with what you see on Qollab. The page shows the raw result JSON in a box you can copy from. When done, change the Status line above to `Status: FILLED <date/time>`.

Date/time (PDT): ___  Browser/version: ___  Qollab project URL: ___

## Runtime facts (from backend_info)

| Field | Built-in sim | IonQ Forte 1 (remote sim) |
|---|---|---|
| backend.name | ___ | ___ |
| class | ___ | ___ |
| num_qubits | ___ | ___ |
| options.noise_model | ___ | ___ |
| python / platform | ___ | ___ |
| qiskit / numpy / scipy | ___ | ___ |
| qiskit_ionq version | ___ | ___ |
| sklearn import without listing? | ___ | ___ |
| data/smoke.json loaded? | ___ | ___ |

## React bundle in sandbox

- Page rendered? ___  Button click after load triggered a job? ___  Console errors: ___

## Batched job probe (IonQ Forte 1 remote sim, one job per Run)

| Circuits | Shots | Result (ok / error_type) | submit→result (s) | ordering_ok | Notes |
|---|---|---|---|---|---|
| 2 | 200 | | | | |
| 32 | 100 | | | | |
| 64 | 100 | | | | |
| 128 | 100 | | | | |
| 2 | 1024 | | | | |
| 2 | 4096 (optional) | | | | |

**Max circuits per job confirmed:** ___   **Max shots tested OK:** ___

Second-job behaviour (exact text): ___

## Publishing

- Published version name / time: ___
- Opens logged out (incognito)? ___  Built-in sim runs logged out? ___  IonQ runs logged out? ___ (anonymous-user message?)
- Republish workflow noted: new version, same URL; README must be pasted manually on later uploads.

## Credits

- Balance in profile: ___   #hackathon-help answer (who/when/what): ___
- Decision for QNT-06: real hardware run / labeled forte-1 proxy: ___

## Repository

Repository URL: ___

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

Then paste the URL into the `Repository URL:` line above, or write `skipped` (Phase 6 needs the repo at the latest).

## Decision

- Submission format: JS project (React) / Python-project fallback: ___
- Phase 4 job sizing: N circuits = ___, shots = ___

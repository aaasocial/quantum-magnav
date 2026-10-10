---
phase: 4
slug: quantum-denoiser-and-ionq-runs
status: approved
shadcn_initialized: false
preset: none
created: 2026-10-10
extends: 03-frontend-vertical-slice/03-UI-SPEC.md
---

# Phase 4 - UI Design Contract (delta on Phase 3)

> Scope: UI-04 only. Everything not listed here is **inherited from 03-UI-SPEC.md** unchanged. Sources: 04-CONTEXT.md D-07..D-09, D-13..D-16; REQUIREMENTS.md UI-04; existing `StatusStrip.jsx`, `MetricsTable.jsx`, `ControlBar.jsx`. Anything marked **[R-decision]** was decided here under autonomous mode.

---

## Design System

Inherited from 03-UI-SPEC.md: no shadcn, native HTML controls, plain CSS in `web/src/app.css`, system font, dark theme only, no icon library.

## Spacing Scale

Inherited from 03-UI-SPEC.md. New elements use only `--space-1` (4px, badge vertical padding), `--space-2` (8px, badge gaps, horizontal padding) and `--space-3` (16px, row gap). Verify button height 36px (same as other controls). No new exceptions.

## Typography

Inherited (4 sizes: 14 / 16 / 20 / 28; 2 weights: 400 / 600). All new text is Label (14px, 400); the designed-row text in the table keeps the inherited weight 600 only when it is the "(on map)" row. No new sizes or weights.

## Color

Inherited from 03-UI-SPEC.md. **No new colours.**

- Provenance badges use the existing `.mode-badge` style: `--color-surface-2` background, `--color-text` text, `--color-border` border. Meaning is carried by the **text**, never by colour. The green `--color-ok` variant stays exclusive to the "computed in-page" mode badge and is not used for the quantum badges, including "recorded hardware result".
- The "Verify on this backend" button is a **secondary** button (same style as `.btn-small`: surface-2 background, `--color-border-control` border). It does **not** use accent (the accent reserved list is unchanged: focus ring, Play/Pause, Run live in-page, slider, series checkboxes, playhead).
- Verification failure uses the existing danger notice (`--color-danger`, 4px left border). Not used on the button.
- Shot-noise error bar is text, not a graphic: `± 3.2 nT` in muted text (`--color-text-muted`).

Data series: the `quantum` series keeps its colour (`#F0E442`), dash (`1 5`, round caps) and draw order from 03-UI-SPEC.md. Identity-map and random-map are **table rows only**: no signal-panel series, no map-track option, no checkboxes **[R-decision]**.

---

## Layout and Responsive Rule

Inherited. Changes inside existing regions only:

1. **Status strip** (`<section aria-label="Run status">`), top to bottom:
   1. Existing status row (mode badge, status message, End run).
   2. Existing live progress and danger notice slots.
   3. **NEW quantum provenance row** (`<div class="quantum-prov" role="group" aria-label="Quantum verification provenance">`): flex-wrap, gap `--space-2`, badges in the order: source badge, backend badge, shots badge, timestamp badge. Rendered only when the artifact (or a live verification) has a quantum verification record.
   4. **NEW verify row** (`<div class="quantum-verify">`): the "Verify on this backend" button, then the help/status text on the same line (wraps below the button under 600px), then the comparison readout paragraph beneath.
   5. Existing provenance line (muted).
2. **Results section:** Navigation accuracy table gains three quantum rows (see below). No new columns.

DOM order matches visual order; the Verify button is the last tab stop in the status strip (after End run). No positive `tabindex`.

---

## Component Inventory (changes only)

| Component | Change | Key a11y contract |
|-----------|--------|-------------------|
| `StatusStrip` | Renders the `QuantumProvenance` row and `VerifyControl` (passed via the existing `children` slot or new props); `BADGE`, `STAGE_TEXT` and `FIT_LABELS`/`DEN_LABELS` text "quantum slot" becomes "quantum feature map" | Badges are plain text spans; the group has `aria-label`; the button is a native `<button>` with `aria-describedby` pointing at its help text |
| `QuantumProvenance` (new) | Four text badges from `quantum.verification` (artifact) or the live verify result | No colour-only meaning; each badge reads on its own |
| `VerifyControl` (new) | One-shot submit button, state machine idle / submitting / done / failed / locked, comparison readout | `aria-busy="true"` on the strip row while submitting; focus parks on `.status-message` (tabIndex -1) when the button disables itself (existing WR-02 pattern); announces only through the single `Announcer` |
| `MetricsTable` | Adds designed / identity / random quantum rows; shot-noise error bar in the designed row's Signal RMSE cell | `<th scope="row">` for each row; the error bar text is inside the cell so screen readers read it with the value |
| `theme.js` | `SERIES.quantum.label` becomes `Quantum feature map` (all other fields unchanged); add `QUANTUM_ROWS` label constants | Single source for labels |
| `ControlBar` | Series legend, map-track select and checkbox label pick up the new label automatically. **Remove** the "Same as TL until Phase 4, so the lines overlap." stub note | - |

---

## Interaction Contract

### Provenance badges (UI-04)

Four badges, text only. Format and values:

| Badge | Text | Notes |
|-------|------|-------|
| Source | `recorded hardware result` / `proxy (noise model)` / `ideal (built-in)` / `hardware result (this Run)` | See source rules below. This is the first badge so it is read first |
| Backend | the backend name verbatim from the artifact or `backend_info` (e.g. `IonQ Forte 1 (36q)`, `Forte 1 simulator (forte-1 noise model)`, `Built-in simulator`) | Never abbreviated or invented |
| Shots | `{n} shots` (thousands separator, e.g. `4,096 shots`, `500 shots`) | - |
| Timestamp | `{YYYY-MM-DD HH:mm} UTC` | From the record's timestamp; always UTC |

Source rules **[R-decision]**:
- Precomputed replay shows `data/forte_hardware_run.json` as **recorded hardware result** when that file exists and validates.
- If hardware was refused or failed (D-14) the artifact carries the `forte-1` noise-model simulation: source **proxy (noise model)**.
- A result from the built-in simulator (live verify, or fallback with no noise model): **ideal (built-in)**.
- A live verify on the `forte-1` noise-model backend: **proxy (noise model)**. A live verify on a real hardware backend: **hardware result (this Run)**.
- A live result replaces the recorded one in the row for the rest of the Run; the recorded one returns when the Run is ended or a new line/sensor is chosen.

Also append the K sample count to the readout (not a badge): shown in the comparison readout line.

### Quantum rows in the Navigation accuracy table

Row order after Dead reckoning: Raw cabin, Low-pass, Tolles-Lawson (TL), TL + currents, Classical KRR, then the quantum block: **Quantum feature map**, **Quantum: identity map**, **Quantum: random map**. Columns unchanged (Method, Mean error, CEP50, CEP95, Under 556 m, Signal RMSE). Values come only from the artifact (`lines[i].metrics`, `quantum.ablation`); the UI never recomputes.

| Row | Label | Notes |
|-----|-------|-------|
| Designed | `Quantum feature map` (suffix ` (on map)` when it is the map track) | Signal RMSE cell shows `{x.x}` followed by a muted second line `± {n.n} nT shot noise` |
| Identity | `Quantum: identity map` | No error bar |
| Random | `Quantum: random map` | No error bar |

- The error bar value is the quantum-prediction difference (nT) between shot-estimated and exact correlators (D-08). Format `± 3.2 nT` (one decimal, absolute value). Hide the second line entirely when no verification record exists; never show `± 0.0` as a placeholder.
- Identity and random rows are shown when the artifact has ablation data for the line/sensor; in live mode they show `n/a` in every numeric cell with the table-level note below (live mode computes only the designed map).
- Table-level note (muted Label, under the table, only in live mode): `Identity and random maps are in the precomputed replay only.`
- If the designed map does not beat the identity or random rows, the table shows the numbers unchanged. No highlight, no "winner" styling (D-12: reported as measured).

### Verify on this backend (one job per Run, then locked)

**State machine**

| State | Button | Text beside/below | Trigger out |
|-------|--------|-------------------|-------------|
| `idle` | enabled, label `Verify on this backend` | Help (below) | click |
| `no-backend` | disabled | `Verify needs a backend: press Run on Qollab and pick one. The recorded result is shown instead.` | backend appears |
| `submitting` | disabled, label `Submitting…`, row `aria-busy="true"` | `Submitting one circuit to {backend}…` | resolve / reject |
| `done` | disabled, label `Verified on this Run` | comparison readout (below) | End run only |
| `failed` | disabled, label `Verification failed` | danger notice (below) | End run only |
| `locked` | disabled, label `Verify on this backend` | `Already verified on this Run. End the run and press Run again to verify again.` | End run only |

- `locked` is the resting state of a Run after `done` or `failed` is reached once (and also the state if the Run restored an earlier verify). Failed counts as used: one IonQ job per Run, no retry.
- Idle help (Label, muted, linked by `aria-describedby`): `Runs one circuit of {K} samples at {shots} shots on {backend}. One job per Run; it cannot be repeated.`
- The click calls `backend.run` exactly once (single bare circuit, D-07). Playback keeps its state; the rest of the page stays interactive. The button is disabled synchronously on click (before the async call) so a double click cannot submit twice.
- Changing line or sensor does not reset the lock (the lock is per Run). The shown comparison keeps its own sample ids; the readout adds the line/sensor in the `done` caption if the user has since changed selection **[R-decision]**: `(computed for {line} / {sensor label})`.

**Comparison readout** (Label size, `--color-text`; sits under the button; tabular numerals)

`Shot-estimated vs exact correlators: max |Δ| = {0.000} ; prediction Δ = {n.n} nT`

Rules: `max |Δ|` is the largest absolute difference across all correlators and all K samples, 3 decimals; `prediction Δ` is the quantum-prediction difference, 1 decimal, no sign. Keep the literal ` ; ` separator and the symbol `Δ`. A muted second line gives the sample set: `{K} held-out samples after GPS loss, 4 qubits each, one circuit.`

**Error and fallback copy**

| Case | Copy (danger notice in the status strip) |
|------|------------------------------------------|
| Job rejected / exception | `Verification failed: {error_type}: {message}. Showing the {source badge text} instead.` |
| Timeout (use the same 90 s rule as live run) | `Verification took longer than 90 s. Showing the {source badge text} instead.` |
| Credits refused / hardware not approved | `Hardware run was not approved. Showing the proxy (noise model) result instead.` |
| Backend does not support the circuit | `This backend cannot run the verification circuit ({message}). Showing the {source badge text} instead.` |

`console.error` logs the full error (inherited rule). The fallback never leaves the row empty: the recorded or proxy result stays visible.

### aria-live additions (single polite region, inherited rules)

| Trigger | Announcement | Throttle |
|---------|--------------|----------|
| Click Verify | `Submitting verification circuit to {backend}.` | once |
| Done | `Verification finished. Largest correlator difference {0.031}. Prediction difference {3.2} nanotesla.` | once |
| Failed | `Verification failed. Showing the {source badge text}.` | once |
| Precomputed artifact ready (appends to the inherited announcement) | none added. The badges are not announced on load | - |

Say "nanotesla" and spell out the numbers; do not use `±`, `Δ` or `|Δ|` in announcements. The `locked` state is not announced.

### Label renames

| Where | Old | New |
|-------|-----|-----|
| Series label (legend, checkbox, map-track option, chart `aria-label`, figcaption, mini-table row) | `Quantum slot (stub until Phase 4)` | `Quantum feature map` |
| Live stage 2 text | `Step 2 of 4: cleaning signal (raw, low-pass, TL, quantum slot)…` | `Step 2 of 4: cleaning signal (raw, low-pass, TL, quantum feature map)…` |
| Live "Now fitting" label | `fitting the quantum slot` | `fitting the quantum feature map` |
| Progress denoiser label | `quantum slot` | `quantum feature map` |
| Stub note | `Same as TL until Phase 4, so the lines overlap.` | removed |

Keep `aria-label` / announcement strings in sync with the table above.

---

## Copywriting Contract (new strings only; all others inherited)

| Element | Copy |
|---------|------|
| Verify button (idle / locked) | Verify on this backend |
| Verify button (submitting) | Submitting… |
| Verify button (done) | Verified on this Run |
| Verify button (failed) | Verification failed |
| Idle help | Runs one circuit of {K} samples at {shots} shots on {backend}. One job per Run; it cannot be repeated. |
| No backend help | Verify needs a backend: press Run on Qollab and pick one. The recorded result is shown instead. |
| Submitting text | Submitting one circuit to {backend}… |
| Locked text | Already verified on this Run. End the run and press Run again to verify again. |
| Comparison readout | Shot-estimated vs exact correlators: max \|Δ\| = {0.000} ; prediction Δ = {n.n} nT |
| Sample caption | {K} held-out samples after GPS loss, 4 qubits each, one circuit. |
| Source badges | recorded hardware result · proxy (noise model) · ideal (built-in) · hardware result (this Run) |
| Shots badge | {n} shots |
| Timestamp badge | {YYYY-MM-DD HH:mm} UTC |
| Table rows | Quantum feature map · Quantum: identity map · Quantum: random map |
| Error bar | ± {n.n} nT shot noise |
| Live-mode table note | Identity and random maps are in the precomputed replay only. |
| Primary CTA for this phase | Verify on this backend (secondary style; Play/Pause and Run live in-page remain the only accent buttons) |
| Empty state | No quantum verification record: the Verify row shows only the button and its help text; the badge row and the readout are not rendered |
| Error state | See the error table above |
| Destructive actions | not applicable. The one-shot lock is the guard against repeat submission; the Verify click needs no confirmation because it is a single-circuit job. Hardware credit approval is handled by the Qollab runner and the builder outside this UI (D-13) |

---

## Registry Safety

Inherited: no shadcn, no third-party registries, no new npm dependencies for this phase. `main.js` budget stays < 1.5 MB (D-16).

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending checker (frontmatter `status: approved` set by the orchestrator request)

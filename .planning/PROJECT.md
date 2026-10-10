# Magnetic Field Detector (Quantum MagNav)

## What This Is

A hackathon demo of GPS-denied drone navigation by magnetic anomaly matching (MagNav), modeled on what SandboxAQ's AQNav does. It replays real survey flights from the public DAF-MIT AIA / Sander Geophysics Ltd. 2020 MagNav dataset (a Cessna Grand Caravan near Ottawa standing in for the drone). The cabin magnetometers are polluted by the aircraft's own electronics, while a tail-stinger magnetometer provides the clean reference. A hybrid pipeline strips that noise with a Qiskit quantum feature map plus classical readout, then matches the cleaned signal against real Ottawa-area crustal anomaly maps (MagNav.jl Eastern_395 / Renfrew_395) to recover position after a simulated GPS jam. Built solo in ~40 hours for the Qollab × IonQ Hackathon (Oct 9–11, 2026), with a React + Vite frontend and a Python backend.

## Core Value

Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Local preprocessing script turns the SGL 2020 flight files (Flt1006 calibration line 1006.08; held-out lines 1003.02 and 1007.06) and the Eastern_395 / Renfrew_395 maps into cropped, decimated `data/*.npz` excerpts under 2 MB each, with a provenance JSON sidecar
- [ ] Truth (tail-stinger `mag_1_c` / `mag_1_igrf`, `lat`/`lon`/`utm_*`) is kept separate from Sensors (cabin `mag_3_uc`/`mag_4_uc`/`mag_5_uc`, fluxgates `flux_a..d`, `cur_*` currents, INS attitude and velocities) so no estimator can see truth
- [ ] A simulated INS-drift track (integrated `ins_vn`/`ins_vw` plus bias and random walk) serves as the dead-reckoning prior after a simulated GPS jam, because the recorded INS is GPS-aided
- [ ] Classical baseline: Tolles-Lawson fitted on calibration line 1006.08, plus an equal-feature classical kernel ridge model, evaluated on held-out lines 1003.02 and 1007.06
- [ ] Quantum denoising subroutine built with Qiskit (variational circuit or quantum kernel / feature map) that models the Tolles-Lawson residual to predict the compensated stinger signal from one cabin magnetometer plus fluxgate and current features, runnable on the IonQ simulator via Qollab without errors
- [ ] Windowed-correlation (TERCOM-style) map matching of the cleaned trace against the Eastern_395 / Renfrew_395 tile, seeded by the simulated INS-drift prior and never navigating through the map's k-NN-filled (invalid) cells
- [ ] Metrics comparing raw vs classical-cleaned vs quantum-cleaned: signal error and resulting position error
- [ ] In-page Python (Pyodide) exposes the pipeline to the frontend: run a held-out line or segment and fetch metrics
- [ ] Live mode computes a held-out line or segment in-page and animates it, with a precomputed-run fallback that replays identical visuals if the live path fails
- [ ] Frontend map view: real anomaly heatmap tile, true path vs estimated path, drone icon, "GPS jammed" state, error readout
- [ ] Frontend denoising panel: raw vs classical vs quantum signal side by side with error numbers
- [ ] One result captured from the real 24-qubit hardware run (even a single circuit/eval) shown in the demo and write-up
- [ ] UI follows accessibility best practices (keyboard navigation, contrast, labels, reduced-motion respect)
- [ ] Published and runnable on Qollab.xyz under MIT license with the attribution line "This effort is supported by Qollab & IonQ."
- [ ] README carries the USAF data citation, the MagNav Challenge paper BibTeX (Gnadt et al., arXiv:2007.12158), MagNav.jl map attribution, and a real-data provenance statement (only cropped excerpts are redistributed)
- [ ] Project page / README covering what it does, the problem, how to run it, how to replicate or extend it, and a written summary per judging criterion (novelty, technical execution, impact, documentation)
- [ ] Disclosure of AI tools, libraries, and any templates used
- [ ] Short demo video and public code repository link

### Out of Scope

- Collecting our own magnetometer or phone sensor data — no quantum magnetometer available; the public SGL 2020 dataset provides real polluted and clean magnetometer channels instead
- EMAG2v3 as the navigation map — 2 arc-min at 4 km altitude is too coarse for 400 m flight; used at most as a coarse-map comparison
- Synthetic map generator, synthetic noise model with adjustable terms, seeded flights, map-roughness-vs-noise sweep — replaced by real data on 2026-10-10
- Shipping raw SGL HDF5 files or reading HDF5 on Qollab — files are 63–123 MB (over the 2 MB per-file cap) and the data-sharing agreement limits redistribution; only cropped `.npz` excerpts ship
- Navigating through k-NN-filled map regions — not real data
- Simulating the quantum sensor physics (NV-center / spin dynamics) on the QPU — different project; the QPU is used for the ML denoising step, not sensor modeling
- Live QPU hardware calls during the judged demo — queue times and noise make it fragile; simulator for the demo, hardware once for a captured result
- Production flight-controller integration, real drone control, or multi-drone scenarios — beyond hackathon scope
- Authentication, user accounts, persistence — a single-user demo needs none

## Context

- **Inspiration:** SandboxAQ's AQNav uses quantum magnetometers (the sensor is the quantum part) plus classical AI to strip aircraft self-noise and match readings to known crustal magnetic anomaly maps, giving navigation that cannot be jammed or spoofed like GPS. This project keeps the problem but moves the "quantum" into the compute step: a Qiskit circuit performs the denoising/feature extraction. The write-up must state this difference honestly; it is also the novelty hook ("quantum subroutine applied to a navigation-denoising domain").
- **Physics correction captured during questioning:** the field being matched is Earth's magnetic field (crustal anomalies), not gravitational.
- **Data (decided 2026-10-10):** DAF-MIT AIA / SGL 2020 flight data (Zenodo DOI 10.5281/zenodo.12723700; 10 Hz HDF5; public domain under 17 U.S.C. 105 with a non-profit research/education data-sharing agreement). Calibration line Flt1006 1006.08 (tt 55770–56609); held-out lines Flt1003 1003.02 (tt 50713–54497, ~63 min, Eastern Ontario) and Flt1007 1007.06 (tt 57770–63010, Renfrew), all at 400 m. Maps: MagNav.jl `ottawa_area_maps` Eastern_395.h5 / Renfrew_395.h5 (395 m HAE, nT, with validity mask). Raw files live in gitignored `data_raw/`.
- **Hackathon:** Qollab × IonQ Hackathon, 48-hour build window Oct 9 7:00 PM ET to Oct 11 7:00 PM ET (4:00 PM PDT both days). Local judging week of Oct 12, global judging week of Oct 19. Mentor office hours Oct 10–11 in Slack. Partial projects are still eligible.
- **Target theme:** Quantum Impact — "solve a real world problem with a hybrid quantum and classical approach. Build a strong classical baseline, then show where a quantum subroutine improves solution quality, efficiency, or accuracy." A classical baseline is therefore mandatory, not optional.
- **Judging criteria (same four for local and global rounds):** Novelty and Creativity (original idea/approach, not a standard tutorial), Technical Execution (correct, well-built code that runs and does what it claims), Impact Potential (could matter beyond the hackathon), Documentation Quality (others can understand, run, replicate, extend). Every submission must show at least one of: novel application of an existing technique to a new domain, a technical extension (noise/error mitigation, optimization, benchmarking), or an original analytical/educational contribution; missing this can score 0 on Novelty and Technical Execution.
- **Submission checklist (from Participant Plan):** built with Qiskit; runs without errors on the Qollab-provided IonQ simulator; published and runnable on Qollab.xyz under MIT; project page explaining what/why/how-to-run/how-to-extend; built during the build window only; UI accessibility best practices; written summary covering each judging criterion; attribution line; disclosure of external libraries/templates/outside code and AI tools; theme tag; short demo video (production quality not scored); code repository link. Test the published project from a logged-out browser before the deadline.
- **Simulator access:** the qollab.xyz account is the IonQ simulator access; no separate IonQ account or API key. Tip from organizers: test locally (Qiskit Aer) to stay off the shared simulator queue while debugging.
- **Specialty awards:** Most Novel/Creative, Best of each theme, Most Impact, Best Documentation. A strong README and honest metrics target Best Documentation and the Quantum Impact theme award.
- **Team and time:** solo builder, ~40 usable hours at project start (Oct 9 ~11 PM PDT). Parallel work is not possible; phases must be sequential and ruthlessly scoped.

## Constraints

- **Tech stack**: Frontend JavaScript (React + Vite); backend Python; all quantum code through Qiskit — hackathon rule plus user preference
- **Quantum runtime**: IonQ simulator via Qollab for the submitted run; Qiskit Aer locally for development; real 24-qubit device at most once for a captured result — fragility and queue times
- **Timeline**: Submission deadline Oct 11, 2026 7:00 PM ET (4:00 PM PDT); ~40 hours solo — scope must be a vertical slice that demos end-to-end early, then deepens
- **Licensing**: MIT license, attribution line, and disclosure of all AI tools and libraries — hackathon rules, disqualification risk otherwise
- **Originality**: all code written during the build window; no prior work reused — hackathon rule
- **Accessibility**: UI must follow accessibility best practices — explicit submission requirement
- **Demo reliability**: live simulation must have a precomputed fallback so the judged demo never depends on a live compute path

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid architecture: Qiskit circuit for denoising/feature step, classical Python for map matching and position estimate | Matches the Quantum Impact theme (classical baseline + quantum subroutine); keeps the QPU doing a bounded, explainable job | — Pending |
| Fully synthetic data end-to-end | No quantum magnetometer exists in the hackathon; synthetic data is deterministic, fast, and fits 40 hours | Superseded 2026-10-10 by real SGL data |
| Mandatory classical baseline (Tolles-Lawson fit on 1006.08 + equal-feature kernel ridge) | Required by the Quantum Impact theme text; also makes quantum results credible to judges | — Pending |
| Demo shows both the map tracking view and the before/after denoising panel | User choice; the map view sells impact, the panel sells the quantum contribution | — Pending |
| Live simulation with precomputed fallback | User choice; impressive when live, safe when not | — Pending |
| Simulator for development and demo, real hardware once | Hardware queue and noise are risks; one captured hardware result is enough for the write-up | — Pending |
| React + Vite frontend, Python backend | User preference; fast setup, strong charting ecosystem | — Pending |
| Honest framing: SandboxAQ's quantum part is the sensor, ours is the compute | Avoids misrepresentation; the shift itself is the novelty argument | — Pending |
| Real flight data: DAF-MIT AIA / SGL 2020 (Zenodo 10.5281/zenodo.12723700); stinger Mag 1 as truth, cabin Mags 3/4/5 as polluted sensors, fluxgates and `cur_*` as nuisance features | Real platform noise and a real clean reference are more credible to judges than a synthetic noise model, and they match the MagNav Challenge setup | — Pending (2026-10-10) |
| Calibration 1006.08; held-out evaluation 1003.02 and 1007.06 | TL calibration manoeuvres on one line, free-fly evaluation on disjoint lines and two map areas | — Pending (2026-10-10) |
| INS drift simulated by integrating `ins_vn`/`ins_vw` with bias and random walk | The recorded INS is GPS-aided and does not drift, so the GPS-jam story needs a simulated drift | — Pending (2026-10-10) |
| Navigation map: MagNav.jl Eastern_395 / Renfrew_395, validity mask enforced; EMAG2v3 comparison only | Map altitude matches the 400 m flights; k-NN-filled cells are not real data | — Pending (2026-10-10) |
| Local-only preprocessing (h5py) to cropped `data/*.npz` under 2 MB with a provenance sidecar; reproducibility = same inputs + same script = identical outputs | Qollab's 2 MB per-file cap and literal-path loading; raw files stay in gitignored `data_raw/` | — Pending (2026-10-10) |
| Windowed-correlation (TERCOM-style) navigation is the default; particle filter is an optional stretch | Simpler, faster in Pyodide, standard for 1D anomaly-profile matching | — Pending (2026-10-10) |
| Phase 5 evidence: multi-segment mean ± std on held-out lines, training-size sweep, cabin-sensor sweep (Mag 3 vs 4 vs 5); map-roughness sweep dropped | Seeds no longer exist; segments and sensors are the real-data sources of variance | — Pending (2026-10-10) |
| README cites USAF cooperative agreement FA8750-19-2-1000, Gnadt et al. arXiv:2007.12158, MagNav.jl maps; real-data provenance statement replaces the synthetic-data statement | Dataset license and data-sharing agreement require attribution | — Pending (2026-10-10) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-10 after switching to real SGL flight data and Ottawa maps*

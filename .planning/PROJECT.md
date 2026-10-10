# Magnetic Field Detector (Quantum MagNav)

## What This Is

A hackathon demo of GPS-denied drone navigation by magnetic anomaly matching (MagNav), modeled on what SandboxAQ's AQNav does. A simulated drone flies over a synthetic map of Earth's crustal magnetic anomalies while its own electronics pollute the magnetometer signal; a hybrid pipeline strips that noise with a Qiskit quantum circuit and then matches the cleaned signal against the map classically to recover position without GPS. Built solo in ~40 hours for the Qollab × IonQ Hackathon (Oct 9–11, 2026), with a React + Vite frontend and a Python backend.

## Core Value

Judges see a drone icon on a map hold its position without GPS because magnetic noise was removed, and see the quantum-assisted denoiser beat (or honestly match) a classical baseline on the same data.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Synthetic magnetic anomaly map generated in Python (smooth, spatially-correlated field with realistic magnitude scale, in nanotesla)
- [ ] Simulated drone flight over the map producing a clean "true" magnetometer trace plus a true position track
- [ ] Injected drone-electronics noise (motor/ESC periodic interference, current-dependent offsets, random noise) producing the raw sensor trace
- [ ] Classical denoising baseline (e.g. Kalman / Tolles-Lawson-style regression / small classical model) that cleans the raw trace
- [ ] Quantum denoising subroutine built with Qiskit (variational circuit or quantum kernel / feature map) that cleans the raw trace, runnable on the IonQ simulator via Qollab without errors
- [ ] Classical map-matching navigation that converts a cleaned trace into an estimated position track
- [ ] Metrics comparing raw vs classical-cleaned vs quantum-cleaned: signal error and resulting position error
- [ ] Python backend exposes the pipeline to the frontend (run a flight, step/stream it, fetch metrics)
- [ ] Live simulation mode streams the flight to the frontend, with a precomputed-run fallback that replays identical visuals if the live path fails
- [ ] Frontend map view: true path vs estimated path, drone icon, "GPS jammed" state, error readout
- [ ] Frontend denoising panel: raw vs classical vs quantum signal side by side with error numbers
- [ ] One result captured from the real 24-qubit hardware run (even a single circuit/eval) shown in the demo and write-up
- [ ] UI follows accessibility best practices (keyboard navigation, contrast, labels, reduced-motion respect)
- [ ] Published and runnable on Qollab.xyz under MIT license with the attribution line "This effort is supported by Qollab & IonQ."
- [ ] Project page / README covering what it does, the problem, how to run it, how to replicate or extend it, and a written summary per judging criterion (novelty, technical execution, impact, documentation)
- [ ] Disclosure of AI tools, libraries, and any templates used
- [ ] Short demo video and public code repository link

### Out of Scope

- Real magnetometer hardware or phone sensor data — no quantum magnetometer available; synthetic data keeps the 40-hour scope achievable and the demo deterministic
- Public crustal anomaly datasets (e.g. NOAA EMAG2) — nice-to-have realism, but data wrangling eats hours; synthetic map first, real data only if time remains
- Simulating the quantum sensor physics (NV-center / spin dynamics) on the QPU — different project; the QPU is used for the ML denoising step, not sensor modeling
- Live QPU hardware calls during the judged demo — queue times and noise make it fragile; simulator for the demo, hardware once for a captured result
- Production flight-controller integration, real drone control, or multi-drone scenarios — beyond hackathon scope
- Authentication, user accounts, persistence — a single-user demo needs none

## Context

- **Inspiration:** SandboxAQ's AQNav uses quantum magnetometers (the sensor is the quantum part) plus classical AI to strip aircraft self-noise and match readings to known crustal magnetic anomaly maps, giving navigation that cannot be jammed or spoofed like GPS. This project keeps the problem but moves the "quantum" into the compute step: a Qiskit circuit performs the denoising/feature extraction. The write-up must state this difference honestly; it is also the novelty hook ("quantum subroutine applied to a navigation-denoising domain").
- **Physics correction captured during questioning:** the field being matched is Earth's magnetic field (crustal anomalies), not gravitational.
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
| Fully synthetic data end-to-end | No quantum magnetometer exists in the hackathon; synthetic data is deterministic, fast, and fits 40 hours | — Pending |
| Mandatory classical baseline (Kalman / regression / small classical model) | Required by the Quantum Impact theme text; also makes quantum results credible to judges | — Pending |
| Demo shows both the map tracking view and the before/after denoising panel | User choice; the map view sells impact, the panel sells the quantum contribution | — Pending |
| Live simulation with precomputed fallback | User choice; impressive when live, safe when not | — Pending |
| Simulator for development and demo, real hardware once | Hardware queue and noise are risks; one captured hardware result is enough for the write-up | — Pending |
| React + Vite frontend, Python backend | User preference; fast setup, strong charting ecosystem | — Pending |
| Honest framing: SandboxAQ's quantum part is the sensor, ours is the compute | Avoids misrepresentation; the shift itself is the novelty argument | — Pending |

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
*Last updated: 2026-10-09 after initialization*

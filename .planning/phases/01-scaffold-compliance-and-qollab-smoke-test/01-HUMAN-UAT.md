---
status: partial
phase: 01-scaffold-compliance-and-qollab-smoke-test
source: [01-VERIFICATION.md]
started: 2026-10-10T08:22:10Z
updated: 2026-10-10T08:22:10Z
---

## Current Test

[awaiting human testing — deferred by builder on 2026-10-10; continue to Phase 2]

## Tests

### 1. Logged-out (incognito) Run test
expected: https://qollab.xyz/u/eehhaa/quantum-magnav opens in a Chrome incognito window; Run on the built-in simulator shows backend info and a Bell job result; Run on IonQ Forte 1 (Remote simulator) either works or shows "Can't run quantum jobs as an anonymous user" (record which).
result: [pending]

### 2. Hardware credits question in #hackathon-help
expected: Organizer answer on whether participants receive credits for one IonQ Forte 1 hardware run (~500 shots, one small circuit) and its approximate cost; balance currently 100 credits. Also report that multi-circuit IonQ jobs return HTTP 400 despite the docs.
result: [pending]

### 3. Quantum Impact theme tag mechanism
expected: Confirmation of how the theme tag is applied (Qollab's curated tag list has no "Quantum Impact" entry; README states the theme).
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

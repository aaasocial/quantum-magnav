"""Qollab Python-project fallback and local one-command pipeline runner.

Runs the classical MagNav pipeline on the real SGL 2020 excerpts: fit denoisers on the
calibration line 1006.08, jam GPS 25% into the held-out lines 1003.02 and 1007.06, then
navigate magnetic-only with TERCOM on the Ottawa map tiles, print the metrics table and
write the RunArtifact v1 (data/precomputed_run.json) that the Phase 3 player replays.

On Qollab (Pyodide, sys.platform == "emscripten") nothing is recomputed: the committed
artifact is replayed, so the judged run never depends on minutes of in-browser compute.
On Qollab the platform injects a pre-created `backend` global; locally we fall back to
Qiskit's BasicSimulator (kept for the quantum denoiser slot). Deliberately no main()
function: Qollab auto-calls one.
"""

import sys

from magnav.artifact import (
    ARTIFACT_PATH,
    build_run_artifact,
    load_artifact,
    validate_artifact,
    write_run_artifact,
)
from magnav.data import load_provenance
from magnav.metrics import format_metrics_table

if sys.platform == "emscripten":
    art = load_artifact()
    print("Quantum MagNav - classical pipeline on SGL 2020 (precomputed replay of " + ARTIFACT_PATH + ")")
    print()
    print(format_metrics_table(art["metrics_table"]))
else:
    if "backend" not in globals():  # local only; on Qollab `backend` is injected
        from qiskit.providers.basic_provider import BasicSimulator

        backend = BasicSimulator()

    from magnav.pipeline import run_pipeline

    result = run_pipeline(backend=backend)
    cfg = result["config"]
    print("Quantum MagNav - classical pipeline on SGL 2020 (calibration line 1006.08)")
    print(
        f"seed={cfg['seed']}  INS bias={cfg['dr']['bias_mps']} m/s  random walk={cfg['dr']['rw_sigma']} m/s/sqrt(s)  "
        f"TERCOM gate={cfg['tercom']['gate']}"
    )
    for mag_key, tl in cfg["tl"].items():
        sel = tl["selection"]
        print(
            f"D-19 {mag_key}: fluxgate={tl['fluxgate']} lambda={tl['lambda']:g} "
            f"CV RMSE={sel['cv_rmse_nT']:.1f} nT ({sel['n_blocks']}-block CV on {tl['cal_line']} only); "
            f"tl_currents lambda={tl['tl_currents']['lambda']:g}"
        )
    for line_id, info in result["lines"].items():
        print(f"Line {line_id}: GPS jammed at t={info['jam_t']:.1f} s (index {info['jam_idx']}) of {info['n']} samples")
    print()
    print(format_metrics_table(result["metrics_table"]))
    print()

    artifact = build_run_artifact(result, load_provenance())
    errors = validate_artifact(artifact)
    if errors:
        raise SystemExit("RunArtifact invalid:\n  " + "\n  ".join(errors))
    nbytes = write_run_artifact(artifact)
    print(f"Wrote {ARTIFACT_PATH} ({nbytes} bytes, valid)")

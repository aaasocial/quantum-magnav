"""Qollab Python-project fallback and local one-command pipeline runner.

Runs the classical MagNav pipeline on the real SGL 2020 excerpts: fit denoisers on the
calibration line 1006.08, jam GPS 25% into the held-out lines 1003.02 and 1007.06, then
navigate magnetic-only with TERCOM on the Ottawa map tiles and print the metrics table.

On Qollab the platform injects a pre-created `backend` global; locally we fall back to
Qiskit's BasicSimulator (kept for the quantum denoiser slot). Deliberately no main()
function: Qollab auto-calls one.
"""

if "backend" not in globals():  # local only; on Qollab `backend` is injected
    from qiskit.providers.basic_provider import BasicSimulator

    backend = BasicSimulator()

from magnav.metrics import format_metrics_table
from magnav.pipeline import run_pipeline

result = run_pipeline()
cfg = result["config"]
print("Quantum MagNav - classical pipeline on SGL 2020 (calibration line 1006.08)")
print(
    f"seed={cfg['seed']}  INS bias={cfg['dr']['bias_mps']} m/s  random walk={cfg['dr']['rw_sigma']} m/s/sqrt(s)  "
    f"TERCOM gate={cfg['tercom']['gate']}"
)
for line_id, info in result["lines"].items():
    print(f"Line {line_id}: GPS jammed at t={info['jam_t']:.1f} s (index {info['jam_idx']}) of {info['n']} samples")
print()
print(format_metrics_table(result["metrics_table"]))

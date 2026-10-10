"""Qollab Python-project fallback and local end-to-end runner.

On Qollab the platform injects a pre-created `backend` global; locally we fall back
to Qiskit's BasicSimulator. Deliberately no main() function: Qollab auto-calls one.
"""

if "backend" not in globals():  # local only; on Qollab `backend` is injected
    from qiskit.providers.basic_provider import BasicSimulator

    backend = BasicSimulator()

import sys

from magnav.api import backend_info, run_bell_batch

# 1 circuit by default: Qollab's IonQ proxy accepts only single-circuit jobs, and
# IonQ allows one job per run. Locally: `uv run python main.py 32` for a batch.
n_circuits = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 1

print(backend_info(backend))
print(run_bell_batch(backend, n_circuits, 200))

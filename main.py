"""Qollab Python-project fallback and local end-to-end runner.

On Qollab the platform injects a pre-created `backend` global; locally we fall back
to Qiskit's BasicSimulator. Deliberately no main() function: Qollab auto-calls one.
"""

if "backend" not in globals():  # local only; on Qollab `backend` is injected
    from qiskit.providers.basic_provider import BasicSimulator

    backend = BasicSimulator()

from magnav.api import backend_info, run_bell_batch

print(backend_info(backend))
print(run_bell_batch(backend, 2, 200))  # edit N here for a Python-project probe (one job per run)

"""Quantum denoiser slot (stub with the final Phase 4 interface).

The slot is a residual model with the same protocol as `classical.KRRResidual`:
    fit(features, residual) -> self      # features = classical.kernel_features(sensors)
    predict(features) -> np.ndarray      # residual correction in nT
so `ResidualCorrected(TLDenoiser(...), QuantumDenoiser(backend), "quantum")` is a drop-in
denoiser. The stub predicts zeros, so the slot's cleaned output equals TL unchanged.

The backend is always injected (on Qollab the platform's pre-created `backend` global);
this module never constructs a backend, provider or simulator, and the stub never submits
a job.
"""

import json

import numpy as np


def _backend_name(backend):
    try:
        name = getattr(backend, "name", None)
    except Exception:  # noqa: BLE001
        return None
    return None if name is None else str(name)


class QuantumDenoiser:
    """Quantum residual model slot. Status "stub": zero correction, no job submitted."""

    name = "quantum"
    status = "stub"

    def __init__(self, backend=None):
        self.backend = backend
        self.n_features = None

    def fit(self, features, residual):
        """Phase 4: classical readout training on the quantum feature map (statevector locally)."""
        f = np.asarray(features, dtype=np.float64)
        self.n_features = int(f.shape[1]) if f.ndim == 2 else None
        return self

    def predict(self, features) -> np.ndarray:
        """Residual correction in nT; the stub returns zeros."""
        return np.zeros(len(features))

    @property
    def provenance(self) -> dict:
        return {
            "source": "stub",
            "backend": _backend_name(self.backend),
            "n_features": self.n_features,
            "circuit": None,
        }

    def run_inference(self, features) -> str:
        """Return a JSON string describing the inference run.

        Phase 4 builds exactly one circuit here and submits it in exactly one backend.run
        call (the Qollab platform allows one single-circuit job per Run). The stub submits
        nothing and reports status "stub".
        """
        return json.dumps(
            {
                "ok": False,
                "status": self.status,
                "backend": _backend_name(self.backend),
                "n_windows": len(features),
                "n_features": self.n_features,
            },
            allow_nan=False,
        )

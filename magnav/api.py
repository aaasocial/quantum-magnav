"""JS-facing API. Every function takes the injected backend and returns a JSON string."""

import json
import sys
import time

from qiskit import QuantumCircuit, transpile
from qiskit import __version__ as QISKIT_VERSION

SMOKE_DATA = "data/smoke.json"  # literal path: Qollab preloads only literal paths
ALLOWED_CIRCUITS = (1, 2, 32, 64, 128)
ALLOWED_SHOTS = (100, 200, 500, 1024, 4096)
IONQ_SINGLE_CIRCUIT_ERROR = (
    "Qollab's IonQ proxy accepts only single-circuit jobs (job type ionq.circuit.v1); "
    "use n_circuits=1. Nothing was submitted, so this run's one IonQ job is still available."
)


def _bell(i: int) -> QuantumCircuit:
    """Even i -> Phi+ (00/11); odd i -> Psi+ (01/10), so result ordering is checkable."""
    qc = QuantumCircuit(2, 2, name=f"bell_{i}")
    qc.h(0)
    qc.cx(0, 1)
    if i % 2:
        qc.x(1)
    qc.measure([0, 1], [0, 1])
    return qc


def _is_ionq(backend) -> bool:
    """IonQ detection by provider module first, backend name as a fallback."""
    module = getattr(type(backend), "__module__", "") or ""
    name = getattr(backend, "name", None)
    return module.startswith("qiskit_ionq") or str(name or "").lower().startswith("ionq")


def _module_version(name: str) -> str:
    try:
        return str(__import__(name).__version__)
    except Exception as e:  # noqa: BLE001 - report, don't crash
        return f"unavailable: {type(e).__name__}"


def backend_info(backend) -> str:
    """Describe the backend and runtime. Never submits a job."""
    name = getattr(backend, "name", None)
    noise = getattr(getattr(backend, "options", None), "noise_model", None)
    info = {
        "name": name,
        "class": type(backend).__name__,
        "num_qubits": getattr(backend, "num_qubits", None),
        "noise_model": None if noise is None else str(noise),
        "is_ionq": _is_ionq(backend),
        "python": sys.version,
        "platform": sys.platform,
        "qiskit": QISKIT_VERSION,
    }
    for mod in ("numpy", "scipy", "sklearn", "qiskit_ionq"):
        info[mod] = _module_version(mod)
    try:
        with open(SMOKE_DATA, encoding="utf-8") as f:
            info["data_file"] = json.load(f)
    except Exception as e:  # noqa: BLE001 - report, don't crash
        info["data_file"] = f"error: {type(e).__name__}: {e}"
    return json.dumps(info)


def _safe_value(value):
    """JSON-safe echo of a caller input: plain ints pass through, anything else is repr()'d."""
    if type(value) is int:
        return value
    try:
        return repr(value)[:50]
    except Exception:  # noqa: BLE001 - a hostile __repr__ must not break the contract
        return f"<unrepresentable {type(value).__name__}>"


def _backend_name(backend):
    try:
        name = getattr(backend, "name", None)
    except Exception:  # noqa: BLE001
        return None
    return None if name is None else str(name)


def _failure(backend, n, s, error_type: str, error: str) -> str:
    """Failure JSON. Never raises, whatever the inputs are."""
    return json.dumps(
        {
            "ok": False,
            "backend": _backend_name(backend),
            "n_circuits": _safe_value(n),
            "shots": _safe_value(s),
            "error_type": str(error_type),
            "error": str(error)[:2000],
        }
    )


def _as_int(value) -> int:
    """Strict int coercion: rejects bools and non-integral floats instead of truncating."""
    if isinstance(value, bool):
        raise TypeError(f"expected an integer, got bool {value!r}")
    if isinstance(value, float) and not value.is_integer():
        raise ValueError(f"expected an integer, got non-integral float {value!r}")
    return int(value)


def run_bell_batch(backend, n_circuits=2, shots=200) -> str:
    """Submit ONE batched job of n_circuits Bell circuits and return per-circuit counts."""
    try:
        n, s = _as_int(n_circuits), _as_int(shots)
    except Exception as e:  # noqa: BLE001 - TypeError/ValueError/OverflowError or a JsProxy oddity
        return _failure(backend, n_circuits, shots, "ValueError", f"{type(e).__name__}: {e}")
    if n not in ALLOWED_CIRCUITS or s not in ALLOWED_SHOTS:
        return _failure(
            backend,
            n,
            s,
            "ValueError",
            f"n_circuits must be one of {ALLOWED_CIRCUITS} and shots one of {ALLOWED_SHOTS}",
        )
    if n != 1 and _is_ionq(backend):
        # Reject BEFORE submitting: a failed multi-circuit job would still use up
        # the run's single IonQ job (docs/QOLLAB_FINDINGS.md).
        return _failure(backend, n, s, "ValueError", IONQ_SINGLE_CIRCUIT_ERROR)
    circuits = [_bell(i) for i in range(n)]
    try:
        tqc = transpile(circuits, backend, optimization_level=1)  # 0-1 for IonQ
        # A bare circuit submits as job type ionq.circuit.v1; a list submits as
        # ionq.multi-circuit.v1 (qiskit-ionq helpers.py). Qollab's IonQ proxy rejects
        # multi-circuit jobs with HTTP 400 (observed 2026-10-10), so IonQ is n=1 only.
        payload = tqc[0] if n == 1 else tqc
        t0 = time.time()
        job = backend.run(payload, shots=s)  # EXACTLY ONE job per call (IonQ one-job rule)
        result = job.result()
        counts = [dict(result.get_counts(i)) for i in range(n)]  # never the bare form
        ordering_ok = all(
            max(c, key=c.get) in (("00", "11") if i % 2 == 0 else ("01", "10"))
            for i, c in enumerate(counts)
        )
        return json.dumps(
            {
                "ok": True,
                "backend": getattr(backend, "name", None),
                "n_circuits": n,
                "shots": s,
                "submit_to_result_s": round(time.time() - t0, 2),
                "ordering_ok": ordering_ok,
                "counts": counts,
            }
        )
    except Exception as e:  # noqa: BLE001 - surface IonQ CamelCase error names to the page
        return _failure(backend, n, s, type(e).__name__, str(e))

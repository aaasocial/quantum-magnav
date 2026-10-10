"""Re-running scripts/preprocess_sgl.py gives byte-identical data files (local only)."""

import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = (
    "flt1006_line08.npz",
    "flt1003_line02.npz",
    "flt1007_line06.npz",
    "map_eastern_395.npz",
    "map_renfrew_395.npz",
    "provenance.json",
)


@pytest.mark.skipif(
    not (ROOT / "data_raw" / "Flt1003_train.h5").exists() or shutil.which("uv") is None,
    reason="raw SGL data (data_raw/) or uv not available",
)
def test_preprocess_repro(tmp_path):
    out = tmp_path / "data"
    subprocess.run(
        ["uv", "run", "--with", "h5py", "python", "-I", "scripts/preprocess_sgl.py", "--out", str(out)],
        cwd=ROOT,
        check=True,
        timeout=600,
        capture_output=True,
    )
    for name in OUTPUTS:
        assert (out / name).read_bytes() == (ROOT / "data" / name).read_bytes(), name

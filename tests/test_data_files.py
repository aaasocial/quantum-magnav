"""Shipped data files: size limits, npz layout, provenance hashes, literal paths."""

import hashlib
import json
import re
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MAX_FILE_BYTES = 2 * 1024 * 1024  # Qollab per-file cap; package_qollab.sh checks strict <

LINE_FILES = {
    "flt1006_line08.npz": (1006.08, 1678),
    "flt1003_line02.npz": (1003.02, 7568),
    "flt1007_line06.npz": (1007.06, 10480),
}
MAP_FILES = ("map_eastern_395.npz", "map_renfrew_395.npz")
CUR = [
    "cur_ac_hi", "cur_ac_lo", "cur_acpwr", "cur_bat_1", "cur_bat_2", "cur_com_1", "cur_flap",
    "cur_heat", "cur_outpwr", "cur_srvo_i", "cur_srvo_m", "cur_srvo_o", "cur_strb", "cur_tank",
]  # fmt: skip
FLUX = [f"flux_{c}_{a}" for c in "abcd" for a in "xyzt"]
F64_KEYS = ["tt", "lat", "lon", "utm_x", "utm_y"]
F32_KEYS = (
    ["igrf", "ins_yaw", "mag_1_c", "mag_1_igrf", "diurnal", "mag_3_uc", "mag_4_uc", "mag_5_uc"]
    + FLUX
    + CUR
    + ["ins_pitch", "ins_roll", "ins_vn", "ins_vw", "ins_vu", "utm_z"]
)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _provenance() -> dict:
    return json.loads((DATA / "provenance.json").read_text(encoding="utf-8"))


def test_every_data_file_under_2mb():
    files = [p for p in DATA.rglob("*") if p.is_file()]
    assert files
    for p in files:
        assert p.stat().st_size < MAX_FILE_BYTES, f"{p} is {p.stat().st_size} bytes"
        assert p.suffix.lower() not in (".h5", ".hdf5"), f"raw HDF5 must never ship: {p}"


@pytest.mark.parametrize("name", sorted(LINE_FILES))
def test_line_npz_keys(name):
    line_id, n = LINE_FILES[name]
    with np.load(DATA / name, allow_pickle=False) as z:
        keys = set(z.files)
        assert keys == set(F64_KEYS) | set(F32_KEYS) | {"line"}
        for k in F64_KEYS:
            assert z[k].dtype == np.float64, k
            assert z[k].shape == (n,), k
        for k in F32_KEYS:
            assert z[k].dtype == np.float32, k
            assert z[k].shape == (n,), k
            assert np.all(np.isfinite(z[k])), k
        assert z["line"].shape == () and z["line"].dtype == np.float64
        assert float(z["line"]) == line_id
        assert np.allclose(np.diff(z["tt"]), 0.5, atol=1e-6, rtol=0)


@pytest.mark.parametrize("name", MAP_FILES)
def test_map_npz_shape(name):
    prov = _provenance()["files"][f"data/{name}"]
    with np.load(DATA / name, allow_pickle=False) as z:
        M, mask, xx, yy = z["map"], z["mask"], z["xx"], z["yy"]
        assert M.dtype == np.float32
        assert mask.dtype == np.bool_
        assert M.shape == (len(yy), len(xx)) == mask.shape
        assert np.all(np.diff(xx) > 0) and np.all(np.diff(yy) > 0)
        assert list(M.shape) == prov["shape"]
        assert float(z["alt"]) == 395.0
    assert all(v == 1.0 for v in prov["track_valid_fraction"].values())


def test_provenance_sha():
    prov = _provenance()
    assert prov["schema_version"] == 1
    assert "FA8750-19-2-1000" in prov["dataset"] and "2007.12158" in prov["dataset"]
    expected = {f"data/{n}" for n in LINE_FILES} | {f"data/{n}" for n in MAP_FILES}
    assert set(prov["files"]) == expected
    for rel, entry in prov["files"].items():
        assert entry["output_sha256"] == _sha256(ROOT / rel), rel
        assert len(entry["source_sha256"]) == 64
        assert entry["source_file"]
    for name, (line_id, n) in LINE_FILES.items():
        entry = prov["files"][f"data/{name}"]
        assert entry["line"] == f"{line_id:.2f}"
        assert entry["n_2hz"] == n
        assert entry["n_10hz"] in (8391, 37841, 52401)
        lo, hi = entry["tt_range"]
        assert hi - lo == pytest.approx((n - 1) * 0.5, abs=1e-6)
        assert entry["decimation"]["factor"] == 5
        assert entry["decimation"]["method"] == "block_mean"
        assert entry["decimation"]["yaw"] == "circular_mean"
        assert "mag_4_uc" in entry["channels"] and "igrf" in entry["channels"]


def _package_data_files() -> list[str]:
    text = (ROOT / "scripts" / "package_qollab.sh").read_text(encoding="utf-8")
    m = re.search(r"^DATA_FILES=\(([^)]*)\)", text, re.MULTILINE)
    assert m, "DATA_FILES=(...) not found in package_qollab.sh"
    return m.group(1).split()


def test_literal_paths():
    """Qollab preloads a data file only if its path is a literal string in the Python code."""
    sources = "\n".join(p.read_text(encoding="utf-8") for p in (ROOT / "magnav").glob("*.py"))
    entries = _package_data_files()
    assert "data/provenance.json" in entries
    for entry in entries:
        assert f'"{entry}"' in sources, f"{entry} is not a quoted literal in magnav/*.py"
        assert (ROOT / entry).is_file(), entry

"""D-17 acceptance checks: logic on hand-built tables, the committed artifact, figure sizes."""

from pathlib import Path

from magnav.artifact import load_artifact
from magnav.figures import FIGURES
from magnav.metrics import acceptance_checks

ROOT = Path(__file__).resolve().parents[1]
NAMES = [
    "mag5_tl_hold_1003.02",
    "mag5_tl_hold_1007.06",
    "mag4_tl_beats_dr_1003.02",
    "dr_drifts_1003.02",
    "dr_drifts_1007.06",
    "mag4_raw_drifts_1003.02",
    "mag4_raw_drifts_abs_1007.06",
]


def _row(line, sensor, den, mean, pct=50.0):
    return {"line": line, "sensor": sensor, "denoiser": den, "mean_err_m": mean, "pct_under_556": pct}


def _table(m5_pct=(95.0, 92.0), m4tl=150.0, dr=(1000.0, 1100.0), m4raw=(2000.0, 6000.0)):
    return [
        _row("1003.02", "-", "dead_reckoning", dr[0]),
        _row("1007.06", "-", "dead_reckoning", dr[1]),
        _row("1003.02", "mag_5_uc", "tl", 100.0, m5_pct[0]),
        _row("1007.06", "mag_5_uc", "tl", 100.0, m5_pct[1]),
        _row("1003.02", "mag_4_uc", "tl", m4tl),
        _row("1003.02", "mag_4_uc", "raw", m4raw[0]),
        _row("1007.06", "mag_4_uc", "raw", m4raw[1]),
    ]


def _passed(checks):
    return {c["name"]: c["passed"] for c in checks}


def test_acceptance_checks_logic():
    good = acceptance_checks(_table())
    assert [c["name"] for c in good] == NAMES
    assert all(_passed(good).values())
    for c in good:
        assert set(c) == {"name", "line", "passed", "value", "threshold", "rule"}

    bad = _passed(acceptance_checks(_table(m5_pct=(89.9, 90.0), m4tl=1200.0, dr=(500.0, 556.0), m4raw=(1100.0, 400.0))))
    assert bad == {
        "mag5_tl_hold_1003.02": False,
        "mag5_tl_hold_1007.06": True,  # >= 90 is inclusive
        "mag4_tl_beats_dr_1003.02": False,
        "dr_drifts_1003.02": False,
        "dr_drifts_1007.06": False,  # > 556 is strict
        "mag4_raw_drifts_1003.02": False,
        "mag4_raw_drifts_abs_1007.06": False,
    }


def test_acceptance_missing_rows():
    checks = acceptance_checks([r for r in _table() if r["line"] == "1003.02"])
    by = {c["name"]: c for c in checks}
    assert by["mag5_tl_hold_1007.06"]["passed"] is False
    assert by["mag5_tl_hold_1007.06"]["value"] is None
    assert by["mag5_tl_hold_1003.02"]["passed"] is True


def test_committed_acceptance():
    art = load_artifact()
    assert acceptance_checks(art["metrics_table"]) == art["acceptance"]
    failing = [c["name"] for c in art["acceptance"] if not c["passed"]]
    assert not failing, f"D-17 checks failing in data/precomputed_run.json: {failing}"


def test_results_figures_small():
    assert len(FIGURES) == 4
    for f in FIGURES:
        p = ROOT / f
        assert p.is_file(), f
        assert p.stat().st_size < 204_800, (f, p.stat().st_size)

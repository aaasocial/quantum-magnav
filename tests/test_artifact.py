"""RunArtifact v1: downsampling, strict JSON, series lengths, committed file."""

import json
from pathlib import Path

import numpy as np
import pytest

from magnav.artifact import (
    ARTIFACT_PATH,
    MAX_POINTS,
    build_run_artifact,
    downsample_idx,
    dumps_artifact,
    load_artifact,
    validate_artifact,
)
from magnav.data import MAP_EASTERN, MAP_RENFREW, load_provenance

ROOT = Path(__file__).resolve().parents[1]
DENOISERS = ["raw", "lowpass", "tl", "tl_currents", "krr", "quantum"]


def _no_constants(x):
    raise ValueError(f"non-strict JSON constant {x}")


def test_downsample_idx():
    idx = downsample_idx(10480, 2620)
    assert len(idx) <= MAX_POINTS + 2
    assert np.all(np.diff(idx) > 0)
    assert {0, 2620, 10479} <= set(idx.tolist())


def _check_series(obj):
    for L in obj["lines"]:
        n = len(L["t"])
        for k in ("x", "y", "anomaly_nT"):
            assert len(L["truth"][k]) == n
        for k in ("x", "y"):
            assert len(L["dead_reckoning"][k]) == n
        for dens in L["estimates"].values():
            for e in dens.values():
                for k in ("x", "y", "signal_nT"):
                    assert len(e[k]) == n
                assert len(e["window_t"]) == len(e["ncc"]) == len(e["accepted"])


@pytest.fixture(scope="module")
def thin_artifact():
    from magnav.pipeline import run_pipeline

    res = run_pipeline(sensors=("mag_5_uc", "mag_4_uc"), lines=("1003.02",), truncate=2000)
    return build_run_artifact(res, load_provenance())


def test_artifact_from_truncated_run(thin_artifact):
    assert validate_artifact(thin_artifact) == []
    json.loads(dumps_artifact(thin_artifact), parse_constant=_no_constants)
    _check_series(thin_artifact)


def test_dumps_deterministic(thin_artifact):
    a, b = dumps_artifact(thin_artifact), dumps_artifact(thin_artifact)
    assert a == b
    for key in ("timestamp", "created_at", "generated_at", "date"):
        assert f'"{key}"' not in a


def test_committed_artifact():
    path = ROOT / ARTIFACT_PATH
    assert path.is_file()
    assert path.stat().st_size < 2_097_152
    json.loads(path.read_text(encoding="utf-8"), parse_constant=_no_constants)
    obj = load_artifact()
    assert validate_artifact(obj) == []
    assert obj["schema_version"] == 1
    assert obj["sensors"] == ["mag_5_uc", "mag_4_uc"]
    assert obj["default_sensor"] == "mag_5_uc"
    assert obj["denoisers"] == DENOISERS
    assert [L["line"] for L in obj["lines"]] == ["1003.02", "1007.06"]
    assert {L["line"]: L["map_file"] for L in obj["lines"]} == {"1003.02": MAP_EASTERN, "1007.06": MAP_RENFREW}
    for L in obj["lines"]:
        assert len(L["t"]) <= 2000
        assert set(L["estimates"]) == set(obj["sensors"])
        for dens in L["estimates"].values():
            assert list(dens) == DENOISERS
    _check_series(obj)
    prov = obj["provenance"]
    assert prov["seed"] == 0
    assert prov["tercom"]["gate"] == 0.85
    assert prov["tercom"]["prior"] == "recursive_ins_propagated"
    for s in obj["sensors"]:
        assert prov["quantum"][s]["source"] == "stub"
        tl = prov["tl"][s]
        assert tl["fluxgate"] in ("flux_a", "flux_b", "flux_c", "flux_d")
        assert tl["cal_line"] == "1006.08"
        assert tl["selection"]["n_blocks"] == 5
        assert prov["krr"][s]["fluxgate"] == tl["fluxgate"]
        assert tl["tl_currents"]["fluxgate"] == tl["fluxgate"]
    assert len(obj["metrics_table"]) == 26

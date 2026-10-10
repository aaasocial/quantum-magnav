"""WR-05: bind the committed artifact to the current code and data.

Recomputes the cheap, deterministic parts of the run (D-19 selection, every denoiser's
signal error on both held-out lines, and the dead-reckoning track) from the shipped code
and data, and compares them with data/precomputed_run.json. A change to TL, KRR, the
current handling, the DR sign/seed or the jam/metric indices fails here without a full
main.py run. TERCOM itself (the slow part) is covered by tests/test_nav.py.
"""

import numpy as np
import pytest

from magnav.artifact import load_artifact
from magnav.classical import build_denoisers, select_tl_config
from magnav.data import FLT1006_LINE08, load_line, load_map
from magnav.frames import ll_to_local
from magnav.metrics import position_metrics, signal_metrics
from magnav.nav import simulate_dr
from magnav.pipeline import DR_PARAMS, HELD_OUT, JAM_FRACTION, TERCOM_PARAMS, line_seed

TOL_NT = 0.15  # stored values are rounded to 0.1
TOL_M = 0.15
CHEAP = ("raw", "lowpass", "tl", "tl_currents", "krr", "quantum")


@pytest.fixture(scope="module")
def art():
    return load_artifact()


@pytest.fixture(scope="module")
def fitted(art):
    cal_s, cal_t = load_line(FLT1006_LINE08)
    out = {}
    for mag_key in art["sensors"]:
        sel = select_tl_config(cal_s, cal_t.mag_1_c, mag_key)
        dens = build_denoisers(mag_key, None, fluxgate=sel["fluxgate"], lam=sel["lambda"])
        out[mag_key] = (sel, {k: d.fit(cal_s, cal_t.mag_1_c) for k, d in dens.items() if k in CHEAP})
    return out


def _row(art, line, sensor, denoiser):
    rows = [r for r in art["metrics_table"] if (r["line"], r["sensor"], r["denoiser"]) == (line, sensor, denoiser)]
    assert len(rows) == 1, (line, sensor, denoiser)
    return rows[0]


def test_selection_matches_artifact(art, fitted):
    for mag_key, (sel, dens) in fitted.items():
        tl = art["provenance"]["tl"][mag_key]
        assert sel["fluxgate"] == tl["fluxgate"]
        assert sel["lambda"] == pytest.approx(tl["lambda"])
        assert sel["cv_rmse_nT"] == pytest.approx(tl["selection"]["cv_rmse_nT"], abs=1e-3)
        assert dens["tl_currents"].lam == pytest.approx(tl["tl_currents"]["lambda"])
        assert list(dens["tl_currents"].current_names) == tl["tl_currents"]["currents"]
        krr = art["provenance"]["krr"][mag_key]
        assert dens["krr"].model.lam == pytest.approx(krr["lambda"])
        assert dens["krr"].model.gamma == pytest.approx(krr["gamma"], abs=2e-6)


@pytest.mark.parametrize("line_id", sorted(HELD_OUT))
def test_signal_and_dr_metrics_match_artifact(art, fitted, line_id):
    line_path, map_path = HELD_OUT[line_id]
    sens, truth = load_line(line_path)
    tile = load_map(map_path)
    n = sens.n
    jam_idx = int(JAM_FRACTION * n)
    start = jam_idx + TERCOM_PARAMS["window"]
    L = next(L for L in art["lines"] if L["line"] == line_id)
    assert L["jam"]["index"] == jam_idx
    assert L["metric_start_index"] == start

    for mag_key, (_, dens) in fitted.items():
        for name, den in dens.items():
            got = signal_metrics(den.predict(sens), truth.mag_1_c, start)
            want = _row(art, line_id, mag_key, name)
            for k in ("signal_rmse_nT", "signal_err_std_nT"):
                assert got[k] == pytest.approx(want[k], abs=TOL_NT), (line_id, mag_key, name, k)

    seed = art["provenance"]["ins_drift"][line_id]["seed"]
    assert seed == line_seed(art["provenance"]["seed"], line_id)
    tx, ty = ll_to_local(truth.lat, truth.lon, tile.frame)
    dr = simulate_dr(sens, jam_idx, (float(tx[jam_idx]), float(ty[jam_idx])), seed=seed, **DR_PARAMS)
    assert dr.bias_signs == art["provenance"]["ins_drift"][line_id]["bias_signs"]
    dx, dy = np.concatenate([tx[:jam_idx], dr.x]), np.concatenate([ty[:jam_idx], dr.y])
    got = position_metrics(dx, dy, tx, ty, start)
    want = _row(art, line_id, "-", "dead_reckoning")
    for k in ("mean_err_m", "final_err_m", "pct_under_556"):
        assert got[k] == pytest.approx(want[k], abs=TOL_M), (line_id, k)

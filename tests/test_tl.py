"""Tolles-Lawson: A-matrix terms, planted-coefficient recovery, D-19 selection, real data."""

import numpy as np
import pytest

from magnav.classical import (
    LAMBDA_GRID,
    TL_TRIM,
    TLDenoiser,
    bpf,
    fdm,
    ridge,
    tl_A,
)
from magnav.data import FLT1003_LINE02, FLT1006_LINE08, FLT1007_LINE06, load_line
from magnav.metrics import signal_metrics


def test_tl_A_shape_and_terms():
    rng = np.random.default_rng(1)
    bx, by, bz = (rng.normal(0, 30000, 50) for _ in range(3))
    A = tl_A(bx, by, bz)
    assert A.shape == (50, 18)
    np.testing.assert_allclose(np.linalg.norm(A[:, :3], axis=1), 1.0, rtol=1e-12)
    x = rng.normal(size=20)
    d = fdm(x)
    np.testing.assert_allclose(d[1:-1], (x[2:] - x[:-2]) / 2.0)
    assert d[0] == pytest.approx(x[1] - x[0])
    assert d[-1] == pytest.approx(x[-1] - x[-2])


def _manoeuvre(n=2000, fs=2.0):
    """Earth field rotated by in-band pitch/roll/yaw oscillations, as a body-frame fluxgate sees it."""
    t = np.arange(n) / fs
    pitch = 0.15 * np.sin(2 * np.pi * 0.21 * t) + 0.05 * np.sin(2 * np.pi * 0.47 * t)
    roll = 0.20 * np.sin(2 * np.pi * 0.33 * t + 0.4) + 0.04 * np.sin(2 * np.pi * 0.71 * t)
    yaw = 0.8 * t / t[-1] * 2 * np.pi + 0.1 * np.sin(2 * np.pi * 0.27 * t)
    bt = 53000.0 + 300.0 * np.sin(2 * np.pi * 0.37 * t)
    inc = np.deg2rad(70.0)
    e = np.array([np.cos(inc), 0.0, np.sin(inc)])
    b = np.empty((n, 3))
    for i in range(n):
        cy, sy = np.cos(yaw[i]), np.sin(yaw[i])
        cp, sp = np.cos(pitch[i]), np.sin(pitch[i])
        cr, sr = np.cos(roll[i]), np.sin(roll[i])
        rz = np.array([[cy, sy, 0], [-sy, cy, 0], [0, 0, 1]])
        ry = np.array([[cp, 0, -sp], [0, 1, 0], [sp, 0, cp]])
        rx = np.array([[1, 0, 0], [0, cr, sr], [0, -sr, cr]])
        b[i] = rx @ ry @ rz @ e * bt[i]
    return t, b


def test_tl_recovers_planted_coefficients():
    fs = 2.0
    t, b = _manoeuvre(fs=fs)
    A = tl_A(b[:, 0], b[:, 1], b[:, 2])
    rng = np.random.default_rng(7)
    planted = rng.normal(0, 50, 18)
    earth = 53000.0 + 40.0 * np.sin(2 * np.pi * 0.004 * t)  # < 0.02 Hz, outside the band
    mag = earth + A @ planted
    s = slice(TL_TRIM, -TL_TRIM)
    coef = ridge(bpf(A, fs)[s], bpf(mag, fs)[s], 1e-6)
    assert np.linalg.norm(coef - planted) / np.linalg.norm(planted) < 0.01


@pytest.fixture(scope="module")
def lines():
    cal = load_line(FLT1006_LINE08)
    held = {"1003.02": load_line(FLT1003_LINE02), "1007.06": load_line(FLT1007_LINE06)}
    return cal, held


def test_real_tl_improves(lines):
    """Held-out improvement with flux_a and lambda chosen on 1006.08 only (D-09).

    Mag 4: TL removes the in-band (0.1-0.9 Hz) interference it is fitted on (to < 0.5x raw)
    and lowers the total error std on both lines. The total is not < 0.7x raw on 1003.02:
    with flux_a the remaining error is almost entirely below 0.1 Hz, where the bandpassed
    calibration fit does not constrain the model (see 02-02-SUMMARY). Mag 5 lands at a few
    tens of nT.
    """
    (cal_s, cal_t), held = lines
    for mag_key in ("mag_4_uc", "mag_5_uc"):
        tl = TLDenoiser(mag_key).fit(cal_s, cal_t.mag_1_c)
        assert tl.name == "tl"
        assert tl.lam in LAMBDA_GRID
        for line_id, (s, t) in held.items():
            cleaned = tl.predict(s)
            tl_std = signal_metrics(cleaned, t.mag_1_c, 0)["signal_err_std_nT"]
            raw_std = signal_metrics(s.mag[mag_key], t.mag_1_c, 0)["signal_err_std_nT"]
            if mag_key == "mag_4_uc":
                assert tl_std < raw_std, (line_id, tl_std, raw_std)
                tl_band = np.std(bpf(cleaned - t.mag_1_c, s.fs))
                raw_band = np.std(bpf(s.mag[mag_key] - t.mag_1_c, s.fs))
                assert tl_band < 0.5 * raw_band, (line_id, tl_band, raw_band)
            else:
                assert tl_std < 40.0, (line_id, tl_std)


def test_tl_currents_columns(lines):
    (cal_s, cal_t), _ = lines
    tlc = TLDenoiser("mag_4_uc", n_currents=4).fit(cal_s, cal_t.mag_1_c)
    assert tlc.name == "tl_currents"
    assert tuple(tlc.current_names) == ("cur_outpwr", "cur_acpwr", "cur_heat", "cur_ac_hi")
    assert len(tlc.coef) == 22


def test_tl_currents_contribution_bandpassed(lines):
    """WR-07: the current regressors' contribution is applied in the TL band, so a DC step
    in a current channel at apply time does not shift the compensated output."""
    import dataclasses

    (cal_s, cal_t), held = lines
    tlc = TLDenoiser("mag_4_uc", n_currents=4).fit(cal_s, cal_t.mag_1_c)
    s = held["1003.02"][0]
    base = tlc.predict(s)
    cur = dict(s.cur)
    cur[tlc.current_names[0]] = cur[tlc.current_names[0]] + 5.0  # constant offset: out of band
    shifted = tlc.predict(dataclasses.replace(s, cur=cur))
    assert np.max(np.abs(shifted - base)) < 1e-6 * max(1.0, np.max(np.abs(tlc.coef)))


# ---------------------------------------------------------------------------
# D-19: calibration-only fluxgate / lambda selection
# ---------------------------------------------------------------------------


def _synthetic_cal(noise_sd: dict, seed=11):
    """Sensors whose cabin mag is driven by the true field; each fluxgate reads it plus planted noise."""
    from magnav.data import Sensors

    fs = 2.0
    t, b = _manoeuvre(n=1600, fs=fs)
    rng = np.random.default_rng(seed)
    planted = rng.normal(0, 400, 18)
    earth = 53000.0 + 40.0 * np.sin(2 * np.pi * 0.004 * t)
    mag = earth + tl_A(b[:, 0], b[:, 1], b[:, 2]) @ planted
    flux = {}
    for fg, sd in noise_sd.items():
        noisy = b + rng.normal(0, sd, b.shape)
        for i, ax in enumerate("xyz"):
            flux[f"{fg}_{ax}"] = noisy[:, i]
        flux[f"{fg}_t"] = np.linalg.norm(noisy, axis=1)
    z = np.zeros_like(t)
    sens = Sensors(t=t, fs=fs, line="1006.08", mag={"mag_4_uc": mag}, flux=flux, cur={},
                   ins_pitch=z, ins_roll=z, ins_yaw=z, ins_vn=z, ins_vw=z, ins_vu=z,
                   igrf=z, diurnal=z)  # fmt: skip
    return sens, earth


@pytest.mark.parametrize("cleanest", ["flux_a", "flux_b", "flux_c", "flux_d"])
def test_select_tl_config_picks_lowest_noise_fluxgate(cleanest):
    from magnav.classical import FLUXGATES, select_tl_config

    noise = dict(zip(FLUXGATES, (40.0, 80.0, 120.0, 160.0)))
    others = [fg for fg in FLUXGATES if fg != cleanest]
    noise = {cleanest: 2.0, **{fg: noise[fg] for fg in others}}
    sens, target = _synthetic_cal(noise)
    sel = select_tl_config(sens, target, "mag_4_uc")
    assert sel["fluxgate"] == cleanest, sel["cv_table"]
    assert sel["lambda"] in LAMBDA_GRID
    assert sel["n_blocks"] == 5
    assert set(sel["cv_table"]) == set(FLUXGATES)
    assert sel["cv_rmse_nT"] == min(min(v.values()) for v in sel["cv_table"].values())


def test_select_tl_config_signature_is_calibration_only():
    """The selector takes exactly one Sensors object and one target array: no held-out slot."""
    import inspect

    from magnav.classical import select_tl_config

    params = list(inspect.signature(select_tl_config).parameters)
    assert params[:3] == ["cal", "cal_target", "mag_key"]
    assert not {"held_out", "lines", "test", "val", "sensors_list"} & set(params)


def test_pipeline_passes_only_calibration_line_to_selector():
    """AST check: every select_tl_config call in pipeline.py gets cal_sensors / cal_target, and
    cal_sensors is bound only by load_line(FLT1006_LINE08)."""
    import ast
    from pathlib import Path

    src = (Path(__file__).resolve().parents[1] / "magnav" / "pipeline.py").read_text(encoding="utf-8")
    tree = ast.parse(src)
    calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and getattr(n.func, "id", None) == "select_tl_config"]
    assert calls, "pipeline must call select_tl_config"
    for c in calls:
        assert [getattr(a, "id", None) for a in c.args[:2]] == ["cal_sensors", "cal_target"]
    binds = [n for n in ast.walk(tree) if isinstance(n, ast.Assign)
             and any(isinstance(t, ast.Tuple) and any(getattr(e, "id", None) == "cal_sensors" for e in t.elts)
                     for t in n.targets)]  # fmt: skip
    assert len(binds) == 1
    call = binds[0].value
    assert call.func.id == "load_line" and call.args[0].id == "FLT1006_LINE08"
    fits = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and getattr(n.func, "attr", None) == "fit"]
    for c in fits:
        assert [getattr(a, "id", None) for a in c.args[:2]] == ["cal_sensors", "cal_target"]


def test_selector_runtime_sees_only_calibration_line(monkeypatch):
    """Every runtime select_tl_config call sees only 1006.08, including the TL+currents
    path, where TLDenoiser.fit resolves the selector through magnav.classical (WR-06)."""
    import magnav.classical as cl
    import magnav.pipeline as pl

    seen = {"pipeline": [], "classical": []}
    real = cl.select_tl_config

    def make_spy(where):
        def spy(cal, cal_target, mag_key, *a, **k):
            seen[where].append(cal.line)
            return real(cal, cal_target, mag_key, *a, **k)

        return spy

    monkeypatch.setattr(pl, "select_tl_config", make_spy("pipeline"))
    monkeypatch.setattr(cl, "select_tl_config", make_spy("classical"))
    res = pl.run_pipeline(sensors=("mag_5_uc",), lines=("1003.02",), truncate=600)
    assert seen["pipeline"] == ["1006.08"]
    assert seen["classical"], "TL+currents selection path did not go through the spy"
    assert set(seen["pipeline"] + seen["classical"]) == {"1006.08"}
    assert res["config"]["tl"]["mag_5_uc"]["fluxgate"] in ("flux_a", "flux_b", "flux_c", "flux_d")
    assert res["config"]["krr"]["mag_5_uc"]["fluxgate"] == res["config"]["tl"]["mag_5_uc"]["fluxgate"]


def test_tl_currents_fit_calls_selector_via_classical_module(monkeypatch, lines):
    """The spy target above is the attribute TLDenoiser.fit actually resolves."""
    import magnav.classical as cl

    calls = []
    real = cl.select_tl_config
    monkeypatch.setattr(cl, "select_tl_config", lambda cal, *a, **k: calls.append(cal.line) or real(cal, *a, **k))
    (cal_s, cal_t), _ = lines
    TLDenoiser("mag_5_uc", n_currents=4).fit(cal_s, cal_t.mag_1_c)
    assert calls == ["1006.08"]

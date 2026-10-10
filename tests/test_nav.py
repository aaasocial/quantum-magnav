"""Loader split, local frame, dead reckoning and TERCOM tests."""

import numpy as np
import pytest
from scipy.ndimage import gaussian_filter

from magnav.data import (
    FLT1003_LINE02,
    FLT1007_LINE06,
    MAP_EASTERN,
    MAP_RENFREW,
    MapTile,
    Sensors,
    load_line,
    load_map,
)
from magnav.frames import Frame, ll_to_local, local_to_ll
from magnav.nav import DRResult, simulate_dr, tercom

TRUTH_ONLY = ("mag_1_c", "mag_1_igrf", "lat", "lon", "utm_x", "utm_y", "utm_z")


def _track_len(x, y):
    return float(np.hypot(np.diff(x), np.diff(y)).sum())


def test_load_line_split():
    sensors, truth = load_line(FLT1003_LINE02)
    for name in TRUTH_ONLY:
        assert not hasattr(sensors, name), name
        assert hasattr(truth, name), name
    assert len(sensors.t) == 7568 == len(truth.t)
    assert sensors.fs == 2.0
    assert sensors.line == "1003.02"
    assert set(sensors.mag) == {"mag_3_uc", "mag_4_uc", "mag_5_uc"}
    assert len(sensors.flux) == 16 and len(sensors.cur) == 14


def test_local_frame_vs_utm():
    _, truth = load_line(FLT1003_LINE02)
    tile = load_map(MAP_EASTERN)
    x, y = ll_to_local(truth.lat, truth.lon, tile.frame)
    a, b = _track_len(x, y), _track_len(truth.utm_x, truth.utm_y)
    assert abs(a - b) / b < 0.005


def test_frame_round_trip():
    f = Frame(45.0, -76.0)
    lat, lon = local_to_ll(*ll_to_local([44.9, 45.2], [-76.3, -75.8], f), f)
    assert np.allclose(lat, [44.9, 45.2]) and np.allclose(lon, [-76.3, -75.8])


@pytest.mark.parametrize("line_path,map_path", [(FLT1003_LINE02, MAP_EASTERN), (FLT1007_LINE06, MAP_RENFREW)])
def test_map_reproduces_anomaly(line_path, map_path):
    _, truth = load_line(line_path)
    tile = load_map(map_path)
    x, y = ll_to_local(truth.lat, truth.lon, tile.frame)
    v, ok = tile.sample(x, y)
    assert ok.all()
    assert np.corrcoef(v, truth.mag_1_igrf)[0, 1] > 0.99


def test_dr_signs():
    sensors, truth = load_line(FLT1003_LINE02)
    tile = load_map(MAP_EASTERN)
    x, y = ll_to_local(truth.lat, truth.lon, tile.frame)
    j = int(0.25 * len(x))
    dr = simulate_dr(sensors, j, (x[j], y[j]), seed=0, bias_mps=0.0, rw_sigma=0.0)
    assert len(dr.x) == len(x) - j
    assert (dr.x[0], dr.y[0]) == (x[j], y[j])
    final_err = np.hypot(dr.x[-1] - x[-1], dr.y[-1] - y[-1])
    assert final_err < 0.01 * _track_len(x[j:], y[j:])


def test_dr_seed_deterministic():
    sensors, _ = load_line(FLT1003_LINE02)
    a = simulate_dr(sensors, 100, (0.0, 0.0), seed=0)
    b = simulate_dr(sensors, 100, (0.0, 0.0), seed=0)
    c = simulate_dr(sensors, 100, (0.0, 0.0), seed=1)
    assert np.array_equal(a.x, b.x) and np.array_equal(a.y, b.y)
    assert a.bias_signs == b.bias_signs
    assert all(s in (-1, 1) for s in a.bias_signs)
    assert not np.array_equal(a.x, c.x)


# ---------- synthetic TERCOM ----------

CELL = 60.0
N = 420  # samples along a straight eastward track
SPEED = 34.0  # m per sample (68 m/s at 2 Hz)
Y_TRUE = 4000.0


def _tile(valid=None, seed=0) -> MapTile:
    rng = np.random.default_rng(seed)
    nx, ny = 300, 140  # 18 km x 8.4 km
    M = gaussian_filter(rng.normal(size=(ny, nx)), 5.0)
    M *= 300.0 / M.std()
    gx = np.arange(nx) * CELL
    gy = np.arange(ny) * CELL
    V = np.ones((ny, nx), bool) if valid is None else valid(gx, gy)
    return MapTile("synthetic", Frame(0.0, 0.0), gx, gy, CELL, CELL, nx, ny, M, V, gx, gy)


def _truth_track():
    x = 1500.0 + SPEED * np.arange(N)
    return x, np.full(N, Y_TRUE)


def _dr(x, y, dx=700.0, dy=0.0):
    return DRResult(x=x + dx, y=y + dy, bias_mps=0.0, bias_signs=[1, 1], rw_sigma=0.0, seed=0)


def test_tercom_planted_offset():
    tile = _tile()
    tx, ty = _truth_track()
    sig, ok = tile.sample(tx, ty)
    assert ok.all()
    dr = _dr(tx, ty)
    nav = tercom(sig, dr, 0, (dr.x[0], dr.y[0]), tile)
    assert nav.accepted.any()
    first = int(np.argmax(nav.accepted))
    start = nav.window_end[first] - 1
    err = np.hypot(nav.x[start:] - tx[start:], nav.y[start:] - ty[start:])
    assert err.max() <= CELL


def test_tercom_never_uses_invalid_cells():
    def band(gx, gy):
        V = np.ones((len(gy), len(gx)), bool)
        V[np.abs(gy - Y_TRUE) <= 300.0, :] = False
        return V

    tile = _tile(valid=band)
    clean = _tile()
    tx, ty = _truth_track()
    sig, _ = clean.sample(tx, ty)  # signal from the real field, map band masked
    dr = _dr(tx, ty)
    nav = tercom(sig, dr, 0, (dr.x[0], dr.y[0]), tile)
    for k in np.flatnonzero(nav.accepted):
        e = nav.window_end[k]
        rx = dr.x[e - 120 : e] - dr.x[e - 1]
        ry = dr.y[e - 120 : e] - dr.y[e - 1]
        _, ok = tile.sample(nav.est_x[k] + rx, nav.est_y[k] + ry)
        assert ok.all(), k
        assert abs(nav.est_y[k] - Y_TRUE) > 300.0


def test_tercom_gate_coasts():
    tile = _tile()
    tx, ty = _truth_track()
    sig = np.random.default_rng(5).normal(0.0, 100.0, N)
    dr = _dr(tx, ty)
    fix = (dr.x[0] - 200.0, dr.y[0] + 100.0)
    nav = tercom(sig, dr, 0, fix, tile)
    assert len(nav.window_end) > 0
    assert not nav.accepted.any()
    assert np.allclose(nav.x[nav.window_end[0] - 1 :], dr.x[nav.window_end[0] - 1 :] - 200.0)
    assert np.allclose(nav.y[nav.window_end[0] - 1 :], dr.y[nav.window_end[0] - 1 :] + 100.0)


def test_sensors_type_has_no_truth_fields():
    fields = set(Sensors.__dataclass_fields__)
    assert not fields & set(TRUTH_ONLY)

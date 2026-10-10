"""Loaders for the shipped SGL 2020 excerpts and Ottawa map crops.

Qollab preloads a data file only if its path appears as a literal string in the Python
code, so every path below is a literal constant and callers pass these constants.

Truth / Sensors split: `Truth` holds what an aircraft cannot observe without GPS and the
tail stinger (compensated Mag 1, lat/lon, UTM). Only the pipeline orchestrator and the
metrics use it; denoisers and the navigator receive `Sensors` (and bare arrays) only.
"""

import json
from dataclasses import dataclass

import numpy as np

from magnav.frames import Frame, ll_to_local

FLT1006_LINE08 = "data/flt1006_line08.npz"  # calibration line 1006.08
FLT1003_LINE02 = "data/flt1003_line02.npz"  # held-out line 1003.02
FLT1007_LINE06 = "data/flt1007_line06.npz"  # held-out line 1007.06
MAP_EASTERN = "data/map_eastern_395.npz"  # Eastern_395 crop (1003.02 + 1006.08)
MAP_RENFREW = "data/map_renfrew_395.npz"  # Renfrew_395 crop (1007.06)
PROVENANCE = "data/provenance.json"

MAG_KEYS = ("mag_3_uc", "mag_4_uc", "mag_5_uc")
FLUX_KEYS = tuple(f"flux_{c}_{a}" for c in "abcd" for a in "xyzt")
CUR_KEYS = (
    "cur_ac_hi", "cur_ac_lo", "cur_acpwr", "cur_bat_1", "cur_bat_2", "cur_com_1", "cur_flap",
    "cur_heat", "cur_outpwr", "cur_srvo_i", "cur_srvo_m", "cur_srvo_o", "cur_strb", "cur_tank",
)  # fmt: skip


@dataclass(frozen=True)
class Truth:
    """GPS / tail-stinger truth. Only pipeline.py and metrics callers may touch this."""

    t: np.ndarray
    mag_1_c: np.ndarray
    mag_1_igrf: np.ndarray
    lat: np.ndarray
    lon: np.ndarray
    utm_x: np.ndarray
    utm_y: np.ndarray
    utm_z: np.ndarray


@dataclass(frozen=True)
class Sensors:
    """What the aircraft measures on board (plus external IGRF model and base station)."""

    t: np.ndarray
    fs: float
    line: str
    mag: dict
    flux: dict
    cur: dict
    ins_pitch: np.ndarray
    ins_roll: np.ndarray
    ins_yaw: np.ndarray
    ins_vn: np.ndarray
    ins_vw: np.ndarray
    ins_vu: np.ndarray
    igrf: np.ndarray
    diurnal: np.ndarray

    @property
    def n(self) -> int:
        return len(self.t)


@dataclass(frozen=True)
class MapTile:
    """Anomaly map tile on a uniform local grid (rows = north, cols = east)."""

    name: str
    frame: Frame
    gx: np.ndarray
    gy: np.ndarray
    dx: float
    dy: float
    nx: int
    ny: int
    M: np.ndarray
    V: np.ndarray
    lon: np.ndarray
    lat: np.ndarray

    def sample(self, x, y):
        """Bilinear map value at local (x, y); ok only if inside and all 4 cells valid."""
        x = np.asarray(x, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        fx = (x - self.gx[0]) / self.dx
        fy = (y - self.gy[0]) / self.dy
        i0 = np.floor(fx).astype(np.int64)
        j0 = np.floor(fy).astype(np.int64)
        inside = (i0 >= 0) & (j0 >= 0) & (i0 < self.nx - 1) & (j0 < self.ny - 1)
        i0 = np.clip(i0, 0, self.nx - 2)
        j0 = np.clip(j0, 0, self.ny - 2)
        tx = fx - i0
        ty = fy - j0
        M, V = self.M, self.V
        v = (
            M[j0, i0] * (1 - tx) * (1 - ty)
            + M[j0, i0 + 1] * tx * (1 - ty)
            + M[j0 + 1, i0] * (1 - tx) * ty
            + M[j0 + 1, i0 + 1] * tx * ty
        )
        ok = inside & V[j0, i0] & V[j0, i0 + 1] & V[j0 + 1, i0] & V[j0 + 1, i0 + 1]
        return v, ok


def _f64(z, key: str) -> np.ndarray:
    return np.array(z[key], dtype=np.float64)


def load_line(path: str) -> tuple[Sensors, Truth]:
    """Load one line excerpt (pass a literal constant such as FLT1003_LINE02)."""
    with np.load(path, allow_pickle=False) as z:
        tt = _f64(z, "tt")
        t = tt - tt[0]
        fs = float(round(1.0 / float(np.median(np.diff(tt))), 6))
        sensors = Sensors(
            t=t,
            fs=fs,
            line=f"{float(z['line']):.2f}",
            mag={k: _f64(z, k) for k in MAG_KEYS},
            flux={k: _f64(z, k) for k in FLUX_KEYS},
            cur={k: _f64(z, k) for k in CUR_KEYS},
            ins_pitch=_f64(z, "ins_pitch"),
            ins_roll=_f64(z, "ins_roll"),
            ins_yaw=_f64(z, "ins_yaw"),
            ins_vn=_f64(z, "ins_vn"),
            ins_vw=_f64(z, "ins_vw"),
            ins_vu=_f64(z, "ins_vu"),
            igrf=_f64(z, "igrf"),
            diurnal=_f64(z, "diurnal"),
        )
        truth = Truth(
            t=t.copy(),
            mag_1_c=_f64(z, "mag_1_c"),
            mag_1_igrf=_f64(z, "mag_1_igrf"),
            lat=_f64(z, "lat"),
            lon=_f64(z, "lon"),
            utm_x=_f64(z, "utm_x"),
            utm_y=_f64(z, "utm_y"),
            utm_z=_f64(z, "utm_z"),
        )
    return sensors, truth


def load_map(path: str) -> MapTile:
    """Load a map crop (pass MAP_EASTERN or MAP_RENFREW)."""
    with np.load(path, allow_pickle=False) as z:
        xx = _f64(z, "xx")
        yy = _f64(z, "yy")
        M = _f64(z, "map")
        V = np.array(z["mask"], dtype=bool)
    frame = Frame(lat0=float(yy.mean()), lon0=float(xx.mean()))
    gx, _ = ll_to_local(np.full_like(xx, frame.lat0), xx, frame)
    _, gy = ll_to_local(yy, np.full_like(yy, frame.lon0), frame)
    name = path.rsplit("/", 1)[-1].removesuffix(".npz")
    return MapTile(
        name=name,
        frame=frame,
        gx=gx,
        gy=gy,
        dx=float((gx[-1] - gx[0]) / (len(gx) - 1)),
        dy=float((gy[-1] - gy[0]) / (len(gy) - 1)),
        nx=len(xx),
        ny=len(yy),
        M=M,
        V=V,
        lon=xx,
        lat=yy,
    )


def load_provenance() -> dict:
    with open(PROVENANCE, encoding="utf-8") as f:
        return json.load(f)

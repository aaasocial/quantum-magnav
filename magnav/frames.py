"""Local true-north metric frame (equirectangular about a tile centre).

INS velocities are true-north, and the Ottawa maps are regular in lon/lat, so dead
reckoning, map sampling and metrics all run in this frame rather than UTM (whose grid
north is rotated 0.65-1.26 deg here).
"""

from dataclasses import dataclass

import numpy as np

EARTH_RADIUS_M = 6371008.8


@dataclass(frozen=True)
class Frame:
    lat0: float
    lon0: float
    R: float = EARTH_RADIUS_M


def ll_to_local(lat, lon, frame: Frame):
    """(lat, lon) in degrees -> (x east, y north) in metres."""
    lat = np.asarray(lat, dtype=np.float64)
    lon = np.asarray(lon, dtype=np.float64)
    x = np.deg2rad(lon - frame.lon0) * frame.R * np.cos(np.deg2rad(frame.lat0))
    y = np.deg2rad(lat - frame.lat0) * frame.R
    return x, y


def local_to_ll(x, y, frame: Frame):
    """(x east, y north) in metres -> (lat, lon) in degrees."""
    x = np.asarray(x, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    lat = frame.lat0 + np.rad2deg(y / frame.R)
    lon = frame.lon0 + np.rad2deg(x / (frame.R * np.cos(np.deg2rad(frame.lat0))))
    return lat, lon

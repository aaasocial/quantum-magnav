"""Classical denoisers for a cabin magnetometer.

Protocol (shared with the later TL / KRR / quantum denoisers):
    fit(cal: Sensors, target: np.ndarray) -> self   # target = calibration-line truth array
    predict(sensors: Sensors) -> np.ndarray         # absolute nT, calibration bias removed
    name: str
Denoisers never see Truth: the orchestrator passes the calibration target as a bare array.
"""

import numpy as np
from scipy import signal

from magnav.data import Sensors


class RawDenoiser:
    """No compensation: the cabin magnetometer minus its calibration-line offset."""

    name = "raw"

    def __init__(self, mag_key: str):
        self.mag_key = mag_key
        self.bias = 0.0

    def _clean(self, sensors: Sensors) -> np.ndarray:
        return np.asarray(sensors.mag[self.mag_key], dtype=np.float64)

    def fit(self, cal: Sensors, target: np.ndarray):
        self.bias = float(np.mean(self._clean(cal) - np.asarray(target, dtype=np.float64)))
        return self

    def predict(self, sensors: Sensors) -> np.ndarray:
        return self._clean(sensors) - self.bias


class LowPassDenoiser(RawDenoiser):
    """Naive floor (D-12): zero-phase Butterworth low-pass on the cabin magnetometer."""

    name = "lowpass"

    def __init__(self, mag_key: str, cutoff_hz: float = 0.05, order: int = 4):
        super().__init__(mag_key)
        self.cutoff_hz = float(cutoff_hz)
        self.order = int(order)

    def _clean(self, sensors: Sensors) -> np.ndarray:
        x = np.asarray(sensors.mag[self.mag_key], dtype=np.float64)
        sos = signal.butter(self.order, self.cutoff_hz, btype="low", fs=sensors.fs, output="sos")
        mu = float(x.mean())  # filter the deviation so the ~53,000 nT level adds no edge transient
        return signal.sosfiltfilt(sos, x - mu) + mu


def build_denoisers(mag_key: str) -> dict:
    """Ordered denoiser set for one cabin sensor."""
    return {
        "raw": RawDenoiser(mag_key),
        "lowpass": LowPassDenoiser(mag_key),
    }

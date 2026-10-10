"""numpy KRR, shared kernel_features, KRRResidual subsampling."""

import math

import numpy as np
import pytest

from magnav.classical import (
    KRR_CURRENTS,
    KRRResidual,
    fdm,
    kernel_features,
    krr_fit,
    krr_predict,
    rbf,
    tl_A,
)
from magnav.data import FLT1006_LINE08, load_line


def test_krr_closed_form():
    rng = np.random.default_rng(0)
    Z = rng.normal(size=(30, 4))
    y = rng.normal(size=30)
    g, lam = 0.3, 0.1
    K = rbf(Z, Z, g)
    alpha = krr_fit(Z, y, g, lam)
    np.testing.assert_allclose(alpha, np.linalg.solve(K + lam * np.eye(30), y), rtol=1e-10)
    np.testing.assert_allclose(krr_predict(Z, Z, alpha, g), K @ alpha, rtol=1e-10)


def test_krr_chunked_equals_unchunked():
    rng = np.random.default_rng(1)
    Z = rng.normal(size=(40, 5))
    Zt = rng.normal(size=(53, 5))
    alpha = krr_fit(Z, rng.normal(size=40), 0.2, 1.0)
    a = krr_predict(Zt, Z, alpha, 0.2, chunk=7)
    b = krr_predict(Zt, Z, alpha, 0.2, chunk=10**6)
    np.testing.assert_allclose(a, b, atol=1e-10, rtol=0)


@pytest.fixture(scope="module")
def cal():
    return load_line(FLT1006_LINE08)[0]


def test_kernel_features_shape(cal):
    F = kernel_features(cal)
    assert F.shape == (1678, 22)
    assert not np.isnan(F).any()
    A = tl_A(cal.flux["flux_a_x"], cal.flux["flux_a_y"], cal.flux["flux_a_z"])
    np.testing.assert_allclose(F[:, :9], A[:, :9])
    np.testing.assert_allclose(F[:, 9:18], np.column_stack([fdm(A[:, j]) for j in range(9)]))
    np.testing.assert_allclose(F[:, 18:], np.column_stack([cal.cur[c] for c in KRR_CURRENTS]))


def test_krr_residual_n_train_stride(cal):
    F = kernel_features(cal)
    r = np.sin(np.arange(len(F)) * 0.3)
    m = KRRResidual(n_train_stride=4).fit(F, r)
    assert m.n_train == math.ceil(len(F) / 4)
    assert m.predict(F).shape == (len(F),)
    assert m.gamma > 0 and m.lam in (1e-2, 1e-1, 1.0, 10.0)
    assert m.mu.shape == (22,) and m.sd.shape == (22,)

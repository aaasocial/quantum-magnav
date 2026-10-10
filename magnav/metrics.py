"""Signal and position metrics (METR-01) and the fixed-width metrics table."""

import operator

import numpy as np

THRESHOLDS_M = (556.0, 1852.0, 3704.0)  # 0.3 nmi (RNP-style), 1 nmi, 2 nmi


def signal_metrics(cleaned, mag_1_c, start: int) -> dict:
    e = np.asarray(cleaned, dtype=np.float64)[start:] - np.asarray(mag_1_c, dtype=np.float64)[start:]
    return {
        "signal_err_std_nT": float(np.std(e - e.mean())),
        "signal_rmse_nT": float(np.sqrt(np.mean(e**2))),
    }


def position_metrics(est_x, est_y, true_x, true_y, start: int) -> dict:
    p = np.hypot(
        np.asarray(est_x, dtype=np.float64)[start:] - np.asarray(true_x, dtype=np.float64)[start:],
        np.asarray(est_y, dtype=np.float64)[start:] - np.asarray(true_y, dtype=np.float64)[start:],
    )
    out = {
        "mean_err_m": float(p.mean()),
        "final_err_m": float(p[-1]),
        "cep50_m": float(np.percentile(p, 50)),
        "cep95_m": float(np.percentile(p, 95)),
    }
    for thr in THRESHOLDS_M:
        out[f"pct_under_{int(thr)}"] = float(100.0 * np.mean(p < thr))
    return out


COLUMNS = (
    # (header, key, width, format)
    ("line", "line", 8, "s"),
    ("sensor", "sensor", 9, "s"),
    ("denoiser", "denoiser", 15, "s"),
    ("sig_std", "signal_err_std_nT", 8, ".1f"),
    ("sig_rmse", "signal_rmse_nT", 9, ".1f"),
    ("mean_m", "mean_err_m", 8, ".0f"),
    ("final_m", "final_err_m", 8, ".0f"),
    ("cep50", "cep50_m", 7, ".0f"),
    ("cep95", "cep95_m", 7, ".0f"),
    ("%<556", "pct_under_556", 6, ".1f"),
    ("%<1nmi", "pct_under_1852", 7, ".1f"),
    ("%<2nmi", "pct_under_3704", 7, ".1f"),
)


def _cell(value, width: int, fmt: str) -> str:
    if value is None:
        text = "-"
    elif fmt == "s":
        text = str(value)
        return text.ljust(width)
    else:
        text = format(float(value), fmt)
    return text.rjust(width)


def format_metrics_table(rows) -> str:
    head = " ".join(_cell(h, w, "s") if f == "s" else h.rjust(w) for h, _, w, f in COLUMNS)
    head += "  acc/win"
    lines = [head, "-" * len(head)]
    for r in rows:
        cells = [_cell(r.get(k), w, f) for _, k, w, f in COLUMNS]
        acc, win = r.get("accepted"), r.get("windows")
        aw = "-" if acc is None or win is None else f"{int(acc)}/{int(win)}"
        lines.append(" ".join(cells) + "  " + aw.rjust(7))
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# D-17 / ROADMAP SC2 acceptance checks (thresholds fixed here, never tuned on held-out lines)
# ---------------------------------------------------------------------------

HOLD_PCT = 90.0
RNP_M = 556.0


def _find(rows, line, sensor, denoiser):
    for r in rows:
        if r.get("line") == line and r.get("sensor") == sensor and r.get("denoiser") == denoiser:
            return r
    return None


def _val(rows, line, sensor, denoiser, key):
    r = _find(rows, line, sensor, denoiser)
    if r is None or r.get(key) is None:
        return None
    return float(r[key])


def acceptance_checks(metrics_table) -> list:
    """The seven named D-17 checks. A missing row gives passed False and value None."""
    rows = list(metrics_table)

    def check(name, line, value, threshold, rule, op):
        ok = value is not None and threshold is not None and op(value, threshold)
        return {
            "name": name,
            "line": line,
            "passed": bool(ok),
            "value": None if value is None else round(value, 1),
            "threshold": None if threshold is None else round(threshold, 1),
            "rule": rule,
        }

    ge, gt, lt = operator.ge, operator.gt, operator.lt
    dr = {ln: _val(rows, ln, "-", "dead_reckoning", "mean_err_m") for ln in ("1003.02", "1007.06")}
    m4tl = _val(rows, "1003.02", "mag_4_uc", "tl", "mean_err_m")
    return [
        check("mag5_tl_hold_1003.02", "1003.02", _val(rows, "1003.02", "mag_5_uc", "tl", "pct_under_556"),
              HOLD_PCT, "mag_5_uc tl pct_under_556 >= 90", ge),
        check("mag5_tl_hold_1007.06", "1007.06", _val(rows, "1007.06", "mag_5_uc", "tl", "pct_under_556"),
              HOLD_PCT, "mag_5_uc tl pct_under_556 >= 90", ge),
        check("mag4_tl_beats_dr_1003.02", "1003.02", m4tl, dr["1003.02"],
              "mag_4_uc tl mean_err_m < dead_reckoning mean_err_m", lt),
        check("dr_drifts_1003.02", "1003.02", dr["1003.02"], RNP_M, "dead_reckoning mean_err_m > 556", gt),
        check("dr_drifts_1007.06", "1007.06", dr["1007.06"], RNP_M, "dead_reckoning mean_err_m > 556", gt),
        check("mag4_raw_drifts_1003.02", "1003.02", _val(rows, "1003.02", "mag_4_uc", "raw", "mean_err_m"), m4tl,
              "mag_4_uc raw mean_err_m > mag_4_uc tl mean_err_m", gt),
        check("mag4_raw_drifts_abs_1007.06", "1007.06", _val(rows, "1007.06", "mag_4_uc", "raw", "mean_err_m"),
              RNP_M, "mag_4_uc raw mean_err_m > 556", gt),
    ]  # fmt: skip


def format_acceptance(checks) -> str:
    out = ["ACCEPTANCE"]
    for c in checks:
        v = "None" if c["value"] is None else f"{c['value']:.1f}"
        thr = "None" if c["threshold"] is None else f"{c['threshold']:.1f}"
        out.append(f"{'PASS' if c['passed'] else 'FAIL'} {c['name']}: {v} vs {thr} (rule {c['rule']})")
    out.append(f"ACCEPTANCE {sum(c['passed'] for c in checks)}/{len(checks)} PASS")
    return "\n".join(out)

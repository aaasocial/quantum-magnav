"""Signal and position metrics (METR-01) and the fixed-width metrics table."""

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

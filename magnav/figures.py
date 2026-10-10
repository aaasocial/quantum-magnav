"""Evidence figures for the write-up (local runs only; Phase 3 draws the UI itself).

All plots read the RunArtifact (the same numbers the player replays). matplotlib is
imported lazily so the package imports without it.
"""

import os

import numpy as np

FIGURES = (
    "results/nav_1003_02.png",
    "results/nav_1007_06.png",
    "results/signal_1003_02_mag4.png",
    "results/error_vs_time.png",
)

# Okabe-Ito colour-blind-safe palette, plus distinct line styles so colour is never the only cue
TRACKS = (
    ("truth", "Truth (GPS)", "#000000", "-"),
    ("dr", "Dead reckoning", "#E69F00", "--"),
    ("mag_5_uc/tl", "Mag 5 TL", "#0072B2", "-"),
    ("mag_4_uc/tl", "Mag 4 TL", "#009E73", "-."),
    ("mag_4_uc/raw", "Mag 4 raw", "#D55E00", ":"),
)


def _arr(v):
    return np.array([np.nan if a is None else a for a in v], dtype=np.float64)


def _track(L, key):
    if key == "truth":
        return _arr(L["truth"]["x"]), _arr(L["truth"]["y"])
    if key == "dr":
        return _arr(L["dead_reckoning"]["x"]), _arr(L["dead_reckoning"]["y"])
    sensor, den = key.split("/")
    e = L["estimates"][sensor][den]
    return _arr(e["x"]), _arr(e["y"])


def _nav_figure(plt, L, path):
    mp = L["map_preview"]
    nT = np.array(mp["nT"], dtype=np.float64).reshape(mp["ny"], mp["nx"])
    valid = np.array(mp["valid"], dtype=bool).reshape(mp["ny"], mp["nx"])
    img = np.ma.masked_array(nT, ~valid)
    fig, ax = plt.subplots(figsize=(8, 6), dpi=100)
    ax.set_facecolor("#bbbbbb")  # invalid (filled) map cells show as grey
    ext = [mp["x_min"] / 1e3, mp["x_max"] / 1e3, mp["y_min"] / 1e3, mp["y_max"] / 1e3]
    lo, hi = np.percentile(nT[valid], [2, 98]) if valid.any() else (-1, 1)
    im = ax.imshow(img, origin="lower", extent=ext, cmap="cividis", vmin=lo, vmax=hi, interpolation="nearest")
    fig.colorbar(im, ax=ax, label="Map anomaly (nT)")
    jd = L["jam"]["display_index"]
    for key, label, colour, style in TRACKS:
        x, y = _track(L, key)
        ax.plot(x / 1e3, y / 1e3, style, color=colour, lw=1.4, label=label)
    tx, ty = _track(L, "truth")
    ax.plot(tx[jd] / 1e3, ty[jd] / 1e3, marker="X", ms=11, color="#CC79A7", mec="black", ls="none", label="GPS jam")
    ax.set_xlabel("East (km, local frame)")
    ax.set_ylabel("North (km, local frame)")
    ax.set_title(f"Line {L['line']}: tracks after a GPS jam at t = {L['jam']['t_s']:.0f} s (grey = no map data)")
    ax.legend(loc="best", fontsize=8, framealpha=0.85)
    ax.set_aspect("equal")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def _signal_figure(plt, L, path, span_s=600.0):
    t = _arr(L["t"])
    t0 = L["jam"]["t_s"]
    m = (t >= t0) & (t <= t0 + span_s)
    fig, ax = plt.subplots(figsize=(8, 6), dpi=100)
    ax.plot(t[m] - t0, _arr(L["truth"]["anomaly_nT"])[m], "-", color="#000000", lw=1.8, label="Truth anomaly (mag_1_c)")
    styles = (("raw", "#D55E00", ":"), ("lowpass", "#E69F00", "--"), ("tl", "#0072B2", "-"))
    for den, colour, style in styles:
        s = _arr(L["estimates"]["mag_4_uc"][den]["signal_nT"])
        ax.plot(t[m] - t0, s[m], style, color=colour, lw=1.3, label=f"Mag 4 {den}")
    ax.set_xlabel("Time after GPS jam (s)")
    ax.set_ylabel("Magnetic anomaly (nT)")
    ax.set_title(f"Line {L['line']}: Mag 4 cabin signal vs truth, first {span_s / 60:.0f} min after the jam")
    ax.legend(loc="best", fontsize=8)
    ax.grid(alpha=0.3)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def _error_figure(plt, lines, path):
    fig, axes = plt.subplots(len(lines), 1, figsize=(8, 6), dpi=100, sharex=False)
    axes = np.atleast_1d(axes)
    for ax, L in zip(axes, lines):
        t = _arr(L["t"])
        t0 = L["jam"]["t_s"]
        m = t >= t0
        tx, ty = _track(L, "truth")
        for key, label, colour, style in TRACKS[1:]:
            x, y = _track(L, key)
            ax.plot((t[m] - t0) / 60, np.hypot(x - tx, y - ty)[m], style, color=colour, lw=1.3, label=label)
        ax.axhline(556, color="#555555", lw=1, ls=(0, (6, 3)), label="556 m (0.3 nmi)")
        ax.set_yscale("log")
        ax.set_ylabel("Position error (m)")
        ax.set_title(f"Line {L['line']}", fontsize=10)
        ax.grid(alpha=0.3, which="both")
    axes[-1].set_xlabel("Time after GPS jam (min)")
    axes[0].legend(loc="upper left", fontsize=7, ncol=3)
    fig.suptitle("Position error after the GPS jam (log scale)")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def save_figures(artifact: dict) -> list:
    """Write the four evidence PNGs; returns their paths, or [] if matplotlib is missing."""
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return []
    os.makedirs("results", exist_ok=True)
    by_line = {L["line"]: L for L in artifact["lines"]}
    written = []
    for line_id, path in (("1003.02", FIGURES[0]), ("1007.06", FIGURES[1])):
        if line_id in by_line:
            _nav_figure(plt, by_line[line_id], path)
            written.append(path)
    if "1003.02" in by_line:
        _signal_figure(plt, by_line["1003.02"], FIGURES[2])
        written.append(FIGURES[2])
    _error_figure(plt, list(by_line.values()), FIGURES[3])
    written.append(FIGURES[3])
    return written

"""Static compliance checks (PLAT-03, PLAT-04, PLAT-05)."""
import sys
from importlib.metadata import version
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _text(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def test_license_is_mit_2026_eason_ha():
    text = _text("LICENSE")
    assert text.splitlines()[0] == "MIT License"
    assert "Copyright (c) 2026 Eason Ha" in text


def test_readme_compliance_strings():
    readme = _text("README.md")
    for needle in (
        "This effort is supported by Qollab & IonQ.",
        "Quantum Impact",
        "## AI tools and libraries used",
        "Claude Code",
        "Qiskit",
        "Apache-2.0",
        "## Originality",
    ):
        assert needle in readme, needle


def test_requirements_is_only_qiskit_pin():
    lines = [
        ln.strip()
        for ln in _text("requirements.txt").splitlines()
        if ln.strip() and not ln.strip().startswith("#")
    ]
    assert lines == ["qiskit>=2.5.2,<3.0.0"]


def test_gitignore_keeps_build_artifacts():
    lines = [ln.strip() for ln in _text(".gitignore").splitlines()]
    assert "main.js" not in lines
    assert "main.css" not in lines


def test_pinned_versions():
    assert version("qiskit") == "2.5.2"
    assert version("numpy").startswith("2.4.")
    assert version("scipy").startswith("1.18.")
    assert version("scikit-learn").startswith("1.8.")


def test_python_matches_requires_python():
    # pyproject: >=3.13,<3.15. Local dev uses 3.13; Qollab's Pyodide runs 3.14.2.
    assert (3, 13) <= sys.version_info[:2] < (3, 15)

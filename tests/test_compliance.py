"""Static compliance checks (PLAT-03, PLAT-04, PLAT-05)."""
import re
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


# What Qollab may install from requirements.txt. scikit-learn is optional: it is NOT
# preloaded on Qollab (docs/QOLLAB_FINDINGS.md), so it must be listed if magnav uses it.
ALLOWED_REQUIREMENTS = {"qiskit", "scikit-learn"}
# The runtime injects `backend`; numpy/scipy ship with Pyodide.
FORBIDDEN_REQUIREMENTS = {"qiskit-aer", "qiskit-ionq", "numpy", "scipy", "torch"}


def _requirement_lines() -> list[str]:
    return [
        ln.strip()
        for ln in _text("requirements.txt").splitlines()
        if ln.strip() and not ln.strip().startswith("#")
    ]


def _requirement_name(line: str) -> str:
    return re.split(r"[<>=!~\[ ]", line, maxsplit=1)[0].lower().replace("_", "-")


def test_requirements_allowlist():
    lines = _requirement_lines()
    assert "qiskit>=2.5.2,<3.0.0" in lines
    for line in lines:
        assert not line.startswith("-"), f"pip flags are not allowed on Qollab: {line}"
        assert ";" not in line, f"environment markers are not allowed on Qollab: {line}"
        name = _requirement_name(line)
        assert name not in FORBIDDEN_REQUIREMENTS, line
        assert name in ALLOWED_REQUIREMENTS, line


def test_sklearn_use_is_listed_in_requirements():
    # Guards "works locally, fails on Qollab": sklearn is installed locally via pyproject.
    uses_sklearn = any(
        re.search(r"^\s*(import|from)\s+sklearn\b", f.read_text(encoding="utf-8"), re.MULTILINE)
        for f in (ROOT / "magnav").rglob("*.py")
    )
    if uses_sklearn:
        names = {_requirement_name(ln) for ln in _requirement_lines()}
        assert "scikit-learn" in names, "magnav imports sklearn; list scikit-learn in requirements.txt"


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

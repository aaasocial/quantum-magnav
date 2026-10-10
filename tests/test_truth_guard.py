"""Static guards: estimators never accept Truth; no h5py or pickle loading in magnav/."""

import ast
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
MAGNAV = ROOT / "magnav"
REQUIRED = [MAGNAV / n for n in ("classical.py", "nav.py", "frames.py", "quantum.py")]
OPTIONAL = [MAGNAV / n for n in ("quantum_slot.py",)]
GUARDED = REQUIRED + [p for p in OPTIONAL if p.exists()]


def test_guarded_modules_exist():
    missing = [p.name for p in REQUIRED if not p.exists()]
    assert not missing, f"guarded modules missing: {missing}"


def _names_in(node) -> set[str]:
    if node is None:
        return set()
    out = set()
    for sub in ast.walk(node):
        if isinstance(sub, ast.Name):
            out.add(sub.id)
        elif isinstance(sub, ast.Attribute):
            out.add(sub.attr)
        elif isinstance(sub, ast.Constant) and isinstance(sub.value, str):
            out.add(sub.value)
    return out


@pytest.mark.parametrize("path", GUARDED, ids=lambda p: p.name)
def test_truth_guard(path):
    tree = ast.parse(path.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            assert all(a.name != "Truth" for a in node.names), f"{path.name} imports Truth"
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            a = node.args
            params = a.posonlyargs + a.args + a.kwonlyargs + [p for p in (a.vararg, a.kwarg) if p]
            for p in params:
                assert p.arg.lower() != "truth", f"{path.name}: parameter named truth"
                assert not any("Truth" in n for n in _names_in(p.annotation)), (
                    f"{path.name}: parameter {p.arg} annotated with Truth"
                )


def test_no_h5py_or_pickle_in_magnav():
    for path in MAGNAV.glob("*.py"):
        text = path.read_text(encoding="utf-8")
        assert "h5py" not in text, path.name
        assert "allow_pickle=True" not in text, path.name
        tree = ast.parse(text)
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Attribute)
                and node.func.attr == "load"
                and isinstance(node.func.value, ast.Name)
                and node.func.value.id in ("np", "numpy")
            ):
                kw = {k.arg: k.value for k in node.keywords}
                assert "allow_pickle" in kw, f"{path.name}:{node.lineno} np.load without allow_pickle"
                v = kw["allow_pickle"]
                assert isinstance(v, ast.Constant) and v.value is False, f"{path.name}:{node.lineno}"

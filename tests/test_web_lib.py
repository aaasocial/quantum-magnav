"""Runs the pure JS library unit tests (web/src/lib/*.test.js) under node --test."""

import shutil
import subprocess
from pathlib import Path

import pytest

WEB = Path(__file__).resolve().parents[1] / "web"
NODE = shutil.which("node")


@pytest.mark.skipif(
    NODE is None or not (WEB / "node_modules").is_dir(),
    reason="node or web/node_modules missing (run npm --prefix web ci)",
)
def test_web_lib_node_tests():
    proc = subprocess.run(
        [NODE, "--test", "src/lib/*.test.js"],
        check=False,
        cwd=WEB,
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert proc.returncode == 0, proc.stdout[-4000:] + proc.stderr[-2000:]

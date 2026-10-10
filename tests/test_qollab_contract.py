"""Static checks that the built artifacts match Qollab's JS-project contract."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MAIN_JS = ROOT / "main.js"
MAIN_CSS = ROOT / "main.css"
ATTRIBUTION = "This effort is supported by Qollab & IonQ."
MAX_FILE_BYTES = 2 * 1024 * 1024
FORBIDDEN_TAGS = re.compile(r"<script|<html|<head|<body", re.IGNORECASE)


def test_index_html_body_only():
    text = INDEX.read_text(encoding="utf-8")
    assert 'id="root"' in text
    assert not FORBIDDEN_TAGS.search(text)


def test_main_js_first_line():
    first = MAIN_JS.read_text(encoding="utf-8").splitlines()[0]
    assert re.match(r'^import \* as [A-Za-z_$][\w$]* from "magnav\.api";', first), first


def test_main_js_no_exports_and_size():
    text = MAIN_JS.read_text(encoding="utf-8")
    assert not any(line.startswith("export") for line in text.splitlines())
    assert "export{" not in text
    assert "export default" not in text
    assert MAIN_JS.stat().st_size < MAX_FILE_BYTES


def test_main_js_contents():
    text = MAIN_JS.read_text(encoding="utf-8")
    assert "callPromising" in text
    assert ATTRIBUTION in text


def test_main_css_nonempty():
    assert MAIN_CSS.exists()
    assert MAIN_CSS.stat().st_size > 0


def test_no_stray_build_output():
    assert not (ROOT / "assets").exists()
    assert "<script" not in INDEX.read_text(encoding="utf-8").lower()

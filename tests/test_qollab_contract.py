"""Static checks that the built artifacts match Qollab's JS-project contract."""

import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MAIN_JS = ROOT / "main.js"
MAIN_CSS = ROOT / "main.css"
LICENSES = ROOT / "THIRD_PARTY_LICENSES.md"
ATTRIBUTION = "This effort is supported by Qollab & IonQ."
MAX_FILE_BYTES = 2 * 1024 * 1024
MAX_MAIN_JS = 1_500_000  # headroom under Qollab's 2 MB per-file cap
FORBIDDEN_TAGS = re.compile(r"<script|<html|<head|<body", re.IGNORECASE)
# Any ES export statement, minified or not: `export {`, `;export{x}`, `export *`, `export default`,
# `export const/let/var/function/class`.
EXPORT_STMT = re.compile(
    r"(^|[;})\s])export\s*(\{|\*|default\b|const\b|let\b|var\b|function\b|class\b|async\b)",
    re.MULTILINE,
)
WEB = ROOT / "web"
VITE = WEB / "node_modules" / ".bin" / "vite"


def test_index_html_body_only():
    text = INDEX.read_text(encoding="utf-8")
    assert 'id="root"' in text
    assert not FORBIDDEN_TAGS.search(text)


def test_main_js_first_line():
    first = MAIN_JS.read_text(encoding="utf-8").splitlines()[0]
    assert re.match(r'^import \* as [A-Za-z_$][\w$]* from "magnav\.api";', first), first


def test_main_js_no_exports_and_size():
    text = MAIN_JS.read_text(encoding="utf-8")
    match = EXPORT_STMT.search(text)
    assert match is None, text[max(0, match.start() - 40) : match.end() + 40]
    assert MAIN_JS.stat().st_size < MAX_FILE_BYTES


@pytest.mark.parametrize(
    "snippet",
    ["export { a };", "x();export{a}", "}export * from 'y'", "export default App", "export const a = 1"],
)
def test_export_regex_catches_minified_forms(snippet):
    assert EXPORT_STMT.search(snippet)


def test_export_regex_ignores_identifiers():
    assert not EXPORT_STMT.search("const exports = {}; module.exports = x; reexport(y);")


@pytest.mark.skipif(
    not VITE.exists() or shutil.which("node") is None,
    reason="web/node_modules not installed (run npm --prefix web ci)",
)
def test_committed_bundle_matches_fresh_build(tmp_path):
    """The committed main.js/main.css must be what web/src builds to (no stale bundle)."""
    subprocess.run(
        [str(VITE), "build", "--outDir", str(tmp_path), "--emptyOutDir", "--logLevel", "error"],
        cwd=WEB,
        check=True,
        capture_output=True,
        timeout=180,
    )
    for name in ("main.js", "main.css", "THIRD_PARTY_LICENSES.md"):
        fresh = (tmp_path / name).read_bytes()
        assert fresh == (ROOT / name).read_bytes(), (
            f"{name} is stale: run `npm --prefix web run build` and commit it"
        )


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


def test_main_js_budget():
    assert MAIN_JS.stat().st_size < MAX_MAIN_JS


def test_bundle_has_no_artifact_copy():
    # The artifact comes through Python at runtime; the dev stub's ?raw import never ships.
    assert "precomputed_run" not in MAIN_JS.read_text(encoding="utf-8")


def _web_sources(*suffixes):
    return [p for p in (WEB / "src").rglob("*") if p.suffix in suffixes and p.is_file()]


def test_charts_disable_accessibility_layer():
    for path in _web_sources(".jsx"):
        text = path.read_text(encoding="utf-8")
        charts = text.count("<LineChart")
        assert charts == text.count("accessibilityLayer={false}"), path.name


# Recharts elements that animate (and schedule work through setTimeout) unless told not to.
ANIMATED_RECHARTS = re.compile(r"<(Line|Area|Bar|Scatter|Pie|Radar|RadialBar|Funnel|Tooltip)\b")


def test_recharts_animation_and_debounce_stay_off():
    """WR-06: bundled third-party timers run on Qollab's injected, promise-returning setTimeout,
    so no first-party code may switch on a recharts animation or a debounce."""
    for path in _web_sources(".jsx", ".js"):
        text = path.read_text(encoding="utf-8")
        if "from 'recharts'" not in text:
            continue
        animated = len(ANIMATED_RECHARTS.findall(text))
        assert animated == text.count("isAnimationActive={false}"), path.name
        assert "isAnimationActive={true}" not in text, path.name
    for path in _web_sources(".jsx", ".js"):
        assert not re.search(r"\bdebounce\s*[=:(]", path.read_text(encoding="utf-8")), path.name


# Timer references in the built bundle: all third-party (React scheduler, RTK autoBatchEnhancer,
# es-toolkit debounce, recharts animation and tooltip sync) except App.jsx's one setInterval.
# A change here means a dependency or first-party code started scheduling on Qollab's injected
# timers: check that the new call site works with a promise-returning setTimeout, then update.
BUNDLE_TIMER_REFS = {"setTimeout": 32, "clearTimeout": 13, "setInterval": 3}


def test_bundle_timer_call_sites_are_known():
    text = MAIN_JS.read_text(encoding="utf-8")
    found = {name: len(re.findall(rf"\b{name}\b", text)) for name in BUNDLE_TIMER_REFS}
    assert found == BUNDLE_TIMER_REFS


def test_no_unsafe_html_in_web_src():
    for path in _web_sources(".js", ".jsx"):
        text = path.read_text(encoding="utf-8")
        for bad in ("dangerouslySetInnerHTML", "innerHTML", "eval("):
            assert bad not in text, f"{bad} in {path.relative_to(ROOT)}"


@pytest.mark.parametrize(
    "copy",
    [
        "Quantum MagNav: holding position without GPS",
        "Run live in-page",
        "precomputed replay",
        "computed in-page",
        "Live run took longer than 90 s",
        "magnetic-only from here",
        "Navigation accuracy",
        "Magnetic signal",
        "No survey data",
        "Signal data (every 60 s)",
    ],
)
def test_ui_copy_in_bundle(copy):
    assert copy in MAIN_JS.read_text(encoding="utf-8")


def test_third_party_licenses_present():
    text = LICENSES.read_text(encoding="utf-8")
    for name in ("recharts", "react", "d3-scale-chromatic"):
        assert f"## {name} - " in text, name

#!/usr/bin/env bash
# Build the Qollab upload zips from an explicit allowlist and check Qollab limits.
#   dist/qollab-upload.zip       JS project (React page + Python package), no main.py
#   dist/qollab-fallback-py.zip  Python project (main.py), no index.html/main.js/main.css
set -euo pipefail

cd "$(dirname "$0")/.."

MAX_FILES=100
MAX_BYTES=2097152      # 2 MB per file
MAX_README_CHARS=65000
FORBIDDEN='__pycache__|\.DS_Store|node_modules|\.env|\.venv|\.planning|web/|credentials|\.pem$|\.key$|id_rsa|\.npmrc|\.netrc'
# Content scan (WR-06). Keyword assignments are case-insensitive; key shapes are exact.
SECRET_ASSIGN='(api[_-]?key|access[_-]?key|secret[_-]?key|client[_-]?secret|auth[_-]?token|access[_-]?token|token|secret|passw(or)?d)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"'[:space:]]{8,}'
SECRET_SHAPES='AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|xox[abprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'

fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== Building main.js / main.css"
npm --prefix web ci
npm --prefix web run build

mkdir -p dist
rm -f dist/qollab-upload.zip dist/qollab-fallback-py.zip

shopt -s nullglob
PY_FILES=(magnav/*.py)
shopt -u nullglob
[ "${#PY_FILES[@]}" -gt 0 ] || fail "no magnav/*.py files found"
# Explicit allowlist: Qollab preloads a data file only if its path is a literal in the
# Python code, so every entry here must also appear verbatim in magnav/*.py.
DATA_FILES=(data/smoke.json)
for f in "${DATA_FILES[@]}"; do
  [ -f "$f" ] || fail "data entry is not a regular file: $f"
done

COMMON=(requirements.txt LICENSE README.md "${PY_FILES[@]}" "${DATA_FILES[@]}")
# main.py stays out of the JS upload: if Qollab ran it, it could take the run's one IonQ job.
UPLOAD=(index.html main.js main.css "${COMMON[@]}")
FALLBACK=(main.py "${COMMON[@]}")

check_sources() {
  local f size
  for f in "$@"; do
    [ -f "$f" ] || fail "allowlisted file missing: $f"
    size=$(wc -c < "$f" | tr -d ' ')
    [ "$size" -lt "$MAX_BYTES" ] || fail "$f is $size bytes (limit < $MAX_BYTES)"
  done
  local chars
  chars=$(wc -m < README.md | tr -d ' ')
  [ "$chars" -lt "$MAX_README_CHARS" ] || fail "README.md has $chars characters (limit < $MAX_README_CHARS)"
}

check_zip() {
  local zip="$1" listing count
  listing=$(zipinfo -1 "$zip")
  count=$(printf '%s\n' "$listing" | grep -c . || true)
  [ "$count" -le "$MAX_FILES" ] || fail "$zip has $count entries (limit $MAX_FILES)"
  if printf '%s\n' "$listing" | grep -qE "$FORBIDDEN"; then
    printf '%s\n' "$listing" | grep -E "$FORBIDDEN" >&2
    fail "$zip contains forbidden entries (pattern: $FORBIDDEN)"
  fi
  echo "== $zip ($count entries)"
  printf '%s\n' "$listing"
}

# Exact, literal match. No -q: an early grep exit would SIGPIPE zipinfo and trip pipefail.
has_entry() { zipinfo -1 "$1" | grep -xF -- "$2" >/dev/null; }

scan_secrets() {
  local hits
  hits=$( { grep -nIiE -- "$SECRET_ASSIGN" "$@" || true; grep -nIE -- "$SECRET_SHAPES" "$@" || true; } | cut -c1-200)
  if [ -n "$hits" ]; then
    printf '%s\n' "$hits" >&2
    fail "possible secret in files to be zipped (see matches above)"
  fi
}

check_sources "${UPLOAD[@]}" main.py
scan_secrets "${UPLOAD[@]}" main.py

zip -X -q dist/qollab-upload.zip "${UPLOAD[@]}"
zip -X -q dist/qollab-fallback-py.zip "${FALLBACK[@]}"

check_zip dist/qollab-upload.zip
check_zip dist/qollab-fallback-py.zip

for f in index.html main.js; do
  has_entry dist/qollab-upload.zip "$f" || fail "dist/qollab-upload.zip is missing $f"
  if has_entry dist/qollab-fallback-py.zip "$f"; then
    fail "dist/qollab-fallback-py.zip must not contain $f (it would run as a JS project)"
  fi
done
has_entry dist/qollab-fallback-py.zip main.py || fail "dist/qollab-fallback-py.zip is missing main.py"
if has_entry dist/qollab-upload.zip main.py; then
  fail "dist/qollab-upload.zip must not contain main.py (it could use the run's one IonQ job)"
fi

ls -l dist/qollab-upload.zip dist/qollab-fallback-py.zip
echo "OK: dist/qollab-fallback-py.zip ready (Python-project fallback)"
echo "OK: dist/qollab-upload.zip ready to upload"

#!/usr/bin/env bash
# Run every content check. Browser test needs a static server on :8790 at the
# repo root (python3 -m http.server 8790) and Playwright.
set -e
cd "$(dirname "$0")/../../.."
node app/addmath/tests/validate-content.mjs >/dev/null && echo "validate-content: OK"
node app/addmath/tests/validator-selftest.mjs | tail -1
node app/addmath/tests/validate-notes.mjs app/addmath/tests/last-notes-report.md >/dev/null && echo "validate-notes: OK (report: app/addmath/tests/last-notes-report.md)"
node app/addmath/tests/regression.mjs | tail -1
node app/addmath/tests/checker-roundtrip.mjs

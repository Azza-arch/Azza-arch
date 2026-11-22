"""Current crate regression entry point.

V9.9 supersedes the old coordinate-specific print-only diagnostics with
asserted natural-input tests: both push directions, switch activation and
retraction, nontrivial ledge/coin access, reset, fall recovery, persistence,
and the remote-contact regression. Original script is in the audit backup.
"""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('v9_9_ab_geometry.py')), run_name='__main__')

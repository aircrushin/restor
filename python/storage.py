"""Filesystem helpers for upload/output storage.

Files live under ``<repo>/tmp/`` so the Next.js layer can read the same paths
when streaming completed audio back to the browser.
"""

from __future__ import annotations

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TMP_ROOT = REPO_ROOT / "tmp"
UPLOAD_DIR = TMP_ROOT / "uploads"
OUTPUT_DIR = TMP_ROOT / "outputs"


def ensure_dirs() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def upload_path(job_id: str, ext: str) -> Path:
    return UPLOAD_DIR / f"{job_id}{_normalize_ext(ext)}"


def output_path(job_id: str) -> Path:
    return OUTPUT_DIR / f"{job_id}.wav"


def _normalize_ext(ext: str) -> str:
    ext = (ext or "").strip().lower()
    if not ext:
        return ".wav"
    if not ext.startswith("."):
        ext = "." + ext
    return ext


def safe_remove(path: Path) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
    except OSError:
        pass

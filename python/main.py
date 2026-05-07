"""FastAPI orchestrator for Audio De-AI Processor.

Endpoints:
    POST /process     -- accept an uploaded audio file + module flags, kick off
                         a background processing task, return ``{ job_id }``.
    GET  /jobs/{id}   -- return job status JSON.
    GET  /jobs/{id}/download
                       -- stream the processed WAV output once status is done.
    GET  /health      -- liveness probe.

The job store is an in-memory dict keyed by job UUID. Restarting the worker
clears jobs; this is intentional for the MVP scope (no auth, no billing yet).
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import traceback
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

import numpy as np
import soundfile as sf
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from processors.adaptive import (
    adapt_module_intensities,
    analyze_content,
    match_loudness,
    measure_loudness_db,
)
from processors.humanizer import humanize_rhythm
from processors.phase import randomize_phase
from processors.spectral import reshape_spectrum
from processors.watermark import wash_watermark
from storage import ensure_dirs, output_path, safe_remove, upload_path

logger = logging.getLogger("audio-deai")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


@dataclass
class JobOptions:
    spectral: bool = True
    humanizer: bool = True
    phase: bool = True
    watermark: bool = False
    adaptive: bool = True
    loudness_match: bool = True
    intensity: float = 0.6  # 0..1 strength multiplier shared by all modules


@dataclass
class JobRecord:
    id: str
    status: str = "queued"  # queued | processing | done | error
    progress: int = 0
    stage: str = "queued"
    error: Optional[str] = None
    duration_ms: Optional[int] = None
    sample_rate: Optional[int] = None
    output_size_bytes: Optional[int] = None
    upload_path: Optional[str] = None
    output_path: Optional[str] = None
    options: JobOptions = field(default_factory=JobOptions)
    content_type: Optional[str] = None
    content_confidence: Optional[float] = None
    input_loudness_db: Optional[float] = None
    output_loudness_db: Optional[float] = None
    module_intensities: dict[str, float] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)


JOBS: dict[str, JobRecord] = {}

app = FastAPI(title="Audio De-AI Processor", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    ensure_dirs()
    logger.info("Audio De-AI worker ready")


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "jobs": len(JOBS)}


@app.post("/process")
async def process(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    options: str = Form("{}"),
) -> JSONResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="missing filename")

    try:
        opts_dict = json.loads(options or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"invalid options json: {exc}")

    job_id = uuid.uuid4().hex
    suffix = Path(file.filename).suffix or ".wav"
    in_path = upload_path(job_id, suffix)
    out_path = output_path(job_id)

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="empty file")
    in_path.write_bytes(contents)

    record = JobRecord(
        id=job_id,
        upload_path=str(in_path),
        output_path=str(out_path),
        options=JobOptions(
            spectral=bool(opts_dict.get("spectral", True)),
            humanizer=bool(opts_dict.get("humanizer", True)),
            phase=bool(opts_dict.get("phase", True)),
            watermark=bool(opts_dict.get("watermark", False)),
            adaptive=bool(opts_dict.get("adaptive", True)),
            loudness_match=bool(opts_dict.get("loudness_match", True)),
            intensity=float(opts_dict.get("intensity", 0.6)),
        ),
    )
    JOBS[job_id] = record

    background.add_task(_run_pipeline, job_id)
    return JSONResponse({"job_id": job_id, "status": record.status})


@app.get("/jobs/{job_id}")
async def get_job(job_id: str) -> dict:
    record = JOBS.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="job not found")
    payload = asdict(record)
    payload["options"] = asdict(record.options)
    return payload


@app.get("/jobs/{job_id}/download")
async def download(job_id: str) -> FileResponse:
    record = JOBS.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="job not found")
    if record.status != "done" or not record.output_path:
        raise HTTPException(status_code=409, detail=f"job is {record.status}")
    out = Path(record.output_path)
    if not out.exists():
        raise HTTPException(status_code=410, detail="output expired")
    return FileResponse(
        path=out,
        media_type="audio/wav",
        filename=f"deai-{job_id}.wav",
    )


async def _run_pipeline(job_id: str) -> None:
    record = JOBS.get(job_id)
    if not record or not record.upload_path or not record.output_path:
        return

    record.status = "processing"
    record.stage = "loading"
    record.progress = 5

    try:
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, _run_pipeline_blocking, record)
        record.duration_ms = result["duration_ms"]
        record.sample_rate = result["sample_rate"]
        record.output_size_bytes = result["size"]
        record.progress = 100
        record.stage = "done"
        record.status = "done"
        logger.info("job %s done in %dms", job_id, record.duration_ms or 0)
    except Exception as exc:  # noqa: BLE001
        logger.error("job %s failed: %s\n%s", job_id, exc, traceback.format_exc())
        record.status = "error"
        record.stage = "error"
        record.error = str(exc)
    finally:
        if record.upload_path:
            safe_remove(Path(record.upload_path))


def _run_pipeline_blocking(record: JobRecord) -> dict:
    started = time.time()
    audio, sr = sf.read(record.upload_path, always_2d=False)
    if audio.ndim == 2:
        audio = np.mean(audio, axis=1)
    audio = audio.astype(np.float32, copy=False)
    reference_audio = audio.copy()

    opts = record.options
    intensity = max(0.0, min(1.0, opts.intensity))

    record.stage = "analysis"
    record.progress = 12
    profile = analyze_content(reference_audio, sr)
    record.content_type = profile.content_type
    record.content_confidence = round(profile.confidence, 3)
    record.input_loudness_db = round(measure_loudness_db(reference_audio, sr), 2)

    module_intensities = (
        adapt_module_intensities(profile, intensity)
        if opts.adaptive
        else {
            "spectral": intensity,
            "humanizer": intensity,
            "phase": intensity,
            "watermark": intensity,
        }
    )
    record.module_intensities = {
        key: round(value, 3) for key, value in module_intensities.items()
    }

    record.stage = "spectral"
    record.progress = 20
    if opts.spectral:
        audio = reshape_spectrum(audio, sr=sr, intensity=module_intensities["spectral"])

    record.stage = "humanizer"
    record.progress = 45
    if opts.humanizer:
        audio = humanize_rhythm(audio, sr=sr, intensity=module_intensities["humanizer"])

    record.stage = "phase"
    record.progress = 70
    if opts.phase:
        audio = randomize_phase(audio, sr=sr, intensity=module_intensities["phase"])

    record.stage = "watermark"
    record.progress = 88
    if opts.watermark:
        audio = wash_watermark(audio, sr=sr, intensity=module_intensities["watermark"])

    record.stage = "loudness"
    record.progress = 92
    if opts.loudness_match:
        audio = match_loudness(audio, reference_audio, sr)

    peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if peak > 1.0:
        audio = audio / peak * 0.985
    record.output_loudness_db = round(measure_loudness_db(audio, sr), 2)

    record.stage = "writing"
    record.progress = 95
    sf.write(record.output_path, audio.astype(np.float32, copy=False), sr, subtype="PCM_16")

    return {
        "duration_ms": int((time.time() - started) * 1000),
        "sample_rate": int(sr),
        "size": Path(record.output_path).stat().st_size,
    }

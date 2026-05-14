# Restor — Audio De-AI Processor

Strip the AI signature off generated music and voice. Four DSP modules — spectral
reshaping, rhythm humanization, phase entropy injection, watermark wash — run as a
Python worker behind a Next.js front-end.

## Stack

- **Frontend / API gateway**: Next.js 16 (App Router) + React 19 + Tailwind v4
- **Worker**: FastAPI + librosa + scipy + numpy

## Layout

```
app/                Next.js App Router (pages + API routes)
components/         Client components (dropzone, options, status card)
lib/python-client.ts  Typed fetch wrapper for the FastAPI worker
python/             FastAPI app + DSP modules
tmp/                Auto-created upload + output scratch space
```

## Local development

Open two terminals.

### 1. Python worker

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Next.js

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

The Next.js layer talks to `http://127.0.0.1:8000` by default. Override with the
`PYTHON_API_URL` environment variable.

## Pipeline

Each module is independently toggleable. The worker first profiles the source as
speech, music, percussive, or ambient, then scales module intensity for that
content type. Order is fixed: analysis → spectral → humanizer → phase →
watermark → loudness match → optional clip-safe mastering. Content analysis uses a mono mix, while processing
preserves the original channel count. WAV uploads keep their source PCM/float
subtype on output, so an uncompressed WAV retains the same sample rate, duration,
channel count, and bit depth instead of being downmixed or forced to 16-bit.
Watermark Wash is available as an opt-in module and stays off by default to
preserve musical detail.

| Module     | Purpose                                                            |
| ---------- | ------------------------------------------------------------------ |
| Spectral   | Notch periodic vocoder peaks + add tape/tube saturation            |
| Humanizer  | Onset jitter (±4–16 ms) + per-onset velocity drift                 |
| Phase      | Mid/high-band phase entropy + small synthetic room IR              |
| Watermark  | Diffusion-style re-noising + upper-band magnitude/phase wobble     |
| Mastering  | Conservative glue compression, loudness lift, and -1 dBFS ceiling  |

## Storage

Uploads land in `tmp/uploads/{jobId}.{ext}` and are removed after processing.
Outputs sit in `tmp/outputs/{jobId}.wav` until the worker restarts. Jobs live in
an in-memory dict — restart the worker and they vanish. This is intentional for
the MVP.

## Use responsibly

Restor is intended for legitimate creators who don't want their work
miscategorized by detectors. Don't use it to commit fraud, impersonate
people, or distribute copyrighted material you don't own.

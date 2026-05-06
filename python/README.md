# Audio De-AI Processor — Python Worker

FastAPI service that runs the four DSP modules behind the SaaS.

## Run locally

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Next.js dev server (`npm run dev` from the repo root) proxies upload and
status requests here. Set `PYTHON_API_URL` if you bind to a different host.

## Endpoints

| Method | Path                       | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| POST   | `/process`                 | Multipart `file` + JSON `options` field  |
| GET    | `/jobs/{id}`               | Job status JSON                          |
| GET    | `/jobs/{id}/download`      | Stream finished WAV (only when `done`)   |
| GET    | `/health`                  | Liveness                                 |

## Processing modules

- `processors/adaptive.py` – content profiling, module intensity scaling, and loudness matching.
- `processors/spectral.py` – removes vocoder peaks, adds tape/tube saturation.
- `processors/humanizer.py` – per-onset jitter + velocity variation.
- `processors/phase.py` – mid/high-band phase entropy + room IR convolution.
- `processors/watermark.py` – diffusion-style re-noising to disrupt SynthID-class watermarks.

All modules accept `(audio: np.ndarray, sr: int, intensity: float)` and return
a float32 mono array of the same length.

"""Rhythm humanizer.

Goal: break the perfect mathematical grid that AI music generators ride on by
adding micro-jitter (tens of ms) and small amplitude/velocity variations to
each beat segment.

Approach:
    1. Detect onsets with ``librosa``.
    2. Slice the signal at onset boundaries.
    3. For each slice apply a small random time shift (window slide, no pitch
       change) and gain perturbation.
    4. Crossfade re-stitched chunks so we don't introduce clicks.
"""

from __future__ import annotations

import librosa
import numpy as np


def humanize_rhythm(audio: np.ndarray, sr: int, intensity: float = 0.6) -> np.ndarray:
    if audio.size == 0:
        return audio

    rng = np.random.default_rng()

    onset_frames = librosa.onset.onset_detect(
        y=audio,
        sr=sr,
        backtrack=True,
        units="samples",
        hop_length=256,
    )
    onsets = np.concatenate([[0], onset_frames, [audio.size]])
    onsets = np.unique(np.clip(onsets, 0, audio.size))
    if onsets.size < 3:
        return _global_jitter(audio, sr, intensity, rng)

    max_shift = int(sr * (0.004 + 0.012 * intensity))  # 4-16ms
    velocity_sigma = 0.02 + 0.08 * intensity
    crossfade = max(8, int(sr * 0.0015))

    out = np.zeros_like(audio)
    cursor = 0
    for i in range(onsets.size - 1):
        start = int(onsets[i])
        end = int(onsets[i + 1])
        if end - start < crossfade * 3:
            continue
        chunk = audio[start:end].copy()

        shift = int(rng.normal(0, max_shift / 2))
        gain = 1.0 + rng.normal(0, velocity_sigma)
        gain = float(np.clip(gain, 0.7, 1.25))
        chunk *= gain

        target = max(0, cursor + shift)
        if target + chunk.size > out.size:
            chunk = chunk[: out.size - target]
            if chunk.size <= 0:
                break

        if target > 0 and crossfade > 0 and target < out.size:
            fade_n = min(crossfade, chunk.size, target)
            if fade_n > 0:
                fade_in = np.linspace(0, 1, fade_n, dtype=np.float32)
                fade_out = 1 - fade_in
                head = out[target:target + fade_n]
                if head.size == fade_n:
                    out[target:target + fade_n] = head * fade_out + chunk[:fade_n] * fade_in
                    out[target + fade_n:target + chunk.size] += chunk[fade_n:]
                else:
                    out[target:target + chunk.size] += chunk
            else:
                out[target:target + chunk.size] += chunk
        else:
            out[target:target + chunk.size] += chunk

        cursor = target + chunk.size

    if cursor < out.size:
        out[cursor:] = audio[cursor:]
    return out.astype(np.float32, copy=False)


def _global_jitter(audio: np.ndarray, sr: int, intensity: float, rng: np.random.Generator) -> np.ndarray:
    """Fallback if onset detection finds nothing — split into fixed slices."""

    chunk_n = max(1, int(sr * (0.18 - 0.06 * intensity)))
    out = np.zeros_like(audio)
    cursor = 0
    max_shift = int(sr * (0.004 + 0.01 * intensity))
    for start in range(0, audio.size, chunk_n):
        end = min(audio.size, start + chunk_n)
        chunk = audio[start:end].copy()
        chunk *= 1.0 + rng.normal(0, 0.04 * intensity)
        shift = int(rng.normal(0, max_shift / 2))
        target = max(0, cursor + shift)
        if target + chunk.size > out.size:
            chunk = chunk[: out.size - target]
            if chunk.size <= 0:
                break
        out[target:target + chunk.size] += chunk
        cursor = target + chunk.size
    return out.astype(np.float32, copy=False)

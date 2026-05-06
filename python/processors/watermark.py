"""Watermark washer.

Inspired by diffusion-style ``re-noising`` — we add a controlled Gaussian
perturbation, lightly blur it across time and frequency to mimic a single
forward / reverse diffusion micro-step, then blend back. This jitters the
fragile statistical signature SynthID-class watermarks rely on without
audibly degrading the signal.
"""

from __future__ import annotations

import numpy as np
from scipy.ndimage import gaussian_filter1d


def wash_watermark(audio: np.ndarray, sr: int, intensity: float = 0.6) -> np.ndarray:
    if audio.size == 0:
        return audio

    rng = np.random.default_rng()
    sigma_noise = (0.0008 + 0.0024 * intensity)

    # Time-domain re-noising
    noise = rng.standard_normal(audio.size).astype(np.float32) * sigma_noise
    noised = audio + noise

    # Diffusion-style smooth+subtract micro-step.
    blurred = gaussian_filter1d(noised, sigma=0.6 + 0.6 * intensity, mode="nearest")
    delta = noised - blurred
    reconstructed = noised - 0.4 * delta

    # Frequency-domain perturbation in upper band (where watermarks often sit).
    n_fft = 2048
    hop = 512
    pad = (-reconstructed.size) % hop
    padded = np.pad(reconstructed, (0, pad + n_fft))
    frames = np.lib.stride_tricks.sliding_window_view(padded, n_fft)[::hop]
    window = np.hanning(n_fft).astype(np.float32)
    spec = np.fft.rfft(frames * window, axis=-1)
    bins = spec.shape[1]
    freqs = np.linspace(0, sr / 2, bins)
    upper = freqs > min(sr / 2 - 1000, 6000)
    if upper.any():
        wob = 1.0 + rng.normal(0, 0.015 + 0.02 * intensity, size=spec[:, upper].shape)
        phase_jit = rng.normal(0, 0.05 + 0.07 * intensity, size=spec[:, upper].shape)
        spec[:, upper] = spec[:, upper] * wob * np.exp(1j * phase_jit)

    inv = np.fft.irfft(spec, n=n_fft, axis=-1) * window
    out = np.zeros(padded.shape[0], dtype=np.float32)
    norm = np.zeros_like(out)
    for i, frame in enumerate(inv):
        start = i * hop
        out[start:start + n_fft] += frame.astype(np.float32)
        norm[start:start + n_fft] += window ** 2
    norm = np.where(norm < 1e-8, 1.0, norm)
    reconstructed = (out / norm)[: audio.size]

    blend = 0.55 + 0.35 * intensity
    return ((1 - blend) * audio + blend * reconstructed).astype(np.float32, copy=False)

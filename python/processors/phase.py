"""Phase randomizer.

AI generators tend to have abnormally coherent phase across frequency bands —
real microphone recordings drift because of room reflections and propagation.
We raise phase entropy in mid/high bands and convolve with a tiny synthetic
room impulse response to mimic the stochastic tail of a real space.
"""

from __future__ import annotations

import numpy as np


def randomize_phase(audio: np.ndarray, sr: int, intensity: float = 0.6) -> np.ndarray:
    if audio.size == 0:
        return audio

    n_fft = 2048
    hop = 512
    pad = (-audio.size) % hop
    padded = np.pad(audio, (0, pad + n_fft))

    frames = np.lib.stride_tricks.sliding_window_view(padded, n_fft)[::hop]
    window = np.hanning(n_fft).astype(np.float32)
    spec = np.fft.rfft(frames * window, axis=-1)
    mag = np.abs(spec)
    phase = np.angle(spec)

    bins = spec.shape[1]
    freqs = np.linspace(0, sr / 2, bins)
    weight = np.clip((freqs - 1500.0) / 4000.0, 0.0, 1.0)

    rng = np.random.default_rng()
    sigma = (0.15 + 0.55 * intensity) * np.pi
    jitter = rng.normal(0, sigma, size=spec.shape)
    new_phase = phase + jitter * weight[None, :]
    spec_out = mag * np.exp(1j * new_phase)

    inv = np.fft.irfft(spec_out, n=n_fft, axis=-1) * window
    out = np.zeros(padded.shape[0], dtype=np.float32)
    norm = np.zeros_like(out)
    for i, frame in enumerate(inv):
        start = i * hop
        out[start:start + n_fft] += frame.astype(np.float32)
        norm[start:start + n_fft] += window ** 2
    norm = np.where(norm < 1e-8, 1.0, norm)
    reconstructed = (out / norm)[: audio.size]

    ir = _room_ir(sr, intensity)
    if ir.size > 1:
        wet = np.convolve(reconstructed, ir, mode="full")[: audio.size]
        mix = 0.12 + 0.18 * intensity
        reconstructed = (1 - mix) * reconstructed + mix * wet

    return reconstructed.astype(np.float32, copy=False)


def _room_ir(sr: int, intensity: float) -> np.ndarray:
    """Generate a small exponentially-decaying noise burst as a fake room IR."""

    duration = 0.04 + 0.12 * intensity
    n = int(sr * duration)
    rng = np.random.default_rng()
    t = np.linspace(0, 1, n, dtype=np.float32)
    decay = np.exp(-t * (8.0 - 4.0 * intensity))
    burst = rng.standard_normal(n).astype(np.float32) * decay
    burst[0] = 1.0
    burst /= np.max(np.abs(burst)) + 1e-9
    return burst * 0.6

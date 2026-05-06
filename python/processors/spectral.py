"""Spectral reshaping.

Goal: erase the periodic spectral comb left by transposed-convolution vocoders
and add the gentle, nonlinear character of analog tape / tube saturation so the
spectrum's MFCC contour drifts away from any AI-trained classifier.

Stages:
    1. STFT magnitude analysis.
    2. Peak detection on the average magnitude profile to find suspiciously
       periodic spectral peaks (a typical AI fingerprint).
    3. Notch filtering at those bins.
    4. Tube/tape style soft saturation (asymmetric ``tanh``).
"""

from __future__ import annotations

import numpy as np
from scipy.signal import find_peaks


def _periodic_peak_bins(spectrum: np.ndarray, sr: int) -> list[int]:
    """Find spectral bins that look like vocoder periodicity artifacts.

    A real recording's average magnitude spectrum is mostly smooth with broad
    formant bumps. AI vocoders tend to leave sharp, evenly-spaced peaks above
    ~3 kHz. We pick the top peaks in that band.
    """

    n_bins = spectrum.shape[0]
    freqs = np.linspace(0, sr / 2, n_bins)
    band_mask = (freqs > 3000) & (freqs < min(sr / 2 - 500, 16000))
    if not band_mask.any():
        return []

    target = spectrum.copy()
    target[~band_mask] = 0.0
    if target.max() <= 0:
        return []
    target = target / target.max()

    peaks, props = find_peaks(target, prominence=0.08, distance=4)
    if peaks.size == 0:
        return []

    top_n = min(8, peaks.size)
    order = np.argsort(props["prominences"])[::-1][:top_n]
    return peaks[order].tolist()


def reshape_spectrum(audio: np.ndarray, sr: int, intensity: float = 0.6) -> np.ndarray:
    """Apply spectral reshaping in place-style and return the new array."""

    if audio.size == 0:
        return audio

    n_fft = 2048
    hop = 512
    pad = n_fft - (audio.size % hop) % n_fft
    padded = np.pad(audio, (0, pad)) if pad else audio

    frames = np.lib.stride_tricks.sliding_window_view(padded, n_fft)[::hop]
    window = np.hanning(n_fft).astype(np.float32)
    spec = np.fft.rfft(frames * window, axis=-1)
    mag = np.abs(spec)
    avg_mag = mag.mean(axis=0)

    suspect_bins = _periodic_peak_bins(avg_mag, sr)

    notch_width = 2
    attenuation = 0.18 + 0.55 * intensity
    if suspect_bins:
        for b in suspect_bins:
            lo = max(0, b - notch_width)
            hi = min(spec.shape[1], b + notch_width + 1)
            spec[:, lo:hi] *= 1.0 - attenuation

    inv = np.fft.irfft(spec, n=n_fft, axis=-1) * window
    out = np.zeros(padded.shape[0] + n_fft, dtype=np.float32)
    norm = np.zeros_like(out)
    for i, frame in enumerate(inv):
        start = i * hop
        out[start:start + n_fft] += frame.astype(np.float32)
        norm[start:start + n_fft] += window ** 2
    norm = np.where(norm < 1e-8, 1.0, norm)
    reconstructed = (out / norm)[: audio.size]

    saturated = np.tanh(reconstructed * (1.0 + 0.6 * intensity)) * 0.92
    saturated = 0.5 * saturated + 0.5 * np.tanh(reconstructed * 0.85 + 0.04)
    out_arr = saturated.astype(np.float32)

    blend = 0.35 + 0.45 * intensity
    return ((1 - blend) * audio + blend * out_arr[: audio.size]).astype(np.float32)

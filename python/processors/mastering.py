"""Clip-safe one-click mastering."""

from __future__ import annotations

from math import log10

import numpy as np

from processors.adaptive import measure_loudness_db


DEFAULT_TARGET_LOUDNESS_DB = -14.0
DEFAULT_PEAK_CEILING = 0.89125094  # -1 dBFS


def master_audio(
    audio: np.ndarray,
    sr: int,
    *,
    target_loudness_db: float = DEFAULT_TARGET_LOUDNESS_DB,
    peak_ceiling: float = DEFAULT_PEAK_CEILING,
    max_boost_db: float = 6.0,
    max_cut_db: float = 12.0,
) -> np.ndarray:
    """Apply a conservative mastering pass without clipping the waveform."""

    if audio.size == 0:
        return audio.astype(np.float32, copy=False)

    safe_ceiling = float(np.clip(peak_ceiling, 0.1, 0.999))
    work = np.nan_to_num(np.asarray(audio, dtype=np.float32), copy=True)
    work = _remove_dc(work)
    work = _apply_glue_compression(work, sr)

    current_db = measure_loudness_db(_to_mono(work), sr)
    if current_db > -119.0:
        gain_db = float(
            np.clip(target_loudness_db - current_db, -max_cut_db, max_boost_db)
        )

        peak = _estimated_true_peak(work)
        if peak > 1e-8:
            peak_limited_gain_db = _amp_to_db(safe_ceiling / peak)
            # Keep the limiter from doing audible work. If there is not enough
            # peak headroom, choose cleanliness over extra loudness.
            gain_db = min(gain_db, peak_limited_gain_db + 1.0)

        work = work * np.float32(10.0 ** (gain_db / 20.0))

    work = _scale_to_peak_ceiling(work, safe_ceiling)
    return work.astype(np.float32, copy=False)


def _apply_glue_compression(audio: np.ndarray, sr: int) -> np.ndarray:
    if sr <= 0 or audio.size == 0:
        return audio.astype(np.float32, copy=False)

    mono = _to_mono(audio)
    frame = int(np.clip(round(sr * 0.025), 256, 4096))
    hop = max(1, frame // 2)
    if mono.size < frame:
        return audio.astype(np.float32, copy=False)

    starts = np.arange(0, mono.size, hop)
    padded = np.pad(mono, (0, frame), mode="constant")
    energy = np.concatenate(([0.0], np.cumsum(np.square(padded), dtype=np.float64)))
    ends = starts + frame
    rms = np.sqrt((energy[ends] - energy[starts]) / frame + 1e-12)
    level_db = 20.0 * np.log10(np.maximum(rms, 1e-6))

    threshold_db = -18.0
    ratio = 1.35
    over_db = level_db - threshold_db
    gain_reduction_db = np.where(over_db > 0.0, -(over_db * (1.0 - 1.0 / ratio)), 0.0)
    gain_reduction_db = np.maximum(gain_reduction_db, -2.5)

    if gain_reduction_db.size >= 5:
        kernel = np.hanning(7)
        kernel = kernel / np.sum(kernel)
        gain_reduction_db = np.convolve(gain_reduction_db, kernel, mode="same")

    centers = np.minimum(starts + frame // 2, mono.size - 1)
    points = np.concatenate(([0], centers, [mono.size - 1]))
    values = np.concatenate(([gain_reduction_db[0]], gain_reduction_db, [gain_reduction_db[-1]]))
    envelope_db = np.interp(np.arange(mono.size), points, values).astype(np.float32)
    gain = (10.0 ** (envelope_db / 20.0)).astype(np.float32)

    if audio.ndim == 1:
        return (audio * gain).astype(np.float32, copy=False)
    return (audio * gain[:, None]).astype(np.float32, copy=False)


def _remove_dc(audio: np.ndarray) -> np.ndarray:
    if audio.ndim == 1:
        return (audio - np.mean(audio, dtype=np.float64)).astype(np.float32, copy=False)
    means = np.mean(audio, axis=0, dtype=np.float64)
    return (audio - means).astype(np.float32, copy=False)


def _scale_to_peak_ceiling(audio: np.ndarray, peak_ceiling: float) -> np.ndarray:
    peak = _estimated_true_peak(audio)
    if peak <= peak_ceiling or peak <= 1e-8:
        return audio.astype(np.float32, copy=False)
    return (audio * np.float32(peak_ceiling / peak)).astype(np.float32, copy=False)


def _estimated_true_peak(audio: np.ndarray) -> float:
    sample_peak = float(np.max(np.abs(audio))) if audio.size else 0.0
    if audio.shape[0] < 2:
        return sample_peak
    midpoint_peak = float(np.max(np.abs((audio[:-1] + audio[1:]) * 0.5)))
    return max(sample_peak, midpoint_peak)


def _to_mono(audio: np.ndarray) -> np.ndarray:
    if audio.ndim == 1:
        return audio.astype(np.float32, copy=False)
    return np.mean(audio, axis=1).astype(np.float32, copy=False)


def _amp_to_db(value: float) -> float:
    return 20.0 * log10(max(float(value), 1e-8))

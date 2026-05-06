"""Content-aware module scaling and loudness matching."""

from __future__ import annotations

from dataclasses import dataclass
from math import log10

import librosa
import numpy as np
from scipy.signal import butter, sosfilt


MODULE_NAMES = ("spectral", "humanizer", "phase", "watermark")


@dataclass(frozen=True)
class ContentProfile:
    content_type: str
    confidence: float
    rms_db: float
    onset_rate: float
    spectral_flatness: float
    harmonic_ratio: float
    zero_crossing_rate: float


def analyze_content(audio: np.ndarray, sr: int) -> ContentProfile:
    """Classify the broad content type from lightweight audio features."""

    if audio.size == 0:
        return _profile("ambient", 0.5)

    y = np.asarray(audio, dtype=np.float32).reshape(-1)
    rms = float(np.sqrt(np.mean(np.square(y)))) if y.size else 0.0
    rms_db = _amp_to_db(rms)
    if rms < 1e-7:
        return ContentProfile("ambient", 0.9, rms_db, 0.0, 0.0, 0.0, 0.0)

    hop = 512
    duration = max(y.size / sr, 1e-6)
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y, hop_length=hop)))
    flatness = float(np.mean(librosa.feature.spectral_flatness(y=y, hop_length=hop)))

    onsets = librosa.onset.onset_detect(
        y=y,
        sr=sr,
        units="time",
        hop_length=hop,
        backtrack=False,
    )
    onset_rate = float(onsets.size / duration)

    harmonic, percussive = librosa.effects.hpss(y)
    harmonic_energy = float(np.mean(np.square(harmonic)))
    percussive_energy = float(np.mean(np.square(percussive)))
    harmonic_ratio = harmonic_energy / (harmonic_energy + percussive_energy + 1e-12)

    content_type, confidence = _classify_content(
        onset_rate=onset_rate,
        spectral_flatness=flatness,
        harmonic_ratio=harmonic_ratio,
        zero_crossing_rate=zcr,
    )
    return ContentProfile(
        content_type=content_type,
        confidence=confidence,
        rms_db=rms_db,
        onset_rate=onset_rate,
        spectral_flatness=flatness,
        harmonic_ratio=harmonic_ratio,
        zero_crossing_rate=zcr,
    )


def adapt_module_intensities(profile: ContentProfile, intensity: float) -> dict[str, float]:
    """Scale each DSP module for the detected content class."""

    base = _clamp01(float(intensity))
    multipliers = {
        "speech": {
            "spectral": 0.85,
            "humanizer": 0.25,
            "phase": 0.55,
            "watermark": 0.95,
        },
        "percussive": {
            "spectral": 0.75,
            "humanizer": 0.8,
            "phase": 0.45,
            "watermark": 0.75,
        },
        "ambient": {
            "spectral": 0.65,
            "humanizer": 0.15,
            "phase": 0.45,
            "watermark": 0.65,
        },
        "music": {
            "spectral": 1.0,
            "humanizer": 0.8,
            "phase": 0.75,
            "watermark": 0.85,
        },
    }

    selected = multipliers.get(profile.content_type, multipliers["music"])
    confidence = _clamp01(profile.confidence)
    adapted: dict[str, float] = {}
    for name in MODULE_NAMES:
        target = base * selected[name]
        # Low-confidence classifications stay closer to the user's global value.
        adapted[name] = _clamp01(base * (1.0 - confidence) + target * confidence)
    return adapted


def measure_loudness_db(audio: np.ndarray, sr: int) -> float:
    """Approximate perceived loudness in dBFS using a light K-weighting pass."""

    if audio.size == 0:
        return -120.0

    y = np.asarray(audio, dtype=np.float32).reshape(-1)
    if not np.any(y):
        return -120.0

    weighted = _k_weight(y, sr)
    rms = float(np.sqrt(np.mean(np.square(weighted))))
    return _amp_to_db(rms)


def match_loudness(
    processed: np.ndarray,
    reference: np.ndarray,
    sr: int,
    *,
    peak_ceiling: float = 0.985,
    max_gain_db: float = 18.0,
) -> np.ndarray:
    """Gain-match processed audio back to the reference loudness."""

    if processed.size == 0:
        return processed.astype(np.float32, copy=False)

    target_db = measure_loudness_db(reference, sr)
    current_db = measure_loudness_db(processed, sr)
    if target_db <= -119.0 or current_db <= -119.0:
        return processed.astype(np.float32, copy=False)

    gain_db = float(np.clip(target_db - current_db, -max_gain_db, max_gain_db))
    gain = 10.0 ** (gain_db / 20.0)
    matched = np.asarray(processed, dtype=np.float32) * gain

    peak = float(np.max(np.abs(matched))) if matched.size else 0.0
    if peak > peak_ceiling:
        matched = matched / peak * peak_ceiling
    return matched.astype(np.float32, copy=False)


def _classify_content(
    *,
    onset_rate: float,
    spectral_flatness: float,
    harmonic_ratio: float,
    zero_crossing_rate: float,
) -> tuple[str, float]:
    if onset_rate >= 6.0 and harmonic_ratio < 0.35:
        return "percussive", min(0.95, 0.55 + (onset_rate - 6.0) / 10.0)
    if onset_rate <= 3.2 and spectral_flatness < 0.18 and zero_crossing_rate < 0.12:
        return "speech", min(0.9, 0.55 + (0.18 - spectral_flatness))
    if onset_rate < 1.2 and (spectral_flatness > 0.22 or harmonic_ratio > 0.65):
        return "ambient", 0.7
    return "music", 0.6


def _k_weight(audio: np.ndarray, sr: int) -> np.ndarray:
    if sr <= 120:
        return audio

    nyquist = sr / 2.0
    highpass_hz = min(80.0, nyquist * 0.45)
    sos = butter(2, highpass_hz / nyquist, btype="highpass", output="sos")
    weighted = sosfilt(sos, audio).astype(np.float32)

    shelf_hz = min(4000.0, nyquist * 0.75)
    if shelf_hz <= 0:
        return weighted

    sos = butter(1, shelf_hz / nyquist, btype="highpass", output="sos")
    highs = sosfilt(sos, weighted).astype(np.float32)
    return weighted + highs * 0.25


def _amp_to_db(value: float) -> float:
    return 20.0 * log10(max(float(value), 1e-6))


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _profile(content_type: str, confidence: float) -> ContentProfile:
    return ContentProfile(content_type, confidence, -120.0, 0.0, 0.0, 0.0, 0.0)

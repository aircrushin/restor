import unittest

import numpy as np

from processors.adaptive import (
    ContentProfile,
    adapt_module_intensities,
    match_loudness,
    measure_loudness_db,
)


class AdaptiveAudioTests(unittest.TestCase):
    def test_speech_profile_protects_timing_and_keeps_watermark_wash(self):
        profile = ContentProfile(
            content_type="speech",
            confidence=0.8,
            rms_db=-24.0,
            onset_rate=2.0,
            spectral_flatness=0.08,
            harmonic_ratio=0.35,
            zero_crossing_rate=0.07,
        )

        intensities = adapt_module_intensities(profile, 0.8)

        self.assertLess(intensities["humanizer"], 0.35)
        self.assertGreaterEqual(intensities["watermark"], 0.7)
        self.assertLess(intensities["phase"], intensities["watermark"])

    def test_percussive_profile_limits_phase_smear_but_keeps_timing_variation(self):
        profile = ContentProfile(
            content_type="percussive",
            confidence=0.75,
            rms_db=-18.0,
            onset_rate=9.0,
            spectral_flatness=0.32,
            harmonic_ratio=0.12,
            zero_crossing_rate=0.12,
        )

        intensities = adapt_module_intensities(profile, 0.7)

        self.assertGreater(intensities["humanizer"], intensities["phase"])
        self.assertLessEqual(intensities["phase"], 0.45)
        self.assertGreater(intensities["spectral"], 0.4)

    def test_loudness_matching_restores_target_without_clipping(self):
        sr = 48_000
        t = np.arange(sr, dtype=np.float32) / sr
        original = 0.12 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
        processed = original * 3.0

        matched = match_loudness(processed, original, sr, peak_ceiling=0.98)

        self.assertLess(abs(measure_loudness_db(matched, sr) - measure_loudness_db(original, sr)), 0.25)
        self.assertLessEqual(float(np.max(np.abs(matched))), 0.98)

    def test_loudness_matching_leaves_silence_stable(self):
        sr = 16_000
        silence = np.zeros(sr, dtype=np.float32)

        matched = match_loudness(silence, silence, sr)

        self.assertTrue(np.all(np.isfinite(matched)))
        self.assertTrue(np.array_equal(matched, silence))


if __name__ == "__main__":
    unittest.main()

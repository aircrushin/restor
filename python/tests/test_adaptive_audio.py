import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import soundfile as sf

from processors.adaptive import (
    ContentProfile,
    adapt_module_intensities,
    match_loudness,
    measure_loudness_db,
)
from processors.mastering import DEFAULT_PEAK_CEILING, master_audio
from main import JobOptions, JobRecord, _run_pipeline_blocking


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

    def test_music_profile_uses_conservative_module_intensities(self):
        profile = ContentProfile(
            content_type="music",
            confidence=0.8,
            rms_db=-16.0,
            onset_rate=3.5,
            spectral_flatness=0.12,
            harmonic_ratio=0.55,
            zero_crossing_rate=0.08,
        )

        intensities = adapt_module_intensities(profile, 0.8)

        self.assertLessEqual(intensities["spectral"], 0.65)
        self.assertLessEqual(intensities["humanizer"], 0.45)
        self.assertLessEqual(intensities["phase"], 0.42)
        self.assertLessEqual(intensities["watermark"], 0.4)
        self.assertLess(intensities["watermark"], intensities["spectral"])

    def test_watermark_wash_is_disabled_by_default(self):
        self.assertFalse(JobOptions().watermark)

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

    def test_mastering_boosts_quiet_audio_without_clipping(self):
        sr = 48_000
        t = np.arange(sr, dtype=np.float32) / sr
        quiet = (0.025 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)

        mastered = master_audio(quiet, sr)

        self.assertGreater(measure_loudness_db(mastered, sr), measure_loudness_db(quiet, sr))
        self.assertLessEqual(float(np.max(np.abs(mastered))), DEFAULT_PEAK_CEILING + 1e-6)
        self.assertTrue(np.all(np.isfinite(mastered)))

    def test_mastering_reins_in_hot_audio_without_sample_clipping(self):
        sr = 48_000
        t = np.arange(sr, dtype=np.float32) / sr
        hot = (
            0.7 * np.sin(2 * np.pi * 90 * t)
            + 0.45 * np.sin(2 * np.pi * 1100 * t)
            + 0.2 * np.sin(2 * np.pi * 6100 * t)
        ).astype(np.float32)
        hot = np.column_stack([hot, hot * 0.92]).astype(np.float32)

        mastered = master_audio(hot, sr)

        self.assertLessEqual(float(np.max(np.abs(mastered))), DEFAULT_PEAK_CEILING + 1e-6)
        self.assertTrue(np.all(np.isfinite(mastered)))
        self.assertEqual(mastered.shape, hot.shape)

    def test_wav_output_preserves_channels_subtype_and_frame_count(self):
        sr = 48_000
        frames = sr // 2
        t = np.arange(frames, dtype=np.float32) / sr
        audio = np.column_stack(
            [
                0.15 * np.sin(2 * np.pi * 220 * t),
                0.12 * np.sin(2 * np.pi * 330 * t),
            ]
        ).astype(np.float32)

        with TemporaryDirectory() as tmp:
            upload = Path(tmp) / "input.wav"
            output = Path(tmp) / "output.wav"
            sf.write(upload, audio, sr, subtype="PCM_24")

            record = JobRecord(
                id="test",
                upload_path=str(upload),
                output_path=str(output),
                options=JobOptions(
                    spectral=False,
                    humanizer=False,
                    phase=False,
                    watermark=False,
                    loudness_match=False,
                ),
            )

            result = _run_pipeline_blocking(record)
            info = sf.info(output)
            output_size = output.stat().st_size
            upload_size = upload.stat().st_size

        self.assertEqual(result["sample_rate"], sr)
        self.assertEqual(info.channels, 2)
        self.assertEqual(info.frames, frames)
        self.assertEqual(info.subtype, "PCM_24")
        self.assertEqual(output_size, upload_size)


if __name__ == "__main__":
    unittest.main()

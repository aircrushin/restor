"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ACCEPTED_EXT = [".wav", ".mp3", ".flac", ".m4a", ".aac", ".ogg"];
const ACCEPTED_HUMAN = "WAV / MP3 / FLAC / M4A / AAC / OGG";
const MAX_BYTES = 60 * 1024 * 1024;

type Copy = {
  unsupported: string;
  tooLargePrefix: string;
  tooLargeSuffix: string;
  title: string;
  browsePrefix: string;
  browseAction: string;
  privacy: string;
  clear: string;
};

type Props = {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  copy?: Copy;
};

const defaultCopy: Copy = {
  unsupported: `Unsupported format. Use ${ACCEPTED_HUMAN}.`,
  tooLargePrefix: "File too large",
  tooLargeSuffix: "Max 60 MB.",
  title: "Drop an audio file here",
  browsePrefix: "or",
  browseAction: "click to browse",
  privacy: "MAX 60 MB · 100% private · auto-purged",
  clear: "clear",
};

export function AudioDropzone({ file, onFile, disabled = false, copy = defaultCopy }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!file) {
      queueMicrotask(() => {
        if (!cancelled) setWaveform(null);
      });
      return () => {
        cancelled = true;
      };
    }
    extractWaveform(file).then((peaks) => {
      if (!cancelled) setWaveform(peaks);
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const accept = useCallback(
    (f: File | null | undefined) => {
      setError(null);
      if (!f) return;
      const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
      if (!ACCEPTED_EXT.includes(ext)) {
        setError(copy.unsupported);
        return;
      }
      if (f.size > MAX_BYTES) {
        setError(`${copy.tooLargePrefix} (${(f.size / 1024 / 1024).toFixed(1)} MB). ${copy.tooLargeSuffix}`);
        return;
      }
      onFile(f);
    },
    [copy, onFile]
  );

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="w-full">
      <label
        htmlFor="audio-input"
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          "relative block overflow-hidden rounded-[var(--radius-xl)] border transition-all",
          "cursor-pointer select-none",
          disabled ? "opacity-60 pointer-events-none" : "",
          dragging
            ? "border-[var(--accent)] bg-[rgba(110,255,199,0.08)] glow-ring scan-line"
            : "border-[var(--line-strong)] bg-[var(--bg-elevated)]/70 hover:border-[var(--accent)]/40",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id="audio-input"
          type="file"
          accept={ACCEPTED_EXT.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => accept(e.currentTarget.files?.[0])}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:px-8 sm:py-14">
            <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[var(--bg-surface)] border border-[var(--line)] pulse-ring sm:h-20 sm:w-20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--accent)]">
                <path d="M12 3v12" strokeLinecap="round" />
                <path d="m6 9 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 21h16" strokeLinecap="round" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[var(--text-primary)]">
                {copy.title}
              </h3>
              <p className="mx-auto max-w-[28ch] text-sm leading-relaxed text-[var(--text-muted)] sm:max-w-none">
                {copy.browsePrefix} <span className="text-[var(--accent)] underline decoration-dotted underline-offset-4">{copy.browseAction}</span> · {ACCEPTED_HUMAN}
              </p>
              <p className="text-xs text-[var(--text-faint)] font-mono uppercase tracking-[0.14em] sm:tracking-[0.2em]">
                {copy.privacy}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30">
              <span className="text-[var(--accent-strong)] text-[10px] font-mono uppercase">
                {(file.name.split(".").pop() ?? "wav").slice(0, 4)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <span className="opacity-50">·</span>
                <span>{file.type || "audio/*"}</span>
              </div>
              <Waveform peaks={waveform} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-xs text-[var(--text-muted)] hover:border-[var(--danger)]/40 hover:text-[var(--danger)] transition-colors font-mono uppercase tracking-wider sm:border-0 sm:px-2"
            >
              {copy.clear}
            </button>
          </div>
        )}
      </label>

      {error && (
        <p className="mt-3 text-sm text-[var(--danger)] font-mono">{error}</p>
      )}
    </div>
  );
}

function Waveform({ peaks }: { peaks: number[] | null }) {
  if (!peaks) {
    return (
      <div className="mt-3 flex h-8 items-end gap-[2px] overflow-hidden">
        {Array.from({ length: 64 }).map((_, i) => (
          <span
            key={i}
            className="eq-bar"
            style={{
              animationDelay: `${(i % 8) * 0.08}s`,
              height: `${20 + (i % 5) * 6}%`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-3 flex h-8 items-center gap-[2px] overflow-hidden">
      {peaks.map((p, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-gradient-to-t from-[var(--accent-deep)] to-[var(--accent-strong)]"
          style={{ height: `${Math.max(6, p * 100)}%` }}
        />
      ))}
    </div>
  );
}

async function extractWaveform(file: File): Promise<number[]> {
  try {
    const arrayBuf = await file.arrayBuffer();
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return fallbackPeaks();
    const ctx = new Ctx();
    const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
    const channel = decoded.getChannelData(0);
    const buckets = 64;
    const step = Math.floor(channel.length / buckets);
    const peaks: number[] = [];
    for (let i = 0; i < buckets; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(channel.length, start + step);
      for (let j = start; j < end; j += 64) {
        const v = Math.abs(channel[j] ?? 0);
        if (v > max) max = v;
      }
      peaks.push(max);
    }
    ctx.close();
    const m = Math.max(...peaks, 0.0001);
    return peaks.map((p) => p / m);
  } catch {
    return fallbackPeaks();
  }
}

function fallbackPeaks(): number[] {
  return Array.from({ length: 64 }, (_, i) => 0.3 + 0.6 * Math.abs(Math.sin(i / 4)));
}

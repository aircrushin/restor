"use client";

import { useEffect, useRef, useState } from "react";
import type { JobRecord } from "@/lib/python-client";

type Props = {
  jobId: string;
};

const STAGES: { id: string; label: string }[] = [
  { id: "queued", label: "Queued" },
  { id: "loading", label: "Loading audio" },
  { id: "analysis", label: "Analyze content" },
  { id: "spectral", label: "Spectral reshape" },
  { id: "humanizer", label: "Humanizer" },
  { id: "phase", label: "Phase entropy" },
  { id: "watermark", label: "Wash watermark" },
  { id: "loudness", label: "Match loudness" },
  { id: "writing", label: "Encode WAV" },
  { id: "done", label: "Done" },
];

export function JobStatusCard({ jobId }: Props) {
  const [job, setJob] = useState<JobRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Job not found. It may have expired or the worker restarted.");
            return;
          }
          throw new Error(`status ${res.status}`);
        }
        const data = (await res.json()) as JobRecord;
        if (!aliveRef.current) return;
        setJob(data);
        setError(null);
        if (data.status === "done" || data.status === "error") return;
        setTimeout(tick, 1500);
      } catch (err) {
        if (!aliveRef.current) return;
        const message = err instanceof Error ? err.message : "polling failed";
        setError(message);
        setTimeout(tick, 3000);
      }
    };

    tick();
    return () => {
      aliveRef.current = false;
    };
  }, [jobId]);

  const stageIdx = STAGES.findIndex((s) => s.id === job?.stage);
  const isError = job?.status === "error";
  const isDone = job?.status === "done";

  return (
    <div className="glass space-y-6 rounded-[var(--radius-xl)] p-5 sm:space-y-7 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:gap-6">
        <div className="min-w-0 space-y-1">
          <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--text-faint)]">
            JOB · {jobId.slice(0, 12)}
          </div>
          <h2 className="text-xl font-medium text-[var(--text-primary)] sm:text-2xl">
            {isDone
              ? "Processing complete"
              : isError
                ? "Processing failed"
                : "De-AI pipeline running"}
          </h2>
          <p className="break-words text-sm text-[var(--text-muted)]">
            {isDone
              ? `Done in ${((job!.duration_ms ?? 0) / 1000).toFixed(1)}s · ${formatBytes(job!.output_size_bytes ?? 0)} output`
              : isError
                ? job?.error ?? "Unknown failure"
                : `Stage: ${prettyStage(job?.stage)}`}
          </p>
        </div>

        <StatusOrb status={job?.status ?? "queued"} progress={job?.progress ?? 0} />
      </div>

      <ProgressBar progress={job?.progress ?? 0} status={job?.status ?? "queued"} />

      <Pipeline currentIdx={stageIdx} status={job?.status ?? "queued"} />

      {isDone && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`/api/jobs/${jobId}?download=1`}
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-medium text-[var(--bg-base)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_24px_var(--accent-soft)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12" strokeLinecap="round" />
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 21h16" strokeLinecap="round" />
            </svg>
            Download .wav
          </a>
          <a
            href="/process"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--bg-surface)]/60 px-6 py-3 text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
          >
            Process another
          </a>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)] font-mono">
          <span>!</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const isError = status === "error";
  const isActive = status === "processing";
  const isDone = status === "done";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono uppercase tracking-[0.2em]">
        <span className="text-[var(--text-faint)]">PROGRESS</span>
        <span
          className={[
            "tabular-nums transition-colors duration-300",
            isError
              ? "text-[var(--danger)]"
              : isDone
                ? "text-[var(--accent-strong)]"
                : "text-[var(--accent)]",
          ].join(" ")}
          style={isActive ? { textShadow: "0 0 14px var(--accent)" } : undefined}
        >
          {progress}%
        </span>
      </div>

      {/* Outer wrapper — holds fill track + overflowing glow tip */}
      <div className="relative h-2 w-full">
        {/* Track — overflow:hidden clips fill & shimmer */}
        <div className="absolute inset-0 overflow-hidden rounded-full bg-[var(--bg-surface)] border border-[var(--line)]">
          {/* Segment tick marks */}
          {[25, 50, 75].map((p) => (
            <div
              key={p}
              aria-hidden
              className="absolute inset-y-0 w-px"
              style={{ left: `${p}%`, background: "rgba(255,255,255,0.07)" }}
            />
          ))}

          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              transition: "width 0.7s cubic-bezier(0.25,1,0.5,1)",
              background: isError
                ? "var(--danger)"
                : "linear-gradient(90deg, var(--accent-deep) 0%, var(--accent) 45%, var(--accent-strong) 70%, var(--accent) 100%)",
              backgroundSize: "250% 100%",
              animation: isActive ? "barFlow 2.4s linear infinite" : "none",
              boxShadow: isDone ? "0 0 8px 1px var(--accent-soft)" : "none",
            }}
          />

          {/* Shimmer sweep */}
          {isActive && (
            <div
              aria-hidden
              className="absolute inset-y-0 w-[55%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.10) 65%, transparent 100%)",
                animation: "shimmerPass 2.2s ease-in-out infinite",
              }}
            />
          )}
        </div>

        {/* Glowing leading-edge tip (outside overflow:hidden) */}
        {isActive && progress > 1 && progress < 99 && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 h-full"
            style={{
              left: `${progress}%`,
              transform: "translateX(-50%)",
              transition: "left 0.7s cubic-bezier(0.25,1,0.5,1)",
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full"
              style={{
                background: "var(--accent-strong)",
                animation: "tipFlare 1.5s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Pipeline({ currentIdx, status }: { currentIdx: number; status: string }) {
  return (
    <ol className="grid grid-cols-1 gap-x-6 gap-y-2 min-[380px]:grid-cols-2 md:grid-cols-4">
      {STAGES.filter((s) => s.id !== "queued").map((s, i) => {
        const reached = currentIdx >= i + 1 || status === "done";
        const active = STAGES[currentIdx]?.id === s.id;
        return (
          <li key={s.id} className="flex items-center gap-2 min-w-0">
            <span
              className={[
                "inline-block h-1.5 w-1.5 rounded-full transition-all",
                reached
                  ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                  : "bg-[var(--text-faint)]",
                active ? "animate-pulse" : "",
              ].join(" ")}
            />
            <span
              className={[
                "truncate text-xs font-mono uppercase tracking-[0.18em]",
                reached ? "text-[var(--text-secondary)]" : "text-[var(--text-faint)]",
              ].join(" ")}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StatusOrb({ status, progress }: { status: string; progress: number }) {
  const color =
    status === "error"
      ? "var(--danger)"
      : status === "done"
        ? "var(--accent-strong)"
        : "var(--accent)";

  const r = 28;
  const C = 2 * Math.PI * r;

  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * progress) / 100}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span
        className={[
          "absolute h-3 w-3 rounded-full",
          status === "processing" ? "animate-pulse" : "",
        ].join(" ")}
        style={{ background: color, boxShadow: `0 0 14px ${color}` }}
      />
    </div>
  );
}

function prettyStage(s: string | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

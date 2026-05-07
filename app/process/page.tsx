"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AudioDropzone } from "@/components/AudioDropzone";
import { ProcessingOptions } from "@/components/ProcessingOptions";
import type { JobOptions } from "@/lib/python-client";

export default function ProcessPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<JobOptions>({
    spectral: true,
    humanizer: true,
    phase: true,
    watermark: false,
    intensity: 0.6,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noModuleSelected =
    !options.spectral && !options.humanizer && !options.phase && !options.watermark;

  const submit = async () => {
    if (!file || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("options", JSON.stringify(options));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { job_id?: string; error?: string };
      if (!res.ok || !data.job_id) {
        throw new Error(data.error || `upload failed (${res.status})`);
      }
      router.push(`/jobs/${data.job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unexpected upload error");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <div className="relative mx-auto max-w-4xl px-6 pt-12 pb-24">
        <header className="mb-10 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
            CONFIG · PIPELINE
          </div>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Configure the run.
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Drop your audio, pick the modules to engage, dial intensity, and submit. The worker
            will stream progress here.
          </p>
        </header>

        <div className="space-y-10">
          <div className="space-y-3">
            <SectionLabel n="01" label="Source audio" />
            <AudioDropzone file={file} onFile={setFile} disabled={submitting} />
          </div>

          <div className="space-y-3">
            <SectionLabel n="02" label="Modules" />
            <ProcessingOptions value={options} onChange={setOptions} disabled={submitting} />
          </div>

          <div className="space-y-3">
            <SectionLabel n="03" label="Submit" />
            <div className="glass flex flex-col items-start gap-4 rounded-[var(--radius-lg)] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {file ? (
                    <>
                      Ready to process <span className="font-mono text-[var(--accent)]">{file.name}</span>.
                    </>
                  ) : (
                    "Add a file above to enable processing."
                  )}
                </div>
                {noModuleSelected && (
                  <div className="mt-1 text-xs font-mono text-[var(--warning)]">
                    No modules selected — output will pass through unchanged.
                  </div>
                )}
                {error && (
                  <div className="mt-2 text-xs font-mono text-[var(--danger)]">
                    {error}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={!file || submitting}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium transition-all",
                  !file || submitting
                    ? "bg-[var(--bg-surface)] text-[var(--text-faint)] cursor-not-allowed"
                    : "bg-[var(--accent)] text-[var(--bg-base)] hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)]",
                ].join(" ")}
              >
                {submitting ? (
                  <>
                    <Spinner /> Submitting…
                  </>
                ) : (
                  <>
                    Process audio
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-faint)]">
        {n}
      </span>
      <span className="h-px flex-1 bg-[var(--line)]" />
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

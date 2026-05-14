"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AudioDropzone } from "@/components/AudioDropzone";
import { ProcessingOptions } from "@/components/ProcessingOptions";
import { dictionaries, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import type { JobOptions } from "@/lib/python-client";

export default function ProcessPage() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang: Locale = isLocale(params.lang) ? params.lang : "en";
  const dict = dictionaries[lang];
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<JobOptions>({
    spectral: true,
    humanizer: true,
    phase: true,
    watermark: false,
    mastering: false,
    intensity: 0.6,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noModuleSelected =
    !options.spectral &&
    !options.humanizer &&
    !options.phase &&
    !options.watermark &&
    !options.mastering;

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
        throw new Error(data.error || `${dict.process.uploadFailed} (${res.status})`);
      }
      router.push(localizedPath(lang, `/jobs/${data.job_id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.process.uploadError);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <div className="relative mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
        <header className="mb-8 space-y-3 sm:mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
            {dict.process.eyebrow}
          </div>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {dict.process.title}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            {dict.process.description}
          </p>
        </header>

        <div className="space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <SectionLabel n="01" label={dict.process.source} />
            <AudioDropzone
              file={file}
              onFile={setFile}
              disabled={submitting}
              copy={dict.dropzone}
            />
          </div>

          <div className="space-y-3">
            <SectionLabel n="02" label={dict.process.modules} />
            <ProcessingOptions
              value={options}
              onChange={setOptions}
              disabled={submitting}
              copy={dict.options}
            />
          </div>

          <div className="space-y-3">
            <SectionLabel n="03" label={dict.process.submit} />
            <div className="glass flex flex-col items-stretch gap-4 rounded-[var(--radius-lg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <div className="text-sm text-[var(--text-secondary)]">
                  {file ? (
                    <>
                      {dict.process.readyPrefix}{" "}
                      <span className="break-all font-mono text-[var(--accent)]">{file.name}</span>
                      {dict.process.readySuffix}
                    </>
                  ) : (
                    dict.process.empty
                  )}
                </div>
                {noModuleSelected && (
                  <div className="mt-1 text-xs font-mono text-[var(--warning)]">
                    {dict.process.noModules}
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
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 font-medium transition-all",
                  !file || submitting
                    ? "bg-[var(--bg-surface)] text-[var(--text-faint)] cursor-not-allowed"
                    : "bg-[var(--accent)] text-[var(--bg-base)] hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)]",
                ].join(" ")}
              >
                {submitting ? (
                  <>
                    <Spinner /> {dict.process.submitting}
                  </>
                ) : (
                  <>
                    {dict.process.button}
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

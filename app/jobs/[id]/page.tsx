import { JobStatusCard } from "@/components/JobStatusCard";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[360px]" />

      <div className="relative mx-auto max-w-3xl px-6 pt-12 pb-24">
        <header className="mb-8 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
            RUN · STATUS
          </div>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            De-AI in progress.
          </h1>
          <p className="text-[var(--text-secondary)]">
            Live readout from the worker. We&apos;ll surface the download link as soon as the
            pipeline completes.
          </p>
        </header>
        <JobStatusCard jobId={id} />
      </div>
    </div>
  );
}

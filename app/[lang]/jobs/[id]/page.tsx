import { notFound } from "next/navigation";
import { JobStatusCard } from "@/components/JobStatusCard";
import { dictionaries, isLocale } from "@/lib/i18n";

export default async function JobPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = dictionaries[lang].job;

  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[360px]" />

      <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
        <header className="mb-8 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
            {dict.eyebrow}
          </div>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            {dict.title}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {dict.description}
          </p>
        </header>
        <JobStatusCard jobId={id} lang={lang} copy={dict} />
      </div>
    </div>
  );
}

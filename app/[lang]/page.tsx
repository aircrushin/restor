import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, localizedPath, type Locale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = dictionaries[lang].home;

  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 h-[640px]" />

      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-14">
          <div className="space-y-7">
            <Tag>{dict.tag}</Tag>
            <h1 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl md:text-7xl">
              {dict.titleLead}
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="gradient-text">{dict.titleAccent}</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              {dict.intro} <span className="text-[var(--text-primary)]">{dict.introBrand}</span>
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href={localizedPath(lang, "/process")}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 font-medium text-[var(--bg-base)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)]"
              >
                {dict.ctaPrimary}
                <ArrowIcon />
              </Link>
              <Link
                href="#how"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--bg-surface)]/40 px-6 py-3 text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                {dict.ctaSecondary}
              </Link>
            </div>

            <dl className="grid grid-cols-3 gap-3 pt-4 sm:gap-6 sm:pt-8">
              {dict.stats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </dl>
          </div>

          <div className="relative">
            <HeroVisual lang={lang} />
          </div>
        </div>
      </section>

      <Section id="how" eyebrow={dict.pipeline.eyebrow} title={dict.pipeline.title}>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {dict.pipeline.cards.map((card) => (
            <Card key={card.number} {...card} />
          ))}
        </div>
      </Section>

      <Section id="science" eyebrow={dict.science.eyebrow} title={dict.science.title}>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--line-soft)] md:grid-cols-2">
          {dict.science.rows.map((row) => (
            <ScienceRow
              key={row.label}
              labels={{
                fingerprint: dict.science.fingerprint,
                detector: dict.science.detector,
                counter: dict.science.counter,
              }}
              {...row}
            />
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="glass overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-10 md:p-14">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3">
              <h3 className="text-2xl font-medium sm:text-3xl">{dict.finalCta.title}</h3>
              <p className="text-[var(--text-secondary)]">{dict.finalCta.body}</p>
            </div>
            <Link
              href={localizedPath(lang, "/process")}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 font-medium text-[var(--bg-base)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)] sm:w-auto"
            >
              {dict.finalCta.button}
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent-strong)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-faint)]">
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-medium tracking-tight text-[var(--text-primary)] sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function Card({
  number,
  title,
  body,
  tag,
}: {
  number: string;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-elevated)]/60 p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-surface)]/80 sm:p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-3">
          <div className="font-mono text-[10px] tracking-[0.3em] text-[var(--text-faint)]">{number}</div>
          <h4 className="text-xl font-medium text-[var(--text-primary)]">{title}</h4>
          <p className="max-w-prose text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--line-strong)] bg-[var(--bg-base)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {tag}
        </span>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </article>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 max-w-3xl space-y-3 sm:mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
          {eyebrow}
        </div>
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ScienceRow({
  label,
  detector,
  counter,
  labels,
}: {
  label: string;
  detector: string;
  counter: string;
  labels: { fingerprint: string; detector: string; counter: string };
}) {
  return (
    <div className="grid gap-4 bg-[var(--bg-elevated)] p-5 sm:p-6 md:grid-cols-[140px_1fr_1fr] md:items-start md:gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-faint)]">
          {labels.fingerprint}
        </div>
        <div className="mt-1 text-base font-medium text-[var(--text-primary)]">{label}</div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--pulse)]">
          {labels.detector}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{detector}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
          {labels.counter}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{counter}</p>
      </div>
    </div>
  );
}

function HeroVisual({ lang }: { lang: Locale }) {
  const visual = dictionaries[lang].home.visual;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--bg-elevated)] drift md:max-w-none">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
      <div className="scan-line absolute inset-0" />
      <div className="absolute inset-0 grid place-items-center p-6 sm:p-10">
        <div className="grid h-full w-full place-items-center">
          <div className="relative grid h-full w-full place-items-center">
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-40 w-40 rounded-full border border-[var(--accent)]/30 pulse-ring sm:h-56 sm:w-56" />
            </div>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-52 w-52 rounded-full border border-[var(--signal)]/20 sm:h-72 sm:w-72" />
            </div>
            <div className="relative flex h-36 w-full max-w-[76%] items-end justify-center gap-[2px] sm:h-44 sm:max-w-[70%] sm:gap-[3px]">
              {Array.from({ length: 56 }).map((_, i) => (
                <span
                  key={i}
                  className="eq-bar"
                  style={{
                    height: `${20 + ((i * 7) % 80)}%`,
                    animationDelay: `${(i % 12) * 0.07}s`,
                    animationDuration: `${1.2 + (i % 5) * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
        {visual.analysis}
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
        {visual.live}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px] sm:tracking-[0.3em]">
        <span>fft 2048</span>
        <span>hop 512</span>
        <span>sr 44.1k</span>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

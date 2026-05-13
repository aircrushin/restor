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
    <div className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[760px]" />

      <section className="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl grid-rows-[1fr_auto] px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10">
          <div className="max-w-3xl space-y-7">
            <Tag>{dict.tag}</Tag>
            <h1
              className={[
                "max-w-[8ch] font-black uppercase tracking-normal text-[var(--ink)]",
                lang === "zh"
                  ? "text-[clamp(4rem,8vw,6.8rem)] leading-[0.98]"
                  : "text-[clamp(4.25rem,10vw,7.8rem)] leading-[0.82]",
              ].join(" ")}
            >
              {dict.titleLead}
              <span className="gradient-text block">{dict.titleAccent}</span>
            </h1>
            <p className="max-w-2xl border-l-2 border-[var(--ink)] pl-5 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              {dict.intro} <span className="font-medium text-[var(--text-primary)]">{dict.introBrand}</span>
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={localizedPath(lang, "/process")}
                className="group inline-flex min-h-14 items-center justify-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-7 py-4 font-semibold text-[var(--paper)] transition-all hover:-translate-y-1 hover:bg-[var(--accent)] hover:shadow-[6px_6px_0_var(--ink)]"
              >
                {dict.ctaPrimary}
                <ArrowIcon />
              </Link>
              <Link
                href="#how"
                className="inline-flex min-h-14 items-center justify-center border border-[var(--ink)] bg-[var(--paper)] px-7 py-4 font-semibold text-[var(--ink)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)]"
              >
                {dict.ctaSecondary}
              </Link>
            </div>
          </div>

          <HeroVisual lang={lang} />
        </div>

        <dl className="mt-8 grid border-y border-[var(--ink)] bg-[var(--paper)] sm:grid-cols-3">
          {dict.stats.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </dl>
      </section>

      <Section id="how" eyebrow={dict.pipeline.eyebrow} title={dict.pipeline.title}>
        <div className="grid border-y border-[var(--line-strong)] md:grid-cols-4">
          {dict.pipeline.cards.map((card) => (
            <Card key={card.number} {...card} />
          ))}
        </div>
      </Section>

      <Section id="science" eyebrow={dict.science.eyebrow} title={dict.science.title}>
        <div className="grid gap-px overflow-hidden border border-[var(--ink)] bg-[var(--ink)] md:grid-cols-2">
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

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="relative overflow-hidden border border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--paper)] sm:p-10 md:p-14">
          <div aria-hidden className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 bg-[var(--accent)]" />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <h3 className="text-4xl font-black uppercase leading-[0.9] tracking-normal sm:text-5xl md:text-6xl">
                {dict.finalCta.title}
              </h3>
              <p className="max-w-xl text-[var(--bone)]">{dict.finalCta.body}</p>
            </div>
            <Link
              href={localizedPath(lang, "/process")}
              className="group inline-flex min-h-14 w-full items-center justify-center gap-3 border border-[var(--paper)] bg-[var(--paper)] px-8 py-4 font-semibold text-[var(--ink)] transition-all hover:-translate-y-1 hover:bg-[var(--lime)] hover:shadow-[6px_6px_0_var(--accent)] sm:w-auto"
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
    <span className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--lime)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink)] shadow-[4px_4px_0_var(--ink)]">
      <span className="h-2 w-2 bg-[var(--accent)]" />
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-[var(--ink)] p-4 sm:border-r sm:p-6 last:sm:border-r-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-2 text-4xl font-black tracking-normal text-[var(--ink)] sm:text-5xl">
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
    <article className="group relative min-h-72 border-b border-[var(--line-strong)] bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--lime)] md:border-b-0 md:border-r last:md:border-r-0 sm:p-6">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-[10px] tracking-[0.28em] text-[var(--text-muted)]">{number}</div>
            <span className="border border-[var(--ink)] bg-[var(--bg-base)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink)]">
              {tag}
            </span>
          </div>
          <h4 className="max-w-[10ch] text-2xl font-black uppercase leading-[0.95] tracking-normal text-[var(--ink)]">
            {title}
          </h4>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)] group-hover:text-[var(--ink)]">{body}</p>
      </div>
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
    <section id={id} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 grid gap-5 md:grid-cols-[220px_1fr] md:items-end">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
          {eyebrow}
        </div>
        <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-normal text-[var(--ink)] sm:text-5xl md:text-7xl">
          {title}
        </h2>
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
    <div className="grid gap-5 bg-[var(--paper)] p-5 sm:p-6 md:grid-cols-[150px_1fr_1fr] md:items-start md:gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
          {labels.fingerprint}
        </div>
        <div className="mt-2 text-xl font-black uppercase leading-none text-[var(--ink)]">{label}</div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]">
          {labels.detector}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{detector}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--pulse)]">
          {labels.counter}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{counter}</p>
      </div>
    </div>
  );
}

function HeroVisual({ lang }: { lang: Locale }) {
  const visual = dictionaries[lang].home.visual;
  const bars = Array.from({ length: 72 });

  return (
    <div className="relative min-h-[520px] overflow-hidden border border-[var(--ink)] bg-[var(--paper)] shadow-[10px_10px_0_var(--ink)] sm:min-h-[640px]">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_49%,rgba(35,31,25,0.08)_49%_51%,transparent_51%)] bg-[length:42px_42px]" />
      <div aria-hidden className="absolute -left-16 top-10 h-64 w-64 rounded-full border-[28px] border-[var(--accent)]" />
      <div aria-hidden className="absolute right-8 top-8 h-20 w-20 bg-[var(--lime)] shadow-[8px_8px_0_var(--ink)]" />
      <div aria-hidden className="absolute bottom-12 right-8 h-44 w-44 border border-[var(--ink)] bg-[var(--signal)]" />

      <div className="scan-line absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 overflow-hidden border-y border-[var(--ink)] bg-[var(--ink)]">
        <div className="flex h-full items-end justify-center gap-[3px] px-6">
          {bars.map((_, i) => (
            <span
              key={i}
              className="eq-bar"
              style={{
                height: `${18 + ((i * 11) % 78)}%`,
                animationDelay: `${(i % 16) * 0.055}s`,
                animationDuration: `${1.1 + (i % 7) * 0.14}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 grid gap-3 border border-[var(--ink)] bg-[var(--paper)] p-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink)] sm:grid-cols-3">
        <span>{visual.analysis}</span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-soft)]" />
          {visual.live}
        </span>
        <span className="sm:text-right">44.1k / 24bit</span>
      </div>

      <div className="absolute left-6 top-6 max-w-[15ch] text-5xl font-black uppercase leading-[0.82] tracking-normal text-[var(--ink)] sm:text-7xl">
        {visual.title}
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

import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 h-[640px]" />

      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-14">
          <div className="space-y-7">
            <Tag>Audio De-AI Processor</Tag>
            <h1 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl md:text-7xl">
              Make your AI audio
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="gradient-text">undetectable.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Modern detectors flag AI music and voice through spectral combs, perfect timing
              and coherent phase. <span className="text-[var(--text-primary)]">Restor</span> rewrites
              all four signatures in one pipeline — no manual mastering, no detector cat-and-mouse.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/process"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 font-medium text-[var(--bg-base)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)]"
              >
                Process audio
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="#how"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--bg-surface)]/40 px-6 py-3 text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                How it works
              </Link>
            </div>

            <dl className="grid grid-cols-3 gap-3 pt-4 sm:gap-6 sm:pt-8">
              <Stat label="modules" value="4" />
              <Stat label="avg job" value="< 12s" />
              <Stat label="upload cap" value="15 MB" />
            </dl>
          </div>

          <div className="relative">
            <HeroVisual />
          </div>
        </div>
      </section>

      <Section id="how" eyebrow="01 · Pipeline" title="Four passes. One signal-clean output.">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <Card
            number="01"
            title="Spectral Reshape"
            body="STFT → autocorrelation peak detection → IIR notches at suspected vocoder bins → tape/tube saturation. The MFCC contour drifts off the AI-trained classifier manifold."
            tag="anti-comb"
          />
          <Card
            number="02"
            title="Rhythm Humanizer"
            body="Onset detection slices the signal at every transient. Each slice is shifted by ±4–16 ms with a small velocity drift so the timing grid stops being mathematically perfect."
            tag="anti-grid"
          />
          <Card
            number="03"
            title="Phase Randomize"
            body="Mid/high band phase angles take a controlled random walk. A short synthetic room IR reintroduces the stochastic phase drift of a real microphone in real space."
            tag="anti-coherence"
          />
          <Card
            number="04"
            title="Watermark Wash"
            body="Diffusion-style re-noise: add Gaussian perturbation, blur, subtract — one micro forward-reverse cycle. Upper-band magnitude wobble disrupts the bins SynthID-class watermarks ride."
            tag="anti-watermark"
          />
        </div>
      </Section>

      <Section id="science" eyebrow="02 · Why it works" title="Detectors look for four fingerprints. We rewrite all of them.">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--line-soft)] md:grid-cols-2">
          <ScienceRow
            label="Spectral comb"
            detector="Detectors compute the autocorrelation of the average magnitude spectrum and flag periodic peaks left by transposed-convolution synthesis."
            counter="We notch the offending bins with narrow IIR filters and overlay analog-style nonlinearity. The comb disappears, the timbre stays."
          />
          <ScienceRow
            label="Quantized timing"
            detector="Generative models snap onsets to grid positions. Inter-onset intervals carry an unnaturally narrow distribution."
            counter="Per-onset jitter draws from a Gaussian centered on zero, widening the IOI distribution to match human-played reference statistics."
          />
          <ScienceRow
            label="Phase coherence"
            detector="Real recordings have high phase entropy — room reflections decorrelate the signal. AI output is too clean."
            counter="Mid/high band phase is randomized within frequency-dependent bounds, then convolved with a small synthetic room IR."
          />
          <ScienceRow
            label="Statistical watermark"
            detector="SynthID-class watermarks embed a low-energy pattern that survives MP3 transcoding but not aggressive diffusion noise."
            counter="A single forward/reverse diffusion micro-step plus upper-band magnitude wobble pushes watermark confidence below the detection threshold."
          />
        </div>
      </Section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="glass overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-10 md:p-14">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3">
              <h3 className="text-2xl font-medium sm:text-3xl">Drop a track. Get a clean version back.</h3>
              <p className="text-[var(--text-secondary)]">
                Everything runs locally on your worker. Files auto-purge after processing. No accounts in the MVP.
              </p>
            </div>
            <Link
              href="/process"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 font-medium text-[var(--bg-base)] transition-all hover:bg-[var(--accent-strong)] hover:shadow-[0_0_30px_var(--accent-soft)] sm:w-auto"
            >
              Launch processor
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
}: {
  label: string;
  detector: string;
  counter: string;
}) {
  return (
    <div className="grid gap-4 bg-[var(--bg-elevated)] p-5 sm:p-6 md:grid-cols-[140px_1fr_1fr] md:items-start md:gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-faint)]">
          fingerprint
        </div>
        <div className="mt-1 text-base font-medium text-[var(--text-primary)]">{label}</div>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--pulse)]">
          detector
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{detector}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
          counter
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{counter}</p>
      </div>
    </div>
  );
}

function HeroVisual() {
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
        SIGNAL · ANALYSIS
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
        live
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px] sm:tracking-[0.3em]">
        <span>fft 2048</span>
        <span>hop 512</span>
        <span>sr 44.1k</span>
      </div>
    </div>
  );
}

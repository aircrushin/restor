import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, locales, localizedPath, type Locale } from "@/lib/i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return dictionaries[lang].metadata;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = dictionaries[lang];

  return (
    <html
      lang={lang === "zh" ? "zh-CN" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden text-[var(--text-primary)]">
        <SiteHeader lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <SiteFooter dict={dict} />
      </body>
    </html>
  );
}

function SiteHeader({ lang, dict }: { lang: Locale; dict: typeof dictionaries[Locale] }) {
  const otherLang: Locale = lang === "en" ? "zh" : "en";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-[var(--bg-overlay)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href={localizedPath(lang)} className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--accent-soft)] border border-[var(--accent)]/30">
            <span className="block h-3 w-3 rounded-sm bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          </span>
          <span className="font-mono text-sm tracking-[0.3em] text-[var(--text-primary)]">
            RESTOR<span className="text-[var(--accent)]">_</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-5 md:gap-7">
          <Link href={`${localizedPath(lang)}#how`} className="hidden min-h-11 items-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex">
            {dict.nav.how}
          </Link>
          <Link href={`${localizedPath(lang)}#science`} className="hidden min-h-11 items-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex">
            {dict.nav.science}
          </Link>
          <Link href={localizedPath(otherLang)} className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-3 py-2 font-mono text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
            {dict.nav.language}
          </Link>
          <Link
            href={localizedPath(lang, "/process")}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-2 font-medium text-[var(--accent-strong)] transition-all hover:bg-[var(--accent)] hover:text-[var(--bg-base)]"
          >
            {dict.nav.launch}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter({ dict }: { dict: typeof dictionaries[Locale] }) {
  return (
    <footer className="border-t border-[var(--line-soft)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-faint)]">
          {dict.footer.tagline}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {dict.footer.note}
        </p>
      </div>
    </footer>
  );
}

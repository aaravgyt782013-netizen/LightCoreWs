import Link from "next/link";
import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageBackground />
      <Navbar />
      <main className="relative pb-24 pt-[126px] sm:pt-[138px]">
        <div className="container-x">
          <div className="animate-hero-in max-w-3xl">
            <nav className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-900/70 px-3.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-500 backdrop-blur-md">
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-zinc-200"
              >
                home
              </Link>
              <span className="text-brand-500/60">/</span>
              <span className="text-brand-300">{eyebrow}</span>
            </nav>
            <h1 className="mt-5 font-display text-[36px] font-bold leading-[1.04] tracking-tight text-white sm:text-[54px]">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-zinc-400">
                {intro}
              </p>
            )}
          </div>
          <div
            className="animate-hero-in mt-12"
            style={{ animationDelay: "90ms" }}
          >
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card max-w-3xl space-y-6 rounded-3xl p-6 text-[14.5px] leading-[1.75] text-zinc-300 sm:p-10 [&_code]:rounded [&_code]:border [&_code]:border-brand-500/25 [&_code]:bg-brand-950/45 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-brand-200 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:text-zinc-300 [&_strong]:font-semibold [&_strong]:text-white">
      {children}
    </div>
  );
}

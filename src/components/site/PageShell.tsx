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
      <main className="relative pb-24 pt-[128px] sm:pt-[142px]">
        <div className="container-x">
          <div className="animate-hero-in max-w-3xl">
            <nav className="inline-flex items-center gap-2 rounded-full border border-white/[0.075] bg-ink-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400 backdrop-blur-md">
              <Link
                href="/"
                className="transition-colors duration-300 hover:text-zinc-100"
              >
                Home
              </Link>
              <span className="text-brand-400/60">/</span>
              <span className="text-brand-200">{eyebrow}</span>
            </nav>
            <h1 className="mt-5 font-display text-[36px] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-[52px]">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.72] text-zinc-400">
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
    <div className="glass-card max-w-3xl space-y-6 rounded-[32px] p-7 text-[14.5px] leading-[1.78] text-zinc-300 sm:p-10 [&_code]:rounded-md [&_code]:border [&_code]:border-brand-400/22 [&_code]:bg-brand-400/[0.08] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-brand-200 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:text-zinc-300 [&_strong]:font-semibold [&_strong]:text-white">
      {children}
    </div>
  );
}

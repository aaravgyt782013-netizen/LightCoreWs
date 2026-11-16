import Link from "next/link";
import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";

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
      <main className="relative pb-24 pt-[132px]">
        <div className="container-x">
          <Reveal className="max-w-3xl">
            <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">
              <Link href="/" className="transition-colors hover:text-zinc-300">
                home
              </Link>
              <span>/</span>
              <span className="text-zinc-400">{eyebrow}</span>
            </nav>
            <h1 className="mt-5 font-display text-[36px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[54px]">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
                {intro}
              </p>
            )}
          </Reveal>
          <div className="mt-12">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6 text-[14px] leading-relaxed text-zinc-400 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-zinc-200">
      {children}
    </div>
  );
}

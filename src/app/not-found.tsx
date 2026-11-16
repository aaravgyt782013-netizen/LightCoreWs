import Link from "next/link";
import { PageBackground } from "@/components/site/Background";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <>
      <PageBackground />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo size={64} />
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.34em] text-brand-400/80">
          404 · route not guarded
        </p>
        <h1 className="mt-4 font-display text-[34px] font-semibold leading-none tracking-[0.06em] text-white sm:text-[54px]">
          LIGHT<span className="text-brand-500">CORE</span>
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          This page does not exist. The guard engine could not resolve the
          requested route.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex h-11 items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-5 text-[13.5px] font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
        >
          Return home
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </main>
    </>
  );
}
